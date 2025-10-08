# Order Form Component - Integration Guide

## Quick Start

### 1. Import the Component

```typescript
// In your trading dashboard or page component
import { OrderFormComponent } from './components/trading/order-form/order-form.component';

@Component({
  selector: 'app-trading-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    OrderFormComponent,
    // ... other imports
  ],
  template: `
    <div class="dashboard-layout">
      <app-order-form></app-order-form>
    </div>
  `
})
export class TradingDashboardComponent {}
```

### 2. Ensure Required Services are Available

The component depends on these services:

```typescript
// These should already be in your app
- ManualTradingService (provided in root)
- BybitService (provided in root)
```

### 3. Add Theme Support (Optional)

For light/dark theme switching:

```typescript
// In your app component or theme service
export class AppComponent {
  toggleTheme() {
    document.body.classList.toggle('light-theme');
  }
}
```

```css
/* In your global styles */
body.light-theme {
  /* Light theme variables are already defined in component CSS */
}
```

## Layout Examples

### Sidebar Layout

```html
<div class="trading-page">
  <div class="chart-area">
    <app-trading-chart></app-trading-chart>
  </div>

  <aside class="order-sidebar">
    <app-order-form></app-order-form>
  </aside>
</div>
```

```css
.trading-page {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 16px;
  height: 100vh;
}

.chart-area {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
}

.order-sidebar {
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .trading-page {
    grid-template-columns: 1fr;
  }
}
```

### Tab Layout

```html
<ui-tabs [tabs]="mainTabs" [(activeTabId)]="activeTab">
  <ui-tab-content tabId="chart" [active]="activeTab === 'chart'">
    <app-trading-chart></app-trading-chart>
  </ui-tab-content>

  <ui-tab-content tabId="order" [active]="activeTab === 'order'">
    <app-order-form></app-order-form>
  </ui-tab-content>

  <ui-tab-content tabId="positions" [active]="activeTab === 'positions'">
    <app-positions-table></app-positions-table>
  </ui-tab-content>
</ui-tabs>
```

### Modal/Dialog Layout

```typescript
// Open order form in a dialog
openOrderForm() {
  this.dialog.open(DialogComponent, {
    component: OrderFormComponent,
    width: '450px',
    height: 'auto'
  });
}
```

## Advanced Configuration

### Custom Symbol Support

To support different trading symbols:

```typescript
// Extend the component (or modify it)
@Component({
  selector: 'app-order-form',
  // ...
})
export class OrderFormComponent {
  @Input() symbol: string = 'BTCUSDT';
  @Input() exchange: Exchange = 'bybit';

  // Update placeOrder method to use these inputs
  private placeOrder(side: OrderSide): void {
    const orderRequest: OrderRequest = {
      exchange: this.exchange,
      symbol: this.symbol,
      // ... rest of the order
    };
  }
}
```

### Custom Event Handlers

Add output events for external handling:

```typescript
export class OrderFormComponent {
  @Output() orderPlaced = new EventEmitter<OrderResponse>();
  @Output() orderError = new EventEmitter<Error>();

  private placeOrder(side: OrderSide): void {
    this.tradingService.placeOrder(orderRequest).subscribe({
      next: (response) => {
        this.orderPlaced.emit(response);
        // ... existing logic
      },
      error: (error) => {
        this.orderError.emit(error);
        // ... existing logic
      }
    });
  }
}
```

Usage:

```html
<app-order-form
  (orderPlaced)="onOrderPlaced($event)"
  (orderError)="onOrderError($event)">
</app-order-form>
```

## WebSocket Connection Management

### Ensure WebSocket is Connected

```typescript
export class TradingDashboardComponent implements OnInit {
  constructor(private bybitService: BybitService) {}

  ngOnInit() {
    // Check WebSocket connection
    this.bybitService.getWebSocketConnectionState().subscribe(state => {
      if (state === 'disconnected') {
        console.warn('WebSocket disconnected, reconnecting...');
      }
    });
  }
}
```

### Handle Connection Errors

```typescript
export class OrderFormComponent {
  private subscribeToMarketData(): void {
    this.bybitService.subscribeToRealtimeTicker(this.symbol)
      .pipe(
        takeUntil(this.destroy$),
        retry({ count: 3, delay: 2000 }) // Retry on failure
      )
      .subscribe({
        next: (ticker) => {
          if (ticker?.lastPrice) {
            this.lastPrice.set(parseFloat(ticker.lastPrice));
          }
        },
        error: (error) => {
          console.error('WebSocket error:', error);
          // Fallback to polling or show error message
        }
      });
  }
}
```

## State Synchronization

### Sync with Parent Component

```typescript
export class TradingDashboardComponent {
  selectedSymbol = signal<string>('BTCUSDT');

  // Pass symbol to order form
  template = `
    <app-order-form [symbol]="selectedSymbol()"></app-order-form>
  `;
}
```

