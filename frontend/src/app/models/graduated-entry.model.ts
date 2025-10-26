/**
 * Graduated Entry Arbitrage Models (Spot + Futures Strategy)
 *
 * Type definitions for spot+futures arbitrage where user:
 * - Buys spot asset on an exchange
 * - Opens SHORT futures position on SAME exchange
 * - Earns the FULL funding rate (not just differential)
 *
 * This is more profitable than cross-exchange when funding rates are positive.
 */

/**
 * Graduated Entry Opportunity (Spot + Futures on same exchange)
 */
export interface GraduatedEntryOpportunity {
  symbol: string;           // Normalized symbol (BTCUSDT)
  exchange: string;         // Exchange name (BINGX, BYBIT, etc.)

  // Current funding rate data
  fundingRate: number;      // Current funding rate (% per 8h)
  nextFundingTime: Date;    // Next funding payment time
  fundingInterval: number;  // Interval in hours (usually 8)

  // Price data
  spotPrice: number;        // Current spot price
  futuresPrice: number;     // Current futures price (mark price)
  priceDiff: number;        // Price difference (futures - spot)
  priceDiffPercent: number; // Price difference as percentage

  // Legacy metrics (instant calculations)
  expectedDailyReturn: number;   // Legacy: fundingRate * 3 (if 8h funding)
  estimatedMonthlyROI: number;   // Legacy: fundingRate * 90

  // REALISTIC METRICS - based on historical data
  realisticMetrics?: {
    // Daily return scenarios (%)
    dailyReturn: {
      pessimistic: number;  // avg - 1 stddev
      realistic: number;    // avg
      optimistic: number;   // avg + 1 stddev
    };
    // Monthly ROI scenarios (%)
    monthlyROI: {
      pessimistic: number;
      realistic: number;
      optimistic: number;
    };
    // Confidence score (0-100)
    confidence: number;
    // Data quality indicators
    dataPoints?: number;
    historicalPeriodDays?: number;
  };

  // Liquidity and volume
  volume24h?: number;       // 24h trading volume
  openInterest?: number;    // Open interest

  // Risk indicators
  volatility24h?: number;   // 24h price volatility
}

/**
 * API Response wrapper for graduated entry opportunities
 */
export interface GraduatedEntryOpportunitiesResponse {
  success: boolean;
  data: GraduatedEntryOpportunity[];
  stats?: {
    totalOpportunities: number;
    exchangesAnalyzed: number;
    symbolsAnalyzed: number;
    withRealisticMetrics: number;
  };
  timestamp: string;
}

/**
 * Error response from API
 */
export interface GraduatedEntryError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Type guard to check if response is an error
 */
export function isGraduatedEntryError(response: any): response is GraduatedEntryError {
  return (
    typeof response === 'object' &&
    response !== null &&
    response.success === false &&
    typeof response.error === 'object' &&
    typeof response.error.code === 'string' &&
    typeof response.error.message === 'string'
  );
}
