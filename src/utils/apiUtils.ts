import axios from 'axios';

/**
 * API utility functions for making requests
 */

/**
 * Make a GET request to the API
 */
export async function apiGet<T>(
  endpoint: string, 
  params?: Record<string, any>
): Promise<T> {
  try {
    const response = await axios.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`API GET Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 */
export async function apiPost<T>(
  endpoint: string, 
  data: any
): Promise<T> {
  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`API POST Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Get content from Contentful via API
 */
export async function getContent(
  type: string, 
  slug?: string, 
  id?: string
) {
  const params: Record<string, any> = { type };
  
  if (slug) params.slug = slug;
  if (id) params.id = id;
  
  return apiGet('/api/get-content', params);
}

/**
 * Update progress via API
 */
export async function updateProgress(updates: any[]) {
  return apiPost('/api/update-progress', { updates });
}

/**
 * Get user progress via API
 */
export async function getProgress(user: any) {
  return apiGet('/api/get-progress', { user });
}