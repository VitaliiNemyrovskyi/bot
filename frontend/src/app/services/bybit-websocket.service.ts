import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, timer, EMPTY, Subscription } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, retry, takeUntil, map, filter } from 'rxjs/operators';

/**
 * Bybit WebSocket V5 kline/candlestick data structure
 * Raw format received from WebSocket stream
 */
export interface BybitWsKlineData {
  start: number; // Bybit V5 uses 'start' for the candle start time (milliseconds)
  end: number;   // Bybit V5 uses 'end' for the candle end time (milliseconds)
  interval: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
  confirm: boolean; // true means this kline is closed
  timestamp: number; // Message timestamp
}

export interface BybitWsTickerData {
  symbol: string;
  lastPrice: string;
  highPrice24h: string;
  lowPrice24h: string;
  prevPrice24h: string;
  volume24h: string;
  turnover24h: string;
  price24hPcnt: string;
  usdIndexPrice: string;
}

export interface BybitWsOrderbookData {
  symbol: string;
  bids: [string, string][]; // [price, size]
  asks: [string, string][]; // [price, size]
  ts: number;
  u: number; // update id
}

export interface BybitWsTradeData {
  symbol: string;
  execId: string;
  price: string;
  size: string;
  side: 'Buy' | 'Sell';
  time: number;
  isBlockTrade: boolean;
}

export interface BybitWsMessage {
  topic: string;
  type: string;
  data: BybitWsKlineData[] | BybitWsTickerData[] | BybitWsOrderbookData | BybitWsTradeData[];
  cs: number;
  ts: number;
}

export interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface TickerData {
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

export interface OrderbookData {
  symbol: string;
  bids: { price: number; size: number }[];
  asks: { price: number; size: number }[];
  timestamp: number;
}

export interface TradeData {
  symbol: string;
  execId: string;
  price: number;
  size: number;
  side: 'Buy' | 'Sell';
  timestamp: number;
  isBlockTrade: boolean;
}

/**
 * Bybit WebSocket Service - Low-level WebSocket connection manager
 *
 * This service manages the WebSocket connection to Bybit V5 public API, handling:
 * - Connection lifecycle (connect, disconnect, reconnect)
 * - Subscription management for multiple data streams
 * - Message routing and transformation
 * - Heartbeat/ping mechanism to keep connection alive
 * - Auto-reconnection on connection failure
 * - Data caching for latest values
 *
 * The service maintains a single WebSocket connection and multiplexes multiple
 * subscriptions through it, providing separate Observable streams for each subscription.
 *
 * @example
 * ```typescript
 * // Subscribe to kline data
 * this.wsService.subscribeToKline('BTCUSDT', '1').subscribe(candle => {
 *   console.log('New candle:', candle);
 * });
 *
 * // Check connection state
 * this.wsService.getConnectionState().subscribe(state => {
 *   console.log('Connection state:', state);
 * });
 *
 * // Clean up on destroy
 * this.wsService.unsubscribeFromKline('BTCUSDT', '1');
 * ```
 *
 * @see {@link BybitService} for high-level API combining REST and WebSocket
 */
@Injectable({
  providedIn: 'root'
})
export class BybitWebSocketService implements OnDestroy {
  // WebSocket URLs for different environments
  private readonly WS_URLS = {
    mainnet: 'wss://stream.bybit.com/v5/public/spot',
    testnet: 'wss://stream-testnet.bybit.com/v5/public/spot'
  };

  private currentEnvironment: 'mainnet' | 'testnet' = 'mainnet';
  private socket$: WebSocketSubject<any> | null = null;
  private destroy$ = new Subject<void>();
  private pingTimer?: Subscription;

  // Connection state
  private connectionState$ = new BehaviorSubject<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Data streams
  private klineData$ = new Subject<CandlestickData>();
  private tickerData$ = new Subject<TickerData>();
  private orderbookData$ = new Subject<OrderbookData>();
  private tradeData$ = new Subject<TradeData>();

  // Subscription management
  private subscriptions = new Map<string, Subject<any>>();
  private dataCache = new Map<string, any>(); // Cache latest data for each stream

  constructor() {
    console.log('BybitWebSocketService initialized');
  }

  ngOnDestroy(): void {
    this.stopPing();
    this.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get connection state as observable
   */
  getConnectionState(): Observable<'disconnected' | 'connecting' | 'connected'> {
    return this.connectionState$.asObservable();
  }

  /**
   * Set WebSocket environment (mainnet or testnet)
   * Will disconnect and reconnect if already connected
   */
  setEnvironment(environment: 'MAINNET' | 'TESTNET'): void {
    const normalizedEnv = environment.toLowerCase() as 'mainnet' | 'testnet';

    if (this.currentEnvironment === normalizedEnv) {
      console.log(`Already using ${normalizedEnv} WebSocket`);
      return;
    }

    console.log(`Switching WebSocket from ${this.currentEnvironment} to ${normalizedEnv}`);
    this.currentEnvironment = normalizedEnv;

    // If currently connected, disconnect and reconnect with new environment
    if (this.socket$ && !this.socket$.closed) {
      const activeSubscriptions = this.getActiveSubscriptions();
      console.log('Reconnecting with active subscriptions:', activeSubscriptions);

      this.disconnect();

      // Give a moment for clean disconnect
      setTimeout(() => {
        this.connect();
      }, 500);
    }
  }

  /**
   * Get current environment
   */
  getCurrentEnvironment(): 'mainnet' | 'testnet' {
    return this.currentEnvironment;
  }

  /**
   * Connect to Bybit WebSocket
   */
  private connect(): void {
    if (this.socket$ && !this.socket$.closed) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = this.WS_URLS[this.currentEnvironment];
    console.log(`Connecting to Bybit WebSocket (${this.currentEnvironment}):`, wsUrl);
    this.connectionState$.next('connecting');

    this.socket$ = webSocket({
      url: wsUrl,
      openObserver: {
        next: () => {
          console.log(`✅ Connected to Bybit V5 WebSocket (${this.currentEnvironment}):`, wsUrl);
          this.connectionState$.next('connected');
          this.startPing(); // Start ping immediately after connection
        }
      },
      closeObserver: {
        next: (event) => {
          console.log('❌ Disconnected from Bybit WebSocket:', event);
          this.connectionState$.next('disconnected');
        }
      }
    });

    // Handle incoming messages
    this.socket$.pipe(
      takeUntil(this.destroy$),
      catchError(error => {
        console.error('WebSocket error:', error);
        this.connectionState$.next('disconnected');

        // Auto-reconnect after 5 seconds
        timer(5000).pipe(takeUntil(this.destroy$)).subscribe(() => {
          console.log('Attempting to reconnect...');
          this.connect();
        });

        return EMPTY;
      })
    ).subscribe((message: BybitWsMessage) => {
      this.handleMessage(message);
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.stopPing();
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    this.subscriptions.clear();
    this.connectionState$.next('disconnected');
    console.log('🔌 WebSocket disconnected');
  }

  /**
   * Subscribe to kline data for a specific symbol and interval
   */
  subscribeToKline(symbol: string, interval: string = '1'): Observable<CandlestickData> {
    const topic = `kline.${interval}.${symbol}`;
    const subscriptionKey = `${symbol}_${interval}`;

    console.log(`[WS SERVICE] subscribeToKline called - topic: ${topic}, key: ${subscriptionKey}`);

    // Create or get existing subject for this subscription
    if (!this.subscriptions.has(subscriptionKey)) {
      console.log(`[WS SERVICE] Creating new Subject for ${subscriptionKey}`);
      this.subscriptions.set(subscriptionKey, new Subject<CandlestickData>());
    } else {
      console.log(`[WS SERVICE] Reusing existing Subject for ${subscriptionKey}`);
    }

    // Connect if not already connected
    if (!this.socket$ || this.socket$.closed) {
      console.log('[WS SERVICE] WebSocket not connected, initiating connection...');
      this.connect();
    } else {
      console.log('[WS SERVICE] WebSocket already connected');
    }

    // Wait for connection and then subscribe
    console.log('[WS SERVICE] Setting up connection state listener...');
    this.connectionState$.pipe(
      filter(state => {
        console.log(`[WS SERVICE] Connection state changed: ${state}`);
        return state === 'connected';
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      console.log(`[WS SERVICE] Connection established, sending subscription for ${topic}`);
      this.sendSubscription(topic);
    });

    const observable = this.subscriptions.get(subscriptionKey)!.asObservable();
    console.log(`[WS SERVICE] Returning observable for ${subscriptionKey}`);

    // Add logging to the returned observable
    return new Observable<CandlestickData>(observer => {
      console.log(`[WS SERVICE] Observer subscribed to ${subscriptionKey}`);

      const subscription = observable.subscribe({
        next: (value) => {
          console.log(`[WS SERVICE] Passing data through observable for ${subscriptionKey}:`, value);
          observer.next(value);
        },
        error: (err) => {
          console.error(`[WS SERVICE] Error in observable for ${subscriptionKey}:`, err);
          observer.error(err);
        },
        complete: () => {
          console.log(`[WS SERVICE] Observable completed for ${subscriptionKey}`);
          observer.complete();
        }
      });

      return () => {
        console.log(`[WS SERVICE] Observer unsubscribed from ${subscriptionKey}`);
        subscription.unsubscribe();
      };
    });
  }

  /**
   * Unsubscribe from kline data
   */
  unsubscribeFromKline(symbol: string, interval: string = '1'): void {
    const topic = `kline.${interval}.${symbol}`;
    const subscriptionKey = `${symbol}_${interval}`;

    console.log(`Unsubscribing from kline data: ${topic}`);

    // Send unsubscribe message
    if (this.socket$ && !this.socket$.closed) {
      this.sendUnsubscription(topic);
    }

    // Clean up subscription
    const subject = this.subscriptions.get(subscriptionKey);
    if (subject) {
      subject.complete();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Send subscription message
   */
  private sendSubscription(topic: string): void {
    if (!this.socket$ || this.socket$.closed) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    const subscribeMessage = {
      op: 'subscribe',
      args: [topic]
    };

    console.log('Sending subscription:', subscribeMessage);
    this.socket$.next(subscribeMessage);
  }

  /**
   * Send unsubscription message
   */
  private sendUnsubscription(topic: string): void {
    if (!this.socket$ || this.socket$.closed) {
      console.error('Cannot unsubscribe: WebSocket not connected');
      return;
    }

    const unsubscribeMessage = {
      op: 'unsubscribe',
      args: [topic]
    };

    console.log('Sending unsubscription:', unsubscribeMessage);
    this.socket$.next(unsubscribeMessage);
  }

  /**
   * Handle incoming WebSocket messages (Bybit V5 format)
   */
  private handleMessage(message: any): void {
    try {
      // Handle pong responses
      if (message.op === 'pong') {
        console.log('🏓 Received pong from Bybit WebSocket');
        return;
      }

      // Handle subscription confirmations
      if (message.success !== undefined) {
        if (message.success) {
          console.log('✅ Subscription confirmed:', message);
          if (message.conn_id) {
            console.log('📡 Connection ID:', message.conn_id);
          }
        } else {
          console.error('❌ Subscription failed:', message);
        }
        return;
      }

      // Handle data updates by topic
      if (message.topic && message.data) {
        console.log('[WS SERVICE] Received data message:', {
          topic: message.topic,
          type: message.type,
          dataLength: Array.isArray(message.data) ? message.data.length : 1,
          timestamp: message.ts
        });

        if (message.topic.startsWith('kline.')) {
          console.log('[WS SERVICE] Routing to kline handler, raw data:', JSON.stringify(message.data).substring(0, 500));
          this.handleKlineData(message);
        } else if (message.topic.startsWith('tickers.')) {
          this.handleTickerData(message);
        } else if (message.topic.startsWith('orderbook.')) {
          this.handleOrderbookData(message);
        } else if (message.topic.startsWith('publicTrade.')) {
          this.handleTradeData(message);
        } else {
          console.log('📨 Unknown topic:', message.topic, message);
        }
      } else if (message.type === 'error') {
        console.error('❌ WebSocket error message:', message);
      } else {
        console.log('📨 Received message:', message);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error, message);
    }
  }

  /**
   * Handle kline data from WebSocket
   */
  private handleKlineData(message: BybitWsMessage): void {
    try {
      console.log('[WS SERVICE] Received kline message:', message.topic);

      const topicParts = message.topic.split('.');
      if (topicParts.length < 3) {
        console.error('[WS SERVICE] Invalid kline topic format:', message.topic);
        return;
      }

      const interval = topicParts[1];
      const symbol = topicParts[2];
      const subscriptionKey = `${symbol}_${interval}`;

      console.log(`[WS SERVICE] Looking for subscription: ${subscriptionKey}`);
      console.log('[WS SERVICE] Active subscriptions:', Array.from(this.subscriptions.keys()));

      // Find the subscription subject
      const subject = this.subscriptions.get(subscriptionKey);
      if (!subject) {
        console.warn(`[WS SERVICE] No subscription found for ${subscriptionKey}`);
        console.warn('[WS SERVICE] Available subscriptions:', this.getActiveSubscriptions());
        return;
      }

      console.log(`[WS SERVICE] Found subject for ${subscriptionKey}, processing data...`);

      // Process each kline data point
      const klineDataArray = Array.isArray(message.data) ? message.data : [message.data];
      console.log(`[WS SERVICE] Processing ${klineDataArray.length} kline data points`);

      klineDataArray.forEach((klineData: any) => {
        const candlestick: CandlestickData = {
          time: Math.floor(klineData.start / 1000), // Use start time, not closeTime
          open: parseFloat(klineData.open),
          high: parseFloat(klineData.high),
          low: parseFloat(klineData.low),
          close: parseFloat(klineData.close),
          volume: parseFloat(klineData.volume)
        };

        console.log(`[WS SERVICE] Emitting kline update for ${symbol} (${interval}):`, {
          time: new Date(candlestick.time * 1000).toISOString(),
          open: candlestick.open,
          high: candlestick.high,
          low: candlestick.low,
          close: candlestick.close,
          volume: candlestick.volume,
          confirmed: klineData.confirm
        });

        console.log(`[WS SERVICE] Calling subject.next() for ${subscriptionKey}`);
        subject.next(candlestick);
        console.log(`[WS SERVICE] subject.next() completed for ${subscriptionKey}`);
      });
    } catch (error) {
      console.error('[WS SERVICE] Error processing kline data:', error, message);
    }
  }

  /**
   * Get list of active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState$.value === 'connected';
  }

  /**
   * Ping to keep connection alive (Bybit V5 format)
   */
  private ping(): void {
    if (this.socket$ && !this.socket$.closed) {
      this.socket$.next({ op: 'ping' });
      console.log('🏓 Sent ping to Bybit WebSocket');
    }
  }

  /**
   * Start periodic ping to keep connection alive (Bybit V5 requires ping every 20s)
   */
  private startPing(): void {
    // Clear any existing ping timer
    if (this.pingTimer) {
      this.pingTimer.unsubscribe();
    }

    // Start pinging every 20 seconds as per Bybit documentation
    this.pingTimer = timer(20000, 20000) // First ping after 20s, then every 20s
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isConnected()) {
          this.ping();
        }
      });
  }

  /**
   * Stop ping timer
   */
  private stopPing(): void {
    if (this.pingTimer) {
      this.pingTimer.unsubscribe();
      this.pingTimer = undefined;
    }
  }

  /**
   * Subscribe to ticker data for a specific symbol (Bybit V5 format)
   */
  subscribeToTicker(symbol: string): Observable<TickerData> {
    const topic = `tickers.${symbol}`;
    const subscriptionKey = `ticker_${symbol}`;

    console.log(`📊 Subscribing to ticker data: ${topic}`);

    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Subject<TickerData>());
    }

    if (!this.socket$ || this.socket$.closed) {
      this.connect();
    }

    this.connectionState$.pipe(
      filter(state => state === 'connected'),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sendSubscription(topic);
    });

    return this.subscriptions.get(subscriptionKey)!.asObservable();
  }

  /**
   * Subscribe to orderbook data for a specific symbol (Bybit V5 format)
   */
  subscribeToOrderbook(symbol: string, depth: number = 50): Observable<OrderbookData> {
    const topic = `orderbook.${depth}.${symbol}`;
    const subscriptionKey = `orderbook_${symbol}_${depth}`;

    console.log(`📈 Subscribing to orderbook data: ${topic}`);

    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Subject<OrderbookData>());
    }

    if (!this.socket$ || this.socket$.closed) {
      this.connect();
    }

    this.connectionState$.pipe(
      filter(state => state === 'connected'),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sendSubscription(topic);
    });

    return this.subscriptions.get(subscriptionKey)!.asObservable();
  }

  /**
   * Subscribe to trade data for a specific symbol (Bybit V5 format)
   */
  subscribeToTrades(symbol: string): Observable<TradeData> {
    const topic = `publicTrade.${symbol}`;
    const subscriptionKey = `trades_${symbol}`;

    console.log(`💰 Subscribing to trade data: ${topic}`);

    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Subject<TradeData>());
    }

    if (!this.socket$ || this.socket$.closed) {
      this.connect();
    }

    this.connectionState$.pipe(
      filter(state => state === 'connected'),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.sendSubscription(topic);
    });

    return this.subscriptions.get(subscriptionKey)!.asObservable();
  }

  /**
   * Handle ticker data from WebSocket
   */
  private handleTickerData(message: BybitWsMessage): void {
    try {
      const topicParts = message.topic.split('.');
      if (topicParts.length < 2) {
        console.error('Invalid ticker topic format:', message.topic);
        return;
      }

      const symbol = topicParts[1];
      const subscriptionKey = `ticker_${symbol}`;
      const subject = this.subscriptions.get(subscriptionKey);

      if (!subject) {
        console.warn(`No ticker subscription found for ${subscriptionKey}`);
        return;
      }

      const rawData: any = Array.isArray(message.data) ? message.data[0] : message.data;
      if (!rawData) return;

      const tickerData: TickerData = {
        symbol: rawData.symbol || symbol,
        lastPrice: parseFloat(rawData.lastPrice || '0'),
        highPrice24h: parseFloat(rawData.highPrice24h || '0'),
        lowPrice24h: parseFloat(rawData.lowPrice24h || '0'),
        prevPrice24h: parseFloat(rawData.prevPrice24h || '0'),
        volume24h: parseFloat(rawData.volume24h || '0'),
        turnover24h: parseFloat(rawData.turnover24h || '0'),
        price24hPcnt: parseFloat(rawData.price24hPcnt || '0'),
        usdIndexPrice: parseFloat(rawData.usdIndexPrice || '0'),
        timestamp: message.ts
      };

      this.dataCache.set(subscriptionKey, tickerData);
      subject.next(tickerData);

      console.log(`📈 Ticker update for ${symbol}:`, {
        lastPrice: tickerData.lastPrice,
        change24h: tickerData.price24hPcnt
      });
    } catch (error) {
      console.error('Error processing ticker data:', error, message);
    }
  }

  /**
   * Handle orderbook data from WebSocket
   */
  private handleOrderbookData(message: BybitWsMessage): void {
    try {
      const topicParts = message.topic.split('.');
      if (topicParts.length < 3) {
        console.error('Invalid orderbook topic format:', message.topic);
        return;
      }

      const depth = topicParts[1];
      const symbol = topicParts[2];
      const subscriptionKey = `orderbook_${symbol}_${depth}`;
      const subject = this.subscriptions.get(subscriptionKey);

      if (!subject) {
        console.warn(`No orderbook subscription found for ${subscriptionKey}`);
        return;
      }

      const rawData = message.data as BybitWsOrderbookData;
      if (!rawData) return;

      const orderbookData: OrderbookData = {
        symbol: rawData.symbol,
        bids: rawData.bids.map(([price, size]) => ({
          price: parseFloat(price),
          size: parseFloat(size)
        })),
        asks: rawData.asks.map(([price, size]) => ({
          price: parseFloat(price),
          size: parseFloat(size)
        })),
        timestamp: rawData.ts
      };

      this.dataCache.set(subscriptionKey, orderbookData);
      subject.next(orderbookData);

      console.log(`📊 Orderbook update for ${symbol}:`, {
        bestBid: orderbookData.bids[0]?.price,
        bestAsk: orderbookData.asks[0]?.price,
        spread: orderbookData.asks[0]?.price - orderbookData.bids[0]?.price
      });
    } catch (error) {
      console.error('Error processing orderbook data:', error, message);
    }
  }

  /**
   * Handle trade data from WebSocket
   */
  private handleTradeData(message: BybitWsMessage): void {
    try {
      const topicParts = message.topic.split('.');
      if (topicParts.length < 2) {
        console.error('Invalid trade topic format:', message.topic);
        return;
      }

      const symbol = topicParts[1];
      const subscriptionKey = `trades_${symbol}`;
      const subject = this.subscriptions.get(subscriptionKey);

      if (!subject) {
        console.warn(`No trade subscription found for ${subscriptionKey}`);
        return;
      }

      const tradesArray = Array.isArray(message.data) ? message.data : [message.data];

      tradesArray.forEach((rawTrade: any) => {
        const tradeData: TradeData = {
          symbol: rawTrade.symbol,
          execId: rawTrade.execId,
          price: parseFloat(rawTrade.price),
          size: parseFloat(rawTrade.size),
          side: rawTrade.side,
          timestamp: rawTrade.time,
          isBlockTrade: rawTrade.isBlockTrade
        };

        this.dataCache.set(`${subscriptionKey}_${rawTrade.execId}`, tradeData);
        subject.next(tradeData);

        console.log(`💹 Trade for ${symbol}:`, {
          price: tradeData.price,
          size: tradeData.size,
          side: tradeData.side
        });
      });
    } catch (error) {
      console.error('Error processing trade data:', error, message);
    }
  }

  /**
   * Unsubscribe from ticker data
   */
  unsubscribeFromTicker(symbol: string): void {
    const topic = `tickers.${symbol}`;
    const subscriptionKey = `ticker_${symbol}`;

    if (this.socket$ && !this.socket$.closed) {
      this.sendUnsubscription(topic);
    }

    const subject = this.subscriptions.get(subscriptionKey);
    if (subject) {
      subject.complete();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Unsubscribe from orderbook data
   */
  unsubscribeFromOrderbook(symbol: string, depth: number = 50): void {
    const topic = `orderbook.${depth}.${symbol}`;
    const subscriptionKey = `orderbook_${symbol}_${depth}`;

    if (this.socket$ && !this.socket$.closed) {
      this.sendUnsubscription(topic);
    }

    const subject = this.subscriptions.get(subscriptionKey);
    if (subject) {
      subject.complete();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Unsubscribe from trade data
   */
  unsubscribeFromTrades(symbol: string): void {
    const topic = `publicTrade.${symbol}`;
    const subscriptionKey = `trades_${symbol}`;

    if (this.socket$ && !this.socket$.closed) {
      this.sendUnsubscription(topic);
    }

    const subject = this.subscriptions.get(subscriptionKey);
    if (subject) {
      subject.complete();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Get cached data for a subscription
   */
  getCachedData(subscriptionKey: string): any {
    return this.dataCache.get(subscriptionKey);
  }

  /**
   * Clear cache for a specific subscription or all cache
   */
  clearCache(subscriptionKey?: string): void {
    if (subscriptionKey) {
      this.dataCache.delete(subscriptionKey);
    } else {
      this.dataCache.clear();
    }
  }
}