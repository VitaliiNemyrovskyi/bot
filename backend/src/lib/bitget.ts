/**
 * Bitget API Service
 *
 * Supports REST API and WebSocket connections for futures trading
 * Documentation: https://www.bitget.com/api-doc/contract/websocket/public/tickers-channel
 */

import ccxt from 'ccxt';
import WebSocket from 'ws';

export interface BitgetConfig {
  apiKey?: string;
  apiSecret?: string;
  password?: string; // Bitget requires API passphrase
  enableRateLimit?: boolean;
}

export class BitgetService {
  public client: ccxt.bitget;
  private config: BitgetConfig;
  private wsClient?: WebSocket;
  private wsCallbacks: Map<string, (data: any) => void> = new Map();
  private timeOffset: number = 0;
  private pingInterval?: NodeJS.Timeout;

  constructor(config: BitgetConfig = {}) {
    this.config = {
      enableRateLimit: true,
      ...config
    };

    // Initialize CCXT client for REST API
    this.client = new ccxt.bitget({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
      password: this.config.password,
      enableRateLimit: this.config.enableRateLimit,
      options: {
        defaultType: 'swap', // Use perpetual futures by default
      }
    });

    console.log('[BitgetService] Service initialized');
  }

  /**
   * Get Bitget server time
   * Returns server time in milliseconds
   */
  async getServerTime(): Promise<number> {
    try {
      // Use CCXT's fetchTime method
      const serverTime = await this.client.fetchTime();
      return serverTime;
    } catch (error: any) {
      console.error('[BitgetService] Failed to get server time:', error.message);
      throw error;
    }
  }

  /**
   * Sync local time with server time
   * Calculates the offset between local time and server time
   */
  async syncTime(): Promise<void> {
    try {
      const startTime = Date.now();
      const serverTime = await this.getServerTime();
      const endTime = Date.now();

      const roundTripTime = endTime - startTime;
      const networkLatency = roundTripTime / 2;
      const localMidpoint = startTime + networkLatency;

      this.timeOffset = serverTime - localMidpoint;

      console.log('[BitgetService] Time synchronized', {
        serverTime: new Date(serverTime).toISOString(),
        localTime: new Date(localMidpoint).toISOString(),
        offset: this.timeOffset,
        latency: networkLatency,
      });
    } catch (error: any) {
      console.error('[BitgetService] Failed to sync time:', error.message);
      throw error;
    }
  }

  /**
   * Subscribe to ticker updates via WebSocket
   * Bitget WebSocket URL: wss://ws.bitget.com/v2/ws/public
   *
   * @param symbol - Trading symbol (e.g., "BTCUSDT")
   * @param callback - Function to call when ticker data is received
   */
  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    console.log(`[BitgetService] Subscribing to ticker: ${symbol}`);

    // Convert symbol to Bitget format
    const bitgetSymbol = this.convertToBitgetSymbol(symbol);

    // Initialize WebSocket if not already connected
    if (!this.wsClient || this.wsClient.readyState !== WebSocket.OPEN) {
      this.initializeWebSocket();
    }

    // Store callback
    this.wsCallbacks.set(bitgetSymbol, callback);

    // Subscribe to ticker channel
    const subscribeMessage = {
      op: 'subscribe',
      args: [{
        instType: 'USDT-FUTURES',
        channel: 'ticker',
        instId: bitgetSymbol
      }]
    };

    // Wait for WebSocket to be ready
    if (this.wsClient!.readyState === WebSocket.OPEN) {
      this.wsClient!.send(JSON.stringify(subscribeMessage));
    } else {
      this.wsClient!.once('open', () => {
        this.wsClient!.send(JSON.stringify(subscribeMessage));
      });
    }
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    console.log('[BitgetService] Initializing WebSocket connection');

    this.wsClient = new WebSocket('wss://ws.bitget.com/v2/ws/public');

    this.wsClient.on('open', () => {
      console.log('[BitgetService] WebSocket connected');

      // Bitget requires ping every 30 seconds
      this.startPing();
    });

    this.wsClient.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle ticker data
        if (message.arg && message.arg.channel === 'ticker' && message.data) {
          const tickerData = message.data[0];
          const instId = message.arg.instId;

          // Transform to common format matching Bybit/Binance
          // Use "tickers." (with 's') to match expected format
          const transformedData = {
            topic: `tickers.${instId}`,
            type: 'snapshot',
            data: {
              symbol: instId,
              lastPrice: tickerData.last,
              bid1Price: tickerData.bestBid,
              bid1Size: tickerData.bidSz,
              ask1Price: tickerData.bestAsk,
              ask1Size: tickerData.askSz,
              volume24h: tickerData.baseVolume,
              turnover24h: tickerData.quoteVolume,
            },
            ts: tickerData.ts
          };

          // Call callback if registered
          const callback = this.wsCallbacks.get(instId);
          if (callback) {
            callback(transformedData);
          }
        }
      } catch (error: any) {
        console.error('[BitgetService] WebSocket message parsing error:', error.message);
      }
    });

    this.wsClient.on('error', (error) => {
      console.error('[BitgetService] WebSocket error:', error.message);
    });

    this.wsClient.on('close', () => {
      console.log('[BitgetService] WebSocket closed');
      this.stopPing();
    });
  }

  /**
   * Start ping interval (Bitget requires ping every 30s)
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
        this.wsClient.send('ping');
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = undefined;
    }
  }

  /**
   * Unsubscribe from all WebSocket connections and close them
   */
  unsubscribeAll(): void {
    console.log('[BitgetService] Closing WebSocket connection');

    this.stopPing();

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }

    this.wsCallbacks.clear();
  }

  /**
   * Convert symbol from standard format to Bitget format
   * Examples:
   *   BTC/USDT -> BTCUSDT
   *   BTCUSDT -> BTCUSDT
   *   ETH/USDT -> ETHUSDT
   */
  private convertToBitgetSymbol(symbol: string): string {
    // Remove slash if present
    return symbol.replace('/', '');
  }

  /**
   * Initialize the service (load markets)
   */
  async initialize(): Promise<void> {
    try {
      await this.client.loadMarkets();
      console.log('[BitgetService] Markets loaded successfully');
    } catch (error: any) {
      console.error('[BitgetService] Failed to load markets:', error.message);
      throw error;
    }
  }
}
