import { Exchange } from '@prisma/client';
import prisma from './prisma';

/**
 * Statistical metrics for funding rates
 */
export interface FundingRateMetrics {
  average: number;
  median: number;
  stddev: number;
  min: number;
  max: number;
  confidenceInterval95: {
    lower: number;
    upper: number;
  };
  dataPoints: number;
}

/**
 * Realistic ROI estimates based on historical data
 */
export interface RealisticROIEstimate {
  expectedDailyReturn: {
    pessimistic: number; // Lower bound (avg - 1 stddev)
    realistic: number; // Average
    optimistic: number; // Upper bound (avg + 1 stddev)
  };
  expectedMonthlyROI: {
    pessimistic: number;
    realistic: number;
    optimistic: number;
  };
  confidence: number; // 0-100, higher = more reliable data
}

/**
 * Calculate statistical metrics for funding rates over a period
 * Normalizes all funding rates to 8-hour intervals for fair comparison
 */
export async function calculateFundingRateMetrics(
  exchange: Exchange,
  symbol: string,
  daysBack: number = 7
): Promise<FundingRateMetrics | null> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const rates = await prisma.publicFundingRate.findMany({
      where: {
        exchange,
        symbol,
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      select: {
        fundingRate: true,
        fundingInterval: true, // Include interval for normalization
      },
    });

    if (rates.length === 0) {
      return null;
    }

    // Normalize all rates to 8-hour interval for fair comparison
    const values = rates.map((r) => {
      // Convert interval (in hours) to normalization multiplier
      const multiplier = 8 / r.fundingInterval;
      return r.fundingRate * multiplier;
    });

    // Calculate average
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Calculate median
    const sorted = [...values].sort((a, b) => a - b);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // Calculate standard deviation
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);

    // Calculate min/max
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate 95% confidence interval (assumes normal distribution)
    // CI = mean ± (1.96 * stddev / sqrt(n))
    const marginOfError = 1.96 * (stddev / Math.sqrt(values.length));
    const confidenceInterval95 = {
      lower: average - marginOfError,
      upper: average + marginOfError,
    };

    return {
      average,
      median,
      stddev,
      min,
      max,
      confidenceInterval95,
      dataPoints: values.length,
    };
  } catch (error: any) {
    console.error(`[MetricsCalculator] Error calculating funding rate metrics:`, error.message);
    return null;
  }
}

/**
 * Calculate funding rate differential metrics between two exchanges
 */
export async function calculateFundingDifferentialMetrics(
  exchange1: Exchange,
  exchange2: Exchange,
  symbol: string,
  daysBack: number = 7
): Promise<FundingRateMetrics | null> {
  try {
    const metrics1 = await calculateFundingRateMetrics(exchange1, symbol, daysBack);
    const metrics2 = await calculateFundingRateMetrics(exchange2, symbol, daysBack);

    if (!metrics1 || !metrics2) {
      return null;
    }

    // Calculate differential metrics
    const average = metrics1.average - metrics2.average;
    const median = metrics1.median - metrics2.median;

    // Combined standard deviation
    const stddev = Math.sqrt(Math.pow(metrics1.stddev, 2) + Math.pow(metrics2.stddev, 2));

    const min = metrics1.min - metrics2.max;
    const max = metrics1.max - metrics2.min;

    const marginOfError = 1.96 * (stddev / Math.sqrt(Math.min(metrics1.dataPoints, metrics2.dataPoints)));
    const confidenceInterval95 = {
      lower: average - marginOfError,
      upper: average + marginOfError,
    };

    return {
      average,
      median,
      stddev,
      min,
      max,
      confidenceInterval95,
      dataPoints: Math.min(metrics1.dataPoints, metrics2.dataPoints),
    };
  } catch (error: any) {
    console.error(`[MetricsCalculator] Error calculating funding differential metrics:`, error.message);
    return null;
  }
}

/**
 * Calculate realistic ROI estimate based on historical data
 *
 * IMPORTANT: All funding rates are normalized to 8-hour intervals by calculateFundingRateMetrics()
 * This ensures fair comparison even if exchanges have different funding intervals (1h, 4h, 8h)
 */
