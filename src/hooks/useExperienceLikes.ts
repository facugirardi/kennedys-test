'use client'

import { useAuth } from '@/src/contexts/AuthContext'
import { useLoginModal } from '@/src/contexts/LoginContext'
import { useCallback, useEffect, useState } from 'react'
import { getUserExperienceLikes, toggleExperienceLike } from '@/lib/api/experienceLikes'

const normId = (id: string | number | undefined | null) => (id == null || id === '' ? '' : String(id))

interface UseExperienceLikesResult {
  likedIds: Set<string>
  isLiked: (experienceId?: string | null) => boolean
  toggleFavorite: (experienceId: string) => Promise<boolean>
  loading: boolean
  error: string | null
  clearError: () => void
  pendingIds: Set<string>
}

export function useExperienceLikes(): UseExperienceLikesResult {
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
        const response = await getUserExperienceLikes(user.id)
        if (!isMounted) return

        if (response && (response as { success?: boolean }).success === false) {
          setError(
            (response as { message?: string }).message ||
              'Unable to load your favourites right now.',
          )
          setLikedIds(new Set())
          return
        }

        const experiences = Array.isArray(response?.data?.experiences)
          ? response.data.experiences
          : []

        const ids = new Set<string>()
        experiences.forEach((row: any) => {
          const eid = normId(row?.id)
          if (eid) ids.add(eid)
        })

        setLikedIds(ids)
      } catch (err) {
        console.error('Failed to load experience likes', err)
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
    (experienceId?: string | null) => {
      const id = normId(experienceId)
      if (!id) return false
      return likedIds.has(id)
    },
    [likedIds],
  )

  const toggleFavorite = useCallback(
    async (experienceId: string) => {
      const eid = normId(experienceId)
      if (!eid) {
        return false
      }

      if (!user?.id || !isAuthenticated) {
        openLoginModal()
        return false
      }

      setPendingIds((prev) => {
        const next = new Set(prev)
        next.add(eid)
        return next
      })

      try {
        const response = await toggleExperienceLike({ userId: user.id, experienceId: eid })
        if (!response || (response as { success?: boolean }).success === false) {
          setError(
            (response as { message?: string })?.message ||
              'We could not update your favourites. Please try again later.',
          )
          return likedIds.has(eid)
        }
        const isNowLiked = Boolean(response?.data?.isLiked)

        setLikedIds((prev) => {
          const next = new Set(prev)
          if (isNowLiked) {
            next.add(eid)
          } else {
            next.delete(eid)
          }
          return next
        })

        setError(null)
        return isNowLiked
      } catch (err) {
        console.error('Failed to toggle favourite', err)
        setError('We could not update your favourites. Please try again later.')
        return likedIds.has(eid)
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev)
          next.delete(eid)
          return next
        })
      }
    },
    [user?.id, isAuthenticated, likedIds, openLoginModal],
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

export default useExperienceLikes
