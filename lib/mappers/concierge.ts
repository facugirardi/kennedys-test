import { resolveMediaUrl } from '@/lib/utils'

/**
 * Convierte un texto a slug para URLs (ej: "Airbus AS365" -> "airbus-as365").
 */
export function slugify(value?: string | null): string {
  if (!value || typeof value !== 'string') return ''
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '') // solo letras, números y guiones
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Arma la URL del detalle de un servicio de concierge según el breadcrumb:
 * /concierge/[location]/[type]/[nombre-slug]
 * Ej: Athens, helicopter, "Airbus AS365" -> /concierge/athens/helicopter/airbus-as365
 */
export function getConciergeServicePath(service: {
  location?: string | null
  type: string
  name: string
  /** Appended to the name slug (e.g. `airbus-as365-a1b2c3`) so two services that would otherwise
   * collide on the exact same location+type+name path still get distinct, SEO-friendly URLs. */
  disambiguator?: string | null
}): string {
  const loc = (service.location || '').split(',').map((l) => l.trim()).filter(Boolean)[0] || 'concierge'
  const locSlug = slugify(loc) || 'concierge'
  const typeSlug = slugify(service.type) || 'service'
  const nameSlug = slugify(service.name) || 'detail'
  const finalSlug = service.disambiguator ? `${nameSlug}-${service.disambiguator}` : nameSlug
  return `/concierge/${locSlug}/${typeSlug}/${finalSlug}`
}

/**
 * Short, stable per-item suffix used only to disambiguate services whose canonical path would
 * otherwise collide. Not cryptographic — just needs to differ across the handful of colliding
 * rows, which random ids already guarantee.
 */
function shortIdSuffix(id?: string | number | null): string {
  if (id == null) return ''
  return String(id).replace(/[^a-zA-Z0-9]/g, '').slice(-6)
}

type ServiceCollectionKey =
  | 'chauffeurs'
  | 'yachts'
  | 'helicopters'
  | 'chefs'
  | 'privateJets'
  | 'uniqueExperiences'
  | 'conciergePackages'
  | 'securities'
  | 'nannies'
  | 'wellnessFitnesses'
  | 'luxuryShoppings'
  | 'kidsExperiences'
  | 'tours'

const SERVICE_COLLECTIONS: ServiceCollectionKey[] = [
  'chauffeurs',
  'yachts',
  'helicopters',
  'chefs',
  'privateJets',
  'uniqueExperiences',
  'conciergePackages',
  'securities',
  'nannies',
  'wellnessFitnesses',
  'luxuryShoppings',
  'kidsExperiences',
  'tours',
]

const FALLBACK_IMAGES: Record<string, string> = {
  chauffeur: '/images/chauffeur-service.png',
  chauffeur_service: '/images/chauffeur-service.png',
  chauffeurs: '/images/chauffeur-service.png',
  yacht: '/images/yacht-image.jpg',
  yachts: '/images/yacht-image.jpg',
  yacht_rental: '/images/yacht-image.jpg',
  helicopter: '/images/helicopter-image.png',
  helicopters: '/images/helicopter-image.png',
  jet: '/images/plane-image.png',
  jets: '/images/plane-image.png',
  jet_charter: '/images/plane-image.png',
  private_jet: '/images/plane-image.png',
  chef: '/images/cheff-image.png',
  chefs: '/images/cheff-image.png',
  f_b_services: '/images/cheff-image.png',
  itinerary: '/images/itineraries.png',
  itineraries: '/images/itineraries.png',
  concierge: '/images/concierge-1.png',
  concierge_package: '/images/concierge-1.png',
  concierge_packages: '/images/concierge-1.png',
  unique_experience: '/images/outdoor-image.png',
  unique_experiences: '/images/outdoor-image.png',
  security: '/images/outdoor-image.png',
  nanny: '/images/outdoor-image.png',
  nannies: '/images/outdoor-image.png',
  wellness_fitness: '/images/outdoor-image.png',
  luxury_shopping: '/images/outdoor-image.png',
  kids_experience: '/images/dance.png',
  kids_experiences: '/images/dance.png',
  car_rental: '/images/chuffer-service-image.png',
  car_rentals: '/images/chuffer-service-image.png',
  tour: '/images/outdoor-image.png',
  tours: '/images/outdoor-image.png',
  default: '/images/outdoor-image.png',
}

export interface ConciergeServicePreview {
  id: string
  name: string
  type: string
  description: string
  /** `null` when absent — JSON-serializable for getServerSideProps (never `undefined`). */
  location: string | null
  /** Free-text price entered by the admin (e.g. "€500 / day"); `null` when not set. */
  price: string | null
  image: string
  raw: any
}

