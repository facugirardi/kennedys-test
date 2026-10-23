import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";
import { SeoHead } from "@/components/seo/SeoHead";
import { getPublicSiteOriginFromRequest } from "@/lib/seo/config";
import AgentPortfolioLayout from "@/components/custom/AgentPortfolioLayout";
import AgentPortfolioLoggedOut from "@/components/custom/AgentPortfolioLoggedOut";
import { Kicker } from "@/components/custom/AgentPortfolioFormKit";
import { ArrowUpRight } from "lucide-react";

type PageProps = {
  siteOrigin: string;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (context) => {
  return { props: { siteOrigin: getPublicSiteOriginFromRequest(context.req) } };
};

type QuickLink = { label: string; href: string; image: string };

type QuickLinkGroup = {
  title: string;
  accent: string;
  links: QuickLink[];
};

// Every card deep-links into offer creation pre-filtered to match its label — see the prefill effect
// in pages/agent-portfolio/create.tsx (?tab=villas|concierge&region=...&managed=true). "Villas in
// Greece" has no region param: the catalogue's `region` field is island-level (Mykonos, Paros, ...)
// with no country filter on the backend, so "Greece" opens the villas tab unfiltered — the whole
// catalogue. "Management villas" isn't a region — it's the curated set of villas flagged
// `managedProperty` from kennedys-loggia, so those two cards combine that flag with a region.
const QUICK_LINK_GROUPS: QuickLinkGroup[] = [
  {
    title: "Management villas",
    accent: "#D99330", // primary
    links: [
      { label: "Mykonos", href: "/agent-portfolio/create?tab=villas&region=Mykonos&managed=true", image: "/images/Mykonos-image.jpg" },
      { label: "Paros", href: "/agent-portfolio/create?tab=villas&region=Paros&managed=true", image: "/images/paros-image.png" },
    ],
  },
  {
    title: "Direct to owners",
    accent: "#9CA6AD", // FAINT — must still read as text on PAPER
    links: [
      { label: "Villas in Greece", href: "/agent-portfolio/create?tab=villas", image: "/images/greek-island-image.png" },
      { label: "Villas in Ibiza", href: "/agent-portfolio/create?tab=villas&region=Ibiza", image: "/images/homeibiza.jpg" },
    ],
  },
  {
    title: "Concierge",
    accent: "#48A4B4", // secondary
    links: [
      { label: "Concierge packages", href: "/agent-portfolio/create?tab=concierge", image: "/images/concierge-1.png" },
    ],
  },
];

function QuickLinkCard({ link }: { link: QuickLink }) {
  return (
    <Link
      href={link.href}
      className="group relative block aspect-[4/3] overflow-hidden bg-[#EDEAE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={link.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/75 via-[#172338]/10 to-transparent" />
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
        <p className="font-gtsuper-ds text-2xl font-light text-white leading-tight">{link.label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/40 text-white transition-colors duration-300 group-hover:border-[#D99330] group-hover:bg-[#D99330]">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default function AgentPortfolioHomePage({ siteOrigin }: PageProps) {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  // Rendered unconditionally — regardless of auth state — because it's the only thing a social/link
  // preview crawler ever sees: crawlers have no session, so they always hit the same render pass a
  // logged-out visitor would, and (loading is also always true on the server, since AuthContext only
  // finishes initializing client-side) meta tags nested inside the post-loading branches below would
  // never make it into the SSR output crawlers read.
  const seoHead = (
    <SeoHead
      title="Agent Portfolio"
      description="Browse the live villa and concierge catalogue and build client offers — the B2B portfolio tool for our travel partners."
      canonicalPath="/agent-portfolio"
      siteOrigin={siteOrigin}
      imageUrl="/images/Mykonos-image.jpg"
      noindex
      suppressSiteBranding
    />
  );

  if (loading) {
    return seoHead;
  }

  if (!isAuthenticated || !user?.isAgentPortfolioAccount) {
    return (
      <>
        {seoHead}
        <AgentPortfolioLoggedOut returnTo={router.asPath} />
      </>
    );
  }

  return (
    <AgentPortfolioLayout>
      {seoHead}
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <Kicker>Catalogue</Kicker>
        <h1 className="font-gtsuper-ds text-3xl md:text-4xl font-light text-[#172338] mt-3">Where to next</h1>
        <p className="font-haas text-sm text-[#506A70] mt-3 mb-14 max-w-md">
          The live catalogues agents open most, one tap away.
        </p>

        <div className="space-y-12">
          {QUICK_LINK_GROUPS.map((group, i) => (
            <div key={group.title} className="relative pt-5 border-t border-[#DDD8CC]">
              {/* Group accent as a short rule over the hairline, not a full-width colored border. */}
              <span className="absolute -top-px left-0 h-0.5 w-12" style={{ backgroundColor: group.accent }} />
              <h2 className="flex items-baseline gap-3 font-gtsuper-ds text-xl font-light text-[#172338] mb-5">
                <span className="text-sm" style={{ color: group.accent }}>{String(i + 1).padStart(2, "0")}</span>
                {group.title}
              </h2>
              <div
                className={`grid gap-4 ${
                  group.links.length === 1 ? "grid-cols-1 sm:max-w-xs" : "grid-cols-1 sm:grid-cols-2 max-w-2xl"
                }`}
              >
                {group.links.map((link) => (
                  <QuickLinkCard key={link.label} link={link} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AgentPortfolioLayout>
  );
}
