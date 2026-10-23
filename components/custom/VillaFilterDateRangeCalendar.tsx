"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { StayDateFlexPicker } from "@/components/custom/StayDateFlexPicker"

const WEEKDAYS_SU_FIRST = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  )
}

/** Sunday-first month grid — same as LuxurySearchForm / villas filters */
export function getCalendarDaysSundayFirst(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  return days
}

export type VillaFilterDateRangeCalendarProps = {
  value: [Date | null, Date | null]
  onChange: (next: [Date | null, Date | null]) => void
  className?: string
  /** When true, calendar stretches to container width with larger day cells (e.g. concierge enquiry). */
  fullWidth?: boolean
  /** Villas search: date flexibility chips */
  showStayDateFlex?: boolean
  dateFlexDays?: number
  onDateFlexChange?: (days: number) => void
  /** Fires when user selects checkout (range complete); e.g. close popover */
  onRangeComplete?: () => void
  showDoneButton?: boolean
  onDone?: () => void
}

/**
 * Date range calendar matching the villa list / LuxurySearchForm picker
 * (gold #D99330 selection, Su–Sa headers, border #506A70).
 */
export function VillaFilterDateRangeCalendar({
  value,
  onChange,
  className,
  fullWidth = false,
  showStayDateFlex = false,
  dateFlexDays = 0,
  onDateFlexChange,
  onRangeComplete,
  showDoneButton = true,
  onDone,
}: VillaFilterDateRangeCalendarProps) {
  const [startDate, endDate] = value
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const todayMidnight = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })()

  const handleDayClick = (day: Date) => {
    if (day < todayMidnight) return
    if (!startDate || (startDate && endDate)) {
      onChange([day, null])
    } else {
      if (day < startDate) {
        onChange([day, null])
      } else if (isSameDay(day, startDate)) {
        onChange([null, null])
        if (showStayDateFlex) onDateFlexChange?.(0)
      } else {
        onChange([startDate, day])
        setTimeout(() => {
          onRangeComplete?.()
        }, 120)
      }
    }
  }

  const handleClear = () => {
    onChange([null, null])
    if (showStayDateFlex) onDateFlexChange?.(0)
  }

  const dayBtn = fullWidth
    ? "text-center text-sm font-haas font-thin py-2.5 sm:py-3 min-h-[2.75rem] sm:min-h-[3rem] transition select-none"
    : "text-center text-xs font-haas font-thin py-1.5 transition select-none"
  const weekdayHead = fullWidth
    ? "text-center text-[11px] sm:text-xs font-haas font-thin text-gray-400 py-2"
    : "text-center text-[10px] font-haas font-thin text-gray-400 py-1"

  return (
    <div
      className={cn(
        "bg-white border border-[#506A70] shadow-xl w-full mx-auto sm:mx-0",
        fullWidth ? "max-w-none p-4 sm:p-5" : "max-w-[280px] p-4",
        className
      )}
    >
      <div className={cn("flex items-center justify-between", fullWidth ? "mb-4" : "mb-3")}>
        <button
          type="button"
          onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}
          className="p-1 hover:bg-[#EEF2F6] transition"
          aria-label="Previous month"
        >
          <ChevronLeft className={cn("text-[#172338]", fullWidth ? "h-5 w-5" : "h-4 w-4")} />
        </button>
        <span
          className={cn(
            "font-haas font-thin text-[#172338] uppercase tracking-widest",
            fullWidth ? "text-sm sm:text-base" : "text-xs"
          )}
        >
          {format(calendarMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}
          className="p-1 hover:bg-[#EEF2F6] transition"
          aria-label="Next month"
        >
          <ChevronRight className={cn("text-[#172338]", fullWidth ? "h-5 w-5" : "h-4 w-4")} />
        </button>
      </div>

      <div className={cn("grid grid-cols-7", fullWidth ? "mb-2" : "mb-1")}>
        {WEEKDAYS_SU_FIRST.map((d) => (
          <div key={d} className={weekdayHead}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {getCalendarDaysSundayFirst(calendarMonth.getFullYear(), calendarMonth.getMonth()).map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const isPast = day < todayMidnight
          const isStart = startDate && isSameDay(day, startDate)
          const isEnd = endDate && isSameDay(day, endDate)
          const inRange = startDate && endDate && day > startDate && day < endDate
          const isHovered = startDate && !endDate && hoverDate && day > startDate && day <= hoverDate
          return (
            <button
              key={`day-${i}`}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => !isPast && setHoverDate(day)}
              onMouseLeave={() => setHoverDate(null)}
              className={[
                dayBtn,
                isPast ? "text-gray-300 cursor-not-allowed" : "cursor-pointer",
                isStart || isEnd ? "bg-[#D99330] text-white" : "",
                inRange ? "bg-[#EEF2F6] text-[#172338]" : "",
                isHovered && !inRange && !isStart && !isEnd ? "bg-[#f5f8fa] text-[#172338]" : "",
                !isPast && !isStart && !isEnd && !inRange && !isHovered
                  ? "hover:bg-[#EEF2F6] text-[#172338]"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {day.getDate()}
            </button>
          )
        })}
      </div>

      {showStayDateFlex && onDateFlexChange && (
        <StayDateFlexPicker
          className="mt-3"
          value={dateFlexDays}
          onChange={onDateFlexChange}
        />
      )}

      <div
        className={cn(
          "flex items-center justify-between mt-3 pt-3 border-t border-gray-100",
          !showDoneButton && "justify-end"
        )}
      >
        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-haas font-thin text-[#172338] underline"
        >
          {showDoneButton ? "Clear" : "Clear dates"}
        </button>
        {showDoneButton && (
          <button
            type="button"
            onClick={onDone}
            className="text-xs font-haas font-thin text-[#172338] font-medium"
          >
            Done
          </button>
        )}
      </div>
    </div>
  )
}
