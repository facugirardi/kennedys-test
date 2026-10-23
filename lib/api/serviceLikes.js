import { fetchAPI, mutateAPI } from './fetcher'

export async function getUserServiceLikes(userId) {
  if (!userId) {
    throw new Error('User ID is required to load favourites')
  }

  return fetchAPI(`/service-likes/user/${userId}`)
}

export async function checkServiceLike(userId, serviceId) {
  if (!userId || !serviceId) {
    throw new Error('User ID and service ID are required to check favourites')
  }

  return fetchAPI(`/service-likes/check/${userId}/${serviceId}`)
}

export async function toggleServiceLike({ userId, serviceId }) {
  if (!userId || !serviceId) {
    throw new Error('User ID and service ID are required to toggle favourites')
  }

  return mutateAPI('/service-likes/toggle', 'POST', { userId, serviceId })
}
