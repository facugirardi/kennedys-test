'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Wraps a horizontally-scrollable report table and shows left/right chevrons below it whenever
 * there's more to scroll to — a table that scrolls sideways with no visible scrollbar is easy to
 * miss on a touch device. Buttons double as click-to-scroll, not just a hint. Pass `hint={false}`
 * for the print/PDF export, where there's no pointer to click them anyway. */
export function ScrollHintTable({
  children,
  className = '',
  hint = true,
}: {
  children: React.ReactNode
  className?: string
  hint?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const updateScrollState = () => {
      setCanScrollLeft(el.scrollLeft > 2)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
    }

    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      observer.disconnect()
    }
  })

  const scrollBy = (delta: number) => scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })

  return (
    <div className={className}>
      <div ref={scrollRef} className="overflow-auto border border-[#e5e0d8] bg-white">
        {children}
      </div>
      {hint && (canScrollLeft || canScrollRight) && (
        <div className="flex items-center justify-center gap-2 pt-1.5">
          <button
            type="button"
            onClick={() => scrollBy(-240)}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e5e0d8] text-[#506A70] hover:text-[#172338] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#506A70]">Scroll for more</span>
          <button
            type="button"
            onClick={() => scrollBy(240)}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e5e0d8] text-[#506A70] hover:text-[#172338] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
