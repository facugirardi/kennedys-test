import axios from 'axios';
import { API_BASE_URL } from '@/lib/api/fetcher';

/** Manual OG/share metatag override for a (category, location) combo on /concierge/list. */
export type ConciergeLocationMetaTag = {
  id?: string;
  category?: string;
  location?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImageUrl?: string | null;
};

/**
 * Lookup by exact (case-insensitive) category + location match, e.g.
 * /concierge/list?type=Concierge+Packages&location=Mykonos. Returns null when no override is
 * configured for that combination — callers should fall back to the auto-generated metatags.
 * Works on both server (GSSP) and client (shallow filter navigations).
 */
export async function fetchConciergeLocationMetaTag(
  category: string,
  location: string
): Promise<ConciergeLocationMetaTag | null> {
  if (!category.trim() || !location.trim()) return null;
  try {
    const { data } = await axios.get<{ success?: boolean; data?: ConciergeLocationMetaTag | null }>(
      `${API_BASE_URL}/concierge-location-metatags/lookup`,
      { params: { category, location }, timeout: 12000 }
    );
    if (!data?.success || !data?.data) return null;
    return data.data;
  } catch {
    return null;
  }
}

/** @deprecated Prefer fetchConciergeLocationMetaTag — same implementation. */
export const fetchConciergeLocationMetaTagServer = fetchConciergeLocationMetaTag;
