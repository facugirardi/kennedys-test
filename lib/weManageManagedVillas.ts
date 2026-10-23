import { joinUniqueLocationParts, resolveMediaUrl } from '@/lib/utils'

/** Agent-friendly identifiers for villas shown on We Manage Your Villa (fixed order). */
export const MANAGED_WE_MANAGE_VILLA_AGENT_IDS = [
  'M10', 'M577', 'M46', 'M604', 'M8', 'M35', 'M498', 'M497', 'M261', 'M343',
  '426', '424', '423', 'PR58', 'PR59', 'PR60', 'PR65', 'PR64', 'PR61', 'PR63', 'PR162',
] as const

/** `/villas` landing — same source order as We Manage; non-overlapping slices. */
export const VILLAS_LANDING_TRENDING_AGENT_IDS = MANAGED_WE_MANAGE_VILLA_AGENT_IDS.slice(0, 5)
export const VILLAS_LANDING_PICKED_AGENT_IDS = MANAGED_WE_MANAGE_VILLA_AGENT_IDS.slice(5, 8)
export const VILLAS_LANDING_MYKONOS_AGENT_IDS = MANAGED_WE_MANAGE_VILLA_AGENT_IDS.slice(8, 11)
export const VILLAS_LANDING_PAROS_AGENT_IDS = MANAGED_WE_MANAGE_VILLA_AGENT_IDS.slice(13, 16)

export type WeManageVillaCard = {
  id: string
  title: string
  location: string
  capa1: string
  price: string
  villaImage: string
  property: Record<string, unknown>
}

export function mapWeManagePropertyToCard(prop: any): WeManageVillaCard | null {
  if (!prop || typeof prop !== 'object' || !prop.id) return null

  const mainImage =
    prop.images?.[0]?.urlImage || prop.images?.[0]?.url || prop.mainImage || ''

  const price = prop.rental
    ? prop.price_per_night
      ? `€${prop.price_per_night}/night`
      : 'Price on request'
    : prop.sale_price
      ? `€${prop.sale_price.toLocaleString()}`
      : 'Price on request'

  const location =
    joinUniqueLocationParts(prop.location, prop.region, prop.country) ||
    joinUniqueLocationParts(prop.visibleLocation, prop.location, prop.country) ||
    ''

  const displayTitle = [
    prop.title,
    prop.alternativeTitle,
    prop.propertyName,
    prop.name,
    prop.description?.caption,
  ]
    .map((x: unknown) => (typeof x === 'string' ? x.trim() : ''))
    .find((s: string) => s.length > 0)

  return {
    id: prop.id,
    title: displayTitle || '',
    location: location || 'Location TBD',
    capa1: prop.bedrooms?.toString() || '0',
    price,
    villaImage: resolveMediaUrl(mainImage) || '',
    // Solo los campos que usa el routing de la card (onCardContainerClick /
    // buildRentalDetailPath). Serializar la propiedad completa dejaba la
    // página por encima del límite de crawl de 2 MB de Googlebot.
    property: {
      id: prop.id ?? null,
      category: prop.category ?? null,
      rental: prop.rental ?? null,
      title: prop.title ?? null,
      name: prop.name ?? null,
      region: prop.region ?? null,
      isFriendly: prop.isFriendly ?? null,
      agentFriendlySlug: prop.agentFriendlySlug ?? null,
      agent_friendly_slug: prop.agent_friendly_slug ?? null,
      agentFriendlyName: prop.agentFriendlyName ?? null,
      agent_friendly_name: prop.agent_friendly_name ?? null,
    },
  }
}
