import { fetchAPI } from './fetcher'

const hasContent = (value) => Boolean(value && typeof value === 'object' && Object.keys(value).length > 0)

/**
 * El backend embebe el objeto Property COMPLETO (imágenes, descripciones, etc.) en cada rango
 * devuelto — multiplicado por villa y por rango, esto infla el payload SSR muy por encima del
 * límite de Next.js (ver warning "exceeds the threshold of 128 kB"). Nos quedamos solo con lo
 * que la grilla pública realmente pinta.
 */
// getServerSideProps props must be JSON-serializable — Next.js rejects `undefined`, so every
// field here needs an explicit `?? null` (or an array/boolean default) rather than passing through.
function trimAvailabilityItem(item) {
  const p = item?.property || {}
  const classification = p.classification || {}
  const amenity = p.amenity || {}
  return {
    propertyId: item.propertyId ?? null,
    from: item.from ?? null,
    to: item.to ?? null,
    is_available: item.is_available ?? null,
    price_per_night: item.price_per_night ?? null,
    min_stay: item.min_stay ?? null,
    disabled_dates: Array.isArray(item.disabled_dates) ? item.disabled_dates : [],
    property: {
      id: p.id ?? null,
      title: p.title ?? null,
      region: p.region ?? null,
      location: p.location ?? null,
      visibleLocation: p.visibleLocation ?? null,
      country: p.country ?? null,
      area: p.area ?? null,
      agentFriendlySlug: p.agentFriendlySlug ?? null,
      agentFriendlyName: p.agentFriendlyName ?? null,
      rental: p.rental ?? null,
      category: p.category ?? null,
      classification: {
        bedrooms: classification.bedrooms ?? null,
        maxPersons: classification.maxPersons ?? null,
      },
      hasPool: hasContent(amenity.poolWellness),
      hasGym: hasContent(amenity.fitness),
    },
  }
}

/**
 * Grilla pública de disponibilidad/rates — misma fuente que usa la grilla interna de Loggia
 * (GET /availability-range/date-range). Sin propertyIds trae todas las villas rental.
 * page/pageSize activan paginación por villa en el backend (orden estable por título) — devuelve
 * `res.pagination = { total, page, pageSize, hasMore }` cuando se pasan.
 * @param {{ from?: string, to?: string, propertyIds?: string[], page?: number, pageSize?: number, search?: string }} [options]
 */
export async function getAvailabilityDateRange({ from, to, propertyIds = [], page, pageSize, search } = {}) {
  const params = new URLSearchParams()
  if (from) params.append('from', from)
  if (to) params.append('to', to)
  if (Array.isArray(propertyIds) && propertyIds.length > 0) {
    params.append('propertyIds', propertyIds.join(','))
  }
  if (pageSize) {
    params.append('page', String(page || 1))
    params.append('pageSize', String(pageSize))
  }
  if (search && search.trim()) {
    params.append('search', search.trim())
  }
  const res = await fetchAPI(`/availability-range/date-range?${params.toString()}`)
  if (Array.isArray(res?.data)) {
    res.data = res.data.map(trimAvailabilityItem)
  }
  return res
}
