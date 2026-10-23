"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarEvents } from '@/lib/api/properties';

interface AvailabilityCalendarProps {
  icalUrl?: string | null;
  /** Fechas bloqueadas (property_availability_dates.date). Desde hoy todo verde salvo estas fechas (gris). */
  blockedDates?: string[];
  /** Si false, no se muestran precios en el tooltip (cuando price_visibility está deshabilitado en la propiedad). */
  showPrices?: boolean;
  availabilityRanges?: Array<{
    from: string | Date;
    to: string | Date;
    is_available?: boolean;
    price_per_night?: number;
    disabled_dates?: string[] | Date[];
    min_stay?: number;
  }>;
  /** Tailwind height class for each day cell (and the blank leading cells). Defaults to the compact
   * `h-10` used on the villa detail page's Availability tab. */
  dayCellClassName?: string;
  /** Límites (YYYY-MM-DD) de la ventana de datos consultada. Fuera de este rango los días se
   * muestran como "sin datos" (borde punteado) en lugar de "no disponible", y la navegación de
   * meses se limita. Si se omiten, el calendario navega libremente (comportamiento anterior). */
  windowStart?: string | null;
  windowEnd?: string | null;
  /** Si true, muestra la tarifa por noche dentro de cada día disponible (no solo en el hover).
   * Requiere celdas más altas (`dayCellClassName` con `h-14`+). Default: false. */
  inlinePrices?: boolean;
}

// Paleta de marca — alineada con PublicAvailabilityGrid (sage / rojo de alerta / hairline)
// en vez de los `green-50` / `gray-100` genéricos de Tailwind.
const CELL_AVAILABLE = 'bg-[#EEF3EF] text-[#172338] hover:bg-[#E1EBE4]';
const CELL_UNAVAILABLE = 'bg-[#F6E8E8] text-[#B27C7C]';
const CELL_PAST = 'text-[#C3CDD3]';
const CELL_OUTSIDE = 'border border-dashed border-[#C7D0D6] text-[#C3CDD3]';

interface CalendarEvent {
  start: Date;
  end: Date;
  summary?: string;
  status?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Formato YYYY-MM-DD para un día del calendario (hora local, sin UTC). */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function AvailabilityCalendar({ icalUrl, blockedDates = [], showPrices = true, availabilityRanges = [], dayCellClassName = 'h-10', windowStart = null, windowEnd = null, inlinePrices = false }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [icalEvents, setIcalEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const initialMonthSetRef = useRef(false);

  /** Fechas bloqueadas desde BD (property_availability_dates.date). YYYY-MM-DD. */
  const blockedSetFromDb = useMemo(() => {
    const set = new Set<string>();
    if (!Array.isArray(blockedDates)) return set;
    blockedDates.forEach((d) => {
      const s = String(d).trim().slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) set.add(s);
    });
    return set;
  }, [blockedDates]);

  const getIcalEventRange = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const isAllDay =
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0;

    if (isAllDay && endDate > startDate) {
      endDate.setDate(endDate.getDate() - 1);
    }

    if (endDate < startDate) {
      endDate.setTime(startDate.getTime());
    }

    return { startDate, endDate };
  };

  // First available date: mes en que arranca la disponibilidad de la villa (para abrir el calendario ahí)
  const firstAvailableDate = useMemo<Date | null>(() => {
    if (availabilityRanges && availabilityRanges.length > 0) {
      let first: Date | null = null;
      availabilityRanges.forEach((range) => {
        if (range.is_available === true) {
          const start = new Date(range.from);
          if (!isNaN(start.getTime()) && (first === null || start < first)) {
            first = start;
          }
        }
      });
      return first;
    }
    return null;
  }, [availabilityRanges]);

