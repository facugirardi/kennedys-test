import type { LocationCountryGroup } from '@/components/custom/LocationTreeDropdown'
import { slugify } from '@/lib/utils'

/**
 * Opciones del filtro Location (villas + real estate), alineadas con destinos Kennedys.
 * Towns shown as selectable leaves in the real-estate location tree under Athens Riviera,
 * north-to-south on the map, per client request (2026-09-22). Kalyvia Thorikou is
 * intentionally not a standalone entry here — it's part of Lagonisi and was confusing the
 * map (auto-selecting Kalyvia Thorikou instead of Lagonisi); its listings are folded into
 * Lagonisi via LOCATION_AREA_EXPANSIONS below.
 */
export const ATHENS_RIVIERA_VISIBLE_TOWNS = [
  'Palaio Faliro',
  'Alimos',
  'Elliniko',
  'Glyfada',
  'Voula',
  'Vouliagmeni',
  'Vari - Varkiza',
  'Lagonisi',
] as const

/**
 * Glyfada sub-areas per Elpida (2026-09-22). These are the real `Property.area` values for
 * Glyfada listings (not "Glyfada" itself) — shown nested under Glyfada in the real-estate
 * Location dropdown. "Kato Glyfada" has its own further breakdown, see KATO_GLYFADA_SUB_AREAS.
 */
export const GLYFADA_AREAS = [
  'Kato Glyfada',
  'Ano Glyfada',
  'Aixoni',
  'Pyrnari',
  'Aigli',
  'Terpsithea',
  'Panionia',
  'Larisis',
] as const

/** 4th level: specific sub-divisions of Kato Glyfada, stored in `Property.location`. */
export const KATO_GLYFADA_SUB_AREAS = ['Center', 'Golf'] as const

/** Voula sub-areas per Elpida (2026-09-22) — same pattern as Glyfada above. */
export const VOULA_AREAS = [
  'Kato Voula',
  'Ano Voula',
  'Panorama',
  'Dikigorika',
  'Exochi',
  'Nea Kalimnos',
  'Pigadakia',
] as const

/** 4th level: specific sub-divisions of Kato Voula, stored in `Property.location`. */
export const KATO_VOULA_SUB_AREAS = ['Center', 'Evriali', 'Politia'] as const

/**
 * Sub-areas / aliases that Athens Riviera expands to for API search queries.
 * Includes eAgents compound names (Vari - Varkiza) and slash variants used on listings.
 */
export const ATHENS_RIVIERA_EXPANSION = [
  ...ATHENS_RIVIERA_VISIBLE_TOWNS,
  'Varkiza',
  'Vari',
  'Vari/Varkiza',
  /** Kalyvia Thorikou is folded into Lagonisi, not a standalone town — still cover both
   *  spellings ("Kalivia"/"Kalyvia") here so "Athens Riviera" (select-all) keeps matching it. */
  'Kalyvia Thorikou',
  'Kalivia Thorikou',
  /** Glyfada/Voula listings are tagged with their specific sub-area, not "Glyfada"/"Voula"
   *  literally — include those so "Athens Riviera" (select-all) still catches them. */
  ...GLYFADA_AREAS,
  ...VOULA_AREAS,
] as const

