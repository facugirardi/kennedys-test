'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface FilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  /** Valores parciales al abrir (p. ej. events list sin `area`). */
  initialFilters?: Partial<FilterState>;
}

export interface FilterState {
  location: string;
  area: string;
  serviceTypes: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  /** Yacht Rental only: length range in meters. */
  lengthRange: {
    min: number | null;
    max: number | null;
  };
  /** Yacht Rental only: passenger/guest capacity range. */
  capacityRange: {
    min: number | null;
    max: number | null;
  };
}

const serviceTypeOptions = [
  'Yacht Rental',
  'Personalized Itineraries',
  'Jet Charter',
  'Helicopter',
  'Chauffeur Service',
  'Tours & Experiences',
  'Security',
  'Kids Entertainment',
  'Plane Flights',
  'Salon & Beauty',
  'Unique Experiences',
  'Concierge Packages'
];

const YACHT_SERVICE_TYPE = 'Yacht Rental';

const defaultFilterState: FilterState = {
  location: '',
  area: '',
  serviceTypes: [],
  priceRange: {
    min: null,
    max: null
  },
  lengthRange: {
    min: null,
    max: null
  },
  capacityRange: {
    min: null,
    max: null
  }
};

const PRICE_MAX = 10000;

export const FilterOverlay: React.FC<FilterOverlayProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters
}) => {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilterState,
    ...initialFilters,
    serviceTypes: initialFilters?.serviceTypes ?? defaultFilterState.serviceTypes,
    priceRange: {
      min: initialFilters?.priceRange?.min ?? defaultFilterState.priceRange.min,
      max: initialFilters?.priceRange?.max ?? defaultFilterState.priceRange.max,
    },
    lengthRange: {
      min: initialFilters?.lengthRange?.min ?? defaultFilterState.lengthRange.min,
      max: initialFilters?.lengthRange?.max ?? defaultFilterState.lengthRange.max,
    },
    capacityRange: {
      min: initialFilters?.capacityRange?.min ?? defaultFilterState.capacityRange.min,
      max: initialFilters?.capacityRange?.max ?? defaultFilterState.capacityRange.max,
    },
  }));

  const serviceTypesKey = initialFilters?.serviceTypes?.join('\0') ?? '';

  useEffect(
    () => {
      if (!isOpen) return;
      const init = { ...defaultFilterState, ...initialFilters };
      setFilters({
        ...init,
        serviceTypes: init.serviceTypes ? [...init.serviceTypes] : [],
        priceRange: {
          min: init.priceRange?.min ?? null,
          max: init.priceRange?.max ?? null,
        },
        lengthRange: {
          min: init.lengthRange?.min ?? null,
          max: init.lengthRange?.max ?? null,
        },
        capacityRange: {
          min: init.capacityRange?.min ?? null,
          max: init.capacityRange?.max ?? null,
        },
      });
      setPriceRange({
        min: init.priceRange?.min ?? 0,
        max: init.priceRange?.max ?? PRICE_MAX,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- granular fields only; full `initialFilters` churns each render
    [
      isOpen,
      initialFilters?.location,
      initialFilters?.area,
      initialFilters?.priceRange?.min,
      initialFilters?.priceRange?.max,
      initialFilters?.lengthRange?.min,
      initialFilters?.lengthRange?.max,
      initialFilters?.capacityRange?.min,
      initialFilters?.capacityRange?.max,
      serviceTypesKey,
    ],
  );

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange.min || 0,
    max: filters.priceRange.max || PRICE_MAX
  });

  useEffect(() => {
    setPriceRange({
      min: filters.priceRange.min || 0,
      max: filters.priceRange.max || PRICE_MAX
    });
  }, [filters.priceRange.min, filters.priceRange.max]);

  const handleServiceTypeChange = (serviceType: string) => {
    setFilters(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(serviceType)
        ? prev.serviceTypes.filter(type => type !== serviceType)
        : [...prev.serviceTypes, serviceType]
    }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }));
  };

  const handleLengthRangeChange = (type: 'min' | 'max', value: number | null) => {
    setFilters(prev => ({
      ...prev,
      lengthRange: {
        ...prev.lengthRange,
        [type]: value,
      },
    }));
  };

  const handleCapacityRangeChange = (type: 'min' | 'max', value: number | null) => {
    setFilters(prev => ({
      ...prev,
      capacityRange: {
        ...prev.capacityRange,
        [type]: value,
      },
    }));
  };

  const isYachtSelected = filters.serviceTypes.includes(YACHT_SERVICE_TYPE);

  const clearFilters = () => {
    setFilters({
      location: '',
      area: '',
      serviceTypes: [],
      priceRange: { min: null, max: null },
      lengthRange: { min: null, max: null },
      capacityRange: { min: null, max: null },
    });
    setPriceRange({ min: 0, max: PRICE_MAX });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  const trackLeftPct = PRICE_MAX > 0 ? (priceRange.min / PRICE_MAX) * 100 : 0;
  const trackWidthPct = PRICE_MAX > 0 ? Math.max(0, ((priceRange.max - priceRange.min) / PRICE_MAX) * 100) : 0;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-[9998] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed top-0 left-0 h-full w-96 bg-white z-[9999] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#172338]">
            <h2 className="text-xl font-gtsuper-ds font-light text-[#172338]">Filters</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-[#172338]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Service Type */}
            <div>
              <h3 className="text-sm font-haas font-normal text-[#172338] mb-3">Service Type</h3>
              <div className="space-y-3">
                {serviceTypeOptions.map((serviceType) => (
                  <label key={serviceType} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.serviceTypes.includes(serviceType)}
                      onChange={() => handleServiceTypeChange(serviceType)}
                      className="w-4 h-4 accent-[#172338] border-[#172338] rounded-none"
                    />
                    <span className="text-sm font-haas text-[#172338]">{serviceType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-haas font-normal text-[#172338] mb-3">Price Range</h3>
              <div className="mb-4">
                <div className="relative h-8 dual-range-slider">
                  <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 bg-gray-200" />
                  <div
                    className="absolute top-1/2 h-2 -translate-y-1/2 bg-[#7CF5EE]"
                    style={{ left: `${trackLeftPct}%`, width: `${trackWidthPct}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX}
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value, 10))}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-8 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: priceRange.min > priceRange.max ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX}
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value, 10))}
                    className="absolute top-1/2 left-0 w-full -translate-y-1/2 h-8 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: priceRange.max > priceRange.min ? 5 : 3 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-haas text-sm text-[#172338]">${priceRange.min.toLocaleString()}</span>
                  <span className="font-haas text-sm text-[#172338]">${priceRange.max >= PRICE_MAX ? `${PRICE_MAX.toLocaleString()}+` : priceRange.max.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-haas font-normal text-[#172338] mb-1">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#172338] font-haas">$</span>
                    <input
                      type="number"
                      value={priceRange.min || ''}
                      onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value, 10) || 0)}
                      placeholder="Min"
                      className="w-full h-11 pl-8 pr-3 border border-[#172338] rounded-none font-haas text-[#172338] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-haas font-normal text-[#172338] mb-1">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#172338] font-haas">$</span>
                    <input
                      type="number"
                      value={priceRange.max || ''}
                      onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value, 10) || PRICE_MAX)}
                      placeholder="Max"
                      className="w-full h-11 pl-8 pr-3 border border-[#172338] rounded-none font-haas text-[#172338] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Yacht-only: Length + Capacity/Passengers */}
            {isYachtSelected && (
              <>
                <div>
                  <h3 className="text-sm font-haas font-normal text-[#172338] mb-3">Length (meters)</h3>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-haas font-normal text-[#172338] mb-1">Min Length</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.lengthRange.min ?? ''}
                        onChange={(e) => handleLengthRangeChange('min', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="Min"
                        className="w-full h-11 px-3 border border-[#172338] rounded-none font-haas text-[#172338] focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-haas font-normal text-[#172338] mb-1">Max Length</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.lengthRange.max ?? ''}
                        onChange={(e) => handleLengthRangeChange('max', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="Max"
                        className="w-full h-11 px-3 border border-[#172338] rounded-none font-haas text-[#172338] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-haas font-normal text-[#172338] mb-3">Capacity / Passengers</h3>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-haas font-normal text-[#172338] mb-1">Min Guests</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.capacityRange.min ?? ''}
                        onChange={(e) => handleCapacityRangeChange('min', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        placeholder="Min"
                        className="w-full h-11 px-3 border border-[#172338] rounded-none font-haas text-[#172338] focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-haas font-normal text-[#172338] mb-1">Max Guests</label>
                      <input
                        type="number"
                        min={0}
                        value={filters.capacityRange.max ?? ''}
                        onChange={(e) => handleCapacityRangeChange('max', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                        placeholder="Max"
                        className="w-full h-11 px-3 border border-[#172338] rounded-none font-haas text-[#172338] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#172338] p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-haas text-[#172338] underline hover:opacity-70 transition-opacity"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-6 py-3 bg-[#7CF5EE] hover:bg-[#6EE5D8] text-[#172338] font-haas font-normal transition-colors flex items-center gap-2"
              >
                Apply filters
                <span className="text-lg">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
