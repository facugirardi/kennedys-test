"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { PriceSortSelect } from "@/components/custom/PriceSortSelect";
import {
  LocationTreeDropdown,
  type LocationCountryGroup,
  type LocationTreeSelection,
} from "@/components/custom/LocationTreeDropdown";

const PRICE_MIN = 0;
const PRICE_MAX = 50_000_000;
const PRICE_STEP = 100_000;

const SORT_CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23172338' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

type Props = {
  locationsByCountry?: LocationCountryGroup[];
  locationsLoading?: boolean;
  locationValue?: LocationTreeSelection;
  onLocationChange?: (value: LocationTreeSelection) => void;
  onSearch?: (filters: {
    location?: string;
    area?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    bedrooms?: number | null;
    sortBy?: 'default' | 'asc' | 'desc';
  }) => void;
  onFiltersOpen?: () => void;
  /** Hides the desktop labels row (used when the bar is stuck under the navbar). */
  compact?: boolean;
};

function formatBudgetLabel(min: number, max: number): string {
  const fmt = (n: number, end: boolean) => {
    if (n <= 0 && !end) return "€0";
    if (n >= PRICE_MAX && end) return "€50M+";
    if (n >= 1_000_000) {
      const m = n / 1_000_000;
      const t = m >= 10 ? Math.round(m) : Math.round(m * 10) / 10;
      return `€${t}M`;
    }
    if (n >= 1_000) return `€${Math.round(n / 1_000)}K`;
    return `€${n}`;
  };
  return `${fmt(min, false)} – ${fmt(max, true)}`;
}

function budgetTriggerLabel(min: number, max: number): string {
  if (min <= PRICE_MIN && max >= PRICE_MAX) return "Any price";
  return formatBudgetLabel(min, max);
}

