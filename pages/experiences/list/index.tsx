import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChevronRight, Globe, Heart, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import {
  LocationTreeDropdown,
  type LocationTreeDropdownHandle,
  type LocationTreeSelection,
  buildLocationTreeLabel,
  locationSelectionDisplayTags,
} from '@/components/custom/LocationTreeDropdown'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { getActiveExperiences } from '@/lib/api/experiences'
import {
  coerceExperienceMediaPath,
  heroImageDirectUrl,
  normalizeExperienceGalleryRaw,
  resolveMediaUrl,
  slugify,
} from '@/lib/utils'
import {
  kennedysTreeLeafMatchingSlug,
  KENNEDYS_LOCATION_FILTER_TREE,
  expandLocationArea,
  filterTreeByAvailableRegions,
} from '@/lib/kennedysLocationFilterTree'
import { formatExperienceCityLabel } from '@/lib/experienceViewMap'
import { useExperienceLikes } from '@/src/hooks/useExperienceLikes'

const PLACEHOLDER_IMAGE = '/images/villa-detail@2x.png'
const ITEMS_PER_PAGE = 12

export type ExperienceListRow = Record<string, unknown> & {
  id?: string
  coordinates?: { lat: number; lng: number }
}

const EXPERIENCE_MAP_CONTAINER_STYLE = { width: '100%', height: '80vh' }
const EXPERIENCE_MAP_DEFAULT_CENTER = { lat: 37.9838, lng: 23.7275 }

function ExperienceMapPanel({
  experiences,
  active,
  onMarkerClick,
}: {
  experiences: ExperienceListRow[]
  active: ExperienceListRow | null
  onMarkerClick: (exp: ExperienceListRow | null) => void
}) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script-experiences-list',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const withCoords = useMemo(
    () => experiences.filter((e) => e.coordinates && Number.isFinite(e.coordinates.lat)),
    [experiences],
  )

  useEffect(() => {
    if (!map || !isLoaded || withCoords.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    withCoords.forEach((e) => {
      if (e.coordinates) bounds.extend(e.coordinates)
    })
    try {
      map.fitBounds(bounds)
    } catch {
      const c = withCoords[0].coordinates
      if (c) map.setCenter(c)
    }
  }, [map, isLoaded, withCoords])

  if (loadError)
    return <div className="p-4 text-sm text-red-600">Map cannot be loaded right now.</div>
  if (!isLoaded) return <div className="p-4 text-sm text-[#506A70]">Loading map…</div>

  const infoPosition = active?.coordinates ?? undefined

  return (
    <GoogleMap
      mapContainerStyle={EXPERIENCE_MAP_CONTAINER_STYLE}
      center={EXPERIENCE_MAP_DEFAULT_CENTER}
      zoom={6}
      onLoad={(m) => setMap(m)}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
      }}
    >
      {withCoords.map((exp) => {
        const id = String(exp.id ?? '')
        if (!exp.coordinates || !id) return null
        return (
          <Marker
            key={id}
            position={exp.coordinates}
            title={String(exp.title ?? '')}
            onClick={() => onMarkerClick(exp)}
          />
        )
      })}
      {infoPosition ? (
        <InfoWindow position={infoPosition} onCloseClick={() => onMarkerClick(null)}>
          <div style={{ maxWidth: 220 }}>
            <Link href={`/experiences/${encodeURIComponent(String(active?.id ?? ''))}`}>
              <strong style={{ color: '#172338' }}>{String(active?.title ?? '')}</strong>
            </Link>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#506A70' }}>
              {formatExperienceCityLabel(active?.city)}
            </p>
          </div>
        </InfoWindow>
      ) : null}
    </GoogleMap>
  )
}

function rowsFromActiveApi(res: unknown): ExperienceListRow[] {
  if (res == null || typeof res !== 'object') return []
  const o = res as Record<string, unknown>
  if (o.success !== true) return []
  const d = o.data
  if (!Array.isArray(d)) return []
  return d.filter((x) => x != null && typeof x === 'object') as ExperienceListRow[]
}

