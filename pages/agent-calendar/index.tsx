import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { GetServerSidePropsContext } from 'next'
import { getAvailabilityDateRange } from '@/lib/api/availabilityRange'
import { getManagedProperties } from '@/lib/api/properties'
import PublicAvailabilityGrid from '@/components/custom/PublicAvailabilityGrid'
import AvailabilityLegend from '@/components/custom/AvailabilityLegend'
import { SeoHead } from '@/components/seo/SeoHead'
import { getPublicSiteOriginFromRequest } from '@/lib/seo/config'

const WINDOW_DAYS = 90

const toDateStr = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

type Props = {
  items: any[]
  blockedDatesByProperty: Record<string, string[]>
  from: string
  to: string
  siteOrigin: string
}

export default function AgentCalendarPage({
  items,
  blockedDatesByProperty,
  from,
  to,
  siteOrigin,
}: Props) {
  const startDate = new Date(`${from}T00:00:00`)
  const endDate = new Date(`${to}T00:00:00`)

  const [searchInput, setSearchInput] = useState('')

  // Only ~24 villas ever load here (fixed allowlist), so filtering is done client-side —
  // no need for server round trips or pagination.
  const filteredItems = useMemo(() => {
    const term = searchInput.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => String(item?.property?.title || '').toLowerCase().includes(term))
  }, [items, searchInput])

  // `items` trae un registro por rango de disponibilidad, no por villa — contar propiedades únicas.
  const countVillas = (list: any[]) => new Set(list.map((i) => i?.propertyId).filter(Boolean)).size
  const totalVillas = countVillas(items)
  const shownVillas = countVillas(filteredItems)

  return (
    <>
      <SeoHead
        title="Villas Availability Calendar — Kennedy's Group"
        description="Live availability and nightly rates across Kennedy's Group villas, updated in real time."
        siteOrigin={siteOrigin}
        canonicalPath="/agent-calendar"
        noindex
      />
      <div className="min-h-screen bg-white px-6 md:px-20 lg:px-32 py-10 md:py-14">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="font-haas font-light text-[11px] md:text-xs tracking-[0.24em] uppercase text-[#D99330] mb-3">
              Kennedy&apos;s Group
            </p>
            <h1 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-gtsuper-ds font-light leading-[0.95] tracking-[-0.01em] text-[#172338]">
              Villas Availability
            </h1>
          </div>
          <Link
            href="/agent-portfolio"
            className="font-haas font-light text-xs md:text-sm text-[#D99330] hover:underline whitespace-nowrap mt-1"
          >
            Go to agents area →
          </Link>
        </div>
        <div className="max-w-xs mb-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search villa name…"
            aria-label="Search villa name"
            className="w-full px-3 py-2 border border-[#E2E8EB] font-haas font-light text-sm text-[#172338] placeholder:text-[#506A70] focus:outline-none focus:border-[#D99330]"
          />
        </div>
        <p className="font-haas font-light text-xs text-[#506A70] mb-5">
          {searchInput.trim()
            ? `Showing ${shownVillas} of ${totalVillas} ${totalVillas === 1 ? 'villa' : 'villas'}`
            : `${totalVillas} ${totalVillas === 1 ? 'villa' : 'villas'} · next 90 days`}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <AvailabilityLegend variant="grid" />
          <p className="font-haas font-light text-[10px] uppercase tracking-[0.16em] text-[#506A70]/80 shrink-0">
            Scroll sideways for the full 90 days →
          </p>
        </div>
        {filteredItems.length === 0 ? (
          <p className="font-haas font-light text-sm text-[#506A70] mb-4">No villas found for &quot;{searchInput.trim()}&quot;.</p>
        ) : (
          // Full-bleed on mobile (cancels the page's px-6) so the horizontally-scrolling grid gets
          // the whole screen width instead of being squeezed inside the page padding.
          <div className="-mx-6 md:mx-0">
            <PublicAvailabilityGrid
              startDate={startDate}
              endDate={endDate}
              items={filteredItems}
              blockedDatesByProperty={blockedDatesByProperty}
            />
          </div>
        )}
      </div>
    </>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = new Date(today)
  end.setDate(end.getDate() + WINDOW_DAYS)

  const from = toDateStr(today)
  const to = toDateStr(end)

  const managedRes = await getManagedProperties()
  const managedIds: string[] = (Array.isArray(managedRes?.data) ? managedRes.data : [])
    .map((p: any) => p?.id)
    .filter(Boolean)

  const res = managedIds.length > 0
    ? await getAvailabilityDateRange({ from, to, propertyIds: managedIds })
    : { data: [], blockedDatesByProperty: {} }
  const items = Array.isArray(res?.data) ? res.data : []
  const blockedDatesByProperty = res?.blockedDatesByProperty || {}
  const siteOrigin = getPublicSiteOriginFromRequest(context.req)

  return {
    props: {
      items,
      blockedDatesByProperty,
      from,
      to,
      siteOrigin,
    },
  }
}
