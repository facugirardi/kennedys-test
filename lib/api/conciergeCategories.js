import { fetchAPI } from './fetcher'

/**
 * Public concierge categories (card/banner images per category, managed from
 * Loggia's Website Images > Concierge tab). Enabled rows only, ordered by `order`.
 */
export async function getAllConciergeCategories() {
  return fetchAPI('/concierge-categories/')
}
