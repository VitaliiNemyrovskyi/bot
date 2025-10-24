/**
 * Binance Spot WebSocket Adapter
 *
 * Handles WebSocket connections and price subscriptions for Binance Spot exchange.
 * Documentation: https://binance-docs.github.io/apidocs/spot/en/#websocket-market-streams
 *
 * WebSocket URL: wss://stream.binance.com:9443/ws
 * Format: Individual streams with symbol@ticker
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from './base-ws-adapter';

interface BinanceSpotTickerMessage {
  e: string; // Event type (e.g., "24hrTicker")
  E: number; // Event time
  s: string; // Symbol (e.g., "BTCUSDT")
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // First trade(F)-1 price (first trade before the 24hr rolling window)
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

export class BinanceSpotWebSocketAdapter extends BaseWebSocketAdapter {
  private wsClient: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private wsUrl = 'wss://stream.binance.com:9443/stream'; // Combined streams endpoint
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pendingSubscriptions: string[] = [];
  private readonly MAX_SUBSCRIPTIONS_PER_BATCH = 100; // Binance limit is ~200, use 100 to be safe
  private subscriptionDebounceTimer: NodeJS.Timeout | null = null;
  private readonly SUBSCRIPTION_DEBOUNCE_MS = 500; // Wait 500ms after last subscription to flush remaining

  constructor() {
    super();
  }

  /**
   * Connect to Binance Spot WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.wsClient) {
      console.log('[BinanceSpotWSAdapter] Already connected');
      return;
    }

    try {
      console.log('[BinanceSpotWSAdapter] Connecting to WebSocket...');

      this.wsClient = new WebSocket(this.wsUrl);

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.wsClient!.on('open', () => {
          clearTimeout(timeout);
          console.log('[BinanceSpotWSAdapter] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Start ping interval (every 3 minutes as per Binance requirements)
          this.startPingInterval();

          // Flush any pending subscriptions that were queued before connection
          if (this.pendingSubscriptions.length > 0) {
            console.log(`[BinanceSpotWSAdapter] Flushing ${this.pendingSubscriptions.length} pending subscriptions`);
            this.flushPendingSubscriptions().catch((error) => {
              console.error('[BinanceSpotWSAdapter] Error flushing pending subscriptions:', error);
            });
          }

          resolve();
        });

        this.wsClient!.on('error', (error: Error) => {
          clearTimeout(timeout);
          console.error('[BinanceSpotWSAdapter] WebSocket error:', error);
          reject(error);
        });
      });

      // Set up event handlers
      this.wsClient.on('message', (data: Buffer) => {
        this.handleMessage(data);
      });

      this.wsClient.on('close', (code: number, reason: string) => {
        console.log('[BinanceSpotWSAdapter] WebSocket closed:', { code, reason: reason.toString() });
        this.isConnected = false;
        this.stopPingInterval();
        this.handleReconnect();
      });

      this.wsClient.on('error', (error: Error) => {
        console.error('[BinanceSpotWSAdapter] WebSocket error:', error.message);
        this.emit('error', error);
      });

      this.wsClient.on('pong', () => {
        // Pong received from server
      });

      console.log('[BinanceSpotWSAdapter] WebSocket connected successfully');
    } catch (error) {
      console.error('[BinanceSpotWSAdapter] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Binance Spot WebSocket
   */
  async disconnect(): Promise<void> {
    this.stopPingInterval();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.subscriptionDebounceTimer) {
      clearTimeout(this.subscriptionDebounceTimer);
      this.subscriptionDebounceTimer = null;
    }

    if (this.wsClient) {
      try {
        this.wsClient.close();
        console.log('[BinanceSpotWSAdapter] Closed WebSocket connection');
      } catch (error) {
        console.error('[BinanceSpotWSAdapter] Error closing connection:', error);
      }
    }

    this.subscribedSymbols.clear();
    this.subscribers.clear();
    this.pendingSubscriptions = [];
    this.isConnected = false;
    this.wsClient = null;
  }

  /**
   * Subscribe to price updates for a symbol
   * Binance Spot format: "btcusdt@ticker" (lowercase)
   */
  async subscribe(symbol: string): Promise<void> {
    // Always convert to Binance format first for consistency
    const binanceSymbol = this.convertToBinanceFormat(symbol);
    this.subscribedSymbols.add(symbol);

    if (!this.wsClient || !this.isConnected) {
      // Queue subscription for later (will be flushed after connection)
      this.pendingSubscriptions.push(binanceSymbol);
      return;
    }

    try {
      // Add to pending subscriptions
      this.pendingSubscriptions.push(binanceSymbol);

      // If we have enough subscriptions, send them in a batch immediately
      if (this.pendingSubscriptions.length >= this.MAX_SUBSCRIPTIONS_PER_BATCH) {
        await this.flushPendingSubscriptions();
      }

      // Set up debounce timer to flush remaining subscriptions after burst ends
      // This ensures we don't leave pending subscriptions unflushed (e.g., last 7 of 507)
      if (this.subscriptionDebounceTimer) {
        clearTimeout(this.subscriptionDebounceTimer);
      }
      this.subscriptionDebounceTimer = setTimeout(() => {
        if (this.pendingSubscriptions.length > 0) {
          console.log(`[BinanceSpotWSAdapter] Debounce timer triggered, flushing ${this.pendingSubscriptions.length} remaining subscriptions`);
          this.flushPendingSubscriptions().catch((error) => {
            console.error('[BinanceSpotWSAdapter] Error in debounced flush:', error);
          });
        }
        this.subscriptionDebounceTimer = null;
      }, this.SUBSCRIPTION_DEBOUNCE_MS);
    } catch (error) {
      console.error(`[BinanceSpotWSAdapter] Error subscribing to ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Flush pending subscriptions in a batch
   */
  private async flushPendingSubscriptions(): Promise<void> {
    if (this.pendingSubscriptions.length === 0 || !this.wsClient || !this.isConnected) {
      return;
    }

    try {
      const batch = this.pendingSubscriptions.splice(0, this.MAX_SUBSCRIPTIONS_PER_BATCH);

      // Subscribe to ticker streams in batch
      const subscribeMessage = {
        method: 'SUBSCRIBE',
        params: batch,
        id: Date.now(),
      };

      this.wsClient.send(JSON.stringify(subscribeMessage));
      console.log(`[BinanceSpotWSAdapter] Subscribed to ${batch.length} symbols in batch`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

      // If there are more pending subscriptions, flush them
      if (this.pendingSubscriptions.length > 0) {
        await this.flushPendingSubscriptions();
      }
    } catch (error) {
      console.error(`[BinanceSpotWSAdapter] Error flushing subscriptions:`, error);
    }
  }

  /**
   * Unsubscribe from price updates for a symbol
   */
  async unsubscribe(symbol: string): Promise<void> {
    if (!this.wsClient || !this.isConnected) {
      return;
    }

    try {
      const binanceSymbol = this.convertToBinanceFormat(symbol);

      const unsubscribeMessage = {
        method: 'UNSUBSCRIBE',
        params: [binanceSymbol],
        id: Date.now(),
      };

      this.wsClient.send(JSON.stringify(unsubscribeMessage));
      this.subscribedSymbols.delete(symbol);
      console.log(`[BinanceSpotWSAdapter] Unsubscribed from ${binanceSymbol}`);
    } catch (error) {
      console.error(
        `[BinanceSpotWSAdapter] Error unsubscribing from ${symbol}:`,
        error
      );
    }
  }

  /**
   * Check if WebSocket is healthy
   */
  isHealthy(): boolean {
    return this.isConnected && this.wsClient !== null && this.wsClient.readyState === WebSocket.OPEN;
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Combined streams endpoint wraps data in a 'data' field
      if (message.stream && message.data) {
        // Extract the actual ticker message from the wrapper
        const tickerMessage = message.data;

        if (tickerMessage.e === '24hrTicker') {
          this.handleTickerUpdate(tickerMessage);
        }
        return;
      }

      // Handle subscription confirmations and errors
      if (message.result === null && message.id) {
        // Subscription confirmation
        console.log('[BinanceSpotWSAdapter] Subscription confirmed:', message.id);
      } else if (message.error) {
        // Error message
        console.error('[BinanceSpotWSAdapter] Error message:', message.error);
      }
    } catch (error) {
      console.error('[BinanceSpotWSAdapter] Error handling message:', error);
    }
  }

  /**
   * Handle ticker update
   */
  private handleTickerUpdate(message: BinanceSpotTickerMessage): void {
    try {
      if (!message.s || !message.c) {
        return;
      }

      // Symbol is already in standard format (BTCUSDT)
      const standardSymbol = message.s;
      const price = parseFloat(message.c); // 'c' is last price

      // DEBUG: Log first few price updates
      if (Math.random() < 0.001) { // Log ~0.1% of updates to avoid spam
        console.log(`[BinanceSpotWSAdapter] Price update: ${standardSymbol} = ${price}`);
      }

      if (!isNaN(price) && price > 0) {
        // Notify subscribers with standard symbol format
        this.notifySubscribers(standardSymbol, price);
      }
    } catch (error) {
      console.error('[BinanceSpotWSAdapter] Error handling ticker update:', error);
    }
  }

  /**
   * Start ping interval to keep connection alive
   * Binance requires pings every 3 minutes (180 seconds)
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.wsClient && this.isConnected) {
        try {
          this.wsClient.ping();
        } catch (error) {
          console.error('[BinanceSpotWSAdapter] Error sending ping:', error);
        }
      }
    }, 180000); // Every 3 minutes (180 seconds)
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[BinanceSpotWSAdapter] Max reconnect attempts reached');
      this.emit('error', new Error('Max reconnect attempts reached'));
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[BinanceSpotWSAdapter] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
        await this.resubscribeAll();
      } catch (error) {
        console.error('[BinanceSpotWSAdapter] Reconnection failed:', error);
        this.handleReconnect(); // Try again
      }
    }, delay);
  }

  /**
   * Resubscribe to all symbols after reconnection
   */
  private async resubscribeAll(): Promise<void> {
    const symbols = Array.from(this.subscribedSymbols);
    console.log(`[BinanceSpotWSAdapter] Resubscribing to ${symbols.length} symbols`);

    for (const symbol of symbols) {
      try {
        await this.subscribe(symbol);
      } catch (error) {
        console.error(
          `[BinanceSpotWSAdapter] Error resubscribing to ${symbol}:`,
          error
        );
      }
    }
  }

  /**
   * Convert standard format (BTCUSDT) to Binance format (btcusdt@ticker)
   */
  private convertToBinanceFormat(symbol: string): string {
    return `${symbol.toLowerCase()}@ticker`;
  }
}
