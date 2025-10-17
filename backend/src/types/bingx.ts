/**
 * BingX API Type Definitions
 * Based on BingX Perpetual Futures API v2
 * Documentation: https://bingx-api.github.io/docs/
 */

export interface BingXConfig {
  apiKey: string;
  apiSecret: string;
  enableRateLimit?: boolean;
}

// BingX v2 API balance object (inner object from API response)
export interface BingXBalanceData {
  userId?: string;
  asset: string;
  balance: string;
  equity: string;
  unrealizedProfit: string;
  realisedProfit: string;
  availableMargin: string;
  usedMargin: string;
  freezedMargin: string;
  shortUid?: string;
}

// Type alias for backward compatibility
export type BingXAccountInfo = BingXBalanceData;

export interface BingXPosition {
  symbol: string;
  positionId: string;
  positionSide: 'LONG' | 'SHORT';
  positionAmt: string;
  availableAmt: string;
  unrealizedProfit: string;
  realisedProfit: string;
  initialMargin: string;
  avgPrice: string;
  leverage: string;
}

export interface BingXOrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  positionSide: 'LONG' | 'SHORT';
  type: 'MARKET' | 'LIMIT' | 'STOP_MARKET' | 'STOP' | 'TAKE_PROFIT_MARKET' | 'TAKE_PROFIT';
  quantity?: number;
  price?: number;
  stopPrice?: number;
  reduceOnly?: boolean;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  closePosition?: boolean;
  // NOTE: BingX does NOT support atomic TP/SL in market orders
  // TP/SL are placed as separate conditional orders (TAKE_PROFIT_MARKET, STOP_MARKET)
}

export interface BingXOrder {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  positionSide: 'LONG' | 'SHORT';
  type: string;
  origQty: string;
  price: string;
  executedQty: string;
  avgPrice: string;
  cumQuote: string;
  stopPrice: string;
  status: string;
  timeInForce: string;
  updateTime: number;
  workingType: string;
}

export interface BingXTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  lastQty: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openPrice: string;
  openTime: number;
  closeTime: number;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  fundingRate?: string;      // Current funding rate (optional as some tickers may not have it)
  fundingTime?: number;       // Next funding time timestamp (optional)
  askQty: string;
}

export interface BingXFundingRate {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  markPrice?: string;  // Mark price (fair price) from premium index
}

export interface BingXApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  timestamp?: number;
}

export interface BingXWalletBalance {
  asset: string;
  balance: BingXBalanceData;
}