export interface ConciergeServiceDetail {
  id: string
  name: string
  type: string
  heroImage: string
  gallery: string[]
  /** CSS object-position per `gallery` image (same index), set from Loggia's reposition editor — non-destructive, never crops; `null` when unset. */
  galleryPositions: (string | null)[]
  description: string
  secondaryDescription: string
  location: string | null
  area: string | null
  /** Free-text price entered by the admin (e.g. "€500 / day"); `null` when not set. */
  price: string | null
  primaryRecord?: any
  raw: any
  // Campos específicos por tipo de servicio
  specifications?: Record<string, any>
  features?: string[] | Record<string, any>
  brokerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
  facilities?: string[] | boolean[]
  // Secciones destacadas
  highlightedSections?: Array<{
    title: string
    image: string
    description: string
    /** CSS object-position ("62.0% 40.0%"), set from Loggia's reposition editor — non-destructive, never crops. */
    imagePosition?: string | null
  }>
  // Key Features
  keyFeatures?: string[]
  /** Main image position for hero: top | center | bottom → object-position center top/center/center bottom */
  mainImagePosition?: string
  // Manual OG/share metatag overrides (editable in Loggia) — empty/null falls back to
  // the auto-generated title/description/image.
  metaTitle?: string | null
  metaDescription?: string | null
  metaImageUrl?: string | null
}

const normalizeType = (value?: string | null) => (value || '').toLowerCase().replace(/\s+/g, '_')

const fallbackImageForType = (type: string) => {
  const normalized = normalizeType(type)
  return FALLBACK_IMAGES[normalized] || FALLBACK_IMAGES.default
}

const getPrimaryCollectionKey = (service: any): ServiceCollectionKey | null => {
  const type = normalizeType(service?.type)

  if (type) {
    if (type.includes('chauff')) return 'chauffeurs'
    if (type.includes('yacht')) return 'yachts'
    if (type.includes('heli')) return 'helicopters'
    if (type.includes('chef') || type.includes('f_b')) return 'chefs'
    if (type.includes('jet') || type.includes('aviation')) return 'privateJets'
    if (type.includes('concierge') && type.includes('package')) return 'conciergePackages'
    if (type.includes('security')) return 'securities'
    if (type.includes('nanny')) return 'nannies'
    if (type.includes('wellness') || type.includes('fitness') || type.includes('salon')) return 'wellnessFitnesses'
    if (type.includes('luxury') && type.includes('shop')) return 'luxuryShoppings'
    if (type.includes('kids')) return 'kidsExperiences'
    if (type.includes('unique')) return 'uniqueExperiences'
    if (type.includes('tour')) return 'tours'
  }

  for (const key of SERVICE_COLLECTIONS) {
    if (Array.isArray(service?.[key]) && service[key].length > 0) {
      return key
    }
  }

  return null
}

export const getPrimaryRecord = (service: any) => {
  const key = getPrimaryCollectionKey(service)
  if (!key) return { record: null, key: null }
  const record = Array.isArray(service?.[key]) ? service[key][0] : null
  return { record, key }
}

const PRICE_HINT_FIELDS = [
  'cost',
  'price',
  'hourlyRate',
  'charterPrice',
  'rate',
  'fromPrice',
  'amount',
  'basePrice',
] as const

function pickNumericPriceFromObject(obj: any): number | null {
  if (!obj || typeof obj !== 'object') return null
  for (const k of PRICE_HINT_FIELDS) {
    const v = obj[k]
    if (v == null || v === '') continue
    const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''))
    if (Number.isFinite(n) && n >= 0) return n
  }
  return null
}


/**
 * Best-effort price for list filtering (service root + primary nested record).
 */
export function getComparableServicePrice(service: any): number | null {
  let p = pickNumericPriceFromObject(service)
  if (p != null) return p
  const { record } = getPrimaryRecord(service)
  p = pickNumericPriceFromObject(record)
  return p
}

const pickText = (...values: Array<string | null | undefined>) => {
  const value = values.find((item) => typeof item === 'string' && item.trim().length > 0)
  return value?.trim() ?? ''
}

const getBrochureDisplayName = (record: any, service?: any): string | null => {
  const explicit = pickText(
    record?.brochureName,
    record?.brochureTitle,
    record?.brochureLabel,
    record?.brochureDisplayName,
    record?.brochureOriginalName,
    service?.brochureName,
    service?.brochureTitle,
    service?.brochureLabel,
    service?.brochureDisplayName,
    service?.brochureOriginalName
  )
  if (explicit) return explicit

  const rawUrl = pickText(record?.brochureLink, service?.brochureLink)
  if (!rawUrl) return null
  const lastPart = rawUrl.split('/').pop() || ''
  const withoutQuery = lastPart.split('?')[0]
  if (!withoutQuery) return null
  try {
    return decodeURIComponent(withoutQuery)
  } catch {
    return withoutQuery
  }
}

const buildBrochureSpec = (url: string, record: any, service?: any) => ({
  __isBrochure: true as const,
  url,
  name: getBrochureDisplayName(record, service),
})

const buildGallery = (service: any) => {
  const images = Array.isArray(service?.images) ? service.images : []

  const sortedImages = [...images].sort((a: any, b: any) => {
    const aOrder = Number.isFinite(Number(a?.order)) ? Number(a.order) : Number.POSITIVE_INFINITY
    const bOrder = Number.isFinite(Number(b?.order)) ? Number(b.order) : Number.POSITIVE_INFINITY
    if (aOrder !== bOrder) return aOrder - bOrder

    const aCreated = a?.createdAt ? new Date(a.createdAt).getTime() : 0
    const bCreated = b?.createdAt ? new Date(b.createdAt).getTime() : 0
    return aCreated - bCreated
  })

  const resolved: string[] = []
  const positions: (string | null)[] = []
  sortedImages.forEach((item: any) => {
    const url = resolveMediaUrl(item?.urlImage)
    if (!url) return
    resolved.push(url)
    positions.push(item?.position ?? null)
  })
  if (resolved.length === 0) return { images: [fallbackImageForType(service?.type)], positions: [null] }
  return { images: resolved, positions }
}

