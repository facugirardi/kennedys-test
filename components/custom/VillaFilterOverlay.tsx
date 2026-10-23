import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { VillaStayDateCalendarPanel } from '@/components/custom/VillaStayDateCalendarPanel';
import { VillaPriceRangeControl } from '@/components/custom/VillaPriceRangeControl';

const DEFAULT_PRICE_SLIDER_MAX = 30000;

/** Amenity/value tokens — API matches with ILIKE on property fields + classification facility arrays */
export const VILLA_FILTER_FACILITY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Pool', value: 'Pool' },
  { label: 'Heated Pool', value: 'Heated Pool' },
  { label: 'Jacuzzi', value: 'Jacuzzi' },
  { label: 'Gym', value: 'Gym' },
  { label: 'Fitness equipment', value: 'Fitness equipment' },
  { label: 'Spa', value: 'Spa' },
  { label: 'Hammam', value: 'Hammam' },
  { label: 'Well-being & Sport', value: 'Well-being & Sport' },
  { label: 'Home Cinema', value: 'Home Cinema' },
  { label: 'Sound System', value: 'Sound System' },
  { label: 'Dock', value: 'Dock' },
  { label: 'Helipad', value: 'Helipad' },
  { label: 'Tennis court', value: 'Tennis' },
  { label: 'Padel court', value: 'Padel court' },
  { label: 'Private club', value: 'Club' },
  { label: 'Church', value: 'Church' },
  { label: 'Event space', value: 'Event space' },
  { label: 'Outdoor Bar', value: 'Outdoor Bar' },
  { label: 'BBQ', value: 'Barbecue' },
  { label: 'Professional kitchen', value: 'Professional kitchen' },
  { label: 'Security Alarm', value: 'Security Alarm' },
];

export const VILLA_FILTER_LOCATION_OPTIONS: { label: string; value: string }[] = [
  { label: 'Waterfront', value: 'Waterfront' },
  { label: 'Beachfront', value: 'Beachfront' },
  { label: 'Private', value: 'Private' },
  { label: 'Villa Block', value: 'Villa Block' },
  { label: 'Mountain', value: 'Mountain' },
  { label: 'Downtown', value: 'Downtown' },
  { label: 'Resort Access', value: 'Resort Access' },
  { label: 'Beach/Sea Access', value: 'Beach/Sea Access' },
  { label: 'Ski in / Ski out', value: 'Ski in / Ski out' },
  { label: 'Walking distance to the beach', value: 'Walking distance to the beach' },
  { label: 'Private pathway to a bay', value: 'Private pathway to a bay' },
  { label: 'Walking distance to the city center', value: 'Walking distance to the city center' },
];

export const VILLA_FILTER_VIEW_OPTIONS: { label: string; value: string }[] = [
  { label: 'Sunset', value: 'Sunset' },
  { label: 'Sea view', value: 'Sea view' },
  { label: 'Sunrise', value: 'Sunrise' },
  { label: 'Mountain view', value: 'Mountain' },
  { label: 'City view', value: 'City' },
];

export const VILLA_FILTER_INCLUDED_SERVICES: { label: string; value: string }[] = [
  { label: 'Housekeeping', value: 'Housekeeping' },
  { label: 'Security guard', value: 'Security' },
  { label: 'Private Chef', value: 'Chef' },
  { label: 'House Manager', value: 'House Manager' },
  { label: 'Butler', value: 'Butler' },
  { label: 'Waiter', value: 'Waiter' },
  { label: 'Chauffeur service', value: 'Chauffeur' },
];

export const VILLA_FILTER_ACCESSIBILITY_OPTIONS: { label: string; value: string }[] = [
  { label: 'Pet friendly', value: 'Pet friendly' },
  { label: 'Suitable for children', value: 'Suitable for children' },
  { label: 'Suitable for events', value: 'Suitable for events' },
  { label: 'Suitable for the disabled', value: 'Suitable for disabled' },
];

const STAR_OPTIONS = [4, 5, 6, 7];
const BEDROOMS_MAX = 24;
const BATHROOMS_MAX = 24;

const SECTION_TITLE =
  'text-[11px] font-haas font-thin uppercase tracking-[0.14em] text-[#172338]';
const FIELD_BORDER = 'border border-[#D1D5DB]';

function stepBedrooms(current: number | null, delta: 1 | -1, max: number): number | null {
  if (delta === 1) {
    const cur = current ?? 1;
    const next = Math.min(max, cur + 1);
    return next > 1 ? next : null;
  }
  if (current == null) return null;
  if (current <= 2) return null;
  return Math.max(2, current - 1);
}

