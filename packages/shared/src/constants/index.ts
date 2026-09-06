export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    TOKENS: '/auth/tokens',
  },
  PRODUCTS: {
    LIST: '/products',
    CATALOG_LIST: '/catalog/products',
    CATEGORIES: '/categories',
    CATALOG_CATEGORIES: '/catalog/categories',
  },
  INVENTORY: {
    OVERVIEW: '/inventory/overview',
    WAREHOUSES: '/inventory/warehouses',
    ADJUST: '/inventory/adjust',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
  },
  AI: {
    ASK: '/ai/ask',
    DESCRIPTION: '/ai/description',
    STATUS: '/ai/status',
  },
  STORAGE: {
    UPLOAD: '/storage/upload',
    UPLOAD_MULTIPLE: '/storage/upload-multiple',
  },
  HEALTH: '/health',
} as const;

export const APP_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  API_VERSION: 'v1',
  DEFAULT_BASE_URL: 'http://localhost:4000/api/v1',
} as const;
