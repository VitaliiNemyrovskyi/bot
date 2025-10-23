import crypto from 'crypto';
import {
  GateIOConfig,
  GateIOAccountInfo,
  GateIOPosition,
  GateIOOrderRequest,
  GateIOOrder,
  GateIOTicker,
  GateIOFundingRate,
  GateIOContract,
  GateIOBalance
} from '../types/gateio';

/**
 * Gate.io API Service
 *
 * Implements authentication and API calls for Gate.io USDT Perpetual Futures
 * Documentation: https://www.gate.io/docs/developers/apiv4/en/#futures-api
 *
 * Authentication: HMAC SHA-512 signature
 * Base URL: https://api.gateio.ws/api/v4/futures/usdt
 * WebSocket URL: wss://fx-ws.gateio.ws/v4/ws/usdt
 */
export class GateIOService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private enableRateLimit: boolean;

  constructor(config: GateIOConfig) {
    // Trim API keys to remove any whitespace
    this.apiKey = config.apiKey.trim();
    this.apiSecret = config.apiSecret.trim();
    this.enableRateLimit = config.enableRateLimit ?? true;

    // Gate.io Futures API base URL
    this.baseUrl = 'https://api.gateio.ws/api/v4/futures/usdt';

    console.log('[GateIOService] Initialized with API key authentication:', {
      apiKeyLength: this.apiKey.length,
      apiSecretLength: this.apiSecret.length,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
    });
  }

  /**
   * Generate signature for Gate.io API requests
   * Gate.io uses HMAC SHA512 signature with specific format
   *
   * Authentication flow:
   * 1. Create signature payload: method + '\n' + url_path + '\n' + query_string + '\n' + body_hash + '\n' + timestamp
   * 2. body_hash = SHA512 hash of request body (empty string for GET/DELETE)
   * 3. Generate HMAC SHA512 signature
   * 4. Include in headers: KEY, Timestamp, SIGN
   */
  private generateSignature(
    method: 'GET' | 'POST' | 'DELETE',
    urlPath: string,
    queryString: string,
    body: string,
    timestamp: string
  ): string {
    // Calculate body hash (SHA512 of body)
    const bodyHash = crypto
      .createHash('sha512')
      .update(body)
      .digest('hex');

    // Create signature payload
    const signaturePayload = `${method}\n${urlPath}\n${queryString}\n${bodyHash}\n${timestamp}`;

    console.log('[GateIOService] Signature calculation:', {
      method,
      urlPath: urlPath.substring(0, 50),
      queryString: queryString.substring(0, 50),
      bodyHashPrefix: bodyHash.substring(0, 16) + '...',
      timestamp,
      payloadLength: signaturePayload.length,
    });

    // Generate HMAC SHA512 signature
    const signature = crypto
      .createHmac('sha512', this.apiSecret)
      .update(signaturePayload)
      .digest('hex');

    return signature;
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoint: string,
    params: Record<string, any> = {},
    body: any = null
  ): Promise<T> {
    // Build URL path (relative to base URL)
    const urlPath = `/api/v4/futures/usdt${endpoint}`;

    // Build query string for GET/DELETE/POST
    // Note: Some Gate.io POST endpoints (like leverage) require query parameters
    let queryString = '';
    if (Object.keys(params).length > 0) {
      queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
    }

    // Build request body for POST
    let bodyString = '';
    if (method === 'POST' && body) {
      bodyString = JSON.stringify(body);
    }

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Generate signature
    const signature = this.generateSignature(
      method,
      urlPath,
      queryString,
      bodyString,
      timestamp
    );

    // Build full URL
    let url = `${this.baseUrl}${endpoint}`;
    if (queryString) {
      url += `?${queryString}`;
    }

    console.log('[GateIOService] Making request:', {
      method,
      endpoint,
      paramsCount: Object.keys(params).length,
      hasBody: !!body,
      timestamp,
    });

    const headers: Record<string, string> = {
      'KEY': this.apiKey,
      'Timestamp': timestamp,
      'SIGN': signature,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: bodyString || undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GateIOService] API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          endpoint,
        });
        throw new Error(`Gate.io API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      console.log('[GateIOService] Request successful:', {
        endpoint,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        dataLength: Array.isArray(data) ? data.length : undefined,
      });

      return data as T;
    } catch (error: any) {
      console.error('[GateIOService] API request failed:', {
        error: error.message,
        endpoint,
      });
      throw error;
    }
  }

  /**
   * Make public API request (no authentication)
   */
  private async makePublicRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;

    console.log('[GateIOService] Making public request:', {
      endpoint,
      method,
      paramsCount: Object.keys(params).length,
    });

    // For GET requests, add parameters to query string
    if (method === 'GET' && Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join('&');
      url = `${url}?${queryString}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify(params) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GateIOService] Public API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          endpoint,
        });
        throw new Error(`Gate.io API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      console.log('[GateIOService] Public request successful:', {
        endpoint,
        dataType: Array.isArray(data) ? 'array' : typeof data,
      });

      return data as T;
    } catch (error: any) {
      console.error('[GateIOService] Public API request failed:', {
        error: error.message,
        endpoint,
      });
      throw error;
    }
  }

  /**
   * Get account information
   * Endpoint: GET /accounts (baseUrl already includes settle=usdt)
   */
  async getAccountInfo(): Promise<GateIOAccountInfo> {
    console.log('[GateIOService] Fetching account info...');

    const data = await this.makeRequest<GateIOAccountInfo>(
      'GET',
      '/accounts',
      {}
    );

    console.log('[GateIOService] Account info retrieved:', {
      currency: data.currency,
      available: data.available,
      total: data.total,
    });

    return data;
  }

  /**
   * Get futures account balance
   * Endpoint: GET /accounts/{settle}
   */
  async getBalance(): Promise<GateIOAccountInfo> {
    return this.getAccountInfo();
  }

  /**
   * Get all positions or positions for a specific contract
   * Endpoint: GET /positions (baseUrl already includes settle=usdt)
   */
  async getPositions(contract?: string): Promise<GateIOPosition[]> {
    console.log('[GateIOService] Fetching positions...', contract ? `for ${contract}` : '');

    const params: Record<string, any> = {};
    if (contract) {
      params.contract = contract;
    }

    const data = await this.makeRequest<GateIOPosition[]>(
      'GET',
      '/positions',
      params
    );

    console.log('[GateIOService] Positions retrieved:', {
      count: data.length,
      contracts: data.map(p => p.contract),
    });

    return data;
  }

  /**
   * Place an order
   * Endpoint: POST /orders
   */
  async placeOrder(orderRequest: GateIOOrderRequest): Promise<GateIOOrder> {
    console.log('[GateIOService] Placing order:', orderRequest);

    // Prepare order body
    const orderBody: any = {
      contract: orderRequest.contract,
      size: orderRequest.size,
      tif: orderRequest.tif || 'gtc',
    };

    // Add price for limit orders (market orders don't have price)
    if (orderRequest.price) {
      orderBody.price = orderRequest.price;
    }

    // Add optional fields
    if (orderRequest.text) {
      orderBody.text = orderRequest.text;
    }

    if (orderRequest.reduce_only !== undefined) {
      orderBody.reduce_only = orderRequest.reduce_only;
    }

    if (orderRequest.close !== undefined) {
      orderBody.close = orderRequest.close;
    }

    if (orderRequest.iceberg) {
      orderBody.iceberg = orderRequest.iceberg;
    }

    if (orderRequest.auto_size) {
      orderBody.auto_size = orderRequest.auto_size;
    }

    const data = await this.makeRequest<GateIOOrder>(
      'POST',
      '/orders',
      {},
      orderBody
    );

    console.log('[GateIOService] Order placed:', {
      orderId: data.id,
      contract: data.contract,
      size: data.size,
      status: data.status,
    });

    return data;
  }

  /**
   * Cancel an order
   * Endpoint: DELETE /orders/{order_id}
   */
  async cancelOrder(orderId: string): Promise<GateIOOrder> {
    console.log('[GateIOService] Canceling order:', orderId);

    const data = await this.makeRequest<GateIOOrder>(
      'DELETE',
      `/orders/${orderId}`,
      {}
    );

    console.log('[GateIOService] Order canceled:', data.id);

    return data;
  }

  /**
   * Close position
   * Endpoint: POST /orders with close=true
   */
  async closePosition(contract: string): Promise<GateIOOrder> {
    console.log('[GateIOService] Closing position for:', contract);

    // Get current position to determine size
    const positions = await this.getPositions(contract);
    const position = positions.find(p => p.contract === contract && p.size !== 0);

    if (!position) {
      throw new Error(`No open position found for ${contract}`);
    }

    // Place market order with close flag
    const orderBody = {
      contract,
      size: 0, // Size 0 with close=true means close entire position
      close: true,
      tif: 'ioc', // Immediate or cancel for market order
    };

    const data = await this.makeRequest<GateIOOrder>(
      'POST',
      '/orders',
      {},
      orderBody
    );

    console.log('[GateIOService] Position closed:', data.id);

    return data;
  }

  /**
   * Set leverage for a contract
   * Endpoint: POST /positions/{contract}/leverage (baseUrl already includes settle=usdt)
   */
  async setLeverage(
    contract: string,
    leverage: number,
    crossLeverageLimit?: string
  ): Promise<GateIOPosition> {
    console.log('[GateIOService] Setting leverage:', {
      contract,
      leverage,
      crossLeverageLimit,
    });

    // Validate leverage range (Gate.io typically supports 1-100x)
    if (leverage < 1 || leverage > 100) {
      throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 100.`);
    }

    // According to official Gate.io SDK documentation (gateapi-nodejs):
    // Request body should contain leverage as a NUMBER, not string
    // Example: { leverage: 10 } NOT { leverage: "10" }
    const body: any = {
      leverage: leverage, // Send as number per official SDK
    };

    if (crossLeverageLimit) {
      body.cross_leverage_limit = crossLeverageLimit;
    }

    console.log('[GateIOService] Setting leverage for contract:', {
      contract,
      leverage,
      bodyType: typeof leverage,
      body
    });

    const data = await this.makeRequest<GateIOPosition>(
      'POST',
      `/positions/${contract}/leverage`,
      {}, // No query params needed
      body
    );

    console.log('[GateIOService] ✓ Leverage set successfully:', {
      contract: data.contract,
      leverage: data.leverage,
    });

    return data;
  }

  /**
   * Get all tickers (market data) (PUBLIC ENDPOINT)
   * Endpoint: GET /tickers
   */
  async getTickers(): Promise<GateIOTicker[]> {
    console.log('[GateIOService] Fetching all tickers...');

    const data = await this.makePublicRequest<GateIOTicker[]>(
      'GET',
      '/tickers',
      {}
    );

    console.log(`[GateIOService] Retrieved ${data.length} tickers`);
    return data;
  }

  /**
   * Get ticker for a specific contract (PUBLIC ENDPOINT)
   * Endpoint: GET /tickers?contract={contract}
   */
  async getTicker(contract: string): Promise<GateIOTicker> {
    console.log('[GateIOService] Fetching ticker for:', contract);

    const data = await this.makePublicRequest<GateIOTicker[]>(
      'GET',
      '/tickers',
      { contract }
    );

    if (!data || data.length === 0) {
      throw new Error(`No ticker data found for ${contract}`);
    }

    return data[0];
  }

  /**
   * Get funding rate history for a contract (PUBLIC ENDPOINT)
   * Endpoint: GET /funding_rate?contract={contract}
   */
  async getFundingRateHistory(contract: string, limit: number = 100): Promise<GateIOFundingRate[]> {
    console.log('[GateIOService] Fetching funding rate history for:', contract);

    const data = await this.makePublicRequest<GateIOFundingRate[]>(
      'GET',
      '/funding_rate',
      { contract, limit }
    );

    console.log(`[GateIOService] Retrieved ${data.length} funding rate records`);
    return data;
  }

  /**
   * Get contract details (PUBLIC ENDPOINT)
   * Endpoint: GET /contracts/{contract}
   */
  async getContractDetails(contract: string): Promise<GateIOContract> {
    console.log('[GateIOService] Fetching contract details for:', contract);

    const data = await this.makePublicRequest<GateIOContract>(
      'GET',
      `/contracts/${contract}`,
      {}
    );

    console.log('[GateIOService] Contract details retrieved:', {
      name: data.name,
      orderSizeMin: data.order_size_min,
      orderSizeMax: data.order_size_max,
      leverageMax: data.leverage_max,
    });

    return data;
  }

  /**
   * Get all contracts (PUBLIC ENDPOINT)
   * Endpoint: GET /contracts
   */
  async getAllContracts(): Promise<GateIOContract[]> {
    console.log('[GateIOService] Fetching all contracts...');

    const data = await this.makePublicRequest<GateIOContract[]>(
      'GET',
      '/contracts',
      {}
    );

    console.log(`[GateIOService] Retrieved ${data.length} contracts`);
    return data;
  }

  /**
   * Subscribe to WebSocket price stream (ticker updates)
   * Gate.io WebSocket URL: wss://fx-ws.gateio.ws/v4/ws/usdt
   *
   * Channel: futures.tickers
   * Subscribe: { "time": 123456, "channel": "futures.tickers", "event": "subscribe", "payload": ["BTC_USDT"] }
   * Update: { "time": 123456, "channel": "futures.tickers", "event": "update", "result": { "contract": "BTC_USDT", "last": "50000", ... } }
   *
   * @param contract - Trading pair contract (e.g., "BTC_USDT")
   * @param callback - Callback function called on each price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToPriceStream(
    contract: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    console.log(`[GateIOService] Subscribing to price stream for ${contract}`);

    const { websocketManager } = await import('@/services/websocket-manager.service');

    // Gate.io WebSocket configuration
    const wsUrl = 'wss://fx-ws.gateio.ws/v4/ws/usdt';

    const config = {
      url: wsUrl,
      subscribeMessage: {
        time: Math.floor(Date.now() / 1000),
        channel: 'futures.tickers',
        event: 'subscribe',
        payload: [contract],
      },
      heartbeatInterval: 20000, // 20 seconds
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
    };

    // Subscribe using WebSocket manager
    const unsubscribe = await websocketManager.subscribe(
      'gateio',
      contract,
      config,
      (data: any) => {
        try {
          // Gate.io WebSocket ticker format:
          // { "time": 123456, "channel": "futures.tickers", "event": "update", "result": { "contract": "BTC_USDT", "last": "50000", ... } }
          if (data.channel === 'futures.tickers' && data.event === 'update' && data.result) {
            const tickerData = data.result;

            // Match contract
            if (tickerData.contract === contract) {
              const price = parseFloat(tickerData.last);
              const timestamp = data.time * 1000; // Convert to milliseconds

              if (!isNaN(price) && price > 0) {
                callback(price, timestamp);
              } else {
                console.warn(`[GateIOService] Invalid price in WebSocket update for ${contract}:`, tickerData.last);
              }
            }
          }
        } catch (error: any) {
          console.error(`[GateIOService] Error processing WebSocket update for ${contract}:`, error.message);
        }
      }
    );

    console.log(`[GateIOService] Successfully subscribed to price stream for ${contract}`);
    return unsubscribe;
  }

  /**
   * Subscribe to WebSocket mark price stream
   * Gate.io WebSocket mark price channel: futures.mark_price
   *
   * @param contract - Trading pair contract (e.g., "BTC_USDT")
   * @param callback - Callback function called on each mark price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToMarkPriceStream(
    contract: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    console.log(`[GateIOService] Subscribing to mark price stream for ${contract}`);

    const { websocketManager } = await import('@/services/websocket-manager.service');

    // Gate.io WebSocket configuration for mark price
    const wsUrl = 'wss://fx-ws.gateio.ws/v4/ws/usdt';

    const config = {
      url: wsUrl,
      subscribeMessage: {
        time: Math.floor(Date.now() / 1000),
        channel: 'futures.mark_price',
        event: 'subscribe',
        payload: [contract],
      },
      heartbeatInterval: 20000,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
    };

    // Subscribe using WebSocket manager
    const unsubscribe = await websocketManager.subscribe(
      'gateio-mark',
      contract,
      config,
      (data: any) => {
        try {
          // Gate.io WebSocket mark price format:
          // { "time": 123456, "channel": "futures.mark_price", "event": "update", "result": [{ "contract": "BTC_USDT", "mark_price": "50000" }] }
          if (data.channel === 'futures.mark_price' && data.event === 'update' && data.result) {
            const markPriceData = Array.isArray(data.result) ? data.result[0] : data.result;

            if (markPriceData.contract === contract) {
              const price = parseFloat(markPriceData.mark_price);
              const timestamp = data.time * 1000; // Convert to milliseconds

              if (!isNaN(price) && price > 0) {
                callback(price, timestamp);
              } else {
                console.warn(`[GateIOService] Invalid mark price in WebSocket update for ${contract}:`, markPriceData.mark_price);
              }
            }
          }
        } catch (error: any) {
          console.error(`[GateIOService] Error processing WebSocket mark price update for ${contract}:`, error.message);
        }
      }
    );

    console.log(`[GateIOService] Successfully subscribed to mark price stream for ${contract}`);
    return unsubscribe;
  }
}
