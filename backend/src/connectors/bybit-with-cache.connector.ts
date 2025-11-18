import { BaseExchangeConnector, OrderSide } from './base-exchange.connector';
import { BybitServiceWithCache } from '@/lib/bybit-with-cache';

/**
 * Bybit Exchange Connector with State Caching
 *
 * Optimized connector that uses cached time synchronization state
 * to eliminate 1-2 second initialization delays in serverless environments.
 */
export class BybitConnectorWithCache extends BaseExchangeConnector {
  private bybitService: BybitServiceWithCache;
  private apiKey: string;
  private apiSecret: string;
  private testnet: boolean;
  private userId?: string;
  private credentialId?: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    userId?: string,
    credentialId?: string
  ) {
    super();
    this.exchangeName = testnet ? 'BYBIT_TESTNET' : 'BYBIT';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.testnet = testnet;
    this.userId = userId;
    this.credentialId = credentialId;

    this.bybitService = new BybitServiceWithCache({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
      userId,
      credentialId,
    });
  }

  /**
   * Initialize Bybit connection with cached time sync (FAST PATH)
   */
  async initialize(): Promise<void> {
    console.log(`[BybitConnectorWithCache] Initializing Bybit connector (testnet: ${this.testnet})...`);

    try {
      const startTime = Date.now();

      // Try to use cached time offset
      const cacheHit = await this.bybitService.initializeWithCache();

      // Test connection by fetching account info
      await this.bybitService.getAccountInfo();

      const totalTime = Date.now() - startTime;

      this.isInitialized = true;
      console.log(
        `[BybitConnectorWithCache] Initialized successfully in ${totalTime}ms (cache ${cacheHit ? 'HIT' : 'MISS'})`
      );
    } catch (error: any) {
      console.error('[BybitConnectorWithCache] Failed to initialize:', error.message);
      throw new Error(`Failed to initialize Bybit connector: ${error.message}`);
    }
  }

  /**
   * Validate and adjust quantity to meet Bybit's trading rules
   */
  private async validateAndAdjustQuantity(symbol: string, quantity: number): Promise<string> {
    try {
      const instrumentInfo = await this.bybitService.getInstrumentsInfo('linear', symbol);

      if (!instrumentInfo || !instrumentInfo.list || instrumentInfo.list.length === 0) {
        console.warn(`[BybitConnectorWithCache] No instrument info found for ${symbol}, using original quantity`);
        return quantity.toString();
      }

      const instrument = instrumentInfo.list[0];
      const lotSizeFilter = instrument.lotSizeFilter;

      if (!lotSizeFilter) {
        console.warn(`[BybitConnectorWithCache] No lot size filter for ${symbol}, using original quantity`);
        return quantity.toString();
      }

      const minOrderQty = parseFloat(lotSizeFilter.minOrderQty || '0');
      const qtyStep = parseFloat(lotSizeFilter.qtyStep || '0.001');

      if (quantity < minOrderQty) {
        console.warn(`[BybitConnectorWithCache] Quantity ${quantity} is below minimum ${minOrderQty}, adjusting to minimum`);
        quantity = minOrderQty;
      }

      const steps = Math.floor(quantity / qtyStep);
      const adjustedQty = steps * qtyStep;
      const decimals = qtyStep.toString().split('.')[1]?.length || 0;
      const finalQty = parseFloat(adjustedQty.toFixed(decimals));

      if (finalQty !== quantity) {
        console.log(`[BybitConnectorWithCache] Adjusted quantity from ${quantity} to ${finalQty} (step: ${qtyStep})`);
      }

      return finalQty.toString();
    } catch (error: any) {
      console.error(`[BybitConnectorWithCache] Error validating quantity for ${symbol}:`, error.message);
      return quantity.toString();
    }
  }

  async placeMarketOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');

    try {
      const validatedQty = await this.validateAndAdjustQuantity(symbol, quantity);
      const result = await this.bybitService.placeOrder({
        category: 'linear',
        symbol,
        side,
        orderType: 'Market',
        qty: validatedQty,
      });
      return result;
    } catch (error: any) {
      console.error('[BybitConnectorWithCache] Error placing market order:', error.message);
      throw error;
    }
  }

  async placeLimitOrder(symbol: string, side: OrderSide, quantity: number, price: number): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');

    try {
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
      return result;
    } catch (error: any) {
      console.error('[BybitConnectorWithCache] Error placing limit order:', error.message);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');
    return this.bybitService.cancelOrder('linear', symbol, orderId);
  }

  async getBalance(): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');
    return this.bybitService.getWalletBalance('UNIFIED');
  }

  async getPosition(symbol: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');

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

    return position;
  }

  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');

    const orders = await this.bybitService.getOrders('linear');
    const order = orders.find((o) => o.orderId === orderId);

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return order;
  }

  async closePosition(symbol: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');
    return this.bybitService.closePosition('linear', symbol, 'Buy');
  }

  async placeReduceOnlyOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');

    try {
      const validatedQty = await this.validateAndAdjustQuantity(symbol, quantity);
      const result = await this.bybitService.placeOrder({
        category: 'linear',
        symbol,
        side,
        orderType: 'Market',
        qty: validatedQty,
        reduceOnly: true,
      });
      return result;
    } catch (error: any) {
      console.error('[BybitConnectorWithCache] Error placing reduce-only order:', error.message);
      throw error;
    }
  }

  async getTransactionLog(params: {
    category?: 'linear' | 'spot' | 'option';
    type?: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }): Promise<any[]> {
    if (!this.isInitialized) throw new Error('Bybit connector not initialized');

    return this.bybitService.getTransactionLog({
      accountType: 'UNIFIED',
      ...params,
    });
  }
}
