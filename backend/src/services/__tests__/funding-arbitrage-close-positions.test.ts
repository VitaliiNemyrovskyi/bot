/**
 * Funding Arbitrage Position Closing Tests
 *
 * Tests for verifying position closing behavior after funding payment across all exchanges.
 * Focuses on:
 * - Parallel position closing (both positions close simultaneously)
 * - Force-close fallback mechanisms (placeReduceOnlyOrder -> closePosition -> placeMarketOrder)
 * - Partial close detection (one position closes, one fails)
 * - Complete failure detection (both positions fail to close)
 * - Exchange-specific behaviors (Bybit, BingX, MEXC)
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

// Mock connectors
class MockExchangeConnector extends BaseExchangeConnector {
  public mockPlaceReduceOnlyOrder = jest.fn();
  public mockClosePosition = jest.fn();
  public mockPlaceMarketOrder = jest.fn();
  public mockInitialize = jest.fn();
  public mockGetBalance = jest.fn();
  public mockGetPosition = jest.fn();
  public mockGetOrderStatus = jest.fn();
  public mockPlaceLimitOrder = jest.fn();
  public mockCancelOrder = jest.fn();

  constructor(exchangeName: string) {
    super();
    this.exchangeName = exchangeName;
    this.isInitialized = true;
  }

  async initialize(): Promise<void> {
    return this.mockInitialize();
  }

  async placeMarketOrder(symbol: string, side: OrderSide, quantity: number): Promise<any> {
    return this.mockPlaceMarketOrder(symbol, side, quantity);
  }

  async placeLimitOrder(symbol: string, side: OrderSide, quantity: number, price: number): Promise<any> {
    return this.mockPlaceLimitOrder(symbol, side, quantity, price);
  }

  async cancelOrder(orderId: string, symbol: string): Promise<any> {
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

describe('FundingArbitrage - Position Closing After Funding Payment', () => {
  let service: FundingArbitrageService;
  let mockPrimaryConnector: MockExchangeConnector;
  let mockHedgeConnector: MockExchangeConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FundingArbitrageService();
    mockPrimaryConnector = new MockExchangeConnector('BYBIT');
    mockHedgeConnector = new MockExchangeConnector('MEXC');
  });

  describe('Parallel Position Closing', () => {
    it('should close both positions in parallel, not sequentially', async () => {
      // Track execution order
      const executionOrder: string[] = [];

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockImplementation(async () => {
        executionOrder.push('primary-start');
        await new Promise(resolve => setTimeout(resolve, 100));
        executionOrder.push('primary-end');
        return { orderId: 'primary-123', status: 'FILLED' };
      });

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockImplementation(async () => {
        executionOrder.push('hedge-start');
        await new Promise(resolve => setTimeout(resolve, 100));
        executionOrder.push('hedge-end');
        return { orderId: 'hedge-456', status: 'FILLED' };
      });

      // Execute close positions using the private method via reflection
      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      const startTime = Date.now();
      await Promise.allSettled([
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT'),
        forceCloseMethod(mockHedgeConnector, 'BTC_USDT', 'Buy', 1.0, 'MEXC'),
      ]);
      const duration = Date.now() - startTime;

      // Verify parallel execution: both should start before either ends
      expect(executionOrder[0]).toBe('primary-start');
      expect(executionOrder[1]).toBe('hedge-start');

      // Total duration should be ~100ms (parallel), not ~200ms (sequential)
      expect(duration).toBeLessThan(180); // Allow some tolerance for system performance
      expect(duration).toBeGreaterThan(90);
    });

    it('should attempt to close both positions even if one fails', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Primary exchange API error')
      );
      mockPrimaryConnector.mockClosePosition.mockRejectedValue(
        new Error('Close position failed')
      );
      mockPrimaryConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Market order failed')
      );

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'hedge-456',
        status: 'FILLED',
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      const results = await Promise.allSettled([
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT'),
        forceCloseMethod(mockHedgeConnector, 'BTC_USDT', 'Buy', 1.0, 'MEXC'),
      ]);

      // Primary should reject
      expect(results[0].status).toBe('rejected');

      // Hedge should fulfill
      expect(results[1].status).toBe('fulfilled');
      if (results[1].status === 'fulfilled') {
        expect(results[1].value).toHaveProperty('orderId', 'hedge-456');
      }

      // Both connectors should have been called
      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(mockHedgeConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
    });
  });

  describe('Force-Close Fallback Mechanisms', () => {
    it('should use placeReduceOnlyOrder as first method (preferred)', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: '123',
        status: 'FILLED',
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);
      const result = await forceCloseMethod(
        mockPrimaryConnector,
        'BTCUSDT',
        'Sell',
        1.0,
        'BYBIT'
      );

      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        'BTCUSDT',
        'Sell',
        1.0
      );
      expect(mockPrimaryConnector.mockClosePosition).not.toHaveBeenCalled();
      expect(mockPrimaryConnector.mockPlaceMarketOrder).not.toHaveBeenCalled();
      expect(result).toEqual({ orderId: '123', status: 'FILLED' });
    });

    it('should fallback to closePosition if placeReduceOnlyOrder fails', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Reduce-only order not supported')
      );
      mockPrimaryConnector.mockClosePosition.mockResolvedValue({
        orderId: '456',
        status: 'CLOSED',
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);
      const result = await forceCloseMethod(
        mockPrimaryConnector,
        'BTCUSDT',
        'Sell',
        1.0,
        'BYBIT'
      );

      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(mockPrimaryConnector.mockClosePosition).toHaveBeenCalledWith('BTCUSDT');
      expect(mockPrimaryConnector.mockPlaceMarketOrder).not.toHaveBeenCalled();
      expect(result).toEqual({ orderId: '456', status: 'CLOSED' });
    });

    it('should fallback to placeMarketOrder as last resort', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Reduce-only failed')
      );
      mockPrimaryConnector.mockClosePosition.mockRejectedValue(
        new Error('Close position failed')
      );
      mockPrimaryConnector.mockPlaceMarketOrder.mockResolvedValue({
        orderId: '789',
        status: 'FILLED',
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);
      const result = await forceCloseMethod(
        mockPrimaryConnector,
        'BTCUSDT',
        'Sell',
        1.0,
        'BYBIT'
      );

      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(mockPrimaryConnector.mockClosePosition).toHaveBeenCalled();
      expect(mockPrimaryConnector.mockPlaceMarketOrder).toHaveBeenCalledWith(
        'BTCUSDT',
        'Sell',
        1.0
      );
      expect(result).toEqual({ orderId: '789', status: 'FILLED' });
    });

    it('should throw error if all three methods fail', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Reduce-only failed')
      );
      mockPrimaryConnector.mockClosePosition.mockRejectedValue(
        new Error('Close position failed')
      );
      mockPrimaryConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Market order failed')
      );

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      await expect(
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT')
      ).rejects.toThrow(/Failed to close BYBIT position after trying all methods/);

      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(mockPrimaryConnector.mockClosePosition).toHaveBeenCalled();
      expect(mockPrimaryConnector.mockPlaceMarketOrder).toHaveBeenCalled();
    });
  });

  describe('Partial Close Detection', () => {
    it('should detect when primary closes but hedge fails', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'primary-123',
        status: 'FILLED',
      });

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Hedge API error')
      );
      mockHedgeConnector.mockClosePosition.mockRejectedValue(
        new Error('Hedge close failed')
      );
      mockHedgeConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Hedge market order failed')
      );

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      const results = await Promise.allSettled([
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT'),
        forceCloseMethod(mockHedgeConnector, 'BTC_USDT', 'Buy', 1.0, 'MEXC'),
      ]);

      // Verify partial close: one succeeded, one failed
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');

      // This scenario should be caught by the closePositions method
      // and throw an appropriate error
    });

    it('should detect when hedge closes but primary fails', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Primary API error')
      );
      mockPrimaryConnector.mockClosePosition.mockRejectedValue(
        new Error('Primary close failed')
      );
      mockPrimaryConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Primary market order failed')
      );

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'hedge-456',
        status: 'FILLED',
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      const results = await Promise.allSettled([
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT'),
        forceCloseMethod(mockHedgeConnector, 'BTC_USDT', 'Buy', 1.0, 'MEXC'),
      ]);

      // Verify partial close: one failed, one succeeded
      expect(results[0].status).toBe('rejected');
      expect(results[1].status).toBe('fulfilled');
    });

    it('should detect when both positions fail to close', async () => {
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Primary failed')
      );
      mockPrimaryConnector.mockClosePosition.mockRejectedValue(
        new Error('Primary close failed')
      );
      mockPrimaryConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Primary market failed')
      );

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('Hedge failed')
      );
      mockHedgeConnector.mockClosePosition.mockRejectedValue(
        new Error('Hedge close failed')
      );
      mockHedgeConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Hedge market failed')
      );

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      const results = await Promise.allSettled([
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT'),
        forceCloseMethod(mockHedgeConnector, 'BTC_USDT', 'Buy', 1.0, 'MEXC'),
      ]);

      // Both should fail
      expect(results[0].status).toBe('rejected');
      expect(results[1].status).toBe('rejected');
    });
  });

  describe('Exchange-Specific Behavior', () => {
    describe('Bybit', () => {
      it('should successfully close position using reduce-only order', async () => {
        const bybitConnector = new MockExchangeConnector('BYBIT');
        bybitConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
          orderId: 'bybit-123',
          orderLinkId: 'link-123',
          orderStatus: 'Filled',
        });

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);
        const result = await forceCloseMethod(
          bybitConnector,
          'BTCUSDT',
          'Sell',
          1.5,
          'BYBIT'
        );

        expect(bybitConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
          'BTCUSDT',
          'Sell',
          1.5
        );
        expect(result).toHaveProperty('orderId', 'bybit-123');
      });

      it('should handle Bybit API errors gracefully', async () => {
        const bybitConnector = new MockExchangeConnector('BYBIT');
        bybitConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
          new Error('Bybit API Error: 10001 - Invalid symbol')
        );
        bybitConnector.mockClosePosition.mockRejectedValue(
          new Error('Bybit API Error: 10002')
        );
        bybitConnector.mockPlaceMarketOrder.mockRejectedValue(
          new Error('Bybit API Error: 10003')
        );

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);

        await expect(
          forceCloseMethod(bybitConnector, 'BTCUSDT', 'Sell', 1.5, 'BYBIT')
        ).rejects.toThrow(/Failed to close BYBIT position/);
      });
    });

    describe('BingX', () => {
      it('should successfully close position using reduce-only order', async () => {
        const bingxConnector = new MockExchangeConnector('BINGX');
        bingxConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
          orderId: 'bingx-456',
          symbol: 'BTC-USDT',
          status: 'FILLED',
        });

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);
        const result = await forceCloseMethod(
          bingxConnector,
          'BTC-USDT',
          'Buy',
          2.0,
          'BINGX'
        );

        expect(bingxConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
          'BTC-USDT',
          'Buy',
          2.0
        );
        expect(result).toHaveProperty('orderId', 'bingx-456');
      });

      it('should fallback to closePosition for BingX', async () => {
        const bingxConnector = new MockExchangeConnector('BINGX');
        bingxConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
          new Error('BingX reduce-only not available')
        );
        bingxConnector.mockClosePosition.mockResolvedValue({
          success: true,
          positionId: 'pos-123',
        });

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);
        const result = await forceCloseMethod(
          bingxConnector,
          'BTC-USDT',
          'Buy',
          2.0,
          'BINGX'
        );

        expect(bingxConnector.mockClosePosition).toHaveBeenCalledWith('BTC-USDT');
        expect(result).toHaveProperty('success', true);
      });
    });

    describe('MEXC', () => {
      it('should successfully close position using reduce-only order', async () => {
        const mexcConnector = new MockExchangeConnector('MEXC');
        mexcConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
          orderId: 'mexc-789',
          symbol: 'BTC_USDT',
          success: true,
          code: 0,
        });

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);
        const result = await forceCloseMethod(
          mexcConnector,
          'BTC_USDT',
          'Sell',
          1.0,
          'MEXC'
        );

        expect(mexcConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
          'BTC_USDT',
          'Sell',
          1.0
        );
        expect(result).toHaveProperty('orderId', 'mexc-789');
      });

      it('should handle MEXC code 600 (leverage error) gracefully', async () => {
        const mexcConnector = new MockExchangeConnector('MEXC');
        mexcConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
          new Error('MEXC Error: code 600')
        );
        mexcConnector.mockClosePosition.mockResolvedValue({
          success: true,
          code: 0,
        });

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);
        const result = await forceCloseMethod(
          mexcConnector,
          'BTC_USDT',
          'Sell',
          1.0,
          'MEXC'
        );

        expect(mexcConnector.mockClosePosition).toHaveBeenCalled();
        expect(result).toHaveProperty('success', true);
      });

      it('should handle MEXC code 1002 (contract not activated)', async () => {
        const mexcConnector = new MockExchangeConnector('MEXC');
        mexcConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
          new Error('Contract BTC_USDT is not activated')
        );
        mexcConnector.mockClosePosition.mockRejectedValue(
          new Error('Contract not activated')
        );
        mexcConnector.mockPlaceMarketOrder.mockRejectedValue(
          new Error('Contract not activated')
        );

        const forceCloseMethod = (service as any).forceClosePosition.bind(service);

        await expect(
          forceCloseMethod(mexcConnector, 'BTC_USDT', 'Sell', 1.0, 'MEXC')
        ).rejects.toThrow(/Failed to close MEXC position/);
      });
    });
  });

  describe('Performance and Timing', () => {
    it('should complete parallel close faster than sequential', async () => {
      // Simulate network delay
      const delay = 200;

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { orderId: 'primary-123' };
      });

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { orderId: 'hedge-456' };
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      // Test parallel execution
      const parallelStart = Date.now();
      await Promise.allSettled([
        forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT'),
        forceCloseMethod(mockHedgeConnector, 'BTC_USDT', 'Buy', 1.0, 'MEXC'),
      ]);
      const parallelDuration = Date.now() - parallelStart;

      // Parallel should take ~200ms, not ~400ms
      expect(parallelDuration).toBeLessThan(delay * 1.5);
      expect(parallelDuration).toBeGreaterThan(delay * 0.9);
    });

    it('should log timing information for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: '123',
      });

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);
      await forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 1.0, 'BYBIT');

      // Verify logging occurred (actual log format may vary)
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero quantity gracefully', async () => {
      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: '123',
      });

      await forceCloseMethod(mockPrimaryConnector, 'BTCUSDT', 'Sell', 0, 'BYBIT');

      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        'BTCUSDT',
        'Sell',
        0
      );
    });

    it('should handle very large quantities', async () => {
      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: '123',
      });

      const largeQuantity = 999999.123456789;
      await forceCloseMethod(
        mockPrimaryConnector,
        'BTCUSDT',
        'Sell',
        largeQuantity,
        'BYBIT'
      );

      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        'BTCUSDT',
        'Sell',
        largeQuantity
      );
    });

    it('should handle network timeout errors', async () => {
      const mexcConnector = new MockExchangeConnector('MEXC');
      mexcConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('ETIMEDOUT: Network timeout')
      );
      mexcConnector.mockClosePosition.mockRejectedValue(
        new Error('ETIMEDOUT: Network timeout')
      );
      mexcConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('ETIMEDOUT: Network timeout')
      );

      const forceCloseMethod = (service as any).forceClosePosition.bind(service);

      await expect(
        forceCloseMethod(mexcConnector, 'BTC_USDT', 'Sell', 1.0, 'MEXC')
      ).rejects.toThrow(/Network timeout/);
    });
  });
});