### Sync with Route Parameters

```typescript
export class TradingPageComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private orderFormRef: OrderFormComponent
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['symbol']) {
        // Update order form symbol
        this.orderFormRef.symbol = params['symbol'];
      }
    });
  }
}
```

## Error Handling

### Global Error Handler

```typescript
@Injectable()
export class OrderFormErrorHandler {
  handleError(error: Error): void {
    if (error.message.includes('Insufficient balance')) {
      this.showBalanceError();
    } else if (error.message.includes('Invalid price')) {
      this.showPriceError();
    } else {
      this.showGenericError(error);
    }
  }

  private showBalanceError(): void {
    // Show toast or modal
  }
}
```

### Form-level Error Display

```html
<!-- Add to order-form.component.html -->
<div class="form-errors" *ngIf="orderForm.errors">
  <div class="error-message" *ngFor="let error of getFormErrors()">
    {{ error }}
  </div>
</div>
```

```typescript
getFormErrors(): string[] {
  const errors: string[] = [];

  if (this.orderForm.hasError('insufficientBalance')) {
    errors.push('Insufficient balance for this order');
  }

  if (this.orderForm.hasError('invalidPrice')) {
    errors.push('Price is outside allowed range');
  }

  return errors;
}
```

## Performance Optimization

### Lazy Load Heavy Components

```typescript
// Route configuration
const routes: Routes = [
  {
    path: 'trading',
    loadComponent: () => import('./trading-dashboard/trading-dashboard.component')
      .then(m => m.TradingDashboardComponent)
  }
];
```

### Virtual Scrolling for Order History

If integrating with order history:

```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

<cdk-virtual-scroll-viewport itemSize="50" class="order-history">
  <div *cdkVirtualFor="let order of orders">
    {{ order.orderId }}
  </div>
</cdk-virtual-scroll-viewport>
```

## Testing Integration

### Component Testing with Order Form

```typescript
describe('TradingDashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TradingDashboardComponent,
        OrderFormComponent
      ],
      providers: [
        { provide: ManualTradingService, useValue: mockTradingService },
        { provide: BybitService, useValue: mockBybitService }
      ]
    }).compileComponents();
  });

  it('should render order form', () => {
    const fixture = TestBed.createComponent(TradingDashboardComponent);
    fixture.detectChanges();

    const orderForm = fixture.nativeElement.querySelector('app-order-form');
    expect(orderForm).toBeTruthy();
  });
});
```

### E2E Testing

```typescript
// order-form.e2e.spec.ts
describe('Order Form E2E', () => {
  it('should place a limit order', () => {
    cy.visit('/trading');

    // Fill form
    cy.get('[formControlName="price"]').type('100000');
    cy.get('[formControlName="quantity"]').type('0.5');

    // Select leverage
    cy.get('.leverage-select select').select('10x');

    // Place order
    cy.get('.long-button').click();

    // Verify success
    cy.contains('Order placed successfully').should('be.visible');
  });
});
```

## Troubleshooting

### Issue: Component not rendering

**Check:**
1. Component is imported in parent module/component
2. Services are provided in root or parent
3. No template errors in console

### Issue: Signals not updating

**Check:**
1. Signal is set, not mutated: `signal.set(value)` not `signal() = value`
2. Computed signals have correct dependencies
3. Effect is properly registered

### Issue: WebSocket not connecting

**Check:**
1. WebSocket service is initialized
2. API endpoint is correct
3. CORS settings allow WebSocket connections
4. Network tab shows WebSocket upgrade

### Issue: Form validation not working

**Check:**
1. ReactiveFormsModule is imported
2. Validators are set correctly
3. Form control names match template
4. `updateValueAndValidity()` called after validator changes

## Best Practices

1. **Always cleanup subscriptions**: Use `takeUntil(destroy$)` pattern
2. **Handle errors gracefully**: Show user-friendly error messages
3. **Test thoroughly**: Aim for 80%+ code coverage
4. **Monitor performance**: Use Chrome DevTools Performance tab
5. **Accessibility first**: Test with keyboard and screen readers
6. **Responsive design**: Test on mobile devices
7. **Theme support**: Ensure components work in both themes

## Next Steps

After integration:

1. Customize colors to match your brand
2. Add analytics tracking for order events
3. Implement order confirmation dialogs
4. Add sound notifications for order fills
5. Create keyboard shortcuts for quick trading
6. Add mobile-optimized gestures
7. Implement order presets/templates

## Support Resources

- [Angular Signals Documentation](https://angular.io/guide/signals)
- [Reactive Forms Guide](https://angular.io/guide/reactive-forms)
- [Bybit API Documentation](https://bybit-exchange.github.io/docs/)
- [Component Test Suite](./order-form.component.spec.ts)
- [Component README](./README.md)
