import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { fetchPropertiesListResult } from "@/lib/utils";
import { buildRentalDetailPath, buildRealEstateDetailPath } from "@/lib/rentalRoute";
import { getAllEvents } from "@/lib/api/events";
import { slugify } from "@/lib/utils";
import {
  VILLA_LOCATION_SLUGS,
  REAL_ESTATE_LOCATION_SLUGS,
  EVENTS_LOCATION_SLUGS,
  EXPERIENCES_LOCATION_SLUGS,
  CONCIERGE_LOCATION_SLUGS,
  getLocationEntry,
} from "@/lib/locationSlugs";

type SitemapSection = {
  title: string;
  links: { href: string; label: string }[];
};

type Props = {
  sections: SitemapSection[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const sections: SitemapSection[] = [];

  // Static / hub pages
  sections.push({
    title: "Main Pages",
    links: [
      { href: "/", label: "Home" },
      { href: "/villas", label: "Villas" },
      { href: "/villas/list", label: "Villa Listings" },
      { href: "/real-estate", label: "Real Estate" },
      { href: "/real-estate/list", label: "Real Estate Listings" },
      { href: "/real-estate/in-city", label: "City Real Estate" },
      { href: "/events", label: "Events" },
      { href: "/events/list", label: "Event Listings" },
      { href: "/experiences/list", label: "Experiences" },
      { href: "/concierge", label: "Concierge" },
      { href: "/concierge/list", label: "Concierge Listings" },
      { href: "/about-us", label: "About Us" },
      { href: "/sell-with-us", label: "Sell With Us" },
      { href: "/we-manage-your-property", label: "We Manage Your Villa" },
      { href: "/terms", label: "Terms of Use" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  });

  // Villa locations
  sections.push({
    title: "Villas by Destination",
    links: VILLA_LOCATION_SLUGS.map((slug) => {
      const name = getLocationEntry(slug)?.name ?? slug;
      return { href: `/villas/list?region=${encodeURIComponent(name)}`, label: name };
    }),
  });

  // Real-estate locations
  sections.push({
    title: "Real Estate by Destination",
    links: REAL_ESTATE_LOCATION_SLUGS.map((slug) => ({
      href: `/real-estate/${slug}`,
      label: getLocationEntry(slug)?.name ?? slug,
    })),
  });

  // Events locations
  sections.push({
    title: "Events by Destination",
    links: EVENTS_LOCATION_SLUGS.map((slug) => ({
      href: `/events/${slug}`,
      label: getLocationEntry(slug)?.name ?? slug,
    })),
  });

  // Experiences locations
  sections.push({
    title: "Experiences by Destination",
    links: EXPERIENCES_LOCATION_SLUGS.map((slug) => ({
      href: `/experiences/${slug}`,
      label: getLocationEntry(slug)?.name ?? slug,
    })),
  });

  // Concierge locations
  sections.push({
    title: "Concierge by Destination",
    links: CONCIERGE_LOCATION_SLUGS.map((slug) => ({
      href: `/concierge/${slug}`,
      label: getLocationEntry(slug)?.name ?? slug,
    })),
  });

  // Individual events
  try {
    const evRes: any = await getAllEvents({ listing: 1 });
    const evData = Array.isArray(evRes?.data) ? evRes.data : [];
    const eventLinks = evData.flatMap((e: any) => {
      const name = e?.name;
      const id = e?.id;
      const slug = name ? slugify(String(name)) : null;
      const segment = slug || (id != null ? String(id) : null);
      if (!segment) return [];
      return [{ href: `/events/${encodeURIComponent(segment)}`, label: name ?? segment }];
    });
    if (eventLinks.length) {
      sections.push({ title: "Events", links: eventLinks });
    }
  } catch {
    // omit if API fails
  }

  // Individual villas
  try {
    const villaLinks: { href: string; label: string }[] = [];
    const maxPages = 100;
    let page = 1;
    for (;;) {
      const r = await fetchPropertiesListResult({
        rental: true,
        includeDisabled: false,
        pageSize: 100,
        page,
      });
      for (const p of r.items) {
        const path = buildRentalDetailPath(p);
        if (path && path !== "/villas") {
          villaLinks.push({
            href: path,
            label: p.agentFriendlyName ?? p.name ?? p.title ?? path,
          });
        }
      }
      if (!r.items.length || page >= maxPages) break;
      if (r.items.length < r.pageSize) break;
      if (page * r.pageSize >= r.total) break;
      page += 1;
    }
    if (villaLinks.length) {
      sections.push({ title: "Villa Properties", links: villaLinks });
    }
  } catch {
    // omit if API fails
  }

  // Individual real-estate properties
  try {
    const reLinks: { href: string; label: string }[] = [];
    const maxPages = 100;
    let page = 1;
    for (;;) {
      const r = await fetchPropertiesListResult({
        rental: false,
        category: "real-estate",
        includeDisabled: false,
        pageSize: 100,
        page,
      });
      for (const p of r.items) {
        const id = p?.id;
        if (id) {
          reLinks.push({
            href: buildRealEstateDetailPath(p),
            label: p.name ?? p.title ?? String(id),
          });
        }
      }
      if (!r.items.length || page >= maxPages) break;
      if (r.items.length < r.pageSize) break;
      if (page * r.pageSize >= r.total) break;
      page += 1;
    }
    if (reLinks.length) {
      sections.push({ title: "Real Estate Properties", links: reLinks });
    }
  } catch {
    // omit if API fails
  }

  return { props: { sections } };
};

export default function SitemapPage({ sections }: Props) {
  return (
    <>
      <Head>
        <title>Sitemap | Kennedy's Group</title>
        <meta name="description" content="Full sitemap of Kennedy's Group — villas, real estate, events, experiences, and concierge services." />
        <link rel="canonical" href="https://kennedysgroup.com/sitemap" />
        <meta name="robots" content="index, follow" />
      </Head>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px", fontFamily: "sans-serif" }}>
        <h1 style={{ fontSize: 28, marginBottom: 40 }}>Site Map</h1>
        {sections.map((section) => (
          <section key={section.title} style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, marginBottom: 16, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
              {section.title}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, columns: 2, columnGap: 32 }}>
              {section.links.map((link) => (
                <li key={link.href} style={{ marginBottom: 8, breakInside: "avoid" }}>
                  <Link href={link.href} style={{ color: "#1d4ed8", textDecoration: "none", fontSize: 14 }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  );
}
