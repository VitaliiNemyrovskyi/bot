/**
 * Centralized Funding Spread Calculator
 *
 * ⚠️ CRITICAL: This is the SINGLE source of truth for ALL funding spread calculations.
 * ALL spread calculations across the application MUST use this utility.
 * DO NOT create alternative implementations or duplicate this logic.
 *
 * Business Logic Documentation:
 * ============================
 *
 * 1. NORMALIZATION TO 1-HOUR TIMEFRAME
 *    - All funding rates must be normalized to 1h interval before comparison
 *    - Formula: rate_per_hour = rate / intervalHours
 *    - Example: -3.2% / 8h = -0.4% / 1h
 *
 * 2. PRIMARY vs HEDGE EXCHANGE DETERMINATION
 *    - Primary = exchange with LARGER |normalized_value_per_hour|
 *    - Hedge = exchange with SMALLER |normalized_value_per_hour|
 *    - This is dynamic and can change as funding rates change
 *
 * 3. COMBINED STRATEGY FORMULA
 *    - Spread = Math.abs(primary_normalized) + hedge_normalized
 *    - We go LONG on primary (earning funding)
 *    - We go SHORT on hedge (paying or earning funding)
 *
 *    Example 1: Both negative funding (most common)
 *    - Bybit: -3.2% / 8h → -0.4% / 1h
 *    - Gate.io: -0.8% / 1h
 *    - |0.8%| > |0.4%|, so Gate.io = primary, Bybit = hedge
 *    - Spread = Math.abs(-0.8%) + (-0.4%) = 0.8% - 0.4% = 0.4% per hour ✓ PROFIT
 *
 *    Example 2: Primary negative, hedge positive
 *    - Gate.io: -0.8% / 1h (primary)
 *    - Bybit: +0.2% / 1h (hedge)
 *    - Spread = Math.abs(-0.8%) + 0.2% = 0.8% + 0.2% = 1.0% per hour ✓ BETTER PROFIT
 *
 *    Example 3: Rates converge (spread drops)
 *    - Gate.io: -0.5% / 1h (primary)
 *    - Bybit: -0.6% / 1h (hedge)
 *    - Spread = Math.abs(-0.5%) + (-0.6%) = 0.5% - 0.6% = -0.1% per hour ✗ LOSS
 *
 * 4. SPREAD SIGN INTERPRETATION
 *    - Positive spread = profitable strategy (primary rate advantage holds)
 *    - Negative spread = losing strategy (primary rate dropped OR hedge rate increased)
 *    - Zero spread = break-even (no funding advantage)
 *
 * 5. PRICE-ONLY STRATEGY
 *    - Different calculation for price arbitrage strategies
 *    - Spread represents funding cost/benefit while holding position
 *
 * @module funding-spread-calculator
 * @packageDocumentation
 */

import {
  FundingRateInput,
  FundingSpreadResult,
  SpreadStrategyType,
} from './funding-spread-types';

/**
 * Normalize funding rate to 1-hour timeframe
 *
 * This is the foundation of all spread calculations.
 * All rates MUST be normalized before comparison.
 *
 * @param rate - Funding rate as decimal (e.g., -0.032 for -3.2%)
 * @param intervalHours - Funding interval in hours (1, 4, or 8)
 * @returns Normalized rate per hour
 * @throws Error if intervalHours <= 0
 *
 * @example
 * // Bybit 8-hour funding
 * normalizeFundingRateTo1h(-0.032, 8) // Returns -0.004 (-0.4% per hour)
 *
 * @example
 * // Gate.io 1-hour funding (already normalized)
 * normalizeFundingRateTo1h(-0.008, 1) // Returns -0.008 (-0.8% per hour)
 */
export function normalizeFundingRateTo1h(rate: number, intervalHours: number): number {
  if (intervalHours <= 0) {
    throw new Error(`Invalid funding interval: ${intervalHours}. Must be > 0`);
  }
  return rate / intervalHours;
}

/**
 * Calculate funding spread for combined arbitrage strategy
 *
 * Combined Strategy = Long on primary exchange + Short on hedge exchange
 *
 * Algorithm:
 * 1. Normalize both rates to 1-hour timeframe
 * 2. Determine primary (larger |normalized|) and hedge (smaller |normalized|)
 * 3. Calculate spread: Math.abs(primary_normalized) + hedge_normalized
 * 4. Positive spread = profit, negative spread = loss
 *
 * Why this formula works:
 * - We go LONG on primary → we EARN Math.abs(primary_rate)
 * - We go SHORT on hedge:
 *   - If hedge is negative → we PAY Math.abs(hedge_rate) → reduces profit
 *   - If hedge is positive → we EARN hedge_rate → increases profit
 * - Net result = Math.abs(primary) + hedge (where hedge keeps its sign)
 *
 * @param exchangeA - First exchange funding rate data
 * @param exchangeB - Second exchange funding rate data
 * @returns Complete spread calculation result
 * @throws Error if inputs are invalid
 *
 * @example
 * // Typical case: both exchanges have negative funding
 * const result = calculateCombinedFundingSpread(
 *   { rate: -0.008, intervalHours: 1, exchange: 'GATEIO' },
 *   { rate: -0.032, intervalHours: 8, exchange: 'BYBIT' }
 * );
 * // Result:
 * // - primaryExchange: 'GATEIO' (|0.8%| > |0.4%|)
 * // - hedgeExchange: 'BYBIT'
 * // - spreadPerHour: 0.004 (0.4% per hour)
 * // - isProfitable: true
 */
