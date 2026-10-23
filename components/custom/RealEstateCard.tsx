import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

type RealEstateCardProps = {
  title: string;
  /** Place line, e.g. "Greece, Glyfada". */
  location: string;
  /** Price as already formatted by the caller ("3,950,000" or "Price on request"). */
  price: string;
  saleListingCurrency?: "eur" | "usd";
  /** Main photo; used when `images` is empty. */
  image: string;
  /** Photo carousel (hover arrows). */
  images?: string[];
  typeLabel?: string;
  badge?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  buildSqm?: number | null;
  plotSqm?: number | null;
  isLand?: boolean;
  liked?: boolean;
  isTogglingFavorite?: boolean;
  showFavorite?: boolean;
  onToggleFavorite?: () => void;
  href?: string;
  onClick?: () => void;
  /** Image aspect ratio class. */
  aspect?: string;
  className?: string;
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

function factsLine(p: Pick<RealEstateCardProps, "bedrooms" | "bathrooms" | "buildSqm" | "plotSqm" | "isLand">): string[] {
  const out: string[] = [];
  if (p.bedrooms && p.bedrooms > 0) out.push(`${p.bedrooms} ${p.bedrooms === 1 ? "bedroom" : "bedrooms"}`);
  if (p.bathrooms && p.bathrooms > 0) out.push(`${p.bathrooms} ${p.bathrooms === 1 ? "bath" : "baths"}`);
  if (!p.isLand && p.buildSqm) out.push(`${fmt(p.buildSqm)} m²`);
  if (p.plotSqm) out.push(`${fmt(p.plotSqm)} m² plot`);
  return out;
}

export function RealEstateCard({
  title,
  location,
  price,
  saleListingCurrency = "eur",
  image,
  images,
  typeLabel,
  badge,
  bedrooms,
  bathrooms,
  buildSqm,
  plotSqm,
  isLand,
  liked = false,
  isTogglingFavorite = false,
  showFavorite = true,
  onToggleFavorite,
  href,
  onClick,
  aspect = "aspect-[4/3]",
  className,
}: RealEstateCardProps) {
  const [index, setIndex] = useState(0);
  const photos = images && images.length > 0 ? images : image ? [image] : [];
  const total = photos.length;
  const facts = factsLine({ bedrooms, bathrooms, buildSqm, plotSqm, isLand });
  const priceLabel = price === "Price on request" || !price ? "Price on request" : `${saleListingCurrency === "usd" ? "$" : "€"}${price}`;
  const kicker = [typeLabel, location].filter(Boolean).join(" · ");

  const step = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (total < 2) return;
    setIndex((i) => (i + dir + total) % total);
  };

  const Wrapper: React.ElementType = href ? Link : "div";
  const wrapperProps = href ? { href, onClick } : { onClick };

  return (
    <article className={cn("group relative w-full cursor-pointer", className)}>
      <Wrapper {...wrapperProps} className="block">
        <div className={cn("relative max-h-[80svh] overflow-hidden bg-[#ECE7DE]", aspect)}>
          {photos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${i}`}
              src={src}
              alt={i === 0 ? title : ""}
              loading={i === 0 ? undefined : "lazy"}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] group-hover:scale-[1.04] motion-reduce:transition-none",
                EASE,
                i === index ? "opacity-100" : "opacity-0"
              )}
            />
          ))}

          {badge && (
            <span className="pointer-events-none absolute left-4 top-4 bg-[#F7F5F0]/90 px-2.5 py-1 font-haas text-[10px] uppercase tracking-[0.2em] text-[#172338]">
              {badge}
            </span>
          )}

          {showFavorite && (
            <button
              type="button"
              aria-label={liked ? "Remove from favourites" : "Save to favourites"}
              aria-pressed={liked}
              disabled={isTogglingFavorite || !onToggleFavorite}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.();
              }}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F5F0]/90 text-[#172338] transition-colors hover:bg-white disabled:opacity-70"
            >
              <Heart className="h-4 w-4" strokeWidth={1.25} fill={liked ? "#172338" : "none"} />
            </button>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={step(-1)}
                className={cn(
                  "absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#F7F5F0]/90 text-[#172338] opacity-0 transition-opacity duration-500 focus-visible:opacity-100 group-hover:opacity-100",
                  EASE
                )}
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={step(1)}
                className={cn(
                  "absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#F7F5F0]/90 text-[#172338] opacity-0 transition-opacity duration-500 focus-visible:opacity-100 group-hover:opacity-100",
                  EASE
                )}
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div
                  className={cn("h-full bg-white transition-[width] duration-500", EASE)}
                  style={{ width: `${((index + 1) / total) * 100}%` }}
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-5">
          {kicker && (
            <p className="font-haas text-[11px] uppercase tracking-[0.22em] text-[#506A70] line-clamp-1">{kicker}</p>
          )}
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="font-gtsuper-ds text-[24px] font-light leading-[1.1] text-[#172338] md:text-[26px]">
              {title}
            </h3>
            <p className="shrink-0 font-haas text-[15px] text-[#172338]">{priceLabel}</p>
          </div>
          {facts.length > 0 && (
            <p className="mt-2 font-haas text-[13px] font-light text-[#506A70]">{facts.join("  ·  ")}</p>
          )}
        </div>
      </Wrapper>
    </article>
  );
}
