import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { BybitService } from '@/lib/bybit';

/**
 * Bybit Exchange Connector
 *
 * Implements the BaseExchangeConnector interface for Bybit exchange
 */
export class BybitConnector extends BaseExchangeConnector {
  private bybitService: BybitService;
  private apiKey: string;
  private apiSecret: string;
  private testnet: boolean;

  constructor(apiKey: string, apiSecret: string, testnet: boolean = true) {
    super();
    this.exchangeName = testnet ? 'BYBIT_TESTNET' : 'BYBIT';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.testnet = testnet;

    this.bybitService = new BybitService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
    });
  }

  /**
   * Initialize Bybit connection
   */
  async initialize(): Promise<void> {
    console.log(`[BybitConnector] Initializing Bybit connector (testnet: ${this.testnet})...`);

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
   * Close position
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[BybitConnector] Closing position for ${symbol}`);

    if (!this.isInitialized) {
      throw new Error('Bybit connector not initialized');
    }

    try {
      const result = await this.bybitService.closePosition('linear', symbol, 'Buy');
      console.log('[BybitConnector] Position closed:', result);
      return result;
    } catch (error: any) {
      console.error('[BybitConnector] Error closing position:', error.message);
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
}
