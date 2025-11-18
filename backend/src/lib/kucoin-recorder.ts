/**
 * KuCoin WebSocket Service for Recording
 *
 * Minimal service for funding payment recording
 * WebSocket: wss://ws-api-futures.kucoin.com
 * Public WebSocket (no auth): wss://ws-api-futures.kucoin.com/v1/public
 */

import ccxt from 'ccxt';
import WebSocket from 'ws';

export interface KuCoinRecorderConfig {
  apiKey?: string;
  apiSecret?: string;
  password?: string; // KuCoin requires passphrase
  enableRateLimit?: boolean;
}

export class KuCoinRecorderService {
  private client: ccxt.kucoin;
  private config: KuCoinRecorderConfig;
  private wsClient?: WebSocket;
  private wsCallbacks: Map<string, (data: any) => void> = new Map();
  private timeOffset: number = 0;
  private pingInterval?: NodeJS.Timeout;
  private wsToken?: string;

  constructor(config: KuCoinRecorderConfig = {}) {
    this.config = {
      enableRateLimit: true,
      ...config
    };

    // Initialize CCXT client for REST API
    this.client = new ccxt.kucoin({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
      password: this.config.password,
      enableRateLimit: this.config.enableRateLimit,
      options: {
        defaultType: 'swap', // Use perpetual futures
      }
    });

    console.log('[KuCoinRecorder] Service initialized');
  }

  /**
   * Get KuCoin server time
   * Returns server time in milliseconds
   */
  async getServerTime(): Promise<number> {
    try {
      // Use CCXT's fetchTime method
      const serverTime = await this.client.fetchTime();
      return serverTime;
    } catch (error: any) {
      console.error('[KuCoinRecorder] Failed to get server time:', error.message);
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

      console.log('[KuCoinRecorder] Time synchronized', {
        serverTime: new Date(serverTime).toISOString(),
        localTime: new Date(localMidpoint).toISOString(),
        offset: this.timeOffset,
        latency: networkLatency,
      });
    } catch (error: any) {
      console.error('[KuCoinRecorder] Failed to sync time:', error.message);
      throw error;
    }
  }

  /**
   * Get WebSocket token from KuCoin
   * KuCoin requires a token to connect to WebSocket
   */
  private async getWebSocketToken(): Promise<{ token: string; endpoint: string }> {
    try {
      const response = await fetch('https://api-futures.kucoin.com/api/v1/bullet-public', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.code !== '200000' || !data.data) {
        throw new Error('Failed to get WebSocket token');
      }

      // Get first available server
      const server = data.data.instanceServers[0];

      return {
        token: data.data.token,
        endpoint: server.endpoint
      };
    } catch (error: any) {
      console.error('[KuCoinRecorder] Failed to get WebSocket token:', error.message);
      throw error;
    }
  }

  /**
   * Subscribe to ticker updates via WebSocket
   *
   * @param symbol - Trading symbol (e.g., "BTCUSDTM")
   * @param callback - Function to call when ticker data is received
   */
  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    console.log(`[KuCoinRecorder] ➡️  Subscribing to ticker: ${symbol}`);

    // Convert symbol to KuCoin format (BTC/USDT -> XBTUSDTM)
    const kucoinSymbol = this.convertToKuCoinSymbol(symbol);
    console.log(`[KuCoinRecorder] 🔄 Converted symbol: ${symbol} -> ${kucoinSymbol}`);

    // Store callback first
    this.wsCallbacks.set(kucoinSymbol, callback);
    console.log(`[KuCoinRecorder] 💾 Stored callback for: ${kucoinSymbol}`);
    console.log(`[KuCoinRecorder] 📋 All callbacks:`, Array.from(this.wsCallbacks.keys()));

