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
});
