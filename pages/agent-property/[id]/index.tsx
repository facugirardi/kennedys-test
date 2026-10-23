"use client";
import { FormEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  TbBed, TbBath, TbUser, TbPool, TbRuler,
  TbLeaf, TbParkingCircle, TbGrillFork, TbSofa, TbToolsKitchen2, TbFence,
  TbShieldCheck, TbElevator, TbSnowflake, TbSmartHome, TbWifi, TbEye, TbWalk, TbSparkles,
} from 'react-icons/tb';
import { MdHotTub } from 'react-icons/md';
import { Camera, LayoutGrid, ChevronLeft, ChevronRight, Video, FileText, Star, CircleDollarSign, MapPin, Landmark } from 'lucide-react';
import { GoHeart } from "react-icons/go";
import { BsShare } from "react-icons/bs";
import { TiDocumentText } from "react-icons/ti";
import { CiStar } from "react-icons/ci";
import { RiMapPinLine } from "react-icons/ri";
import { formatNightlyPriceLabel, resolveMediaUrl, formatDateRange, fetchProperties, expandAvailabilityRangesToDays, formatCurrency, getPriceFromCurrentDate, getPriceForDateInRanges, getPropertyLocationLabel, heroImageDirectUrl, getPropertyPriceCurrencySymbol, positionStyle, backgroundPositionStyle } from '@/lib/utils';
import { getProperty, getPropertyBySlug } from '@/lib/api/properties';
import { getOfferBackHref } from '@/lib/offerPublicSiteUrl';
import type { Property } from '@/interfaces/property';
import usePropertyStore from '@/store/propertyStore'
import AvailabilityCalendar from '@/components/custom/AvailabilityCalendar'
import ImageGalleryModal from '@/components/custom/ImageGalleryModal'
import ImageGalleryGridModal from '@/components/custom/ImageGalleryGridModal'
import PropertyMapWithSidePanel from '@/components/custom/PropertyMapWithSidePanel'
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { useAuth } from '@/src/contexts/AuthContext'
import { useLoginModal } from '@/src/contexts/LoginContext'
import { PagePdfExportButton } from '@/components/custom/PagePdfExportButton'
import { SeoHead } from '@/components/seo/SeoHead'
import { VillaInquireModal } from '@/components/villa/VillaInquireModal'
import { getPublicSiteOriginFromRequest, SITE_NAME } from '@/lib/seo/config'
import { isAgentPortfolioHost } from '@/lib/agentPortfolioSite'
import { stripHtmlToText, truncateMetaDescription } from '@/lib/seo/text'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { slugifyLocation, itineraryLocationPageKey, ITINERARY_DEFAULT_IMAGES } from '@/lib/itineraryLocations'
import { formatPhotoSectionLabel } from '@/lib/photoSectionLabel'

const PLACEHOLDER_IMAGE_AGENT = '/images/villa-placeholder.png';

const OutdoorSpacesSection = dynamic(
  () => import('@/components/OutdoorSpacesSection').then((m) => m.OutdoorSpacesSection),
  { ssr: false }
);

// Estructura mínima sin datos mock: si no hay datos de API no se muestra nada.
const emptyAgentPropertyStructure = {
  id: '',
  title: '',
  location: '',
  description: '',
  fullDescription: '',
  bedrooms: null as number | null,
  baths: null as number | null,
  guests: null as number | null,
  pools: null as number | null,
  jacuzzis: null as number | null,
  price: '',
  pricePerNight: '',
  aboutDescription: '',
  detailedDescription: null as string | null,
  outdoorTitle: null as string | null,
  outdoorDescription: null as string | null,
  images: {
    hero: PLACEHOLDER_IMAGE_AGENT,
    bedroom: PLACEHOLDER_IMAGE_AGENT,
    kitchen: PLACEHOLDER_IMAGE_AGENT,
    living: PLACEHOLDER_IMAGE_AGENT,
    pool: PLACEHOLDER_IMAGE_AGENT,
    outdoor: PLACEHOLDER_IMAGE_AGENT,
    bath: PLACEHOLDER_IMAGE_AGENT
  },
  /** CSS object-position (+ optional zoom) per gallery slot — non-destructive reframing set in
   * kennedys-loggia's reposition editor. null means "use the image's natural framing". */
  imagePositions: {
    hero: null as string | null,
    bedroom: null as string | null,
    kitchen: null as string | null,
    living: null as string | null,
    pool: null as string | null,
    outdoor: null as string | null,
    bath: null as string | null
  },
  villaDetails: { groundFloor: [] as string[], firstFloor: [] as string[], lowerFloor: [] as string[] },
  pricing: [] as { dates: string; price: string; minStay: string }[],
  availability: [] as { dates: string; price: string; minStay: string }[],
  general: {
    bedrooms: null as number | null,
    sleeps: null as number | null,
    baths: null as number | null,
    propertySize: null as string | null,
    landSize: null as string | null,
    plotSize: null as string | null
  },
  accommodations: [] as string[],
  facilities: [] as string[],
  indoorFacilities: [] as string[],
  outdoorFacilities: [] as string[],
  services: [] as string[],
  enjoy: [] as string[],
  flooring: undefined as string | undefined,
  priceCurrencySymbol: '€ ' as '$ ' | '€ ',
};


const ROMAN_NUMERAL_RE = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

const toTitleCase = (value: string) => {
  if (!value) return '';
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => ROMAN_NUMERAL_RE.test(word) && word.length > 0 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDateInputValue = (date: Date) => date.toISOString().split('T')[0];

const formatCountLabel = (value: number | string | null | undefined, singular: string, plural: string) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return singular;
  }
  return `${numeric} ${numeric === 1 ? singular : plural}`;
};

const PLACEHOLDER_IMAGE = '/images/villa-placeholder.png';

