/**
 * OKX API Service
 *
 * Supports REST API and WebSocket connections for futures trading
 * Documentation: https://www.okx.com/docs-v5/en/
 */

import ccxt from 'ccxt';
import WebSocket from 'ws';

export interface OKXConfig {
  apiKey?: string;
  apiSecret?: string;
  password?: string; // OKX requires API passphrase
  enableRateLimit?: boolean;
}

export class OKXService {
  public client: ccxt.okx;
  private config: OKXConfig;
  private wsClient?: WebSocket;
  private wsCallbacks: Map<string, (data: any) => void> = new Map();
  private timeOffset: number = 0;

  constructor(config: OKXConfig = {}) {
    this.config = {
      enableRateLimit: true,
      ...config
    };

    // Initialize CCXT client for REST API
    this.client = new ccxt.okx({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
      password: this.config.password,
      enableRateLimit: this.config.enableRateLimit,
      options: {
        defaultType: 'swap', // Use perpetual futures by default
      }
    });

    console.log('[OKXService] Service initialized');
  }

  /**
   * Get OKX server time
   * Returns server time in milliseconds
   */
  async getServerTime(): Promise<number> {
    try {
      // Use CCXT's fetchTime method
      const serverTime = await this.client.fetchTime();
      return serverTime;
    } catch (error: any) {
      console.error('[OKXService] Failed to get server time:', error.message);
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

      console.log('[OKXService] Time synchronized', {
        serverTime: new Date(serverTime).toISOString(),
        localTime: new Date(localMidpoint).toISOString(),
        offset: this.timeOffset,
        latency: networkLatency,
      });
    } catch (error: any) {
      console.error('[OKXService] Failed to sync time:', error.message);
      throw error;
    }
  }

  /**
   * Subscribe to ticker updates via WebSocket
   * OKX WebSocket URL: wss://ws.okx.com:8443/ws/v5/public
   *
   * @param symbol - Trading symbol (e.g., "BTC-USDT-SWAP")
   * @param callback - Function to call when ticker data is received
   */
  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    console.log(`[OKXService] Subscribing to ticker: ${symbol}`);

    // Convert symbol to OKX format (BTC/USDT -> BTC-USDT-SWAP)
    const okxSymbol = this.convertToOKXSymbol(symbol);

    // Initialize WebSocket if not already connected
    if (!this.wsClient || this.wsClient.readyState !== WebSocket.OPEN) {
      this.initializeWebSocket();
    }

    // Store callback
    this.wsCallbacks.set(okxSymbol, callback);

    // Subscribe to ticker channel
    const subscribeMessage = {
      op: 'subscribe',
      args: [{
        channel: 'tickers',
        instId: okxSymbol
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
    console.log('[OKXService] Initializing WebSocket connection');

    this.wsClient = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');

    this.wsClient.on('open', () => {
      console.log('[OKXService] WebSocket connected');
    });

    this.wsClient.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle ticker data
        if (message.arg && message.arg.channel === 'tickers' && message.data) {
          const tickerData = message.data[0];
          const instId = message.arg.instId;

          // Transform to common format
          const transformedData = {
            topic: `tickers.${instId}`,
            type: 'snapshot',
            data: {
              symbol: instId,
              lastPrice: tickerData.last,
              bid1Price: tickerData.bidPx,
              bid1Size: tickerData.bidSz,
              ask1Price: tickerData.askPx,
              ask1Size: tickerData.askSz,
              volume24h: tickerData.vol24h,
              turnover24h: tickerData.volCcy24h,
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
        console.error('[OKXService] WebSocket message parsing error:', error.message);
      }
    });

    this.wsClient.on('error', (error) => {
      console.error('[OKXService] WebSocket error:', error.message);
    });

    this.wsClient.on('close', () => {
      console.log('[OKXService] WebSocket closed');
    });
  }

  /**
   * Unsubscribe from all WebSocket connections and close them
   */
  unsubscribeAll(): void {
    console.log('[OKXService] Closing WebSocket connection');

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }

    this.wsCallbacks.clear();
  }

  /**
   * Convert symbol from standard format to OKX format
   * Examples:
   *   BTC/USDT -> BTC-USDT-SWAP
   *   BTCUSDT -> BTC-USDT-SWAP
   *   ETH/USDT -> ETH-USDT-SWAP
   */
  private convertToOKXSymbol(symbol: string): string {
    // Remove slash if present
    symbol = symbol.replace('/', '');

    // Extract base currency (everything before USDT)
    const base = symbol.replace('USDT', '');

    return `${base}-USDT-SWAP`;
  }

  /**
   * Initialize the service (load markets)
   */
  async initialize(): Promise<void> {
    try {
      await this.client.loadMarkets();
      console.log('[OKXService] Markets loaded successfully');
    } catch (error: any) {
      console.error('[OKXService] Failed to load markets:', error.message);
      throw error;
    }
  }
}
