import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ConciergePackagesSection } from './ConciergePackagesSection'
import { getAllServices } from '@/lib/api/services'
import {
  ConciergeServicePreview,
  mapServiceToPreview,
} from '@/lib/mappers/concierge'
import { wsrvUrl } from '@/lib/utils'
import { PAGE_HERO_KEYS } from '@/lib/pageHeroBanner'
import type { ConciergeLocationImages } from '@/pages/concierge/index'

// Helper function to map service title to concierge type
const getConciergeTypeFromTitle = (title: string): string => {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('yacht')) return 'yacht rental'
  if (titleLower.includes('itinerar')) return 'personalized itineraries'
  if (titleLower.includes('jet') || titleLower.includes('charter')) return 'jet rental'
  if (titleLower.includes('helicopter')) return 'helicopter'
  if (titleLower.includes('chauffeur')) return 'chauffeur'
  return 'concierge'
}

const conciergeTypeLink = (type: string) => ({
  pathname: '/concierge/list',
  query: { type },
})

const FEATURED_PLACEHOLDERS = [
  { title: 'YACHTS', image: '/images/yacht-image.jpg', type: 'yacht rental' },
  { title: 'PERSONALIZED ITINERARIES', image: '/images/itineraries.png', type: 'personalized itineraries' },
  { title: 'JETS CHARTER', image: '/images/plane-image.png', type: 'jet rental' },
  { title: 'HELICOPTERS', image: '/images/helicopter-image.png', type: 'helicopter' },
  { title: 'CHAUFFEURS', image: '/images/chauffeur-service.png', type: 'chauffeur' },
] as const

const FAVORITE_CARD_PLACEHOLDERS = [
  {
    fallbackTitle: 'PERSONALIZED ITINERARIES',
    image: '/images/itineraries.png',
    wrapperClass:
      'flex-1 basis-[200px] max-w-[340px] md:max-w-[400px] text-center md:mt-[50px] md:text-left md:z-30 md:ml-[7%]',
    imageClass: 'w-full h-auto',
    titleClass: 'mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50]',
  },
  {
    fallbackTitle: 'YACHT RENTAL',
    image: '/images/yatch.png',
    wrapperClass:
      'flex-1 basis-[200px] max-w-[340px] md:max-w-[400px] text-center md:mt-[380px] lg:mt-[420px] md:text-left md:z-20 md:-ml-[3%]',
    imageClass: 'w-full h-auto md:-translate-y-4 lg:-translate-y-6',
    titleClass: 'relative z-40 font-gtsuper-ds text-[20px] font-light text-[#3C3C50]',
  },
  {
    fallbackTitle: 'JET RENTAL',
    image: '/images/plane-sea.png',
    wrapperClass:
      'flex-1 basis-[200px] max-w-[340px] md:mr-16 md:max-w-[400px] text-center md:-ml-[20%] md:mt-[80px] md:text-right md:z-10',
    imageClass: 'w-full h-auto',
    titleClass:
      'mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50] text-[#D99330]',
  },
  {
    fallbackTitle: 'HELICOPTER',
    image: '/images/helicopter-image.png',
    wrapperClass:
      'flex-1 basis-[200px] max-w-[340px] md:max-w-[400px] text-center md:-ml-[2%] md:mt-[50px] md:text-left md:z-10',
    imageClass: 'w-full h-auto',
    titleClass: 'mt-[10px] font-gtsuper-ds text-[20px] font-light text-[#3C3C50]',
  },
] as const

