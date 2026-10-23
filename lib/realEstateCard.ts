import { heroImageDirectUrl } from '@/lib/utils'
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark'

const TYPE_LABELS: Record<string, string> = {
  MAISONETTE: 'Maisonette',
  DETACHED_VILLA: 'Detached villa',
  SEMI_DETACHED_VILLA: 'Semi-detached villa',
  VILLA: 'Villa',
  VILLA_COMPLEX: 'Villa complex',
  APARTMENT: 'Apartment',
  PENTHOUSE: 'Penthouse',
  LAND: 'Land',
}

function propertyTypeLabel(type?: string | null): string {
  const t = String(type ?? '').trim()
  if (!t) return ''
  if (TYPE_LABELS[t]) return TYPE_LABELS[t]
  const words = t.toLowerCase().replace(/_/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

/**
 * Extra, data-driven fields for the real estate card (photo carousel, type label, status badge).
 * Everything is empty when the API doesn't return it, and the card hides what is empty.
 */
export function getRealEstateCardExtras(property: any, imageLimit = 5): {
  images: string[]
  typeLabel: string
  badge: string
} {
  const list: any[] = Array.isArray(property?.images) ? [...property.images] : []
  const watermark = shouldWatermarkImage(property?.watermarkPhotos, 'real-estate')
  const images = list
    .filter((i) => i && String(i.urlImage ?? '').trim())
    .sort((a, b) => {
      const pa = a.isPrimary === true || a.isPrimary === 'true' || a.isPrimary === 1
      const pb = b.isPrimary === true || b.isPrimary === 'true' || b.isPrimary === 1
      if (pa && !pb) return -1
      if (pb && !pa) return 1
      return (Number(a.order) || 0) - (Number(b.order) || 0)
    })
    .slice(0, imageLimit)
    .map((i) => {
      const resolved = heroImageDirectUrl(i.urlImage)
      return watermark ? watermarkedImageUrl(resolved) : resolved
    })
    .filter(Boolean)

  const badge =
    String(property?.propertyStatus ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s.toLowerCase() !== 'for sale')[0] ?? ''

  return {
    images,
    typeLabel: propertyTypeLabel(property?.type ?? property?.classification?.type),
    badge,
  }
}
