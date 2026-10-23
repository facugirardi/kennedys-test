'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import type { Property } from '@/interfaces/property';
import Navbar from '@/components/custom/Navbar';
import PropertyDetailPDFLayout from '@/components/custom/PropertyDetailPDFLayout';
import ConciergeServicePDFLayout from '@/components/custom/ConciergeServicePDFLayout';
import PdfAutoPrintTrigger from '@/components/pdf/PdfAutoPrintTrigger';
import PdfBrandedContactSection from '@/components/pdf/PdfBrandedContactSection';
import PdfPropertyTopBanner from '@/components/pdf/PdfPropertyTopBanner';
import PdfPrintPageSetup from '@/components/pdf/PdfPrintPageSetup';
import { mapPropertyForPdf, getAllPropertyImages } from '@/lib/pdf/mapPropertyForPdf';
import type { ConciergePdfService } from '@/lib/pdf/mapConciergeForPdf';

const PDF_LAST_PAGE_GAP_ID = 'pdf-print-last-page-gap';

/** Altura de hoja A4 para alinear el footer al pie (salto de página del motor de impresión). */
const PRINT_COLUMN_MM = 297;

function mmToCssPx(mm: number): number {
  return (mm * 96) / 25.4;
}

/**
 * Tras el bloque de contacto, rellena hasta el fin de la hoja imprimible (última página).
 */
function usePdfFooterLastPageGap(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const measureAndFill = () => {
      const gap = document.getElementById(PDF_LAST_PAGE_GAP_ID);
      const root = document.querySelector('.pdf-print-page-root');
      const contactBlock = document.querySelector('.pdf-print-footer-rail');
      if (!gap || !root || !contactBlock || !(root instanceof HTMLElement) || !(contactBlock instanceof HTMLElement)) {
        return;
      }
      gap.style.height = '0px';
      void gap.offsetHeight;

      const pagePx = mmToCssPx(PRINT_COLUMN_MM);
      const rootRect = root.getBoundingClientRect();
      const contactRect = contactBlock.getBoundingClientRect();
      const contactBottomInRoot = contactRect.bottom - rootRect.top + root.scrollTop;
      const rem = contactBottomInRoot % pagePx;
      let h = rem === 0 ? 0 : pagePx - rem;
      if (h < 1) h = 0;
      gap.style.height = `${h}px`;
    };

    const adjust = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          measureAndFill();
          window.setTimeout(measureAndFill, 100);
        });
      });
    };

    const clear = () => {
      const gap = document.getElementById(PDF_LAST_PAGE_GAP_ID);
      if (gap) gap.style.height = '0px';
    };

    window.addEventListener('beforeprint', adjust);
    window.addEventListener('afterprint', clear);
    return () => {
      window.removeEventListener('beforeprint', adjust);
      window.removeEventListener('afterprint', clear);
    };
  }, [enabled]);
}

export type PdfExportSessionProps = {
  pdfKind: 'property' | 'concierge';
  initialProperty: Property | null;
  initialService: ConciergePdfService | null;
  serverBranded: boolean;
  serverNeedsBrandedChoice: boolean;
  offerDateRange?: string | null;
  offerPrice?: string | null;
  offerNights?: string | null;
  offerGuests?: string | null;
};