function fmtBudgetInputDigits(digits: string): string {
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const SearchForm = ({
  locationsByCountry = [],
  locationsLoading = false,
  locationValue: controlledLocation,
  onLocationChange,
  onSearch,
  onFiltersOpen,
  compact = false,
}: Props) => {
  const [internalCountry, setInternalCountry] = useState("");
  const [internalRegion, setInternalRegion] = useState("");
  const [internalArea, setInternalArea] = useState("");
  const [internalScope, setInternalScope] = useState<"country" | "region" | undefined>(undefined);
  const [internalDisplayRegion, setInternalDisplayRegion] = useState("");
  const [internalSelectedLeaves, setInternalSelectedLeaves] = useState<string[] | undefined>(undefined);

  const isControlled = controlledLocation != null && onLocationChange != null;
  const selectedCountry = isControlled ? controlledLocation.selectedCountry : internalCountry;
  const regionValue = isControlled ? controlledLocation.regionValue : internalRegion;
  const treeArea = isControlled ? controlledLocation.area : internalArea;
  const treeScope = isControlled ? controlledLocation.scope : internalScope;
  const treeDisplayRegion = isControlled ? controlledLocation.displayRegion : internalDisplayRegion;

  const setTree = (next: LocationTreeSelection) => {
    if (isControlled) {
      onLocationChange(next);
    } else {
      setInternalCountry(next.selectedCountry);
      setInternalRegion(next.regionValue);
      setInternalArea(next.area);
      setInternalScope(next.scope);
      setInternalDisplayRegion(next.displayRegion ?? "");
      setInternalSelectedLeaves(next.selectedLeaves);
    }
  };

  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [pickerBudMinInput, setPickerBudMinInput] = useState("");
  const [pickerBudMaxInput, setPickerBudMaxInput] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [sortBy, setSortBy] = useState<'default' | 'asc' | 'desc'>('default');

  const locationTreeValue = useMemo<LocationTreeSelection>(
    () => ({
      selectedCountry,
      regionValue,
      area: treeArea,
      scope: treeScope,
      displayRegion: treeDisplayRegion || undefined,
      selectedLeaves: isControlled ? controlledLocation.selectedLeaves : internalSelectedLeaves,
    }),
    [selectedCountry, regionValue, treeArea, treeScope, treeDisplayRegion, isControlled, controlledLocation, internalSelectedLeaves]
  );

  const buildSearchPayload = () => {
    const [pMin, pMax] = priceRange;
    const minPrice = pMin <= PRICE_MIN ? null : pMin;
    const maxPrice = pMax >= PRICE_MAX ? null : pMax;
    const bedroomsVal = bedrooms <= 1 ? null : bedrooms;

    const leaves = locationTreeValue.selectedLeaves;
    const locationForSearch = leaves && leaves.length > 0
      ? Array.from(new Set(leaves.map((s) => s.trim()).filter(Boolean))).join(",") || undefined
      : regionValue.trim() || undefined;

    return {
      location: locationForSearch,
      area: treeArea.trim() || undefined,
      minPrice,
      maxPrice,
      bedrooms: bedroomsVal,
      sortBy,
    };
  };

  const serializeFilters = () => JSON.stringify(buildSearchPayload());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lastFiredFiltersRef.current = serializeFilters();
    onSearch?.(buildSearchPayload());
  };

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  /**
   * Auto-busca al cambiar la barra (mismo patrón que /real-estate/list): debounce, sin requerir "Check Now".
   * Compara contra el último filtro disparado (en vez de un flag "ya montó") para no dispararse en el
   * montaje inicial bajo React Strict Mode, que invoca este efecto dos veces con el mismo estado.
   */
  const lastFiredFiltersRef = useRef<string>(serializeFilters());
  useEffect(() => {
    const key = serializeFilters();
    if (key === lastFiredFiltersRef.current) return;
    const t = setTimeout(() => {
      lastFiredFiltersRef.current = key;
      onSearchRef.current?.(buildSearchPayload());
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationTreeValue, priceRange, bedrooms, sortBy]);

  return (
    <div className="bg-white">
      {/* Labels row */}
      <div className={`hidden ${compact ? '' : 'md:flex'} gap-2 text-xs font-haas text-[#506A70] uppercase tracking-wide mb-1 px-0`}>
        <div className="flex-[1.4] min-w-0 px-1">Location</div>
        <div className="flex-[1.4] min-w-0 px-1">Budget</div>
        <div className="w-[130px] shrink-0 px-1">Bedrooms</div>
        <div className="w-[170px] shrink-0 px-1">Sort by Price</div>
        <div className="w-[100px] shrink-0" />
        <div className="w-[160px] shrink-0" />
      </div>

      <form
        className="flex flex-row gap-2"
        onSubmit={handleSubmit}
      >
        {/* Location */}
        <div className="flex-[1.4] min-w-0">
          <LocationTreeDropdown
            options={locationsByCountry}
            loading={locationsLoading}
            placeholder="Select location"
            triggerClassName="w-full h-[52px] font-haas text-[14px] text-[#172338] bg-white border border-[#D1D5DB] pl-4 pr-14 focus:outline-none"
            value={locationTreeValue}
            onChange={setTree}
            multiSelect
            closeOnSelect={false}
            variant="editorial"
          />
        </div>

        {/* Budget (desktop; on mobile it lives in the Filters panel) */}
        <div className="hidden md:block flex-[1.4] min-w-0">
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
              <button
                type="button"
                className="flex h-[52px] w-full items-center justify-between gap-2 border border-[#D1D5DB] bg-white px-3 text-left focus:outline-none"
              >
                <span className="truncate tabular-nums font-haas text-[14px] text-[#172338]">
                  {budgetTriggerLabel(priceRange[0], priceRange[1])}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[#506A70]" aria-hidden />
              </button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                sideOffset={4}
                align="start"
                className="z-[10000] w-[min(100vw-2rem,22rem)] border border-gray-200 bg-white p-4 shadow-lg outline-none"
              >
                <p className="mb-3 text-xs font-haas tabular-nums text-[#506A70]">
                  {budgetTriggerLabel(priceRange[0], priceRange[1])}
                </p>
                <SliderPrimitive.Root
                  className="relative flex w-full touch-none select-none items-center py-2"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={priceRange}
                  onValueChange={(v) => {
                    const [a, b] = v;
                    if (typeof a === "number" && typeof b === "number") {
                      setPriceRange([a, b]);
                      setPickerBudMinInput(a > PRICE_MIN ? String(a) : "");
                      setPickerBudMaxInput(b < PRICE_MAX ? String(b) : "");
                    }
                  }}
                  aria-label="Budget range"
                >
                  <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#506A70]/20">
                    <SliderPrimitive.Range className="absolute h-full bg-[#506A70]" />
                  </SliderPrimitive.Track>
                  <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#506A70]/60 bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]/40" />
                  <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-[#506A70]/60 bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#506A70]/40" />
                </SliderPrimitive.Root>
                <div className="mt-3 flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-haas text-[#506A70]">Min</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="€0"
                      value={fmtBudgetInputDigits(pickerBudMinInput)}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setPickerBudMinInput(v);
                        const n = Number(v);
                        if (v !== "" && !Number.isNaN(n)) {
                          setPriceRange([Math.min(n, priceRange[1] - PRICE_STEP), priceRange[1]]);
                        } else if (v === "") {
                          setPriceRange([PRICE_MIN, priceRange[1]]);
                        }
                      }}
                      className="w-full border border-gray-300 px-2 py-1.5 text-sm font-haas text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#506A70]/40"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-haas text-[#506A70]">Max</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Any"
                      value={fmtBudgetInputDigits(pickerBudMaxInput)}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setPickerBudMaxInput(v);
                        const n = Number(v);
                        if (v !== "" && !Number.isNaN(n) && n > 0) {
                          setPriceRange([priceRange[0], Math.max(n, priceRange[0] + PRICE_STEP)]);
                        } else if (v === "") {
                          setPriceRange([priceRange[0], PRICE_MAX]);
                        }
                      }}
                      className="w-full border border-gray-300 px-2 py-1.5 text-sm font-haas text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#506A70]/40"
                    />
                  </div>
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>

        {/* Bedrooms */}
        <div className="hidden md:block w-full md:w-[130px] shrink-0">
          <div className="flex items-center h-[52px] border border-[#D1D5DB]">
            <button
              type="button"
              onClick={() => setBedrooms((prev) => (prev <= 2 ? 1 : prev - 1))}
              className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-r border-[#D1D5DB] text-lg leading-none"
            >
              −
            </button>
            <span className="flex-1 text-center font-haas text-[14px] text-[#172338] select-none">
              {bedrooms <= 1 ? 'Any' : bedrooms}
            </span>
            <button
              type="button"
              onClick={() => setBedrooms((prev) => prev + 1)}
              className="h-full w-10 flex items-center justify-center text-[#172338] hover:bg-[#F0F3F5] transition border-l border-[#D1D5DB] text-lg leading-none"
            >
              +
            </button>
          </div>
        </div>

        {/* Sort by Price */}
        <div className="hidden md:block w-full md:w-[170px] shrink-0">
          <PriceSortSelect
            value={sortBy}
            onChange={setSortBy}
            triggerClassName="h-[52px] border border-[#D1D5DB] pl-3 pr-3"
          />
        </div>

        {/* Filters button */}
        <div className="md:w-[100px] shrink-0">
          <button
            type="button"
            onClick={onFiltersOpen}
            className="h-[52px] w-full px-4 md:px-0 bg-white border border-[#D1D5DB] hover:bg-[#EEF2F6] transition flex items-center justify-center gap-2"
          >
            <span className="font-haas text-[14px] text-[#172338]">Filters</span>
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#172338]" />
          </button>
        </div>

        {/* Search button */}
        <div className="hidden md:block w-full md:w-[160px] shrink-0">
          <button
            type="submit"
            className="h-[52px] w-full bg-[#28F6EA] hover:brightness-95 transition flex items-center justify-center gap-2 text-[#172338] font-haas text-[14px]"
          >
            <span className="whitespace-nowrap">Check Now</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </form>
    </div>
  );
};
