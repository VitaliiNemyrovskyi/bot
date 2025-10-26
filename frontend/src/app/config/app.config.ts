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
      bingx: {
        userInfo: string;
        walletBalance: string;
        tickers: string;
        fundingRates: string;
      };
      arbitrage: {
        fundingRates: string;
        opportunities: string;
        positions: string;
        startPosition: string;
        closePosition: string;
        historicalPrices: string;
        graduatedEntry: string;
        graduatedEntryOpportunities: string;
        graduatedEntryStop: string;
        graduatedEntrySetTpSl: string;
      };
      fundingArbitrage: {
        revenue: string;
        subscribe: string;
      };
      google: {
        auth: string;
        link: string;
        unlink: string;
      };
      exchangeCredentials: {
        list: string;
        getById: string;
        create: string;
        update: string;
        delete: string;
        activate: string;
        testConnection: string;
      };
      marketData: {
        marketCaps: string;
      };
      exchange: {
        symbolInfo: string;
        balance: string;
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
      bingx: {
        userInfo: '/bingx/user-info',
        walletBalance: '/bingx/wallet-balance',
        tickers: '/bingx/tickers',
        fundingRates: '/bingx/funding-rates'
      },
      arbitrage: {
        fundingRates: '/arbitrage/funding-rates',
        opportunities: '/arbitrage/opportunities',
        positions: '/arbitrage/positions',
        startPosition: '/arbitrage/positions/start',
        closePosition: '/arbitrage/positions/:id/close',
        historicalPrices: '/arbitrage/historical-prices',
        graduatedEntry: '/arbitrage/graduated-entry',
        graduatedEntryOpportunities: '/arbitrage/graduated-entry/opportunities',
        graduatedEntryStop: '/arbitrage/graduated-entry/stop',
        graduatedEntrySetTpSl: '/arbitrage/graduated-entry/set-tpsl'
      },
      fundingArbitrage: {
        revenue: '/funding-arbitrage/revenue',
        subscribe: '/funding-arbitrage/subscribe'
      },
      exchangeCredentials: {
        list: '/exchange-credentials',
        getById: '/exchange-credentials/:id',
        create: '/exchange-credentials',
        update: '/exchange-credentials/:id',
        delete: '/exchange-credentials/:id',
        activate: '/exchange-credentials/:id/activate',
        testConnection: '/exchange-credentials/test'
      },
      marketData: {
        marketCaps: '/market-data/market-caps'
      },
      exchange: {
        symbolInfo: '/exchange/symbol-info',
        balance: '/exchange/balance'
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

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
  return `${appConfig.api.baseUrl}${endpoint}`;
}

// Helper function to get endpoint URL
export function getEndpointUrl(category: keyof AppConfig['api']['endpoints'], endpoint: string): string {
  const categoryEndpoints = appConfig.api.endpoints[category] as Record<string, string>;
  const endpointPath = categoryEndpoints[endpoint];
  if (!endpointPath) {
    console.error(`Endpoint not found: ${String(category)}.${endpoint}`);
    throw new Error(`Endpoint not found: ${String(category)}.${endpoint}`);
  }
  return buildApiUrl(endpointPath);
}

/**
 * Helper function to get endpoint URL with path parameters
 * Replaces path parameters (e.g., :id) with actual values
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
 * Helper function to build URL with query parameters
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