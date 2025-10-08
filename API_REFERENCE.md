# Trading Bot Platform - API Reference

## Table of Contents

- [Frontend Services API](#frontend-services-api)
  - [BybitService](#bybitservice)
  - [BybitWebSocketService](#bybitwebsocketservice)
  - [AuthService](#authservice)
  - [TradingService](#tradingservice)
  - [GridBotService](#gridbotservice)
  - [ThemeService](#themeservice)
- [Frontend Components](#frontend-components)
  - [LightweightChartComponent](#lightweightchartcomponent)
  - [BotConfigFormComponent](#botconfigformcomponent)
- [Backend API Endpoints](#backend-api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [User Management](#user-management-endpoints)
  - [Trading Operations](#trading-operations-endpoints)
  - [Grid Bot](#grid-bot-endpoints)
- [Data Types](#data-types)
- [Error Handling](#error-handling)

---

## Frontend Services API

### BybitService

**Location**: `/frontend/src/app/services/bybit.service.ts`

Main integration layer for Bybit exchange, combining REST API and WebSocket data streams.

#### Methods

##### `getKlineData(symbol, interval, limit)`

Fetch historical kline/candlestick data from Bybit REST API.

**Parameters**:
- `symbol` (string): Trading pair symbol (e.g., 'BTCUSDT')
- `interval` (string): Time interval - '1', '5', '15', '30', '60', '240', 'D'
- `limit` (number): Number of candles (max 1000, default 720)

**Returns**: `Observable<CandlestickData[]>`

**Example**:
```typescript
this.bybitService.getKlineData('BTCUSDT', '60', 100).subscribe(candles => {
  console.log('Received candles:', candles.length);
});
```

##### `getRealTimeKlineData(symbol, interval)`

Get real-time kline data combining initial REST API data with WebSocket updates.

**Parameters**:
- `symbol` (string): Trading pair symbol (default: 'BTCUSDT')
- `interval` (string): Time interval (default: '1')

**Returns**: `Observable<CandlestickData[]>` - Emits initial data then real-time updates

**Example**:
```typescript
this.bybitService.getRealTimeKlineData('ETHUSDT', '1').subscribe(candles => {
  // First emission: Historical data array
  // Subsequent emissions: Updated array with latest candle
  this.updateChart(candles);
});
```

##### `subscribeToRealtimeKline(symbol, interval)`

Subscribe to real-time kline updates only (no initial data).

**Parameters**:
- `symbol` (string): Trading pair symbol
- `interval` (string): Time interval

**Returns**: `Observable<CandlestickData>` - Emits individual candle updates

##### `getSymbols()`

Get list of available trading symbols from Bybit.

**Returns**: `Observable<string[]>` - Array of trading pair symbols

**Example**:
```typescript
this.bybitService.getSymbols().subscribe(symbols => {
  console.log('Available symbols:', symbols); // ['BTCUSDT', 'ETHUSDT', ...]
});
```

##### `checkApiHealth()`

Check if Bybit API is accessible.

**Returns**: `Observable<boolean>` - True if API is healthy

##### `getWebSocketConnectionState()`

Get current WebSocket connection state.

**Returns**: `Observable<'disconnected' | 'connecting' | 'connected'>`

##### `subscribeToRealtimeTicker(symbol)`

Subscribe to real-time ticker data (24h price statistics).

**Parameters**:
- `symbol` (string): Trading pair symbol

**Returns**: `Observable<TickerData>`

##### `subscribeToRealtimeOrderbook(symbol, depth)`

Subscribe to real-time orderbook data.

**Parameters**:
- `symbol` (string): Trading pair symbol
- `depth` (number): Orderbook depth - 1, 50, or 200 (default: 50)

**Returns**: `Observable<OrderbookData>`

##### `subscribeToRealtimeTrades(symbol)`

Subscribe to real-time trade execution data.

**Parameters**:
- `symbol` (string): Trading pair symbol

**Returns**: `Observable<TradeData>`

##### `getComprehensiveMarketStream(symbol)`

Get combined market data stream (kline + ticker + orderbook).

**Parameters**:
- `symbol` (string): Trading pair symbol

**Returns**: `Observable<{ symbol, timestamp, kline, ticker, orderbook, spread }>`

---

### BybitWebSocketService

**Location**: `/frontend/src/app/services/bybit-websocket.service.ts`

Low-level WebSocket connection manager for Bybit V5 API.

#### Methods

##### `subscribeToKline(symbol, interval)`

Subscribe to kline data for a specific symbol and interval.

**Parameters**:
- `symbol` (string): Trading pair symbol
- `interval` (string): Time interval

**Returns**: `Observable<CandlestickData>` - Emits individual candle updates

**Internal**: Creates or reuses a Subject for the subscription key `${symbol}_${interval}`

##### `unsubscribeFromKline(symbol, interval)`

Unsubscribe from kline data.

**Parameters**:
- `symbol` (string): Trading pair symbol
- `interval` (string): Time interval

##### `getConnectionState()`

Get connection state as observable.

**Returns**: `Observable<'disconnected' | 'connecting' | 'connected'>`

##### `isConnected()`

Check if WebSocket is currently connected.

**Returns**: `boolean`

##### `getActiveSubscriptions()`

Get list of active subscription keys.

**Returns**: `string[]` - Array of subscription keys

**Example**:
```typescript
const subs = this.wsService.getActiveSubscriptions();
// ['BTCUSDT_1', 'ETHUSDT_5']
```

##### `getCachedData(subscriptionKey)`

Get cached latest data for a subscription.

**Parameters**:
- `subscriptionKey` (string): Subscription key (e.g., 'ticker_BTCUSDT')

**Returns**: `any` - Cached data or undefined

##### `clearCache(subscriptionKey?)`

Clear cache for specific subscription or all cache.

**Parameters**:
- `subscriptionKey` (string, optional): Specific key to clear

---

### AuthService

**Location**: `/frontend/src/app/services/auth.service.ts`

Handles user authentication and session management.

#### Methods

##### `login(email, password)`

Authenticate user with email and password.

**Parameters**:
- `email` (string): User email
- `password` (string): User password

**Returns**: `Observable<{ token, user }>`

##### `register(userData)`

Register a new user account.

**Parameters**:
- `userData` (object): User registration data

**Returns**: `Observable<{ token, user }>`

##### `logout()`

Log out current user and clear session.

**Returns**: `Observable<void>`

##### `getCurrentUser()`

Get current authenticated user.

**Returns**: `Observable<User>`

##### `isAuthenticated()`

Check if user is authenticated.

**Returns**: `boolean`

---

### TradingService

**Location**: `/frontend/src/app/services/trading.service.ts`

Manages trading operations and configurations.

---

### GridBotService

**Location**: `/frontend/src/app/services/grid-bot.service.ts`

Handles grid bot configuration and management.

---

### ThemeService

**Location**: `/frontend/src/app/services/theme.service.ts`

Manages application theme (light/dark mode).

#### Properties

##### `currentTheme` (Signal)

Current active theme.

**Type**: `Signal<'light' | 'dark'>`

**Example**:
```typescript
const theme = this.themeService.currentTheme(); // 'dark'
```

#### Methods

##### `toggleTheme()`

Toggle between light and dark theme.

##### `setTheme(theme)`

Set specific theme.

**Parameters**:
- `theme` ('light' | 'dark'): Theme to set

---

## Frontend Components

### LightweightChartComponent

**Location**: `/frontend/src/app/components/lightweight-chart/lightweight-chart.component.ts`

Real-time candlestick chart visualization component.

#### Inputs

- `@Input() symbol: string` - Trading pair symbol (default: 'BTCUSDT')
- `@Input() initialData: ChartData[]` - Initial chart data
- `@Input() gridConfig?: GridConfig` - Grid trading configuration
- `@Input() chartHeight: number` - Chart height in pixels (default: 600)

#### Outputs

- `@Output() symbolChange: EventEmitter<string>` - Emits when symbol changes

#### Public Methods

##### `updateSymbol()`

Update the chart symbol and reload data.

##### `toggleGrid()`

Toggle grid lines visibility.

##### `updateGridConfig(config)`

Update grid configuration.

**Parameters**:
- `config` (GridConfig): New grid configuration

##### `retry()`

Retry chart initialization after error.

#### Example Usage

```html
<app-lightweight-chart
  [symbol]="'BTCUSDT'"
  [chartHeight]="600"
  [gridConfig]="gridConfig"
  (symbolChange)="onSymbolChange($event)">
</app-lightweight-chart>
```

```typescript
export class MyComponent {
  gridConfig: GridConfig = {
    symbol: 'BTCUSDT',
    upperBound: 50000,
    lowerBound: 30000,
    gridCount: 10,
    gridSpacing: 2000,
    strategyType: 'REGULAR'
  };

  onSymbolChange(symbol: string) {
    console.log('Symbol changed to:', symbol);
  }
}
```

---

## Backend API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`

Authenticate user with email and password.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "avatar": "https://...",
    "subscriptionActive": true,
    "subscriptionExpiry": "2025-12-31T23:59:59Z"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

#### POST `/api/auth/register`

Register a new user account.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "Jane Doe"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

#### POST `/api/auth/logout`

Log out current user and invalidate session.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/api/auth/google`

Initiate Google OAuth authentication flow.

**Response**: Redirect to Google OAuth consent screen

---

### User Management Endpoints

#### GET `/api/user/profile`

Get current user profile information.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z",
  "subscriptionActive": true,
  "preferences": { ... }
}
```

---

#### PUT `/api/user/profile`

Update user profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Smith",
  "avatar": "https://new-avatar.jpg"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": { ... }
}
```

---

#### GET `/api/user/preferences`

Get user preferences.

**Response** (200 OK):
```json
{
  "theme": "dark",
  "language": "en",
  "defaultSymbol": "BTCUSDT",
  "notifications": {
    "email": true,
    "push": false
  }
}
```

---

#### PUT `/api/user/preferences`

Update user preferences.

**Request Body**:
```json
{
  "theme": "light",
  "defaultSymbol": "ETHUSDT"
}
```

---

### Trading Operations Endpoints

#### GET `/api/trading/platforms`

Get list of supported trading platforms.

**Response** (200 OK):
```json
[
  {
    "id": "bybit",
    "name": "Bybit",
    "type": "centralized",
    "supported": true
  }
]
```

---

#### GET `/api/trading/strategies`

Get list of available trading strategies.

**Response** (200 OK):
```json
[
  {
    "id": "grid",
    "name": "Grid Trading",
    "description": "Automated grid trading strategy",
    "type": "grid"
  }
]
```

---

### Grid Bot Endpoints

#### GET `/api/trading/grid-bot`

Get user's grid bots.

**Query Parameters**:
- `botId` (optional): Specific bot ID to retrieve

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": "bot_123",
    "name": "BTC Grid Bot",
    "userId": "user_123",
    "symbol": "BTCUSDT",
    "status": "RUNNING",
    "config": {
      "symbol": "BTCUSDT",
      "baseAsset": "BTC",
      "quoteAsset": "USDT",
      "gridStrategy": {
        "type": "REGULAR",
        "gridCount": 10,
        "gridSpacing": 1.0
      },
      "gridRange": {
        "upperBound": 50000,
        "lowerBound": 30000,
        "autoAdjust": false
      },
      "riskManagement": {
        "baseOrderSize": 10,
        "maxPositionSize": 1000,
        "maxOpenOrders": 20
      }
    },
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T12:00:00Z",
    "performance": {
      "totalTrades": 45,
      "winningTrades": 30,
      "losingTrades": 15,
      "totalPnL": 1250.50,
      "totalPnLPercentage": 12.5,
      "winRate": 66.67
    }
  }
]
```

---

#### POST `/api/trading/grid-bot`

Create a new grid bot.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "BTC Grid Bot",
  "config": {
    "symbol": "BTCUSDT",
    "gridCount": 10,
    "upperBound": 50000,
    "lowerBound": 30000,
    "baseOrderSize": 10,
    "gridStrategy": {
      "type": "REGULAR",
      "gridSpacing": 1.0
    }
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "bot": {
    "id": "bot_124",
    "name": "BTC Grid Bot",
    "status": "STOPPED",
    ...
  },
  "message": "Trading bot created successfully"
}
```

**Error Responses**:
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

#### PUT `/api/trading/grid-bot`

Update existing grid bot.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "botId": "bot_123",
  "action": "start",  // "start", "stop", "pause", "update"
  "config": { ... }   // Required for "update" action
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "status": "RUNNING",
  "message": "Bot started successfully"
}
```

---

#### DELETE `/api/trading/grid-bot?botId={botId}`

Delete a grid bot.

**Query Parameters**:
- `botId` (required): Bot ID to delete

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bot deleted successfully"
}
```

---

## Data Types

### CandlestickData

```typescript
interface CandlestickData {
  time: string | number;  // Unix timestamp (seconds) or date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}
```

### TickerData

```typescript
interface TickerData {
  symbol: string;
  lastPrice: number;
  highPrice24h: number;
  lowPrice24h: number;
  prevPrice24h: number;
  volume24h: number;
  turnover24h: number;
  price24hPcnt: number;
  usdIndexPrice: number;
  timestamp: number;
}
```

### OrderbookData

```typescript
interface OrderbookData {
  symbol: string;
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
  timestamp: number;
}
```

### GridConfig

```typescript
interface GridConfig {
  symbol: string;
  upperBound: number;
  lowerBound: number;
  gridCount: number;
  gridSpacing: number;
  strategyType: string;
}
```

---

## Error Handling

### HTTP Error Codes

- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Frontend Error Handling Example

```typescript
this.bybitService.getKlineData('BTCUSDT', '60', 100).subscribe({
  next: (data) => {
    console.log('Success:', data);
  },
  error: (error) => {
    if (error.status === 401) {
      // Handle unauthorized
      this.router.navigate(['/login']);
    } else if (error.status === 500) {
      // Handle server error
      console.error('Server error:', error);
    }
  }
});
```

---

## Rate Limiting

### Bybit API Limits

- REST API: 600 requests per 5 minutes per IP
- WebSocket: Maximum 500 subscriptions per connection

### Best Practices

1. Use WebSocket for real-time data instead of polling REST API
2. Reuse existing subscriptions when possible
3. Implement exponential backoff for failed requests
4. Cache data when appropriate

---

## WebSocket Topics

### Kline Topic Format

```
kline.{interval}.{symbol}
```

**Examples**:
- `kline.1.BTCUSDT` - 1-minute Bitcoin candles
- `kline.60.ETHUSDT` - 1-hour Ethereum candles
- `kline.D.ADAUSDT` - Daily Cardano candles

### Subscription Example

```typescript
// Subscribe to 1-minute BTC candles
this.wsService.subscribeToKline('BTCUSDT', '1').subscribe(candle => {
  console.log('New candle:', candle);
});

// Unsubscribe when done
this.wsService.unsubscribeFromKline('BTCUSDT', '1');
```

---

## References

- [Bybit V5 API Documentation](https://bybit-exchange.github.io/docs/v5/intro)
- [lightweight-charts Documentation](https://tradingview.github.io/lightweight-charts/)
- [Angular Documentation](https://angular.io/docs)
- [RxJS Documentation](https://rxjs.dev/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
