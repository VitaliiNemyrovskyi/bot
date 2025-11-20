import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

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
 * Public Bybit Funding Rates with DB Cache
 *
 * Real-time approach:
 * 1. Check if fresh data exists in DB (< 30 seconds old)
 * 2. If yes → return from DB (fast)
 * 3. If no → fetch from Bybit API → save to DB → return
 *
 * Benefits:
 * - Always fresh data (max 30s old)
 * - Fast response (DB cache)
 * - Unified format across all exchanges
 * - Historical data preserved
 * - Funding interval from API (fundingIntervalHour field)
 *
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/bybit/public-funding-rates
 */
export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'BYBIT',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });


    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'BYBIT',
          timestamp: {
            gte: cacheThreshold,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
        distinct: ['symbol'], // Get latest record per symbol
      });


      // Transform DB format to unified format
      const unifiedData = {
        code: '0',
        msg: '',
        data: cachedRates.map(rate => ({
          symbol: normalizeSymbol(rate.symbol),
          fundingRate: rate.fundingRate.toString(),
          nextFundingTime: rate.nextFundingTime.getTime().toString(),
          fundingInterval: rate.fundingInterval,
          last: rate.markPrice?.toString() || '0',
          markPx: rate.markPrice?.toString() || '0',
          idxPx: rate.indexPrice?.toString() || '0',
        })),
      };

      return NextResponse.json(unifiedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
        },
      });
    }

    // Step 3: No fresh data - fetch from Bybit API

    const bybitUrl = 'https://api.bybit.com/v5/market/tickers?category=linear';
    const response = await fetch(bybitUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Bybit funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const rawData = await response.json();
    const data = rawData.result?.list || [];

    // Step 4: Upsert records (update existing or create new)
    // Step 4: Bulk update records (delete old + insert new)
    const upsertStartTime = Date.now();

    const recordsToInsert = data.map((item: any) => {
      const symbol = item.symbol; // BTCUSDT (no separator)

      // Parse funding interval from API
      // fundingIntervalHour can be a number or string like "8", "1", "4"
      const fundingIntervalHour = parseInt(item.fundingIntervalHour || '0');

      // Convert symbol format: BTCUSDT → BTC/USDT
      const normalizedSymbol = symbol.replace(/USDT$/, '/USDT');

      return {
        symbol: normalizedSymbol,
        exchange: 'BYBIT',
        fundingRate: parseFloat(item.fundingRate || '0'),
        nextFundingTime: new Date(parseInt(item.nextFundingTime || Date.now().toString())),
        fundingInterval: fundingIntervalHour,
        markPrice: parseFloat(item.markPrice || '0'),
        indexPrice: parseFloat(item.indexPrice || '0'),
        timestamp: now,
      };
    });

    await prisma.$transaction([
      prisma.publicFundingRate.deleteMany({
        where: {
          exchange: 'BYBIT',
        },
      }),
      prisma.publicFundingRate.createMany({
        data: recordsToInsert as any,
        skipDuplicates: true,
      }),
    ]);

    console.log(`[Bybit] Database bulk update took ${Date.now() - upsertStartTime}ms`);


    // Step 5: Return data with unified format
    const unifiedData = {
      code: '0',
      msg: '',
      data: data.map((item: any) => ({
        symbol: normalizeSymbol(item.symbol),
        fundingRate: item.fundingRate || '0',
        nextFundingTime: (item.nextFundingTime || '0').toString(),
        fundingInterval: parseInt(item.fundingIntervalHour || '0'),
        last: item.markPrice || item.lastPrice || '0',
        markPx: item.markPrice || '0',
        idxPx: item.indexPrice || '0',
      })),
    };

    return NextResponse.json(unifiedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
