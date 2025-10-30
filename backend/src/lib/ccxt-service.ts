import ccxt from 'ccxt';

/**
 * CCXT Service
 *
 * Unified service for interacting with cryptocurrency exchanges using ccxt library.
 * Provides simplified access to market data, funding rates, and historical prices.
 *
 * Benefits over direct ccxt usage:
 * - Consistent error handling
 * - Automatic symbol normalization
 * - Simplified API for common operations
 * - Support for both authenticated and public endpoints
 */
export class CCXTService {
  private exchange: ccxt.Exchange;
  private exchangeId: string;

  /**
   * Create a new CCXT Service instance
   *
   * @param exchangeId - Exchange identifier (e.g., 'binance', 'bybit', 'bingx', 'mexc')
   * @param config - Configuration options
   */
  constructor(
    exchangeId: string,
    config?: {
      apiKey?: string;
      apiSecret?: string;
      authToken?: string;
      enableRateLimit?: boolean;
    }
  ) {
    this.exchangeId = exchangeId.toLowerCase();

    console.log(`[CCXTService] Initializing ${this.exchangeId} service`);

    try {
      // Get the exchange class from ccxt
      const ExchangeClass = ccxt[this.exchangeId as keyof typeof ccxt] as any;

      if (!ExchangeClass) {
        throw new Error(`Exchange "${exchangeId}" not supported by ccxt`);
      }

      // Create exchange instance (mainnet only)
      const exchangeOptions: any = {
        apiKey: config?.apiKey,
        secret: config?.apiSecret,
        enableRateLimit: config?.enableRateLimit ?? true,
        options: {
          defaultType: 'swap', // Perpetual futures by default
        },
      };

      // Bybit-specific: Set default category for contract operations
      if (this.exchangeId === 'bybit') {
        exchangeOptions.options.defaultCategory = 'linear';
      }

      this.exchange = new ExchangeClass(exchangeOptions) as ccxt.Exchange;

      console.log(`[CCXTService] ${this.exchangeId} service created successfully`);
    } catch (error: any) {
      console.error(`[CCXTService] Failed to create ${exchangeId} service:`, error.message);
      throw error;
    }
  }

  /**
   * Get ticker information for a symbol
   *
   * @param symbol - Trading pair (e.g., 'BTCUSDT' or 'BTC/USDT')
   * @returns Ticker information
   */
  async getTicker(symbol: string): Promise<{
    symbol: string;
    lastPrice: string;
    bid: string;
    ask: string;
    volume: string;
  }> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const ticker = await this.exchange.fetchTicker(normalizedSymbol);

