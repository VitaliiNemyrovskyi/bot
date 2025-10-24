import crypto from 'crypto';
import { BaseExchangeConnector, OrderSide } from './base-exchange.connector';

/**
 * BingX Spot Trading Connector
 *
 * Implements BingX Spot API for triangular arbitrage
 * Documentation: https://bingx-api.github.io/docs/#/spot/trade
 *
 * Key differences from Perpetual API:
 * - Base URL: https://open-api.bingx.com
 * - Endpoints: /openApi/spot/v1/...
 * - Uses same authentication (HMAC SHA256)
 */
export class BingXSpotConnector extends BaseExchangeConnector {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://open-api.bingx.com';
  private timeOffset: number = 0;
  private lastSyncTime: number = 0;

  constructor(
    apiKey: string,
    apiSecret: string,
    private userId?: string,
    private credentialId?: string
  ) {
    super();

    // CRITICAL: Trim API keys to remove whitespace
    this.apiKey = apiKey.trim();
    this.apiSecret = apiSecret.trim();
    this.exchangeName = 'BINGX_SPOT';

    console.log('[BingXSpot] Initialized with credentials:', {
      apiKeyLength: this.apiKey.length,
      apiSecretLength: this.apiSecret.length,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
      apiSecretPrefix: this.apiSecret.substring(0, 8) + '...'
    });
  }

  /**
   * Initialize the connector
   * Synchronizes time with BingX server
   */
  async initialize(): Promise<void> {
    console.log('[BingXSpot] Initializing connector...');

    try {
      // Sync time with server
      await this.syncTime();

      // Test authentication by fetching account info
      await this.getAccountInfo();

      this.isInitialized = true;
      console.log('[BingXSpot] Connector initialized successfully');
    } catch (error: any) {
      console.error('[BingXSpot] Failed to initialize:', error.message);
      throw new Error(`Failed to initialize BingX Spot connector: ${error.message}`);
    }
  }

  /**
   * Get BingX server time
   */
  private async getServerTime(): Promise<number> {
    try {
      const url = `${this.baseUrl}/openApi/spot/v1/server/time`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server time API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`Failed to get server time: ${data.msg}`);
      }

      let serverTime = data.data?.serverTime || data.serverTime;

      // BingX may return time in seconds (10 digits) or milliseconds (13 digits)
      // If it's in seconds, convert to milliseconds
      if (serverTime && serverTime.toString().length === 10) {
        serverTime = serverTime * 1000;
      }

      return serverTime || Date.now();
    } catch (error: any) {
      console.error('[BingXSpot] Failed to get server time:', error.message);
      throw error;
    }
  }

  /**
   * Synchronize local time with BingX server
   */
  private async syncTime(): Promise<void> {
    const startTime = Date.now();
    const serverTime = await this.getServerTime();
    const endTime = Date.now();

    // Calculate network latency and adjust
    const latency = (endTime - startTime) / 2;
    const adjustedServerTime = serverTime + latency;

    // Calculate offset
    this.timeOffset = adjustedServerTime - endTime;
    this.lastSyncTime = endTime;

    console.log('[BingXSpot] Time synchronized:', {
      serverTime,
      serverTimeDigits: serverTime.toString().length,
      localTime: endTime,
      offset: this.timeOffset,
      latency: endTime - startTime,
      nextTimestamp: Math.floor(Date.now() + this.timeOffset)
    });
  }

  /**
   * Get synchronized timestamp
   */
  private getSyncedTime(): number {
    return Math.floor(Date.now() + this.timeOffset);
  }

  /**
   * Generate signature for BingX API requests
   *
   * IMPORTANT:
   * - Parameters in INSERTION ORDER (not sorted)
   * - Parameters NOT URL-encoded for signature
   * - HEX encoding for signature
   */
  private generateSignature(params: Record<string, any>): string {
    // Create query string in insertion order WITHOUT URL encoding
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Generate HMAC SHA256 signature with HEX encoding
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');

    console.log('[BingXSpot] Signature generated for:', queryString.substring(0, 50) + '...');

    return signature;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T = any>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    // Add timestamp
    const timestamp = this.getSyncedTime();
    const signatureParams = {
      ...params,
      timestamp
    };

    // Generate signature
    const signature = this.generateSignature(signatureParams);

    // Build URL with query parameters
    const queryString = Object.entries(signatureParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    console.log('[BingXSpot] API Request:', {
      method,
      endpoint,
      timestamp
    });

    const response = await fetch(url, {
      method,
      headers: {
        'X-BX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(`BingX API error: ${JSON.stringify(data)}`);
    }

    return data.data;
  }

  /**
   * Get account information (for authentication test)
   */
  async getAccountInfo(): Promise<any> {
    return this.apiRequest('GET', '/openApi/spot/v1/account/balance');
  }

  /**
   * Get all tradable spot symbols
   */
  async getTradableSymbols(): Promise<string[]> {
    try {
      // Get all symbols (public endpoint - no authentication needed)
      const url = `${this.baseUrl}/openApi/spot/v1/common/symbols`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`Failed to get symbols: ${data.msg}`);
      }

      // Extract symbol names and convert to standard format (e.g., BTC-USDT -> BTCUSDT)
      // BingX API returns status as number: 1 = trading, 0 = not trading
      const symbols = data.data.symbols
        .filter((s: any) => s.status === 1 && s.apiStateBuy === true && s.apiStateSell === true)
        .map((s: any) => s.symbol.replace('-', ''));

      console.log(`[BingXSpot] Found ${symbols.length} tradable symbols`);

      return symbols;
    } catch (error: any) {
      console.error('[BingXSpot] Failed to get tradable symbols:', error.message);
      throw error;
    }
  }

  /**
   * Get current price for a symbol
   */
  async getPrice(symbol: string): Promise<number> {
    try {
      // Convert symbol to BingX format (BTCUSDT -> BTC-USDT)
      const bingxSymbol = this.convertSymbolToBingXFormat(symbol);

      const url = `${this.baseUrl}/openApi/spot/v1/ticker/24hr?symbol=${bingxSymbol}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`Failed to get price: ${data.msg}`);
      }

      return parseFloat(data.data.lastPrice);
    } catch (error: any) {
      console.error(`[BingXSpot] Failed to get price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    try {
      // Convert symbol to BingX format
      const bingxSymbol = this.convertSymbolToBingXFormat(symbol);

      const params = {
        symbol: bingxSymbol,
        side: side.toUpperCase(),
        type: 'MARKET',
        quantity: quantity.toString()
      };

      const result = await this.apiRequest('POST', '/openApi/spot/v1/trade/order', params);

      console.log(`[BingXSpot] Market order placed:`, {
        symbol: bingxSymbol,
        side,
        quantity,
        orderId: result.orderId
      });

      return result;
    } catch (error: any) {
      console.error(`[BingXSpot] Failed to place order:`, error.message);
      throw error;
    }
  }

  /**
   * Convert symbol from standard format to BingX format
   * Example: BTCUSDT -> BTC-USDT
   */
  private convertSymbolToBingXFormat(symbol: string): string {
    // BingX uses hyphenated format: BTC-USDT
    // Try to split common quote currencies
    const quoteCurrencies = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];

    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.substring(0, symbol.length - quote.length);
        return `${base}-${quote}`;
      }
    }

    // Fallback: assume last 4 characters are quote currency
    const base = symbol.substring(0, symbol.length - 4);
    const quote = symbol.substring(symbol.length - 4);
    return `${base}-${quote}`;
  }
}
