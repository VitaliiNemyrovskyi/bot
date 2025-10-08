/**
 * UPDATED APPLICATION CONFIGURATION
 *
 * This file shows the updated app.config.ts with new exchange-credentials endpoints.
 * Copy and merge this with the existing /Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/config/app.config.ts
 */

export interface AppConfig {
  api: {
    baseUrl: string;
    endpoints: {
      auth: {
        login: string;
        register: string;
        logout: string;
        profile: string;
        refresh: string;
        'dev-login': string;
      };
      trading: {
        platforms: string;
        apiKeys: string;
        balance: string;
        orders: string;
      };
      user: {
        profile: string;
        preferences: string;
        messages: string;
        notifications: string;
      };
      bybit: {
        userInfo: string;
        testConnection: string;
        apiKeys: string;
        deleteApiKeys: string;
        storedApiKeys: string;
        walletBalance: string;
        assetInfo: string;
        allCoinsBalance: string;
      };
      google: {
        auth: string;
        link: string;
        unlink: string;
      };
      // NEW: Exchange Credentials Management
      exchangeCredentials: {
        list: string;            // GET    /api/exchange-credentials
        getById: string;         // GET    /api/exchange-credentials/:id
        create: string;          // POST   /api/exchange-credentials
        update: string;          // PATCH  /api/exchange-credentials/:id
        delete: string;          // DELETE /api/exchange-credentials/:id
        activate: string;        // POST   /api/exchange-credentials/:id/activate
        testConnection: string;  // POST   /api/exchange-credentials/test
      };
    };
  };
  app: {
    name: string;
    version: string;
    environment: string;
  };
  features: {
    googleAuth: boolean;
    tradingPlatforms: boolean;
    notifications: boolean;
    darkMode: boolean;
    multiLanguage: boolean;
  };
}

export const appConfig: AppConfig = {
  api: {
    baseUrl: '/api',
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        profile: '/auth/profile',
        refresh: '/auth/refresh',
        'dev-login': '/auth/dev-login'
      },
      trading: {
        platforms: '/trading/platforms',
        apiKeys: '/trading/api-keys',
        balance: '/trading/balance',
        orders: '/trading/orders'
      },
      user: {
        profile: '/user/profile',
        preferences: '/user/preferences',
        messages: '/user/messages',
        notifications: '/user/notifications'
      },
      google: {
        auth: '/auth/google',
        link: '/auth/google/link',
        unlink: '/auth/google/unlink'
      },
      bybit: {
        userInfo: '/bybit/user-info',
        testConnection: '/bybit/user-info',
        apiKeys: '/bybit/api-keys',
        deleteApiKeys: '/bybit/api-keys',
        storedApiKeys: '/bybit/api-keys',
        walletBalance: '/bybit/wallet-balance',
        assetInfo: '/bybit/asset-info',
        allCoinsBalance: '/bybit/all-coins-balance'
      },
      // NEW: Exchange Credentials endpoints
      exchangeCredentials: {
        list: '/exchange-credentials',
        getById: '/exchange-credentials/:id',
        create: '/exchange-credentials',
        update: '/exchange-credentials/:id',
        delete: '/exchange-credentials/:id',
        activate: '/exchange-credentials/:id/activate',
        testConnection: '/exchange-credentials/test'
      }
    }
  },
  app: {
    name: 'Trading Bot Dashboard',
    version: '1.0.0',
    environment: 'development'
  },
  features: {
    googleAuth: true,
    tradingPlatforms: true,
    notifications: true,
    darkMode: true,
    multiLanguage: true
  }
};

/**
 * Helper function to build full URL from endpoint path
 *
 * @param endpoint - The endpoint path (e.g., '/auth/login')
 * @returns Full URL (e.g., '/api/auth/login')
 */
export function buildApiUrl(endpoint: string): string {
  return `${appConfig.api.baseUrl}${endpoint}`;
}

/**
 * Helper function to get endpoint URL by category and endpoint name
 *
 * @param category - The category (e.g., 'auth', 'trading', 'bybit', 'exchangeCredentials')
 * @param endpoint - The endpoint name (e.g., 'login', 'list', 'create')
 * @returns Full URL
 *
 * @example
 * getEndpointUrl('auth', 'login')  // Returns '/api/auth/login'
 * getEndpointUrl('exchangeCredentials', 'list')  // Returns '/api/exchange-credentials'
 */
export function getEndpointUrl(
  category: keyof AppConfig['api']['endpoints'],
  endpoint: string
): string {
  const categoryEndpoints = appConfig.api.endpoints[category] as Record<string, string>;
  const endpointPath = categoryEndpoints[endpoint];

  if (!endpointPath) {
    console.error(`Endpoint not found: ${String(category)}.${endpoint}`);
    throw new Error(`Endpoint not found: ${String(category)}.${endpoint}`);
  }

  return buildApiUrl(endpointPath);
}

