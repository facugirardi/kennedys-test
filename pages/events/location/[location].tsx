import type { GetStaticPaths, GetStaticProps } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { getSiteUrl } from '@/lib/seo/config'
import { getEventsLocationMeta } from '@/lib/seo/locationMeta'
import { getLocationEntry, EVENTS_LOCATION_SLUGS } from '@/lib/locationSlugs'
import { getAllEvents } from '@/lib/api/events'
import { resolveMediaUrl, slugify } from '@/lib/utils'

type EventCard = {
  id: string
  name: string
  summary: string
  image: string
}

type Props = {
  locationSlug: string
  locationName: string
  heroImage: string
  events: EventCard[]
  meta: { title: string; description: string }
  siteOrigin: string
}

export default function EventsLocationPage({
  locationSlug,
  locationName,
  heroImage,
  events,
  meta,
  siteOrigin,
}: Props) {
  return (
    <>
      <SeoHead
        title={meta.title}
        description={meta.description}
        siteOrigin={siteOrigin}
        canonicalPath={`/events/${locationSlug}`}
        imageUrl={heroImage}
      />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative flex items-center justify-center h-[22rem] md:h-[30rem] min-h-[180px]">
          <img
            src={heroImage}
            alt={`Events in ${locationName}`}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.55]"
          />
          <div className="relative z-10 text-center px-4">
            <h1 className="text-white font-gtsuper-ds font-light text-4xl md:text-7xl">
              {locationName} Events
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
          <Link href="/events" className="hover:underline">Events</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#172338] font-semibold">{locationName}</span>
        </div>

        {/* Events */}
        <section className="px-4 md:px-16 pb-16 pt-6">
          <div className="max-w-[1300px] mx-auto">
            <h2 className="font-gtsuper-ds font-light text-[#172338] text-2xl md:text-3xl mb-8">
              Private Events in {locationName}
            </h2>

            {events.length === 0 ? (
              <p className="font-haas text-[#506A70] text-base py-12 text-center">
                No events listed for {locationName} right now — check back soon or browse all events below.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
                {events.map((event, index) => {
                  const isEven = index % 2 === 0
                  const titleColor = isEven ? '#D99330' : '#506A70'
                  return (
                    <Link
                      key={event.id}
                      href={`/events/${slugify(event.name)}`}
                      className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]"
                    >
                      <div className="relative h-[200px] w-full overflow-hidden bg-[#E8EBED]">
                        <img
                          src={event.image}
                          alt={event.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="pt-4 pb-2">
                        <h3
                          className="font-gtsuper-ds text-xl font-light uppercase leading-tight"
                          style={{ color: titleColor }}
                        >
                          {event.name}
                        </h3>
                        <div className="mt-2 border-b border-[#9BA6AE]" />
                        <p className="mt-3 font-haas text-sm font-light leading-relaxed text-[#303D40] line-clamp-3">
                          {event.summary}
                        </p>
                        <span className="mt-3 inline-flex items-center font-haas text-sm text-[#506A70] underline underline-offset-4">
                          More info <ChevronRight className="ml-1 w-3.5 h-3.5" aria-hidden />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={`/events/list?location=${encodeURIComponent(locationName)}`}
                className="inline-flex items-center gap-2 bg-[#28F6EA] hover:brightness-95 text-[#172338] font-haas font-light px-8 py-3.5 transition"
              >
                View all {locationName} events
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 border border-[#172338] text-[#172338] font-haas font-light px-8 py-3.5 hover:bg-gray-50 transition"
              >
                Browse all events
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
    paths: EVENTS_LOCATION_SLUGS.map((location) => ({ params: { location } })),
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locationSlug = params?.location as string
  const entry = getLocationEntry(locationSlug)
  if (!entry) return { notFound: true }

  const { name: locationName, heroImage } = entry
  const meta = getEventsLocationMeta(locationName)
  const siteOrigin = getSiteUrl() || 'https://kennedysgroup.com'

  try {
    const response = await getAllEvents({ listing: 1 })
    const allEvents = Array.isArray(response?.data) ? response.data : []

    const locationLower = locationName.toLowerCase()
    const filtered = allEvents
      .filter((e: any) => {
        const loc = (e?.location || e?.city || e?.country || '').toLowerCase()
        return loc.includes(locationLower) || locationLower.includes(loc.split(',')[0]?.trim() || '')
      })
      .slice(0, 9)
      .map((e: any) => ({
        id: String(e?.id ?? Math.random().toString(36).slice(2)),
        name: String(e?.name ?? 'Upcoming Event'),
        summary: String(e?.summary ?? 'Details coming soon.'),
        image: resolveMediaUrl(e?.image || '') || '/images/events-1.png',
      }))

    return {
      props: { locationSlug, locationName, heroImage, events: filtered, meta, siteOrigin },
      revalidate: 3600,
    }
  } catch {
    return {
      props: { locationSlug, locationName, heroImage, events: [], meta, siteOrigin },
      revalidate: 300,
    }
  }
}
