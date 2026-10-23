import { fetchAPI } from './fetcher';

export async function getPageByKey(pageKey) {
  try {
    return await fetchAPI(`/page/key/${pageKey}`);
  } catch (error) {
    console.error('Error fetching page:', error);
    return { success: false, data: null };
  }
}

export async function getContentBlock(id) {
  try {
    return await fetchAPI(`/content-block/${id}`);
  } catch (error) {
    console.error('Error fetching content block:', error);
    return { success: false, data: null };
  }
}

