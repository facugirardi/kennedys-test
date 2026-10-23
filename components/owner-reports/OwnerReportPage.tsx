import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { BedDouble, Bath, Users, Maximize, ChevronRight, Clock, FileText, Eye, X } from 'lucide-react'
import { getOwnerPropertyReport, getOwnerPropertyReportByLink } from '@/lib/api/ownerReports'
import { getProperty } from '@/lib/api/properties'
import { resolveMediaUrl, resolvePrintImageUrl } from '@/lib/utils'
import type { OwnedPropertySummary, OwnerReport, OwnerReportBooking, OwnerReportRateCardPeriod } from '@/src/types/ownerReport'
import { ScrollHintTable } from './ScrollHintTable'

const AvailabilityCalendar = dynamic(() => import('@/components/custom/AvailabilityCalendar'), { ssr: false })

const GOLD = '#D99330'
const TEAL = '#28C7B8'
const RUST = '#A85742'

// Shared keyboard-focus ring so every interactive element on the report is reachable
// and visible on tab-through (previously only mouse hover worked in a few places).
const FOCUS_RING =
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D99330]'

export function fmtMoney(value: number | null | undefined, currency: string) {
  const n = Number(value) || 0
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
}

export function fmtDate(value: string | null | undefined) {
  if (!value) return '—'
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function yearOf(value: string | null | undefined) {
  if (!value) return null
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d.getFullYear()
}

// Offers/negotiations are keyed by when they were requested; a handful only carry stay dates,
// so fall back to check-in for those.
function recordYear(n: { requestDate: string | null; checkIn: string | null }): number | null {
  return yearOf(n.requestDate) ?? yearOf(n.checkIn)
}

// The API's `vs2025` arrives as a raw ratio string ("0.16" = +16% vs the prior year).
// Render it as a signed percentage, tolerating both "0.16" and "16" shapes.
function fmtYoyDelta(raw: string | null | undefined): { text: string; positive: boolean } | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  if (!Number.isFinite(n)) return null
  const pct = Math.abs(n) <= 1 ? n * 100 : n
  return { text: `${pct >= 0 ? '+' : ''}${Math.round(pct)}%`, positive: pct >= 0 }
}

// Signed % with a direction glyph, so the value doesn't rely on colour alone.
function DeltaValue({ pct }: { pct: number | null }) {
  if (pct == null) return <>—</>
  const up = pct >= 0
  return (
    <span style={{ color: up ? '#0F7A6F' : RUST }} className="whitespace-nowrap font-medium">
      <span aria-hidden>{up ? '▲' : '▼'}</span> {up ? '+' : ''}
      {Math.round(pct)}%
    </span>
  )
}

type NavItem = { id: string; label: string }

