/**
 * MEXC API Type Definitions
 * Based on MEXC Perpetual Futures API v1
 * Documentation: https://mexcdevelop.github.io/apidocs/contract_v1_en/
 */

export interface MEXCConfig {
  apiKey: string;
  apiSecret: string;
  authToken?: string; // Browser session token (optional, overrides API key/secret if provided)
  enableRateLimit?: boolean;
}

export interface MEXCAccountInfo {
  currency: string;
  positionMargin: number;
  frozenBalance: number;
  availableBalance: number;
  cashBalance: number;
  equity: number;
  unrealized: number;
}

export interface MEXCPosition {
  positionId: number;
  symbol: string;
  positionType: 1 | 2; // 1: long, 2: short
  openType: 1 | 2; // 1: isolated, 2: cross
  state: number; // 1: holding
  holdVol: string;
  holdAvgPrice: string;
  holdFee: string;
  closeVol: string;
  closeAvgPrice: string;
  closeFee: string;
  leverage: number;
  realised: string;
  unrealised: string;
  liquidatePrice: string;
  autoAddIm: boolean;
}

export interface MEXCOrderRequest {
  symbol: string;
  price?: number;
  vol: number; // order quantity
  leverage?: number;
  side: 1 | 2 | 3 | 4; // 1: open long, 2: close short, 3: open short, 4: close long
  type: 1 | 2 | 3 | 4 | 5 | 6; // 1: limit, 2: post only, 3: IOC, 4: FOK, 5: market, 6: convert market to limit
  openType: 1 | 2; // 1: isolated, 2: cross
  positionId?: number; // required when closing position
  externalOid?: string; // external order id
  stopLossPrice?: number;
  takeProfitPrice?: number;
  positionMode?: 1 | 2; // 1: hedge, 2: one-way
  reduceOnly?: boolean;
}

export interface MEXCOrder {
  orderId: string;
  symbol: string;
  positionId: number;
  price: string;
  vol: string;
  leverage: number;
  side: number;
  category: number;
  orderType: number;
  dealAvgPrice: string;
  dealVol: string;
  orderMargin: string;
  usedMargin: string;
  takerFee: string;
  makerFee: string;
  profit: string;
  feeCurrency: string;
  openType: number;
  state: number;
  errorCode: number;
  externalOid: string;
  createTime: number;
  updateTime: number;
}

export interface MEXCTicker {
  symbol: string;
  lastPrice: number;
  bid1: number;
  ask1: number;
  volume24: number;
  amount24: number;
  holdVol: number;
  lower24Price: number;
  high24Price: number;
  riseFallRate: number;
  riseFallValue: number;
  indexPrice: number;
  fairPrice: number;
  fundingRate: number;
  maxBidPrice: number;
  minAskPrice: number;
  timestamp: number;
}

export interface MEXCFundingRate {
  symbol: string;
  fundingRate: number;
  nextSettleTime: number;
  collectCycle?: number; // Funding interval in hours (e.g., 1, 4, 8) - from API
  lastPrice?: number; // Last price from ticker data
}

export interface MEXCFundingRateHistoryItem {
  symbol: string;
  fundingRate: number;
  settleTime: number;
  collectCycle: number; // Funding interval in hours
}

export interface MEXCFundingRateHistoryResponse {
  pageSize: number;
  resultList: MEXCFundingRateHistoryItem[];
}

export interface MEXCApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
}

export interface MEXCWalletBalance {
  currency: string;
  balance: MEXCAccountInfo;
}
