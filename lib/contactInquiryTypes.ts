/** Values sent as `inquiryType` to POST /contact — must match API whitelist. */
export const CONTACT_INQUIRY_TYPES = [
  'VILLA_RENTALS',
  'PROPERTY_MANAGEMENT',
  'CONCIERGE',
  'EVENTS',
  'REAL_ESTATE',
  'MARKETING',
] as const

export type ContactInquiryType = (typeof CONTACT_INQUIRY_TYPES)[number]

export const CONTACT_INQUIRY_LABELS: Record<ContactInquiryType, string> = {
  VILLA_RENTALS: 'Villa Rentals',
  PROPERTY_MANAGEMENT: 'Property Management',
  CONCIERGE: 'Concierge',
  EVENTS: 'Events',
  REAL_ESTATE: 'Real Estate',
  MARKETING: 'Marketing',
}

export const CONTACT_INQUIRY_OPTIONS: { value: ContactInquiryType; label: string }[] =
  CONTACT_INQUIRY_TYPES.map((value) => ({
    value,
    label: CONTACT_INQUIRY_LABELS[value],
  }))

export const CONTACT_INQUIRY_SELECT_WITH_EMPTY = [
  { value: '' as const, label: 'Select' },
  ...CONTACT_INQUIRY_OPTIONS,
]

export function isContactInquiryType(v: string): v is ContactInquiryType {
  return (CONTACT_INQUIRY_TYPES as readonly string[]).includes(v)
}

/** Preset for the floating contact button / route-based defaults */
export function contactPresetFromPathname(pathname: string): ContactInquiryType | null {
  if (pathname.startsWith('/villas') || pathname.startsWith('/agent-property')) return 'VILLA_RENTALS'
  if (pathname.startsWith('/shared-properties')) return 'VILLA_RENTALS'
  if (pathname.startsWith('/concierge')) return 'CONCIERGE'
  if (pathname.startsWith('/real-estate') || pathname.startsWith('/sell-with-us')) return 'REAL_ESTATE'
  if (pathname.startsWith('/events')) return 'EVENTS'
  if (pathname === '/we-manage-your-property') return 'PROPERTY_MANAGEMENT'
  return null
}