export const mapServiceToPreview = (service: any): ConciergeServicePreview => {
  const { record } = getPrimaryRecord(service)
  const normalizedType = normalizeType(service?.type)

  // Para servicios "Other", usar el service directamente como record si no hay colección
  const effectiveRecord = record || (normalizedType.includes('other') || normalizedType.includes('car_rental') ? service : null)

  const gallery = buildGallery(service).images
  const image = gallery[0] || fallbackImageForType(service?.type)

  const name = pickText(service?.name, effectiveRecord?.serviceName, effectiveRecord?.name, 'Concierge Service')
  const description = pickText(
    effectiveRecord?.overview,
    effectiveRecord?.description,
    effectiveRecord?.summary,
    service?.description,
    'Experience the luxury of bespoke concierge services tailored to your needs.'
  )

  // Primero el registro del servicio (Loggia), luego la columna Service (API ya no rellena con todas las regiones rental)
  const location = pickText(
    effectiveRecord?.location,
    service?.location,
    effectiveRecord?.area,
    effectiveRecord?.region
  )

  // Product Main price first; fall back to first library-set price from API (`libraryPrice`).
  const price = pickText(effectiveRecord?.price, service?.price, service?.libraryPrice)

  return {
    id: service?.id ?? effectiveRecord?.id ?? '',
    name,
    type: service?.type ?? effectiveRecord?.serviceType ?? 'Service',
    description,
    location: location || null,
    price: price || null,
    image,
    raw: service,
  }
}

/** Canonical detail path for a raw API row — same inputs as {@link mapServiceToPreview} + {@link getConciergeServicePath}, without building gallery/image. */
export function getConciergeServicePathForApiItem(service: any, disambiguator?: string | null): string {
  const { record } = getPrimaryRecord(service)
  const normalizedType = normalizeType(service?.type)
  const effectiveRecord = record || (normalizedType.includes('other') || normalizedType.includes('car_rental') ? service : null)
  const name = pickText(service?.name, effectiveRecord?.serviceName, effectiveRecord?.name, 'Concierge Service')
  const typeStr = service?.type ?? effectiveRecord?.serviceType ?? 'Service'
  const location = pickText(
    effectiveRecord?.location,
    service?.location,
    effectiveRecord?.area,
    effectiveRecord?.region
  )
  return getConciergeServicePath({ location: location || null, type: typeStr, name, disambiguator })
}

/**
 * Maps each item's canonical path — disambiguated with a short id suffix when two or more items
 * would otherwise collide on the same location+type+name path — to that item. Lets the catch-all
 * route resolve a 3-segment URL back to the exact right row even when several services share a name.
 */
export function buildConciergeServicePathIndex(allData: any[]): Map<string, any> {
  const groups = new Map<string, any[]>()
  for (const item of Array.isArray(allData) ? allData : []) {
    if (item?.id == null) continue
    const base = getConciergeServicePathForApiItem(item)
    const bucket = groups.get(base)
    if (bucket) bucket.push(item)
    else groups.set(base, [item])
  }
  const index = new Map<string, any>()
  groups.forEach((items) => {
    if (items.length === 1) {
      index.set(getConciergeServicePathForApiItem(items[0]), items[0])
      return
    }
    items.forEach((item) => {
      index.set(getConciergeServicePathForApiItem(item, shortIdSuffix(item.id)), item)
    })
  })
  return index
}

/**
 * Canonical path for one item, disambiguated with a short id suffix if it collides with another
 * item in `allData` on the same base path — a single-item counterpart to
 * {@link buildConciergeServicePathIndex}, used when deciding a redirect target.
 */
export function getConciergeServicePathForApiItemUnique(service: any, allData: any[]): string {
  const base = getConciergeServicePathForApiItem(service)
  const collides = Array.isArray(allData) && allData.some(
    (item) => item?.id != null && service?.id != null && item.id !== service.id && getConciergeServicePathForApiItem(item) === base
  )
  return collides ? getConciergeServicePathForApiItem(service, shortIdSuffix(service?.id)) : base
}

const normalizeForSimilarFilter = (value?: string | null) => (value || '').toLowerCase().trim()

function getLocationSlugForApiItem(service: any): string {
  const { record } = getPrimaryRecord(service)
  const normalizedType = normalizeType(service?.type)
  const effectiveRecord = record || (normalizedType.includes('other') || normalizedType.includes('car_rental') ? service : null)
  const location = pickText(
    effectiveRecord?.location,
    service?.location,
    effectiveRecord?.area,
    effectiveRecord?.region
  )
  const loc = (location || '').split(',').map((l: string) => l.trim()).filter(Boolean)[0] || ''
  return slugify(loc)
}

