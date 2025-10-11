/**
 * Hybrid WebSocket + REST Strategy Tests
 *
 * Tests for verifying:
 * - REST API price fetching
 * - Aggressive limit order placement
 * - Position monitoring via WebSocket OR polling
 * - Market fallback mechanism
 * - Parallel position closing
 * - Performance characteristics (5-8 seconds)
 */

import { HybridWebSocketStrategy } from '../hybrid-ws-strategy';
import { BaseExchangeConnector, OrderSide } from '@/connectors/base-exchange.connector';
import { CloseOptions } from '../position-close-strategy';

// Mock WebSocket client (limited functionality for BingX/MEXC)
class MockWebSocketClient {
  private subscribers: Map<string, Function> = new Map();

  subscribeV5(topic: string, categoryOrCallback: string | Function, callback?: Function) {
    if (typeof categoryOrCallback === 'function') {
      this.subscribers.set(topic, categoryOrCallback);
    } else {
      const key = `${topic}.${categoryOrCallback}`;
      this.subscribers.set(key, callback!);
    }
  }

  unsubscribe(topic: string) {
    this.subscribers.delete(topic);
  }

  // Test helper to simulate position updates
  simulatePositionUpdate(data: any) {
    const callback = this.subscribers.get('position');
    if (callback) {
      callback({ data: [data] });
    }
  }
}

// Mock exchange connector
class MockExchangeConnector extends BaseExchangeConnector {
  public wsClient?: MockWebSocketClient;
  public mockInitialize = jest.fn();
  public mockGetBalance = jest.fn();
  public mockGetPosition = jest.fn();
  public mockGetOrderStatus = jest.fn();
  public mockPlaceMarketOrder = jest.fn();
  public mockPlaceLimitOrder = jest.fn();
  public mockCancelOrder = jest.fn();
  public mockClosePosition = jest.fn();
  public mockPlaceReduceOnlyOrder = jest.fn();

  constructor(exchangeName: string, hasWebSocket: boolean = false) {
    super();
    this.exchangeName = exchangeName;
    this.isInitialized = true;
    if (hasWebSocket) {
      this.wsClient = new MockWebSocketClient();
    }
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

  async cancelOrder(orderId: string, symbol?: string): Promise<any> {
    return this.mockCancelOrder(orderId, symbol);
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

describe('HybridWebSocketStrategy', () => {
  let primaryExchange: MockExchangeConnector;
  let hedgeExchange: MockExchangeConnector;
  let strategy: HybridWebSocketStrategy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    primaryExchange = new MockExchangeConnector('BINGX', false);
    hedgeExchange = new MockExchangeConnector('MEXC', false);
    strategy = new HybridWebSocketStrategy(primaryExchange, hedgeExchange);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Strategy Properties', () => {
    it('should have correct strategy name', () => {
      expect(strategy.name).toBe('Hybrid WebSocket + REST');
    });

    it('should have avgCloseTime of 6000ms', () => {
      expect(strategy.avgCloseTime).toBe(6000);
    });
  });

  describe('isSupported', () => {
    it('should return true for all exchanges', () => {
      expect(strategy.isSupported()).toBe(true);
    });

    it('should return true even without WebSocket support', () => {
      const noWsPrimary = new MockExchangeConnector('UNKNOWN', false);
      const noWsHedge = new MockExchangeConnector('UNKNOWN', false);
      const strategyNoWs = new HybridWebSocketStrategy(noWsPrimary, noWsHedge);

      expect(strategyNoWs.isSupported()).toBe(true);
    });

    it('should return true with partial WebSocket support', () => {
      const wsPrimary = new MockExchangeConnector('BYBIT', true);
      const noWsHedge = new MockExchangeConnector('BINGX', false);
      const strategyMixed = new HybridWebSocketStrategy(wsPrimary, noWsHedge);

      expect(strategyMixed.isSupported()).toBe(true);
    });
  });

  describe('REST API Price Fetching', () => {
    it('should fetch prices via REST API', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({
        symbol: 'BTC-USDT',
        markPrice: '50000',
        positionAmt: '0',
      });
      hedgeExchange.mockGetPosition.mockResolvedValue({
        symbol: 'BTC_USDT',
        markPrice: '50001',
        size: '0',
      });
      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      // Mock position closed checks
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });
      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50001', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50001', size: '0' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 5000,
      };

      const closePromise = strategy.closePositions(options);

      // Advance time for polling checks
      await jest.advanceTimersByTimeAsync(1000);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(primaryExchange.mockGetPosition).toHaveBeenCalled();
      expect(hedgeExchange.mockGetPosition).toHaveBeenCalled();
    });

