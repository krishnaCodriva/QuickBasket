import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../config/api.endpoints';
import { ServiceabilityResponse } from '../core/types/domain';

export const locationApi = {
  /**
   * Checks if the given coordinates fall within the store delivery radius.
   * @param latitude The user's latitude
   * @param longitude The user's longitude
   * @returns ServiceabilityResponse
   */
  checkServiceability: async (latitude: number, longitude: number): Promise<ServiceabilityResponse> => {
    try {
      const response = await apiClient.get<ServiceabilityResponse>(API_ENDPOINTS.LOCATION.SERVICEABILITY, {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check location serviceability:', error);
      throw error;
    }
  },
};
