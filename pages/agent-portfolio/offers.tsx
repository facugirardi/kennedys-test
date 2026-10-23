import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Check, Link2, MoreHorizontal, Plus, Search } from "lucide-react";
import { useAuth } from "@/src/contexts/AuthContext";
import { SeoHead } from "@/components/seo/SeoHead";
import { getMyOffers, deleteShareProperty } from "@/app/lib/api/sharePropertiy";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AgentPortfolioLayout from "@/components/custom/AgentPortfolioLayout";
import AgentPortfolioLoggedOut from "@/components/custom/AgentPortfolioLoggedOut";
import { Kicker, FAINT, GOLD, HAIRLINE, INK, SAND, STONE } from "@/components/custom/AgentPortfolioFormKit";

type OfferType = "rental" | "concierge" | "events" | "real-estate";

/** List-mode row from GET /shared-property/mine (kennedys-api sharedPropertyService
 * getAllSharedProperties with list: true) — no propertiesToPresent JSON, just these light fields. */
type OfferRow = {
  id: string;
  title?: string;
  welcomeTitle?: string;
  slug: string;
  createdAt: string;
  offerName?: string;
  clientDisplayName?: string;
  branded?: boolean;
  offerType?: OfferType;
  sectionCount?: number;
};

const OFFER_TYPES: Record<OfferType, { label: string; color: string }> = {
  rental: { label: "Villas", color: GOLD },
  concierge: { label: "Concierge", color: "#48A4B4" }, // secondary
  events: { label: "Events", color: FAINT },
  "real-estate": { label: "Real estate", color: FAINT },
};

const offerTypeOf = (offer: OfferRow): OfferType => (offer.offerType && OFFER_TYPES[offer.offerType] ? offer.offerType : "rental");
const offerNameOf = (offer: OfferRow) => offer.offerName || offer.title || "Untitled offer";

/** Fixed "12 Sep 2026" regardless of the browser locale (toLocaleDateString() varies per agent). */
const formatOfferDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** Understated text actions, not bordered pill buttons — same link treatment as the Home catalogue
 * cards (underline-on-hover, primary on hover), so a row reads as one line rather than a button bar. */
const rowLinkClass =
  "font-haas text-sm text-[#506A70] underline decoration-transparent decoration-1 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline-none focus-visible:text-primary";

const capsLabelClass = "font-haas text-[10px] uppercase tracking-[0.2em]";

/** Desktop column template, shared by the header row and every offer row so they line up. */
const GRID_COLS = "md:grid md:grid-cols-[minmax(0,1fr)_170px_120px_110px_auto] md:items-center md:gap-6";

