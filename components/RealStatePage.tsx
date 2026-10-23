import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { getRealEstateCardExtras } from "@/lib/realEstateCard";
import { buildRealEstateDetailPath } from "@/lib/rentalRoute";
import realEstateHeader from '@/public/images/real-state-header.webp'
import MykonosImage from '@/public/images/Mykonos-image.jpg'
import ParosImage from '@/public/images/paros-image.png'
import GreeceImage from '@/public/images/greece.png'
import MykonosCardImage from '@/public/images/mykonos-card-image.png'
import BoatsImage from '@/public/images/boats-image.jpg'
import { SearchForm } from './custom/SearchForm'
import type { LocationCountryGroup, LocationTreeSelection } from '@/components/custom/LocationTreeDropdown'
import type { RealEstateFilterState } from '@/lib/realEstateListingSearchParams'
import { appendRealEstateListingSearchParams } from '@/lib/realEstateListingSearchParams'
import { REAL_ESTATE_LOCATION_FILTER_TREE, expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import { TopSearchCard } from './custom/TopSearchCard'
import { PropertieCard } from './custom/propertieCard'
import { RealEstateFilterOverlay } from './custom/RealEstateFilterOverlay'
import { fetchProperties, resolveMediaUrl, formatNightlyPriceLabel, wsrvUrl, heroImageDirectUrl, getPropertyPriceCurrencySymbol, getPropertySaleListingCurrency, getRealEstateCardLocationLabel, fetchPropertiesListResult } from '@/lib/utils'
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark'
import { getFilterOptions } from '@/lib/api/properties'
import { getTopSearches } from '@/lib/api/topSearches'
import { getDestinationsToInvest } from '@/lib/api/destinations'
import { getFeaturedRealEstateSelection } from '@/lib/api/realEstateFeatured'
import usePropertyStore from '@/store/propertyStore'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { UnlockingDoorsToDreams, PremiumPortfolioTopNetworking } from '@/components/promotional-blocks'
import {
  countPoolsForRealEstateCard,
  getRealEstateBuildSqm,
  getRealEstatePlotSqm,
  getRealEstateBathrooms,
  getRealEstateYearBuilt,
} from '@/lib/propertyPoolCounts'
import { ChevronRight } from 'lucide-react'

type TopSearchConfig = {
  key: string
  title: string
  image: string
  query: string
}

// Reparte los destinos en filas de 2 (normal + ancha) o 3 (normales) para que
// ninguna fila termine con una sola tarjeta suelta. Devuelve el colSpan (1 o 2)
// de cada índice.
function getDestinationColSpans(count: number): number[] {
  if (count <= 0) return []
  if (count <= 3) return Array(count).fill(1)

  const groupSizes: number[] = []
  let remaining = count
  let toggle = 0
  while (remaining > 3) {
    let size = toggle % 2 === 0 ? 2 : 3
    if (remaining - size === 1) size = size === 2 ? 3 : 2
    groupSizes.push(size)
    remaining -= size
    toggle++
  }
  groupSizes.push(remaining)

  const spans: number[] = []
  groupSizes.forEach((size) => {
    if (size === 2) spans.push(1, 2)
    else spans.push(1, 1, 1)
  })
  return spans
}

type ResolvedTopSearch = {
  key: string
  title: string
  region: string
  image: string
  imagePosition: string
}

/** Fixed real-estate “Top Searches” cards (region must match API `region` filter). */
const REAL_ESTATE_TOP_SEARCHES_BASE: Array<{
  key: string
  title: string
  defaultImage: string
  region: string
}> = [
  { key: 'mykonos', title: 'Mykonos', defaultImage: '/images/mykonos-card-image.png', region: 'Mykonos' },
  { key: 'athens-riviera', title: 'Athens Riviera', defaultImage: '/images/greek-island-image.png', region: 'Athens Riviera' },
  { key: 'paros', title: 'Paros', defaultImage: '/images/paros-image.png', region: 'Paros' },
];

function isLandProperty(p: any): boolean {
  const t = p?.classification?.type ?? p?.classification?.objectType ?? ''
  return typeof t === 'string' && t.toLowerCase() === 'land'
}

function propertyCreatedTime(p: any): number {
  const raw = p?.createdAt ?? p?.created_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

const FEATURED_REAL_ESTATE_LIMIT = 3;

function pickFeaturedRealEstateProperties(properties: any[], limit = FEATURED_REAL_ESTATE_LIMIT): any[] {
  if (!properties.length) return [];
  const published = properties.filter((p: any) => p.published !== false);
  const flagged = published.filter(
    (p: any) =>
      Number(p.island_villas) > 0 ||
      p.showInTopBlock === true ||
      p.isHero === true
  );
  const byNewest = [...published].sort(
    (a, b) => propertyCreatedTime(b) - propertyCreatedTime(a)
  );
  const seen = new Set<string>();
  const out: any[] = [];
  const pushUnique = (p: any) => {
    const id = p?.id != null ? String(p.id) : "";
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(p);
  };
  for (const p of flagged) {
    pushUnique(p);
    if (out.length >= limit) return out;
  }
  for (const p of byNewest) {
    pushUnique(p);
    if (out.length >= limit) break;
  }
  return out;
}

/** Deterministic per-day PRNG seed — stable within a calendar day (UTC), changes at midnight. */
function dailySeed(): number {
  return Math.floor(Date.now() / 86400000);
}

function mulberry32(seed: number) {
  let state = seed | 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Picks `limit` properties at random from the admin-curated pool, stable for the day, rotating daily. */
function pickDailyRandomProperties(pool: any[], limit: number): any[] {
  if (!pool.length) return [];
  const random = mulberry32(dailySeed());
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, limit);
}

function realEstateCardImageUrl(url: string | undefined | null, watermark = false): string {
  const raw = url?.trim() ? url : '/images/villa-placeholder.jpg'
  const resolved = heroImageDirectUrl(raw)
  return watermark ? watermarkedImageUrl(resolved) : resolved
}

// Respeta el flag isPrimary de la galería (igual que el admin/Loggia); si ninguna
// imagen está marcada como primary, cae a la primera del array.
function getPrimaryImageRawUrl(property: any): string | undefined {
  const images = property?.images
  if (!Array.isArray(images) || images.length === 0) return undefined
  const primary = images.find((img: any) => {
    const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary
    return isPrimary === true || isPrimary === 'true' || isPrimary === 1
  })
  return (primary ?? images[0])?.urlImage
}

function SearchFormSkeleton() {
  return (
    <div className="bg-white animate-pulse" aria-hidden>
      <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-3 items-stretch lg:items-end">
        <div className="flex-1 w-full lg:min-w-[200px] space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-[52px] w-full bg-gray-200 border border-gray-200" />
        </div>
        <div className="flex-[1.35] w-full lg:min-w-[220px] space-y-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-[52px] w-full bg-gray-200 border border-gray-200" />
        </div>
        <div className="w-full lg:w-[100px] space-y-2">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-[52px] w-full bg-gray-200 border border-gray-200" />
        </div>
        <div className="flex flex-row gap-2 lg:items-end w-full lg:w-auto">
          <div className="h-[52px] flex-1 lg:flex-none lg:w-[120px] bg-gray-200 border border-gray-200" />
          <div className="h-[52px] flex-1 lg:flex-none lg:w-[140px] bg-gray-200 border border-gray-200" />
        </div>
      </div>
    </div>
  );
}

type PropertyCardSkeletonVariant = 'featured' | 'simpleTall' | 'compact'

function PropertyCardSkeleton({ variant = 'featured' }: { variant?: PropertyCardSkeletonVariant }) {
  const imageClass =
    variant === 'featured'
      ? 'h-[240px]'
      : variant === 'compact'
        ? 'h-[200px] min-[480px]:h-[210px] lg:h-[200px]'
        : 'h-[280px] sm:h-[380px] md:h-[460px] lg:h-[540px]'
  const shellClass =
    variant === 'featured'
      ? 'border border-[#a3a3a3] p-6 gap-2'
      : 'border border-[#a3a3a3] px-3 sm:px-4 py-6 gap-2'
  const favClass = variant === 'compact' ? 'top-3 right-3 h-9 w-9' : 'top-9 right-9 h-10 w-10'

  return (
    <div className={`flex flex-col w-full h-full animate-pulse relative ${shellClass}`} aria-hidden>
      <div className={`relative w-full shrink-0 bg-gray-200 ${imageClass}`}>
        <div className={`absolute ${favClass} rounded-full bg-gray-300/90 border border-gray-300`} />
      </div>
      <div className="flex flex-col gap-2 w-full flex-1 pt-1">
        <div className="h-4 w-[88%] max-w-[280px] bg-gray-200 rounded" />
        <div className="h-4 w-1/2 max-w-[200px] bg-gray-200 rounded" />
        <div className="h-5 w-1/3 max-w-[140px] bg-gray-200 rounded mt-2" />
      </div>
    </div>
  );
}

function TopSearchCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3" aria-hidden>
      <div className="w-full h-48 bg-gray-200" />
      <div className="h-5 w-3/4 max-w-[200px] bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>
  );
}

