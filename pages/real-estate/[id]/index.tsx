import type { ComponentProps } from "react";
import type { GetServerSidePropsContext } from "next";
import VillaDetailsPage from "../../villas/[id]/index";
import { getProperty } from "@/lib/api/properties";
import { getPageBlocksData } from "@/lib/utils/contentBlocks";
import { buildRentalDetailPath, buildRealEstateDetailPath } from "@/lib/rentalRoute";
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config";
import { buildPropertyDetailInitialSeoMeta } from "@/lib/seo/propertyDetailMeta";
import type { Property } from "@/interfaces/property";

export default function RealEstateDetailPage(
  props: ComponentProps<typeof VillaDetailsPage>
) {
  return <VillaDetailsPage {...props} detailVariant="real-estate" />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  if (!id || typeof id !== "string") {
    return {
      redirect: {
        destination: "/real-estate",
        permanent: false,
      },
    };
  }

  const siteOrigin = getPublicSiteOriginFromRequest(context.req);

  try {
    const [res, blocksVilla] = await Promise.all([
      getProperty(id),
      getPageBlocksData("villa-detail"),
    ]);

    const data = res?.data ?? res;
    if (!data || res?.success === false) {
      return {
        redirect: {
          destination: "/real-estate",
          permanent: false,
        },
      };
    }

    const isRealEstateListing =
      data?.rental === false || data?.category === "real-estate";
    if (!isRealEstateListing) {
      const dest = buildRentalDetailPath(data);
      return {
        redirect: {
          destination: dest || `/villas/${encodeURIComponent(id)}`,
          permanent: false,
        },
      };
    }

    // Old /real-estate/:id links → canonical /real-estate/:region/:name
    const canonicalPath = buildRealEstateDetailPath(data);
    if (canonicalPath !== "/real-estate" && canonicalPath !== context.resolvedUrl) {
      return { redirect: { destination: canonicalPath, permanent: false } };
    }

    return {
      props: {
        initialProperty: data,
        initialPageBlocks: blocksVilla,
        siteOrigin,
        initialSeoMeta: buildPropertyDetailInitialSeoMeta(data as Property, {
          siteOrigin,
          isRealEstate: true,
          idForOg: String(data?.id ?? id),
        }),
      },
    };
  } catch (err) {
    console.error("getServerSideProps real-estate/[id]:", err);
    return {
      redirect: {
        destination: "/real-estate",
        permanent: false,
      },
    };
  }
}
