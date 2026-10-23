import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'

export type EventsListFilterQuery = {
  types: string[]
  location: string
  area: string
  min: string
  max: string
}

export type EventListFilterItem = {
  name: string
  summary: string
}

function eventMatchesLocationQuery(
  name: string,
  summary: string,
  regionValue: string,
  geoArea: string,
): boolean {
  const hay = `${name} ${summary}`.toLowerCase()
  const a = (geoArea || '').trim()
  if (a) {
    const expanded = Array.from(new Set([a.toLowerCase(), ...expandLocationArea(a).map((s) => s.toLowerCase())]))
    if (expanded.some((t) => hay.includes(t))) return true
  }
  const rv = (regionValue || '').trim()
  if (!rv) return true
  const tokens = rv.split(',').map((t) => t.trim()).filter(Boolean)
  if (tokens.length === 0) return true
  const allTokens = Array.from(
    new Set(tokens.flatMap((t) => [t.toLowerCase(), ...expandLocationArea(t).map((s) => s.toLowerCase())])),
  )
  return allTokens.some((t) => hay.includes(t))
}

function extractDollarAmountsFromCopy(text: string): number[] {
  if (!text) return []
  const found = new Set<number>()
  const re = /\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*([kK])?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    let v = parseFloat(m[1].replace(/,/g, ''))
    if (m[2]) v *= 1000
    if (Number.isFinite(v) && v > 0) found.add(v)
  }
  return Array.from(found)
}

function eventMatchesPriceRange(name: string, summary: string, minStr: string, maxStr: string): boolean {
  if (!minStr && !maxStr) return true
  const minN = minStr ? Number(minStr) : 0
  const maxN = maxStr ? Number(maxStr) : Number.POSITIVE_INFINITY
  if (!Number.isFinite(minN) || !Number.isFinite(maxN)) return true
  const amounts = extractDollarAmountsFromCopy(`${name} ${summary}`)
  if (amounts.length === 0) return true
  return amounts.some((a) => a >= minN && a <= maxN)
}

export function eventsListHasActiveFilters(q: EventsListFilterQuery): boolean {
  return (
    q.types.length > 0 ||
    !!(q.location && q.location.trim()) ||
    !!(q.area && q.area.trim()) ||
    !!(q.min && q.min.trim()) ||
    !!(q.max && q.max.trim())
  )
}

export function filterEventsList<T extends EventListFilterItem>(items: T[], q: EventsListFilterQuery): T[] {
  let filtered = [...items]

  if (q.location || q.area) {
    filtered = filtered.filter((event) =>
      eventMatchesLocationQuery(event.name, event.summary, q.location, q.area),
    )
  }

  if (q.types.length > 0) {
    filtered = filtered.filter((event) =>
      q.types.some((t) => `${event.name} ${event.summary}`.toLowerCase().includes((t || '').toLowerCase())),
    )
  }

  if (q.min || q.max) {
    filtered = filtered.filter((event) => eventMatchesPriceRange(event.name, event.summary, q.min, q.max))
  }

  return filtered
}
