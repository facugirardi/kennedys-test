/**
 * Mapea Property a VillaDataView para la página PDF dedicada.
 * Usado solo por /pdf/[id] - sin condicionales en páginas originales.
 */
import { resolveMediaUrl } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { htmlToPlainText } from '@/lib/pdf/htmlToPlainText';
import type { Property } from '@/interfaces/property';
import type { VillaDataView } from '@/components/custom/PropertyDetailPDFLayout';

const PLACEHOLDER = '/images/villa-detail@2x.png';

export type MapPropertyForPdfOverrides = {
  price?: string;
  nights?: string | number;
};

export function mapPropertyForPdf(
  property: Property,
  branded: boolean,
  overrides?: MapPropertyForPdfOverrides
): VillaDataView {
  const classification = property.classification ?? {};
  const images = Array.isArray(property.images) ? property.images : [];
  const isRealEstate = property.rental === false || property.category === 'real-estate';

  const getImage = (index: number) => {
    if (!images[index]) return PLACEHOLDER;
    const raw = (images[index] as any)?.urlImage || (images[index] as any)?.url || '';
    if (!raw) return PLACEHOLDER;
    return /^https?:\/\//i.test(raw) ? raw : (resolveMediaUrl(raw) || PLACEHOLDER);
  };

  const getPrimaryImage = () => {
    const primary = images.find((img: any) => img?.isPrimary || img?.is_primary || img?.primary);
    if (primary) {
      const raw = (primary as any)?.urlImage ?? (primary as any)?.url ?? '';
      if (raw) {
        const url = /^https?:\/\//i.test(raw) ? raw : resolveMediaUrl(raw);
        if (url) return url;
      }
    }
    return getImage(0);
  };

  const indoorArea = (classification as any).indoor_area ?? (classification as any).indoorArea;
  const outdoorArea = (classification as any).outdoor_area ?? (classification as any).outdoorArea;

  const indoorAmenities = property.indoorAmenities
    ? (typeof property.indoorAmenities === 'string'
        ? property.indoorAmenities.split(',').filter(Boolean).map((s: string) => s.trim())
        : Array.isArray(property.indoorAmenities) ? property.indoorAmenities : [])
    : [];
  const outdoorAmenities = property.outdoorAmenities
    ? (typeof property.outdoorAmenities === 'string'
        ? property.outdoorAmenities.split(',').filter(Boolean).map((s: string) => s.trim())
        : Array.isArray(property.outdoorAmenities) ? property.outdoorAmenities : [])
    : [];
  const customFacilities = (classification as any).customFacilities
    ? (Array.isArray((classification as any).customFacilities)
        ? (classification as any).customFacilities
        : typeof (classification as any).customFacilities === 'string'
          ? (classification as any).customFacilities.split(',').filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];
  const facilities = [...indoorAmenities, ...outdoorAmenities, ...customFacilities];

  const accommodationItems: string[] = [];
  const labels: Record<string, string> = {
    masterBedroom: 'Master Bedroom',
    doubleBedroom: 'Double Bedroom',
    twinBedroom: 'Twin Bedroom',
    singleBedroom: 'Single Bedroom',
    bedroomWithBunkBeds: 'Bedroom with bunk beds',
    guestBedroom: 'Guest Bedroom',
  };
  (Object.keys(labels) as (keyof typeof labels)[]).forEach((key) => {
    const n = (classification as any)[key];
    if (n && n > 0) {
      const label = labels[key];
      accommodationItems.push(`${n}x ${label}${n > 1 ? 's' : ''}`);
    }
  });

  const villaGroups = (property.description?.theVilla?.groups || []).map((g: any) => ({
    title: g?.title || '',
    items: Array.isArray(g?.items) ? g.items : [],
  }));

  const includedServices = Array.isArray((classification as any).includedServices)
    ? (classification as any).includedServices
    : typeof (classification as any).includedServices === 'string'
      ? (classification as any).includedServices.split(',').filter(Boolean).map((s: string) => s.trim())
      : [];

  const servicesFromClassification = (classification as any).services
    ? (Array.isArray((classification as any).services)
        ? (classification as any).services
        : typeof (classification as any).services === 'string'
          ? (classification as any).services.split(',').filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];

  const enjoy = (classification as any).enjoy
    ? (Array.isArray((classification as any).enjoy)
        ? (classification as any).enjoy
        : typeof (classification as any).enjoy === 'string'
          ? (classification as any).enjoy.split(/[,\n]/).filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];

  const priceVisible = (property as any).price_visibility !== false;
  const basePrice = !priceVisible
    ? 'Price upon request'
    : isRealEstate
      ? formatCurrency((property as any).sale_price)
      : formatCurrency(property.price_per_night);

  const baseDescription = htmlToPlainText(
    isRealEstate
      ? (property.summary || property.description?.shortDescription || property.description?.caption || '')
      : (property.description?.longDescription ||
          property.summary ||
          property.description?.shortDescription ||
          property.description?.caption ||
          '')
  );

  const aboutDescription = htmlToPlainText(
    isRealEstate
      ? (property.description?.aboutDescription || property.description?.shortDescription || '')
      : (property.description?.aboutDescription ||
          property.description?.shortDescription ||
          property.description?.longDescription ||
          '')
  );

  const pools =
    Array.isArray(classification.pools) &&
    classification.pools.filter((p: any) => (p?.type || 'pool') === 'pool').length > 0
      ? classification.pools
          .filter((p: any) => (p?.type || 'pool') === 'pool')
          .reduce((s: number, p: any) => s + (Number(p?.cant) ?? 0), 0)
      : null;

  const jacuzzis =
    Array.isArray(classification.pools) &&
    classification.pools.filter((p: any) => (p?.type || '').toLowerCase() === 'jacuzzi').length > 0
      ? classification.pools
          .filter((p: any) => (p?.type || '').toLowerCase() === 'jacuzzi')
          .reduce((s: number, p: any) => s + (Number(p?.cant) ?? 0), 0)
      : null;

  const title = branded
    ? (property.title || property.alternativeTitle || '')
    : ((property as any).agentFriendlyName || property.title || property.alternativeTitle || '');

  const location = (() => {
    const parts = [property.visibleLocation, property.location, property.region, property.country].filter(Boolean) as string[];
    const result: string[] = [];
    for (const p of parts) {
      const k = p.trim().toLowerCase();
      if (!result.some((r) => r.toLowerCase().includes(k))) {
        result.push(p.trim());
      }
    }
    return result.join(', ');
  })();

  const finalPrice = branded ? (overrides?.price ?? basePrice) : '';

  let perNightPrice = finalPrice;
  if (!isRealEstate && finalPrice && finalPrice !== 'Price upon request' && overrides?.nights) {
    const nights = Number(overrides.nights);
    if (nights > 1) {
      const numeric = parseFloat(finalPrice.replace(/[^\d.]/g, '').replace(/,/g, ''));
      if (!isNaN(numeric) && numeric > 0) {
        const perNight = numeric / nights;
        const currencyPrefix = finalPrice.match(/^[^\d]+/)?.[0] ?? '';
        const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(perNight);
        perNightPrice = `${currencyPrefix}${formatted}`;
      }
    }
  }

  /** Texto de la franja superior del PDF: tagline/hero (caption, resumen, etc.), no el nombre comercial. */
  const rawCaption = htmlToPlainText(property.description?.caption || '').trim();
  const isPlaceholderCaption = /^hero\s*description$/i.test(rawCaption) || rawCaption.length < 3;
  const firstNonEmptyPlain = (...parts: (string | null | undefined)[]): string => {
    for (const part of parts) {
      const t = htmlToPlainText(String(part ?? '')).trim();
      if (t) return t;
    }
    return '';
  };
  let pdfTopBannerText = isRealEstate
    ? firstNonEmptyPlain(
        isPlaceholderCaption ? '' : property.description?.caption,
        property.summary,
        property.description?.shortDescription
      )
    : firstNonEmptyPlain(
        isPlaceholderCaption ? '' : property.description?.caption,
        property.summary,
        property.description?.shortDescription,
        property.description?.longDescription
      );
  if (pdfTopBannerText.length > 160) {
    pdfTopBannerText = `${pdfTopBannerText.slice(0, 157).trim()}…`;
  }

  return {
    id: property.id,
    title,
    location,
    pdfTopBannerText,
    description: baseDescription || '',
    aboutDescription: aboutDescription || '',
    bedrooms: classification.bedrooms ?? null,
    baths: classification.baths ?? null,
    guests: property.guests ?? (classification as any).idealPersons ?? (classification as any).maxPersons ?? null,
    pools,
    jacuzzis,
    price: finalPrice,
    pricePerNight: isRealEstate ? finalPrice : finalPrice === 'Price upon request' ? finalPrice : `${perNightPrice} / Night`,
    images: { hero: getPrimaryImage() },
    general: {
      bedrooms: classification.bedrooms ?? null,
      sleeps: property.guests ?? (classification as any).idealPersons ?? (classification as any).maxPersons ?? null,
      baths: classification.baths ?? null,
      propertySize: indoorArea ? `${indoorArea} sqm` : null,
      landSize: outdoorArea ? `${outdoorArea} sqm` : null,
    },
    accommodations: accommodationItems,
    facilities,
    services: includedServices,
    enjoy,
    includedServices,
    extraServices: (classification as any).extraServices || '',
    servicesFromClassification,
    villaGroups,
    extraInfo: property.extraInfo || undefined,
    staffAndServices: (property as any).staffAndServices || undefined,
  };
}

export function getAllPropertyImages(property: Property): string[] {
  const images = Array.isArray(property.images) ? property.images : [];
  const urls = images
    .map((img: any) => {
      const raw = img?.urlImage || img?.url || '';
      if (!raw) return null;
      return /^https?:\/\//i.test(raw) ? raw : resolveMediaUrl(raw);
    })
    .filter((u): u is string => !!u && u.trim() !== '');
  return urls.length > 0 ? urls : [PLACEHOLDER];
}
