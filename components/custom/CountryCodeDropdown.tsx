import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CountryCodeDropdownOption {
  value: string
  label: string
}

interface CountryCodeDropdownProps {
  options: CountryCodeDropdownOption[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** Overrides the button's height/border so it can match the other fields in the surrounding form. Defaults to the Contact Us look. */
  buttonClassName?: string
  /** Once a code is picked, show just its dial code (e.g. "+30") instead of the flag + country name. The open list still shows full names either way. */
  compactSelected?: boolean
}

const DEFAULT_BUTTON_CLASS = 'h-12 border border-[#172338]/20 bg-white focus:border-[#172338]'

/** Max height of the open list (px) — kept in sync with the `max-h-52` class below. */
const LIST_MAX_HEIGHT = 208

/** Country code dropdown shared across lead forms — keep design in sync with pages/contact-us.tsx. */
export function CountryCodeDropdown({ options, value, onChange, placeholder = 'Select', buttonClassName, compactSelected }: CountryCodeDropdownProps) {
  const [open, setOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleToggle = () => {
    if (!open && ref.current) {
      const { bottom, top } = ref.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - bottom
      const spaceAbove = top
      setOpenUpward(spaceBelow < LIST_MAX_HEIGHT && spaceAbove > spaceBelow)
    }
    setOpen((o) => !o)
  }

  return (
    <div className='relative' ref={ref}>
      <button
        type='button'
        onClick={handleToggle}
        className={`flex w-full items-center justify-between px-4 font-haas font-light text-[15px] transition-colors focus:outline-none ${buttonClassName ?? DEFAULT_BUTTON_CLASS}`}
      >
        <span className={`truncate ${selected?.value ? 'text-[#172338]' : 'text-[#172338]/35'}`}>
          {selected?.value ? (compactSelected ? selected.value : selected.label) : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#506A70] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className={`absolute left-0 z-[80] max-h-52 w-full overflow-y-auto border border-[#172338]/15 bg-white shadow-lg ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((opt, i) => (
            <button
              key={`${opt.value}-${i}`}
              type='button'
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full px-4 py-2.5 text-left font-haas text-sm font-light transition-colors hover:bg-[#F5F7FA] ${opt.value === value ? 'bg-[#F5F7FA] font-normal text-[#172338]' : 'text-[#172338]'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CountryCodeDropdown
