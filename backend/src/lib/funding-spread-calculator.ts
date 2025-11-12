/**
 * Centralized Funding Spread Calculator
 *
 * This is the SINGLE source of truth for funding spread calculations.
 * All spread calculations across the application MUST use this utility.
 *
 * Business Logic:
 * 1. Normalize all funding rates to 1-hour timeframe
 * 2. Determine primary exchange (larger absolute normalized value)
 * 3. Calculate spread: Math.abs(primary_normalized) + hedge_normalized
 * 4. Primary = Long position (earning funding)
 * 5. Hedge = Short position (paying or earning funding)
 * 6. Positive spread = profitable strategy
 * 7. Negative spread = losing strategy
 */

/**
 * Input for a single exchange's funding rate
 */
export interface FundingRateInput {
  /** Funding rate as decimal (e.g., -0.008 for -0.8% or 0.0032 for 0.32%) */
  rate: number;
  /** Funding interval in hours (1, 4, or 8) */
  intervalHours: number;
  /** Exchange name */
  exchange: string;
  /** Symbol being traded */
  symbol?: string;
}

/**
 * Result of funding spread calculation
 */
export interface FundingSpreadResult {
  /** Net profit/loss per hour as decimal (e.g., 0.004 for 0.4%) */
  spreadPerHour: number;
  /** Formatted spread as percentage string (e.g., "0.4%") */
  spreadPercentFormatted: string;
  /** Primary exchange (long position) */
  primaryExchange: string;
  /** Hedge exchange (short position) */
  hedgeExchange: string;
  /** Primary exchange funding rate normalized to 1h */
  primaryRatePerHour: number;
  /** Hedge exchange funding rate normalized to 1h */
  hedgeRatePerHour: number;
  /** Interval used for primary exchange */
  primaryInterval: number;
  /** Interval used for hedge exchange */
  hedgeInterval: number;
  /** Whether the spread is profitable (positive) */
  isProfitable: boolean;
}

/**
 * Strategy type for spread calculation
 */
export enum SpreadStrategyType {
  /** Combined strategy: long on primary + short on hedge */
  COMBINED = 'combined',
  /** Price-only strategy: profit from price movements only */
  PRICE_ONLY = 'price_only',
}

/**
 * Normalize funding rate to 1-hour timeframe
 *
 * @param rate - Funding rate as decimal
 * @param intervalHours - Funding interval in hours
 * @returns Normalized rate per hour
 */
export function normalizeFundingRateTo1h(rate: number, intervalHours: number): number {
  if (intervalHours <= 0) {
    throw new Error(`Invalid funding interval: ${intervalHours}. Must be > 0`);
  }
  return rate / intervalHours;
}

/**
 * Calculate funding spread for combined strategy
 *
 * Combined Strategy Logic:
 * - Normalize both rates to 1-hour timeframe
 * - Primary = exchange with larger |normalized_value|
 * - Hedge = exchange with smaller |normalized_value|
 * - Long on primary (earning funding), short on hedge (paying/earning funding)
 * - Spread = Math.abs(primary_normalized) + hedge_normalized
 * - Positive spread = profit, negative spread = loss
 *
 * Example:
 * - Bybit: -3.2% / 8h → -0.4% / 1h
 * - Gate.io: -0.8% / 1h
 * - |0.8%| > |0.4%|, so Gate.io is primary, Bybit is hedge
 * - Spread = Math.abs(-0.8%) + (-0.4%) = 0.8% - 0.4% = 0.4% per hour
 *
 * @param exchangeA - First exchange funding rate
 * @param exchangeB - Second exchange funding rate
 * @returns Spread calculation result
 */
