'use client'

import { useAuth } from '@/src/contexts/AuthContext'
import { useLoginModal } from '@/src/contexts/LoginContext'
import { useCallback, useEffect, useState } from 'react'
import { getUserServiceLikes, toggleServiceLike as toggleServiceLikeApi } from '@/lib/api/serviceLikes'

const normId = (id: string | number | undefined | null) => (id == null || id === '' ? '' : String(id))

interface UseServiceLikesResult {
  likedIds: Set<string>
  isLiked: (serviceId?: string | null) => boolean
  toggleFavorite: (serviceId: string) => Promise<boolean>
  loading: boolean
  error: string | null
  clearError: () => void
  pendingIds: Set<string>
}

export const useServiceLikes = (): UseServiceLikesResult => {
  const { user, isAuthenticated } = useAuth()
  const { openLoginModal } = useLoginModal()
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let isMounted = true

    const loadLikes = async () => {
      if (!user?.id || !isAuthenticated) {
        setLikedIds(new Set())
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await getUserServiceLikes(user.id)
        if (!isMounted) return

        if (response && (response as { success?: boolean }).success === false) {
          setError(
            (response as { message?: string }).message || 'Unable to load your favourites right now.',
          )
          setLikedIds(new Set())
          return
        }

        const services = Array.isArray(response?.data?.services) ? response.data.services : []

        const ids = new Set<string>()
        services.forEach((service: { id?: string | number }) => {
          const sid = normId(service?.id)
          if (sid) ids.add(sid)
        })

        setLikedIds(ids)
      } catch (err) {
        console.error('Failed to load concierge service likes', err)
        if (isMounted) {
          setError('Unable to load your favourites right now.')
          setLikedIds(new Set())
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadLikes()

    return () => {
      isMounted = false
    }
  }, [user?.id, isAuthenticated])

  const isLiked = useCallback(
    (serviceId?: string | null) => {
      const sid = normId(serviceId)
      if (!sid) return false
      return likedIds.has(sid)
    },
    [likedIds]
  )

  const toggleFavorite = useCallback(
    async (serviceId: string) => {
      const sid = normId(serviceId)
      if (!sid) {
        return false
      }

      if (!user?.id || !isAuthenticated) {
        openLoginModal()
        return false
      }

      setPendingIds((prev) => {
        const next = new Set(prev)
        next.add(sid)
        return next
      })

      try {
        const response = await toggleServiceLikeApi({ userId: user.id, serviceId: sid })
        if (!response || (response as { success?: boolean }).success === false) {
          setError(
            (response as { message?: string })?.message ||
              'We could not update your favourites. Please try again later.',
          )
          return likedIds.has(sid)
        }
        const isNowLiked = Boolean(response?.data?.isLiked)

        setLikedIds((prev) => {
          const next = new Set(prev)
          if (isNowLiked) {
            next.add(sid)
          } else {
            next.delete(sid)
          }
          return next
        })

        setError(null)
        return isNowLiked
      } catch (err) {
        console.error('Failed to toggle concierge favourite', err)
        setError('We could not update your favourites. Please try again later.')
        return likedIds.has(sid)
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(sid)
          return next
        })
      }
    },
    [user?.id, isAuthenticated, likedIds]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    likedIds,
    isLiked,
    toggleFavorite,
    loading,
    error,
    clearError,
    pendingIds,
  }
}

export default useServiceLikes
