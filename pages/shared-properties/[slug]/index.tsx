import { SharePropertiesPage } from "@/components/shared-offers/SharePropertiesPage";
import { getShareProperty } from "@/app/lib/api/sharePropertiy";
import { getService } from "@/lib/api/services";
import { SeoHead } from "@/components/seo/SeoHead";
import { getPublicSiteOriginFromRequest, SITE_NAME } from "@/lib/seo/config";
import { stripHtmlToText, truncateMetaDescription } from "@/lib/seo/text";
import { resolveMediaUrl } from "@/lib/utils";
import type { GetServerSidePropsContext } from "next";

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

  // Fetch live images for all services so the current order-1 image is always shown,
  // regardless of the snapshot stored when the offer was created.
  const sections = Array.isArray(data.propertiesToPresent) ? data.propertiesToPresent as any[] : [];
  const uniqueServiceIds = Array.from(new Set(
    sections.flatMap((s: any) => (s.properties || []) as any[])
      .filter((p: any) => p.serviceId && p.itemType !== "customService")
      .map((p: any) => String(p.serviceId))
  ));
  const liveServiceImagesMap = new Map<string, any[]>();
  if (uniqueServiceIds.length > 0) {
    await Promise.all(
      uniqueServiceIds.map(async (id) => {
        try {
          const res = await getService(id);
          const imgs = res?.data?.images;
          if (Array.isArray(imgs) && imgs.length > 0) {
            const sorted = [...imgs].sort((a: any, b: any) => (a?.order ?? Infinity) - (b?.order ?? Infinity));
            liveServiceImagesMap.set(id, sorted);
          }
        } catch {
          // fall back to stored snapshot
        }
      })
    );
  }

  if (liveServiceImagesMap.size > 0) {
    (data as any).propertiesToPresent = sections.map((section: any) => ({
      ...section,
      properties: (section.properties || []).map((prop: any) => {
        if (!prop.serviceId || prop.itemType === "customService") return prop;
        const liveImages = liveServiceImagesMap.get(String(prop.serviceId));
        return liveImages ? { ...prop, images: liveImages } : prop;
      }),
    }));
  }

  const rawBranded = data.branded;
  const branded =
    rawBranded !== false &&
    String(rawBranded ?? "").toLowerCase() !== "false";

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
        showPrice: data.showPrice ?? true,
        branded,
        logoUrl: data.logoUrl ?? data.logo_url ?? null,
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

export default function SharedPropertiesRoute({
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
  const ogImageUrl =
    offer?.slug && siteOrigin
      ? `${siteOrigin.replace(/\/+$/, "")}/api/share-og-image?slug=${encodeURIComponent(String(offer.slug))}`
      : hero;
  const metaDescRaw =
    typeof offer.metaDescription === "string" && offer.metaDescription.trim()
      ? stripHtmlToText(offer.metaDescription).replace(/\s+/g, " ").trim().slice(0, 160)
      : "";
  const metaDesc = metaDescRaw ? truncateMetaDescription(metaDescRaw, 160) : "";
  const fromBody =
    typeof offer.description === "string"
      ? truncateMetaDescription(stripHtmlToText(offer.description), 158)
      : "";
  const desc = metaDesc || fromBody;
  const pageTitle =
    typeof offer.metaTitle === "string" && offer.metaTitle.trim()
      ? offer.metaTitle.trim()
      : offer.title
        ? String(offer.title)
        : `Shared properties | ${SITE_NAME}`;
  return (
    <>
      <SeoHead
        title={pageTitle}
        description={desc}
        siteOrigin={siteOrigin || undefined}
        canonicalPath={`/shared-properties/${offer.slug}`}
        imageUrl={ogImageUrl || undefined}
      />
      <SharePropertiesPage shareProperty={offer} offerSlug={offer.slug || undefined} />
    </>
  );
}
