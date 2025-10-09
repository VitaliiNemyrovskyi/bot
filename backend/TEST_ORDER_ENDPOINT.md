# Test Order Endpoint Documentation

## Overview

The `/api/test-order` endpoint provides comprehensive order testing and debugging capabilities for both BingX and Bybit exchanges. It includes detailed request/response logging, parameter validation, and execution timing to help diagnose and debug order placement issues.

## Endpoint

```
POST /api/test-order
```

## Authentication

Requires JWT authentication via Bearer token in the `Authorization` header.

```
Authorization: Bearer <your-jwt-token>
```

## Request Body

```typescript
{
  exchange: 'BINGX' | 'BYBIT',
  credentialId: string,
  order: {
    symbol: string,
    side: 'BUY' | 'SELL',
    positionSide?: 'LONG' | 'SHORT',  // Required for BingX, optional for Bybit
    type: 'MARKET' | 'LIMIT',
    quantity: number,
    price?: number  // Required for LIMIT orders
  },
  testMode?: boolean  // Default: true
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `exchange` | string | Yes | Exchange name: `BINGX` or `BYBIT` |
| `credentialId` | string | Yes | Database ID of the exchange credentials |
| `order.symbol` | string | Yes | Trading pair symbol (e.g., `BTC-USDT` for BingX, `BTCUSDT` for Bybit) |
| `order.side` | string | Yes | Order side: `BUY` or `SELL` |
| `order.positionSide` | string | Conditional | Position side: `LONG` or `SHORT`. Required for BingX. |
| `order.type` | string | Yes | Order type: `MARKET` or `LIMIT` |
| `order.quantity` | number | Yes | Order quantity (will be adjusted per exchange rules) |
| `order.price` | number | Conditional | Order price (required for `LIMIT` orders) |
| `testMode` | boolean | No | If `true`, validates without executing. Default: `true` |

### Test Mode Behavior

- **BingX**: Uses the official `/openApi/swap/v2/trade/order/test` endpoint that validates parameters without executing
- **Bybit**: Validates parameters client-side (Bybit doesn't have a dedicated test endpoint)

## Response Format

```typescript
{
  success: boolean,
  request: {
    method: string,
    endpoint: string,
    params: Record<string, any>,
    queryString: string,
    timestamp: number,
    headers: Record<string, string>
  },
  response: {
    statusCode: number,
    data: any,
    error?: string
  },
  executionTime: number,
  totalTime: number,
  debug: {
    exchange: string,
    environment: string,
    testMode: boolean,
    timeSyncStatus?: {
      offset: number,
      lastSyncTime: number,
      syncAge: number
    },
    quantityAdjustment?: {  // BingX only
      original: number,
      adjusted: number,
      wasAdjusted: boolean,
      rules: {
        precision: number,
        stepSize: number,
        minQuantity: number
      }
    },
    contractRules?: any,  // BingX contract specifications
    instrumentInfo?: any,  // Bybit instrument info
    orderDetails: {
      original: any,
      prepared: any
    }
  },
  timestamp: string
}
```

## Examples

### BingX Market Order (Test Mode)

```bash
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exchange": "BINGX",
    "credentialId": "cred_123...",
    "testMode": true,
    "order": {
      "symbol": "BTC-USDT",
      "side": "BUY",
      "positionSide": "LONG",
      "type": "MARKET",
      "quantity": 0.001
    }
  }'
```

### BingX Limit Order (Real Execution)

```bash
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exchange": "BINGX",
    "credentialId": "cred_123...",
    "testMode": false,
    "order": {
      "symbol": "ETH-USDT",
      "side": "SELL",
      "positionSide": "SHORT",
      "type": "LIMIT",
      "quantity": 0.01,
      "price": 3500
    }
  }'
```

### Bybit Market Order (Test Mode)

```bash
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exchange": "BYBIT",
    "credentialId": "cred_456...",
    "testMode": true,
    "order": {
      "symbol": "BTCUSDT",
      "side": "BUY",
      "type": "MARKET",
      "quantity": 0.001
    }
  }'
```

### Bybit Limit Order (Real Execution)

```bash
curl -X POST http://localhost:3000/api/test-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "exchange": "BYBIT",
    "credentialId": "cred_456...",
    "testMode": false,
    "order": {
      "symbol": "ETHUSDT",
      "side": "SELL",
      "type": "LIMIT",
      "quantity": 0.01,
      "price": 3500
    }
  }'
```

## Using the Test Script

A comprehensive test script is provided to test the endpoint:

```bash
# Set environment variables
export AUTH_TOKEN="your-jwt-token"
export CREDENTIAL_ID="your-credential-id"
export EXCHANGE="BINGX"  # or BYBIT
export API_BASE_URL="http://localhost:3000"  # optional

