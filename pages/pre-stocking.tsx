import React, { useEffect, useMemo, useRef, useState } from 'react'
import { format } from 'date-fns'
import Navbar from '@/components/custom/Navbar'
import Footer from '@/components/custom/footerNew'
import { SeoHead } from '@/components/seo/SeoHead'
import { SITE_NAME } from '@/lib/seo/config'
import { GROCERY_CATEGORIES, BEVERAGE_CATEGORIES } from '@/lib/data/preStockingCatalog'
import { getCalendarDays, isSameCalendarDay, parseYmdLocal, toLocalDateKey } from '@/lib/villaStayCalendar'
import { Minus, Plus, ChevronDown, ChevronLeft, ChevronRight, CalendarDays, X, Check, Search } from 'lucide-react'
import { mutateAPI } from '@/lib/api/fetcher'
import { fetchPageByKeyServer } from '@/lib/api/pages'
import type { GetServerSideProps } from 'next'

// Fallback address for the "Open in my email app" mailto link only.
const CONCIERGE_EMAIL = 'concierge@kennedysgroup.com'

/* ─── Data model ──────────────────────────────────────────────────────── */

type CartLine = { qty: number; name: string; price: number | null; cat: string }

const eur = (n: number) => '€' + n.toFixed(2).replace(/\.00$/, '')
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

function buildInitialCart(): Record<string, CartLine> {
  const cart: Record<string, CartLine> = {}
  GROCERY_CATEGORIES.forEach((sec, si) => {
    sec.items.forEach((name, ii) => {
      cart[`g${si}-${ii}`] = { qty: 0, name, price: null, cat: sec.c }
    })
  })
  BEVERAGE_CATEGORIES.forEach((cat, ci) => {
    cat.groups.forEach((grp, gi) => {
      grp.items.forEach((it, ii) => {
        cart[`b${ci}-${gi}-${ii}`] = { qty: 0, name: it.n, price: it.p, cat: cat.c }
      })
    })
  })
  return cart
}

const ALL_CATEGORY_NAMES = [...GROCERY_CATEGORIES.map(g => g.c), ...BEVERAGE_CATEGORIES.map(b => b.c)]

/* ─── Guest fields ────────────────────────────────────────────────────── */

type GuestFields = {
  name: string
  email: string
  villa: string
  arrival: string
  departure: string
  guests: string
  occasion: string
  dietary: string
}

const EMPTY_GUEST: GuestFields = {
  name: '', email: '', villa: '', arrival: '', departure: '', guests: '', occasion: '', dietary: '',
}

/* ─── Small UI atoms (mirrors contact-us.tsx conventions) ────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className='mb-2 block font-haas text-[13px] font-light text-[#172338]'>{children}</label>
}

const INPUT_CLASS =
  'w-full h-12 rounded-none border border-[#172338]/20 bg-white px-4 font-haas font-light text-[15px] text-[#172338] placeholder:text-[#172338]/35 transition-colors focus:border-[#172338] focus:outline-none'

function Stepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  return (
    <div className='flex h-9 shrink-0 items-center border border-[#172338]/20 bg-white'>
      <button
        type='button'
        aria-label='Remove one'
        onClick={() => onChange(Math.max(0, qty - 1))}
        className='flex h-full w-8 items-center justify-center text-[#172338] transition-colors hover:bg-[#F5F7FA] disabled:opacity-30'
        disabled={qty <= 0}
      >
        <Minus size={13} />
      </button>
      <input
        type='text'
        inputMode='numeric'
        value={qty}
        onChange={(e) => onChange(Math.max(0, Math.min(999, parseInt(e.target.value, 10) || 0)))}
        aria-label='Quantity'
        className='h-full w-9 border-x border-[#172338]/10 bg-transparent text-center font-haas text-[13px] text-[#172338] focus:outline-none'
      />
      <button
        type='button'
        aria-label='Add one'
        onClick={() => onChange(qty + 1)}
        className='flex h-full w-8 items-center justify-center text-[#172338] transition-colors hover:bg-[#F5F7FA]'
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

/* ─── Custom date field (replaces native <input type="date"> picker) ─── */

