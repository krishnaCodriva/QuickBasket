export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SEND_OTP: '/auth/otp/send',
    VERIFY_OTP: '/auth/otp/verify',
    GUEST_SESSION: '/guest/session',
    REFRESH_TOKEN: '/auth/session/refresh',
  },
  
  // Home
  HOME: {
    GET_ALL: '/home',
  },

  // Products
  PRODUCTS: {
    GET_ALL: '/products',
    GET_BY_ID: (id: string) => `/products/${id}`,
  },

  // Categories
  CATEGORIES: {
    GET_ALL: '/categories',
    // Note: The previous api had a distinct endpoint '/category' used in homeApi.ts
    // We export both just to prevent breaking changes if they are different backend routes.
    GET_HOME_CATEGORY: '/category', 
  },

  // Location
  LOCATION: {
    SERVICEABILITY: '/location/serviceability',
  },
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    REMOVE: (productId: string) => `/cart/items/${productId}`,
  },
  
  // Addresses
  ADDRESS: {
    GET_ALL: '/addresses',
    CREATE: '/addresses',
    UPDATE: (addressId: string) => `/addresses/${addressId}`,
    DELETE: (addressId: string) => `/addresses/${addressId}`,
  },
  
  // Orders
  ORDER: {
    INITIATE: '/orders',
    VERIFY_PAYMENT: '/payments/verify',
    GET: (id: string) => `/orders/${id}`,
    GET_ALL: '/orders',
  },
};
