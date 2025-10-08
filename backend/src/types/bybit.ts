// Bybit User Information Types

export interface BybitUserInfo {
  userId: string;
  uuid: string;
  username: string;
  memberType: number;
  status: number;
  email?: string;
}

export interface BybitWalletBalance {
  accountType: 'UNIFIED' | 'CONTRACT' | 'SPOT';
  totalEquity: string;
  totalWalletBalance: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  totalPerpUPL: string;
  totalInitialMargin: string;
  totalMaintenanceMargin: string;
  accountIMRate: string;
  accountMMRate: string;
  coin: BybitCoinBalance[];
}

export interface BybitCoinBalance {
  coin: string;
  equity: string;
  usdValue: string;
  walletBalance: string;
  availableToWithdraw: string;
  availableToBorrow: string;
  borrowAmount: string;
  accruedInterest: string;
  totalOrderIM: string;
  totalPositionIM: string;
  totalPositionMM: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
}

export interface BybitPosition {
  symbol: string;
  side: 'Buy' | 'Sell' | 'None';
  size: string;
  positionValue: string;
  entryPrice: string;
  markPrice: string;
  liqPrice: string;
  bustPrice: string;
  positionMM: string;
  positionIM: string;
  tpslMode: string;
  takeProfit: string;
  stopLoss: string;
  trailingStop: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
  leverage: string;
  avgPrice: string;
  positionStatus: string;
  createdTime: string;
  updatedTime: string;
}

export interface BybitApiKey {
  userId: string;
  platformId: 'bybit';
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  permissions: string[];
  createdAt: Date;
  lastUsedAt?: Date;
}

// Request validation schemas
export interface GetBybitUserInfoRequest {
  // No additional parameters needed - uses authenticated user's API keys
}

export interface GetBybitBalanceRequest {
  accountType?: 'UNIFIED' | 'CONTRACT' | 'SPOT';
  coin?: string;
}

export interface GetBybitPositionsRequest {
  category?: 'linear' | 'spot' | 'option';
  symbol?: string;
  settleCoin?: string;
  limit?: number;
}

// Response types
export interface BybitUserInfoResponse {
  success: boolean;
  data?: {
    userId: string;
    uuid: string;
    username: string;
    memberType: number;
    status: number;
    email?: string;
    vipLevel?: string;
    createdAt?: string;
  };
  error?: string;
  code?: string;
}

export interface BybitBalanceResponse {
  success: boolean;
  data?: {
    accountType: string;
    totalEquity: string;
    totalWalletBalance: string;
    totalAvailableBalance: string;
    totalPerpUPL: string;
    coins: Array<{
      coin: string;
      equity: string;
      usdValue: string;
      walletBalance: string;
      availableToWithdraw: string;
      unrealisedPnl: string;
      cumRealisedPnl: string;
    }>;
  };
  error?: string;
  code?: string;
}

export interface BybitPositionsResponse {
  success: boolean;
  data?: {
    category: string;
    positions: Array<{
      symbol: string;
      side: string;
      size: string;
      positionValue: string;
      entryPrice: string;
      markPrice: string;
      unrealisedPnl: string;
      cumRealisedPnl: string;
      leverage: string;
      liqPrice: string;
      takeProfit: string;
      stopLoss: string;
      createdTime: string;
      updatedTime: string;
    }>;
    totalPositions: number;
  };
  error?: string;
  code?: string;
}

// Error types
export interface BybitApiError {
  code: string;
  message: string;
  retCode: number;
  retMsg: string;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

// Wallet Balance Types (for /api/bybit/wallet-balance endpoint)
export interface WalletBalanceRequest {
  accountType?: 'UNIFIED' | 'CONTRACT' | 'SPOT' | 'INVESTMENT' | 'OPTION' | 'FUND';
  coin?: string;
}

export interface WalletBalanceCoin {
  coin: string;
  equity: string;
  usdValue: string;
  walletBalance: string;
  free: string;
  locked: string;
  availableToWithdraw: string;
  borrowAmount: string;
  availableToBorrow: string;
  accruedInterest: string;
  totalOrderIM: string;
  totalPositionIM: string;
  totalPositionMM: string;
  unrealisedPnl: string;
  cumRealisedPnl: string;
  bonus: string;
  collateralSwitch: boolean;
  marginCollateral: boolean;
  spotHedgingQty?: string;
}

export interface WalletBalanceAccount {
  accountType: 'UNIFIED' | 'CONTRACT' | 'SPOT' | 'INVESTMENT' | 'OPTION' | 'FUND';
  totalEquity: string;
  totalWalletBalance: string;
  totalMarginBalance: string;
  totalAvailableBalance: string;
  totalPerpUPL: string;
  totalInitialMargin: string;
  totalMaintenanceMargin: string;
  accountIMRate: string;
  accountMMRate: string;
  accountLTV: string;
  coin: WalletBalanceCoin[];
}

export interface WalletBalanceResponse {
  success: boolean;
  data?: {
    list: WalletBalanceAccount[];
  };
  accountType?: string;
  coin?: string;
  testnet?: boolean;
  timestamp?: string;
  error?: string;
  message?: string;
  code?: string;
}

// Storage for user API keys (in-memory for development)
// In production, these should be stored securely in a database with encryption
export interface UserBybitCredentials {
  userId: string;
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  createdAt: Date;
  updatedAt: Date;
}