/**
 * “Other options” for the detail page: filter the catalog by type AND location, then map at most `limit` items.
 * Returns an empty array if fewer than `limit` matches exist (section should be hidden in that case).
 */
export function pickSimilarServicePreviews(allData: any[], detailData: any, limit = 3): ConciergeServicePreview[] {
  if (!detailData || !Array.isArray(allData) || allData.length === 0) return []
  const currentId = detailData.id != null ? String(detailData.id) : null
  const currentPath = getConciergeServicePathForApiItem(detailData)
  const detailTypeNorm = normalizeForSimilarFilter(detailData?.type)
  const detailLocationSlug = getLocationSlugForApiItem(detailData)

  const candidates = allData.filter((item: any) => {
    if (item?.id == null) return false
    if (currentId && String(item.id) === currentId) return false
    if (detailTypeNorm && normalizeForSimilarFilter(item.type) !== detailTypeNorm) return false
    if (getConciergeServicePathForApiItem(item) === currentPath) return false
    if (detailLocationSlug && getLocationSlugForApiItem(item) !== detailLocationSlug) return false
    return true
  })

  if (candidates.length < limit) return []
  return candidates.slice(0, limit).map(mapServiceToPreview)
}

type AutoFeatureField = {
  key: string
  label: string
  /** Lowercase substrings — if ANY appears in the staff-written Key Features text, this topic is
   * considered already covered by hand and the auto bullet for it is skipped. */
  matchKeywords: string[]
}

// Structured Features-tab fields that never reach any public rendering path on their own (unlike
// the "Features & Facilities" checkbox list, which does render). Staff have been re-typing this
// same info by hand into the free-text Key Features field instead, often in different words/units
// ("Range of 1,850 nm" vs. the raw `maxRange` field) — this table backs the per-topic fallback
// that fills in only what staff *didn't* already mention, so nothing gets duplicated.
const AUTO_KEY_FEATURE_FIELDS: Record<'chauffeur' | 'yacht' | 'heli' | 'jet', AutoFeatureField[]> = {
  chauffeur: [
    { key: 'color', label: 'Color', matchKeywords: ['color', 'colour'] },
    { key: 'transmission', label: 'Transmission', matchKeywords: ['transmission', 'automatic', 'manual gearbox'] },
    { key: 'seatingCapacity', label: 'Seating Capacity', matchKeywords: ['seating capacity', 'seats'] },
    { key: 'luggageCapacity', label: 'Luggage Capacity', matchKeywords: ['luggage'] },
    { key: 'vehicleQuantity', label: 'Vehicle Quantity', matchKeywords: ['vehicles available', 'quantity'] },
    { key: 'insurance', label: 'Insurance', matchKeywords: ['insurance', 'insured'] },
    { key: 'seats', label: 'Seats', matchKeywords: ['seats', 'seating'] },
    { key: 'seatsConfiguration', label: 'Seats Configuration', matchKeywords: ['seat configuration', 'seating layout', 'seating configuration'] },
    { key: 'babySeat', label: 'Baby Seat', matchKeywords: ['baby seat', 'child seat'] },
  ],
  yacht: [
    { key: 'length', label: 'Length', matchKeywords: ['length'] },
    { key: 'width', label: 'Width', matchKeywords: ['width'] },
    { key: 'draft', label: 'Draft', matchKeywords: ['draft', 'draught'] },
    { key: 'year', label: 'Year', matchKeywords: ['year built', 'built in', 'year of build'] },
    { key: 'engines', label: 'Engines', matchKeywords: ['engine'] },
    { key: 'engine', label: 'Engine', matchKeywords: ['engine'] },
    { key: 'fuel', label: 'Fuel', matchKeywords: ['fuel'] },
    { key: 'cruisingSpeed', label: 'Cruising Speed', matchKeywords: ['cruising speed', 'cruise speed'] },
    { key: 'topSpeed', label: 'Top Speed', matchKeywords: ['top speed', 'max speed', 'maximum speed'] },
    { key: 'beamOverall', label: 'Beam Overall', matchKeywords: ['beam'] },
    { key: 'capacity', label: 'Capacity', matchKeywords: ['capacity', 'guests', 'passengers'] },
    { key: 'capacityDay', label: 'Capacity (Day)', matchKeywords: ['day capacity', 'day guests', 'day charter'] },
    { key: 'capacityNight', label: 'Capacity (Night)', matchKeywords: ['night capacity', 'overnight guests', 'sleeps'] },
    { key: 'cabins', label: 'Cabins', matchKeywords: ['cabin'] },
    { key: 'crew', label: 'Crew', matchKeywords: ['crew'] },
  ],
  heli: [
    { key: 'YOM', label: 'Year of Manufacture', matchKeywords: ['manufactured', 'year of manufacture', 'built in'] },
    { key: 'YOR', label: 'Year of Refurbishment', matchKeywords: ['refurbished', 'refurbishment'] },
    { key: 'maxRange', label: 'Max Range', matchKeywords: ['range'] },
    { key: 'cruisingSpeed', label: 'Cruising Speed', matchKeywords: ['cruising speed', 'cruise speed'] },
    { key: 'base', label: 'Base', matchKeywords: ['based at', 'home base'] },
    { key: 'passengersCapacity', label: 'Passenger Capacity', matchKeywords: ['passenger'] },
    { key: 'pilot', label: 'Pilot', matchKeywords: ['pilot'] },
    { key: 'baggageCapacity', label: 'Baggage Capacity', matchKeywords: ['baggage', 'luggage'] },
    { key: 'luggageCompartmentDimensions', label: 'Luggage Compartment Dimensions', matchKeywords: ['luggage compartment', 'cargo'] },
  ],
  jet: [
    { key: 'YOM', label: 'Year of Manufacture', matchKeywords: ['manufactured', 'year of manufacture', 'built in'] },
    { key: 'YOR', label: 'Year of Refurbishment', matchKeywords: ['refurbished', 'refurbishment'] },
    { key: 'maxRange', label: 'Max Range', matchKeywords: ['range'] },
    { key: 'cruisingSpeed', label: 'Cruising Speed', matchKeywords: ['cruising speed', 'cruise speed'] },
    { key: 'maxAltitude', label: 'Max Altitude', matchKeywords: ['altitude'] },
    { key: 'airportBase', label: 'Airport Base', matchKeywords: ['based at', 'airport base', 'home base'] },
    { key: 'passengersCapacity', label: 'Passenger Capacity', matchKeywords: ['passenger'] },
    { key: 'pilot', label: 'Pilot', matchKeywords: ['pilot'] },
    { key: 'firstOfficer', label: 'First Officer', matchKeywords: ['first officer', 'co-pilot', 'copilot'] },
    { key: 'lavatory', label: 'Lavatory', matchKeywords: ['lavatory', 'bathroom', 'restroom'] },
    { key: 'flightAttendant', label: 'Flight Attendant', matchKeywords: ['flight attendant', 'cabin crew', 'steward'] },
    { key: 'catering', label: 'Catering', matchKeywords: ['catering', 'meal', 'dining'] },
    { key: 'typeOfCatering', label: 'Type of Catering', matchKeywords: ['catering', 'meal', 'menu'] },
  ],
}

