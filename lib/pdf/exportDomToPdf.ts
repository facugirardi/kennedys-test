/**
 * Client-only: DOM → multi-page A4 PDF.
 * - Offices footer on the **last** page only; slice heights use the **full** content band (no shorter
 *   “tail” budget) so page breaks stay consistent — only the placed image height leaves room above the footer.
 * - Page breaks: greedy vertical slices with snaps on `.pdf-hero-image-area` /
 *   `[data-pdf-export-block="true"]`. Blocks taller than one band start on the next slice (no mid-map cut);
 *   short “tail” pages are allowed when advancing to a block top.
 * - Prep flag on `document.documentElement` + `global.css` (`html[data-pdf-capture-prep]`) for hero/nav.
 * - Chrome hidden with `pdf-exclude-from-capture` (CSS) and `[data-pdf-exclude-canvas]` (onclone only).
 * - html2canvas uses a fixed **1420** logical width; `windowHeight` is at least 1080px but grows with
 *   content. Raster uses **scale 1** so canvas px match layout width in px.
 * - Each PDF page slice height (canvas px) is capped by what fits on **A4** at the chosen margins when
 *   the slice is scaled to `imgWmm` width — not by an arbitrary 1080px band.
 */

import { prependPdfExportHeaderStrip } from '@/lib/pdf/pdfExportHeaderDom';

const PDF_EXCLUDE_CANVAS_ATTR = '[data-pdf-exclude-canvas="true"]';

/** Layout + raster width/height baseline (CSS px); canvas uses scale 1 → same pixel width. */
const PDF_CAPTURE_VIEWPORT_W = 1420;
const PDF_CAPTURE_VIEWPORT_MIN_H = 780;
const PDF_CAPTURE_MAX_WINDOW_H = 120_000;
/** html2canvas scale: keep 1 so raster dimensions match 1420×… layout px exactly. */
const PDF_CAPTURE_SCALE = 1;

type PdfSplitBlock = { top: number; bottom: number };
/** Layout Y relative to capture root (0 … scrollHeight), before clone-only PDF header. */
type PdfDomBlock = { top: number; bottom: number };

function isInsidePdfChromeNode(node: HTMLElement): boolean {
  return Boolean(
    node.closest('.pdf-capture-nav') ||
      node.closest('.pdf-exclude-from-capture') ||
      node.closest(PDF_EXCLUDE_CANVAS_ATTR)
  );
}

function pushDomBlockForNode(
  node: HTMLElement,
  root: HTMLElement,
  rootRect: DOMRect,
  blocks: PdfDomBlock[]
): void {
  if (isInsidePdfChromeNode(node)) return;
  const r = node.getBoundingClientRect();
  const topDom = r.top - rootRect.top + root.scrollTop;
  const bottomDom = r.bottom - rootRect.top + root.scrollTop;
  const blockH = bottomDom - topDom;
  if (blockH < 24) return;
  if (bottomDom <= topDom) return;
  blocks.push({ top: topDom, bottom: bottomDom });
}

/**
 * Collect block bounds in **root-relative DOM px** (same space as `element.scrollHeight`).
 * Mapped to canvas space after capture using `headerCanvasPx + y * (contentCanvasH / scrollH)`.
 * Intentionally narrow: every `section > div` produced dozens of cuts and tiny PDF pages.
 */
function collectPdfDomSplitBlocks(root: HTMLElement): PdfDomBlock[] {
  const rootRect = root.getBoundingClientRect();
  const blocks: PdfDomBlock[] = [];

  const selector = ':scope .pdf-hero-image-area, :scope [data-pdf-export-block="true"]';
  root.querySelectorAll(selector).forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    pushDomBlockForNode(node, root, rootRect, blocks);
  });

  blocks.sort((a, b) => a.top - b.top || a.bottom - b.bottom);
  const deduped: PdfDomBlock[] = [];
  for (const b of blocks) {
    const prev = deduped[deduped.length - 1];
    if (prev && Math.abs(prev.top - b.top) < 2 && Math.abs(prev.bottom - b.bottom) < 2) continue;
    deduped.push(b);
  }
  return deduped;
}

