import { apiClient } from "../services/apiClient";
import { API_ENDPOINTS } from "../config/api.endpoints";

export const homeApi = async (page: number = 1, limit: number = 10, tag?: string) => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.HOME.GET_ALL, {
            params: { page, limit, tag }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
}

export const getCategory = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.GET_HOME_CATEGORY);
        return response.data;
    } catch (error) {
        console.error('Error fetching category data:', error);
        throw error;
    }
}
