export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    TOKENS: '/auth/tokens',
  },
  PRODUCTS: {
    LIST: '/products',
    CATEGORIES: '/categories',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
  },
  HEALTH: '/health',
} as const;

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  API_VERSION: 'v1',
  DEFAULT_BASE_URL: 'http://localhost:4000/api/v1',
} as const;