function domBlocksToCanvasBlocks(
  dom: PdfDomBlock[],
  headerCanvasPx: number,
  contentCanvasH: number,
  scrollH: number
): PdfSplitBlock[] {
  const ratio = contentCanvasH / Math.max(1, scrollH);
  return dom.map((b) => ({
    top: headerCanvasPx + b.top * ratio,
    bottom: headerCanvasPx + b.bottom * ratio,
  }));
}

/**
 * Avoid ending a slice in the middle of a "keep together" block when possible.
 * Never shrink the slice to a tiny band before a block (that wastes most of the PDF page); prefer
 * including the whole block on this page if it fits, else fill up to maxSlicePx.
 */
function adjustSliceEndForSplitBlocks(
  yStart: number,
  yEnd: number,
  blocks: PdfSplitBlock[],
  canvasH: number,
  maxSlicePx: number,
  minSlicePx: number
): number {
  let y = Math.min(Math.max(yEnd, yStart + 1), canvasH);
  for (let pass = 0; pass < blocks.length + 3; pass++) {
    let changed = false;
    for (const b of blocks) {
      // Proposed slice [yStart, y) would cut through this block from above.
      if (yStart < b.top && y > b.top && y < b.bottom) {
        const throughBlock = b.bottom - yStart;
        if (throughBlock <= maxSlicePx) {
          y = b.bottom;
        } else if (b.top > yStart) {
          // Block taller than one page band: never split it mid-block; start it on the next slice.
          y = b.top;
        } else {
          y = Math.min(yStart + maxSlicePx, canvasH);
        }
        changed = true;
        continue;
      }
      // Slice starts inside block; keep the rest of the block on this page if it fits.
      if (yStart >= b.top && yStart < b.bottom && y > yStart && y <= b.bottom) {
        const rest = b.bottom - yStart;
        if (rest <= maxSlicePx && y < b.bottom) {
          y = b.bottom;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }

  if (y <= yStart) {
    y = Math.min(yStart + 1, canvasH);
  }
  return y;
}

/**
 * Cumulative canvas Y positions: [0, y1, y2, …, H]. Guarantees no microscopic last band and
 * enforces a minimum advance per page when not at EOF.
 */
function buildPageSliceEnds(
  H: number,
  maxSlicePx: number,
  splitBlocks: PdfSplitBlock[],
  minSlicePx: number
): number[] {
  const ends: number[] = [0];
  let y = 0;
  while (y < H - 1) {
    const remaining = H - y;
    const cap = Math.min(maxSlicePx, remaining);
    let rawEnd = Math.min(y + cap, H);
    rawEnd = adjustSliceEndForSplitBlocks(y, rawEnd, splitBlocks, H, cap, minSlicePx);
    rawEnd = Math.min(rawEnd, H);

    const minAdvance = Math.max(minSlicePx, Math.floor(cap * 0.86));
    const snappedToBlockTop = splitBlocks.some((b) => b.top > y && Math.abs(rawEnd - b.top) <= 2);
    if (!snappedToBlockTop && rawEnd < H && rawEnd - y < minAdvance) {
      rawEnd = Math.min(y + cap, H);
      rawEnd = adjustSliceEndForSplitBlocks(y, rawEnd, splitBlocks, H, cap, minSlicePx);
      rawEnd = Math.min(rawEnd, H);
    }
    if (rawEnd <= y) {
      rawEnd = Math.min(y + Math.min(minSlicePx, H - y), H);
    }

    if (rawEnd < H && H - rawEnd < minSlicePx) {
      rawEnd = H;
    }

    ends.push(rawEnd);
    y = rawEnd;
  }

  const tailMinPx = Math.max(minSlicePx * 2, Math.floor(maxSlicePx * 0.1));
  while (ends.length >= 3) {
    const pPrev = ends[ends.length - 3];
    const pCut = ends[ends.length - 2];
    const pEnd = ends[ends.length - 1];
    if (pEnd >= H - 1 && pEnd - pCut < tailMinPx && pCut - pPrev >= minSlicePx) {
      ends.splice(ends.length - 2, 1);
      continue;
    }
    break;
  }

  if (ends[ends.length - 1] < H - 1) {
    ends.push(H);
  } else if (ends[ends.length - 1] > H) {
    ends[ends.length - 1] = H;
  }
  return ends;
}

const PDF_OFFICES: readonly { title: string; lines: readonly string[] }[] = [
  {
    title: 'Athens Office',
    lines: ['Dimarchou Aggelou Metaxa 31, 166 75, Glyfada, Athens, Greece', '+30 210 008 7226'],
  },
  {
    title: 'Mykonos Office',
    lines: ['Argirena, 846 00, Mykonos, Greece', '+30 2289 028 233'],
  },
] as const;

export type ExportDomToPdfOptions = {
  fileName: string;
  /** Draws the Athens/Mykonos office band on the last page. Defaults to true (existing behavior). */
  includeFooter?: boolean;
};

function triggerBlobDownload(blob: Blob, fileName: string) {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  a.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export async function exportDomElementToPdf(
  element: HTMLElement,
  options: ExportDomToPdfOptions
): Promise<void> {
  const includeFooter = options.includeFooter !== false;
  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const scale = PDF_CAPTURE_SCALE;

  const scrollX = typeof window !== 'undefined' ? window.scrollX : 0;
  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

  document.documentElement.setAttribute('data-pdf-capture-prep', 'true');

  const prevCaptureBox = {
    width: element.style.width,
    maxWidth: element.style.maxWidth,
    minWidth: element.style.minWidth,
  };
  element.style.width = `${PDF_CAPTURE_VIEWPORT_W}px`;
  element.style.maxWidth = `${PDF_CAPTURE_VIEWPORT_W}px`;
  element.style.minWidth = `${PDF_CAPTURE_VIEWPORT_W}px`;

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  const windowHeight = Math.min(
    PDF_CAPTURE_MAX_WINDOW_H,
    Math.max(PDF_CAPTURE_VIEWPORT_MIN_H, element.scrollHeight)
  );

  let canvas: HTMLCanvasElement;
  let splitBlocks: PdfSplitBlock[] = [];
  let cloneHeaderCanvasPx = 0;
  try {
    canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 0,
      scrollX: -scrollX,
      scrollY: -scrollY,
      windowWidth: PDF_CAPTURE_VIEWPORT_W,
      windowHeight,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedRoot) => {
        prependPdfExportHeaderStrip(clonedRoot, clonedDoc);
        const headerEl = clonedRoot.firstElementChild as HTMLElement | null;
        const hCss = headerEl?.offsetHeight ?? 0;
        cloneHeaderCanvasPx = Math.max(Math.round(hCss * scale), Math.round(64 * scale));
        clonedRoot.querySelectorAll(PDF_EXCLUDE_CANVAS_ATTR).forEach((n) => {
          if (n instanceof HTMLElement) {
            n.style.visibility = 'hidden';
          }
        });
      },
    });
    const scrollH = Math.max(1, element.scrollHeight);
    const contentCanvasH = Math.max(1, canvas.height - cloneHeaderCanvasPx);
    const domBlocks = collectPdfDomSplitBlocks(element);
    splitBlocks = domBlocksToCanvasBlocks(domBlocks, cloneHeaderCanvasPx, contentCanvasH, scrollH);
  } finally {
    element.style.width = prevCaptureBox.width;
    element.style.maxWidth = prevCaptureBox.maxWidth;
    element.style.minWidth = prevCaptureBox.minWidth;
    document.documentElement.removeAttribute('data-pdf-capture-prep');
    if (typeof window !== 'undefined') {
      window.scrollTo(scrollX, scrollY);
    }
  }

  const H = canvas.height;

  const pdf = new JsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentTop = margin;
  /** Full vertical band for content (used for slice planning on every page). */
  const usableNormalMm = pageH - 2 * margin;
  const footerGapMm = 5;
  const footerBandMm = 30;
  /** Last page: image area above footer + gap (footer itself is drawn separately). Full band when the footer is omitted. */
  const usableLastMm = includeFooter ? pageH - 2 * margin - footerGapMm - footerBandMm : usableNormalMm;
  const imgWmm = pageW - 2 * margin;

  const pxPerMm = canvas.width / imgWmm;

  /**
   * Canvas px budget per PDF page band: ceil avoids under-counting rows; extra px/mm fudge
   * compensates JPEG/html2canvas rounding so the last scanlines are not clipped at page breaks.
   */
  const slicePxBuffer = Math.max(8, Math.round(12 * scale));
  const contentMmToPx = (mm: number) => Math.ceil(mm * pxPerMm + 0.35 * pxPerMm) + slicePxBuffer;

  /** Max canvas rows per page: same aspect budget as `addImage` (full width → height ≤ usableNormalMm). */
  const maxSlicePx = contentMmToPx(usableNormalMm);

  /** Avoid hairline / 1px slices between pages (canvas px, includes html2canvas scale). */
  const minSlicePx = Math.max(100, Math.round(52 * scale));

  const sliceEnds = buildPageSliceEnds(H, maxSlicePx, splitBlocks, minSlicePx);

  const FOOTER_BG: [number, number, number] = [23, 35, 56];
  const FOOTER_TEXT: [number, number, number] = [226, 243, 246];
  const FOOTER_MUTED: [number, number, number] = [180, 210, 214];

  const drawFooter = () => {
    const bandTop = pageH - margin - footerBandMm;
    pdf.setFillColor(...FOOTER_BG);
    pdf.rect(0, bandTop, pageW, Math.max(0.01, pageH - bandTop), 'F');

    const innerPad = margin + 3;
    const textMaxW = pageW - 2 * innerPad;
    let y = bandTop + 3;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(...FOOTER_TEXT);

    for (let oi = 0; oi < PDF_OFFICES.length; oi++) {
      const office = PDF_OFFICES[oi];
      if (oi > 0) {
        y += 0.8;
        pdf.setDrawColor(60, 75, 95);
        pdf.setLineWidth(0.1);
        pdf.line(innerPad, y - 0.3, pageW - innerPad, y - 0.3);
        y += 1.8;
      }

      pdf.text(office.title, innerPad, y);
      y += 3;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...FOOTER_MUTED);
      for (const line of office.lines) {
        const wrapped = pdf.splitTextToSize(line, textMaxW);
        for (const wline of wrapped) {
          pdf.text(wline, innerPad, y);
          y += 2.7;
        }
      }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...FOOTER_TEXT);
    }

    pdf.setTextColor(0, 0, 0);
  };

  for (let i = 0; i < sliceEnds.length - 1; i++) {
    if (i > 0) pdf.addPage();

    const yPx = sliceEnds[i];
    const rawEnd = sliceEnds[i + 1];
    const finishesDocument = rawEnd >= H - 1;
    const sliceH = rawEnd - yPx;

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(canvas, 0, yPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);

    /** Max JPEG quality (1) — no extra down-quality step; PNG would be lossless but very large. */
    const sliceData = sliceCanvas.toDataURL('image/jpeg', 1);
    /** Natural aspect; cap leaves a hair of mm so jsPDF does not clip the bottom edge. */
    const capHmm = (finishesDocument ? usableLastMm : usableNormalMm) - 0.35;
    const naturalHmm = (sliceH * imgWmm) / canvas.width;
    let drawHmm = naturalHmm;
    let drawWmm = imgWmm;
    if (drawHmm > capHmm) {
      const s = capHmm / drawHmm;
      drawHmm = capHmm;
      drawWmm = imgWmm * s;
    }
    const drawXMm = margin + (imgWmm - drawWmm) / 2;

    pdf.addImage(sliceData, 'JPEG', drawXMm, contentTop, drawWmm, drawHmm, undefined, 'NONE');

    if (finishesDocument && includeFooter) {
      drawFooter();
    }
  }

  const blob = pdf.output('blob');
  triggerBlobDownload(blob, options.fileName);
}
