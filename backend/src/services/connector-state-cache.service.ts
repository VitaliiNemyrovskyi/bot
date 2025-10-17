import prisma from '@/lib/prisma';

/**
 * Connector State Cache Interface
 */
export interface ConnectorState {
  timeOffset: number; // Time offset in milliseconds
  lastSyncTime: Date; // When time was last synchronized
  metadata?: Record<string, any>; // Additional exchange-specific state
}

export interface CachedConnectorState extends ConnectorState {
  cacheKey: string;
  userId: string;
  credentialId: string;
  exchange: string;
  expiresAt: Date;
  hitCount: number;
}

/**
 * Connector State Cache Service
 *
 * Provides persistent caching of connector authentication state (primarily time synchronization)
 * to eliminate 1-2 second initialization delays in Next.js serverless functions.
 *
 * Key Features:
 * - PostgreSQL-backed persistence across serverless invocations
 * - 15-minute TTL for time sync state
 * - <100ms cache retrieval time
 * - Automatic cache invalidation and cleanup
 */
export class ConnectorStateCacheService {
  private static readonly DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly CLEANUP_BATCH_SIZE = 100;

  /**
   * Generate cache key from user ID and credential ID
   */
  private static getCacheKey(userId: string, credentialId: string): string {
    return `${userId}_${credentialId}`;
  }

