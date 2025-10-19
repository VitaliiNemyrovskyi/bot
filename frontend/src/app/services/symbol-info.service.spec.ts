import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SymbolInfoService, SymbolInfo } from './symbol-info.service';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';

describe('SymbolInfoService', () => {
  let service: SymbolInfoService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  const mockSymbolInfo: SymbolInfo = {
    symbol: 'MERL-USDT',
    exchange: 'BINGX',
    minOrderQty: 5.292,
    minOrderValue: 10,
    qtyStep: 0.001,
    pricePrecision: 2,
    qtyPrecision: 3,
    maxOrderQty: 10000,
    maxLeverage: 125
  };

  beforeEach(() => {
    // Create mock AuthService with signal
    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      authState: signal({ token: 'test-token', user: null })
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SymbolInfoService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(SymbolInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getSymbolInfo', () => {
    it('should fetch symbol info from API', (done) => {
      service.getSymbolInfo('BINGX', 'MERL-USDT').subscribe(result => {
        expect(result).toEqual(mockSymbolInfo);
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes('/api/exchange/symbol-info') &&
        request.params.get('exchange') === 'BINGX' &&
        request.params.get('symbol') === 'MERL-USDT'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');

      req.flush({ success: true, data: mockSymbolInfo });
    });

    it('should cache symbol info after first fetch', (done) => {
      // First call - should hit API
      service.getSymbolInfo('BINGX', 'MERL-USDT').subscribe(result => {
        expect(result).toEqual(mockSymbolInfo);

        // Second call - should use cache (no HTTP request)
        service.getSymbolInfo('BINGX', 'MERL-USDT').subscribe(cachedResult => {
          expect(cachedResult).toEqual(mockSymbolInfo);
          done();
        });

        // Verify no second HTTP request was made
        httpMock.expectNone(request =>
          request.url.includes('/api/exchange/symbol-info')
        );
      });

      const req = httpMock.expectOne(request =>
        request.url.includes('/api/exchange/symbol-info')
      );
      req.flush({ success: true, data: mockSymbolInfo });
    });

    it('should return null if no token available', (done) => {
      // Update mock to return no token
      Object.defineProperty(authServiceMock, 'authState', {
        value: signal({ token: null, user: null }),
        writable: true
      });

      service.getSymbolInfo('BINGX', 'MERL-USDT').subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      httpMock.expectNone(request =>
        request.url.includes('/api/exchange/symbol-info')
      );
    });

    it('should handle API errors gracefully', (done) => {
      service.getSymbolInfo('BINGX', 'INVALID-SYMBOL').subscribe(result => {
        expect(result).toBeNull();
        done();
      });

      const req = httpMock.expectOne(request =>
        request.url.includes('/api/exchange/symbol-info')
      );
      req.flush({ success: false, error: 'Symbol not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('validateOrderQuantity', () => {
    it('should validate successfully when quantity per part meets minimum', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 30, 5);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.suggestion).toBeUndefined();
    });

    it('should fail when quantity per part is below minimum', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 10, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('below minimum');
      expect(result.suggestion).toContain('26.460');
    });

    it('should fail when single order is below minimum', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 5, 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('below minimum');
      expect(result.suggestion).toContain('5.292');
      expect(result.suggestion).not.toContain('reduce graduated parts');
    });

    it('should suggest reducing parts when possible', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 15, 3);
      expect(result.valid).toBe(false);
      expect(result.suggestion).toContain('reduce graduated parts to 2');
    });

    it('should not suggest reducing parts below 1', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 3, 1);
      expect(result.valid).toBe(false);
      expect(result.suggestion).not.toContain('reduce graduated parts');
    });

    it('should validate exactly at minimum quantity', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 5.292, 1);
      expect(result.valid).toBe(true);
    });

    it('should validate with multiple parts at minimum per part', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 26.46, 5);
      expect(result.valid).toBe(true);
    });

    it('should fail when quantity per part exceeds maximum', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 50000, 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should fail when quantity is not a multiple of step size', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 15.2345, 3);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('multiple of');
    });

    it('should return error when symbolInfo is null', () => {
      const result = service.validateOrderQuantity(null as any, 10, 1);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Symbol information not available');
    });

    it('should allow small floating point errors in step validation', () => {
      // 5.292 * 5 = 26.46, which should be valid despite potential floating point issues
      const result = service.validateOrderQuantity(mockSymbolInfo, 26.46, 5);
      expect(result.valid).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear cached symbol info', (done) => {
      // First call - cache data
      service.getSymbolInfo('BINGX', 'MERL-USDT').subscribe(() => {
        // Clear cache
        service.clearCache();

        // Second call - should hit API again
        service.getSymbolInfo('BINGX', 'MERL-USDT').subscribe(result => {
          expect(result).toEqual(mockSymbolInfo);
          done();
        });

        const req = httpMock.expectOne(request =>
          request.url.includes('/api/exchange/symbol-info')
        );
        req.flush({ success: true, data: mockSymbolInfo });
      });

      const req = httpMock.expectOne(request =>
        request.url.includes('/api/exchange/symbol-info')
      );
      req.flush({ success: true, data: mockSymbolInfo });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero quantity', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 0, 1);
      expect(result.valid).toBe(false);
    });

    it('should handle very large graduated parts', () => {
      const result = service.validateOrderQuantity(mockSymbolInfo, 100, 20);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('below minimum');
    });

    it('should handle quantity exactly at step boundary', () => {
      // 5.292 is exactly minOrderQty and should be at step boundary
      const result = service.validateOrderQuantity(mockSymbolInfo, 5.292, 1);
      expect(result.valid).toBe(true);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle BingX MERL-USDT original failing case', () => {
      // Original issue: 10 MERL with 5 parts failed with "minimum is 5.965 MERL"
      const result = service.validateOrderQuantity(mockSymbolInfo, 10, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2.000');
      expect(result.error).toContain('5.292');
      expect(result.suggestion).toContain('26.460');
    });

    it('should allow corrected quantity for original failing case', () => {
      // User increases to 26.46 MERL with 5 parts = 5.292 per part
      const result = service.validateOrderQuantity(mockSymbolInfo, 26.46, 5);
      expect(result.valid).toBe(true);
    });

    it('should allow reducing parts for original failing case', () => {
      // User keeps 10 MERL but reduces to 1 part
      const result = service.validateOrderQuantity(mockSymbolInfo, 10, 1);
      expect(result.valid).toBe(true);
    });
  });

  describe('Comprehensive Graduated Entry Validation', () => {
    // Test with different exchange configurations
    const bybitSymbol: SymbolInfo = {
      symbol: 'BTCUSDT',
      exchange: 'BYBIT',
      minOrderQty: 0.001,
      qtyStep: 0.001,
      pricePrecision: 2,
      qtyPrecision: 3,
      maxOrderQty: 1000,
      maxLeverage: 125,
      minOrderValue: 10
    };

    const gateioSymbol: SymbolInfo = {
      symbol: 'BTC_USDT',
      exchange: 'GATEIO',
      minOrderQty: 1,
      qtyStep: 1,
      pricePrecision: 2,
      qtyPrecision: 0,
      maxOrderQty: 1000000,
      maxLeverage: 25
    };

    const mexcSymbol: SymbolInfo = {
      symbol: 'BTCUSDT',
      exchange: 'MEXC',
      minOrderQty: 0.0001,
      qtyStep: 0.0001,
      pricePrecision: 2,
      qtyPrecision: 4,
      maxOrderQty: 10000,
      maxLeverage: 200,
      minOrderValue: 5
    };

    describe('Bybit Exchange Validation', () => {
      it('should validate typical arbitrage positions with graduated entry', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0.1, 5);
        expect(result.valid).toBe(true);
        // Each part: 0.1 / 5 = 0.02, which is >= 0.001
      });

      it('should reject micro positions with too many parts', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0.005, 10);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (0.0005) is below minimum (0.001)');
        expect(result.suggestion).toContain('reduce graduated parts to 5');
      });

      it('should validate maximum order constraints with graduated entry', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 5000, 2);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (2500) exceeds maximum (1000)');
      });

      it('should handle precision edge cases', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0.0033, 3);
        // Each part: 0.0033 / 3 = 0.0011, which is >= 0.001
        expect(result.valid).toBe(true);
      });
    });

    describe('Gate.io Exchange Validation', () => {
      it('should handle large minimum quantities typical of Gate.io', () => {
        const result = service.validateOrderQuantity(gateioSymbol, 50, 5);
        expect(result.valid).toBe(true);
        // Each part: 50 / 5 = 10, which is >= 1
      });

      it('should reject positions where even single part fails minimum', () => {
        const result = service.validateOrderQuantity(gateioSymbol, 0.5, 1);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (0.5) is below minimum (1)');
        expect(result.suggestion).toBe('Increase total quantity to at least 1');
      });

      it('should force reduction to fewer parts when total barely meets requirement', () => {
        const result = service.validateOrderQuantity(gateioSymbol, 3, 5);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (0.6) is below minimum (1)');
        expect(result.suggestion).toContain('reduce graduated parts to 3');
      });

      it('should validate integer step requirements', () => {
        const result = service.validateOrderQuantity(gateioSymbol, 15.7, 3);
        // Each part: 15.7 / 3 = 5.233..., step is 1
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Quantity per part must be a multiple of 1');
      });
    });

    describe('MEXC Exchange Validation', () => {
      it('should allow very precise micro-positions with many parts', () => {
        const result = service.validateOrderQuantity(mexcSymbol, 0.01, 20);
        expect(result.valid).toBe(true);
        // Each part: 0.01 / 20 = 0.0005, which is >= 0.0001
      });

      it('should reject ultra-micro positions', () => {
        const result = service.validateOrderQuantity(mexcSymbol, 0.0005, 10);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Each order part (0.00005) is below minimum (0.0001)');
        expect(result.suggestion).toContain('reduce graduated parts to 5');
      });

      it('should validate high-precision step constraints', () => {
        const result = service.validateOrderQuantity(mexcSymbol, 0.01234, 7);
        // Each part: 0.01234 / 7 ≈ 0.001763, step is 0.0001
        expect(result.valid).toBe(true);
      });
    });

    describe('Complex Graduated Entry Scenarios', () => {
      it('should calculate optimal part suggestions correctly', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0.007, 15);
        expect(result.valid).toBe(false);
        // Total: 0.007, minOrderQty: 0.001
        // Max parts: floor(0.007 / 0.001) = 7
        expect(result.suggestion).toContain('reduce graduated parts to 7');
      });

      it('should handle edge case where quantity equals minimum times parts', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0.005, 5);
        // Each part: 0.005 / 5 = 0.001, exactly equals minimum
        expect(result.valid).toBe(true);
      });

      it('should suggest quantity increase when parts cannot be reduced further', () => {
        const result = service.validateOrderQuantity(gateioSymbol, 0.5, 1);
        expect(result.valid).toBe(false);
        expect(result.suggestion).toBe('Increase total quantity to at least 1');
      });

      it('should validate maximum graduated parts scenarios', () => {
        const result = service.validateOrderQuantity(mexcSymbol, 1.0, 100);
        // Each part: 1.0 / 100 = 0.01, which is >= 0.0001
        expect(result.valid).toBe(true);
      });
    });

    describe('Floating Point Precision Edge Cases', () => {
      it('should handle floating point arithmetic precision issues', () => {
        // Test case where floating point math might cause precision issues
        const result = service.validateOrderQuantity(bybitSymbol, 0.003, 3);
        // Each part: 0.003 / 3 = 0.001, should be valid despite potential floating point errors
        expect(result.valid).toBe(true);
      });

      it('should use tolerance for step validation', () => {
        // Test with quantity very close to but not exactly divisible by step
        const customSymbol: SymbolInfo = {
          ...bybitSymbol,
          qtyStep: 0.001,
          qtyPrecision: 6
        };

        const result = service.validateOrderQuantity(customSymbol, 0.003001, 3);
        // Each part: 0.003001 / 3 = 0.001000333..., should pass with tolerance
        expect(result.valid).toBe(true);
      });

      it('should reject when step difference exceeds tolerance', () => {
        const customSymbol: SymbolInfo = {
          ...bybitSymbol,
          qtyStep: 0.01,
          qtyPrecision: 3
        };

        const result = service.validateOrderQuantity(customSymbol, 0.157, 3);
        // Each part: 0.157 / 3 = 0.0523..., step: 0.01
        // This difference is too large and should fail
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be a multiple of 0.01');
      });
    });

    describe('Real-World Trading Scenarios', () => {
      it('should validate typical $1000 arbitrage position at $100k BTC', () => {
        // Scenario: $1000 position at $100k BTC = 0.01 BTC, split into 5 parts
        const result = service.validateOrderQuantity(bybitSymbol, 0.01, 5);
        expect(result.valid).toBe(true);
        // Each part: 0.01 / 5 = 0.002, which is >= 0.001
      });

      it('should validate large institutional order splitting', () => {
        // Scenario: 10 BTC split into 50 parts for gradual execution
        const result = service.validateOrderQuantity(bybitSymbol, 10, 50);
        expect(result.valid).toBe(true);
        // Each part: 10 / 50 = 0.2, which is >= 0.001
      });

      it('should handle micro-trading test orders', () => {
        // Scenario: Very small test trade
        const result = service.validateOrderQuantity(bybitSymbol, 0.001, 3);
        expect(result.valid).toBe(false);
        // Each part: 0.001 / 3 = 0.000333..., which is < 0.001
        expect(result.suggestion).toContain('reduce graduated parts to 1');
      });

      it('should validate approaching exchange maximum limits', () => {
        // Scenario: Large order approaching exchange limits with graduation
        const result = service.validateOrderQuantity(bybitSymbol, 1500, 2);
        expect(result.valid).toBe(false);
        // Each part: 1500 / 2 = 750, should be valid but total exceeds typical limits
        expect(result.error).toContain('exceeds maximum');
      });
    });

    describe('Error Message Quality', () => {
      it('should provide actionable error messages with proper formatting', () => {
        const result = service.validateOrderQuantity(gateioSymbol, 3, 5);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/Each order part \(\d+(\.\d+)?\) is below minimum \(\d+\)/);
        expect(result.suggestion).toMatch(/Increase total quantity to at least \d+ or reduce graduated parts to \d+/);
      });

      it('should format small numbers with appropriate precision', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0.001, 5);
        expect(result.error).toContain('(0.0002)'); // Should show appropriate decimal places
        expect(result.suggestion).toContain('0.005'); // Should show appropriate precision
      });

      it('should provide clear step size violation messages', () => {
        const result = service.validateOrderQuantity(mockSymbolInfo, 15.2345, 3);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('must be a multiple of 0.001');
        expect(result.suggestion).toMatch(/Adjust total quantity to \d+\.\d+/);
      });
    });

    describe('Boundary Conditions and Edge Cases', () => {
      it('should handle zero quantity gracefully', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 0, 5);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('is below minimum');
      });

      it('should handle zero graduated parts (division by zero)', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 1, 0);
        expect(result.valid).toBe(false);
        // Should handle gracefully without throwing
      });

      it('should handle very large quantities without precision loss', () => {
        const result = service.validateOrderQuantity(mexcSymbol, 1000000, 1);
        expect(result.valid).toBe(true);
      });

      it('should handle symbols without maximum order quantity', () => {
        const symbolWithoutMax: SymbolInfo = {
          ...bybitSymbol,
          maxOrderQty: undefined
        };

        const result = service.validateOrderQuantity(symbolWithoutMax, 10000, 2);
        expect(result.valid).toBe(true);
        // Should not fail when no max quantity is defined
      });

      it('should handle negative quantities', () => {
        const result = service.validateOrderQuantity(bybitSymbol, -1, 5);
        expect(result.valid).toBe(false);
      });

      it('should handle extremely large graduated parts', () => {
        const result = service.validateOrderQuantity(bybitSymbol, 1, 10000);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('is below minimum');
      });
    });
  });
});
