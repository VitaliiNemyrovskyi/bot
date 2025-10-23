import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { GateIOService } from '@/lib/gateio';

/**
 * Gate.io Exchange Connector
 *
 * Implements the BaseExchangeConnector interface for Gate.io exchange
 */
export class GateIOConnector extends BaseExchangeConnector {
  private gateioService: GateIOService;
  private apiKey: string;
  private apiSecret: string;
  private leverageCache: Map<string, number> = new Map(); // Cache leverage per symbol

  constructor(apiKey: string, apiSecret: string) {
    super();
    this.exchangeName = 'GATEIO';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;

    this.gateioService = new GateIOService({
      apiKey,
      apiSecret,
      enableRateLimit: true,
    });
  }

  /**
   * Initialize Gate.io connection
   */
  async initialize(): Promise<void> {
    console.log(`[GateIOConnector] Initializing Gate.io connector...`);

    try {
      // Test connection by fetching account info
      await this.gateioService.getAccountInfo();
      this.isInitialized = true;
      console.log('[GateIOConnector] Gate.io connector initialized successfully');
    } catch (error: any) {
      console.error('[GateIOConnector] Failed to initialize:', error.message);

      // Check for USER_NOT_FOUND error (unactivated futures account)
      const errorMsg = error.message || String(error);
      if (errorMsg.includes('USER_NOT_FOUND') || errorMsg.includes('please transfer funds first')) {
        throw new Error(
          'Gate.io futures account not activated. Please:\n' +
          '1. Log in to Gate.io\n' +
          '2. Go to Futures Trading section\n' +
          '3. Transfer USDT from your Spot wallet to Futures wallet\n' +
          '4. This will activate your futures account for API trading'
        );
      }

      throw new Error(`Failed to initialize Gate.io connector: ${error.message}`);
    }
  }

  /**
   * Normalize symbol format for Gate.io
   * Input: "BTCUSDT" or "BTC-USDT" or "BTC_USDT"
   * Output: "BTC_USDT" (Gate.io format for perpetual futures)
   */
  private normalizeSymbol(symbol: string): string {
    // Remove hyphens and slashes
    let normalized = symbol.replace(/[-/]/g, '');

    // Add underscore before USDT if not present
    if (!normalized.includes('_')) {
      normalized = normalized.replace(/USDT$/, '_USDT');
    }

    return normalized;
  }

