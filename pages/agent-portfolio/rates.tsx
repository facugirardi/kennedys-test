import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/src/contexts/AuthContext";
import { SeoHead } from "@/components/seo/SeoHead";
import { getAllProperties, getFilterOptions } from "@/lib/api/properties";
import { getAgentRateQuote, type AgentRateQuote } from "@/lib/api/agentRates";
import { normalizePropertiesResponse, resolveMediaUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import AgentPortfolioLayout from "@/components/custom/AgentPortfolioLayout";
import AgentPortfolioLoggedOut from "@/components/custom/AgentPortfolioLoggedOut";
import { fieldInputClass, fieldLabelClass, SelectField, Kicker, GOLD, INK, STONE, HAIRLINE, FAINT, SAND } from "@/components/custom/AgentPortfolioFormKit";
import { Check, X } from "lucide-react";
import StayDatesPicker from "@/components/custom/AgentPortfolioStayDatesPicker";

/** Same resolution logic as create.tsx's getVillaImageUrl / pages/villas/list — list results carry
 * images in `property.images[]`, not a flat `mainImage` field. Returns "" when the villa has no
 * image, and callers render an empty sand tile instead of a stock photo (no mock fallbacks). */
function getVillaImageUrl(property: any): string {
  const images = property?.images;
  if (property?.mainImage) return resolveMediaUrl(property.mainImage) || "";
  if (!Array.isArray(images) || images.length === 0) return "";
  const primary = images.find((img: any) => {
    const p = img?.isPrimary ?? img?.is_primary ?? img?.primary;
    return p === true || p === "true" || p === 1;
  });
  const entry = primary ?? images[0];
  const raw = typeof entry === "string" ? entry : (entry?.urlImage ?? entry?.url ?? entry?.image ?? "");
  if (!raw || String(raw).trim() === "") return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return resolveMediaUrl(raw) || "";
}

const DEFAULT_MARKUP_PCT = 20;
const MARKUP_PRESETS = [10, 15, 20, 25];
const PAGE_SIZE = 12;

const formatEur = (n: number) => `€${Math.round(n).toLocaleString()}`;

function VillaThumb({ property, className }: { property: any; className: string }) {
  const src = getVillaImageUrl(property);
  return (
    <div className={`${className} overflow-hidden`} style={{ backgroundColor: SAND }}>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

/** One line of the folio: label, dotted leader, right-aligned figure. */
function FolioLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 font-haas text-sm">
      <span style={{ color: strong ? INK : STONE }} className={strong ? "font-medium" : ""}>{label}</span>
      <span className="flex-1 border-b border-dotted translate-y-[-3px]" style={{ borderColor: HAIRLINE }} />
      <span className={`tabular-nums ${strong ? "font-medium" : ""}`} style={{ color: INK }}>{value}</span>
    </div>
  );
}

const capsLabelClass = "font-haas text-[10px] uppercase tracking-[0.2em]";

function RatesPageContent() {
  const [villaQuery, setVillaQuery] = useState("");
  const [villaRegion, setVillaRegion] = useState("");
  const [managedOnly, setManagedOnly] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [villaResults, setVillaResults] = useState<any[]>([]);
  const [villaSearching, setVillaSearching] = useState(true);
  const [villaPage, setVillaPage] = useState(1);
  const [villaTotal, setVillaTotal] = useState(0);

  const [selectedVilla, setSelectedVilla] = useState<any | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [quote, setQuote] = useState<AgentRateQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [markupPct, setMarkupPct] = useState<number | string>(DEFAULT_MARKUP_PCT);

  useEffect(() => {
    getFilterOptions({ rental: true })
      .then((res: any) => setRegions(Array.isArray(res?.data?.regions) ? res.data.regions : []))
      .catch(() => {});
  }, []);

  // The list stays live while a villa is selected — the whole point of the split view is being able
  // to click through villas and compare quotes for the same dates without leaving the catalogue.
  useEffect(() => {
    const handle = setTimeout(async () => {
      setVillaSearching(true);
      try {
        const q = villaQuery.trim();
        const raw = await getAllProperties({
          rental: true,
          ...(q ? { searchQuery: q } : {}),
          ...(villaRegion ? { region: villaRegion } : {}),
          // Backend only filters on managedProperty=true (no "direct only" filter), hence a toggle.
          ...(managedOnly ? { managedProperty: true } : {}),
          page: villaPage,
          pageSize: PAGE_SIZE,
        });
        // Management villas first — within the current page only, since sorting happens client-side
        // (a stable sort, so relative order otherwise stays whatever the backend returned).
        const results = normalizePropertiesResponse(raw);
        const sorted = [...results].sort((a: any, b: any) => Number(Boolean(b.managedProperty)) - Number(Boolean(a.managedProperty)));
        setVillaResults(sorted);
        setVillaTotal(typeof raw?.data?.total === "number" ? raw.data.total : 0);
      } catch {
        setVillaResults([]);
      } finally {
        setVillaSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [villaQuery, villaRegion, managedOnly, villaPage]);

  useEffect(() => {
    setVillaPage(1);
  }, [villaQuery, villaRegion, managedOnly]);

  useEffect(() => {
    if (!selectedVilla || !checkIn || !checkOut) {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    if (checkOut <= checkIn) {
      setQuoteError("Check-out must be after check-in.");
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError(null);
    getAgentRateQuote(selectedVilla.id, checkIn, checkOut)
      .then((res: any) => {
        if (cancelled) return;
        if (res?.success === false) {
          setQuoteError(res?.message || "Could not compute this villa's rate.");
          setQuote(null);
          return;
        }
        setQuote(res.data);
      })
      .catch(() => {
        if (!cancelled) setQuoteError("Could not compute this villa's rate.");
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedVilla, checkIn, checkOut]);

  const villaTotalPages = Math.max(1, Math.ceil(villaTotal / PAGE_SIZE));
  const markupPctNumber = markupPct === "" ? 0 : Number(markupPct) || 0;
  const clientPrice = quote ? Math.round(quote.netToAgentTotal * (1 + markupPctNumber / 100)) : null;
  const agentMargin = quote && clientPrice !== null ? clientPrice - Math.round(quote.netToAgentTotal) : null;
  const isPreset = MARKUP_PRESETS.includes(markupPctNumber) && markupPct !== "";

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
      <Kicker>Rates</Kicker>
      <h1 className="font-gtsuper-ds text-3xl md:text-4xl font-light mt-3" style={{ color: INK }}>Villa rates</h1>
      <p className="font-haas text-sm leading-relaxed mt-3 mb-10 max-w-md" style={{ color: STONE }}>
        Pick a villa and your dates to see the net-to-agent rate, then set your own markup to price your client.
      </p>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12 lg:items-start">
        {/* Catalogue */}
        <section aria-label="Villas">
          <div className="flex items-end gap-6 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className={fieldLabelClass}>Search</label>
              <Input
                className={fieldInputClass}
                placeholder="Villa name"
                value={villaQuery}
                onChange={(e) => setVillaQuery(e.target.value)}
              />
            </div>
            <div className="min-w-[170px] shrink-0">
              <label className={fieldLabelClass}>Region</label>
              <SelectField value={villaRegion} onChange={setVillaRegion} options={regions} placeholder="All regions" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 mb-4" role="group" aria-label="Villa type">
            {[
              { label: "All villas", value: false },
              { label: "Kennedy's managed", value: true },
            ].map((opt) => {
              const active = managedOnly === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setManagedOnly(opt.value)}
                  className={`border px-3.5 py-1.5 font-haas text-xs transition-colors focus-visible:outline-none focus-visible:border-[#D99330] ${
                    active
                      ? "border-[#172338] bg-[#172338] text-white"
                      : "border-[#DDD8CC] text-[#506A70] hover:border-[#9CA6AD] hover:text-[#172338]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            {!villaSearching && villaTotal > 0 && (
              <span className="ml-auto font-haas text-xs tabular-nums" style={{ color: FAINT }}>
                {villaTotal} villa{villaTotal === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <ul className="border-t" style={{ borderColor: HAIRLINE }}>
            {villaSearching &&
              Array.from({ length: 6 }).map((_, i) => (
                <li key={`skeleton-${i}`} className="flex items-center gap-4 py-3 border-b animate-pulse" style={{ borderColor: HAIRLINE }}>
                  <div className="h-14 w-20 shrink-0" style={{ backgroundColor: SAND }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3" style={{ backgroundColor: SAND }} />
                    <div className="h-3 w-1/4" style={{ backgroundColor: SAND }} />
                  </div>
                </li>
              ))}
            {!villaSearching && villaResults.length === 0 && (
              <li className="py-12 text-center font-haas text-sm" style={{ color: FAINT }}>
                No villas found for these filters.
              </li>
            )}
            {!villaSearching &&
              villaResults.map((property) => {
                const selected = selectedVilla?.id === property.id;
                return (
                  <li key={property.id} className="border-b" style={{ borderColor: HAIRLINE }}>
                    {/* Negative margin so thumbnails line up with the filters above, while the
                        hover/selected highlight still gets some breathing room on both sides. */}
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSelectedVilla(property)}
                      className={`group relative -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-4 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:bg-white ${
                        selected ? "" : "hover:bg-white/70"
                      }`}
                    >
                      <span
                        className={`absolute left-0 top-2 bottom-2 w-[3px] transition-colors ${selected ? "bg-[#D99330]" : "bg-transparent"}`}
                      />
                      <VillaThumb property={property} className="h-14 w-20 shrink-0" />
                      <span className="min-w-0 flex-1">
                        {/* Darker gold (primary-dark) for the title: plain #D99330 is too light for
                            17px serif text on PAPER. */}
                        <span
                          className={`block font-gtsuper-ds text-[17px] font-light leading-snug truncate transition-colors ${
                            selected ? "text-[#B27626]" : "text-[#172338]"
                          }`}
                        >
                          {property.title}
                        </span>
                        {(property.visibleLocation || property.location) && (
                          <span className="block font-haas text-xs mt-0.5 truncate" style={{ color: STONE }}>
                            {property.visibleLocation || property.location}
                          </span>
                        )}
                      </span>
                      {property.managedProperty && (
                        <span className={`${capsLabelClass} hidden sm:flex items-center gap-1.5 shrink-0`} style={{ color: GOLD }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                          Managed
                        </span>
                      )}
                      {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} style={{ color: GOLD }} aria-hidden />}
                    </button>
                  </li>
                );
              })}
          </ul>

          {villaTotalPages > 1 && !villaSearching && (
            <div className="flex items-center justify-center gap-6 mt-8 font-haas text-sm">
              <button
                type="button"
                onClick={() => setVillaPage((p) => Math.max(1, p - 1))}
                disabled={villaPage === 1}
                className="text-[#9CA6AD] hover:text-[#172338] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <span className="tabular-nums" style={{ color: STONE }}>Page {villaPage} of {villaTotalPages}</span>
              <button
                type="button"
                onClick={() => setVillaPage((p) => Math.min(villaTotalPages, p + 1))}
                disabled={villaPage === villaTotalPages}
                className="text-[#9CA6AD] hover:text-[#172338] disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Mobile/tablet: the quote opens as a bottom sheet over the list. */}
        {selectedVilla && (
          <button
            type="button"
            aria-label="Close quote"
            onClick={() => setSelectedVilla(null)}
            className="lg:hidden fixed inset-0 md:left-60 z-30 bg-[#172338]/40"
          />
        )}

        {/* Quote folio. Capped at the viewport height so the whole quote fits without scrolling the
            page: compact villa header on top, a scrollable middle, and the client price pinned at the
            bottom so it stays in view while the agent plays with dates and markup. */}
        <aside
          aria-label="Quote"
          className={`${selectedVilla ? "fixed flex" : "hidden"} flex-col inset-x-0 md:left-60 bottom-0 z-40 max-h-[88vh] border-t lg:flex lg:z-auto lg:sticky lg:top-10 lg:max-h-[calc(100vh-5rem)] lg:border`}
          style={{ borderColor: HAIRLINE, backgroundColor: "#FFFFFF" }}
        >
          {!selectedVilla ? (
            <div className="px-8 py-16 text-center">
              <p className={capsLabelClass} style={{ color: GOLD }}>Quote</p>
              <p className="font-gtsuper-ds text-xl font-light mt-3" style={{ color: INK }}>Select a villa</p>
              <p className="font-haas text-sm mt-2 max-w-[240px] mx-auto" style={{ color: STONE }}>
                Its net-to-agent rate and your client price will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b px-5 py-4" style={{ borderColor: HAIRLINE }}>
                <VillaThumb property={selectedVilla} className="h-12 w-16 shrink-0" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-gtsuper-ds text-xl font-light leading-tight truncate" style={{ color: INK }}>
                    {selectedVilla.title}
                  </h2>
                  <p className="mt-0.5 font-haas text-xs truncate" style={{ color: STONE }}>
                    {selectedVilla.visibleLocation || selectedVilla.location}
                    {selectedVilla.managedProperty && (
                      <span style={{ color: GOLD }}>
                        {(selectedVilla.visibleLocation || selectedVilla.location) ? " · " : ""}Kennedy&apos;s managed
                      </span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVilla(null)}
                  aria-label="Clear villa"
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-[#9CA6AD] transition-colors hover:text-[#172338] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D99330]"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <label className={`${capsLabelClass} block`} style={{ color: FAINT }}>Dates</label>
                <StayDatesPicker
                  placeholder="Check-in → Check-out"
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(nextIn, nextOut) => {
                    setCheckIn(nextIn);
                    setCheckOut(nextOut);
                  }}
                />

                {(!checkIn || !checkOut) && !quoteError && (
                  <p className="font-haas text-sm mt-4" style={{ color: FAINT }}>Choose dates to calculate the rate.</p>
                )}
                {quoteLoading && <p className="font-haas text-sm mt-4" style={{ color: FAINT }}>Calculating rate…</p>}
                {quoteError && <p className="font-haas text-sm text-red-500 mt-4">{quoteError}</p>}

                {quote && !quoteLoading && quote.pricedNights === 0 && (
                  <div className="mt-5 px-4 py-5 text-center" style={{ backgroundColor: SAND }}>
                    <p className="font-gtsuper-ds text-lg font-light" style={{ color: INK }}>No rates for these dates</p>
                    <p className="font-haas text-sm mt-1.5" style={{ color: STONE }}>
                      This villa has no rate card covering this stay yet. Try other dates or contact Kennedy&apos;s.
                    </p>
                  </div>
                )}

                {quote && !quoteLoading && quote.pricedNights > 0 && (
                  <>
                    {quote.pricedNights < quote.nights && (
                      <p className="font-haas text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-4">
                        No rate for {quote.nights - quote.pricedNights} of {quote.nights} nights — total may be incomplete.
                      </p>
                    )}

                    <div className="mt-5 space-y-2 pb-4 border-b" style={{ borderColor: HAIRLINE }}>
                      <FolioLine label="Net to owner" value={formatEur(quote.netOwnerTotal)} />
                      <FolioLine
                        label={`${quote.managedProperty ? "Management fee" : "Commission"}${quote.isOverride ? " (custom)" : ""} · ${quote.appliedPct}%`}
                        value={`+${formatEur(quote.netToAgentTotal - quote.netOwnerTotal)}`}
                      />
                      <div className="pt-1">
                        <FolioLine label="Net to agent" value={formatEur(quote.netToAgentTotal)} strong />
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-baseline justify-between">
                        <span className={capsLabelClass} style={{ color: FAINT }}>Your markup</span>
                        <span className="font-haas text-[11px]" style={{ color: FAINT }}>Recommended {DEFAULT_MARKUP_PCT}%</span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                        {MARKUP_PRESETS.map((pct) => {
                          const active = markupPct !== "" && markupPctNumber === pct;
                          return (
                            <button
                              key={pct}
                              type="button"
                              aria-pressed={active}
                              onClick={() => setMarkupPct(pct)}
                              className={`border py-2 font-haas text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:border-[#D99330] ${
                                active
                                  ? "border-[#172338] bg-[#172338] text-white"
                                  : "border-[#DDD8CC] text-[#506A70] hover:border-[#9CA6AD] hover:text-[#172338]"
                              }`}
                            >
                              {pct}%
                            </button>
                          );
                        })}
                        <div
                          className={`flex items-center border px-2 transition-colors focus-within:border-[#D99330] ${
                            !isPreset ? "border-[#172338]" : "border-[#DDD8CC]"
                          }`}
                        >
                          <input
                            type="number"
                            min={0}
                            aria-label="Custom markup percentage"
                            placeholder="—"
                            value={isPreset ? "" : markupPct}
                            onChange={(e) => setMarkupPct(e.target.value)}
                            onBlur={(e) => {
                              // An empty box while a preset is active is just the box not being in use.
                              if (e.target.value === "" && isPreset) return;
                              if (e.target.value === "" || isNaN(Number(e.target.value)) || Number(e.target.value) < 0) {
                                setMarkupPct(DEFAULT_MARKUP_PCT);
                              }
                            }}
                            className="w-full min-w-0 bg-transparent py-2 text-right font-haas text-sm tabular-nums text-[#172338] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-[#B8BCC2]"
                          />
                          <span className="font-haas text-sm" style={{ color: FAINT }}>%</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {quote && !quoteLoading && quote.pricedNights > 0 && (
                <div className="shrink-0 px-5 py-4 text-white" style={{ backgroundColor: INK }}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={capsLabelClass} style={{ color: "rgba(255,255,255,0.55)" }}>Client price</span>
                    <span className="font-gtsuper-ds text-3xl font-light tabular-nums">
                      {clientPrice !== null ? formatEur(clientPrice) : ""}
                    </span>
                  </div>
                  {agentMargin !== null && (
                    <div className="mt-2 flex items-baseline justify-between font-haas text-sm">
                      <span className="text-white/55">Your margin</span>
                      <span className="tabular-nums" style={{ color: GOLD }}>+{formatEur(agentMargin)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

export default function AgentPortfolioRatesPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user?.isAgentPortfolioAccount) {
    return <AgentPortfolioLoggedOut returnTo={router.asPath} />;
  }

  return (
    <AgentPortfolioLayout>
      <SeoHead
        title="Villa Rates | Agent Portfolio"
        description="See Net to Agent rates for our villas and set your own markup."
        canonicalPath="/agent-portfolio/rates"
        noindex
        suppressSiteBranding
      />
      <RatesPageContent />
    </AgentPortfolioLayout>
  );
}
