import { getLocationEntry } from "@/lib/locationSlugs";

const FOOTER_RENTAL_DESTINATION_SLUGS = [
  { label: "Mykonos", slug: "mykonos" },
  { label: "Santorini", slug: "santorini" },
  { label: "Paros", slug: "paros" },
  { label: "Antiparos", slug: "antiparos" },
  { label: "Corfu", slug: "corfu" },
  { label: "Athens Riviera", slug: "athens-riviera" },
  { label: "Crete", slug: "crete" },
  { label: "Ibiza", slug: "ibiza" },
  { label: "Mallorca", slug: "mallorca" },
  { label: "Saint Tropez", slug: "saint-tropez" },
  { label: "Saint Barth", slug: "st-barts" },
  { label: "Courchevel", slug: "courchevel" },
  { label: "Tulum", slug: "tulum" },
  { label: "Costa Rica", slug: "costa-rica" },
] as const;

/** Igual que el CTA "View all X villas" de /villas/location/[location]: filtra el listado por región. */
export const FOOTER_RENTAL_DESTINATIONS = FOOTER_RENTAL_DESTINATION_SLUGS.map(({ label, slug }) => ({
  label,
  href: `/villas/list?region=${encodeURIComponent(getLocationEntry(slug)?.name ?? label)}`,
}));

export const FOOTER_EXPLORE_LINKS = [
  { label: "Villas", href: "/villas" },
  { label: "Concierge", href: "/concierge" },
  { label: "Events", href: "/events" },
  { label: "Real Estate", href: "/real-estate" },
  { label: "Travel Design", href: "/experiences" },
] as const;

export const FOOTER_COMPANY_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "We are on the News", href: "/#news" },
  { label: "Login", href: "/login" },
  { label: "Sitemap", href: "/#sitemap" },
] as const;

export const FOOTER_SERVICE_LINKS = [
  { label: "Yacht", href: "/concierge/list?type=Yacht" },
  { label: "Private Jet", href: "/concierge/list?type=PrivateJet" },
  { label: "Helicopter", href: "/concierge/list?type=Helicopter" },
  { label: "Chauffeur", href: "/concierge/list?type=Chauffeur" },
  { label: "Chef", href: "/concierge/list?type=Chef" },
  { label: "Other", href: "/concierge/list?type=Other" },
] as const;
