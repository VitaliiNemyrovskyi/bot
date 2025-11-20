/**
 * Binance Futures Service
 *
 * Comprehensive service for Binance USDⓈ-M Futures (perpetual contracts)
 * Supports both REST API and WebSocket connections for low-latency trading
 */

import ccxt from 'ccxt';
import WebSocket from 'ws';
import * as crypto from 'crypto';

export interface BinanceConfig {
  apiKey?: string;
  apiSecret?: string;
  enableRateLimit?: boolean;
  testnet?: boolean;
  userId?: string;
  credentialId?: string;
}

export interface TimeSyncResult {
  binanceServerTime: Date;
  localTime: Date;
  networkLatencyMs: number;
  timeSyncAccuracy: number;
  timeOffset: number;
}

interface TickerData {
  symbol: string;
  lastPrice: string;
  markPrice?: string;
  indexPrice?: string;
  bid1Price?: string;
  ask1Price?: string;
  bid1Size?: string;
  ask1Size?: string;
  volume24h?: string;
  turnover24h?: string;
  openInterest?: string;
  highPrice24h?: string;
  lowPrice24h?: string;
  priceChange?: string;
  priceChangePercent?: string;
  timestamp: number;
}

export class BinanceService {
  private client: ccxt.binance;
  private config: BinanceConfig;
  private wsClientPublic?: WebSocket; // Public WebSocket for market data
  private wsClientApi?: WebSocket; // WebSocket API client for trading (low latency)
  private wsSubscriptions: Map<string, (data: any) => void> = new Map();
  private wsApiListenKey?: string; // Listen key for authenticated WebSocket API
  private wsApiPendingRequests: Map<string, { resolve: (value: any) => void; reject: (reason: any) => void }> = new Map();
  private timeOffset: number = 0;
  private lastSyncTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 5 * 1000; // 5 seconds
  private readonly LARGE_OFFSET_WARNING_MS = 10000; // 10 seconds
  private readonly MAX_OFFSET_MS = 30000; // 30 seconds

  // Binance Futures WebSocket endpoints
  private readonly WS_BASE_URL = 'wss://fstream.binance.com/ws';
  private readonly WS_STREAM_URL = 'wss://fstream.binance.com/stream';
  private readonly WS_API_URL = 'wss://ws-fapi.binance.com/ws-fapi/v1'; // WebSocket API for trading

  constructor(config: BinanceConfig = {}) {
    this.config = {
      enableRateLimit: config.enableRateLimit ?? true,
      ...config
    };

    // Initialize CCXT client for REST API
    this.client = new ccxt.binance({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
      enableRateLimit: this.config.enableRateLimit,
      options: {
        defaultType: 'future', // Use USDⓈ-M Futures
        adjustForTimeDifference: true,
        recvWindow: 30000, // 30 seconds recv window
      },
    });

    if (this.config.testnet) {
      this.client.setSandboxMode(true);
      console.log('[BinanceService] Testnet mode enabled');
    }

    console.log('[BinanceService] Service initialized');
  }

  /**
   * Initialize the service and load markets
   */
  async initialize(): Promise<void> {
    try {
      await this.client.loadMarkets();
      console.log('[BinanceService] Markets loaded successfully');
    } catch (error: any) {
      console.error('[BinanceService] Failed to load markets:', error.message);
      throw error;
    }
  }

