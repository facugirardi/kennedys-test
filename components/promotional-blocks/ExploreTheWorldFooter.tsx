import React from 'react'
import { ChevronRight } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/utils'

/** Sitio de la agencia de viajes propia. */
const TRAVEL_AGENCY_URL = 'https://myblossomtravel.com/en/'

interface TileProps {
  img: string
  label: string
  bar: string
  textColor: string
}

const Tile: React.FC<TileProps> = ({ img, label, bar, textColor }) => {
  const finalImageSrc = img?.startsWith('/images/') 
    ? img 
    : (resolveMediaUrl(img) || img)
  
  return (
    <div className="flex flex-col group overflow-hidden">
      {/* Foto */}
      <div className="relative h-[220px] md:h-[446px] overflow-hidden">
        <img
          src={finalImageSrc}
          alt={label}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      {/* Barra de color con label */}
      <div 
        className="flex items-center justify-center py-3 px-2"
        style={{ backgroundColor: bar }}
      >
        <span
          className="font-gtsuper-ds text-[13px] md:text-[15px] uppercase font-normal tracking-[0.15em]"
          style={{ color: textColor }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

interface ExploreTheWorldFooterProps {
  className?: string
  title?: string
  subtitle?: string
  buttonText?: string
  tiles?: Array<{
    img: string
    label: string
    bar: string
    textColor: string
  }>
}

const DEFAULT_TILES = [
  { img: "/images/category-images@3x.png", label: "EXPLORE", bar: "#E65B0D", textColor: "#FFFFFF" },
  { img: "/images/image1@3x.png", label: "UNWIND", bar: "#28F7EA", textColor: "#000000" },
  { img: "/images/image2@3x.png", label: "EXPERIENCE", bar: "#FFC121", textColor: "#000000" },
  { img: "/images/image3@3x.png", label: "INSPIRE", bar: "#419ADA", textColor: "#FFFFFF" },
  { img: "/images/image4@3x.png", label: "ADVENTURE", bar: "#D99330", textColor: "#FFFFFF" },
  { img: "/images/image5@3x.png", label: "DISCOVER", bar: "#37C380", textColor: "#FFFFFF" },
]

export const ExploreTheWorldFooter: React.FC<ExploreTheWorldFooterProps> = ({
  className = "",
  title = "EXPLORE THE WORLD",
  subtitle = "WITH OUR OWN TRAVEL AGENCY",
  buttonText = "Start Your Stress-Free Journey",
  tiles = DEFAULT_TILES
}) => {
  return (
    <div className={`w-full bg-[#E2F3F6] overflow-x-hidden ${className}`}>
      {/* contenedor full-bleed, sin max-w */}
      <div className="flex w-full flex-col items-center px-4 pt-10 text-center">
        {/* títulos */}
        <div className="text-[#172338]">
          <h1 className="font-gtsuper-ds uppercase font-light tracking-[-0.02em] text-[36px] sm:text-[44px] md:text-[52px]">
            {title}<br></br>
            {subtitle}
          </h1>
        </div>

        {/* botón */}
        <div className="mt-4 mb-10">
          <a
            href={TRAVEL_AGENCY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[48px] items-center gap-3 bg-[#172338] px-6 text-white hover:bg-[#172338]/90 transition-colors"
          >
            <span className="font-haas tracking-[0.5px] font-thin">
              {buttonText}
            </span>
            <ChevronRight className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* 6 columnas full width y más altas */}
      <div className="grid w-screen grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
        {tiles.map((tile, index) => (
          <Tile 
            key={index}
            img={tile.img}
            label={tile.label}
            bar={tile.bar}
            textColor={tile.textColor}
          />
        ))}
      </div>
    </div>
  )
}

