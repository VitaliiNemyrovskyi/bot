/**
 * Frontend Funding Spread Utilities
 *
 * This module provides utilities for formatting and displaying funding spreads
 * in the frontend. It mirrors the backend calculation logic and provides
 * display-specific functionality.
 *
 * IMPORTANT: All spread calculations should be done on the backend using
 * the funding-spread-calculator.ts utility. This file is ONLY for formatting
 * and display purposes.
 */

/**
 * Funding rate input interface (matches backend)
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
 * Funding spread result (matches backend)
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
 * Color class for funding rate display
 */
export type FundingRateColorClass = 'positive' | 'negative' | 'neutral';

/**
 * Normalize funding rate to 1-hour timeframe
 *
 * NOTE: This is a utility function for frontend-only calculations.
 * For backend calculations, use the backend utility.
 *
 * @param rate - Funding rate as decimal
 * @param intervalHours - Funding interval in hours
 * @returns Normalized rate per hour
 */
export function normalizeFundingRateTo1h(rate: number, intervalHours: number): number {
  if (intervalHours <= 0) {
    console.error(`Invalid funding interval: ${intervalHours}`);
    return 0;
  }
  return rate / intervalHours;
}

/**
 * Format funding rate for display
 *
 * @param rate - Funding rate as decimal
 * @param intervalHours - Funding interval in hours
 * @param precision - Number of decimal places (default: 3)
 * @returns Formatted string (e.g., "-0.500% / 4h")
 */
export function formatFundingRateDisplay(
  rate: number,
  intervalHours: number,
  precision: number = 3
): string {
  const percent = (rate * 100).toFixed(precision);
  return `${percent}% / ${intervalHours}h`;
}

/**
 * Format funding rate normalized to 1h for display
 *
 * @param rate - Funding rate as decimal
 * @param intervalHours - Funding interval in hours
 * @param precision - Number of decimal places (default: 4)
 * @returns Formatted string normalized to 1h (e.g., "-0.1250% / 1h")
 */
export function formatFundingRateNormalized(
  rate: number,
  intervalHours: number,
  precision: number = 4
): string {
  const normalizedRate = normalizeFundingRateTo1h(rate, intervalHours);
  const percent = (normalizedRate * 100).toFixed(precision);
  return `${percent}% / 1h`;
}

/**
 * Format spread percentage with sign
 *
 * @param spreadPerHour - Spread per hour as decimal
 * @param precision - Number of decimal places (default: 3)
 * @returns Formatted string (e.g., "+0.400%" or "-0.150%")
 */
export function formatSpreadPercentage(
  spreadPerHour: number,
  precision: number = 3
): string {
  const percent = (spreadPerHour * 100).toFixed(precision);
  const sign = spreadPerHour >= 0 ? '+' : '';
  return `${sign}${percent}%`;
}

/**
 * Get CSS color class for funding rate display
 *
 * Colors:
 * - Positive funding: green (earning funding when long)
 * - Negative funding: orange (paying funding when long, but earning when we go long)
 * - Zero funding: neutral
 *
 * @param rate - Funding rate as decimal (can be normalized or not)
 * @returns CSS color class name
 */
export function getFundingRateColorClass(rate: number): FundingRateColorClass {
  if (rate > 0) return 'positive';
  if (rate < 0) return 'negative';
  return 'neutral';
}

/**
 * Get CSS color class for spread display
 *
 * Colors:
 * - Positive spread: green (profitable)
 * - Negative spread: orange (losing money)
 * - Zero spread: neutral
 *
 * @param spreadPerHour - Spread per hour as decimal
 * @returns CSS color class name
 */
export function getSpreadColorClass(spreadPerHour: number): FundingRateColorClass {
  if (spreadPerHour > 0) return 'positive';
  if (spreadPerHour < 0) return 'negative';
  return 'neutral';
}

/**
 * Format full spread display with primary/hedge info
 *
 * Example output: "Gate.io → Bybit: +0.400% / 1h"
 *
 * @param result - Spread calculation result
 * @returns Formatted display string
 */
export function formatSpreadDisplay(result: FundingSpreadResult): string {
  const spreadPercent = formatSpreadPercentage(result.spreadPerHour);
  return `${result.primaryExchange} → ${result.hedgeExchange}: ${spreadPercent} / 1h`;
}

/**
 * Format spread with exchange rates
 *
 * Example output:
 * "Primary: Gate.io -0.8000% / 1h
 *  Hedge: Bybit -0.4000% / 1h
 *  Spread: +0.4000% / 1h"
 *
 * @param result - Spread calculation result
 * @returns Multi-line formatted string
 */