export async function calculateRealisticROI(
  primaryExchange: Exchange,
  hedgeExchange: Exchange,
  symbol: string,
  spreadPercent: number,
  daysBack: number = 7
): Promise<RealisticROIEstimate | null> {
  try {
    const fundingMetrics = await calculateFundingDifferentialMetrics(
      primaryExchange,
      hedgeExchange,
      symbol,
      daysBack
    );

    if (!fundingMetrics) {
      return null;
    }

    // Funding payments per day for 8-hour intervals (3 times per day)
    // Note: All rates are already normalized to 8h intervals by calculateFundingRateMetrics()
    const paymentsPerDay = 3;
    const daysPerMonth = 30;

    // Calculate daily return scenarios
    const pessimisticFundingDaily = (fundingMetrics.average - fundingMetrics.stddev) * paymentsPerDay;
    const realisticFundingDaily = fundingMetrics.average * paymentsPerDay;
    const optimisticFundingDaily = (fundingMetrics.average + fundingMetrics.stddev) * paymentsPerDay;

    const expectedDailyReturn = {
      pessimistic: (spreadPercent + pessimisticFundingDaily * 100),
      realistic: (spreadPercent + realisticFundingDaily * 100),
      optimistic: (spreadPercent + optimisticFundingDaily * 100),
    };

    // Calculate monthly ROI scenarios
    // Spread captured once, funding accumulated over month
    const expectedMonthlyROI = {
      pessimistic: (spreadPercent + pessimisticFundingDaily * daysPerMonth * 100),
      realistic: (spreadPercent + realisticFundingDaily * daysPerMonth * 100),
      optimistic: (spreadPercent + optimisticFundingDaily * daysPerMonth * 100),
    };

    // Confidence score based on data points and consistency
    // More data points + lower stddev = higher confidence
    const dataScore = Math.min(fundingMetrics.dataPoints / 168, 1); // Max confidence at 1 week of hourly data
    const consistencyScore = 1 - Math.min(fundingMetrics.stddev / Math.abs(fundingMetrics.average), 1);
    const confidence = Math.round((dataScore * 0.6 + consistencyScore * 0.4) * 100);

    return {
      expectedDailyReturn,
      expectedMonthlyROI,
      confidence,
    };
  } catch (error: any) {
    console.error(`[MetricsCalculator] Error calculating realistic ROI:`, error.message);
    return null;
  }
}

/**
 * Get funding rate trend (increasing, stable, decreasing)
 */
export async function getFundingRateTrend(
  exchange: Exchange,
  symbol: string,
  daysBack: number = 7
): Promise<'increasing' | 'stable' | 'decreasing' | null> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const rates = await prisma.publicFundingRate.findMany({
      where: {
        exchange,
        symbol,
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      select: {
        fundingRate: true,
        timestamp: true,
      },
    });

    if (rates.length < 10) {
      return null; // Not enough data
    }

    // Simple linear regression to determine trend
    const n = rates.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    rates.forEach((rate, index) => {
      const x = index;
      const y = rate.fundingRate;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine trend based on slope
    if (Math.abs(slope) < 0.00001) {
      return 'stable';
    } else if (slope > 0) {
      return 'increasing';
    } else {
      return 'decreasing';
    }
  } catch (error: any) {
    console.error(`[MetricsCalculator] Error getting funding rate trend:`, error.message);
    return null;
  }
}

/**
 * Calculate confidence score for an arbitrage opportunity
 * Higher score = more reliable historical data
 */
export function calculateOpportunityConfidence(
  fundingMetrics: FundingRateMetrics | null,
  spreadStability?: number
): number {
  if (!fundingMetrics) {
    return 0;
  }

  // Data quantity score (0-40 points)
  // Full week of hourly data = 168 points
  const dataQuantityScore = Math.min((fundingMetrics.dataPoints / 168) * 40, 40);

  // Consistency score (0-40 points)
  // Lower stddev relative to average = higher score
  const coefficientOfVariation = Math.abs(fundingMetrics.stddev / fundingMetrics.average);
  const consistencyScore = Math.max(40 - coefficientOfVariation * 100, 0);

  // Spread stability score (0-20 points)
  const stabilityScore = spreadStability ? spreadStability * 20 : 0;

  const totalScore = dataQuantityScore + consistencyScore + stabilityScore;

  return Math.round(Math.min(totalScore, 100));
}
