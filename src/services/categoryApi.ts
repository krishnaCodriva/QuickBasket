import { apiClient } from './apiClient';
import type { Category } from '../core/types/domain';
import { formatImageUrl } from '../config/api.config';
import { API_ENDPOINTS } from '../config/api.endpoints';

// In-memory cache
let cachedCategories: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

export const categoryApi = {
  getCategories: async (forceRefresh = false): Promise<{ success: boolean; data?: Category[]; error?: string }> => {
    try {
      const now = Date.now();
      
      // Return cached data if valid and not forcing a refresh
      if (!forceRefresh && cachedCategories && (now - cacheTimestamp < CACHE_TTL_MS)) {
        return { success: true, data: cachedCategories };
      }

      const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
      
      if (response.data && response.data.success) {
        // Recursively format image URLs with the base server URL
        const mappedData: Category[] = response.data.data.map((cat: any) => ({
          ...cat,
          imageUrl: formatImageUrl(cat.imageUrl),
          // Map legacy fields for UI compatibility
          nameKey: cat.nameKey || cat.name,
          subcategories: cat.subcategories?.map((sub: any) => ({
            ...sub,
            imageUrl: formatImageUrl(sub.imageUrl),
            nameKey: sub.nameKey || sub.name,
          })) || []
        }));

        cachedCategories = mappedData;
        cacheTimestamp = Date.now();
        return { success: true, data: mappedData };
      }
      
      return { success: false, error: 'Failed to parse categories data' };
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Unknown error' 
      };
    }
  },

  clearCache: () => {
    cachedCategories = null;
    cacheTimestamp = 0;
  }
};
