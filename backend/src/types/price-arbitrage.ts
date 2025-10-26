/**
 * Price Arbitrage Types
 *
 * Type definitions for price arbitrage trading system.
 * This system monitors price differences across exchanges and opens hedged positions
 * to profit from price convergence.
 */

import { PriceArbitrageStatus } from '@prisma/client';

/**
 * Parameters for starting a new price arbitrage position
 */
export interface StartPriceArbitrageParams {
  userId: string;
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
 * Current price data from an exchange
 */
export interface CurrentPriceData {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
  source: 'websocket' | 'rest_polling';
}

/**
 * Real-time position monitoring data
 */
export interface PositionMonitoringData {
  positionId: string;
  symbol: string;

  // Current prices
  primaryCurrentPrice: number;
  hedgeCurrentPrice: number;
  currentSpread: number;
  currentSpreadPercent: number;

  // Entry data
  entrySpread: number;
  entrySpreadPercent: number;

  // Unrealized P&L
  primaryUnrealizedPnl: number;
  hedgeUnrealizedPnl: number;
  totalUnrealizedPnl: number;

  // Timestamps
  openedAt: Date;
  holdingTimeSeconds: number;
  lastPriceUpdate: Date;

  // Convergence status
  convergenceProgress: number; // 0-100% (how close to target spread)
  shouldClose: boolean;
  closeReason?: 'target_reached' | 'stop_loss' | 'max_holding_time';
}

/**
 * Result of opening positions
 */
export interface OpenPositionsResult {
  success: boolean;
  positionId?: string;

  // Primary position details
  primaryOrderId?: string;
  primaryFillPrice?: number;
  primaryQuantity?: number;

  // Hedge position details
  hedgeOrderId?: string;
  hedgeFillPrice?: number;
  hedgeQuantity?: number;

  // Error handling
  error?: string;
  stage?: 'primary_open' | 'hedge_open' | 'both_open';
}

/**
 * Result of closing positions
 */
export interface ClosePositionsResult {
  success: boolean;

  // Primary position close details
  primaryClosePrice?: number;
  primaryPnl?: number;
  primaryFees?: number;

  // Hedge position close details
  hedgeClosePrice?: number;
  hedgePnl?: number;
  hedgeFees?: number;

  // Total results
  totalPnl?: number;
  exitSpread?: number;
  exitSpreadPercent?: number;

  // Error handling
  error?: string;
  stage?: 'primary_close' | 'hedge_close' | 'both_closed';
}

/**
 * Convergence strategy configuration
 */
export interface ConvergenceStrategy {
  type: 'percentage_reduction' | 'fixed_target' | 'profit_target';
  value: number; // Interpretation depends on type
}

/**
 * WebSocket subscription for price monitoring
 */
export interface PriceSubscription {
  exchange: string;
  symbol: string;
  callback: (price: CurrentPriceData) => void;
}

/**
 * Active position monitor data
 */
export interface ActivePositionMonitor {
  positionId: string;
  position: any; // PriceArbitragePosition from Prisma
  primaryPriceStream: PriceSubscription;
  hedgePriceStream: PriceSubscription;
  lastUpdate: number;
  convergenceConfig: {
    targetSpread: number;
    stopLoss?: number;
    maxHoldingTime?: number;
  };
}

/**
 * Error types for price arbitrage operations
 */
export type ArbitrageErrorStage =
  | 'PRIMARY_OPEN_FAILED'
  | 'HEDGE_OPEN_FAILED'
  | 'PRIMARY_CLOSE_FAILED'
  | 'HEDGE_CLOSE_FAILED'
  | 'MONITORING_FAILED'
  | 'WEBSOCKET_DISCONNECTED';

export interface ArbitrageError extends Error {
  stage: ArbitrageErrorStage;
  positionId?: string;
  details?: any;
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
  createdAt: Date;
  openedAt?: Date;
  closedAt?: Date;
  holdingTimeSeconds?: number;
}

/**
 * Arbitrage opportunity (combined price + funding rate arbitrage)
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

  // НОВЫЕ ПОЛЯ ДЛЯ КОМБИНИРОВАННОЙ СТРАТЕГИИ
  // Funding rate data (optional - may not be available for all symbols)
  primaryFundingRate?: number; // Funding rate на primary exchange (% per 8h)
  hedgeFundingRate?: number; // Funding rate на hedge exchange (% per 8h)
  fundingDifferential?: number; // Разница funding rates (% per 8h)

  // Combined strategy metrics (LEGACY - простые расчеты)
  combinedScore?: number; // Комбинированная оценка (price spread + funding)
  expectedDailyReturn?: number; // Ожидаемая дневная доходность (%) - LEGACY
  estimatedMonthlyROI?: number; // Прогноз месячного ROI (%) - LEGACY

  // REALISTIC METRICS - based on historical data (NEW)
  realisticMetrics?: {
    // Daily return scenarios (%)
    dailyReturn: {
      pessimistic: number; // avg - 1 stddev
      realistic: number; // avg
      optimistic: number; // avg + 1 stddev
    };
    // Monthly ROI scenarios (%)
    monthlyROI: {
      pessimistic: number;
      realistic: number;
      optimistic: number;
    };
    // Confidence score (0-100)
    // Higher = more reliable historical data
    confidence: number;
    // Data quality indicators
    dataPoints?: number; // Number of historical samples
    historicalPeriodDays?: number; // Period of analysis (usually 7 days)
  };

  // Strategy type
  strategyType: 'price_only' | 'funding_only' | 'combined'; // Тип стратегии
}

/**
 * Balance check result for both exchanges
 */
export interface BalanceCheckResult {
  primaryBalance: number | null;
  hedgeBalance: number | null;
  sufficientBalance: boolean;
  requiredPrimaryBalance: number;
  requiredHedgeBalance: number;
}

/**
 * Position profit calculation
 */
export interface ProfitCalculation {
  // Per-position profit
  primaryProfit: number; // SHORT position profit
  hedgeProfit: number; // LONG position profit

  // Fees
  primaryFees: number; // Entry + exit fees
  hedgeFees: number; // Entry + exit fees
  totalFees: number;

  // Net profit
  grossProfit: number; // primary + hedge
  netProfit: number; // gross - fees
  profitPercent: number; // ROI as percentage

  // Position sizes
  primaryPositionValue: number;
  hedgePositionValue: number;
  totalMargin: number;
}