  /**
   * Validate and adjust quantity to meet Gate.io's trading rules
   */
  private async validateAndAdjustQuantity(contract: string, quantity: number): Promise<number> {
    try {
      // Fetch contract details to get trading rules
      const contractDetails = await this.gateioService.getContractDetails(contract);

      const minOrderSize = contractDetails.order_size_min;
      const maxOrderSize = contractDetails.order_size_max;

      console.log(`[GateIOConnector] Trading rules for ${contract}:`, {
        minOrderSize,
        maxOrderSize,
        requestedQty: quantity,
      });

      // Check minimum quantity
      if (quantity < minOrderSize) {
        console.warn(`[GateIOConnector] Quantity ${quantity} is below minimum ${minOrderSize}, adjusting to minimum`);
        quantity = minOrderSize;
      }

      // Check maximum quantity
      if (quantity > maxOrderSize) {
        console.warn(`[GateIOConnector] Quantity ${quantity} exceeds maximum ${maxOrderSize}, adjusting to maximum`);
        quantity = maxOrderSize;
      }

      // Gate.io uses integer quantities for most contracts
      // Round to nearest integer
      const adjustedQty = Math.round(quantity);

      if (adjustedQty !== quantity) {
        console.log(`[GateIOConnector] Adjusted quantity from ${quantity} to ${adjustedQty}`);
      }

      return adjustedQty;
    } catch (error: any) {
      console.error(`[GateIOConnector] Error validating quantity for ${contract}:`, error.message);
      // Fallback: return rounded quantity
      return Math.round(quantity);
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
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Placing market ${side} order:`, {
      symbol,
      contract,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      // Validate and adjust quantity
      const validatedQty = await this.validateAndAdjustQuantity(contract, quantity);

      // Gate.io uses positive size for long, negative size for short
      const orderSize = side === 'Buy' ? validatedQty : -validatedQty;

      const result = await this.gateioService.placeOrder({
        contract,
        size: orderSize,
        tif: 'ioc', // Immediate or cancel (market order behavior)
      });

      console.log('[GateIOConnector] Market order placed:', result);

      // Convert Gate.io order format to common format with orderId field
      return {
        ...result,
        orderId: result.id?.toString() || '',
      };
    } catch (error: any) {
      console.error('[GateIOConnector] Error placing market order:', error.message);
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
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Placing limit ${side} order:`, {
      symbol,
      contract,
      quantity,
      price,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      // Validate and adjust quantity
      const validatedQty = await this.validateAndAdjustQuantity(contract, quantity);

      // Gate.io uses positive size for long, negative size for short
      const orderSize = side === 'Buy' ? validatedQty : -validatedQty;

      const result = await this.gateioService.placeOrder({
        contract,
        size: orderSize,
        price: price.toString(),
        tif: 'gtc', // Good till cancel (limit order default)
      });

      console.log('[GateIOConnector] Limit order placed:', result);

      // Convert Gate.io order format to common format with orderId field
      return {
        ...result,
        orderId: result.id?.toString() || '',
      };
    } catch (error: any) {
      console.error('[GateIOConnector] Error placing limit order:', error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[GateIOConnector] Canceling order:`, { orderId, symbol });

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const result = await this.gateioService.cancelOrder(orderId);
      console.log('[GateIOConnector] Order canceled:', result);
      return result;
    } catch (error: any) {
      console.error('[GateIOConnector] Error canceling order:', error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const result = await this.gateioService.getBalance();
      console.log('[GateIOConnector] Balance retrieved');
      return result;
    } catch (error: any) {
      console.error('[GateIOConnector] Error getting balance:', error.message);
      throw error;
    }
  }

  /**
   * Get position for a symbol
   */
  async getPosition(symbol: string): Promise<any> {
    const contract = this.normalizeSymbol(symbol);

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const positions = await this.gateioService.getPositions(contract);
      const position = positions.find((p) => p.contract === contract);

      if (!position || position.size === 0) {
        return {
          contract,
          size: 0,
          entry_price: '0',
          mark_price: '0',
          unrealised_pnl: '0',
          mode: 'single',
        };
      }

      console.log('[GateIOConnector] Position retrieved:', position);
      return position;
    } catch (error: any) {
      console.error('[GateIOConnector] Error getting position:', error.message);
      throw error;
    }
  }

  /**
   * Get all positions or positions for a specific symbol
   */
  async getPositions(symbol?: string): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const contract = symbol ? this.normalizeSymbol(symbol) : undefined;
      const positions = await this.gateioService.getPositions(contract);
      console.log('[GateIOConnector] Positions retrieved:', positions.length);
      return positions;
    } catch (error: any) {
      console.error('[GateIOConnector] Error getting positions:', error.message);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      // Gate.io doesn't have a direct single order status endpoint
      // Would need to implement order list filtering
      throw new Error('getOrderStatus not yet implemented for Gate.io');
    } catch (error: any) {
      console.error('[GateIOConnector] Error getting order status:', error.message);
      throw error;
    }
  }

  /**
   * Close position
   */
  async closePosition(symbol: string): Promise<any> {
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Closing position for ${contract}`);

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      // First check if there's an open position
      const position = await this.getPosition(symbol);

      if (!position || position.size === 0) {
        console.log(`[GateIOConnector] No open position for ${contract}`);
        return { success: true, message: 'No open positions to close' };
      }

      const result = await this.gateioService.closePosition(contract);

      console.log('[GateIOConnector] Position closed:', result);
      return result;
    } catch (error: any) {
      console.error('[GateIOConnector] Error closing position:', error.message);
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
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Placing reduce-only market ${side} order:`, {
      symbol,
      contract,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      // Validate and adjust quantity
      const validatedQty = await this.validateAndAdjustQuantity(contract, quantity);

      // Gate.io uses positive size for long, negative size for short
      const orderSize = side === 'Buy' ? validatedQty : -validatedQty;

      const result = await this.gateioService.placeOrder({
        contract,
        size: orderSize,
        tif: 'ioc', // Immediate or cancel (market order)
        reduce_only: true, // Reduce-only flag
      });

      console.log('[GateIOConnector] Reduce-only order placed:', result);

      // Convert Gate.io order format to common format with orderId field
      return {
        ...result,
        orderId: result.id?.toString() || '',
      };
    } catch (error: any) {
      console.error('[GateIOConnector] Error placing reduce-only order:', error.message);
      throw error;
    }
  }

  /**
   * Set take-profit and stop-loss for an existing position
   * Gate.io doesn't have a direct setTradingStop endpoint like Bybit
   * Instead, we need to place conditional orders
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
    console.log(`[GateIOConnector] Setting trading stop for ${params.symbol}:`, {
      side: params.side,
      takeProfit: params.takeProfit,
      stopLoss: params.stopLoss,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    // Validate at least one parameter is provided
    if (!params.takeProfit && !params.stopLoss) {
      throw new Error('At least one of takeProfit or stopLoss must be provided');
    }

    try {
      // Gate.io requires placing conditional orders for TP/SL
      // This is not implemented in the current version
      console.warn('[GateIOConnector] setTradingStop not fully implemented for Gate.io');
      console.warn('[GateIOConnector] Gate.io requires placing separate conditional orders for TP/SL');

      return {
        success: false,
        message: 'TP/SL via conditional orders not yet implemented for Gate.io. Please set manually.',
      };
    } catch (error: any) {
      console.error('[GateIOConnector] Error setting trading stop:', error.message);
      throw new Error(`Failed to set trading stop: ${error.message}`);
    }
  }

  /**
   * Set leverage for a trading symbol
   * IMPORTANT: Leverage must be set BEFORE opening positions
   *
   * @param symbol Trading pair symbol (e.g., "BTCUSDT")
   * @param leverage Leverage multiplier (typically 1-100x)
   */
  async setLeverage(
    symbol: string,
    leverage: number
  ): Promise<any> {
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Setting leverage for ${contract}:`, {
      leverage,
    });

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    // Validate leverage range
    if (leverage < 1 || leverage > 100) {
      throw new Error(`Invalid leverage: ${leverage}. Must be between 1 and 100.`);
    }

    // ALWAYS cache the leverage value first
    this.leverageCache.set(contract, leverage);
    console.log(`[GateIOConnector] ✓ Cached leverage ${leverage}x for ${contract}`);

    try {
      const result = await this.gateioService.setLeverage(contract, leverage);
      console.log('[GateIOConnector] ✓ Leverage set successfully via API:', result);
      return result;
    } catch (error: any) {
      console.error('[GateIOConnector] Error setting leverage via API:', error.message);

      // Provide helpful error messages for common issues
      if (error.message.includes('position') || error.message.includes('Position')) {
        throw new Error(
          `Failed to set leverage for ${contract}: ${error.message}. ` +
          `Note: Leverage cannot be changed when there are open positions. ` +
          `Please close all positions for ${contract} before changing leverage.`
        );
      }

      // For other errors, still throw but note that cached leverage will be used
      console.log(`[GateIOConnector] Leverage API call failed, but cached value ${leverage}x is available`);
      throw new Error(`Failed to set leverage via API for ${contract}: ${error.message}`);
    }
  }

  /**
   * Get current market price for a symbol (REST API)
   * Uses Gate.io's ticker endpoint to get the last traded price
   */
  async getMarketPrice(symbol: string): Promise<number> {
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Fetching market price for ${contract}`);

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const ticker = await this.gateioService.getTicker(contract);
      const lastPrice = parseFloat(ticker.last);

      if (isNaN(lastPrice) || lastPrice <= 0) {
        throw new Error(`Invalid price data for ${contract}: ${ticker.last}`);
      }

      console.log(`[GateIOConnector] Current price for ${contract}: $${lastPrice}`);
      return lastPrice;
    } catch (error: any) {
      console.error(`[GateIOConnector] Error fetching market price for ${contract}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time price updates via WebSocket
   * Uses Gate.io's WebSocket ticker stream
   *
   * Gate.io WebSocket endpoint: wss://fx-ws.gateio.ws/v4/ws/usdt
   * Channel: futures.tickers
   *
   * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
   * @param callback - Callback function called on each price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Subscribing to price stream for ${contract}`);

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const unsubscribe = await this.gateioService.subscribeToPriceStream(
        contract,
        callback
      );

      console.log(`[GateIOConnector] Successfully subscribed to price stream for ${contract}`);
      return unsubscribe;
    } catch (error: any) {
      console.error(`[GateIOConnector] Error subscribing to price stream for ${contract}:`, error.message);
      throw error;
    }
  }

  /**
   * Subscribe to real-time mark price updates via WebSocket
   * Uses Gate.io's WebSocket mark price stream
   *
   * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
   * @param callback - Callback function called on each mark price update
   * @returns Unsubscribe function to stop receiving updates
   */
  async subscribeToMarkPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    const contract = this.normalizeSymbol(symbol);

    console.log(`[GateIOConnector] Subscribing to mark price stream for ${contract}`);

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const unsubscribe = await this.gateioService.subscribeToMarkPriceStream(
        contract,
        callback
      );

      console.log(`[GateIOConnector] Successfully subscribed to mark price stream for ${contract}`);
      return unsubscribe;
    } catch (error: any) {
      console.error(`[GateIOConnector] Error subscribing to mark price stream for ${contract}:`, error.message);
      throw error;
    }
  }
}