/**
 * Per-topic fallback: fills gaps in the staff-written Key Features list using the structured
 * Features-tab fields, but ONLY for a field whose topic isn't already mentioned (in any wording)
 * in what staff already typed — e.g. if they wrote "Cruising speed of 507.66 mph (817 km/h)", the
 * raw `cruisingSpeed` field is skipped; if they never mentioned range, `maxRange` gets added.
 * Values are shown exactly as entered (no unit conversion/guessing). Never touches vendor/business
 * fields (VAT, commission, license, etc.) — those never were, and still aren't, in this table.
 */
const buildAutoKeyFeatures = (normalizedType: string, record: any, existingKeyFeatures: string[]): string[] => {
  let fields: AutoFeatureField[] | undefined
  if (normalizedType.includes('yacht')) fields = AUTO_KEY_FEATURE_FIELDS.yacht
  else if (normalizedType.includes('heli')) fields = AUTO_KEY_FEATURE_FIELDS.heli
  else if (normalizedType.includes('chauff')) fields = AUTO_KEY_FEATURE_FIELDS.chauffeur
  else if (normalizedType.includes('jet') || normalizedType.includes('aviation')) fields = AUTO_KEY_FEATURE_FIELDS.jet
  if (!fields || !record) return []

  const writtenText = existingKeyFeatures.join(' \n ').toLowerCase()

  return fields
    .filter(({ matchKeywords }) => !matchKeywords.some((kw) => writtenText.includes(kw)))
    .map(({ key, label }) => {
      const raw = record[key]
      if (raw === null || raw === undefined) return null
      // These fields are typed inconsistently across services — real booleans in some rows,
      // "Yes"/"No" strings in others (same radio input, different serialization) — normalize both.
      if (raw === true) return label
      if (raw === false) return null
      const value = String(raw).trim()
      if (!value) return null
      const lower = value.toLowerCase()
      if (lower === 'yes' || lower === 'true') return label
      if (lower === 'no' || lower === 'false') return null
      return `${label}: ${value}`
    })
    .filter((s): s is string => Boolean(s))
}

