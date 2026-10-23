import axios from 'axios';
import { API_BASE_URL } from '@/lib/api/fetcher';

/** Manual body-description override for a (category, location) combo on /concierge/list. */
export type ConciergeLocationDescription = {
  id?: string;
  category?: string;
  location?: string;
  description?: string | null;
};

/**
 * Lookup by exact (case-insensitive) category + location match, e.g.
 * /concierge/list?type=Concierge+Packages&location=Mykonos. Returns null when no override is
 * configured for that combination — callers should fall back to the category's default
 * description. Works on both server (GSSP) and client (shallow filter navigations).
 */
export async function fetchConciergeLocationDescription(
  category: string,
  location: string
): Promise<ConciergeLocationDescription | null> {
  if (!category.trim() || !location.trim()) return null;
  try {
    const { data } = await axios.get<{ success?: boolean; data?: ConciergeLocationDescription | null }>(
      `${API_BASE_URL}/concierge-location-descriptions/lookup`,
      { params: { category, location }, timeout: 12000 }
    );
    if (!data?.success || !data?.data) return null;
    return data.data;
  } catch {
    return null;
  }
}
