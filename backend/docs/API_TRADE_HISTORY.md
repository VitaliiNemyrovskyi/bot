# Trade History API Documentation

## Overview

The Trade History API endpoint provides access to closed funding arbitrage positions from the `FundingArbitrageSubscription` table. This endpoint allows users to retrieve their historical trading data for analysis and reporting purposes.

## Endpoint

```
GET /api/arbitrage/trade-history
```

## Authentication

**Required**: Yes (Bearer token)

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|-----------|------|----------|---------|-----|-------------|
| `symbol` | string | Yes | - | - | Trading symbol (e.g., "BTCUSDT", "ETHUSDT") |
| `exchange` | string | Yes | - | - | Primary exchange name (e.g., "BYBIT", "BINGX", "MEXC") |
| `limit` | number | No | 50 | 200 | Maximum number of records to return |

### Parameter Details

- **symbol**: Must match exactly the symbol format used in your positions (case-sensitive)
- **exchange**: Must match the primary exchange where the position was opened
- **limit**: Controls pagination; values > 200 are automatically capped at 200

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "clp1a2b3c4d5e6f7g8h9i0j1",
      "symbol": "BTCUSDT",
      "executedAt": "2025-01-15T16:00:00.000Z",
      "closedAt": "2025-01-15T16:00:05.000Z",
      "positionSizeUsdt": 1000.00,
      "fundingEarned": 10.50,
      "realizedPnl": 8.30,
      "entryPrice": 50000.00,
      "exitPrice": 50005.00,
      "leverage": 10,
      "quantity": 0.02,
      "status": "COMPLETED",
      "margin": 100.00,
      "primaryExchange": "BYBIT",
      "hedgeExchange": "BINGX",
      "mode": "HEDGED",
      "positionType": "long",
      "fundingRate": 0.0001,
      "primaryTradingFees": 1.50,
      "hedgeTradingFees": 1.20,
      "totalFees": 2.70,
      "netPnl": 5.60
    }
  ],
  "count": 1,
  "timestamp": "2025-10-12T00:00:00.000Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique subscription ID |
| `symbol` | string | Trading symbol |
| `executedAt` | string\|null | ISO timestamp when positions were opened |
| `closedAt` | string\|null | ISO timestamp when positions were closed |
| `positionSizeUsdt` | number | Total position size in USDT (margin × leverage) |
| `fundingEarned` | number\|null | Funding payment earned/paid in USDT |
| `realizedPnl` | number\|null | Total realized P&L before fees in USDT |
| `entryPrice` | number\|null | Average entry price for primary position |
| `exitPrice` | number\|null | Exit price for primary position |
| `leverage` | number | Leverage multiplier used |
| `quantity` | number | Position size in base asset |
| `status` | string | Position status: "COMPLETED", "CANCELLED", or "ERROR" |
| `margin` | number\|null | Margin/collateral used in USDT |
| `primaryExchange` | string | Primary exchange name |
| `hedgeExchange` | string\|null | Hedge exchange name (null for NON_HEDGED mode) |
| `mode` | string | Arbitrage mode: "HEDGED" or "NON_HEDGED" |
| `positionType` | string | Position type: "long" or "short" |
| `fundingRate` | number | Funding rate at subscription time |
| `primaryTradingFees` | number\|null | Trading fees on primary exchange |
| `hedgeTradingFees` | number\|null | Trading fees on hedge exchange |
| `totalFees` | number | Combined trading fees |
| `netPnl` | number\|null | Net P&L after fees (realizedPnl - totalFees) |

### Error Responses

#### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required. Please log in.",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-10-12T00:00:00.000Z"
}
```

#### 400 Bad Request - Missing Parameters

```json
{
  "success": false,
  "error": "Missing required parameters",
  "message": "Both symbol and exchange parameters are required",
  "code": "MISSING_PARAMETERS",
  "timestamp": "2025-10-12T00:00:00.000Z"
}
```

#### 400 Bad Request - Invalid Limit

```json
{
  "success": false,
  "error": "Invalid limit",
  "message": "Limit must be a positive integer",
  "code": "INVALID_LIMIT",
  "timestamp": "2025-10-12T00:00:00.000Z"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to retrieve trade history",
  "message": "Database connection error",
  "code": "INTERNAL_ERROR",
  "timestamp": "2025-10-12T00:00:00.000Z"
}
```

## Usage Examples

### JavaScript/TypeScript (Fetch API)

```typescript
async function getTradeHistory(
  token: string,
  symbol: string,
  exchange: string,
  limit: number = 50
) {
  const url = new URL('/api/arbitrage/trade-history', 'http://localhost:3000');
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('exchange', exchange);
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usage
try {
  const history = await getTradeHistory(
    'your_jwt_token',
    'BTCUSDT',
    'BYBIT',
    100
  );
  console.log(`Found ${history.count} trades`);
  history.data.forEach(trade => {
    console.log(`Trade ${trade.id}: ${trade.netPnl} USDT profit`);
  });
} catch (error) {
  console.error('Failed to fetch trade history:', error);
}
```

### cURL

```bash
# Basic request
curl -X GET \
  'http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT' \
  -H 'Authorization: Bearer your_jwt_token'

# With limit parameter
curl -X GET \
  'http://localhost:3000/api/arbitrage/trade-history?symbol=ETHUSDT&exchange=BINGX&limit=100' \
  -H 'Authorization: Bearer your_jwt_token'
```

### Python (requests)

```python
import requests

def get_trade_history(token, symbol, exchange, limit=50):
    url = 'http://localhost:3000/api/arbitrage/trade-history'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    params = {
        'symbol': symbol,
        'exchange': exchange,
        'limit': limit
    }

    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

# Usage
try:
    history = get_trade_history(
        token='your_jwt_token',
        symbol='BTCUSDT',
        exchange='BYBIT',
        limit=100
    )
    print(f"Found {history['count']} trades")
    for trade in history['data']:
        print(f"Trade {trade['id']}: {trade['netPnl']} USDT profit")
except requests.exceptions.HTTPError as e:
    print(f"Failed to fetch trade history: {e}")
```

## Filtering and Sorting

### Automatic Filtering

The endpoint automatically filters results to include only:
- Positions belonging to the authenticated user
- Closed positions (status: COMPLETED, CANCELLED, or ERROR)
- Positions with non-null `closedAt` timestamp
- Positions matching the specified symbol and exchange

### Sorting

Results are automatically sorted by `closedAt` in descending order (most recent first).

## Performance Considerations

1. **Limit Parameter**: Use appropriate limit values to avoid retrieving too much data at once
2. **Database Indexes**: The following indexes optimize query performance:
   - `userId`
   - `symbol`
   - `primaryExchange`
   - `closedAt`
   - `userId + closedAt` (composite)

3. **Response Size**: With default limit of 50, typical response size is ~20-30 KB

## Business Logic

### Position Size Calculation

The `positionSizeUsdt` field is calculated as follows:

1. **If margin is available**: `margin × leverage`
2. **Fallback**: `quantity × entryPrice`

This ensures accurate position sizing even for older records that might not have margin data.

### Fee Calculation

- `totalFees` = `primaryTradingFees` + `hedgeTradingFees`
- Null fees are treated as 0

### Net P&L Calculation

- `netPnl` = `realizedPnl` - `totalFees`
- Returns null if `realizedPnl` is null

## Common Use Cases

### 1. Performance Analysis

Retrieve all trades for a specific symbol to analyze profitability:

```typescript
const history = await getTradeHistory(token, 'BTCUSDT', 'BYBIT', 200);
const totalPnl = history.data.reduce((sum, trade) => sum + (trade.netPnl || 0), 0);
const avgPnl = totalPnl / history.count;
console.log(`Average P&L per trade: ${avgPnl.toFixed(2)} USDT`);
```

### 2. Fee Analysis

Calculate total fees paid on an exchange:

```typescript
const history = await getTradeHistory(token, 'ETHUSDT', 'BYBIT', 200);
const totalFees = history.data.reduce((sum, trade) => sum + trade.totalFees, 0);
console.log(`Total fees paid: ${totalFees.toFixed(2)} USDT`);
```

### 3. Win Rate Calculation

Determine the percentage of profitable trades:

```typescript
const history = await getTradeHistory(token, 'BTCUSDT', 'BYBIT', 200);
const profitable = history.data.filter(trade => (trade.netPnl || 0) > 0).length;
const winRate = (profitable / history.count) * 100;
console.log(`Win rate: ${winRate.toFixed(1)}%`);
```

## Integration Notes

### Frontend Integration

When integrating with frontend applications:

1. **Loading States**: Display loading indicators while fetching
2. **Error Handling**: Show user-friendly error messages
3. **Pagination**: Implement "Load More" functionality using the limit parameter
4. **Caching**: Cache results to reduce API calls
5. **Real-time Updates**: Refresh periodically or on user action

### Rate Limiting

While not currently enforced, consider implementing:
- Debouncing for search inputs
- Caching strategies
- Batch requests when possible

## Testing

Unit tests are available at:
```
/backend/src/app/api/arbitrage/trade-history/__tests__/route.test.ts
```

Run tests with:
```bash
npm test -- src/app/api/arbitrage/trade-history/__tests__/route.test.ts
```

## Security Considerations

1. **Authentication**: Always required - no public access
2. **Authorization**: Users can only access their own trade history
3. **Data Isolation**: User ID is enforced in database queries
4. **Input Validation**: All parameters are validated before database queries
5. **SQL Injection Prevention**: Prisma ORM provides automatic protection

## Troubleshooting

### Empty Results

If you receive an empty array:
- Verify the symbol and exchange names are correct (case-sensitive)
- Ensure you have closed positions matching the criteria
- Check that positions have non-null `closedAt` timestamps

### Null Fields

Some fields may be null in certain scenarios:
- `executedAt`: Position never successfully opened
- `realizedPnl`: Position closed with errors
- `exitPrice`: Position didn't complete closing process
- `margin`: Older records before margin tracking was added

### Performance Issues

If queries are slow:
- Reduce the limit parameter
- Ensure database indexes are present
- Check database connection pool settings
- Consider implementing caching

## Future Enhancements

Potential improvements for future versions:

1. **Additional Filters**:
   - Date range filtering (startDate, endDate)
   - Status filtering
   - Minimum P&L threshold

2. **Sorting Options**:
   - Sort by P&L, fees, or funding earned
   - Ascending/descending order control

3. **Aggregations**:
   - Total P&L summary
   - Average trade metrics
   - Win/loss statistics

4. **Export Functionality**:
   - CSV export
   - PDF reports
   - Excel format

## Related Endpoints

- `GET /api/arbitrage/positions` - Active price arbitrage positions
- `GET /api/arbitrage/opportunities` - Current arbitrage opportunities
- `GET /api/arbitrage/funding-rates` - Real-time funding rates

## Support

For issues or questions:
1. Check the error response for specific error codes
2. Review the logs for detailed error messages
3. Verify authentication token is valid
4. Ensure database is accessible
