import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../config/api.endpoints';

export const userService = {
  /**
   * Fetches the current authenticated user's profile
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER.GET_PROFILE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  /**
   * Updates the user's profile using multipart/form-data
   */
  updateProfile: async (data: { name?: string; email?: string; phone?: string; avatarUrl?: string }) => {
    try {
      const formData = new FormData();

      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.phone) formData.append('phone', data.phone);

      // Handle avatar upload if it's a local file URI
      if (data.avatarUrl && data.avatarUrl.startsWith('file://')) {
        const filename = data.avatarUrl.split('/').pop() || 'profile.jpg';
        // Basic mime type inference from extension
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('avatarUrl', {
          uri: data.avatarUrl,
          name: filename,
          type: type,
        } as any);
      } else if (data.avatarUrl === '') {
        // Allow removing avatar by sending empty string if supported by backend
        formData.append('avatarUrl', '');
      }

      const response = await apiClient.patch(API_ENDPOINTS.USER.UPDATE_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }
};