export function calculateCombinedFundingSpread(
  exchangeA: FundingRateInput,
  exchangeB: FundingRateInput
): FundingSpreadResult {
  // ===== STEP 1: INPUT VALIDATION =====
  if (!exchangeA || !exchangeB) {
    throw new Error('Both exchanges are required for spread calculation');
  }

  if (exchangeA.intervalHours <= 0 || exchangeB.intervalHours <= 0) {
    throw new Error(
      `Invalid funding intervals: ${exchangeA.exchange}=${exchangeA.intervalHours}h, ${exchangeB.exchange}=${exchangeB.intervalHours}h`
    );
  }

  // ===== STEP 2: NORMALIZE TO 1-HOUR TIMEFRAME =====
  const normalizedA = normalizeFundingRateTo1h(exchangeA.rate, exchangeA.intervalHours);
  const normalizedB = normalizeFundingRateTo1h(exchangeB.rate, exchangeB.intervalHours);

  // ===== STEP 3: DETERMINE PRIMARY (larger |value|) AND HEDGE =====
  const absA = Math.abs(normalizedA);
  const absB = Math.abs(normalizedB);

  let primaryExchange: string;
  let hedgeExchange: string;
  let primaryRatePerHour: number;
  let hedgeRatePerHour: number;
  let primaryInterval: number;
  let hedgeInterval: number;

  if (absA >= absB) {
    // Exchange A has larger absolute value → it's primary
    primaryExchange = exchangeA.exchange;
    hedgeExchange = exchangeB.exchange;
    primaryRatePerHour = normalizedA;
    hedgeRatePerHour = normalizedB;
    primaryInterval = exchangeA.intervalHours;
    hedgeInterval = exchangeB.intervalHours;
  } else {
    // Exchange B has larger absolute value → it's primary
    primaryExchange = exchangeB.exchange;
    hedgeExchange = exchangeA.exchange;
    primaryRatePerHour = normalizedB;
    hedgeRatePerHour = normalizedA;
    primaryInterval = exchangeB.intervalHours;
    hedgeInterval = exchangeA.intervalHours;
  }

  // ===== STEP 4: CALCULATE SPREAD =====
  // Formula: Math.abs(primary_normalized) + hedge_normalized
  //
  // This works because:
  // - We go LONG on primary (earning funding rate)
  // - We go SHORT on hedge (paying or earning funding rate)
  // - If primary is negative: we earn Math.abs(primary)
  // - If hedge is negative: we pay Math.abs(hedge) → reduces profit
  // - If hedge is positive: we earn hedge → increases profit
  const spreadPerHour = Math.abs(primaryRatePerHour) + hedgeRatePerHour;

  // ===== STEP 5: FORMAT RESULT =====
  const spreadPercent = spreadPerHour * 100;
  const spreadPercentFormatted = `${spreadPercent.toFixed(3)}%`;
  const isProfitable = spreadPerHour > 0;

  return {
    spreadPerHour,
    spreadPercentFormatted,
    primaryExchange,
    hedgeExchange,
    primaryRatePerHour,
    hedgeRatePerHour,
    primaryInterval,
    hedgeInterval,
    isProfitable,
  };
}

/**
 * Calculate funding spread for price-only arbitrage strategy
 *
 * Price-Only Strategy = Focus on price movements, not funding collection
 *
 * In this strategy:
 * - Spread represents the funding cost/benefit while holding positions
 * - Simply the difference between normalized rates
 * - Used when primary goal is price arbitrage, not funding collection
 *
 * @param exchangeA - First exchange funding rate data
 * @param exchangeB - Second exchange funding rate data
 * @returns Spread calculation result
 * @throws Error if inputs are invalid
 *
 * @example
 * const result = calculatePriceOnlyFundingSpread(
 *   { rate: -0.008, intervalHours: 1, exchange: 'GATEIO' },
 *   { rate: -0.004, intervalHours: 1, exchange: 'BYBIT' }
 * );
 * // Result shows net funding impact on price arbitrage position
 */
