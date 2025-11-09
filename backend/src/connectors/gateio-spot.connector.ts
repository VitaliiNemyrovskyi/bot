import { BaseExchangeConnector, OrderSide } from './base-exchange.connector';
import ccxt from 'ccxt';

/**
 * Gate.io SPOT Exchange Connector
 *
 * Implements SPOT trading for Gate.io exchange using CCXT
 * Used for triangular arbitrage on SPOT markets
 */
export class GateIOSpotConnector extends BaseExchangeConnector {
  private exchange: ccxt.gateio;
  public takerFee: number = 0.002; // Default 0.2% taker fee

  constructor(apiKey: string, apiSecret: string) {
    super();
    this.exchangeName = 'GATEIO';

    // Initialize CCXT Gate.io exchange for SPOT trading
    this.exchange = new ccxt.gateio({
      apiKey,
      secret: apiSecret,
      enableRateLimit: true,
      timeout: 30000, // 30 seconds timeout (default is 10s)
      options: {
        defaultType: 'spot', // CRITICAL: Use SPOT market
        adjustForTimeDifference: true,
      },
    });
  }

  /**
   * Initialize Gate.io SPOT connection
   */
  async initialize(): Promise<void> {
    console.log(`[GateIOSpotConnector] Initializing Gate.io SPOT connector...`);

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[GateIOSpotConnector] Attempt ${attempt}/${maxRetries}...`);

        // Load markets (can be slow on Gate.io)
        console.log(`[GateIOSpotConnector] Loading markets...`);
        await this.exchange.loadMarkets();
        console.log(`[GateIOSpotConnector] Markets loaded successfully`);

        // Test connection by fetching balance
        console.log(`[GateIOSpotConnector] Testing connection...`);
        await this.exchange.fetchBalance();
        console.log(`[GateIOSpotConnector] Connection test successful`);

        // Get fee info (optional - use default if fails)
        try {
          console.log(`[GateIOSpotConnector] Fetching trading fees...`);
          const feeInfo = await this.exchange.fetchTradingFees();
          if (feeInfo && feeInfo['BTC/USDT']) {
            this.takerFee = feeInfo['BTC/USDT'].taker || 0.002;
            console.log(`[GateIOSpotConnector] Taker fee: ${this.takerFee * 100}%`);
          }
        } catch (feeError: any) {
          console.warn(`[GateIOSpotConnector] Could not fetch fees, using default 0.2%:`, feeError.message);
        }

        this.isInitialized = true;
        console.log('[GateIOSpotConnector] Gate.io SPOT connector initialized successfully');
        return; // Success!

      } catch (error: any) {
        lastError = error;
        console.error(`[GateIOSpotConnector] Attempt ${attempt}/${maxRetries} failed:`, error.message);

        if (attempt < maxRetries) {
          const delay = attempt * 2000; // 2s, 4s, 6s
          console.log(`[GateIOSpotConnector] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed
    throw new Error(`Failed to initialize Gate.io SPOT connector after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Normalize symbol format for CCXT
   * Input: "BTCUSDT" or "BTC-USDT" or "BTC_USDT"
   * Output: "BTC/USDT" (CCXT format)
   */
  private normalizeSymbol(symbol: string): string {
    // If already in CCXT format (contains /), return as-is
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
    console.warn(`[GateIOSpotConnector] Could not normalize symbol ${symbol}, assuming USDT quote`);
    return `${symbol}/USDT`;
  }

  /**
   * Place a market order on SPOT market
   */
  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[GateIOSpotConnector] Placing market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io SPOT connector not initialized');
    }

    try {
      // Normalize symbol to CCXT format
      const normalizedSymbol = this.normalizeSymbol(symbol);
      console.log(`[GateIOSpotConnector] Normalized symbol: ${symbol} → ${normalizedSymbol}`);

      // CCXT expects lowercase side
      const ccxtSide = side.toLowerCase() as 'buy' | 'sell';

      // Get market info for precision
      const market = this.exchange.market(normalizedSymbol);
      const amountPrecision = market.precision?.amount || 8;
      const pricePrecision = market.precision?.price || 8;

      console.log(`[GateIOSpotConnector] Market precision for ${normalizedSymbol}:`, {
        amountPrecision,
        pricePrecision,
        limits: {
          minAmount: market.limits?.amount?.min,
          minCost: market.limits?.cost?.min,
        }
      });

      // Gate.io special handling for market BUY orders
      // For market buy, Gate.io expects the COST (quote currency amount to spend)
      // instead of the AMOUNT (base currency amount to buy)
      let orderQuantity = quantity;
      let quantityPrecision = amountPrecision;

      if (ccxtSide === 'buy') {
        // Fetch current price to calculate cost
        const ticker = await this.exchange.fetchTicker(normalizedSymbol);
        const currentPrice = ticker.last || ticker.bid || ticker.ask;

        if (!currentPrice) {
          throw new Error(`Cannot get current price for ${normalizedSymbol} on Gate.io`);
        }

        // Calculate cost: how much quote currency we need to spend to buy the desired amount
        // Add 0.5% buffer (optimized based on real orderbook data) to account for:
        // - Difference between ticker.last and orderbook ask price (0.01-0.1%)
        // - Price movement during execution (0.1-0.3%)
        // - Small safety margin (0.1%)
        // Note: Trading fees (0.2%) are deducted from filled amount, not from cost
        const cost = quantity * currentPrice * 1.005;

        console.log(`[GateIOSpotConnector] Gate.io market BUY: converting amount to cost`, {
          desiredAmount: quantity,
          currentPrice,
          calculatedCost: cost,
          symbol: normalizedSymbol,
        });

        orderQuantity = cost;
        // For BUY orders, we're sending cost (quote currency), use price precision
        quantityPrecision = pricePrecision;
      }

      // Round quantity to correct precision to avoid Gate.io truncation
      // Use Math.round instead of Math.floor to properly round small values
      // Floor would turn 0.0005 → 0.000, but round keeps it as 0.001
      const precisionMultiplier = Math.pow(10, quantityPrecision);
      const roundedQuantity = Math.round(orderQuantity * precisionMultiplier) / precisionMultiplier;

      // Check if rounded quantity is too small
      const minAmount = ccxtSide === 'buy'
        ? (market.limits?.cost?.min || 0.01)
        : (market.limits?.amount?.min || 0.00001);

      if (roundedQuantity < minAmount) {
        throw new Error(
          `Rounded quantity ${roundedQuantity.toFixed(quantityPrecision)} is below minimum ${minAmount}. ` +
          `Original: ${orderQuantity.toFixed(quantityPrecision + 2)}`
        );
      }

      console.log(`[GateIOSpotConnector] Quantity precision handling:`, {
        original: orderQuantity,
        precision: quantityPrecision,
        rounded: roundedQuantity,
        minimum: minAmount,
      });

      // Place market order
      const order = await this.exchange.createMarketOrder(
        normalizedSymbol,
        ccxtSide,
        roundedQuantity
      );

      console.log('[GateIOSpotConnector] Market order created:', {
        orderId: order.id,
        status: order.status,
        filled: order.filled,
        amount: order.amount
      });

      // CRITICAL FIX: For Gate.io, the immediate order response often has filled=0
      // We MUST fetch the order status to get actual filled quantity
      // Wait a bit for order to settle (Gate.io processes market orders very fast)
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

      console.log('[GateIOSpotConnector] Fetching order status to get filled quantity...');
      const fetchedOrder = await this.exchange.fetchOrder(order.id, normalizedSymbol);

      console.log('[GateIOSpotConnector] Fetched order status:', {
        orderId: fetchedOrder.id,
        status: fetchedOrder.status,
        filled: fetchedOrder.filled,
        average: fetchedOrder.average,
        fee: fetchedOrder.fee
      });

      // Use fetched order data for accurate filled quantity
      const finalOrder = fetchedOrder.filled > 0 ? fetchedOrder : order;

      // Map CCXT response to expected format
      return {
        orderId: finalOrder.id,
        symbol: finalOrder.symbol,
        side: finalOrder.side,
        type: finalOrder.type,
        quantity: finalOrder.amount,
        cumExecQty: finalOrder.filled || 0,
        avgPrice: finalOrder.average || finalOrder.price || 0,
        status: finalOrder.status,
        cumExecFee: finalOrder.fee?.cost || 0,
        feeCurrency: finalOrder.fee?.currency || '',
      };
    } catch (error: any) {
      console.error('[GateIOSpotConnector] Error placing market order:', error.message);
      throw error;
    }
  }

  /**
   * Place a limit order
   */
  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any> {
    console.log(`[GateIOSpotConnector] Placing limit ${side} order:`, {
      symbol,
      quantity,
      price,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io SPOT connector not initialized');
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const ccxtSide = side.toLowerCase() as 'buy' | 'sell';

      const order = await this.exchange.createLimitOrder(
        normalizedSymbol,
        ccxtSide,
        quantity,
        price
      );

      return {
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        type: order.type,
        quantity: order.amount,
        price: order.price,
        cumExecQty: order.filled || 0,
        avgPrice: order.average || order.price || 0,
        status: order.status,
      };
    } catch (error: any) {
      console.error('[GateIOSpotConnector] Error placing limit order:', error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[GateIOSpotConnector] Cancelling order ${orderId} on ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('Gate.io SPOT connector not initialized');
    }

    try {
      const result = await this.exchange.cancelOrder(orderId, symbol);
      console.log('[GateIOSpotConnector] Order cancelled:', result);
      return result;
    } catch (error: any) {
      console.error('[GateIOSpotConnector] Error cancelling order:', error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Gate.io SPOT connector not initialized');
    }

    try {
      const balance = await this.exchange.fetchBalance();
      return balance;
    } catch (error: any) {
      console.error('[GateIOSpotConnector] Error fetching balance:', error.message);
      throw error;
    }
  }

  /**
   * Get position for a symbol (N/A for SPOT)
   */
  async getPosition(symbol: string): Promise<any> {
    // SPOT markets don't have positions
    return null;
  }

  /**
   * Get all positions or positions for a specific symbol (N/A for SPOT)
   * Returns empty array since SPOT markets don't have positions
   */
  async getPositions(symbol?: string): Promise<any[]> {
    // SPOT markets don't have positions - return empty array
    console.log(`[GateIOSpotConnector] getPositions called for ${symbol || 'all'} - SPOT markets have no positions`);
    return [];
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Gate.io SPOT connector not initialized');
    }

    try {
      // For SPOT, we need symbol to fetch order - return placeholder
      return { orderId, status: 'unknown' };
    } catch (error: any) {
      console.error('[GateIOSpotConnector] Error fetching order status:', error.message);
      throw error;
    }
  }

  /**
   * Close position (N/A for SPOT)
   */
  async closePosition(symbol: string): Promise<any> {
    throw new Error('Close position not supported on SPOT markets');
  }

  /**
   * Place reduce-only order (N/A for SPOT)
   */
  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    throw new Error('Reduce-only orders not supported on SPOT markets');
  }

  /**
   * Set trading stop (N/A for SPOT)
   */
  async setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<{
    success: boolean;
    takeProfitOrderId?: string;
    stopLossOrderId?: string;
    message?: string;
  }> {
    throw new Error('Trading stops not supported on SPOT markets');
  }

  /**
   * Get symbol trading limits
   */
  async getSymbolLimits(symbol: string): Promise<{
    minOrderSize?: number;
    minNotional?: number;
    maxOrderSize?: number;
    amountPrecision?: number;
    pricePrecision?: number;
  } | null> {
    if (!this.isInitialized) {
      return null;
    }

    try {
      // Normalize symbol to CCXT format
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const market = this.exchange.market(normalizedSymbol);

      console.log(`[GateIOSpotConnector] Symbol limits for ${symbol} (${normalizedSymbol}):`, {
        minOrderSize: market.limits.amount?.min,
        minNotional: market.limits.cost?.min,
      });

      return {
        minOrderSize: market.limits.amount?.min,
        minNotional: market.limits.cost?.min,
        maxOrderSize: market.limits.amount?.max,
        amountPrecision: market.precision.amount,
        pricePrecision: market.precision.price,
      };
    } catch (error: any) {
      console.error(`[GateIOSpotConnector] Error fetching symbol limits for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Get current market price
   */
  async getMarketPrice(symbol: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('Gate.io SPOT connector not initialized');
    }

    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      const ticker = await this.exchange.fetchTicker(normalizedSymbol);
      return ticker.last || 0;
    } catch (error: any) {
      console.error(`[GateIOSpotConnector] Error fetching price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to price stream (placeholder - use WebSocket in production)
   */
  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    // Placeholder: Poll price every second
    const interval = setInterval(async () => {
      try {
        const price = await this.getMarketPrice(symbol);
        callback(price, Date.now());
      } catch (error) {
        console.error(`[GateIOSpotConnector] Error in price stream for ${symbol}:`, error);
      }
    }, 1000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}
