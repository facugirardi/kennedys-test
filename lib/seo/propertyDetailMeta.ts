import type { Property } from "@/interfaces/property";
import { joinUniqueLocationParts, resolveMediaUrl } from "@/lib/utils";
import { SITE_NAME } from "./config";
import { stripHtmlToText, truncateMetaDescription } from "./text";

function pickPropertyRecordMeta(p: Property): {
  metaTitle: string | null;
  metaDescription: string | null;
} {
  const raw = p as unknown as Record<string, unknown>;
  const mt = raw.metaTitle ?? raw.meta_title;
  const md = raw.metaDescription ?? raw.meta_description;
  return {
    metaTitle: typeof mt === "string" && mt.trim() ? mt.trim() : null,
    metaDescription: typeof md === "string" && md.trim() ? md.trim() : null,
  };
}

/**
 * SSR meta for `_app` Head (OG/Twitter), aligned with villa/real-estate detail `SeoHead`.
 */
export function buildPropertyDetailInitialSeoMeta(
  data: Property,
  opts: {
    siteOrigin: string;
    isRealEstate: boolean;
    /** Property id for `/api/property-og-image` */
    idForOg: string;
  }
): { title: string; description: string; imageUrl: string | null } {
  const { metaTitle, metaDescription } = pickPropertyRecordMeta(data);
  const titleLine =
    String(data?.title ?? (data as any)?.alternativeTitle ?? "").trim() || "";
  const locationLine =
    joinUniqueLocationParts(data.location, data.region, data.country) ||
    joinUniqueLocationParts(data.visibleLocation, data.location, data.country) ||
    "";
  const title =
    metaTitle ||
    [titleLine, locationLine, SITE_NAME].filter(Boolean).join(" | ") ||
    SITE_NAME;

  let description = "";
  if (metaDescription) {
    const cleaned = stripHtmlToText(metaDescription).replace(/\s+/g, " ").trim().slice(0, 160);
    if (cleaned) description = truncateMetaDescription(cleaned, 160);
  }
  if (!description) {
    const d = data.description;
    const isRealEstate = opts.isRealEstate;
    const baseDesc = isRealEstate
      ? String(
          data.summary ||
            d?.shortDescription ||
            d?.caption ||
            ""
        )
      : String(
          d?.longDescription ||
            data.summary ||
            d?.shortDescription ||
            d?.caption ||
            ""
        );
    const raw = stripHtmlToText(baseDesc);
    if (raw.length > 0) description = truncateMetaDescription(raw);
  }
  if (!description) {
    description = [titleLine, locationLine].filter(Boolean).join(", ") || title;
  }

  const origin = opts.siteOrigin.replace(/\/+$/, "");
  const imageUrl = origin
    ? `${origin}/api/property-og-image?identifier=${encodeURIComponent(opts.idForOg)}`
    : resolveMediaUrl(
        String(
          data?.images?.[0]?.urlImage ||
            data?.images?.[0]?.url ||
            (data as any)?.mainImage ||
            ""
        )
      ) || null;

  return { title, description, imageUrl };
}
