/**
 * Gate.io WebSocket Service for Recording
 *
 * Minimal service for funding payment recording
 * WebSocket URL: wss://fx-ws.gateio.ws/v4/ws/usdt
 */

import ccxt from 'ccxt';
import WebSocket from 'ws';

export interface GateIORecorderConfig {
  apiKey?: string;
  apiSecret?: string;
  enableRateLimit?: boolean;
}

export class GateIORecorderService {
  private client: ccxt.gateio;
  private config: GateIORecorderConfig;
  private wsClient?: WebSocket;
  private wsCallbacks: Map<string, (data: any) => void> = new Map();
  private timeOffset: number = 0;
  private pingInterval?: NodeJS.Timeout;

  constructor(config: GateIORecorderConfig = {}) {
    this.config = {
      enableRateLimit: true,
      ...config
    };

    // Initialize CCXT client for REST API
    this.client = new ccxt.gateio({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
      enableRateLimit: this.config.enableRateLimit,
      options: {
        defaultType: 'swap', // Use perpetual futures
      }
    });

    console.log('[GateIORecorder] Service initialized');
  }

  /**
   * Get Gate.io server time
   * Returns server time in milliseconds
   */
  async getServerTime(): Promise<number> {
    try {
      // Use CCXT's fetchTime method
      const serverTime = await this.client.fetchTime();
      return serverTime;
    } catch (error: any) {
      console.error('[GateIORecorder] Failed to get server time:', error.message);
      throw error;
    }
  }

  /**
   * Sync local time with server time
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

      console.log('[GateIORecorder] Time synchronized', {
        serverTime: new Date(serverTime).toISOString(),
        localTime: new Date(localMidpoint).toISOString(),
        offset: this.timeOffset,
        latency: networkLatency,
      });
    } catch (error: any) {
      console.error('[GateIORecorder] Failed to sync time:', error.message);
      throw error;
    }
  }

  /**
   * Subscribe to ticker updates via WebSocket
   * Gate.io WebSocket: wss://fx-ws.gateio.ws/v4/ws/usdt
   *
   * @param symbol - Trading symbol (e.g., "BTC_USDT")
   * @param callback - Function to call when ticker data is received
   */
  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    console.log(`[GateIORecorder] Subscribing to ticker: ${symbol}`);

    // Convert symbol to Gate.io format (BTC/USDT -> BTC_USDT)
    const gateioSymbol = this.convertToGateIOSymbol(symbol);

    // Store callback
    this.wsCallbacks.set(gateioSymbol, callback);

    // Subscribe to ticker channel
    const subscribeMessage = {
      time: Math.floor(Date.now() / 1000),
      channel: 'futures.tickers',
      event: 'subscribe',
      payload: [gateioSymbol]
    };

