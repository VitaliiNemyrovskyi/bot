"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[15],{

/***/ 4607:
/*!***********************************************************************!*\
  !*** ./src/app/components/trading/order-form/order-form.component.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   OrderFormComponent: () => (/* binding */ OrderFormComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 819);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! rxjs */ 3900);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);
/* harmony import */ var _ui_select_select_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ui/select/select.component */ 8594);
/* harmony import */ var _ui_tabs_tabs_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../ui/tabs/tabs.component */ 9222);
/* harmony import */ var _services_manual_trading_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/manual-trading.service */ 6212);
/* harmony import */ var _services_bybit_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/bybit.service */ 6798);




// UI Components








const _c0 = () => ({
  standalone: true
});
function OrderFormComponent_div_31_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 27)(1, "label", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](2, "Price");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](3, "div", 100);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](4, "input", 101);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](5, "button", 102);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_div_31_Template_button_click_5_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r1.fillLastPrice());
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](6, " Last ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](7, "button", 103);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "svg", 66);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](9, "path", 104)(10, "path", 105);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "div", 106);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](13, "number");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("error", ctx_r1.hasError("price"));
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](8);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate"](_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](13, 3, ctx_r1.lastPrice(), "1.1-1"));
  }
}
function OrderFormComponent_div_86_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 107)(1, "div", 27)(2, "label", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, "Take Profit");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "div", 108);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](5, "input", 109);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "button", 110);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_div_86_Template_button_click_6_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r1.fillTPSLWithLast("takeProfit"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](7, " Last ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](8, "svg", 85);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](9, "path", 111);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](10, "div", 27)(11, "label", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](12, "Stop Loss");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](13, "div", 108);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](14, "input", 112);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](15, "button", 110);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_div_86_Template_button_click_15_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵrestoreView"](_r3);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵresetView"](ctx_r1.fillTPSLWithLast("stopLoss"));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](16, " Last ");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "svg", 85);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](18, "path", 111);
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()()();
  }
}
function OrderFormComponent_span_102_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "Long");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
}
function OrderFormComponent_span_103_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "span", 113);
  }
}
function OrderFormComponent_span_105_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](1, "Short");
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
  }
}
function OrderFormComponent_span_106_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](0, "span", 113);
  }
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
let OrderFormComponent = /*#__PURE__*/(() => {
  class OrderFormComponent {
    set balance(value) {
      this._balance.set(value);
    }
    get balance() {
      return this._balance();
    }
    // Getters and setters for ngModel binding
    get marginMode() {
      return this._marginMode();
    }
    set marginMode(value) {
      this._marginMode.set(value);
    }
    get leverage() {
      return this._leverage();
    }
    set leverage(value) {
      this._leverage.set(value);
    }
    get orderType() {
      return this._orderType();
    }
    set orderType(value) {
      this._orderType.set(value);
    }
    get quantityUnit() {
      return this._quantityUnit();
    }
    set quantityUnit(value) {
      this._quantityUnit.set(value);
    }
    get quantityPercentage() {
      return this._quantityPercentage();
    }
    set quantityPercentage(value) {
      this._quantityPercentage.set(value);
    }
    get tpslEnabled() {
      return this._tpslEnabled();
    }
    set tpslEnabled(value) {
      this._tpslEnabled.set(value);
    }
    get tpslMode() {
      return this._tpslMode();
    }
    set tpslMode(value) {
      this._tpslMode.set(value);
    }
    constructor(fb, tradingService, bybitService) {
      this.fb = fb;
      this.tradingService = tradingService;
      this.bybitService = bybitService;
      this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_6__.Subject();
      // Inputs
      this.selectedSymbol = 'BTCUSDT';
      this.currentPrice = 0;
      // Outputs
      this.orderPlaced = new _angular_core__WEBPACK_IMPORTED_MODULE_5__.EventEmitter();
      // Signals for reactive state management
      this._marginMode = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)('Cross');
      this._leverage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(10);
      this._orderType = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)('Limit');
      this._quantityUnit = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)('BTC');
      this._quantityPercentage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(0);
      this._tpslEnabled = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(false);
      this._tpslMode = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)('Basic');
      // Market data signals
      this.lastPrice = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(99866.7);
      this._balance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.signal)(null);
      // Computed values
      this.orderValue = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const price = this.orderForm?.get('price')?.value || this.lastPrice();
        const quantity = this.orderForm?.get('quantity')?.value || 0;
        return price * quantity;
      });
      this.orderCost = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const value = this.orderValue();
        const lev = this._leverage();
        return value / lev;
      });
      this.liquidationPrice = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        const price = this.orderForm?.get('price')?.value || this.lastPrice();
        const lev = this._leverage();
        const marginMode = this._marginMode();
        // Simplified liquidation price calculation
        // For long: liq = entry - (entry / leverage)
        // For short: liq = entry + (entry / leverage)
        const marginRatio = 1 / lev;
        return {
          long: price - price * marginRatio,
          short: price + price * marginRatio
        };
      });
      this.availableBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        return this._balance()?.availableBalance || 0;
      });
      this.marginBalance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.computed)(() => {
        return this._balance()?.walletBalance || 0;
      });
      // Dropdown options
      this.marginModeOptions = [{
        value: 'Cross',
        label: 'Cross'
      }, {
        value: 'Isolated',
        label: 'Isolated'
      }];
      this.leverageOptions = Array.from({
        length: 125
      }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}x`
      }));
      this.quantityUnitOptions = [{
        value: 'BTC',
        label: 'BTC'
      }, {
        value: 'USDT',
        label: 'USDT'
      }];
      this.timeInForceOptions = [{
        value: 'GTC',
        label: 'Good-Till-Canceled'
      }, {
        value: 'IOC',
        label: 'IOC'
      }, {
        value: 'FOK',
        label: 'FOK'
      }];
      this.lastPriceOptions = [{
        value: 'last',
        label: 'Last'
      }, {
        value: 'mark',
        label: 'Mark'
      }, {
        value: 'index',
        label: 'Index'
      }];
      // Order type tabs
      this.orderTypeTabs = [{
        id: 'Limit',
        label: 'Limit'
      }, {
        id: 'Market',
        label: 'Market'
      }, {
        id: 'Conditional',
        label: 'Conditional'
      }];
      // Loading states from service
      this.isPlacingOrder = this.tradingService.isPlacingOrder;
      this.isLoadingBalance = this.tradingService.isLoadingBalance;
      // Initialize form
      this.orderForm = this.fb.group({
        price: [null, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]],
        quantity: [null, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]],
        takeProfit: [null, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]],
        stopLoss: [null, [_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]],
        postOnly: [false],
        reduceOnly: [false],
        timeInForce: ['GTC']
      });
      // Effect to update form validators based on order type
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_5__.effect)(() => {
        const type = this._orderType();
        const priceControl = this.orderForm.get('price');
        if (type === 'Market') {
          priceControl?.clearValidators();
          priceControl?.setValue(null);
        } else {
          priceControl?.setValidators([_angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.required, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.Validators.min(0)]);
        }
        priceControl?.updateValueAndValidity();
      });
    }
    ngOnInit() {
      // Load initial data
      this.loadBalance();
      this.subscribeToMarketData();
      // Subscribe to balance updates
      this.tradingService.balance$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe(balance => {
        if (balance) {
          this._balance.set(balance);
        }
      });
    }
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
      this.bybitService.unsubscribeFromRealtimeTicker('BTCUSDT');
    }
    /**
     * Load account balance
     */
    loadBalance() {
      this.tradingService.getAccountBalance('bybit').pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe({
        next: balance => {
          this._balance.set(balance);
        },
        error: error => {
          console.error('Failed to load balance:', error);
        }
      });
    }
    /**
     * Subscribe to real-time market data
     */
    subscribeToMarketData() {
      this.bybitService.subscribeToRealtimeTicker('BTCUSDT').pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_8__.takeUntil)(this.destroy$)).subscribe({
        next: ticker => {
          if (ticker?.lastPrice) {
            this.lastPrice.set(parseFloat(ticker.lastPrice));
          }
        },
        error: error => {
          console.error('Failed to subscribe to ticker:', error);
        }
      });
    }
    /**
     * Handle margin mode change
     */
    onMarginModeChange(mode) {
      this._marginMode.set(mode);
    }
    /**
     * Handle leverage change
     */
    onLeverageChange(lev) {
      this._leverage.set(lev);
    }
    /**
     * Handle order type tab change
     */
    onOrderTypeChange(type) {
      this._orderType.set(type);
    }
    /**
     * Handle quantity unit change
     */
    onQuantityUnitChange(unit) {
      this._quantityUnit.set(unit);
      // Convert quantity when unit changes
      this.convertQuantity(unit);
    }
    /**
     * Fill price with last price
     */
    fillLastPrice() {
      this.orderForm.patchValue({
        price: this.lastPrice()
      });
    }
    /**
     * Handle quantity percentage slider change
     */
    onQuantityPercentageChange(event) {
      const input = event.target;
      const percentage = parseInt(input.value, 10);
      this._quantityPercentage.set(percentage);
      // Calculate quantity based on percentage and available balance
      this.calculateQuantityFromPercentage(percentage);
    }
    /**
     * Calculate quantity from percentage
     */
    calculateQuantityFromPercentage(percentage) {
      const available = this.availableBalance();
      const price = this.orderForm.get('price')?.value || this.lastPrice();
      const lev = this._leverage();
      if (available && price) {
        const totalValue = available * percentage / 100 * lev;
        const quantity = totalValue / price;
        this.orderForm.patchValue({
          quantity: this.roundQuantity(quantity)
        });
      }
    }
    /**
     * Convert quantity when unit changes
     */
    convertQuantity(newUnit) {
      const currentQuantity = this.orderForm.get('quantity')?.value;
      const price = this.orderForm.get('price')?.value || this.lastPrice();
      if (currentQuantity && price) {
        let newQuantity;
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
    roundQuantity(value) {
      const unit = this._quantityUnit();
      const decimals = unit === 'BTC' ? 6 : 2;
      return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    /**
     * Toggle TP/SL enabled state
     */
    toggleTPSL() {
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
    toggleTPSLMode() {
      this._tpslMode.update(mode => mode === 'Basic' ? 'Advanced' : 'Basic');
    }
    /**
     * Fill TP/SL with last price
     */
    fillTPSLWithLast(field) {
      this.orderForm.patchValue({
        [field]: this.lastPrice()
      });
    }
    /**
     * Calculate liquidation price
     */
    calculateLiquidationPrice() {
      const liq = this.liquidationPrice();
      alert(`Long Liquidation: ${liq.long.toFixed(2)} USDT\nShort Liquidation: ${liq.short.toFixed(2)} USDT`);
    }
    /**
     * Place long order
     */
    placeLongOrder() {
      this.placeOrder('Buy');
    }
    /**
     * Place short order
     */
    placeShortOrder() {
      this.placeOrder('Sell');
    }
    /**
     * Place order
     */
    placeOrder(side) {
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
    resetForm() {
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
    getErrorMessage(controlName) {
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
    hasError(controlName) {
      const control = this.orderForm.get(controlName);
      return !!(control && control.invalid && (control.dirty || control.touched));
    }
    /**
     * Navigate to deposit
     */
    navigateToDeposit() {
      console.log('Navigate to deposit');
      // TODO: Implement navigation
    }
    /**
     * Navigate to convert
     */
    navigateToConvert() {
      console.log('Navigate to convert');
      // TODO: Implement navigation
    }
    /**
     * Navigate to transfer
     */
    navigateToTransfer() {
      console.log('Navigate to transfer');
      // TODO: Implement navigation
    }
    /**
     * Open fee rate dialog
     */
    openFeeRateDialog() {
      console.log('Open fee rate dialog');
      // TODO: Implement dialog
    }
    /**
     * Open calculator dialog
     */
    openCalculatorDialog() {
      console.log('Open calculator dialog');
      // TODO: Implement calculator
    }
    static {
      this.ɵfac = function OrderFormComponent_Factory(t) {
        return new (t || OrderFormComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormBuilder), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_manual_trading_service__WEBPACK_IMPORTED_MODULE_3__.ManualTradingService), _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdirectiveInject"](_services_bybit_service__WEBPACK_IMPORTED_MODULE_4__.BybitService));
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵdefineComponent"]({
        type: OrderFormComponent,
        selectors: [["app-order-form"]],
        inputs: {
          selectedSymbol: "selectedSymbol",
          currentPrice: "currentPrice",
          balance: "balance"
        },
        outputs: {
          orderPlaced: "orderPlaced"
        },
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵStandaloneFeature"]],
        decls: 178,
        vars: 40,
        consts: [[1, "order-form-container"], [1, "order-form-header"], [1, "order-form-title"], [1, "header-actions"], ["aria-label", "Grid settings", 1, "icon-button"], ["width", "20", "height", "20", "viewBox", "0 0 20 20", "fill", "currentColor"], ["x", "2", "y", "2", "width", "7", "height", "7", "rx", "1"], ["x", "11", "y", "2", "width", "7", "height", "7", "rx", "1"], ["x", "2", "y", "11", "width", "7", "height", "7", "rx", "1"], ["x", "11", "y", "11", "width", "7", "height", "7", "rx", "1"], ["aria-label", "Notifications", 1, "icon-button", "notification-button"], ["d", "M10 2C6.68629 2 4 4.68629 4 8V11.5858L2.29289 13.2929C1.90237 13.6834 2.19063 14.5 2.70711 14.5H17.2929C17.8094 14.5 18.0976 13.6834 17.7071 13.2929L16 11.5858V8C16 4.68629 13.3137 2 10 2Z"], ["d", "M8 16C8 17.1046 8.89543 18 10 18C11.1046 18 12 17.1046 12 16H8Z"], [1, "notification-badge"], ["aria-label", "Settings", 1, "icon-button"], ["d", "M10 6C7.79086 6 6 7.79086 6 10C6 12.2091 7.79086 14 10 14C12.2091 14 14 12.2091 14 10C14 7.79086 12.2091 6 10 6Z"], ["cx", "3", "cy", "10", "r", "2"], ["cx", "17", "cy", "10", "r", "2"], [1, "margin-leverage-row"], [1, "margin-mode-select"], ["size", "medium", 3, "ngModelChange", "options", "ngModel", "fullWidth"], [1, "leverage-select"], [1, "leverage-label"], [1, "order-type-tabs"], ["variant", "underline", "size", "medium", 3, "tabChange", "tabs", "activeTabId"], [1, "order-form", 3, "formGroup"], ["class", "form-group", 4, "ngIf"], [1, "form-group"], [1, "form-label"], [1, "input-with-unit"], ["type", "number", "formControlName", "quantity", "placeholder", "0.0", "step", "0.001", 1, "form-input", "quantity-input"], ["size", "small", 1, "unit-select", 3, "ngModelChange", "options", "ngModel", "ngModelOptions"], [1, "quantity-slider-container"], ["type", "range", "min", "0", "max", "100", "aria-label", "Quantity percentage", 1, "quantity-slider", 3, "input", "value"], [1, "slider-markers"], [1, "slider-marker"], [1, "value-display-section"], [1, "value-row"], [1, "value-label"], [1, "value-amount"], [1, "value-dash"], [1, "value-separator"], [1, "value-unit"], [1, "value-row", "liq-price-row"], ["type", "button", 1, "calculate-button", 3, "click"], [1, "tpsl-section"], [1, "tpsl-header"], [1, "checkbox-label"], ["type", "checkbox", 1, "checkbox-input", 3, "change", "checked"], [1, "checkbox-custom"], [1, "checkbox-text"], ["type", "button", 1, "tpsl-mode-toggle", 3, "click"], ["width", "16", "height", "16", "viewBox", "0 0 16 16", "fill", "currentColor", 1, "toggle-icon"], ["d", "M4 6L8 10L12 6H4Z"], ["class", "tpsl-inputs", 4, "ngIf"], [1, "order-options"], ["type", "checkbox", "formControlName", "postOnly", 1, "checkbox-input"], ["formControlName", "timeInForce", "size", "small", 3, "options", "fullWidth"], ["type", "checkbox", "formControlName", "reduceOnly", 1, "checkbox-input"], [1, "action-buttons"], ["type", "button", "variant", "primary", "size", "large", "className", "long-button", 3, "clicked", "disabled"], [4, "ngIf"], ["class", "loading-spinner", 4, "ngIf"], ["type", "button", "variant", "danger", "size", "large", "className", "short-button", 3, "clicked", "disabled"], [1, "form-footer"], ["type", "button", 1, "footer-link", 3, "click"], ["width", "16", "height", "16", "viewBox", "0 0 16 16", "fill", "currentColor"], ["cx", "8", "cy", "8", "r", "6", "stroke", "currentColor", "fill", "none"], ["d", "M8 4V8L11 11"], [1, "notification-dot"], ["x", "3", "y", "2", "width", "10", "height", "12", "rx", "1", "stroke", "currentColor", "fill", "none"], ["x1", "5", "y1", "6", "x2", "11", "y2", "6", "stroke", "currentColor"], ["x1", "5", "y1", "9", "x2", "11", "y2", "9", "stroke", "currentColor"], [1, "account-section"], [1, "account-header"], [1, "account-title"], ["aria-label", "View account", 1, "icon-button-small"], ["d", "M8 3C4.5 3 1.5 5.5 1 8C1.5 10.5 4.5 13 8 13C11.5 13 14.5 10.5 15 8C14.5 5.5 11.5 3 8 3Z"], ["cx", "8", "cy", "8", "r", "2"], ["aria-label", "P&L", 1, "pnl-button"], ["d", "M2 3L8 9L14 3"], ["d", "M2 7L8 13L14 7"], [1, "margin-mode-row"], [1, "margin-label"], [1, "margin-mode-value"], ["width", "12", "height", "12", "viewBox", "0 0 12 12", "fill", "currentColor"], ["d", "M4 5L6 7L8 5H4Z"], [1, "margin-sliders"], [1, "margin-slider-row"], [1, "slider-label"], [1, "slider-container"], [1, "slider-track"], [1, "slider-fill", 2, "width", "0%"], [1, "slider-value"], [1, "balance-display"], [1, "balance-row"], [1, "balance-label"], [1, "balance-value"], [1, "account-actions"], ["type", "button", "variant", "secondary", "size", "small", 3, "clicked"], [1, "input-with-actions"], ["type", "number", "formControlName", "price", "placeholder", "0.0", "step", "0.1", 1, "form-input", "price-input"], ["type", "button", "aria-label", "Fill last price", 1, "input-action-button", "last-button", 3, "click"], ["type", "button", "aria-label", "Transfer", 1, "input-action-button", "transfer-button"], ["d", "M8 1L12 5H9V11H7V5H4L8 1Z"], ["d", "M8 15L4 11H7V5H9V11H12L8 15Z"], [1, "current-price"], [1, "tpsl-inputs"], [1, "input-with-dropdown"], ["type", "number", "formControlName", "takeProfit", "placeholder", "0.0", "step", "0.1", 1, "form-input"], ["type", "button", 1, "dropdown-button", 3, "click"], ["d", "M3 5L6 8L9 5H3Z"], ["type", "number", "formControlName", "stopLoss", "placeholder", "0.0", "step", "0.1", 1, "form-input"], [1, "loading-spinner"]],
        template: function OrderFormComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "h2", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](3, "Trade");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](4, "div", 3)(5, "button", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](6, "svg", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](7, "rect", 6)(8, "rect", 7)(9, "rect", 8)(10, "rect", 9);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](11, "button", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](12, "svg", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](13, "path", 11)(14, "path", 12);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](15, "span", 13);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](16, "button", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](17, "svg", 5);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](18, "path", 15)(19, "circle", 16)(20, "circle", 17);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](21, "div", 18)(22, "div", 19)(23, "ui-select", 20);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayListener"]("ngModelChange", function OrderFormComponent_Template_ui_select_ngModelChange_23_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayBindingSet"](ctx.marginMode, $event) || (ctx.marginMode = $event);
              return $event;
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function OrderFormComponent_Template_ui_select_ngModelChange_23_listener($event) {
              return ctx.onMarginModeChange($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](24, "div", 21)(25, "ui-select", 20);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayListener"]("ngModelChange", function OrderFormComponent_Template_ui_select_ngModelChange_25_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayBindingSet"](ctx.leverage, $event) || (ctx.leverage = $event);
              return $event;
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function OrderFormComponent_Template_ui_select_ngModelChange_25_listener($event) {
              return ctx.onLeverageChange($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](26, "span", 22);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](27);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](28, "div", 23)(29, "ui-tabs", 24);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("tabChange", function OrderFormComponent_Template_ui_tabs_tabChange_29_listener($event) {
              return ctx.onOrderTypeChange($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](30, "form", 25);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](31, OrderFormComponent_div_31_Template, 14, 6, "div", 26);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](32, "div", 27)(33, "label", 28);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](34, "Quantity");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](35, "div", 29);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](36, "input", 30);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](37, "ui-select", 31);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayListener"]("ngModelChange", function OrderFormComponent_Template_ui_select_ngModelChange_37_listener($event) {
              _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayBindingSet"](ctx.quantityUnit, $event) || (ctx.quantityUnit = $event);
              return $event;
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("ngModelChange", function OrderFormComponent_Template_ui_select_ngModelChange_37_listener($event) {
              return ctx.onQuantityUnitChange($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](38, "div", 32)(39, "input", 33);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("input", function OrderFormComponent_Template_input_input_39_listener($event) {
              return ctx.onQuantityPercentageChange($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](40, "div", 34)(41, "span", 35);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](42, "0");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](43, "span", 35);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](44, "100%");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](45, "div", 36)(46, "div", 37)(47, "span", 38);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](48, "Value");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](49, "span", 39)(50, "span", 40);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](51, "--");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](52, "span", 41);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](53, "/");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](54, "span", 40);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](55, "--");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](56, "span", 42);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](57, "USDT");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](58, "div", 37)(59, "span", 38);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](60, "Cost");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](61, "span", 39)(62, "span", 40);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](63, "--");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](64, "span", 41);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](65, "/");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](66, "span", 40);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](67, "--");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](68, "span", 42);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](69, "USDT");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](70, "div", 43)(71, "span", 38);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](72, "Liq. Price");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](73, "button", 44);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_Template_button_click_73_listener() {
              return ctx.calculateLiquidationPrice();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](74, " Calculate ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](75, "div", 45)(76, "div", 46)(77, "label", 47)(78, "input", 48);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("change", function OrderFormComponent_Template_input_change_78_listener() {
              return ctx.toggleTPSL();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](79, "span", 49);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](80, "span", 50);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](81, "TP/SL");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](82, "button", 51);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_Template_button_click_82_listener() {
              return ctx.toggleTPSLMode();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](83);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](84, "svg", 52);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](85, "path", 53);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](86, OrderFormComponent_div_86_Template, 19, 0, "div", 54);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](87, "div", 55)(88, "label", 47);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](89, "input", 56)(90, "span", 49);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](91, "span", 50);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](92, "Post-Only");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](93, "ui-select", 57);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](94, "div", 55)(95, "label", 47);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](96, "input", 58)(97, "span", 49);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](98, "span", 50);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](99, "Reduce-Only");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](100, "div", 59)(101, "ui-button", 60);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function OrderFormComponent_Template_ui_button_clicked_101_listener() {
              return ctx.placeLongOrder();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](102, OrderFormComponent_span_102_Template, 2, 0, "span", 61)(103, OrderFormComponent_span_103_Template, 1, 0, "span", 62);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](104, "ui-button", 63);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function OrderFormComponent_Template_ui_button_clicked_104_listener() {
              return ctx.placeShortOrder();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtemplate"](105, OrderFormComponent_span_105_Template, 2, 0, "span", 61)(106, OrderFormComponent_span_106_Template, 1, 0, "span", 62);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](107, "div", 64)(108, "button", 65);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_Template_button_click_108_listener() {
              return ctx.openFeeRateDialog();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](109, "svg", 66);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](110, "circle", 67)(111, "path", 68);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](112, " Fee Rate ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](113, "span", 69);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](114, "button", 65);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("click", function OrderFormComponent_Template_button_click_114_listener() {
              return ctx.openCalculatorDialog();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](115, "svg", 66);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](116, "rect", 70)(117, "line", 71)(118, "line", 72);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](119, " Calculator ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](120, "div", 73)(121, "div", 74)(122, "div", 75)(123, "span");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](124, "Unified Trading Account");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](125, "button", 76);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](126, "svg", 66);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](127, "path", 77)(128, "circle", 78);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](129, "button", 79);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](130, "svg", 66);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](131, "path", 80)(132, "path", 81);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](133, " P&L ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](134, "div", 82)(135, "span", 83);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](136, "Margin Mode");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](137, "button", 84);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](138);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceSVG"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](139, "svg", 85);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](140, "path", 86);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵnamespaceHTML"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](141, "div", 87)(142, "div", 88)(143, "label", 89);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](144, "Initial Margin");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](145, "div", 90)(146, "div", 91);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](147, "div", 92);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](148, "span", 93);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](149, "0.00%");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](150, "div", 88)(151, "label", 89);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](152, "Maintenance Margin");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](153, "div", 90)(154, "div", 91);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelement"](155, "div", 92);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](156, "span", 93);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](157, "0.00%");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](158, "div", 94)(159, "div", 95)(160, "span", 96);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](161, "Margin Balance");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](162, "span", 97);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](163);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](164, "number");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](165, "div", 95)(166, "span", 96);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](167, "Available Balance");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](168, "span", 97);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](169);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipe"](170, "number");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](171, "div", 98)(172, "ui-button", 99);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function OrderFormComponent_Template_ui_button_clicked_172_listener() {
              return ctx.navigateToDeposit();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](173, " Deposit ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](174, "ui-button", 99);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function OrderFormComponent_Template_ui_button_clicked_174_listener() {
              return ctx.navigateToConvert();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](175, " Convert ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementStart"](176, "ui-button", 99);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵlistener"]("clicked", function OrderFormComponent_Template_ui_button_clicked_176_listener() {
              return ctx.navigateToTransfer();
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtext"](177, " Transfer ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵelementEnd"]()()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](23);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("options", ctx.marginModeOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayProperty"]("ngModel", ctx.marginMode);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("fullWidth", true);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("options", ctx.leverageOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayProperty"]("ngModel", ctx.leverage);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("fullWidth", true);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"]("", ctx.leverage, "x");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("tabs", ctx.orderTypeTabs)("activeTabId", ctx.orderType);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("formGroup", ctx.orderForm);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.orderType !== "Market");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("error", ctx.hasError("quantity"));
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("options", ctx.quantityUnitOptions);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtwoWayProperty"]("ngModel", ctx.quantityUnit);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngModelOptions", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpureFunction0"](39, _c0));
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("value", ctx.quantityPercentage);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](4);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵclassProp"]("active", ctx.quantityPercentage >= 100);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](35);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("checked", ctx.tpslEnabled);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](5);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx.tpslMode, " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.tpslEnabled);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](7);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("options", ctx.timeInForceOptions)("fullWidth", true);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](8);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("disabled", ctx.isPlacingOrder() || ctx.orderForm.invalid);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx.isPlacingOrder());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.isPlacingOrder());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("disabled", ctx.isPlacingOrder() || ctx.orderForm.invalid);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", !ctx.isPlacingOrder());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵproperty"]("ngIf", ctx.isPlacingOrder());
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](32);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", ctx.marginMode, " Margin ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](25);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](164, 33, ctx.marginBalance(), "1.4-4"), " USDT ");
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵadvance"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵtextInterpolate1"](" ", _angular_core__WEBPACK_IMPORTED_MODULE_5__["ɵɵpipeBind2"](170, 36, ctx.availableBalance(), "1.4-4"), " USDT ");
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_9__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_9__.NgIf, _angular_common__WEBPACK_IMPORTED_MODULE_9__.DecimalPipe, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.ReactiveFormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_7__["ɵNgNoValidate"], _angular_forms__WEBPACK_IMPORTED_MODULE_7__.DefaultValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.NumberValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.CheckboxControlValueAccessor, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.NgControlStatus, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.NgControlStatusGroup, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormGroupDirective, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormControlName, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.FormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_7__.NgModel, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_0__.ButtonComponent, _ui_select_select_component__WEBPACK_IMPORTED_MODULE_1__.SelectComponent, _ui_tabs_tabs_component__WEBPACK_IMPORTED_MODULE_2__.TabsComponent],
        styles: ["\n\n.order-form-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 20px;\n  background: var(--bg-primary, #1a1d26);\n  color: var(--text-primary, #e4e4e7);\n  border-radius: 8px;\n  max-width: 400px;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n}\n\n\n\n.order-form-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 8px;\n}\n\n.order-form-title[_ngcontent-%COMP%] {\n  font-size: 20px;\n  font-weight: 600;\n  margin: 0;\n  color: var(--text-primary, #ffffff);\n}\n\n.header-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  align-items: center;\n}\n\n.icon-button[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  background: transparent;\n  border: none;\n  border-radius: 6px;\n  color: var(--text-secondary, #a1a1aa);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.icon-button[_ngcontent-%COMP%]:hover {\n  background: var(--bg-hover, #2a2d3a);\n  color: var(--text-primary, #e4e4e7);\n}\n\n.notification-button[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.notification-badge[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 6px;\n  right: 6px;\n  width: 6px;\n  height: 6px;\n  background: #ef4444;\n  border-radius: 50%;\n}\n\n\n\n.margin-leverage-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n}\n\n.margin-mode-select[_ngcontent-%COMP%], \n.leverage-select[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.leverage-label[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 36px;\n  top: 50%;\n  transform: translateY(-50%);\n  font-size: 16px;\n  font-weight: 600;\n  color: #F7A600;\n  pointer-events: none;\n}\n\n\n\n.order-type-tabs[_ngcontent-%COMP%] {\n  margin-bottom: 8px;\n}\n\n.order-type-tabs[_ngcontent-%COMP%]     .tabs {\n  border-bottom: 1px solid var(--border-color, #2a2d3a);\n}\n\n.order-type-tabs[_ngcontent-%COMP%]     .tab {\n  color: var(--text-secondary, #a1a1aa);\n  font-size: 14px;\n  font-weight: 500;\n  padding: 8px 16px;\n  border: none;\n  background: transparent;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.order-type-tabs[_ngcontent-%COMP%]     .tab-active {\n  color: #F7A600;\n  border-bottom: 2px solid #F7A600;\n}\n\n.order-type-tabs[_ngcontent-%COMP%]     .tab:hover:not(.tab-active) {\n  color: var(--text-primary, #e4e4e7);\n}\n\n\n\n.order-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.form-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-secondary, #a1a1aa);\n  font-weight: 400;\n}\n\n.form-input[_ngcontent-%COMP%] {\n  width: 100%;\n  padding: 12px 16px;\n  background: var(--input-bg, #2a2d3a);\n  border: 1px solid var(--input-border, #3a3d4a);\n  border-radius: 6px;\n  color: var(--text-primary, #ffffff);\n  font-size: 16px;\n  font-weight: 500;\n  transition: all 0.2s ease;\n  outline: none;\n}\n\n.form-input[_ngcontent-%COMP%]:focus {\n  border-color: #F7A600;\n  background: var(--input-bg-focus, #2a2d3a);\n}\n\n.form-input.error[_ngcontent-%COMP%] {\n  border-color: #ef4444;\n}\n\n.form-input[_ngcontent-%COMP%]::placeholder {\n  color: var(--text-tertiary, #52525b);\n}\n\n\n\n.input-with-actions[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.price-input[_ngcontent-%COMP%] {\n  padding-right: 120px;\n}\n\n.input-action-button[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  height: 28px;\n  padding: 0 12px;\n  background: transparent;\n  border: none;\n  border-radius: 4px;\n  color: #F7A600;\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.input-action-button[_ngcontent-%COMP%]:hover {\n  background: rgba(247, 166, 0, 0.1);\n}\n\n.last-button[_ngcontent-%COMP%] {\n  right: 48px;\n}\n\n.transfer-button[_ngcontent-%COMP%] {\n  right: 8px;\n  width: 28px;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.current-price[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-secondary, #a1a1aa);\n  margin-top: 4px;\n}\n\n\n\n.input-with-unit[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.quantity-input[_ngcontent-%COMP%] {\n  padding-right: 100px;\n}\n\n.unit-select[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  width: 80px;\n}\n\n\n\n.quantity-slider-container[_ngcontent-%COMP%] {\n  margin-top: -8px;\n}\n\n.quantity-slider[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 6px;\n  appearance: none;\n  background: var(--slider-bg, #3a3d4a);\n  border-radius: 3px;\n  outline: none;\n  cursor: pointer;\n}\n\n.quantity-slider[_ngcontent-%COMP%]::-webkit-slider-thumb {\n  appearance: none;\n  width: 16px;\n  height: 16px;\n  background: #F7A600;\n  border-radius: 50%;\n  cursor: pointer;\n  -webkit-transition: all 0.2s ease;\n  transition: all 0.2s ease;\n}\n\n.quantity-slider[_ngcontent-%COMP%]::-webkit-slider-thumb:hover {\n  transform: scale(1.1);\n}\n\n.quantity-slider[_ngcontent-%COMP%]::-moz-range-thumb {\n  width: 16px;\n  height: 16px;\n  background: #F7A600;\n  border-radius: 50%;\n  border: none;\n  cursor: pointer;\n  -moz-transition: all 0.2s ease;\n  transition: all 0.2s ease;\n}\n\n.quantity-slider[_ngcontent-%COMP%]::-moz-range-thumb:hover {\n  transform: scale(1.1);\n}\n\n.slider-markers[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  margin-top: 8px;\n}\n\n.slider-marker[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-tertiary, #52525b);\n}\n\n.slider-marker.active[_ngcontent-%COMP%] {\n  color: #F7A600;\n  font-weight: 500;\n}\n\n\n\n.value-display-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 12px 16px;\n  background: var(--value-display-bg, #232631);\n  border-radius: 6px;\n}\n\n.value-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.value-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-secondary, #a1a1aa);\n}\n\n.value-amount[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-primary, #e4e4e7);\n}\n\n.value-dash[_ngcontent-%COMP%] {\n  color: var(--text-tertiary, #52525b);\n}\n\n.value-separator[_ngcontent-%COMP%] {\n  margin: 0 4px;\n  color: var(--text-tertiary, #52525b);\n}\n\n.value-unit[_ngcontent-%COMP%] {\n  color: var(--text-secondary, #a1a1aa);\n  margin-left: 4px;\n}\n\n.liq-price-row[_ngcontent-%COMP%]   .value-label[_ngcontent-%COMP%] {\n  text-decoration: underline;\n  text-decoration-style: dashed;\n  text-underline-offset: 4px;\n}\n\n.calculate-button[_ngcontent-%COMP%] {\n  padding: 4px 12px;\n  background: transparent;\n  border: 1px solid var(--border-color, #3a3d4a);\n  border-radius: 4px;\n  color: #F7A600;\n  font-size: 12px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.calculate-button[_ngcontent-%COMP%]:hover {\n  background: rgba(247, 166, 0, 0.1);\n  border-color: #F7A600;\n}\n\n\n\n.tpsl-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.tpsl-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.checkbox-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  cursor: pointer;\n  -webkit-user-select: none;\n          user-select: none;\n}\n\n.checkbox-input[_ngcontent-%COMP%] {\n  position: absolute;\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.checkbox-custom[_ngcontent-%COMP%] {\n  width: 18px;\n  height: 18px;\n  background: var(--checkbox-bg, #2a2d3a);\n  border: 1px solid var(--checkbox-border, #3a3d4a);\n  border-radius: 3px;\n  position: relative;\n  transition: all 0.2s ease;\n}\n\n.checkbox-input[_ngcontent-%COMP%]:checked    + .checkbox-custom[_ngcontent-%COMP%] {\n  background: #F7A600;\n  border-color: #F7A600;\n}\n\n.checkbox-input[_ngcontent-%COMP%]:checked    + .checkbox-custom[_ngcontent-%COMP%]::after {\n  content: '';\n  position: absolute;\n  left: 5px;\n  top: 2px;\n  width: 5px;\n  height: 9px;\n  border: solid #1a1d26;\n  border-width: 0 2px 2px 0;\n  transform: rotate(45deg);\n}\n\n.checkbox-text[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-primary, #e4e4e7);\n}\n\n.tpsl-mode-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 8px;\n  background: transparent;\n  border: none;\n  color: var(--text-primary, #e4e4e7);\n  font-size: 14px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.tpsl-mode-toggle[_ngcontent-%COMP%]:hover {\n  color: #F7A600;\n}\n\n.toggle-icon[_ngcontent-%COMP%] {\n  transition: transform 0.2s ease;\n}\n\n.tpsl-inputs[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.input-with-dropdown[_ngcontent-%COMP%] {\n  position: relative;\n  display: flex;\n  align-items: center;\n}\n\n.input-with-dropdown[_ngcontent-%COMP%]   .form-input[_ngcontent-%COMP%] {\n  padding-right: 80px;\n}\n\n.dropdown-button[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 8px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 8px;\n  background: transparent;\n  border: none;\n  color: var(--text-secondary, #a1a1aa);\n  font-size: 14px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.dropdown-button[_ngcontent-%COMP%]:hover {\n  color: #F7A600;\n}\n\n\n\n.order-options[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n}\n\n\n\n.action-buttons[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 12px;\n  margin-top: 8px;\n}\n\n.action-button[_ngcontent-%COMP%] {\n  height: 48px;\n  border: none;\n  border-radius: 6px;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.action-button[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.long-button[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #00C076 0%, #00A862 100%);\n  color: #ffffff;\n  box-shadow: 0 2px 8px rgba(0, 192, 118, 0.3);\n}\n\n.long-button[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: linear-gradient(135deg, #00D67F 0%, #00C076 100%);\n  box-shadow: 0 4px 12px rgba(0, 192, 118, 0.4);\n  transform: translateY(-1px);\n}\n\n.short-button[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #FF4D4F 0%, #DC2626 100%);\n  color: #ffffff;\n  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.3);\n}\n\n.short-button[_ngcontent-%COMP%]:hover:not(:disabled) {\n  background: linear-gradient(135deg, #FF6668 0%, #EF4444 100%);\n  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);\n  transform: translateY(-1px);\n}\n\n.loading-spinner[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  border: 2px solid transparent;\n  border-top: 2px solid currentColor;\n  border-radius: 50%;\n  animation: _ngcontent-%COMP%_spin 1s linear infinite;\n}\n\n@keyframes _ngcontent-%COMP%_spin {\n  0% { transform: rotate(0deg); }\n  100% { transform: rotate(360deg); }\n}\n\n\n\n.form-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-start;\n  gap: 24px;\n  margin-top: 8px;\n}\n\n.footer-link[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  background: transparent;\n  border: none;\n  color: var(--text-secondary, #a1a1aa);\n  font-size: 13px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  position: relative;\n}\n\n.footer-link[_ngcontent-%COMP%]:hover {\n  color: var(--text-primary, #e4e4e7);\n}\n\n.notification-dot[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 0;\n  right: -4px;\n  width: 6px;\n  height: 6px;\n  background: #ef4444;\n  border-radius: 50%;\n}\n\n\n\n.account-section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 16px;\n  background: var(--account-bg, #232631);\n  border-radius: 8px;\n  margin-top: 8px;\n}\n\n.account-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.account-title[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 14px;\n  font-weight: 500;\n  color: var(--text-primary, #e4e4e7);\n}\n\n.icon-button-small[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  background: transparent;\n  border: none;\n  color: var(--text-secondary, #a1a1aa);\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.icon-button-small[_ngcontent-%COMP%]:hover {\n  color: var(--text-primary, #e4e4e7);\n}\n\n.pnl-button[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 8px;\n  background: transparent;\n  border: 1px solid var(--border-color, #3a3d4a);\n  border-radius: 4px;\n  color: #F7A600;\n  font-size: 12px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.pnl-button[_ngcontent-%COMP%]:hover {\n  background: rgba(247, 166, 0, 0.1);\n  border-color: #F7A600;\n}\n\n.margin-mode-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.margin-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--text-secondary, #a1a1aa);\n}\n\n.margin-mode-value[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 8px;\n  background: transparent;\n  border: none;\n  color: var(--text-primary, #e4e4e7);\n  font-size: 14px;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.margin-mode-value[_ngcontent-%COMP%]:hover {\n  color: #F7A600;\n}\n\n\n\n.margin-sliders[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n}\n\n.margin-slider-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: auto 1fr auto;\n  gap: 12px;\n  align-items: center;\n}\n\n.slider-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--text-secondary, #a1a1aa);\n  white-space: nowrap;\n}\n\n.slider-container[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.slider-track[_ngcontent-%COMP%] {\n  height: 4px;\n  background: var(--slider-bg, #3a3d4a);\n  border-radius: 2px;\n  position: relative;\n  overflow: hidden;\n}\n\n.slider-fill[_ngcontent-%COMP%] {\n  height: 100%;\n  background: #00C076;\n  transition: width 0.3s ease;\n}\n\n.slider-value[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #00C076;\n  font-weight: 500;\n  min-width: 45px;\n  text-align: right;\n}\n\n\n\n.balance-display[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.balance-row[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.balance-label[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--text-secondary, #a1a1aa);\n}\n\n.balance-value[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--text-primary, #e4e4e7);\n}\n\n\n\n.account-actions[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 8px;\n}\n\n.account-action-button[_ngcontent-%COMP%] {\n  height: 36px;\n  background: var(--button-secondary-bg, #2a2d3a);\n  border: 1px solid var(--button-secondary-border, #3a3d4a);\n  border-radius: 6px;\n  color: var(--text-primary, #e4e4e7);\n  font-size: 14px;\n  font-weight: 500;\n  cursor: pointer;\n  transition: all 0.2s ease;\n}\n\n.account-action-button[_ngcontent-%COMP%]:hover {\n  background: var(--button-secondary-hover, #353846);\n  border-color: #F7A600;\n  color: #F7A600;\n}\n\n\n\n.light-theme[_nghost-%COMP%]   .order-form-container[_ngcontent-%COMP%], .light-theme   [_nghost-%COMP%]   .order-form-container[_ngcontent-%COMP%] {\n  --bg-primary: #ffffff;\n  --bg-hover: #f4f4f5;\n  --text-primary: #18181b;\n  --text-secondary: #71717a;\n  --text-tertiary: #a1a1aa;\n  --input-bg: #f4f4f5;\n  --input-bg-focus: #ffffff;\n  --input-border: #e4e4e7;\n  --value-display-bg: #fafafa;\n  --account-bg: #fafafa;\n  --checkbox-bg: #f4f4f5;\n  --checkbox-border: #d4d4d8;\n  --slider-bg: #e4e4e7;\n  --border-color: #e4e4e7;\n  --button-secondary-bg: #f4f4f5;\n  --button-secondary-border: #e4e4e7;\n  --button-secondary-hover: #e4e4e7;\n}\n\n\n\n@media (max-width: 768px) {\n  .order-form-container[_ngcontent-%COMP%] {\n    max-width: 100%;\n    padding: 16px;\n  }\n\n  .action-buttons[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .account-actions[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n}\n\n\n\n@media (prefers-reduced-motion: reduce) {\n  *[_ngcontent-%COMP%] {\n    animation: none !important;\n    transition: none !important;\n  }\n}\n\n\n\n.action-button[_ngcontent-%COMP%]:focus-visible, \n.icon-button[_ngcontent-%COMP%]:focus-visible, \n.form-input[_ngcontent-%COMP%]:focus-visible, \n.checkbox-input[_ngcontent-%COMP%]:focus-visible    + .checkbox-custom[_ngcontent-%COMP%] {\n  outline: 2px solid #F7A600;\n  outline-offset: 2px;\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL29yZGVyLWZvcm0vb3JkZXItZm9ybS5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHlCQUF5QjtBQUN6QjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsU0FBUztFQUNULGFBQWE7RUFDYixzQ0FBc0M7RUFDdEMsbUNBQW1DO0VBQ25DLGtCQUFrQjtFQUNsQixnQkFBZ0I7RUFDaEIsOEVBQThFO0FBQ2hGOztBQUVBLFdBQVc7QUFDWDtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsbUJBQW1CO0VBQ25CLGtCQUFrQjtBQUNwQjs7QUFFQTtFQUNFLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsU0FBUztFQUNULG1DQUFtQztBQUNyQzs7QUFFQTtFQUNFLGFBQWE7RUFDYixRQUFRO0VBQ1IsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQix1QkFBdUI7RUFDdkIsV0FBVztFQUNYLFlBQVk7RUFDWix1QkFBdUI7RUFDdkIsWUFBWTtFQUNaLGtCQUFrQjtFQUNsQixxQ0FBcUM7RUFDckMsZUFBZTtFQUNmLHlCQUF5QjtBQUMzQjs7QUFFQTtFQUNFLG9DQUFvQztFQUNwQyxtQ0FBbUM7QUFDckM7O0FBRUE7RUFDRSxrQkFBa0I7QUFDcEI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsUUFBUTtFQUNSLFVBQVU7RUFDVixVQUFVO0VBQ1YsV0FBVztFQUNYLG1CQUFtQjtFQUNuQixrQkFBa0I7QUFDcEI7O0FBRUEsMkJBQTJCO0FBQzNCO0VBQ0UsYUFBYTtFQUNiLDhCQUE4QjtFQUM5QixTQUFTO0FBQ1g7O0FBRUE7O0VBRUUsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLFdBQVc7RUFDWCxRQUFRO0VBQ1IsMkJBQTJCO0VBQzNCLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsY0FBYztFQUNkLG9CQUFvQjtBQUN0Qjs7QUFFQSxvQkFBb0I7QUFDcEI7RUFDRSxrQkFBa0I7QUFDcEI7O0FBRUE7RUFDRSxxREFBcUQ7QUFDdkQ7O0FBRUE7RUFDRSxxQ0FBcUM7RUFDckMsZUFBZTtFQUNmLGdCQUFnQjtFQUNoQixpQkFBaUI7RUFDakIsWUFBWTtFQUNaLHVCQUF1QjtFQUN2QixlQUFlO0VBQ2YseUJBQXlCO0FBQzNCOztBQUVBO0VBQ0UsY0FBYztFQUNkLGdDQUFnQztBQUNsQzs7QUFFQTtFQUNFLG1DQUFtQztBQUNyQzs7QUFFQSxTQUFTO0FBQ1Q7RUFDRSxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLFNBQVM7QUFDWDs7QUFFQTtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsUUFBUTtBQUNWOztBQUVBO0VBQ0UsZUFBZTtFQUNmLHFDQUFxQztFQUNyQyxnQkFBZ0I7QUFDbEI7O0FBRUE7RUFDRSxXQUFXO0VBQ1gsa0JBQWtCO0VBQ2xCLG9DQUFvQztFQUNwQyw4Q0FBOEM7RUFDOUMsa0JBQWtCO0VBQ2xCLG1DQUFtQztFQUNuQyxlQUFlO0VBQ2YsZ0JBQWdCO0VBQ2hCLHlCQUF5QjtFQUN6QixhQUFhO0FBQ2Y7O0FBRUE7RUFDRSxxQkFBcUI7RUFDckIsMENBQTBDO0FBQzVDOztBQUVBO0VBQ0UscUJBQXFCO0FBQ3ZCOztBQUVBO0VBQ0Usb0NBQW9DO0FBQ3RDOztBQUVBLHVCQUF1QjtBQUN2QjtFQUNFLGtCQUFrQjtFQUNsQixhQUFhO0VBQ2IsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0Usb0JBQW9CO0FBQ3RCOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLFVBQVU7RUFDVixZQUFZO0VBQ1osZUFBZTtFQUNmLHVCQUF1QjtFQUN2QixZQUFZO0VBQ1osa0JBQWtCO0VBQ2xCLGNBQWM7RUFDZCxlQUFlO0VBQ2YsZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZix5QkFBeUI7QUFDM0I7O0FBRUE7RUFDRSxrQ0FBa0M7QUFDcEM7O0FBRUE7RUFDRSxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxVQUFVO0VBQ1YsV0FBVztFQUNYLFVBQVU7RUFDVixhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLHVCQUF1QjtBQUN6Qjs7QUFFQTtFQUNFLGVBQWU7RUFDZixxQ0FBcUM7RUFDckMsZUFBZTtBQUNqQjs7QUFFQSxvQkFBb0I7QUFDcEI7RUFDRSxrQkFBa0I7RUFDbEIsYUFBYTtFQUNiLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLG9CQUFvQjtBQUN0Qjs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixVQUFVO0VBQ1YsV0FBVztBQUNiOztBQUVBLG9CQUFvQjtBQUNwQjtFQUNFLGdCQUFnQjtBQUNsQjs7QUFFQTtFQUNFLFdBQVc7RUFDWCxXQUFXO0VBRVgsZ0JBQWdCO0VBQ2hCLHFDQUFxQztFQUNyQyxrQkFBa0I7RUFDbEIsYUFBYTtFQUNiLGVBQWU7QUFDakI7O0FBRUE7RUFFRSxnQkFBZ0I7RUFDaEIsV0FBVztFQUNYLFlBQVk7RUFDWixtQkFBbUI7RUFDbkIsa0JBQWtCO0VBQ2xCLGVBQWU7RUFDZixpQ0FBeUI7RUFBekIseUJBQXlCO0FBQzNCOztBQUVBO0VBQ0UscUJBQXFCO0FBQ3ZCOztBQUVBO0VBQ0UsV0FBVztFQUNYLFlBQVk7RUFDWixtQkFBbUI7RUFDbkIsa0JBQWtCO0VBQ2xCLFlBQVk7RUFDWixlQUFlO0VBQ2YsOEJBQXlCO0VBQXpCLHlCQUF5QjtBQUMzQjs7QUFFQTtFQUNFLHFCQUFxQjtBQUN2Qjs7QUFFQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsZUFBZTtBQUNqQjs7QUFFQTtFQUNFLGVBQWU7RUFDZixvQ0FBb0M7QUFDdEM7O0FBRUE7RUFDRSxjQUFjO0VBQ2QsZ0JBQWdCO0FBQ2xCOztBQUVBLDBCQUEwQjtBQUMxQjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsUUFBUTtFQUNSLGtCQUFrQjtFQUNsQiw0Q0FBNEM7RUFDNUMsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsYUFBYTtFQUNiLDhCQUE4QjtFQUM5QixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxlQUFlO0VBQ2YscUNBQXFDO0FBQ3ZDOztBQUVBO0VBQ0UsZUFBZTtFQUNmLG1DQUFtQztBQUNyQzs7QUFFQTtFQUNFLG9DQUFvQztBQUN0Qzs7QUFFQTtFQUNFLGFBQWE7RUFDYixvQ0FBb0M7QUFDdEM7O0FBRUE7RUFDRSxxQ0FBcUM7RUFDckMsZ0JBQWdCO0FBQ2xCOztBQUVBO0VBQ0UsMEJBQTBCO0VBQzFCLDZCQUE2QjtFQUM3QiwwQkFBMEI7QUFDNUI7O0FBRUE7RUFDRSxpQkFBaUI7RUFDakIsdUJBQXVCO0VBQ3ZCLDhDQUE4QztFQUM5QyxrQkFBa0I7RUFDbEIsY0FBYztFQUNkLGVBQWU7RUFDZixlQUFlO0VBQ2YseUJBQXlCO0FBQzNCOztBQUVBO0VBQ0Usa0NBQWtDO0VBQ2xDLHFCQUFxQjtBQUN2Qjs7QUFFQSxrQkFBa0I7QUFDbEI7RUFDRSxhQUFhO0VBQ2Isc0JBQXNCO0VBQ3RCLFNBQVM7QUFDWDs7QUFFQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQixRQUFRO0VBQ1IsZUFBZTtFQUNmLHlCQUFpQjtVQUFqQixpQkFBaUI7QUFDbkI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsVUFBVTtFQUNWLFFBQVE7RUFDUixTQUFTO0FBQ1g7O0FBRUE7RUFDRSxXQUFXO0VBQ1gsWUFBWTtFQUNaLHVDQUF1QztFQUN2QyxpREFBaUQ7RUFDakQsa0JBQWtCO0VBQ2xCLGtCQUFrQjtFQUNsQix5QkFBeUI7QUFDM0I7O0FBRUE7RUFDRSxtQkFBbUI7RUFDbkIscUJBQXFCO0FBQ3ZCOztBQUVBO0VBQ0UsV0FBVztFQUNYLGtCQUFrQjtFQUNsQixTQUFTO0VBQ1QsUUFBUTtFQUNSLFVBQVU7RUFDVixXQUFXO0VBQ1gscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6Qix3QkFBd0I7QUFDMUI7O0FBRUE7RUFDRSxlQUFlO0VBQ2YsbUNBQW1DO0FBQ3JDOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQixRQUFRO0VBQ1IsZ0JBQWdCO0VBQ2hCLHVCQUF1QjtFQUN2QixZQUFZO0VBQ1osbUNBQW1DO0VBQ25DLGVBQWU7RUFDZixlQUFlO0VBQ2YseUJBQXlCO0FBQzNCOztBQUVBO0VBQ0UsY0FBYztBQUNoQjs7QUFFQTtFQUNFLCtCQUErQjtBQUNqQzs7QUFFQTtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsU0FBUztBQUNYOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLGFBQWE7RUFDYixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxrQkFBa0I7RUFDbEIsVUFBVTtFQUNWLGFBQWE7RUFDYixtQkFBbUI7RUFDbkIsUUFBUTtFQUNSLGdCQUFnQjtFQUNoQix1QkFBdUI7RUFDdkIsWUFBWTtFQUNaLHFDQUFxQztFQUNyQyxlQUFlO0VBQ2YsZUFBZTtFQUNmLHlCQUF5QjtBQUMzQjs7QUFFQTtFQUNFLGNBQWM7QUFDaEI7O0FBRUEsa0JBQWtCO0FBQ2xCO0VBQ0UsYUFBYTtFQUNiLDhCQUE4QjtFQUM5QixtQkFBbUI7RUFDbkIsU0FBUztBQUNYOztBQUVBLG1CQUFtQjtBQUNuQjtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsU0FBUztFQUNULGVBQWU7QUFDakI7O0FBRUE7RUFDRSxZQUFZO0VBQ1osWUFBWTtFQUNaLGtCQUFrQjtFQUNsQixlQUFlO0VBQ2YsZ0JBQWdCO0VBQ2hCLGVBQWU7RUFDZix5QkFBeUI7RUFDekIsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQix1QkFBdUI7QUFDekI7O0FBRUE7RUFDRSxZQUFZO0VBQ1osbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsNkRBQTZEO0VBQzdELGNBQWM7RUFDZCw0Q0FBNEM7QUFDOUM7O0FBRUE7RUFDRSw2REFBNkQ7RUFDN0QsNkNBQTZDO0VBQzdDLDJCQUEyQjtBQUM3Qjs7QUFFQTtFQUNFLDZEQUE2RDtFQUM3RCxjQUFjO0VBQ2QsNENBQTRDO0FBQzlDOztBQUVBO0VBQ0UsNkRBQTZEO0VBQzdELDZDQUE2QztFQUM3QywyQkFBMkI7QUFDN0I7O0FBRUE7RUFDRSxXQUFXO0VBQ1gsWUFBWTtFQUNaLDZCQUE2QjtFQUM3QixrQ0FBa0M7RUFDbEMsa0JBQWtCO0VBQ2xCLGtDQUFrQztBQUNwQzs7QUFFQTtFQUNFLEtBQUssdUJBQXVCLEVBQUU7RUFDOUIsT0FBTyx5QkFBeUIsRUFBRTtBQUNwQzs7QUFFQSxnQkFBZ0I7QUFDaEI7RUFDRSxhQUFhO0VBQ2IsMkJBQTJCO0VBQzNCLFNBQVM7RUFDVCxlQUFlO0FBQ2pCOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQixRQUFRO0VBQ1IsdUJBQXVCO0VBQ3ZCLFlBQVk7RUFDWixxQ0FBcUM7RUFDckMsZUFBZTtFQUNmLGVBQWU7RUFDZix5QkFBeUI7RUFDekIsa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsbUNBQW1DO0FBQ3JDOztBQUVBO0VBQ0Usa0JBQWtCO0VBQ2xCLE1BQU07RUFDTixXQUFXO0VBQ1gsVUFBVTtFQUNWLFdBQVc7RUFDWCxtQkFBbUI7RUFDbkIsa0JBQWtCO0FBQ3BCOztBQUVBLG9CQUFvQjtBQUNwQjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsU0FBUztFQUNULGFBQWE7RUFDYixzQ0FBc0M7RUFDdEMsa0JBQWtCO0VBQ2xCLGVBQWU7QUFDakI7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsOEJBQThCO0VBQzlCLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLGFBQWE7RUFDYixtQkFBbUI7RUFDbkIsUUFBUTtFQUNSLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsbUNBQW1DO0FBQ3JDOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQix1QkFBdUI7RUFDdkIsV0FBVztFQUNYLFlBQVk7RUFDWix1QkFBdUI7RUFDdkIsWUFBWTtFQUNaLHFDQUFxQztFQUNyQyxlQUFlO0VBQ2YseUJBQXlCO0FBQzNCOztBQUVBO0VBQ0UsbUNBQW1DO0FBQ3JDOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQixRQUFRO0VBQ1IsZ0JBQWdCO0VBQ2hCLHVCQUF1QjtFQUN2Qiw4Q0FBOEM7RUFDOUMsa0JBQWtCO0VBQ2xCLGNBQWM7RUFDZCxlQUFlO0VBQ2YsZUFBZTtFQUNmLHlCQUF5QjtBQUMzQjs7QUFFQTtFQUNFLGtDQUFrQztFQUNsQyxxQkFBcUI7QUFDdkI7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsOEJBQThCO0VBQzlCLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLGVBQWU7RUFDZixxQ0FBcUM7QUFDdkM7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsbUJBQW1CO0VBQ25CLFFBQVE7RUFDUixnQkFBZ0I7RUFDaEIsdUJBQXVCO0VBQ3ZCLFlBQVk7RUFDWixtQ0FBbUM7RUFDbkMsZUFBZTtFQUNmLGVBQWU7RUFDZix5QkFBeUI7QUFDM0I7O0FBRUE7RUFDRSxjQUFjO0FBQ2hCOztBQUVBLG1CQUFtQjtBQUNuQjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsU0FBUztBQUNYOztBQUVBO0VBQ0UsYUFBYTtFQUNiLG9DQUFvQztFQUNwQyxTQUFTO0VBQ1QsbUJBQW1CO0FBQ3JCOztBQUVBO0VBQ0UsZUFBZTtFQUNmLHFDQUFxQztFQUNyQyxtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxPQUFPO0FBQ1Q7O0FBRUE7RUFDRSxXQUFXO0VBQ1gscUNBQXFDO0VBQ3JDLGtCQUFrQjtFQUNsQixrQkFBa0I7RUFDbEIsZ0JBQWdCO0FBQ2xCOztBQUVBO0VBQ0UsWUFBWTtFQUNaLG1CQUFtQjtFQUNuQiwyQkFBMkI7QUFDN0I7O0FBRUE7RUFDRSxlQUFlO0VBQ2YsY0FBYztFQUNkLGdCQUFnQjtFQUNoQixlQUFlO0VBQ2YsaUJBQWlCO0FBQ25COztBQUVBLG9CQUFvQjtBQUNwQjtFQUNFLGFBQWE7RUFDYixzQkFBc0I7RUFDdEIsUUFBUTtBQUNWOztBQUVBO0VBQ0UsYUFBYTtFQUNiLDhCQUE4QjtFQUM5QixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxlQUFlO0VBQ2YscUNBQXFDO0FBQ3ZDOztBQUVBO0VBQ0UsZUFBZTtFQUNmLGdCQUFnQjtFQUNoQixtQ0FBbUM7QUFDckM7O0FBRUEsb0JBQW9CO0FBQ3BCO0VBQ0UsYUFBYTtFQUNiLHFDQUFxQztFQUNyQyxRQUFRO0FBQ1Y7O0FBRUE7RUFDRSxZQUFZO0VBQ1osK0NBQStDO0VBQy9DLHlEQUF5RDtFQUN6RCxrQkFBa0I7RUFDbEIsbUNBQW1DO0VBQ25DLGVBQWU7RUFDZixnQkFBZ0I7RUFDaEIsZUFBZTtFQUNmLHlCQUF5QjtBQUMzQjs7QUFFQTtFQUNFLGtEQUFrRDtFQUNsRCxxQkFBcUI7RUFDckIsY0FBYztBQUNoQjs7QUFFQSxnQkFBZ0I7QUFDaEI7RUFDRSxxQkFBcUI7RUFDckIsbUJBQW1CO0VBQ25CLHVCQUF1QjtFQUN2Qix5QkFBeUI7RUFDekIsd0JBQXdCO0VBQ3hCLG1CQUFtQjtFQUNuQix5QkFBeUI7RUFDekIsdUJBQXVCO0VBQ3ZCLDJCQUEyQjtFQUMzQixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLDBCQUEwQjtFQUMxQixvQkFBb0I7RUFDcEIsdUJBQXVCO0VBQ3ZCLDhCQUE4QjtFQUM5QixrQ0FBa0M7RUFDbEMsaUNBQWlDO0FBQ25DOztBQUVBLHNCQUFzQjtBQUN0QjtFQUNFO0lBQ0UsZUFBZTtJQUNmLGFBQWE7RUFDZjs7RUFFQTtJQUNFLDBCQUEwQjtFQUM1Qjs7RUFFQTtJQUNFLDBCQUEwQjtFQUM1QjtBQUNGOztBQUVBLGtCQUFrQjtBQUNsQjtFQUNFO0lBQ0UsMEJBQTBCO0lBQzFCLDJCQUEyQjtFQUM3QjtBQUNGOztBQUVBLDBDQUEwQztBQUMxQzs7OztFQUlFLDBCQUEwQjtFQUMxQixtQkFBbUI7QUFDckIiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBPcmRlciBGb3JtIENvbnRhaW5lciAqL1xuLm9yZGVyLWZvcm0tY29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiAxNnB4O1xuICBwYWRkaW5nOiAyMHB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iZy1wcmltYXJ5LCAjMWExZDI2KTtcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2U0ZTRlNyk7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgbWF4LXdpZHRoOiA0MDBweDtcbiAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgUm9ib3RvLCBzYW5zLXNlcmlmO1xufVxuXG4vKiBIZWFkZXIgKi9cbi5vcmRlci1mb3JtLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgbWFyZ2luLWJvdHRvbTogOHB4O1xufVxuXG4ub3JkZXItZm9ybS10aXRsZSB7XG4gIGZvbnQtc2l6ZTogMjBweDtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgbWFyZ2luOiAwO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZmZmZmZmKTtcbn1cblxuLmhlYWRlci1hY3Rpb25zIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZ2FwOiA4cHg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5pY29uLWJ1dHRvbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB3aWR0aDogMzJweDtcbiAgaGVpZ2h0OiAzMnB4O1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyOiBub25lO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgI2ExYTFhYSk7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbn1cblxuLmljb24tYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmctaG92ZXIsICMyYTJkM2EpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZTRlNGU3KTtcbn1cblxuLm5vdGlmaWNhdGlvbi1idXR0b24ge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG5cbi5ub3RpZmljYXRpb24tYmFkZ2Uge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogNnB4O1xuICByaWdodDogNnB4O1xuICB3aWR0aDogNnB4O1xuICBoZWlnaHQ6IDZweDtcbiAgYmFja2dyb3VuZDogI2VmNDQ0NDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xufVxuXG4vKiBNYXJnaW4gTW9kZSAmIExldmVyYWdlICovXG4ubWFyZ2luLWxldmVyYWdlLXJvdyB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDFmcjtcbiAgZ2FwOiAxMnB4O1xufVxuXG4ubWFyZ2luLW1vZGUtc2VsZWN0LFxuLmxldmVyYWdlLXNlbGVjdCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cblxuLmxldmVyYWdlLWxhYmVsIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICByaWdodDogMzZweDtcbiAgdG9wOiA1MCU7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTtcbiAgZm9udC1zaXplOiAxNnB4O1xuICBmb250LXdlaWdodDogNjAwO1xuICBjb2xvcjogI0Y3QTYwMDtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG5cbi8qIE9yZGVyIFR5cGUgVGFicyAqL1xuLm9yZGVyLXR5cGUtdGFicyB7XG4gIG1hcmdpbi1ib3R0b206IDhweDtcbn1cblxuLm9yZGVyLXR5cGUtdGFicyA6Om5nLWRlZXAgLnRhYnMge1xuICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCAjMmEyZDNhKTtcbn1cblxuLm9yZGVyLXR5cGUtdGFicyA6Om5nLWRlZXAgLnRhYiB7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgI2ExYTFhYSk7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgcGFkZGluZzogOHB4IDE2cHg7XG4gIGJvcmRlcjogbm9uZTtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbn1cblxuLm9yZGVyLXR5cGUtdGFicyA6Om5nLWRlZXAgLnRhYi1hY3RpdmUge1xuICBjb2xvcjogI0Y3QTYwMDtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkICNGN0E2MDA7XG59XG5cbi5vcmRlci10eXBlLXRhYnMgOjpuZy1kZWVwIC50YWI6aG92ZXI6bm90KC50YWItYWN0aXZlKSB7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNlNGU0ZTcpO1xufVxuXG4vKiBGb3JtICovXG4ub3JkZXItZm9ybSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMTZweDtcbn1cblxuLmZvcm0tZ3JvdXAge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbn1cblxuLmZvcm0tbGFiZWwge1xuICBmb250LXNpemU6IDE0cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgI2ExYTFhYSk7XG4gIGZvbnQtd2VpZ2h0OiA0MDA7XG59XG5cbi5mb3JtLWlucHV0IHtcbiAgd2lkdGg6IDEwMCU7XG4gIHBhZGRpbmc6IDEycHggMTZweDtcbiAgYmFja2dyb3VuZDogdmFyKC0taW5wdXQtYmcsICMyYTJkM2EpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1pbnB1dC1ib3JkZXIsICMzYTNkNGEpO1xuICBib3JkZXItcmFkaXVzOiA2cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNmZmZmZmYpO1xuICBmb250LXNpemU6IDE2cHg7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gIG91dGxpbmU6IG5vbmU7XG59XG5cbi5mb3JtLWlucHV0OmZvY3VzIHtcbiAgYm9yZGVyLWNvbG9yOiAjRjdBNjAwO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1pbnB1dC1iZy1mb2N1cywgIzJhMmQzYSk7XG59XG5cbi5mb3JtLWlucHV0LmVycm9yIHtcbiAgYm9yZGVyLWNvbG9yOiAjZWY0NDQ0O1xufVxuXG4uZm9ybS1pbnB1dDo6cGxhY2Vob2xkZXIge1xuICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSwgIzUyNTI1Yik7XG59XG5cbi8qIElucHV0IHdpdGggQWN0aW9ucyAqL1xuLmlucHV0LXdpdGgtYWN0aW9ucyB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLnByaWNlLWlucHV0IHtcbiAgcGFkZGluZy1yaWdodDogMTIwcHg7XG59XG5cbi5pbnB1dC1hY3Rpb24tYnV0dG9uIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICByaWdodDogOHB4O1xuICBoZWlnaHQ6IDI4cHg7XG4gIHBhZGRpbmc6IDAgMTJweDtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGJvcmRlcjogbm9uZTtcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xuICBjb2xvcjogI0Y3QTYwMDtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBmb250LXdlaWdodDogNTAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG59XG5cbi5pbnB1dC1hY3Rpb24tYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogcmdiYSgyNDcsIDE2NiwgMCwgMC4xKTtcbn1cblxuLmxhc3QtYnV0dG9uIHtcbiAgcmlnaHQ6IDQ4cHg7XG59XG5cbi50cmFuc2Zlci1idXR0b24ge1xuICByaWdodDogOHB4O1xuICB3aWR0aDogMjhweDtcbiAgcGFkZGluZzogMDtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5jdXJyZW50LXByaWNlIHtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICNhMWExYWEpO1xuICBtYXJnaW4tdG9wOiA0cHg7XG59XG5cbi8qIElucHV0IHdpdGggVW5pdCAqL1xuLmlucHV0LXdpdGgtdW5pdCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLnF1YW50aXR5LWlucHV0IHtcbiAgcGFkZGluZy1yaWdodDogMTAwcHg7XG59XG5cbi51bml0LXNlbGVjdCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgcmlnaHQ6IDhweDtcbiAgd2lkdGg6IDgwcHg7XG59XG5cbi8qIFF1YW50aXR5IFNsaWRlciAqL1xuLnF1YW50aXR5LXNsaWRlci1jb250YWluZXIge1xuICBtYXJnaW4tdG9wOiAtOHB4O1xufVxuXG4ucXVhbnRpdHktc2xpZGVyIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogNnB4O1xuICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XG4gIGFwcGVhcmFuY2U6IG5vbmU7XG4gIGJhY2tncm91bmQ6IHZhcigtLXNsaWRlci1iZywgIzNhM2Q0YSk7XG4gIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgb3V0bGluZTogbm9uZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuXG4ucXVhbnRpdHktc2xpZGVyOjotd2Via2l0LXNsaWRlci10aHVtYiB7XG4gIC13ZWJraXQtYXBwZWFyYW5jZTogbm9uZTtcbiAgYXBwZWFyYW5jZTogbm9uZTtcbiAgd2lkdGg6IDE2cHg7XG4gIGhlaWdodDogMTZweDtcbiAgYmFja2dyb3VuZDogI0Y3QTYwMDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG59XG5cbi5xdWFudGl0eS1zbGlkZXI6Oi13ZWJraXQtc2xpZGVyLXRodW1iOmhvdmVyIHtcbiAgdHJhbnNmb3JtOiBzY2FsZSgxLjEpO1xufVxuXG4ucXVhbnRpdHktc2xpZGVyOjotbW96LXJhbmdlLXRodW1iIHtcbiAgd2lkdGg6IDE2cHg7XG4gIGhlaWdodDogMTZweDtcbiAgYmFja2dyb3VuZDogI0Y3QTYwMDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBib3JkZXI6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbn1cblxuLnF1YW50aXR5LXNsaWRlcjo6LW1vei1yYW5nZS10aHVtYjpob3ZlciB7XG4gIHRyYW5zZm9ybTogc2NhbGUoMS4xKTtcbn1cblxuLnNsaWRlci1tYXJrZXJzIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBtYXJnaW4tdG9wOiA4cHg7XG59XG5cbi5zbGlkZXItbWFya2VyIHtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjb2xvcjogdmFyKC0tdGV4dC10ZXJ0aWFyeSwgIzUyNTI1Yik7XG59XG5cbi5zbGlkZXItbWFya2VyLmFjdGl2ZSB7XG4gIGNvbG9yOiAjRjdBNjAwO1xuICBmb250LXdlaWdodDogNTAwO1xufVxuXG4vKiBWYWx1ZSBEaXNwbGF5IFNlY3Rpb24gKi9cbi52YWx1ZS1kaXNwbGF5LXNlY3Rpb24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDhweDtcbiAgcGFkZGluZzogMTJweCAxNnB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS12YWx1ZS1kaXNwbGF5LWJnLCAjMjMyNjMxKTtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xufVxuXG4udmFsdWUtcm93IHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4udmFsdWUtbGFiZWwge1xuICBmb250LXNpemU6IDE0cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgI2ExYTFhYSk7XG59XG5cbi52YWx1ZS1hbW91bnQge1xuICBmb250LXNpemU6IDE0cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNlNGU0ZTcpO1xufVxuXG4udmFsdWUtZGFzaCB7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXRlcnRpYXJ5LCAjNTI1MjViKTtcbn1cblxuLnZhbHVlLXNlcGFyYXRvciB7XG4gIG1hcmdpbjogMCA0cHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXRlcnRpYXJ5LCAjNTI1MjViKTtcbn1cblxuLnZhbHVlLXVuaXQge1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICNhMWExYWEpO1xuICBtYXJnaW4tbGVmdDogNHB4O1xufVxuXG4ubGlxLXByaWNlLXJvdyAudmFsdWUtbGFiZWwge1xuICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcbiAgdGV4dC1kZWNvcmF0aW9uLXN0eWxlOiBkYXNoZWQ7XG4gIHRleHQtdW5kZXJsaW5lLW9mZnNldDogNHB4O1xufVxuXG4uY2FsY3VsYXRlLWJ1dHRvbiB7XG4gIHBhZGRpbmc6IDRweCAxMnB4O1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yLCAjM2EzZDRhKTtcbiAgYm9yZGVyLXJhZGl1czogNHB4O1xuICBjb2xvcjogI0Y3QTYwMDtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG59XG5cbi5jYWxjdWxhdGUtYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogcmdiYSgyNDcsIDE2NiwgMCwgMC4xKTtcbiAgYm9yZGVyLWNvbG9yOiAjRjdBNjAwO1xufVxuXG4vKiBUUC9TTCBTZWN0aW9uICovXG4udHBzbC1zZWN0aW9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiAxMnB4O1xufVxuXG4udHBzbC1oZWFkZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5jaGVja2JveC1sYWJlbCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogOHB4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHVzZXItc2VsZWN0OiBub25lO1xufVxuXG4uY2hlY2tib3gtaW5wdXQge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIG9wYWNpdHk6IDA7XG4gIHdpZHRoOiAwO1xuICBoZWlnaHQ6IDA7XG59XG5cbi5jaGVja2JveC1jdXN0b20ge1xuICB3aWR0aDogMThweDtcbiAgaGVpZ2h0OiAxOHB4O1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1jaGVja2JveC1iZywgIzJhMmQzYSk7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWNoZWNrYm94LWJvcmRlciwgIzNhM2Q0YSk7XG4gIGJvcmRlci1yYWRpdXM6IDNweDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xufVxuXG4uY2hlY2tib3gtaW5wdXQ6Y2hlY2tlZCArIC5jaGVja2JveC1jdXN0b20ge1xuICBiYWNrZ3JvdW5kOiAjRjdBNjAwO1xuICBib3JkZXItY29sb3I6ICNGN0E2MDA7XG59XG5cbi5jaGVja2JveC1pbnB1dDpjaGVja2VkICsgLmNoZWNrYm94LWN1c3RvbTo6YWZ0ZXIge1xuICBjb250ZW50OiAnJztcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBsZWZ0OiA1cHg7XG4gIHRvcDogMnB4O1xuICB3aWR0aDogNXB4O1xuICBoZWlnaHQ6IDlweDtcbiAgYm9yZGVyOiBzb2xpZCAjMWExZDI2O1xuICBib3JkZXItd2lkdGg6IDAgMnB4IDJweCAwO1xuICB0cmFuc2Zvcm06IHJvdGF0ZSg0NWRlZyk7XG59XG5cbi5jaGVja2JveC10ZXh0IHtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZTRlNGU3KTtcbn1cblxuLnRwc2wtbW9kZS10b2dnbGUge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDRweDtcbiAgcGFkZGluZzogNHB4IDhweDtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGJvcmRlcjogbm9uZTtcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2U0ZTRlNyk7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xufVxuXG4udHBzbC1tb2RlLXRvZ2dsZTpob3ZlciB7XG4gIGNvbG9yOiAjRjdBNjAwO1xufVxuXG4udG9nZ2xlLWljb24ge1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4ycyBlYXNlO1xufVxuXG4udHBzbC1pbnB1dHMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDEycHg7XG59XG5cbi5pbnB1dC13aXRoLWRyb3Bkb3duIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uaW5wdXQtd2l0aC1kcm9wZG93biAuZm9ybS1pbnB1dCB7XG4gIHBhZGRpbmctcmlnaHQ6IDgwcHg7XG59XG5cbi5kcm9wZG93bi1idXR0b24ge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHJpZ2h0OiA4cHg7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogNHB4O1xuICBwYWRkaW5nOiA0cHggOHB4O1xuICBiYWNrZ3JvdW5kOiB0cmFuc3BhcmVudDtcbiAgYm9yZGVyOiBub25lO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICNhMWExYWEpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbn1cblxuLmRyb3Bkb3duLWJ1dHRvbjpob3ZlciB7XG4gIGNvbG9yOiAjRjdBNjAwO1xufVxuXG4vKiBPcmRlciBPcHRpb25zICovXG4ub3JkZXItb3B0aW9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiAxMnB4O1xufVxuXG4vKiBBY3Rpb24gQnV0dG9ucyAqL1xuLmFjdGlvbi1idXR0b25zIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnIgMWZyO1xuICBnYXA6IDEycHg7XG4gIG1hcmdpbi10b3A6IDhweDtcbn1cblxuLmFjdGlvbi1idXR0b24ge1xuICBoZWlnaHQ6IDQ4cHg7XG4gIGJvcmRlcjogbm9uZTtcbiAgYm9yZGVyLXJhZGl1czogNnB4O1xuICBmb250LXNpemU6IDE2cHg7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG59XG5cbi5hY3Rpb24tYnV0dG9uOmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMC41O1xuICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xufVxuXG4ubG9uZy1idXR0b24ge1xuICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMDBDMDc2IDAlLCAjMDBBODYyIDEwMCUpO1xuICBjb2xvcjogI2ZmZmZmZjtcbiAgYm94LXNoYWRvdzogMCAycHggOHB4IHJnYmEoMCwgMTkyLCAxMTgsIDAuMyk7XG59XG5cbi5sb25nLWJ1dHRvbjpob3Zlcjpub3QoOmRpc2FibGVkKSB7XG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICMwMEQ2N0YgMCUsICMwMEMwNzYgMTAwJSk7XG4gIGJveC1zaGFkb3c6IDAgNHB4IDEycHggcmdiYSgwLCAxOTIsIDExOCwgMC40KTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xcHgpO1xufVxuXG4uc2hvcnQtYnV0dG9uIHtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI0ZGNEQ0RiAwJSwgI0RDMjYyNiAxMDAlKTtcbiAgY29sb3I6ICNmZmZmZmY7XG4gIGJveC1zaGFkb3c6IDAgMnB4IDhweCByZ2JhKDI1NSwgNzcsIDc5LCAwLjMpO1xufVxuXG4uc2hvcnQtYnV0dG9uOmhvdmVyOm5vdCg6ZGlzYWJsZWQpIHtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgI0ZGNjY2OCAwJSwgI0VGNDQ0NCAxMDAlKTtcbiAgYm94LXNoYWRvdzogMCA0cHggMTJweCByZ2JhKDI1NSwgNzcsIDc5LCAwLjQpO1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTFweCk7XG59XG5cbi5sb2FkaW5nLXNwaW5uZXIge1xuICB3aWR0aDogMjBweDtcbiAgaGVpZ2h0OiAyMHB4O1xuICBib3JkZXI6IDJweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgYm9yZGVyLXRvcDogMnB4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xuICBhbmltYXRpb246IHNwaW4gMXMgbGluZWFyIGluZmluaXRlO1xufVxuXG5Aa2V5ZnJhbWVzIHNwaW4ge1xuICAwJSB7IHRyYW5zZm9ybTogcm90YXRlKDBkZWcpOyB9XG4gIDEwMCUgeyB0cmFuc2Zvcm06IHJvdGF0ZSgzNjBkZWcpOyB9XG59XG5cbi8qIEZvcm0gRm9vdGVyICovXG4uZm9ybS1mb290ZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtc3RhcnQ7XG4gIGdhcDogMjRweDtcbiAgbWFyZ2luLXRvcDogOHB4O1xufVxuXG4uZm9vdGVyLWxpbmsge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDZweDtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGJvcmRlcjogbm9uZTtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjYTFhMWFhKTtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IGFsbCAwLjJzIGVhc2U7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cblxuLmZvb3Rlci1saW5rOmhvdmVyIHtcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2U0ZTRlNyk7XG59XG5cbi5ub3RpZmljYXRpb24tZG90IHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAtNHB4O1xuICB3aWR0aDogNnB4O1xuICBoZWlnaHQ6IDZweDtcbiAgYmFja2dyb3VuZDogI2VmNDQ0NDtcbiAgYm9yZGVyLXJhZGl1czogNTAlO1xufVxuXG4vKiBBY2NvdW50IFNlY3Rpb24gKi9cbi5hY2NvdW50LXNlY3Rpb24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDE2cHg7XG4gIHBhZGRpbmc6IDE2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWFjY291bnQtYmcsICMyMzI2MzEpO1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIG1hcmdpbi10b3A6IDhweDtcbn1cblxuLmFjY291bnQtaGVhZGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uYWNjb3VudC10aXRsZSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGdhcDogOHB4O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNlNGU0ZTcpO1xufVxuXG4uaWNvbi1idXR0b24tc21hbGwge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgd2lkdGg6IDIwcHg7XG4gIGhlaWdodDogMjBweDtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGJvcmRlcjogbm9uZTtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjYTFhMWFhKTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xufVxuXG4uaWNvbi1idXR0b24tc21hbGw6aG92ZXIge1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZTRlNGU3KTtcbn1cblxuLnBubC1idXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBnYXA6IDRweDtcbiAgcGFkZGluZzogNHB4IDhweDtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvciwgIzNhM2Q0YSk7XG4gIGJvcmRlci1yYWRpdXM6IDRweDtcbiAgY29sb3I6ICNGN0E2MDA7XG4gIGZvbnQtc2l6ZTogMTJweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xufVxuXG4ucG5sLWJ1dHRvbjpob3ZlciB7XG4gIGJhY2tncm91bmQ6IHJnYmEoMjQ3LCAxNjYsIDAsIDAuMSk7XG4gIGJvcmRlci1jb2xvcjogI0Y3QTYwMDtcbn1cblxuLm1hcmdpbi1tb2RlLXJvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLm1hcmdpbi1sYWJlbCB7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgY29sb3I6IHZhcigtLXRleHQtc2Vjb25kYXJ5LCAjYTFhMWFhKTtcbn1cblxuLm1hcmdpbi1tb2RlLXZhbHVlIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgZ2FwOiA0cHg7XG4gIHBhZGRpbmc6IDRweCA4cHg7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBib3JkZXI6IG5vbmU7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnksICNlNGU0ZTcpO1xuICBmb250LXNpemU6IDE0cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbjogYWxsIDAuMnMgZWFzZTtcbn1cblxuLm1hcmdpbi1tb2RlLXZhbHVlOmhvdmVyIHtcbiAgY29sb3I6ICNGN0E2MDA7XG59XG5cbi8qIE1hcmdpbiBTbGlkZXJzICovXG4ubWFyZ2luLXNsaWRlcnMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBnYXA6IDEycHg7XG59XG5cbi5tYXJnaW4tc2xpZGVyLXJvdyB7XG4gIGRpc3BsYXk6IGdyaWQ7XG4gIGdyaWQtdGVtcGxhdGUtY29sdW1uczogYXV0byAxZnIgYXV0bztcbiAgZ2FwOiAxMnB4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xufVxuXG4uc2xpZGVyLWxhYmVsIHtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnksICNhMWExYWEpO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xufVxuXG4uc2xpZGVyLWNvbnRhaW5lciB7XG4gIGZsZXg6IDE7XG59XG5cbi5zbGlkZXItdHJhY2sge1xuICBoZWlnaHQ6IDRweDtcbiAgYmFja2dyb3VuZDogdmFyKC0tc2xpZGVyLWJnLCAjM2EzZDRhKTtcbiAgYm9yZGVyLXJhZGl1czogMnB4O1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIG92ZXJmbG93OiBoaWRkZW47XG59XG5cbi5zbGlkZXItZmlsbCB7XG4gIGhlaWdodDogMTAwJTtcbiAgYmFja2dyb3VuZDogIzAwQzA3NjtcbiAgdHJhbnNpdGlvbjogd2lkdGggMC4zcyBlYXNlO1xufVxuXG4uc2xpZGVyLXZhbHVlIHtcbiAgZm9udC1zaXplOiAxMnB4O1xuICBjb2xvcjogIzAwQzA3NjtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgbWluLXdpZHRoOiA0NXB4O1xuICB0ZXh0LWFsaWduOiByaWdodDtcbn1cblxuLyogQmFsYW5jZSBEaXNwbGF5ICovXG4uYmFsYW5jZS1kaXNwbGF5IHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiA4cHg7XG59XG5cbi5iYWxhbmNlLXJvdyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLmJhbGFuY2UtbGFiZWwge1xuICBmb250LXNpemU6IDEzcHg7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSwgI2ExYTFhYSk7XG59XG5cbi5iYWxhbmNlLXZhbHVlIHtcbiAgZm9udC1zaXplOiAxM3B4O1xuICBmb250LXdlaWdodDogNTAwO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5LCAjZTRlNGU3KTtcbn1cblxuLyogQWNjb3VudCBBY3Rpb25zICovXG4uYWNjb3VudC1hY3Rpb25zIHtcbiAgZGlzcGxheTogZ3JpZDtcbiAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiByZXBlYXQoMywgMWZyKTtcbiAgZ2FwOiA4cHg7XG59XG5cbi5hY2NvdW50LWFjdGlvbi1idXR0b24ge1xuICBoZWlnaHQ6IDM2cHg7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJ1dHRvbi1zZWNvbmRhcnktYmcsICMyYTJkM2EpO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1idXR0b24tc2Vjb25kYXJ5LWJvcmRlciwgIzNhM2Q0YSk7XG4gIGJvcmRlci1yYWRpdXM6IDZweDtcbiAgY29sb3I6IHZhcigtLXRleHQtcHJpbWFyeSwgI2U0ZTRlNyk7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uOiBhbGwgMC4ycyBlYXNlO1xufVxuXG4uYWNjb3VudC1hY3Rpb24tYnV0dG9uOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tYnV0dG9uLXNlY29uZGFyeS1ob3ZlciwgIzM1Mzg0Nik7XG4gIGJvcmRlci1jb2xvcjogI0Y3QTYwMDtcbiAgY29sb3I6ICNGN0E2MDA7XG59XG5cbi8qIExpZ2h0IFRoZW1lICovXG46aG9zdC1jb250ZXh0KC5saWdodC10aGVtZSkgLm9yZGVyLWZvcm0tY29udGFpbmVyIHtcbiAgLS1iZy1wcmltYXJ5OiAjZmZmZmZmO1xuICAtLWJnLWhvdmVyOiAjZjRmNGY1O1xuICAtLXRleHQtcHJpbWFyeTogIzE4MTgxYjtcbiAgLS10ZXh0LXNlY29uZGFyeTogIzcxNzE3YTtcbiAgLS10ZXh0LXRlcnRpYXJ5OiAjYTFhMWFhO1xuICAtLWlucHV0LWJnOiAjZjRmNGY1O1xuICAtLWlucHV0LWJnLWZvY3VzOiAjZmZmZmZmO1xuICAtLWlucHV0LWJvcmRlcjogI2U0ZTRlNztcbiAgLS12YWx1ZS1kaXNwbGF5LWJnOiAjZmFmYWZhO1xuICAtLWFjY291bnQtYmc6ICNmYWZhZmE7XG4gIC0tY2hlY2tib3gtYmc6ICNmNGY0ZjU7XG4gIC0tY2hlY2tib3gtYm9yZGVyOiAjZDRkNGQ4O1xuICAtLXNsaWRlci1iZzogI2U0ZTRlNztcbiAgLS1ib3JkZXItY29sb3I6ICNlNGU0ZTc7XG4gIC0tYnV0dG9uLXNlY29uZGFyeS1iZzogI2Y0ZjRmNTtcbiAgLS1idXR0b24tc2Vjb25kYXJ5LWJvcmRlcjogI2U0ZTRlNztcbiAgLS1idXR0b24tc2Vjb25kYXJ5LWhvdmVyOiAjZTRlNGU3O1xufVxuXG4vKiBSZXNwb25zaXZlIERlc2lnbiAqL1xuQG1lZGlhIChtYXgtd2lkdGg6IDc2OHB4KSB7XG4gIC5vcmRlci1mb3JtLWNvbnRhaW5lciB7XG4gICAgbWF4LXdpZHRoOiAxMDAlO1xuICAgIHBhZGRpbmc6IDE2cHg7XG4gIH1cblxuICAuYWN0aW9uLWJ1dHRvbnMge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLmFjY291bnQtYWN0aW9ucyB7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gIH1cbn1cblxuLyogQWNjZXNzaWJpbGl0eSAqL1xuQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpIHtcbiAgKiB7XG4gICAgYW5pbWF0aW9uOiBub25lICFpbXBvcnRhbnQ7XG4gICAgdHJhbnNpdGlvbjogbm9uZSAhaW1wb3J0YW50O1xuICB9XG59XG5cbi8qIEZvY3VzIHZpc2libGUgZm9yIGtleWJvYXJkIG5hdmlnYXRpb24gKi9cbi5hY3Rpb24tYnV0dG9uOmZvY3VzLXZpc2libGUsXG4uaWNvbi1idXR0b246Zm9jdXMtdmlzaWJsZSxcbi5mb3JtLWlucHV0OmZvY3VzLXZpc2libGUsXG4uY2hlY2tib3gtaW5wdXQ6Zm9jdXMtdmlzaWJsZSArIC5jaGVja2JveC1jdXN0b20ge1xuICBvdXRsaW5lOiAycHggc29saWQgI0Y3QTYwMDtcbiAgb3V0bGluZS1vZmZzZXQ6IDJweDtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return OrderFormComponent;
})();

/***/ }),

/***/ 3015:
/*!*************************************************************************************!*\
  !*** ./src/app/components/trading/trading-dashboard/trading-dashboard.component.ts ***!
  \*************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TradingDashboardComponent: () => (/* binding */ TradingDashboardComponent)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! @angular/common */ 316);
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/forms */ 4456);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! rxjs */ 819);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! rxjs */ 3900);
/* harmony import */ var _ui_card_card_component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../ui/card/card.component */ 3922);
/* harmony import */ var _ui_button_button_component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../ui/button/button.component */ 5782);
/* harmony import */ var _lightweight_chart_lightweight_chart_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../lightweight-chart/lightweight-chart.component */ 1037);
/* harmony import */ var _order_form_order_form_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../order-form/order-form.component */ 4607);
/* harmony import */ var _services_manual_trading_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../../services/manual-trading.service */ 6212);
/* harmony import */ var _services_translation_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../services/translation.service */ 6845);
/* harmony import */ var _services_exchange_credentials_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../../services/exchange-credentials.service */ 9704);
/* harmony import */ var _services_bybit_service__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../../services/bybit.service */ 6798);
/* harmony import */ var _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../../models/exchange-credentials.model */ 7392);





// UI Components




// Services







const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.orderId;
function TradingDashboardComponent_Conditional_5_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 4)(1, "app-lightweight-chart", 15);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵlistener"]("credentialChange", function TradingDashboardComponent_Conditional_5_Template_app_lightweight_chart_credentialChange_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵresetView"](ctx_r1.onCredentialChange($event));
    })("symbolChange", function TradingDashboardComponent_Conditional_5_Template_app_lightweight_chart_symbolChange_1_listener($event) {
      _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrestoreView"](_r1);
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
      return _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵresetView"](ctx_r1.onSymbolChange($event));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    let tmp_9_0;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("symbol", ctx_r1.chartSymbol)("chartHeight", 600)("showCredentialSelector", true)("showSymbolSelector", true)("showEnvironmentBadge", true)("credentialOptions", ctx_r1.credentialOptions())("symbolOptions", ctx_r1.symbolOptions())("isLoadingSymbols", ctx_r1.isLoadingSymbols())("environment", ((tmp_9_0 = ctx_r1.selectedCredential()) == null ? null : tmp_9_0.environment) || "TESTNET");
  }
}
function TradingDashboardComponent_Conditional_14_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.positions().length);
  }
}
function TradingDashboardComponent_Conditional_16_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 11)(1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.loading"));
  }
}
function TradingDashboardComponent_Conditional_17_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 12)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.positions.empty"));
  }
}
function TradingDashboardComponent_Conditional_18_For_22_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "tr")(1, "td", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](3, "td")(4, "span", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](6, "td", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](8, "td", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](10, "td", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](12, "td", 18)(13, "div", 25)(14, "div");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](16, "div", 26);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](18, "td", 19)(19, "span", 27);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](20);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](21, "td", 19)(22, "ui-button", 28);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵlistener"]("clicked", function TradingDashboardComponent_Conditional_18_For_22_Template_ui_button_clicked_22_listener() {
      const position_r4 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrestoreView"](_r3).$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵresetView"](ctx_r1.closePosition(position_r4));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](23);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const position_r4 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](position_r4.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngClass", ctx_r1.getSideClass(position_r4.side));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", position_r4.side, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](position_r4.size);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(position_r4.entryPrice));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.formatCurrency(position_r4.markPrice));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngClass", ctx_r1.getPnlClass(position_r4.unrealizedPnl));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.formatPnl(position_r4.unrealizedPnl));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.formatPnlPercent(position_r4.unrealizedPnlPercent));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](3);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"]("", position_r4.leverage, "x");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵattribute"]("aria-label", "Close position for " + position_r4.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("trading.actions.close"), " ");
  }
}
function TradingDashboardComponent_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 16)(1, "table", 17)(2, "thead")(3, "tr")(4, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](8, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](10, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](12, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](14, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](16, "th", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](18, "th", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](20, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrepeaterCreate"](21, TradingDashboardComponent_Conditional_18_For_22_Template, 24, 12, "tr", null, _forTrack0);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](23, "div", 20)(24, "span", 21);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](25);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](26, "span", 22);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](27);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.symbol"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.side"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.size"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.entryPrice"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.markPrice"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.unrealizedPnl"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.leverage"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.actions"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrepeater"](ctx_r1.positions());
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"]("", ctx_r1.translate("trading.positions.totalUnrealizedPnl"), ":");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngClass", ctx_r1.getPnlClass(ctx_r1.totalUnrealizedPnl()));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", ctx_r1.formatPnl(ctx_r1.totalUnrealizedPnl()), " ");
  }
}
function TradingDashboardComponent_Conditional_23_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "span", 10);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.orders().length);
  }
}
function TradingDashboardComponent_Conditional_25_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 11)(1, "span");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.loading"));
  }
}
function TradingDashboardComponent_Conditional_26_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 12)(1, "p");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.orders.empty"));
  }
}
function TradingDashboardComponent_Conditional_27_For_22_Conditional_18_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵgetCurrentView"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "ui-button", 33);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵlistener"]("clicked", function TradingDashboardComponent_Conditional_27_For_22_Conditional_18_Template_ui_button_clicked_0_listener() {
      _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrestoreView"](_r5);
      const order_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]().$implicit;
      const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
      return _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵresetView"](ctx_r1.cancelOrder(order_r6));
    });
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
  }
  if (rf & 2) {
    const order_r6 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]().$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵattribute"]("aria-label", "Cancel order for " + order_r6.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", ctx_r1.translate("trading.actions.cancel"), " ");
  }
}
function TradingDashboardComponent_Conditional_27_For_22_Conditional_19_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "span", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](1, "-");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
  }
}
function TradingDashboardComponent_Conditional_27_For_22_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "tr")(1, "td", 23);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](3, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](4);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](5, "td")(6, "span", 24);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](8, "td", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](10, "td", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](12, "td")(13, "span", 30);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](14);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](15, "td");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](16);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](17, "td", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](18, TradingDashboardComponent_Conditional_27_For_22_Conditional_18_Template, 2, 2, "ui-button", 31)(19, TradingDashboardComponent_Conditional_27_For_22_Conditional_19_Template, 2, 0, "span", 32);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
  }
  if (rf & 2) {
    const order_r6 = ctx.$implicit;
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](order_r6.symbol);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](order_r6.type);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("ngClass", ctx_r1.getSideClass(order_r6.side));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", order_r6.side, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](order_r6.quantity);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", order_r6.price ? ctx_r1.formatCurrency(order_r6.price) : "-", " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵattribute"]("data-status", order_r6.status);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", order_r6.status, " ");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.formatDate(order_r6.createdAt));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵconditional"](ctx_r1.canCancelOrder(order_r6) ? 18 : 19);
  }
}
function TradingDashboardComponent_Conditional_27_Template(rf, ctx) {
  if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 14)(1, "table", 29)(2, "thead")(3, "tr")(4, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](6, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](7);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](8, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](9);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](10, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](11);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](12, "th", 18);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](13);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](14, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](15);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](16, "th");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](17);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](18, "th", 19);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](19);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](20, "tbody");
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrepeaterCreate"](21, TradingDashboardComponent_Conditional_27_For_22_Template, 20, 10, "tr", null, _forTrack1);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
  }
  if (rf & 2) {
    const ctx_r1 = _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵnextContext"]();
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](5);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.symbol"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.type"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.side"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.quantity"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.price"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.status"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.time"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx_r1.translate("trading.table.actions"));
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
    _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵrepeater"](ctx_r1.orders());
  }
}
/**
 * Trading Dashboard Component
 *
 * Comprehensive manual trading interface for cryptocurrency exchanges.
 * Provides functionality for:
 * - Placing market and limit orders with advanced options
 * - Monitoring open positions with real-time PnL updates
 * - Viewing order history with filtering and pagination
 * - Tracking account balance and margin usage
 *
 * Features:
 * - Reactive forms with real-time validation
 * - Angular Signals for efficient state management
 * - Auto-refresh capability for real-time data
 * - Responsive design for all device sizes
 * - Comprehensive error handling and user feedback
 * - Accessibility support (ARIA labels, keyboard navigation)
 *
 * @example
 * Usage in template:
 * ```html
 * <trading-dashboard></trading-dashboard>
 * ```
 */
let TradingDashboardComponent = /*#__PURE__*/(() => {
  class TradingDashboardComponent {
    // Getters and setters for ngModel binding
    get selectedCredentialId() {
      return this._selectedCredentialId();
    }
    set selectedCredentialId(value) {
      this._selectedCredentialId.set(value);
    }
    get selectedSymbol() {
      return this._selectedSymbol();
    }
    set selectedSymbol(value) {
      this._selectedSymbol.set(value);
    }
    constructor() {
      // No form initialization needed - using OrderFormComponent
      // Injected services
      this.http = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.inject)(_angular_common_http__WEBPACK_IMPORTED_MODULE_10__.HttpClient);
      this.tradingService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.inject)(_services_manual_trading_service__WEBPACK_IMPORTED_MODULE_4__.ManualTradingService);
      this.translationService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.inject)(_services_translation_service__WEBPACK_IMPORTED_MODULE_5__.TranslationService);
      this.credentialsService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.inject)(_services_exchange_credentials_service__WEBPACK_IMPORTED_MODULE_6__.ExchangeCredentialsService);
      this.bybitService = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.inject)(_services_bybit_service__WEBPACK_IMPORTED_MODULE_7__.BybitService);
      // Component lifecycle
      this.destroy$ = new rxjs__WEBPACK_IMPORTED_MODULE_11__.Subject();
      // State signals
      this._selectedCredentialId = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)(null);
      this._selectedSymbol = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)('BTCUSDT');
      this.positions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)([]);
      this.orders = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)([]);
      this.balance = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)(null);
      this.autoRefreshEnabled = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)(false);
      // Symbol options for dropdown
      this.symbolOptions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)([]);
      this.isLoadingSymbols = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)(false);
      // Credentials from service
      this.credentials = this.credentialsService.credentials;
      this.isLoadingCredentials = this.credentialsService.loading;
      // Computed signals
      this.totalUnrealizedPnl = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => {
        return this.positions().reduce((sum, pos) => sum + pos.unrealizedPnl, 0);
      });
      this.hasOpenPositions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => this.positions().length > 0);
      this.hasPendingOrders = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => this.orders().some(o => o.status === 'New'));
      // Computed signal for credential dropdown options
      this.credentialOptions = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => {
        return this.credentials().filter(cred => cred.isActive).map(cred => ({
          value: cred.id,
          label: this.formatCredentialLabel(cred)
        }));
      });
      // Get selected credential object
      this.selectedCredential = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => {
        const credId = this._selectedCredentialId();
        if (!credId) return null;
        return this.credentials().find(c => c.id === credId) ?? null;
      });
      // Get selected exchange from credential
      this.selectedExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => {
        const cred = this.selectedCredential();
        return cred ? cred.exchange.toLowerCase() : null;
      });
      // Get chart symbol with exchange prefix (computed)
      this._chartSymbol = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.computed)(() => {
        const cred = this.selectedCredential();
        const symbol = this._selectedSymbol();
        if (!cred || !symbol) return '';
        // Map exchange to TradingView exchange code
        const exchangeMap = {
          'BYBIT': 'BYBIT',
          'BINANCE': 'BINANCE',
          'OKX': 'OKX',
          'COINBASE': 'COINBASE'
        };
        const exchangeCode = exchangeMap[cred.exchange.toUpperCase()] || 'BYBIT';
        return `${exchangeCode}:${symbol}`;
      });
      // Regular property for chart binding (updated via effect)
      this.chartSymbol = '';
      // Loading and error states from service
      this.isPlacingOrder = this.tradingService.isPlacingOrder;
      this.isLoadingPositions = this.tradingService.isLoadingPositions;
      this.isLoadingOrders = this.tradingService.isLoadingOrders;
      this.isLoadingBalance = this.tradingService.isLoadingBalance;
      // Table columns
      this.positionsColumns = [{
        key: 'symbol',
        label: this.translate('trading.table.symbol'),
        sortable: true
      }, {
        key: 'side',
        label: this.translate('trading.table.side'),
        sortable: true
      }, {
        key: 'size',
        label: this.translate('trading.table.size'),
        sortable: true,
        type: 'number',
        align: 'right'
      }, {
        key: 'entryPrice',
        label: this.translate('trading.table.entryPrice'),
        sortable: true,
        type: 'currency',
        align: 'right'
      }, {
        key: 'markPrice',
        label: this.translate('trading.table.markPrice'),
        sortable: true,
        type: 'currency',
        align: 'right'
      }, {
        key: 'unrealizedPnl',
        label: this.translate('trading.table.unrealizedPnl'),
        sortable: true,
        type: 'currency',
        align: 'right'
      }, {
        key: 'leverage',
        label: this.translate('trading.table.leverage'),
        sortable: true,
        type: 'number',
        align: 'center'
      }, {
        key: 'actions',
        label: this.translate('trading.table.actions'),
        sortable: false,
        align: 'center'
      }];
      this.ordersColumns = [{
        key: 'symbol',
        label: this.translate('trading.table.symbol'),
        sortable: true
      }, {
        key: 'type',
        label: this.translate('trading.table.type'),
        sortable: true
      }, {
        key: 'side',
        label: this.translate('trading.table.side'),
        sortable: true
      }, {
        key: 'quantity',
        label: this.translate('trading.table.quantity'),
        sortable: true,
        type: 'number',
        align: 'right'
      }, {
        key: 'price',
        label: this.translate('trading.table.price'),
        sortable: true,
        type: 'currency',
        align: 'right'
      }, {
        key: 'status',
        label: this.translate('trading.table.status'),
        sortable: true
      }, {
        key: 'createdAt',
        label: this.translate('trading.table.time'),
        sortable: true,
        type: 'date'
      }, {
        key: 'actions',
        label: this.translate('trading.table.actions'),
        sortable: false,
        align: 'center'
      }];
      // Pagination
      this.currentPage = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)(1);
      this.pageSize = (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.signal)(10);
      // Effect to sync computed chartSymbol to property for change detection
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_9__.effect)(() => {
        const newSymbol = this._chartSymbol();
        if (newSymbol && newSymbol !== this.chartSymbol) {
          console.log('Chart symbol changed:', this.chartSymbol, '->', newSymbol);
          this.chartSymbol = newSymbol;
        }
      });
    }
    ngOnInit() {
      // Load credentials first
      this.credentialsService.fetchCredentials().subscribe({
        next: () => {
          // Auto-select first active credential if available
          const firstActive = this.credentialOptions()[0];
          if (firstActive) {
            this._selectedCredentialId.set(firstActive.value);
            this.loadTradingSymbols();
          }
          this.loadMockData();
        },
        error: err => console.error('Failed to load credentials:', err)
      });
      // Subscribe to cached data from service
      this.tradingService.positions$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.takeUntil)(this.destroy$)).subscribe(positions => this.positions.set(positions));
      this.tradingService.orders$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.takeUntil)(this.destroy$)).subscribe(orders => this.orders.set(orders));
      this.tradingService.balance$.pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.takeUntil)(this.destroy$)).subscribe(balance => this.balance.set(balance));
    }
    ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
      this.stopAutoRefresh();
    }
    /**
     * Load all trading data (positions, orders, balance)
     */
    loadAllData() {
      const exchange = this.selectedExchange();
      if (!exchange) return;
      // For development, use mock data
      // In production, uncomment the following:
      // this.tradingService.getPositions(exchange).subscribe();
      // this.tradingService.getOrders(exchange).subscribe();
      // this.tradingService.getAccountBalance(exchange).subscribe();
      this.loadMockData();
    }
    /**
     * Load mock data for development/testing
     */
    loadMockData() {
      this.positions.set(this.tradingService.getMockPositions());
      this.orders.set(this.tradingService.getMockOrders());
      this.balance.set(this.tradingService.getMockBalance());
    }
    /**
     * Handle order placed from OrderFormComponent
     */
    handleOrderPlaced(orderRequest) {
      const credential = this.selectedCredential();
      if (!credential) {
        console.error('No credential selected');
        return;
      }
      // Add credential and exchange to order request
      const completeOrderRequest = {
        ...orderRequest,
        exchange: credential.exchange.toLowerCase(),
        credentialId: credential.id
      };
      this.tradingService.placeOrder(completeOrderRequest).subscribe({
        next: response => {
          console.log('Order placed successfully:', response);
          this.loadAllData();
          // TODO: Show success toast notification
        },
        error: error => {
          console.error('Failed to place order:', error);
          // TODO: Show error toast notification
        }
      });
    }
    /**
     * Close a position
     */
    closePosition(position) {
      if (confirm(this.translate('trading.confirmClosePosition'))) {
        this.tradingService.closePosition({
          exchange: position.exchange,
          symbol: position.symbol,
          side: position.side
        }).subscribe({
          next: () => {
            console.log('Position closed successfully');
            this.loadAllData();
            // TODO: Show success toast notification
          },
          error: error => {
            console.error('Failed to close position:', error);
            // TODO: Show error toast notification
          }
        });
      }
    }
    /**
     * Cancel an order
     */
    cancelOrder(order) {
      if (order.status !== 'New') {
        return;
      }
      if (confirm(this.translate('trading.confirmCancelOrder'))) {
        this.tradingService.cancelOrder({
          exchange: order.exchange,
          orderId: order.orderId,
          symbol: order.symbol
        }).subscribe({
          next: () => {
            console.log('Order cancelled successfully');
            this.loadAllData();
            // TODO: Show success toast notification
          },
          error: error => {
            console.error('Failed to cancel order:', error);
            // TODO: Show error toast notification
          }
        });
      }
    }
    /**
     * Refresh all data manually
     */
    refreshData() {
      this.loadAllData();
    }
    /**
     * Toggle auto-refresh
     */
    toggleAutoRefresh() {
      const enabled = !this.autoRefreshEnabled();
      this.autoRefreshEnabled.set(enabled);
      if (enabled) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
      const exchange = this.selectedExchange();
      if (!exchange) return;
      this.autoRefreshSubscription = this.tradingService.setupAutoRefresh(exchange, 10000) // Refresh every 10 seconds
      .pipe((0,rxjs__WEBPACK_IMPORTED_MODULE_12__.takeUntil)(this.destroy$)).subscribe();
    }
    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
      this.autoRefreshSubscription?.unsubscribe();
    }
    /**
     * Get CSS class for PnL value (green for profit, red for loss)
     */
    getPnlClass(pnl) {
      return pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
    }
    /**
     * Get CSS class for order side (green for buy, red for sell)
     */
    getSideClass(side) {
      return side === 'Buy' ? 'side-buy' : 'side-sell';
    }
    /**
     * Format PnL value with + or - sign
     */
    formatPnl(pnl) {
      const sign = pnl >= 0 ? '+' : '';
      return `${sign}$${pnl.toFixed(2)}`;
    }
    /**
     * Format PnL percentage
     */
    formatPnlPercent(percent) {
      const sign = percent >= 0 ? '+' : '';
      return `${sign}${percent.toFixed(2)}%`;
    }
    /**
     * Check if order can be cancelled
     */
    canCancelOrder(order) {
      return order.status === 'New';
    }
    /**
     * Translate a key using the translation service
     */
    translate(key) {
      return this.translationService.translate(key);
    }
    /**
     * Format date for display
     */
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
    /**
     * Format currency value
     */
    formatCurrency(value) {
      return `$${value.toFixed(2)}`;
    }
    /**
     * Format credential label for dropdown
     */
    formatCredentialLabel(credential) {
      const exchangeName = (0,_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_8__.getExchangeName)(credential.exchange);
      const env = credential.environment === 'TESTNET' ? '🧪 Testnet' : '🔴 Live';
      const label = credential.label ? ` - ${credential.label}` : '';
      return `${exchangeName} (${env})${label}`;
    }
    /**
     * Handle credential change from dropdown
     */
    onCredentialChange(credentialId) {
      console.log('Credential changed to:', credentialId);
      this._selectedCredentialId.set(credentialId);
      const cred = this.selectedCredential();
      console.log('Selected credential:', cred);
      console.log('Chart symbol before load:', this.chartSymbol);
      // Switch WebSocket environment based on credential
      if (cred && cred.exchange.toUpperCase() === 'BYBIT') {
        this.bybitService.setWebSocketEnvironment(cred.environment);
        console.log(`✅ WebSocket environment switched to: ${cred.environment}`);
      }
      this.loadTradingSymbols();
      this.loadAllData();
      // Log after a brief delay to see if computed updated
      setTimeout(() => {
        console.log('Chart symbol after change:', this.chartSymbol);
      }, 100);
    }
    /**
     * Handle symbol change from dropdown
     */
    onSymbolChange(symbol) {
      this._selectedSymbol.set(symbol);
      // Chart will update automatically via binding
    }
    /**
     * Load trading symbols for selected exchange
     */
    loadTradingSymbols() {
      const exchange = this.selectedExchange();
      if (!exchange) {
        this.symbolOptions.set([]);
        return;
      }
      this.isLoadingSymbols.set(true);
      this.tradingService.getSymbols(exchange).subscribe({
        next: symbols => {
          const options = symbols.map(s => ({
            value: s.symbol,
            label: s.symbol
          }));
          this.symbolOptions.set(options);
          this.isLoadingSymbols.set(false);
          // Auto-select BTCUSDT if available, otherwise first symbol
          const btcOption = options.find(opt => opt.value === 'BTCUSDT');
          if (btcOption) {
            this._selectedSymbol.set('BTCUSDT');
          } else if (options.length > 0) {
            this._selectedSymbol.set(options[0].value);
          }
        },
        error: error => {
          console.error('Failed to load trading symbols:', error);
          // Fallback to default popular trading pairs
          this.loadDefaultSymbols();
          this.isLoadingSymbols.set(false);
        }
      });
    }
    /**
     * Load default trading symbols as fallback
     */
    loadDefaultSymbols() {
      const defaultSymbols = [{
        value: 'BTCUSDT',
        label: 'BTCUSDT'
      }, {
        value: 'ETHUSDT',
        label: 'ETHUSDT'
      }, {
        value: 'BNBUSDT',
        label: 'BNBUSDT'
      }, {
        value: 'SOLUSDT',
        label: 'SOLUSDT'
      }, {
        value: 'XRPUSDT',
        label: 'XRPUSDT'
      }, {
        value: 'ADAUSDT',
        label: 'ADAUSDT'
      }, {
        value: 'DOGEUSDT',
        label: 'DOGEUSDT'
      }, {
        value: 'MATICUSDT',
        label: 'MATICUSDT'
      }, {
        value: 'DOTUSDT',
        label: 'DOTUSDT'
      }, {
        value: 'AVAXUSDT',
        label: 'AVAXUSDT'
      }];
      this.symbolOptions.set(defaultSymbols);
      this._selectedSymbol.set('BTCUSDT');
    }
    static {
      this.ɵfac = function TradingDashboardComponent_Factory(t) {
        return new (t || TradingDashboardComponent)();
      };
    }
    static {
      this.ɵcmp = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵdefineComponent"]({
        type: TradingDashboardComponent,
        selectors: [["trading-dashboard"]],
        standalone: true,
        features: [_angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵStandaloneFeature"]],
        decls: 28,
        vars: 11,
        consts: [[1, "trading-dashboard"], [1, "dashboard-header"], [1, "dashboard-title"], [1, "dashboard-grid", "chart-trading-layout"], [1, "dashboard-column", "chart-column"], [1, "dashboard-column", "trading-controls-column"], [3, "orderPlaced", "selectedSymbol", "currentPrice", "balance"], [1, "positions-orders-section"], [1, "dashboard-grid"], ["variant", "elevated", 1, "positions-card"], [1, "badge"], [1, "loading-state"], [1, "empty-state"], ["variant", "elevated", 1, "orders-card"], [1, "orders-table-wrapper"], [3, "credentialChange", "symbolChange", "symbol", "chartHeight", "showCredentialSelector", "showSymbolSelector", "showEnvironmentBadge", "credentialOptions", "symbolOptions", "isLoadingSymbols", "environment"], [1, "positions-table-wrapper"], ["role", "table", "aria-label", "Open positions", 1, "positions-table"], [1, "text-right"], [1, "text-center"], [1, "positions-summary"], [1, "summary-label"], [1, "summary-value", 3, "ngClass"], [1, "font-semibold"], [1, "side-badge", 3, "ngClass"], [3, "ngClass"], [1, "pnl-percent"], [1, "leverage-badge"], ["variant", "danger", "size", "small", 3, "clicked"], ["role", "table", "aria-label", "Order history", 1, "orders-table"], [1, "status-badge"], ["variant", "warning", "size", "small"], [1, "text-muted"], ["variant", "warning", "size", "small", 3, "clicked"]],
        template: function TradingDashboardComponent_Template(rf, ctx) {
          if (rf & 1) {
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](0, "div", 0)(1, "div", 1)(2, "h1", 2);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](4, "div", 3);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](5, TradingDashboardComponent_Conditional_5_Template, 2, 9, "div", 4);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](6, "div", 5)(7, "app-order-form", 6);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵlistener"]("orderPlaced", function TradingDashboardComponent_Template_app_order_form_orderPlaced_7_listener($event) {
              return ctx.handleOrderPlaced($event);
            });
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](8, "div", 7)(9, "div", 8)(10, "ui-card", 9)(11, "ui-card-header")(12, "ui-card-title");
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](13);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](14, TradingDashboardComponent_Conditional_14_Template, 2, 1, "span", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](15, "ui-card-content");
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](16, TradingDashboardComponent_Conditional_16_Template, 3, 1, "div", 11)(17, TradingDashboardComponent_Conditional_17_Template, 3, 1, "div", 12)(18, TradingDashboardComponent_Conditional_18_Template, 28, 11);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](19, "ui-card", 13)(20, "ui-card-header")(21, "ui-card-title");
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtext"](22);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](23, TradingDashboardComponent_Conditional_23_Template, 2, 1, "span", 10);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementStart"](24, "ui-card-content");
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtemplate"](25, TradingDashboardComponent_Conditional_25_Template, 3, 1, "div", 11)(26, TradingDashboardComponent_Conditional_26_Template, 3, 1, "div", 12)(27, TradingDashboardComponent_Conditional_27_Template, 23, 8, "div", 14);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵelementEnd"]()()()()();
          }
          if (rf & 2) {
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](3);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate"](ctx.translate("trading.dashboard.title"));
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵconditional"](ctx.selectedSymbol ? 5 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵproperty"]("selectedSymbol", ctx.selectedSymbol)("currentPrice", 0)("balance", ctx.balance());
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", ctx.translate("trading.positions.title"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵconditional"](ctx.positions().length > 0 ? 14 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵconditional"](ctx.isLoadingPositions() ? 16 : ctx.positions().length === 0 ? 17 : 18);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](6);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵtextInterpolate1"](" ", ctx.translate("trading.orders.title"), " ");
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"]();
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵconditional"](ctx.orders().length > 0 ? 23 : -1);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵadvance"](2);
            _angular_core__WEBPACK_IMPORTED_MODULE_9__["ɵɵconditional"](ctx.isLoadingOrders() ? 25 : ctx.orders().length === 0 ? 26 : 27);
          }
        },
        dependencies: [_angular_common__WEBPACK_IMPORTED_MODULE_13__.CommonModule, _angular_common__WEBPACK_IMPORTED_MODULE_13__.NgClass, _angular_forms__WEBPACK_IMPORTED_MODULE_14__.ReactiveFormsModule, _angular_forms__WEBPACK_IMPORTED_MODULE_14__.FormsModule, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_0__.CardComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_0__.CardHeaderComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_0__.CardTitleComponent, _ui_card_card_component__WEBPACK_IMPORTED_MODULE_0__.CardContentComponent, _ui_button_button_component__WEBPACK_IMPORTED_MODULE_1__.ButtonComponent, _lightweight_chart_lightweight_chart_component__WEBPACK_IMPORTED_MODULE_2__.LightweightChartComponent, _order_form_order_form_component__WEBPACK_IMPORTED_MODULE_3__.OrderFormComponent],
        styles: ["\n\n\n\n\n\n\n\n\n\n\n\n\n.trading-dashboard[_ngcontent-%COMP%] {\n  padding: 1.5rem;\n  min-height: 100vh;\n  background-color: var(--background-secondary);\n}\n\n.dashboard-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 2rem;\n  flex-wrap: wrap;\n  gap: 1rem;\n}\n\n.dashboard-title[_ngcontent-%COMP%] {\n  font-size: 2rem;\n  font-weight: 700;\n  color: var(--text-primary);\n  margin: 0;\n}\n\n.dashboard-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n\n\n.dashboard-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 400px 1fr;\n  gap: 1.5rem;\n  align-items: start;\n}\n\n\n\n.chart-trading-layout[_ngcontent-%COMP%] {\n  grid-template-columns: 1fr 400px;\n  margin-bottom: 1.5rem;\n}\n\n.chart-column[_ngcontent-%COMP%] {\n  min-width: 0; \n\n}\n\n.trading-controls-column[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 1.5rem;\n}\n\n\n\n.chart-card[_ngcontent-%COMP%] {\n  height: 100%;\n}\n\n.chart-card[_ngcontent-%COMP%]   ui-card-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.5rem;\n  border-bottom: 1px solid var(--border-color);\n}\n\n.chart-controls[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  align-items: center;\n}\n\n.chart-credential-select[_ngcontent-%COMP%], \n.chart-symbol-select[_ngcontent-%COMP%] {\n  min-width: 180px;\n}\n\n.chart-credential-select[_ngcontent-%COMP%]   select[_ngcontent-%COMP%], \n.chart-symbol-select[_ngcontent-%COMP%]   select[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  padding: 0.5rem 0.75rem;\n}\n\n\n\n.testnet-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  margin-left: 0.75rem;\n  padding: 0.25rem 0.75rem;\n  background-color: rgba(255, 152, 0, 0.1);\n  color: #FF9800;\n  border: 1px solid rgba(255, 152, 0, 0.3);\n  border-radius: 0.375rem;\n  font-size: 0.75rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n}\n\nhtml.dark[_ngcontent-%COMP%]   .testnet-badge[_ngcontent-%COMP%] {\n  background-color: rgba(255, 152, 0, 0.15);\n  border-color: rgba(255, 152, 0, 0.4);\n}\n\n\n\n.positions-orders-section[_ngcontent-%COMP%]   .dashboard-grid[_ngcontent-%COMP%] {\n  grid-template-columns: repeat(2, 1fr);\n}\n\n.dashboard-column[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.5rem;\n}\n\n.left-column[_ngcontent-%COMP%] {\n  position: sticky;\n  top: 1.5rem;\n}\n\n\n\n\n\n\n.balance-card[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);\n  color: var(--text-inverse);\n}\n\n.balance-card[_ngcontent-%COMP%]   ui-card-title[_ngcontent-%COMP%] {\n  color: var(--text-inverse);\n}\n\n.balance-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 1.5rem;\n}\n\n.balance-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n.balance-label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  opacity: 0.9;\n  font-weight: 500;\n}\n\n.balance-value[_ngcontent-%COMP%] {\n  font-size: 1.5rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n.balance-value.primary[_ngcontent-%COMP%] {\n  font-size: 2rem;\n}\n\n.balance-loading[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 2rem;\n  opacity: 0.7;\n}\n\n\n\n\n\n\n.order-form-card[_ngcontent-%COMP%] {\n  background-color: var(--background-primary);\n}\n\n.order-form[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1.25rem;\n}\n\n.form-group[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n.form-row[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 1rem;\n}\n\n.form-actions[_ngcontent-%COMP%] {\n  margin-top: 0.5rem;\n}\n\n\n\n.form-group[_ngcontent-%COMP%]   ui-input[_ngcontent-%COMP%], \n.form-group[_ngcontent-%COMP%]   ui-select[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n\n\n\n\n\n.positions-card[_ngcontent-%COMP%], \n.orders-card[_ngcontent-%COMP%] {\n  background-color: var(--background-primary);\n}\n\n.positions-table-wrapper[_ngcontent-%COMP%], \n.orders-table-wrapper[_ngcontent-%COMP%] {\n  overflow-x: auto;\n  margin: -1rem;\n  padding: 1rem;\n}\n\n.positions-table[_ngcontent-%COMP%], \n.orders-table[_ngcontent-%COMP%] {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 0.875rem;\n}\n\n.positions-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%], \n.orders-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%] {\n  background-color: var(--background-tertiary);\n  position: sticky;\n  top: 0;\n  z-index: 1;\n}\n\n.positions-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n.orders-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  padding: 0.75rem 1rem;\n  text-align: left;\n  font-weight: 600;\n  color: var(--text-secondary);\n  font-size: 0.8125rem;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  border-bottom: 2px solid var(--border-color);\n}\n\n.positions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%], \n.orders-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-bottom: 1px solid var(--border-color);\n  color: var(--text-primary);\n}\n\n.positions-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%], \n.orders-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%] {\n  transition: background-color 0.2s ease;\n}\n\n.positions-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover, \n.orders-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background-color: var(--background-secondary);\n}\n\n\n\n.text-left[_ngcontent-%COMP%] {\n  text-align: left;\n}\n\n.text-center[_ngcontent-%COMP%] {\n  text-align: center;\n}\n\n.text-right[_ngcontent-%COMP%] {\n  text-align: right;\n}\n\n.text-muted[_ngcontent-%COMP%] {\n  color: var(--text-muted);\n}\n\n.font-semibold[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n\n\n\n\n\n\n.badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 1.5rem;\n  height: 1.5rem;\n  padding: 0 0.5rem;\n  font-size: 0.75rem;\n  font-weight: 600;\n  background-color: var(--primary-color);\n  color: var(--text-inverse);\n  border-radius: 9999px;\n  margin-left: 0.5rem;\n}\n\n\n\n.side-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.25rem 0.75rem;\n  border-radius: 0.375rem;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.025em;\n}\n\n.side-badge.side-buy[_ngcontent-%COMP%] {\n  background-color: rgba(16, 185, 129, 0.1);\n  color: #10b981;\n}\n\n.side-badge.side-sell[_ngcontent-%COMP%] {\n  background-color: rgba(239, 68, 68, 0.1);\n  color: #ef4444;\n}\n\n\n\n.status-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.25rem 0.75rem;\n  border-radius: 0.375rem;\n  font-size: 0.75rem;\n  font-weight: 500;\n  text-transform: capitalize;\n}\n\n.status-badge[data-status=\"New\"][_ngcontent-%COMP%] {\n  background-color: rgba(59, 130, 246, 0.1);\n  color: #3b82f6;\n}\n\n.status-badge[data-status=\"Filled\"][_ngcontent-%COMP%] {\n  background-color: rgba(16, 185, 129, 0.1);\n  color: #10b981;\n}\n\n.status-badge[data-status=\"PartiallyFilled\"][_ngcontent-%COMP%] {\n  background-color: rgba(245, 158, 11, 0.1);\n  color: #f59e0b;\n}\n\n.status-badge[data-status=\"Cancelled\"][_ngcontent-%COMP%] {\n  background-color: rgba(107, 114, 128, 0.1);\n  color: #6b7280;\n}\n\n.status-badge[data-status=\"Rejected\"][_ngcontent-%COMP%] {\n  background-color: rgba(239, 68, 68, 0.1);\n  color: #ef4444;\n}\n\n\n\n.leverage-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0.25rem 0.625rem;\n  background-color: var(--background-tertiary);\n  color: var(--text-primary);\n  border-radius: 0.375rem;\n  font-size: 0.8125rem;\n  font-weight: 600;\n  border: 1px solid var(--border-color);\n}\n\n\n\n\n\n\n.pnl-positive[_ngcontent-%COMP%] {\n  color: #10b981;\n  font-weight: 600;\n}\n\n.pnl-negative[_ngcontent-%COMP%] {\n  color: #ef4444;\n  font-weight: 600;\n}\n\n.pnl-percent[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  opacity: 0.8;\n  margin-top: 0.125rem;\n}\n\n\n\n.positions-summary[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n  margin-top: 1rem;\n  background-color: var(--background-secondary);\n  border-radius: 0.5rem;\n  border: 1px solid var(--border-color);\n}\n\n.summary-label[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 600;\n  color: var(--text-secondary);\n}\n\n.summary-value[_ngcontent-%COMP%] {\n  font-size: 1.25rem;\n  font-weight: 700;\n  font-variant-numeric: tabular-nums;\n}\n\n\n\n\n\n\n.empty-state[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem 1rem;\n  text-align: center;\n  color: var(--text-muted);\n}\n\n.empty-state[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9375rem;\n}\n\n.loading-state[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 3rem 1rem;\n  color: var(--text-muted);\n}\n\n.loading-state[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  font-size: 0.9375rem;\n}\n\n\n\n@keyframes _ngcontent-%COMP%_pulse {\n  0%, 100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.5;\n  }\n}\n\n.loading-state[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  animation: _ngcontent-%COMP%_pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;\n}\n\n\n\n\n\n\n\n\n@media (max-width: 1024px) {\n  .dashboard-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .chart-trading-layout[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .positions-orders-section[_ngcontent-%COMP%]   .dashboard-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .left-column[_ngcontent-%COMP%], \n   .trading-controls-column[_ngcontent-%COMP%] {\n    position: static;\n  }\n\n  .balance-grid[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}\n\n\n\n@media (max-width: 767px) {\n  .trading-dashboard[_ngcontent-%COMP%] {\n    padding: 1rem;\n  }\n\n  .dashboard-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n    align-items: flex-start;\n  }\n\n  .dashboard-title[_ngcontent-%COMP%] {\n    font-size: 1.5rem;\n  }\n\n  .dashboard-actions[_ngcontent-%COMP%] {\n    width: 100%;\n    justify-content: stretch;\n  }\n\n  .dashboard-actions[_ngcontent-%COMP%]   ui-button[_ngcontent-%COMP%] {\n    flex: 1;\n  }\n\n  .dashboard-grid[_ngcontent-%COMP%] {\n    gap: 1rem;\n  }\n\n  .balance-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n    gap: 1rem;\n  }\n\n  .balance-value[_ngcontent-%COMP%] {\n    font-size: 1.25rem;\n  }\n\n  .balance-value.primary[_ngcontent-%COMP%] {\n    font-size: 1.5rem;\n  }\n\n  .form-row[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  \n\n  .positions-table-wrapper[_ngcontent-%COMP%], \n   .orders-table-wrapper[_ngcontent-%COMP%] {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n\n  .positions-table[_ngcontent-%COMP%], \n   .orders-table[_ngcontent-%COMP%] {\n    min-width: 800px;\n  }\n\n  .positions-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .orders-table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%], \n   .positions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%], \n   .orders-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    padding: 0.625rem;\n    font-size: 0.8125rem;\n  }\n}\n\n\n\n@media (max-width: 480px) {\n  .dashboard-title[_ngcontent-%COMP%] {\n    font-size: 1.25rem;\n  }\n\n  .positions-table[_ngcontent-%COMP%], \n   .orders-table[_ngcontent-%COMP%] {\n    font-size: 0.75rem;\n  }\n\n  .side-badge[_ngcontent-%COMP%], \n   .status-badge[_ngcontent-%COMP%] {\n    font-size: 0.6875rem;\n    padding: 0.1875rem 0.5rem;\n  }\n}\n\n\n\n\n\n\nhtml.dark[_ngcontent-%COMP%]   .balance-card[_ngcontent-%COMP%] {\n  background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);\n}\n\nhtml.dark[_ngcontent-%COMP%]   .positions-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover, \nhtml.dark[_ngcontent-%COMP%]   .orders-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover {\n  background-color: rgba(255, 255, 255, 0.03);\n}\n\nhtml.dark[_ngcontent-%COMP%]   .leverage-badge[_ngcontent-%COMP%] {\n  background-color: rgba(255, 255, 255, 0.05);\n  border-color: rgba(255, 255, 255, 0.1);\n}\n\n\n\n\n\n\n\n\n.positions-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:focus-within, \n.orders-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:focus-within {\n  outline: 2px solid var(--primary-color);\n  outline-offset: -2px;\n}\n\n\n\n.sr-only[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n\n\n@media (prefers-contrast: high) {\n  .side-badge[_ngcontent-%COMP%], \n   .status-badge[_ngcontent-%COMP%], \n   .leverage-badge[_ngcontent-%COMP%] {\n    border: 2px solid currentColor;\n  }\n\n  .positions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%], \n   .orders-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n    border-bottom: 2px solid var(--border-color);\n  }\n}\n\n\n\n@media (prefers-reduced-motion: reduce) {\n  *[_ngcontent-%COMP%] {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n\n\n\n\n\n\n@media print {\n  .trading-dashboard[_ngcontent-%COMP%] {\n    background-color: white;\n  }\n\n  .dashboard-actions[_ngcontent-%COMP%], \n   .form-actions[_ngcontent-%COMP%], \n   .positions-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:last-child, \n   .orders-table[_ngcontent-%COMP%]   td[_ngcontent-%COMP%]:last-child {\n    display: none;\n  }\n\n  .dashboard-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .balance-card[_ngcontent-%COMP%] {\n    color: black;\n    border: 2px solid black;\n  }\n}\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8uL3NyYy9hcHAvY29tcG9uZW50cy90cmFkaW5nL3RyYWRpbmctZGFzaGJvYXJkL3RyYWRpbmctZGFzaGJvYXJkLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0VBS0U7O0FBRUY7OytFQUUrRTs7QUFFL0U7RUFDRSxlQUFlO0VBQ2YsaUJBQWlCO0VBQ2pCLDZDQUE2QztBQUMvQzs7QUFFQTtFQUNFLGFBQWE7RUFDYiw4QkFBOEI7RUFDOUIsbUJBQW1CO0VBQ25CLG1CQUFtQjtFQUNuQixlQUFlO0VBQ2YsU0FBUztBQUNYOztBQUVBO0VBQ0UsZUFBZTtFQUNmLGdCQUFnQjtFQUNoQiwwQkFBMEI7RUFDMUIsU0FBUztBQUNYOztBQUVBO0VBQ0UsYUFBYTtFQUNiLFlBQVk7RUFDWixtQkFBbUI7QUFDckI7O0FBRUEsMEJBQTBCO0FBQzFCO0VBQ0UsYUFBYTtFQUNiLGdDQUFnQztFQUNoQyxXQUFXO0VBQ1gsa0JBQWtCO0FBQ3BCOztBQUVBLHNDQUFzQztBQUN0QztFQUNFLGdDQUFnQztFQUNoQyxxQkFBcUI7QUFDdkI7O0FBRUE7RUFDRSxZQUFZLEVBQUUscUJBQXFCO0FBQ3JDOztBQUVBO0VBQ0UsZ0JBQWdCO0VBQ2hCLFdBQVc7QUFDYjs7QUFFQSx1QkFBdUI7QUFDdkI7RUFDRSxZQUFZO0FBQ2Q7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsOEJBQThCO0VBQzlCLG1CQUFtQjtFQUNuQixvQkFBb0I7RUFDcEIsNENBQTRDO0FBQzlDOztBQUVBO0VBQ0UsYUFBYTtFQUNiLFlBQVk7RUFDWixtQkFBbUI7QUFDckI7O0FBRUE7O0VBRUUsZ0JBQWdCO0FBQ2xCOztBQUVBOztFQUVFLG1CQUFtQjtFQUNuQix1QkFBdUI7QUFDekI7O0FBRUEsa0JBQWtCO0FBQ2xCO0VBQ0Usb0JBQW9CO0VBQ3BCLG1CQUFtQjtFQUNuQixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHdDQUF3QztFQUN4QyxjQUFjO0VBQ2Qsd0NB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OztBQUVBOzsrRUFFK0U7O0FBRS9FLGlEQUFpRDtBQUNqRDs7RUFFRSx1Q0FBdUM7RUFDdkMsb0JBQW9CO0FBQ3RCOztBQUVBLDRDQUE0QztBQUM1QztFQUNFLGtCQUFrQjtFQUNsQixVQUFVO0VBQ1YsV0FBVztFQUNYLFVBQVU7RUFDVixZQUFZO0VBQ1osZ0JBQWdCO0VBQ2hCLHNCQUFzQjtFQUN0QixtQkFBbUI7RUFDbkIsZUFBZTtBQUNqQjs7QUFFQSwrQkFBK0I7QUFDL0I7RUFDRTs7O0lBR0UsOEJBQThCO0VBQ2hDOztFQUVBOztJQUVFLDRDQUE0QztFQUM5QztBQUNGOztBQUVBLDJCQUEyQjtBQUMzQjtFQUNFO0lBQ0UscUNBQXFDO0lBQ3JDLHVDQUF1QztJQUN2QyxzQ0FBc0M7RUFDeEM7QUFDRjs7QUFFQTs7K0VBRStFOztBQUUvRTtFQUNFO0lBQ0UsdUJBQXVCO0VBQ3pCOztFQUVBOzs7O0lBSUUsYUFBYTtFQUNmOztFQUVBO0lBQ0UsMEJBQTBCO0VBQzVCOztFQUVBO0lBQ0UsWUFBWTtJQUNaLHVCQUF1QjtFQUN6QjtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUcmFkaW5nIERhc2hib2FyZCBDb21wb25lbnQgU3R5bGVzXG4gKlxuICogQ29tcHJlaGVuc2l2ZSBzdHlsaW5nIGZvciB0aGUgbWFudWFsIHRyYWRpbmcgZGFzaGJvYXJkLlxuICogRmVhdHVyZXMgcmVzcG9uc2l2ZSBkZXNpZ24sIGRhcmsgbW9kZSBzdXBwb3J0LCBhbmQgYWNjZXNzaWJsZSBVSSBlbGVtZW50cy5cbiAqL1xuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgRGFzaGJvYXJkIExheW91dFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLnRyYWRpbmctZGFzaGJvYXJkIHtcbiAgcGFkZGluZzogMS41cmVtO1xuICBtaW4taGVpZ2h0OiAxMDB2aDtcbiAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tYmFja2dyb3VuZC1zZWNvbmRhcnkpO1xufVxuXG4uZGFzaGJvYXJkLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgbWFyZ2luLWJvdHRvbTogMnJlbTtcbiAgZmxleC13cmFwOiB3cmFwO1xuICBnYXA6IDFyZW07XG59XG5cbi5kYXNoYm9hcmQtdGl0bGUge1xuICBmb250LXNpemU6IDJyZW07XG4gIGZvbnQtd2VpZ2h0OiA3MDA7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xuICBtYXJnaW46IDA7XG59XG5cbi5kYXNoYm9hcmQtYWN0aW9ucyB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGdhcDogMC43NXJlbTtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbn1cblxuLyogRGFzaGJvYXJkIEdyaWQgTGF5b3V0ICovXG4uZGFzaGJvYXJkLWdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQwMHB4IDFmcjtcbiAgZ2FwOiAxLjVyZW07XG4gIGFsaWduLWl0ZW1zOiBzdGFydDtcbn1cblxuLyogQ2hhcnQgYW5kIFRyYWRpbmcgQ29udHJvbHMgTGF5b3V0ICovXG4uY2hhcnQtdHJhZGluZy1sYXlvdXQge1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmciA0MDBweDtcbiAgbWFyZ2luLWJvdHRvbTogMS41cmVtO1xufVxuXG4uY2hhcnQtY29sdW1uIHtcbiAgbWluLXdpZHRoOiAwOyAvKiBQcmV2ZW50IG92ZXJmbG93ICovXG59XG5cbi50cmFkaW5nLWNvbnRyb2xzLWNvbHVtbiB7XG4gIHBvc2l0aW9uOiBzdGlja3k7XG4gIHRvcDogMS41cmVtO1xufVxuXG4vKiBDaGFydCBDYXJkIFN0eWxpbmcgKi9cbi5jaGFydC1jYXJkIHtcbiAgaGVpZ2h0OiAxMDAlO1xufVxuXG4uY2hhcnQtY2FyZCB1aS1jYXJkLWhlYWRlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgcGFkZGluZzogMXJlbSAxLjVyZW07XG4gIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xufVxuXG4uY2hhcnQtY29udHJvbHMge1xuICBkaXNwbGF5OiBmbGV4O1xuICBnYXA6IDAuNzVyZW07XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG59XG5cbi5jaGFydC1jcmVkZW50aWFsLXNlbGVjdCxcbi5jaGFydC1zeW1ib2wtc2VsZWN0IHtcbiAgbWluLXdpZHRoOiAxODBweDtcbn1cblxuLmNoYXJ0LWNyZWRlbnRpYWwtc2VsZWN0IHNlbGVjdCxcbi5jaGFydC1zeW1ib2wtc2VsZWN0IHNlbGVjdCB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIHBhZGRpbmc6IDAuNXJlbSAwLjc1cmVtO1xufVxuXG4vKiBUZXN0bmV0IEJhZGdlICovXG4udGVzdG5ldC1iYWRnZSB7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBtYXJnaW4tbGVmdDogMC43NXJlbTtcbiAgcGFkZGluZzogMC4yNXJlbSAwLjc1cmVtO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMTUyLCAwLCAwLjEpO1xuICBjb2xvcjogI0ZGOTgwMDtcbiAgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyNTUsIDE1MiwgMCwgMC4zKTtcbiAgYm9yZGVyLXJhZGl1czogMC4zNzVyZW07XG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDVlbTtcbn1cblxuaHRtbC5kYXJrIC50ZXN0bmV0LWJhZGdlIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDE1MiwgMCwgMC4xNSk7XG4gIGJvcmRlci1jb2xvcjogcmdiYSgyNTUsIDE1MiwgMCwgMC40KTtcbn1cblxuLyogUG9zaXRpb25zIGFuZCBPcmRlcnMgU2VjdGlvbiAqL1xuLnBvc2l0aW9ucy1vcmRlcnMtc2VjdGlvbiAuZGFzaGJvYXJkLWdyaWQge1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xufVxuXG4uZGFzaGJvYXJkLWNvbHVtbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMS41cmVtO1xufVxuXG4ubGVmdC1jb2x1bW4ge1xuICBwb3NpdGlvbjogc3RpY2t5O1xuICB0b3A6IDEuNXJlbTtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIEJhbGFuY2UgQ2FyZFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLmJhbGFuY2UtY2FyZCB7XG4gIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxMzVkZWcsIHZhcigtLXByaW1hcnktY29sb3IpIDAlLCB2YXIoLS1wcmltYXJ5LWRhcmspIDEwMCUpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1pbnZlcnNlKTtcbn1cblxuLmJhbGFuY2UtY2FyZCB1aS1jYXJkLXRpdGxlIHtcbiAgY29sb3I6IHZhcigtLXRleHQtaW52ZXJzZSk7XG59XG5cbi5iYWxhbmNlLWdyaWQge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xuICBnYXA6IDEuNXJlbTtcbn1cblxuLmJhbGFuY2UtaXRlbSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMC41cmVtO1xufVxuXG4uYmFsYW5jZS1sYWJlbCB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIG9wYWNpdHk6IDAuOTtcbiAgZm9udC13ZWlnaHQ6IDUwMDtcbn1cblxuLmJhbGFuY2UtdmFsdWUge1xuICBmb250LXNpemU6IDEuNXJlbTtcbiAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgZm9udC12YXJpYW50LW51bWVyaWM6IHRhYnVsYXItbnVtcztcbn1cblxuLmJhbGFuY2UtdmFsdWUucHJpbWFyeSB7XG4gIGZvbnQtc2l6ZTogMnJlbTtcbn1cblxuLmJhbGFuY2UtbG9hZGluZyB7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgcGFkZGluZzogMnJlbTtcbiAgb3BhY2l0eTogMC43O1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgT3JkZXIgRm9ybVxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLm9yZGVyLWZvcm0tY2FyZCB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtcHJpbWFyeSk7XG59XG5cbi5vcmRlci1mb3JtIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgZ2FwOiAxLjI1cmVtO1xufVxuXG4uZm9ybS1ncm91cCB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGdhcDogMC41cmVtO1xufVxuXG4uZm9ybS1yb3cge1xuICBkaXNwbGF5OiBncmlkO1xuICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IHJlcGVhdCgyLCAxZnIpO1xuICBnYXA6IDFyZW07XG59XG5cbi5mb3JtLWFjdGlvbnMge1xuICBtYXJnaW4tdG9wOiAwLjVyZW07XG59XG5cbi8qIEZvcm0gZmllbGQgZW5oYW5jZW1lbnRzICovXG4uZm9ybS1ncm91cCB1aS1pbnB1dCxcbi5mb3JtLWdyb3VwIHVpLXNlbGVjdCB7XG4gIHdpZHRoOiAxMDAlO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgUG9zaXRpb25zIFRhYmxlXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4ucG9zaXRpb25zLWNhcmQsXG4ub3JkZXJzLWNhcmQge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS1iYWNrZ3JvdW5kLXByaW1hcnkpO1xufVxuXG4ucG9zaXRpb25zLXRhYmxlLXdyYXBwZXIsXG4ub3JkZXJzLXRhYmxlLXdyYXBwZXIge1xuICBvdmVyZmxvdy14OiBhdXRvO1xuICBtYXJnaW46IC0xcmVtO1xuICBwYWRkaW5nOiAxcmVtO1xufVxuXG4ucG9zaXRpb25zLXRhYmxlLFxuLm9yZGVycy10YWJsZSB7XG4gIHdpZHRoOiAxMDAlO1xuICBib3JkZXItY29sbGFwc2U6IGNvbGxhcHNlO1xuICBmb250LXNpemU6IDAuODc1cmVtO1xufVxuXG4ucG9zaXRpb25zLXRhYmxlIHRoZWFkLFxuLm9yZGVycy10YWJsZSB0aGVhZCB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtdGVydGlhcnkpO1xuICBwb3NpdGlvbjogc3RpY2t5O1xuICB0b3A6IDA7XG4gIHotaW5kZXg6IDE7XG59XG5cbi5wb3NpdGlvbnMtdGFibGUgdGgsXG4ub3JkZXJzLXRhYmxlIHRoIHtcbiAgcGFkZGluZzogMC43NXJlbSAxcmVtO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBmb250LXdlaWdodDogNjAwO1xuICBjb2xvcjogdmFyKC0tdGV4dC1zZWNvbmRhcnkpO1xuICBmb250LXNpemU6IDAuODEyNXJlbTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDVlbTtcbiAgYm9yZGVyLWJvdHRvbTogMnB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG59XG5cbi5wb3NpdGlvbnMtdGFibGUgdGQsXG4ub3JkZXJzLXRhYmxlIHRkIHtcbiAgcGFkZGluZzogMXJlbTtcbiAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXByaW1hcnkpO1xufVxuXG4ucG9zaXRpb25zLXRhYmxlIHRib2R5IHRyLFxuLm9yZGVycy10YWJsZSB0Ym9keSB0ciB7XG4gIHRyYW5zaXRpb246IGJhY2tncm91bmQtY29sb3IgMC4ycyBlYXNlO1xufVxuXG4ucG9zaXRpb25zLXRhYmxlIHRib2R5IHRyOmhvdmVyLFxuLm9yZGVycy10YWJsZSB0Ym9keSB0cjpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbn1cblxuLyogVGFibGUgdGV4dCBhbGlnbm1lbnQgdXRpbGl0aWVzICovXG4udGV4dC1sZWZ0IHtcbiAgdGV4dC1hbGlnbjogbGVmdDtcbn1cblxuLnRleHQtY2VudGVyIHtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xufVxuXG4udGV4dC1yaWdodCB7XG4gIHRleHQtYWxpZ246IHJpZ2h0O1xufVxuXG4udGV4dC1tdXRlZCB7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcbn1cblxuLmZvbnQtc2VtaWJvbGQge1xuICBmb250LXdlaWdodDogNjAwO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgQmFkZ2VzIGFuZCBTdGF0dXMgSW5kaWNhdG9yc1xuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLmJhZGdlIHtcbiAgZGlzcGxheTogaW5saW5lLWZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBtaW4td2lkdGg6IDEuNXJlbTtcbiAgaGVpZ2h0OiAxLjVyZW07XG4gIHBhZGRpbmc6IDAgMC41cmVtO1xuICBmb250LXNpemU6IDAuNzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLXByaW1hcnktY29sb3IpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1pbnZlcnNlKTtcbiAgYm9yZGVyLXJhZGl1czogOTk5OXB4O1xuICBtYXJnaW4tbGVmdDogMC41cmVtO1xufVxuXG4vKiBTaWRlIGJhZGdlcyAoQnV5L1NlbGwpICovXG4uc2lkZS1iYWRnZSB7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAwLjI1cmVtIDAuNzVyZW07XG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xuICBmb250LXNpemU6IDAuODEyNXJlbTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTtcbiAgbGV0dGVyLXNwYWNpbmc6IDAuMDI1ZW07XG59XG5cbi5zaWRlLWJhZGdlLnNpZGUtYnV5IHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxNiwgMTg1LCAxMjksIDAuMSk7XG4gIGNvbG9yOiAjMTBiOTgxO1xufVxuXG4uc2lkZS1iYWRnZS5zaWRlLXNlbGwge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDIzOSwgNjgsIDY4LCAwLjEpO1xuICBjb2xvcjogI2VmNDQ0NDtcbn1cblxuLyogU3RhdHVzIGJhZGdlcyAqL1xuLnN0YXR1cy1iYWRnZSB7XG4gIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAwLjI1cmVtIDAuNzVyZW07XG4gIGJvcmRlci1yYWRpdXM6IDAuMzc1cmVtO1xuICBmb250LXNpemU6IDAuNzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA1MDA7XG4gIHRleHQtdHJhbnNmb3JtOiBjYXBpdGFsaXplO1xufVxuXG4uc3RhdHVzLWJhZGdlW2RhdGEtc3RhdHVzPVwiTmV3XCJdIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg1OSwgMTMwLCAyNDYsIDAuMSk7XG4gIGNvbG9yOiAjM2I4MmY2O1xufVxuXG4uc3RhdHVzLWJhZGdlW2RhdGEtc3RhdHVzPVwiRmlsbGVkXCJdIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxNiwgMTg1LCAxMjksIDAuMSk7XG4gIGNvbG9yOiAjMTBiOTgxO1xufVxuXG4uc3RhdHVzLWJhZGdlW2RhdGEtc3RhdHVzPVwiUGFydGlhbGx5RmlsbGVkXCJdIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNDUsIDE1OCwgMTEsIDAuMSk7XG4gIGNvbG9yOiAjZjU5ZTBiO1xufVxuXG4uc3RhdHVzLWJhZGdlW2RhdGEtc3RhdHVzPVwiQ2FuY2VsbGVkXCJdIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMDcsIDExNCwgMTI4LCAwLjEpO1xuICBjb2xvcjogIzZiNzI4MDtcbn1cblxuLnN0YXR1cy1iYWRnZVtkYXRhLXN0YXR1cz1cIlJlamVjdGVkXCJdIHtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzksIDY4LCA2OCwgMC4xKTtcbiAgY29sb3I6ICNlZjQ0NDQ7XG59XG5cbi8qIExldmVyYWdlIGJhZGdlICovXG4ubGV2ZXJhZ2UtYmFkZ2Uge1xuICBkaXNwbGF5OiBpbmxpbmUtZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIHBhZGRpbmc6IDAuMjVyZW0gMC42MjVyZW07XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtdGVydGlhcnkpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1wcmltYXJ5KTtcbiAgYm9yZGVyLXJhZGl1czogMC4zNzVyZW07XG4gIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xuICBmb250LXdlaWdodDogNjAwO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgUG5MIFN0eWxpbmdcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi5wbmwtcG9zaXRpdmUge1xuICBjb2xvcjogIzEwYjk4MTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbn1cblxuLnBubC1uZWdhdGl2ZSB7XG4gIGNvbG9yOiAjZWY0NDQ0O1xuICBmb250LXdlaWdodDogNjAwO1xufVxuXG4ucG5sLXBlcmNlbnQge1xuICBmb250LXNpemU6IDAuNzVyZW07XG4gIG9wYWNpdHk6IDAuODtcbiAgbWFyZ2luLXRvcDogMC4xMjVyZW07XG59XG5cbi8qIFBvc2l0aW9ucyBTdW1tYXJ5ICovXG4ucG9zaXRpb25zLXN1bW1hcnkge1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDFyZW07XG4gIG1hcmdpbi10b3A6IDFyZW07XG4gIGJhY2tncm91bmQtY29sb3I6IHZhcigtLWJhY2tncm91bmQtc2Vjb25kYXJ5KTtcbiAgYm9yZGVyLXJhZGl1czogMC41cmVtO1xuICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO1xufVxuXG4uc3VtbWFyeS1sYWJlbCB7XG4gIGZvbnQtc2l6ZTogMC44NzVyZW07XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LXNlY29uZGFyeSk7XG59XG5cbi5zdW1tYXJ5LXZhbHVlIHtcbiAgZm9udC1zaXplOiAxLjI1cmVtO1xuICBmb250LXdlaWdodDogNzAwO1xuICBmb250LXZhcmlhbnQtbnVtZXJpYzogdGFidWxhci1udW1zO1xufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgRW1wdHkgYW5kIExvYWRpbmcgU3RhdGVzXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4uZW1wdHktc3RhdGUge1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgcGFkZGluZzogM3JlbSAxcmVtO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcbn1cblxuLmVtcHR5LXN0YXRlIHAge1xuICBtYXJnaW46IDA7XG4gIGZvbnQtc2l6ZTogMC45Mzc1cmVtO1xufVxuXG4ubG9hZGluZy1zdGF0ZSB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBwYWRkaW5nOiAzcmVtIDFyZW07XG4gIGNvbG9yOiB2YXIoLS10ZXh0LW11dGVkKTtcbn1cblxuLmxvYWRpbmctc3RhdGUgc3BhbiB7XG4gIGZvbnQtc2l6ZTogMC45Mzc1cmVtO1xufVxuXG4vKiBMb2FkaW5nIGFuaW1hdGlvbiAqL1xuQGtleWZyYW1lcyBwdWxzZSB7XG4gIDAlLCAxMDAlIHtcbiAgICBvcGFjaXR5OiAxO1xuICB9XG4gIDUwJSB7XG4gICAgb3BhY2l0eTogMC41O1xuICB9XG59XG5cbi5sb2FkaW5nLXN0YXRlIHNwYW4ge1xuICBhbmltYXRpb246IHB1bHNlIDJzIGN1YmljLWJlemllcigwLjQsIDAsIDAuNiwgMSkgaW5maW5pdGU7XG59XG5cbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICBSZXNwb25zaXZlIERlc2lnblxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLyogVGFibGV0ICg3NjhweCAtIDEwMjRweCkgKi9cbkBtZWRpYSAobWF4LXdpZHRoOiAxMDI0cHgpIHtcbiAgLmRhc2hib2FyZC1ncmlkIHtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcbiAgfVxuXG4gIC5jaGFydC10cmFkaW5nLWxheW91dCB7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gIH1cblxuICAucG9zaXRpb25zLW9yZGVycy1zZWN0aW9uIC5kYXNoYm9hcmQtZ3JpZCB7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gIH1cblxuICAubGVmdC1jb2x1bW4sXG4gIC50cmFkaW5nLWNvbnRyb2xzLWNvbHVtbiB7XG4gICAgcG9zaXRpb246IHN0YXRpYztcbiAgfVxuXG4gIC5iYWxhbmNlLWdyaWQge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogcmVwZWF0KDIsIDFmcik7XG4gIH1cbn1cblxuLyogTW9iaWxlICh1cCB0byA3NjdweCkgKi9cbkBtZWRpYSAobWF4LXdpZHRoOiA3NjdweCkge1xuICAudHJhZGluZy1kYXNoYm9hcmQge1xuICAgIHBhZGRpbmc6IDFyZW07XG4gIH1cblxuICAuZGFzaGJvYXJkLWhlYWRlciB7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgfVxuXG4gIC5kYXNoYm9hcmQtdGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMS41cmVtO1xuICB9XG5cbiAgLmRhc2hib2FyZC1hY3Rpb25zIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHN0cmV0Y2g7XG4gIH1cblxuICAuZGFzaGJvYXJkLWFjdGlvbnMgdWktYnV0dG9uIHtcbiAgICBmbGV4OiAxO1xuICB9XG5cbiAgLmRhc2hib2FyZC1ncmlkIHtcbiAgICBnYXA6IDFyZW07XG4gIH1cblxuICAuYmFsYW5jZS1ncmlkIHtcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDFmcjtcbiAgICBnYXA6IDFyZW07XG4gIH1cblxuICAuYmFsYW5jZS12YWx1ZSB7XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICB9XG5cbiAgLmJhbGFuY2UtdmFsdWUucHJpbWFyeSB7XG4gICAgZm9udC1zaXplOiAxLjVyZW07XG4gIH1cblxuICAuZm9ybS1yb3cge1xuICAgIGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyO1xuICB9XG5cbiAgLyogSG9yaXpvbnRhbCBzY3JvbGwgZm9yIHRhYmxlcyBvbiBtb2JpbGUgKi9cbiAgLnBvc2l0aW9ucy10YWJsZS13cmFwcGVyLFxuICAub3JkZXJzLXRhYmxlLXdyYXBwZXIge1xuICAgIG92ZXJmbG93LXg6IGF1dG87XG4gICAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICB9XG5cbiAgLnBvc2l0aW9ucy10YWJsZSxcbiAgLm9yZGVycy10YWJsZSB7XG4gICAgbWluLXdpZHRoOiA4MDBweDtcbiAgfVxuXG4gIC5wb3NpdGlvbnMtdGFibGUgdGgsXG4gIC5vcmRlcnMtdGFibGUgdGgsXG4gIC5wb3NpdGlvbnMtdGFibGUgdGQsXG4gIC5vcmRlcnMtdGFibGUgdGQge1xuICAgIHBhZGRpbmc6IDAuNjI1cmVtO1xuICAgIGZvbnQtc2l6ZTogMC44MTI1cmVtO1xuICB9XG59XG5cbi8qIFNtYWxsIG1vYmlsZSAodXAgdG8gNDgwcHgpICovXG5AbWVkaWEgKG1heC13aWR0aDogNDgwcHgpIHtcbiAgLmRhc2hib2FyZC10aXRsZSB7XG4gICAgZm9udC1zaXplOiAxLjI1cmVtO1xuICB9XG5cbiAgLnBvc2l0aW9ucy10YWJsZSxcbiAgLm9yZGVycy10YWJsZSB7XG4gICAgZm9udC1zaXplOiAwLjc1cmVtO1xuICB9XG5cbiAgLnNpZGUtYmFkZ2UsXG4gIC5zdGF0dXMtYmFkZ2Uge1xuICAgIGZvbnQtc2l6ZTogMC42ODc1cmVtO1xuICAgIHBhZGRpbmc6IDAuMTg3NXJlbSAwLjVyZW07XG4gIH1cbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIERhcmsgTW9kZSBFbmhhbmNlbWVudHNcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbmh0bWwuZGFyayAuYmFsYW5jZS1jYXJkIHtcbiAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzFlM2E4YSAwJSwgIzFlNDBhZiAxMDAlKTtcbn1cblxuaHRtbC5kYXJrIC5wb3NpdGlvbnMtdGFibGUgdGJvZHkgdHI6aG92ZXIsXG5odG1sLmRhcmsgLm9yZGVycy10YWJsZSB0Ym9keSB0cjpob3ZlciB7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMyk7XG59XG5cbmh0bWwuZGFyayAubGV2ZXJhZ2UtYmFkZ2Uge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpO1xuICBib3JkZXItY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKTtcbn1cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIEFjY2Vzc2liaWxpdHkgRW5oYW5jZW1lbnRzXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4vKiBGb2N1cyB2aXNpYmxlIHN0eWxlcyBmb3Iga2V5Ym9hcmQgbmF2aWdhdGlvbiAqL1xuLnBvc2l0aW9ucy10YWJsZSB0Ym9keSB0cjpmb2N1cy13aXRoaW4sXG4ub3JkZXJzLXRhYmxlIHRib2R5IHRyOmZvY3VzLXdpdGhpbiB7XG4gIG91dGxpbmU6IDJweCBzb2xpZCB2YXIoLS1wcmltYXJ5LWNvbG9yKTtcbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7XG59XG5cbi8qIFNraXAgdG8gY29udGVudCBsaW5rIGZvciBzY3JlZW4gcmVhZGVycyAqL1xuLnNyLW9ubHkge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHdpZHRoOiAxcHg7XG4gIGhlaWdodDogMXB4O1xuICBwYWRkaW5nOiAwO1xuICBtYXJnaW46IC0xcHg7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGNsaXA6IHJlY3QoMCwgMCwgMCwgMCk7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIGJvcmRlci13aWR0aDogMDtcbn1cblxuLyogSGlnaCBjb250cmFzdCBtb2RlIHN1cHBvcnQgKi9cbkBtZWRpYSAocHJlZmVycy1jb250cmFzdDogaGlnaCkge1xuICAuc2lkZS1iYWRnZSxcbiAgLnN0YXR1cy1iYWRnZSxcbiAgLmxldmVyYWdlLWJhZGdlIHtcbiAgICBib3JkZXI6IDJweCBzb2xpZCBjdXJyZW50Q29sb3I7XG4gIH1cblxuICAucG9zaXRpb25zLXRhYmxlIHRkLFxuICAub3JkZXJzLXRhYmxlIHRkIHtcbiAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTtcbiAgfVxufVxuXG4vKiBSZWR1Y2VkIG1vdGlvbiBzdXBwb3J0ICovXG5AbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246IHJlZHVjZSkge1xuICAqIHtcbiAgICBhbmltYXRpb24tZHVyYXRpb246IDAuMDFtcyAhaW1wb3J0YW50O1xuICAgIGFuaW1hdGlvbi1pdGVyYXRpb24tY291bnQ6IDEgIWltcG9ydGFudDtcbiAgICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAwLjAxbXMgIWltcG9ydGFudDtcbiAgfVxufVxuXG4vKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgUHJpbnQgU3R5bGVzXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5AbWVkaWEgcHJpbnQge1xuICAudHJhZGluZy1kYXNoYm9hcmQge1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICB9XG5cbiAgLmRhc2hib2FyZC1hY3Rpb25zLFxuICAuZm9ybS1hY3Rpb25zLFxuICAucG9zaXRpb25zLXRhYmxlIHRkOmxhc3QtY2hpbGQsXG4gIC5vcmRlcnMtdGFibGUgdGQ6bGFzdC1jaGlsZCB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgfVxuXG4gIC5kYXNoYm9hcmQtZ3JpZCB7XG4gICAgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnI7XG4gIH1cblxuICAuYmFsYW5jZS1jYXJkIHtcbiAgICBjb2xvcjogYmxhY2s7XG4gICAgYm9yZGVyOiAycHggc29saWQgYmxhY2s7XG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0= */"]
      });
    }
  }
  return TradingDashboardComponent;
})();

/***/ }),

/***/ 6212:
/*!****************************************************!*\
  !*** ./src/app/services/manual-trading.service.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ManualTradingService: () => (/* binding */ ManualTradingService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 5797);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 9240);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 6301);






/**
 * Manual Trading Service
 *
 * Comprehensive service for manual cryptocurrency trading operations.
 * Handles order placement, position management, balance tracking, and real-time updates.
 *
 * Features:
 * - Place market and limit orders
 * - Manage open positions
 * - Track order history
 * - Monitor account balance
 * - Support for multiple exchanges
 * - Real-time data updates preparation (WebSocket-ready)
 * - Error handling with retry logic
 * - Loading state management with Angular Signals
 *
 * @example
 * ```typescript
 * // Place a limit buy order
 * const order: OrderRequest = {
 *   exchange: 'bybit',
 *   symbol: 'BTCUSDT',
 *   side: 'Buy',
 *   type: 'Limit',
 *   quantity: 0.001,
 *   price: 50000,
 *   timeInForce: 'GTC'
 * };
 * this.tradingService.placeOrder(order).subscribe(response => {
 *   console.log('Order placed:', response);
 * });
 * ```
 */
let ManualTradingService = /*#__PURE__*/(() => {
  class ManualTradingService {
    constructor(http) {
      this.http = http;
      this.baseUrl = 'http://localhost:3000/api';
      // Loading states using Angular Signals
      this.loadingStates = {
        placeOrder: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)(false),
        positions: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)(false),
        orders: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)(false),
        balance: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)(false),
        closePosition: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)(false),
        cancelOrder: (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)(false)
      };
      // Public readonly signals
      this.isPlacingOrder = this.loadingStates.placeOrder.asReadonly();
      this.isLoadingPositions = this.loadingStates.positions.asReadonly();
      this.isLoadingOrders = this.loadingStates.orders.asReadonly();
      this.isLoadingBalance = this.loadingStates.balance.asReadonly();
      this.isClosingPosition = this.loadingStates.closePosition.asReadonly();
      this.isCancellingOrder = this.loadingStates.cancelOrder.asReadonly();
      // Computed signal - true if any operation is loading
      this.isLoading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.computed)(() => this.loadingStates.placeOrder() || this.loadingStates.positions() || this.loadingStates.orders() || this.loadingStates.balance() || this.loadingStates.closePosition() || this.loadingStates.cancelOrder());
      // Cached data streams with auto-refresh capability
      this.positionsCache$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject([]);
      this.ordersCache$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject([]);
      this.balanceCache$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__.BehaviorSubject(null);
      // Public observables for cached data
      this.positions$ = this.positionsCache$.asObservable();
      this.orders$ = this.ordersCache$.asObservable();
      this.balance$ = this.balanceCache$.asObservable();
    }
    /**
     * Place a new order on the exchange
     *
     * @param order - Order request payload
     * @returns Observable<OrderResponse> - Order confirmation from exchange
     * @throws HttpErrorResponse if order placement fails
     */
    placeOrder(order) {
      this.loadingStates.placeOrder.set(true);
      // Validate order before sending
      this.validateOrder(order);
      const url = `${this.baseUrl}/${order.exchange}/order`;
      return this.http.post(url, order).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(() => {
        this.loadingStates.placeOrder.set(false);
        // Refresh orders list after successful order placement
        this.refreshOrders(order.exchange);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingStates.placeOrder.set(false);
        return this.handleError('Failed to place order', error);
      }));
    }
    /**
     * Get all open positions for a specific exchange
     *
     * @param exchange - Exchange identifier
     * @returns Observable<Position[]> - List of open positions
     */
    getPositions(exchange) {
      this.loadingStates.positions.set(true);
      const url = `${this.baseUrl}/${exchange}/positions`;
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(positions => {
        this.loadingStates.positions.set(false);
        this.positionsCache$.next(positions);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingStates.positions.set(false);
        this.positionsCache$.next([]);
        return this.handleError('Failed to fetch positions', error);
      }));
    }
    /**
     * Get order history with pagination
     *
     * @param exchange - Exchange identifier
     * @param params - Pagination parameters (page, limit)
     * @returns Observable<PaginatedResponse<Order>> - Paginated order history
     */
    getOrders(exchange, params) {
      this.loadingStates.orders.set(true);
      const url = `${this.baseUrl}/${exchange}/orders`;
      let httpParams = new _angular_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpParams();
      if (params?.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params?.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }
      return this.http.get(url, {
        params: httpParams
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(response => {
        this.loadingStates.orders.set(false);
        this.ordersCache$.next(response.data);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingStates.orders.set(false);
        this.ordersCache$.next([]);
        return this.handleError('Failed to fetch orders', error);
      }));
    }
    /**
     * Get account balance for a specific exchange
     *
     * @param exchange - Exchange identifier
     * @returns Observable<Balance> - Account balance information
     */
    getAccountBalance(exchange) {
      this.loadingStates.balance.set(true);
      const url = `${this.baseUrl}/${exchange}/balance`;
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(balance => {
        this.loadingStates.balance.set(false);
        this.balanceCache$.next(balance);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingStates.balance.set(false);
        return this.handleError('Failed to fetch balance', error);
      }));
    }
    /**
     * Close an open position (market order in opposite direction)
     *
     * @param request - Close position request
     * @returns Observable<OrderResponse> - Closing order confirmation
     */
    closePosition(request) {
      this.loadingStates.closePosition.set(true);
      const url = `${this.baseUrl}/${request.exchange}/position/close`;
      return this.http.post(url, request).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(() => {
        this.loadingStates.closePosition.set(false);
        // Refresh positions and orders after closing
        this.refreshPositions(request.exchange);
        this.refreshOrders(request.exchange);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingStates.closePosition.set(false);
        return this.handleError('Failed to close position', error);
      }));
    }
    /**
     * Cancel a pending order
     *
     * @param request - Cancel order request
     * @returns Observable<void> - Confirmation of cancellation
     */
    cancelOrder(request) {
      this.loadingStates.cancelOrder.set(true);
      const url = `${this.baseUrl}/${request.exchange}/order/${request.orderId}`;
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpParams().set('symbol', request.symbol);
      return this.http.delete(url, {
        params
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(() => {
        this.loadingStates.cancelOrder.set(false);
        // Refresh orders list after cancellation
        this.refreshOrders(request.exchange);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        this.loadingStates.cancelOrder.set(false);
        return this.handleError('Failed to cancel order', error);
      }));
    }
    /**
     * Get available trading symbols for an exchange
     *
     * @param exchange - Exchange identifier
     * @returns Observable<SymbolInfo[]> - List of available trading pairs
     */
    getSymbols(exchange) {
      const url = `${this.baseUrl}/trading/symbols`;
      const params = new _angular_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpParams().set('exchange', exchange.toUpperCase());
      return this.http.get(url, {
        params
      }).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.shareReplay)(1),
      // Cache symbols data
      (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        return this.handleError('Failed to fetch symbols', error);
      }));
    }
    /**
     * Get symbol information for a specific trading pair
     *
     * @param exchange - Exchange identifier
     * @param symbol - Trading symbol
     * @returns Observable<SymbolInfo> - Symbol details
     */
    getSymbolInfo(exchange, symbol) {
      const url = `${this.baseUrl}/${exchange}/symbols/${symbol}`;
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.catchError)(error => {
        return this.handleError('Failed to fetch symbol info', error);
      }));
    }
    /**
     * Refresh positions data (manually trigger refresh)
     *
     * @param exchange - Exchange identifier
     */
    refreshPositions(exchange) {
      this.getPositions(exchange).subscribe({
        error: error => console.error('Failed to refresh positions:', error)
      });
    }
    /**
     * Refresh orders data (manually trigger refresh)
     *
     * @param exchange - Exchange identifier
     */
    refreshOrders(exchange) {
      this.getOrders(exchange).subscribe({
        error: error => console.error('Failed to refresh orders:', error)
      });
    }
    /**
     * Refresh balance data (manually trigger refresh)
     *
     * @param exchange - Exchange identifier
     */
    refreshBalance(exchange) {
      this.getAccountBalance(exchange).subscribe({
        error: error => console.error('Failed to refresh balance:', error)
      });
    }
    /**
     * Refresh all trading data
     *
     * @param exchange - Exchange identifier
     */
    refreshAll(exchange) {
      this.refreshPositions(exchange);
      this.refreshOrders(exchange);
      this.refreshBalance(exchange);
    }
    /**
     * Set up auto-refresh for trading data
     * Returns an observable that emits at regular intervals
     *
     * @param exchange - Exchange identifier
     * @param intervalMs - Refresh interval in milliseconds (default: 10000ms = 10s)
     * @returns Observable that triggers data refresh
     */
    setupAutoRefresh(exchange, intervalMs = 10000) {
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.interval)(intervalMs).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.tap)(() => this.refreshAll(exchange)));
    }
    /**
     * Clear all cached data
     */
    clearCache() {
      this.positionsCache$.next([]);
      this.ordersCache$.next([]);
      this.balanceCache$.next(null);
    }
    /**
     * Validate order before submission
     * Throws error if validation fails
     *
     * @param order - Order to validate
     * @private
     */
    validateOrder(order) {
      if (!order.symbol) {
        throw new Error('Symbol is required');
      }
      if (!order.quantity || order.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      if (order.type === 'Limit' && (!order.price || order.price <= 0)) {
        throw new Error('Price is required for limit orders');
      }
      if (order.stopLoss && order.stopLoss <= 0) {
        throw new Error('Stop loss must be greater than 0');
      }
      if (order.takeProfit && order.takeProfit <= 0) {
        throw new Error('Take profit must be greater than 0');
      }
      // Validate stop loss and take profit relative to price
      if (order.price && order.stopLoss && order.takeProfit) {
        if (order.side === 'Buy') {
          if (order.stopLoss >= order.price) {
            throw new Error('Stop loss must be below entry price for buy orders');
          }
          if (order.takeProfit <= order.price) {
            throw new Error('Take profit must be above entry price for buy orders');
          }
        } else {
          if (order.stopLoss <= order.price) {
            throw new Error('Stop loss must be above entry price for sell orders');
          }
          if (order.takeProfit >= order.price) {
            throw new Error('Take profit must be below entry price for sell orders');
          }
        }
      }
    }
    /**
     * Centralized error handling
     *
     * @param message - Error message prefix
     * @param error - HTTP error response
     * @returns Observable that emits error
     * @private
     */
    handleError(message, error) {
      let errorMessage = message;
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `${message}: ${error.error.message}`;
      } else {
        // Server-side error
        const serverMessage = error.error?.message || error.error?.error || error.message;
        errorMessage = `${message}: ${serverMessage}`;
      }
      console.error('Trading Service Error:', {
        message: errorMessage,
        status: error.status,
        error: error.error
      });
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_7__.throwError)(() => new Error(errorMessage));
    }
    /**
     * Generate mock data for development/testing
     * This method provides realistic mock data when backend is not available
     */
    getMockPositions() {
      return [{
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
      }, {
        id: '2',
        exchange: 'bybit',
        symbol: 'ETHUSDT',
        side: 'Sell',
        size: 1.5,
        entryPrice: 3000,
        markPrice: 2950,
        liquidationPrice: 3200,
        leverage: 5,
        unrealizedPnl: 75,
        unrealizedPnlPercent: 1.67,
        marginType: 'Isolated',
        positionMargin: 900,
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date()
      }];
    }
    getMockOrders() {
      return [{
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
        createdAt: new Date(Date.now() - 1800000),
        updatedAt: new Date(Date.now() - 1800000)
      }, {
        orderId: 'order-2',
        exchange: 'bybit',
        symbol: 'ETHUSDT',
        side: 'Sell',
        type: 'Market',
        quantity: 1.5,
        status: 'Filled',
        timeInForce: 'GTC',
        filledQuantity: 1.5,
        averagePrice: 3000,
        commission: 4.5,
        commissionAsset: 'USDT',
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date(Date.now() - 3600000)
      }];
    }
    getMockBalance() {
      return {
        exchange: 'bybit',
        totalBalance: 10175,
        availableBalance: 8675,
        usedMargin: 1400,
        unrealizedPnl: 175,
        walletBalance: 10000,
        currency: 'USDT',
        updatedAt: new Date()
      };
    }
    static {
      this.ɵfac = function ManualTradingService_Factory(t) {
        return new (t || ManualTradingService)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_4__.HttpClient));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({
        token: ManualTradingService,
        factory: ManualTradingService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return ManualTradingService;
})();

/***/ }),

/***/ 1870:
/*!****************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/operators/share.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   share: () => (/* binding */ share)
/* harmony export */ });
/* harmony import */ var _observable_innerFrom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../observable/innerFrom */ 2645);
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Subject */ 819);
/* harmony import */ var _Subscriber__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Subscriber */ 9285);
/* harmony import */ var _util_lift__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/lift */ 3200);




function share(options = {}) {
  const {
    connector = () => new _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject(),
    resetOnError = true,
    resetOnComplete = true,
    resetOnRefCountZero = true
  } = options;
  return wrapperSource => {
    let connection;
    let resetConnection;
    let subject;
    let refCount = 0;
    let hasCompleted = false;
    let hasErrored = false;
    const cancelReset = () => {
      resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
      resetConnection = undefined;
    };
    const reset = () => {
      cancelReset();
      connection = subject = undefined;
      hasCompleted = hasErrored = false;
    };
    const resetAndUnsubscribe = () => {
      const conn = connection;
      reset();
      conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
    };
    return (0,_util_lift__WEBPACK_IMPORTED_MODULE_1__.operate)((source, subscriber) => {
      refCount++;
      if (!hasErrored && !hasCompleted) {
        cancelReset();
      }
      const dest = subject = subject !== null && subject !== void 0 ? subject : connector();
      subscriber.add(() => {
        refCount--;
        if (refCount === 0 && !hasErrored && !hasCompleted) {
          resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
        }
      });
      dest.subscribe(subscriber);
      if (!connection && refCount > 0) {
        connection = new _Subscriber__WEBPACK_IMPORTED_MODULE_2__.SafeSubscriber({
          next: value => dest.next(value),
          error: err => {
            hasErrored = true;
            cancelReset();
            resetConnection = handleReset(reset, resetOnError, err);
            dest.error(err);
          },
          complete: () => {
            hasCompleted = true;
            cancelReset();
            resetConnection = handleReset(reset, resetOnComplete);
            dest.complete();
          }
        });
        (0,_observable_innerFrom__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(source).subscribe(connection);
      }
    })(wrapperSource);
  };
}
function handleReset(reset, on, ...args) {
  if (on === true) {
    reset();
    return;
  }
  if (on === false) {
    return;
  }
  const onSubscriber = new _Subscriber__WEBPACK_IMPORTED_MODULE_2__.SafeSubscriber({
    next: () => {
      onSubscriber.unsubscribe();
      reset();
    }
  });
  return (0,_observable_innerFrom__WEBPACK_IMPORTED_MODULE_3__.innerFrom)(on(...args)).subscribe(onSubscriber);
}

/***/ }),

/***/ 6301:
/*!**********************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/operators/shareReplay.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   shareReplay: () => (/* binding */ shareReplay)
/* harmony export */ });
/* harmony import */ var _ReplaySubject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ReplaySubject */ 6042);
/* harmony import */ var _share__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./share */ 1870);


function shareReplay(configOrBufferSize, windowTime, scheduler) {
  let bufferSize;
  let refCount = false;
  if (configOrBufferSize && typeof configOrBufferSize === 'object') {
    ({
      bufferSize = Infinity,
      windowTime = Infinity,
      refCount = false,
      scheduler
    } = configOrBufferSize);
  } else {
    bufferSize = configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity;
  }
  return (0,_share__WEBPACK_IMPORTED_MODULE_0__.share)({
    connector: () => new _ReplaySubject__WEBPACK_IMPORTED_MODULE_1__.ReplaySubject(bufferSize, windowTime, scheduler),
    resetOnError: true,
    resetOnComplete: false,
    resetOnRefCountZero: refCount
  });
}

/***/ })

}]);
//# sourceMappingURL=15.js.map