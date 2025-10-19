/**
 * Unit Tests for Liquidation Calculator Service
 *
 * These tests verify the accuracy of liquidation price calculations and proximity detection
 * for various scenarios including different exchanges, leverage levels, and position sides.
 */

import { describe, test, expect } from '@jest/globals';
import { liquidationCalculatorService, LiquidationCalculationParams } from '../liquidation-calculator.service';

describe('LiquidationCalculatorService', () => {
  describe('calculateLiquidationPrice', () => {
    describe('Long positions', () => {
      test('should calculate liquidation price for long position with 3x leverage on Bybit', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 50000 × (1 - 1/3 + 0.005) = 50000 × 0.6717 = 33,583.33
        expect(result.liquidationPrice).toBeCloseTo(33583.33, 2);
        expect(result.mmr).toBe(0.005); // 0.5% default for Bybit
        expect(result.formula).toContain('1 - 1/3 + 0.005');
        expect(result.warnings.length).toBeGreaterThan(0); // Should warn about using default MMR
      });

      test('should calculate liquidation price for long position with 10x leverage on BingX', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 100,
          leverage: 10,
          side: 'long',
          exchange: 'BINGX',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 100 × (1 - 1/10 + 0.004) = 100 × 0.904 = 90.4
        expect(result.liquidationPrice).toBeCloseTo(90.4, 2);
        expect(result.mmr).toBe(0.004); // 0.4% default for BingX
      });

      test('should calculate liquidation price for long position with 2x leverage (low risk)', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 1000,
          leverage: 2,
          side: 'long',
          exchange: 'BYBIT',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 1000 × (1 - 1/2 + 0.005) = 1000 × 0.505 = 505
        expect(result.liquidationPrice).toBeCloseTo(505, 2);
        // With 2x leverage, liquidation at ~49.5% drop - relatively safe
        expect(result.warnings.length).toBeGreaterThan(0);
      });

      test('should warn for long position with 50x leverage (high risk)', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 50,
          side: 'long',
          exchange: 'BYBIT',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 50000 × (1 - 1/50 + 0.005) = 50000 × 0.985 = 49,250
        expect(result.liquidationPrice).toBeCloseTo(49250, 2);

        // Should warn about close liquidation price (only 1.5% drop)
        const hasCloseWarning = result.warnings.some((w) =>
          w.includes('liquidation occurs at only')
        );
        expect(hasCloseWarning).toBe(true);
      });

      test('should use custom MMR if provided', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
          maintenanceMarginRate: 0.01, // 1% custom MMR
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 50000 × (1 - 1/3 + 0.01) = 50000 × 0.6767 = 33,833.33
        expect(result.liquidationPrice).toBeCloseTo(33833.33, 2);
        expect(result.mmr).toBe(0.01);

        // Should NOT warn about using default MMR
        const hasDefaultWarning = result.warnings.some((w) =>
          w.includes('Using default MMR')
        );
        expect(hasDefaultWarning).toBe(false);
      });
    });

    describe('Short positions', () => {
      test('should calculate liquidation price for short position with 3x leverage on Bybit', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 3,
          side: 'short',
          exchange: 'BYBIT',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 50000 × (1 + 1/3 - 0.005) = 50000 × 1.3283 = 66,416.67
        expect(result.liquidationPrice).toBeCloseTo(66416.67, 2);
        expect(result.mmr).toBe(0.005);
      });

      test('should calculate liquidation price for short position with 10x leverage on BingX', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 100,
          leverage: 10,
          side: 'short',
          exchange: 'BINGX',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 100 × (1 + 1/10 - 0.004) = 100 × 1.096 = 109.6
        expect(result.liquidationPrice).toBeCloseTo(109.6, 2);
        expect(result.mmr).toBe(0.004);
      });

      test('should calculate liquidation price for short position with 2x leverage (low risk)', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 1000,
          leverage: 2,
          side: 'short',
          exchange: 'BYBIT',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 1000 × (1 + 1/2 - 0.005) = 1000 × 1.495 = 1,495
        expect(result.liquidationPrice).toBeCloseTo(1495, 2);
      });

      test('should warn for short position with 50x leverage (high risk)', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 50,
          side: 'short',
          exchange: 'BYBIT',
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Formula: 50000 × (1 + 1/50 - 0.005) = 50000 × 1.015 = 50,750
        expect(result.liquidationPrice).toBeCloseTo(50750, 2);

        // Should warn about close liquidation price (only 1.5% rise)
        const hasCloseWarning = result.warnings.some((w) =>
          w.includes('liquidation occurs at only')
        );
        expect(hasCloseWarning).toBe(true);
      });
    });

    describe('Advanced calculation with margins', () => {
      test('should calculate liquidation price with position size and margins for long', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
          positionSize: 0.1, // 0.1 BTC
          initialMargin: 1666.67, // 50000 * 0.1 / 3 = 1666.67 USDT
          extraMargin: 0,
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Position Value = 0.1 * 50000 = 5000 USDT
        // Maintenance Margin = 5000 * 0.005 = 25 USDT
        // Margin Buffer = 1666.67 + 0 - 25 = 1641.67 USDT
        // LP = 50000 - (1641.67 / 0.1) = 50000 - 16416.7 = 33,583.3
        expect(result.liquidationPrice).toBeCloseTo(33583.3, 1);
        expect(result.warnings.some((w) => w.includes('advanced formula'))).toBe(true);
      });

      test('should calculate liquidation price with extra margin added', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
          positionSize: 0.1,
          initialMargin: 1666.67,
          extraMargin: 500, // Added 500 USDT extra margin
        };

        const result = liquidationCalculatorService.calculateLiquidationPrice(params);

        // Margin Buffer = 1666.67 + 500 - 25 = 2141.67 USDT
        // LP = 50000 - (2141.67 / 0.1) = 50000 - 21416.7 = 28,583.3
        expect(result.liquidationPrice).toBeCloseTo(28583.3, 1);
        // Extra margin pushes liquidation price lower (safer)
        expect(result.liquidationPrice).toBeLessThan(33583.3);
      });
    });

    describe('Edge cases and validation', () => {
      test('should throw error for invalid entry price', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 0,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
        };

        expect(() => liquidationCalculatorService.calculateLiquidationPrice(params)).toThrow(
          'Invalid entry price'
        );
      });

      test('should throw error for invalid leverage (< 1)', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 0.5,
          side: 'long',
          exchange: 'BYBIT',
        };

        expect(() => liquidationCalculatorService.calculateLiquidationPrice(params)).toThrow(
          'Invalid leverage'
        );
      });

      test('should throw error for invalid leverage (> 125)', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 200,
          side: 'long',
          exchange: 'BYBIT',
        };

        expect(() => liquidationCalculatorService.calculateLiquidationPrice(params)).toThrow(
          'Invalid leverage'
        );
      });

      test('should throw error for invalid side', () => {
        const params: any = {
          entryPrice: 50000,
          leverage: 3,
          side: 'invalid',
          exchange: 'BYBIT',
        };

        expect(() => liquidationCalculatorService.calculateLiquidationPrice(params)).toThrow(
          'Invalid side'
        );
      });

      test('should throw error for unsupported exchange', () => {
        const params: any = {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BINANCE',
        };

        expect(() => liquidationCalculatorService.calculateLiquidationPrice(params)).toThrow(
          'Unsupported exchange'
        );
      });

      test('should throw error for invalid MMR', () => {
        const params: LiquidationCalculationParams = {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
          maintenanceMarginRate: 0.15, // 15% is too high
        };

        expect(() => liquidationCalculatorService.calculateLiquidationPrice(params)).toThrow(
          'Invalid maintenance margin rate'
        );
      });
    });
  });

  describe('calculateLiquidationProximity', () => {
    describe('Long positions', () => {
      test('should detect safe long position (far from liquidation)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          33583.33, // liquidation price
          48000, // current price (close to entry)
          50000, // entry price
          'long'
        );

        expect(result.proximityRatio).toBeCloseTo(0.122, 2); // ~12% traveled to liquidation
        expect(result.isInDanger).toBe(false);
        expect(result.distanceToLiquidation).toBeCloseTo(14416.67, 2);
        expect(result.percentToLiquidation).toBeCloseTo(30.03, 2);
      });

      test('should detect long position at 70% proximity (warning zone)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          33583.33, // liquidation price
          38000, // current price (70% to liquidation)
          50000, // entry price
          'long'
        );

        // Distance from entry to liquidation: 50000 - 33583.33 = 16416.67
        // Distance traveled: 50000 - 38000 = 12000
        // Proximity: 12000 / 16416.67 = 0.73
        expect(result.proximityRatio).toBeCloseTo(0.73, 2);
        expect(result.isInDanger).toBe(false); // Not danger yet (< 0.9)
      });

      test('should detect long position at 90% proximity (DANGER!)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          33583.33, // liquidation price
          35000, // current price (very close to liquidation!)
          50000, // entry price
          'long'
        );

        // Distance from entry to liquidation: 16416.67
        // Distance traveled: 50000 - 35000 = 15000
        // Proximity: 15000 / 16416.67 = 0.914
        expect(result.proximityRatio).toBeCloseTo(0.914, 2);
        expect(result.isInDanger).toBe(true); // DANGER! > 0.9
        expect(result.percentToLiquidation).toBeCloseTo(4.05, 2); // Only 4% drop remaining
      });

      test('should detect liquidated long position (price below liquidation)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          33583.33, // liquidation price
          30000, // current price (below liquidation!)
          50000, // entry price
          'long'
        );

        expect(result.proximityRatio).toBeGreaterThan(1.0); // Beyond liquidation
        expect(result.isInDanger).toBe(true);
        expect(result.distanceToLiquidation).toBeLessThan(0); // Negative distance = liquidated
      });
    });

    describe('Short positions', () => {
      test('should detect safe short position (far from liquidation)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          66416.67, // liquidation price
          52000, // current price (close to entry)
          50000, // entry price
          'short'
        );

        expect(result.proximityRatio).toBeCloseTo(0.122, 2); // ~12% traveled to liquidation
        expect(result.isInDanger).toBe(false);
        expect(result.distanceToLiquidation).toBeCloseTo(14416.67, 2);
      });

      test('should detect short position at 90% proximity (DANGER!)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          66416.67, // liquidation price
          65000, // current price (very close to liquidation!)
          50000, // entry price
          'short'
        );

        // Distance from entry to liquidation: 66416.67 - 50000 = 16416.67
        // Distance traveled: 65000 - 50000 = 15000
        // Proximity: 15000 / 16416.67 = 0.914
        expect(result.proximityRatio).toBeCloseTo(0.914, 2);
        expect(result.isInDanger).toBe(true);
        expect(result.percentToLiquidation).toBeCloseTo(2.18, 2); // Only ~2% rise remaining
      });

      test('should detect liquidated short position (price above liquidation)', () => {
        const result = liquidationCalculatorService.calculateLiquidationProximity(
          66416.67, // liquidation price
          70000, // current price (above liquidation!)
          50000, // entry price
          'short'
        );

        expect(result.proximityRatio).toBeGreaterThan(1.0); // Beyond liquidation
        expect(result.isInDanger).toBe(true);
        expect(result.distanceToLiquidation).toBeLessThan(0); // Negative distance = liquidated
      });
    });
  });

  describe('calculateLiquidationPriceAndProximity', () => {
    test('should calculate both liquidation price and proximity in one call', () => {
      const params: LiquidationCalculationParams = {
        entryPrice: 50000,
        leverage: 3,
        side: 'long',
        exchange: 'BYBIT',
      };

      const result = liquidationCalculatorService.calculateLiquidationPriceAndProximity(
        params,
        48000 // current price
      );

      expect(result.calculation.liquidationPrice).toBeCloseTo(33583.33, 2);
      expect(result.proximity.currentPrice).toBe(48000);
      expect(result.proximity.proximityRatio).toBeCloseTo(0.122, 2);
      expect(result.proximity.isInDanger).toBe(false);
    });
  });

  describe('formatProximityMessage', () => {
    test('should format safe position message', () => {
      const proximity = liquidationCalculatorService.calculateLiquidationProximity(
        33583.33,
        48000,
        50000,
        'long'
      );

      const message = liquidationCalculatorService.formatProximityMessage(proximity);

      expect(message).toContain('Safe');
      expect(message).toContain('%');
    });

    test('should format warning message for 70-90% proximity', () => {
      const proximity = liquidationCalculatorService.calculateLiquidationProximity(
        33583.33,
        38000,
        50000,
        'long'
      );

      const message = liquidationCalculatorService.formatProximityMessage(proximity);

      expect(message).toContain('WARNING');
      expect(message).toContain('73');
    });

    test('should format danger message for 90%+ proximity', () => {
      const proximity = liquidationCalculatorService.calculateLiquidationProximity(
        33583.33,
        35000,
        50000,
        'long'
      );

      const message = liquidationCalculatorService.formatProximityMessage(proximity);

      expect(message).toContain('DANGER');
      expect(message).toContain('91');
    });

    test('should format liquidated message', () => {
      const proximity = liquidationCalculatorService.calculateLiquidationProximity(
        33583.33,
        30000,
        50000,
        'long'
      );

      const message = liquidationCalculatorService.formatProximityMessage(proximity);

      expect(message).toContain('LIQUIDATED');
    });
  });

  describe('getDefaultMMR', () => {
    test('should return correct default MMR for Bybit', () => {
      const mmr = liquidationCalculatorService.getDefaultMMR('BYBIT');
      expect(mmr).toBe(0.005); // 0.5%
    });

    test('should return correct default MMR for BingX', () => {
      const mmr = liquidationCalculatorService.getDefaultMMR('BINGX');
      expect(mmr).toBe(0.004); // 0.4%
    });
  });

  describe('Real-world scenarios', () => {
    test('BTC arbitrage with 3x leverage on both exchanges', () => {
      // Scenario: User opens BTC arbitrage
      // - Bybit LONG: 50,000 entry, 3x leverage
      // - BingX SHORT: 50,000 entry, 3x leverage
      // Current price: 48,000

      const bybitLong = liquidationCalculatorService.calculateLiquidationPriceAndProximity(
        {
          entryPrice: 50000,
          leverage: 3,
          side: 'long',
          exchange: 'BYBIT',
        },
        48000
      );

      const bingxShort = liquidationCalculatorService.calculateLiquidationPriceAndProximity(
        {
          entryPrice: 50000,
          leverage: 3,
          side: 'short',
          exchange: 'BINGX',
        },
        48000
      );

      // Bybit long liquidation at ~33,583
      expect(bybitLong.calculation.liquidationPrice).toBeCloseTo(33583.33, 0);
      expect(bybitLong.proximity.isInDanger).toBe(false);

      // BingX short liquidation at ~66,467
      expect(bingxShort.calculation.liquidationPrice).toBeCloseTo(66466.67, 0);
      expect(bingxShort.proximity.isInDanger).toBe(false);

      // Short position is actually SAFER (further from liquidation)
      expect(bingxShort.proximity.distanceToLiquidation).toBeGreaterThan(
        bybitLong.proximity.distanceToLiquidation
      );
    });

    test('High leverage position near liquidation', () => {
      // Scenario: Risky 20x leverage long, price dropped significantly
      const result = liquidationCalculatorService.calculateLiquidationPriceAndProximity(
        {
          entryPrice: 50000,
          leverage: 20,
          side: 'long',
          exchange: 'BYBIT',
        },
        48000 // Price dropped 4%
      );

      // With 20x leverage, liquidation at ~47,750 (4.5% drop)
      expect(result.calculation.liquidationPrice).toBeCloseTo(47750, 0);

      // Position is VERY close to liquidation!
      expect(result.proximity.proximityRatio).toBeGreaterThan(0.5);
      expect(result.proximity.percentToLiquidation).toBeLessThan(1); // Less than 1% remaining!
    });
  });
});
