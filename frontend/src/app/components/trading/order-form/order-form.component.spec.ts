import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { OrderFormComponent } from './order-form.component';
import { ManualTradingService } from '../../../services/manual-trading.service';
import { BybitService } from '../../../services/bybit.service';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { TabsComponent } from '../../ui/tabs/tabs.component';
import { OrderRequest, Balance } from '../../../models/trading.model';

describe('OrderFormComponent', () => {
  let component: OrderFormComponent;
  let fixture: ComponentFixture<OrderFormComponent>;
  let tradingService: jasmine.SpyObj<ManualTradingService>;
  let bybitService: jasmine.SpyObj<BybitService>;

  const mockBalance: Balance = {
    exchange: 'bybit',
    totalBalance: 10000,
    availableBalance: 8000,
    usedMargin: 2000,
    unrealizedPnl: 100,
    walletBalance: 9900,
    currency: 'USDT',
    updatedAt: new Date()
  };

  beforeEach(async () => {
    const tradingServiceSpy = jasmine.createSpyObj('ManualTradingService', [
      'placeOrder',
      'getAccountBalance'
    ], {
      isPlacingOrder: jasmine.createSpy('isPlacingOrder').and.returnValue(false),
      isLoadingBalance: jasmine.createSpy('isLoadingBalance').and.returnValue(false),
      balance$: of(mockBalance)
    });

    const bybitServiceSpy = jasmine.createSpyObj('BybitService', [
      'subscribeToRealtimeTicker',
      'unsubscribeFromRealtimeTicker'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        OrderFormComponent,
        ReactiveFormsModule,
        ButtonComponent,
        InputComponent,
        SelectComponent,
        TabsComponent
      ],
      providers: [
        { provide: ManualTradingService, useValue: tradingServiceSpy },
        { provide: BybitService, useValue: bybitServiceSpy }
      ]
    }).compileComponents();

    tradingService = TestBed.inject(ManualTradingService) as jasmine.SpyObj<ManualTradingService>;
    bybitService = TestBed.inject(BybitService) as jasmine.SpyObj<BybitService>;

    tradingService.getAccountBalance.and.returnValue(of(mockBalance));
    bybitService.subscribeToRealtimeTicker.and.returnValue(of({ lastPrice: '99866.7' }));

    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.marginMode()).toBe('Cross');
      expect(component.leverage()).toBe(10);
      expect(component.orderType()).toBe('Limit');
      expect(component.quantityUnit()).toBe('BTC');
      expect(component.quantityPercentage()).toBe(0);
      expect(component.tpslEnabled()).toBe(false);
      expect(component.tpslMode()).toBe('Basic');
    });

    it('should create order form with correct controls', () => {
      expect(component.orderForm.get('price')).toBeTruthy();
      expect(component.orderForm.get('quantity')).toBeTruthy();
      expect(component.orderForm.get('takeProfit')).toBeTruthy();
      expect(component.orderForm.get('stopLoss')).toBeTruthy();
      expect(component.orderForm.get('postOnly')).toBeTruthy();
      expect(component.orderForm.get('reduceOnly')).toBeTruthy();
      expect(component.orderForm.get('timeInForce')).toBeTruthy();
    });

    it('should load account balance on init', () => {
      expect(tradingService.getAccountBalance).toHaveBeenCalledWith('bybit');
      expect(component.balance()).toEqual(mockBalance);
    });

    it('should subscribe to market data on init', () => {
      expect(bybitService.subscribeToRealtimeTicker).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should unsubscribe from market data on destroy', () => {
      component.ngOnDestroy();
      expect(bybitService.unsubscribeFromRealtimeTicker).toHaveBeenCalledWith('BTCUSDT');
    });
  });

  describe('Form Validation', () => {
    it('should validate required price for limit orders', () => {
      component.orderType.set('Limit');
      const priceControl = component.orderForm.get('price');

      expect(priceControl?.hasError('required')).toBe(true);

      priceControl?.setValue(50000);
      expect(priceControl?.hasError('required')).toBe(false);
    });

    it('should not require price for market orders', () => {
      component.orderType.set('Market');
      const priceControl = component.orderForm.get('price');

      expect(priceControl?.hasError('required')).toBe(false);
    });

    it('should validate minimum price value', () => {
      const priceControl = component.orderForm.get('price');
      priceControl?.setValue(-100);

      expect(priceControl?.hasError('min')).toBe(true);

      priceControl?.setValue(50000);
      expect(priceControl?.hasError('min')).toBe(false);
    });

    it('should validate required quantity', () => {
      const quantityControl = component.orderForm.get('quantity');

      expect(quantityControl?.hasError('required')).toBe(true);

      quantityControl?.setValue(0.5);
      expect(quantityControl?.hasError('required')).toBe(false);
    });

    it('should validate minimum quantity value', () => {
      const quantityControl = component.orderForm.get('quantity');
      quantityControl?.setValue(-1);

      expect(quantityControl?.hasError('min')).toBe(true);

      quantityControl?.setValue(0.5);
      expect(quantityControl?.hasError('min')).toBe(false);
    });
  });

  describe('Margin Mode & Leverage', () => {
    it('should change margin mode', () => {
      component.onMarginModeChange('Isolated');
      expect(component.marginMode()).toBe('Isolated');
    });

    it('should change leverage', () => {
      component.onLeverageChange(25);
      expect(component.leverage()).toBe(25);
    });

    it('should have correct leverage options', () => {
      expect(component.leverageOptions.length).toBe(125);
      expect(component.leverageOptions[0].value).toBe(1);
      expect(component.leverageOptions[124].value).toBe(125);
    });
  });

  describe('Order Type', () => {
    it('should change order type', () => {
      component.onOrderTypeChange('Market');
      expect(component.orderType()).toBe('Market');
    });

    it('should update price validation when order type changes', () => {
      const priceControl = component.orderForm.get('price');

      component.onOrderTypeChange('Limit');
      expect(priceControl?.hasError('required')).toBe(true);

      component.onOrderTypeChange('Market');
      expect(priceControl?.hasError('required')).toBe(false);
    });

    it('should have all order type tabs', () => {
      expect(component.orderTypeTabs.length).toBe(3);
      expect(component.orderTypeTabs[0].id).toBe('Limit');
      expect(component.orderTypeTabs[1].id).toBe('Market');
      expect(component.orderTypeTabs[2].id).toBe('Conditional');
    });
  });

  describe('Price Input', () => {
    it('should fill price with last price', () => {
      component.lastPrice.set(99866.7);
      component.fillLastPrice();

      expect(component.orderForm.get('price')?.value).toBe(99866.7);
    });

    it('should update last price from ticker', () => {
      bybitService.subscribeToRealtimeTicker.and.returnValue(
        of({ lastPrice: '100000.5' })
      );

      component.ngOnInit();

      expect(component.lastPrice()).toBe(100000.5);
    });
  });

  describe('Quantity Input & Slider', () => {
    it('should change quantity unit', () => {
      component.onQuantityUnitChange('USDT');
      expect(component.quantityUnit()).toBe('USDT');
    });

    it('should convert quantity when unit changes from BTC to USDT', () => {
      component.orderForm.patchValue({ price: 100000, quantity: 0.5 });
      component.onQuantityUnitChange('USDT');

      expect(component.orderForm.get('quantity')?.value).toBe(50000);
    });

    it('should convert quantity when unit changes from USDT to BTC', () => {
      component.quantityUnit.set('USDT');
      component.orderForm.patchValue({ price: 100000, quantity: 50000 });
      component.onQuantityUnitChange('BTC');

      expect(component.orderForm.get('quantity')?.value).toBe(0.5);
    });

    it('should update quantity percentage', () => {
      const event = {
        target: { value: '50' } as HTMLInputElement
      } as Event;

      component.onQuantityPercentageChange(event);

      expect(component.quantityPercentage()).toBe(50);
    });

    it('should calculate quantity from percentage', () => {
      component.balance.set(mockBalance);
      component.leverage.set(10);
      component.orderForm.patchValue({ price: 100000 });

      const event = {
        target: { value: '100' } as HTMLInputElement
      } as Event;

      component.onQuantityPercentageChange(event);

      // Available: 8000, Leverage: 10x, Total: 80000, Price: 100000
      // Expected quantity: 80000 / 100000 = 0.8 BTC
      expect(component.orderForm.get('quantity')?.value).toBeCloseTo(0.8, 2);
    });
  });

  describe('Computed Values', () => {
    it('should calculate order value correctly', () => {
      component.orderForm.patchValue({ price: 100000, quantity: 0.5 });
      expect(component.orderValue()).toBe(50000);
    });

    it('should calculate order cost correctly', () => {
      component.orderForm.patchValue({ price: 100000, quantity: 0.5 });
      component.leverage.set(10);
      expect(component.orderCost()).toBe(5000);
    });

    it('should calculate liquidation price for long', () => {
      component.orderForm.patchValue({ price: 100000 });
      component.leverage.set(10);

      const liq = component.liquidationPrice();
      expect(liq.long).toBe(90000); // 100000 - (100000 / 10)
    });

    it('should calculate liquidation price for short', () => {
      component.orderForm.patchValue({ price: 100000 });
      component.leverage.set(10);

      const liq = component.liquidationPrice();
      expect(liq.short).toBe(110000); // 100000 + (100000 / 10)
    });

    it('should compute available balance from balance signal', () => {
      component.balance.set(mockBalance);
      expect(component.availableBalance()).toBe(8000);
    });

    it('should compute margin balance from balance signal', () => {
      component.balance.set(mockBalance);
      expect(component.marginBalance()).toBe(9900);
    });
  });

  describe('TP/SL Configuration', () => {
    it('should toggle TP/SL enabled state', () => {
      expect(component.tpslEnabled()).toBe(false);

      component.toggleTPSL();
      expect(component.tpslEnabled()).toBe(true);

      component.toggleTPSL();
      expect(component.tpslEnabled()).toBe(false);
    });

    it('should clear TP/SL values when disabled', () => {
      component.orderForm.patchValue({ takeProfit: 110000, stopLoss: 90000 });
      component.tpslEnabled.set(true);

      component.toggleTPSL();

      expect(component.orderForm.get('takeProfit')?.value).toBeNull();
      expect(component.orderForm.get('stopLoss')?.value).toBeNull();
    });

    it('should toggle TP/SL mode', () => {
      expect(component.tpslMode()).toBe('Basic');

      component.toggleTPSLMode();
      expect(component.tpslMode()).toBe('Advanced');

      component.toggleTPSLMode();
      expect(component.tpslMode()).toBe('Basic');
    });

    it('should fill take profit with last price', () => {
      component.lastPrice.set(100000);
      component.fillTPSLWithLast('takeProfit');

      expect(component.orderForm.get('takeProfit')?.value).toBe(100000);
    });

    it('should fill stop loss with last price', () => {
      component.lastPrice.set(100000);
      component.fillTPSLWithLast('stopLoss');

      expect(component.orderForm.get('stopLoss')?.value).toBe(100000);
    });
  });

  describe('Place Order', () => {
    beforeEach(() => {
      component.orderForm.patchValue({
        price: 100000,
        quantity: 0.5,
        timeInForce: 'GTC',
        postOnly: false,
        reduceOnly: false
      });
    });

    it('should place long order successfully', () => {
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeLongOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          exchange: 'bybit',
          symbol: 'BTCUSDT',
          side: 'Buy',
          type: 'Limit',
          quantity: 0.5,
          price: 100000,
          leverage: 10
        })
      );
    });

    it('should place short order successfully', () => {
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeShortOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          exchange: 'bybit',
          symbol: 'BTCUSDT',
          side: 'Sell',
          type: 'Limit'
        })
      );
    });

    it('should place market order without price', () => {
      component.orderType.set('Market');
      component.orderForm.patchValue({ price: null });
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeLongOrder();

      const callArgs = tradingService.placeOrder.calls.mostRecent().args[0];
      expect(callArgs.type).toBe('Market');
      expect(callArgs.price).toBeUndefined();
    });

    it('should include TP/SL when enabled', () => {
      component.tpslEnabled.set(true);
      component.orderForm.patchValue({ takeProfit: 110000, stopLoss: 90000 });
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeLongOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          takeProfit: 110000,
          stopLoss: 90000
        })
      );
    });

    it('should not include TP/SL when disabled', () => {
      component.tpslEnabled.set(false);
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeLongOrder();

      const callArgs = tradingService.placeOrder.calls.mostRecent().args[0];
      expect(callArgs.takeProfit).toBeUndefined();
      expect(callArgs.stopLoss).toBeUndefined();
    });

    it('should convert USDT quantity to BTC before placing order', () => {
      component.quantityUnit.set('USDT');
      component.orderForm.patchValue({ price: 100000, quantity: 50000 });
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeLongOrder();

      expect(tradingService.placeOrder).toHaveBeenCalledWith(
        jasmine.objectContaining({
          quantity: 0.5 // 50000 USDT / 100000 price = 0.5 BTC
        })
      );
    });

    it('should not place order if form is invalid', () => {
      component.orderForm.patchValue({ quantity: null });

      component.placeLongOrder();

      expect(tradingService.placeOrder).not.toHaveBeenCalled();
      expect(component.orderForm.get('quantity')?.touched).toBe(true);
    });

    it('should reset form after successful order', () => {
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));

      component.placeLongOrder();

      expect(component.orderForm.get('price')?.value).toBeNull();
      expect(component.orderForm.get('quantity')?.value).toBeNull();
      expect(component.quantityPercentage()).toBe(0);
    });

    it('should refresh balance after successful order', () => {
      const mockResponse: any = { orderId: '123', status: 'New' };
      tradingService.placeOrder.and.returnValue(of(mockResponse));
      tradingService.getAccountBalance.calls.reset();

      component.placeLongOrder();

      expect(tradingService.getAccountBalance).toHaveBeenCalled();
    });

    it('should handle order placement error', () => {
      const error = new Error('Insufficient balance');
      tradingService.placeOrder.and.returnValue(throwError(() => error));
      spyOn(window, 'alert');

      component.placeLongOrder();

      expect(window.alert).toHaveBeenCalledWith(
        'Failed to place order: Insufficient balance'
      );
    });
  });

  describe('Error Messages', () => {
    it('should return required error message', () => {
      const control = component.orderForm.get('quantity');
      control?.setErrors({ required: true });
      control?.markAsTouched();

      expect(component.getErrorMessage('quantity')).toBe('This field is required');
    });

    it('should return minimum value error message', () => {
      const control = component.orderForm.get('quantity');
      control?.setErrors({ min: true });
      control?.markAsTouched();

      expect(component.getErrorMessage('quantity')).toBe('Value must be greater than 0');
    });

    it('should check if control has error', () => {
      const control = component.orderForm.get('quantity');
      control?.setErrors({ required: true });

      expect(component.hasError('quantity')).toBe(false);

      control?.markAsTouched();
      expect(component.hasError('quantity')).toBe(true);
    });
  });

  describe('Navigation & Dialogs', () => {
    it('should navigate to deposit', () => {
      spyOn(console, 'log');
      component.navigateToDeposit();
      expect(console.log).toHaveBeenCalledWith('Navigate to deposit');
    });

    it('should navigate to convert', () => {
      spyOn(console, 'log');
      component.navigateToConvert();
      expect(console.log).toHaveBeenCalledWith('Navigate to convert');
    });

    it('should navigate to transfer', () => {
      spyOn(console, 'log');
      component.navigateToTransfer();
      expect(console.log).toHaveBeenCalledWith('Navigate to transfer');
    });

    it('should open fee rate dialog', () => {
      spyOn(console, 'log');
      component.openFeeRateDialog();
      expect(console.log).toHaveBeenCalledWith('Open fee rate dialog');
    });

    it('should open calculator dialog', () => {
      spyOn(console, 'log');
      component.openCalculatorDialog();
      expect(console.log).toHaveBeenCalledWith('Open calculator dialog');
    });

    it('should show liquidation price alert', () => {
      component.orderForm.patchValue({ price: 100000 });
      component.leverage.set(10);
      spyOn(window, 'alert');

      component.calculateLiquidationPrice();

      expect(window.alert).toHaveBeenCalledWith(
        'Long Liquidation: 90000.00 USDT\nShort Liquidation: 110000.00 USDT'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for icon buttons', () => {
      const compiled = fixture.nativeElement;
      const gridButton = compiled.querySelector('[aria-label="Grid settings"]');
      const notificationButton = compiled.querySelector('[aria-label="Notifications"]');
      const settingsButton = compiled.querySelector('[aria-label="Settings"]');

      expect(gridButton).toBeTruthy();
      expect(notificationButton).toBeTruthy();
      expect(settingsButton).toBeTruthy();
    });

    it('should have proper ARIA label for quantity slider', () => {
      const compiled = fixture.nativeElement;
      const slider = compiled.querySelector('[aria-label="Quantity percentage"]');

      expect(slider).toBeTruthy();
    });

    it('should support keyboard navigation for checkboxes', () => {
      const compiled = fixture.nativeElement;
      const checkbox = compiled.querySelector('input[type="checkbox"]');

      expect(checkbox).toBeTruthy();
      expect(checkbox.getAttribute('type')).toBe('checkbox');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero balance', () => {
      const zeroBalance: Balance = { ...mockBalance, availableBalance: 0 };
      component.balance.set(zeroBalance);

      expect(component.availableBalance()).toBe(0);
    });

    it('should handle null balance', () => {
      component.balance.set(null);

      expect(component.availableBalance()).toBe(0);
      expect(component.marginBalance()).toBe(0);
    });

    it('should handle extreme leverage values', () => {
      component.leverage.set(125);
      component.orderForm.patchValue({ price: 100000 });

      const liq = component.liquidationPrice();
      expect(liq.long).toBeCloseTo(99200, 0); // 100000 - (100000 / 125)
    });

    it('should round quantity to correct decimals for BTC', () => {
      component.quantityUnit.set('BTC');
      const rounded = (component as any).roundQuantity(0.1234567);
      expect(rounded).toBe(0.123457);
    });

    it('should round quantity to correct decimals for USDT', () => {
      component.quantityUnit.set('USDT');
      const rounded = (component as any).roundQuantity(12345.6789);
      expect(rounded).toBe(12345.68);
    });

    it('should handle WebSocket connection errors gracefully', () => {
      bybitService.subscribeToRealtimeTicker.and.returnValue(
        throwError(() => new Error('WebSocket connection failed'))
      );
      spyOn(console, 'error');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
    });
  });
});
