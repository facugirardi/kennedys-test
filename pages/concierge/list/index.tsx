import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import type { GetServerSidePropsContext } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { ServiceSearch } from '@/components/custom/ServiceSearch'
import { FilterOverlay, type FilterState } from '@/components/custom/FilterOverlay'
import { ConciergeCard } from '@/components/ConciergeCard'
import { ConciergePackagesSection } from '@/components/ConciergePackagesSection'
import { getAllServices } from '@/lib/api/services'
import { getPageBlocksData, getBlockDataForType } from '@/lib/utils/contentBlocks'
import { wsrvUrl, resolveMediaUrl } from '@/lib/utils'
import {
  collectUniqueLocations,
  ConciergeServicePreview,
  getConciergeServicePath,
  mapServiceToPreview,
  slugify,
} from '@/lib/mappers/concierge'
import { getAllConciergeCategories } from '@/lib/api/conciergeCategories'
import Link from 'next/link'
import { parseStayDateFlexFromQuery } from '@/lib/stayDateFlex'
import { parseConciergeListSortQuery, sortConciergeServicesByName } from '@/lib/conciergeListSort'
import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import {
  locationSelectionDisplayTags,
  type LocationTreeSelection,
} from '@/components/custom/LocationTreeDropdown'
import { SeoHead } from '@/components/seo/SeoHead'
import { getConciergeLocationMeta } from '@/lib/seo/locationMeta'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { fetchConciergeLocationMetaTag } from '@/lib/api/conciergeLocationMetatags'
import { fetchConciergeLocationDescription } from '@/lib/api/conciergeLocationDescriptions'
import { fetchConciergeLocationImage } from '@/lib/api/conciergeLocationImages'
import WhyChooseContainer from '@/components/why-choose-container'
import { getPromoPageBySlug } from '@/lib/api/promoPages'

const BANNER_IMAGE = '/images/mykonos-chauffer.png'

const TYPE_BANNER_IMAGES: Record<string, string> = {
  chauffeur: '/images/chuffer-service-image.png',
  security: '/images/professional-image.png',
  'car rental': '/images/chuffer-service-image.png',
  chef: '/images/cheff-image.png',
  helicopter: '/images/mykonos-chauffer.png',
  nanny: '/images/smiling-woman-image.jpg',
  'private jet': '/images/business-aircraft.jpg',
  privatejet: '/images/business-aircraft.jpg',
  yacht: '/images/adults-in-yacht.jpg',
}

const TYPE_CARD_IMAGES: Record<string, string> = {
  chauffeur: '/images/why_choose_driver.png',
  'car rental': '/images/chuffer-service-image.png',
  yacht: '/images/yacht-image.jpg',
  'yacht tours': '/images/adults-in-yacht.jpg',
  helicopter: '/images/helicopter-image.png',
  'private jet': '/images/plane-image.png',
  privatejet: '/images/plane-image.png',
  chef: '/images/cheff-image.png',
  'concierge packages': '/images/concierge-1.png',
  'event planning': '/images/event-manage-chairs-image.png',
  'unique experiences': '/images/dance.png',
  security: '/images/professional-image.png',
  'wellness & fitness': '/images/outdoor-image.png',
  wellness: '/images/outdoor-image.png',
  'kids experiences': '/images/tour-image.png',
  'kids experience': '/images/tour-image.png',
}


const INITIAL_FILTER_STATE: FilterState = {
  location: '',
  area: '',
  serviceTypes: [],
  priceRange: {
    min: null,
    max: null,
  },
  lengthRange: {
    min: null,
    max: null,
  },
  capacityRange: {
    min: null,
    max: null,
  },
}

const LIST_PAGE_SIZE = 9

