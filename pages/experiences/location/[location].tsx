import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { getSiteUrl } from '@/lib/seo/config'
import { getExperiencesLocationMeta } from '@/lib/seo/locationMeta'
import { getLocationEntry, EXPERIENCES_LOCATION_SLUGS } from '@/lib/locationSlugs'
import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import { getExperiencesByCity, getActiveExperiences } from '@/lib/api/experiences'
import { resolveMediaUrl, slugify, coerceExperienceMediaPath, heroImageDirectUrl } from '@/lib/utils'

type ExperienceCard = {
  id: string
  name: string
  summary: string
  image: string
  city: string
}

type Props = {
  locationSlug: string
  locationName: string
  heroImage: string
  experiences: ExperienceCard[]
  meta: { title: string; description: string }
  siteOrigin: string
}

export default function ExperiencesLocationPage({
  locationSlug,
  locationName,
  heroImage,
  experiences,
  meta,
  siteOrigin,
}: Props) {
  return (
    <>
      <SeoHead
        title={meta.title}
        description={meta.description}
        siteOrigin={siteOrigin}
        canonicalPath={`/experiences/${locationSlug}`}
        imageUrl={heroImage}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative flex items-center justify-center h-[22rem] md:h-[30rem] min-h-[180px]">
          <img
            src={heroImage}
            alt={`Experiences in ${locationName}`}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-white font-gtsuper-ds font-light text-4xl md:text-7xl">
              {locationName} Experiences
            </h1>
            <p className="text-white/80 font-haas font-light text-base md:text-lg mt-4 max-w-2xl mx-auto">
              {meta.description}
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="px-4 md:px-16 py-4 flex items-center gap-1.5 text-sm font-haas text-[#506A70]">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/experiences/list" className="hover:underline">Experiences</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#172338] font-semibold">{locationName}</span>
        </div>

        {/* Experiences */}
        <section className="px-4 md:px-16 pb-16 pt-6">
          <div className="max-w-[1300px] mx-auto">
            <h2 className="font-gtsuper-ds font-light text-[#172338] text-2xl md:text-3xl mb-8">
              Luxury Experiences in {locationName}
            </h2>

            {experiences.length === 0 ? (
              <p className="font-haas text-[#506A70] text-base py-12 text-center">
                No experiences listed for {locationName} right now — check back soon or browse all experiences below.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
                {experiences.map((exp) => (
                  <Link
                    key={exp.id}
                    href={`/experiences/list?location=${encodeURIComponent(exp.city || locationName)}`}
                    className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]"
                  >
                    <div className="relative h-[200px] w-full overflow-hidden bg-[#E8EBED]">
                      <img
                        src={exp.image}
                        alt={exp.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="pt-4 pb-2">
                      <h3 className="font-gtsuper-ds text-xl font-light uppercase leading-tight text-[#D99330]">
                        {exp.name}
                      </h3>
                      <div className="mt-2 border-b border-[#9BA6AE]" />
                      {exp.city && (
                        <p className="mt-2 font-haas text-xs text-[#506A70] uppercase tracking-wider">
                          {exp.city}
                        </p>
                      )}
                      <p className="mt-2 font-haas text-sm font-light leading-relaxed text-[#303D40] line-clamp-3">
                        {exp.summary}
                      </p>
                      <span className="mt-3 inline-flex items-center font-haas text-sm text-[#506A70] underline underline-offset-4">
                        View experience <ChevronRight className="ml-1 w-3.5 h-3.5" aria-hidden />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/experiences/list?location=${encodeURIComponent(locationName)}`}
                className="inline-flex items-center gap-2 bg-[#28F6EA] hover:brightness-95 text-[#172338] font-haas font-light px-8 py-3.5 transition"
              >
                View all {locationName} experiences
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/experiences/list"
                className="inline-flex items-center gap-2 border border-[#172338] text-[#172338] font-haas font-light px-8 py-3.5 hover:bg-gray-50 transition"
              >
                Browse all destinations
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: EXPERIENCES_LOCATION_SLUGS.map((location) => ({ params: { location } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locationSlug = params?.location as string
  const entry = getLocationEntry(locationSlug)
  if (!entry) return { notFound: true }

  const { name: locationName, heroImage } = entry
  const meta = getExperiencesLocationMeta(locationName)
  const siteOrigin = getSiteUrl() || 'https://kennedysgroup.com'

  const mapExperience = (e: any): ExperienceCard => ({
    id: String(e?.id ?? Math.random().toString(36).slice(2)),
    name: String(e?.title || e?.name || 'Experience'),
    summary: String(e?.description || e?.summary || ''),
    image: heroImageDirectUrl(
      resolveMediaUrl(coerceExperienceMediaPath(e?.images?.[0]?.url || e?.image || ''))
    ) || '/images/villa-detail@2x.png',
    city: String(e?.city || e?.location || locationName),
  })

  try {
    // First try city-specific endpoint
    const cityRes = await getExperiencesByCity(locationSlug)
    const cityData = Array.isArray(cityRes?.data) ? cityRes.data : []

    if (cityData.length > 0) {
      const experiences = cityData.slice(0, 9).map(mapExperience)
      return {
        props: { locationSlug, locationName, heroImage, experiences, meta, siteOrigin },
        revalidate: 3600,
      }
    }

    // Fallback: filter from all active experiences (expand Athens Riviera → towns + Vari aliases)
    const allRes = await getActiveExperiences()
    const allData = Array.isArray(allRes?.data) ? allRes.data : []
    const locationTokens = Array.from(
      new Set([locationName, ...expandLocationArea(locationName)].map((t) => t.toLowerCase())),
    )
    const filtered = allData
      .filter((e: any) => {
        const city = (e?.city || e?.location || '').toLowerCase()
        if (!city) return false
        return locationTokens.some((t) => city.includes(t) || t.includes(city))
      })
      .slice(0, 9)
      .map(mapExperience)

    return {
      props: { locationSlug, locationName, heroImage, experiences: filtered, meta, siteOrigin },
      revalidate: 3600,
    }
  } catch {
    return {
      props: { locationSlug, locationName, heroImage, experiences: [], meta, siteOrigin },
      revalidate: 300,
    }
  }
}
