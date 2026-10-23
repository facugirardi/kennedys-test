import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { StayDateFlexPicker } from '@/components/custom/StayDateFlexPicker';
import {
  getCalendarDays,
  isSameCalendarDay,
  parseYmdLocal,
  toLocalDateKey,
} from '@/lib/villaStayCalendar';

export interface VillaStayDateCalendarPanelProps {
  checkIn: string;
  checkOut: string;
  dateFlexDays: number;
  onChange: (next: { checkIn: string; checkOut: string; dateFlexDays: number }) => void;
  className?: string;
  /** Fila Check-in / Check-out encima del calendario (p. ej. overlay de filtros) */
  showCheckInOutSummary?: boolean;
  /** Barra de filtros: muestra Done y puede cerrar el dropdown al completar rango */
  showDoneButton?: boolean;
  onDone?: () => void;
  onRangeComplete?: () => void;
}

export const VillaStayDateCalendarPanel: React.FC<VillaStayDateCalendarPanelProps> = ({
  checkIn,
  checkOut,
  dateFlexDays,
  onChange,
  className = '',
  showCheckInOutSummary = false,
  showDoneButton = false,
  onDone,
  onRangeComplete,
}) => {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (checkIn) {
      const d = parseYmdLocal(checkIn);
      if (d) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date();
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  useEffect(() => {
    if (!checkIn && !checkOut) {
      setDateRange([null, null]);
      return;
    }
    const startDate = checkIn ? parseYmdLocal(checkIn) : null;
    const endDate = checkOut ? parseYmdLocal(checkOut) : null;
    setDateRange([startDate, endDate]);
  }, [checkIn, checkOut]);

  const handleDayClick = (day: Date) => {
    const [startDate, endDate] = dateRange;
    if (day < todayMidnight) return;
    if (!startDate || (startDate && endDate)) {
      setDateRange([day, null]);
      onChange({ checkIn: toLocalDateKey(day), checkOut: '', dateFlexDays });
    } else {
      if (day < startDate) {
        setDateRange([day, null]);
        onChange({ checkIn: toLocalDateKey(day), checkOut: '', dateFlexDays });
      } else if (isSameCalendarDay(day, startDate)) {
        setDateRange([null, null]);
        onChange({ checkIn: '', checkOut: '', dateFlexDays: 0 });
      } else {
        setDateRange([startDate, day]);
        onChange({
          checkIn: toLocalDateKey(startDate),
          checkOut: toLocalDateKey(day),
          dateFlexDays,
        });
        if (onRangeComplete) {
          setTimeout(() => onRangeComplete(), 120);
        }
      }
    }
  };

  const handleClearDates = () => {
    setDateRange([null, null]);
    onChange({ checkIn: '', checkOut: '', dateFlexDays: 0 });
  };

  const formatShort = (ymd: string) => {
    if (!ymd) return '';
    const d = parseYmdLocal(ymd);
    return d ? format(d, 'MMM d, yyyy') : '';
  };

  return (
    <div className={className}>
      {showCheckInOutSummary && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="border border-[#D1D5DB] bg-[#FAFBFC] px-3 py-2.5 min-h-[52px] flex flex-col justify-center">
            <span className="text-[10px] font-haas uppercase tracking-wide text-[#506A70] mb-0.5">
              Check-in
            </span>
            <span className={`font-haas text-sm text-[#172338] ${!checkIn ? 'text-gray-400' : ''}`}>
              {checkIn ? formatShort(checkIn) : '—'}
            </span>
          </div>
          <div className="border border-[#D1D5DB] bg-[#FAFBFC] px-3 py-2.5 min-h-[52px] flex flex-col justify-center">
            <span className="text-[10px] font-haas uppercase tracking-wide text-[#506A70] mb-0.5">
              Check-out
            </span>
            <span className={`font-haas text-sm text-[#172338] ${!checkOut ? 'text-gray-400' : ''}`}>
              {checkOut ? formatShort(checkOut) : '—'}
            </span>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() =>
            setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))
          }
          className="p-1 hover:bg-[#EEF2F6] transition"
        >
          <ChevronLeft className="h-4 w-4 text-[#172338]" />
        </button>
        <span className="font-haas text-xs font-thin text-[#172338] uppercase tracking-widest">
          {format(calendarMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() =>
            setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))
          }
          className="p-1 hover:bg-[#EEF2F6] transition"
        >
          <ChevronRight className="h-4 w-4 text-[#172338]" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-[10px] font-haas font-thin text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {getCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth()).map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const [startDate, endDate] = dateRange;
          const isPast = day < todayMidnight;
          const isStart = startDate && isSameCalendarDay(day, startDate);
          const isEnd = endDate && isSameCalendarDay(day, endDate);
          const inRange = startDate && endDate && day > startDate && day < endDate;
          const isHovered =
            startDate && !endDate && hoverDate && day > startDate && day <= hoverDate;
          return (
            <button
              key={`day-${i}`}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => !isPast && setHoverDate(day)}
              onMouseLeave={() => setHoverDate(null)}
              className={[
                'text-center text-xs font-haas font-thin py-1.5 transition select-none',
                isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer',
                isStart || isEnd ? 'bg-[#D99330] text-white' : '',
                inRange ? 'bg-[#EEF2F6] text-[#172338]' : '',
                isHovered && !inRange && !isStart && !isEnd ? 'bg-[#f5f8fa] text-[#172338]' : '',
                !isPast && !isStart && !isEnd && !inRange && !isHovered
                  ? 'hover:bg-[#EEF2F6] text-[#172338]'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
      <StayDateFlexPicker
        className="mt-3"
        value={dateFlexDays}
        onChange={(nextFlex) => onChange({ checkIn, checkOut, dateFlexDays: nextFlex })}
      />
      <div
        className={`flex items-center mt-3 pt-3 border-t border-gray-100 ${
          showDoneButton ? 'justify-between' : 'justify-start'
        }`}
      >
        <button
          type="button"
          onClick={handleClearDates}
          className="text-xs font-haas font-thin text-[#172338] underline"
        >
          Clear
        </button>
        {showDoneButton ? (
          <button
            type="button"
            onClick={() => onDone?.()}
            className="text-xs font-haas font-thin text-[#172338] font-medium"
          >
            Done
          </button>
        ) : null}
      </div>
    </div>
  );
};