const truncateText = (text: string, maxLength = 220) => {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}…`;
};

const isRealEstateProperty = (property: Property | null | undefined): boolean =>
  Boolean(property) && ((property as any)?.rental === false || (property as any)?.category === 'real-estate');

// agent-property es unbranded: el CMS suele agregar al final del texto una firma de contacto
// de la agencia (ej. "...KENNEDYS GROUP REAL ESTATE, contact phone: ..., email: ..., website: ...").
// Corta el texto apenas empieza esa firma, sin tocar el resto de la descripción.
const stripAgencyContactSignature = (text: string): string => {
  if (!text) return text;
  const markers = [/kennedys\s*group/i, /[📞✉️]/];
  let cutIndex = -1;
  for (const marker of markers) {
    const match = text.match(marker);
    if (match && match.index !== undefined) {
      cutIndex = cutIndex === -1 ? match.index : Math.min(cutIndex, match.index);
    }
  }
  if (cutIndex === -1) return text;
  return text.slice(0, cutIndex).replace(/[\s.,;:|/-]+$/, '').trim();
};

// Convierte texto plano (con saltos de línea \n, típico de campos "textarea" como detiledDescription)
// en HTML con párrafos/<br>. Si el contenido ya trae HTML con bloques, lo deja como está.
const wrapPlainTextDescriptionHtml = (text: string) => {
  const sanitized = sanitizeCmsHtml(text || '');
  if (!/<(p|div|br|ul|ol|h[1-6])\b/i.test(sanitized)) {
    const wrapped = '<p>' + sanitized.replace(/\n/g, '</p><p>') + '</p>';
    return wrapped.replace(/<p>\s*<\/p>/gi, '');
  }
  if (/<br/i.test(sanitized)) {
    const converted = sanitized.replace(/<br\s*\/?>\s*/gi, '</p><p>');
    if (!/<p\b/i.test(sanitized)) {
      const wrapped = '<p>' + converted + '</p>';
      return wrapped.replace(/<p>\s*<\/p>/gi, '');
    }
    return converted.replace(/<p>\s*<\/p>/gi, '');
  }
  return sanitized;
};

const mapPropertyToView = (property: Property, isRealEstateMode = false) => {
  const classification = property.classification ?? {};
  const emptyImages = emptyAgentPropertyStructure.images;
  const amenity = (property as any).amenity ?? {};
  const images = Array.isArray(property.images) ? property.images : [];
  const isRealEstate = isRealEstateMode;
  const priceCurrencySymbol = getPropertyPriceCurrencySymbol(property);

  const getImage = (index: number, fallbackPath: string) =>
    resolveMediaUrl((images[index] as any)?.urlImage || (images[index] as any)?.url || '') || fallbackPath;

  // Get primary image (for hero) - imagen con isPrimary: true, o la primera disponible
  const getPrimaryImage = (fallbackPath: string) => {
    if (!images || images.length === 0) return fallbackPath;

    const primaryImage = images.find((img: any) => {
      const isPrimary = img.isPrimary ?? img.is_primary ?? img.primary;
      return isPrimary === true || isPrimary === 'true' || isPrimary === 1;
    });

    if (primaryImage) {
      const rawUrl = (primaryImage as any)?.urlImage ?? (primaryImage as any)?.url ?? '';
      const url = resolveMediaUrl(rawUrl);
      if (url && url.trim() !== '') return url;
    }

    const firstImageUrl = getImage(0, fallbackPath);
    return (firstImageUrl && firstImageUrl.trim() !== '') ? firstImageUrl : fallbackPath;
  };

  // Get image by section (for highlight cards)
  const getImageBySection = (section: string, fallbackPath: string) => {
    if (!images || images.length === 0) {
      return fallbackPath;
    }
    
    // Buscar imagen que coincida exactamente con la sección
    let image = images.find((img: any) => {
      const imgSection = (img.section || '').toLowerCase().trim();
      const searchSection = section.toLowerCase().trim();
      return imgSection === searchSection;
    });
    
    // Si no se encuentra, intentar con variaciones comunes
    if (!image) {
      const sectionVariations: Record<string, string[]> = {
        'bedroom': ['bedroom', 'bedrooms', 'bed room'],
        'kitchen': ['kitchen', 'kitchens'],
        'pool': ['pool', 'pools', 'swimming pool'],
        'outdoor image': ['outdoor image', 'outdoor', 'outdoor images'],
        'dining room': ['dining room', 'dining', 'diningroom'],
        'bath': ['bath', 'bathroom', 'bathrooms']
      };
      
      const variations = sectionVariations[section.toLowerCase()] || [];
      for (const variation of variations) {
        image = images.find((img: any) => {
          const imgSection = (img.section || '').toLowerCase().trim();
          return imgSection === variation;
        });
        if (image) break;
      }
    }
    
    if (image) {
      const url = resolveMediaUrl((image as any).urlImage || (image as any).url || '');
      if (url) return url;
    }
    
    return fallbackPath;
  };

  // Position counterparts of getImage/getPrimaryImage/getImageBySection above — same lookup,
  // just returning the saved reposition value (or null) instead of the resolved URL.
  const getImagePosition = (index: number): string | null => {
    if (!images || images.length === 0 || index >= images.length) return null;
    return (images[index] as any)?.position ?? null;
  };

  const getPrimaryImagePosition = (): string | null => {
    if (!images || images.length === 0) return null;
    const primaryImage = images.find((img: any) => {
      const isPrimary = img.isPrimary ?? img.is_primary ?? img.primary;
      return isPrimary === true || isPrimary === 'true' || isPrimary === 1;
    });
    if (primaryImage) return (primaryImage as any)?.position ?? null;
    return getImagePosition(0);
  };

  const getImageBySectionPosition = (section: string): string | null => {
    if (!images || images.length === 0) return null;
    let image = images.find((img: any) => {
      const imgSection = (img.section || '').toLowerCase().trim();
      return imgSection === section.toLowerCase().trim();
    });
    if (!image) {
      const sectionVariations: Record<string, string[]> = {
        'bedroom': ['bedroom', 'bedrooms', 'bed room'],
        'kitchen': ['kitchen', 'kitchens'],
        'pool': ['pool', 'pools', 'swimming pool'],
        'outdoor image': ['outdoor image', 'outdoor', 'outdoor images'],
        'dining room': ['dining room', 'dining', 'diningroom'],
        'bath': ['bath', 'bathroom', 'bathrooms']
      };
      const variations = sectionVariations[section.toLowerCase()] || [];
      for (const variation of variations) {
        image = images.find((img: any) => (img.section || '').toLowerCase().trim() === variation);
        if (image) break;
      }
    }
    return image ? ((image as any).position ?? null) : null;
  };

  const availabilityRanges = Array.isArray(property.availabilityRanges) ? property.availabilityRanges : [];

  const priceVisible = (property as any).price_visibility !== false;
  const rawPricing = isRealEstate
    ? [{
        dates: 'Sale price',
        price: formatCurrency((property as any).sale_price, priceCurrencySymbol),
        minStay: 'N/A'
      }]
    : availabilityRanges.length
      ? expandAvailabilityRangesToDays(availabilityRanges, priceCurrencySymbol).map((day) => ({
          dates: day.dateFormatted,
          price: day.price,
          minStay: day.minStay
        }))
      : [];
  const pricing = priceVisible ? rawPricing : rawPricing.map((p: { dates: string; price: string; minStay: string }) => ({ ...p, price: 'Price on request' }));

  const rawAvailability = isRealEstate
    ? []
    : availabilityRanges.length
      ? expandAvailabilityRangesToDays(availabilityRanges, priceCurrencySymbol).map((day) => ({
          dates: day.dateFormatted,
          price: day.price,
          minStay: day.minStay
        }))
      : [];
  const availability = priceVisible ? rawAvailability : rawAvailability.map((a: { dates: string; price: string; minStay: string }) => ({ ...a, price: 'Price on request' }));

  // Mapear desde Property (donde se guardan en el admin)
  // indoorAmenities viene como string separado por comas desde Property
  const indoorAmenities = property.indoorAmenities 
    ? (typeof property.indoorAmenities === 'string' 
        ? property.indoorAmenities.split(',').filter(Boolean).map((s: string) => s.trim())
        : Array.isArray(property.indoorAmenities) ? property.indoorAmenities : [])
    : [];
  
  // outdoorAmenities viene como string separado por comas desde Property
  const outdoorAmenities = property.outdoorAmenities
    ? (typeof property.outdoorAmenities === 'string'
        ? property.outdoorAmenities.split(',').filter(Boolean).map((s: string) => s.trim())
        : Array.isArray(property.outdoorAmenities) ? property.outdoorAmenities : [])
    : [];

  // También verificar Classification por si acaso (para compatibilidad con datos antiguos)
  const indoorFacilities = (classification as any).indoorFacilities 
    ? (Array.isArray((classification as any).indoorFacilities) 
        ? (classification as any).indoorFacilities
        : typeof (classification as any).indoorFacilities === 'string'
          ? (classification as any).indoorFacilities.split(',').filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];
  
  const outdoorFacilities = (classification as any).outdoorFacilities
    ? (Array.isArray((classification as any).outdoorFacilities)
        ? (classification as any).outdoorFacilities
        : typeof (classification as any).outdoorFacilities === 'string'
          ? (classification as any).outdoorFacilities.split(',').filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];

  const customFacilities = (classification as any).customFacilities
    ? (Array.isArray((classification as any).customFacilities)
        ? (classification as any).customFacilities
        : typeof (classification as any).customFacilities === 'string'
          ? (classification as any).customFacilities.split(',').filter(Boolean).map((s: string) => s.trim())
          : [])
    : [];

  // ACCOMMODATIONS: Construir desde los campos numéricos de Classification
  const accommodationItems: string[] = [];
  const masterBedroom = (classification as any).masterBedroom;
  const doubleBedroom = (classification as any).doubleBedroom;
  const twinBedroom = (classification as any).twinBedroom;
  const singleBedroom = (classification as any).singleBedroom;
  const bedroomWithBunkBeds = (classification as any).bedroomWithBunkBeds;
  const guestBedroom = (classification as any).guestBedroom;
  
  if (masterBedroom && masterBedroom > 0) {
    accommodationItems.push(`${masterBedroom}x Master Bedroom${masterBedroom > 1 ? 's' : ''}`);
  }
  if (doubleBedroom && doubleBedroom > 0) {
    accommodationItems.push(`${doubleBedroom}x Double Bedroom${doubleBedroom > 1 ? 's' : ''}`);
  }
  if (twinBedroom && twinBedroom > 0) {
    accommodationItems.push(`${twinBedroom}x Twin Bedroom${twinBedroom > 1 ? 's' : ''}`);
  }
  if (singleBedroom && singleBedroom > 0) {
    accommodationItems.push(`${singleBedroom}x Single Bedroom${singleBedroom > 1 ? 's' : ''}`);
  }
  if (bedroomWithBunkBeds && bedroomWithBunkBeds > 0) {
    accommodationItems.push(`${bedroomWithBunkBeds}x Bedroom${bedroomWithBunkBeds > 1 ? 's' : ''} with bunk beds`);
  }
  if (guestBedroom && guestBedroom > 0) {
    accommodationItems.push(`${guestBedroom}x Guest Bedroom${guestBedroom > 1 ? 's' : ''}`);
  }

  const accommodations = accommodationItems.length > 0
    ? accommodationItems
    : (() => {
        const fallbackBedrooms = Number(classification.bedrooms);
        if (Number.isFinite(fallbackBedrooms) && fallbackBedrooms > 0) {
          return [`${fallbackBedrooms}x Bedroom${fallbackBedrooms > 1 ? 's' : ''}`];
        }
        return [];
      })();
  
  // FACILITIES: indoorAmenities (Luxury) + outdoorAmenities (Outdoor) + customFacilities (Custom Facilities)
  const facilities = [...indoorAmenities, ...outdoorAmenities, ...customFacilities];

  const indoorArea = (classification as any).indoor_area ?? (classification as any).indoorArea;
  const outdoorArea = (classification as any).outdoor_area ?? (classification as any).outdoorArea;

  // Obtener grupos dinámicamente desde theVilla.groups
  const villaGroups = property.description?.theVilla?.groups || [];

  const basePrice = !priceVisible
    ? 'Price upon request'
    : isRealEstate
      ? formatCurrency((property as any).sale_price, priceCurrencySymbol)
      : formatCurrency(property.price_per_night, priceCurrencySymbol);

  const toStringList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value
        .map((v) => (typeof v === 'string' ? v : String(v ?? '')).trim())
        .filter((v) => v.length > 0);
    }
    if (typeof value === 'string') {
      return value
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
    return [];
  };

  const servicesFromClassification = toStringList((classification as any).services);
  const includedServicesFromClassification = toStringList((classification as any).includedServices);

  // ENJOY: Tomar de cada línea del textarea (puede venir separado por comas o newlines)
  const enjoyFromClassification = toStringList((classification as any).enjoy);

  // enjoy: solo usar datos de Classification (donde se guardan en el admin)
  // NO usar fallback de Amenity para evitar mostrar datos antiguos
  const enjoyOptions = enjoyFromClassification.length > 0
    ? enjoyFromClassification
    : ((classification as any).addedValues
        ? String((classification as any).addedValues)
            .split(/[,\n]/)
            .filter(Boolean)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
        : []);

  // Real estate (Loggia Content & Services):
  // - header "About the Property" → Header Description (aboutDescription) — HTML curado (título + precio + specs)
  // - LOCATION "About the Property" → Detailed Description (shortDescription desde el swap del 2026-08-07;
  //   antes era detiledDescription, que quedó sin uso en Loggia y solo se lee acá como fallback legacy)
  // Rentals: header sigue usando longDescription (Header Description, editable en Loggia).
  const baseDescription = isRealEstate
    ? stripAgencyContactSignature(
        property.description?.aboutDescription ||
        property.description?.detiledDescription ||
        ''
      )
    : (property.description?.longDescription ||
       property.summary ||
       property.description?.shortDescription ||
       property.description?.caption ||
       '');

  // Sin fallbacks de texto: si no hay datos de API no se muestra nada
  // Para real estate no truncar — el HTML se recorta visualmente con line-clamp en el render
  const heroDescription = baseDescription;

  return {
    ...emptyAgentPropertyStructure,
    id: property.id,
    title: isRealEstate
      ? (property.title || property.alternativeTitle || '')
      : ((property as any).agentFriendlyName || property.title || property.alternativeTitle || ''),
    location: getPropertyLocationLabel(property),
    description: heroDescription || '',
    fullDescription: baseDescription || '',
    bedrooms: classification.bedrooms ?? null,
    baths: classification.baths ?? null,
    guests: property.guests ?? classification.idealPersons ?? classification.maxPersons ?? null,
    pools: (() => {
      if (!Array.isArray(classification.pools)) return null;
      const poolItems = classification.pools.filter((p: { type?: string }) => {
        const t = String(p?.type ?? '').trim().toLowerCase();
        // Compat: si type viene vacío, asumir "pool" como hace el código anterior.
        if (!t) return true;
        return t === 'pool' || t === 'swimming pool';
      });
      if (poolItems.length === 0) return null;
      return poolItems.reduce((sum: number, p: { cant?: number }) => sum + (Number(p?.cant) ?? 0), 0);
    })(),
    jacuzzis: (() => {
      if (!Array.isArray(classification.pools)) return null;
      const jacuzziItems = classification.pools.filter((p: { type?: string }) => (p?.type || '').toLowerCase() === 'jacuzzi');
      if (jacuzziItems.length === 0) return null;
      return jacuzziItems.reduce((sum: number, p: { cant?: number }) => sum + (Number(p?.cant) ?? 0), 0);
    })(),
    price: basePrice || '',
    priceCurrencySymbol,
    pricePerNight: isRealEstate
      ? (basePrice || '')
      : basePrice === 'Price upon request'
        ? basePrice
        : basePrice ? `${basePrice} / Night` : '',
    aboutDescription: isRealEstate
      ? (property.description?.aboutDescription || property.description?.detiledDescription || '')
      : (property.description?.aboutDescription || property.description?.shortDescription || property.description?.longDescription || ''),
    detailedDescription: isRealEstate
      ? (property.description?.shortDescription ||
         property.description?.detiledDescription ||
         property.description?.longDescription ||
         null)
      : (property.description?.detiledDescription || property.description?.longDescription || null),
    images: {
      hero: getPrimaryImage(emptyImages.hero),
      bedroom: getImageBySection('Bedroom', getImage(1, emptyImages.bedroom)),
      kitchen: getImageBySection('Kitchen', getImage(2, emptyImages.kitchen)),
      living: getImage(3, emptyImages.living),
      pool: getImageBySection('Pool', getImage(4, emptyImages.pool)),
      outdoor: getImageBySection('Outdoor Image', getImage(5, emptyImages.outdoor)),
      bath: getImageBySection('Bath', getImageBySection('Dining Room', getImage(3, emptyImages.living)))
    },
    imagePositions: {
      hero: getPrimaryImagePosition(),
      bedroom: getImageBySectionPosition('Bedroom') ?? getImagePosition(1),
      kitchen: getImageBySectionPosition('Kitchen') ?? getImagePosition(2),
      living: getImagePosition(3),
      pool: getImageBySectionPosition('Pool') ?? getImagePosition(4),
      outdoor: getImageBySectionPosition('Outdoor Image') ?? getImagePosition(5),
      bath: getImageBySectionPosition('Bath') ?? getImageBySectionPosition('Dining Room') ?? getImagePosition(3)
    },
    outdoorTitle: property.description?.outdoorTitle ?? null,
    outdoorDescription: property.description?.outdoorDescription ?? null,
    outdoorImage: property.description?.outdoorImage || null,
    pricing,
    availability,
    type: (classification as any).type || (classification as any).objectType || property.type || undefined,
    condition: (classification as any).condition || property.propertyStatus || undefined,
    general: {
      bedrooms: classification.bedrooms ?? null,
      sleeps: property.guests ?? classification.idealPersons ?? classification.maxPersons ?? null,
      baths: classification.baths ?? null,
      propertySize: indoorArea ? `${indoorArea} sqm` : null,
      landSize: outdoorArea ? `${outdoorArea} sqm` : null,
      plotSize: (classification as any).plotArea != null && (classification as any).plotArea !== '' ? `${(classification as any).plotArea} sqm` : null
    },
    accommodations: accommodations,
    facilities: facilities,
    indoorFacilities: indoorFacilities,
    outdoorFacilities: outdoorFacilities,
    // Services: solo usar campos de services/includedServices de classification.
    services: Array.from(
      new Set([
        ...includedServicesFromClassification,
        ...servicesFromClassification,
      ])
    ),
    enjoy: enjoyOptions,
    // Campos movidos desde Details tab
    includedServices: includedServicesFromClassification,
    extraServices: (classification as any).extraServices || '',
    addedValues: (classification as any).addedValues || '',
    plotArea: (classification as any).plotArea || undefined,
    // Grupos dinámicos de The Villa
    villaGroups: villaGroups,
    // Need to Know
    extraInfo: property.extraInfo || undefined,
    // Staff and Services
    staffAndServices: (property as any).staffAndServices || undefined,
    // Campos adicionales de Rental
    locationFeatures: property.locationFeatures ? property.locationFeatures.split(',').filter(Boolean).map((s: string) => s.trim()) : [],
    propertyStatus: property.propertyStatus ? property.propertyStatus.split(',').filter(Boolean).map((s: string) => s.trim()) : [],
    servicesFromClassification: Array.isArray((classification as any).services) 
      ? (classification as any).services 
      : typeof (classification as any).services === 'string' 
        ? (classification as any).services.split(',').filter(Boolean).map((s: string) => s.trim())
        : [],
    outdoorShower: (classification as any).outdoorShower || undefined,
    stars: property.stars || undefined,
    propertyType: property.type || undefined,
    // Campos adicionales de Description
    ourNote: property.description?.ourNote || undefined,
    accomodationDetails: property.description?.accomodationDetails || undefined,
    view: property.view ? property.view.split(',').filter(Boolean).map((s: string) => s.trim()) : [],
    flooring: (classification as any).flooring || undefined,
    constructionYear: (() => {
      const raw =
        (classification as any).contructionYear ??
        (classification as any).constructionYear ??
        (property as any).construction_year;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    })(),
    luxuryFacilities: Array.from(
      new Set(
        [...indoorAmenities, ...indoorFacilities]
          .map((s) => String(s).trim())
          .filter(Boolean)
      )
    ),
    outdoorFeatures: (() => {
      const merged = [...outdoorAmenities, ...outdoorFacilities]
        .map((s) => String(s).trim())
        .filter(Boolean);
      if (
        (classification as any).outdoorShower &&
        !merged.some((s) => s.toLowerCase() === 'outdoor shower')
      ) {
        merged.push('Outdoor Shower');
      }
      return Array.from(new Set(merged));
    })(),
  };
};

type AgentPropertyPageProps = {
  initialProperty?: Property | null;
  siteOrigin?: string;
  requestedIdentifier?: string;
  initialSeoMeta?: {
    title: string;
    description: string;
    imageUrl?: string | null;
  };
};

export default function AgentPropertyPage({
  initialProperty = null,
  siteOrigin = "",
  requestedIdentifier = "",
  initialSeoMeta,
}: AgentPropertyPageProps) {
  const router = useRouter();
  const offerBackHref = getOfferBackHref(router.query, { agentFriendly: true });
  const [villaData, setVillaData] = useState(() =>
    initialProperty ? mapPropertyToView(initialProperty as Property, isRealEstateProperty(initialProperty)) : emptyAgentPropertyStructure
  );
  const [propertyData, setPropertyData] = useState<Property | null>(initialProperty);
  const [itineraryImages, setItineraryImages] = useState<string[]>(ITINERARY_DEFAULT_IMAGES);
  // Misma region que usa el filtro "Location" de la lista de villas en Loggia.
  const itineraryLocationName = (propertyData as any)?.region || villaData?.location || 'Your Destination';
  const itineraryLocationSlug = useMemo(
    () => slugifyLocation((propertyData as any)?.region),
    [propertyData]
  );

  useEffect(() => {
    if (!propertyData?.personalizedItinerariesEnabled || !itineraryLocationSlug) return;
    let cancelled = false;
    (async () => {
      const slots: Array<1 | 2 | 3> = [1, 2, 3];
      const results = await Promise.all(
        slots.map((slot) => fetchPageByKeyServer(itineraryLocationPageKey(itineraryLocationSlug, slot)))
      );
      if (cancelled) return;
      setItineraryImages((prev) =>
        prev.map((current, index) => {
          const page = results[index];
          const customUrl = page?.heroBannerPath ? resolveMediaUrl(page.heroBannerPath) : null;
          return customUrl || current;
        })
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [propertyData?.personalizedItinerariesEnabled, itineraryLocationSlug]);
  const [isLoading, setIsLoading] = useState(!initialProperty);
  const [error, setError] = useState<string | null>(null);
  const [sectionTab, setSectionTab] = useState('Complimentary services');
  const [isInDetailExpanded, setIsInDetailExpanded] = useState(false);
  const [isReDescExpanded, setIsReDescExpanded] = useState(false);
  const shouldShowReDescToggle = useMemo(() => {
    const full = (villaData as any).fullDescription || villaData.description || '';
    const plain = stripHtmlToText(full).replace(/\s+/g, ' ').trim();
    return plain.length > 400;
  }, [(villaData as any).fullDescription, villaData.description]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [expandedColumns, setExpandedColumns] = useState<Set<number>>(new Set());
  const isRealEstate = isRealEstateProperty(propertyData);
  const [icalendarURL, setIcalendarURL] = useState<string | null>(initialProperty?.icalendarURL ?? null);
  const [availabilityRanges, setAvailabilityRanges] = useState<any[]>(() => {
    if (!initialProperty) return [];
    const ranges = (initialProperty as Property).availabilityRanges;
    return (Array.isArray(ranges) ? ranges : []) as any[];
  });
  const buildInitialImagePairs = () => {
    if (!initialProperty || !Array.isArray(initialProperty.images)) return [];
    return initialProperty.images
      .map((img: any) => {
        const url = resolveMediaUrl(img?.urlImage || img?.url || '');
        if (!url || url === '') return null;
        return { url, position: img?.position ?? null };
      })
      .filter((pair: { url: string; position: string | null } | null): pair is { url: string; position: string | null } => pair !== null);
  };
  const [allPropertyImages, setAllPropertyImages] = useState<string[]>(() => {
    const pairs = buildInitialImagePairs();
    if (pairs.length > 0) return pairs.map((p) => p.url);
    const transformed = mapPropertyToView(initialProperty as Property, isRealEstateProperty(initialProperty));
    return [transformed.images.hero];
  });
  const [allPropertyImagePositions, setAllPropertyImagePositions] = useState<(string | null)[]>(() => {
    const pairs = buildInitialImagePairs();
    return pairs.length > 0 ? pairs.map((p) => p.position) : [null];
  });
  const [allPropertyImagesWithSection, setAllPropertyImagesWithSection] = useState<Array<{ url: string; section: string; order?: number; isPrimary?: boolean; position?: string | null }>>(() => {
    if (!initialProperty || !Array.isArray(initialProperty.images)) return [];
    const images = initialProperty.images
      .filter((img: any) => {
        const section = (img?.section || '').toLowerCase().trim();
        const excluded = ['gallery', 'general', 'property_gallery', ''];
        return img?.section && typeof img.section === 'string' && img.section.trim() !== '' && !excluded.includes(section);
      })
      .map((img: any) => ({
        url: resolveMediaUrl(img?.urlImage || img?.url || ''),
        section: img.section,
        order: img.order ?? 0,
        isPrimary: img.isPrimary ?? false,
        position: img.position ?? null
      }))
      .filter((img: any) => img.url && img.url !== '')
      .sort((a: any, b: any) => (a.isPrimary && !b.isPrimary ? -1 : !a.isPrimary && b.isPrimary ? 1 : (a.order ?? 0) - (b.order ?? 0)))
      .slice(0, 4);
    return images;
  });
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isGalleryGridModalOpen, setIsGalleryGridModalOpen] = useState(false);
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);
  const setSelectedProperty = usePropertyStore((state: any) => state.setSelectedProperty);
  const [checkIn, setCheckIn] = useState(() => formatDateInputValue(new Date()));
  const [checkOut, setCheckOut] = useState(() => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return formatDateInputValue(nextWeek);
  });
  const [offerNightlyPrice, setOfferNightlyPrice] = useState<number | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [villaInquireOpen, setVillaInquireOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useLoginModal();
  const {
    isLiked,
    toggleFavorite,
    pendingIds,
    error: likesError,
    clearError: clearLikesError,
  } = usePropertyLikes();
  const handleToggleFavorite = (id: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    void toggleFavorite(id);
  };
  const currentPropertyId = villaData?.id ? String(villaData.id) : '';
  const isCurrentPropertyLiked = currentPropertyId ? isLiked(currentPropertyId) : false;
  const isCurrentFavoritePending = currentPropertyId ? pendingIds.has(currentPropertyId) : false;
  const galleryVideoUrls = useMemo(() => {
    const rawVideoCandidates = [
      ...(Array.isArray((propertyData as any)?.videoUrls) ? (propertyData as any).videoUrls : []),
      ...(Array.isArray((villaData as any)?.videoUrls) ? (villaData as any).videoUrls : []),
      ...(Array.isArray((propertyData as any)?.videos) ? (propertyData as any).videos : []),
      ...(Array.isArray((villaData as any)?.videos) ? (villaData as any).videos : []),
    ];

    const normalized = rawVideoCandidates
      .map((item: any) => {
        if (!item) return "";
        if (typeof item === "string") return item.trim();
        return (
          item.youtubeUrl ||
          item.youtubeURL ||
          item.videoUrl ||
          item.videoURL ||
          item.url ||
          item.src ||
          ""
        )
          .toString()
          .trim();
      })
      .filter((url: string) => /youtu\.be|youtube\.com/i.test(url));

    return Array.from(new Set(normalized));
  }, [propertyData, villaData]);

  const photosSectionRef = useRef<HTMLDivElement | null>(null);
  const detailsSectionRef = useRef<HTMLDivElement | null>(null);
  const featuresSectionRef = useRef<HTMLElement | null>(null);
  const pricesSectionRef = useRef<HTMLDivElement | null>(null);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const pdfExportRootRef = useRef<HTMLElement | null>(null);

  const aboutLocationHtml = useMemo(() => (
    wrapPlainTextDescriptionHtml(villaData.detailedDescription || '')
  ), [villaData.detailedDescription]);

  const aboutLocationLength = useMemo(() => (
    aboutLocationHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length
  ), [aboutLocationHtml]);

  const headerDescriptionHtml = useMemo(() => (
    wrapPlainTextDescriptionHtml(isReDescExpanded ? ((villaData as any).fullDescription || villaData.description) : villaData.description)
  ), [isReDescExpanded, villaData.description, (villaData as any).fullDescription]);

  const shouldShowAboutViewMore = aboutLocationLength > 550;

  const scrollToDetailSection = (ref: RefObject<HTMLElement | null>) => {
    if (typeof window === 'undefined') return;
    const element = ref.current;
    if (!element) return;
    const offset = 100;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleContactClick = () => {
    if (!villaData?.id) return;
    setVillaInquireOpen(true);
  };

  const detailNavItems = [
    {
      key: 'photos',
      label: 'Photos',
      icon: <Camera className="w-6 h-6 text-[#D99330]" strokeWidth={1.5} />,
      ref: photosSectionRef,
    },
    {
      key: 'details',
      label: 'Details',
      icon: <FileText className="w-6 h-6 text-[#D99330]" strokeWidth={1.5} />,
      ref: detailsSectionRef,
    },
    {
      key: 'features',
      label: 'Features',
      icon: <Star className="w-6 h-6 text-[#D99330]" strokeWidth={1.5} />,
      ref: featuresSectionRef,
    },
    {
      key: 'prices',
      label: 'Prices',
      icon: <CircleDollarSign className="w-6 h-6 text-[#D99330]" strokeWidth={1.5} />,
      ref: pricesSectionRef,
    },
    ...(isRealEstate
      ? []
      : [
          {
            key: 'map',
            label: 'Map',
            icon: <MapPin className="w-6 h-6 text-[#D99330]" strokeWidth={1.5} />,
            ref: mapSectionRef,
          },
        ]),
  ];

  const tabs = ['Complimentary services', 'Policies'];

  useEffect(() => {
    if (!router.isReady) return;
    const identifier = router.query.id;

    if (!identifier || typeof identifier !== 'string') {
      setError('Property not found.');
      setIsLoading(false);
      return;
    }

    // requestedIdentifier: el segmento de ruta con el que el servidor resolvió initialProperty
    // (puede ser el slug del título, que no es ni el id ni el agentFriendlySlug).
    if (initialProperty && (initialProperty.id === identifier || (initialProperty as any).agentFriendlySlug === identifier || requestedIdentifier === identifier)) {
      setSelectedProperty(initialProperty);
      return;
    }

    let isMounted = true;

    const loadProperty = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Intentar buscar por slug primero, luego por ID
        // getProperty puede buscar por slug o ID dependiendo de la implementación del backend
        // Backend devuelve { success: true, message: 'property found', data: property }
        // Usar res.data || res por si la respuesta viene con la propiedad en el primer nivel
        const res = await getProperty(identifier);
        const data = res?.data ?? res;

        if (!isMounted) {
          return;
        }

        if (!data || res?.success === false) {
          setError('Property not found.');
          setIsLoading(false);
          return;
        }

        const propertyData = data as Property;
        const transformed = mapPropertyToView(propertyData, isRealEstateProperty(propertyData));
        setVillaData(transformed as any);
        setPropertyData(propertyData);
        
        // Save icalendarURL and availabilityRanges for calendar component
        setIcalendarURL(propertyData?.icalendarURL || null);
        setAvailabilityRanges(Array.isArray(propertyData.availabilityRanges) ? propertyData.availabilityRanges : []);
        
        // Get ALL images from the property
        const images = Array.isArray(propertyData.images) ? propertyData.images : [];
        const allImagePairs = images
          .map((img: any) => {
            const url = resolveMediaUrl(img?.urlImage || img?.url || '');
            if (!url || url === '') return null;
            return { url, position: img?.position ?? null };
          })
          .filter((pair: { url: string; position: string | null } | null): pair is { url: string; position: string | null } => pair !== null);
        setAllPropertyImages(allImagePairs.length > 0 ? allImagePairs.map((p) => p.url) : [transformed.images.hero]);
        setAllPropertyImagePositions(allImagePairs.length > 0 ? allImagePairs.map((p) => p.position) : [null]);

        // Get images with section for highlight cards
        const imagesWithSection = images
          .filter((img: any) => {
            const section = img?.section;
            const sectionLower = (section || '').toLowerCase().trim();
            // Excluir secciones genéricas o vacías
            const excludedSections = ['gallery', 'general', 'property_gallery', ''];
            const hasValidSection = section && typeof section === 'string' && section.trim() !== '' && !excludedSections.includes(sectionLower);
            return hasValidSection;
          })
          .map((img: any) => {
            const url = resolveMediaUrl(img?.urlImage || img?.url || '');
            return {
              url,
              section: img.section,
              order: img.order ?? 0,
              isPrimary: img.isPrimary ?? false,
              position: img.position ?? null
            };
          })
          .filter((img: any) => {
            const isValid = img.url && img.url !== '';
            return isValid;
          })
          .sort((a, b) => {
            // Primero por isPrimary, luego por order
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return (a.order ?? 0) - (b.order ?? 0);
          })
          .slice(0, 4); // Tomar solo las primeras 4

        setAllPropertyImagesWithSection(imagesWithSection);
        setSelectedProperty(propertyData);
      } catch (err) {
        console.error('❌ AgentPropertyPage - Error al cargar propiedad:', err);
        console.error('❌ AgentPropertyPage - Error completo:', JSON.stringify(err, null, 2));
        if (isMounted) {
          setError('We could not load this property. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [router.isReady, router.query.id, initialProperty, requestedIdentifier, setSelectedProperty]);

  useEffect(() => {
    if (!router.isReady) return;
    const {
      checkIn: checkInParam,
      checkOut: checkOutParam,
      startDate: startDateParam,
      endDate: endDateParam,
      offerPrice: offerPriceParam,
    } = router.query;

    const effectiveCheckIn =
      typeof checkInParam === "string" && checkInParam.trim() !== ""
        ? checkInParam
        : typeof startDateParam === "string" && startDateParam.trim() !== ""
          ? startDateParam
          : null;
    const effectiveCheckOut =
      typeof checkOutParam === "string" && checkOutParam.trim() !== ""
        ? checkOutParam
        : typeof endDateParam === "string" && endDateParam.trim() !== ""
          ? endDateParam
          : null;

    if (effectiveCheckIn) setCheckIn(effectiveCheckIn);
    if (effectiveCheckOut) setCheckOut(effectiveCheckOut);

    const rawOfferPrice =
      typeof offerPriceParam === "string" && offerPriceParam.trim() !== ""
        ? Number(offerPriceParam)
        : null;
    setOfferNightlyPrice(Number.isFinite(rawOfferPrice) && (rawOfferPrice as number) > 0 ? rawOfferPrice : null);
  }, [
    router.isReady,
    router.query.checkIn,
    router.query.checkOut,
    router.query.startDate,
    router.query.endDate,
    router.query.offerPrice,
  ]);

  const getDatePrice = useMemo(() => {
    return (dateStr: string): number | null => {
      const p = propertyData as any;
      if (!p) return null;
      const pr = p.priceRanges;
      const ar = p.availabilityRanges;
      const ranges =
        Array.isArray(pr) && pr.length > 0
          ? pr
          : Array.isArray(ar) && ar.length > 0
            ? ar
            : Array.isArray(pr)
              ? pr
              : Array.isArray(ar)
                ? ar
                : [];
      const info = getPriceForDateInRanges(ranges, dateStr);
      return info?.price ?? null;
    };
  }, [propertyData]);

  const getNightlyPrice = useCallback(
    (checkInStr: string | null | undefined): number | null => {
      if (!checkInStr) return null;
      if ((propertyData as any)?.price_visibility === false) return null;
      if (offerNightlyPrice != null && offerNightlyPrice > 0) return offerNightlyPrice;
      const fromDate = getDatePrice(checkInStr);
      if (fromDate != null && fromDate > 0) return fromDate;
      const ppn = Number((propertyData as any)?.price_per_night);
      if (Number.isFinite(ppn) && ppn > 0) return ppn;
      const fromCurrent = getPriceFromCurrentDate(propertyData);
      if (fromCurrent != null && fromCurrent > 0) return fromCurrent;
      return null;
    },
    [getDatePrice, offerNightlyPrice, propertyData]
  );

  const selectedPrice = useMemo(() => getNightlyPrice(checkIn), [checkIn, getNightlyPrice]);

  const selectedNights = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const start = new Date(`${checkIn}T12:00:00`);
    const end = new Date(`${checkOut}T12:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : null;
  }, [checkIn, checkOut]);

  const selectedTotalPrice = useMemo(() => {
    if (selectedPrice == null || selectedPrice <= 0) return null;
    if (selectedNights == null || selectedNights <= 0) return null;
    return selectedPrice * selectedNights;
  }, [selectedNights, selectedPrice]);
  // Agent-friendly detail: hide pricing blocks in the UI.
  const showDetailPrices = false;

  useEffect(() => {
    setIsInDetailExpanded(false);
  }, [villaData?.id]);

  useEffect(() => {
    if (!router.isReady) return
    const flag = router.query.villaInquire
    if (flag !== "1" && flag !== "true") return
    if (!propertyData?.id) return
    setVillaInquireOpen(true)
    const nextQuery = { ...router.query }
    delete nextQuery.villaInquire
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
  }, [router.isReady, router.query, propertyData?.id, router])

  const handlePlanSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!villaData?.id) {
      setPlanError('Select a property to continue.');
      return;
    }

    if (!checkIn || !checkOut) {
      setPlanError('Select both check-in and check-out dates.');
      return;
    }

    setPlanError(null);

    setVillaInquireOpen(true);
  };

  const aboutTitle = useMemo(() => toTitleCase(villaData.title), [villaData.title]);

  type GalleryKey = 'hero' | 'bedroom' | 'kitchen' | 'living' | 'outdoor' | 'pool';
  const galleryOrder: GalleryKey[] = ['hero', 'bedroom', 'kitchen', 'living', 'outdoor', 'pool'];

  const galleryLabels: Record<GalleryKey, string> = {
    hero: 'Highlight',
    bedroom: 'Bedroom',
    kitchen: 'Kitchen',
    living: 'Living room',
    outdoor: 'Outdoor',
    pool: 'Pool',
  };

  const DEFAULT_HERO_IMAGE = '/images/villa-detail@2x.png';
  const galleryImages = useMemo(() => {
    const heroImage = villaData.images?.hero;
    return {
      hero: (heroImage && String(heroImage).trim() !== '') ? heroImage : DEFAULT_HERO_IMAGE,
      bedroom: villaData.images?.bedroom,
      kitchen: villaData.images?.kitchen,
      living: villaData.images?.living,
      pool: villaData.images?.pool,
      outdoor: villaData.images?.outdoor
    } as Record<GalleryKey, string>;
  }, [villaData.images]);

  const galleryPositions = useMemo(() => {
    const positions = (villaData as any).imagePositions || {};
    return {
      hero: positions.hero ?? null,
      bedroom: positions.bedroom ?? null,
      kitchen: positions.kitchen ?? null,
      living: positions.living ?? null,
      pool: positions.pool ?? null,
      outdoor: positions.outdoor ?? null
    } as Record<GalleryKey, string | null>;
  }, [villaData]);

  const [activeGalleryImage, setActiveGalleryImage] = useState<GalleryKey>('hero');

  useEffect(() => {
    const firstAvailable = galleryOrder.find((key) => Boolean(galleryImages[key])) || 'hero';
    setActiveGalleryImage((prev) => (galleryImages[prev] ? prev : firstAvailable));
  }, [galleryImages]);

  const galleryThumbnails = useMemo(() => {
    return galleryOrder
      .map((key) => ({ key, src: galleryImages[key] }))
      .filter((item): item is { key: GalleryKey; src: string } => Boolean(item.src));
  }, [galleryImages]);

  const activeImageSrc = galleryImages[activeGalleryImage] || galleryThumbnails[0]?.src || PLACEHOLDER_IMAGE;
  const activeImagePosition = galleryPositions[activeGalleryImage] ?? null;

  // Real estate hero: big photo + up to 4 side photos (desktop). Needs at least 2 photos; mobile keeps the single hero.
  const heroMosaicSideIndexes = allPropertyImages.slice(1, 5).map((_, i) => i + 1);
  const heroMosaicSideCount = heroMosaicSideIndexes.length;
  const useHeroMosaic = isRealEstate && heroMosaicSideCount > 0;
  const openHeroPhoto = (index: number) => {
    setGalleryModalIndex(index);
    setIsGalleryModalOpen(true);
  };

  // Highlight cards from images with section assigned
  const highlightCards = useMemo(() => {
    if (allPropertyImagesWithSection.length > 0) {
      return allPropertyImagesWithSection.map((img, index) => {
        // Acepta el formato viejo ("3 BEDROOMS", "ADDED FACILITIES: GYM") y el nuevo ("Bedroom", "Added Facilities: Gym")
        const displayLabel = formatPhotoSectionLabel(img.section);
        
        return {
          key: `highlight-${index}`,
          label: displayLabel,
          image: img.url,
          imagePosition: img.position ?? null,
        };
      });
    }

    // Fallback si no hay imágenes con sección
    const withFallback = (...sources: (string | undefined)[]) => {
      return sources.find((src) => typeof src === 'string' && src.length > 0) || PLACEHOLDER_IMAGE;
    };
    // Position that goes with whichever fallback source withFallback actually picked.
    const withFallbackPosition = (...pairs: [string | undefined, string | null][]) => {
      const picked = pairs.find(([src]) => typeof src === 'string' && src.length > 0);
      return picked ? picked[1] : null;
    };

    const swimmingLabel = Number(villaData.pools) > 0
      ? formatCountLabel(villaData.pools, 'Swimming pool', 'Swimming pools')
      : 'Outdoor lounge';

    return [
      {
        key: 'bedrooms',
        label: formatCountLabel(villaData.bedrooms, 'Bedroom', 'Bedrooms'),
        image: withFallback(galleryImages.bedroom, galleryImages.hero),
        imagePosition: withFallbackPosition([galleryImages.bedroom, galleryPositions.bedroom], [galleryImages.hero, galleryPositions.hero]),
      },
      {
        key: 'baths',
        label: formatCountLabel(villaData.baths, 'Bath', 'Baths'),
        image: withFallback((villaData.images as any).bath, galleryImages.living, galleryImages.outdoor, galleryImages.hero),
        imagePosition: withFallbackPosition(
          [(villaData.images as any).bath, (villaData as any).imagePositions?.bath ?? null],
          [galleryImages.living, galleryPositions.living],
          [galleryImages.outdoor, galleryPositions.outdoor],
          [galleryImages.hero, galleryPositions.hero]
        ),
      },
      {
        key: 'kitchen',
        label: 'Fully equipped kitchen',
        image: withFallback(galleryImages.kitchen, galleryImages.hero),
        imagePosition: withFallbackPosition([galleryImages.kitchen, galleryPositions.kitchen], [galleryImages.hero, galleryPositions.hero]),
      },
      {
        key: 'pool',
        label: swimmingLabel,
        image: withFallback(galleryImages.pool, galleryImages.outdoor, galleryImages.hero),
        imagePosition: withFallbackPosition([galleryImages.pool, galleryPositions.pool], [galleryImages.outdoor, galleryPositions.outdoor], [galleryImages.hero, galleryPositions.hero]),
      },
    ];
  }, [allPropertyImagesWithSection, galleryImages, galleryPositions, villaData.bedrooms, villaData.baths, villaData.pools, villaData.images]);

  const pdfExportGalleryImages = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const src of allPropertyImages) {
      if (!src || typeof src !== 'string' || src.trim() === '') continue;
      const u = heroImageDirectUrl(src);
      if (seen.has(u)) continue;
      seen.add(u);
      out.push(u);
      if (out.length >= 36) break;
    }
    return out;
  }, [allPropertyImages]);

  const locationLines = useMemo(() => {
    if (!villaData.location) return [] as string[];
    return villaData.location.split(',').map((segment) => segment.trim()).filter(Boolean);
  }, [villaData.location]);

  const rawInDetailDescriptionHtml = useMemo(() => {
    const detailed =
      typeof villaData.detailedDescription === 'string' ? villaData.detailedDescription.trim() : '';
    const about = (villaData.aboutDescription || '').trim();
    return detailed || about;
  }, [villaData.detailedDescription, villaData.aboutDescription]);

  const sanitizedInDetailDescriptionHtml = useMemo(() => {
    const html = rawInDetailDescriptionHtml;
    return html
      .replace(/<a\b[^>]*>[\s\S]*?view\s*more[\s\S]*?<\/a>/gi, '')
      .replace(/<button\b[^>]*>[\s\S]*?view\s*more[\s\S]*?<\/button>/gi, '')
      .replace(/\bview\s*more\b/gi, '');
  }, [rawInDetailDescriptionHtml]);

  const inDetailDescriptionPlainTextLength = useMemo(() => {
    const html = sanitizedInDetailDescriptionHtml || '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim().length;
  }, [sanitizedInDetailDescriptionHtml]);

  const shouldShowInDetailViewMore = inDetailDescriptionPlainTextLength > 550;

  const seoProperty = propertyData || initialProperty || null;
  const normalizeSegment = (value: unknown) =>
    String(value ?? "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  const routeIdentifier =
    (typeof router.query.id === "string" && router.query.id.trim()) ||
    requestedIdentifier ||
    "";
  const propertyId = String((seoProperty as any)?.id ?? "");
  const propertyTitle = String((seoProperty as any)?.title ?? "").trim();
  const propertyAgentFriendlyName = String((seoProperty as any)?.agentFriendlyName ?? "").trim();
  const propertyAgentFriendlySlug = String((seoProperty as any)?.agentFriendlySlug ?? "").trim();
  const routeSeg = normalizeSegment(routeIdentifier);
  const idSeg = normalizeSegment(propertyId);
  const agentNameSeg = normalizeSegment(propertyAgentFriendlyName);
  const agentSlugSeg = normalizeSegment(propertyAgentFriendlySlug);
  const enteredAsAgentFriendly =
    Boolean(routeSeg) &&
    (routeSeg === agentNameSeg || routeSeg === agentSlugSeg || (routeSeg !== idSeg && !/^[0-9a-f-]{24,}$/i.test(routeSeg)));
  // Real estate siempre muestra el nombre real (nunca el private name de agent-friendly),
  // vacational rentals sigue priorizando el agentFriendlyName cuando se entró por ese link.
  const seoTitleBase = isRealEstate
    ? propertyTitle || villaData.title || propertyAgentFriendlyName || "Property"
    : enteredAsAgentFriendly && propertyAgentFriendlyName
      ? propertyAgentFriendlyName
      : propertyTitle || propertyAgentFriendlyName || villaData.title || "Property";
  const seoTitle = initialSeoMeta?.title || seoTitleBase || SITE_NAME;
  const seoDescription = initialSeoMeta?.description || (() => {
    const fromAbout = stripHtmlToText((seoProperty as any)?.description?.aboutDescription || "");
    if (fromAbout) return truncateMetaDescription(fromAbout, 160);
    const fromLong = stripHtmlToText((seoProperty as any)?.description?.longDescription || "");
    if (fromLong) return truncateMetaDescription(fromLong, 160);
    const fromShort = stripHtmlToText((seoProperty as any)?.description?.shortDescription || "");
    if (fromShort) return truncateMetaDescription(fromShort, 160);
    const fromSummary = stripHtmlToText(String((seoProperty as any)?.summary || ""));
    if (fromSummary) return truncateMetaDescription(fromSummary, 160);
    return "";
  })();
  const seoMainImage = (() => {
    if (initialSeoMeta?.imageUrl) return initialSeoMeta.imageUrl;
    const heroImage = resolveMediaUrl(String(villaData?.images?.hero || ""));
    if (heroImage) return heroImage;
    const images = Array.isArray((seoProperty as any)?.images) ? (seoProperty as any).images : [];
    const primary = images.find((img: any) => {
      const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary;
      return isPrimary === true || isPrimary === "true" || isPrimary === 1;
    });
    const raw =
      primary?.urlImage ||
      primary?.url ||
      images?.[0]?.urlImage ||
      images?.[0]?.url ||
      (seoProperty as any)?.mainImage ||
      "";
    return resolveMediaUrl(String(raw || ""));
  })();
  const canonicalPath = routeIdentifier ? `/agent-property/${encodeURIComponent(routeIdentifier)}` : undefined;
  const suppressSiteBranding = Boolean(siteOrigin && isAgentPortfolioHost(siteOrigin));

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SeoHead
          title={seoTitle}
          description={seoDescription || seoTitle}
          siteOrigin={siteOrigin || undefined}
          canonicalPath={canonicalPath}
          imageUrl={seoMainImage || undefined}
          noindex
          suppressSiteBranding={suppressSiteBranding}
        />
        <main className="flex flex-1 items-center justify-center bg-white">
          <p className="font-haas text-[#506A70]">Loading property details...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SeoHead
          title={seoTitle || (suppressSiteBranding ? "Property" : `${SITE_NAME} — property`)}
          description={seoDescription || seoTitle || ""}
          siteOrigin={siteOrigin || undefined}
          canonicalPath={canonicalPath}
          imageUrl={seoMainImage || undefined}
          noindex
          suppressSiteBranding={suppressSiteBranding}
        />
        <main className="flex flex-1 items-center justify-center bg-white px-4 text-center">
          <p className="font-haas text-[#D04444]">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-white">
      <SeoHead
        title={seoTitle}
        description={seoDescription || seoTitle}
        siteOrigin={siteOrigin || undefined}
        canonicalPath={canonicalPath}
        imageUrl={seoMainImage || undefined}
        noindex
        suppressSiteBranding={suppressSiteBranding}
      />
      <main
        ref={pdfExportRootRef}
        className={`relative property-pdf-root${isRealEstate ? ' property-pdf-root--real-estate' : ''}`}
      >
        {/* Hero: misma estructura que villas — imagen en hijo con altura fija (evita franjas raras en móvil con pt + bg en el section) */}
        <section className="relative villa-pdf-hero-section overflow-hidden p-0">
          <div
            key={`hero-${galleryImages.hero || 'default'}`}
            className={`pdf-hero-image-area relative h-[min(70svh,520px)] min-h-[280px] md:max-[1919px]:h-[min(72vh,800px)] md:min-[1920px]:h-[min(67vh,760px)] shrink-0 overflow-hidden${useHeroMosaic ? ' md:px-8 md:pt-8' : ''}`}
          >
            {useHeroMosaic && (
              <div className="re-hero-mosaic hidden h-full w-full gap-1.5 md:flex">
                <button
                  type="button"
                  className="relative block h-full w-1/2 cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172338]"
                  onClick={() => openHeroPhoto(0)}
                  onContextMenu={(e) => e.preventDefault()}
                  aria-label="Open photo 1"
                >
                  <div
                    className="no-save-image h-full w-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-[1.02]"
                    style={{
                      backgroundImage: `url("${heroImageDirectUrl(allPropertyImages[0] || DEFAULT_HERO_IMAGE)}")`,
                      backgroundRepeat: 'no-repeat',
                      ...backgroundPositionStyle(allPropertyImagePositions[0] ?? galleryPositions.hero),
                    }}
                  />
                </button>
                <div
                  className={`grid h-full w-1/2 gap-1.5 ${
                    heroMosaicSideCount === 1
                      ? 'grid-cols-1 grid-rows-1'
                      : heroMosaicSideCount === 2
                        ? 'grid-cols-1 grid-rows-2'
                        : 'grid-cols-2 grid-rows-2'
                  }`}
                >
                  {heroMosaicSideIndexes.map((imgIndex, slot) => (
                    <button
                      key={imgIndex}
                      type="button"
                      className={`relative block h-full min-h-0 w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172338]${
                        heroMosaicSideCount === 3 && slot === 0 ? ' col-span-2' : ''
                      }`}
                      onClick={() => openHeroPhoto(imgIndex)}
                      onContextMenu={(e) => e.preventDefault()}
                      aria-label={`Open photo ${imgIndex + 1}`}
                    >
                      <div
                        className="no-save-image h-full w-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-[1.03]"
                        style={{
                          backgroundImage: `url("${heroImageDirectUrl(allPropertyImages[imgIndex] || DEFAULT_HERO_IMAGE)}")`,
                          backgroundRepeat: 'no-repeat',
                          ...backgroundPositionStyle(allPropertyImagePositions[imgIndex] ?? null),
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              className={`${useHeroMosaic ? 'md:hidden ' : ''}block h-full w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172338] focus-visible:ring-offset-2`}
              onClick={() => setIsGalleryGridModalOpen(true)}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Open photo gallery"
            >
              <div
                className="no-save-image h-full w-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-[1.02]"
                style={{
                  backgroundImage: `url("${heroImageDirectUrl(galleryImages.hero || DEFAULT_HERO_IMAGE)}")`,
                  backgroundRepeat: 'no-repeat',
                  ...backgroundPositionStyle(galleryPositions.hero),
                }}
              />
            </button>
            {offerBackHref && (
              <Link
                href={offerBackHref}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 border border-[#172338]/20 bg-white px-5 py-2.5 font-haas text-sm font-light text-[#172338] shadow-sm transition-all duration-200 hover:border-[#172338]/40 hover:bg-[#F7F8FA] pdf-exclude-from-capture md:left-8"
              >
                <ChevronLeft size={18} strokeWidth={1.5} className="text-[#D99330]" />
                Go back
              </Link>
            )}
            <div className={`absolute bottom-6 z-20 flex gap-3 pdf-exclude-from-capture ${useHeroMosaic ? 'right-4 md:right-14' : 'left-4 md:left-8'}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGalleryGridModalOpen(true);
                }}
                className={`flex items-center gap-2 border border-[#172338]/20 bg-white px-5 py-2.5 font-haas text-sm font-light text-[#172338] shadow-sm transition-all duration-200 hover:border-[#172338]/40 hover:bg-[#F7F8FA]${useHeroMosaic ? ' rounded-full border-transparent shadow-md' : ''}`}
              >
                {useHeroMosaic ? (
                  <>
                    <LayoutGrid size={18} strokeWidth={1.5} className="text-[#172338]" />
                    <span>Show all photos</span>
                  </>
                ) : (
                  <>
                    <Camera size={18} strokeWidth={1.5} className="text-[#D99330]" />
                    View photos
                  </>
                )}
              </button>
              {galleryVideoUrls.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsGalleryGridModalOpen(true);
                  }}
                  className="flex items-center gap-2 border border-[#172338]/20 bg-white px-5 py-2.5 font-haas text-sm font-light text-[#172338] shadow-sm transition-all duration-200 hover:border-[#172338]/40 hover:bg-[#F7F8FA]"
                >
                  <Video size={18} strokeWidth={1.5} className="text-[#D99330]" />
                  View videos
                </button>
              )}
            </div>
          </div>

          {!isRealEstate && (
            <div className="villa-pdf-hero-title-block relative z-10 px-6 md:px-20 lg:px-32 w-full bg-white py-8 md:py-10">
              <div className="w-full">
                <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                  <div className="flex-1 min-w-0">
                    {villaData.location && (
                      <div className="mb-4 md:mb-5">
                        <p className="font-haas font-light text-[11px] md:text-xs tracking-[0.24em] uppercase text-[#D99330]">
                          {villaData.location}
                        </p>
                      </div>
                    )}

                    <h1 className="text-[clamp(2rem,4.5vw,3.8rem)] font-gtsuper-ds font-light leading-[0.95] tracking-[-0.01em] text-[#172338] mb-6 md:mb-8">
                      {villaData.title}
                    </h1>

                    {villaData.description ? (
                      <div
                        className="max-w-xl text-[#506A70] font-haas font-light text-[16px] leading-[1.75] mb-[48px] md:mb-[56px]"
                        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(villaData.description) }}
                      />
                    ) : null}

                    <div className="flex flex-wrap items-center gap-x-7 gap-y-3 pb-5 border-b border-[#E2E8EB] mt-5">
                      {villaData.bedrooms !== null && villaData.bedrooms !== undefined && (
                        <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                          <TbBed size={17} className="text-[#D99330]" />
                          <span>{villaData.bedrooms} Bedrooms</span>
                        </div>
                      )}
                      {villaData.baths !== null && villaData.baths !== undefined && (
                        <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                          <TbBath size={17} className="text-[#D99330]" />
                          <span>{villaData.baths} Baths</span>
                        </div>
                      )}
                      {villaData.guests !== null && villaData.guests !== undefined && (
                        <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                          <TbUser size={17} className="text-[#D99330]" />
                          <span>{villaData.guests} Guests</span>
                        </div>
                      )}
                      {villaData.pools !== null && villaData.pools !== undefined && villaData.pools > 0 && (
                        <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                          <TbPool size={17} className="text-[#D99330]" />
                          <span>{villaData.pools} Pool{villaData.pools > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {(villaData as any).jacuzzis !== null && (villaData as any).jacuzzis !== undefined && (villaData as any).jacuzzis > 0 && (
                        <div className="flex items-center gap-2 font-haas font-light text-sm text-[#172338]">
                          <MdHotTub size={17} className="text-[#D99330]" />
                          <span>{(villaData as any).jacuzzis} Jacuzzi{(villaData as any).jacuzzis > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-6 text-[#172338] ml-auto" data-pdf-exclude-canvas="true">
                        <button
                          type="button"
                          className="group flex items-center font-haas font-light gap-2 text-sm cursor-pointer disabled:opacity-50 transition-colors"
                          aria-pressed={isCurrentPropertyLiked}
                          disabled={!currentPropertyId || isCurrentFavoritePending}
                          onClick={() => {
                            if (!currentPropertyId) return;
                            handleToggleFavorite(currentPropertyId);
                          }}
                        >
                          <GoHeart size={16} className={isCurrentPropertyLiked ? 'text-[#ef4444]' : 'text-[#172338] group-hover:text-[#D99330] transition-colors'} />
                          <span className="border-b border-transparent group-hover:border-[#172338] transition-colors pb-px">{isCurrentPropertyLiked ? 'Saved' : 'Save'}</span>
                        </button>
                        <button
                          type="button"
                          className="group flex items-center font-haas font-light gap-2 text-sm cursor-pointer transition-colors"
                          onClick={() => {
                            if (typeof window === 'undefined') return;
                            if (navigator.share) {
                              navigator
                                .share({
                                  title: villaData.title,
                                  url: window.location.href,
                                })
                                .catch(() => {});
                            } else {
                              void navigator.clipboard.writeText(window.location.href);
                            }
                          }}
                        >
                          <BsShare size={14} className="text-[#172338] group-hover:text-[#D99330] transition-colors" />
                          <span className="border-b border-transparent group-hover:border-[#172338] transition-colors pb-px">Share</span>
                        </button>
                      </div>
                    </div>

                    {likesError && (
                      <button
                        type="button"
                        className="mt-3 text-xs text-[#D04444] underline underline-offset-2"
                        onClick={clearLikesError}
                      >
                        {likesError}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {isRealEstate && (
            <div className="villa-pdf-hero-title-block relative z-10 px-6 md:px-20 lg:px-32 w-full bg-white py-8 md:py-10">
              <div className="w-full">
                {/* Location */}
                {villaData.location && (
                  <p className="font-haas font-light text-[11px] md:text-xs tracking-[0.24em] uppercase text-[#D99330] mb-3">
                    {villaData.location}
                  </p>
                )}

                {/* Title */}
                <h1 className="text-[clamp(1.8rem,4vw,3.2rem)] font-gtsuper-ds font-light leading-[0.95] tracking-[-0.01em] text-[#172338] uppercase mb-6">
                  {villaData.title}
                </h1>

                {/* Price */}
                <div className="mb-2">
                  <p className="text-[clamp(1.6rem,3vw,2.4rem)] font-haas font-light text-[#172338]">
                    {villaData.price}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 font-haas font-light text-[16px] text-[#506A70]">
                    {(() => {
                      const salePrice = Number((propertyData as any)?.sale_price);
                      const area = Number((propertyData as any)?.classification?.livingArea ?? (propertyData as any)?.classification?.indoorArea);
                      if (Number.isFinite(salePrice) && salePrice > 0 && Number.isFinite(area) && area > 0) {
                        return <span>{formatCurrency(Math.round(salePrice / area), (villaData as any).priceCurrencySymbol ?? '€ ')} / m²</span>;
                      }
                      return null;
                    })()}
                    {(propertyData as any)?.propertyCode && (
                      <span className="text-[#506A70]/50">|</span>
                    )}
                    {(propertyData as any)?.propertyCode && (
                      <span>Listing Code: {(propertyData as any).propertyCode}</span>
                    )}
                  </div>
                </div>

                {/* Quick stats bar */}
                {(() => {
                  const stats = [
                    villaData.general?.plotSize && villaData.general.plotSize !== '0 sqm'
                      ? { label: 'Plot Size', value: villaData.general.plotSize.replace(/\s*sqm$/i, ''), unit: 'm²' }
                      : null,
                    villaData.general?.propertySize && villaData.general.propertySize !== '0 sqm'
                      ? { label: 'Building Size', value: villaData.general.propertySize.replace(/\s*sqm$/i, ''), unit: 'm²' }
                      : null,
                    (villaData as any).constructionYear != null
                      ? { label: 'Construction Year', value: String((villaData as any).constructionYear) }
                      : null,
                    villaData.bedrooms != null ? { label: 'Bedrooms', value: String(villaData.bedrooms) } : null,
                    (propertyData as any)?.classification?.energyCertificate &&
                    !/^[\d.,\s]+$/.test(String((propertyData as any)?.classification?.energyCertificate).trim())
                      ? { label: 'Energy Class', value: (propertyData as any)?.classification?.energyCertificate }
                      : null,
                    (villaData as any).view?.length > 0
                      ? { label: 'View', value: (villaData as any).view[0] }
                      : null,
                    (() => {
                      const raw = (propertyData as any)?.classification?.floorNumber;
                      if (raw == null) return null;
                      const floors = String(raw).split(',').map((f: string) => f.trim()).filter(Boolean);
                      if (floors.length === 0) return null;
                      return { label: floors.length > 1 ? 'Floors' : 'Floor', value: floors.join(', ') };
                    })(),
                  ].filter(Boolean) as { label: string; value: string; unit?: string }[];

                  if (stats.length === 0) return null;
                  return (
                    <div className="overflow-hidden my-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
                        {stats.map((stat) => (
                          <div key={stat.label} className="flex flex-col items-center justify-center py-5 px-3 text-center border border-[#E2E8EB]">
                            <span className="font-gtsuper-ds text-xl font-light text-[#172338] leading-none">
                              {stat.value}
                              {stat.unit && <span className="text-sm ml-0.5 text-[#506A70]">{stat.unit}</span>}
                            </span>
                            <span className="font-haas font-light text-[10px] min-[1600px]:text-[12px] uppercase tracking-[0.22em] text-[#506A70] mt-2">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Two-column: Property Introduction + Property Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-20">
                  {/* Left: Property Introduction */}
                  <div>
                    {villaData.description ? (
                      <>
                        <div
                          className={`text-[#506A70] font-haas font-light text-[16px] leading-[1.75] overflow-hidden transition-all duration-300 ${shouldShowReDescToggle && !isReDescExpanded ? 'line-clamp-6' : ''}`}
                          dangerouslySetInnerHTML={{ __html: headerDescriptionHtml }}
                        />
                        {shouldShowReDescToggle && (
                          <button
                            type="button"
                            onClick={() => setIsReDescExpanded(p => !p)}
                            className="mt-2 font-haas font-light text-sm text-[#D99330] hover:underline focus:outline-none"
                          >
                            {isReDescExpanded ? 'View less' : 'View more'}
                          </button>
                        )}
                      </>
                    ) : null}

                    {/* Layout & Living Spaces */}
                    {(villaData as any).villaGroups?.length > 0 && (
                      <div className="mt-8">
                        <h2 className="font-gtsuper-ds font-light text-xl text-[#172338] mb-4">Layout &amp; Living Spaces</h2>
                        <div className="flex flex-wrap gap-2">
                          {((villaData as any).villaGroups as { title?: string; items?: string[] }[])
                            .filter((g) => g.items && g.items.length > 0)
                            .flatMap((group) =>
                              (group.items ?? []).map((item, idx) => (
                                <span
                                  key={`${group.title}-${idx}`}
                                  className="px-3 py-1.5 border border-[#E2E8EB] font-haas font-light text-sm text-[#506A70] bg-white"
                                >
                                  {item}
                                </span>
                              ))
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Property Information card */}
                  {(() => {
                    const infoRows = [
                      { label: 'PRICE', value: villaData.price },
                      (() => {
                        const salePrice = Number((propertyData as any)?.sale_price);
                        const area = Number((propertyData as any)?.classification?.livingArea ?? (propertyData as any)?.classification?.indoorArea);
                        if (Number.isFinite(salePrice) && salePrice > 0 && Number.isFinite(area) && area > 0) {
                          return { label: 'PRICE PER M²', value: `${formatCurrency(Math.round(salePrice / area), (villaData as any).priceCurrencySymbol ?? '€ ')} / m²` };
                        }
                        return null;
                      })(),
                      villaData.baths != null ? { label: 'BATHROOMS', value: String(villaData.baths) } : null,
                      (() => {
                        const parkingSpaces = (propertyData as any)?.classification?.parkingSpaces
                          ?? (propertyData as any)?.description?.theVilla?.totalParkings;
                        return parkingSpaces != null && Number(parkingSpaces) > 0
                          ? { label: 'PARKING SPACES', value: String(parkingSpaces) }
                          : null;
                      })(),
                      villaData.pools != null && villaData.pools > 0
                        ? { label: 'POOL', value: String(villaData.pools) }
                        : null,
                      (villaData as any).type ? { label: 'PROPERTY TYPE', value: String((villaData as any).type).replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) } : null,
                      (villaData as any).condition
                        ? { label: 'CONDITION', value: String((villaData as any).condition).split(',').filter(Boolean).map((s: string) => s.trim()).join(', ') }
                        : null,
                    ].filter(Boolean) as { label: string; value: string }[];

                    if (infoRows.length === 0) return null;
                    return (
                      <div className="border border-[#E2E8EB] bg-white p-6 md:p-8">
                        <h2 className="font-gtsuper-ds font-light text-xl text-[#172338] mb-6 pb-4 border-b border-[#D99330]">Property Information</h2>
                        <div>
                          {infoRows.map((row, i) => (
                            <div
                              key={i}
                              className={`flex items-start justify-between gap-4 py-3 min-[1600px]:py-[14px] ${i < infoRows.length - 1 ? 'border-b border-[#E2E8EB]' : ''}`}
                            >
                              <span className="font-haas font-light text-[10px] min-[1600px]:text-sm uppercase tracking-[0.18em] text-[#506A70] shrink-0">{row.label}</span>
                              <span className={`font-haas text-sm min-[1600px]:text-base text-right ${row.label === 'PRICE' ? 'font-normal text-[#D99330]' : 'font-normal text-[#172338]'}`}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </section>

      {/* About Villa Section - Solo para rentals */}
      {!isRealEstate && (
      <section
            id="services"
            className="w-full bg-white pb-[30px] [font-family:'Abhaya_Libre',serif]"
            style={{ marginTop: '50px' }}
            >
            <div className="mx-auto text-center px-4 pb-4 -mt-10">

                {/* Highlight cards — Mobile grid */}
                <div className="grid grid-cols-2 gap-4 md:hidden">
                  {highlightCards.map((card, index) => {
                    if (card.image === PLACEHOLDER_IMAGE || !card.image) return null;
                    return (
                      <div key={card.key || `highlight-mobile-${index}`} className="flex flex-col">
                        <div className="w-full h-[160px] overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.label || `${villaData.title} highlight ${index + 1}`}
                            className="no-save-image w-full h-full object-cover"
                            style={positionStyle((card as any).imagePosition)}
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                        <p className="mt-2 font-gtsuper-ds text-[16px] font-light text-center text-[#3C3C50]">
                          {index === 2 ? <span className="text-[#D99330]">{card.label}</span> : card.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Highlight cards — Desktop collage */}
                <div className="hidden md:flex flex-wrap justify-center gap-3 md:gap-4 md:-translate-x-[30px] w-full max-w-[1550px] mx-auto">
                  {highlightCards.map((card, index) => {
                    if (card.image === PLACEHOLDER_IMAGE || !card.image) return null;

                    const cardStyles = [
                      'shrink-0 flex-none max-w-[340px] md:max-w-[400px] text-center md:mt-[60px] md:text-left md:z-30 md:ml-[7%] md:translate-x-[-60px]',
                      'shrink-0 flex-none max-w-[340px] md:max-w-[400px] text-center md:mt-[363px] md:text-left md:z-20 md:-ml-[3%] md:translate-x-[-70px]',
                      'shrink-0 flex-none max-w-[340px] md:mr-16 md:max-w-[400px] text-center md:-ml-[20%] md:mt-[60px] md:text-right md:z-10',
                      'shrink-0 flex-none max-w-[340px] md:max-w-[400px] text-center md:-ml-[2%] md:mt-[60px] md:text-left md:z-10 md:-translate-x-[0px]'
                    ];

                    const imageStyles = [
                      'object-cover',
                      'object-cover md:-translate-y-4 lg:-translate-y-6',
                      'object-cover',
                      'object-cover'
                    ];

                    const imageInlineStyles = [
                      { width: 405, height: 304 },
                      { width: 291, height: 186 },
                      { width: 378, height: 225 },
                      { width: 344, height: 316 },
                    ];

                    const textStyles = [
                      'mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50]',
                      'relative z-40 font-gtsuper-ds text-[20px] font-light text-[#3C3C50]',
                      'mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50] md:pr-4',
                      'mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50]'
                    ];

                    return (
                      <div key={card.key || `highlight-${index}`} className={cardStyles[index] || cardStyles[0]}>
                        <div
                          className={imageStyles[index] || imageStyles[0]}
                          style={{ ...imageInlineStyles[index], overflow: 'hidden' }}
                        >
                          <img
                            src={card.image}
                            alt={card.label || `${villaData.title} highlight ${index + 1}`}
                            className="no-save-image w-full h-full object-cover"
                            style={positionStyle((card as any).imagePosition)}
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                        <p className={textStyles[index] || textStyles[0]}>
                          {index === 2 ? (
                            <span className="text-[#D99330] uppercase">{card.label}</span>
                          ) : (
                            card.label
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

            </div>
        </section>
      )}

      {/* IN DETAIL Section - Solo para rentals, no para real estate */}
      {!isRealEstate && (
      <section className="w-full bg-white py-14 md:py-20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-20 lg:px-32">

          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <p className="font-haas font-light text-[11px] uppercase tracking-[0.28em] text-[#D99330] mb-3">In detail</p>
            <div className="w-8 h-px bg-[#D99330] mx-auto" />
          </div>

          {/* Nav links horizontales */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-10 md:mb-12 pdf-exclude-from-capture">
            {detailNavItems.map(({ key, label, icon, ref }) => (
              <button
                key={key}
                type="button"
                onClick={() => scrollToDetailSection(ref)}
                className="group flex items-center gap-2 font-haas font-light text-sm text-[#506A70] hover:text-[#172338] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D99330]"
              >
                {icon}
                <span className="border-b border-transparent group-hover:border-[#172338] transition-colors pb-px">{label}</span>
              </button>
            ))}
          </div>

          {/* Main Description */}
          {sanitizedInDetailDescriptionHtml && (
            <div className="relative mb-10 md:mb-12">
              <div
                className={`villa-in-detail-description-html text-[#506A70] max-w-3xl mx-auto text-sm md:text-[15px] font-haas font-light leading-[1.8] ${
                  shouldShowInDetailViewMore && !isInDetailExpanded ? 'max-h-[170px] overflow-hidden' : ''
                }`}
                dangerouslySetInnerHTML={{
                  __html: sanitizeCmsHtml(sanitizedInDetailDescriptionHtml),
                }}
              />
              {shouldShowInDetailViewMore && !isInDetailExpanded && (
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pdf-exclude-from-capture"
                  aria-hidden="true"
                />
              )}
            </div>
          )}

          {sanitizedInDetailDescriptionHtml && shouldShowInDetailViewMore && (
            <div className="text-center mb-10 md:mb-12 pdf-exclude-from-capture">
              <button
                type="button"
                onClick={() => setIsInDetailExpanded((v) => !v)}
                className="font-haas font-light text-sm text-[#506A70] border-b border-[#506A70]/40 hover:border-[#506A70] pb-px transition-colors"
              >
                {isInDetailExpanded ? 'View less' : 'View more'}
              </button>
            </div>
          )}

          {/* Detailed Information Columns */}
          {(() => {
            const columns = [
              {
                title: 'GENERAL',
                type: 'general',
                data: {
                  bedrooms: villaData.general?.bedrooms,
                  sleeps: villaData.general?.sleeps,
                  baths: villaData.general?.baths,
                  propertySize: villaData.general?.propertySize,
                  landSize: villaData.general?.landSize,
                },
              },
              { title: 'BEDROOMS', type: 'list', items: villaData.accommodations || [] },
              { title: 'FACILITIES', type: 'list', items: villaData.facilities || [] },
              { title: 'SERVICES', type: 'list', items: villaData.services || [] },
              { title: 'ENJOY', type: 'list', items: villaData.enjoy || [] },
            ];

            return (
              <div ref={detailsSectionRef} data-pdf-export-block="true">
                <div className="w-full h-px bg-[#E2E8EB] mb-10" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8 px-4 md:px-0">
                  {columns.map((column, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center gap-2.5 mb-5">
                        <span className="h-px w-5 bg-[#D99330] shrink-0" aria-hidden="true" />
                        <h4 className="font-haas font-light text-[10px] uppercase tracking-[0.22em] text-[#506A70]">{column.title}</h4>
                      </div>
                      {column.type === 'general' && column.data ? (
                        <ul className="flex flex-col gap-2.5">
                          {column.data.bedrooms != null && <li className="flex items-start gap-2.5 font-haas font-light text-sm text-[#172338] leading-snug"><span className="text-[#D99330] shrink-0 mt-0.5">—</span><span>Bedrooms: {column.data.bedrooms}</span></li>}
                          {column.data.sleeps != null && <li className="flex items-start gap-2.5 font-haas font-light text-sm text-[#172338] leading-snug"><span className="text-[#D99330] shrink-0 mt-0.5">—</span><span>Sleeps: {column.data.sleeps}</span></li>}
                          {column.data.baths != null && <li className="flex items-start gap-2.5 font-haas font-light text-sm text-[#172338] leading-snug"><span className="text-[#D99330] shrink-0 mt-0.5">—</span><span>Baths: {column.data.baths}</span></li>}
                          {column.data.propertySize && column.data.propertySize !== '0 sqm' && <li className="flex items-start gap-2.5 font-haas font-light text-sm text-[#172338] leading-snug"><span className="text-[#D99330] shrink-0 mt-0.5">—</span><span>Villa Size: {column.data.propertySize}</span></li>}
                          {column.data.landSize && column.data.landSize !== '0 sqm' && <li className="flex items-start gap-2.5 font-haas font-light text-sm text-[#172338] leading-snug"><span className="text-[#D99330] shrink-0 mt-0.5">—</span><span>Land Size: {column.data.landSize}</span></li>}
                        </ul>
                      ) : column.items && column.items.length > 0 ? (() => {
                        const LIMIT = 5;
                        const isExpanded = expandedColumns.has(index);
                        const visible = isExpanded ? column.items : column.items.slice(0, LIMIT);
                        const hasMore = column.items.length > LIMIT;
                        return (
                          <>
                            <ul className="flex flex-col gap-2.5">
                              {visible.map((item: string, itemIndex: number) => (
                                <li key={itemIndex} className="flex items-start gap-2.5 font-haas font-light text-sm text-[#172338] leading-snug">
                                  <span className="text-[#D99330] shrink-0 mt-0.5">—</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                            {hasMore && (
                              <button
                                type="button"
                                onClick={() => setExpandedColumns(prev => {
                                  const next = new Set(prev);
                                  isExpanded ? next.delete(index) : next.add(index);
                                  return next;
                                })}
                                className="mt-3 font-haas font-light text-xs text-[#506A70] underline decoration-[#506A70] underline-offset-[3px] hover:opacity-70 text-left"
                              >
                                {isExpanded ? 'View less' : `+${column.items.length - LIMIT} more`}
                              </button>
                            )}
                          </>
                        );
                      })() : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>
      )}

      {/* More About Villa Section / Photos Section */}
      <section
        ref={photosSectionRef}
        className="pdf-gallery-area pdf-exclude-from-capture w-full overflow-x-hidden bg-[#F0F3F5] px-4 py-12 pb-6 md:px-32 md:py-16 md:pb-8"
      >
        <h2 className="mb-6 text-center font-gtsuper-ds text-3xl font-light text-[#172338] md:mb-8 md:text-[40px]">{isRealEstate ? 'Photos' : `More About ${aboutTitle}`}</h2>

        {(() => {
            const totalImages = allPropertyImages.length;
            const totalVideos = galleryVideoUrls.length;
            const hasVideos = totalVideos > 0;
            const hasThumbRow = totalImages > 1;
            const moreCount = hasThumbRow ? Math.max(0, totalImages - 4) : 0;
            const previewForMoreIndex = allPropertyImages[4] !== undefined ? 4 : allPropertyImages[3] !== undefined ? 3 : totalImages - 1;
            const previewForMore = allPropertyImages[previewForMoreIndex];
            const previewForMorePosition = allPropertyImagePositions[previewForMoreIndex] ?? null;

            return (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
                <div
                  className="pdf-gallery-main col-span-2 aspect-[16/10] min-h-[200px] w-full cursor-pointer overflow-hidden sm:col-span-4 sm:aspect-auto sm:h-[300px] md:h-[360px]"
                  onClick={() => {
                    if (allPropertyImages.length > 0) {
                      setGalleryModalIndex(0);
                      setIsGalleryModalOpen(true);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (allPropertyImages.length > 0) {
                        setGalleryModalIndex(0);
                        setIsGalleryModalOpen(true);
                      }
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label="Open photo gallery"
                >
                  <img
                    src={activeImageSrc}
                    alt={`${villaData.title} gallery image`}
                    style={positionStyle(activeImagePosition)}
                    className="no-save-image h-full w-full object-cover transition duration-300 ease-out hover:opacity-90"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
                {hasThumbRow
                  ? [1, 2, 3].map((imgIndex) => {
                      const src = allPropertyImages[imgIndex];
                      if (!src) {
                        return <div key={imgIndex} className="hidden min-h-[7rem] sm:block" aria-hidden />;
                      }
                      return (
                        <button
                          key={imgIndex}
                          type="button"
                          onClick={() => {
                            setGalleryModalIndex(imgIndex);
                            setIsGalleryModalOpen(true);
                          }}
                          className="relative h-28 w-full min-h-[7rem] cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-2"
                        >
                          <img
                            src={src}
                            alt={`${villaData.title} - Image ${imgIndex + 1}`}
                            style={positionStyle(allPropertyImagePositions[imgIndex] ?? null)}
                            className="no-save-image h-full w-full object-cover"
                            draggable={false}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </button>
                      );
                    })
                  : null}
                {hasThumbRow && moreCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsGalleryGridModalOpen(true)}
                    className="relative h-28 w-full min-h-[7rem] cursor-pointer overflow-hidden bg-[#506A70]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-2"
                  >
                    {previewForMore ? (
                      <img
                        src={previewForMore}
                        alt=""
                        style={positionStyle(previewForMorePosition)}
                        className="no-save-image h-full w-full scale-105 object-cover blur-sm"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 flex items-center justify-center px-2 ${previewForMore ? 'bg-black/45' : 'bg-[#506A70]/40'}`}
                    >
                      <span className="text-center font-haas text-base font-semibold leading-tight text-white md:text-lg">
                        +{moreCount} {hasVideos ? 'photos & videos' : moreCount === 1 ? 'photo' : 'photos'}
                      </span>
                    </div>
                  </button>
                ) : null}
              </div>
            );
          })()}
      </section>

      {/* Location and About Location Section - Solo para real estate */}
      {isRealEstate && (
        <section
          ref={mapSectionRef}
          className="real-estate-location-pdf-exclude py-12 md:py-20 px-4 md:px-32 bg-white"
          data-pdf-export-block="true"
        >
          <h2 className="text-2xl md:text-4xl font-gtsuper-ds font-light text-[#506A70] mb-8 md:mb-12 text-center">
            LOCATION
          </h2>

          {/* Mapa flotante a la izquierda: el texto de la derecha lo bordea (float) mientras
              dura su altura y después pasa a ocupar el ancho completo, en vez de quedar
              angosto y muy alto dentro de una columna de grid. */}
          <div>
            {/* Columna izquierda: mapa + distancias + location */}
            <div className="md:float-left md:w-[calc(50%_-_1.25rem)] md:mr-10 mb-8 md:mb-4 flex flex-col gap-4">
              <PropertyMapWithSidePanel
                property={propertyData}
                locationSummary={villaData.location}
                title={villaData.title}
                googleMapUrl={propertyData?.googleMapUrl}
                surface="white"
                hidePanel
              />
              {(propertyData?.description?.areaAndDistancesInfo || villaData.location) && (
                <div className="border border-[#E2E8EB] bg-white p-5 flex flex-col gap-6">
                  {propertyData?.description?.areaAndDistancesInfo && (
                    <div>
                      <p className="font-haas font-light text-[11px] uppercase tracking-[0.2em] text-[#D99330] mb-3">Distances</p>
                      <div
                        className="font-haas font-light text-sm text-[#506A70] leading-[1.7] prose prose-sm prose-p:my-1.5 prose-p:font-haas prose-p:font-light prose-p:text-[#506A70] prose-li:font-haas prose-li:font-light prose-li:marker:text-[#D99330]"
                        dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(propertyData.description.areaAndDistancesInfo) }}
                      />
                    </div>
                  )}
                  {(() => {
                    const locParts: string[] = [];
                    const seen = new Set<string>();
                    for (const part of [
                      propertyData?.visibleLocation,
                      propertyData?.area,
                      propertyData?.region,
                      propertyData?.country,
                    ]) {
                      const val = typeof part === 'string' ? part.trim() : '';
                      if (val && !seen.has(val.toLowerCase())) {
                        seen.add(val.toLowerCase());
                        locParts.push(val);
                      }
                    }
                    if (locParts.length === 0 && villaData.location) locParts.push(villaData.location);
                    if (locParts.length === 0) return null;
                    return (
                      <div>
                        <p className="font-haas font-light text-[11px] uppercase tracking-[0.2em] text-[#D99330] mb-3">Location</p>
                        <div className="flex flex-col gap-0.5">
                          {locParts.map((line, i) => (
                            <span key={i} className="font-haas font-light text-sm text-[#506A70] leading-[1.7]">{line}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Texto: mientras el mapa flota a la izquierda, esto ocupa el ancho restante;
                una vez que el texto pasa la altura del mapa, se ensancha solo al 100%. */}
            {villaData.detailedDescription && (
              <div>
                <h3 className="font-gtsuper-ds font-light text-[22px] leading-snug tracking-[-0.01em] text-[#172338] mb-6">
                  About the Property
                </h3>
                <div
                  className={`villa-in-detail-description-html font-haas font-light text-[15px] leading-[1.8] text-[#506A70] transition-all duration-300 ${!isAboutExpanded && shouldShowAboutViewMore ? 'overflow-hidden line-clamp-[10]' : ''}`}
                  dangerouslySetInnerHTML={{ __html: aboutLocationHtml }}
                />
                {shouldShowAboutViewMore && (
                  <button
                    type="button"
                    onClick={() => setIsAboutExpanded((v) => !v)}
                    className="mt-5 font-haas text-[13px] font-light tracking-[0.12em] uppercase text-[#172338] underline underline-offset-4 hover:text-[#D99330] transition-colors"
                  >
                    {isAboutExpanded ? 'View less' : 'View more'}
                  </button>
                )}
              </div>
            )}
            <div className="clear-both" />
          </div>
        </section>
      )}

      {/* Outdoor Spaces Section */}
      {!isRealEstate && (
        <OutdoorSpacesSection
          outdoorTitle={(villaData as any).outdoorTitle}
          outdoorDescription={(villaData as any).outdoorDescription}
          outdoorImage={(villaData as any).outdoorImage}
        />
      )}

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={allPropertyImages}
        initialIndex={galleryModalIndex}
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        propertyTitle={villaData.title}
        offerBackHref={offerBackHref}
      />

      {/* Image Gallery Grid Modal */}
      <ImageGalleryGridModal
        images={allPropertyImages}
        imagePositions={allPropertyImagePositions}
        videos={galleryVideoUrls}
        isOpen={isGalleryGridModalOpen}
        onClose={() => setIsGalleryGridModalOpen(false)}
        onImageClick={(index) => {
          setIsGalleryGridModalOpen(false);
          setGalleryModalIndex(index);
          setIsGalleryModalOpen(true);
        }}
        propertyTitle={villaData.title}
        offerBackHref={offerBackHref}
      />

      {/* The Villa and Pricing / Feature Blocks Section */}
      <section className={`py-8 md:py-12 px-4 md:px-32 ${isRealEstate ? 'bg-white' : 'bg-[#f1f5f9]'}`}>
        {isRealEstate ? (
          <div className="w-full text-[#172338]" data-pdf-export-block="true">
            {(() => {
              const vd = villaData as Record<string, unknown> & {
                type?: string;
                condition?: string;
                flooring?: string;
                constructionYear?: number | null;
                locationFeatures?: string[];
                view?: string[];
                luxuryFacilities?: string[];
                outdoorFeatures?: string[];
                indoorFacilities?: string[];
                general?: { landSize?: string | null; propertySize?: string | null };
              };

              const outdoorItemsRaw = (vd.outdoorFeatures ?? []) as string[];
              const comfortItemsRaw = (vd.indoorFacilities ?? []) as string[];
              const luxuryItemsRaw = (vd.luxuryFacilities ?? []) as string[];
              const securityKeywords = ['alarm', 'cctv', 'camera', 'security door', 'gated', 'guard', '24/7 security', 'security'];
              const isSecurityItem = (item: string) => securityKeywords.some((kw) => item.toLowerCase().includes(kw));

              // Cada item se muestra en un solo bloque: Seguridad tiene prioridad,
              // luego Outdoor, luego Comfort, y Luxury solo aporta lo que no aparece ya en Comfort.
              const securityItems = Array.from(new Set(
                [...outdoorItemsRaw, ...comfortItemsRaw, ...luxuryItemsRaw].filter(isSecurityItem)
              ));
              const outdoorItems = outdoorItemsRaw.filter((item) => !isSecurityItem(item));
              const comfortItems = comfortItemsRaw.filter((item) => !isSecurityItem(item));
              const luxuryItems = luxuryItemsRaw.filter(
                (item) => !isSecurityItem(item) && !comfortItems.includes(item)
              );

              const viewItems: string[] = Array.isArray((villaData as any).view) ? (villaData as any).view : [];
              const locationFeatures: string[] = Array.isArray((villaData as any).locationFeatures) ? (villaData as any).locationFeatures : [];
              const locationViewItems = [...(viewItems.length > 0 ? [`View: ${viewItems.join(', ')}`] : []), ...locationFeatures];

              const featureBlocks = [
                { title: 'Outdoor & Lifestyle', items: outdoorItems },
                { title: 'Comfort & Technical', items: comfortItems },
                { title: 'Security Amenities', items: securityItems },
                { title: 'Luxury, Special & Unique Features', items: luxuryItems },
                { title: 'Location & View', items: locationViewItems },
              ].filter((block) => block.items.length > 0);

              if (featureBlocks.length === 0) return null;

              // Un icono monolínea por amenity en vez del punto genérico:
              // orienta al lector de un vistazo dentro de listas largas.
              const AMENITY_ICON_RULES: Array<[RegExp, typeof TbPool]> = [
                [/pool/i, TbPool],
                [/garden|landscap/i, TbLeaf],
                [/parking/i, TbParkingCircle],
                [/bbq|grill/i, TbGrillFork],
                [/dining|lounge/i, TbSofa],
                [/kitchen/i, TbToolsKitchen2],
                [/gated|fence/i, TbFence],
                [/alarm|cctv|camera|guard|security/i, TbShieldCheck],
                [/elevator/i, TbElevator],
                [/air.?condition/i, TbSnowflake],
                [/smart home/i, TbSmartHome],
                [/wifi/i, TbWifi],
                [/^view:|sea view|panoramic|nature view|seaside/i, TbEye],
                [/walking distance/i, TbWalk],
              ];
              const getAmenityIcon = (item: string) =>
                AMENITY_ICON_RULES.find(([re]) => re.test(item))?.[1] ?? TbSparkles;

              // Un bloque impar al final ocupa el ancho completo en vez de
              // dejar una celda vacía al lado (consistente con "Layout & Living Spaces" debajo).
              const lastIndex = featureBlocks.length - 1;
              const isOrphanLast = featureBlocks.length % 2 === 1;

              return (
                <>
                  <h2 className="text-3xl font-gtsuper-ds font-light text-[#506A70] uppercase tracking-wide text-center mb-8">
                    Features &amp; Amenities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {featureBlocks.map((block, index) => (
                      <div
                        key={block.title}
                        className={`bg-white border border-[#D8DEE3] shadow-sm p-5 md:p-6 ${isOrphanLast && index === lastIndex ? 'md:col-span-2' : ''}`}
                      >
                        <div className="mb-3.5 pb-2.5 border-b border-[#E2E8EB] flex items-center gap-2">
                          <span className="h-px w-5 bg-[#D99330] shrink-0" aria-hidden="true" />
                          <h3 className="font-gtsuper-ds text-[13px] font-light uppercase tracking-[0.14em] text-[#172338]">
                            {block.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                          {block.items.map((item) => {
                            const Icon = getAmenityIcon(item);
                            return (
                              <span key={item} className="inline-flex items-center gap-1.5 font-haas font-light text-sm text-[#506A70] leading-snug">
                                <Icon className="h-[15px] w-[15px] shrink-0 text-[#D99330]" aria-hidden="true" />
                                {item}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {(() => {
              const layout = (propertyData as any)?.classification?.layoutAndLivingSpaces as {
                kitchens?: { count?: number | string | null; description?: string | null };
                livingRooms?: { count?: number | string | null; description?: string | null };
                guestWC?: { count?: number | string | null; description?: string | null };
                staffQuarters?: { count?: number | string | null; description?: string | null };
                garden?: { available?: boolean | null; description?: string | null };
                storage?: { available?: boolean | null; description?: string | null };
              } | undefined;

              if (!layout) return null;

              const hasValue = (field?: { count?: number | string | null; description?: string | null }) =>
                !!field && ((field.count !== null && field.count !== undefined && field.count !== '') || !!(field.description ?? '').trim());

              const hasYesNoValue = (field?: { available?: boolean | null; description?: string | null }) =>
                !!field && (field.available !== null && field.available !== undefined || !!(field.description ?? '').trim());

              const roomRows = [
                { label: 'Kitchens', field: layout.kitchens },
                { label: 'Living Rooms', field: layout.livingRooms },
                { label: 'Guest W/C', field: layout.guestWC },
                { label: 'Staff Quarters', field: layout.staffQuarters },
              ].filter((row) => hasValue(row.field));

              const yesNoRows = [
                { label: 'Garden', field: layout.garden },
                { label: 'Storage', field: layout.storage },
              ].filter((row) => hasYesNoValue(row.field));

              if (roomRows.length === 0 && yesNoRows.length === 0) return null;

              return (
                <div className="mt-8 bg-white border border-[#D8DEE3] shadow-sm p-6 md:p-8">
                  <div className="mb-4 pb-3 border-b border-[#F0EBE0] flex items-center gap-2">
                    <span className="h-px w-5 bg-[#D99330] shrink-0" aria-hidden="true" />
                    <h3 className="font-gtsuper-ds text-[13px] font-light uppercase tracking-[0.14em] text-[#172338]">
                      Layout &amp; Living Spaces
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {roomRows.map((row) => (
                      <div key={row.label}>
                        <p className="font-haas font-light text-sm text-[#172338]">
                          {row.label}
                          {row.field?.count !== null && row.field?.count !== undefined && row.field?.count !== '' ? `: ${row.field.count}` : ''}
                        </p>
                        {row.field?.description && (
                          <p className="mt-1 font-haas font-light text-sm text-[#506A70] leading-snug">{row.field.description}</p>
                        )}
                      </div>
                    ))}
                    {yesNoRows.map((row) => (
                      <div key={row.label}>
                        <p className="font-haas font-light text-sm text-[#172338]">
                          {row.label}: {row.field?.available ? 'Yes' : 'No'}
                        </p>
                        {row.field?.description && (
                          <p className="mt-1 font-haas font-light text-sm text-[#506A70] leading-snug">{row.field.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

          </div>
        ) : (
          <>
            <div className="villa-pricing-live-grid grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* The Villa - Mostrar dinámicamente todos los grupos desde la BD */}
              <div
                ref={pricesSectionRef}
                className="bg-white p-6 md:p-10 shadow-sm border border-[#506A7080] md:max-h-[32rem] md:overflow-y-auto"
              >
                <h2 className="villa-the-villa-heading text-3xl font-gtsuper-ds font-light text-[#172338] mb-8 border-b border-orange-300 pb-2">The Villa</h2>

                <div className="space-y-8">
                  {((villaData as any).villaGroups && (villaData as any).villaGroups.length > 0) ? (
                    ((villaData as any).villaGroups as any[]).map((group: any, groupIndex: number) => {
                      if (!group.items || !Array.isArray(group.items) || group.items.length === 0) {
                        return null;
                      }

                      return (
                        <div key={groupIndex}>
                          <h3 className="text-xl font-gtsuper-ds font-light text-gray-600 mb-4 uppercase">
                            {group.title || `Section ${groupIndex + 1}`}
                          </h3>
                          <ul className="space-y-2 text-gray-700 font-haas">
                            {group.items.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} className="pl-4">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No room details available.</p>
                  )}
                </div>
              </div>

              {/* Availability (agent portfolio: sin tab de precios por noche en vivo) */}
              <div className="bg-white p-6 md:p-10 shadow-sm border border-[#506A7080] md:max-h-[32rem] md:overflow-y-auto">
                <div className="flex gap-6 mb-6 border-b border-[#D99330]">
                  <span className="text-[20px] pb-3 font-gtsuper-ds font-light text-[#506A70] border-b-2 border-[#D99330]">
                    Availability
                  </span>
                </div>

                {!isRealEstate && (
                  <div className="mt-4">
                    <div className="py-4">
                      {(icalendarURL ||
                        availabilityRanges.length > 0 ||
                        (Array.isArray((propertyData as any)?.availabilityDates) &&
                          (propertyData as any).availabilityDates.length > 0)) ? (
                        <AvailabilityCalendar
                          icalUrl={icalendarURL}
                          blockedDates={
                            Array.isArray((propertyData as any)?.availabilityDates)
                              ? (propertyData as any).availabilityDates
                                  .map((d: string) => String(d).trim().slice(0, 10))
                                  .filter((s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s))
                              : []
                          }
                          availabilityRanges={availabilityRanges}
                          showPrices={(propertyData as any)?.price_visibility !== false}
                        />
                      ) : (
                        <div className="rounded border border-[#E4E8EA] p-4 text-sm text-[#506A70] font-haas">
                          Availability information is provided upon request.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="villa-pdf-pricing-only hidden" aria-hidden="true">
              <div data-pdf-export-block="true" className="bg-white p-6 md:p-10 shadow-sm border border-[#506A7080]">
                <h2 className="villa-the-villa-heading text-3xl font-gtsuper-ds font-light text-[#172338] mb-8 border-b border-orange-300 pb-2">The Villa</h2>
                <div className="space-y-8">
                  {((villaData as any).villaGroups && (villaData as any).villaGroups.length > 0) ? (
                    ((villaData as any).villaGroups as any[]).map((group: any, groupIndex: number) => {
                      if (!group.items || !Array.isArray(group.items) || group.items.length === 0) {
                        return null;
                      }
                      return (
                        <div key={`pdf-vg-${groupIndex}`}>
                          <h3 className="text-xl font-gtsuper-ds font-light text-gray-600 mb-4 uppercase">
                            {group.title || `Section ${groupIndex + 1}`}
                          </h3>
                          <ul className="space-y-2 text-gray-700 font-haas">
                            {group.items.map((item: string, itemIndex: number) => (
                              <li key={itemIndex} className="pl-4">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No room details available.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Complimentary services Section - Solo para rentals */}
      {!isRealEstate && (
      <section ref={featuresSectionRef} className="py-20 md:py-20 px-4 md:px-32">
        <div className="villa-services-tabs-live flex gap-10 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSectionTab(tab)}
              className={`text-xl font-haas pb-2 transition-all duration-200 ${
                sectionTab === tab
                  ? 'text-orange-400 font-haas border-b-2 border-orange-400'
                  : 'text-gray-400 border-b-2 border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="villa-services-live-panels bg-white border-2 border-gray-200 p-4 md:p-10 ">
          {sectionTab === 'Complimentary services' && (
            <div className="space-y-6 md:space-y-8">
              {propertyData?.classification?.includedServices &&
               Array.isArray(propertyData.classification.includedServices) &&
               propertyData.classification.includedServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-3">
                    Services included with this booking:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside">
                    {propertyData.classification.includedServices.map((service: string, index: number) => (
                      <li key={index} className="text-sm md:text-base text-[#506A70] font-haas">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {propertyData?.classification?.extraServices &&
               propertyData.classification.extraServices.trim() !== '' && (
                <div>
                  {propertyData.classification.includedServices &&
                   Array.isArray(propertyData.classification.includedServices) &&
                   propertyData.classification.includedServices.length > 0 && (
                    <h3 className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-3 mt-4">
                      Extra Included Services:
                    </h3>
                  )}
                  <ul className="space-y-2 list-disc list-inside">
                    {propertyData.classification.extraServices.split('\n').map((line: string, index: number) => (
                      line.trim() && (
                        <li key={index} className="text-sm md:text-base text-[#506A70] font-haas">
                          {line.trim()}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}

              {(villaData as any).staffAndServices && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div
                    className="text-sm md:text-base text-[#506A70] font-haas [&_h3]:text-lg [&_h3]:font-gtsuper-ds [&_h3]:font-semibold [&_h3]:text-[#172338] [&_h3]:mb-3 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:list-inside [&_li]:text-sm [&_li]:md:text-base [&_li]:text-[#506A70] [&_li]:font-haas [&_p]:text-sm [&_p]:md:text-base [&_p]:text-[#506A70] [&_p]:font-haas"
                    dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml((villaData as any).staffAndServices) }}
                  />
                </div>
              )}

              {(!propertyData?.classification?.includedServices ||
                (Array.isArray(propertyData.classification.includedServices) &&
                 propertyData.classification.includedServices.length === 0)) &&
               (!propertyData?.classification?.extraServices ||
                propertyData.classification.extraServices.trim() === '') &&
               !(villaData as any).staffAndServices && (
                <p className="text-gray-600 text-sm md:text-base leading-6">
                  Information is provided upon request.
                </p>
              )}
            </div>
          )}

          {sectionTab === 'Policies' && (
            <div className="space-y-4">
              {propertyData?.classification?.license && (
                <div className="flex items-center gap-2 text-sm md:text-base text-[#506A70] font-haas">
                  <span className="font-semibold text-[#172338]">Licence Number:</span>
                  <span>{propertyData.classification.license}</span>
                </div>
              )}
              {(villaData as any).extraInfo ? (
                <div
                  className="prose prose-sm md:prose-base max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml((villaData as any).extraInfo) }}
                />
              ) : (
                !propertyData?.classification?.license && (
                  <p className="text-gray-600 text-sm md:text-base">Important details are provided upon request.</p>
                )
              )}
            </div>
          )}
        </div>

        <div className="villa-services-pdf-only hidden" aria-hidden="true">
          <div data-pdf-export-block="true" className="bg-white border-2 border-gray-200 p-4 md:p-10">
            <h2 className="text-2xl font-gtsuper-ds font-light text-[#172338] mb-6 border-b border-orange-300 pb-2">
              Complimentary services
            </h2>
            <div className="space-y-6 md:space-y-8">
              {propertyData?.classification?.includedServices &&
               Array.isArray(propertyData.classification.includedServices) &&
               propertyData.classification.includedServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-3">
                    Services included with this booking:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside">
                    {propertyData.classification.includedServices.map((service: string, index: number) => (
                      <li key={`pdf-inc-${index}`} className="text-sm md:text-base text-[#506A70] font-haas">
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {propertyData?.classification?.extraServices &&
               propertyData.classification.extraServices.trim() !== '' && (
                <div>
                  {propertyData.classification.includedServices &&
                   Array.isArray(propertyData.classification.includedServices) &&
                   propertyData.classification.includedServices.length > 0 && (
                    <h3 className="text-lg font-gtsuper-ds font-semibold text-[#172338] mb-3 mt-4">
                      Extra Included Services:
                    </h3>
                  )}
                  <ul className="space-y-2 list-disc list-inside">
                    {propertyData.classification.extraServices.split('\n').map((line: string, index: number) => (
                      line.trim() && (
                        <li key={`pdf-ex-${index}`} className="text-sm md:text-base text-[#506A70] font-haas">
                          {line.trim()}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}

              {(villaData as any).staffAndServices && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div
                    className="text-sm md:text-base text-[#506A70] font-haas [&_h3]:text-lg [&_h3]:font-gtsuper-ds [&_h3]:font-semibold [&_h3]:text-[#172338] [&_h3]:mb-3 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:list-inside [&_li]:text-sm [&_li]:md:text-base [&_li]:text-[#506A70] [&_li]:font-haas [&_p]:text-sm [&_p]:md:text-base [&_p]:text-[#506A70] [&_p]:font-haas"
                    dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml((villaData as any).staffAndServices) }}
                  />
                </div>
              )}

              {(!propertyData?.classification?.includedServices ||
                (Array.isArray(propertyData.classification.includedServices) &&
                 propertyData.classification.includedServices.length === 0)) &&
               (!propertyData?.classification?.extraServices ||
                propertyData.classification.extraServices.trim() === '') &&
               !(villaData as any).staffAndServices && (
                <p className="text-gray-600 text-sm md:text-base leading-6">
                  Information is provided upon request.
                </p>
              )}
            </div>
          </div>

          <div data-pdf-export-block="true" className="bg-white border-2 border-gray-200 p-4 md:p-10">
            <h2 className="text-2xl font-gtsuper-ds font-light text-[#172338] mb-6 border-b border-orange-300 pb-2">
              Policies
            </h2>
            <div className="space-y-4">
              {propertyData?.classification?.license && (
                <div className="flex items-center gap-2 text-sm md:text-base text-[#506A70] font-haas">
                  <span className="font-semibold text-[#172338]">Licence Number:</span>
                  <span>{propertyData.classification.license}</span>
                </div>
              )}
              {(villaData as any).extraInfo ? (
                <div
                  className="prose prose-sm md:prose-base max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml((villaData as any).extraInfo) }}
                />
              ) : (
                !propertyData?.classification?.license && (
                  <p className="text-gray-600 text-sm md:text-base">Important details are provided upon request.</p>
                )
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Personalized itineraries and bookings section */}
      {!isRealEstate && propertyData?.personalizedItinerariesEnabled && (
      <div className="py-14 hidden min-[1330px]:block pdf-exclude-from-capture">
            <section className="w-full mb-20 bg-[#F0F3F5] min-h-[24rem] flex justify-end items-center relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-x-16">
                <div className="relative w-[36rem] h-[24rem]">
                  <img src={itineraryImages[0]} alt="" className="absolute left-0 -bottom-16 w-[414px] h-[221px] object-cover z-20" />
                  <img src={itineraryImages[1]} alt="" className="absolute -right-60 top-1/2 -translate-y-1/2 w-[500px] h-[258px] object-cover z-10" />
                  <img src={itineraryImages[2]} alt="" className="absolute left-0 -top-10 w-[386px] h-[224px] object-cover z-0" />
                </div>
              </div>
              <div className="flex flex-col justify-center h-full items-center px-8 md:px-20 w-full min-h-[24rem] min-[1550px]:ml-[875px] max-[1549px]:ml-[850px] max-[1549px]:items-start">
                <div className="text-left max-w-xl w-full">
                  <h2 className="font-gtsuper-ds font-light break-words max-w-[20ch] mb-2 text-black text-2xl md:text-4xl">Personalized Itineraries in {itineraryLocationName}</h2>
                  <p className="text-md font-haas break-words max-w-[44ch] text-black font-light">Experience luxury at its finest with our range of Concierge Packages tailored to meet your every need. Choose from our <span className="font-bold">5-star, 6-star, and 7-star packages,</span> each offering a unique blend of services to ensure an unforgettable experience.</p>
                </div>
              </div>
            </section>
            <section className="w-full mt-14 flex flex-col md:flex-row justify-between gap-10 items-stretch px-6 md:px-40 py-6">
              <div className="flex-1">
                <p className="font-gtsuper-ds font-normal text-[#D99330] text-2xl mb-4">5 STARS</p>
                <p className="break-words font-haas font-light max-w-[65ch]">Indulge in a stress-free getaway with personalized itinerary planning, VIP access, and seamless coordination of your travel needs.</p>
              </div>
              <div className="flex-1">
                <p className="font-gtsuper-ds font-normal text-[#D99330] text-2xl mb-4">6 STARS</p>
                <p className="break-words font-haas font-light max-w-[65ch]">Elevate your experience with enhanced services, including 24/7 dedicated concierge support, expedited access, and prime seating at top venues and events.</p>
              </div>
              <div className="flex-1">
                <p className="font-gtsuper-ds font-normal text-[#D99330] text-2xl mb-4">7 STARS</p>
                <p className="break-words font-haas font-light max-w-[65ch]">Reach for the sky with our most exclusive package, offering unlimited changes to your itinerary, personalized assistance throughout your stay, and access to the most coveted experiences and venues worldwide.</p>
              </div>
            </section>
            <div className="flex justify-center items-center mt-10 pb-10 pdf-exclude-from-capture">
              <button type="button" onClick={() => setVillaInquireOpen(true)} className="flex justify-center items-center gap-2 w-48 h-12 md:h-14 px-8 bg-[#28F6EA] text-[#172338] hover:bg-[#13d6cc] transition-colors">
                Contact Us <ChevronRight size={20} />
              </button>
            </div>
          </div>
      )}

      {/* Location and Distances Section - Solo para rentals (real estate usa la sección temprana de Location) */}
      {!isRealEstate && (
        <section ref={mapSectionRef} className="villa-rental-location-section py-12 -mt-10 md:py-20 px-4 md:px-32">
          <h2 className="text-2xl md:text-4xl font-gtsuper-ds font-light text-[#506A70] text-center mb-8 md:mb-12">
            LOCATION AND DISTANCES
          </h2>
          <PropertyMapWithSidePanel
            property={propertyData}
            locationSummary={villaData.location}
            title={villaData.title}
            googleMapUrl={propertyData?.googleMapUrl}
            surface="light"
          />
        </section>
      )}

      {pdfExportGalleryImages.length > 0 ? (
        <section
          className="pdf-only-property-gallery w-full bg-[#f1f5f9] px-4 py-10 md:px-16 md:py-14"
          data-pdf-export-block="true"
          aria-hidden="true"
        >
          <h2 className="mb-6 text-center font-gtsuper-ds text-2xl font-light text-[#506A70] md:mb-8 md:text-3xl">
            Gallery
          </h2>
          <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
            {pdfExportGalleryImages.map((url, index) => (
              <div
                key={`pdf-gallery-${url}-${index}`}
                className="relative aspect-[4/3] w-full overflow-hidden bg-[#e8ebef]"
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="eager"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Investment Note by Kennedy's Group */}
      {isRealEstate && propertyData?.description?.ourNote && (
        <section className="pdf-re-exclude-from-capture mt-20 px-4 md:px-32 max-w-[1600px] mx-auto">
          <div className="relative overflow-hidden border border-[#E2E8EB] bg-[#FDFCF8]">
            <div className="absolute inset-y-0 left-0 w-[3px] bg-[#D99330]" aria-hidden="true" />
            <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:gap-10 md:px-14 md:py-12">
              <div className="flex items-center gap-4 md:w-56 md:flex-shrink-0 md:flex-col md:items-start md:gap-4">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#D99330]/40 text-[#D99330]">
                  <Landmark size={18} strokeWidth={1.5} />
                </span>
                <div>
                  <p className="font-haas font-light text-[11px] tracking-[0.24em] uppercase text-[#D99330]">
                    By Kennedy&apos;s Group
                  </p>
                  <h3 className="mt-1 font-gtsuper-ds font-light text-xl text-[#172338] md:text-2xl">
                    Investment Note
                  </h3>
                </div>
              </div>
              <div
                className="villa-in-detail-description-html font-haas font-light text-[15px] leading-[1.8] text-[#506A70] md:max-w-[640px] md:border-l md:border-[#E2E8EB] md:pl-10"
                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(propertyData.description.ourNote) }}
              />
            </div>
          </div>
        </section>
      )}

      </main>
      {propertyData && (
        <VillaInquireModal
          isOpen={villaInquireOpen}
          onClose={() => setVillaInquireOpen(false)}
          property={propertyData}
          defaultCheckIn={checkIn || undefined}
          defaultCheckOut={checkOut || undefined}
          defaultGuests={
            typeof villaData.guests === "number" && villaData.guests > 0 ? villaData.guests : undefined
          }
          getNightlyPrice={getNightlyPrice}
          currencySymbol={(villaData as any).priceCurrencySymbol ?? '€ '}
        />
      )}
    </div>
  );
}

export async function getServerSideProps(context: { params?: { id?: string } }) {
  const id = context.params?.id;
  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }

  try {
    const req = (context as any).req;
    const rawHost = (req?.headers?.["x-forwarded-host"] || req?.headers?.host || "") as string;
    const host = String(rawHost || "").split(",")[0].trim();
    const protoRaw = (req?.headers?.["x-forwarded-proto"] || "") as string;
    const proto = String(protoRaw || "").split(",")[0].trim() || "https";
    const requestOrigin = host ? `${proto}://${host}`.replace(/\/+$/, "") : "";
    const siteOrigin = requestOrigin || getPublicSiteOriginFromRequest(req);
    const normalizeSegment = (value: unknown) =>
      String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    let data: any = null;
    try {
      const res = await getProperty(id);
      // fetchAPI no lanza en 404: devuelve { success: false, data: null }. Sin este guard
      // `res?.data ?? res` terminaba en el objeto de error y nunca corría el fallback por slug.
      data = res?.success === false ? null : (res?.data ?? res);
    } catch {
      data = null;
    }
    if (!data) {
      try {
        const bySlug = await getPropertyBySlug(id);
        data = bySlug?.success === false ? null : (bySlug?.data ?? bySlug);
      } catch {
        data = null;
      }
    }
    if (!data) {
      return { notFound: true };
    }

    const propertyTitle = String(data?.title ?? "").trim();
    const propertyAgentFriendlyName = String(data?.agentFriendlyName ?? "").trim();
    const propertyAgentFriendlySlug = String(data?.agentFriendlySlug ?? "").trim();
    const routeSeg = normalizeSegment(id);
    const idSeg = normalizeSegment(String(data?.id ?? ""));
    const agentNameSeg = normalizeSegment(propertyAgentFriendlyName);
    const agentSlugSeg = normalizeSegment(propertyAgentFriendlySlug);
    const enteredAsAgentFriendly =
      Boolean(routeSeg) &&
      (routeSeg === agentNameSeg || routeSeg === agentSlugSeg || (routeSeg !== idSeg && !/^[0-9a-f-]{24,}$/i.test(routeSeg)));

    // Real estate siempre expone el nombre real en el <title>, nunca el private
    // name de agent-friendly. Vacational rentals sigue priorizando ese alias.
    const isRealEstateData = isRealEstateProperty(data as Property);
    const seoTitleBase = isRealEstateData
      ? propertyTitle || propertyAgentFriendlyName || "Property"
      : enteredAsAgentFriendly && propertyAgentFriendlyName
        ? propertyAgentFriendlyName
        : propertyTitle || propertyAgentFriendlyName || "Property";
    const seoDescription = (() => {
      const fromAbout = stripHtmlToText(data?.description?.aboutDescription || "");
      if (fromAbout) return truncateMetaDescription(fromAbout, 160);
      const fromLong = stripHtmlToText(data?.description?.longDescription || "");
      if (fromLong) return truncateMetaDescription(fromLong, 160);
      const fromShort = stripHtmlToText(data?.description?.shortDescription || "");
      if (fromShort) return truncateMetaDescription(fromShort, 160);
      const fromSummary = stripHtmlToText(String(data?.summary || ""));
      if (fromSummary) return truncateMetaDescription(fromSummary, 160);
      return seoTitleBase || SITE_NAME;
    })();
    const seoMainImage =
      siteOrigin
        ? `${siteOrigin}/api/property-og-image?identifier=${encodeURIComponent(String(data?.id || id))}`
        : resolveMediaUrl(String(
            data?.images?.[0]?.urlImage ||
            data?.images?.[0]?.url ||
            data?.mainImage ||
            ""
          ));

    const suppressSiteBranding = isAgentPortfolioHost(siteOrigin);

    return {
      props: {
        initialProperty: data,
        siteOrigin,
        requestedIdentifier: id,
        initialSeoMeta: {
          title: seoTitleBase || (suppressSiteBranding ? "Property" : SITE_NAME),
          description: seoDescription,
          imageUrl: seoMainImage || null,
          suppressSiteBranding,
        },
      },
    };
  } catch (err) {
    console.error('getServerSideProps agent-property/[id]:', err);
    return { notFound: true };
  }
}
