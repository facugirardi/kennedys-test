import React from 'react'
import Link from 'next/link'
import { eachDayOfInterval, format } from 'date-fns'
import { getPropertyLocationLabel } from '@/lib/utils'

type AvailabilityItem = {
  propertyId: string
  property?: any
  from?: string | Date | null
  to?: string | Date | null
  is_available?: boolean | null
  price_per_night?: number | null
  min_stay?: number | null
}

type Props = {
  startDate: Date
  endDate: Date
  items: AvailabilityItem[]
  blockedDatesByProperty?: Record<string, string[]>
}

const toDateStr = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const addDays = (date: Date, days: number): Date => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

// En línea con la paleta de marca (navy/gold/hairline) en vez de un rojo/verde genérico:
// sage apagado para disponible, el rojo de alerta que ya usa el sitio para ocupado.
const AVAILABLE_COLOR = '#6B8F71'
const BOOKED_COLOR = '#D04444'
const PAST_COLOR = '#EEF2F6'

const formatPrice = (price?: number | null): string =>
  price && price > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)
    : ''

export default function PublicAvailabilityGrid({ startDate, endDate, items, blockedDatesByProperty = {} }: Props) {
  const dateRange = React.useMemo(() => {
    try {
      if (!startDate || !endDate || startDate > endDate) return []
      return eachDayOfInterval({ start: startDate, end: endDate })
    } catch {
      return []
    }
  }, [startDate, endDate])

  const groupedByProperty = React.useMemo(() => {
    const grouped = new Map<
      string,
      { property: any; propertyId: string; blockedSet: Set<string>; priceByDate: Map<string, { price: number | null; minStay: number | null }> }
    >()
    for (const item of Array.isArray(items) ? items : []) {
      const propertyId = item.propertyId
      if (!propertyId) continue
      if (!grouped.has(propertyId)) {
        grouped.set(propertyId, {
          property: item.property,
          propertyId,
          blockedSet: new Set(Array.isArray(blockedDatesByProperty[propertyId]) ? blockedDatesByProperty[propertyId] : []),
          priceByDate: new Map(),
        })
      }
      // Rango con rate — expandirlo día por día para poder mostrar el precio en el hover de cada cuadrado.
      if (item.is_available !== false && item.from && item.to) {
        const group = grouped.get(propertyId)!
        const fromStr = String(item.from).slice(0, 10)
        const toStr = String(item.to).slice(0, 10)
        let cursor = fromStr
        let guard = 0
        while (cursor <= toStr && guard < 400) {
          group.priceByDate.set(cursor, { price: item.price_per_night ?? null, minStay: item.min_stay ?? null })
          cursor = toDateStr(addDays(new Date(`${cursor}T00:00:00`), 1))
          guard++
        }
      }
    }
    return Array.from(grouped.values()).sort((a, b) =>
      String(a.property?.title || '').localeCompare(String(b.property?.title || ''))
    )
  }, [items, blockedDatesByProperty])

  // Agrupación por isla/región (property.region → area → location). El cliente pide ver
  // el calendario separado por ubicación (Mykonos, Paros, …).
  const regionGroups = React.useMemo(() => {
    const regionOf = (p: any): string =>
      String(p?.region || p?.area || p?.location || '').trim() || 'Other location'
    const map = new Map<string, typeof groupedByProperty>()
    for (const g of groupedByProperty) {
      const key = regionOf(g.property)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(g)
    }
    return Array.from(map.entries())
      .map(([region, villas]) => ({ region, villas }))
      .sort((a, b) => {
        // "Other location" siempre al final; el resto alfabético (Mykonos antes que Paros).
        if (a.region === 'Other location') return 1
        if (b.region === 'Other location') return -1
        return a.region.localeCompare(b.region)
      })
  }, [groupedByProperty])

  // Se calcula una sola vez y se reutiliza por celda (antes se instanciaba un Date por cuadrado).
  const today = React.useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const todayStr = toDateStr(today)

  if (dateRange.length === 0) {
    return <p className="font-haas font-light text-sm text-[#506A70]">No dates to display.</p>
  }

  return (
    <div
      className="max-w-full max-h-[calc(100vh-2rem)] overflow-auto overscroll-contain border border-[#E2E8EB] bg-white [-webkit-overflow-scrolling:touch]"
    >
      <table className="border-collapse table-fixed min-w-max w-full">
        <thead>
          <tr>
            <th
              scope="col"
              className="sticky left-0 top-0 z-30 bg-white p-2.5 sm:p-4 border-b border-r border-[#E2E8EB] text-left h-[60px] sm:h-[68px] align-middle w-[150px] min-w-[150px] sm:w-[300px] sm:min-w-[300px] font-haas font-light text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.24em] text-[#D99330]"
            >
              Property
            </th>
            {dateRange.map((date, i) => {
              const dateStr = toDateStr(date)
              const isToday = dateStr === todayStr
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              // Solo el primer día visible y el 1° de cada mes muestran el mes: evita repetir
              // "SEP" en las 90 columnas y da un punto de anclaje al recorrer la grilla.
              const isMonthStart = i === 0 || date.getDate() === 1
              return (
                <th
                  key={date.toISOString()}
                  scope="col"
                  className={`sticky top-0 z-20 border-b border-[#E2E8EB] p-0.5 sm:p-1 w-10 min-w-[40px] sm:w-12 sm:min-w-[48px] text-center h-14 sm:h-16 align-middle ${
                    isMonthStart && i !== 0 ? 'border-l border-[#D99330]/40' : ''
                  } ${isToday ? 'bg-[#FBF4E9]' : 'bg-white'}`}
                >
                  <div className={`font-haas font-light text-[10px] sm:text-[11px] uppercase tracking-[0.08em] ${isWeekend ? 'text-[#D99330]' : 'text-[#506A70]'}`}>
                    {format(date, 'EEE')}
                  </div>
                  <div className={`font-gtsuper-ds font-light text-base sm:text-xl leading-none mt-1 ${isToday ? 'text-[#D99330]' : 'text-[#172338]'}`}>
                    {format(date, 'd')}
                  </div>
                  <div className="font-haas font-light text-[8px] sm:text-[9px] uppercase tracking-[0.1em] text-[#506A70] mt-0.5 h-2.5">
                    {isMonthStart ? format(date, 'MMM') : ''}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {regionGroups.map((rg) => (
            <React.Fragment key={`region-${rg.region}`}>
              <tr className="bg-[#FDFCF8]">
                <td className="sticky left-0 z-10 bg-[#FDFCF8] px-2.5 sm:px-4 py-2 border-y border-r border-[#E2E8EB] w-[150px] min-w-[150px] sm:w-[300px] sm:min-w-[300px]">
                  <span className="font-haas font-normal text-xs sm:text-sm uppercase tracking-[0.16em] text-[#172338]">
                    {rg.region}
                    <span className="ml-1.5 tracking-normal font-light text-[#506A70]/70">· {rg.villas.length}</span>
                  </span>
                </td>
                <td colSpan={dateRange.length} className="bg-[#FDFCF8] border-y border-[#E2E8EB]" />
              </tr>
              {rg.villas.map((group) => {
            const property = group.property || {}
            const slugOrId = property.agentFriendlySlug || property.id
            const locationLabel = getPropertyLocationLabel(property)

            return (
              <tr key={group.propertyId}>
                <td className="sticky left-0 z-10 bg-white p-2.5 sm:p-4 border-b border-r border-[#E2E8EB] align-top w-[150px] min-w-[150px] sm:w-[300px] sm:min-w-[300px]">
                  <Link
                    href={`/agent-calendar/${encodeURIComponent(slugOrId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-gtsuper-ds font-light text-base sm:text-lg leading-snug text-[#172338] hover:text-[#D99330] transition-colors line-clamp-2"
                  >
                    {property.title || 'Villa'}
                  </Link>
                  {locationLabel ? (
                    <div className="font-haas font-light text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-[0.16em] text-[#506A70] mt-2 line-clamp-1">
                      {locationLabel}
                    </div>
                  ) : null}
                </td>
                {dateRange.map((date, i) => {
                  const dateStr = toDateStr(date)
                  const isPast = date < today
                  const isBlocked = group.blockedSet.has(dateStr)
                  const isToday = dateStr === todayStr
                  const isMonthStart = i === 0 || date.getDate() === 1
                  const dayLabel = format(date, 'EEE d MMM')
                  const tdClass = `border-b border-[#E2E8EB] w-10 min-w-[40px] sm:w-12 sm:min-w-[48px] p-0.5 sm:p-1 ${
                    isMonthStart && i !== 0 ? 'border-l border-[#D99330]/40' : ''
                  } ${isToday ? 'bg-[#FBF4E9]' : ''}`

                  if (isPast) {
                    return (
                      <td key={dateStr} title={`${dayLabel} — Past`} className={tdClass}>
                        <div className="w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-sm" style={{ background: PAST_COLOR }} />
                      </td>
                    )
                  }

                  if (!isBlocked) {
                    const rate = group.priceByDate.get(dateStr)
                    const priceLabel = rate ? formatPrice(rate.price) : ''
                    const statusText = priceLabel
                      ? `${priceLabel} per night${rate?.minStay ? `, minimum ${rate.minStay} nights` : ''}`
                      : 'Available'
                    return (
                      <td key={dateStr} className={`${tdClass} group`}>
                        <button
                          type="button"
                          aria-label={`${property.title || 'Villa'} — ${dayLabel}: ${statusText}`}
                          className="relative block w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-1"
                        >
                          <span className="block w-full h-full rounded-sm" style={{ background: AVAILABLE_COLOR }} />
                          <span className="hidden group-hover:flex group-focus-within:flex flex-col items-center absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none">
                            <span className="bg-[#172338] text-white font-haas font-light text-xs px-2.5 py-1.5 rounded-sm whitespace-nowrap shadow-md">
                              {priceLabel ? (
                                <>
                                  <span className="font-semibold">{priceLabel}</span> / night
                                  {rate?.minStay ? <span className="opacity-80"> · Min {rate.minStay}n</span> : null}
                                </>
                              ) : (
                                'Available'
                              )}
                            </span>
                          </span>
                        </button>
                      </td>
                    )
                  }

                  const prevBlocked = group.blockedSet.has(toDateStr(addDays(date, -1)))
                  const nextBlocked = group.blockedSet.has(toDateStr(addDays(date, 1)))
                  const isCheckIn = !prevBlocked
                  const isCheckOut = !nextBlocked

                  if (!isCheckIn && !isCheckOut) {
                    return (
                      <td key={dateStr} title={`${dayLabel} — Booked`} className={tdClass}>
                        <div className="w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-sm" style={{ background: BOOKED_COLOR }} />
                      </td>
                    )
                  }

                  // Check-in/out day: crisp diagonal split (clip-path triangles read much cleaner at this
                  // size than a gradient blend). Top-left triangle = the day's "earlier" state.
                  const topLeft = isCheckIn ? AVAILABLE_COLOR : BOOKED_COLOR
                  const bottomRight = isCheckIn ? BOOKED_COLOR : AVAILABLE_COLOR
                  const label = isCheckIn && isCheckOut ? 'Check-in / Check-out' : isCheckIn ? 'Check-in' : 'Check-out'

                  return (
                    <td key={dateStr} title={`${dayLabel} — ${label}`} className={tdClass}>
                      <div className="relative w-7 h-7 sm:w-9 sm:h-9 mx-auto rounded-sm overflow-hidden">
                        <div className="absolute inset-0" style={{ background: topLeft, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
                        <div className="absolute inset-0" style={{ background: bottomRight, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
