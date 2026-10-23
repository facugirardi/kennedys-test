import { fetchAPI, mutateAPI } from './fetcher'


/**
 * Get all properties with optional filters
 * @param {Object} [filters] - Optional filters to apply to the query
 * @param {string} [filters.location] - Filter by location
 * @param {number} [filters.take] - Number of properties to return
 * @param {string} [filters.type] - Filter by property type
 * @param {number} [filters.bedrooms] - Filter by number of bedrooms
 * @param {number} [filters.minPrice] - Minimum price filter
 * @param {number} [filters.maxPrice] - Maximum price filter
 * @param {boolean} [filters.random] - Randomize the results
 * @returns {Promise} - Promise with the filtered properties
 */
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export async function getAllProperties(filters = {}) {
    // Build query string from filters object
    const queryParams = new URLSearchParams();
    
    // Add each filter to the query params if it exists
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
            // Convert boolean to string explicitly
            const paramValue = typeof value === 'boolean' ? String(value) : value;
            queryParams.append(key, paramValue);
        }
    });
    
    // Siempre enviar pageSize o take para que la API devuelva paginación consistente; backend aplica máximo 100
    if (!queryParams.has('pageSize') && !queryParams.has('take')) {
        queryParams.append('pageSize', String(DEFAULT_PAGE_SIZE));
    } else if (queryParams.has('take')) {
        const take = parseInt(queryParams.get('take'), 10);
        if (!isNaN(take) && take > MAX_PAGE_SIZE) {
            queryParams.set('take', String(MAX_PAGE_SIZE));
        }
    } else if (queryParams.has('pageSize')) {
        const ps = parseInt(queryParams.get('pageSize'), 10);
        if (!isNaN(ps) && ps > MAX_PAGE_SIZE) {
            queryParams.set('pageSize', String(MAX_PAGE_SIZE));
        }
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/property/?${queryString}` : '/property/';
    return fetchAPI(url);
}

/**
 * Lean payload for the real estate list map markers: id, price, location, googleMapUrl and a
 * single image per property — none of the pagination/full-classification cost of getAllProperties.
 */
export async function getRealEstateMapPins(filters = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
            const paramValue = typeof value === 'boolean' ? String(value) : value
            queryParams.append(key, paramValue)
        }
    })
    const queryString = queryParams.toString()
    const url = queryString ? `/property/map-pins?${queryString}` : '/property/map-pins'
    return fetchAPI(url)
}

export async function getProperty(id) {
    return fetchAPI(`/property/${id}/`)
}

/** Villas curated in kennedys-loggia's Property Management section — backs the public /agent-calendar grid. */
export async function getManagedProperties() {
    return fetchAPI('/property/managed')
}

export async function getPropertyBySlug(slug) {
    return fetchAPI(`/property/slug/${encodeURIComponent(slug)}/`)
}

/** Resolves a property that used to be reachable at this slug before it was renamed — see
 * `previousSlugs` on the API's Property model. Used only as a 404 fallback so old, already
 * Google-indexed villa URLs can redirect to the current canonical URL instead of dying. */
export async function getPropertyByPreviousSlug(slug) {
    return fetchAPI(`/property/previous-slug/${encodeURIComponent(slug)}/`)
}

export async function createProperty(userData) {
    return mutateAPI('/property/', 'POST', userData)
}

export async function patchProperty(userData) {
    return mutateAPI(`/property/`, 'PATCH', userData)
}

export async function patchClassification(userData) {
    return mutateAPI(`/classification/`, 'PATCH', userData)
}

export async function patchDescription(userData) {
    return mutateAPI(`/description/`, 'PATCH', userData)
}

export async function updateProperty(id, userData) {
    return mutateAPI(`/users/${id}`, 'PUT', userData)
}

export async function patchAmenities(userData) {
    return mutateAPI(`/amenity/`, 'PATCH', userData)
}

/**
 * Get filter options for properties
 * @returns {Promise} - Promise with the filter options
 */
export async function getFilterOptions(params = {}) {
    const qs = new URLSearchParams();
    if (typeof params.rental === 'boolean') {
        qs.append('rental', params.rental);
    }
    if (params.category) {
        qs.append('category', params.category);
    }
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return fetchAPI(`/property/filter-options${suffix}`);
}

/**
 * Get aggregated statistics for a list of locations, with optional filters
 * @param {string[]} locations
 * @param {Object} [filters]
 * @param {boolean} [filters.rental]
 * @param {string} [filters.category]
 */
export async function getPropertyLocationStats(locations = [], filters = {}) {
  if (!Array.isArray(locations) || locations.length === 0) {
    throw new Error('At least one location is required');
  }

  const params = new URLSearchParams();
  params.append('locations', locations.join(','));
  if (typeof filters.rental === 'boolean') {
    params.append('rental', String(filters.rental));
  }
  if (filters.category) {
    params.append('category', filters.category);
  }
  return fetchAPI(`/property/stats/location?${params.toString()}`);
}

export async function getTrendingProperties(top = 1) {
    const params = new URLSearchParams();
    params.append('top', top);
    return fetchAPI(`/property/trending?${params.toString()}`);
}

/**
 * Get calendar events from an iCal URL
 * @param {string} url - The iCal URL
 * @returns {Promise} - Promise with the calendar events
 */
export async function getCalendarEvents(url) {
    if (!url) {
        return { success: false, data: null, message: 'No iCal URL provided' };
    }
    const params = new URLSearchParams();
    params.append('url', url);
    return fetchAPI(`/property/calendar?${params.toString()}`);
}

/**
 * Sync iCal to availability dates for a property (updates property_availability_dates).
 * Call when opening the Availability tab to refresh calendar from iCal.
 * @param {string} propertyId
 * @returns {Promise}
 */
export async function syncIcalToAvailability(propertyId) {
    if (!propertyId) return { success: false, message: 'Property ID required' };
    return mutateAPI(`/availability-range/sync-ical/${propertyId}`, 'POST');
}
