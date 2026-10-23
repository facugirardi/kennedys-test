import type { ComponentProps } from "react";
import type { GetServerSidePropsContext } from "next";
import VillaDetailsPage from "../../villas/[id]/index";
import { getAllProperties, getProperty, getPropertyBySlug, getPropertyByPreviousSlug } from "@/lib/api/properties";
import { getPageBlocksData } from "@/lib/utils/contentBlocks";
import { matchesRentalRoute, matchesRentalName, buildRealEstateDetailPath } from "@/lib/rentalRoute";
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config";
import { buildPropertyDetailInitialSeoMeta } from "@/lib/seo/propertyDetailMeta";
import type { Property } from "@/interfaces/property";

export default function RealEstateDetailByNamePage(
  props: ComponentProps<typeof VillaDetailsPage>
) {
  return <VillaDetailsPage {...props} detailVariant="real-estate" />;
}

const isRealEstateListing = (data: any) =>
  Boolean(data) && (data?.rental === false || data?.category === "real-estate");

async function resolveRealEstateByRoute(region: string, name: string) {
  const decodedRegion = decodeURIComponent(region).trim();
  const decodedName = decodeURIComponent(name).trim();

  try {
    const byIdentifier: any = await getPropertyBySlug(decodedName);
    const data = byIdentifier?.data ?? null;
    if (isRealEstateListing(data) && matchesRentalRoute(data, decodedRegion, decodedName)) return data;
  } catch {
    // no-op
  }

  try {
    const bySearch: any = await getAllProperties({
      rental: false,
      category: "real-estate",
      includeDisabled: false,
      searchQuery: decodedName,
      pageSize: 100,
    });
    const payload = bySearch?.data ?? bySearch;
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    const matched = items.find((p: any) => matchesRentalRoute(p, decodedRegion, decodedName));
    if (matched) return matched;
  } catch {
    // no-op
  }

  const maxPages = 100;
  for (let page = 1; page <= maxPages; page++) {
    const res: any = await getAllProperties({
      rental: false,
      category: "real-estate",
      includeDisabled: false,
      page,
      pageSize: 100,
    });
    const payload = res?.data ?? res;
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    if (!items.length) break;
    const matched = items.find((p: any) => matchesRentalRoute(p, decodedRegion, decodedName));
    if (matched) return matched;
    if (items.length < 100) break;
  }
  return null;
}

/** 404 fallback for a listing renamed after its old URL was indexed: caller redirects to the current path. */
async function resolveRenamedRealEstate(name: string) {
  const decodedName = decodeURIComponent(name).trim();
  if (!decodedName) return null;

  try {
    const byIdentifier: any = await getPropertyBySlug(decodedName);
    const data = byIdentifier?.data ?? null;
    if (isRealEstateListing(data) && matchesRentalName(data, decodedName)) return data;
  } catch {
    // no-op
  }

  try {
    const byPreviousSlug: any = await getPropertyByPreviousSlug(decodedName);
    const data = byPreviousSlug?.data ?? null;
    if (isRealEstateListing(data)) return data;
  } catch {
    // no-op
  }

  return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext<{ id: string; name: string }>) {
  const region = context.params?.id;
  const name = context.params?.name;
  if (!region || !name) return { notFound: true };

  const siteOrigin = getPublicSiteOriginFromRequest(context.req);

  try {
    const matched = await resolveRealEstateByRoute(region, name);
    if (!matched?.id) {
      const renamed = await resolveRenamedRealEstate(name);
      if (renamed?.id) {
        const canonicalPath = buildRealEstateDetailPath(renamed);
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
    if (!data || !isRealEstateListing(data)) return { notFound: true };

    return {
      props: {
        initialProperty: data,
        initialPageBlocks: blocksVilla,
        siteOrigin,
        initialSeoMeta: buildPropertyDetailInitialSeoMeta(data as Property, {
          siteOrigin,
          isRealEstate: true,
          idForOg: String(data?.id ?? matched.id),
        }),
      },
    };
  } catch (err) {
    console.error("getServerSideProps real-estate/[id]/[name]:", err);
    return { notFound: true };
  }
}
