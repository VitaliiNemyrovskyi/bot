/**
 * BingX Service with State Caching Support
 *
 * Extension of BingXService that supports loading time sync state from cache
 * to eliminate 1-2 second initialization delay in serverless environments.
 */

import { BingXService, BingXConfig } from './bingx';
import { ConnectorStateCacheService, ConnectorState } from '@/services/connector-state-cache.service';

export interface BingXConfigWithCache extends BingXConfig {
  userId?: string;
  credentialId?: string;
  skipTimeSync?: boolean; // If true, try to load from cache
}

export class BingXServiceWithCache extends BingXService {
  private userId?: string;
  private credentialId?: string;

  constructor(config: BingXConfigWithCache) {
    super(config);
    this.userId = config.userId;
    this.credentialId = config.credentialId;
  }

  /**
   * Initialize with cached time offset (FAST PATH)
   * Falls back to regular time sync if cache miss
   */
  async initializeWithCache(): Promise<boolean> {
    // Try to load from cache first
    if (this.userId && this.credentialId) {
      const cached = await ConnectorStateCacheService.get(this.userId, this.credentialId);

      if (cached) {
        // Use cached time offset
        this.setTimeOffset(cached.timeOffset, cached.lastSyncTime.getTime());

        const age = Math.floor((Date.now() - cached.lastSyncTime.getTime()) / 1000);
        console.log(`[BingXServiceWithCache] Loaded cached time sync (age: ${age}s, offset: ${cached.timeOffset}ms)`);

        // Start periodic sync in background
        this.startPeriodicSync();

        return true; // Cache hit
      }
    }

    // Cache miss - perform full time sync
    // console.log('[BingXServiceWithCache] Cache miss - performing full time sync...');
    const startTime = Date.now();
    await this.syncTime();
    const syncDuration = Date.now() - startTime;

    console.log(`[BingXServiceWithCache] Time sync completed in ${syncDuration}ms`);

    // Cache the new time offset
    if (this.userId && this.credentialId) {
      await this.cacheTimeOffset();
    }

    // Start periodic sync
    this.startPeriodicSync();

    return false; // Cache miss
  }

  /**
   * Set time offset directly (for loading from cache)
   */
  private setTimeOffset(offset: number, lastSyncTime: number): void {
    // Access private properties via reflection (TypeScript workaround)
    (this as any).timeOffset = offset;
    (this as any).lastSyncTime = lastSyncTime;
  }

  /**
   * Cache current time offset to database
   */
  async cacheTimeOffset(): Promise<void> {
    if (!this.userId || !this.credentialId) {
      return;
    }

    const syncStatus = this.getTimeSyncStatus();

    const state: ConnectorState = {
      timeOffset: syncStatus.offset,
      lastSyncTime: new Date(syncStatus.lastSyncTime),
    };

    try {
      await ConnectorStateCacheService.set(
        this.userId,
        this.credentialId,
        'BINGX',
        (this as any).testnet ? 'TESTNET' : 'MAINNET',
        state
      );

      console.log(`[BingXServiceWithCache] Cached time offset: ${state.timeOffset}ms`);
    } catch (error: any) {
      console.error(`[BingXServiceWithCache] Failed to cache time offset:`, error.message);
    }
  }

  /**
   * Override syncTime to also update cache
   */
  async syncTime(): Promise<void> {
    await super.syncTime();

    // Update cache after sync
    if (this.userId && this.credentialId) {
      await this.cacheTimeOffset();
    }
  }
}
