import { apiClient } from "../services/apiClient";
import { API_ENDPOINTS } from "../config/api.endpoints";

export const homeApi = async () => {
    try {
        const response = await apiClient.get(API_ENDPOINTS.HOME.GET_ALL);
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
