import { SharePropertiesPage } from "@/components/shared-offers/SharePropertiesPage";
import { getShareProperty } from "@/app/lib/api/sharePropertiy";
import { SeoHead } from "@/components/seo/SeoHead";
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config";
import { resolveMediaUrl } from "@/lib/utils";
import type { GetServerSidePropsContext } from "next";
import { isAgentPortfolioHost } from "@/lib/agentPortfolioSite";
import {
  buildOfferAgentFriendlyDescription,
  buildOfferAgentFriendlyTitle,
  buildShareOgImageUrl,
} from "@/lib/offerAgentFriendlyMeta";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const siteOrigin = getPublicSiteOriginFromRequest(context.req);
  const identifier = context.params?.slug as string | undefined;
  const response = await getShareProperty(identifier);

  if (!response?.success || !response?.data) {
    return {
      props: {
        offer: null,
        siteOrigin,
      },
    };
  }

  const data = response.data as Record<string, unknown>;
  const metaTitleRaw =
    (data.metaTitle as string | null | undefined) ??
    (data.meta_title as string | null | undefined) ??
    null;
  const metaDescriptionRaw =
    (data.metaDescription as string | null | undefined) ??
    (data.meta_description as string | null | undefined) ??
    null;

  return {
    props: {
      offer: {
        slug: (data.slug as string) ?? identifier,
        title: data.title,
        description: data.description,
        propertiesToPresent: data.propertiesToPresent || [],
        welcomeTitle: data.welcomeTitle,
        showPrice: data.showPrice ?? false,
        branded: false,
        logoUrl: null,
        imageUrl: data.imageUrl ?? null,
        currency: data.currency ?? "EUR",
        priceEntryUsd: Boolean((data as any).priceEntryUsd ?? (data as any).price_entry_usd),
        usdPerEur:
          (data as any).usdPerEur != null && Number((data as any).usdPerEur) > 0
            ? Number((data as any).usdPerEur)
            : (data as any).usd_per_eur != null && Number((data as any).usd_per_eur) > 0
              ? Number((data as any).usd_per_eur)
              : null,
        metaTitle: metaTitleRaw,
        metaDescription: metaDescriptionRaw,
        creatorName: (data.creatorName as string) ?? null,
        creatorPhone: (data.creatorPhone as string) ?? null,
      },
      siteOrigin,
    },
  };
}

export default function AgentOffersRoute({
  offer,
  siteOrigin,
}: {
  offer: any;
  siteOrigin: string;
}) {
  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <p className="text-sm text-gray-500">Offer not found.</p>
      </div>
    );
  }
  const firstOfferItem = Array.isArray(offer.propertiesToPresent)
    ? offer.propertiesToPresent.flatMap((s: any) => s?.properties || [])[0]
    : null;
  const fallbackMainImage =
    firstOfferItem?.mainImage ||
    firstOfferItem?.imageUrl ||
    firstOfferItem?.images?.[0]?.urlImage ||
    firstOfferItem?.images?.[0]?.url ||
    "";
  const headerImageRaw = typeof offer.imageUrl === "string" ? offer.imageUrl.trim() : "";
  const imageForPreview = headerImageRaw.startsWith("data:")
    ? fallbackMainImage
    : (headerImageRaw || fallbackMainImage);
  const hero = resolveMediaUrl(imageForPreview);
  const suppressSiteBranding = Boolean(siteOrigin && isAgentPortfolioHost(siteOrigin));
  const pageTitle = buildOfferAgentFriendlyTitle(offer);
  const desc = buildOfferAgentFriendlyDescription(offer);
  const ogImageUrl =
    offer?.slug && siteOrigin
      ? buildShareOgImageUrl(siteOrigin, String(offer.slug), { unbranded: suppressSiteBranding })
      : hero;

  return (
    <>
      <SeoHead
        title={pageTitle}
        description={desc}
        siteOrigin={siteOrigin || undefined}
        canonicalPath={`/agent-offers/${offer.slug}`}
        imageUrl={ogImageUrl || undefined}
        faviconUrl={hero || undefined}
        noindex
        suppressSiteBranding={suppressSiteBranding}
      />
      <SharePropertiesPage shareProperty={offer} offerSlug={offer.slug || undefined} forceUnbranded />
    </>
  );
}
