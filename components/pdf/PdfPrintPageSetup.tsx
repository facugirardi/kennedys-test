'use client';

import { useEffect } from 'react';

const STYLE_ID = 'kennedys-pdf-print-at-page';

/**
 * En rutas /pdf/*: al imprimir o “Guardar como PDF”, Chromium suele omitir URL y número de página
 * si @page tiene margin 0 y el margen visible lo aporta el contenedor (no hay API para destildar
 * “Encabezados y pies” en el diálogo). Firefox: atributos moznomarginboxes en &lt;html&gt;.
 */
export default function PdfPrintPageSetup() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('moznomarginboxes', '');
    html.setAttribute('mozdisallowselectionprint', '');

    let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `
@media print {
  /* Margen superior en hojas siguientes a la primera (aire al cortar página). */
  @page {
    margin: 0 !important;
    size: A4 portrait;
  }
  html, body {
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
  .pdf-print-page-root,
  .pdf-print-page-root * {
    border-radius: 0 !important;
  }
  /* Tarjeta de ubicación sobre el mapa en PDF de propiedades */
  .pdf-print-page-root .pdf-map-location-card {
    border-radius: 6px !important;
  }
  /* Sin padding inferior: el footer debe llegar al borde inferior del área imprimible (A4, @page margin 0). */
  /* overflow: visible fuerza que el motor de impresión de Chrome no recorte páginas siguientes
     (overflow-x: hidden implica overflow-y: auto en CSS, lo que puede clipear el contact footer). */
  .pdf-print-page-root {
    padding: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    min-height: 297mm !important;
    overflow: visible !important;
  }
  /* El margen visual viene del padding en el body, no de @page ni del root.
     El header/footer bleed vive fuera de este div, por eso no necesita compensacion. */
  .pdf-print-body-grow {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    padding: 8mm 10mm 0 !important;
    box-sizing: border-box !important;
  }
  .pdf-print-header-footer-bleed {
    max-width: none !important;
    box-sizing: border-box !important;
  }
  /* Header / footer branded: sin blur, logos visibles, no partir bloques */
  .pdf-branded-header-bar {
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-after: avoid !important;
    page-break-after: avoid !important;
  }
  .pdf-branded-contact-section {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .pdf-print-branded-rail {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  .pdf-print-footer-rail {
    box-sizing: border-box !important;
  }
  .pdf-print-last-page-gap {
    flex-shrink: 0 !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
  /* Contenido al ancho del área imprimible (A4 menos padding del root ~196mm) */
  .pdf-export-canvas {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  .concierge-pdf-capture-main {
    max-width: 100% !important;
    box-sizing: border-box !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .pdf-export-canvas img {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .pdf-branded-header-bar img,
  .pdf-branded-contact-section img {
    max-width: 100% !important;
    height: auto !important;
    image-rendering: auto !important;
  }
  /* Bloques que no deben partirse entre páginas */
  .pdf-print-avoid-break {
    break-inside: avoid;
    page-break-inside: avoid;
    -webkit-column-break-inside: avoid;
  }
  .pdf-export-canvas h1,
  .pdf-export-canvas h2,
  .pdf-export-canvas h3 {
    break-after: avoid;
    page-break-after: avoid;
  }
}
`;

    return () => {
      document.getElementById(STYLE_ID)?.remove();
      html.removeAttribute('moznomarginboxes');
      html.removeAttribute('mozdisallowselectionprint');
    };
  }, []);

  return null;
}