  /**
   * Get cached connector state
   * Returns null if cache miss or expired
   */
  static async get(userId: string, credentialId: string): Promise<ConnectorState | null> {
    const cacheKey = this.getCacheKey(userId, credentialId);
    const now = new Date();

    try {
      const cached = await prisma.connectorStateCache.findUnique({
        where: { cacheKey },
      });

      // Cache miss
      if (!cached) {
        console.log(`[ConnectorStateCache] Cache MISS: ${cacheKey}`);
        return null;
      }

      // Cache expired
      if (cached.expiresAt < now || !cached.isValid) {
        console.log(`[ConnectorStateCache] Cache EXPIRED: ${cacheKey} (expired at: ${cached.expiresAt.toISOString()})`);
        // Delete expired entry
        await this.invalidate(userId, credentialId);
        return null;
      }

      // Cache HIT - increment hit counter
      await prisma.connectorStateCache.update({
        where: { cacheKey },
        data: { hitCount: cached.hitCount + 1 },
      });

      const age = Math.floor((now.getTime() - cached.lastSyncTime.getTime()) / 1000);
      console.log(`[ConnectorStateCache] Cache HIT: ${cacheKey} (age: ${age}s, hits: ${cached.hitCount + 1})`);

      return {
        timeOffset: cached.timeOffset,
        lastSyncTime: cached.lastSyncTime,
        metadata: cached.metadata as Record<string, any> | undefined,
      };
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error reading cache for ${cacheKey}:`, error.message);
      return null;
    }
  }

  /**
   * Set/update cached connector state
   */
  static async set(
    userId: string,
    credentialId: string,
    exchange: string,
    state: ConnectorState,
    ttlMs: number = this.DEFAULT_TTL_MS
  ): Promise<void> {
    const cacheKey = this.getCacheKey(userId, credentialId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    try {
      await prisma.connectorStateCache.upsert({
        where: { cacheKey },
        create: {
          cacheKey,
          userId,
          credentialId,
          exchange,
          timeOffset: state.timeOffset,
          lastSyncTime: state.lastSyncTime,
          expiresAt,
          metadata: state.metadata || {},
          hitCount: 0,
        },
        update: {
          timeOffset: state.timeOffset,
          lastSyncTime: state.lastSyncTime,
          expiresAt,
          metadata: state.metadata || {},
          isValid: true,
        },
      });

      console.log(`[ConnectorStateCache] Cached state for ${cacheKey} (expires: ${expiresAt.toISOString()})`);
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error caching state for ${cacheKey}:`, error.message);
      throw error;
    }
  }

  /**
   * Invalidate cached state (mark as invalid without deleting)
   */
  static async invalidate(userId: string, credentialId: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId, credentialId);

    try {
      await prisma.connectorStateCache.updateMany({
        where: { cacheKey },
        data: { isValid: false },
      });

      console.log(`[ConnectorStateCache] Invalidated cache: ${cacheKey}`);
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error invalidating cache for ${cacheKey}:`, error.message);
    }
  }

  /**
   * Delete cached state
   */
  static async delete(userId: string, credentialId: string): Promise<void> {
    const cacheKey = this.getCacheKey(userId, credentialId);

    try {
      await prisma.connectorStateCache.delete({
        where: { cacheKey },
      });

      console.log(`[ConnectorStateCache] Deleted cache: ${cacheKey}`);
    } catch (error: any) {
      // Ignore if not found
      if (error.code !== 'P2025') {
        console.error(`[ConnectorStateCache] Error deleting cache for ${cacheKey}:`, error.message);
      }
    }
  }

  /**
   * Get all cached states for a user
   */
  static async getUserCaches(userId: string): Promise<CachedConnectorState[]> {
    try {
      const caches = await prisma.connectorStateCache.findMany({
        where: { userId },
        orderBy: { lastSyncTime: 'desc' },
      });

      return caches.map((cache) => ({
        cacheKey: cache.cacheKey,
        userId: cache.userId,
        credentialId: cache.credentialId,
        exchange: cache.exchange,
        timeOffset: cache.timeOffset,
        lastSyncTime: cache.lastSyncTime,
        expiresAt: cache.expiresAt,
        hitCount: cache.hitCount,
        metadata: cache.metadata as Record<string, any> | undefined,
      }));
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error fetching user caches:`, error.message);
      return [];
    }
  }

  /**
   * Cleanup expired cache entries
   * Should be called periodically (e.g., via cron job or on service initialization)
   */
  static async cleanupExpired(): Promise<number> {
    const now = new Date();

    try {
      const result = await prisma.connectorStateCache.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { isValid: false },
          ],
        },
      });

      if (result.count > 0) {
        console.log(`[ConnectorStateCache] Cleaned up ${result.count} expired cache entries`);
      }

      return result.count;
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error cleaning up expired caches:`, error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{
    total: number;
    valid: number;
    expired: number;
    totalHits: number;
    byExchange: Record<string, number>;
  }> {
    const now = new Date();

    try {
      const all = await prisma.connectorStateCache.findMany();

      const stats = {
        total: all.length,
        valid: all.filter((c) => c.isValid && c.expiresAt > now).length,
        expired: all.filter((c) => !c.isValid || c.expiresAt < now).length,
        totalHits: all.reduce((sum, c) => sum + c.hitCount, 0),
        byExchange: all.reduce((acc, c) => {
          acc[c.exchange] = (acc[c.exchange] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error fetching stats:`, error.message);
      return {
        total: 0,
        valid: 0,
        expired: 0,
        totalHits: 0,
        byExchange: {},
      };
    }
  }

  /**
   * Warm cache for active subscriptions
   * Pre-loads connector states for all active funding arbitrage subscriptions
   */
  static async warmCacheForActiveSubscriptions(): Promise<number> {
    try {
      // Get all active subscriptions
      const activeSubscriptions = await prisma.fundingArbitrageSubscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'WAITING', 'EXECUTING'] },
        },
        select: {
          userId: true,
          primaryCredentialId: true,
          hedgeCredentialId: true,
        },
      });

      // Extract unique credential IDs
      const credentialIds = new Set<string>();
      activeSubscriptions.forEach((sub) => {
        credentialIds.add(`${sub.userId}_${sub.primaryCredentialId}`);
        if (sub.hedgeCredentialId) {
          credentialIds.add(`${sub.userId}_${sub.hedgeCredentialId}`);
        }
      });

      console.log(`[ConnectorStateCache] Warming cache for ${credentialIds.size} active connectors...`);

      // Note: Actual warming would require initializing connectors
      // This is a placeholder - implement in FundingArbitrageService.initialize()
      return credentialIds.size;
    } catch (error: any) {
      console.error(`[ConnectorStateCache] Error warming cache:`, error.message);
      return 0;
    }
  }
}
