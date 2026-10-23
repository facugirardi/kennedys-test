"use client";

import { useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import PropertyLocationMap from "./PropertyLocationMap";
import { sanitizeCmsHtml } from "@/lib/sanitizeCmsHtml";
import type { Property } from "@/interfaces/property";
import { cn } from "@/lib/utils";
import { usePdfCapturePrep } from "@/hooks/usePdfCapturePrep";

type MapTab = "location" | "distances";

const TAB_ACTIVE = "#D99330";
const TAB_ACTIVE_BORDER = "#D99330";
const TAB_INACTIVE_TEXT = "#8A96A3";
const TAB_INACTIVE_BORDER = "#C5CCD4";

function htmlMeaningfulLength(html: string): boolean {
  const t = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim();
  return t.length > 0;
}

function buildLocationLines(
  property: Property | null,
  locationSummary: string
): { primaryLines: string[] } {
  const region = typeof property?.region === "string" ? property.region.trim() : "";
  const area = typeof property?.area === "string" ? property.area.trim() : "";
  const country = typeof property?.country === "string" ? property.country.trim() : "";
  const visibleLoc = typeof property?.visibleLocation === "string" ? property.visibleLocation.trim() : "";
  const addressLoc = typeof property?.location === "string" ? property.location.trim() : "";

  const primaryLines: string[] = [];

  const street = addressLoc || visibleLoc;
  if (street) primaryLines.push(street);

  const seen = new Set<string>(
    street.split(/,\s*|\s+[-–—]\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean)
  );

  const citySegments: string[] = [];
  for (const part of [area, region]) {
    if (!part) continue;
    for (const seg of part.split(",").map((s) => s.trim()).filter(Boolean)) {
      const key = seg.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        citySegments.push(seg);
      }
    }
  }
  if (citySegments.length > 0) primaryLines.push(citySegments.join(", "));

  if (country && !seen.has(country.toLowerCase())) primaryLines.push(country);

  if (primaryLines.length === 0 && locationSummary.trim()) {
    const s = locationSummary.trim();
    const byComma = s.split(",").map((p) => p.trim()).filter(Boolean);
    if (byComma.length >= 2) {
      return { primaryLines: byComma };
    }
    primaryLines.push(s);
  }

  return { primaryLines };
}

