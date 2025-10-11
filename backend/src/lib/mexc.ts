import crypto from 'crypto';
import { MexcFuturesClient } from 'mexc-futures-sdk';
import type { SubmitOrderRequest, Position as SDKPosition, AccountAsset } from 'mexc-futures-sdk';
import {
  MEXCConfig,
  MEXCAccountInfo,
  MEXCPosition,
  MEXCOrderRequest,
  MEXCOrder,
  MEXCTicker,
  MEXCFundingRate,
  MEXCApiResponse,
  MEXCWalletBalance
} from '../types/mexc';

/**
 * MEXC API Service
 *
 * Implements authentication and API calls for MEXC Perpetual Futures
 * Documentation: https://mexcdevelop.github.io/apidocs/contract_v1_en/
 */
export class MEXCService {
  private apiKey: string;
  private apiSecret: string;
  private authToken?: string;
  private baseUrl: string;
  private enableRateLimit: boolean;
  private sdkClient?: MexcFuturesClient; // SDK client for browser token authentication

  constructor(config: MEXCConfig) {
    // Store authentication token if provided
    this.authToken = config.authToken?.trim();

    // Trim API keys to remove any whitespace
    this.apiKey = config.apiKey.trim();
    this.apiSecret = config.apiSecret.trim();
    this.enableRateLimit = config.enableRateLimit ?? true;

    // MEXC Futures API base URL (updated to match web interface)
    this.baseUrl = 'https://futures.mexc.com';

    // Initialize SDK client if authToken is provided
    if (this.authToken) {
      try {
        this.sdkClient = new MexcFuturesClient({
          authToken: this.authToken,
          // Let SDK use its default baseURL (https://futures.mexc.com)
          logLevel: 'info'
        });
        console.log('[MEXCService] Initialized with mexc-futures-sdk (browser token authentication):', {
          authTokenLength: this.authToken.length,
          authTokenPrefix: this.authToken.substring(0, 20) + '...',
          sdkEnabled: true,
          note: 'Using mexc-futures-sdk for browser token authentication - supports /api/v1/private/order/submit endpoint with proper encryption'
        });
      } catch (error: any) {
        console.error('[MEXCService] Failed to initialize SDK client:', error.message);
        console.log('[MEXCService] Falling back to API key authentication');
      }
    } else {
      console.log('[MEXCService] Initialized with API key authentication:', {
        apiKeyLength: this.apiKey.length,
        apiSecretLength: this.apiSecret.length,
        apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
        sdkEnabled: false
      });
    }
  }

  /**
   * Generate signature for MEXC API requests
   * MEXC uses HMAC SHA256 signature with specific format per HTTP method
   *
   * Authentication flow:
   * 1. For GET/DELETE: Sort parameters alphabetically and concatenate with &
   * 2. For POST: Use JSON string directly as parameter string
   * 3. Create signature string: AccessKey + timestamp + parameter_string
   * 4. Generate HMAC SHA256 signature
   * 5. Include signature in "Signature" header
   */
  private generateSignature(
    method: 'GET' | 'POST',
    timestamp: number,
    params: Record<string, any>
  ): string {
    let paramString = '';

    if (method === 'POST') {
      // For POST: Use JSON string directly
      paramString = JSON.stringify(params);
    } else {
      // For GET: Sort parameters alphabetically and concatenate with &
      const sortedKeys = Object.keys(params).sort();
      paramString = sortedKeys
        .map((key) => `${key}=${params[key]}`)
        .join('&');
    }

    // MEXC signature format: AccessKey + timestamp + parameter_string
    const signatureString = this.apiKey + timestamp + paramString;

    console.log('[MEXCService] Signature calculation:', {
      method,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
      timestamp,
      paramString: paramString.substring(0, 100) + '...',
      signatureStringLength: signatureString.length,
      secretPrefix: this.apiSecret.substring(0, 8) + '...'
    });

    // Generate HMAC SHA256 signature
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(signatureString)
      .digest('hex');

    return signature;
  }