const LOCATION_CARD_CONFIGS = [
  {
    fallback: 'MYKONOS',
    pageKey: PAGE_HERO_KEYS.conciergeLocationMykonos,
    image: '/images/Mykonos-image.jpg',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[527px] md:col-span-3 row-span-2 border',
  },
  {
    fallback: 'IBIZA',
    pageKey: PAGE_HERO_KEYS.conciergeLocationIbiza,
    image: '/images/homeibiza.jpg',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[527px] md:col-span-3 row-span-2 border',
  },
  {
    fallback: 'PAROS',
    pageKey: PAGE_HERO_KEYS.conciergeLocationParos,
    image: '/images/paros-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[527px] md:col-span-3 row-span-2 border',
  },
  {
    fallback: 'SAINT TROPEZ',
    pageKey: PAGE_HERO_KEYS.conciergeLocationSaintTropez,
    image: '/images/saint-tropez-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[527px] md:col-span-3 row-span-2 border',
  },
  {
    fallback: 'BODRUM',
    pageKey: PAGE_HERO_KEYS.conciergeLocationBodrum,
    image: '/images/bodrum-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[404px] md:col-span-4 row-span-2 border',
  },
  {
    fallback: 'SAINT BARTH',
    pageKey: PAGE_HERO_KEYS.conciergeLocationSaintBarth,
    image: '/images/saint-barth-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[404px] md:col-span-8 row-span-2 border',
  },
  {
    fallback: 'COURCHEVEL',
    pageKey: PAGE_HERO_KEYS.conciergeLocationCourchevel,
    image: '/images/courchevel-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[314px] md:col-span-4 row-span-2 border',
  },
  {
    fallback: 'TULUM',
    pageKey: PAGE_HERO_KEYS.conciergeLocationTulum,
    image: '/images/tulum-image2.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[314px] md:col-span-4 row-span-2 border',
  },
  {
    fallback: 'COSTA RICA',
    pageKey: PAGE_HERO_KEYS.conciergeLocationCostaRica,
    image: '/images/COSTA RICA-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[314px] md:col-span-4 row-span-2 border',
  },
  {
    fallback: 'ATHENS RIVIERA',
    pageKey: PAGE_HERO_KEYS.conciergeLocationAthensRiviera,
    image: '/images/Mykonos-image.jpg',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[411px] md:col-span-6 row-span-2 border',
  },
  {
    fallback: 'GREEK ISLANDS',
    pageKey: PAGE_HERO_KEYS.conciergeLocationGreekIslands,
    image: '/images/greek-island-image.png',
    className:
      'relative justify-center flex flex-col items-center h-40 md:h-[411px] md:col-span-6 row-span-2 border',
  },
] as const

const uppercase = (value?: string | null) => (value ? value.toUpperCase() : '')

