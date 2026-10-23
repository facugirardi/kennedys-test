import { fetchAPI } from './fetcher'

export async function getAllEvents(params = {}) {
    const searchParams = new URLSearchParams();
    const { listing, ...rest } = params;
    if (listing === true || listing === 1 || listing === '1') {
        searchParams.set('listing', '1');
    }

    Object.entries(rest).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (item !== undefined && item !== null && item !== '') {
                    searchParams.append(key, String(item));
                }
            });
        } else {
            searchParams.append(key, String(value));
        }
    });

    const query = searchParams.toString();
    return fetchAPI(query ? `/event/?${query}` : '/event/');
}

/** Normaliza respuesta de GET /event con `listing=1&page=&limit=` (incluye `pagination`). */
export function parseEventsListingResponse(res) {
    const data = Array.isArray(res?.data) ? res.data : [];
    const p = res?.pagination;
    const pagination =
        p && typeof p === 'object'
            ? {
                  total: Number(p.total) || 0,
                  page: Number(p.page) || 1,
                  limit: Number(p.limit) || 12,
                  totalPages: Number(p.totalPages) || 1,
              }
            : null;
    return { data, pagination, raw: res };
}

export async function getEvent(id) {
    return fetchAPI(`/event/${id}`);
}

export async function getEventByName(name) {
    // First get all events and find by name
    const response = await getAllEvents({ listing: 1 });
    if (!response || !response.data || !Array.isArray(response.data)) {
        return null;
    }
    const event = response.data.find(e => {
        const eventName = e.name || '';
        const slugifiedName = eventName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
        return slugifiedName === name || eventName.toLowerCase() === name.toLowerCase();
    });
    if (!event) return null;

    // The listing payload is trimmed (no gallery/galleryPositions), so fetch
    // the full record for the matched event instead of returning it as-is.
    try {
        const full = await getEvent(event.id);
        if (full && full.data) {
            return { success: true, data: full.data };
        }
    } catch {
        // fall through to the trimmed listing payload below
    }
    return { success: true, data: event };
}

export async function getFeaturedEvents(limit = 3) {
    const params = new URLSearchParams();
    params.append('limit', limit);
    return fetchAPI(`/event/featured?${params.toString()}`);
}

export async function getEventCardsByEventId(eventId) {
    return fetchAPI(`/event-card/event/${eventId}`);
}