      return {
        symbol: normalizedSymbol,
        lastPrice: ticker.last?.toString() || '0',
        bid: ticker.bid?.toString() || '0',
        ask: ticker.ask?.toString() || '0',
        volume: ticker.baseVolume?.toString() || '0',
      };
    } catch (error: any) {
      console.error(`[CCXTService] Error fetching ticker for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all tickers for the exchange
   *
   * @returns Array of ticker information
   */
  async getAllTickers(): Promise<Array<{
    symbol: string;
    lastPrice: string;
    bid: string;
    ask: string;
    volume: string;
  }>> {
    try {
      const tickers = await this.exchange.fetchTickers();

      return Object.entries(tickers).map(([symbol, ticker]) => ({
        symbol,
        lastPrice: ticker.last?.toString() || '0',
        bid: ticker.bid?.toString() || '0',
        ask: ticker.ask?.toString() || '0',
        volume: ticker.baseVolume?.toString() || '0',
      }));
    } catch (error: any) {
      console.error(`[CCXTService] Error fetching all tickers:`, error.message);
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
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const fundingRate = await this.exchange.fetchFundingRate(normalizedSymbol);

      return {
        symbol: normalizedSymbol,
        fundingRate: fundingRate.fundingRate?.toString() || '0',
        nextFundingTime: fundingRate.nextFundingTimestamp || fundingRate.fundingTimestamp || Date.now(),
        markPrice: fundingRate.markPrice?.toString() || '0',
      };
    } catch (error: any) {
      console.error(`[CCXTService] Error fetching funding rate for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all funding rates for the exchange
   *
   * @returns Array of funding rates
   */
  async getAllFundingRates(): Promise<Array<{
    symbol: string;
    fundingRate: string;
    nextFundingTime: number;
    markPrice: string;
    fundingInterval?: number; // Funding interval in hours (e.g., 1, 4, 8)
  }>> {
    try {
      const fundingRates = await this.exchange.fetchFundingRates();

      // Ensure markets are loaded to access contract info
      if (!this.exchange.markets || Object.keys(this.exchange.markets).length === 0) {
        await this.loadMarkets();
      }

      return Object.entries(fundingRates).map(([symbol, rate]: [string, any]) => {
        // Extract funding interval from CCXT response
        // Different exchanges return this data differently
        let intervalHours: number | undefined;

        // Method 1: Check rate object itself
        if (rate.fundingInterval) {
          // Some exchanges return interval in milliseconds or hours
          intervalHours = typeof rate.fundingInterval === 'number'
            ? (rate.fundingInterval > 24 ? rate.fundingInterval / (1000 * 60 * 60) : rate.fundingInterval)
            : parseInt(rate.fundingInterval);
        }
        // Method 2: Check raw exchange response (rate.info)
        else if (rate.info?.fundingInterval) {
          const val = rate.info.fundingInterval;
          intervalHours = typeof val === 'string' ? parseInt(val) : val;
        } else if (rate.info?.fundingIntervalHours) {
          intervalHours = parseInt(rate.info.fundingIntervalHours);
        } else if (rate.info?.funding_interval) {
          intervalHours = parseInt(rate.info.funding_interval);
        }
        // Method 3: Check market info from loadMarkets
        else if (this.exchange.markets && this.exchange.markets[symbol]) {
          const market = this.exchange.markets[symbol];
          if (market.info?.fundingInterval) {
            const val = market.info.fundingInterval;
            intervalHours = typeof val === 'string' ? parseInt(val) : val;
          } else if (market.info?.funding_interval) {
            intervalHours = parseInt(market.info.funding_interval);
          }
        }

        // Debug log for BTC symbols to see what data is available
        if (symbol.includes('BTC')) {
          const market = this.exchange.markets?.[symbol];
          console.log(`[CCXTService] ${this.exchangeId} ${symbol} funding interval extraction:`, {
            from_rate: rate.fundingInterval,
            from_rate_info: rate.info?.fundingInterval || rate.info?.funding_interval,
            from_market: market?.info?.fundingInterval || market?.info?.funding_interval,
            extracted: intervalHours,
            rateInfoKeys: rate.info ? Object.keys(rate.info).slice(0, 10) : [],
            marketInfoKeys: market?.info ? Object.keys(market.info).slice(0, 10) : []
          });
        }

        return {
          symbol,
          fundingRate: rate.fundingRate?.toString() || '0',
          nextFundingTime: rate.nextFundingTimestamp || rate.fundingTimestamp || Date.now(),
          markPrice: rate.markPrice?.toString() || '0',
          fundingInterval: intervalHours,
        };
      });
    } catch (error: any) {
      console.error(`[CCXTService] Error fetching all funding rates:`, error.message);
      throw error;
    }
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
  ): Promise<Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);

      // Fetch OHLCV data (Open, High, Low, Close, Volume)
      const ohlcv = await this.exchange.fetchOHLCV(normalizedSymbol, interval, undefined, limit);

      // Convert to our format
      return ohlcv.map(candle => ({
        time: Math.floor(candle[0] / 1000), // Convert ms to seconds
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5],
      }));
    } catch (error: any) {
      console.error(`[CCXTService] Error fetching historical klines:`, error.message);
      throw error;
    }
  }

  /**
   * Load markets (must be called before using other methods)
   */
  async loadMarkets(): Promise<void> {
    try {
      await this.exchange.loadMarkets();
      console.log(`[CCXTService] Loaded ${Object.keys(this.exchange.markets).length} markets for ${this.exchangeId}`);
    } catch (error: any) {
      console.error(`[CCXTService] Error loading markets:`, error.message);
      throw error;
    }
  }

  /**
   * Normalize symbol format to ccxt standard (BTC/USDT)
   *
   * @param symbol - Symbol in any format (BTCUSDT, BTC-USDT, BTC_USDT, etc.)
   * @returns Normalized symbol (BTC/USDT)
   */
  private normalizeSymbol(symbol: string): string {
    // If already in ccxt format (contains /), return as-is
    if (symbol.includes('/')) {
      return symbol;
    }

    // Remove hyphens or underscores
    symbol = symbol.replace(/[-_]/g, '');

    // Common quote currencies (order matters - check longer matches first)
    const quoteCurrencies = ['USDT', 'USDC', 'BUSD', 'USD', 'BTC', 'ETH', 'BNB'];

    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        return `${base}/${quote}`;
      }
    }

    // If no match, assume USDT
    console.warn(`[CCXTService] Could not normalize symbol ${symbol}, assuming USDT quote`);
    return `${symbol}/USDT`;
  }

  /**
   * Get the underlying ccxt exchange instance
   * Useful for advanced operations
   */
  getExchangeInstance(): ccxt.Exchange {
    return this.exchange;
  }

  /**
   * Get exchange information
   */
  getExchangeInfo(): {
    id: string;
    name: string;
    hasFetchFundingRate: boolean;
    hasFetchFundingRates: boolean;
    hasFetchOHLCV: boolean;
    hasFetchTickers: boolean;
  } {
    return {
      id: this.exchange.id,
      name: this.exchange.name,
      hasFetchFundingRate: this.exchange.has['fetchFundingRate'] ?? false,
      hasFetchFundingRates: this.exchange.has['fetchFundingRates'] ?? false,
      hasFetchOHLCV: this.exchange.has['fetchOHLCV'] ?? false,
      hasFetchTickers: this.exchange.has['fetchTickers'] ?? false,
    };
  }

  /**
   * Get all open positions
   *
   * @param symbol - Optional symbol to filter positions
   * @returns Array of open positions
   */
  async getPositions(symbol?: string): Promise<any[]> {
    try {
      console.log(`[CCXTService] Fetching positions for ${this.exchangeId}${symbol ? ` (${symbol})` : ''}`);

      // Load markets if not already loaded
      if (!this.exchange.markets || Object.keys(this.exchange.markets).length === 0) {
        await this.loadMarkets();
      }

      let positions: any[] = [];

      if (this.exchange.has['fetchPositions']) {
        // Exchange-specific parameters
        const params: any = {};

        // Bybit requires category parameter for futures positions
        if (this.exchangeId === 'bybit') {
          params.category = 'linear'; // Linear perpetual futures
          console.log(`[CCXTService] Adding Bybit-specific parameter: category=linear`);
        }

        // Fetch all positions with exchange-specific params
        // NOTE: For Bybit, we fetch ALL positions and filter later, as passing symbols array can cause issues
        const allPositions = await this.exchange.fetchPositions(undefined, params);

        console.log(`[CCXTService] Fetched ${allPositions.length} total positions from ${this.exchangeId}`);

        // Debug: Log all position symbols
        if (allPositions.length > 0) {
          console.log(`[CCXTService] Position symbols from exchange:`, allPositions.map((p: any) => p.symbol));
        }

        // Filter by symbol if specified
        if (symbol) {
          const normalizedSymbol = this.normalizeSymbol(symbol);
          console.log(`[CCXTService] Filtering for symbol: ${normalizedSymbol} (original: ${symbol})`);

          // For perpetual swaps, CCXT often returns symbols like 'BTC/USDT:USDT'
          // We need to match both 'BTC/USDT' and 'BTC/USDT:USDT'
          const perpetualSymbol = `${normalizedSymbol}:USDT`;

          positions = allPositions.filter((p: any) => {
            return p.symbol === normalizedSymbol || p.symbol === perpetualSymbol;
          });

          console.log(`[CCXTService] After filter: found ${positions.length} positions matching ${normalizedSymbol} or ${perpetualSymbol}`);
        } else {
          positions = allPositions;
        }
      } else if (this.exchange.has['fetchPosition'] && symbol) {
        // Fetch single position
        const params: any = {};
        if (this.exchangeId === 'bybit') {
          params.category = 'linear';
        }

        const position = await this.exchange.fetchPosition(this.normalizeSymbol(symbol), params);
        positions = position ? [position] : [];
      } else {
        throw new Error(`Exchange ${this.exchangeId} does not support fetching positions`);
      }

      // Filter out closed positions (contracts === 0 or undefined)
      const openPositions = positions.filter(p => {
        const contracts = p.contracts || p.info?.positionAmt || p.info?.size || 0;
        return Math.abs(parseFloat(contracts)) > 0;
      });

      console.log(`[CCXTService] Found ${openPositions.length} open position(s)`);
      return openPositions;
    } catch (error: any) {
      console.error(`[CCXTService] Error fetching positions:`, error.message);
      throw error;
    }
  }

  /**
   * Close position for a symbol using CCXT
   *
   * This method automatically detects the position side and closes it.
   * Works with all exchanges that support futures trading.
   *
   * @param symbol - Trading pair (e.g., 'BTCUSDT' or 'BTC/USDT')
   * @returns Close order result
   */
  async closePosition(symbol: string): Promise<any> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      console.log(`[CCXTService] Closing position for ${normalizedSymbol} on ${this.exchangeId}`);

      // Load markets if not already loaded
      if (!this.exchange.markets || Object.keys(this.exchange.markets).length === 0) {
        await this.loadMarkets();
      }

      // Fetch open positions
      const positions = await this.getPositions(symbol);

      if (!positions || positions.length === 0) {
        console.log(`[CCXTService] No open positions found for ${normalizedSymbol}`);
        return { success: true, message: 'No open positions to close' };
      }

      console.log(`[CCXTService] Found ${positions.length} position(s) to close:`,
        positions.map(p => ({
          symbol: p.symbol,
          side: p.side,
          contracts: p.contracts,
          positionAmt: p.info?.positionAmt,
          size: p.info?.size
        }))
      );

      const results: any[] = [];

      // Close each open position
      for (const position of positions) {
        const contracts = parseFloat(position.contracts || position.info?.positionAmt || position.info?.size || 0);

        if (Math.abs(contracts) === 0) {
          continue; // Skip closed positions
        }

        // Determine the side to close (opposite of current position)
        // IMPORTANT: For BingX One-Way Mode, positionAmt is always positive and direction is in positionSide
        // For other exchanges, contracts can be negative for short positions
        let side: 'buy' | 'sell';

        // Check if position has explicit side information (BingX, Bybit hedge mode)
        const positionSide = (position.side || position.info?.positionSide || '').toLowerCase();

        if (positionSide === 'short' || positionSide === 'sell') {
          // Short position: buy to close
          side = 'buy';
        } else if (positionSide === 'long' || positionSide === 'buy') {
          // Long position: sell to close
          side = 'sell';
        } else {
          // Fallback to contracts sign (for exchanges without explicit positionSide)
          // If long (positive contracts), we sell to close
          // If short (negative contracts), we buy to close
          side = contracts > 0 ? 'sell' : 'buy';
        }

        const amount = Math.abs(contracts);

        console.log(`[CCXTService] Closing ${side} position with ${amount} contracts`);

        // Create reduce-only market order to close position
        const params: any = {};

        // Set reduceOnly for most exchanges
        // IMPORTANT: BingX REQUIRES reduceOnly=true to close positions (otherwise it tries to open new position)
        if (this.exchangeId === 'bybit') {
          // Bybit V5 doesn't always require reduceOnly
          console.log(`[CCXTService] Creating bybit close order without reduceOnly (to avoid balance issues)`);
        } else {
          params.reduceOnly = true;
          if (this.exchangeId === 'bingx') {
            console.log(`[CCXTService] BingX: using reduceOnly=true to ensure position closing`);
          }
        }

        // Add position side for hedge mode exchanges
        // IMPORTANT: For BingX One-Way Mode, always use 'BOTH' instead of actual position side
        if (position.side) {
          if (this.exchangeId === 'bingx') {
            // BingX uses One-Way Mode: always use 'BOTH' for all orders
            params.positionSide = 'BOTH';
            console.log(`[CCXTService] BingX One-Way Mode: using positionSide=BOTH for close order`);
          } else {
            // Other exchanges (Bybit hedge mode, etc.)
            params.positionSide = position.side.toUpperCase();
          }
        }

        // DEBUG: Log all parameters before creating order
        console.log(`[CCXTService] Creating close order with params:`, {
          exchange: this.exchangeId,
          symbol: normalizedSymbol,
          type: 'market',
          side,
          amount,
          params,
          positionInfo: {
            contracts: position.contracts,
            side: position.side,
            info: position.info
          }
        });

        const order = await this.exchange.createOrder(
          normalizedSymbol,
          'market',
          side,
          amount,
          undefined, // price (not needed for market order)
          params
        );

        console.log(`[CCXTService] Position closed successfully:`, order.id);
        results.push(order);
      }

      return {
        success: true,
        orders: results,
        message: `Closed ${results.length} position(s)`
      };
    } catch (error: any) {
      console.error(`[CCXTService] Error closing position for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Create a market order
   *
   * @param symbol - Trading pair
   * @param side - Order side ('buy' or 'sell')
   * @param amount - Order amount
   * @param params - Additional parameters
   * @returns Order result
   */
  async createMarketOrder(
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    params?: any
  ): Promise<any> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      console.log(`[CCXTService] Creating ${side} market order for ${normalizedSymbol}: ${amount}`);

      // Load markets if not already loaded
      if (!this.exchange.markets || Object.keys(this.exchange.markets).length === 0) {
        await this.loadMarkets();
      }

      const order = await this.exchange.createOrder(
        normalizedSymbol,
        'market',
        side,
        amount,
        undefined,
        params
      );

      console.log(`[CCXTService] Market order created:`, order.id);
      return order;
    } catch (error: any) {
      console.error(`[CCXTService] Error creating market order:`, error.message);
      throw error;
    }
  }
}

/**
 * Helper function to create a CCXT service instance
 *
 * @param exchangeId - Exchange identifier
 * @param config - Configuration options
 * @returns CCXTService instance
 */
export function createCCXTService(
  exchangeId: string,
  config?: {
    apiKey?: string;
    apiSecret?: string;
    authToken?: string;
    enableRateLimit?: boolean;
  }
): CCXTService {
  return new CCXTService(exchangeId, config);
}
