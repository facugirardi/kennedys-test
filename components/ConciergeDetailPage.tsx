"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { sanitizeCmsHtml } from '@/lib/sanitizeCmsHtml'
import Link from 'next/link'
import { Button } from './ui/button1'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { GoHeart } from "react-icons/go"
import { BsShare } from "react-icons/bs"
import Footer from '@/components/custom/footerNew'
import { PagePdfExportButton } from '@/components/custom/PagePdfExportButton'
import { getAllServices, getService } from '@/lib/api/services'
import {
  ConciergeServiceDetail,
  ConciergeServicePreview,
  buildConciergeServicePathIndex,
  getConciergeServicePath,
  getConciergeServicePathForApiItemUnique,
  mapServiceToDetail,
  pickSimilarServicePreviews,
} from '@/lib/mappers/concierge'
import { OFFER_AGENT_FRIENDLY_QUERY_KEY, getOfferBackHref } from '@/lib/offerPublicSiteUrl'
import { useAgentPortfolioSite } from '@/src/contexts/AgentPortfolioContext'
import { buildBrochureDownloadName } from '@/lib/brochureDownload'
import { resolveMediaUrl, wsrvUrl, positionStyle } from '@/lib/utils'
import { useAuth } from '@/src/contexts/AuthContext'
import { useServiceLikes } from '@/src/hooks/useServiceLikes'
import ImageGalleryModal from '@/components/custom/ImageGalleryModal'
import ImageGalleryGridModal from '@/components/custom/ImageGalleryGridModal'
import { TruncateText } from '@/components/ui/TruncateText'
import { TwoParagraphText } from '@/components/ui/TwoParagraphText'
import { useContact } from '@/src/contexts/ContactContext'

const galleryFallback = '/images/chuffer-service-image.png'

function getSimilarServiceHref(
  item: ConciergeServicePreview,
  agentOfferView: boolean
): string {
  let path: string
  if (item.id) {
    path = `/concierge/${encodeURIComponent(String(item.id))}`
  } else {
    path = getConciergeServicePath({ location: item.location, type: item.type, name: item.name })
  }
  if (!agentOfferView) return path
  const sep = path.includes("?") ? "&" : "?"
  return `${path}${sep}${OFFER_AGENT_FRIENDLY_QUERY_KEY}=1`
}

type ConciergeDetailPageProps = {
  initialService?: ConciergeServiceDetail | null;
  initialSimilarServices?: ConciergeServicePreview[];
  /** Oferta unbranded: sin pie ni breadcrumbs de marketing. */
  agentOfferView?: boolean;
};

