/**
 * Price Spread Calculator
 *
 * Centralized calculation for price spread between exchanges in arbitrage trading.
 *
 * KEY PRINCIPLE:
 * Price spread MUST consider which exchange has LONG position vs SHORT position.
 * Formula: |SHORT_price - LONG_price| / average_price * 100
 *
 * Why this matters:
 * - In arbitrage, we buy (LONG) on one exchange and sell (SHORT) on another
 * - The spread should reflect the actual price difference based on position sides
 * - This ensures consistent calculation across frontend and backend
 */

/**
 * Price spread calculation result
 */
export interface PriceSpreadResult {
  /**
   * Absolute price spread value
   * Formula: |SHORT_price - LONG_price|
   */
  spreadAbsolute: number;

  /**
   * Price spread as percentage
   * Formula: (|SHORT_price - LONG_price| / average_price) * 100
   */
  spreadPercent: number;

  /**
   * LONG exchange price
   */
  longPrice: number;

  /**
   * SHORT exchange price
   */
  shortPrice: number;

  /**
   * Average price (for reference)
   */
  averagePrice: number;

  /**
   * Which exchange has LONG position
   */
  longExchange: string;

  /**
   * Which exchange has SHORT position
   */
  shortExchange: string;
}

/**
 * Calculate price spread considering LONG and SHORT position sides
 *
 * @param primaryPrice - Price on primary exchange
 * @param hedgePrice - Price on hedge exchange
 * @param primarySide - Position side on primary exchange ('long' or 'short')
 * @param hedgeSide - Position side on hedge exchange ('long' or 'short')
 * @param primaryExchange - Primary exchange name (for result metadata)
 * @param hedgeExchange - Hedge exchange name (for result metadata)
 * @returns Price spread calculation result
 *
 * @example
 * const result = calculatePriceSpread(
 *   50000, // BTC price on Bybit
 *   50100, // BTC price on BingX
 *   'long',  // We LONG on Bybit
 *   'short', // We SHORT on BingX
 *   'BYBIT',
 *   'BINGX'
 * );
 * // Result: { spreadAbsolute: 100, spreadPercent: 0.1998, longPrice: 50000, shortPrice: 50100, ... }
 */
export function calculatePriceSpread(
  primaryPrice: number,
  hedgePrice: number,
  primarySide: 'long' | 'short',
  hedgeSide: 'long' | 'short',
  primaryExchange: string = 'primary',
  hedgeExchange: string = 'hedge'
): PriceSpreadResult {
  // Validate inputs
  if (!primaryPrice || primaryPrice <= 0) {
    throw new Error('Primary price must be a positive number');
  }
  if (!hedgePrice || hedgePrice <= 0) {
    throw new Error('Hedge price must be a positive number');
  }
  if (!primarySide || !hedgeSide) {
    throw new Error('Both position sides must be specified');
  }
  if (primarySide === hedgeSide) {
    console.warn('[PriceSpread] Warning: Both exchanges have same position side. This is not typical for arbitrage.');
  }

  // Determine which exchange has LONG and which has SHORT
  let longPrice: number;
  let shortPrice: number;
  let longExchange: string;
  let shortExchange: string;

  if (primarySide === 'long') {
    longPrice = primaryPrice;
    shortPrice = hedgePrice;
    longExchange = primaryExchange;
    shortExchange = hedgeExchange;
  } else {
    longPrice = hedgePrice;
    shortPrice = primaryPrice;
    longExchange = hedgeExchange;
    shortExchange = primaryExchange;
  }

  // Calculate spread
  // Formula: |SHORT_price - LONG_price|
  const spreadAbsolute = Math.abs(shortPrice - longPrice);

  // Calculate average price for percentage calculation
  const averagePrice = (longPrice + shortPrice) / 2;

  // Calculate percentage spread
  // Formula: (|SHORT_price - LONG_price| / average_price) * 100
  const spreadPercent = (spreadAbsolute / averagePrice) * 100;

  return {
    spreadAbsolute,
    spreadPercent,
    longPrice,
    shortPrice,
    averagePrice,
    longExchange,
    shortExchange,
  };
}

/**
 * Format price spread as percentage string
 *
 * @param spreadPercent - Spread percentage value
 * @param decimals - Number of decimal places (default: 4)
 * @returns Formatted percentage string (e.g., "0.1998")
 */
export function formatPriceSpreadPercent(spreadPercent: number, decimals: number = 4): string {
  return spreadPercent.toFixed(decimals);
}

/**
 * Simple price spread calculation without position sides
 * Uses absolute difference - NOT RECOMMENDED for arbitrage
 *
 * @deprecated Use calculatePriceSpread() instead for position-aware calculation
 */
export function calculateSimplePriceSpread(price1: number, price2: number): number {
  console.warn('[PriceSpread] DEPRECATED: Use calculatePriceSpread() for position-aware calculation');
  const spreadAbsolute = Math.abs(price1 - price2);
  const averagePrice = (price1 + price2) / 2;
  return (spreadAbsolute / averagePrice) * 100;
}
