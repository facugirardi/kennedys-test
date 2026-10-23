import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { CalendarOff, ChevronRight, SearchX, X } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import EventSearch from '@/components/custom/EventSearch'
import {
  EventFilterOverlay,
  type EventFilterOverlayState,
} from '@/components/custom/EventFilterOverlay'
import { buildLocationTreeLabel } from '@/components/custom/LocationTreeDropdown'
import { getAllEvents, parseEventsListingResponse } from '@/lib/api/events'
import {
  filterEventsList,
  eventsListHasActiveFilters,
  type EventsListFilterQuery,
} from '@/lib/eventsListFilters'
import { parseSortPriceQuery, sortEventListByCardPrice } from '@/lib/eventsListSort'
import { resolveMediaUrl, slugify } from '@/lib/utils'
import { useEventFavorites } from '@/src/hooks/useEventFavorites'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'

export const EVENTS_LIST_PAGE_SIZE = 9

interface EventListItem {
  id: string
  name: string
  summary: string
  image: string
  gallery: string[]
}

export type EventsListInitialQuery = {
  types: string[]
  location: string
  area: string
  min: string
  max: string
}

export type EventsListInitialPagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

type EventsListLoadMode = 'server' | 'client-filter'

type EventsListPageProps = {
  initialEvents?: EventListItem[]
  initialQuery?: EventsListInitialQuery
  initialPagination?: EventsListInitialPagination | null
  initialLoadMode?: EventsListLoadMode
  /** Full filtered list (client-filter mode) for slicing when changing page without refetch */
  initialFilteredCatalog?: EventListItem[] | null
  initialSortPrice?: 'default' | 'asc' | 'desc'
}

function pickQueryParam(v: string | string[] | undefined): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && v[0] != null) return v[0]
  return ''
}

function pickTypesFromQuery(typeQ: string | string[] | undefined): string[] {
  if (Array.isArray(typeQ)) {
    return typeQ.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim())
  }
  if (typeof typeQ === 'string' && typeQ.trim()) return [typeQ.trim()]
  return []
}