export const ConciergeDetailPage = ({
  initialService = null,
  initialSimilarServices = [],
  agentOfferView = false,
}: ConciergeDetailPageProps = {}) => {
  const router = useRouter()
  const offerBackHref = getOfferBackHref(router.query, agentOfferView ? { agentFriendly: true } : {})
  const rawSlug = router.query.slug
  const slugArray = Array.isArray(rawSlug) ? rawSlug : typeof rawSlug === 'string' ? [rawSlug] : []
  const id = slugArray.length === 1 ? slugArray[0] : undefined
  const locationSlug = slugArray.length === 3 ? slugArray[0] : undefined
  const typeSlug = slugArray.length === 3 ? slugArray[1] : undefined
  const nameSlug = slugArray.length === 3 ? slugArray[2] : undefined
  const isAgentPortfolioSite = useAgentPortfolioSite()
  /** agents-portfolio.com: UI sin Kennedy's (quote modal, sin Save). */
  const agentPortfolioUnbrandedUi = isAgentPortfolioSite
  const hideMarketingChrome = agentOfferView || isAgentPortfolioSite
  const agentFriendlyNav = agentOfferView || isAgentPortfolioSite
  const { setPropertyTitle } = useContact()
  const { isAuthenticated } = useAuth()
  const {
    isLiked: isServiceLiked,
    toggleFavorite: toggleServiceFavorite,
    pendingIds: pendingServiceIds,
  } = useServiceLikes()

  const [service, setService] = useState<ConciergeServiceDetail | null>(initialService ?? null)
  const [similarServices, setSimilarServices] = useState<ConciergeServicePreview[]>(initialSimilarServices)
  const [isLoading, setIsLoading] = useState<boolean>(!initialService)
  const [error, setError] = useState<string | null>(null)
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false)
  const [isGalleryGridModalOpen, setIsGalleryGridModalOpen] = useState(false)
  const [galleryModalIndex, setGalleryModalIndex] = useState(0)
  const pdfExportRootRef = useRef<HTMLDivElement | null>(null)

  const openRequestQuote = () => {
    if (agentPortfolioUnbrandedUi) {
      return
    }
    const msg = `Hello, I'm interested in the concierge service${service?.name ? ` ${service.name}` : ''}.`
    window.open(`https://wa.me/306980960538?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const isPathMode = Boolean(
    router.isReady &&
    slugArray.length === 3 &&
    typeof locationSlug === 'string' &&
    typeof typeSlug === 'string' &&
    typeof nameSlug === 'string'
  )
  const isIdMode = Boolean(router.isReady && slugArray.length === 1 && typeof id === 'string')
  const hasValidSlug = slugArray.length === 1 || slugArray.length === 3

  useEffect(() => {
    if (initialService) return
    if (!router.isReady) return
    if (!hasValidSlug) {
      setService(null)
      setError('Invalid concierge URL.')
      setIsLoading(false)
      return
    }
    if (!isPathMode && !isIdMode) return

    let isMounted = true

    const loadService = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const allResponse = await getAllServices({ published: true, forWebsite: true })
        const allData = Array.isArray(allResponse?.data) ? allResponse.data : []

        let detailData: any = null

        if (isPathMode && locationSlug && typeSlug && nameSlug) {
          const wantedPath = `/concierge/${String(locationSlug)}/${String(typeSlug)}/${String(nameSlug)}`
          detailData = buildConciergeServicePathIndex(allData).get(wantedPath) ?? null
        } else if (isIdMode && typeof id === 'string') {
          const detailResponse = await getService(id, { forWebsite: true })
          detailData = detailResponse?.data
        }

        if (!isMounted) return

        if (!detailData) {
          setService(null)
          setError('We could not find this concierge service.')
          setSimilarServices([])
        } else {
          const mapped = mapServiceToDetail(detailData)
          setService(mapped)
          const similar = pickSimilarServicePreviews(allData, detailData, 3)
          if (isMounted) setSimilarServices(similar)
          // No redirigir a la URL canónica si viene de una offer: perdería el
          // query `fromOffer` (botón "Go back") y, si el service está
          // unpublished, el lookup por path (que solo busca en published)
          // fallaría a mostrarlo. Se queda en /concierge/:id, que busca por
          // id sin filtrar por published.
          if (isMounted && isIdMode && typeof id === 'string' && !agentOfferView && !offerBackHref) {
            const canonicalPath = getConciergeServicePathForApiItemUnique(detailData, allData)
            if (canonicalPath && canonicalPath !== `/concierge/${id}`) {
              router.replace(canonicalPath)
              return
            }
          }
        }
      } catch (err) {
        console.error('Failed to load concierge service', err)
        if (isMounted) {
          setError('We could not load this concierge service. Please try again later.')
          setService(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadService()

    return () => {
      isMounted = false
    }
  }, [router.isReady, hasValidSlug, isPathMode, isIdMode, id, locationSlug, typeSlug, nameSlug, initialService, agentOfferView, offerBackHref])

  useEffect(() => {
    setPropertyTitle(service?.name || null)
    return () => setPropertyTitle(null)
  }, [service?.name, setPropertyTitle])

  const galleryImages = useMemo(() => {
    if (!service) return [galleryFallback]
    const unique = Array.from(new Set(service.gallery))
    return unique.length > 0 ? unique : [service.heroImage || galleryFallback]
  }, [service])

  /** Loggia's per-image reposition value ("62.0% 40.0%"), looked up by URL since `galleryImages` is deduped. */
  const galleryPositionByUrl = useMemo(() => {
    const map = new Map<string, string | null>()
    service?.gallery?.forEach((url, index) => {
      map.set(url, service.galleryPositions?.[index] ?? null)
    })
    return map
  }, [service])

  const heroImage = service?.heroImage || galleryImages[0] || galleryFallback
  const heroImagePosition = galleryPositionByUrl.get(heroImage) ?? null
  const secondaryImages = useMemo(() => {
    const remainder = galleryImages.filter((image) => image !== heroImage)
    if (remainder.length >= 2) return remainder.slice(0, 2)
    if (remainder.length === 1) return [...remainder, heroImage]
    return [heroImage, heroImage]
  }, [galleryImages, heroImage])
  const galleryImagePositions = useMemo(
    () => galleryImages.map((img) => galleryPositionByUrl.get(img) ?? null),
    [galleryImages, galleryPositionByUrl]
  )

  // Dividir descripción en dos columnas si supera ~430 caracteres (aprox. 5 líneas como en la referencia)
  const DESCRIPTION_COLUMN_CHARS = 430
  const descriptionColumns = useMemo(() => {
    const full = service?.description ?? ''
    if (!full.trim()) return { part1: '', part2: '' }
    const secondary = service?.secondaryDescription?.trim()
    if (secondary && secondary !== full.trim()) {
      return { part1: full, part2: secondary }
    }
    if (full.length <= DESCRIPTION_COLUMN_CHARS) return { part1: full, part2: '' }
    const splitAt = full.lastIndexOf(' ', DESCRIPTION_COLUMN_CHARS)
    const index = splitAt <= 0 ? DESCRIPTION_COLUMN_CHARS : splitAt
    return { part1: full.slice(0, index).trim(), part2: full.slice(index).trim() }
  }, [service?.description, service?.secondaryDescription])
  const firstParagraph = descriptionColumns.part1
  const secondParagraph = descriptionColumns.part2

  const locationLabel = useMemo(() => {
    if (!service) return ''
    if (service.location && service.area) {
      return `${service.location} · ${service.area}`
    }
    return service.location || service.area || ''
  }, [service])

  // Construir breadcrumbs (ANTES de cualquier return)
  const breadcrumbs = useMemo(() => {
    if (!service) return []
    const items: Array<{ label: string; href: string | null }> = [
      { label: 'Home', href: '/' },
      { label: 'Concierge', href: '/concierge' },
    ]
    
    if (service.location) {
      const locationParts = service.location.split(',').map(l => l.trim()).filter(Boolean)
      if (locationParts.length > 0) {
        items.push({ label: locationParts[0], href: `/concierge?location=${encodeURIComponent(locationParts[0])}` })
      }
    }
    
    if (service.type) {
      items.push({ label: service.type, href: `/concierge/list?type=${encodeURIComponent(service.type)}` })
    }
    
    items.push({ label: service.name, href: null })
    
    return items
  }, [service])

  // Resolver URLs de imágenes correctamente (ANTES de cualquier return)
  const resolvedHeroImage = useMemo(() => {
    if (!heroImage) return galleryFallback
    if (heroImage.startsWith('http')) return heroImage
    return resolveMediaUrl(heroImage) || galleryFallback
  }, [heroImage])

  const resolvedSecondaryImages = useMemo(() => {
    return secondaryImages.map(img => {
      if (!img) return galleryFallback
      if (img.startsWith('http')) return img
      return resolveMediaUrl(img) || galleryFallback
    })
  }, [secondaryImages])

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col gap-8 py-12 w-full px-4 md:px-20 max-w-[90%] mx-auto">
          <p className="font-haas text-center text-[#506A70]">Loading concierge service...</p>
        </div>
        {!hideMarketingChrome ? <Footer disableTravelSection={true} /> : null}
      </>
    )
  }

  if (!service || error) {
    return (
      <>
        <div className="flex flex-col gap-6 py-12 w-full px-4 md:px-20 max-w-[90%] mx-auto">
          <p className="font-haas text-center text-[#D04444]">{error ?? 'Service not found.'}</p>
          {!hideMarketingChrome ? (
            <Button
              className="mx-auto bg-[#28F6EA] text-[#172338] hover:bg-[#28F6EA]/80"
              onClick={() => router.push('/concierge/list')}
            >
              Go back to concierge list
            </Button>
          ) : null}
        </div>
        {!hideMarketingChrome ? <Footer disableTravelSection={true} /> : null}
      </>
    )
  }

  return (
    <>
      <div ref={pdfExportRootRef} className="w-full">
      {/* Breadcrumbs */}
      {!hideMarketingChrome ? (
      <div className="w-full bg-gray-200 pdf-exclude-from-capture">
        <div className="max-w-[90%] mx-auto px-4 md:px-20">
          <div className="h-10 md:h-16 flex items-center gap-2 text-xs md:text-sm overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
                {item.href ? (
                  <Link href={item.href} className="underline hover:text-[#28F6EA] transition-colors shrink-0">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold shrink-0 truncate max-w-[55vw] md:max-w-none">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      ) : null}

      <div className="concierge-pdf-capture-main flex flex-col gap-8 py-8 w-full px-4 md:px-10 lg:px-20 max-w-[1400px] mx-auto">
        <section className="flex flex-col gap-6 md:gap-8" data-pdf-export-block="true">
          <div className="pdf-gallery-area relative">
            {offerBackHref ? (
              <Link
                href={offerBackHref}
                className="absolute top-4 left-4 md:left-8 z-20 flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-white border border-[#172338]/20 text-[#172338] font-haas font-light text-sm hover:bg-[#F7F8FA] hover:border-[#172338]/40 transition-all duration-200 shadow-sm pdf-exclude-from-capture"
              >
                <ChevronLeft size={18} strokeWidth={1.5} className="text-[#D99330]" />
                Go back
              </Link>
            ) : null}
          {/* Mobile: carrusel simple → abre grilla de galería */}
          <div className="md:hidden -mx-4">
            <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-2 px-4">
              {[resolvedHeroImage, ...resolvedSecondaryImages].slice(0,3).map((src, index) => {
                const rawSrc = [heroImage, ...secondaryImages][index]
                return (
                <button
                  key={`${service.id}-mobile-${index}`}
                  type="button"
                  className="snap-center shrink-0 w-full cursor-pointer"
                  onClick={() => {
                    if (galleryImages.length > 0) {
                      setIsGalleryGridModalOpen(true)
                    }
                  }}
                >
                  <img
                    className="w-full h-56 object-cover"
                    src={wsrvUrl(src, { w: 900, h: 450, q: 100, position: galleryPositionByUrl.get(rawSrc) ?? null })}
                    alt={service.name}
                    style={positionStyle(galleryPositionByUrl.get(rawSrc) ?? null)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = galleryFallback
                    }}
                  />
                </button>
              )})}
            </div>
          </div>

          {/* Desktop: layout collage hero → abre grilla de galería + logo flotante */}
          <div className="concierge-pdf-hero hidden md:block relative overflow-visible" style={{ height: '400px', maxHeight: '400px' }}>
            <div className="concierge-pdf-hero-grid grid grid-cols-[2fr_1fr] gap-6 h-full" style={{ maxHeight: '400px' }}>
              {/* Imagen grande izquierda */}
              <button
                type="button"
                className="w-full h-full relative overflow-hidden cursor-pointer"
                style={{ maxHeight: '400px', width: 'calc(100% + 10px)' }}
                onClick={() => {
                  if (galleryImages.length > 0) {
                    setIsGalleryGridModalOpen(true)
                  }
                }}
              >
                <img
                  className="w-full h-full object-cover"
                  src={wsrvUrl(resolvedHeroImage, { w: 2000, h: 1200, q: 95, position: heroImagePosition })}
                  alt={service.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    ...(heroImagePosition
                      ? positionStyle(heroImagePosition)
                      : { objectPosition: service.mainImagePosition === 'top' ? 'center top' : service.mainImagePosition === 'bottom' ? 'center bottom' : 'center center' }),
                    display: 'block'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = galleryFallback
                  }}
                />
              </button>
              {/* Columna derecha con dos imágenes apiladas - misma altura que la izquierda */}
              <div className="concierge-pdf-hero-rail w-full grid grid-rows-2 gap-6" style={{ height: '410px', maxHeight: '410px' }}>
                {resolvedSecondaryImages.slice(0,2).map((src, index) => (
                  <button
                    key={`${service.id}-desktop-${index}`}
                    type="button"
                    className="w-full h-full overflow-hidden cursor-pointer"
                    style={{ minHeight: 0, maxHeight: '100%', ...(index === 1 ? { marginTop: '-10px' } : {}) }}
                    onClick={() => {
                      if (galleryImages.length > 0) {
                        setIsGalleryGridModalOpen(true)
                      }
                    }}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={wsrvUrl(src, { w: 1000, h: 500, q: 95, position: galleryPositionByUrl.get(secondaryImages[index]) ?? null })}
                      alt={`${service.name} ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        ...positionStyle(galleryPositionByUrl.get(secondaryImages[index]) ?? null),
                        display: 'block'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = galleryFallback
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
            {!hideMarketingChrome ? (
            /* Logo Kennedy's Group flotante en el centro de las 3 imágenes (oculto en ofertas unbranded) */
            <div
              className="concierge-pdf-hero-logo absolute top-1/2 pointer-events-none z-10"
              style={{
                /* Center on the vertical seam between 2fr and 1fr columns (gap-6 = 1.5rem) */
                left: 'calc((100% - 1.5rem) * 2 / 3 + 0.75rem)',
                transform: 'translate(-50%, -50%)',
              }}
              aria-hidden
            >
              <div
                className="flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-full bg-white"
                style={{
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <svg
                  viewBox="0 0 450 180"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                  style={{ transform: 'scale(3.3)', transformOrigin: 'center left', marginBottom: '24px', marginRight: '15px' }}
                >
                  <circle cx="76.9179" cy="102.803" r="71" transform="rotate(-5 76.9179 102.803)" fill="white" />
                  <g clipPath="url(#clip0_concierge_logo)">
                    <path d="M49.3185 74.089L43.8431 67.4833L44.4614 66.9694L47.3791 70.4894L48.024 64.0091L48.827 63.3419L48.2958 68.3235L54.4686 69.8096L53.7302 70.4231L48.2236 69.1013L48.0071 71.247L49.9369 73.5752L49.3185 74.089Z" fill="#172338" />
                    <path d="M55.4214 69.4686L51.3139 61.9357L56.4315 59.1388L56.7705 59.7604L52.3584 62.1717L53.8348 64.8793L57.8783 62.6695L58.2115 63.2805L54.168 65.4904L55.7708 68.4298L60.2987 65.9552L60.6549 66.6084L55.4214 69.4686Z" fill="#172338" />
                    <path d="M62.0321 66.2059L59.4857 58.0124L60.3221 57.752L65.8794 62.3309C66.4842 62.8212 67.1131 63.4298 67.1131 63.4298L67.136 63.4226L64.9279 56.3178L65.6612 56.0895L68.2076 64.2829L67.4056 64.5327L61.8811 60.019C61.325 59.5638 60.5909 58.9 60.5909 58.9L60.568 58.9071L62.7654 65.9775L62.0321 66.2059Z" fill="#172338" />
                    <path d="M69.7771 64.1822L68.8908 55.6481L69.7621 55.5576L74.3112 61.1414C74.8078 61.7413 75.3049 62.4618 75.3049 62.4618L75.3288 62.4593L74.5603 55.0591L75.3242 54.9798L76.2104 63.5139L75.3749 63.6007L70.8452 58.0872C70.3893 57.5314 69.8 56.736 69.8 56.736L69.7762 56.7385L70.5409 64.1029L69.7771 64.1822Z" fill="#172338" />
                    <path d="M77.7403 63.7501L78.5726 55.2106L84.3768 55.779L84.3081 56.4837L79.3041 55.9936L79.0049 59.0631L83.591 59.5122L83.5234 60.2049L78.9374 59.7558L78.6126 63.088L83.7481 63.591L83.6759 64.3314L77.7403 63.7501Z" fill="#172338" />
                    <path d="M86.0159 64.3387L88.0597 64.9594C90.0232 65.5558 91.2727 64.4931 91.9021 62.4143C92.5315 60.3355 92.1795 58.7236 90.2161 58.1272L88.0919 57.482L86.0159 64.3387ZM85.0415 64.7826L87.5277 56.5707L90.4442 57.4566C92.8669 58.1925 93.443 60.2236 92.7059 62.6584C91.9687 65.0933 90.3003 66.3799 87.8776 65.644L85.0415 64.7826Z" fill="#172338" />
                    <path d="M94.2073 68.3352L95.9284 65.0102L95.4035 59.2891L96.1917 59.6982L96.6049 64.5907L96.6262 64.6018L100.878 62.1308L101.645 62.5288L96.6416 65.4075L94.9316 68.7112L94.2073 68.3352Z" fill="#172338" />
                    <path d="M104.176 66.3799L105.732 65.6547L106.511 66.2552L104.689 66.7753L104.176 66.3799Z" fill="#172338" />
                    <path d="M105.358 77.4598C103.842 75.7892 104.033 74.1068 105.202 72.9132L105.742 73.5086C104.725 74.5479 104.782 75.8257 105.863 77.0165C106.71 77.9495 107.809 78.2147 108.67 77.4313C109.567 76.6157 109.24 75.8265 108.281 74.2166C107.447 72.8336 107.052 71.6842 108.162 70.6748C109.174 69.7542 110.613 70.0016 111.767 71.2723C113.049 72.6852 112.931 74.0906 111.944 75.1994L111.42 74.6218C112.219 73.6996 112.1 72.6398 111.278 71.7334C110.399 70.7648 109.405 70.5983 108.704 71.2362C107.949 71.9226 108.251 72.7191 109.07 74.0503C109.951 75.5036 110.577 76.8001 109.245 78.0114C108.118 79.037 106.568 78.7928 105.358 77.4598Z" fill="#172338" />
                    <path d="M111.439 87.0857C110.36 84.8217 111.445 82.7206 113.763 81.6136C116.047 80.5222 118.415 81.0001 119.536 83.3507C120.295 84.9431 120.035 86.5169 118.599 87.5486L118.243 86.8012C119.288 86.0094 119.471 84.8315 118.908 83.6508C117.958 81.6576 115.997 81.477 114.124 82.3719C112.218 83.2823 111.205 84.9498 112.083 86.7913C112.935 88.5787 114.536 88.7581 115.879 88.1167L116.149 87.9874L114.962 85.4959L115.601 85.1907L117.129 88.3971L113.155 90.2955L112.912 89.7863L114.075 89.045L114.059 89.0125C113.24 88.9117 112.121 88.5156 111.439 87.0857Z" fill="#172338" />
                    <path d="M113.33 91.5935L121.669 89.5744L122.569 93.2953C122.932 94.7999 122.278 95.872 120.89 96.2081C119.864 96.4566 119.08 96.1771 118.546 95.2941L118.511 95.3026C118.428 96.2363 117.866 96.6687 116.585 97.0405C115.258 97.4236 114.956 97.6571 114.888 97.8342L114.841 97.8455L114.638 97.0057C114.722 96.788 115.025 96.6651 116.431 96.2506C117.86 95.8304 118.147 95.23 117.854 94.017L117.24 91.4742L113.519 92.375L113.33 91.5935ZM117.904 91.3132L118.55 93.9843L118.843 95.1974L119.588 95.6715L120.626 95.4202C121.664 95.1689 122.146 94.5583 121.841 93.2986L121.17 90.5225L117.904 91.3132Z" fill="#172338" />
                    <path d="M115.496 102.698C115.563 104.761 117.266 105.811 119.341 105.744C121.416 105.677 123.047 104.52 122.98 102.457C122.914 100.406 121.211 99.3683 119.137 99.4352C117.062 99.502 115.43 100.647 115.496 102.698ZM114.777 102.721C114.698 100.299 116.555 98.6779 119.109 98.5956C121.664 98.5133 123.622 100.011 123.7 102.434C123.779 104.868 121.923 106.501 119.368 106.583C116.813 106.666 114.855 105.156 114.777 102.721Z" fill="#172338" />
                    <path d="M114.048 110.664C114.377 108.821 115.47 107.749 117.408 108.096L123.172 109.129L123.03 109.92L117.337 108.9C115.778 108.621 114.99 109.345 114.727 110.822C114.476 112.228 114.953 113.24 116.513 113.519L122.206 114.539L122.065 115.331L116.3 114.298C114.34 113.947 113.721 112.495 114.048 110.664Z" fill="#172338" />
                    <path d="M113.004 115.243L121.001 118.351L119.783 121.495C119.445 122.368 118.973 122.854 118.361 123.106C117.842 123.316 117.26 123.322 116.601 123.065C115.124 122.491 114.653 121.317 115.303 119.639L116.192 117.345L112.713 115.993L113.004 115.243ZM116.829 117.592L115.962 119.83C115.459 121.128 115.866 121.905 116.873 122.296C117.902 122.696 118.711 122.302 119.158 121.149L120.051 118.844L116.829 117.592Z" fill="#172338" />
                    <path d="M110.87 126.343L111.419 126.731L109.647 129.24L109.098 128.852L110.87 126.343Z" fill="#172338" />
                    <path d="M102.79 131.337L108.354 137.869L107.742 138.391L104.777 134.911L104.22 141.399L103.426 142.077L103.89 137.089L97.6978 135.686L98.4278 135.062L103.952 136.31L104.139 134.162L102.178 131.86L102.79 131.337Z" fill="#172338" />
                    <path d="M96.7826 136.024L100.999 143.497L95.9223 146.368L95.5743 145.751L99.951 143.276L98.4356 140.59L94.4245 142.858L94.0825 142.252L98.0936 139.984L96.4484 137.068L91.9568 139.608L91.5912 138.96L96.7826 136.024Z" fill="#172338" />
                    <path d="M90.206 139.386L92.8679 147.543L92.0353 147.815L86.4139 143.315C85.8022 142.833 85.1648 142.234 85.1648 142.234L85.142 142.241L87.4501 149.314L86.7202 149.553L84.0583 141.396L84.8567 141.135L90.4444 145.57C91.0069 146.018 91.7503 146.671 91.7503 146.671L91.7731 146.663L89.4761 139.625L90.206 139.386Z" fill="#172338" />
                    <path d="M82.5062 141.53L83.4638 150.056L82.5933 150.154L77.9976 144.608C77.496 144.013 76.9929 143.296 76.9929 143.296L76.969 143.299L77.7994 150.693L77.0362 150.778L76.0786 142.252L76.9134 142.158L81.489 147.633C81.9495 148.185 82.5455 148.976 82.5455 148.976L82.5693 148.973L81.743 141.615L82.5062 141.53Z" fill="#172338" />
                    <path d="M74.4945 142.062L73.777 150.612L67.9656 150.122L68.0248 149.416L73.035 149.839L73.293 146.766L68.7013 146.378L68.7595 145.685L73.3512 146.072L73.6312 142.736L68.4894 142.302L68.5517 141.561L74.4945 142.062Z" fill="#172338" />
                    <path d="M66.2335 141.596L64.1814 141.003C62.2099 140.434 60.9751 141.514 60.3744 143.601C59.7737 145.689 60.1479 147.295 62.1194 147.865L64.2522 148.48L66.2335 141.596ZM67.2018 141.138L64.8289 149.384L61.9005 148.538C59.4679 147.836 58.8638 145.813 59.5674 143.368C60.2709 140.923 61.9215 139.614 64.3541 140.316L67.2018 141.138Z" fill="#172338" />
                    <path d="M57.9902 137.699L56.314 141.047L56.9156 146.76L56.122 146.362L55.6431 141.475L55.6217 141.465L51.4035 143.993L50.6314 143.605L55.5955 140.659L57.261 137.333L57.9902 137.699Z" fill="#172338" />
                    <path d="M48.0394 139.788L46.4934 140.534L45.7058 139.945L47.5207 139.4L48.0394 139.788Z" fill="#172338" />
                    <path d="M46.7326 128.753C48.2724 130.402 48.1057 132.087 46.9536 133.297L46.4048 132.709C47.4074 131.655 47.3314 130.378 46.2339 129.203C45.3738 128.282 44.2707 128.033 43.421 128.829C42.5363 129.657 42.8748 130.441 43.8565 132.038C44.7099 133.408 45.1212 134.552 44.0263 135.577C43.0277 136.512 41.5844 136.286 40.4131 135.031C39.1108 133.637 39.2089 132.23 40.1798 131.107L40.7122 131.677C39.9258 132.611 40.06 133.669 40.8955 134.563C41.7883 135.519 42.7843 135.672 43.4764 135.024C44.2209 134.327 43.9081 133.534 43.0699 132.215C42.1679 130.775 41.5238 129.487 42.8378 128.257C43.9502 127.215 45.504 127.437 46.7326 128.753Z" fill="#172338" />
                    <path d="M40.5067 119.211C41.6177 121.459 40.562 123.576 38.2607 124.715C35.9917 125.839 33.6171 125.395 32.4636 123.06C31.6821 121.479 31.92 119.901 33.341 118.849L33.7078 119.592C32.6741 120.398 32.5078 121.579 33.0873 122.751C34.0654 124.731 36.0282 124.884 37.8886 123.962C39.7812 123.025 40.7706 121.343 39.8669 119.514C38.9898 117.739 37.3864 117.583 36.053 118.243L35.7841 118.376L37.0068 120.85L36.3723 121.165L34.7988 117.98L38.7454 116.026L38.9952 116.531L37.8438 117.289L37.8597 117.321C38.6801 117.411 39.805 117.791 40.5067 119.211Z" fill="#172338" />
                    <path d="M38.5552 114.727L30.2455 116.863L29.2937 113.156C28.9088 111.656 29.548 110.575 30.931 110.219C31.9537 109.956 32.7412 110.225 33.288 111.1L33.3229 111.091C33.3926 110.156 33.9486 109.716 35.2237 109.326C36.5453 108.924 36.8435 108.686 36.9093 108.508L36.9558 108.497L37.1706 109.333C37.0906 109.552 36.7887 109.679 35.3887 110.114C33.9655 110.554 33.6871 111.159 33.9974 112.367L34.6479 114.901L38.3553 113.948L38.5552 114.727ZM33.9854 115.072L33.3021 112.41C32.9918 111.201 32.2409 110.737 31.2066 111.003C30.1723 111.269 29.6989 111.887 30.0212 113.142L30.7313 115.908L33.9854 115.072Z" fill="#172338" />
                    <path d="M36.2323 103.657C36.1371 101.596 34.42 100.57 32.3462 100.665C30.2724 100.761 28.6571 101.94 28.7523 104.002C28.8469 106.052 30.5635 107.066 32.6373 106.97C34.7111 106.875 36.3269 105.707 36.2323 103.657ZM36.9516 103.624C37.0633 106.046 35.2293 107.692 32.676 107.809C30.1227 107.927 28.1448 106.456 28.033 104.035C27.9207 101.602 29.7542 99.9436 32.3075 99.826C34.8608 99.7084 36.8392 101.191 36.9516 103.624Z" fill="#172338" />
                    <path d="M37.5776 95.6625C37.2744 97.5098 36.196 98.5969 34.2542 98.2769L28.4761 97.3247L28.6064 96.5313L34.3134 97.4718C35.8763 97.7294 36.6537 96.994 36.8967 95.5138C37.128 94.1047 36.6364 93.0993 35.0734 92.8418L29.3664 91.9013L29.4967 91.1079L35.2747 92.0601C37.2402 92.384 37.8789 93.8271 37.5776 95.6625Z" fill="#172338" />
                    <path d="M38.5598 91.054L30.5204 88.0564L31.6953 84.8957C32.0215 84.0183 32.4863 83.5257 33.0949 83.2659C33.611 83.0486 34.1922 83.0348 34.8556 83.2821C36.3398 83.8355 36.8274 85.0035 36.2002 86.6907L35.3431 88.9965L38.8399 90.3004L38.5598 91.054ZM34.7022 88.7575L35.5384 86.5079C36.0234 85.2032 35.6057 84.4327 34.5938 84.0554C33.5593 83.6697 32.7559 84.0745 32.3253 85.233L31.464 87.5501L34.7022 88.7575Z" fill="#172338" />
                    <path d="M40.5422 79.9264L39.9885 79.5456L41.7265 77.0124L42.2801 77.3933L40.5422 79.9264Z" fill="#172338" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M70.0396 84.4835C69.182 84.5585 68.5546 84.8555 68.1364 85.3762C67.7183 85.8968 67.5547 86.6777 67.6493 87.7586L68.7799 100.681L81.7732 86.9514C82.7286 85.8194 83.1992 85.0587 83.167 84.6915C83.1635 84.6507 83.1186 84.5929 83.0558 84.5573C82.993 84.5217 82.8333 84.5151 82.6161 84.5341L82.5447 83.718L87.5594 83.2793L87.6308 84.0953C85.9724 84.2404 84.0874 85.4333 81.92 87.7198L81.8805 87.7232L70.6703 99.6615L80.5803 108.107C82.6022 109.842 84.3621 111.312 85.8386 112.499C87.3169 113.706 88.5943 114.663 89.6331 115.395C90.6916 116.124 91.5528 116.645 92.2167 116.957C92.8986 117.247 93.4477 117.384 93.9018 117.344L93.9464 117.854L92.9001 117.946C92.1498 118.011 91.3261 117.919 90.4288 117.669C89.5316 117.418 88.5375 116.971 87.4071 116.329C86.2768 115.688 85.0083 114.833 83.6035 113.784C82.1988 112.735 80.5949 111.457 78.8134 109.968L68.8504 101.488L69.9401 113.942C70.0241 114.903 70.2981 115.626 70.7446 116.151C71.1893 116.657 71.7577 116.89 72.427 116.831L72.8663 116.793L72.9329 117.553L64.9633 118.251L64.8967 117.49C65.7544 117.415 66.3818 117.118 66.7773 116.579C67.1745 116.06 67.3363 115.259 67.2417 114.178L64.9509 87.9947C64.8704 87.0739 64.5964 86.3515 64.1499 85.8258C63.7052 85.3201 63.1368 85.0874 62.4675 85.146L62.0701 85.1807L62 84.38L69.9696 83.6828L70.0396 84.4835Z" fill="#172338" />
                  </g>
                  <defs>
                    <clipPath id="clip0_concierge_logo">
                      <rect width="416" height="94" fill="white" transform="translate(25.0039 60.1656) rotate(-5)" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            ) : null}
          </div>
          </div>

          {/* Título + card de precio (mismo lenguaje visual que Plan your trip en villa details) */}
          <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <h1 className="text-2xl md:text-4xl font-light font-gtsuper-ds mt-2 md:mt-0 text-[#172338]">
                  {service.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 md:gap-6" data-pdf-exclude-canvas="true">
                  {!agentPortfolioUnbrandedUi ? (
                  <button
                    type="button"
                    className="flex items-center gap-2 font-haas font-light text-[#172338] hover:text-[#28F6EA] transition-colors disabled:opacity-60"
                    aria-pressed={service?.id ? isServiceLiked(service.id) : false}
                    disabled={!service?.id || pendingServiceIds.has(String(service.id))}
                    onClick={() => {
                      if (!isAuthenticated) {
                        router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
                        return
                      }
                      if (service?.id) void toggleServiceFavorite(String(service.id))
                    }}
                  >
                    <GoHeart
                      size={22}
                      className={service?.id && isServiceLiked(service.id) ? 'text-[#ef4444]' : undefined}
                    />
                    <span>{service?.id && isServiceLiked(service.id) ? 'Saved' : 'Save'}</span>
                  </button>
                  ) : null}
                  <button
                    type="button"
                    className="flex items-center gap-2 font-haas font-light text-[#172338] hover:text-[#28F6EA] transition-colors"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: service.name,
                          url: window.location.href,
                        }).catch(() => {})
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                        alert('Link copied to clipboard!')
                      }
                    }}
                  >
                    <BsShare size={20} />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Descripción — rich text si viene del editor, plain text con truncate si es texto plano */}
              <div className="w-full">
                {service?.description ? (
                  /<[a-z][\s\S]*>/i.test(service.description) ? (
                    <div
                      className="concierge-rich-text tracking-tight font-haas text-sm md:text-base text-[#172338]"
                      dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(service.description) }}
                    />
                  ) : (firstParagraph || secondParagraph) ? (
                    <p className="tracking-tight font-haas text-sm md:text-base text-[#172338]">
                      <TruncateText
                        text={[firstParagraph, secondParagraph].filter(Boolean).join(' ')}
                        maxSentences={5}
                        className="text-[#172338]"
                        twoParagraphsWhenExpanded
                      />
                    </p>
                  ) : null
                ) : null}
              </div>

              {!service.price && !agentPortfolioUnbrandedUi ? (
                <div className="mt-2 md:mt-0 pdf-exclude-from-capture">
                  <Button
                    className="w-full md:w-48 h-[48px] md:h-[52px] bg-[#28F6EA] px-5 font-normal text-soft-gray-dark rounded-none flex items-center justify-center gap-2"
                    onClick={openRequestQuote}
                  >
                    Speak with an Agent
                    <ChevronRight className="ml-1" />
                  </Button>
                </div>
              ) : null}
            </div>

            {service.price ? (
              <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-white border border-[#c8cdd4] px-6 py-6 lg:px-8 lg:py-7 flex flex-col gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-px w-5 bg-[#D99330] shrink-0" aria-hidden="true" />
                    <p className="font-haas font-light text-[11px] tracking-[0.22em] uppercase text-[#506A70]">
                      Price
                    </p>
                  </div>
                  <p className="font-gtsuper-ds font-light text-[clamp(1.2rem,2vw,1.5rem)] leading-[1.2] tracking-[-0.01em] text-[#172338]">
                    {service.price}
                  </p>
                </div>
                {!agentPortfolioUnbrandedUi ? (
                  <div className="pt-1 border-t border-[#E2E8EB] pdf-exclude-from-capture">
                    <Button
                      className="w-full mt-5 h-[48px] md:h-[52px] bg-[#28F6EA] px-5 font-normal text-soft-gray-dark rounded-none flex items-center justify-center gap-2"
                      onClick={openRequestQuote}
                    >
                      Speak with an Agent
                      <ChevronRight className="ml-1" />
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {/* Secciones Destacadas - Diseño Collage */}
        {service.highlightedSections && service.highlightedSections.length > 0 && (
          <section className="w-full" data-pdf-export-block="true">
            {/* Mobile: stack vertical */}
            <div className="md:hidden flex flex-col gap-8 pt-[40px] pb-[60px] px-4">
              {service.highlightedSections.slice(0, 3).map((section, index) => (
                <div key={index} className="flex flex-col gap-3">
                  {section.image && (
                    <div className="w-full h-[220px] overflow-hidden">
                      <img
                        src={wsrvUrl(section.image || galleryFallback, { w: 900, h: 500, q: 100, position: section.imagePosition })}
                        alt={section.title || `Section ${index + 1}`}
                        className="w-full h-full object-cover block"
                        style={positionStyle(section.imagePosition)}
                        onError={(e) => { (e.target as HTMLImageElement).src = galleryFallback }}
                      />
                    </div>
                  )}
                  {section.title && (
                    <h3 className={`font-gtsuper-ds font-normal text-[18px] leading-[20px] uppercase mb-[6px] m-0 ${index === 2 ? 'text-[#D99330]' : 'text-[#506A70]'}`}>
                      {section.title}
                    </h3>
                  )}
                  {section.description && (
                    <TwoParagraphText
                      text={section.description}
                      className="font-haas font-normal text-[14px] leading-[140%] tracking-[0.02em] text-[#172338] m-0"
                      paragraphClassName="m-0 mb-2 last:mb-0"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: collage */}
            <div className="hidden md:flex justify-center pt-[70px] pb-[120px] px-6">
              <div className="w-full max-w-[1400px] relative min-h-[560px]">
                {/* .aerial - Sección 1 */}
                {service.highlightedSections[0]?.image && (
                  <div className="absolute left-0 top-0 w-[calc(39%-60px)] h-[276px] overflow-hidden">
                    <img
                      src={wsrvUrl(service.highlightedSections[0].image || galleryFallback, { w: 1200, h: 680, q: 100, position: service.highlightedSections[0].imagePosition })}
                      alt={service.highlightedSections[0].title || 'Section 1'}
                      className="w-full h-full object-cover block"
                      style={positionStyle(service.highlightedSections[0].imagePosition)}
                      onError={(e) => { (e.target as HTMLImageElement).src = galleryFallback }}
                    />
                  </div>
                )}
                {/* .left-card - Texto sección 1 */}
                {service.highlightedSections[0] && (
                  <div className="absolute left-0 top-[296px] w-[30%] text-left pr-6">
                    {service.highlightedSections[0].title && (
                      <h3 className="font-gtsuper-ds font-normal text-[18px] leading-[20px] uppercase text-[#506A70] mb-[10px] m-0">
                        {service.highlightedSections[0].title}
                      </h3>
                    )}
                    {service.highlightedSections[0].description && (
                      <TwoParagraphText
                        text={service.highlightedSections[0].description}
                        className="font-haas font-normal text-[14px] leading-[140%] tracking-[0.02em] text-[#172338] m-0"
                        paragraphClassName="m-0 mb-2 last:mb-0"
                      />
                    )}
                  </div>
                )}
                {/* .center - Sección 2 */}
                {service.highlightedSections[1]?.image && (
                  <div className="absolute left-[calc(28%+40px)] top-[200px] w-[35%] h-[234px] z-[2] overflow-hidden">
                    <img
                      src={wsrvUrl(service.highlightedSections[1].image || galleryFallback, { w: 1200, h: 640, q: 100, position: service.highlightedSections[1].imagePosition })}
                      alt={service.highlightedSections[1].title || 'Section 2'}
                      className="w-full h-full object-cover block"
                      style={positionStyle(service.highlightedSections[1].imagePosition)}
                      onError={(e) => { (e.target as HTMLImageElement).src = galleryFallback }}
                    />
                  </div>
                )}
                {/* .center-text - Texto sección 2 */}
                {service.highlightedSections[1] && (
                  <div className="absolute left-[calc(28%+40px)] top-[454px] w-[35%] text-left pr-2">
                    {service.highlightedSections[1].title && (
                      <h3 className="font-gtsuper-ds font-normal text-[18px] leading-[20px] uppercase text-[#506A70] mb-[10px] m-0">
                        {service.highlightedSections[1].title}
                      </h3>
                    )}
                    {service.highlightedSections[1].description && (
                      <TwoParagraphText
                        text={service.highlightedSections[1].description}
                        className="font-haas font-normal text-[14px] leading-[140%] tracking-[0.02em] text-[#172338] m-0"
                        paragraphClassName="m-0 mb-2 last:mb-0"
                      />
                    )}
                  </div>
                )}
                {/* .right-block - Sección 3 */}
                {service.highlightedSections[2] && (
                  <div className="absolute right-0 top-0 w-[36%] flex flex-col items-start">
                    {service.highlightedSections[2].image && (
                      <div className="w-full h-[170px] mb-3 overflow-hidden">
                        <img
                          src={wsrvUrl(service.highlightedSections[2].image || galleryFallback, { w: 900, h: 520, q: 100, position: service.highlightedSections[2].imagePosition })}
                          alt={service.highlightedSections[2].title || 'Section 3'}
                          className="w-full h-full object-cover block"
                          style={positionStyle(service.highlightedSections[2].imagePosition)}
                          onError={(e) => { (e.target as HTMLImageElement).src = galleryFallback }}
                        />
                      </div>
                    )}
                    <div className="text-left" style={{ paddingLeft: '50px', width: 'calc(100% - 40px)' }}>
                      {service.highlightedSections[2].title && (
                        <h3 className="font-gtsuper-ds font-normal text-[18px] leading-[20px] uppercase text-[#D99330] mb-[10px] m-0">
                          {service.highlightedSections[2].title}
                        </h3>
                      )}
                      {service.highlightedSections[2].description && (
                        <TwoParagraphText
                          text={service.highlightedSections[2].description}
                          className="font-haas font-normal text-[14px] leading-[140%] tracking-[0.02em] text-[#172338] m-0"
                          paragraphClassName="m-0 mb-2 last:mb-0"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Key Features - Para todos los servicios de concierge */}
        {(() => {
          const filteredSpecs = service.specifications
            ? Object.entries(service.specifications)
            : []
          const brochureSpec = filteredSpecs.find(([, value]) =>
            typeof value === 'object' && value !== null && ((value as any).__isBrochure)
          )
          const hasKeyFeatures = service.keyFeatures && Array.isArray(service.keyFeatures) && service.keyFeatures.length > 0

          if (!hasKeyFeatures && !brochureSpec) return null

          const isHtmlContent = hasKeyFeatures && service.keyFeatures?.some((f: string) => f?.trim().startsWith('<'))

          return (
            <section
              className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#F5F5F5] py-8 md:py-10"
              data-pdf-export-block="true"
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-10 lg:px-20">
                <h2 className="font-gtsuper-ds font-normal text-[28px] md:text-[36px] leading-[1.1] tracking-[-0.01em] text-[#172338] mb-6 md:mb-8">
                  Key Features
                </h2>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                  <div className="flex-1">
                    {isHtmlContent ? (
                      <div>
                        {service.keyFeatures?.map((feature: string, index: number) => {
                          if (!feature?.trim()) return null
                          return (
                            <div
                              key={`keyfeature-${index}`}
                              className="font-haas font-light text-[15px] leading-[1.5] text-[#506A70] [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol_li]:mb-1 [&_strong]:font-medium [&_em]:italic [&_u]:underline"
                              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(feature) }}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <div className="columns-1 md:columns-3 gap-x-12">
                        {service.keyFeatures && Array.isArray(service.keyFeatures) && service.keyFeatures.map((feature: string, index: number) => {
                          if (!feature || feature.trim() === '') return null
                          return (
                            <div key={`keyfeature-${index}`} className="flex items-start gap-2 mb-3 break-inside-avoid">
                              <span className="text-[#506A70] font-haas text-[15px] leading-[1.5] flex-shrink-0">•</span>
                              <span className="font-haas font-light text-[15px] leading-[1.5] text-[#506A70]">
                                {feature}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    
                    {/* Solo brochure en website; Visit Website solo en Loggia */}
                    {(() => {
                      if (!brochureSpec) return null
                      const brochureValue = brochureSpec[1] as any
                      const brochureUrl = resolveMediaUrl(brochureValue?.url)
                      if (!brochureUrl) return null
                      const brochureName =
                        (typeof brochureValue?.name === "string" && brochureValue.name.trim()) ||
                        `${service.name || "Service"} Brochure`
                      const downloadName = buildBrochureDownloadName(brochureUrl, brochureName)
                      return (
                        <div className="flex items-center gap-3 mt-6 pdf-exclude-from-capture">
                          <a
                            href={brochureUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={downloadName}
                            className="font-haas font-normal text-[15px] leading-[1.5] underline"
                            style={{ color: 'rgb(217 147 48)' }}
                          >
                            Download Brochure
                          </a>
                        </div>
                      )
                    })()}
                  </div>
                  {!agentPortfolioUnbrandedUi ? (
                    <div className="flex md:items-end md:self-end pdf-exclude-from-capture">
                      <Button
                        className="w-full md:w-auto h-[48px] flex items-center justify-center gap-2 bg-[#28F6EA] hover:bg-[#28F6EA]/90 px-6 font-haas font-normal text-[15px] text-[#172338] rounded-none"
                        onClick={openRequestQuote}
                      >
                        Speak with an Agent
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          )
        })()}

        {/* Características y Facilidades */}
        {service.features && 
          (Array.isArray(service.features) ? service.features.length > 0 : Object.keys(service.features).length > 0) && (
          <section className="flex flex-col gap-4 md:gap-6 border-t border-[#506A70]/20 pt-6 md:pt-8">
            <h2 className="text-2xl md:text-3xl font-light font-gtsuper-ds text-[#172338]">
              Features & Facilities
            </h2>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {Array.isArray(service.features) ? (
                service.features.map((feature, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-[#28F6EA]/10 border border-[#28F6EA]/30 rounded font-haas text-sm text-[#172338]"
                  >
                    {String(feature)}
                  </div>
                ))
              ) : (
                Object.entries(service.features).map(([feature, enabled]) => {
                  if (!enabled) return null
                  const displayValue = enabled === true ? feature : `${feature} → ${String(enabled)}`
                  return (
                    <div
                      key={feature}
                      className="px-4 py-2 bg-[#28F6EA]/10 border border-[#28F6EA]/30 rounded font-haas text-sm text-[#172338]"
                    >
                      {displayValue}
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )}

        {/* Modal de imagen individual (zoom) */}
        <ImageGalleryModal
          images={galleryImages}
          initialIndex={galleryModalIndex}
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          propertyTitle={service.name}
          offerBackHref={offerBackHref}
        />

        {/* Modal de grilla de imágenes (abre con +X photos o con las imágenes superiores) */}
        <ImageGalleryGridModal
          images={galleryImages}
          imagePositions={galleryImagePositions}
          isOpen={isGalleryGridModalOpen}
          onClose={() => setIsGalleryGridModalOpen(false)}
          offerBackHref={offerBackHref}
          onImageClick={(index) => {
            setIsGalleryGridModalOpen(false);
            setGalleryModalIndex(index);
            setIsGalleryModalOpen(true);
          }}
          propertyTitle={service.name}
        />

      </div>
      </div>
      {!hideMarketingChrome ? <Footer disableTravelSection={true} /> : null}
    </>
  )
}
