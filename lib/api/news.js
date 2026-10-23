import { fetchAPI } from './fetcher'

/**
 * Obtiene todas las noticias
 */
export async function getAllNews() {
    return fetchAPI('/news')
}

/**
 * Obtiene las últimas N noticias (por defecto 3)
 */
export async function getLatestNews(limit = 3) {
    const response = await getAllNews()
    if (response?.success && Array.isArray(response.data)) {
        // Ordenar por createdAt descendente y tomar las primeras N
        const sorted = response.data
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime()
                const dateB = new Date(b.createdAt || 0).getTime()
                return dateB - dateA
            })
            .slice(0, limit)
        return {
            ...response,
            data: sorted
        }
    }
    return response
}

/**
 * Obtiene una noticia por ID
 */
export async function getNewsById(id) {
    return fetchAPI(`/news/${id}`)
}

