/**
 * Centralized Exchange API Endpoints Configuration
 * All external API endpoints should be defined here
 */

export const EXCHANGE_ENDPOINTS = {
  BINGX: {
    BASE_URL: 'https://open-api.bingx.com',
    PREMIUM_INDEX: 'https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex',
    FUNDING_RATE_HISTORY: (symbol: string) =>
      `https://open-api.bingx.com/openApi/swap/v2/quote/fundingRate?symbol=${symbol}&limit=2`,
  },
  OKX: {
    BASE_URL: 'https://www.okx.com',
    TICKERS: 'https://www.okx.com/api/v5/market/tickers?instType=SWAP',
    FUNDING_RATE: (instId: string) =>
      `https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`,
    FUNDING_RATE_HISTORY: (instId: string) =>
      `https://www.okx.com/api/v5/public/funding-rate-history?instId=${instId}&limit=2`,
  },
  BYBIT: {
    BASE_URL: 'https://api.bybit.com',
    TICKERS: 'https://api.bybit.com/v5/market/tickers?category=linear',
    FUNDING_RATE_HISTORY: (symbol: string) =>
      `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=2`,
  },
  GATEIO: {
    BASE_URL: 'https://api.gateio.ws',
    FUTURES_TICKERS: 'https://api.gateio.ws/api/v4/futures/usdt/tickers',
    FUNDING_RATE_HISTORY: (contract: string) =>
      `https://api.gateio.ws/api/v4/futures/usdt/funding_rate?contract=${contract}&limit=2`,
  },
  BINANCE: {
    BASE_URL: 'https://fapi.binance.com',
    PREMIUM_INDEX: 'https://fapi.binance.com/fapi/v1/premiumIndex',
    FUNDING_RATE_HISTORY: (symbol: string) =>
      `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=2`,
  },
} as const;
