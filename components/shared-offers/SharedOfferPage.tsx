import React from "react";
import Head from "next/head";
import { sanitizeCmsHtml } from "@/lib/sanitizeCmsHtml";
import { resolveMediaUrl } from "@/lib/utils";

type OfferItem = Record<string, any>;
type OfferSection = {
  title?: string;
  text?: string;
  properties?: OfferItem[];
};

type ShareOffer = {
  title?: string;
  description?: string;
  welcomeTitle?: string;
  showPrice?: boolean;
  branded?: boolean;
  logoUrl?: string | null;
  imageUrl?: string | null;
  currency?: "EUR" | "USD" | string;
  propertiesToPresent?: OfferSection[];
};

const formatCurrency = (value: unknown, currency: string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "EUR",
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${currency === "USD" ? "$" : "EUR "}${Math.round(numeric)}`;
  }
};

const resolveMedia = (raw: unknown): string => {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  const resolved = resolveMediaUrl(value);
  if (resolved) return resolved;
  // Fallback defensivo para URLs ya absolutas o rutas ya públicas
  if (/^https?:\/\//i.test(value)) return value;
  return value;
};

const toNights = (item: OfferItem) => {
  const explicit = Number(item?.nights);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  if (item?.startDate && item?.endDate) {
    const ms = new Date(item.endDate).getTime() - new Date(item.startDate).getTime();
    if (Number.isFinite(ms) && ms > 0) return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }
  return null;
};

const formatRange = (item: OfferItem) => {
  if (!item?.startDate || !item?.endDate) return null;
  const start = new Date(item.startDate);
  const end = new Date(item.endDate);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return null;
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
};

const locationLabel = (item: OfferItem) => {
  return [item?.area, item?.region, item?.country, item?.location, item?.visibleLocation]
    .filter((v) => typeof v === "string" && v.trim())
    .map((v) => String(v).trim())[0] || "";
};

export default function SharedOfferPage({ offer, notFoundMessage }: { offer: ShareOffer | null; notFoundMessage?: string }) {
  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <p className="text-sm text-gray-500">{notFoundMessage || "Offer not found."}</p>
      </div>
    );
  }

  const sections = Array.isArray(offer.propertiesToPresent) ? offer.propertiesToPresent : [];
  const currency = offer.currency || "EUR";
  const headerImage = resolveMedia(offer.imageUrl);
  const logoImage = resolveMedia(offer.logoUrl);

  return (
    <>
      <Head>
        <title>{offer.title || offer.welcomeTitle || "Kennedys Offer"}</title>
        {offer.description ? <meta name="description" content={String(offer.description).replace(/<[^>]*>/g, "").slice(0, 160)} /> : null}
      </Head>
      <main className="min-h-screen bg-white">
        {headerImage ? (
          <div className="w-full">
            <img src={headerImage} alt="Offer header" className="w-full h-[260px] md:h-[440px] object-cover bg-gray-100" />
          </div>
        ) : null}

        <section className="max-w-[1400px] mx-auto px-4 md:px-10 lg:px-20 py-8 md:py-12">
          {offer.branded && logoImage ? (
            <img src={logoImage} alt="Logo" className="h-7 w-auto mb-6 object-contain" />
          ) : null}
          {offer.welcomeTitle ? (
            <h1 className="text-[28px] md:text-[44px] leading-tight text-[#172338] mb-4 font-light">
              {offer.welcomeTitle}
            </h1>
          ) : null}
          {offer.description ? (
            <div
              className="text-[#172338] text-[15px] md:text-[19px] leading-[1.85] mb-10 max-w-4xl [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(offer.description) }}
            />
          ) : null}

          <div className="space-y-8">
            {sections.map((section, idx) => {
              const items = Array.isArray(section?.properties) ? section.properties : [];
              if (!items.length) return null;
              return (
                <article key={`${section?.title || "section"}-${idx}`} className="space-y-4">
                  {section?.title ? <h2 className="text-lg md:text-xl font-semibold text-[#172338]">{section.title}</h2> : null}
                  {section?.text ? (
                    <div className="text-sm text-[#506A70]" dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(section.text) }} />
                  ) : null}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {items.map((item, itemIdx) => {
                      const image = resolveMedia(
                        item?.mainImage ||
                          item?.imageUrl ||
                          item?.urlImage ||
                          item?.images?.[0]?.urlImage ||
                          item?.images?.[0]?.url
                      );
                      const finalPrice = item?.finalPrice ?? item?.officialPrice;
                      const nights = toNights(item);
                      const totalFormatted = formatCurrency(finalPrice, currency);
                      const perNightFormatted =
                        nights && Number(finalPrice) > 0
                          ? formatCurrency(Number(finalPrice) / nights, currency)
                          : null;
                      const range = formatRange(item);

                      return (
                        <div key={`${item?.id || item?.propertyId || itemIdx}`} className="border border-gray-200 bg-white h-full flex flex-col hover:border-gray-300 transition-colors">
                          <div className="h-[220px] bg-gray-100 overflow-hidden">
                            {image ? (
                              <img src={image} alt={item?.title || item?.name || "Offer item"} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-[22px] leading-snug font-light text-[#172338] mb-1">{item?.title || item?.name || "Item"}</h3>
                            {locationLabel(item) ? <p className="text-sm text-[#506A70]">{locationLabel(item)}</p> : null}
                            <div className="mt-3 space-y-1">
                              {range ? <p className="text-sm text-[#172338]">{range}</p> : null}
                              {nights ? <p className="text-xs text-gray-500">{nights} night{nights > 1 ? "s" : ""}</p> : null}
                            </div>
                            {offer.showPrice && totalFormatted ? (
                              <div className="mt-auto pt-4">
                                <div className="border-t border-gray-100 mb-3" />
                                <p className="text-sm text-[#172338]">
                                  Final price {totalFormatted}
                                  {perNightFormatted && nights ? ` · ${perNightFormatted} / night` : ""}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
