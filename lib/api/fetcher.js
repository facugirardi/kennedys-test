import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.kennedys.group';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '').endsWith('/api')
  ? rawApiUrl.replace(/\/+$/, '')
  : `${rawApiUrl.replace(/\/+$/, '')}/api`;

/** Base URL solo para imágenes (uploads/...). Usa NEXT_PUBLIC_MEDIA_BASE_URL si está definida; si no, deriva del API sin /api. Las llamadas al API siguen usando API_BASE_URL. */
export function getMediaBaseUrl() {
  const mediaBase = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (mediaBase && String(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).trim()) {
    return String(process.env.NEXT_PUBLIC_MEDIA_BASE_URL).trim().replace(/\/+$/, '');
  }
  const url = API_BASE_URL || '';
  if (!url) return '';
  try {
    const u = new URL(url);
    let path = u.pathname.replace(/\/+$/, '');
    if (path.endsWith('/api')) path = path.replace(/\/api$/, '');
    u.pathname = path;
    return u.toString().replace(/\/+$/, '');
  } catch {
    return url.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000,
});

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}

const buildErrorPayload = (error) => {
  if (error.response) {
    return {
      status: error.response.status,
      data: error.response.data,
    };
  }

  return {
    status: null,
    data: error.message ?? 'Unknown error',
  };
};

export async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await axiosInstance({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    const payload = buildErrorPayload(error);
    const requestUrl = `${API_BASE_URL || ''}`.replace(/\/+$/, '') + (String(endpoint).startsWith('/') ? endpoint : `/${endpoint}`);
    console.error('❌ fetchAPI (kennedys-web) - Error:', { ...payload, requestUrl });
    // Return a structured error response instead of throwing
    return {
      success: false,
      message: error?.response?.data?.message || error?.message || 'API request failed',
      errors: error?.response?.data?.errors || { error: error?.message },
      data: null
    };
  }
}

export async function mutateAPI(endpoint, method, data, options = {}) {
  return fetchAPI(endpoint, {
    method,
    data: data ?? undefined,
    ...options,
  });
}

export { axiosInstance };
