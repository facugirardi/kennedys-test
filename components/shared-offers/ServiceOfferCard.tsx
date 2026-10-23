"use client";

import React, { useState } from "react";
import { MdOutlineCalendarMonth as CalendarIcon } from "react-icons/md";
import { ChevronRight } from "lucide-react";
import { resolveMediaUrl, parseOfferMoney, isOfferPriceNote, positionStyle } from "@/lib/utils";
import { sanitizeCmsHtml } from "@/lib/sanitizeCmsHtml";
import {
  OFFER_RICH_TEXT_CLASS,
  toOfferRichTextHtml,
} from "@/lib/offerRichTextHtml";
import {
  formatBrochureViewButtonLabel,
  resolveBrochureDisplayName,
} from "@/lib/brochureDownload";

interface Props {
  service: any;
  showPrice?: boolean;
  currency?: string;
}

const formatPrice = (value: any, currency: string = "EUR"): string => {
  if (value === null || value === undefined) return "—";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (!Number.isFinite(numValue)) return "—";
  const sym = currency === "USD" ? "$" : "€";
  return `${sym}${Number(numValue).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const formatPriceOrText = (value: any, currency: string = "EUR"): string => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "—";
    const numeric = parseOfferMoney(trimmed);
    if (numeric <= 0 && /[a-zA-Z]/.test(trimmed)) return trimmed;
    if (numeric <= 0) return "—";
    return formatPrice(numeric, currency);
  }
  return formatPrice(parseOfferMoney(value), currency);
};

/** Parsea YYYY-MM-DD como fecha local para evitar desfase de timezone */
const formatDateRangeLocal = (startDate?: string, endDate?: string): string | null => {
  if (!startDate || !endDate) return null;
  const parseLocal = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  try {
    const s = parseLocal(startDate);
    const e = parseLocal(endDate);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
    const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const eStr = e.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return sStr === eStr ? sStr : `${sStr} - ${eStr}`;
  } catch {
    return null;
  }
};

export default function ServiceOfferCard({ service, showPrice = true, currency = "EUR" }: Props) {
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const primaryImage =
    resolveMediaUrl(
      service?.imageOverrideUrl ||
        service?.images?.[0]?.urlImage ||
        service?.images?.[0]?.url ||
        service?.mainImage ||
        service?.image
    ) || "/placeholder-image.png";
  // `imageOverrideUrl`/`imagePositionOverride` are scoped to this one offer and take priority
  // when set; otherwise fall back to the service's own (shared) photo/position, which applies
  // to every offer using it.
  const primaryImagePosition = service?.imagePositionOverride || service?.images?.[0]?.position;

  const rawPriceValue =
    service?.finalPrice ??
    service?.officialPrice ??
    service?.grossRate ??
    (service?.price_per_night && service?.nights
      ? Number(service.price_per_night) * Number(service.nights || service.days || 1)
      : service?.price_per_night) ??
    0;

  const totalPrice = parseOfferMoney(rawPriceValue);
  // Free text (e.g. "Price on request") typed into the same Total field as the number —
  // keep it in the big price slot below instead of falling back to the smaller note style.
  const priceIsFreeText =
    typeof rawPriceValue === "string" &&
    totalPrice <= 0 &&
    /[a-zA-Z]/.test(rawPriceValue.trim());
  // The admin's "Total" field is now a rich text editor (size/bold/bullets/€ sign, no
  // color/background) — when it holds real markup, or plain free text with line breaks,
  // we render it via toOfferRichTextHtml (which turns \n into <br/>) instead of dumping
  // it into a plain <p> that collapses newlines.
  const hasRichPriceFormatting =
    typeof rawPriceValue === "string" &&
    (/<\/?[a-z][\s\S]*>/i.test(rawPriceValue) ||
      /&lt;\/?[a-z]/i.test(rawPriceValue) ||
      priceIsFreeText);
  const richPriceHtml = hasRichPriceFormatting
    ? sanitizeCmsHtml(toOfferRichTextHtml(rawPriceValue as string))
    : "";

  const nights = service?.nights ?? service?.days ?? 0;

  const contentBlocks = Array.isArray(service?.contentBlocks) ? service.contentBlocks : [];
  const hasVisibleContentBlocks = contentBlocks.some(
    (block: { type?: string; content?: string }) =>
      block?.type === "text" && block.content && stripHtml(block.content)
  );

  /** New services default to priceNoteOnly=true (unified style); existing offers without
   *  this flag keep the classic side-by-side note + big price number display. */
  const priceNoteOnly = Boolean(service?.priceNoteOnly);
  const open1Raw = (service?.openText1 ?? "").trim();
  const open1Plain = stripHtml(toOfferRichTextHtml(open1Raw) || open1Raw);
  const open1 = priceNoteOnly
    ? toOfferRichTextHtml(open1Raw)
    : (isOfferPriceNote(open1Plain) ? toOfferRichTextHtml(open1Raw) : "");
  const open2Raw =
    String(service?.openText2 ?? "").trim() ||
    String(service?.serviceDescription ?? "").trim();
  const open3Raw = String(service?.openText3 ?? "").trim();
  const open2Plain = stripHtml(toOfferRichTextHtml(open2Raw) || open2Raw);
  const open3Plain = stripHtml(toOfferRichTextHtml(open3Raw) || open3Raw);
  const open2Html = toOfferRichTextHtml(open2Raw);
  const open3Html = toOfferRichTextHtml(open3Raw);
  const showOpenText3 = Boolean(open3Plain) && open2Plain !== open3Plain;

  const displayTitle =
    service?.title ||
    service?.name ||
    open2Plain ||
    "Service";

  const propCurrency = service?.currency || currency;
  const hasPrice = totalPrice > 0 || priceIsFreeText || hasRichPriceFormatting;
  const priceDisplayText =
    hasPrice && !hasRichPriceFormatting ? formatPriceOrText(rawPriceValue, propCurrency) : "";
  const priceDisplayLength = hasRichPriceFormatting
    ? stripHtml(richPriceHtml).length
    : priceDisplayText.length;
  const isShortPriceText = priceDisplayLength > 0 && priceDisplayLength <= 9;
  const dateStr = formatDateRangeLocal(service?.startDate, service?.endDate);

  const brochureUrl = resolveMediaUrl(
    service?.brochureLink || service?.brochureUrl || service?.brochure?.url
  );
  const brochureLabel = formatBrochureViewButtonLabel(resolveBrochureDisplayName(service));
  const websiteUrl =
    typeof service?.websiteLink === "string" ? service.websiteLink.trim() : "";

  return (
    <>
      <div className="w-full bg-white border border-gray-200 grid grid-rows-subgrid row-span-4 service-card hover:border-gray-300 transition-colors">
        {/* Fila 1: Imagen */}
        <div className="relative overflow-hidden">
          <img
            className="w-full h-[200px] sm:h-[260px] object-cover hover:scale-105 transition-transform duration-500"
            src={primaryImage}
            alt={displayTitle}
            style={positionStyle(primaryImagePosition)}
          />
          {(dateStr || service?.label) && (
            <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
              {dateStr && (
                <div className="bg-white px-3 py-1.5">
                  <p className="flex items-center gap-2 text-[#172338] text-xs">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3.5 w-3.5 text-[#D99330]" />
                      {dateStr}
                    </span>
                    {nights ? <span className="font-normal border-l border-gray-200 pl-2">{nights} Days</span> : null}
                  </p>
                </div>
              )}
              {service?.label && (
                <div className="bg-white px-3 py-1.5">
                  <p className="font-haas text-xs text-[#172338] leading-snug">{service.label}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fila 2: Titulo + descripcion */}
        <div className="px-5 pt-4 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-5">
            <h2 className="font-gtsuper-ds text-xl font-light text-[#172338] leading-snug flex-1">
              {displayTitle}
            </h2>
            {service?.policies && stripHtml(service.policies).trim() && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowPoliciesModal(true); }}
                className="shrink-0 border border-[#172338] px-2.5 py-1 font-haas text-xs text-[#172338] hover:bg-[#172338] hover:text-white transition-colors mt-0.5"
              >
                Policies
              </button>
            )}
          </div>

          {open2Html && !hasVisibleContentBlocks && (!open3Html || open2Plain !== open3Plain) && (
            <div
              className={`${OFFER_RICH_TEXT_CLASS} mt-1`}
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(open2Html) }}
            />
          )}
          {contentBlocks.map((block: { id?: string; type?: string; content?: string }, idx: number) => {
            if (block?.type !== "text" || !block.content || !stripHtml(block.content)) return null;
            return (
              <div
                key={block.id ?? `content-block-${idx}`}
                className={`${OFFER_RICH_TEXT_CLASS} mt-2`}
                dangerouslySetInnerHTML={{
                  __html: sanitizeCmsHtml(toOfferRichTextHtml(block.content)),
                }}
              />
            );
          })}
          {showOpenText3 && open3Html && (
            <div
              className={OFFER_RICH_TEXT_CLASS}
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(open3Html) }}
            />
          )}
        </div>

        {/* Fila 3: Precio (linea divisoria alineada con la fila 3 de las cards vecinas) */}
        <div className="px-5">
          {showPrice && priceNoteOnly && open1 && (
            <div className="pt-2">
              <div className="border-t border-gray-100 mb-4" />
              <div
                className={OFFER_RICH_TEXT_CLASS}
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(open1) }}
              />
            </div>
          )}
          {showPrice && !priceNoteOnly && (open1 || hasPrice) && (
            <div className="pt-2">
              <div className="border-t border-gray-100 mb-4" />
              {isShortPriceText ? (
                <div className="flex justify-between items-baseline gap-2">
                  {open1 && (
                    <div
                      className="font-haas text-sm text-[#506A70] [&_p]:m-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:m-0"
                      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(open1) }}
                    />
                  )}
                  {hasRichPriceFormatting ? (
                    <div
                      className="font-haas text-lg font-normal text-[#D99330] leading-none shrink-0 [&_p]:m-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:m-0"
                      onClick={(e) => e.stopPropagation()}
                      dangerouslySetInnerHTML={{ __html: richPriceHtml }}
                    />
                  ) : (
                    <p className="font-haas text-lg font-normal text-[#D99330] leading-none shrink-0">
                      {priceDisplayText}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {hasPrice && (
                    hasRichPriceFormatting ? (
                      <div
                        className="font-haas text-lg font-normal text-[#D99330] leading-none [&_p]:m-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:m-0"
                        onClick={(e) => e.stopPropagation()}
                        dangerouslySetInnerHTML={{ __html: richPriceHtml }}
                      />
                    ) : (
                      <p className="font-haas text-lg font-normal text-[#D99330] leading-none">
                        {priceDisplayText}
                      </p>
                    )
                  )}
                  {open1 && (
                    <div
                      className="font-haas text-sm text-[#506A70] [&_p]:m-0 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:m-0"
                      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(open1) }}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Fila 4: Brochure / Website */}
        <div className="px-5 pb-6">
          {(brochureUrl || websiteUrl) && (
            <div className="pt-4 border-t border-gray-100 flex flex-row gap-2">
              {brochureUrl && (
                <a
                  href={brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-none bg-[#28F6EA] hover:bg-[#28F6EA]/90 transition-colors font-haas text-[15px] font-normal text-[#172338]"
                >
                  {brochureLabel}
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 min-w-0 h-12 flex items-center justify-center gap-2 rounded-none border border-[#172338] hover:bg-[#172338] hover:text-white transition-colors font-haas text-[15px] font-normal text-[#172338]"
                >
                  View Website
                  <ChevronRight className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {showPoliciesModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPoliciesModal(false)}
        >
          <div
            className="bg-white w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl mt-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-t-[3px] border-t-[#D99330] px-7 pt-6 pb-5 flex items-start justify-between gap-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="font-haas text-[10px] tracking-[0.2em] uppercase text-[#D99330] mb-1">Service</p>
                <h3 className="font-gtsuper-ds text-2xl font-light text-[#172338] leading-snug">{displayTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPoliciesModal(false)}
                className="shrink-0 mt-1 w-8 h-8 flex items-center justify-center text-[#506A70] hover:text-[#172338] hover:bg-gray-100 transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-6 overflow-y-auto flex-1">
              <p className="font-haas text-[10px] tracking-[0.2em] uppercase text-[#D99330] mb-4">Policies</p>
              <div
                className="font-haas text-sm text-[#172338] leading-[1.85] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: sanitizeCmsHtml(toOfferRichTextHtml(service?.policies?.trim() || "") || "No policies specified."),
                }}
              />
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 flex-shrink-0 flex justify-center">
              <button
                type="button"
                onClick={() => setShowPoliciesModal(false)}
                className="font-haas text-xs tracking-widest uppercase text-[#172338] border border-[#172338] px-5 py-2.5 hover:bg-[#172338] hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
