"use client";

import React, { useMemo } from "react";
import { RiCalendarLine } from "react-icons/ri";
import type { ConciergePdfService } from "@/lib/pdf/mapConciergeForPdf";
import { buildBrochureDownloadName } from "@/lib/brochureDownload";
import { htmlToPlainText } from "@/lib/pdf/htmlToPlainText";
import { resolveMediaUrl, wsrvUrl, positionStyle } from "@/lib/utils";
import { TwoParagraphText } from "@/components/ui/TwoParagraphText";

const GALLERY_FALLBACK = "/images/chuffer-service-image.png";

/** Panorama / ancho para wsrv (mejor nitidez en PDF ancho) */
const IMG_HERO = { w: 2800, h: 1050, q: 95 } as const;
const IMG_RAIL = { w: 1400, h: 1050, q: 95 } as const;
const IMG_HIGHLIGHT = { w: 2000, h: 900, q: 95 } as const;

/** Misma exclusión que `ConciergeDetailPage` para specs en web. */
const EXCLUDED_SPEC_KEYS = [
  "Service Name",
  "Commission",
  "VAT Percentage",
  "VAT Number",
  "APA",
  "Hull Identification Number (HIN)",
  "IMO Number",
  "Licensing for Charter Operations",
  "Licenses Numbers",
  "License Numbers",
  "Bedrooms",
  "Sleeps",
  "Baths",
  "Guests",
  "bedrooms",
  "sleeps",
  "baths",
  "guests",
  "idealPersons",
  "maxPersons",
  "Property Size",
  "Land Size",
  "propertySize",
  "landSize",
  "indoorArea",
  "outdoorArea",
  "totalArea",
  "plotArea",
];

function resolveImg(src: string | undefined | null): string {
  if (!src?.trim()) return GALLERY_FALLBACK;
  const s = src.trim();
  if (s.startsWith("http")) return s;
  return resolveMediaUrl(s) || GALLERY_FALLBACK;
}

interface ConciergeServicePDFLayoutProps {
  service: ConciergePdfService;
  hasHeader?: boolean;
  offerDateRange?: string | null;
  offerPrice?: string | null;
  offerNights?: string | null;
}

