import React, { useEffect, useState, useCallback } from 'react'
import { getRealEstateCardExtras } from "@/lib/realEstateCard";
import { buildRealEstateDetailPath } from "@/lib/rentalRoute";
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Search, MapPin, ChevronRight, Heart } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { PropertieCard } from '@/components/custom/propertieCard'
import { ConciergeCard } from '@/components/ConciergeCard'
import { getAllProperties } from '@/lib/api/properties'
import { getAllEvents } from '@/lib/api/events'
import { getAllServices } from '@/lib/api/services'
import {
  resolveMediaUrl,
  normalizePropertiesResponse,
  slugify,
  heroImageDirectUrl,
  formatNightlyPriceLabel,
  getPropertyPriceCurrencySymbol,
  matchesSearchQuery,
} from '@/lib/utils'
import { getConciergeServicePath, mapServiceToPreview } from '@/lib/mappers/concierge'
import {
  countPoolsForRealEstateCard,
  getRealEstateBuildSqm,
  getRealEstatePlotSqm,
} from '@/lib/propertyPoolCounts'

type Category = 'villas' | 'real-estate' | 'concierge' | 'events'

const CATEGORIES: { key: Category; label: string; href: string }[] = [
  { key: 'villas', label: 'Villas', href: '/villas/list' },
  { key: 'real-estate', label: 'Real Estate', href: '/real-estate/list' },
  { key: 'concierge', label: 'Concierge', href: '/concierge/list' },
  { key: 'events', label: 'Events', href: '/events/list' },
]

function getPrimaryImage(images: any[]): string {
  const img = images?.find((i: any) => i?.isPrimary) || images?.[0]
  return resolveMediaUrl(img?.urlImage || img?.url || '') || '/images/luxurystate.png'
}

function getPropertyPrice(property: any): string {
  if (property?.price_visibility === false) return 'Price on request'
  if (property?.sale_price) {
    const n = Number(property.sale_price)
    if (Number.isFinite(n)) return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
  }
  const sym = getPropertyPriceCurrencySymbol(property, [])
  return formatNightlyPriceLabel(property?.price_per_night, sym) || 'Price on request'
}

function VillaCardSkeleton() {
  return (
    <div className="animate-pulse border border-[#E8ECEF] bg-white">
      <div className="h-64 w-full bg-[#E8EBED]" />
      <div className="p-5 space-y-2">
        <div className="h-4 w-3/4 bg-[#E8EBED] rounded" />
        <div className="h-3 w-1/2 bg-[#E8EBED] rounded" />
        <div className="h-3 w-2/3 bg-[#E8EBED] rounded mt-3" />
      </div>
    </div>
  )
}

function VillaCard({ property, onClick }: { property: any; onClick: () => void }) {
  const imageUrl = (() => {
    const imgs = Array.isArray(property.images) ? property.images : []
    if (!imgs.length) return '/images/villa-detail@2x.png'
    const raw = imgs[0]?.urlImage || imgs[0]?.url || ''
    if (!raw) return '/images/villa-detail@2x.png'
    const resolved = /^https?:\/\//i.test(raw) ? raw : resolveMediaUrl(raw)
    return resolved ? heroImageDirectUrl(resolved) : '/images/villa-detail@2x.png'
  })()

  const bedrooms = property?.classification?.bedrooms
  const location = property?.visibleLocation || property?.location || property?.country || ''
  const sym = getPropertyPriceCurrencySymbol(property, [])

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer border border-[#E8ECEF] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-[border-color,box-shadow] duration-500 hover:border-[#D99330] hover:shadow-[0_12px_40px_rgba(23,35,56,0.13)] overflow-hidden"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/villa-detail@2x.png' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/65 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="absolute bottom-0 inset-x-0 px-5 pb-4 translate-y-2 opacity-0 transition-all duration-500 delay-75 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="border-b border-white/40 pb-0.5 font-haas text-[11px] uppercase tracking-[0.22em] text-white">View Villa</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="mb-1 truncate font-haas font-medium text-lg leading-snug text-[#172338] transition-colors duration-300 group-hover:text-[#0f1a2e]">
          {property.title}
        </h3>
        {location && (
          <div className="mb-3 flex items-center gap-1 text-[#506A70]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate text-sm">{location}</span>
          </div>
        )}
        {bedrooms != null && (
          <p className="mb-4 font-haas text-xs uppercase tracking-wider text-[#8A9BA0]">
            {bedrooms} bedroom{bedrooms !== 1 ? 's' : ''}
          </p>
        )}
        <div className="flex items-center justify-between border-t border-[#F0F3F5] pt-3">
          <div>
            <span className="block font-haas text-[10px] uppercase tracking-wider text-[#8A9BA0]">From</span>
            <span className="font-haas font-medium text-base text-[#D99330]">
              {formatNightlyPriceLabel(property?.price_per_night, sym) || '—'}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-[#8A9BA0] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#D99330]" />
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, onClick }: { event: any; onClick: () => void }) {
  const image = resolveMediaUrl(event.image || '') || '/images/events-1.png'
  return (
    <div
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col gap-5 border bg-white p-5 transition-opacity hover:opacity-95"
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}
    >
      <div className="relative h-60 w-full overflow-hidden">
        <img src={image} alt={event.name} className="h-full w-full object-cover" />
      </div>
      <h3 className="font-gtsuper-ds text-2xl font-light">{event.name}</h3>
      {event.summary && <p className="font-haas text-sm text-gray-600">{event.summary}</p>}
      <span className="pointer-events-none font-haas text-sm text-primary underline">View More</span>
    </div>
  )
}