const extractSpecifications = (record: any, serviceType: string, service?: any): Record<string, any> => {
  const specs: Record<string, any> = {}
  const normalizedType = normalizeType(serviceType)

  if (normalizedType.includes('yacht')) {
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.boatCategory) specs['Boat Category'] = record.boatCategory
    if (record?.type) specs['Type of Yacht'] = record.type
    if (record?.engine) specs['Engine'] = record.engine
    if (record?.lengthMeters) specs['Length (Meters)'] = record.lengthMeters
    if (record?.lengthFeet) specs['Length (Feet)'] = record.lengthFeet
    if (record?.engines) specs['Engines'] = record.engines
    if (record?.fuel) specs['Fuel'] = record.fuel
    if (record?.cruisingSpeed) specs['Cruising Speed'] = record.cruisingSpeed
    if (record?.topSpeed) specs['Top Speed'] = record.topSpeed
    if (record?.beamOverall) specs['Beam Overall'] = record.beamOverall
    if (record?.capacityDay) specs['Capacity (Day)'] = record.capacityDay
    if (record?.capacityNight) specs['Capacity (Night)'] = record.capacityNight
    if (record?.cabins) specs['Cabins'] = record.cabins
    if (record?.crew) specs['Crew'] = record.crew
    if (record?.name) specs['Boat Name'] = record.name
    if (record?.brochureLink) specs['Brochure Link'] = buildBrochureSpec(record.brochureLink, record, service)
    if (record?.website) specs['Website'] = { __isWebsite: true, url: record.website }
    if (record?.vatNumber) specs['VAT Number'] = record.vatNumber
    if (record?.hullNumber) specs['Hull Identification Number (HIN)'] = record.hullNumber
    if (record?.imoNumber) specs['IMO Number'] = record.imoNumber
    if (record?.license) specs['Licensing for Charter Operations'] = record.license
    if (record?.vatPercentage) specs['VAT Percentage'] = record.vatPercentage
    if (record?.apa) specs['APA'] = record.apa
    if (record?.commission) specs['Commission'] = record.commission
  } else if (normalizedType.includes('heli')) {
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.nameHelicopter) specs['Helicopter Name'] = record.nameHelicopter
    if (record?.helicopterCategory) specs['Category'] = record.helicopterCategory
    if (record?.YOM) specs['Year of Manufacture'] = record.YOM
    if (record?.YOR) specs['Year of Refurbishment'] = record.YOR
    if (record?.maxRange) specs['Max Range'] = record.maxRange
    if (record?.cruisingSpeed) specs['Cruising Speed'] = record.cruisingSpeed
    if (record?.base) specs['Base'] = record.base
    if (record?.passengersCapacity) specs['Passenger Capacity'] = record.passengersCapacity
    if (record?.pilot) specs['Pilot'] = record.pilot
    if (record?.baggageCapacity) specs['Baggage Capacity'] = record.baggageCapacity
    if (record?.compartmentDimensions) specs['Luggage Compartment Dimensions'] = record.compartmentDimensions
    if (record?.brochureLink) specs['Brochure Link'] = buildBrochureSpec(record.brochureLink, record, service)
    if (record?.vatNumber) specs['VAT Number'] = record.vatNumber
    if (record?.vatPercentage) specs['VAT Percentage'] = record.vatPercentage
    if (record?.commission) specs['Commission'] = record.commission
  } else if (normalizedType.includes('chauff')) {
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.vehicleType) specs['Vehicle Type'] = record.vehicleType
    if (record?.vehicleModel) specs['Vehicle Model'] = record.vehicleModel
    if (record?.color) specs['Color'] = record.color
    if (record?.transmission) specs['Transmission'] = record.transmission
    if (record?.seatingCapacity) specs['Seating Capacity'] = record.seatingCapacity
    if (record?.luggageCapacity) specs['Luggage Capacity'] = record.luggageCapacity
    if (record?.model) specs['Model Year'] = record.model
    if (record?.vehicleQuantity) specs['Vehicle Quantity'] = record.vehicleQuantity
    if (record?.insurance) specs['Insurance'] = record.insurance
    if (record?.seats) specs['Seats'] = record.seats
    if (record?.seatsConfiguration) specs['Seats Configuration'] = record.seatsConfiguration
    if (record?.babySeat) specs['Baby Seats'] = record.babySeat
    if (record?.fleet) specs['Fleet'] = record.fleet
    if (record?.website) specs['Website'] = { __isWebsite: true, url: record.website }
    if (record?.brochureLink) specs['Brochure Link'] = buildBrochureSpec(record.brochureLink, record, service)
    if (record?.vatNumber) specs['VAT Number'] = record.vatNumber
    if (record?.license) specs['Licenses Numbers'] = record.license
    if (record?.vatPercentage) specs['VAT Percentage'] = record.vatPercentage
    if (record?.commission) specs['Commission'] = record.commission
  } else if (normalizedType.includes('jet') || normalizedType.includes('aviation')) {
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.namePrivateJet) specs['Jet Name'] = record.namePrivateJet
    if (record?.jetCategory) specs['Category'] = record.jetCategory
    if (record?.YOM) specs['Year of Manufacture'] = record.YOM
    if (record?.YOR) specs['Year of Refurbishment'] = record.YOR
    if (record?.maxRange) specs['Max Range'] = record.maxRange
    if (record?.cruisingSpeed) specs['Cruising Speed'] = record.cruisingSpeed
    if (record?.maxAltitude) specs['Max Altitude'] = record.maxAltitude
    if (record?.airportBase) specs['Airport Base'] = record.airportBase
    if (record?.passengersCapacity) specs['Passenger Capacity'] = record.passengersCapacity
    if (record?.lavatory) specs['Lavatory'] = record.lavatory
    if (record?.pilot) specs['Pilot'] = record.pilot
    if (record?.firstOfficer) specs['First Officer'] = record.firstOfficer
    if (record?.flightAttendant) specs['Flight Attendant'] = record.flightAttendant
    if (record?.catering !== undefined) specs['Catering'] = record.catering === true || record.catering === 'Yes' ? 'Yes' : 'No'
    if (record?.typeOfCatering) specs['Type of Catering'] = record.typeOfCatering
    if (record?.brochureLink) specs['Brochure Link'] = buildBrochureSpec(record.brochureLink, record, service)
    if (record?.boatBrochureLink) specs['Brochure Link (Alternative)'] = buildBrochureSpec(record.boatBrochureLink, record, service)
    if (record?.vatNumber) specs['VAT Number'] = record.vatNumber
    if (record?.license) specs['Licenses Numbers'] = record.license
    if (record?.vatPercentage) specs['VAT Percentage'] = record.vatPercentage
    if (record?.commission) specs['Commission'] = record.commission
  } else if (normalizedType.includes('chef') || normalizedType.includes('f_b')) {
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.website) specs['Website'] = { __isWebsite: true, url: record.website }
    if (record?.brochureLink) specs['Brochure Link'] = buildBrochureSpec(record.brochureLink, record, service)
    if (record?.vatNumber) specs['VAT Number'] = record.vatNumber
    if (record?.license) specs['License Numbers'] = record.license
    if (record?.vatPercentage) specs['VAT Percentage'] = record.vatPercentage
    if (record?.commission) specs['Commission'] = record.commission
  } else if (normalizedType.includes('unique') || normalizedType.includes('experience') || (normalizedType.includes('concierge') && normalizedType.includes('package'))) {
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.typeOfService) specs['Type of Service'] = record.typeOfService
    if (record?.country) specs['Country'] = record.country
    if (record?.area) specs['Area'] = record.area
    if (record?.brochureLink) specs['Brochure Link'] = buildBrochureSpec(record.brochureLink, record, service)
    if (record?.vatNumber) specs['VAT Number'] = record.vatNumber
    if (record?.vatPercentage) specs['VAT Percentage'] = record.vatPercentage
    if (record?.commission) specs['Commission'] = record.commission
  } else if (normalizedType.includes('other')) {
    // Para servicios "Other", mostrar todos los campos disponibles
    if (record?.serviceName) specs['Service Name'] = record.serviceName
    if (record?.description) specs['Description'] = record.description
    if (record?.cost) specs['Cost'] = record.cost
    // También verificar si tiene campos adicionales que puedan venir del service directamente
    if (record?.serviceType) specs['Service Type'] = record.serviceType
    // Para "other", el record puede ser el service mismo, pero también verificar en service si está disponible
    const brochureLink = record?.brochureLink || service?.brochureLink
    if (brochureLink) {
      specs['Brochure Link'] = buildBrochureSpec(brochureLink, record, service)
    }
  }

  return specs
}