export function calculatePriceOnlyFundingSpread(
  exchangeA: FundingRateInput,
  exchangeB: FundingRateInput
): FundingSpreadResult {
  // ===== STEP 1: INPUT VALIDATION =====
  if (!exchangeA || !exchangeB) {
    throw new Error('Both exchanges are required for spread calculation');
  }

  if (exchangeA.intervalHours <= 0 || exchangeB.intervalHours <= 0) {
    throw new Error(
      `Invalid funding intervals: ${exchangeA.exchange}=${exchangeA.intervalHours}h, ${exchangeB.exchange}=${exchangeB.intervalHours}h`
    );
  }

  // ===== STEP 2: NORMALIZE TO 1-HOUR TIMEFRAME =====
  const normalizedA = normalizeFundingRateTo1h(exchangeA.rate, exchangeA.intervalHours);
  const normalizedB = normalizeFundingRateTo1h(exchangeB.rate, exchangeB.intervalHours);

  // ===== STEP 3: CALCULATE SPREAD =====
  // For price-only, spread is simply the difference
  // This represents the net funding impact on the position
  const spreadPerHour = normalizedA - normalizedB;

  // ===== STEP 4: FORMAT RESULT =====
  const spreadPercent = spreadPerHour * 100;
  const spreadPercentFormatted = `${spreadPercent.toFixed(3)}%`;
  const isProfitable = spreadPerHour > 0;

  return {
    spreadPerHour,
    spreadPercentFormatted,
    primaryExchange: exchangeA.exchange,
    hedgeExchange: exchangeB.exchange,
    primaryRatePerHour: normalizedA,
    hedgeRatePerHour: normalizedB,
    primaryInterval: exchangeA.intervalHours,
    hedgeInterval: exchangeB.intervalHours,
    isProfitable,
  };
}

/**
 * Main function to calculate funding spread
 *
 * This is the primary entry point for all spread calculations.
 * Automatically dispatches to the appropriate strategy calculator.
 *
 * @param exchangeA - First exchange funding rate data
 * @param exchangeB - Second exchange funding rate data
 * @param strategy - Strategy type (default: COMBINED)
 * @returns Complete spread calculation result
 * @throws Error if strategy type is unknown
 *
 * @example
 * // Use combined strategy (default)
 * const spread = calculateFundingSpread(exchangeA, exchangeB);
 *
 * @example
 * // Explicitly specify strategy
 * const spread = calculateFundingSpread(
 *   exchangeA,
 *   exchangeB,
 *   SpreadStrategyType.COMBINED
 * );
 */
export function calculateFundingSpread(
  exchangeA: FundingRateInput,
  exchangeB: FundingRateInput,
  strategy: SpreadStrategyType = SpreadStrategyType.COMBINED
): FundingSpreadResult {
  switch (strategy) {
    case SpreadStrategyType.COMBINED:
      return calculateCombinedFundingSpread(exchangeA, exchangeB);
    case SpreadStrategyType.PRICE_ONLY:
      return calculatePriceOnlyFundingSpread(exchangeA, exchangeB);
    default:
      throw new Error(`Unknown strategy type: ${strategy}`);
  }
}

/**
 * Format funding rate for display
 *
 * @param rate - Funding rate as decimal
 * @param intervalHours - Funding interval in hours
 * @returns Formatted string (e.g., "-0.5% / 4h")
 *
 * @example
 * formatFundingRateDisplay(-0.005, 4) // Returns "-0.500% / 4h"
 */
export function formatFundingRateDisplay(rate: number, intervalHours: number): string {
  const percent = (rate * 100).toFixed(3);
  return `${percent}% / ${intervalHours}h`;
}

/**
 * Format funding rate normalized to 1h for display
 *
 * @param rate - Funding rate as decimal
 * @param intervalHours - Funding interval in hours
 * @returns Formatted string normalized to 1h (e.g., "-0.125% / 1h")
 *
 * @example
 * formatFundingRateNormalized(-0.005, 4) // Returns "-0.125% / 1h"
 */
export function formatFundingRateNormalized(rate: number, intervalHours: number): string {
  const normalizedRate = normalizeFundingRateTo1h(rate, intervalHours);
  const percent = (normalizedRate * 100).toFixed(4);
  return `${percent}% / 1h`;
}

/**
 * Determine color class for funding rate display
 *
 * Color scheme:
 * - positive (green): Positive funding rate
 * - negative (orange): Negative funding rate
 * - neutral (gray): Zero funding rate
 *
 * @param rate - Funding rate as decimal (can be normalized or not)
 * @returns Color indicator
 *
 * @example
 * getFundingRateColorClass(0.005)  // Returns 'positive'
 * getFundingRateColorClass(-0.005) // Returns 'negative'
 * getFundingRateColorClass(0)      // Returns 'neutral'
 */
export function getFundingRateColorClass(rate: number): 'positive' | 'negative' | 'neutral' {
  if (rate > 0) return 'positive';
  if (rate < 0) return 'negative';
  return 'neutral';
}
