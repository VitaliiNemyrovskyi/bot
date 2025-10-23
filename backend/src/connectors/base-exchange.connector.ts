/**
 * Base Exchange Connector Interface
 *
 * Defines the common interface that all exchange connectors must implement
 */

export type OrderSide = 'Buy' | 'Sell';
export type OrderType = 'Market' | 'Limit';

export abstract class BaseExchangeConnector {
  protected isInitialized: boolean = false;
  public exchangeName: string = 'BASE';

  /**
   * Initialize the exchange connection
   */
  abstract initialize(): Promise<void>;

  /**
   * Place a market order
   */
  abstract placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any>;

  /**
   * Place a limit order
   */
  abstract placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): Promise<any>;

  /**
   * Cancel an order
   */
  abstract cancelOrder(orderId: string, symbol: string): Promise<any>;

  /**
   * Get account balance
   */
  abstract getBalance(): Promise<any>;

  /**
   * Get position for a symbol
   */
  abstract getPosition(symbol: string): Promise<any>;

  /**
   * Get order status
   */
  abstract getOrderStatus(orderId: string): Promise<any>;

  /**
   * Close position
   */
  abstract closePosition(symbol: string): Promise<any>;

  /**
   * Place a reduce-only market order (for closing positions)
   */
  abstract placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any>;

  /**
   * Set take-profit and stop-loss for an existing position
   * @param symbol - Trading pair symbol
   * @param side - Position side (Buy for long, Sell for short)
   * @param takeProfit - Take profit price (optional)
   * @param stopLoss - Stop loss price (optional)
   * @returns Order IDs or confirmation
   */
  abstract setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<{
    success: boolean;
    takeProfitOrderId?: string;
    stopLossOrderId?: string;
    message?: string;
  }>;

  /**
   * Get symbol trading limits (min/max order size, price precision, etc.)
   * @param symbol - Trading pair symbol (e.g., 'BTC/USDT')
   * @returns Trading limits for the symbol
   */
  abstract getSymbolLimits(symbol: string): Promise<{
    minOrderSize?: number;      // Minimum order size in base currency
    minNotional?: number;        // Minimum order value in quote currency
    maxOrderSize?: number;       // Maximum order size in base currency
    amountPrecision?: number;    // Decimal places for amount
    pricePrecision?: number;     // Decimal places for price
  } | null>;

  /**
   * Check if connector is initialized
   */
  isConnected(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current market price for a symbol (REST API)
   * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
   * @returns Current market price
   */
  abstract getMarketPrice(symbol: string): Promise<number>;

  /**
   * Subscribe to real-time price updates via WebSocket
   * @param symbol - Trading pair symbol (e.g., "BTCUSDT")
   * @param callback - Callback function that receives price updates
   * @returns Unsubscribe function to stop receiving updates
   */
  abstract subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void>;
}
