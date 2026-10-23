import { fetchAPI } from './fetcher'

export async function getCoordinatesFromGoogleMapUrl(googleMapUrl) {
    return fetchAPI(`/map/url?url=${encodeURIComponent(googleMapUrl)}`)
}

