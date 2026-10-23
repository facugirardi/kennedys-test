/* eslint-disable @next/next/no-img-element */
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { PagePdfExportButton } from '@/components/custom/PagePdfExportButton'
import { ChevronRight, ChevronRightIcon } from 'lucide-react'
import { BsShare } from 'react-icons/bs'
import { Button } from '@/components/ui/button1'
import { getEvent, getEventByName, getAllEvents, getEventCardsByEventId } from '@/lib/api/events'
import { getLatestNews } from '@/lib/api/news'
import { resolveMediaUrl, slugify, positionStyle } from '@/lib/utils'
import { WeAreOnTheNews } from '@/components/promotional-blocks'
import { useEventFavorites } from '@/src/hooks/useEventFavorites'
import { SeoHead } from '@/components/seo/SeoHead'
import { getPublicSiteOriginFromRequest, SITE_NAME } from '@/lib/seo/config'
import { stripHtmlToText, truncateMetaDescription } from '@/lib/seo/text'
import { buildEventDetailInitialSeoMeta, buildEventListingPath } from '@/lib/seo/eventDetailMeta'
import { useContact } from '@/src/contexts/ContactContext'
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext'

const ImageGalleryModal = dynamic(() => import('@/components/custom/ImageGalleryModal'), { ssr: false })
const ImageGalleryGridModal = dynamic(() => import('@/components/custom/ImageGalleryGridModal'), { ssr: false })

function getDataArray(res: any): any[] {
  if (!res) return []
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res)) return res
  return []
}

function mapNewsFromApiResponse(raw: any[]): any[] {
  return raw
    .filter((n) => n?.title && n?.image)
    .map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      image: n.image,
      link: n.link,
    }))
}

function pickEventSeoMeta(ev: Record<string, any> | null | undefined): {
  metaTitle: string | null
  metaDescription: string | null
} {
  if (!ev) return { metaTitle: null, metaDescription: null }
  const mt = ev.metaTitle ?? ev.meta_title
  const md = ev.metaDescription ?? ev.meta_description
  return {
    metaTitle: typeof mt === 'string' && mt.trim() ? mt.trim() : null,
    metaDescription: typeof md === 'string' && md.trim() ? md.trim() : null,
  }
}

function EventDetailPageSkeleton() {
  return (
    <>
      <section className="relative flex h-[520px] w-full items-center justify-center md:h-[760px]" aria-busy="true" role="status">
        <span className="sr-only">Loading event</span>
        <Navbar textBlack={true} className="absolute left-0 top-0 z-20 w-full bg-transparent" />
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      </section>
      <div className="animate-pulse bg-white px-4 py-8 md:py-10">
        <div className="mx-auto flex max-w-[1300px] flex-col items-center gap-4">
          <div className="h-9 w-[min(90%,20rem)] rounded bg-gray-200 md:h-12" />
          <div className="h-4 w-full max-w-2xl rounded bg-gray-200" />
          <div className="h-4 w-full max-w-xl rounded bg-gray-200" />
          <div className="h-4 w-full max-w-lg rounded bg-gray-200" />
        </div>
      </div>
      <div className="flex animate-pulse justify-center border-b border-[#E9E9E9] bg-white px-4 py-4">
        <div className="flex gap-8">
          <div className="h-6 w-20 rounded bg-gray-200" />
          <div className="h-6 w-20 rounded bg-gray-200" />
        </div>
      </div>
      <section className="mx-auto mb-10 mt-10 max-w-[1300px] animate-pulse px-4 md:mt-16 md:px-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`mb-10 flex w-full flex-col gap-6 md:flex-row md:gap-8 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="h-56 w-full shrink-0 rounded-none bg-gray-200 md:h-[364px] md:w-1/2" />
            <div className="flex flex-1 flex-col gap-3 pt-1">
              <div className="h-10 w-4/5 max-w-md rounded bg-gray-200 md:h-12" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </section>
      <section className="w-full animate-pulse bg-[#F0F3F5] py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1300px] px-4 md:px-6">
          <div className="mx-auto mb-6 h-8 w-40 rounded bg-gray-200 md:mb-8 md:h-10 md:w-48" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            <div className="col-span-2 aspect-[16/10] min-h-[200px] bg-gray-200 sm:col-span-4 sm:aspect-auto sm:h-[300px] md:h-[360px]" />
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="h-28 min-h-[7rem] bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
      <section className="flex w-full animate-pulse justify-center bg-[#F4F6F8] py-12 md:py-14">
        <div className="grid w-full max-w-[1300px] grid-cols-1 gap-8 px-4 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
          {[0, 1, 2].map((k) => (
            <div key={k} className="h-[300px] bg-gray-200" />
          ))}
        </div>
      </section>
    </>
  )
}

