# WebSocket Data Flow Documentation

## Overview

This document details the real-time data flow from Bybit WebSocket API through the application layers to the chart visualization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      BYBIT EXCHANGE                                  │
│                                                                      │
│  WebSocket Server: wss://stream.bybit.com/v5/public/spot           │
│                                                                      │
│  Topics:                                                             │
│  - kline.{interval}.{symbol}     (Candlestick data)                │
│  - tickers.{symbol}              (24h ticker)                       │
│  - orderbook.{depth}.{symbol}    (Order book)                       │
│  - publicTrade.{symbol}          (Recent trades)                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket Messages
                              │ (JSON format)
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  BYBIT WEBSOCKET SERVICE                             │
│                  bybit-websocket.service.ts                          │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Connection Management                                      │   │
│  │  - WebSocketSubject (RxJS)                                  │   │
│  │  - Auto-reconnection                                        │   │
│  │  - Ping/Pong (every 20s)                                    │   │
│  │  - Connection state: disconnected|connecting|connected      │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Subscription Management                                    │   │
│  │  - Map<subscriptionKey, Subject<Data>>                      │   │
│  │  - Subscribe/Unsubscribe operations                         │   │
│  │  - Topic routing                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Message Processing                                         │   │
│  │  - handleMessage()      (Route by topic)                    │   │
│  │  - handleKlineData()    (Transform kline data)              │   │
│  │  - handleTickerData()   (Transform ticker data)             │   │
│  │  - handleOrderbookData() (Transform orderbook)              │   │
│  │  - handleTradeData()    (Transform trades)                  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Emits: Observable<CandlestickData>                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Individual Candle Updates
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BYBIT SERVICE                                  │
│                       bybit.service.ts                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  getRealTimeKlineData(symbol, interval)                     │   │
│  │                                                              │   │
│  │  Step 1: Get initial historical data (REST API)             │   │
│  │  ┌────────────────────────────────────────────────┐        │   │
│  │  │ GET /v5/market/kline                            │        │   │
│  │  │ Returns: 100 candles                            │        │   │
│  │  └────────────────────────────────────────────────┘        │   │
│  │                                                              │   │
│  │  Step 2: Subscribe to WebSocket updates                     │   │
│  │  ┌────────────────────────────────────────────────┐        │   │
│  │  │ webSocketService.subscribeToKline()             │        │   │
│  │  │ Returns: Observable<CandlestickData>            │        │   │
│  │  └────────────────────────────────────────────────┘        │   │
│  │                                                              │   │
│  │  Step 3: Combine initial + real-time data                   │   │
│  │  ┌────────────────────────────────────────────────┐        │   │
│  │  │ BehaviorSubject<CandlestickData[]>              │        │   │
│  │  │                                                  │        │   │
│  │  │ On WebSocket update:                            │        │   │
│  │  │   - Get current data array                      │        │   │
│  │  │   - updateCandlestickData()                     │        │   │
│  │  │   - Emit updated array                          │        │   │
│  │  └────────────────────────────────────────────────┘        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  updateCandlestickData(currentData, newCandle)              │   │
│  │                                                              │   │
│  │  - If newCandle.time == lastCandle.time:                    │   │
│  │      Update existing candle (same minute/interval)          │   │
│  │  - If newCandle.time > lastCandle.time:                     │   │
│  │      Append new candle (new interval started)               │   │
│  │  - Keep only last 1000 candles                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Emits: Observable<CandlestickData[]>                               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Array of Candles
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  LIGHTWEIGHT CHART COMPONENT                         │
│                  lightweight-chart.component.ts                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Subscription Lifecycle                                     │   │
│  │                                                              │   │
│  │  this.bybitService.getRealTimeKlineData()                   │   │
│  │    .subscribe({                                             │   │
│  │      next: (data: CandlestickData[]) => {                   │   │
│  │                                                              │   │
│  │        isFirstLoad?                                         │   │
│  │          │                                                   │   │
│  │          ├─ YES: candlestickSeries.setData(all data)        │   │
│  │          │      - Load all historical candles               │   │
│  │          │      - Fit chart to content                      │   │
│  │          │      - Set isFirstLoad = false                   │   │
│  │          │                                                   │   │
│  │          └─ NO:  candlestickSeries.update(last candle)      │   │
│  │                  - Update only the last candle              │   │
│  │                  - Efficient real-time updates              │   │
│  │      }                                                       │   │
│  │    })                                                        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Chart Rendering (lightweight-charts v5)                    │   │
│  │                                                              │   │
│  │  createChart(container, options)                            │   │
│  │  chart.addSeries(CandlestickSeries, options)                │   │
│  │  series.setData([...])   // Initial load                    │   │
│  │  series.update({...})    // Real-time updates               │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
                      📊 Visual Chart Updates
