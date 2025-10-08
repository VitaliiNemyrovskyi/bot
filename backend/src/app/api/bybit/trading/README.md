# Bybit Trading API Documentation

Comprehensive API endpoints for manual cryptocurrency trading operations on Bybit exchange.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Orders](#orders)
  - [Positions](#positions)
- [Request/Response Format](#requestresponse-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The JWT token contains:
- `userId`: User's unique identifier
- `email`: User's email address
- `role`: User's role (ADMIN, ENTERPRISE, PREMIUM, BASIC)

---

## Base URL

```
http://localhost:3000/api/bybit/trading
```

For production:
```
https://your-domain.com/api/bybit/trading
```

---

## Endpoints

### Orders

#### 1. Place Order

Place a new trading order (Market or Limit) on Bybit.

**Endpoint:** `POST /api/bybit/trading/orders`

**Request Body:**

```json
{
  "credentialId": "clx123abc...",
  "category": "linear",
  "symbol": "BTCUSDT",
  "side": "Buy",
  "orderType": "Limit",
  "qty": "0.01",
  "price": "50000.00",
  "timeInForce": "GTC",
  "takeProfit": "55000.00",
  "stopLoss": "48000.00"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Exchange credential ID from database |
| category | string | Yes | Trading category: `linear` or `spot` |
| symbol | string | Yes | Trading pair symbol (e.g., "BTCUSDT") |
| side | string | Yes | Order side: `Buy` or `Sell` |
| orderType | string | Yes | Order type: `Market` or `Limit` |
| qty | string | Yes | Order quantity (as string for precision) |
| price | string | Conditional | Required for `Limit` orders |
| timeInForce | string | No | Time in force: `GTC`, `IOC`, or `FOK` (default: GTC) |
| takeProfit | string | No | Take profit price |
| stopLoss | string | No | Stop loss price |
| tpTriggerBy | string | No | Take profit trigger type |
| slTriggerBy | string | No | Stop loss trigger type |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "orderId": "1234567890",
    "orderLinkId": "link_abc123",
    "symbol": "BTCUSDT",
    "side": "Buy",
    "orderType": "Limit",
    "qty": "0.01",
    "price": "50000.00",
    "category": "linear"
  },
  "message": "Order placed successfully",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_abc123"
}
```

**Error Responses:**

- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Validation errors or invalid parameters
- `403 Forbidden`: Credential not found or access denied
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

#### 2. Get Order History

Retrieve order history with optional filtering.

**Endpoint:** `GET /api/bybit/trading/orders`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Exchange credential ID |
| category | string | No | Trading category (default: `linear`) |
| symbol | string | No | Filter by trading pair |
| orderStatus | string | No | Filter by status (e.g., "Filled", "Cancelled") |
| limit | number | No | Max results (default: 50, max: 200) |

**Example Request:**

```
GET /api/bybit/trading/orders?credentialId=clx123abc...&category=linear&symbol=BTCUSDT&limit=100
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "orderId": "1234567890",
        "orderLinkId": "link_abc123",
        "symbol": "BTCUSDT",
        "side": "Buy",
        "orderType": "Limit",
        "qty": "0.01",
        "price": "50000.00",
        "orderStatus": "Filled",
        "timeInForce": "GTC",
        "createdTime": "1727954400000",
        "updatedTime": "1727954500000",
        "avgPrice": "50050.00",
        "cumExecQty": "0.01",
        "cumExecValue": "500.50",
        "cumExecFee": "0.25"
      }
    ],
    "total": 1
  },
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_xyz789"
}
```

---

#### 3. Cancel Order

Cancel an existing order by order ID.

**Endpoint:** `DELETE /api/bybit/trading/orders/:orderId`

**Path Parameters:**

- `orderId`: Order ID to cancel

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Exchange credential ID |
| category | string | Yes | Trading category: `linear` or `spot` |
| symbol | string | Yes | Trading pair symbol |

**Example Request:**

```
DELETE /api/bybit/trading/orders/1234567890?credentialId=clx123abc...&category=linear&symbol=BTCUSDT
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "orderId": "1234567890",
    "symbol": "BTCUSDT",
    "category": "linear"
  },
  "message": "Order cancelled successfully",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_def456"
}
```

**Error Responses:**

- `404 Not Found`: Order not found or already cancelled

---

### Positions

#### 4. Get Open Positions

Retrieve all open positions for the authenticated user.

**Endpoint:** `GET /api/bybit/trading/positions`

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Exchange credential ID |
| category | string | No | Trading category (default: `linear`) |
| symbol | string | No | Filter by specific trading pair |

**Example Request:**

```
GET /api/bybit/trading/positions?credentialId=clx123abc...&category=linear
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "positions": [
      {
        "symbol": "BTCUSDT",
        "side": "Buy",
        "size": "0.1",
        "positionValue": "5000.00",
        "entryPrice": "50000.00",
        "markPrice": "51000.00",
        "liqPrice": "45000.00",
        "unrealisedPnl": "100.00",
        "cumRealisedPnl": "500.00",
        "takeProfit": "55000.00",
        "stopLoss": "48000.00",
        "createdTime": "1727954400000",
        "updatedTime": "1727954500000"
      }
    ],
    "totalUnrealizedPnl": "100.00000000",
    "category": "linear"
  },
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_ghi789"
}
```

---

#### 5. Close Position

Close a single position (fully or partially).

**Endpoint:** `POST /api/bybit/trading/positions/close`

**Request Body:**

```json
{
  "credentialId": "clx123abc...",
  "category": "linear",
  "symbol": "BTCUSDT",
  "side": "Buy",
  "qty": "0.05"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Exchange credential ID |
| category | string | Yes | Trading category: `linear` or `spot` |
| symbol | string | Yes | Trading pair symbol |
| side | string | Yes | Position side: `Buy` or `Sell` |
| qty | string | No | Quantity to close (omit for full close) |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "orderId": "9876543210",
    "symbol": "BTCUSDT",
    "side": "Buy",
    "qty": "0.05",
    "category": "linear"
  },
  "message": "Position partially closed (0.05)",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_jkl012"
}
```

**Error Responses:**

- `404 Not Found`: Position not found

---

#### 6. Close All Positions

Close all open positions for a specific category.

**Endpoint:** `POST /api/bybit/trading/positions/close-all`

**Request Body:**

```json
{
  "credentialId": "clx123abc...",
  "category": "linear"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Exchange credential ID |
| category | string | Yes | Trading category: `linear` or `spot` |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "closedCount": 3,
    "orders": [
      {
        "symbol": "BTCUSDT",
        "orderId": "1111111111",
        "side": "Buy",
        "qty": "0.1"
      },
      {
        "symbol": "ETHUSDT",
        "orderId": "2222222222",
        "side": "Sell",
        "qty": "1.5"
      },
      {
        "symbol": "SOLUSDT",
        "orderId": "3333333333",
        "side": "Buy",
        "qty": "10.0"
      }
    ],
    "category": "linear"
  },
  "message": "All 3 positions closed successfully",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_mno345"
}
```

**Partial Success Response (207 Multi-Status):**

When some positions close successfully and others fail:

```json
{
  "success": true,
  "data": {
    "closedCount": 2,
    "failedCount": 1,
    "orders": [
      {
        "symbol": "BTCUSDT",
        "orderId": "1111111111",
        "side": "Buy",
        "qty": "0.1",
        "success": true
      },
      {
        "symbol": "ETHUSDT",
        "orderId": "2222222222",
        "side": "Sell",
        "qty": "1.5",
        "success": true
      },
      {
        "symbol": "SOLUSDT",
        "orderId": "",
        "side": "Buy",
        "qty": "10.0",
        "success": false,
        "error": "Insufficient balance"
      }
    ],
    "category": "linear"
  },
  "message": "Closed 2 of 3 positions. 1 failed.",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_pqr678"
}
```

**Error Responses:**

- `404 Not Found`: No open positions to close

---

## Request/Response Format

### Standard Success Response

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Optional success message",
  "timestamp": "ISO-8601 timestamp",
  "requestId": "Unique request identifier"
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "ISO-8601 timestamp",
  "requestId": "Unique request identifier"
}
```

---

## Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_REQUIRED | 401 | Missing or invalid JWT token |
| VALIDATION_ERROR | 400 | Request validation failed |
| CREDENTIAL_NOT_FOUND | 403 | Credential not found or access denied |
| INVALID_JSON | 400 | Malformed JSON in request body |
| MISSING_CREDENTIAL_ID | 400 | credentialId parameter missing |
| INVALID_CATEGORY | 400 | Invalid trading category |
| INVALID_SYMBOL | 400 | Invalid trading pair symbol |
| ORDER_NOT_FOUND | 404 | Order not found or cancelled |
| POSITION_NOT_FOUND | 404 | Position not found |
| NO_POSITIONS | 404 | No open positions to close |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INSUFFICIENT_BALANCE | 400 | Insufficient balance for order |
| BYBIT_API_ERROR | 400 | Bybit API returned an error |
| CLIENT_INIT_ERROR | 500 | Failed to initialize trading client |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Error Response Examples

**Validation Error:**

```json
{
  "success": false,
  "error": "Validation failed: qty must be a positive number, price is required for Limit orders",
  "code": "VALIDATION_ERROR",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_err001"
}
```

**Authentication Error:**

```json
{
  "success": false,
  "error": "Unauthorized",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_err002"
}
```

**Insufficient Balance:**

```json
{
  "success": false,
  "error": "Insufficient balance to execute this order",
  "code": "INSUFFICIENT_BALANCE",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_err003"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **User Level:** Maximum requests per user
- **Bybit Level:** Respects Bybit's rate limits (handled by client)

When rate limited, you'll receive:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "requestId": "req_1727954400000_err004"
}
```

**HTTP Status:** `429 Too Many Requests`

**Best Practices:**
- Implement exponential backoff when rate limited
- Cache credential information
- Batch operations when possible

---

## Examples

### Example: Place a Market Order (JavaScript/TypeScript)

```typescript
const placeMarketOrder = async (token: string, credentialId: string) => {
  const response = await fetch('http://localhost:3000/api/bybit/trading/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credentialId,
      category: 'linear',
      symbol: 'BTCUSDT',
      side: 'Buy',
      orderType: 'Market',
      qty: '0.01'
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('Order placed:', data.data.orderId);
  } else {
    console.error('Error:', data.error);
  }
};
```

### Example: Place a Limit Order with TP/SL (JavaScript/TypeScript)

```typescript
const placeLimitOrderWithTPSL = async (token: string, credentialId: string) => {
  const response = await fetch('http://localhost:3000/api/bybit/trading/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credentialId,
      category: 'linear',
      symbol: 'BTCUSDT',
      side: 'Buy',
      orderType: 'Limit',
      qty: '0.01',
      price: '50000.00',
      timeInForce: 'GTC',
      takeProfit: '55000.00',
      stopLoss: '48000.00'
    })
  });

  const data = await response.json();
  return data;
};
```

### Example: Get All Positions (JavaScript/TypeScript)

```typescript
const getPositions = async (token: string, credentialId: string) => {
  const url = new URL('http://localhost:3000/api/bybit/trading/positions');
  url.searchParams.append('credentialId', credentialId);
  url.searchParams.append('category', 'linear');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (data.success) {
    console.log('Positions:', data.data.positions);
    console.log('Total P&L:', data.data.totalUnrealizedPnl);
  }

  return data;
};
```

### Example: Close All Positions (JavaScript/TypeScript)

```typescript
const closeAllPositions = async (token: string, credentialId: string) => {
  const response = await fetch('http://localhost:3000/api/bybit/trading/positions/close-all', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      credentialId,
      category: 'linear'
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log(`Closed ${data.data.closedCount} positions`);
    data.data.orders.forEach(order => {
      console.log(`- ${order.symbol}: ${order.orderId}`);
    });
  }

  return data;
};
```

### Example: Cancel an Order (JavaScript/TypeScript)

```typescript
const cancelOrder = async (token: string, credentialId: string, orderId: string) => {
  const url = new URL(`http://localhost:3000/api/bybit/trading/orders/${orderId}`);
  url.searchParams.append('credentialId', credentialId);
  url.searchParams.append('category', 'linear');
  url.searchParams.append('symbol', 'BTCUSDT');

  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();
  return data;
};
```

### Example: Python Client

```python
import requests

class BybitTradingClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def place_order(self, credential_id: str, symbol: str, side: str,
                   qty: str, order_type: str = 'Market', price: str = None):
        payload = {
            'credentialId': credential_id,
            'category': 'linear',
            'symbol': symbol,
            'side': side,
            'orderType': order_type,
            'qty': qty
        }

        if price and order_type == 'Limit':
            payload['price'] = price
            payload['timeInForce'] = 'GTC'

        response = requests.post(
            f'{self.base_url}/api/bybit/trading/orders',
            headers=self.headers,
            json=payload
        )

        return response.json()

    def get_positions(self, credential_id: str, category: str = 'linear'):
        params = {
            'credentialId': credential_id,
            'category': category
        }

        response = requests.get(
            f'{self.base_url}/api/bybit/trading/positions',
            headers=self.headers,
            params=params
        )

        return response.json()

# Usage
client = BybitTradingClient('http://localhost:3000', 'your_jwt_token')
result = client.place_order('clx123abc...', 'BTCUSDT', 'Buy', '0.01')
print(result)
```

---

## Security Considerations

1. **JWT Token Security:**
   - Tokens are validated on every request
   - Tokens contain user identity and role
   - Expired tokens are automatically rejected

2. **Credential Ownership:**
   - Users can only trade with their own credentials
   - Credential ownership is verified on every request

3. **API Key Security:**
   - API keys are stored encrypted in the database
   - Keys are decrypted only when needed for trading
   - Keys are never exposed in API responses

4. **Audit Logging:**
   - All trading operations are logged
   - Logs include user ID, operation type, and timestamp
   - Failed operations are logged with error details

5. **Rate Limiting:**
   - Prevents abuse and protects against DDoS
   - Respects Bybit's rate limits

---

## Support

For issues or questions:
- Check error messages and codes
- Review request/response examples
- Verify authentication and credentials
- Ensure valid trading parameters

---

**Last Updated:** 2025-10-03
**API Version:** 1.0.0
