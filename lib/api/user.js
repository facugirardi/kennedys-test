import { fetchAPI, mutateAPI } from './fetcher'

export async function patchUser(userData) {
    return mutateAPI(`/user/${userData.id}`, 'PATCH', userData)
}

export async function getUser(email, simple = false) {
    const q = new URLSearchParams({
        email: String(email),
        simple: simple ? 'true' : 'false',
    });
    return fetchAPI(`/user/by-email?${q.toString()}`);
}

/** Looks up a user by their stable id — use this (not getUser/email) for a logged-in user's own
 * profile, since their email can change (see the change-email flow) while their id never does. */
export async function getUserById(id) {
    return fetchAPI(`/user/${id}`);
}

/** Uploads the logged-in user's profile picture. Response shape matches PATCH /user/:id: updated user in `data.user`. */
export async function uploadProfilePicture(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return mutateAPI('/user/profile-picture', 'POST', formData);
}

/** Removes the logged-in user's profile picture. Response shape matches PATCH /user/:id: updated user in `data.user`. */
export async function removeProfilePicture() {
    return mutateAPI('/user/profile-picture', 'DELETE');
}
