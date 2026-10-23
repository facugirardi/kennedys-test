import React from 'react'
import Navbar from '@/components/custom/Navbar'
import { ArrowRight, ChevronRight, HeartIcon, StarIcon } from 'lucide-react'
import { FiMapPin } from "react-icons/fi";

import { LuxurySearchForm } from '@/components/custom/LuxurySearchForm'
import Footer from '@/components/custom/footerNew'
import PickedVillas from '@/components/picked-villas'
import VillaItem from '@/components/villa-item'
import { useState, useEffect, useCallback } from 'react';
import usePropertyStore from '@/store/propertyStore'
import { useRouter } from 'next/router';
import { fetchProperties, resolveMediaUrl, formatNightlyPriceLabel, getPriceFromCurrentDate, heroImageDirectUrl, getPropertyPriceCurrencySymbol } from '@/lib/utils';
import { getProperty } from '@/lib/api/properties';
import {
  VILLAS_LANDING_TRENDING_AGENT_IDS,
  VILLAS_LANDING_PICKED_AGENT_IDS,
  VILLAS_LANDING_MYKONOS_AGENT_IDS,
  VILLAS_LANDING_PAROS_AGENT_IDS,
} from '@/lib/weManageManagedVillas';
import { useAuth } from '@/src/contexts/AuthContext';
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes';
import { buildRentalDetailPath } from '@/lib/rentalRoute';
import { SeoHead } from '@/components/seo/SeoHead';
import { SITE_NAME } from '@/lib/seo/config';
import { formatPoolsJacuzziSpecLine } from '@/lib/propertyPoolCounts';
import { fetchPageByKeyServer } from '@/lib/api/pages';
import { PAGE_HERO_KEYS, resolvePageHeroImage } from '@/lib/pageHeroBanner';

// Preservar imágenes tal cual vienen de la API; la URL se resuelve en el cliente en getPrimaryImage/resolveImageEntry
// (evita que SSR resuelva con env distinto y las cards muestren placeholder)
const mapWithResolvedMedia = (items: any[] = []) =>
  items.map((item) => ({
    ...item,
    images: Array.isArray(item?.images) ? item.images : [],
  }));

/** Imagen reducida: solo lo que usan getPrimaryImage/resolveImageEntry. */
const slimImageEntry = (img: any) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return {
    urlImage: img.urlImage ?? img.url ?? img.image ?? img.path ?? '',
    isPrimary: img.isPrimary ?? img.is_primary ?? img.primary ?? false,
  };
};

/**
 * La página /villas superaba los 2 MB (límite de crawl de Googlebot) porque
 * serializaba las propiedades completas en __NEXT_DATA__. Se conservan solo
 * los campos que consumen las cards del landing y el routing al detalle.
 */
const slimLandingProperty = (p: any) => {
  if (!p) return p;
  const images = Array.isArray(p.images) ? p.images : [];
  const primary = images.find((img: any) => {
    const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary;
    return isPrimary === true || isPrimary === 'true' || isPrimary === 1;
  });
  const keptImages = [primary, ...images.filter((img: any) => img !== primary).slice(0, 3)]
    .filter(Boolean)
    .map(slimImageEntry)
    .filter(Boolean);
  const pricePerNight = Number(p.price_per_night) > 0
    ? p.price_per_night
    : getPriceFromCurrentDate(p);
  return {
    id: p.id ?? null,
    title: p.title ?? null,
    name: p.name ?? null,
    agentFriendlyName: p.agentFriendlyName ?? null,
    agentFriendlySlug: p.agentFriendlySlug ?? null,
    isFriendly: p.isFriendly ?? null,
    region: p.region ?? null,
    visibleLocation: p.visibleLocation ?? null,
    location: p.location ?? null,
    country: p.country ?? null,
    classification: p.classification ? {
      bedrooms: p.classification.bedrooms ?? null,
      idealPersons: p.classification.idealPersons ?? null,
      maxPersons: p.classification.maxPersons ?? null,
      pools: Array.isArray(p.classification.pools) ? p.classification.pools : [],
      poolCount: p.classification.poolCount ?? null,
    } : null,
    price_per_night: pricePerNight ?? null,
    price_visibility: p.price_visibility ?? null,
    heroImage: slimImageEntry(p.heroImage),
    images: keptImages,
  };
};

async function fetchPropertiesByAgentIdsOrdered(ids: readonly string[]): Promise<any[]> {
  const responses = await Promise.all(ids.map((id) => getProperty(id).catch(() => null)));
  return ids
    .map((_, index) => {
      const raw = responses[index] as any;
      if (!raw) return null;
      const parsed = raw?.data ?? raw;
      return parsed?.id ? parsed : null;
    })
    .filter(Boolean) as any[];
}

