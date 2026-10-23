/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { getServiceTypes } from "@/lib/api/services";
import { useContact } from "@/src/contexts/ContactContext";
import { useNewsletter } from "@/src/contexts/NewsletterContext";
import { ExploreTheWorldFooter } from "@/components/promotional-blocks";
import { fetchAPI } from "@/lib/api/fetcher";
import { cn, resolveMediaUrl } from "@/lib/utils";

import { useAgentPortfolioSite } from "@/src/contexts/AgentPortfolioContext";
import { FOOTER_EXPLORE_LINKS, FOOTER_RENTAL_DESTINATIONS } from "@/lib/footerNavLinks";

const FALLBACK_PARTNERS = [
  { id: "f1", avatarUrl: null as string | null, src: "/images/image-10@2x.png", extra: null as { link?: string } | null, title: "" },
  { id: "f2", avatarUrl: null as string | null, src: "/images/image-11@2x.png", extra: null as { link?: string } | null, title: "" },
  { id: "f3", avatarUrl: null as string | null, src: "/images/image-13@2x.png", extra: null as { link?: string } | null, title: "" },
  { id: "f4", avatarUrl: null as string | null, src: "/images/image-14@2x.png", extra: null as { link?: string } | null, title: "" },
  { id: "f5", avatarUrl: null as string | null, src: "/images/hatta.png", extra: null as { link?: string } | null, title: "" },
  { id: "f6", avatarUrl: null as string | null, src: "/images/image-16@2x.png", extra: null as { link?: string } | null, title: "" },
];

/** Google Maps — Athens office (update if you use a short GBP link) */
const ATHENS_OFFICE_GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Dimarchou%20Aggelou%20Metaxa%2031%2C%20166%2075%20Glyfada%2C%20Greece";

/** Google Maps — Mykonos office */
const MYKONOS_OFFICE_GOOGLE_MAPS_URL = "https://maps.app.goo.gl/YkxN6JuQog7w34Fk6";

/** Subrayado que crece en dorado al hover — el único gesto de color de la marca. */
const LINK_CLASS =
  "relative inline-block text-[#172338]/85 transition-colors duration-300 hover:text-[#172338] before:content-[''] before:absolute before:-bottom-0.5 before:left-0 before:h-px before:w-0 before:bg-[#D99330] before:transition-[width] before:duration-300 hover:before:w-full";

const SOCIAL_LINKS: { label: string; href: string; path: string }[] = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/kennedysgroup",
    path: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kennedysgroup",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/kennedysgroup",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kennedysgroup",
    path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
];

const AGENTS_PORTAL_URL = "https://agents-portfolio.com/agent-portfolio";

type FooterLink = { label: string; href?: string; onClick?: () => void; external?: boolean };

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 text-[11px] font-normal uppercase tracking-[0.22em] text-[#172338]/70">
      {children}
    </div>
  );
}