export interface VillaFilterOverlayApplyPayload {
  priceRange: {
    min: number | null;
    max: number | null;
  };
  bedroomsMin: number | null;
  bedroomsMax: number | null;
  bathrooms: number;
  outdoor: string[];
  checkIn?: string;
  checkOut?: string;
  dateFlexDays?: number;
  guestsMin: number | null;
  stars: number[];
  viewTokens: string[];
  includedServices: string[];
  kidsFriendly: 'any' | 'yes' | 'no';
  locationFeatures: string[];
  accessibilityFeatures: string[];
}

interface VillaFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: VillaFilterOverlayApplyPayload) => void;
  initialFilters?: Partial<VillaFilterOverlayApplyPayload> & Record<string, unknown>;
  currencySymbol?: string;
}

const FILTER_PRICE_SLIDER_MAX = DEFAULT_PRICE_SLIDER_MAX;

// ─── Sub-components ──────────────────────────────────────────────────────────

function HorizontalStepper({
  value,
  onDecrement,
  onIncrement,
  label,
}: {
  value: number | null;
  onDecrement: () => void;
  onIncrement: () => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-0 h-11 border border-[#D1D5DB] w-full">
      <button
        type="button"
        onClick={onDecrement}
        className="w-11 h-full flex items-center justify-center text-[#172338] text-lg leading-none hover:bg-[#F0F3F5] active:bg-[#E8EAED] transition-colors border-r border-[#D1D5DB] shrink-0 select-none"
      >
        −
      </button>
      <span className="flex-1 text-center font-haas text-[15px] text-[#172338] select-none">
        {value == null ? 'Any' : label ? `${value} ${label}` : value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        className="w-11 h-full flex items-center justify-center text-[#172338] text-lg leading-none hover:bg-[#F0F3F5] active:bg-[#E8EAED] transition-colors border-l border-[#D1D5DB] shrink-0 select-none"
      >
        +
      </button>
    </div>
  );
}

function PillGroup({
  options,
  selected,
  onToggle,
}: {
  options: { label: string; value: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`px-3 py-1.5 text-[12px] font-haas border transition-colors leading-snug ${
              active
                ? 'bg-[#172338] text-white border-[#172338]'
                : 'bg-white text-[#303D40] border-[#D1D5DB] hover:border-[#172338] hover:text-[#172338]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function AccordionSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="py-1">
      <div className="w-full flex items-center justify-between py-4 text-left">
        <div className="flex items-center gap-2">
          <span className={SECTION_TITLE}>{title}</span>
          {badge != null && badge > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#172338] text-white text-[10px] font-haas flex items-center justify-center leading-none">
              {badge}
            </span>
          )}
        </div>
      </div>
      <div className="pb-5">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const VillaFilterOverlay: React.FC<VillaFilterOverlayProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
  currencySymbol = 'EUR',
}) => {
  const [filters, setFilters] = useState<VillaFilterOverlayApplyPayload>({
    priceRange: { min: null, max: null },
    bedroomsMin: null,
    bedroomsMax: null,
    bathrooms: 1,
    outdoor: [],
    guestsMin: null,
    stars: [],
    viewTokens: [],
    includedServices: [],
    kidsFriendly: 'any',
    locationFeatures: [],
    accessibilityFeatures: [],
  });

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [dateFlexDays, setDateFlexDays] = useState(0);

  const wasOpenRef = useRef(false);
  const currencyPrefix = currencySymbol === '$' ? '$' : currencySymbol === '€' ? '€' : `${currencySymbol} `;

  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;
    if (!justOpened) return;

    const pr = initialFilters?.priceRange as { min?: unknown; max?: unknown } | undefined;
    const minRaw = pr?.min ?? null;
    const maxRaw = pr?.max ?? null;

    const legacyBed =
      typeof (initialFilters as { bedrooms?: unknown }).bedrooms === 'number'
        ? ((initialFilters as { bedrooms: number }).bedrooms > 1
            ? (initialFilters as { bedrooms: number }).bedrooms
            : null)
        : null;

    const next: VillaFilterOverlayApplyPayload = {
      priceRange: {
        min: typeof minRaw === 'number' && Number.isFinite(minRaw) ? minRaw : null,
        max: typeof maxRaw === 'number' && Number.isFinite(maxRaw) ? maxRaw : null,
      },
      bedroomsMin:
        typeof initialFilters?.bedroomsMin === 'number' ? initialFilters.bedroomsMin : legacyBed,
      bedroomsMax: typeof initialFilters?.bedroomsMax === 'number' ? initialFilters.bedroomsMax : null,
      bathrooms:
        typeof (initialFilters as { bathrooms?: unknown }).bathrooms === 'number'
          ? Math.max(1, (initialFilters as { bathrooms: number }).bathrooms)
          : 1,
      outdoor: Array.isArray(initialFilters?.outdoor) ? [...(initialFilters!.outdoor as string[])] : [],
      guestsMin:
        typeof initialFilters?.guestsMin === 'number' && Number.isFinite(initialFilters.guestsMin)
          ? Math.max(1, Math.floor(initialFilters.guestsMin))
          : null,
      stars: Array.isArray(initialFilters?.stars)
        ? [...(initialFilters!.stars as unknown[])].filter((n): n is number => typeof n === 'number')
        : [],
      viewTokens: Array.isArray(initialFilters?.viewTokens) ? [...(initialFilters!.viewTokens as string[])] : [],
      includedServices: Array.isArray(initialFilters?.includedServices)
        ? [...(initialFilters!.includedServices as string[])]
        : [],
      kidsFriendly:
        initialFilters?.kidsFriendly === 'yes' ||
        initialFilters?.kidsFriendly === 'no' ||
        initialFilters?.kidsFriendly === 'any'
          ? initialFilters.kidsFriendly
          : 'any',
      locationFeatures: Array.isArray(initialFilters?.locationFeatures) ? [...(initialFilters!.locationFeatures as string[])] : [],
      accessibilityFeatures: Array.isArray(initialFilters?.accessibilityFeatures) ? [...(initialFilters!.accessibilityFeatures as string[])] : [],
    };

    setFilters(next);
    setCheckIn(typeof initialFilters?.checkIn === 'string' ? initialFilters.checkIn : '');
    setCheckOut(typeof initialFilters?.checkOut === 'string' ? initialFilters.checkOut : '');
    setDateFlexDays(
      typeof initialFilters?.dateFlexDays === 'number' && Number.isFinite(initialFilters.dateFlexDays)
        ? Math.max(0, initialFilters.dateFlexDays)
        : 0,
    );
  }, [isOpen, initialFilters]);

  const toggleStringInList = (prev: string[], item: string): string[] =>
    prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];

  const toggleStar = (n: number) => {
    setFilters((p) => ({
      ...p,
      stars: p.stars.includes(n) ? p.stars.filter((s) => s !== n) : [...p.stars, n].sort((a, b) => a - b),
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: { min: null, max: null },
      bedroomsMin: null,
      bedroomsMax: null,
      bathrooms: 1,
      outdoor: [],
      guestsMin: null,
      stars: [],
      viewTokens: [],
      includedServices: [],
      kidsFriendly: 'any',
      locationFeatures: [],
      accessibilityFeatures: [],
    });
    setCheckIn('');
    setCheckOut('');
    setDateFlexDays(0);
  };

  const applyFilters = () => {
    onApplyFilters({ ...filters, checkIn, checkOut, dateFlexDays });
    onClose();
  };

  // Active filter count for the header badge
  const activeCount =
    (filters.bedroomsMin != null ? 1 : 0) +
    (filters.bedroomsMax != null ? 1 : 0) +
    (filters.guestsMin != null ? 1 : 0) +
    filters.stars.length +
    filters.viewTokens.length +
    filters.outdoor.length +
    filters.locationFeatures.length +
    filters.includedServices.length +
    filters.accessibilityFeatures.length +
    (filters.kidsFriendly !== 'any' ? 1 : 0) +
    (filters.priceRange.min != null ? 1 : 0) +
    (filters.priceRange.max != null ? 1 : 0) +
    (checkIn && checkOut ? 1 : 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-[9998] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white z-[9999] transform transition-transform duration-300 ease-in-out border-r border-[#E8EAED] shadow-[0_12px_40px_rgba(23,35,56,0.07)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#F8F8F8] border-b border-[#E5E7EB] shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-haas font-light tracking-tight text-[#172338]">Filters</h2>
              {activeCount > 0 && (
                <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#D99330] text-white text-[10px] font-haas font-medium flex items-center justify-center leading-none">
                  {activeCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-sm hover:bg-white/80 text-[#506A70] hover:text-[#172338] transition-colors"
              aria-label="Close filters"
            >
              <X className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-2">

            {/* Stay dates */}
            <AccordionSection
              title="Stay dates"
              badge={checkIn && checkOut ? 1 : 0}
              defaultOpen={false}
            >
              <p className="text-[12px] font-haas text-[#506A70] leading-relaxed mb-3">
                Flex nights let similar check-in/out windows match availability.
              </p>
              <div className={`${FIELD_BORDER} p-4 bg-white`}>
                <VillaStayDateCalendarPanel
                  checkIn={checkIn}
                  checkOut={checkOut}
                  dateFlexDays={dateFlexDays}
                  onChange={({ checkIn: nextIn, checkOut: nextOut, dateFlexDays: nextFlex }) => {
                    setCheckIn(nextIn);
                    setCheckOut(nextOut);
                    setDateFlexDays(nextFlex);
                  }}
                  showCheckInOutSummary
                  showDoneButton={false}
                />
              </div>
            </AccordionSection>

            {/* Bedrooms */}
            <AccordionSection
              title="Bedrooms"
              badge={(filters.bedroomsMin != null ? 1 : 0) + (filters.bedroomsMax != null ? 1 : 0)}
              defaultOpen={true}
            >
              <p className="text-[11px] font-haas text-[#98A8AC] uppercase tracking-wide mb-3">
                Destinations are chosen on the search bar above.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-haas uppercase tracking-wide text-[#98A8AC] mb-1.5">Min</p>
                  <HorizontalStepper
                    value={filters.bedroomsMin}
                    onDecrement={() =>
                      setFilters((p) => ({
                        ...p,
                        bedroomsMin: p.bedroomsMin == null ? null : stepBedrooms(p.bedroomsMin, -1, BEDROOMS_MAX),
                      }))
                    }
                    onIncrement={() =>
                      setFilters((p) => ({
                        ...p,
                        bedroomsMin: stepBedrooms(p.bedroomsMin, 1, BEDROOMS_MAX),
                      }))
                    }
                  />
                </div>
                <div>
                  <p className="text-[10px] font-haas uppercase tracking-wide text-[#98A8AC] mb-1.5">Max</p>
                  <HorizontalStepper
                    value={filters.bedroomsMax}
                    onDecrement={() =>
                      setFilters((p) => {
                        const min = Math.max(1, p.bedroomsMin ?? 1);
                        if (p.bedroomsMax == null) return p;
                        if (p.bedroomsMax <= min) return { ...p, bedroomsMax: null };
                        return { ...p, bedroomsMax: p.bedroomsMax - 1 };
                      })
                    }
                    onIncrement={() =>
                      setFilters((p) => {
                        const min = Math.max(1, p.bedroomsMin ?? 1);
                        const cur = p.bedroomsMax == null ? min : Math.max(min, p.bedroomsMax);
                        return { ...p, bedroomsMax: Math.min(BEDROOMS_MAX, cur + 1) };
                      })
                    }
                  />
                  {filters.bedroomsMax != null && (
                    <button
                      type="button"
                      className="mt-2 text-[11px] font-haas text-[#98A8AC] hover:text-[#172338] transition-colors"
                      onClick={() => setFilters((p) => ({ ...p, bedroomsMax: null }))}
                    >
                      Clear max
                    </button>
                  )}
                </div>
              </div>
            </AccordionSection>

            {/* Guests */}
            <AccordionSection
              title="Guests"
              badge={filters.guestsMin != null ? 1 : 0}
              defaultOpen={true}
            >
              <HorizontalStepper
                value={filters.guestsMin}
                onDecrement={() =>
                  setFilters((p) => ({
                    ...p,
                    guestsMin: p.guestsMin == null || p.guestsMin <= 2 ? null : p.guestsMin - 1,
                  }))
                }
                onIncrement={() =>
                  setFilters((p) => ({
                    ...p,
                    guestsMin: p.guestsMin == null ? 2 : Math.min(50, p.guestsMin + 1),
                  }))
                }
              />
            </AccordionSection>

            {/* Budget */}
            <AccordionSection
              title="Budget"
              badge={(filters.priceRange.min != null ? 1 : 0) + (filters.priceRange.max != null ? 1 : 0)}
              defaultOpen={true}
            >
              <VillaPriceRangeControl
                ceiling={FILTER_PRICE_SLIDER_MAX}
                currencyPrefix={currencyPrefix}
                value={filters.priceRange}
                onChange={(next) => setFilters((prev) => ({ ...prev, priceRange: next }))}
              />
            </AccordionSection>

            {/* Stars */}
            <AccordionSection
              title="Stars"
              badge={filters.stars.length}
              defaultOpen={false}
            >
              <div className="flex gap-2">
                {STAR_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleStar(n)}
                    className={`flex-1 h-11 flex items-center justify-center gap-1 border font-haas text-[13px] transition-colors ${
                      filters.stars.includes(n)
                        ? 'bg-[#172338] text-white border-[#172338]'
                        : 'bg-white text-[#303D40] border-[#D1D5DB] hover:border-[#172338] hover:text-[#172338]'
                    }`}
                  >
                    <span>{n}</span>
                    <span className="text-[11px]">★</span>
                  </button>
                ))}
              </div>
            </AccordionSection>

            {/* View */}
            <AccordionSection
              title="View"
              badge={filters.viewTokens.length}
              defaultOpen={false}
            >
              <PillGroup
                options={VILLA_FILTER_VIEW_OPTIONS}
                selected={filters.viewTokens}
                onToggle={(value) =>
                  setFilters((p) => ({ ...p, viewTokens: toggleStringInList(p.viewTokens, value) }))
                }
              />
            </AccordionSection>

            {/* Location */}
            <AccordionSection
              title="Location"
              badge={filters.locationFeatures.length}
              defaultOpen={false}
            >
              <PillGroup
                options={VILLA_FILTER_LOCATION_OPTIONS}
                selected={filters.locationFeatures}
                onToggle={(value) =>
                  setFilters((p) => ({ ...p, locationFeatures: toggleStringInList(p.locationFeatures, value) }))
                }
              />
            </AccordionSection>

            {/* Facilities */}
            <AccordionSection
              title="Facilities"
              badge={filters.outdoor.length}
              defaultOpen={false}
            >
              <PillGroup
                options={VILLA_FILTER_FACILITY_OPTIONS}
                selected={filters.outdoor}
                onToggle={(value) =>
                  setFilters((p) => ({ ...p, outdoor: toggleStringInList(p.outdoor, value) }))
                }
              />
            </AccordionSection>

            {/* Kids friendly */}
            <AccordionSection
              title="Kids friendly"
              badge={filters.kidsFriendly !== 'any' ? 1 : 0}
              defaultOpen={false}
            >
              <div className="flex border border-[#D1D5DB] h-11 overflow-hidden">
                {(['any', 'yes', 'no'] as const).map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, kidsFriendly: opt }))}
                    className={`flex-1 flex items-center justify-center font-haas text-[13px] transition-colors ${
                      i > 0 ? 'border-l border-[#D1D5DB]' : ''
                    } ${
                      filters.kidsFriendly === opt
                        ? 'bg-[#172338] text-white'
                        : 'bg-white text-[#303D40] hover:bg-[#F0F3F5]'
                    }`}
                  >
                    {opt === 'any' ? 'Any' : opt === 'yes' ? 'Yes' : 'No'}
                  </button>
                ))}
              </div>
            </AccordionSection>

            {/* Services */}
            <AccordionSection
              title="Services"
              badge={filters.includedServices.length}
              defaultOpen={false}
            >
              <PillGroup
                options={VILLA_FILTER_INCLUDED_SERVICES}
                selected={filters.includedServices}
                onToggle={(value) =>
                  setFilters((p) => ({ ...p, includedServices: toggleStringInList(p.includedServices, value) }))
                }
              />
            </AccordionSection>

            {/* Accessibility */}
            <AccordionSection
              title="Accessibility"
              badge={filters.accessibilityFeatures.length}
              defaultOpen={false}
            >
              <PillGroup
                options={VILLA_FILTER_ACCESSIBILITY_OPTIONS}
                selected={filters.accessibilityFeatures}
                onToggle={(value) =>
                  setFilters((p) => ({ ...p, accessibilityFeatures: toggleStringInList(p.accessibilityFeatures, value) }))
                }
              />
            </AccordionSection>

          </div>

          {/* Footer */}
          <div className="border-t border-[#E5E7EB] px-5 pt-4 pb-6 bg-[#FAFBFB] shrink-0">
            <button
              type="button"
              onClick={applyFilters}
              className="w-full h-12 bg-[#7CF5EE] hover:bg-[#6EE5D8] text-[#172338] font-haas text-[14px] font-normal transition-colors flex items-center justify-center gap-2"
            >
              Show results
              <span className="text-base opacity-80">›</span>
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="w-full mt-3 text-[13px] font-haas text-[#506A70] hover:text-[#172338] transition-colors text-center"
            >
              Clear all filters
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