    // Initialize WebSocket if not exists or closed
    if (!this.wsClient || this.wsClient.readyState === WebSocket.CLOSED) {
      this.initializeWebSocket();
      // Wait for connection to be established
      this.wsClient!.once('open', () => {
        try {
          if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
            this.wsClient.send(JSON.stringify(subscribeMessage));
            console.log(`[GateIORecorder] Subscription sent for ${gateioSymbol} (after connect)`);
          }
        } catch (error: any) {
          console.error(`[GateIORecorder] Failed to send subscription for ${gateioSymbol}:`, error.message);
        }
      });
    } else if (this.wsClient.readyState === WebSocket.OPEN) {
      // Already connected - send immediately
      try {
        this.wsClient.send(JSON.stringify(subscribeMessage));
        console.log(`[GateIORecorder] Subscription sent for ${gateioSymbol} (immediate)`);
      } catch (error: any) {
        console.error(`[GateIORecorder] Failed to send subscription for ${gateioSymbol}:`, error.message);
      }
    } else if (this.wsClient.readyState === WebSocket.CONNECTING) {
      // Still connecting - wait for 'open'
      console.log(`[GateIORecorder] WebSocket connecting, queuing subscription for ${gateioSymbol}...`);
      this.wsClient.once('open', () => {
        try {
          if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
            this.wsClient.send(JSON.stringify(subscribeMessage));
            console.log(`[GateIORecorder] Subscription sent for ${gateioSymbol} (after wait)`);
          }
        } catch (error: any) {
          console.error(`[GateIORecorder] Failed to send subscription for ${gateioSymbol}:`, error.message);
        }
      });
    }
  }

  /**
   * Initialize WebSocket connection
   */
  private initializeWebSocket(): void {
    console.log('[GateIORecorder] Initializing WebSocket connection');

    this.wsClient = new WebSocket('wss://fx-ws.gateio.ws/v4/ws/usdt');

    this.wsClient.on('open', () => {
      console.log('[GateIORecorder] WebSocket connected');

      // Gate.io requires ping every 10 seconds
      this.startPing();
    });

    this.wsClient.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle subscription confirmation
        if (message.event === 'subscribe') {
          console.log('[GateIORecorder] Subscription confirmed:', message.payload);
        }

        // Handle ticker updates
        if (message.channel === 'futures.tickers' && message.event === 'update' && message.result && message.result.length > 0) {
          const tickerData = message.result[0]; // result is an array, get first element
          const contract = tickerData.contract;

          // Transform to common format matching Bybit/Binance
          // Convert "SOON_USDT" -> "SOONUSDT" (remove underscore)
          // Topic format: "tickers.SOONUSDT" (consistent with other exchanges)
          const normalizedSymbol = contract.replace('_', '');
          const transformedData = {
            topic: `tickers.${normalizedSymbol}`,
            type: 'snapshot',
            data: {
              symbol: contract,
              lastPrice: tickerData.last,
              bid1Price: tickerData.bid1_price,
              bid1Size: tickerData.bid1_size,
              ask1Price: tickerData.ask1_price,
              ask1Size: tickerData.ask1_size,
              volume24h: tickerData.volume_24h,
              turnover24h: tickerData.volume_24h_quote,
            },
            ts: Date.now()
          };

          // Call callback if registered
          const callback = this.wsCallbacks.get(contract);
          if (callback) {
            callback(transformedData);
          } else {
            console.log(`[GateIORecorder] No callback registered for ${contract}, have: ${Array.from(this.wsCallbacks.keys()).join(', ')}`);
          }
        }
      } catch (error: any) {
        console.error('[GateIORecorder] WebSocket message parsing error:', error.message);
      }
    });

    this.wsClient.on('error', (error) => {
      console.error('[GateIORecorder] WebSocket error:', error.message);
    });

    this.wsClient.on('close', () => {
      console.log('[GateIORecorder] WebSocket closed');
      this.stopPing();
    });
  }

  /**
   * Start ping interval (Gate.io requires ping every 10s)
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
        const pingMessage = {
          time: Math.floor(Date.now() / 1000),
          channel: 'futures.ping'
        };
        this.wsClient.send(JSON.stringify(pingMessage));
      }
    }, 10000); // 10 seconds
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
    console.log('[GateIORecorder] Closing WebSocket connection');

    this.stopPing();

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }

    this.wsCallbacks.clear();
  }

  /**
   * Convert symbol from standard format to Gate.io format
   * Examples:
   *   BTC/USDT -> BTC_USDT
   *   BTCUSDT -> BTC_USDT
   *   ETH/USDT -> ETH_USDT
   */
  private convertToGateIOSymbol(symbol: string): string {
    // Remove slash and replace with underscore
    if (symbol.includes('/')) {
      return symbol.replace('/', '_');
    }

    // If no slash, assume format like BTCUSDT and split
    const base = symbol.replace('USDT', '');
    return `${base}_USDT`;
  }

  /**
   * Initialize the service (load markets)
   */
  async initialize(): Promise<void> {
    try {
      await this.client.loadMarkets();
      console.log('[GateIORecorder] Markets loaded successfully');
    } catch (error: any) {
      console.error('[GateIORecorder] Failed to load markets:', error.message);
      throw error;
    }
  }
}