function pickHeroUrl(exp: ExperienceListRow): string {
  const hero = exp.heroImage ?? exp.hero_image
  const galleryPaths = normalizeExperienceGalleryRaw(exp?.gallery)
  const raw = coerceExperienceMediaPath(hero) || galleryPaths[0] || ''
  if (!raw || String(raw).trim() === '') return ''
  const resolved = /^https?:\/\//i.test(String(raw)) ? String(raw) : resolveMediaUrl(String(raw))
  return resolved && resolved.trim() !== '' ? heroImageDirectUrl(resolved) : ''
}

function citySlug(exp: ExperienceListRow): string {
  const c = exp.city
  if (typeof c !== 'string' || !c.trim()) return ''
  return slugify(c.trim())
}

function appliedLocationLeaves(area: string, location: string): string[] {
  const raw = area.trim()
    ? [area.trim()]
    : location
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
  return Array.from(new Set(raw.flatMap(expandLocationArea)))
}

function experienceMatchesLocationLeaf(exp: ExperienceListRow, leaf: string): boolean {
  const L = leaf.trim()
  if (!L) return false
  const leafSlug = slugify(L)
  if (citySlug(exp) === leafSlug) return true
  if (String(exp.city ?? '').trim().toLowerCase() === L.toLowerCase()) return true
  const mapReg = String(exp.mapRegion ?? exp.map_region ?? '').trim().toLowerCase()
  if (mapReg === L.toLowerCase()) return true
  const mapLoc = String(exp.mapLocation ?? exp.map_location ?? '').trim().toLowerCase()
  const l = L.toLowerCase()
  if (mapLoc && (mapLoc.includes(l) || l.includes(mapLoc))) return true
  return false
}

