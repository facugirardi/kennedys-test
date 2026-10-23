import { useCallback, useEffect, useRef, useState } from 'react'

const MOBILE_MAX_WIDTH = 767
const COLLAPSE_AFTER_PX = 350
const EXPAND_BEFORE_PX = 250
const EXPAND_ON_SCROLL_UP_PX = 60
const LOCK_MS = 700
const REARM_DISTANCE_PX = 120

/**
 * Mobile-only: collapses a sticky bar after a long scroll down; it reappears on a short scroll up or near the top, and can be toggled manually.
 * After a manual open, it won't collapse again until the user scrolls a bit further down.
 */
export function useCollapseOnScroll() {
  const [collapsed, setCollapsed] = useState(false)
  const lastY = useRef(0)
  const openedAtY = useRef<number | null>(null)
  const lockUntil = useRef(0)
  const upDistance = useRef(0)
  const collapsedRef = useRef(false)

  const apply = useCallback((next: boolean, lock = true) => {
    if (collapsedRef.current === next) return
    collapsedRef.current = next
    // The bar's height change shifts the page and fires scroll events of its own; ignore them so it can't flip back and forth.
    if (lock) lockUntil.current = Date.now() + LOCK_MS
    setCollapsed(next)
  }, [])

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      if (Date.now() < lockUntil.current) {
        lastY.current = y
        upDistance.current = 0
        return
      }
      const delta = y - lastY.current
      const goingDown = delta > 0
      lastY.current = y
      if (window.innerWidth > MOBILE_MAX_WIDTH) return
      // Reveal early: near the top, or after a short scroll up.
      upDistance.current = goingDown ? 0 : upDistance.current - delta
      if (y < EXPAND_BEFORE_PX || upDistance.current >= EXPAND_ON_SCROLL_UP_PX) {
        // Re-arm only after a real scroll down from here, so jitter can't flip it right back.
        openedAtY.current = y < EXPAND_BEFORE_PX ? null : y
        apply(false)
        return
      }
      if (!goingDown || y < COLLAPSE_AFTER_PX) return
      if (openedAtY.current !== null && y - openedAtY.current < REARM_DISTANCE_PX) return
      openedAtY.current = null
      upDistance.current = 0
      apply(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [apply])

  const toggle = useCallback(() => {
    // Ignore scroll events caused by the height change itself (layout shift / scroll anchoring).
    openedAtY.current = window.scrollY
    upDistance.current = 0
    apply(!collapsedRef.current)
  }, [apply])

  return { collapsed, toggle }
}
