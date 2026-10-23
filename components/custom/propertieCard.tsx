import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { RealEstateCard } from "./RealEstateCard";

function FavoriteHeartIcon({ liked }: { liked: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9.465 15.6067C9.21 15.6967 8.79 15.6967 8.535 15.6067C6.36 14.8642 1.5 11.7667 1.5 6.51672C1.5 4.19922 3.3675 2.32422 5.67 2.32422C7.035 2.32422 8.2425 2.98422 9 4.00422C9.7575 2.98422 10.9725 2.32422 12.33 2.32422C14.6325 2.32422 16.5 4.19922 16.5 6.51672C16.5 11.7667 11.64 14.8642 9.465 15.6067Z"
        fill={liked ? "#ef4444" : "none"}
        stroke={liked ? "#ef4444" : "#506A70"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type PropertieCardProps = {
  villaImage: string;
  title: string;
  location: string;
  bedrooms?: number;
  guests?: number;
  pools?: number;
  capa1?: string;
  price: string;
  simple?: boolean;
  rental?: boolean;
  country?: string;
  onlyTitle?: boolean;
  divClassName?: string;
  titleClassName?: string;
  fromText?: boolean;
  liked?: boolean;
  /** Ruta de destino; renderiza el card como <a> real para que los crawlers sigan el link. */
  href?: string;
  onClick?: () => void;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
  showFavorite?: boolean;
  /** Shorter image when `simple` (e.g. 4-column real estate row) */
  compact?: boolean;
  /** Sale listings (rental=false): currency icon next to price */
  saleListingCurrency?: "eur" | "usd";
  /** Bathroom count (sale listings) */
  bathrooms?: number | null;
  /** @deprecated Prefer plotSqm / buildSqm for sale cards */
  squareMeters?: number | null;
  /** Plot area in sqm (sale listings) */
  plotSqm?: number | null;
  /** Built / living area in sqm (sale listings) */
  buildSqm?: number | null;
  /** True when the property is a land/plot (plot sqm primary) */
  isLand?: boolean;
  /** Year built (sale listings) */
  yearBuilt?: number | null;
  /** Raw numeric sale price, used to compute price per sqm (sale listings) */
  salePriceNumeric?: number | null;
  /** Sale listings: photo carousel (falls back to `villaImage`) */
  images?: string[];
  /** Sale listings: type shown above the title (e.g. "Detached villa") */
  typeLabel?: string;
  /** Sale listings: status badge over the photo */
  badge?: string;
};

function formatCardSqm(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export const PropertieCard: React.FC<PropertieCardProps> = ({
  villaImage,
  title,
  location,
  country,
  bedrooms = 0,
  guests = 0,
  pools = 0,
  capa1: _capa1,
  price,
  simple = false,
  rental,
  onlyTitle = false,
  divClassName,
  titleClassName,
  fromText = false,
  liked = false,
  href,
  onClick,
  onToggleFavorite,
  isTogglingFavorite = false,
  showFavorite,
  compact = false,
  saleListingCurrency = "eur",
  bathrooms = null,
  squareMeters = null,
  plotSqm = null,
  buildSqm = null,
  isLand = false,
  yearBuilt = null,
  salePriceNumeric = null,
  images,
  typeLabel,
  badge,
}) => {
  void _capa1;
  // Sale listings use the editorial real estate card; rentals and title-only cards keep this layout.
  if (rental === false && !onlyTitle) {
    return (
      <RealEstateCard
        title={title}
        location={location}
        price={price}
        saleListingCurrency={saleListingCurrency}
        image={villaImage}
        images={images}
        typeLabel={typeLabel}
        badge={badge}
        bedrooms={bedrooms}
        bathrooms={bathrooms}
        buildSqm={buildSqm}
        plotSqm={plotSqm ?? squareMeters}
        isLand={isLand}
        liked={liked}
        isTogglingFavorite={isTogglingFavorite}
        showFavorite={showFavorite ?? true}
        onToggleFavorite={onToggleFavorite}
        href={href}
        onClick={onClick}
        className={divClassName?.includes("h-full") ? "h-full" : undefined}
      />
    );
  }
  const resolvedPlotSqm = plotSqm ?? squareMeters;
  const resolvedBuildSqm = buildSqm;
  const resolvedSqm = isLand ? resolvedPlotSqm : resolvedBuildSqm ?? resolvedPlotSqm;
  const pricePerSqm =
    price !== "Price on request" && salePriceNumeric && resolvedSqm
      ? Math.round(salePriceNumeric / resolvedSqm)
      : null;
  const showFavoriteControl = showFavorite ?? (!simple || onlyTitle);
  const imageAspectClass = !simple
    ? "aspect-[3/2]"
    : compact
      ? "aspect-[4/3]"
      : "aspect-[3/4]";
  const favRingClass = compact
    ? "absolute top-3 right-3 border bg-white rounded-full p-1.5 z-10 shadow-sm"
    : "absolute top-9 right-9 border bg-white rounded-full p-2 z-10 shadow-sm";

  const handleToggleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isTogglingFavorite) return;
    onToggleFavorite?.();
  };

  const heartIcon = <FavoriteHeartIcon liked={liked} />;

  const rootClassName = `group w-full h-full flex flex-col items-center gap-2 bg-white border border-neutral-200 shadow-sm ${
    simple ? "p-4" : "p-6"
  } relative cursor-pointer text-left text-base text-gray-800 font-light transition-all duration-300 hover:border-neutral-300 hover:shadow ${divClassName ?? ""}`;

  const RootTag: React.ElementType = href ? Link : "div";
  const rootProps = href ? { href, onClick } : { onClick };

  return (
    <RootTag className={rootClassName} {...rootProps}>
      <div className={`w-full overflow-hidden relative z-0 ${imageAspectClass}`}>
        <img
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          src={villaImage}
          alt={title || "Villa"}
        />
      </div>

      {showFavoriteControl &&
        (typeof onToggleFavorite === "function" ? (
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            aria-pressed={liked}
            aria-label={liked ? "Remove from favourites" : "Add to favourites"}
            className={`${favRingClass} hover:bg-gray-50 disabled:opacity-70`}
          >
            {heartIcon}
          </button>
        ) : (
          <div className={favRingClass}>{heartIcon}</div>
        ))}

      <div className="flex flex-col items-start gap-1 z-20 w-full flex-1">
        {onlyTitle ? (
          <>
            <h2
              className={`text-base text-[#303D40] font-haas font-light line-clamp-2 ${titleClassName ?? ""}`}
            >
              {title}
            </h2>
            {location ? (
              <div className="font-haas text-sm text-[#506A70] tracking-wide leading-snug">{location}</div>
            ) : null}
          </>
        ) : (
          <>
            {rental === true ? (
              <>
                <h2 className={`text-3xl font-normal leading-8 ${titleClassName ?? ""}`}>{title}</h2>
                <div className="text-gray-700 tracking-wide leading-[140%]">{location}</div>
                <div className="text-[#B17520] whitespace-pre-wrap leading-[140%] tracking-wide">
                  {bedrooms} Bedrooms | {guests} Guest | {pools} Pools
                </div>
                <div className="w-full pr-12 mt-auto">
                  <div className="flex items-center h-[30.7px] w-full">
                    <ChevronRightIcon className="w-5 h-5" />
                    <div className="text-gray-800 leading-[140%] tracking-wide">
                      {fromText ? "From " : ""}
                      {price}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-[2px] flex-1">
                  <h2
                    className={`text-base text-[#303D40] font-haas font-light line-clamp-2 ${titleClassName ?? ""}`}
                  >
                    {title}
                  </h2>
                  <div className="font-haas text-[#303D40] tracking-wide line-clamp-1 min-h-[24px]">
                    {location || " "}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 leading-[140%] tracking-wide mt-auto">
                  <p className="flex items-baseline flex-wrap gap-x-2 min-h-[16px]">
                    <span className="text-lg font-haas text-[#506A70] flex items-center gap-1">
                      {price !== 'Price on request' ? (
                        <span className="font-haas">{saleListingCurrency === "usd" ? "$" : "€"}</span>
                      ) : null}
                      <span className="text-[#506A70]">{price}</span>
                    </span>
                    <span className="font-haas text-xs text-[#8B9A9E] whitespace-nowrap">
                      {pricePerSqm != null
                        ? `/ ${saleListingCurrency === "usd" ? "$" : "€"}${formatCardSqm(pricePerSqm)} per sqm`
                        : ""}
                    </span>
                  </p>
                  {(() => {
                    const specs = [
                      bedrooms > 0 ? `${bedrooms} Bed${bedrooms !== 1 ? "s" : ""}` : null,
                      bathrooms && bathrooms > 0
                        ? `${bathrooms} Bath${bathrooms !== 1 ? "s" : ""}`
                        : null,
                      !isLand && resolvedBuildSqm ? `${formatCardSqm(resolvedBuildSqm)} sqm build` : null,
                    ];
                    const specsLine = specs.filter(Boolean).join(" | ");
                    const sqmLine = resolvedPlotSqm ? `${formatCardSqm(resolvedPlotSqm)} sqm plot` : "";
                    return (
                      <>
                        <p className="font-haas text-sm text-[#B17520] tracking-wide leading-[140%] min-h-[20px] mt-1">
                          {specsLine || "\u00a0"}
                        </p>
                        <p className="font-haas text-sm text-[#B17520] tracking-wide leading-[140%] min-h-[20px]">
                          {sqmLine || "\u00a0"}
                        </p>
                        <p className="font-haas text-sm text-[#172338] tracking-wide leading-[140%] min-h-[20px] mt-[2px] mb-[-4px]">
                          {yearBuilt != null ? `Built ${yearBuilt}` : "\u00a0"}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </RootTag>
  );
};
