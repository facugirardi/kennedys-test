import {
  resolveMediaUrl,
  slugify,
  coerceExperienceMediaPath,
  normalizeExperienceGalleryRaw,
  heroImageDirectUrl,
  unwrapWsrvProxyUrl,
} from "@/lib/utils";

function experiencePathDedupeKey(path: string): string {
  return path.replace(/^\/+/, "").replace(/\\/g, "/").toLowerCase();
}

/** Hero y lightbox sin proxy wsrv con recorte fuerte — misma filosofía que `heroImageDirectUrl` en villas. */
function experienceDisplayUrl(fromResolve: string): string {
  if (!fromResolve || !fromResolve.trim()) return "";
  return heroImageDirectUrl(unwrapWsrvProxyUrl(fromResolve.trim())) || fromResolve;
}

/** Readable locality label from CMS `city` (e.g. mykonos → Mykonos). */
export function formatExperienceCityLabel(cityRaw: unknown): string {
  const s = typeof cityRaw === "string" ? cityRaw.trim() : "";
  if (!s) return "";
  return s
    .split(/[-_\s]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function parseCoordinate(raw: unknown): number | undefined {
  if (raw === null || raw === undefined || raw === "") return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const n = parseFloat(String(raw).trim());
  return Number.isFinite(n) ? n : undefined;
}

/** CMS related rows often omit id — resolve slug/title against listing payload so cards stay linkable. */
export function resolveRelatedExperienceId(
  r: Record<string, unknown> | undefined,
  all: unknown[]
): string | undefined {
  if (!r) return undefined;

  const slugHint =
    r.slug != null && String(r.slug).trim() ? String(r.slug).trim().toLowerCase() : "";
  if (slugHint && Array.isArray(all)) {
    const bySlug = all.find((e: unknown) => {
      const ex = e as { slug?: string };
      return String(ex?.slug ?? "")
        .trim()
        .toLowerCase() === slugHint;
    }) as { id?: unknown } | undefined;
    if (bySlug?.id != null && String(bySlug.id).trim()) return String(bySlug.id).trim();
  }

  const raw =
    r.id != null && String(r.id as string).trim()
      ? String(r.id).trim()
      : r.experienceId != null && String(r.experienceId as string).trim()
        ? String(r.experienceId).trim()
        : undefined;
  if (raw) return raw;

  const needle = String(r.title ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (!needle || !Array.isArray(all)) return undefined;
  const hit = all.find((e: unknown) => {
    const ex = e as { title?: string };
    const t = String(ex?.title ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
    return t === needle;
  }) as { id?: unknown } | undefined;
  return hit?.id != null && String(hit.id).trim() ? String(hit.id).trim() : undefined;
}

export function uniqResolvedGalleryUrls(urls: (string | undefined)[]): string[] {
  const out: string[] = [];
  for (const u of urls) {
    const t = (u ?? "").trim();
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
}

export type ExperienceRelatedCard = {
  title: string;
  img: string;
  id?: string;
  slug?: string;
  /** Segment for `/experiences/[segment]?experience=` when opening listing instead of UUID detail */
  listingCitySlug: string;
};

/** Last-resort placeholder content only when there is no API payload yet (initial shell). */
export const experienceViewFallbackMock = {
  experienceId: null as string | null,
  title: "",
  duration: "",
  hero: "",
  thumbs: ["", ""] as string[],
  description: "",
  price: "",
  priceSuffix: "",
  cityLabel: "",
  citySlug: "",
  locationSummary: "",
  locationCard: {
    line1: "",
    line2: "",
    line3: "",
  },
  mapDefault: {
    country: "",
    region: "",
    location: "",
    coordinates: { lat: 0, lng: 0 },
  },
  included: [] as { title: string; sub?: string[] }[],
  know: [] as string[],
  related: [] as ExperienceRelatedCard[],
  galleryViewerUrls: [] as string[],
  googleMapUrl: null as string | null,
  cancellationPolicy: null as string | null,
};

export type ExperienceViewModel = typeof experienceViewFallbackMock;

function citySlugFromExp(exp: any, segmentSlug: string): string {
  const fromCity =
    typeof exp?.city === "string" && exp.city.trim() ? slugify(exp.city) : "";
  if (fromCity) return fromCity;
  const seg = (segmentSlug || "").trim().toLowerCase();
  return seg ? slugify(seg) : "";
}

function buildRelatedCard(
  row: Record<string, unknown>,
  all: any[],
  anchorExp: any,
  segmentSlug: string
): ExperienceRelatedCard {
  const id = resolveRelatedExperienceId(row, all);
  const rowSlug =
    row.slug != null && String(row.slug).trim() ? String(row.slug).trim() : undefined;

  let matched: any | undefined;
  if (id) matched = all.find((e) => String(e?.id ?? "") === String(id));
  else if (rowSlug)
    matched = all.find(
      (e) =>
        String(e?.slug ?? "")
          .trim()
          .toLowerCase() === rowSlug.toLowerCase()
    );

  const slugOut =
    rowSlug ||
    (matched?.slug != null && String(matched.slug).trim()
      ? String(matched.slug).trim()
      : undefined);

  const citySource =
    (matched && typeof matched.city === "string" && matched.city.trim()
      ? matched.city
      : undefined) ||
    (typeof anchorExp?.city === "string" && anchorExp.city.trim()
      ? anchorExp.city
      : undefined) ||
    segmentSlug;

  const listingCitySlug = citySlugFromExp({ city: citySource }, segmentSlug);

  return {
    title: String(row.title ?? "") || "",
    img: resolveMediaUrl(String(row.img ?? "")) || "",
    id,
    slug: slugOut,
    listingCitySlug,
  };
}

export function mapExperienceToView(exp: any, all: any[], segmentSlug: string): ExperienceViewModel {
  const galleryPaths = normalizeExperienceGalleryRaw(exp?.gallery);

  const heroPathRaw =
    coerceExperienceMediaPath(exp?.heroImage) || galleryPaths[0] || "";

  const hero = experienceDisplayUrl(resolveMediaUrl(heroPathRaw) || "");

  const heroKey = experiencePathDedupeKey(heroPathRaw);
  const thumbPool = galleryPaths.filter((p) => experiencePathDedupeKey(p) !== heroKey);

  const thumbs: string[] = [
    experienceDisplayUrl(resolveMediaUrl(thumbPool[0] || "") || ""),
    experienceDisplayUrl(resolveMediaUrl(thumbPool[1] || "") || ""),
  ];

  const included = Array.isArray(exp?.included) ? exp.included : [];

  const know = Array.isArray(exp?.thingsToKnow) ? exp.thingsToKnow : [];

  const galleryViewerUrls = uniqResolvedGalleryUrls([
    hero,
    ...galleryPaths.map((path: string) => experienceDisplayUrl(resolveMediaUrl(path) || "")),
  ]);

  let related: ExperienceRelatedCard[];

  if (Array.isArray(exp?.relatedExperiences) && exp.relatedExperiences.length > 0) {
    related = exp.relatedExperiences.map((r: Record<string, unknown>) =>
      buildRelatedCard(r, all, exp, segmentSlug)
    );
  } else {
    const others = Array.isArray(all) ? all.filter((e) => e?.id !== exp?.id).slice(0, 4) : [];
    related = others.map((e: any) =>
      buildRelatedCard(
        {
          title: e?.title,
          img:
            coerceExperienceMediaPath(e?.heroImage) ||
            normalizeExperienceGalleryRaw(e?.gallery)[0] ||
            "",
          slug: e?.slug,
          id: e?.id,
        },
        all,
        exp,
        segmentSlug
      )
    );
  }

  let locationLine1 = typeof exp?.locationLine1 === "string" ? exp.locationLine1.trim() : "";
  let locationLine2 = typeof exp?.locationLine2 === "string" ? exp.locationLine2.trim() : "";
  let locationLine3 = typeof exp?.locationLine3 === "string" ? exp.locationLine3.trim() : "";

  const mapCountry = typeof exp?.mapCountry === "string" ? exp.mapCountry.trim() : "";
  const mapRegion = typeof exp?.mapRegion === "string" ? exp.mapRegion.trim() : "";
  const mapLocation = typeof exp?.mapLocation === "string" ? exp.mapLocation.trim() : "";

  if (!locationLine1 && !locationLine2 && !locationLine3) {
    if (mapLocation) {
      locationLine1 = mapLocation;
      locationLine2 = [mapRegion, mapCountry].filter(Boolean).join(", ");
    } else {
      const cityLbl = formatExperienceCityLabel(exp?.city);
      if (cityLbl) {
        locationLine1 = cityLbl;
        locationLine2 = [mapRegion, mapCountry].filter(Boolean).join(", ");
      }
    }
  }

  const latitude =
    parseCoordinate(exp?.latitude) ?? experienceViewFallbackMock.mapDefault.coordinates.lat;
  const longitude =
    parseCoordinate(exp?.longitude) ?? experienceViewFallbackMock.mapDefault.coordinates.lng;

  const mapDefault = {
    country: mapCountry,
    region: mapRegion,
    location: mapLocation || [locationLine1, locationLine2].filter(Boolean).join(", "),
    coordinates: {
      lat: latitude,
      lng: longitude,
    },
  };

  const googleMapUrl =
    typeof exp?.googleMapUrl === "string" && exp.googleMapUrl.trim()
      ? exp.googleMapUrl.trim()
      : null;

  const locationSummary =
    [locationLine1, locationLine2, locationLine3].filter(Boolean).join(", ") ||
    [mapLocation, mapRegion, mapCountry].filter(Boolean).join(", ") ||
    formatExperienceCityLabel(exp?.city);

  const cityLabel = formatExperienceCityLabel(exp?.city);
  const citySlug = citySlugFromExp(exp, segmentSlug);

  const experienceId =
    exp?.id != null && String(exp.id).trim() ? String(exp.id).trim() : null;

  return {
    ...experienceViewFallbackMock,
    experienceId,
    title: exp?.title ?? "",
    duration: exp?.duration ?? "",
    hero,
    thumbs,
    description: exp?.description ?? "",
    price: exp?.price ?? "",
    priceSuffix: exp?.priceSuffix ?? "",
    cityLabel,
    citySlug,
    locationSummary,
    locationCard: {
      line1: locationLine1,
      line2: locationLine2,
      line3: locationLine3,
    },
    mapDefault,
    included,
    know,
    related,
    galleryViewerUrls,
    googleMapUrl,
    cancellationPolicy:
      typeof exp?.cancellationPolicy === "string" && exp.cancellationPolicy.trim()
        ? exp.cancellationPolicy.trim()
        : null,
  };
}
