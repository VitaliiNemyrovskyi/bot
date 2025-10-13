# Trade History Service - Integration Example

## Overview

This document provides a practical example of integrating the `TradeHistoryService` into the existing funding-rates component or any other component in the application.

## Quick Integration into Funding Rates Component

### Step 1: Import the Service

Add the import to your component:

```typescript
import { TradeHistoryService } from '../../services/trade-history.service';
import { TradeHistoryRecord } from '../../models/trade-history.model';
```

### Step 2: Inject the Service

Inject the service in your component constructor:

```typescript
export class FundingRatesComponent implements OnInit {
  constructor(
    private tradeHistoryService: TradeHistoryService,
    // ... other services
  ) {}
}
```

### Step 3: Add Component Properties

Add properties to store trade history state:

```typescript
export class FundingRatesComponent implements OnInit {
  // Trade history
  trades: TradeHistoryRecord[] = [];
  tradesLoading = false;
  tradesError: string | null = null;

  // Or use signals directly
  trades = this.tradeHistoryService.trades;
  isLoadingTrades = this.tradeHistoryService.isLoading;
  tradesError = this.tradeHistoryService.error;
}
```

### Step 4: Load Trade History

Load trade history when component initializes or when user selects a symbol:

```typescript
ngOnInit() {
  this.loadTradeHistory();
}

loadTradeHistory() {
  // Option 1: Load all trades
  this.tradeHistoryService.getTradeHistory({ limit: 100 }).subscribe({
    next: (response) => {
      console.log('Loaded trades:', response.count);
    },
    error: (err) => {
      console.error('Failed to load trades:', err);
    }
  });

  // Option 2: Load trades for selected symbol
  const symbol = this.selectedSymbol; // e.g., 'BTCUSDT'
  const exchange = this.selectedExchange; // e.g., 'bybit'

  if (symbol && exchange) {
    this.tradeHistoryService
      .getTradeHistoryBySymbol(symbol, exchange, 50)
      .subscribe();
  }
}
```

### Step 5: Display Trade History in Template

Add trade history display to your component template:

```html
<!-- Trade History Section -->
<div class="trade-history-section">
  <h3>Trade History</h3>

  <!-- Loading State -->
  <div *ngIf="tradeHistoryService.isLoading()" class="loading">
    <mat-spinner diameter="30"></mat-spinner>
    <span>Loading trade history...</span>
  </div>

  <!-- Error State -->
  <div *ngIf="tradeHistoryService.error() as error" class="error-message">
    <mat-icon>error</mat-icon>
    <span>{{ error }}</span>
    <button mat-button (click)="loadTradeHistory()">Retry</button>
  </div>

  <!-- Empty State -->
  <div *ngIf="!tradeHistoryService.isLoading() &&
              !tradeHistoryService.error() &&
              !tradeHistoryService.hasTrades()"
       class="empty-state">
    <mat-icon>inbox</mat-icon>
    <p>No trade history available</p>
  </div>

  <!-- Trade Statistics -->
  <div *ngIf="tradeHistoryService.hasTrades()" class="trade-stats">
    <div class="stat-card">
      <span class="stat-label">Total Trades</span>
      <span class="stat-value">{{ tradeHistoryService.statistics().totalTrades }}</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Win Rate</span>
      <span class="stat-value">{{ tradeHistoryService.statistics().winRate.toFixed(2) }}%</span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Total PnL</span>
      <span class="stat-value"
            [class.positive]="tradeHistoryService.statistics().totalPnl >= 0"
            [class.negative]="tradeHistoryService.statistics().totalPnl < 0">
        {{ tradeHistoryService.statistics().totalPnl.toFixed(2) }} USDT
      </span>
    </div>
    <div class="stat-card">
      <span class="stat-label">Net Profit</span>
      <span class="stat-value"
            [class.positive]="tradeHistoryService.statistics().netProfit >= 0"
            [class.negative]="tradeHistoryService.statistics().netProfit < 0">
        {{ tradeHistoryService.statistics().netProfit.toFixed(2) }} USDT
      </span>
    </div>
  </div>

  <!-- Trade History Table -->
  <table *ngIf="tradeHistoryService.hasTrades()" class="trades-table">
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Exchange</th>
        <th>Type</th>
        <th>Entry</th>
        <th>Exit</th>
        <th>PnL</th>
        <th>Funding</th>
        <th>Duration</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let trade of tradeHistoryService.trades()">
        <td>{{ trade.symbol }}</td>
        <td>{{ trade.exchange }}</td>
        <td>
          <span class="position-type" [class]="trade.positionType">
            {{ trade.positionType | uppercase }}
          </span>
        </td>
        <td>{{ trade.entryPrice.toFixed(2) }}</td>
        <td>{{ trade.exitPrice ? trade.exitPrice.toFixed(2) : '-' }}</td>
        <td [style.color]="getPnlColor(trade.realizedPnl)">
          {{ formatPnl(trade.realizedPnl) }}
        </td>
        <td class="positive">+{{ trade.fundingEarned.toFixed(2) }}</td>
        <td>{{ formatDuration(trade.duration) }}</td>
        <td>
          <span class="status-badge" [class]="trade.status.toLowerCase()">
            {{ trade.status }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Step 6: Add Helper Methods

Add helper methods to your component:

```typescript
formatPnl(pnl: number): string {
  return this.tradeHistoryService.formatPnl(pnl).value;
}

