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
      console.log('✅ OTP API Response from Backend:', JSON.stringify(response.data, null, 2));
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
  },

  /**
   * Calls the backend to authenticate via Google OAuth2 ID Token.
   * @param idToken The Google ID Token
   * @param guestToken Optional guest token to migrate cart
   */
  googleLogin: async (idToken: string, guestToken?: string) => {
    try {
      const headers = guestToken ? { 'x-guest-token': guestToken } : {};
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
        { idToken },
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to login with Google:', error);
      throw error;
    }
  }
};
