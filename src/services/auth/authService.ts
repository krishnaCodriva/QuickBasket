import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../config/api.endpoints';

export const authService = {
  /**
   * Calls the backend to dispatch an OTP to the given phone number.
   * @param phone The phone number (e.g., "+919999999999")
   */
  sendOtp: async (phone: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, { phone });
      return response.data;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw error;
    }
  },

  /**
   * Calls the backend to verify the OTP.
   * @param phone The phone number (e.g., "+919999999999")
   * @param code The OTP code (e.g., "123456")
   */
  verifyOtp: async (phone: string, code: string) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { phone, code });
      return response.data;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      throw error;
    }
  }
};