export function calculateCombinedFundingSpread(
  exchangeA: FundingRateInput,
  exchangeB: FundingRateInput
): FundingSpreadResult {
  // Validate inputs
  if (!exchangeA || !exchangeB) {
    throw new Error('Both exchanges are required for spread calculation');
  }

  if (exchangeA.intervalHours <= 0 || exchangeB.intervalHours <= 0) {
    throw new Error(
      `Invalid funding intervals: ${exchangeA.exchange}=${exchangeA.intervalHours}h, ${exchangeB.exchange}=${exchangeB.intervalHours}h`
    );
  }

  // Step 1: Normalize both rates to 1-hour timeframe
  const normalizedA = normalizeFundingRateTo1h(exchangeA.rate, exchangeA.intervalHours);
  const normalizedB = normalizeFundingRateTo1h(exchangeB.rate, exchangeB.intervalHours);

  // Step 2: Determine primary (larger |normalized_value|) and hedge
  const absA = Math.abs(normalizedA);
  const absB = Math.abs(normalizedB);

  let primaryExchange: string;
  let hedgeExchange: string;
  let primaryRatePerHour: number;
  let hedgeRatePerHour: number;
  let primaryInterval: number;
  let hedgeInterval: number;

  if (absA >= absB) {
    primaryExchange = exchangeA.exchange;
    hedgeExchange = exchangeB.exchange;
    primaryRatePerHour = normalizedA;
    hedgeRatePerHour = normalizedB;
    primaryInterval = exchangeA.intervalHours;
    hedgeInterval = exchangeB.intervalHours;
  } else {
    primaryExchange = exchangeB.exchange;
    hedgeExchange = exchangeA.exchange;
    primaryRatePerHour = normalizedB;
    hedgeRatePerHour = normalizedA;
    primaryInterval = exchangeB.intervalHours;
    hedgeInterval = exchangeA.intervalHours;
  }

  // Step 3: Calculate spread using the formula
  // Math.abs(primary_normalized) + hedge_normalized
  // This works because:
  // - We go LONG on primary (earning the funding rate)
  // - We go SHORT on hedge (paying or earning the funding rate)
  // - If primary is negative: we earn Math.abs(primary)
  // - If hedge is negative: we pay Math.abs(hedge) (reduces profit)
  // - If hedge is positive: we earn hedge (increases profit)
  const spreadPerHour = Math.abs(primaryRatePerHour) + hedgeRatePerHour;

  // Step 4: Format result
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
 * Calculate funding spread for price-only strategy
 *
 * Price-Only Strategy Logic:
 * - Focus on price movements rather than funding collection
 * - Spread represents the funding cost/benefit while holding position
 * - Simply normalize both rates and return the difference
 *
 * @param exchangeA - First exchange funding rate
 * @param exchangeB - Second exchange funding rate
 * @returns Spread calculation result
 */
export function calculatePriceOnlyFundingSpread(
  exchangeA: FundingRateInput,
  exchangeB: FundingRateInput
): FundingSpreadResult {
  // Validate inputs
  if (!exchangeA || !exchangeB) {
    throw new Error('Both exchanges are required for spread calculation');
  }

  if (exchangeA.intervalHours <= 0 || exchangeB.intervalHours <= 0) {
    throw new Error(
      `Invalid funding intervals: ${exchangeA.exchange}=${exchangeA.intervalHours}h, ${exchangeB.exchange}=${exchangeB.intervalHours}h`
    );
  }

  // Normalize both rates to 1-hour timeframe
  const normalizedA = normalizeFundingRateTo1h(exchangeA.rate, exchangeA.intervalHours);
  const normalizedB = normalizeFundingRateTo1h(exchangeB.rate, exchangeB.intervalHours);

  // For price-only, we just care about the net funding impact
  // The spread is simply the difference between normalized rates
  const spreadPerHour = normalizedA - normalizedB;

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
 * @param exchangeA - First exchange funding rate
 * @param exchangeB - Second exchange funding rate
 * @param strategy - Strategy type (default: COMBINED)
 * @returns Spread calculation result
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
 */
export function formatFundingRateNormalized(rate: number, intervalHours: number): string {
  const normalizedRate = normalizeFundingRateTo1h(rate, intervalHours);
  const percent = (normalizedRate * 100).toFixed(4);
  return `${percent}% / 1h`;
}

/**
 * Determine color class for funding rate display
 *
 * @param rate - Funding rate as decimal (can be normalized or not)
 * @returns Color indicator ('positive' for green, 'negative' for orange, 'neutral' for zero)
 */
export function getFundingRateColorClass(rate: number): 'positive' | 'negative' | 'neutral' {
  if (rate > 0) return 'positive';
  if (rate < 0) return 'negative';
  return 'neutral';
}
