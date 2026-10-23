"use client";

import type { ReactNode } from "react";
import { RiCalendarLine } from "react-icons/ri";

export type PdfPropertyHeroSummaryProps = {
  title: string;
  location?: string;
  description?: string;
  amenities: ReactNode;
  isRealEstate: boolean;
  offerDateRange?: string;
  /** e.g. "5 Guests - 4 Nights" */
  staySummaryLine?: string | null;
  totalPriceLabel: string | null;
  nightlyPriceLabel: string | null;
  showNightlyPrice: boolean;
};

/**
 * Bloque de resumen encima de la foto hero del PDF (dos columnas: ficha + precio/fechas).
 */
export default function PdfPropertyHeroSummary({
  title,
  location,
  description,
  amenities,
  isRealEstate,
  offerDateRange,
  staySummaryLine,
  totalPriceLabel,
  nightlyPriceLabel,
  showNightlyPrice,
}: PdfPropertyHeroSummaryProps) {
  const dateLine = offerDateRange?.trim() || "Dates upon request";

  return (
    <section className="pdf-print-avoid-break w-full bg-white py-6 md:py-8 print:py-6">
      <div className="mx-auto w-full px-4 md:px-6">
        <div className="grid w-full max-w-none grid-cols-1 gap-8 md:grid-cols-[1fr_minmax(13rem,18rem)] md:items-start md:gap-6 print:grid-cols-[1fr_minmax(13rem,18rem)] print:gap-6">
          <div className="min-w-0 text-left">
            <h1 className="font-gtsuper-ds text-2xl font-light leading-[1.08] text-[#172338] md:text-3xl lg:text-[2.25rem]">
              {title}
            </h1>
            {location ? (
              <p className="mt-2 font-haas text-xs font-light text-[#9BA8AD] md:text-[13px]">{location}</p>
            ) : null}
            <div
              className={`mt-4 flex flex-wrap gap-x-5 gap-y-2 ${isRealEstate ? "text-[#172338]" : "text-[#506A70]"}`}
            >
              {amenities}
            </div>
            {description ? (
              <p className="mt-5 max-w-none font-haas text-[13px] font-light leading-relaxed text-[#506A70] whitespace-pre-line md:text-sm">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-col items-start gap-4 md:items-end md:text-right print:items-end print:text-right">
            {!isRealEstate && staySummaryLine ? (
              <p className="font-haas text-[13px] font-light text-[#506A70] md:text-sm">{staySummaryLine}</p>
            ) : null}

            <div className="flex items-start gap-2 font-haas text-xs font-light text-[#9BA8AD] md:justify-end md:text-[13px] print:justify-end">
              <RiCalendarLine size={17} className="mt-0.5 shrink-0 text-[#9BA8AD]" aria-hidden />
              <span className="text-left lg:text-right">{dateLine}</span>
            </div>

            {totalPriceLabel ? (
              <div className="w-full md:text-right print:text-right">
                <p className="font-gtsuper-ds text-2xl font-light leading-none text-[#D99330] md:text-[1.75rem] lg:text-[2rem]">
                  {totalPriceLabel}
                </p>
                {showNightlyPrice && nightlyPriceLabel ? (
                  <p className="mt-2 font-haas text-xs font-light text-[#9BA8AD] md:ml-auto md:text-[13px] print:ml-auto">
                    {nightlyPriceLabel}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
