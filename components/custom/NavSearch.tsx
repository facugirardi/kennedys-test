"use client"
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { buildRealEstateDetailPath } from "@/lib/rentalRoute";
import { useRouter } from 'next/router'
import { Search, X, ChevronRight } from 'lucide-react'
import { getAllProperties } from '@/lib/api/properties'
import { getAllEvents } from '@/lib/api/events'
import { getAllServices } from '@/lib/api/services'
import { resolveMediaUrl, normalizePropertiesResponse, slugify, wsrvUrl, matchesSearchQuery, normalizeSearchText } from '@/lib/utils'
import { MANAGED_WE_MANAGE_VILLA_AGENT_IDS, mapWeManagePropertyToCard } from '@/lib/weManageManagedVillas'
import { mapServiceToPreview } from '@/lib/mappers/concierge'

type Category = 'villas' | 'real-estate' | 'concierge' | 'events'

const CATEGORY_LABELS: Record<Category, string> = {
  villas: 'Villas',
  'real-estate': 'Real Estate',
  concierge: 'Concierge',
  events: 'Events',
}

// Fetch more candidates per category than we display, so the final cross-category
// relevance sort can actually pick the best matches instead of always keeping the
// top N of each category regardless of how well they match.
const FETCH_PER_CATEGORY = 6
const MAX_RESULTS = 8

/** Lower score = closer match. Exact title match, then starts-with, then whole word, then substring position. */
function relevanceScore(title: string, term: string): number {
  const name = normalizeSearchText(title)
  if (!term) return 0
  if (name === term) return 0
  if (name.startsWith(term)) return 1
  if (name.split(/\s+/).includes(term)) return 2
  const idx = name.indexOf(term)
  return idx >= 0 ? 3 + idx : Number.MAX_SAFE_INTEGER
}

interface ResultItem {
  id: string
  title: string
  subtitle?: string
  image: string
  href: string
  category: Category
}

interface PopularItem {
  id: string
  title: string
  subtitle?: string
  image: string
  href: string
}

const POPULAR_CONCIERGE: PopularItem[] = [
  { id: 'yacht', title: 'Yacht', subtitle: 'Luxury charter', image: '/images/yacht-image.jpg', href: '/concierge/list?type=Yacht' },
  { id: 'chef', title: 'Private Chef', subtitle: 'In-villa dining', image: '/images/cheff-image.png', href: '/concierge/list?type=Chef' },
  { id: 'car-rental', title: 'Car Rental', subtitle: 'Premium fleet', image: '/images/chuffer-service-image.png', href: '/concierge/list?type=Car%20Rental' },
  { id: 'jet', title: 'Private Jet', subtitle: 'Air charter', image: '/images/plane-image.png', href: '/concierge/list?type=PrivateJet' },
]

interface NavSearchProps {
  onClose: () => void
}

const OPEN_DURATION = 380
const CLOSE_DURATION = 260

function getPrimaryImage(images: any[]): string {
  const img = images.find((i: any) => i?.isPrimary) || images[0]
  return resolveMediaUrl(img?.urlImage || img?.url || '') || '/images/luxurystate.png'
}

function thumbUrl(src: string): string {
  if (!src || src.startsWith('/')) return src
  return wsrvUrl(src, { w: 80, h: 80, q: 50 })
}

function popularThumbUrl(src: string): string {
  if (!src || src.startsWith('/')) return src
  return wsrvUrl(src, { w: 640, h: 280, q: 90 })
}

