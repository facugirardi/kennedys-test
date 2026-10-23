import { fetchAPI, mutateAPI } from './fetcher'

export async function getUserPropertyLikes(userId) {
  if (!userId) {
    throw new Error('User ID is required to load favourites')
  }

  return fetchAPI(`/property-likes/user/${userId}`)
}

export async function checkPropertyLike(userId, propertyId) {
  if (!userId || !propertyId) {
    throw new Error('User ID and property ID are required to check favourites')
  }

  return fetchAPI(`/property-likes/check/${userId}/${propertyId}`)
}

export async function togglePropertyLike({ userId, propertyId }) {
  if (!userId || !propertyId) {
    throw new Error('User ID and property ID are required to toggle favourites')
  }

  return mutateAPI('/property-likes/toggle', 'POST', { userId, propertyId })
}