```

## Message Flow Details

### 1. WebSocket Connection Establishment

```typescript
// bybit-websocket.service.ts

private connect(): void {
  this.socket$ = webSocket({
    url: 'wss://stream.bybit.com/v5/public/spot',
    openObserver: {
      next: () => {
        console.log('✅ Connected to Bybit V5 WebSocket');
        this.connectionState$.next('connected');
        this.startPing(); // Start heartbeat
      }
    }
  });
}
```

**Heartbeat (Ping/Pong)**:
- Send `{ op: 'ping' }` every 20 seconds
- Receive `{ op: 'pong' }` response
- Prevents connection timeout

### 2. Topic Subscription

```typescript
// Subscribe to kline data
subscribeToKline(symbol: string, interval: string): Observable<CandlestickData> {
  const topic = `kline.${interval}.${symbol}`;
  const subscriptionKey = `${symbol}_${interval}`;

  // Send subscription message
  this.socket$.next({
    op: 'subscribe',
    args: [topic]
  });

  // Return observable for this topic
  return this.subscriptions.get(subscriptionKey).asObservable();
}
```

**Subscription Message**:
```json
{
  "op": "subscribe",
  "args": ["kline.1.BTCUSDT"]
}
```

**Confirmation Response**:
```json
{
  "success": true,
  "conn_id": "...",
  "op": "subscribe"
}
```

### 3. Receiving Kline Data

**Bybit V5 Kline Message Format**:
```json
{
  "topic": "kline.1.BTCUSDT",
  "type": "snapshot",
  "ts": 1234567890000,
  "data": [
    {
      "start": 1672324800000,
      "end": 1672324860000,
      "interval": "1",
      "open": "16850.5",
      "close": "16852.0",
      "high": "16855.0",
      "low": "16848.0",
      "volume": "125.45",
      "turnover": "2112500.25",
      "confirm": false
    }
  ]
}
```

**Processing in handleKlineData()**:
```typescript
private handleKlineData(message: BybitWsMessage): void {
  const klineDataArray = Array.isArray(message.data) ? message.data : [message.data];

  klineDataArray.forEach((klineData: any) => {
    const candlestick: CandlestickData = {
      time: Math.floor(klineData.start / 1000), // Convert ms to seconds
      open: parseFloat(klineData.open),
      high: parseFloat(klineData.high),
      low: parseFloat(klineData.low),
      close: parseFloat(klineData.close),
      volume: parseFloat(klineData.volume)
    };

    // Emit to subscribers
    subject.next(candlestick);
  });
}
```

### 4. Combining REST + WebSocket Data

```typescript
// bybit.service.ts

getRealTimeKlineData(symbol: string, interval: string): Observable<CandlestickData[]> {
  // 1. Get initial historical data
  const initialData$ = this.getKlineData(symbol, interval, 100);

  // 2. Subscribe to WebSocket updates
  const realtimeUpdates$ = this.webSocketService.subscribeToKline(symbol, interval);

  // 3. Combine both streams
  return initialData$.pipe(
    switchMap(initialData => {
      const dataSubject = new BehaviorSubject<CandlestickData[]>(initialData);

      // Listen to WebSocket updates
      const subscription = realtimeUpdates$.subscribe({
        next: (newCandle) => {
          const currentData = dataSubject.value;
          const updatedData = this.updateCandlestickData(currentData, newCandle);
          dataSubject.next(updatedData); // Emit updated array
        }
      });

      // Return observable with cleanup
      return new Observable<CandlestickData[]>(observer => {
        const subjectSubscription = dataSubject.subscribe(observer);
        return () => {
          subscription.unsubscribe();
          subjectSubscription.unsubscribe();
        };
      });
    })
  );
}
```

### 5. Chart Updates

```typescript
// lightweight-chart.component.ts

let isFirstLoad = true;

this.dataSubscription = this.bybitService.getRealTimeKlineData(symbol, '1')
  .subscribe({
    next: (data) => {
      const formattedData = data.map(item => ({
        time: item.time as UTCTimestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      }));

      if (isFirstLoad) {
        // Initial load: set all data
        this.candlestickSeries.setData(formattedData);
        this.chart.timeScale().fitContent();
        isFirstLoad = false;
      } else {
        // Real-time update: update last candle
        const lastCandle = formattedData[formattedData.length - 1];
        this.candlestickSeries.update(lastCandle);
      }
    }
  });
```

## Data Transformation Pipeline

### Bybit Raw Data → Application Data

```typescript
// Bybit API Response (REST)
{
  "retCode": 0,
  "result": {
    "list": [
      ["1672324800000", "16850.5", "16855.0", "16848.0", "16852.0", "125.45", "2112500.25"]
      // [timestamp, open, high, low, close, volume, turnover]
    ]
  }
}