const LOCATION_AREA_EXPANSIONS: Record<string, readonly string[]> = {
  'Athens Riviera': ATHENS_RIVIERA_EXPANSION,
  /** Single-town Vari pick: cover slash / bare aliases used on listings. */
  'Vari - Varkiza': ['Vari - Varkiza', 'Vari/Varkiza', 'Vari', 'Varkiza'],
  /** Real-estate filter: include legacy Porto Heli listings under Peloponnese. */
  Peloponnese: ['Peloponnese', 'Porto Heli'],
  /**
   * Kalyvia Thorikou is part of Lagonisi and no longer a selectable filter on its own —
   * fold its listings (both spellings) into the Lagonisi selection.
   */
  Lagonisi: ['Lagonisi', 'Kalyvia Thorikou', 'Kalivia Thorikou'],
  /**
   * "Glyfada" itself is never a property's Area value — listings are tagged with one of
   * GLYFADA_AREAS. Picking "Glyfada" broadly needs to expand to all of them.
   */
  Glyfada: [...GLYFADA_AREAS],
  /** Same as Glyfada above, for Voula. */
  Voula: [...VOULA_AREAS],
  /**
   * "Crete Island" is the display label (and the only Greek region with no `areasByRegion`
   * entry, so it's selected as a flat leaf) — but listings are tagged with the plain area/region
   * value "Crete" (see the legacy `<option value="Crete">` in components/custom/filter.tsx and
   * frame-component10.tsx). Without this, selecting "Crete Island" or "Greece" (select-all) sent
   * only the literal "Crete Island" token, which never matches, silently dropping Crete listings.
   */
  'Crete Island': ['Crete Island', 'Crete'],
}

const GREECE_LOCATION_GROUP: LocationCountryGroup = {
  country: 'Greece',
  regions: [
    'Mainland Greece',
    'Cyclades Islands',
    'Dodecanese Islands',
    'Ionian Islands',
    'Saronic Islands',
    'Crete Island',
    'Sporades Islands',
  ],
  areasByRegion: {
    'Mainland Greece': ['Athens Riviera', 'Porto Heli'],
    'Cyclades Islands': [
      'Mykonos',
      'Paros',
      'Antiparos',
      'Santorini',
      'Naxos',
      'Tinos',
      'Milos',
    ],
    'Dodecanese Islands': ['Patmos'],
    'Ionian Islands': ['Corfu', 'Kefalonia', 'Lefkada', 'Zakynthos', 'Meganissi'],
    'Saronic Islands': ['Hydra', 'Spetses'],
    'Sporades Islands': ['Skopelos', 'Alonissos', 'Skiathos'],
  },
}

export const KENNEDYS_LOCATION_FILTER_TREE: LocationCountryGroup[] = [
  GREECE_LOCATION_GROUP,
  {
    country: 'Spain',
    regions: ['Balearic Islands'],
    areasByRegion: {
      'Balearic Islands': ['Ibiza', 'Mallorca', 'Formentera', 'Marbella'],
    },
  },
  {
    country: 'France',
    regions: ['French Riviera', 'French Alps'],
    areasByRegion: {
      'French Riviera': ['Antibes', 'Cannes', 'Saint-Tropez', 'Saint-Tropez Peninsula'],
      'French Alps': ['Courchevel', 'Meribel', "Val d'Isère", 'Megeve'],
    },
  },
  {
    country: 'Switzerland',
    regions: ['Swiss Alps'],
    areasByRegion: {
      'Swiss Alps': ['Verbier', 'Zermatt'],
    },
  },
  {
    country: 'Caribbean',
    regions: ['St Barts', 'Tulum'],
  },
  {
    country: 'Costa Rica',
    regions: ['Santa Teressa', 'Papayago'],
  },
]

/**
 * Returns the sub-areas to search when the given area leaf is selected.
 * For Athens Riviera → coastal towns + Vari/Varkiza aliases. For everything else → [area].
 */
export function expandLocationArea(area: string): string[] {
  return LOCATION_AREA_EXPANSIONS[area] ? [...LOCATION_AREA_EXPANSIONS[area]] : [area]
}

