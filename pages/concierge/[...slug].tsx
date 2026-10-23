import { ConciergeDetailPage } from "@/components/ConciergeDetailPage"
import Navbar from "@/components/custom/Navbar"
import { getAllServices, getService } from "@/lib/api/services"
import {
  ConciergeServiceDetail,
  ConciergeServicePreview,
  buildConciergeServicePathIndex,
  getConciergeServicePathForApiItemUnique,
  mapServiceToDetail,
  pickSimilarServicePreviews,
} from "@/lib/mappers/concierge"
import { SeoHead } from "@/components/seo/SeoHead"
import { getPublicSiteOriginFromRequest, SITE_NAME } from "@/lib/seo/config"
import { stripHtmlToText, truncateMetaDescription } from "@/lib/seo/text"
import { resolveMediaUrl } from "@/lib/utils"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { isOfferAgentFriendlyQuery, getOfferBackHref } from "@/lib/offerPublicSiteUrl"
import { isAgentPortfolioHost } from "@/lib/agentPortfolioSite"
import {
  buildConciergeAgentFriendlyDescription,
  buildConciergeAgentFriendlyTitle,
} from "@/lib/offerAgentFriendlyMeta"

function conciergeDetailInitialSeoMeta(
  mapped: ConciergeServiceDetail,
  options?: { agentPortfolioUnbranded?: boolean }
): {
  title: string
  description: string
  imageUrl: string | null
  suppressSiteBranding?: boolean
} {
  const agentPortfolioUnbranded = Boolean(options?.agentPortfolioUnbranded)
  // Manual overrides (editable in Loggia) take priority; empty/null falls back to the
  // auto-generated values, same as before.
  const customTitle = typeof mapped.metaTitle === "string" && mapped.metaTitle.trim() ? mapped.metaTitle.trim() : ""
  const customDescription =
    typeof mapped.metaDescription === "string" && mapped.metaDescription.trim() ? mapped.metaDescription.trim() : ""
  const customImageUrl =
    typeof mapped.metaImageUrl === "string" && mapped.metaImageUrl.trim() ? mapped.metaImageUrl.trim() : ""

  const fallbackTitle = agentPortfolioUnbranded
    ? buildConciergeAgentFriendlyTitle(mapped)
    : mapped.name
      ? `${mapped.name} | Concierge | ${SITE_NAME}`
      : `Concierge | ${SITE_NAME}`
  const title = customTitle || fallbackTitle
  const fallbackDescription = agentPortfolioUnbranded
    ? buildConciergeAgentFriendlyDescription(mapped)
    : mapped.description
      ? truncateMetaDescription(stripHtmlToText(String(mapped.description)), 160)
      : title
  const description = customDescription || fallbackDescription
  const imageUrl = customImageUrl
    ? resolveMediaUrl(customImageUrl)
    : mapped.heroImage && String(mapped.heroImage).trim()
      ? resolveMediaUrl(String(mapped.heroImage))
      : null
  return { title, description, imageUrl }
}

type ConciergeDetailRouteProps = {
  initialService?: ConciergeServiceDetail | null;
  initialSimilarServices?: ConciergeServicePreview[];
  siteOrigin?: string;
  /** Path-only canonical from SSR (e.g. `/concierge/athens/helicopter/slug`) for stable meta on first paint. */
  seoCanonicalPath?: string;
  initialSeoMeta?: {
    title: string;
    description: string;
    imageUrl?: string | null;
    suppressSiteBranding?: boolean;
  };
};

/**
 * Detalle de servicio de concierge por catch-all:
 * - /concierge/[id] → carga por id (luego redirige a URL por breadcrumb)
 * - /concierge/[location]/[type]/[slug] → carga por path (ej: /concierge/athens/helicopter/airbus-as365)
 */
