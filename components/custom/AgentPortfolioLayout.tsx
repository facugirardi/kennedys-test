import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { AgentPortfolioWordmark, INK, PAPER } from "@/components/custom/AgentPortfolioFormKit";

const NAV: { href: string; label: string; caption: string; external?: boolean; matchPrefixes?: string[] }[] = [
  { href: "/agent-portfolio", label: "Home", caption: "Catalogue" },
  // /agent-portfolio/create (the offer builder) lives under Offers, not Home — it should light up
  // "Offers" in the nav even though its own path doesn't match.
  { href: "/agent-portfolio/offers", label: "Offers", caption: "Client offers", matchPrefixes: ["/agent-portfolio/create"] },
  { href: "/agent-portfolio/rates", label: "Rates", caption: "Net to agent" },
  { href: "/agent-calendar", label: "Calendar", caption: "Availability", external: true },
];

function isNavItemActive(item: (typeof NAV)[number], pathname: string): boolean {
  if (pathname === item.href) return true;
  return item.matchPrefixes?.some((prefix) => pathname.startsWith(prefix)) ?? false;
}

/** Two separate tools live behind this sidebar — /agent-portfolio (catalogue shortcuts, the home
 * screen agents land on) and /agent-portfolio/offers (offer management). Same navy-and-paper
 * "dossier" language as the logged-out shell in AgentPortfolioFormKit, so signing in doesn't drop
 * the agent into a different-looking product. Collapses to a top bar + hamburger menu on mobile,
 * where a fixed side column would eat too much width. */
export default function AgentPortfolioLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const close = () => setMobileMenuOpen(false);
    router.events.on("routeChangeComplete", close);
    return () => router.events.off("routeChangeComplete", close);
  }, [router.events]);

  return (
    <div className="min-h-screen md:flex" style={{ backgroundColor: PAPER }}>
      <aside
        className="hidden md:flex md:w-60 md:flex-shrink-0 md:flex-col md:h-screen md:sticky md:top-0 md:self-start"
        style={{ backgroundColor: INK }}
      >
        <div className="px-8 pt-10 pb-12">
          <Link href="/agent-portfolio" className="block focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40">
            <AgentPortfolioWordmark />
          </Link>
        </div>
        <nav className="flex-1 px-5" aria-label="Agent portfolio">
          <ol className="flex flex-col gap-3">
            {NAV.map((item) => {
              const active = isNavItemActive(item, router.pathname);
              const Arrow = item.external ? ArrowUpRight : ArrowRight;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={`group relative flex items-center justify-between gap-3 overflow-hidden border px-5 py-4 transition-colors duration-300 focus-visible:outline-none focus-visible:border-[#D99330] ${
                      active
                        ? "border-[#D99330]/50 bg-white/[0.07] text-white"
                        : "border-transparent text-white hover:border-white/30 active:border-white/60 active:bg-white/[0.04]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-haas text-[15px] leading-none">{item.label}</span>
                      <span
                        className={`mt-2 block font-haas text-[10px] uppercase tracking-[0.2em] transition-colors ${
                          active ? "text-[#D99330]" : "text-white/35 group-hover:text-white/55"
                        }`}
                      >
                        {item.caption}
                      </span>
                    </span>
                    <Arrow
                      strokeWidth={1.25}
                      className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                        active
                          ? "text-[#D99330]"
                          : "-translate-x-1 text-white/0 group-hover:translate-x-0 group-hover:text-white/70"
                      }`}
                    />
                    {/* Hairline gold underline that draws in on hover — the only motion in the rail. */}
                    {!active && (
                      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#D99330] transition-all duration-500 ease-out group-hover:w-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
        <div className="px-8 py-8 space-y-1.5 border-t border-white/10">
          {user?.email && <p className="font-haas text-xs text-white/40 truncate">{user.email}</p>}
          <button
            type="button"
            onClick={() => logout()}
            className="font-haas text-sm text-white/70 underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:text-[#D99330] hover:decoration-[#D99330] focus-visible:outline-none focus-visible:text-[#D99330]"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="md:hidden sticky top-0 z-50" style={{ backgroundColor: INK }}>
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/agent-portfolio" className="focus-visible:outline-none">
            <AgentPortfolioWordmark size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:text-[#D99330]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-white/10 px-5 pt-4 pb-6" aria-label="Agent portfolio">
            <ol className="flex flex-col gap-2">
              {NAV.map((item) => {
                const active = isNavItemActive(item, router.pathname);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className={`block border px-4 py-3 font-haas text-[15px] transition-colors focus-visible:outline-none focus-visible:border-[#D99330] ${
                        active
                          ? "border-[#D99330]/50 bg-white/[0.07] text-white"
                          : "border-transparent text-white/80 hover:border-white/30"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ol>
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
              {user?.email && <p className="font-haas text-xs text-white/40 truncate">{user.email}</p>}
              <button
                type="button"
                onClick={() => logout()}
                className="shrink-0 font-haas text-sm text-white/70 underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:text-[#D99330] hover:decoration-[#D99330] focus-visible:outline-none focus-visible:text-[#D99330]"
              >
                Log out
              </button>
            </div>
          </nav>
        )}
      </div>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
