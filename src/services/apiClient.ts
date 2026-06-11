import axios from 'axios';
import { storage } from '../utils/storage';
import { API_BASE_URL } from '../config/api.config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
});

// Request Interceptor: Attach the correct token to every outgoing request
apiClient.interceptors.request.use(
  async (config) => {
    const userToken = await storage.getUserToken();
    const guestToken = await storage.getGuestToken();

    if (userToken) {
      config.headers['Authorization'] = `Bearer ${userToken}`;
    } else if (guestToken) {
      config.headers['x-guest-token'] = guestToken;
    }

    // Logger
    let fullUrl = `${config.baseURL}${config.url}`;
    if (config.params) {
      const queryString = new URLSearchParams(config.params).toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    console.log(`\n🚀 [API REQUEST]: ${config.method?.toUpperCase()} ${fullUrl}`);
    if (config.data) {
      console.log(`📦 [PAYLOAD]:`, JSON.stringify(config.data, null, 2));
    }

    return config;
  },
  (error) => {
    console.error(`❌ [API REQUEST ERROR]:`, error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors and log responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [API RESPONSE]: ${response.status} from ${response.config.url}`);
    console.log(`🎁 [DATA]:`, JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error) => {
    console.error(`❌ [API RESPONSE ERROR]:`, error.response?.status, error.message);
    if (error.response?.data) {
      console.error(`🩸 [ERROR DETAILS]:`, JSON.stringify(error.response.data, null, 2));
    }

    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Unauthorized request - 401. Clearing tokens.');
      await storage.clearTokens();
    }
    return Promise.reject(error);
  }
);
