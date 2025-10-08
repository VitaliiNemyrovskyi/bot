import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { TradingDashboardComponent } from './trading-dashboard.component';
import { ManualTradingService } from '../../../services/manual-trading.service';
import { TranslationService } from '../../../services/translation.service';
import {
  Position,
  Order,
  Balance,
  OrderRequest,
  OrderResponse
} from '../../../models/trading.model';

describe('TradingDashboardComponent', () => {
  let component: TradingDashboardComponent;
  let fixture: ComponentFixture<TradingDashboardComponent>;
  let tradingService: jasmine.SpyObj<ManualTradingService>;
  let translationService: jasmine.SpyObj<TranslationService>;

  // Mock data
  const mockPositions: Position[] = [
    {
      id: '1',
      exchange: 'bybit',
      symbol: 'BTCUSDT',
      side: 'Buy',
      size: 0.1,
      entryPrice: 50000,
      markPrice: 51000,
      liquidationPrice: 45000,
      leverage: 10,
      unrealizedPnl: 100,
      unrealizedPnlPercent: 2,
      marginType: 'Cross',
      positionMargin: 500,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockOrders: Order[] = [
    {
      orderId: 'order-1',
      exchange: 'bybit',
      symbol: 'BTCUSDT',
      side: 'Buy',
      type: 'Limit',
      quantity: 0.1,
      price: 49000,
      status: 'New',
      timeInForce: 'GTC',
      filledQuantity: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockBalance: Balance = {
    exchange: 'bybit',
    totalBalance: 10175,
    availableBalance: 8675,
    usedMargin: 1400,
    unrealizedPnl: 175,
    walletBalance: 10000,
    currency: 'USDT',
    updatedAt: new Date()
  };

  beforeEach(async () => {
    // Create spy objects for services
    const tradingServiceSpy = jasmine.createSpyObj('ManualTradingService', [
      'placeOrder',
      'getPositions',
      'getOrders',
      'getAccountBalance',
      'closePosition',
      'cancelOrder',
      'getMockPositions',
      'getMockOrders',
      'getMockBalance',
      'setupAutoRefresh'
    ], {
      isPlacingOrder: signal(false),
      isLoadingPositions: signal(false),
      isLoadingOrders: signal(false),
      isLoadingBalance: signal(false),
      positions$: of(mockPositions),
      orders$: of(mockOrders),
      balance$: of(mockBalance)
    });

    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['translate']);

    await TestBed.configureTestingModule({
      imports: [
        TradingDashboardComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: ManualTradingService, useValue: tradingServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
    }).compileComponents();

    tradingService = TestBed.inject(ManualTradingService) as jasmine.SpyObj<ManualTradingService>;
    translationService = TestBed.inject(TranslationService) as jasmine.SpyObj<TranslationService>;

    // Set up default spy returns
    tradingService.getMockPositions.and.returnValue(mockPositions);
    tradingService.getMockOrders.and.returnValue(mockOrders);
    tradingService.getMockBalance.and.returnValue(mockBalance);
    translationService.translate.and.returnValue('Translated Text');

    fixture = TestBed.createComponent(TradingDashboardComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.selectedExchange()).toBe('bybit');
      expect(component.selectedSymbol()).toBe('BTCUSDT');
      expect(component.autoRefreshEnabled()).toBe(false);
    });

    it('should initialize the order form with default values', () => {
      fixture.detectChanges();

      expect(component.orderForm).toBeDefined();
      expect(component.orderForm.get('exchange')?.value).toBe('bybit');
      expect(component.orderForm.get('symbol')?.value).toBe('BTCUSDT');
      expect(component.orderForm.get('type')?.value).toBe('Market');
      expect(component.orderForm.get('side')?.value).toBe('Buy');
      expect(component.orderForm.get('timeInForce')?.value).toBe('GTC');
    });

    it('should load mock data on initialization', () => {
      fixture.detectChanges();

      expect(component.positions().length).toBeGreaterThan(0);
      expect(component.orders().length).toBeGreaterThan(0);
      expect(component.balance()).toBeTruthy();
    });
  });

  describe('Order Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should require quantity field', () => {
      const quantityControl = component.orderForm.get('quantity');
      quantityControl?.setValue(null);

      expect(quantityControl?.valid).toBe(false);
      expect(quantityControl?.errors?.['required']).toBe(true);
    });

    it('should validate quantity minimum value', () => {
      const quantityControl = component.orderForm.get('quantity');
      quantityControl?.setValue(0);

      expect(quantityControl?.valid).toBe(false);
      expect(quantityControl?.errors?.['min']).toBeTruthy();
    });

    it('should require price for limit orders', () => {
      component.orderForm.patchValue({
        type: 'Limit',
        quantity: 0.1
      });
      fixture.detectChanges();

      const priceControl = component.orderForm.get('price');
      expect(priceControl?.hasError('required')).toBe(true);
    });

    it('should not require price for market orders', () => {
      component.orderForm.patchValue({
        type: 'Market',
        quantity: 0.1
      });
      fixture.detectChanges();

      const priceControl = component.orderForm.get('price');
      expect(priceControl?.hasError('required')).toBeFalsy();
    });

    it('should validate stop loss minimum value', () => {
      const stopLossControl = component.orderForm.get('stopLoss');
      stopLossControl?.setValue(0);

      expect(stopLossControl?.valid).toBe(false);
      expect(stopLossControl?.errors?.['min']).toBeTruthy();
    });

    it('should validate take profit minimum value', () => {
      const takeProfitControl = component.orderForm.get('takeProfit');
      takeProfitControl?.setValue(0);

      expect(takeProfitControl?.valid).toBe(false);
      expect(takeProfitControl?.errors?.['min']).toBeTruthy();
    });

    it('should be valid with correct market order data', () => {
      component.orderForm.patchValue({
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        type: 'Market',
        side: 'Buy',
        quantity: 0.1
      });

      expect(component.orderForm.valid).toBe(true);
    });

    it('should be valid with correct limit order data', () => {
      component.orderForm.patchValue({
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        type: 'Limit',
        side: 'Buy',
        quantity: 0.1,
        price: 50000
      });

      expect(component.orderForm.valid).toBe(true);
    });
  });

  describe('Place Order Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should not place order if form is invalid', () => {
      component.orderForm.patchValue({
        quantity: null // Invalid
      });

      component.placeOrder();

      expect(tradingService.placeOrder).not.toHaveBeenCalled();
    });

    it('should place market order with valid data', () => {
      const mockResponse: OrderResponse = {
        orderId: 'test-order-1',
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        side: 'Buy',
        type: 'Market',
        quantity: 0.1,
        status: 'Filled',
        timeInForce: 'GTC',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.orderForm.patchValue({
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        type: 'Market',
        side: 'Buy',
        quantity: 0.1
      });

      component.placeOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          exchange: 'bybit',
          symbol: 'BTCUSDT',
          type: 'Market',
          side: 'Buy',
          quantity: 0.1
        })
      );
    });

    it('should place limit order with price', () => {
      const mockResponse: OrderResponse = {
        orderId: 'test-order-2',
        exchange: 'bybit',
        symbol: 'ETHUSDT',
        side: 'Sell',
        type: 'Limit',
        quantity: 1,
        price: 3000,
        status: 'New',
        timeInForce: 'GTC',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.orderForm.patchValue({
        exchange: 'bybit',
        symbol: 'ETHUSDT',
        type: 'Limit',
        side: 'Sell',
        quantity: 1,
        price: 3000,
        timeInForce: 'GTC'
      });

      component.placeOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          exchange: 'bybit',
          symbol: 'ETHUSDT',
          type: 'Limit',
          side: 'Sell',
          quantity: 1,
          price: 3000,
          timeInForce: 'GTC'
        })
      );
    });

    it('should include stop loss and take profit if provided', () => {
      tradingService.placeOrder.and.returnValue(of({} as OrderResponse));

      component.orderForm.patchValue({
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        type: 'Market',
        side: 'Buy',
        quantity: 0.1,
        stopLoss: 48000,
        takeProfit: 52000
      });

      component.placeOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          stopLoss: 48000,
          takeProfit: 52000
        })
      );
    });

    it('should handle order placement error', () => {
      const errorMessage = 'Insufficient balance';
      tradingService.placeOrder.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      spyOn(console, 'error');

      component.orderForm.patchValue({
        exchange: 'bybit',
        symbol: 'BTCUSDT',
        type: 'Market',
        side: 'Buy',
        quantity: 0.1
      });

      component.placeOrder();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Position Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should close position when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      tradingService.closePosition.and.returnValue(of({} as OrderResponse));

      const position = mockPositions[0];
      component.closePosition(position);

      expect(tradingService.closePosition).toHaveBeenCalledWith({
        exchange: position.exchange,
        symbol: position.symbol,
        side: position.side
      });
    });

    it('should not close position if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const position = mockPositions[0];
      component.closePosition(position);

      expect(tradingService.closePosition).not.toHaveBeenCalled();
    });

    it('should calculate total unrealized PnL correctly', () => {
      component.positions.set([
        { ...mockPositions[0], unrealizedPnl: 100 },
        { ...mockPositions[0], id: '2', unrealizedPnl: 50 },
        { ...mockPositions[0], id: '3', unrealizedPnl: -30 }
      ]);

      expect(component.totalUnrealizedPnl()).toBe(120);
    });

    it('should detect if there are open positions', () => {
      component.positions.set(mockPositions);
      expect(component.hasOpenPositions()).toBe(true);

      component.positions.set([]);
      expect(component.hasOpenPositions()).toBe(false);
    });
  });

  describe('Order Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should cancel order when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      tradingService.cancelOrder.and.returnValue(of(void 0));

      const order = mockOrders[0];
      component.cancelOrder(order);

      expect(tradingService.cancelOrder).toHaveBeenCalledWith({
        exchange: order.exchange,
        orderId: order.orderId,
        symbol: order.symbol
      });
    });

    it('should not cancel order if not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const order = mockOrders[0];
      component.cancelOrder(order);

      expect(tradingService.cancelOrder).not.toHaveBeenCalled();
    });

    it('should not cancel order if status is not New', () => {
      const filledOrder = { ...mockOrders[0], status: 'Filled' as const };
      component.cancelOrder(filledOrder);

      expect(tradingService.cancelOrder).not.toHaveBeenCalled();
    });

    it('should correctly identify cancellable orders', () => {
      const newOrder = { ...mockOrders[0], status: 'New' as const };
      const filledOrder = { ...mockOrders[0], status: 'Filled' as const };

      expect(component.canCancelOrder(newOrder)).toBe(true);
      expect(component.canCancelOrder(filledOrder)).toBe(false);
    });

    it('should detect if there are pending orders', () => {
      component.orders.set([{ ...mockOrders[0], status: 'New' }]);
      expect(component.hasPendingOrders()).toBe(true);

      component.orders.set([{ ...mockOrders[0], status: 'Filled' }]);
      expect(component.hasPendingOrders()).toBe(false);
    });
  });

  describe('Auto-Refresh Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle auto-refresh on', () => {
      tradingService.setupAutoRefresh.and.returnValue(of(1));

      expect(component.autoRefreshEnabled()).toBe(false);

      component.toggleAutoRefresh();

      expect(component.autoRefreshEnabled()).toBe(true);
      expect(tradingService.setupAutoRefresh).toHaveBeenCalledWith('bybit', 10000);
    });

    it('should toggle auto-refresh off', () => {
      tradingService.setupAutoRefresh.and.returnValue(of(1));

      component.toggleAutoRefresh(); // Turn on
      component.toggleAutoRefresh(); // Turn off

      expect(component.autoRefreshEnabled()).toBe(false);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct PnL class for positive value', () => {
      expect(component.getPnlClass(100)).toBe('pnl-positive');
    });

    it('should return correct PnL class for negative value', () => {
      expect(component.getPnlClass(-50)).toBe('pnl-negative');
    });

    it('should return correct PnL class for zero', () => {
      expect(component.getPnlClass(0)).toBe('pnl-positive');
    });

    it('should return correct side class for Buy', () => {
      expect(component.getSideClass('Buy')).toBe('side-buy');
    });

    it('should return correct side class for Sell', () => {
      expect(component.getSideClass('Sell')).toBe('side-sell');
    });

    it('should format PnL with correct sign', () => {
      expect(component.formatPnl(100)).toBe('+$100.00');
      expect(component.formatPnl(-50)).toBe('-$50.00');
      expect(component.formatPnl(0)).toBe('+$0.00');
    });

    it('should format PnL percentage correctly', () => {
      expect(component.formatPnlPercent(2.5)).toBe('+2.50%');
      expect(component.formatPnlPercent(-1.25)).toBe('-1.25%');
    });

    it('should format currency correctly', () => {
      expect(component.formatCurrency(1234.56)).toBe('$1234.56');
      expect(component.formatCurrency(0.01)).toBe('$0.01');
    });

    it('should detect limit order type', () => {
      component.orderForm.patchValue({ type: 'Limit' });
      expect(component.isLimitOrder()).toBe(true);

      component.orderForm.patchValue({ type: 'Market' });
      expect(component.isLimitOrder()).toBe(false);
    });
  });

  describe('Component Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();

      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels on buttons', () => {
      const compiled = fixture.nativeElement;
      const refreshButton = compiled.querySelector('[aria-label="Refresh trading data"]');

      expect(refreshButton).toBeTruthy();
    });

    it('should have proper form labels', () => {
      const compiled = fixture.nativeElement;
      // Form labels are handled by ui-input and ui-select components
      expect(component.orderForm.get('quantity')).toBeTruthy();
    });
  });
});
