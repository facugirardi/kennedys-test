export type EventsListPriceSort = 'default' | 'asc' | 'desc'

export function parseSortPriceQuery(raw: string | undefined | null): EventsListPriceSort {
  const s = (raw || '').trim().toLowerCase()
  if (s === 'asc' || s === 'desc') return s
  return 'default'
}

export function extractEventCardPrice(item: { name?: string; summary?: string }): number {
  const priceRegex = /\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*([kK])?/g
  const text = `${item.name ?? ''} ${item.summary ?? ''}`
  let minPrice = Infinity
  let match: RegExpExecArray | null
  while ((match = priceRegex.exec(text)) !== null) {
    let v = parseFloat(match[1].replace(/,/g, ''))
    if (match[2]) v *= 1000
    if (Number.isFinite(v) && v > 0 && v < minPrice) minPrice = v
  }
  return minPrice === Infinity ? 0 : minPrice
}

export function sortEventListByCardPrice<T extends { name?: string; summary?: string }>(
  items: T[],
  sortOrder: EventsListPriceSort,
): T[] {
  if (sortOrder === 'default') return items
  return [...items].sort((a, b) => {
    const diff = extractEventCardPrice(a) - extractEventCardPrice(b)
    return sortOrder === 'asc' ? diff : -diff
  })
}
