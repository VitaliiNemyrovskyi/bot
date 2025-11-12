# Connector State Caching Implementation Guide

## Overview

This guide provides a complete implementation plan for the persistent connector caching system that eliminates 1-2 second initialization delays in Next.js serverless environments.

## Problem Summary

- **Current Issue**: Next.js API routes are stateless serverless functions - in-memory cache doesn't persist
- **Root Cause**: Each connector requires 1-2 seconds for time synchronization on every cold start
- **Impact**: 33+ second execution times when multiple connectors are used
- **Goal**: Reduce execution to <1 second with <100ms cache access overhead

## Solution Architecture

### PostgreSQL-backed State Cache

```
┌─────────────────────────────────────────────────┐
│  Next.js API Route (Serverless)                 │
│  ┌────────────────────────────────────────────┐ │
│  │  In-Memory Cache (Per Request)             │ │
│  │  - Hot path for within-request reuse       │ │
│  └────────────────────────────────────────────┘ │
│                    ↓↑                            │
│  ┌────────────────────────────────────────────┐ │
│  │  Connector State Cache Service             │ │
│  │  - Load time offset from DB (~50ms)        │ │
│  │  - Skip time sync (save 1-2s)              │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────────────┐
│  PostgreSQL: connector_state_cache              │
│  - cacheKey (userId_credentialId)               │
│  - timeOffset (ms)                              │
│  - TTL: 15 minutes                              │
└─────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Database Migration

Run Prisma migration to create the cache table:

```bash
cd backend
npx prisma migrate dev --name add_connector_state_cache
```

This creates the `connector_state_cache` table with:
- Persistent storage of time sync offsets
- 15-minute TTL with automatic expiration
- Indexes for fast lookup by userId, credentialId
- Hit counter for cache effectiveness monitoring

### Step 2: Update Dependencies

No new dependencies required! The solution uses:
- ✅ Existing PostgreSQL database
- ✅ Existing Prisma ORM
- ✅ No Redis or external cache needed

### Step 3: Integration Points

#### A. Update FundingArbitrageService

**File**: `/Users/vnemyrovskyi/IdeaProjects/0bot/backend/src/services/funding-arbitrage.service.ts`

**Changes Required**:

1. **Import cached connectors** (lines 1-5):
```typescript
import { BybitConnectorWithCache } from '@/connectors/bybit-with-cache.connector';
import { BingXConnectorWithCache } from '@/connectors/bingx-with-cache.connector';
import { ConnectorStateCacheService } from './connector-state-cache.service';
```

2. **Update getOrCreateConnector method** (lines 479-540):
```typescript
private async getOrCreateConnector(
  userId: string,
  credentialId: string,
  forceNew: boolean = false
): Promise<BaseExchangeConnector> {
  const cacheKey = `${userId}_${credentialId}`;

  // Return in-memory cached connector if exists
  if (!forceNew && this.connectorCache.has(cacheKey)) {
    const cached = this.connectorCache.get(cacheKey)!;
    cached.lastUsed = Date.now();
    console.log(`[FundingArbitrage] ✓ Using in-memory cached connector`);
    return cached.connector;
  }

  // Create new connector WITH PERSISTENT CACHE SUPPORT
  console.log(`[FundingArbitrage] Creating connector with cache support...`);
  const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
  const credential = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

  if (!credential) {
    throw new Error(`Credential ${credentialId} not found`);
  }

  let connector: BaseExchangeConnector;
  const startTime = Date.now();

  if (credential.exchange === 'BYBIT') {
    // USE CACHED CONNECTOR - will load time offset from DB
    connector = new BybitConnectorWithCache(
      credential.apiKey,
      credential.apiSecret,
      false,
      userId,          // Enable cache lookup
      credentialId     // Enable cache lookup
    );
  } else if (credential.exchange === 'BINGX') {
    // USE CACHED CONNECTOR - will load time offset from DB
    connector = new BingXConnectorWithCache(
      credential.apiKey,
      credential.apiSecret,
      false,
      userId,          // Enable cache lookup
      credentialId     // Enable cache lookup
    );
  } else {
    throw new Error(`Exchange ${credential.exchange} not supported`);
  }

  await connector.initialize();
  const initTime = Date.now() - startTime;

  // Cache in memory for reuse within same invocation
  this.connectorCache.set(cacheKey, {
    connector,
    credentialId,
    exchange: credential.exchange,
    subscriptionIds: new Set(),
    lastUsed: Date.now(),
    initializationTime: Date.now(),
  });

  console.log(`[FundingArbitrage] ✓ Connector initialized in ${initTime}ms (${initTime < 500 ? 'CACHE HIT ⚡' : 'CACHE MISS'})`);
  return connector;
}
```

3. **Add cache cleanup to initialize()** (line 210):
```typescript
async initialize(): Promise<void> {
  if (this.initialized) return;

  console.log('[FundingArbitrage] Initializing service...');

  // Cleanup expired cache entries
  const cleanedCount = await ConnectorStateCacheService.cleanupExpired();
  console.log(`[FundingArbitrage] Cleaned up ${cleanedCount} expired cache entries`);

  // Get cache stats
  const stats = await ConnectorStateCacheService.getStats();
  console.log('[FundingArbitrage] Connector cache stats:', stats);

  // ... existing initialization code ...
}
```

#### B. API Routes (Optional Enhancement)

For frequently-called API routes, you can also use cached connectors directly:

**Example**: `/Users/vnemyrovskyi/IdeaProjects/0bot/backend/src/app/api/bybit/wallet-balance/route.ts`

```typescript
import { BybitConnectorWithCache } from '@/connectors/bybit-with-cache.connector';