function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => <VillaCardSkeleton key={i} />)}
    </div>
  )
}

export default function SearchPage() {
  const router = useRouter()
  const q = typeof router.query.q === 'string' ? router.query.q.trim() : ''

  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set<Category>(['villas', 'real-estate', 'concierge', 'events'])
  )
  const [results, setResults] = useState<Record<Category, any[]>>({
    villas: [], 'real-estate': [], concierge: [], events: [],
  })
  const [loading, setLoading] = useState<Record<Category, boolean>>({
    villas: false, 'real-estate': false, concierge: false, events: false,
  })

  const toggleCategory = useCallback((cat: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat) && next.size > 1) next.delete(cat)
      else next.add(cat)
      return next
    })
  }, [])

  useEffect(() => {
    if (!q) return

    setLoading({ villas: true, 'real-estate': true, concierge: true, events: true })

    Promise.allSettled([
      getAllProperties({ rental: true, searchQuery: q, take: 8 }),
      getAllProperties({ rental: false, category: 'real-estate', searchQuery: q, take: 8 }),
      getAllServices({ search: q, take: 8 }),
      getAllEvents({ listing: 1, search: q }),
    ]).then(([villasRes, realEstateRes, servicesRes, eventsRes]) => {
      const next: Record<Category, any[]> = { villas: [], 'real-estate': [], concierge: [], events: [] }

      if (villasRes.status === 'fulfilled') {
        next.villas = normalizePropertiesResponse(villasRes.value).slice(0, 8)
      }
      if (realEstateRes.status === 'fulfilled') {
        next['real-estate'] = normalizePropertiesResponse(realEstateRes.value).slice(0, 8)
      }
      if (servicesRes.status === 'fulfilled') {
        const raw = servicesRes.value
        const data: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
        next.concierge = data
          .map((s: any) => mapServiceToPreview(s))
          // Match against name AND location — a query like "5 star concierge paros" only
          // matches because "paros" is the service's location, not part of its name.
          .filter((preview: any) => matchesSearchQuery(`${preview.name} ${preview.location || ''}`, q))
          .slice(0, 8)
      }
      if (eventsRes.status === 'fulfilled') {
        const raw = eventsRes.value
        const data: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.data?.items) ? raw.data.items : []
        next.events = data.filter((e: any) => matchesSearchQuery(e.name || '', q)).slice(0, 8)
      }

      setResults(next)
      setLoading({ villas: false, 'real-estate': false, concierge: false, events: false })
    })
  }, [q])

  const totalResults = Object.values(results).reduce((acc, arr) => acc + arr.length, 0)
  const isAnyLoading = Object.values(loading).some(Boolean)

  return (
    <div className="min-h-screen bg-white font-haas">
      <Navbar textBlack={true} />

      <div className="pt-24 md:pt-28">
        <main className="mx-auto max-w-[1300px] px-4 pb-16 md:px-10 lg:px-16">

          {/* Header */}
          <div className="mb-8 mt-6">
            {q ? (
              <>
                <p className="mb-1 font-haas text-[11px] uppercase tracking-[0.2em] text-[#9BA6AE]">
                  Search results
                </p>
                <h1 className="font-haas text-[28px] font-thin text-[#172338] md:text-[36px]">
                  &ldquo;{q}&rdquo;
                </h1>
                {!isAnyLoading && (
                  <p className="mt-1 font-haas text-[13px] font-thin text-[#9BA6AE]">
                    {totalResults} result{totalResults !== 1 ? 's' : ''} across all categories
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center py-20 text-center">
                <Search className="mb-4 h-10 w-10 text-[#9BA6AE]" strokeWidth={1} />
                <p className="font-haas text-[18px] font-thin text-[#506A70]">
                  Enter a search term to find properties, services and events
                </p>
              </div>
            )}
          </div>

          {q && (
            <>
              {/* Category filters */}
              <div className="mb-10 flex flex-wrap gap-2">
                {CATEGORIES.filter(({ key }) => loading[key] || results[key].length > 0).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCategory(key)}
                    className={`h-8 border px-4 font-haas text-[12px] font-light transition-colors focus:outline-none ${
                      activeCategories.has(key)
                        ? 'border-[#172338] bg-[#172338] text-white'
                        : 'border-[#D1D5DB] bg-white text-[#506A70] hover:border-[#172338] hover:text-[#172338]'
                    }`}
                  >
                    {label}
                    {!loading[key] && results[key].length > 0 && (
                      <span className={`ml-1.5 text-[10px] ${activeCategories.has(key) ? 'text-white/70' : 'text-[#9BA6AE]'}`}>
                        {results[key].length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Results */}
              {CATEGORIES.filter(({ key }) => activeCategories.has(key) && (loading[key] || results[key].length > 0)).map(({ key, label, href }) => (
                <section key={key} className="mb-14">
                  <div className="mb-5 flex items-center justify-between border-b border-[#EBEBEB] pb-3">
                    <h2 className="font-haas text-[11px] uppercase tracking-[0.2em] text-[#9BA6AE]">{label}</h2>
                    {!loading[key] && results[key].length > 0 && (
                      <Link
                        href={href}
                        className="flex items-center gap-1 font-haas text-[11px] font-light text-[#506A70] transition-colors hover:text-[#172338]"
                      >
                        View all <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                      </Link>
                    )}
                  </div>

                  {loading[key] ? (
                    <GridSkeleton count={4} />
                  ) : key === 'villas' ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
                      {results[key].map((property: any) => (
                        <VillaCard
                          key={property.id}
                          property={property}
                          onClick={() => router.push(`/villas/${property.id}`)}
                        />
                      ))}
                    </div>
                  ) : key === 'real-estate' ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {results[key].map((property: any) => (
                        <PropertieCard
                          key={property.id}
                          onClick={() => router.push(buildRealEstateDetailPath(property))}
                          villaImage={heroImageDirectUrl(property?.images?.[0]?.urlImage || '/images/villa-placeholder.jpg')}
                          title={property?.title || ''}
                          location={property?.location || property?.visibleLocation || ''}
                          capa1="/images/capa-1-4@2x.png"
                          price={getPropertyPrice(property)}
                          bedrooms={property?.classification?.bedrooms || 0}
                          guests={0}
                          plotSqm={getRealEstatePlotSqm(property?.classification)}
                          buildSqm={getRealEstateBuildSqm(property?.classification)}
                          pools={countPoolsForRealEstateCard(property?.classification)}
                          isLand={String(property?.classification?.type || '').toLowerCase() === 'land'}
                          rental={false}
                          {...getRealEstateCardExtras(property)}
                        />
                      ))}
                    </div>
                  ) : key === 'concierge' ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-10 lg:grid-cols-3">
                      {results[key].map((service: any) => {
                        let detailPath = `/concierge/${service.id}`
                        try {
                          detailPath = getConciergeServicePath({
                            location: service.location || null,
                            type: service.type,
                            name: service.name,
                          })
                        } catch (_) {}
                        return (
                          <ConciergeCard
                            key={service.id}
                            simple
                            image={service.image || ''}
                            title={service.name || service.title || ''}
                            description={service.description || ''}
                            serviceId={service.id}
                            serviceType={service.type}
                            detailPath={detailPath}
                          />
                        )
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {results[key].map((event: any) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => router.push(`/events/${slugify(event.name || 'event')}`)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
