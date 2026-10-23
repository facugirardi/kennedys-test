import VillaDetailsPage from "./index";
import type { GetServerSidePropsContext } from "next";
import { getAllProperties, getProperty, getPropertyBySlug, getPropertyByPreviousSlug } from "@/lib/api/properties";
import { getPageBlocksData } from "@/lib/utils/contentBlocks";
import { matchesRentalRoute, matchesRentalName, buildRentalDetailPath } from "@/lib/rentalRoute";
import { fetchVillaNearbyExperiencesPreview } from "@/lib/villaNearbyExperiences";
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config";
import { buildPropertyDetailInitialSeoMeta } from "@/lib/seo/propertyDetailMeta";
import type { Property } from "@/interfaces/property";

// Keep in sync with `pages/villas/[id]/index.tsx` — nearby experiences strip on villa detail
const FEATURE_VILLA_NEARBY_EXPERIENCES_SECTION = false;

async function resolveRentalByRoute(region: string, name: string) {
  const decodedRegion = decodeURIComponent(region).trim();
  const decodedName = decodeURIComponent(name).trim();

  // Fast path: resolver por slug/identifier directo y validar que coincida con la ruta SEO.
  try {
    const byIdentifier: any = await getPropertyBySlug(decodedName);
    const data = byIdentifier?.data ?? null;
    const isRental = data && !(data?.rental === false || data?.category === "real-estate");
    if (isRental && matchesRentalRoute(data, decodedRegion, decodedName)) return data;
  } catch {
    // no-op
  }

  // Fast path 2: buscar por texto para evitar escanear demasiadas páginas en propiedades nuevas.
  try {
    const bySearch: any = await getAllProperties({
      rental: true,
      includeDisabled: false,
      searchQuery: decodedName,
      pageSize: 100,
    });
    const searchPayload = bySearch?.data ?? bySearch;
    const searchItems = Array.isArray(searchPayload?.items) ? searchPayload.items : (Array.isArray(searchPayload) ? searchPayload : []);
    const searchMatched = searchItems.find((p: any) => matchesRentalRoute(p, decodedRegion, name));
    if (searchMatched) return searchMatched;
  } catch {
    // no-op
  }

  const maxPages = 100;

  // Region-driven lookup without extra filters to avoid strict DB matching issues
  for (let page = 1; page <= maxPages; page++) {
    const res: any = await getAllProperties({
      rental: true,
      includeDisabled: false,
      page,
      pageSize: 100,
    });
    const payload = res?.data ?? res;
    const items = Array.isArray(payload?.items) ? payload.items : (Array.isArray(payload) ? payload : []);
    if (!items.length) break;
    const matched = items.find((p: any) => matchesRentalRoute(p, decodedRegion, name));
    if (matched) return matched;
    if (items.length < 100) break;
  }
  return null;
}

/**
 * Last-resort lookup when the URL doesn't match any property's *current* region+name — covers a
 * villa that was renamed (title or region edited in the CMS) after its old URL was already
 * crawled/ranked by Google. Only the `name` segment is checked, region-agnostic, because a
 * region-only rename (e.g. "Mykonos, Greece" -> "Mykonos") still leaves the name slug intact.
 * Callers must redirect to the property's *current* canonical path, not render under the stale
 * URL — this exists purely to avoid a 404 on a link Google (or someone's bookmark) still has.
 */
async function resolveRenamedRental(name: string) {
  const decodedName = decodeURIComponent(name).trim();
  if (!decodedName) return null;

  const isUsableRental = (data: any) =>
    Boolean(data) && !(data?.rental === false || data?.category === "real-estate");

  // Region changed, title/name slug still current (e.g. Nemesis Estate).
  try {
    const byIdentifier: any = await getPropertyBySlug(decodedName);
    const data = byIdentifier?.data ?? null;
    if (isUsableRental(data) && matchesRentalName(data, decodedName)) return data;
  } catch {
    // no-op
  }

  // Title changed; the old title-derived slug was recorded in `previousSlugs` (e.g. Villa Breeze).
  try {
    const byPreviousSlug: any = await getPropertyByPreviousSlug(decodedName);
    const data = byPreviousSlug?.data ?? null;
    if (isUsableRental(data)) return data;
  } catch {
    // no-op
  }

  return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string; name: string }>) {
  const region = context.params?.id;
  const name = context.params?.name;
  if (!region || !name) {
    return { notFound: true };
  }

  const siteOrigin = getPublicSiteOriginFromRequest(context.req);

  try {
    const matched = await resolveRentalByRoute(region, name);
    if (!matched?.id) {
      const renamed = await resolveRenamedRental(name);
      if (renamed?.id) {
        const canonicalPath = buildRentalDetailPath(renamed);
        if (canonicalPath && canonicalPath !== context.resolvedUrl) {
          return { redirect: { destination: canonicalPath, permanent: true } };
        }
      }
      return { notFound: true };
    }

    const [propertyRes, blocksVilla] = await Promise.all([
      getProperty(matched.id),
      getPageBlocksData("villa-detail"),
    ]);

    const data = propertyRes?.data ?? propertyRes;
    if (!data) return { notFound: true };

    const initialVillaNearby = FEATURE_VILLA_NEARBY_EXPERIENCES_SECTION
      ? await fetchVillaNearbyExperiencesPreview(data as unknown as Record<string, unknown>)
      : null;

    return {
      props: {
        initialProperty: data,
        initialPageBlocks: blocksVilla,
        initialVillaNearby,
        siteOrigin,
        initialSeoMeta: buildPropertyDetailInitialSeoMeta(data as Property, {
          siteOrigin,
          isRealEstate: false,
          idForOg: String(data?.id ?? matched.id),
        }),
      },
    };
  } catch (err) {
    console.error("getServerSideProps villas/[id]/[name]:", err);
    return { notFound: true };
  }
}

export default VillaDetailsPage;

