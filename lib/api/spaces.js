import { fetchAPI, mutateAPI } from './fetcher'


export async function createBedroom(payload) {
    return mutateAPI('/bedroom/', 'POST', payload)
}

export async function createPool(payload) {
    return mutateAPI('/pool/', 'POST', payload)
}
