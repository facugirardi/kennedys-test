import type { GetServerSidePropsContext } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.kennedys.group/api").replace(/\/+$/, "");

const DESTINATION_BY_ITEM_TYPE: Record<string, string> = {
  villa: "/villas/list",
  "real-estate": "/real-estate/list",
  concierge: "/concierge/list",
};

async function fetchPromoPage(slug: string) {
  try {
    const res = await fetch(`${API_URL}/promo-page/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * A Promo Page has no UI of its own: it's a curated set of ids that scopes the real
 * villas/real-estate/concierge list page (same filters, map view, etc.), so we redirect
 * straight to that list page with `?promo=<slug>` for it to pick up.
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const slug = context.params?.slug as string | undefined;
  if (!slug) return { notFound: true };

  const promoPage = await fetchPromoPage(slug);
  if (!promoPage || promoPage.published === false) {
    return { notFound: true };
  }

  const destination = DESTINATION_BY_ITEM_TYPE[promoPage.itemType];
  if (!destination) return { notFound: true };

  return {
    redirect: {
      destination: `${destination}?promo=${encodeURIComponent(slug)}`,
      permanent: false,
    },
  };
}

export default function PromoPageRedirect() {
  return null;
}
