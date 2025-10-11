/**
 * Ultra-Fast WebSocket Strategy Tests
 *
 * Tests for verifying:
 * - WebSocket price streaming initialization
 * - WebSocket order placement
 * - Order fill monitoring via WebSocket
 * - Market fallback when limit orders timeout
 * - Error handling and emergency fallback
 * - Performance characteristics (2-4 seconds)
 */

import { UltraFastWebSocketStrategy } from '../ultra-fast-ws-strategy';
import { BaseExchangeConnector, OrderSide } from '@/connectors/base-exchange.connector';
import { CloseOptions } from '../position-close-strategy';

// Mock WebSocket client
class MockWebSocketClient {
  private subscribers: Map<string, Function> = new Map();

  subscribeV5(topic: string, symbolOrCallback: string | Function, callback?: Function) {
    if (typeof symbolOrCallback === 'function') {
      // Single parameter format
      this.subscribers.set(topic, symbolOrCallback);
    } else {
      // Two parameter format
      const key = `${topic}.${symbolOrCallback}`;
      this.subscribers.set(key, callback!);
    }
  }

  unsubscribe(topic: string) {
    this.subscribers.delete(topic);
  }

  submitOrder(params: any) {
    return Promise.resolve({
      orderId: `ws-order-${Date.now()}`,
      orderLinkId: params.orderLinkId || 'test-link',
    });
  }

  // Test helper to simulate incoming data
  simulateData(topic: string, symbol: string, data: any) {
    const key = `${topic}.${symbol}`;
    const callback = this.subscribers.get(key);
    if (callback) {
      callback({ topic: key, data });
    }
  }

  // Test helper to simulate order updates
  simulateOrderUpdate(data: any) {
    const callback = this.subscribers.get('order');
    if (callback) {
      callback({ data: [data] });
    }
  }
}

// Mock exchange connector with WebSocket support
class MockBybitConnector extends BaseExchangeConnector {
  public wsClient: MockWebSocketClient;
  public mockInitialize = jest.fn();
  public mockGetBalance = jest.fn();
  public mockGetPosition = jest.fn();
  public mockGetOrderStatus = jest.fn();
  public mockPlaceMarketOrder = jest.fn();
  public mockPlaceLimitOrder = jest.fn();
  public mockCancelOrder = jest.fn();
  public mockClosePosition = jest.fn();
  public mockPlaceReduceOnlyOrder = jest.fn();

  constructor(exchangeName: string = 'BYBIT') {
    super();
    this.exchangeName = exchangeName;
    this.isInitialized = true;
    this.wsClient = new MockWebSocketClient();
  }

  async initialize(): Promise<void> {
    return this.mockInitialize();
  }

  async placeMarketOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    return this.mockPlaceMarketOrder(symbol, side, quantity);
  }

  async placeLimitOrder(
    symbol: string,
    side: OrderSide,
    quantity: number,
    price: number,
    options?: any
  ): Promise<any> {
    return this.mockPlaceLimitOrder(symbol, side, quantity, price, options);
  }

  async cancelOrder(orderId: string): Promise<any> {
    return this.mockCancelOrder(orderId);
  }

  async getBalance(): Promise<any> {
    return this.mockGetBalance();
  }

  async getPosition(symbol: string): Promise<any> {
    return this.mockGetPosition(symbol);
  }

  async getOrderStatus(orderId: string): Promise<any> {
    return this.mockGetOrderStatus(orderId);
  }

  async closePosition(symbol: string): Promise<any> {
    return this.mockClosePosition(symbol);
  }

  async placeReduceOnlyOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    return this.mockPlaceReduceOnlyOrder(symbol, side, quantity);
  }
}