type EventDetailPageProps = {
  initialEvent?: any;
  initialEventCards?: any[];
  initialOtherEvents?: any[];
  initialNews?: any[];
  siteOrigin?: string;
  initialSeoMeta?: { title: string; description: string; imageUrl?: string | null };
};

const EventDetailPage: React.FC<EventDetailPageProps> = ({
  initialEvent = null,
  initialEventCards = [],
  initialOtherEvents = [],
  initialNews = [],
  siteOrigin = '',
  initialSeoMeta: _initialSeoMeta,
}) => {
    const router = useRouter()
    const isAgentPortfolioSite = useAgentPortfolioSite()
    const { id } = router.query
    const { isLiked, toggleFavorite } = useEventFavorites()
    const { setPropertyTitle } = useContact()

    const [location, setLocation] = useState('Mykonos')
    const [eventType, setEventType] = useState('All')
    const [priceMin, setPriceMin] = useState('1000')
    const [priceMax, setPriceMax] = useState('5000')
    const [event, setEvent] = useState<any>(initialEvent)
    const [eventCards, setEventCards] = useState<any[]>(initialEventCards)
    const [otherEvents, setOtherEvents] = useState<any[]>(initialOtherEvents)
    const [latestNews, setLatestNews] = useState<any[]>(() => mapNewsFromApiResponse(initialNews))
    const [isLoading, setIsLoading] = useState(!initialEvent)
    const eventsWhatsAppUrl = `https://wa.me/306980960538?text=${encodeURIComponent(`Hello, I'm interested in Kennedy's Group event planning services${event?.title ? ` for ${event.title}` : ''}.`)}`
    const eventPdfRootRef = useRef<HTMLDivElement | null>(null)

    // Default data (fallback)
    const defaultGallery = useMemo(() => ({
        hero: '/images/weddings.png',
        thumbs: [
            '/images/events-1.png',
            '/images/events-2.png',
            '/images/events-3.png',
            '/images/events-4.png',
        ],
    }), [])

    // Client-side navigation between two event pages reuses this component
    // instance (same route pattern), so the useState initial values below
    // never re-run. Sync local state whenever new SSR props arrive.
    useEffect(() => {
        setEvent(initialEvent)
        setEventCards(initialEventCards)
        setOtherEvents(initialOtherEvents)
        setLatestNews(mapNewsFromApiResponse(initialNews))
        setIsLoading(!initialEvent)
    }, [initialEvent, initialEventCards, initialOtherEvents, initialNews])

    useEffect(() => {
        if (initialEvent) return;
        if (!router.isReady || typeof id !== 'string') return

        let isMounted = true

        const loadEventData = async () => {
            setIsLoading(true)
            try {
                let eventResponse = await getEventByName(id)
                if (!eventResponse || !eventResponse.data) {
                    try {
                        eventResponse = await getEvent(id)
                    } catch {
                        if (isMounted) {
                            setEvent(null)
                            setEventCards([])
                        }
                        return
                    }
                }

                if (!isMounted) return

                const eventData = eventResponse?.data
                if (eventData) {
                    setEvent(eventData)

                    try {
                        const cardsResponse = await getEventCardsByEventId(eventData.id)
                        const cards = Array.isArray(cardsResponse?.data) ? cardsResponse.data : []
                        if (isMounted) {
                            setEventCards(cards)
                        }
                    } catch (error) {
                        if (process.env.NODE_ENV !== 'production') console.error('Failed to load event cards', error)
                        if (isMounted) {
                            setEventCards([])
                        }
                    }

                    try {
                        const allEventsResponse = await getAllEvents({ listing: 1 })
                        const allEvents = Array.isArray(allEventsResponse?.data) ? allEventsResponse.data : []
                        const filtered = allEvents
                            .filter((e: any) => e.id !== eventData.id)
                            .slice(0, 3)
                            .map((e: any) => ({
                                title: e.name || '',
                                img: resolveMediaUrl(e.image || e.gallery?.[0] || '') || '',
                                href: `/events/${slugify(e.name || '')}`
                            }))

                        if (isMounted) {
                            setOtherEvents(filtered)
                        }
                    } catch (error) {
                        if (process.env.NODE_ENV !== 'production') console.error('Failed to load other events', error)
                        if (isMounted) {
                            setOtherEvents([])
                        }
                    }

                    try {
                        const newsResponse = await getLatestNews(3)
                        const newsData = getDataArray(newsResponse)
                        if (isMounted) {
                            setLatestNews(mapNewsFromApiResponse(newsData))
                        }
                    } catch (error) {
                        if (process.env.NODE_ENV !== 'production') console.error('Failed to load news', error)
                        if (isMounted) {
                            setLatestNews([])
                        }
                    }
                }
            } catch (error) {
                if (process.env.NODE_ENV !== 'production') console.error('Failed to load event', error)
                if (isMounted) {
                    setEvent(null)
                    setEventCards([])
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadEventData()

        return () => {
            isMounted = false
        }
    }, [router.isReady, id, initialEvent])

    useEffect(() => {
      setPropertyTitle(event?.title || event?.name || null)
      return () => setPropertyTitle(null)
    }, [event?.title, event?.name, setPropertyTitle])

    const pageTitle = event?.name ? event.name.toUpperCase() : 'WEDDINGS'

    const eventsToShow = otherEvents

    // Map event cards to highlights format. Only real Event Blocks created in
    // the admin are shown here - no placeholder/fallback blocks are injected
    // when an event has none.
    const highlights = useMemo(() => {
        // Wait until loading is complete before deciding what to show
        if (isLoading) {
            return []
        }

        if (!Array.isArray(eventCards)) {
            return []
        }

        return eventCards.map((card: any, index: number) => ({
            id: card.id || `card-${index}`,
            title: (card.title || '').toUpperCase(),
            img: resolveMediaUrl(card.image || '') || '/images/wedding.png',
            imgPosition: card.imagePosition || 'center',
            description: card.paragraph || '',
            imageLeft: index % 2 === 0,
        }))
    }, [eventCards, isLoading])

    // Use event gallery or default (datos desde BD: event.image, event.gallery)
    const galleryImages = useMemo(() => {
        if (event) {
            const rawGallery = event.gallery && Array.isArray(event.gallery) ? event.gallery : []
            const hero = resolveMediaUrl(event.image || rawGallery[0] || '') || '/images/weddings.png'
            const heroPosition = event.imagePosition || null
            const thumbs = rawGallery
                .map((img: string) => resolveMediaUrl(img))
                .filter(Boolean)
            // Si no hay galería en BD, usar thumbs por defecto para mantener el layout
            const thumbsToShow = thumbs.length > 0 ? thumbs : defaultGallery.thumbs
            return { hero, heroPosition, thumbs: thumbsToShow }
        }
        return { ...defaultGallery, heroPosition: null as string | null }
    }, [event, defaultGallery])

    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
    const [galleryModalIndex, setGalleryModalIndex] = useState(0)
    const [isGalleryGridModalOpen, setIsGalleryGridModalOpen] = useState(false)

    const allGalleryImages = useMemo(() => {
      const raw = [galleryImages.hero, ...galleryImages.thumbs]
      const seen = new Set<string>()
      return raw.filter((u) => {
        if (!u || seen.has(u)) return false
        seen.add(u)
        return true
      })
    }, [galleryImages])

    const eventSummary =
      event?.summary && String(event.summary).trim().length > 0
        ? truncateMetaDescription(stripHtmlToText(String(event.summary)))
        : ''

    const eventForMeta = (event ?? initialEvent ?? null) as Record<string, any> | null
    const { metaTitle: evMetaTitle, metaDescription: evMetaDesc } = pickEventSeoMeta(eventForMeta)
    const eventListingCanonicalPath = useMemo(
      () => buildEventListingPath((event ?? initialEvent ?? {}) as Record<string, unknown>, typeof id === 'string' ? id : ''),
      [id, event, initialEvent]
    )
    const metaDescFromApi =
      evMetaDesc && evMetaDesc.trim()
        ? truncateMetaDescription(
            stripHtmlToText(evMetaDesc).replace(/\s+/g, ' ').trim().slice(0, 160),
            160
          )
        : ''
    const seoHeadDescription = metaDescFromApi || eventSummary || ''
    const seoHeadTitle =
      evMetaTitle && evMetaTitle.trim()
        ? evMetaTitle.trim()
        : event?.name
          ? `${event.name} | ${SITE_NAME}`
          : `Events | ${SITE_NAME}`

    const handleShareEvent = useCallback(() => {
      if (typeof window === 'undefined') return
      const url = window.location.href
      const title = event?.name || pageTitle
      if (navigator.share) {
        void navigator.share({ title, url }).catch(() => {})
      } else {
        void navigator.clipboard.writeText(url)
      }
    }, [event?.name, pageTitle])

    return (
        <>
            <SeoHead
              title={seoHeadTitle}
              description={seoHeadDescription}
              siteOrigin={siteOrigin || undefined}
              canonicalPath={eventListingCanonicalPath}
              imageUrl={galleryImages.hero}
              type="article"
            />
            {isLoading ? (
                <EventDetailPageSkeleton />
            ) : (
                <>
            <div ref={eventPdfRootRef}>
            <section
                className="event-detail-pdf-hero pdf-hero-image-area relative flex h-[520px] md:h-[760px] w-full items-center justify-center"
                style={{
                  ['--event-detail-pdf-hero-bg' as string]: `url("${String(galleryImages.hero).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`,
                }}
            >
                <Navbar textBlack={true} className="absolute top-0 left-0 w-full z-20 bg-transparent pdf-exclude-from-capture" />
                <img
                    src={galleryImages.hero}
                    alt={pageTitle}
                    className="event-detail-pdf-hero-img absolute inset-0 h-full w-full object-cover"
                    style={positionStyle(galleryImages.heroPosition)}
                />
                <div className="absolute inset-0 bg-black/25" />
            </section>

            {event?.id ? (
                <>
                <div className='bg-white px-4 pt-8 pb-6 md:pt-10 md:pb-8'>
                    <div className='mx-auto flex max-w-[1300px] flex-col items-center text-center'>
                        <h1 className='font-gtsuper-ds text-3xl font-light uppercase tracking-[0.02em] text-[#172338] sm:text-4xl md:text-5xl lg:text-6xl'>
                            {pageTitle}
                        </h1>
                        {event?.summary && String(event.summary).trim().length > 0 ? (
                            <div
                                className='event-detail-summary mt-4 max-w-3xl font-haas text-base font-light leading-relaxed text-[#506A70] md:mt-6 md:text-lg [&_a]:text-[#172338] [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0'
                                dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(String(event.summary)) }}
                            />
                        ) : null}
                    </div>
                </div>
                <div
                  className='flex justify-center border-b border-[#E9E9E9] bg-white px-4 py-4'
                  data-pdf-exclude-canvas='true'
                >
                    <div className='flex flex-wrap items-center justify-center gap-6 text-[#172338]'>
                    <button
                        type='button'
                        className='flex items-center gap-2 font-haas font-light transition-colors hover:text-[#28F6EA]'
                        aria-pressed={isLiked(String(event.id))}
                        onClick={() => {
                            const hero = resolveMediaUrl(event?.image || event?.gallery?.[0] || '') || '/images/weddings.png'
                            toggleFavorite({
                                id: String(event.id),
                                name: event?.name || '',
                                image: hero || '',
                            })
                        }}
                    >
                        <svg width='22' height='22' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden>
                            <path
                                d='M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z'
                                stroke={isLiked(String(event.id)) ? '#ef4444' : '#172338'}
                                fill={isLiked(String(event.id)) ? '#ef4444' : 'none'}
                                strokeWidth='1.5'
                            />
                        </svg>
                        <span>{isLiked(String(event.id)) ? 'Saved' : 'Save'}</span>
                    </button>
                    <button
                        type='button'
                        className='flex items-center gap-2 font-haas font-light transition-opacity hover:opacity-80'
                        onClick={handleShareEvent}
                    >
                        <BsShare size={22} aria-hidden />
                        <span>Share</span>
                    </button>
                    {/* <PagePdfExportButton
                        rootRef={eventPdfRootRef}
                        fileNameBase={event?.name || pageTitle || 'event'}
                        className='flex items-center gap-2 font-haas font-light transition-opacity hover:opacity-80 disabled:opacity-60'
                    /> */}
                    </div>
                </div>
                </>
            ) : null}

            <section className='mx-auto mb-10 mt-10 flex max-w-[1300px] flex-col items-center gap-5 px-4 md:mt-16 md:px-6'>
                <section className='flex w-full flex-col gap-10'>
                    <div className='flex w-full flex-col gap-10'>
                            {highlights.map((h, blockIndex) => {
                            const isLastBlock = blockIndex === highlights.length - 1
                            return (
                            <div key={h.id || h.title} className={`flex w-full flex-col items-start gap-6 md:flex-row md:gap-8 ${!h.imageLeft ? 'md:justify-between' : ''}`}>
                                {h.imageLeft ? (
                                    <>
                                        <div className='h-56 w-full shrink-0 overflow-hidden md:h-[364px] md:w-1/2'>
                                            <img src={h.img} alt='' className='h-full w-full object-cover' style={positionStyle((h as any).imgPosition)} />
                                        </div>
                                        <div className='flex flex-1 flex-col items-start gap-4 md:gap-5'>
                                            <div className='w-full'>
                                                <h2 className='font-gtsuper-ds py-3 text-3xl font-light text-[#506A70] sm:text-4xl md:py-4 md:text-5xl'>{h.title}</h2>
                                                <div className='mt-3 border-b border-soft-gray-dark md:mt-4' aria-hidden />
                                            </div>
                                            <p className='max-w-[700px] font-haas font-light'>{h.description}</p>
                                            {isLastBlock && !isAgentPortfolioSite ? (
                                                <div className='flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap pdf-exclude-from-capture'>
                                                  <Button
                                                    type='button'
                                                    onClick={() => window.open(eventsWhatsAppUrl, '_blank')}
                                                    className='flex h-auto min-h-[52px] w-full items-center justify-center gap-2 whitespace-normal rounded-none bg-[#28F6EA] px-4 py-3 text-center font-haas font-light text-[#172338] hover:bg-[#28F6EA]/80 sm:w-auto sm:px-6'
                                                  >
                                                    Contact our event planner
                                                    <ChevronRightIcon className='h-4 w-4 shrink-0' />
                                                  </Button>
                                                  <Button
                                                    type='button'
                                                    onClick={() => window.open(eventsWhatsAppUrl, '_blank')}
                                                    className='flex h-auto min-h-[52px] w-full items-center justify-center gap-2 whitespace-normal rounded-none border border-[#172338] bg-white px-4 py-3 text-center font-haas font-light text-[#172338] hover:bg-[#F0F3F5] sm:w-auto sm:px-6'
                                                  >
                                                    Contact our agent
                                                    <ChevronRightIcon className='h-4 w-4 shrink-0' />
                                                  </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='order-2 flex flex-1 flex-col items-start gap-4 md:order-1 md:items-end md:gap-5'>
                                            <div className='w-full md:text-right'>
                                                <h2 className='font-gtsuper-ds py-3 text-3xl font-light text-[#506A70] sm:text-4xl md:py-4 md:text-5xl'>{h.title}</h2>
                                                <div className='mt-3 border-b border-soft-gray-dark md:mt-4' aria-hidden />
                                            </div>
                                            <p className='max-w-[700px] font-haas font-light md:text-right'>{h.description}</p>
                                            {isLastBlock && !isAgentPortfolioSite ? (
                                                <div className='flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap md:ml-auto md:justify-end pdf-exclude-from-capture'>
                                                  <Button
                                                    type='button'
                                                    onClick={() => window.open(eventsWhatsAppUrl, '_blank')}
                                                    className='flex h-auto min-h-[52px] w-full items-center justify-center gap-2 whitespace-normal rounded-none bg-[#28F6EA] px-4 py-3 text-center font-haas font-light text-[#172338] hover:bg-[#28F6EA]/80 sm:w-auto sm:px-6'
                                                  >
                                                    Contact our event planner
                                                    <ChevronRightIcon className='h-4 w-4 shrink-0' />
                                                  </Button>
                                                  <Button
                                                    type='button'
                                                    onClick={() => window.open(eventsWhatsAppUrl, '_blank')}
                                                    className='flex h-auto min-h-[52px] w-full items-center justify-center gap-2 whitespace-normal rounded-none border border-[#172338] bg-white px-4 py-3 text-center font-haas font-light text-[#172338] hover:bg-[#F0F3F5] sm:w-auto sm:px-6'
                                                  >
                                                    Contact our agent
                                                    <ChevronRightIcon className='h-4 w-4 shrink-0' />
                                                  </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className='order-1 h-56 w-full shrink-0 overflow-hidden md:order-2 md:h-[364px] md:w-1/2'>
                                            <img src={h.img} alt='' className='h-full w-full object-cover' style={positionStyle((h as any).imgPosition)} />
                                        </div>
                                    </>
                                )}
                            </div>
                            )
                            })}
                        </div>
                </section>
            </section>

            <section className='pdf-gallery-area pdf-exclude-from-capture w-full overflow-x-hidden bg-[#F0F3F5] py-12 md:py-16 pb-6 md:pb-8'>
                <div className='mx-auto w-full max-w-[1300px] px-4 md:px-6'>
                    <h2 className='mb-6 text-center font-gtsuper-ds text-3xl font-light text-[#172338] md:mb-8 md:text-[40px]'>
                        Photos
                    </h2>
                    {(() => {
                        const totalImages = allGalleryImages.length
                        const hasThumbRow = totalImages > 1
                        const moreCount = hasThumbRow ? Math.max(0, totalImages - 4) : 0
                        const previewForMore =
                            allGalleryImages[4] ?? allGalleryImages[3] ?? allGalleryImages[totalImages - 1]

                        return (
                            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4'>
                                <div
                                    className='col-span-2 aspect-[16/10] min-h-[200px] w-full cursor-pointer overflow-hidden sm:col-span-4 sm:aspect-auto sm:h-[300px] md:h-[360px]'
                                    onClick={() => {
                                        if (allGalleryImages.length > 0) {
                                            setGalleryModalIndex(0)
                                            setIsGalleryModalOpen(true)
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            if (allGalleryImages.length > 0) {
                                                setGalleryModalIndex(0)
                                                setIsGalleryModalOpen(true)
                                            }
                                        }
                                    }}
                                    role='button'
                                    tabIndex={0}
                                    aria-label='Open photo gallery'
                                >
                                    <img
                                        src={galleryImages.hero}
                                        className='h-full w-full object-cover transition duration-300 ease-out hover:opacity-90'
                                        style={positionStyle(galleryImages.heroPosition)}
                                        alt=''
                                    />
                                </div>
                                {hasThumbRow
                                    ? [1, 2, 3].map((imgIndex) => {
                                        const src = allGalleryImages[imgIndex]
                                        if (!src) {
                                            return <div key={imgIndex} className='hidden min-h-[7rem] sm:block' aria-hidden />
                                        }
                                        return (
                                            <button
                                                key={imgIndex}
                                                type='button'
                                                onClick={() => {
                                                    setGalleryModalIndex(imgIndex)
                                                    setIsGalleryModalOpen(true)
                                                }}
                                                className='relative h-28 w-full min-h-[7rem] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-2'
                                            >
                                                <img src={src} alt='' className='h-full w-full object-cover' />
                                            </button>
                                        )
                                      })
                                    : null}
                                {hasThumbRow && moreCount > 0 ? (
                                    <button
                                        type='button'
                                        onClick={() => setIsGalleryGridModalOpen(true)}
                                        className='relative h-28 w-full min-h-[7rem] cursor-pointer overflow-hidden bg-[#506A70]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330] focus-visible:ring-offset-2'
                                    >
                                        {previewForMore ? (
                                            <img src={previewForMore} alt='' className='h-full w-full scale-105 object-cover blur-sm' />
                                        ) : null}
                                        <div className={`absolute inset-0 flex items-center justify-center px-2 ${previewForMore ? 'bg-black/45' : 'bg-[#506A70]/40'}`}>
                                            <span className='text-center font-haas text-base font-semibold leading-tight text-white md:text-lg'>
                                                +{moreCount} {moreCount === 1 ? 'photo' : 'photos'}
                                            </span>
                                        </div>
                                    </button>
                                ) : null}
                            </div>
                        )
                    })()}
                </div>
            </section>
            </div>

            <ImageGalleryModal
                images={allGalleryImages}
                initialIndex={galleryModalIndex}
                isOpen={isGalleryModalOpen}
                onClose={() => setIsGalleryModalOpen(false)}
                propertyTitle={event?.name || pageTitle}
            />
            <ImageGalleryGridModal
                images={allGalleryImages}
                videos={[]}
                isOpen={isGalleryGridModalOpen}
                onClose={() => setIsGalleryGridModalOpen(false)}
                onImageClick={(index) => {
                    setIsGalleryGridModalOpen(false)
                    setGalleryModalIndex(index)
                    setIsGalleryModalOpen(true)
                }}
                propertyTitle={event?.name || pageTitle}
            />

            {eventsToShow.length > 0 ? (
            <section className="w-full flex justify-center bg-[#F4F6F8] py-12 md:py-14">
                <div className="w-full max-w-[1300px] px-4 md:px-6">
                    <div className="relative mb-6 md:mb-8">
                        <h2 className="text-center font-gtsuper-ds text-3xl md:text-4xl font-light text-[#3B4B53]">Other Events</h2>
                        <Link href="/events/list" className="absolute right-0 top-1/2 -translate-y-1/2 text-sm underline text-[#3B4B53]">View all</Link>
                    </div>
                    <div className="flex sm:grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory touch-pan-x [-webkit-overflow-scrolling:touch] px-4 sm:px-0 -mx-4 sm:mx-0">
                        {eventsToShow.map((ev) => (
                            <Link
                              key={ev.href || ev.title}
                              href={ev.href || '/events'}
                              className="group block shrink-0 snap-start snap-always w-[85vw] sm:w-auto text-[#172338] outline-none focus-visible:ring-2 focus-visible:ring-[#172338] focus-visible:ring-offset-2"
                            >
                                <article>
                                    <div className="h-[300px] w-full overflow-hidden bg-[#E8EBED]">
                                        {ev.img ? (
                                          <img src={ev.img} alt={ev.title || ''} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                                        ) : null}
                                    </div>
                                    <h3 className="mt-4 text-xl font-haas font-light group-hover:underline group-hover:decoration-[#172338]/50">{ev.title}</h3>
                                    <div className="mt-3 flex items-center gap-3">
                                        <span className="h-px flex-1 bg-[#172338]" />
                                        <span className="inline-flex items-center gap-2 text-sm underline">
                                            More info
                                            <ChevronRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
            ) : null}
                </>
            )}

            {!isLoading && latestNews.length > 0 ? (
                <WeAreOnTheNews news={latestNews} fallbackNews={[]} />
            ) : null}

            <Footer disableTravelSection={true} />
        </>
    )
}

export async function getServerSideProps(context: { params?: { id?: string }; req?: import('http').IncomingMessage }) {
  const id = context.params?.id
  const siteOrigin = getPublicSiteOriginFromRequest(context.req)
  if (!id || typeof id !== 'string') {
    return { props: { initialEvent: null, initialEventCards: [], initialOtherEvents: [], initialNews: [], siteOrigin } }
  }
  try {
    let eventData: any = null
    const byName = await getEventByName(id)
    if (byName?.data) {
      eventData = byName.data
    } else {
      try {
        const byId = await getEvent(id)
        eventData = byId?.data ?? byId ?? null
      } catch {
        // ignore
      }
    }
    if (!eventData) {
      return { props: { initialEvent: null, initialEventCards: [], initialOtherEvents: [], initialNews: [], siteOrigin } }
    }
    const [cardsRes, allEventsRes, newsRes] = await Promise.all([
      getEventCardsByEventId(eventData.id),
      getAllEvents({ listing: 1 }),
      getLatestNews(3),
    ])
    const cards = getDataArray(cardsRes)
    const allEvents = getDataArray(allEventsRes)
    const otherEvents = allEvents
      .filter((e: any) => e.id !== eventData.id)
      .slice(0, 3)
      .map((e: any) => ({
        title: e.name || '',
        img: resolveMediaUrl(e.image || e.gallery?.[0] || '') || '',
        href: `/events/${slugify(e.name || '')}`,
      }))
    const news = getDataArray(newsRes)
    return {
      props: {
        initialEvent: eventData,
        initialEventCards: cards,
        initialOtherEvents: otherEvents,
        initialNews: news,
        siteOrigin,
        initialSeoMeta: buildEventDetailInitialSeoMeta(eventData as Record<string, unknown>),
      },
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('getServerSideProps events/[id]:', err)
    return { props: { initialEvent: null, initialEventCards: [], initialOtherEvents: [], initialNews: [], siteOrigin } }
  }
}

export default EventDetailPage


