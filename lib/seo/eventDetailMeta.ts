import { resolveMediaUrl, slugify } from "@/lib/utils";
import { SITE_NAME } from "./config";
import { stripHtmlToText, truncateMetaDescription } from "./text";

function eventNameStr(ev: Record<string, unknown>): string | null {
  if (typeof ev.name === "string" && ev.name.trim()) return ev.name.trim();
  return null;
}

export function buildEventDetailInitialSeoMeta(eventData: Record<string, unknown>): {
  title: string;
  description: string;
  imageUrl: string | null;
} {
  const mt = eventData.metaTitle ?? eventData.meta_title;
  const md = eventData.metaDescription ?? eventData.meta_description;
  const evName = eventNameStr(eventData) || "";
  const title =
    typeof mt === "string" && mt.trim()
      ? mt.trim()
      : evName
        ? `${evName} | ${SITE_NAME}`
        : `Events | ${SITE_NAME}`;

  let description = "";
  if (typeof md === "string" && md.trim()) {
    description = truncateMetaDescription(
      stripHtmlToText(md).replace(/\s+/g, " ").trim().slice(0, 160),
      160
    );
  }
  if (!description && eventData.summary != null && String(eventData.summary).trim()) {
    description = truncateMetaDescription(stripHtmlToText(String(eventData.summary)));
  }
  if (!description && evName) {
    description = evName;
  }

  const imgRaw =
    typeof eventData.image === "string" && eventData.image.trim()
      ? resolveMediaUrl(eventData.image)
      : "";
  return {
    title,
    description: description || title,
    imageUrl: imgRaw || null,
  };
}

/** Stable public path for event detail (slug by name, else id). */
export function buildEventListingPath(eventData: Record<string, unknown>, routeParam: string): string {
  const n = eventNameStr(eventData);
  if (n) {
    const s = slugify(n);
    if (s) return `/events/${encodeURIComponent(s)}`;
  }
  if (eventData.id != null && String(eventData.id).trim()) {
    return `/events/${encodeURIComponent(String(eventData.id))}`;
  }
  if (routeParam.trim()) {
    return `/events/${encodeURIComponent(routeParam.trim())}`;
  }
  return "/events";
}
