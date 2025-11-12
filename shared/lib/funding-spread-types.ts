/**
 * Shared TypeScript Types for Funding Spread Calculations
 *
 * This file contains all type definitions used across backend and frontend
 * for funding spread calculations. These types ensure consistency and type safety.
 */

/**
 * Input for a single exchange's funding rate
 * Used when calculating spreads between two exchanges
 */
export interface FundingRateInput {
  /**
   * Funding rate as decimal (e.g., -0.008 for -0.8% or 0.0032 for 0.32%)
   * Positive = longs pay shorts
   * Negative = shorts pay longs
   */
  rate: number;

  /**
   * Funding interval in hours (typically 1, 4, or 8)
   * This is how often the funding rate is collected
   */
  intervalHours: number;

  /**
   * Exchange name (e.g., 'BYBIT', 'GATEIO', 'BINANCE')
   */
  exchange: string;

  /**
   * Optional: Trading symbol (e.g., 'BTC/USDT')
   */
  symbol?: string;
}

/**
 * Result of funding spread calculation
 * Contains all information needed to display and analyze the spread
 */
export interface FundingSpreadResult {
  /**
   * Net profit/loss per hour as decimal (e.g., 0.004 for 0.4%, -0.002 for -0.2%)
   * Positive = profitable strategy
   * Negative = losing strategy
   */
  spreadPerHour: number;

  /**
   * Formatted spread as percentage string for display (e.g., "0.4%", "-0.2%")
   */
  spreadPercentFormatted: string;

  /**
   * Primary exchange (long position) - has larger |normalized_value|
   * We earn funding on this exchange
   */
  primaryExchange: string;

  /**
   * Hedge exchange (short position) - has smaller |normalized_value|
   * We pay or earn funding on this exchange
   */
  hedgeExchange: string;

  /**
   * Primary exchange funding rate normalized to 1 hour
   * This is the rate per hour we earn on the long position
   */
  primaryRatePerHour: number;

  /**
   * Hedge exchange funding rate normalized to 1 hour
   * This is the rate per hour we pay/earn on the short position
   */
  hedgeRatePerHour: number;

  /**
   * Original interval used for primary exchange (in hours)
   */
  primaryInterval: number;

  /**
   * Original interval used for hedge exchange (in hours)
   */
  hedgeInterval: number;

  /**
   * Whether the spread is profitable (spreadPerHour > 0)
   */
  isProfitable: boolean;
}

/**
 * Strategy type for spread calculation
 */
export enum SpreadStrategyType {
  /**
   * Combined strategy: long on primary + short on hedge
   * Earns from both funding rate differential AND price neutrality
   */
  COMBINED = 'combined',

  /**
   * Price-only strategy: profit from price movements only
   * Funding rates affect cost of holding position
   */
  PRICE_ONLY = 'price_only',
}

/**
 * Color class for funding rate display
 * Used for visual indication in UI
 */
export type FundingRateColorClass = 'positive' | 'negative' | 'neutral';
