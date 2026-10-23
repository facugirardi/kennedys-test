"use client";

import React from "react";
import { TbBed, TbBath, TbUser, TbPool, TbRuler, TbInfoCircle, TbStar, TbSun, TbLayoutGrid, TbCheck } from "react-icons/tb";
import { MdHotTub } from "react-icons/md";
import PropertyLocationMap from "@/components/custom/PropertyLocationMap";
import { sanitizeCmsHtml } from "@/lib/sanitizeCmsHtml";
import { PropertyMapFloatingCard } from "@/components/custom/PropertyMapWithSidePanel";
import PdfPropertyHeroSummary from "@/components/pdf/PdfPropertyHeroSummary";
import type { Property } from "@/interfaces/property";
import { htmlToPlainText } from "@/lib/pdf/htmlToPlainText";
import { heroImageDirectUrl } from "@/lib/utils";

const PLACEHOLDER_IMAGE = "/images/villa-detail@2x.png";

function parseNeedToKnow(text: string): Array<{ heading: string | null; items: string[] }> {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections: Array<{ heading: string | null; items: string[] }> = [];
  let current: { heading: string | null; items: string[] } = { heading: null, items: [] };

  for (const line of lines) {
    const isItem = /^[√✓•\-]/.test(line);
    const isHeading = !isItem && line.endsWith(":");

    if (isHeading) {
      if (current.heading !== null || current.items.length > 0) sections.push(current);
      current = { heading: line.replace(/:$/, "").trim(), items: [] };
    } else if (isItem) {
      current.items.push(line.replace(/^[√✓•\-]\s*/, "").trim());
    } else {
      current.items.push(line);
    }
  }
  if (current.heading !== null || current.items.length > 0) sections.push(current);
  return sections;
}

export type VillaDataView = {
  id?: string;
  title: string;
  location: string;
  /** Línea superior del PDF (tagline/hero), distinta del título de listado. */
  pdfTopBannerText?: string;
  description?: string;
  aboutDescription?: string;
  bedrooms?: number | null;
  baths?: number | null;
  guests?: number | null;
  pools?: number | null;
  jacuzzis?: number | null;
  price?: string;
  pricePerNight?: string;
  images?: { hero?: string };
  general?: {
    bedrooms?: number | null;
    sleeps?: number | null;
    baths?: number | null;
    propertySize?: string | null;
    landSize?: string | null;
  };
  accommodations?: string[];
  facilities?: string[];
  services?: string[];
  enjoy?: string[];
  includedServices?: string[];
  extraServices?: string;
  servicesFromClassification?: string[];
  villaGroups?: Array<{ title?: string; items?: string[] }>;
  extraInfo?: string;
  staffAndServices?: string;
};

interface PropertyDetailPDFLayoutProps {
  villaData: VillaDataView;
  propertyData: Property | null;
  allPropertyImages: string[];
  isRealEstate: boolean;
  hasHeader?: boolean;
  offerDateRange?: string;
  offerNights?: string;
  offerGuests?: string | null;
}

