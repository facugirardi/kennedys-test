"use client";

import React from "react";
import Link from "next/link";
import { sanitizeCmsHtml } from "@/lib/sanitizeCmsHtml";
import { useRouter } from "next/router";
import PropertyCard from "./propertyCard";
import { resolveMediaUrl } from "@/lib/utils";
import { buildOfferPublicPropertyDetailPath } from "@/lib/rentalRoute";
import { mapCustomServiceForOfferCard } from "@/lib/customServiceOfferCard";
import {
  buildOfferConciergeDetailUrl,
  getOfferPublicSiteBaseUrl,
  OFFER_BACK_QUERY_KEY,
} from "@/lib/offerPublicSiteUrl";
import ServiceOfferCard from "./ServiceOfferCard";
import { Calendar, ChevronDown, Phone } from "lucide-react";
import Footer from "@/components/custom/footerNew";
import { useContact } from "@/src/contexts/ContactContext";
import { contactPresetFromPathname } from "@/lib/contactInquiryTypes";
import type { ContactInquiryType } from "@/lib/contactInquiryTypes";

/** "Villa" → "Villas", "Service" → "Services", "Property" → "Properties" (naive "+s" breaks the last one). */
function pluralizeItemLabel(label: string): string {
  return label === "Property" ? "Properties" : `${label}s`;
}

/** Valores guardados en EUR en la oferta → mostrar USD usando tipo de cambio. */
function scaleOfferPropertyMoneyFields(property: Record<string, unknown>, mult: number): Record<string, unknown> {
  if (!property || mult === 1 || !Number.isFinite(mult) || mult <= 0) return property;
  const keys = [
    "finalPrice",
    "officialPrice",
    "grossRate",
    "price_per_night",
    "securityDeposit",
    "totalCommission",
    "markup",
    "management_fee",
    "managementFee",
    "discount",
    "discountShare",
  ];
  const out: Record<string, unknown> = { ...property };
  for (const k of keys) {
    const v = out[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = Math.round(v * mult * 100) / 100;
    }
  }
  const dfa = out.discountFixedAmount;
  if (typeof dfa === "number" && Number.isFinite(dfa)) {
    out.discountFixedAmount = Math.round(dfa * mult * 100) / 100;
  }
  return out;
}

