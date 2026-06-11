import { apiClient } from './apiClient';

interface GetProductsParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'latest' | 'popularity';
  inStock?: boolean;
  brand?: string;
  limit?: number;
  offset?: number;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const ROOT_URL = BASE_URL.replace(/\/api\/v\d+$/, '');

const formatImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${ROOT_URL}${url}`;
};

export const productApi = {
  getProducts: async (params: GetProductsParams = {}) => {
    try {
      // Remove undefined values to prevent Axios from serializing them as "undefined" strings
      const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
      );
      const response = await apiClient.get('/products', { params: cleanedParams });
      
      // Optionally format imageUrls for the list here if needed, but since it's already working, we leave it or format it
      if (response.data && response.data.data) {
        response.data.data = response.data.data.map((p: any) => ({
          ...p,
          imageUrl: formatImageUrl(p.imageUrl)
        }));
      }

      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  },

  getProductById: async (id: string) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      if (response.data && response.data.success) {
        const product = response.data.data;
        
        // Format image URLs
        product.imageUrl = formatImageUrl(product.imageUrl);
        product.brandLogoUrl = formatImageUrl(product.brandLogoUrl);
        if (product.gallery && Array.isArray(product.gallery)) {
          product.gallery = product.gallery.map(formatImageUrl).filter(Boolean);
        }
        if (product.relatedProducts && Array.isArray(product.relatedProducts)) {
          product.relatedProducts = product.relatedProducts.map((rp: any) => ({
            ...rp,
            imageUrl: formatImageUrl(rp.imageUrl)
          }));
        }
        
        return { success: true, data: product };
      }
      return { success: false, error: 'Failed to parse product data' };
    } catch (error: any) {
      console.error(`Failed to fetch product ${id}:`, error);
      return { success: false, error: error.response?.data?.message || error.message || 'Unknown error' };
    }
  }
};
