import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { getSiteUrl } from '@/lib/seo/config'
import { getVillaLocationMeta } from '@/lib/seo/locationMeta'
import { getLocationEntry, VILLA_LOCATION_SLUGS } from '@/lib/locationSlugs'
import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import { fetchPropertiesListResult, resolveMediaUrl, heroImageDirectUrl } from '@/lib/utils'
import { buildRentalDetailPath } from '@/lib/rentalRoute'
import { PropertieCard } from '@/components/custom/propertieCard'

type SerializedProperty = {
  id: string
  title: string
  region: string
  bedrooms: number
  guests: number
  pools: number
  price: string
  imageUrl: string
  path: string
}

type Props = {
  locationSlug: string
  locationName: string
  heroImage: string
  properties: SerializedProperty[]
  total: number
  meta: { title: string; description: string }
  siteOrigin: string
}

function formatNightly(p: any): string {
  const n = Number(p?.price_per_night)
  if (!Number.isFinite(n) || n <= 0) return ''
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
}

export default function VillasLocationPage({
  locationSlug,
  locationName,
  heroImage,
  properties,
  total,
  meta,
  siteOrigin,
}: Props) {
  return (
    <>
      <SeoHead
        title={meta.title}
        description={meta.description}
        siteOrigin={siteOrigin}
        canonicalPath={`/villas/${locationSlug}`}
        imageUrl={heroImage}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative flex items-center justify-center h-[22rem] md:h-[30rem] min-h-[180px]">
          <img
            src={heroImage}
            alt={`${locationName} villas`}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-white font-gtsuper-ds font-light text-4xl md:text-7xl">
              {locationName} Villas
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
          <Link href="/villas" className="hover:underline">Villas</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#172338] font-semibold">{locationName}</span>
        </div>

        {/* Properties */}
        <section className="px-4 md:px-16 pb-16 pt-6">
          <div className="max-w-[1300px] mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-gtsuper-ds font-light text-[#172338] text-2xl md:text-3xl">
                Luxury Villas in {locationName}
              </h2>
              {total > properties.length && (
                <span className="font-haas text-sm text-[#506A70]">
                  Showing {properties.length} of {total}
                </span>
              )}
            </div>

            {properties.length === 0 ? (
              <p className="font-haas text-[#506A70] text-base py-12 text-center">
                No villas found for this destination right now. Check back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
                {properties.map((p) => (
                  <PropertieCard
                    key={p.id}
                    villaImage={p.imageUrl}
                    title={p.title}
                    location={p.region}
                    bedrooms={p.bedrooms}
                    guests={p.guests}
                    pools={p.pools}
                    price={p.price}
                    rental
                    fromText
                    href={p.path || `/villas/${p.id}`}
                  />
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/villas/list?region=${encodeURIComponent(locationName)}`}
                className="inline-flex items-center gap-2 bg-[#28F6EA] hover:brightness-95 text-[#172338] font-haas font-light px-8 py-3.5 transition"
              >
                View all {locationName} villas
                {total > 0 && <span className="opacity-70">({total})</span>}
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/villas/list"
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
    paths: VILLA_LOCATION_SLUGS.map((location) => ({ params: { location } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locationSlug = params?.location as string
  const entry = getLocationEntry(locationSlug)
  if (!entry) return { notFound: true }

  const { name: locationName, heroImage } = entry
  const meta = getVillaLocationMeta(locationName)
  const siteOrigin = getSiteUrl() || 'https://kennedysgroup.com'

  const apiFilters: Record<string, string | number | boolean> = {
    rental: true,
    pageSize: 12,
    page: 1,
    includeAvailabilityRanges: true,
  }
  const expanded = expandLocationArea(locationName)
  if (expanded.length > 1) {
    const allRegions = Array.from(new Set([locationName, ...expanded]))
    apiFilters.region = allRegions.join(',')
  } else {
    apiFilters.area = expanded[0]
  }

  try {
    const result = await fetchPropertiesListResult(apiFilters)
    const properties: SerializedProperty[] = (result.items || []).map((p: any) => ({
      id: String(p.id ?? ''),
      title: String(p.title || p.name || ''),
      region: String(p.region || locationName),
      bedrooms: Number(p.bedrooms) || 0,
      guests: Number(p.guests || p.max_guests) || 0,
      pools: Number(p.pools) || 0,
      price: formatNightly(p),
      imageUrl: heroImageDirectUrl(
        resolveMediaUrl(
          p.images?.[0]?.urlImage || p.images?.[0]?.url || p.images?.[0]?.image || ''
        )
      ),
      path: buildRentalDetailPath(p) || `/villas/${String(p.id ?? '')}`,
    }))

    return {
      props: { locationSlug, locationName, heroImage, properties, total: result.total, meta, siteOrigin },
      revalidate: 3600,
    }
  } catch {
    return {
      props: { locationSlug, locationName, heroImage, properties: [], total: 0, meta, siteOrigin },
      revalidate: 300,
    }
  }
}