export default function PdfExportSession({
  pdfKind,
  initialProperty,
  initialService,
  serverBranded,
  serverNeedsBrandedChoice,
  offerDateRange,
  offerPrice,
  offerNights,
  offerGuests,
}: PdfExportSessionProps) {
  const router = useRouter();
  const [branded, setBranded] = useState(serverBranded);
  const [choiceOpen, setChoiceOpen] = useState(serverNeedsBrandedChoice);

  useEffect(() => {
    const raw = router.query.branded;
    const p = Array.isArray(raw) ? raw[0] : raw;
    if (p === undefined) return;
    setBranded(p !== '0' && p !== 'false');
    setChoiceOpen(false);
  }, [router.query.branded]);

  const applyBranded = useCallback(
    (next: boolean) => {
      setBranded(next);
      setChoiceOpen(false);
      const q = { ...router.query, branded: next ? '1' : '0' };
      void router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true, scroll: false });
    },
    [router]
  );

  const villaData = useMemo(() => {
    if (pdfKind !== 'property' || !initialProperty) return null;
    return mapPropertyForPdf(
      initialProperty,
      branded,
      offerPrice ? { price: offerPrice, nights: offerNights ?? undefined } : undefined
    );
  }, [pdfKind, initialProperty, branded, offerPrice, offerNights]);

  const allPropertyImages = useMemo(() => {
    if (!initialProperty) return [];
    return getAllPropertyImages(initialProperty);
  }, [initialProperty]);

  const hasFooterPdf =
    branded &&
    Boolean(
      (pdfKind === 'concierge' && initialService) || (pdfKind === 'property' && initialProperty)
    );
  usePdfFooterLastPageGap(hasFooterPdf);

  if (pdfKind === 'concierge' && initialService) {
    return (
      <div className="pdf-print-page-root flex min-h-screen flex-col overflow-x-hidden bg-white">
        <PdfPrintPageSetup />
        <PdfAutoPrintTrigger choiceOpen={choiceOpen} branded={branded} onApplyBranded={applyBranded} />
        {branded && (
          <div className="pdf-print-branded-rail pdf-print-header-footer-bleed w-full print:break-inside-avoid">
            <Navbar textBlack={true} pdfExport={true} pdfFlowLayout={true} />
          </div>
        )}
        <div className="pdf-print-body-grow flex w-full min-h-0 flex-1 flex-col">
          <div className="flex w-full flex-1 justify-center">
            <div className="pdf-export-canvas flex w-full shrink-0 flex-col">
              <ConciergeServicePDFLayout
                service={initialService}
                hasHeader={branded}
                offerDateRange={offerDateRange ?? undefined}
                offerPrice={offerPrice ?? undefined}
                offerNights={offerNights ?? undefined}
              />
              {branded && (
                <>
                  <div className="pdf-print-footer-rail mt-6 w-full shrink-0 sm:mt-8 print:mt-5 print:break-inside-avoid">
                    <PdfBrandedContactSection />
                  </div>
                  <div
                    id={PDF_LAST_PAGE_GAP_ID}
                    className="pdf-print-last-page-gap h-0 shrink-0 overflow-hidden print:min-h-0"
                    aria-hidden
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!initialProperty || !villaData) {
    return null;
  }

  const isRealEstate = initialProperty.rental === false || initialProperty.category === 'real-estate';

  return (
    <div className="pdf-print-page-root flex min-h-screen flex-col overflow-x-hidden bg-white">
      <PdfPrintPageSetup />
      <PdfAutoPrintTrigger choiceOpen={choiceOpen} branded={branded} onApplyBranded={applyBranded} />
      {branded && (
        <div className="pdf-print-branded-rail pdf-print-header-footer-bleed w-full print:break-inside-avoid">
          <Navbar textBlack={true} pdfExport={true} pdfFlowLayout={true} />
        </div>
      )}
      <div className="pdf-print-body-grow flex w-full min-h-0 flex-1 flex-col">
        <div className="flex w-full flex-1 justify-center">
          <div className="pdf-export-canvas flex w-full shrink-0 flex-col">
            <PdfPropertyTopBanner text={villaData.pdfTopBannerText ?? ''} />
            <PropertyDetailPDFLayout
              villaData={villaData}
              propertyData={initialProperty}
              allPropertyImages={allPropertyImages}
              isRealEstate={isRealEstate}
              hasHeader={branded}
              offerDateRange={offerDateRange ?? undefined}
              offerNights={offerNights ?? undefined}
              offerGuests={offerGuests ?? undefined}
            />
            {branded && (
              <>
                <div className="pdf-print-footer-rail mt-6 w-full shrink-0 px-4 sm:mt-8 md:px-6 print:mt-5 print:break-inside-avoid print:px-4">
                  <PdfBrandedContactSection />
                </div>
                <div
                  id={PDF_LAST_PAGE_GAP_ID}
                  className="pdf-print-last-page-gap h-0 shrink-0 overflow-hidden print:min-h-0"
                  aria-hidden
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
