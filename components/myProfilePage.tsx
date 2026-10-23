import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Camera,
  ChevronRight,
  ClipboardList,
  FileSignature,
  FileText,
  Handshake,
  Heart,
  Lock,
  LogOut,
  MapPin,
  MessageSquareWarning,
  Pencil,
  User as UserIcon,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { ConciergeCard } from '@/components/ConciergeCard'
import usePropertyStore from '@/store/propertyStore'
import { useAuth } from '@/src/contexts/AuthContext'
import type { User as AuthUser } from '@/src/types/auth'
import { getUserById, patchUser, uploadProfilePicture, removeProfilePicture } from '@/lib/api/user'
import { requestEmailChange } from '@/lib/api/auth'
import { getUserPropertyLikes, togglePropertyLike } from '@/lib/api/propertyLikes'
import { getUserServiceLikes } from '@/lib/api/serviceLikes'
import { getOffersForClient } from '@/lib/api/offers'
import { getItinerariesForClient } from '@/lib/api/itineraries'
import { getMyOwnedProperties, getOwnerPropertyReport, getOwnerPropertyBookings } from '@/lib/api/ownerReports'
import {
  OwnerReportSection,
  KpiStrip,
  MonthlyBars,
  YearlyPerformanceBars,
  YearlyPerformanceTable,
  YearlyPerformanceInsights,
  NegotiationsTable,
  BookingsTable as OwnerBookingsTable,
} from '@/components/owner-reports/OwnerReportPage'
import { ContractsList } from '@/components/owner-reports/ContractsList'
import { ComplaintsList } from '@/components/owner-reports/ComplaintsList'
import type { OwnedPropertySummary, OwnerReport, OwnerReportBooking } from '@/src/types/ownerReport'

const AvailabilityCalendar = dynamic(() => import('@/components/custom/AvailabilityCalendar'), { ssr: false })
import {
  formatNightlyPriceLabel,
  resolveMediaUrl,
  heroImageDirectUrl,
  slugify,
  getPropertySaleListingCurrency,
  getRealEstateCardLocationLabel,
} from '@/lib/utils'
import {
  formatPoolsJacuzziSpecLine,
  countPoolsForRealEstateCard,
  getRealEstateBathrooms,
  getRealEstateBuildSqm,
  getRealEstatePlotSqm,
  getRealEstateYearBuilt,
} from '@/lib/propertyPoolCounts'
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark'
import { PropertieCard } from '@/components/custom/propertieCard'
import { buildRentalDetailPath, buildRealEstateDetailPath } from '@/lib/rentalRoute'
import { getConciergeServicePath, mapServiceToPreview } from '@/lib/mappers/concierge'
import {
  getEventFavoriteEntriesForUser,
  removeEventFavoriteEntry,
  type EventFavoriteEntry,
} from '@/src/hooks/useEventFavorites'

type FavoriteProperty = {
  id: string
  title: string
  location: string
  price: string
  fromText: boolean
  villaImage: string
  bedrooms: number
  guests: number
  rental: boolean
  liked: boolean
  raw: any
}

const DEFAULT_VILLA_IMAGE = '/images/villa-placeholder.jpg'

const SkeletonBar = ({ className = '' }: { className?: string }) => (
  <div
    className={`rounded-md bg-[#E9E9E9]/80 animate-pulse ${className}`}
    aria-hidden
  />
)

