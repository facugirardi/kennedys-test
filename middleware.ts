import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAgentPortfolioHost } from "@/lib/agentPortfolioSite";

/** Paths reachable on agents-portfolio.com. Everything else on that domain redirects to
 * /agent-portfolio — it's a dedicated B2B tool, not a mirror of the full consumer site.
 * Includes the pages the tool itself links out to: villa detail (/agent-property, opened from the
 * offer picker), the public offer link agents copy and send to their own clients (/agent-offers,
 * /shared-properties), and the availability calendar (/agent-calendar). */
const ALLOWED_PREFIXES = [
  "/agent-portfolio",
  "/agent-property",
  "/agent-offers",
  "/agent-calendar",
  "/shared-properties",
  "/reset-password",
  "/terms",
  "/privacy",
  "/api",
];

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  if (!isAgentPortfolioHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Static files (images, fonts, etc. served from /public) always pass through untouched —
  // e.g. the OG image referenced by the agent-portfolio page itself.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  if (isAllowedPath(pathname)) {
    return NextResponse.next();
  }

  // /login and /forgot-password don't exist for this domain — the dedicated agent sign-in and
  // forgot-password views on /agent-portfolio replace them. Land directly on the matching view
  // instead of the bare apply form, which looked like the redirect silently swallowed the request.
  const url = request.nextUrl.clone();
  url.pathname = "/agent-portfolio";
  url.search = "";
  if (pathname === "/login" || pathname.startsWith("/login/")) {
    url.searchParams.set("view", "signIn");
  } else if (pathname === "/forgot-password" || pathname.startsWith("/forgot-password/")) {
    url.searchParams.set("view", "forgotPassword");
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
