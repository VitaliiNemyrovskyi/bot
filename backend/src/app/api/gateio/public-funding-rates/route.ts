import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redisService } from '@/lib/redis';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

/**
 * Public Gate.io Funding Rates with Redis + DB Cache
 *
 * Multi-layer caching approach:
 * 1. Check Redis cache (fastest)
 * 2. Check DB cache (< 2 minutes old)
 * 3. Fetch from Gate.io API → save to DB + Redis → return
 *
 * Benefits:
 * - Always fresh data (max 2min old)
 * - Fast response (Redis/DB cache)
 * - Unified format across all exchanges
 * - Historical data preserved
 *
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/gateio/public-funding-rates
 */
export async function GET(request: NextRequest) {
  const requestStartTime = Date.now();

  try {
    console.log(`[GateIO] ⏱️ Request started at ${new Date().toISOString()}`);

    // Step 1: Check Redis cache first
    const redisStartTime = Date.now();
    const cachedData = await redisService.getBulkFundingRates('GATEIO');
    console.log(`[GateIO] Redis cache check took ${Date.now() - redisStartTime}ms`);

    if (cachedData) {
      const totalTime = Date.now() - requestStartTime;
      console.log(`[GateIO] ✅ Served from Redis cache in ${totalTime}ms`);
      return NextResponse.json(cachedData.data, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'redis-cache',
          'X-Cache-Age': Math.floor((Date.now() - cachedData.timestamp) / 1000).toString(),
          'X-Response-Time': `${totalTime}ms`,
        },
      });
    }

    // Step 2: Check DB cache (< 2 minutes old)
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - 2 * 60 * 1000); // 2 minutes

    const dbCheckStartTime = Date.now();
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'GATEIO',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });
    console.log(`[GateIO] DB cache check took ${Date.now() - dbCheckStartTime}ms (found ${cachedCount} records)`);

    if (cachedCount > 0) {
      const dbFetchStartTime = Date.now();
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'GATEIO',
          timestamp: {
            gte: cacheThreshold,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
        distinct: ['symbol'], // Get latest record per symbol
      });
      console.log(`[GateIO] DB fetch took ${Date.now() - dbFetchStartTime}ms`);

      // Transform DB format to API format with unified fundingInterval
      const transformedData = cachedRates.map(rate => ({
        name: rate.symbol.replace('/', '_'), // BTC/USDT → BTC_USDT
        funding_rate: rate.fundingRate.toString(),
        funding_interval: rate.fundingInterval * 3600, // Hours → seconds (GateIO format)
        fundingInterval: rate.fundingInterval, // Pure number
        funding_next_apply: Math.floor(rate.nextFundingTime.getTime() / 1000),
        mark_price: rate.markPrice?.toString() || '0',
        index_price: rate.indexPrice?.toString() || '0',
      }));

      // Cache in Redis for next request
      await redisService.cacheBulkFundingRates('GATEIO', transformedData);

      const totalTime = Date.now() - requestStartTime;
      console.log(`[GateIO] ✅ Served from DB cache in ${totalTime}ms`);

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
          'X-Response-Time': `${totalTime}ms`,
        },
      });
    }

    // Step 3: No fresh data - fetch from Gate.io API
    console.log(`[GateIO] No fresh cache, fetching from API...`);

    const gateioUrl = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';
    const apiFetchStartTime = Date.now();

    let response: Response;
    try {
      response = await fetch(gateioUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        const totalTime = Date.now() - requestStartTime;
        console.warn(`[GateIO API] Returned ${response.status} ${response.statusText} after ${totalTime}ms`);
        return NextResponse.json(
          { error: 'Failed to fetch Gate.io funding rates', details: response.statusText },
          { status: response.status }
        );
      }
    } catch (fetchError: any) {
      const totalTime = Date.now() - requestStartTime;
      if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
        console.error(`[GateIO API] Request timeout after ${totalTime}ms`);
        return NextResponse.json(
          { error: 'Gate.io API timeout', details: 'Request took longer than 10 seconds' },
          { status: 504 }
        );
      }
      if (fetchError.code === 'ENOTFOUND') {
        console.error(`[GateIO API] DNS error after ${totalTime}ms - api.gateio.ws unreachable`);
        return NextResponse.json(
          { error: 'Gate.io API unreachable', details: 'DNS lookup failed' },
          { status: 503 }
        );
      }
      console.error(`[GateIO API] Fetch error after ${totalTime}ms:`, fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch Gate.io funding rates', details: fetchError.message },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log(`[GateIO] API fetch took ${Date.now() - apiFetchStartTime}ms (received ${data.length} contracts)`);

    // Filter out contracts without funding_interval - NO DEFAULTS (forbidden by user)
    const validContracts = data.filter((contract: any) => {
      if (!contract.funding_interval || contract.funding_interval === 0) {
        console.warn(`[GateIO] Skipping ${contract.name}: missing funding_interval (defaults forbidden)`);
        return false;
      }
      return true;
    });

    // Step 4: Upsert records (update existing or create new)
    const upsertStartTime = Date.now();
    console.log(`[GateIO] Saving ${validContracts.length} records to database...`);

    const upsertPromises = validContracts.map((contract: any) => {
        const symbol = contract.name.replace('_', '/'); // BTC_USDT → BTC/USDT

        return prisma.publicFundingRate.upsert({
          where: {
            symbol_exchange: {
              symbol,
              exchange: 'GATEIO',
            },
          },
          update: {
            fundingRate: parseFloat(contract.funding_rate || '0'),
            nextFundingTime: new Date(contract.funding_next_apply * 1000),
            fundingInterval: contract.funding_interval / 3600, // Seconds → hours
            markPrice: parseFloat(contract.mark_price || '0'),
            indexPrice: parseFloat(contract.index_price || '0'),
            timestamp: now,
          },
          create: {
            symbol,
            exchange: 'GATEIO',
            fundingRate: parseFloat(contract.funding_rate || '0'),
            nextFundingTime: new Date(contract.funding_next_apply * 1000),
            fundingInterval: contract.funding_interval / 3600, // Seconds → hours
            markPrice: parseFloat(contract.mark_price || '0'),
            indexPrice: parseFloat(contract.index_price || '0'),
            timestamp: now,
          },
        });
      });

    await Promise.all(upsertPromises);
    console.log(`[GateIO] Database upsert took ${Date.now() - upsertStartTime}ms`);

    // Step 5: Return transformed data with unified format (only valid contracts)
    const transformedData = validContracts.map((contract: any) => ({
      ...contract,
      fundingInterval: contract.funding_interval / 3600, // Pure number (always exists after filter)
    }));

    // Cache in Redis for next request
    await redisService.cacheBulkFundingRates('GATEIO', transformedData);

    const totalTime = Date.now() - requestStartTime;
    console.log(`[GateIO] ✅ Request completed in ${(totalTime / 1000).toFixed(1)}s (${totalTime}ms)`);
    console.log(`[GateIO] 📊 Summary: ${validContracts.length} symbols saved to database`);

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
        'X-Response-Time': `${totalTime}ms`,
      },
    });
  } catch (error: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error(`[GateIO] ❌ Request failed after ${totalTime}ms:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
