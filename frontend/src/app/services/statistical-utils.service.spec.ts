import { TestBed } from '@angular/core/testing';
import { StatisticalUtilsService } from './statistical-utils.service';

describe('StatisticalUtilsService', () => {
  let service: StatisticalUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatisticalUtilsService]
    });
    service = TestBed.inject(StatisticalUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateAverage', () => {
    it('should calculate correct average for positive numbers', () => {
      expect(service.calculateAverage([1, 2, 3, 4, 5])).toBe(3);
    });

    it('should calculate correct average for decimal values', () => {
      const result = service.calculateAverage([0.1, 0.2, 0.3]);
      expect(result).toBeCloseTo(0.2, 5);
    });

    it('should handle empty array', () => {
      expect(service.calculateAverage([])).toBeNull();
    });

    it('should handle single value', () => {
      expect(service.calculateAverage([5])).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(service.calculateAverage([-1, -2, -3])).toBe(-2);
    });

    it('should handle mixed positive and negative numbers', () => {
      expect(service.calculateAverage([-2, 0, 2])).toBe(0);
    });

    it('should handle very small decimal values', () => {
      const result = service.calculateAverage([0.0001, 0.0002, 0.0003]);
      expect(result).toBeCloseTo(0.0002, 6);
    });
  });

  describe('calculateStandardDeviation', () => {
    it('should calculate correct standard deviation', () => {
      // Example: [2, 4, 4, 4, 5, 5, 7, 9]
      // Mean = 5, Variance = 4, StdDev = 2
      const result = service.calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(result).toBeCloseTo(2.0, 1);
    });

    it('should return 0 for identical values', () => {
      expect(service.calculateStandardDeviation([5, 5, 5, 5])).toBe(0);
    });

    it('should handle empty array', () => {
      expect(service.calculateStandardDeviation([])).toBeNull();
    });

    it('should handle single value', () => {
      expect(service.calculateStandardDeviation([10])).toBe(0);
    });

    it('should handle two values', () => {
      const result = service.calculateStandardDeviation([1, 3]);
      expect(result).toBeCloseTo(1.0, 5);
    });

    it('should handle decimal values', () => {
      const result = service.calculateStandardDeviation([0.1, 0.2, 0.3, 0.4]);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(0.2);
    });

    it('should handle negative numbers', () => {
      const result = service.calculateStandardDeviation([-2, -1, 0, 1, 2]);
      expect(result).toBeCloseTo(1.4142, 2);
    });
  });

  describe('calculateStabilityScore', () => {
    it('should return 100 for zero standard deviation', () => {
      expect(service.calculateStabilityScore(0.5, 0)).toBe(100);
    });

    it('should return lower score for high coefficient of variation', () => {
      // CV = 0.3 / 0.5 = 0.6
      // Score = 100 * (1 - 0.6) = 40
      const score = service.calculateStabilityScore(0.5, 0.3);
      expect(score).toBeCloseTo(40, 0);
    });

    it('should return higher score for low coefficient of variation', () => {
      // CV = 0.05 / 0.5 = 0.1
      // Score = 100 * (1 - 0.1) = 90
      const score = service.calculateStabilityScore(0.5, 0.05);
      expect(score).toBeCloseTo(90, 0);
    });

    it('should handle edge case: stdDev > average', () => {
      // CV = 0.5 / 0.1 = 5 (capped at 1)
      // Score = 100 * (1 - 1) = 0
      const score = service.calculateStabilityScore(0.1, 0.5);
      expect(score).toBe(0);
    });

    it('should handle edge case: stdDev equals average', () => {
      // CV = 0.5 / 0.5 = 1
      // Score = 100 * (1 - 1) = 0
      const score = service.calculateStabilityScore(0.5, 0.5);
      expect(score).toBe(0);
    });

    it('should return value between 0 and 100', () => {
      const score = service.calculateStabilityScore(0.3, 0.15);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle very small average (avoid division by zero)', () => {
      const score = service.calculateStabilityScore(0.0001, 0.00005);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle zero average gracefully', () => {
      // When average is 0, return 0 score (can't calculate CV)
      const score = service.calculateStabilityScore(0, 0.1);
      expect(score).toBe(0);
    });
  });

  describe('getStabilityRating', () => {
    it('should return excellent for score >= 80', () => {
      expect(service.getStabilityRating(100)).toBe('excellent');
      expect(service.getStabilityRating(90)).toBe('excellent');
      expect(service.getStabilityRating(80)).toBe('excellent');
    });

    it('should return good for score 60-79', () => {
      expect(service.getStabilityRating(79)).toBe('good');
      expect(service.getStabilityRating(70)).toBe('good');
      expect(service.getStabilityRating(60)).toBe('good');
    });

    it('should return moderate for score 40-59', () => {
      expect(service.getStabilityRating(59)).toBe('moderate');
      expect(service.getStabilityRating(50)).toBe('moderate');
      expect(service.getStabilityRating(40)).toBe('moderate');
    });

    it('should return poor for score < 40', () => {
      expect(service.getStabilityRating(39)).toBe('poor');
      expect(service.getStabilityRating(20)).toBe('poor');
      expect(service.getStabilityRating(0)).toBe('poor');
    });

    it('should handle decimal scores', () => {
      expect(service.getStabilityRating(79.5)).toBe('good');
      expect(service.getStabilityRating(80.1)).toBe('excellent');
    });

    it('should handle edge case: negative score', () => {
      expect(service.getStabilityRating(-10)).toBe('poor');
    });

    it('should handle edge case: score > 100', () => {
      expect(service.getStabilityRating(150)).toBe('excellent');
    });
  });

  describe('getDataQuality', () => {
    it('should return high quality for sufficient samples', () => {
      expect(service.getDataQuality(200, 100)).toBe('high');
      expect(service.getDataQuality(100, 100)).toBe('high');
    });

    it('should return medium quality for partial samples', () => {
      expect(service.getDataQuality(80, 100)).toBe('medium');
      expect(service.getDataQuality(60, 100)).toBe('medium');
      expect(service.getDataQuality(50, 100)).toBe('medium');
    });

    it('should return low quality for insufficient samples', () => {
      expect(service.getDataQuality(49, 100)).toBe('low');
      expect(service.getDataQuality(30, 100)).toBe('low');
      expect(service.getDataQuality(0, 100)).toBe('low');
    });

    it('should handle zero expected minimum', () => {
      expect(service.getDataQuality(10, 0)).toBe('high');
    });

    it('should handle very large sample sizes', () => {
      expect(service.getDataQuality(10000, 1000)).toBe('high');
    });
  });

  describe('calculateStabilityTrend', () => {
    it('should detect improving trend (7d better than 30d)', () => {
      // 7-day score improved by >10 points
      expect(service.calculateStabilityTrend(80, 60)).toBe('improving');
      expect(service.calculateStabilityTrend(90, 70)).toBe('improving');
    });

    it('should detect declining trend (7d worse than 30d)', () => {
      // 7-day score declined by >10 points
      expect(service.calculateStabilityTrend(50, 70)).toBe('declining');
      expect(service.calculateStabilityTrend(40, 60)).toBe('declining');
    });

    it('should detect stable trend (difference <= 10 points)', () => {
      expect(service.calculateStabilityTrend(70, 70)).toBe('stable');
      expect(service.calculateStabilityTrend(70, 75)).toBe('stable');
      expect(service.calculateStabilityTrend(75, 70)).toBe('stable');
      expect(service.calculateStabilityTrend(70, 80)).toBe('stable');
      expect(service.calculateStabilityTrend(80, 70)).toBe('stable');
    });

    it('should handle boundary case: exactly 10 points difference', () => {
      expect(service.calculateStabilityTrend(70, 80)).toBe('stable');
      expect(service.calculateStabilityTrend(80, 70)).toBe('stable');
    });

    it('should handle extreme scores', () => {
      expect(service.calculateStabilityTrend(100, 50)).toBe('improving');
      expect(service.calculateStabilityTrend(0, 50)).toBe('declining');
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should return 1.0 for high quality on both periods', () => {
      expect(service.calculateConfidenceScore('high', 'high')).toBe(1.0);
    });

    it('should return 0.7 for medium quality on both periods', () => {
      expect(service.calculateConfidenceScore('medium', 'medium')).toBe(0.7);
    });

    it('should return 0.3 for low quality on both periods', () => {
      expect(service.calculateConfidenceScore('low', 'low')).toBe(0.3);
    });

    it('should return average for mixed quality (high + medium)', () => {
      const result = service.calculateConfidenceScore('high', 'medium');
      expect(result).toBeCloseTo(0.85, 2);
    });

    it('should return average for mixed quality (high + low)', () => {
      const result = service.calculateConfidenceScore('high', 'low');
      expect(result).toBeCloseTo(0.65, 2);
    });

    it('should return average for mixed quality (medium + low)', () => {
      const result = service.calculateConfidenceScore('medium', 'low');
      expect(result).toBeCloseTo(0.5, 2);
    });

    it('should handle order independence', () => {
      expect(service.calculateConfidenceScore('high', 'medium'))
        .toBe(service.calculateConfidenceScore('medium', 'high'));
      expect(service.calculateConfidenceScore('low', 'high'))
        .toBe(service.calculateConfidenceScore('high', 'low'));
    });
  });

  describe('formatPercentage', () => {
    it('should format with default 2 decimal places', () => {
      expect(service.formatPercentage(0.1234)).toBe('12.34%');
      expect(service.formatPercentage(0.5)).toBe('50.00%');
    });

    it('should format with custom decimal places', () => {
      expect(service.formatPercentage(0.123456, 4)).toBe('12.3456%');
      expect(service.formatPercentage(0.5, 0)).toBe('50%');
    });

    it('should handle very small percentages', () => {
      expect(service.formatPercentage(0.0001, 4)).toBe('0.0100%');
    });

    it('should handle very large percentages', () => {
      expect(service.formatPercentage(1.5, 2)).toBe('150.00%');
    });

    it('should handle zero', () => {
      expect(service.formatPercentage(0)).toBe('0.00%');
    });

    it('should handle negative percentages', () => {
      expect(service.formatPercentage(-0.15)).toBe('-15.00%');
    });

    it('should round correctly', () => {
      expect(service.formatPercentage(0.12345, 2)).toBe('12.35%');
      expect(service.formatPercentage(0.12344, 2)).toBe('12.34%');
    });
  });

  describe('Real-world scenarios', () => {
    describe('Stable spread scenario', () => {
      it('should analyze very stable spread data correctly', () => {
        // Spread fluctuates minimally around 0.15%
        const spreads = [0.15, 0.151, 0.149, 0.15, 0.150, 0.148, 0.152];

        const avg = service.calculateAverage(spreads);
        const stdDev = service.calculateStandardDeviation(spreads);
        const score = service.calculateStabilityScore(avg!, stdDev!);
        const rating = service.getStabilityRating(score);

        expect(avg).toBeCloseTo(0.15, 3);
        expect(stdDev).toBeLessThan(0.002);
        expect(rating).toBe('excellent');
      });
    });

    describe('Volatile spread scenario', () => {
      it('should analyze highly volatile spread data correctly', () => {
        // Spread varies dramatically
        const spreads = [0.1, 0.5, 0.05, 0.8, 0.15, 0.6, 0.2];

        const avg = service.calculateAverage(spreads);
        const stdDev = service.calculateStandardDeviation(spreads);
        const score = service.calculateStabilityScore(avg!, stdDev!);
        const rating = service.getStabilityRating(score);

        expect(avg).toBeGreaterThan(0.2);
        expect(stdDev).toBeGreaterThan(0.2);
        expect(rating).toMatch(/poor|moderate/);
      });
    });

    describe('7-day hourly data scenario', () => {
      it('should handle realistic 7-day hourly spread data', () => {
        // Simulate 7 days * 24 hours = 168 data points
        // With daily sinusoidal pattern (higher spreads at certain times)
        const spreads = Array.from({ length: 168 }, (_, i) =>
          0.15 + (Math.sin(i / 24 * Math.PI) * 0.02)
        );

        const avg = service.calculateAverage(spreads);
        const stdDev = service.calculateStandardDeviation(spreads);
        const score = service.calculateStabilityScore(avg!, stdDev!);
        const quality = service.getDataQuality(spreads.length, 100);

        expect(avg).toBeCloseTo(0.15, 2);
        expect(stdDev).toBeGreaterThan(0);
        expect(score).toBeGreaterThan(50);
        expect(quality).toBe('high');
      });
    });

    describe('30-day hourly data scenario', () => {
      it('should handle realistic 30-day hourly spread data', () => {
        // Simulate 30 days * 24 hours = 720 data points
        const spreads = Array.from({ length: 720 }, (_, i) =>
          0.15 + (Math.random() * 0.04 - 0.02) // Random ±0.02% variation
        );

        const avg = service.calculateAverage(spreads);
        const stdDev = service.calculateStandardDeviation(spreads);
        const score = service.calculateStabilityScore(avg!, stdDev!);
        const quality = service.getDataQuality(spreads.length, 400);

        expect(avg).toBeCloseTo(0.15, 1);
        expect(stdDev).toBeGreaterThan(0);
        expect(score).toBeGreaterThan(0);
        expect(quality).toBe('high');
      });
    });

    describe('Insufficient data scenario', () => {
      it('should handle insufficient sample size correctly', () => {
        // Only 30 data points instead of expected 168 (7 days hourly)
        const spreads = Array.from({ length: 30 }, () => 0.15);

        const quality = service.getDataQuality(spreads.length, 168);

        expect(quality).toBe('low');
      });
    });

    describe('Trend detection scenario', () => {
      it('should detect improving stability trend', () => {
        // 7-day: very stable (score ~95)
        const spreads7d = Array.from({ length: 50 }, () => 0.15 + (Math.random() * 0.002));
        const avg7d = service.calculateAverage(spreads7d)!;
        const stdDev7d = service.calculateStandardDeviation(spreads7d)!;
        const score7d = service.calculateStabilityScore(avg7d, stdDev7d);

        // 30-day: more volatile (score ~60)
        const spreads30d = Array.from({ length: 200 }, () => 0.15 + (Math.random() * 0.08));
        const avg30d = service.calculateAverage(spreads30d)!;
        const stdDev30d = service.calculateStandardDeviation(spreads30d)!;
        const score30d = service.calculateStabilityScore(avg30d, stdDev30d);

        const trend = service.calculateStabilityTrend(score7d, score30d);

        expect(score7d).toBeGreaterThan(score30d);
        expect(trend).toBe('improving');
      });
    });

    describe('Complete metrics calculation', () => {
      it('should calculate all metrics for a complete Phase 2 analysis', () => {
        const spreads = [0.12, 0.15, 0.14, 0.16, 0.13, 0.15, 0.14];

        const avg = service.calculateAverage(spreads);
        const stdDev = service.calculateStandardDeviation(spreads);
        const score = service.calculateStabilityScore(avg!, stdDev!);
        const rating = service.getStabilityRating(score);
        const quality = service.getDataQuality(spreads.length, 100);
        const avgFormatted = service.formatPercentage(avg!, 2);
        const stdDevFormatted = service.formatPercentage(stdDev!, 2);

        expect(avg).toBeDefined();
        expect(stdDev).toBeDefined();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(rating).toMatch(/excellent|good|moderate|poor/);
        expect(quality).toBe('low'); // Only 7 samples vs 100 expected
        expect(avgFormatted).toContain('%');
        expect(stdDevFormatted).toContain('%');
      });
    });
  });
});
