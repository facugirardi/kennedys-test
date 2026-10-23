/**
 * Canonical slug → location name mappings for SSG location pages.
 * Rewrites in next.config.js map /villas/:slug → /villas/location/:slug.
 */

export type LocationSlugEntry = {
  name: string
  heroImage: string
}

const DEFAULT_HERO = '/images/home-image.png'

const ENTRIES: Record<string, LocationSlugEntry> = {
  // ─── Greece ──────────────────────────────────────────────────────────────
  mykonos:          { name: 'Mykonos',          heroImage: '/images/Mykonos-image.jpg' },
  santorini:        { name: 'Santorini',        heroImage: '/images/greek-island-image.png' },
  paros:            { name: 'Paros',            heroImage: '/images/paros-image.png' },
  antiparos:        { name: 'Antiparos',        heroImage: '/images/paros-image.png' },
  naxos:            { name: 'Naxos',            heroImage: DEFAULT_HERO },
  tinos:            { name: 'Tinos',            heroImage: DEFAULT_HERO },
  milos:            { name: 'Milos',            heroImage: DEFAULT_HERO },
  patmos:           { name: 'Patmos',           heroImage: DEFAULT_HERO },
  corfu:            { name: 'Corfu',            heroImage: DEFAULT_HERO },
  kefalonia:        { name: 'Kefalonia',        heroImage: DEFAULT_HERO },
  lefkada:          { name: 'Lefkada',          heroImage: DEFAULT_HERO },
  zakynthos:        { name: 'Zakynthos',        heroImage: DEFAULT_HERO },
  meganissi:        { name: 'Meganissi',        heroImage: DEFAULT_HERO },
  hydra:            { name: 'Hydra',            heroImage: DEFAULT_HERO },
  spetses:          { name: 'Spetses',          heroImage: DEFAULT_HERO },
  skopelos:         { name: 'Skopelos',         heroImage: DEFAULT_HERO },
  alonissos:        { name: 'Alonissos',        heroImage: DEFAULT_HERO },
  skiathos:         { name: 'Skiathos',         heroImage: DEFAULT_HERO },
  'athens-riviera': { name: 'Athens Riviera',   heroImage: '/images/greek-island-image.png' },
  'porto-heli':     { name: 'Porto Heli',       heroImage: DEFAULT_HERO },
  peloponnese:      { name: 'Peloponnese',      heroImage: DEFAULT_HERO },
  kythnos:          { name: 'Kythnos',          heroImage: DEFAULT_HERO },
  fourni:           { name: 'Fourni',           heroImage: DEFAULT_HERO },
  crete:            { name: 'Crete Island',     heroImage: DEFAULT_HERO },
  // ─── Spain ───────────────────────────────────────────────────────────────
  ibiza:            { name: 'Ibiza',            heroImage: DEFAULT_HERO },
  mallorca:         { name: 'Mallorca',         heroImage: DEFAULT_HERO },
  formentera:       { name: 'Formentera',       heroImage: DEFAULT_HERO },
  marbella:         { name: 'Marbella',         heroImage: DEFAULT_HERO },
  // ─── France ──────────────────────────────────────────────────────────────
  cannes:           { name: 'Cannes',           heroImage: DEFAULT_HERO },
  'saint-tropez':   { name: 'Saint-Tropez',     heroImage: DEFAULT_HERO },
  courchevel:       { name: 'Courchevel',       heroImage: '/images/COURCEVEL-image.png' },
  meribel:          { name: 'Meribel',          heroImage: DEFAULT_HERO },
  // ─── Switzerland ─────────────────────────────────────────────────────────
  verbier:          { name: 'Verbier',          heroImage: DEFAULT_HERO },
  zermatt:          { name: 'Zermatt',          heroImage: DEFAULT_HERO },
  // ─── Caribbean ───────────────────────────────────────────────────────────
  'st-barts':       { name: 'St Barts',         heroImage: '/images/SAINT BARTH-image.png' },
  tulum:            { name: 'Tulum',            heroImage: DEFAULT_HERO },
  // ─── Costa Rica ──────────────────────────────────────────────────────────
  'costa-rica':     { name: 'Santa Teressa',    heroImage: '/images/COSTA RICA-image.png' },
}

export const LOCATION_SLUGS = Object.keys(ENTRIES)

export function getSlugByName(name: string): string | null {
  const lower = name.toLowerCase()
  const match = Object.entries(ENTRIES).find(([, e]) => e.name.toLowerCase() === lower)
  return match ? match[0] : null
}

export function getLocationEntry(slug: string): LocationSlugEntry | null {
  return ENTRIES[slug] ?? null
}

/** Slugs used for villas location pages. */
export const VILLA_LOCATION_SLUGS = LOCATION_SLUGS

/** Slugs used for real-estate location pages (mainly investment markets). */
export const REAL_ESTATE_LOCATION_SLUGS = [
  'mykonos', 'santorini', 'paros', 'antiparos', 'naxos', 'tinos', 'milos', 'kythnos',
  'patmos', 'fourni', 'corfu', 'kefalonia', 'lefkada', 'zakynthos', 'meganissi',
  'hydra', 'spetses', 'skopelos', 'alonissos', 'skiathos',
  'athens-riviera', 'peloponnese', 'crete',
  'ibiza', 'mallorca',
]

/** Slugs used for events location pages. */
export const EVENTS_LOCATION_SLUGS = LOCATION_SLUGS

/** Slugs used for experiences location pages. */
export const EXPERIENCES_LOCATION_SLUGS = LOCATION_SLUGS

/** Slugs used for concierge location pages. */
export const CONCIERGE_LOCATION_SLUGS = LOCATION_SLUGS
