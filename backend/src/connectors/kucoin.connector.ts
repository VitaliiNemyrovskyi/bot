import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';
import { KuCoinService } from '@/lib/kucoin';
import { ContractSpecification } from '@/lib/contract-calculator';

/**
 * KuCoin Exchange Connector
 *
 * Implements the BaseExchangeConnector interface for KuCoin spot exchange
 */
export class KuCoinConnector extends BaseExchangeConnector {
  private kucoinService: KuCoinService;
  private apiKey: string;
  private apiSecret: string;
  private passphrase: string;
  private userId?: string;
  private credentialId?: string;

  constructor(
    apiKey: string,
    apiSecret: string,
    passphrase: string,
    userId?: string,
    credentialId?: string
  ) {
    super();
    this.exchangeName = 'KUCOIN';
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.passphrase = passphrase;
    this.userId = userId;
    this.credentialId = credentialId;

    this.kucoinService = new KuCoinService({
      apiKey,
      apiSecret,
      passphrase,
      enableRateLimit: true,
      userId,
      credentialId,
    });
  }

  /**
   * Initialize KuCoin connection
   */
  async initialize(): Promise<void> {
    console.log('[KuCoinConnector] Initializing KuCoin connector...');

    try {
      // Test connection by fetching account info
      await this.kucoinService.getAccountInfo();
      this.isInitialized = true;
      console.log('[KuCoinConnector] KuCoin connector initialized successfully');
    } catch (error: any) {
      console.error('[KuCoinConnector] Failed to initialize:', error.message);
      throw new Error(`Failed to initialize KuCoin connector: ${error.message}`);
    }
  }

  /**
   * Normalize symbol format (BTC/USDT -> BTC-USDT for KuCoin)
   */
  private normalizeSymbol(symbol: string): string {
    return symbol.replace('/', '-');
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[KuCoinConnector] Placing market ${side} order:`, {
      symbol,
      quantity,
    });

    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      const result = await this.kucoinService.placeOrder({
        symbol: this.normalizeSymbol(symbol),
        side: side === 'Buy' ? 'buy' : 'sell',
        type: 'market',
        size: quantity.toString(),
      });

      console.log('[KuCoinConnector] Market order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[KuCoinConnector] Failed to place market order:', error.message);
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
    console.log(`[KuCoinConnector] Placing limit ${side} order:`, {
      symbol,
      quantity,
      price,
    });

    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      const result = await this.kucoinService.placeOrder({
        symbol: this.normalizeSymbol(symbol),
        side: side === 'Buy' ? 'buy' : 'sell',
        type: 'limit',
        size: quantity.toString(),
        price: price.toString(),
      });

      console.log('[KuCoinConnector] Limit order placed:', result);
      return result;
    } catch (error: any) {
      console.error('[KuCoinConnector] Failed to place limit order:', error.message);
      throw error;
    }
  }

  /**
   * Get current ticker price
   */
  async getTickerPrice(symbol: string): Promise<number> {
    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      const ticker = await this.kucoinService.getTicker(symbol);
      return parseFloat(ticker.price);
    } catch (error: any) {
      console.error(`[KuCoinConnector] Failed to get ticker for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      return await this.kucoinService.getSpotBalance();
    } catch (error: any) {
      console.error('[KuCoinConnector] Failed to get balance:', error.message);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      const result = await this.kucoinService.cancelOrder(orderId);
      console.log('[KuCoinConnector] Order cancelled:', orderId);
      return result;
    } catch (error: any) {
      console.error('[KuCoinConnector] Failed to cancel order:', error.message);
      throw error;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      return await this.kucoinService.getOrder(orderId);
    } catch (error: any) {
      console.error('[KuCoinConnector] Failed to get order status:', error.message);
      throw error;
    }
  }

  /**
   * Set leverage (not supported for spot trading)
   */
  async setLeverage(symbol: string, leverage: number): Promise<void> {
    console.warn('[KuCoinConnector] Leverage is not supported for spot trading');
  }

  /**
   * Get leverage (not supported for spot trading)
   */
  async getLeverage(symbol: string): Promise<number> {
    return 1; // Spot trading always has 1x leverage
  }

  /**
   * Get contract specification
   */
  async getContractSpecification(symbol: string): Promise<ContractSpecification> {
    if (!this.isInitialized) {
      throw new Error('KuCoin connector not initialized');
    }

    try {
      const symbolInfo = await this.kucoinService.getSymbolInfo(symbol);

      return {
        symbol: symbol,
        baseAsset: symbolInfo.baseCurrency,
        quoteAsset: symbolInfo.quoteCurrency,
        pricePrecision: parseInt(symbolInfo.priceIncrement.split('.')[1]?.length || '2'),
        quantityPrecision: parseInt(symbolInfo.baseIncrement.split('.')[1]?.length || '2'),
        minQuantity: parseFloat(symbolInfo.baseMinSize),
        maxQuantity: parseFloat(symbolInfo.baseMaxSize || '999999'),
        minNotional: parseFloat(symbolInfo.quoteMinSize || '0'),
        contractSize: 1, // Spot trading
        tickSize: parseFloat(symbolInfo.priceIncrement),
        stepSize: parseFloat(symbolInfo.baseIncrement),
      };
    } catch (error: any) {
      console.error(`[KuCoinConnector] Failed to get contract spec for ${symbol}:`, error.message);
      throw error;
    }
  }

  /**
   * Get positions (spot trading doesn't have positions like futures)
   * Returns empty array as spot trading uses balances instead of positions
   */
  async getPositions(symbol?: string): Promise<any[]> {
    console.warn('[KuCoinConnector] Spot trading does not support positions. Use getBalance() instead.');
    // For spot trading, there are no short/long positions
    // Return empty array to indicate no positions
    return [];
  }

  /**
   * Get position for a specific symbol (not applicable for spot trading)
   */
  async getPosition(symbol: string): Promise<any> {
    console.warn('[KuCoinConnector] Spot trading does not support positions');
    return null;
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    console.log('[KuCoinConnector] Closing KuCoin connector...');
    this.isInitialized = false;
  }
}
