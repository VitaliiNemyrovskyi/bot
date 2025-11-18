import ccxt from 'ccxt';
import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';

/**
 * CCXT Universal Exchange Connector
 *
 * Provides a unified interface to interact with 120+ cryptocurrency exchanges
 * using the ccxt library.
 *
 * Benefits:
 * - Single implementation for all supported exchanges
 * - Automatic data normalization across exchanges
 * - Built-in rate limiting
 * - Comprehensive API coverage
 *
 * Supported exchanges: Binance, Bybit, BingX, MEXC, OKX, Bitget, Gate.io, KuCoin, and 100+ more
 */
export class CCXTExchangeConnector extends BaseExchangeConnector {
  private exchange: ccxt.Exchange;
  private exchangeId: string;
  private testnet: boolean;

  /**
   * Create a new CCXT Exchange Connector
   *
   * @param exchangeId - Exchange identifier (e.g., 'binance', 'bybit', 'bingx', 'mexc')
   * @param apiKey - API key for authentication
   * @param apiSecret - API secret for authentication
   * @param testnet - Whether to use testnet/sandbox mode (default: true)
   * @param userId - Optional user ID for logging/tracking
   * @param credentialId - Optional credential ID for logging/tracking
   * @param marketType - Market type: 'spot', 'swap' (perpetual futures), 'future', 'margin' (default: 'spot')
   * @param passphrase - Optional passphrase (required for OKX, Bitget, KuCoin)
   */
  constructor(
    exchangeId: string,
    apiKey: string,
    apiSecret: string,
    private userId?: string,
    private credentialId?: string,
    private marketType: 'spot' | 'swap' | 'future' | 'margin' = 'spot',
    private passphrase?: string
  ) {
    super();

    this.exchangeId = exchangeId.toLowerCase();
    this.testnet = testnet;
    this.exchangeName = testnet ? `${exchangeId.toUpperCase()}_TESTNET` : exchangeId.toUpperCase();

    console.log(`[CCXTConnector] Initializing ${this.exchangeName} connector`);

    try {
      // Get the exchange class from ccxt
      const ExchangeClass = ccxt[this.exchangeId as keyof typeof ccxt] as any;

      if (!ExchangeClass) {
        throw new Error(`Exchange "${exchangeId}" not supported by ccxt`);
      }

      // CRITICAL: Trim API keys to remove any whitespace, newlines, or hidden characters
      // This is a common source of signature verification failures
      const trimmedApiKey = apiKey.trim();
      const trimmedApiSecret = apiSecret.trim();
      const trimmedPassphrase = passphrase?.trim();

      console.log(`[CCXTConnector] API Key Debug:`, {
        originalLength: apiKey.length,
        trimmedLength: trimmedApiKey.length,
        apiKeyPrefix: trimmedApiKey.substring(0, 10) + '...',
        apiKeySuffix: '...' + trimmedApiKey.substring(trimmedApiKey.length - 10),
        secretLength: trimmedApiSecret.length,
        hasPassphrase: !!trimmedPassphrase,
        marketType: this.marketType
      });

      // Create exchange instance with configuration
      this.exchange = new ExchangeClass({
        apiKey: trimmedApiKey,
        secret: trimmedApiSecret,
        // Add passphrase for exchanges that require it (OKX, Bitget, KuCoin)
        ...(trimmedPassphrase && { password: trimmedPassphrase }),
        enableRateLimit: true, // Built-in rate limiting
        timeout: 30000, // 30 seconds timeout (default is 10s) - helps with slow APIs like Gate.io
        options: {
          defaultType: this.marketType, // Use specified market type (spot, swap, future, margin)
          // Some exchanges have testnet support
          ...(testnet && { sandbox: true }),
          // Gate.io requires special handling for market buy orders
          // Set this to false so we can pass the cost directly
          ...(this.exchangeId === 'gate' && { createMarketBuyOrderRequiresPrice: false }),
        },
      }) as ccxt.Exchange;

      console.log(`[CCXTConnector] ${this.exchangeName} instance created successfully`);
      console.log(`[CCXTConnector] Sandbox mode: ${this.exchange.sandbox}`);
      console.log(`[CCXTConnector] Has public API: ${this.exchange.has.publicAPI}`);
      console.log(`[CCXTConnector] Has private API: ${this.exchange.has.privateAPI}`);
    } catch (error: any) {
      console.error(`[CCXTConnector] Failed to create ${exchangeId} instance:`, error.message);
      throw error;
    }
  }

