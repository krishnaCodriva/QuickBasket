import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.endpoints';

export interface CartResponse {
  success: boolean;
  data?: {
    items: any[];
    subtotal: number;
    tax: number;
    deliveryCharge: number;
    grandTotal: number;
  };
  message?: string;
}

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CART.GET);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to fetch cart' };
    }
  },

  addToCart: async (productId: string, quantity: number): Promise<CartResponse> => {
    try {
      // POST /cart/add
      const response = await apiClient.post(API_ENDPOINTS.CART.ADD, { productId, quantity });
      return response.data;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to add to cart' };
    }
  },

  removeFromCart: async (productId: string): Promise<CartResponse> => {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.CART.REMOVE(productId));
      return response.data;
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to remove from cart' };
    }
  }
};
