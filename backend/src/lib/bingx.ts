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
import { ConnectorStateCacheService } from '@/services/connector-state-cache.service';

/**
 * BingX API Service
 *
 * Implements authentication and API calls for BingX Perpetual Futures
 * Documentation: https://bingx-api.github.io/docs/
 *
 * PERFORMANCE OPTIMIZATION:
 * - Supports persistent time sync caching via PostgreSQL
 * - Eliminates 1-2s initialization delay in serverless environments
 * - Cache TTL: 15 minutes
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

  // Cache support for persistent time sync across serverless invocations
  private userId?: string;
  private credentialId?: string;

  // Position mode cache (Hedge Mode vs One-Way Mode)
  private isHedgeMode: boolean | null = null;

  constructor(config: BingXConfig & { userId?: string; credentialId?: string }) {
    // CRITICAL: Trim API keys to remove any whitespace, newlines, or hidden characters
    // This is a common source of signature verification failures
    this.apiKey = config.apiKey.trim();
    this.apiSecret = config.apiSecret.trim();
    this.enableRateLimit = config.enableRateLimit ?? true;
    this.userId = config.userId;
    this.credentialId = config.credentialId;

    // Log API key/secret lengths for debugging (after trimming)
    console.log('[BingXService] Initialized with credentials:', {
      apiKeyLength: this.apiKey.length,
      apiSecretLength: this.apiSecret.length,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
      apiSecretPrefix: this.apiSecret.substring(0, 8) + '...',
      cacheEnabled: !!(this.userId && this.credentialId)
    });

    // BingX API base URL (mainnet only)
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
   *
   * PERFORMANCE OPTIMIZATION:
   * - Checks PostgreSQL cache first (< 100ms)
   * - Only queries server if cache miss (saves 1-2s)
   * - Caches result with 15-minute TTL
   *
   * RELIABILITY:
   * - Validates cached offset (must be < 2000ms)
   * - Forces re-sync if cached offset is too large
   *
   * @param forceRefresh - If true, bypass cache and always sync with server
   */
  async syncTime(forceRefresh: boolean = false): Promise<void> {
    const syncStartTime = Date.now();
    const MAX_ACCEPTABLE_OFFSET_MS = 2000; // BingX API typically tolerates up to 2-3 seconds

    // Try loading from persistent cache first (if enabled and not forcing refresh)
    if (!forceRefresh && this.userId && this.credentialId) {
      console.log('[BingXService] Checking persistent cache for time sync...');

      const cached = await ConnectorStateCacheService.get(this.userId, this.credentialId);

      if (cached) {
        const cacheAge = Math.floor((Date.now() - cached.lastSyncTime.getTime()) / 1000);

        // Validate cached offset - if too large, force re-sync
        if (Math.abs(cached.timeOffset) > MAX_ACCEPTABLE_OFFSET_MS) {
          console.warn('[BingXService] ⚠️ Cached offset too large, forcing re-sync:', {
            cachedOffset: cached.timeOffset,
            maxAcceptable: MAX_ACCEPTABLE_OFFSET_MS,
            cacheAge: `${cacheAge}s`
          });
          // Continue to server sync below
        } else {
          // Cache HIT with valid offset - use cached offset
          this.timeOffset = cached.timeOffset;
          this.lastSyncTime = cached.lastSyncTime.getTime();

          console.log('[BingXService] ⚡ Time sync loaded from cache:', {
            offset: this.timeOffset,
            cacheAge: `${cacheAge}s`,
            loadTime: `${Date.now() - syncStartTime}ms`
          });

          return; // Skip server sync
        }
      }

      console.log('[BingXService] Cache miss - syncing with server...');
    }

    if (forceRefresh) {
      console.log('[BingXService] Force refresh requested - syncing with server...');
    }

    // Cache MISS or cache disabled - sync with server
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
    console.log('[BingXService] Time synchronized from server:', {
      serverTime,
      localTime: endTime,
      offset: newOffset,
      latency: endTime - startTime,
      totalTime: `${Date.now() - syncStartTime}ms`
    });

    // Warn if offset is large
    if (Math.abs(newOffset) > this.LARGE_OFFSET_WARNING_MS) {
      console.warn(`[BingXService] WARNING: Large time offset detected: ${newOffset}ms. This may cause API request failures.`);
    }

    // Save to persistent cache (if enabled)
    if (this.userId && this.credentialId) {
      try {
        await ConnectorStateCacheService.set(
          this.userId,
          this.credentialId,
          'BINGX',
          {
            timeOffset: this.timeOffset,
            lastSyncTime: new Date(this.lastSyncTime)
          }
        );
        console.log('[BingXService] Time sync cached for future use');
      } catch (error: any) {
        console.error('[BingXService] Failed to cache time sync:', error.message);
        // Don't fail if caching fails - connector still works
      }
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
   * Check if account is in Hedge Mode (dual side position mode)
   *
   * IMPORTANT: The getPositionMode API endpoint does not exist in BingX API
   * (returns error 100400 "this api is not exist")
   *
   * BingX ALWAYS requires positionSide parameter in orders:
   * - One-Way Mode: positionSide MUST be "BOTH"
   * - Hedge Mode: positionSide MUST be "LONG" or "SHORT" (based on BUY/SELL)
   *
   * Returns:
   * - true: Hedge Mode (dual side) - can hold LONG and SHORT simultaneously
   * - false: One-Way Mode - can only hold one direction at a time
   */
  async getPositionMode(): Promise<boolean> {
    // Return cached value if available
    if (this.isHedgeMode !== null) {
      console.log(`[BingXService] Using cached position mode: ${this.isHedgeMode ? 'Hedge Mode' : 'One-Way Mode'}`);
      return this.isHedgeMode;
    }

    // CRITICAL FIX: BingX API does not have a getPositionMode endpoint
    // The API returns error 100400 "this api is not exist"
    //
    // positionSide is ALWAYS REQUIRED in BingX orders:
    // - One-Way Mode: Use "BOTH"
    // - Hedge Mode: Use "LONG" or "SHORT" based on BUY/SELL
    //
    // Default to One-Way Mode (most common setup)
    console.log('[BingXService] BingX does not support position mode detection API');
    console.log('[BingXService] Defaulting to One-Way Mode (positionSide="BOTH")');

    // Default to One-Way Mode
    this.isHedgeMode = false;

    console.log(`[BingXService] Account position mode: One-Way Mode [DEFAULT]`);
    console.log(`[BingXService] positionSide will be set to "BOTH" for all orders`);

    return this.isHedgeMode;
  }

  /**
   * Generate signature for BingX API requests
   * BingX Swap V2 API uses HMAC SHA256 signature with HEX encoding
   *
   * IMPORTANT (from official BingX example):
   * - Parameters are processed in INSERTION ORDER (NOT alphabetically sorted)
   * - Parameters must NOT be URL-encoded when generating signature
   * - The signature must be HEX encoded
   * - Official example: https://bingx-api.github.io/docs/
   */
  private generateSignature(params: Record<string, any>): string {
    // IMPORTANT: DO NOT SORT! Use insertion order as per official BingX example
    // The official example iterates through parameters in the order they appear
    // Reference: https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api

    // Create query string WITHOUT URL encoding (required for signature calculation)
    // Use insertion order (Object.entries preserves insertion order in modern JS)
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    console.log('[BingXService] Signature calculation details:');
    console.log('  Query string (insertion order):', queryString);
    console.log('  API Secret (first 8 chars):', this.apiSecret.substring(0, 8) + '...');

    // Generate HMAC SHA256 signature using HEX encoding
    // This matches the official BingX Node.js example
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');

    console.log('  Generated signature (hex):', signature);

    return signature;
  }

  /**
   * Make authenticated API request with precise parameter ordering
   * Uses array of [key, value] pairs to preserve exact order from official BingX example
   */
  private async makeRequestWithOrder<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    paramsArray: Array<[string, any]>
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
      serverTime: timestamp - this.timeOffset,
      timeOffset: this.timeOffset,
      paramsCount: paramsArray.length
    });

    // Add timestamp to the END of the params array (preserves order)
    const paramsWithTimestamp = [...paramsArray, ['timestamp', timestamp]];

    // Generate signature from params in exact order
    const queryString = paramsWithTimestamp
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    console.log('[BingXService] Signature calculation details:');
    console.log('  Query string (exact order):', queryString);
    console.log('  API Secret (first 8 chars):', this.apiSecret.substring(0, 8) + '...');

    // Generate HMAC SHA256 signature using HEX encoding
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');

    console.log('  Generated signature (hex):', signature);

    // Build URL with URL-encoded parameters in exact order
    const urlParamsString = paramsWithTimestamp
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    // Append signature at the end
    const fullQueryString = `${urlParamsString}&signature=${signature}`;

    console.log('[BingXService] Request method:', method);

    // For POST requests, send parameters in body; for GET/DELETE, use URL query string
    let url: string;
    let body: URLSearchParams | undefined;
    const headers: Record<string, string> = {
      'X-BX-APIKEY': this.apiKey
    };

    if (method === 'POST') {
      // POST: Parameters in body as URLSearchParams (application/x-www-form-urlencoded)
      url = `${this.baseUrl}${endpoint}`;

      // Create URLSearchParams from paramsWithTimestamp array
      body = new URLSearchParams();
      paramsWithTimestamp.forEach(([key, value]) => {
        body!.append(key, String(value));
      });
      body.append('signature', signature);

      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      console.log('[BingXService] Request URL:', url);
      console.log('[BingXService] Request body:', body.toString());
    } else {
      // GET/DELETE: Parameters in URL query string
      url = `${this.baseUrl}${endpoint}?${fullQueryString}`;
      headers['Content-Type'] = 'application/json';
      console.log('[BingXService] Request URL (truncated):', url.substring(0, 120) + '...');
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body
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

    // Prepare params for signature calculation (params first, then timestamp)
    // IMPORTANT: Order matters! Must match official BingX example (insertion order)
    const signatureParams = {
      ...params,
      timestamp
    };

    // Generate signature from params + timestamp (in insertion order)
    const signature = this.generateSignature(signatureParams);

    // Build URL - URL encode all parameter values
    // IMPORTANT: Use INSERTION ORDER (NOT alphabetical) to match signature calculation
    // This matches the official BingX Node.js example
    const paramsString = Object.entries(signatureParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    // Append signature at the end
    const queryString = `${paramsString}&signature=${signature}`;

    // For POST requests, send parameters in body; for GET/DELETE, use URL query string
    let url: string;
    let body: URLSearchParams | undefined;
    const headers: Record<string, string> = {
      'X-BX-APIKEY': this.apiKey
    };

    if (method === 'POST') {
      // POST: Parameters in body as URLSearchParams (application/x-www-form-urlencoded)
      url = `${this.baseUrl}${endpoint}`;

      // Create URLSearchParams from signatureParams
      body = new URLSearchParams();
      Object.entries(signatureParams).forEach(([key, value]) => {
        body!.append(key, String(value));
      });
      body.append('signature', signature);

      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      console.log('[BingXService] Request URL:', url);
      console.log('[BingXService] Request body:', body.toString());
    } else {
      // GET/DELETE: Parameters in URL query string
      url = `${this.baseUrl}${endpoint}?${queryString}`;
      headers['Content-Type'] = 'application/json';
      console.log('[BingXService] Request URL (truncated):', url.substring(0, 100) + '...');
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body
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
   *
   * BingX API v2 Requirements:
   * - symbol: Required
   * - side: Required (BUY/SELL)
   * - positionSide: ALWAYS REQUIRED (LONG/SHORT)
   * - type: Required (MARKET/LIMIT/etc)
   * - quantity: Required for most order types
   * - price: Required for LIMIT orders
   *
   * Position Mode Behavior:
   * - Hedge Mode: Can have LONG and SHORT simultaneously, use orderRequest.positionSide
   * - One-Way Mode: Can only have one direction, derive from side (BUY->LONG, SELL->SHORT)
   */
  async placeOrder(orderRequest: BingXOrderRequest): Promise<BingXOrder> {
    console.log('[BingXService] Placing order:', orderRequest);

    // CRITICAL: Build params array to preserve EXACT order from official BingX example
    // Reference: https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api
    // Official example order: symbol, side, positionSide, type, quantity, takeProfit, timestamp

    // Use array of [key, value] pairs to preserve insertion order
    const paramsArray: Array<[string, any]> = [];

    // Required params in official example order
    paramsArray.push(['symbol', orderRequest.symbol]);
    paramsArray.push(['side', orderRequest.side]);

    // positionSide: ALWAYS REQUIRED by BingX API
    // - One-Way Mode: MUST be "BOTH"
    // - Hedge Mode: MUST be "LONG" or "SHORT"
    if (!orderRequest.positionSide) {
      throw new Error('positionSide is required for all BingX orders. Use "BOTH" for One-Way Mode, or "LONG"/"SHORT" for Hedge Mode.');
    }
    paramsArray.push(['positionSide', orderRequest.positionSide]);
    console.log('[BingXService] Using positionSide:', orderRequest.positionSide);

    paramsArray.push(['type', orderRequest.type]);

    // quantity comes after type (as per official example)
    if (orderRequest.quantity !== undefined && orderRequest.quantity !== null) {
      paramsArray.push(['quantity', orderRequest.quantity]);
    }

    // Add optional parameters after the required ones
    if (orderRequest.price !== undefined) paramsArray.push(['price', orderRequest.price]);
    if (orderRequest.stopPrice !== undefined) paramsArray.push(['stopPrice', orderRequest.stopPrice]);
    if (orderRequest.reduceOnly !== undefined) paramsArray.push(['reduceOnly', orderRequest.reduceOnly]);
    if (orderRequest.timeInForce) paramsArray.push(['timeInForce', orderRequest.timeInForce]);
    if (orderRequest.closePosition !== undefined) paramsArray.push(['closePosition', orderRequest.closePosition]);

    // Add Take Profit and Stop Loss (numeric parameters) - attempting atomic order
    if ((orderRequest as any).takeProfitPrice !== undefined) {
      paramsArray.push(['takeProfitPrice', (orderRequest as any).takeProfitPrice]);
      console.log('[BingXService] ✓ Adding takeProfitPrice (atomic):', (orderRequest as any).takeProfitPrice);
    }
    if ((orderRequest as any).takeProfitTriggerBy) {
      paramsArray.push(['takeProfitTriggerBy', (orderRequest as any).takeProfitTriggerBy]);
      console.log('[BingXService] ✓ Adding takeProfitTriggerBy (atomic):', (orderRequest as any).takeProfitTriggerBy);
    }
    if ((orderRequest as any).stopLossPrice !== undefined) {
      paramsArray.push(['stopLossPrice', (orderRequest as any).stopLossPrice]);
      console.log('[BingXService] ✓ Adding stopLossPrice (atomic):', (orderRequest as any).stopLossPrice);
    }
    if ((orderRequest as any).stopLossTriggerBy) {
      paramsArray.push(['stopLossTriggerBy', (orderRequest as any).stopLossTriggerBy]);
      console.log('[BingXService] ✓ Adding stopLossTriggerBy (atomic):', (orderRequest as any).stopLossTriggerBy);
    }
    if ((orderRequest as any).stopLoss) {
      paramsArray.push(['stopLoss', (orderRequest as any).stopLoss]);
      console.log('[BingXService] ✓ Adding stopLoss (atomic):', (orderRequest as any).stopLoss);
    }
    if ((orderRequest as any).takeProfit) {
      paramsArray.push(['takeProfit', (orderRequest as any).takeProfit]);
      console.log('[BingXService] ✓ Adding takeProfit (atomic):', (orderRequest as any).takeProfit);
    }


    console.log('[BingXService] Order parameters (in order):', paramsArray.map(([k, v]) => `${k}=${v}`).join('&'));

    const response = await this.makeRequestWithOrder<BingXOrder>(
      'POST',
      '/openApi/swap/v2/trade/order',
      paramsArray
    );

    if (response.code !== 0) {
      console.error('[BingXService] Order failed:', {
        code: response.code,
        msg: response.msg,
        sentParams: paramsArray,
        orderRequest,
        fullResponse: JSON.stringify(response)
      });
      throw new Error(`Failed to place order: ${response.msg} (code: ${response.code})`);
    }

    return response.data;
  }

  /**
   * Test order placement without actually executing
   * Uses the BingX test order endpoint
   *
   * @param orderRequest The order parameters to test
   * @returns Test result with validation details
   */
  async testOrder(orderRequest: BingXOrderRequest): Promise<any> {
    console.log('[BingXService] Testing order (no execution):', orderRequest);

    // Use array of [key, value] pairs to preserve insertion order (same as placeOrder)
    const paramsArray: Array<[string, any]> = [];

    // Required params in official example order
    paramsArray.push(['symbol', orderRequest.symbol]);
    paramsArray.push(['side', orderRequest.side]);

    // positionSide: ALWAYS REQUIRED by BingX API
    // - One-Way Mode: MUST be "BOTH"
    // - Hedge Mode: MUST be "LONG" or "SHORT"
    if (!orderRequest.positionSide) {
      throw new Error('positionSide is required for all BingX orders. Use "BOTH" for One-Way Mode, or "LONG"/"SHORT" for Hedge Mode.');
    }
    paramsArray.push(['positionSide', orderRequest.positionSide]);
    console.log('[BingXService] Using positionSide:', orderRequest.positionSide);

    paramsArray.push(['type', orderRequest.type]);

    // quantity comes after type (as per official example)
    if (orderRequest.quantity !== undefined && orderRequest.quantity !== null) {
      paramsArray.push(['quantity', orderRequest.quantity]);
    }

    // Add optional parameters after the required ones
    if (orderRequest.price !== undefined) paramsArray.push(['price', orderRequest.price]);
    if (orderRequest.stopPrice !== undefined) paramsArray.push(['stopPrice', orderRequest.stopPrice]);
    if (orderRequest.reduceOnly !== undefined) paramsArray.push(['reduceOnly', orderRequest.reduceOnly]);
    if (orderRequest.timeInForce) paramsArray.push(['timeInForce', orderRequest.timeInForce]);
    if (orderRequest.closePosition !== undefined) paramsArray.push(['closePosition', orderRequest.closePosition]);

    console.log('[BingXService] Test order parameters (in order):', paramsArray.map(([k, v]) => `${k}=${v}`).join('&'));

    const response = await this.makeRequestWithOrder(
      'POST',
      '/openApi/swap/v2/trade/order/test',
      paramsArray
    );

    if (response.code !== 0) {
      console.error('[BingXService] Test order failed:', {
        code: response.code,
        msg: response.msg,
        sentParams: paramsArray
      });
      throw new Error(`Test order validation failed: ${response.msg} (code: ${response.code})`);
    }

    console.log('[BingXService] Test order validated successfully:', response);
    return response;
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

    const allTickers = response.data || [];

    // Filter out tickers without valid price data
    const validTickers = allTickers.filter((ticker: any) => {
      const lastPrice = parseFloat(ticker.lastPrice) || 0;
      const markPrice = parseFloat(ticker.markPrice) || 0;

      // Only include tickers that have at least one valid price
      const hasValidPrice = lastPrice > 0 || markPrice > 0;

      if (!hasValidPrice) {
        console.log(`[BingXService] Filtered out ${ticker.symbol} - no valid price data (lastPrice: ${ticker.lastPrice}, markPrice: ${ticker.markPrice})`);
      }

      return hasValidPrice;
    });

    console.log(`[BingXService] Returning ${validTickers.length}/${allTickers.length} tickers with valid price data`);
    return validTickers;
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
   * Get contract specifications for all trading pairs
   * Endpoint: GET /openApi/swap/v2/quote/contracts (public endpoint, no auth)
   * Returns trading rules including quantity precision, min quantity, step size, etc.
   */
  async getContracts(): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/openApi/swap/v2/quote/contracts`;

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
        throw new Error(`Failed to get contracts: ${data.msg}`);
      }

      return data.data || [];
    } catch (error: any) {
      console.error('[BingXService] Failed to fetch contracts:', error.message);
      throw error;
    }
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

    // CRITICAL: BingX API requires quantity parameter even with closePosition=true
    // First, fetch the position to get the current quantity
    const positions = await this.getPositions(symbol);
    const position = positions.find((p) => p.symbol === symbol && parseFloat(p.positionAmt || '0') !== 0);

    if (!position) {
      console.log('[BingXService] No open position found for', symbol);
      return { success: true, message: 'No position to close' };
    }

    // Get the absolute quantity from the position
    const quantity = Math.abs(parseFloat(position.positionAmt || '0'));
    console.log(`[BingXService] Found position to close: ${position.positionSide} with quantity ${quantity}`);

    // Check account position mode
    const isHedgeMode = await this.getPositionMode();

    // To close a position, we need to place a market order in opposite direction
    const side = positionSide === 'LONG' ? 'SELL' : 'BUY';

    // Determine correct positionSide based on mode
    const finalPositionSide = isHedgeMode ? positionSide : 'BOTH';

    console.log(`[BingXService] ${isHedgeMode ? 'Hedge' : 'One-Way'} Mode: Closing position with positionSide=${finalPositionSide}, quantity=${quantity}`);

    const orderRequest: BingXOrderRequest = {
      symbol,
      side,
      positionSide: finalPositionSide as any,
      type: 'MARKET',
      quantity,  // REQUIRED: BingX needs quantity even with closePosition=true
      closePosition: true
    };

    return this.placeOrder(orderRequest);
  }

  /**
   * Set leverage for a trading symbol
   * Endpoint: POST /openApi/swap/v2/trade/leverage
   *
   * @param symbol Trading pair symbol (e.g., "BTC-USDT")
   * @param leverage Leverage multiplier (typically 1-100x, depends on symbol)
   * @param side Position side: "LONG" or "SHORT" for hedge mode, "BOTH" for one-way mode
   * @returns Leverage setting result
   */
  async setLeverage(
    symbol: string,
    leverage: number,
    side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH'
  ): Promise<any> {
    console.log('[BingXService] Setting leverage:', {
      symbol,
      leverage,
      side
    });

    // Validate leverage range (1-125x typically, but depends on symbol and position size)
    if (leverage < 1 || leverage > 125) {
      throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
    }

    // Build params array to preserve order
    const paramsArray: Array<[string, any]> = [
      ['symbol', symbol],
      ['side', side],
      ['leverage', leverage]
    ];

    console.log('[BingXService] Leverage parameters:', paramsArray.map(([k, v]) => `${k}=${v}`).join('&'));

    const response = await this.makeRequestWithOrder(
      'POST',
      '/openApi/swap/v2/trade/leverage',
      paramsArray
    );

    if (response.code !== 0) {
      console.error('[BingXService] Set leverage failed:', {
        code: response.code,
        msg: response.msg,
        symbol,
        leverage,
        side
      });
      throw new Error(`Failed to set leverage: ${response.msg} (code: ${response.code})`);
    }

    console.log('[BingXService] Leverage set successfully:', response.data);
    return response.data;
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
