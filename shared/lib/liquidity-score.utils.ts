/**
 * Liquidity Score Utilities
 *
 * Based on empirical analysis of funding payment recordings:
 * - RESOLV/USDT: liquidityScore = 0.20 → drop = 2.92%
 * - LA/USDT: liquidityScore = 0.57 → drop = 1.07%
 * - CVC/USDT: liquidityScore = 13.52 → drop = 0.29%
 *
 * Liquidity Score = Bid Size / Ask Size
 * Higher score = stronger buy support = smaller price drop expected
 */

export interface LiquidityScoreData {
  bidSize: number;
  askSize: number;
  bidPrice: number;
  askPrice: number;
}

export interface LiquidityAnalysis {
  liquidityScore: number;
  estimatedPriceDropPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  description: string;
}

export interface FundingOpportunityWithLiquidity {
  symbol: string;
  fundingRate: number;
  liquidityScore: number;
  estimatedPriceDropPercent: number;
  expectedNetReturnPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
}

/**
 * Calculate liquidity score from order book data
 * @param bidSize - Total size at best bid level
 * @param askSize - Total size at best ask level
 * @returns Liquidity score (bid/ask ratio)
 */
export function calculateLiquidityScore(bidSize: number, askSize: number): number {
  if (askSize <= 0) {
    return 0; // No ask liquidity = worst case
  }

  if (bidSize <= 0) {
    return 0; // No bid liquidity = worst case
  }

  return bidSize / askSize;
}

/**
 * Estimate price drop based on liquidity score
 *
 * Formula based on empirical data:
 * - Score < 0.5: Expect drop > 2%
 * - Score 0.5-1.0: Expect drop 1-2%
 * - Score 1.0-2.0: Expect drop 0.5-1%
 * - Score > 2.0: Expect drop < 0.5%
 *
 * Using inverse relationship: drop = 1.0 / liquidityScore
 * Capped between 0.2% (minimum) and 3.0% (maximum)
 *
 * @param liquidityScore - Calculated liquidity score
 * @returns Estimated price drop in percent (e.g., 1.5 for 1.5%)
 */
export function estimatePriceDropFromLiquidity(liquidityScore: number): number {
  if (liquidityScore <= 0) {
    return 3.0; // Maximum risk
  }

  // Base formula: inverse relationship
  const estimatedDrop = 1.0 / liquidityScore;

  // Cap between 0.2% and 3.0%
  return Math.max(0.2, Math.min(3.0, estimatedDrop));
}

/**
 * Get risk level based on liquidity score
 * @param liquidityScore - Calculated liquidity score
 * @returns Risk level classification
 */
export function getRiskLevel(liquidityScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
  if (liquidityScore >= 5.0) {
    return 'LOW'; // Strong bid support
  } else if (liquidityScore >= 1.0) {
    return 'MEDIUM'; // Balanced
  } else if (liquidityScore >= 0.5) {
    return 'HIGH'; // Thin bid side
  } else {
    return 'VERY_HIGH'; // Very thin bid side
  }
}

/**
 * Get human-readable description of liquidity condition
 * @param liquidityScore - Calculated liquidity score
 * @returns Description string
 */
export function getLiquidityDescription(liquidityScore: number): string {
  if (liquidityScore >= 5.0) {
    return 'Strong bid support - minimal drop expected';
  } else if (liquidityScore >= 2.0) {
    return 'Good bid support - small drop expected';
  } else if (liquidityScore >= 1.0) {
    return 'Balanced orderbook - moderate risk';
  } else if (liquidityScore >= 0.5) {
    return 'Thin bid side - significant drop expected';
  } else {
    return 'Very thin bid side - large drop expected';
  }
}

/**
 * Calculate complete liquidity analysis
 * @param data - Order book liquidity data
 * @returns Complete analysis with score, estimated drop, and risk level
 */
export function analyzeLiquidity(data: LiquidityScoreData): LiquidityAnalysis {
  const liquidityScore = calculateLiquidityScore(data.bidSize, data.askSize);
  const estimatedPriceDropPercent = estimatePriceDropFromLiquidity(liquidityScore);
  const riskLevel = getRiskLevel(liquidityScore);
  const description = getLiquidityDescription(liquidityScore);

  return {
    liquidityScore,
    estimatedPriceDropPercent,
    riskLevel,
    description,
  };
}

/**
 * Calculate expected net return for funding arbitrage opportunity
 * For negative funding rate (we receive payment on LONG):
 * expectedReturn = fundingPayment - estimatedPriceDrop
 *
 * @param fundingRate - Funding rate (e.g., -0.02 for -2%)
 * @param liquidityScore - Calculated liquidity score
 * @returns Expected net return in percent (e.g., 1.5 for 1.5%)
 */
export function calculateExpectedNetReturn(
  fundingRate: number,
  liquidityScore: number
): number {
  const fundingPayment = Math.abs(fundingRate) * 100; // Convert to percent
  const estimatedDrop = estimatePriceDropFromLiquidity(liquidityScore);

  // Net return = what we receive - what we expect to lose
  return fundingPayment - estimatedDrop;
}

/**
 * Analyze funding opportunity with liquidity data
 * @param symbol - Trading symbol
 * @param fundingRate - Funding rate (e.g., -0.02 for -2%)
 * @param orderBookData - Order book liquidity data
 * @returns Complete opportunity analysis
 */
export function analyzeFundingOpportunity(
  symbol: string,
  fundingRate: number,
  orderBookData: LiquidityScoreData
): FundingOpportunityWithLiquidity {
  const liquidityScore = calculateLiquidityScore(
    orderBookData.bidSize,
    orderBookData.askSize
  );
  const estimatedPriceDropPercent = estimatePriceDropFromLiquidity(liquidityScore);
  const expectedNetReturnPercent = calculateExpectedNetReturn(fundingRate, liquidityScore);
  const riskLevel = getRiskLevel(liquidityScore);

  return {
    symbol,
    fundingRate,
    liquidityScore,
    estimatedPriceDropPercent,
    expectedNetReturnPercent,
    riskLevel,
  };
}

/**
 * Check if funding opportunity meets minimum criteria
 * @param fundingRate - Funding rate
 * @param liquidityScore - Liquidity score
 * @param minNetReturn - Minimum acceptable net return (default: 0.3%)
 * @returns true if opportunity meets criteria
 */
export function isViableOpportunity(
  fundingRate: number,
  liquidityScore: number,
  minNetReturn: number = 0.3
): boolean {
  const expectedNetReturn = calculateExpectedNetReturn(fundingRate, liquidityScore);
  return expectedNetReturn >= minNetReturn;
}