export default function AgentPortfolioOffersPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OfferType | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setOffersLoading(true);
    setOffersError(null);
    getMyOffers()
      .then((res: any) => {
        if (!res?.success) {
          setOffersError(res?.message || "Could not load your offers.");
          return;
        }
        const rows: OfferRow[] = Array.isArray(res?.data) ? res.data : [];
        rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOffers(rows);
      })
      .finally(() => setOffersLoading(false));
  }, [isAuthenticated, reloadToken]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const result = await deleteShareProperty(id);
      if (!result?.success) {
        setDeleteError(result?.message || "Could not delete this offer. Please try again.");
        return;
      }
      setOffers((prev) => prev.filter((o) => o.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setDeletingId(null);
    }
  };

  // Only offer the type filters this agent actually has offers for — an empty "Events" chip is noise.
  const availableTypes = useMemo(
    () => (Object.keys(OFFER_TYPES) as OfferType[]).filter((t) => offers.some((o) => offerTypeOf(o) === t)),
    [offers]
  );

  const visibleOffers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((o) => {
      if (typeFilter !== "all" && offerTypeOf(o) !== typeFilter) return false;
      if (!q) return true;
      return [offerNameOf(o), o.clientDisplayName || ""].some((v) => v.toLowerCase().includes(q));
    });
  }, [offers, query, typeFilter]);

  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  // window.location.origin, not getSiteUrl(): the portfolio is served on more than one domain
  // (kennedysgroup.com and agents-portfolio.com), and the link should match the one the agent uses.
  const handleCopyLink = async (offer: OfferRow) => {
    const url = `${window.location.origin}/agent-offers/${offer.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
      return;
    }
    setCopiedId(offer.id);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user?.isAgentPortfolioAccount) {
    return <AgentPortfolioLoggedOut returnTo={router.asPath} />;
  }

  return (
    <AgentPortfolioLayout>
      <SeoHead
        title="My Offers | Agent Portfolio"
        description="Manage and share your property offers."
        canonicalPath="/agent-portfolio/offers"
        noindex
        suppressSiteBranding
      />
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-10">
          <div>
            <Kicker>Offers</Kicker>
            <h1 className="font-gtsuper-ds text-3xl md:text-4xl font-light text-[#172338] mt-3">My offers</h1>
            <p className="font-haas text-sm text-[#506A70] mt-3">
              {offersLoading ? "Loading…" : `${offers.length} offer${offers.length === 1 ? "" : "s"} shared with clients`}
            </p>
          </div>
          <Button type="button" className="font-normal" onClick={() => router.push("/agent-portfolio/create")}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New offer
          </Button>
        </div>

        {offersError && (
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 px-4 py-3 mb-6">
            <p className="text-sm text-red-600">{offersError}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => setReloadToken((n) => n + 1)}>
              Retry
            </Button>
          </div>
        )}
        {deleteError && <p className="text-sm text-red-600 mb-6">{deleteError}</p>}

        {!offersLoading && offers.length > 0 && (
          <div className="flex items-center gap-6 flex-wrap mb-6">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2" strokeWidth={1.5} style={{ color: FAINT }} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by offer or client"
                aria-label="Search offers"
                className="w-full border-0 border-b bg-transparent py-2 pl-6 font-haas text-sm text-[#172338] outline-none transition-colors placeholder:text-[#B8BCC2] focus:border-[#D99330]"
                style={{ borderColor: HAIRLINE }}
              />
            </div>
            {availableTypes.length > 1 && (
              <div className="flex items-center gap-2" role="group" aria-label="Offer type">
                {(["all", ...availableTypes] as const).map((t) => {
                  const active = typeFilter === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTypeFilter(t)}
                      className={`border px-3.5 py-1.5 font-haas text-xs transition-colors focus-visible:outline-none focus-visible:border-[#D99330] ${
                        active
                          ? "border-[#172338] bg-[#172338] text-white"
                          : "border-[#DDD8CC] text-[#506A70] hover:border-[#9CA6AD] hover:text-[#172338]"
                      }`}
                    >
                      {t === "all" ? "All" : OFFER_TYPES[t].label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {offersLoading && (
          <div className="border-t" style={{ borderColor: HAIRLINE }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-5 border-b flex items-center justify-between gap-4 animate-pulse" style={{ borderColor: HAIRLINE }}>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-1/3" style={{ backgroundColor: SAND }} />
                  <div className="h-3 w-1/5" style={{ backgroundColor: SAND }} />
                </div>
                <div className="h-4 w-40 flex-shrink-0" style={{ backgroundColor: SAND }} />
              </div>
            ))}
          </div>
        )}

        {!offersLoading && offers.length === 0 && !offersError && (
          <div className="border-t pt-14 pb-6 text-center" style={{ borderColor: HAIRLINE }}>
            <p className={capsLabelClass} style={{ color: GOLD }}>No offers yet</p>
            <h2 className="font-gtsuper-ds text-2xl font-light text-[#172338] mt-3">Your first offer starts here</h2>
            <p className="font-haas text-sm text-[#506A70] mt-2 mb-7 max-w-sm mx-auto">
              Pick villas and concierge packages from the catalogue, then share a link with your client in minutes.
            </p>
            <Button type="button" className="font-normal" onClick={() => router.push("/agent-portfolio/create")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Create your first offer
            </Button>
          </div>
        )}

        {!offersLoading && offers.length > 0 && (
          <div>
            <div className={`hidden ${GRID_COLS} border-b pb-3`} style={{ borderColor: HAIRLINE }}>
              {["Offer", "Client", "Type", "Created", ""].map((h, i) => (
                <span key={i} className={capsLabelClass} style={{ color: FAINT }}>{h}</span>
              ))}
            </div>

            {visibleOffers.length === 0 && (
              <p className="py-12 text-center font-haas text-sm" style={{ color: FAINT }}>
                No offers match your search.
              </p>
            )}

            {visibleOffers.map((offer) => {
              const isConfirming = confirmDeleteId === offer.id;
              const isDeleting = deletingId === offer.id;
              const isCopied = copiedId === offer.id;
              const name = offerNameOf(offer);
              const type = OFFER_TYPES[offerTypeOf(offer)];
              const sections = offer.sectionCount ?? 0;
              const meta = [
                sections > 0 ? `${sections} section${sections === 1 ? "" : "s"}` : "",
                offer.branded ? "Branded" : "",
              ].filter(Boolean);
              return (
                <div
                  key={offer.id}
                  className={`group relative -mx-3 px-3 py-4 border-b transition-colors hover:bg-white/70 ${GRID_COLS}`}
                  style={{ borderColor: HAIRLINE }}
                >
                  <div className="min-w-0">
                    <p className="font-gtsuper-ds text-lg font-light leading-snug truncate" style={{ color: INK }} title={name}>
                      {name}
                    </p>
                    {meta.length > 0 && (
                      <p className="font-haas text-xs mt-0.5 truncate" style={{ color: FAINT }}>{meta.join(" · ")}</p>
                    )}
                  </div>

                  {/* Mobile stacks client / type / date as one line under the name. */}
                  <p className="mt-1.5 font-haas text-xs md:mt-0 md:text-sm truncate" style={{ color: offer.clientDisplayName ? STONE : FAINT }}>
                    {offer.clientDisplayName || "—"}
                  </p>
                  <span className={`${capsLabelClass} mt-1.5 flex items-center gap-1.5 md:mt-0`} style={{ color: STONE }}>
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.label}
                  </span>
                  <span className="mt-1 block font-haas text-xs md:mt-0 md:text-sm tabular-nums" style={{ color: STONE }}>
                    {formatOfferDate(offer.createdAt)}
                  </span>

                  <div className="mt-3 flex items-center gap-5 md:mt-0 md:justify-end">
                    {isConfirming ? (
                      <>
                        <span className="font-haas text-xs text-[#506A70]">Delete this offer?</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => handleDelete(offer.id)}
                        >
                          {isDeleting ? "Deleting..." : "Confirm"}
                        </Button>
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => setConfirmDeleteId(null)}
                          className={rowLinkClass}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(offer)}
                          aria-label={`Copy link to ${name}`}
                          className={`flex items-center gap-1.5 border px-3 py-1.5 font-haas text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:border-[#D99330] ${
                            isCopied
                              ? "border-[#D99330] text-[#B27626]"
                              : "border-[#DDD8CC] text-[#172338] hover:border-[#172338]"
                          }`}
                        >
                          {isCopied ? <Check className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
                          {isCopied ? "Copied" : "Copy link"}
                        </button>
                        <a href={`/agent-offers/${offer.slug}`} target="_blank" rel="noreferrer" className={rowLinkClass}>
                          View
                        </a>
                        <button
                          type="button"
                          onClick={() => router.push(`/agent-portfolio/create?id=${offer.id}`)}
                          className={rowLinkClass}
                        >
                          Edit
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              aria-label={`More actions for ${name}`}
                              className="flex h-7 w-7 items-center justify-center text-[#9CA6AD] transition-colors hover:text-[#172338] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D99330]"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-none border-[#DDD8CC] bg-white p-1 font-haas">
                            <DropdownMenuItem
                              className="rounded-none text-red-600 focus:bg-red-50 focus:text-red-600"
                              onSelect={() => setConfirmDeleteId(offer.id)}
                            >
                              Delete offer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AgentPortfolioLayout>
  );
}
