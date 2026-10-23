import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "@/components/custom/Navbar";
import Footer from "@/components/custom/footerNew";
import AvailabilitySearch from "@/components/custom/availabilitySearch";
import { ArrowRight, ChevronRight, Heart, Star } from "lucide-react";
import { FiMapPin } from "react-icons/fi";
import { getAllProperties, getPropertyLocationStats } from "@/lib/api/properties";
import { getAllEvents } from "@/lib/api/events";
import { getReviews } from "@/lib/api/content";
import { resolveMediaUrl, optimizedImageUrl, normalizePropertiesResponse, formatCurrency, getPropertyPriceCurrencySymbol, slugify } from "@/lib/utils";
import { usePropertyLikes } from '@/src/hooks/usePropertyLikes'
import { useAuth } from '@/src/contexts/AuthContext'
import { TestimonialsSection, ClientsStrip, ListYourPropertyBanner } from '@/components/promotional-blocks'
import { getPageBlocksData, getBlockDataForType } from '@/lib/utils/contentBlocks'
import { buildRealEstateDetailPath } from "@/lib/rentalRoute";
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from '@/lib/seo/homeJsonLd'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { PAGE_HERO_KEYS, resolvePageHeroImage, resolvePageHeroPosition } from '@/lib/pageHeroBanner'

const BORDER = "#506A70";

const HOME_SERVICE_CARDS_CONFIG = [
  { pageKey: PAGE_HERO_KEYS.homeServiceVacationRentals, defaultImg: "/images/home/vacation-rentals-image.webp", label: "Vacation Rentals", href: "/villas" },
  { pageKey: PAGE_HERO_KEYS.homeServiceGlobalConcierge, defaultImg: "/images/home/global-concierge.webp", label: "Global Concierge", href: "/concierge" },
  { pageKey: PAGE_HERO_KEYS.homeServiceEventProduction, defaultImg: "/images/home/event-production.webp", label: "Event Production", href: "/events" },
  { pageKey: PAGE_HERO_KEYS.homeServiceRealEstate, defaultImg: "/images/home/real-state-image.webp", label: "Real Estate", href: "/real-estate" },
  { pageKey: PAGE_HERO_KEYS.homeServiceVillaManagement, defaultImg: "/images/home/villa-management.webp", label: "Villa Management", href: "/we-manage-your-property" },
  { pageKey: PAGE_HERO_KEYS.homeServiceTravelDesign, defaultImg: "/images/home/travel-design.webp", label: "Travel Design", href: "https://myblossomtravel.com/" },
] as const;

interface DestinationConfig {
  key: string;
  name: string;
  metricLabel: string;
  locationQuery: string;
  variant: "featured" | "secondary";
  image: string;
  thumbnail?: string;
}

interface RealEstateCard {
  id: string;
  title: string;
  priceLabel: string;
  locationLabel: string;
  bedrooms: number | null;
  baths: number | null;
  sizeLabel: string | null;
  image: string;
  href?: string;
}

interface HomeEventCard {
  id: string;
  name: string;
  summary: string;
  image: string;
  gallery: string[];
}

const conciergeTypeLink = (type: string) => ({
  pathname: "/concierge/list",
  query: { type },
});

const DESTINATION_CONFIG_BASE: (DestinationConfig & { pageKey: string })[] = [
  {
    key: "mykonos",
    name: "Mykonos",
    metricLabel: "Luxury Villas",
    locationQuery: "Mykonos",
    variant: "featured",
    image: "/images/top-destinations/mykonos.jpg",
    pageKey: PAGE_HERO_KEYS.homeDestinationMykonos,
  },
  {
    key: "ibiza",
    name: "Ibiza",
    metricLabel: "Luxury Villas",
    locationQuery: "Ibiza",
    variant: "featured",
    image: "/images/top-destinations/homeibiza.jpg",
    pageKey: PAGE_HERO_KEYS.homeDestinationIbiza,
  },
  {
    key: "paros",
    name: "Paros",
    metricLabel: "Luxury Villas",
    locationQuery: "Paros",
    variant: "secondary",
    image: "/images/paros-image.png",
    pageKey: PAGE_HERO_KEYS.homeDestinationParos,
  },
  {
    key: "saint-tropez",
    name: "Saint Tropez",
    metricLabel: "Luxury Villas",
    locationQuery: "Saint Tropez",
    variant: "secondary",
    image: "/images/saint-tropez-image.png",
    pageKey: PAGE_HERO_KEYS.homeDestinationSaintTropez,
  },
];

const REAL_ESTATE_FALLBACK: RealEstateCard[] = [
  {
    id: "fallback-1",
    title: "Signature Villa",
    priceLabel: "€ 8,500,000",
    locationLabel: "Mykonos, Greece",
    bedrooms: 8,
    baths: 8,
    sizeLabel: "1000 sq.m",
    image: "/images/villa-image@2x.png",
  },
  {
    id: "fallback-2",
    title: "Cliffside Retreat",
    priceLabel: "€ 6,200,000",
    locationLabel: "Ibiza, Spain",
    bedrooms: 6,
    baths: 6,
    sizeLabel: "780 sq.m",
    image: "/images/villas-images@2x.png",
  },
  {
    id: "fallback-3",
    title: "Alpine Chalet",
    priceLabel: "€ 4,950,000",
    locationLabel: "Courchevel, France",
    bedrooms: 5,
    baths: 5,
    sizeLabel: "620 sq.m",
    image: "/images/courcevel-image.png",
  },
  {
    id: "fallback-4",
    title: "Alpine Chalet",
    priceLabel: "€ 4,950,000",
    locationLabel: "Courchevel, France",
    bedrooms: 5,
    baths: 5,
    sizeLabel: "620 sq.m",
    image: "/images/courcevel-image.png",
  },
];

const EVENT_FALLBACK: HomeEventCard[] = [
  {
    id: 'event-fallback-1',
    name: 'Private Celebration',
    summary: 'Tailored soirées with curated menus, entertainment, and décor in iconic destinations.',
    image: '/images/events-1.png',
    gallery: [],
  },
  {
    id: 'event-fallback-2',
    name: 'Corporate Retreat',
    summary: 'Executive gatherings blending strategy sessions with immersive team experiences.',
    image: '/images/events-2.png',
    gallery: [],
  },
  {
    id: 'event-fallback-3',
    name: 'Destination Wedding',
    summary: 'From venue scouting to bespoke guest itineraries, we craft unforgettable vows abroad.',
    image: '/images/events-3.png',
    gallery: [],
  },
];

const LUXURY_VILLA_PILLARS = [
  {
    t: "Luxury Experience",
    d: "Providing curated accommodations y personalized services for an unforgettable stay.",
  },
  {
    t: "Exceptional Hospitality",
    d: "Ensuring attentive service, attention to detail, and a welcoming atmosphere.",
  },
  {
    t: "Authenticity and Integrity",
    d: "Upholding transparency, honesty y reliability in all interactions y operations.",
  },
  {
    t: "Exclusivity and Privacy",
    d: "Offering secluded villas, discreet service y tailored experiences for a private getaway.",
  },
] as const;