const ConciergeDetail = ({
  initialService = null,
  initialSimilarServices = [],
  siteOrigin = "",
  seoCanonicalPath = "",
  initialSeoMeta,
}: ConciergeDetailRouteProps) => {
  const router = useRouter()
  const agentOfferView = useMemo(
    () => isOfferAgentFriendlyQuery(router.query),
    [router.query]
  )
  const isAgentPortfolio = Boolean(siteOrigin && isAgentPortfolioHost(siteOrigin))
  const suppressSiteBranding = isAgentPortfolio
  // Manual overrides (editable in Loggia) take priority; empty/null falls back to the
  // auto-generated values, same as before.
  const customTitle =
    typeof initialService?.metaTitle === "string" && initialService.metaTitle.trim()
      ? initialService.metaTitle.trim()
      : ""
  const customDescription =
    typeof initialService?.metaDescription === "string" && initialService.metaDescription.trim()
      ? initialService.metaDescription.trim()
      : ""
  const customImageUrl =
    typeof initialService?.metaImageUrl === "string" && initialService.metaImageUrl.trim()
      ? initialService.metaImageUrl.trim()
      : ""
  const seoTitle =
    customTitle ||
    (suppressSiteBranding && initialService
      ? buildConciergeAgentFriendlyTitle(initialService)
      : initialService?.name
        ? `${initialService.name} | Concierge | ${SITE_NAME}`
        : `Concierge | ${SITE_NAME}`)
  const seoDesc =
    customDescription ||
    (suppressSiteBranding && initialService
      ? buildConciergeAgentFriendlyDescription(initialService)
      : initialService?.description
        ? truncateMetaDescription(stripHtmlToText(String(initialService.description)), 160)
        : initialSeoMeta?.description || "")
  const ogImage = customImageUrl
    ? resolveMediaUrl(customImageUrl)
    : initialService?.heroImage && String(initialService.heroImage).trim()
      ? resolveMediaUrl(String(initialService.heroImage))
      : undefined

  useEffect(() => {
    if (typeof window === "undefined" || !router.isReady) return
    window.scrollTo({ top: 0, behavior: "auto" })
  }, [router.asPath, router.isReady])

  // The navbar wraps into a taller, multi-row layout at some widths (e.g. tablet) — a fixed
  // pt-28/pt-32 guess doesn't cover that and leaves the breadcrumb tucked under it, so offset by
  // its real rendered height instead.
  const [navbarHeight, setNavbarHeight] = useState(0)
  const handleNavbarHeightChange = useCallback((h: number) => setNavbarHeight(h), [])

  return (
    <div className="flex flex-col justify-between h-full w-full">
      <SeoHead
        title={seoTitle}
        description={seoDesc}
        siteOrigin={siteOrigin || undefined}
        canonicalPath={
          (seoCanonicalPath && seoCanonicalPath.trim()) ||
          (router.isReady
            ? router.asPath.split("#")[0]?.split("?")[0]
            : undefined)
        }
        imageUrl={ogImage || undefined}
        type="article"
        suppressSiteBranding={suppressSiteBranding}
      />
      {!agentOfferView && !isAgentPortfolio ? (
        <Navbar textBlack={true} onHeightChange={handleNavbarHeightChange} />
      ) : null}
      <div
        className={`flex flex-col justify-between h-full w-full ${
          agentOfferView || isAgentPortfolio ? "pt-4 md:pt-6" : ""
        }`}
        style={!agentOfferView && !isAgentPortfolio ? { paddingTop: navbarHeight } : undefined}
      >
        <ConciergeDetailPage
          key={router.isReady ? router.asPath : (initialService?.id != null ? String(initialService.id) : "concierge-detail")}
          initialService={initialService}
          initialSimilarServices={initialSimilarServices}
          agentOfferView={agentOfferView}
        />
      </div>
    </div>
  )
}