getPnlColor(pnl: number): string {
  return this.tradeHistoryService.formatPnl(pnl).color;
}

formatDuration(duration?: number): string {
  if (!duration) return '-';
  return this.tradeHistoryService.formatDuration(duration);
}

refreshTrades() {
  this.tradeHistoryService.refreshTradeHistory().subscribe();
}
```

### Step 7: Add Styles

Add styles to your component CSS:

```scss
.trade-history-section {
  margin-top: 2rem;

  .loading {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #fee;
    border-radius: 4px;
    color: #c00;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .trade-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;

    .stat-card {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      background: #f5f5f5;
      border-radius: 8px;

      .stat-label {
        font-size: 0.875rem;
        color: #666;
        margin-bottom: 0.5rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 600;

        &.positive {
          color: #22c55e;
        }

        &.negative {
          color: #ef4444;
        }
      }
    }
  }

  .trades-table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: 0.75rem;
      background: #f5f5f5;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }

    td {
      padding: 0.75rem;
      border-bottom: 1px solid #eee;
    }

    .position-type {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;

      &.long {
        background: #dcfce7;
        color: #16a34a;
      }

      &.short {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;

      &.open {
        background: #dbeafe;
        color: #2563eb;
      }

      &.closed {
        background: #d1fae5;
        color: #059669;
      }

      &.liquidated {
        background: #fee2e2;
        color: #dc2626;
      }
    }

    .positive {
      color: #22c55e;
    }

    .negative {
      color: #ef4444;
    }
  }
}
```

## Advanced Usage Examples

### Filter by Symbol on Selection

```typescript
onSymbolSelected(symbol: string, exchange: string) {
  this.tradeHistoryService
    .getTradeHistoryBySymbol(symbol, exchange, 50)
    .subscribe({
      next: () => {
        console.log(`Loaded trades for ${symbol} on ${exchange}`);
      }
    });
}
```

### Show Only Recent Trades

```typescript
loadRecentTrades() {
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days

  this.tradeHistoryService
    .getTradeHistoryByDateRange(startDate, endDate, 100)
    .subscribe();
}
```

### Display Symbol-Specific Statistics

```typescript
getSymbolStats(symbol: string) {
  return this.tradeHistoryService.getStatisticsBySymbol(symbol);
}

// In template
<div *ngIf="selectedSymbol">
  <h4>{{ selectedSymbol }} Statistics</h4>
  <p>Win Rate: {{ getSymbolStats(selectedSymbol).winRate.toFixed(2) }}%</p>
  <p>Total PnL: {{ getSymbolStats(selectedSymbol).totalPnl.toFixed(2) }}</p>
</div>
```

### Auto-Refresh Trade History

```typescript
private refreshInterval?: number;

ngOnInit() {
  this.loadTradeHistory();

  // Auto-refresh every 30 seconds
  this.refreshInterval = window.setInterval(() => {
    this.tradeHistoryService.refreshTradeHistory().subscribe();
  }, 30000);
}

ngOnDestroy() {
  if (this.refreshInterval) {
    clearInterval(this.refreshInterval);
  }
}
```

### Using Observables with Async Pipe

```typescript
// In component
trades$ = this.tradeHistoryService.trades$;
loading$ = this.tradeHistoryService.loading$;
error$ = this.tradeHistoryService.error$;

// In template
<div *ngIf="loading$ | async">Loading...</div>
<div *ngIf="error$ | async as error">{{ error }}</div>
<div *ngFor="let trade of trades$ | async">
  {{ trade.symbol }}
</div>
```

## Best Practices

1. **Error Handling**: Always handle errors gracefully with user-friendly messages
2. **Loading States**: Show loading indicators during data fetching
3. **Cleanup**: Clear subscriptions in `ngOnDestroy()`
4. **Caching**: Leverage the service's caching to avoid redundant API calls
5. **Performance**: Use `trackBy` in `*ngFor` for large lists
6. **Type Safety**: Always use TypeScript interfaces for type checking

## Testing

Example test for component integration:

```typescript
describe('FundingRatesComponent with TradeHistory', () => {
  let component: FundingRatesComponent;
  let fixture: ComponentFixture<FundingRatesComponent>;
  let tradeHistoryService: jasmine.SpyObj<TradeHistoryService>;

  beforeEach(() => {
    const tradeHistorySpy = jasmine.createSpyObj('TradeHistoryService', [
      'getTradeHistory',
      'formatPnl',
      'formatDuration'
    ]);

    TestBed.configureTestingModule({
      declarations: [FundingRatesComponent],
      providers: [
        { provide: TradeHistoryService, useValue: tradeHistorySpy }
      ]
    });

    fixture = TestBed.createComponent(FundingRatesComponent);
    component = fixture.componentInstance;
    tradeHistoryService = TestBed.inject(TradeHistoryService) as jasmine.SpyObj<TradeHistoryService>;
  });

  it('should load trade history on init', () => {
    tradeHistoryService.getTradeHistory.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(tradeHistoryService.getTradeHistory).toHaveBeenCalled();
  });
});
```

## Summary

The Trade History Service provides a robust foundation for managing trade history data in your Angular application. It follows Angular best practices, provides excellent type safety, and offers both imperative and reactive programming patterns.

For detailed API documentation, see `/frontend/src/app/services/README_TRADE_HISTORY.md`.
