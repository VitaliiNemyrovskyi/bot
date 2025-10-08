import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// UI Components
import { ButtonComponent } from '../../ui/button/button.component';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent, SelectOption } from '../../ui/select/select.component';
import { TabsComponent, Tab } from '../../ui/tabs/tabs.component';

// Services
import { ManualTradingService } from '../../../services/manual-trading.service';
import { BybitService } from '../../../services/bybit.service';

// Models
import { OrderRequest, OrderSide, OrderType, TimeInForce, Balance } from '../../../models/trading.model';

/**
 * Margin mode type
 */
export type MarginMode = 'Cross' | 'Isolated';

/**
 * Order type tabs
 */
export type OrderTypeTab = 'Limit' | 'Market' | 'Conditional';

/**
 * TP/SL mode
 */
export type TPSLMode = 'Basic' | 'Advanced';

/**
 * Quantity unit type
 */
export type QuantityUnit = 'BTC' | 'USDT';

/**
 * Order form state interface
 */
export interface OrderFormState {
  marginMode: MarginMode;
  leverage: number;
  orderType: OrderTypeTab;
  price: number | null;
  quantity: number | null;
  quantityUnit: QuantityUnit;
  quantityPercentage: number;
  tpslEnabled: boolean;
  tpslMode: TPSLMode;
  takeProfit: number | null;
  stopLoss: number | null;
  postOnly: boolean;
  reduceOnly: boolean;
  timeInForce: TimeInForce;
}

/**
 * Trading Order Form Component
 *
 * Professional trading order form matching Bybit futures trading interface.
 * Features comprehensive order management, TP/SL configuration, margin control,
 * and account balance display.
 *
 * Key Features:
 * - Margin mode & leverage selection (1x-125x)
 * - Order type tabs: Limit, Market, Conditional
 * - Dynamic price input with "Last" quick-fill
 * - Quantity input with BTC/USDT unit selector
 * - Visual percentage slider (0-100%)
 * - TP/SL configuration with Basic/Advanced modes
 * - Post-Only & Reduce-Only options
 * - Time-in-Force settings
 * - Long/Short action buttons
 * - Unified Trading Account section with margin info
 * - Full theme support (dark/light modes)
 * - Real-time balance updates
 *
 * @example
 * ```html
 * <app-order-form></app-order-form>
 * ```
 */
