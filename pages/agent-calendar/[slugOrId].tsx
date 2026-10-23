import type { GetServerSidePropsContext } from 'next'
import Link from 'next/link'
import { TbBed, TbUsers, TbPool, TbBarbell, TbCalendarEvent, TbExternalLink, TbArrowLeft } from 'react-icons/tb'
import { getProperty, getPropertyBySlug } from '@/lib/api/properties'
import { getAvailabilityDateRange } from '@/lib/api/availabilityRange'
import { API_BASE_URL } from '@/lib/api/fetcher'
import { buildOfferPublicPropertyDetailPath } from '@/lib/rentalRoute'
import { getOfferPublicSiteBaseUrl } from '@/lib/offerPublicSiteUrl'
import { getPropertyLocationLabel, resolveMediaUrl } from '@/lib/utils'
import AvailabilityCalendar from '@/components/custom/AvailabilityCalendar'
import AvailabilityLegend from '@/components/custom/AvailabilityLegend'
import { SeoHead } from '@/components/seo/SeoHead'
import { getPublicSiteOriginFromRequest } from '@/lib/seo/config'

const WINDOW_DAYS = 90
const PLACEHOLDER_IMAGE = '/images/villa-detail@2x.png'

const toDateStr = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const hasContent = (value: unknown): boolean =>
  Boolean(value && typeof value === 'object' && Object.keys(value as object).length > 0)

