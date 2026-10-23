import { Fragment, useState, useCallback, useEffect } from "react";
import Script from "next/script";
import Head from "next/head";
import App, { type AppContext, type AppProps } from "next/app";
import { useRouter } from "next/router";
import "@/styles/tailwind-styles.css"
import "./global.css"
import 'react-datepicker/dist/react-datepicker.css'
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "@/src/contexts/AuthContext"
import { ContactProvider } from "@/src/contexts/ContactContext"
import { NewsletterProvider } from "@/src/contexts/NewsletterContext"
import { LoginProvider } from "@/src/contexts/LoginContext"
import { FloatingContactButton } from "@/components/custom/FloatingContactButton"
import { CookieConsentBanner } from "@/components/custom/CookieConsentBanner"
import { SITE_NAME } from "@/lib/seo/config"
import { stripHtmlToText, truncateMetaDescription } from "@/lib/seo/text"
import { resolveMediaUrl } from "@/lib/utils"
import {
  isOfferAgentFriendlyQuery,
  parseOfferBranded,
} from "@/lib/offerPublicSiteUrl"
import { isAgentPortfolioHost, isAgentPortfolioClientOrigin } from "@/lib/agentPortfolioSite"
import { AgentPortfolioProvider } from "@/src/contexts/AgentPortfolioContext"
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config"
import {
  buildOfferAgentFriendlyDescription,
  buildOfferAgentFriendlyTitle,
  buildShareOgImageUrl,
} from "@/lib/offerAgentFriendlyMeta"

