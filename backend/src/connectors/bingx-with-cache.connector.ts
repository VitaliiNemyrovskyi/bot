import { BaseExchangeConnector, OrderSide } from './base-exchange.connector';
import { BingXServiceWithCache } from '@/lib/bingx-with-cache';

/**
 * BingX Exchange Connector with State Caching
 *
 * Optimized connector that uses cached time synchronization state
 * to eliminate 1-2 second initialization delays in serverless environments.
 */
export class BingXConnectorWithCache extends BaseExchangeConnector {
  private bingxService: BingXServiceWithCache;
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
    this.exchangeName = testnet ? 'BINGX_TESTNET' : 'BINGX';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.testnet = testnet;
    this.userId = userId;
    this.credentialId = credentialId;

    this.bingxService = new BingXServiceWithCache({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
      userId,
      credentialId,
    });
  }

  /**
   * Initialize BingX connection with cached time sync (FAST PATH)
   */
  async initialize(): Promise<void> {
    console.log(`[BingXConnectorWithCache] Initializing BingX connector (testnet: ${this.testnet})...`);

    try {
      const startTime = Date.now();

      // Try to use cached time offset
      const cacheHit = await this.bingxService.initializeWithCache();

      // Test connection by fetching account info
      await this.bingxService.getAccountInfo();

      const totalTime = Date.now() - startTime;

      this.isInitialized = true;
      console.log(
        `[BingXConnectorWithCache] Initialized successfully in ${totalTime}ms (cache ${cacheHit ? 'HIT' : 'MISS'})`
      );
    } catch (error: any) {
      console.error('[BingXConnectorWithCache] Failed to initialize:', error.message);
      throw new Error(`Failed to initialize BingX connector: ${error.message}`);
    }
  }

  async placeMarketOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');

    try {
      const positionSide = side === 'Buy' ? 'LONG' : 'SHORT';
      const bingxSide = side === 'Buy' ? 'BUY' : 'SELL';

      const result = await this.bingxService.placeOrder({
        symbol,
        side: bingxSide,
        positionSide,
        type: 'MARKET',
        quantity,
      });
      return result;
    } catch (error: any) {
      console.error('[BingXConnectorWithCache] Error placing market order:', error.message);
      throw error;
    }
  }

  async placeLimitOrder(symbol: string, side: OrderSide, quantity: number, price: number): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');

    try {
      const positionSide = side === 'Buy' ? 'LONG' : 'SHORT';
      const bingxSide = side === 'Buy' ? 'BUY' : 'SELL';

      const result = await this.bingxService.placeOrder({
        symbol,
        side: bingxSide,
        positionSide,
        type: 'LIMIT',
        quantity,
        price,
        timeInForce: 'GTC',
      });
      return result;
    } catch (error: any) {
      console.error('[BingXConnectorWithCache] Error placing limit order:', error.message);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');
    return this.bingxService.cancelOrder(symbol, orderId);
  }

  async getBalance(): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');
    return this.bingxService.getWalletBalance();
  }

  async getPosition(symbol: string): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');

    const positions = await this.bingxService.getPositions(symbol);
    const position = positions.find((p) => p.symbol === symbol);

    if (!position || parseFloat(position.positionAmt) === 0) {
      return {
        symbol,
        positionSide: 'None',
        positionAmt: '0',
        avgPrice: '0',
        unrealizedProfit: '0',
      };
    }

    return position;
  }

  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');
    throw new Error('getOrderStatus not yet implemented for BingX');
  }

  async closePosition(symbol: string): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');

    const position = await this.getPosition(symbol);

    if (!position || position.positionSide === 'None') {
      throw new Error(`No open position for ${symbol}`);
    }

    const positionSide = position.positionSide as 'LONG' | 'SHORT';
    return this.bingxService.closePosition(symbol, positionSide);
  }

  async placeReduceOnlyOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    if (!this.isInitialized) throw new Error('BingX connector not initialized');

    try {
      const positionSide = side === 'Buy' ? 'LONG' : 'SHORT';
      const bingxSide = side === 'Buy' ? 'BUY' : 'SELL';

      const result = await this.bingxService.placeOrder({
        symbol,
        side: bingxSide,
        positionSide,
        type: 'MARKET',
        quantity,
        reduceOnly: true,
      });
      return result;
    } catch (error: any) {
      console.error('[BingXConnectorWithCache] Error placing reduce-only order:', error.message);
      throw error;
    }
  }
}
