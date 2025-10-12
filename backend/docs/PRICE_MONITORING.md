# Real-Time Price Monitoring System

This document describes the real-time price monitoring functionality added to the exchange connectors for price arbitrage detection and analysis.

## Overview

The price monitoring system provides two main capabilities across all supported exchanges (Bybit, BingX, MEXC):

1. **REST API Price Fetching**: Get current market price on-demand
2. **WebSocket Price Streaming**: Subscribe to real-time price updates

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                  BaseExchangeConnector                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  + getMarketPrice(symbol): Promise<number>          │  │
│  │  + subscribeToPriceStream(symbol, callback)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────┴────────┐  ┌──────┴──────┐  ┌────────┴────────┐
│ BybitConnector │  │BingXConnector│  │ MEXCConnector   │
└────────┬───────┘  └──────┬──────┘  └────────┬────────┘
         │                 │                   │
         └─────────────────┼───────────────────┘
                           │
                ┌──────────▼──────────┐
                │ WebSocketManager    │
                │  Service            │
                │                     │
                │ - Connection Pool   │
                │ - Auto-Reconnect    │
                │ - Health Monitoring │
                └─────────────────────┘
```

### WebSocketManager Service

The `WebSocketManager` service provides centralized WebSocket connection management:

- **Connection Pooling**: One WebSocket connection per exchange-symbol pair, shared across multiple subscribers
- **Automatic Reconnection**: Exponential backoff with configurable delays
- **Health Monitoring**: Heartbeat/ping-pong to detect stale connections
- **Memory Management**: Automatic cleanup when last subscriber disconnects

## API Reference

### BaseExchangeConnector

#### `getMarketPrice(symbol: string): Promise<number>`

Fetches the current market price using REST API.

**Parameters:**
- `symbol` - Trading pair symbol (format varies by exchange)

**Returns:**
- `Promise<number>` - Current market price

**Example:**
```typescript
const connector = new BybitConnector(apiKey, apiSecret, true);
await connector.initialize();

const price = await connector.getMarketPrice('BTCUSDT');
console.log(`Current BTC price: $${price}`);
```

#### `subscribeToPriceStream(symbol: string, callback: (price: number, timestamp: number) => void): Promise<() => void>`

Subscribes to real-time price updates via WebSocket.

**Parameters:**
- `symbol` - Trading pair symbol
- `callback` - Function called on each price update with:
  - `price` - Current price
  - `timestamp` - Update timestamp in milliseconds

**Returns:**
- `Promise<() => void>` - Unsubscribe function to stop receiving updates

**Example:**
```typescript
const connector = new BybitConnector(apiKey, apiSecret, true);
await connector.initialize();

const unsubscribe = await connector.subscribeToPriceStream(
  'BTCUSDT',
  (price, timestamp) => {
    console.log(`Price: $${price} at ${new Date(timestamp).toISOString()}`);
  }
);

// Later: stop receiving updates
unsubscribe();
```

## Exchange-Specific Details

### Bybit

**Symbol Format:** `BTCUSDT` (no separator)

**REST API:**
- Endpoint: `/v5/market/tickers`
- Uses existing `BybitService.getTicker()`

**WebSocket:**
- Endpoint: `wss://stream.bybit.com/v5/public/linear`
- Topic: `tickers.BTCUSDT`
- Message Format:
  ```json
  {
    "topic": "tickers.BTCUSDT",
    "type": "snapshot",
    "data": {
      "symbol": "BTCUSDT",
      "lastPrice": "50000.5",
      ...
    },
    "ts": 1234567890
  }
  ```

**Implementation:**
- Uses existing `BybitService.subscribeToTicker()` method
- Leverages official `bybit-api` SDK WebSocket client

### BingX

**Symbol Format:** `BTC-USDT` (dash separator)

**REST API:**
- Endpoint: `/openApi/swap/v2/quote/ticker`
- Uses existing `BingXService.getTickers()`

**WebSocket:**
- Endpoint: `wss://open-api-swap.bingx.com/swap-market`
- Subscribe Message:
  ```json
  {
    "id": "unique-id",
    "dataType": "BTC-USDT@ticker"
  }
  ```
- Response Format:
  ```json
  {
    "dataType": "BTC-USDT@ticker",
    "data": {
      "c": "50000.5",
      "E": 1234567890
    }
  }
  ```

**Implementation:**
- Uses centralized `WebSocketManager` service
- Custom WebSocket implementation (no official SDK)

### MEXC