function LinkList({ items, className }: { items: FooterLink[]; className?: string }) {
  return (
    <ul className={cn("space-y-3.5 text-[15px] font-light", className)}>
      {items.map((item) => (
        <li key={item.label}>
          {item.href && item.external ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              {item.label}
            </a>
          ) : item.href ? (
            <Link href={item.href} className={LINK_CLASS}>
              {item.label}
            </Link>
          ) : (
            <button
              type="button"
              onClick={item.onClick}
              className={cn(LINK_CLASS, "cursor-pointer border-0 bg-transparent p-0 text-left font-inherit")}
            >
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

type FooterProps = {
  disableTravelSection?: boolean;
  disableDataLoading?: boolean; // Para deshabilitar las llamadas a API innecesarias
};

const Footer: React.FC<FooterProps> = ({ disableTravelSection, disableDataLoading = false }) => {
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const router = useRouter();
  const { openContactForm } = useContact();
  const { openNewsletter } = useNewsletter();
  const [conciergeTypes, setConciergeTypes] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  const fallbackConciergeTypes = [
    { type: "Yacht" },
    { type: "PrivateJet" },
    { type: "Helicopter" },
    { type: "Chauffeur" },
    { type: "Chef" },
    { type: "Other" },
  ];

  // Partners: always loaded, even on pages that pass disableDataLoading (villa/real-estate/experiences
  // lists skip the heavier concierge-types call there to avoid piling onto their own page-load requests) —
  // otherwise the footer falls back to FALLBACK_PARTNERS, whose logos are grayscale placeholders with no
  // click-through link, so partners looked colored/clickable on some pages and not others.
  useEffect(() => {
    const loadPartners = async () => {
      try {
        const partnersResp = await fetchAPI("/content/partners?published=true&pageSize=50");
        const items = partnersResp?.data?.items;
        if (Array.isArray(items) && items.length > 0) {
          setPartners(items);
        }
      } catch {
        // silent fail — fallback partners will be shown
      }
    };

    loadPartners();
  }, []);

  useEffect(() => {
    if (disableDataLoading) {
      return;
    }

    const loadConciergeTypes = async () => {
      try {
        const typesResponse = await getServiceTypes();
        const types = Array.isArray(typesResponse?.data) ? typesResponse.data : [];

        const uniqueTypes = Array.from(new Set(types.map((t: string) => t.trim()).filter(Boolean))).map(
          (type) => ({ type })
        );
        if (uniqueTypes.length > 0) {
          setConciergeTypes(uniqueTypes);
        }
      } catch (error) {
        console.error("Failed to load concierge types for footer", error);
      }
    };

    loadConciergeTypes();
  }, [disableDataLoading]);

  const capitalize = (s: string) =>
    s && s.length ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;

  const conciergeSource = conciergeTypes.length > 0 ? conciergeTypes : fallbackConciergeTypes;
  const conciergeItems: FooterLink[] = (() => {
    const items = conciergeSource.slice(0, 8);
    const other = items.find((i: any) => String(i.type).toLowerCase() === "other");
    const rest = items.filter((i: any) => String(i.type).toLowerCase() !== "other");
    const ordered = (other ? [...rest, other] : rest).slice(0, 6);
    return ordered.map((i: any) => ({
      label: capitalize(String(i.type)),
      href: `/concierge/list?type=${encodeURIComponent(i.type)}`,
    }));
  })();

  const partnersToShow = partners.length > 0 ? partners : FALLBACK_PARTNERS;

  if (isAgentPortfolioSite) return null;

  return (
    <section className={router.pathname === "/villas/list" ? "relative font-haas" : "relative w-full font-haas"}>
      <div className={disableTravelSection ? "" : "flex w-full flex-col"}>
        {!disableTravelSection && <ExploreTheWorldFooter />}

        <div className="w-full bg-[#F7F5F0] text-[#172338]">
          <div className="mx-auto max-w-[1440px] px-6 md:px-16">
            {/* Marca + navegación */}
            <div className="grid grid-cols-1 gap-x-16 gap-y-16 pt-20 pb-16 lg:grid-cols-[1fr_1.7fr]">
              {/* Bloque de marca */}
              <div className="flex flex-col">
                <img
                  src="/images/logo-dark.svg"
                  alt="Kennedy&rsquo;s Group"
                  className="h-7 w-auto max-w-[300px] object-contain object-left md:h-8"
                />

                {/* Oficinas */}
                <div className="mt-8 space-y-6 text-[13px] font-light">
                  <div>
                    <div className="mb-2 text-[11px] font-normal uppercase tracking-[0.22em] text-[#172338]/70">
                      Athens Office
                    </div>
                    <p className="leading-relaxed text-[#172338]/85">
                      <a
                        href={ATHENS_OFFICE_GOOGLE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        Dimarchou Aggelou Metaxa 31, 166 75, Glyfada, Greece
                      </a>
                    </p>
                    <a
                      href="https://wa.me/302100087226"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(LINK_CLASS, "mt-1 block w-fit")}
                    >
                      +30 210 008 7226
                    </a>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-normal uppercase tracking-[0.22em] text-[#172338]/70">
                      Mykonos Office
                    </div>
                    <p className="leading-relaxed text-[#172338]/85">
                      <a
                        href={MYKONOS_OFFICE_GOOGLE_MAPS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_CLASS}
                      >
                        Argirena, 846 00, Mykonos, Greece
                      </a>
                    </p>
                    <a
                      href="https://wa.me/302289028233"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(LINK_CLASS, "mt-1 block w-fit")}
                    >
                      +30 2289 028 233
                    </a>
                  </div>
                </div>
              </div>

              {/* Columnas de navegación */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-5">
                <div>
                  <MicroLabel>Explore</MicroLabel>
                  <LinkList items={[...FOOTER_EXPLORE_LINKS]} />
                </div>

                <div className="col-span-2">
                  <MicroLabel>Destinations</MicroLabel>
                  <div className="grid grid-cols-2" style={{ columnGap: 6 }}>
                    <LinkList items={FOOTER_RENTAL_DESTINATIONS.slice(0, 7) as unknown as FooterLink[]} />
                    <LinkList items={FOOTER_RENTAL_DESTINATIONS.slice(7) as unknown as FooterLink[]} />
                  </div>
                </div>

                <div>
                  <MicroLabel>Services</MicroLabel>
                  <LinkList items={conciergeItems} />
                </div>

                <div>
                  <MicroLabel>Company</MicroLabel>
                  <LinkList
                    items={[
                      { label: "About Us", href: "/about-us" },
                      { label: "We are on the News", href: "/#news" },
                      { label: "Login", href: "/login" },
                      { label: "Agents Portal", href: AGENTS_PORTAL_URL, external: true },
                      { label: "Contact Us", onClick: () => openContactForm() },
                      { label: "Newsletter", onClick: () => openNewsletter() },
                      { label: "Sitemap", href: "/#sitemap" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 border-t border-[#172338]/10 py-14">
              {partnersToShow.map((p: any) => {
                const src = p.avatarUrl ? resolveMediaUrl(p.avatarUrl) : p.src;
                const href = p.extra?.link || null;
                const img = (
                  <img
                    src={src}
                    alt={p.title || "Partner"}
                    className="h-14 max-w-[190px] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100"
                  />
                );
                return href ? (
                  <a key={p.id} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    {img}
                  </a>
                ) : (
                  <span key={p.id} className="flex items-center">
                    {img}
                  </span>
                );
              })}
            </div>

            {/* Barra inferior con hairline dorada */}
            <div className="flex flex-col gap-6 border-t border-[#D99330]/40 py-8 md:flex-row md:items-center md:justify-between">
              <div className="text-[13px] font-light text-[#172338]/75">
                &copy; 2026 Kennedy&rsquo;s Group Vacation Rentals
              </div>

              <div className="flex items-center gap-6">
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="text-[#172338]/75 transition-colors duration-300 hover:text-[#D99330]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-5 text-[13px] font-light text-[#172338]/50">
                <a href="/terms" className={LINK_CLASS}>Terms</a>
                <a href="/privacy" className={LINK_CLASS}>Privacy</a>
                <a href="/cookies" className={LINK_CLASS}>Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
