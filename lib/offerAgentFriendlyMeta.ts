import { stripHtmlToText, truncateMetaDescription } from "@/lib/seo/text";

const KENNEDYS_BRAND_RE =
  /Kennedy'?s\s+Group|kennedysgroup\.com|kennedys\.group/gi;

export function stripKennedysBrandFromText(text: string): string {
  return String(text || "")
    .replace(KENNEDYS_BRAND_RE, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function flattenOfferItems(offer: Record<string, unknown> | null | undefined): Record<string, unknown>[] {
  const sections = Array.isArray(offer?.propertiesToPresent)
    ? (offer.propertiesToPresent as { properties?: Record<string, unknown>[] }[])
    : [];
  return sections.flatMap((section) =>
    Array.isArray(section?.properties) ? section.properties : []
  );
}

export function pickAgentFriendlyItemTitle(item: Record<string, unknown>): string {
  const candidates = [
    item?.agentFriendlyName,
    item?.agent_friendly_name,
    item?.agentFriendly,
    item?.title,
    item?.name,
  ];
  for (const raw of candidates) {
    const value = stripKennedysBrandFromText(String(raw ?? "").trim());
    if (value) return value;
  }
  return "";
}

function pickItemSummaryText(item: Record<string, unknown>): string {
  const fields = [
    item?.openText2,
    item?.description,
    item?.openText3,
    item?.openText1,
    item?.summary,
  ];
  for (const raw of fields) {
    const text = stripKennedysBrandFromText(stripHtmlToText(String(raw ?? "")));
    if (text.length >= 20) return text;
  }
  for (const raw of fields) {
    const text = stripKennedysBrandFromText(stripHtmlToText(String(raw ?? "")));
    if (text) return text;
  }
  return "";
}

function cleanMetaField(value: unknown): string {
  return stripKennedysBrandFromText(stripHtmlToText(String(value ?? "")));
}

/** Título para preview / tab en ofertas unbranded (agents-portfolio). */
export function buildOfferAgentFriendlyTitle(offer: Record<string, unknown> | null | undefined): string {
  if (!offer) return "Property portfolio";

  const metaTitle = cleanMetaField(offer.metaTitle ?? offer.meta_title);
  if (metaTitle) return metaTitle;

  const welcomeTitle = cleanMetaField(offer.welcomeTitle);
  if (welcomeTitle) return welcomeTitle;

  const offerTitle = cleanMetaField(offer.title);
  if (offerTitle) return offerTitle;

  const items = flattenOfferItems(offer);
  const names = items.map(pickAgentFriendlyItemTitle).filter(Boolean);
  if (names.length === 1) return names[0];
  if (names.length > 1) return `${names[0]} & ${names.length - 1} more`;

  return "Curated portfolio";
}

/** Descripción para meta / OG en ofertas unbranded. */
export function buildOfferAgentFriendlyDescription(
  offer: Record<string, unknown> | null | undefined
): string {
  if (!offer) return "Curated selection of properties and experiences.";

  const metaDesc = cleanMetaField(offer.metaDescription ?? offer.meta_description);
  if (metaDesc) return truncateMetaDescription(metaDesc, 160);

  const items = flattenOfferItems(offer);
  const parts: string[] = [];

  for (const item of items.slice(0, 4)) {
    const name = pickAgentFriendlyItemTitle(item);
    const summary = pickItemSummaryText(item);
    if (name && summary) {
      parts.push(`${name}: ${truncateMetaDescription(summary, 72)}`);
    } else if (name) {
      parts.push(name);
    } else if (summary) {
      parts.push(truncateMetaDescription(summary, 80));
    }
  }

  if (parts.length > 0) {
    return truncateMetaDescription(parts.join(" · "), 160);
  }

  const body = cleanMetaField(offer.description);
  if (body) return truncateMetaDescription(body, 160);

  const names = items.map(pickAgentFriendlyItemTitle).filter(Boolean);
  if (names.length > 0) {
    return truncateMetaDescription(`Selection including ${names.slice(0, 5).join(", ")}.`, 160);
  }

  return "Curated selection of properties and experiences.";
}

export function buildConciergeAgentFriendlyTitle(service: {
  name?: string | null;
}): string {
  const name = stripKennedysBrandFromText(String(service?.name ?? "").trim());
  return name || "Concierge service";
}

export function buildConciergeAgentFriendlyDescription(service: {
  name?: string | null;
  description?: string | null;
  location?: string | null;
  region?: string | null;
}): string {
  const desc = stripKennedysBrandFromText(stripHtmlToText(String(service?.description ?? "")));
  if (desc) return truncateMetaDescription(desc, 160);

  const name = stripKennedysBrandFromText(String(service?.name ?? "").trim());
  const location = stripKennedysBrandFromText(
    String(service?.location ?? service?.region ?? "").trim()
  );
  if (name && location) return truncateMetaDescription(`${name} — ${location}.`, 160);
  if (name) return truncateMetaDescription(`${name}.`, 160);

  return "Luxury concierge service details.";
}

export function buildShareOgImageUrl(
  origin: string,
  slug: string,
  options?: { unbranded?: boolean }
): string {
  const base = String(origin || "").replace(/\/+$/, "");
  const params = new URLSearchParams({ slug });
  if (options?.unbranded) params.set("unbranded", "1");
  return `${base}/api/share-og-image?${params.toString()}`;
}
