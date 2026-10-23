'use client';

import { useAuth } from '@/src/contexts/AuthContext'
import { useLoginModal } from '@/src/contexts/LoginContext'
import { useCallback, useEffect, useState } from 'react'
import { getUserPropertyLikes, togglePropertyLike } from '@/lib/api/propertyLikes'

const normId = (id: string | number | undefined | null) => (id == null || id === '' ? '' : String(id))

interface UsePropertyLikesResult {
  likedIds: Set<string>
  isLiked: (propertyId?: string | null) => boolean
  toggleFavorite: (propertyId: string) => Promise<boolean>
  loading: boolean
  error: string | null
  clearError: () => void
  pendingIds: Set<string>
}

export const usePropertyLikes = (): UsePropertyLikesResult => {
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
        const response = await getUserPropertyLikes(user.id)
        if (!isMounted) return

        if (response && (response as { success?: boolean }).success === false) {
          setError(
            (response as { message?: string }).message || 'Unable to load your favourites right now.',
          )
          setLikedIds(new Set())
          return
        }

        const properties = Array.isArray(response?.data?.properties) ? response.data.properties : []

        const ids = new Set<string>()
        properties.forEach((property: any) => {
          const pid = normId(property?.id)
          if (pid) ids.add(pid)
        })

        setLikedIds(ids)
      } catch (err) {
        console.error('Failed to load property likes', err)
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
    (propertyId?: string | null) => {
      const pid = normId(propertyId)
      if (!pid) return false
      return likedIds.has(pid)
    },
    [likedIds]
  )

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      const pid = normId(propertyId)
      if (!pid) {
        return false
      }

      if (!user?.id || !isAuthenticated) {
        openLoginModal()
        return false
      }

      setPendingIds((prev) => {
        const next = new Set(prev)
        next.add(pid)
        return next
      })

      try {
        const response = await togglePropertyLike({ userId: user.id, propertyId: pid })
        if (!response || (response as { success?: boolean }).success === false) {
          setError(
            (response as { message?: string })?.message ||
              'We could not update your favourites. Please try again later.',
          )
          return likedIds.has(pid)
        }
        const isNowLiked = Boolean(response?.data?.isLiked)

        setLikedIds((prev) => {
          const next = new Set(prev)
          if (isNowLiked) {
            next.add(pid)
          } else {
            next.delete(pid)
          }
          return next
        })

        setError(null)
        return isNowLiked
      } catch (err) {
        console.error('Failed to toggle favourite', err)
        setError('We could not update your favourites. Please try again later.')
        return likedIds.has(pid)
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(pid)
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

export default usePropertyLikes
