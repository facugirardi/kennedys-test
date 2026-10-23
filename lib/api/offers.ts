import { fetchAPI } from './fetcher'

export async function getOffersForClient(email: string) {
  return fetchAPI(`/shared-property/for-client?email=${encodeURIComponent(email)}`)
}
