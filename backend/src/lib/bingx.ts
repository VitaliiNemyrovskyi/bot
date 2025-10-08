import crypto from 'crypto';
import {
  BingXConfig,
  BingXAccountInfo,
  BingXPosition,
  BingXOrderRequest,
  BingXOrder,
  BingXTicker,
  BingXFundingRate,
  BingXApiResponse,
  BingXWalletBalance
} from '../types/bingx';

/**
 * BingX API Service
 *
 * Implements authentication and API calls for BingX Perpetual Futures
 * Documentation: https://bingx-api.github.io/docs/
 */
export class BingXService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private enableRateLimit: boolean;
  private timeOffset: number = 0;
  private lastSyncTime: number = 0;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly LARGE_OFFSET_WARNING_MS = 1000; // 1 second

  constructor(config: BingXConfig) {
    // CRITICAL: Trim API keys to remove any whitespace, newlines, or hidden characters
    // This is a common source of signature verification failures
    this.apiKey = config.apiKey.trim();
    this.apiSecret = config.apiSecret.trim();
    this.enableRateLimit = config.enableRateLimit ?? true;

    // Log API key/secret lengths for debugging (after trimming)
    console.log('[BingXService] Initialized with credentials:', {
      apiKeyLength: this.apiKey.length,
      apiSecretLength: this.apiSecret.length,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
      apiSecretPrefix: this.apiSecret.substring(0, 8) + '...'
    });

    // BingX uses different URLs for testnet and mainnet
    this.baseUrl = 'https://open-api.bingx.com';
  }

  /**
   * Get BingX server time (V2 endpoint - still valid for time sync)
   * Endpoint: GET /openApi/swap/v2/server/time
   * Returns: { code: 0, msg: '', data: { serverTime: number } }
   */
  async getServerTime(): Promise<number> {
    try {
      const url = `${this.baseUrl}/openApi/swap/v2/server/time`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BingX server time API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`Failed to get server time: ${data.msg}`);
      }

      return data.data?.serverTime || data.serverTime || Date.now();
    } catch (error: any) {
      console.error('[BingXService] Failed to get server time:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize local time with BingX server time
   * Calculates the offset between local time and server time
   */
  async syncTime(): Promise<void> {
    const startTime = Date.now();
    const serverTime = await this.getServerTime();
    const endTime = Date.now();

    // Calculate network latency and adjust
    const latency = (endTime - startTime) / 2;
    const adjustedServerTime = serverTime + latency;

    // Calculate offset
    const newOffset = adjustedServerTime - endTime;
    this.timeOffset = newOffset;
    this.lastSyncTime = endTime;

    // Log sync status
    console.log('[BingXService] Time synchronized:', {
      serverTime,
      localTime: endTime,
      offset: newOffset,
      latency: endTime - startTime
    });

    // Warn if offset is large
    if (Math.abs(newOffset) > this.LARGE_OFFSET_WARNING_MS) {
      console.warn(`[BingXService] WARNING: Large time offset detected: ${newOffset}ms. This may cause API request failures.`);
    }
  }

  /**
   * Get synchronized timestamp
   * Returns current timestamp adjusted with server time offset
   * IMPORTANT: Returns an integer timestamp (BingX requires integer milliseconds)
   */
  getSyncedTime(): number {
    const now = Date.now();
    // Ensure integer timestamp - BingX requires exact integer milliseconds
    const syncedTime = Math.floor(now + this.timeOffset);

    // Validate the timestamp
    if (!syncedTime || isNaN(syncedTime) || syncedTime <= 0) {
      console.error('[BingXService] Invalid synced time:', {
        now,
        timeOffset: this.timeOffset,
        syncedTime,
        lastSyncTime: this.lastSyncTime
      });
      // Fallback to current time if sync failed
      return Math.floor(now);
    }

    return syncedTime;
  }

  /**
   * Start periodic time synchronization
   * Syncs time every 5-10 minutes to handle clock drift
   */
  startPeriodicSync(): void {
    if (this.syncInterval) {
      console.log('[BingXService] Periodic sync already running');
      return;
    }

    console.log(`[BingXService] Starting periodic time sync (interval: ${this.SYNC_INTERVAL_MS / 60000} minutes)`);

    this.syncInterval = setInterval(async () => {
      try {
        console.log('[BingXService] Performing periodic time sync...');
        await this.syncTime();
      } catch (error: any) {
        console.error('[BingXService] Periodic time sync failed:', error.message);
        // Don't crash the interval, just log the error
      }
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic time synchronization
   */
  stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[BingXService] Periodic time sync stopped');
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
   * Generate signature for BingX API requests
   * BingX Swap V3 API uses HMAC SHA256 signature with HEX encoding
   *
   * IMPORTANT:
   * - Parameters must NOT be URL-encoded when generating signature
   * - The signature must be HEX encoded (as per official BingX V3 Node.js example)
   * - The signature is calculated on the raw query string before URL encoding
   * - Official example: https://bingx-api.github.io/docs/
   */
  private generateSignature(params: Record<string, any>): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);

    // Create query string WITHOUT URL encoding (required for signature calculation)
    const queryString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    console.log('[BingXService] Signature calculation details:');
    console.log('  Query string:', queryString);
    console.log('  API Secret (first 8 chars):', this.apiSecret.substring(0, 8) + '...');

    // Generate HMAC SHA256 signature using HEX encoding (V3 API requirement)
    // This matches the official BingX V3 Node.js example
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');

    console.log('  Generated signature (hex):', signature);

    return signature;
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<BingXApiResponse<T>> {
    // Add timestamp - use synced time if available
    const timestamp = this.getSyncedTime();

    // Ensure timestamp is valid
    if (!timestamp || timestamp <= 0) {
      throw new Error('Invalid timestamp generated - time sync may have failed');
    }

    console.log('[BingXService] Making request:', {
      endpoint,
      method,
      timestamp,
      serverTime: timestamp - this.timeOffset, // Show what server time we think it is
      timeOffset: this.timeOffset,
      paramsCount: Object.keys(params).length
    });

    // Prepare params for signature calculation (only timestamp and user params, NOT recvWindow)
    const signatureParams = {
      ...params,
      timestamp
    };

    // Generate signature from timestamp + params only
    const signature = this.generateSignature(signatureParams);

    // Build final request params including signature
    // NOTE: BingX V3 API does NOT use recvWindow parameter
    const requestParams = {
      ...params,
      timestamp,
      signature
    };

    // Build URL - URL encode all parameter values
    // Note: Hex signatures don't need encoding but we encode all values for consistency
    const queryString = Object.entries(requestParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const url = `${this.baseUrl}${endpoint}?${queryString}`;

    console.log('[BingXService] Request URL (truncated):', url.substring(0, 100) + '...');

    // Set headers
    const headers: Record<string, string> = {
      'X-BX-APIKEY': this.apiKey,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, {
        method,
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[BingXService] API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          endpoint,
          timestamp
        });
        throw new Error(`BingX API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Check if the response indicates an error
      if (data.code && data.code !== 0) {
        console.error('[BingXService] API returned error code:', {
          endpoint,
          code: data.code,
          msg: data.msg,
          timestamp
        });
      } else {
        // Log successful request
        console.log('[BingXService] Request successful:', {
          endpoint,
          responseCode: data.code
        });
      }

      return data as BingXApiResponse<T>;
    } catch (error: any) {
      console.error('[BingXService] API request failed:', {
        error: error.message,
        endpoint,
        timestamp,
        timeOffset: this.timeOffset
      });
      throw error;
    }
  }

  /**
   * Get account balance
   * V3 API endpoint: /openApi/swap/v3/user/balance
   * Returns array of balance objects (one per asset, typically USDT)
   */
  async getBalance(): Promise<BingXAccountInfo> {
    console.log('[BingXService] Fetching account balance...');

    const response = await this.makeRequest<BingXAccountInfo[]>(
      'GET',
      '/openApi/swap/v3/user/balance',
      {}
    );

    if (response.code !== 0) {
      // Provide more context for timestamp errors
      if (response.msg && (response.msg.includes('timestamp') || response.msg.includes('time'))) {
        throw new Error(
          `Failed to get balance: ${response.msg}. ` +
          `This usually indicates a time synchronization issue. ` +
          `Local time offset: ${this.timeOffset}ms, Last sync: ${this.lastSyncTime ? new Date(this.lastSyncTime).toISOString() : 'never'}`
        );
      }
      throw new Error(`Failed to get balance: ${response.msg} (code: ${response.code})`);
    }

    // BingX V3 API returns array of balance objects in data
    // Typically returns one object for USDT
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      // Return the first balance (usually USDT for perpetual futures)
      return response.data[0];
    }

    // If no data, return empty balance structure
    return {
      asset: 'USDT',
      balance: '0',
      equity: '0',
      unrealizedProfit: '0',
      realisedProfit: '0',
      availableMargin: '0',
      usedMargin: '0',
      freezedMargin: '0'
    };
  }

  /**
   * Get all positions
   */
  async getPositions(symbol?: string): Promise<BingXPosition[]> {
    console.log('[BingXService] Fetching positions...');

    const params: Record<string, any> = {};
    if (symbol) {
      params.symbol = symbol;
    }

    const response = await this.makeRequest<BingXPosition[]>(
      'GET',
      '/openApi/swap/v2/user/positions',
      params
    );

    if (response.code !== 0) {
      throw new Error(`Failed to get positions: ${response.msg}`);
    }

    return response.data || [];
  }

  /**
   * Place an order
   */
  async placeOrder(orderRequest: BingXOrderRequest): Promise<BingXOrder> {
    console.log('[BingXService] Placing order:', orderRequest);

    const params: Record<string, any> = {
      symbol: orderRequest.symbol,
      side: orderRequest.side,
      positionSide: orderRequest.positionSide,
      type: orderRequest.type
    };

    if (orderRequest.quantity) params.quantity = orderRequest.quantity;
    if (orderRequest.price) params.price = orderRequest.price;
    if (orderRequest.stopPrice) params.stopPrice = orderRequest.stopPrice;
    if (orderRequest.reduceOnly !== undefined) params.reduceOnly = orderRequest.reduceOnly;
    if (orderRequest.timeInForce) params.timeInForce = orderRequest.timeInForce;
    if (orderRequest.closePosition) params.closePosition = orderRequest.closePosition;

    const response = await this.makeRequest<BingXOrder>(
      'POST',
      '/openApi/swap/v2/trade/order',
      params
    );

    if (response.code !== 0) {
      throw new Error(`Failed to place order: ${response.msg}`);
    }

    return response.data;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(symbol: string, orderId: string): Promise<any> {
    console.log('[BingXService] Canceling order:', { symbol, orderId });

    const response = await this.makeRequest(
      'DELETE',
      '/openApi/swap/v2/trade/order',
      {
        symbol,
        orderId
      }
    );

    if (response.code !== 0) {
      throw new Error(`Failed to cancel order: ${response.msg}`);
    }

    return response.data;
  }

  /**
   * Get all orders
   */
  async getOrders(symbol: string): Promise<BingXOrder[]> {
    console.log('[BingXService] Fetching orders for:', symbol);

    const response = await this.makeRequest<BingXOrder[]>(
      'GET',
      '/openApi/swap/v2/trade/openOrders',
      { symbol }
    );

    if (response.code !== 0) {
      throw new Error(`Failed to get orders: ${response.msg}`);
    }

    return response.data || [];
  }

  /**
   * Get ticker/market data for all symbols
   */
  async getTickers(): Promise<BingXTicker[]> {
    console.log('[BingXService] Fetching all tickers...');

    const response = await this.makeRequest<BingXTicker[]>(
      'GET',
      '/openApi/swap/v2/quote/ticker',
      {}
    );

    if (response.code !== 0) {
      throw new Error(`Failed to get tickers: ${response.msg}`);
    }

    return response.data || [];
  }

  /**
   * Get funding rate for a symbol
   */
  async getFundingRate(symbol: string): Promise<BingXFundingRate> {
    console.log('[BingXService] Fetching funding rate for:', symbol);

    const response = await this.makeRequest<BingXFundingRate>(
      'GET',
      '/openApi/swap/v2/quote/fundingRate',
      { symbol }
    );

    if (response.code !== 0) {
      throw new Error(`Failed to get funding rate: ${response.msg}`);
    }

    return response.data;
  }

  /**
   * Get funding rates for all symbols using the premium index endpoint
   * This endpoint returns the ACTUAL funding rate (lastFundingRate) for all symbols in a single request.
   *
   * Endpoint: GET /openApi/swap/v2/quote/premiumIndex (public endpoint, no auth required)
   * Returns: Array of { symbol, markPrice, indexPrice, lastFundingRate, nextFundingTime }
   */
  async getAllFundingRates(): Promise<BingXFundingRate[]> {
    console.log('[BingXService] Fetching all funding rates from premium index endpoint...');

    // Premium index is a public endpoint, no authentication needed
    const url = `${this.baseUrl}/openApi/swap/v2/quote/premiumIndex`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BingX API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`Failed to get funding rates: ${data.msg}`);
      }

      const premiumIndexData = data.data || [];
      console.log(`[BingXService] Received ${premiumIndexData.length} premium index entries`);

      // Log a few samples with non-zero funding rates
      const samplesWithRate = premiumIndexData.filter((d: any) => d.lastFundingRate && parseFloat(d.lastFundingRate) !== 0).slice(0, 5);
      if (samplesWithRate.length > 0) {
        console.log('[BingXService] Sample funding rates:');
        samplesWithRate.forEach((d: any) => {
          console.log(`  ${d.symbol}: lastFundingRate=${d.lastFundingRate}, nextFundingTime=${d.nextFundingTime}`);
        });
      }

      // Transform to funding rate format
      const fundingRates: BingXFundingRate[] = premiumIndexData.map((item: any) => ({
        symbol: item.symbol,
        fundingRate: item.lastFundingRate || '0',
        fundingTime: item.nextFundingTime || Date.now(),
        markPrice: item.markPrice
      }));

      console.log(`[BingXService] Transformed ${fundingRates.length} funding rates`);
      return fundingRates;
    } catch (error: any) {
      console.error('[BingXService] Failed to fetch premium index:', error.message);
      throw error;
    }
  }

  /**
   * Get account info (for authentication verification)
   */
  async getAccountInfo(): Promise<BingXAccountInfo> {
    return this.getBalance();
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, positionSide: 'LONG' | 'SHORT'): Promise<any> {
    console.log('[BingXService] Closing position:', { symbol, positionSide });

    // To close a position, we need to place a market order in opposite direction
    const side = positionSide === 'LONG' ? 'SELL' : 'BUY';

    const orderRequest: BingXOrderRequest = {
      symbol,
      side,
      positionSide,
      type: 'MARKET',
      closePosition: true
    };

    return this.placeOrder(orderRequest);
  }

  /**
   * Get wallet balance (similar to getBalance but different format)
   */
  async getWalletBalance(): Promise<BingXWalletBalance> {
    const balance = await this.getBalance();
    return {
      asset: 'USDT',
      balance: balance
    };
  }
}
