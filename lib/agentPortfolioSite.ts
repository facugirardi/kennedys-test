/**
 * Detección del dominio agents-portfolio (ofertas unbranded / agent-friendly).
 * Usar en SSR (host/origin del request) y en cliente (window.location).
 */

function extractHostname(hostOrOrigin: string): string {
  const raw = String(hostOrOrigin || "").trim().toLowerCase();
  if (!raw) return "";
  try {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return new URL(raw).hostname.toLowerCase();
    }
  } catch {
    // fall through
  }
  return raw.replace(/^\/\//, "").split("/")[0]?.split(":")[0]?.toLowerCase() || "";
}

function agentPortfolioHostnameFromEnv(): string {
  const raw = process.env.NEXT_PUBLIC_AGENT_PORTFOLIO_URL?.trim();
  if (!raw) return "";
  try {
    const url = raw.startsWith("http") ? raw : `https://${raw}`;
    return new URL(url).hostname.toLowerCase();
  } catch {
    return extractHostname(raw);
  }
}

/** true si el host pertenece al sitio público Kennedy's Group. */
export function isKennedysGroupHost(hostOrOrigin: string): boolean {
  const hostname = extractHostname(hostOrOrigin);
  if (!hostname) return false;
  return (
    hostname === "kennedysgroup.com" ||
    hostname.endsWith(".kennedysgroup.com")
  );
}

/** true si el host pertenece al sitio agents-portfolio (unbranded). */
export function isAgentPortfolioHost(hostOrOrigin: string): boolean {
  const hostname = extractHostname(hostOrOrigin);
  if (!hostname) return false;

  // Nunca tratar dominios Kennedy's como agents-portfolio (aunque haya env mal configurado).
  if (isKennedysGroupHost(hostOrOrigin)) return false;

  const fromEnv = agentPortfolioHostnameFromEnv();
  if (fromEnv && hostname === fromEnv) return true;

  return hostname === "agents-portfolio.com" || hostname.endsWith(".agents-portfolio.com");
}

/** En cliente: ¿estamos en agents-portfolio? */
export function isAgentPortfolioClientOrigin(): boolean {
  if (typeof window === "undefined") return false;
  return isAgentPortfolioHost(window.location.origin);
}

/**
 * Contexto unbranded: todo el sitio en agents-portfolio.com (regla global por dominio).
 */
export function isAgentPortfolioUnbrandedContext(options: {
  siteOrigin?: string;
}): boolean {
  const origin = options.siteOrigin?.trim() || "";
  return Boolean(origin && isAgentPortfolioHost(origin));
}