# Run the test script
npx ts-node test-order-endpoint.ts
```

The test script will:
1. Test market orders in test mode
2. Test limit orders in test mode
3. Display detailed request/response information
4. Show timing metrics and debug information

## Response Details

### Request Object

Contains the actual HTTP request details sent to the exchange API:

- `method`: HTTP method (POST)
- `endpoint`: API endpoint path
- `params`: Request parameters
- `queryString`: URL-encoded query string with signature
- `timestamp`: Synchronized timestamp used in the request
- `headers`: Request headers (API key is masked)

### Response Object

Contains the exchange API response:

- `statusCode`: HTTP status code
- `data`: Response body from the exchange
- `error`: Error message if the request failed

### Debug Object

Comprehensive debugging information:

- `exchange`: Exchange name and environment
- `testMode`: Whether test mode was used
- `timeSyncStatus`: Server time synchronization details
- `quantityAdjustment`: How quantity was adjusted (BingX)
- `contractRules`: Trading rules for the symbol (BingX)
- `instrumentInfo`: Instrument specifications (Bybit)
- `orderDetails`: Original and prepared order parameters

### Timing Metrics

- `executionTime`: Time spent executing the exchange API call
- `totalTime`: Total time from request receipt to response

## Error Handling

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required",
  "timestamp": "2025-10-09T..."
}
```

### 400 Bad Request

```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "exchange, credentialId, and order are required",
  "requiredFields": { ... },
  "timestamp": "2025-10-09T..."
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Credentials not found",
  "message": "No credentials found with ID: cred_123",
  "timestamp": "2025-10-09T..."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Test order failed",
  "message": "Detailed error message...",
  "executionTime": 1234,
  "timestamp": "2025-10-09T..."
}
```

## Debugging Tips

### 1. Check Time Synchronization

The `timeSyncStatus` in the debug section shows the time offset with the exchange server:

```json
{
  "timeSyncStatus": {
    "offset": 123,
    "lastSyncTime": 1728475200000,
    "syncAge": 5000
  }
}
```

- `offset`: Milliseconds difference between local and server time
- Large offsets (>1000ms) can cause signature verification failures

### 2. Verify Quantity Adjustments (BingX)

BingX requires specific quantity precision and step sizes:

```json
{
  "quantityAdjustment": {
    "original": 0.0015,
    "adjusted": 0.001,
    "wasAdjusted": true,
    "rules": {
      "precision": 3,
      "stepSize": 0.001,
      "minQuantity": 0.001
    }
  }
}
```

### 3. Check Request Parameters

The `request.params` and `request.queryString` show exactly what was sent to the exchange:

```json
{
  "request": {
    "params": {
      "symbol": "BTC-USDT",
      "side": "BUY",
      "positionSide": "LONG",
      "type": "MARKET",
      "quantity": 0.001
    },
    "queryString": "symbol=BTC-USDT&side=BUY&..."
  }
}
```

### 4. Compare Original vs Prepared Orders

The `orderDetails` shows how your order was transformed:

```json
{
  "orderDetails": {
    "original": {
      "symbol": "BTC-USDT",
      "side": "BUY",
      "type": "MARKET",
      "quantity": 0.001
    },
    "prepared": {
      "symbol": "BTC-USDT",
      "side": "BUY",
      "positionSide": "LONG",
      "type": "MARKET",
      "quantity": 0.001
    }
  }
}
```

## Best Practices

1. **Always test first**: Use `testMode: true` before executing real orders
2. **Check credentials**: Verify the credential ID belongs to the correct exchange
3. **Validate symbols**: Ensure symbol format matches the exchange (BTC-USDT vs BTCUSDT)
4. **Monitor timing**: Large execution times may indicate network issues
5. **Review logs**: Check server console logs for additional debugging information

## Symbol Format Differences

| Exchange | Symbol Format | Example |
|----------|---------------|---------|
| BingX | Hyphenated | BTC-USDT, ETH-USDT |
| Bybit | No separator | BTCUSDT, ETHUSDT |

## Position Side Requirements

| Exchange | Position Side | Notes |
|----------|---------------|-------|
| BingX | Required | Must specify LONG or SHORT |
| Bybit | Optional | Inferred from hedge mode settings |

## Security Notes

- API keys are masked in logs and responses
- Signatures are calculated server-side and not exposed
- Credentials are decrypted only when needed
- All requests require authentication

## Support

For issues or questions:
1. Check the debug information in the response
2. Review server console logs
3. Verify API credentials are valid
4. Ensure sufficient balance in the exchange account
5. Confirm trading permissions for the API key

## Related Files

- `/backend/src/app/api/test-order/route.ts` - Endpoint implementation
- `/backend/test-order-endpoint.ts` - Test script
- `/backend/src/lib/bingx.ts` - BingX service
- `/backend/src/lib/bybit.ts` - Bybit service
- `/backend/src/lib/exchange-credentials-service.ts` - Credential management
