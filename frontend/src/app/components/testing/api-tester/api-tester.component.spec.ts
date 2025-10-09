import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { ApiTesterComponent, OrderType, OrderSide, PositionSide } from './api-tester.component';
import { TradingService, ExchangeOrderResponse } from '../../../services/trading.service';
import { ExchangeCredentialsService } from '../../../services/exchange-credentials.service';
import { ExchangeType, EnvironmentType, ExchangeCredential } from '../../../models/exchange-credentials.model';
import { HttpErrorResponse } from '@angular/common/http';

describe('ApiTesterComponent', () => {
  let component: ApiTesterComponent;
  let fixture: ComponentFixture<ApiTesterComponent>;
  let tradingService: jasmine.SpyObj<TradingService>;
  let credentialsService: jasmine.SpyObj<ExchangeCredentialsService>;

  const mockCredentials: ExchangeCredential[] = [
    {
      id: 'cred-1',
      userId: 'user-1',
      exchange: ExchangeType.BINGX,
      environment: EnvironmentType.TESTNET,
      apiKeyPreview: '****1234',
      label: 'Test BingX',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'cred-2',
      userId: 'user-1',
      exchange: ExchangeType.BYBIT,
      environment: EnvironmentType.MAINNET,
      apiKeyPreview: '****5678',
      label: 'Main Bybit',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    const tradingSpy = jasmine.createSpyObj('TradingService', ['placeExchangeOrder']);
    const credentialsSpy = jasmine.createSpyObj('ExchangeCredentialsService', ['fetchCredentials'], {
      credentials: jasmine.createSpy('credentials').and.returnValue(mockCredentials)
    });

    await TestBed.configureTestingModule({
      imports: [ApiTesterComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: TradingService, useValue: tradingSpy },
        { provide: ExchangeCredentialsService, useValue: credentialsSpy }
      ]
    }).compileComponents();

    tradingService = TestBed.inject(TradingService) as jasmine.SpyObj<TradingService>;
    credentialsService = TestBed.inject(ExchangeCredentialsService) as jasmine.SpyObj<ExchangeCredentialsService>;

    // Setup default mock for fetchCredentials
    credentialsService.fetchCredentials.and.returnValue(of(mockCredentials));

    fixture = TestBed.createComponent(ApiTesterComponent);
    component = fixture.componentInstance;
  });

  // ============================================================================
  // INITIALIZATION TESTS
  // ============================================================================

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with default values', () => {
      fixture.detectChanges();

      expect(component.orderForm.get('symbol')?.value).toBe('BTC-USDT');
      expect(component.orderForm.get('side')?.value).toBe(OrderSide.BUY);
      expect(component.orderForm.get('positionSide')?.value).toBe(PositionSide.LONG);
      expect(component.orderForm.get('type')?.value).toBe(OrderType.MARKET);
      expect(component.orderForm.get('quantity')?.value).toBe(0.001);
    });

    it('should have price field disabled for MARKET orders by default', () => {
      fixture.detectChanges();

      const priceControl = component.orderForm.get('price');
      expect(priceControl?.disabled).toBe(true);
    });

    it('should fetch credentials on initialization', () => {
      fixture.detectChanges();

      expect(credentialsService.fetchCredentials).toHaveBeenCalled();
    });

    it('should handle credentials fetch error', () => {
      credentialsService.fetchCredentials.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.error()).toBe('Failed to load exchange credentials. Please try again.');
    });
  });

  // ============================================================================
  // FORM VALIDATION TESTS
  // ============================================================================

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate symbol format', () => {
      const symbolControl = component.orderForm.get('symbol');

      symbolControl?.setValue('INVALID');
      expect(symbolControl?.valid).toBe(false);

      symbolControl?.setValue('BTC-USDT');
      expect(symbolControl?.valid).toBe(true);

      symbolControl?.setValue('ETH-USD');
      expect(symbolControl?.valid).toBe(true);
    });

    it('should require symbol', () => {
      const symbolControl = component.orderForm.get('symbol');

      symbolControl?.setValue('');
      expect(symbolControl?.hasError('required')).toBe(true);
    });

    it('should validate quantity minimum value', () => {
      const quantityControl = component.orderForm.get('quantity');

      quantityControl?.setValue(0);
      expect(quantityControl?.hasError('min')).toBe(true);

      quantityControl?.setValue(-1);
      expect(quantityControl?.hasError('min')).toBe(true);

      quantityControl?.setValue(0.001);
      expect(quantityControl?.valid).toBe(true);
    });

    it('should require quantity', () => {
      const quantityControl = component.orderForm.get('quantity');

      quantityControl?.setValue(null);
      expect(quantityControl?.hasError('required')).toBe(true);
    });

    it('should enable and validate price for LIMIT orders', () => {
      const typeControl = component.orderForm.get('type');
      const priceControl = component.orderForm.get('price');

      typeControl?.setValue(OrderType.LIMIT);
      fixture.detectChanges();

      expect(priceControl?.disabled).toBe(false);
      expect(priceControl?.hasError('required')).toBe(true);

      priceControl?.setValue(50000);
      expect(priceControl?.valid).toBe(true);
    });

    it('should disable and clear price validators for MARKET orders', () => {
      const typeControl = component.orderForm.get('type');
      const priceControl = component.orderForm.get('price');

      // First set to LIMIT
      typeControl?.setValue(OrderType.LIMIT);
      priceControl?.setValue(50000);
      fixture.detectChanges();

      // Then switch back to MARKET
      typeControl?.setValue(OrderType.MARKET);
      fixture.detectChanges();

      expect(priceControl?.disabled).toBe(true);
      expect(priceControl?.hasError('required')).toBe(false);
    });
  });

  // ============================================================================
  // EXCHANGE AND CREDENTIAL SELECTION TESTS
  // ============================================================================

  describe('Exchange and Credential Selection', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update selected exchange', () => {
      component.onExchangeChange(ExchangeType.BINGX);

      expect(component.selectedExchange()).toBe(ExchangeType.BINGX);
    });

    it('should reset credential when exchange changes', () => {
      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      expect(component.selectedCredential()).toBeTruthy();

      component.onExchangeChange(ExchangeType.BYBIT);

      expect(component.selectedCredential()).toBeNull();
    });

    it('should filter credentials by selected exchange', () => {
      component.onExchangeChange(ExchangeType.BINGX);

      const availableCreds = component.availableCredentials();

      expect(availableCreds.length).toBe(1);
      expect(availableCreds[0].exchange).toBe(ExchangeType.BINGX);
    });

    it('should update selected credential', () => {
      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      expect(component.selectedCredential()?.id).toBe('cred-1');
    });
  });

  // ============================================================================
  // SUBMIT TESTS
  // ============================================================================

  describe('Order Submission', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not submit when form is invalid', async () => {
      component.orderForm.get('symbol')?.setValue('INVALID');

      await component.onSubmitRequest();

      expect(tradingService.placeExchangeOrder).not.toHaveBeenCalled();
    });

    it('should not submit when exchange is not selected', async () => {
      await component.onSubmitRequest();

      expect(tradingService.placeExchangeOrder).not.toHaveBeenCalled();
    });

    it('should not submit when credential is not selected', async () => {
      component.onExchangeChange(ExchangeType.BINGX);

      await component.onSubmitRequest();

      expect(tradingService.placeExchangeOrder).not.toHaveBeenCalled();
    });

    it('should submit valid MARKET order', async () => {
      const mockResponse: ExchangeOrderResponse = {
        success: true,
        orderId: 'order-123',
        status: 'FILLED'
      };

      tradingService.placeExchangeOrder.and.returnValue(of(mockResponse));

      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');
      component.orderForm.patchValue({
        symbol: 'BTC-USDT',
        side: OrderSide.BUY,
        positionSide: PositionSide.LONG,
        type: OrderType.MARKET,
        quantity: 0.01
      });

      await component.onSubmitRequest();

      expect(tradingService.placeExchangeOrder).toHaveBeenCalledWith({
        exchange: ExchangeType.BINGX,
        credentialId: 'cred-1',
        symbol: 'BTC-USDT',
        side: OrderSide.BUY,
        positionSide: PositionSide.LONG,
        type: OrderType.MARKET,
        quantity: 0.01,
        price: undefined
      });
    });

    it('should submit valid LIMIT order with price', async () => {
      const mockResponse: ExchangeOrderResponse = {
        success: true,
        orderId: 'order-456',
        status: 'NEW'
      };

      tradingService.placeExchangeOrder.and.returnValue(of(mockResponse));

      component.onExchangeChange(ExchangeType.BYBIT);
      component.onCredentialChange('cred-2');
      component.orderForm.patchValue({
        symbol: 'ETH-USDT',
        side: OrderSide.SELL,
        positionSide: PositionSide.SHORT,
        type: OrderType.LIMIT,
        quantity: 1.5
      });
      component.orderForm.get('price')?.setValue(3000);

      await component.onSubmitRequest();

      expect(tradingService.placeExchangeOrder).toHaveBeenCalledWith({
        exchange: ExchangeType.BYBIT,
        credentialId: 'cred-2',
        symbol: 'ETH-USDT',
        side: OrderSide.SELL,
        positionSide: PositionSide.SHORT,
        type: OrderType.LIMIT,
        quantity: 1.5,
        price: 3000
      });
    });

    it('should set loading state during submission', async () => {
      const mockResponse: ExchangeOrderResponse = { success: true };
      tradingService.placeExchangeOrder.and.returnValue(of(mockResponse));

      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      expect(component.isLoading()).toBe(false);

      const promise = component.onSubmitRequest();
      expect(component.isLoading()).toBe(true);

      await promise;
      expect(component.isLoading()).toBe(false);
    });

    it('should create log entry on successful submission', async () => {
      const mockResponse: ExchangeOrderResponse = {
        success: true,
        orderId: 'order-789'
      };

      tradingService.placeExchangeOrder.and.returnValue(of(mockResponse));

      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      await component.onSubmitRequest();

      const log = component.currentLog();
      expect(log).toBeTruthy();
      expect(log?.success).toBe(true);
      expect(log?.statusCode).toBe(200);
      expect(log?.method).toBe('POST');
      expect(log?.endpoint).toBe('/api/exchange-orders');
      expect(log?.responseBody).toEqual(mockResponse);
      expect(log?.responseTime).toBeGreaterThan(0);
    });

    it('should handle submission error', async () => {
      const mockError = new HttpErrorResponse({
        error: { error: { message: 'Invalid API key' } },
        status: 401,
        statusText: 'Unauthorized'
      });

      tradingService.placeExchangeOrder.and.returnValue(throwError(() => mockError));

      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      await component.onSubmitRequest();

      const log = component.currentLog();
      expect(log).toBeTruthy();
      expect(log?.success).toBe(false);
      expect(log?.statusCode).toBe(401);
      expect(log?.error).toBe('Invalid API key');
      expect(component.error()).toBe('Invalid API key');
    });

    it('should add log to history', async () => {
      const mockResponse: ExchangeOrderResponse = { success: true };
      tradingService.placeExchangeOrder.and.returnValue(of(mockResponse));

      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      expect(component.logs().length).toBe(0);

      await component.onSubmitRequest();

      expect(component.logs().length).toBe(1);
    });
  });

  // ============================================================================
  // UTILITY METHOD TESTS
  // ============================================================================

  describe('Utility Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear current log', () => {
      component.currentLog.set({
        timestamp: new Date(),
        method: 'POST',
        endpoint: '/test',
        requestBody: {},
        success: true
      });
      component.error.set('Test error');

      component.clearCurrentLog();

      expect(component.currentLog()).toBeNull();
      expect(component.error()).toBeNull();
    });

    it('should clear all logs', () => {
      component.logs.set([
        {
          timestamp: new Date(),
          method: 'POST',
          endpoint: '/test1',
          requestBody: {},
          success: true
        },
        {
          timestamp: new Date(),
          method: 'POST',
          endpoint: '/test2',
          requestBody: {},
          success: true
        }
      ]);

      component.clearAllLogs();

      expect(component.logs().length).toBe(0);
      expect(component.currentLog()).toBeNull();
    });

    it('should format JSON correctly', () => {
      const obj = { test: 'value', nested: { key: 123 } };
      const formatted = component.formatJson(obj);

      expect(formatted).toContain('"test": "value"');
      expect(formatted).toContain('"nested"');
    });

    it('should get correct status code class', () => {
      expect(component.getStatusCodeClass(200)).toBe('status-success');
      expect(component.getStatusCodeClass(201)).toBe('status-success');
      expect(component.getStatusCodeClass(400)).toBe('status-client-error');
      expect(component.getStatusCodeClass(401)).toBe('status-client-error');
      expect(component.getStatusCodeClass(500)).toBe('status-server-error');
      expect(component.getStatusCodeClass(undefined)).toBe('status-unknown');
    });

    it('should get correct status code label', () => {
      expect(component.getStatusCodeLabel(200)).toBe('OK');
      expect(component.getStatusCodeLabel(400)).toBe('Bad Request');
      expect(component.getStatusCodeLabel(401)).toBe('Unauthorized');
      expect(component.getStatusCodeLabel(500)).toBe('Internal Server Error');
      expect(component.getStatusCodeLabel(999)).toBe('999');
    });

    it('should return correct error messages for form controls', () => {
      const symbolControl = component.orderForm.get('symbol');

      symbolControl?.setValue('');
      symbolControl?.markAsTouched();
      expect(component.getErrorMessage('symbol')).toBe('This field is required');

      symbolControl?.setValue('INVALID');
      expect(component.getErrorMessage('symbol')).toContain('Invalid format');
    });

    it('should check if form control has error', () => {
      const symbolControl = component.orderForm.get('symbol');

      symbolControl?.setValue('');
      expect(component.hasError('symbol')).toBe(false); // Not touched yet

      symbolControl?.markAsTouched();
      expect(component.hasError('symbol')).toBe(true);

      symbolControl?.setValue('BTC-USDT');
      expect(component.hasError('symbol')).toBe(false);
    });
  });

  // ============================================================================
  // COMPUTED SIGNAL TESTS
  // ============================================================================

  describe('Computed Signals', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should compute canSubmit correctly', () => {
      expect(component.canSubmit()).toBe(false); // No exchange/credential selected

      component.onExchangeChange(ExchangeType.BINGX);
      expect(component.canSubmit()).toBe(false); // No credential selected

      component.onCredentialChange('cred-1');
      expect(component.canSubmit()).toBe(true); // All requirements met
    });

    it('should compute requestPreview correctly', () => {
      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');
      component.orderForm.patchValue({
        symbol: 'BTC-USDT',
        side: OrderSide.BUY,
        quantity: 0.5
      });

      const preview = component.requestPreview();

      expect(preview).toEqual({
        exchange: ExchangeType.BINGX,
        credentialId: 'cred-1',
        symbol: 'BTC-USDT',
        side: OrderSide.BUY,
        positionSide: PositionSide.LONG,
        type: OrderType.MARKET,
        quantity: 0.5,
        price: undefined
      });
    });

    it('should include price in requestPreview for LIMIT orders', () => {
      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');
      component.orderForm.patchValue({
        type: OrderType.LIMIT
      });
      component.orderForm.get('price')?.setValue(45000);

      const preview = component.requestPreview();

      expect(preview?.price).toBe(45000);
    });
  });

  // ============================================================================
  // CLIPBOARD TESTS
  // ============================================================================

  describe('Clipboard Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should copy text to clipboard', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

      await component.copyToClipboard('test text');

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('should copy request to clipboard', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

      component.onExchangeChange(ExchangeType.BINGX);
      component.onCredentialChange('cred-1');

      await component.copyRequest();

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should copy response to clipboard', async () => {
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

      component.currentLog.set({
        timestamp: new Date(),
        method: 'POST',
        endpoint: '/test',
        requestBody: {},
        responseBody: { test: 'data' },
        success: true
      });

      await component.copyResponse();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        jasmine.stringContaining('"test": "data"')
      );
    });
  });
});
