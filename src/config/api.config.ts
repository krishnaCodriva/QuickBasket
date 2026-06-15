export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';

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
  if (url.startsWith('http') || url.startsWith('file://') || url.startsWith('data:')) return url;
  
  // Replace Windows backslashes with forward slashes, and fix backend double uploads path
  const normalizedUrl = url.replace(/\\/g, '/').replace(/\/uploads\/uploads\//g, '/uploads/');
  
  // Ensure exactly one slash between ROOT_URL and normalizedUrl
  const root = ROOT_URL.endsWith('/') ? ROOT_URL.slice(0, -1) : ROOT_URL;
  const path = normalizedUrl.startsWith('/') ? normalizedUrl : `/${normalizedUrl}`;
  
  return `${root}${path}`;
};