function DateField({
  value,
  onChange,
  minDate,
  placeholder = 'Select date',
}: {
  value: string
  onChange: (ymd: string) => void
  minDate?: Date | null
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseYmdLocal(value) : null
  const [month, setMonth] = useState(() => {
    const base = selected || minDate || new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const floorDate = (d: Date) => {
    const c = new Date(d)
    c.setHours(0, 0, 0, 0)
    return c
  }
  const minFloor = minDate ? floorDate(minDate) : null

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='flex h-12 w-full items-center justify-between border border-[#172338]/20 bg-white px-4 font-haas font-light text-[15px] transition-colors focus:border-[#172338] focus:outline-none'
      >
        <span className={selected ? 'text-[#172338]' : 'text-[#172338]/35'}>
          {selected ? format(selected, 'MMM d, yyyy') : placeholder}
        </span>
        <CalendarDays size={16} className='shrink-0 text-[#506A70]' />
      </button>

      {open && (
        <div className='absolute left-0 top-full z-[80] mt-1.5 w-[280px] border border-[#172338]/15 bg-white p-4 shadow-lg'>
          <div className='mb-3 flex items-center justify-between'>
            <button
              type='button'
              onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className='p-1 text-[#172338] transition-colors hover:bg-[#F5F5F0]'
              aria-label='Previous month'
            >
              <ChevronLeft size={16} />
            </button>
            <span className='font-haas text-[12px] uppercase tracking-[0.14em] text-[#172338]'>
              {format(month, 'MMMM yyyy')}
            </span>
            <button
              type='button'
              onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className='p-1 text-[#172338] transition-colors hover:bg-[#F5F5F0]'
              aria-label='Next month'
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className='grid grid-cols-7'>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className='py-1 text-center font-haas text-[10.5px] font-light text-[#506A70]'>
                {d}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-7'>
            {getCalendarDays(month.getFullYear(), month.getMonth()).map((day, i) => {
              if (!day) return <div key={`e-${i}`} />
              const disabled = !!minFloor && floorDate(day) < minFloor
              const isSelected = selected && isSameCalendarDay(day, selected)
              return (
                <button
                  key={toLocalDateKey(day)}
                  type='button'
                  disabled={disabled}
                  onClick={() => { onChange(toLocalDateKey(day)); setOpen(false) }}
                  className={[
                    'py-1.5 text-center font-haas text-[13px] font-light transition-colors',
                    disabled ? 'cursor-not-allowed text-[#172338]/20' : 'cursor-pointer text-[#172338] hover:bg-[#F5F5F0]',
                    isSelected ? '!bg-[#172338] !text-white' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
          {selected && (
            <button
              type='button'
              onClick={() => { onChange(''); setOpen(false) }}
              className='mt-3 font-haas text-[11.5px] font-light text-[#506A70] underline underline-offset-4 hover:text-[#172338]'
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Category section (accordion) ───────────────────────────────────── */

function CategorySection({
  name,
  defaultOpen,
  count,
  hidden,
  forceOpen,
  children,
}: {
  name: string
  defaultOpen?: boolean
  count: number
  hidden: boolean
  forceOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  const effectiveOpen = open || !!forceOpen
  return (
    <section id={`sec-${slug(name)}`} className={hidden ? 'hidden' : 'border border-[#172338]/12 bg-white'}>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        className='flex w-full items-center gap-3 px-5 py-4 text-left'
      >
        <h3 className='flex-1 font-gtsuper-ds text-[19px] font-light text-[#172338]'>{name}</h3>
        {count > 0 && (
          <span className='rounded-full bg-[#D99330]/12 px-2.5 py-0.5 font-haas text-[11px] font-normal text-[#B27626]'>
            {count}
          </span>
        )}
        <ChevronDown size={16} className={`text-[#506A70] transition-transform ${effectiveOpen ? 'rotate-180' : ''}`} />
      </button>
      {effectiveOpen && <div className='border-t border-[#172338]/10 px-5 pb-5 pt-1'>{children}</div>}
    </section>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────── */

type PreStockingPageProps = {
  initialSeoMeta?: { title?: string | null; description?: string | null; imageUrl?: string | null };
};

const PreStockingPage = ({ initialSeoMeta }: PreStockingPageProps) => {
  const [cart, setCart] = useState<Record<string, CartLine>>(() => buildInitialCart())
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [guest, setGuest] = useState<GuestFields>(EMPTY_GUEST)
  const [search, setSearch] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [copied, setCopied] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  const setQty = (id: string, qty: number) => {
    setCart(prev => ({ ...prev, [id]: { ...prev[id], qty } }))
  }

  const q = search.trim().toLowerCase()

  const categoryMatch = useMemo(() => {
    if (!q) return null
    const map: Record<string, boolean> = {}
    GROCERY_CATEGORIES.forEach(sec => {
      map[sec.c] = sec.items.some(name => name.toLowerCase().includes(q))
    })
    BEVERAGE_CATEGORIES.forEach(cat => {
      map[cat.c] = cat.c.toLowerCase().includes(q) || cat.groups.some(grp =>
        grp.g.toLowerCase().includes(q) || grp.items.some(it => it.n.toLowerCase().includes(q))
      )
    })
    return map
  }, [q])

  const totalMatches = useMemo(() => {
    if (!q) return 0
    let n = 0
    GROCERY_CATEGORIES.forEach(sec => sec.items.forEach(name => { if (name.toLowerCase().includes(q)) n++ }))
    BEVERAGE_CATEGORIES.forEach(cat => cat.groups.forEach(grp => grp.items.forEach(it => {
      if (it.n.toLowerCase().includes(q) || grp.g.toLowerCase().includes(q) || cat.c.toLowerCase().includes(q)) n++
    })))
    return n
  }, [q])

  useEffect(() => {
    let raf = 0
    const handler = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const toolbarBottom = toolbarRef.current?.getBoundingClientRect().bottom ?? 0
        let current = ''
        for (const name of ALL_CATEGORY_NAMES) {
          const el = document.getElementById(`sec-${slug(name)}`)
          if (!el || el.classList.contains('hidden')) continue
          if (el.getBoundingClientRect().top - toolbarBottom < 48) current = name
        }
        setActiveCategory(current)
      })
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => {
      window.removeEventListener('scroll', handler)
      cancelAnimationFrame(raf)
    }
  }, [q])

  useEffect(() => {
    if (!activeCategory || !categoriesOpen) return
    chipRefs.current[activeCategory]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeCategory, categoriesOpen])

  useEffect(() => {
    if (!categoriesOpen) return
    const handler = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) setCategoriesOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [categoriesOpen])

  const { itemCount, beverageTotal, perCategory } = useMemo(() => {
    let itemCount = 0
    let beverageTotal = 0
    const perCategory: Record<string, number> = {}
    Object.values(cart).forEach(line => {
      if (line.qty > 0) {
        itemCount += line.qty
        perCategory[line.cat] = (perCategory[line.cat] || 0) + line.qty
        if (line.price) beverageTotal += line.qty * line.price
      }
    })
    return { itemCount, beverageTotal, perCategory }
  }, [cart])

  const summaryText = useMemo(() => {
    const lines: string[] = []
    const head = ([
      ['Booking', guest.name],
      ['Email', guest.email],
      ['Villa', guest.villa],
      ['Dates', [guest.arrival, guest.departure].filter(Boolean).join(' → ')],
      ['Guests', guest.guests],
      ['Celebration', guest.occasion],
      ['Dietary / preferences', guest.dietary],
    ] as [string, string][]).filter(([, v]) => v)
    if (head.length) {
      lines.push('STAY DETAILS')
      head.forEach(([k, v]) => lines.push(`${k}: ${v}`))
      lines.push('')
    }
    let total = 0
    ALL_CATEGORY_NAMES.forEach(c => {
      const rows = Object.values(cart).filter(s => s.cat === c && s.qty > 0)
      const note = notes[c]
      if (!rows.length && !note) return
      lines.push(c.toUpperCase())
      rows.forEach(s => {
        if (s.price) total += s.qty * s.price
        lines.push(`  - ${s.name}  ${s.price ? `x${s.qty} @ ${eur(s.price)}` : 'x' + s.qty}`)
      })
      if (note) lines.push(`  Note: ${note}`)
      lines.push('')
    })
    if (!lines.length) lines.push('Nothing selected yet.')
    if (total > 0) lines.push(`Beverages estimated total: ${eur(total)}`)
    lines.push('', "Sent via the Kennedy's Group pre-stocking form.")
    return lines.join('\n')
  }, [cart, notes, guest])

  const summaryGroups = useMemo(() => {
    return ALL_CATEGORY_NAMES.map(c => {
      const rows = Object.values(cart).filter(s => s.cat === c && s.qty > 0)
      const note = notes[c]
      return { cat: c, rows, note }
    }).filter(g => g.rows.length > 0 || g.note)
  }, [cart, notes])

  const hasStayDetails = Object.values(guest).some(Boolean)

  const handleSend = async () => {
    if (!guest.email.trim()) {
      setSendState('error')
      return
    }
    setSendState('sending')
    try {
      const res = await mutateAPI('contact', 'POST', {
        inquiryType: 'CONCIERGE',
        firstName: guest.name.trim() || 'Guest',
        lastName: '',
        email: guest.email.trim(),
        message: summaryText,
        travelDates: [guest.arrival, guest.departure].filter(Boolean).join(' → ') || undefined,
        requestQuote: true,
        newsletter: false,
      })
      if (res?.success === false) throw new Error(res.message || 'send failed')
      setSendState('sent')
    } catch {
      setSendState('error')
    }
  }

  const handleEmailApp = () => {
    const subject = 'Pre-stocking order' + (guest.name ? ' — ' + guest.name : '')
    let body = summaryText
    if (body.length > 1800) body = body.slice(0, 1750) + '\n\n[Order truncated — full order copied below or attached]'
    window.location.href = `mailto:${CONCIERGE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = summaryText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <SeoHead
        title={initialSeoMeta?.title || `Villa Pre-Stocking Order | ${SITE_NAME}`}
        description={initialSeoMeta?.description || "Order groceries and beverages ahead of your arrival — tell us what you'd like waiting for you at the villa."}
        canonicalPath="/pre-stocking"
        imageUrl={initialSeoMeta?.imageUrl ?? undefined}
        noindex
      />
      <div className='w-full'>
        <Navbar textBlack={true} />
      </div>

      <main className='w-full bg-white pt-[76px] md:pt-[125px]'>
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className='mx-auto w-full max-w-[1250px] px-6 md:px-10'>
          <header className='pb-8 pt-12 md:pb-10 md:pt-16'>
            <p className='mb-3 font-haas text-[11px] uppercase tracking-[0.3em] text-[#D99330]'>
              Concierge service
            </p>
            <h1 className='font-gtsuper-ds text-[40px] font-light leading-[1.05] text-[#172338] md:text-[56px]'>
              Villa Pre-Stocking Order
            </h1>
            <p className='mt-5 max-w-[620px] font-haas text-[15px] font-light leading-[1.7] text-[#506A70] md:text-[16px]'>
              Tap the <span className='font-normal text-[#172338]'>+</span> on anything you&rsquo;d like waiting for you on arrival. When you&rsquo;re done, review your order and send it straight to our concierge team.
            </p>
            <p className='mt-4 max-w-[620px] font-haas text-[13px] font-light leading-[1.7] text-[#506A70]'>
              Our shopping and villa-stocking service is charged at €50 plus VAT for requests completed by 20:00. For requests between 20:00 and 09:00, an after-hours service fee of €100 plus VAT per hour applies.
            </p>
          </header>
        </div>

        {/* ─── Sticky toolbar: search + categories dropdown + expand-all ── */}
        <div ref={toolbarRef} className='sticky top-[76px] z-30 border-y border-[#172338]/10 bg-white/95 backdrop-blur md:top-[125px]'>
          <div className='mx-auto w-full max-w-[1250px] px-6 py-3 md:px-10'>
            <div className='flex flex-wrap items-center gap-3'>
              <div className='relative min-w-0 flex-1 sm:w-[300px] sm:flex-none'>
                <Search size={15} className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#172338]/40' />
                <input
                  type='text'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search any item… e.g. oat milk, Assyrtiko, tonic'
                  className='h-10 w-full rounded-full border border-[#172338]/20 bg-white pl-9 pr-9 font-haas text-[14px] font-light text-[#172338] placeholder:text-[#172338]/40 focus:border-[#172338] focus:outline-none'
                />
                {search && (
                  <button
                    type='button'
                    aria-label='Clear search'
                    onClick={() => setSearch('')}
                    className='absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#172338]/40 transition-colors hover:text-[#172338]'
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className='relative' ref={categoriesRef}>
                <button
                  type='button'
                  onClick={() => setCategoriesOpen(o => !o)}
                  className='flex h-10 max-w-[130px] shrink-0 items-center gap-1.5 rounded-full border border-[#172338]/20 bg-white px-3.5 font-haas text-[13px] font-normal text-[#172338] transition-colors hover:border-[#172338] sm:max-w-[220px] sm:px-4'
                >
                  <span className='truncate'>{activeCategory || 'Categories'}</span>
                  <ChevronDown size={14} className={`shrink-0 text-[#506A70] transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>
                {categoriesOpen && (
                  <div className='absolute left-0 top-full z-[80] mt-1.5 max-h-[60vh] w-[85vw] max-w-[420px] overflow-y-auto border border-[#172338]/15 bg-white p-4 shadow-lg'>
                    <div className='flex flex-wrap gap-2'>
                      {ALL_CATEGORY_NAMES.map(c => {
                        const matches = !categoryMatch || categoryMatch[c]
                        const active = c === activeCategory
                        return (
                          <a
                            key={c}
                            ref={(el) => { chipRefs.current[c] = el }}
                            href={`#sec-${slug(c)}`}
                            onClick={(e) => { if (!matches) { e.preventDefault(); return } setCategoriesOpen(false) }}
                            aria-current={active ? 'true' : undefined}
                            className={[
                              'shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 font-haas text-[12.5px] font-normal transition-colors',
                              !matches
                                ? 'cursor-default border-[#172338]/10 text-[#172338]/25'
                                : active
                                  ? 'border-[#172338] bg-[#172338] text-white'
                                  : 'border-[#172338]/20 text-[#172338] hover:border-[#D99330] hover:text-[#B27626]',
                            ].join(' ')}
                          >
                            {c}
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {q && (
                <p className='w-full font-haas text-[11.5px] font-light text-[#506A70] sm:w-auto'>
                  {totalMatches} result{totalMatches === 1 ? '' : 's'} for &ldquo;{search.trim()}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='mx-auto w-full max-w-[1250px] px-6 pb-40 pt-10 md:px-10'>
          {/* ─── Your stay ─────────────────────────────────────────── */}
          <section className='mb-14 border border-[#172338]/12 bg-white p-7 md:p-9'>
            <h2 className='font-gtsuper-ds text-[26px] font-light text-[#172338]'>Your stay</h2>
            <p className='mt-1.5 font-haas text-[13.5px] font-light text-[#506A70]'>
              These details help us deliver to the right villa at the right time.
            </p>
            <div className='mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
              <div>
                <FieldLabel>Booking name</FieldLabel>
                <input className={INPUT_CLASS} placeholder='e.g. Smith' value={guest.name}
                  onChange={e => setGuest(g => ({ ...g, name: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <input className={INPUT_CLASS} type='email' placeholder='you@example.com' value={guest.email}
                  onChange={e => setGuest(g => ({ ...g, email: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Villa</FieldLabel>
                <input className={INPUT_CLASS} placeholder='e.g. Villa Thalassa' value={guest.villa}
                  onChange={e => setGuest(g => ({ ...g, villa: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Guests</FieldLabel>
                <input className={INPUT_CLASS} type='number' min={1} placeholder='4' value={guest.guests}
                  onChange={e => setGuest(g => ({ ...g, guests: e.target.value }))} />
              </div>
              <div>
                <FieldLabel>Arrival</FieldLabel>
                <DateField
                  value={guest.arrival}
                  onChange={(ymd) => setGuest(g => ({
                    ...g,
                    arrival: ymd,
                    departure: g.departure && ymd && g.departure < ymd ? '' : g.departure,
                  }))}
                />
              </div>
              <div>
                <FieldLabel>Departure</FieldLabel>
                <DateField
                  value={guest.departure}
                  onChange={(ymd) => setGuest(g => ({ ...g, departure: ymd }))}
                  minDate={guest.arrival ? parseYmdLocal(guest.arrival) : null}
                />
              </div>
              <div>
                <FieldLabel>Celebrating anything?</FieldLabel>
                <input className={INPUT_CLASS} placeholder='birthday, anniversary, proposal…' value={guest.occasion}
                  onChange={e => setGuest(g => ({ ...g, occasion: e.target.value }))} />
              </div>
              <div className='sm:col-span-2 lg:col-span-3'>
                <FieldLabel>Allergies, dietary requirements &amp; special preferences</FieldLabel>
                <textarea
                  rows={2}
                  className='w-full resize-none rounded-none border border-[#172338]/20 bg-white px-4 py-3 font-haas font-light text-[15px] text-[#172338] placeholder:text-[#172338]/35 transition-colors focus:border-[#172338] focus:outline-none'
                  placeholder='e.g. one guest is gluten-free; we prefer organic where possible'
                  value={guest.dietary}
                  onChange={e => setGuest(g => ({ ...g, dietary: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* ─── Groceries ─────────────────────────────────────────── */}
          <div className='mb-6 flex items-baseline gap-4 border-t border-[#D99330]/30 pt-10'>
            <h2 className='font-gtsuper-ds text-[32px] font-light text-[#172338]'>Groceries</h2>
            <div className='h-px flex-1 bg-[#172338]/10' />
          </div>
          <p className='mb-6 max-w-[720px] font-haas text-[14px] font-light leading-[1.7] text-[#506A70]'>
            Fresh essentials stocked before you arrive, charged per market receipt. Fish, butcher and delicacies are pre-ordered fresh and priced on request. Add any detail in the notes under each category.
          </p>
          <div className='flex flex-col gap-3'>
            {GROCERY_CATEGORIES.map((sec, si) => {
              const rows = sec.items.map((name, ii) => ({ id: `g${si}-${ii}`, name }))
              const visibleRows = q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows
              const sectionHidden = q ? visibleRows.length === 0 : false
              return (
                <CategorySection
                  key={sec.c}
                  name={sec.c}
                  defaultOpen
                  count={perCategory[sec.c] || 0}
                  hidden={sectionHidden}
                  forceOpen={!!q && !sectionHidden}
                >
                  <div className='grid grid-cols-1 gap-x-8 md:grid-cols-2'>
                    {visibleRows.map(r => {
                      const line = cart[r.id]
                      return (
                        <div key={r.id} className='flex items-center justify-between gap-4 border-b border-dashed border-[#172338]/10 py-2.5'>
                          <span className={`font-haas text-[14.5px] ${line.qty > 0 ? 'font-normal text-[#B27626]' : 'font-light text-[#172338]'}`}>
                            {r.name}
                          </span>
                          <Stepper qty={line.qty} onChange={(qty) => setQty(r.id, qty)} />
                        </div>
                      )
                    })}
                  </div>
                  <textarea
                    rows={2}
                    placeholder={`Notes for ${sec.c.toLowerCase()} — brands, sizes, anything at all…`}
                    value={notes[sec.c] || ''}
                    onChange={e => setNotes(n => ({ ...n, [sec.c]: e.target.value }))}
                    className='mt-4 w-full resize-none rounded-none border border-[#172338]/15 bg-[#F5F5F0] px-3.5 py-2.5 font-haas text-[13.5px] font-light text-[#172338] placeholder:text-[#172338]/35 focus:border-[#172338] focus:outline-none'
                  />
                </CategorySection>
              )
            })}
          </div>

          {/* ─── Cellar & Beverages ────────────────────────────────── */}
          <div className='mb-6 mt-14 flex items-baseline gap-4 border-t border-[#D99330]/30 pt-10'>
            <h2 className='font-gtsuper-ds text-[32px] font-light text-[#172338]'>Cellar &amp; Beverages</h2>
            <div className='h-px flex-1 bg-[#172338]/10' />
          </div>
          <p className='mb-6 max-w-[720px] font-haas text-[14px] font-light leading-[1.7] text-[#506A70]'>
            Priced per bottle from our list of 24/02/2026. Open a category or simply search above.
          </p>
          <div className='flex flex-col gap-3'>
            {BEVERAGE_CATEGORIES.map((cat, ci) => {
              const groups = cat.groups.map((grp, gi) => ({
                name: grp.g,
                rows: grp.items.map((it, ii) => ({ id: `b${ci}-${gi}-${ii}`, name: it.n, price: it.p })),
              }))
              const visibleGroups = q
                ? groups
                    .map(g => ({ ...g, rows: g.rows.filter(r => r.name.toLowerCase().includes(q) || g.name.toLowerCase().includes(q) || cat.c.toLowerCase().includes(q)) }))
                    .filter(g => g.rows.length > 0)
                : groups
              const sectionHidden = q ? visibleGroups.length === 0 : false
              return (
                <CategorySection
                  key={cat.c}
                  name={cat.c}
                  count={perCategory[cat.c] || 0}
                  hidden={sectionHidden}
                  forceOpen={!!q && !sectionHidden}
                >
                  {visibleGroups.map(grp => (
                    <div key={grp.name} className='mb-1'>
                      <p className='mb-2 mt-4 font-haas text-[12px] font-normal uppercase tracking-[0.16em] text-[#D99330] first:mt-0'>
                        {grp.name}
                      </p>
                      <div className='grid grid-cols-1 gap-x-8 md:grid-cols-2'>
                        {grp.rows.map(r => {
                          const line = cart[r.id]
                          return (
                            <div key={r.id} className='flex items-center justify-between gap-4 border-b border-dashed border-[#172338]/10 py-2.5'>
                              <span className={`min-w-0 flex-1 truncate font-haas text-[14px] ${line.qty > 0 ? 'font-normal text-[#B27626]' : 'font-light text-[#172338]'}`}>
                                {r.name}
                              </span>
                              <span className='shrink-0 font-haas text-[12.5px] font-light text-[#506A70]'>{eur(r.price)}</span>
                              <Stepper qty={line.qty} onChange={(qty) => setQty(r.id, qty)} />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  <textarea
                    rows={2}
                    placeholder={`Notes for ${cat.c.toLowerCase()} — vintages, chilled on arrival, alternatives…`}
                    value={notes[cat.c] || ''}
                    onChange={e => setNotes(n => ({ ...n, [cat.c]: e.target.value }))}
                    className='mt-4 w-full resize-none rounded-none border border-[#172338]/15 bg-[#F5F5F0] px-3.5 py-2.5 font-haas text-[13.5px] font-light text-[#172338] placeholder:text-[#172338]/35 focus:border-[#172338] focus:outline-none'
                  />
                </CategorySection>
              )
            })}
          </div>
        </div>
      </main>

      {/* ─── Sticky bottom bar ───────────────────────────────────────── */}
      <div className='fixed bottom-0 left-0 right-0 z-40 flex items-center gap-6 bg-[#172338] px-6 py-4 shadow-[0_-6px_24px_rgba(15,32,51,0.25)] md:px-10'>
        <p className='flex-1 truncate font-haas text-[13.5px] font-light text-[#C2CFDC] md:text-[14.5px]'>
          {itemCount > 0 ? (
            <>
              <span className='font-normal text-white'>{itemCount}</span> item{itemCount > 1 ? 's' : ''} selected
              {beverageTotal > 0 && (
                <>
                  {' '}&nbsp;·&nbsp; beverages est.{' '}
                  <span className='font-normal text-[#D99330]'>{eur(beverageTotal)}</span>
                </>
              )}
            </>
          ) : (
            'No items yet — tap + on anything you’d like'
          )}
        </p>
        <button
          type='button'
          onClick={() => setReviewOpen(true)}
          className='h-11 shrink-0 bg-white px-7 font-haas text-[12px] font-normal uppercase tracking-[0.2em] text-[#172338] transition-colors hover:bg-[#D99330] hover:text-white'
        >
          Review &amp; send
        </button>
      </div>

      {/* ─── Review overlay ──────────────────────────────────────────── */}
      {reviewOpen && (
        <div
          className='fixed inset-0 z-[220] flex items-start justify-center overflow-auto bg-[#172338]/55 p-4 py-10'
          onClick={() => setReviewOpen(false)}
        >
          <div
            className='w-full max-w-[720px] bg-white p-7 md:p-9'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='mb-1 flex items-start justify-between gap-4'>
              <h2 className='font-gtsuper-ds text-[28px] font-light text-[#172338]'>Your pre-stocking order</h2>
              <button
                type='button'
                onClick={() => setReviewOpen(false)}
                className='shrink-0 text-[#506A70] transition-colors hover:text-[#172338]'
                aria-label='Close'
              >
                <X size={22} />
              </button>
            </div>
            <p className='mb-6 font-haas text-[13.5px] font-light text-[#506A70]'>
              Please check everything looks right, then send it to our concierge team.
            </p>

            <div className='max-h-[42vh] overflow-y-auto border border-[#172338]/12 bg-[#F5F5F0] p-5'>
              {hasStayDetails && (
                <div className='mb-4'>
                  <h4 className='mb-1.5 font-gtsuper-ds text-[16px] font-normal text-[#172338]'>Stay details</h4>
                  {([
                    ['Booking', guest.name], ['Email', guest.email], ['Villa', guest.villa],
                    ['Dates', [guest.arrival, guest.departure].filter(Boolean).join(' → ')],
                    ['Guests', guest.guests], ['Celebration', guest.occasion],
                    ['Dietary / preferences', guest.dietary],
                  ] as [string, string][]).filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} className='flex justify-between gap-3 py-0.5 font-haas text-[13.5px] font-light text-[#172338]'>
                      <span>{k}: {v}</span>
                    </div>
                  ))}
                </div>
              )}
              {summaryGroups.length === 0 && (
                <p className='font-haas text-[13.5px] font-light text-[#506A70]'>
                  Nothing selected yet — close this window and tap + on a few items.
                </p>
              )}
              {summaryGroups.map(g => (
                <div key={g.cat} className='mb-4 last:mb-0'>
                  <h4 className='mb-1.5 font-gtsuper-ds text-[16px] font-normal text-[#172338]'>{g.cat}</h4>
                  {g.rows.map(r => (
                    <div key={r.name} className='flex justify-between gap-3 py-0.5 font-haas text-[13.5px] font-light text-[#172338]'>
                      <span>{r.name}</span>
                      <span className='shrink-0 text-[#506A70]'>
                        {r.price ? `${r.qty} × ${eur(r.price)} = ${eur(r.qty * r.price)}` : `× ${r.qty}`}
                      </span>
                    </div>
                  ))}
                  {g.note && <p className='py-0.5 font-haas text-[13px] font-light italic text-[#B27626]'>Note: {g.note}</p>}
                </div>
              ))}
              {beverageTotal > 0 && (
                <div className='mt-3 flex justify-between border-t border-[#172338]/15 pt-2.5 font-haas text-[14px] font-normal text-[#172338]'>
                  <span>Beverages estimated total</span>
                  <span>{eur(beverageTotal)}</span>
                </div>
              )}
            </div>

            <div className='mt-6 flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={handleSend}
                disabled={sendState === 'sending'}
                className='h-12 flex-1 basis-[160px] bg-[#172338] px-6 font-haas text-[12px] font-normal uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#D99330] disabled:opacity-60'
              >
                {sendState === 'sending' ? 'Sending…' : sendState === 'sent' ? 'Sent ✓' : 'Send to concierge'}
              </button>
              <button
                type='button'
                onClick={handleEmailApp}
                className='h-12 flex-1 basis-[160px] border border-[#172338]/25 bg-white px-6 font-haas text-[12px] font-normal uppercase tracking-[0.2em] text-[#172338] transition-colors hover:border-[#172338]'
              >
                Open in my email app
              </button>
              <button
                type='button'
                onClick={handleCopy}
                className='h-12 flex-1 basis-[160px] border border-[#172338]/25 bg-white px-6 font-haas text-[12px] font-normal uppercase tracking-[0.2em] text-[#172338] transition-colors hover:border-[#172338]'
              >
                {copied ? 'Copied ✓' : 'Copy order'}
              </button>
            </div>

            {sendState === 'sent' && (
              <p className='mt-4 flex items-center gap-2 font-haas text-[13px] font-light text-[#172338]'>
                <Check size={15} className='text-[#D99330]' /> Thank you — your order is on its way to our concierge team. We&rsquo;ll be in touch to confirm.
              </p>
            )}
            {sendState === 'error' && (
              <p className='mt-4 font-haas text-[13px] font-light text-red-600'>
                {guest.email.trim()
                  ? <>We couldn&rsquo;t send automatically — please use &ldquo;Open in my email app&rdquo; or &ldquo;Copy order&rdquo; instead.</>
                  : <>Please add your email above so our concierge team can reach you.</>}
              </p>
            )}

            <p className='mt-5 font-haas text-[11.5px] font-light leading-relaxed text-[#506A70]'>
              Beverage prices per Kennedy&rsquo;s Group price list of 24/02/2026 and may be updated. Groceries are charged per market receipt. Our concierge will confirm availability and the final total.
            </p>
            <p className='mt-2 font-haas text-[11.5px] font-light leading-relaxed text-[#506A70]'>
              Our shopping and villa-stocking service is charged at €50 plus VAT for requests completed by 20:00. For requests between 20:00 and 09:00, an after-hours service fee of €100 plus VAT per hour applies.
            </p>
          </div>
        </div>
      )}

      <Footer disableTravelSection={true} />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const seoRow = await fetchPageByKeyServer('pre-stocking').catch(() => null);
  return {
    props: {
      initialSeoMeta: {
        title: seoRow?.metaTitle || null,
        description: seoRow?.metaDescription || null,
        imageUrl: seoRow?.metaImageUrl || null,
      },
    },
  };
};

export default PreStockingPage
