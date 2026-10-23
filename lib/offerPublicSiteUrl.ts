import { getConciergeServicePath } from "@/lib/mappers/concierge";

/** Query param: detalle concierge/villa sin cabecera ni pie del sitio público (oferta unbranded). */
export const OFFER_AGENT_FRIENDLY_QUERY_KEY = "agentOffer";

/** Query param: slug de la oferta de origen; el detalle muestra "Go back" hacia la oferta. */
export const OFFER_BACK_QUERY_KEY = "fromOffer";

export function parseOfferBranded(raw: unknown): boolean {
  return raw !== false && String(raw ?? "").toLowerCase() !== "false";
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

/**
 * Base del sitio público según branded de la oferta.
 * Unbranded → agents-portfolio (NEXT_PUBLIC_AGENT_PORTFOLIO_URL).
 * Branded → kennedysgroup (NEXT_PUBLIC_BASE_URL / HOST).
 */
export function getOfferPublicSiteBaseUrl(branded: boolean): string {
  if (!branded) {
    const agent = process.env.NEXT_PUBLIC_AGENT_PORTFOLIO_URL?.trim();
    if (agent) return normalizeBaseUrl(agent);
    if (typeof window !== "undefined") {
      return normalizeBaseUrl(window.location.origin);
    }
    return "https://agents-portfolio.com";
  }

  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_HOST_URL ||
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    "https://kennedysgroup.com";
  return normalizeBaseUrl(
    raw.replace(/^https?:\/\/villasforrent\.kennedysgroup\.com/i, "https://kennedysgroup.com")
  );
}

export function isOfferAgentFriendlyQuery(
  query: Record<string, string | string[] | undefined> | undefined
): boolean {
  const v = query?.[OFFER_AGENT_FRIENDLY_QUERY_KEY];
  if (v === "1" || v === "true") return true;
  if (Array.isArray(v)) return v.some((x) => x === "1" || x === "true");
  return false;
}

export function withOfferAgentFriendlyQuery(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set(OFFER_AGENT_FRIENDLY_QUERY_KEY, "1");
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${OFFER_AGENT_FRIENDLY_QUERY_KEY}=1`;
  }
}

/**
 * Href hacia la oferta de origen cuando el detalle se abrió con OFFER_BACK_QUERY_KEY.
 * options.agentFriendly fuerza la base agent-offers (páginas inherentemente agent, p.ej. /agent-property).
 */
export function getOfferBackHref(
  query: Record<string, string | string[] | undefined> | undefined,
  options: { agentFriendly?: boolean } = {}
): string | null {
  const raw = query?.[OFFER_BACK_QUERY_KEY];
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (typeof slug !== "string" || slug.trim() === "") return null;
  const agentFriendly = options.agentFriendly ?? isOfferAgentFriendlyQuery(query);
  const base = agentFriendly ? "agent-offers" : "shared-properties";
  return `/${base}/${encodeURIComponent(slug.trim())}`;
}

/** URL de detalle concierge desde una línea de oferta compartida. */
export function buildOfferConciergeDetailUrl(
  service: {
    serviceId?: string | null;
    id?: string | null;
    type?: string | null;
    title?: string | null;
    name?: string | null;
    location?: string | null;
    country?: string | null;
  },
  branded: boolean,
  offerSlug?: string | null
): string {
  const base = getOfferPublicSiteBaseUrl(branded);
  const serviceId = service.serviceId || service.id;
  const serviceType = (service.type || "").trim();
  const serviceName = (service.title || service.name || "").trim();
  const location = (service.location || service.country || "").trim();

  // Preferir ID: el slug de 3 segmentos desde snapshot de oferta suele no coincidir con getConciergeServicePathForApiItem.
  let path: string;
  if (serviceId) {
    path = `/concierge/${encodeURIComponent(String(serviceId))}`;
  } else if (location && serviceType && serviceName) {
    path = getConciergeServicePath({
      location,
      type: serviceType,
      name: serviceName,
    });
  } else {
    return base;
  }

  const url = new URL(path, `${base}/`);
  if (serviceType && path.startsWith("/concierge/") && path.split("/").length === 3) {
    url.searchParams.set("type", serviceType);
  }
  if (!branded) {
    url.searchParams.set(OFFER_AGENT_FRIENDLY_QUERY_KEY, "1");
  }
  if (offerSlug && offerSlug.trim() !== "") {
    url.searchParams.set(OFFER_BACK_QUERY_KEY, offerSlug.trim());
  }
  return url.toString();
}
