/**
 * BingX Spot WebSocket Adapter
 *
 * Handles WebSocket connections and price subscriptions for BingX Spot exchange.
 * Documentation: https://bingx-api.github.io/docs/#/spot/socket/overview
 *
 * WebSocket URL: wss://open-api-ws.bingx.com/market
 * Format: Subscription-based with JSON messages
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from './base-ws-adapter';

interface BingXSpotTickerMessage {
  e: string; // Event type (e.g., "24hrTicker")
  E: number; // Event time
  s: string; // Symbol (e.g., "BTC-USDT")
  c: string; // Close price (last price)
  p: string; // Price change
  P: string; // Price change percent
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded volume
  q: string; // Total traded quote volume
}

export class BingXSpotWebSocketAdapter extends BaseWebSocketAdapter {
  private wsClient: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private wsUrl = 'wss://open-api-ws.bingx.com/market';
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  /**
   * Connect to BingX Spot WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.wsClient) {
      console.log('[BingXSpotWSAdapter] Already connected');
      return;
    }

    try {
      console.log('[BingXSpotWSAdapter] Connecting to WebSocket...');

      this.wsClient = new WebSocket(this.wsUrl);

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.wsClient!.on('open', () => {
          clearTimeout(timeout);
          console.log('[BingXSpotWSAdapter] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Start ping interval (every 30 seconds)
          this.startPingInterval();

          resolve();
        });

        this.wsClient!.on('error', (error: Error) => {
          clearTimeout(timeout);
          console.error('[BingXSpotWSAdapter] WebSocket error:', error);
          reject(error);
        });
      });

      // Set up event handlers
      this.wsClient.on('message', (data: Buffer) => {
        this.handleMessage(data);
      });

      this.wsClient.on('close', (code: number, reason: string) => {
        console.log('[BingXSpotWSAdapter] WebSocket closed:', { code, reason: reason.toString() });
        this.isConnected = false;
        this.stopPingInterval();
        this.handleReconnect();
      });

      this.wsClient.on('error', (error: Error) => {
        console.error('[BingXSpotWSAdapter] WebSocket error:', error.message);
        this.emit('error', error);
      });

      console.log('[BingXSpotWSAdapter] WebSocket connected successfully');
    } catch (error) {
      console.error('[BingXSpotWSAdapter] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from BingX Spot WebSocket
   */
  async disconnect(): Promise<void> {
    this.stopPingInterval();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.wsClient) {
      try {
        this.wsClient.close();
        console.log('[BingXSpotWSAdapter] Closed WebSocket connection');
      } catch (error) {
        console.error('[BingXSpotWSAdapter] Error closing connection:', error);
      }
    }

    this.subscribedSymbols.clear();
    this.subscribers.clear();
    this.isConnected = false;
    this.wsClient = null;
  }

  /**
   * Subscribe to price updates for a symbol
   * BingX Spot format: "BTC-USDT" (hyphenated)
   */
  async subscribe(symbol: string): Promise<void> {
    if (!this.wsClient || !this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    try {
      // Convert from standard format (BTCUSDT) to BingX format (BTC-USDT)
      const bingxSymbol = this.convertToBingXFormat(symbol);

      // Subscribe to ticker stream
      const subscribeMessage = {
        id: `sub_${Date.now()}`,
        reqType: 'sub',
        dataType: `${bingxSymbol}@ticker`,
      };

      this.wsClient.send(JSON.stringify(subscribeMessage));
      this.subscribedSymbols.add(symbol);
      console.log(`[BingXSpotWSAdapter] Subscribed to ${bingxSymbol} (${symbol})`);
    } catch (error) {
      console.error(`[BingXSpotWSAdapter] Error subscribing to ${symbol}:`, error);
      throw error;
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
      const bingxSymbol = this.convertToBingXFormat(symbol);

      const unsubscribeMessage = {
        id: `unsub_${Date.now()}`,
        reqType: 'unsub',
        dataType: `${bingxSymbol}@ticker`,
      };

      this.wsClient.send(JSON.stringify(unsubscribeMessage));
      this.subscribedSymbols.delete(symbol);
      console.log(`[BingXSpotWSAdapter] Unsubscribed from ${bingxSymbol}`);
    } catch (error) {
      console.error(
        `[BingXSpotWSAdapter] Error unsubscribing from ${symbol}:`,
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

      // Handle different message types
      if (message.dataType && message.dataType.includes('@ticker')) {
        this.handleTickerUpdate(message);
      } else if (message.ping) {
        // Respond to ping
        this.handlePing(message.ping);
      } else if (message.code !== undefined) {
        // Subscription response
        if (message.code === 0) {
          console.log('[BingXSpotWSAdapter] Subscription successful:', message.dataType);
        } else {
          console.error('[BingXSpotWSAdapter] Subscription error:', message);
        }
      }
    } catch (error) {
      console.error('[BingXSpotWSAdapter] Error handling message:', error);
    }
  }

  /**
   * Handle ticker update
   */
  private handleTickerUpdate(message: any): void {
    try {
      const tickerData: BingXSpotTickerMessage = message.data;

      if (!tickerData || !tickerData.s || !tickerData.c) {
        return;
      }

      // Convert BingX symbol format (BTC-USDT) to standard format (BTCUSDT)
      const standardSymbol = tickerData.s.replace('-', '');
      const price = parseFloat(tickerData.c); // 'c' is last price

      if (!isNaN(price) && price > 0) {
        // Notify subscribers with standard symbol format
        this.notifySubscribers(standardSymbol, price);
      }
    } catch (error) {
      console.error('[BingXSpotWSAdapter] Error handling ticker update:', error);
    }
  }

  /**
   * Handle ping message
   */
  private handlePing(ping: number): void {
    if (this.wsClient && this.isConnected) {
      try {
        this.wsClient.send(JSON.stringify({ pong: ping }));
      } catch (error) {
        console.error('[BingXSpotWSAdapter] Error sending pong:', error);
      }
    }
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.wsClient && this.isConnected) {
        try {
          this.wsClient.ping();
        } catch (error) {
          console.error('[BingXSpotWSAdapter] Error sending ping:', error);
        }
      }
    }, 30000); // Every 30 seconds
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
      console.error('[BingXSpotWSAdapter] Max reconnect attempts reached');
      this.emit('error', new Error('Max reconnect attempts reached'));
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[BingXSpotWSAdapter] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
        await this.resubscribeAll();
      } catch (error) {
        console.error('[BingXSpotWSAdapter] Reconnection failed:', error);
        this.handleReconnect(); // Try again
      }
    }, delay);
  }

  /**
   * Resubscribe to all symbols after reconnection
   */
  private async resubscribeAll(): Promise<void> {
    const symbols = Array.from(this.subscribedSymbols);
    console.log(`[BingXSpotWSAdapter] Resubscribing to ${symbols.length} symbols`);

    for (const symbol of symbols) {
      try {
        await this.subscribe(symbol);
      } catch (error) {
        console.error(
          `[BingXSpotWSAdapter] Error resubscribing to ${symbol}:`,
          error
        );
      }
    }
  }

  /**
   * Convert standard format (BTCUSDT) to BingX format (BTC-USDT)
   */
  private convertToBingXFormat(symbol: string): string {
    const quoteCurrencies = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];

    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.substring(0, symbol.length - quote.length);
        return `${base}-${quote}`;
      }
    }

    // Fallback: assume last 4 characters are quote currency
    const base = symbol.substring(0, symbol.length - 4);
    const quote = symbol.substring(symbol.length - 4);
    return `${base}-${quote}`;
  }
}
