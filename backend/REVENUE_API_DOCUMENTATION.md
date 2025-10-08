# Funding Arbitrage Revenue API Documentation

## Overview

The Revenue API provides comprehensive statistics and reporting for funding arbitrage deals. It includes detailed metrics, aggregations, and analytics to track trading performance.

## Endpoint

```
GET /api/funding-arbitrage/revenue
```

## Authentication

Requires authentication via session token in cookies or Authorization header.

## Query Parameters

All parameters are optional:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `startDate` | ISO Date String | 30 days ago | Start of date range for filtering deals |
| `endDate` | ISO Date String | Now | End of date range for filtering deals |
| `exchange` | String | null | Filter by primary exchange (case-insensitive) |
| `symbol` | String | null | Filter by specific trading symbol |

## Response Structure

### Success Response (200 OK)

```typescript
{
  success: true,
  data: {
    summary: {
      totalDeals: number,           // Total completed deals in period
      totalRevenue: number,          // Sum of all realizedPnl (USDT)
      totalFundingEarned: number,    // Sum of all funding payments (USDT)
      totalTradingPnl: number,       // Trading P&L = revenue - funding (USDT)
      avgRevenuePerDeal: number,     // Average revenue per deal (USDT)
      winRate: number,               // Percentage of profitable deals (0-100)
      profitableDeals: number,       // Count of deals with positive P&L
      losingDeals: number,           // Count of deals with negative P&L
      bestDeal: {                    // Most profitable deal
        symbol: string,
        revenue: number,
        date: string (ISO)
      } | null,
      worstDeal: {                   // Least profitable deal
        symbol: string,
        revenue: number,
        date: string (ISO)
      } | null
    },
    bySymbol: [                      // Revenue grouped by symbol
      {
        symbol: string,
        deals: number,
        revenue: number,
        avgRevenue: number,
        fundingEarned: number
      }
    ],
    byExchange: [                    // Revenue grouped by exchange
      {
        exchange: string,
        deals: number,
        revenue: number,
        avgRevenue: number
      }
    ],
    deals: [                         // Individual completed deals
      {
        id: string,
        symbol: string,
        primaryExchange: string,
        hedgeExchange: string,
        fundingRate: number,
        positionType: "long" | "short",
        quantity: number,
        entryPrice: number | null,
        hedgeEntryPrice: number | null,
        primaryExitPrice: number | null,
        hedgeExitPrice: number | null,
        fundingEarned: number | null,
        realizedPnl: number | null,
        primaryTradingFees: number | null,
        hedgeTradingFees: number | null,
        executedAt: string (ISO) | null,
        closedAt: string (ISO) | null,
        duration: number | null      // Duration in seconds
      }
    ],
    timeline: [                      // Daily revenue aggregation
      {
        date: string (YYYY-MM-DD),
        deals: number,
        revenue: number,
        fundingEarned: number
      }
    ]
  },
  filters: {
    startDate: string (ISO),
    endDate: string (ISO),
    exchange: string | null,
    symbol: string | null
  },
  timestamp: string (ISO)
}
```

### Error Response (4xx/5xx)

```typescript
{
  success: false,
  error: string,
  message: string,
  timestamp: string (ISO)
}
```

## Example Requests

### 1. Get All Revenue Data (Last 30 Days)

```bash
curl -X GET "http://localhost:3000/api/funding-arbitrage/revenue" \
  -H "Cookie: session=your_session_token"
```

### 2. Get Revenue for Specific Date Range

```bash
curl -X GET "http://localhost:3000/api/funding-arbitrage/revenue?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z" \
  -H "Cookie: session=your_session_token"
```

### 3. Filter by Symbol

```bash
curl -X GET "http://localhost:3000/api/funding-arbitrage/revenue?symbol=BTCUSDT" \
  -H "Cookie: session=your_session_token"
```

### 4. Filter by Exchange

```bash
curl -X GET "http://localhost:3000/api/funding-arbitrage/revenue?exchange=BYBIT" \
  -H "Cookie: session=your_session_token"
```

### 5. Combined Filters

```bash
curl -X GET "http://localhost:3000/api/funding-arbitrage/revenue?startDate=2025-01-01T00:00:00Z&symbol=BTCUSDT&exchange=BYBIT" \
  -H "Cookie: session=your_session_token"
```