const NavSearch: React.FC<NavSearchProps> = ({ onClose }) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Autocomplete
  const [results, setResults] = useState<ResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Popular
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])
  const [popularLoading, setPopularLoading] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)

  // Open animation
  const [placeholder, setPlaceholder] = useState('Search…')

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setPlaceholder('Search by property, location or service…')
    }
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true)
        inputRef.current?.focus()
      })
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  // Close on Escape
  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(() => onClose(), CLOSE_DURATION)
  }, [onClose, isClosing])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  // Load popular items once — 1 villa + 1 concierge (hardcoded) + 1 event
  useEffect(() => {
    Promise.allSettled([
      import('@/lib/api/properties').then(m => m.getProperty(MANAGED_WE_MANAGE_VILLA_AGENT_IDS[0])),
      getAllEvents({ listing: 1 }),
    ]).then(([villaRes, eventsRes]) => {
      const items: PopularItem[] = []

      if (villaRes.status === 'fulfilled') {
        const card = mapWeManagePropertyToCard(villaRes.value?.data ?? villaRes.value)
        if (card) {
          items.push({
            id: String(card.id),
            title: card.title,
            subtitle: card.location,
            image: card.villaImage || '/images/luxurystate.png',
            href: `/villas/${card.id}`,
          })
        }
      }

      items.push(POPULAR_CONCIERGE[0])

      if (eventsRes.status === 'fulfilled') {
        const raw = eventsRes.value
        const data: any[] = Array.isArray(raw?.data) ? raw.data : []
        const first = data[0]
        if (first) {
          items.push({
            id: String(first.id ?? 'event-0'),
            title: first.name || 'Event',
            subtitle: first.summary ? first.summary.slice(0, 50) : '',
            image: resolveMediaUrl(first.image || '') || '/images/events-1.png',
            href: `/events/${slugify(first.name || 'event')}`,
          })
        }
      }

      setPopularItems(items)
      setPopularLoading(false)
    })
  }, [])

  // Debounced autocomplete search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const q = query.trim()
    if (!q) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const [villasRes, realEstateRes, servicesRes, eventsRes] = await Promise.allSettled([
          getAllProperties({ rental: true, searchQuery: q, take: FETCH_PER_CATEGORY }),
          getAllProperties({ rental: false, category: 'real-estate', searchQuery: q, take: FETCH_PER_CATEGORY }),
          getAllServices({ search: q, take: FETCH_PER_CATEGORY }),
          getAllEvents({ listing: 1, search: q }),
        ])

        const items: ResultItem[] = []
        const ql = normalizeSearchText(q)

        if (villasRes.status === 'fulfilled') {
          normalizePropertiesResponse(villasRes.value).slice(0, FETCH_PER_CATEGORY).forEach((p: any) => {
            items.push({
              id: String(p.id ?? Math.random()),
              title: p.title || 'Villa',
              subtitle: p.visibleLocation || p.location || '',
              image: getPrimaryImage(Array.isArray(p.images) ? p.images : []),
              href: `/villas/${p.id}`,
              category: 'villas',
            })
          })
        }

        if (realEstateRes.status === 'fulfilled') {
          normalizePropertiesResponse(realEstateRes.value).slice(0, FETCH_PER_CATEGORY).forEach((p: any) => {
            items.push({
              id: String(p.id ?? Math.random()),
              title: p.title || 'Property',
              subtitle: [p.visibleLocation, p.location].filter(Boolean).join(', '),
              image: getPrimaryImage(Array.isArray(p.images) ? p.images : []),
              href: buildRealEstateDetailPath(p),
              category: 'real-estate',
            })
          })
        }

        if (servicesRes.status === 'fulfilled') {
          const raw = servicesRes.value
          const data: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []
          data
            .map((s: any) => ({ s, preview: mapServiceToPreview(s) }))
            // Match against name AND location — a query like "5 star concierge paros" only
            // matches because "paros" is the service's location, not part of its name.
            .filter(({ s, preview }) => matchesSearchQuery(`${preview.name} ${s.name || s.title || ''} ${preview.location || ''}`, q))
            .slice(0, FETCH_PER_CATEGORY)
            .forEach(({ s, preview }) => {
              items.push({
                id: String(s.id ?? Math.random()),
                title: preview.name,
                subtitle: preview.type || '',
                image: preview.image,
                // Link by id (not the pretty breadcrumb path): two services can share the same
                // name, so the id is the only unambiguous target — the detail page redirects to
                // the correct SEO-friendly canonical URL once it resolves the service.
                href: `/concierge/${encodeURIComponent(String(s.id))}`,
                category: 'concierge',
              })
            })
        }

        if (eventsRes.status === 'fulfilled') {
          const raw = eventsRes.value
          const data: any[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.data?.items) ? raw.data.items : []
          data.filter((e: any) => matchesSearchQuery(e.name || '', q))
            .slice(0, FETCH_PER_CATEGORY)
            .forEach((e: any) => {
              items.push({
                id: String(e.id ?? Math.random()),
                title: e.name || 'Event',
                subtitle: e.summary ? e.summary.slice(0, 60) : '',
                image: resolveMediaUrl(e.image || '') || '/images/events-1.png',
                href: `/events/${slugify(e.name || 'event')}`,
                category: 'events',
              })
            })
        }

        const ranked = items
          .sort((a, b) => relevanceScore(a.title, ql) - relevanceScore(b.title, ql))
          .slice(0, MAX_RESULTS)

        setResults(ranked)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const handleSearch = () => {
    const q = query.trim()
    if (!q) return
    handleClose()
    setTimeout(() => router.push(`/search?q=${encodeURIComponent(q)}`), CLOSE_DURATION)
  }

  const navigateTo = (href: string) => {
    handleClose()
    setTimeout(() => router.push(href), CLOSE_DURATION)
  }

  const entered = isVisible && !isClosing
  const panelDuration = isClosing ? CLOSE_DURATION : OPEN_DURATION
  const panelEasing = isClosing ? 'cubic-bezier(0.4, 0, 1, 1)' : 'cubic-bezier(0, 0, 0.2, 1)'
  const transitionPanel = `opacity ${panelDuration}ms ${panelEasing}, transform ${panelDuration}ms ${panelEasing}`
  const transitionBackdrop = isClosing
    ? `opacity ${CLOSE_DURATION}ms ease-in`
    : `opacity ${OPEN_DURATION}ms ease-out`

  const hasQuery = query.trim().length > 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-black/30"
        style={{ opacity: entered ? 1 : 0, transition: transitionBackdrop }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed left-0 right-0 top-0 z-[100] bg-white shadow-[0_8px_32px_rgba(23,35,56,0.12)]"
        style={{
          opacity: entered ? 1 : 0,
          transform: entered ? 'translateY(0)' : 'translateY(-18px)',
          transition: transitionPanel,
        }}
        onMouseLeave={handleClose}
      >
        <div className="mx-auto max-w-[1000px] px-6 pb-8 pt-6 md:px-12 md:pt-8">

          {/* Search input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="flex items-stretch">
            <div className="relative flex h-12 flex-1 items-center border border-[#EBEBEB] bg-white">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#506A70]/50" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="h-12 w-full bg-transparent pl-10 pr-10 font-haas text-base md:text-sm font-thin text-[#172338] placeholder:text-xs placeholder:md:text-sm placeholder:text-[#506A70]/50 focus:outline-none focus:ring-0"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-3 text-[#9BA6AE] hover:opacity-70 focus:outline-none">
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
            <button type="submit" className="h-12 bg-[#28F7EA] px-6 font-haas text-sm font-light text-[#172338] transition-opacity hover:opacity-90 focus:outline-none shrink-0">
              Search
            </button>
          </form>

          {/* Popular — visible when no query */}
          {!hasQuery && (
            <div className="mt-7">
              <p className="mb-3 font-haas text-[10px] uppercase tracking-[0.2em] text-[#9BA6AE]">Popular Searches</p>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {popularLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className={i === 2 ? 'hidden md:block' : ''}>
                        <div className="h-[119px] w-full bg-[#E8EBED] animate-pulse" />
                        <div className="mt-2 h-3 w-3/4 bg-[#E8EBED] animate-pulse rounded" />
                        <div className="mt-1.5 h-2.5 w-1/2 bg-[#E8EBED] animate-pulse rounded" />
                      </div>
                    ))
                  : popularItems.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.href)}
                        className={`group text-left focus:outline-none${i === 2 ? ' hidden md:block' : ''}`}
                      >
                        <div className="h-[119px] w-full overflow-hidden bg-[#E8EBED]">
                          <img
                            src={popularThumbUrl(item.image)}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-2 font-haas text-[13px] font-light text-[#172338] line-clamp-1 group-hover:text-[#506A70] transition-colors">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="font-haas text-[11px] font-thin text-[#9BA6AE] line-clamp-1">{item.subtitle}</p>
                        )}
                      </button>
                    ))
                }
              </div>
            </div>
          )}

          {/* Autocomplete — visible when query */}
          {hasQuery && (
            <div className="mt-4 max-h-[420px] overflow-y-auto">
              {isSearching ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-11 w-11 shrink-0 bg-[#E8EBED]" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-2/3 bg-[#E8EBED] rounded" />
                        <div className="h-2.5 w-1/2 bg-[#E8EBED] rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="space-y-0.5">
                    {results.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.href)}
                        className="group flex w-full items-center gap-3 rounded px-1 py-2 text-left transition-colors hover:bg-[#F8F9FA] focus:outline-none"
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden bg-[#E8EBED]">
                          <img src={thumbUrl(item.image)} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-haas text-[13px] font-light text-[#172338] line-clamp-1 transition-colors group-hover:text-[#506A70]">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="font-haas text-[11px] font-thin text-[#9BA6AE] line-clamp-1">{item.subtitle}</p>
                          )}
                        </div>
                        <span className="shrink-0 font-haas text-[9px] uppercase tracking-[0.15em] text-[#9BA6AE]">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9BA6AE] opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="flex items-center gap-1 font-haas text-[12px] font-light text-[#506A70] transition-colors hover:text-[#172338]"
                    >
                      See all results for &ldquo;{query.trim()}&rdquo;
                      <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="py-4 font-haas text-[13px] font-thin text-[#9BA6AE]">
                  No results found for &ldquo;{query.trim()}&rdquo;
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default NavSearch
