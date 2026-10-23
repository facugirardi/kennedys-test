import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getRealEstateCardExtras } from "@/lib/realEstateCard";
import { buildRealEstateDetailPath } from "@/lib/rentalRoute";
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ChevronRight, ChevronDown, X, Globe, SlidersHorizontal } from 'lucide-react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { PropertieCard } from '@/components/custom/propertieCard'
import { PriceSortSelect } from '@/components/custom/PriceSortSelect'
import { RealEstateFilterOverlay } from '@/components/custom/RealEstateFilterOverlay'
import { GoogleMap, useJsApiLoader, Circle, Marker, Libraries } from '@react-google-maps/api'
import {
  fetchPropertiesListResult,
  fetchAllPropertiesListResult,
  resolveMediaUrl,
  formatNightlyPriceLabel,
  REAL_ESTATE_LIST_PAGE_SIZE,
  heroImageDirectUrl,
  getPropertyPriceCurrencySymbol,
  getPropertySaleListingCurrency,
  getPropertySalePriceInCurrency,
  getPropertyLocationLabel,
  getRealEstateCardLocationLabel,
  escapeHtml,
} from '@/lib/utils'
import {
  countPoolsForRealEstateCard,
  getRealEstateBuildSqm,
  getRealEstatePlotSqm,
  getRealEstateBathrooms,
  getRealEstateYearBuilt,
} from '@/lib/propertyPoolCounts'
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark'
import usePropertyStore from '@/store/propertyStore'
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { REAL_ESTATE_LOCATION_FILTER_TREE } from '@/lib/kennedysLocationFilterTree'
import {
  LocationTreeDropdown,
  type LocationTreeSelection,
  type LocationTreeDropdownHandle,
  type LocationCountryGroup,
  buildLocationTreeLabel,
  locationSelectionDisplayTags,
} from '@/components/custom/LocationTreeDropdown'
import type { RealEstateFilterState } from '@/lib/realEstateListingSearchParams'
import {
  appendRealEstateListingSearchParams,
} from '@/lib/realEstateListingSearchParams'
import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import { SeoHead } from '@/components/seo/SeoHead'
import { getSiteUrl } from '@/lib/seo/config'
import { getRealEstateLocationMeta } from '@/lib/seo/locationMeta'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { getPromoPageBySlug } from '@/lib/api/promoPages'
import { getRealEstateMapPins } from '@/lib/api/properties'

const BUDGET_SLIDER_MIN = 0
const BUDGET_SLIDER_MAX = 10_000_000
const BUDGET_SLIDER_STEP = 100_000
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places']

function fmtBudgetAmt(n: number, isEnd: boolean, symbol: string): string {
    if (n <= 0 && !isEnd) return `${symbol}0`
    if (n >= BUDGET_SLIDER_MAX && isEnd) return `${symbol}10M+`
    if (n >= 1_000_000) {
        const m = n / 1_000_000
        const t = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10
        return `${symbol}${t}M`
    }
    if (n >= 1_000) return `${symbol}${Math.round(n / 1_000)}K`
    return `${symbol}${n}`
}

