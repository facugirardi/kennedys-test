import React, { useEffect, useMemo, useState } from 'react'
import { buildRealEstateDetailPath } from "@/lib/rentalRoute";
import Navbar from '@/components/custom/Navbar'
import dynamic from 'next/dynamic'
import Footer from '@/components/custom/footerNew'
import { useRouter } from 'next/router'
import { getCityInsights } from '@/lib/api/cities'
import { fetchProperties } from '@/lib/utils'
import { resolveMediaUrl, propertyLocationUsesUsdDisplay, getRealEstateCardLocationLabel } from '@/lib/utils'
import usePropertyStore from '@/store/propertyStore'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { expandLocationArea } from '@/lib/kennedysLocationFilterTree'
import { shouldWatermarkImage, watermarkedImageUrl } from '@/lib/propertyPhotoWatermark'

function titleCaseSlug(slug: string): string {
  if (!slug.trim()) return ''
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function InCityPageSkeleton() {
  return (
    <div className="animate-pulse overflow-x-hidden" aria-hidden>
      <div className="px-6 md:px-24">
        <div className="flex items-center gap-2 mt-2">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-2 bg-gray-100 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-2 bg-gray-100 rounded" />
          <div className="h-4 w-28 bg-gray-300 rounded" />
        </div>
      </div>
      <div className="mt-3 mb-6 h-[280px] sm:h-[360px] md:h-[480px] w-screen max-w-[100vw] bg-gray-200 relative left-1/2 -translate-x-1/2" />
      <div className="px-6 md:px-24 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-x-12 xl:gap-x-20 py-8 lg:items-start">
        <div className="max-w-3xl space-y-4">
          <div className="h-10 w-full max-w-xl bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 rounded" />
          <div className="h-5 w-48 bg-gray-200 rounded mt-2" />
        </div>
        <div className="lg:justify-self-end lg:max-w-[22rem] w-full">
          <div className="h-7 w-48 bg-gray-200 rounded mb-4 lg:ml-auto" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
      <section className="mt-12 px-6 md:px-24 pb-10">
        <div className="h-8 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[16px] bg-gray-100 h-24 border border-gray-100" />
          ))}
        </div>
      </section>
      <section className="bg-[#F8F0E4] px-6 md:px-24 py-10">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="h-[260px] sm:h-[300px] bg-gray-200 rounded-sm w-full" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </section>
      <section className="py-10 lg:px-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[280px] bg-gray-100 rounded-lg border border-gray-100" />
          <div className="h-[280px] bg-gray-100 rounded-lg border border-gray-100" />
        </div>
        <div className="mt-6 h-[320px] bg-gray-100 rounded-lg border border-gray-100" />
      </section>
    </div>
  )
}

