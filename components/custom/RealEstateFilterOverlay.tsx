import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import type { RealEstateFilterState } from '@/lib/realEstateListingSearchParams';
import { cn } from '@/lib/utils';

interface RealEstateFilterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: RealEstateFilterState) => void;
  initialFilters?: RealEstateFilterState;
  /** Mobile only: the bar's price sort lives inside the panel on small screens. */
  sortOrder?: 'default' | 'asc' | 'desc';
  onSortOrderChange?: (value: 'default' | 'asc' | 'desc') => void;
}

const emptyFilterState = (): RealEstateFilterState => ({
  priceRange: {
    min: null,
    max: null,
  },
  priceCurrency: 'eur',
  bedrooms: 'Any',
  bathrooms: 'Any',
  floors: 'Any',
  floorLevel: {
    min: null,
    max: null,
  },
  propertyType: [],
  listingStatus: [],
  squareFeet: {
    min: null,
    max: null,
  },
  lotSize: {
    min: null,
    max: null,
  },
  yearBuilt: {
    min: null,
    max: null,
  },
  listingStatusDropdown: 'All',
  area: 'All',
  outdoor: [],
  luxuryIndoor: [],
  location: [],
  view: [],
});

const propertyTypeOptions = [
  'Residential',
  'Commercial',
  'Townhomes',
  'Co-op',
  'Manufactured',
  'Multi-family',
  'Condos',
  'Land',
  'Other',
  'Penthouse',
  'Maisonette',
  'Detached Villa',
  'Semi-detached Villa'
];

const listingStatusOptions = [
  'Active',
  'Coming Soon',
  'Pending',
  'Under Contract',
  'Sold'
];

const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];
const bathroomOptions = ['Any', '1', '2', '3', '4', '5+'];
const floorsOptions = ['Any', '1+', '2+', '3+', '4+'];

const outdoorOptions = [
  'Pool',
  'Heated pool',
  'Jacuzzi',
  'Walking distance to beach',
  'Private Sea/Beach access',
  'Outdoor Gym',
  'Cinema',
  'Ice plunge',
  'Sauna',
  'Padel court'
];

const outdoorMoreOptions = [
  'Tennis court',
  'Basketball court',
  'BBQ & Dining',
  'Helipad',
  'Dock',
  'Parking',
  'Ski-in/ski-out'
];

const luxuryIndoorOptions = [
  'Indoor Pool',
  'Gym',
  'Fitness room',
  'Hammam',
  'Sauna',
  'Massage room',
  'Home Cinema',
  'Club',
  'Elevator',
  'Security'
];

const luxuryIndoorMoreOptions = [
  'Sound system',
  'Bar',
  'Smart House',
  'Professional Kitchen',
  'Staff quarters',
  'Brand New',
  'Church',
  'Underfloor heating',
  'Solar panels',
  'Security cameras',
  'Central heating',
  'Double glazed windows',
  'Security system',
  'Wood flooring',
  'Internal staircase'
];

const locationOptions = [
  'Waterfront',
  'Beachfront',
  'Resort Access',
  'Walking distance to a village',
  'Private'
];

const viewOptions = [
  'Sunset View',
  'Sea View',
  'Mountain View',
  'Town View'
];