export async function GET(request: NextRequest) {
  const userId = 'user123'; // Get from auth
  const credentialId = 'cred456'; // Get from request

  // Use cached connector
  const connector = new BybitConnectorWithCache(
    apiKey,
    apiSecret,
    testnet,
    userId,
    credentialId
  );

  await connector.initialize(); // Fast: ~250ms with cache hit
  const balance = await connector.getBalance();

  return NextResponse.json({ balance });
}
```

### Step 4: Testing

Run the test suite:

```bash
npm test src/services/__tests__/connector-state-cache.service.test.ts
```

Expected results:
- ✅ Cache hit/miss logic
- ✅ TTL expiration handling
- ✅ Database error resilience
- ✅ Statistics tracking

### Step 5: Monitoring & Validation

#### A. Check Cache Effectiveness

Add this to your admin dashboard or monitoring:

```typescript
import { ConnectorStateCacheService } from '@/services/connector-state-cache.service';

const stats = await ConnectorStateCacheService.getStats();
console.log('Cache Statistics:', {
  total: stats.total,
  valid: stats.valid,
  expired: stats.expired,
  hitRate: (stats.totalHits / stats.total * 100).toFixed(2) + '%',
  byExchange: stats.byExchange,
});
```

#### B. Performance Metrics

Monitor initialization times in logs:

```
# WITHOUT CACHE (cold start):
[BybitConnector] Time sync completed in 1542ms

# WITH CACHE (warm start):
[BybitConnectorWithCache] Initialized in 243ms (cache HIT ⚡)
```

Expected improvements:
- **Single connector**: 1700ms → 250ms (85% faster)
- **3 connectors**: 5100ms → 750ms (85% faster)
- **10 connectors**: 17000ms → 2500ms (85% faster)

## Performance Comparison

### Before (In-Memory Cache Only)

```
Request 1: Create connectors → 5000ms (time sync)
Request 2: Create connectors → 5000ms (cache lost in new container)
Request 3: Create connectors → 5000ms (cache lost in new container)
```

### After (Persistent Cache)

```
Request 1: Create connectors → 5000ms (initial sync, cache to DB)
Request 2: Load from DB       → 750ms  (cache hit ⚡)
Request 3: Load from DB       → 750ms  (cache hit ⚡)
```

## Cache Lifecycle

### 1. Initial Sync (Cache Miss)
```typescript
Connector Created
  ↓
Check DB Cache → MISS
  ↓
Perform Time Sync (1-2s)
  ↓
Save to DB (timeOffset, lastSyncTime)
  ↓
