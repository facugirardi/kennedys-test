import { fetchAPI } from './fetcher'

export async function getItinerariesForClient(email: string) {
  return fetchAPI(`/itinerary/for-client?email=${encodeURIComponent(email)}`)
}

export async function getItineraryBySlug(slug: string) {
  return fetchAPI(`/itinerary/by-slug/${encodeURIComponent(slug)}`)
}
