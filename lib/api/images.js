import { fetchAPI, mutateAPI } from './fetcher'

export async function uploadImage(imageData) {
    return mutateAPI('/library/', 'POST', imageData)
}