function CollectionHeader({ title }: { title: string }) {
  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full max-w-[1200px] mx-auto mb-8">
      <h2 className="font-haas font-light text-[#172338] text-2xl md:text-3xl">{title}</h2>
      <Link
        href="/real-estate/list"
        className="shrink-0 inline-flex items-center h-10 px-5 border border-[#172338] font-haas font-light text-sm text-[#172338] hover:bg-[#172338] hover:text-white transition-colors"
      >
        View all
      </Link>
    </div>
  )
}

function SectionHeaderRowSkeleton() {
  return (
    <div
      className="flex flex-row justify-between items-center gap-4 w-full max-w-[1200px] mx-auto mb-8 animate-pulse"
      aria-hidden
    >
      <div className="h-9 w-44 md:w-56 bg-gray-200 rounded shrink-0" />
      <div className="h-4 w-28 md:w-36 bg-gray-200 rounded shrink-0" />
    </div>
  );
}

function DestinationsGridSkeleton() {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse"
      aria-hidden
    >
      <div className="lg:col-span-1 h-48 md:h-[400px] bg-gray-200" />
      <div className="lg:col-span-2 h-48 md:h-[400px] bg-gray-200" />
      <div className="lg:col-span-1 h-48 md:h-[400px] bg-gray-200" />
      <div className="lg:col-span-1 h-48 md:h-[400px] bg-gray-200" />
      <div className="lg:col-span-1 h-48 md:h-[400px] bg-gray-200" />
    </div>
  );
}

function SectionEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  tone = 'neutral',
}: {
  title: string
  description?: string
  actionHref?: string
  actionLabel?: string
  tone?: 'neutral' | 'error'
}) {
  const borderTone = tone === 'error' ? 'border-[#D04444]/25' : 'border-[#a3a3a3]/50'
  const titleClass = tone === 'error' ? 'text-[#D04444]' : 'text-[#172338]'

  return (
    <div
      className={`col-span-full flex flex-col items-center justify-center text-center py-14 px-6 rounded-sm border border-dashed ${borderTone} bg-white/60`}
    >
      <p className={`font-gtsuper-ds text-lg md:text-xl font-light ${titleClass}`}>{title}</p>
      {description ? (
        <p className="mt-2 font-haas text-sm text-[#506A70] max-w-md leading-relaxed">{description}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 text-sm font-haas font-semibold text-[#172338] underline underline-offset-2 hover:opacity-80"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

type RealStatePageProps = {
  /** Imagen de hero (URL absoluta o relativa al API); si no, se usa el asset por defecto. */
  initialHeroBannerUrl?: string
  initialHeroBannerPosition?: string
  /** Dynamic images for top search cards, keyed by page key. */
  topSearchImages?: Record<string, string>
  topSearchPositions?: Record<string, string>
  /** Dynamic images for Unlocking Doors To Your Dreams section (4 images). */
  unlockingImages?: string[]
  /** Dynamic images for Premium Portfolio + Top Networking section. */
  premiumPortfolioImage?: string
  topNetworkingImage?: string
  heroTitle?: string
  /** Height (px) of the fixed Navbar rendered above this page, so the sticky search bar sits right below it instead of behind it. */
  navbarHeight?: number
}

const DEFAULT_HERO_TITLE = 'REAL ESTATE'

export const RealStatePage = ({ initialHeroBannerUrl, initialHeroBannerPosition, topSearchImages = {}, topSearchPositions = {}, unlockingImages, premiumPortfolioImage, topNetworkingImage, heroTitle = DEFAULT_HERO_TITLE, navbarHeight = 0 }: RealStatePageProps) => {
  const realEstateHeroSrc =
    (initialHeroBannerUrl && initialHeroBannerUrl.trim()) || realEstateHeader.src
  const realEstateHeroPosition = initialHeroBannerPosition || '50% 50%'

  const REAL_ESTATE_TOP_SEARCHES = REAL_ESTATE_TOP_SEARCHES_BASE.map(s => ({
    ...s,
    image: topSearchImages[`real-estate-top-${s.key}`] || s.defaultImage,
    imagePosition: topSearchPositions[`real-estate-top-${s.key}`] || '50% 50%',
  }))
  const [properties, setProperties] = useState<any[]>([])
  const [allProperties, setAllProperties] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [initialError, setInitialError] = useState<string | null>(null)
  const [topSearchStats, setTopSearchStats] = useState<Record<string, number>>({})
  const [topSearchError, setTopSearchError] = useState<string | null>(null)
  const [dynamicTopSearches, setDynamicTopSearches] = useState<ResolvedTopSearch[] | null>(null)
  const [topSearchStatsLoading, setTopSearchStatsLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[]
    types: string[]
    locationsByCountry: LocationCountryGroup[]
  }>({
    locations: [],
    types: [],
    locationsByCountry: [],
  })
  const [destinations, setDestinations] = useState<TopSearchConfig[]>([])
  const [destinationsLoading, setDestinationsLoading] = useState(true)
  const [featuredPool, setFeaturedPool] = useState<any[]>([])
  const destinationColSpans = useMemo(() => getDestinationColSpans(destinations.length), [destinations.length])
  // Search bar: sticky under the navbar; once it sticks it drops its labels and padding to take less height.
  const searchSentinelRef = useRef<HTMLDivElement | null>(null)
  const [searchStuck, setSearchStuck] = useState(false)
  useEffect(() => {
    const el = searchSentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setSearchStuck(!entry.isIntersecting && entry.boundingClientRect.top < navbarHeight),
      { rootMargin: `-${navbarHeight}px 0px 0px 0px`, threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [navbarHeight])
  const [destinationCounts, setDestinationCounts] = useState<Record<string, number>>({})
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [heroLocation, setHeroLocation] = useState<LocationTreeSelection>({
    selectedCountry: '',
    regionValue: '',
    area: '',
  })
  const [filterState, setFilterState] = useState<RealEstateFilterState>({
    priceRange: {
      min: null,
      max: null,
    },
    priceCurrency: 'eur',
    bedrooms: 'Any',
    bathrooms: 'Any',
    floors: 'Any',
    floorLevel: {
      min: null,
      max: null,
    },
    propertyType: [],
    listingStatus: [],
    squareFeet: {
      min: null,
      max: null,
    },
    lotSize: {
      min: null,
      max: null,
    },
    yearBuilt: {
      min: null,
      max: null,
    },
    listingStatusDropdown: 'All',
    area: 'All',
    outdoor: [],
    luxuryIndoor: [],
    location: [],
    view: [],
  })
  const router = useRouter()
  const { isLiked, toggleFavorite, pendingIds, error: likesError } = usePropertyLikes()

  const featuredProperties = useMemo(() => {
    if (featuredPool.length > 0) {
      return pickDailyRandomProperties(featuredPool, FEATURED_REAL_ESTATE_LIMIT);
    }
    return pickFeaturedRealEstateProperties(properties);
  }, [featuredPool, properties]);

  const trendingProperties = useMemo(() => {
    if (!allProperties.length) return []
    const published = allProperties.filter((p: any) => p.published !== false)
    const flagged = published.filter((p: any) => Number(p.trending) > 0)
    if (flagged.length > 0) return flagged.slice(0, 3)
    return [...published]
      .sort((a, b) => propertyCreatedTime(b) - propertyCreatedTime(a))
      .slice(0, 3)
  }, [allProperties])

  const newPropertiesList = useMemo(() => {
    if (!allProperties.length) return []
    const published = allProperties.filter((p: any) => p.published !== false)
    const flagged = published.filter((p: any) => Number(p.new_properties) > 0)
    const byNewest = [...published].sort(
      (a, b) => propertyCreatedTime(b) - propertyCreatedTime(a)
    )
    const seen = new Set<string>()
    const out: any[] = []
    const pushUnique = (p: any) => {
      const id = p?.id != null ? String(p.id) : ''
      if (!id || seen.has(id)) return
      seen.add(id)
      out.push(p)
    }
    for (const p of flagged) {
      pushUnique(p)
      if (out.length >= 4) return out
    }
    for (const p of byNewest) {
      pushUnique(p)
      if (out.length >= 4) break
    }
    return out
  }, [allProperties])

  useEffect(() => {
    let isMounted = true

    const asArray = (resp: any) => {
      if (Array.isArray(resp)) return resp;
      if (Array.isArray(resp?.items)) return resp.items;
      return null;
    };

    const getProperties = async () => {
      setIsLoading(true)
      setIsInitialLoading(true)
      setError(null)
      setInitialError(null)
      try {
        const response: any = await fetchProperties({ rental: false, category: 'real-estate', take: 100 })
        if (!isMounted) return
        const list = asArray(response);
        if (!list) {
          console.error('Expected array for real-estate properties, got:', response)
          setError('We could not load properties at this time.')
          setInitialError('We could not load properties at this time.')
          setProperties([])
          setAllProperties([])
          return
        }
        const mapped = list.map((property: any) => ({
          ...property,
          images: Array.isArray(property?.images)
            ? property.images.map((img: any) => ({
                ...img,
                urlImage: resolveMediaUrl(img?.urlImage || img?.url || ''),
              }))
            : [],
        }))
        setProperties(mapped)
        setAllProperties(mapped)
      } catch (err) {
        console.error('Failed to load real estate properties', err)
        if (isMounted) {
          setError('We could not load properties at this time.')
          setInitialError('We could not load properties at this time.')
          setProperties([])
          setAllProperties([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsInitialLoading(false)
        }
      }
    }

    getProperties()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true;
    const loadFilters = async () => {
      try {
        const res = await getFilterOptions({ rental: false, category: "real-estate" });
        const data = res?.data || {};
        if (!mounted) return;
        const regions = Array.isArray(data.regions) ? data.regions : [];
        // Árbol curado + patch de sub-áreas reales (Golf, etc.) por país, mismo mecanismo que
        // /real-estate/list — `regions: []` en el patch no agrega regiones/áreas no curadas.
        const subAreaPatches: LocationCountryGroup[] = Array.isArray(data.locationsByCountry)
          ? data.locationsByCountry
              .filter((g: any) => g?.country && Object.keys(g?.subAreasByArea || {}).length > 0)
              .map((g: any) => ({ country: g.country, regions: [], subAreasByArea: g.subAreasByArea }))
          : [];
        setFilterOptions({
          locations: regions,
          types: Array.isArray(data.types) ? data.types : [],
          locationsByCountry: [...REAL_ESTATE_LOCATION_FILTER_TREE, ...subAreaPatches],
        });
      } catch (error) {
        console.error("Failed to load filter options", error);
        if (mounted) {
          setFilterOptions({
            locations: [],
            types: [],
            locationsByCountry: REAL_ESTATE_LOCATION_FILTER_TREE,
          });
        }
      } finally {
        if (mounted) setFiltersLoading(false);
      }
    };
    loadFilters();
    return () => {
      mounted = false;
    };
  }, []);

  // Load destinations to invest
  useEffect(() => {
    let isMounted = true;
    const loadDestinations = async () => {
      try {
        const response = await getDestinationsToInvest();
        if (!isMounted) return;
        
        const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
        
        if (data.length > 0) {
          const mapped = data
            .filter((d: any) => d.active !== false) // Filtrar solo los activos
            .map((d: any) => ({
              key: d.slug || d.name?.toLowerCase().replace(/\s+/g, '-') || '',
              title: d.name || '',
              image: resolveMediaUrl(d.imageUrl || d.image_url || d.image) || '',
              query: d.name || '',
            }))
            .filter((d: any) => d.key && d.title && d.image); // Solo incluir los que tienen todos los datos
            
          setDestinations(mapped);
        } else {
          setDestinations([]);
        }
      } catch (error) {
        console.error("Failed to load destinations to invest", error);
        setDestinations([]);
      } finally {
        if (isMounted) setDestinationsLoading(false);
      }
    };
    loadDestinations();
    return () => { isMounted = false; };
  }, []);

  // Load the admin-curated "Properties you'll love" pool (kennedys-loggia: Real Estate > Featured Properties)
  useEffect(() => {
    let isMounted = true;
    const loadFeaturedPool = async () => {
      try {
        const response: any = await getFeaturedRealEstateSelection();
        if (!isMounted) return;
        const data = Array.isArray(response?.data) ? response.data : [];
        setFeaturedPool(data);
      } catch (error) {
        console.error('Failed to load featured real-estate selection', error);
        if (isMounted) setFeaturedPool([]);
      }
    };
    loadFeaturedPool();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = (hero: {
    location?: string;
    area?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    bedrooms?: number | null;
    sortBy?: 'default' | 'asc' | 'desc';
  }) => {
    const params = new URLSearchParams();
    appendRealEstateListingSearchParams(params, filterState, {
      region: hero.location,
      area: hero.area,
      minPrice: hero.minPrice,
      maxPrice: hero.maxPrice,
      bedrooms: hero.bedrooms,
    });
    if (hero.sortBy && hero.sortBy !== 'default') {
      params.set('sortBy', hero.sortBy);
    }
    router.push(`/real-estate/list?${params.toString()}`);
  };

  const handleOpenFilters = () => {
    setShowFilters(true);
  };

  const handleCloseFilters = () => {
    setShowFilters(false);
  };

  const handleApplyFilters = (next: RealEstateFilterState) => {
    setFilterState(next);
    setShowFilters(false);
    const params = new URLSearchParams();
    appendRealEstateListingSearchParams(params, next, {
      region: heroLocation.regionValue,
      area: heroLocation.area,
    });
    router.push(`/real-estate/list?${params.toString()}`);
  };

  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)

  const onCardContainerClick = useCallback((id: string) => {
    const property = properties.find((p: any) => p.id === id);
    setSelectedProperty(property);
    router.push(buildRealEstateDetailPath(property || { id }));
    return;
  }, [router, properties, setSelectedProperty]);

  const getPriceLabel = useCallback((property: any) => {
    if (property?.price_visibility === false) return 'Price on request';
    const sym = getPropertyPriceCurrencySymbol(property);
    if (property?.sale_price) {
      const numeric = Number(property.sale_price);
      if (Number.isFinite(numeric)) {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(numeric);
      }
    }

    const nightly = property?.price_per_night !== undefined ? Number(property.price_per_night) : NaN;
    if (Number.isFinite(nightly)) {
      return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(nightly)} / Night`;
    }

    return formatNightlyPriceLabel(property?.price_per_night, sym);
  }, []);

  useEffect(() => {
    let isMounted = true

    const loadTopSearchStats = async () => {
      let activeTopSearches: ResolvedTopSearch[] = REAL_ESTATE_TOP_SEARCHES

      try {
        const response = await getTopSearches()
        const adminTopSearches = Array.isArray(response?.data) ? response.data : []
        if (adminTopSearches.length > 0) {
          activeTopSearches = adminTopSearches.map((item: any) => ({
            key: item.id,
            title: item.name,
            region: item.region,
            image: resolveMediaUrl(item.imageUrl || item.image) || '',
            imagePosition: '50% 50%',
          }))
        }
      } catch (error) {
        console.error('Failed to load admin top searches, using fallback', error)
      }

      if (!isMounted) return
      // Fallback a los destinos hardcodeados si no hay ninguno cargado desde el admin
      setDynamicTopSearches(activeTopSearches === REAL_ESTATE_TOP_SEARCHES ? null : activeTopSearches)

      try {
        const regions = activeTopSearches.map((item) => item.region).filter(Boolean)
        if (regions.length === 0) {
          return
        }

        const statsPromises = regions.map(async (region) => {
          try {
            // Same region expansion as the destination pages (Athens Riviera → Glyfada, Voula…) and the real
            // list total, so the count matches what the listing shows.
            const expanded = Array.from(new Set([region, ...expandLocationArea(region)])).join(',')
            const res = await fetchPropertiesListResult({
              rental: false,
              category: 'real-estate',
              region: expanded,
              page: 1,
              pageSize: 1,
            })
            return {
              region: region,
              count: res.total
            }
          } catch (error) {
            console.error(`Error fetching properties for region ${region}:`, error)
            return { region: region, count: 0 }
          }
        })

        const statsResults = await Promise.all(statsPromises)
        if (!isMounted) return

        const mapped = statsResults.reduce((acc: Record<string, number>, stat: any) => {
          acc[stat.region] = stat.count
          return acc
        }, {})

        setTopSearchStats(mapped)
        setTopSearchError(null)
      } catch (err) {
        console.error('Failed to load top search statistics', err)
        if (isMounted) {
          setTopSearchError('We could not load top search data right now.')
        }
      } finally {
        if (isMounted) {
          setTopSearchStatsLoading(false)
        }
      }
    }

    loadTopSearchStats()

    return () => {
      isMounted = false
    }
  }, [])

  // Real property count per destination (same list endpoint the listing uses, so the number matches what the user sees).
  useEffect(() => {
    if (destinations.length === 0) return
    let isMounted = true
    const loadDestinationCounts = async () => {
      const entries = await Promise.all(
        destinations.map(async (dest) => {
          const name = (dest.query || dest.title || '').trim()
          if (!name) return [dest.key, 0] as const
          // Same region expansion the destination pages use (e.g. Athens Riviera → Glyfada, Voula…), so the count matches the list.
          const region = Array.from(new Set([name, ...expandLocationArea(name)])).join(',')
          const res = await fetchPropertiesListResult({ rental: false, category: 'real-estate', region, page: 1, pageSize: 1 })
          return [dest.key, res.total] as const
        })
      )
      if (isMounted) setDestinationCounts(Object.fromEntries(entries))
    }
    loadDestinationCounts()
    return () => {
      isMounted = false
    }
  }, [destinations])

  return (
    <div>
      <div className='bg-[#172338E0] flex justify-end items-center py-2 px-4 md:px-28'>
        <Link
          href="/sell-with-us"
          className="inline-flex items-center gap-0.5 text-white text-base font-haas font-light hover:opacity-90 transition-opacity"
        >
          <span>SELL WITH US</span>
          <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        </Link>
      </div>
      <section className='relative flex items-center justify-center h-[18rem] sm:h-[22rem] md:h-[28rem] lg:h-[32rem] min-h-[180px]'>
        <img className='absolute top-0 left-0 w-full h-full object-cover brightness-[0.7]' src={realEstateHeroSrc} alt="" style={{ objectPosition: realEstateHeroPosition }} />
        <h1 className='text-white text-4xl md:text-8xl text-center px-4 font-gtsuper-ds font-light z-10'>{heroTitle}</h1>
      </section>
      {/* search */}
      <div ref={searchSentinelRef} aria-hidden className='mt-10 h-px' />
      <div className='sticky z-30 bg-white' style={{ top: navbarHeight }}>
        <div className={`px-4 md:px-32 transition-all duration-200 ${searchStuck ? 'py-2 border-b border-[#E2E8EB] shadow-sm' : ''}`}>
          <div className={`flex flex-col gap-1 ${searchStuck ? '' : 'border border-[#E2E8EB] p-4 md:p-5'}`}>
          {filtersLoading ? (
            <SearchFormSkeleton />
          ) : (
            <SearchForm
              locationsByCountry={filterOptions.locationsByCountry}
              locationsLoading={filtersLoading}
              locationValue={heroLocation}
              onLocationChange={setHeroLocation}
              onSearch={handleSearch}
              onFiltersOpen={handleOpenFilters}
              compact={searchStuck}
            />
          )}
          </div>
        </div>
      </div>

      {/* Real Estate Filter Overlay */}
      <RealEstateFilterOverlay
        isOpen={showFilters}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
        initialFilters={filterState}
      />
      <section className='bg-[#F5F8FE] px-4 md:px-32 py-12 md:py-16 mt-10 flex flex-col gap-2'>
        {isLoading && !error ? (
          <SectionHeaderRowSkeleton />
        ) : (
          <CollectionHeader title="Featured Properties" />
        )}
        {!isLoading && likesError && (
          <p
            className="mb-4 text-sm font-haas text-[#D04444] border border-[#D04444]/20 bg-[#D04444]/5 rounded-sm px-4 py-3"
            role="alert"
          >
            {likesError}
          </p>
        )}
        {/* cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto'>
          {isLoading && !error && (
            <>
              {[0, 1, 2].map((i) => (
                <PropertyCardSkeleton key={i} variant="featured" />
              ))}
            </>
          )}
          {!isLoading && error && (
            <SectionEmptyState
              tone="error"
              title="We couldn’t load properties"
              description={error}
              actionHref="/real-estate/list"
              actionLabel="Open property listing"
            />
          )}
          {!isLoading && !error && featuredProperties.length === 0 && (
            <SectionEmptyState
              title="No featured properties yet"
              description="There are no listings to show in this section right now. Explore the full catalogue to see everything available."
              actionHref="/real-estate/list"
              actionLabel="View all properties"
            />
          )}
          {!isLoading && !error && featuredProperties.map((property: any, i: number) => {
            const propertyId = property?.id
            const land = isLandProperty(property)
            return (
              <div key={property?.id ?? i} className='w-full'>
                <PropertieCard
                  onClick={() => onCardContainerClick(property?.id)}
                  villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                  title={property?.title || ''}
                  location={getRealEstateCardLocationLabel(property || {})}
                  capa1="/images/capa-1-4@2x.png"
                  price={getPriceLabel(property)}
                  saleListingCurrency={getPropertySaleListingCurrency(property)}
                  bedrooms={property?.classification?.bedrooms || 0}
                  bathrooms={getRealEstateBathrooms(property?.classification)}
                  yearBuilt={getRealEstateYearBuilt(property?.classification)}
                  salePriceNumeric={Number(property?.sale_price) || null}
                  plotSqm={getRealEstatePlotSqm(property?.classification)}
                  buildSqm={getRealEstateBuildSqm(property?.classification)}
                  isLand={land}
                  guests={0}
                  pools={countPoolsForRealEstateCard(property?.classification)}
                  rental={false}
                  {...getRealEstateCardExtras(property)}
                  liked={Boolean(propertyId && isLiked(propertyId))}
                  onToggleFavorite={propertyId ? () => toggleFavorite(propertyId) : undefined}
                  isTogglingFavorite={Boolean(propertyId && pendingIds.has(propertyId))}
                  divClassName="bg-white"
                />
              </div>
            )
          })}
          {/* {properties?.map((property: any, i: number) => {
            return (
              <PropertieCard
                key={i}
                onClick={() => onCardContainerClick(property?.id)}
                    villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                title={property?.title || ''}
                location={property?.location || ''}
                capa1="/images/capa-1-4@2x.png"
                price={`${property?.price_per_night || 0}`}
                bedrooms={property?.classification?.bedrooms || 0}
                guests={property?.classification?.maxPersons || 0}
                pools={countSwimmingPoolsFromClassification(property?.classification)}
              />
            )
          })}
           {properties?.map((property: any, i: number) => {
            return (
              <PropertieCard
                key={i}
                onClick={() => onCardContainerClick(property?.id)}
                    villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                title={property?.title || ''}
                location={property?.location || ''}
                capa1="/images/capa-1-4@2x.png"
                price={`${property?.price_per_night || 0}`}
                bedrooms={property?.classification?.bedrooms || 0}
                guests={property?.classification?.maxPersons || 0}
                pools={countSwimmingPoolsFromClassification(property?.classification)}
              />
            )
          })} */}
        </div>
      </section>
      <UnlockingDoorsToDreams items={unlockingImages?.map(image => ({ image }))} />
      <section className='px-4 md:px-32 py-12 md:py-16 bg-[#F5F8FE]'>
        {isInitialLoading && !initialError ? (
          <SectionHeaderRowSkeleton />
        ) : (
          <CollectionHeader title="Trending Now" />
        )}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto'>
          {isInitialLoading && !initialError && (
            <>
              {[0, 1, 2].map((i) => (
                <PropertyCardSkeleton key={`trending-sk-${i}`} variant="simpleTall" />
              ))}
            </>
          )}
          {!isInitialLoading && initialError && (
            <SectionEmptyState
              tone="error"
              title="We couldn’t load this section"
              description={initialError}
              actionHref="/real-estate/list"
              actionLabel="Open property listing"
            />
          )}
          {!isInitialLoading && !initialError && trendingProperties.length === 0 && (
            <SectionEmptyState
              title="Nothing trending yet"
              description="There are no properties in this row at the moment. See the full list for every listing."
              actionHref="/real-estate/list"
              actionLabel="View all properties"
            />
          )}
          {!isInitialLoading && !initialError && trendingProperties.map((property: any, i: number) => {
            const propertyId = property?.id
            const land = isLandProperty(property)
            return (
              <div key={property?.id ?? `trending-${i}`} className='w-full'>
                <PropertieCard
                  onClick={() => onCardContainerClick(property?.id)}
                  villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                  title={property?.title || ''}
                  country={property?.country || ''}
                  location={getRealEstateCardLocationLabel(property || {})}
                  capa1="/images/capa-1-4@2x.png"
                  price={getPriceLabel(property)}
                  saleListingCurrency={getPropertySaleListingCurrency(property)}
                  bedrooms={property?.classification?.bedrooms || 0}
                  bathrooms={getRealEstateBathrooms(property?.classification)}
                  yearBuilt={getRealEstateYearBuilt(property?.classification)}
                  salePriceNumeric={Number(property?.sale_price) || null}
                  plotSqm={getRealEstatePlotSqm(property?.classification)}
                  buildSqm={getRealEstateBuildSqm(property?.classification)}
                  isLand={land}
                  guests={0}
                  pools={countPoolsForRealEstateCard(property?.classification)}
                  rental={false}
                  {...getRealEstateCardExtras(property)}
                  simple={true}
                  showFavorite={true}
                  liked={Boolean(propertyId && isLiked(propertyId))}
                  onToggleFavorite={propertyId ? () => toggleFavorite(propertyId) : undefined}
                  isTogglingFavorite={Boolean(propertyId && pendingIds.has(propertyId))}
                  divClassName="bg-white"
                />
              </div>
            )
          })}
          {/* {properties?.map((property: any, i: number) => {
            return (
              <PropertieCard
                key={i}
                onClick={() => onCardContainerClick(property?.id)}
                    villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                title={property?.title || ''}
                country={property?.country || ''}
                location={property?.location || ''}
                capa1="/images/capa-1-4@2x.png"
                price={`${property?.price_per_night || 0}`}
                bedrooms={property?.classification?.bedrooms || 0}
                guests={property?.classification?.maxPersons || 0}
                pools={countSwimmingPoolsFromClassification(property?.classification)}
                simple={true}
              />
            )
          })} */}
          {/* {properties?.map((property: any, i: number) => {
            return (
              <PropertieCard
                key={i}
                onClick={() => onCardContainerClick(property?.id)}
                    villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                title={property?.title || ''}
                country={property?.country || ''}
                location={property?.location || ''}
                capa1="/images/capa-1-4@2x.png"
                price={`${property?.price_per_night || 0}`}
                bedrooms={property?.classification?.bedrooms || 0}
                guests={property?.classification?.maxPersons || 0}
                pools={countSwimmingPoolsFromClassification(property?.classification)}
                simple={true}
              />
            )
          })} */}
        </div>
      </section>
      <section className='px-4 md:px-32 py-12 md:py-16 flex flex-col gap-5'>
        {isInitialLoading && !initialError ? (
          <SectionHeaderRowSkeleton />
        ) : (
          <CollectionHeader title="New Properties" />
        )}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-[1200px] mx-auto items-stretch'>
          {isInitialLoading && !initialError && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={`new-sk-${i}`} className="w-full h-full flex min-h-0">
                  <PropertyCardSkeleton variant="compact" />
                </div>
              ))}
            </>
          )}
          {!isInitialLoading && initialError && (
            <SectionEmptyState
              tone="error"
              title="We couldn’t load this section"
              description={initialError}
              actionHref="/real-estate/list"
              actionLabel="Open property listing"
            />
          )}
          {!isInitialLoading && !initialError && newPropertiesList.length === 0 && (
            <SectionEmptyState
              title="No new listings to show"
              description="Check back soon or browse the complete catalogue."
              actionHref="/real-estate/list"
              actionLabel="View all properties"
            />
          )}
          {!isInitialLoading && !initialError && newPropertiesList.map((property: any, i: number) => {
            const propertyId = property?.id
            const land = isLandProperty(property)
            return (
              <div key={property?.id ?? `new-${i}`} className='w-full h-full flex'>
                <PropertieCard
                  onClick={() => onCardContainerClick(property?.id)}
                  villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                  title={property?.title || ''}
                  country={property?.country || ''}
                  location={getRealEstateCardLocationLabel(property || {})}
                  capa1="/images/capa-1-4@2x.png"
                  price={getPriceLabel(property)}
                  saleListingCurrency={getPropertySaleListingCurrency(property)}
                  bedrooms={property?.classification?.bedrooms || 0}
                  bathrooms={getRealEstateBathrooms(property?.classification)}
                  yearBuilt={getRealEstateYearBuilt(property?.classification)}
                  salePriceNumeric={Number(property?.sale_price) || null}
                  plotSqm={getRealEstatePlotSqm(property?.classification)}
                  buildSqm={getRealEstateBuildSqm(property?.classification)}
                  isLand={land}
                  guests={0}
                  pools={countPoolsForRealEstateCard(property?.classification)}
                  rental={false}
                  {...getRealEstateCardExtras(property)}
                  simple
                  compact
                  showFavorite={true}
                  liked={Boolean(propertyId && isLiked(propertyId))}
                  onToggleFavorite={propertyId ? () => toggleFavorite(propertyId) : undefined}
                  isTogglingFavorite={Boolean(propertyId && pendingIds.has(propertyId))}
                />
              </div>
            )
          })}
        </div>
      </section>
      <section className='px-4 md:px-32 py-12 md:py-16 bg-[#F5F8FE]'>
        <h2 className='font-haas mb-8 font-light text-[#172338] text-2xl md:text-3xl w-full max-w-[1200px] mx-auto'>Popular locations to invest in</h2>
        {destinationsLoading ? (
          <DestinationsGridSkeleton />
        ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto'>
          {destinations.length > 0 ? (
            destinationColSpans.map((span, index) => {
              const dest = destinations[index];
              const colSpan = span === 2 ? 'lg:col-span-2' : 'lg:col-span-1';
              return (
                <div
                  key={dest.key}
                  className={`${colSpan} flex items-center justify-center relative h-48 md:h-[400px] cursor-pointer group`}
                  onClick={() => router.push(`/real-estate/in-city?city=${dest.key}`)}
                >
                  <img 
                    src={wsrvUrl(resolveMediaUrl(dest.image) || '/images/placeholder.svg', {
                      w: 560,
                      h: 400,
                      q: 90,
                    })} 
                    alt={dest.title} 
                    className='absolute w-full h-full object-cover transition-transform duration-300' 
                  />
                  <div className='z-10 flex flex-col items-center gap-2'>
                    <p className='text-white text-4xl text-center font-gtsuper-ds font-light'>{dest.title.toUpperCase()}</p>
                    {destinationCounts[dest.key] > 0 && (
                      <p className='text-white/90 font-haas font-light text-[11px] md:text-xs uppercase tracking-[0.24em]'>
                        {destinationCounts[dest.key]} {destinationCounts[dest.key] === 1 ? 'property' : 'properties'}
                      </p>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
              );
            })
          ) : (
            // Fallback a las imágenes hardcodeadas si no hay destinations
            <>
              <div className='lg:col-span-1 flex items-center justify-center relative h-48 md:h-[400px] cursor-pointer' onClick={() => router.push('/real-estate/in-city?city=mykonos')}>
                <img src={MykonosImage.src} alt="" className='absolute w-full h-full object-cover' />
                <p className='text-white z-10 text-4xl text-center font-gtsuper-ds font-light'>MYKONOS</p>
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className='lg:col-span-2 flex items-center justify-center h-48 md:h-[400px] relative cursor-pointer' onClick={() => router.push('/real-estate/in-city?city=paros')}>
                <img src={ParosImage.src} alt="" className='absolute w-full h-full object-cover' />
                <p className='text-white z-10 text-4xl text-center font-gtsuper-ds font-light'>PAROS</p>
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className='lg:col-span-1 flex items-center justify-center h-48 md:h-[400px] relative cursor-pointer' onClick={() => router.push('/real-estate/in-city?city=athens-riviera')}>
                <img src={GreeceImage.src} alt="" className='absolute w-full h-full object-cover' />
                <p className='text-white z-10 text-4xl text-center font-gtsuper-ds font-light'>ATHENS RIVIERA</p>
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className='lg:col-span-1 flex items-center justify-center h-48 md:h-[400px] relative cursor-pointer' onClick={() => router.push('/real-estate/in-city?city=antiparos')}>
                <img src={MykonosCardImage.src} alt="" className='absolute w-full h-full object-cover' />
                <p className='text-white z-10 text-4xl text-center font-gtsuper-ds font-light'>ANTIPAROS</p>
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className='lg:col-span-1 flex items-center justify-center h-48 md:h-[400px] relative cursor-pointer' onClick={() => router.push('/real-estate/in-city?city=corfu')}>
                <img src={BoatsImage.src} alt="" className='absolute w-full h-full object-cover' />
                <p className='text-white z-10 text-4xl text-center font-gtsuper-ds font-light'>CORFU</p>
                <div className="absolute inset-0 bg-black/20" />
              </div>
            </>
          )}
        </div>
        )}
      </section>
      <PremiumPortfolioTopNetworking
        premiumPortfolio={premiumPortfolioImage ? { image: premiumPortfolioImage } : undefined}
        topNetworking={topNetworkingImage ? { image: topNetworkingImage } : undefined}
      />
      <section className='px-4 md:px-32 py-12 md:py-16'>
        <CollectionHeader title="Top Searches" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-[1200px] mx-auto">
          {topSearchStatsLoading ? (
            <>
              {[0, 1, 2].map((i) => (
                <TopSearchCardSkeleton key={`topsearch-sk-${i}`} />
              ))}
            </>
          ) : (
            (dynamicTopSearches ?? REAL_ESTATE_TOP_SEARCHES).map((search) => (
              <TopSearchCard
                key={search.key}
                title={search.title}
                image={search.image}
                imagePosition={search.imagePosition}
                propertyCount={topSearchStats[search.region] ?? 0}
                onClick={() =>
                  router.push(
                    `/real-estate/list?region=${encodeURIComponent(search.region)}&category=real-estate&rental=false`
                  )
                }
              />
            ))
          )}
        </div>
        {topSearchError && !topSearchStatsLoading && (
          <p className="mt-6 text-sm font-haas text-[#506A70] border border-[#a3a3a3]/40 rounded-sm px-4 py-3 bg-white/80" role="alert">
            {topSearchError}
          </p>
        )}
      </section>
      <section className='bg-[#172338] px-4 md:px-32 py-14 md:py-20'>
        <div className='mx-auto max-w-[1200px] flex flex-col items-center gap-6 text-center'>
          <h2 className='font-haas font-light text-white text-2xl md:text-4xl leading-snug max-w-3xl'>
            Thinking of selling your property?
          </h2>
          <Link
            href="/sell-with-us"
            className="inline-flex items-center gap-2 h-12 px-8 border border-white text-white font-haas font-light text-sm uppercase tracking-[0.18em] hover:bg-white hover:text-[#172338] transition-colors"
          >
            Sell with us
            <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </section>
      {/* <section className='px-4 md:px-32 py-10  flex flex-col gap-5'>
        <div className='flex justify-between items-center'>
          <h1 className='font-gtsuper-ds font-light text-[#172338] text-2xl'>New properties</h1>
          <Link href="/" className='text-[#172338] font-semibold'>
            <span className='underline text-sm text-[#172338]'>View all properties</span>
          </Link>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full'>
          {!isLoading && !error && properties.map((property: any, i: number) => {
            const propertyId = property?.id
            return (
              <div key={property?.id ?? `additional-${i}`} className='w-full'>
                <PropertieCard
                  onClick={() => onCardContainerClick(property?.id)}
                  villaImage={realEstateCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))}
                  title={property?.title || ''}
                  country={property?.country || ''}
                  location={property?.location || ''}
                  capa1="/images/capa-1-4@2x.png"
                  price={getPriceLabel(property)}
                  bedrooms={property?.classification?.bedrooms || 0}
                  guests={0}
                  pools={countSwimmingPoolsFromClassification(property?.classification)}
                  rental={false}
                  {...getRealEstateCardExtras(property)}
                  showFavorite={true}
                  liked={Boolean(propertyId && isLiked(propertyId))}
                  onToggleFavorite={propertyId ? () => toggleFavorite(propertyId) : undefined}
                  isTogglingFavorite={Boolean(propertyId && pendingIds.has(propertyId))}
                />
              </div>
            )
          })}
        </div>
      </section> */}
    </div>
  )
}