**Symbol Format:** `BTC_USDT` (underscore separator)

**REST API:**
- Endpoint: `/api/v1/contract/ticker`
- Uses existing `MEXCService.getTickers()`

**WebSocket:**
- Endpoint: `wss://contract.mexc.com/ws`
- Subscribe Message:
  ```json
  {
    "method": "sub.ticker",
    "param": {
      "symbol": "BTC_USDT"
    }
  }
  ```
- Response Format:
  ```json
  {
    "channel": "push.ticker",
    "data": {
      "lastPrice": 50000.5,
      "timestamp": 1234567890
    },
    "symbol": "BTC_USDT"
  }
  ```

**Implementation:**
- Uses centralized `WebSocketManager` service
- Custom WebSocket implementation

## Usage Examples

### Example 1: Simple Price Monitoring

```typescript
import { BybitConnector } from './connectors/bybit.connector';

async function monitorPrice() {
  const connector = new BybitConnector(
    process.env.BYBIT_API_KEY!,
    process.env.BYBIT_API_SECRET!,
    true // testnet
  );

  await connector.initialize();

  // Subscribe to price updates
  const unsubscribe = await connector.subscribeToPriceStream(
    'BTCUSDT',
    (price, timestamp) => {
      console.log(`BTC Price: $${price.toFixed(2)}`);
    }
  );

  // Stop after 60 seconds
  setTimeout(() => unsubscribe(), 60000);
}
```

### Example 2: Cross-Exchange Price Arbitrage

```typescript
import { BybitConnector } from './connectors/bybit.connector';
import { BingXConnector } from './connectors/bingx.connector';
import { MEXCConnector } from './connectors/mexc.connector';

async function monitorArbitrage() {
  // Initialize all connectors
  const bybit = new BybitConnector(apiKey1, apiSecret1, true);
  const bingx = new BingXConnector(apiKey2, apiSecret2, false);
  const mexc = new MEXCConnector(apiKey3, apiSecret3, false);

  await Promise.all([
    bybit.initialize(),
    bingx.initialize(),
    mexc.initialize(),
  ]);

  // Track latest prices
  const prices = { bybit: 0, bingx: 0, mexc: 0 };

  // Subscribe to all exchanges
  await Promise.all([
    bybit.subscribeToPriceStream('BTCUSDT', (price) => {
      prices.bybit = price;
      checkArbitrage();
    }),
    bingx.subscribeToPriceStream('BTC-USDT', (price) => {
      prices.bingx = price;
      checkArbitrage();
    }),
    mexc.subscribeToPriceStream('BTC_USDT', (price) => {
      prices.mexc = price;
      checkArbitrage();
    }),
  ]);

  function checkArbitrage() {
    const max = Math.max(...Object.values(prices));
    const min = Math.min(...Object.values(prices));
    const spread = ((max - min) / min) * 100;

    if (spread > 0.1) {
      console.log(`ARBITRAGE OPPORTUNITY: ${spread.toFixed(4)}%`);
    }
  }
}
```

### Example 3: Price Alert System

```typescript
async function priceAlerts() {
  const connector = new BybitConnector(apiKey, apiSecret, true);
  await connector.initialize();

  const HIGH_THRESHOLD = 50000;
  const LOW_THRESHOLD = 45000;

  await connector.subscribeToPriceStream('BTCUSDT', (price) => {
    if (price > HIGH_THRESHOLD) {
      console.log(`🔴 HIGH PRICE ALERT: $${price}`);
      // Send notification, trigger action, etc.
    } else if (price < LOW_THRESHOLD) {
      console.log(`🟢 LOW PRICE ALERT: $${price}`);
      // Send notification, trigger action, etc.
    }
  });
}
```

## Testing

### Unit Tests

Run the integration tests:

```bash
npm test -- src/connectors/__tests__/price-monitoring.test.ts
```

### Manual Testing

Use the example scripts:

```bash
# Example 1: Fetch current price
npm run example:price 1

# Example 2: Real-time price stream
npm run example:price 2

# Example 3: Cross-exchange monitoring
npm run example:price 3

# Example 4: Price alert system
npm run example:price 4

# Example 5: Volatility tracker
npm run example:price 5
```

## Performance Considerations

### REST API

- **Rate Limits**: Each exchange has different rate limits. Use caching when appropriate.
- **Latency**: REST calls typically take 200-500ms depending on network conditions.
- **Cost**: Each call consumes API quota.

