/* eslint-disable @next/next/no-img-element */

import { RiGlobalLine, RiMailLine, RiMapPinLine, RiPhoneLine } from "react-icons/ri";

/**
 * Cierre de PDF branded: bloque editorial alineado al contenido (no barra full-bleed).
 */
export default function PdfBrandedContactSection() {
  return (
    <section
      className="pdf-branded-contact-section pdf-print-avoid-break w-full border border-[#DEE3E7] bg-white px-3 py-5 font-haas text-[#172338] md:px-5 md:py-6 print:border-[#D0D6DB] print:px-4 print:py-5"
      aria-label="Contact"
    >
      <div className="mb-5 flex items-center gap-3 md:mb-6 print:mb-4 print:gap-2">
        <span className="h-px min-w-[1.5rem] flex-1 bg-[#D99330]/55" aria-hidden />
        <h2 className="m-0 shrink-0 font-gtsuper-ds text-[11px] font-normal uppercase tracking-[0.14em] text-[#506A70] md:text-xs print:text-[11px]">
          Contact
        </h2>
        <span className="h-px min-w-[1.5rem] flex-1 bg-[#D99330]/55" aria-hidden />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8 print:grid-cols-12 print:gap-6">
        <div className="flex flex-col justify-center border-[#E5E9EC] md:col-span-4 md:border-r md:pr-6 print:col-span-4 print:border-r print:pr-5">
          <div className="border-l-[3px] border-[#D99330] pl-4">
            <img
              className="h-9 w-auto max-w-[min(100%,260px)] object-contain object-left md:h-10 print:h-8 print:max-w-[220px]"
              loading="eager"
              decoding="sync"
              alt="Kennedy's Group"
              src="/images/capa-1-3.svg"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-0 md:col-span-8 print:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4 print:grid-cols-2 print:gap-x-6">
            <div className="flex gap-3 border-b border-[#F0F3F5] pb-4 sm:border-0 sm:pb-0 print:gap-2.5 print:pb-0">
              <RiPhoneLine className="mt-0.5 h-4 w-4 shrink-0 text-[#B87A28] print:h-3.5 print:w-3.5" aria-hidden />
              <div className="min-w-0">
                <p className="m-0 text-[9px] font-medium uppercase tracking-[0.12em] text-[#506A70] print:text-[9px]">
                  Phone
                </p>
                <a
                  className="mt-1 block text-[12px] font-light text-[#172338] no-underline hover:underline print:mt-0.5 print:text-[11px]"
                  href="tel:+306946455757"
                >
                  +30 694 645 5757
                </a>
              </div>
            </div>
            <div className="flex gap-3 border-b border-[#F0F3F5] pb-4 sm:border-0 sm:pb-0 print:gap-2.5 print:pb-0">
              <RiMailLine className="mt-0.5 h-4 w-4 shrink-0 text-[#B87A28] print:h-3.5 print:w-3.5" aria-hidden />
              <div className="min-w-0">
                <p className="m-0 text-[9px] font-medium uppercase tracking-[0.12em] text-[#506A70] print:text-[9px]">
                  Email
                </p>
                <a
                  className="mt-1 block break-all text-[12px] font-light text-[#172338] no-underline hover:underline print:mt-0.5 print:text-[10px] sm:break-normal"
                  href="mailto:reservations@kennedysgroup.com"
                >
                  reservations@kennedysgroup.com
                </a>
              </div>
            </div>
            <div className="flex gap-3 sm:col-span-2 print:col-span-2 print:gap-2.5">
              <RiGlobalLine className="mt-0.5 h-4 w-4 shrink-0 text-[#B87A28] print:h-3.5 print:w-3.5" aria-hidden />
              <div className="min-w-0">
                <p className="m-0 text-[9px] font-medium uppercase tracking-[0.12em] text-[#506A70] print:text-[9px]">
                  Website
                </p>
                <span className="mt-1 block text-[12px] font-light text-[#172338] print:mt-0.5 print:text-[11px]">
                  kennedysgroup.com
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3 border-t border-[#E5E9EC] pt-5 md:mt-6 md:pt-5 print:mt-4 print:gap-2.5 print:pt-4">
            <RiMapPinLine className="mt-0.5 h-4 w-4 shrink-0 text-[#B87A28] print:h-3.5 print:w-3.5" aria-hidden />
            <div className="min-w-0">
              <p className="m-0 text-[9px] font-medium uppercase tracking-[0.12em] text-[#506A70] print:text-[9px]">
                Office
              </p>
              <address className="mt-1 not-italic text-[11px] font-light leading-relaxed text-[#506A70] print:mt-0.5 print:text-[10px]">
                Dimarchou Angelou Metaxa 31, 166 75 Glyfada, Greece
              </address>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
