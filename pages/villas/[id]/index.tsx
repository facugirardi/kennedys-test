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
import { GoHeart } from "react-icons/go";
import { BsShare } from "react-icons/bs";
import { Camera, LayoutGrid, ChevronLeft, ChevronRight, Calendar, CircleDollarSign, Star, FileText, MapPin, Video, ArrowRight, X, Landmark } from 'lucide-react';
import { TiDocumentText } from "react-icons/ti";
import { CiStar } from "react-icons/ci";
import { RiMapPinLine } from "react-icons/ri";
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { PagePdfExportButton } from '@/components/custom/PagePdfExportButton'
import VillaDetailSkeleton from '@/components/custom/VillaDetailSkeleton'
import VillaItem from '@/components/villa-item'
import { PropertieCard } from '@/components/custom/propertieCard'
import { getRealEstateCardExtras } from '@/lib/realEstateCard'
import { formatNightlyPriceLabel, resolveMediaUrl, formatDateRange, fetchProperties, fetchAllPropertiesListResult, formatPriceRangesToTableRows, formatCurrency, formatSingleDate, getPriceFromCurrentDate, getPriceForDateInRanges, availabilityDatesToDays, getAvailableDaysInRange, heroImageDirectUrl, joinUniqueLocationParts, getPropertyLocationLabel, getPropertyPriceCurrencySymbol, getPropertySaleListingCurrency, getRealEstateCardLocationLabel, positionStyle, backgroundPositionStyle } from '@/lib/utils';
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark';
import { getProperty, syncIcalToAvailability } from '@/lib/api/properties';
import { buildRentalDetailPath, buildRealEstateDetailPath } from '@/lib/rentalRoute';
import { getOfferBackHref } from '@/lib/offerPublicSiteUrl';
import type { Property } from '@/interfaces/property';
import usePropertyStore from '@/store/propertyStore'
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { useAuth } from '@/src/contexts/AuthContext'
import { useContact } from '@/src/contexts/ContactContext'
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext'
import { getPageBlocksData, getBlockDataForType } from '@/lib/utils/contentBlocks'
import { SeoHead } from '@/components/seo/SeoHead'
import { absoluteUrl, getPublicSiteOriginFromRequest, SITE_NAME } from '@/lib/seo/config'
import { buildPropertyJsonLd } from '@/lib/seo/propertyJsonLd'
import { stripHtmlToText, truncateMetaDescription } from '@/lib/seo/text'
import { buildPropertyDetailInitialSeoMeta } from '@/lib/seo/propertyDetailMeta'
import type { GetServerSidePropsContext } from 'next'
import { formatPoolsJacuzziSpecLine, countPoolsForRealEstateCard, getRealEstateBuildSqm, getRealEstatePlotSqm, getRealEstateBathrooms, getRealEstateYearBuilt } from '@/lib/propertyPoolCounts'
import { VillaNearbyExperiencesSection } from '@/components/custom/VillaNearbyExperiencesSection'
import { fetchVillaNearbyExperiencesPreview } from '@/lib/villaNearbyExperiences'
import { VillaInquireModal } from '@/components/villa/VillaInquireModal'
import { trackContactAgentClick } from '@/lib/utils/googleAdsConversions'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { slugifyLocation, itineraryLocationPageKey, ITINERARY_DEFAULT_IMAGES } from '@/lib/itineraryLocations'
import { formatPhotoSectionLabel } from '@/lib/photoSectionLabel'

/* Heavy components: load after first paint to speed up TTI and font rendering */
const ConciergePackagesSection = dynamic(
  () => import('@/components/ConciergePackagesSection').then((m) => m.ConciergePackagesSection),
  { ssr: false }
);
const OutdoorSpacesSection = dynamic(
  () => import('@/components/OutdoorSpacesSection').then((m) => m.OutdoorSpacesSection),
  { ssr: false }
);
const PropertyMapWithSidePanel = dynamic(
  () => import('@/components/custom/PropertyMapWithSidePanel'),
  { ssr: false }
);
const ContactForm = dynamic(
  () => import('@/components/custom/ContactForm').then((m) => m.ContactForm),
  { ssr: false }
);
const AvailabilityCalendar = dynamic(
  () => import('@/components/custom/AvailabilityCalendar'),
  { ssr: false }
);
const ImageGalleryModal = dynamic(
  () => import('@/components/custom/ImageGalleryModal'),
  { ssr: false }
);
const ImageGalleryGridModal = dynamic(
  () => import('@/components/custom/ImageGalleryGridModal'),
  { ssr: false }
);

const conciergeTypeLink = (type: string) => ({
  pathname: '/concierge/list',
  query: { type },
});

// Estructura mínima solo para claves que la página espera; sin texto mock. Si no hay datos de API no se muestra nada.
const emptyVillaStructure = {
  id: '',
  title: '',
  location: '',
  description: '',
  fullDescription: '',
  aboutDescription: '',
  detailedDescription: '' as string | null,
  outdoorTitle: null as string | null,
  outdoorDescription: null as string | null,
  bedrooms: null as number | null,
  baths: null as number | null,
  guests: null as number | null,
  pools: null as number | null,
  jacuzzis: null as number | null,
  price: '',
  pricePerNight: '',
  images: {
    hero: '/images/villa-detail@2x.png',
    bedroom: '/images/villa-detail@2x.png',
    kitchen: '/images/villa-detail@2x.png',
    living: '/images/villa-detail@2x.png',
    pool: '/images/villa-detail@2x.png',
    outdoor: '/images/villa-detail@2x.png',
    bath: '/images/villa-detail@2x.png'
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
  /** Fechas bloqueadas (property_availability_dates.date): esos días se muestran en gris en el calendario. */
  blockedDates: [] as string[],
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
  conciergePackages: { fiveStar: '', sixStar: '', sevenStar: '' },
  activities: [] as { title: string; image: string }[],
  similarVillas: [] as { id: string; title: string; location: string; bedrooms: number; guests: number; poolsSpecLabel: string; buildSize: string; plotSize: string; price: string; image: string; rental: boolean }[],
  extraInfo: undefined as string | undefined,
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

/** YYYY-MM-DD en calendario local (evita desfase vs rangos al usar toISOString/UTC). */
const formatDateInputValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatCountLabel = (value: number | string | null | undefined, singular: string, plural: string) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return singular;
  }
  return `${numeric} ${numeric === 1 ? singular : plural}`;
};

const PLACEHOLDER_IMAGE = '/images/villa-detail@2x.png';