function CityInlineEmpty({
  title,
  description,
  className = '',
  align = 'center',
}: {
  title: string
  description?: string
  className?: string
  align?: 'center' | 'left'
}) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center'
  return (
    <div
      className={`rounded-sm border border-dashed border-[#a3a3a3]/45 bg-white/70 py-10 px-6 ${alignClass} ${className}`}
    >
      <p className="font-gtsuper-ds text-[#172338] font-light text-lg">{title}</p>
      {description ? (
        <p
          className={`font-haas text-sm text-[#506A70] mt-2 max-w-md leading-relaxed ${
            align === 'left' ? '' : 'mx-auto'
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export default function RealEstateCityPage() {
  const DynamicPropertySizeChart = dynamic(() => import('@/components/custom/charts/PropertySizeChart'), { ssr: false })
  const DynamicPropertyTypeDonut = dynamic(() => import('@/components/custom/charts/PropertyTypeDonut'), { ssr: false })
  const DynamicOccupancyChart = dynamic(() => import('@/components/custom/charts/OccupancyChart'), { ssr: false })
  const router = useRouter()
  const slug =
    router.isReady && typeof router.query.city === 'string' ? router.query.city : ''
  const setSelectedProperty = usePropertyStore((state: any) => state.setSelectedProperty)

  const [cityData, setCityData] = useState<any>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!router.isReady) return
    if (!slug) {
      setLoading(false)
      setCityData(null)
      setProperties([])
      return
    }
    let mounted = true
    const loadData = async () => {
      setLoading(true)
      setProperties([])
      try {
        const resp = await getCityInsights(slug)
        const data = resp?.data || null
        if (!mounted) return
        if (data) {
          const cityDataObj = {
            ...data,
            heroImage:
              resolveMediaUrl(data.heroImage || data.hero_image || data.image) || '',
            stats: Array.isArray(data.stats) ? data.stats : [],
            bestAreas: Array.isArray(data.bestAreas) ? data.bestAreas : [],
            propertySize: Array.isArray(data.propertySize) ? data.propertySize : [],
            occupancyBuckets: Array.isArray(data.occupancyBuckets) ? data.occupancyBuckets : [],
            typeSegments: Array.isArray(data.typeSegments) ? data.typeSegments : [],
            locationQuery: data.locationQuery || data.name || data.title || '',
            purchaseTitle: data.purchaseTitle || data.purchase_title || null,
            purchaseDescription: data.purchaseDescription || data.purchase_description || null,
            purchaseImage: data.purchaseImage || data.purchase_image || null,
            updatedAt: data.updatedAt || data.updated_at || null,
          }
          setCityData(cityDataObj)

          // Región para la API: locationQuery del CMS (coincide con region/area en propiedades), no solo el nombre visual.
          // Athens Riviera (y similares) se expanden a towns reales igual que en /real-estate/list.
          const cityRegion = (
            cityDataObj.locationQuery ||
            cityDataObj.name ||
            ''
          ).trim()
          if (cityRegion) {
            try {
              const locTokensRaw = cityRegion.split(',').map((s: string) => s.trim()).filter(Boolean)
              const expanded = Array.from(new Set(locTokensRaw.flatMap(expandLocationArea)))
              const allRegions = Array.from(new Set([...locTokensRaw, ...expanded]))
              const fetchParams = {
                rental: false,
                category: 'real-estate',
                region: allRegions.join(','),
                orderBy: 'createdAt',
                orderDir: 'DESC' as const,
                take: 3,
              }
              const propertiesData = await fetchProperties(fetchParams)
              if (mounted && Array.isArray(propertiesData)) {
                const filteredProperties = propertiesData.filter((p: any) => {
                  const isRealEstate = p.category === 'real-estate' || p.category === 'real_estate'
                  const isNotRental = p.rental === false
                  return isRealEstate && isNotRental
                })
                setProperties(filteredProperties)
              } else if (mounted) {
                setProperties([])
              }
            } catch (error) {
              console.error('Failed to load properties for city', error)
              if (mounted) setProperties([])
            }
          } else if (mounted) {
            setProperties([])
          }
        } else {
          setCityData(null)
          if (mounted) setProperties([])
        }
      } catch (error) {
        console.error('Failed to load city insights', error)
        if (mounted) {
          setCityData(null)
          setProperties([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadData()
    return () => { mounted = false }
  }, [router.isReady, slug])

  const CITY = (cityData?.name || titleCaseSlug(slug)).trim()
  const stats = cityData?.stats ?? []
  const bestAreas = cityData?.bestAreas ?? []
  const propertySize = cityData?.propertySize ?? []
  const occupancyBuckets = cityData?.occupancyBuckets ?? []
  const typeSegments = cityData?.typeSegments ?? []
  /** Ya filtradas por región en el backend; no re-filtrar solo por `location` (rompía listings con region match). */
  const cityProperties = useMemo(
    () => (Array.isArray(properties) ? properties.slice(0, 3) : []),
    [properties]
  )

  const listRegionParam = (cityData?.locationQuery || CITY || '').trim()

  const heroImage = cityData?.heroImage ?? ''
  const headline = cityData?.headline ?? ''
  const intro = cityData?.intro ?? ''
  const intro2 = cityData?.intro2 ?? ''
  const averageRevenue = cityData?.averageRevenue ?? ''

  const occupancyHeadlineStat = useMemo(() => {
    const occ = stats.find((s: any) => /occupancy/i.test(String(s?.label || '')))
    return occ?.value ? `OCCUPANCY RATE: ${occ.value}` : ''
  }, [stats])

  const hasChartMix = propertySize.length > 0 || typeSegments.length > 0
  const hasOccupancyChart = occupancyBuckets.length > 0

  const showPage = Boolean(cityData)

  return (
    <>
      <SeoHead
        title={
          CITY
            ? `${CITY} luxury real estate market | ${SITE_NAME}`
            : `Real estate | ${SITE_NAME}`
        }
        description={
          CITY
            ? `Insights and featured listings in ${CITY} — average yields, property mix, and hand-picked homes for sale.`
            : `Luxury real estate market insights and listings | ${SITE_NAME}`
        }
        canonicalPath={`/real-estate/in-city?city=${encodeURIComponent(slug || '')}`}
        imageUrl={heroImage || undefined}
      />
      <div className="min-h-screen w-full bg-white overflow-x-hidden">
        <Navbar textBlack className="bg-white" scrollsAway="flow" />

        {!router.isReady || loading ? (
          <InCityPageSkeleton />
        ) : !showPage ? (
          <div className="px-6 md:px-24 py-16 max-w-2xl">
            <CityInlineEmpty
              title="City not found"
              description={
                slug
                  ? 'No market data is available for this destination yet.'
                  : 'Open this page with a city in the URL, for example /real-estate/in-city?city=mykonos'
              }
              align="left"
            />
            <a href="/real-estate" className="inline-block mt-6 font-haas text-sm text-[#172338] underline">
              Back to real estate
            </a>
          </div>
        ) : (
          <>
        {/* Breadcrumb + Hero (hero full viewport width) */}
        <section className="overflow-x-hidden">
          <div className="px-6 md:px-24">
            <div className="text-sm text-[#172338] flex items-center gap-2 mt-2">
              <a className="underline" href="/">Home</a>
              <span>›</span>
              <a className="underline" href="/real-estate">Real estate</a>
              <span>›</span>
              <span className="font-semibold">{CITY}</span>
            </div>
          </div>

          <div className="mt-3 mb-6 w-screen max-w-[100vw] relative left-1/2 -translate-x-1/2">
            <div className="relative w-full h-[280px] sm:h-[360px] md:h-[480px] bg-[#E9EEF2]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={`${CITY}`}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-4">
                  <p className="font-haas text-sm text-[#8FA0A8] text-center">No hero image for this market</p>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 md:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-x-12 xl:gap-x-20 py-8 lg:items-start">
              <div className="max-w-3xl min-w-0">
                {headline || intro || intro2 ? (
                  <>
                    {headline ? (
                      <h1 className="font-gtsuper-ds font-light text-[#172338] text-4xl sm:text-2xl md:text-4xl leading-tight">
                        {headline}
                      </h1>
                    ) : null}
                    {intro ? (
                      <p className="mt-4 font-haas font-light text-md text-[#172338] leading-6">{intro}</p>
                    ) : null}
                    {intro2 ? (
                      <p className="mt-3 font-haas font-light text-md text-[#172338] leading-6">{intro2}</p>
                    ) : null}
                  </>
                ) : (
                  <CityInlineEmpty
                    title="No overview yet"
                    description="Editorial copy for this destination has not been published."
                    className="py-8"
                  />
                )}
                {averageRevenue ? (
                  <p className="mt-4 font-haas text-md font-semibold text-[#B17520]"><span className=" text-[#172338]">Average Revenue:</span> {averageRevenue}</p>
                ) : null}
              </div>

              <aside className="lg:justify-self-end w-full lg:max-w-md xl:max-w-sm">
                <h3 className="font-gtsuper-ds text-[#172338] text-xl mb-3">BEST AREAS IN {CITY.toUpperCase()}</h3>
                {bestAreas.length > 0 ? (
                  <ol className="font-haas font-light text-[16px] text-[#172338] grid grid-cols-1 gap-2">
                    {bestAreas.map((a: string, i: number) => (
                      <li key={`${i}-${a}`} className="flex gap-2"><span>{i + 1}.</span><span>{a}</span></li>
                    ))}
                  </ol>
                ) : (
                  <CityInlineEmpty
                    title="No areas listed"
                    description="Best areas for this market will appear here when added in the CMS."
                    className="py-6"
                  />
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* Why city: stat cards (exact style) */}
        <section className="px-6 mt-10 md:px-24 pb-10">
          <div
            className="h-px w-screen max-w-[100vw] bg-[#B7E4EC] shrink-0 mb-10 relative left-1/2 -translate-x-1/2"
            aria-hidden
          />
          <h2 className="font-gtsuper-ds font-light text-[#172338] text-2xl mb-3">Why {CITY}</h2>
          {stats.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.map((s: any) => (
                <div
                  key={s.label}
                  className="rounded-[16px] bg-white px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-[#E9EEF2]"
                >
                  <div className="text-md leading-4 font-light text-[#172338] font-haas">{s.label}</div>
                  <div className="mt-2 text-xl font-haas text-[#D99330]">{s.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <CityInlineEmpty
              title="No market stats"
              description="Key figures for this destination are not configured yet."
              className="py-8"
            />
          )}
        </section>

        {/* New properties (exact style) */}
        <section className="bg-[#F8F0E4] px-6 md:px-24 py-10">
          <div className="flex items-center justify-between">
            <h2 className="font-gtsuper-ds font-light text-[#172338] text-2xl">New Properties in {CITY}</h2>
            <a
              href={
                listRegionParam
                  ? `/real-estate/list?region=${encodeURIComponent(listRegionParam)}`
                  : '/real-estate/list'
              }
              className="underline text-[#172338] text-sm"
            >
              View all properties
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {cityProperties.length === 0 ? (
              <div className="col-span-full">
                <CityInlineEmpty
                  title="No new listings to show"
                  description="There are no sale properties in this area right now. Browse the full catalogue or try another destination."
                  className="py-12 bg-white/60 border-[#c4b8a8]/50"
                />
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <a
                    href={
                      listRegionParam
                        ? `/real-estate/list?region=${encodeURIComponent(listRegionParam)}`
                        : '/real-estate/list'
                    }
                    className="font-haas text-sm text-[#172338] underline"
                  >
                    View all properties
                  </a>
                  <a href="/real-estate" className="font-haas text-sm text-[#172338] underline">
                    Other markets
                  </a>
                </div>
              </div>
            ) : null}
            {cityProperties.map((p) => {
              // Para real estate, usar sale_price en lugar de price_per_night
              const priceHidden = p.price_visibility === false
              const salePrice = p.sale_price ? Number(p.sale_price) : 0
              const price = priceHidden
                ? 'Price on request'
                : salePrice > 0
                  ? new Intl.NumberFormat('en-US', {
                      maximumFractionDigits: 0,
                      minimumFractionDigits: 0
                    }).format(salePrice)
                  : '0'
              const saleSym = propertyLocationUsesUsdDisplay(p) ? '$' : '€'
              
              // Obtener la imagen primaria o la primera disponible
              const images = Array.isArray(p.images) ? p.images : []
              const primaryImage = images.find((img: any) => img?.isPrimary) || images[0]
              const resolvedImageUrl = resolveMediaUrl(primaryImage?.urlImage || primaryImage?.url || '') || '/images/villa-detail@2x.png'
              const imageUrl = shouldWatermarkImage(p?.watermarkPhotos, 'real-estate')
                ? watermarkedImageUrl(resolvedImageUrl)
                : resolvedImageUrl

              return (
                <div 
                  key={p.id} 
                  className="flex flex-col cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    if (p.id) {
                      setSelectedProperty(p)
                      router.push(buildRealEstateDetailPath(p))
                    }
                  }}
                >
                  <div className="relative h-[260px] sm:h-[300px] w-full overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <div className="mt-3 text-[#303D40]">
                    <div className="font-haas text-md leading-5">{p.title}, {p.classification?.bedrooms || 0} Bedrooms</div>
                    <div className="font-haas text-md leading-5">{getRealEstateCardLocationLabel(p)}</div>
                    <div className="font-gtsuper-ds text-lg leading-5 text-[#506A70] mt-2">
                      {priceHidden ? price : <>{saleSym} {price}</>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Charts */}
        <section className="px-6 md:px-24 lg:px-60 py-10">
          {hasChartMix ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {propertySize.length > 0 ? <DynamicPropertySizeChart data={propertySize} /> : null}
              {typeSegments.length > 0 ? <DynamicPropertyTypeDonut segments={typeSegments} /> : null}
            </div>
          ) : hasOccupancyChart ? null : (
            <CityInlineEmpty
              title="No market charts"
              description="Property mix and occupancy visuals will appear when this data is configured for the city."
              className="py-10"
            />
          )}
          {hasOccupancyChart ? (
            <div className={hasChartMix ? 'mt-6' : ''}>
              <DynamicOccupancyChart
                data={occupancyBuckets}
                headline={occupancyHeadlineStat || 'OCCUPANCY RATE'}
              />
            </div>
          ) : hasChartMix ? (
            <div className="mt-6">
              <CityInlineEmpty
                title="No occupancy data"
                description="Occupancy distribution is not set up for this market yet."
                className="py-8"
              />
            </div>
          ) : null}
        </section>

        {cityData?.purchaseTitle && (
          <section className="relative bg-white py-20 overflow-visible min-h-[400px] md:min-h-[500px]">
            <div className="relative bg-[#F5F8FE] w-full py-8 md:py-12">
              <div className="max-w-7xl mx-auto pl-0 pr-6 md:pr-24">
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 items-center">
                  <div>
                    <h3 className="font-gtsuper-ds font-light text-[#172338] text-[28px]">
                      {cityData.purchaseTitle}
                    </h3>
                    {cityData.purchaseDescription && (
                      <p className="mt-4 font-haas text-md font-light text-[#172338] leading-7 max-w-[60ch]">
                        {cityData.purchaseDescription}
                      </p>
                    )}
                  </div>
                  <div className="hidden md:block"></div>
                </div>
              </div>
            </div>
            {cityData.purchaseImage && (
              <div className="absolute right-6 md:right-12 lg:right-24 xl:right-32 top-1/2 -translate-y-1/2 z-30 w-full max-w-[420px] sm:max-w-[460px] md:max-w-[520px] lg:max-w-[560px] xl:max-w-[600px]">
                <img 
                  src={resolveMediaUrl(cityData.purchaseImage)} 
                  alt="City" 
                  className="w-full h-auto object-cover aspect-[4/3]" 
                />
              </div>
            )}
          </section>
        )}

          </>
        )}

      </div>

      <Footer disableTravelSection={true} />
    </>
  )
}
