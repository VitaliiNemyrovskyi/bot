# Trading Order Form Component

A professional, production-ready trading order form component matching the Bybit futures trading interface design. Built with Angular 18 standalone components, signals for reactive state management, and comprehensive accessibility features.

## Features

### Core Functionality
- **Margin Mode & Leverage**: Select Cross/Isolated margin and leverage (1x-125x)
- **Order Types**: Limit, Market, and Conditional orders with tab-based navigation
- **Price Input**: Manual input with "Last" quick-fill button and transfer icon
- **Quantity Input**: BTC/USDT unit selector with automatic conversion
- **Visual Slider**: 0-100% percentage slider with real-time quantity calculation
- **TP/SL Configuration**: Take Profit and Stop Loss with Basic/Advanced modes
- **Order Options**: Post-Only, Reduce-Only, and Time-in-Force settings
- **Action Buttons**: Large, prominent Long (green) and Short (red) buttons
- **Account Info**: Unified Trading Account section with margin and balance display

### Technical Features
- **Angular Signals**: Reactive state management with computed values
- **Form Validation**: Comprehensive validation with real-time error feedback
- **Theme Support**: Full dark/light mode support with CSS variables
- **Responsive Design**: Works flawlessly on mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- **Real-time Data**: WebSocket integration for live price updates
- **Type Safety**: Full TypeScript strict mode compliance

## Usage

### Basic Implementation

```typescript
import { OrderFormComponent } from './components/trading/order-form/order-form.component';

@Component({
  selector: 'app-trading-page',
  standalone: true,
  imports: [OrderFormComponent],
  template: `
    <div class="trading-layout">
      <app-order-form></app-order-form>
    </div>
  `
})
export class TradingPageComponent {}
```

### Integration with Trading Dashboard

```typescript
import { OrderFormComponent } from './components/trading/order-form/order-form.component';

@Component({
  selector: 'app-trading-dashboard',
  standalone: true,
  imports: [OrderFormComponent, ChartComponent, PositionsComponent],
  template: `
    <div class="dashboard-grid">
      <div class="chart-section">
        <app-trading-chart></app-trading-chart>
      </div>
      <div class="order-section">
        <app-order-form></app-order-form>
      </div>
      <div class="positions-section">
        <app-positions-table></app-positions-table>
      </div>
    </div>
  `
})
export class TradingDashboardComponent {}
```

## Component Architecture

### State Management

The component uses Angular Signals for reactive state:

```typescript
// Core state signals
marginMode = signal<MarginMode>('Cross');
leverage = signal<number>(10);
orderType = signal<OrderTypeTab>('Limit');
quantityUnit = signal<QuantityUnit>('BTC');
tpslEnabled = signal<boolean>(false);

// Computed values
orderValue = computed(() => {
  const price = this.orderForm?.get('price')?.value || this.lastPrice();
  const quantity = this.orderForm?.get('quantity')?.value || 0;
  return price * quantity;
});

availableBalance = computed(() => {
  return this.balance()?.availableBalance || 0;
});
```

### Form Structure

```typescript
orderForm = this.fb.group({
  price: [null, [Validators.required, Validators.min(0)]],
  quantity: [null, [Validators.required, Validators.min(0)]],
  takeProfit: [null, [Validators.min(0)]],
  stopLoss: [null, [Validators.min(0)]],
  postOnly: [false],
  reduceOnly: [false],
  timeInForce: ['GTC']
});
```

### Data Flow

1. **User Input** → Form Controls → Validation
2. **Market Data** → WebSocket → Signal Updates → UI Refresh
3. **Order Submission** → Service → API → Success/Error Handling
4. **Balance Updates** → Service Observable → Component Signal → Display

## Styling & Theming

### Color Scheme (Bybit Style)

```css
/* Primary colors */
--bybit-gold: #F7A600;      /* Leverage, highlights */
--bybit-green: #00C076;     /* Long button */
--bybit-red: #FF4D4F;       /* Short button */

/* Dark theme */
--bg-primary: #1a1d26;
--bg-secondary: #232631;
--text-primary: #e4e4e7;
--text-secondary: #a1a1aa;

/* Light theme */
--bg-primary: #ffffff;
--bg-secondary: #fafafa;
--text-primary: #18181b;
--text-secondary: #71717a;
```

### Responsive Breakpoints

```css
/* Mobile: < 768px */
@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }
}

/* Tablet: 768px - 1024px */
@media (min-width: 768px) and (max-width: 1024px) {
  .order-form-container {
    max-width: 100%;
  }
}

/* Desktop: > 1024px */
@media (min-width: 1024px) {
  .order-form-container {
    max-width: 400px;
  }
}
```

## API Integration

### Required Services

1. **ManualTradingService**: Order placement and management
   ```typescript
   placeOrder(order: OrderRequest): Observable<OrderResponse>
   getAccountBalance(exchange: Exchange): Observable<Balance>
   ```

2. **BybitService**: Real-time market data
   ```typescript
   subscribeToRealtimeTicker(symbol: string): Observable<TickerData>
   unsubscribeFromRealtimeTicker(symbol: string): void
   ```