const capitalizeServiceTitle = (title?: string | null): string => {
  if (!title) return ''
  const spaced = title.replace(/([a-z])([A-Z])/g, '$1 $2')
  return spaced
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export type ConciergeListPagination = {
  total: number
  page: number
  limit: number
  totalPages: number
}

function buildListApiParams(query: ParsedUrlQuery): Record<string, string | number | boolean> {
  const page = Math.max(1, query.page ? parseInt(String(query.page), 10) || 1 : 1)
  const out: Record<string, string | number | boolean> = {
    published: true,
    forWebsite: true,
    page,
    limit: LIST_PAGE_SIZE,
  }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  if (str(query.search)) out.search = str(query.search)
  const locationParam = str(query.location)
  const areaParam = str(query.area)
  // Misma expansión que villas/RE: Athens Riviera → towns + Vari/Varkiza aliases.
  // La UI suele mandar el leaf en `location` (no en `area`).
  if (areaParam) {
    const expanded = expandLocationArea(areaParam)
    if (expanded.length > 1) {
      out.location = expanded.join(',')
    } else {
      out.area = expanded[0]
    }
  } else if (locationParam) {
    const tokens = locationParam.split(',').map((s) => s.trim()).filter(Boolean)
    const expanded = Array.from(new Set(tokens.flatMap(expandLocationArea)))
    out.location = expanded.join(',')
  }
  if (str(query.type)) out.type = str(query.type)
  if (str(query.types)) out.types = str(query.types)
  if (query.min != null && String(query.min).length) out.min = String(query.min)
  if (query.max != null && String(query.max).length) out.max = String(query.max)
  if (query.minLength != null && String(query.minLength).length) out.minLength = String(query.minLength)
  if (query.maxLength != null && String(query.maxLength).length) out.maxLength = String(query.maxLength)
  if (query.minCapacity != null && String(query.minCapacity).length) out.minCapacity = String(query.minCapacity)
  if (query.maxCapacity != null && String(query.maxCapacity).length) out.maxCapacity = String(query.maxCapacity)
  const sortSp = str(query.sortPrice).toLowerCase()
  if (sortSp === 'asc' || sortSp === 'desc') out.sortPrice = sortSp
  return out
}

type ListFromApi = {
  services: ConciergeServicePreview[]
  pagination: ConciergeListPagination
  listError: string | null
}

/** Shared by SSR and client refetch (shallow navigation). */
function mapApiResponseToList(response: any, query: ParsedUrlQuery): ListFromApi {
  if (response?.success === false) {
    return {
      services: [],
      pagination: { total: 0, page: 1, limit: LIST_PAGE_SIZE, totalPages: 1 },
      listError: response?.message ?? 'Could not load concierge services.',
    }
  }

  const apiParams = buildListApiParams(query)
  let data = Array.isArray(response?.data) ? response.data : []
  let p = response?.pagination as ConciergeListPagination | undefined

  if (!p && typeof apiParams.page === 'number') {
    const totalAll = data.length
    const lim = LIST_PAGE_SIZE
    const pageNum = apiParams.page as number
    const start = (pageNum - 1) * lim
    data = data.slice(start, start + lim)
    p = {
      total: totalAll,
      page: pageNum,
      limit: lim,
      totalPages: Math.max(1, Math.ceil(totalAll / lim)),
    }
  }

  const services = data
    .map((service: any) => mapServiceToPreview(service))
    .filter((item: ConciergeServicePreview) => Boolean(item.id))

  const pagination: ConciergeListPagination = p
    ? {
        total: typeof p.total === 'number' ? p.total : services.length,
        page: typeof p.page === 'number' ? p.page : 1,
        limit: typeof p.limit === 'number' ? p.limit : LIST_PAGE_SIZE,
        totalPages: typeof p.totalPages === 'number' ? p.totalPages : 1,
      }
    : {
        total: services.length,
        page: 1,
        limit: LIST_PAGE_SIZE,
        totalPages: 1,
      }

  return { services, pagination, listError: null }
}

type ActiveFilterChip = {
  id: string
  label: string
  kind: 'location' | 'area' | 'type' | 'typeExtra' | 'min' | 'max' | 'minLength' | 'maxLength' | 'minCapacity' | 'maxCapacity'
  raw?: string
}

const SHALLOW_LIST_OPTS = { shallow: true as const, scroll: false as const }

function stripOpenFiltersParam(query: Record<string, string | string[] | undefined>) {
  const next = { ...query }
  delete next.openFilters
  return next
}

type ServiceTypeCard = {
  type: string
  image: string
  /** Custom card image from Loggia's Website Images > Concierge tab, when set — takes priority over everything else. */
  customImage?: string | null
  /** Custom category description from Loggia's Website Images > Concierge tab, when set — shown under the category heading instead of the generic default. */
  shortDescription?: string | null
  /** Custom banner/cover image from Loggia's Website Images > Concierge tab, when set — shown at the top of the page instead of the hardcoded default for this category. */
  bannerImage?: string | null
}

type ConciergeListPageProps = {
  initialServices?: ConciergeServicePreview[]
  initialPagination?: ConciergeListPagination | null
  initialPageBlocks?: any[]
  listError?: string | null
  initialSortPrice?: 'default' | 'asc' | 'desc' | 'nameAsc' | 'nameDesc'
  initialServiceTypes?: ServiceTypeCard[]
  initialPromoPage?: any | null
  initialSeoMeta?: {
    title?: string | null
    description?: string | null
    imageUrl?: string | null
    hasCategoryLocationOverride?: boolean
  }
  /** Page-level CMS metatags for /concierge/list (without category+location override). */
  initialPageSeoMeta?: {
    title?: string | null
    description?: string | null
    imageUrl?: string | null
  }
  /** Staff-editable (category, location) body-description override (Loggia's Content Site Text > Concierge tab). */
  initialLocationDescription?: string | null
  /** Staff-editable location-wide body-description override (same tab, "All types" row) — applies regardless of category. */
  initialLocationGeneralDescription?: string | null
  /** Staff-editable (category, location) banner-image override (Loggia's Website Images > Concierge tab). */
  initialLocationImageUrl?: string | null
  /** Staff-editable location-wide banner-image override (same tab, "All types" row) — applies regardless of category. */
  initialLocationGeneralImageUrl?: string | null
}

/** Reserved `category` value meaning "applies to every category" for a location (Loggia's "All types" row). */
const ALL_TYPES_CATEGORY = '__all__'

type ListSeoMeta = {
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  hasCategoryLocationOverride?: boolean
}

const KennedysConciergeList = ({
  initialServices = [],
  initialPagination = null,
  initialPageBlocks = [],
  listError = null,
  initialSortPrice = 'default',
  initialServiceTypes = [],
  initialPromoPage = null,
  initialSeoMeta,
  initialPageSeoMeta,
  initialLocationDescription = null,
  initialLocationGeneralDescription = null,
  initialLocationImageUrl = null,
  initialLocationGeneralImageUrl = null,
}: ConciergeListPageProps) => {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [comboSeoMeta, setComboSeoMeta] = useState<ListSeoMeta | null>(
    () => (initialSeoMeta?.hasCategoryLocationOverride ? initialSeoMeta : null),
  )
  const [comboDescription, setComboDescription] = useState<string | null>(initialLocationDescription)
  const [locationGeneralDescription, setLocationGeneralDescription] = useState<string | null>(
    initialLocationGeneralDescription,
  )
  const [comboImageUrl, setComboImageUrl] = useState<string | null>(initialLocationImageUrl)
  const [locationGeneralImageUrl, setLocationGeneralImageUrl] = useState<string | null>(
    initialLocationGeneralImageUrl,
  )
  const [typeOfService, setTypeOfService] = useState('')
  const [location, setLocation] = useState('')
  const [area, setArea] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE)
  const [pageBlocks, setPageBlocks] = useState<any[]>(initialPageBlocks)
  const [listServices, setListServices] = useState<ConciergeServicePreview[]>(initialServices)
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc' | 'nameAsc' | 'nameDesc'>(initialSortPrice)
  const [listPagination, setListPagination] = useState<ConciergeListPagination>(
    () =>
      initialPagination ?? {
        total: 0,
        page: 1,
        limit: LIST_PAGE_SIZE,
        totalPages: 1,
      },
  )
  const [listLoading, setListLoading] = useState(false)
  const [listFetchError, setListFetchError] = useState<string | null>(null)
  const [availableLocations, setAvailableLocations] = useState<string[]>([])
  const skipClientFetchRef = useRef(true)

  // Promo Page scoping: `?promo=<slug>` restricts this same page (filters, etc.) to a curated Service id set.
  const promoSlug = typeof router.query.promo === 'string' ? router.query.promo : undefined
  const [promoPage, setPromoPage] = useState<any | null>(initialPromoPage)
  const [promoResolving, setPromoResolving] = useState(false)
  useEffect(() => {
    if (!promoSlug) {
      setPromoPage(null)
      setPromoResolving(false)
      return
    }
    if (promoPage && promoPage.slug === promoSlug) return
    let cancelled = false
    setPromoResolving(true)
    getPromoPageBySlug(promoSlug).then((res: any) => {
      if (cancelled) return
      setPromoPage(res?.success && res?.data && res.data.published !== false ? res.data : null)
    }).catch(() => {
      if (!cancelled) setPromoPage(null)
    }).finally(() => {
      if (!cancelled) setPromoResolving(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoSlug])

  useEffect(() => {
    getAllServices({ published: true, forWebsite: true }).then((data: any) => {
      const items: any[] = Array.isArray(data?.data) ? data.data : []
      setAvailableLocations(collectUniqueLocations(items))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    setListServices(initialServices)
    setListPagination(
      initialPagination ?? { total: 0, page: 1, limit: LIST_PAGE_SIZE, totalPages: 1 },
    )
    setListFetchError(null)
  }, [initialServices, initialPagination])

  useEffect(() => {
    if (!router.isReady) return
    if (skipClientFetchRef.current) {
      skipClientFetchRef.current = false
      return
    }

    // Esperar a resolver la Promo Page antes de pegarle al catálogo (evita traer todo sin scope).
    if (promoSlug && !promoPage) return

    let cancelled = false

    void (async () => {
      setListLoading(true)
      setListFetchError(null)
      try {
        const apiParams = buildListApiParams(router.query)
        if (promoSlug && promoPage) {
          const itemIds = Array.isArray(promoPage.itemIds) ? promoPage.itemIds : []
          if (itemIds.length === 0) {
            setListServices([])
            setListPagination({ total: 0, page: 1, limit: LIST_PAGE_SIZE, totalPages: 1 })
            setListLoading(false)
            return
          }
          apiParams.ids = itemIds.join(',')
          // El set de ids ya fue curado en Loggia; no re-exigir published
          // (evita excluir un item curado por metadata inconsistente). `forWebsite`
          // solo filtra qué imágenes se listan por servicio, no excluye servicios — se mantiene.
          delete apiParams.published
        }
        const response = await getAllServices(apiParams)
        if (cancelled) return
        const mapped = mapApiResponseToList(response, router.query)
        if (mapped.listError) {
          setListFetchError(mapped.listError)
          setListServices([])
          setListPagination(mapped.pagination)
        } else {
          setListServices(mapped.services)
          setListPagination(mapped.pagination)
        }
      } catch {
        if (!cancelled) {
          setListFetchError('We could not load concierge services. Please try again later.')
        }
      } finally {
        if (!cancelled) setListLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [router.asPath, router.isReady, promoSlug, promoPage])

  const displayedListServices = useMemo(
    () => sortConciergeServicesByName(listServices, sortOrder),
    [listServices, sortOrder],
  )

  const totalPages = Math.max(1, listPagination.totalPages ?? 1)
  const currentPage = Math.min(Math.max(1, listPagination.page ?? 1), totalPages)

  useEffect(() => {
    if (initialPageBlocks.length) return
    const loadBlocks = async () => {
      try {
        const blocks = await getPageBlocksData('concierge-list')
        setPageBlocks(blocks ?? [])
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Error loading page blocks:', error)
      }
    }
    loadBlocks()
  }, [initialPageBlocks.length])

  useEffect(() => {
    const q = router.query
    const type = typeof q.type === 'string' ? q.type : ''
    const typesRaw = typeof q.types === 'string' ? q.types : ''
    const extraTypes = typesRaw
      ? typesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const mergedTypes = [...(type ? [type] : []), ...extraTypes]

    const locationParam = typeof q.location === 'string' ? q.location : ''
    const areaParam = typeof q.area === 'string' ? q.area : ''
    const search = typeof q.search === 'string' ? q.search : ''

    if (type) setTypeOfService(type)
    else setTypeOfService('')
    if (locationParam) setLocation(locationParam)
    else setLocation('')
    if (areaParam) setArea(areaParam)
    else setArea('')
    if (search) setSearchQuery(search)
    else setSearchQuery('')

    if (q.openFilters === 'true') setShowFilters(true)

    const minRaw = q.min != null && String(q.min).length ? parseInt(String(q.min), 10) : NaN
    const maxRaw = q.max != null && String(q.max).length ? parseInt(String(q.max), 10) : NaN
    const minLengthRaw = q.minLength != null && String(q.minLength).length ? parseFloat(String(q.minLength)) : NaN
    const maxLengthRaw = q.maxLength != null && String(q.maxLength).length ? parseFloat(String(q.maxLength)) : NaN
    const minCapacityRaw = q.minCapacity != null && String(q.minCapacity).length ? parseInt(String(q.minCapacity), 10) : NaN
    const maxCapacityRaw = q.maxCapacity != null && String(q.maxCapacity).length ? parseInt(String(q.maxCapacity), 10) : NaN

    setFilterState((prev) => ({
      ...prev,
      location: locationParam,
      area: areaParam,
      serviceTypes: mergedTypes,
      priceRange: {
        min: Number.isFinite(minRaw) ? minRaw : null,
        max: Number.isFinite(maxRaw) ? maxRaw : null,
      },
      lengthRange: {
        min: Number.isFinite(minLengthRaw) ? minLengthRaw : null,
        max: Number.isFinite(maxLengthRaw) ? maxLengthRaw : null,
      },
      capacityRange: {
        min: Number.isFinite(minCapacityRaw) ? minCapacityRaw : null,
        max: Number.isFinite(maxCapacityRaw) ? maxCapacityRaw : null,
      },
    }))
  }, [router.query])

  useEffect(() => {
    const raw = router.query.sortPrice
    const s = typeof raw === 'string' ? raw : Array.isArray(raw) && typeof raw[0] === 'string' ? raw[0] : ''
    const next = parseConciergeListSortQuery(s)
    setSortOrder((prev) => (prev === next ? prev : next))
  }, [router.query.sortPrice])

  const handleConciergeSortOrderChange = (v: 'default' | 'asc' | 'desc' | 'nameAsc' | 'nameDesc') => {
    setSortOrder(v)
    const nextQ = stripOpenFiltersParam({ ...router.query })
    nextQ.page = '1'
    if (v === 'default') delete nextQ.sortPrice
    else nextQ.sortPrice = v
    void router.replace({ pathname: '/concierge/list', query: nextQ }, undefined, SHALLOW_LIST_OPTS)
  }

  const effectiveOverlayFilters = useMemo<FilterState>(
    () => ({
      ...filterState,
      location: filterState.location || location,
      area: filterState.area || area,
      serviceTypes:
        filterState.serviceTypes.length > 0
          ? filterState.serviceTypes
          : typeOfService
            ? [typeOfService]
            : [],
    }),
    [filterState, location, area, typeOfService]
  )

  const activeLocation = filterState.location || location

  const activeFilterChips = useMemo((): ActiveFilterChip[] => {
    const q = router.query
    const chips: ActiveFilterChip[] = []
    const loc = typeof q.location === 'string' ? q.location : ''
    const ar = typeof q.area === 'string' ? q.area : ''
    const mainType = typeof q.type === 'string' ? q.type : ''
    const typesExtraRaw = typeof q.types === 'string' ? q.types : ''
    const typesExtra = typesExtraRaw
      ? typesExtraRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    if (ar.trim()) {
      chips.push({ id: `area:${ar}`, label: ar, kind: 'area' })
    } else if (loc.trim()) {
      const locSel: LocationTreeSelection = {
        selectedCountry: '',
        regionValue: loc,
        area: '',
        scope: undefined,
        displayRegion: undefined,
        selectedLeaves: loc
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }
      locationSelectionDisplayTags(locSel).forEach((tag, i) => {
        chips.push({
          id: `loc:${i}:${tag}`,
          label: tag,
          kind: 'location',
          raw: tag,
        })
      })
    }
    if (mainType) {
      chips.push({
        id: `type:${mainType}`,
        label: capitalizeServiceTitle(mainType),
        kind: 'type',
        raw: mainType,
      })
    }
    typesExtra.forEach((t) => {
      chips.push({
        id: `extra:${t}`,
        label: capitalizeServiceTitle(t),
        kind: 'typeExtra',
        raw: t,
      })
    })

    const minR = q.min != null && String(q.min).length ? parseInt(String(q.min), 10) : NaN
    const maxR = q.max != null && String(q.max).length ? parseInt(String(q.max), 10) : NaN
    if (Number.isFinite(minR)) chips.push({ id: `min:${minR}`, label: `Min $${minR}`, kind: 'min' })
    if (Number.isFinite(maxR)) chips.push({ id: `max:${maxR}`, label: `Max $${maxR}`, kind: 'max' })

    const minLen = q.minLength != null && String(q.minLength).length ? parseFloat(String(q.minLength)) : NaN
    const maxLen = q.maxLength != null && String(q.maxLength).length ? parseFloat(String(q.maxLength)) : NaN
    if (Number.isFinite(minLen)) chips.push({ id: `minLength:${minLen}`, label: `Min ${minLen}m`, kind: 'minLength' })
    if (Number.isFinite(maxLen)) chips.push({ id: `maxLength:${maxLen}`, label: `Max ${maxLen}m`, kind: 'maxLength' })

    const minCap = q.minCapacity != null && String(q.minCapacity).length ? parseInt(String(q.minCapacity), 10) : NaN
    const maxCap = q.maxCapacity != null && String(q.maxCapacity).length ? parseInt(String(q.maxCapacity), 10) : NaN
    if (Number.isFinite(minCap)) chips.push({ id: `minCapacity:${minCap}`, label: `Min ${minCap} guests`, kind: 'minCapacity' })
    if (Number.isFinite(maxCap)) chips.push({ id: `maxCapacity:${maxCap}`, label: `Max ${maxCap} guests`, kind: 'maxCapacity' })

    const searchVal = typeof q.search === 'string' ? q.search.trim() : ''
    if (searchVal) chips.push({ id: `search:${searchVal}`, label: `Search: ${searchVal}`, kind: 'type', raw: `__search__:${searchVal}` })

    return chips
  }, [router.query])

  const preserveDateAndSearchQuery = (params: URLSearchParams) => {
    const q = router.query
    if (typeof q.search === 'string' && q.search.trim()) params.set('search', q.search.trim())
    if (typeof q.dateFrom === 'string' && q.dateFrom.trim()) params.set('dateFrom', q.dateFrom.trim())
    if (typeof q.dateTo === 'string' && q.dateTo.trim()) params.set('dateTo', q.dateTo.trim())
    const flexD = parseStayDateFlexFromQuery({
      dateFlexDays: q.dateFlexDays as string | string[] | undefined,
      flexibleDates: q.flexibleDates as string | string[] | undefined,
    })
    if (flexD > 0) params.set('dateFlexDays', String(flexD))
    if (typeof q.promo === 'string' && q.promo.trim()) params.set('promo', q.promo.trim())
  }

  const autoFilterInitRef = useRef(false)
  useEffect(() => {
    if (!router.isReady) return
    if (!autoFilterInitRef.current) { autoFilterInitRef.current = true; return }
    const t = setTimeout(() => {
      const params = new URLSearchParams()
      params.set('page', '1')
      if (typeOfService) params.set('type', typeOfService)
      if (location) params.set('location', location)
      if (area) params.set('area', area)
      preserveDateAndSearchQuery(params)
      const q = router.query
      if (typeof q.sortPrice === 'string' && q.sortPrice) params.set('sortPrice', q.sortPrice)
      void router.replace(`/concierge/list?${params.toString()}`, undefined, SHALLOW_LIST_OPTS)
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, area, typeOfService, router.isReady])

  const handleOpenFilters = () => setShowFilters(true)
  const handleCloseFilters = () => setShowFilters(false)

  const handleApplyFilters = (filters: FilterState) => {
    setFilterState(filters)
    setShowFilters(false)

    const nextType = filters.serviceTypes?.[0] || ''
    const nextLocation = filters.location || ''
    const nextArea = filters.area || ''

    setTypeOfService(nextType)
    setLocation(nextLocation)
    setArea(nextArea)

    const params = new URLSearchParams()
    params.set('page', '1')
    if (nextType) params.set('type', nextType)
    else params.delete('type')

    const extraTypes = (filters.serviceTypes || []).slice(1)
    if (extraTypes.length) params.set('types', extraTypes.join(','))
    else params.delete('types')

    if (nextLocation) params.set('location', nextLocation)
    else params.delete('location')
    if (nextArea) params.set('area', nextArea)
    else params.delete('area')
    if (filters.priceRange?.min != null) params.set('min', String(filters.priceRange.min))
    else params.delete('min')
    if (filters.priceRange?.max != null) params.set('max', String(filters.priceRange.max))
    else params.delete('max')
    if (filters.lengthRange?.min != null) params.set('minLength', String(filters.lengthRange.min))
    else params.delete('minLength')
    if (filters.lengthRange?.max != null) params.set('maxLength', String(filters.lengthRange.max))
    else params.delete('maxLength')
    if (filters.capacityRange?.min != null) params.set('minCapacity', String(filters.capacityRange.min))
    else params.delete('minCapacity')
    if (filters.capacityRange?.max != null) params.set('maxCapacity', String(filters.capacityRange.max))
    else params.delete('maxCapacity')

    preserveDateAndSearchQuery(params)
    void router.push(`/concierge/list?${params.toString()}`, undefined, SHALLOW_LIST_OPTS)
  }

  const removeFilterChip = (chip: ActiveFilterChip) => {
    const q = stripOpenFiltersParam({ ...router.query })
    const typesRaw = typeof q.types === 'string' ? q.types : ''
    let extras = typesRaw
      ? typesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []

    const nextQ = { ...q }

    switch (chip.kind) {
      case 'location': {
        const raw = (chip.raw ?? chip.label).trim()
        const locStr = typeof nextQ.location === 'string' ? nextQ.location : ''
        const leaves = locStr.split(',').map((s) => s.trim()).filter(Boolean)
        const nextLeaves = leaves.filter((l) => l.toLowerCase() !== raw.toLowerCase())
        if (nextLeaves.length === 0) delete nextQ.location
        else nextQ.location = nextLeaves.join(',')
        break
      }
      case 'area':
        delete nextQ.area
        break
      case 'type':
        if (chip.raw?.startsWith('__search__:')) {
          delete nextQ.search
        } else if (extras.length > 0) {
          nextQ.type = extras[0]
          extras = extras.slice(1)
          if (extras.length) nextQ.types = extras.join(',')
          else delete nextQ.types
        } else {
          delete nextQ.type
        }
        break
      case 'typeExtra': {
        const raw = chip.raw ?? ''
        extras = extras.filter((t) => t !== raw)
        if (extras.length) nextQ.types = extras.join(',')
        else delete nextQ.types
        break
      }
      case 'min':
        delete nextQ.min
        break
      case 'max':
        delete nextQ.max
        break
      case 'minLength':
        delete nextQ.minLength
        break
      case 'maxLength':
        delete nextQ.maxLength
        break
      case 'minCapacity':
        delete nextQ.minCapacity
        break
      case 'maxCapacity':
        delete nextQ.maxCapacity
        break
      default:
        break
    }

    const hasFilters =
      nextQ.type ||
      nextQ.types ||
      nextQ.location ||
      nextQ.area ||
      nextQ.min ||
      nextQ.max ||
      nextQ.minLength ||
      nextQ.maxLength ||
      nextQ.minCapacity ||
      nextQ.maxCapacity ||
      nextQ.search
    if (hasFilters) {
      nextQ.page = '1'
      void router.push({ pathname: '/concierge/list', query: nextQ }, undefined, SHALLOW_LIST_OPTS)
    } else {
      void router.push('/concierge/list', undefined, SHALLOW_LIST_OPTS)
    }
  }

  const goToPage = (nextPage: number) => {
    const nextQ = { ...router.query, page: String(Math.max(1, nextPage)) }
    void router.push({ pathname: '/concierge/list', query: nextQ }, undefined, SHALLOW_LIST_OPTS)
  }

  const committedType = typeof router.query.type === 'string' ? router.query.type : ''
  const committedLocation = typeof router.query.location === 'string' ? router.query.location : ''
  const locationDisplayName = useMemo(() => {
    if (!committedLocation) return ''
    const leaves = committedLocation.split(',').map((s) => s.trim()).filter(Boolean)
    const tags = locationSelectionDisplayTags({
      selectedCountry: '',
      regionValue: committedLocation,
      area: '',
      scope: undefined,
      displayRegion: undefined,
      selectedLeaves: leaves,
    })
    return tags.join(', ')
  }, [committedLocation])
  const showBanner = true

  // Staff-editable default cover per category (Loggia's Website Images > Concierge tab) — falls
  // back to the hardcoded map below when the category has none set.
  const selectedCategoryBannerImage = useMemo(() => {
    if (!committedType) return null
    const slug = slugify(committedType)
    return initialServiceTypes.find((st) => slugify(st.type) === slug)?.bannerImage || null
  }, [committedType, initialServiceTypes])

  const activeBannerImage =
    comboImageUrl ||
    locationGeneralImageUrl ||
    selectedCategoryBannerImage ||
    TYPE_BANNER_IMAGES[committedType.toLowerCase()] ||
    BANNER_IMAGE

  const heading = promoPage?.title
    ? promoPage.title
    : committedType && committedType.length > 0
      ? `${capitalizeServiceTitle(committedType)} Services`
      : 'Concierge Services'

  // Staff-editable per-category description (Loggia's Website Images > Concierge tab) — falls back to
  // the generic default below when the category has none set.
  const selectedCategoryDescription = useMemo(() => {
    if (!committedType) return null
    const slug = slugify(committedType)
    return initialServiceTypes.find((st) => slugify(st.type) === slug)?.shortDescription || null
  }, [committedType, initialServiceTypes])

  const displayError = listError

  const trimmedSearchFromUrl = useMemo(() => {
    const s = router.query.search
    return typeof s === 'string' ? s.trim() : ''
  }, [router.query.search])

  const handleClearAllFilters = () => {
    const promo = typeof router.query.promo === 'string' ? router.query.promo : undefined
    void router.push(
      promo ? { pathname: '/concierge/list', query: { promo } } : '/concierge/list',
      undefined,
      SHALLOW_LIST_OPTS,
    )
  }

  // Prefer URL query over local filter state so SSR/canonical/share tags match the retrieved URL.
  const seoLocation = committedLocation || activeLocation
  const seoLocationPrimary = seoLocation.split(',')[0]?.trim() || ''
  const pageSeoMeta = initialPageSeoMeta || {
    title: initialSeoMeta?.hasCategoryLocationOverride ? null : initialSeoMeta?.title,
    description: initialSeoMeta?.hasCategoryLocationOverride ? null : initialSeoMeta?.description,
    imageUrl: initialSeoMeta?.hasCategoryLocationOverride ? null : initialSeoMeta?.imageUrl,
  }

  // Keep combo override in sync after GSSP navigations (non-shallow).
  useEffect(() => {
    setComboSeoMeta(initialSeoMeta?.hasCategoryLocationOverride ? initialSeoMeta : null)
  }, [initialSeoMeta])

  useEffect(() => {
    setComboDescription(initialLocationDescription)
  }, [initialLocationDescription])

  useEffect(() => {
    setLocationGeneralDescription(initialLocationGeneralDescription)
  }, [initialLocationGeneralDescription])

  useEffect(() => {
    setComboImageUrl(initialLocationImageUrl)
  }, [initialLocationImageUrl])

  useEffect(() => {
    setLocationGeneralImageUrl(initialLocationGeneralImageUrl)
  }, [initialLocationGeneralImageUrl])

  // Location-wide "All types" override — independent of the selected category, so it's fetched
  // whenever the location changes even if no `type` filter is active.
  useEffect(() => {
    if (!seoLocationPrimary) {
      setLocationGeneralDescription(null)
      setLocationGeneralImageUrl(null)
      return
    }
    let cancelled = false
    void fetchConciergeLocationDescription(ALL_TYPES_CATEGORY, seoLocationPrimary).then((row) => {
      if (cancelled) return
      setLocationGeneralDescription(row?.description || null)
    })
    void fetchConciergeLocationImage(ALL_TYPES_CATEGORY, seoLocationPrimary).then((row) => {
      if (cancelled) return
      setLocationGeneralImageUrl(row?.imageUrl ? resolveMediaUrl(row.imageUrl) || null : null)
    })
    return () => {
      cancelled = true
    }
  }, [seoLocationPrimary])

  // Shallow filter changes do not re-run GSSP — fetch the (category, location) overrides client-side.
  useEffect(() => {
    if (!committedType.trim() || !seoLocationPrimary) {
      setComboSeoMeta(null)
      setComboDescription(null)
      setComboImageUrl(null)
      return
    }
    let cancelled = false
    void fetchConciergeLocationMetaTag(committedType.trim(), seoLocationPrimary).then((row) => {
      if (cancelled) return
      if (!row) {
        setComboSeoMeta(null)
        return
      }
      const imageUrl = row.metaImageUrl ? resolveMediaUrl(row.metaImageUrl) || null : null
      setComboSeoMeta({
        title: row.metaTitle || null,
        description: row.metaDescription || null,
        imageUrl,
        hasCategoryLocationOverride: Boolean(
          row.metaTitle || row.metaDescription || row.metaImageUrl
        ),
      })
    })
    void fetchConciergeLocationDescription(committedType.trim(), seoLocationPrimary).then((row) => {
      if (cancelled) return
      setComboDescription(row?.description || null)
    })
    void fetchConciergeLocationImage(committedType.trim(), seoLocationPrimary).then((row) => {
      if (cancelled) return
      setComboImageUrl(row?.imageUrl ? resolveMediaUrl(row.imageUrl) || null : null)
    })
    return () => {
      cancelled = true
    }
  }, [committedType, seoLocationPrimary])

  const seoCanonicalPath = useMemo(() => {
    const params = new URLSearchParams()
    if (committedType.trim()) params.set('type', committedType.trim())
    if (seoLocationPrimary) params.set('location', seoLocationPrimary)
    const qs = params.toString()
    return qs ? `/concierge/list?${qs}` : '/concierge/list'
  }, [committedType, seoLocationPrimary])

  const hasComboOverride = Boolean(comboSeoMeta?.hasCategoryLocationOverride)
  const seoTitle = hasComboOverride && comboSeoMeta?.title
    ? comboSeoMeta.title
    : !seoLocationPrimary && pageSeoMeta?.title
      ? pageSeoMeta.title
      : getConciergeLocationMeta(seoLocationPrimary).title
  const seoDescription = hasComboOverride && comboSeoMeta?.description
    ? comboSeoMeta.description
    : !seoLocationPrimary && pageSeoMeta?.description
      ? pageSeoMeta.description
      : getConciergeLocationMeta(seoLocationPrimary).description
  const seoImageUrl = hasComboOverride && comboSeoMeta?.imageUrl
    ? comboSeoMeta.imageUrl
    : !seoLocationPrimary
      ? (pageSeoMeta?.imageUrl || undefined)
      : undefined

  return (
    <>
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        imageUrl={seoImageUrl || undefined}
        canonicalPath={seoCanonicalPath}
      />
      <div>
        <div className="h-full mb-10 px-4 md:px-24">
          {showBanner ? (
            <div className="relative -mx-4 md:-mx-24 h-[320px] md:h-[520px] overflow-hidden">
              <img
                src={activeBannerImage}
                alt="Concierge Services"
                className="absolute inset-0 w-full h-full object-cover brightness-75"
              />
              <Navbar textBlack={false} className="absolute left-0 top-0 z-30 w-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <h1 className="text-4xl md:text-7xl font-gtsuper-ds font-light text-white text-center uppercase leading-tight px-4">
                  {promoPage?.title
                    ? promoPage.title
                    : committedType && locationDisplayName
                    ? `${capitalizeServiceTitle(committedType)} in ${locationDisplayName}`
                    : committedType
                    ? capitalizeServiceTitle(committedType)
                    : locationDisplayName || 'Concierge Services'}
                </h1>
              </div>
            </div>
          ) : (
            <Navbar textBlack={true} />
          )}

          <div className="w-full">
            <div className="h-12 md:h-16 flex items-center gap-2 bg-gray-200 text-xs md:text-sm -mx-4 md:-mx-24 px-4 md:px-24">
              <Link className="underline" href="/">
                Home
              </Link>
              <span>
                <ChevronRight className="w-3 h-3" />
              </span>
              <Link className="underline" href="/concierge">
                Concierge
              </Link>
              {locationDisplayName && (
                <>
                  <span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                  <span className="font-semibold capitalize">{locationDisplayName}</span>
                </>
              )}
            </div>

            <div className="w-full mt-8 pb-5">
              <div className="mx-auto w-full max-w-[1300px] px-4 md:px-0">
                <ServiceSearch
                  layout="pageGrid"
                  sortOrder={sortOrder}
                  onSortOrderChange={handleConciergeSortOrderChange}
                  typeOfService={typeOfService}
                  location={location}
                  area={area}
                  onTypeOfServiceChange={setTypeOfService}
                  onLocationChange={setLocation}
                  onAreaChange={setArea}
                  onOpenFilters={handleOpenFilters}
                  listUrlQuery={router.isReady ? router.query : undefined}
                  availableLocations={availableLocations}
                />

                {activeFilterChips.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-4 mb-6">
                    {activeFilterChips.map((chip) => (
                      <div
                        key={chip.id}
                        className="flex items-center gap-2 bg-white border border-[#d1d5db] rounded-full px-3 py-1.5 text-sm font-haas text-[#172338]"
                      >
                        <span>{chip.label}</span>
                        <button
                          type="button"
                          onClick={() => removeFilterChip(chip)}
                          className="hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                          aria-label={`Remove ${chip.label} filter`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-10 mt-10">
            {displayError ? (
              <div className="text-center py-10">
                <p className="font-haas text-[#D04444]">{displayError}</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center items-start">
                  <div className="w-full max-w-[1300px]">
                    <div className="w-full flex flex-col gap-5 mb-10 px-4 md:px-0">
                      <h1 className="text-3xl md:text-5xl font-gtsuper-ds font-light text-soft-gray-dark">
                        {heading}
                        {!promoPage?.title && locationDisplayName && ` in ${locationDisplayName}`}
                      </h1>
                      <p className="text-sm md:text-lg text-left font-light font-haas max-w-[850px]">
                      {promoPage?.description || comboDescription || locationGeneralDescription || selectedCategoryDescription || 'Our concierge services offer unparalleled luxury and personalized attention. From bespoke itineraries and 24/7 support to exclusive access and seamless coordination, we ensure every detail is expertly managed to provide you with a truly exceptional experience.'}
                      </p>
                    </div>

                    {listFetchError && (
                      <div className="mx-4 md:mx-0 mb-6 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-haas">
                        {listFetchError}
                      </div>
                    )}

                    {listLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-0">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-white border border-[#e5e7eb] overflow-hidden animate-pulse"
                          >
                            <div className="w-full h-60 bg-gray-200" />
                            <div className="p-6 space-y-3">
                              <div className="h-5 bg-gray-200 rounded w-3/4" />
                              <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : displayedListServices.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                        <div className="w-20 h-20 mb-6 rounded-full bg-[#EEF2F6] flex items-center justify-center">
                          <SlidersHorizontal className="w-8 h-8 text-[#506A70]" />
                        </div>
                        <h3 className="font-haas text-[#172338] text-xl font-medium mb-2">
                          {trimmedSearchFromUrl
                            ? `No results for "${trimmedSearchFromUrl}"`
                            : 'No services match your search'}
                        </h3>
                        <p className="text-[#506A70] text-sm max-w-xs mb-8">
                          {trimmedSearchFromUrl
                            ? 'Try a different keyword or browse all our concierge services.'
                            : 'Try adjusting your dates, location or filters to find your perfect service.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={handleClearAllFilters}
                            className="h-[48px] px-6 bg-[#172338] text-white font-haas text-[14px] hover:bg-[#0f1a1f] transition"
                          >
                            Clear all filters
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenFilters}
                            className="h-[48px] px-6 border border-[#172338] text-[#172338] font-haas text-[14px] hover:bg-[#F0F3F5] transition flex items-center justify-center gap-2"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                            Adjust filters
                          </button>
                        </div>
                      </div>
                    ) : !promoPage && !committedType && !trimmedSearchFromUrl && initialServiceTypes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-0">
                        {initialServiceTypes.map((st) => (
                          <div
                            key={st.type}
                            className="flex w-full flex-col gap-5 border bg-white p-5 text-left cursor-pointer"
                            onClick={() => {
                              const params = new URLSearchParams()
                              params.set('type', st.type)
                              if (typeof router.query.location === 'string' && router.query.location) params.set('location', router.query.location)
                              if (typeof router.query.area === 'string' && router.query.area) params.set('area', router.query.area)
                              preserveDateAndSearchQuery(params)
                              void router.push(`/concierge/list?${params.toString()}`)
                            }}
                          >
                            <div className="relative w-full h-60 shrink-0 overflow-hidden">
                              <img
                                src={
                                  st.customImage ||
                                  TYPE_CARD_IMAGES[st.type.toLowerCase()] ||
                                  wsrvUrl(st.image || '/images/outdoor-image.png', { w: 900, h: 540, q: 100 })
                                }
                                alt={st.type}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/outdoor-image.png' }}
                              />
                            </div>
                            <span className="font-gtsuper-ds font-light text-lg md:text-xl uppercase">
                              {capitalizeServiceTitle(st.type)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                const params = new URLSearchParams()
                                params.set('type', st.type)
                                if (typeof router.query.location === 'string' && router.query.location) params.set('location', router.query.location)
                                if (typeof router.query.area === 'string' && router.query.area) params.set('area', router.query.area)
                                preserveDateAndSearchQuery(params)
                                void router.push(`/concierge/list?${params.toString()}`)
                              }}
                              className="text-left text-primary underline text-sm hover:text-primary/80 font-haas"
                            >
                              View More
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 px-4 md:px-0">
                        {displayedListServices.map((service) => (
                          <ConciergeCard
                            key={service.id}
                            simple
                            image={service.image}
                            title={service.name}
                            description={service.description}
                            price={service.price}
                            serviceId={service.id}
                            serviceType={service.type}
                            detailPath={getConciergeServicePath({
                              location: service.location,
                              type: service.type,
                              name: service.name,
                            })}
                            openInNewTab
                          />
                        ))}
                      </div>
                    )}
                    {!listLoading && totalPages > 1 && (committedType || initialServiceTypes.length === 0 || promoPage) && (
                      <div className="flex items-center justify-center gap-2 mt-12 px-4 md:px-0">
                        <button
                          type="button"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1 || listLoading}
                          className="flex items-center justify-center w-10 h-10 border border-[#1f3440] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Previous page"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                          const isFirst = pageNum === 1
                          const isLast = pageNum === totalPages
                          const isNearCurrent = Math.abs(pageNum - currentPage) <= 1
                          if (!isFirst && !isLast && !isNearCurrent) {
                            if (pageNum === 2 || pageNum === totalPages - 1) {
                              return (
                                <span key={pageNum} className="text-[#506A70] px-1">
                                  …
                                </span>
                              )
                            }
                            return null
                          }
                          return (
                            <button
                              type="button"
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              disabled={listLoading}
                              className={`w-10 h-10 border font-haas text-sm transition ${
                                currentPage === pageNum
                                  ? 'bg-[#172338] text-white border-[#172338]'
                                  : 'border-[#1f3440] text-[#172338] hover:bg-[#172338] hover:text-white'
                              } disabled:opacity-30 disabled:cursor-not-allowed`}
                              aria-label={`Page ${pageNum}`}
                              aria-current={currentPage === pageNum ? 'page' : undefined}
                            >
                              {pageNum}
                            </button>
                          )
                        })}

                        <button
                          type="button"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages || listLoading}
                          className="flex items-center justify-center w-10 h-10 border border-[#1f3440] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {typeOfService.toLowerCase() === 'chauffeur' && <WhyChooseContainer />}

        {(() => {
            const conciergeBlockData = getBlockDataForType(pageBlocks, 'concierge-packages')
            const shouldShow = pageBlocks.some((pb) => pb.blockType === 'concierge-packages' && pb.enabled)
            if (!shouldShow && !conciergeBlockData) return null
            return <ConciergePackagesSection data={conciergeBlockData} />
          })()}
        </div>

        <Footer disableTravelSection={true} />

        <FilterOverlay
          isOpen={showFilters}
          onClose={handleCloseFilters}
          onApplyFilters={handleApplyFilters}
          initialFilters={effectiveOverlayFilters}
        />
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const initialSortPrice = parseConciergeListSortQuery(
    typeof context.query.sortPrice === 'string'
      ? context.query.sortPrice
      : Array.isArray(context.query.sortPrice) && typeof context.query.sortPrice[0] === 'string'
        ? context.query.sortPrice[0]
        : '',
  )

  try {
    const promoSlugRaw = context.query.promo
    const promoSlug = typeof promoSlugRaw === 'string' ? promoSlugRaw : undefined
    let initialPromoPage: any = null
    if (promoSlug) {
      const promoRes = await getPromoPageBySlug(promoSlug)
      initialPromoPage = promoRes?.success && promoRes?.data && promoRes.data.published !== false ? promoRes.data : null
    }

    const apiParams = buildListApiParams(context.query)
    const promoItemIds: string[] = Array.isArray(initialPromoPage?.itemIds) ? initialPromoPage.itemIds : []
    if (promoSlug) {
      // '__none__' forces zero matches when the Promo Page has no items (or failed to resolve).
      apiParams.ids = promoItemIds.length > 0 ? promoItemIds.join(',') : '__none__'
      // El set de ids ya fue curado en Loggia; no re-exigir published.
      delete apiParams.published
    }
    const queryTypeRaw = context.query.type
    const queryLocationRaw = context.query.location
    const queryType = typeof queryTypeRaw === 'string' ? queryTypeRaw : ''
    const queryLocation = typeof queryLocationRaw === 'string' ? queryLocationRaw : ''

    const lookupLocation =
      typeof queryLocation === 'string' ? queryLocation.split(',')[0]?.trim() || '' : ''
    const [
      response,
      blocks,
      allServicesResponse,
      seoRow,
      categoryLocationOverride,
      conciergeCategoriesResponse,
      categoryLocationDescription,
      locationGeneralDescriptionRow,
      categoryLocationImageRow,
      locationGeneralImageRow,
    ] = await Promise.all([
      getAllServices(apiParams),
      getPageBlocksData('concierge-list'),
      getAllServices({ published: true, forWebsite: true }),
      fetchPageByKeyServer('concierge-list').catch(() => null),
      queryType && lookupLocation
        ? fetchConciergeLocationMetaTag(queryType, lookupLocation).catch(() => null)
        : Promise.resolve(null),
      getAllConciergeCategories().catch(() => null),
      queryType && lookupLocation
        ? fetchConciergeLocationDescription(queryType, lookupLocation).catch(() => null)
        : Promise.resolve(null),
      lookupLocation
        ? fetchConciergeLocationDescription(ALL_TYPES_CATEGORY, lookupLocation).catch(() => null)
        : Promise.resolve(null),
      queryType && lookupLocation
        ? fetchConciergeLocationImage(queryType, lookupLocation).catch(() => null)
        : Promise.resolve(null),
      lookupLocation
        ? fetchConciergeLocationImage(ALL_TYPES_CATEGORY, lookupLocation).catch(() => null)
        : Promise.resolve(null),
    ])
    const initialLocationDescription = categoryLocationDescription?.description || null
    const initialLocationGeneralDescription = locationGeneralDescriptionRow?.description || null
    const initialLocationImageUrl = categoryLocationImageRow?.imageUrl
      ? resolveMediaUrl(categoryLocationImageRow.imageUrl) || null
      : null
    const initialLocationGeneralImageUrl = locationGeneralImageRow?.imageUrl
      ? resolveMediaUrl(locationGeneralImageRow.imageUrl) || null
      : null
    // Manual (category, location) override takes priority over both the page-level default
    // and the auto-generated location-only metatags (see SeoHead usage in the component body).
    const overrideImageUrl = categoryLocationOverride?.metaImageUrl
      ? resolveMediaUrl(categoryLocationOverride.metaImageUrl) || null
      : null
    const pageImageUrl = seoRow?.metaImageUrl ? resolveMediaUrl(seoRow.metaImageUrl) || null : null
    const initialPageSeoMeta = {
      title: seoRow?.metaTitle || null,
      description: seoRow?.metaDescription || null,
      imageUrl: pageImageUrl,
    }
    const hasCategoryLocationOverride = Boolean(
      categoryLocationOverride?.metaTitle ||
        categoryLocationOverride?.metaDescription ||
        categoryLocationOverride?.metaImageUrl
    )
    const initialSeoMeta = {
      title: categoryLocationOverride?.metaTitle || seoRow?.metaTitle || null,
      description: categoryLocationOverride?.metaDescription || seoRow?.metaDescription || null,
      imageUrl: overrideImageUrl || pageImageUrl || null,
      hasCategoryLocationOverride,
    }

    const mapped = mapApiResponseToList(response, context.query)

    let initialServiceTypes: ServiceTypeCard[] = []
    {
      const allData: any[] = Array.isArray(allServicesResponse?.data) ? allServicesResponse.data : []
      const typeMap = new Map<string, string>()
      allData.forEach((s: any) => {
        const preview = mapServiceToPreview(s)
        const t = (preview.type || '').trim()
        if (t && !typeMap.has(t)) {
          typeMap.set(t, preview.image || '')
        }
      })

      // Admin-managed card image (Loggia Website Images > Concierge tab) takes priority
      // over both TYPE_CARD_IMAGES and the live service's own photo, when set.
      const conciergeCategories: any[] = Array.isArray(conciergeCategoriesResponse?.data)
        ? conciergeCategoriesResponse.data
        : []
      const customImageBySlug = new Map<string, string>()
      const descriptionBySlug = new Map<string, string>()
      const bannerImageBySlug = new Map<string, string>()
      conciergeCategories.forEach((cat: any) => {
        const url = cat?.cardImageUrl ? resolveMediaUrl(cat.cardImageUrl) : null
        if (cat?.slug && url) customImageBySlug.set(cat.slug, url)
        if (cat?.slug && cat?.shortDescription) descriptionBySlug.set(cat.slug, cat.shortDescription)
        const bannerUrl = cat?.bannerImageUrl ? resolveMediaUrl(cat.bannerImageUrl) : null
        if (cat?.slug && bannerUrl) bannerImageBySlug.set(cat.slug, bannerUrl)
      })

      initialServiceTypes = Array.from(typeMap.entries()).map(([type, image]) => ({
        type,
        image,
        customImage: customImageBySlug.get(slugify(type)) || null,
        shortDescription: descriptionBySlug.get(slugify(type)) || null,
        bannerImage: bannerImageBySlug.get(slugify(type)) || null,
      }))
    }

    if (mapped.listError) {
      return {
        props: {
          initialServices: [] as ConciergeServicePreview[],
          initialPagination: mapped.pagination,
          initialPageBlocks: Array.isArray(blocks) ? blocks : [],
          listError: mapped.listError,
          initialSortPrice,
          initialServiceTypes,
          initialPromoPage,
          initialSeoMeta,
          initialPageSeoMeta,
          initialLocationDescription,
          initialLocationGeneralDescription,
          initialLocationImageUrl,
          initialLocationGeneralImageUrl,
        },
      }
    }

    return {
      props: {
        initialServices: mapped.services,
        initialPagination: mapped.pagination,
        initialPageBlocks: Array.isArray(blocks) ? blocks : [],
        listError: null,
        initialSortPrice,
        initialServiceTypes,
        initialPromoPage,
        initialSeoMeta,
        initialPageSeoMeta,
        initialLocationDescription,
        initialLocationGeneralDescription,
        initialLocationImageUrl,
        initialLocationGeneralImageUrl,
      },
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps concierge/list:', err)
    return {
      props: {
        initialServices: [] as ConciergeServicePreview[],
        initialPagination: {
          total: 0,
          page: 1,
          limit: LIST_PAGE_SIZE,
          totalPages: 1,
        },
        initialPageBlocks: [],
        listError: 'We could not load concierge services. Please try again later.',
        initialSortPrice,
        initialServiceTypes: [],
      },
    }
  }
}

export default KennedysConciergeList