const extractFeatures = (record: any, serviceType: string): string[] | Record<string, any> => {
  const normalizedType = normalizeType(serviceType)
  const features: string[] = []

  if (normalizedType.includes('heli') || normalizedType.includes('jet')) {
    // Para helicopter y jet, facilities es un array
    if (Array.isArray(record?.facilities)) {
      return record.facilities
    }
  } else if (normalizedType.includes('chauff')) {
    // Para chauffeur, las features son booleanas
    const featureMap: Record<string, string> = {
      ambience: 'Ambience/Lighting',
      sunroof: 'Panoramic Sunroof',
      airconditioning: 'A/C',
      wifi: 'Wi-Fi',
      refrigerator: 'Refrigerator',
      chargingPorts: 'USB Charging Ports',
      refreshments: 'Bottled Water and Refreshments',
      premiumAudio: 'Premium Audio System',
    }

    const activeFeatures: Record<string, boolean> = {}
    Object.keys(featureMap).forEach((key) => {
      if (record?.[key] === 'Yes' || record?.[key] === true) {
        activeFeatures[featureMap[key]] = true
        features.push(featureMap[key])
      }
    })

    return activeFeatures
  }

  return features
}

const extractBrokerInfo = (record: any): { name?: string; email?: string; phone?: string } => {
  return {
    name: pickText(record?.ownerName, record?.brokerName),
    email: pickText(record?.ownerEmail, record?.email),
    phone: pickText(record?.ownerPhone, record?.phone),
  }
}

/** Una línea de key feature para el website: "Label: value" (API puede mandar string o { key, value }). */
function formatKeyFeatureDisplayItem(item: unknown): string {
  if (item == null) return ''
  if (typeof item === 'string') {
    return item.trim()
  }
  if (typeof item === 'object' && item !== null) {
    const o = item as Record<string, unknown>
    const k = pickText(
      typeof o.key === 'string' ? o.key : undefined,
      typeof o.label === 'string' ? o.label : undefined,
      typeof o.name === 'string' ? o.name : undefined,
    )
    const rawVal = o.value ?? o.text
    const v =
      rawVal == null || rawVal === ''
        ? ''
        : typeof rawVal === 'string' || typeof rawVal === 'number' || typeof rawVal === 'boolean'
          ? String(rawVal).trim()
          : ''
    if (k && v) return `${k}: ${v}`
    if (v) return v
    if (k) return k
  }
  return String(item).trim()
}

