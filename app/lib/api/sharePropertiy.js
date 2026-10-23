import { fetchAPI, mutateAPI } from "@/lib/api/fetcher";

export async function createShareProperty(payload) {
    try {
        const result = await mutateAPI('/shared-property/', 'POST', payload);
        return result;
    } catch (error) {
        console.error('❌ createShareProperty (kennedys-web) - Error:', error);
        return {
            success: false,
            message: error?.message || 'Error creating shared property',
            data: null
        };
    }
}

/** Header/banner image for an offer's Welcome section — same endpoint kennedys-loggia's
 * shareProperties.tsx uploads to (returns a relative `url`, resolve with resolveMediaUrl to display). */
export async function uploadShareImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const result = await mutateAPI('/shared-property/upload-image', 'POST', formData);
        return result;
    } catch (error) {
        console.error('❌ uploadShareImage (kennedys-web) - Error:', error);
        return {
            success: false,
            message: error?.message || 'Error uploading image',
            data: null
        };
    }
}

export async function getShareProperty(identifier) {
    try {
        const result = await fetchAPI(`/shared-property/${identifier}`);
        return result;
    } catch (error) {
        console.error('❌ getShareProperty (kennedys-web) - Error:', error);
        return {
            success: false,
            message: error?.message || 'Error fetching shared property',
            data: null
        };
    }
}

export async function updateShareProperty(id, payload) {
    try {
        const result = await mutateAPI(`/shared-property/${id}`, 'PUT', payload);
        return result;
    } catch (error) {
        console.error('❌ updateShareProperty (kennedys-web) - Error:', error);
        return {
            success: false,
            message: error?.message || 'Error updating shared property',
            data: null
        };
    }
}

export async function deleteShareProperty(id) {
    try {
        const result = await mutateAPI(`/shared-property/${id}`, 'DELETE');
        return result;
    } catch (error) {
        console.error('❌ deleteShareProperty (kennedys-web) - Error:', error);
        return {
            success: false,
            message: error?.message || 'Error deleting shared property',
            data: null
        };
    }
}

/** Offers created by the logged-in agent — GET /shared-property/mine, scoped server-side to the
 * authenticated user, for the agent-portfolio "my offers" list. */
export async function getMyOffers() {
    try {
        const result = await fetchAPI('/shared-property/mine');
        return result;
    } catch (error) {
        console.error('❌ getMyOffers (kennedys-web) - Error:', error);
        return {
            success: false,
            message: error?.message || 'Error fetching your offers',
            data: null
        };
    }
}

