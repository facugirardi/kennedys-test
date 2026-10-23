'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight as ChevronRightIcon, SlidersHorizontal as FilterIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import {
  LocationTreeDropdown,
  type LocationTreeSelection,
} from '@/components/custom/LocationTreeDropdown';
import { KENNEDYS_LOCATION_FILTER_TREE, filterTreeByAvailableRegions } from '@/lib/kennedysLocationFilterTree';

const EVENT_PRICE_RANGE_OPTIONS: Array<{ value: string; label: string; min: string; max: string }> = [
  { value: '', label: 'Any budget', min: '', max: '' },
  { value: '$500-$1000', label: '$500-$1000', min: '500', max: '1000' },
  { value: '$1000-$5000', label: '$1000-$5000', min: '1000', max: '5000' },
  { value: '$5000-$10000', label: '$5000-$10000', min: '5000', max: '10000' },
  { value: '$10000+', label: '$10000+', min: '10000', max: '' },
];

const BAR_TRIGGER_CLASS =
  'w-full h-[52px] font-haas font-light text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14 focus:outline-none';

const BAR_SELECT_CLASS =
  'font-haas font-light w-full h-[52px] px-4 bg-white border border-[#D1D5DB] text-[#172338] text-[14px] focus:outline-none';

const BAR_SELECT_PAGE_GRID_CLASS = `${BAR_SELECT_CLASS} pl-3 pr-10 appearance-none cursor-pointer [&::-ms-expand]:hidden bg-no-repeat bg-[length:20px] bg-[position:right_0.75rem_center]`;

const SORT_SELECT_PAGE_GRID_CLASS =
  'w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-3 pr-10 appearance-none cursor-pointer bg-no-repeat bg-[length:20px] bg-[position:right_0.75rem_center] [&::-ms-expand]:hidden';

interface EventSearchProps {
  location: string;
  area: string;
  eventType: string;
  priceMin: string;
  priceMax: string;
  onLocationChange: (v: string) => void;
  onAreaChange?: (v: string) => void;
  onEventTypeChange: (v: string) => void;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  onOpenFilters?: () => void;
  onSearch?: () => void;
  /** Label for the primary search CTA (default: "Show Services" for hub page). */
  searchButtonLabel?: string;
  eventTypeOptions?: string[];
  containerClassName?: string;
  maxWidthClassName?: string;
  /** Horizontal padding of the inner wrapper; use `px-0` when the parent already sets page gutters. */
  innerPaddingClassName?: string;
  /** List page: labels row + column widths aligned with villas / concierge list. */
  layout?: 'default' | 'pageGrid';
  sortOrder?: 'default' | 'asc' | 'desc';
  onSortOrderChange?: (order: 'default' | 'asc' | 'desc') => void;
  availableLocations?: string[];
  hidePriceRange?: boolean;
  hideFiltersButton?: boolean;
}

const DEFAULT_EVENT_TYPES = ['All', 'Wedding', 'Corporate', 'Private Party', 'Birthday', 'Other'];

