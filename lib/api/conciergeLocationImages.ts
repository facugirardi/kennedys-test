import axios from 'axios';
import { API_BASE_URL } from '@/lib/api/fetcher';

/** Manual cover/banner image override for a (category, location) combo on /concierge/list. */
export type ConciergeLocationImage = {
  id?: string;
  category?: string;
  location?: string;
  imageUrl?: string | null;
};

/**
 * Lookup by exact (case-insensitive) category + location match, e.g.
 * /concierge/list?type=Unique+Experiences&location=Mykonos. Returns null when no override is
 * configured for that combination — callers should fall back to the category's default banner.
 * Works on both server (GSSP) and client (shallow filter navigations).
 */
export async function fetchConciergeLocationImage(
  category: string,
  location: string
): Promise<ConciergeLocationImage | null> {
  if (!category.trim() || !location.trim()) return null;
  try {
    const { data } = await axios.get<{ success?: boolean; data?: ConciergeLocationImage | null }>(
      `${API_BASE_URL}/concierge-location-images/lookup`,
      { params: { category, location }, timeout: 12000 }
    );
    if (!data?.success || !data?.data) return null;
    return data.data;
  } catch {
    return null;
  }
}
