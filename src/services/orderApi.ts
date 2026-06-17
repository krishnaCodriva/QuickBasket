import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.endpoints';

export interface InitiateOrderPayload {
  cartId?: string;
  addressId: string;
  paymentMethod: 'RAZORPAY' | 'COD';
}

export interface InitiateOrderResponse {
  success: boolean;
  message?: string;
  data: {
    // COD Case
    orderId?: string;
    status?: string;

    // Razorpay Case
    internalOrderId?: string;
    razorpayOrderId?: string;
    amount?: number;
    currency?: string;
    key?: string;
    
    // Fallback based on Swagger Spec
    order?: {
      id: string;
      status: string;
      grandTotal: string;
    };
    razorpay?: {
      razorpayOrderId: string;
      amount: number;
      currency: string;
      keyId: string;
    }
  };
}

export interface VerifyPaymentPayload {
  internalOrderId?: string; // from Postman
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    trackingId: string;
    status: string;
    estimatedDelivery: string;
  };
}

export const orderApi = {
  initiateOrder: async (payload: InitiateOrderPayload) => {
    // Map 'COD' or 'RAZORPAY' to what the backend expects
    const response = await apiClient.post<InitiateOrderResponse>(
      API_ENDPOINTS.ORDER.INITIATE,
      payload
    );
    return response.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload) => {
    const response = await apiClient.post<VerifyPaymentResponse>(
      API_ENDPOINTS.ORDER.VERIFY_PAYMENT,
      payload
    );
    return response.data;
  },

  getOrderById: async (id: string) => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.ORDER.GET(id)
    );
    return response.data;
  },

  getOrders: async (params?: any) => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.ORDER.GET_ALL,
      { params }
    );
    return response.data;
  },

  downloadInvoice: async (orderId: string): Promise<{ success: boolean; uri?: string; message?: string }> => {
    try {
      // Lazy import to avoid circular dependencies or initialization issues
      const FileSystem = require('expo-file-system/legacy');
      const { storage } = require('../utils/storage');
      const { API_BASE_URL } = require('../config/api.config');

      const url = `${API_BASE_URL}${API_ENDPOINTS.ORDER.INVOICE(orderId)}`;
      
      const userToken = await storage.getUserToken();
      const guestToken = await storage.getGuestToken();
      
      const headers: any = {
        'Accept': 'application/pdf, text/html, */*'
      };
      
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      } else if (guestToken) {
        headers['x-guest-token'] = guestToken;
      }

      // We save it as .pdf initially. If it's HTML, the system can still view it or we can change extension if needed, 
      // but usually invoices are PDF.
      const fileUri = `${FileSystem.documentDirectory}Invoice-${orderId.slice(-8).toUpperCase()}.pdf`;

      const downloadRes = await FileSystem.downloadAsync(url, fileUri, { headers });
      
      if (downloadRes.status !== 200) {
        return { success: false, message: `Failed to download: Server returned ${downloadRes.status}` };
      }

      return { success: true, uri: downloadRes.uri };
    } catch (error: any) {
      console.error('Error downloading invoice API:', error);
      return { success: false, message: error.message || 'Download failed' };
    }
  }
};
