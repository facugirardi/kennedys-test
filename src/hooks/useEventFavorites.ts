'use client'

import { useAuth } from '@/src/contexts/AuthContext'
import { useLoginModal } from '@/src/contexts/LoginContext'
import { useCallback, useEffect, useState } from 'react'

export type EventFavoriteEntry = {
  id: string
  name: string
  image: string
}

const storageKey = (userId: string) => `kennedys_web_event_favorites_${userId}`

function readEntries(userId: string): EventFavoriteEntry[] {
  if (typeof window === 'undefined' || !userId) return []
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((x: any) => x && x.id != null)
      .map((x: any) => ({
        id: String(x.id),
        name: typeof x.name === 'string' ? x.name : '',
        image: typeof x.image === 'string' ? x.image : '',
      }))
  } catch {
    return []
  }
}

function writeEntries(userId: string, entries: EventFavoriteEntry[]) {
  if (typeof window === 'undefined' || !userId) return
  localStorage.setItem(storageKey(userId), JSON.stringify(entries))
}

/** For profile page merge (client-only). */
export function getEventFavoriteEntriesForUser(userId: string | undefined | null): EventFavoriteEntry[] {
  if (!userId) return []
  return readEntries(String(userId))
}

export function removeEventFavoriteEntry(userId: string | undefined | null, eventId: string) {
  if (!userId) return
  const uid = String(userId)
  const id = String(eventId)
  writeEntries(
    uid,
    readEntries(uid).filter((e) => e.id !== id),
  )
}

export function useEventFavorites() {
  const { user, isAuthenticated } = useAuth()
  const { openLoginModal } = useLoginModal()
  const [entries, setEntries] = useState<EventFavoriteEntry[]>([])

  useEffect(() => {
    if (!user?.id || !isAuthenticated) {
      setEntries([])
      return
    }
    setEntries(readEntries(String(user.id)))
  }, [user?.id, isAuthenticated])

  const isLiked = useCallback(
    (eventId?: string | null) => {
      if (!eventId) return false
      return entries.some((e) => e.id === String(eventId))
    },
    [entries],
  )

  const toggleFavorite = useCallback(
    (payload: { id: string; name: string; image: string }) => {
      if (!user?.id || !isAuthenticated) {
        openLoginModal()
        return false
      }
      const uid = String(user.id)
      const id = String(payload.id)
      const list = readEntries(uid)
      const idx = list.findIndex((e) => e.id === id)
      let next: EventFavoriteEntry[]
      let nowLiked: boolean
      if (idx >= 0) {
        next = list.filter((e) => e.id !== id)
        nowLiked = false
      } else {
        next = [
          ...list,
          {
            id,
            name: payload.name || '',
            image: payload.image || '',
          },
        ]
        nowLiked = true
      }
      writeEntries(uid, next)
      setEntries(next)
      return nowLiked
    },
    [user?.id, isAuthenticated, openLoginModal],
  )

  return { entries, isLiked, toggleFavorite }
}
