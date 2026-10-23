import { fetchAPI } from './fetcher'

/**
 * Get all experiences
 */
export async function getAllExperiences() {
  return fetchAPI('/experiences')
}

/**
 * Get active experiences
 */
export async function getActiveExperiences() {
  return fetchAPI('/experiences/active')
}

/**
 * Get experiences by city slug (e.g. "mykonos")
 */
export async function getExperiencesByCity(city) {
  if (!city) return { success: false, data: [] }
  return fetchAPI(`/experiences/city/${encodeURIComponent(city)}`)
}

/**
 * Get a single experience by slug
 */
export async function getExperienceBySlug(slug) {
  if (!slug) return { success: false, data: null }
  return fetchAPI(`/experiences/slug/${encodeURIComponent(slug)}`)
}

/**
 * Get a single experience by ID
 */
export async function getExperienceById(id) {
  if (!id) return { success: false, data: null }
  return fetchAPI(`/experiences/${encodeURIComponent(id)}`)
}


