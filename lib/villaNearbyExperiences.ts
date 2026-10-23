import { resolveMediaUrl, coerceExperienceMediaPath, normalizeExperienceGalleryRaw } from '@/lib/utils';
import { kennedysTreeLeafMatchingSlug } from '@/lib/kennedysLocationFilterTree';
import { getExperiencesByCity, getActiveExperiences, getExperienceById } from '@/lib/api/experiences';

export type VillaNearbyExperienceCard = {
  id: string | null;
  title: string;
  imageSrc: string;
  imageAlt: string;
  highlight?: boolean;
};

/**
 * Same rules as kennedys-api `experienceService.slugifyLocationSegment` so `/experiences/city/:city` matches CMS cities.
 */
function slugifyLocationSegment(raw: string): string {
  return raw
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * "Mykonos Psarou" / "mykonos-psarou" → experiencias por ciudad (`mykonos`), no barrio + ciudad.
 * Prefijo más largo que coincide con una hoja del árbol Kennedys; si no hay match, primera parte antes de `-`.
 */
function primaryLocalitySlugForExperiences(fullSlug: string): string {
  const s = fullSlug.trim().toLowerCase();
  if (!s) return '';
  if (kennedysTreeLeafMatchingSlug(s)) return s;
  const parts = s.split('-').filter(Boolean);
  if (parts.length <= 1) return s;
  for (let i = parts.length; i >= 1; i--) {
    const candidate = parts.slice(0, i).join('-');
    if (kennedysTreeLeafMatchingSlug(candidate)) return candidate;
  }
  return parts[0];
}

/**
 * "Paradisia, Mykonos, Greece" → primer segmento (con reglas de prefijo) que sea hoja del
 * árbol Kennedys (`mykonos`), no el barrio. Sin match: ''.
 */
function treeMatchedSlugFromLocation(raw: string): string {
  const segments = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const segment of segments) {
    const slug = primaryLocalitySlugForExperiences(slugifyLocationSegment(segment));
    if (slug && kennedysTreeLeafMatchingSlug(slug)) return slug;
  }
  return '';
}

function propertyLocationCandidates(property: Record<string, unknown> | null | undefined): string[] {
  if (!property) return [];
  // Barrio suele venir en visibleLocation/area y la isla/ciudad en region (p.ej. Marevo:
  // visibleLocation "Paradisia", region "Mykonos") → probar todos hasta matchear el árbol.
  return [
    property.experienceCity,
    property.city,
    property.visibleLocation,
    property.location,
    property.region,
    property.area,
  ].filter((v): v is string => typeof v === 'string' && v.trim() !== '');
}

export function experienceCitySlugFromProperty(property: Record<string, unknown> | null | undefined): string {
  const candidates = propertyLocationCandidates(property);
  for (const candidate of candidates) {
    const matched = treeMatchedSlugFromLocation(candidate);
    if (matched) return matched;
  }
  const first = candidates[0];
  if (!first) return '';
  const firstSegment = first.split(',')[0]?.trim() || first;
  return primaryLocalitySlugForExperiences(slugifyLocationSegment(firstSegment));
}

/**
 * True only when the property's own location doesn't match any Kennedys destination
 * (e.g. a Bahamas villa) — in that case we must not fall back to unrelated global
 * "active experiences" content, since it would show experiences from a different destination.
 */
function propertyLocationMatchesKnownDestination(property: Record<string, unknown> | null | undefined): boolean {
  return propertyLocationCandidates(property).some((candidate) => Boolean(treeMatchedSlugFromLocation(candidate)));
}