  /**
   * Make authenticated API request
   * @param useSessionToken - If true, uses browser session token instead of API keys (only for trading operations)
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    params: Record<string, any> = {},
    useSessionToken: boolean = false
  ): Promise<MEXCApiResponse<T>> {
    // Build URL
    let url = `${this.baseUrl}${endpoint}`;
    let body: string | undefined;
    let headers: Record<string, string>;

    // Choose authentication method
    // Use session token ONLY if explicitly requested AND token is available
    if (useSessionToken && this.authToken) {
      // Browser session token authentication
      console.log('[MEXCService] Making request with session token:', {
        endpoint,
        method,
        paramsCount: Object.keys(params).length
      });

      headers = {
        'authorization': this.authToken,
        'Content-Type': 'application/json'
      };

      if (method === 'POST') {
        body = JSON.stringify(params);
        console.log('[MEXCService] Request body:', body);
      } else {
        // GET: Parameters in URL query string
        if (Object.keys(params).length > 0) {
          const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
            .join('&');
          url = `${url}?${queryString}`;
        }
        console.log('[MEXCService] Request URL (truncated):', url.substring(0, 100) + '...');
      }
    } else {
      // Standard API key authentication
      const timestamp = Date.now();

      console.log('[MEXCService] Making request with API key:', {
        endpoint,
        method,
        timestamp,
        paramsCount: Object.keys(params).length
      });

      // Generate signature (pass method, timestamp, and params)
      const signature = this.generateSignature(method, timestamp, params);

      headers = {
        'ApiKey': this.apiKey,
        'Request-Time': timestamp.toString(),
        'Signature': signature,
        'Content-Type': 'application/json'
      };

      if (method === 'POST') {
        // POST: Parameters in body as JSON (no timestamp in body)
        body = JSON.stringify(params);
        console.log('[MEXCService] Request body:', body);
      } else {
        // GET: Parameters in URL query string (no timestamp in query)
        if (Object.keys(params).length > 0) {
          const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
            .join('&');
          url = `${url}?${queryString}`;
        }
        console.log('[MEXCService] Request URL (truncated):', url.substring(0, 100) + '...');
      }
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MEXCService] API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          endpoint,
          authMethod: this.authToken ? 'session-token' : 'api-key'
        });
        throw new Error(`MEXC API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // Check if the response indicates an error
      if (!data.success || data.code !== 0) {
        console.error('[MEXCService] API returned error:', {
          endpoint,
          code: data.code,
          success: data.success,
          authMethod: this.authToken ? 'session-token' : 'api-key'
        });
      } else {
        console.log('[MEXCService] Request successful:', {
          endpoint,
          code: data.code
        });
      }

      return data as MEXCApiResponse<T>;
    } catch (error: any) {
      console.error('[MEXCService] API request failed:', {
        error: error.message,
        endpoint,
        authMethod: this.authToken ? 'session-token' : 'api-key'
      });
      throw error;
    }
  }

  /**
   * Get account assets/balance
   * Endpoint: GET /api/v1/private/account/assets (API key)
   * Or uses SDK's getAccountAsset (browser token)
   */
  async getBalance(): Promise<MEXCAccountInfo> {
    console.log('[MEXCService] Fetching account balance...');

    // Use SDK if available (browser token authentication)
    if (this.sdkClient) {
      try {
        console.log('[MEXCService] Using SDK to get account balance');
        const response = await this.sdkClient.getAccountAsset('USDT');

        console.log('[MEXCService] SDK getAccountAsset response:', {
          success: response.success,
          code: response.code,
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : []
        });

        if (!response.success || response.code !== 0) {
          console.error('[MEXCService] SDK returned error response:', response);
          throw new Error(`Failed to get balance: code ${response.code}, success: ${response.success}`);
        }

        // Map SDK response to our format
        return {
          currency: response.data.currency,
          positionMargin: response.data.positionMargin,
          frozenBalance: response.data.frozenBalance,
          availableBalance: response.data.availableBalance,
          cashBalance: response.data.cashBalance,
          equity: response.data.equity,
          unrealized: response.data.unrealized
        };
      } catch (error: any) {
        console.error('[MEXCService] SDK getAccountAsset failed:', {
          error: error.message,
          stack: error.stack,
          name: error.name
        });
        // Fall back to API key authentication instead of throwing
        console.log('[MEXCService] Falling back to API key authentication...');
      }
    }

    // Fallback to API key authentication
    const response = await this.makeRequest<MEXCAccountInfo[]>(
      'GET',
      '/api/v1/private/account/assets',
      {}
    );

    if (!response.success || response.code !== 0) {
      throw new Error(`Failed to get balance: code ${response.code}`);
    }

    // MEXC returns array of assets, typically USDT for perpetual futures
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data[0];
    }

