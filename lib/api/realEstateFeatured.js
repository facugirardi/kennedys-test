import { fetchAPI } from "./fetcher";

/**
 * Admin-curated pool of real-estate properties for the "Properties you'll love" section.
 * Expected response: { success, data: [property, ...] } (published/visible only).
 */
export async function getFeaturedRealEstateSelection() {
  return fetchAPI("/real-estate-featured/public");
}
