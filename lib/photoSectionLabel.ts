// Etiqueta legible de la categoría ("section") de una foto de propiedad. Acepta tanto el formato
// viejo ("3 BEDROOMS", "ADDED FACILITIES: JACUZZI") como el nuevo ("Bedroom", "Added Facilities: Jacuzzi"),
// así la web se ve igual antes y después de correr scripts/normalize-photo-sections.ts en kennedys-api.
// Las categorías fijas están en sync con PHOTO_SECTION_OPTIONS de kennedys-loggia (lib/photoSections.js).

const ADDED_FACILITIES_LABEL = 'Added Facilities'
const ADDED_FACILITIES_PREFIX = /^added facilities\s*:\s*/i
const LEGACY_BEDROOMS = /^\d+\s+bedrooms?$/i

const FIXED_LABELS: Record<string, string> = Object.fromEntries(
  [
    'Bedroom',
    'Indoor Living',
    'Kitchen',
    'Dining',
    'Bathroom',
    'Pool',
    'Jacuzzi',
    'Outdoor',
    'Exterior',
    'Beach',
    'Spa & Wellness',
    'Views',
    ADDED_FACILITIES_LABEL,
  ].map((label) => [label.toLowerCase(), label])
)

const UPPERCASE_WORDS = new Set(['bbq', 'tv', 'vip', 'wc'])
const LOWERCASE_WORDS = new Set(['and', 'of', 'the', 'to', 'by', 'in', 'on', 'at', 'for', 'a', 'an'])

function titleCaseWord(word: string, isFirst: boolean): string {
  const lower = word.toLowerCase()
  if (UPPERCASE_WORDS.has(lower)) return lower.toUpperCase()
  if (!isFirst && LOWERCASE_WORDS.has(lower)) return lower
  // "tennis/paddle" → "Tennis/Paddle", "walk-in" → "Walk-In"
  return lower.replace(/(^|[-/(])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase())
}

export function titleCaseFacility(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word, i) => titleCaseWord(word, i === 0))
    .join(' ')
}

export function formatPhotoSectionLabel(section: string | null | undefined): string {
  const value = String(section || '').trim()
  if (!value) return ''
  if (value.toLowerCase() === ADDED_FACILITIES_LABEL.toLowerCase()) return ADDED_FACILITIES_LABEL
  if (ADDED_FACILITIES_PREFIX.test(value)) {
    const text = value.replace(ADDED_FACILITIES_PREFIX, '').trim()
    return text ? titleCaseFacility(text) : ADDED_FACILITIES_LABEL
  }
  if (LEGACY_BEDROOMS.test(value)) return 'Bedroom'
  return FIXED_LABELS[value.toLowerCase()] ?? value
}
