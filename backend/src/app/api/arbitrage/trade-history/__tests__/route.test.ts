import { NextRequest } from 'next/server';
import { GET } from '../route';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { FundingArbitrageStatus, ArbitrageMode } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    fundingArbitrageSubscription: {
      findMany: jest.fn(),
    },
  },
}));

describe('GET /api/arbitrage/trade-history', () => {
  const mockUserId = 'test-user-123';
  const mockAuthResult = {
    success: true,
    user: {
      userId: mockUserId,
      email: 'test@example.com',
      role: 'BASIC',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Mock failed authentication
      (AuthService.authenticateRequest as jest.Mock).mockResolvedValue({
        success: false,
        user: null,
        error: 'Invalid token',
      });

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
      expect(data.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('Parameter Validation', () => {
    beforeEach(() => {
      // Mock successful authentication
      (AuthService.authenticateRequest as jest.Mock).mockResolvedValue(mockAuthResult);
    });

    it('should return 400 if symbol parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required parameters');
      expect(data.code).toBe('MISSING_PARAMETERS');
    });

    it('should return 400 if exchange parameter is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required parameters');
      expect(data.code).toBe('MISSING_PARAMETERS');
    });

    it('should return 400 if limit is not a positive integer', async () => {
      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT&limit=-10');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid limit');
      expect(data.code).toBe('INVALID_LIMIT');
    });

    it('should cap limit at 200', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT&limit=500');

      await GET(request);

      expect(prisma.fundingArbitrageSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 200, // Should be capped at 200
        })
      );
    });
  });

  describe('Database Query', () => {
    beforeEach(() => {
      (AuthService.authenticateRequest as jest.Mock).mockResolvedValue(mockAuthResult);
    });

    it('should query with correct filters', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT&limit=50');

      await GET(request);

      expect(prisma.fundingArbitrageSubscription.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          symbol: 'BTCUSDT',
          primaryExchange: 'BYBIT',
          status: {
            in: ['COMPLETED', 'CANCELLED', 'ERROR'],
          },
          closedAt: {
            not: null,
          },
        },
        orderBy: {
          closedAt: 'desc',
        },
        take: 50,
      });
    });

    it('should use default limit of 50 if not provided', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      await GET(request);

      expect(prisma.fundingArbitrageSubscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });
  });

  describe('Response Transformation', () => {
    beforeEach(() => {
      (AuthService.authenticateRequest as jest.Mock).mockResolvedValue(mockAuthResult);
    });

    it('should transform database records to DTOs correctly', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-1',
          userId: mockUserId,
          symbol: 'BTCUSDT',
          fundingRate: 0.0001,
          nextFundingTime: new Date('2025-01-15T16:00:00Z'),
          positionType: 'long',
          quantity: 0.02,
          leverage: 10,
          margin: 100,
          mode: 'HEDGED' as ArbitrageMode,
          takeProfit: null,
          stopLoss: null,
          primaryExchange: 'BYBIT',
          primaryCredentialId: 'cred-1',
          hedgeExchange: 'BINGX',
          hedgeCredentialId: 'cred-2',
          status: 'COMPLETED' as FundingArbitrageStatus,
          errorMessage: null,
          entryPrice: 50000,
          hedgeEntryPrice: 50000,
          fundingEarned: 10.5,
          realizedPnl: 8.3,
          primaryExitPrice: 50005,
          hedgeExitPrice: 50005,
          primaryTradingFees: 1.5,
          hedgeTradingFees: 1.2,
          createdAt: new Date('2025-01-15T15:55:00Z'),
          updatedAt: new Date('2025-01-15T16:00:05Z'),
          executedAt: new Date('2025-01-15T16:00:00Z'),
          closedAt: new Date('2025-01-15T16:00:05Z'),
        },
      ];

      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue(mockSubscriptions);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(1);
      expect(data.data).toHaveLength(1);

      const trade = data.data[0];
      expect(trade).toMatchObject({
        id: 'sub-1',
        symbol: 'BTCUSDT',
        executedAt: '2025-01-15T16:00:00.000Z',
        closedAt: '2025-01-15T16:00:05.000Z',
        positionSizeUsdt: 1000, // margin * leverage = 100 * 10
        fundingEarned: 10.5,
        realizedPnl: 8.3,
        entryPrice: 50000,
        exitPrice: 50005,
        leverage: 10,
        quantity: 0.02,
        status: 'COMPLETED',
        margin: 100,
        primaryExchange: 'BYBIT',
        hedgeExchange: 'BINGX',
        mode: 'HEDGED',
        positionType: 'long',
        fundingRate: 0.0001,
        primaryTradingFees: 1.5,
        hedgeTradingFees: 1.2,
        totalFees: 2.7, // 1.5 + 1.2
      });
      // Check netPnl separately with precision tolerance
      expect(trade.netPnl).toBeCloseTo(5.6, 2); // 8.3 - 2.7
    });

    it('should calculate position size from quantity and entry price if margin is null', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-2',
          userId: mockUserId,
          symbol: 'ETHUSDT',
          fundingRate: 0.0002,
          nextFundingTime: new Date('2025-01-15T16:00:00Z'),
          positionType: 'short',
          quantity: 0.5,
          leverage: 5,
          margin: null, // No margin provided
          mode: 'NON_HEDGED' as ArbitrageMode,
          takeProfit: null,
          stopLoss: null,
          primaryExchange: 'BYBIT',
          primaryCredentialId: 'cred-1',
          hedgeExchange: null,
          hedgeCredentialId: null,
          status: 'COMPLETED' as FundingArbitrageStatus,
          errorMessage: null,
          entryPrice: 3000,
          hedgeEntryPrice: null,
          fundingEarned: 5.0,
          realizedPnl: 4.5,
          primaryExitPrice: 3005,
          hedgeExitPrice: null,
          primaryTradingFees: 0.5,
          hedgeTradingFees: null,
          createdAt: new Date('2025-01-15T15:55:00Z'),
          updatedAt: new Date('2025-01-15T16:00:05Z'),
          executedAt: new Date('2025-01-15T16:00:00Z'),
          closedAt: new Date('2025-01-15T16:00:05Z'),
        },
      ];

      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue(mockSubscriptions);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=ETHUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      const trade = data.data[0];
      expect(trade.positionSizeUsdt).toBe(1500); // quantity * entryPrice = 0.5 * 3000
    });

    it('should handle null fees correctly', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-3',
          userId: mockUserId,
          symbol: 'BTCUSDT',
          fundingRate: 0.0001,
          nextFundingTime: new Date('2025-01-15T16:00:00Z'),
          positionType: 'long',
          quantity: 0.02,
          leverage: 10,
          margin: 100,
          mode: 'HEDGED' as ArbitrageMode,
          takeProfit: null,
          stopLoss: null,
          primaryExchange: 'BYBIT',
          primaryCredentialId: 'cred-1',
          hedgeExchange: 'BINGX',
          hedgeCredentialId: 'cred-2',
          status: 'COMPLETED' as FundingArbitrageStatus,
          errorMessage: null,
          entryPrice: 50000,
          hedgeEntryPrice: 50000,
          fundingEarned: 10.0,
          realizedPnl: 10.0,
          primaryExitPrice: 50005,
          hedgeExitPrice: 50005,
          primaryTradingFees: null, // No fees recorded
          hedgeTradingFees: null,
          createdAt: new Date('2025-01-15T15:55:00Z'),
          updatedAt: new Date('2025-01-15T16:00:05Z'),
          executedAt: new Date('2025-01-15T16:00:00Z'),
          closedAt: new Date('2025-01-15T16:00:05Z'),
        },
      ];

      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue(mockSubscriptions);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      const trade = data.data[0];
      expect(trade.totalFees).toBe(0);
      expect(trade.netPnl).toBe(10.0); // realizedPnl - 0
    });

    it('should handle null realizedPnl correctly', async () => {
      const mockSubscriptions = [
        {
          id: 'sub-4',
          userId: mockUserId,
          symbol: 'BTCUSDT',
          fundingRate: 0.0001,
          nextFundingTime: new Date('2025-01-15T16:00:00Z'),
          positionType: 'long',
          quantity: 0.02,
          leverage: 10,
          margin: 100,
          mode: 'HEDGED' as ArbitrageMode,
          takeProfit: null,
          stopLoss: null,
          primaryExchange: 'BYBIT',
          primaryCredentialId: 'cred-1',
          hedgeExchange: 'BINGX',
          hedgeCredentialId: 'cred-2',
          status: 'ERROR' as FundingArbitrageStatus,
          errorMessage: 'Failed to close position',
          entryPrice: 50000,
          hedgeEntryPrice: 50000,
          fundingEarned: null,
          realizedPnl: null, // No P&L calculated
          primaryExitPrice: null,
          hedgeExitPrice: null,
          primaryTradingFees: null,
          hedgeTradingFees: null,
          createdAt: new Date('2025-01-15T15:55:00Z'),
          updatedAt: new Date('2025-01-15T16:00:05Z'),
          executedAt: new Date('2025-01-15T16:00:00Z'),
          closedAt: new Date('2025-01-15T16:00:05Z'),
        },
      ];

      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue(mockSubscriptions);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      const trade = data.data[0];
      expect(trade.realizedPnl).toBeNull();
      expect(trade.netPnl).toBeNull();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (AuthService.authenticateRequest as jest.Mock).mockResolvedValue(mockAuthResult);
    });

    it('should return 500 if database query fails', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockRejectedValue(new Error('Database connection error'));

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to retrieve trade history');
      expect(data.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Empty Results', () => {
    beforeEach(() => {
      (AuthService.authenticateRequest as jest.Mock).mockResolvedValue(mockAuthResult);
    });

    it('should return empty array if no trades found', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(0);
      expect(data.data).toEqual([]);
    });
  });
});