  // Abrir el calendario en el mes donde arranca la disponibilidad (no en el mes actual)
  useEffect(() => {
    if (initialMonthSetRef.current) return;
    if (firstAvailableDate) {
      setCurrentDate(new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1));
      initialMonthSetRef.current = true;
    }
  }, [firstAvailableDate]);

  // Parse iCal events if URL is provided
  useEffect(() => {
    if (!icalUrl) {
      setIcalEvents([]);
      return;
    }

    const fetchIcalEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCalendarEvents(icalUrl);

        if (response.success && response.data) {
          // Parse iCal events
          const events: CalendarEvent[] = [];
          Object.values(response.data).forEach((event: any) => {
            if (event.type === 'VEVENT') {
              events.push({
                start: new Date(event.start),
                end: new Date(event.end),
                summary: event.summary,
                status: event.status
              });
            }
          });
          setIcalEvents(events);
        } else {
          console.warn('⚠️ iCal response not successful:', response);
          setError(response.message || 'Failed to load calendar');
        }
      } catch (err) {
        console.error('❌ Error fetching iCal:', err);
        setError('Failed to load calendar');
        setIcalEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIcalEvents();
  }, [icalUrl]);

  // Get blocked dates from iCal (events in iCal typically represent blocked/unavailable dates)
  const blockedDatesFromIcal = useMemo(() => {
    const blocked = new Set<string>();
    
    if (icalUrl && icalEvents.length > 0) {
      icalEvents.forEach((event) => {
        // In iCal, events typically represent blocked dates
        // Only block if status is not CANCELLED (cancelled events = available)
        if (event.status !== 'CANCELLED') {
          const { startDate, endDate } = getIcalEventRange(event);
          const current = new Date(startDate);

          // Block all dates in the event range (inclusive)
          while (current <= endDate) {
            blocked.add(toLocalDateStr(current));
            current.setDate(current.getDate() + 1);
          }
        }
      });
    }

    return blocked;
  }, [icalEvents, icalUrl]);

  // Get available dates and their prices from availabilityRanges
  // Priority: availabilityRanges > icalUrl
  // If both exist, use availabilityRanges
  const { availableDates, datePriceMap, dateMinStayMap } = useMemo(() => {
    const dates = new Set<string>();
    const priceMap = new Map<string, number>();
    const minStayMap = new Map<string, number>();
    
    // Use availabilityRanges if they exist (they have priority over iCal)
    if (availabilityRanges && availabilityRanges.length > 0) {
      // Use availabilityRanges from database
      // Only include ranges where is_available is true (or not explicitly false)
      availabilityRanges.forEach((range) => {
        // Check if the range is available (default to true if not specified, but DB default is false)
        // So we need to explicitly check for true
        const isAvailable = range.is_available === true;
        
        if (isAvailable) {
          const start = new Date(range.from);
          const end = new Date(range.to);
          
          // Validate dates
          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return;
          }
          
          // Use explicit date components to avoid timezone issues
          const startYear = start.getFullYear();
          const startMonth = start.getMonth();
          const startDay = start.getDate();
          let current = new Date(startYear, startMonth, startDay, 0, 0, 0, 0);
          
          const endYear = end.getFullYear();
          const endMonth = end.getMonth();
          const endDay = end.getDate();
          const endDate = new Date(endYear, endMonth, endDay, 23, 59, 59, 999);
          
          // Get disabled dates for this range
          const disabledDates = Array.isArray(range.disabled_dates) 
            ? range.disabled_dates.map((d: string | Date) => {
                // Normalize to YYYY-MM-DD format
                if (d instanceof Date) {
                  return d.toISOString().split('T')[0];
                }
                if (typeof d === 'string') {
                  // If it's already in YYYY-MM-DD format, return as is
                  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
                    return d;
                  }
                  // Otherwise, try to parse it
                  const parsed = new Date(d);
                  if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString().split('T')[0];
                  }
                }
                return null;
              }).filter((d: string | null): d is string => d !== null)
            : [];
          
          const price = range.price_per_night || 0;
          const minStay = range.min_stay || 0;
          
          // Add all dates in the range (inclusive), excluding disabled dates
          // Use explicit date components to avoid timezone issues
          while (current <= endDate) {
            // Build date string using explicit date components to avoid timezone issues
            const year = current.getFullYear();
            const month = current.getMonth();
            const day = current.getDate();
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Only add if the date is not in the disabled_dates array
            if (!disabledDates.includes(dateStr)) {
              dates.add(dateStr);
              // Store price and min stay for this date (later ranges override earlier ones)
              if (price > 0) {
                priceMap.set(dateStr, price);
              }
              if (minStay > 0) {
                minStayMap.set(dateStr, minStay);
              }
            }
            
            // Increment using explicit date components to avoid timezone issues
            const nextYear = current.getFullYear();
            const nextMonth = current.getMonth();
            const nextDay = current.getDate();
            current = new Date(nextYear, nextMonth, nextDay + 1, 0, 0, 0, 0);
          }
        }
      });
    }

    return { availableDates: dates, datePriceMap: priceMap, dateMinStayMap: minStayMap };
  }, [availabilityRanges]);

  // Get iCal event info for a specific date
  const getIcalEventInfo = (dateStr: string): CalendarEvent | null => {
    if (!icalUrl || icalEvents.length === 0) return null;
    
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    // Find event that contains this date
    for (const event of icalEvents) {
      const { startDate, endDate } = getIcalEventRange(event);
      
      if (date >= startDate && date <= endDate && event.status !== 'CANCELLED') {
        return event;
      }
    }
    
    return null;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Ventana de datos: fuera de estos límites no hay información (no es "ocupado").
  const winStart = windowStart && /^\d{4}-\d{2}-\d{2}$/.test(windowStart) ? windowStart : null;
  const winEnd = windowEnd && /^\d{4}-\d{2}-\d{2}$/.test(windowEnd) ? windowEnd : null;
  const isOutsideWindow = (dateStr: string): boolean =>
    (!!winStart && dateStr < winStart) || (!!winEnd && dateStr > winEnd);

  // Cortar la navegación al mes que todavía toca la ventana de datos.
  const prevMonthLastStr = toLocalDateStr(new Date(year, month, 0));
  const nextMonthFirstStr = toLocalDateStr(new Date(year, month + 1, 1));
  const prevDisabled = !!winStart && prevMonthLastStr < winStart;
  const nextDisabled = !!winEnd && nextMonthFirstStr > winEnd;

  const goToPreviousMonth = () => {
    if (prevDisabled) return;
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    if (nextDisabled) return;
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isDateAvailable = (date: Date): boolean => {
    const dateStr = toLocalDateStr(date);
    const todayStr = toLocalDateStr(new Date());

    // Bloqueos persistidos (sync iCal / manual) tienen prioridad sobre rangos legacy o eventos iCal en vivo
    if (blockedSetFromDb.has(dateStr)) return false;

    // Modo property_availability_dates: desde hoy todo verde salvo bloqueos (arriba)
    if (!availabilityRanges?.length) {
      return dateStr >= todayStr;
    }

    // Rangos legacy / días explícitos: solo verde si está en el set y no contradice bloqueos (ya aplicados)
    if (availableDates.has(dateStr)) {
      if (icalUrl && blockedDatesFromIcal.has(dateStr)) return false;
      return true;
    }

    if (icalUrl) return !blockedDatesFromIcal.has(dateStr);

    return false;
  };

  const isDateInCurrentMonth = (day: number): boolean => {
    return day >= 1 && day <= daysInMonth;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDateHover = (
    e: React.MouseEvent<HTMLDivElement> | React.FocusEvent<HTMLDivElement>,
    dateStr: string,
  ) => {
    setHoveredDate(dateStr);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleDateLeave = () => {
    setHoveredDate(null);
    setTooltipPosition(null);
  };

  const renderCalendarDays = () => {
    const days = [];
    const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0));

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(
        <div key={`empty-${i}`} className={`${dayCellClassName} flex items-center justify-center`}></div>
      );
    }

    // Add cells for each day of the month (dateStr en local para coincidir con BD)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = toLocalDateStr(date);
      const outside = isOutsideWindow(dateStr);
      const isAvailable = !outside && isDateAvailable(date);
      const isPast = date < todayMidnight;

      // Get price or iCal info for tooltip
      // Solo mostrar tooltip si NO hay iCal URL (es decir, cuando viene de availabilityRanges)
      const price = !icalUrl ? datePriceMap.get(dateStr) : undefined;
      const minStay = !icalUrl ? dateMinStayMap.get(dateStr) : undefined;

      // No mostrar tooltip si viene de iCal URL o si los precios están ocultos (price_visibility)
      const hasPrice = showPrices && !icalUrl && isAvailable && !isPast && !outside && price !== undefined && price > 0;
      // Con inlinePrices el precio ya se ve en la celda: el hover solo aporta el min-stay.
      const showTooltip = hasPrice && (!inlinePrices || (minStay !== undefined && minStay > 0));
      const showInlinePrice = hasPrice && inlinePrices;

      const statusWord = isPast
        ? 'past'
        : outside
        ? 'no data yet'
        : isAvailable
        ? 'available'
        : 'unavailable';

      days.push(
        <div
          key={day}
          role={showTooltip ? 'button' : undefined}
          tabIndex={showTooltip ? 0 : undefined}
          aria-label={
            showTooltip
              ? `${MONTHS[month]} ${day} — ${statusWord}${hasPrice && price ? `, ${formatPrice(price)} per night` : ''}${
                  minStay ? `, minimum ${minStay} ${minStay === 1 ? 'night' : 'nights'}` : ''
                }`
              : undefined
          }
          className={`${dayCellClassName} flex flex-col items-center justify-center gap-0.5 leading-none text-sm font-haas relative rounded transition-colors ${
            isPast
              ? `${CELL_PAST} cursor-not-allowed`
              : outside
              ? `${CELL_OUTSIDE} cursor-default`
              : isAvailable
              ? `${CELL_AVAILABLE} ${showTooltip ? 'cursor-pointer' : ''} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99330]`
              : `${CELL_UNAVAILABLE} cursor-not-allowed`
          }`}
          onMouseEnter={(e) => showTooltip && handleDateHover(e, dateStr)}
          onMouseLeave={handleDateLeave}
          onFocus={(e) => showTooltip && handleDateHover(e, dateStr)}
          onBlur={handleDateLeave}
        >
          <span>{day}</span>
          {showInlinePrice && price !== undefined && (
            <span className="text-[10px] font-medium text-[#6B8F71] tracking-tight">
              {formatPrice(price)}
            </span>
          )}
          {hoveredDate === dateStr && tooltipPosition && showTooltip && (
            <div
              className="absolute z-50 bg-[#172338] text-white text-xs px-3 py-2 rounded shadow-lg pointer-events-none whitespace-nowrap"
              style={{
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '5px',
              }}
            >
              {price !== undefined && price > 0 && (
                <div>
                  <div className="font-semibold">{formatPrice(price)} / night</div>
                  {minStay !== undefined && minStay > 0 && (
                    <div className="text-xs opacity-90 mt-1">Min. stay: {minStay} {minStay === 1 ? 'night' : 'nights'}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[#506A70] font-haas">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[#D04444] font-haas">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          disabled={prevDisabled}
          className="p-2 hover:bg-[#F4F6F9] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-[#506A70]" />
        </button>

        <h3 className="text-[20px] font-gtsuper-ds text-[#172338]" aria-live="polite">
          {MONTHS[month]} {year}
        </h3>

        <button
          onClick={goToNextMonth}
          disabled={nextDisabled}
          className="p-2 hover:bg-[#F4F6F9] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-[#506A70]" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div
            key={day}
            className="h-10 flex items-center justify-center text-sm font-gtsuper-ds text-[#506A70] font-light"
          >
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {renderCalendarDays()}
      </div>
    </div>
  );
}