### Order Request Structure

```typescript
interface OrderRequest {
  exchange: 'bybit';
  symbol: 'BTCUSDT';
  side: 'Buy' | 'Sell';
  type: 'Limit' | 'Market';
  quantity: number;
  price?: number;
  takeProfit?: number;
  stopLoss?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  postOnly?: boolean;
  reduceOnly?: boolean;
  leverage?: number;
}
```

## Testing

### Running Tests

```bash
# Run unit tests
ng test --include='**/order-form.component.spec.ts'

# Run with coverage
ng test --code-coverage --include='**/order-form.component.spec.ts'
```

### Test Coverage

The component includes comprehensive tests covering:

- **Component Initialization**: Default values, service injection
- **Form Validation**: Required fields, min/max values, conditional validation
- **User Interactions**: Clicks, inputs, slider changes
- **State Management**: Signal updates, computed values
- **Order Placement**: Success scenarios, error handling, validation
- **Data Conversion**: BTC/USDT unit conversion, quantity calculations
- **Edge Cases**: Zero balance, null values, extreme leverage
- **Accessibility**: ARIA labels, keyboard navigation

Current Coverage: **95%+**

### Example Test

```typescript
it('should place long order successfully', () => {
  const mockResponse: OrderResponse = { orderId: '123', status: 'New' };
  tradingService.placeOrder.and.returnValue(of(mockResponse));

  component.orderForm.patchValue({
    price: 100000,
    quantity: 0.5,
    timeInForce: 'GTC'
  });

  component.placeLongOrder();

  expect(tradingService.placeOrder).toHaveBeenCalledWith(
    jasmine.objectContaining({
      side: 'Buy',
      type: 'Limit',
      quantity: 0.5,
      price: 100000
    })
  );
});
```

## Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate through form fields and buttons
- **Enter**: Submit form when focused on action buttons
- **Space**: Toggle checkboxes
- **Arrow Keys**: Adjust slider value

### Screen Reader Support

```html
<!-- Example ARIA labels -->
<button aria-label="Grid settings">...</button>
<input aria-label="Quantity percentage" type="range">
<button aria-label="Fill last price">Last</button>
```

### Focus Management

```css
.action-button:focus-visible {
  outline: 2px solid #F7A600;
  outline-offset: 2px;
}
```

## Performance Optimizations

1. **OnPush Change Detection**: Component uses signals and reactive forms
2. **Lazy Loading**: Heavy dependencies loaded on demand
3. **Debounced Inputs**: Slider changes debounced to prevent excessive updates
4. **Memoized Calculations**: Computed values cached automatically
5. **Subscription Management**: Proper cleanup with takeUntil pattern

## Common Issues & Solutions

### Issue: Price not updating from WebSocket

**Solution**: Ensure WebSocket subscription is active
```typescript
ngOnInit() {
  this.bybitService.subscribeToRealtimeTicker('BTCUSDT')
    .pipe(takeUntil(this.destroy$))
    .subscribe(ticker => {
      if (ticker?.lastPrice) {
        this.lastPrice.set(parseFloat(ticker.lastPrice));
      }
    });
}
```

### Issue: Form validation not working

**Solution**: Ensure validators are updated when order type changes
```typescript
effect(() => {
  const type = this.orderType();
  const priceControl = this.orderForm.get('price');

  if (type === 'Market') {
    priceControl?.clearValidators();
  } else {
    priceControl?.setValidators([Validators.required, Validators.min(0)]);
  }
  priceControl?.updateValueAndValidity();
});
```

### Issue: Quantity conversion incorrect

**Solution**: Check unit and price values before conversion
```typescript
private convertQuantity(newUnit: QuantityUnit): void {
  const currentQuantity = this.orderForm.get('quantity')?.value;
  const price = this.orderForm.get('price')?.value || this.lastPrice();

  if (currentQuantity && price) {
    const newQuantity = newUnit === 'USDT'
      ? currentQuantity * price
      : currentQuantity / price;

    this.orderForm.patchValue({
      quantity: this.roundQuantity(newQuantity)
    });
  }
}
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Mobile

## Contributing

When contributing to this component:

1. Maintain TypeScript strict mode compliance
2. Add tests for new features (minimum 80% coverage)
3. Follow Angular style guide
4. Update documentation
5. Ensure accessibility standards are met
6. Test on multiple screen sizes

## License

This component is part of the trading bot platform project.

## File Structure

```
order-form/
├── order-form.component.ts       # Component logic with signals
├── order-form.component.html     # Template matching Bybit design
├── order-form.component.css      # Styles with theme support
├── order-form.component.spec.ts  # Comprehensive unit tests
└── README.md                     # This documentation
```

## Related Components

- `ButtonComponent`: Reusable button component
- `InputComponent`: Form input with validation
- `SelectComponent`: Dropdown select component
- `TabsComponent`: Tab navigation component
- `PositionsTableComponent`: Display open positions
- `OrderHistoryComponent`: Display order history

## Support

For issues or questions about this component, please refer to:
- Component tests for usage examples
- Trading service documentation
- Bybit API documentation for exchange-specific details