    // Return empty balance if no data
    return {
      currency: 'USDT',
      positionMargin: 0,
      frozenBalance: 0,
      availableBalance: 0,
      cashBalance: 0,
      equity: 0,
      unrealized: 0
    };
  }

  /**
   * Get all open positions
   * Endpoint: GET /api/v1/private/position/open_positions (API key)
   * Or uses SDK's getOpenPositions (browser token)
   */
  async getPositions(symbol?: string): Promise<MEXCPosition[]> {
    console.log('[MEXCService] Fetching positions...');

    // Use SDK if available (browser token authentication)
    if (this.sdkClient) {
      try {
        console.log('[MEXCService] Using SDK to get open positions');
        const response = await this.sdkClient.getOpenPositions(symbol);

        if (!response.success || response.code !== 0) {
          throw new Error(`Failed to get positions: code ${response.code}`);
        }

        // Map SDK positions to our format
        // SDK positions already match MEXCPosition type, but we need to ensure proper mapping
        return (response.data || []).map((pos: SDKPosition) => ({
          positionId: pos.positionId,
          symbol: pos.symbol,
          positionType: pos.positionType,
          openType: pos.openType,
          state: pos.state,
          holdVol: pos.holdVol.toString(),
          frozenVol: pos.frozenVol.toString(),
          closeVol: pos.closeVol.toString(),
          holdAvgPrice: pos.holdAvgPrice.toString(),
          openAvgPrice: pos.openAvgPrice.toString(),
          closeAvgPrice: pos.closeAvgPrice.toString(),
          liquidatePrice: pos.liquidatePrice.toString(),
          oim: pos.oim.toString(),
          adlLevel: pos.adlLevel,
          im: pos.im.toString(),
          holdFee: pos.holdFee.toString(),
          realised: pos.realised.toString(),
          leverage: pos.leverage,
          createTime: pos.createTime,
          updateTime: pos.updateTime,
          autoAddIm: pos.autoAddIm
        }));
      } catch (error: any) {
        console.error('[MEXCService] SDK getOpenPositions failed:', error.message);
        throw error;
      }
    }

    // Fallback to API key authentication
    const params: Record<string, any> = {};
    if (symbol) {
      params.symbol = symbol;
    }

    const response = await this.makeRequest<MEXCPosition[]>(
      'GET',
      '/api/v1/private/position/open_positions',
      params
    );

    if (!response.success || response.code !== 0) {
      throw new Error(`Failed to get positions: code ${response.code}`);
    }

    return response.data || [];
  }

  /**
   * Place an order
   * Endpoint: POST /api/v1/private/order/submit (SDK - browser token)
   * Or POST /api/v1/private/order/create (API key fallback)
   */
  async placeOrder(orderRequest: MEXCOrderRequest): Promise<MEXCOrder> {
    console.log('[MEXCService] Placing order:', orderRequest);

    // Use SDK if available (browser token authentication with proper encryption)
    if (this.sdkClient) {
      try {
        console.log('[MEXCService] Using SDK to place order (submitOrder endpoint)');

        // Get contract details to determine proper quantity precision
        const rawVolume = parseFloat(orderRequest.vol.toString());
        let adjustedVolume = rawVolume;

        try {
          console.log('[MEXCService] Fetching contract details for:', orderRequest.symbol);
          const contractDetails = await this.sdkClient.getContractDetail(orderRequest.symbol);

          if (contractDetails.success && contractDetails.data) {
            const contracts = Array.isArray(contractDetails.data) ? contractDetails.data : [contractDetails.data];
            const contract = contracts.find((c: any) => c.symbol === orderRequest.symbol);

            if (contract) {
              console.log('[MEXCService] Contract trading rules:', {
                symbol: contract.symbol,
                volPrecision: contract.volPrecision,
                minVol: contract.minVol,
                maxVol: contract.maxVol
              });

              // Round according to contract's volume precision
              const precision = contract.volPrecision || 0;
              const multiplier = Math.pow(10, precision);
              adjustedVolume = Math.round(rawVolume * multiplier) / multiplier;

              // Ensure it meets minimum volume requirement
              if (contract.minVol && adjustedVolume < contract.minVol) {
                console.log(`[MEXCService] Adjusting volume to meet minVol: ${contract.minVol}`);
                adjustedVolume = contract.minVol;
              }
            }
          }
        } catch (contractError: any) {
          console.log('[MEXCService] Could not fetch contract details, using default rounding:', contractError.message);
          // Fallback: use integer rounding for volumes >= 1
          adjustedVolume = rawVolume >= 1 ? Math.round(rawVolume) : Math.round(rawVolume * 10000) / 10000;
        }

        console.log('[MEXCService] Volume adjustment:', {
          original: rawVolume,
          adjusted: adjustedVolume,
          symbol: orderRequest.symbol
        });

        // Map our order request to SDK format
        const sdkOrderRequest: SubmitOrderRequest = {
          symbol: orderRequest.symbol,
          price: parseFloat(orderRequest.price?.toString() || '0'),
          vol: adjustedVolume,
          side: orderRequest.side, // 1: open long, 2: open short, 3: close short, 4: close long
          type: orderRequest.type, // 1: limit, 5: market, etc.
          openType: orderRequest.openType, // 1: isolated, 2: cross
          positionId: orderRequest.positionId,
          leverage: orderRequest.leverage,
          externalOid: orderRequest.externalOid,
          stopLossPrice: orderRequest.stopLossPrice ? parseFloat(orderRequest.stopLossPrice.toString()) : undefined,
          takeProfitPrice: orderRequest.takeProfitPrice ? parseFloat(orderRequest.takeProfitPrice.toString()) : undefined,
          positionMode: orderRequest.positionMode,
          reduceOnly: orderRequest.reduceOnly
        };

        const response = await this.sdkClient.submitOrder(sdkOrderRequest);

        if (!response.success || response.code !== 0) {
          console.error('[MEXCService] SDK order failed:', {
            code: response.code,
            message: response.message,
            orderRequest
          });

          // Code 1002 means "Contract not activated"
          if (response.code === 1002) {
            throw new Error(
              `Contract ${orderRequest.symbol} is not activated on your MEXC account. ` +
              `To activate it: Open https://www.mexc.com/futures/${orderRequest.symbol}?type=linear_swap in your browser. ` +
              `The contract will be activated automatically when you view the trading page. ` +
              `Then try placing the order again.`
            );
          }

          throw new Error(`Failed to place order: code ${response.code} - ${response.message || 'unknown error'}`);
        }

        // Map SDK response to our format
        // SDK returns order ID as data
        return {
          orderId: response.data?.toString() || '0',
          symbol: orderRequest.symbol,
          price: orderRequest.price || 0,
          vol: orderRequest.vol,
          leverage: orderRequest.leverage || 1,
          side: orderRequest.side,
          type: orderRequest.type,
          openType: orderRequest.openType,
          state: 1, // Assuming order is placed successfully
          orderMargin: 0,
          takerFee: 0,
          makerFee: 0,
          profit: 0,
          feeCurrency: 'USDT',
          createTime: Date.now(),
          updateTime: Date.now()
        } as MEXCOrder;
      } catch (error: any) {
        console.error('[MEXCService] SDK submitOrder failed:', error.message);
        throw error;
      }
    }

    // Fallback to API key authentication
    const response = await this.makeRequest<MEXCOrder>(
      'POST',
      '/api/v1/private/order/create',
      orderRequest as any,
      false
    );

    if (!response.success || response.code !== 0) {
      console.error('[MEXCService] Order failed:', {
        code: response.code,
        orderRequest
      });

      // Code 1002 means "Contract not activated"
      if (response.code === 1002) {
        throw new Error(
          `Contract ${orderRequest.symbol} is not activated on your MEXC account. ` +
          `To activate it: Open https://www.mexc.com/futures/${orderRequest.symbol}?type=linear_swap in your browser. ` +
          `The contract will be activated automatically when you view the trading page. ` +
          `Then try placing the order again.`
        );
      }

      throw new Error(`Failed to place order: code ${response.code}`);
    }

    return response.data;
  }

  /**
   * Cancel an order
   * Endpoint: POST /api/v1/private/order/cancel (API key)
   * Or uses SDK's cancelOrder (browser token)
   */
  async cancelOrder(symbol: string, orderId: string): Promise<any> {
    console.log('[MEXCService] Canceling order:', { symbol, orderId });

    // Use SDK if available (browser token authentication)
    if (this.sdkClient) {
      try {
        console.log('[MEXCService] Using SDK to cancel order');
        const orderIdNum = parseInt(orderId, 10);
        const response = await this.sdkClient.cancelOrder([orderIdNum]);

        if (!response.success || response.code !== 0) {
          throw new Error(`Failed to cancel order: code ${response.code}`);
        }

        return response.data;
      } catch (error: any) {
        console.error('[MEXCService] SDK cancelOrder failed:', error.message);
        throw error;
      }
    }

    // Fallback to API key authentication
    const response = await this.makeRequest(
      'POST',
      '/api/v1/private/order/cancel',
      {
        symbol,
        order_id: orderId
      }
    );

    if (!response.success || response.code !== 0) {
      throw new Error(`Failed to cancel order: code ${response.code}`);
    }

    return response.data;
  }

  /**
   * Get all open orders
   * Endpoint: GET /api/v1/private/order/list/open_orders/{symbol}
   */
  async getOrders(symbol: string): Promise<MEXCOrder[]> {
    console.log('[MEXCService] Fetching orders for:', symbol);

    const response = await this.makeRequest<MEXCOrder[]>(
      'GET',
      `/api/v1/private/order/list/open_orders/${symbol}`,
      {}
    );

    if (!response.success || response.code !== 0) {
      throw new Error(`Failed to get orders: code ${response.code}`);
    }

    return response.data || [];
  }

  /**
   * Get all tickers (market data)
   * Endpoint: GET /api/v1/contract/ticker
   */
  async getTickers(): Promise<MEXCTicker[]> {
    console.log('[MEXCService] Fetching all tickers...');

    const response = await this.makeRequest<MEXCTicker[]>(
      'GET',
      '/api/v1/contract/ticker',
      {}
    );

    if (!response.success || response.code !== 0) {
      throw new Error(`Failed to get tickers: code ${response.code}`);
    }

    const allTickers = response.data || [];

    // Filter out tickers without valid price data
    const validTickers = allTickers.filter((ticker: MEXCTicker) => {
      const hasValidPrice = ticker.lastPrice > 0 || ticker.fairPrice > 0;

      if (!hasValidPrice) {
        console.log(`[MEXCService] Filtered out ${ticker.symbol} - no valid price data`);
      }

      return hasValidPrice;
    });

    console.log(`[MEXCService] Returning ${validTickers.length}/${allTickers.length} tickers`);
    return validTickers;
  }

  /**
   * Get funding rate for a symbol
   * Endpoint: GET /api/v1/contract/funding_rate/{symbol}
   */
  async getFundingRate(symbol: string): Promise<MEXCFundingRate> {
    console.log('[MEXCService] Fetching funding rate for:', symbol);

    const response = await this.makeRequest<MEXCFundingRate>(
      'GET',
      `/api/v1/contract/funding_rate/${symbol}`,
      {}
    );

    if (!response.success || response.code !== 0) {
      throw new Error(`Failed to get funding rate: code ${response.code}`);
    }

    return response.data;
  }

  /**
   * Get all funding rates (OPTIMIZED)
   * Uses ticker data which already includes fundingRate, eliminating need for 835 individual requests
   * Then fetches nextSettleTime only for symbols with non-zero funding rates
   */
  async getAllFundingRates(): Promise<MEXCFundingRate[]> {
    console.log('[MEXCService] Fetching all funding rates from tickers (optimized)...');

    // Get all tickers - includes fundingRate for all symbols in ONE request
    const tickers = await this.getTickers();

    // Filter tickers that have funding rates
    const tickersWithFundingRate = tickers.filter(t => t.fundingRate !== undefined && t.fundingRate !== 0);

    console.log(`[MEXCService] Found ${tickersWithFundingRate.length}/${tickers.length} tickers with funding rates`);

    // For symbols with funding rates, fetch full details to get nextSettleTime
    const detailPromises = tickersWithFundingRate.map(ticker =>
      this.getFundingRate(ticker.symbol).catch(err => {
        // Silently use ticker data if detail fetch fails
        console.log(`[MEXCService] Using ticker data for ${ticker.symbol} (detail fetch failed)`);
        return {
          symbol: ticker.symbol,
          fundingRate: ticker.fundingRate,
          nextSettleTime: 0, // Will be calculated based on standard MEXC 8-hour cycle
        };
      })
    );

    const fundingRates = await Promise.all(detailPromises);

    console.log(`[MEXCService] Retrieved ${fundingRates.length} funding rates`);
    return fundingRates;
  }

  /**
   * Get funding rates for specific symbols only (SUPER OPTIMIZED)
   * Uses ticker data which already includes fundingRate for ALL symbols in ONE request
   * Then fetches nextSettleTime only for symbols with non-zero funding rates
   * @param targetSymbols - Array of symbols in MEXC format (e.g., ['BTC_USDT', 'ETH_USDT'])
   */
  async getFundingRatesForSymbols(targetSymbols: string[]): Promise<MEXCFundingRate[]> {
    console.log(`[MEXCService] Fetching funding rates for ${targetSymbols.length} specific symbols (super optimized)...`);

    // Get all tickers in ONE request - much faster than individual requests
    const allTickers = await this.getTickers();

    // Create a map for quick lookup
    const symbolSet = new Set(targetSymbols);

    // Filter to only requested symbols that have funding rates
    const matchedTickers = allTickers.filter(t =>
      symbolSet.has(t.symbol) &&
      t.fundingRate !== undefined &&
      t.fundingRate !== 0
    );

    console.log(`[MEXCService] Found ${matchedTickers.length}/${targetSymbols.length} requested symbols with funding rates in ticker data`);

    // Create ticker map for lastPrice lookup
    const tickerMap = new Map(matchedTickers.map(t => [t.symbol, t]));

    // For symbols with funding rates, fetch full details to get nextSettleTime
    const detailPromises = matchedTickers.map(ticker =>
      this.getFundingRate(ticker.symbol).catch(err => {
        // Silently use ticker data if detail fetch fails
        console.log(`[MEXCService] Using ticker data for ${ticker.symbol} (detail fetch failed)`);
        return {
          symbol: ticker.symbol,
          fundingRate: ticker.fundingRate,
          nextSettleTime: Date.now() + (8 * 60 * 60 * 1000), // Default to 8 hours from now
          lastPrice: ticker.lastPrice, // Include lastPrice from ticker
        };
      }).then(detail => {
        // Add lastPrice from ticker to detail result
        const tickerData = tickerMap.get(detail.symbol);
        return {
          ...detail,
          lastPrice: tickerData?.lastPrice || 0,
        };
      })
    );

    const fundingRates = await Promise.all(detailPromises);

    console.log(`[MEXCService] Retrieved ${fundingRates.length} funding rates with details`);
    return fundingRates;
  }

  /**
   * Get account info (for authentication verification)
   */
  async getAccountInfo(): Promise<MEXCAccountInfo> {
    return this.getBalance();
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, positionId: number, positionType: 1 | 2): Promise<any> {
    console.log('[MEXCService] Closing position:', { symbol, positionId, positionType });

    // To close a position:
    // - If position is LONG (type 1), we need to CLOSE_LONG (side 4)
    // - If position is SHORT (type 2), we need to CLOSE_SHORT (side 2)
    const side = positionType === 1 ? 4 : 2;

    // Get position details to determine volume
    const positions = await this.getPositions(symbol);
    const position = positions.find(p => p.positionId === positionId);

    if (!position) {
      throw new Error(`Position ${positionId} not found`);
    }

    const orderRequest: MEXCOrderRequest = {
      symbol,
      vol: parseFloat(position.holdVol),
      side,
      type: 5, // Market order
      openType: position.openType,
      positionId
    };

    return this.placeOrder(orderRequest);
  }

  /**
   * Set leverage for a symbol
   * Endpoint: POST /api/v1/private/position/change_leverage
   */
  async setLeverage(
    symbol: string,
    leverage: number,
    openType: 1 | 2 = 2, // 1: isolated, 2: cross (default)
    positionType?: 1 | 2 // 1: long, 2: short (optional, for hedge mode)
  ): Promise<any> {
    console.log('[MEXCService] Setting leverage:', {
      symbol,
      leverage,
      openType,
      positionType
    });

    // Validate leverage range
    if (leverage < 1 || leverage > 125) {
      throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
    }

    const params: any = {
      symbol,
      leverage,
      openType
    };

    if (positionType) {
      params.positionType = positionType;
    }

    const response = await this.makeRequest(
      'POST',
      '/api/v1/private/position/change_leverage',
      params
    );

    if (!response.success || response.code !== 0) {
      console.error('[MEXCService] Set leverage failed:', {
        code: response.code,
        symbol,
        leverage
      });

      // Code 600/602 often means:
      // - Symbol doesn't support leverage changes
      // - Leverage already at desired value
      // - Invalid parameters for this specific symbol
      // - API keys don't have permission to change leverage
      // Treat as non-fatal (leverage might already be set or unchangeable)
      if (response.code === 600 || response.code === 602) {
        console.log(`[MEXCService] ⚠️ Code ${response.code} for ${symbol} - leverage may already be set or API lacks permission, continuing...`);
        return { success: true, message: 'leverage not modified (already set or no permission)' };
      }

      throw new Error(`Failed to set leverage: code ${response.code}`);
    }

    console.log('[MEXCService] Leverage set successfully');
    return response.data;
  }

  /**
   * Get wallet balance (similar to getBalance but different format)
   */
  async getWalletBalance(): Promise<MEXCWalletBalance> {
    const balance = await this.getBalance();
    return {
      currency: 'USDT',
      balance
    };
  }
}
