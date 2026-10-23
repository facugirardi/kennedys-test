import { fetchAPI, mutateAPI } from './fetcher'

export async function getAllServices(params) {
    return fetchAPI('/services/', {
        params
    })
}

/** Distinct concierge service types only (e.g. for the footer's nav links) — much lighter than
 * getAllServices(), which loads every service with all its joined product details. */
export async function getServiceTypes() {
    return fetchAPI('/services/types')
}

/** Unified library-product catalogue (chef, chauffeur, yacht, conciergepackage, etc — one row per
 * dedicated product model) — same source Loggia's offer builder picks concierge items from. */
export async function getLibraryServices(filters = {}) {
    const params = new URLSearchParams()
    if (filters.name) params.append('name', filters.name)
    if (filters.country) params.append('country', filters.country)
    if (filters.location) params.append('location', filters.location)
    if (filters.productType?.length) {
        params.append('productType', Array.isArray(filters.productType) ? filters.productType.join(',') : filters.productType)
    }
    const qs = params.toString()
    return fetchAPI(`/services/library-services${qs ? `?${qs}` : ''}`)
}

export async function getService(id, options = {}) {
    const params = options.forWebsite ? { forWebsite: 'true' } : {}
    return fetchAPI(`/services/${id}`, { params })
}

export async function getAllChauffeur() {
    return fetchAPI(`/chauffeur`)
}

export async function getChauffeur(id) {
    return fetchAPI(`/chauffeur/${id}`)
}

export async function createChauffeur(userData) {
    return mutateAPI('/chauffeur/', 'POST', userData)
}

export async function patchChauffeur(userData) {
    return mutateAPI(`/chauffeur/`, 'PATCH', userData)
}

export async function getAllYacht() {
    return fetchAPI(`/yacht`)
}

export async function getYacht(id) {
    return fetchAPI(`/yacht/${id}`)
}

export async function createYacht(userData) {
    return mutateAPI('/yacht/', 'POST', userData)
}

export async function patchYacht(userData) {
    return mutateAPI(`/yacht/`, 'PATCH', userData)
}

export async function getChef(id) {
    return fetchAPI(`/chef/${id}`)
}

export async function createChef(userData) {
    return mutateAPI('/chef/', 'POST', userData)
}

export async function patchChef(userData) {
    return mutateAPI(`/chef/`, 'PATCH', userData)
}
