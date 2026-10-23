import { fetchAPI } from "./fetcher";

/**
 * Fetch destinations to invest (name, slug, image URL).
 * Expected response: { success, data: [{ id, name, slug, imageUrl, image_url, image }] }
 */
export async function getDestinationsToInvest() {
  return fetchAPI("/destinations-to-invest");
}
