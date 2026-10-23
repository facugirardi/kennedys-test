import { fetchAPI } from './fetcher'

/** Metadata only (title/description/itemType/itemIds) — used to scope the real villas/real-estate/concierge list pages. No `expand`: the list pages resolve items themselves via their own filtered fetch. */
export async function getPromoPageBySlug(slug: string) {
  return fetchAPI(`/promo-page/${encodeURIComponent(slug)}`)
}