function fmtBudgetInputDigits(digits: string): string {
    if (!digits) return ''
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function fmtBudgetBarLabel(min: number, max: number, symbol: string): string {
    if (min <= BUDGET_SLIDER_MIN && max >= BUDGET_SLIDER_MAX) return 'Any price'
    return `${fmtBudgetAmt(min, false, symbol)} – ${fmtBudgetAmt(max, true, symbol)}`
}

function realEstateListCardImageUrl(url: string | undefined | null, watermark = false): string {
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

/** Lowercases and turns every non letter/digit run into a single space, padded with spaces so
 * `includes(" paros ")` is a whole-word match. */
function normalizeLocationText(value: unknown): string {
  return ` ${String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `
}

/** Mirrors the backend's `buildRegionTokensWhereFragment` (propertyService.ts): a region-tree
 * leaf like "Lagonisi" is a town stored in `area`, not `region`, so matching on `region` alone
 * strips results the API already counted (count and card list would then disagree). */
function matchesRegionTokens(property: any, tokens: string[]): boolean {
  if (tokens.length === 0) return true
  const region = String(property?.region || '').trim().toLowerCase()
  const area = String(property?.area || '').trim().toLowerCase()
  const location = normalizeLocationText(property?.location)
  const visibleLocation = normalizeLocationText(property?.visibleLocation)
  // Whole-word match (not substring): "paros" must not match "Antiparos".
  return tokens.some((t) => {
    const needle = ` ${normalizeLocationText(t).trim()} `
    return region === t || area === t || location.includes(needle) || visibleLocation.includes(needle)
  })
}

function RealEstateListCardSkeleton() {
  return (
    <div
      className="flex flex-col w-full h-full animate-pulse relative border border-[#a3a3a3] p-6 gap-2"
      aria-hidden
    >
      <div className="relative w-full shrink-0 bg-gray-200 h-[240px]">
        <div className="absolute top-9 right-9 h-10 w-10 rounded-full bg-gray-300/90 border border-gray-300" />
      </div>
      <div className="flex flex-col gap-2 w-full flex-1 pt-1">
        <div className="h-4 w-[88%] max-w-[280px] bg-gray-200 rounded" />
        <div className="h-4 w-1/2 max-w-[200px] bg-gray-200 rounded" />
        <div className="h-5 w-1/3 max-w-[140px] bg-gray-200 rounded mt-2" />
      </div>
    </div>
  )
}

type MapPanelProps = {
    mapProperties: any[]
    priceCurrencyHints: any
    getPriceLabel: (property: any) => string
    hoveredPropertyId: string | null
    setHoveredPropertyId: (value: string | null | ((prev: string | null) => string | null)) => void
}

const mapContainerStyle = { width: '100%', height: '100vh' }
const defaultCenter = { lat: 37.4467, lng: 25.3289 }

// Función para extraer coordenadas de googleMapUrl (igual que en PropertyLocationMap)
const extractCoordinatesFromUrl = (url: string | null | undefined): { lat: number; lng: number } | null => {
    if (!url) return null

    try {
        const patterns = [
            /[?&]q=([-\d.]+),([-\d.]+)/,
            /@([-\d.]+),([-\d.]+)/,
            /place\/[^\/]+\/([-\d.]+),([-\d.]+)/,
            /ll=([-\d.]+),([-\d.]+)/,
            /center=([-\d.]+),([-\d.]+)/,
            /maps\?q=([-\d.]+),([-\d.]+)/,
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match && match.length >= 3) {
                const lat = parseFloat(match[1])
                const lng = parseFloat(match[2])
                if (!isNaN(lat) && !isNaN(lng)) {
                    return { lat, lng }
                }
            }
        }
    } catch (error) {
        console.error('Error extracting coordinates from URL:', error)
    }

    return null
}

const RE_BASE_ZOOM = 10

// Pin ("globito") de ubicación: teardrop naranja con centro blanco, suave (curvas + sombra),
// en vez del círculo plano de antes. Tamaño en pixeles fijo (no reescala con el zoom, a
// diferencia del círculo que necesitaba corregir el radio en metros).
//
// El tamaño es EXACTAMENTE el mismo en estado normal y hovered a propósito: agrandar el ícono
// dentro del propio listener de 'mouseover' cambia el bounding box justo debajo del cursor, y
// Maps vuelve a disparar 'mouseout' de inmediato (el box nuevo ya no coincide con el punto que
// disparó el hover) -> loop mouseover/mouseout -> parpadeo. Al mantener el tamaño fijo y resaltar
// solo con color, el hit-box nunca cambia mientras el mouse está encima.
const PIN_SIZE = { width: 19, height: 25 }

const buildPinIconUrl = (hovered: boolean) => {
    const fill = hovered ? '#B8720F' : '#D99330'
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44">
        <defs>
            <filter id="pin-shadow" x="-60%" y="-30%" width="220%" height="220%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#172338" flood-opacity="0.35"/>
            </filter>
        </defs>
        <path filter="url(#pin-shadow)" d="M17 1C8.72 1 2 7.72 2 16c0 11.6 15 26 15 26s15-14.4 15-26C32 7.72 25.28 1 17 1z" fill="${fill}" stroke="#ffffff" stroke-width="1"/>
        <circle cx="17" cy="16" r="6" fill="#ffffff"/>
    </svg>`
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

const buildPinIcon = (hovered: boolean) => ({
    url: buildPinIconUrl(hovered),
    scaledSize: new (window as any).google.maps.Size(PIN_SIZE.width, PIN_SIZE.height),
    anchor: new (window as any).google.maps.Point(PIN_SIZE.width / 2, PIN_SIZE.height)
})

function MapPanel({ mapProperties, priceCurrencyHints, getPriceLabel, hoveredPropertyId, setHoveredPropertyId }: MapPanelProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: GOOGLE_MAPS_LIBRARIES
    })
    const [map, setMap] = useState<any>(null)
    const markersRef = useRef<Map<string, any>>(new Map())
    const infoWindowRef = useRef<any>(null)
    const hasFittedRef = useRef(false)
    const hoverAnimTimeoutRef = useRef<number | null>(null)
    const prevHoveredIdRef = useRef<string | null>(null)

    const propertiesWithCoords = useMemo(() => {
        return mapProperties
            .map(property => {
                let coords = null
                if (property.coordinates && typeof property.coordinates.lat === 'number' && typeof property.coordinates.lng === 'number') {
                    coords = property.coordinates
                } else if (property.googleMapUrl) {
                    coords = extractCoordinatesFromUrl(property.googleMapUrl)
                }
                if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number' && !isNaN(coords.lat) && !isNaN(coords.lng) && Math.abs(coords.lat) > 0.001 && Math.abs(coords.lng) > 0.001) {
                    return { ...property, coordinates: coords }
                }
                return null
            })
            .filter(Boolean)
    }, [mapProperties])

    const showPinInfoWindow = useCallback((property: any, marker: any) => {
        const infoWindow = infoWindowRef.current
        if (!infoWindow) return
        const imageUrl = realEstateListCardImageUrl(getPrimaryImageRawUrl(property), shouldWatermarkImage(property?.watermarkPhotos, 'real-estate'))
        const price = getPriceLabel(property)
        const currency = getPropertySaleListingCurrency(property, priceCurrencyHints)
        const displayCurrency = currency === 'eur' ? '€' : currency === 'usd' ? '$' : currency
        const priceLabel = price === 'Price on request' ? price : displayCurrency ? `${displayCurrency}${price}` : price
        const safeTitle = escapeHtml(property.title || '')
        const safeLocation = escapeHtml(getPropertyLocationLabel(property || {}))
        const safePriceLabel = escapeHtml(priceLabel)
        // Solo caracteres seguros de un id/UUID: no puede romper el atributo onclick ni el string JS que contiene.
        const safeId = String(property.id ?? '').replace(/[^a-zA-Z0-9-_]/g, '')
        ;(window as any).__kennedysMapNav = () => { window.open(buildRealEstateDetailPath(property), '_blank', 'noopener,noreferrer') }
        infoWindow.setContent(`
            <div onclick="window.__kennedysMapNav && window.__kennedysMapNav('${safeId}')" style="width:230px;cursor:pointer;overflow:hidden;background:#fff;">
                <img src="${escapeHtml(imageUrl)}" alt="${safeTitle}" style="width:100%;height:145px;object-fit:cover;display:block;" />
                <div style="padding:12px 14px 14px;border-top:2px solid #D99330;">
                    <p style="margin:0 0 3px;font-family:sans-serif;font-size:10px;font-weight:600;color:#506A70;text-transform:uppercase;letter-spacing:0.08em;">${safeLocation}</p>
                    <p style="margin:0 0 8px;font-family:sans-serif;font-size:13px;font-weight:600;color:#172338;line-height:1.3;">${safeTitle}</p>
                    <p style="margin:0;font-family:sans-serif;font-size:13px;font-weight:700;color:#D99330;">${safePriceLabel}</p>
                </div>
            </div>
        `)
        // Anclado al marker (no a setPosition/coordinates a mano): así Maps calcula el offset
        // usando el `anchor` del ícono del pin y abre el info window arriba de todo el pin, sin
        // taparlo. Con setPosition(coordinates) el info window nacía pegado a la punta del pin
        // (el anchor point) y terminaba superponiéndose visualmente con el pin completo — el
        // cursor quedaba "sobre" el info window en vez del marker, eso disparaba mouseout, se
        // cerraba, el cursor volvía a caer sobre el marker, reabría... loop (el parpadeo).
        infoWindow.open(map, marker)
    }, [map])

    useEffect(() => {
        if (!map || typeof window === 'undefined' || !(window as any).google || !isLoaded) return

        // Limpiar pines anteriores
        markersRef.current.forEach(({ marker }) => {
            ;(window as any).google.maps.event.clearInstanceListeners(marker)
            marker.setMap(null)
        })
        markersRef.current = new Map()

        if (propertiesWithCoords.length === 0) return

        const bounds = new (window as any).google.maps.LatLngBounds()
        // disableAutoPan: por default el InfoWindow re-centra el mapa para que quede visible al
        // abrirse. Eso mueve el pin bajo el cursor (que se quedó quieto) -> Maps dispara mouseout
        // -> se cierra -> el mapa vuelve a su posición -> el pin reaparece bajo el cursor -> abre
        // de nuevo -> loop. Esta es la causa real del parpadeo, no el ícono ni la animación.
        const infoWindow = new (window as any).google.maps.InfoWindow({ maxWidth: 230, disableAutoPan: true })
        infoWindowRef.current = infoWindow

        infoWindow.addListener('domready', () => {
            const d = document.querySelector('.gm-style-iw-d') as HTMLElement | null
            if (d) { d.style.overflow = 'hidden'; d.style.padding = '0' }
            const c = document.querySelector('.gm-style-iw-c') as HTMLElement | null
            if (c) { c.style.padding = '0'; c.style.overflow = 'hidden'; c.style.borderRadius = '0'; c.style.boxShadow = '0 4px 20px rgba(23,35,56,0.18)' }
            const chr = document.querySelector('.gm-style-iw-chr') as HTMLElement | null
            if (chr) chr.style.display = 'none'
            const closeBtn = document.querySelector('.gm-ui-hover-effect') as HTMLElement | null
            if (closeBtn) closeBtn.style.display = 'none'
            // Google le pone tabindex al wrapper del info window para accesibilidad, y el
            // navegador le dibuja el foco azul por default apenas se abre. Se lo sacamos.
            const iw = document.querySelector('.gm-style-iw') as HTMLElement | null
            if (iw) iw.style.outline = 'none'
            const iwA = document.querySelector('.gm-style-iw-a') as HTMLElement | null
            if (iwA) iwA.style.outline = 'none'
        })

        const newMarkers = new Map<string, any>()

        propertiesWithCoords.forEach((property: any) => {
            if (!property.coordinates) return
            const latLng = new (window as any).google.maps.LatLng(property.coordinates.lat, property.coordinates.lng)
            const propertyId = String(property.id ?? '')

            const marker = new (window as any).google.maps.Marker({
                position: latLng,
                icon: buildPinIcon(false),
                clickable: true,
                zIndex: 1,
                map
            })

            marker.addListener('click', () => { window.open(buildRealEstateDetailPath(property), '_blank', 'noopener,noreferrer') })

            // Importante: el hover NATIVO del pin (mouse físicamente encima) NUNCA le toca el
            // ícono/zIndex/animación a sí mismo. Mutar un marker desde su propio mouseover
            // (agrandarlo, cambiarle el color, animarlo) mueve/redibuja su hit-box bajo el cursor,
            // Maps dispara mouseout de inmediato porque el cursor "ya no está" sobre el box nuevo,
            // eso lo revierte, el cursor vuelve a quedar adentro, dispara mouseover de nuevo -> loop
            // infinito (el parpadeo reportado). Acá solo abrimos/cerramos el info window, que es un
            // overlay aparte y no afecta el hit-box del marker.
            marker.addListener('mouseover', () => showPinInfoWindow(property, marker))
            marker.addListener('mouseout', () => {
                if (prevHoveredIdRef.current !== propertyId) infoWindowRef.current?.close()
            })

            if (propertyId) newMarkers.set(propertyId, { marker, property })
            bounds.extend(latLng)
        })

        markersRef.current = newMarkers

        // fitBounds solo la primera vez — evita saltar a África en updates posteriores
        if (!hasFittedRef.current) {
            hasFittedRef.current = true
            setTimeout(() => {
                try {
                    map.fitBounds(bounds, 100)
                    const listener = (window as any).google.maps.event.addListener(map, 'bounds_changed', () => {
                        const zoom = map.getZoom()
                        if (zoom && zoom > 12) map.setZoom(12)
                        else if (zoom && zoom < 7) map.setZoom(7)
                        ;(window as any).google.maps.event.removeListener(listener)
                    })
                } catch (e) {
                    console.error('Error en fitBounds:', e)
                }
            }, 300)
        }

        return () => {
            infoWindow.close()
            markersRef.current.forEach(({ marker }) => {
                ;(window as any).google.maps.event.clearInstanceListeners(marker)
                marker.setMap(null)
            })
            markersRef.current = new Map()
        }
    }, [map, isLoaded, propertiesWithCoords.length, showPinInfoWindow]) // eslint-disable-line react-hooks/exhaustive-deps

    // Hover en una card de la lista (único lugar que setea `hoveredPropertyId`) → resalta el pin
    // correspondiente en el mapa: color + rebote + info window. El hover nativo del pin (arriba)
    // va por separado y no toca esto, justamente para no pisarse y evitar el loop de mouseover/out.
    useEffect(() => {
        if (!map || typeof window === 'undefined' || !(window as any).google) return

        const previousId = prevHoveredIdRef.current
        if (previousId && previousId !== hoveredPropertyId) {
            const prevEntry = markersRef.current.get(previousId)
            if (prevEntry) {
                prevEntry.marker.setIcon(buildPinIcon(false))
                prevEntry.marker.setZIndex(1)
                prevEntry.marker.setAnimation(null)
            }
            infoWindowRef.current?.close()
        }

        prevHoveredIdRef.current = hoveredPropertyId

        if (hoverAnimTimeoutRef.current) {
            window.clearTimeout(hoverAnimTimeoutRef.current)
            hoverAnimTimeoutRef.current = null
        }

        if (!hoveredPropertyId) return

        const entry = markersRef.current.get(hoveredPropertyId)
        if (!entry) return

        // Lleva el mapa hasta la propiedad hovereada (panTo anima el desplazamiento solo).
        map.panTo(entry.marker.getPosition())

        entry.marker.setIcon(buildPinIcon(true))
        entry.marker.setZIndex(2)
        entry.marker.setAnimation((window as any).google.maps.Animation.BOUNCE)
        showPinInfoWindow(entry.property, entry.marker)

        hoverAnimTimeoutRef.current = window.setTimeout(() => {
            entry.marker.setAnimation(null)
        }, 700)
    }, [hoveredPropertyId, map, showPinInfoWindow])

    const onLoad = useCallback((mapInstance: any) => { setMap(mapInstance) }, [])
    const onUnmount = useCallback(() => { hasFittedRef.current = false; setMap(null) }, [])

    const initialCenter = propertiesWithCoords.length > 0 && propertiesWithCoords[0]?.coordinates
        ? propertiesWithCoords[0].coordinates
        : defaultCenter

    if (loadError) return <div>Map cannot be loaded right now.</div>
    if (!isLoaded) return <div>Loading map...</div>

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={initialCenter}
            zoom={propertiesWithCoords.length > 0 ? RE_BASE_ZOOM : 6}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: true,
                zoomControl: true,
                styles: [
                    {
                        featureType: 'poi',
                        stylers: [{ visibility: 'off' }], // Ocultar restaurantes y otros puntos de interés de Google
                    },
                    {
                        featureType: 'transit',
                        elementType: 'labels.icon',
                        stylers: [{ visibility: 'off' }],
                    },
                ],
            }}
        />
    )
}

const KennedysRealStateList = () => {
    const router = useRouter()
    const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)
    const { isLiked, toggleFavorite, pendingIds } = usePropertyLikes()
    const [cmsSeoMeta, setCmsSeoMeta] = useState<{ title?: string | null; description?: string | null; imageUrl?: string | null }>({})
    useEffect(() => {
        let mounted = true
        fetchPageByKeyServer('real-estate-list').then((row) => {
            if (!mounted) return
            setCmsSeoMeta({ title: row?.metaTitle || null, description: row?.metaDescription || null, imageUrl: row?.metaImageUrl || null })
        })
        return () => { mounted = false }
    }, [])

    const [location, setLocation] = useState('')
    /** Área geográfica del árbol (barra de búsqueda); distinta de `filterState.area` (Beachfront, etc.). */
    const [listGeoArea, setListGeoArea] = useState('')
    /**
     * Sub-áreas reales (p. ej. Glyfada -> Golf) traídas de /property/filter-options: solo aparecen las
     * que ya tienen propiedades cargadas, así el árbol de Location nunca ofrece una sub-área vacía.
     */
    const [realEstateSubAreasByCountry, setRealEstateSubAreasByCountry] = useState<
        { country: string; subAreasByArea: Record<string, string[]> }[]
    >([])

    useEffect(() => {
        let mounted = true
        import('@/lib/api/properties').then(({ getFilterOptions }) => {
            getFilterOptions({ rental: false, category: 'real-estate' }).then((res: any) => {
                if (!mounted) return
                const byCountry = Array.isArray(res?.data?.locationsByCountry) ? res.data.locationsByCountry : []
                setRealEstateSubAreasByCountry(
                    byCountry.map((g: any) => ({
                        country: g?.country || '',
                        subAreasByArea: g?.subAreasByArea || {},
                    }))
                )
            }).catch(() => {})
        })
        return () => { mounted = false }
    }, [])
    /** Valores del árbol hasta pulsar «Check Now» (mismo patrón que villas/list). */
    const [pickerLocation, setPickerLocation] = useState('')
    const [pickerListGeoArea, setPickerListGeoArea] = useState('')
    const [selectedCountry, setSelectedCountry] = useState('')
    const [geoBarScope, setGeoBarScope] = useState<'country' | 'region' | undefined>(undefined)
    const [geoBarDisplayRegion, setGeoBarDisplayRegion] = useState('')
    const [appliedBudMin, setAppliedBudMin] = useState(BUDGET_SLIDER_MIN)
    const [appliedBudMax, setAppliedBudMax] = useState(BUDGET_SLIDER_MAX)
    const [pickerBudMin, setPickerBudMin] = useState(BUDGET_SLIDER_MIN)
    const [pickerBudMax, setPickerBudMax] = useState(BUDGET_SLIDER_MAX)
    const [pickerBudMinInput, setPickerBudMinInput] = useState('')
    const [pickerBudMaxInput, setPickerBudMaxInput] = useState('')
    const [bedrooms, setBedrooms] = useState(1)
    const [pickerBedrooms, setPickerBedrooms] = useState(1)
    const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default')
    const [pickerSortOrder, setPickerSortOrder] = useState<'default' | 'asc' | 'desc'>('default')
    const [activeFilters, setActiveFilters] = useState<string[]>([])
    const [showMap, setShowMap] = useState(false)
    const [properties, setProperties] = useState<any[]>([])
    const [listTotal, setListTotal] = useState(0)
    const [listPageSize, setListPageSize] = useState(REAL_ESTATE_LIST_PAGE_SIZE)
    const [isLoading, setIsLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const searchSectionRef = useRef<HTMLDivElement | null>(null)
    // Navbar scrolls away on this page, so sticky offsets below it are 0.
    const navbarHeight = 0
    const [searchSectionHeight, setSearchSectionHeight] = useState(0)
    const [filtersInitialized, setFiltersInitialized] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    /** Fuerza refetch al buscar / aplicar overlay aunque la página siga en 1 (mismo patrón que villas + router.push). */
    const [listQueryVersion, setListQueryVersion] = useState(0)
    const locationDropdownRef = useRef<LocationTreeDropdownHandle>(null)

    // Promo Page scoping: `?promo=<slug>` restricts this same page (filters, map, etc.) to a curated id set.
    const promoSlug = typeof router.query.promo === 'string' ? router.query.promo : undefined
    const [promoPage, setPromoPage] = useState<any | null>(null)
    const [promoResolving, setPromoResolving] = useState(false)
    useEffect(() => {
        if (!promoSlug) {
            setPromoPage(null)
            setPromoResolving(false)
            return
        }
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
    }, [promoSlug])
    const [filterState, setFilterState] = useState<RealEstateFilterState>({
        priceRange: {
            min: null,
            max: null
        },
        priceCurrency: 'eur',
        bedrooms: 'Any',
        bathrooms: 'Any',
        floors: 'Any',
        floorLevel: {
            min: null,
            max: null
        },
        propertyType: [],
        listingStatus: [],
        squareFeet: {
            min: null,
            max: null
        },
        lotSize: {
            min: null,
            max: null
        },
        yearBuilt: {
            min: null,
            max: null
        },
        listingStatusDropdown: 'All',
        area: 'All',
        outdoor: [],
        luxuryIndoor: [],
        location: [],
        view: []
    })

    // Currency picked in the Filters modal — the top-bar Budget quick filter follows it too,
    // so both price controls always agree on which currency the numbers are in.
    const budgetCurrencySymbol = filterState.priceCurrency === 'usd' ? '$' : '€'

    const priceCurrencyHints = useMemo(
        () => [
            selectedCountry,
            geoBarDisplayRegion,
            location,
            listGeoArea,
            pickerLocation,
            pickerListGeoArea,
            ...(filterState.location ?? []),
            typeof router.query?.region === 'string'
                ? router.query.region
                : Array.isArray(router.query?.region)
                  ? router.query.region.join(',')
                  : '',
            typeof router.query?.location === 'string'
                ? router.query.location
                : Array.isArray(router.query?.location)
                  ? router.query.location.join(',')
                  : '',
        ],
        [
            selectedCountry,
            geoBarDisplayRegion,
            location,
            listGeoArea,
            pickerLocation,
            pickerListGeoArea,
            filterState.location,
            router.query?.region,
            router.query?.location,
        ]
    )

    const filterOptions = ['Pool', 'Bar', 'Gym', 'Spa', 'Beachfront', 'Mountain View']

    useEffect(() => {
        // Read URL parameters - Solo ejecutar cuando router esté listo
        if (!router.isReady) return;
        
        const {
            location: locationParam,
            region: regionParam, // Leer region de la URL (prioritario)
            type: typeParam,
            openFilters,
            minPrice,
            maxPrice,
            priceCurrency: priceCurrencyParam,
            bedrooms,
            bathrooms,
            propertyType,
            minSqm,
            maxSqm,
            minLotSize,
            maxLotSize,
            minYearBuilt,
            maxYearBuilt,
            minFloors,
            minFloorLevel,
            maxFloorLevel,
            area,
            view,
            amenities,
            locationFeatures,
            listingStatus: listingStatusParam,
            bathroomsQuantity: bathroomsQtyParam,
            bedroomsQuantity: bedroomsQtyParam,
            sortBy: sortByParam,
        } = router.query
        
        // Usar region si está disponible, sino usar location (para compatibilidad)
        const locationValue = (regionParam || locationParam) as string
        if (locationValue) {
            const trimmedValue = locationValue.trim()
            setLocation(trimmedValue)
            setPickerLocation(trimmedValue)
        } else {
            setLocation('')
            setPickerLocation('')
        }
        if (typeof area === 'string' && area.trim()) {
            const geo = area.trim()
            setListGeoArea(geo)
            setPickerListGeoArea(geo)
        } else {
            setListGeoArea('')
            setPickerListGeoArea('')
        }
        if (openFilters === 'true') {
            setShowFilters(true)
        }

        // Actualizar el estado de filtros con los parámetros de la URL - hacerlo en una sola actualización
        setFilterState(prev => {
            const newState = { ...prev }
            
            if (minPrice) {
                newState.priceRange = { ...newState.priceRange, min: Number(minPrice) }
            }
            if (maxPrice) {
                newState.priceRange = { ...newState.priceRange, max: Number(maxPrice) }
            }
            if (priceCurrencyParam === 'usd' || priceCurrencyParam === 'eur') {
                newState.priceCurrency = priceCurrencyParam
            }
            // `bedrooms` (legacy/overlay) es la única fuente para el filtro del overlay.
            // `bedroomsQuantity` es el valor exacto de la barra (ver más abajo, alimenta
            // `bedrooms`/`pickerBedrooms`) y NO debe pisar la selección del overlay.
            if (bedrooms) {
                newState.bedrooms = bedrooms as string
            }
            if (bathrooms) {
                newState.bathrooms = bathrooms as string
            }
            if (typeof bathroomsQtyParam === 'string' && bathroomsQtyParam.trim()) {
                newState.bathrooms = bathroomsQtyParam.trim()
            }
            if (typeof listingStatusParam === 'string' && listingStatusParam.trim()) {
                newState.listingStatusDropdown = listingStatusParam.trim()
            }
            if (propertyType) {
                const types = typeof propertyType === 'string' ? propertyType.split(',') : propertyType as string[]
                newState.propertyType = types
            } else if (typeParam) {
                const t = typeof typeParam === 'string' ? typeParam.trim() : ''
                if (t) newState.propertyType = [t]
            }
            if (minSqm) {
                newState.squareFeet = { ...newState.squareFeet, min: Number(minSqm) }
            }
            if (maxSqm) {
                newState.squareFeet = { ...newState.squareFeet, max: Number(maxSqm) }
            }
            if (minLotSize) {
                newState.lotSize = { ...newState.lotSize, min: Number(minLotSize) }
            }
            if (maxLotSize) {
                newState.lotSize = { ...newState.lotSize, max: Number(maxLotSize) }
            }
            if (minYearBuilt) {
                newState.yearBuilt = { ...newState.yearBuilt, min: Number(minYearBuilt) }
            }
            if (maxYearBuilt) {
                newState.yearBuilt = { ...newState.yearBuilt, max: Number(maxYearBuilt) }
            }
            if (minFloors && Number(minFloors) > 0) {
                newState.floors = `${Number(minFloors)}+`
            }
            if (minFloorLevel !== undefined && minFloorLevel !== '' && Number(minFloorLevel) >= 0) {
                newState.floorLevel = { ...newState.floorLevel, min: Number(minFloorLevel) }
            }
            if (maxFloorLevel !== undefined && maxFloorLevel !== '' && Number(maxFloorLevel) >= 0) {
                newState.floorLevel = { ...newState.floorLevel, max: Number(maxFloorLevel) }
            }
            if (view) {
                const views = typeof view === 'string' ? view.split(',') : view as string[]
                newState.view = views
            }
            if (amenities) {
                const amenityList = typeof amenities === 'string' ? amenities.split(',') : amenities as string[]
                // Separar entre outdoor y luxuryIndoor según corresponda
                newState.outdoor = amenityList.filter(a => ['Pool', 'Bar', 'Gym', 'Spa', 'Beachfront', 'Mountain View'].includes(a))
                newState.luxuryIndoor = amenityList.filter(a => !['Pool', 'Bar', 'Gym', 'Spa', 'Beachfront', 'Mountain View'].includes(a))
            }
            if (locationFeatures) {
                const locations = typeof locationFeatures === 'string' ? locationFeatures.split(',') : locationFeatures as string[]
                newState.location = locations
            }
            
            return newState
        })

        const bedFromUrl =
            (typeof bedroomsQtyParam === 'string' && bedroomsQtyParam.trim()) ||
            (bedrooms ? String(bedrooms) : '')
        if (bedFromUrl) {
            const n = parseInt(bedFromUrl, 10)
            if (!Number.isNaN(n) && n > 0) {
                setBedrooms(n)
                setPickerBedrooms(n)
            }
        } else {
            setBedrooms(1)
            setPickerBedrooms(1)
        }

        const mp = router.query.minPrice
        const xp = router.query.maxPrice
        const mn = typeof mp === 'string' && mp.trim() ? Number(mp) : 0
        const mx = typeof xp === 'string' && xp.trim() ? Number(xp) : BUDGET_SLIDER_MAX
        const budMin = !Number.isNaN(mn) && mn > 0 ? mn : BUDGET_SLIDER_MIN
        const budMax = !Number.isNaN(mx) && mx > 0 && mx < BUDGET_SLIDER_MAX ? mx : BUDGET_SLIDER_MAX
        setAppliedBudMin(budMin)
        setAppliedBudMax(budMax)
        setPickerBudMin(budMin)
        setPickerBudMax(budMax)
        setPickerBudMinInput(budMin > BUDGET_SLIDER_MIN ? String(budMin) : '')
        setPickerBudMaxInput(budMax < BUDGET_SLIDER_MAX ? String(budMax) : '')

        const pageRaw = router.query.page
        const pageStr =
            typeof pageRaw === 'string'
                ? pageRaw
                : Array.isArray(pageRaw)
                  ? pageRaw[0]
                  : ''
        if (pageStr) {
            const n = parseInt(String(pageStr), 10)
            if (!Number.isNaN(n) && n > 0) {
                setCurrentPage(n)
            }
        }

        if (typeof sortByParam === 'string' && (sortByParam === 'asc' || sortByParam === 'desc')) {
            setSortOrder(sortByParam)
            setPickerSortOrder(sortByParam)
        } else {
            setSortOrder('default')
            setPickerSortOrder('default')
        }

        setFiltersInitialized(true)
    }, [router.isReady, router.asPath])

    // Shared filter-building logic: used both by the paginated card fetch and by the
    // map's "fetch every matching property" fetch, so the two never drift out of sync.
    type BuiltRealEstateFilters = {
        filters: Record<string, string | number | boolean>
        hasCurrencyPriceFilter: boolean
        effectiveMinPrice: number | null
        effectiveMaxPrice: number | null
    }

    const buildFilters = useCallback((): BuiltRealEstateFilters | null => {
        const sq = router.query.searchQuery
        const searchQuery =
            typeof sq === 'string'
                ? sq
                : Array.isArray(sq) && typeof sq[0] === 'string'
                  ? sq[0]
                  : ''

        const filters: Record<string, string | number | boolean> = {
            rental: false,
            category: 'real-estate',
            page: currentPage,
            pageSize: REAL_ESTATE_LIST_PAGE_SIZE,
        }

        const locTokensRaw = location.trim().split(',').map((s) => s.trim()).filter(Boolean)
        if (locTokensRaw.length > 0) {
            const expanded = Array.from(new Set(locTokensRaw.flatMap(expandLocationArea)))
            // Include original names too so properties stored under the parent region also match
            const allRegions = Array.from(new Set([...locTokensRaw, ...expanded]))
            filters.region = allRegions.join(',')
        }

        if (searchQuery.trim()) filters.search = searchQuery.trim()

        // Both price controls (overlay Price Range and the top-bar Budget quick filter) share the
        // currency picked in the Filters modal (filterState.priceCurrency). Properties don't carry a
        // currency field, so the backend can't compare minPrice/maxPrice against the right currency
        // per property — whichever control is active, we skip sending it to the server and instead
        // fetch the full matching set (all other filters still server-side) and filter/paginate it
        // client-side below, converting each property's price into the chosen currency first.
        const hasOverlayPriceFilter =
            (filterState.priceRange.min != null && filterState.priceRange.min > 0) ||
            (filterState.priceRange.max != null && filterState.priceRange.max > 0)
        const hasBudgetPriceFilter =
            appliedBudMin > BUDGET_SLIDER_MIN || appliedBudMax < BUDGET_SLIDER_MAX
        const hasCurrencyPriceFilter = hasOverlayPriceFilter || hasBudgetPriceFilter

        // Overlay Price Range wins over the Budget quick filter when both are set (same precedence
        // the server-side path used before).
        const effectiveMinPrice = hasOverlayPriceFilter
            ? filterState.priceRange.min
            : appliedBudMin > BUDGET_SLIDER_MIN
              ? appliedBudMin
              : null
        const effectiveMaxPrice = hasOverlayPriceFilter
            ? filterState.priceRange.max
            : appliedBudMax < BUDGET_SLIDER_MAX
              ? appliedBudMax
              : null

        if (filterState.bedrooms !== 'Any') {
            const rawBed =
                filterState.bedrooms === '5+' ? '5' : filterState.bedrooms
            const n = parseInt(String(rawBed), 10)
            if (!Number.isNaN(n) && n > 0) {
                filters.bedroomsQuantity = n
                filters.bedroomsCondition = '>'
            }
        } else if (bedrooms > 1) {
            filters.bedroomsQuantity = bedrooms
            filters.bedroomsCondition = '='
        }

        if (filterState.bathrooms !== 'Any') {
            const rawBath =
                filterState.bathrooms === '5+' ? '5' : filterState.bathrooms
            const n = parseInt(String(rawBath), 10)
            if (!Number.isNaN(n) && n > 0) {
                filters.bathroomsQuantity = n
                filters.bathroomsCondition = '>='
            }
        }

        if (
            filterState.listingStatusDropdown &&
            filterState.listingStatusDropdown !== 'All'
        ) {
            filters.listingStatus = filterState.listingStatusDropdown
        } else if (filterState.listingStatus.length > 0) {
            filters.listingStatus = filterState.listingStatus[0]
        }

        if (filterState.propertyType.length > 0) {
            filters.propertyType = filterState.propertyType.join(',')
        }

        if (filterState.squareFeet.min != null && filterState.squareFeet.min > 0) {
            filters.minSqm = filterState.squareFeet.min
        }
        if (filterState.squareFeet.max != null && filterState.squareFeet.max > 0) {
            filters.maxSqm = filterState.squareFeet.max
        }
        if (filterState.lotSize.min != null && filterState.lotSize.min > 0) {
            filters.minLotSize = filterState.lotSize.min
        }
        if (filterState.lotSize.max != null && filterState.lotSize.max > 0) {
            filters.maxLotSize = filterState.lotSize.max
        }
        if (filterState.yearBuilt.min != null && filterState.yearBuilt.min > 0) {
            filters.minYearBuilt = filterState.yearBuilt.min
        }
        if (filterState.yearBuilt.max != null && filterState.yearBuilt.max > 0) {
            filters.maxYearBuilt = filterState.yearBuilt.max
        }
        const minFloorsFilter = parseInt(filterState.floors, 10)
        if (Number.isFinite(minFloorsFilter) && minFloorsFilter > 0) {
            filters.minFloors = minFloorsFilter
        }
        if (filterState.floorLevel.min != null && filterState.floorLevel.min >= 0) {
            filters.minFloorLevel = filterState.floorLevel.min
        }
        if (filterState.floorLevel.max != null && filterState.floorLevel.max >= 0) {
            filters.maxFloorLevel = filterState.floorLevel.max
        }

        const geoArea = listGeoArea.trim()
        if (geoArea) {
            // "Glyfada"/"Voula" aren't real Property.area values (listings are tagged with the
            // specific sub-area) — expand so a broad pick still matches every sub-area under them.
            filters.area = Array.from(new Set(expandLocationArea(geoArea))).join(',')
        }
        else if (filterState.area !== 'All') filters.area = filterState.area

        if (filterState.view.length > 0) {
            filters.view = filterState.view.join(',')
        }

        const amenParts = [
            ...filterState.outdoor,
            ...filterState.luxuryIndoor,
        ].filter(Boolean)
        if (amenParts.length > 0) {
            filters.amenities = amenParts.join(',')
        }

        if (filterState.location.length > 0) {
            filters.locationFeatures = filterState.location.join(',')
        }

        if (sortOrder === 'asc') {
            filters.orderBy = 'sale_price'
            filters.orderDir = 'ASC'
        } else if (sortOrder === 'desc') {
            filters.orderBy = 'sale_price'
            filters.orderDir = 'DESC'
        }

        if (promoSlug && promoPage) {
            const itemIds = Array.isArray(promoPage.itemIds) ? promoPage.itemIds : []
            if (itemIds.length === 0) {
                return null
            }
            filters.ids = itemIds.join(',')
            // El set de ids ya fue curado en Loggia (incluye no publicadas): no re-exigir published,
            // o un item curado quedaría afuera por el default de "solo publicadas".
            filters.published = 'null'
        }

        return { filters, hasCurrencyPriceFilter, effectiveMinPrice, effectiveMaxPrice }
    }, [
        router.query.searchQuery,
        currentPage,
        location,
        listGeoArea,
        bedrooms,
        appliedBudMin,
        appliedBudMax,
        filterState,
        sortOrder,
        promoSlug,
        promoPage,
    ])

    const fetchListings = useCallback(async () => {
        if (!router.isReady || !filtersInitialized) return
        // Esperar a resolver la Promo Page antes de pegarle al catálogo (evita traer todo sin scope).
        if (promoSlug && !promoPage) return

        const built = buildFilters()
        if (!built) {
            setListTotal(0)
            setProperties([])
            return
        }
        const { filters, hasCurrencyPriceFilter, effectiveMinPrice, effectiveMaxPrice } = built

        setIsLoading(true)
        try {
            let finalData: any[]
            let total: number
            let pageSize: number

            if (hasCurrencyPriceFilter) {
                const allItems = await fetchAllPropertiesListResult(filters)
                let regionFiltered = allItems
                if (filters.region) {
                    const tokens = String(filters.region)
                        .split(',')
                        .map((s: string) => s.trim().toLowerCase())
                        .filter(Boolean)
                    regionFiltered = regionFiltered.filter((p: any) => matchesRegionTokens(p, tokens))
                }
                const currency = filterState.priceCurrency === 'usd' ? 'usd' : 'eur'
                const priceFiltered = regionFiltered.filter((p: any) => {
                    const converted = getPropertySalePriceInCurrency(p, currency, priceCurrencyHints)
                    if (effectiveMinPrice != null && effectiveMinPrice > 0 && converted < effectiveMinPrice) {
                        return false
                    }
                    if (effectiveMaxPrice != null && effectiveMaxPrice > 0 && converted > effectiveMaxPrice) {
                        return false
                    }
                    return true
                })
                total = priceFiltered.length
                pageSize = REAL_ESTATE_LIST_PAGE_SIZE
                const start = (currentPage - 1) * pageSize
                finalData = priceFiltered.slice(start, start + pageSize)
            } else {
                const result = await fetchPropertiesListResult(filters)
                finalData = result.items || []
                total = result.total
                pageSize = result.pageSize || REAL_ESTATE_LIST_PAGE_SIZE
                if (filters.region) {
                    const tokens = String(filters.region)
                        .split(',')
                        .map((s: string) => s.trim().toLowerCase())
                        .filter(Boolean)
                    finalData = finalData.filter((p: any) => matchesRegionTokens(p, tokens))
                }
            }

            const mapped = finalData.map((p: any) => ({
                ...p,
                images: Array.isArray(p?.images)
                    ? p.images.map((img: any) => ({
                          ...img,
                          urlImage: resolveMediaUrl(
                              img?.urlImage || img?.url || img?.image || ''
                          ),
                      }))
                    : [],
            }))
            setListTotal(total)
            setListPageSize(pageSize)
            setProperties(mapped)
        } catch (error) {
            console.error('Failed to load real estate list', error)
            setProperties([])
            setListTotal(0)
        } finally {
            setIsLoading(false)
        }
    }, [
        router.isReady,
        filtersInitialized,
        buildFilters,
        router.query.searchQuery,
        currentPage,
        listQueryVersion,
        location,
        listGeoArea,
        bedrooms,
        appliedBudMin,
        appliedBudMax,
        filterState,
        priceCurrencyHints,
        sortOrder,
        promoSlug,
        promoPage,
    ])

    useEffect(() => {
        void fetchListings()
    }, [fetchListings])

    // Map markers need EVERY property matching the current filters, not just the current
    // page — `properties` above is paginated for the card grid. Fetched only while the map
    // tab is open, via a lean endpoint (id/price/location/1 image) instead of walking every
    // page of the full listing — that used to pull the entire classification+all-images
    // payload (~1.5MB) across several sequential/parallel requests just to place pins.
    const [mapProperties, setMapProperties] = useState<any[]>([])
    // Hovering a list card highlights its pin on the map (bounce + info window), same visual as hovering the pin directly.
    const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)

    const fetchMapProperties = useCallback(async () => {
        if (!router.isReady || !filtersInitialized) return
        if (promoSlug && !promoPage) return

        const built = buildFilters()
        if (!built) {
            setMapProperties([])
            return
        }
        const { filters, hasCurrencyPriceFilter, effectiveMinPrice, effectiveMaxPrice } = built

        try {
            const res: any = await getRealEstateMapPins(filters)
            const allItems: any[] = Array.isArray(res?.data?.items) ? res.data.items : []
            let filtered = allItems
            if (filters.region) {
                const tokens = String(filters.region)
                    .split(',')
                    .map((s: string) => s.trim().toLowerCase())
                    .filter(Boolean)
                filtered = filtered.filter((p: any) => matchesRegionTokens(p, tokens))
            }
            if (hasCurrencyPriceFilter) {
                const currency = filterState.priceCurrency === 'usd' ? 'usd' : 'eur'
                filtered = filtered.filter((p: any) => {
                    const converted = getPropertySalePriceInCurrency(p, currency, priceCurrencyHints)
                    if (effectiveMinPrice != null && effectiveMinPrice > 0 && converted < effectiveMinPrice) {
                        return false
                    }
                    if (effectiveMaxPrice != null && effectiveMaxPrice > 0 && converted > effectiveMaxPrice) {
                        return false
                    }
                    return true
                })
            }

            const mapped = filtered.map((p: any) => ({
                ...p,
                images: Array.isArray(p?.images)
                    ? p.images.map((img: any) => ({
                          ...img,
                          urlImage: resolveMediaUrl(
                              img?.urlImage || img?.url || img?.image || ''
                          ),
                      }))
                    : [],
            }))
            setMapProperties(mapped)
        } catch (error) {
            console.error('Failed to load map properties', error)
            setMapProperties([])
        }
    }, [
        router.isReady,
        filtersInitialized,
        promoSlug,
        promoPage,
        buildFilters,
        filterState.priceCurrency,
        priceCurrencyHints,
    ])

    useEffect(() => {
        if (!showMap) return
        void fetchMapProperties()
    }, [showMap, fetchMapProperties])

    /**
     * Árbol estático de curated regions/areas + un "patch" por país con las sub-áreas reales
     * (Golf, etc.) traídas del backend. `regions: []` en el patch evita que se cuelen regiones/áreas
     * no curadas — solo aporta `subAreasByArea`, que el dropdown ya sabe fusionar.
     */
    const realEstateLocationTreeOptions = useMemo<LocationCountryGroup[]>(() => {
        if (realEstateSubAreasByCountry.length === 0) return REAL_ESTATE_LOCATION_FILTER_TREE
        return [
            ...REAL_ESTATE_LOCATION_FILTER_TREE,
            ...realEstateSubAreasByCountry
                .filter((g) => g.country && Object.keys(g.subAreasByArea || {}).length > 0)
                .map((g) => ({ country: g.country, regions: [], subAreasByArea: g.subAreasByArea })),
        ]
    }, [realEstateSubAreasByCountry])

    const barPickerTreeValue = useMemo<LocationTreeSelection>(
        () => {
            const leaves = pickerListGeoArea.trim()
                ? [pickerListGeoArea.trim()]
                : pickerLocation.split(',').map((s) => s.trim()).filter(Boolean);
            return {
                selectedCountry,
                regionValue: pickerLocation,
                area: pickerListGeoArea,
                scope: geoBarScope,
                displayRegion: geoBarDisplayRegion || undefined,
                selectedLeaves: leaves.length > 0 ? leaves : undefined,
            };
        },
        [selectedCountry, pickerLocation, pickerListGeoArea, geoBarScope, geoBarDisplayRegion],
    );

    const barAppliedTreeValue = useMemo<LocationTreeSelection>(
        () => {
            const leaves = listGeoArea.trim()
                ? [listGeoArea.trim()]
                : location.split(',').map((s) => s.trim()).filter(Boolean);
            return {
                selectedCountry,
                regionValue: location,
                area: listGeoArea,
                scope: geoBarScope,
                displayRegion: geoBarDisplayRegion || undefined,
                selectedLeaves: leaves.length > 0 ? leaves : undefined,
            };
        },
        [selectedCountry, location, listGeoArea, geoBarScope, geoBarDisplayRegion],
    );

    useEffect(() => {
        if (!filtersInitialized) return

        const tags: string[] = []
        if (location.trim() || listGeoArea.trim()) {
            tags.push(...locationSelectionDisplayTags(barAppliedTreeValue))
        }
        if (bedrooms > 1) tags.push(`${bedrooms} Bedrooms`)
        if (appliedBudMin > BUDGET_SLIDER_MIN || appliedBudMax < BUDGET_SLIDER_MAX) {
            tags.push(fmtBudgetBarLabel(appliedBudMin, appliedBudMax, budgetCurrencySymbol))
        }

        if (filterState.location?.length) tags.push(...filterState.location)
        if (filterState.area && filterState.area !== 'All') {
            tags.push(filterState.area)
        }
        if (filterState.bedrooms !== 'Any') {
            tags.push(`${filterState.bedrooms} Bedrooms`)
        }
        if (filterState.bathrooms !== 'Any') {
            tags.push(`${filterState.bathrooms} Bathrooms`)
        }
        if (filterState.floors !== 'Any') {
            tags.push(`${filterState.floors} Floors`)
        }
        {
            const { min: lvlMin, max: lvlMax } = filterState.floorLevel
            if (lvlMin != null && lvlMax != null) tags.push(`Floor ${lvlMin}–${lvlMax}`)
            else if (lvlMin != null) tags.push(`Floor ${lvlMin}+`)
            else if (lvlMax != null) tags.push(`Floor up to ${lvlMax}`)
        }
        const priceSym = filterState.priceCurrency === 'usd' ? '$' : '€'
        if (filterState.priceRange?.min) {
            tags.push(`Min ${priceSym}${filterState.priceRange.min}`)
        }
        if (filterState.priceRange?.max) {
            tags.push(`Max ${priceSym}${filterState.priceRange.max}`)
        }
        if (filterState.squareFeet?.min) {
            tags.push(`Min ${filterState.squareFeet.min}m²`)
        }
        if (filterState.squareFeet?.max) {
            tags.push(`Max ${filterState.squareFeet.max}m²`)
        }
        if (filterState.propertyType?.length) {
            tags.push(...filterState.propertyType)
        }
        if (
            filterState.listingStatusDropdown &&
            filterState.listingStatusDropdown !== 'All'
        ) {
            tags.push(filterState.listingStatusDropdown)
        } else if (filterState.listingStatus?.length) {
            tags.push(...filterState.listingStatus)
        }
        if (filterState.outdoor?.length) tags.push(...filterState.outdoor)
        if (filterState.luxuryIndoor?.length) {
            tags.push(...filterState.luxuryIndoor)
        }
        if (filterState.view?.length) tags.push(...filterState.view)

        const sqRE = typeof router.query.searchQuery === 'string' ? router.query.searchQuery.trim() : ''
        if (sqRE) tags.push(`Search: ${sqRE}`)

        const next = Array.from(new Set(tags))
        const a = JSON.stringify([...next].sort())
        const b = JSON.stringify([...activeFilters].sort())
        if (a !== b) setActiveFilters(next)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filtersInitialized,
        barAppliedTreeValue,
        location,
        listGeoArea,
        bedrooms,
        appliedBudMin,
        appliedBudMax,
        filterState,
        router.query.searchQuery,
    ])

    const removeFilter = (filter: string) => {
        setCurrentPage(1)
        if (filter.startsWith('Search: ')) {
            const nextQuery = { ...router.query }
            delete nextQuery.searchQuery
            router.push({ pathname: '/real-estate/list', query: nextQuery })
            return
        }
        setActiveFilters(prev => {
            const newFilters = prev.filter(f => f !== filter)

            const locTags =
                location.trim() || listGeoArea.trim()
                    ? locationSelectionDisplayTags(barAppliedTreeValue)
                    : [];
            const isGeoAreaChip =
                !!listGeoArea.trim() && filter === listGeoArea.trim();
            const isLocationLeafChip =
                !listGeoArea.trim() &&
                !!location.trim() &&
                locTags.some((t) => t.toLowerCase() === filter.toLowerCase());

            const clearBarLocation = () => {
                setLocation('');
                setListGeoArea('');
                setPickerLocation('');
                setPickerListGeoArea('');
                setSelectedCountry('');
                setGeoBarScope(undefined);
                setGeoBarDisplayRegion('');
            };

            if (isGeoAreaChip) {
                clearBarLocation();
            } else if (isLocationLeafChip) {
                const leaves = location.split(',').map((s) => s.trim()).filter(Boolean);
                if (locTags.length <= 1) {
                    clearBarLocation();
                } else {
                    const nextLeaves = leaves.filter(
                        (l) => l.toLowerCase() !== filter.toLowerCase(),
                    );
                    if (nextLeaves.length === 0) {
                        clearBarLocation();
                    } else {
                        const csv = nextLeaves.join(',');
                        setLocation(csv);
                        setListGeoArea('');
                        setPickerLocation(csv);
                        setPickerListGeoArea('');
                    }
                }
            } else if (filter === fmtBudgetBarLabel(appliedBudMin, appliedBudMax, budgetCurrencySymbol) && (appliedBudMin > BUDGET_SLIDER_MIN || appliedBudMax < BUDGET_SLIDER_MAX)) {
                setAppliedBudMin(BUDGET_SLIDER_MIN)
                setAppliedBudMax(BUDGET_SLIDER_MAX)
                setPickerBudMin(BUDGET_SLIDER_MIN)
                setPickerBudMax(BUDGET_SLIDER_MAX)
                setPickerBudMinInput('')
                setPickerBudMaxInput('')
            } else if (filter.includes('Bedrooms')) {
                const m = filter.match(/(\d+)\s+Bedrooms/)
                if (m && parseInt(m[1], 10) === bedrooms) {
                    setBedrooms(1)
                    setPickerBedrooms(1)
                }
            }

            if (filterState.location?.includes(filter)) {
                setFilterState(prev => ({ ...prev, location: prev.location?.filter(l => l !== filter) || [] }))
            } else if (filter === filterState.area) {
                setFilterState(prev => ({ ...prev, area: 'All' }))
            } else if (filter.endsWith(' Floors')) {
                setFilterState(prev => ({ ...prev, floors: 'Any' }))
            } else if (filter.startsWith('Floor ')) {
                setFilterState(prev => ({ ...prev, floorLevel: { min: null, max: null } }))
            } else if (filter.includes('Bedrooms')) {
                const bedroomsMatch = filter.match(/(\d+)\s+Bedrooms/)
                if (
                    bedroomsMatch &&
                    bedroomsMatch[1] === filterState.bedrooms
                ) {
                    setFilterState(prev => ({ ...prev, bedrooms: 'Any' }))
                }
            } else if (filter.includes('Bathrooms')) {
                const bathroomsMatch = filter.match(/(\d+)\s+Bathrooms/)
                if (bathroomsMatch && bathroomsMatch[1] === filterState.bathrooms) {
                    setFilterState(prev => ({ ...prev, bathrooms: 'Any' }))
                }
            } else if (filter.startsWith('Min ') && filter.endsWith('m²')) {
                setFilterState(prev => ({ ...prev, squareFeet: { ...prev.squareFeet, min: null } }))
            } else if (filter.startsWith('Max ') && filter.endsWith('m²')) {
                setFilterState(prev => ({ ...prev, squareFeet: { ...prev.squareFeet, max: null } }))
            } else if (filter.startsWith('Min ')) {
                setFilterState(prev => ({ ...prev, priceRange: { ...prev.priceRange, min: null } }))
            } else if (filter.startsWith('Max ')) {
                setFilterState(prev => ({ ...prev, priceRange: { ...prev.priceRange, max: null } }))
            } else if (filterState.propertyType?.includes(filter)) {
                setFilterState(prev => ({ 
                    ...prev, 
                    propertyType: prev.propertyType?.filter(p => p !== filter) || [] 
                }))
            } else if (filterState.listingStatus?.includes(filter)) {
                setFilterState(prev => ({ 
                    ...prev, 
                    listingStatus: prev.listingStatus?.filter(l => l !== filter) || [] 
                }))
            } else if (filter === filterState.listingStatusDropdown) {
                setFilterState(prev => ({
                    ...prev,
                    listingStatusDropdown: 'All',
                }))
            } else if (filterState.outdoor?.includes(filter)) {
                setFilterState(prev => ({ 
                    ...prev, 
                    outdoor: prev.outdoor?.filter(o => o !== filter) || [] 
                }))
            } else if (filterState.luxuryIndoor?.includes(filter)) {
                setFilterState(prev => ({ 
                    ...prev, 
                    luxuryIndoor: prev.luxuryIndoor?.filter(l => l !== filter) || [] 
                }))
            } else if (filterState.view?.includes(filter)) {
                setFilterState(prev => ({ 
                    ...prev, 
                    view: prev.view?.filter(v => v !== filter) || [] 
                }))
            }
            
            return newFilters
        })
    }

    const getPriceLabel = useCallback((property: any) => {
        if (property?.price_visibility === false) return 'Price on request'
        const sym = getPropertyPriceCurrencySymbol(property, priceCurrencyHints)
        if (property?.sale_price) {
            const numeric = Number(property.sale_price)
            if (Number.isFinite(numeric)) {
                return new Intl.NumberFormat('en-US', {
                    maximumFractionDigits: 0,
                }).format(numeric)
            }
        }

        const nightly =
            property?.price_per_night !== undefined
                ? Number(property.price_per_night)
                : NaN
        if (Number.isFinite(nightly)) {
            return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(nightly)} / Night`
        }

        return formatNightlyPriceLabel(property?.price_per_night, sym)
    }, [priceCurrencyHints])

    const onCardContainerClick = useCallback(
        (id: string | undefined) => {
            if (!id) return
            const property = properties.find((p: any) => p.id === id)
            setSelectedProperty(property)
            window.open(buildRealEstateDetailPath(property || { id }), '_blank', 'noopener,noreferrer')
        },
        [properties, setSelectedProperty]
    )

    const onBarLocationTreeChange = useCallback((next: LocationTreeSelection) => {
        setSelectedCountry(next.selectedCountry)
        setGeoBarScope(next.scope)
        setGeoBarDisplayRegion(next.displayRegion ?? '')
        if (next.selectedLeaves !== undefined) {
            const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)))
            if (uniq.length === 0) {
                setPickerLocation('')
                setPickerListGeoArea('')
            } else {
                setPickerLocation(uniq.join(','))
                setPickerListGeoArea(next.area ?? '')
            }
        } else {
            setPickerLocation(next.regionValue)
            setPickerListGeoArea(next.area || '')
        }
    }, [])

    const handleSearch = (options?: { syncUrl?: boolean; replaceUrl?: boolean }) => {
        const syncUrl = options?.syncUrl ?? false
        const replaceUrl = options?.replaceUrl ?? false
        const newBedrooms = pickerBedrooms
        const newSortOrder = pickerSortOrder
        const newBudMin = pickerBudMin
        const newBudMax = pickerBudMax
        const appliedLoc = pickerLocation
        const appliedGeo = pickerListGeoArea.trim()

        setLocation(appliedLoc)
        setListGeoArea(appliedGeo)
        setBedrooms(newBedrooms)
        setSortOrder(newSortOrder)
        setAppliedBudMin(newBudMin)
        setAppliedBudMax(newBudMax)
        setCurrentPage(1)
        setListQueryVersion((v) => v + 1)

        if (!syncUrl) return

        locationDropdownRef.current?.close()

        const params = new URLSearchParams()
        appendRealEstateListingSearchParams(
            params,
            filterState,
            { region: appliedLoc, area: appliedGeo },
            { bedrooms: newBedrooms }
        )
        if (!params.has('minPrice') && newBudMin > BUDGET_SLIDER_MIN) {
            params.set('minPrice', String(newBudMin))
        }
        if (!params.has('maxPrice') && newBudMax < BUDGET_SLIDER_MAX) {
            params.set('maxPrice', String(newBudMax))
        }
        if (appliedLoc) params.set('location', appliedLoc)
        if (newSortOrder === 'asc' || newSortOrder === 'desc') params.set('sortBy', newSortOrder)
        if (!params.has('bedroomsQuantity') && newBedrooms > 1) params.set('bedroomsQuantity', String(newBedrooms))
        params.delete('page')
        if (promoSlug) params.set('promo', promoSlug)

        const nextUrl = `/real-estate/list?${params.toString()}`
        // Auto-applied changes (sort, budget, bedrooms…) replace the entry so the link stays shareable
        // without filling the history; "Check Now" keeps pushing a new entry.
        if (replaceUrl) router.replace(nextUrl, undefined, { scroll: false })
        else router.push(nextUrl)
    }

    const handleSearchRef = useRef(handleSearch)
    handleSearchRef.current = handleSearch

    const autoFilterInitRef = useRef(false)
    useEffect(() => {
        if (!router.isReady) return
        if (!autoFilterInitRef.current) { autoFilterInitRef.current = true; return }
        const t = setTimeout(() => { handleSearchRef.current({ syncUrl: true, replaceUrl: true }) }, 600)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickerLocation, pickerListGeoArea, pickerBudMin, pickerBudMax, pickerBedrooms, pickerSortOrder, router.isReady])

    // Keeps the sticky map panel pinned right below the sticky filters bar, filling the rest of the viewport.
    useEffect(() => {
        const el = searchSectionRef.current
        if (!el || typeof ResizeObserver === 'undefined') return
        const observer = new ResizeObserver((entries) => {
            const height = entries[0]?.contentRect.height
            if (typeof height === 'number') setSearchSectionHeight(height)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleOpenFilters = () => {
        setShowFilters(true)
    }

    const handleCloseFilters = () => {
        setShowFilters(false)
    }

    const handleApplyFilters = (filters: RealEstateFilterState) => {
        setFilterState(filters)
        // The panel's sort select (mobile) edits the picker value; commit it with the rest of the filters.
        setSortOrder(pickerSortOrder)
        setShowFilters(false)
        setCurrentPage(1)
        setListQueryVersion((v) => v + 1)

        const params = new URLSearchParams()
        appendRealEstateListingSearchParams(
            params,
            filters,
            { region: location, area: listGeoArea },
            { bedrooms }
        )
        if (!params.has('minPrice') && appliedBudMin > BUDGET_SLIDER_MIN) {
            params.set('minPrice', String(appliedBudMin))
        }
        if (!params.has('maxPrice') && appliedBudMax < BUDGET_SLIDER_MAX) {
            params.set('maxPrice', String(appliedBudMax))
        }
        if (pickerSortOrder === 'asc' || pickerSortOrder === 'desc') params.set('sortBy', pickerSortOrder)
        params.delete('page')
        if (promoSlug) params.set('promo', promoSlug)
        router.push(`/real-estate/list?${params.toString()}`)
    }

    const totalPages = Math.max(
        1,
        Math.ceil(listTotal / Math.max(1, listPageSize))
    )

    // Mobile "Filters (n)" badge: everything in the active tags except the location tags (location has its own field).
    const mobileLocationTagCount =
        location.trim() || listGeoArea.trim() ? locationSelectionDisplayTags(barAppliedTreeValue).length : 0
    const mobileActiveFilterCount = Math.max(0, activeFilters.length - mobileLocationTagCount) + (sortOrder !== 'default' ? 1 : 0)


    return (
        <>
            <SeoHead
              title={!location && cmsSeoMeta.title ? cmsSeoMeta.title : getRealEstateLocationMeta(location).title}
              description={!location && cmsSeoMeta.description ? cmsSeoMeta.description : getRealEstateLocationMeta(location).description}
              imageUrl={!location ? (cmsSeoMeta.imageUrl || undefined) : undefined}
              canonicalPath={
                location
                  ? `${getSiteUrl()}/real-estate/list?location=${encodeURIComponent(location.split(',')[0]?.trim() ?? '')}`
                  : '/real-estate/list'
              }
            />
            <div>
                <div className='h-full mb-10 px-4 md:px-24'>
                    {/* Scrolls away: only the search bar stays pinned (navbarHeight stays 0 on purpose). */}
                    <div className="-mx-4 md:-mx-24">
                        <Navbar textBlack={true} scrollsAway="flow" />
                    </div>

                    <div className="w-full" style={{ paddingTop: navbarHeight }}>
                        {/* Breadcrumb */}
                        <nav
                            aria-label="Breadcrumb"
                            className='h-12 md:h-14 border-b border-[#E2E8EB] -mx-4 md:-mx-24 px-4 md:px-24'
                        >
                            <div className='mx-auto flex h-full w-full max-w-[1300px] items-center justify-between gap-4'>
                                <ol className='flex min-w-0 items-center gap-2 font-haas text-[12px] md:text-[13px] font-light text-[#506A70]'>
                                    <li className='hidden shrink-0 sm:block'>
                                        <Link href="/" className='transition-colors hover:text-[#172338] hover:underline underline-offset-4'>Home</Link>
                                    </li>
                                    <li aria-hidden className='hidden shrink-0 sm:block'><ChevronRight className='h-3.5 w-3.5 text-[#506A70]/50' strokeWidth={1.5} /></li>
                                    <li className='shrink-0'>
                                        <Link href="/real-estate" className='transition-colors hover:text-[#172338] hover:underline underline-offset-4'>Real Estate</Link>
                                    </li>
                                    <li aria-hidden className='shrink-0'><ChevronRight className='h-3.5 w-3.5 text-[#506A70]/50' strokeWidth={1.5} /></li>
                                    <li aria-current="page" className='min-w-0 truncate font-normal text-[#172338]'>
                                        {buildLocationTreeLabel(barAppliedTreeValue) || 'All locations'}
                                    </li>
                                </ol>
                                <Link
                                    href="/sell-with-us"
                                    className='inline-flex h-9 shrink-0 items-center gap-1.5 border border-[#172338] px-3 font-haas text-[10px] uppercase tracking-[0.16em] text-[#172338] transition-colors hover:bg-[#172338] hover:text-white md:gap-2 md:px-4 md:text-[11px] md:tracking-[0.2em]'
                                >
                                    <span>Sell with us</span>
                                    <ChevronRight className='h-3.5 w-3.5 shrink-0' strokeWidth={1.5} aria-hidden />
                                </Link>
                            </div>
                        </nav>

                        {/* Promo Page header */}
                        {promoPage && (
                            <div className="mt-6 px-0">
                                <h1 className="font-gtsuper text-2xl md:text-4xl font-light text-[#172338] mt-2 mb-2">
                                    {promoPage.title}
                                </h1>
                                {promoPage.description && (
                                    <p className="text-sm text-[#506A70] max-w-2xl">
                                        {promoPage.description}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Search Section — label row + layout matches villas/list */}
                        <div
                            ref={searchSectionRef}
                            className={`${promoPage ? 'mt-4' : 'mt-3 md:mt-8'} pt-3 md:pt-[20px] pb-3 md:pb-5 sticky z-30 bg-white -mx-4 md:-mx-24 px-4 md:px-24`}
                            style={{ top: navbarHeight }}
                        >
                            <div className="mx-auto w-full max-w-[1300px]">
                                <div className="hidden md:flex gap-2 text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-0">
                                    <div className="flex-[1.8] min-w-0 px-1">Location</div>
                                    <div className="flex-1 min-w-0 px-1">Budget</div>
                                    <div className="flex-1 min-w-0 px-1">Bedrooms</div>
                                    <div className="flex-1 min-w-0 px-1">Sort by Price</div>
                                    <div className="flex-[0.6] min-w-0" />
                                    <div className="flex-[0.8] min-w-0" />
                                </div>

                                <div className="flex flex-row gap-2">
                                    <div className="flex-[1.8] min-w-0">
                                        <LocationTreeDropdown
                                            ref={locationDropdownRef}
                                            options={realEstateLocationTreeOptions}
                                            loading={false}
                                            placeholder="Select location"
                                            triggerClassName="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14"
                                            value={barPickerTreeValue}
                                            onChange={onBarLocationTreeChange}
                                            multiSelect
                                            closeOnSelect={false}
                                            variant="editorial"
                                        />
                                    </div>

                                    <div className="hidden md:block flex-1 min-w-0">
                                        <PopoverPrimitive.Root>
                                            <PopoverPrimitive.Trigger asChild>
                                                <button
                                                    type="button"
                                                    className="flex h-[52px] w-full items-center justify-between gap-2 border border-[#D1D5DB] bg-white px-3 text-left focus:outline-none"
                                                >
                                                    <span className="truncate tabular-nums font-haas text-[14px] text-[#172338]">
                                                        {fmtBudgetBarLabel(pickerBudMin, pickerBudMax, budgetCurrencySymbol)}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-[#506A70]" aria-hidden />
                                                </button>
                                            </PopoverPrimitive.Trigger>
                                            <PopoverPrimitive.Portal>
                                                <PopoverPrimitive.Content
                                                    sideOffset={4}
                                                    align="start"
                                                    className="z-[10000] w-[min(100vw-2rem,22rem)] border border-gray-200 bg-white p-4 shadow-lg outline-none"
                                                >
                                                    <p className="mb-3 text-xs font-haas tabular-nums text-[#506A70]">
                                                        {fmtBudgetBarLabel(pickerBudMin, pickerBudMax, budgetCurrencySymbol)}
                                                    </p>
                                                    <SliderPrimitive.Root
                                                        className="relative flex w-full touch-none select-none items-center py-2"
                                                        min={BUDGET_SLIDER_MIN}
                                                        max={BUDGET_SLIDER_MAX}
                                                        step={BUDGET_SLIDER_STEP}
                                                        value={[pickerBudMin, pickerBudMax]}
                                                        onValueChange={(v) => {
                                                            const [a, b] = v
                                                            if (typeof a === 'number' && typeof b === 'number') {
                                                                setPickerBudMin(a)
                                                                setPickerBudMax(b)
                                                                setPickerBudMinInput(a > BUDGET_SLIDER_MIN ? String(a) : '')
                                                                setPickerBudMaxInput(b < BUDGET_SLIDER_MAX ? String(b) : '')
                                                            }
                                                        }}
                                                        aria-label="Budget range"
                                                    >
                                                        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#506A70]/20">
                                                            <SliderPrimitive.Range className="absolute h-full bg-[#506A70]" />
                                                        </SliderPrimitive.Track>
                                                        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#506A70]/60 bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]/40" />
                                                        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#506A70]/60 bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]/40" />
                                                    </SliderPrimitive.Root>
                                                    <div className="mt-3 flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="mb-1 block text-xs font-haas text-[#506A70]">Min</label>
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                placeholder={`${budgetCurrencySymbol}0`}
                                                                value={fmtBudgetInputDigits(pickerBudMinInput)}
                                                                onChange={(e) => {
                                                                    const v = e.target.value.replace(/\D/g, '')
                                                                    setPickerBudMinInput(v)
                                                                    const n = Number(v)
                                                                    if (v !== '' && !Number.isNaN(n)) {
                                                                        setPickerBudMin(Math.min(n, pickerBudMax - BUDGET_SLIDER_STEP))
                                                                    } else if (v === '') {
                                                                        setPickerBudMin(BUDGET_SLIDER_MIN)
                                                                    }
                                                                }}
                                                                className="w-full border border-gray-300 px-2 py-1.5 text-sm font-haas text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#506A70]/40"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="mb-1 block text-xs font-haas text-[#506A70]">Max</label>
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                placeholder="Any"
                                                                value={fmtBudgetInputDigits(pickerBudMaxInput)}
                                                                onChange={(e) => {
                                                                    const v = e.target.value.replace(/\D/g, '')
                                                                    setPickerBudMaxInput(v)
                                                                    const n = Number(v)
                                                                    if (v !== '' && !Number.isNaN(n) && n > 0) {
                                                                        setPickerBudMax(Math.max(n, pickerBudMin + BUDGET_SLIDER_STEP))
                                                                    } else if (v === '') {
                                                                        setPickerBudMax(BUDGET_SLIDER_MAX)
                                                                    }
                                                                }}
                                                                className="w-full border border-gray-300 px-2 py-1.5 text-sm font-haas text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#506A70]/40"
                                                            />
                                                        </div>
                                                    </div>
                                                </PopoverPrimitive.Content>
                                            </PopoverPrimitive.Portal>
                                        </PopoverPrimitive.Root>
                                    </div>

                                    <div className="hidden md:block md:flex-1 md:min-w-0">
                                        <div className="flex items-center h-[52px] border border-[#D1D5DB]">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPickerBedrooms((prev) => (prev <= 2 ? 1 : prev - 1))
                                                }
                                                className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-r border-[#D1D5DB] text-lg leading-none"
                                            >
                                                −
                                            </button>
                                            <span className="flex-1 text-center font-haas text-[14px] text-[#172338] select-none">
                                                {pickerBedrooms <= 1 ? 'Any' : pickerBedrooms}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setPickerBedrooms((prev) => prev + 1)}
                                                className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-l border-[#D1D5DB] text-lg leading-none"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden md:block md:flex-1 md:min-w-0 relative">
                                        <PriceSortSelect
                                            value={pickerSortOrder}
                                            onChange={setPickerSortOrder}
                                            triggerClassName="h-[52px] border border-[#D1D5DB] pl-3 pr-3"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleOpenFilters}
                                        className="h-[52px] shrink-0 px-4 md:px-0 md:w-full md:flex-[0.6] md:min-w-0 bg-white border border-[#D1D5DB] hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2"
                                    >
                                        <span className="font-haas text-[#172338] text-[14px]">Filters</span>
                                        {mobileActiveFilterCount > 0 && (
                                            <span className="md:hidden flex h-5 min-w-5 items-center justify-center rounded-full bg-[#172338] px-1 font-haas text-[11px] text-white">
                                                {mobileActiveFilterCount}
                                            </span>
                                        )}
                                        <SlidersHorizontal className="h-3.5 w-3.5 text-[#172338]" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearch({ syncUrl: true })}
                                        className="hidden md:flex h-[52px] w-full md:flex-[0.8] md:min-w-0 bg-[#28F6EA] hover:brightness-95 transition items-center justify-center gap-2"
                                    >
                                        <span className="font-haas text-[#172338] text-[14px] whitespace-nowrap">
                                            Check Now
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 text-[#172338] shrink-0" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Property Listings */}
                        <div className="mb-10 mt-10">
                        <div className="flex justify-center items-start">
                            <div className="w-full max-w-[1300px]">
                                {activeFilters.length > 0 && (
                                    <div className="flex items-center gap-2 flex-wrap mb-6 px-4 md:px-0">
                                        {activeFilters.map((filter) => (
                                            <div
                                                key={filter}
                                                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5 text-sm font-haas text-[#172338]"
                                            >
                                                <span>{filter}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFilter(filter)}
                                                    className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                                    aria-label={`Remove ${filter} filter`}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Results Count and Show Map */}
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 mb-6 md:mb-10 px-4 md:px-0">
                                    <p className="text-[#D99330] text-lg">
                                        {listTotal} Properties Found
                                    </p>
                                    <button
                                        onClick={() => setShowMap(!showMap)}
                                        className={`flex items-center gap-2 px-4 h-9 border font-haas text-[13px] transition ${
                                            showMap
                                                ? 'bg-[#172338] text-white border-[#172338]'
                                                : 'bg-white text-[#172338] border-[#D1D5DB] hover:border-[#172338]'
                                        }`}
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>Map view</span>
                                    </button>
                                </div>

                                {showMap ? (
                                    <div className="flex flex-col-reverse md:flex-row md:items-start gap-6">
                                        <div className="w-full md:w-2/3 px-4 md:px-0">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 w-full">
                                                {(isLoading || promoResolving) ? (
                                                    Array.from({ length: 4 }).map((_, i) => (
                                                        <RealEstateListCardSkeleton key={i} />
                                                    ))
                                                ) : (
                                                    properties.map((property: any, i: number) => {
                                                        const propertyId = property?.id
                                                        return (
                                                            <div
                                                                key={property?.id ?? `map-${i}`}
                                                                className="w-full"
                                                                onMouseEnter={() => propertyId && setHoveredPropertyId(String(propertyId))}
                                                                onMouseLeave={() => setHoveredPropertyId((prev) => (prev === String(propertyId) ? null : prev))}
                                                            >
                                                                <PropertieCard
                                                                    onClick={() =>
                                                                        onCardContainerClick(propertyId)
                                                                    }
                                                                    villaImage={realEstateListCardImageUrl(
                                                                        getPrimaryImageRawUrl(property),
                                                                        shouldWatermarkImage(property?.watermarkPhotos, 'real-estate')
                                                                    )}
                                                                    title={property?.title || ''}
                                                                    location={getRealEstateCardLocationLabel(property || {})}
                                                                    capa1="/images/capa-1-4@2x.png"
                                                                    price={getPriceLabel(property)}
                                                                    saleListingCurrency={getPropertySaleListingCurrency(property, priceCurrencyHints)}
                                                                    bedrooms={
                                                                        property?.classification?.bedrooms || 0
                                                                    }
                                                                    bathrooms={getRealEstateBathrooms(property?.classification)}
                                                                    yearBuilt={getRealEstateYearBuilt(property?.classification)}
                                                                    salePriceNumeric={Number(property?.sale_price) || null}
                                                                    guests={0}
                                                                    plotSqm={getRealEstatePlotSqm(property?.classification)}
                                                                    buildSqm={getRealEstateBuildSqm(property?.classification)}
                                                                    pools={countPoolsForRealEstateCard(property?.classification)}
                                                                    isLand={
                                                                        String(property?.classification?.type || '').toLowerCase() === 'land'
                                                                    }
                                                                    rental={false}
                                                                    {...getRealEstateCardExtras(property)}
                                                                    liked={Boolean(
                                                                        propertyId &&
                                                                            isLiked(propertyId)
                                                                    )}
                                                                    onToggleFavorite={
                                                                        propertyId
                                                                            ? () =>
                                                                                  toggleFavorite(
                                                                                      propertyId
                                                                                  )
                                                                            : undefined
                                                                    }
                                                                    isTogglingFavorite={Boolean(
                                                                        propertyId &&
                                                                            pendingIds.has(propertyId)
                                                                    )}
                                                                />
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className="w-full md:w-1/3 md:sticky md:self-start px-4 md:px-0"
                                            style={{ top: searchSectionHeight ? navbarHeight + searchSectionHeight : undefined }}
                                        >
                                            <MapPanel
                                                mapProperties={mapProperties}
                                                priceCurrencyHints={priceCurrencyHints}
                                                getPriceLabel={getPriceLabel}
                                                hoveredPropertyId={hoveredPropertyId}
                                                setHoveredPropertyId={setHoveredPropertyId}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full px-4 md:px-0">
                                        {(isLoading || promoResolving) ? (
                                            Array.from({ length: 6 }).map((_, i) => (
                                                <RealEstateListCardSkeleton key={i} />
                                            ))
                                        ) : (
                                            properties.map((property: any, i: number) => {
                                                const propertyId = property?.id
                                                return (
                                                    <div
                                                        key={property?.id ?? `list-${i}`}
                                                        className="w-full"
                                                    >
                                                        <PropertieCard
                                                            onClick={() =>
                                                                onCardContainerClick(propertyId)
                                                            }
                                                            villaImage={realEstateListCardImageUrl(
                                                                getPrimaryImageRawUrl(property),
                                                                shouldWatermarkImage(property?.watermarkPhotos, 'real-estate')
                                                            )}
                                                            title={property?.title || ''}
                                                            location={getRealEstateCardLocationLabel(property || {})}
                                                            capa1="/images/capa-1-4@2x.png"
                                                            price={getPriceLabel(property)}
                                                            saleListingCurrency={getPropertySaleListingCurrency(property, priceCurrencyHints)}
                                                            bedrooms={
                                                                property?.classification?.bedrooms || 0
                                                            }
                                                            bathrooms={getRealEstateBathrooms(property?.classification)}
                                                            yearBuilt={getRealEstateYearBuilt(property?.classification)}
                                                            salePriceNumeric={Number(property?.sale_price) || null}
                                                            guests={0}
                                                            plotSqm={getRealEstatePlotSqm(property?.classification)}
                                                            buildSqm={getRealEstateBuildSqm(property?.classification)}
                                                            pools={countPoolsForRealEstateCard(property?.classification)}
                                                            isLand={
                                                                String(property?.classification?.type || '').toLowerCase() === 'land'
                                                            }
                                                            rental={false}
                                                            {...getRealEstateCardExtras(property)}
                                                            liked={Boolean(
                                                                propertyId && isLiked(propertyId)
                                                            )}
                                                            onToggleFavorite={
                                                                propertyId
                                                                    ? () => toggleFavorite(propertyId)
                                                                    : undefined
                                                            }
                                                            isTogglingFavorite={Boolean(
                                                                propertyId &&
                                                                    pendingIds.has(propertyId)
                                                            )}
                                                        />
                                                    </div>
                                                )
                                            })
                                        )}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12 px-4 md:px-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePageChange(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                            className="flex items-center justify-center w-10 h-10 border border-[#1f3440] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            aria-label="Previous page"
                                        >
                                            <ChevronRight className="w-4 h-4 rotate-180" />
                                        </button>

                                        {Array.from(
                                            { length: totalPages },
                                            (_, i) => i + 1
                                        ).map((page) => {
                                            const isFirst = page === 1
                                            const isLast = page === totalPages
                                            const isNearCurrent =
                                                Math.abs(page - currentPage) <= 1
                                            if (
                                                !isFirst &&
                                                !isLast &&
                                                !isNearCurrent
                                            ) {
                                                if (
                                                    page === 2 ||
                                                    page === totalPages - 1
                                                ) {
                                                    return (
                                                        <span
                                                            key={page}
                                                            className="text-[#506A70] px-1"
                                                        >
                                                            …
                                                        </span>
                                                    )
                                                }
                                                return null
                                            }
                                            return (
                                                <button
                                                    type="button"
                                                    key={page}
                                                    onClick={() =>
                                                        handlePageChange(page)
                                                    }
                                                    className={`w-10 h-10 border font-haas text-sm transition ${
                                                        currentPage === page
                                                            ? 'bg-[#172338] text-white border-[#172338]'
                                                            : 'border-[#1f3440] text-[#172338] hover:bg-[#172338] hover:text-white'
                                                    }`}
                                                    aria-label={`Page ${page}`}
                                                    aria-current={
                                                        currentPage === page
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            )
                                        })}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePageChange(currentPage + 1)
                                            }
                                            disabled={currentPage === totalPages}
                                            className="flex items-center justify-center w-10 h-10 border border-[#1f3440] text-[#172338] hover:bg-[#172338] hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            aria-label="Next page"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            <Footer disableTravelSection={true} disableDataLoading={true} />
            
            {/* Real Estate Filter Overlay */}
            <RealEstateFilterOverlay
                isOpen={showFilters}
                onClose={handleCloseFilters}
                onApplyFilters={handleApplyFilters}
                initialFilters={filterState}
                sortOrder={pickerSortOrder}
                onSortOrderChange={setPickerSortOrder}
            />
        </>
    )
}

export default KennedysRealStateList