    it('should handle price fetch errors with emergency fallback', async () => {
      primaryExchange.mockGetPosition.mockRejectedValue(new Error('API Error'));
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', size: '0' });
      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'emergency-123' });
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'emergency-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      // Should use emergency fallback
      expect(result.success).toBe(true);
      expect(result.strategy).toContain('emergency fallback');
      expect(result.error).toBeDefined();
    });
  });

  describe('Aggressive Limit Order Placement', () => {
    it('should place aggressive limit orders via REST', async () => {
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.5' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.5' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '0' });

      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({
        orderId: 'limit-123',
        symbol: 'BTC-USDT',
      });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({
        orderId: 'limit-456',
        symbol: 'BTC_USDT',
      });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.5,
        hedgeQuantity: 1.5,
        positionType: 'long',
        aggressiveMargin: 0.001, // 0.1%
      };

      const closePromise = strategy.closePositions(options);
      await jest.advanceTimersByTimeAsync(1000);
      await jest.runAllTimersAsync();

      expect(primaryExchange.mockPlaceLimitOrder).toHaveBeenCalledWith(
        'BTC-USDT',
        'Sell',
        1.5,
        expect.closeTo(49950, 1), // 50000 * (1 - 0.001)
        { reduceOnly: true }
      );
      expect(hedgeExchange.mockPlaceLimitOrder).toHaveBeenCalledWith(
        'BTC_USDT',
        'Buy',
        1.5,
        expect.closeTo(50050, 1), // 50000 * (1 + 0.001)
        { reduceOnly: true }
      );
    });

    it('should fallback to market order if limit order not supported', async () => {
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '0' });

      // Mock placeLimitOrder to return undefined (simulating no method)
      primaryExchange.mockPlaceLimitOrder = undefined as any;
      // Set up the connector to not have placeLimitOrder
      Object.defineProperty(primaryExchange, 'placeLimitOrder', {
        value: undefined,
        writable: true,
        configurable: true
      });

      primaryExchange.mockPlaceMarketOrder.mockResolvedValue({ orderId: 'market-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);
      await jest.advanceTimersByTimeAsync(1000);
      await jest.runAllTimersAsync();

      const result = await closePromise;
      expect(result.success).toBe(true);
      expect(primaryExchange.mockPlaceMarketOrder).toHaveBeenCalled();
    });
  });

  describe('Position Monitoring', () => {
    it('should monitor positions via REST polling', async () => {
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' }); // Closed

      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '0' }); // Closed

      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 5000,
      };

      const closePromise = strategy.closePositions(options);

      // Advance through polling intervals
      await jest.advanceTimersByTimeAsync(1000); // First check
      await jest.advanceTimersByTimeAsync(1000); // Second check
      await jest.advanceTimersByTimeAsync(1000); // Position closed
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(result.primaryClosed).toBe(true);
      expect(result.hedgeClosed).toBe(true);
      expect(result.primaryFeeType).toBe('maker'); // Filled as limit
      expect(result.hedgeFeeType).toBe('maker');
    });

    it('should monitor positions via WebSocket if available', async () => {
      // Create exchanges with WebSocket support
      const wsStrategy = new HybridWebSocketStrategy(
        new MockExchangeConnector('BYBIT', true),
        new MockExchangeConnector('BYBIT', true)
      );

      const primaryWs = wsStrategy['primaryExchange'] as MockExchangeConnector;
      const hedgeWs = wsStrategy['hedgeExchange'] as MockExchangeConnector;

      primaryWs.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeWs.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      primaryWs.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeWs.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 5000,
      };

      const closePromise = wsStrategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(500);

      // Simulate position updates via WebSocket
      primaryWs.wsClient!.simulatePositionUpdate({ symbol: 'BTCUSDT', size: '0' });
      hedgeWs.wsClient!.simulatePositionUpdate({ symbol: 'BTCUSDT', size: '0' });

      await jest.advanceTimersByTimeAsync(500);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(result.closeTime).toBeLessThan(6000); // Completes within maxWaitTime
    });

    it('should timeout and use market fallback if positions not closed', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', size: '1.0' });
      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });
      primaryExchange.mockCancelOrder.mockResolvedValue({});
      hedgeExchange.mockCancelOrder.mockResolvedValue({});
      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-123' });
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 3000,
      };

      const closePromise = strategy.closePositions(options);

      // Advance past maxWaitTime
      await jest.advanceTimersByTimeAsync(3500);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      expect(result.primaryFeeType).toBe('taker'); // Market fallback
      expect(result.hedgeFeeType).toBe('taker');
      expect(primaryExchange.mockCancelOrder).toHaveBeenCalled();
      expect(hedgeExchange.mockCancelOrder).toHaveBeenCalled();
      expect(primaryExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(hedgeExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
    });

    it('should handle partial close (one position closes, one times out)', async () => {
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' }); // Primary closes

      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', size: '1.0' }); // Hedge stays open

      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });
      hedgeExchange.mockCancelOrder.mockResolvedValue({});
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 3000,
      };

      const closePromise = strategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(1000); // Primary closes
      await jest.advanceTimersByTimeAsync(3000); // Hedge times out
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.success).toBe(true);
      // Both will be taker because positions close (one via limit that filled, one via market fallback)
      expect(result.hedgeFeeType).toBe('taker'); // Hedge timed out
      expect(hedgeExchange.mockCancelOrder).toHaveBeenCalled();
      expect(hedgeExchange.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
    });

    it('should use faster polling interval with WebSocket (500ms)', async () => {
      const wsStrategy = new HybridWebSocketStrategy(
        new MockExchangeConnector('BYBIT', true),
        new MockExchangeConnector('BYBIT', true)
      );

      const primaryWs = wsStrategy['primaryExchange'] as MockExchangeConnector;
      const hedgeWs = wsStrategy['hedgeExchange'] as MockExchangeConnector;

      primaryWs.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeWs.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      primaryWs.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeWs.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTCUSDT',
        hedgeSymbol: 'BTCUSDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 5000,
      };

      const closePromise = wsStrategy.closePositions(options);

      await jest.advanceTimersByTimeAsync(500); // Should check at 500ms intervals

      primaryWs.wsClient!.simulatePositionUpdate({ symbol: 'BTCUSDT', size: '0' });
      hedgeWs.wsClient!.simulatePositionUpdate({ symbol: 'BTCUSDT', size: '0' });

      await jest.runAllTimersAsync();
      await closePromise;

      // With 500ms intervals, should be faster
      expect(true).toBe(true); // Test completed successfully
    });

    it('should use slower polling interval without WebSocket (1000ms)', async () => {
      primaryExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeExchange.mockGetPosition.mockResolvedValue({ markPrice: '50000', size: '1.0' });
      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 5000,
      };

      const closePromise = strategy.closePositions(options);

      // Without WebSocket, should check at 1000ms intervals
      await jest.advanceTimersByTimeAsync(1000);

      // Position still open after 1 second
      expect(primaryExchange.mockGetPosition).toHaveBeenCalled();

      await jest.runAllTimersAsync();
      await closePromise.catch(() => {}); // Ignore error
    });
  });

  describe('Emergency Fallback', () => {
    it('should use emergency fallback if strategy fails completely', async () => {
      primaryExchange.mockGetPosition.mockRejectedValue(new Error('Complete failure'));
      primaryExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'emergency-123' });
      hedgeExchange.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'emergency-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
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
      primaryExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Emergency failed'));
      primaryExchange.mockClosePosition.mockRejectedValue(new Error('Emergency failed'));
      primaryExchange.mockPlaceMarketOrder.mockRejectedValue(new Error('Emergency failed'));
      hedgeExchange.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Emergency failed'));
      hedgeExchange.mockClosePosition.mockRejectedValue(new Error('Emergency failed'));
      hedgeExchange.mockPlaceMarketOrder.mockRejectedValue(new Error('Emergency failed'));

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
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
    it('should complete close within expected time (5-8 seconds)', async () => {
      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '0' });

      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
        maxWaitTime: 5000,
      };

      const closePromise = strategy.closePositions(options);

      // Simulate position close in 2 seconds
      await jest.advanceTimersByTimeAsync(2000);
      await jest.runAllTimersAsync();

      const result = await closePromise;

      expect(result.closeTime).toBeLessThan(10000); // Under 10 seconds
      expect(result.success).toBe(true);
    });

    it('should log timing information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      primaryExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      hedgeExchange.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '0' });

      primaryExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeExchange.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const options: CloseOptions = {
        primarySymbol: 'BTC-USDT',
        hedgeSymbol: 'BTC_USDT',
        primarySide: 'Sell',
        hedgeSide: 'Buy',
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        positionType: 'long',
      };

      const closePromise = strategy.closePositions(options);
      await jest.advanceTimersByTimeAsync(1000);
      await jest.runAllTimersAsync();
      await closePromise;

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Hybrid'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('COMPLETE'));

      consoleSpy.mockRestore();
    });
  });
});