const truncateText = (text: string, maxLength = 220) => {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}…`;
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
  const amenity = (property as any).amenity ?? {};
  const images = Array.isArray(property.images) ? property.images : [];
  const isRealEstate = isRealEstateMode;
  const priceCurrencySymbol = getPropertyPriceCurrencySymbol(property);
  const applyWatermark = shouldWatermarkImage((property as any)?.watermarkPhotos, isRealEstate ? 'real-estate' : null);
  const withWatermark = (url: string) => (applyWatermark ? watermarkedImageUrl(url) : url);

  const getImage = (index: number, fallbackPath: string) => {
    if (!images || images.length === 0 || index >= images.length) {
      return fallbackPath;
    }
    const rawUrl = (images[index] as any)?.urlImage || (images[index] as any)?.url || '';
    if (!rawUrl || rawUrl.trim() === '') {
      return fallbackPath;
    }
    // Si ya es una URL completa (http/https), usarla directamente
    if (/^https?:\/\//i.test(rawUrl)) {
      return withWatermark(rawUrl);
    }
    // Resolver con la API base URL
    const imageUrl = resolveMediaUrl(rawUrl);
    // Si resolveMediaUrl devuelve una URL válida (completa o relativa con base), usarla
    if (imageUrl && imageUrl.trim() !== '') {
      return withWatermark(imageUrl);
    }
    // Solo usar fallback si realmente no hay URL válida
    return fallbackPath;
  };

  // Get primary image (for hero): si hay una marcada como primary usarla; si no, la primera de la galería (siempre foto real)
  const getPrimaryImage = (fallbackPath: string) => {
    if (!images || images.length === 0) return fallbackPath;
    const primaryImage = images.find((img: any) => {
      const isPrimary = img.isPrimary ?? img.is_primary ?? img.primary;
      return isPrimary === true || isPrimary === 'true' || isPrimary === 1;
    });
    if (primaryImage) {
      const rawUrl = (primaryImage as any)?.urlImage ?? (primaryImage as any)?.url ?? '';
      if (rawUrl && rawUrl.trim() !== '') {
        const url = resolveMediaUrl(rawUrl);
        if (url && url.trim() !== '') return withWatermark(url);
      }
    }
    return getImage(0, fallbackPath);
  };

  // Get image by section (for highlight cards). Si no hay imagen, usa placeholder.
  const getImageBySection = (section: string, noImagePath: string) => {
    if (!images || images.length === 0) {
      return noImagePath;
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
      const rawUrl = (image as any).urlImage || (image as any).url || '';
      if (rawUrl && rawUrl.trim() !== '') {
        const url = resolveMediaUrl(rawUrl);
        if (url && url.trim() !== '') {
          return url;
        }
      }
    }
    
    return noImagePath;
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

  const priceRanges = Array.isArray((property as any).priceRanges) ? (property as any).priceRanges : (Array.isArray(property.availabilityRanges) ? property.availabilityRanges : []);
  const availabilityDates = Array.isArray((property as any).availabilityDates) ? (property as any).availabilityDates : [];
  const availabilityRanges = Array.isArray(property.availabilityRanges) ? property.availabilityRanges : [];
  const priceVisible = (property as any).price_visibility !== false;

  // Price/Night: solo tabla de precios (property_price_ranges). No disponibilidad.
  const rawPricing = isRealEstate
    ? [{
        dates: 'Sale price',
        price: formatCurrency((property as any).sale_price, priceCurrencySymbol),
        minStay: 'N/A'
      }]
    : formatPriceRangesToTableRows(priceRanges, priceCurrencySymbol);
  const pricing = priceVisible ? rawPricing : rawPricing.map((p: { dates: string; price: string; minStay: string }) => ({ ...p, price: 'Price on request' }));

  // availabilityDates from API = BLOCKED (occupied) dates. Available = all days from today minus blocked; past = grey/unavailable
  const todayStr = new Date().toISOString().split('T')[0];
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const oneYearLaterStr = oneYearLater.toISOString().split('T')[0];
  const availableDays = availabilityDates.length >= 0
    ? getAvailableDaysInRange(todayStr, oneYearLaterStr, availabilityDates, todayStr)
    : [];
  // Disponibilidad: solo días disponibles (no bloqueados, ≥ hoy). Formato con .date para el calendario.
  const rawAvailability = isRealEstate
    ? []
    : availableDays.length
      ? availabilityDatesToDays(availableDays, priceRanges, formatSingleDate, (n: number) => formatCurrency(n, priceCurrencySymbol))
      : [];
  const availability = priceVisible ? rawAvailability : rawAvailability.map((a: { date: string; dateFormatted: string; price: string }) => ({ ...a, price: 'Price on request' }));

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
  const livingAreaSqm = (classification as any).livingArea ?? indoorArea;
  const totalSurfaceSqm = (classification as any).totalSurface ?? outdoorArea;

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

  // Services options used in Loggia (merged into indoor amenities there).
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
    ? (property.description?.aboutDescription ||
       property.description?.detiledDescription ||
       '')
    : (property.description?.longDescription ||
       property.summary ||
       property.description?.shortDescription ||
       property.description?.caption ||
       '');

  // Sin fallbacks de texto: si no hay datos de API no se muestra nada
  // Para real estate no truncar — el HTML se recorta visualmente con line-clamp en el render
  const heroDescription = baseDescription;
  const emptyImages = emptyVillaStructure.images;

  return {
    ...emptyVillaStructure,
    id: property.id,
    title: property.title || property.alternativeTitle || '',
    location: getPropertyLocationLabel(property),
    description: heroDescription || '',
    fullDescription: baseDescription || '',
    bedrooms: classification.bedrooms ?? null,
    baths: classification.baths ?? null,
    guests: property.guests ?? classification.idealPersons ?? classification.maxPersons ?? null,
    // Pools y jacuzzis por separado: classification.pools tiene items con type 'pool' | 'jacuzzi' y cant
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
    price: basePrice,
    priceCurrencySymbol,
    pricePerNight: isRealEstate
      ? basePrice
      : basePrice === 'Price upon request'
        ? basePrice
        : `${basePrice} / Night`,
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
    outdoorTitle: property.description?.outdoorTitle !== undefined
      ? (property.description.outdoorTitle || null)
      : null,
    outdoorDescription: property.description?.outdoorDescription !== undefined
      ? (property.description.outdoorDescription || null)
      : null,
    outdoorImage: property.description?.outdoorImage || null,
    pricing,
    availability,
    /** Fechas en property_availability_dates.date: no disponibles, se muestran en gris en el calendario. */
    blockedDates: availabilityDates.map((d: string) => String(d).trim().slice(0, 10)).filter((s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)),
    type: (classification as any).type || (classification as any).objectType || property.type || undefined,
    condition: (classification as any).condition || property.propertyStatus || undefined,
    general: {
      bedrooms: classification.bedrooms ?? null,
      sleeps: property.guests ?? classification.idealPersons ?? classification.maxPersons ?? null,
      baths: classification.baths ?? null,
      propertySize: livingAreaSqm != null && livingAreaSqm !== '' ? `${livingAreaSqm} sqm` : null,
      landSize: totalSurfaceSqm != null && totalSurfaceSqm !== '' ? `${totalSurfaceSqm} sqm` : null,
      plotSize: (classification as any).plotArea != null && (classification as any).plotArea !== '' ? `${(classification as any).plotArea} sqm` : null
    },
    accommodations: accommodations,
    facilities: facilities,
    indoorFacilities: indoorFacilities,
    outdoorFacilities: outdoorFacilities,
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
    // termsAndConditions: (property as any).termsAndConditions || undefined, // Campo no existe en modelo aún
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

/** "New Construction" tag on propertyStatus is the only signal we have for condition — there's
 * no dedicated new-build/resale field on the model (see Loggia's realEstatePropertyStatusOptions). */
const isNewConstructionStatus = (propertyStatus: unknown): boolean =>
  String(propertyStatus || '')
    .split(',')
    .some((tag) => tag.trim().toLowerCase() === 'new construction');

/** First non-empty area token for a property, same precedence used to pick the location to search similar properties by. */
const primaryAreaToken = (item: any): string => {
  const raw = item?.region || item?.location || item?.visibleLocation || item?.area || '';
  return typeof raw === 'string' ? raw.split(/[-,]/)[0].trim().toLowerCase() : '';
};

const propertyBuildSqm = (item: any): number => {
  const value = Number(item?.classification?.livingArea ?? item?.classification?.indoorArea);
  return Number.isFinite(value) && value > 0 ? value : NaN;
};

/**
 * Ranks real estate candidates by similarity to `current`, most similar first — Price is the
 * dominant factor, then same Area, then closeness in sqm, then matching Condition (new build vs
 * old). Weights are spaced an order of magnitude apart so a factor only breaks ties left by the
 * factors above it, instead of a small sqm difference outweighing a large price gap.
 */
const rankSimilarRealEstateProperties = (current: any, candidates: any[]): any[] => {
  const currentPrice = Number(current?.sale_price);
  const currentArea = primaryAreaToken(current);
  const currentSqm = propertyBuildSqm(current);
  const currentIsNewBuild = isNewConstructionStatus(current?.propertyStatus);

  const scored = candidates.map((item) => {
    const price = Number(item?.sale_price);
    const priceDiff =
      Number.isFinite(currentPrice) && currentPrice > 0 && Number.isFinite(price) && price >= 0
        ? Math.abs(price - currentPrice) / currentPrice
        : 1; // unknown price: treat as maximally dissimilar on this axis, not free to rank first

    const areaDiff = currentArea && primaryAreaToken(item) === currentArea ? 0 : 1;

    const itemSqm = propertyBuildSqm(item);
    const sqmDiff =
      Number.isFinite(currentSqm) && Number.isFinite(itemSqm) && currentSqm > 0
        ? Math.abs(itemSqm - currentSqm) / currentSqm
        : 0.5; // unknown sqm on either side: neutral, doesn't dominate the ranking

    const conditionDiff = isNewConstructionStatus(item?.propertyStatus) === currentIsNewBuild ? 0 : 1;

    const score = priceDiff * 1000 + areaDiff * 100 + sqmDiff * 10 + conditionDiff;
    return { item, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored.map((s) => s.item);
};

function pickPropertySeoMeta(p: Property | null | undefined): {
  metaTitle: string | null;
  metaDescription: string | null;
} {
  if (!p) return { metaTitle: null, metaDescription: null };
  const raw = p as Record<string, unknown>;
  const mt = raw.metaTitle ?? raw.meta_title;
  const md = raw.metaDescription ?? raw.meta_description;
  return {
    metaTitle: typeof mt === 'string' && mt.trim() ? mt.trim() : null,
    metaDescription: typeof md === 'string' && md.trim() ? md.trim() : null,
  };
}

type VillaDetailsPageProps = {
  initialProperty?: Property | null;
  initialPageBlocks?: any[];
  initialVillaNearby?: Awaited<ReturnType<typeof fetchVillaNearbyExperiencesPreview>> | null;
  /** Public site origin for absolute Open Graph / Twitter URLs (link previews). */
  siteOrigin?: string;
  /** When `real-estate`, renders sale layout (hero + contact card, no rental booking UI). */
  detailVariant?: 'rental' | 'real-estate';
  /** Populated in GSSP for `_app` OG/Twitter tags (same pattern as agent-property). */
  initialSeoMeta?: {
    title: string;
    description: string;
    imageUrl?: string | null;
  };
};

export default function VillaDetailsPage({
  initialProperty = null,
  initialPageBlocks = [],
  initialVillaNearby = null,
  siteOrigin = '',
  detailVariant = 'rental',
  initialSeoMeta,
}: VillaDetailsPageProps) {
  const router = useRouter();
  const isAgentPortfolioSite = useAgentPortfolioSite();
  const isRealEstate = detailVariant === 'real-estate';
  const offerBackHref = getOfferBackHref(router.query);
  const [villaData, setVillaData] = useState(() =>
    initialProperty ? mapPropertyToView(initialProperty as Property, isRealEstate) : emptyVillaStructure
  );
  const [propertyData, setPropertyData] = useState<Property | null>(initialProperty ?? null);
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
  const hideNearbyExperiences = Boolean(
    ((propertyData ?? initialProperty) as any)?.description?.theVilla?.hideNearbyExperiences
  );
  const [isLoading, setIsLoading] = useState(!initialProperty);
  const [pageBlocks, setPageBlocks] = useState<any[]>(initialPageBlocks ?? []);
  const [error, setError] = useState<string | null>(null);
  const [similarVillas, setSimilarVillas] = useState<Array<{
    id: string;
    title: string;
    location: string;
    bedrooms: number;
    guests: number;
    poolsSpecLabel: string;
    buildSize: string;
    plotSize: string;
    price: string;
    image: string;
    rental?: boolean;
    raw?: any;
  }>>(emptyVillaStructure.similarVillas);
  const [activeTab, setActiveTab] = useState<'prices' | 'availability'>('prices');
  const [sectionTab, setSectionTab] = useState('Complimentary services');
  const [icalendarURL, setIcalendarURL] = useState<string | null>(initialProperty?.icalendarURL ?? null);
  const [availabilityRanges, setAvailabilityRanges] = useState<any[]>(() => {
    if (!initialProperty) return [];
    const transformed = mapPropertyToView(initialProperty as Property, detailVariant === 'real-estate');
    const av = (transformed as any)?.availability;
    if (Array.isArray(av) && av.length > 0) {
      return av.map((d: { date: string }) => ({ from: d.date, to: d.date, is_available: true }));
    }
    const p = initialProperty as Property;
    return Array.isArray(p.availabilityRanges) ? p.availabilityRanges : Array.isArray((p as any).availabilityRanges) ? (p as any).availabilityRanges : [];
  });
  const villaPricePdfRows = useMemo(
    () =>
      villaData?.pricing && Array.isArray(villaData.pricing)
        ? (villaData.pricing as Array<{ dates: string; price: string; minStay: string }>)
        : [],
    [villaData]
  );
  const buildInitialImagePairs = () => {
    if (!initialProperty || !Array.isArray(initialProperty.images)) return [];
    return initialProperty.images
      .map((img: any) => {
        const rawUrl = img?.urlImage || img?.url || '';
        if (!rawUrl || rawUrl.trim() === '') return null;
        // Si ya es URL completa, usarla directamente
        const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : resolveMediaUrl(rawUrl);
        if (!url || url.trim() === '') return null;
        return { url, position: img?.position ?? null };
      })
      .filter((pair: { url: string; position: string | null } | null): pair is { url: string; position: string | null } => pair !== null);
  };
  const [allPropertyImages, setAllPropertyImages] = useState<string[]>(() => {
    const pairs = buildInitialImagePairs();
    if (pairs.length > 0) return pairs.map((p) => p.url);
    const transformed = mapPropertyToView(initialProperty as Property, detailVariant === 'real-estate');
    return [transformed.images.hero];
  });
  const [allPropertyImagePositions, setAllPropertyImagePositions] = useState<(string | null)[]>(() => {
    const pairs = buildInitialImagePairs();
    return pairs.length > 0 ? pairs.map((p) => p.position) : [null];
  });
  const [allPropertyImagesWithSection, setAllPropertyImagesWithSection] = useState<Array<{ url: string; section: string; order?: number; isPrimary?: boolean; position?: string | null }>>([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isGalleryGridModalOpen, setIsGalleryGridModalOpen] = useState(false);
  const [galleryGridModalFilter, setGalleryGridModalFilter] = useState<'all' | 'videos'>('all');
  const [galleryModalIndex, setGalleryModalIndex] = useState(0);
  const setSelectedProperty = usePropertyStore((state: any) => state.setSelectedProperty);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [offerNightlyPrice, setOfferNightlyPrice] = useState<number | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [isPlanCalendarOpen, setIsPlanCalendarOpen] = useState(false);
  const [planCalendarMonth, setPlanCalendarMonth] = useState(() => new Date());
  const [planHoverDate, setPlanHoverDate] = useState<Date | null>(null);
  const [planUnavailableMsg, setPlanUnavailableMsg] = useState<string | null>(null);
  const planCalendarRef = useRef<HTMLDivElement | null>(null);

  const planIsSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const planGetCalendarDays = (year: number, month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const planTodayMidnight = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();

  const planHandleDayClick = (day: Date) => {
    if (day < planTodayMidnight) {
      setPlanUnavailableMsg('Past dates are not available.');
      setTimeout(() => setPlanUnavailableMsg(null), 2000);
      return;
    }
    const dayStr = formatDateInputValue(day);
    if (!isDateAvailable(dayStr)) {
      setPlanUnavailableMsg('This date is not available.');
      setTimeout(() => setPlanUnavailableMsg(null), 2000);
      return;
    }
    setPlanUnavailableMsg(null);
    const start = checkIn ? new Date(checkIn + 'T00:00:00') : null;
    const end = checkOut ? new Date(checkOut + 'T00:00:00') : null;
    if (!start || (start && end)) {
      setCheckIn(dayStr);
      setCheckOut('');
      setPlanError(null);
    } else {
      if (day < start) {
        setCheckIn(dayStr);
        setCheckOut('');
      } else if (planIsSameDay(day, start)) {
        setCheckIn('');
        setCheckOut('');
      } else {
        if (!isDateAvailable(dayStr)) {
          setPlanUnavailableMsg('This date is not available.');
          setTimeout(() => setPlanUnavailableMsg(null), 2000);
          return;
        }
        setCheckOut(dayStr);
        setPlanError(null);
        setTimeout(() => setIsPlanCalendarOpen(false), 120);
      }
    }
  };
  const [guests, setGuests] = useState(1);
  const [villaInquireOpen, setVillaInquireOpen] = useState(false);
  const maxGuests = Math.max(1, villaData?.guests ?? 10);
  const { isAuthenticated } = useAuth();
  const { openContactForm, setPropertyTitle, setPropertyPrice } = useContact();
  const [isInDetailExpanded, setIsInDetailExpanded] = useState(false);
  const [isReDescExpanded, setIsReDescExpanded] = useState(false);
  const shouldShowReDescToggle = useMemo(() => {
    const full = (villaData as any).fullDescription || villaData.description || '';
    const plain = stripHtmlToText(full).replace(/\s+/g, ' ').trim();
    return plain.length > 400;
  }, [(villaData as any).fullDescription, villaData.description]);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [expandedColumns, setExpandedColumns] = useState<Set<number>>(new Set());
  const {
    isLiked,
    toggleFavorite,
    pendingIds,
    error: likesError,
    clearError: clearLikesError,
  } = usePropertyLikes();
  const handleToggleFavorite = (id: string) => {
    if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; }
    toggleFavorite(id);
  };
  const currentPropertyId = villaData?.id;
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

  const heroSectionRef = useRef<HTMLElement | null>(null);
  const photosSectionRef = useRef<HTMLDivElement | null>(null);
  const detailsSectionRef = useRef<HTMLDivElement | null>(null);
  const featuresSectionRef = useRef<HTMLElement | null>(null);
  const pricesSectionRef = useRef<HTMLDivElement | null>(null);
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const bookingWidgetRef = useRef<HTMLDivElement | null>(null);
  const pdfExportRootRef = useRef<HTMLElement | null>(null);
  const [showStickyNav, setShowStickyNav] = useState(false);
  const [bookingWidgetHeight, setBookingWidgetHeight] = useState<number>(0);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  // Navbar is fixed on mobile (stays visible while scrolling); the rental sticky Inquire bar
  // below needs to sit under it instead of at top:0, or they'd overlap.
  const [navbarHeight, setNavbarHeight] = useState(0);
  const handleNavbarHeightChange = useCallback((h: number) => setNavbarHeight(h), []);

  // Custom check-in/check-out pickers for the sticky bar — replaces native
  // <input type="date"> because Firefox ignores lang="en" for its native
  // widget (shows dd/mm/aaaa in the browser locale) and always renders its
  // own calendar icon regardless of ::-webkit-calendar-picker-indicator.
  const [stickyCheckInOpen, setStickyCheckInOpen] = useState(false);
  const [stickyCheckOutOpen, setStickyCheckOutOpen] = useState(false);
  const [stickyCheckInMonth, setStickyCheckInMonth] = useState(() => new Date());
  const [stickyCheckOutMonth, setStickyCheckOutMonth] = useState(() => new Date());
  const stickyCheckInRef = useRef<HTMLDivElement | null>(null);
  const stickyCheckOutRef = useRef<HTMLDivElement | null>(null);

  const scrollToDetailSection = (ref: RefObject<HTMLElement | null>) => {
    if (typeof window === 'undefined') return;
    const element = ref.current;
    if (!element) return;
    const offset = 100;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const handleContactClick = () => {
    if (isAgentPortfolioSite) return;
    trackContactAgentClick();
    if (isRealEstate) {
      openContactForm('REAL_ESTATE', {
        propertyTitle: villaData?.title || null,
        propertyPrice: villaData?.price || null,
        propertyImage: heroImageDirectUrl(villaData?.images?.hero) || null,
      });
      return;
    }
    const propertyName = villaData?.title;
    const msg = `Hello, I'm interested in the property${propertyName ? ` ${propertyName}` : ''}.`;
    window.open(`https://wa.me/306972152778?text=${encodeURIComponent(msg)}`, '_blank');
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

  // Hydrate state from SSR data (so we don't refetch on first paint)
  useEffect(() => {
    if (!initialProperty || !router.isReady) return;

    const propertyData = initialProperty as Property;
    const transformed = mapPropertyToView(propertyData, isRealEstate);
    setVillaData(transformed as any);
    setPropertyData(propertyData);
    setIcalendarURL(propertyData?.icalendarURL || null);
    // availabilityRanges = días disponibles (para calendario y formulario), no tabla de precios
    const availableAsRanges = (transformed as any)?.availability?.length
      ? (transformed as any).availability.map((d: { date: string }) => ({ from: d.date, to: d.date, is_available: true }))
      : [];
    setAvailabilityRanges(availableAsRanges);
    setPageBlocks(initialPageBlocks ?? []);

    const images = Array.isArray(propertyData.images) ? propertyData.images : [];
    const applyWatermarkToImages = shouldWatermarkImage(
      (propertyData as any)?.watermarkPhotos,
      isRealEstate ? 'real-estate' : null
    );
    const allImagePairs = images
      .map((img: any) => {
        const rawUrl = img?.urlImage || img?.url || '';
        if (!rawUrl || rawUrl.trim() === '') return null;
        // Si ya es URL completa, usarla directamente
        const resolved = /^https?:\/\//i.test(rawUrl) ? rawUrl : resolveMediaUrl(rawUrl);
        if (!resolved || resolved.trim() === '') return null;
        const url = applyWatermarkToImages ? watermarkedImageUrl(resolved) : resolved;
        return { url, position: img?.position ?? null };
      })
      .filter((pair: { url: string; position: string | null } | null): pair is { url: string; position: string | null } => pair !== null);
    setAllPropertyImages(allImagePairs.length > 0 ? allImagePairs.map((p) => p.url) : [transformed.images.hero]);
    setAllPropertyImagePositions(allImagePairs.length > 0 ? allImagePairs.map((p) => p.position) : [null]);

    const imagesWithSection = images
      .filter((img: any) => {
        const section = img?.section;
        const sectionLower = (section || '').toLowerCase().trim();
        const excludedSections = ['gallery', 'general', 'property_gallery', ''];
        return section && typeof section === 'string' && section.trim() !== '' && !excludedSections.includes(sectionLower);
      })
      .map((img: any) => {
        const rawUrl = img?.urlImage || img?.url || '';
        let resolvedUrl = '';
        if (rawUrl && rawUrl.trim() !== '') {
          // Si ya es URL completa, usarla directamente
          if (/^https?:\/\//i.test(rawUrl)) {
            resolvedUrl = rawUrl;
          } else {
            // Resolver con API base URL
            resolvedUrl = resolveMediaUrl(rawUrl) || '';
          }
        }
        return {
          url: resolvedUrl,
          section: img.section,
          order: img.order ?? 0,
          isPrimary: img.isPrimary ?? false,
          position: img.position ?? null
        };
      })
      .filter((img: any) => img.url && img.url.trim() !== '')
      .sort((a: any, b: any) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return (a.order ?? 0) - (b.order ?? 0);
      })
      .slice(0, 4);
    setAllPropertyImagesWithSection(imagesWithSection);
    setSelectedProperty(propertyData);
    setIsLoading(false);
  }, [initialProperty, initialPageBlocks, router.isReady, router.query.id, router.pathname, isRealEstate]);

  useEffect(() => {
    setIsInDetailExpanded(false);
  }, [villaData?.id]);

  useEffect(() => {
    setPropertyTitle(villaData?.title || null);
    return () => setPropertyTitle(null);
  }, [villaData?.title, setPropertyTitle]);

  useEffect(() => {
    setPropertyPrice(villaData?.price || null);
    return () => setPropertyPrice(null);
  }, [villaData?.price, setPropertyPrice]);

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

  const sanitizedInDetailDescriptionHtml = useMemo(() => {
    const html = villaData?.detailedDescription || '';
    // Remove any CMS-provided "View more" control to avoid duplicates.
    return html
      .replace(/<a\b[^>]*>[\s\S]*?view\s*more[\s\S]*?<\/a>/gi, '')
      .replace(/<button\b[^>]*>[\s\S]*?view\s*more[\s\S]*?<\/button>/gi, '')
      .replace(/\bview\s*more\b/gi, '');
  }, [villaData?.detailedDescription]);

  const inDetailDescriptionPlainTextLength = useMemo(() => {
    const html = sanitizedInDetailDescriptionHtml || '';
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim().length;
  }, [sanitizedInDetailDescriptionHtml]);

  const shouldShowInDetailViewMore = inDetailDescriptionPlainTextLength > 550;

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

  // Load "Similar Villas" even when details came from SSR (client fetch is skipped)
  useEffect(() => {
    if (!router.isReady) return;
    if (!propertyData?.id) return;

    let cancelled = false;

    (async () => {
      const similarLocationRaw =
        (propertyData as any)?.region ||
        (propertyData as any)?.location ||
        (propertyData as any)?.visibleLocation ||
        (propertyData as any)?.area ||
        undefined;
      const similarLocation =
        typeof similarLocationRaw === 'string' && similarLocationRaw.trim() !== ''
          ? similarLocationRaw.split(/[-,]/)[0].trim()
          : undefined;

      const sliceCount = 3;

      const normalizeSimilarItems = (items: any[]) =>
        (Array.isArray(items) ? items : [])
          .filter((item: any) => item?.id && item.id !== (propertyData as any)?.id)
          .slice(0, sliceCount)
          .map((item: any) => {
            const isSimilarRealEstate = isRealEstate;
            const sale = (item as any).sale_price;
            const price = (item as any).price_visibility === false
              ? 'Price on request'
              : isSimilarRealEstate
                ? (sale != null && sale !== '' && Number.isFinite(Number(sale))
                    ? formatCurrency(sale, getPropertyPriceCurrencySymbol(item))
                    : 'Price upon request')
                : formatNightlyPriceLabel(item.price_per_night, getPropertyPriceCurrencySymbol(item));
            return {
              id: item.id,
              title: item.title || (isSimilarRealEstate ? 'Property' : 'Villa'),
              // Real estate similar-properties cards show Country, Area, Location like the real
              // estate list page's cards (getRealEstateCardLocationLabel) — rentals keep the
              // deduped single-line format.
              location: isSimilarRealEstate
                ? getRealEstateCardLocationLabel(item) || 'Location upon request'
                : joinUniqueLocationParts(item.visibleLocation, item.location, item.country) || 'Location upon request',
              bedrooms: item.classification?.bedrooms ?? 0,
              guests: isSimilarRealEstate ? 0 : (item.classification?.idealPersons ?? item.classification?.maxPersons ?? 0),
              poolsSpecLabel: formatPoolsJacuzziSpecLine(item.classification),
              buildSize: (() => {
                const build = Number(item.classification?.livingArea ?? item.classification?.indoorArea);
                return Number.isFinite(build) && build > 0 ? `${build} sqm` : '';
              })(),
              plotSize: (() => {
                const plot = Number((item as any).classification?.plotArea);
                return Number.isFinite(plot) && plot > 0 ? `${plot} sqm` : '';
              })(),
              price,
              image: (() => {
                if (!item.images || !Array.isArray(item.images) || item.images.length === 0) return PLACEHOLDER_IMAGE;
                const rawUrl = item.images[0]?.urlImage || item.images[0]?.url || '';
                if (!rawUrl || rawUrl.trim() === '') return PLACEHOLDER_IMAGE;
                if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
                const imageUrl = resolveMediaUrl(rawUrl);
                return imageUrl && imageUrl.trim() !== '' ? imageUrl : PLACEHOLDER_IMAGE;
              })(),
              rental: !isSimilarRealEstate,
              raw: item,
            };
          });

      try {
        let normalizedSimilar: ReturnType<typeof normalizeSimilarItems>;

        if (isRealEstate) {
          // Similarity (price, then area, then sqm, then condition) is computed client-side by
          // rankSimilarRealEstateProperties against the whole published catalog — a fixed-size
          // "take N" sample would only ever offer the N most recently created listings as
          // candidates, which biases away from genuinely similar older properties. No location
          // pre-filter either: same-area is one of several ranking factors now, not a hard
          // requirement with a "show random ones" fallback when it finds nothing.
          const candidates = await fetchAllPropertiesListResult({ rental: false, category: 'real-estate' });
          const ranked = rankSimilarRealEstateProperties(propertyData, candidates);
          normalizedSimilar = normalizeSimilarItems(ranked);
        } else {
          const similarResponse = await fetchProperties({
            location: similarLocation,
            rental: true,
            category: undefined,
            take: 12,
            random: !similarLocation,
          });
          normalizedSimilar = normalizeSimilarItems(similarResponse);

          if (normalizedSimilar.length === 0) {
            const randomResponse = await fetchProperties({ rental: true, category: undefined, take: 12, random: true });
            normalizedSimilar = normalizeSimilarItems(randomResponse);
          }
        }

        if (!cancelled) {
          setSimilarVillas(normalizedSimilar);
        }
      } catch {
        /* similar villas: optional enhancement; ignore fetch errors */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, router.pathname, propertyData?.id, isRealEstate]);

  useEffect(() => {
    if (!router.isReady) return;
    const propertyId = router.query.id;

    if (!propertyId || typeof propertyId !== 'string') {
      setError('Villa not found.');
      setIsLoading(false);
      return;
    }

    // If we have SSR data, skip client fetch (already hydrated above)
    if (initialProperty?.id) {
      return;
    }

    let isMounted = true;

    const loadProperty = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await getProperty(propertyId);
        const data = res?.data || res;

        if (!isMounted) {
          return;
        }

        if (!data) {
          setError('Villa not found.');
          setIsLoading(false);
          return;
        }

        const propertyData = data as Property;
        const transformed = mapPropertyToView(propertyData, isRealEstate);
        setVillaData(transformed as any);
        setPropertyData(propertyData);
        setIcalendarURL(propertyData?.icalendarURL || null);
        // availabilityRanges = días disponibles (para calendario y formulario), no tabla de precios
        const availableAsRanges = (transformed as any)?.availability?.length
          ? (transformed as any).availability.map((d: { date: string }) => ({ from: d.date, to: d.date, is_available: true }))
          : [];
        setAvailabilityRanges(availableAsRanges);
        // Datos que dependen únicamente de la propiedad: cargar en paralelo
        const images = Array.isArray(propertyData.images) ? propertyData.images : [];

        const similarLocationRaw =
          propertyData?.region ||
          propertyData?.location ||
          propertyData?.visibleLocation ||
          (propertyData as any)?.area ||
          undefined;
        const similarLocation =
          typeof similarLocationRaw === 'string' && similarLocationRaw.trim() !== ''
            ? similarLocationRaw.split(/[-,]/)[0].trim()
            : undefined;

        // Real estate fetches the whole published catalog (no location pre-filter, no "take N"
        // recency sample) because similarity — price, then area, then sqm, then condition — is
        // ranked client-side afterwards by rankSimilarRealEstateProperties; rentals keep the
        // location-first + random fallback.
        const [blocks, similarResponse] = await Promise.all([
          getPageBlocksData('villa-detail'),
          (isRealEstate
            ? fetchAllPropertiesListResult({ rental: false, category: 'real-estate' })
            : fetchProperties({
                location: similarLocation,
                rental: true,
                category: undefined,
                take: 12,
                random: !similarLocation,
              })
          ).catch((similarErr) => {
            console.error('Failed to load similar villas', similarErr);
            return null;
          }),
        ]);

        if (!isMounted) return;

        setPageBlocks(blocks);

        // Get ALL images from the property
        const applyWatermarkToImages = shouldWatermarkImage(
          (propertyData as any)?.watermarkPhotos,
          isRealEstate ? 'real-estate' : null
        );
        const allImagePairs = images
          .map((img: any) => {
            const rawUrl = img?.urlImage || img?.url || '';
            if (!rawUrl || rawUrl.trim() === '') return null;
            // Si ya es URL completa, usarla directamente
            const resolved = /^https?:\/\//i.test(rawUrl) ? rawUrl : resolveMediaUrl(rawUrl);
            if (!resolved || resolved.trim() === '') return null;
            const url = applyWatermarkToImages ? watermarkedImageUrl(resolved) : resolved;
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
            const rawUrl = img?.urlImage || img?.url || '';
            let resolvedUrl = '';
            if (rawUrl && rawUrl.trim() !== '') {
              // Si ya es URL completa, usarla directamente
              if (/^https?:\/\//i.test(rawUrl)) {
                resolvedUrl = rawUrl;
              } else {
                // Resolver con API base URL
                resolvedUrl = resolveMediaUrl(rawUrl) || '';
              }
            }
            return {
              url: resolvedUrl,
              section: img.section,
              order: img.order ?? 0,
              isPrimary: img.isPrimary ?? false,
              position: img.position ?? null
            };
          })
          .filter((img: any) => img.url && img.url.trim() !== '')
          .sort((a, b) => {
            // Primero por isPrimary, luego por order
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return (a.order ?? 0) - (b.order ?? 0);
          })
          .slice(0, 4); // Tomar solo las primeras 4

        setAllPropertyImagesWithSection(imagesWithSection);

        const similarSlice = 3;
        const normalizeSimilarItems = (items: any[]) =>
          (Array.isArray(items) ? items : [])
            .filter((item: any) => item?.id && item.id !== data.id)
            .slice(0, similarSlice)
            .map((item: any) => {
              const isSimilarRealEstate = isRealEstate;
              const sale = (item as any).sale_price;
              const price = (item as any).price_visibility === false
                ? 'Price on request'
                : isSimilarRealEstate
                  ? (sale != null && sale !== '' && Number.isFinite(Number(sale))
                      ? formatCurrency(sale, getPropertyPriceCurrencySymbol(item))
                      : 'Price upon request')
                  : formatNightlyPriceLabel(item.price_per_night, getPropertyPriceCurrencySymbol(item));
              return {
                id: item.id,
                title: item.title || (isSimilarRealEstate ? 'Property' : 'Villa'),
                // Real estate similar-properties cards show Country, Area, Location like the real
                // estate list page's cards (getRealEstateCardLocationLabel) — rentals keep the
                // deduped single-line format.
                location: isSimilarRealEstate
                  ? getRealEstateCardLocationLabel(item) || 'Location upon request'
                  : joinUniqueLocationParts(item.visibleLocation, item.location, item.country) || 'Location upon request',
                bedrooms: item.classification?.bedrooms ?? 0,
                guests: isSimilarRealEstate ? 0 : (item.classification?.idealPersons ?? item.classification?.maxPersons ?? 0),
                poolsSpecLabel: formatPoolsJacuzziSpecLine(item.classification),
                buildSize: (() => {
                  const build = Number(item.classification?.livingArea ?? item.classification?.indoorArea);
                  return Number.isFinite(build) && build > 0 ? `${build} sqm` : '';
                })(),
                plotSize: (() => {
                  const plot = Number((item as any).classification?.plotArea);
                  return Number.isFinite(plot) && plot > 0 ? `${plot} sqm` : '';
                })(),
                price,
                image: (() => {
                  if (!item.images || !Array.isArray(item.images) || item.images.length === 0) {
                    return PLACEHOLDER_IMAGE;
                  }
                  const rawUrl = item.images[0]?.urlImage || item.images[0]?.url || '';
                  if (!rawUrl || rawUrl.trim() === '') {
                    return PLACEHOLDER_IMAGE;
                  }
                  // Si ya es URL completa, usarla directamente
                  if (/^https?:\/\//i.test(rawUrl)) {
                    return rawUrl;
                  }
                  // Resolver con API base URL
                  const imageUrl = resolveMediaUrl(rawUrl);
                  return imageUrl && imageUrl.trim() !== '' ? imageUrl : PLACEHOLDER_IMAGE;
                })(),
                rental: !isSimilarRealEstate
              };
            });

        // Similar villas (from backend)
        const candidatePool = Array.isArray(similarResponse) ? similarResponse : [];
        let normalizedSimilar = normalizeSimilarItems(
          isRealEstate ? rankSimilarRealEstateProperties(propertyData, candidatePool) : candidatePool
        );

        // Fallback: if no results for location, show random ones (rentals only — real estate's
        // broad, unfiltered pool above only comes up empty if there's truly nothing to show).
        if (normalizedSimilar.length === 0 && !isRealEstate) {
          const randomResponse = await fetchProperties({ rental: true, category: undefined, take: 12, random: true });
          normalizedSimilar = normalizeSimilarItems(randomResponse);
        }

        if (isMounted) {
          setSimilarVillas((prev) => (prev?.length ? prev : normalizedSimilar));
          setSelectedProperty(propertyData);
        }
      } catch (err) {
        console.error('Failed to load villa details', err);
        if (isMounted) {
          setError('We could not load this villa. Please try again later.');
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
  }, [router.isReady, router.query.id, initialProperty?.id, isRealEstate]);

  // Auto-sync iCal al abrir el detalle y recargar propiedad para que calendarios y Plan your trip vean bloqueos actualizados
  useEffect(() => {
    const pid = (propertyData?.id || villaData?.id || initialProperty?.id) as string | undefined;
    if (!router.isReady || !pid || !icalendarURL || isRealEstate) return;
    let cancelled = false;
    (async () => {
      try {
        await syncIcalToAvailability(pid);
        if (cancelled) return;
        const res = await getProperty(pid);
        const data = res?.data || res;
        if (cancelled || !data) return;
        const next = data as Property;
        const transformed = mapPropertyToView(next, isRealEstate);
        setPropertyData(next);
        setVillaData(transformed as any);
        const av = (transformed as any)?.availability;
        if (Array.isArray(av) && av.length > 0) {
          setAvailabilityRanges(av.map((d: { date: string }) => ({ from: d.date, to: d.date, is_available: true })));
        } else {
          setAvailabilityRanges(Array.isArray(next.availabilityRanges) ? next.availabilityRanges : []);
        }
      } catch (_) {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router.isReady, propertyData?.id, villaData?.id, initialProperty?.id, icalendarURL, isRealEstate]);

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

    if (effectiveCheckIn) {
      setCheckIn(effectiveCheckIn);
    }
    if (effectiveCheckOut) {
      setCheckOut(effectiveCheckOut);
    }

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

  // Tab de prices eliminado - solo se muestra availability

  /** Noches bloqueadas en API (property_availability_dates con blocked=true). */
  const blockedNightsFromApi = useMemo(() => {
    const set = new Set<string>();
    const raw = (propertyData as any)?.availabilityDates;
    if (!Array.isArray(raw)) return set;
    raw.forEach((d: unknown) => {
      const s = String(d ?? '')
        .trim()
        .slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) set.add(s);
    });
    return set;
  }, [propertyData]);

  // Disponibilidad para Plan your trip: rangos (sintéticos o legacy) + bloqueos de iCal/manual en BD
  const isDateAvailable = useMemo(() => {
    return (dateStr: string): boolean => {
      if (blockedNightsFromApi.has(dateStr)) return false;

      if (availabilityRanges && availabilityRanges.length > 0) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const checkDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        for (const range of availabilityRanges) {
          if (range.is_available === true) {
            const start = new Date(range.from);
            const rangeStart = new Date(
              start.getFullYear(),
              start.getMonth(),
              start.getDate(),
              0,
              0,
              0,
              0
            );

            const end = new Date(range.to);
            const rangeEnd = new Date(
              end.getFullYear(),
              end.getMonth(),
              end.getDate(),
              23,
              59,
              59,
              999
            );

            if (checkDate >= rangeStart && checkDate <= rangeEnd) {
              const disabledDates = Array.isArray(range.disabled_dates)
                ? range.disabled_dates
                    .map((d: string | Date) => {
                      if (d instanceof Date) {
                        const dYear = d.getFullYear();
                        const dMonth = d.getMonth();
                        const dDay = d.getDate();
                        return `${dYear}-${String(dMonth + 1).padStart(2, '0')}-${String(dDay).padStart(2, '0')}`;
                      }
                      if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
                      const parsed = new Date(d);
                      if (!isNaN(parsed.getTime())) {
                        const pYear = parsed.getFullYear();
                        const pMonth = parsed.getMonth();
                        const pDay = parsed.getDate();
                        return `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
                      }
                      return null;
                    })
                    .filter((d: string | null): d is string => d !== null)
                : [];

              if (!disabledDates.includes(dateStr)) {
                return true;
              }
            }
          }
        }
        return false;
      }

      const [y, m, d] = dateStr.split('-').map(Number);
      const check = new Date(y, m - 1, d, 0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return check >= today;
    };
  }, [availabilityRanges, blockedNightsFromApi]);

  // Precio por noche para una fecha: igual que getPriceFromCurrentDate / filas de temporada (priceRanges; si vacío, availabilityRanges legacy)
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

  // Precio por noche: si hay check-in, prioriza la temporada de esa fecha; si no, cae a price_per_night o a la temporada de "hoy"
  // (mismo orden de prioridad que la lista de villas: rango de fecha actual > price_per_night > sin precio)
  const getNightlyPrice = useCallback(
    (checkInStr: string | null | undefined): number | null => {
      if ((propertyData as any)?.price_visibility === false) return null;
      if (offerNightlyPrice != null && offerNightlyPrice > 0) return offerNightlyPrice;
      if (checkInStr) {
        const fromDate = getDatePrice(checkInStr);
        if (fromDate != null && fromDate > 0) return fromDate;
      }
      const ppn = Number((propertyData as any)?.price_per_night);
      if (Number.isFinite(ppn) && ppn > 0) return ppn;
      const fromCurrent = getPriceFromCurrentDate(propertyData);
      if (fromCurrent != null && fromCurrent > 0) return fromCurrent;
      return null;
    },
    [getDatePrice, offerNightlyPrice, propertyData]
  );

  // Precio mostrado en Plan your trip: temporada para check-in; si no hay match, price_per_night o temporada “hoy”
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

  // Price label shown in the sticky "Plan your trip" bar (total for the stay, or per-night rate as fallback).
  const stickyBarPriceLabel = useMemo(() => {
    const currencySymbol = (villaData as any).priceCurrencySymbol ?? '€ ';
    if (selectedTotalPrice !== null && selectedTotalPrice > 0) {
      return formatCurrency(selectedTotalPrice, currencySymbol);
    }
    if (selectedPrice !== null && selectedPrice > 0) {
      return `${formatCurrency(selectedPrice, currencySymbol)} / night`;
    }
    return villaData.pricePerNight;
  }, [selectedTotalPrice, selectedPrice, villaData]);

  // Track window size for responsive margin calculation
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Show sticky nav when scrolled past hero
  useEffect(() => {
    const handleScroll = () => {
      const hero = heroSectionRef.current;
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      setShowStickyNav(heroBottom < 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Measure booking widget height to adjust About section margin dynamically
  useEffect(() => {
    const measureBookingWidget = () => {
      if (bookingWidgetRef.current) {
        const height = bookingWidgetRef.current.offsetHeight;
        setBookingWidgetHeight(height);
      }
    };

    // Measure on mount and when content changes
    measureBookingWidget();

    // Use ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(() => {
      measureBookingWidget();
    });

    if (bookingWidgetRef.current) {
      resizeObserver.observe(bookingWidgetRef.current);
    }

    // Also measure when propertyData changes (services list might change)
    const timeoutId = setTimeout(measureBookingWidget, 100);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [propertyData, checkIn, checkOut, selectedPrice]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (planCalendarRef.current && !planCalendarRef.current.contains(event.target as Node)) {
        setIsPlanCalendarOpen(false);
      }
    };
    if (isPlanCalendarOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPlanCalendarOpen]);

  useEffect(() => {
    const handleClickOutsideSticky = (event: MouseEvent) => {
      if (stickyCheckInRef.current && !stickyCheckInRef.current.contains(event.target as Node)) {
        setStickyCheckInOpen(false);
      }
      if (stickyCheckOutRef.current && !stickyCheckOutRef.current.contains(event.target as Node)) {
        setStickyCheckOutOpen(false);
      }
    };
    if (stickyCheckInOpen || stickyCheckOutOpen) document.addEventListener('mousedown', handleClickOutsideSticky);
    return () => document.removeEventListener('mousedown', handleClickOutsideSticky);
  }, [stickyCheckInOpen, stickyCheckOutOpen]);

  // Calculate About section margin dynamically based on booking widget height
  const aboutSectionMargin = useMemo(() => {
    if (bookingWidgetHeight <= 0 || windowSize.width === 0) {
      return '50px'; // Default margin
    }

    // El booking widget está en top-8 (32px) en móvil y top-16 (64px) en desktop
    const widgetTop = windowSize.width >= 768 ? 64 : 32;
    const widgetBottom = widgetTop + bookingWidgetHeight;
    
    // Hero (rental): debe coincidir con h-[min(…vh,…px)] del contenedor de imagen
    // Desktop ancho < 1920px: más alto; desde 1920px: más bajo (Full HD+)
    const heroHeight =
      windowSize.width >= 1920
        ? Math.min(windowSize.height * 0.67, 760)
        : windowSize.width >= 768
          ? Math.min(windowSize.height * 0.72, 800)
          : Math.min(windowSize.height * 0.7, 520);
    
    // Si el widget termina después del hero, el About debe comenzar después del widget
    if (widgetBottom > heroHeight) {
      // El widget sobresale del hero, el About debe comenzar justo después del widget
      return `${widgetBottom - heroHeight + 50}px`;
    }
    // Si el widget no sobresale, margen mínimo
    return '50px';
  }, [bookingWidgetHeight, windowSize]);

  // Get available dates for date picker (only dates that are available)
  const availableDatesForPicker = useMemo(() => {
    const dates = new Set<string>();
    
    if (availabilityRanges && availabilityRanges.length > 0) {
      availabilityRanges.forEach((range) => {
        if (range.is_available === true) {
          const start = new Date(range.from);
          const end = new Date(range.to);
          const disabledDates = Array.isArray(range.disabled_dates) 
            ? range.disabled_dates.map((d: string | Date) => {
                if (d instanceof Date) return d.toISOString().split('T')[0];
                if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
                const parsed = new Date(d);
                return !isNaN(parsed.getTime()) ? parsed.toISOString().split('T')[0] : null;
              }).filter((d: string | null): d is string => d !== null)
            : [];
          
          const current = new Date(start);
          current.setHours(0, 0, 0, 0);
          const endDate = new Date(end);
          endDate.setHours(23, 59, 59, 999);
          
          while (current <= endDate) {
            const dateStr = formatDateInputValue(current);
            if (!disabledDates.includes(dateStr)) {
              dates.add(dateStr);
            }
            current.setDate(current.getDate() + 1);
          }
        }
      });
    }
    
    return dates;
  }, [availabilityRanges]);

  const handlePlanSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!villaData?.id) {
      setPlanError('Select a villa to continue.');
      return;
    }

    if (!checkIn || !checkOut) {
      setPlanError('Select both check-in and check-out dates.');
      return;
    }

    if (!isRealEstate) {
      if (!isDateAvailable(checkIn) || !isDateAvailable(checkOut)) {
        setPlanError('Selected dates are not available. Please select available dates.');
        return;
      }
      const [iy, im, id] = checkIn.split('-').map(Number);
      const [oy, om, od] = checkOut.split('-').map(Number);
      const stayStart = new Date(iy, im - 1, id, 0, 0, 0, 0);
      const checkoutDay = new Date(oy, om - 1, od, 0, 0, 0, 0);
      for (let d = new Date(stayStart); d < checkoutDay; d.setDate(d.getDate() + 1)) {
        const ds = formatDateInputValue(d);
        if (!isDateAvailable(ds)) {
          setPlanError('Selected dates are not available. Please select available dates.');
          return;
        }
      }
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

  const galleryImages = useMemo(() => {
    const heroImage = villaData.images.hero;
    return {
      hero: heroImage,
      bedroom: villaData.images.bedroom,
      kitchen: villaData.images.kitchen,
      living: villaData.images.living,
      pool: villaData.images.pool,
      outdoor: villaData.images.outdoor
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

  // Take up to 4 highlight cards
  const [
    firstHighlight = { image: PLACEHOLDER_IMAGE, label: '' },
    secondHighlight = { image: PLACEHOLDER_IMAGE, label: '' },
    thirdHighlight = { image: PLACEHOLDER_IMAGE, label: '' },
    fourthHighlight = { image: PLACEHOLDER_IMAGE, label: '' },
  ] = highlightCards;

  const locationLines = useMemo(() => {
    if (!villaData.location) return [] as string[];
    return villaData.location.split(',').map((segment: string) => segment.trim()).filter(Boolean);
  }, [villaData.location]);

  const listingCanonicalPath = useMemo(() => {
    const p = propertyData ?? initialProperty ?? null;
    if (isRealEstate && p?.id) {
      return buildRealEstateDetailPath(p);
    }
    if (!isRealEstate && p) {
      return buildRentalDetailPath(p);
    }
    if (!isRealEstate) {
      const rid = router.query?.id;
      const rname = router.query?.name;
      if (typeof rid === 'string' && typeof rname === 'string') {
        return `/villas/${encodeURIComponent(rid)}/${encodeURIComponent(rname)}`;
      }
      if (typeof rid === 'string') {
        return `/villas/${encodeURIComponent(rid)}`;
      }
    } else if (typeof router.query?.id === 'string') {
      return `/real-estate/${encodeURIComponent(router.query.id)}`;
    }
    return undefined;
  }, [propertyData, initialProperty, isRealEstate, router.query?.id, router.query?.name]);

  const listingPageUrl = useMemo(() => {
    const path =
      listingCanonicalPath ||
      (router.isReady ? router.asPath.split('#')[0]?.split('?')[0] ?? router.asPath : '');
    if (!path) return '';
    return absoluteUrl(path);
  }, [listingCanonicalPath, router.isReady, router.asPath]);

  const listingJsonLd = useMemo(() => {
    if (!propertyData?.id || !listingPageUrl) return null;
    return buildPropertyJsonLd(propertyData, listingPageUrl);
  }, [propertyData, listingPageUrl]);

  const listingSeoTitle = useMemo(() => {
    const p = propertyData ?? initialProperty ?? null;
    const { metaTitle } = pickPropertySeoMeta(p);
    if (metaTitle) return metaTitle;
    if (!villaData?.id) return SITE_NAME;
    return [villaData.title, villaData.location, SITE_NAME].filter(Boolean).join(' | ');
  }, [propertyData, initialProperty, villaData.id, villaData.title, villaData.location]);

  const listingSeoDescription = useMemo(() => {
    const p = propertyData ?? initialProperty ?? null;
    const { metaDescription } = pickPropertySeoMeta(p);
    if (metaDescription) {
      const cleaned = stripHtmlToText(metaDescription).replace(/\s+/g, ' ').trim().slice(0, 160);
      if (cleaned) return truncateMetaDescription(cleaned, 160);
    }
    const raw = stripHtmlToText(villaData.fullDescription || villaData.description || '');
    if (raw.length > 0) return truncateMetaDescription(raw);
    return '';
  }, [propertyData, initialProperty, villaData.fullDescription, villaData.description]);

  const listingOgImage = initialSeoMeta?.imageUrl || galleryImages.hero || PLACEHOLDER_IMAGE;

  const handleShareListing = useCallback(() => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = villaData.title || SITE_NAME;
    if (navigator.share) {
      void navigator.share({ title, url }).catch(() => {});
    } else {
      void navigator.clipboard.writeText(url);
    }
  }, [villaData.title]);

  if (isLoading) {
    return (
      <>
        {initialSeoMeta ? (
          <SeoHead
            title={initialSeoMeta.title}
            description={initialSeoMeta.description}
            siteOrigin={siteOrigin || undefined}
            canonicalPath={listingCanonicalPath}
            imageUrl={initialSeoMeta.imageUrl ?? undefined}
            type="article"
          />
        ) : null}
        <VillaDetailSkeleton isRealEstate={isRealEstate} />
      </>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SeoHead
          title={`${SITE_NAME} — property`}
          description=""
          siteOrigin={siteOrigin || undefined}
          canonicalPath={listingCanonicalPath ?? (isRealEstate ? '/real-estate' : '/villas')}
          noindex
        />
        <Navbar textBlack={true} className={`${isRealEstate ? 'absolute' : 'fixed md:absolute'} top-0 left-0 w-full z-40 bg-white md:bg-transparent`} />
        <main className="flex flex-1 items-center justify-center bg-white px-4 text-center">
          <p className="font-haas text-[#D04444]">{error}</p>
        </main>
        <Footer disableTravelSection={isRealEstate} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <SeoHead
        title={listingSeoTitle}
        description={
          listingSeoDescription ||
          [villaData.title, villaData.location].filter(Boolean).join(', ')
        }
        siteOrigin={siteOrigin || undefined}
        canonicalPath={listingCanonicalPath}
        imageUrl={listingOgImage}
        type="article"
        jsonLd={listingJsonLd ?? undefined}
      />
      <Navbar
        textBlack={true}
        className={`${isRealEstate ? 'absolute' : 'fixed md:absolute'} top-0 left-0 w-full z-40 md:bg-transparent ${showStickyNav ? 'bg-white border-b border-[#E5E7EB]' : 'bg-transparent'}`}
        onHeightChange={handleNavbarHeightChange}
      />
      {/* Sticky Inquire bar - aparece al hacer scroll debajo del hero (solo rentals) */}
      {!isRealEstate && showStickyNav && (
        <nav
          className="fixed left-0 right-0 z-30 bg-white border-b border-[#E5E7EB] py-3 px-4 md:px-32 md:top-0"
          style={{ top: windowSize.width < 768 ? navbarHeight : undefined }}
        >
          <form onSubmit={handlePlanSubmit} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 max-w-[1400px] mx-auto items-center">
            <span className="text-[#506A70] font-gtsuper-ds text-[16px] md:text-lg uppercase tracking-widest w-full text-center md:w-auto md:text-left">
              Plan your trip
            </span>
            <div className="flex flex-wrap justify-center md:flex-nowrap md:justify-start items-center gap-2 md:gap-4 md:ml-auto w-full md:w-auto">
              <div className="relative shrink-0" ref={stickyCheckInRef}>
                <button
                  type="button"
                  onClick={() => { setStickyCheckOutOpen(false); setStickyCheckInOpen((o) => !o); }}
                  className="w-[150px] md:w-[170px] border border-[#506A70] px-3 py-2 pr-8 text-sm text-[#172338] font-haas font-light bg-white text-left truncate"
                >
                  {checkIn ? checkIn.split('-').reverse().join('-') : 'Check-in'}
                </button>
                <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#506A70] pointer-events-none" />
                {stickyCheckInOpen && (
                  <div className="absolute left-0 top-full mt-1 bg-white border border-[#506A70] shadow-xl p-4 w-[280px] max-w-[calc(100vw-2rem)] z-50">
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={() => setStickyCheckInMonth(new Date(stickyCheckInMonth.getFullYear(), stickyCheckInMonth.getMonth() - 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                        <ChevronRight size={16} className="text-[#172338] rotate-180" />
                      </button>
                      <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
                        {stickyCheckInMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button type="button" onClick={() => setStickyCheckInMonth(new Date(stickyCheckInMonth.getFullYear(), stickyCheckInMonth.getMonth() + 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                        <ChevronRight size={16} className="text-[#172338]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-500 py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {planGetCalendarDays(stickyCheckInMonth.getFullYear(), stickyCheckInMonth.getMonth()).map((day, i) => {
                        if (!day) return <div key={`sci-empty-${i}`} />;
                        const isPast = day < planTodayMidnight;
                        const dayStr = formatDateInputValue(day);
                        const disabled = isPast || !isDateAvailable(dayStr);
                        const isSelected = checkIn && planIsSameDay(day, new Date(checkIn + 'T00:00:00'));
                        return (
                          <button
                            key={`sci-day-${i}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setCheckIn(dayStr);
                              setPlanError(null);
                              if (checkOut && (dayStr >= checkOut || !isDateAvailable(checkOut))) setCheckOut('');
                              setStickyCheckInOpen(false);
                            }}
                            className={[
                              'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                              disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-[#EEF2F6] text-[#172338]',
                              isSelected ? '!bg-[#D99330] !text-white' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative shrink-0" ref={stickyCheckOutRef}>
                <button
                  type="button"
                  onClick={() => { setStickyCheckInOpen(false); setStickyCheckOutOpen((o) => !o); }}
                  className="w-[150px] md:w-[170px] border border-[#506A70] px-3 py-2 pr-8 text-sm text-[#172338] font-haas font-light bg-white text-left truncate"
                >
                  {checkOut ? checkOut.split('-').reverse().join('-') : 'Check-out'}
                </button>
                <Calendar size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#506A70] pointer-events-none" />
                {stickyCheckOutOpen && (
                  <div className="absolute right-0 md:left-0 md:right-auto top-full mt-1 bg-white border border-[#506A70] shadow-xl p-4 w-[280px] max-w-[calc(100vw-2rem)] z-50">
                    <div className="flex items-center justify-between mb-3">
                      <button type="button" onClick={() => setStickyCheckOutMonth(new Date(stickyCheckOutMonth.getFullYear(), stickyCheckOutMonth.getMonth() - 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                        <ChevronRight size={16} className="text-[#172338] rotate-180" />
                      </button>
                      <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
                        {stickyCheckOutMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button type="button" onClick={() => setStickyCheckOutMonth(new Date(stickyCheckOutMonth.getFullYear(), stickyCheckOutMonth.getMonth() + 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                        <ChevronRight size={16} className="text-[#172338]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 mb-1">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-500 py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {planGetCalendarDays(stickyCheckOutMonth.getFullYear(), stickyCheckOutMonth.getMonth()).map((day, i) => {
                        if (!day) return <div key={`sco-empty-${i}`} />;
                        const minDate = checkIn ? new Date(checkIn + 'T00:00:00') : planTodayMidnight;
                        const isPast = day < minDate;
                        const dayStr = formatDateInputValue(day);
                        const disabled = isPast || !isDateAvailable(dayStr);
                        const isSelected = checkOut && planIsSameDay(day, new Date(checkOut + 'T00:00:00'));
                        return (
                          <button
                            key={`sco-day-${i}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setCheckOut(dayStr);
                              setPlanError(null);
                              setStickyCheckOutOpen(false);
                            }}
                            className={[
                              'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                              disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:bg-[#EEF2F6] text-[#172338]',
                              isSelected ? '!bg-[#D99330] !text-white' : '',
                            ].filter(Boolean).join(' ')}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {/* Mobile: Guests + Inquire Now go together below (desktop keeps the original single row via md:contents) */}
              <div className="flex items-center gap-2 w-full md:contents">
                <div className="relative shrink-0">
                  <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-[120px] md:w-[130px] border border-[#506A70] px-3 py-2 pr-8 text-sm text-[#172338] font-haas font-light bg-white cursor-pointer appearance-none [&::-ms-expand]:hidden bg-no-repeat bg-[length:14px] bg-[position:right_0.5rem_center]"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23506A70\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")' }}
                    >
                    {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                {/* Precio + Inquire Now - botón celeste sin border (precio oculto en mobile, ya se muestra arriba) */}
                <div className="flex flex-1 md:flex-initial shrink-0 overflow-hidden">
                  <div className="hidden md:block bg-[#28F7EA] px-4 md:px-5 py-2.5 text-[#172338] font-haas font-semibold text-sm whitespace-nowrap border-r border-white/50">
                    {stickyBarPriceLabel}
                  </div>
                  <button
                    type="submit"
                    className="flex-1 md:flex-initial justify-center bg-[#28F7EA] px-4 md:px-5 py-2.5 text-[#172338] font-haas font-normal text-sm hover:bg-[#1fd1c5] transition-colors whitespace-nowrap flex items-center gap-2 md:gap-1"
                  >
                    <span className="md:hidden font-semibold">{stickyBarPriceLabel}</span>
                    <span className="flex items-center gap-1">
                      Inquire Now <ChevronRight size={14} strokeWidth={2} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
          {planError && (
            <p className="text-[#D04444] text-xs mt-1 px-4 md:px-32 max-w-[1400px] mx-auto">{planError}</p>
          )}
        </nav>
      )}
      <main
        ref={pdfExportRootRef}
        className={`flex-1 relative property-pdf-root${isRealEstate ? ' property-pdf-root--real-estate' : ''}`}
      >
        {/* Hero Section */}
        <section 
          ref={heroSectionRef}
          key={`hero-${galleryImages.hero || 'default'}`}
          className={`relative villa-pdf-hero-section ${isRealEstate ? 'pt-20 md:pt-36' : 'pt-28 md:pt-32'}`}
          style={isRealEstate && windowSize.width > 0 && windowSize.width < 768 && navbarHeight > 0 ? { paddingTop: navbarHeight } : undefined}
        >
          {isRealEstate && (
            <div className="pdf-re-exclude-from-capture px-4 pb-3 md:px-8 flex items-center justify-between gap-x-4 md:flex-wrap md:gap-x-6 gap-y-2" data-pdf-exclude-canvas="true">
              <div className="flex min-w-0 flex-wrap items-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (offerBackHref) { void router.push(offerBackHref); return; }
                    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
                    else void router.push('/real-estate/list');
                  }}
                  className="group flex items-center gap-2 font-haas font-light text-sm text-[#172338] cursor-pointer"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} className="text-[#172338]" />
                  <span className="border-b border-transparent group-hover:border-[#172338] transition-colors pb-px">Back to search</span>
                </button>
                <span className="hidden md:block h-6 w-px bg-[#E2E8EB]" aria-hidden="true" />
                <nav className="hidden md:flex text-sm text-[#506A70] font-haas font-light flex-wrap gap-x-1" aria-label="Breadcrumb">
                  <Link href="/" className="hover:underline">Home</Link>
                  <span className="text-[#506A70]/50">{'>'}</span>
                  <Link href="/real-estate" className="hover:underline">Real estate</Link>
                  <span className="text-[#506A70]/50">{'>'}</span>
                  <span className="text-[#172338] max-w-[min(100%,28rem)] truncate">{villaData.title}</span>
                </nav>
              </div>
              <div className="flex items-center gap-5 md:gap-6 text-[#172338]">
                <button
                  type="button"
                  className="group flex items-center font-haas font-light gap-2 text-sm cursor-pointer transition-colors"
                  onClick={handleShareListing}
                >
                  <BsShare size={15} className="text-[#172338] group-hover:text-[#D99330] transition-colors" />
                  <span className="border-b border-transparent group-hover:border-[#172338] transition-colors pb-px">Share</span>
                </button>
                <button
                  type="button"
                  className="group flex items-center font-haas font-light gap-2 text-sm cursor-pointer disabled:opacity-50 transition-colors"
                  aria-pressed={isCurrentPropertyLiked}
                  disabled={!currentPropertyId || isCurrentFavoritePending}
                  onClick={() => { if (!currentPropertyId) return; handleToggleFavorite(currentPropertyId); }}
                >
                  <GoHeart size={17} className={isCurrentPropertyLiked ? 'text-[#ef4444]' : 'text-[#172338] group-hover:text-[#D99330] transition-colors'} />
                  <span className="border-b border-transparent group-hover:border-[#172338] transition-colors pb-px">{isCurrentPropertyLiked ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          )}
          {/* Hero: misma imagen que villas; real estate muestra tarjeta Contact en lugar de Plan your trip */}
          <div className={`pdf-hero-image-area relative h-[min(70vh,520px)] md:max-[1919px]:h-[min(72vh,800px)] md:min-[1920px]:h-[min(67vh,760px)] shrink-0${useHeroMosaic ? ' md:px-8' : ''}`}>
              {useHeroMosaic && (
                <div className="re-hero-mosaic hidden md:flex w-full h-full gap-1.5">
                  <button
                    type="button"
                    className="relative block w-1/2 h-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172338]"
                    onClick={() => openHeroPhoto(0)}
                    aria-label="Open photo 1"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-[1.02]"
                      style={{
                        backgroundImage: `url("${heroImageDirectUrl(allPropertyImages[0] || PLACEHOLDER_IMAGE)}")`,
                        backgroundRepeat: 'no-repeat',
                        ...backgroundPositionStyle(allPropertyImagePositions[0] ?? galleryPositions.hero),
                      }}
                    />
                  </button>
                  <div
                    className={`w-1/2 h-full grid gap-1.5 ${
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
                        className={`relative block w-full h-full min-h-0 overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172338]${
                          heroMosaicSideCount === 3 && slot === 0 ? ' col-span-2' : ''
                        }`}
                        onClick={() => openHeroPhoto(imgIndex)}
                        aria-label={`Open photo ${imgIndex + 1}`}
                      >
                        <div
                          className="w-full h-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-[1.03]"
                          style={{
                            backgroundImage: `url("${heroImageDirectUrl(allPropertyImages[imgIndex] || PLACEHOLDER_IMAGE)}")`,
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
                className={`${useHeroMosaic ? 'md:hidden ' : ''}block w-full h-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#172338] focus-visible:ring-offset-2`}
                onClick={() => { setGalleryGridModalFilter('all'); setIsGalleryGridModalOpen(true); }}
                aria-label="Abrir galería de fotos"
              >
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-300 ease-out hover:scale-[1.02]"
                  style={{
                    backgroundImage: `url("${heroImageDirectUrl(galleryImages.hero || PLACEHOLDER_IMAGE)}")`,
                    backgroundRepeat: 'no-repeat',
                    ...backgroundPositionStyle(galleryPositions.hero),
                  }}
                />
              </button>
              {offerBackHref && (
                <Link
                  href={offerBackHref}
                  className="absolute top-4 left-4 md:left-8 z-20 flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200 shadow-sm pdf-exclude-from-capture"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} className="text-[#D99330]" />
                  Go back
                </Link>
              )}
              <div
                className={`absolute bottom-6 z-20 flex gap-3 pdf-exclude-from-capture ${useHeroMosaic ? 'right-4 md:right-14' : 'left-4 md:left-8'}`}
              >
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setGalleryGridModalFilter('all'); setIsGalleryGridModalOpen(true); }}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200 shadow-sm${useHeroMosaic ? ' rounded-full border-transparent shadow-md' : ''}`}
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
                    onClick={(e) => { e.stopPropagation(); setGalleryGridModalFilter('videos'); setIsGalleryGridModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200 shadow-sm"
                  >
                    <Video size={18} strokeWidth={1.5} className="text-[#D99330]" />
                    View videos
                  </button>
                )}
              </div>
            </div>

        <div className={`villa-pdf-hero-title-block relative z-10 px-6 md:px-20 lg:px-32 w-full bg-white py-8 md:py-10`}>
          <div className="w-full">
            {/* Hero content para rentals */}
            {!isRealEstate && (
              <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
                <div className="flex-1 min-w-0">
                {/* Location con línea dorada decorativa */}
                {villaData.location && (
                  <div className="mb-4 md:mb-5">
                    <p className="font-haas font-light text-[11px] md:text-xs tracking-[0.24em] uppercase text-[#D99330]">
                      {villaData.location}
                    </p>
                  </div>
                )}

                {/* Título */}
                <h1 className="text-[clamp(2rem,4.5vw,3.8rem)] font-gtsuper-ds font-light leading-[0.95] tracking-[-0.01em] text-[#172338] mb-6 md:mb-8">
                  {villaData.title}
                </h1>

                {/* Descripción */}
                {villaData.description ? (
                  <div
                    className="max-w-xl text-[#506A70] font-haas font-light text-[16px] leading-[1.75] mb-[48px] md:mb-[56px]"
                    dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(villaData.description) }}
                  />
                ) : null}

                {/* Amenities + Save/Share */}
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
                      <span>{villaData.baths} Bathrooms</span>
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
                  {/* Save / Share */}
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
                      onClick={handleShareListing}
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

                {/* Plan your trip — card */}
                <div className="w-full lg:w-96 shrink-0 bg-white px-6 pt-5 pb-5 lg:px-10 lg:pt-5 lg:pb-5 border border-[#c8cdd4]">
                  <h3 className="text-lg md:text-2xl font-light font-gtsuper-ds text-center text-[#172338] mb-3 md:mb-4">Plan your next stay</h3>
                  <p className="font-haas font-light text-sm text-center text-[#506A70]/80 leading-relaxed mb-9">Share your dates and our team will craft a tailored experience just for you.</p>
                  {!propertyData ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                      <div className="h-[44px] bg-[#E2E8EB] rounded" />
                      <div className="h-[44px] bg-[#E2E8EB] rounded" />
                      <div className="h-10 bg-[#E2E8EB] rounded" />
                    </div>
                  ) : (
                  <form onSubmit={handlePlanSubmit} className="flex flex-col gap-5 md:gap-6">
                    <div className="relative" ref={planCalendarRef}>
                      <p className="font-haas text-sm font-light text-[#172338] mb-2">Dates</p>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsPlanCalendarOpen(p => !p)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsPlanCalendarOpen(p => !p); } }}
                        className="w-full h-[44px] border border-[#c8cdd4] bg-white px-3 flex items-center justify-between text-left cursor-pointer"
                      >
                        <span className="font-haas text-sm text-[#172338] flex items-center gap-2 truncate">
                          <Calendar size={15} className="text-[#506A70] shrink-0" />
                          {checkIn && checkOut ? (
                            <>{checkIn.split('-').reverse().join('-')} <ArrowRight size={13} className="text-[#506A70] shrink-0" /> {checkOut.split('-').reverse().join('-')}</>
                          ) : checkIn ? (
                            <>{checkIn.split('-').reverse().join('-')} <ArrowRight size={13} className="text-[#506A70] shrink-0" /></>
                          ) : (
                            'Select dates'
                          )}
                        </span>
                        {(checkIn || checkOut) ? (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCheckIn(''); setCheckOut(''); }}
                            className="shrink-0 ml-2 text-[#506A70] hover:text-[#172338] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        ) : null}
                      </div>
                      {isPlanCalendarOpen && (
                        <div className="absolute left-0 mt-1 bg-white border border-[#506A70] shadow-xl p-4 w-[280px] max-w-[calc(100vw-2rem)] z-50">
                          <div className="flex items-center justify-between mb-3">
                            <button type="button" onClick={() => setPlanCalendarMonth(new Date(planCalendarMonth.getFullYear(), planCalendarMonth.getMonth() - 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                              <ChevronRight size={16} className="text-[#172338] rotate-180" />
                            </button>
                            <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
                              {planCalendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button type="button" onClick={() => setPlanCalendarMonth(new Date(planCalendarMonth.getFullYear(), planCalendarMonth.getMonth() + 1))} className="p-1 hover:bg-[#EEF2F6] transition">
                              <ChevronRight size={16} className="text-[#172338]" />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-500 py-1">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7">
                            {planGetCalendarDays(planCalendarMonth.getFullYear(), planCalendarMonth.getMonth()).map((day, i) => {
                              if (!day) return <div key={`empty-${i}`} />;
                              const isPast = day < planTodayMidnight;
                              const dayStr = formatDateInputValue(day);
                              const isUnavailable = !isDateAvailable(dayStr);
                              const startDate = checkIn ? new Date(checkIn + 'T00:00:00') : null;
                              const endDate = checkOut ? new Date(checkOut + 'T00:00:00') : null;
                              const isStart = startDate && planIsSameDay(day, startDate);
                              const isEnd = endDate && planIsSameDay(day, endDate);
                              const inRange = startDate && endDate && day > startDate && day < endDate;
                              const isHovered = startDate && !endDate && planHoverDate && day > startDate && day <= planHoverDate;
                              const disabled = isPast || isUnavailable;
                              return (
                                <button
                                  key={`day-${i}`}
                                  type="button"
                                  onClick={() => planHandleDayClick(day)}
                                  onMouseEnter={() => !disabled && setPlanHoverDate(day)}
                                  onMouseLeave={() => setPlanHoverDate(null)}
                                  className={[
                                    'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                                    disabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer',
                                    (isStart || isEnd) ? '!bg-[#D99330] !text-white' : '',
                                    inRange ? 'bg-[#EEF2F6] text-[#172338]' : '',
                                    isHovered && !inRange && !isStart && !isEnd ? 'bg-[#f5f8fa] text-[#172338]' : '',
                                    !disabled && !isStart && !isEnd && !inRange && !isHovered ? 'hover:bg-[#EEF2F6] text-[#172338]' : '',
                                  ].filter(Boolean).join(' ')}
                                >
                                  {day.getDate()}
                                </button>
                              );
                            })}
                          </div>
                          {planUnavailableMsg && (
                            <p className="text-center text-[11px] font-haas font-light text-[#D04444] mt-2">{planUnavailableMsg}</p>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <button type="button" onClick={() => { setCheckIn(''); setCheckOut(''); }} className="text-xs font-haas font-thin text-[#172338] underline">Clear</button>
                            <button type="button" onClick={() => setIsPlanCalendarOpen(false)} className="text-xs font-haas font-thin text-[#172338] font-medium">Done</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {checkIn && checkOut && selectedNights && selectedNights > 0 && selectedTotalPrice != null && selectedTotalPrice > 0 ? (
                      <div className="flex flex-col gap-1 pt-1 mb-[-10px]">
                        {selectedPrice != null && selectedPrice > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="font-haas text-sm font-light text-[#506A70]">{selectedNights} night{selectedNights > 1 ? 's' : ''}</span>
                            <span className="font-haas text-sm font-light text-[#506A70]">
                              {formatCurrency(selectedPrice, (villaData as any).priceCurrencySymbol ?? '€ ')} / night
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-[#E2E8EB] pt-2 mt-1">
                          <span className="font-haas text-sm font-light text-[#172338]">Total price</span>
                          <span className="font-haas text-sm font-light text-[#172338]">
                            {formatCurrency(selectedTotalPrice, (villaData as any).priceCurrencySymbol ?? '€ ')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-haas text-sm font-light text-[#506A70]">Price</span>
                        <span className="font-haas text-sm font-light text-[#172338]">
                          {selectedPrice != null && selectedPrice > 0
                            ? `${formatCurrency(selectedPrice, (villaData as any).priceCurrencySymbol ?? '€ ')} / night`
                            : villaData.pricePerNight}
                        </span>
                      </div>
                    )}

                    {planError && (
                      <p className="text-sm text-center text-[#D04444]">{planError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-[#172338] text-white py-2 md:py-2.5 text-xs md:text-lg font-light hover:bg-[#1a2d47] transition-colors"
                    >
                      Make a Request <ChevronRight size={18} className="inline-block" />
                    </button>
                  </form>
                  )}
                </div>
              </div>
            )}

            {/* Botones Photos y Videos (solo para rentals) */}
            {/* Botón Photos oculto temporalmente */}
            {false && !isRealEstate && (
              <div className="flex gap-4 mb-6 md:mb-8 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    photosSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-3 rounded border-2 border-[#172338] bg-white text-[#172338] font-haas font-light text-lg hover:opacity-80 transition-opacity"
                >
                  Photos
                </button>
                {propertyData && (() => {
                  const hasVideos = galleryVideoUrls.length > 0;
                  if (!hasVideos) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        photosSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3 rounded border-2 border-[#172338] bg-white text-[#172338] font-haas font-light text-lg hover:opacity-80 transition-opacity"
                    >
                      Videos
                    </button>
                  );
                })()}
              </div>
            )}
            
            {isRealEstate && (
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

                {/* Price + Enquire Now */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                  <div>
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
                  <button
                    type="button"
                    onClick={handleContactClick}
                    className="self-start sm:self-auto bg-[#172338] text-white px-8 py-3 font-haas font-light text-sm hover:bg-[#1a2d47] transition-colors whitespace-nowrap flex items-center gap-2"
                  >
                    Enquire Now <ChevronRight size={16} strokeWidth={1.5} />
                  </button>
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

                    {likesError && (
                      <button type="button" className="mt-3 text-xs text-[#D04444] underline underline-offset-2" onClick={clearLikesError}>
                        {likesError}
                      </button>
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
            )}
          </div>
        </div>
      </section>

      {/* About Villa Section - Solo para rentals, no para real estate */}
      {!isRealEstate && (
      <section
            id="services"
            className="w-full bg-white pb-[30px] [font-family:'Abhaya_Libre',serif]"
            style={{
              marginTop: aboutSectionMargin
            }}
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
                            src={heroImageDirectUrl(card.image)}
                            alt={card.label || `${villaData.title} highlight ${index + 1}`}
                            className="w-full h-full object-cover"
                            style={positionStyle((card as any).imagePosition)}
                          />
                        </div>
                        <p className="mt-2 font-gtsuper-ds text-[16px] font-light text-center text-[#3C3C50]">
                          {index === 2 ? <span className="text-[#D99330]">{card.label}</span> : card.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Highlight cards — Desktop collage (ancho tope ~1550px para que no se comprima en pantallas muy grandes) */}
                <div className="hidden md:flex flex-wrap justify-center gap-3 md:gap-4 md:-translate-x-[30px] w-full max-w-[1550px] mx-auto">
                  {/* Render all highlight cards that have valid images */}
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
                            src={heroImageDirectUrl(card.image)}
                            alt={card.label || `${villaData.title} highlight ${index + 1}`}
                            className="w-full h-full object-cover"
                            style={positionStyle((card as any).imagePosition)}
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
          {villaData.detailedDescription && (
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

          {villaData.detailedDescription && shouldShowInDetailViewMore && (
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
            const columns = [];
            columns.push({ title: 'GENERAL', type: 'general', data: { bedrooms: villaData.general.bedrooms, sleeps: villaData.general.sleeps, baths: villaData.general.baths, propertySize: villaData.general.propertySize, landSize: villaData.general.landSize } });
            columns.push({ title: 'BEDROOMS', type: 'list', items: villaData.accommodations || [] });
            columns.push({ title: 'FACILITIES', type: 'list', items: villaData.facilities || [] });
            columns.push({ title: 'SERVICES', type: 'list', items: villaData.services || [] });
            columns.push({ title: 'ENJOY', type: 'list', items: villaData.enjoy || [] });

            return (
              <div ref={detailsSectionRef} data-pdf-export-block="true">
                <div className="w-full h-px bg-[#E2E8EB] mb-10" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-8 px-4 md:px-0">
                  {columns.map((column, index) => (
                    <div key={index} className="flex flex-col">
                      {/* Column title */}
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

          {/* Call to Action */}
          <div className="text-center mt-14 pdf-exclude-from-capture">
            <button
              type="button"
              onClick={handleContactClick}
              className="inline-flex items-center gap-2 font-haas font-light text-sm tracking-[0.1em] uppercase text-[#172338] border border-[#172338] px-10 py-3.5 hover:bg-[#172338] hover:text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#172338]"
            >
              Need personalized assistance
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </section>
      )}

      {/* More About Villa Section / Photos Section para real estate */}
      <section
        ref={photosSectionRef}
        className="pdf-gallery-area pdf-exclude-from-capture w-full overflow-x-hidden bg-[#F0F3F5] px-4 py-12 pb-6 md:px-32 md:py-16 md:pb-8"
      >
        <h2 className="mb-6 text-center font-gtsuper-ds text-3xl font-light text-[#172338] md:mb-8 md:text-[40px]">
          {isRealEstate ? 'Photos' : `More About ${aboutTitle}`}
        </h2>

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
                    className="h-full w-full object-cover transition duration-300 ease-out hover:opacity-90"
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
                            className="h-full w-full object-cover"
                          />
                        </button>
                      );
                    })
                  : null}
                {hasThumbRow && moreCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => { setGalleryGridModalFilter('all'); setIsGalleryGridModalOpen(true); }}
                    className="relative h-28 w-full min-h-[7rem] cursor-pointer overflow-hidden bg-[#506A70]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-2"
                  >
                    {previewForMore ? (
                      <img
                        src={previewForMore}
                        alt=""
                        style={positionStyle(previewForMorePosition)}
                        className="h-full w-full scale-105 object-cover blur-sm"
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
        filter={galleryGridModalFilter}
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

      {/* Feature Blocks / The Villa and Pricing Section */}
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
                      // Solo mostrar grupos que tengan items
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

              {/* Prices / Availability */}
              <div className="bg-white p-6 md:p-10 shadow-sm border border-[#506A7080] md:max-h-[32rem] md:overflow-y-auto">
                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-[#D99330]">
                  <button
                    onClick={() => setActiveTab('prices')}
                    className={`text-[20px] pb-3 font-gtsuper-ds font-light transition-all ${
                      activeTab === 'prices'
                        ? 'text-[#506A70] border-b-2 border-[#D99330]'
                        : 'text-[#506A70]/50'
                    }`}
                  >
                    Prices/Night
                  </button>
                  <button
                    onClick={async () => {
                      setActiveTab('availability');
                      const pid = (villaData?.id || propertyData?.id || initialProperty?.id) as string;
                      if (pid && icalendarURL) {
                        try {
                          await syncIcalToAvailability(pid);
                          const res = await getProperty(pid);
                          const data = res?.data || res;
                          if (data) {
                            const prop = data as Property;
                            setPropertyData(prop);
                            const mapped = mapPropertyToView(prop, false) as any;
                            setVillaData(mapped);
                            const availableAsRanges = mapped?.availability?.length
                              ? mapped.availability.map((d: { date: string }) => ({ from: d.date, to: d.date, is_available: true }))
                              : [];
                            setAvailabilityRanges(availableAsRanges);
                          }
                        } catch (_) { /* ignore */ }
                      }
                    }}
                    className={`text-[20px] pb-3 font-gtsuper-ds font-light transition-all ${
                      activeTab === 'availability'
                        ? 'text-[#506A70] border-b-2 border-[#D99330]'
                        : 'text-[#506A70]/50'
                    }`}
                  >
                    Availability
                  </button>
                </div>

                {!isRealEstate && (
                  <div className="mt-4">
                    {activeTab === "prices" && (() => {
                      const priceTableRows = villaPricePdfRows;
                      if (!priceTableRows.length) {
                        return (
                          <div className="rounded border border-[#E4E8EA] p-4 text-sm text-[#506A70] font-haas">
                            Price information is provided upon request.
                          </div>
                        );
                      }
                      return (
                        <table className="w-full table-auto border-separate border-spacing-y-4 text-left">
                          <thead>
                            <tr className="text-[#506A70] text-lg font-gtsuper-ds font-light">
                              <th className="px-4">DATES</th>
                              <th className="px-4">MIN.STAY</th>
                              <th className="px-4">PRICE</th>
                            </tr>
                          </thead>
                          <tbody className="text-[#506A70] text-base font-light">
                            {priceTableRows.map((row: { dates: string; price: string; minStay: string }, index: number) => (
                              <tr key={index}>
                                <td className="px-4 py-2">{row.dates}</td>
                                <td className="px-4 py-2">{row.minStay}</td>
                                <td className="px-4 py-2">{row.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                    {activeTab === "availability" && (
                      <div className="py-4">
                        {/* Availability: solo calendario (días disponibles = no bloqueados). No tabla de precios. */}
                        {(icalendarURL || villaData?.blockedDates?.length !== undefined) ? (
                          <AvailabilityCalendar
                            icalUrl={icalendarURL}
                            blockedDates={villaData?.blockedDates ?? []}
                            availabilityRanges={availabilityRanges}
                            showPrices={(propertyData as any)?.price_visibility !== false}
                          />
                        ) : (
                          <div className="rounded border border-[#E4E8EA] p-4 text-sm text-[#506A70] font-haas">
                            Availability information is provided upon request.
                          </div>
                        )}
                      </div>
                    )}
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

      {/* Complimentary services Section - Solo para rentals, no para real estate */}
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
              <button type="button" onClick={() => { trackContactAgentClick(); openContactForm('CONCIERGE'); }} className="flex justify-center items-center gap-2 w-48 h-12 md:h-14 px-8 bg-[#28F6EA] text-[#172338] hover:bg-[#13d6cc] transition-colors">
                Contact Us <ChevronRight size={20} />
              </button>
            </div>
          </div>
      )}

      {!isRealEstate && (() => {
        const conciergeBlockData = getBlockDataForType(pageBlocks, 'concierge-packages');
        // Only show if block is enabled and has content
        const shouldShow = pageBlocks.some(pb => pb.blockType === 'concierge-packages' && pb.enabled);
        if (!shouldShow && !conciergeBlockData) return null;
        
        // Convert null values to undefined for TypeScript compatibility
        const data = conciergeBlockData ? {
          title: conciergeBlockData.title ?? undefined,
          description: conciergeBlockData.description ?? undefined,
          image1: conciergeBlockData.image1 ?? undefined,
          image2: conciergeBlockData.image2 ?? undefined,
          image3: conciergeBlockData.image3 ?? undefined,
          package5StarsTitle: conciergeBlockData.package5StarsTitle ?? undefined,
          package5StarsDescription: conciergeBlockData.package5StarsDescription ?? undefined,
          package6StarsTitle: conciergeBlockData.package6StarsTitle ?? undefined,
          package6StarsDescription: conciergeBlockData.package6StarsDescription ?? undefined,
          package7StarsTitle: conciergeBlockData.package7StarsTitle ?? undefined,
          package7StarsDescription: conciergeBlockData.package7StarsDescription ?? undefined,
          buttonText: conciergeBlockData.buttonText ?? undefined,
          buttonLink: conciergeBlockData.buttonLink ?? undefined,
        } : undefined;
        
        return (
          <div className="w-[90%] mx-auto mt-12 md:mt-16 pdf-exclude-from-capture">
            <ConciergePackagesSection data={data} />
          </div>
        );
      })()}

      {/* Location Section - Solo para rentals */}
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

      {!isRealEstate && (
      <section
      id="services"
      className="w-full bg-white [font-family:'Abhaya_Libre',serif] pdf-exclude-from-capture"
      >
      <div className="mx-auto text-center px-4 py-16">
          <h2 className="text-center font-gtsuper-ds text-5xl mb-4 font-thin text-[#506A70]">
          Global Concierge Services
          </h2>
          <p className="text-center font-haas text-lg font-light text-[#172338] mb-10">
          Customize your experience with additional services such as private chefs, spa treatments, and transportation, all tailored to your preferences.
          </p>

          {/* Mobile/tablet grid 2x2 */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            <Link
              href={conciergeTypeLink("personalized itineraries")}
              aria-label="See concierge services for personalized itineraries"
              className="text-center"
            >
              <div className="relative w-full pb-[100%]">
                <img
                  src="/images/itineraries.png"
                  alt="Personalized itineraries"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                PERSONALIZED<br />ITINERARIES
              </p>
            </Link>

            <Link
              href={conciergeTypeLink("jet rental")}
              aria-label="See concierge services for jet rental"
              className="text-center"
            >
              <div className="relative w-full pb-[100%]">
                <img
                  src="/images/plane-sea.png"
                  alt="Jet Rental"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                JET RENTAL
              </p>
            </Link>

            <Link
              href={conciergeTypeLink("yacht rental")}
              aria-label="See concierge services for yacht rental"
              className="text-center"
            >
              <div className="relative w-full pb-[100%]">
                <img
                  src="/images/yatch.png"
                  alt="Yacht Rental"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                <span className="text-[#D99330]">YACHT<br />RENTAL</span>
              </p>
            </Link>

            <Link
              href={conciergeTypeLink("helicopter")}
              aria-label="See concierge services for helicopter"
              className="text-center"
            >
              <div className="relative w-full pb-[100%]">
                <img
                  src="/images/helicopter-image.png"
                  alt="Helicopter"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                HELICOPTER
              </p>
            </Link>
          </div>

          {/* Desktop collage (same distribution style as villas) */}
          <div className="hidden md:flex justify-center px-15 gap-6 -translate-x-5 pb-48">
            {[
              {
                type: "personalized itineraries",
                label: (
                  <>
                    PERSONALIZED<br />ITINERARIES
                  </>
                ),
                img: { src: "/images/itineraries.png", alt: "Personalized itineraries" },
                imgWrapStyle: { width: 332, height: 322 },
              },
              {
                type: "jet rental",
                label: "JET RENTAL",
                img: { src: "/images/plane-sea.png", alt: "Jet Rental" },
                imgWrapStyle: { width: 338, height: 192 },
              },
              {
                type: "yacht rental",
                label: (
                  <span className="text-[#D99330]">
                    YACHT<br />RENTAL
                  </span>
                ),
                img: { src: "/images/yatch.png", alt: "Yacht Rental" },
                imgWrapStyle: { width: 338, height: 192 },
              },
              {
                type: "helicopter",
                label: "HELICOPTER",
                img: { src: "/images/helicopter-image.png", alt: "Helicopter" },
                imgWrapStyle: { width: 332, height: 322 },
              },
            ].map((item, index) => (
              <Link
                key={item.type}
                href={conciergeTypeLink(item.type)}
                aria-label={`See concierge services for ${item.type}`}
                className={`flex flex-col gap-1 hover:text-primary cursor-pointer mt-10 ${
                  index === 0 ? 'translate-x-48 mr-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:mr-16' : ''
                } ${
                  index === 1 ? 'translate-y-72 z-10 translate-x-16 mt-8 ' : ''
                } ${
                  index === 2 ? '-translate-x-40 mt-10' : ''
                } ${
                  index === 3 ? '-translate-x-36' : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden ${index === 1 ? '-mt-3' : ''} ${index === 2 ? 'mt-3' : ''}`}
                  style={item.imgWrapStyle as any}
                >
                  <img
                    src={item.img.src}
                    alt={item.img.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p
                  className={`mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50] ${
                    index === 2 ? 'md:text-right' : 'md:text-left'
                  }`}
                >
                  {item.label}
                </p>
              </Link>
            ))}
          </div>

          {/* View all services */}
          <div className="mx-auto mt-10 flex w-full max-w-[1200px] justify-center px-2 md:-mt-[20px] md:justify-end">
            <a
              href="/concierge"
              className="font-haas text-[15px] text-[#506A70] underline decoration-[#506A70] underline-offset-[3px] hover:opacity-80"
            >
              View all services
            </a>
          </div>
      </div>
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

      {/* Similar Villas / Similar Properties (same layout; RE uses real-estate fetch + routes) */}
      {similarVillas.length >= 3 && (
        <section
          className={`py-12 md:py-20 px-4 md:px-32 max-w-[1600px] mx-auto${isRealEstate ? ' pdf-re-exclude-from-capture' : ' pdf-exclude-from-capture'}`}
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-gtsuper-ds font-light text-[#506A70] uppercase tracking-wide">
              {isRealEstate ? 'Similar Properties' : 'Similar Villas'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {similarVillas.map((villa) => {
              const handleCardClick = () => {
                if (!villa.id) return;
                if (isRealEstate) {
                  router.push(buildRealEstateDetailPath(villa));
                } else {
                  router.push(buildRentalDetailPath(villa));
                }
              };

              if (isRealEstate) {
                // Same card as the real estate list page (PropertieCard + getRealEstateCardExtras).
                const property = villa.raw || {};
                const salePrice = Number(property?.sale_price);
                const priceLabel = property?.price_visibility === false
                  ? 'Price on request'
                  : property?.sale_price && Number.isFinite(salePrice)
                    ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(salePrice)
                    : 'Price upon request';
                const watermark = shouldWatermarkImage(property?.watermarkPhotos, 'real-estate');
                const cardImage = heroImageDirectUrl(villa.image && villa.image.trim() !== '' ? villa.image : PLACEHOLDER_IMAGE);
                return (
                  <PropertieCard
                    key={villa.id}
                    onClick={handleCardClick}
                    villaImage={watermark ? watermarkedImageUrl(cardImage) : cardImage}
                    title={property?.title || villa.title || ''}
                    location={getRealEstateCardLocationLabel(property)}
                    capa1="/images/capa-1-4@2x.png"
                    price={priceLabel}
                    saleListingCurrency={getPropertySaleListingCurrency(property)}
                    bedrooms={property?.classification?.bedrooms || 0}
                    bathrooms={getRealEstateBathrooms(property?.classification)}
                    yearBuilt={getRealEstateYearBuilt(property?.classification)}
                    salePriceNumeric={Number(property?.sale_price) || null}
                    guests={0}
                    plotSqm={getRealEstatePlotSqm(property?.classification)}
                    buildSqm={getRealEstateBuildSqm(property?.classification)}
                    pools={countPoolsForRealEstateCard(property?.classification)}
                    isLand={String(property?.classification?.type || '').toLowerCase() === 'land'}
                    rental={false}
                    {...getRealEstateCardExtras(property)}
                    liked={Boolean(villa?.id && isLiked(villa.id))}
                    onToggleFavorite={villa?.id ? () => handleToggleFavorite(villa.id) : undefined}
                    isTogglingFavorite={Boolean(villa?.id && pendingIds.has(villa.id))}
                  />
                );
              }

              return (
                <VillaItem
                  key={villa.id}
                  title={villa.title || ''}
                  country={villa.location || ''}
                  capa1="/images/capa-1-4@2x.png"
                  price={villa.price || ''}
                  bedrooms={villa.bedrooms}
                  guests={villa.guests}
                  poolsSpecLabel={villa.poolsSpecLabel}
                  buildSize={villa.buildSize}
                  plotSize={villa.plotSize}
                  compactRentalStats={isRealEstate}
                  onCardContainerClick={handleCardClick}
                  villaImage={heroImageDirectUrl(villa.image && villa.image.trim() !== '' ? villa.image : PLACEHOLDER_IMAGE)}
                  imageWidth={362}
                  imageHeight={240}
                  liked={Boolean(villa?.id && isLiked(villa.id))}
                  onToggleFavorite={villa?.id ? () => handleToggleFavorite(villa.id) : undefined}
                  isTogglingFavorite={Boolean(villa?.id && pendingIds.has(villa.id))}
                />
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => {
                router.push(isRealEstate ? '/real-estate/list' : '/villas/list');
              }}
              className="bg-[#28F6EA] text-[#172338] px-8 py-4 font-thin hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              {isRealEstate ? 'View More Properties' : 'View More Villas'}
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </section>
      )}

      {!isRealEstate && !hideNearbyExperiences && (
        <VillaNearbyExperiencesSection
          cards={initialVillaNearby?.cards ?? []}
          experienceCitySlug={initialVillaNearby?.experienceCitySlug ?? null}
          propertyForNearbyRefetch={
            (propertyData ?? initialProperty) as unknown as Record<string, unknown>
          }
        />
      )}
      </main>
      <Footer disableTravelSection={isRealEstate} />
      {propertyData && !isRealEstate && (
        <VillaInquireModal
          isOpen={villaInquireOpen}
          onClose={() => setVillaInquireOpen(false)}
          property={propertyData}
          defaultCheckIn={checkIn || undefined}
          defaultCheckOut={checkOut || undefined}
          defaultGuests={guests}
          getNightlyPrice={getNightlyPrice}
          currencySymbol={(villaData as any).priceCurrencySymbol ?? '€ '}
        />
      )}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params?.id;
  if (!id || typeof id !== 'string') {
    return { notFound: true };
  }

  const siteOrigin = getPublicSiteOriginFromRequest(context.req);

  try {
    const [res, blocksVilla] = await Promise.all([
      getProperty(id),
      getPageBlocksData('villa-detail'),
    ]);

    const data = res?.data ?? res;
    if (!data || res?.success === false) {
      return { notFound: true };
    }

    const initialVillaNearby = await fetchVillaNearbyExperiencesPreview(
      data as unknown as Record<string, unknown>
    );

    const isRealEstateListing =
      data?.rental === false || data?.category === "real-estate";
    if (isRealEstateListing) {
      return {
        redirect: {
          destination: `/real-estate/${encodeURIComponent(id)}`,
          permanent: false,
        },
      };
    }

    const isRental = !isRealEstateListing;
    if (isRental) {
      const canonicalPath = buildRentalDetailPath(data);
      if (canonicalPath && canonicalPath !== context.resolvedUrl) {
        return {
          redirect: {
            destination: canonicalPath,
            permanent: false,
          },
        };
      }
    }

    return {
      props: {
        initialProperty: data,
        initialPageBlocks: blocksVilla,
        initialVillaNearby,
        siteOrigin,
        initialSeoMeta: buildPropertyDetailInitialSeoMeta(data as Property, {
          siteOrigin,
          isRealEstate: false,
          idForOg: String(data?.id ?? id),
        }),
      },
    };
  } catch (err) {
    console.error('getServerSideProps villas/[id]:', err);
    return { notFound: true };
  }
}