const FLOATING_BUTTON_ROUTES = ['/real-estate', '/villas', '/concierge', '/events', '/we-manage-your-property'];

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const offer = (pageProps as any)?.offer;
  const pageSeoMeta = (pageProps as any)?.initialSeoMeta;
  const siteOriginFromPage =
    typeof (pageProps as any)?.siteOrigin === "string"
      ? String((pageProps as any).siteOrigin).replace(/\/+$/, "")
      : "";
  const [clientIsAgentPortfolio, setClientIsAgentPortfolio] = useState(false);

  useEffect(() => {
    setClientIsAgentPortfolio(isAgentPortfolioClientOrigin());
  }, []);

  const isAgentPortfolioSite =
    Boolean(siteOriginFromPage && isAgentPortfolioHost(siteOriginFromPage)) ||
    clientIsAgentPortfolio;
  const publicOriginFallback = String(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_HOST_URL ||
      process.env.NEXT_PUBLIC_WEBSITE_URL ||
      ""
  ).replace(/\/+$/, "");
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false);
  const handleCookieBannerVisibility = useCallback((visible: boolean) => {
    setCookieBannerVisible(visible);
  }, []);

  useEffect(() => {
    if (isAgentPortfolioSite) return;
    const fireConversion = () => {
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "conversion", {
          send_to: "AW-17888400836/gkt5CK-Y6OkbEMSr7dFC",
        });
      }
    };
    router.events.on("routeChangeComplete", fireConversion);
    return () => router.events.off("routeChangeComplete", fireConversion);
  }, [router.events, isAgentPortfolioSite]);

  const isPdfExportRoute = router.pathname.startsWith('/pdf');
  const isAgentOfferRoute =
    router.pathname === "/agent-offers/[slug]" ||
    router.pathname.startsWith("/agent-offers/");
  const isAgentPropertyRoute =
    router.pathname === "/agent-property/[id]" ||
    router.pathname.startsWith("/agent-property/");
  const isAgentCalendarRoute = router.pathname.startsWith("/agent-calendar");
  const isVillaDetailRoute =
    router.pathname === "/villas/[id]" || router.pathname === "/villas/[id]/[name]";
  const isSharedOfferRoute =
    router.pathname === "/shared-properties/[slug]" ||
    router.pathname.startsWith("/shared-properties/");
  const isOfferShareRoute = isAgentOfferRoute || isSharedOfferRoute;
  const isUnbrandedOfferPage =
    (isAgentOfferRoute && Boolean(siteOriginFromPage && isAgentPortfolioHost(siteOriginFromPage))) ||
    (isOfferShareRoute && offer != null && !parseOfferBranded(offer.branded));
  const isAgentOfferConciergeDetail =
    router.pathname.startsWith("/concierge/") &&
    router.isReady &&
    isOfferAgentFriendlyQuery(router.query);
  const isPreStockingRoute = router.pathname === "/pre-stocking";
  const isOwnerReportRoute = router.pathname === "/owner-report/[id]";
  const isAgentPortfolioCreateRoute = router.pathname.startsWith("/agent-portfolio");
  const suppressKennedysBranding = isAgentPortfolioSite;
  /** Newsletter, cookies, floating contact y promos Kennedy's ocultos en agents-portfolio, contextos unbranded, pre-stocking (checkout-like flow) y el owner report (compartido con dueños de villa, no debe mostrar promos del sitio). */
  const suppressUnbrandedMarketing =
    isPdfExportRoute ||
    isAgentPortfolioSite ||
    isAgentPropertyRoute ||
    isAgentCalendarRoute ||
    isUnbrandedOfferPage ||
    isSharedOfferRoute ||
    isAgentOfferConciergeDetail ||
    isPreStockingRoute ||
    isOwnerReportRoute ||
    isAgentPortfolioCreateRoute;
  const showFloatingButton =
    router.isReady &&
    FLOATING_BUTTON_ROUTES.some(
      (route) =>
        router.pathname === route || router.pathname.startsWith(route + "/")
    ) &&
    !suppressUnbrandedMarketing;

  const flattenedOfferItems = Array.isArray(offer?.propertiesToPresent)
    ? offer.propertiesToPresent.flatMap((section: any) =>
        Array.isArray(section?.properties) ? section.properties : []
      )
    : [];
  const firstOfferItem = flattenedOfferItems[0] ?? null;
  const fallbackMainImage =
    firstOfferItem?.mainImage ||
    firstOfferItem?.imageUrl ||
    firstOfferItem?.images?.[0]?.urlImage ||
    firstOfferItem?.images?.[0]?.url ||
    "";
  const headerImageRaw = typeof offer?.imageUrl === "string" ? offer.imageUrl.trim() : "";
  const headerIsDataUrl = headerImageRaw.startsWith("data:");
  // WhatsApp/OG crawlers do not reliably support data URLs. Prefer real media URLs.
  const offerImageRaw = (!headerIsDataUrl ? headerImageRaw : "") || fallbackMainImage || "";
  const toAbsoluteShareImage = (raw: string): string => {
    const value = String(raw || "").trim();
    if (!value || value.startsWith("data:")) return "";
    const resolved = resolveMediaUrl(value) || value;
    if (/^https?:\/\//i.test(resolved)) return resolved;
    const origin = siteOriginFromPage || apiOrigin.replace(/\/api$/i, "");
    if (!origin) return "";
    const normalizedPath = resolved.startsWith("/") ? resolved : `/${resolved}`;
    return `${origin}${normalizedPath}`;
  };
  const offerImageResolved = toAbsoluteShareImage(offerImageRaw);
  const offerSlug = typeof offer?.slug === "string" ? offer.slug.trim() : "";
  const internalOgImageUrl =
    isOfferShareRoute && offerSlug
      ? buildShareOgImageUrl(
          siteOriginFromPage || publicOriginFallback,
          offerSlug,
          { unbranded: suppressKennedysBranding }
        )
      : "";
  const finalOfferImageForMeta = internalOgImageUrl || offerImageResolved;
  const getOgImageMimeType = (url: string): string | null => {
    const clean = String(url || "").split("?")[0].toLowerCase();
    if (clean.includes("share-og-image")) return "image/jpeg";
    if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
    if (clean.endsWith(".png")) return "image/png";
    if (clean.endsWith(".webp")) return "image/webp";
    if (clean.endsWith(".gif")) return "image/gif";
    return null;
  };
  const offerImageMimeType = finalOfferImageForMeta ? getOgImageMimeType(finalOfferImageForMeta) : null;
  const offerIconUrl =
    offerImageResolved ||
    (typeof offerImageRaw === "string" && /^https?:\/\//i.test(offerImageRaw) ? offerImageRaw : "");
  const offerMetaTitle = suppressKennedysBranding && offer
    ? buildOfferAgentFriendlyTitle(offer)
    : typeof offer?.metaTitle === "string" && offer.metaTitle.trim()
      ? offer.metaTitle.trim()
      : typeof offer?.title === "string" && offer.title.trim()
        ? offer.title.trim()
        : SITE_NAME;
  const offerMetaDescription = (() => {
    if (suppressKennedysBranding && offer) {
      return buildOfferAgentFriendlyDescription(offer);
    }
    const raw =
      (typeof offer?.metaDescription === "string" && offer.metaDescription.trim()
        ? offer.metaDescription
        : typeof offer?.description === "string" && offer.description.trim()
          ? offer.description
          : "") as string;
    return truncateMetaDescription(stripHtmlToText(raw).replace(/\s+/g, " ").trim(), 160);
  })();
  const pageMetaTitle =
    typeof pageSeoMeta?.title === "string" && pageSeoMeta.title.trim()
      ? pageSeoMeta.title.trim()
      : "";
  const pageMetaDescription =
    typeof pageSeoMeta?.description === "string" && pageSeoMeta.description.trim()
      ? pageSeoMeta.description.trim()
      : "";
  const pageMetaImageRaw =
    typeof pageSeoMeta?.imageUrl === "string" && pageSeoMeta.imageUrl.trim()
      ? pageSeoMeta.imageUrl.trim()
      : "";
  const toAbsolutePageImage = (raw: string): string => {
    const value = String(raw || "").trim();
    if (!value || value.startsWith("data:")) return "";
    if (/^https?:\/\//i.test(value)) return value;
    const resolved = resolveMediaUrl(value) || value;
    if (/^https?:\/\//i.test(resolved)) return resolved;
    const origin = siteOriginFromPage || publicOriginFallback || apiOrigin.replace(/\/api$/i, "");
    if (!origin) return "";
    const normalizedPath = resolved.startsWith("/") ? resolved : `/${resolved}`;
    return `${origin}${normalizedPath}`;
  };
  const pageMetaImage = toAbsolutePageImage(pageMetaImageRaw);
  // The owner-report page renders its own complete <SeoHead> (title/description/image, kept in sync
  // with client-side data as it loads) — if this generic block also fired for it, the page would ship
  // two conflicting sets of og:title/og:description/og:image tags, which is exactly what was making
  // WhatsApp's unfurler give up and show no preview at all instead of a wrong one.
  const hasPageSeoMeta = !isOwnerReportRoute && Boolean(pageMetaTitle || pageMetaDescription || pageMetaImage);
  const pageSuppressBranding =
    Boolean(pageSeoMeta?.suppressSiteBranding) &&
    Boolean(siteOriginFromPage && isAgentPortfolioHost(siteOriginFromPage));
  const finalMetaTitle = isOfferShareRoute
    ? offerMetaTitle
    : pageMetaTitle || (suppressKennedysBranding ? "Property" : SITE_NAME);
  const finalMetaDescription = isOfferShareRoute
    ? offerMetaDescription
    : pageMetaDescription;
  const finalMetaImage = isOfferShareRoute
    ? finalOfferImageForMeta
    : pageMetaImage;
  const finalMetaImageMimeType = finalMetaImage ? getOgImageMimeType(finalMetaImage) : null;
  const finalFavicon =
    isOfferShareRoute && offerIconUrl
      ? offerIconUrl
      : isAgentPortfolioSite
        ? offerIconUrl || pageMetaImage || ""
        : isAgentPropertyRoute && pageMetaImage
          ? pageMetaImage
          : "/images/kenlogo.png";
  const finalOgSiteName =
    suppressKennedysBranding || pageSuppressBranding ? undefined : SITE_NAME;

  return (
    <Fragment>
      {!isAgentPortfolioSite ? (
        <>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-4L789CLVZT"
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-4L789CLVZT');
        gtag('config', 'AW-17888400836');
        gtag('event', 'conversion', { send_to: 'AW-17888400836/gkt5CK-Y6OkbEMSr7dFC' });
      `}</Script>
        </>
      ) : null}
      <Head>
        <title>{finalMetaTitle}</title>
        {finalMetaDescription ? (
          <meta name="description" content={finalMetaDescription} />
        ) : null}
        <meta
          name="viewport"
          content={
            isPdfExportRoute
              ? 'width=794, initial-scale=1, minimum-scale=1'
              : isAgentPropertyRoute || isVillaDetailRoute
                ? 'minimum-scale=1, initial-scale=1, width=device-width, viewport-fit=cover'
                : 'minimum-scale=1, initial-scale=1, width=device-width'
          }
        />
        {/* Preload critical fonts so they're ready sooner; font-display: swap shows fallback until loaded */}
        <link
          rel="preload"
          href="/fonts/gt-super-ds/GT-Super-Display-Light-Trial.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/neue/NeueHaasDisplayLight.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {finalFavicon ? (
          <>
            <link
              key="favicon"
              rel="icon"
              href={finalFavicon}
              type="image/png"
            />
            <link
              key="shortcut-icon"
              rel="shortcut icon"
              href={finalFavicon}
              type="image/png"
            />
            <link
              key="apple-touch-icon"
              rel="apple-touch-icon"
              href={finalFavicon}
            />
          </>
        ) : null}
        {isOfferShareRoute || hasPageSeoMeta ? (
          <>
            {finalOgSiteName ? (
              <meta property="og:site_name" content={finalOgSiteName} />
            ) : null}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={finalMetaTitle} />
            {finalMetaDescription ? <meta property="og:description" content={finalMetaDescription} /> : null}
            {finalMetaImage ? <meta property="og:image" content={finalMetaImage} /> : null}
            {finalMetaImage ? <meta property="og:image:url" content={finalMetaImage} /> : null}
            {finalMetaImage ? <meta property="og:image:secure_url" content={finalMetaImage} /> : null}
            {finalMetaImageMimeType ? <meta property="og:image:type" content={finalMetaImageMimeType} /> : null}
            {finalMetaImage ? <meta property="og:image:width" content="1200" /> : null}
            {finalMetaImage ? <meta property="og:image:height" content="630" /> : null}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={finalMetaTitle} />
            {finalMetaDescription ? <meta name="twitter:description" content={finalMetaDescription} /> : null}
            {finalMetaImage ? <meta name="twitter:image" content={finalMetaImage} /> : null}
          </>
        ) : null}
      </Head>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
        <AuthProvider>
          <LoginProvider>
            <AgentPortfolioProvider siteOrigin={siteOriginFromPage}>
              <ContactProvider>
                <NewsletterProvider suppressPromos={suppressUnbrandedMarketing}>
                  <Component {...pageProps} />
                  {!suppressUnbrandedMarketing && (
                    <CookieConsentBanner onVisibilityChange={handleCookieBannerVisibility} />
                  )}
                  {showFloatingButton && (
                    <FloatingContactButton liftForCookieBanner={cookieBannerVisible} />
                  )}
                </NewsletterProvider>
              </ContactProvider>
            </AgentPortfolioProvider>
          </LoginProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Fragment>
  );
}

export default MyApp;

MyApp.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext);
  const reqOrigin = getPublicSiteOriginFromRequest(appContext.ctx.req);
  const existing =
    typeof (appProps.pageProps as { siteOrigin?: unknown })?.siteOrigin === "string"
      ? String((appProps.pageProps as { siteOrigin: string }).siteOrigin).replace(/\/+$/, "")
      : "";
  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      siteOrigin: existing || reqOrigin || "",
    },
  };
};
