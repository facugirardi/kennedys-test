import Head from "next/head";
import { DEFAULT_SOCIAL_IMAGE_PATH, getSiteUrl, SITE_NAME } from "@/lib/seo/config";
import { isAgentPortfolioHost } from "@/lib/agentPortfolioSite";

export type SeoHeadProps = {
  title: string;
  description?: string;
  /**
   * Optional public origin (https://example.com) when env-based getSiteUrl() is empty
   * during SSR — required for absolute og:url / og:image for messengers and social crawlers.
   */
  siteOrigin?: string;
  /** Path only (e.g. /villas/foo) or full URL; query strings stripped if path. */
  canonicalPath?: string;
  imageUrl?: string;
  /** Optional favicon URL (absolute or path). */
  faviconUrl?: string;
  /** og:type, default "website" */
  type?: string;
  noindex?: boolean;
  /** Extra JSON-LD objects (serialized into script tags). */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** agents-portfolio / agent-friendly: sin Kennedy's en fallbacks ni og:site_name. */
  suppressSiteBranding?: boolean;
  /** Override opcional de og:site_name (solo si no se suprime branding). */
  siteName?: string;
};

function normalizeCanonical(pathOrUrl?: string, base?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  // Full URL: strip fragment only, preserve query params (needed for location-filtered canonicals)
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const withoutFragment = pathOrUrl.split("#")[0] || pathOrUrl;
    return withoutFragment.replace(/\/$/, "") || withoutFragment;
  }
  // Relative path: strip fragment only; keep query (type/location filter share URLs)
  const withoutFragment = pathOrUrl.split("#")[0] || pathOrUrl;
  const qIndex = withoutFragment.indexOf("?");
  const pathOnly = qIndex >= 0 ? withoutFragment.slice(0, qIndex) : withoutFragment;
  const query = qIndex >= 0 ? withoutFragment.slice(qIndex) : "";
  const origin = (base || "").replace(/\/+$/, "").trim();
  if (!origin) return undefined;
  const path = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const normalizedPath = path.replace(/\/+$/, "") || path;
  return `${origin}${normalizedPath}${query}`;
}

export function SeoHead({
  title,
  description,
  siteOrigin,
  canonicalPath,
  imageUrl,
  faviconUrl,
  type = "website",
  noindex = false,
  jsonLd,
  suppressSiteBranding = false,
  siteName,
}: SeoHeadProps) {
  const siteBase = (siteOrigin?.trim() || getSiteUrl()).replace(/\/+$/, "");
  const suppressBranding =
    suppressSiteBranding ||
    Boolean(siteOrigin?.trim() && isAgentPortfolioHost(siteOrigin));
  const canonical = normalizeCanonical(canonicalPath, siteBase);
  const toAbsoluteMedia = (pathOrUrl: string) => {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    if (!siteBase) return pathOrUrl;
    return `${siteBase}${path}`.replace(/\/+$/, "") || `${siteBase}${path}`;
  };
  const rawImage =
    imageUrl && imageUrl.length > 0
      ? imageUrl
      // Sin imagen propia y con marca suprimida (agents-portfolio), no usar la foto de villa
      // de Kennedy's como preview — mejor no mandar og:image que mandar uno mal white-labeled.
      : suppressBranding
        ? ""
        : DEFAULT_SOCIAL_IMAGE_PATH;
  const ogImage = rawImage
    ? (/^https?:\/\//i.test(rawImage) ? rawImage : toAbsoluteMedia(rawImage) || rawImage)
    : "";
  const resolvedFavicon = faviconUrl
    ? (/^https?:\/\//i.test(faviconUrl) ? faviconUrl : toAbsoluteMedia(faviconUrl) || faviconUrl)
    : undefined;
  const desc =
    description && description.trim().length > 0
      ? description.trim()
      : suppressBranding
        ? "Curated properties and luxury experiences."
        : `${SITE_NAME} — luxury vacation rentals, real estate, concierge, and events worldwide.`;
  const ogSiteName =
    suppressBranding
      ? siteName?.trim() || undefined
      : siteName?.trim() || SITE_NAME;

  const scripts: Array<Record<string, unknown>> = [];
  if (jsonLd) {
    if (Array.isArray(jsonLd)) scripts.push(...jsonLd);
    else scripts.push(jsonLd);
  }

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={desc} />
      {canonical ? <link rel="canonical" href={canonical} /> : null}

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {ogSiteName ? <meta property="og:site_name" content={ogSiteName} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {resolvedFavicon ? <link key="favicon" rel="icon" href={resolvedFavicon} /> : null}
      {resolvedFavicon ? <link key="shortcut-icon" rel="shortcut icon" href={resolvedFavicon} /> : null}
      {resolvedFavicon ? <link key="apple-touch-icon" rel="apple-touch-icon" href={resolvedFavicon} /> : null}

      {canonical ? (
        <link rel="alternate" hrefLang="en" href={canonical} />
      ) : null}

      {scripts.map((obj, i) => (
        <script
          // eslint-disable-next-line react/no-danger
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </Head>
  );
}
