import type { GetServerSidePropsContext } from "next";
import SharedItineraryContent from "@/components/shared-itinerary/SharedItineraryContent";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.kennedys.group/api").replace(/\/+$/, "");
const SITE_NAME = "Kennedy's Group";

async function fetchItinerary(slug: string) {
  try {
    const res = await fetch(`${API_URL}/itinerary/by-slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const slug = context.params?.slug as string | undefined;
  if (!slug) return { notFound: true };

  const itinerary = await fetchItinerary(slug);

  const rawTitle = (itinerary?.title || itinerary?.name || "Itinerary").trim();
  const rawDesc = typeof itinerary?.description === "string" ? itinerary.description : "";
  const description = rawDesc
    ? stripHtml(rawDesc).slice(0, 160)
    : `${rawTitle} — ${SITE_NAME}`;

  return {
    props: {
      itinerary: itinerary ?? null,
      // _app.tsx reads initialSeoMeta to set OG + Twitter tags (same pattern as other pages)
      initialSeoMeta: itinerary
        ? {
            title: `${rawTitle} | ${SITE_NAME}`,
            description,
            imageUrl: itinerary.imageUrl ?? null,
          }
        : null,
      siteOrigin: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kennedysgroup.com").replace(/\/+$/, ""),
    },
  };
}

export default function ItineraryPage({ itinerary }: { itinerary: any }) {
  return <SharedItineraryContent itinerary={itinerary} error={!itinerary} />;
}