  /**
   * Get Binance server time
   * Returns server time in milliseconds
   */
  async getServerTime(): Promise<number> {
    try {
      // Use CCXT's fetchTime method which calls /fapi/v1/time for futures
      const serverTime = await this.client.fetchTime();
      return serverTime;
    } catch (error: any) {
      console.error('[BinanceService] Failed to get server time:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize local time with Binance server time
   * Calculates the offset between local time and server time
   */
  async syncTime(): Promise<void> {
    try {
      const startTime = Date.now();
      const serverTime = await this.getServerTime();
      const endTime = Date.now();

      const roundTripTime = endTime - startTime;
      const latency = roundTripTime / 2;
      const midpoint = startTime + latency;

      const newOffset = serverTime - midpoint;
      this.timeOffset = newOffset;
      this.lastSyncTime = endTime;

      // Check if offset exceeds maximum allowed
      if (Math.abs(newOffset) > this.MAX_OFFSET_MS) {
        const errorMsg = `CRITICAL: Time offset (${newOffset}ms) exceeds maximum allowed (${this.MAX_OFFSET_MS}ms)`;
        console.error(`[BinanceService] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Warn if offset is large but acceptable
      if (Math.abs(newOffset) > this.LARGE_OFFSET_WARNING_MS) {
        console.warn(`[BinanceService] WARNING: Large time offset detected: ${newOffset}ms`);
      }
    } catch (error: any) {
      console.error('[BinanceService] Time sync failed:', error.message);

      if (error.message.includes('CRITICAL: Time offset')) {
        throw error;
      }

      console.warn('[BinanceService] Falling back to local time');
    }
  }

  /**
   * Get synchronized timestamp
   * Returns current timestamp adjusted with server time offset
   */
  getSyncedTime(): number {
    return Date.now() + this.timeOffset;
  }

  /**
   * Get current time offset
   */
  getTimeOffset(): number {
    return this.timeOffset;
  }

  /**
   * Start periodic time synchronization
   */
  startPeriodicSync(): void {
    if (this.syncInterval) {
      return;
    }

    console.log(`[BinanceService] Starting periodic time sync (interval: ${this.SYNC_INTERVAL_MS / 1000}s)`);

    this.syncInterval = setInterval(async () => {
      await this.syncTime();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic time synchronization
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Get time sync status
   */
  getTimeSyncStatus(): { offset: number; lastSyncTime: number; syncAge: number } {
    return {
      offset: this.timeOffset,
      lastSyncTime: this.lastSyncTime,
      syncAge: Date.now() - this.lastSyncTime
    };
  }

  /**
   * Subscribe to ticker updates via WebSocket
   * Binance Futures format: "btcusdt@ticker" (lowercase)
   *
   * @param symbol - Trading symbol (e.g., "BTCUSDT")
   * @param callback - Function to call when ticker data is received
   */
  subscribeToTicker(symbol: string, callback: (data: any) => void): void {
    console.log(`[BinanceService] Subscribing to ticker: ${symbol}`);

    // Convert symbol to Binance format (lowercase)
    const binanceSymbol = symbol.replace('/', '').toLowerCase();
    const streamName = `${binanceSymbol}@ticker`;

    // Store callback
    this.wsSubscriptions.set(symbol, callback);

    // Create WebSocket connection if not exists
    if (!this.wsClientPublic) {
      this.initializeWebSocket();
    }

    // Subscribe to stream
    this.subscribeToStream(streamName);
  }

  /**
   * Initialize public WebSocket connection
   */
  private initializeWebSocket(): void {
    console.log('[BinanceService] Initializing WebSocket connection...');

    // Use stream endpoint for combined streams
    this.wsClientPublic = new WebSocket(this.WS_STREAM_URL);

    this.wsClientPublic.on('open', () => {
      console.log('[BinanceService] WebSocket connected');
    });

    this.wsClientPublic.on('message', (data: Buffer) => {
      this.handleWebSocketMessage(data);
    });

    this.wsClientPublic.on('error', (error: Error) => {
      console.error('[BinanceService] WebSocket error:', error.message);
    });

    this.wsClientPublic.on('close', () => {
      console.log('[BinanceService] WebSocket closed');
      this.wsClientPublic = undefined;
    });

    // Send ping every 3 minutes to keep connection alive
    setInterval(() => {
      if (this.wsClientPublic && this.wsClientPublic.readyState === WebSocket.OPEN) {
        this.wsClientPublic.ping();
      }
    }, 180000); // 3 minutes
  }

  /**
   * Subscribe to a specific stream
   */
  private subscribeToStream(streamName: string): void {
    if (!this.wsClientPublic || this.wsClientPublic.readyState !== WebSocket.OPEN) {
      console.warn('[BinanceService] WebSocket not ready, queuing subscription');
      // Wait for connection and retry
      setTimeout(() => this.subscribeToStream(streamName), 1000);
      return;
    }

    const subscribeMessage = {
      method: 'SUBSCRIBE',
      params: [streamName],
      id: Date.now(),
    };

    this.wsClientPublic.send(JSON.stringify(subscribeMessage));
    console.log(`[BinanceService] Subscribed to stream: ${streamName}`);
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleWebSocketMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Combined streams endpoint wraps data
      if (message.stream && message.data) {
        const tickerData = message.data;

        // Extract symbol from stream name: "btcusdt@ticker" -> "BTCUSDT"
        const streamSymbol = message.stream.split('@')[0].toUpperCase();

        // Call appropriate callback
        for (const [symbol, callback] of this.wsSubscriptions.entries()) {
          const normalizedSymbol = symbol.replace('/', '').toUpperCase();
          if (normalizedSymbol === streamSymbol) {
            // Transform Binance ticker format to our expected format
            const transformedData = this.transformTickerData(tickerData, symbol);
            callback(transformedData);
          }
        }
      }

      // Handle subscription confirmations
      if (message.result === null && message.id) {
        console.log('[BinanceService] Subscription confirmed:', message.id);
      } else if (message.error) {
        console.error('[BinanceService] Subscription error:', message.error);
      }
    } catch (error: any) {
      console.error('[BinanceService] Error handling WebSocket message:', error.message);
    }
  }

  /**
   * Transform Binance ticker data to match Bybit format for compatibility
   */
  private transformTickerData(binanceData: any, symbol: string): any {
    // Binance ticker fields:
    // E: Event time, s: Symbol, c: Close price (last price),
    // b: Best bid price, a: Best ask price, P: Price change percent,
    // v: Total traded base asset volume, q: Total traded quote asset volume

    return {
      topic: `tickers.${symbol.replace('/', '')}`,
      type: 'snapshot',
      ts: binanceData.E || Date.now(),
      data: {
        symbol: binanceData.s || symbol,
        lastPrice: binanceData.c,
        markPrice: binanceData.c, // Binance doesn't provide mark price in ticker, use last price
        indexPrice: binanceData.c, // Same for index price
        bid1Price: binanceData.b,
        ask1Price: binanceData.a,
        bid1Size: binanceData.B,
        ask1Size: binanceData.A,
        volume24h: binanceData.v,
        turnover24h: binanceData.q,
        highPrice24h: binanceData.h,
        lowPrice24h: binanceData.l,
        price24hPcnt: binanceData.P,
      }
    };
  }

  /**
   * Unsubscribe from all WebSocket connections
   */
  unsubscribeAll(): void {
    console.log('[BinanceService] Unsubscribing from all WebSocket streams...');

    if (this.wsClientPublic) {
      this.wsClientPublic.close();
      this.wsClientPublic = undefined;
    }

    if (this.wsClientApi) {
      this.wsClientApi.close();
      this.wsClientApi = undefined;
    }

    this.wsSubscriptions.clear();
    this.wsApiPendingRequests.clear();
  }

  /**
   * Initialize WebSocket API for trading (low latency)
   * This is required for openShortWS(), closeShortWS() methods
   */
  private async initializeWebSocketAPI(): Promise<void> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('API credentials required for WebSocket API trading');
    }

    if (this.wsClientApi && this.wsClientApi.readyState === WebSocket.OPEN) {
      return; // Already initialized
    }

    console.log('[BinanceService] Initializing WebSocket API for trading...');

    this.wsClientApi = new WebSocket(this.WS_API_URL);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket API connection timeout'));
      }, 10000);

      this.wsClientApi!.on('open', () => {
        clearTimeout(timeout);
        console.log('[BinanceService] WebSocket API connected');
        resolve();
      });

      this.wsClientApi!.on('error', (error: Error) => {
        clearTimeout(timeout);
        console.error('[BinanceService] WebSocket API error:', error.message);
        reject(error);
      });
    });

    // Set up message handler
    this.wsClientApi.on('message', (data: Buffer) => {
      this.handleWebSocketAPIMessage(data);
    });

    this.wsClientApi.on('close', () => {
      console.log('[BinanceService] WebSocket API closed');
      this.wsClientApi = undefined;
    });

    // Send ping every 3 minutes
    setInterval(() => {
      if (this.wsClientApi && this.wsClientApi.readyState === WebSocket.OPEN) {
        this.wsClientApi.ping();
      }
    }, 180000);

    console.log('[BinanceService] WebSocket API initialized successfully');
  }

  /**
   * Handle incoming WebSocket API message
   */
  private handleWebSocketAPIMessage(data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      // Handle response to our request
      if (message.id) {
        const pending = this.wsApiPendingRequests.get(message.id);
        if (pending) {
          if (message.status === 200) {
            pending.resolve(message.result);
          } else {
            pending.reject(new Error(message.error?.msg || 'Unknown error'));
          }
          this.wsApiPendingRequests.delete(message.id);
        }
      }
    } catch (error: any) {
      console.error('[BinanceService] Error handling WebSocket API message:', error.message);
    }
  }

  /**
   * Generate HMAC SHA256 signature for Binance API
   */
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.config.apiSecret!)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Send authenticated request via WebSocket API
   */
  private async sendWebSocketAPIRequest(method: string, params: any): Promise<any> {
    if (!this.wsClientApi || this.wsClientApi.readyState !== WebSocket.OPEN) {
      await this.initializeWebSocketAPI();
    }

    const id = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = Date.now();

    // Build query string for signature
    const queryParams = {
      ...params,
      timestamp,
    };

    const queryString = Object.keys(queryParams)
      .sort()
      .map(key => `${key}=${queryParams[key]}`)
      .join('&');

    const signature = this.generateSignature(queryString);

    // Build request
    const request = {
      id,
      method,
      params: {
        ...queryParams,
        signature,
        apiKey: this.config.apiKey,
      },
    };

    // Send request and wait for response
    return new Promise((resolve, reject) => {
      this.wsApiPendingRequests.set(id, { resolve, reject });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.wsApiPendingRequests.has(id)) {
          this.wsApiPendingRequests.delete(id);
          reject(new Error('WebSocket API request timeout'));
        }
      }, 10000);

      this.wsClientApi!.send(JSON.stringify(request));
    });
  }

  /**
   * Open SHORT position via WebSocket API (ultra-low latency ~5-20ms)
   * Sell to open SHORT position
   */
  async openShortWS(symbol: string, quantity: string, reduceOnly: boolean = false): Promise<any> {
    // console.log(`[BinanceService WS] Opening SHORT: ${symbol} qty=${quantity}`);
    const startTime = Date.now();

    try {
      const params: any = {
        symbol: symbol.replace('/', ''), // "BTC/USDT" -> "BTCUSDT"
        side: 'SELL',
        type: 'MARKET',
        quantity,
      };

      if (reduceOnly) {
        params.reduceOnly = true;
      }

      const result = await this.sendWebSocketAPIRequest('order.place', params);

      const latency = Date.now() - startTime;
      console.log(`[BinanceService WS] SHORT opened in ${latency}ms: orderId=${result.orderId}`);

      return {
        orderId: result.orderId,
        avgPrice: result.avgPrice || result.price,
        status: result.status,
      };
    } catch (error: any) {
      console.error(`[BinanceService WS] Failed to open SHORT:`, error.message);
      throw error;
    }
  }

  /**
   * Close SHORT position via WebSocket API (ultra-low latency ~5-20ms)
   * Buy to close SHORT position
   */
  async closeShortWS(symbol: string, quantity: string): Promise<any> {
    console.log(`[BinanceService WS] Closing SHORT: ${symbol} qty=${quantity}`);
    const startTime = Date.now();

    try {
      const params = {
        symbol: symbol.replace('/', ''), // "BTC/USDT" -> "BTCUSDT"
        side: 'BUY',
        type: 'MARKET',
        quantity,
        reduceOnly: true, // CRITICAL: Only close existing position
      };

      const result = await this.sendWebSocketAPIRequest('order.place', params);

      const latency = Date.now() - startTime;
      console.log(`[BinanceService WS] SHORT closed in ${latency}ms: orderId=${result.orderId}`);

      return {
        orderId: result.orderId,
        avgPrice: result.avgPrice || result.price,
        status: result.status,
      };
    } catch (error: any) {
      console.error(`[BinanceService WS] Failed to close SHORT:`, error.message);
      throw error;
    }
  }

  /**
   * Open LONG position via WebSocket API (ultra-low latency ~5-20ms)
   * Buy to open LONG position
   */
  async openLongWS(symbol: string, quantity: string, reduceOnly: boolean = false): Promise<any> {
    console.log(`[BinanceService WS] Opening LONG: ${symbol} qty=${quantity}`);
    const startTime = Date.now();

    try {
      const params: any = {
        symbol: symbol.replace('/', ''), // "BTC/USDT" -> "BTCUSDT"
        side: 'BUY',
        type: 'MARKET',
        quantity,
      };

      if (reduceOnly) {
        params.reduceOnly = true;
      }

      const result = await this.sendWebSocketAPIRequest('order.place', params);

      const latency = Date.now() - startTime;
      console.log(`[BinanceService WS] LONG opened in ${latency}ms: orderId=${result.orderId}`);

      return {
        orderId: result.orderId,
        avgPrice: result.avgPrice || result.price,
        status: result.status,
      };
    } catch (error: any) {
      console.error(`[BinanceService WS] Failed to open LONG:`, error.message);
      throw error;
    }
  }

  /**
   * Close LONG position via WebSocket API (ultra-low latency ~5-20ms)
   * Sell to close LONG position
   */
  async closeLongWS(symbol: string, quantity: string): Promise<any> {
    console.log(`[BinanceService WS] Closing LONG: ${symbol} qty=${quantity}`);
    const startTime = Date.now();

    try {
      const params = {
        symbol: symbol.replace('/', ''), // "BTC/USDT" -> "BTCUSDT"
        side: 'SELL',
        type: 'MARKET',
        quantity,
        reduceOnly: true, // CRITICAL: Only close existing position
      };

      const result = await this.sendWebSocketAPIRequest('order.place', params);

      const latency = Date.now() - startTime;
      console.log(`[BinanceService WS] LONG closed in ${latency}ms: orderId=${result.orderId}`);

      return {
        orderId: result.orderId,
        avgPrice: result.avgPrice || result.price,
        status: result.status,
      };
    } catch (error: any) {
      console.error(`[BinanceService WS] Failed to close LONG:`, error.message);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<any> {
    try {
      const balance = await this.client.fetchBalance();
      return balance;
    } catch (error: any) {
      console.error('[BinanceService] Error fetching wallet balance:', error.message);
      throw error;
    }
  }

  /**
   * Get current price for a symbol
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const ticker = await this.client.fetchTicker(symbol);
      return ticker.last || ticker.close || 0;
    } catch (error: any) {
      console.error(`[BinanceService] Error fetching price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get ticker information
   */
  async getTicker(symbol: string): Promise<any> {
    try {
      const ticker = await this.client.fetchTicker(symbol);
      return ticker;
    } catch (error: any) {
      console.error(`[BinanceService] Error fetching ticker for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get positions
   */
  async getPositions(symbol?: string): Promise<any[]> {
    try {
      const positions = await this.client.fetchPositions(symbol ? [symbol] : undefined);
      return positions.filter((p: any) => parseFloat(p.contracts) !== 0);
    } catch (error: any) {
      console.error('[BinanceService] Error fetching positions:', error.message);
      throw error;
    }
  }

  /**
   * Place market order
   */
  async placeMarketOrder(
    symbol: string,
    side: 'Buy' | 'Sell',
    quantity: string,
    reduceOnly: boolean = false
  ): Promise<any> {
    try {
      const orderSide = side === 'Buy' ? 'buy' : 'sell';

      const params: any = {};
      if (reduceOnly) {
        params.reduceOnly = true;
      }

      const order = await this.client.createOrder(
        symbol,
        'market',
        orderSide,
        parseFloat(quantity),
        undefined,
        params
      );

      console.log(`[BinanceService] Market order placed:`, {
        symbol,
        side: orderSide,
        quantity,
        orderId: order.id,
      });

      return order;
    } catch (error: any) {
      console.error(`[BinanceService] Error placing market order:`, error.message);
      throw error;
    }
  }

  /**
   * Set leverage
   */
  async setLeverage(symbol: string, leverage: number): Promise<void> {
    try {
      await this.client.setLeverage(leverage, symbol);
      console.log(`[BinanceService] Leverage set to ${leverage}x for ${symbol}`);
    } catch (error: any) {
      console.error(`[BinanceService] Error setting leverage:`, error.message);
      throw error;
    }
  }

  /**
   * Open SHORT position (sell)
   */
  async openShort(symbol: string, quantity: string, reduceOnly: boolean = false): Promise<any> {
    console.log(`[BinanceService] Opening SHORT: ${symbol} qty=${quantity}`);
    return await this.placeMarketOrder(symbol, 'Sell', quantity, reduceOnly);
  }

  /**
   * Open LONG position (buy)
   */
  async openLong(symbol: string, quantity: string, reduceOnly: boolean = false): Promise<any> {
    console.log(`[BinanceService] Opening LONG: ${symbol} qty=${quantity}`);
    return await this.placeMarketOrder(symbol, 'Buy', quantity, reduceOnly);
  }

  /**
   * Close SHORT position (buy to close)
   */
  async closeShort(symbol: string, quantity: string): Promise<any> {
    console.log(`[BinanceService] Closing SHORT: ${symbol} qty=${quantity}`);
    return await this.placeMarketOrder(symbol, 'Buy', quantity, true);
  }

  /**
   * Close LONG position (sell to close)
   */
  async closeLong(symbol: string, quantity: string): Promise<any> {
    console.log(`[BinanceService] Closing LONG: ${symbol} qty=${quantity}`);
    return await this.placeMarketOrder(symbol, 'Sell', quantity, true);
  }

  /**
   * Check if credentials are configured
   */
  hasCredentials(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }

  /**
   * Update API credentials
   */
  updateCredentials(apiKey: string, apiSecret: string): void {
    this.config.apiKey = apiKey;
    this.config.apiSecret = apiSecret;

    console.log('[BinanceService] Updating credentials and reinitializing client...');

    this.client = new ccxt.binance({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
      enableRateLimit: this.config.enableRateLimit,
      options: {
        defaultType: 'future',
        adjustForTimeDifference: true,
        recvWindow: 30000,
      },
    });

    if (this.config.testnet) {
      this.client.setSandboxMode(true);
    }

    console.log('[BinanceService] Credentials updated successfully');
  }
}

// Export a default instance for easy use
export const binanceService = new BinanceService({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_API_SECRET,
});
