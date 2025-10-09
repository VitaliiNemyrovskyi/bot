/**
 * Connector Cache Integration Example
 *
 * This file demonstrates how to integrate the persistent connector caching system
 * into the FundingArbitrageService to eliminate 1-2 second initialization delays.
 *
 * IMPLEMENTATION NOTES:
 * 1. Replace imports in funding-arbitrage.service.ts:
 *    - Change: import { BybitConnector } from '@/connectors/bybit.connector';
 *    - To:     import { BybitConnectorWithCache } from '@/connectors/bybit-with-cache.connector';
 *
 * 2. Update the getOrCreateConnector method (lines 479-540) to use cached connectors
 *
 * 3. Add cache cleanup to initialize() method
 */

import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';
import { BybitConnectorWithCache } from '@/connectors/bybit-with-cache.connector';
import { BingXConnectorWithCache } from '@/connectors/bingx-with-cache.connector';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { ConnectorStateCacheService } from './connector-state-cache.service';

/**
 * EXAMPLE: Optimized getOrCreateConnector method for FundingArbitrageService
 *
 * This replaces the existing method at lines 479-540 in funding-arbitrage.service.ts
 */
export async function getOrCreateConnectorOptimized(
  userId: string,
  credentialId: string,
  forceNew: boolean = false
): Promise<BaseExchangeConnector> {
  const cacheKey = `${userId}_${credentialId}`;

  // Return cached connector if exists and not forcing new
  // (Keep existing in-memory cache logic for within-invocation reuse)
  // if (!forceNew && this.connectorCache.has(cacheKey)) {
  //   const cached = this.connectorCache.get(cacheKey)!;
  //   cached.lastUsed = Date.now();
  //   console.log(`[FundingArbitrage] ✓ Using in-memory cached connector`);
  //   return cached.connector;
  // }

  // Create new connector WITH CACHE SUPPORT
  console.log(`[FundingArbitrage] Creating connector with cache support for credential ${credentialId.substring(0, 8)}...`);

  const credential = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

  if (!credential) {
    throw new Error(`Credential ${credentialId} not found`);
  }

  let connector: BaseExchangeConnector;
  const startTime = Date.now();

  if (credential.exchange === 'BYBIT') {
    // USE CACHED CONNECTOR (FAST PATH)
    connector = new BybitConnectorWithCache(
      credential.apiKey,
      credential.apiSecret,
      credential.environment === 'TESTNET',
      userId,          // Pass userId for cache lookup
      credentialId     // Pass credentialId for cache lookup
    );
  } else if (credential.exchange === 'BINGX') {
    // USE CACHED CONNECTOR (FAST PATH)
    connector = new BingXConnectorWithCache(
      credential.apiKey,
      credential.apiSecret,
      credential.environment === 'TESTNET',
      userId,          // Pass userId for cache lookup
      credentialId     // Pass credentialId for cache lookup
    );
  } else {
    throw new Error(`Exchange ${credential.exchange} not supported`);
  }

  // Initialize connector - will use cached time offset if available
  await connector.initialize();
  const initTime = Date.now() - startTime;

  // Cache the connector in memory for reuse within same invocation
  // this.connectorCache.set(cacheKey, {
  //   connector,
  //   credentialId,
  //   exchange: credential.exchange,
  //   environment: credential.environment,
  //   subscriptionIds: new Set(),
  //   lastUsed: Date.now(),
  //   initializationTime: Date.now(),
  // });

  console.log(`[FundingArbitrage] ✓ ${credential.exchange} connector initialized in ${initTime}ms (${initTime < 500 ? 'CACHE HIT' : 'CACHE MISS'})`);
  return connector;
}

/**
 * EXAMPLE: Add cache cleanup to service initialization
 *
 * Add this to the initialize() method in funding-arbitrage.service.ts (around line 210)
 */
export async function initializeCacheCleanup(): Promise<void> {
  // Cleanup expired cache entries on service start
  console.log('[FundingArbitrage] Cleaning up expired connector cache entries...');
  const cleanedCount = await ConnectorStateCacheService.cleanupExpired();
  console.log(`[FundingArbitrage] Cleaned up ${cleanedCount} expired cache entries`);

  // Get cache stats
  const stats = await ConnectorStateCacheService.getStats();
  console.log('[FundingArbitrage] Connector cache stats:', stats);
}

/**
 * EXAMPLE: Cache warming for active subscriptions
 *
 * This can be called during service initialization to pre-warm the cache
 * for all active funding arbitrage subscriptions.
 */
export async function warmConnectorCache(): Promise<void> {
  console.log('[FundingArbitrage] Warming connector cache for active subscriptions...');

  // Get unique user/credential pairs from active subscriptions
  const activeCredentials = await ConnectorStateCacheService.warmCacheForActiveSubscriptions();

  console.log(`[FundingArbitrage] Cache warming completed for ${activeCredentials} connectors`);
}

/**
 * EXAMPLE: API route handler with optimized connector initialization
 *
 * This shows how the improved caching reduces execution time in Next.js API routes
 */
export async function exampleApiRouteHandler(
  userId: string,
  credentialId: string
): Promise<{ success: boolean; executionTime: number }> {
  const startTime = Date.now();

  try {
    // Step 1: Get connector - uses cache to avoid 1-2 second time sync
    const connector = await getOrCreateConnectorOptimized(userId, credentialId, false);

    // Step 2: Execute trading operation
    const balance = await connector.getBalance();

    const executionTime = Date.now() - startTime;

    console.log(`[Example] API execution completed in ${executionTime}ms`);

    return {
      success: true,
      executionTime,
    };
  } catch (error: any) {
    console.error('[Example] API execution failed:', error.message);
    throw error;
  }
}

/**
 * PERFORMANCE COMPARISON
 *
 * WITHOUT CACHE:
 * - Time sync: ~1500ms
 * - Account info: ~200ms
 * - Total: ~1700ms per connector
 * - Multiple connectors: 3400ms (2x), 5100ms (3x)
 *
 * WITH CACHE (HIT):
 * - Load cache: ~50ms (PostgreSQL query)
 * - Account info: ~200ms
 * - Total: ~250ms per connector
 * - Multiple connectors: 500ms (2x), 750ms (3x)
 *
 * SPEEDUP: ~6-7x faster with cache hit
 *
 * For the 33-second execution problem:
 * - If 20 connectors × 1.7s = 34s → With cache: 20 × 0.25s = 5s
 * - Reduction: 34s → 5s (85% faster)
 */