const ProfileSectionSkeleton = () => (
  <div className="flex flex-col w-full" aria-busy="true" aria-label="Loading profile">
    <div className="space-y-3 pb-6 border-b border-[#e5e0d8]">
      <SkeletonBar className="h-2.5 w-16" />
      <SkeletonBar className="h-8 w-64" />
    </div>
    {[0, 1, 2].map((i) => (
      <div key={i} className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-12 py-10 border-b border-[#e5e0d8]">
        <div className="space-y-3">
          <SkeletonBar className="h-5 w-40" />
          <SkeletonBar className="h-3 w-52" />
          <SkeletonBar className="h-3 w-16" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          {[0, 1, 2, 3].map((j) => (
            <div key={j} className="space-y-2">
              <SkeletonBar className="h-2.5 w-20" />
              <SkeletonBar className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)

const FavoritesGridSkeleton = () => (
  <div className="w-full" aria-busy="true" aria-label="Loading favourites">
    <div className="flex items-center justify-between mb-6">
      <SkeletonBar className="h-6 w-52" />
      <SkeletonBar className="h-9 w-40 rounded" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white overflow-hidden shadow-sm">
          <SkeletonBar className="h-52 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <SkeletonBar className="h-5 w-4/5" />
            <SkeletonBar className="h-3.5 w-3/5" />
            <SkeletonBar className="h-3.5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const TripsSectionSkeleton = () => (
  <div className="w-full space-y-4" aria-busy="true" aria-label="Loading trips">
    <SkeletonBar className="h-6 w-36 mb-4" />
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex gap-4 bg-white rounded-[10px] shadow-sm p-4">
        <SkeletonBar className="h-20 w-20 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-3 py-1">
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-1/2" />
          <SkeletonBar className="h-3 w-24" />
        </div>
      </div>
    ))}
  </div>
)

// Función para obtener el precio desde la fecha actual usando availabilityRanges
const getPriceFromCurrentDate = (property: any): number | null => {
  if (!property?.availabilityRanges || !Array.isArray(property.availabilityRanges) || property.availabilityRanges.length === 0) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  // Buscar el rango que contiene la fecha actual
  for (const range of property.availabilityRanges) {
    if (range.is_available === true && range.price_per_night) {
      const start = new Date(range.from)
      start.setHours(0, 0, 0, 0)
      const end = new Date(range.to)
      end.setHours(23, 59, 59, 999)

      if (today >= start && today <= end) {
        // Verificar que la fecha no esté en disabled_dates
        const disabledDates = Array.isArray(range.disabled_dates) 
          ? range.disabled_dates.map((d: string | Date) => {
              if (d instanceof Date) return d.toISOString().split('T')[0]
              if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d
              const parsed = new Date(d)
              return !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : null
            }).filter((d: string | null): d is string => d !== null)
          : []

        if (!disabledDates.includes(todayStr)) {
          return range.price_per_night
        }
      }
    }
  }

  return null
}

const normalizePrice = (property: any) => {
  if (property?.rental) {
    // Intentar obtener el precio desde la fecha actual usando availabilityRanges
    const currentDatePrice = getPriceFromCurrentDate(property)
    
    if (currentDatePrice !== null) {
      // Si hay precio disponible desde la fecha actual, usarlo
      const nightlyLabel = formatNightlyPriceLabel(currentDatePrice)
      const isFromLabel = /^from\s/i.test(nightlyLabel)
      const sanitizedLabel = isFromLabel ? nightlyLabel.replace(/^from\s+/i, '') : nightlyLabel

      return {
        price: sanitizedLabel,
        fromText: isFromLabel,
      }
    }

    // Si no hay availabilityRanges o no hay precio para la fecha actual, usar price_per_night
    if (property?.price_per_night) {
      const nightlyLabel = formatNightlyPriceLabel(property.price_per_night)
      const isFromLabel = /^from\s/i.test(nightlyLabel)
      const sanitizedLabel = isFromLabel ? nightlyLabel.replace(/^from\s+/i, '') : nightlyLabel

      return {
        price: sanitizedLabel,
        fromText: isFromLabel,
      }
    }

    // Si no hay precio disponible, mostrar "Price on request"
    return {
      price: 'Price on request',
      fromText: false,
    }
  }

  const salePrice = property?.sale_price
  if (!salePrice) {
    return {
      price: 'Price on request',
      fromText: false,
    }
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(salePrice))

  return {
    price: formatted,
    fromText: false,
  }
}

/**
 * Alineado con `resolveLibraryPath` en el API: imágenes de villa = `uploads/properties/<file>`.
 * Corrige solo rutas legacy `uploads/images/` → `uploads/properties/`.
 */
const fixPropertyMediaPath = (input?: string | null): string => {
  if (input == null || String(input).trim() === '') return ''
  let s = String(input).trim()
  if (/^https?:\/\//i.test(s)) return s
  s = s.replace(/^\/+/, '')
  if (/^uploads\/images\//i.test(s)) {
    return s.replace(/^uploads\/images\//i, 'uploads/properties/')
  }
  if (/^properties\//i.test(s) && !/^uploads\//i.test(s)) {
    return `uploads/${s}`
  }
  return s
}

const extractImages = (property: any) => {
  if (Array.isArray(property?.images) && property.images.length > 0) {
    return property.images.map((img: any) =>
      typeof img === 'string'
        ? { urlImage: img, url: img, isPrimary: false, order: 0 }
        : img,
    )
  }

  if (Array.isArray(property?.libraries) && property.libraries.length > 0) {
    return property.libraries.map((library: any) => {
      const lib = library?.dataValues ?? library
      const existing = lib?.urlImage || lib?.url
      const fn = lib?.filename != null ? String(lib.filename).replace(/^\/+/, '') : ''
      const type = lib?.type || 'Image'
      let urlImage =
        existing && String(existing).trim() ? String(existing).trim() : ''
      if (!urlImage && fn) {
        if (/^https?:\/\//i.test(fn) || fn.startsWith('uploads/')) {
          urlImage = fn
        } else {
          const base = type === 'File' ? 'uploads/documents/' : 'uploads/properties/'
          urlImage = `${base}${fn}`
        }
      }
      return {
        urlImage,
        url: urlImage,
        isPrimary: lib?.isPrimary ?? false,
        order: lib?.order ?? 0,
      }
    })
  }

  return []
}

const VILLA_LIST_PLACEHOLDER = '/images/villa-detail@2x.png'

/** Same guest line as `pages/villas/list`. */
function getVillaGuestDisplay(villa: any): string | number {
  const c = villa?.classification
  const maxP = c?.maxPersons
  const ideal = c?.idealPersons
  const positive = [maxP, ideal].find((v) => typeof v === 'number' && Number.isFinite(v) && v > 0)
  if (positive !== undefined) return positive
  if (typeof maxP === 'number' && Number.isFinite(maxP)) return maxP
  if (typeof ideal === 'number' && Number.isFinite(ideal)) return ideal
  const raw = villa?.guests
  if (raw == null || raw === '') return 'N/A'
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const digits = parseInt(String(raw).replace(/[^\d]/g, ''), 10)
  if (!Number.isNaN(digits) && digits > 0) return digits
  const s = String(raw).trim()
  return s || 'N/A'
}

/** Hero URL aligned with villas list + `extractImages` when API solo envía `libraries`. */
function getVillaListHeroUrl(property: any): string {
  let images = property?.images
  if (!Array.isArray(images) || images.length === 0) {
    images = extractImages(property)
  }
  if (!Array.isArray(images) || images.length === 0) return VILLA_LIST_PLACEHOLDER
  const primary = images.find((img: any) => {
    const p = img?.isPrimary ?? img?.is_primary ?? img?.primary
    return p === true || p === 'true' || p === 1
  })
  const entry = primary ?? images[0]
  const raw = typeof entry === 'string' ? entry : (entry?.urlImage ?? entry?.url ?? entry?.image ?? '')
  if (!raw || String(raw).trim() === '') return VILLA_LIST_PLACEHOLDER
  if (/^https?:\/\//i.test(raw)) return raw
  const fixed = fixPropertyMediaPath(raw)
  const resolved = fixed ? resolveMediaUrl(fixed) : ''
  return resolved && resolved.trim() !== '' ? resolved : VILLA_LIST_PLACEHOLDER
}

function getRentalListDisplayPrice(villa: any): string {
  if (villa?.price_visibility === false) return 'Price on request'
  const currentDatePrice = getPriceFromCurrentDate(villa)
  if (currentDatePrice !== null && currentDatePrice > 0) {
    return formatNightlyPriceLabel(currentDatePrice, '€ ')
  }
  const pricePerNight = villa.price_per_night
  const pricePerNightNum =
    pricePerNight !== null && pricePerNight !== undefined && pricePerNight !== ''
      ? Number(pricePerNight)
      : NaN
  if (pricePerNightNum !== null && pricePerNightNum > 0) {
    return formatNightlyPriceLabel(pricePerNightNum, '€ ')
  }
  return 'Price on request'
}

function getRealEstateListFirstImageResolved(property: any): string {
  const imgs =
    Array.isArray(property?.images) && property.images.length > 0
      ? property.images
      : extractImages(property)
  const first = imgs?.[0]
  const raw = typeof first === 'string' ? first : (first?.urlImage ?? first?.url ?? '')
  if (!raw || String(raw).trim() === '') return '/images/villa-placeholder.jpg'
  if (/^https?:\/\//i.test(raw)) return raw
  const fixed = fixPropertyMediaPath(raw)
  const resolved = fixed ? resolveMediaUrl(fixed) : ''
  return resolved && resolved.trim() !== '' ? resolved : '/images/villa-placeholder.jpg'
}

/** Same image pipeline as `pages/real-estate/list` (primary image + optional watermark). */
function getRealEstateListCardImage(property: any): string {
  const images = property?.images
  let raw: string | undefined
  if (Array.isArray(images) && images.length > 0) {
    const primary = images.find((img: any) => {
      const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary
      return isPrimary === true || isPrimary === 'true' || isPrimary === 1
    })
    raw = (primary ?? images[0])?.urlImage
  }
  const resolved = heroImageDirectUrl(raw?.trim() ? raw : getRealEstateListFirstImageResolved(property))
  return shouldWatermarkImage(property?.watermarkPhotos, 'real-estate') ? watermarkedImageUrl(resolved) : resolved
}

/** Same label as `getPriceLabel` in `pages/real-estate/list`. */
function getRealEstateFavoritePriceLabel(property: any): string {
  if (property?.price_visibility === false) return 'Price on request'
  if (property?.sale_price) {
    const numeric = Number(property.sale_price)
    if (Number.isFinite(numeric)) {
      return new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(numeric)
    }
  }

  const nightly =
    property?.price_per_night !== undefined ? Number(property.price_per_night) : NaN
  if (Number.isFinite(nightly)) {
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(nightly)} / Night`
  }

  return formatNightlyPriceLabel(property?.price_per_night, '€ ')
}

const mapLikedPropertyToFavorite = (property: any): FavoriteProperty => {
  if (!property?.id) {
    throw new Error('Invalid property payload received while mapping favourites')
  }

  const images = extractImages(property)
  const sortedImages = images
    .slice()
    .sort((a: any, b: any) => {
      if (a?.isPrimary && !b?.isPrimary) return -1
      if (!a?.isPrimary && b?.isPrimary) return 1
      return (a?.order ?? 0) - (b?.order ?? 0)
    })

  const firstImage = sortedImages?.[0]
  const rawImg = firstImage?.urlImage || firstImage?.url || ''
  const normalizedPath = fixPropertyMediaPath(rawImg)
  const resolved = normalizedPath ? resolveMediaUrl(normalizedPath) : ''
  const finalBase =
    resolved && resolved !== '' && resolved !== 'undefined' ? resolved : DEFAULT_VILLA_IMAGE
  const finalImage = heroImageDirectUrl(finalBase)

  const classification = property?.classification ?? {}
  const bedrooms = classification?.bedrooms ?? 0
  const guests = classification?.idealPersons ?? classification?.maxPersons ?? 0

  const location =
    property?.location ||
    property?.visibleLocation ||
    [property?.region, property?.country].filter(Boolean).join(', ') ||
    ''

  const { price, fromText } = normalizePrice(property)

  return {
    id: String(property.id),
    title: property.title ?? 'Unnamed Property',
    location,
    price,
    fromText,
    villaImage: finalImage,
    bedrooms,
    guests,
    rental: Boolean(property?.rental ?? true),
    liked: true,
    raw: property,
  }
}

type FavoriteServiceRow = {
  id: string
  title: string
  image: string
  detailPath: string
  subtitle: string
  description: string
  price: string | null
  serviceType: string
  raw: any
}

const mapLikedServiceToRow = (service: any): FavoriteServiceRow => {
  const preview = mapServiceToPreview(service)
  if (!preview?.id) {
    throw new Error('Invalid service payload received while mapping favourites')
  }
  let img = preview.image || '/images/outdoor-image.png'
  if (!img.startsWith('/') && !/^https?:\/\//i.test(img)) {
    img = resolveMediaUrl(img) || img
  }
  return {
    id: String(preview.id),
    title: preview.name || 'Concierge service',
    image: img,
    detailPath: getConciergeServicePath({
      location: preview.location,
      type: preview.type,
      name: preview.name,
    }),
    subtitle: preview.type || '',
    description: preview.description || '',
    price: preview.price ?? null,
    serviceType: preview.type || '',
    raw: service,
  }
}

type ProfileFavoriteRow =
  | { kind: 'property'; sortTitle: string; property: FavoriteProperty }
  | { kind: 'service'; sortTitle: string; service: FavoriteServiceRow }
  | { kind: 'event'; sortTitle: string; event: EventFavoriteEntry }

interface MyProfilePageProps {
  initialTab?: string
}

type ProfileNavTab =
  | 'profile'
  | 'favorites'
  | 'bookings'
  | 'offers'
  | 'reports'
  | 'ownerCalendar'
  | 'ownerBookings'
  | 'ownerNegotiations'
  | 'ownerAnalytics'
  | 'ownerFigures'
  | 'ownerContracts'
  | 'ownerComplaints'

const PROFILE_NAV_TABS: readonly ProfileNavTab[] = [
  'profile',
  'favorites',
  'bookings',
  'offers',
  'ownerCalendar',
  'ownerBookings',
  'ownerNegotiations',
  // 'ownerAnalytics', // temporarily disabled — its revenue content moved to ownerFigures
  'ownerFigures',
  'ownerContracts',
  'ownerComplaints',
  'reports',
]

/** All owner-only tabs (property-scoped) — visible only when the account owns at least one property. */
const OWNER_TABS: readonly ProfileNavTab[] = [
  'reports',
  'ownerCalendar',
  'ownerBookings',
  'ownerNegotiations',
  // 'ownerAnalytics', // temporarily disabled — its revenue content moved to ownerFigures
  'ownerFigures',
  'ownerContracts',
  'ownerComplaints',
]

const ProfileField = ({
  label,
  value,
  action,
}: {
  label: string
  value: string | null | undefined
  action?: React.ReactNode
}) => (
  <div className="flex items-end justify-between gap-3 border-b border-[#ece7df] py-4">
    <div className="flex flex-col gap-1.5 min-w-0">
      <span className="text-[10px] uppercase tracking-[0.14em] text-[#9a8f80] font-normal">{label}</span>
      <span className="font-haas text-[15px] text-[#172338] font-normal truncate">
        {value ? value : <span className="text-[#c5bdb3] text-sm">Not added yet</span>}
      </span>
    </div>
    {action}
  </div>
)

const TAB_ICONS: Record<ProfileNavTab, LucideIcon> = {
  profile: UserIcon,
  favorites: Heart,
  bookings: CalendarDays,
  offers: FileText,
  ownerCalendar: CalendarDays,
  ownerBookings: ClipboardList,
  ownerNegotiations: Handshake,
  ownerAnalytics: BarChart3,
  ownerFigures: BarChart3,
  ownerContracts: FileSignature,
  ownerComplaints: MessageSquareWarning,
  reports: FileText,
}

/** Encabezado editorial común a todas las secciones del perfil. */
const SectionHeading = ({
  eyebrow,
  title,
  count,
  children,
}: {
  eyebrow?: string
  title: string
  count?: number
  children?: React.ReactNode
}) => (
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-[#e5e0d8]">
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <span className="font-haas text-[10px] uppercase tracking-[0.22em] text-[#D99330]">{eyebrow}</span>
      )}
      <h2 className="font-gtsuper-ds font-light text-[28px] sm:text-[32px] leading-none text-[#172338]">
        {title}
        {typeof count === 'number' && count > 0 && (
          <span className="ml-3 align-middle font-haas text-sm text-[#9a8f80] tracking-normal">{count}</span>
        )}
      </h2>
    </div>
    {children}
  </div>
)

/** Estado vacío editorial: imagen + mensaje + CTAs. */
const ProfileEmptyState = ({
  image,
  eyebrow,
  title,
  description,
  actions,
}: {
  image: string
  eyebrow: string
  title: string
  description: string
  actions?: { href: string; label: string }[]
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] overflow-hidden bg-[#f5f3ef] mt-8">
    <div className="relative h-56 lg:h-auto lg:min-h-[320px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/40 to-transparent" />
    </div>
    <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
      <span className="font-haas text-[10px] uppercase tracking-[0.22em] text-[#D99330]">{eyebrow}</span>
      <h3 className="font-gtsuper-ds font-light text-2xl lg:text-[28px] leading-tight text-[#172338]">{title}</h3>
      <p className="font-haas font-light text-sm text-[#506A70] leading-relaxed max-w-sm">{description}</p>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          {actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                index === 0
                  ? 'bg-[#172338] text-white px-6 py-3 text-[11px] uppercase tracking-[0.16em] hover:bg-[#22324f] transition'
                  : 'border border-[#172338]/30 text-[#172338] px-6 py-3 text-[11px] uppercase tracking-[0.16em] hover:border-[#172338] transition'
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  </div>
)

type TripStatus = 'upcoming' | 'ongoing' | 'past' | null

/** Estado del viaje derivado de sus fechas (el API no expone un status de itinerario). */
const getTripStatus = (startDate?: string | null, endDate?: string | null): TripStatus => {
  const parse = (value?: string | null) => {
    if (!value) return null
    const [y, m, d] = String(value).split('T')[0].split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }
  const start = parse(startDate)
  const end = parse(endDate) ?? start
  if (!start || !end) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (start > today) return 'upcoming'
  if (end >= today) return 'ongoing'
  return 'past'
}

const TRIP_STATUS_STYLES: Record<Exclude<TripStatus, null>, { label: string; className: string }> = {
  upcoming: { label: 'Upcoming', className: 'bg-[#D99330]/10 text-[#B17520]' },
  ongoing: { label: 'In progress', className: 'bg-[#28F7EA]/25 text-[#172338]' },
  past: { label: 'Completed', className: 'bg-[#172338]/[0.06] text-[#506A70]' },
}

const daysUntil = (value?: string | null): number | null => {
  if (!value) return null
  const [y, m, d] = String(value).split('T')[0].split('-').map(Number)
  if (!y || !m || !d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86400000)
}

const resolveItineraryImage = (itinerary: any): string =>
  itinerary?.imageUrl
    ? itinerary.imageUrl.startsWith('http')
      ? itinerary.imageUrl
      : `${process.env.NEXT_PUBLIC_API_URL || ''}/${itinerary.imageUrl}`
    : VILLA_LIST_PLACEHOLDER

type FavoritesFilter = 'all' | 'villas' | 'realEstate' | 'concierge' | 'events'

const FAVORITES_FILTER_LABELS: Record<FavoritesFilter, string> = {
  all: 'All',
  villas: 'Villas',
  realEstate: 'Real Estate',
  concierge: 'Concierge',
  events: 'Events',
}

const getFavoriteRowFilter = (row: ProfileFavoriteRow): Exclude<FavoritesFilter, 'all'> => {
  if (row.kind === 'service') return 'concierge'
  if (row.kind === 'event') return 'events'
  return row.property.rental ? 'villas' : 'realEstate'
}

const BD_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const BD_CURRENT_YEAR = new Date().getFullYear()
const BD_YEARS = Array.from({ length: BD_CURRENT_YEAR - 1919 }, (_, i) => BD_CURRENT_YEAR - i)

type BirthdayPart = string | number

const parseBirthdayValue = (value: string): { year: BirthdayPart; month: BirthdayPart; day: BirthdayPart } => {
  const parts = value ? value.split('-') : []
  return {
    year: parts[0] ? parseInt(parts[0]) : '',
    month: parts[1] ? parseInt(parts[1]) : '',
    day: parts[2] ? parseInt(parts[2]) : '',
  }
}

const BirthdayPicker = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  // Holds partial day/month/year picks locally — deriving them from `value` alone would reset
  // whichever select the user hasn't touched yet on every render, since `value` (the parent's
  // birthday string) only updates once all three parts are chosen.
  const [local, setLocal] = useState(() => parseBirthdayValue(value))

  useEffect(() => {
    setLocal(parseBirthdayValue(value))
  }, [value])

  const { year: selYear, month: selMonth, day: selDay } = local

  const daysInMonth = selYear && selMonth ? new Date(Number(selYear), Number(selMonth), 0).getDate() : 31
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const update = (y: string | number, m: string | number, d: string | number) => {
    setLocal({ year: y, month: m, day: d })
    if (y && m && d) {
      onChange(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)
    }
  }

  const selectClass = "border border-[#e5e0d8] px-2 py-2.5 text-sm text-[#172338] bg-white focus:outline-none focus:border-[#D99330] cursor-pointer flex-1"

  return (
    <div className="flex gap-2">
      <select
        value={selDay}
        onChange={(e) => update(selYear, selMonth, e.target.value)}
        className={selectClass}
      >
        <option value="">Day</option>
        {days.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select
        value={selMonth}
        onChange={(e) => update(selYear, e.target.value, selDay)}
        className={selectClass}
      >
        <option value="">Month</option>
        {BD_MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
      </select>
      <select
        value={selYear}
        onChange={(e) => update(e.target.value, selMonth, selDay)}
        className={selectClass}
      >
        <option value="">Year</option>
        {BD_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </div>
  )
}

const COUNTRY_CODES = [
  { value: '+30', label: '+30 (Greece)' },
  { value: '+1', label: '+1 (USA/Canada)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+33', label: '+33 (France)' },
  { value: '+49', label: '+49 (Germany)' },
  { value: '+34', label: '+34 (Spain)' },
  { value: '+39', label: '+39 (Italy)' },
  { value: '+31', label: '+31 (Netherlands)' },
  { value: '+41', label: '+41 (Switzerland)' },
  { value: '+971', label: '+971 (UAE)' },
  { value: '+90', label: '+90 (Turkey)' },
  { value: '+7', label: '+7 (Russia)' },
  { value: '+86', label: '+86 (China)' },
  { value: '+81', label: '+81 (Japan)' },
  { value: '+61', label: '+61 (Australia)' },
  { value: '+55', label: '+55 (Brazil)' },
  { value: '+52', label: '+52 (Mexico)' },
  { value: '+54', label: '+54 (Argentina)' },
]

/** Splits a stored phone string (e.g. "+306912345678") into its dial code + local number. */
const parsePhoneNumber = (raw: string | null | undefined): { countryCode: string; phoneNumber: string } => {
  const trimmed = (raw || '').trim()
  if (!trimmed) return { countryCode: '', phoneNumber: '' }
  const match = [...COUNTRY_CODES]
    .sort((a, b) => b.value.length - a.value.length)
    .find((c) => trimmed.startsWith(c.value))
  if (match) {
    return { countryCode: match.value, phoneNumber: trimmed.slice(match.value.length).trim() }
  }
  return { countryCode: '', phoneNumber: trimmed.replace(/^\+/, '') }
}

const FieldLabel = ({ text, required = false }: { text: string; required?: boolean }) => (
  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-normal">
    {text}
    {required ? (
      <span className="text-red-500 ml-0.5">*</span>
    ) : (
      <span className="normal-case tracking-normal text-[#c5bdb3] ml-1.5">(optional)</span>
    )}
  </span>
)

type ActivePanel = 'personal' | 'contact' | 'password' | 'changeEmail' | null

export const MyProfilePage = ({ initialTab }: MyProfilePageProps = { initialTab: undefined }) => {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading, refreshUser, logout } = useAuth()
  const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty)

  const [profile, setProfile] = useState<AuthUser | null>(user ?? null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [favoriteRows, setFavoriteRows] = useState<ProfileFavoriteRow[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [favoritesError, setFavoritesError] = useState<string | null>(null)
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(new Set())
  const [pendingEventFavoriteIds, setPendingEventFavoriteIds] = useState<Set<string>>(new Set())

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    nationality: '',
  })
  const [contactForm, setContactForm] = useState({
    countryCode: '',
    phoneNumber: '',
    address: '',
    postalCode: '',
    city: '',
  })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [emailChangeForm, setEmailChangeForm] = useState({ newEmail: '' })
  const [emailChangeSaving, setEmailChangeSaving] = useState(false)
  const [emailChangeMessage, setEmailChangeMessage] = useState<string | null>(null)
  const [emailChangeSent, setEmailChangeSent] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [contactSaving, setContactSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [contactMessage, setContactMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const getInitialTab = (): ProfileNavTab => {
    if (initialTab && PROFILE_NAV_TABS.includes(initialTab as ProfileNavTab)) {
      return initialTab as ProfileNavTab
    }
    return 'profile'
  }
  const [selectedTab, setSelectedTab] = useState<ProfileNavTab>(getInitialTab())
  const [favoritesSort, setFavoritesSort] = useState<'recent' | 'alphabetical'>('recent')
  const [favoritesFilter, setFavoritesFilter] = useState<FavoritesFilter>('all')
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsPage, setBookingsPage] = useState(1)
  const [offersLoading, setOffersLoading] = useState(false)
  const [offers, setOffers] = useState<any[]>([])
  const [offersPage, setOffersPage] = useState(1)
  const [ownedProperties, setOwnedProperties] = useState<OwnedPropertySummary[]>([])
  const [selectedOwnerPropertyId, setSelectedOwnerPropertyId] = useState<string | null>(null)
  const [ownerReport, setOwnerReport] = useState<OwnerReport | null>(null)
  const [ownerReportLoading, setOwnerReportLoading] = useState(false)
  const [ownerBookings, setOwnerBookings] = useState<OwnerReportBooking[]>([])
  const [ownerBookingsLoading, setOwnerBookingsLoading] = useState(false)
  const PAGE_SIZE = 5

  // Determina si los tabs de owner deben mostrarse (solo cuentas con propiedades vinculadas)
  useEffect(() => {
    if (!isAuthenticated) {
      setOwnedProperties([])
      return
    }
    getMyOwnedProperties().then((res: any) => {
      setOwnedProperties(Array.isArray(res?.data) ? res.data : [])
    }).catch(() => setOwnedProperties([]))
  }, [isAuthenticated])

  // Default a la primera propiedad del owner apenas se cargan (o si la seleccionada dejó de existir)
  useEffect(() => {
    if (!ownedProperties.length) {
      setSelectedOwnerPropertyId(null)
      return
    }
    setSelectedOwnerPropertyId((prev) =>
      prev && ownedProperties.some((p) => p.id === prev) ? prev : ownedProperties[0].id,
    )
  }, [ownedProperties])

  // Reporte del owner (villa, stats, monthly, yearlyPerformance, negotiations, recommendations) —
  // compartido por los tabs Calendar/Negotiations/Analytics/Figures/Full Report.
  useEffect(() => {
    if (!selectedOwnerPropertyId) {
      setOwnerReport(null)
      return
    }
    setOwnerReportLoading(true)
    getOwnerPropertyReport(selectedOwnerPropertyId)
      .then((res: any) => setOwnerReport(res?.data ?? null))
      .catch(() => setOwnerReport(null))
      .finally(() => setOwnerReportLoading(false))
  }, [selectedOwnerPropertyId])

  // Bookings de todos los años (no solo el año en curso) — compartido por Property Bookings/Contracts/Client Complaints.
  useEffect(() => {
    if (!selectedOwnerPropertyId) {
      setOwnerBookings([])
      return
    }
    setOwnerBookingsLoading(true)
    getOwnerPropertyBookings(selectedOwnerPropertyId)
      .then((res: any) => setOwnerBookings(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setOwnerBookings([]))
      .finally(() => setOwnerBookingsLoading(false))
  }, [selectedOwnerPropertyId])

  // Owners get a dedicated menu (My Profile + their property tabs) instead of the regular
  // client menu — My Favorites/My Bookings/My Offers don't apply to them.
  const isOwner = ownedProperties.length > 0
  const visibleTabs = useMemo(
    () => PROFILE_NAV_TABS.filter((tab) => (isOwner ? tab === 'profile' || OWNER_TABS.includes(tab) : !OWNER_TABS.includes(tab))),
    [isOwner],
  )

  // Leer el parámetro de query para establecer la pestaña inicial
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string
      // support legacy "trips" param → "bookings"
      const resolved = tabParam === 'trips' ? 'bookings' : tabParam
      if (PROFILE_NAV_TABS.includes(resolved as ProfileNavTab)) {
        setSelectedTab(resolved as ProfileNavTab)
      }
    }
  }, [router.isReady, router.query.tab])

  // Bookings y offers se cargan al entrar (no al abrir su tab) para alimentar los contadores del hero y del menú.
  useEffect(() => {
    if (!user?.email) return
    setBookingsLoading(true)
    getItinerariesForClient(user.email)
      .then((res: any) => setBookings(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setBookings([]))
      .finally(() => setBookingsLoading(false))
  }, [user?.email])

  useEffect(() => {
    if (!user?.email && !user?.id) return
    setOffersLoading(true)
    getOffersForClient(user.email || '')
      .then((res: any) => setOffers(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setOffers([]))
      .finally(() => setOffersLoading(false))
  }, [user?.email, user?.id])

  const isReadyForData = useMemo(() => !authLoading && isAuthenticated && Boolean(user?.id), [
    authLoading,
    isAuthenticated,
    user?.id,
  ])

  const formatDateForInput = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }, [])

  const syncProfileFormOnly = useCallback(() => {
    setProfileForm({
      firstName: profile?.firstName || user?.firstName || '',
      lastName: profile?.lastName || user?.lastName || '',
      birthday: formatDateForInput(profile?.birthday || user?.birthday),
      nationality: profile?.nationality || user?.nationality || '',
    })
  }, [
    formatDateForInput,
    profile?.firstName,
    profile?.lastName,
    profile?.birthday,
    profile?.nationality,
    user?.firstName,
    user?.lastName,
    user?.birthday,
    user?.nationality,
  ])

  const syncContactFormOnly = useCallback(() => {
    const { countryCode, phoneNumber } = parsePhoneNumber(profile?.phoneNumber || user?.phoneNumber)
    setContactForm({
      countryCode,
      phoneNumber,
      address: profile?.address || user?.address || '',
      postalCode: profile?.postalCode || user?.postalCode || '',
      city: profile?.city || user?.city || '',
    })
  }, [
    profile?.phoneNumber,
    profile?.address,
    profile?.postalCode,
    profile?.city,
    user?.phoneNumber,
    user?.address,
    user?.postalCode,
    user?.city,
  ])

  const syncFormsWithProfile = useCallback(() => {
    syncProfileFormOnly()
    syncContactFormOnly()
  }, [syncProfileFormOnly, syncContactFormOnly])

  const userId = profile?.id || user?.id

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)
    setProfileError(null)

    try {
      // Looked up by id, not email: the user's email can change via the change-email flow while
      // logged in, and a stale email in context would otherwise 404 against the new DB row.
      const response = await getUserById(user.id)

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || 'Unable to load profile data')
      }

      const nextUser = {
        id: response.data.id ?? user.id,
        email: response.data.email ?? user.email,
        firstName: response.data.firstName ?? user.firstName,
        lastName: response.data.lastName ?? user.lastName,
        phoneNumber: response.data.phoneNumber ?? user.phoneNumber,
        birthday: response.data.birthday ?? user.birthday ?? null,
        nationality: response.data.nationality ?? user.nationality ?? null,
        address: response.data.address ?? user.address ?? null,
        postalCode: response.data.postalCode ?? user.postalCode ?? null,
        city: response.data.city ?? user.city ?? null,
        profilePicture: response.data.profilePicture ?? user.profilePicture ?? null,
      }

      // Solo actualizar el contexto si hay cambios significativos para evitar loops infinitos
      const hasChanges =
        nextUser.id !== user.id ||
        nextUser.email !== user.email ||
        nextUser.firstName !== user.firstName ||
        nextUser.lastName !== user.lastName ||
        nextUser.phoneNumber !== user.phoneNumber ||
        nextUser.profilePicture !== user.profilePicture

      setProfile(nextUser)

      // Solo actualizar el contexto si hay cambios significativos
      if (hasChanges) {
        refreshUser(nextUser)
      }

      setProfileMessage(null)
      setContactMessage(null)
    } catch (error: any) {
      console.error('Failed to load profile data:', error)
      setProfileError(error?.message || 'We could not load your profile details.')
    } finally {
      setProfileLoading(false)
    }
  }, [user?.email, user?.id, user?.firstName, user?.lastName, user?.phoneNumber, user?.profilePicture, refreshUser])

  const loadFavorites = useCallback(async () => {
    if (!user?.id) {
      setFavoritesLoading(false)
      return
    }

    setFavoritesLoading(true)
    setFavoritesError(null)

    try {
      const uid = String(user.id)
      const [propRes, svcRes] = await Promise.all([
        getUserPropertyLikes(uid),
        getUserServiceLikes(uid),
      ])

      const rows: ProfileFavoriteRow[] = []
      const messages: string[] = []

      if (propRes && (propRes as { success?: boolean }).success === false) {
        messages.push(
          (propRes as { message?: string }).message ||
            'We could not load saved properties.',
        )
      } else {
        const properties = Array.isArray(propRes?.data?.properties) ? propRes.data.properties : []
        properties.forEach((property: any) => {
          try {
            const fav = mapLikedPropertyToFavorite(property)
            rows.push({ kind: 'property', sortTitle: fav.title, property: fav })
          } catch (error) {
            console.warn('Skipping malformed favourite property item:', error)
          }
        })
      }

      if (svcRes && (svcRes as { success?: boolean }).success === false) {
        messages.push(
          (svcRes as { message?: string }).message ||
            'We could not load saved concierge services.',
        )
      } else {
        const services = Array.isArray(svcRes?.data?.services) ? svcRes.data.services : []
        services.forEach((service: any) => {
          try {
            const svc = mapLikedServiceToRow(service)
            rows.push({ kind: 'service', sortTitle: svc.title, service: svc })
          } catch (error) {
            console.warn('Skipping malformed favourite service item:', error)
          }
        })
      }

      if (typeof window !== 'undefined') {
        getEventFavoriteEntriesForUser(uid).forEach((ev) => {
          rows.push({
            kind: 'event',
            sortTitle: ev.name || ev.id,
            event: ev,
          })
        })
      }

      setFavoriteRows(rows)
      if (messages.length && rows.length === 0) {
        setFavoritesError(messages.join(' '))
      } else {
        setFavoritesError(null)
      }
    } catch (error: any) {
      console.error('Failed to load favourites:', error)
      setFavoriteRows([])
      setFavoritesError(error?.response?.data?.message || 'We could not load your favourites right now.')
    } finally {
      setFavoritesLoading(false)
    }
  }, [user?.id])

  // Usar useRef para evitar múltiples cargas del perfil
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setProfileLoading(false)
      setFavoritesLoading(false)
      hasLoadedRef.current = false
      return
    }

    // Solo cargar una vez cuando el usuario está listo
    if (isReadyForData && user?.email && !hasLoadedRef.current) {
      hasLoadedRef.current = true
      loadProfile()
      loadFavorites()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, isReadyForData, user?.email])

  useEffect(() => {
    syncFormsWithProfile()
  }, [profile, syncFormsWithProfile])

  const onRentalFavoriteCardClick = useCallback(
    (favorite: FavoriteProperty) => {
      setSelectedProperty(favorite.raw || null)
      router.push(buildRentalDetailPath(favorite.raw || favorite))
    },
    [router, setSelectedProperty],
  )

  const onRealEstateFavoriteCardClick = useCallback(
    (favorite: FavoriteProperty) => {
      setSelectedProperty(favorite.raw || null)
      router.push(buildRealEstateDetailPath(favorite.raw || favorite))
    },
    [router, setSelectedProperty],
  )

  const handleToggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user?.id) return
      const pid = String(propertyId)

      setPendingFavoriteIds((prev) => {
        const next = new Set(prev)
        next.add(pid)
        return next
      })

      try {
        const response = await togglePropertyLike({ userId: user.id, propertyId: pid })
        if (!response || (response as { success?: boolean }).success === false) {
          setFavoritesError(
            (response as { message?: string })?.message ||
              'We could not update your favourites. Please try again.',
          )
          return
        }
        const isStillLiked = Boolean(response?.data?.isLiked)

        if (!isStillLiked) {
          setFavoriteRows((prev) =>
            prev.filter((row) => !(row.kind === 'property' && row.property.id === pid)),
          )
        }
      } catch (error: any) {
        console.error('Failed to update favourite status:', error)
        setFavoritesError(error?.response?.data?.message || 'We could not update your favourites. Please try again.')
      } finally {
        setPendingFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(pid)
          return next
        })
      }
    },
    [user?.id],
  )

  const handleRemoveEventFavorite = useCallback(
    async (eventId: string) => {
      if (!user?.id) return
      const eid = String(eventId)
      setPendingEventFavoriteIds((prev) => {
        const next = new Set(prev)
        next.add(eid)
        return next
      })
      try {
        removeEventFavoriteEntry(user.id, eid)
        setFavoriteRows((prev) => prev.filter((row) => !(row.kind === 'event' && row.event.id === eid)))
      } finally {
        setPendingEventFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(eid)
          return next
        })
      }
    },
    [user?.id],
  )

  const handleTabChange = useCallback((tab: ProfileNavTab) => {
    setSelectedTab(tab)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const sortedFavoriteRows = useMemo(() => {
    if (favoritesSort === 'alphabetical') {
      return [...favoriteRows].sort((a, b) => a.sortTitle.localeCompare(b.sortTitle))
    }
    return favoriteRows
  }, [favoriteRows, favoritesSort])

  const favoritesFilterCounts = useMemo(() => {
    const counts: Record<FavoritesFilter, number> = { all: favoriteRows.length, villas: 0, realEstate: 0, concierge: 0, events: 0 }
    favoriteRows.forEach((row) => {
      counts[getFavoriteRowFilter(row)] += 1
    })
    return counts
  }, [favoriteRows])

  const visibleFavoriteRows = useMemo(
    () =>
      favoritesFilter === 'all'
        ? sortedFavoriteRows
        : sortedFavoriteRows.filter((row) => getFavoriteRowFilter(row) === favoritesFilter),
    [sortedFavoriteRows, favoritesFilter],
  )

  // Si el filtro activo se queda sin elementos (p. ej. tras quitar el último favorito), volver a "All".
  useEffect(() => {
    if (favoritesFilter !== 'all' && favoritesFilterCounts[favoritesFilter] === 0) {
      setFavoritesFilter('all')
    }
  }, [favoritesFilter, favoritesFilterCounts])

  /** API PATCH /user/:id returns updated user in `data.user` (not top-level `user`). */
  const getPatchedUserPayload = (response: any): Record<string, any> | null => {
    if (!response?.success) return null
    const nested = response?.data?.user
    if (nested && typeof nested === 'object') return nested
    if (response?.data && typeof response.data === 'object' && response.data.id) {
      return response.data
    }
    if (response?.user && typeof response.user === 'object') return response.user
    return null
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    const firstName = profileForm.firstName.trim()
    const lastName = profileForm.lastName.trim()
    if (!firstName || !lastName) {
      setProfileMessage('Please provide both first name and last name.')
      return
    }

    // Convertir birthday string a Date o null
    const birthday = profileForm.birthday ? new Date(profileForm.birthday) : null
    if (birthday && isNaN(birthday.getTime())) {
      setProfileMessage('Please provide a valid birthday.')
      return
    }

    const nationality = profileForm.nationality.trim() || null

    setProfileSaving(true)
    setProfileMessage(null)

    try {
      const response = await patchUser({ 
        id: userId, 
        firstName, 
        lastName, 
        birthday: birthday?.toISOString().split('T')[0] || null,
        nationality 
      })
      if (!response?.success) {
        throw new Error(response?.message || 'We could not update your profile.')
      }

      const patched = getPatchedUserPayload(response)
      const updatedUser: AuthUser = {
        id: patched?.id ?? userId,
        email: patched?.email ?? profile?.email ?? user?.email ?? '',
        firstName: patched?.firstName ?? firstName,
        lastName: patched?.lastName ?? lastName,
        phoneNumber: patched?.phoneNumber ?? profile?.phoneNumber ?? user?.phoneNumber ?? '',
        birthday: patched?.birthday ?? birthday?.toISOString().split('T')[0] ?? null,
        nationality: patched?.nationality ?? nationality ?? null,
        address: patched?.address ?? profile?.address ?? user?.address ?? null,
        postalCode: patched?.postalCode ?? profile?.postalCode ?? user?.postalCode ?? null,
        city: patched?.city ?? profile?.city ?? user?.city ?? null,
        profilePicture: patched?.profilePicture ?? profile?.profilePicture ?? user?.profilePicture ?? null,
      }

      setProfile(updatedUser)
      refreshUser(updatedUser)
      setActivePanel(null)
      setProfileMessage('Profile updated successfully.')
    } catch (error: any) {
      console.error('Failed to update profile section', error)
      setProfileMessage(error?.message || 'We could not update your profile, please try again later.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    if (!file || !userId) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5MB.')
      return
    }

    setAvatarUploading(true)
    setAvatarError(null)

    try {
      const response = await uploadProfilePicture(file)
      if (!response?.success) {
        throw new Error(response?.message || 'We could not upload your photo.')
      }

      const patched = getPatchedUserPayload(response)
      const nextProfilePicture = patched?.profilePicture ?? null

      const updatedUser: AuthUser = {
        id: profile?.id ?? user?.id ?? userId,
        email: profile?.email ?? user?.email ?? '',
        firstName: profile?.firstName ?? user?.firstName ?? '',
        lastName: profile?.lastName ?? user?.lastName ?? '',
        phoneNumber: profile?.phoneNumber ?? user?.phoneNumber ?? '',
        birthday: profile?.birthday ?? user?.birthday ?? null,
        nationality: profile?.nationality ?? user?.nationality ?? null,
        address: profile?.address ?? user?.address ?? null,
        postalCode: profile?.postalCode ?? user?.postalCode ?? null,
        city: profile?.city ?? user?.city ?? null,
        profilePicture: nextProfilePicture,
      }

      setProfile(updatedUser)
      refreshUser(updatedUser)
    } catch (error: any) {
      console.error('Failed to upload profile picture', error)
      setAvatarError(error?.message || 'We could not upload your photo, please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!userId) return

    setAvatarUploading(true)
    setAvatarError(null)

    try {
      const response = await removeProfilePicture()
      if (!response?.success) {
        throw new Error(response?.message || 'We could not remove your photo.')
      }

      const updatedUser: AuthUser = {
        id: profile?.id ?? user?.id ?? userId,
        email: profile?.email ?? user?.email ?? '',
        firstName: profile?.firstName ?? user?.firstName ?? '',
        lastName: profile?.lastName ?? user?.lastName ?? '',
        phoneNumber: profile?.phoneNumber ?? user?.phoneNumber ?? '',
        birthday: profile?.birthday ?? user?.birthday ?? null,
        nationality: profile?.nationality ?? user?.nationality ?? null,
        address: profile?.address ?? user?.address ?? null,
        postalCode: profile?.postalCode ?? user?.postalCode ?? null,
        city: profile?.city ?? user?.city ?? null,
        profilePicture: null,
      }

      setProfile(updatedUser)
      refreshUser(updatedUser)
    } catch (error: any) {
      console.error('Failed to remove profile picture', error)
      setAvatarError(error?.message || 'We could not remove your photo, please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    const localPhone = contactForm.phoneNumber.trim()

    if (!localPhone) {
      setContactMessage('Phone number is required.')
      return
    }
    if (!contactForm.countryCode) {
      setContactMessage('Please select a country code.')
      return
    }

    const phoneNumber = `${contactForm.countryCode}${localPhone}`
    const address = contactForm.address.trim() || null
    const postalCode = contactForm.postalCode.trim() || null
    const city = contactForm.city.trim() || null

    setContactSaving(true)
    setContactMessage(null)

    try {
      const response = await patchUser({
        id: userId,
        phoneNumber,
        address,
        postalCode,
        city
      })
      if (!response?.success) {
        throw new Error(response?.message || 'We could not update your contact details.')
      }

      const patched = getPatchedUserPayload(response)
      const updatedUser: AuthUser = {
        id: patched?.id ?? userId,
        email: patched?.email ?? profile?.email ?? user?.email ?? '',
        firstName: patched?.firstName ?? profile?.firstName ?? user?.firstName ?? '',
        lastName: patched?.lastName ?? profile?.lastName ?? user?.lastName ?? '',
        phoneNumber: patched?.phoneNumber ?? phoneNumber,
        birthday: patched?.birthday ?? profile?.birthday ?? user?.birthday ?? null,
        nationality: patched?.nationality ?? profile?.nationality ?? user?.nationality ?? null,
        address: patched?.address ?? address ?? null,
        postalCode: patched?.postalCode ?? postalCode ?? null,
        city: patched?.city ?? city ?? null,
        profilePicture: patched?.profilePicture ?? profile?.profilePicture ?? user?.profilePicture ?? null,
      }

      setProfile(updatedUser)
      refreshUser(updatedUser)
      setActivePanel(null)
      setContactMessage('Contact details saved successfully.')
    } catch (error: any) {
      console.error('Failed to update contact section', error)
      setContactMessage(error?.message || 'We could not update your contact details, please try again later.')
    } finally {
      setContactSaving(false)
    }
  }

  const handleRequestEmailChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newEmail = emailChangeForm.newEmail.trim()
    if (!newEmail) {
      setEmailChangeMessage('Please enter your new email address.')
      return
    }

    setEmailChangeSaving(true)
    setEmailChangeMessage(null)

    try {
      const response = await requestEmailChange(newEmail)
      if (!response?.success) {
        throw new Error(response?.message || 'We could not process your request.')
      }
      setEmailChangeSent(true)
      setEmailChangeMessage(response.message || `We sent a confirmation link to ${email}.`)
    } catch (error: any) {
      console.error('Failed to request email change', error)
      setEmailChangeMessage(error?.message || 'We could not process your request, please try again later.')
    } finally {
      setEmailChangeSaving(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    if (passwordForm.newPassword.trim().length < 8) {
      setPasswordError('Password must contain at least 8 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordSaving(true)
    setPasswordError(null)
    setPasswordMessage(null)

    try {
      const newPassword = passwordForm.newPassword.trim()
      const response = await patchUser({ id: userId, password: newPassword })
      if (!response || response.success !== true) {
        throw new Error(
          (typeof response?.message === 'string' && response.message) ||
            'We could not update your password.',
        )
      }

      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setPasswordError(null)
      setActivePanel(null)
      setPasswordMessage('Password updated successfully.')
    } catch (error: any) {
      console.error('Failed to update password', error)
      setPasswordError(error?.message || 'We could not update your password, please try again later.')
    } finally {
      setPasswordSaving(false)
    }
  }

  const fullName = useMemo(() => {
    const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim()
    return name || 'Not provided'
  }, [profile?.firstName, profile?.lastName])

  const profilePictureUrl = resolveMediaUrl(profile?.profilePicture || user?.profilePicture)

  const email = profile?.email || user?.email || 'Not provided'
  const phoneNumber = profile?.phoneNumber || 'Not provided'
  
  // Formatear birthday para mostrar
  const formatBirthday = (date: string | Date | null | undefined): string => {
    if (!date) return 'Not provided'
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return 'Not provided'
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  const birthday = formatBirthday(profile?.birthday || user?.birthday)
  const nationality = profile?.nationality || user?.nationality || 'Not provided'
  const address = profile?.address || user?.address || 'Not provided'
  const postalCode = profile?.postalCode || user?.postalCode || 'Not provided'
  const city = profile?.city || user?.city || 'Not provided'

  const profileCompletion = (() => {
    const checks: { filled: boolean; panel: 'personal' | 'contact' }[] = [
      { filled: Boolean(profilePictureUrl), panel: 'personal' },
      { filled: Boolean(profile?.firstName || user?.firstName), panel: 'personal' },
      { filled: Boolean(profile?.lastName || user?.lastName), panel: 'personal' },
      { filled: birthday !== 'Not provided', panel: 'personal' },
      { filled: nationality !== 'Not provided', panel: 'personal' },
      { filled: email !== 'Not provided', panel: 'contact' },
      { filled: phoneNumber !== 'Not provided', panel: 'contact' },
      { filled: address !== 'Not provided', panel: 'contact' },
      { filled: city !== 'Not provided', panel: 'contact' },
      { filled: postalCode !== 'Not provided', panel: 'contact' },
    ]
    const missing = checks.filter((c) => !c.filled)
    return {
      percent: Math.round(((checks.length - missing.length) / checks.length) * 100),
      missing,
      nextPanel: missing[0]?.panel ?? 'personal',
    }
  })()

  const displayName = [profile?.firstName || user?.firstName, profile?.lastName || user?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const heroLocation = [city !== 'Not provided' ? city : null, nationality !== 'Not provided' ? nationality : null]
    .filter(Boolean)
    .join(' · ')

  const tabCounts: Partial<Record<ProfileNavTab, number>> = {
    favorites: favoriteRows.length,
    bookings: bookings.length,
    offers: offers.length,
  }

  const showAuthenticationNotice = !authLoading && !isAuthenticated
  if (showAuthenticationNotice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="font-haas text-[#172338]">Please sign in to view your profile and favourites.</p>
      </div>
    )
  }

  const renderProfileSection = () => {
    if (profileLoading) return <ProfileSectionSkeleton />
    if (profileError) return <p className="font-haas text-[#D04444]">{profileError}</p>

    const editLinkClass =
      'inline-flex items-center gap-1.5 font-haas text-[11px] uppercase tracking-[0.16em] text-[#172338] border-b border-[#D99330] pb-0.5 hover:text-[#D99330] transition'

    const openPersonalPanel = () => { syncProfileFormOnly(); setActivePanel('personal') }
    const openContactPanel = () => { syncContactFormOnly(); setActivePanel('contact') }

    const renderBlock = (
      title: string,
      description: string,
      action: React.ReactNode,
      fields: React.ReactNode,
    ) => (
      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-12 py-10 border-b border-[#e5e0d8] last:border-b-0">
        <div className="flex flex-col gap-3">
          <h3 className="font-gtsuper-ds font-light text-xl text-[#172338]">{title}</h3>
          <p className="font-haas font-light text-sm text-[#506A70] leading-relaxed">{description}</p>
          <div className="pt-1">{action}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">{fields}</div>
      </section>
    )

    return (
      <div className="flex flex-col w-full">
        <SectionHeading eyebrow="Account" title="Personal details" />

        {profileCompletion.percent < 100 && (
          <div className="mt-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10 bg-[#f5f3ef] px-6 py-6 md:px-8">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-haas text-sm text-[#172338]">Your profile is {profileCompletion.percent}% complete</span>
                <span className="font-haas text-xs text-[#9a8f80]">
                  {profileCompletion.missing.length} {profileCompletion.missing.length === 1 ? 'detail' : 'details'} missing
                </span>
              </div>
              <div className="h-[3px] w-full bg-[#e5e0d8] overflow-hidden">
                <div className="h-full bg-[#D99330] transition-all duration-500" style={{ width: `${profileCompletion.percent}%` }} />
              </div>
              <p className="font-haas font-light text-xs text-[#506A70]">
                A complete profile helps our concierge team prepare every stay around you.
              </p>
            </div>
            <button
              type="button"
              onClick={profileCompletion.nextPanel === 'contact' ? openContactPanel : openPersonalPanel}
              className="shrink-0 bg-[#172338] text-white px-6 py-3 text-[11px] uppercase tracking-[0.16em] hover:bg-[#22324f] transition"
            >
              Complete profile
            </button>
          </div>
        )}

        {profileMessage && !activePanel && (
          <p className="mt-6 text-sm text-[#2a7a4a] font-haas">{profileMessage}</p>
        )}

        <div className="flex flex-col">
          {renderBlock(
            'Personal information',
            'The name and details we use on your reservations and proposals.',
            <button type="button" onClick={openPersonalPanel} className={editLinkClass}>
              <Pencil size={12} /> Edit
            </button>,
            <>
              <ProfileField label="First Name" value={profile?.firstName || user?.firstName} />
              <ProfileField label="Last Name" value={profile?.lastName || user?.lastName} />
              <ProfileField label="Birthday" value={birthday !== 'Not provided' ? birthday : null} />
              <ProfileField label="Nationality" value={nationality !== 'Not provided' ? nationality : null} />
            </>,
          )}

          {renderBlock(
            'Contact details',
            'How our team reaches you before and during your stay.',
            <button type="button" onClick={openContactPanel} className={editLinkClass}>
              <Pencil size={12} /> Edit
            </button>,
            <>
              <ProfileField
                label="Email"
                value={email !== 'Not provided' ? email : null}
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setEmailChangeForm({ newEmail: '' })
                      setEmailChangeMessage(null)
                      setEmailChangeSent(false)
                      setActivePanel('changeEmail')
                    }}
                    className="shrink-0 font-haas text-[11px] text-[#9a8f80] underline underline-offset-4 hover:text-[#172338] transition"
                  >
                    Change
                  </button>
                }
              />
              <ProfileField label="Mobile Phone" value={phoneNumber !== 'Not provided' ? phoneNumber : null} />
              <ProfileField label="Address" value={address !== 'Not provided' ? address : null} />
              <ProfileField label="City" value={city !== 'Not provided' ? city : null} />
              <ProfileField label="Postal Code" value={postalCode !== 'Not provided' ? postalCode : null} />
            </>,
          )}

          {renderBlock(
            'Login & security',
            'Keep your account protected with a strong, unique password.',
            <button
              type="button"
              onClick={() => {
                setPasswordForm({ newPassword: '', confirmPassword: '' })
                setPasswordError(null)
                setPasswordMessage(null)
                setActivePanel('password')
              }}
              className={editLinkClass}
            >
              <Lock size={12} /> Change password
            </button>,
            <>
              <div className="flex items-end justify-between gap-3 border-b border-[#ece7df] py-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#9a8f80] font-normal">Password</span>
                  <span className="font-haas text-[15px] text-[#172338] tracking-[0.3em]">••••••••</span>
                </div>
              </div>
              {passwordMessage && !activePanel && (
                <p className="md:col-span-2 text-sm text-[#2a7a4a] font-haas mt-3">{passwordMessage}</p>
              )}
            </>,
          )}
        </div>
      </div>
    )
  }

  const renderFavoritesSection = () => {
    if (favoritesLoading) {
      return <FavoritesGridSkeleton />
    }

    if (favoritesError && sortedFavoriteRows.length === 0) {
      return <p className="font-haas text-[#D04444]">{favoritesError}</p>
    }

    if (sortedFavoriteRows.length === 0) {
      return (
        <div className="flex flex-col">
          <SectionHeading eyebrow="Saved" title="My favorites" />
          <ProfileEmptyState
            image="/images/greek-island-image.png"
            eyebrow="Your collection"
            title="Start building your wishlist"
            description="Tap the heart on any villa, residence, concierge service or event and it will be kept here, ready for when you plan your next escape."
            actions={[
              { href: '/villas/list', label: 'Discover villas' },
              { href: '/concierge/list', label: 'Concierge' },
              { href: '/events/list', label: 'Events' },
            ]}
          />
        </div>
      )
    }

    const filterOptions = (Object.keys(FAVORITES_FILTER_LABELS) as FavoritesFilter[]).filter(
      (key) => key === 'all' || favoritesFilterCounts[key] > 0,
    )

    return (
      <div className="flex flex-col gap-8">
        <SectionHeading eyebrow="Saved" title="My favorites" count={sortedFavoriteRows.length}>
          <label className="flex items-center gap-2 text-[10px] font-haas text-[#9a8f80] uppercase tracking-[0.14em]">
            Sort by
            <select
              value={favoritesSort}
              onChange={(e) => setFavoritesSort(e.target.value as 'recent' | 'alphabetical')}
              className="border-0 border-b border-[#172338]/30 bg-transparent pl-0 pr-7 py-1 text-[#172338] text-xs normal-case tracking-normal focus:ring-0 focus:border-[#D99330] cursor-pointer"
            >
              <option value="recent">Recent</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </label>
        </SectionHeading>
        {filterOptions.length > 2 && (
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            {filterOptions.map((key) => {
              const active = favoritesFilter === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFavoritesFilter(key)}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.12em] font-haas transition ${
                    active
                      ? 'bg-[#172338] text-white'
                      : 'bg-white text-[#506A70] border border-[#e5e0d8] hover:border-[#172338]/40'
                  }`}
                >
                  {FAVORITES_FILTER_LABELS[key]}
                  <span className={active ? 'text-[#D99330]' : 'text-[#9a8f80]'}>{favoritesFilterCounts[key]}</span>
                </button>
              )
            })}
          </div>
        )}
        {favoritesError && favoriteRows.length > 0 ? (
          <p className="font-haas text-sm text-[#D04444]">{favoritesError}</p>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 w-full">
          {visibleFavoriteRows.map((row) => {
            if (row.kind === 'property') {
              const favorite = row.property
              const raw = favorite.raw
              if (favorite.rental) {
                // Mismo card que `pages/villas/list`.
                const villa = raw
                return (
                  <div
                    key={`p-${favorite.id}`}
                    onClick={() => onRentalFavoriteCardClick(favorite)}
                    className="group bg-white overflow-hidden cursor-pointer border border-[#E8ECEF] hover:border-[#D99330] transition-[border-color,box-shadow] duration-500 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(23,35,56,0.13)]"
                  >
                    <div className="relative overflow-hidden h-64">
                      <img
                        src={heroImageDirectUrl(getVillaListHeroUrl(villa))}
                        alt={favorite.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== VILLA_LIST_PLACEHOLDER) target.src = VILLA_LIST_PLACEHOLDER
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 inset-x-0 px-5 pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                        <span className="text-white font-haas text-[11px] tracking-[0.22em] uppercase border-b border-white/40 pb-0.5">View Villa</span>
                      </div>
                      <button
                        type="button"
                        className="absolute top-4 right-4 bg-white backdrop-blur-sm rounded-full p-2 hover:bg-white transition disabled:opacity-70"
                        onClick={(e) => { e.stopPropagation(); void handleToggleFavorite(favorite.id) }}
                        disabled={pendingFavoriteIds.has(favorite.id)}
                        aria-pressed
                        aria-label="Remove from favourites"
                      >
                        <Heart className="w-4 h-4 fill-[#ef4444] text-[#ef4444]" />
                      </button>
                    </div>
                    <div className="p-5">
                      <h3 className="font-haas font-medium text-[#172338] text-lg leading-snug mb-1 truncate transition-colors duration-300 group-hover:text-[#0f1a2e]">
                        {favorite.title}
                      </h3>
                      <div className="flex items-center gap-1 text-[#506A70] mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm truncate">{villa?.visibleLocation || villa?.location || villa?.country || 'N/A'}</span>
                      </div>
                      <p className="text-xs font-haas text-[#8A9BA0] uppercase tracking-wider mb-4">
                        {villa?.classification?.bedrooms ?? 'N/A'} bedrooms · {getVillaGuestDisplay(villa)} guests · {formatPoolsJacuzziSpecLine(villa?.classification)}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#F0F3F5]">
                        <div>
                          <span className="block text-[10px] text-[#8A9BA0] uppercase tracking-wider font-haas">From</span>
                          <span className="font-haas font-medium text-[#D99330] text-base">{getRentalListDisplayPrice(villa)}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#8A9BA0] group-hover:text-[#D99330] group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                )
              }
              // Mismo card que `pages/real-estate/list`.
              return (
                <div key={`p-${favorite.id}`} className="w-full">
                  <PropertieCard
                    onClick={() => onRealEstateFavoriteCardClick(favorite)}
                    villaImage={getRealEstateListCardImage(raw)}
                    title={raw?.title || ''}
                    location={getRealEstateCardLocationLabel(raw || {})}
                    price={getRealEstateFavoritePriceLabel(raw)}
                    saleListingCurrency={getPropertySaleListingCurrency(raw)}
                    bedrooms={raw?.classification?.bedrooms || 0}
                    bathrooms={getRealEstateBathrooms(raw?.classification)}
                    yearBuilt={getRealEstateYearBuilt(raw?.classification)}
                    salePriceNumeric={Number(raw?.sale_price) || null}
                    guests={0}
                    plotSqm={getRealEstatePlotSqm(raw?.classification)}
                    buildSqm={getRealEstateBuildSqm(raw?.classification)}
                    pools={countPoolsForRealEstateCard(raw?.classification)}
                    isLand={String(raw?.classification?.type || '').toLowerCase() === 'land'}
                    rental={false}
                    liked
                    onToggleFavorite={() => void handleToggleFavorite(favorite.id)}
                    isTogglingFavorite={pendingFavoriteIds.has(favorite.id)}
                  />
                </div>
              )
            }
            if (row.kind === 'service') {
              // Mismo card que `pages/concierge/list`.
              const { service } = row
              return (
                <ConciergeCard
                  key={`s-${service.id}`}
                  simple
                  image={service.image}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  serviceId={service.id}
                  serviceType={service.serviceType}
                  detailPath={service.detailPath}
                  openInNewTab
                  onServiceLikeChange={(liked) => {
                    if (!liked) {
                      setFavoriteRows((prev) =>
                        prev.filter((r) => !(r.kind === 'service' && r.service.id === service.id)),
                      )
                    }
                  }}
                />
              )
            }
            const { event } = row
            const eventSlug = slugify(event.name || 'event')
            const rawEvImg = event.image || '/images/events-bg.png'
            let evImgBase = rawEvImg
            if (!rawEvImg.startsWith('/') && !/^https?:\/\//i.test(rawEvImg)) {
              evImgBase = resolveMediaUrl(rawEvImg) || rawEvImg
            }
            // Mismo card que `pages/events/list`.
            const openEvent = () => window.open(`/events/${eventSlug}`, '_blank', 'noopener,noreferrer')
            return (
              <div
                key={`e-${event.id}`}
                className="flex w-full cursor-pointer flex-col gap-5 border bg-white p-5 transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#172338]"
                tabIndex={0}
                role="link"
                aria-label={`Open ${event.name || 'event'}`}
                onClick={openEvent}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openEvent()
                  }
                }}
              >
                <div className="relative h-60 w-full cursor-inherit overflow-hidden">
                  <button
                    type="button"
                    className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 backdrop-blur-sm transition hover:bg-white disabled:opacity-70"
                    aria-pressed
                    aria-label="Remove from favourites"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      void handleRemoveEventFavorite(event.id)
                    }}
                    disabled={pendingEventFavoriteIds.has(event.id)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
                        stroke="#ef4444"
                        fill="#ef4444"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </button>
                  <img src={evImgBase} alt={event.name || 'Event'} className="h-full w-full cursor-inherit object-cover" />
                </div>
                <h3 className="font-gtsuper-ds text-2xl font-light">{event.name || 'Event'}</h3>
                <span className="pointer-events-none font-haas text-sm underline text-primary">
                  View More
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const formatDateLocal = (value: string | null | undefined, dateOnly = false): string | null => {
    if (!value) return null
    if (dateOnly) {
      const parts = String(value).split('T')[0].split('-').map(Number)
      if (parts.length !== 3) return null
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    const d = new Date(value)
    if (isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const renderBookingsSection = () => {
    if (bookingsLoading) return <TripsSectionSkeleton />

    if (bookings.length === 0) {
      return (
        <div className="flex flex-col">
          <SectionHeading eyebrow="Journeys" title="My bookings" />
          <ProfileEmptyState
            image="/images/Mykonos-image.jpg"
            eyebrow="Your next escape"
            title="No journeys planned yet"
            description="Once you book with us, your itineraries — villa, services and experiences — will be gathered here."
            actions={[
              { href: '/villas/list', label: 'Explore stays' },
              { href: '/concierge/list', label: 'Concierge' },
            ]}
          />
        </div>
      )
    }

    // Viaje destacado: el más próximo que esté en curso o por venir.
    const featuredTrip = bookings
      .filter((it: any) => {
        const status = getTripStatus(it.startDate, it.endDate)
        return status === 'upcoming' || status === 'ongoing'
      })
      .sort((a: any, b: any) => String(a.startDate || '').localeCompare(String(b.startDate || '')))[0]
    const listBookings = featuredTrip ? bookings.filter((it: any) => it !== featuredTrip) : bookings

    const totalBookingPages = Math.ceil(listBookings.length / PAGE_SIZE)
    const pagedBookings = listBookings.slice((bookingsPage - 1) * PAGE_SIZE, bookingsPage * PAGE_SIZE)

    const renderFeaturedTrip = () => {
      if (!featuredTrip) return null
      const start = formatDateLocal(featuredTrip.startDate, true)
      const end = formatDateLocal(featuredTrip.endDate, true)
      const status = getTripStatus(featuredTrip.startDate, featuredTrip.endDate)
      const days = daysUntil(featuredTrip.startDate)
      const Tag = featuredTrip.slug ? 'a' : 'div'
      const linkProps = featuredTrip.slug ? { href: `/itinerary/${featuredTrip.slug}`, target: '_blank', rel: 'noopener noreferrer' } : {}
      return (
        <Tag {...linkProps} className="group relative block overflow-hidden min-h-[320px] md:min-h-[380px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolveItineraryImage(featuredTrip)}
            alt={featuredTrip.name || 'Itinerary'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
            onError={(e) => { (e.target as HTMLImageElement).src = VILLA_LIST_PLACEHOLDER }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/90 via-[#172338]/35 to-transparent" />
          <div className="relative flex h-full min-h-[320px] md:min-h-[380px] flex-col justify-between p-6 md:p-10">
            <div className="flex items-center justify-between gap-3">
              <span className="font-haas text-[10px] uppercase tracking-[0.22em] text-white/80">
                {status === 'ongoing' ? 'Currently travelling' : 'Your next journey'}
              </span>
              {status === 'upcoming' && typeof days === 'number' && days >= 0 && (
                <span className="rounded-full bg-white/15 backdrop-blur px-4 py-1.5 font-haas text-[11px] uppercase tracking-[0.14em] text-white">
                  {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                </span>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex flex-col gap-3 min-w-0">
                <h3 className="font-gtsuper-ds font-light text-3xl md:text-[40px] leading-[1.05] text-white">
                  {featuredTrip.name || featuredTrip.title || 'Booking'}
                </h3>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-haas text-sm text-white/85">
                  {featuredTrip.destination && (
                    <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {featuredTrip.destination}</span>
                  )}
                  {(start || end) && (
                    <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {[start, end].filter(Boolean).join(' — ')}</span>
                  )}
                  {featuredTrip.guests && (
                    <span className="inline-flex items-center gap-1.5"><Users size={14} /> {featuredTrip.guests} guests</span>
                  )}
                </div>
              </div>
              {featuredTrip.slug && (
                <span className="shrink-0 inline-flex items-center gap-2 self-start md:self-auto bg-[#28F7EA] text-[#172338] px-6 py-3 text-[11px] uppercase tracking-[0.16em]">
                  View itinerary <ArrowUpRight size={14} />
                </span>
              )}
            </div>
          </div>
        </Tag>
      )
    }

    return (
      <div className="flex flex-col gap-8">
        <SectionHeading eyebrow="Journeys" title="My bookings" count={bookings.length} />
        {renderFeaturedTrip()}
        {listBookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {featuredTrip && (
              <h3 className="font-haas text-[10px] uppercase tracking-[0.22em] text-[#9a8f80]">All itineraries</h3>
            )}
            {pagedBookings.map((itinerary: any) => {
              const start = formatDateLocal(itinerary.startDate, true)
              const end = formatDateLocal(itinerary.endDate, true)
              const status = getTripStatus(itinerary.startDate, itinerary.endDate)
              const Tag = itinerary.slug ? 'a' : 'div'
              const linkProps = itinerary.slug ? { href: `/itinerary/${itinerary.slug}`, target: '_blank', rel: 'noopener noreferrer' } : {}
              return (
                <Tag
                  key={itinerary.id}
                  {...linkProps}
                  className="group flex flex-col sm:flex-row bg-white ring-1 ring-[#172338]/[0.08] overflow-hidden transition duration-300 hover:shadow-[0_18px_40px_-20px_rgba(23,35,56,0.35)]"
                >
                  <div className="relative h-44 sm:h-auto sm:w-56 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveItineraryImage(itinerary)}
                      alt={itinerary.name || 'Itinerary'}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      onError={(e) => { (e.target as HTMLImageElement).src = VILLA_LIST_PLACEHOLDER }}
                    />
                  </div>
                  <div className="flex flex-1 items-center gap-4 p-5 sm:p-6 min-w-0">
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      {status && (
                        <span className={`self-start rounded-full px-3 py-1 font-haas text-[10px] uppercase tracking-[0.14em] ${TRIP_STATUS_STYLES[status].className}`}>
                          {TRIP_STATUS_STYLES[status].label}
                        </span>
                      )}
                      <h3 className="font-gtsuper-ds font-light text-xl text-[#172338] truncate">{itinerary.name || itinerary.title || 'Booking'}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-haas text-xs text-[#506A70]">
                        {itinerary.destination && (
                          <span className="inline-flex items-center gap-1"><MapPin size={12} /> {itinerary.destination}</span>
                        )}
                        {(start || end) && (
                          <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {[start, end].filter(Boolean).join(' — ')}</span>
                        )}
                        {itinerary.guests && (
                          <span className="inline-flex items-center gap-1"><Users size={12} /> {itinerary.guests} guests</span>
                        )}
                      </div>
                    </div>
                    {itinerary.slug && (
                      <span className="hidden sm:flex shrink-0 h-10 w-10 items-center justify-center rounded-full border border-[#e5e0d8] text-[#172338] transition group-hover:bg-[#172338] group-hover:text-white group-hover:border-[#172338]">
                        <ArrowUpRight size={16} />
                      </span>
                    )}
                  </div>
                </Tag>
              )
            })}
          </div>
        )}
        {renderPagination(bookingsPage, totalBookingPages, listBookings.length, setBookingsPage)}
      </div>
    )
  }

  const renderPagination = (
    page: number,
    totalPages: number,
    totalItems: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    if (totalPages <= 1) return null
    const buttonClass =
      'h-9 w-9 flex items-center justify-center rounded-full border border-[#e5e0d8] text-[#172338] hover:border-[#172338] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-haas text-sm'
    return (
      <div className="flex items-center justify-between pt-2">
        <span className="font-haas text-xs text-[#9a8f80]">
          {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalItems)} of {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={buttonClass} aria-label="Previous page">
            ‹
          </button>
          <span className="font-haas text-xs text-[#172338] px-1">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={buttonClass} aria-label="Next page">
            ›
          </button>
        </div>
      </div>
    )
  }

  const renderOffersSection = () => {
    if (offersLoading) return <TripsSectionSkeleton />

    if (offers.length === 0) {
      return (
        <div className="flex flex-col">
          <SectionHeading eyebrow="Curated for you" title="My offers" />
          <ProfileEmptyState
            image="/images/global-concierge.png"
            eyebrow="Tailor-made"
            title="Your proposals will appear here"
            description="When our team curates a selection of villas and services for you, each personalised proposal will be waiting in this space."
            actions={[{ href: '/contact-us', label: 'Talk to our team' }]}
          />
        </div>
      )
    }

    const totalOfferPages = Math.ceil(offers.length / PAGE_SIZE)
    const pagedOffers = offers.slice((offersPage - 1) * PAGE_SIZE, offersPage * PAGE_SIZE)
    return (
      <div className="flex flex-col gap-8">
        <SectionHeading eyebrow="Curated for you" title="My offers" count={offers.length} />
        <div className="flex flex-col gap-4">
          {pagedOffers.map((offer: any, index: number) => {
            const createdAt = formatDateLocal(offer.createdAt)
            const slug = offer.slug || offer.id
            const sections = Array.isArray(offer.propertiesToPresent) ? offer.propertiesToPresent.length : 0
            const number = String((offersPage - 1) * PAGE_SIZE + index + 1).padStart(2, '0')
            return (
              <a
                key={offer.id}
                href={`/shared-properties/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-stretch bg-white ring-1 ring-[#172338]/[0.08] overflow-hidden transition duration-300 hover:shadow-[0_18px_40px_-20px_rgba(23,35,56,0.35)]"
              >
                <div className="hidden sm:flex w-28 shrink-0 flex-col items-center justify-center gap-1 bg-[#172338] text-white">
                  <span className="font-gtsuper-ds font-light text-3xl leading-none">{number}</span>
                  <span className="font-haas text-[9px] uppercase tracking-[0.22em] text-[#D99330]">Proposal</span>
                </div>
                <div className="flex flex-1 items-center gap-4 p-5 sm:p-6 min-w-0 border-l-2 border-[#D99330] sm:border-l-0">
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {createdAt && (
                      <span className="font-haas text-[10px] uppercase tracking-[0.18em] text-[#9a8f80]">Shared {createdAt}</span>
                    )}
                    <h3 className="font-gtsuper-ds font-light text-xl text-[#172338] truncate">{offer.offerName || offer.title || 'Proposal'}</h3>
                    {offer.welcomeTitle && <p className="font-haas font-light text-sm text-[#506A70] truncate">{offer.welcomeTitle}</p>}
                    {sections > 0 && (
                      <span className="font-haas text-xs text-[#B17520]">
                        {sections} {sections === 1 ? 'section' : 'sections'}
                      </span>
                    )}
                  </div>
                  <span className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full border border-[#e5e0d8] text-[#172338] transition group-hover:bg-[#172338] group-hover:text-white group-hover:border-[#172338]">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </a>
            )
          })}
        </div>
        {renderPagination(offersPage, totalOfferPages, offers.length, setOffersPage)}
      </div>
    )
  }

  const OwnerPropertyPicker = () => {
    if (ownedProperties.length <= 1) return null
    return (
      <div className="mb-2">
        <label className="block text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-normal mb-1.5">Property</label>
        <select
          value={selectedOwnerPropertyId ?? ''}
          onChange={(e) => setSelectedOwnerPropertyId(e.target.value)}
          className="border border-[#e5e0d8] px-3 py-2.5 text-sm text-[#172338] bg-white focus:outline-none focus:border-[#D99330] cursor-pointer max-w-sm"
        >
          {ownedProperties.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>
    )
  }

  const renderOwnerTabShell = (title: string, content: React.ReactNode) => (
    <div className="flex flex-col gap-8">
      <SectionHeading eyebrow="Owner" title={title} />
      <OwnerPropertyPicker />
      {content}
    </div>
  )

  const renderOwnerCalendarSection = () => {
    if (ownerReportLoading || !ownerReport) return <TripsSectionSkeleton />
    return renderOwnerTabShell(
      'Calendar',
      <div className="border border-[#e5e0d8] bg-white p-4 md:p-8">
        <AvailabilityCalendar blockedDates={ownerReport.villa.blockedDates} showPrices={false} dayCellClassName="h-12" />
      </div>,
    )
  }

  const renderOwnerBookingsSection = () => {
    if (ownerBookingsLoading || !ownerReport) return <TripsSectionSkeleton />
    return renderOwnerTabShell(
      'Property Bookings',
      <OwnerBookingsTable
        bookings={ownerBookings}
        currency={ownerReport.villa.currency}
        isRealEstate={ownerReport.villa.isRealEstate}
      />,
    )
  }

  const renderOwnerNegotiationsSection = () => {
    if (ownerReportLoading || !ownerReport) return <TripsSectionSkeleton />
    return renderOwnerTabShell('Negotiations', <NegotiationsTable report={ownerReport} />)
  }

  // Temporarily disabled — its revenue content moved into renderOwnerFiguresSection below (per
  // owner request: "Figures" is where the owner's revenue belongs). Re-enable alongside the
  // commented 'ownerAnalytics' entries in PROFILE_NAV_TABS/OWNER_TABS if Analytics gets its own
  // distinct content later.
  // const renderOwnerAnalyticsSection = () => {
  //   if (ownerReportLoading || !ownerReport) return <TripsSectionSkeleton />
  //   return renderOwnerTabShell('Analytics', ...)
  // }

  const renderOwnerFiguresSection = () => {
    if (ownerReportLoading || !ownerReport) return <TripsSectionSkeleton />
    return renderOwnerTabShell(
      'Figures',
      <div className="flex flex-col gap-8">
        <KpiStrip report={ownerReport} />
        <MonthlyBars report={ownerReport} />
        {ownerReport.yearlyPerformance.length > 1 && (
          <>
            <YearlyPerformanceBars data={ownerReport.yearlyPerformance} currentYear={ownerReport.currentYear} currency={ownerReport.villa.currency} />
            <YearlyPerformanceTable data={ownerReport.yearlyPerformance} currentYear={ownerReport.currentYear} currency={ownerReport.villa.currency} />
            <YearlyPerformanceInsights
              data={ownerReport.yearlyPerformance}
              currentYear={ownerReport.currentYear}
              negotiationsCount={ownerReport.stats.negotiationsCount}
              negotiationsValue={ownerReport.stats.negotiationsValue}
              currency={ownerReport.villa.currency}
            />
          </>
        )}
      </div>,
    )
  }

  const renderOwnerContractsSection = () => {
    if (ownerBookingsLoading) return <TripsSectionSkeleton />
    return renderOwnerTabShell('Contracts', <ContractsList bookings={ownerBookings} />)
  }

  const renderOwnerComplaintsSection = () => {
    if (ownerBookingsLoading || !ownerReport) return <TripsSectionSkeleton />
    return renderOwnerTabShell('Client Complaints', <ComplaintsList bookings={ownerBookings} currency={ownerReport.villa.currency} />)
  }

  const renderCurrentSection = () => {
    switch (selectedTab) {
      case 'profile':
        return renderProfileSection()
      case 'favorites':
        return renderFavoritesSection()
      case 'bookings':
        return renderBookingsSection()
      case 'offers':
        return renderOffersSection()
      case 'ownerCalendar':
        return renderOwnerCalendarSection()
      case 'ownerBookings':
        return renderOwnerBookingsSection()
      case 'ownerNegotiations':
        return renderOwnerNegotiationsSection()
      // case 'ownerAnalytics':
      //   return renderOwnerAnalyticsSection()
      case 'ownerFigures':
        return renderOwnerFiguresSection()
      case 'ownerContracts':
        return renderOwnerContractsSection()
      case 'ownerComplaints':
        return renderOwnerComplaintsSection()
      case 'reports':
        return <OwnerReportSection properties={ownedProperties} />
      default:
        return null
    }
  }

  const renderSlidePanel = () => {
    const titles: Record<NonNullable<ActivePanel>, string> = {
      personal: 'Edit Personal Info',
      contact: 'Edit Contact Details',
      password: 'Change Password',
      changeEmail: 'Change Email',
    }

    const handleClose = () => {
      setActivePanel(null)
      setProfileMessage(null)
      setContactMessage(null)
      setPasswordMessage(null)
      setPasswordError(null)
      setEmailChangeMessage(null)
      setEmailChangeSent(false)
    }

    const isOpen = activePanel !== null

    return (
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-[#172338]/50 z-[80] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={handleClose}
          aria-hidden
        />
        {/* Panel */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[90] overflow-y-auto shadow-[-4px_0_32px_rgba(0,0,0,0.18)] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Header del panel */}
          <div className="flex items-center justify-between px-7 py-6 border-b border-[#e5e0d8]">
            <h2 className="font-haas text-sm uppercase tracking-[0.12em] text-[#172338]">
              {titles[activePanel]}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-[#9a8f80] hover:text-[#172338] transition text-xl leading-none"
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>

          {/* Body del panel */}
          <div className="flex-1 px-7 py-8">
            {activePanel === 'personal' && (
              <form className="flex flex-col gap-5" onSubmit={handleProfileSubmit}>
                <div className="flex flex-col items-center gap-2 mb-1">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-[#f5f3ef] border border-[#e5e0d8] flex items-center justify-center">
                      {profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profilePictureUrl} alt="Profile picture" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={36} className="text-[#9a8f80]" />
                      )}
                    </div>
                    <label
                      htmlFor="profile-avatar-input"
                      className={`absolute bottom-0 right-0 bg-[#172338] text-white rounded-full p-1.5 transition ${avatarUploading ? 'opacity-60' : 'cursor-pointer hover:opacity-90'}`}
                      aria-label="Change profile picture"
                    >
                      <Camera size={14} />
                    </label>
                    <input
                      id="profile-avatar-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={avatarUploading}
                    />
                  </div>
                  {profilePictureUrl && !avatarUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs font-haas text-[#9a8f80] underline underline-offset-2 hover:text-[#D04444] transition"
                    >
                      Remove photo
                    </button>
                  )}
                  {avatarUploading && <span className="text-xs font-haas text-[#9a8f80]">Uploading...</span>}
                  {avatarError && <span className="text-xs font-haas text-[#D04444]">{avatarError}</span>}
                </div>
                <label className="flex flex-col gap-1.5">
                  <FieldLabel text="First Name" required />
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <FieldLabel text="Last Name" required />
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <FieldLabel text="Birthday" />
                  <BirthdayPicker
                    value={profileForm.birthday}
                    onChange={(val) => setProfileForm((prev) => ({ ...prev, birthday: val }))}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <FieldLabel text="Nationality" />
                  <input
                    type="text"
                    value={profileForm.nationality}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, nationality: e.target.value }))}
                    className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                {profileMessage && (
                  <p className={`text-sm font-haas ${profileMessage.includes('success') ? 'text-[#2a7a4a]' : 'text-[#D04444]'}`}>
                    {profileMessage}
                  </p>
                )}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full bg-[#28F7EA] text-[#172338] text-xs tracking-[0.14em] uppercase py-3.5 disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] border border-[#9a8f80] py-3.5 w-full text-center hover:border-[#172338] hover:text-[#172338] transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'contact' && (
              <form className="flex flex-col gap-5" onSubmit={handleContactSubmit}>
                <label className="flex flex-col gap-1.5">
                  <FieldLabel text="Mobile Phone" required />
                  <div className="flex gap-2">
                    <select
                      value={contactForm.countryCode}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, countryCode: e.target.value }))}
                      className="border border-[#e5e0d8] px-2 py-2.5 text-sm text-[#172338] bg-white focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330] w-28 shrink-0"
                    >
                      <option value="">Code</option>
                      {COUNTRY_CODES.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.value}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="e.g. 6912345678"
                      value={contactForm.phoneNumber}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      className="flex-1 border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                    />
                  </div>
                </label>
                {(
                  [
                    { field: 'address', label: 'Address', type: 'text' },
                    { field: 'postalCode', label: 'Postal Code', type: 'text' },
                    { field: 'city', label: 'City', type: 'text' },
                  ] as const
                ).map(({ field, label, type }) => (
                  <label key={field} className="flex flex-col gap-1.5">
                    <FieldLabel text={label} />
                    <input
                      type={type}
                      value={contactForm[field]}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, [field]: e.target.value }))}
                      className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                    />
                  </label>
                ))}
                {contactMessage && (
                  <p className={`text-sm font-haas ${contactMessage.includes('success') ? 'text-[#2a7a4a]' : 'text-[#D04444]'}`}>
                    {contactMessage}
                  </p>
                )}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={contactSaving}
                    className="w-full bg-[#28F7EA] text-[#172338] text-xs tracking-[0.14em] uppercase py-3.5 disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {contactSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] border border-[#9a8f80] py-3.5 w-full text-center hover:border-[#172338] hover:text-[#172338] transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'password' && (
              <form className="flex flex-col gap-5" onSubmit={handlePasswordSubmit}>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-normal">New Password</span>
                  <input
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] font-normal">Confirm Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                  />
                </label>
                {passwordError && <p className="text-sm text-[#D04444] font-haas">{passwordError}</p>}
                {passwordMessage && <p className="text-sm text-[#2a7a4a] font-haas">{passwordMessage}</p>}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full bg-[#28F7EA] text-[#172338] text-xs tracking-[0.14em] uppercase py-3.5 disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {passwordSaving ? 'Saving...' : 'Update Password'}
                  </button>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] border border-[#9a8f80] py-3.5 w-full text-center hover:border-[#172338] hover:text-[#172338] transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'changeEmail' && (
              emailChangeSent ? (
                <div className="flex flex-col gap-5">
                  <p className="text-sm text-[#172338] font-haas">
                    {emailChangeMessage || `We sent a confirmation link to ${email}.`}
                  </p>
                  <p className="text-sm text-[#9a8f80] font-haas">
                    Open that email and click the link to confirm your new address. The link expires in 1 hour.
                  </p>
                  <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] border border-[#9a8f80] py-3.5 w-full text-center hover:border-[#172338] hover:text-[#172338] transition">
                    Close
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-5" onSubmit={handleRequestEmailChange}>
                  <p className="text-sm text-[#9a8f80] font-haas">
                    Enter your new email address. We'll send a confirmation link to your current email
                    ({email}) to verify this change.
                  </p>
                  <label className="flex flex-col gap-1.5">
                    <FieldLabel text="New Email" required />
                    <input
                      type="email"
                      value={emailChangeForm.newEmail}
                      onChange={(e) => setEmailChangeForm({ newEmail: e.target.value })}
                      className="border border-[#e5e0d8] px-4 py-2.5 text-sm text-[#172338] focus:outline-none focus:border-[#D99330] focus:ring-1 focus:ring-[#D99330]"
                    />
                  </label>
                  {emailChangeMessage && (
                    <p className="text-sm text-[#D04444] font-haas">{emailChangeMessage}</p>
                  )}
                  <div className="flex flex-col gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={emailChangeSaving}
                      className="w-full bg-[#28F7EA] text-[#172338] text-xs tracking-[0.14em] uppercase py-3.5 disabled:opacity-50 hover:opacity-90 transition"
                    >
                      {emailChangeSaving ? 'Sending...' : 'Send Confirmation Link'}
                    </button>
                    <button type="button" onClick={handleClose} className="text-sm text-[#9a8f80] border border-[#9a8f80] py-3.5 w-full text-center hover:border-[#172338] hover:text-[#172338] transition">
                      Cancel
                    </button>
                  </div>
                </form>
              )
            )}
          </div>
        </div>
      </>
    )
  }

  const tabLabels: Record<ProfileNavTab, string> = {
    profile: 'My Profile',
    favorites: 'My Favorites',
    bookings: 'My Bookings',
    offers: 'My Offers',
    ownerCalendar: 'Calendar',
    ownerBookings: 'Property Bookings',
    ownerNegotiations: 'Negotiations',
    ownerAnalytics: 'Analytics', // tab temporarily disabled, see OWNER_TABS above — entry kept only to satisfy Record<ProfileNavTab, string>
    ownerFigures: 'Figures',
    ownerContracts: 'Contracts',
    ownerComplaints: 'Client Complaints',
    reports: 'Full Report',
  }

  const renderHero = () => (
    <section className="relative overflow-hidden bg-[#172338] text-white">
      <div className="pointer-events-none absolute -right-32 -top-40 h-[460px] w-[460px] rounded-full bg-[#D99330]/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -left-24 bottom-[-220px] h-[380px] w-[380px] rounded-full bg-[#28F7EA]/[0.07] blur-3xl" aria-hidden />
      <div className="relative w-full max-w-[1920px] mx-auto px-5 md:px-8 lg:px-12 py-10 md:py-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 min-w-0">
          <button
            type="button"
            onClick={() => { syncProfileFormOnly(); setActivePanel('personal') }}
            className="group relative shrink-0 self-start sm:self-auto rounded-full ring-1 ring-[#D99330]/70 ring-offset-4 ring-offset-[#172338]"
            aria-label="Edit profile picture"
          >
            <span className="flex h-24 w-24 md:h-28 md:w-28 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profilePictureUrl} alt={displayName || 'Profile picture'} className="h-full w-full object-cover" />
              ) : initials ? (
                <span className="font-gtsuper-ds font-light text-3xl md:text-4xl text-white">{initials}</span>
              ) : (
                <UserIcon size={36} className="text-white/60" />
              )}
            </span>
            <span className="absolute bottom-0.5 right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#D99330] text-[#172338] shadow-md transition group-hover:scale-110">
              <Camera size={14} />
            </span>
          </button>
          <div className="flex flex-col gap-3 min-w-0">
            <span className="font-haas text-[10px] uppercase tracking-[0.24em] text-[#D99330]">
              {isOwner ? 'Owner account' : 'Welcome back'}
            </span>
            <h1 className="font-gtsuper-ds font-light text-[34px] md:text-5xl leading-[1.05] text-white break-words">
              {displayName || 'My account'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-haas text-sm text-white/70">
              {email !== 'Not provided' && <span className="truncate">{email}</span>}
              {heroLocation && (
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-white/50" /> {heroLocation}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <div className="w-full">
      {renderHero()}

      <div className="w-full max-w-[1920px] mx-auto flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className="hidden md:block w-72 lg:w-80 shrink-0 bg-[#fcfbf9] pl-6 lg:pl-12 pt-12">
          <div className="sticky top-[130px] bg-gradient-to-b from-white to-[#faf8f4] border border-[#e8e1d4] shadow-[0_30px_60px_-36px_rgba(23,35,56,0.35)]">
            <div className="flex items-center gap-4 px-7 pt-7 pb-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-[#D99330]/60 ring-offset-2 ring-offset-white bg-[#172338]">
                {profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePictureUrl} alt="" className="h-full w-full object-cover" />
                ) : initials ? (
                  <span className="font-haas text-base text-white">{initials}</span>
                ) : (
                  <UserIcon size={18} className="text-white/70" />
                )}
              </span>
              <div className="min-w-0">
                <span className="block font-haas text-[9px] uppercase tracking-[0.28em] text-[#D99330]">
                  {isOwner ? 'Owner' : 'Member'}
                </span>
                <span className="block mt-1 font-haas font-medium text-[17px] leading-tight text-[#172338] truncate">
                  {displayName || 'My account'}
                </span>
              </div>
            </div>

            <div className="mx-7 h-px bg-[#e8e1d4]" />

            <nav className="flex flex-col py-3">
              {visibleTabs.map((tab) => {
                const Icon = TAB_ICONS[tab]
                const active = selectedTab === tab
                const count = tabCounts[tab]
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={`group relative w-full flex items-center gap-4 text-left pl-7 pr-6 py-4 transition-all duration-300 ${
                      active ? 'bg-gradient-to-r from-[#D99330]/10 to-transparent' : 'hover:bg-[#f5f3ef]/70'
                    }`}
                  >
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] bg-[#D99330] transition-all duration-300 ${
                        active ? 'h-8 opacity-100' : 'h-0 opacity-0 group-hover:h-4 group-hover:opacity-60'
                      }`}
                      aria-hidden
                    />
                    <Icon
                      size={17}
                      strokeWidth={1.25}
                      className={`shrink-0 transition-colors ${active ? 'text-[#D99330]' : 'text-[#a99f90] group-hover:text-[#172338]'}`}
                    />
                    <span
                      className={`flex-1 font-haas text-[15px] leading-tight transition-colors ${
                        active ? 'text-[#172338]' : 'text-[#172338]/65 group-hover:text-[#172338]'
                      }`}
                    >
                      {tabLabels[tab]}
                    </span>
                    {typeof count === 'number' && count > 0 && (
                      <span
                        className={`flex h-6 min-w-[24px] items-center justify-center rounded-full border px-1.5 font-haas text-[10px] tabular-nums transition-colors ${
                          active ? 'border-[#D99330] bg-[#D99330] text-white' : 'border-[#d9d0bf] text-[#8a7f70]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            <div className="mx-7 h-px bg-[#e8e1d4]" />
            <button
              type="button"
              className="group w-full flex items-center justify-between px-7 py-5 font-haas text-[10px] uppercase tracking-[0.24em] text-[#9a8f80] hover:text-[#172338] transition-colors"
              onClick={logout}
            >
              Log out
              <LogOut size={14} strokeWidth={1.25} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </aside>

        {/* ── Mobile tabs (< md) ── */}
        <div className="md:hidden w-full flex flex-col">
          <div className="bg-[#172338] flex px-4 overflow-x-auto border-t border-white/10">
            {visibleTabs.map((tab) => {
              const count = tabCounts[tab]
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`py-3.5 px-4 text-[11px] uppercase tracking-[0.12em] border-b-2 whitespace-nowrap transition-colors ${
                    selectedTab === tab
                      ? 'text-white border-[#D99330]'
                      : 'text-white/45 border-transparent hover:text-white/70'
                  }`}
                >
                  {tabLabels[tab]}
                  {typeof count === 'number' && count > 0 && <span className="ml-1.5 text-[#D99330]">{count}</span>}
                </button>
              )
            })}
          </div>
          <div className="flex-1 bg-[#fcfbf9] px-5 py-8">
            {renderCurrentSection()}
          </div>
          <div className="px-5 pb-10 bg-[#fcfbf9]">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-[#9a8f80] text-[11px] uppercase tracking-[0.16em] hover:text-[#172338] transition"
              onClick={logout}
            >
              <LogOut size={14} strokeWidth={1.5} /> Log out
            </button>
          </div>
        </div>

        {/* ── Content (desktop) ── */}
        <main className="hidden md:block flex-1 bg-[#fcfbf9] px-8 lg:px-14 py-12 min-w-0">
          {renderCurrentSection()}
        </main>
      </div>

      {/* ── Slide Panel ── */}
      {renderSlidePanel()}
    </div>
  )
}

export default MyProfilePage
