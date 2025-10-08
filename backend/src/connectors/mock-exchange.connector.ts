import { BaseExchangeConnector, OrderSide, OrderType } from './base-exchange.connector';

/**
 * Mock Exchange Connector for Testing and Development
 *
 * Simulates a real exchange with realistic delays and responses
 * Useful for testing funding arbitrage strategies without real money
 */
export class MockExchangeConnector extends BaseExchangeConnector {
  private orders: Map<string, any> = new Map();
  private positions: Map<string, any> = new Map();
  private orderIdCounter = 1;

  constructor() {
    super();
    this.exchangeName = 'MOCK';
  }

  /**
   * Initialize mock exchange connection
   */
  async initialize(): Promise<void> {
    console.log('[MockExchange] Initializing mock exchange connector...');
    await this.simulateDelay(500); // Simulate connection time
    this.isInitialized = true;
    console.log('[MockExchange] Mock exchange initialized successfully');
  }

  /**
   * Place a market order
   */
  async placeMarketOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[MockExchange] Placing market ${side} order:`, {
      symbol,
      quantity,
    });

    await this.simulateDelay(200); // Simulate order processing

    const orderId = `MOCK_${this.orderIdCounter++}`;
    const mockPrice = this.getMockPrice(symbol);
    const timestamp = Date.now();

    const order = {
      orderId,
      symbol,
      side,
      orderType: 'Market' as OrderType,
      quantity,
      price: mockPrice,
      filledQuantity: quantity,
      status: 'Filled',
      timestamp,
      exchange: 'MOCK',
    };

    this.orders.set(orderId, order);

    // Update position
    this.updatePosition(symbol, side, quantity, mockPrice);

    console.log(`[MockExchange] Order filled:`, order);
    return order;
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
    console.log(`[MockExchange] Placing limit ${side} order:`, {
      symbol,
      quantity,
      price,
    });

    await this.simulateDelay(200);

    const orderId = `MOCK_${this.orderIdCounter++}`;
    const timestamp = Date.now();

    const order = {
      orderId,
      symbol,
      side,
      orderType: 'Limit' as OrderType,
      quantity,
      price,
      filledQuantity: 0,
      status: 'New',
      timestamp,
      exchange: 'MOCK',
    };

    this.orders.set(orderId, order);

    // Simulate immediate fill for testing
    setTimeout(() => {
      if (this.orders.has(orderId)) {
        const updatedOrder = {
          ...order,
          filledQuantity: quantity,
          status: 'Filled',
        };
        this.orders.set(orderId, updatedOrder);
        this.updatePosition(symbol, side, quantity, price);
        console.log(`[MockExchange] Limit order filled:`, updatedOrder);
      }
    }, 1000);

    console.log(`[MockExchange] Limit order placed:`, order);
    return order;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, symbol: string): Promise<any> {
    console.log(`[MockExchange] Canceling order:`, { orderId, symbol });

    await this.simulateDelay(150);

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status === 'Filled') {
      throw new Error(`Cannot cancel filled order ${orderId}`);
    }

    const canceledOrder = {
      ...order,
      status: 'Canceled',
    };

    this.orders.set(orderId, canceledOrder);
    console.log(`[MockExchange] Order canceled:`, canceledOrder);
    return canceledOrder;
  }

  /**
   * Get account balance
   */
  async getBalance(): Promise<any> {
    await this.simulateDelay(100);

    return {
      totalEquity: 10000,
      availableBalance: 8500,
      usedMargin: 1500,
      currency: 'USDT',
      positions: Array.from(this.positions.values()),
    };
  }

  /**
   * Get current position for a symbol
   */
  async getPosition(symbol: string): Promise<any> {
    await this.simulateDelay(100);

    const position = this.positions.get(symbol);
    if (!position) {
      return {
        symbol,
        side: 'None',
        size: 0,
        entryPrice: 0,
        markPrice: this.getMockPrice(symbol),
        unrealizedPnl: 0,
      };
    }

    const currentPrice = this.getMockPrice(symbol);
    const unrealizedPnl = this.calculateUnrealizedPnl(
      position,
      currentPrice
    );

    return {
      ...position,
      markPrice: currentPrice,
      unrealizedPnl,
    };
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    await this.simulateDelay(100);

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    return order;
  }

  /**
   * Close position
   */
  async closePosition(symbol: string): Promise<any> {
    console.log(`[MockExchange] Closing position for ${symbol}`);

    const position = this.positions.get(symbol);
    if (!position || position.size === 0) {
      throw new Error(`No open position for ${symbol}`);
    }

    // Close position with opposite side
    const closeSide: OrderSide = position.side === 'Buy' ? 'Sell' : 'Buy';
    const closeOrder = await this.placeMarketOrder(
      symbol,
      closeSide,
      Math.abs(position.size)
    );

    console.log(`[MockExchange] Position closed:`, closeOrder);
    return closeOrder;
  }

  /**
   * Place a reduce-only market order
   */
  async placeReduceOnlyOrder(
    symbol: string,
    side: OrderSide,
    quantity: number
  ): Promise<any> {
    console.log(`[MockExchange] Placing reduce-only market ${side} order:`, {
      symbol,
      quantity,
    });

    // For mock exchange, reduce-only is the same as regular market order
    // Just verify position exists and matches
    const position = this.positions.get(symbol);
    if (!position || position.size === 0) {
      throw new Error(`No open position for ${symbol} to reduce`);
    }

    // Verify side is correct for closing
    if ((position.side === 'Buy' && side === 'Buy') || (position.side === 'Sell' && side === 'Sell')) {
      throw new Error(`Invalid reduce-only side: ${side} for ${position.side} position`);
    }

    return await this.placeMarketOrder(symbol, side, quantity);
  }

  /**
   * Update position based on order
   */
  private updatePosition(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number
  ): void {
    let position = this.positions.get(symbol);

    if (!position) {
      position = {
        symbol,
        side,
        size: side === 'Buy' ? quantity : -quantity,
        entryPrice: price,
        leverage: 1,
      };
    } else {
      // Update existing position
      const currentValue = position.size * position.entryPrice;
      const newValue = (side === 'Buy' ? quantity : -quantity) * price;
      const totalSize = position.size + (side === 'Buy' ? quantity : -quantity);

      if (totalSize === 0) {
        // Position closed
        this.positions.delete(symbol);
        return;
      }

      position.entryPrice = (currentValue + newValue) / totalSize;
      position.size = totalSize;
      position.side = totalSize > 0 ? 'Buy' : 'Sell';
    }

    this.positions.set(symbol, position);
  }

  /**
   * Calculate unrealized PnL
   */
  private calculateUnrealizedPnl(position: any, currentPrice: number): number {
    const priceDiff = currentPrice - position.entryPrice;
    return position.size * priceDiff;
  }

  /**
   * Get mock price for a symbol
   */
  private getMockPrice(symbol: string): number {
    // Generate realistic mock prices based on symbol
    const basePrices: { [key: string]: number } = {
      BTCUSDT: 65000,
      ETHUSDT: 3200,
      SOLUSDT: 145,
      BNBUSDT: 580,
      XRPUSDT: 0.52,
    };

    const basePrice = basePrices[symbol] || 100;
    // Add small random variation (±0.5%)
    const variation = basePrice * (Math.random() - 0.5) * 0.01;
    return parseFloat((basePrice + variation).toFixed(2));
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get all orders
   */
  async getAllOrders(): Promise<any[]> {
    await this.simulateDelay(100);
    return Array.from(this.orders.values());
  }

  /**
   * Get all positions
   */
  async getAllPositions(): Promise<any[]> {
    await this.simulateDelay(100);
    return Array.from(this.positions.values());
  }

  /**
   * Reset mock exchange (for testing)
   */
  reset(): void {
    this.orders.clear();
    this.positions.clear();
    this.orderIdCounter = 1;
    console.log('[MockExchange] Exchange reset');
  }
}
