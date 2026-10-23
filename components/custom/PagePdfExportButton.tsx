"use client";

import { Download } from "lucide-react";
import { useCallback, useRef, useState, type RefObject } from "react";

import { exportDomElementToPdf } from "@/lib/pdf/exportDomToPdf";

type PagePdfExportButtonProps = {
  rootRef: RefObject<HTMLElement | null>;
  fileNameBase: string;
  className?: string;
  label?: string;
  /** Draws the Athens/Mykonos office band on the last page. Defaults to true. */
  includeFooter?: boolean;
};

function sanitizeFileBase(raw: string) {
  const s = raw
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return s.slice(0, 72) || "kennedys";
}

export function PagePdfExportButton({ rootRef, fileNameBase, className = "", label = "PDF", includeFooter }: PagePdfExportButtonProps) {
  const [busy, setBusy] = useState(false);
  const busyLock = useRef(false);

  const onClick = useCallback(async () => {
    const el = rootRef.current;
    if (!el || busyLock.current) return;
    busyLock.current = true;
    setBusy(true);
    try {
      await exportDomElementToPdf(el, { fileName: `${sanitizeFileBase(fileNameBase)}.pdf`, includeFooter });
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.error("PDF export failed", e);
      }
    } finally {
      busyLock.current = false;
      setBusy(false);
    }
  }, [rootRef, fileNameBase, includeFooter]);

  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={() => {
        void onClick();
      }}
    >
      {busy ? (
        <span aria-live="polite">…</span>
      ) : (
        <>
          <Download className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
