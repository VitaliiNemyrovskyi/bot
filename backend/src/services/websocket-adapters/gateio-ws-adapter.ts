/**
 * Gate.io WebSocket Adapter
 *
 * Handles WebSocket connections and price subscriptions for Gate.io Spot exchange.
 * Documentation: https://www.gate.io/docs/developers/apiv4/ws/en/
 *
 * WebSocket URL: wss://api.gateio.ws/ws/v4/
 * Channel: spot.tickers
 */

import WebSocket from 'ws';
import { BaseWebSocketAdapter } from './base-ws-adapter';

interface GateIOTickerMessage {
  time: number;
  channel: string;
  event: string;
  result: {
    currency_pair: string;
    last: string;
    lowest_ask: string;
    highest_bid: string;
    change_percentage: string;
    base_volume: string;
    quote_volume: string;
    high_24h: string;
    low_24h: string;
  };
}

export class GateIOWebSocketAdapter extends BaseWebSocketAdapter {
  private wsClient: WebSocket | null = null;
  private subscribedSymbols = new Set<string>();
  private wsUrl = 'wss://api.gateio.ws/ws/v4/';
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  /**
   * Connect to Gate.io WebSocket
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.wsClient) {
      console.log('[GateIOWSAdapter] Already connected');
      return;
    }

    try {
      console.log('[GateIOWSAdapter] Connecting to WebSocket...');

      this.wsClient = new WebSocket(this.wsUrl);

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);

        this.wsClient!.on('open', () => {
          clearTimeout(timeout);
          console.log('[GateIOWSAdapter] WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Start ping interval (every 20 seconds)
          this.startPingInterval();

          resolve();
        });

        this.wsClient!.on('error', (error: Error) => {
          clearTimeout(timeout);
          console.error('[GateIOWSAdapter] WebSocket error:', error);
          reject(error);
        });
      });

      // Set up event handlers
      this.wsClient.on('message', (data: Buffer) => {
        this.handleMessage(data);
      });

      this.wsClient.on('close', (code: number, reason: string) => {
        console.log('[GateIOWSAdapter] WebSocket closed:', { code, reason: reason.toString() });
        this.isConnected = false;
        this.stopPingInterval();
        this.handleReconnect();
      });

      this.wsClient.on('error', (error: Error) => {
        console.error('[GateIOWSAdapter] WebSocket error:', error.message);
        this.emit('error', error);
      });

      console.log('[GateIOWSAdapter] WebSocket connected successfully');
    } catch (error) {
      console.error('[GateIOWSAdapter] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Gate.io WebSocket
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
        console.log('[GateIOWSAdapter] Closed WebSocket connection');
      } catch (error) {
        console.error('[GateIOWSAdapter] Error closing connection:', error);
      }
    }

    this.subscribedSymbols.clear();
    this.subscribers.clear();
    this.isConnected = false;
    this.wsClient = null;
  }

  /**
   * Subscribe to price updates for a symbol
   * Gate.io Spot format: "BTC_USDT" (underscore)
   */
  async subscribe(symbol: string): Promise<void> {
    if (!this.wsClient || !this.isConnected) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    try {
      // Convert from standard format (BTCUSDT) to Gate.io format (BTC_USDT)
      const gateioSymbol = this.convertToGateIOFormat(symbol);

      // Subscribe to ticker stream
      const subscribeMessage = {
        time: Math.floor(Date.now() / 1000),
        channel: 'spot.tickers',
        event: 'subscribe',
        payload: [gateioSymbol],
      };

      this.wsClient.send(JSON.stringify(subscribeMessage));
      this.subscribedSymbols.add(symbol);
      console.log(`[GateIOWSAdapter] Subscribed to ${gateioSymbol} (${symbol})`);
    } catch (error) {
      console.error(`[GateIOWSAdapter] Error subscribing to ${symbol}:`, error);
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
      const gateioSymbol = this.convertToGateIOFormat(symbol);

      const unsubscribeMessage = {
        time: Math.floor(Date.now() / 1000),
        channel: 'spot.tickers',
        event: 'unsubscribe',
        payload: [gateioSymbol],
      };

      this.wsClient.send(JSON.stringify(unsubscribeMessage));
      this.subscribedSymbols.delete(symbol);
      console.log(`[GateIOWSAdapter] Unsubscribed from ${gateioSymbol}`);
    } catch (error) {
      console.error(
        `[GateIOWSAdapter] Error unsubscribing from ${symbol}:`,
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
      const message: GateIOTickerMessage = JSON.parse(data.toString());

      // Handle different message types
      if (message.channel === 'spot.tickers' && message.event === 'update' && message.result) {
        this.handleTickerUpdate(message);
      } else if (message.event === 'subscribe') {
        console.log('[GateIOWSAdapter] Subscription successful:', message.result);
      } else if (message.event === 'unsubscribe') {
        console.log('[GateIOWSAdapter] Unsubscription successful:', message.result);
      }
    } catch (error) {
      console.error('[GateIOWSAdapter] Error handling message:', error);
    }
  }

  /**
   * Handle ticker update
   */
  private handleTickerUpdate(message: GateIOTickerMessage): void {
    try {
      const tickerData = message.result;

      if (!tickerData || !tickerData.currency_pair || !tickerData.last) {
        return;
      }

      // Convert Gate.io symbol format (BTC_USDT) to standard format (BTCUSDT)
      const standardSymbol = tickerData.currency_pair.replace('_', '');
      const price = parseFloat(tickerData.last);

      if (!isNaN(price) && price > 0) {
        // Notify subscribers with standard symbol format
        this.notifySubscribers(standardSymbol, price);
      }
    } catch (error) {
      console.error('[GateIOWSAdapter] Error handling ticker update:', error);
    }
  }

  /**
   * Start ping interval to keep connection alive
   * Gate.io requires periodic pings every 20 seconds
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.wsClient && this.isConnected) {
        try {
          const pingMessage = {
            time: Math.floor(Date.now() / 1000),
            channel: 'spot.ping',
          };
          this.wsClient.send(JSON.stringify(pingMessage));
        } catch (error) {
          console.error('[GateIOWSAdapter] Error sending ping:', error);
        }
      }
    }, 20000); // Every 20 seconds
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
      console.error('[GateIOWSAdapter] Max reconnect attempts reached');
      this.emit('error', new Error('Max reconnect attempts reached'));
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[GateIOWSAdapter] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
        await this.resubscribeAll();
      } catch (error) {
        console.error('[GateIOWSAdapter] Reconnection failed:', error);
        this.handleReconnect(); // Try again
      }
    }, delay);
  }

  /**
   * Resubscribe to all symbols after reconnection
   */
  private async resubscribeAll(): Promise<void> {
    const symbols = Array.from(this.subscribedSymbols);
    console.log(`[GateIOWSAdapter] Resubscribing to ${symbols.length} symbols`);

    for (const symbol of symbols) {
      try {
        await this.subscribe(symbol);
      } catch (error) {
        console.error(
          `[GateIOWSAdapter] Error resubscribing to ${symbol}:`,
          error
        );
      }
    }
  }

  /**
   * Convert standard format (BTCUSDT) to Gate.io format (BTC_USDT)
   */
  private convertToGateIOFormat(symbol: string): string {
    const quoteCurrencies = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];

    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.substring(0, symbol.length - quote.length);
        return `${base}_${quote}`;
      }
    }

    // Fallback: assume last 4 characters are quote currency
    const base = symbol.substring(0, symbol.length - 4);
    const quote = symbol.substring(symbol.length - 4);
    return `${base}_${quote}`;
  }
}