function CustomSelect({ label, options, suffix }: {
  label: string;
  options: { value: string; label: string }[];
  suffix?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState(options[0]);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex items-center border border-[#172338] px-4 py-2.5 gap-4 cursor-pointer select-none" onClick={() => setOpen(!open)}>
      <span className="font-haas text-sm text-[#172338] whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-haas text-sm text-[#172338]">{selected.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#172338] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>
      {suffix && <span className="font-haas text-sm text-[#172338]">{suffix}</span>}
      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border border-[#172338] border-t-0 z-50">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`px-4 py-2.5 font-haas text-sm hover:bg-[#172338] hover:text-white transition-colors ${selected.value === opt.value ? "bg-[#172338] text-white" : "text-[#172338]"}`}
              onClick={(e) => { e.stopPropagation(); setSelected(opt); setOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  shareProperty: any;
  offerSlug?: string;
  /** Ruta agent-offers: siempre sin branding Kennedy's. */
  forceUnbranded?: boolean;
}

const ATHENS_TEL = "+302108947139";
const ATHENS_TEL_DISPLAY = "+30 210 8947139";
const MYKONOS_TEL = "+302289028233";
const MYKONOS_TEL_DISPLAY = "+30 22890 28233";

export const SharePropertiesPage = ({ shareProperty, offerSlug, forceUnbranded = false }: Props) => {
  const router = useRouter();
  const { openContactForm } = useContact();

  // Agregar estilo CSS para ocultar elementos no-print en PDF
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const {
    propertiesToPresent: rawPropertiesToPresent = [],
    showPrice: showPriceRaw = false,
    description,
    content,
    welcomeTitle,
    logoUrl,
    imageUrl,
    currency = "EUR",
    creatorName,
    creatorPhone,
  } = shareProperty ?? {};

  const sp = shareProperty as Record<string, unknown> | null | undefined;
  const rawUsdPerEur = Number(sp?.usdPerEur ?? sp?.usd_per_eur);
  const usdPerEur = Number.isFinite(rawUsdPerEur) && rawUsdPerEur > 0 ? rawUsdPerEur : null;
  const priceEntryUsd = Boolean(sp?.priceEntryUsd ?? sp?.price_entry_usd);
  const curNorm = String(currency || "EUR").toUpperCase();
  const showAmountsInUsd =
    Boolean(priceEntryUsd && usdPerEur) || (curNorm === "USD" && usdPerEur != null);
  const priceDisplayMultiplier = showAmountsInUsd && usdPerEur ? usdPerEur : 1;
  const offerDisplayCurrency = showAmountsInUsd ? "USD" : curNorm === "USD" ? "USD" : "EUR";

  const rawBranded = (shareProperty as any)?.branded;
  const branded = forceUnbranded
    ? false
    : rawBranded !== false &&
      String(rawBranded ?? "").toLowerCase() !== "false";

  const showPrice = showPriceRaw;

  const stripHtml = (s?: string) => (s || '').replace(/<[^>]*>/g, '').trim();
  const hasWelcomeContent =
    !!welcomeTitle?.trim() ||
    stripHtml(description).length > 0 ||
    stripHtml(content).length > 0;

  // Fusionar sección "Custom Services" con la anterior para que fluyan en el mismo grid (a la derecha)
  const propertiesToPresent = React.useMemo(() => {
    const groups = [...(rawPropertiesToPresent || [])];
    const merged: any[] = [];
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      const titleMatch = (g?.title || "").trim().toLowerCase() === "custom services";
      const visibleProperties = Array.isArray(g?.properties)
        ? g.properties.filter((p: any) => !p?.hiddenFromClient)
        : [];
      if (titleMatch && merged.length > 0 && visibleProperties.length > 0) {
        merged[merged.length - 1].properties = [
          ...(merged[merged.length - 1].properties || []),
          ...visibleProperties,
        ];
      } else {
        merged.push({ ...g, properties: visibleProperties });
      }
    }

    return merged;
  }, [rawPropertiesToPresent]);

  const offerLogoPath =
    logoUrl ?? (shareProperty as any)?.logo_url ?? "";
  const resolvedOfferLogo = offerLogoPath
    ? resolveMediaUrl(offerLogoPath)
    : "";
  const navLogoSrc =
    resolvedOfferLogo.trim() !== ""
      ? resolvedOfferLogo
      : "/images/capa-1-3.svg";
  const headerImagePreview = resolveMediaUrl(imageUrl);

  const handleSelectProperty = (property: any) => {
    if (property?.itemType === "service" || property?.serviceId) {
      return;
    }

    if (property?.itemType === "customVilla" && property?.brochureLink) {
      const url = resolveMediaUrl(property.brochureLink);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Obtener el ID de la propiedad
    const propertyId = property.propertyId || property.id;
    if (!propertyId) {
      return;
    }
    
    const websiteUrl = getOfferPublicSiteBaseUrl(branded);
    const route = buildOfferPublicPropertyDetailPath(property, {
      agentFriendly: !branded,
    });
    const targetUrl = new URL(`${websiteUrl}${route}`);
    const startDate =
      typeof property?.startDate === "string" && property.startDate.trim() !== ""
        ? property.startDate.trim().slice(0, 10)
        : "";
    const endDate =
      typeof property?.endDate === "string" && property.endDate.trim() !== ""
        ? property.endDate.trim().slice(0, 10)
        : "";
    if (startDate) targetUrl.searchParams.set("checkIn", startDate);
    if (endDate) targetUrl.searchParams.set("checkOut", endDate);

    const nightlyPrice = Number(property?.price_per_night);
    if (Number.isFinite(nightlyPrice) && nightlyPrice > 0) {
      targetUrl.searchParams.set("offerPrice", String(nightlyPrice));
    }

    if (offerSlug) {
      targetUrl.searchParams.set(OFFER_BACK_QUERY_KEY, offerSlug);
    }

    window.location.href = targetUrl.toString();
  };

  const handleSelectService = (service: any) => {
    const isCustomService = service?.itemType === "customService" && service?.customServiceId;
    if (isCustomService && offerSlug) {
      const offerBase = !branded ? "agent-offers" : "shared-properties";
      window.location.href = `/${offerBase}/${offerSlug}/custom/${service.customServiceId}`;
      return;
    }

    const url = buildOfferConciergeDetailUrl(service, branded, offerSlug);
    window.location.href = url;
  };

  const totalItems = propertiesToPresent.reduce((acc: number, group: any) => {
    return acc + (Array.isArray(group.properties) ? group.properties.length : 0);
  }, 0);
  const flattenedItems = propertiesToPresent.flatMap((group: any) =>
    Array.isArray(group.properties) ? group.properties : []
  );
  const hasServices = flattenedItems.some(
    (item: any) => item?.itemType === "service" || item?.serviceId
  );
  const hasRealEstate = !hasServices && flattenedItems.some(
    (item: any) => item?.category === "real-estate" || item?.rental === false
  );
  const itemLabel = hasServices ? "Service" : hasRealEstate ? "Property" : "Villa";

  const contactPreset = React.useMemo((): ContactInquiryType | null => {
    if (hasServices) return "CONCIERGE";
    if (hasRealEstate) return "REAL_ESTATE";
    return contactPresetFromPathname(router.pathname);
  }, [hasServices, hasRealEstate, router.pathname]);

  if (!shareProperty) {
    return null;
  }

  const hasPropertyGroups = propertiesToPresent.length > 0;
  const showOfferHero =
    hasPropertyGroups ||
    !!headerImagePreview ||
    hasWelcomeContent;

  return (
    <div className="w-full bg-white">
      {branded ? (
        <header className="no-print sticky top-0 z-[100] w-full shrink-0 border-b border-[#e6e8ed] border-t-[5px] border-t-[#D99330] bg-white text-[#172338] shadow-sm">
          <nav
            className="mx-auto flex h-14 max-w-[1440px] items-center px-3 sm:px-4 md:h-16 md:px-12"
            aria-label="Offer branding"
          >
            <Link
              href="/"
              className="inline-flex min-w-0 shrink items-center py-2 transition-opacity hover:opacity-90"
            >
              <img
                src={navLogoSrc}
                alt="Kennedy's Group"
                className="max-h-8 w-auto max-w-[min(100%,260px)] object-contain object-left md:max-h-9"
              />
            </Link>
          </nav>
        </header>
      ) : null}

      {showOfferHero ? (
        <section className="flex flex-col w-full">
          {headerImagePreview && (
            <div className="w-full">
              <img
                src={headerImagePreview}
                alt="Header"
                className="w-full object-cover bg-gray-100"
                style={{ height: 'clamp(220px, 50vw, 550px)' }}
              />
            </div>
          )}
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 lg:px-20 py-8 md:py-12">
            {(hasPropertyGroups || hasWelcomeContent) && (
            <section className={`w-full ${hasWelcomeContent ? 'mb-10' : 'mb-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {welcomeTitle && welcomeTitle.trim() && (() => {
                const parts = welcomeTitle.split('@').map((p: string) => p.trim()).filter(Boolean);
                const titleParts = parts.length > 1 ? parts.slice(0, -1) : parts;
                const datePart = parts.length > 1 ? parts[parts.length - 1] : null;
                return (
                  <div className="col-span-full mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h1 className="font-gtsuper-ds text-[22px] md:text-[36px] font-light text-[#172338] leading-tight">
                      {titleParts.map((part: string, i: number) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="inline-block mx-2 md:mx-3 text-[#D99330] opacity-60 font-light">·</span>
                          )}
                          {part}
                        </React.Fragment>
                      ))}
                    </h1>
                    {datePart && (
                      <div className="flex items-center gap-1.5 border border-[#172338] px-3 py-1.5 self-start sm:self-auto">
                        <Calendar className="w-3.5 h-3.5 text-[#D99330] flex-shrink-0" />
                        <span className="font-haas text-sm md:text-base text-[#172338] tracking-wide whitespace-nowrap">{datePart}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {(description || content) && (description?.trim() || content?.trim()) && (
                <div
                  className="col-span-full font-haas text-[14px] md:text-[16px] leading-[1.9] md:leading-[1.8] text-[#172338] w-full max-w-2xl mb-8 md:mb-10 [&>p]:mb-4 [&>p:last-child]:mb-0 [&>br+br]:hidden"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeCmsHtml(description || content || ""),
                  }}
                />
              )}

              {(!!welcomeTitle?.trim() || stripHtml(description).length > 0 || stripHtml(content).length > 0) && (
                <div className="col-span-full w-full h-[1px] bg-[#D99330] mb-4 md:mb-8" />
              )}
              </div>
            </section>
            )}

            {hasPropertyGroups && (
              <>
            <div className="flex items-center justify-between mb-6 no-print flex-wrap gap-3">
              <span className="font-haas text-xs tracking-widest uppercase text-[#D99330]">
                {totalItems > 0
                  ? `${totalItems} ${totalItems === 1 ? itemLabel : pluralizeItemLabel(itemLabel)}`
                  : `No ${pluralizeItemLabel(itemLabel).toLowerCase()}`}
              </span>
              <div className="flex items-center gap-3">
                <CustomSelect
                  label="Sort by"
                  options={[
                    { value: "recent", label: "Recent" },
                    { value: "oldest", label: "Oldest" },
                  ]}
                />
                <CustomSelect
                  label="Show"
                  suffix="entries"
                  options={[
                    { value: "10", label: "10" },
                    { value: "20", label: "20" },
                    { value: "24", label: "24" },
                    { value: "30", label: "30" },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              {propertiesToPresent.map((group: any, groupIndex: number) => {
                const groupProperties = Array.isArray(group.properties)
                  ? group.properties
                  : [];

                if (groupProperties.length === 0) return null;

                const hasTitle = group.title && group.title.trim();
                const hasText = group.text && group.text.trim();

                return (
                  <div
                    key={`${group.title}-${groupIndex}`}
                    className={`mb-5 ${groupIndex > 0 ? "pt-10 mt-4 border-t border-[#E5EEF1]" : ""}`}
                  >
                    {hasTitle && (
                      <header className="mb-5 md:mb-6">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                          <span className="font-haas text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#D99330]">
                            Selection
                          </span>
                          <span
                            className="hidden sm:inline-block h-px flex-1 min-w-[3rem] max-w-[100px] bg-[#D99330]/35 align-middle"
                            aria-hidden
                          />
                        </div>
                        <h2 className="font-gtsuper-ds text-[22px] md:text-[28px] leading-[1.2] font-normal text-[#172338] normal-case tracking-[-0.01em] pl-3.5 md:pl-5 border-l-[3px] border-[#D99330] py-0.5">
                          {group.title}
                        </h2>
                      </header>
                    )}
                    
                    {hasText && (
                      <div
                        className="font-haas text-[14px] md:text-[17px] leading-[160%] tracking-[0.01em] font-normal text-[#172338] break-after-column mb-4"
                        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(group.text) }}
                      />
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch property-grid">
                {groupProperties.map((property: any) => {
                      const isServiceItem = property?.itemType === "service" || property?.serviceId;
                      const isCustomServiceItem = property?.itemType === "customService" && property?.customServiceId;
                      if (isServiceItem || isCustomServiceItem) {
                        const serviceForCard = isCustomServiceItem
                          ? mapCustomServiceForOfferCard(property)
                          : property;
                        return (
                          <div
                            className="cursor-pointer grid grid-rows-subgrid row-span-4"
                            key={property.customServiceId || property.id || property.serviceId || `service-${groupIndex}-${groupProperties.indexOf(property)}`}
                            onClick={() => handleSelectService(property)}
                          >
                            <ServiceOfferCard
                              service={serviceForCard}
                              showPrice={showPrice}
                              currency={offerDisplayCurrency}
                            />
                          </div>
                        );
                      }

                      const scaledProp = scaleOfferPropertyMoneyFields(
                        property as Record<string, unknown>,
                        priceDisplayMultiplier
                      ) as typeof property;
                      const nights =
                        scaledProp.nights ??
                        (scaledProp.startDate && scaledProp.endDate
                          ? Math.max(
                              1,
                              Math.ceil(
                                (new Date(scaledProp.endDate).getTime() -
                                  new Date(scaledProp.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : 1);
                      const clientStayTotal =
                        scaledProp.finalPrice != null && Number(scaledProp.finalPrice) > 0
                          ? Number(scaledProp.finalPrice)
                          : scaledProp.officialPrice != null && Number(scaledProp.officialPrice) > 0
                            ? Number(scaledProp.officialPrice)
                            : null;
                      let pricePerNight: number | null = null;
                      if (clientStayTotal != null && clientStayTotal > 0 && nights > 0) {
                        pricePerNight = clientStayTotal / nights;
                      } else if (scaledProp.price_per_night && Number(scaledProp.price_per_night) > 0) {
                        pricePerNight = Number(scaledProp.price_per_night);
                      } else {
                        const g = Number(scaledProp.grossRate ?? 0);
                        if (g > 0 && nights > 0) pricePerNight = g / nights;
                      }
                      const propertyForCard = {
                        ...scaledProp,
                        nights,
                        price_per_night: pricePerNight,
                        currency: offerDisplayCurrency,
                      };

                      const isRealEstateItem =
                        property?.category === "real-estate" || property?.rental === false;
                      // Hotel room (ver docs/HOTELS-FEATURE.md): no tiene fecha de estadía como una villa.
                      const isHotelRoomItem = property?.classification?.type === "HOTEL_ROOM";
                      // Hotel agregado entero (sin una room puntual) — tampoco tiene fecha de estadía.
                      const isHotelItem = property?.classification?.type === "HOTEL";

                      const normalTitle =
                        (typeof property.name === "string" && property.name.trim()) ||
                        (typeof property.title === "string" && property.title.trim()) ||
                        "Property";
                      const explicitAgentFriendly =
                        (typeof property.agentFriendlyName === "string" && property.agentFriendlyName.trim()) ||
                        (typeof property.agent_friendly_name === "string" &&
                          property.agent_friendly_name.trim()) ||
                        (typeof property.agentFriendly === "string" && property.agentFriendly.trim()) ||
                        "";
                      const cardTitle = isRealEstateItem || isHotelRoomItem || isHotelItem
                        ? normalTitle
                        : !branded
                          ? (explicitAgentFriendly || normalTitle)
                          : normalTitle;

                      const isCustomVillaItem = property?.itemType === "customVilla" && property?.customVillaId;

                      return (
                        <div
                          className={`grid grid-rows-subgrid row-span-4${isCustomVillaItem ? " cursor-pointer" : ""}`}
                          key={property.customVillaId || property.id || `property-${groupIndex}-${groupProperties.indexOf(property)}`}
                          onClick={isCustomVillaItem ? () => handleSelectProperty(property) : undefined}
                        >
                          <PropertyCard
                            handleSelect={() => { }}
                            property={propertyForCard}
                            disableSelect={true}
                            containerClassName="w-full"
                            isSelected={false}
                            showPrice={showPrice}
                            currency={offerDisplayCurrency}
                            displayTitle={cardTitle}
                            showAreaRegionCountry
                            showDateBadge={!isRealEstateItem && !isHotelRoomItem && !isHotelItem}
                            onNavigate={handleSelectProperty}
                          />
                        </div>
                      );
                    })}
                    </div>
                  </div>
                );
              })}
            </div>
              </>
            )}

            {!hasPropertyGroups && (
              <div className="flex items-center justify-center py-12 md:py-16">
                <h1 className="text-2xl font-semibold text-soft-gray-dark">
                  No {pluralizeItemLabel(itemLabel).toLowerCase()} found
                </h1>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="flex items-center justify-center py-16 px-6">
          <h1 className="text-2xl font-semibold text-soft-gray-dark text-center">
            No {pluralizeItemLabel(itemLabel).toLowerCase()} found
          </h1>
        </div>
      )}

      {branded ? (
        <div className="no-print w-full flex flex-col shrink-0">
          <section
            className="w-full bg-[#172338] text-white"
            aria-label="Contact Kennedy's Group"
          >
            <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 lg:px-20 py-8 md:py-10">
              {hasServices ? (
                <>
                  <p className="font-haas text-sm md:text-base text-white/90 font-light max-w-xl mb-6 leading-relaxed">
                    Interested in this offer? Our concierge team can help with availability, details, and next steps.
                    {creatorName && creatorName.trim() ? (
                      <><br />Speak with <span className="font-medium text-white">{creatorName.trim()}</span>, our Concierge Agent.</>
                    ) : null}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openContactForm(contactPreset)}
                      className="font-haas inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#D99330] text-white text-sm tracking-wide hover:bg-[#c17e28] transition-colors border-0 cursor-pointer w-full sm:w-auto"
                    >
                      Contact us
                    </button>
                    {creatorPhone && creatorPhone.trim() ? (
                      <a
                        href={`tel:${creatorPhone.trim().replace(/\s/g, '')}`}
                        className="font-haas inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-white/45 text-sm text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                      >
                        <Phone className="w-4 h-4 shrink-0" aria-hidden />
                        {creatorPhone.trim()}
                      </a>
                    ) : null}
                    <a
                      href="mailto:concierge@kennedysgroup.com"
                      className="font-haas inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-white/45 text-sm text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                    >
                      concierge@kennedysgroup.com
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-haas text-sm md:text-base text-white/90 font-light max-w-xl mb-6 leading-relaxed">
                    Interested in this offer? Our team can help with availability, details, and next steps.
                    <br />
                    Speak with Olga Michaloglou, our Sales & Property Manager.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openContactForm(contactPreset)}
                      className="font-haas inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#D99330] text-white text-sm tracking-wide hover:bg-[#c17e28] transition-colors border-0 cursor-pointer w-full sm:w-auto"
                    >
                      Contact us
                    </button>
                    <a
                      href={`tel:${ATHENS_TEL}`}
                      className="font-haas inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-white/45 text-sm text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                    >
                      <Phone className="w-4 h-4 shrink-0" aria-hidden />
                      Athens {ATHENS_TEL_DISPLAY}
                    </a>
                    <a
                      href={`tel:${MYKONOS_TEL}`}
                      className="font-haas inline-flex items-center justify-center gap-2 px-5 py-3.5 border border-white/45 text-sm text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                    >
                      <Phone className="w-4 h-4 shrink-0" aria-hidden />
                      Mykonos {MYKONOS_TEL_DISPLAY}
                    </a>
                  </div>
                </>
              )}
            </div>
          </section>
          <Footer disableTravelSection={true} />
        </div>
      ) : null}

    </div>
  );
};