export async function getServerSideProps(context: {
  params?: { slug?: string | string[] }
  query?: Record<string, string | string[] | undefined>
  req: import("http").IncomingMessage
}) {
  const siteOrigin = getPublicSiteOriginFromRequest(context.req)
  const agentOfferView = isOfferAgentFriendlyQuery(context.query)
  const offerBackHref = getOfferBackHref(context.query, agentOfferView ? { agentFriendly: true } : {})
  const rawSlug = context.params?.slug
  const slugArray = Array.isArray(rawSlug) ? rawSlug : typeof rawSlug === 'string' ? [rawSlug] : []
  if (slugArray.length !== 1 && slugArray.length !== 3) {
    return {
      props: {
        initialService: null,
        initialSimilarServices: [],
        siteOrigin,
        seoCanonicalPath: "",
      },
    }
  }
  try {
    if (slugArray.length === 1) {
      const detailResponse = await getService(slugArray[0], { forWebsite: true })
      const detailData = detailResponse?.data ?? null
      if (!detailData) {
        return {
          props: {
            initialService: null,
            initialSimilarServices: [],
            siteOrigin,
            seoCanonicalPath: "",
          },
        }
      }
      const mapped = mapServiceToDetail(detailData)
      // Needed before the redirect decision now (used to detect slug collisions below), not just
      // for "similar services" — fetch it up front instead of after redirecting.
      const allResponse = await getAllServices({ published: true, forWebsite: true })
      const allData = Array.isArray(allResponse?.data) ? allResponse.data : []
      // Two services can share the same location+type+name (the "canonical" slug has no
      // disambiguator on its own); getConciergeServicePathForApiItemUnique appends a short id
      // suffix to the slug when that happens, so each duplicate still gets its own pretty,
      // SEO-friendly URL (needed for meta/OG) instead of colliding on one shared path.
      const canonicalPath = getConciergeServicePathForApiItemUnique(detailData, allData)
      // No redirigir a la URL canónica si viene de una offer (fromOffer): perdería
      // el query string (botón "Go back") y, si el service está unpublished, el
      // lookup por path de más abajo (que solo busca en published) no lo encontraría.
      if (
        !agentOfferView &&
        !offerBackHref &&
        canonicalPath &&
        canonicalPath !== `/concierge/${slugArray[0]}`
      ) {
        return { redirect: { destination: canonicalPath, permanent: false } }
      }
      const initialSimilarServices = pickSimilarServicePreviews(allData, detailData, 3)
      const seoCanonicalPath =
        canonicalPath || `/concierge/${slugArray.map((s) => encodeURIComponent(s)).join("/")}`
      const agentPortfolioUnbranded = isAgentPortfolioHost(siteOrigin)
      const seoMeta = conciergeDetailInitialSeoMeta(mapped, { agentPortfolioUnbranded })
      const suppressSiteBranding = agentPortfolioUnbranded
      return {
        props: {
          initialService: mapped,
          initialSimilarServices,
          siteOrigin,
          seoCanonicalPath,
          initialSeoMeta: { ...seoMeta, suppressSiteBranding },
        },
      }
    }

    const allResponse = await getAllServices({ published: true, forWebsite: true })
    const allData = Array.isArray(allResponse?.data) ? allResponse.data : []
    const wantedPath = `/concierge/${slugArray[0]}/${slugArray[1]}/${slugArray[2]}`
    // buildConciergeServicePathIndex resolves both plain paths (the common case) and the
    // disambiguated `-a1b2c3` suffixed paths generated for duplicate-named services, so this
    // never falls back to an arbitrary first match on a collision.
    const detailData = buildConciergeServicePathIndex(allData).get(wantedPath) ?? null

    if (!detailData) {
      return {
        props: {
          initialService: null,
          initialSimilarServices: [],
          siteOrigin,
          seoCanonicalPath: "",
        },
      }
    }

    const mapped = mapServiceToDetail(detailData)
    const initialSimilarServices = pickSimilarServicePreviews(allData, detailData, 3)
    const seoCanonicalPath = wantedPath

    const agentPortfolioUnbranded = isAgentPortfolioHost(siteOrigin)
    const seoMeta = conciergeDetailInitialSeoMeta(mapped, { agentPortfolioUnbranded })
    const suppressSiteBranding = agentPortfolioUnbranded

    return {
      props: {
        initialService: mapped,
        initialSimilarServices,
        siteOrigin,
        seoCanonicalPath,
        initialSeoMeta: { ...seoMeta, suppressSiteBranding },
      },
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps concierge/[...slug]:', err)
    return {
      props: {
        initialService: null,
        initialSimilarServices: [],
        siteOrigin,
        seoCanonicalPath: "",
      },
    }
  }
}

export default ConciergeDetail