const resolveHeroImage = (property: any): string => {
  const images = Array.isArray(property?.images) ? property.images : []
  if (images.length === 0) return PLACEHOLDER_IMAGE
  const primary = images.find((img: any) => img?.isPrimary === true || img?.is_primary === true || img?.primary === true)
  const raw = primary?.urlImage || primary?.url || images[0]?.urlImage || images[0]?.url || ''
  if (!raw) return PLACEHOLDER_IMAGE
  if (/^https?:\/\//i.test(raw)) return raw
  return resolveMediaUrl(raw) || PLACEHOLDER_IMAGE
}

/** Solo lo que la grilla necesita por día — el objeto `property` completo no viaja al cliente. */
type AvailabilityRangeSlim = {
  from: string | Date
  to: string | Date
  is_available: boolean | null
  price_per_night: number | null
  min_stay: number | null
  disabled_dates: string[]
}

type Props = {
  title: string
  bedrooms: number | null
  guests: number | null
  hasPool: boolean
  hasGym: boolean
  locationLabel: string
  heroImage: string
  villaUrl: string
  icalUrl: string
  items: AvailabilityRangeSlim[]
  blockedDates: string[]
  windowFrom: string
  windowTo: string
  siteOrigin: string
  canonicalPath: string
}

export default function AgentVillaCalendarPage({
  title,
  bedrooms,
  guests,
  hasPool,
  hasGym,
  locationLabel,
  heroImage,
  villaUrl,
  icalUrl,
  items,
  blockedDates,
  windowFrom,
  windowTo,
  siteOrigin,
  canonicalPath,
}: Props) {
  // AvailabilityCalendar expects `undefined` for "not set" — props coming from getServerSideProps
  // use `null` instead (Next.js can't serialize `undefined`), so adapt at the render boundary.
  const calendarRanges = items.map((item) => ({
    from: item.from,
    to: item.to,
    is_available: item.is_available ?? undefined,
    price_per_night: item.price_per_night ?? undefined,
    min_stay: item.min_stay ?? undefined,
    disabled_dates: item.disabled_dates,
  }))

  // Resumen "At a glance" — derivado de los mismos rangos que alimentan el calendario,
  // sin llamadas extra. Cualquier métrica sin dato simplemente no se muestra.
  const eur = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
  const nextDay = (d: string): string => {
    const t = new Date(`${d}T00:00:00`)
    t.setDate(t.getDate() + 1)
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  }
  const availableRanges = items.filter((r) => r.is_available === true)
  const prices = availableRanges.map((r) => r.price_per_night ?? 0).filter((n) => n > 0)
  const minStays = availableRanges.map((r) => r.min_stay ?? 0).filter((n) => n > 0)
  const priceMin = prices.length ? Math.min(...prices) : null
  const priceMax = prices.length ? Math.max(...prices) : null
  const minStay = minStays.length ? Math.min(...minStays) : null

  const blockedSet = new Set(blockedDates)
  const openDates: string[] = []
  for (const r of availableRanges) {
    const from = String(r.from).slice(0, 10)
    const to = String(r.to).slice(0, 10)
    const disabled = new Set((r.disabled_dates || []).map((d) => String(d).slice(0, 10)))
    let cursor = from < windowFrom ? windowFrom : from
    let guard = 0
    while (cursor <= to && cursor <= windowTo && guard < 400) {
      if (!blockedSet.has(cursor) && !disabled.has(cursor)) openDates.push(cursor)
      cursor = nextDay(cursor)
      guard++
    }
  }
  const uniqueOpen = Array.from(new Set(openDates)).sort()
  const openNights = uniqueOpen.length
  const firstOpen = uniqueOpen[0] || null
  const firstOpenLabel = firstOpen
    ? new Date(`${firstOpen}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    : null
  const priceLabel = priceMin
    ? priceMax && priceMax !== priceMin
      ? `${eur(priceMin)}–${eur(priceMax)}`
      : `From ${eur(priceMin)}`
    : null
  const summaryRows: Array<[string, string]> = [
    priceLabel ? ['Nightly rate', priceLabel] : null,
    minStay ? ['Minimum stay', `${minStay} ${minStay === 1 ? 'night' : 'nights'}`] : null,
    firstOpenLabel ? ['First opening', firstOpenLabel] : null,
    openNights ? ['Open nights', `${openNights} in the next 90 days`] : null,
  ].filter((r): r is [string, string] => r !== null)

  const seoDescription = [
    bedrooms ? `${bedrooms} bedrooms` : null,
    guests ? `${guests} guests` : null,
    locationLabel || null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <SeoHead
        title={`${title} — Availability & Rates`}
        description={seoDescription ? `${seoDescription}. Check live availability and nightly rates.` : 'Check live availability and nightly rates.'}
        siteOrigin={siteOrigin}
        canonicalPath={canonicalPath}
        imageUrl={heroImage}
        noindex
      />
      <div className="min-h-screen bg-white">
        {/* Hero — el navy de marca queda de fondo mientras carga la imagen (o si falla). */}
        <section className="relative h-[min(52vh,420px)] w-full bg-[#172338]">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url("${heroImage}")`, backgroundRepeat: 'no-repeat' }}
          />
          <Link
            href="/agent-calendar"
            className="absolute top-5 left-6 md:left-20 lg:left-32 inline-flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-[#172338] font-haas font-light text-xs hover:bg-white transition-colors"
          >
            <TbArrowLeft size={14} className="text-[#D99330]" />
            All villas
          </Link>
        </section>

        {/* Title block */}
        <section className="px-6 md:px-20 lg:px-32 py-8 md:py-10">
          {locationLabel ? (
            <p className="font-haas font-light text-[11px] md:text-xs tracking-[0.24em] uppercase text-[#D99330] mb-3">
              {locationLabel}
            </p>
          ) : null}
          <h1 className="text-[clamp(1.8rem,4vw,3.2rem)] font-gtsuper-ds font-light leading-[0.95] tracking-[-0.01em] text-[#172338] mb-6">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pb-5 border-b border-[#E2E8EB]">
            {bedrooms ? (
              <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                <TbBed size={17} className="text-[#D99330]" />
                <span>{bedrooms} Bedrooms</span>
              </div>
            ) : null}
            {guests ? (
              <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                <TbUsers size={17} className="text-[#D99330]" />
                <span>{guests} Guests</span>
              </div>
            ) : null}
            {hasPool ? (
              <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                <TbPool size={17} className="text-[#D99330]" />
                <span>Pool</span>
              </div>
            ) : null}
            {hasGym ? (
              <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                <TbBarbell size={17} className="text-[#D99330]" />
                <span>Gym</span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={villaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200"
            >
              <TbExternalLink className="text-[#D99330]" size={16} />
              View villa page
            </a>
            <a
              href={icalUrl}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200"
            >
              <TbCalendarEvent className="text-[#D99330]" size={16} />
              Subscribe (iCal)
            </a>
          </div>
        </section>

        {/* Availability */}
        <section className="px-6 md:px-20 lg:px-32 pb-14">
          <p className="font-haas font-light text-[11px] uppercase tracking-[0.28em] text-[#D99330] mb-5">
            Availability &amp; Rates
          </p>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,660px)_260px] lg:items-start">
            <div className="border border-[#E2E8EB] bg-white">
              <div className="flex items-center gap-4 p-6 md:p-8 border-b border-[#E2E8EB] bg-[#FDFCF8]">
                <div
                  className="w-16 h-16 shrink-0 bg-cover bg-center bg-[#172338]"
                  style={{ backgroundImage: `url("${heroImage}")`, backgroundRepeat: 'no-repeat' }}
                />
                <div className="min-w-0">
                  <p className="font-gtsuper-ds font-light text-lg text-[#172338] truncate">{title}</p>
                  {locationLabel ? (
                    <p className="font-haas font-light text-[10px] uppercase tracking-[0.18em] text-[#506A70] mt-1">
                      {locationLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <AvailabilityCalendar
                  blockedDates={blockedDates}
                  availabilityRanges={calendarRanges}
                  showPrices
                  inlinePrices
                  dayCellClassName="h-14"
                  windowStart={windowFrom}
                  windowEnd={windowTo}
                />
                <div className="mt-6 pt-5 border-t border-[#E2E8EB]">
                  <AvailabilityLegend variant="calendar" />
                </div>
              </div>
            </div>

            {summaryRows.length > 0 ? (
              <aside className="border border-[#E2E8EB] bg-[#FDFCF8] p-6 lg:p-7">
                <p className="font-haas font-light text-[10px] uppercase tracking-[0.24em] text-[#506A70] mb-4">
                  At a glance
                </p>
                <dl className="divide-y divide-[#E2E8EB]">
                  {summaryRows.map(([label, value]) => (
                    <div key={label} className="flex items-baseline justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <dt className="font-haas font-light text-xs text-[#506A70] shrink-0">{label}</dt>
                      <dd className="font-haas font-light text-sm text-[#172338] text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </aside>
            ) : null}
          </div>
        </section>
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const slugOrId = String(context.params?.slugOrId || '')

  let data: any = null
  try {
    const res = await getProperty(slugOrId)
    if (res && res.success !== false && res.data) {
      data = res.data
    }
  } catch {
    data = null
  }
  if (!data) {
    try {
      const bySlug = await getPropertyBySlug(slugOrId)
      if (bySlug && bySlug.success !== false && bySlug.data) {
        data = bySlug.data
      }
    } catch {
      data = null
    }
  }
  // Unlike the public villa page, this internal agent tool isn't gated by the marketing
  // "published" flag — staff share this link for any villa tracked in Property Management,
  // published on the main site or not (e.g. a villa paused from marketing but still booked).
  if (!data) {
    return { notFound: true }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + WINDOW_DAYS)
  const from = toDateStr(today)
  const to = toDateStr(end)

  const res = await getAvailabilityDateRange({ from, to, propertyIds: [data.id] })
  const rawItems = Array.isArray(res?.data) ? res.data : []
  const blockedDatesByProperty = res?.blockedDatesByProperty || {}

  // Trim each range to just the fields the calendar needs — drop the embedded `property` copy.
  const items: AvailabilityRangeSlim[] = rawItems.map((item: any) => ({
    from: item.from,
    to: item.to,
    is_available: item.is_available ?? null,
    price_per_night: item.price_per_night ?? null,
    min_stay: item.min_stay ?? null,
    disabled_dates: Array.isArray(item.disabled_dates) ? item.disabled_dates : [],
  }))

  const classification = data.classification || {}
  const amenity = data.amenity || {}
  const agentPortfolioBase = getOfferPublicSiteBaseUrl(false)

  return {
    props: {
      title: data.title || 'Villa',
      bedrooms: classification.bedrooms ?? null,
      guests: classification.maxPersons ?? null,
      hasPool: hasContent(amenity.poolWellness),
      hasGym: hasContent(amenity.fitness),
      locationLabel: getPropertyLocationLabel(data),
      heroImage: resolveHeroImage(data),
      villaUrl: `${agentPortfolioBase}${buildOfferPublicPropertyDetailPath(data, { agentFriendly: true })}`,
      icalUrl: `${API_BASE_URL}/property/${data.id}/ical`,
      items,
      blockedDates: blockedDatesByProperty[data.id] || [],
      windowFrom: from,
      windowTo: to,
      siteOrigin: getPublicSiteOriginFromRequest(context.req),
      canonicalPath: `/agent-calendar/${encodeURIComponent(slugOrId)}`,
    },
  }
}
