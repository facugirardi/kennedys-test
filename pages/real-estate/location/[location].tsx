import { buildRealEstateDetailPath } from "@/lib/rentalRoute"
import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { getSiteUrl } from '@/lib/seo/config'
import { getRealEstateLocationMeta } from '@/lib/seo/locationMeta'
import { getLocationEntry, REAL_ESTATE_LOCATION_SLUGS } from '@/lib/locationSlugs'
import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import { fetchPropertiesListResult, resolveMediaUrl, heroImageDirectUrl } from '@/lib/utils'
import { PropertieCard } from '@/components/custom/propertieCard'
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark'
import {
  countPoolsForRealEstateCard,
  getRealEstateBuildSqm,
  getRealEstatePlotSqm,
  getRealEstateBathrooms,
  getRealEstateYearBuilt,
} from '@/lib/propertyPoolCounts'

type SerializedProperty = {
  id: string
  title: string
  region: string
  bedrooms: number
  bathrooms: number | null
  yearBuilt: number | null
  plotSqm: number | null
  buildSqm: number | null
  isLand: boolean
  guests: number
  pools: number
  price: string
  salePriceNumeric: number | null
  imageUrl: string
  href: string
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

function formatSalePrice(p: any): string {
  if (p?.price_visibility === false) return 'Price on request'
  const n = Number(p?.sale_price)
  if (!Number.isFinite(n) || n <= 0) return ''
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return `€${m >= 10 ? Math.round(m) : Math.round(m * 10) / 10}M`
  }
  if (n >= 1_000) return `€${Math.round(n / 1_000)}K`
  return `€${n}`
}

export default function RealEstateLocationPage({
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
        canonicalPath={`/real-estate/${locationSlug}`}
        imageUrl={heroImage}
      />
      <Navbar scrollsAway="overlay" />
      <main>
        {/* Hero */}
        <section className="relative flex items-center justify-center h-[22rem] md:h-[30rem] min-h-[180px]">
          <img
            src={heroImage}
            alt={`Real estate in ${locationName}`}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-white font-gtsuper-ds font-light text-4xl md:text-7xl">
              {locationName} Real Estate
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
          <Link href="/real-estate" className="hover:underline">Real Estate</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#172338] font-semibold">{locationName}</span>
        </div>

        {/* Properties */}
        <section className="px-4 md:px-16 pb-16 pt-6">
          <div className="max-w-[1300px] mx-auto">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-gtsuper-ds font-light text-[#172338] text-2xl md:text-3xl">
                Properties for Sale in {locationName}
              </h2>
              {total > properties.length && (
                <span className="font-haas text-sm text-[#506A70]">
                  Showing {properties.length} of {total}
                </span>
              )}
            </div>

            {properties.length === 0 ? (
              <p className="font-haas text-[#506A70] text-base py-12 text-center">
                No properties listed for this destination right now. Check back soon.
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
                    bathrooms={p.bathrooms}
                    yearBuilt={p.yearBuilt}
                    plotSqm={p.plotSqm}
                    buildSqm={p.buildSqm}
                    isLand={p.isLand}
                    salePriceNumeric={p.salePriceNumeric}
                    guests={p.guests}
                    pools={p.pools}
                    price={p.price}
                    rental={false}
                    href={p.href}
                  />
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/real-estate/list?region=${encodeURIComponent(locationName)}`}
                className="inline-flex items-center gap-2 bg-[#28F6EA] hover:brightness-95 text-[#172338] font-haas font-light px-8 py-3.5 transition"
              >
                View all {locationName} properties
                {total > 0 && <span className="opacity-70">({total})</span>}
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/real-estate/list"
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
    paths: REAL_ESTATE_LOCATION_SLUGS.map((location) => ({ params: { location } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locationSlug = params?.location as string
  const entry = getLocationEntry(locationSlug)
  if (!entry) return { notFound: true }

  const { name: locationName, heroImage } = entry
  const meta = getRealEstateLocationMeta(locationName)
  const siteOrigin = getSiteUrl() || 'https://kennedysgroup.com'

  const expanded = expandLocationArea(locationName)
  const allRegions = Array.from(new Set([locationName, ...expanded]))

  try {
    const result = await fetchPropertiesListResult({
      rental: false,
      category: 'real-estate',
      region: allRegions.join(','),
      pageSize: 12,
      page: 1,
    })

    const properties: SerializedProperty[] = (result.items || []).map((p: any) => {
      const resolvedImageUrl = heroImageDirectUrl(
        resolveMediaUrl(
          (() => {
            const images = Array.isArray(p.images) ? p.images : []
            const primary = images.find((img: any) => {
              const isPrimary = img?.isPrimary ?? img?.is_primary ?? img?.primary
              return isPrimary === true || isPrimary === 'true' || isPrimary === 1
            })
            const chosen = primary ?? images[0]
            return chosen?.urlImage || chosen?.url || chosen?.image || ''
          })()
        )
      )
      return {
        id: String(p.id ?? ''),
        title: String(p.title || p.name || ''),
        region: String(p.region || locationName),
        href: buildRealEstateDetailPath(p),
        bedrooms: Number(p?.classification?.bedrooms ?? p.bedrooms) || 0,
        bathrooms: getRealEstateBathrooms(p?.classification),
        yearBuilt: getRealEstateYearBuilt(p?.classification),
        plotSqm: getRealEstatePlotSqm(p?.classification),
        buildSqm: getRealEstateBuildSqm(p?.classification),
        isLand: String(p?.classification?.type || '').toLowerCase() === 'land',
        guests: Number(p.guests || p.max_guests) || 0,
        pools: countPoolsForRealEstateCard(p?.classification) || Number(p.pools) || 0,
        price: formatSalePrice(p),
        salePriceNumeric: Number.isFinite(Number(p?.sale_price)) ? Number(p.sale_price) : null,
        imageUrl: shouldWatermarkImage(p?.watermarkPhotos, 'real-estate')
          ? watermarkedImageUrl(resolvedImageUrl)
          : resolvedImageUrl,
      }
    })

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
