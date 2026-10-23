import { fetchAPI } from './fetcher'

/**
 * Obtiene todos los top searches activos
 */
export async function getTopSearches() {
    return fetchAPI('/top-searches')
}

