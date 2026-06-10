import { apiClient } from "../services/apiClient";

export const homeApi = async () => {
    try {
        const response = await apiClient.get('/home');
        return response.data;
    } catch (error) {
        console.error('Error fetching home data:', error);
        throw error;
    }
}

export const getCategory = async () => {
    try {
        const response = await apiClient.get('/category');
        return response.data;
    } catch (error) {
        console.error('Error fetching category data:', error);
        throw error;
    }
}
