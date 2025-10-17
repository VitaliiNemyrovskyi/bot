import { Injectable } from '@angular/core';

/**
 * Statistical Utility Service
 *
 * Provides pure statistical calculation functions for spread stability analysis.
 * All methods are pure functions with no side effects for maximum testability.
 *
 * Used in Phase 2 of the Funding Rate Arbitrage system to analyze historical
 * spread stability and provide actionable insights for traders.
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticalUtilsService {

  constructor() { }

  /**
   * Calculate the arithmetic mean (average) of an array of numbers
   *
   * @param values - Array of numeric values
   * @returns The average value, or null if array is empty
   *
   * @example
   * calculateAverage([1, 2, 3, 4, 5]) // returns 3
   * calculateAverage([]) // returns null
   */
  calculateAverage(values: number[]): number | null {
    if (!values || values.length === 0) {
      return null;
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calculate the population standard deviation
   *
   * Standard deviation measures the amount of variation in a set of values.
   * Lower values indicate data points are close to the mean.
   *
   * Formula: sqrt(Σ(x - μ)² / N)
   * where μ is the mean and N is the population size
   *
   * @param values - Array of numeric values
   * @returns The standard deviation, or null if array is empty
   *
   * @example
   * calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]) // returns ~2.0
   * calculateStandardDeviation([5, 5, 5]) // returns 0 (no variation)
   */
  calculateStandardDeviation(values: number[]): number | null {
    if (!values || values.length === 0) {
      return null;
    }

    if (values.length === 1) {
      return 0;
    }

    const mean = this.calculateAverage(values);
    if (mean === null) {
      return null;
    }

    // Calculate sum of squared differences from mean
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate stability score (0-100) based on coefficient of variation
   *
   * Stability score is inversely related to the coefficient of variation (CV).
   * A higher score indicates more stable spreads (lower relative volatility).
   *
   * Formula: 100 × (1 - min(CV, 1))
   * where CV = standardDeviation / average
   *
   * Score ranges:
   * - 80-100: Excellent stability (CV < 0.2)
   * - 60-79: Good stability (CV 0.2-0.4)
   * - 40-59: Moderate stability (CV 0.4-0.6)
   * - 0-39: Poor stability (CV > 0.6)
   *
   * @param average - Mean value of the dataset
   * @param stdDev - Standard deviation of the dataset
   * @returns Stability score from 0 to 100
   *
   * @example
   * calculateStabilityScore(0.5, 0) // returns 100 (perfect stability)
   * calculateStabilityScore(0.5, 0.05) // returns 90 (excellent)
   * calculateStabilityScore(0.5, 0.3) // returns 40 (moderate)
   */
  calculateStabilityScore(average: number, stdDev: number): number {
    // Handle edge cases
    if (average === 0) {
      return 0; // Can't calculate CV with zero average
    }

    if (stdDev === 0) {
      return 100; // Perfect stability (no variation)
    }

    // Calculate coefficient of variation
    const coefficientOfVariation = Math.abs(stdDev / average);

    // Cap CV at 1.0 to prevent negative scores
    const cappedCV = Math.min(coefficientOfVariation, 1);

    // Convert to stability score (inverse relationship)
    const score = 100 * (1 - cappedCV);

    // Ensure score is within bounds [0, 100]
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get qualitative stability rating based on numeric score
   *
   * @param score - Stability score (0-100)
   * @returns Rating: 'excellent', 'good', 'moderate', or 'poor'
   *
   * Thresholds:
   * - Excellent: ≥80
   * - Good: 60-79
   * - Moderate: 40-59
   * - Poor: <40
   *
   * @example
   * getStabilityRating(90) // returns 'excellent'
   * getStabilityRating(70) // returns 'good'
   * getStabilityRating(50) // returns 'moderate'
   * getStabilityRating(30) // returns 'poor'
   */
  getStabilityRating(score: number): 'excellent' | 'good' | 'moderate' | 'poor' {
    if (score >= 80) {
      return 'excellent';
    } else if (score >= 60) {
      return 'good';
    } else if (score >= 40) {
      return 'moderate';
    } else {
      return 'poor';
    }
  }

  /**
   * Assess data quality based on sample size
   *
   * Determines if there are enough data points to make reliable statistical
   * inferences.
   *
   * @param sampleSize - Actual number of data points collected
   * @param expectedMinimum - Expected minimum number of data points
   * @returns Quality rating: 'high', 'medium', or 'low'
   *
   * Thresholds:
   * - High: ≥100% of expected (sampleSize ≥ expectedMinimum)
   * - Medium: 50-99% of expected
   * - Low: <50% of expected
   *
   * @example
   * getDataQuality(200, 168) // returns 'high' (more than enough)
   * getDataQuality(100, 168) // returns 'medium' (60% coverage)
   * getDataQuality(50, 168) // returns 'low' (30% coverage)
   */
  getDataQuality(sampleSize: number, expectedMinimum: number): 'high' | 'medium' | 'low' {
    if (expectedMinimum === 0) {
      return 'high'; // Any data is sufficient if none expected
    }

    const coverageRatio = sampleSize / expectedMinimum;

    if (coverageRatio >= 1.0) {
      return 'high';
    } else if (coverageRatio >= 0.5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate stability trend by comparing 7-day and 30-day scores
   *
   * Detects whether spread stability is improving, stable, or declining
   * over time by comparing recent (7d) vs historical (30d) stability.
   *
   * @param score7d - Stability score for last 7 days
   * @param score30d - Stability score for last 30 days
   * @returns Trend: 'improving', 'stable', or 'declining'
   *
   * Logic:
   * - Improving: 7d score is >10 points higher than 30d (getting more stable)
   * - Declining: 7d score is >10 points lower than 30d (getting less stable)
   * - Stable: Difference is ≤10 points (no significant change)
   *
   * @example
   * calculateStabilityTrend(80, 60) // returns 'improving' (20-point gain)
   * calculateStabilityTrend(70, 75) // returns 'stable' (5-point difference)
   * calculateStabilityTrend(50, 70) // returns 'declining' (20-point loss)
   */
  calculateStabilityTrend(score7d: number, score30d: number): 'improving' | 'stable' | 'declining' {
    const difference = score7d - score30d;

    const TREND_THRESHOLD = 10; // Points difference to consider significant

    if (difference > TREND_THRESHOLD) {
      return 'improving';
    } else if (difference < -TREND_THRESHOLD) {
      return 'declining';
    } else {
      return 'stable';
    }
  }

  /**
   * Calculate confidence score based on data quality from both periods
   *
   * Confidence score represents how much we can trust the stability metrics
   * based on data completeness. Higher confidence = more reliable metrics.
   *
   * @param quality7d - Data quality for 7-day period
   * @param quality30d - Data quality for 30-day period
   * @returns Confidence score from 0 to 1
   *
   * Mapping:
   * - High quality: 1.0
   * - Medium quality: 0.7
   * - Low quality: 0.3
   *
   * Returns the average of both period quality scores.
   *
   * @example
   * calculateConfidenceScore('high', 'high') // returns 1.0
   * calculateConfidenceScore('high', 'medium') // returns 0.85
   * calculateConfidenceScore('low', 'low') // returns 0.3
   */
  calculateConfidenceScore(quality7d: string, quality30d: string): number {
    const qualityToScore = (quality: string): number => {
      switch (quality) {
        case 'high':
          return 1.0;
        case 'medium':
          return 0.7;
        case 'low':
          return 0.3;
        default:
          return 0.5;
      }
    };

    const score7d = qualityToScore(quality7d);
    const score30d = qualityToScore(quality30d);

    // Return average confidence
    return (score7d + score30d) / 2;
  }

  /**
   * Format a decimal value as a percentage string
   *
   * @param value - Decimal value (e.g., 0.1234 represents 12.34%)
   * @param decimals - Number of decimal places (default: 2)
   * @returns Formatted percentage string
   *
   * @example
   * formatPercentage(0.1234) // returns "12.34%"
   * formatPercentage(0.1234, 4) // returns "12.3400%"
   * formatPercentage(0.5, 0) // returns "50%"
   * formatPercentage(-0.15) // returns "-15.00%"
   */
  formatPercentage(value: number, decimals: number = 2): string {
    const percentage = value * 100;
    return `${percentage.toFixed(decimals)}%`;
  }
}
