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
   * Check if connector is initialized
   */
  isConnected(): boolean {
    return this.isInitialized;
  }
}