function parsePriceQuery(s: string): number | null {
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function textFilterEvents(items: EventListItem[], search: string): EventListItem[] {
  if (!search.trim()) return items
  const q = search.trim().toLowerCase()
  return items.filter((e) => e.name.toLowerCase().includes(q) || (e.summary || '').toLowerCase().includes(q))
}

function mapApiToListItem(event: any): EventListItem {
  return {
    id: String(event.id),
    name: event.name,
    summary: event.summary,
    image: resolveMediaUrl(event.image || '') || '',
    gallery: Array.isArray(event.gallery) ? event.gallery.map((item: string) => resolveMediaUrl(item)) : [],
  }
}

function EventsGridEmptyNoData() {
  return (
    <div className="col-span-full w-full py-14 text-center md:py-20" role="status">
      <span className="sr-only">No events published yet</span>
      <CalendarOff className="mx-auto mb-4 h-10 w-10 text-[#506A70]/45" strokeWidth={1.25} aria-hidden />
      <p className="font-gtsuper-ds text-lg font-light text-[#506A70] md:text-xl">No events yet</p>
      <p className="mx-auto mt-2 max-w-md font-haas text-sm font-light leading-relaxed text-[#172338]/75">
        New experiences will appear here soon. In the meantime, get in touch and we&apos;ll help plan yours.
      </p>
    </div>
  )
}

function EventsListGridSkeleton({ count }: { count: number }) {
  return (
    <div
      className="grid w-full grid-cols-1 gap-6 animate-pulse sm:grid-cols-2 md:gap-8 lg:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading events</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col gap-5 border border-gray-100 bg-white p-5">
          <div className="h-60 w-full bg-gray-200" />
          <div className="h-8 w-4/5 max-w-xs bg-gray-200" />
          <div className="h-4 w-full bg-gray-200" />
          <div className="h-4 w-full bg-gray-200" />
          <div className="h-4 w-2/3 bg-gray-200" />
          <div className="h-4 w-28 bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

function EventsGridEmptyFiltered({ onClear }: { onClear: () => void }) {
  return (
    <div className="col-span-full w-full py-14 text-center md:py-20" role="status">
      <span className="sr-only">No events match the current filters</span>
      <SearchX className="mx-auto mb-4 h-10 w-10 text-[#506A70]/45" strokeWidth={1.25} aria-hidden />
      <p className="font-gtsuper-ds text-lg font-light text-[#506A70] md:text-xl">No matches</p>
      <p className="mx-auto mt-2 max-w-md font-haas text-sm font-light leading-relaxed text-[#172338]/75">
        Try different location, event type, budget, or filters — or clear everything to see all events.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 font-haas text-sm text-[#198092] underline underline-offset-4 hover:text-[#198092]/80"
      >
        Clear filters
      </button>
    </div>
  )
}

const defaultInitialQuery: EventsListInitialQuery = {
  types: [],
  location: '',
  area: '',
  min: '',
  max: '',
}

function buildFilterQueryFromUi(
  typesFromOverlay: string[],
  typeOfService: string,
  location: string,
  area: string,
  priceMin: string,
  priceMax: string,
): EventsListFilterQuery {
  const types =
    typesFromOverlay.length > 0 ? typesFromOverlay : typeOfService ? [typeOfService] : []
  return { types, location, area, min: priceMin, max: priceMax }
}

const KennedysEventsList = ({
  initialEvents = [],
  initialQuery = defaultInitialQuery,
  initialPagination = null,
  initialLoadMode = 'server',
  initialFilteredCatalog = null,
  initialSortPrice = 'default',
}: EventsListPageProps) => {
  const router = useRouter()
  const { isLiked, toggleFavorite } = useEventFavorites()
  const [typeOfService, setTypeOfService] = useState(initialQuery.types[0] || '')
  const [location, setLocation] = useState(initialQuery.location)
  const [area, setArea] = useState(initialQuery.area)
  const [priceMin, setPriceMin] = useState(initialQuery.min)
  const [priceMax, setPriceMax] = useState(initialQuery.max)
  const [showFilters, setShowFilters] = useState(false)
  const [filterState, setFilterState] = useState<EventFilterOverlayState>(() => ({
    serviceTypes: [...initialQuery.types],
    priceRange: {
      min: parsePriceQuery(initialQuery.min),
      max: parsePriceQuery(initialQuery.max),
    },
  }))
  const [gridRows, setGridRows] = useState<EventListItem[]>(initialEvents)
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>(initialSortPrice)
  const [paginationMeta, setPaginationMeta] = useState<EventsListInitialPagination | null>(initialPagination)
  const [loadMode, setLoadMode] = useState<EventsListLoadMode>(initialLoadMode)
  const [filteredCatalog, setFilteredCatalog] = useState<EventListItem[] | null>(initialFilteredCatalog)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const availableLocations: string[] = []
  const mountedWithSsrRef = useRef(initialEvents.length > 0 || (initialPagination != null && initialPagination.total > 0))

  const liveFilterQuery = useMemo(
    () => buildFilterQueryFromUi(filterState.serviceTypes, typeOfService, location, area, priceMin, priceMax),
    [filterState.serviceTypes, typeOfService, location, area, priceMin, priceMax],
  )

  const currentPage = useMemo(() => {
    if (!router.isReady) return initialPagination?.page ?? 1
    const p = Math.max(1, parseInt(pickQueryParam(router.query.page) || String(initialPagination?.page || 1), 10) || 1)
    return p
  }, [router.isReady, router.query.page, initialPagination?.page])

  const syncUrlToState = useCallback(
    (q: EventsListInitialQuery, openFilters?: boolean) => {
      setTypeOfService(q.types[0] || '')
      setLocation(q.location)
      setArea(q.area)
      setPriceMin(q.min)
      setPriceMax(q.max)
      setFilterState({
        serviceTypes: [...q.types],
        priceRange: {
          min: parsePriceQuery(q.min),
          max: parsePriceQuery(q.max),
        },
      })
      if (openFilters) setShowFilters(true)
    },
    [],
  )

  useEffect(() => {
    if (!router.isReady) return
    if (skipUrlSyncRef.current) { skipUrlSyncRef.current = false; return }
    const { type, location: locationParam, area: areaParam, min, max, openFilters, search: searchParam } = router.query
    setSearchText(pickQueryParam(searchParam))
    const next: EventsListInitialQuery = {
      types: pickTypesFromQuery(type),
      location: pickQueryParam(locationParam),
      area: pickQueryParam(areaParam),
      min: pickQueryParam(min),
      max: pickQueryParam(max),
    }
    const shouldOpen = openFilters === 'true'
    syncUrlToState(next, shouldOpen)
  }, [router.isReady, router.query, syncUrlToState])

  const replaceListUrl = useCallback(
    (patch: { page?: number; openFilters?: boolean }) => {
      const qp = new URLSearchParams()
      if (location) qp.set('location', location)
      if (area) qp.set('area', area)
      const types =
        filterState.serviceTypes.length > 0
          ? filterState.serviceTypes
          : typeOfService
            ? [typeOfService]
            : []
      types.forEach((t) => qp.append('type', t))
      if (priceMin) qp.set('min', priceMin)
      if (priceMax) qp.set('max', priceMax)
      if (sortOrder === 'asc' || sortOrder === 'desc') qp.set('sortPrice', sortOrder)
      const page = patch.page ?? currentPage
      if (page > 1) qp.set('page', String(page))
      if (patch.openFilters) qp.set('openFilters', 'true')
      if (searchText) qp.set('search', searchText)
      const qs = qp.toString()
      router.replace(qs ? `/events/list?${qs}` : '/events/list', undefined, { shallow: true, scroll: false })
    },
    [
      router,
      location,
      area,
      typeOfService,
      priceMin,
      priceMax,
      sortOrder,
      filterState.serviceTypes,
      currentPage,
      searchText,
    ],
  )

  const handleSortOrderChange = useCallback(
    (v: 'default' | 'asc' | 'desc') => {
      setSortOrder(v)
      const qp = new URLSearchParams()
      if (location) qp.set('location', location)
      if (area) qp.set('area', area)
      const types =
        filterState.serviceTypes.length > 0
          ? filterState.serviceTypes
          : typeOfService
            ? [typeOfService]
            : []
      types.forEach((t) => qp.append('type', t))
      if (priceMin) qp.set('min', priceMin)
      if (priceMax) qp.set('max', priceMax)
      if (v === 'asc' || v === 'desc') qp.set('sortPrice', v)
      if (searchText) qp.set('search', searchText)
      qp.set('page', '1')
      const qs = qp.toString()
      router.replace(qs ? `/events/list?${qs}` : '/events/list?page=1', undefined, { shallow: true })
    },
    [router, location, area, typeOfService, priceMin, priceMax, filterState.serviceTypes, searchText],
  )

  const pushListQuery = useCallback(
    (openFilters?: boolean) => {
      replaceListUrl({ page: 1, openFilters })
    },
    [replaceListUrl],
  )

  const skipUrlSyncRef = useRef(false)
  const autoFilterInitRef = useRef(false)
  useEffect(() => {
    if (!router.isReady) return
    if (!autoFilterInitRef.current) { autoFilterInitRef.current = true; return }
    const t = setTimeout(() => { skipUrlSyncRef.current = true; pushListQuery(false) }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, area, typeOfService, router.isReady])

  const clearAllFilters = useCallback(() => {
    setTypeOfService('')
    setLocation('')
    setArea('')
    setPriceMin('')
    setPriceMax('')
    setSearchText('')
    setFilterState({ serviceTypes: [], priceRange: { min: null, max: null } })
    router.replace('/events/list', undefined, { shallow: true })
  }, [router])

  useEffect(() => {
    if (!router.isReady) return
    const next = parseSortPriceQuery(pickQueryParam(router.query.sortPrice))
    setSortOrder((prev) => (prev === next ? prev : next))
  }, [router.isReady, router.query.sortPrice])

  const loadEventsForUrl = useCallback(async () => {
    if (!router.isReady) return
    const page = Math.max(1, parseInt(pickQueryParam(router.query.page) || '1', 10) || 1)
    const qFromRouter: EventsListFilterQuery = {
      types: pickTypesFromQuery(router.query.type),
      location: pickQueryParam(router.query.location),
      area: pickQueryParam(router.query.area),
      min: pickQueryParam(router.query.min),
      max: pickQueryParam(router.query.max),
    }
    const urlHasFilters = eventsListHasActiveFilters(qFromRouter)
    const sortFromUrl = parseSortPriceQuery(pickQueryParam(router.query.sortPrice))
    const searchParam = pickQueryParam(router.query.search)
    const needsFullCatalog = urlHasFilters || sortFromUrl !== 'default' || !!searchParam
    setIsLoading(true)
    setError(null)
    try {
      if (needsFullCatalog) {
        const response = await getAllEvents({ listing: 1 })
        const data = Array.isArray(response?.data) ? response.data : []
        const mapped = data.map(mapApiToListItem)
        setFilteredCatalog(mapped)
        setLoadMode('client-filter')
        const filtered = filterEventsList<EventListItem>(mapped, qFromRouter)
        const sorted = sortEventListByCardPrice(filtered, sortFromUrl)
        const totalPages = Math.max(1, Math.ceil(sorted.length / EVENTS_LIST_PAGE_SIZE))
        const safePage = Math.min(page, totalPages)
        const start = (safePage - 1) * EVENTS_LIST_PAGE_SIZE
        setGridRows(sorted.slice(start, start + EVENTS_LIST_PAGE_SIZE))
        setPaginationMeta({
          total: sorted.length,
          page: safePage,
          limit: EVENTS_LIST_PAGE_SIZE,
          totalPages,
        })
      } else {
        const response = await getAllEvents({
          listing: 1,
          page,
          limit: EVENTS_LIST_PAGE_SIZE,
        })
        const { data, pagination } = parseEventsListingResponse(response)
        const mapped = (Array.isArray(data) ? data : []).map(mapApiToListItem)
        setFilteredCatalog(null)
        setLoadMode('server')
        setGridRows(mapped)
        setPaginationMeta(
          pagination ?? {
            total: mapped.length,
            page,
            limit: EVENTS_LIST_PAGE_SIZE,
            totalPages: Math.max(1, Math.ceil(mapped.length / EVENTS_LIST_PAGE_SIZE) || 1),
          },
        )
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('Failed to load events', err)
      setError('We could not load events. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!router.isReady) return
    if (mountedWithSsrRef.current) {
      mountedWithSsrRef.current = false
      return
    }
    loadEventsForUrl()
  }, [router.isReady, router.asPath, loadEventsForUrl])

  const displayedRows = useMemo(() => {
    if (loadMode !== 'client-filter' || filteredCatalog == null) {
      return textFilterEvents(sortEventListByCardPrice(gridRows, sortOrder), searchText)
    }
    const filtered = filterEventsList<EventListItem>(filteredCatalog, liveFilterQuery)
    const sorted = sortEventListByCardPrice(filtered, sortOrder)
    const textFiltered = textFilterEvents(sorted, searchText)
    const totalPages = Math.max(1, Math.ceil(textFiltered.length / EVENTS_LIST_PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * EVENTS_LIST_PAGE_SIZE
    return textFiltered.slice(start, start + EVENTS_LIST_PAGE_SIZE)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadMode, filteredCatalog, liveFilterQuery, currentPage, gridRows, sortOrder, searchText])

  const displayedPagination = useMemo(() => {
    if (loadMode !== 'client-filter' || filteredCatalog == null) {
      return paginationMeta
    }
    const filtered = filterEventsList<EventListItem>(filteredCatalog, liveFilterQuery)
    const sorted = sortEventListByCardPrice(filtered, sortOrder)
    const textFiltered = textFilterEvents(sorted, searchText)
    const totalPages = Math.max(1, Math.ceil(textFiltered.length / EVENTS_LIST_PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    return {
      total: textFiltered.length,
      page: safePage,
      limit: EVENTS_LIST_PAGE_SIZE,
      totalPages,
    }
  }, [loadMode, filteredCatalog, liveFilterQuery, currentPage, paginationMeta, sortOrder, searchText])

  useEffect(() => {
    if (!router.isReady || loadMode !== 'client-filter') return
    if (!displayedPagination) return
    const urlPage = Math.max(1, parseInt(pickQueryParam(router.query.page) || '1', 10) || 1)
    if (urlPage > displayedPagination.totalPages && displayedPagination.totalPages >= 1) {
      replaceListUrl({ page: displayedPagination.totalPages })
    }
  }, [router.isReady, loadMode, displayedPagination, router.query.page, replaceListUrl])

  const handleOpenFilters = () => setShowFilters(true)
  const handleCloseFilters = () => setShowFilters(false)

  const handleApplyFilters = (filters: EventFilterOverlayState) => {
    setFilterState(filters)
    const mappedType = filters.serviceTypes?.[0] || ''
    setTypeOfService(mappedType)
    setPriceMin(filters.priceRange?.min != null ? String(filters.priceRange.min) : '')
    setPriceMax(filters.priceRange?.max != null ? String(filters.priceRange.max) : '')

    const qp = new URLSearchParams()
    if (location) qp.set('location', location)
    if (area) qp.set('area', area)
    ;(filters.serviceTypes || []).forEach((t) => qp.append('type', t))
    if (filters.priceRange?.min != null) qp.set('min', String(filters.priceRange.min))
    if (filters.priceRange?.max != null) qp.set('max', String(filters.priceRange.max))
    if (sortOrder === 'asc' || sortOrder === 'desc') qp.set('sortPrice', sortOrder)
    if (searchText) qp.set('search', searchText)
    qp.set('page', '1')
    const qs = qp.toString()
    router.replace(qs ? `/events/list?${qs}` : '/events/list?page=1', undefined, { shallow: true })
    setShowFilters(false)
  }

  const setEventTypeFromBar = (v: string) => {
    setTypeOfService(v)
    setFilterState((prev) => ({
      ...prev,
      serviceTypes: v ? [v] : [],
    }))
  }

  const setPriceMinFromBar = (v: string) => {
    setPriceMin(v)
    setFilterState((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, min: v ? Number(v) : null },
    }))
  }

  const setPriceMaxFromBar = (v: string) => {
    setPriceMax(v)
    setFilterState((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, max: v ? Number(v) : null },
    }))
  }

  const locationTitleSuffix = buildLocationTreeLabel({
    selectedCountry: '',
    regionValue: location,
    area,
  })

  const heroImage = displayedRows[0]?.image || ''

  const totalForEmptyCheck = displayedPagination?.total ?? 0

  const showPagination =
    !isLoading &&
    !error &&
    displayedPagination &&
    displayedPagination.totalPages > 1 &&
    totalForEmptyCheck > 0

  return (
    <>
      <SeoHead
        title={`All events | ${SITE_NAME}`}
        description="Explore weddings, private celebrations, corporate programs, and destination events — filter by location and service type."
        canonicalPath="/events/list"
        imageUrl={heroImage || undefined}
      />
      <div className="mb-20">
        <header className="sticky top-0 z-20 w-full border-b border-gray-200 bg-white">
          <Navbar textBlack={true} className="relative w-full" />
        </header>
        <div className="flex h-12 items-center gap-2 bg-gray-200 px-4 text-xs md:h-16 md:px-24 md:text-sm">
          <a className="underline" href="/">Home</a>
          <span><ChevronRight className="h-3 w-3" /></span>
          <a className="underline" href="/events">Events</a>
          {locationTitleSuffix && (
            <>
              <span><ChevronRight className="h-3 w-3" /></span>
              <span className="font-semibold">{locationTitleSuffix}</span>
            </>
          )}
        </div>

        <div className="mb-10 h-full px-4 md:px-24">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="w-full mt-8 pb-5">
              <div className="mx-auto w-full max-w-[1300px]">
                <EventSearch
                  layout="pageGrid"
                  location={location}
                  area={area}
                  eventType={typeOfService}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  onLocationChange={setLocation}
                  onAreaChange={setArea}
                  onEventTypeChange={setEventTypeFromBar}
                  onPriceMinChange={setPriceMinFromBar}
                  onPriceMaxChange={setPriceMaxFromBar}
                  onOpenFilters={handleOpenFilters}
                  onSearch={() => pushListQuery(false)}
                  searchButtonLabel="Search"
                  maxWidthClassName="max-w-full"
                  innerPaddingClassName="px-0"
                  containerClassName="border-0 bg-transparent px-0 py-0"
                  availableLocations={availableLocations}
                  hidePriceRange
                  hideFiltersButton
                />
              </div>
            </div>

            <div className="mb-10 mt-2">
              <div className="flex w-full flex-col gap-5 mt-10 mb-10">
                <h1 className="font-gtsuper-ds text-3xl font-light text-soft-gray-dark md:text-5xl">
                  {filterState.serviceTypes.length > 1
                    ? `${filterState.serviceTypes.length} event types`
                    : typeOfService
                      ? `${typeOfService} events`
                      : 'All events'}
                  {locationTitleSuffix ? ` in ${locationTitleSuffix}` : ''}
                </h1>
                <p className="max-w-[800px] text-left font-haas text-sm md:text-base">
                  Discover curated celebrations, corporate gatherings, and bespoke experiences designed by the Kennedys team. Each event is tailored to the destination and crafted to deliver unforgettable moments.
                </p>
              </div>

              {searchText && (
                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 font-haas text-sm text-[#172338]">
                    <span>Search: {searchText}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchText('')
                        const nextQ = { ...router.query }
                        delete nextQ.search
                        router.replace({ pathname: '/events/list', query: nextQ }, undefined, { shallow: true })
                      }}
                      className="rounded-full p-0.5 transition-colors hover:bg-gray-200"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {isLoading && !error && <EventsListGridSkeleton count={EVENTS_LIST_PAGE_SIZE} />}

              {!isLoading && error && (
                <p className="font-haas text-sm text-[#D04444] md:text-base">{error}</p>
              )}

              {!isLoading && !error && (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    {totalForEmptyCheck === 0 ? (
                      eventsListHasActiveFilters(liveFilterQuery) ? (
                        <EventsGridEmptyFiltered onClear={clearAllFilters} />
                      ) : (
                        <EventsGridEmptyNoData />
                      )
                    ) : (
                      displayedRows.map((event) => {
                        const eid = event?.id != null ? String(event.id) : ''
                        const liked = eid ? isLiked(eid) : false
                        return (
                          <div
                            key={event.id}
                            className="flex w-full cursor-pointer flex-col gap-5 border bg-white p-5 transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172338]"
                            tabIndex={0}
                            role="link"
                            aria-label={`Open ${event.name}`}
                            onClick={() => window.open(`/events/${slugify(event.name)}`, '_blank', 'noopener,noreferrer')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                window.open(`/events/${slugify(event.name)}`, '_blank', 'noopener,noreferrer')
                              }
                            }}
                          >
                            <div className="relative h-60 w-full cursor-inherit overflow-hidden">
                              {eid ? (
                                <button
                                  type="button"
                                  className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white"
                                  aria-pressed={liked}
                                  aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    toggleFavorite({
                                      id: eid,
                                      name: event.name || '',
                                      image: event.image || '',
                                    })
                                  }}
                                >
                                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path
                                      d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
                                      stroke={liked ? '#ef4444' : '#506A70'}
                                      fill={liked ? '#ef4444' : 'none'}
                                      strokeWidth="1.5"
                                    />
                                  </svg>
                                </button>
                              ) : null}
                              <img
                                src={event.image}
                                alt={event.name}
                                className="h-full w-full cursor-inherit object-cover"
                              />
                            </div>
                            <h3 className="font-gtsuper-ds text-2xl font-light">{event.name}</h3>
                            <p className="font-haas text-sm text-gray-600">{event.summary}</p>
                            <span className="pointer-events-none font-haas text-sm underline text-primary">
                              View More
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {showPagination && displayedPagination && (
                    <div className="flex items-center justify-center gap-2 mt-12 px-4 md:px-0" aria-label="Pagination">
                      <button
                        type="button"
                        onClick={() => replaceListUrl({ page: displayedPagination.page - 1 })}
                        disabled={displayedPagination.page === 1 || isLoading}
                        className="flex items-center justify-center w-10 h-10 border border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>

                      {Array.from({ length: displayedPagination.totalPages }, (_, i) => i + 1).map((page) => {
                        const currentPage = displayedPagination.page
                        const totalPages = displayedPagination.totalPages
                        const isFirst = page === 1
                        const isLast = page === totalPages
                        const isNearCurrent = Math.abs(page - currentPage) <= 1
                        if (!isFirst && !isLast && !isNearCurrent) {
                          if (page === 2 || page === totalPages - 1) {
                            return <span key={page} className="text-[#506A70] px-1">…</span>
                          }
                          return null
                        }
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => replaceListUrl({ page })}
                            disabled={isLoading}
                            className={`w-10 h-10 border font-haas text-sm transition ${
                              currentPage === page
                                ? 'bg-[#172338] text-white border-[#172338]'
                                : 'border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white'
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        )
                      })}

                      <button
                        type="button"
                        onClick={() => replaceListUrl({ page: displayedPagination.page + 1 })}
                        disabled={displayedPagination.page === displayedPagination.totalPages || isLoading}
                        className="flex items-center justify-center w-10 h-10 border border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer disableTravelSection={true} />
      <EventFilterOverlay
        isOpen={showFilters}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
        initialFilters={filterState}
      />
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const q = context.query
  const page = Math.max(1, parseInt(pickQueryParam(q.page) || '1', 10) || 1)
  const initialQuery: EventsListInitialQuery = {
    types: pickTypesFromQuery(q.type),
    location: pickQueryParam(q.location),
    area: pickQueryParam(q.area),
    min: pickQueryParam(q.min),
    max: pickQueryParam(q.max),
  }

  try {
    const sortPrice = parseSortPriceQuery(pickQueryParam(q.sortPrice))
    const urlHasFilters = eventsListHasActiveFilters({
      types: initialQuery.types,
      location: initialQuery.location,
      area: initialQuery.area,
      min: initialQuery.min,
      max: initialQuery.max,
    })
    const needsFullCatalog = urlHasFilters || sortPrice !== 'default'

    if (needsFullCatalog) {
      const response = await getAllEvents({ listing: 1 })
      const data = Array.isArray(response?.data) ? response.data : []
      const mapped: EventListItem[] = data.map(mapApiToListItem)
      const filterQ: EventsListFilterQuery = {
        types: initialQuery.types,
        location: initialQuery.location,
        area: initialQuery.area,
        min: initialQuery.min,
        max: initialQuery.max,
      }
      const filtered = filterEventsList<EventListItem>(mapped, filterQ)
      const sorted = sortEventListByCardPrice(filtered, sortPrice)
      const totalPages = Math.max(1, Math.ceil(sorted.length / EVENTS_LIST_PAGE_SIZE))
      const safePage = Math.min(page, totalPages)
      const start = (safePage - 1) * EVENTS_LIST_PAGE_SIZE
      const slice = sorted.slice(start, start + EVENTS_LIST_PAGE_SIZE)
      return {
        props: {
          initialEvents: slice,
          initialQuery,
          initialPagination: {
            total: sorted.length,
            page: safePage,
            limit: EVENTS_LIST_PAGE_SIZE,
            totalPages,
          },
          initialLoadMode: 'client-filter' as const,
          initialFilteredCatalog: mapped,
          initialSortPrice: sortPrice,
        },
      }
    }

    const response = await getAllEvents({ listing: 1, page, limit: EVENTS_LIST_PAGE_SIZE })
    const { data, pagination } = parseEventsListingResponse(response)
    const mappedRaw: EventListItem[] = (Array.isArray(data) ? data : []).map(mapApiToListItem)
    const initialPagination = pagination ?? {
      total: mappedRaw.length,
      page,
      limit: EVENTS_LIST_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(mappedRaw.length / EVENTS_LIST_PAGE_SIZE)),
    }

    return {
      props: {
        initialEvents: mappedRaw,
        initialQuery,
        initialPagination,
        initialLoadMode: 'server' as const,
        initialFilteredCatalog: null,
        initialSortPrice: 'default' as const,
      },
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps events/list:', err)
    return {
      props: {
        initialEvents: [],
        initialQuery,
        initialPagination: null,
        initialLoadMode: 'server' as const,
        initialFilteredCatalog: null,
        initialSortPrice: 'default' as const,
      },
    }
  }
}

export default KennedysEventsList
