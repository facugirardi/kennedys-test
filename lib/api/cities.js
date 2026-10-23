import { fetchAPI } from "./fetcher";

/**
 * Obtiene datos de una ciudad de real-estate (insights, gráficos, áreas, textos).
 * Espera que el backend exponga GET /real-estate/cities/:slug
 * y devuelva al menos:
 * {
 *   name, slug, heroImage, headline, intro, intro2, averageRevenue,
 *   stats: [{ label, value }],
 *   bestAreas: [string],
 *   propertySize: [{ k, v }],
 *   occupancyBuckets: [{ r, v }],
 *   typeSegments: [{ label, pct, color }],
 *   locationQuery: string
 * }
 */
export async function getCityInsights(slug) {
  if (!slug) {
    return { success: false, data: null, message: "Missing city slug" };
  }
  return fetchAPI(`/real-estate/cities/${slug}`);
}
