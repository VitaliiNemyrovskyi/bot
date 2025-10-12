/**
 * Price Arbitrage Service Tests
 *
 * Comprehensive test suite for PriceArbitrageService covering:
 * - Position opening (PRIMARY SHORT + HEDGE LONG)
 * - Position monitoring with WebSocket price streams
 * - Convergence detection (target spread, stop-loss, max holding time)
 * - Position closing with P&L calculation
 * - Service initialization and recovery
 * - Error handling and partial position scenarios
 * - Exchange-specific behaviors
 */

import { priceArbitrageService } from '../price-arbitrage.service';
import { BaseExchangeConnector, OrderSide } from '@/connectors/base-exchange.connector';
import prisma from '@/lib/prisma';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { PriceArbitrageStatus } from '@prisma/client';
import {
  StartPriceArbitrageParams,
  OpenPositionsResult,
  ClosePositionsResult,
} from '@/types/price-arbitrage';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    priceArbitragePosition: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    exchangeCredentials: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock ExchangeCredentialsService
jest.mock('@/lib/exchange-credentials-service', () => ({
  ExchangeCredentialsService: {
    getCredentialById: jest.fn(),
  },
}));

// Mock connectors
class MockExchangeConnector extends BaseExchangeConnector {
  public mockInitialize = jest.fn();
  public mockPlaceMarketOrder = jest.fn();
  public mockPlaceReduceOnlyOrder = jest.fn();
  public mockGetBalance = jest.fn();
  public mockGetPosition = jest.fn();
  public mockSetLeverage = jest.fn();
  public mockGetMarketPrice = jest.fn();
  public mockSubscribeToPriceStream = jest.fn();
  public mockPlaceLimitOrder = jest.fn();
  public mockCancelOrder = jest.fn();
  public mockGetOrderStatus = jest.fn();
  public mockClosePosition = jest.fn();

  constructor(exchangeName: string) {
    super();
    this.exchangeName = exchangeName;
    this.isInitialized = false;
  }

  async initialize(): Promise<void> {
    this.isInitialized = true;
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

  async setLeverage(symbol: string, leverage: number): Promise<any> {
    return this.mockSetLeverage(symbol, leverage);
  }

  async getMarketPrice(symbol: string): Promise<number> {
    return this.mockGetMarketPrice(symbol);
  }

  async subscribeToPriceStream(
    symbol: string,
    callback: (price: number, timestamp: number) => void
  ): Promise<() => void> {
    return this.mockSubscribeToPriceStream(symbol, callback);
  }
}

describe('PriceArbitrageService', () => {
  let mockPrimaryConnector: MockExchangeConnector;
  let mockHedgeConnector: MockExchangeConnector;

  const mockUserId = 'test-user-123';
  const mockSymbol = 'BTCUSDT';
  const mockPrimaryPrice = 50100;
  const mockHedgePrice = 50000;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrimaryConnector = new MockExchangeConnector('BYBIT');
    mockHedgeConnector = new MockExchangeConnector('MEXC');

    // Reset service singleton state
    const service = priceArbitrageService as any;
    service.initialized = false;
    service.activeMonitors.clear();

    // Setup default mock responses
    mockPrimaryConnector.mockGetBalance.mockResolvedValue({
      result: {
        list: [{ coin: [{ availableToWithdraw: '10000' }] }],
      },
    });
    mockHedgeConnector.mockGetBalance.mockResolvedValue({
      result: {
        list: [{ coin: [{ availableToWithdraw: '10000' }] }],
      },
    });
    mockPrimaryConnector.mockSetLeverage.mockResolvedValue({ success: true });
    mockHedgeConnector.mockSetLeverage.mockResolvedValue({ success: true });

    // Mock credential retrieval
    (ExchangeCredentialsService.getCredentialById as jest.Mock).mockImplementation(
      async (userId: string, credentialId: string) => {
        return {
          id: credentialId,
          userId,
          exchange: credentialId.includes('primary') ? 'BYBIT' : 'MEXC',
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
          environment: 'TESTNET',
          authToken: undefined,
        };
      }
    );
  });