type VillasPageProps = {
  initialTrendingNow?: any[];
  initialPicked?: any[];
  initialMykonos?: any[];
  initialParos?: any[];
  initialLocationFeatured?: any[];
  initialHeroBannerUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

const DEFAULT_HERO_TITLE = 'LUXURY VACATION\nRENTALS';
const DEFAULT_HERO_SUBTITLE = 'VILLAS AND CHALETS';

const FIRST_COLLAGE_TITLE_LINE_LEN = 25;

function formatFirstCollageTitle(title: string): React.ReactNode {
  if (title.length <= FIRST_COLLAGE_TITLE_LINE_LEN) return title;
  return (
    <>
      {title.slice(0, FIRST_COLLAGE_TITLE_LINE_LEN)}
      <br />
      {title.slice(FIRST_COLLAGE_TITLE_LINE_LEN)}
    </>
  );
}

const KennedysVillas = ({
  initialTrendingNow = [],
  initialPicked = [],
  initialMykonos = [],
  initialParos = [],
  initialLocationFeatured = [],
  initialHeroBannerUrl,
  heroTitle = DEFAULT_HERO_TITLE,
  heroSubtitle = DEFAULT_HERO_SUBTITLE,
  initialSeoMeta,
}: VillasPageProps) => {
  const villasHeroUrl =
    (initialHeroBannerUrl && initialHeroBannerUrl.trim()) ||
    resolvePageHeroImage(PAGE_HERO_KEYS.villasIndex, null);

    // Keep the largest height reported: the sticky navbar shrinks once stuck, which must not shift the page.
    const [navbarHeight, setNavbarHeight] = useState(0)
    const handleNavbarHeightChange = useCallback((h: number) => setNavbarHeight((prev) => Math.max(prev, h)), [])
    const [pickedVillas, setPickedVillas] = useState<any[]>(() => mapWithResolvedMedia(Array.isArray(initialPicked) ? initialPicked : []))
    const [mykonosVillas, setMykonosVillas] = useState<any[]>(() => mapWithResolvedMedia(Array.isArray(initialMykonos) ? initialMykonos : []))
    const [parosVillas, setParosVillas] = useState<any[]>(() => mapWithResolvedMedia(Array.isArray(initialParos) ? initialParos : []))
    const [trendingNowVillas, setTrendingNowVillas] = useState<any[]>(() => {
      const fromManaged = Array.isArray(initialTrendingNow) ? initialTrendingNow : [];
      if (fromManaged.length > 0) return mapWithResolvedMedia(fromManaged);
      return [];
    })
    const [locationFeaturedProperties, setLocationFeaturedProperties] = useState<Record<string, any[]>>(() => {
      const raw = Array.isArray(initialLocationFeatured) ? initialLocationFeatured : [];
      const withMedia = mapWithResolvedMedia(raw);
      const grouped: Record<string, any[]> = {};
      withMedia.forEach((p: any) => {
        const region = p.region || p.visibleLocation || p.location || p.country || 'Other';
        if (!grouped[region]) grouped[region] = [];
        if (grouped[region].length < 3) grouped[region].push(p);
      });
      return grouped;
    })
    const [isLoading, setIsLoading] = useState<boolean>(!initialPicked?.length)
    const [error, setError] = useState<string | null>(null)
    const setSelectedProperty = usePropertyStore((state) => state.setSelectedProperty);
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { isLiked, toggleFavorite, pendingIds } = usePropertyLikes();

    useEffect(() => {
        let isMounted = true;

        const safe = (p: Promise<any>) => p.catch(() => []);
        const toArray = (v: any): any[] => {
            if (Array.isArray(v)) return v;
            return v?.items ?? v?.data?.items ?? v?.data ?? [];
        };
        const groupByRegion = (items: any[]): Record<string, any[]> => {
            const out: Record<string, any[]> = {};
            items.forEach((p: any) => {
                const r = p.region || p.visibleLocation || p.location || p.country || 'Other';
                if (!out[r]) out[r] = [];
                if (out[r].length < 3) out[r].push(p);
            });
            return out;
        };

        const loadLocationFeatured = async () => {
            const locationFeatured = await safe(
                // No category: 'villa' — excluiría chalets/apartments/etc. destacados por región.
                fetchProperties({ take: 15, rental: true, locationFeatured: true })
            );
            if (!isMounted) return;
            setLocationFeaturedProperties(groupByRegion(mapWithResolvedMedia(toArray(locationFeatured))));
        };

        const loadProperties = async () => {
            if (initialPicked?.length) {
                if (isMounted) setIsLoading(false);
                loadLocationFeatured();
                return;
            }
            setIsLoading(true);
            setError(null);

            try {
                const [trendingRows, pickedRows, mykonosRows, parosRows] = await Promise.all([
                    fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_TRENDING_AGENT_IDS),
                    fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_PICKED_AGENT_IDS),
                    fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_MYKONOS_AGENT_IDS),
                    fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_PAROS_AGENT_IDS),
                ]);

                if (!isMounted) return;

                setTrendingNowVillas(mapWithResolvedMedia(trendingRows));
                setPickedVillas(mapWithResolvedMedia(pickedRows));
                setMykonosVillas(mapWithResolvedMedia(mykonosRows));
                setParosVillas(mapWithResolvedMedia(parosRows));

                if (isMounted) setIsLoading(false);

                await loadLocationFeatured();
            } catch (err) {
                console.error('Failed to load properties', err);
                if (isMounted) {
                    setError('We could not load the latest villas. Please try again later.');
                    setIsLoading(false);
                }
            }
        };

        loadProperties();

        return () => { isMounted = false; };
    }, [initialPicked?.length]);

    const handleSelectedProperty = useCallback((property: any) => {
        if (!property?.id) return;
        setSelectedProperty(property);
        router.push(buildRentalDetailPath(property));
    }, [router, setSelectedProperty]);

    const resolveImageEntry = (entry: any) => {
        if (!entry) return '';
        let rawUrl = '';
        if (typeof entry === 'string') {
            rawUrl = entry;
        } else {
            rawUrl = entry.urlImage || entry.url || entry.image || entry.path || '';
        }
        if (!rawUrl || rawUrl.trim() === '') return '';
        // Si ya es URL completa, usarla directamente
        if (/^https?:\/\//i.test(rawUrl)) {
            return rawUrl;
        }
        // Resolver con API base URL
        const resolved = resolveMediaUrl(rawUrl);
        return resolved && resolved.trim() !== '' ? resolved : '';
    };

    const getFirstImageFromCollection = (collection: any) => {
        if (!collection) return '';
        if (Array.isArray(collection) && collection.length > 0) {
            return resolveImageEntry(collection[0]);
        }
        return resolveImageEntry(collection);
    };

    /** Obtiene la primera imagen de la galería que tenga URL válida (para usar cuando no hay primary) */
    const getFirstValidImageFromGallery = (images: any[] | undefined): string => {
        if (!Array.isArray(images) || images.length === 0) return '';
        for (let i = 0; i < images.length; i++) {
            const url = resolveImageEntry(images[i]);
            if (url && url.trim() !== '') return url;
        }
        return '';
    };

    /** Imagen marcada como primary en la galería, o si no hay ninguna, la primera de la galería (siempre foto real) */
    const getPrimaryImage = (property: any) => {
        const images = property?.images;
        if (Array.isArray(images) && images.length > 0) {
            const primary = images.find((img: any) => {
                const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary;
                return isPrimary === true || isPrimary === 'true' || isPrimary === 1;
            });
            const primaryUrl = primary ? resolveImageEntry(primary) : '';
            if (primaryUrl && primaryUrl.trim() !== '') return primaryUrl;
            const firstGalleryUrl = getFirstValidImageFromGallery(images);
            if (firstGalleryUrl) return firstGalleryUrl;
        }
        const candidates = [
            getFirstImageFromCollection(property?.imageHeader),
            getFirstImageFromCollection(property?.gallery),
            getFirstImageFromCollection(property?.media),
            resolveImageEntry(property?.heroImage),
            resolveImageEntry(property?.coverImage),
            resolveImageEntry(property?.mainImage),
            resolveImageEntry(property?.image),
        ];
        const selected = candidates.find((value) => typeof value === 'string' && value.length > 0 && value.trim() !== '');
        return selected || "/images/villa-detail@2x.png";
    };

    const formatNightlyPrice = (property: any) => {
        if (property?.price_visibility === false) return "Price on request";
        const sym = getPropertyPriceCurrencySymbol(property);
        // Si tiene price_per_night, usarlo directamente
        if (property?.price_per_night !== null && property?.price_per_night !== undefined && property?.price_per_night !== '') {
            return formatNightlyPriceLabel(property.price_per_night, sym);
        }
        // Si no tiene price_per_night, intentar calcular desde availabilityRanges
        const currentDatePrice = getPriceFromCurrentDate(property);
        if (currentDatePrice !== null) {
            return formatNightlyPriceLabel(currentDatePrice, sym);
        }
        // Si no hay precio disponible, mostrar "Price on request"
        return "Price on request";
    };

    const parosVillasDisplay = parosVillas.length > 0 && parosVillas.length < 3
        ? Array.from({ length: 3 }, (_, i) => parosVillas[i % parosVillas.length])
        : parosVillas;

    const effectiveTrendingVilla = trendingNowVillas[0] ?? null;
    const trendingCollageVillas = trendingNowVillas.slice(1, 5);

    const trendingImage = effectiveTrendingVilla ? getPrimaryImage(effectiveTrendingVilla) : '/images/villa-detail@2x.png';
    const trendingTitle = effectiveTrendingVilla?.title || '';
    const trendingLocation = effectiveTrendingVilla?.visibleLocation || effectiveTrendingVilla?.location || effectiveTrendingVilla?.country || '';
    const trendingPriceText = effectiveTrendingVilla
        ? formatNightlyPrice(effectiveTrendingVilla).replace(/^From\s+/i, '')
        : '';

    const handleTrendingClick = useCallback(() => {
        if (!effectiveTrendingVilla) return;
        handleSelectedProperty(effectiveTrendingVilla);
    }, [effectiveTrendingVilla, handleSelectedProperty]);

    const onCardPickedClick = useCallback((id: string) => {
        if (!id) {
            console.warn('⚠️ onCardPickedClick - ID no proporcionado');
            return;
        }
        const property = pickedVillas.find((p: any) => p.id === id);
        if (!property) {
            console.warn('⚠️ onCardPickedClick - Propiedad no encontrada con ID:', id);
            return;
        }
        handleSelectedProperty(property);
    }, [pickedVillas, handleSelectedProperty]);

    const onCardMykonosClick = useCallback((id: string) => {
        if (!id) {
            console.warn('⚠️ onCardMykonosClick - ID no proporcionado');
            return;
        }
        const property = mykonosVillas.find((p: any) => p.id === id);
        if (!property) {
            console.warn('⚠️ onCardMykonosClick - Propiedad no encontrada con ID:', id);
            return;
        }
        handleSelectedProperty(property);
    }, [mykonosVillas, handleSelectedProperty]);

    const onCardParosClick = useCallback((id: string) => {
        if (!id) {
            console.warn('⚠️ onCardParosClick - ID no proporcionado');
            return;
        }
        const property = parosVillas.find((p: any) => p.id === id);
        if (!property) {
            console.warn('⚠️ onCardParosClick - Propiedad no encontrada con ID:', id);
            return;
        }
        handleSelectedProperty(property);
    }, [parosVillas, handleSelectedProperty]);

    const onViewAllVillasClick = useCallback(() => {
        router.push("/villas/list");
      }, [router]);

    return (
        <div className='flex flex-col min-h-screen'>
            <SeoHead
              title={initialSeoMeta?.title || `Luxury vacation rentals & villas | ${SITE_NAME}`}
              description={initialSeoMeta?.description || "Curated luxury villas and chalets for rent — Mykonos, Paros, Courchevel, Tulum, and beyond."}
              canonicalPath="/villas"
              imageUrl={initialSeoMeta?.imageUrl || villasHeroUrl}
            />
            <main className="flex-1 relative">
                {/* Imagen de fondo */}


                {/* Navbar sobre la imagen */}
                <Navbar textBlack={true} stickyOnScroll onHeightChange={handleNavbarHeightChange} className="absolute top-0 left-0 w-full z-20 bg-transparent" />
                
                {/* Hero section con padding superior */}
                <div style={{ paddingTop: navbarHeight + 16 }}>
                    <section className="flex flex-col items-center justify-center h-[320px] md:h-[600px] relative px-4 overflow-visible">
                        <img
                            className="h-full w-full object-cover absolute top-0 left-0"
                            src={villasHeroUrl}
                            alt="background"
                        />
                        
                        {/* Overlay negro transparente */}
                        <div className="absolute inset-0 bg-black/20"></div>
                        
                        {/* Texto centrado */}
                        <h1 className="text-4xl md:text-8xl font-gtsuper-ds font-light z-10 uppercase text-white text-center md:-mt-20 whitespace-pre-line">
                            {heroTitle}
                        </h1>
                        <p className="text-lg md:text-2xl text-center z-10 text-white font-light font-gtsuper-ds whitespace-pre-line">
                            {heroSubtitle}
                        </p>

                        {/* LuxurySearchForm superpuesto: la mitad sobre el hero, la mitad debajo */}
                        <div className="hidden md:block absolute bottom-0 left-0 right-0 translate-y-1/2 z-20 px-4 md:px-20">
                            <div className='mx-auto' style={{ maxWidth: '80rem' }}>
                                <LuxurySearchForm />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Mobile: barra plana debajo del hero, mismo diseño que /real-estate */}
                <div className="md:hidden bg-white px-4 py-4">
                    <LuxurySearchForm variant="flat" />
                </div>

                {/* Spacer que compensa la mitad inferior del formulario superpuesto (+ mb-16 mobile del formulario) */}
                <section className="relative z-10 hidden md:block bg-[#F0F3F5] px-4 pb-10 md:px-20 md:pb-20 md:pt-32">
                </section>
                {error && (
                    <div className="mx-4 md:mx-auto md:max-w-3xl rounded-none border border-red-200 bg-red-50 px-4 py-3 text-center font-haas text-sm text-red-700">
                        {error}
                    </div>
                )}
                {/* Skeleton: Trending now + Picked for you */}
                {isLoading && !error && (
                    <div className="animate-pulse">
                        {/* Trending now skeleton */}
                        <section className="bg-white mt-10 md:mt-20 flex flex-col gap-5">
                            {/* Title */}
                            <div className="flex justify-center">
                                <div className="h-10 md:h-14 w-56 md:w-80 bg-gray-200 rounded mx-auto" />
                            </div>
                            {/* Hero image placeholder */}
                            <div className="mx-4 md:mx-32 h-[380px] md:h-[520px] bg-gray-200" />
                        </section>

                        {/* Picked for you skeleton */}
                        <section className="bg-white p-6 md:p-20 flex flex-col gap-10 md:gap-16 mt-20">
                            {/* Title row */}
                            <div className="flex items-center justify-center px-4 md:px-28 max-w-[1440px] mx-auto w-full">
                                <div className="h-10 md:h-14 w-48 md:w-72 bg-gray-200 rounded" />
                            </div>
                            {/* 3 card skeletons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-16 max-w-[1440px] mx-auto w-full">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <div className="w-full h-[240px] bg-gray-200" />
                                        <div className="h-5 w-3/4 bg-gray-200 rounded" />
                                        <div className="h-4 w-1/2 bg-gray-200 rounded" />
                                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
                {/* Trending now: 1 hero + 4 collage (5 villas curated from We Manage list) */}
                {!isLoading && effectiveTrendingVilla && (
                    <section className='relative bg-white mt-10 md:mt-20 flex flex-col gap-5'>
                        <div className="">
                            <h2 className='text-3xl md:text-5xl text-center mb-10 text-[#506A70] font-gtsuper-ds font-light'>Trending now</h2>
                            <div
                                className="flex flex-col justify-center items-center relative h-[380px] md:h-[520px] cursor-pointer mx-4 md:mx-32"
                                onClick={handleTrendingClick}
                                role="button"
                                aria-label="View trending villa"
                            >
                                <img
                                    src={heroImageDirectUrl(trendingImage, 1280)}
                                    alt={trendingTitle}
                                    className="absolute inset-0 w-full h-full object-cover object-center brightness-[0.85]"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/25" />
                                {/* Badges top-right */}
                                <div
                                    className="absolute top-[70px] right-3 md:top-4 md:right-4 flex items-center gap-2 z-20"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white backdrop-blur-sm hover:bg-white transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!effectiveTrendingVilla?.id) return;
                                            if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; }
                                            toggleFavorite(effectiveTrendingVilla.id);
                                        }}
                                        aria-label="Add to favorites"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
                                                stroke={effectiveTrendingVilla?.id && isLiked(effectiveTrendingVilla.id) ? '#ef4444' : '#506A70'}
                                                fill={effectiveTrendingVilla?.id && isLiked(effectiveTrendingVilla.id) ? '#ef4444' : 'none'}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                {/* Text overlay */}
                                <h2 className="text-5xl md:text-8xl text-white z-10 text-center font-gtsuper-ds font-light px-2">{trendingTitle}</h2>
                                <p className="text-xl md:text-2xl text-white z-10 text-center font-light font-gtsuper-ds px-2">{trendingLocation}</p>
                                <p className="text-base md:text-lg font-light text-white z-10 text-center font-haas tracking-widest mt-2">FROM</p>
                                <p className="text-2xl md:text-3xl text-white z-10 text-center font-haas font-light px-2">
                                    {trendingPriceText}
                                    {trendingPriceText && !trendingPriceText.toLowerCase().includes('night') && (
                                        <span className='text-base md:text-xl font-light'>/NIGHT</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {trendingCollageVillas.length > 0 && (
                            <div className="relative px-4 md:px-28 mb-12 md:mb-20 pb-12 md:pb-20 flex flex-col gap-10 md:gap-16">
                        {/* Collage desktop */}
                        <div className='hidden md:flex justify-center px-15 gap-6 -translate-x-5'>
                            {trendingCollageVillas.map((property: any, index: number) => {
                                const isThird = index === 2;
                                const collageTitle = property?.title || '';

                                return (
                                    <div
                                        key={property?.id || index}
                                        className={`flex flex-col gap-1 hover:text-primary cursor-pointer mt-10 ${
                                            index === 0 ? 'translate-x-48 mr-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:mr-16' : ''
                                        } ${
                                            index === 1 ? 'translate-y-64 z-10 translate-x-20 mt-8' : ''
                                        } ${
                                            index === 2 ? '-translate-x-40' : ''
                                        } ${
                                            index === 3 ? '-translate-x-36' : ''
                                        }`}
                                        onClick={() => {
                                            handleSelectedProperty(property);
                                        }}
                                    >
                                        <div className="relative" style={{
                                            width: index === 0 ? '343px' : index === 1 ? '309px' : index === 2 ? '390px' : '341px',
                                        }}>
                                            <img
                                                src={heroImageDirectUrl(getPrimaryImage(property), 828)}
                                                alt={property?.title || 'Villa'}
                                                style={{
                                                    width:  index === 0 ? '343px' : index === 1 ? '309px' : index === 2 ? '390px' : '341px',
                                                    height: index === 0 ? '304px' : index === 1 ? '186px' : index === 2 ? '180px' : '246px',
                                                }}
                                                className="object-cover"
                                            />
                                            <button
                                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-white/90 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!property?.id) return;
                                                    if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; }
                                                    toggleFavorite(property.id);
                                                }}
                                                aria-label="Add to favorites"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
                                                        stroke={property?.id && isLiked(property.id) ? '#ef4444' : '#506A70'}
                                                        fill={property?.id && isLiked(property.id) ? '#ef4444' : 'none'}
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                                        {isThird ? (
                                                            <div className='self-end flex flex-col gap-0 '>
                                                                <h3 className='font-gtsuper-ds text-[#D99330] uppercase text-lg font-normal text-right'>{property?.title || ''}</h3>
                                                                <p className='font-haas font-medium text-[#D99330] text-lg text-right'>{property?.visibleLocation || property?.location || property?.country || ''}</p>
                                                                <span className='font-haas text-[#D99330] font-light text-lg text-right'>{formatNightlyPrice(property)}</span>
                                                            </div>
                                        ) : (
                                            <div className='flex flex-col gap-0'>
                                                <h3 className={`font-gtsuper-ds text-[#172338] uppercase text-lg font-normal break-words ${index === 0 ? 'max-w-[320px]' : ''}`}>
                                                  {index === 0 ? formatFirstCollageTitle(collageTitle) : collageTitle}
                                                </h3>
                                                <p className='font-haas font-medium text-[#172338] text-lg'>{property?.visibleLocation || property?.location || property?.country || ''}</p>
                                                <span className='font-haas text-[#172338] font-light text-lg'>{formatNightlyPrice(property)}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        {/* Collage mobile: mismas 4 villas con precio */}
                        <div className="flex md:hidden flex-col gap-8 max-w-[1440px] mx-auto w-full">
                            {trendingCollageVillas.map((property: any, index: number) => (
                                <div
                                    key={property?.id || index}
                                    className="flex flex-col gap-2 cursor-pointer"
                                    onClick={() => handleSelectedProperty(property)}
                                    role="button"
                                >
                                    <div className="relative w-full aspect-[16/10] max-h-[280px]">
                                        <img
                                            src={heroImageDirectUrl(getPrimaryImage(property), 828)}
                                            alt={property?.title || 'Villa'}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-white/90 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!property?.id) return;
                                                if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; }
                                                toggleFavorite(property.id);
                                            }}
                                            aria-label="Add to favorites"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
                                                    stroke={property?.id && isLiked(property.id) ? '#ef4444' : '#506A70'}
                                                    fill={property?.id && isLiked(property.id) ? '#ef4444' : 'none'}
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                    <h3 className="font-gtsuper-ds text-[#172338] uppercase text-base font-normal">{property?.title || ''}</h3>
                                    <p className="font-haas font-medium text-[#172338] text-sm">{property?.visibleLocation || property?.location || property?.country || ''}</p>
                                    <p className="font-haas text-[#172338] font-light text-sm">{formatNightlyPrice(property)}</p>
                                </div>
                            ))}
                        </div>
                            </div>
                        )}
                    </section>
                )}
                {/* Sección "Picked for you" */}
                {!isLoading && (
                    <section className='relative bg-white px-0 py-8 md:p-20 flex flex-col gap-8 md:gap-16'>
                        <div className="relative flex items-center w-full px-4 md:px-28 max-w-[1440px] mx-auto">
                            <h2 className="text-center w-full md:w-auto md:absolute md:left-1/2 md:transform md:-translate-x-1/2 text-3xl md:text-5xl text-[#506A70] font-gtsuper-ds font-light">
                                Picked for you
                            </h2>
                            <button className="ml-auto font-haas underline text-[#506A70] hidden md:inline-block" onClick={() => { onViewAllVillasClick() }}>
                                View All Villas
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-16 max-w-[1440px] mx-auto">
                            {
                                pickedVillas?.map((property: any, i: number) => {
                                    return (
                                        <VillaItem
                                            key={property?.id ?? i}
                                            title={property?.title || ''}
                                            country={property?.location || property?.country || ''}
                                            capa1="/images/capa-1-4@2x.png"
                                            price={formatNightlyPrice(property)}
                                            bedrooms={property?.classification?.bedrooms}
                                            guests={property?.classification?.idealPersons || property?.classification?.maxPersons}
                                            poolsSpecLabel={formatPoolsJacuzziSpecLine(property?.classification)}
                                            onCardContainerClick={() => onCardPickedClick(property?.id)}
                                            villaImage={heroImageDirectUrl(getPrimaryImage(property), 828)}
                                            imageWidth={362}
                                            imageHeight={240}
                                        />
                                    )
                                })
                            }
                        </div>
                        <button className="md:hidden self-center font-haas underline" onClick={() => { onViewAllVillasClick() }}>
                            View All Villas
                        </button>
                    </section>
                )}
                {/* Sección Mykonos Villas */}
                {!isLoading && mykonosVillas && mykonosVillas.length > 0 && (
                    <section className='relative bg-[#F0F3F5] px-0 py-8 md:px-20 md:py-12 flex flex-col gap-8 md:gap-12'>
                        <div className="flex flex-col items-center w-full px-4 md:px-28 max-w-[1440px] mx-auto">
                            <h2 className="text-center text-3xl md:text-5xl text-[#506A70] font-gtsuper-ds font-light uppercase">
                                MYKONOS VILLAS
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-16 max-w-[1440px] mx-auto">
                            {mykonosVillas.map((property: any, i: number) => (
                                <VillaItem
                                    key={property?.id ?? i}
                                    title={property?.title || ''}
                                    country={property?.location || property?.country || ''}
                                    capa1="/images/capa-1-4@2x.png"
                                    price={formatNightlyPrice(property)}
                                    bedrooms={property?.classification?.bedrooms}
                                    guests={property?.classification?.idealPersons || property?.classification?.maxPersons}
                                    poolsSpecLabel={formatPoolsJacuzziSpecLine(property?.classification)}
                                    onCardContainerClick={() => onCardMykonosClick(property?.id)}
                                    villaImage={heroImageDirectUrl(getPrimaryImage(property), 828)}
                                    imageWidth={362}
                                    imageHeight={240}
                                    propBorder="none"
                                />
                            ))}
                        </div>
                        <div className='px-4 md:px-16 max-w-[1440px] mx-auto w-full flex justify-center'>
                            <a
                                href="/villas/list?region=Mykonos"
                                className="w-full md:w-auto bg-[#28F6EA] text-soft-gray-dark px-8 md:px-10 py-4 md:py-5 flex items-center justify-center gap-2 font-haas"
                            >
                                View All Villas in Mykonos <ChevronRight className='w-5 h-5' />
                            </a>
                        </div>
                    </section>
                )}
                {/* Sección Paros Villas */}
                {!isLoading && parosVillas && parosVillas.length > 0 && (
                    <section className='relative bg-white px-0 py-8 md:px-20 md:py-12 flex flex-col gap-8 md:gap-12'>
                        {/* Kennedy's Group circular badge */}
                        <div className="hidden md:block absolute top-0 right-16 -translate-y-1/2 z-10 w-28 h-28">
                        <svg width="141" height="141" viewBox="0 0 141 141" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="70.4178" cy="70.4178" r="65" transform="rotate(5 70.4178 70.4178)" fill="#D99330"/>
                            <g clip-path="url(#clip0_751_3723)">
                            <path d="M47.043 33.9122L42.7932 26.4586L43.4917 26.0604L45.7562 30.0321L47.5156 23.7661L48.4225 23.249L47.0352 28.0597L52.8599 30.5956L52.0259 31.0711L46.8291 28.8127L46.2436 30.887L47.7414 33.514L47.043 33.9122Z" fill="white"/>
                            <path d="M54.6726 30.0077L51.9317 21.8773L57.4581 20.0143L57.6843 20.6852L52.9197 22.2914L53.9049 25.2138L58.2715 23.7417L58.4938 24.4013L54.1273 25.8733L55.1968 29.0459L60.0864 27.3975L60.3241 28.1025L54.6726 30.0077Z" fill="white"/>
                            <path d="M62.6095 27.6941L61.5222 19.1833L62.3912 19.0723L67.0707 24.5474C67.5813 25.1355 68.0953 25.8441 68.0953 25.8441L68.1191 25.841L67.1763 18.461L67.9381 18.3637L69.0254 26.8745L68.1921 26.981L63.5336 21.5757C63.0648 21.0307 62.4569 20.2495 62.4569 20.2495L62.4331 20.2525L63.3713 27.5968L62.6095 27.6941Z" fill="white"/>
                            <path d="M71.5407 26.9679L72.1496 18.4096L73.0234 18.4717L76.5339 24.7608C76.9188 25.4378 77.2833 26.2337 77.2833 26.2337L77.3072 26.2354L77.8353 18.8141L78.6013 18.8686L77.9924 27.427L77.1545 27.3674L73.6509 21.151C73.2984 20.5244 72.8562 19.6388 72.8562 19.6388L72.8322 19.6371L72.3067 27.0224L71.5407 26.9679Z" fill="white"/>
                            <path d="M80.4081 28.0352L82.7125 19.7705L88.3302 21.3369L88.1401 22.0189L83.2968 20.6684L82.4685 23.6391L86.9072 24.8767L86.7203 25.5472L82.2816 24.3095L81.3824 27.5345L86.3528 28.9204L86.153 29.6371L80.4081 28.0352Z" fill="white"/>
                            <path d="M89.3094 30.3222L91.2148 31.2876C93.0452 32.2151 94.4611 31.3854 95.4427 29.4479C96.4244 27.5104 96.3581 25.8625 94.5276 24.9351L92.5473 23.9317L89.3094 30.3222ZM88.2722 30.5904L92.1501 22.9367L94.869 24.3143C97.1276 25.4587 97.3419 27.5582 96.1921 29.8276C95.0422 32.0969 93.1748 33.0744 90.9162 31.93L88.2722 30.5904Z" fill="white"/>
                            <path d="M97.462 36.1039L99.736 33.1296L100.214 27.4073L100.919 27.9467L100.476 32.834L100.495 32.8486L105.114 31.1536L105.8 31.6784L100.37 33.6443L98.1102 36.5995L97.462 36.1039Z" fill="white"/>
                            <path d="M108.3 36.4686L109.959 36.025L110.623 36.7513L108.737 36.9469L108.3 36.4686Z" fill="white"/>
                            <path d="M108.057 48.1825C106.853 46.2747 107.333 44.652 108.692 43.6806L109.122 44.3604C107.939 45.2065 107.774 46.4742 108.632 47.8339C109.305 48.8994 110.342 49.3515 111.326 48.7302C112.351 48.0833 112.166 47.2496 111.5 45.4985C110.919 43.9925 110.729 42.7925 111.997 41.9919C113.154 41.2617 114.53 41.7555 115.446 43.2066C116.464 44.8201 116.104 46.1827 114.939 47.1025L114.523 46.4429C115.471 45.6742 115.537 44.6105 114.884 43.5754C114.186 42.4694 113.236 42.1327 112.434 42.6387C111.571 43.1831 111.73 44.0194 112.307 45.472C112.923 47.0555 113.314 48.4402 111.792 49.401C110.504 50.2145 109.018 49.7046 108.057 48.1825Z" fill="white"/>
                            <path d="M112.988 59.8775C112.317 57.4608 113.751 55.581 116.225 54.8943C118.665 54.2172 120.915 55.0997 121.611 57.6089C122.083 59.3087 121.554 60.8129 119.961 61.5788L119.739 60.781C120.906 60.1832 121.29 59.0554 120.941 57.795C120.35 55.6674 118.45 55.1486 116.45 55.7037C114.415 56.2685 113.128 57.734 113.673 59.6997C114.203 61.6076 115.749 62.0628 117.183 61.6649L117.472 61.5846L116.734 58.9251L117.416 58.7358L118.366 62.1585L114.122 63.3361L113.971 62.7927L115.245 62.265L115.235 62.2303C114.446 61.9886 113.412 61.4038 112.988 59.8775Z" fill="white"/>
                            <path d="M114.296 65.6236L122.859 65.0848L123.1 68.9053C123.197 70.4502 122.366 71.3922 120.941 71.4819C119.887 71.5482 119.164 71.1368 118.791 70.1743L118.755 70.1766C118.511 71.0817 117.883 71.4098 116.557 71.5533C115.183 71.6998 114.846 71.8774 114.748 72.0399L114.7 72.0429L114.646 71.1806C114.765 70.9807 115.086 70.9124 116.542 70.7486C118.023 70.5833 118.41 70.042 118.331 68.7965L118.167 66.1856L114.347 66.426L114.296 65.6236ZM118.85 66.1427L119.022 68.8852C119.101 70.1308 119.751 70.7271 120.817 70.66C121.883 70.593 122.464 70.0755 122.382 68.7821L122.203 65.9317L118.85 66.1427Z" fill="white"/>
                            <path d="M114.524 77.8548C114.232 79.898 115.726 81.2273 117.781 81.5216C119.836 81.8159 121.644 80.9595 121.937 78.9164C122.228 76.8851 120.731 75.5677 118.676 75.2734C116.621 74.9791 114.815 75.8236 114.524 77.8548ZM113.812 77.7528C114.155 75.3532 116.265 74.0795 118.795 74.4418C121.325 74.8042 122.993 76.6189 122.649 79.0184C122.304 81.4298 120.193 82.7155 117.662 82.3531C115.132 81.9908 113.466 80.1642 113.812 77.7528Z" fill="white"/>
                            <path d="M111.524 86.4485C112.169 84.691 113.432 83.8251 115.28 84.5027L120.778 86.519L120.501 87.2738L115.071 85.2823C113.584 84.7369 112.682 85.3137 112.165 86.722C111.674 88.0627 111.968 89.142 113.455 89.6874L118.886 91.6789L118.609 92.4338L113.111 90.4175C111.241 89.7316 110.884 88.1948 111.524 86.4485Z" fill="white"/>
                            <path d="M109.346 91.6219L116.684 96.0679L114.937 98.9519C114.452 99.7524 113.903 100.149 113.256 100.291C112.708 100.408 112.134 100.313 111.529 99.9457C110.174 99.1249 109.914 97.8869 110.847 96.3474L112.121 94.2434L108.929 92.3096L109.346 91.6219ZM112.706 94.5979L111.463 96.6505C110.741 97.8411 111.007 98.6757 111.931 99.2353C112.875 99.8074 113.741 99.56 114.381 98.5029L115.662 96.3887L112.706 94.5979Z" fill="white"/>
                            <path d="M104.571 103.19L105.044 103.667L102.862 105.83L102.389 105.353L104.571 103.19Z" fill="white"/>
                            <path d="M94.9445 107.376L99.294 114.772L98.601 115.18L96.2832 111.239L94.6083 117.528L93.7083 118.057L95.0309 113.228L89.1726 110.771L90.0001 110.284L95.2269 112.472L95.7844 110.39L94.2514 107.784L94.9445 107.376Z" fill="white"/>
                            <path d="M87.4078 111.373L90.2662 119.463L84.7674 121.405L84.5315 120.738L89.2723 119.063L88.2448 116.155L83.9001 117.69L83.6682 117.034L88.013 115.499L86.8976 112.342L82.0324 114.061L81.7845 113.36L87.4078 111.373Z" fill="white"/>
                            <path d="M79.4897 113.801L80.6971 122.296L79.8298 122.419L75.0734 117.011C74.5545 116.43 74.0306 115.729 74.0306 115.729L74.0068 115.732L75.0538 123.098L74.2935 123.206L73.086 114.712L73.9177 114.593L78.6521 119.932C79.1286 120.471 79.7475 121.243 79.7475 121.243L79.7712 121.24L78.7293 113.909L79.4897 113.801Z" fill="white"/>
                            <path d="M70.5787 114.669L70.0415 123.232L69.1672 123.177L65.6041 116.918C65.2135 116.244 64.8425 115.451 64.8425 115.451L64.8185 115.45L64.3526 122.875L63.5861 122.827L64.1234 114.264L64.9617 114.316L68.5173 120.503C68.875 121.127 69.3246 122.009 69.3246 122.009L69.3486 122.01L69.8122 114.621L70.5787 114.669Z" fill="white"/>
                            <path d="M61.6446 113.702L59.4515 121.997L53.8132 120.507L53.9942 119.822L58.8551 121.107L59.6435 118.126L55.1885 116.948L55.3665 116.275L59.8214 117.453L60.6772 114.216L55.6886 112.897L55.8788 112.178L61.6446 113.702Z" fill="white"/>
                            <path d="M52.7344 111.551L50.8159 110.612C48.9729 109.71 47.5686 110.559 46.6137 112.51C45.6589 114.461 45.7479 116.108 47.591 117.01L49.585 117.986L52.7344 111.551ZM53.7678 111.269L49.9958 118.975L47.2582 117.635C44.984 116.522 44.7408 114.426 45.8592 112.141C46.9777 109.856 48.8314 108.853 51.1056 109.966L53.7678 111.269Z" fill="white"/>
                            <path d="M44.5074 105.868L42.2736 108.873L41.8727 114.601L41.1601 114.071L41.538 109.178L41.5188 109.164L36.9229 110.921L36.2295 110.405L41.633 108.367L43.8525 105.381L44.5074 105.868Z" fill="white"/>
                            <path d="M33.6561 105.647L32.003 106.113L31.3294 105.396L33.2125 105.175L33.6561 105.647Z" fill="white"/>
                            <path d="M33.7624 93.9661C34.9937 95.8564 34.537 97.4858 33.1918 98.4766L32.753 97.8029C33.9238 96.94 34.0704 95.6702 33.1928 94.3228C32.505 93.267 31.4612 92.8299 30.4859 93.4652C29.4704 94.1267 29.6679 94.9576 30.3583 96.6991C30.9614 98.1966 31.1684 99.3937 29.9115 100.212C28.7652 100.959 27.3823 100.485 26.4457 99.0472C25.4043 97.4484 25.7451 96.0808 26.8967 95.1444L27.3224 95.798C26.3855 96.5802 26.3342 97.6447 27.0023 98.6703C27.7162 99.7663 28.6713 100.089 29.4656 99.5719C30.3203 99.0152 30.1495 98.1813 29.5524 96.7371C28.9135 95.1626 28.5021 93.7836 30.0104 92.8011C31.2874 91.9693 32.7799 92.4578 33.7624 93.9661Z" fill="white"/>
                            <path d="M28.6568 82.3368C29.3615 84.7437 27.9547 86.6436 25.4902 87.3652C23.0602 88.0767 20.798 87.2261 20.0663 84.727C19.5706 83.0341 20.0783 81.5225 21.6605 80.7341L21.8932 81.5288C20.7351 82.143 20.3667 83.2761 20.7343 84.5314C21.3547 86.6505 23.2618 87.1424 25.2541 86.559C27.281 85.9656 28.5472 84.482 27.9739 82.5242C27.4176 80.624 25.8653 80.1907 24.4372 80.6088L24.1493 80.6931L24.9249 83.3419L24.2454 83.5409L23.2473 80.132L27.4738 78.8945L27.6323 79.4358L26.3666 79.9814L26.3768 80.0159C27.1695 80.2465 28.2117 80.8166 28.6568 82.3368Z" fill="white"/>
                            <path d="M27.2723 76.6067L18.7177 77.2665L18.4234 73.4498C18.3043 71.9064 19.1214 70.9527 20.5452 70.8429C21.5981 70.7617 22.3271 71.1628 22.7138 72.1199L22.7497 72.1172C22.9805 71.2087 23.6045 70.8718 24.9279 70.7095C26.2992 70.5436 26.6342 70.3613 26.7299 70.1974L26.7777 70.1938L26.8442 71.0552C26.7273 71.2568 26.408 71.3295 24.9539 71.5139C23.4758 71.7001 23.0967 72.2469 23.1927 73.4912L23.3938 76.0994L27.2105 75.8051L27.2723 76.6067ZM22.7119 76.152L22.5006 73.4122C22.4046 72.1679 21.7455 71.5808 20.6807 71.6629C19.6158 71.745 19.0425 72.2707 19.1422 73.5628L19.3618 76.4104L22.7119 76.152Z" fill="white"/>
                            <path d="M26.8692 64.3831C27.1336 62.3361 25.6208 61.0275 23.5619 60.7616C21.503 60.4957 19.7073 61.3769 19.4429 63.4239C19.18 65.459 20.6944 66.7557 22.7533 67.0216C24.8122 67.2875 26.6063 66.4182 26.8692 64.3831ZM27.5833 64.4754C27.2727 66.8794 25.1806 68.1821 22.6457 67.8547C20.1107 67.5272 18.4183 65.7357 18.7288 63.3317C19.0409 60.9157 21.1345 59.6011 23.6695 59.9285C26.2044 60.256 27.8953 62.0594 27.5833 64.4754Z" fill="white"/>
                            <path d="M29.7608 55.7396C29.1408 57.5059 27.8896 58.3894 26.0327 57.7377L20.5071 55.7983L20.7734 55.0397L26.231 56.9552C27.7256 57.4798 28.6192 56.8905 29.116 55.4751C29.5889 54.1277 29.2795 53.0526 27.7849 52.528L22.3273 50.6125L22.5935 49.8539L28.1191 51.7932C29.9987 52.4529 30.3768 53.9845 29.7608 55.7396Z" fill="white"/>
                            <path d="M31.8718 50.5196L24.473 46.1752L26.1803 43.2674C26.6542 42.4603 27.1979 42.0559 27.8427 41.9057C28.3889 41.7811 28.964 41.8683 29.5745 42.2268C30.9404 43.0288 31.2176 44.2631 30.3062 45.8153L29.0607 47.9366L32.2789 49.8263L31.8718 50.5196ZM28.4708 47.5903L29.686 45.5207C30.3908 44.3203 30.1134 43.4894 29.182 42.9426C28.23 42.3836 27.3681 42.6429 26.7422 43.7087L25.4906 45.8404L28.4708 47.5903Z" fill="white"/>
                            <path d="M36.4883 38.8875L36.0089 38.4166L38.1617 36.2251L38.6411 36.696L36.4883 38.8875Z" fill="white"/>
                            <path d="M64.9958 54.9463C65.4651 54.5156 66.1037 54.3305 66.9006 54.4002L66.9695 53.6132L59.508 52.9604L59.4391 53.7474L59.8077 53.7797C60.4453 53.8355 60.9198 54.148 61.2513 54.7191C61.5729 55.2893 61.6985 56.0331 61.6192 56.9396L59.3793 82.5418C59.2878 83.5878 59.0115 84.3366 58.5603 84.789C58.0992 85.2405 57.4706 85.4264 56.6737 85.3567L56.6083 86.1038L64.0698 86.7566L64.1352 86.0095L63.7168 85.9729C63.0792 85.9171 62.6046 85.6046 62.2732 85.0335C61.9516 84.4633 61.8268 83.7096 61.9088 82.7731L64.1487 57.1709C64.2402 56.1249 64.5165 55.3762 64.9858 54.9454L64.9958 54.9463Z" fill="white"/>
                            <path d="M83.7349 87.7844C83.1279 87.38 82.3797 86.7524 81.4832 85.8709C80.5857 84.9994 79.5099 83.8713 78.2749 82.4985C77.0299 81.1247 75.5611 79.4403 73.8776 77.456L65.6178 67.7994L78.5852 58.4138L78.625 58.4173C81.1205 56.628 83.1792 55.8144 84.813 55.9573L84.8818 55.1703L79.9108 54.7354L79.842 55.5224C80.0611 55.5416 80.2088 55.5746 80.2751 55.6205C80.3413 55.6664 80.3668 55.7189 80.3616 55.7786C80.3302 56.1373 79.743 56.7685 78.6098 57.6732L63.1549 68.7584L71.8229 78.9125C73.3189 80.6294 74.6557 82.1015 75.8631 83.3314C77.0605 84.5605 78.1559 85.5798 79.1508 86.3695C80.1349 87.1683 81.0468 87.7601 81.8757 88.1538C82.7045 88.5475 83.4875 88.7767 84.2347 88.842L85.2707 88.9327L85.3143 88.4346C84.876 88.3962 84.3528 88.1798 83.7458 87.7753L83.7349 87.7844Z" fill="white"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_751_3723">
                            <rect width="102.72" height="102.72" fill="white" transform="translate(24.0568 15.1669) rotate(5)"/>
                            </clipPath>
                            </defs>
                            </svg>

                        </div>
                        <div className="flex flex-col items-center w-full px-4 md:px-28 max-w-[1440px] mx-auto">
                            <h2 className="text-center text-3xl md:text-5xl text-[#506A70] font-gtsuper-ds font-light uppercase">
                                PAROS VILLAS
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-16 max-w-[1440px] mx-auto">
                            {parosVillasDisplay.map((property: any, i: number) => (
                                <VillaItem
                                    key={`${property?.id ?? 'paros'}-${i}`}
                                    title={property?.title || ''}
                                    country={property?.location || property?.country || ''}
                                    capa1="/images/capa-1-4@2x.png"
                                    price={formatNightlyPrice(property)}
                                    bedrooms={property?.classification?.bedrooms}
                                    guests={property?.classification?.idealPersons || property?.classification?.maxPersons}
                                    poolsSpecLabel={formatPoolsJacuzziSpecLine(property?.classification)}
                                    onCardContainerClick={() => onCardParosClick(property?.id)}
                                    villaImage={heroImageDirectUrl(getPrimaryImage(property), 828)}
                                    imageWidth={362}
                                    imageHeight={240}
                                />
                            ))}
                        </div>
                        <div className='px-4 md:px-16 max-w-[1440px] mx-auto w-full flex justify-center'>
                            <a
                                href="/villas/list?region=Paros"
                                className="w-full md:w-auto bg-[#28F6EA] text-[#172338] px-8 md:px-10 py-3 md:py-4 flex items-center justify-center gap-2 font-haas"
                            >
                                View All Villas in Paros <ChevronRight className='w-5 h-5' />
                            </a>
                        </div>
                    </section>
                )}
                {/* Secciones Location Featured - Agrupadas por región con fondos alternados */}
                {Object.keys(locationFeaturedProperties).length > 0 && Object.entries(locationFeaturedProperties).filter(([region]) => !['Mykonos', 'Paros'].includes(region)).map(([region, properties], index) => {
                    const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-[#F0F3F5]';
                    const regionName = region.toUpperCase() + ' VILLAS';
                    
                    return (
                        <section key={region} className={`flex flex-col gap-8 py-8 md:py-12 ${bgColor}`}>
                            <h2 className="text-3xl md:text-5xl text-center text-[#506A70] font-gtsuper-ds font-light">
                                {regionName}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-4 md:px-16 max-w-[1440px] mx-auto">
                                {properties.map((property: any, i: number) => {
                                    return (
                                        <VillaItem
                                            key={property?.id ?? i}
                                            title={property?.title || ''}
                                            country={property?.location || property?.country || ''}
                                            capa1="/images/capa-1-4@2x.png"
                                            price={formatNightlyPrice(property)}
                                            bedrooms={property?.classification?.bedrooms}
                                            guests={property?.classification?.idealPersons || property?.classification?.maxPersons}
                                            poolsSpecLabel={formatPoolsJacuzziSpecLine(property?.classification)}
                                            onCardContainerClick={() => {
                                                const foundProperty = properties.find((p: any) => p.id === property?.id);
                                                if (foundProperty) {
                                                    handleSelectedProperty(foundProperty);
                                                }
                                            }}
                                            villaImage={heroImageDirectUrl(getPrimaryImage(property), 828)}
                                            liked={Boolean(property?.id && isLiked(property.id))}
                                            onToggleFavorite={property?.id ? () => { if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return; } toggleFavorite(property.id); } : undefined}
                                            isTogglingFavorite={Boolean(property?.id && pendingIds.has(property.id))}
                                            propBorder={index % 2 !== 0 ? 'none' : undefined}
                                        />
                                    )
                                })}
                            </div>
                            <div className='px-4 md:px-16 max-w-[1440px] mx-auto w-full'>
                                <a
                                    href={`/villas/list?region=${encodeURIComponent(region)}`}
                                    className="w-full md:w-auto bg-[#28F6EA] text-[#172338] px-8 md:px-10 py-3 md:py-4 flex items-center justify-center font-haas"
                                >
                                    View All Villas in {region} <ChevronRight className='w-3 h-3' />
                                </a>
                            </div>
                        </section>
                    );
                })}
            </main >
            <Footer disableTravelSection={true} />
        </div>

    )
}


