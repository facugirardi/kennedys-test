import { getSiteUrl } from "./config";
import { getAllEvents } from "@/lib/api/events";
import { fetchPropertiesListResult, slugify } from "@/lib/utils";
import { buildRentalDetailPath, buildRealEstateDetailPath } from "@/lib/rentalRoute";
import {
  VILLA_LOCATION_SLUGS,
  REAL_ESTATE_LOCATION_SLUGS,
  EVENTS_LOCATION_SLUGS,
  EXPERIENCES_LOCATION_SLUGS,
  CONCIERGE_LOCATION_SLUGS,
  getLocationEntry,
} from "@/lib/locationSlugs";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const STATIC_PATHS: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1" },
  { path: "/about-us", changefreq: "monthly", priority: "0.8" },
  { path: "/sell-with-us", changefreq: "monthly", priority: "0.7" },
  { path: "/we-manage-your-property", changefreq: "monthly", priority: "0.7" },
  { path: "/real-estate", changefreq: "daily", priority: "0.9" },
  { path: "/real-estate/list", changefreq: "daily", priority: "0.85" },
  { path: "/real-estate/in-city", changefreq: "weekly", priority: "0.7" },
  { path: "/villas", changefreq: "daily", priority: "0.9" },
  { path: "/villas/list", changefreq: "daily", priority: "0.85" },
  { path: "/events", changefreq: "weekly", priority: "0.8" },
  { path: "/events/list", changefreq: "weekly", priority: "0.75" },
  { path: "/experiences/list", changefreq: "weekly", priority: "0.75" },
  { path: "/concierge", changefreq: "weekly", priority: "0.8" },
  { path: "/concierge/list", changefreq: "weekly", priority: "0.75" },
  { path: "/sitemap", changefreq: "weekly", priority: "0.5" },
];

async function collectPropertyPaths(): Promise<string[]> {
  const paths = new Set<string>();
  const maxPages = 100;

  let page = 1;
  for (;;) {
    // includeDisabled: false — mantener en sync con el resolver del detalle
    // (villas/[id]/[name]); si no, propiedades deshabilitadas entran al
    // sitemap y devuelven 404.
    const r = await fetchPropertiesListResult({
      rental: true,
      includeDisabled: false,
      pageSize: 100,
      page,
    });
    for (const p of r.items) {
      const path = buildRentalDetailPath(p);
      if (path && path !== "/villas") paths.add(path);
    }
    if (!r.items.length || page >= maxPages) break;
    if (r.items.length < r.pageSize) break;
    if (page * r.pageSize >= r.total) break;
    page += 1;
  }

  page = 1;
  for (;;) {
    const r = await fetchPropertiesListResult({
      rental: false,
      category: "real-estate",
      includeDisabled: false,
      pageSize: 100,
      page,
    });
    for (const p of r.items) {
      if (!p?.id) continue;
      const path = buildRealEstateDetailPath(p);
      if (path && path !== "/real-estate") paths.add(path);
    }
    if (!r.items.length || page >= maxPages) break;
    if (r.items.length < r.pageSize) break;
    if (page * r.pageSize >= r.total) break;
    page += 1;
  }

  return [...paths];
}

export async function buildSitemapXml(): Promise<string> {
  const base = getSiteUrl();
  if (!base) {
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  }

  const urls: { loc: string; changefreq: string; priority: string }[] = [];

  for (const s of STATIC_PATHS) {
    urls.push({
      loc: `${base}${s.path}`,
      changefreq: s.changefreq,
      priority: s.priority,
    });
  }

  try {
    const evRes: any = await getAllEvents({ listing: 1 });
    const evData = Array.isArray(evRes?.data) ? evRes.data : [];
    for (const e of evData) {
      const name = e?.name;
      const id = e?.id;
      const slug = name ? slugify(String(name)) : null;
      const segment = slug || (id != null ? String(id) : null);
      if (segment)
        urls.push({
          loc: `${base}/events/${encodeURIComponent(segment)}`,
          changefreq: "weekly",
          priority: "0.65",
        });
    }
  } catch {
    // omit dynamic events if API fails
  }

  for (const slug of VILLA_LOCATION_SLUGS) {
    const name = getLocationEntry(slug)?.name ?? slug;
    urls.push({
      loc: `${base}/villas/list?region=${encodeURIComponent(name)}`,
      changefreq: "weekly",
      priority: "0.85",
    });
  }
  for (const slug of REAL_ESTATE_LOCATION_SLUGS) {
    urls.push({ loc: `${base}/real-estate/${slug}`, changefreq: "weekly", priority: "0.85" });
  }
  for (const slug of EVENTS_LOCATION_SLUGS) {
    urls.push({ loc: `${base}/events/${slug}`, changefreq: "weekly", priority: "0.80" });
  }
  for (const slug of EXPERIENCES_LOCATION_SLUGS) {
    urls.push({ loc: `${base}/experiences/${slug}`, changefreq: "weekly", priority: "0.80" });
  }
  for (const slug of CONCIERGE_LOCATION_SLUGS) {
    urls.push({ loc: `${base}/concierge/${slug}`, changefreq: "weekly", priority: "0.80" });
  }

  try {
    const propPaths = await collectPropertyPaths();
    for (const p of propPaths) {
      urls.push({
        loc: `${base}${p}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  } catch {
    // omit properties if API fails
  }

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
}