## Example Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDeals": 15,
      "totalRevenue": 125.45,
      "totalFundingEarned": 142.30,
      "totalTradingPnl": -16.85,
      "avgRevenuePerDeal": 8.36,
      "winRate": 86.67,
      "profitableDeals": 13,
      "losingDeals": 2,
      "bestDeal": {
        "symbol": "BTCUSDT",
        "revenue": 24.50,
        "date": "2025-01-15T08:30:00.000Z"
      },
      "worstDeal": {
        "symbol": "ETHUSDT",
        "revenue": -5.20,
        "date": "2025-01-20T16:45:00.000Z"
      }
    },
    "bySymbol": [
      {
        "symbol": "BTCUSDT",
        "deals": 8,
        "revenue": 82.30,
        "avgRevenue": 10.29,
        "fundingEarned": 90.50
      },
      {
        "symbol": "ETHUSDT",
        "deals": 7,
        "revenue": 43.15,
        "avgRevenue": 6.16,
        "fundingEarned": 51.80
      }
    ],
    "byExchange": [
      {
        "exchange": "BYBIT_TESTNET",
        "deals": 15,
        "revenue": 125.45,
        "avgRevenue": 8.36
      }
    ],
    "deals": [
      {
        "id": "clx123abc",
        "symbol": "BTCUSDT",
        "primaryExchange": "BYBIT_TESTNET",
        "hedgeExchange": "MOCK",
        "fundingRate": -0.0001,
        "positionType": "long",
        "quantity": 0.01,
        "entryPrice": 45000.50,
        "hedgeEntryPrice": 45001.00,
        "primaryExitPrice": 45002.00,
        "hedgeExitPrice": 45001.50,
        "fundingEarned": 4.50,
        "realizedPnl": 4.35,
        "primaryTradingFees": 0.10,
        "hedgeTradingFees": 0.05,
        "executedAt": "2025-01-15T08:00:00.000Z",
        "closedAt": "2025-01-15T08:30:00.000Z",
        "duration": 1800
      }
    ],
    "timeline": [
      {
        "date": "2025-01-15",
        "deals": 3,
        "revenue": 28.50,
        "fundingEarned": 32.10
      },
      {
        "date": "2025-01-16",
        "deals": 5,
        "revenue": 42.30,
        "fundingEarned": 48.20
      }
    ]
  },
  "filters": {
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-01-31T23:59:59.999Z",
    "exchange": null,
    "symbol": null
  },
  "timestamp": "2025-01-31T12:00:00.000Z"
}
```

## Metrics Explanation

### Revenue Calculation

The revenue system tracks comprehensive P&L metrics:

1. **Funding Earned**: Payment received from holding the position through funding time
   - Formula: `fundingRate × quantity × entryPrice`

2. **Trading P&L**: Profit/loss from price movements during the arbitrage
   - Primary P&L: `(exitPrice - entryPrice) × quantity` (for long positions)
   - Hedge P&L: `(hedgeEntryPrice - hedgeExitPrice) × quantity` (opposite of primary)

3. **Trading Fees**: Total fees paid for entering and exiting positions
   - Estimated at 0.055% (Bybit taker fee) and 0.05% (BingX taker fee)
   - Includes both entry and exit fees

4. **Realized P&L**: Final net profit/loss
   - Formula: `fundingEarned + primaryPnL + hedgePnL - fees`

### Win Rate

Percentage of deals that resulted in positive realized P&L:
```
winRate = (profitableDeals / totalDeals) × 100
```

### Average Revenue Per Deal

Mean realized P&L across all completed deals:
```
avgRevenuePerDeal = totalRevenue / totalDeals
```

## Database Schema Changes

The following fields were added to `FundingArbitrageSubscription`:

```prisma
model FundingArbitrageSubscription {
  // ... existing fields ...

  // Exit prices (filled when positions are closed)
  primaryExitPrice   Float? // Exit price for primary position
  hedgeExitPrice     Float? // Exit price for hedge position

  // Trading fees
  primaryTradingFees Float? // Trading fees for primary position (entry + exit)
  hedgeTradingFees   Float? // Trading fees for hedge position (entry + exit)

  // ... indexes ...
  @@index([closedAt])
  @@index([userId, closedAt])
  @@index([symbol])
  @@index([primaryExchange])
}
```

## Performance Considerations

1. **Indexes**: The API benefits from database indexes on:
   - `closedAt` - for date range filtering
   - `userId, closedAt` - for user-specific queries
   - `symbol` - for symbol filtering
   - `primaryExchange` - for exchange filtering

2. **Caching**: For production use, consider implementing:
   - Redis caching for frequently accessed date ranges
   - Cache invalidation on new completed deals
   - Cache TTL of 5-10 minutes for real-time data

3. **Pagination**: For users with many deals, consider adding:
   - `limit` and `offset` parameters
   - Cursor-based pagination for large datasets

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Unauthorized | Missing or invalid authentication |
| 400 | Invalid date format | startDate or endDate not valid ISO strings |
| 400 | Invalid date range | startDate is after endDate |
| 500 | Failed to fetch revenue data | Server error during data retrieval |

## Testing

### Manual Testing

1. Create some test deals in the database
2. Use curl or Postman to test the endpoint
3. Verify all metrics calculate correctly

### Automated Testing

Example test script:

```typescript
// tests/api/funding-arbitrage/revenue.test.ts
import { describe, it, expect } from '@jest/globals';

describe('GET /api/funding-arbitrage/revenue', () => {
  it('should return revenue statistics', async () => {
    const response = await fetch('/api/funding-arbitrage/revenue', {
      headers: { Cookie: 'session=test_token' }
    });

    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('summary');
    expect(data.data).toHaveProperty('bySymbol');
    expect(data.data).toHaveProperty('byExchange');
    expect(data.data).toHaveProperty('deals');
    expect(data.data).toHaveProperty('timeline');
  });
});
```

## Future Enhancements

Potential improvements for the revenue API:

1. **Export Functionality**: CSV/Excel export of revenue data
2. **Advanced Filters**: Filter by date ranges, P&L thresholds, win/loss
3. **Comparative Analytics**: Period-over-period comparisons
4. **Performance Metrics**: Sharpe ratio, max drawdown, profit factor
5. **Real-time Updates**: WebSocket support for live revenue tracking
6. **Charts Data**: Pre-aggregated data for charting libraries
7. **Tax Reporting**: Generate tax documents for trading activities