    // Initialize WebSocket if not already connected
    if (!this.wsClient || this.wsClient.readyState !== WebSocket.OPEN) {
      console.log(`[KuCoinRecorder] 🔌 WebSocket not connected, initializing...`);
      this.initializeWebSocket()
        .then(() => {
          // Subscribe after connection
          this.sendSubscription(kucoinSymbol);
        })
        .catch((error: any) => {
          console.error(`[KuCoinRecorder] Failed to initialize WebSocket for ${kucoinSymbol}:`, error.message);
        });
    } else {
      // Subscribe immediately
      console.log(`[KuCoinRecorder] ✅ WebSocket already connected, subscribing...`);
      this.sendSubscription(kucoinSymbol);
    }
  }

  /**
   * Send subscription message
   */
  private sendSubscription(symbol: string): void {
    if (!this.wsClient || this.wsClient.readyState !== WebSocket.OPEN) {
      console.error(`[KuCoinRecorder] Cannot send subscription for ${symbol} - WebSocket not ready`);
      return;
    }

    try {
      const subscribeMessage = {
        id: Date.now(),
        type: 'subscribe',
        topic: `/contractMarket/ticker:${symbol}`,
        privateChannel: false,
        response: true
      };

      console.log(`[KuCoinRecorder] 📤 Sending subscription:`, JSON.stringify(subscribeMessage));
      this.wsClient.send(JSON.stringify(subscribeMessage));
      console.log(`[KuCoinRecorder] ✅ Subscription sent for ${symbol}`);
    } catch (error: any) {
      console.error(`[KuCoinRecorder] Failed to send subscription for ${symbol}:`, error.message);
    }
  }

  /**
   * Initialize WebSocket connection
   */
  private async initializeWebSocket(): Promise<void> {
    console.log('[KuCoinRecorder] Initializing WebSocket connection');

    // Get WebSocket token and endpoint
    const { token, endpoint } = await this.getWebSocketToken();
    this.wsToken = token;

    const wsUrl = `${endpoint}?token=${token}&connectId=${Date.now()}`;

    this.wsClient = new WebSocket(wsUrl);

    this.wsClient.on('open', () => {
      console.log('[KuCoinRecorder] WebSocket connected');

      // KuCoin requires ping every 20 seconds
      this.startPing();
    });

    this.wsClient.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());

        // Debug: Log all messages for troubleshooting
        if (message.type === 'message') {
          console.log('[KuCoinRecorder] Received message:', JSON.stringify(message).substring(0, 300));
        }

        // Handle ticker data
        if (message.type === 'message' && message.topic && message.topic.startsWith('/contractMarket/ticker:')) {
          const tickerData = message.data;
          // Extract symbol from topic (e.g., "/contractMarket/ticker:XBTUSDTM" -> "XBTUSDTM")
          const symbol = message.topic.split(':')[1];

          console.log(`[KuCoinRecorder] Ticker update - symbol: ${symbol}, topic: ${message.topic}`);
          console.log(`[KuCoinRecorder] Registered callbacks:`, Array.from(this.wsCallbacks.keys()));

          // Transform to common format matching Bybit/Binance
          // Convert topic from "/contractMarket/ticker:XBTUSDTM" to "tickers.XBTUSDTM"
          // But we need to normalize: "XBTUSDTM" -> "BTCUSDT" (remove M suffix and convert XBT->BTC)
          const normalizedSymbol = this.normalizeKuCoinSymbol(symbol);

          console.log(`[KuCoinRecorder] Normalized symbol: ${symbol} -> ${normalizedSymbol}`);

          const transformedData = {
            topic: `tickers.${normalizedSymbol}`,
            type: 'snapshot',
            data: {
              symbol: symbol,
              lastPrice: tickerData.price,
              bid1Price: tickerData.bestBidPrice,
              bid1Size: tickerData.bestBidSize,
              ask1Price: tickerData.bestAskPrice,
              ask1Size: tickerData.bestAskSize,
              volume24h: tickerData.volume,
              turnover24h: tickerData.turnover,
            },
            ts: Math.floor(tickerData.ts / 1000000) // Convert nanoseconds to milliseconds
          };

          console.log(`[KuCoinRecorder] Transformed data - topic: ${transformedData.topic}, lastPrice: ${transformedData.data.lastPrice}`);

          // Call callback if registered (using the KuCoin symbol format)
          const callback = this.wsCallbacks.get(symbol);
          if (callback) {
            console.log(`[KuCoinRecorder] ✅ Callback found for ${symbol}, invoking...`);
            callback(transformedData);
          } else {
            console.warn(`[KuCoinRecorder] ❌ No callback found for symbol: ${symbol}. Available callbacks:`, Array.from(this.wsCallbacks.keys()));
          }
        }
      } catch (error: any) {
        console.error('[KuCoinRecorder] WebSocket message parsing error:', error.message);
      }
    });

    this.wsClient.on('error', (error) => {
      console.error('[KuCoinRecorder] WebSocket error:', error.message);
    });

    this.wsClient.on('close', () => {
      console.log('[KuCoinRecorder] WebSocket closed');
      this.stopPing();
    });

    // Wait for connection to open
    return new Promise((resolve, reject) => {
      this.wsClient!.once('open', () => resolve());
      this.wsClient!.once('error', (error) => reject(error));
      setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000);
    });
  }

  /**
   * Start ping interval (KuCoin requires ping every 20s)
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.wsClient && this.wsClient.readyState === WebSocket.OPEN) {
        const pingMessage = {
          id: Date.now(),
          type: 'ping'
        };
        this.wsClient.send(JSON.stringify(pingMessage));
      }
    }, 20000); // 20 seconds
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
    console.log('[KuCoinRecorder] Closing WebSocket connection');

    this.stopPing();

    if (this.wsClient) {
      this.wsClient.close();
      this.wsClient = undefined;
    }

    this.wsCallbacks.clear();
  }

  /**
   * Convert symbol from standard format to KuCoin format
   * Examples:
   *   BTC/USDT -> XBTUSDTM
   *   BTCUSDT -> XBTUSDTM
   *   ETH/USDT -> ETHUSDTM
   *
   * Note: KuCoin uses different symbols for some coins (BTC -> XBT)
   */
  private convertToKuCoinSymbol(symbol: string): string {
    // Remove slash if present
    symbol = symbol.replace('/', '');

    // Extract base currency
    const base = symbol.replace('USDT', '');

    // KuCoin uses XBT for Bitcoin
    const kucoinBase = base === 'BTC' ? 'XBT' : base;

    // KuCoin perpetuals end with M
    return `${kucoinBase}USDTM`;
  }

  /**
   * Normalize KuCoin symbol back to standard format
   * Examples:
   *   XBTUSDTM -> BTCUSDT
   *   ETHUSDTM -> ETHUSDT
   *
   * Note: Reverses the convertToKuCoinSymbol transformation
   */
  private normalizeKuCoinSymbol(kucoinSymbol: string): string {
    // Remove M suffix
    let symbol = kucoinSymbol.replace(/M$/, '');

    // Convert XBT back to BTC
    symbol = symbol.replace('XBTUSDT', 'BTCUSDT');

    return symbol;
  }

  /**
   * Initialize the service (load markets)
   */
  async initialize(): Promise<void> {
    try {
      await this.client.loadMarkets();
      console.log('[KuCoinRecorder] Markets loaded successfully');
    } catch (error: any) {
      console.error('[KuCoinRecorder] Failed to load markets:', error.message);
      throw error;
    }
  }
}
