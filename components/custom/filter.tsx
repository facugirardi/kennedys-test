import React, { useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface Props {
  onApplyFilters?: (filters: any) => void;
  onClose: () => void;
}

const FiltersSidebar = ({ onApplyFilters, onClose }: Props) => {
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [outdoor, setOutdoor] = useState<string[]>([]);
  const [locationCategory, setLocationCategory] = useState<string[]>([]);
  const [view, setView] = useState<string[]>([]);
  const [guests, setGuests] = useState('');
  const [specialDeal, setSpecialDeal] = useState(false);
  const [exclusiveManagement, setExclusiveManagement] = useState(false);
  const [published, setPublished] = useState(false);

  const amenities = [
    'Pool', 'Heated pool', 'Jacuzzi', 'Walking distance to beach',
    'Outdoor Gym', 'Cinema', 'Ice plunge', 'Sauna'
  ];

  const propertyTypes = [
    'Villa', 'Luxury Villa', 'Resort Villas', 'Luxury Estates',
    'Chalets', 'Beach House', 'Bungalows', 'Townhouses', 'Private Islands', 'Apartment', 'Boat',
    'Penthouse', 'Maisonette', 'Detached Villa', 'Semi-detached Villa'
  ];

  const locationCategories = [
    'Private', 'Part of a complex', 'Part of a Hotel', 'Part of a resort'
  ];

  const views = [
    'Sunset View', 'Sunrise View', 'Panoramic Sea View', 'Sea View', 'Semi Sea View', 'Mountain View'
  ];

  const locations = [
    'Waterfront', 'Beachfront', 'Resort Access', 'Walking distance to a village', 'Private', 'Sea Access', 'Beach Access'
  ];

  const handleArrayChange = (array: string[], setter: (value: string[]) => void, option: string) => {
    setter(
      array.includes(option) ? array.filter(item => item !== option) : [...array, option]
    );
  };

  const handleApply = () => {
    onApplyFilters?.({
      location,
      area,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      outdoor,
      locationCategory,
      view,
      guests,
      specialDeal,
      exclusiveManagement,
      published,
    });
  };

  return (
    <div className="w-[35rem] h-full bg-white shadow-xl flex flex-col">
      <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-black text-xl p-2 -mr-2"
        >
          &times;
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 pt-4">

      {/* Location */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Location</label>
        <div className="relative">
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 appearance-none"
          >
            <option value="">All</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Area */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Area</label>
        <div className="relative">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 appearance-none"
          >
            <option value="">All</option>
            <option value="Mykonos">Mykonos</option>
            <option value="Ibiza">Ibiza</option>
            <option value="Santorini">Santorini</option>
            <option value="Crete">Crete</option>
          </select>
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Price Range</label>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="number"
            placeholder="$ No Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="$ No Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 border border-gray-300 rounded px-3 py-2"
          />
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Property Type</label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          {propertyTypes.map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={propertyType.includes(type)}
                onChange={() => handleArrayChange(propertyType, setPropertyType, type)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Bedrooms / Bathrooms / Guests */}
      <div className="flex gap-3 mb-4">
        {[
          { label: 'Bedrooms', value: bedrooms, setter: setBedrooms },
          { label: 'Bathrooms', value: bathrooms, setter: setBathrooms },
          { label: 'Guests', value: guests, setter: setGuests },
        ].map(({ label, value, setter }) => (
          <div key={label} className="w-1/3">
            <label className="block text-sm mb-1">{label}</label>
            <select
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Location Category */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Location Category</label>
        <div className="grid grid-cols-1 gap-y-2 text-sm">
          {locationCategories.map((category) => (
            <label key={category} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={locationCategory.includes(category)}
                onChange={() => handleArrayChange(locationCategory, setLocationCategory, category)}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* View */}
      <div className="mb-4">
        <label className="block text-sm mb-2">View</label>
        <div className="grid grid-cols-1 gap-y-2 text-sm">
          {views.map((viewOption) => (
            <label key={viewOption} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={view.includes(viewOption)}
                onChange={() => handleArrayChange(view, setView, viewOption)}
              />
              {viewOption}
            </label>
          ))}
        </div>
      </div>

      {/* Outdoor amenities */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Outdoor</label>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          {amenities.map((item) => (
            <label key={item} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={outdoor.includes(item)}
                onChange={() => handleArrayChange(outdoor, setOutdoor, item)}
              />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Special Options */}
      <div className="mb-4">
        <label className="block text-sm mb-2">Special Options</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={specialDeal}
              onChange={(e) => setSpecialDeal(e.target.checked)}
            />
            Special Deal
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={exclusiveManagement}
              onChange={(e) => setExclusiveManagement(e.target.checked)}
            />
            Exclusive Management
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
        </div>
      </div>

      </div>
      
      {/* Apply Button - Fixed at bottom */}
      <div className="p-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleApply}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FiltersSidebar;
