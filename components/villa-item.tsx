import type { NextPage } from "next";
import type { CSSProperties } from "react";

export type VillaItemType = {
  className?: string;
  villaImage?: string;
  title?: string;
  country?: string;
  capa1?: string;
  price?: string;
  bedrooms?: number;
  guests?: number;
  pools?: number;
  /** Si se pasa, sustituye la parte "N Pool(s)" de la línea de stats (pools + jacuzzis). */
  poolsSpecLabel?: string;
  /** Tamaño de construcción, ej. "250 sqm" */
  buildSize?: string;
  /** Tamaño de parcela, ej. "500 sqm" */
  plotSize?: string;
  imageWidth?: number | string;
  imageHeight?: number | string;

  /** Style props */
  propBorder?: CSSProperties["border"];
  propFlex?: CSSProperties["flex"];
  propMinWidth?: CSSProperties["minWidth"];
  propLeft?: CSSProperties["left"];
  propDisplay?: CSSProperties["display"];
  propMinWidth1?: CSSProperties["minWidth"];

  /** Action props */
  onCardContainerClick?: () => void;
  liked?: boolean;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
  /** Sale-style cards: only show bedroom count in the stats row (no guests/pools). */
  compactRentalStats?: boolean;
};

const VillaItem: NextPage<VillaItemType> = ({
  className = "",
  propBorder,
  onCardContainerClick,
  propFlex,
  propMinWidth,
  villaImage,
  propLeft,
  title,
  country,
  capa1,
  price,
  propDisplay,
  propMinWidth1,
  bedrooms,
  guests,
  pools,
  poolsSpecLabel,
  buildSize,
  plotSize,
  liked = false,
  onToggleFavorite,
  isTogglingFavorite = false,
  imageWidth,
  imageHeight,
  compactRentalStats = false,
}) => {
  const resolvedImageWidth  = imageWidth  !== undefined ? (typeof imageWidth  === "number" ? `${imageWidth}px`  : imageWidth)  : undefined;
  const resolvedImageHeight = imageHeight !== undefined ? (typeof imageHeight === "number" ? `${imageHeight}px` : imageHeight) : undefined;

  const b = bedrooms ?? 0;
  const poolStatsSegment =
    poolsSpecLabel !== undefined && poolsSpecLabel !== ''
      ? poolsSpecLabel
      : `${pools ?? 0} Pools`;
  const sizeLineParts = [
    buildSize ? `Build: ${buildSize}` : null,
    plotSize ? `Plot: ${plotSize}` : null,
  ].filter(Boolean);
  const statsLine = compactRentalStats
    ? [...sizeLineParts, `${b} Bedroom${b === 1 ? "" : "s"}`].join(" | ")
    : [...sizeLineParts, `${b} Bedrooms`, `${guests || 0} Guest`, poolStatsSegment].join(" | ");

  return (
    <div
      className={`cursor-pointer flex flex-col items-center relative gap-7 w-full text-left text-base text-[#506a70] font-haas bg-white border border-[#a3a3a3] py-[22px] px-[23px] box-border ${className}`}
      style={{ border: propBorder, flex: propFlex, minWidth: propMinWidth }}
      onClick={onCardContainerClick}
    >
      {/* Imagen */}
      <div className="relative w-full" style={{ height: resolvedImageHeight ?? "300px" }}>
        <img
          className="w-full h-full object-cover"
          alt={title || "Villa"}
          src={villaImage || "/images/villa-detail@2x.png"}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== "/images/villa-detail@2x.png") {
              target.src = "/images/villa-detail@2x.png";
            }
          }}
        />

        {/* Botón favorito */}
        <button
          type="button"
          className="m-0 absolute top-3 right-3 z-10 rounded-full bg-white flex flex-row items-center justify-start p-2 cursor-pointer transition hover:bg-gray-100"
          style={{ left: propLeft }}
          aria-pressed={liked}
          disabled={!onToggleFavorite || isTogglingFavorite}
          onClick={(e) => {
            e.stopPropagation();
            if (!onToggleFavorite || isTogglingFavorite) return;
            onToggleFavorite();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
              stroke={liked ? '#ef4444' : '#506A70'}
              fill={liked ? '#ef4444' : 'none'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Detalles */}
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <h2 className="m-0 relative text-[30px] text-[#506A70] font-haas md:text-2xl md:leading-[26px] font-thin">
          {title}
        </h2>
        <div className="relative tracking-[0.01em] font-haas font-medium text-sm text-[#303d40]">
          {country}
        </div>
        <div className="relative tracking-[0.01em] text-sm font-haas font-normal text-[#B17520] whitespace-pre-wrap">
          {statsLine}
        </div>
        <div className="text-base font-haas font-normal" style={{ display: propDisplay, minWidth: propMinWidth1 }}>
          {price}
        </div>
      </div>
    </div>
  );
};

export default VillaItem;
