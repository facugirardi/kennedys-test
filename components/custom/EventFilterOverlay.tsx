'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type EventFilterOverlayState = {
  serviceTypes: string[];
  priceRange: { min: number | null; max: number | null };
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EventFilterOverlayState) => void;
  initialFilters?: Partial<EventFilterOverlayState>;
};

const defaultState: EventFilterOverlayState = {
  serviceTypes: [],
  priceRange: { min: null, max: null },
};

const PANEL_TRANSITION_MS = 320;

const eventTypeOptions = [
  'Wedding',
  'Corporate',
  'Private Party',
  'Birthday',
  'Other',
];

export const EventFilterOverlay: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<EventFilterOverlayState>(() => ({
    ...defaultState,
    ...initialFilters,
    serviceTypes: initialFilters?.serviceTypes ? [...initialFilters.serviceTypes] : [],
    priceRange: {
      min: initialFilters?.priceRange?.min ?? null,
      max: initialFilters?.priceRange?.max ?? null,
    },
  }));

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange.min ?? 0,
    max: filters.priceRange.max ?? 50000,
  });

  const [mounted, setMounted] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    setAnimateIn(false);
    const t = window.setTimeout(() => setMounted(false), PANEL_TRANSITION_MS);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !mounted) {
      setAnimateIn(false);
      return;
    }
    setAnimateIn(false);
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      if (raf2) window.cancelAnimationFrame(raf2);
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const init = { ...defaultState, ...initialFilters };
    setFilters({
      ...init,
      serviceTypes: init.serviceTypes ? [...init.serviceTypes] : [],
      priceRange: {
        min: init.priceRange?.min ?? null,
        max: init.priceRange?.max ?? null,
      },
    });
    setPriceRange({
      min: init.priceRange?.min ?? 0,
      max: init.priceRange?.max ?? 50000,
    });
  }, [isOpen]);

  const handleTypeToggle = (t: string) => {
    setFilters((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(t)
        ? prev.serviceTypes.filter((x) => x !== t)
        : [...prev.serviceTypes, t],
    }));
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    setPriceRange((prev) => ({ ...prev, [type]: value }));
    setFilters((prev) => ({
      ...prev,
      priceRange: { ...prev.priceRange, [type]: value },
    }));
  };

  const clearFilters = () => {
    setFilters(defaultState);
    setPriceRange({ min: 0, max: 50000 });
  };

  const apply = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        tabIndex={isOpen ? 0 : -1}
        className={`fixed inset-0 z-[9998] border-0 bg-black transition-opacity duration-300 ease-out ${
          isOpen ? 'cursor-pointer opacity-50' : 'pointer-events-none opacity-0'
        }`}
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        className={`fixed top-0 left-0 z-[9999] flex h-full w-full max-w-[24rem] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
          isOpen && animateIn ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-filter-overlay-title"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <h2 id="event-filter-overlay-title" className="font-gtsuper-ds text-xl font-light text-gray-900">
              Filters
            </h2>
            <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto p-6">
            <div>
              <h3 className="mb-4 font-haas text-lg font-medium text-gray-900">Event type</h3>
              <div className="space-y-3">
                {eventTypeOptions.map((t) => (
                  <label key={t} className="flex cursor-pointer items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={filters.serviceTypes.includes(t)}
                      onChange={() => handleTypeToggle(t)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-haas text-sm text-gray-700">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-haas text-lg font-medium text-gray-900">Price range</h3>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="mb-1 block font-haas text-sm text-gray-700">Min</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={priceRange.min || ''}
                      onChange={(e) => handlePriceChange('min', parseInt(e.target.value, 10) || 0)}
                      className="h-10 w-full rounded-sm border border-gray-300 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block font-haas text-sm text-gray-700">Max</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={priceRange.max || ''}
                      onChange={(e) => handlePriceChange('max', parseInt(e.target.value, 10) || 50000)}
                      className="h-10 w-full rounded-sm border border-gray-300 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 p-6">
            <button type="button" onClick={clearFilters} className="font-haas text-sm text-gray-600 underline">
              Clear filters
            </button>
            <button
              type="button"
              onClick={apply}
              className="rounded-sm bg-[#198092] px-6 py-3 font-haas font-medium text-white hover:bg-[#198092]/90"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