/** Location filter tree restricted to Greece — used for real estate pages. */
export const REAL_ESTATE_LOCATION_FILTER_TREE: LocationCountryGroup[] = [
  {
    ...GREECE_LOCATION_GROUP,
    areasByRegion: {
      ...GREECE_LOCATION_GROUP.areasByRegion,
      // Athens Riviera (select-all); its coastal towns nest underneath it as sub-areas below.
      'Mainland Greece': ['Athens Riviera', 'Peloponnese'],
      'Cyclades Islands': [
        ...(GREECE_LOCATION_GROUP.areasByRegion?.['Cyclades Islands'] ?? []),
        'Kythnos',
      ],
      'Dodecanese Islands': ['Patmos', 'Fourni', 'Chios'],
    },
    // Coastal towns nested under Athens Riviera (not flat siblings under Mainland Greece).
    subAreasByArea: {
      'Athens Riviera': [...ATHENS_RIVIERA_VISIBLE_TOWNS],
    },
    // Glyfada/Voula sub-areas per Elpida (2026-09-22) — curated, not derived from live listings
    // (unlike the dynamic subAreasByArea merged in on the real-estate list page for other towns).
    // Nested one level deeper than before since Glyfada/Voula are now sub-areas of Athens Riviera.
    subSubAreasBySubArea: {
      Glyfada: [...GLYFADA_AREAS],
      Voula: [...VOULA_AREAS],
    },
    subSubSubAreasBySubSubArea: {
      'Kato Glyfada': [...KATO_GLYFADA_SUB_AREAS],
      'Kato Voula': [...KATO_VOULA_SUB_AREAS],
    },
  },
]

function normalizeRegionToken(r: string): string {
  const t = (r || '').trim()
  if (!t) return ''
  if (t.toUpperCase() === 'GR') return 'Greece'
  return t
}

function collectAllNamesForCountry(group: LocationCountryGroup): string[] {
  const names: string[] = []
  const byRegion = (group as any).areasByRegion || {}
  for (const reg of (group as any).regions || []) {
    const regionDisplay = normalizeRegionToken(reg)
    if (regionDisplay) names.push(regionDisplay)
    const rawAreas = byRegion[reg] ?? byRegion[regionDisplay] ?? []
    for (const area of rawAreas) {
      const a = (area || '').trim()
      if (a) names.push(a)
    }
  }
  return Array.from(new Set(names.filter(Boolean)))
}

/**
 * Returns a filtered tree where `alwaysVisible` countries (default: Greece) are always
 * fully included, and all other countries are only included if at least one of their leaf
 * areas appears in `availableRegions` (case-insensitive).
 *
 * Pass an empty `availableRegions` array to show only Greece (useful while data loads).
 */
export function filterTreeByAvailableRegions(
  tree: LocationCountryGroup[],
  availableRegions: string[],
  alwaysVisible: string[] = ['Greece'],
): LocationCountryGroup[] {
  const available = new Set(availableRegions.map((r) => r.trim().toLowerCase()))
  return tree.filter((group) => {
    if (alwaysVisible.includes(group.country)) return true
    if (available.size === 0) return false
    const names = collectAllNamesForCountry(group)
    return names.some((name) => available.has(name.trim().toLowerCase()))
  })
}

/**
 * Resuelve un slug de URL (p. ej. `mykonos`, `athens-riviera`) al nombre canónico de filtro:
 * hoja del árbol o, si el slug coincide con una región con sub-áreas, el nombre de esa región
 * (equivalente a "todas las áreas" / CSV de hojas en el dropdown).
 */
export function kennedysTreeLeafMatchingSlug(targetSlug: string): string | null {
  const t = targetSlug.trim().toLowerCase()
  if (!t) return null

  for (const group of KENNEDYS_LOCATION_FILTER_TREE) {
    const byRegion = group.areasByRegion
    if (!byRegion || Object.keys(byRegion).length === 0) {
      for (const reg of group.regions || []) {
        const r = (reg || '').trim()
        if (r && slugify(r).toLowerCase() === t) return reg
      }
      continue
    }
    for (const reg of group.regions || []) {
      const areas = byRegion[reg] ?? []
      const regionLabel = (reg || '').trim()
      if (areas.length > 0) {
        if (regionLabel && slugify(regionLabel).toLowerCase() === t) return regionLabel
      } else {
        const r = regionLabel
        if (r && slugify(r).toLowerCase() === t) return reg
        continue
      }
      for (const leaf of areas) {
        const L = (leaf || '').trim()
        if (L && slugify(L).toLowerCase() === t) return leaf
      }
    }
  }
  return null
}