export default function ConciergeServicePDFLayout({
  service,
  hasHeader = true,
  offerDateRange,
  offerPrice,
  offerNights,
}: ConciergeServicePDFLayoutProps) {
  const galleryImages = useMemo(() => {
    const raw = Array.isArray(service.gallery) ? service.gallery : [];
    const unique = Array.from(new Set(raw.map((u) => resolveImg(u))));
    return unique.length > 0 ? unique : [resolveImg(service.heroImage)];
  }, [service.gallery, service.heroImage]);

  const heroResolved = resolveImg(service.heroImage || galleryImages[0]);
  const secondaryImages = useMemo(() => {
    const remainder = galleryImages.filter((image) => image !== heroResolved);
    if (remainder.length >= 2) return remainder.slice(0, 2);
    if (remainder.length === 1) return [remainder[0], heroResolved];
    return [heroResolved, heroResolved];
  }, [galleryImages, heroResolved]);

  const objectPosition =
    service.mainImagePosition === "top"
      ? "center top"
      : service.mainImagePosition === "bottom"
        ? "center bottom"
        : "center center";

  const locationLabel = useMemo(() => {
    if (service.location && service.area) {
      return `${service.location} · ${service.area}`;
    }
    return service.location || service.area || "";
  }, [service.location, service.area]);

  const nightsCount = useMemo(() => {
    const n = offerNights != null ? parseInt(String(offerNights), 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [offerNights]);

  const hasOfferContext = Boolean(
    (offerPrice && offerPrice.trim()) || (offerDateRange && offerDateRange.trim()) || nightsCount
  );

  const DESCRIPTION_COLUMN_CHARS = 360;
  const { col1, col2 } = useMemo(() => {
    const full = htmlToPlainText(service.description || "");
    const secondary = htmlToPlainText(service.secondaryDescription || "").trim();
    if (secondary && secondary !== full.trim()) {
      return { col1: full, col2: secondary };
    }
    if (full.length <= DESCRIPTION_COLUMN_CHARS) return { col1: full, col2: "" };
    const splitAt = full.lastIndexOf(" ", DESCRIPTION_COLUMN_CHARS);
    const index = splitAt <= 0 ? DESCRIPTION_COLUMN_CHARS : splitAt;
    return { col1: full.slice(0, index).trim(), col2: full.slice(index).trim() };
  }, [service.description, service.secondaryDescription]);

  const filteredSpecs = useMemo(() => {
    const specs = service.specifications;
    if (!specs || typeof specs !== "object" || Array.isArray(specs)) return [];
    return Object.entries(specs).filter(([key]) => !EXCLUDED_SPEC_KEYS.includes(key));
  }, [service.specifications]);

  const brochureSpec = filteredSpecs.find(
    ([, value]) => typeof value === "object" && value !== null && (value as { __isBrochure?: boolean }).__isBrochure
  );
  const brochureUrl =
    brochureSpec && typeof brochureSpec[1] === "object" && brochureSpec[1] !== null
      ? resolveMediaUrl((brochureSpec[1] as { url?: string }).url)
      : null;
  const brochureName =
    brochureSpec && typeof brochureSpec[1] === "object" && brochureSpec[1] !== null
      ? (brochureSpec[1] as { name?: string }).name
      : null;
  const brochureDownloadName = brochureUrl
    ? buildBrochureDownloadName(
        brochureUrl,
        (typeof brochureName === "string" && brochureName.trim()) || `${service.name || "Service"} Brochure`
      )
    : null;

  const keyFeatures = Array.isArray(service.keyFeatures) ? service.keyFeatures.filter(Boolean) : [];
  const hasKeyFeaturesBlock = keyFeatures.length > 0 || !!brochureSpec;

  const highlighted = Array.isArray(service.highlightedSections)
    ? service.highlightedSections.slice(0, 3)
    : [];

  const hasFeaturesFacilities = useMemo(() => {
    const f = service.features;
    if (!f) return false;
    if (Array.isArray(f)) return f.length > 0;
    return Object.keys(f).length > 0;
  }, [service.features]);

  return (
    <main
      className={`concierge-pdf-root relative flex-1 bg-white text-[#172338] antialiased ${hasHeader ? "pt-2 md:pt-3" : "pt-0"}`}
    >
      <div className={`concierge-pdf-capture-main mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-0 md:gap-5 print:max-w-full print:gap-4 ${hasHeader ? "py-4 md:py-5 print:py-3" : "pb-4 pt-0 md:pb-5 md:pt-0 print:pb-3 print:pt-0"}`}>
        {/* Hero panorámico bajo: más ancho visual, menos alto */}
        <section className="flex flex-col gap-3 md:gap-4 print:gap-3">
          <div className="pdf-gallery-area pdf-print-avoid-break -mx-px overflow-hidden rounded-none border border-[#E9EEF2] md:mx-0">
            <div className="concierge-pdf-hero relative overflow-hidden md:h-[min(240px,28vw)] print:h-[200px]">
              <div className="concierge-pdf-hero-grid grid h-[200px] grid-cols-1 gap-2 md:h-full md:grid-cols-[1.65fr_1fr] md:gap-3 print:h-full print:grid-cols-[1.65fr_1fr] print:gap-3">
                <div className="relative min-h-0 w-full overflow-hidden md:min-h-full">
                  <img
                    className="block h-full w-full object-cover md:w-[calc(100%+6px)]"
                    src={wsrvUrl(heroResolved, IMG_HERO)}
                    alt={service.name}
                    style={{ objectFit: "cover", objectPosition }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = GALLERY_FALLBACK;
                    }}
                  />
                </div>
                <div className="grid min-h-0 grid-rows-2 gap-2 md:gap-3 print:gap-3">
                  {secondaryImages.slice(0, 2).map((src, index) => (
                    <div
                      key={`${service.id}-rail-${index}`}
                      className={`min-h-0 w-full overflow-hidden ${index === 1 ? "md:-mt-1 print:-mt-1" : ""}`}
                    >
                      <img
                        className="block h-full w-full object-cover"
                        src={wsrvUrl(src, IMG_RAIL)}
                        alt={`${service.name} ${index + 1}`}
                        style={{ objectFit: "cover", objectPosition: "center" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = GALLERY_FALLBACK;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-b border-[#E9EEF2] pb-3 md:pb-4 print:pb-3">
            {service.type ? (
              <p className="m-0 font-haas text-[9px] font-medium uppercase tracking-[0.12em] text-[#506A70] md:text-[10px] print:text-[9px]">
                {service.type}
              </p>
            ) : null}
            <h1 className="m-0 max-w-[95%] font-gtsuper-ds text-[1.35rem] font-light leading-[1.15] text-[#172338] md:text-[1.85rem] print:text-[1.35rem]">
              {service.name}
            </h1>
            {locationLabel ? (
              <p className="m-0 font-haas text-[10px] font-light text-[#7A8B91] md:text-[11px] print:text-[10px]">
                {locationLabel}
              </p>
            ) : null}
          </div>

          {hasOfferContext ? (
            <div className="pdf-print-avoid-break flex flex-wrap items-stretch divide-x divide-[#E3E8EA] overflow-hidden rounded-none border border-[#E3E8EA] bg-white">
              {offerPrice?.trim() ? (
                <div className="flex min-w-0 flex-1 items-center justify-center px-3 py-2 md:px-4 print:px-2 print:py-1.5">
                  <p className="m-0 text-center font-haas text-[11px] font-medium text-[#172338] md:text-xs print:text-[11px]">
                    {offerPrice.trim()}
                  </p>
                </div>
              ) : null}
              {offerDateRange?.trim() || nightsCount != null ? (
                <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-2 md:px-4 print:px-2 print:py-1.5">
                  <RiCalendarLine size={13} className="shrink-0 text-[#506A70]" aria-hidden />
                  <span className="text-center font-haas text-[10px] font-light text-[#506A70] md:text-[11px] print:text-[10px]">
                    {[
                      offerDateRange?.trim(),
                      nightsCount != null
                        ? `${nightsCount} night${nightsCount === 1 ? "" : "s"}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Dates upon request"}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          {(col1 || col2) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 print:grid-cols-2 print:gap-5">
              {col1 ? (
                <p className="m-0 font-haas text-[11px] font-light leading-[1.55] text-[#172338] md:text-xs print:text-[11px]">
                  {col1}
                </p>
              ) : null}
              {col2 ? (
                <p className="m-0 font-haas text-[11px] font-light leading-[1.55] text-[#172338] md:text-xs print:text-[11px]">
                  {col2}
                </p>
              ) : null}
            </div>
          )}
        </section>

        {/* Highlights: rejilla editorial, ancho completo, sin absolutos */}
        {highlighted.length > 0 && (
          <section className="w-full" aria-label="Highlights">
            <div className="mb-3 flex items-center gap-2 md:mb-4 print:mb-3">
              <span className="h-px flex-1 bg-[#D99330]/50" aria-hidden />
              <h2 className="m-0 shrink-0 font-gtsuper-ds text-[11px] font-normal uppercase tracking-[0.14em] text-[#506A70] md:text-xs print:text-[11px]">
                Highlights
              </h2>
              <span className="h-px flex-1 bg-[#D99330]/50" aria-hidden />
            </div>
            <div className="flex flex-col gap-4 md:gap-5 print:gap-4">
              {highlighted.map((section, index) => (
                <div
                  key={index}
                  className="pdf-print-avoid-break grid grid-cols-1 gap-3 border-b border-[#EEF2F4] pb-4 last:border-0 last:pb-0 md:grid-cols-12 md:gap-4 md:pb-5 print:grid-cols-12 print:gap-3 print:pb-4"
                >
                  {section.image ? (
                    <div className="overflow-hidden bg-[#F4F6F8] md:col-span-5 print:col-span-5">
                      <img
                        src={wsrvUrl(resolveImg(section.image), { ...IMG_HIGHLIGHT, position: section.imagePosition })}
                        alt={section.title || `Highlight ${index + 1}`}
                        className="aspect-[16/9] w-full object-cover md:aspect-auto md:h-[min(160px,22vw)] md:max-h-[170px] print:h-[130px] print:max-h-[140px]"
                        style={positionStyle(section.imagePosition)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = GALLERY_FALLBACK;
                        }}
                      />
                    </div>
                  ) : null}
                  <div
                    className={`flex flex-col justify-center md:col-span-7 print:col-span-7 ${!section.image ? "md:col-span-12 print:col-span-12" : ""}`}
                  >
                    {section.title ? (
                      <h3
                        className={`m-0 mb-1 font-gtsuper-ds text-[10px] font-normal uppercase leading-snug tracking-wide md:text-[11px] print:text-[10px] ${
                          index === 2 ? "text-[#B87A28]" : "text-[#506A70]"
                        }`}
                      >
                        {section.title}
                      </h3>
                    ) : null}
                    {section.description ? (
                      <TwoParagraphText
                        text={section.description}
                        className="m-0 font-haas text-[10px] font-light leading-[1.5] text-[#172338] md:text-[11px] print:text-[10px]"
                        paragraphClassName="m-0 mb-1.5 last:mb-0"
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasKeyFeaturesBlock && (
          <section
            className="pdf-print-avoid-break w-full rounded-none border border-[#DEE3E7]/30 bg-[#FAFBFC] px-3 pb-3 pt-6 md:px-4 md:pb-4 md:pt-7 print:border print:border-[#D0D6DB]/25 print:px-3 print:pb-3 print:pt-6"
            aria-label="Key features"
          >
            <h2 className="mb-2 border-b border-[#E5E9EC] pb-2 font-gtsuper-ds text-[11px] font-normal uppercase tracking-[0.1em] text-[#506A70] md:text-xs print:text-[11px]">
              Key features
            </h2>
            <ul className="m-0 grid list-none grid-cols-1 gap-0 p-0 md:grid-cols-2 md:gap-x-8 print:grid-cols-2 print:gap-x-6">
              {keyFeatures.flatMap((feature, index) => {
                if (!feature || String(feature).trim() === "") return [];
                const raw = String(feature).trim();
                const plain = raw.startsWith("<") ? htmlToPlainText(raw) : raw;
                if (!plain.trim()) return [];
                return plain.split("\n").filter(Boolean).map((line, lineIndex) => (
                  <li
                    key={`keyfeature-${index}-${lineIndex}`}
                    className="pdf-print-avoid-break border-b border-[#ECEFF2] py-2 font-haas text-[11px] font-light leading-[1.45] text-[#172338] last:border-b-0 md:py-2.5 print:py-2 print:text-[11px] print:leading-snug"
                  >
                    <span className="mr-1.5 inline-block w-1 shrink-0 align-middle text-[#D99330]">●</span>
                    {line}
                  </li>
                ));
              })}
            </ul>
            {brochureUrl ? (
              <div className="mt-2 border-t border-[#E5E9EC] pt-2 print:mt-2 print:pt-2">
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={brochureDownloadName || undefined}
                  className="font-haas text-[11px] font-medium text-[#B87A28] underline print:text-[11px]"
                >
                  Download brochure
                </a>
              </div>
            ) : null}
          </section>
        )}

        {hasFeaturesFacilities && service.features ? (
          <section className="pdf-print-avoid-break w-full rounded-none border border-[#DEE3E7] bg-white px-3 py-3 md:px-4 md:py-4 print:border-[#D0D6DB] print:px-3 print:py-3">
            <h2 className="m-0 mb-2 border-b border-[#E5E9EC] pb-2 font-gtsuper-ds text-[11px] font-normal uppercase tracking-[0.1em] text-[#506A70] md:text-xs print:text-[11px]">
              Features &amp; facilities
            </h2>
            <ul className="m-0 list-none columns-1 p-0 md:columns-2 md:[column-gap:1.75rem] print:columns-2 print:[column-gap:1.5rem]">
              {Array.isArray(service.features) ? (
                service.features.map((feature, index) => (
                  <li
                    key={index}
                    className="break-inside-avoid py-1 font-haas text-[11px] font-light leading-[1.45] text-[#172338] print:py-1 print:text-[11px]"
                  >
                    <span className="mr-2 inline-block font-medium text-[#2d7a7d]">+</span>
                    {String(feature)}
                  </li>
                ))
              ) : (
                Object.entries(service.features as Record<string, unknown>).map(([feature, enabled]) => {
                  if (!enabled) return null;
                  const displayValue = enabled === true ? feature : `${feature} → ${String(enabled)}`;
                  return (
                    <li
                      key={feature}
                      className="break-inside-avoid py-1 font-haas text-[11px] font-light leading-[1.45] text-[#172338] print:py-1 print:text-[11px]"
                    >
                      <span className="mr-2 inline-block font-medium text-[#2d7a7d]">+</span>
                      {displayValue}
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
