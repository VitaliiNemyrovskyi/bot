# Bybit User Information API Endpoints

## Overview

This document describes the Bybit user information API endpoints implemented in the trading bot backend. These endpoints allow authenticated users to fetch their Bybit account information, wallet balance, and open positions.

## Base URL

Development: `http://localhost:3000/api/bybit`
Production: `https://your-domain.com/api/bybit`

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header.

```
Authorization: Bearer <your-jwt-token>
```

## Common Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-01T12:00:00.000Z"
}
```

### Common Error Codes

- `AUTH_REQUIRED` (401): Missing or invalid authentication token
- `NO_API_KEYS` (403): User hasn't configured Bybit API keys
- `BYBIT_API_ERROR` (400): Error from Bybit API
- `INTERNAL_ERROR` (500): Server-side error

---

## Endpoints

### 1. Get User Account Information

Retrieves authenticated user's Bybit account information including API key details, VIP level, and account status.

**Endpoint:** `GET /api/bybit/user/info`

**Authentication:** Required

**Query Parameters:** None

**Request Example:**

```bash
curl -X GET "http://localhost:3000/api/bybit/user/info" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "userId": "123456",
    "uuid": "unique-user-id",
    "username": "user@example.com",
    "memberType": 1,
    "status": 1,
    "vipLevel": "VIP 0",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Bybit user ID |
| `uuid` | string | Unique identifier |
| `username` | string | User's email address |
| `memberType` | number | Member type (1: personal, 2: third-party app) |
| `status` | number | Account status (0: read-only, 1: read-write) |
| `vipLevel` | string | VIP level of the account |
| `createdAt` | string | Account creation timestamp |

**Error Responses:**

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: No Bybit API keys configured
- `500 Internal Server Error`: Server error

---

### 2. Get Wallet Balance

Retrieves authenticated user's Bybit wallet balance across different account types and coins.

**Endpoint:** `GET /api/bybit/user/balance`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `accountType` | string | No | UNIFIED | Account type: UNIFIED, CONTRACT, or SPOT |
| `coin` | string | No | - | Filter by specific coin (e.g., BTC, ETH) |

**Request Examples:**