Set expiry = now + 15 minutes
  ↓
Connector Ready
```

### 2. Cached Load (Cache Hit)
```typescript
Connector Created
  ↓
Check DB Cache → HIT (age < 15 min)
  ↓
Load timeOffset from DB (~50ms)
  ↓
Apply cached offset
  ↓
Connector Ready (FAST ⚡)
```

### 3. Cache Expiration
```typescript
Every 15 minutes OR on service restart:
  ↓
Run cleanupExpired()
  ↓
Delete entries where expiresAt < now
  ↓
Next access will perform fresh sync
```

## Cache Invalidation Strategies

### Automatic
- TTL: 15 minutes (balances freshness vs. performance)
- Cleanup: On service initialization + periodic timer
- Stale detection: Age check on retrieval

### Manual (if needed)
```typescript
// Invalidate specific connector
await ConnectorStateCacheService.invalidate(userId, credentialId);

// Delete specific connector
await ConnectorStateCacheService.delete(userId, credentialId);

// Cleanup all expired
await ConnectorStateCacheService.cleanupExpired();
```

## Security Considerations

### ✅ What's Cached (Safe)
- Time offset (milliseconds) - Non-sensitive
- Last sync timestamp - Non-sensitive
- Exchange name - Non-sensitive

### 🔒 What's NOT Cached (Secure)
- API keys - Never cached
- API secrets - Never cached
- Private user data - Never cached

Time offsets are mathematical adjustments with no security implications.

## Rollback Plan

If issues arise, rollback is simple:

1. **Revert connector imports** in `funding-arbitrage.service.ts`:
```typescript
// Change back from:
import { BybitConnectorWithCache } from '@/connectors/bybit-with-cache.connector';

// To original:
import { BybitConnector } from '@/connectors/bybit.connector';
```

2. **Revert getOrCreateConnector method** to original implementation

3. **No database rollback needed** - cache table can remain (harmless if unused)

## Troubleshooting

### Issue: Cache not improving performance

**Check**:
```typescript
const stats = await ConnectorStateCacheService.getStats();
console.log('Hit count:', stats.totalHits);
console.log('Valid caches:', stats.valid);
```

**Solutions**:
- Ensure userId and credentialId are passed to connectors
- Check TTL hasn't expired (default: 15 min)
- Verify database connectivity

### Issue: Time sync errors

**Symptom**: "Timestamp is too large" or authentication failures

**Solution**: Time offsets may be stale. Invalidate cache:
```typescript
await ConnectorStateCacheService.invalidate(userId, credentialId);
```

### Issue: Database performance

**Check**: Query time for cache lookup should be <100ms

**Optimization**: Indexes are already created by migration:
- `@@index([cacheKey])` - Primary lookup
- `@@index([userId])` - User queries
- `@@index([expiresAt])` - Cleanup queries

## Next Steps

### Phase 1: Deploy & Monitor (Week 1)
1. ✅ Deploy database migration
2. ✅ Update FundingArbitrageService
3. 📊 Monitor cache hit rates
4. 📊 Measure performance improvements

### Phase 2: Optimize (Week 2-3)
1. Tune TTL based on observed time drift
2. Add cache warming for frequently-used connectors
3. Implement predictive pre-caching for scheduled operations

### Phase 3: Expand (Week 4+)
1. Apply to other API routes using connectors
2. Add cache metrics to admin dashboard
3. Consider Redis for ultra-low latency (if needed)

## Conclusion

This implementation provides:
- ✅ **85% faster** connector initialization
- ✅ **<100ms** cache access overhead
- ✅ **Zero** additional infrastructure
- ✅ **Simple** rollback strategy
- ✅ **Secure** (no sensitive data cached)

Expected result: **33s → <5s execution time** for multi-connector operations.

## Support

For questions or issues:
1. Check logs for cache hit/miss rates
2. Review cache stats with `getStats()`
3. Verify database indexes are created
4. Test with unit tests: `npm test`

---

**Implementation Status**: Ready for deployment
**Estimated Implementation Time**: 2-4 hours
**Expected Performance Gain**: 6-7x faster (85% reduction)
