import React, { useMemo, useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import { SlidersHorizontal, Calendar, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import {
  LocationTreeDropdown,
  type LocationTreeSelection,
} from '@/components/custom/LocationTreeDropdown'
import { KENNEDYS_LOCATION_FILTER_TREE, filterTreeByAvailableRegions } from '@/lib/kennedysLocationFilterTree'
import { stayDateFlexShortLabel } from '@/lib/stayDateFlex'
import { VillaFilterDateRangeCalendar } from '@/components/custom/VillaFilterDateRangeCalendar'

interface LuxurySearchFormProps {
  onFiltersOpen?: () => void;
  /** 'flat' = same compact look as the /real-estate search bar (used on mobile); 'card' = the overlapping card. */
  variant?: 'card' | 'flat';
}

export const LuxurySearchForm = ({ onFiltersOpen, variant = 'card' }: LuxurySearchFormProps) => {
  const router = useRouter();
  const [location, setLocation] = useState('')
  const [area, setArea] = useState('')
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [locationTreeScope, setLocationTreeScope] = useState<'country' | 'region' | undefined>(undefined)
  const [locationTreeDisplayRegion, setLocationTreeDisplayRegion] = useState('')
  const [bedrooms, setBedrooms] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null])
  const [startDate, endDate] = dateRange
  const [dateFlexDays, setDateFlexDays] = useState(0)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement | null>(null)

  // const [minBudget, setMinBudget] = useState<number>(0)
  // const [maxBudget, setMaxBudget] = useState<number>(50000)
  // const [isBudgetOpen, setIsBudgetOpen] = useState(false)
  // const budgetRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isDatePickerOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  useEffect(() => {
    import('@/lib/api/properties').then(({ getFilterOptions }: any) => {
      getFilterOptions({ rental: true }).then((data: any) => {
        const regions = Array.isArray(data?.data?.regions) ? data.data.regions : []
        setAvailableRegions(regions)
      }).catch(() => {})
    })
  }, [])

  const filteredLocationTree = useMemo(
    () => filterTreeByAvailableRegions(KENNEDYS_LOCATION_FILTER_TREE, availableRegions),
    [availableRegions],
  )

  // Location/area dropdowns: el control jerárquico maneja su propio open/close.

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (budgetRef.current && !budgetRef.current.contains(event.target as Node)) {
  //       setIsBudgetOpen(false);
  //     }
  //   };
  //   if (isBudgetOpen) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [isBudgetOpen]);

  // const budgetLabel = minBudget === 0 && maxBudget >= 50000
  //   ? 'Any budget'
  //   : `€${minBudget.toLocaleString()} – €${maxBudget >= 50000 ? '50,000+' : maxBudget.toLocaleString()}`;

  const dateRangeLabel = startDate && endDate
    ? `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}${dateFlexDays > 0 ? ` · ${stayDateFlexShortLabel(dateFlexDays)}` : ''}`
    : startDate
      ? `${format(startDate, 'MMM d')} -`
      : 'Select dates';

  const locationTreeValue = useMemo<LocationTreeSelection>(
    () => ({
      selectedCountry,
      regionValue: location,
      area,
      scope: locationTreeScope,
      displayRegion: locationTreeDisplayRegion || undefined,
      selectedLeaves: selectedLeaves.length > 0 ? selectedLeaves : undefined,
    }),
    [selectedCountry, location, area, locationTreeScope, locationTreeDisplayRegion, selectedLeaves]
  );

  const handleCheckAvailability = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set('region', location.trim());
    if (area.trim()) params.set('area', area.trim());
    if (bedrooms !== null && bedrooms > 1) params.set('bedrooms', String(bedrooms));
    if (startDate) params.set('checkIn', format(startDate, 'yyyy-MM-dd'));
    if (endDate) params.set('checkOut', format(endDate, 'yyyy-MM-dd'));
    if (dateFlexDays > 0 && startDate && endDate) {
      params.set('dateFlexDays', String(dateFlexDays));
    }
    // if (minBudget > 0) params.set('minPrice', String(minBudget));
    // if (maxBudget < 50000) params.set('maxPrice', String(maxBudget));
    params.set('rental', 'true');
    router.push(`/villas/list?${params.toString()}`);
  };

  const handleOpenFilters = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set('region', location.trim());
    if (area.trim()) params.set('area', area.trim());
    if (bedrooms !== null && bedrooms > 1) params.set('bedrooms', String(bedrooms));
    if (startDate) params.set('checkIn', format(startDate, 'yyyy-MM-dd'));
    if (endDate) params.set('checkOut', format(endDate, 'yyyy-MM-dd'));
    if (dateFlexDays > 0 && startDate && endDate) {
      params.set('dateFlexDays', String(dateFlexDays));
    }
    // if (minBudget > 0) params.set('minPrice', String(minBudget));
    // if (maxBudget < 50000) params.set('maxPrice', String(maxBudget));
    params.set('rental', 'true');
    params.set('openFilters', 'true');
    router.push(`/villas/list?${params.toString()}`);
  };

  const onLocationChange = (next: LocationTreeSelection) => {
    setSelectedCountry(next.selectedCountry);
    setLocationTreeScope(next.scope);
    setLocationTreeDisplayRegion(next.displayRegion ?? '');
    if (next.selectedLeaves !== undefined) {
      const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)));
      setSelectedLeaves(uniq);
      setLocation(uniq.join(','));
      setArea(next.area ?? '');
      return;
    }
    setSelectedLeaves([]);
    setLocation(next.regionValue);
    setArea(next.area);
  };

  if (variant === 'flat') {
    const bedroomsValue = bedrooms ?? 1;
    return (
      <div className="flex flex-col gap-2 bg-white">
        <LocationTreeDropdown
          options={filteredLocationTree}
          loading={false}
          placeholder="Select location"
          triggerClassName="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14 focus:outline-none"
          value={locationTreeValue}
          multiSelect
          closeOnSelect={false}
          onChange={onLocationChange}
        />

        <div className="relative" ref={datePickerRef}>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen((prev) => !prev)}
            className="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pr-4 pl-4 flex items-center justify-between text-left focus:outline-none"
          >
            <span className={`truncate ${dateRangeLabel === 'Select dates' ? 'text-gray-500' : ''}`}>{dateRangeLabel}</span>
            <Calendar className="h-4 w-4 text-black shrink-0 ml-2" />
          </button>
          {isDatePickerOpen && (
            <div className="absolute right-0 mt-2 z-30 w-[min(100vw-2rem,280px)] max-w-[280px]">
              <VillaFilterDateRangeCalendar
                value={dateRange}
                onChange={setDateRange}
                showStayDateFlex
                dateFlexDays={dateFlexDays}
                onDateFlexChange={setDateFlexDays}
                onRangeComplete={() => setIsDatePickerOpen(false)}
                onDone={() => setIsDatePickerOpen(false)}
                className="!mx-0 w-full max-w-[280px] shadow-xl"
              />
            </div>
          )}
        </div>

        <div className="flex items-center h-[52px] border border-[#D1D5DB]">
          <button
            type="button"
            onClick={() => {
              const next = Math.max(1, bedroomsValue - 1);
              setBedrooms(next === 1 ? null : next);
            }}
            className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-r border-[#D1D5DB] text-lg leading-none"
          >
            −
          </button>
          <span className="flex-1 text-center font-haas text-[14px] text-[#172338] select-none">
            {bedroomsValue <= 1 ? 'Any' : bedroomsValue}
          </span>
          <button
            type="button"
            onClick={() => setBedrooms(bedroomsValue + 1)}
            className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-l border-[#D1D5DB] text-lg leading-none"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleOpenFilters}
          className="h-[52px] w-full bg-white border border-[#D1D5DB] hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2"
        >
          <span className="font-haas text-[14px] text-[#172338]">Filters</span>
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#172338]" />
        </button>

        <button
          type="button"
          onClick={handleCheckAvailability}
          className="h-[52px] w-full bg-[#28F6EA] hover:brightness-95 transition flex items-center justify-center gap-2 text-[#172338] font-haas text-[14px]"
        >
          <span className="whitespace-nowrap">Check Now</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mb-24 bg-white p-4 shadow-sm border border-gray-200 md:mb-0 md:p-6" style={{ maxWidth: '80rem' }}>
        <h2 className="text-[#506A70] text-2xl md:text-4xl font-gtsuper-ds font-light">Luxury Vacation Rentals</h2>

        {/* Misma barra que /villas/list */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          {/* Location */}
          <div className="w-full md:flex-1 min-w-[180px]">
            <label className="block font-haas text-[#172338] mb-2">Location</label>
            <LocationTreeDropdown
              options={filteredLocationTree}
              loading={false}
              placeholder="Select location"
              triggerClassName="w-full h-[56px] font-haas text-[16px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14"
              value={locationTreeValue}
              multiSelect
              closeOnSelect={false}
              onChange={(next) => {
                setSelectedCountry(next.selectedCountry);
                setLocationTreeScope(next.scope);
                setLocationTreeDisplayRegion(next.displayRegion ?? '');
                if (next.selectedLeaves !== undefined) {
                  const uniq = Array.from(new Set(next.selectedLeaves.map((l) => l.trim()).filter(Boolean)));
                  setSelectedLeaves(uniq);
                  setLocation(uniq.join(','));
                  setArea(next.area ?? '');
                  return;
                }
                setSelectedLeaves([]);
                setLocation(next.regionValue);
                setArea(next.area);
              }}
            />
          </div>

          {/* Check In / Check Out */}
          <div className="w-full md:flex-1 min-w-[180px]">
            <label className="block font-haas text-[#172338] mb-2">Check In / Check Out</label>
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen((prev) => !prev)}
                className="w-full h-[56px] font-haas text-[16px] text-[#172338] bg-white border border-[#D1D5DB] pr-9 pl-4 flex items-center justify-between text-left"
              >
                <span className={`truncate ${dateRangeLabel === 'Select dates' ? 'text-gray-500' : ''}`}>
                  {dateRangeLabel}
                </span>
                <Calendar className="h-5 w-5 text-black" />
              </button>
              {isDatePickerOpen && (
                <div className="absolute right-0 mt-2 z-30 w-[min(100vw-2rem,280px)] max-w-[280px]">
                  <VillaFilterDateRangeCalendar
                    value={dateRange}
                    onChange={setDateRange}
                    showStayDateFlex
                    dateFlexDays={dateFlexDays}
                    onDateFlexChange={setDateFlexDays}
                    onRangeComplete={() => setIsDatePickerOpen(false)}
                    onDone={() => setIsDatePickerOpen(false)}
                    className="!mx-0 w-full max-w-[280px] shadow-xl"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="w-full md:w-28 shrink-0">
            <label className="block font-haas text-[#172338] mb-2">Bedrooms</label>
            <div className="relative flex border border-[#D1D5DB] h-[56px]">
              <span className="flex-1 flex items-center justify-center font-haas text-[16px] text-[#172338] select-none">
                {bedrooms ?? 1}
              </span>
              <div className="flex flex-col border-l border-[#D1D5DB]">
                <button
                  type="button"
                  onClick={() => setBedrooms((bedrooms ?? 1) + 1)}
                  className="flex-1 flex items-center justify-center px-2 hover:bg-gray-50 transition"
                >
                  <ChevronUp className="h-3 w-3 text-[#172338]" />
                </button>
                <div className="border-t border-[#D1D5DB]" />
                <button
                  type="button"
                  onClick={() => {
                    const newValue = Math.max(1, (bedrooms ?? 1) - 1);
                    setBedrooms(newValue === 1 ? null : newValue);
                  }}
                  className="flex-1 flex items-center justify-center px-2 hover:bg-gray-50 transition"
                >
                  <ChevronDown className="h-3 w-3 text-[#172338]" />
                </button>
              </div>
            </div>
          </div>

          {/* Budget */}
          {/* <div className="w-full md:flex-1 min-w-[180px]" ref={budgetRef}>
            <style>{`
              .budget-thumb {
                -webkit-appearance: none;
                appearance: none;
                pointer-events: none;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 100%;
                height: 4px;
                background: transparent;
                outline: none;
              }
              .budget-thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                pointer-events: all;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #506A70;
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.25);
              }
              .budget-thumb::-moz-range-thumb {
                pointer-events: all;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #506A70;
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.25);
              }
            `}</style>
            <label className="block font-haas text-[#172338] mb-2">Budget</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBudgetOpen((prev) => !prev)}
                className="w-full h-[56px] font-haas text-[16px] text-[#172338] bg-white border border-[#506A70] pr-9 pl-4 flex items-center justify-between text-left"
              >
                <span className={budgetLabel === 'Any budget' ? 'text-gray-500' : ''}>{budgetLabel}</span>
                <ChevronDown className={`h-5 w-5 text-black transition-transform ${isBudgetOpen ? 'rotate-180' : ''}`} />
              </button>
              {isBudgetOpen && (
                <div className="absolute z-30 left-0 mt-1 bg-white border border-gray-200 shadow-xl p-6 w-80">
                  <p className="font-haas text-xs text-[#506A70] uppercase tracking-widest mb-4">Price range / night</p>

                  <div className="flex items-center justify-between mb-6">
                    <div className="border border-[#506A70] px-3 py-2 text-center min-w-[100px]">
                      <p className="text-xs text-gray-400 font-haas mb-0.5">Min</p>
                      <p className="font-haas text-[#172338] text-sm font-medium">€{minBudget.toLocaleString()}</p>
                    </div>
                    <div className="h-px w-6 bg-gray-300" />
                    <div className="border border-[#506A70] px-3 py-2 text-center min-w-[100px]">
                      <p className="text-xs text-gray-400 font-haas mb-0.5">Max</p>
                      <p className="font-haas text-[#172338] text-sm font-medium">
                        {maxBudget >= 50000 ? '€50,000+' : `€${maxBudget.toLocaleString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="relative h-4 mb-2">
                    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 rounded-full" />
                    <div
                      className="absolute top-1/2 h-1 -translate-y-1/2 bg-[#506A70] rounded-full pointer-events-none"
                      style={{
                        left: `${(minBudget / 50000) * 100}%`,
                        right: `${100 - (maxBudget / 50000) * 100}%`,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={50000}
                      step={500}
                      value={minBudget}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val < maxBudget - 500) setMinBudget(val);
                      }}
                      className="budget-thumb"
                      style={{ zIndex: minBudget > 45000 ? 5 : 3 }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={50000}
                      step={500}
                      value={maxBudget}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > minBudget + 500) setMaxBudget(val);
                      }}
                      className="budget-thumb"
                      style={{ zIndex: 4 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-haas mt-1 mb-5">
                    <span>€0</span>
                    <span>€50,000+</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => { setMinBudget(0); setMaxBudget(50000); }}
                      className="text-sm text-gray-400 hover:text-[#172338] underline font-haas transition"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsBudgetOpen(false)}
                      className="px-6 py-2 bg-[#506A70] text-white text-sm font-haas hover:brightness-95 transition"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div> */}

          {/* Filters */}
          <div className="flex flex-col w-full md:w-auto">
            <label className="block font-haas text-[#172338] mb-2"> </label>
            <button
              type="button"
              onClick={handleOpenFilters}
              className="h-[56px] w-full md:w-[120px] bg-white border border-[#D1D5DB] hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2"
            >
              <span className="font-haas text-[#172338] text-[16px]">Filters</span>
              <SlidersHorizontal className="h-4 w-4 text-[#172338]" />
            </button>
          </div>

          {/* Check availability — botón circular dorado */}
          <div className="flex flex-col items-center w-full md:w-auto self-end">
            <button
              type="button"
              onClick={handleCheckAvailability}
              className="w-32 h-32 rounded-full bg-[#D99330] hover:brightness-95 transition flex items-center justify-center gap-1 text-white shrink-0"
            >
              <span className="font-light text-base leading-tight text-center">Search</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
