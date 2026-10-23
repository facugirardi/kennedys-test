import type { IncomingMessage } from "http";

/** Public site origin for canonical URLs, Open Graph, and sitemap (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) || "https://kennedysgroup.com";
  const cleaned = String(raw).replace(/\/+$/, "").trim();
  if (cleaned) return cleaned;
  const vercel =
    typeof process !== "undefined" && process.env.VERCEL_URL
      ? String(process.env.VERCEL_URL).trim()
      : "";
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "";
}

function getOriginFromRequestHeaders(req?: IncomingMessage): string {
  if (!req?.headers) return "";
  const rawHost = (req.headers["x-forwarded-host"] || req.headers.host) as
    | string
    | undefined;
  const host = rawHost?.split(",")[0]?.trim();
  if (!host) return "";
  const rawProto = (req.headers["x-forwarded-proto"] as string | undefined)
    ?.split(",")[0]
    ?.trim();
  const proto =
    rawProto ||
    (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`.replace(/\/+$/, "");
}

/**
 * Public origin for canonical / OG. Prefers the incoming Host so multi-domain
 * deploys (kennedysgroup.com + agents-portfolio.com) resolve correctly.
 */
export function getPublicSiteOriginFromRequest(req?: IncomingMessage): string {
  const fromRequest = getOriginFromRequestHeaders(req);
  if (fromRequest) return fromRequest;
  return getSiteUrl();
}

export const SITE_NAME = "Kennedy's Group";

/** Default paths served as OG/Twitter images when none is set (site-relative). */
export const DEFAULT_SOCIAL_IMAGE_PATH = "/images/home-image.png";

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  return `${base}${normalized}`;
}

export function absoluteFromPathOrUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return absoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH);
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return absoluteUrl(pathOrUrl);
}
