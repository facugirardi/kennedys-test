const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function getActiveWeManageSections() {
  try {
    const response = await fetch(`${API_URL}/we-manage-sections/active`);
    if (!response.ok) {
      throw new Error('Failed to fetch sections');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active sections:', error);
    return { success: false, data: [] };
  }
}

export async function getWeManageSectionByKey(key) {
  try {
    const response = await fetch(`${API_URL}/we-manage-sections/key/${key}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching section by key ${key}:`, error);
    return null;
  }
}