export const RealEstateFilterOverlay: React.FC<RealEstateFilterOverlayProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters,
  sortOrder,
  onSortOrderChange
}) => {
  const [filters, setFilters] = useState<RealEstateFilterState>(
    { ...(initialFilters || emptyFilterState()), priceCurrency: 'eur' }
  );

  const [showMoreOutdoor, setShowMoreOutdoor] = useState(false);
  const [showMoreLuxuryIndoor, setShowMoreLuxuryIndoor] = useState(false);

  const [priceRange, setPriceRange] = useState({
    min: filters.priceRange.min || 0,
    max: filters.priceRange.max || 10000000
  });

  const [squareFeetRange, setSquareFeetRange] = useState({
    min: filters.squareFeet.min || 0,
    max: filters.squareFeet.max || 10000
  });

  const [lotSizeRange, setLotSizeRange] = useState({
    min: filters.lotSize.min || 0,
    max: filters.lotSize.max || 100
  });

  const [yearBuiltRange, setYearBuiltRange] = useState({
    min: filters.yearBuilt.min || 1900,
    max: filters.yearBuilt.max || 2024
  });

  useEffect(() => {
    if (!isOpen) return;
    const init = initialFilters;
    if (!init) return;
    setFilters({ ...init, priceCurrency: 'eur' });
    setPriceRange({
      min: init.priceRange.min ?? 0,
      max: init.priceRange.max ?? 10_000_000,
    });
    setSquareFeetRange({
      min: init.squareFeet.min ?? 0,
      max: init.squareFeet.max ?? 10_000,
    });
    setLotSizeRange({
      min: init.lotSize.min ?? 0,
      max: init.lotSize.max ?? 100,
    });
    setYearBuiltRange({
      min: init.yearBuilt.min ?? 1900,
      max: init.yearBuilt.max ?? 2024,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot parent filters when the drawer opens
  }, [isOpen]);

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

const handleSquareFeetChange = (type: 'min' | 'max', value: number) => {
    setSquareFeetRange(prev => ({
      ...prev,
      [type]: value
    }));
    setFilters(prev => ({
      ...prev,
      squareFeet: {
        ...prev.squareFeet,
        [type]: value
      }
    }));
  };

  const handleLotSizeChange = (type: 'min' | 'max', value: number) => {
    setLotSizeRange(prev => ({
      ...prev,
      [type]: value
    }));
    setFilters(prev => ({
      ...prev,
      lotSize: {
        ...prev.lotSize,
        [type]: value
      }
    }));
  };

  const handleYearBuiltChange = (type: 'min' | 'max', value: number) => {
    setYearBuiltRange(prev => ({
      ...prev,
      [type]: value
    }));
    setFilters(prev => ({
      ...prev,
      yearBuilt: {
        ...prev.yearBuilt,
        [type]: value
      }
    }));
  };

  const handleFloorLevelChange = (type: 'min' | 'max', raw: string) => {
    const parsed = raw === '' ? null : Math.max(0, parseInt(raw, 10));
    setFilters(prev => ({
      ...prev,
      floorLevel: {
        ...prev.floorLevel,
        [type]: parsed != null && Number.isFinite(parsed) ? parsed : null,
      },
    }));
  };

  const handlePropertyTypeChange = (propertyType: string) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(propertyType)
        ? prev.propertyType.filter(type => type !== propertyType)
        : [...prev.propertyType, propertyType]
    }));
  };

  const handleListingStatusChange = (status: string) => {
    setFilters(prev => ({
      ...prev,
      listingStatus: prev.listingStatus.includes(status)
        ? prev.listingStatus.filter(s => s !== status)
        : [...prev.listingStatus, status]
    }));
  };

  const handleOutdoorChange = (outdoor: string) => {
    setFilters(prev => ({
      ...prev,
      outdoor: prev.outdoor.includes(outdoor)
        ? prev.outdoor.filter(item => item !== outdoor)
        : [...prev.outdoor, outdoor]
    }));
  };

  const handleLuxuryIndoorChange = (luxury: string) => {
    setFilters(prev => ({
      ...prev,
      luxuryIndoor: prev.luxuryIndoor.includes(luxury)
        ? prev.luxuryIndoor.filter(item => item !== luxury)
        : [...prev.luxuryIndoor, luxury]
    }));
  };

  const handleLocationChange = (location: string) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location.includes(location)
        ? prev.location.filter(item => item !== location)
        : [...prev.location, location]
    }));
  };

  const handleViewChange = (view: string) => {
    setFilters(prev => ({
      ...prev,
      view: prev.view.includes(view)
        ? prev.view.filter(item => item !== view)
        : [...prev.view, view]
    }));
  };

  const clearFilters = () => {
    const clearedFilters = emptyFilterState();
    setFilters(clearedFilters);
    setPriceRange({ min: 0, max: 10000000 });
    setSquareFeetRange({ min: 0, max: 10000 });
    setLotSizeRange({ min: 0, max: 100 });
    setYearBuiltRange({ min: 1900, max: 2024 });
    setShowMoreOutdoor(false);
    setShowMoreLuxuryIndoor(false);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Overlay */}
      <div className={`fixed top-0 left-0 h-full w-full md:w-96 bg-white z-[9999] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-gtsuper-ds font-light text-gray-900">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Sort (mobile only: the bar's sort select is hidden on small screens) */}
            {onSortOrderChange && (
              <div className="md:hidden">
                <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Sort by Price</h3>
                <div className="relative">
                  <select
                    value={sortOrder ?? 'default'}
                    onChange={(e) => onSortOrderChange(e.target.value as 'default' | 'asc' | 'desc')}
                    className="w-full h-12 px-4 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="default">Default</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-haas font-medium text-gray-900">Price Range</h3>
              </div>

              {/* Range Slider */}
              <div className="mb-4">
                <div className="relative h-2">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gray-200"></div>
                  <div 
                    className="absolute top-0 h-2 bg-[#7CF5EE]"
                    style={{
                      left: `${(priceRange.min / 10000000) * 100}%`,
                      width: `${((priceRange.max - priceRange.min) / 10000000) * 100}%`
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: priceRange.min > priceRange.max ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: priceRange.max > priceRange.min ? 5 : 3 }}
                  />
                </div>
              </div>

              {/* Price Inputs */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-haas text-gray-700 mb-1">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      €
                    </span>
                    <input
                      type="number"
                      value={priceRange.min || ''}
                      onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value) || 0)}
                      placeholder="No Min"
                      className="w-full h-10 pl-8 pr-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-haas text-gray-700 mb-1">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      €
                    </span>
                    <input
                      type="number"
                      value={priceRange.max || ''}
                      onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value) || 10000000)}
                      placeholder="No Max"
                      className="w-full h-10 pl-8 pr-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bedrooms and Bathrooms */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                {/* Bedrooms */}
                <div>
                  <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Bedrooms</h3>
                  <div className="relative">
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => setFilters(prev => ({ ...prev, bedrooms: e.target.value }))}
                      className="w-full h-12 px-4 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {bedroomOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Bathrooms</h3>
                  <div className="relative">
                    <select
                      value={filters.bathrooms}
                      onChange={(e) => setFilters(prev => ({ ...prev, bathrooms: e.target.value }))}
                      className="w-full h-12 px-4 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {bathroomOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Floors and apartment floor level */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Floors</h3>
                  <div className="relative">
                    <select
                      value={filters.floors}
                      onChange={(e) => setFilters(prev => ({ ...prev, floors: e.target.value }))}
                      className="w-full h-12 px-4 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {floorsOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Apartment Floor</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      value={filters.floorLevel.min ?? ''}
                      onChange={(e) => handleFloorLevelChange('min', e.target.value)}
                      placeholder="From"
                      className="w-full h-12 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500 text-sm font-haas">to</span>
                    <input
                      type="number"
                      min={0}
                      value={filters.floorLevel.max ?? ''}
                      onChange={(e) => handleFloorLevelChange('max', e.target.value)}
                      placeholder="To"
                      className="w-full h-12 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Property Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {propertyTypeOptions.map((type) => (
                  <label key={type} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.propertyType.includes(type)}
                      onChange={() => handlePropertyTypeChange(type)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-haas text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Listing Status */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Listing Status</h3>
              <div className="grid grid-cols-2 gap-3">
                {listingStatusOptions.map((status) => (
                  <label key={status} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.listingStatus.includes(status)}
                      onChange={() => handleListingStatusChange(status)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-haas text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Square Meters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-haas font-medium text-gray-900">Square Meters</h3>
              </div>

              {/* Range Slider */}
              <div className="mb-4">
                <div className="relative h-2">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gray-200"></div>
                  <div 
                    className="absolute top-0 h-2 bg-[#7CF5EE]"
                    style={{
                      left: `${(squareFeetRange.min / 10000) * 100}%`,
                      width: `${((squareFeetRange.max - squareFeetRange.min) / 10000) * 100}%`
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={squareFeetRange.min}
                    onChange={(e) => handleSquareFeetChange('min', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: squareFeetRange.min > squareFeetRange.max ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={squareFeetRange.max}
                    onChange={(e) => handleSquareFeetChange('max', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: squareFeetRange.max > squareFeetRange.min ? 5 : 3 }}
                  />
                </div>
              </div>

              {/* Square Meters Inputs */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={squareFeetRange.min || ''}
                    onChange={(e) =>
                      handleSquareFeetChange('min', parseInt(e.target.value) || 0)
                    }
                    placeholder="No Min"
                    className="w-full h-10 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center text-gray-500 text-sm font-haas">to</div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={squareFeetRange.max || ''}
                    onChange={(e) =>
                      handleSquareFeetChange('max', parseInt(e.target.value) || 10000)
                    }
                    placeholder="No Max"
                    className="w-full h-10 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Lot Size */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Lot Size (acres)</h3>
              
              {/* Range Slider */}
              <div className="mb-4">
                <div className="relative h-2">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gray-200"></div>
                  <div 
                    className="absolute top-0 h-2 bg-[#7CF5EE]"
                    style={{
                      left: `${(lotSizeRange.min / 100) * 100}%`,
                      width: `${((lotSizeRange.max - lotSizeRange.min) / 100) * 100}%`
                    }}
                  ></div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lotSizeRange.min}
                    onChange={(e) => handleLotSizeChange('min', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: lotSizeRange.min > lotSizeRange.max ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lotSizeRange.max}
                    onChange={(e) => handleLotSizeChange('max', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: lotSizeRange.max > lotSizeRange.min ? 5 : 3 }}
                  />
                </div>
              </div>

              {/* Lot Size Inputs */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={lotSizeRange.min || ''}
                    onChange={(e) => handleLotSizeChange('min', parseInt(e.target.value) || 0)}
                    placeholder="No Min"
                    className="w-full h-10 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center text-gray-500 text-sm font-haas">to</div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={lotSizeRange.max || ''}
                    onChange={(e) => handleLotSizeChange('max', parseInt(e.target.value) || 100)}
                    placeholder="No Max"
                    className="w-full h-10 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Year Built */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Year Built</h3>
              
              {/* Range Slider */}
              <div className="mb-4">
                <div className="relative h-2">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gray-200"></div>
                  <div 
                    className="absolute top-0 h-2 bg-[#7CF5EE]"
                    style={{
                      left: `${((yearBuiltRange.min - 1900) / (2024 - 1900)) * 100}%`,
                      width: `${((yearBuiltRange.max - yearBuiltRange.min) / (2024 - 1900)) * 100}%`
                    }}
                  ></div>
                  <input
                    type="range"
                    min="1900"
                    max="2024"
                    value={yearBuiltRange.min}
                    onChange={(e) => handleYearBuiltChange('min', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: yearBuiltRange.min > yearBuiltRange.max ? 5 : 3 }}
                  />
                  <input
                    type="range"
                    min="1900"
                    max="2024"
                    value={yearBuiltRange.max}
                    onChange={(e) => handleYearBuiltChange('max', parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb"
                    style={{ zIndex: yearBuiltRange.max > yearBuiltRange.min ? 5 : 3 }}
                  />
                </div>
              </div>

              {/* Year Built Inputs */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    value={yearBuiltRange.min || ''}
                    onChange={(e) => handleYearBuiltChange('min', parseInt(e.target.value) || 1900)}
                    placeholder="No Min"
                    className="w-full h-10 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center text-gray-500 text-sm font-haas">to</div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={yearBuiltRange.max || ''}
                    onChange={(e) => handleYearBuiltChange('max', parseInt(e.target.value) || 2024)}
                    placeholder="No Max"
                    className="w-full h-10 px-3 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Listing Status Dropdown */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Listing Status</h3>
              <div className="relative">
                <select
                  value={filters.listingStatusDropdown}
                  onChange={(e) => setFilters(prev => ({ ...prev, listingStatusDropdown: e.target.value }))}
                  className="w-full h-12 px-4 border border-gray-300 font-haas text-sm text-[#172338] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Pending">Pending</option>
                  <option value="Under Contract">Under Contract</option>
                  <option value="Sold">Sold</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Outdoor */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Outdoor</h3>
              <div className="grid grid-cols-2 gap-3">
                {[...outdoorOptions, ...(showMoreOutdoor ? outdoorMoreOptions : [])].map((option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.outdoor.includes(option)}
                      onChange={() => handleOutdoorChange(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-haas text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowMoreOutdoor((v) => !v)}
                  className="text-sm font-haas text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showMoreOutdoor ? 'Less' : 'More'}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', showMoreOutdoor && 'rotate-180')} />
                </button>
              </div>
            </div>

            {/* Luxury Indoor Facilities */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Luxury Indoor Facilities</h3>
              <div className="grid grid-cols-2 gap-3">
                {[...luxuryIndoorOptions, ...(showMoreLuxuryIndoor ? luxuryIndoorMoreOptions : [])].map((option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.luxuryIndoor.includes(option)}
                      onChange={() => handleLuxuryIndoorChange(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-haas text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowMoreLuxuryIndoor((v) => !v)}
                  className="text-sm font-haas text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {showMoreLuxuryIndoor ? 'Less' : 'More'}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', showMoreLuxuryIndoor && 'rotate-180')} />
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">Location</h3>
              <div className="grid grid-cols-2 gap-3">
                {locationOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.location.includes(option)}
                      onChange={() => handleLocationChange(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-haas text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* View */}
            <div>
              <h3 className="text-sm font-haas font-medium text-gray-900 mb-3">View</h3>
              <div className="grid grid-cols-2 gap-3">
                {viewOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.view.includes(option)}
                      onChange={() => handleViewChange(option)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-haas text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={clearFilters}
                className="text-sm font-haas text-gray-600 underline hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-3 bg-[#172338] hover:bg-[#0f1a1f] text-white font-haas font-medium transition-colors flex items-center gap-2"
              >
                See results
                <span className="text-lg">›</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
