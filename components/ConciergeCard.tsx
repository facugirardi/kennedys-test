import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ChevronRight } from 'lucide-react'
import { wsrvUrl } from '@/lib/utils'
import { useAuth } from '@/src/contexts/AuthContext'
import { useServiceLikes } from '@/src/hooks/useServiceLikes'

const MAX_DESCRIPTION_LENGTH = 600

/** Trunca el texto en el espacio más cercano a maxLength, sin cortar palabras. */
function truncateAtSpace(text: string, maxLength: number): { text: string; truncated: boolean } {
  if (!text || text.length <= maxLength) return { text: text || '', truncated: false }
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  const end = lastSpace > 0 ? lastSpace : maxLength
  return { text: text.slice(0, end).trim(), truncated: true }
}

interface Props {
  image: string
  title: string
  description: string
  /** Free-text price entered by the admin (e.g. "€500 / day"); shown on the card when present. */
  price?: string | null
  simple?: boolean
  simpleWithDescription?: boolean
  serviceId?: string
  serviceType?: string
  /** URL del detalle basada en breadcrumb (ej: /concierge/athens/helicopter/airbus-as365). Si se pasa, tiene prioridad sobre serviceId. */
  detailPath?: string
  /** Mostrar botón de favoritos (mismo patrón que villas list). Requiere serviceId. */
  showFavorite?: boolean
  /** Tras `toggleFavorite` (p. ej. perfil "My Favorites" para quitar la fila si queda en false). */
  onServiceLikeChange?: (liked: boolean) => void
  /**
   * Perfil / contenedor externo: sin borde ni fondo propios; hero a ancho completo y cuerporate `p-6`
   * (misma lectura que cards de favoritos).
   */
  embedded?: boolean
  /** Solo perfil favoritos: ir al detalle al hacer clic en la card (corazón sigue aparte). */
  wholeCardNavigates?: boolean
  /** Abrir el detalle en una pestaña nueva en vez de navegar en la misma (ej: concierge list). */
  openInNewTab?: boolean
}

export const ConciergeCard = ({
  image,
  title,
  description,
  price,
  simple = false,
  simpleWithDescription = false,
  serviceId,
  serviceType,
  detailPath,
  showFavorite = true,
  onServiceLikeChange,
  embedded = false,
  wholeCardNavigates = false,
  openInNewTab = false,
}: Props) => {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { isLiked, toggleFavorite, pendingIds } = useServiceLikes()

  const handleViewMore = () => {
    const path = serviceId
      ? `/concierge/${serviceId}${serviceType ? `?type=${encodeURIComponent(serviceType)}` : ''}`
      : detailPath
    if (!path) return
    if (openInNewTab) {
      window.open(path, '_blank', 'noopener,noreferrer')
      return
    }
    router.push(path)
  }

  const canNavigate = Boolean(detailPath || serviceId)
  const showDescription = (!simple || simpleWithDescription) && description
  const { text: displayDescription, truncated } = truncateAtSpace(description || '', MAX_DESCRIPTION_LENGTH)
  const favoriteVisible = Boolean(showFavorite && serviceId)
  const liked = Boolean(serviceId && isLiked(serviceId))

  const coverSrc = useMemo(() => {
    const raw = (image || '').trim()
    // Relación 5:3 (≈ ancho real de la card en el grid × alto h-60) y 2x para retina,
    // así wsrv recorta una sola vez y de forma coherente con la caja de display.
    return wsrvUrl(raw || '/images/outdoor-image.png', { w: 900, h: 540, q: 100 })
  }, [image])

  const imageBlock = (
    <div className="relative w-full h-60 shrink-0 overflow-hidden">
      <img src={coverSrc} className="w-full h-full object-cover" alt={title} />
      {favoriteVisible ? (
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              className={`bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition disabled:opacity-70 ${
                liked ? 'bg-white' : ''
              }`}
              onClick={async (e) => {
                e.stopPropagation()
                if (!serviceId) return
                if (!isAuthenticated) {
                  router.push('/login?returnTo=' + encodeURIComponent(router.asPath))
                  return
                }
                const next = await toggleFavorite(serviceId)
                onServiceLikeChange?.(next)
              }}
              disabled={!serviceId || pendingIds.has(serviceId)}
              aria-pressed={liked}
              aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path
                  d="M9.465 15.6077C9.21 15.6977 8.79 15.6977 8.535 15.6077C6.36 14.8652 1.5 11.7677 1.5 6.5177C1.5 4.2002 3.3675 2.3252 5.67 2.3252C7.035 2.3252 8.2425 2.9852 9 4.0052C9.7575 2.9852 10.9725 2.3252 12.33 2.3252C14.6325 2.3252 16.5 4.2002 16.5 6.5177C16.5 11.7677 11.64 14.8652 9.465 15.6077Z"
                  stroke={liked ? '#ef4444' : '#506A70'}
                  fill={liked ? '#ef4444' : 'none'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        ) : null}
    </div>
  )

  const body = (
    <>
      <span
        className={`font-gtsuper-ds font-light ${
          embedded ? 'font-haas text-2xl text-[#506A70]' : 'text-lg md:text-xl'
        }`}
      >
        {title}
      </span>
      {embedded && wholeCardNavigates && serviceType?.trim() ? (
        <span className="font-haas text-sm font-medium tracking-wide text-[#B17520]">{serviceType.trim()}</span>
      ) : null}
      {showDescription && (
        <p className="font-haas text-sm text-[#506A70]">
          {displayDescription}
          {truncated && '...'}
        </p>
      )}
      {price ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (canNavigate) handleViewMore()
          }}
          className={`flex w-full items-end justify-between gap-3 text-left ${
            canNavigate ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-haas font-light text-[10px] uppercase tracking-[0.18em] text-[#8A9BA0]">
              Price
            </span>
            <span className="font-gtsuper-ds font-light text-base text-[#172338] leading-snug">
              {price}
            </span>
          </div>
          {canNavigate ? (
            <ChevronRight className="w-4 h-4 shrink-0 text-[#8A9BA0] mb-0.5" />
          ) : null}
        </button>
      ) : null}
      {embedded && wholeCardNavigates && canNavigate ? (
        <div className="mt-auto flex items-center gap-1 border-t border-[#E9E9E9] pt-4 font-haas text-sm text-[#506A70]">
          <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-primary underline decoration-primary/40 underline-offset-4">View details</span>
        </div>
      ) : null}
      {canNavigate && !(embedded && wholeCardNavigates) && !price && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleViewMore()
          }}
          className="text-left text-primary underline text-sm hover:text-primary/80 font-haas"
        >
          View More
        </button>
      )}
    </>
  )

  if (embedded) {
    const cardNavigates = Boolean(wholeCardNavigates && canNavigate)
    return (
      <div
        className={`flex min-h-0 w-full flex-1 flex-col${cardNavigates ? ' cursor-pointer' : ''}`}
        onClick={cardNavigates ? () => handleViewMore() : undefined}
        role={cardNavigates ? 'link' : undefined}
        tabIndex={cardNavigates ? 0 : undefined}
        onKeyDown={
          cardNavigates
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleViewMore()
                }
              }
            : undefined
        }
      >
        {imageBlock}
        <div className="flex flex-1 flex-col gap-4 p-6 text-left">{body}</div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-5 border bg-white p-5 text-left">
      {imageBlock}
      {body}
    </div>
  )
}