// Función para convertir título en mayúsculas a formato capitalizado para URL
// Ej: "MYKONOS" -> "Mykonos", "SAINT TROPEZ" -> "Saint Tropez"
const titleToLocationParam = (title: string): string => {
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

interface FeaturedCard {
  title: string
  image: string
  type?: string
  id?: string
}

interface FavoriteCard {
  title: string
  image: string
  wrapperClass: string
  imageClass: string
  titleClass: string
}

interface LocationCard {
  title: string
  image: string
  className: string
}

type KennedysConciergePageProps = {
  initialRawServices?: any[];
  locationImages?: ConciergeLocationImages;
  featuredImages?: Record<string, string>;
  packagesImages?: { image1?: string; image2?: string; image3?: string };
  favoritesImages?: Record<string, string>;
};

export const KennedysConciergePage = ({ initialRawServices = [], locationImages = {}, featuredImages = {}, packagesImages, favoritesImages = {} }: KennedysConciergePageProps = {}) => {
  const initialPreviews = initialRawServices
    .map((service: any) => mapServiceToPreview(service))
    .filter((item: ConciergeServicePreview) => Boolean(item.id))
  const [services, setServices] = useState<ConciergeServicePreview[]>(initialPreviews)
  const [rawServices, setRawServices] = useState<any[]>(initialRawServices)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialRawServices.length) return
    let isMounted = true

    const loadServices = async () => {
      setError(null)
      try {
        const response = await getAllServices({ published: true, forWebsite: true })
        if (!isMounted) return
        const data = Array.isArray(response?.data) ? response.data : []
        const previews = data
          .map((service: any) => mapServiceToPreview(service))
          .filter((item: ConciergeServicePreview) => Boolean(item.id))
        setRawServices(data)
        setServices(previews)
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.error('Failed to load concierge services', err)
        if (isMounted) setError('We could not load concierge services. Please try again later.')
      }
    }

    loadServices()
    return () => { isMounted = false }
  }, [initialRawServices.length])

  const featuredCards: FeaturedCard[] = useMemo(() => {
    return FEATURED_PLACEHOLDERS.map(placeholder => ({
      title: placeholder.title,
      image: featuredImages[placeholder.type] || placeholder.image,
      type: placeholder.type,
      id: undefined,
    }))
  }, [featuredImages])

  const favoriteCards: FavoriteCard[] = useMemo(() => {
    const mapped = services.slice(0, FAVORITE_CARD_PLACEHOLDERS.length).map((service, index) => {
      const placeholder = FAVORITE_CARD_PLACEHOLDERS[index]
      return {
        title: uppercase(service.name || service.type),
        image: service.image,
        wrapperClass: placeholder.wrapperClass,
        imageClass: placeholder.imageClass,
        titleClass: placeholder.titleClass,
      }
    })

    while (mapped.length < FAVORITE_CARD_PLACEHOLDERS.length) {
      const placeholder = FAVORITE_CARD_PLACEHOLDERS[mapped.length]
      mapped.push({
        title: placeholder.fallbackTitle,
        image: placeholder.image,
        wrapperClass: placeholder.wrapperClass,
        imageClass: placeholder.imageClass,
        titleClass: placeholder.titleClass,
      })
    }

    return mapped
  }, [services])

  const locationCards: LocationCard[] = useMemo(
    () =>
      LOCATION_CARD_CONFIGS.map((config) => ({
        title: config.fallback,
        image: locationImages[config.pageKey] || config.image,
        className: config.className,
      })),
    [locationImages]
  )

  return (
    <div className="bg-[#fff] h-full px-4 md:px-24 pt-10">
      {/* 1. Featured Services Section */}
      <section className="bg-[#fff] -mx-4 md:-mx-24 px-4 md:px-24 pb-10 relative">
        <div className="hidden md:block w-full">
          <div className="grid w-full grid-cols-5 gap-2 md:gap-3 xl:gap-4 max-w-[1920px] mx-auto">
            <h1 className="col-span-5 text-left text-4xl font-gtsuper-ds font-light">Featured Services</h1>
            {featuredCards.map((card, index) => {
              const href = card.id 
                ? `/concierge/${card.id}`
                : card.type
                ? { pathname: '/concierge/list', query: { type: card.type } }
                : '/concierge/list'
              
              return (
                <Link key={`${card.title}-${index}`} href={href} className="cursor-pointer min-w-0">
                  <div className="relative w-full aspect-[248/440] overflow-hidden hover:opacity-90 transition-opacity">
                    <img
                      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                      src={wsrvUrl(card.image, { w: 496, h: 880, q: 100 })}
                      alt={card.title}
                    />
                    <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 pl-4 pr-4 text-left bg-gradient-to-t from-black/60 to-transparent">
                      <h2 className="font-gtsuper-ds font-light text-white tracking-wide">{card.title}</h2>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="md:hidden">
          <h1 className="text-2xl font-gtsuper-ds font-light mb-3 text-left">Featured Services</h1>
          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2">
            {featuredCards.map((card, index) => {
              const href = card.id 
                ? `/concierge/${card.id}`
                : card.type
                ? { pathname: '/concierge/list', query: { type: card.type } }
                : '/concierge/list'
              
              return (
                <Link key={`${card.title}-${index}`} href={href} className="cursor-pointer">
                  <div className="min-w-[220px] h-64 relative overflow-hidden snap-start hover:opacity-90 transition-opacity">
                    <img
                      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                      src={wsrvUrl(card.image, { w: 440, h: 512, q: 100 })}
                      alt={card.title}
                    />
                    <div className="absolute inset-x-0 bottom-0 pt-10 pb-3 pl-4 pr-4 text-left bg-gradient-to-t from-black/60 to-transparent">
                      <h2 className="font-gtsuper-ds font-light text-white tracking-wide">{card.title}</h2>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm font-haas text-[#D04444]">
            {error}
          </p>
        )}
      </section>

      {/* 2. Luxury Concierge Packages Section */}
      <ConciergePackagesSection data={packagesImages} />

      {/* 3. Where to Find Our Concierge Services Section */}
      <section className="pb-10">
        <div className="flex flex-col w-full items-center justify-center mt-10">
          <h1 className="text-3xl md:text-4xl mb-10 text-center font-gtsuper-ds font-thin text-soft-gray-dark">
            WHERE TO FIND OUR CONCIERGE SERVICES
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-12 gap-5 clear-start w-full">
            {locationCards.map((card, index) => {
              const locationParam = titleToLocationParam(card.title)
              const href = `/concierge/list?location=${encodeURIComponent(locationParam)}`
              
              return (
                <Link 
                  key={`${card.title}-${index}`} 
                  href={href}
                  className="contents cursor-pointer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className={`${card.className} hover:opacity-90 transition-opacity`}>
                    <img
                      className="absolute w-full h-full brightness-[0.85] object-cover pointer-events-none"
                      src={wsrvUrl(card.image, { w: 1600, q: 100 })}
                      alt={card.title}
                    />
                    <span className="text-2xl md:text-4xl text-center font-gtsuper-ds font-light text-white z-10">
                      {card.title}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Concierge for Us is an Art Section */}
      <section className="bg-[#F0F3F5] flex flex-col items-center justify-center mt-10 relative -mx-4 md:-mx-24">
        <div className="flex flex-col w-full items-center justify-center h-64 md:h-[419px] relative">
          <img
            className="h-64 md:h-[419px] w-full object-cover brightness-[0.85] absolute"
            src="/images/outdoor-image.png"
            alt="Concierge backdrop"
          />

          <h1 className="text-3xl md:text-7xl font-gtsuper-ds font-light uppercase text-white z-10 text-center">
            Concierge <br className="hidden md:block" />
            for us
            <br className="hidden md:block" />
            is an Art
          </h1>
        </div>
        <div className="text-center mt-10 mb-10 break-words max-w-[83ch] px-4 md:px-0">
          <p className="text-base md:text-lg font-haas font-light text-soft-gray-dark">
            We craft tailor-made itineraries to exceed each guest&apos;s unique expectations. From exclusive venue bookings
            and luxury experiences to VIP yacht rentals and personalized dining adventures, our services are designed to
            make the impossible possible. With years of expertise and unparalleled connections, we ensure every experience
            is exceptional. Let us transform your travel dreams into reality.
          </p>
        </div>
      </section>

      {/* 5. People's Favorite Concierge Services Section */}
      <section
      id="services"
      className="w-full bg-white pb-0 md:pb-[80px] [font-family:'Abhaya_Libre',serif]"
      >
      <div className="mx-auto text-center px-4 pt-16 pb-6 md:py-16">
          <h2 className="text-center font-gtsuper-ds text-5xl mb-4 font-thin text-[#506A70]">
          People's favorite concierge services.
          </h2>
          {/* Mobile/tablet grid 2x2 */}
          <div className="grid grid-cols-2 gap-4 md:hidden">
            <Link
              href={conciergeTypeLink("personalized itineraries")}
              aria-label="See concierge services for personalized itineraries"
              className="text-center"
            >
              <div className="relative w-full pb-[100%]">
                <img
                  src={favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesItineraries] || "/images/itineraries.png"}
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
                  src={favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesJet] || "/images/plane-sea.png"}
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
                  src={favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesYacht] || "/images/yatch.png"}
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
                  src={favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesHelicopter] || "/images/helicopter-image.png"}
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
          <div className="hidden md:flex justify-center px-15 gap-6 -translate-x-5">
            {[
              {
                type: "personalized itineraries",
                label: (
                  <>
                    PERSONALIZED<br />ITINERARIES
                  </>
                ),
                img: { src: favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesItineraries] || "/images/itineraries.png", alt: "Personalized itineraries" },
                imgWrapStyle: { width: 332, height: 322 },
              },
              {
                type: "jet rental",
                label: "JET RENTAL",
                img: { src: favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesJet] || "/images/plane-sea.png", alt: "Jet Rental" },
                imgWrapStyle: { width: 338, height: 192 },
              },
              {
                type: "yacht rental",
                label: (
                  <span className="text-[#D99330]">
                    YACHT<br />RENTAL
                  </span>
                ),
                img: { src: favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesYacht] || "/images/yatch.png", alt: "Yacht Rental" },
                imgWrapStyle: { width: 338, height: 192 },
              },
              {
                type: "helicopter",
                label: "HELICOPTER",
                img: { src: favoritesImages[PAGE_HERO_KEYS.conciergeFavoritesHelicopter] || "/images/helicopter-image.png", alt: "Helicopter" },
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
          <div className="relative z-10 mx-auto mt-10 flex w-full max-w-[1200px] justify-center px-2 md:-mt-[20px] md:justify-end">
            <Link
              href="/concierge/list"
              className="font-haas text-[15px] text-[#506A70] underline decoration-[#506A70] underline-offset-[3px] hover:opacity-80"
            >
              View all services
            </Link>
          </div>
      </div>
      </section>
    </div>
  )
}