export default function PropertyDetailPDFLayout({
  villaData,
  propertyData,
  allPropertyImages,
  isRealEstate,
  hasHeader = true,
  offerDateRange,
  offerNights,
  offerGuests,
}: PropertyDetailPDFLayoutProps) {
  const heroImage = villaData.images?.hero || allPropertyImages[0] || PLACEHOLDER_IMAGE;
  const heroUrl = heroImageDirectUrl(heroImage) || PLACEHOLDER_IMAGE;
  const aboutTitle = villaData.title || "Property";

  const guestCountStr =
    offerGuests != null && String(offerGuests).trim() !== ""
      ? String(offerGuests).trim()
      : villaData.guests != null
        ? String(villaData.guests)
        : null;
  const stayParts: string[] = [];
  if (!isRealEstate && guestCountStr) {
    stayParts.push(`${guestCountStr} Guest${guestCountStr === "1" ? "" : "s"}`);
  }
  if (!isRealEstate && offerNights != null && String(offerNights).trim() !== "") {
    const n = String(offerNights).trim();
    stayParts.push(`${n} Night${n === "1" ? "" : "s"}`);
  }
  const staySummaryLine = stayParts.length > 0 ? stayParts.join(" - ") : null;

  const totalPriceLabel = isRealEstate
    ? villaData.price === "Price upon request"
      ? villaData.price || null
      : villaData.pricePerNight || villaData.price || null
    : villaData.price || null;
  const nightlyPriceLabel =
    !isRealEstate &&
    villaData.price !== "Price upon request" &&
    villaData.pricePerNight &&
    villaData.pricePerNight !== "Price upon request"
      ? villaData.pricePerNight
      : null;
  const showNightlyPrice = Boolean(
    nightlyPriceLabel && nightlyPriceLabel.trim() !== "" && nightlyPriceLabel !== villaData.price
  );

  const rawDistancesHtml = (propertyData?.description?.areaAndDistancesInfo || "").trim();
  const distancesHasText = rawDistancesHtml
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim().length > 0;
  const distancesHtml = distancesHasText ? rawDistancesHtml : "";

  const generalItems: string[] = [];
  if (villaData.bedrooms != null) generalItems.push(`Bedrooms: ${villaData.bedrooms}`);
  if (villaData.general?.sleeps != null) generalItems.push(`Sleeps: ${villaData.general.sleeps}`);
  if (villaData.baths != null) generalItems.push(`Baths: ${villaData.baths}`);
  if (villaData.general?.propertySize) generalItems.push(`Property Size: ${villaData.general.propertySize}`);
  if (villaData.general?.landSize) generalItems.push(`Land Size: ${villaData.general.landSize}`);

  const columnIconMap: Record<string, React.ReactElement> = {
    GENERAL: <TbInfoCircle size={14} className="shrink-0 text-[#D99330]" />,
    ACCOMMODATIONS: <TbBed size={14} className="shrink-0 text-[#D99330]" />,
    FACILITIES: <TbPool size={14} className="shrink-0 text-[#D99330]" />,
    SERVICES: <TbStar size={14} className="shrink-0 text-[#D99330]" />,
    ENJOY: <TbSun size={14} className="shrink-0 text-[#D99330]" />,
  };

  const columns = [
    { title: "GENERAL", items: generalItems },
    { title: "ACCOMMODATIONS", items: villaData.accommodations || [] },
    { title: "FACILITIES", items: villaData.facilities || [] },
    { title: "SERVICES", items: villaData.servicesFromClassification?.length ? villaData.servicesFromClassification : villaData.services || [] },
    { title: "ENJOY", items: villaData.enjoy || [] },
  ].filter((col) => col.items.length > 0);

  const villaGroups = (villaData.villaGroups || []).filter(
    (g) => g?.items && Array.isArray(g.items) && g.items.length > 0
  );

  const theVillaGalleryImages = allPropertyImages
    .slice(0, 4)
    .map((src) => heroImageDirectUrl(src) || src)
    .filter((u): u is string => Boolean(u && String(u).trim() !== ""));

  const theVillaCaptions = [
    villaData.bedrooms != null ? `${villaData.bedrooms} BEDROOMS` : "BEDROOMS",
    "FULLY EQUIPPED KITCHEN",
    "SPACIOUS LIVING AND DINING AREA",
    villaData.pools != null && villaData.pools > 0 ? "SWIMMING POOL" : "OUTDOOR SPACE",
  ];

  const extraServicesLines = villaData.extraServices
    ? villaData.extraServices.trim().split("\n").filter(Boolean)
    : [];

  const staffPlain = villaData.staffAndServices ? htmlToPlainText(villaData.staffAndServices) : "";
  const extraInfoPlain = villaData.extraInfo ? htmlToPlainText(villaData.extraInfo) : "";

  const rentalAmenities = (
    <div className="flex flex-wrap justify-start gap-x-5 gap-y-2 md:gap-x-6">
      {villaData.bedrooms != null && (
        <div className="flex items-center gap-1.5 font-haas text-xs font-light text-[#506A70] md:text-[13px]">
          <TbBed size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.bedrooms} Bedrooms</span>
        </div>
      )}
      {villaData.baths != null && (
        <div className="flex items-center gap-1.5 font-haas text-xs font-light text-[#506A70] md:text-[13px]">
          <TbBath size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.baths} Baths</span>
        </div>
      )}
      {villaData.guests != null && (
        <div className="flex items-center gap-1.5 font-haas text-xs font-light text-[#506A70] md:text-[13px]">
          <TbUser size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.guests} Guests</span>
        </div>
      )}
      {villaData.pools != null && villaData.pools > 0 && (
        <div className="flex items-center gap-1.5 font-haas text-xs font-light text-[#506A70] md:text-[13px]">
          <TbPool size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.pools} Pool{villaData.pools > 1 ? "s" : ""}</span>
        </div>
      )}
      {villaData.jacuzzis != null && villaData.jacuzzis > 0 && (
        <div className="flex items-center gap-1.5 font-haas text-xs font-light text-[#506A70] md:text-[13px]">
          <MdHotTub size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.jacuzzis} Jacuzzi{villaData.jacuzzis > 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );

  const realEstateAmenities = (
    <div className="flex flex-wrap justify-start gap-x-5 gap-y-2 text-xs text-[#172338] md:gap-x-6 md:text-[13px]">
      {villaData.bedrooms != null && (
        <div className="flex items-center gap-1.5 font-haas font-light">
          <TbBed size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.bedrooms} Bedrooms</span>
        </div>
      )}
      {villaData.baths != null && (
        <div className="flex items-center gap-1.5 font-haas font-light">
          <TbBath size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.baths} Baths</span>
        </div>
      )}
      {villaData.general?.propertySize && villaData.general.propertySize !== "0 sqm" && (
        <div className="flex items-center gap-1.5 font-haas font-light">
          <TbRuler size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.general.propertySize} Living Area</span>
        </div>
      )}
      {villaData.general?.landSize && villaData.general.landSize !== "0 sqm" && (
        <div className="flex items-center gap-1.5 font-haas font-light">
          <TbRuler size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.general.landSize} Total surface</span>
        </div>
      )}
      {villaData.pools != null && villaData.pools > 0 && (
        <div className="flex items-center gap-1.5 font-haas font-light">
          <TbPool size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.pools} Pool{villaData.pools > 1 ? "s" : ""}</span>
        </div>
      )}
      {villaData.jacuzzis != null && villaData.jacuzzis > 0 && (
        <div className="flex items-center gap-1.5 font-haas font-light">
          <MdHotTub size={17} className="shrink-0 text-[#D99330]" />
          <span>{villaData.jacuzzis} Jacuzzi{villaData.jacuzzis > 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );

  return (
    <main
      className={`relative flex-1 bg-white text-[13px] leading-snug text-[#172338] print:text-[12px] ${hasHeader ? "pt-4 md:pt-5" : "pt-4"}`}
    >
      {!isRealEstate ? (
        <div className="pdf-print-avoid-break">
          <PdfPropertyHeroSummary
            title={villaData.title}
            location={villaData.location}
            description={villaData.description}
            amenities={rentalAmenities}
            isRealEstate={false}
            offerDateRange={offerDateRange}
            staySummaryLine={staySummaryLine}
            totalPriceLabel={totalPriceLabel}
            nightlyPriceLabel={nightlyPriceLabel}
            showNightlyPrice={showNightlyPrice}
          />
        </div>
      ) : (
        <div className="pdf-print-avoid-break">
          <PdfPropertyHeroSummary
            title={villaData.title}
            location={villaData.location}
            description={villaData.description}
            amenities={realEstateAmenities}
            isRealEstate
            offerDateRange={offerDateRange}
            staySummaryLine={null}
            totalPriceLabel={totalPriceLabel}
            nightlyPriceLabel={null}
            showNightlyPrice={false}
          />
        </div>
      )}

      <section className="pdf-print-avoid-break w-full bg-white py-6 md:py-8">
        <div className="mx-auto w-full px-4 md:px-6">
          <div className="relative aspect-[1.75/1] w-full min-h-[240px] max-h-[480px] overflow-hidden bg-white md:max-h-[560px] print:min-h-[280px] print:max-h-[520px]">
            <img
              src={heroUrl}
              alt={`${villaData.title} - Main image`}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </div>
          {allPropertyImages.length > 1 && (
            <div className="pdf-print-avoid-break mt-3 grid grid-cols-4 gap-1.5">
              {allPropertyImages.slice(0, 8).map((src, index) => (
                <div key={index} className="h-[4.5rem] overflow-hidden bg-white md:h-[5rem]">
                  <img
                    src={heroImageDirectUrl(src) || src}
                    alt={`${villaData.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {(villaData.aboutDescription || villaData.description || propertyData?.country || propertyData?.region) && (
        <section className="bg-white px-4 py-8 md:px-6 md:py-12">
          <div className="mx-auto w-full max-w-none">
            <h2 className="mb-5 font-gtsuper-ds text-xl font-light leading-tight text-[#172338] md:mb-6 md:text-2xl lg:text-[1.65rem]">
              About {aboutTitle}
            </h2>
            {(villaData.aboutDescription || villaData.description) && (
              <div className="font-haas text-[13px] font-light leading-[1.7] text-[#506A70] whitespace-pre-line md:text-sm">
                {villaData.aboutDescription || villaData.description}
              </div>
            )}
            {propertyData && (propertyData.country || propertyData.region || propertyData.location || propertyData.area) && (
              <div className="pdf-print-avoid-break mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#F0F3F5] pt-5 md:mt-8 md:gap-x-10 md:pt-6">
                {propertyData.country && (
                  <div>
                    <p className="mb-1 font-haas text-[9px] font-medium uppercase tracking-[0.12em] text-[#9BA8AD]">Country</p>
                    <p className="font-haas text-[13px] font-light text-[#172338]">{propertyData.country}</p>
                  </div>
                )}
                {propertyData.region && (
                  <div>
                    <p className="mb-1 font-haas text-[9px] font-medium uppercase tracking-[0.12em] text-[#9BA8AD]">Region</p>
                    <p className="font-haas text-[13px] font-light text-[#172338]">{propertyData.region}</p>
                  </div>
                )}
                {propertyData.location && (
                  <div>
                    <p className="mb-1 font-haas text-[9px] font-medium uppercase tracking-[0.12em] text-[#9BA8AD]">Location</p>
                    <p className="font-haas text-[13px] font-light text-[#172338]">{propertyData.location}</p>
                  </div>
                )}
                {propertyData.area && (
                  <div>
                    <p className="mb-1 font-haas text-[9px] font-medium uppercase tracking-[0.12em] text-[#9BA8AD]">Area</p>
                    <p className="font-haas text-[13px] font-light text-[#172338]">{propertyData.area}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="bg-white px-4 py-7 md:px-6 md:py-9">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-px w-8 bg-[#D99330]" aria-hidden />
          <h2 className="shrink-0 font-gtsuper-ds text-[10px] font-normal uppercase tracking-[0.16em] text-[#7A6A58]">
            Property details
          </h2>
          <span className="h-px flex-1 bg-[#D4C9B8]" aria-hidden />
        </div>
        <div className="mx-auto grid w-full max-w-none grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {columns.map((col, index) => (
            <div key={index} className="pdf-print-avoid-break bg-white p-4 md:p-5">
              <div className="mb-3 flex items-center gap-2 border-b border-[#F0EBE0] pb-2.5">
                {columnIconMap[col.title] ?? <TbLayoutGrid size={14} className="shrink-0 text-[#D99330]" />}
                <h3 className="font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.12em] text-[#172338]">
                  {col.title}
                </h3>
              </div>
              <ul className="m-0 list-none space-y-1.5 p-0 font-haas text-[11px] leading-snug text-[#506A70] md:text-xs">
                {col.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-[#D99330]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {isRealEstate && (() => {
        const vd = villaData as VillaDataView & {
          type?: string;
          condition?: string;
          flooring?: string;
          constructionYear?: number | null;
          locationFeatures?: string[];
          view?: string[];
          luxuryFacilities?: string[];
          outdoorFeatures?: string[];
          landSize?: string;
          livingArea?: string;
        };

        const landSize = vd.general?.landSize || vd.landSize;
        const livingArea = vd.general?.propertySize || vd.livingArea;

        const specRows = [
          vd.type && { label: "Object type", value: String(vd.type) },
          vd.condition && { label: "Condition", value: String(vd.condition) },
          villaData.bedrooms != null && { label: "Bedrooms", value: String(villaData.bedrooms) },
          villaData.baths != null && { label: "Bathrooms", value: String(villaData.baths) },
          vd.constructionYear != null && {
            label: "Construction year",
            value: String(vd.constructionYear),
          },
          landSize && landSize !== "0 sqm" && { label: "Total surface", value: landSize },
          livingArea && livingArea !== "0 sqm" && { label: "Living area", value: livingArea },
          vd.flooring && { label: "Flooring", value: String(vd.flooring) },
        ].filter(Boolean) as { label: string; value: string }[];

        const featureGroups = [
          { title: "Location", items: vd.locationFeatures ?? [] },
          { title: "View", items: vd.view ?? [] },
          { title: "Outdoor", items: vd.outdoorFeatures ?? [] },
          { title: "Luxury facilities", items: vd.luxuryFacilities ?? [] },
        ].filter((group) => Array.isArray(group.items) && group.items.length > 0);

        if (specRows.length === 0 && featureGroups.length === 0) return null;

        return (
          <section className="bg-white px-4 py-7 md:px-6 md:py-10">
            <h2 className="mb-5 text-center font-gtsuper-ds text-xl font-light text-[#172338] md:text-2xl">
              About the Building
            </h2>
            {specRows.length > 0 && (
              <div className="pdf-print-avoid-break mx-auto mb-8 grid w-full max-w-none grid-cols-1 gap-x-8 gap-y-3 text-[#172338] md:grid-cols-2">
                {specRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-[#b7dbe6] pb-2"
                  >
                    <span className="font-haas text-[13px] font-light">{row.label}</span>
                    <span className="text-right font-haas text-[13px] font-light">{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            {featureGroups.length > 0 && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#D99330]" aria-hidden />
                  <h3 className="shrink-0 font-gtsuper-ds text-[10px] font-normal uppercase tracking-[0.16em] text-[#7A6A58]">
                    Features &amp; facilities
                  </h3>
                  <span className="h-px flex-1 bg-[#D4C9B8]" aria-hidden />
                </div>
                <div className="mx-auto grid w-full max-w-none grid-cols-1 gap-3 sm:grid-cols-2">
                  {featureGroups.map((group) => (
                    <div key={group.title} className="pdf-print-avoid-break bg-white p-4 md:p-5">
                      <div className="mb-3 flex items-center gap-2 border-b border-[#F0EBE0] pb-2.5">
                        <h4 className="font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.12em] text-[#172338]">
                          {group.title}
                        </h4>
                      </div>
                      <ul className="m-0 list-none space-y-1.5 p-0 font-haas text-[11px] leading-snug text-[#506A70] md:text-xs">
                        {group.items.map((item) => (
                          <li key={`${group.title}-${item}`} className="flex items-start gap-2">
                            <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-[#D99330]" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        );
      })()}

      {!isRealEstate && villaGroups.length > 0 && (
        <section className="bg-white px-4 py-8 md:px-6 md:py-10">
          <h2 className="mb-3 text-left font-gtsuper-ds text-2xl font-light text-[#172338] md:mb-4 md:text-3xl">
            The Villa
          </h2>
          <div className="mb-6 h-px w-full bg-[#D4B896]" aria-hidden />

          <div className="space-y-5 text-left print:space-y-4">
            {villaGroups.map((group, idx) => (
              <div key={idx} className="pdf-print-avoid-break min-w-0">
                <h3 className="mb-2.5 font-gtsuper-ds text-[11px] font-semibold uppercase tracking-[0.1em] text-[#B87A28] md:text-[12px] print:mb-2 print:text-[10px]">
                  {group.title || `Section ${idx + 1}`}
                </h3>
                <ul className="flex flex-wrap gap-x-[10px] gap-y-[22px] print:gap-x-[8px] print:gap-y-[20px]">
                  {group.items!.map((item: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-1.5 font-haas text-[13px] font-light text-[#506A70] md:text-[14px] print:text-[12px]"
                    >
                      <span className="h-1 w-1 shrink-0 rounded-full bg-[#D4B896]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {theVillaGalleryImages.length > 0 && (
            <div className="pdf-print-avoid-break mt-10">
              {theVillaGalleryImages.length >= 4 ? (
                <div className="grid grid-cols-2 gap-2 md:h-[340px] md:grid-cols-12 md:grid-rows-2 md:gap-3 print:h-[260px]">
                  {theVillaGalleryImages.slice(0, 4).map((src, i) => (
                    <figure
                      key={i}
                      className={`m-0 flex min-h-0 flex-col ${
                        i === 0
                          ? "md:col-span-5 md:row-span-2"
                          : i === 1
                            ? "md:col-span-4 md:col-start-6 md:row-start-1"
                            : i === 2
                              ? "md:col-span-4 md:col-start-6 md:row-start-2"
                              : "md:col-span-3 md:col-start-10 md:row-span-2 md:row-start-1"
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full min-h-0 flex-1 overflow-hidden bg-[#E9EEF2] md:aspect-auto md:min-h-[120px]">
                        <img
                          src={src}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ objectPosition: "center" }}
                        />
                      </div>
                      <figcaption
                        className={`mt-2 font-gtsuper-ds text-[10px] font-light uppercase leading-tight tracking-wide md:text-[11px] ${
                          i === 1 ? "text-[#D99330]" : "text-[#172338]"
                        }`}
                      >
                        {theVillaCaptions[i] ?? ""}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <div
                  className={`grid gap-2 md:gap-3 ${
                    theVillaGalleryImages.length === 1
                      ? "grid-cols-1"
                      : theVillaGalleryImages.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-3"
                  }`}
                >
                  {theVillaGalleryImages.map((src, i) => (
                    <figure key={i} className="m-0 flex flex-col">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#E9EEF2]">
                        <img
                          src={src}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                          style={{ objectPosition: "center" }}
                        />
                      </div>
                      <figcaption
                        className={`mt-2 font-gtsuper-ds text-[10px] font-light uppercase leading-tight tracking-wide md:text-[11px] ${
                          i === 1 ? "text-[#D99330]" : "text-[#172338]"
                        }`}
                      >
                        {theVillaCaptions[i] ?? ""}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {(villaData.includedServices?.length || extraServicesLines.length || staffPlain || extraInfoPlain) ? (
        <section className="bg-white px-4 py-8 md:px-6 md:py-10">
          <div className="mx-auto w-full max-w-none space-y-7">

            {/* Included Package */}
            {villaData.includedServices && villaData.includedServices.length > 0 && extraServicesLines.length > 0 && (
              <div className="pdf-print-avoid-break bg-[#F2EDE4] p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <TbStar size={13} className="shrink-0 text-[#D99330]" />
                  <h3 className="font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7A6A58]">
                    Included Services
                  </h3>
                </div>
                <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 font-haas text-[12px] text-[#506A70]">
                  {villaData.includedServices.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <TbCheck size={15} className="mt-0.5 shrink-0 text-[#D99330]" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optional Services */}
            {extraServicesLines.length > 0 && (
              <div className="pdf-print-avoid-break border-l-2 border-[#D99330] pl-4">
                <h3 className="mb-2.5 font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.14em] text-[#172338]">
                  Optional Services
                </h3>
                <div className="space-y-1.5 font-haas text-[12px] leading-relaxed text-[#506A70]">
                  {extraServicesLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Staff and Services */}
            {staffPlain && (
              <div className="pdf-print-avoid-break border-l-2 border-[#D99330] pl-4">
                <h3 className="mb-2.5 font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.14em] text-[#172338]">
                  Staff and Services
                </h3>
                <p className="whitespace-pre-line font-haas text-[12px] leading-relaxed text-[#506A70]">{staffPlain}</p>
              </div>
            )}

            {/* Need to Know — parseado en secciones */}
            {extraInfoPlain && (
              <div className="pdf-print-avoid-break">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-6 bg-[#D99330]" aria-hidden />
                  <h3 className="shrink-0 font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.14em] text-[#506A70]">
                    Need to Know
                  </h3>
                  <span className="h-px flex-1 bg-[#E9EEF2]" aria-hidden />
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {parseNeedToKnow(extraInfoPlain).map((block, i) => (
                    <div key={i} className="min-w-0">
                      {block.heading && (
                        <p className="mb-2.5 font-haas text-[10px] font-semibold uppercase tracking-[0.1em] text-[#172338]">
                          {block.heading}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {block.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <TbCheck size={13} className="mt-[2px] shrink-0 text-[#506A70]" />
                            <span className="font-haas text-[12px] leading-snug text-[#506A70]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      ) : null}

      <section className="bg-white px-4 py-7 md:px-6 md:py-10">
        <h2 className="mb-5 text-center font-gtsuper-ds text-xl font-light text-[#506A70] md:text-2xl">Location</h2>
        <div className="pdf-print-avoid-break relative mx-auto h-[220px] w-full max-w-none overflow-hidden border border-[#E9EEF2] md:h-[280px]">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <PropertyLocationMap
              googleMapUrl={propertyData?.googleMapUrl}
              location={villaData.location}
              title={villaData.title}
            />
          ) : (
            <div className="h-full w-full bg-[#F0F3F5]" aria-hidden />
          )}
          <PropertyMapFloatingCard
            property={propertyData}
            locationSummary={villaData.location}
            pdfPrep={true}
            className="pdf-map-location-card font-haas rounded-md !left-1.5 !top-1.5 z-[2] !max-h-[min(140px,calc(100%-0.75rem))] !w-[min(calc(100%-0.75rem),198px)] !p-2 !shadow-[0_4px_14px_rgba(23,35,56,0.1)] md:!left-2 md:!top-2 md:!max-h-[min(158px,calc(100%-1rem))] md:!w-[min(calc(100%-1rem),224px)] md:!p-2.5 md:!shadow-[0_5px_18px_rgba(23,35,56,0.1)] print:pointer-events-none [&_[role='tabpanel']]:!mt-1.5 [&_#map-tab-location-pdf]:!text-[12px] [&_#map-tab-location-pdf]:md:!text-[12px] [&_.space-y-4]:!space-y-2 [&_.space-y-1]:!space-y-0.5 [&_.space-y-3]:!space-y-1.5 [&_.border-t]:!pt-2 [&_p]:!text-[11px] [&_p]:!leading-snug [&_p]:md:!text-[11px] [&_dd]:!text-[11px] [&_dd]:!leading-snug [&_dd]:md:!text-[12px] [&_dt]:!text-[9px] [&_dt]:md:!text-[10px] [&_p]:print:!text-[10px] [&_dd]:print:!text-[10px] [&_dt]:print:!text-[8px] [&_#map-tab-location-pdf]:print:!text-[11px]"
          />
        </div>

        {distancesHtml ? (
          <div className="pdf-print-avoid-break mx-auto mt-8 w-full max-w-none md:mt-10">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-6 bg-[#D99330]" aria-hidden />
              <h3 className="shrink-0 font-gtsuper-ds text-[10px] font-semibold uppercase tracking-[0.14em] text-[#506A70]">
                Distances
              </h3>
              <span className="h-px flex-1 bg-[#E9EEF2]" aria-hidden />
            </div>
            <div
              className="max-w-none font-haas text-[12px] font-light leading-relaxed text-[#506A70] prose prose-sm prose-p:my-2 prose-p:font-haas prose-p:font-light prose-p:text-[#506A70] prose-p:first:mt-0 prose-p:last:mb-0 prose-headings:font-haas prose-headings:font-semibold prose-headings:text-[#172338] prose-headings:tracking-wide prose-li:font-haas prose-li:font-light prose-li:text-[#506A70] prose-li:marker:text-[#D99330]"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(distancesHtml) }}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