export function PropertyMapFloatingCard({
  property,
  locationSummary,
  pdfPrep,
  className,
}: {
  property: Property | null;
  locationSummary: string;
  pdfPrep: boolean;
  /** e.g. compact layout for PDF map strip */
  className?: string;
}) {
  const [tab, setTab] = useState<MapTab>("location");
  /** Mobile: cerrado por defecto; pastilla para abrir el panel con Location / Distances. */
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const distancesHtml = (property?.description?.areaAndDistancesInfo || "").trim();
  const hasDistancesHtml = distancesHtml.length > 0 && htmlMeaningfulLength(distancesHtml);

  const detailRows: { label: string; value: string }[] = [];
  const region = typeof property?.region === "string" ? property.region.trim() : "";
  const area = typeof property?.area === "string" ? property.area.trim() : "";
  const country = typeof property?.country === "string" ? property.country.trim() : "";
  const visibleLoc = typeof property?.visibleLocation === "string" ? property.visibleLocation.trim() : "";
  const addressLoc = typeof property?.location === "string" ? property.location.trim() : "";
  if (region) detailRows.push({ label: "Region", value: region });
  if (area) detailRows.push({ label: "Area", value: area });
  if (country) detailRows.push({ label: "Country", value: country });
  if (visibleLoc) detailRows.push({ label: "Location", value: visibleLoc });
  if (addressLoc && addressLoc !== visibleLoc) {
    detailRows.push({ label: "Address", value: addressLoc });
  }

  const { primaryLines } = buildLocationLines(property, locationSummary);

  const hasStructuredFallback = detailRows.length > 0;
  const hasLocationContent =
    primaryLines.length > 0 || hasStructuredFallback || locationSummary.trim().length > 0;

  const hasDistancesContent = hasDistancesHtml;

  const effectiveTab: MapTab =
    pdfPrep || !hasDistancesContent ? "location" : tab;

  const reopenLabel = hasDistancesContent ? "Location & distances" : "Location";

  const locationContent = hasLocationContent ? (
    <div className="space-y-4">
      {primaryLines.length > 0 ? (
        <div className="space-y-1 font-haas text-[15px] font-light leading-[1.65] text-[#2F3640] md:text-base">
          {primaryLines.map((line, i) => (
            <p key={`${i}-${line.slice(0, 48)}`} className="m-0 font-haas font-light">
              {line}
            </p>
          ))}
        </div>
      ) : null}

      {primaryLines.length === 0 && detailRows.length > 0 ? (
        <dl className="space-y-3">
          {detailRows.map((row) => (
            <div key={row.label}>
              <dt className="mb-0.5 font-haas text-[12px] font-bold uppercase tracking-wider text-[#8A96A3] md:text-[13px]">
                {row.label}
              </dt>
              <dd className="m-0 font-haas text-[15px] font-light leading-snug text-[#2F3640] md:text-base">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

    </div>
  ) : null;

  const distancesContent = hasDistancesHtml ? (
    <div className="space-y-4">
      <div
        className="max-w-none font-haas text-[15px] font-light leading-[1.65] text-[#2F3640] prose prose-sm prose-p:my-2.5 prose-p:font-haas prose-p:font-light prose-p:text-[#2F3640] prose-p:first:mt-0 prose-p:last:mb-0 prose-headings:font-haas prose-headings:font-bold prose-headings:text-[#2F3640] prose-headings:tracking-wide prose-li:font-haas prose-li:font-light prose-li:marker:text-[#D99330] md:prose-p:text-base first:prose-p:mt-0"
        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(distancesHtml) }}
      />
    </div>
  ) : null;

  return (
    <>
      {!pdfPrep ? (
        <button
          type="button"
          className={cn(
            "-translate-x-1/2 absolute left-1/2 z-[2] flex h-11 max-w-[calc(100%-2rem)] items-center gap-2 rounded-md border border-[#e5e7eb] bg-white/95 px-4 font-haas text-sm text-[#172338] shadow-[0_4px_20px_rgba(23,35,56,0.14)] backdrop-blur-sm transition-opacity md:hidden",
            mobileSheetOpen ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
          aria-expanded={mobileSheetOpen}
          aria-controls="property-map-details-sheet"
          onClick={() => setMobileSheetOpen(true)}
        >
          <MapPin className="shrink-0 text-[#D99330]" size={17} strokeWidth={1.75} aria-hidden />
          <span className="truncate font-medium">{reopenLabel}</span>
          <ChevronDown className="shrink-0 -rotate-180 text-[#8A96A3]" size={18} strokeWidth={2} aria-hidden />
        </button>
      ) : null}

      {/*
        Mobile: panel renders in normal flow BELOW the map (stacked), so it never covers it.
        Desktop: unchanged floating overlay, absolutely positioned over the map's top-left corner.
      */}
      <div
        id="property-map-details-sheet"
        className={cn(
          "property-map-floating-card font-haas pointer-events-auto z-[1] overflow-y-auto bg-white p-4 shadow-[0_8px_30px_rgba(23,35,56,0.12)]",
          pdfPrep
            ? // PDF preview: always a corner overlay (consumer supplies its own !important position/size overrides).
              "absolute left-5 top-5 max-h-[min(72vh,400px)] w-[min(calc(100%-2.5rem),340px)] md:p-5"
            : cn(
                // Mobile: stacked below the map in normal flow, only rendered when opened.
                "max-md:relative max-md:mt-3 max-md:max-h-[60vh] max-md:w-full max-md:rounded-md max-md:border max-md:border-[#e8ebef]",
                mobileSheetOpen ? "max-md:block" : "max-md:hidden",
                // Desktop: unchanged floating overlay over the map's top-left corner.
                "md:absolute md:left-5 md:right-auto md:top-5 md:bottom-auto md:max-h-[min(72vh,400px)] md:w-[min(calc(100%-2.5rem),340px)] md:rounded-none md:border-0 md:bg-white md:p-5 md:shadow-[0_12px_40px_rgba(23,35,56,0.14)]"
              ),
          className
        )}
        role="region"
        aria-label={hasDistancesContent ? "Location and distances" : "Location"}
      >
      {!pdfPrep ? (
        <button
          type="button"
          className="absolute right-1.5 top-2 rounded-md p-2 text-[#506A70] hover:bg-[#f1f5f9] md:hidden"
          aria-label="Hide location panel"
          onClick={() => setMobileSheetOpen(false)}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      ) : null}

      <div className="max-md:mt-1 max-md:pr-9 md:mt-0 md:pr-0" role="presentation">
      {!pdfPrep ? (
        hasDistancesContent ? (
          <div className="flex flex-wrap gap-x-6 gap-y-1" role="tablist" aria-label="Location information">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "location"}
              id="map-tab-location"
              className="border-b-[3px] pb-1.5 font-haas text-[14px] font-bold tracking-wide transition-colors md:text-[15px]"
              style={{
                color: tab === "location" ? TAB_ACTIVE : TAB_INACTIVE_TEXT,
                borderBottomColor: tab === "location" ? TAB_ACTIVE_BORDER : TAB_INACTIVE_BORDER,
              }}
              onClick={() => setTab("location")}
            >
              Location
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "distances"}
              id="map-tab-distances"
              className="border-b-[3px] pb-1.5 font-haas text-[14px] font-bold tracking-wide transition-colors md:text-[15px]"
              style={{
                color: tab === "distances" ? TAB_ACTIVE : TAB_INACTIVE_TEXT,
                borderBottomColor: tab === "distances" ? TAB_ACTIVE_BORDER : TAB_INACTIVE_BORDER,
              }}
              onClick={() => setTab("distances")}
            >
              Distances
            </button>
          </div>
        ) : (
          <p
            id="map-tab-location-only"
            className="m-0 border-b-[3px] border-b-[#D99330] pb-1.5 font-haas text-[14px] font-bold tracking-wide text-[#D99330] md:text-[15px]"
          >
            Location
          </p>
        )
      ) : (
        <p
          id="map-tab-location-pdf"
          className="m-0 font-haas text-[14px] font-bold tracking-wide text-[#D99330] md:text-[15px]"
        >
          Location
        </p>
      )}

      <div
        className="mt-4 md:mt-5"
        role="tabpanel"
        aria-labelledby={
          pdfPrep
            ? "map-tab-location-pdf"
            : !hasDistancesContent
              ? "map-tab-location-only"
              : effectiveTab === "location"
                ? "map-tab-location"
                : "map-tab-distances"
        }
      >
        {effectiveTab === "location" ? locationContent : distancesContent}
      </div>
      </div>
    </div>
    </>
  );
}

export type PropertyMapWithSidePanelProps = {
  property: Property | null;
  locationSummary: string;
  title?: string;
  googleMapUrl?: string | null;
  /** Rental map sits on gray; real-estate uses white bordered shell */
  surface?: "light" | "white";
  /** Hide the floating Location/Distances card (e.g. when shown in a smaller column) */
  hidePanel?: boolean;
};

export default function PropertyMapWithSidePanel({
  property,
  locationSummary,
  title,
  googleMapUrl,
  surface = "light",
  hidePanel = false,
}: PropertyMapWithSidePanelProps) {
  const pdfPrep = usePdfCapturePrep();
  const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const outer =
    surface === "white"
      ? "relative overflow-hidden border border-[#e6e8ed] bg-white"
      : "relative overflow-hidden bg-[#e6e8ed]";

  return (
    <div className={cn(outer, "property-map-with-side-panel")}>
      <div className="relative h-[280px] min-h-[280px] w-full md:h-[480px] md:min-h-[480px]">
        {pdfPrep ? (
          <div className="flex h-full w-full items-center justify-center bg-[#e8ebef] px-6 text-center font-haas text-sm leading-relaxed text-[#506A70]">
            Map view is not included in PDF. Use the location details in the panel.
          </div>
        ) : hasApiKey ? (
          <PropertyLocationMap
            googleMapUrl={googleMapUrl}
            location={locationSummary}
            title={title}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center font-haas text-sm text-[#506A70]">
            Google Maps API key missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
          </div>
        )}
      </div>
      {/* Mounted outside the fixed-height map box: on mobile the panel stacks below it (normal flow, never covers the map); on desktop it overlays the map as before. */}
      {!hidePanel && <PropertyMapFloatingCard pdfPrep={pdfPrep} property={property} locationSummary={locationSummary} />}
    </div>
  );
}
