import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { BybitService } from '@/lib/bybit';
import { ContractSpecification } from '@/lib/contract-calculator';

/**
 * Bybit Exchange Connector
 *
 * Implements the BaseExchangeConnector interface for Bybit exchange
 */
export class BybitConnector extends BaseExchangeConnector {
  private bybitService: BybitService;
  private apiKey: string;
  private apiSecret: string;
  private userId?: string;
  private credentialId?: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string
  ) {
    super();
    this.exchangeName = 'BYBIT';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.userId = userId;
    this.credentialId = credentialId;

    this.bybitService = new BybitService({
      apiKey,
      apiSecret,
      enableRateLimit: true,
      userId,
      credentialId,
    });
  }

  /**
   * Initialize Bybit connection
   */
  async initialize(): Promise<void> {
    console.log('[BybitConnector] Initializing Bybit connector...');

    try {
      // Synchronize time with Bybit server
      console.log('[BybitConnector] Synchronizing time with Bybit server...');
      await this.bybitService.syncTime();

      // Start periodic time sync
      this.bybitService.startPeriodicSync();

      // Log time sync status
      const syncStatus = this.bybitService.getTimeSyncStatus();
      console.log('[BybitConnector] Time sync status:', syncStatus);

      // Test connection by fetching account info
      await this.bybitService.getAccountInfo();
      this.isInitialized = true;
      console.log('[BybitConnector] Bybit connector initialized successfully');
    } catch (error: any) {
      console.error('[BybitConnector] Failed to initialize:', error.message);
      throw new Error(`Failed to initialize Bybit connector: ${error.message}`);
    }
  }

  /**
   * Validate and adjust quantity to meet Bybit's trading rules
   */
  private async validateAndAdjustQuantity(symbol: string, quantity: number): Promise<string> {
    try {
      // Fetch instrument info to get trading rules
      const instrumentInfo = await this.bybitService.getInstrumentsInfo('linear', symbol);

      if (!instrumentInfo || !instrumentInfo.list || instrumentInfo.list.length === 0) {
        console.warn(`[BybitConnector] No instrument info found for ${symbol}, using original quantity`);
        return quantity.toString();
      }

      const instrument = instrumentInfo.list[0];
      const lotSizeFilter = instrument.lotSizeFilter;

      if (!lotSizeFilter) {
        console.warn(`[BybitConnector] No lot size filter for ${symbol}, using original quantity`);
        return quantity.toString();
      }

      const minOrderQty = parseFloat(lotSizeFilter.minOrderQty || '0');
      const qtyStep = parseFloat(lotSizeFilter.qtyStep || '0.001');

      console.log(`[BybitConnector] Trading rules for ${symbol}:`, {
        minOrderQty,
        qtyStep,
        requestedQty: quantity
      });

      // Check minimum quantity
      if (quantity < minOrderQty) {
        console.warn(`[BybitConnector] Quantity ${quantity} is below minimum ${minOrderQty}, adjusting to minimum`);
        quantity = minOrderQty;
      }

      // Adjust to nearest step size
      const steps = Math.floor(quantity / qtyStep);
      const adjustedQty = steps * qtyStep;

      // Round to appropriate decimal places based on qtyStep
      const decimals = qtyStep.toString().split('.')[1]?.length || 0;
      const finalQty = parseFloat(adjustedQty.toFixed(decimals));

      if (finalQty !== quantity) {
        console.log(`[BybitConnector] Adjusted quantity from ${quantity} to ${finalQty} (step: ${qtyStep})`);
      }

      return finalQty.toString();
    } catch (error: any) {
      console.error(`[BybitConnector] Error validating quantity for ${symbol}:`, error.message);
      // Fallback: return original quantity as string
      return quantity.toString();
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
    console.log(`[BybitConnector] Placing market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      // Validate and adjust quantity to meet trading rules
      const validatedQty = await this.validateAndAdjustQuantity(symbol, quantity);

      const result = await this.bybitService.placeOrder({
        category: 'linear',
        symbol,
        side,
        orderType: 'Market',
        qty: validatedQty,
      });

      console.log('[BybitConnector] Market order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error placing market order:', error.message);
      throw error;
    }
  }

  /**
   * Place a market order with take-profit and stop-loss (ATOMIC)
   * Opens position with TP/SL protection in a single API call
   * This prevents the dangerous gap between opening position and setting TP/SL
   */
  async placeMarketOrderWithTPSL(
    symbol: string,
    side: OrderSide,
    quantity: number,
    takeProfit?: number,
    stopLoss?: number
  ): Promise<any> {
    console.log(`[BybitConnector] Placing ATOMIC market ${side} order with TP/SL:`, {
      symbol,
      quantity,
      takeProfit,
      stopLoss,
    });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    // Validate that at least one protection is provided
    if (!takeProfit && !stopLoss) {
      console.warn('[BybitConnector] No TP/SL provided, falling back to regular market order');
      return this.placeMarketOrder(symbol, side, quantity);
    }

    try {
      // Validate and adjust quantity to meet trading rules
      const validatedQty = await this.validateAndAdjustQuantity(symbol, quantity);

      // Build order request with TP/SL
      const orderRequest: any = {
        category: 'linear',
        symbol,
        side,
        orderType: 'Market',
        qty: validatedQty,
      };

      // Add take-profit if provided
      if (takeProfit) {
        orderRequest.takeProfit = takeProfit.toString();
        orderRequest.tpTriggerBy = 'LastPrice'; // Trigger by last traded price for faster execution
        console.log(`[BybitConnector] ✓ Take-profit: $${takeProfit} (trigger: LastPrice)`);
      }

      // Add stop-loss if provided
      if (stopLoss) {
        orderRequest.stopLoss = stopLoss.toString();
        orderRequest.slTriggerBy = 'LastPrice'; // Trigger by last traded price for faster execution
        console.log(`[BybitConnector] ✓ Stop-loss: $${stopLoss} (trigger: LastPrice)`);
      }

      const result = await this.bybitService.placeOrder(orderRequest);

      console.log('[BybitConnector] ✓ ATOMIC order placed with TP/SL protection:', {
        orderId: result.orderId,
        takeProfit,
        stopLoss,
      });

      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error placing atomic market order with TP/SL:', error.message);
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
    console.log(`[BybitConnector] Placing limit ${side} order:`, {
      symbol,
      quantity,
      price,
    });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      // Validate and adjust quantity to meet trading rules
      const validatedQty = await this.validateAndAdjustQuantity(symbol, quantity);

      const result = await this.bybitService.placeOrder({
        category: 'linear',
        symbol,
        side,
        orderType: 'Limit',
        qty: validatedQty,
        price: price.toString(),
        timeInForce: 'GTC',
      });

      console.log('[BybitConnector] Limit order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error placing limit order:', error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[BybitConnector] Canceling order:`, { orderId, symbol });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const result = await this.bybitService.cancelOrder(
        'linear',
        symbol,
        orderId
      );

      console.log('[BybitConnector] Order canceled:', result);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error canceling order:', error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const result = await this.bybitService.getWalletBalance('UNIFIED');
      console.log('[BybitConnector] Balance retrieved');
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error getting balance:', error.message);
      throw error;
    }
  }

  /**
   * Get position for a symbol
   */
  async getPosition(symbol: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const positions = await this.bybitService.getPositions('linear', symbol);
      const position = positions.find((p) => p.symbol === symbol);

      if (!position || parseFloat(position.size) === 0) {
        return {
          symbol,
          side: 'None',
          size: 0,
          entryPrice: 0,
          markPrice: 0,
          unrealisedPnl: 0,
        };
      }

      console.log('[BybitConnector] Position retrieved:', position);
      return position;
    } catch (error: any) {
      console.error('[BybitConnector] Error getting position:', error.message);
      throw error;
    }
  }

  /**
   * Get all positions or positions for a specific symbol
   */
  async getPositions(symbol?: string): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const positions = await this.bybitService.getPositions('linear', symbol);
      console.log('[BybitConnector] Positions retrieved:', positions.length);
      return positions;
    } catch (error: any) {
      console.error('[BybitConnector] Error getting positions:', error.message);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      // Bybit requires getting all orders and filtering
      const orders = await this.bybitService.getOrders('linear');
      const order = orders.find((o) => o.orderId === orderId);

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      console.log('[BybitConnector] Order status retrieved:', order);
      return order;
    } catch (error: any) {
      console.error('[BybitConnector] Error getting order status:', error.message);
      throw error;
    }
  }

  /**
   * Close position using direct Bybit API
   *
   * Fetches current position and places a reduce-only market order
   * to close it completely.
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[BybitConnector] ========================================`);
    console.log(`[BybitConnector] CLOSING POSITION for ${symbol}`);
    console.log(`[BybitConnector] ========================================`);

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      // Get current position
      const position = await this.getPosition(symbol);

      if (!position || position.side === 'None' || parseFloat(position.size) === 0) {
        console.log(`[BybitConnector] No open position found for ${symbol}`);
        return { success: true, message: 'No open positions to close' };
      }

      // Determine close side (opposite of position side)
      const closeSide: OrderSide = position.side === 'Buy' ? 'Sell' : 'Buy';
      const quantity = Math.abs(parseFloat(position.size));

      console.log(`[BybitConnector] Position details:`, {
        side: position.side,
        size: position.size,
        closeSide,
        quantity
      });

      // Place reduce-only market order to close position
      const result = await this.placeReduceOnlyOrder(symbol, closeSide, quantity);

      console.log(`[BybitConnector] ✓ Position closed successfully:`, result);
      console.log(`[BybitConnector] ========================================`);

      return { success: true, order: result };
    } catch (error: any) {
      console.error(`[BybitConnector] ✗ Error closing position:`, error.message);
      console.error(`[BybitConnector] ========================================`);
      throw error;
    }
  }

  /**
   * Place a reduce-only market order
   */
  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[BybitConnector] Placing reduce-only market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      // Validate and adjust quantity to meet trading rules
      const validatedQty = await this.validateAndAdjustQuantity(symbol, quantity);

      const result = await this.bybitService.placeOrder({
        category: 'linear',
        symbol,
        side,
        orderType: 'Market',
        qty: validatedQty,
        reduceOnly: true,
      });

      console.log('[BybitConnector] Reduce-only order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error placing reduce-only order:', error.message);
      throw error;
    }
  }

  /**
   * Set take-profit and stop-loss for an existing position
   * Uses Bybit's setTradingStop API to set TP/SL on open position
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
    console.log(`[BybitConnector] Setting trading stop for ${params.symbol}:`, {
      side: params.side,
      takeProfit: params.takeProfit,
      stopLoss: params.stopLoss,
    });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    // Validate at least one parameter is provided
    if (!params.takeProfit && !params.stopLoss) {
      throw new Error('At least one of takeProfit or stopLoss must be provided');
    }

    try {
      // Build setTradingStop request
      const request: any = {
        category: 'linear',
        symbol: params.symbol,
        positionIdx: 0, // 0 for one-way mode
        tpslMode: 'Full', // Full position TP/SL
      };

      // Add take-profit if provided
      if (params.takeProfit) {
        request.takeProfit = params.takeProfit.toString();
        request.tpTriggerBy = 'LastPrice'; // Trigger TP based on last traded price (faster execution)
        console.log(`[BybitConnector] Take-profit price: $${params.takeProfit} (trigger: LastPrice)`);
      }

      // Add stop-loss if provided
      if (params.stopLoss) {
        request.stopLoss = params.stopLoss.toString();
        request.slTriggerBy = 'LastPrice'; // Trigger SL based on last traded price
        console.log(`[BybitConnector] Stop-loss price: $${params.stopLoss} (trigger: LastPrice)`);
      }

      // Call Bybit API
      const result = await this.bybitService.setTradingStop(request);

      console.log('[BybitConnector] Trading stop set successfully:', {
        takeProfit: params.takeProfit,
        stopLoss: params.stopLoss,
        result
      });

      return {
        success: true,
        message: 'Trading stop set successfully',
        takeProfitOrderId: params.takeProfit ? 'TP-' + Date.now() : undefined,
        stopLossOrderId: params.stopLoss ? 'SL-' + Date.now() : undefined,
      };
    } catch (error: any) {
      console.error('[BybitConnector] Error setting trading stop:', error.message);

      // Provide helpful error messages
      if (error.message.includes('position')) {
        throw new Error(
          `Failed to set TP/SL for ${params.symbol}: No open position found. ` +
          `Please open a position first before setting take-profit or stop-loss.`
        );
      }

      throw new Error(`Failed to set trading stop: ${error.message}`);
    }
  }

  /**
   * Get transaction logs (for funding fee verification)
   */
  async getTransactionLog(params: {
    category?: 'linear' | 'spot' | 'option';
    type?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): Promise<any[]> {
    console.log('[BybitConnector] Fetching transaction log:', params);

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const result = await this.bybitService.getTransactionLog({
        accountType: 'UNIFIED',
        ...params,
      });

      console.log(`[BybitConnector] Found ${result.length} transactions`);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error fetching transaction log:', error.message);
      throw error;
    }
  }

  /**
   * Set leverage for a trading symbol
   * IMPORTANT: Leverage must be set BEFORE opening positions
   *
   * For Bybit, both buyLeverage and sellLeverage must be set:
   * - In one-way mode, both must be equal
   * - In hedge mode, they can be different
   *
   * @param symbol Trading pair symbol (e.g., "BTCUSDT")
   * @param leverage Leverage multiplier (typically 1-100x)
   * @param category Product category (default: "linear")
   */
  async setLeverage(
    symbol: string,
    leverage: number,
    category: 'linear' | 'inverse' = 'linear'
  ): Promise<any> {
    console.log(`[BybitConnector] Setting leverage for ${symbol}:`, {
      leverage,
      category,
    });

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      // Validate leverage range
      if (leverage < 1 || leverage > 100) {
        throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 100.`);
      }

      // For one-way mode, both buy and sell leverage must be equal
      // Set both to the same value
      const result = await this.bybitService.setLeverage(
        category,
        symbol,
        leverage,  // buyLeverage
        leverage   // sellLeverage
      );

      console.log('[BybitConnector] Leverage set successfully:', result);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error setting leverage:', error.message);

      // "leverage not modified" means leverage is already at the desired value - this is OK!
      if (error.message && error.message.toLowerCase().includes('leverage not modified')) {
        console.log(`[BybitConnector] ✓ Leverage already set to ${leverage}x for ${symbol}, continuing...`);
        return { success: true, leverageAlreadySet: true };
      }

      // Provide helpful error messages for common issues
      if (error.message.includes('position') || error.message.includes('Position')) {
        throw new Error(
          `Failed to set leverage for ${symbol}: ${error.message}. ` +
          `Note: Leverage cannot be changed when there are open positions. ` +
          `Please close all positions for ${symbol} before changing leverage.`
        );
      }

      if (error.message.includes('leverage') && error.message.includes('risk')) {
        throw new Error(
          `Failed to set leverage for ${symbol}: ${error.message}. ` +
          `The requested leverage may exceed the maximum allowed for your account tier or position size.`
        );
      }

      throw new Error(`Failed to set leverage for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Subscribe to wallet balance updates via WebSocket
   * Used for real-time funding payment monitoring
   *
   * @param callback Function to call when wallet updates are received
   */
  subscribeToWallet(callback: (data: any) => void): void {
    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    this.bybitService.subscribeToWallet(callback);
  }

  /**
   * Get the underlying BybitService instance
   * Used for advanced operations like WebSocket subscriptions
   */
  getBybitService(): BybitService {
    return this.bybitService;
  }

  /**
   * Get current market price for a symbol (REST API)
   * Uses Bybit's ticker endpoint to get the last traded price
   */
  async getMarketPrice(symbol: string): Promise<number> {
    console.log(`[BybitConnector] Fetching market price for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const tickers = await this.bybitService.getTicker('linear', symbol);

      if (!tickers || tickers.length === 0) {
        throw new Error(`No ticker data found for ${symbol}`);
      }

      const ticker = tickers[0];
      const lastPrice = parseFloat(ticker.lastPrice);

      if (isNaN(lastPrice) || lastPrice <= 0) {
        throw new Error(`Invalid price data for ${symbol}: ${ticker.lastPrice}`);
      }

      console.log(`[BybitConnector] Current price for ${symbol}: $${lastPrice}`);
      return lastPrice;
    } catch (error: any) {
      console.error(`[BybitConnector] Error fetching market price for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get instruments info (trading pairs, lot sizes, etc.)
   *
   * @param params - Parameters including category ('linear', 'spot', 'option') and optional symbol
   * @returns Instruments information
   */
  async getInstrumentsInfo(params: { category: 'linear' | 'spot' | 'option'; symbol?: string }): Promise<any> {
    console.log(`[BybitConnector] Fetching instruments info for category: ${params.category}`);

    try {
      const result = await this.bybitService.getInstrumentsInfo(params.category, params.symbol);
      console.log(`[BybitConnector] Found ${result?.list?.length || 0} instruments`);
      return result;
    } catch (error: any) {
      console.error(`[BybitConnector] Error fetching instruments info:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   * Uses Bybit's existing WebSocket infrastructure to stream ticker updates
   *
   * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
   * @param callback - Callback function called on each price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    console.log(`[BybitConnector] Subscribing to price stream for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      let lastWarnTime = 0;
      const WARN_THROTTLE_MS = 5000; // Only warn once every 5 seconds

      // Create wrapper callback to extract price and timestamp
      const wrappedCallback = (data: any) => {
        try {
          // Bybit WebSocket ticker update format:
          // { topic: 'tickers.BTCUSDT', type: 'snapshot', data: { symbol, lastPrice, ... }, ts: 1234567890 }

          // Filter: Only process ticker messages for our specific symbol
          if (!data.topic || !data.topic.includes(`tickers.${symbol}`)) {
            return; // Skip non-ticker messages (heartbeats, subscriptions, other symbols, etc.)
          }

          // Must have data field with ticker information
          if (!data.data) {
            return; // Skip messages without data
          }

          const tickerData = data.data;
          const price = parseFloat(tickerData.lastPrice);
          const timestamp = data.ts || Date.now();

          if (!isNaN(price) && price > 0) {
            callback(price, timestamp);
          } else {
            // Throttle warnings to prevent log spam
            const now = Date.now();
            if (now - lastWarnTime > WARN_THROTTLE_MS) {
              console.warn(`[BybitConnector] Invalid price in WebSocket update for ${symbol}:`, tickerData.lastPrice);
              lastWarnTime = now;
            }
          }
        } catch (error: any) {
          console.error(`[BybitConnector] Error processing WebSocket update for ${symbol}:`, error.message);
        }
      };

      // Subscribe using BybitService WebSocket
      this.bybitService.subscribeToTicker(symbol, wrappedCallback);
      console.log(`[BybitConnector] Successfully subscribed to price stream for ${symbol}`);

      // Return unsubscribe function
      return () => {
        console.log(`[BybitConnector] Unsubscribing from price stream for ${symbol}`);
        this.bybitService.unsubscribeAll();
      };
    } catch (error: any) {
      console.error(`[BybitConnector] Error subscribing to price stream for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get contract specification for quantity calculations
   * Bybit uses base currency (multiplier = 1) for most linear perpetuals
   */
  async getContractSpecification(symbol: string): Promise<ContractSpecification> {
    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const instrumentInfo = await this.bybitService.getInstrumentsInfo('linear', symbol);

      if (!instrumentInfo || !instrumentInfo.list || instrumentInfo.list.length === 0) {
        throw new Error(`No instrument info found for ${symbol}`);
      }

      const instrument = instrumentInfo.list[0];
      const lotSizeFilter = instrument.lotSizeFilter;

      if (!lotSizeFilter) {
        throw new Error(`No lot size filter found for ${symbol}`);
      }

      const minOrderQty = parseFloat(lotSizeFilter.minOrderQty || '0.001');
      const maxOrderQty = parseFloat(lotSizeFilter.maxOrderQty || '1000000');

      return {
        exchange: 'BYBIT',
        symbol,
        multiplier: 1, // Bybit uses base currency (e.g., 1 contract = 1 BTC)
        minOrderSize: minOrderQty,
        maxOrderSize: maxOrderQty,
      };
    } catch (error: any) {
      console.error(`[BybitConnector] Error getting contract specification for ${symbol}:`, error.message);
      throw error;
    }
  }
}
