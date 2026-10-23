import React from 'react'
import { ChevronDown } from 'lucide-react'

/** Mobile-only: on a form whose first child is the primary field, hides every other child (animated) when collapsed. */
export const collapsibleFormClasses = (collapsed: boolean) =>
  [
    'max-md:[&>*:not(:first-child)]:transition-all max-md:[&>*:not(:first-child)]:duration-300 max-md:[&>*:not(:first-child)]:ease-out',
    collapsed
      ? 'max-md:[&>*:not(:first-child)]:max-h-0 max-md:[&>*:not(:first-child)]:opacity-0 max-md:[&>*:not(:first-child)]:-mt-2 max-md:[&>*:not(:first-child)]:overflow-hidden max-md:[&>*:not(:first-child)]:pointer-events-none'
      : 'max-md:[&>*:not(:first-child)]:max-h-[80px] max-md:[&>*:not(:first-child)]:opacity-100',
  ].join(' ')

type Props = { collapsed: boolean; onToggle: () => void }

export const FiltersCollapseHandle = ({ collapsed, onToggle }: Props) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={!collapsed}
    aria-label={collapsed ? 'Show all filters' : 'Hide filters'}
    className="md:hidden mx-auto mt-1 flex h-6 items-center gap-1.5 px-3 font-haas text-[11px] uppercase tracking-wider text-[#506A70] active:opacity-60"
  >
    <span>{collapsed ? 'More filters' : 'Less'}</span>
    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} aria-hidden />
  </button>
)
