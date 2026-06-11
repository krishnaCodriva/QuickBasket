export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Calculate ROOT_URL dynamically by stripping out the API version path
export const ROOT_URL = API_BASE_URL.replace(/\/api\/v\d+$/, '');

/**
 * Formats a relative image path from the backend into an absolute URL.
 * If the URL is already absolute, it returns it as is.
 * 
 * @param url The image path from the database
 * @returns The fully qualified URL
 */
export const formatImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${ROOT_URL}${url}`;
};
