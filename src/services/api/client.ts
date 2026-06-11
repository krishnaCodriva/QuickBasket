import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Add a request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // 1. Check for authenticated user token first (if they are logged in)
      const userToken = await SecureStore.getItemAsync('userToken');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }

      

      // 2. Add Guest Session token from SecureStore
      const sessionToken = await SecureStore.getItemAsync('sessionToken');
      if (sessionToken) {
        // The API screenshot shows it's passed as a custom header "sessionToken"
        config.headers['sessionToken'] = sessionToken;
      }
    } catch (error) {
      console.warn('Error fetching tokens from SecureStore', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // You can handle 401s here to automatically clear tokens or redirect
    if (error.response?.status === 401) {
      console.warn('Unauthorized! Might need to clear tokens.');
    }
    return Promise.reject(error);
  }
);
