import axios from 'axios';
import { storage } from '../utils/storage';
import { API_BASE_URL } from '../config/api.config';
import { API_ENDPOINTS } from '../config/api.endpoints';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 10000,
});

// --- Queue Logic for Refresh Token ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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
    const originalRequest = error.config;
    console.error(`❌ [API RESPONSE ERROR]:`, error.response?.status, error.message);
    if (error.response?.data) {
      console.error(`🩸 [ERROR DETAILS]:`, JSON.stringify(error.response.data, null, 2));
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // If the refresh token API itself returns 401, we log out
      if (originalRequest.url === API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
        console.warn('⚠️ Refresh token expired or invalid. Clearing tokens.');
        await storage.clearTokens();
        return Promise.reject(error);
      }

      const userToken = await storage.getUserToken();
      if (!userToken) {
        // We are a guest user, and our guest token was rejected (expired or DB wiped).
        // Prevent infinite loops if the guest session API itself fails:
        if (originalRequest.url === API_ENDPOINTS.AUTH.GUEST_SESSION) {
          return Promise.reject(error);
        }

        console.warn('⚠️ Guest session invalid. Fetching a fresh guest token silently...');
        try {
          // Use base axios to prevent interceptor loops
          const guestResponse = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.GUEST_SESSION}`);
          const newGuestToken = guestResponse.data?.data?.sessionToken || guestResponse.data?.sessionToken;

          if (newGuestToken) {
            await storage.setGuestToken(newGuestToken);
            originalRequest.headers['x-guest-token'] = newGuestToken;
            console.log('✅ Recovered guest session! Retrying original request.');
            
            // CRITICAL: Prevent infinite loops if the backend rejects the NEW guest token!
            originalRequest._retry = true;
            
            return apiClient(originalRequest); // Retry the failed request seamlessly
          }
        } catch (guestError) {
          console.error('❌ Failed to recover guest session seamlessly', guestError);
          return Promise.reject(guestError);
        }

        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Request a new token using the HTTP-only cookie
        // Using a fresh axios instance to avoid our own interceptors
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );

        console.log('🔄 [REFRESH SUCCESS - API RESPONSE]:', JSON.stringify(response.data, null, 2));

        // Robustly extract the new access token based on potential response structures
        const newToken = response.data?.accessToken || response.data?.data?.accessToken || response.data?.token;

        if (!newToken) {
          throw new Error('New access token not found in refresh response');
        }

        // Save the new token
        await storage.setUserToken(newToken);

        // Update header for the original request
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

        // Process any queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.warn('⚠️ Refresh token failed. Logging out user.');
        await storage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