export function formatSpreadDetailed(result: FundingSpreadResult): string {
  const primaryRate = formatFundingRateNormalized(
    result.primaryRatePerHour * result.primaryInterval,
    result.primaryInterval
  );
  const hedgeRate = formatFundingRateNormalized(
    result.hedgeRatePerHour * result.hedgeInterval,
    result.hedgeInterval
  );
  const spread = formatSpreadPercentage(result.spreadPerHour);

  return `Primary: ${result.primaryExchange} ${primaryRate}\n` +
         `Hedge: ${result.hedgeExchange} ${hedgeRate}\n` +
         `Spread: ${spread} / 1h`;
}

/**
 * Parse percentage string to decimal
 *
 * Examples:
 * - "0.5%" → 0.005
 * - "-0.8%" → -0.008
 * - "1.2" → 0.012
 *
 * @param percentStr - Percentage string (with or without % symbol)
 * @returns Decimal value
 */
export function parsePercentageToDecimal(percentStr: string): number {
  const cleaned = percentStr.replace('%', '').trim();
  const value = parseFloat(cleaned);
  if (isNaN(value)) {
    console.error(`Invalid percentage string: ${percentStr}`);
    return 0;
  }
  return value / 100;
}

/**
 * Convert decimal to percentage
 *
 * @param decimal - Decimal value (e.g., 0.005)
 * @param precision - Number of decimal places (default: 3)
 * @returns Percentage value (e.g., 0.5)
 */
export function decimalToPercentage(decimal: number, precision: number = 3): number {
  return parseFloat((decimal * 100).toFixed(precision));
}

/**
 * Determine if funding rate is significant (worth considering)
 *
 * @param ratePerHour - Normalized funding rate per hour
 * @param threshold - Minimum absolute value to consider significant (default: 0.0001 = 0.01%)
 * @returns True if rate is significant
 */
export function isFundingRateSignificant(
  ratePerHour: number,
  threshold: number = 0.0001
): boolean {
  return Math.abs(ratePerHour) >= threshold;
}

/**
 * Determine if spread is profitable enough to trade
 *
 * @param spreadPerHour - Spread per hour as decimal
 * @param minSpread - Minimum spread threshold (default: 0.0003 = 0.03%)
 * @returns True if spread meets minimum threshold
 */
export function isSpreadProfitable(
  spreadPerHour: number,
  minSpread: number = 0.0003
): boolean {
  return spreadPerHour >= minSpread;
}

/**
 * Get appropriate CSS classes for funding rate display element
 *
 * @param rate - Funding rate as decimal
 * @returns Object with CSS class names
 */
export function getFundingRateCssClasses(rate: number): {
  color: string;
  badge: string;
} {
  const colorClass = getFundingRateColorClass(rate);

  return {
    color: colorClass === 'positive'
      ? 'text-success'
      : colorClass === 'negative'
      ? 'text-warning'
      : 'text-muted',
    badge: colorClass === 'positive'
      ? 'badge-success'
      : colorClass === 'negative'
      ? 'badge-warning'
      : 'badge-secondary'
  };
}

/**
 * Get appropriate CSS classes for spread display element
 *
 * @param spreadPerHour - Spread per hour as decimal
 * @returns Object with CSS class names
 */
export function getSpreadCssClasses(spreadPerHour: number): {
  color: string;
  badge: string;
  background: string;
} {
  const colorClass = getSpreadColorClass(spreadPerHour);

  return {
    color: colorClass === 'positive'
      ? 'text-success'
      : colorClass === 'negative'
      ? 'text-danger'
      : 'text-muted',
    badge: colorClass === 'positive'
      ? 'badge-success'
      : colorClass === 'negative'
      ? 'badge-danger'
      : 'badge-secondary',
    background: colorClass === 'positive'
      ? 'bg-success-subtle'
      : colorClass === 'negative'
      ? 'bg-danger-subtle'
      : 'bg-secondary-subtle'
  };
}

/**
 * Format annual percentage return (APR) from hourly rate
 *
 * @param ratePerHour - Rate per hour as decimal
 * @returns Annual percentage return as string (e.g., "35.04%")
 */
export function formatAnnualReturn(ratePerHour: number): string {
  const hoursPerYear = 365.25 * 24;
  const annualReturn = ratePerHour * hoursPerYear * 100;
  return `${annualReturn.toFixed(2)}%`;
}

/**
 * Calculate break-even spread accounting for trading fees
 *
 * @param makerFee - Maker fee as decimal (e.g., 0.0002 for 0.02%)
 * @param takerFee - Taker fee as decimal (e.g., 0.0005 for 0.05%)
 * @param fundingInterval - Funding interval in hours
 * @returns Minimum spread needed to break even
 */
export function calculateBreakEvenSpread(
  makerFee: number,
  takerFee: number,
  fundingInterval: number
): number {
  // Opening: taker fee on both exchanges
  // Closing: taker fee on both exchanges
  // Total fees: 2 * (makerFee + takerFee) normalized to hourly rate
  const totalFees = 2 * (makerFee + takerFee);
  // Amortize over funding interval
  return totalFees / fundingInterval;
}