```bash
# Get unified account balance
curl -X GET "http://localhost:3000/api/bybit/user/balance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get balance for specific account type
curl -X GET "http://localhost:3000/api/bybit/user/balance?accountType=SPOT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get balance for specific coin
curl -X GET "http://localhost:3000/api/bybit/user/balance?coin=BTC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accountType": "UNIFIED",
    "totalEquity": "10000.50",
    "totalWalletBalance": "9500.00",
    "totalAvailableBalance": "8000.00",
    "totalPerpUPL": "500.50",
    "coins": [
      {
        "coin": "BTC",
        "equity": "0.25",
        "usdValue": "12500.00",
        "walletBalance": "0.25",
        "availableToWithdraw": "0.20",
        "unrealisedPnl": "250.00",
        "cumRealisedPnl": "1500.00"
      },
      {
        "coin": "USDT",
        "equity": "5000.00",
        "usdValue": "5000.00",
        "walletBalance": "5000.00",
        "availableToWithdraw": "4500.00",
        "unrealisedPnl": "0.00",
        "cumRealisedPnl": "500.00"
      }
    ]
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `accountType` | string | Account type (UNIFIED, CONTRACT, SPOT) |
| `totalEquity` | string | Total equity in USD |
| `totalWalletBalance` | string | Total wallet balance in USD |
| `totalAvailableBalance` | string | Total available balance in USD |
| `totalPerpUPL` | string | Total unrealized PnL from perpetual contracts |
| `coins` | array | Array of coin balance objects |

**Coin Balance Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `coin` | string | Coin symbol (e.g., BTC, ETH, USDT) |
| `equity` | string | Total equity for this coin |
| `usdValue` | string | USD value of the coin holdings |
| `walletBalance` | string | Wallet balance for this coin |
| `availableToWithdraw` | string | Amount available to withdraw |
| `unrealisedPnl` | string | Unrealized profit/loss |
| `cumRealisedPnl` | string | Cumulative realized profit/loss |

**Error Responses:**

- `400 Bad Request`: Invalid accountType parameter
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: No Bybit API keys configured
- `404 Not Found`: No balance data available
- `500 Internal Server Error`: Server error

---

### 3. Get Open Positions

Retrieves authenticated user's open positions on Bybit.

**Endpoint:** `GET /api/bybit/user/positions`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | linear | Category: linear, spot, or option |
| `symbol` | string | No | - | Filter by specific trading pair (e.g., BTCUSDT) |
| `settleCoin` | string | No | - | Filter by settlement coin |
| `limit` | number | No | - | Maximum number of positions to return (1-200) |

**Request Examples:**

```bash
# Get all linear positions
curl -X GET "http://localhost:3000/api/bybit/user/positions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get positions for specific symbol
curl -X GET "http://localhost:3000/api/bybit/user/positions?symbol=BTCUSDT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get spot positions with limit
curl -X GET "http://localhost:3000/api/bybit/user/positions?category=spot&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "category": "linear",
    "positions": [
      {
        "symbol": "BTCUSDT",
        "side": "Buy",
        "size": "0.1",
        "positionValue": "5000.00",
        "entryPrice": "50000.00",
        "markPrice": "51000.00",
        "unrealisedPnl": "100.00",
        "cumRealisedPnl": "500.00",
        "leverage": "10",
        "liqPrice": "45000.00",
        "takeProfit": "55000.00",
        "stopLoss": "48000.00",
        "createdTime": "1704067200000",
        "updatedTime": "1704153600000"
      }
    ],
    "totalPositions": 1
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Position category (linear, spot, option) |
| `positions` | array | Array of position objects |
| `totalPositions` | number | Total number of positions returned |

**Position Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | string | Trading pair symbol |
| `side` | string | Position side (Buy, Sell) |
| `size` | string | Position size |
| `positionValue` | string | Position value in USD |
| `entryPrice` | string | Average entry price |
| `markPrice` | string | Current mark price |
| `unrealisedPnl` | string | Unrealized profit/loss |
| `cumRealisedPnl` | string | Cumulative realized profit/loss |
| `leverage` | string | Leverage used |
| `liqPrice` | string | Liquidation price |
| `takeProfit` | string | Take profit price (if set) |
| `stopLoss` | string | Stop loss price (if set) |
| `createdTime` | string | Position creation timestamp (ms) |
| `updatedTime` | string | Last update timestamp (ms) |

**Error Responses:**

- `400 Bad Request`: Invalid category or limit parameter
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: No Bybit API keys configured
- `500 Internal Server Error`: Server error

---

## Frontend Integration Examples

### React/TypeScript Example

```typescript
// API service
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/bybit';

// Set up axios instance with auth
const bybitApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
bybitApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const BybitUserAPI = {
  // Get user info
  getUserInfo: async () => {
    const response = await bybitApi.get('/user/info');
    return response.data;
  },

  // Get wallet balance
  getBalance: async (accountType = 'UNIFIED', coin?: string) => {
    const params = new URLSearchParams();
    params.append('accountType', accountType);
    if (coin) params.append('coin', coin);

    const response = await bybitApi.get(`/user/balance?${params.toString()}`);
    return response.data;
  },

  // Get positions
  getPositions: async (category = 'linear', symbol?: string, limit?: number) => {
    const params = new URLSearchParams();
    params.append('category', category);
    if (symbol) params.append('symbol', symbol);
    if (limit) params.append('limit', limit.toString());

    const response = await bybitApi.get(`/user/positions?${params.toString()}`);
    return response.data;
  },
};

// Usage in component
const UserDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [balance, setBalance] = useState(null);
  const [positions, setPositions] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, balanceData, positionsData] = await Promise.all([
          BybitUserAPI.getUserInfo(),
          BybitUserAPI.getBalance(),
          BybitUserAPI.getPositions(),
        ]);

        setUserInfo(infoData.data);
        setBalance(balanceData.data);
        setPositions(positionsData.data);
      } catch (error) {
        console.error('Error fetching Bybit data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {userInfo && <UserInfo data={userInfo} />}
      {balance && <BalanceDisplay data={balance} />}
      {positions && <PositionsList data={positions} />}
    </div>
  );
};
```