function SectionNav({ items, updatedLabel }: { items: NavItem[]; updatedLabel: string }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      className="pdf-exclude-from-capture sticky z-30 mx-[calc(50%-50vw)] w-screen bg-white/95 backdrop-blur border-b border-[#e5e0d8]"
      style={{ top: 'var(--owner-report-nav-offset, 0px)' }}
    >
      <div className="mx-auto flex max-w-[1140px] items-center gap-1.5 overflow-x-auto px-4 sm:px-6 py-3 md:py-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            className={`${FOCUS_RING} shrink-0 px-3.5 py-2 text-[12px] md:text-[13px] uppercase tracking-[0.12em] transition-colors ${
              active === it.id ? 'text-[#172338] border-b-2 border-[#D99330]' : 'text-[#9a8f80] hover:text-[#172338]'
            }`}
          >
            {it.label}
          </a>
        ))}
        <span className="ml-auto shrink-0 hidden md:inline-flex items-center gap-1.5 pl-4 text-[11px] uppercase tracking-[0.12em] text-[#9a8f80]">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {updatedLabel}
        </span>
      </div>
    </nav>
  )
}

// The owner-reports API returns lifetime figures: `season` spans the first-ever to the
// last-ever booking, and `monthly` / `stats` / `bookings` accumulate every season. Every
// heading on this page is framed as the current season ("this season", "Bookings 2026",
// "Rate Card 2026"), so we scope the data to `currentYear` here. The multi-season story
// has its own home in the "Performance History" section (yearlyPerformance).
// TODO(backend): scope stats/monthly/bookings to the season server-side, and populate
// yearlyPerformance for every villa so this client-side pass becomes redundant.
function scopeReportToSeason(report: OwnerReport): OwnerReport {
  const yr = report.currentYear

  const bookings = report.bookings.filter((b) => yearOf(b.checkIn) === yr)
  const occupiedRanges = report.villa.occupiedRanges.filter((r) => yearOf(r.start) === yr)
  const monthly: OwnerReport['monthly'] = {}
  Object.keys(report.monthly).forEach((k) => {
    if (k.startsWith(`${yr}-`)) monthly[k] = report.monthly[k]
  })

  const totalNet = bookings.reduce((s, b) => s + (Number(b.netPrice) || 0), 0)
  const totalNights = bookings.reduce((s, b) => s + (Number(b.nights) || 0), 0)

  // Season window: keep the real season if it already sits inside the current calendar
  // year; otherwise rebuild it from this year's reserved ranges (summer fallback).
  const rawStart = new Date(`${report.villa.season.start}T00:00:00`)
  const rawEnd = new Date(`${report.villa.season.end}T00:00:00`)
  const withinCurrentYear =
    rawStart.getFullYear() === yr && rawEnd.getFullYear() === yr && rawEnd > rawStart
  let season = report.villa.season
  if (!withinCurrentYear) {
    const starts = occupiedRanges.map((r) => r.start).sort()
    const ends = occupiedRanges.map((r) => r.end).sort()
    const first = starts[0] ? new Date(`${starts[0]}T00:00:00`) : new Date(yr, 4, 1)
    const last = ends.length ? new Date(`${ends[ends.length - 1]}T00:00:00`) : new Date(yr, 9, 31)
    const startMonth = new Date(first.getFullYear(), first.getMonth(), 1)
    const endMonth = new Date(last.getFullYear(), last.getMonth() + 1, 0)
    const iso = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    season = { start: iso(startMonth), end: iso(endMonth) }
  }

  return {
    ...report,
    villa: { ...report.villa, season, occupiedRanges },
    bookings,
    monthly,
    stats: {
      ...report.stats,
      totalNet,
      totalNights,
      avgPerNight: totalNights ? totalNet / totalNights : 0,
      bookingCount: bookings.length,
    },
  }
}

export const SectionHead = ({ script, title, note }: { script?: string; title: string; note?: string }) => (
  <div className="mb-6">
    {script && <span className="block font-script font-extralight not-italic text-[#D99330] text-[40px] leading-tight mb-1">{script}</span>}
    <h2 className="font-gtsuper-ds text-[26px] md:text-[32px] font-light uppercase tracking-wide text-[#172338]">{title}</h2>
    {note && <p className="text-xs text-[#506A70] mt-2 max-w-xl">{note}</p>}
  </div>
)

export const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-[#e5e0d8] bg-[#FBFAF7] text-center text-sm text-[#506A70] py-10 px-6">
    {children}
  </div>
)

// Tinted status pill — solid teal/gold under white text failed contrast; a soft wash
// with a darkened label reads cleanly on screen and in the PDF export.
type PillTone = 'teal' | 'gold' | 'rust' | 'ink'
const PILL_TONE: Record<PillTone, { bg: string; fg: string }> = {
  teal: { bg: 'rgba(40,199,184,0.16)', fg: '#0F7A6F' },
  gold: { bg: 'rgba(217,147,48,0.18)', fg: '#8A5A16' },
  rust: { bg: 'rgba(168,87,66,0.16)', fg: '#8A3F2E' },
  ink: { bg: 'rgba(23,35,56,0.10)', fg: '#172338' },
}
const Pill = ({ tone, children }: { tone: PillTone; children: React.ReactNode }) => (
  <span
    className="inline-block whitespace-nowrap px-2.5 py-1 rounded-full text-[9px] uppercase tracking-[0.14em] font-semibold"
    style={{ background: PILL_TONE[tone].bg, color: PILL_TONE[tone].fg }}
  >
    {children}
  </span>
)

// Year filter tags — lets an owner narrow a table down to one season. Skipped entirely when
// there's nothing to filter (no records yet, or everything falls in a single year).
function YearTags({
  years,
  selected,
  onSelect,
}: {
  years: number[]
  selected: number | 'all'
  onSelect: (year: number | 'all') => void
}) {
  if (years.length < 2) return null
  const tagClass = (active: boolean) =>
    `${FOCUS_RING} px-3 py-1.5 rounded-full text-[11px] uppercase tracking-[0.12em] font-medium transition-colors ${
      active ? 'bg-[#172338] text-white' : 'bg-[#f5f3ef] text-[#506A70] hover:bg-[#e5e0d8]'
    }`
  return (
    <div className="pdf-exclude-from-capture flex flex-wrap items-center gap-1.5 mb-5">
      <button type="button" onClick={() => onSelect('all')} className={tagClass(selected === 'all')}>
        All years
      </button>
      {years.map((y) => (
        <button key={y} type="button" onClick={() => onSelect(y)} className={tagClass(selected === y)}>
          {y}
        </button>
      ))}
    </div>
  )
}

export function KpiStrip({ report }: { report: OwnerReport }) {
  const { stats, villa } = report
  const negotiationsCountVal = String(stats.negotiationsCount)
  const negotiationsValueVal = fmtMoney(stats.negotiationsValue, villa.currency)
  const tiles: { val: string; lbl: string; hint: string }[] = villa.isRealEstate
    ? [
        { val: fmtMoney(stats.totalNet, villa.currency), lbl: 'Confirmed Net Proceeds', hint: `${stats.bookingCount} deals` },
        { val: String(stats.bookingCount), lbl: 'Confirmed Deals', hint: 'contracts signed' },
        { val: negotiationsCountVal, lbl: 'Negotiations Open', hint: 'with prospective buyers' },
        { val: negotiationsValueVal, lbl: 'Negotiations Value', hint: 'combined net to owner' },
      ]
    : [
        { val: fmtMoney(stats.totalNet, villa.currency), lbl: 'Confirmed Net Revenue', hint: `${stats.bookingCount} bookings` },
        { val: String(stats.totalNights), lbl: 'Nights Booked', hint: 'this season' },
        { val: fmtMoney(stats.avgPerNight, villa.currency), lbl: 'Average Net / Night', hint: 'confirmed stays' },
        { val: String(stats.bookingCount), lbl: 'Confirmed Bookings', hint: 'contracts signed' },
        { val: negotiationsCountVal, lbl: 'Negotiations Open', hint: 'active inquiries' },
        { val: negotiationsValueVal, lbl: 'Negotiations Value', hint: 'combined net to owner' },
      ]
  const [hero, ...rest] = tiles
  return (
    <div className="border border-[#D99330] md:flex">
      <div className="text-center md:text-left px-6 py-8 bg-[#FBFAF7] border-b md:border-b-0 md:border-r border-[#D99330]/40 md:min-w-[240px] md:flex md:flex-col md:justify-center">
        <div className="font-gtsuper-ds text-4xl md:text-5xl font-light text-[#172338] leading-none">{hero.val}</div>
        <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#172338] mt-3">{hero.lbl}</div>
        <div className="text-[11px] text-[#506A70] mt-1">{hero.hint}</div>
      </div>
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 items-stretch">
        {rest.map((t, i) => (
          <div key={i} className="flex flex-col justify-center text-center px-4 py-6 border-r border-b border-[#e5e0d8] [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:last-child]:border-r-0">
            <div className="font-gtsuper-ds text-2xl font-light text-[#172338]">{t.val}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold leading-tight text-[#172338] mt-2.5">{t.lbl}</div>
            <div className="text-[10px] text-[#506A70] mt-1.5">{t.hint}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SeasonStrip({ report }: { report: OwnerReport }) {
  const { villa } = report
  const start = new Date(`${villa.season.start}T00:00:00`)
  const end = new Date(`${villa.season.end}T00:00:00`)
  const span = end.getTime() - start.getTime()
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const months: string[] = []
  if (span > 0) {
    let m = new Date(start.getFullYear(), start.getMonth(), 1)
    while (m <= end) {
      months.push(m.toLocaleDateString('en-GB', { month: 'short' }))
      m = new Date(m.getFullYear(), m.getMonth() + 1, 1)
    }
  }

  const now = Date.now()
  const todayLeft = span > 0 ? Math.min(100, Math.max(0, ((now - start.getTime()) / span) * 100)) : null

  const showTip = (text: string, x: number, y: number) => setTooltip({ text, x, y })
  const showTipForEl = (text: string, el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    setTooltip({ text, x: r.left + r.width / 2, y: r.top })
  }

  return (
    <div>
      <div className="relative h-20 bg-white border border-[#e5e0d8]">
        {span > 0 &&
          villa.occupiedRanges.map((r, i) => {
            const ci = new Date(`${r.start}T00:00:00`).getTime()
            const co = new Date(`${r.end}T00:00:00`).getTime()
            const left = Math.max(0, ((ci - start.getTime()) / span) * 100)
            if (left > 100) return null
            const width = Math.max(1.2, Math.min(((co - ci) / span) * 100, 100 - left))
            const nights = r.nights || Math.max(1, Math.round((co - ci) / (24 * 60 * 60 * 1000)))
            const priceLabel = r.netPrice
              ? ` · ${fmtMoney(r.netPrice, villa.currency)}${nights ? ` (${fmtMoney(r.netPrice / nights, villa.currency)}/night)` : ''}`
              : ''
            const text = `Reserved · ${fmtDate(r.start)} → ${fmtDate(r.end)} · ${nights} night${nights === 1 ? '' : 's'}${priceLabel}`
            return (
              <button
                key={i}
                type="button"
                aria-label={text}
                title={text}
                onMouseEnter={(e) => showTip(text, e.clientX, e.clientY)}
                onMouseMove={(e) => showTip(text, e.clientX, e.clientY)}
                onMouseLeave={() => setTooltip(null)}
                onFocus={(e) => showTipForEl(text, e.currentTarget)}
                onBlur={() => setTooltip(null)}
                className={`${FOCUS_RING} absolute top-1.5 bottom-1.5 min-w-[8px] cursor-pointer rounded-[2px] shadow-sm transition-[filter] hover:brightness-110`}
                style={{ left: `${left}%`, width: `${width}%`, background: TEAL }}
              />
            )
          })}
        {todayLeft != null && (
          <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${todayLeft}%` }}>
            <div className="absolute -top-5 -translate-x-1/2 text-[9px] uppercase tracking-[0.14em] font-medium whitespace-nowrap" style={{ color: GOLD }}>
              Today
            </div>
            <div className="absolute top-0 bottom-0 w-px" style={{ background: GOLD }} />
          </div>
        )}
      </div>
      {tooltip && (
        <div
          className="fixed z-[999] pointer-events-none bg-[#172338] text-white text-xs px-3.5 py-2.5 leading-relaxed max-w-[260px]"
          style={{ left: Math.min(tooltip.x + 14, (typeof window !== 'undefined' ? window.innerWidth : 9999) - 270), top: tooltip.y + 16 }}
        >
          {tooltip.text}
        </div>
      )}
      {months.length > 0 && (
        <div className="flex mt-2">
          {months.map((m, i) => (
            <span key={i} className="flex-1 text-[10px] uppercase tracking-[0.16em] text-[#506A70] border-l border-[#e5e0d8] pl-2">
              {m}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-6 mt-4 text-[10px] uppercase tracking-[0.08em] text-[#506A70]">
        <span className="flex items-center gap-2">
          <span className="w-4 h-2 inline-block" style={{ background: TEAL }} /> Reserved
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-2 inline-block border border-[#e5e0d8] bg-white" /> Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-2 inline-block" style={{ background: GOLD }} /> Today
        </span>
      </div>
    </div>
  )
}

export function MonthlyBars({ report }: { report: OwnerReport }) {
  const { currency } = report.villa
  const keys = Object.keys(report.monthly).sort()
  if (!keys.length) {
    return <EmptyState>Net revenue by month will appear here as bookings for the season are confirmed.</EmptyState>
  }
  const max = Math.max(...keys.map((k) => report.monthly[k].revenue))
  const totalRevenue = keys.reduce((s, k) => s + report.monthly[k].revenue, 0)
  const totalNights = keys.reduce((s, k) => s + report.monthly[k].nights, 0)

  return (
    <div>
      <div className="flex items-end gap-[4%] h-44 bg-white border border-[#e5e0d8] px-6 pt-6 pb-4">
        {keys.map((k) => {
          const m = report.monthly[k]
          const lbl = new Date(`${k}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })
          const heightPct = max ? Math.max(4, (m.revenue / max) * 100) : 4
          return (
            <div key={k} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              <div className="font-gtsuper-ds text-sm font-light text-[#172338]">{fmtMoney(m.revenue, currency)}</div>
              <div className="w-full max-w-[64px]" style={{ height: `${heightPct}%`, background: TEAL }} />
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#506A70]">{lbl} · {m.nights}n</div>
            </div>
          )
        })}
      </div>
      <p className="text-[11px] text-[#506A70] mt-3">
        Season total <b className="text-[#172338]">{fmtMoney(totalRevenue, currency)}</b> net over{' '}
        <b className="text-[#172338]">{totalNights} nights</b> · avg{' '}
        <b className="text-[#172338]">{fmtMoney(totalNights ? totalRevenue / totalNights : 0, currency)}</b>/night
      </p>
    </div>
  )
}

export function YearlyPerformanceBars({ data, currentYear, currency }: { data: OwnerReport['yearlyPerformance']; currentYear: number; currency: string }) {
  const max = Math.max(...data.map((d) => d.netRevenue), 1)
  return (
    <div className="flex items-end gap-[4%] h-52 bg-white border border-[#e5e0d8] px-6 pt-6 pb-4">
      {data.map((d) => {
        const inProgress = d.year === currentYear
        const heightPct = max ? Math.max(4, (d.netRevenue / max) * 100) : 4
        return (
          <div key={d.year} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
            <div className="font-gtsuper-ds text-sm font-light text-[#172338]">{fmtMoney(d.netRevenue, currency)}</div>
            <div className="w-full max-w-[64px]" style={{ height: `${heightPct}%`, background: inProgress ? `${TEAL}66` : TEAL }} />
            <div className="text-[9px] uppercase tracking-[0.14em] text-[#506A70]">
              {d.year}{inProgress && ' · in progress'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function YearlyPerformanceTable({ data, currentYear, currency }: { data: OwnerReport['yearlyPerformance']; currentYear: number; currency: string }) {
  const totalBookings = data.reduce((sum, d) => sum + d.bookingCount, 0)
  const totalNights = data.reduce((sum, d) => sum + d.nights, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.netRevenue, 0)
  const totalAvgPerNight = totalNights ? totalRevenue / totalNights : 0

  return (
    <ScrollHintTable>
      <table className="w-full text-[13px] min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-[#e5e0d8]">
            {['Season', 'Bookings', 'Nights', 'Net Revenue', 'Avg Net / Night', 'Revenue vs Previous Year'].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#172338] font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => {
            const prev = data[i - 1]
            const pctChange = prev && prev.netRevenue ? ((d.netRevenue - prev.netRevenue) / prev.netRevenue) * 100 : null
            const inProgress = d.year === currentYear
            return (
              <tr key={d.year} className="border-b border-[#e5e0d8]">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  {d.year}
                  {inProgress && <span className="ml-1.5 text-[9px] uppercase tracking-[0.1em] text-[#9a8f80]">in progress</span>}
                </td>
                <td className="px-4 py-3">{d.bookingCount}</td>
                <td className="px-4 py-3">{d.nights}</td>
                <td className="px-4 py-3 font-medium text-[#172338]">{fmtMoney(d.netRevenue, currency)}</td>
                <td className="px-4 py-3">{fmtMoney(d.avgPerNight, currency)}</td>
                <td className="px-4 py-3"><DeltaValue pct={pctChange} /></td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="bg-[#f5f3ef] font-medium">
            <td className="px-4 py-3">All Seasons</td>
            <td className="px-4 py-3">{totalBookings}</td>
            <td className="px-4 py-3">{totalNights}</td>
            <td className="px-4 py-3 text-[#172338]">{fmtMoney(totalRevenue, currency)}</td>
            <td className="px-4 py-3">{fmtMoney(totalAvgPerNight, currency)}</td>
            <td className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </ScrollHintTable>
  )
}

export function YearlyPerformanceInsights({ data, currentYear, negotiationsCount, negotiationsValue, currency }: {
  data: OwnerReport['yearlyPerformance']
  currentYear: number
  negotiationsCount: number
  negotiationsValue: number
  currency: string
}) {
  const totalBookings = data.reduce((sum, d) => sum + d.bookingCount, 0)
  const totalNights = data.reduce((sum, d) => sum + d.nights, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.netRevenue, 0)
  const totalAvgPerNight = totalNights ? totalRevenue / totalNights : 0

  const pastSeasons = data.filter((d) => d.year !== currentYear)
  const bestSeason = pastSeasons.reduce((best, d) => (!best || d.netRevenue > best.netRevenue ? d : best), null as OwnerReport['yearlyPerformance'][number] | null)

  const current = data.find((d) => d.year === currentYear) || null
  const pctOfBest = current && bestSeason && bestSeason.netRevenue ? Math.round((current.netRevenue / bestSeason.netRevenue) * 100) : null

  const items: { title: string; body: React.ReactNode }[] = [
    {
      title: 'Lifetime performance',
      body: (
        <>
          Across {data.length} seasons the villa has generated <b>{fmtMoney(totalRevenue, currency)}</b> net to owner over{' '}
          <b>{totalNights} nights</b> ({totalBookings} bookings), an all-time average of <b>{fmtMoney(totalAvgPerNight, currency)}</b> net per
          night.
        </>
      ),
    },
  ]
  if (bestSeason) {
    items.push({
      title: `Strongest season: ${bestSeason.year}`,
      body: (
        <>
          {bestSeason.year} remains the benchmark year with <b>{fmtMoney(bestSeason.netRevenue, currency)}</b> across {bestSeason.nights}{' '}
          nights ({fmtMoney(bestSeason.avgPerNight, currency)} avg net/night).
        </>
      ),
    })
  }
  if (current) {
    items.push({
      title: `${currentYear} season so far`,
      body: (
        <>
          <b>{fmtMoney(current.netRevenue, currency)}</b> confirmed over {current.nights} nights
          {negotiationsCount > 0 && (
            <>
              , with <b>{negotiationsCount} open negotiation{negotiationsCount === 1 ? '' : 's'}</b> worth {fmtMoney(negotiationsValue, currency)}{' '}
              if all close
            </>
          )}
          .{pctOfBest != null && ` Confirmed revenue currently stands at ${pctOfBest}% of the best season.`}
        </>
      ),
    })
  }

  return (
    <div className="flex flex-col border border-[#D99330]">
      {items.map((item, i) => (
        <div key={item.title} className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-5 items-start px-6 py-6 border-b border-[#e5e0d8] last:border-b-0">
          <div className="font-gtsuper-ds text-4xl md:text-5xl leading-none font-light" style={{ color: TEAL }}>{i + 1}</div>
          <div>
            <h3 className="font-gtsuper-ds text-lg font-light mb-1.5">{item.title}</h3>
            <p className="text-[13px] leading-relaxed text-[#4A4A46] max-w-2xl">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function rateYoyPct(raw: string | null | undefined) {
  const d = fmtYoyDelta(raw)
  if (!d) return null
  return Number(d.text.replace('%', ''))
}

function RateCardTable({
  rows,
  currency,
  forPrint = false,
}: {
  rows: OwnerReportRateCardPeriod[]
  currency: string
  forPrint?: boolean
}) {
  if (!rows.length) return null
  const hasIncludedServices = !forPrint && rows.some((r) => r.includedServices)

  // Keep the rack / net-to-owner pair for each period adjacent: sort by start date, then
  // by official price so the higher (rack) row always sits above its net-to-owner twin.
  const rates = [...rows].sort(
    (a, b) => (a.start || '').localeCompare(b.start || '') || (Number(b.official) || 0) - (Number(a.official) || 0),
  )

  // Group index per period so we can zebra-stripe whole periods, not alternate rows.
  let groupIdx = -1
  const withGroup = rates.map((r, i) => {
    const prev = rates[i - 1]
    if (!prev || prev.start !== r.start || prev.end !== r.end) groupIdx += 1
    return { r, group: groupIdx, firstOfPeriod: !prev || prev.start !== r.start || prev.end !== r.end }
  })

  return (
    <>
      {/* Desktop / tablet: table */}
      <ScrollHintTable className="hidden sm:block" hint={!forPrint}>
        <table className="w-full text-[13px] min-w-[880px] border-collapse">
          <thead>
            <tr className="border-b border-[#e5e0d8]">
              {(forPrint
                ? ['Period', 'Official/Night', 'Mgmt Fee', 'Agency Comm.', 'Net/Night', 'Min. Stay']
                : [
                    'Period',
                    'Official / Night',
                    'Management Fee',
                    'Agency Commission',
                    'Net to Owner / Night',
                    'Min. Stay',
                    'vs. Prev. Year',
                    ...(hasIncludedServices ? ['Included Services'] : []),
                  ]
              ).map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#172338] font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withGroup.map(({ r, group, firstOfPeriod }, i) => (
              <tr
                key={i}
                className={`border-b border-[#e5e0d8] ${firstOfPeriod ? 'border-t border-t-[#e5e0d8]' : ''} ${group % 2 ? 'bg-[#FBFAF7]' : ''}`}
              >
                <td className="px-4 py-3 font-medium text-[#172338]">{firstOfPeriod ? r.label : ''}</td>
                <td className="px-4 py-3 font-medium text-[#172338]">{fmtMoney(r.official, currency)}</td>
                <td className="px-4 py-3">{fmtMoney(r.fee, currency)}</td>
                <td className="px-4 py-3">{fmtMoney(r.commission, currency)}</td>
                <td className="px-4 py-3 font-medium text-[#172338]">{fmtMoney(r.netOwner, currency)}</td>
                <td className="px-4 py-3">{r.minStay ? `${r.minStay} nights` : '—'}</td>
                {!forPrint && <td className="px-4 py-3"><DeltaValue pct={rateYoyPct(r.vs2025)} /></td>}
                {hasIncludedServices && (
                  <td className="px-4 py-3 text-[#4A4A46] whitespace-pre-line max-w-[240px]">{r.includedServices || '—'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollHintTable>

      {/* Mobile: one card per rate */}
      <div className="sm:hidden flex flex-col gap-3">
        {withGroup.map(({ r, firstOfPeriod }, i) => (
          <div key={i} className="border border-[#e5e0d8] bg-white p-4">
            {firstOfPeriod && <div className="font-medium text-[#172338] mb-2">{r.label}</div>}
            <div className="flex items-center justify-end">
              <DeltaValue pct={rateYoyPct(r.vs2025)} />
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[13px]">
              <dt className="text-[#506A70]">Official / night</dt>
              <dd className="text-right font-medium text-[#172338]">{fmtMoney(r.official, currency)}</dd>
              <dt className="text-[#506A70]">Net to owner / night</dt>
              <dd className="text-right font-medium text-[#172338]">{fmtMoney(r.netOwner, currency)}</dd>
              <dt className="text-[#506A70]">Min. stay</dt>
              <dd className="text-right">{r.minStay ? `${r.minStay} nights` : '—'}</dd>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}

// Post-stay notes staff enter against each booking (property_bookings) — any of the three can be
// empty, so we only surface the ones that carry text and hide the whole block otherwise.
export function bookingHasStayReport(b: OwnerReportBooking) {
  return Boolean(
    (b.guestFeedback || '').trim() ||
      (b.housekeepingFeedback || '').trim() ||
      (b.damages || '').trim() ||
      b.hasDamage ||
      b.securityDepositTaken ||
      b.damageReportUrls?.length
  )
}

export function StayReportBody({ b, currency }: { b: OwnerReportBooking; currency: string }) {
  const rows: { label: string; value: string; tone?: 'rust' }[] = []
  if ((b.guestFeedback || '').trim()) rows.push({ label: 'Client feedback', value: b.guestFeedback!.trim() })
  if ((b.housekeepingFeedback || '').trim()) rows.push({ label: 'Housekeeping', value: b.housekeepingFeedback!.trim() })
  if (b.securityDepositTaken || b.securityDepositAmount != null) {
    rows.push({
      label: 'Security deposit',
      value: b.securityDepositTaken ? `Yes — ${fmtMoney(b.securityDepositAmount, currency)}` : 'No',
    })
  }
  if ((b.damages || '').trim() || b.hasDamage) {
    rows.push({
      label: 'Damage',
      value: b.hasDamage ? (b.damages || '').trim() || 'Yes' : 'No',
      tone: b.hasDamage ? 'rust' : undefined,
    })
  }
  if (!rows.length && !b.damageReportUrls?.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#9a8f80] font-semibold mb-1">{r.label}</div>
          <p className={`text-[12.5px] leading-relaxed ${r.tone === 'rust' ? 'text-[#8A3F2E]' : 'text-[#4A4A46]'}`}>{r.value}</p>
        </div>
      ))}
      {b.damageReportUrls?.length > 0 && (
        <div>
          <div className="text-[9px] uppercase tracking-[0.16em] text-[#9a8f80] font-semibold mb-1">Damage report</div>
          <div className="flex flex-col gap-1">
            {b.damageReportUrls.map((url, idx) => (
              <DamageReportLink key={url} url={url} label={`File ${idx + 1}`} className="self-start" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ContractLink({
  url,
  className = '',
  iconOnly = false,
}: {
  url: string
  className?: string
  iconOnly?: boolean
}) {
  return (
    <a
      href={resolveMediaUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      title={iconOnly ? 'Contract' : undefined}
      aria-label={iconOnly ? 'Contract' : undefined}
      className={`${FOCUS_RING} inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-[#8A5A16] underline decoration-[#D99330]/50 underline-offset-2 hover:decoration-[#D99330] ${className}`}
    >
      <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {!iconOnly && 'Contract'}
    </a>
  )
}

export function StayReportLink({ url, className = '' }: { url: string; className?: string }) {
  return (
    <a
      href={resolveMediaUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${FOCUS_RING} inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-[#506A70] underline decoration-[#506A70]/40 underline-offset-2 hover:decoration-[#506A70] ${className}`}
    >
      <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      Stay Report
    </a>
  )
}

export function DamageReportLink({ url, label, className = '' }: { url: string; label: string; className?: string }) {
  return (
    <a
      href={resolveMediaUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${FOCUS_RING} inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-[#8A3F2E] underline decoration-[#8A3F2E]/40 underline-offset-2 hover:decoration-[#8A3F2E] ${className}`}
    >
      <FileText className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {label}
    </a>
  )
}

// "Net to Owner" figure — a flat amount normally, or an Official/Discounted/percent-off stack when
// a discount was applied on this booking (officialNetPrice is only set when staff record one).
export function NetPriceCell({ b, currency }: { b: OwnerReportBooking; currency: string }) {
  const hasDiscount = b.officialNetPrice != null && b.officialNetPrice > b.netPrice
  if (!hasDiscount) {
    return <span className="font-medium text-[#172338] whitespace-nowrap">{fmtMoney(b.netPrice, currency)}</span>
  }
  return (
    <div className="flex flex-col gap-0.5 whitespace-nowrap">
      <span className="text-[11px] text-[#9a8f80] line-through">{fmtMoney(b.officialNetPrice, currency)}</span>
      <span className="font-medium text-[#172338]">{fmtMoney(b.netPrice, currency)}</span>
      {b.discountPercent != null && <Pill tone="rust">-{b.discountPercent}%</Pill>}
    </div>
  )
}

// "Payment Plan" — a list of installments (amount, due date, done/pending) when staff have entered
// one, otherwise falls back to the legacy single PENDING/DONE status for older/Excel-imported bookings.
// The list is collapsed behind a toggle — several installments stacked in a table cell looks cluttered.
export function PaymentPlanCell({ b }: { b: OwnerReportBooking }) {
  const [open, setOpen] = useState(false)
  if (!b.paymentPlan?.length) {
    return <Pill tone={b.payment === 'DONE' ? 'teal' : 'gold'}>{b.payment || 'PENDING'}</Pill>
  }
  const paidCount = b.paymentPlan.filter((p) => p.status === 'DONE').length
  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`${FOCUS_RING} inline-flex items-center gap-1 self-start text-[10px] uppercase tracking-[0.1em] text-[#9a8f80] hover:text-[#172338]`}
      >
        {paidCount}/{b.paymentPlan.length} paid
        <ChevronRight className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} strokeWidth={2} aria-hidden />
      </button>
      {open && b.paymentPlan.map((installment) => (
        <div key={installment.id} className="flex items-center gap-2 whitespace-nowrap text-[12px]">
          <span className="font-medium text-[#172338]">{installment.amount || '—'}</span>
          <span className="text-[#506A70]">{fmtDate(installment.dueDate)}</span>
          <Pill tone={installment.status === 'DONE' ? 'teal' : 'gold'}>{installment.status}</Pill>
        </div>
      ))}
    </div>
  )
}

export function BookingsTable({
  bookings,
  currency,
  isRealEstate,
  forPrint = false,
  year = 'all',
}: {
  bookings: OwnerReportBooking[]
  currency: string
  isRealEstate: boolean
  forPrint?: boolean
  year?: number | 'all'
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (!bookings.length) {
    const scope = year === 'all' ? 'yet' : `in ${year}`
    return (
      <EmptyState>
        {isRealEstate
          ? `No signed deals ${scope}. Confirmed contracts will be listed here as they close — offers in progress are shown below.`
          : `No confirmed bookings ${scope}. Reservations will appear here as contracts are signed — enquiries in progress are shown below.`}
      </EmptyState>
    )
  }

  const totalNet = bookings.reduce((sum, b) => sum + (b.netPrice || 0), 0)
  const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0)
  const avgPerNight = totalNights ? totalNet / totalNights : 0
  const anyExtras = bookings.some((b) => b.contractUrl || b.stayReportUrl || bookingHasStayReport(b))
  const headers = isRealEstate
    ? ['#', 'Booking reference', 'Buyer', 'Date', 'Net to Owner', 'Payment']
    : ['#', 'Booking reference', 'Guest Name', 'Stay', 'Net to Owner', 'Payment']
  if (anyExtras) headers.push('Contract', 'Stay Report')
  const colCount = headers.length

  return (
    <>
      {/* Desktop / tablet: table */}
      <ScrollHintTable className="hidden sm:block" hint={!forPrint}>
        <table className="w-full text-[13px] min-w-[680px] border-collapse">
          <thead>
            <tr className="border-b border-[#e5e0d8]">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#172338] font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => {
              const hasReport = bookingHasStayReport(b)
              const isOpen = forPrint ? hasReport : expanded.has(b.id)
              return (
                <React.Fragment key={b.id}>
                  <tr className="border-b border-[#e5e0d8] hover:bg-[#FBFAF7]">
                    <td className="px-4 py-3 font-gtsuper-ds text-[#D99330]">{i + 1}.</td>
                    <td className="px-4 py-3 whitespace-nowrap">{b.reference || '—'}</td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">{b.guest || '—'}</td>
                    {isRealEstate ? (
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDate(b.checkIn)}</td>
                    ) : (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                        <div className="text-[11px] font-normal text-[#8C9296]">{b.nights ?? '—'} nights</div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <NetPriceCell b={b} currency={currency} />
                      {!isRealEstate && b.nights ? (
                        <div className="text-[11px] font-normal text-[#8C9296] whitespace-nowrap">
                          {fmtMoney(b.netPrice / b.nights, currency)}/night
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentPlanCell b={b} />
                    </td>
                    {anyExtras && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {b.contractUrl ? <ContractLink url={b.contractUrl} iconOnly /> : <span className="text-[#c9c2b6]">—</span>}
                      </td>
                    )}
                    {anyExtras && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          {b.stayReportUrl && <StayReportLink url={b.stayReportUrl} />}
                          {hasReport && !forPrint && (
                            <button
                              type="button"
                              onClick={() => toggle(b.id)}
                              aria-expanded={isOpen}
                              className={`${FOCUS_RING} inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-[#506A70] hover:text-[#172338]`}
                            >
                              Notes
                              <ChevronRight
                                className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                                strokeWidth={2}
                                aria-hidden
                              />
                            </button>
                          )}
                          {!b.stayReportUrl && !hasReport && <span className="text-[#c9c2b6]">—</span>}
                        </div>
                      </td>
                    )}
                  </tr>
                  {anyExtras && isOpen && hasReport && (
                    <tr className="border-b border-[#e5e0d8] bg-[#FBFAF7]">
                      <td colSpan={colCount} className="px-4 py-4">
                        <StayReportBody b={b} currency={currency} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
          <tfoot>
            {isRealEstate ? (
              <tr className="bg-[#f5f3ef] font-medium">
                <td colSpan={3} className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-[#172338]" colSpan={1}>{fmtMoney(totalNet, currency)}</td>
                <td colSpan={anyExtras ? 4 : 2} />
              </tr>
            ) : (
              <tr className="bg-[#f5f3ef] font-medium">
                <td colSpan={3} className="px-4 py-3">Season Total</td>
                <td className="px-4 py-3">{totalNights} nights</td>
                <td className="px-4 py-3 text-[#172338]">
                  {fmtMoney(totalNet, currency)}
                  <div className="text-[11px] font-normal text-[#8C9296]">{fmtMoney(avgPerNight, currency)}/night</div>
                </td>
                <td colSpan={anyExtras ? 3 : 1} />
              </tr>
            )}
          </tfoot>
        </table>
      </ScrollHintTable>

      {/* Mobile: one card per booking */}
      <div className="sm:hidden flex flex-col gap-3">
        {bookings.map((b, i) => {
          const hasReport = bookingHasStayReport(b)
          const isOpen = forPrint ? hasReport : expanded.has(b.id)
          return (
            <div key={b.id} className="border border-[#e5e0d8] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-gtsuper-ds text-[#D99330]">{i + 1}.</span>
                <PaymentPlanCell b={b} />
              </div>
              <div className="font-medium text-[#172338] mt-1">{b.guest || b.reference || 'Reservation'}</div>
              {!isRealEstate && (
                <div className="text-[13px] text-[#506A70] mt-0.5">
                  {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} · {b.nights ?? '—'} nights
                </div>
              )}
              <div className="text-[13px] mt-2 flex items-center gap-2">
                <span>Net to owner</span>
                <NetPriceCell b={b} currency={currency} />
                {!isRealEstate && b.nights ? <span className="text-[#506A70]">· {fmtMoney(b.netPrice / b.nights, currency)}/night</span> : null}
              </div>
              {(b.contractUrl || b.stayReportUrl || hasReport) && (
                <div className="mt-3 pt-3 border-t border-[#e5e0d8] flex flex-col gap-2">
                  {b.contractUrl && <ContractLink url={b.contractUrl} />}
                  {b.stayReportUrl && <StayReportLink url={b.stayReportUrl} />}
                  {hasReport && !forPrint && (
                    <button
                      type="button"
                      onClick={() => toggle(b.id)}
                      aria-expanded={isOpen}
                      className={`${FOCUS_RING} inline-flex items-center gap-1 self-start text-[11px] uppercase tracking-[0.12em] text-[#506A70] hover:text-[#172338]`}
                    >
                      Notes
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                  )}
                  {hasReport && isOpen && <StayReportBody b={b} currency={currency} />}
                </div>
              )}
            </div>
          )
        })}
        <div className="border border-[#e5e0d8] bg-[#f5f3ef] p-4 text-[13px] font-medium text-[#172338]">
          {isRealEstate
            ? `Total ${fmtMoney(totalNet, currency)}`
            : `Season total ${fmtMoney(totalNet, currency)} · ${totalNights} nights · ${fmtMoney(avgPerNight, currency)}/night`}
        </div>
      </div>
    </>
  )
}

const NEGOTIATIONS_PAGE_SIZE = 10

function OffersTable({
  report,
  forPrint = false,
  year = 'all',
}: {
  report: OwnerReport
  forPrint?: boolean
  year?: number | 'all'
}) {
  const [page, setPage] = useState(1)
  const offers = report.offers.filter((n) => n.amount > 0 && (year === 'all' || recordYear(n) === year))
  const totalPages = Math.max(1, Math.ceil(offers.length / NEGOTIATIONS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  // Print needs every row on one continuous table — there's no way to click "next page" on a PDF.
  const paged = forPrint
    ? offers
    : offers.slice((currentPage - 1) * NEGOTIATIONS_PAGE_SIZE, currentPage * NEGOTIATIONS_PAGE_SIZE)

  const { currency } = report.villa

  if (!offers.length) {
    return (
      <EmptyState>
        {year === 'all'
          ? 'No offers have been sent to prospective guests for this property yet.'
          : `No offers sent in ${year}.`}
      </EmptyState>
    )
  }
  const firstIdx = (currentPage - 1) * NEGOTIATIONS_PAGE_SIZE

  // Offers carry the villa's own stay dates when the sender picked them; otherwise fall back to
  // the date the offer itself was sent.
  const datesLabel = (n: OwnerReport['offers'][number]) =>
    n.checkIn && n.checkOut ? `${fmtDate(n.checkIn)} → ${fmtDate(n.checkOut)}` : fmtDate(n.requestDate)

  return (
    <div>
      {/* Desktop / tablet: table */}
      <ScrollHintTable className="hidden sm:block" hint={!forPrint}>
        <table className="w-full text-[13px] min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-[#e5e0d8]">
              {['#', 'Reference', 'Dates', 'Amount'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#172338] font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((n, i) => (
              <tr key={n.id} className="border-b border-[#e5e0d8] hover:bg-[#FBFAF7]">
                <td className="px-4 py-3 font-gtsuper-ds text-[#D99330]">{firstIdx + i + 1}.</td>
                <td className="px-4 py-3 whitespace-nowrap">{n.reference || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{datesLabel(n)}</td>
                <td className="px-4 py-3 font-medium text-[#172338] whitespace-nowrap">{fmtMoney(n.amount, n.currency || currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollHintTable>

      {/* Mobile: one card per offer */}
      <div className="sm:hidden flex flex-col gap-3">
        {paged.map((n, i) => (
          <div key={n.id} className="border border-[#e5e0d8] bg-white p-4">
            <span className="font-gtsuper-ds text-[#D99330]">{firstIdx + i + 1}.</span>
            <div className="font-medium text-[#172338] mt-1">{n.reference || 'Offer'}</div>
            <div className="text-[13px] text-[#506A70] mt-1">{datesLabel(n)}</div>
            <div className="text-[13px] mt-2">
              <b className="text-[#172338]">{fmtMoney(n.amount, n.currency || currency)}</b>
            </div>
          </div>
        ))}
      </div>

      {!forPrint && totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-[#9a8f80]">
            {firstIdx + 1}–{Math.min(currentPage * NEGOTIATIONS_PAGE_SIZE, offers.length)} of {offers.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`${FOCUS_RING} h-8 w-8 flex items-center justify-center border border-[#e5e0d8] text-[#172338] hover:border-[#D99330] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm`}
            >
              ‹
            </button>
            <span className="text-xs text-[#172338] px-2">{currentPage} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`${FOCUS_RING} h-8 w-8 flex items-center justify-center border border-[#e5e0d8] text-[#172338] hover:border-[#D99330] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm`}
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function negotiationStatusTone(status: string): PillTone {
  if (status === 'WON') return 'teal'
  if (status === 'LOST') return 'rust'
  return 'gold'
}

const NEGOTIATION_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Open',
  WON: 'Booked',
  LOST: 'Not Booked',
}

function negotiationStatusLabel(status: string): string {
  return NEGOTIATION_STATUS_LABEL[status] || status
}

export function NegotiationsTable({
  report,
  forPrint = false,
  year = 'all',
}: {
  report: OwnerReport
  forPrint?: boolean
  year?: number | 'all'
}) {
  const [page, setPage] = useState(1)
  const [openNote, setOpenNote] = useState<{ reference: string; text: string } | null>(null)
  const negotiations = report.negotiations.filter((n) => year === 'all' || recordYear(n) === year)
  const totalPages = Math.max(1, Math.ceil(negotiations.length / NEGOTIATIONS_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  // Print needs every row on one continuous table — there's no way to click "next page" on a PDF.
  const paged = forPrint
    ? negotiations
    : negotiations.slice((currentPage - 1) * NEGOTIATIONS_PAGE_SIZE, currentPage * NEGOTIATIONS_PAGE_SIZE)

  const { currency } = report.villa

  if (!negotiations.length) {
    return (
      <EmptyState>
        {year === 'all'
          ? 'No negotiations are currently in progress for this property.'
          : `No negotiations in ${year}.`}
      </EmptyState>
    )
  }
  const firstIdx = (currentPage - 1) * NEGOTIATIONS_PAGE_SIZE
  // Hide the Reference column entirely when no negotiation carries a reference code.
  const showReference = negotiations.some((n) => !!n.reference && n.reference.trim() !== '')

  return (
    <div>
      {/* Desktop / tablet: table */}
      <ScrollHintTable className="hidden sm:block" hint={!forPrint}>
        <table className="w-full text-[13px] min-w-[1200px] border-collapse">
          <thead>
            <tr className="border-b border-[#e5e0d8]">
              {['#', ...(showReference ? ['Reference'] : []), 'Enquiry received', 'Stay', 'Official Net / Night', 'Official Net Total', '% Discount on Net', 'Avg Discounted Net / Night', 'Discounted Net Total', 'Status', 'Notes'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.14em] text-[#172338] font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((n, i) => {
              const officialNetTotal = n.officialNetPerNight != null ? n.officialNetPerNight * n.nights : null
              // Clamped at 0 — if the deal closed above the official rate there was no discount, not
              // a "negative discount".
              const discountPct =
                officialNetTotal && officialNetTotal > 0 ? Math.max(0, Math.floor(((officialNetTotal - n.amount) / officialNetTotal) * 100)) : null
              return (
                <tr key={n.id} className="border-b border-[#e5e0d8] hover:bg-[#FBFAF7]">
                  <td className="px-4 py-3 font-gtsuper-ds text-[#D99330]">{firstIdx + i + 1}.</td>
                  {showReference && <td className="px-4 py-3 whitespace-nowrap">{n.reference || '—'}</td>}
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDate(n.requestDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {fmtDate(n.checkIn)} → {fmtDate(n.checkOut)}
                    <div className="text-[11px] font-normal text-[#8C9296]">{n.nights || '—'} nights</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{n.officialNetPerNight != null ? fmtMoney(n.officialNetPerNight, currency) : '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{officialNetTotal != null ? fmtMoney(officialNetTotal, currency) : '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{discountPct != null ? `${discountPct}%` : '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{n.nights ? fmtMoney(n.avgPerNight, currency) : '—'}</td>
                  <td className="px-4 py-3 font-medium text-[#172338] whitespace-nowrap">{fmtMoney(n.amount, currency)}</td>
                  <td className="px-4 py-3"><Pill tone={negotiationStatusTone(n.status)}>{negotiationStatusLabel(n.status)}</Pill></td>
                  <td className="px-4 py-3 text-[#4A4A46] max-w-[200px]">
                    {n.info ? (
                      forPrint ? (
                        <span className="whitespace-pre-wrap">{n.info}</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenNote({ reference: n.reference || `Negotiation ${firstIdx + i + 1}`, text: n.info as string })}
                          className={`${FOCUS_RING} inline-flex items-center gap-1.5 text-[#172338] hover:text-[#D99330] transition-colors`}
                          aria-label="View note"
                        >
                          <Eye size={15} />
                          <span className="text-xs">View</span>
                        </button>
                      )
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ScrollHintTable>

      {/* Mobile: one card per negotiation */}
      <div className="sm:hidden flex flex-col gap-3">
        {paged.map((n, i) => {
          const officialNetTotal = n.officialNetPerNight != null ? n.officialNetPerNight * n.nights : null
          const discountPct =
            officialNetTotal && officialNetTotal > 0 ? Math.max(0, Math.floor(((officialNetTotal - n.amount) / officialNetTotal) * 100)) : null
          return (
            <div key={n.id} className="border border-[#e5e0d8] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="font-gtsuper-ds text-[#D99330]">{firstIdx + i + 1}.</span>
                <Pill tone={negotiationStatusTone(n.status)}>{negotiationStatusLabel(n.status)}</Pill>
              </div>
              <div className="font-medium text-[#172338] mt-1">{n.reference || 'Negotiation'}</div>
              <div className="text-[13px] text-[#506A70] mt-1">
                {fmtDate(n.checkIn)} → {fmtDate(n.checkOut)} · {n.nights || '—'} nights
              </div>
              <div className="text-[13px] mt-2">
                <b className="text-[#172338]">{fmtMoney(n.amount, currency)}</b>
                {n.nights ? <span className="text-[#506A70]"> · {fmtMoney(n.avgPerNight, currency)}/night</span> : null}
              </div>
              {n.officialNetPerNight != null && (
                <div className="text-[12px] text-[#506A70] mt-1">
                  Official net/night <b className="text-[#172338]">{fmtMoney(n.officialNetPerNight, currency)}</b>
                  {officialNetTotal != null && (
                    <>
                      {' '}· total <b className="text-[#172338]">{fmtMoney(officialNetTotal, currency)}</b>
                    </>
                  )}
                  {discountPct != null && (
                    <>
                      {' '}· <b className="text-[#172338]">{discountPct}%</b> discount
                    </>
                  )}
                </div>
              )}
              {n.info && <p className="text-[12.5px] text-[#4A4A46] mt-2 whitespace-pre-wrap">{n.info}</p>}
            </div>
          )
        })}
      </div>

      {!forPrint && totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-[#9a8f80]">
            {firstIdx + 1}–{Math.min(currentPage * NEGOTIATIONS_PAGE_SIZE, negotiations.length)} of {negotiations.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={`${FOCUS_RING} h-8 w-8 flex items-center justify-center border border-[#e5e0d8] text-[#172338] hover:border-[#D99330] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm`}
            >
              ‹
            </button>
            <span className="text-xs text-[#172338] px-2">{currentPage} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={`${FOCUS_RING} h-8 w-8 flex items-center justify-center border border-[#e5e0d8] text-[#172338] hover:border-[#D99330] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm`}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {openNote && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpenNote(null)}
        >
          <div
            className="bg-white max-w-lg w-full max-h-[85vh] overflow-y-auto rounded shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4 mb-4">
              <h2 className="text-lg font-medium text-[#172338]">{openNote.reference}</h2>
              <button
                type="button"
                onClick={() => setOpenNote(null)}
                className="text-[#9a8f80] hover:text-[#172338] shrink-0"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <p className="text-sm text-[#4A4A46] whitespace-pre-wrap">{openNote.text}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function RecommendationsList({ report }: { report: OwnerReport }) {
  if (!report.recommendations.length) return null
  const priorityTone = (p: string): PillTone => (p === 'HIGH' ? 'rust' : p === 'LOW' ? 'teal' : 'gold')
  const statusTone = (s: string): PillTone => (s === 'APPROVED' ? 'ink' : s === 'DONE' ? 'teal' : 'gold')
  return (
    <div className="flex flex-col border border-[#D99330]">
      {report.recommendations.map((r, i) => (
        <div key={r.id} className="grid grid-cols-1 md:grid-cols-[80px_1fr_auto] gap-5 items-center px-6 py-6 border-b border-[#e5e0d8] last:border-b-0">
          <div className="font-gtsuper-ds text-5xl md:text-6xl leading-none font-light" style={{ color: TEAL }}>{i + 1}</div>
          <div>
            <h3 className="font-gtsuper-ds text-xl font-medium mb-1.5">{r.title}</h3>
            <p className="text-[15px] leading-relaxed text-[#4A4A46] max-w-xl">{r.details}</p>
          </div>
          <div className="flex flex-row md:flex-col gap-2 items-start md:items-end text-left md:text-right">
            <Pill tone={priorityTone(r.priority)}>{r.priority} priority</Pill>
            <Pill tone={statusTone(r.status)}>{r.status}</Pill>
            {r.estCost != null && (
              <div className="font-gtsuper-ds text-[#172338]">
                {fmtMoney(r.estCost, report.villa.currency)}
                <small className="block font-sans text-[8.5px] uppercase tracking-[0.18em] text-[#506A70] font-normal mt-0.5">estimated</small>
              </div>
            )}
            {r.pdfUrl && (
              <a
                href={resolveMediaUrl(r.pdfUrl) ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={`${FOCUS_RING} inline-flex items-center gap-1.5 text-[13px] font-medium hover:underline`}
                style={{ color: TEAL }}
              >
                <FileText className="w-3.5 h-3.5" />
                View PDF
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

const SkeletonBlock = ({ className = '' }: { className?: string }) => (
  <div className={`bg-[#EDEAE3] animate-pulse ${className}`} aria-hidden />
)

const ReportSkeleton = () => (
  <div className="flex flex-col gap-16" aria-busy="true" aria-label="Loading report">
    <div>
      <SkeletonBlock className="h-4 w-32 mb-3" />
      <SkeletonBlock className="h-10 w-2/3 max-w-md mb-4" />
      <SkeletonBlock className="h-3 w-48 mb-8" />
      <SkeletonBlock className="w-full h-[200px] md:h-[320px]" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px border border-[#e5e0d8]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-3 py-6 flex flex-col items-center gap-2">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-2 w-20" />
        </div>
      ))}
    </div>
    <SkeletonBlock className="h-16 w-full" />
    <SkeletonBlock className="h-52 w-full" />
    <SkeletonBlock className="h-40 w-full" />
  </div>
)

// Villa specs (bedrooms / baths / guests / area / amenities) don't come from the owner-report
// endpoint, so we pull them from the public property record and render whatever is present.
type VillaSpecs = {
  bedrooms: number | null
  baths: number | null
  guests: number | null
  indoorArea: number | null
  outdoorArea: number | null
  amenities: string[]
}

function numOrNull(v: unknown): number | null {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

function parseAmenityList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean)
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

function extractVillaSpecs(data: any): VillaSpecs {
  const c = data?.classification ?? {}
  return {
    bedrooms: numOrNull(c.bedrooms ?? data?.bedrooms),
    baths: numOrNull(c.baths),
    guests: numOrNull(c.maxPersons ?? c.idealPersons ?? data?.guests),
    indoorArea: numOrNull(c.indoorArea ?? data?.indoor_area),
    outdoorArea: numOrNull(c.outdoorArea),
    amenities: [...parseAmenityList(data?.outdoorAmenities), ...parseAmenityList(data?.indoorAmenities)],
  }
}

function VillaSpecsStrip({ specs }: { specs: VillaSpecs }) {
  const metrics: { icon: React.ReactNode; label: string }[] = []
  if (specs.bedrooms) metrics.push({ icon: <BedDouble className="h-4 w-4" strokeWidth={1.75} aria-hidden />, label: `${specs.bedrooms} Bedroom${specs.bedrooms === 1 ? '' : 's'}` })
  if (specs.baths) metrics.push({ icon: <Bath className="h-4 w-4" strokeWidth={1.75} aria-hidden />, label: `${specs.baths} Bath${specs.baths === 1 ? '' : 's'}` })
  if (specs.guests) metrics.push({ icon: <Users className="h-4 w-4" strokeWidth={1.75} aria-hidden />, label: `${specs.guests} Guests` })
  const area = specs.indoorArea && specs.outdoorArea
    ? `${specs.indoorArea} + ${specs.outdoorArea} m²`
    : specs.indoorArea
      ? `${specs.indoorArea} m²`
      : null
  if (area) metrics.push({ icon: <Maximize className="h-4 w-4" strokeWidth={1.75} aria-hidden />, label: area })

  if (metrics.length === 0 && specs.amenities.length === 0) return null

  return (
    <div className="mt-5 border-t border-[#e5e0d8] pt-4 flex flex-col gap-3">
      {metrics.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#172338]">
          {metrics.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="text-[#D99330]">{m.icon}</span>
              {m.label}
            </span>
          ))}
        </div>
      )}
      {specs.amenities.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-1.5">
          {specs.amenities.map((a, i) => (
            <span key={i} className="text-[10px] uppercase tracking-[0.12em] text-[#506A70] border border-[#e5e0d8] px-2 py-1">
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function SingleOwnerReport({
  propertyId,
  viewToken,
  linkToken,
  onLoaded,
  forPrint = false,
  headerAction,
}: {
  /** Required unless `linkToken` is set — the short-link flow resolves the property server-side. */
  propertyId?: string
  viewToken?: string
  /** Short share-link token (see ownerReportLinkService) — `owner-report/:slug?token=:linkToken`.
   * When set, the report is fetched by token instead of by propertyId/viewToken. */
  linkToken?: string
  onLoaded?: (report: OwnerReport) => void
  /** Routes hero/gallery images through the resize proxy — see resolvePrintImageUrl. Only the
   * print-only PDF page sets this; the live report keeps loading full-size photos as normal. */
  forPrint?: boolean
  /** Rendered inline with the "Live Owner Report" badge — the standalone page uses this slot
   * for its Download PDF button so the two sit on the same line. */
  headerAction?: React.ReactNode
}) {
  const [report, setReport] = useState<OwnerReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [specs, setSpecs] = useState<VillaSpecs | null>(null)
  const [offersYear, setOffersYear] = useState<number | 'all'>('all')
  const [negotiationsYear, setNegotiationsYear] = useState<number | 'all'>('all')
  // null = "not touched by the user yet" — defaults to the current season for villas (matching
  // the page's pre-existing behaviour) and to all-time for real estate (lifetime deals, no season).
  const [bookingsYear, setBookingsYear] = useState<number | 'all' | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const fetchReport = linkToken ? getOwnerPropertyReportByLink(linkToken) : getOwnerPropertyReport(propertyId!, viewToken)
    fetchReport.then((res: any) => {
      if (cancelled) return
      if (res?.success === false || !res?.data) {
        setError(res?.message || 'Could not load this report.')
      } else {
        // Defensive against an API that hasn't rolled out the negotiations field yet (older deploy) —
        // fall back to an empty pipeline rather than crashing the whole report.
        const data = res.data as OwnerReport
        const normalized: OwnerReport = {
          ...data,
          currentYear: data.currentYear ?? new Date().getFullYear(),
          villa: {
            ...data.villa,
            suggestedRates: data.villa?.suggestedRates || [],
            suggestedRatesYear: data.villa?.suggestedRatesYear ?? new Date().getFullYear() + 1,
          },
          bookings: data.bookings || [],
          negotiations: data.negotiations || [],
          offers: data.offers || [],
          recommendations: data.recommendations || [],
          yearlyPerformance: data.yearlyPerformance || [],
          stats: {
            totalNet: data.stats?.totalNet ?? 0,
            totalNights: data.stats?.totalNights ?? 0,
            avgPerNight: data.stats?.avgPerNight ?? 0,
            bookingCount: data.stats?.bookingCount ?? 0,
            negotiationsCount: data.stats?.negotiationsCount ?? 0,
            negotiationsValue: data.stats?.negotiationsValue ?? 0,
          },
        }
        setReport(normalized)
        onLoaded?.(normalized)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, viewToken, linkToken])

  // In the short-link flow the caller doesn't know the real propertyId up front — wait for the
  // report response to resolve it (report.villa.id) rather than requiring it as a prop.
  const resolvedPropertyId = linkToken ? report?.villa.id : propertyId

  useEffect(() => {
    if (!resolvedPropertyId) return
    let cancelled = false
    setSpecs(null)
    getProperty(resolvedPropertyId)
      .then((res: any) => {
        if (cancelled) return
        const data = res?.data || res
        if (data && typeof data === 'object') setSpecs(extractVillaSpecs(data))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [resolvedPropertyId])

  if (loading) {
    return <ReportSkeleton />
  }
  if (error || !report) {
    return <EmptyState>{error || 'Report unavailable.'}</EmptyState>
  }

  // Real-estate reports are framed around lifetime deals, not a season — leave them whole.
  const displayReport = report.villa.isRealEstate ? report : scopeReportToSeason(report)
  const offersCount = displayReport.offers.filter((n) => n.amount > 0).length
  const offersYears = Array.from(
    new Set(
      displayReport.offers
        .filter((n) => n.amount > 0)
        .map(recordYear)
        .filter((y): y is number => y != null),
    ),
  ).sort((a, b) => b - a)
  const negotiationsYears = Array.from(
    new Set(displayReport.negotiations.map(recordYear).filter((y): y is number => y != null)),
  ).sort((a, b) => b - a)
  const bookingsYears = Array.from(
    new Set(report.bookings.map((b) => yearOf(b.checkIn)).filter((y): y is number => y != null)),
  ).sort((a, b) => b - a)

  const isRealEstate = displayReport.villa.isRealEstate
  const effectiveBookingsYear: number | 'all' = bookingsYear ?? (isRealEstate ? 'all' : displayReport.currentYear)
  const filteredBookings =
    effectiveBookingsYear === 'all'
      ? report.bookings
      : report.bookings.filter((b) => yearOf(b.checkIn) === effectiveBookingsYear)
  const heroPhoto = displayReport.villa.photos[0]
    ? forPrint
      ? resolvePrintImageUrl(displayReport.villa.photos[0], 900)
      : resolveMediaUrl(displayReport.villa.photos[0])
    : null
  const galleryPhotos = displayReport.villa.photos.slice(1, 5)
  const updatedLabel = new Date(displayReport.generatedAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const hasHistory = !isRealEstate && displayReport.yearlyPerformance.some((d) => d.year !== displayReport.currentYear)
  const hasRates = !isRealEstate && displayReport.villa.rates.length > 0
  const hasSuggestedRates = !isRealEstate && displayReport.villa.suggestedRates.length > 0
  const hasRecs = displayReport.recommendations.length > 0

  // Staff-editable per-villa override (Loggia's Property Management > Sections tab) — "summary" is
  // never hideable, it's the report's own header.
  const hiddenSections = new Set(
    (displayReport.villa.hiddenSections || []).filter((id) => id !== 'summary')
  )
  const isSectionHidden = (id: string) => hiddenSections.has(id)

  const navItems: NavItem[] = [
    { id: 'summary', label: 'Summary' },
    ...(!isRealEstate ? [{ id: 'calendar', label: 'Calendar' }] : []),
    ...(!isRealEstate ? [{ id: 'revenue', label: 'Revenue' }] : []),
    ...(hasHistory ? [{ id: 'history', label: 'History' }] : []),
    ...(hasRates ? [{ id: 'rates', label: 'Rates' }] : []),
    ...(hasSuggestedRates ? [{ id: 'suggested-rates', label: `${displayReport.villa.suggestedRatesYear} Rates` }] : []),
    { id: 'bookings', label: isRealEstate ? 'Deals' : 'Bookings' },
    { id: 'negotiations', label: 'Negotiations' },
    { id: 'offers', label: 'Offers' },
    ...(hasRecs ? [{ id: 'recommendations', label: 'Care' }] : []),
    ...(!isRealEstate ? [{ id: 'live-availability', label: 'Live Calendar' }] : []),
  ].filter((item) => !isSectionHidden(item.id))

  return (
    <div className="flex flex-col gap-14">
      <div>
        <div className="flex items-center justify-between gap-4 mb-5">
          <span className="inline-flex items-center gap-2.5 rounded-full bg-[#5AA1AC] px-5 py-2.5 text-[12px] uppercase tracking-[0.28em] text-white">
            <span className={`h-2 w-2 rounded-full bg-white ${forPrint ? '' : 'animate-pulse'}`} aria-hidden />
            Live Owner Report
          </span>
          {headerAction}
        </div>
        <h1 className="font-gtsuper-ds text-4xl md:text-5xl font-light uppercase text-[#172338]">{displayReport.villa.name}</h1>
        {displayReport.villa.location && (
          <div className="text-sm text-[#506A70] mt-2">
            {isRealEstate ? 'Property for sale' : 'Prestigious luxury villa'} · {displayReport.villa.location}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-[10px] uppercase tracking-[0.2em] text-[#506A70]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" strokeWidth={2} aria-hidden />
            Updated <b className="text-[#172338]">{updatedLabel}</b>
          </span>
        </div>
        {heroPhoto && (
          <img
            src={heroPhoto}
            alt={displayReport.villa.name}
            className="pdf-hero-image-area w-full h-[200px] md:h-[320px] object-cover mt-6 bg-[#f4f1ec]"
          />
        )}
        {galleryPhotos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2" data-pdf-export-block="true">
            {galleryPhotos.map((p, i) => (
              <img key={i} src={forPrint ? resolvePrintImageUrl(p, 300) : resolveMediaUrl(p)} alt="" className="w-full h-[110px] md:h-[130px] object-cover bg-[#f4f1ec]" loading="lazy" />
            ))}
          </div>
        )}
        {specs && <VillaSpecsStrip specs={specs} />}
      </div>

      <SectionNav items={navItems} updatedLabel={updatedLabel} />

      <section id="summary" className="scroll-mt-16" data-pdf-export-block="true">
        <SectionHead
          script="The headline numbers"
          title={isRealEstate ? 'Deal Summary' : 'Season Summary'}
        />
        <KpiStrip report={displayReport} />
      </section>

      {!isRealEstate && !isSectionHidden('calendar') && (
        <section id="calendar" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="Season at a glance"
            title="The Season Calendar"
            note="Every reserved block held on the villa's availability calendar — owner stays, options and confirmed bookings alike, so the count can differ from confirmed bookings below. Hover or focus a block for its dates."
          />
          <SeasonStrip report={displayReport} />
        </section>
      )}

      {!isRealEstate && !isSectionHidden('revenue') && (
        <section id="revenue" className="owner-report-pdf-fullbleed scroll-mt-16 relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-[#F4F1EC] py-12 overflow-hidden">
          <div className="max-w-[1140px] mx-auto px-4 sm:px-6" data-pdf-export-block="true">
            <SectionHead script="Month by month" title="Net Revenue by Month" note="By check-in month · all figures net to owner." />
            <MonthlyBars report={displayReport} />
          </div>
        </section>
      )}

      {hasHistory && !isSectionHidden('history') && (
        <section id="history" className="scroll-mt-16 flex flex-col gap-8" data-pdf-export-block="true">
          <SectionHead
            script="Year over year"
            title="Performance History"
            note={`The villa's performance across ${displayReport.yearlyPerformance.length} seasons with Kennedy's Group · ${displayReport.currentYear} season in progress.`}
          />
          <YearlyPerformanceBars data={displayReport.yearlyPerformance} currentYear={displayReport.currentYear} currency={displayReport.villa.currency} />
          <YearlyPerformanceTable data={displayReport.yearlyPerformance} currentYear={displayReport.currentYear} currency={displayReport.villa.currency} />
          <YearlyPerformanceInsights
            data={displayReport.yearlyPerformance}
            currentYear={displayReport.currentYear}
            negotiationsCount={displayReport.stats.negotiationsCount}
            negotiationsValue={displayReport.stats.negotiationsValue}
            currency={displayReport.villa.currency}
          />
        </section>
      )}

      {hasRates && !isSectionHidden('rates') && (
        <section id="rates" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="Gross to net"
            title={`Official Rate Card ${displayReport.currentYear}`}
            note="The agreed gross-to-net structure per night for each period. Rack is the published rate; Net to owner is what reaches you after management fee and agency commission."
          />
          <RateCardTable rows={displayReport.villa.rates} currency={displayReport.villa.currency} forPrint={forPrint} />
        </section>
      )}

      {hasSuggestedRates && !isSectionHidden('suggested-rates') && (
        <section id="suggested-rates" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="Looking ahead"
            title={`Suggested Rates for ${displayReport.villa.suggestedRatesYear}`}
            note="Forecast pricing for next season, proposed by your management team ahead of the official rate card."
          />
          <RateCardTable
            rows={displayReport.villa.suggestedRates}
            currency={displayReport.villa.currency}
            forPrint={forPrint}
          />
        </section>
      )}

      {!isSectionHidden('bookings') && (
        <section id="bookings" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="Confirmed"
            title={isRealEstate ? 'Deals' : 'Bookings'}
            note={isRealEstate ? `${filteredBookings.length} confirmed deals` : `${filteredBookings.length} confirmed bookings`}
          />
          {!forPrint && <YearTags years={bookingsYears} selected={effectiveBookingsYear} onSelect={setBookingsYear} />}
          <BookingsTable
            bookings={filteredBookings}
            currency={displayReport.villa.currency}
            isRealEstate={isRealEstate}
            forPrint={forPrint}
            year={effectiveBookingsYear}
          />
        </section>
      )}

      {!isSectionHidden('negotiations') && (
        <section id="negotiations" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="In discussion"
            title="Negotiations"
            note={
              displayReport.negotiations.length
                ? `${displayReport.stats.negotiationsCount} negotiation${displayReport.stats.negotiationsCount === 1 ? '' : 's'} open`
                : undefined
            }
          />
          {!forPrint && <YearTags years={negotiationsYears} selected={negotiationsYear} onSelect={setNegotiationsYear} />}
          <NegotiationsTable report={displayReport} forPrint={forPrint} year={forPrint ? 'all' : negotiationsYear} />
        </section>
      )}

      {!isSectionHidden('offers') && (
        <section id="offers" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="Sent to guests"
            title="Offers"
            note={
              offersCount
                ? `Your property has been proposed ${offersCount} time${offersCount === 1 ? '' : 's'} to clients and agents in response to their villa enquiries.`
                : undefined
            }
          />
          {!forPrint && <YearTags years={offersYears} selected={offersYear} onSelect={setOffersYear} />}
          <OffersTable report={displayReport} forPrint={forPrint} year={forPrint ? 'all' : offersYear} />
        </section>
      )}

      {hasRecs && !isSectionHidden('recommendations') && (
        <section id="recommendations" className="scroll-mt-16" data-pdf-export-block="true">
          <SectionHead
            script="Caring for your property"
            title="Improvement Recommendations"
            note={`Our on-the-ground team's suggestions to protect the property's value${isRealEstate ? ' and support the asking price' : ' and lift future rates'}.`}
          />
          <RecommendationsList report={displayReport} />
        </section>
      )}

      {!isRealEstate && !isSectionHidden('live-availability') && (
        <section id="live-availability" className="scroll-mt-16 pdf-exclude-from-capture">
          <SectionHead script="Always in sync" title="Live Availability" />
          <div className="border border-[#e5e0d8] bg-white p-4 md:p-8">
            <AvailabilityCalendar blockedDates={displayReport.villa.blockedDates} showPrices={false} dayCellClassName="h-12" />
          </div>
        </section>
      )}
    </div>
  )
}

export function OwnerReportSection({ properties }: { properties: OwnedPropertySummary[] }) {
  if (!properties.length) {
    return <EmptyState>No properties are linked to your account yet.</EmptyState>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1">
        <h2 className="font-gtsuper-ds text-xl font-light text-[#172338] mb-1">Your properties</h2>
        <p className="text-xs text-[#9a8f80]">Opens the full report in a new tab</p>
      </div>
      {properties.map((p) => (
        <a
          key={p.id}
          href={`/owner-report/${p.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 border border-[#e5e0d8] bg-white px-6 py-5 hover:border-[#172338] transition-colors group"
        >
          <div>
            <div className="font-gtsuper-ds text-lg font-light text-[#172338]">{p.title}</div>
            {p.location && <div className="text-xs text-[#506A70] mt-1">{p.location}</div>}
          </div>
          <ChevronRight size={16} strokeWidth={1.5} className="text-[#9a8f80] group-hover:text-[#172338] shrink-0" />
        </a>
      ))}
    </div>
  )
}

export default OwnerReportSection
