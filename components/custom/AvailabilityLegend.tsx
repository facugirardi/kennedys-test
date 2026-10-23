import React from 'react'

type LegendItem = { label: string; node: React.ReactNode }

const box = (bg: string, extra = '') => (
  <span className={`inline-block w-3.5 h-3.5 rounded-[3px] shrink-0 ${extra}`} style={bg ? { background: bg } : undefined} />
)

// Cuadrados sólidos de la grilla (PublicAvailabilityGrid): sage / rojo de alerta / gris.
const GRID_ITEMS: LegendItem[] = [
  { label: 'Available', node: box('#6B8F71') },
  { label: 'Booked', node: box('#D04444') },
  {
    label: 'Check-in / out',
    node: (
      <span className="relative inline-block w-3.5 h-3.5 rounded-[3px] overflow-hidden shrink-0">
        <span className="absolute inset-0" style={{ background: '#6B8F71', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
        <span className="absolute inset-0" style={{ background: '#D04444', clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />
      </span>
    ),
  },
  { label: 'Past', node: box('#EEF2F6') },
]

// Celdas del calendario mensual (AvailabilityCalendar), misma paleta de marca que la grilla.
const CALENDAR_ITEMS: LegendItem[] = [
  { label: 'Available', node: box('', 'bg-[#EEF3EF] border border-[#6B8F71]/40') },
  { label: 'Unavailable', node: box('', 'bg-[#F6E8E8]') },
  { label: 'Past', node: box('', 'bg-white border border-[#E2E8EB]') },
  { label: 'Beyond 90-day window', node: box('', 'bg-white border border-dashed border-[#C7D0D6]') },
]

type Props = {
  variant?: 'grid' | 'calendar'
  className?: string
}

/** Leyenda de colores para las vistas de disponibilidad de agentes (`/agent-calendar`). */
export default function AvailabilityLegend({ variant = 'grid', className = '' }: Props) {
  const items = variant === 'grid' ? GRID_ITEMS : CALENDAR_ITEMS
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${className}`}>
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-2 font-haas font-light text-[10px] sm:text-[11px] tracking-[0.1em] uppercase text-[#506A70]"
        >
          {item.node}
          {item.label}
        </li>
      ))}
    </ul>
  )
}