  /**
   * Initialize the exchange connector
   * Loads markets and validates credentials
   */
  async initialize(): Promise<void> {
    console.log(`[CCXTConnector] Initializing ${this.exchangeName}...`);

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[CCXTConnector] Attempt ${attempt}/${maxRetries}...`);

        // Load markets (trading pairs) - can be slow on some exchanges like Gate.io
        console.log(`[CCXTConnector] Loading markets...`);
        await this.exchange.loadMarkets();
        console.log(`[CCXTConnector] Loaded ${Object.keys(this.exchange.markets).length} markets`);

        // Test authentication if credentials are provided
        if (this.exchange.apiKey && this.exchange.secret) {
          console.log(`[CCXTConnector] Testing authentication...`);
          try {
            const balance = await this.exchange.fetchBalance();
            console.log(`[CCXTConnector] Authentication successful - Balance fetched`);
          } catch (authError: any) {
            console.warn(`[CCXTConnector] Authentication test failed:`, authError.message);
            // Don't throw - some exchanges might not support balance fetch
          }
        }

        this.isInitialized = true;
        console.log(`[CCXTConnector] ${this.exchangeName} initialized successfully`);
        return; // Success!

      } catch (error: any) {
        lastError = error;
        console.error(`[CCXTConnector] Attempt ${attempt}/${maxRetries} failed:`, error.message);

        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s
          console.log(`[CCXTConnector] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new Error(`Failed to initialize ${this.exchangeName} after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Place a market order
   *
   * @param symbol - Trading pair (e.g., 'BTC/USDT')
   * @param side - Order side ('Buy' or 'Sell')
   * @param quantity - Order amount in base currency
   * @returns Order result
   */
  async placeMarketOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    console.log(`[CCXTConnector] Placing market ${side} order:`, {
      exchange: this.exchangeName,
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      // Normalize symbol format (BTCUSDT -> BTC/USDT)
      const normalizedSymbol = this.normalizeSymbol(symbol);

      // Convert side format
      const ccxtSide = side === 'Buy' ? 'buy' : 'sell';

      // Gate.io special handling for market buy orders
      // When createMarketBuyOrderRequiresPrice is false, we need to pass the cost (quote amount)
      // instead of the quantity (base amount) for buy orders
      let orderQuantity = quantity;
      if (this.exchangeId === 'gate' && ccxtSide === 'buy') {
        // Fetch current price to calculate cost
        const ticker = await this.exchange.fetchTicker(normalizedSymbol);
        const currentPrice = ticker.last || ticker.bid || ticker.ask;

        if (!currentPrice) {
          throw new Error(`Cannot get current price for ${normalizedSymbol} on Gate.io`);
        }

        // Calculate cost: how much quote currency we need to spend to buy the desired amount
        // Add 0.1% buffer to ensure we have enough to cover the order
        orderQuantity = quantity * currentPrice * 1.001;

        console.log(`[CCXTConnector] Gate.io market buy: converting quantity to cost`, {
          desiredAmount: quantity,
          currentPrice,
          cost: orderQuantity,
        });
      }

      // Place market order
      const order = await this.exchange.createMarketOrder(normalizedSymbol, ccxtSide, orderQuantity);

      console.log(`[CCXTConnector] Market order placed:`, order.id);
      return order;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error placing market order:`, error.message);
      throw error;
    }
  }

  /**
   * Place a limit order
   *
   * @param symbol - Trading pair
   * @param side - Order side
   * @param quantity - Order amount
   * @param price - Limit price
   * @returns Order result
   */
  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    console.log(`[CCXTConnector] Placing limit ${side} order:`, {
      exchange: this.exchangeName,
      symbol,
      quantity,
      price,
    });

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const ccxtSide = side === 'Buy' ? 'buy' : 'sell';

      const order = await this.exchange.createLimitOrder(normalizedSymbol, ccxtSide, quantity, price);

      console.log(`[CCXTConnector] Limit order placed:`, order.id);
      return order;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error placing limit order:`, error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   *
   * @param orderId - Order ID
   * @param symbol - Trading pair
   * @returns Cancel result
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[CCXTConnector] Canceling order:`, { orderId, symbol });

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const result = await this.exchange.cancelOrder(orderId, normalizedSymbol);

      console.log(`[CCXTConnector] Order canceled:`, orderId);
      return result;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error canceling order:`, error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   *
   * @returns Balance information
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const balance = await this.exchange.fetchBalance();
      console.log(`[CCXTConnector] Balance retrieved for ${this.exchangeName}`);
      return balance;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error getting balance:`, error.message);
      throw error;
    }
  }

  /**
   * Get position for a symbol
   *
   * @param symbol - Trading pair
   * @returns Position information
   */
  async getPosition(symbol: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const positions = await this.exchange.fetchPositions([normalizedSymbol]);

      if (!positions || positions.length === 0) {
        return {
          symbol: normalizedSymbol,
          contracts: 0,
          side: 'none',
          entryPrice: 0,
          unrealizedPnl: 0,
        };
      }

      console.log(`[CCXTConnector] Position retrieved for ${normalizedSymbol}`);
      return positions[0];
    } catch (error: any) {
      console.error(`[CCXTConnector] Error getting position:`, error.message);
      throw error;
    }
  }

  /**
   * Get all positions or positions for a specific symbol
   *
   * @param symbol - Optional trading pair to filter by
   * @returns Array of positions
   */
  async getPositions(symbol?: string): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      let positions: any[];

      if (symbol) {
        // Fetch positions for specific symbol
        const normalizedSymbol = this.normalizeSymbol(symbol);
        positions = await this.exchange.fetchPositions([normalizedSymbol]);
      } else {
        // Fetch all positions
        positions = await this.exchange.fetchPositions();
      }

      // Filter out zero-size positions
      const activePositions = positions.filter((p: any) => {
        const contracts = Math.abs(parseFloat(p.contracts || p.info?.size || '0'));
        return contracts > 0;
      });

      console.log(`[CCXTConnector] Positions retrieved:`, {
        total: positions.length,
        active: activePositions.length,
        symbol: symbol || 'all',
      });

      return activePositions;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error getting positions:`, error.message);
      throw error;
    }
  }

  /**
   * Get order status
   *
   * @param orderId - Order ID
   * @returns Order information
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const order = await this.exchange.fetchOrder(orderId);
      console.log(`[CCXTConnector] Order status retrieved:`, order.status);
      return order;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error getting order status:`, error.message);
      throw error;
    }
  }

  /**
   * Close position for a symbol
   *
   * @param symbol - Trading pair
   * @returns Close position result
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[CCXTConnector] Closing position for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);

      // Get current position
      const position = await this.getPosition(normalizedSymbol);

      if (!position || position.contracts === 0) {
        throw new Error(`No open position for ${normalizedSymbol}`);
      }

      // Place reverse market order to close position
      const side: OrderSide = position.side === 'long' ? 'Sell' : 'Buy';
      const quantity = Math.abs(position.contracts);

      const result = await this.placeMarketOrder(normalizedSymbol, side, quantity);

      console.log(`[CCXTConnector] Position closed for ${normalizedSymbol}`);
      return result;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error closing position:`, error.message);
      throw error;
    }
  }

  /**
   * Set leverage for a symbol
   *
   * @param symbol - Trading pair
   * @param leverage - Leverage multiplier
   * @param side - Position side (optional for some exchanges)
   * @returns Leverage set result
   */
  async setLeverage(
    symbol: string,
    leverage: number,
    side: 'LONG' | 'SHORT' | 'BOTH' = 'BOTH'
  ): Promise<any> {
    console.log(`[CCXTConnector] Setting leverage for ${symbol}:`, { leverage, side });

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);

      // Validate leverage range
      if (leverage < 1 || leverage > 125) {
        throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 125.`);
      }

      const result = await this.exchange.setLeverage(leverage, normalizedSymbol);

      console.log(`[CCXTConnector] Leverage set successfully for ${normalizedSymbol}`);
      return result;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error setting leverage:`, error.message);
      throw error;
    }
  }

  /**
   * Get current market price
   *
   * @param symbol - Trading pair
   * @returns Current price
   */
  async getMarketPrice(symbol: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const ticker = await this.exchange.fetchTicker(normalizedSymbol);

      if (!ticker || !ticker.last) {
        throw new Error(`No price data available for ${normalizedSymbol}`);
      }

      console.log(`[CCXTConnector] Current price for ${normalizedSymbol}: $${ticker.last}`);
      return ticker.last;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching market price:`, error.message);
      throw error;
    }
  }

  /**
   * Get symbol trading limits
   *
   * @param symbol - Trading pair (e.g., 'BTC/USDT' or 'BTCUSDT')
   * @returns Trading limits for the symbol
   */
  async getSymbolLimits(symbol: string): Promise<{
    minOrderSize?: number;
    minNotional?: number;
    maxOrderSize?: number;
    amountPrecision?: number;
    pricePrecision?: number;
  } | null> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const market = this.exchange.market(normalizedSymbol);

      if (!market) {
        console.warn(`[CCXTConnector] Market not found for ${normalizedSymbol}`);
        return null;
      }

      const limits = market.limits;
      const precision = market.precision;

      return {
        minOrderSize: limits?.amount?.min,
        minNotional: limits?.cost?.min,
        maxOrderSize: limits?.amount?.max,
        amountPrecision: precision?.amount,
        pricePrecision: precision?.price,
      };
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching symbol limits:`, error.message);
      return null;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   *
   * @param symbol - Trading pair
   * @param callback - Callback function for price updates
   * @returns Unsubscribe function
   */
  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    console.log(`[CCXTConnector] Subscribing to price stream for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    // Note: CCXT WebSocket support varies by exchange
    // This is a placeholder - implement exchange-specific WebSocket logic as needed
    throw new Error(`WebSocket subscription not yet implemented for ${this.exchangeName} via CCXT`);
  }

  /**
   * Get historical klines/candlestick data
   *
   * @param symbol - Trading pair
   * @param interval - Time interval (e.g., '1m', '5m', '1h', '1d')
   * @param limit - Number of candles to fetch
   * @returns Array of OHLCV data
   */
  async getHistoricalKlines(
    symbol: string,
    interval: string,
    limit: number = 1000
  ): Promise<Array<{ time: number; price: number }>> {
    console.log(`[CCXTConnector] Fetching historical klines for ${symbol}:`, { interval, limit });

    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);

      // Fetch OHLCV data (Open, High, Low, Close, Volume)
      const ohlcv = await this.exchange.fetchOHLCV(normalizedSymbol, interval, undefined, limit);

      // Convert to our format: { time: seconds, price: close }
      const klines = ohlcv.map(candle => ({
        time: Math.floor(candle[0] / 1000), // Convert ms to seconds
        price: candle[4], // Close price
      }));

      console.log(`[CCXTConnector] Fetched ${klines.length} klines for ${normalizedSymbol}`);
      return klines;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching historical klines:`, error.message);
      throw error;
    }
  }

  /**
   * Get funding rate for a perpetual contract
   *
   * @param symbol - Trading pair
   * @returns Funding rate information
   */
  async getFundingRate(symbol: string): Promise<{
    symbol: string;
    fundingRate: string;
    nextFundingTime: number;
    markPrice: string;
  }> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const fundingRate = await this.exchange.fetchFundingRate(normalizedSymbol);

      console.log(`[CCXTConnector] Funding rate for ${normalizedSymbol}:`, fundingRate.fundingRate);

      return {
        symbol: normalizedSymbol,
        fundingRate: fundingRate.fundingRate?.toString() || '0',
        nextFundingTime: fundingRate.fundingTimestamp || Date.now(),
        markPrice: fundingRate.markPrice?.toString() || '0',
      };
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching funding rate:`, error.message);
      throw error;
    }
  }

  /**
   * Get all funding rates for the exchange
   *
   * @returns Array of funding rates for all perpetual contracts
   */
  async getAllFundingRates(): Promise<Array<{
    symbol: string;
    fundingRate: string;
    nextFundingTime: number;
    markPrice: string;
  }>> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      const fundingRates = await this.exchange.fetchFundingRates();

      const rates = Object.entries(fundingRates).map(([symbol, rate]: [string, any]) => ({
        symbol,
        fundingRate: rate.fundingRate?.toString() || '0',
        nextFundingTime: rate.fundingTimestamp || Date.now(),
        markPrice: rate.markPrice?.toString() || '0',
      }));

      console.log(`[CCXTConnector] Fetched ${rates.length} funding rates for ${this.exchangeName}`);
      return rates;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching all funding rates:`, error.message);
      throw error;
    }
  }

  /**
   * Normalize symbol format to ccxt standard (BTC/USDT)
   *
   * @param symbol - Symbol in any format
   * @returns Normalized symbol
   */
  private normalizeSymbol(symbol: string): string {
    // If already in ccxt format (contains /), return as-is
    if (symbol.includes('/')) {
      return symbol;
    }

    // Remove hyphens or underscores
    symbol = symbol.replace(/[-_]/g, '');

    // Common quote currencies (order matters - check longer ones first)
    const quoteCurrencies = [
      'USDT', 'USDC', 'BUSD', 'TUSD', 'USDP', 'DAI', 'FDUSD', // Stablecoins
      'USD1', 'USD0', 'USD2', 'USD3', // Numbered stablecoins
      'USD', // Generic USD (check last among USD variants)
      'BTC', 'ETH', 'BNB', 'SOL', 'MATIC', 'AVAX' // Other common quote assets
    ];

    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        // Ensure base is not empty
        if (base.length > 0) {
          return `${base}/${quote}`;
        }
      }
    }

    // If no match, assume USDT
    console.warn(`[CCXTConnector] Could not normalize symbol ${symbol}, assuming USDT quote`);
    return `${symbol}/USDT`;
  }

  /**
   * Get all tradable symbols for the current market type
   *
   * @returns Array of symbol strings (e.g., ['BTC/USDT', 'ETH/USDT', 'ETH/BTC'])
   */
  async getTradableSymbols(): Promise<string[]> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      console.log(`[CCXTConnector] Fetching tradable symbols for ${this.exchangeName} (${this.marketType})...`);

      // Get all markets
      const markets = this.exchange.markets;

      // Filter by market type and active status
      const symbols = Object.values(markets)
        .filter((market: any) => {
          // Must be active
          if (!market.active) return false;

          // Must match the selected market type
          if (this.marketType === 'spot' && market.spot) return true;
          if (this.marketType === 'swap' && market.swap) return true;
          if (this.marketType === 'future' && market.future) return true;
          if (this.marketType === 'margin' && market.margin) return true;

          return false;
        })
        .map((market: any) => market.symbol);

      console.log(`[CCXTConnector] Found ${symbols.length} tradable ${this.marketType} symbols`);

      // Log sample symbols
      const sample = symbols.slice(0, 10);
      console.log(`[CCXTConnector] Sample symbols:`, sample);

      return symbols;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching tradable symbols:`, error.message);
      throw error;
    }
  }

  /**
   * Get ticker data for multiple symbols
   * Useful for triangular arbitrage to get prices for all legs simultaneously
   *
   * @param symbols - Array of symbols to fetch (optional, fetches all if not provided)
   * @returns Map of symbol to ticker data
   */
  async getTickers(symbols?: string[]): Promise<Map<string, any>> {
    if (!this.isInitialized) {
      throw new Error(`${this.exchangeName} connector not initialized`);
    }

    try {
      console.log(`[CCXTConnector] Fetching tickers for ${symbols?.length || 'all'} symbols...`);

      // Fetch tickers
      const tickers = symbols
        ? await this.exchange.fetchTickers(symbols)
        : await this.exchange.fetchTickers();

      const tickerMap = new Map<string, any>();

      for (const [symbol, ticker] of Object.entries(tickers)) {
        tickerMap.set(symbol, ticker);
      }

      console.log(`[CCXTConnector] Fetched ${tickerMap.size} tickers`);
      return tickerMap;
    } catch (error: any) {
      console.error(`[CCXTConnector] Error fetching tickers:`, error.message);
      throw error;
    }
  }

  /**
   * Get the underlying ccxt exchange instance
   * Useful for advanced operations not covered by the base connector
   */
  getExchangeInstance(): ccxt.Exchange {
    return this.exchange;
  }
}
