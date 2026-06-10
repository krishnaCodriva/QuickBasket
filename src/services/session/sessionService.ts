import { apiClient } from '../apiClient';
import { storage } from '../../utils/storage';

export const sessionService = {
    /**
     * Calls the backend to create a new anonymous guest session.
     * Returns the guest session token.
     */
    createGuestSession: async (): Promise<string> => {
        try {
            const response = await apiClient.post('/guest/session');

            // The token is in response.data.data.sessionToken
            const token = response.data?.data?.sessionToken;

            if (token) {
                await storage.setGuestToken(token);
                return token;
            } else {
                // If the backend returns it in a different format, we might need to adjust this.
                console.warn('Guest session created but no token found in response data');
                return '';
            }
        } catch (error) {
            console.error('Failed to create guest session:', error);
            throw error;
        }
    }
};