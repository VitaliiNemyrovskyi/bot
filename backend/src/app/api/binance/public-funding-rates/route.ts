import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { redisService } from '@/lib/redis';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

// Cache duration in seconds
const CACHE_TTL_SECONDS = 30;

/**
 * Normalize symbol by removing separators and suffixes
 * Examples: BTC-USDT-SWAP → BTCUSDT, BTC/USDT → BTCUSDT, BTC_USDT_PERP → BTCUSDT
 */
function normalizeSymbol(symbol: string): string {
  // Remove separators
  let normalized = symbol.replace(/[-_/:]/g, '');
  // Remove suffixes
  normalized = normalized.replace(/(SWAP|PERP|PERPETUAL|FUTURES?)$/i, '');
  return normalized;
}

/**
 * Public Binance Funding Rates with Database Persistence
 *
 * Fetches funding rates from Binance public API, stores them in PostgreSQL database,
 * and caches in Redis for fast access.
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/binance/public-funding-rates
 *
 * Binance API endpoints used:
 * - /fapi/v1/premiumIndex - Mark price and funding rate
 * - /fapi/v1/fundingInfo - Funding interval hours (1h, 4h, 8h)
 */
export async function GET(_request: NextRequest) {
  const requestStartTime = Date.now();

  try {
    console.log(`[Binance] ⏱️ Request started at ${new Date().toISOString()}`);

    // Check Redis cache first
    const redisStartTime = Date.now();
    const cachedData = await redisService.getBulkFundingRates('BINANCE');
    console.log(`[Binance] Redis cache check took ${Date.now() - redisStartTime}ms`);

    if (cachedData) {
      const totalTime = Date.now() - requestStartTime;
      console.log(`[Binance] ✅ Served from Redis cache in ${totalTime}ms`);
      // Unified response format
      const unifiedResponse = {
        code: '0',
        msg: '',
        data: cachedData.data.map((item: any) => ({
          symbol: normalizeSymbol(item.symbol),
          fundingRate: item.lastFundingRate || item.fundingRate || '0',
          nextFundingTime: item.nextFundingTime?.toString() || '0',
          fundingInterval: item.fundingInterval || 0,
          last: item.markPrice || item.last || '0',
          markPx: item.markPrice || item.markPx || '0',
          idxPx: item.indexPrice || item.idxPx || '0',
        })),
      };
      return NextResponse.json(unifiedResponse, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'redis-cache',
          'X-Cache-Age': Math.floor((Date.now() - cachedData.timestamp) / 1000).toString(),
          'X-Response-Time': `${totalTime}ms`,
        },
      });
    }

    // Check database cache (data updated in last 2 minutes)
    const cacheThreshold = new Date(Date.now() - 2 * 60 * 1000);
    const dbCheckStartTime = Date.now();
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'BINANCE',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });
    console.log(`[Binance] DB cache check took ${Date.now() - dbCheckStartTime}ms (found ${cachedCount} records)`);

    if (cachedCount > 0) {
      const dbFetchStartTime = Date.now();
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'BINANCE',
          timestamp: {
            gte: cacheThreshold,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
      });
      console.log(`[Binance] DB fetch took ${Date.now() - dbFetchStartTime}ms`);

      // Transform to unified format
      const unifiedData = {
        code: '0',
        msg: '',
        data: cachedRates.map((rate) => ({
          symbol: normalizeSymbol(rate.symbol),
          fundingRate: rate.fundingRate.toString(),
          nextFundingTime: rate.nextFundingTime.getTime().toString(),
          fundingInterval: rate.fundingInterval,
          last: rate.markPrice?.toString() || '0',
          markPx: rate.markPrice?.toString() || '0',
          idxPx: rate.indexPrice?.toString() || '0',
        })),
      };

      // Cache in Redis
      await redisService.cacheBulkFundingRates('BINANCE', unifiedData, CACHE_TTL_SECONDS);

      const totalTime = Date.now() - requestStartTime;
      console.log(`[Binance] ✅ Served from DB cache in ${totalTime}ms`);

      return NextResponse.json(unifiedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
          'X-Response-Time': `${totalTime}ms`,
        },
      });
    }

    // No cache, fetch from Binance API
    console.log(`[Binance] No fresh cache, fetching from API...`);
    const apiFetchStartTime = Date.now();

    const [premiumResponse, fundingInfoResponse] = await Promise.all([
      fetch('https://fapi.binance.com/fapi/v1/premiumIndex', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch('https://fapi.binance.com/fapi/v1/fundingInfo', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    if (!premiumResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Binance funding rates', details: premiumResponse.statusText },
        { status: premiumResponse.status }
      );
    }

    const premiumData = await premiumResponse.json();
    const fundingInfoData = fundingInfoResponse.ok ? await fundingInfoResponse.json() : [];
    console.log(`[Binance] API fetch took ${Date.now() - apiFetchStartTime}ms (received ${premiumData.length} symbols)`);

    // Create map: symbol -> fundingIntervalHours
    const intervalMap = new Map<string, number>();
    for (const info of fundingInfoData) {
      if (info.symbol && info.fundingIntervalHours) {
        intervalMap.set(info.symbol, info.fundingIntervalHours);
      }
    }

    // Enrich premium data with funding intervals
    const now = new Date();
    const enrichedData = premiumData.map((premium: any) => ({
      ...premium,
      fundingInterval: intervalMap.has(premium.symbol)
        ? intervalMap.get(premium.symbol)
        : 0, // 0 means unknown
    }));

    // Save to database
    const upsertStartTime = Date.now();
    console.log(`[Binance] Saving ${enrichedData.length} records to database...`);

    const upsertPromises = enrichedData.map((item: any) => {
      // Binance uses format like "BTCUSDT", convert to "BTC/USDT"
      const symbolWithSlash = item.symbol.replace(/USDT$/, '/USDT')
        .replace(/USDC$/, '/USDC')
        .replace(/BUSD$/, '/BUSD');

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol: symbolWithSlash,
            exchange: 'BINANCE',
          },
        },
        update: {
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime),
          fundingInterval: item.fundingInterval || 0,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
        create: {
          symbol: symbolWithSlash,
          exchange: 'BINANCE',
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime),
          fundingInterval: item.fundingInterval || 0,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
      });
    });

    await Promise.all(upsertPromises);
    console.log(`[Binance] Database upsert took ${Date.now() - upsertStartTime}ms`);

    // Transform to unified format
    const unifiedData = {
      code: '0',
      msg: '',
      data: enrichedData.map((item: any) => ({
        symbol: normalizeSymbol(item.symbol),
        fundingRate: item.lastFundingRate || '0',
        nextFundingTime: (item.nextFundingTime || '0').toString(),
        fundingInterval: item.fundingInterval || 0,
        last: item.markPrice || '0',
        markPx: item.markPrice || '0',
        idxPx: item.indexPrice || '0',
      })),
    };

    // Cache in Redis
    await redisService.cacheBulkFundingRates('BINANCE', unifiedData, CACHE_TTL_SECONDS);

    const totalTime = Date.now() - requestStartTime;
    console.log(`[Binance] ✅ Request completed in ${(totalTime / 1000).toFixed(1)}s (${totalTime}ms)`);
    console.log(`[Binance] 📊 Summary: ${enrichedData.length} symbols saved to database`);

    return NextResponse.json(unifiedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
        'X-Response-Time': `${totalTime}ms`,
      },
    });
  } catch (error: any) {
    const totalTime = Date.now() - requestStartTime;
    console.error(`[Binance] ❌ Request failed after ${totalTime}ms:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