function legacyCitySlugChipLabel(slug: string): string {
  const s = slug.trim().toLowerCase()
  if (!s) return ''
  return s
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function extractLeadPrice(raw: unknown): number | null {
  if (raw == null) return null
  const s = String(raw).replace(/,/g, ' ').replace(/\s+/g, ' ')
  const m = s.match(/(\d[\d\s]*(?:\.\d+)?)/)
  if (!m) return null
  const n = parseFloat(m[1].replace(/\s/g, ''))
  return Number.isFinite(n) ? n : null
}

function formatExperienceCardPriceLine(exp: ExperienceListRow): string {
  const rawPrice = exp.price
  const sufRaw = exp.priceSuffix ?? exp.price_suffix
  const suffix =
    typeof sufRaw === 'string' && sufRaw.trim() ? ` ${sufRaw.trim()}` : ''
  if (typeof rawPrice === 'string' && rawPrice.trim()) {
    return `${rawPrice.trim()}${suffix}`
  }
  const n = extractLeadPrice(rawPrice)
  if (n != null && n > 0) {
    return `€${n.toLocaleString('de-DE')}${suffix}`
  }
  return suffix.trim()
}

function buildExperienceListQueryString(parts: {
  area: string
  location: string
  legacyCitySlug: string
  searchQuery: string
}): string {
  const q = new URLSearchParams()
  const area = parts.area.trim()
  const loc = parts.location.trim()
  const legacy = parts.legacyCitySlug.trim()
  if (area) q.set('area', area)
  else if (loc) q.set('region', loc)
  else if (legacy) q.set('city', legacy)
  if (parts.searchQuery.trim()) q.set('searchQuery', parts.searchQuery.trim())
  return q.toString()
}

function coordsFromExp(exp: ExperienceListRow): { lat: number; lng: number } | null {
  const latRaw = exp.latitude
  const lngRaw = exp.longitude
  const lat = typeof latRaw === 'number' ? latRaw : parseFloat(String(latRaw ?? ''))
  const lng = typeof lngRaw === 'number' ? lngRaw : parseFloat(String(lngRaw ?? ''))
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function normalizeExperienceRows(rows: ExperienceListRow[]): ExperienceListRow[] {
  return rows.map((exp) => ({
    ...exp,
    coordinates: coordsFromExp(exp) ?? undefined,
  }))
}

type Props = {
  initialExperiences: ExperienceListRow[]
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null }
}

function ExperienceListPage({ initialExperiences: initialFromServer, initialSeoMeta }: Props) {
  const router = useRouter()
  const [allRows, setAllRows] = useState<ExperienceListRow[]>(() =>
    normalizeExperienceRows(initialFromServer),
  )
  const [showMap, setShowMap] = useState(false)
  const [activeExperience, setActiveExperience] = useState<ExperienceListRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filtersReady, setFiltersReady] = useState(false)

  const locationDropdownRef = useRef<LocationTreeDropdownHandle>(null)
  const skipUrlSyncRef = useRef(false)

  /** Applied desde URL / último «Show experiences» (paridad con villas list). */
  const [location, setLocation] = useState('')
  const [area, setArea] = useState('')
  const [pickerLocation, setPickerLocation] = useState('')
  const [pickerArea, setPickerArea] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [locationTreeScope, setLocationTreeScope] = useState<'country' | 'region' | undefined>(
    undefined,
  )
  const [locationTreeDisplayRegion, setLocationTreeDisplayRegion] = useState('')
  /** Slug legacy `?city=` cuando no hay hoja en el árbol Kennedys. */
  const [legacyCitySlug, setLegacyCitySlug] = useState('')
  const [pickerSearch, setPickerSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default')
  const { isLiked, toggleFavorite, pendingIds } = useExperienceLikes()

  const availableRegions = useMemo(
    () => Array.from(new Set(allRows.map((e) => (e as any).city).filter(Boolean))),
    [allRows],
  )

  const filteredLocationTree = useMemo(
    () => filterTreeByAvailableRegions(KENNEDYS_LOCATION_FILTER_TREE, availableRegions),
    [availableRegions],
  )

  useEffect(() => {
    if (initialFromServer.length > 0) return
    let cancelled = false
    void getActiveExperiences().then((res) => {
      if (cancelled) return
      const next = rowsFromActiveApi(res)
      setAllRows(normalizeExperienceRows(next))
    })
    return () => {
      cancelled = true
    }
  }, [initialFromServer.length])

  useEffect(() => {
    if (!router.isReady) return
    if (skipUrlSyncRef.current) { skipUrlSyncRef.current = false; return }

    const {
      region: regionParam,
      location: locationParam,
      area: areaParam,
      city: cityParam,
      searchQuery: searchQ,
    } = router.query

    const areaStr = typeof areaParam === 'string' ? areaParam.trim() : ''
    const effectiveRegionParam =
      typeof regionParam === 'string'
        ? regionParam
        : typeof locationParam === 'string'
          ? locationParam
          : undefined

    if (areaStr) {
      setArea(areaParam as string)
      setPickerArea(areaParam as string)
      setLocation('')
      setPickerLocation('')
      setLegacyCitySlug('')
    } else if (effectiveRegionParam) {
      setLocation(effectiveRegionParam)
      setPickerLocation(effectiveRegionParam)
      setArea('')
      setPickerArea('')
      setLegacyCitySlug('')
    } else if (typeof cityParam === 'string' && cityParam.trim()) {
      const cq = cityParam.trim()
      const canon = kennedysTreeLeafMatchingSlug(cq)
      if (canon) {
        setArea(canon)
        setPickerArea(canon)
        setLocation('')
        setPickerLocation('')
        setLegacyCitySlug('')
      } else {
        setLegacyCitySlug(cq.toLowerCase())
        setArea('')
        setPickerArea('')
        setLocation('')
        setPickerLocation('')
      }
    } else {
      setLocation('')
      setArea('')
      setPickerLocation('')
      setPickerArea('')
      setLegacyCitySlug('')
      setSelectedCountry('')
      setLocationTreeScope(undefined)
      setLocationTreeDisplayRegion('')
    }

    setPickerSearch(typeof searchQ === 'string' ? searchQ.trim() : '')
    setFiltersReady(true)
    setCurrentPage(1)
  }, [router.isReady, router.query])

  const locationTreeValue = useMemo<LocationTreeSelection>(() => {
    const leaves = pickerArea.trim()
      ? [pickerArea.trim()]
      : pickerLocation
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
    return {
      selectedCountry,
      regionValue: pickerLocation,
      area: pickerArea,
      scope: locationTreeScope,
      displayRegion: locationTreeDisplayRegion || undefined,
      selectedLeaves: leaves.length > 0 ? leaves : undefined,
    }
  }, [
    selectedCountry,
    pickerLocation,
    pickerArea,
    locationTreeScope,
    locationTreeDisplayRegion,
  ])

  const breadcrumbLocationSelection = useMemo<LocationTreeSelection>(() => {
    const leaves = area.trim()
      ? [area.trim()]
      : location
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
    return {
      selectedCountry,
      regionValue: location,
      area,
      scope: locationTreeScope,
      displayRegion: locationTreeDisplayRegion || undefined,
      selectedLeaves: leaves.length > 0 ? leaves : undefined,
    }
  }, [
    selectedCountry,
    location,
    area,
    locationTreeScope,
    locationTreeDisplayRegion,
  ])

  const onLocationTreeChange = useCallback((next: LocationTreeSelection) => {
    setSelectedCountry(next.selectedCountry)
    setLocationTreeScope(next.scope)
    setLocationTreeDisplayRegion(next.displayRegion ?? '')
    if (next.selectedLeaves !== undefined) {
      const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)))
      if (uniq.length === 0) {
        setPickerLocation('')
        setPickerArea('')
        return
      }
      const csv = uniq.join(',')
      setPickerLocation(csv)
      setPickerArea(next.area ?? '')
      return
    }
    setPickerLocation(next.regionValue)
    setPickerArea(next.area)
  }, [])

  const applied = useMemo(() => {
    return {
      location,
      area,
      legacyCitySlug: legacyCitySlug.trim().toLowerCase(),
      selectedCountry: selectedCountry.trim(),
      searchNorm: pickerSearch.trim().toLowerCase(),
    }
  }, [location, area, legacyCitySlug, selectedCountry, pickerSearch])

  const filtered = useMemo(() => {
    return allRows.filter((exp) => {
      const leaves = appliedLocationLeaves(applied.area, applied.location)

      if (applied.legacyCitySlug) {
        if (citySlug(exp) !== applied.legacyCitySlug) return false
      } else if (leaves.length > 0) {
        if (!leaves.some((leaf) => experienceMatchesLocationLeaf(exp, leaf))) return false
      } else if (applied.selectedCountry) {
        const rawMc = exp.mapCountry ?? exp.map_country
        const mc = rawMc != null ? String(rawMc).trim() : ''
        const sc = applied.selectedCountry.trim()
        if (!mc) return false
        if (mc.toLowerCase() !== sc.toLowerCase() && slugify(mc) !== slugify(sc)) return false
      }

      if (applied.searchNorm) {
        const title = String(exp.title ?? '').toLowerCase()
        const desc = String(exp.description ?? '').toLowerCase()
        if (!title.includes(applied.searchNorm) && !desc.includes(applied.searchNorm)) return false
      }
      return true
    })
  }, [allRows, applied])

  const sortedFiltered = useMemo(() => {
    if (sortOrder === 'default') return filtered
    return [...filtered].sort((a, b) => {
      const pa = extractLeadPrice(a.price) ?? 0
      const pb = extractLeadPrice(b.price) ?? 0
      const diff = pa - pb
      return sortOrder === 'asc' ? diff : -diff
    })
  }, [filtered, sortOrder])

  const totalCount = sortedFiltered.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedFiltered.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedFiltered, currentPage])

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const activeFilterTags = useMemo(() => {
    const tags: string[] = [...locationSelectionDisplayTags(breadcrumbLocationSelection)]
    if (applied.legacyCitySlug) tags.push(legacyCitySlugChipLabel(applied.legacyCitySlug))
    if (applied.searchNorm) tags.push(`"${pickerSearch.trim()}"`)
    return tags
  }, [applied, breadcrumbLocationSelection, pickerSearch])

  const handleSearch = useCallback((shallow = false) => {
    const appliedLoc = pickerLocation.trim()
    const appliedAr = pickerArea.trim()
    setLocation(appliedLoc)
    setArea(appliedAr)
    setLegacyCitySlug('')

    const qs = buildExperienceListQueryString({
      area: appliedAr,
      location: appliedLoc,
      legacyCitySlug: '',
      searchQuery: pickerSearch,
    })
    const url = qs ? `/experiences/list?${qs}` : '/experiences/list'
    if (shallow) {
      void router.replace(url, undefined, { shallow: true, scroll: false })
    } else {
      void router.push(url)
    }
    setCurrentPage(1)
    locationDropdownRef.current?.close()
  }, [router, pickerLocation, pickerArea, pickerSearch])

  const autoFilterInitRef = useRef(false)
  useEffect(() => {
    if (!router.isReady) return
    if (!autoFilterInitRef.current) { autoFilterInitRef.current = true; return }
    const t = setTimeout(() => { skipUrlSyncRef.current = true; handleSearch(true) }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerLocation, pickerArea, router.isReady])

  const clearAllFilters = () => {
    setPickerLocation('')
    setPickerArea('')
    setLocation('')
    setArea('')
    setSelectedCountry('')
    setLocationTreeScope(undefined)
    setLocationTreeDisplayRegion('')
    setLegacyCitySlug('')
    setPickerSearch('')
    void router.push('/experiences/list')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExperienceCardNavigate = useCallback(
    (exp: ExperienceListRow) => {
      const id = String(exp.id ?? '')
      if (!id) return
      if (showMap && exp.coordinates) {
        setActiveExperience(exp)
        return
      }
      window.open(`/experiences/${encodeURIComponent(id)}`, '_blank', 'noopener,noreferrer')
    },
    [showMap],
  )

  const breadcrumbLabel =
    buildLocationTreeLabel(breadcrumbLocationSelection) ||
    (legacyCitySlug ? legacyCitySlugChipLabel(legacyCitySlug) : '') ||
    'All destinations'

  const removeFilterChip = (tag: string) => {
    let nextLocation = location
    let nextArea = area
    let nextLegacy = legacyCitySlug
    let nextSearch = pickerSearch

    const locTags = locationSelectionDisplayTags(breadcrumbLocationSelection)
    const legacyLabel = legacyCitySlug ? legacyCitySlugChipLabel(legacyCitySlug) : ''
    const summaryLoc = buildLocationTreeLabel(breadcrumbLocationSelection)
    const matchLegacy = legacyLabel !== '' && tag === legacyLabel
    const matchLoc = locTags.some((t) => t.toLowerCase() === tag.toLowerCase())

    if (matchLegacy) {
      nextLegacy = ''
    } else if (matchLoc && summaryLoc && tag === summaryLoc) {
      nextLocation = ''
      nextArea = ''
      nextLegacy = ''
    } else if (matchLoc) {
      const leaves = appliedLocationLeaves(area, location)
      if (leaves.length > 1) {
        const nextLeaves = leaves.filter((x) => x.toLowerCase() !== tag.toLowerCase())
        if (nextLeaves.length === 0) {
          nextLocation = ''
          nextArea = ''
        } else if (nextLeaves.length === 1) {
          nextLocation = ''
          nextArea = nextLeaves[0]
        } else {
          nextLocation = nextLeaves.join(',')
          nextArea = ''
        }
      } else {
        nextLocation = ''
        nextArea = ''
      }
      nextLegacy = ''
    } else if (applied.searchNorm && tag === `"${pickerSearch.trim()}"`) {
      nextSearch = ''
    }

    setLocation(nextLocation)
    setArea(nextArea)
    setPickerLocation(nextLocation)
    setPickerArea(nextArea)
    setLegacyCitySlug(nextLegacy)
    setPickerSearch(nextSearch)

    if (matchLoc || matchLegacy) {
      if (!nextLocation.trim() && !nextArea.trim() && !nextLegacy.trim()) {
        setSelectedCountry('')
        setLocationTreeScope(undefined)
        setLocationTreeDisplayRegion('')
      }
    }

    const qs = buildExperienceListQueryString({
      area: nextArea,
      location: nextLocation,
      legacyCitySlug: nextLegacy,
      searchQuery: nextSearch,
    })
    void router.push(qs ? `/experiences/list?${qs}` : '/experiences/list')
    setCurrentPage(1)
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null
    return (
      <div className="mt-12 flex items-center justify-center gap-2 px-4 md:px-0">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center border border-[#D1D5DB] text-[#172338] transition hover:bg-[#172338] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isFirst = page === 1
          const isLast = page === totalPages
          const isNearCurrent = Math.abs(page - currentPage) <= 1
          if (!isFirst && !isLast && !isNearCurrent) {
            if (page === 2 || page === totalPages - 1) {
              return (
                <span key={page} className="px-1 text-[#506A70]">
                  …
                </span>
              )
            }
            return null
          }
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageChange(page)}
              className={`h-10 w-10 border font-haas text-sm transition ${
                currentPage === page
                  ? 'border-[#172338] bg-[#172338] text-white'
                  : 'border-[#D1D5DB] text-[#172338] hover:bg-[#172338] hover:text-white'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex h-10 w-10 items-center justify-center border border-[#D1D5DB] text-[#172338] transition hover:bg-[#172338] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const listingLoaded = filtersReady

  return (
    <>
      <SeoHead
        title={initialSeoMeta?.title || `Curated experiences | ${SITE_NAME}`}
        description={initialSeoMeta?.description || "Browse Kennedys experiences by destination and keywords — private tours, lifestyle add-ons, and destination highlights."}
        imageUrl={initialSeoMeta?.imageUrl || undefined}
        canonicalPath="/experiences/list"
      />
      <div>
        <div className="h-full px-4 md:px-24">
          <Navbar textBlack className="absolute top-0 left-0 z-20 w-full bg-transparent" />

          <div className="w-full pt-16 md:pt-32">
            <div className="-mx-4 mt-5 flex h-12 items-center gap-2 bg-[#F0F3F5] px-4 text-xs md:-mx-24 md:h-16 md:px-24 md:text-sm">
              <Link className="underline" href="/">
                Home
              </Link>
              <span>
                <ChevronRight className="h-3 w-3" />
              </span>
              <Link className="underline" href="/experiences/list">
                Experiences
              </Link>
              <span>
                <ChevronRight className="h-3 w-3" />
              </span>
              <span className="min-w-0 truncate font-semibold">{breadcrumbLabel}</span>
            </div>

            <div className="mt-8 w-full pb-5">
              <div className="mx-auto w-full max-w-[1300px]">
                <div className="mb-1 hidden gap-2 px-0 font-haas text-xs uppercase tracking-wide text-[#506A70] md:flex">
                  <div className="min-w-0 flex-[1.4] px-1">Location</div>
                  <div className="min-w-0 flex-[1.4] px-1">Keywords</div>
                  <div className="w-[170px] shrink-0 px-1">Sort by Price</div>
                  <div className="w-[160px] shrink-0"></div>
                </div>

                <div className="flex flex-col gap-2 md:flex-row">
                  <div className="min-w-0 flex-[1.4]">
                    <LocationTreeDropdown
                      ref={locationDropdownRef}
                      options={filteredLocationTree}
                      loading={false}
                      placeholder="Select location"
                      triggerClassName="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14"
                      value={locationTreeValue}
                      onChange={onLocationTreeChange}
                      multiSelect
                      closeOnSelect={false}
                    />
                  </div>
                  <div className="min-w-0 flex-[1.4]">
                    <input
                      type="search"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search title or description"
                      className="h-[52px] w-full border border-[#D1D5DB] bg-white px-4 font-haas text-[14px] text-[#172338]"
                      aria-label="Keyword search"
                    />
                  </div>
                  <div className="w-full md:w-[170px] shrink-0">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'default' | 'asc' | 'desc')}
                      className="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-3 pr-10 appearance-none cursor-pointer bg-no-repeat bg-[length:20px] bg-[position:right_0.75rem_center] [&::-ms-expand]:hidden"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23172338' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
                    >
                      <option value="default">Sort by Price</option>
                      <option value="asc">Price: Low to High</option>
                      <option value="desc">Price: High to Low</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="flex h-[52px] w-full shrink-0 items-center justify-center gap-2 bg-[#7CF5EE] transition hover:brightness-95 md:w-[160px]"
                  >
                    <span className="whitespace-nowrap font-haas text-[14px] text-[#172338]">
                      Show experiences
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#172338]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="-mx-4 bg-[#F8F8F8] px-4 py-10 md:-mx-24 md:px-24">
              <div className="flex justify-center items-start">
                <div className="w-full max-w-[1300px]">
                  {activeFilterTags.length > 0 && (
                    <div className="mb-6 flex flex-wrap items-center gap-2 px-4 md:px-0">
                      {activeFilterTags.map((tag, ti) => (
                        <div
                          key={`${tag}-${ti}`}
                          className="flex items-center gap-2 rounded-full border border-[#d1d5db] bg-white px-3 py-1.5 font-haas text-sm text-[#172338]"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeFilterChip(tag)}
                            className="rounded-full p-0.5 transition-colors hover:bg-gray-100"
                            aria-label={`Remove ${tag}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mb-6 flex flex-col justify-between gap-3 px-4 md:mb-10 md:flex-row md:items-center md:gap-0 md:px-0">
                    <p className="text-lg text-[#D99330]">
                      {!listingLoaded ? (
                        <span className="inline-block h-5 w-36 animate-pulse rounded bg-[#e5ddd0]" />
                      ) : (
                        `${totalCount} Experience${totalCount !== 1 ? 's' : ''} found`
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowMap((v) => !v)}
                      className="flex items-center gap-2 text-[#172338] transition hover:text-[#0f1a1f]"
                    >
                      <Globe className="h-4 w-4" />
                      <span>{showMap ? 'Hide map' : 'Show map'}</span>
                    </button>
                  </div>

                  {!listingLoaded && (
                    <div className="grid animate-pulse grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:gap-10 lg:grid-cols-3 md:px-0">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="overflow-hidden border border-[#e5e7eb] bg-white">
                          <div className="h-60 bg-gray-200" />
                          <div className="space-y-3 p-6">
                            <div className="h-5 w-3/4 rounded bg-gray-200" />
                            <div className="h-4 w-1/2 rounded bg-gray-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {listingLoaded && filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF2F6]">
                        <SlidersHorizontal className="h-8 w-8 text-[#506A70]" />
                      </div>
                      <h3 className="mb-2 font-haas text-xl font-medium text-[#172338]">
                        No experiences match your search
                      </h3>
                      <p className="mb-8 max-w-xs text-sm text-[#506A70]">
                        Try clearing filters or searching with a different keyword.
                      </p>
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="h-[48px] bg-[#172338] px-6 font-haas text-[14px] text-white transition hover:bg-[#0f1a1f]"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}

                  {listingLoaded && filtered.length > 0 && showMap && (
                    <div className="flex flex-col gap-6 px-4 md:flex-row md:px-0">
                      <div className="w-full md:w-2/3">
                        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2">
                          {paginated.map((exp) => {
                            const id = String(exp.id ?? '')
                            const img = pickHeroUrl(exp) || PLACEHOLDER_IMAGE
                            const loc =
                              String(exp.mapLocation ?? exp.map_location ?? '').trim() ||
                              formatExperienceCityLabel(exp.city)
                            const priceLine = formatExperienceCardPriceLine(exp)
                            return (
                              <div
                                key={id}
                                role="link"
                                tabIndex={0}
                                className={`cursor-pointer overflow-hidden border border-[#A3A3A3] bg-white shadow-sm transition-shadow hover:shadow-lg ${
                                  activeExperience?.id === exp.id ? 'ring-2 ring-[#D99330]' : ''
                                }`}
                                onClick={() => handleExperienceCardNavigate(exp)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleExperienceCardNavigate(exp)
                                  }
                                }}
                              >
                                <div className="relative">
                                  <img
                                    src={img}
                                    alt={String(exp.title ?? '')}
                                    className="h-60 w-full object-cover"
                                    onError={(ev) => {
                                      const t = ev.target as HTMLImageElement
                                      if (t.src.endsWith(PLACEHOLDER_IMAGE)) return
                                      t.src = PLACEHOLDER_IMAGE
                                    }}
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-4 top-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      if (id) void toggleFavorite(id)
                                    }}
                                    disabled={!id || pendingIds.has(id)}
                                    aria-pressed={isLiked(id)}
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${isLiked(id) ? 'fill-[#ef4444] text-[#ef4444]' : ''}`}
                                    />
                                  </button>
                                </div>
                                <div className="p-6">
                                  <h3 className="mb-2 font-haas text-2xl font-light text-[#506A70]">
                                    {String(exp.title ?? '')}
                                  </h3>
                                  <div className="mb-3 flex items-center gap-1 text-[#303D40]">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm">{loc || ''}</span>
                                  </div>
                                  {typeof exp.duration === 'string' && exp.duration.trim() ? (
                                    <div className="mb-4 font-haas text-sm font-medium text-[#B17520]">
                                      {exp.duration.trim()}
                                    </div>
                                  ) : null}
                                  {priceLine ? (
                                    <div className="flex items-center font-haas text-sm font-light text-[#506A70]">
                                      <ChevronRight className="mr-1 h-4 w-4 shrink-0" />
                                      <span className="font-medium">{priceLine}</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {renderPagination()}
                      </div>
                      <div className="w-full md:sticky md:top-24 md:w-1/3">
                        <ExperienceMapPanel
                          experiences={filtered}
                          active={activeExperience}
                          onMarkerClick={(ex) => setActiveExperience(ex)}
                        />
                      </div>
                    </div>
                  )}

                  {listingLoaded && filtered.length > 0 && !showMap && (
                    <>
                      <div className="grid grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:gap-10 lg:grid-cols-3 md:px-0">
                        {paginated.map((exp) => {
                          const id = String(exp.id ?? '')
                          const img = pickHeroUrl(exp) || PLACEHOLDER_IMAGE
                          const loc =
                            String(exp.mapLocation ?? exp.map_location ?? '').trim() ||
                            formatExperienceCityLabel(exp.city)
                          const detailHref = `/experiences/${encodeURIComponent(id)}`
                          const priceLine = formatExperienceCardPriceLine(exp)
                          return (
                            <Link
                              key={id}
                              href={detailHref}
                              className="cursor-pointer overflow-hidden border border-[#A3A3A3] bg-white shadow-sm transition-shadow hover:shadow-lg"
                            >
                              <div className="relative">
                                <img
                                  src={img}
                                  alt={String(exp.title ?? '')}
                                  className="h-60 w-full object-cover"
                                  onError={(ev) => {
                                    const t = ev.target as HTMLImageElement
                                    if (t.src.endsWith(PLACEHOLDER_IMAGE)) return
                                    t.src = PLACEHOLDER_IMAGE
                                  }}
                                />
                                <button
                                  type="button"
                                  className="absolute right-4 top-4 rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (id) void toggleFavorite(id)
                                  }}
                                  disabled={!id || pendingIds.has(id)}
                                  aria-pressed={isLiked(id)}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${isLiked(id) ? 'fill-[#ef4444] text-[#ef4444]' : ''}`}
                                  />
                                </button>
                              </div>
                              <div className="p-6">
                                <h3 className="mb-2 font-haas text-2xl font-light text-[#506A70]">
                                  {String(exp.title ?? '')}
                                </h3>
                                <div className="mb-3 flex items-center gap-1 text-[#303D40]">
                                  <MapPin className="h-4 w-4" />
                                  <span className="text-sm">{loc || ''}</span>
                                </div>
                                {typeof exp.duration === 'string' && exp.duration.trim() ? (
                                  <div className="mb-4 font-haas text-sm font-medium text-[#B17520]">
                                    {exp.duration.trim()}
                                  </div>
                                ) : null}
                                {priceLine ? (
                                  <div className="flex items-center font-haas text-sm font-light text-[#506A70]">
                                    <ChevronRight className="mr-1 h-4 w-4 shrink-0" />
                                    <span className="font-medium">{priceLine}</span>
                                  </div>
                                ) : null}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                      {renderPagination()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer disableTravelSection disableDataLoading />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const [res, seoRow] = await Promise.all([
    getActiveExperiences(),
    fetchPageByKeyServer('experiences-list').catch(() => null),
  ])
  const rows = rowsFromActiveApi(res)
  return {
    props: {
      initialExperiences: rows,
      initialSeoMeta: {
        title: seoRow?.metaTitle || null,
        description: seoRow?.metaDescription || null,
        imageUrl: seoRow?.metaImageUrl || null,
      },
    },
  }
}

export default ExperienceListPage
