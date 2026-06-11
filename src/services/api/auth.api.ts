import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';

export const AuthApi = {
  /**
   * Initializes a guest session and stores the token locally.
   * Returns true if successful.
   */
  async createGuestSession(): Promise<boolean> {
    try {
      // Endpoint is /guest/session
      const response = await apiClient.post('/guest/session');
      
      // Based on Swagger, it returns 201 Created.
      // We need to extract the token. It might be in the response body or headers.
      // E.g., response.data.token or response.data.sessionToken
      
      let tokenToSave = null;
      
      if (response.data && response.data.data && response.data.data.sessionToken) {
        tokenToSave = response.data.data.sessionToken;
      } else if (response.data && response.data.token) {
        tokenToSave = response.data.token;
      } else if (response.data && response.data.sessionToken) {
        tokenToSave = response.data.sessionToken;
      } else if (typeof response.data === 'string') {
        tokenToSave = response.data; // fallback if it's just a raw string
      }

      if (tokenToSave) {
        await SecureStore.setItemAsync('sessionToken', tokenToSave);
        return true;
      } else {
        console.warn('Guest session created but no token found in response:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Error creating guest session:', error);
      return false;
    }
  },

  /**
   * Sends an OTP to the given phone number.
   */
  async sendOtp(phone: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/otp/send', { phone });
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return false;
    }
  }
};