/** Normalize `{ success, data }` from fetchAPI (data may be null on network errors). */
function experienceRowsFromApiResult(r: unknown): Record<string, unknown>[] {
  if (r == null || typeof r !== 'object') return [];
  const o = r as Record<string, unknown>;
  if (o.success !== true) return [];
  const d = o.data;
  if (Array.isArray(d)) {
    return d.filter((x) => x != null && typeof x === 'object') as Record<string, unknown>[];
  }
  if (d != null && typeof d === 'object' && Array.isArray((d as Record<string, unknown>).experiences)) {
    const inner = (d as Record<string, unknown>).experiences;
    return (inner as unknown[]).filter((x) => x != null && typeof x === 'object') as Record<string, unknown>[];
  }
  return [];
}

function pickHeroPath(exp: Record<string, unknown>): string {
  const hero = exp.heroImage ?? exp.hero_image;
  const galleryPaths = normalizeExperienceGalleryRaw(exp?.gallery);
  const raw = coerceExperienceMediaPath(hero) || galleryPaths[0] || '';
  return raw;
}

function mapApiExperienceToCard(exp: Record<string, unknown>, index: number): VillaNearbyExperienceCard {
  const raw = pickHeroPath(exp);
  const resolved = raw ? resolveMediaUrl(raw) : '';
  const title = typeof exp?.title === 'string' && exp.title.trim() ? exp.title : '';
  return {
    id: exp?.id != null ? String(exp.id) : null,
    title,
    imageSrc: resolved && resolved.trim() !== '' ? resolved : '',
    imageAlt: title,
    highlight: index === 2,
  };
}

function buildCardsFromApiRows(rows: Record<string, unknown>[]): VillaNearbyExperienceCard[] {
  return rows.slice(0, 4).map((exp, i) => mapApiExperienceToCard(exp, i));
}

/** Normalize a single-record `{ success, data }` result (from `getExperienceById`). */
function experienceRowFromApiResult(r: unknown): Record<string, unknown> | null {
  if (r == null || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  if (o.success !== true) return null;
  const d = o.data;
  return d != null && typeof d === 'object' ? (d as Record<string, unknown>) : null;
}

/** Manual override set by admins on the villa's "Villa Page" tab; order is preserved. */
function featuredExperienceIdsFromProperty(property: Record<string, unknown> | null | undefined): string[] {
  const description = property?.description as Record<string, unknown> | undefined;
  const theVilla = description?.theVilla as Record<string, unknown> | undefined;
  const ids = theVilla?.featuredExperienceIds;
  if (!Array.isArray(ids)) return [];
  return ids.filter((id): id is string => typeof id === 'string' && id.trim() !== '').slice(0, 4);
}

async function fetchFeaturedExperienceRows(ids: string[]): Promise<Record<string, unknown>[]> {
  const results = await Promise.all(
    ids.map((id) => getExperienceById(id).then(experienceRowFromApiResult).catch(() => null))
  );
  return results.filter((r): r is Record<string, unknown> => r != null);
}

export async function fetchVillaNearbyExperiencesPreview(
  property: Record<string, unknown> | null | undefined
): Promise<{ cards: VillaNearbyExperienceCard[]; experienceCitySlug: string }> {
  const experienceCitySlug = experienceCitySlugFromProperty(property);

  const featuredIds = featuredExperienceIdsFromProperty(property);
  if (featuredIds.length > 0) {
    const featuredRows = await fetchFeaturedExperienceRows(featuredIds);
    if (featuredRows.length > 0) {
      return { cards: buildCardsFromApiRows(featuredRows), experienceCitySlug };
    }
  }

  let rows: Record<string, unknown>[] = [];
  if (experienceCitySlug) {
    rows = experienceRowsFromApiResult(await getExperiencesByCity(experienceCitySlug));
  }
  const hasUnrecognizedLocation =
    propertyLocationCandidates(property).length > 0 && !propertyLocationMatchesKnownDestination(property);
  if (rows.length === 0 && !hasUnrecognizedLocation) {
    rows = experienceRowsFromApiResult(await getActiveExperiences());
  }

  return {
    cards: buildCardsFromApiRows(rows),
    experienceCitySlug,
  };
}
