import { fetchAPI } from './fetcher'

export async function getAllEventServicesOffered() {
    return fetchAPI('/event-service-offered/')
}

export async function getEventServiceOffered(id) {
    return fetchAPI(`/event-service-offered/${id}`)
}

