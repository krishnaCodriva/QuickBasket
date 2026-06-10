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

export const productApi = {
  getProducts: async (params: GetProductsParams = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }
};