type HomePageProps = {
  initialFeaturedSales?: RealEstateCard[];
  initialDestinationStats?: Record<string, { rentalCount: number; saleCount: number; total: number }>;
  initialFeaturedEvents?: HomeEventCard[];
  initialTestimonials?: { id: number; text: string; name: string; occupation: string; image: string; rating: number }[];
  initialPageBlocks?: any[];
  initialHomeImages?: Record<string, string>;
  initialHomePositions?: Record<string, string>;
  initialSeoMeta?: { title: string; description: string; imageUrl: string };
  heroTitle?: string | null;
  realEstateIntroTitle?: string | null;
  realEstateIntroSubtitle?: string | null;
};

const KennedysHomepage: React.FC<HomePageProps> = ({
  initialFeaturedSales = [],
  initialDestinationStats = {},
  initialFeaturedEvents = [],
  initialTestimonials,
  initialPageBlocks = [],
  initialHomeImages = {},
  initialHomePositions = {},
  initialSeoMeta,
  heroTitle,
  realEstateIntroTitle,
  realEstateIntroSubtitle,
}) => {
  const hi = initialHomeImages;
  const hp = initialHomePositions;
  const homeImg = (key: string, fallback: string, width = 1080) => optimizedImageUrl(hi[key] || fallback, width);
  const homePos = (key: string) => hp[key] || '50% 50%';

  const HOME_SERVICE_CARDS = HOME_SERVICE_CARDS_CONFIG.map(c => ({
    img: homeImg(c.pageKey, c.defaultImg, 480),
    pos: homePos(c.pageKey),
    label: c.label,
    href: c.href,
  }));

  const DESTINATION_CONFIG = DESTINATION_CONFIG_BASE.map(d => ({
    ...d,
    image: homeImg(d.pageKey, d.image),
    imagePosition: homePos(d.pageKey),
  }));
  const router = useRouter();
  const defaultTestimonials = [
    { id: 1, text: "Renting through Kennedy's was the best decision we made for our Mykonos trip. The villa was stunning, the staff incredibly attentive, and every detail was taken care of before we even arrived. We will absolutely be back.", name: "Sophie Marceau", occupation: "Interior Designer, Paris", image: "https://randomuser.me/api/portraits/women/44.jpg", rating: 5 },
    { id: 2, text: "From the first call to the last day, the team was exceptional. They found us a private villa in Ibiza that perfectly matched our vision — secluded, luxurious, and with the most breathtaking views I've ever seen.", name: "James Whitfield", occupation: "Entrepreneur, London", image: "https://randomuser.me/api/portraits/men/32.jpg", rating: 5 },
    { id: 3, text: "Kennedy's organized our destination wedding in Tuscany and it was beyond anything we could have imagined. The concierge team handled everything flawlessly. Our guests are still talking about it months later.", name: "Isabella Romano", occupation: "Architect, Milan", image: "https://randomuser.me/api/portraits/women/68.jpg", rating: 5 },
  ];
  const [testimonials, setTestimonials] = useState((initialTestimonials?.length ? initialTestimonials : null) ?? defaultTestimonials);
  const [featuredSales, setFeaturedSales] = useState<RealEstateCard[]>(initialFeaturedSales);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [featuredEvents, setFeaturedEvents] = useState<HomeEventCard[]>(initialFeaturedEvents.length ? initialFeaturedEvents : EVENT_FALLBACK);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [destinationStats, setDestinationStats] = useState<Record<string, { rentalCount: number; saleCount: number; total: number }>>(initialDestinationStats);
  const { isAuthenticated } = useAuth();
  const { isLiked: homeIsLiked, toggleFavorite: homeToggleFavorite, pendingIds: homePendingIds, error: likesError, clearError: clearLikesError } = usePropertyLikes();
  const [pageBlocks, setPageBlocks] = useState<any[]>(initialPageBlocks);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const villaPillarsScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeVillaPillarIndex, setActiveVillaPillarIndex] = useState(0);
  const eventPillarsScrollRef = useRef<HTMLDivElement | null>(null);
  const [activeEventPillarIndex, setActiveEventPillarIndex] = useState(0);
  const serviceCardsScrollRef = useRef<HTMLDivElement | null>(null);
  const serviceCardsAutoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeServiceCard, setActiveServiceCard] = useState(0);

  const scrollServiceToIndex = (index: number) => {
    const el = serviceCardsScrollRef.current;
    if (!el) return;
    const articles = el.querySelectorAll('article');
    const target = articles[index] as HTMLElement | undefined;
    if (!target) return;
    const targetLeft = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const scrollServiceCards = (dir: 'prev' | 'next') => {
    const next = dir === 'next'
      ? Math.min(activeServiceCard + 1, HOME_SERVICE_CARDS.length - 1)
      : Math.max(activeServiceCard - 1, 0);
    scrollServiceToIndex(next);
  };

  const startServiceCardsAuto = () => {
    if (serviceCardsAutoRef.current) return;
    serviceCardsAutoRef.current = setInterval(() => {
      setActiveServiceCard((prev) => {
        const next = prev >= HOME_SERVICE_CARDS.length - 1 ? 0 : prev + 1;
        scrollServiceToIndex(next);
        return next;
      });
    }, 2500);
  };

  const stopServiceCardsAuto = () => {
    if (serviceCardsAutoRef.current) {
      clearInterval(serviceCardsAutoRef.current);
      serviceCardsAutoRef.current = null;
    }
  };

  useEffect(() => {
    const el = serviceCardsScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const articles = Array.from(el.querySelectorAll('article')) as HTMLElement[];
      const center = el.scrollLeft + el.clientWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      articles.forEach((a, i) => {
        const dist = Math.abs(a.offsetLeft + a.offsetWidth / 2 - center);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveServiceCard(closest);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    startServiceCardsAuto();
    return () => stopServiceCardsAuto();
  }, []);

  const goToVillaPillar = (index: number) => {
    const el = villaPillarsScrollRef.current;
    if (!el) return;
    const articles = el.querySelectorAll("article");
    const target = articles[index] as HTMLElement | undefined;
    if (!target) return;
    const targetLeft = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = villaPillarsScrollRef.current;
    if (!el) return;
    let raf = 0;
    const updateActiveFromScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const elRect = el.getBoundingClientRect();
        const mid = elRect.left + elRect.width / 2;
        const articles = Array.from(el.querySelectorAll("article")) as HTMLElement[];
        if (!articles.length) return;
        let bestIdx = 0;
        let bestDist = Infinity;
        articles.forEach((a, i) => {
          const r = a.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        });
        setActiveVillaPillarIndex(bestIdx);
      });
    };
    el.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    updateActiveFromScroll();
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      el.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goToEventPillar = (index: number) => {
    const el = eventPillarsScrollRef.current;
    if (!el) return;
    const articles = el.querySelectorAll("article");
    const target = articles[index] as HTMLElement | undefined;
    if (!target) return;
    const targetLeft = target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2;
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = eventPillarsScrollRef.current;
    if (!el) return;
    let raf = 0;
    const updateActiveFromScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const elRect = el.getBoundingClientRect();
        const mid = elRect.left + elRect.width / 2;
        const articles = Array.from(el.querySelectorAll("article")) as HTMLElement[];
        if (!articles.length) return;
        let bestIdx = 0;
        let bestDist = Infinity;
        articles.forEach((a, i) => {
          const r = a.getBoundingClientRect();
          const c = r.left + r.width / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        });
        setActiveEventPillarIndex(bestIdx);
      });
    };
    el.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    updateActiveFromScroll();
    window.addEventListener("resize", updateActiveFromScroll);
    return () => {
      el.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const featuredDestinations = useMemo(
    () => DESTINATION_CONFIG.filter((item) => item.variant === "featured"),
    []
  );

  const secondaryDestinations = useMemo(
    () => DESTINATION_CONFIG.filter((item) => item.variant === "secondary"),
    []
  );
  const destinationLocations = useMemo(
    () => DESTINATION_CONFIG.map((item) => item.locationQuery),
    []
  );

  useEffect(() => {
    if (initialFeaturedSales?.length || Object.keys(initialDestinationStats).length) return;
    let isMounted = true;

    const loadRealEstate = async () => {
      try {
        const response = await getAllProperties({
          rental: false,
          category: 'real-estate',
          take: 4,
        });

        const data = normalizePropertiesResponse(response);
        if (!isMounted) return;

        const mapped = data
          .map((property: any) => mapSaleProperty(property))
          .filter((card): card is RealEstateCard => Boolean(card));

        setFeaturedSales(mapped);
        setSalesError(null);
      } catch (error) {
        console.error('Failed to load featured real estate', error);
        if (isMounted) {
          setSalesError('We could not load featured real estate at this time.');
        }
      }
    };

    const mapSaleProperty = (property: any): RealEstateCard | null => {
      if (!property) return null;

      const images = Array.isArray(property.images) ? property.images : [];
      const primaryImage = images.find((img: any) => img?.isPrimary) || images[0];
      const imageUrl = resolveMediaUrl(primaryImage?.urlImage || primaryImage?.url || '') || '/images/luxurystate.png';

      const classification = property.classification ?? {};
      const bedrooms = classification?.bedrooms ?? property?.bedrooms ?? null;
      const baths = classification?.baths ?? property?.baths ?? null;
      const size = classification?.indoorArea ?? property?.indoorArea ?? property?.propertySize ?? null;
      const sizeLabel = size ? `${size} sq.m` : null;

      return {
        id: property.id ?? property.title ?? Math.random().toString(36).slice(2),
        title: property.title ?? 'Property',
        priceLabel: formatCurrency(property.sale_price, getPropertyPriceCurrencySymbol(property)),
        locationLabel:
          [property.visibleLocation, property.location, property.region, property.country]
            .filter(Boolean)
            .join(', ') || 'Location upon request',
        bedrooms: bedrooms ?? null,
        baths: baths ?? null,
        sizeLabel,
        image: imageUrl,
        href: buildRealEstateDetailPath(property),
      };
    };

    loadRealEstate();
    const loadDestinationStats = async () => {
      try {
        const response = await getPropertyLocationStats(destinationLocations);
        const statsArray = Array.isArray(response?.data) ? response.data : [];
        const mapping = statsArray.reduce<Record<string, { rentalCount: number; saleCount: number; total: number }>>((acc, item) => {
          if (item?.location) {
            acc[item.location.toLowerCase()] = {
              rentalCount: item.rentalCount ?? 0,
              saleCount: item.saleCount ?? 0,
              total: item.total ?? 0,
            };
          }
          return acc;
        }, {});
        setDestinationStats(mapping);
      } catch (error) {
        console.error("Failed to load destination stats", error);
      }
    };
    loadDestinationStats();

    return () => {
      isMounted = false;
    };
  }, [destinationLocations]);

  useEffect(() => {
    if (initialFeaturedEvents?.length) return;
    let isMounted = true;

    const loadEvents = async () => {
      try {
        const response = await getAllEvents({ listing: 1 });
        const data = Array.isArray(response?.data) ? response.data : [];
        if (!isMounted) return;

        const sorted = [...data].sort((a: any, b: any) => {
          const aDate = new Date(a?.createdAt ?? 0).getTime();
          const bDate = new Date(b?.createdAt ?? 0).getTime();
          return bDate - aDate;
        });

        const mapped = sorted.slice(0, 3).map((event: any) => ({
          id: event?.id ?? Math.random().toString(36).slice(2),
          name: event?.name ?? 'Upcoming Event',
          summary: event?.summary ?? 'Details coming soon.',
          image: resolveMediaUrl(event?.image || '') || '/images/events-1.png',
          gallery: Array.isArray(event?.gallery)
            ? event.gallery.map((item: string) => resolveMediaUrl(item))
            : [],
        }));

        setFeaturedEvents(mapped.length ? mapped : EVENT_FALLBACK);
        setEventsError(null);
      } catch (error) {
        console.error('Failed to load events for homepage', error);
        if (isMounted) {
          setFeaturedEvents(EVENT_FALLBACK);
          setEventsError('We could not load event highlights right now.');
        }
      }
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, [initialFeaturedEvents?.length]);

  useEffect(() => {
    if (initialTestimonials?.length) return;
    const loadReviews = async () => {
      try {
        const resp = await getReviews({ page: 1, pageSize: 1000, published: true });
        const items = resp?.data?.items || [];
        if (items.length) {
          const mapped = items.map((r: any, idx: number) => ({
            id: r.id || idx,
            text: r.body || r.subtitle || r.title || "",
            name: r.authorName || "Guest",
            occupation: r.authorRole || "",
            image: resolveMediaUrl(r.avatarUrl) || "https://placehold.co/80x80",
            rating: r.rating || 5,
          }));
          setTestimonials(mapped);
          setActiveTestimonial(0);
        }
      } catch (error) {
        console.error("Failed to load reviews", error);
      }
    };
    loadReviews();
  }, [initialTestimonials?.length]);

  const nextTestimonial = () =>
    setActiveTestimonial((p) => (p + 1) % testimonials.length);
  const prevTestimonial = () =>
    setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);
  const goToTestimonial = (i: number) => setActiveTestimonial(i);

  const saleCards = featuredSales.length ? featuredSales : REAL_ESTATE_FALLBACK;

  return (
    <div className="flex min-h-screen flex-col">
      <SeoHead
        title={initialSeoMeta?.title ?? `Discover your next adventure | ${SITE_NAME}`}
        description={initialSeoMeta?.description ?? "Luxury vacation rentals, prime real estate, global concierge, travel design, and events in destinations including Mykonos, Ibiza, Courchevel, and Tulum."}
        canonicalPath="/"
        imageUrl={initialSeoMeta?.imageUrl ?? "/images/home/home-image.webp"}
        jsonLd={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]}
      />
      <main className="relative flex-1">
        {/* HERO */}
        <div className="relative h-[480px] md:h-[685px] w-full">
          <img
            src={homeImg(PAGE_HERO_KEYS.homeHero, '/images/home/home-image.webp', 1920)}
            alt="Hero"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover brightness-[0.7]"
            style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeHero) }}
          />
          <Navbar textBlack={false} stickyOnScroll className="absolute left-0 top-0 z-20 w-full bg-transparent" />
          <div className="relative z-10 flex h-full items-center justify-center px-4">
            <h1 className="text-center font-gtsuper-ds text-5xl md:text-[90px] font-light uppercase text-white">
              {heroTitle ? (
                <span className="whitespace-pre-line">{heroTitle}</span>
              ) : (
                <>
                  Discover <br className="md:hidden" />your <br className="hidden md:block" /> Next <span className="text-cyan-300">Adventure</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* SERVICES STRIP + SEARCH */}
        <section className="relative mx-auto max-w-[1440px] px-6">
          {/* Mobile: carrousel horizontal */}
          <div className="-mt-20 md:hidden">
            <div
              ref={serviceCardsScrollRef}
              className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-6 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              onTouchStart={stopServiceCardsAuto}
              onTouchEnd={() => setTimeout(startServiceCardsAuto, 4000)}
            >
              {HOME_SERVICE_CARDS.map((item) => (
                <article
                  key={item.label}
                  className="flex w-[44vw] shrink-0 snap-center flex-col justify-center border border-[#9BA6AE] bg-white cursor-pointer"
                  onClick={() => item.href.startsWith("http") ? window.open(item.href, "_blank", "noopener,noreferrer") : router.push(item.href)}
                >
                  <img src={item.img} alt={item.label} className="h-auto w-full object-cover" style={{ objectPosition: item.pos }} />
                  <p className="flex items-center justify-between px-3 py-2 font-haas font-light text-[#506A70] text-sm">
                    {item.label}
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </p>
                </article>
              ))}
            </div>

            {/* Puntos de navegación */}
            <div className="mt-3 flex items-center justify-center gap-2" role="tablist">
              {HOME_SERVICE_CARDS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === activeServiceCard}
                  aria-label={`Card ${i + 1}`}
                  onClick={() => { stopServiceCardsAuto(); scrollServiceToIndex(i); setActiveServiceCard(i); setTimeout(startServiceCardsAuto, 4000); }}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeServiceCard ? 'w-5 bg-[#506A70]' : 'w-2 bg-[#506A70]/30'}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: grid */}
          <div className="hidden md:-mt-20 md:grid md:grid-cols-3 lg:grid-cols-6 gap-5">
            {HOME_SERVICE_CARDS.map((item) => (
              <article
                key={item.label}
                className="flex flex-col justify-center border border-[#9BA6AE] bg-white cursor-pointer"
                onClick={() => item.href.startsWith("http") ? window.open(item.href, "_blank", "noopener,noreferrer") : router.push(item.href)}
              >
                <img src={item.img} alt={item.label} className="h-auto w-full object-cover" style={{ objectPosition: item.pos }} />
                <p className="flex items-center justify-between px-3 py-2 font-haas font-light text-[#506A70]">
                  {item.label}
                  <ArrowRight className="h-4 w-4" />
                </p>
              </article>
            ))}
          </div>

          {/* 1) Luxury Vacation Rentals: más aire y filtros con borde recto gris-azulado */}
          <div
            className={`
              mt-6 md:mt-10
              rounded-none
              border-0
              px-0
              [&_*:is(input,select)]:border
              [&_*:is(input,select)]:border-[${BORDER}]
              [&_.availability-container]:px-0
            `}
          >
            <AvailabilitySearch variant="home" onFilterClick={() => {}} />
          </div>

          {/* 3) Luxury Villa and Chalet Rental como el diseño */}
          <div className="py-10 md:py-16">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 md:flex-row md:items-start md:gap-8 md:px-0">
                <img
                src={homeImg(PAGE_HERO_KEYS.homeLuxuryVillaImage, '/images/luxury-villa.png')}
                alt="Pool by the sea"
                className="aspect-[4/3] w-full max-w-[300px] shrink-0 object-cover shadow-[0_8px_30px_rgba(23,35,56,0.12)] ring-1 ring-[#506A70]/10 md:mt-2 md:aspect-auto md:max-w-none md:w-[340px] md:shadow-none md:ring-0 md:self-auto"
                style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeLuxuryVillaImage) }}
                />
                <h2 className="max-w-[20rem] font-gtsuper-ds text-[clamp(1.75rem,6.2vw,2.65rem)] font-light uppercase leading-[1.08] tracking-tight text-center md:max-w-none md:text-[76px] md:leading-[1.05] md:tracking-normal md:text-left md:whitespace-nowrap">
                  <span className="md:hidden">
                    <span className="text-primary">Luxury</span>{' '}
                    <span className="text-[#506A70]">Villa</span>
                    <br />
                    <span className="text-[#506A70]">and </span>
                    <span className="text-primary">Chalet</span>{' '}
                    <span className="text-[#506A70]">Rental</span>
                  </span>
                  <span className="hidden md:block">
                    <span className="text-primary">Luxury</span> <span className="text-[#506A70]">Villa</span> <br />
                    <span className="text-[#506A70]">and </span>
                    <span className="text-primary">Chalet</span> <span className="text-[#506A70]">Rental</span>
                  </span>
                </h2>
            </div>

            {/* Separadores solo ENTRE columnas, no a la izquierda */}
            <div className="relative mx-auto mt-10 max-w-5xl px-4 md:mt-12 md:max-w-6xl md:px-0">
                {/* 3 líneas verticales centradas entre las 4 columnas */}
                <span className="pointer-events-none absolute left-[25%] top-0 hidden h-full w-px bg-[#506A70] md:block" />
                <span className="pointer-events-none absolute left-[50%] top-0 hidden h-full w-px bg-[#506A70] md:block" />
                <span className="pointer-events-none absolute left-[75%] top-0 hidden h-full w-px bg-[#506A70] md:block" />

                <div className="md:hidden -mx-4">
                  <div
                    ref={villaPillarsScrollRef}
                    className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-2 touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {LUXURY_VILLA_PILLARS.map((p) => (
                      <article
                        key={p.t}
                        className="flex w-[min(85vw,18.5rem)] shrink-0 snap-center flex-col items-center"
                      >
                        <h3 className="font-gtsuper-ds text-center text-[24px] max-w-[200px] font-light uppercase text-[#506A70]">
                          {p.t}
                        </h3>
                        <p className="mt-4 max-w-[240px] text-center font-light font-haas text-[18px] leading-7 text-[#172338]">
                          {p.d}
                        </p>
                      </article>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-col items-center gap-3 px-4">
                    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Pillar slides">
                      {LUXURY_VILLA_PILLARS.map((_, i) => (
                        <button
                          key={String(i)}
                          type="button"
                          role="tab"
                          aria-selected={i === activeVillaPillarIndex}
                          aria-label={`${i + 1} of ${LUXURY_VILLA_PILLARS.length}`}
                          onClick={() => goToVillaPillar(i)}
                          className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70] focus-visible:ring-offset-2 ${
                            i === activeVillaPillarIndex
                              ? "w-6 bg-[#506A70]"
                              : "w-2 bg-[#506A70]/30 hover:bg-[#506A70]/50"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="font-haas text-sm font-light tabular-nums tracking-wide text-[#506A70]">
                      {activeVillaPillarIndex + 1} / {LUXURY_VILLA_PILLARS.length}
                    </p>
                  </div>
                </div>

                <div className="hidden grid-cols-4 justify-items-center gap-10 md:grid">
                  {LUXURY_VILLA_PILLARS.map((p) => (
                    <div key={p.t} className="flex flex-col items-center px-4">
                      <h3 className="font-gtsuper-ds text-center text-[24px] max-w-[200px] font-light uppercase text-[#506A70]">
                        {p.t}
                      </h3>
                      <p className="mt-4 max-w-[240px] text-center font-light font-haas text-[18px] leading-7 text-[#172338]">
                        {p.d}
                      </p>
                    </div>
                  ))}
                </div>
            </div>
            </div>

        </section>

        {/* TOP-RATED DESTINATIONS */}
        <section className="flex flex-col gap-8 bg-[#F0F3F5] px-4 py-10 md:px-16 md:py-16">
          <div className="mx-auto max-w-[1280px] px-4 text-center md:px-12">
            <h2 className="font-gtsuper-ds text-3xl font-light text-[#506A70] md:text-5xl">
              Top-Rated Destinations
            </h2>
            <p className="mt-2 font-haas text-lg font-light text-[#506A70]">
              Discover the most sought-after destinations for your next luxury getaway
            </p>
            <button
              type="button"
              onClick={() => router.push('/villas/list')}
              className="mt-3 inline-block font-haas text-sm font-medium text-[#506A70] underline md:hidden"
            >
              View more
            </button>
          </div>

          <div className="relative mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 md:px-0">
            <button
              type="button"
              onClick={() => router.push('/villas/list')}
              className="absolute right-0 -top-8 hidden font-haas text-sm font-medium text-[#506A70] underline md:inline"
            >
              View more
            </button>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {featuredDestinations.map((dest) => {
                const count = destinationStats[dest.locationQuery.toLowerCase()]?.rentalCount ?? 0;
                return (
                  <button
                    key={dest.key}
                    type="button"
                    onClick={() => router.push(`/villas/list?location=${encodeURIComponent(dest.locationQuery)}`)}
                    className="relative flex h-[420px] items-end overflow-hidden text-left md:h-[520px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#506A70]"
                  >
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      style={{ objectPosition: dest.imagePosition }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
                    <div className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white backdrop-blur">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z" stroke="#506A70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-8 px-6 text-white">
                      <h3 className="text-4xl font-gtsuper-ds font-light uppercase md:text-5xl">{dest.name}</h3>
                      <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white text-center">
                        <span className="text-4xl font-light font-gtsuper-ds leading-none">{count}</span>
                        <span className="mt-2 text-[11px] font-haas font-light uppercase tracking-[0.2em] text-white/80 leading-4">{dest.metricLabel}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {secondaryDestinations.map((dest) => {
                const count = destinationStats[dest.locationQuery.toLowerCase()]?.rentalCount ?? 0;
                return (
                  <button
                    key={dest.key}
                    type="button"
                    onClick={() => router.push(`/villas/list?location=${encodeURIComponent(dest.locationQuery)}`)}
                    className="overflow-hidden text-left"
                  >
                    <div className="relative h-64 w-full">
                      <img src={dest.image} alt={dest.name} className="h-full w-full object-cover" style={{ objectPosition: dest.imagePosition }} />
                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border bg-white backdrop-blur">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z" stroke="#506A70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <div className="py-3">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="h-5 w-5 text-[#506A70]" />
                        <span className="font-gtsuper-ds text-2xl uppercase text-[#506A70]">{dest.name}</span>
                      </div>
                      <div className="flex items-center gap-4 -mt-2">
                        <hr className="flex-1 border-t border-[#506A70]" />
                        <span className="text-3xl font-light font-haas text-[#D99330] leading-none">{count}</span>
                      </div>
                      <div className="mt-1 flex justify-end">
                        <span className="text-md font-light font-haas text-[#506A70]">{dest.metricLabel}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section
            id="services"
            className="w-full bg-white md:pb-[80px] [font-family:'Abhaya_Libre',serif]"
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
                        src={homeImg(PAGE_HERO_KEYS.homeConciergeItineraries, '/images/itineraries.png')}
                        alt="Personalized itineraries"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeConciergeItineraries) }}
                      />
                    </div>
                    <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                      PERSONALIZED<br />ITINERARIES
                    </p>
                  </Link>

                  <div className="text-center">
                    <div className="relative w-full pb-[100%]">
                      <img
                        src={homeImg(PAGE_HERO_KEYS.homeConciergeJet, '/images/plane-sea.png')}
                        alt="Jet Rental"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeConciergeJet) }}
                      />
                    </div>
                    <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                      JET RENTAL
                    </p>
                  </div>

                  <Link
                    href={conciergeTypeLink("yacht rental")}
                    aria-label="See concierge services for yacht rental"
                    className="text-center"
                  >
                    <div className="relative w-full pb-[100%]">
                      <img
                        src={homeImg(PAGE_HERO_KEYS.homeConciergeYacht, '/images/yatch.png')}
                        alt="Yacht Rental"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeConciergeYacht) }}
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
                        src={homeImg(PAGE_HERO_KEYS.homeConciergeHelicopter, '/images/helicopter-image.png')}
                        alt="Helicopter"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeConciergeHelicopter) }}
                      />
                    </div>
                    <p className="mt-[10px] font-gtsuper-ds text-[16px] font-light text-[#3C3C50]">
                      HELICOPTER
                    </p>
                  </Link>
                </div>

                {/* Desktop collage (same distribution style as villas) */}
                <div className="hidden md:flex justify-center px-15 gap-6 -translate-x-5">
                  {[
                    {
                      type: "personalized itineraries",
                      label: (
                        <>
                          PERSONALIZED<br />ITINERARIES
                        </>
                      ),
                      img: { src: homeImg(PAGE_HERO_KEYS.homeConciergeItineraries, '/images/itineraries.png'), alt: "Personalized itineraries", pos: homePos(PAGE_HERO_KEYS.homeConciergeItineraries) },
                      imgWrapStyle: { width: 332, height: 322 },
                    },
                    {
                      type: "jet rental",
                      label: "JET RENTAL",
                      img: { src: homeImg(PAGE_HERO_KEYS.homeConciergeJet, '/images/plane-sea.png'), alt: "Jet Rental", pos: homePos(PAGE_HERO_KEYS.homeConciergeJet) },
                      imgWrapStyle: { width: 338, height: 192 },
                    },
                    {
                      type: "yacht rental",
                      label: (
                        <span className="text-[#D99330]">
                          YACHT<br />RENTAL
                        </span>
                      ),
                      img: { src: homeImg(PAGE_HERO_KEYS.homeConciergeYacht, '/images/yatch.png'), alt: "Yacht Rental", pos: homePos(PAGE_HERO_KEYS.homeConciergeYacht) },
                      imgWrapStyle: { width: 338, height: 192 },
                    },
                    {
                      type: "helicopter",
                      label: "HELICOPTER",
                      img: { src: homeImg(PAGE_HERO_KEYS.homeConciergeHelicopter, '/images/helicopter-image.png'), alt: "Helicopter", pos: homePos(PAGE_HERO_KEYS.homeConciergeHelicopter) },
                      imgWrapStyle: { width: 332, height: 322 },
                    },
                  ].map((item, index) => {
                    const itemClassName = `flex flex-col gap-1 hover:text-primary cursor-pointer mt-10 ${
                      index === 0 ? 'translate-x-48 mr-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:translate-x-64 [@media_(min-width:1920px)_and_(max-width:1920px)]:mr-16' : ''
                    } ${
                      index === 1 ? 'translate-y-72 z-10 translate-x-16 mt-8 [@media_(min-width:1920px)_and_(max-width:1920px)]:translate-x-32' : ''
                    } ${
                      index === 2 ? '-translate-x-40 mt-10 [@media_(min-width:1920px)_and_(max-width:1920px)]:-translate-x-60' : ''
                    } ${
                      index === 3 ? '-translate-x-36 [@media_(min-width:1920px)_and_(max-width:1920px)]:-translate-x-56' : ''
                    }`;

                    const itemContent = (
                      <>
                        <div
                          className={`relative overflow-hidden ${index === 1 ? '-mt-3' : ''} ${index === 2 ? 'mt-3' : ''}`}
                          style={item.imgWrapStyle as any}
                        >
                          <img
                            src={item.img.src}
                            alt={item.img.alt}
                            className="h-full w-full object-cover"
                            style={{ objectPosition: item.img.pos }}
                          />
                        </div>
                        <p
                          className={`mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50] ${
                            index === 2 ? 'md:text-right' : 'md:text-left'
                          }`}
                        >
                          {item.label}
                        </p>
                      </>
                    );

                    if (item.type === "jet rental") {
                      return (
                        <div key={item.type} className={itemClassName}>
                          {itemContent}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.type}
                        href={conciergeTypeLink(item.type)}
                        aria-label={`See concierge services for ${item.type}`}
                        className={itemClassName}
                      >
                        {itemContent}
                      </Link>
                    );
                  })}
                </div>

                {/* View all services */}
                <div className="mx-auto mt-10 flex w-full max-w-[1200px] justify-center px-2 md:mt-0 md:justify-end md:-mt-[20px]">
                  <a
                    href="/concierge"
                    className="font-haas text-[15px] text-[#506A70] underline decoration-[#506A70] underline-offset-[3px] hover:opacity-80"
                  >
                    View all services
                  </a>
                </div>
            </div>
            </section>


        {/* === Unforgettable Events === */}
        <section className="bg-white px-4 py-10 md:px-16 md:py-16">
        <div className="mx-auto max-w-[1360px] px-4 text-center md:px-12">
          <h2 className="font-gtsuper-ds text-3xl font-light text-[#506A70] md:text-5xl">
            Unforgettable Events
          </h2>
          <p className="mt-2 font-haas text-lg font-light text-[#506A70]">
            Crafting timeless memories with every occasion
          </p>
        </div>

        {/* Pillars */}
        <div className="mx-auto mt-10 w-full max-w-[1360px] md:mt-16 md:border-y md:border-[#506A70]/25">
          {/* Mobile: horizontal scroll carousel */}
          <div className="relative -mx-4 md:hidden">
            <div
              ref={eventPillarsScrollRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-2 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* Elegance */}
              <article className="w-[78%] shrink-0 snap-center border border-[#506A70]/20 bg-white px-6 py-9 text-center">
                  <h3 className="font-haas text-[13px] font-normal uppercase tracking-[0.2em] text-[#D99330]">
                  Elegance
                  </h3>
                  <p className="mx-auto mt-4 max-w-[240px] font-haas text-[15px] font-thin leading-7 text-[#172338]">
                  Every event reflects refinement and style, creating memorable
                  experiences with elegance.
                  </p>
              </article>

              {/* Personalization */}
              <article className="w-[78%] shrink-0 snap-center border border-[#506A70]/20 bg-white px-6 py-9 text-center">
                  <h3 className="font-haas text-[13px] font-normal uppercase tracking-[0.2em] text-[#D99330]">
                  Personalization
                  </h3>
                  <p className="mx-auto mt-4 max-w-[240px] font-haas text-[15px] font-thin leading-7 text-[#172338]">
                  We focus on tailoring every aspect of your event to match your
                  preferences, ensuring a unique and personalized occasion.
                  </p>
              </article>

              {/* Attention to detail */}
              <article className="w-[78%] shrink-0 snap-center border border-[#506A70]/20 bg-white px-6 py-9 text-center">
                  <h3 className="font-haas text-[13px] font-normal uppercase tracking-[0.2em] text-[#D99330]">
                  Attention to Detail
                  </h3>
                  <p className="mx-auto mt-4 max-w-[240px] font-haas text-[15px] font-thin leading-7 text-[#172338]">
                  Our attention to detail extends from venue selection to logistics,
                  ensuring flawless execution and surpassing expectations.
                  </p>
              </article>
            </div>

            {/* Dots indicator */}
            <div className="mt-5 flex flex-col items-center gap-3 px-4">
              <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Pillar slides">
                {[0, 1, 2].map((i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === activeEventPillarIndex}
                    aria-label={`${i + 1} of 3`}
                    onClick={() => goToEventPillar(i)}
                    className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70] focus-visible:ring-offset-2 ${
                      i === activeEventPillarIndex
                        ? "w-6 bg-[#506A70]"
                        : "w-2 bg-[#506A70]/30 hover:bg-[#506A70]/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 md:divide-x md:divide-[#506A70]/25">
            {/* Elegance */}
            <div className="px-10 py-10 text-center">
                <h3 className="font-haas text-[13px] font-normal uppercase tracking-[0.2em] text-[#D99330]">
                Elegance
                </h3>
                <p className="mx-auto mt-4 max-w-[280px] font-haas text-[15px] font-thin leading-7 text-[#172338]">
                Every event reflects refinement and style, creating memorable
                experiences with elegance.
                </p>
            </div>

            {/* Personalization */}
            <div className="px-10 py-10 text-center">
                <h3 className="font-haas text-[13px] font-normal uppercase tracking-[0.2em] text-[#D99330]">
                Personalization
                </h3>
                <p className="mx-auto mt-4 max-w-[280px] font-haas text-[15px] font-thin leading-7 text-[#172338]">
                We focus on tailoring every aspect of your event to match your
                preferences, ensuring a unique and personalized occasion.
                </p>
            </div>

            {/* Attention to detail */}
            <div className="px-10 py-10 text-center">
                <h3 className="font-haas text-[13px] font-normal uppercase tracking-[0.2em] text-[#D99330]">
                Attention to Detail
                </h3>
                <p className="mx-auto mt-4 max-w-[280px] font-haas text-[15px] font-thin leading-7 text-[#172338]">
                Our attention to detail extends from venue selection to logistics,
                ensuring flawless execution and surpassing expectations.
                </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 grid w-full max-w-[1360px] grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 md:mt-12 md:grid-cols-3 md:gap-6">
          {featuredEvents.map((event) => {
            const href = `/events/${slugify(event.name)}`;
            return (
              <Link
                key={event.id}
                href={href}
                className="group flex h-full min-h-0 flex-col p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:p-5"
              >
                <div className="relative h-[236px] w-full shrink-0 overflow-hidden bg-[#E8EBED] md:h-[256px] lg:h-[268px]">
                  <img
                    src={optimizedImageUrl(event.image, 828)}
                    alt={event.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-4 pt-5 md:gap-4 md:pt-6">
                  <div className="w-full shrink-0">
                    <h3 className="flex min-h-[48px] items-end break-words font-gtsuper-ds text-[22px] font-light uppercase leading-[1.1] text-[#506A70] md:min-h-[53px] md:text-[24px] lg:min-h-[57px] lg:text-[26px]">
                      {event.name}
                    </h3>
                    <div className="mt-2 w-full border-b border-[#D99330] md:mt-3" />
                  </div>
                  <p className="font-haas text-[15px] font-light leading-relaxed text-[#172338] line-clamp-6 md:text-base md:leading-[1.65]">
                    {event.summary}
                  </p>
                  <span className="mt-auto inline-flex shrink-0 items-center pt-1 font-haas text-[15px] font-normal text-[#506A70] underline underline-offset-4 transition-opacity group-hover:opacity-70 md:text-base">
                    More info
                    <ChevronRight className="ml-1 h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]" aria-hidden />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {eventsError && (
          <p className="mt-4 text-center font-haas text-sm text-[#D04444]">{eventsError}</p>
        )}

        <div className="mx-auto mt-14 flex w-full max-w-[1360px] flex-col items-center gap-6 border-t border-[#506A70]/25 pt-10 md:mt-16 md:flex-row md:items-center md:justify-between">
            <span className="hidden md:block" />
            <button
                onClick={() => router.push('/events')}
                className="flex items-center rounded-none bg-[#28F7EA] px-6 py-4 font-haas font-thin text-[#172338]"
            >
            Plan Your Event With Us Today!
            <ChevronRight className="ml-2 h-4 w-4" />
            </button>
            <button
                onClick={() => router.push('/events')}
                className="font-haas text-[14px] underline text-[#506A70]"
            >
                View all events
            </button>
        </div>
        </section>


        {/* REAL ESTATE INTRO */}
        <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden md:min-h-[560px]">
          <img
            src={homeImg(PAGE_HERO_KEYS.homeRealEstateIntro, '/images/villa-detail@2x.png')}
            alt="Exclusive Greek properties"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeRealEstateIntro) }}
          />
          <div className="absolute inset-0 bg-[#172338]/60" />
          <div className="relative z-10 mx-auto max-w-[1100px] px-6 py-16 text-center md:py-24">
            <h2 className="font-gtsuper-ds text-3xl font-light uppercase text-white md:text-5xl">
              {realEstateIntroTitle ? (
                <span className="whitespace-pre-line">{realEstateIntroTitle}</span>
              ) : (
                <>
                  Exclusive Greek Properties <br className="hidden md:block" />& Luxury Developments
                </>
              )}
            </h2>
            <p className="mx-auto mt-6 max-w-[900px] whitespace-pre-line font-haas text-base font-light leading-7 text-white/90 md:text-lg">
              {realEstateIntroSubtitle ||
                "Specializing in premium sales across Greece, Kennedys Group brings together an extraordinary portfolio of elite private homes, luxury resorts, and high-yield investment developments. From the pristine coastlines of the Athenian Riviera to the iconic vistas of Mykonos and the Cyclades, we connect discerning buyers and investors with the country's most exceptional real estate opportunities."}
            </p>
          </div>
        </section>

        {/* LUXURY REAL ESTATE */}
        <section className="mx-auto max-w-[1440px] p-4 md:p-6 md:p-20">
          <Link href="/real-estate" className="relative flex h-[260px] items-center justify-center md:h-[519px] cursor-pointer">
            <img
              src={homeImg(PAGE_HERO_KEYS.homeRealEstateBanner, '/images/luxurystate.png')}
              alt="Real estate banner"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: homePos(PAGE_HERO_KEYS.homeRealEstateBanner) }}
            />
            <h2 className="relative z-10 text-center font-gtsuper-ds text-[48px] md:text-[100px] font-light uppercase text-white px-4 leading-none">
              Real Estate
            </h2>
          </Link>

          <div className="mt-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-gtsuper-ds text-xl text-[#506A70] uppercase font-light">Most Popular</h3>
              <Link href="/real-estate" className="font-haas text-sm text-[#506A70] font-normal underline">View All</Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {saleCards.map((card, index) => {
                const canToggle = Boolean(card.id && !card.id.startsWith('fallback'))
                const liked = canToggle ? homeIsLiked(card.id) : false
                const pending = canToggle && homePendingIds.has(card.id)

                return (
                  <div key={card.id} className={`group relative ${index >= 3 ? 'hidden md:block' : ''}`}>
                    <Link href={canToggle ? card.href || `/real-estate/${card.id}` : '/real-estate'} className="flex flex-col">
                      <div className="h-[160px] w-full overflow-hidden md:h-[200px]">
                        <img
                          src={optimizedImageUrl(card.image, 828)}
                          alt={card.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-4 flex flex-col gap-1">
                        <h4 className="font-haas text-lg text-[#172338] whitespace-nowrap">{card.priceLabel}</h4>
                        {card.locationLabel && (
                          <span className="font-haas text-xs uppercase tracking-wide text-[#506A70] truncate">{card.locationLabel}</span>
                        )}
                      </div>
                    </Link>
                    <button
                      type="button"
                      aria-label="Toggle favourite"
                      aria-pressed={liked}
                      disabled={!canToggle || pending}
                      className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-sm transition-opacity hover:opacity-80 disabled:opacity-60"
                      onClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                        if (!canToggle || pending) return
                        if (!isAuthenticated) { router.push('/login?returnTo=' + encodeURIComponent(router.asPath)); return }
                        homeToggleFavorite(card.id)
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 18 18" fill={liked ? '#B17520' : 'none'} xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z" stroke={liked ? '#B17520' : '#506A70'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
            {salesError && (
              <p className="mt-4 text-sm font-haas text-[#D04444]">{salesError}</p>
            )}
            {likesError && (
              <p className="mt-2 text-sm font-haas text-[#D04444] cursor-pointer" onClick={() => clearLikesError()}>
                {likesError}
              </p>
            )}
          </div>
        </section>

        <ListYourPropertyBanner />

        {testimonials.length > 0 && <TestimonialsSection testimonials={testimonials} />}

        {(() => {
          const clientsBlockData = getBlockDataForType(pageBlocks, 'clients-strip');
          const shouldShowClients = pageBlocks.some(pb => pb.blockType === 'clients-strip' && pb.enabled);
          if (shouldShowClients || clientsBlockData) {
            return <ClientsStrip data={clientsBlockData} />;
          }
          return null;
        })()}
      </main>

      <Footer disableTravelSection={true} />
    </div>
  );
};

const DESTINATION_LOCATIONS_SSR = ['Mykonos', 'Ibiza', 'Paros', 'Saint Tropez'];

const HOME_IMAGE_KEYS = [
  PAGE_HERO_KEYS.homeHero,
  PAGE_HERO_KEYS.homeServiceRealEstate,
  PAGE_HERO_KEYS.homeServiceVacationRentals,
  PAGE_HERO_KEYS.homeServiceGlobalConcierge,
  PAGE_HERO_KEYS.homeServiceTravelDesign,
  PAGE_HERO_KEYS.homeServiceEventProduction,
  PAGE_HERO_KEYS.homeServiceVillaManagement,
  PAGE_HERO_KEYS.homeDestinationMykonos,
  PAGE_HERO_KEYS.homeDestinationIbiza,
  PAGE_HERO_KEYS.homeDestinationParos,
  PAGE_HERO_KEYS.homeDestinationSaintTropez,
  PAGE_HERO_KEYS.homeRealEstateIntro,
  PAGE_HERO_KEYS.homeRealEstateBanner,
  PAGE_HERO_KEYS.homeLuxuryVillaImage,
  PAGE_HERO_KEYS.homeConciergeItineraries,
  PAGE_HERO_KEYS.homeConciergeJet,
  PAGE_HERO_KEYS.homeConciergeYacht,
  PAGE_HERO_KEYS.homeConciergeHelicopter,
] as const;

const realEstateIntroIdx = HOME_IMAGE_KEYS.indexOf(PAGE_HERO_KEYS.homeRealEstateIntro);

export async function getServerSideProps() {
  try {
    const mapSaleProperty = (property: any): RealEstateCard | null => {
      if (!property) return null;
      const images = Array.isArray(property.images) ? property.images : [];
      const primaryImage = images.find((img: any) => img?.isPrimary) || images[0];
      const imageUrl = resolveMediaUrl(primaryImage?.urlImage || primaryImage?.url || '') || '/images/luxurystate.png';
      const classification = property.classification ?? {};
      const bedrooms = classification?.bedrooms ?? property?.bedrooms ?? null;
      const baths = classification?.baths ?? property?.baths ?? null;
      const size = classification?.indoorArea ?? property?.indoorArea ?? property?.propertySize ?? null;
      const sizeLabel = size ? `${size} sq.m` : null;
      return {
        id: property.id ?? property.title ?? 'unknown',
        title: property.title ?? 'Property',
        priceLabel: formatCurrency(property.sale_price, getPropertyPriceCurrencySymbol(property)),
        locationLabel: [property.visibleLocation, property.location, property.region, property.country].filter(Boolean).join(', ') || 'Location upon request',
        bedrooms: bedrooms ?? null,
        baths: baths ?? null,
        sizeLabel,
        image: imageUrl,
        href: buildRealEstateDetailPath(property),
      };
    };

    const [salesRes, statsRes, eventsRes, reviewsRes, pageBlocks, homePageConfig, ...homeImageResults] = await Promise.all([
      getAllProperties({ rental: false, category: 'real-estate', take: 4 }),
      getPropertyLocationStats(DESTINATION_LOCATIONS_SSR),
      getAllEvents({ listing: 1 }),
      getReviews({ page: 1, pageSize: 1000, published: true }),
      getPageBlocksData('home'),
      fetchPageByKeyServer('home').catch(() => null),
      ...HOME_IMAGE_KEYS.map(key => fetchPageByKeyServer(key).catch(() => null)),
    ]);

    const initialHomeImages: Record<string, string> = {};
    const initialHomePositions: Record<string, string> = {};
    HOME_IMAGE_KEYS.forEach((key, i) => {
      initialHomeImages[key] = resolvePageHeroImage(key, homeImageResults[i]?.heroBannerPath);
      if (homeImageResults[i]?.heroBannerPosition) {
        initialHomePositions[key] = homeImageResults[i]!.heroBannerPosition!;
      }
    });

    const salesData = normalizePropertiesResponse(salesRes);
    const initialFeaturedSales = salesData.map((p: any) => mapSaleProperty(p)).filter((c: RealEstateCard | null): c is RealEstateCard => Boolean(c));

    const statsArray = Array.isArray(statsRes?.data) ? statsRes.data : [];
    const initialDestinationStats = statsArray.reduce((acc: Record<string, { rentalCount: number; saleCount: number; total: number }>, item: any) => {
      if (item?.location) acc[item.location.toLowerCase()] = { rentalCount: item.rentalCount ?? 0, saleCount: item.saleCount ?? 0, total: item.total ?? 0 };
      return acc;
    }, {});

    const eventsData = Array.isArray(eventsRes?.data) ? eventsRes.data : [];
    const sorted = [...eventsData].sort((a: any, b: any) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime());
    const initialFeaturedEvents: HomeEventCard[] = sorted.slice(0, 3).map((event: any) => ({
      id: event?.id ?? 'unknown',
      name: event?.name ?? 'Upcoming Event',
      summary: event?.summary ?? 'Details coming soon.',
      image: resolveMediaUrl(event?.image || '') || '/images/events-1.png',
      gallery: Array.isArray(event?.gallery) ? event.gallery.map((item: string) => resolveMediaUrl(item)) : [],
    }));

    const reviewItems = reviewsRes?.data?.items ?? [];
    const initialTestimonials = reviewItems.length ? reviewItems.map((r: any, idx: number) => ({
      id: r.id || idx,
      text: r.body || r.subtitle || r.title || '',
      name: r.authorName || 'Guest',
      occupation: r.authorRole || '',
      image: resolveMediaUrl(r.avatarUrl) || 'https://placehold.co/80x80',
      rating: r.rating || 5,
    })) : undefined;

    const seoMeta = {
      title: homePageConfig?.metaTitle ?? `Discover your next adventure | ${SITE_NAME}`,
      description: homePageConfig?.metaDescription ?? "Luxury vacation rentals, prime real estate, global concierge, travel design, and events in destinations including Mykonos, Ibiza, Courchevel, and Tulum.",
      imageUrl: homePageConfig?.metaImageUrl ?? "https://kennedysgroup.com/images/home/home-image.webp",
    };

    return {
      props: {
        initialFeaturedSales,
        initialDestinationStats,
        initialFeaturedEvents,
        initialTestimonials: initialTestimonials ?? [],
        initialPageBlocks: Array.isArray(pageBlocks) ? pageBlocks : [],
        initialSeoMeta: seoMeta,
        initialHomeImages,
        initialHomePositions,
        heroTitle: homeImageResults[0]?.heroTitle || null,
        realEstateIntroTitle: homeImageResults[realEstateIntroIdx]?.heroTitle || null,
        realEstateIntroSubtitle: homeImageResults[realEstateIntroIdx]?.heroSubtitle || null,
      },
    };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps home:', err);
    return {
      props: {
        initialFeaturedSales: [],
        initialDestinationStats: {},
        initialFeaturedEvents: [],
        initialTestimonials: [],
        initialPageBlocks: [],
        initialHomeImages: {},
        initialHomePositions: {},
        initialSeoMeta: {
          title: `Discover your next adventure | ${SITE_NAME}`,
          description: "Luxury vacation rentals, prime real estate, global concierge, travel design, and events in destinations including Mykonos, Ibiza, Courchevel, and Tulum.",
          imageUrl: "https://kennedysgroup.com/images/home/home-image.webp",
        },
      },
    };
  }
}

export default KennedysHomepage;
