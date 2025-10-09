import { ConnectorStateCacheService, ConnectorState } from '../connector-state-cache.service';
import prisma from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  connectorStateCache: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  fundingArbitrageSubscription: {
    findMany: jest.fn(),
  },
}));

describe('ConnectorStateCacheService', () => {
  const mockUserId = 'user123';
  const mockCredentialId = 'cred456';
  const mockCacheKey = `${mockUserId}_${mockCredentialId}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return null on cache miss', async () => {
      (prisma.connectorStateCache.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await ConnectorStateCacheService.get(mockUserId, mockCredentialId);

      expect(result).toBeNull();
      expect(prisma.connectorStateCache.findUnique).toHaveBeenCalledWith({
        where: { cacheKey: mockCacheKey },
      });
    });

    it('should return null on expired cache', async () => {
      const expiredDate = new Date(Date.now() - 1000); // 1 second ago

      (prisma.connectorStateCache.findUnique as jest.Mock).mockResolvedValue({
        cacheKey: mockCacheKey,
        userId: mockUserId,
        credentialId: mockCredentialId,
        exchange: 'BYBIT',
        environment: 'TESTNET',
        timeOffset: 100,
        lastSyncTime: new Date(),
        expiresAt: expiredDate,
        isValid: true,
        hitCount: 5,
      });

      (prisma.connectorStateCache.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await ConnectorStateCacheService.get(mockUserId, mockCredentialId);

      expect(result).toBeNull();
      expect(prisma.connectorStateCache.updateMany).toHaveBeenCalled();
    });

    it('should return cached state on cache hit', async () => {
      const futureDate = new Date(Date.now() + 900000); // 15 minutes from now
      const syncTime = new Date();

      (prisma.connectorStateCache.findUnique as jest.Mock).mockResolvedValue({
        cacheKey: mockCacheKey,
        userId: mockUserId,
        credentialId: mockCredentialId,
        exchange: 'BYBIT',
        environment: 'TESTNET',
        timeOffset: 100,
        lastSyncTime: syncTime,
        expiresAt: futureDate,
        isValid: true,
        hitCount: 5,
        metadata: { test: 'data' },
      });

      (prisma.connectorStateCache.update as jest.Mock).mockResolvedValue({});

      const result = await ConnectorStateCacheService.get(mockUserId, mockCredentialId);

      expect(result).toEqual({
        timeOffset: 100,
        lastSyncTime: syncTime,
        metadata: { test: 'data' },
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.connectorStateCache.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await ConnectorStateCacheService.get(mockUserId, mockCredentialId);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should cache connector state', async () => {
      const state: ConnectorState = {
        timeOffset: 150,
        lastSyncTime: new Date(),
        metadata: { foo: 'bar' },
      };

      (prisma.connectorStateCache.upsert as jest.Mock).mockResolvedValue({});

      await ConnectorStateCacheService.set(
        mockUserId,
        mockCredentialId,
        'BYBIT',
        'TESTNET',
        state
      );

      expect(prisma.connectorStateCache.upsert).toHaveBeenCalled();
      const callArgs = (prisma.connectorStateCache.upsert as jest.Mock).mock.calls[0][0];

      expect(callArgs.where.cacheKey).toBe(mockCacheKey);
      expect(callArgs.create.timeOffset).toBe(150);
      expect(callArgs.create.exchange).toBe('BYBIT');
    });

    it('should use default TTL if not specified', async () => {
      const state: ConnectorState = {
        timeOffset: 150,
        lastSyncTime: new Date(),
      };

      (prisma.connectorStateCache.upsert as jest.Mock).mockResolvedValue({});

      await ConnectorStateCacheService.set(
        mockUserId,
        mockCredentialId,
        'BINGX',
        'MAINNET',
        state
      );

      const callArgs = (prisma.connectorStateCache.upsert as jest.Mock).mock.calls[0][0];
      const expiresAt = callArgs.create.expiresAt;
      const now = Date.now();

      // Should expire in ~15 minutes (with some tolerance)
      expect(expiresAt.getTime()).toBeGreaterThan(now + 14 * 60 * 1000);
      expect(expiresAt.getTime()).toBeLessThan(now + 16 * 60 * 1000);
    });
  });

  describe('invalidate', () => {
    it('should mark cache as invalid', async () => {
      (prisma.connectorStateCache.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await ConnectorStateCacheService.invalidate(mockUserId, mockCredentialId);

      expect(prisma.connectorStateCache.updateMany).toHaveBeenCalledWith({
        where: { cacheKey: mockCacheKey },
        data: { isValid: false },
      });
    });
  });

  describe('delete', () => {
    it('should delete cache entry', async () => {
      (prisma.connectorStateCache.delete as jest.Mock).mockResolvedValue({});

      await ConnectorStateCacheService.delete(mockUserId, mockCredentialId);

      expect(prisma.connectorStateCache.delete).toHaveBeenCalledWith({
        where: { cacheKey: mockCacheKey },
      });
    });

    it('should handle not found gracefully', async () => {
      const notFoundError: any = new Error('Not found');
      notFoundError.code = 'P2025';

      (prisma.connectorStateCache.delete as jest.Mock).mockRejectedValue(notFoundError);

      await expect(
        ConnectorStateCacheService.delete(mockUserId, mockCredentialId)
      ).resolves.not.toThrow();
    });
  });

  describe('cleanupExpired', () => {
    it('should delete expired cache entries', async () => {
      (prisma.connectorStateCache.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      const result = await ConnectorStateCacheService.cleanupExpired();

      expect(result).toBe(5);
      expect(prisma.connectorStateCache.deleteMany).toHaveBeenCalled();

      const callArgs = (prisma.connectorStateCache.deleteMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.OR).toHaveLength(2);
      expect(callArgs.where.OR[0]).toHaveProperty('expiresAt');
      expect(callArgs.where.OR[1]).toEqual({ isValid: false });
    });

    it('should return 0 on database error', async () => {
      (prisma.connectorStateCache.deleteMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await ConnectorStateCacheService.cleanupExpired();

      expect(result).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 900000);
      const past = new Date(now.getTime() - 900000);

      (prisma.connectorStateCache.findMany as jest.Mock).mockResolvedValue([
        {
          cacheKey: 'key1',
          userId: 'user1',
          credentialId: 'cred1',
          exchange: 'BYBIT',
          environment: 'TESTNET',
          timeOffset: 100,
          lastSyncTime: now,
          expiresAt: future,
          isValid: true,
          hitCount: 10,
        },
        {
          cacheKey: 'key2',
          userId: 'user2',
          credentialId: 'cred2',
          exchange: 'BINGX',
          environment: 'MAINNET',
          timeOffset: 200,
          lastSyncTime: now,
          expiresAt: past,
          isValid: false,
          hitCount: 5,
        },
        {
          cacheKey: 'key3',
          userId: 'user3',
          credentialId: 'cred3',
          exchange: 'BYBIT',
          environment: 'MAINNET',
          timeOffset: 150,
          lastSyncTime: now,
          expiresAt: future,
          isValid: true,
          hitCount: 20,
        },
      ]);

      const stats = await ConnectorStateCacheService.getStats();

      expect(stats.total).toBe(3);
      expect(stats.valid).toBe(2);
      expect(stats.expired).toBe(1);
      expect(stats.totalHits).toBe(35);
      expect(stats.byExchange).toEqual({
        BYBIT: 2,
        BINGX: 1,
      });
    });

    it('should return empty stats on error', async () => {
      (prisma.connectorStateCache.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const stats = await ConnectorStateCacheService.getStats();

      expect(stats.total).toBe(0);
      expect(stats.valid).toBe(0);
      expect(stats.expired).toBe(0);
      expect(stats.totalHits).toBe(0);
      expect(stats.byExchange).toEqual({});
    });
  });

  describe('warmCacheForActiveSubscriptions', () => {
    it('should return count of unique credentials', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockResolvedValue([
        {
          userId: 'user1',
          primaryCredentialId: 'cred1',
          hedgeCredentialId: 'cred2',
        },
        {
          userId: 'user1',
          primaryCredentialId: 'cred1', // Duplicate
          hedgeCredentialId: 'cred3',
        },
        {
          userId: 'user2',
          primaryCredentialId: 'cred4',
          hedgeCredentialId: null,
        },
      ]);

      const count = await ConnectorStateCacheService.warmCacheForActiveSubscriptions();

      // unique: user1_cred1, user1_cred2, user1_cred3, user2_cred4
      expect(count).toBe(4);
    });

    it('should handle database errors', async () => {
      (prisma.fundingArbitrageSubscription.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const count = await ConnectorStateCacheService.warmCacheForActiveSubscriptions();

      expect(count).toBe(0);
    });
  });
});
