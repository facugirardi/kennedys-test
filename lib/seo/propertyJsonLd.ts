import { absoluteFromPathOrUrl } from "./config";

type PropertyLike = {
  id?: string;
  title?: string;
  summary?: string;
  // Loose typing: app `Property.description` allows null fields on nested keys
  description?: Record<string, unknown> | null;
  sale_price?: number | null;
  price_per_night?: number | null;
  rental?: boolean | null;
  category?: string | null;
  visibleLocation?: string | null;
  location?: string | null;
  region?: string | null;
  country?: string | null;
  images?: Array<{ url?: string; urlImage?: string; isPrimary?: boolean }>;
};

function primaryImageUrl(p: PropertyLike): string | undefined {
  const imgs = Array.isArray(p.images) ? p.images : [];
  const primary = imgs.find((i) => i?.isPrimary) || imgs[0];
  const u = primary?.urlImage || primary?.url;
  return u ? absoluteFromPathOrUrl(String(u)) : undefined;
}

function locationLine(p: PropertyLike): string {
  return [p.visibleLocation, p.location, p.region, p.country]
    .filter(Boolean)
    .join(", ");
}

export function buildPropertyJsonLd(
  property: unknown,
  pageUrl: string
): Record<string, unknown> | null {
  if (!property || typeof property !== "object" || !("id" in property) || !property.id) {
    return null;
  }
  const p = property as PropertyLike;

  const isSale = p.rental === false || p.category === "real-estate";
  const name = (p.title && String(p.title).trim()) || "Luxury property";
  const d = p.description;
  const shortDesc =
    d && typeof d === "object" && "shortDescription" in d
      ? String((d as { shortDescription?: unknown }).shortDescription ?? "").trim()
      : "";
  const longDesc =
    d && typeof d === "object" && "longDescription" in d
      ? String((d as { longDescription?: unknown }).longDescription ?? "").trim()
      : "";
  const desc = (typeof p.summary === "string" && p.summary) || shortDesc || longDesc || "";
  const image = primaryImageUrl(p);
  const loc = locationLine(p);

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: desc || undefined,
    url: pageUrl,
  };

  if (image) base.image = [image];
  if (loc) {
    base.address = {
      "@type": "PostalAddress",
      addressLocality: loc,
    };
  }

  if (isSale && p.sale_price != null && Number(p.sale_price) > 0) {
    base.offers = {
      "@type": "Offer",
      price: String(p.sale_price),
      priceCurrency: "EUR",
      availability: "https://schema.org/ForSale",
    };
  } else if (
    !isSale &&
    p.price_per_night != null &&
    Number(p.price_per_night) > 0
  ) {
    base.offers = {
      "@type": "Offer",
      price: String(p.price_per_night),
      priceCurrency: "EUR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: String(p.price_per_night),
        priceCurrency: "EUR",
        unitCode: "DAY",
      },
    };
  }

  return base;
}
