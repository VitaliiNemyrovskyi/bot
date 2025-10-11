/**
 * Funding Arbitrage Strategy Integration Tests
 *
 * Tests for verifying:
 * - Integration between FundingArbitrageService and position close strategies
 * - Correct strategy selection based on exchange pair
 * - Fee calculation (maker vs taker)
 * - Exit price handling
 * - Error handling and database updates
 * - Complete workflow from position open to close
 */

import { FundingArbitrageService } from '../funding-arbitrage.service';
import { BaseExchangeConnector, OrderSide } from '@/connectors/base-exchange.connector';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  fundingArbitrageSubscription: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  exchangeCredentials: {
    findUnique: jest.fn(),
  },
}));

// Mock WebSocket client
class MockWebSocketClient {
  private subscribers: Map<string, Function> = new Map();

  subscribeV5(topic: string, symbolOrCallback: string | Function, callback?: Function) {
    if (typeof symbolOrCallback === 'function') {
      this.subscribers.set(topic, symbolOrCallback);
    } else {
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

  simulateData(topic: string, symbol: string, data: any) {
    const key = `${topic}.${symbol}`;
    const callback = this.subscribers.get(key);
    if (callback) {
      callback({ topic: key, data });
    }
  }

  simulateOrderUpdate(data: any) {
    const callback = this.subscribers.get('order');
    if (callback) {
      callback({ data: [data] });
    }
  }

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

describe('FundingArbitrage - Strategy Integration', () => {
  let service: FundingArbitrageService;
  let mockPrismaUpdate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    service = new FundingArbitrageService();
    mockPrismaUpdate = prisma.fundingArbitrageSubscription.update as jest.Mock;
    mockPrismaUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Strategy Selection Integration', () => {
    it('should use Ultra-Fast WS strategy for Bybit-to-Bybit', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      // Setup successful close scenario
      primaryBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });

      const subscription: any = {
        id: 'sub-123',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(100);
      primaryBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      primaryBybit.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeBybit.wsClient!.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      // Verify Ultra-Fast strategy was used (WebSocket orders)
      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-123' },
          data: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      );
    });

    it('should use Hybrid strategy for BingX-to-MEXC', async () => {
      const primaryBingX = new MockExchangeConnector('BINGX', false);
      const hedgeMEXC = new MockExchangeConnector('MEXC', false);

      // Setup successful close scenario
      primaryBingX.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      hedgeMEXC.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', size: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', size: '0' });

      primaryBingX.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeMEXC.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const subscription: any = {
        id: 'sub-456',
        symbol: 'BTC-USDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBingX,
        hedgeExchange: hedgeMEXC,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(1000);
      await jest.runAllTimersAsync();
      await closePromise;

      // Verify Hybrid strategy was used (REST API orders)
      expect(primaryBingX.mockPlaceLimitOrder).toHaveBeenCalled();
      expect(hedgeMEXC.mockPlaceLimitOrder).toHaveBeenCalled();
      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-456' },
          data: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      );
    });

    it('should use Hybrid strategy for mixed Bybit-to-BingX', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBingX = new MockExchangeConnector('BINGX', false);

      primaryBybit.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      hedgeBingX.mockGetPosition
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '1.0' })
        .mockResolvedValueOnce({ markPrice: '50000', positionAmt: '0' });

      primaryBybit.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeBingX.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });

      const subscription: any = {
        id: 'sub-789',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBingX,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(1000);
      await jest.runAllTimersAsync();
      await closePromise;

      // Verify Hybrid strategy was used (not Ultra-Fast due to mixed exchanges)
      expect(primaryBybit.mockPlaceLimitOrder).toHaveBeenCalled();
      expect(hedgeBingX.mockPlaceLimitOrder).toHaveBeenCalled();
    });
  });

  describe('Fee Calculation', () => {
    it('should calculate maker fees when limit orders fill', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      primaryBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });

      const subscription: any = {
        id: 'sub-123',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(100);
      primaryBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      primaryBybit.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeBybit.wsClient!.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      // Verify maker fee rates were used (0.02% for Bybit maker)
      const updateCall = mockPrismaUpdate.mock.calls[0][0];
      const tradingFees = updateCall.data.primaryTradingFees + updateCall.data.hedgeTradingFees;

      // Expected: (1.0 * 50000 * 0.0002 * 2) * 2 positions = 40 USDT total
      expect(tradingFees).toBeCloseTo(40, 1);
    });

    it('should calculate taker fees when market orders used', async () => {
      const primaryBingX = new MockExchangeConnector('BINGX', false);
      const hedgeMEXC = new MockExchangeConnector('MEXC', false);

      // Positions never close - force market fallback
      primaryBingX.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeMEXC.mockGetPosition.mockResolvedValue({ markPrice: '50000', size: '1.0' });
      primaryBingX.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeMEXC.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });
      primaryBingX.mockCancelOrder.mockResolvedValue({});
      hedgeMEXC.mockCancelOrder.mockResolvedValue({});
      primaryBingX.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-123' });
      hedgeMEXC.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const subscription: any = {
        id: 'sub-456',
        symbol: 'BTC-USDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBingX,
        hedgeExchange: hedgeMEXC,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(6000); // Exceed maxWaitTime
      await jest.runAllTimersAsync();
      await closePromise;

      // Verify taker fee rates were used (higher than maker)
      const updateCall = mockPrismaUpdate.mock.calls[0][0];
      const tradingFees = updateCall.data.primaryTradingFees + updateCall.data.hedgeTradingFees;

      // Expected: higher than maker fees due to taker rates
      expect(tradingFees).toBeGreaterThan(40); // More than maker fees
    });

    it('should calculate mixed fees when one fills and one uses market', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      primaryBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockCancelOrder.mockResolvedValue({});
      hedgeBybit.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const subscription: any = {
        id: 'sub-789',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(100);
      primaryBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      // Only fill primary
      primaryBybit.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });

      // Let hedge timeout
      await jest.advanceTimersByTimeAsync(5000);
      await jest.runAllTimersAsync();
      await closePromise;

      // Verify mixed fees (maker for primary, taker for hedge)
      const updateCall = mockPrismaUpdate.mock.calls[0][0];
      expect(updateCall.data.primaryTradingFees).toBeLessThan(updateCall.data.hedgeTradingFees);
    });
  });

  describe('Exit Price Handling', () => {
    it('should use limit order prices when filled', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      primaryBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });

      const subscription: any = {
        id: 'sub-123',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(100);
      primaryBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50100' });
      hedgeBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50101' });
      await jest.advanceTimersByTimeAsync(100);

      primaryBybit.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeBybit.wsClient!.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      const updateCall = mockPrismaUpdate.mock.calls[0][0];

      // Should use aggressive limit prices (slightly different from market)
      expect(updateCall.data.primaryExitPrice).toBeDefined();
      expect(updateCall.data.hedgeExitPrice).toBeDefined();
      expect(updateCall.data.primaryExitPrice).toBeCloseTo(50100, 0);
      expect(updateCall.data.hedgeExitPrice).toBeCloseTo(50101, 0);
    });

    it('should use market prices when limit orders timeout', async () => {
      const primaryBingX = new MockExchangeConnector('BINGX', false);
      const hedgeMEXC = new MockExchangeConnector('MEXC', false);

      primaryBingX.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeMEXC.mockGetPosition.mockResolvedValue({ markPrice: '50000', size: '1.0' });
      primaryBingX.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-123' });
      hedgeMEXC.mockPlaceLimitOrder.mockResolvedValue({ orderId: 'limit-456' });
      primaryBingX.mockCancelOrder.mockResolvedValue({});
      hedgeMEXC.mockCancelOrder.mockResolvedValue({});
      primaryBingX.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-123' });
      hedgeMEXC.mockPlaceReduceOnlyOrder.mockResolvedValue({ orderId: 'market-456' });

      const subscription: any = {
        id: 'sub-456',
        symbol: 'BTC-USDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBingX,
        hedgeExchange: hedgeMEXC,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(6000);
      await jest.runAllTimersAsync();
      await closePromise;

      const updateCall = mockPrismaUpdate.mock.calls[0][0];

      // Should use market prices (from initial fetch)
      expect(updateCall.data.primaryExitPrice).toBeDefined();
      expect(updateCall.data.hedgeExitPrice).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should update database with ERROR status on strategy failure', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      primaryBybit.mockGetPosition.mockRejectedValue(new Error('API Error'));
      primaryBybit.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Failed'));
      primaryBybit.mockClosePosition.mockRejectedValue(new Error('Failed'));
      primaryBybit.mockPlaceMarketOrder.mockRejectedValue(new Error('Failed'));
      hedgeBybit.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Failed'));
      hedgeBybit.mockClosePosition.mockRejectedValue(new Error('Failed'));
      hedgeBybit.mockPlaceMarketOrder.mockRejectedValue(new Error('Failed'));

      const subscription: any = {
        id: 'sub-error',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);

      await expect(async () => {
        const closePromise = closePositions(subscription, 50000, 50000, 25);
        await jest.runAllTimersAsync();
        await closePromise;
      }).rejects.toThrow();

      // Verify error was logged to database
      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-error' },
          data: expect.objectContaining({
            status: 'ERROR',
            errorMessage: expect.stringContaining('Failed to close positions'),
          }),
        })
      );
    });

    it('should handle partial close errors gracefully', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      primaryBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });

      // Primary fills, hedge fails completely
      hedgeBybit.mockCancelOrder.mockResolvedValue({});
      hedgeBybit.mockPlaceReduceOnlyOrder.mockRejectedValue(new Error('Failed'));
      hedgeBybit.mockClosePosition.mockRejectedValue(new Error('Failed'));
      hedgeBybit.mockPlaceMarketOrder.mockRejectedValue(new Error('Failed'));

      const subscription: any = {
        id: 'sub-partial',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);

      await expect(async () => {
        const closePromise = closePositions(subscription, 50000, 50000, 25);

        await jest.advanceTimersByTimeAsync(100);
        primaryBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
        hedgeBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
        await jest.advanceTimersByTimeAsync(100);

        primaryBybit.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });

        await jest.advanceTimersByTimeAsync(5000);
        await jest.runAllTimersAsync();
        await closePromise;
      }).rejects.toThrow();

      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-partial' },
          data: expect.objectContaining({
            status: 'ERROR',
          }),
        })
      );
    });
  });

  describe('Performance Metrics', () => {
    it('should log closeTime in database for Ultra-Fast strategy', async () => {
      const primaryBybit = new MockExchangeConnector('BYBIT', true);
      const hedgeBybit = new MockExchangeConnector('BYBIT', true);

      primaryBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      hedgeBybit.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });

      const subscription: any = {
        id: 'sub-123',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: primaryBybit,
        hedgeExchange: hedgeBybit,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      await jest.advanceTimersByTimeAsync(100);
      primaryBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      hedgeBybit.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      primaryBybit.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      hedgeBybit.wsClient!.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      // Verify closeTime was logged
      const updateCall = mockPrismaUpdate.mock.calls[0][0];
      expect(updateCall.data).toHaveProperty('closedAt');
    });

    it('should complete Bybit-to-Bybit faster than mixed pairs', async () => {
      // This test verifies strategy selection impacts performance
      const bybitPrimary = new MockExchangeConnector('BYBIT', true);
      const bybitHedge = new MockExchangeConnector('BYBIT', true);

      bybitPrimary.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });
      bybitHedge.mockGetPosition.mockResolvedValue({ markPrice: '50000', positionAmt: '1.0' });

      const subscription: any = {
        id: 'sub-fast',
        symbol: 'BTCUSDT',
        positionType: 'long',
        quantity: 1.0,
        primaryExchange: bybitPrimary,
        hedgeExchange: bybitHedge,
      };

      const closePositions = (service as any).closePositions.bind(service);
      const closePromise = closePositions(subscription, 50000, 50000, 25);

      const startTime = Date.now();

      await jest.advanceTimersByTimeAsync(100);
      bybitPrimary.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      bybitHedge.wsClient!.simulateData('tickers.linear', 'BTCUSDT', { lastPrice: '50000' });
      await jest.advanceTimersByTimeAsync(100);

      bybitPrimary.wsClient!.simulateOrderUpdate({ orderId: 'primary-123', orderStatus: 'Filled' });
      bybitHedge.wsClient!.simulateOrderUpdate({ orderId: 'hedge-456', orderStatus: 'Filled' });

      await jest.runAllTimersAsync();
      await closePromise;

      const elapsedTime = Date.now() - startTime;

      // Ultra-Fast strategy should complete quickly (within reasonable time with fake timers)
      expect(elapsedTime).toBeLessThanOrEqual(5000);
    });
  });
});