export const mapServiceToDetail = (service: any): ConciergeServiceDetail => {
  const preview = mapServiceToPreview(service)
  const { record } = getPrimaryRecord(service)
  const { images: gallery, positions: galleryPositions } = buildGallery(service)
  const normalizedType = normalizeType(service?.type)

  // Para servicios "Other", usar el service directamente como record si no hay colección
  const effectiveRecord = record || (normalizedType.includes('other') || normalizedType.includes('car_rental') ? service : null)

  const secondaryDescription = pickText(
    effectiveRecord?.intinerary,
    effectiveRecord?.additionalInfo,
    effectiveRecord?.summary,
    preview.description
  )

  const specifications = effectiveRecord ? extractSpecifications(effectiveRecord, preview.type, service) : {}
  const features = effectiveRecord ? extractFeatures(effectiveRecord, preview.type) : []
  const brokerInfo = effectiveRecord ? extractBrokerInfo(effectiveRecord) : undefined

  // Extraer secciones destacadas (para todos los tipos de servicios)
  const highlightedSections: Array<{ title: string; image: string; description: string; imagePosition?: string | null }> = []
  if (effectiveRecord) {
    for (let i = 1; i <= 3; i++) {
      const title = effectiveRecord[`highlightedSection${i}Title`]
      const image = effectiveRecord[`highlightedSection${i}Image`]
      const description = effectiveRecord[`highlightedSection${i}Description`]
      if (title || image || description) {
        highlightedSections.push({
          title: title || '',
          image: image ? resolveMediaUrl(image) || '' : '',
          description: description || '',
          imagePosition: effectiveRecord.highlightedSectionsPosition?.[String(i)] || null,
        })
      }
    }
  }

  // Extraer key features (para todos los tipos de servicios)
  let keyFeatures: string[] | undefined = undefined
  if (effectiveRecord?.keyFeatures) {
    if (Array.isArray(effectiveRecord.keyFeatures)) {
      // Un array con un único elemento que es JSON string (e.g. ['["a","b"]']) → expandirlo
      const rawArr = effectiveRecord.keyFeatures
      let expanded: unknown[] = rawArr
      if (rawArr.length === 1 && typeof rawArr[0] === 'string') {
        const s = rawArr[0].trim()
        if (s.startsWith('[')) {
          try { expanded = JSON.parse(s) } catch { /* use as-is */ }
        }
      }
      keyFeatures = expanded
        .map((item: unknown) => formatKeyFeatureDisplayItem(item))
        .filter((s) => s.length > 0)
    } else if (typeof effectiveRecord.keyFeatures === 'string') {
      const raw = effectiveRecord.keyFeatures.trim()
      let parsed: unknown = null
      if (raw.startsWith('[')) {
        try { parsed = JSON.parse(raw) } catch { /* fall through */ }
      }
      let features: string[]
      if (Array.isArray(parsed)) {
        features = parsed
      } else if (raw.startsWith('<')) {
        // HTML from rich text editor — treat as a single block, don't split
        features = [raw]
      } else {
        features = raw.split(/[\n,;]/).map((f: string) => f.trim()).filter((f: string) => f.length > 0)
      }
      if (features.length > 0) {
        keyFeatures = features.map((f) => formatKeyFeatureDisplayItem(f)).filter((s) => s.length > 0)
      }
    }
  }

  // Fill in whatever topics staff didn't already cover by hand, using the structured spec fields
  // (Features tab) — appended after their own bullets, never replacing them.
  if (effectiveRecord) {
    const autoFeatures = buildAutoKeyFeatures(normalizeType(preview.type), effectiveRecord, keyFeatures ?? [])
    if (autoFeatures.length > 0) keyFeatures = [...(keyFeatures ?? []), ...autoFeatures]
  }

  return {
    id: preview.id,
    name: preview.name,
    type: preview.type,
    heroImage: gallery[0],
    gallery,
    galleryPositions,
    description: preview.description,
    secondaryDescription,
    location: preview.location,
    area: (effectiveRecord?.area ?? effectiveRecord?.region) ?? null,
    price: preview.price,
    primaryRecord: effectiveRecord,
    raw: service,
    specifications,
    features,
    brokerInfo: brokerInfo ?? {},
    highlightedSections,
    keyFeatures: keyFeatures ?? [],
    mainImagePosition: effectiveRecord?.mainImagePosition ?? (service as any)?.mainImagePosition ?? 'center',
    metaTitle: effectiveRecord?.metaTitle ?? (service as any)?.metaTitle ?? null,
    metaDescription: effectiveRecord?.metaDescription ?? (service as any)?.metaDescription ?? null,
    metaImageUrl: effectiveRecord?.metaImageUrl ?? (service as any)?.metaImageUrl ?? null,
  }
}

export const collectLocationsFromService = (service: any) => {
  const locations = new Set<string>()
  const addTokens = (s: string) => {
    s.split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => locations.add(t))
  }
  const primaryLoc = pickText(service?.location)
  if (primaryLoc) addTokens(primaryLoc)
  const { record } = getPrimaryRecord(service)
  if (record) {
    const v = pickText(record.location, record.area, record.region)
    if (v) addTokens(v)
  }
  return Array.from(locations)
}

export const collectUniqueLocations = (services: any[]) => {
  const set = new Set<string>()
  services.forEach((service) => {
    collectLocationsFromService(service).forEach((location) => set.add(location))
  })
  return Array.from(set)
}
