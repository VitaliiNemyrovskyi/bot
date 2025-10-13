# Trade History Service Documentation

## Overview

The `TradeHistoryService` is a comprehensive Angular service for managing trade history data in the trading bot dashboard. It provides reactive state management using Angular signals and RxJS observables, with built-in caching, error handling, and statistics calculation.

## Features

- **Reactive State Management**: Uses Angular signals for reactive data flow
- **Flexible Query Parameters**: Filter by symbol, exchange, status, date range, and more
- **Automatic Authentication**: JWT tokens are automatically added via HTTP interceptor
- **Comprehensive Error Handling**: User-friendly error messages for all HTTP status codes
- **Trade Statistics**: Calculate win rate, PnL, fees, and other metrics
- **Caching**: Stores fetched data for efficient access
- **Type Safety**: Fully typed with TypeScript interfaces

## Installation & Setup

The service is provided in root scope and ready to use via dependency injection:

```typescript
import { TradeHistoryService } from './services/trade-history.service';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.html'
})
export class MyComponent {
  constructor(private tradeHistoryService: TradeHistoryService) {}
}
```

## Basic Usage

### Fetch All Trade History

```typescript
this.tradeHistoryService.getTradeHistory().subscribe({
  next: (response) => {
    console.log('Fetched trades:', response.data);
    console.log('Total count:', response.count);
  },
  error: (error) => {
    console.error('Error:', error.message);
  }
});
```

### Fetch Trades with Query Parameters

```typescript
this.tradeHistoryService.getTradeHistory({
  symbol: 'BTCUSDT',
  exchange: 'bybit',
  limit: 50,
  status: 'CLOSED'
}).subscribe(response => {
  console.log('Filtered trades:', response.data);
});
```

## Convenience Methods

### By Symbol and Exchange

```typescript
this.tradeHistoryService
  .getTradeHistoryBySymbol('BTCUSDT', 'bybit', 100)
  .subscribe(response => {
    // Handle response
  });
```

### By Exchange Only

```typescript
this.tradeHistoryService
  .getTradeHistoryByExchange('bybit', 50)
  .subscribe(response => {
    // Handle response
  });
```

### Closed Trades Only

```typescript
this.tradeHistoryService
  .getClosedTrades(25)
  .subscribe(response => {
    // Handle response
  });
```

### Open Trades Only

```typescript
this.tradeHistoryService
  .getOpenTrades(10)
  .subscribe(response => {
    // Handle response
  });
```

### By Date Range

```typescript
const startDate = '2025-10-01T00:00:00Z';
const endDate = '2025-10-31T23:59:59Z';

this.tradeHistoryService
  .getTradeHistoryByDateRange(startDate, endDate, 100)
  .subscribe(response => {
    // Handle response
  });
```

## Reactive State with Signals

### Access Cached Data

```typescript
// Using signals (recommended for Angular 16+)
const trades = this.tradeHistoryService.trades();
const isLoading = this.tradeHistoryService.isLoading();
const error = this.tradeHistoryService.error();
const totalCount = this.tradeHistoryService.totalCount();

// In template
{{ tradeHistoryService.trades() | json }}
```

### Access via Observables

```typescript
// Using observables (for async pipe)
this.tradeHistoryService.trades$.subscribe(trades => {
  console.log('Trades updated:', trades);
});

this.tradeHistoryService.loading$.subscribe(isLoading => {
  console.log('Loading state:', isLoading);
});
```

### Computed Signals

```typescript
// Check if any trades are loaded
const hasTrades = this.tradeHistoryService.hasTrades();

// Get filtered trades
const openTrades = this.tradeHistoryService.openTrades();
const closedTrades = this.tradeHistoryService.closedTrades();

// Get calculated statistics
const stats = this.tradeHistoryService.statistics();
console.log('Win rate:', stats.winRate);
console.log('Total PnL:', stats.totalPnl);
```

## Statistics

### Calculate Statistics from All Trades

```typescript
const stats = this.tradeHistoryService.statistics();

console.log('Total Trades:', stats.totalTrades);
console.log('Profitable Trades:', stats.profitableTrades);
console.log('Win Rate:', stats.winRate.toFixed(2) + '%');
console.log('Total PnL:', stats.totalPnl);
console.log('Total Funding:', stats.totalFunding);
console.log('Net Profit:', stats.netProfit);
```

### Calculate Statistics for Specific Symbol

```typescript
const btcStats = this.tradeHistoryService.getStatisticsBySymbol('BTCUSDT');
console.log('BTC Win Rate:', btcStats.winRate);
```

### Calculate Statistics for Specific Exchange

```typescript
const bybitStats = this.tradeHistoryService.getStatisticsByExchange('bybit');
console.log('Bybit Total PnL:', bybitStats.totalPnl);
```

## Utility Methods

### Format Duration

```typescript
const formatted = this.tradeHistoryService.formatDuration(7200);
console.log(formatted); // "2h 0m"
```

### Format PnL

```typescript
const pnl = this.tradeHistoryService.formatPnl(25.5);
console.log(pnl.value);      // "+25.50"
console.log(pnl.color);      // "green"
console.log(pnl.isPositive); // true
```

### Refresh Data

```typescript
this.tradeHistoryService.refreshTradeHistory().subscribe();
```

### Clear Cache

```typescript
this.tradeHistoryService.clearTradeHistory();
```

