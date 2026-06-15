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
  }
};