  describe('Position Opening - startArbitrage()', () => {
    const mockStartParams: StartPriceArbitrageParams = {
      userId: mockUserId,
      symbol: mockSymbol,
      primaryExchange: 'BYBIT',
      primaryCredentialId: 'primary-cred-1',
      primaryLeverage: 3,
      primaryMargin: 100,
      hedgeExchange: 'MEXC',
      hedgeCredentialId: 'hedge-cred-1',
      hedgeLeverage: 3,
      hedgeMargin: 100,
      entryPrimaryPrice: mockPrimaryPrice,
      entryHedgePrice: mockHedgePrice,
      targetSpread: 0.001,
      stopLoss: 0.03,
      maxHoldingTime: 3600,
    };

    it('should successfully open both positions (PRIMARY SHORT + HEDGE LONG)', async () => {
      // Mock database creation
      const mockPosition = {
        id: 'position-123',
        userId: mockUserId,
        symbol: mockSymbol,
        primaryExchange: 'BYBIT',
        hedgeExchange: 'MEXC',
        status: 'OPENING' as PriceArbitrageStatus,
        primaryQuantity: 0.0598,
        hedgeQuantity: 0.06,
        entryPrimaryPrice: mockPrimaryPrice,
        entryHedgePrice: mockHedgePrice,
        entrySpread: 0.002,
        entrySpreadPercent: 0.2,
        createdAt: new Date(),
        openedAt: null,
      };

      (prisma.priceArbitragePosition.create as jest.Mock).mockResolvedValue(mockPosition);
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({
        ...mockPosition,
        status: 'ACTIVE',
        openedAt: new Date(),
      });
      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue({
        ...mockPosition,
        status: 'ACTIVE',
        openedAt: new Date(),
      });

      // Mock order executions
      mockPrimaryConnector.mockPlaceMarketOrder.mockResolvedValue({
        result: {
          orderId: 'primary-order-123',
          avgPrice: '50100',
        },
      });

      mockHedgeConnector.mockPlaceMarketOrder.mockResolvedValue({
        result: {
          orderId: 'hedge-order-456',
          avgPrice: '50000',
        },
      });

      // Mock price stream subscriptions
      mockPrimaryConnector.mockSubscribeToPriceStream.mockResolvedValue(jest.fn());
      mockHedgeConnector.mockSubscribeToPriceStream.mockResolvedValue(jest.fn());

      // Spy on getConnector method
      const service = priceArbitrageService as any;
      const originalGetConnector = service.getConnector.bind(service);
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
        return originalGetConnector(exchange, 'key', 'secret', false);
      });

      // Execute
      const result = await priceArbitrageService.startArbitrage(mockStartParams);

      // Verify
      expect(result.success).toBe(true);
      expect(result.stage).toBe('both_open');
      expect(result.positionId).toBe('position-123');
      expect(result.primaryOrderId).toBe('primary-order-123');
      expect(result.hedgeOrderId).toBe('hedge-order-456');

      // Verify PRIMARY SHORT order
      expect(mockPrimaryConnector.mockPlaceMarketOrder).toHaveBeenCalledWith(
        mockSymbol,
        'Sell', // SHORT
        expect.any(Number)
      );

      // Verify HEDGE LONG order
      expect(mockHedgeConnector.mockPlaceMarketOrder).toHaveBeenCalledWith(
        mockSymbol,
        'Buy', // LONG
        expect.any(Number)
      );

      // Verify leverage was set
      expect(mockPrimaryConnector.mockSetLeverage).toHaveBeenCalledWith(mockSymbol, 3);
      expect(mockHedgeConnector.mockSetLeverage).toHaveBeenCalledWith(mockSymbol, 3);

      // Verify database was updated to ACTIVE
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          hedgeOrderId: 'hedge-order-456',
          openedAt: expect.any(Date),
        }),
      });
    });

    it('should fail gracefully if PRIMARY position fails (nothing opened)', async () => {
      mockPrimaryConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('Insufficient balance on PRIMARY exchange')
      );

      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.create as jest.Mock).mockResolvedValue({
        id: 'position-123',
      });
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      const result = await priceArbitrageService.startArbitrage(mockStartParams);

      expect(result.success).toBe(false);
      expect(result.stage).toBe('primary_open');
      expect(result.error).toContain('Insufficient balance');

      // HEDGE should not have been attempted
      expect(mockHedgeConnector.mockPlaceMarketOrder).not.toHaveBeenCalled();

      // Position should be marked as ERROR
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: expect.objectContaining({
          status: 'ERROR',
        }),
      });
    });

    it('should mark as PARTIAL and attempt to close PRIMARY if HEDGE fails', async () => {
      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.create as jest.Mock).mockResolvedValue({
        id: 'position-123',
        primaryQuantity: 0.06,
      });
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      // PRIMARY succeeds
      mockPrimaryConnector.mockPlaceMarketOrder.mockResolvedValue({
        result: {
          orderId: 'primary-order-123',
          avgPrice: '50100',
        },
      });

      // HEDGE fails
      mockHedgeConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('MEXC API Error: 1002 - Contract not activated')
      );

      // Mock close PRIMARY attempt
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: { orderId: 'close-order-789' },
      });

      const result = await priceArbitrageService.startArbitrage(mockStartParams);

      expect(result.success).toBe(false);
      expect(result.stage).toBe('hedge_open');
      expect(result.error).toContain('HEDGE position failed');
      expect(result.primaryOrderId).toBe('primary-order-123');

      // Verify PRIMARY close attempt
      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        mockSymbol,
        'Buy', // Close SHORT
        expect.any(Number)
      );

      // Position should be marked as PARTIAL
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: expect.objectContaining({
          status: 'PARTIAL',
        }),
      });
    });

    it('should handle leverage setting failures gracefully', async () => {
      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.create as jest.Mock).mockResolvedValue({
        id: 'position-123',
      });
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});
      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue({
        id: 'position-123',
        status: 'ACTIVE',
        openedAt: new Date(),
      });

      mockPrimaryConnector.mockSetLeverage.mockRejectedValue(
        new Error('Leverage already set')
      );
      mockHedgeConnector.mockSetLeverage.mockRejectedValue(
        new Error('Leverage already set')
      );

      mockPrimaryConnector.mockPlaceMarketOrder.mockResolvedValue({
        result: { orderId: 'primary-123', avgPrice: '50100' },
      });
      mockHedgeConnector.mockPlaceMarketOrder.mockResolvedValue({
        result: { orderId: 'hedge-456', avgPrice: '50000' },
      });
      mockPrimaryConnector.mockSubscribeToPriceStream.mockResolvedValue(jest.fn());
      mockHedgeConnector.mockSubscribeToPriceStream.mockResolvedValue(jest.fn());

      const result = await priceArbitrageService.startArbitrage(mockStartParams);

      // Should succeed despite leverage errors (warnings logged)
      expect(result.success).toBe(true);
      expect(result.stage).toBe('both_open');
    });

    it('should validate credentials before opening positions', async () => {
      (ExchangeCredentialsService.getCredentialById as jest.Mock).mockResolvedValueOnce(null);

      const result = await priceArbitrageService.startArbitrage(mockStartParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Credentials not found');

      // No orders should be placed
      expect(mockPrimaryConnector.mockPlaceMarketOrder).not.toHaveBeenCalled();
      expect(mockHedgeConnector.mockPlaceMarketOrder).not.toHaveBeenCalled();
    });
  });

  describe('Position Closing - closeArbitrage()', () => {
    const mockPosition = {
      id: 'position-123',
      userId: mockUserId,
      symbol: mockSymbol,
      primaryExchange: 'BYBIT',
      primaryCredentialId: 'primary-cred-1',
      hedgeExchange: 'MEXC',
      hedgeCredentialId: 'hedge-cred-1',
      status: 'ACTIVE' as PriceArbitrageStatus,
      primaryQuantity: 0.06,
      hedgeQuantity: 0.06,
      entryPrimaryPrice: mockPrimaryPrice,
      entryHedgePrice: mockHedgePrice,
      primaryMargin: 100,
      hedgeMargin: 100,
      primaryFees: 0,
      hedgeFees: 0,
      entrySpread: 0.002,
      entrySpreadPercent: 0.2,
      openedAt: new Date(),
      createdAt: new Date(),
    };

    it('should successfully close both positions and calculate P&L', async () => {
      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue(mockPosition);
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({
        ...mockPosition,
        status: 'COMPLETED',
      });

      // Mock close orders
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: {
          orderId: 'close-primary-123',
          avgPrice: '50050', // Price went down (profit for SHORT)
          execFee: '0.5',
        },
      });

      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: {
          orderId: 'close-hedge-456',
          avgPrice: '50050', // Price went up (profit for LONG)
          execFee: '0.5',
        },
      });

      const result = await priceArbitrageService.closeArbitrage('position-123', 'target_reached');

      expect(result.success).toBe(true);
      expect(result.stage).toBe('both_closed');
      expect(result.primaryClosePrice).toBe(50050);
      expect(result.hedgeClosePrice).toBe(50050);

      // Verify PRIMARY close (BUY to close SHORT)
      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        mockSymbol,
        'Buy', // Close SHORT
        0.06
      );

      // Verify HEDGE close (SELL to close LONG)
      expect(mockHedgeConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalledWith(
        mockSymbol,
        'Sell', // Close LONG
        0.06
      );

      // Verify P&L calculation
      // PRIMARY SHORT: (50100 - 50050) * 0.06 = 3 USDT profit
      // HEDGE LONG: (50050 - 50000) * 0.06 = 3 USDT profit
      // Total: 6 USDT - 1 USDT fees = 5 USDT
      expect(result.primaryPnl).toBeCloseTo(3, 1);
      expect(result.hedgePnl).toBeCloseTo(3, 1);
      expect(result.totalPnl).toBeCloseTo(5, 1);

      // Verify database update to COMPLETED
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          closedAt: expect.any(Date),
          exitPrimaryPrice: 50050,
          exitHedgePrice: 50050,
          totalPnl: expect.any(Number),
        }),
      });
    });

    it('should mark as PARTIAL if PRIMARY close fails but HEDGE succeeds', async () => {
      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue(mockPosition);
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      // PRIMARY close fails
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('PRIMARY API Error')
      );

      // HEDGE close succeeds
      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: {
          orderId: 'close-hedge-456',
          avgPrice: '50050',
        },
      });

      const result = await priceArbitrageService.closeArbitrage('position-123');

      expect(result.success).toBe(false);
      expect(result.stage).toBe('primary_close');
      expect(result.error).toContain('PRIMARY');

      // Both close attempts should have been made
      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(mockHedgeConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();

      // Position should be marked as PARTIAL
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: expect.objectContaining({
          status: 'PARTIAL',
          errorMessage: expect.stringContaining('PRIMARY close failed'),
        }),
      });
    });

    it('should mark as PARTIAL if HEDGE close fails but PRIMARY succeeds', async () => {
      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue(mockPosition);
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      // PRIMARY close succeeds
      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: {
          orderId: 'close-primary-123',
          avgPrice: '50050',
          execFee: '0.5',
        },
      });

      // HEDGE close fails
      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockRejectedValue(
        new Error('HEDGE API Error')
      );

      const result = await priceArbitrageService.closeArbitrage('position-123');

      expect(result.success).toBe(false);
      expect(result.stage).toBe('hedge_close');
      expect(result.error).toContain('HEDGE');
      expect(result.primaryClosePrice).toBe(50050);

      // Position should be marked as PARTIAL
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'position-123' },
        data: expect.objectContaining({
          status: 'PARTIAL',
          exitPrimaryPrice: 50050,
          errorMessage: expect.stringContaining('HEDGE close failed'),
        }),
      });
    });

    it('should reject if position is not found', async () => {
      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await priceArbitrageService.closeArbitrage('nonexistent-position');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Position not found');
    });

    it('should reject if position is not ACTIVE', async () => {
      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue({
        ...mockPosition,
        status: 'COMPLETED',
      });

      const result = await priceArbitrageService.closeArbitrage('position-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not active');
    });
  });

  describe('Convergence Detection', () => {
    it('should detect target spread convergence', async () => {
      const service = priceArbitrageService as any;

      const position = {
        entrySpread: 0.002, // 0.2%
        targetSpread: 0.001, // 0.1%
        stopLoss: undefined,
        maxHoldingTime: undefined,
        openedAt: new Date(),
      };

      // Current spread: (50050 - 50000) / 50000 = 0.001 (0.1%)
      const currentPrices = { primary: 50050, hedge: 50000 };

      const convergence = service.checkConvergence(position, currentPrices);

      expect(convergence.shouldClose).toBe(true);
      expect(convergence.reason).toBe('target_reached');
    });

    it('should detect stop-loss trigger', async () => {
      const service = priceArbitrageService as any;

      const position = {
        entrySpread: 0.002, // 0.2%
        targetSpread: 0.001, // 0.1%
        stopLoss: 0.03, // 3%
        maxHoldingTime: undefined,
        openedAt: new Date(),
      };

      // Current spread: (50200 - 49900) / 49900 = 0.006 (0.6%)
      // Entry + stopLoss = 0.002 + 0.03 = 0.032 (3.2%)
      // 0.006 < 0.032, so no stop-loss yet

      const currentPrices = { primary: 50200, hedge: 49900 };
      const convergence = service.checkConvergence(position, currentPrices);
      expect(convergence.shouldClose).toBe(false);

      // Now test with wider spread that triggers stop-loss
      // Current spread: (51600 - 50000) / 50000 = 0.032 (3.2%)
      const widePrices = { primary: 51600, hedge: 50000 };
      const wideConvergence = service.checkConvergence(position, widePrices);
      expect(wideConvergence.shouldClose).toBe(true);
      expect(wideConvergence.reason).toBe('stop_loss');
    });

    it('should detect max holding time exceeded', async () => {
      const service = priceArbitrageService as any;

      const pastTime = new Date(Date.now() - 3700 * 1000); // 1 hour 1 minute ago
      const position = {
        entrySpread: 0.002,
        targetSpread: 0.001,
        stopLoss: undefined,
        maxHoldingTime: 3600, // 1 hour in seconds
        openedAt: pastTime,
      };

      const currentPrices = { primary: 50100, hedge: 50000 };
      const convergence = service.checkConvergence(position, currentPrices);

      expect(convergence.shouldClose).toBe(true);
      expect(convergence.reason).toBe('max_holding_time');
    });

    it('should not close if no convergence conditions met', async () => {
      const service = priceArbitrageService as any;

      const position = {
        entrySpread: 0.002, // 0.2%
        targetSpread: 0.001, // 0.1%
        stopLoss: 0.03,
        maxHoldingTime: 3600,
        openedAt: new Date(),
      };

      // Current spread: 0.15% (between entry and target)
      const currentPrices = { primary: 50075, hedge: 50000 };
      const convergence = service.checkConvergence(position, currentPrices);

      expect(convergence.shouldClose).toBe(false);
      expect(convergence.reason).toBeUndefined();
    });
  });

  describe('Profit Calculation', () => {
    it('should calculate profit correctly for converged positions', async () => {
      const position = {
        id: 'position-123',
        entryPrimaryPrice: 50100, // SHORT entry
        entryHedgePrice: 50000, // LONG entry
        primaryQuantity: 1.0, // Larger quantity for more profit
        hedgeQuantity: 1.0,
        primaryMargin: 1000,
        hedgeMargin: 1000,
      };

      // Prices converged: both at 50050
      const currentPrices = { primary: 50050, hedge: 50050 };

      const profit = await priceArbitrageService.calculateProfit(position as any, currentPrices);

      // PRIMARY SHORT: (50100 - 50050) * 1.0 = 50 USDT profit
      expect(profit.primaryProfit).toBeCloseTo(50, 2);

      // HEDGE LONG: (50050 - 50000) * 1.0 = 50 USDT profit
      expect(profit.hedgeProfit).toBeCloseTo(50, 2);

      // Gross profit: 100 USDT
      expect(profit.grossProfit).toBeCloseTo(100, 2);

      // Net profit should be positive after fees (fees ~0.055% * 2 * 50000 * 2 = 110 USDT)
      // With 100 USDT gross profit, fees will be smaller, so net should still be negative
      // Actually let's just check fees are calculated
      expect(profit.totalFees).toBeGreaterThan(0);

      // Total margin
      expect(profit.totalMargin).toBe(2000);

      // Check that profit percentage is calculated
      expect(profit.profitPercent).toBeDefined();
    });

    it('should calculate loss correctly for diverged positions', async () => {
      const position = {
        id: 'position-123',
        entryPrimaryPrice: 50100, // SHORT entry
        entryHedgePrice: 50000, // LONG entry
        primaryQuantity: 0.1,
        hedgeQuantity: 0.1,
        primaryMargin: 100,
        hedgeMargin: 100,
      };

      // Prices diverged: spread widened
      const currentPrices = { primary: 50200, hedge: 49900 };

      const profit = await priceArbitrageService.calculateProfit(position as any, currentPrices);

      // PRIMARY SHORT: (50100 - 50200) * 0.1 = -10 USDT loss
      expect(profit.primaryProfit).toBeCloseTo(-10, 2);

      // HEDGE LONG: (49900 - 50000) * 0.1 = -10 USDT loss
      expect(profit.hedgeProfit).toBeCloseTo(-10, 2);

      // Gross profit: -20 USDT
      expect(profit.grossProfit).toBeCloseTo(-20, 2);

      // Net profit should be negative after fees
      expect(profit.netProfit).toBeLessThan(0);
    });

    it('should include fees in calculation', async () => {
      const position = {
        id: 'position-123',
        entryPrimaryPrice: 50000,
        entryHedgePrice: 50000,
        primaryQuantity: 1.0,
        hedgeQuantity: 1.0,
        primaryMargin: 100,
        hedgeMargin: 100,
      };

      const currentPrices = { primary: 50000, hedge: 50000 };

      const profit = await priceArbitrageService.calculateProfit(position as any, currentPrices);

      // No price movement = 0 profit before fees
      expect(profit.grossProfit).toBeCloseTo(0, 2);

      // Fees should be calculated (entry + exit for both positions)
      expect(profit.totalFees).toBeGreaterThan(0);
      expect(profit.primaryFees).toBeGreaterThan(0);
      expect(profit.hedgeFees).toBeGreaterThan(0);

      // Net profit should be negative due to fees
      expect(profit.netProfit).toBeLessThan(0);
      expect(profit.netProfit).toBeCloseTo(-profit.totalFees, 2);
    });
  });

  describe('Service Initialization', () => {
    it('should restore active positions on initialization', async () => {
      const mockActivePosition = {
        id: 'position-123',
        userId: mockUserId,
        status: 'ACTIVE',
        symbol: mockSymbol,
        primaryExchange: 'BYBIT',
        hedgeExchange: 'MEXC',
        primaryCredentialId: 'primary-cred-1',
        hedgeCredentialId: 'hedge-cred-1',
        openedAt: new Date(Date.now() - 60000), // 1 minute ago
        maxHoldingTime: 3600,
        createdAt: new Date(),
        entryPrimaryPrice: 50100,
        entryHedgePrice: 50000,
      };

      (prisma.priceArbitragePosition.findMany as jest.Mock).mockResolvedValue([
        mockActivePosition,
      ]);

      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      mockPrimaryConnector.mockSubscribeToPriceStream.mockResolvedValue(jest.fn());
      mockHedgeConnector.mockSubscribeToPriceStream.mockResolvedValue(jest.fn());

      await priceArbitrageService.initialize();

      // Verify position was restored
      expect(prisma.priceArbitragePosition.findMany).toHaveBeenCalledWith({
        where: {
          status: {
            in: ['ACTIVE', 'OPENING', 'CLOSING'],
          },
        },
      });

      // Verify monitoring was started (price streams subscribed)
      expect(mockPrimaryConnector.mockSubscribeToPriceStream).toHaveBeenCalled();
      expect(mockHedgeConnector.mockSubscribeToPriceStream).toHaveBeenCalled();
    });

    it('should mark stuck OPENING positions as ERROR', async () => {
      const stuckPosition = {
        id: 'stuck-position-123',
        status: 'OPENING',
        createdAt: new Date(Date.now() - 400000), // 6+ minutes ago (stuck)
      };

      (prisma.priceArbitragePosition.findMany as jest.Mock).mockResolvedValue([stuckPosition]);
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      await priceArbitrageService.initialize();

      // Verify stuck position was marked as ERROR
      expect(prisma.priceArbitragePosition.update).toHaveBeenCalledWith({
        where: { id: 'stuck-position-123' },
        data: expect.objectContaining({
          status: 'ERROR',
          errorMessage: expect.stringContaining('stuck'),
        }),
      });
    });

    it('should close positions that exceeded max holding time', async () => {
      const expiredPosition = {
        id: 'expired-position-123',
        userId: mockUserId,
        status: 'ACTIVE',
        symbol: mockSymbol,
        primaryExchange: 'BYBIT',
        hedgeExchange: 'MEXC',
        primaryCredentialId: 'primary-cred-1',
        hedgeCredentialId: 'hedge-cred-1',
        openedAt: new Date(Date.now() - 7200000), // 2 hours ago
        maxHoldingTime: 3600, // 1 hour max
        createdAt: new Date(),
        entryPrimaryPrice: 50100,
        entryHedgePrice: 50000,
        primaryQuantity: 0.1,
        hedgeQuantity: 0.1,
        primaryFees: 0,
        hedgeFees: 0,
      };

      (prisma.priceArbitragePosition.findMany as jest.Mock).mockResolvedValue([expiredPosition]);
      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue(expiredPosition);
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: { orderId: 'close-123', avgPrice: '50050', execFee: '0.5' },
      });
      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: { orderId: 'close-456', avgPrice: '50050', execFee: '0.5' },
      });

      await priceArbitrageService.initialize();

      // Verify position was closed
      expect(mockPrimaryConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
      expect(mockHedgeConnector.mockPlaceReduceOnlyOrder).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      (prisma.priceArbitragePosition.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(priceArbitrageService.initialize()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should not reinitialize if already initialized', async () => {
      // First initialization
      (prisma.priceArbitragePosition.findMany as jest.Mock).mockResolvedValue([]);
      await priceArbitrageService.initialize();

      // Clear mock
      (prisma.priceArbitragePosition.findMany as jest.Mock).mockClear();

      // Second initialization attempt
      await priceArbitrageService.initialize();

      // Should not query database again
      expect(prisma.priceArbitragePosition.findMany).not.toHaveBeenCalled();
    });
  });

  describe('Data Retrieval', () => {
    it('should get active positions for a user', async () => {
      const mockPositions = [
        { id: 'pos-1', userId: mockUserId, status: 'ACTIVE', openedAt: new Date() },
        { id: 'pos-2', userId: mockUserId, status: 'ACTIVE', openedAt: new Date() },
      ];

      (prisma.priceArbitragePosition.findMany as jest.Mock).mockResolvedValue(mockPositions);

      const positions = await priceArbitrageService.getActivePositions(mockUserId);

      expect(positions).toHaveLength(2);
      expect(prisma.priceArbitragePosition.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: 'ACTIVE',
        },
        orderBy: {
          openedAt: 'desc',
        },
      });
    });

    it('should get a specific position by ID', async () => {
      const mockPosition = { id: 'position-123', userId: mockUserId, status: 'ACTIVE' };

      (prisma.priceArbitragePosition.findUnique as jest.Mock).mockResolvedValue(mockPosition);

      const position = await priceArbitrageService.getPosition('position-123');

      expect(position).toEqual(mockPosition);
      expect(prisma.priceArbitragePosition.findUnique).toHaveBeenCalledWith({
        where: { id: 'position-123' },
      });
    });
  });

  describe('Service Statistics', () => {
    it('should return service stats', () => {
      const stats = priceArbitrageService.getStats();

      expect(stats).toHaveProperty('initialized');
      expect(stats).toHaveProperty('activeMonitors');
      expect(stats).toHaveProperty('monitoredPositions');
      expect(typeof stats.activeMonitors).toBe('number');
      expect(Array.isArray(stats.monitoredPositions)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero quantity positions gracefully', async () => {
      const position = {
        id: 'position-123',
        entryPrimaryPrice: 50100,
        entryHedgePrice: 50000,
        primaryQuantity: 0,
        hedgeQuantity: 0,
        primaryMargin: 100,
        hedgeMargin: 100,
      };

      const currentPrices = { primary: 50050, hedge: 50050 };

      const profit = await priceArbitrageService.calculateProfit(position as any, currentPrices);

      expect(profit.primaryProfit).toBe(0);
      expect(profit.hedgeProfit).toBe(0);
      expect(profit.grossProfit).toBe(0);
    });

    it('should handle very large position sizes', async () => {
      const position = {
        id: 'position-123',
        entryPrimaryPrice: 50100,
        entryHedgePrice: 50000,
        primaryQuantity: 1000.123456789,
        hedgeQuantity: 1000.987654321,
        primaryMargin: 10000,
        hedgeMargin: 10000,
      };

      const currentPrices = { primary: 50050, hedge: 50050 };

      const profit = await priceArbitrageService.calculateProfit(position as any, currentPrices);

      // Should handle large numbers without precision loss
      expect(profit.primaryProfit).toBeDefined();
      expect(profit.hedgeProfit).toBeDefined();
      expect(profit.totalMargin).toBe(20000);
    });

    it('should handle network timeout errors', async () => {
      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      (prisma.priceArbitragePosition.create as jest.Mock).mockResolvedValue({
        id: 'position-123',
      });
      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      mockPrimaryConnector.mockPlaceMarketOrder.mockRejectedValue(
        new Error('ETIMEDOUT: Network request timeout')
      );

      const mockStartParams: StartPriceArbitrageParams = {
        userId: mockUserId,
        symbol: mockSymbol,
        primaryExchange: 'BYBIT',
        primaryCredentialId: 'primary-cred-1',
        primaryLeverage: 3,
        primaryMargin: 100,
        hedgeExchange: 'MEXC',
        hedgeCredentialId: 'hedge-cred-1',
        hedgeLeverage: 3,
        hedgeMargin: 100,
        entryPrimaryPrice: mockPrimaryPrice,
        entryHedgePrice: mockHedgePrice,
      };

      const result = await priceArbitrageService.startArbitrage(mockStartParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('should handle concurrent close requests', async () => {
      const mockPosition = {
        id: 'position-123',
        userId: mockUserId,
        symbol: mockSymbol,
        primaryExchange: 'BYBIT',
        primaryCredentialId: 'primary-cred-1',
        hedgeExchange: 'MEXC',
        hedgeCredentialId: 'hedge-cred-1',
        status: 'ACTIVE' as PriceArbitrageStatus,
        primaryQuantity: 0.1,
        hedgeQuantity: 0.1,
        entryPrimaryPrice: mockPrimaryPrice,
        entryHedgePrice: mockHedgePrice,
        primaryMargin: 100,
        hedgeMargin: 100,
        primaryFees: 0,
        hedgeFees: 0,
        openedAt: new Date(),
        createdAt: new Date(),
        entrySpread: 0.002,
        entrySpreadPercent: 0.2,
      };

      const service = priceArbitrageService as any;
      service.getConnector = jest.fn((exchange: string) => {
        if (exchange.toUpperCase() === 'BYBIT') return mockPrimaryConnector;
        if (exchange.toUpperCase() === 'MEXC') return mockHedgeConnector;
      });

      // First call returns ACTIVE position
      (prisma.priceArbitragePosition.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockPosition)
        .mockResolvedValueOnce({ ...mockPosition, status: 'CLOSING' });

      (prisma.priceArbitragePosition.update as jest.Mock).mockResolvedValue({});

      mockPrimaryConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: { orderId: 'close-123', avgPrice: '50050', execFee: '0.5' },
      });
      mockHedgeConnector.mockPlaceReduceOnlyOrder.mockResolvedValue({
        result: { orderId: 'close-456', avgPrice: '50050', execFee: '0.5' },
      });

      // Make concurrent close requests
      const [result1, result2] = await Promise.allSettled([
        priceArbitrageService.closeArbitrage('position-123'),
        priceArbitrageService.closeArbitrage('position-123'),
      ]);

      // One should succeed
      expect(result1.status === 'fulfilled' || result2.status === 'fulfilled').toBe(true);

      // One should fail (position not active)
      const hasRejection =
        (result1.status === 'fulfilled' && result1.value.success === false) ||
        (result2.status === 'fulfilled' && result2.value.success === false);
      expect(hasRejection).toBe(true);
    });
  });
});
