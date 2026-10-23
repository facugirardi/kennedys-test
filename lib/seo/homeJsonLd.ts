import { absoluteUrl, getSiteUrl, SITE_NAME } from "./config";

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const url = getSiteUrl() || undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: url || undefined,
    logo: url ? absoluteUrl("/images/capa-1-3.svg") : undefined,
  };
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: base || undefined,
    potentialAction: base
      ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/villas/list?searchQuery={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        }
      : undefined,
  };
}