/**
 * NEW: Helper function to get endpoint URL with path parameters
 *
 * This function replaces path parameters (e.g., :id) with actual values.
 *
 * @param category - The category (e.g., 'exchangeCredentials')
 * @param endpoint - The endpoint name (e.g., 'getById', 'update', 'delete')
 * @param params - Object containing parameter values (e.g., { id: 'cred_123' })
 * @returns Full URL with parameters replaced
 *
 * @example
 * getParameterizedUrl('exchangeCredentials', 'getById', { id: 'cred_123' })
 * // Returns '/api/exchange-credentials/cred_123'
 *
 * @example
 * getParameterizedUrl('exchangeCredentials', 'update', { id: 'cred_456' })
 * // Returns '/api/exchange-credentials/cred_456'
 *
 * @example
 * getParameterizedUrl('exchangeCredentials', 'activate', { id: 'cred_789' })
 * // Returns '/api/exchange-credentials/cred_789/activate'
 */
export function getParameterizedUrl(
  category: keyof AppConfig['api']['endpoints'],
  endpoint: string,
  params: Record<string, string>
): string {
  const categoryEndpoints = appConfig.api.endpoints[category] as Record<string, string>;
  let endpointPath = categoryEndpoints[endpoint];

  if (!endpointPath) {
    console.error(`Endpoint not found: ${String(category)}.${endpoint}`);
    throw new Error(`Endpoint not found: ${String(category)}.${endpoint}`);
  }

  // Replace :param with actual values
  Object.entries(params).forEach(([key, value]) => {
    const paramPlaceholder = `:${key}`;
    if (endpointPath.includes(paramPlaceholder)) {
      endpointPath = endpointPath.replace(paramPlaceholder, value);
    } else {
      console.warn(`Parameter ${key} not found in endpoint path: ${endpointPath}`);
    }
  });

  // Check if any parameters were not replaced
  if (endpointPath.includes(':')) {
    console.error(`Unreplaced parameters in URL: ${endpointPath}`);
    throw new Error(`Unreplaced parameters in URL: ${endpointPath}`);
  }

  return buildApiUrl(endpointPath);
}

/**
 * NEW: Helper function to build URL with query parameters
 *
 * @param baseUrl - The base URL
 * @param queryParams - Object containing query parameters
 * @returns URL with query parameters
 *
 * @example
 * buildUrlWithQuery('/api/bybit/user-info', { environment: 'TESTNET' })
 * // Returns '/api/bybit/user-info?environment=TESTNET'
 *
 * @example
 * buildUrlWithQuery('/api/exchange-credentials', { environment: 'MAINNET', exchange: 'BYBIT' })
 * // Returns '/api/exchange-credentials?environment=MAINNET&exchange=BYBIT'
 */
export function buildUrlWithQuery(
  baseUrl: string,
  queryParams: Record<string, string | number | boolean>
): string {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Type guard to check if a category exists in endpoints
 *
 * @param category - The category to check
 * @returns True if category exists
 */
export function isValidEndpointCategory(
  category: string
): category is keyof AppConfig['api']['endpoints'] {
  return category in appConfig.api.endpoints;
}

/**
 * Get all available endpoint categories
 *
 * @returns Array of category names
 */
export function getEndpointCategories(): Array<keyof AppConfig['api']['endpoints']> {
  return Object.keys(appConfig.api.endpoints) as Array<keyof AppConfig['api']['endpoints']>;
}

/**
 * Get all endpoints for a specific category
 *
 * @param category - The category
 * @returns Object mapping endpoint names to paths
 */
export function getEndpointsForCategory(
  category: keyof AppConfig['api']['endpoints']
): Record<string, string> {
  return appConfig.api.endpoints[category] as Record<string, string>;
}

/**
 * Constants for API configuration
 */
export const API_CONFIG = {
  TIMEOUT: 30000,              // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,           // 1 second
  CACHE_DURATION: 300000,      // 5 minutes
} as const;

/**
 * HTTP Request Headers
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: { 'Content-Type': 'application/json' },
  ACCEPT_JSON: { 'Accept': 'application/json' },
} as const;

/**
 * Storage Keys (for localStorage/sessionStorage)
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  EXCHANGE_ENVIRONMENT: 'exchange_environment',  // NEW
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

/**
 * Feature flags
 * Use these to conditionally enable/disable features
 */
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return appConfig.features[feature];
}

/**
 * Environment detection
 */
export function isDevelopment(): boolean {
  return appConfig.app.environment === 'development';
}

export function isProduction(): boolean {
  return appConfig.app.environment === 'production';
}

export function isStaging(): boolean {
  return appConfig.app.environment === 'staging';
}

/**
 * Export config for testing
 */
export function getConfig(): AppConfig {
  return appConfig;
}

/**
 * Update config (useful for testing or runtime configuration)
 */
export function updateConfig(updates: Partial<AppConfig>): void {
  Object.assign(appConfig, updates);
}