export const EventSearch: React.FC<EventSearchProps> = ({
  location,
  area,
  eventType,
  priceMin,
  priceMax,
  onLocationChange,
  onAreaChange,
  onEventTypeChange,
  onPriceMinChange,
  onPriceMaxChange,
  onOpenFilters,
  onSearch,
  searchButtonLabel = 'Show Services',
  eventTypeOptions = [],
  containerClassName,
  maxWidthClassName,
  innerPaddingClassName,
  layout = 'default',
  sortOrder,
  onSortOrderChange,
  availableLocations,
  hidePriceRange = false,
  hideFiltersButton = false,
}) => {
  const router = useRouter();
  const isPageGrid = layout === 'pageGrid';
  const showSortColumn = isPageGrid && typeof onSortOrderChange === 'function';
  const eventTypes = eventTypeOptions.length ? eventTypeOptions : DEFAULT_EVENT_TYPES;

  const sortSelectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23172338' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

  const [selectedCountry, setSelectedCountry] = useState('');
  const [locationTreeScope, setLocationTreeScope] = useState<'country' | 'region' | undefined>(undefined);
  const [locationTreeDisplayRegion, setLocationTreeDisplayRegion] = useState('');

  const treeValue = useMemo<LocationTreeSelection>(
    () => ({
      selectedCountry,
      regionValue: location,
      area,
      scope: locationTreeScope,
      displayRegion: locationTreeDisplayRegion || undefined,
    }),
    [selectedCountry, location, area, locationTreeScope, locationTreeDisplayRegion],
  );

  const budgetSelectValue = useMemo(() => {
    const opt = EVENT_PRICE_RANGE_OPTIONS.find((o) => o.min === priceMin && o.max === priceMax);
    return opt?.value ?? '';
  }, [priceMin, priceMax]);

  const filteredLocationTree = useMemo(
    () => filterTreeByAvailableRegions(KENNEDYS_LOCATION_FILTER_TREE, availableLocations ?? []),
    [availableLocations],
  );

  /** Si llega `location`/`area` desde la URL sin estado de árbol, el dropdown sigue funcionando al mostrar hojas en `regionValue`. */
  useEffect(() => {
    if (!location && !area) {
      setSelectedCountry('');
      setLocationTreeScope(undefined);
      setLocationTreeDisplayRegion('');
    }
  }, [location, area]);

  const applyTree = (next: LocationTreeSelection) => {
    setSelectedCountry(next.selectedCountry);
    onLocationChange(next.regionValue);
    onAreaChange?.(next.area);
    setLocationTreeScope(next.scope);
    setLocationTreeDisplayRegion(next.displayRegion ?? '');
  };

  const pushToList = (openFilters?: boolean) => {
    if (onSearch) {
      onSearch();
      return;
    }
    const qp = new URLSearchParams();
    if (location) qp.set('location', location);
    if (area) qp.set('area', area);
    if (eventType) qp.set('type', eventType);
    if (priceMin) qp.set('min', priceMin);
    if (priceMax) qp.set('max', priceMax);
    if (openFilters) qp.set('openFilters', 'true');
    router.push(`/events/list?${qp.toString()}`);
  };

  return (
    <section
      className={`w-full bg-white flex justify-center ${isPageGrid ? 'py-0' : 'py-6 md:py-8 border-b border-gray-200'} ${containerClassName ?? ''}`}
    >
      <div
        className={`w-full ${innerPaddingClassName ?? 'px-5 sm:px-6 md:px-10 lg:px-14'} ${maxWidthClassName ?? 'max-w-[1440px]'}`}
      >
        {isPageGrid && (
          <div className="hidden md:flex gap-2 text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-0">
            <div className="flex-[1.4] min-w-0 px-1">Location</div>
            <div className="flex-[1.4] min-w-0 px-1">Event Type</div>
            {!hidePriceRange && <div className="flex-[1.4] min-w-0 px-1">Price Range</div>}
            {showSortColumn && <div className="w-[170px] shrink-0 px-1">Sort by Price</div>}
            {!hideFiltersButton && <div className="w-[100px] shrink-0" />}
            <div className="w-[160px] shrink-0" />
          </div>
        )}
        <div
          className={
            isPageGrid
              ? 'flex flex-col md:flex-row gap-2 overflow-visible'
              : 'flex flex-col md:flex-row md:items-end gap-4 md:gap-5'
          }
        >
          <div
            className={`flex flex-col w-full min-w-0 ${isPageGrid ? 'flex-[1.4]' : 'md:flex-1'}`}
          >
            {!isPageGrid && (
              <label className="block font-haas font-light text-[#172338] mb-2">Location</label>
            )}
            <LocationTreeDropdown
              options={filteredLocationTree}
              loading={false}
              placeholder="Select location"
              triggerClassName={BAR_TRIGGER_CLASS}
              value={treeValue}
              onChange={applyTree}
              multiSelect
              closeOnSelect={false}
            />
          </div>

          <div
            className={`flex flex-col w-full min-w-0 ${isPageGrid ? 'flex-[1.4]' : 'md:flex-1'}`}
          >
            {!isPageGrid && (
              <label className="block font-haas font-light text-[#172338] mb-2">Event Type</label>
            )}
            <select
              value={eventType || ''}
              onChange={(e) => onEventTypeChange(e.target.value)}
              className={isPageGrid ? BAR_SELECT_PAGE_GRID_CLASS : BAR_SELECT_CLASS}
              style={isPageGrid ? { backgroundImage: sortSelectChevron } : undefined}
            >
              {eventTypes.map((opt) => (
                <option key={opt} value={opt === 'All' ? '' : opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {!hidePriceRange && (
          <div
            className={`flex flex-col w-full min-w-0 ${isPageGrid ? 'flex-[1.4]' : 'md:min-w-[200px] md:w-auto'}`}
          >
            {!isPageGrid && (
              <label className="block font-haas font-light text-[#172338] mb-2">Price Range</label>
            )}
            <select
              value={budgetSelectValue}
              onChange={(e) => {
                const opt = EVENT_PRICE_RANGE_OPTIONS.find((o) => o.value === e.target.value);
                if (!opt) return;
                onPriceMinChange(opt.min);
                onPriceMaxChange(opt.max);
              }}
              className={isPageGrid ? BAR_SELECT_PAGE_GRID_CLASS : BAR_SELECT_CLASS}
              style={isPageGrid ? { backgroundImage: sortSelectChevron } : undefined}
            >
              {EVENT_PRICE_RANGE_OPTIONS.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          )}

          {showSortColumn && (
            <div className="w-full md:w-[170px] shrink-0 relative">
              <select
                value={sortOrder ?? 'default'}
                onChange={(e) =>
                  onSortOrderChange?.(e.target.value as 'default' | 'asc' | 'desc')
                }
                className={SORT_SELECT_PAGE_GRID_CLASS}
                style={{ backgroundImage: sortSelectChevron }}
              >
                <option value="default">Sort by Price</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
              </select>
            </div>
          )}

          {!hideFiltersButton && (
          <div className={`flex flex-col w-full ${isPageGrid ? 'md:w-[100px] shrink-0' : 'md:w-auto'}`}>
            {!isPageGrid && (
              <label className="block font-haas font-light text-[#172338] mb-2">&nbsp;</label>
            )}
            <button
              type="button"
              onClick={() => (onOpenFilters ? onOpenFilters() : pushToList(true))}
              className={`h-[52px] w-full ${isPageGrid ? 'md:w-[100px]' : 'md:w-[120px]'} bg-white border border-[#D1D5DB] hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2 shrink-0`}
            >
              <span className="font-haas text-[14px] text-[#172338]">Filters</span>
              <FilterIcon className={`text-[#172338] ${isPageGrid ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
            </button>
          </div>
          )}

          <div className={`flex flex-col w-full ${isPageGrid ? 'md:w-[160px] shrink-0' : 'md:w-auto'}`}>
            {!isPageGrid && (
              <label className="block font-haas font-light text-[#172338] mb-2">&nbsp;</label>
            )}
            <button
              type="button"
              onClick={() => pushToList(false)}
              className={`h-[52px] w-full ${isPageGrid ? 'md:w-[160px]' : 'md:w-auto px-6'} bg-[#28F6EA] hover:brightness-95 transition flex items-center justify-center gap-2 text-[#172338] font-haas text-[14px] shrink-0`}
            >
              <span className="whitespace-nowrap">{searchButtonLabel}</span>
              <ChevronRightIcon className={`shrink-0 ${isPageGrid ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSearch;
