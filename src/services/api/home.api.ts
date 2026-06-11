import { apiClient } from './client';
import { HomeFeedResponse } from '../../types/api';

export const HomeApi = {
  /**
   * Fetches the unified home feed.
   */
  async getHomeFeed(page: number = 1, limit: number = 10): Promise<HomeFeedResponse | null> {
    try {
      const response = await apiClient.get<HomeFeedResponse>('/home');
      return response.data;
    } catch (error) {
      console.error('Error fetching home feed:', error);
      return null;
    }
  }
};
