import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';

import { ArbitrageChartComponent } from './arbitrage-chart.component';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';
import { ExchangeCredentialsService } from '../../../services/exchange-credentials.service';
import { SymbolInfoService, SymbolInfo } from '../../../services/symbol-info.service';
import { TradingSettingsService } from '../../../services/trading-settings.service';

// Mock components
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardContentComponent } from '../../ui/card/card.component';
import { ButtonComponent } from '../../ui/button/button.component';

describe('ArbitrageChartComponent - Order Parameters & Graduated Entry', () => {
  let component: ArbitrageChartComponent;
  let fixture: ComponentFixture<ArbitrageChartComponent>;
  let symbolInfoService: jasmine.SpyObj<SymbolInfoService>;
  let tradingSettingsService: jasmine.SpyObj<TradingSettingsService>;
  let authService: jasmine.SpyObj<AuthService>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let credentialsService: jasmine.SpyObj<ExchangeCredentialsService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  // Mock symbol info data
  const mockPrimarySymbolInfo: SymbolInfo = {
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

  const mockHedgeSymbolInfo: SymbolInfo = {
    symbol: 'BTCUSDT',
    exchange: 'BINGX',
    minOrderQty: 0.01,
    qtyStep: 0.01,
    pricePrecision: 2,
    qtyPrecision: 2,
    maxOrderQty: 500,
    maxLeverage: 100,
    minOrderValue: 20
  };

  const mockGateIOSymbolInfo: SymbolInfo = {
    symbol: 'BTC_USDT',
    exchange: 'GATEIO',
    minOrderQty: 1,
    qtyStep: 1,
    pricePrecision: 2,
    qtyPrecision: 0,
    maxOrderQty: 1000000,
    maxLeverage: 25,
    minOrderValue: undefined
  };

  beforeEach(async () => {
    // Create spies
    const symbolInfoSpy = jasmine.createSpyObj('SymbolInfoService', [
      'getSymbolInfo',
      'validateOrderQuantity',
      'clearCache'
    ]);
    const tradingSettingsSpy = jasmine.createSpyObj('TradingSettingsService', [
      'getLeverage',
      'getGraduatedParts',
      'getGraduatedDelayMs'
    ]);
    const authSpy = jasmine.createSpyObj('AuthService', ['authState']);
    const themeSpy = jasmine.createSpyObj('ThemeService', ['currentTheme']);
    const credentialsSpy = jasmine.createSpyObj('ExchangeCredentialsService', [
      'fetchCredentials',
      'testConnection'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Mock route parameters
    activatedRoute = {
      params: of({
        symbol: 'BTCUSDT',
        primary: 'BYBIT',
        hedge: 'BINGX'
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        ArbitrageChartComponent,
        ReactiveFormsModule,
        HttpClientTestingModule,
        CardComponent,
        CardHeaderComponent,
        CardTitleComponent,
        CardContentComponent,
        ButtonComponent
      ],
      providers: [
        { provide: SymbolInfoService, useValue: symbolInfoSpy },
        { provide: TradingSettingsService, useValue: tradingSettingsSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ThemeService, useValue: themeSpy },
        { provide: ExchangeCredentialsService, useValue: credentialsSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    // Get service spies
    symbolInfoService = TestBed.inject(SymbolInfoService) as jasmine.SpyObj<SymbolInfoService>;
    tradingSettingsService = TestBed.inject(TradingSettingsService) as jasmine.SpyObj<TradingSettingsService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    credentialsService = TestBed.inject(ExchangeCredentialsService) as jasmine.SpyObj<ExchangeCredentialsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default mock returns
    tradingSettingsService.getLeverage.and.returnValue(10);
    tradingSettingsService.getGraduatedParts.and.returnValue(5);
    tradingSettingsService.getGraduatedDelayMs.and.returnValue(2000);
    authService.authState.and.returnValue({ token: 'mock-token', user: null });
    themeService.currentTheme.and.returnValue('dark');
    symbolInfoService.getSymbolInfo.and.returnValue(of(mockPrimarySymbolInfo));
    symbolInfoService.validateOrderQuantity.and.returnValue({ valid: true });
    credentialsService.fetchCredentials.and.returnValue(of([]));

    fixture = TestBed.createComponent(ArbitrageChartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Form Initialization with Graduated Entry', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should create component with graduated entry forms', () => {
      expect(component).toBeTruthy();
      expect(component.primaryOrderForm).toBeTruthy();
      expect(component.hedgeOrderForm).toBeTruthy();
    });

    it('should initialize primary form with default graduated entry values', () => {
      expect(component.primaryOrderForm.get('side')?.value).toBe('long');
      expect(component.primaryOrderForm.get('leverage')?.value).toBe(10);
      expect(component.primaryOrderForm.get('quantity')?.value).toBe(0);
      expect(component.primaryOrderForm.get('graduatedParts')?.value).toBe(5);
      expect(component.primaryOrderForm.get('graduatedDelayMs')?.value).toBe(2); // 2000ms converted to 2 seconds
    });

    it('should initialize hedge form with opposite side and same graduated entry values', () => {
      expect(component.hedgeOrderForm.get('side')?.value).toBe('short');
      expect(component.hedgeOrderForm.get('leverage')?.value).toBe(10);
      expect(component.hedgeOrderForm.get('quantity')?.value).toBe(0);
      expect(component.hedgeOrderForm.get('graduatedParts')?.value).toBe(5);
      expect(component.hedgeOrderForm.get('graduatedDelayMs')?.value).toBe(2);
    });

    it('should have correct form validators for graduated entry fields', () => {
      const primaryParts = component.primaryOrderForm.get('graduatedParts');
      const hedgeParts = component.hedgeOrderForm.get('graduatedParts');
      const primaryDelay = component.primaryOrderForm.get('graduatedDelayMs');
      const hedgeDelay = component.hedgeOrderForm.get('graduatedDelayMs');

      // Test minimum values
      primaryParts?.setValue(0);
      expect(primaryParts?.hasError('min')).toBe(true);
      
      hedgeParts?.setValue(0);
      expect(hedgeParts?.hasError('min')).toBe(true);

      primaryDelay?.setValue(0.05);
      expect(primaryDelay?.hasError('min')).toBe(true);

      hedgeDelay?.setValue(0.05);
      expect(hedgeDelay?.hasError('min')).toBe(true);

      // Test maximum values
      primaryParts?.setValue(25);
      expect(primaryParts?.hasError('max')).toBe(true);

      primaryDelay?.setValue(65);
      expect(primaryDelay?.hasError('max')).toBe(true);

      // Test valid values
      primaryParts?.setValue(5);
      expect(primaryParts?.hasError('min')).toBe(false);
      expect(primaryParts?.hasError('max')).toBe(false);

      primaryDelay?.setValue(2);
      expect(primaryDelay?.hasError('min')).toBe(false);
      expect(primaryDelay?.hasError('max')).toBe(false);
    });

    it('should validate leverage range for both forms', () => {
      const primaryLeverage = component.primaryOrderForm.get('leverage');
      const hedgeLeverage = component.hedgeOrderForm.get('leverage');

      // Test minimum
      primaryLeverage?.setValue(0);
      expect(primaryLeverage?.hasError('min')).toBe(true);

      hedgeLeverage?.setValue(0);
      expect(hedgeLeverage?.hasError('min')).toBe(true);

      // Test maximum
      primaryLeverage?.setValue(130);
      expect(primaryLeverage?.hasError('max')).toBe(true);

      hedgeLeverage?.setValue(130);
      expect(hedgeLeverage?.hasError('max')).toBe(true);

      // Test valid values
      primaryLeverage?.setValue(25);
      expect(primaryLeverage?.valid).toBe(true);

      hedgeLeverage?.setValue(50);
      expect(hedgeLeverage?.valid).toBe(true);
    });
  });

  describe('Quantity Synchronization', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Set up price data for conversion calculations
      component['primaryData'].set({
        exchange: 'BYBIT',
        price: 100000,
        fundingRate: '0.0001',
        nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
        lastUpdate: new Date()
      });
      component['hedgeData'].set({
        exchange: 'BINGX', 
        price: 100100,
        fundingRate: '-0.0001',
        nextFundingTime: Date.now() + 8 * 60 * 60 * 1000,
        lastUpdate: new Date()
      });
    });

    it('should synchronize quantity from primary to hedge when primary changes', fakeAsync(() => {
      const primaryQuantity = component.primaryOrderForm.get('quantity');
      const hedgeQuantity = component.hedgeOrderForm.get('quantity');

      // Change primary quantity
      primaryQuantity?.setValue(1.5);
      tick();

      // Should sync to hedge
      expect(hedgeQuantity?.value).toBe(1.5);
    }));

    it('should synchronize quantity from hedge to primary when hedge changes', fakeAsync(() => {
      const primaryQuantity = component.primaryOrderForm.get('quantity');
      const hedgeQuantity = component.hedgeOrderForm.get('quantity');

      // Change hedge quantity
      hedgeQuantity?.setValue(2.5);
      tick();

      // Should sync to primary
      expect(primaryQuantity?.value).toBe(2.5);
    }));

    it('should prevent circular synchronization during quantity updates', fakeAsync(() => {
      const primaryQuantity = component.primaryOrderForm.get('quantity');
      const hedgeQuantity = component.hedgeOrderForm.get('quantity');
      
      spyOn(component as any, 'validatePrimaryOrder');
      spyOn(component as any, 'validateHedgeOrder');

      // Change primary quantity
      primaryQuantity?.setValue(1.0);
      tick();

      // Both validation methods should be called exactly once
      expect((component as any).validatePrimaryOrder).toHaveBeenCalledTimes(1);
      expect((component as any).validateHedgeOrder).toHaveBeenCalledTimes(1);
    }));

    it('should convert quantity when units differ between primary and hedge', fakeAsync(() => {
      // Set different units
      component.primaryQuantityUnit.set('coin');
      component.hedgeQuantityUnit.set('usdt');

      const primaryQuantity = component.primaryOrderForm.get('quantity');
      const hedgeQuantity = component.hedgeOrderForm.get('quantity');

      // Change primary quantity (coin)
      primaryQuantity?.setValue(0.5);
      tick();

      // Should convert to USDT using primary price (100000)
      expect(hedgeQuantity?.value).toBe(50000); // 0.5 * 100000
    }));

    it('should convert from USDT to coin when syncing hedge to primary', fakeAsync(() => {
      // Set different units
      component.primaryQuantityUnit.set('coin');
      component.hedgeQuantityUnit.set('usdt');

      const primaryQuantity = component.primaryOrderForm.get('quantity');
      const hedgeQuantity = component.hedgeOrderForm.get('quantity');

      // Change hedge quantity (USDT)
      hedgeQuantity?.setValue(100100);
      tick();

      // Should convert to coin using hedge price (100100)
      expect(primaryQuantity?.value).toBe(1); // 100100 / 100100
    }));

    it('should handle price data unavailable during conversion', fakeAsync(() => {
      // Clear price data
      component['primaryData'].set({
        exchange: 'BYBIT',
        price: 0,
        fundingRate: '0.0001',
        nextFundingTime: Date.now(),
        lastUpdate: new Date()
      });

      component.primaryQuantityUnit.set('coin');
      component.hedgeQuantityUnit.set('usdt');

      const primaryQuantity = component.primaryOrderForm.get('quantity');
      const hedgeQuantity = component.hedgeOrderForm.get('quantity');

      // Change primary quantity
      primaryQuantity?.setValue(0.5);
      tick();

      // Should not convert when price is 0
      expect(hedgeQuantity?.value).toBe(0.5);
    }));
  });

  describe('Side Synchronization', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should synchronize opposite sides when primary side changes', fakeAsync(() => {
      const primarySide = component.primaryOrderForm.get('side');
      const hedgeSide = component.hedgeOrderForm.get('side');

      // Change primary to short
      primarySide?.setValue('short');
      tick();

      // Hedge should become long
      expect(hedgeSide?.value).toBe('long');
    }));

    it('should synchronize opposite sides when hedge side changes', fakeAsync(() => {
      const primarySide = component.primaryOrderForm.get('side');
      const hedgeSide = component.hedgeOrderForm.get('side');

      // Change hedge to long
      hedgeSide?.setValue('long');
      tick();

      // Primary should become short
      expect(primarySide?.value).toBe('short');
    }));

    it('should mark manual side selection when user changes sides', fakeAsync(() => {
      const primarySide = component.primaryOrderForm.get('side');
      
      // Initial state should not have manual selection
      expect((component as any).hasManualSideSelection).toBe(false);

      // User changes side
      primarySide?.setValue('short');
      tick();

      // Should mark as manual selection
      expect((component as any).hasManualSideSelection).toBe(true);
    }));

    it('should prevent circular side synchronization', fakeAsync(() => {
      const primarySide = component.primaryOrderForm.get('side');
      const hedgeSide = component.hedgeOrderForm.get('side');
      
      let primaryChangeCount = 0;
      let hedgeChangeCount = 0;

      primarySide?.valueChanges.subscribe(() => primaryChangeCount++);
      hedgeSide?.valueChanges.subscribe(() => hedgeChangeCount++);

      // Change primary side
      primarySide?.setValue('short');
      tick();

      // Should only trigger one change each (no circular updates)
      expect(primaryChangeCount).toBe(1);
      expect(hedgeChangeCount).toBe(1);
    }));
  });

  describe('Graduated Entry Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.primarySymbolInfo.set(mockPrimarySymbolInfo);
      component.hedgeSymbolInfo.set(mockHedgeSymbolInfo);
    });

    it('should validate primary order with graduated parts', () => {
      symbolInfoService.validateOrderQuantity.and.returnValue({
        valid: false,
        error: 'Each order part (0.0002) is below minimum (0.001)',
        suggestion: 'Increase total quantity to at least 0.005 or reduce graduated parts to 2'
      });

      component.primaryOrderForm.patchValue({
        quantity: 0.001,
        graduatedParts: 5
      });

      // Trigger validation
      (component as any).validatePrimaryOrder();

      expect(symbolInfoService.validateOrderQuantity).toHaveBeenCalledWith(
        mockPrimarySymbolInfo,
        0.001,
        5
      );
      expect(component.primaryValidation().valid).toBe(false);
      expect(component.primaryValidation().error).toContain('Each order part');
    });

    it('should validate hedge order with graduated parts', () => {
      symbolInfoService.validateOrderQuantity.and.returnValue({
        valid: false,
        error: 'Each order part (0.002) is below minimum (0.01)',
        suggestion: 'Increase total quantity to at least 0.05 or reduce graduated parts to 1'
      });

      component.hedgeOrderForm.patchValue({
        quantity: 0.01,
        graduatedParts: 5
      });

      // Trigger validation
      (component as any).validateHedgeOrder();

      expect(symbolInfoService.validateOrderQuantity).toHaveBeenCalledWith(
        mockHedgeSymbolInfo,
        0.01,
        5
      );
      expect(component.hedgeValidation().valid).toBe(false);
      expect(component.hedgeValidation().error).toContain('Each order part');
    });

    it('should pass validation when quantity per part meets requirements', () => {
      symbolInfoService.validateOrderQuantity.and.returnValue({ valid: true });

      component.primaryOrderForm.patchValue({
        quantity: 0.1,
        graduatedParts: 5
      });

      (component as any).validatePrimaryOrder();

      expect(symbolInfoService.validateOrderQuantity).toHaveBeenCalledWith(
        mockPrimarySymbolInfo,
        0.1,
        5
      );
      expect(component.primaryValidation().valid).toBe(true);
    });

    it('should trigger validation when graduated parts change', fakeAsync(() => {
      spyOn(component as any, 'validatePrimaryOrder');
      spyOn(component as any, 'validateHedgeOrder');

      const primaryParts = component.primaryOrderForm.get('graduatedParts');
      const hedgeParts = component.hedgeOrderForm.get('graduatedParts');

      primaryParts?.setValue(10);
      tick();

      hedgeParts?.setValue(3);
      tick();

      expect((component as any).validatePrimaryOrder).toHaveBeenCalled();
      expect((component as any).validateHedgeOrder).toHaveBeenCalled();
    }));

    it('should handle validation when symbol info is not available', () => {
      component.primarySymbolInfo.set(null);
      
      (component as any).validatePrimaryOrder();

      expect(component.primaryValidation().valid).toBe(true);
      expect(symbolInfoService.validateOrderQuantity).not.toHaveBeenCalled();
    });
  });

  describe('Exchange-Specific Validation Edge Cases', () => {
    it('should handle Gate.io large minimum quantity validation', () => {
      component.primarySymbolInfo.set(mockGateIOSymbolInfo);
      
      symbolInfoService.validateOrderQuantity.and.returnValue({
        valid: false,
        error: 'Each order part (0.2) is below minimum (1)',
        suggestion: 'Increase total quantity to at least 5 or reduce graduated parts to 1'
      });

      component.primaryOrderForm.patchValue({
        quantity: 1,
        graduatedParts: 5
      });

      (component as any).validatePrimaryOrder();

      expect(symbolInfoService.validateOrderQuantity).toHaveBeenCalledWith(
        mockGateIOSymbolInfo,
        1,
        5
      );
      expect(component.primaryValidation().valid).toBe(false);
      expect(component.primaryValidation().suggestion).toContain('reduce graduated parts to 1');
    });

    it('should validate maximum order quantity constraints', () => {
      symbolInfoService.validateOrderQuantity.and.returnValue({
        valid: false,
        error: 'Each order part (250) exceeds maximum (100)',
        suggestion: 'Decrease quantity or increase graduated parts'
      });

      component.hedgeOrderForm.patchValue({
        quantity: 1000,
        graduatedParts: 4
      });

      (component as any).validateHedgeOrder();

      expect(component.hedgeValidation().valid).toBe(false);
      expect(component.hedgeValidation().error).toContain('exceeds maximum');
    });

    it('should validate quantity step constraints', () => {
      symbolInfoService.validateOrderQuantity.and.returnValue({
        valid: false,
        error: 'Quantity per part must be a multiple of 0.001',
        suggestion: 'Adjust total quantity to 0.015'
      });

      component.primaryOrderForm.patchValue({
        quantity: 0.0147,
        graduatedParts: 3
      });

      (component as any).validatePrimaryOrder();

      expect(component.primaryValidation().valid).toBe(false);
      expect(component.primaryValidation().error).toContain('multiple of');
    });
  });

  describe('Quantity Unit Conversion Edge Cases', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component['primaryData'].set({
        exchange: 'BYBIT',
        price: 50000,
        fundingRate: '0.0001',
        nextFundingTime: Date.now(),
        lastUpdate: new Date()
      });
    });

    it('should handle fractional coin to USDT conversion', () => {
      const result = (component as any).convertQuantity(0.00123, 'coin', 'usdt', 'primary');
      expect(result).toBe(61.5); // 0.00123 * 50000
    });

    it('should handle large USDT to coin conversion', () => {
      const result = (component as any).convertQuantity(125000, 'usdt', 'coin', 'primary');
      expect(result).toBe(2.5); // 125000 / 50000
    });

    it('should return original value when converting same units', () => {
      const result = (component as any).convertQuantity(1.5, 'coin', 'coin', 'primary');
      expect(result).toBe(1.5);
    });

    it('should handle zero price gracefully', () => {
      component['primaryData'].set({
        exchange: 'BYBIT',
        price: 0,
        fundingRate: '0.0001',
        nextFundingTime: Date.now(),
        lastUpdate: new Date()
      });

      const result = (component as any).convertQuantity(1.5, 'coin', 'usdt', 'primary');
      expect(result).toBe(1.5); // Should return original value when price is 0
    });
  });

  describe('Form Integration and User Experience', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should maintain form state during quantity unit changes', fakeAsync(() => {
      component.primaryOrderForm.patchValue({
        side: 'long',
        leverage: 25,
        quantity: 0.5,
        graduatedParts: 8,
        graduatedDelayMs: 5
      });

      // Change quantity unit
      component.setPrimaryQuantityUnit('usdt');
      tick();

      // Form state should be maintained except for converted quantity
      expect(component.primaryOrderForm.get('side')?.value).toBe('long');
      expect(component.primaryOrderForm.get('leverage')?.value).toBe(25);
      expect(component.primaryOrderForm.get('graduatedParts')?.value).toBe(8);
      expect(component.primaryOrderForm.get('graduatedDelayMs')?.value).toBe(5);
    }));

    it('should synchronize unit changes between forms', fakeAsync(() => {
      component.setPrimaryQuantityUnit('usdt');
      tick();

      expect(component.hedgeQuantityUnit()).toBe('usdt');

      component.setHedgeQuantityUnit('coin');
      tick();

      expect(component.primaryQuantityUnit()).toBe('coin');
    }));

    it('should validate both forms after unit conversion', fakeAsync(() => {
      spyOn(component as any, 'validatePrimaryOrder');
      spyOn(component as any, 'validateHedgeOrder');

      component.setPrimaryQuantityUnit('usdt');
      tick();

      expect((component as any).validatePrimaryOrder).toHaveBeenCalled();
      expect((component as any).validateHedgeOrder).toHaveBeenCalled();
    }));
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid graduated parts gracefully', () => {
      component.primaryOrderForm.patchValue({
        quantity: 1,
        graduatedParts: -1
      });

      expect(component.primaryOrderForm.get('graduatedParts')?.hasError('min')).toBe(true);
    });

    it('should handle extremely large graduated parts', () => {
      component.primaryOrderForm.patchValue({
        quantity: 1,
        graduatedParts: 1000
      });

      expect(component.primaryOrderForm.get('graduatedParts')?.hasError('max')).toBe(true);
    });

    it('should handle decimal graduated delay validation', () => {
      const delayControl = component.primaryOrderForm.get('graduatedDelayMs');
      
      // Test very small delay
      delayControl?.setValue(0.05);
      expect(delayControl?.hasError('min')).toBe(true);

      // Test valid decimal delay
      delayControl?.setValue(1.5);
      expect(delayControl?.valid).toBe(true);

      // Test large delay
      delayControl?.setValue(70);
      expect(delayControl?.hasError('max')).toBe(true);
    });

    it('should handle symbol info loading failures', () => {
      symbolInfoService.getSymbolInfo.and.returnValue(of(null));
      
      // Component should handle null symbol info gracefully
      (component as any).fetchSymbolInfo();
      
      expect(component.primarySymbolInfo()).toBeNull();
      expect(component.hedgeSymbolInfo()).toBeNull();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should prevent memory leaks with proper subscription cleanup', () => {
      // Ensure component initializes subscriptions
      fixture.detectChanges();
      
      // Component should have form subscriptions
      expect(component.primaryOrderForm.get('quantity')?.valueChanges).toBeDefined();
      expect(component.hedgeOrderForm.get('quantity')?.valueChanges).toBeDefined();
      
      // Destroy should clean up without errors
      expect(() => {
        component.ngOnDestroy();
      }).not.toThrow();
    });

    it('should handle rapid form value changes efficiently', fakeAsync(() => {
      const quantityControl = component.primaryOrderForm.get('quantity');
      
      // Simulate rapid changes
      for (let i = 0; i < 10; i++) {
        quantityControl?.setValue(i * 0.1);
        tick(10);
      }
      
      // Should end up with the last value
      expect(quantityControl?.value).toBe(0.9);
    }));
  });
});