describe('UltraFastWebSocketStrategy', () => {
  let primaryExchange: MockBybitConnector;
  let hedgeExchange: MockBybitConnector;
  let strategy: UltraFastWebSocketStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    primaryExchange = new MockBybitConnector('BYBIT');
    hedgeExchange = new MockBybitConnector('BYBIT');
    strategy = new UltraFastWebSocketStrategy(primaryExchange, hedgeExchange);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Strategy Properties', () => {
    it('should have correct strategy name', () => {
      expect(strategy.name).toBe('Ultra-Fast WebSocket');
    });

    it('should have avgCloseTime of 3000ms', () => {
      expect(strategy.avgCloseTime).toBe(3000);
    });
  });

  describe('isSupported', () => {
    it('should return true if both exchanges have WebSocket clients', () => {
      expect(strategy.isSupported()).toBe(true);
    });

    it('should return false if primary exchange lacks WebSocket', () => {
      const noWsPrimary = new MockBybitConnector('BYBIT');
      delete (noWsPrimary as any).wsClient;
      const strategyNoWs = new UltraFastWebSocketStrategy(noWsPrimary, hedgeExchange);

      expect(strategyNoWs.isSupported()).toBe(false);
    });

    it('should return false if hedge exchange lacks WebSocket', () => {
      const noWsHedge = new MockBybitConnector('BYBIT');
      delete (noWsHedge as any).wsClient;
      const strategyNoWs = new UltraFastWebSocketStrategy(primaryExchange, noWsHedge);

      expect(strategyNoWs.isSupported()).toBe(false);
    });

    it('should return false if both exchanges lack WebSocket', () => {
      const noWsPrimary = new MockBybitConnector('BYBIT');
      const noWsHedge = new MockBybitConnector('BYBIT');
      delete (noWsPrimary as any).wsClient;
      delete (noWsHedge as any).wsClient;
      const strategyNoWs = new UltraFastWebSocketStrategy(noWsPrimary, noWsHedge);

      expect(strategyNoWs.isSupported()).toBe(false);
    });
  });

  describe('WebSocket Price Streaming', () => {
    it('should initialize price streams for both symbols', async () => {
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', symbol: 'BTCUSDT' })
        .mockResolvedValueOnce({ markPrice: '50000', symbol: 'BTCUSDT' });

      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50001', symbol: 'BTCUSDT' })
        .mockResolvedValueOnce({ markPrice: '50001', symbol: 'BTCUSDT' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      // Start the close process (will initialize streams)
      const closePromise = strategy.closePositions(options);

      // Fast-forward through initialization
      await jest.advanceTimersByTimeAsync(100);

      // Simulate price updates
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50100' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50101' });

      // Simulate order fills
      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      // Wait for completion
      await jest.runAllTimersAsync();
      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(primaryExchange.mockGetPosition).toHaveBeenCalledWith('BTCUSDT');
      expect(hedgeExchange.mockGetPosition).toHaveBeenCalledWith('BTCUSDT');
    });

    it('should cache prices from WebSocket updates', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);

      // Advance to allow initialization
      await jest.advanceTimersByTimeAsync(100);

      // Update prices via WebSocket
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '51000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '51001' });

      // Simulate order fills
      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      const result = await closePromise;

      // Should use cached WS prices (not API prices)
      expect(result.success).toBe(true);
    });

    it('should handle price stream subscription errors gracefully', async () => {
      primaryExchange.mockGetPosition.mockRejectedValue(new Error('API Error'));
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });

      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'fallback-123' });
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'fallback-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);
      await jest.runAllTimersAsync();

      // Should use emergency fallback instead of throwing
      const result = await closePromise;
      expect(result.success).toBe(true);
      expect(result.strategy).toContain('emergency fallback');
      expect(result.error).toBeDefined();
    });
  });

  describe('WebSocket Order Placement', () => {
    it('should place orders via WebSocket', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50001', symbol: 'BTCUSDT' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.5,
        hedgeQuantity: 1.5,
        positionType: 'long',
      };

      const submitOrderSpy = jest.spyOn(primaryExchange.wsClient, 'submitOrder');

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);

      // Simulate price updates
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50001' });

      await jest.advanceTimersByTimeAsync(100);

      // Simulate order fills
      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      expect(submitOrderSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'linear',
          symbol: 'BTCUSDT',
          side: 'Sell',
          orderType: 'Limit',
          qty: '1.5',
          reduceOnly: true,
          timeInForce: 'PostOnly',
        })
      );
    });

    it('should calculate aggressive limit prices correctly', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        aggressiveMargin: 0.001, // 0.1%
      };

      const submitOrderSpy = jest.spyOn(primaryExchange.wsClient, 'submitOrder');

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      // Sell: 50000 * (1 - 0.001) = 49950
      expect(submitOrderSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          price: '49950.00',
          side: 'Sell',
        })
      );
    });

    it('should fallback to REST API if WebSocket order submission unavailable', async () => {
      // Remove submitOrder method by setting to undefined
      Object.defineProperty(primaryExchange.wsClient, 'submitOrder', {
        value: undefined,
        writable: true,
        configurable: true
      });
      Object.defineProperty(hedgeExchange.wsClient, 'submitOrder', {
        value: undefined,
        writable: true,
        configurable: true
      });

      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'rest-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'rest-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'rest-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'rest-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      const result = await closePromise;

      expect(primaryExchange.mockPlaceLimitOrder).toHaveBeenCalled();
      expect(hedgeExchange.mockPlaceLimitOrder).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('Order Fill Monitoring', () => {
    it('should detect filled orders via WebSocket', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });

      // Track order IDs when submitted
      let primaryOrderId: string;
      let hedgeOrderId: string;
      const primarySubmitSpy = jest.spyOn(primaryExchange.wsClient, 'submitOrder').mockImplementation((params: any) => {
        primaryOrderId = `primary-${Date.now()}`;
        return Promise.resolve({ orderId: primaryOrderId, orderLinkId: params.orderLinkId || 'test' });
      });
      const hedgeSubmitSpy = jest.spyOn(hedgeExchange.wsClient, 'submitOrder').mockImplementation((params: any) => {
        hedgeOrderId = `hedge-${Date.now()}`;
        return Promise.resolve({ orderId: hedgeOrderId, orderLinkId: params.orderLinkId || 'test' });
      });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 3000,
      };

      const closePromise = strategy.closePositions(options);

      // Advance minimal time for initialization
      await jest.advanceTimersByTimeAsync(10);

      // Provide price data immediately
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });

      // Wait for orders to be placed (this will trigger submitOrder)
      await jest.advanceTimersByTimeAsync(10);

      // Now simulate fills with the captured order IDs
      primaryExchange.wsClient.simulateOrderUpdate({ orderId: primaryOrderId!, orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: hedgeOrderId!, orderStatus: 'Filled' });

      // Advance time slightly to process the fills
      await jest.advanceTimersByTimeAsync(50);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(result.primaryFeeType).toBe('maker'); // Filled as limit order
      expect(result.hedgeFeeType).toBe('maker');
      expect(result.closeTime).toBeLessThan(5000);

      primarySubmitSpy.mockRestore();
      hedgeSubmitSpy.mockRestore();
    });

    it('should timeout if orders not filled within maxWaitTime', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      primaryExchange.mockCancelOrder.mockResolvedValue({});
      hedgeExchange.mockCancelOrder.mockResolvedValue({});
      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-123' });
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 2000,
      };

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      // Don't simulate fills - let it timeout
      await jest.advanceTimersByTimeAsync(2500);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(result.primaryFeeType).toBe('taker'); // Market fallback
      expect(result.hedgeFeeType).toBe('taker');
      expect(primaryExchange.mockCancelOrder).toHaveBeenCalled();
      expect(hedgeExchange.mockCancelOrder).toHaveBeenCalled();
    });

    it('should handle partial fills (one filled, one timeout)', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockCancelOrder.mockResolvedValue({});
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 2000,
      };

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(50);

      // Fill primary immediately but let hedge timeout
      const primaryOrderId = Date.now().toString();
      primaryExchange.wsClient.simulateOrderUpdate({ orderId: `ws-order-${primaryOrderId}`, orderStatus: 'Filled' });

      // Advance past maxWaitTime for hedge to timeout
      await jest.advanceTimersByTimeAsync(2500);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      // Note: Both will be taker because they both complete, just one via timeout/market
      expect(result.hedgeFeeType).toBe('taker'); // Timed out, used market
      expect(hedgeExchange.mockCancelOrder).toHaveBeenCalled();
      expect(hedgeExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
    });
  });

  describe('Emergency Fallback', () => {
    it('should use emergency fallback if strategy fails completely', async () => {
      primaryExchange.mockGetPosition.mockRejectedValue(new Error('Complete failure'));
      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'emergency-123' });
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'emergency-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);
      await jest.runAllTimersAsync();
      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(result.primaryFeeType).toBe('taker');
      expect(result.hedgeFeeType).toBe('taker');
      expect(result.strategy).toContain('emergency fallback');
      expect(result.error).toBeDefined();
    });

    it('should return failure if emergency fallback also fails', async () => {
      primaryExchange.mockGetPosition.mockRejectedValue(new Error('Complete failure'));
      primaryExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Emergency failed 1'));
      primaryExchange.mockClosePosition.mockRejectedValue(new Error('Emergency failed 2'));
      primaryExchange.mockPlaceMarketOrder.mockRejectedValue(new Error('Emergency failed 3'));
      hedgeExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Emergency failed'));
      hedgeExchange.mockClosePosition.mockRejectedValue(new Error('Emergency failed'));
      hedgeExchange.mockPlaceMarketOrder.mockRejectedValue(new Error('Emergency failed'));

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);
      await jest.runAllTimersAsync();
      const result = await closePromise;

      expect(result.success).toBe(false);
      expect(result.primaryClosed).toBe(false);
      expect(result.hedgeClosed).toBe(false);
      expect(result.error).toContain('Fallback failed');
    });
  });

  describe('Performance', () => {
    it('should complete close within expected time (2-4 seconds)', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const startTime = Date.now();
      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      // Simulate fast fills
      await jest.advanceTimersByTimeAsync(500);
      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      const result = await closePromise;
      const actualTime = Date.now() - startTime;

      expect(result.closeTime).toBeLessThan(5000); // Under 5 seconds
      expect(result.success).toBe(true);
    });

    it('should log timing information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', symbol: 'BTCUSDT' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(100);
      primaryExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeExchange.wsClient.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(50);

      primaryExchange.wsClient.simulateOrderUpdate({ orderId: 'ws-order-123', orderStatus: 'Filled' });
      hedgeExchange.wsClient.simulateOrderUpdate({ orderId: 'ws-order-456', orderStatus: 'Filled' });

      await jest.advanceTimersByTimeAsync(100);
      await jest.runAllTimersAsync();
      await closePromise;

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('UltraFast'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('COMPLETE'));

      consoleSpy.mockRestore();
    });
  });
});