@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TabsComponent
  ],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Inputs
  @Input() selectedSymbol: string = 'BTCUSDT';
  @Input() currentPrice: number = 0;
  @Input() set balance(value: Balance | null) {
    this._balance.set(value);
  }
  get balance(): Balance | null {
    return this._balance();
  }

  // Outputs
  @Output() orderPlaced = new EventEmitter<any>();

  // Form
  orderForm: FormGroup;

  // Signals for reactive state management
  private _marginMode = signal<MarginMode>('Cross');
  private _leverage = signal<number>(10);
  private _orderType = signal<OrderTypeTab>('Limit');
  private _quantityUnit = signal<QuantityUnit>('BTC');
  private _quantityPercentage = signal<number>(0);
  private _tpslEnabled = signal<boolean>(false);
  private _tpslMode = signal<TPSLMode>('Basic');

  // Getters and setters for ngModel binding
  get marginMode() { return this._marginMode(); }
  set marginMode(value: MarginMode) { this._marginMode.set(value); }

  get leverage() { return this._leverage(); }
  set leverage(value: number) { this._leverage.set(value); }

  get orderType() { return this._orderType(); }
  set orderType(value: OrderTypeTab) { this._orderType.set(value); }

  get quantityUnit() { return this._quantityUnit(); }
  set quantityUnit(value: QuantityUnit) { this._quantityUnit.set(value); }

  get quantityPercentage() { return this._quantityPercentage(); }
  set quantityPercentage(value: number) { this._quantityPercentage.set(value); }

  get tpslEnabled() { return this._tpslEnabled(); }
  set tpslEnabled(value: boolean) { this._tpslEnabled.set(value); }

  get tpslMode() { return this._tpslMode(); }
  set tpslMode(value: TPSLMode) { this._tpslMode.set(value); }

  // Market data signals
  lastPrice = signal<number>(99866.7);
  private _balance = signal<Balance | null>(null);

  // Computed values
  orderValue = computed(() => {
    const price = this.orderForm?.get('price')?.value || this.lastPrice();
    const quantity = this.orderForm?.get('quantity')?.value || 0;
    return price * quantity;
  });

  orderCost = computed(() => {
    const value = this.orderValue();
    const lev = this._leverage();
    return value / lev;
  });

  liquidationPrice = computed(() => {
    const price = this.orderForm?.get('price')?.value || this.lastPrice();
    const lev = this._leverage();
    const marginMode = this._marginMode();

    // Simplified liquidation price calculation
    // For long: liq = entry - (entry / leverage)
    // For short: liq = entry + (entry / leverage)
    const marginRatio = 1 / lev;
    return {
      long: price - (price * marginRatio),
      short: price + (price * marginRatio)
    };
  });

  availableBalance = computed(() => {
    return this._balance()?.availableBalance || 0;
  });

  marginBalance = computed(() => {
    return this._balance()?.walletBalance || 0;
  });

  // Dropdown options
  marginModeOptions: SelectOption[] = [
    { value: 'Cross', label: 'Cross' },
    { value: 'Isolated', label: 'Isolated' }
  ];

  leverageOptions: SelectOption[] = Array.from({ length: 125 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}x`
  }));

  quantityUnitOptions: SelectOption[] = [
    { value: 'BTC', label: 'BTC' },
    { value: 'USDT', label: 'USDT' }
  ];

  timeInForceOptions: SelectOption[] = [
    { value: 'GTC', label: 'Good-Till-Canceled' },
    { value: 'IOC', label: 'IOC' },
    { value: 'FOK', label: 'FOK' }
  ];

  lastPriceOptions: SelectOption[] = [
    { value: 'last', label: 'Last' },
    { value: 'mark', label: 'Mark' },
    { value: 'index', label: 'Index' }
  ];

  // Order type tabs
  orderTypeTabs: Tab[] = [
    { id: 'Limit', label: 'Limit' },
    { id: 'Market', label: 'Market' },
    { id: 'Conditional', label: 'Conditional' }
  ];

  // Loading states from service
  isPlacingOrder = this.tradingService.isPlacingOrder;
  isLoadingBalance = this.tradingService.isLoadingBalance;

  constructor(
    private fb: FormBuilder,
    private tradingService: ManualTradingService,
    private bybitService: BybitService
  ) {
    // Initialize form
    this.orderForm = this.fb.group({
      price: [null, [Validators.required, Validators.min(0)]],
      quantity: [null, [Validators.required, Validators.min(0)]],
      takeProfit: [null, [Validators.min(0)]],
      stopLoss: [null, [Validators.min(0)]],
      postOnly: [false],
      reduceOnly: [false],
      timeInForce: ['GTC']
    });

    // Effect to update form validators based on order type
    effect(() => {
      const type = this._orderType();
      const priceControl = this.orderForm.get('price');

      if (type === 'Market') {
        priceControl?.clearValidators();
        priceControl?.setValue(null);
      } else {
        priceControl?.setValidators([Validators.required, Validators.min(0)]);
      }
      priceControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Load initial data
    this.loadBalance();
    this.subscribeToMarketData();

    // Subscribe to balance updates
    this.tradingService.balance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(balance => {
        if (balance) {
          this._balance.set(balance);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.bybitService.unsubscribeFromRealtimeTicker('BTCUSDT');
  }

  /**
   * Load account balance
   */
  private loadBalance(): void {
    this.tradingService.getAccountBalance('bybit')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance) => {
          this._balance.set(balance);
        },
        error: (error) => {
          console.error('Failed to load balance:', error);
        }
      });
  }

  /**
   * Subscribe to real-time market data
   */
  private subscribeToMarketData(): void {
    this.bybitService.subscribeToRealtimeTicker('BTCUSDT')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ticker) => {
          if (ticker?.lastPrice) {
            this.lastPrice.set(parseFloat(ticker.lastPrice));
          }
        },
        error: (error) => {
          console.error('Failed to subscribe to ticker:', error);
        }
      });
  }

  /**
   * Handle margin mode change
   */
  onMarginModeChange(mode: MarginMode): void {
    this._marginMode.set(mode);
  }

  /**
   * Handle leverage change
   */
  onLeverageChange(lev: number): void {
    this._leverage.set(lev);
  }

  /**
   * Handle order type tab change
   */
  onOrderTypeChange(type: string): void {
    this._orderType.set(type as OrderTypeTab);
  }

  /**
   * Handle quantity unit change
   */
  onQuantityUnitChange(unit: QuantityUnit): void {
    this._quantityUnit.set(unit);
    // Convert quantity when unit changes
    this.convertQuantity(unit);
  }

  /**
   * Fill price with last price
   */
  fillLastPrice(): void {
    this.orderForm.patchValue({
      price: this.lastPrice()
    });
  }

  /**
   * Handle quantity percentage slider change
   */
  onQuantityPercentageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const percentage = parseInt(input.value, 10);
    this._quantityPercentage.set(percentage);

    // Calculate quantity based on percentage and available balance
    this.calculateQuantityFromPercentage(percentage);
  }

  /**
   * Calculate quantity from percentage
   */
  private calculateQuantityFromPercentage(percentage: number): void {
    const available = this.availableBalance();
    const price = this.orderForm.get('price')?.value || this.lastPrice();
    const lev = this._leverage();

    if (available && price) {
      const totalValue = (available * percentage / 100) * lev;
      const quantity = totalValue / price;

      this.orderForm.patchValue({
        quantity: this.roundQuantity(quantity)
      });
    }
  }

  /**
   * Convert quantity when unit changes
   */
  private convertQuantity(newUnit: QuantityUnit): void {
    const currentQuantity = this.orderForm.get('quantity')?.value;
    const price = this.orderForm.get('price')?.value || this.lastPrice();

    if (currentQuantity && price) {
      let newQuantity: number;

      if (newUnit === 'USDT') {
        // Convert BTC to USDT
        newQuantity = currentQuantity * price;
      } else {
        // Convert USDT to BTC
        newQuantity = currentQuantity / price;
      }

      this.orderForm.patchValue({
        quantity: this.roundQuantity(newQuantity)
      });
    }
  }

  /**
   * Round quantity to appropriate decimal places
   */
  private roundQuantity(value: number): number {
    const unit = this._quantityUnit();
    const decimals = unit === 'BTC' ? 6 : 2;
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Toggle TP/SL enabled state
   */
  toggleTPSL(): void {
    this._tpslEnabled.update(enabled => !enabled);

    if (!this._tpslEnabled()) {
      this.orderForm.patchValue({
        takeProfit: null,
        stopLoss: null
      });
    }
  }

  /**
   * Toggle TP/SL mode
   */
  toggleTPSLMode(): void {
    this._tpslMode.update(mode => mode === 'Basic' ? 'Advanced' : 'Basic');
  }

  /**
   * Fill TP/SL with last price
   */
  fillTPSLWithLast(field: 'takeProfit' | 'stopLoss'): void {
    this.orderForm.patchValue({
      [field]: this.lastPrice()
    });
  }

  /**
   * Calculate liquidation price
   */
  calculateLiquidationPrice(): void {
    const liq = this.liquidationPrice();
    alert(`Long Liquidation: ${liq.long.toFixed(2)} USDT\nShort Liquidation: ${liq.short.toFixed(2)} USDT`);
  }

  /**
   * Place long order
   */
  placeLongOrder(): void {
    this.placeOrder('Buy');
  }

  /**
   * Place short order
   */
  placeShortOrder(): void {
    this.placeOrder('Sell');
  }

  /**
   * Place order
   */
  private placeOrder(side: OrderSide): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.value;
    const type = this._orderType();
    const unit = this._quantityUnit();

    // Calculate actual quantity in base currency (BTC)
    let quantity = formValue.quantity;
    if (unit === 'USDT') {
      const price = formValue.price || this.lastPrice();
      quantity = formValue.quantity / price;
    }

    const orderRequest = {
      symbol: this.selectedSymbol,
      side,
      type: type === 'Conditional' ? 'Limit' : type,
      quantity: this.roundQuantity(quantity),
      price: type === 'Market' ? undefined : formValue.price,
      takeProfit: this._tpslEnabled() ? formValue.takeProfit : undefined,
      stopLoss: this._tpslEnabled() ? formValue.stopLoss : undefined,
      timeInForce: formValue.timeInForce,
      postOnly: formValue.postOnly,
      reduceOnly: formValue.reduceOnly,
      leverage: this._leverage()
    };

    // Emit the order request to parent component
    this.orderPlaced.emit(orderRequest);
    this.resetForm();
  }

  /**
   * Reset form to default values
   */
  private resetForm(): void {
    this.orderForm.reset({
      price: null,
      quantity: null,
      takeProfit: null,
      stopLoss: null,
      postOnly: false,
      reduceOnly: false,
      timeInForce: 'GTC'
    });
    this._quantityPercentage.set(0);
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.orderForm.get(controlName);

    if (control?.hasError('required')) {
      return 'This field is required';
    }

    if (control?.hasError('min')) {
      return 'Value must be greater than 0';
    }

    return '';
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string): boolean {
    const control = this.orderForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Navigate to deposit
   */
  navigateToDeposit(): void {
    console.log('Navigate to deposit');
    // TODO: Implement navigation
  }

  /**
   * Navigate to convert
   */
  navigateToConvert(): void {
    console.log('Navigate to convert');
    // TODO: Implement navigation
  }

  /**
   * Navigate to transfer
   */
  navigateToTransfer(): void {
    console.log('Navigate to transfer');
    // TODO: Implement navigation
  }

  /**
   * Open fee rate dialog
   */
  openFeeRateDialog(): void {
    console.log('Open fee rate dialog');
    // TODO: Implement dialog
  }

  /**
   * Open calculator dialog
   */
  openCalculatorDialog(): void {
    console.log('Open calculator dialog');
    // TODO: Implement calculator
  }
}