// ↓ Transform in transformBybitData()

// CandlestickData
{
  time: 1672324800,  // Unix timestamp in seconds
  open: 16850.5,
  high: 16855.0,
  low: 16848.0,
  close: 16852.0,
  volume: 125.45
}

// ↓ Format for lightweight-charts

// CandlestickData<Time>
{
  time: 1672324800 as UTCTimestamp,
  open: 16850.5,
  high: 16855.0,
  low: 16848.0,
  close: 16852.0
}
```

## Error Handling

### WebSocket Errors

```typescript
// Auto-reconnection
this.socket$.pipe(
  catchError(error => {
    console.error('WebSocket error:', error);
    this.connectionState$.next('disconnected');

    // Retry after 5 seconds
    timer(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.connect();
    });

    return EMPTY;
  })
).subscribe();
```

### Fallback to REST API

```typescript
// Component fallback strategy
this.dataSubscription = this.bybitService.getRealTimeKlineData(symbol, '1')
  .subscribe({
    error: (error) => {
      console.error('Real-time data failed, falling back to REST only');
      this.loadFallbackData(symbol); // Use polling or cached data
    }
  });
```

## Performance Considerations

### 1. Data Windowing
```typescript
// Keep only last 1000 candles
if (updatedData.length > 1000) {
  updatedData.shift();
}
```

### 2. Efficient Updates
- Use `series.update()` for real-time changes (not `setData()`)
- Only emit when data actually changes
- Avoid unnecessary re-renders

### 3. Connection Management
- Single WebSocket connection per service instance
- Shared subscriptions for same symbol/interval
- Proper cleanup on component destroy

### 4. Subscription Cleanup
```typescript
ngOnDestroy(): void {
  if (this.dataSubscription) {
    this.dataSubscription.unsubscribe();
  }
  this.bybitService.unsubscribeFromRealtimeKline(this.symbol, '1');
}
```

## Debugging

### Console Log Prefixes

- `[WS SERVICE]` - WebSocket service layer operations
- `[BYBIT SERVICE]` - Bybit service layer operations
- `[CHART]` - Chart component operations

### Typical Log Sequence

```
[CHART] Subscribing to real-time kline data...
[BYBIT SERVICE] Starting real-time kline data for BTCUSDT, interval: 1
[WS SERVICE] subscribeToKline called - topic: kline.1.BTCUSDT
[WS SERVICE] Creating new Subject for BTCUSDT_1
[WS SERVICE] WebSocket not connected, initiating connection...
✅ Connected to Bybit V5 WebSocket
[WS SERVICE] Connection state changed: connected
[WS SERVICE] Sending subscription for kline.1.BTCUSDT
✅ Subscription confirmed
[BYBIT SERVICE] Initial data loaded: 100 candles
[CHART] Setting initial chart data with 100 candles
[CHART] Initial data loaded successfully
[WS SERVICE] Received data message
[WS SERVICE] Emitting kline update
[BYBIT SERVICE] Received WebSocket candle update
[BYBIT SERVICE] Emitting updated data array
[CHART] Received 100 data points
[CHART] *** UPDATING CHART WITH NEW CANDLE ***
```

## Subscription Key Format

Format: `${symbol}_${interval}`

Examples:
- `BTCUSDT_1` - Bitcoin 1-minute candles
- `ETHUSDT_5` - Ethereum 5-minute candles
- `ADAUSDT_60` - Cardano 1-hour candles

## Topic Format

Format: `kline.${interval}.${symbol}`

Examples:
- `kline.1.BTCUSDT` - Bitcoin 1-minute kline
- `kline.5.ETHUSDT` - Ethereum 5-minute kline
- `kline.D.BTCUSDT` - Bitcoin daily kline

## Supported Intervals

- `1` - 1 minute
- `5` - 5 minutes
- `15` - 15 minutes
- `30` - 30 minutes
- `60` - 1 hour
- `240` - 4 hours
- `D` - 1 day

## Future Enhancements

1. **Reconnection Strategies**
   - Exponential backoff
   - Maximum retry attempts
   - Connection quality monitoring

2. **Data Persistence**
   - IndexedDB for offline access
   - Resume from last known state
   - Historical data caching

3. **Multi-Subscription Management**
   - Batch subscribe/unsubscribe
   - Priority-based subscriptions
   - Resource pooling

4. **Advanced Features**
   - Data compression
   - Delta updates
   - Custom aggregations

## References

- [Bybit WebSocket V5 Documentation](https://bybit-exchange.github.io/docs/v5/ws/connect)
- [RxJS WebSocket Documentation](https://rxjs.dev/api/webSocket/webSocket)
- [lightweight-charts API](https://tradingview.github.io/lightweight-charts/docs/api)
