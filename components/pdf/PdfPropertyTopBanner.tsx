"use client";

/**
 * Barra superior del PDF de propiedades: línea dorada + franja (hero/tagline desde API).
 */
export default function PdfPropertyTopBanner({ text }: { text: string }) {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;

  return (
    <div className="pdf-print-branded-rail pdf-print-header-footer-bleed w-full print:break-inside-avoid">
      <div className="w-full">
        <div className="h-0.5 w-full bg-[#D99330]" aria-hidden />
        <div className="bg-[#172338] px-4 py-2 md:px-6 md:py-2.5">
          <p className="text-center font-gtsuper-ds text-xs font-light leading-snug text-white md:text-[13px]">{t}</p>
        </div>
      </div>
    </div>
  );
}
