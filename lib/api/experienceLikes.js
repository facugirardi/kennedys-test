import { fetchAPI, mutateAPI } from './fetcher'

export async function getUserExperienceLikes(userId) {
  if (!userId) {
    throw new Error('User ID is required to load favourites')
  }

  return fetchAPI(`/experience-likes/user/${userId}`)
}

export async function checkExperienceLike(userId, experienceId) {
  if (!userId || !experienceId) {
    throw new Error('User ID and experience ID are required to check favourites')
  }

  return fetchAPI(`/experience-likes/check/${userId}/${experienceId}`)
}

export async function toggleExperienceLike({ userId, experienceId }) {
  if (!userId || !experienceId) {
    throw new Error('User ID and experience ID are required to toggle favourites')
  }

  return mutateAPI('/experience-likes/toggle', 'POST', { userId, experienceId })
}
