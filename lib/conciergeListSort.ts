export type ConciergeListSort = 'default' | 'asc' | 'desc' | 'nameAsc' | 'nameDesc'

export function parseConciergeListSortQuery(raw: string | undefined | null): ConciergeListSort {
  const s = (raw || '').trim().toLowerCase()
  if (s === 'asc' || s === 'desc') return s
  if (s === 'nameasc') return 'nameAsc'
  if (s === 'namedesc') return 'nameDesc'
  return 'default'
}

/**
 * Solo dentro de la página actual: la lista viene paginada por el backend
 * (que no soporta estos criterios), así que no es consistente entre páginas.
 *
 * - `asc` / `desc`: se respeta el orden por precio que trae el backend.
 * - `nameAsc` / `nameDesc`: alfabético puro por nombre.
 * - `default`: agrupado por ubicación (la ubicación con más servicios va
 *   primero), y alfabético por nombre dentro de cada grupo.
 */
export function sortConciergeServicesByName<T extends { name?: string; location?: string | null }>(
  items: T[],
  sort: ConciergeListSort,
): T[] {
  if (sort === 'asc' || sort === 'desc') return items

  if (sort === 'nameAsc' || sort === 'nameDesc') {
    const direction = sort === 'nameDesc' ? -1 : 1
    return [...items].sort((a, b) => direction * (a.name ?? '').localeCompare(b.name ?? ''))
  }

  const locationOf = (item: T) => (item.location ?? '').trim() || 'Other'
  const groupSize = new Map<string, number>()
  items.forEach((item) => {
    const loc = locationOf(item)
    groupSize.set(loc, (groupSize.get(loc) ?? 0) + 1)
  })

  return [...items].sort((a, b) => {
    const locA = locationOf(a)
    const locB = locationOf(b)
    if (locA !== locB) {
      const sizeDiff = (groupSize.get(locB) ?? 0) - (groupSize.get(locA) ?? 0)
      if (sizeDiff !== 0) return sizeDiff
      return locA.localeCompare(locB)
    }
    return (a.name ?? '').localeCompare(b.name ?? '')
  })
}