### Angular Example

```typescript
// bybit-user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BybitUserService {
  private apiUrl = 'http://localhost:3000/api/bybit';

  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/info`);
  }

  getBalance(accountType: string = 'UNIFIED', coin?: string): Observable<any> {
    let params = new HttpParams().set('accountType', accountType);
    if (coin) {
      params = params.set('coin', coin);
    }
    return this.http.get(`${this.apiUrl}/user/balance`, { params });
  }

  getPositions(category: string = 'linear', symbol?: string, limit?: number): Observable<any> {
    let params = new HttpParams().set('category', category);
    if (symbol) {
      params = params.set('symbol', symbol);
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get(`${this.apiUrl}/user/positions`, { params });
  }
}
```

---

## Security Considerations

1. **API Key Storage**: User Bybit API keys are stored in memory for development. In production, they should be:
   - Encrypted using a strong encryption algorithm (AES-256)
   - Stored in a secure database with proper access controls
   - Never exposed in API responses

2. **Authentication**: All endpoints require valid JWT authentication. Ensure:
   - JWT tokens have appropriate expiration times
   - Tokens are stored securely on the client side
   - Token refresh mechanism is implemented

3. **Rate Limiting**: Implement rate limiting to prevent abuse:
   - Currently supports 120 requests per minute per user
   - Bybit API has its own rate limits (600 requests per 5 minutes)

4. **CORS**: Ensure CORS is properly configured for your frontend domain

5. **HTTPS**: Always use HTTPS in production to encrypt data in transit

---

## Testing

### Manual Testing with cURL

```bash
# 1. Login to get JWT token
TOKEN=$(curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}' \
  | jq -r '.token')

# 2. Test user info endpoint
curl -X GET "http://localhost:3000/api/bybit/user/info" \
  -H "Authorization: Bearer $TOKEN"

# 3. Test balance endpoint
curl -X GET "http://localhost:3000/api/bybit/user/balance?accountType=UNIFIED" \
  -H "Authorization: Bearer $TOKEN"

# 4. Test positions endpoint
curl -X GET "http://localhost:3000/api/bybit/user/positions?category=linear" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Ensure JWT token is included in Authorization header
   - Check if token has expired
   - Verify token format: `Bearer <token>`

2. **403 Forbidden - No API Keys**
   - User needs to configure Bybit API keys
   - Check if API keys are properly stored for the user
   - Verify API keys have necessary permissions

3. **400 Bad Request - Bybit API Error**
   - Check Bybit API status
   - Verify API key permissions
   - Ensure API keys are valid and not expired
   - Check rate limits haven't been exceeded

4. **500 Internal Server Error**
   - Check server logs for detailed error
   - Verify Bybit service is properly initialized
   - Ensure database connection is active (if using database)

---

## Future Enhancements

1. **Caching**: Implement caching for balance and position data to reduce API calls
2. **WebSocket Support**: Real-time updates for positions and balance
3. **Batch Operations**: Fetch multiple data types in a single request
4. **Historical Data**: Endpoints for historical balance and position data
5. **Notifications**: Alert users when positions reach certain thresholds
6. **Multi-Exchange Support**: Extend to support other exchanges (Binance, Coinbase)

---

## Support

For issues or questions, please contact:
- Email: support@example.com
- GitHub: https://github.com/your-repo/issues
