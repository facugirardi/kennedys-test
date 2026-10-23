import React, { useMemo, useState } from 'react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { KennedysConciergePage } from '@/components/KennedysConciergePage'
import { ServiceSearch } from '@/components/custom/ServiceSearch'
import { getAllServices } from '@/lib/api/services'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import { PAGE_HERO_KEYS, resolvePageHeroImage } from '@/lib/pageHeroBanner'
import { collectUniqueLocations } from '@/lib/mappers/concierge'

export type ConciergeLocationImages = Record<string, string>

const DEFAULT_HERO_TITLE = 'GLOBAL CONCIERGE'
const DEFAULT_HERO_SUBTITLE = "Welcome to Kennedy's Group Way of Life,\nwe promise to live up to your highest expectations."

type ConciergePageProps = {
  initialRawServices?: any[];
  initialHeroBannerUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  locationImages?: ConciergeLocationImages;
  featuredImages?: Record<string, string>;
  packagesImages?: { image1?: string; image2?: string; image3?: string };
  favoritesImages?: Record<string, string>;
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

export const KennedysConcierge = ({ initialRawServices = [], initialHeroBannerUrl, heroTitle = DEFAULT_HERO_TITLE, heroSubtitle = DEFAULT_HERO_SUBTITLE, locationImages = {}, featuredImages = {}, packagesImages, favoritesImages = {}, initialSeoMeta }: ConciergePageProps) => {
  const heroImg =
    (initialHeroBannerUrl && initialHeroBannerUrl.trim()) ||
    resolvePageHeroImage(PAGE_HERO_KEYS.conciergeList, null)
  const [typeOfService, setTypeOfService] = useState('')
  const [location, setLocation] = useState('')
  const availableLocations = useMemo(
    () => collectUniqueLocations(initialRawServices),
    [initialRawServices],
  )

  return (
    <>
      <SeoHead
        title={initialSeoMeta?.title || `Global concierge & lifestyle services | ${SITE_NAME}`}
        description={initialSeoMeta?.description || "Private concierge — travel design, dining, access, and day-to-day lifestyle support in the world's top destinations."}
        canonicalPath="/concierge"
        imageUrl={initialSeoMeta?.imageUrl || heroImg || undefined}
      />
      <div className="h-full mb-2 md:mb-10 bg-[#fff]">
        {/* HERO */}
        <div className="relative z-10 h-[360px] md:h-[685px] w-full overflow-visible">
          <img
            className="absolute inset-0 h-full w-full object-cover brightness-[1]"
            src={heroImg}
            alt=""
          />

          {/* Navbar blanco por encima */}
          <Navbar textBlack={true} stickyOnScroll stickyRestBg="bg-white" className="absolute left-0 top-0 z-30 w-full bg-white" />

          {/* Overlay y títulos */}
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex flex-col items-center px-4">
              <h1 className="text-3xl md:text-6xl xl:text-8xl font-gtsuper-ds font-light uppercase text-white text-center leading-[0.95]">
                {heroTitle}
              </h1>
              <p className="font-haas text-sm md:text-lg text-center text-white max-w-2xl whitespace-pre-line">
                {heroSubtitle}
              </p>
            </div>
          </div>

          {/* Card de búsqueda flotante (solo desktop) */}
          <div className="hidden md:block absolute left-1/2 -bottom-10 -translate-x-1/2 z-40 w-full px-4 overflow-visible">
            <div className="relative z-40 mx-auto w-full max-w-[1200px] flex justify-center align-center shadow-md bg-[white] p-5 ring-1 ring-black/5 overflow-visible">
              <ServiceSearch
                typeOfService={typeOfService}
                location={location}
                onTypeOfServiceChange={setTypeOfService}
                onLocationChange={setLocation}
                initialServicesForTypes={initialRawServices}
                availableLocations={availableLocations}
              />
            </div>
          </div>
        </div>

        {/* ServiceSearch debajo del header (solo mobile) */}
        <div className="md:hidden relative z-10 w-full px-4 mt-6 overflow-visible">
          <div className="mx-auto w-full max-w-[1200px] flex justify-center align-center shadow-md bg-[white] p-3 ring-1 ring-black/5 overflow-visible">
            <ServiceSearch
              typeOfService={typeOfService}
              location={location}
              onTypeOfServiceChange={setTypeOfService}
              onLocationChange={setLocation}
              initialServicesForTypes={initialRawServices}
              availableLocations={availableLocations}
            />
          </div>
        </div>

        {/* Contenido debajo del hero */}
        <div className="w-full mt-10 md:mt-16">
          <KennedysConciergePage initialRawServices={initialRawServices} locationImages={locationImages} featuredImages={featuredImages} packagesImages={packagesImages} favoritesImages={favoritesImages} />
        </div>
      </div>

      <Footer disableTravelSection={true} />
    </>
  )
}

const LOCATION_PAGE_KEYS = [
  PAGE_HERO_KEYS.conciergeLocationMykonos,
  PAGE_HERO_KEYS.conciergeLocationIbiza,
  PAGE_HERO_KEYS.conciergeLocationParos,
  PAGE_HERO_KEYS.conciergeLocationSaintTropez,
  PAGE_HERO_KEYS.conciergeLocationBodrum,
  PAGE_HERO_KEYS.conciergeLocationSaintBarth,
  PAGE_HERO_KEYS.conciergeLocationCourchevel,
  PAGE_HERO_KEYS.conciergeLocationTulum,
  PAGE_HERO_KEYS.conciergeLocationCostaRica,
  PAGE_HERO_KEYS.conciergeLocationAthensRiviera,
  PAGE_HERO_KEYS.conciergeLocationGreekIslands,
] as const

const FEATURED_PAGE_KEYS = [
  PAGE_HERO_KEYS.conciergeFeaturedYachts,
  PAGE_HERO_KEYS.conciergeFeaturedItineraries,
  PAGE_HERO_KEYS.conciergeFeaturedJets,
  PAGE_HERO_KEYS.conciergeFeaturedHelicopters,
  PAGE_HERO_KEYS.conciergeFeaturedChauffeurs,
] as const

const PACKAGES_PAGE_KEYS = [
  PAGE_HERO_KEYS.conciergePackages1,
  PAGE_HERO_KEYS.conciergePackages2,
  PAGE_HERO_KEYS.conciergePackages3,
] as const

const FAVORITES_PAGE_KEYS = [
  PAGE_HERO_KEYS.conciergeFavoritesItineraries,
  PAGE_HERO_KEYS.conciergeFavoritesJet,
  PAGE_HERO_KEYS.conciergeFavoritesYacht,
  PAGE_HERO_KEYS.conciergeFavoritesHelicopter,
] as const

export async function getServerSideProps() {
  try {
    const allKeys = [
      PAGE_HERO_KEYS.conciergeList,
      ...LOCATION_PAGE_KEYS,
      ...FEATURED_PAGE_KEYS,
      ...PACKAGES_PAGE_KEYS,
      ...FAVORITES_PAGE_KEYS,
    ]
    const [response, seoRow, ...pageRows] = await Promise.all([
      getAllServices({ published: true, forWebsite: true }),
      fetchPageByKeyServer('concierge-index').catch(() => null),
      ...allKeys.map(key => fetchPageByKeyServer(key).catch(() => null)),
    ])
    const data = Array.isArray(response?.data) ? response.data : []
    const initialSeoMeta = {
      title: seoRow?.metaTitle || null,
      description: seoRow?.metaDescription || null,
      imageUrl: seoRow?.metaImageUrl || null,
    }

    let idx = 0
    const pageRow = pageRows[idx++]
    const initialHeroBannerUrl = resolvePageHeroImage(PAGE_HERO_KEYS.conciergeList, pageRow?.heroBannerPath)
    const heroTitle = pageRow?.heroTitle || DEFAULT_HERO_TITLE
    const heroSubtitle = pageRow?.heroSubtitle || DEFAULT_HERO_SUBTITLE

    const locationImages: ConciergeLocationImages = {}
    LOCATION_PAGE_KEYS.forEach(key => {
      locationImages[key] = resolvePageHeroImage(key, pageRows[idx++]?.heroBannerPath)
    })

    const featuredImages: Record<string, string> = {}
    FEATURED_PAGE_KEYS.forEach(key => {
      featuredImages[key] = resolvePageHeroImage(key, pageRows[idx++]?.heroBannerPath)
    })

    const [pkg1Row, pkg2Row, pkg3Row] = PACKAGES_PAGE_KEYS.map(() => pageRows[idx++])
    const packagesImages = {
      image1: resolvePageHeroImage(PAGE_HERO_KEYS.conciergePackages1, pkg1Row?.heroBannerPath),
      image2: resolvePageHeroImage(PAGE_HERO_KEYS.conciergePackages2, pkg2Row?.heroBannerPath),
      image3: resolvePageHeroImage(PAGE_HERO_KEYS.conciergePackages3, pkg3Row?.heroBannerPath),
    }

    const favoritesImages: Record<string, string> = {}
    FAVORITES_PAGE_KEYS.forEach(key => {
      favoritesImages[key] = resolvePageHeroImage(key, pageRows[idx++]?.heroBannerPath)
    })

    return { props: { initialRawServices: data, initialHeroBannerUrl, heroTitle, heroSubtitle, locationImages, featuredImages, packagesImages, favoritesImages, initialSeoMeta } }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps concierge:', err)
    const locationImages: ConciergeLocationImages = {}
    LOCATION_PAGE_KEYS.forEach(key => { locationImages[key] = resolvePageHeroImage(key, null) })
    const featuredImages: Record<string, string> = {}
    FEATURED_PAGE_KEYS.forEach(key => { featuredImages[key] = resolvePageHeroImage(key, null) })
    const favoritesImages: Record<string, string> = {}
    FAVORITES_PAGE_KEYS.forEach(key => { favoritesImages[key] = resolvePageHeroImage(key, null) })
    return {
      props: {
        initialRawServices: [],
        initialHeroBannerUrl: resolvePageHeroImage(PAGE_HERO_KEYS.conciergeList, null),
        locationImages,
        featuredImages,
        packagesImages: {
          image1: resolvePageHeroImage(PAGE_HERO_KEYS.conciergePackages1, null),
          image2: resolvePageHeroImage(PAGE_HERO_KEYS.conciergePackages2, null),
          image3: resolvePageHeroImage(PAGE_HERO_KEYS.conciergePackages3, null),
        },
        favoritesImages,
      },
    }
  }
}

export default KennedysConcierge