export default KennedysVillas

export async function getServerSideProps() {
  try {
    const [initialTrendingRaw, initialPickedRaw, initialMykonosRaw, initialParosRaw, pageRow] = await Promise.all([
      fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_TRENDING_AGENT_IDS),
      fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_PICKED_AGENT_IDS),
      fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_MYKONOS_AGENT_IDS),
      fetchPropertiesByAgentIdsOrdered(VILLAS_LANDING_PAROS_AGENT_IDS),
      fetchPageByKeyServer(PAGE_HERO_KEYS.villasIndex),
    ]);
    return {
      props: {
        initialTrendingNow: mapWithResolvedMedia(initialTrendingRaw).map(slimLandingProperty),
        initialPicked: mapWithResolvedMedia(initialPickedRaw).map(slimLandingProperty),
        initialMykonos: mapWithResolvedMedia(initialMykonosRaw).map(slimLandingProperty),
        initialParos: mapWithResolvedMedia(initialParosRaw).map(slimLandingProperty),
        initialHeroBannerUrl: resolvePageHeroImage(
          PAGE_HERO_KEYS.villasIndex,
          pageRow?.heroBannerPath
        ),
        heroTitle: pageRow?.heroTitle || DEFAULT_HERO_TITLE,
        heroSubtitle: pageRow?.heroSubtitle || DEFAULT_HERO_SUBTITLE,
        initialSeoMeta: {
          title: pageRow?.metaTitle || null,
          description: pageRow?.metaDescription || null,
          imageUrl: pageRow?.metaImageUrl || null,
        },
      },
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps villas/index:', err);
    return {
      props: {
        initialTrendingNow: [],
        initialPicked: [],
        initialMykonos: [],
        initialParos: [],
        initialHeroBannerUrl: resolvePageHeroImage(PAGE_HERO_KEYS.villasIndex, null),
      },
    };
  }
}
