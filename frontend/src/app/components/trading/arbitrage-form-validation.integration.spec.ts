import { TestBed } from '@angular/core/testing';
import { SymbolInfoService, SymbolInfo } from '../../services/symbol-info.service';
import { FormControl } from '@angular/forms';

/**
 * Integration tests for Order Parameters form validation focusing on
 * Graduated Entry and Quantity synchronization scenarios
 */
describe('Arbitrage Form Validation Integration Tests', () => {
  let symbolInfoService: SymbolInfoService;

  // Test data representing different exchange configurations
  const exchangeConfigs = {
    bybit: {
      symbol: 'BTCUSDT',
      exchange: 'BYBIT',
      minOrderQty: 0.001,
      qtyStep: 0.001,
      pricePrecision: 2,
      qtyPrecision: 3,
      maxOrderQty: 1000,
      maxLeverage: 125,
      minOrderValue: 10
    } as SymbolInfo,

    bingx: {
      symbol: 'BTC-USDT',
      exchange: 'BINGX',
      minOrderQty: 0.01,
      qtyStep: 0.01,
      pricePrecision: 2,
      qtyPrecision: 2,
      maxOrderQty: 500,
      maxLeverage: 100,
      minOrderValue: 20
    } as SymbolInfo,

    gateio: {
      symbol: 'BTC_USDT',
      exchange: 'GATEIO',
      minOrderQty: 1,
      qtyStep: 1,
      pricePrecision: 2,
      qtyPrecision: 0,
      maxOrderQty: 1000000,
      maxLeverage: 25
    } as SymbolInfo,

    mexc: {
      symbol: 'BTCUSDT',
      exchange: 'MEXC',
      minOrderQty: 0.0001,
      qtyStep: 0.0001,
      pricePrecision: 2,
      qtyPrecision: 4,
      maxOrderQty: 10000,
      maxLeverage: 200,
      minOrderValue: 5
    } as SymbolInfo
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SymbolInfoService]
    });

    symbolInfoService = TestBed.inject(SymbolInfoService);
  });

  describe('Graduated Entry Validation Scenarios', () => {
    describe('Typical Arbitrage Position Sizes', () => {
      it('should validate $1000 position split into 5 parts on Bybit', () => {
        // Scenario: $1000 position at $100k BTC = 0.01 BTC
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          0.01,
          5
        );

        expect(result.valid).toBe(true);
        // Each part: 0.01 / 5 = 0.002, which is >= 0.001 (minimum)
      });

      it('should reject micro-position with too many parts on Bybit', () => {
        // Scenario: Very small position split into too many parts
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          0.005,
          10
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (0.0005) is below minimum (0.001)');
        expect(result.suggestion).toContain('reduce graduated parts to 5');
      });

      it('should validate large institutional order on Bybit', () => {
        // Scenario: 10 BTC split into 50 parts
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          10,
          50
        );

        expect(result.valid).toBe(true);
        // Each part: 10 / 50 = 0.2, which is >= 0.001
      });
    });

    describe('Exchange-Specific Constraints', () => {
      it('should handle BingX medium minimum quantity requirements', () => {
        // Scenario: 1 BTC split into 5 parts on BingX
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bingx,
          1.0,
          5
        );

        expect(result.valid).toBe(true);
        // Each part: 1.0 / 5 = 0.2, which is >= 0.01
      });

      it('should reject insufficient quantity per part on BingX', () => {
        // Scenario: Small position with too many parts for BingX requirements
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bingx,
          0.1,
          15
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain('is below minimum (0.01)');
        expect(result.suggestion).toContain('reduce graduated parts');
      });

      it('should handle Gate.io large minimum quantity', () => {
        // Scenario: Gate.io requires large minimum orders
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.gateio,
          50,
          5
        );

        expect(result.valid).toBe(true);
        // Each part: 50 / 5 = 10, which is >= 1
      });

      it('should reject even single part below Gate.io minimum', () => {
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.gateio,
          0.5,
          1
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (0.5) is below minimum (1)');
        expect(result.suggestion).toBe('Increase total quantity to at least 1');
      });

      it('should allow high-precision trades on MEXC', () => {
        // Scenario: MEXC allows very small quantities with many parts
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.mexc,
          0.01,
          20
        );

        expect(result.valid).toBe(true);
        // Each part: 0.01 / 20 = 0.0005, which is >= 0.0001
      });
    });

    describe('Edge Cases and Boundary Conditions', () => {
      it('should handle quantity exactly at minimum boundary', () => {
        // Test: Total quantity exactly equals minimum * parts
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          0.005,
          5
        );

        expect(result.valid).toBe(true);
        // Each part: 0.005 / 5 = 0.001, exactly equals minimum
      });

      it('should calculate optimal parts suggestion correctly', () => {
        // Test: Suggest reducing parts to maximum feasible
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          0.007,
          15
        );

        expect(result.valid).toBe(false);
        // Max parts: floor(0.007 / 0.001) = 7
        expect(result.suggestion).toContain('reduce graduated parts to 7');
      });

      it('should handle maximum order quantity constraints', () => {
        // Test: Order part exceeds exchange maximum
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          5000,
          2
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain('exceeds maximum (1000)');
        expect(result.suggestion).toContain('Decrease quantity or increase graduated parts');
      });

      it('should validate quantity step requirements', () => {
        // Test: Quantity not divisible by step size
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bingx,
          0.157,
          3
        );

        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be a multiple of 0.01');
        expect(result.suggestion).toMatch(/Adjust total quantity to \d+\.\d+/);
      });
    });

    describe('Floating Point Precision Handling', () => {
      it('should handle floating point arithmetic correctly', () => {
        // Test: Floating point division that should work
        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          0.003,
          3
        );

        expect(result.valid).toBe(true);
        // Each part: 0.003 / 3 = 0.001, should be valid despite floating point
      });

      it('should use tolerance for step validation', () => {
        // Test: Very small floating point differences should be tolerated
        const customSymbol = {
          ...exchangeConfigs.bybit,
          qtyStep: 0.001,
          qtyPrecision: 6
        };

        const result = symbolInfoService.validateOrderQuantity(
          customSymbol,
          0.003001,
          3
        );

        expect(result.valid).toBe(true);
        // Each part: 0.003001 / 3 = 0.001000333..., should pass with tolerance
      });
    });
  });

  describe('Real-World Trading Scenarios', () => {
    interface TradeScenario {
      name: string;
      exchange: keyof typeof exchangeConfigs;
      totalQuantity: number;
      graduatedParts: number;
      expectedValid: boolean;
      expectedError?: string;
      expectedSuggestion?: string;
    }

    const scenarios: TradeScenario[] = [
      {
        name: 'Small retail arbitrage on Bybit',
        exchange: 'bybit',
        totalQuantity: 0.05,
        graduatedParts: 5,
        expectedValid: true
      },
      {
        name: 'Micro-trading test order',
        exchange: 'bybit',
        totalQuantity: 0.001,
        graduatedParts: 3,
        expectedValid: false,
        expectedError: 'below minimum',
        expectedSuggestion: 'reduce graduated parts to 1'
      },
      {
        name: 'Medium BingX arbitrage position',
        exchange: 'bingx',
        totalQuantity: 2.5,
        graduatedParts: 10,
        expectedValid: true
      },
      {
        name: 'BingX position with too many parts',
        exchange: 'bingx',
        totalQuantity: 0.5,
        graduatedParts: 20,
        expectedValid: false,
        expectedError: 'below minimum',
        expectedSuggestion: 'reduce graduated parts'
      },
      {
        name: 'Gate.io large position',
        exchange: 'gateio',
        totalQuantity: 100,
        graduatedParts: 10,
        expectedValid: true
      },
      {
        name: 'Gate.io insufficient total quantity',
        exchange: 'gateio',
        totalQuantity: 3,
        graduatedParts: 5,
        expectedValid: false,
        expectedError: 'below minimum',
        expectedSuggestion: 'reduce graduated parts to 3'
      },
      {
        name: 'MEXC high-frequency strategy',
        exchange: 'mexc',
        totalQuantity: 0.1,
        graduatedParts: 100,
        expectedValid: true
      },
      {
        name: 'MEXC ultra-micro position',
        exchange: 'mexc',
        totalQuantity: 0.0005,
        graduatedParts: 10,
        expectedValid: false,
        expectedError: 'below minimum',
        expectedSuggestion: 'reduce graduated parts to 5'
      }
    ];

    scenarios.forEach(scenario => {
      it(`should handle: ${scenario.name}`, () => {
        const config = exchangeConfigs[scenario.exchange];
        const result = symbolInfoService.validateOrderQuantity(
          config,
          scenario.totalQuantity,
          scenario.graduatedParts
        );

        expect(result.valid).toBe(scenario.expectedValid);

        if (!scenario.expectedValid) {
          if (scenario.expectedError) {
            expect(result.error).toContain(scenario.expectedError);
          }
          if (scenario.expectedSuggestion) {
            expect(result.suggestion).toContain(scenario.expectedSuggestion);
          }
        }
      });
    });
  });

  describe('Form Control Integration Patterns', () => {
    it('should integrate with Angular FormControl validation', () => {
      // Simulate real form control usage
      const quantityControl = new FormControl(0.001);
      const partsControl = new FormControl(5);

      // Create validator function
      const graduatedEntryValidator = () => {
        const quantity = quantityControl.value;
        const parts = partsControl.value;

        if (!quantity || !parts) return null;

        const result = symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          quantity,
          parts
        );

        return result.valid ? null : {
          graduatedEntry: {
            message: result.error,
            suggestion: result.suggestion
          }
        };
      };

      // Test invalid case
      const invalidResult = graduatedEntryValidator();
      expect(invalidResult).not.toBeNull();
      expect(invalidResult?.graduatedEntry.message).toContain('below minimum');

      // Test valid case
      quantityControl.setValue(0.1);
      const validResult = graduatedEntryValidator();
      expect(validResult).toBeNull();
    });

    it('should provide helpful error messages for UI display', () => {
      const result = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.gateio,
        5,
        10
      );

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Each order part \(\d+(\.\d+)?\) is below minimum \(\d+\)/);
      expect(result.suggestion).toMatch(/Increase total quantity to at least \d+ or reduce graduated parts to \d+/);

      // Verify the error message is user-friendly
      expect(result.error).toContain('Each order part');
      expect(result.error).toContain('is below minimum');
      expect(result.suggestion).toContain('Increase total quantity');
      expect(result.suggestion).toContain('reduce graduated parts');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid validation calls efficiently', () => {
      const startTime = performance.now();

      // Simulate rapid form changes
      for (let i = 0; i < 100; i++) {
        symbolInfoService.validateOrderQuantity(
          exchangeConfigs.bybit,
          0.01 + (i * 0.001),
          5 + (i % 10)
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 100 validations in reasonable time
      expect(duration).toBeLessThan(100); // Less than 100ms
    });

    it('should handle extreme values without errors', () => {
      // Test very large numbers
      const largeResult = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.mexc,
        1000000,
        1
      );
      expect(largeResult.valid).toBe(true);

      // Test very small numbers
      const smallResult = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.mexc,
        0.0000001,
        1
      );
      expect(smallResult.valid).toBe(false);
      expect(smallResult.error).toContain('below minimum');

      // Test zero values
      const zeroResult = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.bybit,
        0,
        5
      );
      expect(zeroResult.valid).toBe(false);
    });
  });

  describe('Error Recovery and User Guidance', () => {
    it('should provide actionable suggestions for common errors', () => {
      // Test case: User sets too many parts for their quantity
      const result = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.bybit,
        0.01,
        20
      );

      expect(result.valid).toBe(false);
      expect(result.suggestion).toContain('reduce graduated parts to 10');

      // The suggestion should be mathematically correct
      const suggestedParts = 10; // floor(0.01 / 0.001) = 10
      const testResult = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.bybit,
        0.01,
        suggestedParts
      );
      expect(testResult.valid).toBe(true);
    });

    it('should handle edge cases gracefully', () => {
      // Test null/undefined symbol info
      const nullResult = symbolInfoService.validateOrderQuantity(
        null as any,
        1,
        5
      );
      expect(nullResult.valid).toBe(false);
      expect(nullResult.error).toBe('Symbol information not available');

      // Test division by zero
      const zeroPartsResult = symbolInfoService.validateOrderQuantity(
        exchangeConfigs.bybit,
        1,
        0
      );
      expect(zeroPartsResult.valid).toBe(false);
      // Should not throw error
    });
  });
});