### Clear Error

```typescript
this.tradeHistoryService.clearError();
```

## Component Integration Example

```typescript
import { Component, OnInit } from '@angular/core';
import { TradeHistoryService } from './services/trade-history.service';

@Component({
  selector: 'app-trade-history',
  template: `
    <div *ngIf="tradeHistoryService.isLoading()">
      Loading trades...
    </div>

    <div *ngIf="tradeHistoryService.error() as error" class="error">
      {{ error }}
    </div>

    <div *ngIf="tradeHistoryService.hasTrades()">
      <h3>Statistics</h3>
      <p>Total Trades: {{ stats().totalTrades }}</p>
      <p>Win Rate: {{ stats().winRate.toFixed(2) }}%</p>
      <p>Total PnL: {{ stats().totalPnl.toFixed(2) }} USDT</p>

      <h3>Trade History</h3>
      <table>
        <tr *ngFor="let trade of tradeHistoryService.trades()">
          <td>{{ trade.symbol }}</td>
          <td>{{ trade.exchange }}</td>
          <td [style.color]="formatPnl(trade.realizedPnl).color">
            {{ formatPnl(trade.realizedPnl).value }}
          </td>
        </tr>
      </table>
    </div>
  `
})
export class TradeHistoryComponent implements OnInit {
  // Make service public for template access
  constructor(public tradeHistoryService: TradeHistoryService) {}

  // Alias for convenience
  stats = this.tradeHistoryService.statistics;

  ngOnInit() {
    this.loadTrades();
  }

  loadTrades() {
    this.tradeHistoryService.getTradeHistory({
      limit: 100,
      sortBy: 'executedAt',
      sortOrder: 'desc'
    }).subscribe();
  }

  formatPnl(pnl: number) {
    return this.tradeHistoryService.formatPnl(pnl);
  }
}
```

## API Endpoint

The service calls the following backend endpoint:

```
GET /api/trading/history
```

### Query Parameters

| Parameter   | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| symbol      | string | Filter by trading pair (e.g., BTCUSDT)        |
| exchange    | string | Filter by exchange (e.g., bybit, bingx)       |
| limit       | number | Maximum number of records to return            |
| offset      | number | Starting position for pagination               |
| status      | string | Filter by status (OPEN, CLOSED, LIQUIDATED)   |
| startDate   | string | Start date for date range filter (ISO 8601)   |
| endDate     | string | End date for date range filter (ISO 8601)     |
| sortBy      | string | Sort field (executedAt, closedAt, etc.)       |
| sortOrder   | string | Sort direction (asc, desc)                     |

### Response Format

```typescript
{
  success: boolean;
  data: TradeHistoryRecord[];
  count: number;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

## TypeScript Interfaces

### TradeHistoryRecord

```typescript
interface TradeHistoryRecord {
  id: string;
  symbol: string;
  exchange: string;
  executedAt: string;
  closedAt: string | null;
  positionSizeUsdt: number;
  fundingEarned: number;
  realizedPnl: number;
  entryPrice: number;
  exitPrice: number | null;
  leverage: number;
  quantity: number;
  status: string;
  positionType?: 'long' | 'short';
  entryFee?: number;
  exitFee?: number;
  duration?: number;
  roi?: number;
}
```

### TradeStatistics

```typescript
interface TradeStatistics {
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  totalFunding: number;
  averagePnl: number;
  largestWin: number;
  largestLoss: number;
  totalFees: number;
  netProfit: number;
  averageRoi: number;
}
```

## Error Handling

The service provides user-friendly error messages for all HTTP status codes:

| Status Code | Error Message                                           |
|-------------|---------------------------------------------------------|
| 0           | Unable to connect to server                             |
| 401         | Unauthorized. Please log in again.                      |
| 403         | Access forbidden                                        |
| 404         | Trade history endpoint not found                        |
| 422         | Invalid query parameters                                |
| 429         | Too many requests                                       |
| 500+        | Server error. Please try again later.                   |

All errors are automatically logged to the console with detailed information for debugging.

## Testing

The service includes comprehensive unit tests. Run tests with:

```bash
npm test -- trade-history.service.spec.ts
```

## Architecture Decisions

### Why Signals + Observables?

The service provides both Angular signals and RxJS observables for maximum flexibility:

- **Signals**: Recommended for Angular 16+ applications, providing fine-grained reactivity
- **Observables**: Maintain compatibility with existing code and async pipe

### Authentication

JWT tokens are automatically added to all HTTP requests by the `authInterceptor`. The service does not need to manually handle authentication headers.

### Error Handling

Errors are handled at the service level and transformed into user-friendly messages. The service stores the error in state so components can reactively display error messages.

### Caching Strategy

The service caches fetched trades in memory using signals. This provides instant access to previously loaded data without additional HTTP requests. Call `clearTradeHistory()` to invalidate the cache.

## Future Enhancements

Potential improvements for future versions:

1. **Pagination Support**: Add methods for page-based navigation
2. **Persistent Query State**: Remember last query parameters for refresh
3. **Real-time Updates**: WebSocket integration for live trade updates
4. **Export Functionality**: Export trades to CSV or JSON
5. **Advanced Filtering**: More complex filter combinations
6. **Caching Strategy**: Implement time-based cache invalidation

## Support

For issues or questions, please contact the development team or file an issue in the project repository.
