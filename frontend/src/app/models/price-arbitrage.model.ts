/**
 * Price Arbitrage Types for Angular Frontend
 *
 * Type definitions for price arbitrage trading system.
 * Matches backend types from /backend/src/types/price-arbitrage.ts
 */

/**
 * Price arbitrage status enum
 */
export enum PriceArbitrageStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED'
}

/**
 * Parameters for starting a new price arbitrage position
 */
export interface StartPriceArbitrageParams {
  symbol: string; // Normalized format (e.g., "BTCUSDT")

  // Primary exchange configuration (higher price - SHORT position)
  primaryExchange: string;
  primaryCredentialId: string;
  primaryLeverage: number; // 1-100x
  primaryMargin: number; // USDT amount

  // Hedge exchange configuration (lower price - LONG position)
  hedgeExchange: string;
  hedgeCredentialId: string;
  hedgeLeverage: number; // 1-100x
  hedgeMargin: number; // USDT amount

  // Entry prices at time of start
  entryPrimaryPrice: number;
  entryHedgePrice: number;

  // Convergence configuration (optional)
  targetSpread?: number; // Auto-close when spread <= this (e.g., 0.001 = 0.1%)
  stopLoss?: number; // Stop-loss spread % (e.g., 0.03 = 3%)
  maxHoldingTime?: number; // Max seconds to hold (e.g., 3600 = 1 hour)
}

/**
 * Price arbitrage position state for frontend
 */
export interface PriceArbitragePositionDTO {
  id: string;
  userId: string;
  symbol: string;

  // Exchanges
  primaryExchange: string;
  hedgeExchange: string;

  // Configuration
  primaryLeverage: number;
  primaryMargin: number;
  hedgeLeverage: number;
  hedgeMargin: number;

  // Entry data
  entryPrimaryPrice: number;
  entryHedgePrice: number;
  entrySpread: number;
  entrySpreadPercent: number;

  // Current data (if active)
  currentPrimaryPrice?: number;
  currentHedgePrice?: number;
  currentSpread?: number;
  currentSpreadPercent?: number;

  // Exit data (if closed)
  exitPrimaryPrice?: number;
  exitHedgePrice?: number;
  exitSpread?: number;
  exitSpreadPercent?: number;

  // Financial results
  primaryPnl?: number;
  hedgePnl?: number;
  totalPnl?: number;
  primaryFees: number;
  hedgeFees: number;

  // Status
  status: PriceArbitrageStatus;
  errorMessage?: string;

  // Timestamps
  createdAt: Date | string;
  openedAt?: Date | string;
  closedAt?: Date | string;
  holdingTimeSeconds?: number;
}

/**
 * Arbitrage opportunity (price-based, not funding rate based)
 */
export interface PriceArbitrageOpportunity {
  symbol: string;

  // Exchange with higher price (PRIMARY - will open SHORT)
  primaryExchange: {
    name: string;
    credentialId: string;
    price: number;
    environment: string;
  };

  // Exchange with lower price (HEDGE - will open LONG)
  hedgeExchange: {
    name: string;
    credentialId: string;
    price: number;
    environment: string;
  };

  // Price spread
  spread: number; // As decimal (e.g., 0.015 = 1.5%)
  spreadPercent: number; // As percentage (e.g., 1.5)

  // Opportunity flags
  arbitrageOpportunity: boolean; // true if spread > threshold

  // Additional exchange data
  allExchanges: Array<{
    exchange: string;
    credentialId: string;
    price: number;
    environment: string;
  }>;
}

/**
 * API Response wrapper for single position
 */
export interface PriceArbitragePositionResponse {
  success: boolean;
  data: PriceArbitragePositionDTO;
  message?: string;
  timestamp: string;
}

/**
 * API Response wrapper for position list
 */
export interface PriceArbitragePositionListResponse {
  success: boolean;
  data: PriceArbitragePositionDTO[]; // Direct array, not nested
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  timestamp: string;
}

/**
 * API Response wrapper for opportunities
 */
export interface PriceArbitrageOpportunitiesResponse {
  success: boolean;
  data: PriceArbitrageOpportunity[]; // Direct array, not nested
  stats?: {
    totalOpportunities: number;
    minSpread: number;
    exchangesAnalyzed: number;
  };
  timestamp: string;
}

/**
 * API Response wrapper for close position operation
 */
export interface ClosePositionResponse {
  success: boolean;
  data: {
    position: PriceArbitragePositionDTO;
    totalPnl: number;
    primaryPnl: number;
    hedgePnl: number;
  };
  message?: string;
  timestamp: string;
}

/**
 * Error response from API
 */
export interface PriceArbitrageError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Position profit calculation for display
 */
export interface PositionProfitDisplay {
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  color: 'green' | 'red' | 'gray';
  textClass: string;
}

/**
 * Position holding time display
 */
export interface HoldingTimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

/**
 * Helper function to calculate holding time
 */
export function calculateHoldingTime(openedAt: Date | string): HoldingTimeDisplay {
  const opened = typeof openedAt === 'string' ? new Date(openedAt) : openedAt;
  const now = new Date();
  const diffMs = now.getTime() - opened.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours}h ${minutes}m ${seconds}s`
  };
}

/**
 * Helper function to format P&L display
 */
export function formatPnlDisplay(pnl: number | undefined): PositionProfitDisplay {
  if (pnl === undefined || pnl === null) {
    return {
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      color: 'gray',
      textClass: 'text-gray-500'
    };
  }

  return {
    unrealizedPnl: pnl,
    unrealizedPnlPercent: 0, // Calculated separately if needed
    color: pnl > 0 ? 'green' : pnl < 0 ? 'red' : 'gray',
    textClass: pnl > 0 ? 'text-green-600' : pnl < 0 ? 'text-red-600' : 'text-gray-500'
  };
}

/**
 * Type guard to check if response is an error
 */
export function isPriceArbitrageError(response: any): response is PriceArbitrageError {
  return (
    typeof response === 'object' &&
    response !== null &&
    response.success === false &&
    typeof response.error === 'object' &&
    typeof response.error.code === 'string' &&
    typeof response.error.message === 'string'
  );
}