**Recommendation:** Use REST API for:
- Initial price checks
- Periodic updates (> 1 minute intervals)
- Backup when WebSocket is unavailable

### WebSocket

- **Latency**: Real-time updates with < 100ms latency
- **Resource Usage**: One connection per exchange-symbol pair
- **Reliability**: Auto-reconnect on disconnect

**Recommendation:** Use WebSocket for:
- Real-time price monitoring
- High-frequency trading
- Price arbitrage detection

### Memory Management

The `WebSocketManager` service automatically manages connections:

1. **Connection Pooling**: Multiple subscribers share one WebSocket connection
2. **Auto-Cleanup**: Connection closes when last subscriber disconnects
3. **Reconnection**: Exponential backoff prevents resource exhaustion

## Error Handling

### Common Errors

**1. Connection Timeout**
```typescript
try {
  await connector.subscribeToPriceStream(symbol, callback);
} catch (error) {
  if (error.message.includes('timeout')) {
    // Retry with exponential backoff
  }
}
```

**2. Invalid Symbol**
```typescript
try {
  const price = await connector.getMarketPrice('INVALID_SYMBOL');
} catch (error) {
  if (error.message.includes('No ticker data found')) {
    // Handle invalid symbol
  }
}
```

**3. WebSocket Disconnect**
```typescript
// Auto-reconnect is built-in
const unsubscribe = await connector.subscribeToPriceStream(
  symbol,
  (price, timestamp) => {
    // This will continue receiving updates even after reconnection
  }
);
```

### Best Practices

1. **Always initialize connectors** before calling price methods
2. **Unsubscribe when done** to prevent memory leaks
3. **Handle errors gracefully** with try-catch blocks
4. **Use timeouts** for long-running subscriptions
5. **Monitor connection health** using `websocketManager.getStats()`

## WebSocket Manager Statistics

Monitor WebSocket health:

```typescript
import { websocketManager } from './services/websocket-manager.service';

const stats = websocketManager.getStats();
console.log('Total Connections:', stats.totalConnections);
console.log('Active Connections:', stats.activeConnections);

stats.connections.forEach((conn) => {
  console.log(`${conn.key}:`, {
    connected: conn.connected,
    subscribers: conn.subscribers,
    lastUpdate: new Date(conn.lastUpdate).toISOString(),
    reconnectAttempts: conn.reconnectAttempts,
  });
});
```

## Troubleshooting

### Issue: No price updates received

**Possible causes:**
1. Symbol format is incorrect for the exchange
2. WebSocket connection failed to establish
3. Exchange-specific authentication issues

**Solution:**
```typescript
// Check connection status
const isConnected = websocketManager.isConnected('bybit', 'BTCUSDT');
console.log('Connected:', isConnected);

// Check last update time
const lastUpdate = websocketManager.getLastUpdate('bybit', 'BTCUSDT');
console.log('Last update:', new Date(lastUpdate).toISOString());
```

### Issue: Memory leak with long-running subscriptions

**Solution:**
```typescript
// Always store and call unsubscribe function
const unsubscribe = await connector.subscribeToPriceStream(symbol, callback);

// Clean up when done
process.on('SIGINT', () => {
  unsubscribe();
  process.exit(0);
});
```

### Issue: High reconnection attempts

**Possible causes:**
1. Network instability
2. Exchange API issues
3. Invalid credentials

**Solution:**
```typescript
// Monitor reconnection attempts
const stats = websocketManager.getStats();
stats.connections.forEach((conn) => {
  if (conn.reconnectAttempts > 5) {
    console.warn(`High reconnect attempts for ${conn.key}`);
    // Consider switching to REST API polling
  }
});
```

## Future Enhancements

Potential improvements for the price monitoring system:

1. **Historical Price Data**: Add methods to fetch historical OHLCV data
2. **Order Book Streaming**: Subscribe to order book updates for depth analysis
3. **Trade Streaming**: Monitor recent trades for volume analysis
4. **Aggregated Multi-Symbol**: Subscribe to multiple symbols with one connection
5. **Price Prediction**: Integrate ML models for price prediction
6. **Circuit Breaker**: Automatic fallback to REST when WebSocket is unstable

## Related Documentation

- [Exchange Connectors Overview](./EXCHANGE_CONNECTORS.md)
- [WebSocket Manager API](./WEBSOCKET_MANAGER.md)
- [Funding Arbitrage System](./FUNDING_ARBITRAGE.md)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review exchange-specific documentation
3. Check WebSocket connection logs
4. Monitor `WebSocketManager` statistics
