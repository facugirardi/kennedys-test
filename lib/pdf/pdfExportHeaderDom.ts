/**
 * Static PDF header (logo + one full-width rule) injected only into the html2canvas clone.
 */
const PDF_HEADER_RULE = '#D99330';

export function prependPdfExportHeaderStrip(clonedRoot: HTMLElement, doc: Document): void {
  const wrap = doc.createElement('div');
  wrap.setAttribute('aria-hidden', 'true');
  wrap.className = 'pdf-export-header-strip';
  wrap.style.cssText = [
    'margin-bottom:0',
    'width:100%',
    'box-sizing:border-box',
    'overflow:hidden',
    'background:#ffffff',
    'pointer-events:none',
    'user-select:none',
  ].join(';');

  const row = doc.createElement('div');
  row.style.cssText = [
    'margin:0 auto',
    'max-width:1420px',
    'display:flex',
    'align-items:center',
    'padding:14px 40px 10px',
    'box-sizing:border-box',
  ].join(';');

  const img = doc.createElement('img');
  img.alt = 'Kennedys';
  img.src = '/images/capa-1-3.svg';
  img.setAttribute('loading', 'eager');
  img.decoding = 'sync';
  img.style.cssText = 'display:block;height:36px;width:auto;max-height:36px;';

  const rule = doc.createElement('div');
  rule.setAttribute('aria-hidden', 'true');
  rule.className = 'pdf-export-header-rule';
  rule.style.cssText = [
    'width:100%',
    'height:2px',
    `background:${PDF_HEADER_RULE}`,
    'flex-shrink:0',
    'box-sizing:border-box',
    'margin-top:12px',
    'margin-bottom:22px',
  ].join(';');

  row.appendChild(img);
  wrap.appendChild(row);
  wrap.appendChild(rule);

  clonedRoot.insertBefore(wrap, clonedRoot.firstChild);
}
