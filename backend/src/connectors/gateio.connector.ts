import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { GateIOService } from '@/lib/gateio';
import { ContractSpecification } from '@/lib/contract-calculator';

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
   * Convert quantity from base currency to contracts
   * SINGLE RESPONSIBILITY: Format conversion only, NO business logic
   *
   * @throws Error if quantity cannot be converted to whole contracts
   */
  private async convertToContracts(contract: string, quantity: number): Promise<number> {
    try {
      // Fetch contract details to get quanto_multiplier
      const contractDetails = await this.gateioService.getContractDetails(contract);
      const quantoMultiplier = parseFloat(contractDetails.quanto_multiplier);

      console.log(`[GateIOConnector] Converting ${quantity} to contracts (multiplier: ${quantoMultiplier})`);

      // Convert from base currency to contracts
      const contractQuantity = quantity / quantoMultiplier;

      // Gate.io API requires INTEGER number of contracts
      // If not integer, this is a business logic error - throw exception
      if (contractQuantity !== Math.floor(contractQuantity)) {
        throw new Error(
          `Quantity ${quantity} ${contract.split('_')[0]} cannot be converted to whole contracts. ` +
          `Quanto multiplier is ${quantoMultiplier}. Use multiple of ${quantoMultiplier}.`
        );
      }

      console.log(`[GateIOConnector] Converted: ${quantity} → ${contractQuantity} contracts`);
      return contractQuantity;
    } catch (error: any) {
      console.error(`[GateIOConnector] Error converting quantity for ${contract}:`, error.message);
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
      // Convert quantity to contracts (throws if not valid)
      const contractQty = await this.convertToContracts(contract, quantity);

      // Gate.io uses positive size for long, negative size for short
      const orderSize = side === 'Buy' ? contractQty : -contractQty;

      const result = await this.gateioService.placeOrder({
        contract,
        size: orderSize,
        tif: 'ioc', // Immediate or cancel (market order behavior)
      });

      console.log('[GateIOConnector] Market order placed:', {
        orderId: result.id,
        size: result.size,
        finish_as: result.finish_as,
        left: result.left
      });

      // Calculate actual filled quantity in base currency
      // Gate.io returns size in contracts, need to convert to base currency
      const contractDetails = await this.gateioService.getContractDetails(contract);
      const quantoMultiplier = parseFloat(contractDetails.quanto_multiplier);
      const filledContracts = Math.abs(result.size); // size can be negative for short
      const filledQuantity = filledContracts * quantoMultiplier;

      console.log('[GateIOConnector] Filled quantity calculation:', {
        sizeInContracts: result.size,
        filledContracts,
        quantoMultiplier,
        filledQuantityInBaseCurrency: filledQuantity
      });

      // Leverage should have been set BEFORE this order via setLeverage()
      const cachedLeverage = this.leverageCache.get(contract);
      if (cachedLeverage && cachedLeverage > 0) {
        console.log(`[GateIOConnector] Order placed with ${cachedLeverage}x leverage (set previously)`);
      } else {
        console.warn(`[GateIOConnector] ⚠️ No leverage set for ${contract}, using account default`);
      }

      // Convert Gate.io order format to common format with orderId and filledQuantity fields
      return {
        ...result,
        orderId: result.id?.toString() || '',
        filledQuantity, // Add filled quantity in base currency
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
      // Convert quantity to contracts (throws if not valid)
      const contractQty = await this.convertToContracts(contract, quantity);

      // Gate.io uses positive size for long, negative size for short
      const orderSize = side === 'Buy' ? contractQty : -contractQty;

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
      // Convert quantity to contracts (throws if not valid)
      const contractQty = await this.convertToContracts(contract, quantity);

      // Gate.io uses positive size for long, negative size for short
      const orderSize = side === 'Buy' ? contractQty : -contractQty;

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
   * Instead, we need to place price-triggered conditional orders
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
    // DEBUG: Log raw params to understand what's being passed
    console.log('[GateIOConnector] setTradingStop called with params:', JSON.stringify(params));

    if (!params) {
      throw new Error('[GateIOConnector] setTradingStop: params is undefined or null');
    }

    if (!params.symbol) {
      throw new Error('[GateIOConnector] setTradingStop: params.symbol is required');
    }

    const contract = this.normalizeSymbol(params.symbol);

    console.log(`[GateIOConnector] Setting trading stop for ${contract}:`, {
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
      // First, check if there's an open position
      const position = await this.getPosition(params.symbol);

      if (!position || position.size === 0) {
        throw new Error(
          `No open position found for ${contract}. ` +
          `Please open a position first before setting take-profit or stop-loss.`
        );
      }

      const positionSize = position.size;
      const isLongPosition = positionSize > 0;
      const isShortPosition = positionSize < 0;
      const absoluteSize = Math.abs(positionSize);

      console.log(`[GateIOConnector] Current position for ${contract}:`, {
        size: positionSize,
        absoluteSize,
        isLong: isLongPosition,
        isShort: isShortPosition,
        entryPrice: position.entry_price,
      });

      // Determine the closing side based on position
      // For LONG positions (size > 0), we need to SELL (ask) to exit
      // For SHORT positions (size < 0), we need to BUY (bid) to exit
      // Gate.io uses "ask" for sell and "bid" for buy in price-triggered orders
      const closingSide = isLongPosition ? 'ask' : 'bid';

      let takeProfitOrderId: string | undefined;
      let stopLossOrderId: string | undefined;

      // Place Take-Profit order if provided
      if (params.takeProfit) {
        console.log(`[GateIOConnector] Placing take-profit order at $${params.takeProfit}`);

        // For LONG: TP triggers when price >= takeProfit (price goes up)
        // For SHORT: TP triggers when price <= takeProfit (price goes down)
        // Gate.io uses strategy_type 0 (by price) and price_type 0 (last price)
        // Note: In dual mode, cannot use close:true, must specify size + reduce_only

        const tpOrder = await this.gateioService.placePriceTriggeredOrder({
          contract,
          size: absoluteSize, // Specify exact position size to close
          reduce_only: true, // Ensure this only reduces the position
          trigger: {
            strategy_type: 0, // 0 = by price
            price_type: 0, // 0 = last price
            price: params.takeProfit.toString(),
            rule: isLongPosition ? 1 : 2, // LONG: price >= TP (rule=1), SHORT: price <= TP (rule=2)
          },
          put: {
            type: 'market', // Use market order when triggered for fast execution
            side: closingSide, // 'ask' for LONG, 'bid' for SHORT
          },
          text: 'TP', // Mark as take-profit order
        });

        takeProfitOrderId = tpOrder.id.toString();
        console.log(`[GateIOConnector] Take-profit order placed: ${takeProfitOrderId}`);
      }

      // Place Stop-Loss order if provided
      if (params.stopLoss) {
        console.log(`[GateIOConnector] Placing stop-loss order at $${params.stopLoss}`);

        // For LONG: SL triggers when price <= stopLoss (price goes down)
        // For SHORT: SL triggers when price >= stopLoss (price goes up)
        // Note: In dual mode, cannot use close:true, must specify size + reduce_only

        const slOrder = await this.gateioService.placePriceTriggeredOrder({
          contract,
          size: absoluteSize, // Specify exact position size to close
          reduce_only: true, // Ensure this only reduces the position
          trigger: {
            strategy_type: 0, // 0 = by price
            price_type: 0, // 0 = last price
            price: params.stopLoss.toString(),
            rule: isLongPosition ? 2 : 1, // LONG: price <= SL (rule=2), SHORT: price >= SL (rule=1)
          },
          put: {
            type: 'market', // Use market order when triggered for fast execution
            side: closingSide, // 'ask' for LONG, 'bid' for SHORT
          },
          text: 'SL', // Mark as stop-loss order
        });

        stopLossOrderId = slOrder.id.toString();
        console.log(`[GateIOConnector] Stop-loss order placed: ${stopLossOrderId}`);
      }

      console.log('[GateIOConnector] Trading stop set successfully:', {
        contract,
        positionSide: isLongPosition ? 'LONG' : 'SHORT',
        takeProfitOrderId,
        stopLossOrderId,
      });

      return {
        success: true,
        takeProfitOrderId,
        stopLossOrderId,
        message: 'Trading stop set successfully via price-triggered orders',
      };
    } catch (error: any) {
      console.error('[GateIOConnector] Error setting trading stop:', error.message);

      // Provide helpful error messages
      if (error.message.includes('No open position')) {
        throw error; // Re-throw the position error as-is
      }

      throw new Error(`Failed to set trading stop: ${error.message}`);
    }
  }

  /**
   * Set leverage for a trading symbol
   * IMPORTANT: This calls Gate.io API to set leverage BEFORE opening positions
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

    try {
      // Call Gate.io API to set leverage BEFORE placing orders
      const result = await this.gateioService.setLeverageBeforeOrders(contract, leverage);

      // Cache the leverage for reference
      this.leverageCache.set(contract, leverage);

      console.log(`[GateIOConnector] ✓ Leverage ${leverage}x set successfully for ${contract}`);

      return {
        contract: result.contract,
        leverage: result.leverage,
        mode: result.mode,
      };
    } catch (error: any) {
      console.error(`[GateIOConnector] Failed to set leverage for ${contract}:`, error.message);
      throw new Error(`Failed to set leverage: ${error.message}`);
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

  /**
   * Get contract specification for quantity calculations
   */
  async getContractSpecification(symbol: string): Promise<ContractSpecification> {
    const contract = this.normalizeSymbol(symbol);

    if (!this.isInitialized) {
      throw new Error('Gate.io connector not initialized');
    }

    try {
      const contractDetails = await this.gateioService.getContractDetails(contract);

      return {
        exchange: 'GATEIO',
        symbol: contract,
        multiplier: parseFloat(contractDetails.quanto_multiplier),
        minOrderSize: contractDetails.order_size_min,
        maxOrderSize: contractDetails.order_size_max,
      };
    } catch (error: any) {
      console.error(`[GateIOConnector] Error getting contract specification for ${contract}:`, error.message);
      throw error;
    }
  }
}
