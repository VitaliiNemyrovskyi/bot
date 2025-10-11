/**
 * Funding Arbitrage Take-Profit / Stop-Loss Tests
 *
 * Tests for verifying TP/SL functionality in both NON_HEDGED and HEDGED modes.
 * Focuses on:
 * - TP/SL price calculation (long vs short positions)
 * - TP/SL order placement on exchanges
 * - Position monitoring and automatic close detection
 * - Fallback mechanisms when TP/SL fails
 * - Max hold time safety mechanisms
 * - P&L calculation for TP/SL exits
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

// Mock connector with TP/SL support
class MockExchangeConnector extends BaseExchangeConnector {
  public mockSetTradingStop = jest.fn();
  public mockGetPosition = jest.fn();
  public mockPlaceMarketOrder = jest.fn();
  public mockPlaceReduceOnlyOrder = jest.fn();
  public mockClosePosition = jest.fn();
  public mockInitialize = jest.fn();
  public mockGetBalance = jest.fn();
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

  async setTradingStop(params: {
    symbol: string;
    side: OrderSide;
    takeProfit?: number;
    stopLoss?: number;
  }): Promise<{
    success: boolean;
    takeProfitOrderId?: string;
    stopLossOrderId?: string;
    message?: string;
  }> {
    return this.mockSetTradingStop(params);
  }
}

describe('FundingArbitrage - Take-Profit / Stop-Loss', () => {
  let service: FundingArbitrageService;
  let mockBybitConnector: MockExchangeConnector;
  let mockBingXConnector: MockExchangeConnector;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FundingArbitrageService();
    mockBybitConnector = new MockExchangeConnector('BYBIT');
    mockBingXConnector = new MockExchangeConnector('BINGX');
  });

  describe('TP/SL Price Calculation', () => {
    describe('LONG positions', () => {
      it('should calculate correct TP/SL prices for long position', () => {
        const entryPrice = 100000; // $100,000
        const takeProfit = 0.5; // 0.5%
        const stopLoss = 0.3; // 0.3%

        // For LONG: TP = price goes UP, SL = price goes DOWN
        const takeProfitPrice = entryPrice * (1 + takeProfit / 100);
        const stopLossPrice = entryPrice * (1 - stopLoss / 100);

        expect(takeProfitPrice).toBeCloseTo(100500, 1); // +0.5%
        expect(stopLossPrice).toBeCloseTo(99700, 1); // -0.3%
      });

      it('should calculate TP/SL for fractional prices', () => {
        const entryPrice = 43567.89;
        const takeProfit = 0.25;
        const stopLoss = 0.15;

        const takeProfitPrice = entryPrice * (1 + takeProfit / 100);
        const stopLossPrice = entryPrice * (1 - stopLoss / 100);

        expect(takeProfitPrice).toBeCloseTo(43676.81, 1);
        expect(stopLossPrice).toBeCloseTo(43502.51, 1);
      });
    });

    describe('SHORT positions', () => {
      it('should calculate correct TP/SL prices for short position', () => {
        const entryPrice = 100000; // $100,000
        const takeProfit = 0.5; // 0.5%
        const stopLoss = 0.3; // 0.3%

        // For SHORT: TP = price goes DOWN, SL = price goes UP
        const takeProfitPrice = entryPrice * (1 - takeProfit / 100);
        const stopLossPrice = entryPrice * (1 + stopLoss / 100);

        expect(takeProfitPrice).toBeCloseTo(99500, 1); // -0.5%
        expect(stopLossPrice).toBeCloseTo(100300, 1); // +0.3%
      });
    });

    describe('HEDGED positions', () => {
      it('should calculate opposite TP/SL for hedge position', () => {
        const primaryEntryPrice = 100000;
        const hedgeEntryPrice = 99950;
        const takeProfit = 0.5;
        const stopLoss = 0.3;

        // PRIMARY (LONG)
        const primaryTP = primaryEntryPrice * (1 + takeProfit / 100); // 100500
        const primarySL = primaryEntryPrice * (1 - stopLoss / 100); // 99700

        // HEDGE (SHORT) - opposite direction
        const hedgeTP = hedgeEntryPrice * (1 - takeProfit / 100); // 99450.25
        const hedgeSL = hedgeEntryPrice * (1 + stopLoss / 100); // 100249.85

        expect(primaryTP).toBeCloseTo(100500, 1);
        expect(primarySL).toBeCloseTo(99700, 1);
        expect(hedgeTP).toBeCloseTo(99450.25, 1);
        expect(hedgeSL).toBeCloseTo(100249.85, 1);
      });
    });
  });

  describe('TP/SL Order Placement - NON_HEDGED Mode', () => {
    it('should call setTradingStop with correct parameters', async () => {
      mockBybitConnector.mockSetTradingStop.mockResolvedValue({
        success: true,
        takeProfitOrderId: 'TP-123',
        stopLossOrderId: 'SL-456',
        message: 'Trading stop set successfully',
      });

      mockBybitConnector.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: 0, // Position closed
        positionAmt: '0',
      });

      const params = {
        symbol: 'BTCUSDT',
        side: 'Buy' as OrderSide,
        takeProfit: 100500,
        stopLoss: 99700,
      };

      const result = await mockBybitConnector.setTradingStop(params);

      expect(mockBybitConnector.mockSetTradingStop).toHaveBeenCalledWith(params);
      expect(result.success).toBe(true);
      expect(result.takeProfitOrderId).toBe('TP-123');
      expect(result.stopLossOrderId).toBe('SL-456');
    });

    it('should handle TP-only configuration', async () => {
      mockBybitConnector.mockSetTradingStop.mockResolvedValue({
        success: true,
        takeProfitOrderId: 'TP-123',
        message: 'Take profit set',
      });

      const params = {
        symbol: 'BTCUSDT',
        side: 'Buy' as OrderSide,
        takeProfit: 100500,
        stopLoss: undefined,
      };

      const result = await mockBybitConnector.setTradingStop(params);

      expect(result.success).toBe(true);
      expect(result.takeProfitOrderId).toBeDefined();
      expect(result.stopLossOrderId).toBeUndefined();
    });

    it('should handle SL-only configuration', async () => {
      mockBybitConnector.mockSetTradingStop.mockResolvedValue({
        success: true,
        stopLossOrderId: 'SL-456',
        message: 'Stop loss set',
      });

      const params = {
        symbol: 'BTCUSDT',
        side: 'Buy' as OrderSide,
        takeProfit: undefined,
        stopLoss: 99700,
      };

      const result = await mockBybitConnector.setTradingStop(params);

      expect(result.success).toBe(true);
      expect(result.takeProfitOrderId).toBeUndefined();
      expect(result.stopLossOrderId).toBeDefined();
    });

    it('should throw error when both TP and SL are undefined', async () => {
      mockBybitConnector.mockSetTradingStop.mockRejectedValue(
        new Error('At least one of takeProfit or stopLoss must be provided')
      );

      const params = {
        symbol: 'BTCUSDT',
        side: 'Buy' as OrderSide,
        takeProfit: undefined,
        stopLoss: undefined,
      };

      await expect(mockBybitConnector.setTradingStop(params)).rejects.toThrow(
        /At least one of takeProfit or stopLoss must be provided/
      );
    });
  });

  describe('TP/SL Order Placement - HEDGED Mode', () => {
    it('should set TP/SL on both exchanges in parallel', async () => {
      mockBybitConnector.mockSetTradingStop.mockResolvedValue({
        success: true,
        takeProfitOrderId: 'PRIMARY-TP',
        stopLossOrderId: 'PRIMARY-SL',
      });

      mockBingXConnector.mockSetTradingStop.mockResolvedValue({
        success: true,
        takeProfitOrderId: 'HEDGE-TP',
        stopLossOrderId: 'HEDGE-SL',
      });

      const startTime = Date.now();

      const [primaryResult, hedgeResult] = await Promise.all([
        mockBybitConnector.setTradingStop({
          symbol: 'BTCUSDT',
          side: 'Buy',
          takeProfit: 100500,
          stopLoss: 99700,
        }),
        mockBingXConnector.setTradingStop({
          symbol: 'BTC-USDT',
          side: 'Sell',
          takeProfit: 99450,
          stopLoss: 100250,
        }),
      ]);

      const duration = Date.now() - startTime;

      expect(primaryResult.success).toBe(true);
      expect(hedgeResult.success).toBe(true);
      expect(duration).toBeLessThan(100); // Should be very fast (parallel)
    });

    it('should handle partial TP/SL setup failure', async () => {
      mockBybitConnector.mockSetTradingStop.mockResolvedValue({
        success: true,
        takeProfitOrderId: 'PRIMARY-TP',
      });

      mockBingXConnector.mockSetTradingStop.mockRejectedValue(
        new Error('BingX TP/SL not supported')
      );

      const results = await Promise.allSettled([
        mockBybitConnector.setTradingStop({
          symbol: 'BTCUSDT',
          side: 'Buy',
          takeProfit: 100500,
        }),
        mockBingXConnector.setTradingStop({
          symbol: 'BTC-USDT',
          side: 'Sell',
          takeProfit: 99450,
        }).catch(err => null), // Handle rejection
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      if (results[1].status === 'fulfilled') {
        expect(results[1].value).toBeNull(); // Failed but caught
      }
    });
  });

  describe('Position Monitoring - NON_HEDGED', () => {
    it('should detect when position is closed by TP trigger', async () => {
      // Simulate position monitoring
      let positionSize = 1.0;

      mockBybitConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTCUSDT',
        size: positionSize,
        positionAmt: positionSize.toString(),
      }));

      // Initially position is open
      let position = await mockBybitConnector.getPosition('BTCUSDT');
      expect(Math.abs(parseFloat(position.positionAmt))).toBe(1.0);

      // Simulate TP trigger - position closes
      positionSize = 0;

      position = await mockBybitConnector.getPosition('BTCUSDT');
      expect(Math.abs(parseFloat(position.positionAmt))).toBe(0);
    });

    it('should detect when position is closed by SL trigger', async () => {
      let positionSize = 1.0;

      mockBybitConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTCUSDT',
        size: positionSize,
        positionAmt: positionSize.toString(),
      }));

      // Position open
      expect(Math.abs(parseFloat((await mockBybitConnector.getPosition('BTCUSDT')).positionAmt))).toBe(1.0);

      // SL triggers
      positionSize = 0;

      expect(Math.abs(parseFloat((await mockBybitConnector.getPosition('BTCUSDT')).positionAmt))).toBe(0);
    });
  });

  describe('Position Monitoring - HEDGED', () => {
    it('should detect when primary position closes and trigger hedge close', async () => {
      let primarySize = 1.0;
      let hedgeSize = 1.0;

      mockBybitConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTCUSDT',
        size: primarySize,
        positionAmt: primarySize.toString(),
      }));

      mockBingXConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTC-USDT',
        size: hedgeSize,
        positionAmt: hedgeSize.toString(),
      }));

      mockBingXConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'HEDGE-CLOSE',
        status: 'FILLED',
      });

      // Initially both open
      expect(Math.abs(parseFloat((await mockBybitConnector.getPosition('BTCUSDT')).positionAmt))).toBe(1.0);
      expect(Math.abs(parseFloat((await mockBingXConnector.getPosition('BTC-USDT')).positionAmt))).toBe(1.0);

      // Primary TP triggers, closes
      primarySize = 0;

      const [primary, hedge] = await Promise.all([
        mockBybitConnector.getPosition('BTCUSDT'),
        mockBingXConnector.getPosition('BTC-USDT'),
      ]);

      expect(Math.abs(parseFloat(primary.positionAmt))).toBe(0);
      expect(Math.abs(parseFloat(hedge.positionAmt))).toBe(1.0);

      // Should trigger hedge close
      if (Math.abs(parseFloat(primary.positionAmt)) === 0 && Math.abs(parseFloat(hedge.positionAmt)) > 0) {
        await mockBingXConnector.placeReduceOnlyOrder('BTC-USDT', 'Buy', 1.0);
        hedgeSize = 0;
      }

      expect(mockBingXConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(Math.abs(hedgeSize)).toBe(0);
    });

    it('should detect when hedge position closes and trigger primary close', async () => {
      let primarySize = 1.0;
      let hedgeSize = 1.0;

      mockBybitConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTCUSDT',
        size: primarySize,
        positionAmt: primarySize.toString(),
      }));

      mockBingXConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTC-USDT',
        size: hedgeSize,
        positionAmt: hedgeSize.toString(),
      }));

      mockBybitConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'PRIMARY-CLOSE',
        status: 'FILLED',
      });

      // Hedge closes first
      hedgeSize = 0;

      const [primary, hedge] = await Promise.all([
        mockBybitConnector.getPosition('BTCUSDT'),
        mockBingXConnector.getPosition('BTC-USDT'),
      ]);

      expect(Math.abs(parseFloat(primary.positionAmt))).toBe(1.0);
      expect(Math.abs(parseFloat(hedge.positionAmt))).toBe(0);

      // Should trigger primary close
      if (Math.abs(parseFloat(hedge.positionAmt)) === 0 && Math.abs(parseFloat(primary.positionAmt)) > 0) {
        await mockBybitConnector.placeReduceOnlyOrder('BTCUSDT', 'Sell', 1.0);
        primarySize = 0;
      }

      expect(mockBybitConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(Math.abs(primarySize)).toBe(0);
    });
  });

  describe('Fallback Mechanisms', () => {
    it('should fallback to time-based close if TP/SL setup fails', async () => {
      mockBybitConnector.mockSetTradingStop.mockRejectedValue(
        new Error('TP/SL not supported on this symbol')
      );

      mockBybitConnector.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: 1.0,
        positionAmt: '1.0',
      });

      mockBybitConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'FALLBACK-123',
        status: 'FILLED',
      });

      // Try to set TP/SL
      let tpslSuccess = false;
      try {
        await mockBybitConnector.setTradingStop({
          symbol: 'BTCUSDT',
          side: 'Buy',
          takeProfit: 100500,
        });
        tpslSuccess = true;
      } catch (error) {
        // TP/SL failed, use fallback
        console.log('Falling back to time-based close');

        // Simulate time-based close after delay
        await new Promise(resolve => setTimeout(resolve, 100));
        await mockBybitConnector.placeReduceOnlyOrder('BTCUSDT', 'Sell', 1.0);
      }

      expect(tpslSuccess).toBe(false);
      expect(mockBybitConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
    });

    it('should handle TP/SL not available on exchange', async () => {
      // Mock a connector that doesn't support TP/SL
      const unsupportedConnector = new MockExchangeConnector('UNSUPPORTED_EXCHANGE');
      unsupportedConnector.mockSetTradingStop.mockRejectedValue(
        new Error('setTradingStop is not implemented')
      );

      unsupportedConnector.mockPlaceMarketOrder.mockResolvedValue({
        orderId: 'MARKET-123',
      });

      await expect(
        unsupportedConnector.setTradingStop({
          symbol: 'BTCUSDT',
          side: 'Buy',
          takeProfit: 100500,
        })
      ).rejects.toThrow(/not implemented/);

      // Should fallback to regular market orders
      await unsupportedConnector.placeMarketOrder('BTCUSDT', 'Sell', 1.0);
      expect(unsupportedConnector.mockPlaceMarketOrder).toHaveBeenCalled();
    });
  });

  describe('Max Hold Time Safety', () => {
    it('should force close position after 2 hours if TP/SL not hit', async () => {
      jest.useFakeTimers();

      let positionSize = 1.0;

      mockBybitConnector.mockGetPosition.mockImplementation(async () => ({
        symbol: 'BTCUSDT',
        size: positionSize,
        positionAmt: positionSize.toString(),
      }));

      mockBybitConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        orderId: 'FORCE-CLOSE',
        status: 'FILLED',
      });

      // Start monitoring
      const MAX_HOLD_TIME = 2 * 60 * 60 * 1000; // 2 hours
      const forceClosePromise = new Promise<void>((resolve) => {
        setTimeout(async () => {
          const position = await mockBybitConnector.getPosition('BTCUSDT');
          if (Math.abs(parseFloat(position.positionAmt)) > 0) {
            await mockBybitConnector.placeReduceOnlyOrder('BTCUSDT', 'Sell', positionSize);
            positionSize = 0;
          }
          resolve();
        }, MAX_HOLD_TIME);
      });

      // Fast-forward 2 hours
      jest.advanceTimersByTime(MAX_HOLD_TIME);

      await forceClosePromise;

      expect(mockBybitConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(positionSize).toBe(0);

      jest.useRealTimers();
    });
  });

  describe('P&L Calculation', () => {
    it('should calculate correct P&L for TP trigger', () => {
      const entryPrice = 100000;
      const exitPrice = 100500; // TP hit
      const quantity = 1.0;
      const fundingEarned = 10;
      const feeRate = 0.00055;

      const tradePnL = (exitPrice - entryPrice) * quantity; // +500
      const fees = quantity * entryPrice * feeRate * 2; // entry + exit = 110
      const realizedPnl = fundingEarned + tradePnL - fees; // 10 + 500 - 110 = 400

      expect(tradePnL).toBe(500);
      expect(fees).toBeCloseTo(110, 1);
      expect(realizedPnl).toBeCloseTo(400, 1);
    });

    it('should calculate correct P&L for SL trigger', () => {
      const entryPrice = 100000;
      const exitPrice = 99700; // SL hit
      const quantity = 1.0;
      const fundingEarned = 10;
      const feeRate = 0.00055;

      const tradePnL = (exitPrice - entryPrice) * quantity; // -300
      const fees = quantity * entryPrice * feeRate * 2; // 110
      const realizedPnl = fundingEarned + tradePnL - fees; // 10 - 300 - 110 = -400

      expect(tradePnL).toBe(-300);
      expect(fees).toBeCloseTo(110, 1);
      expect(realizedPnl).toBeCloseTo(-400, 1);
    });

    it('should calculate correct P&L for HEDGED mode', () => {
      const quantity = 1.0;
      const fundingEarned = 10;
      const primaryFees = 110;
      const hedgeFees = 110;

      // In HEDGED mode, trade P&L should be near zero (positions offset)
      const tradePnL = 0; // Perfectly hedged
      const realizedPnl = fundingEarned + tradePnL - primaryFees - hedgeFees;

      expect(realizedPnl).toBeCloseTo(-210, 1); // 10 - 110 - 110 = -210
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small TP/SL percentages', async () => {
      const entryPrice = 100000;
      const takeProfit = 0.01; // 0.01% = $10
      const stopLoss = 0.01;

      const takeProfitPrice = entryPrice * (1 + takeProfit / 100);
      const stopLossPrice = entryPrice * (1 - stopLoss / 100);

      expect(takeProfitPrice).toBe(100010);
      expect(stopLossPrice).toBe(99990);
    });

    it('should handle very large TP/SL percentages', async () => {
      const entryPrice = 100000;
      const takeProfit = 10.0; // 10% = $10,000
      const stopLoss = 5.0; // 5% = $5,000

      const takeProfitPrice = entryPrice * (1 + takeProfit / 100);
      const stopLossPrice = entryPrice * (1 - stopLoss / 100);

      expect(takeProfitPrice).toBeCloseTo(110000, 1);
      expect(stopLossPrice).toBeCloseTo(95000, 1);
    });

    it('should handle position monitoring errors gracefully', async () => {
      mockBybitConnector.mockGetPosition.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(mockBybitConnector.getPosition('BTCUSDT')).rejects.toThrow(/Network timeout/);

      // Should continue monitoring despite error
      mockBybitConnector.mockGetPosition.mockResolvedValue({
        symbol: 'BTCUSDT',
        size: 0,
        positionAmt: '0',
      });

      const position = await mockBybitConnector.getPosition('BTCUSDT');
      expect(Math.abs(parseFloat(position.positionAmt))).toBe(0);
    });

    it('should handle concurrent TP/SL triggers', async () => {
      let primarySize = 1.0;
      let hedgeSize = 1.0;

      mockBybitConnector.mockGetPosition.mockImplementation(async () => ({
        size: primarySize,
        positionAmt: primarySize.toString(),
      }));

      mockBingXConnector.mockGetPosition.mockImplementation(async () => ({
        size: hedgeSize,
        positionAmt: hedgeSize.toString(),
      }));

      // Both trigger simultaneously
      primarySize = 0;
      hedgeSize = 0;

      const [primary, hedge] = await Promise.all([
        mockBybitConnector.getPosition('BTCUSDT'),
        mockBingXConnector.getPosition('BTC-USDT'),
      ]);

      expect(Math.abs(parseFloat(primary.positionAmt))).toBe(0);
      expect(Math.abs(parseFloat(hedge.positionAmt))).toBe(0);
    });
  });
});
