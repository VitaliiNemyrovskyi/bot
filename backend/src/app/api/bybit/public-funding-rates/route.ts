import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

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
export async function GET(request: NextRequest) {
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


      // Transform DB format to Bybit API format
      const transformedData = {
        retCode: 0,
        retMsg: 'OK',
        result: {
          category: 'linear',
          list: cachedRates.map(rate => ({
            symbol: rate.symbol.replace('/', ''), // BTC/USDT → BTCUSDT
            fundingRate: rate.fundingRate.toString(),
            fundingRateTimestamp: Math.floor(rate.nextFundingTime.getTime()).toString(),
            fundingInterval: `${rate.fundingInterval}h`, // From DB
            markPrice: rate.markPrice?.toString() || '0',
            indexPrice: rate.indexPrice?.toString() || '0',
          })),
        },
      };

      return NextResponse.json(transformedData, {
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
    const upsertPromises = data.map((item: any) => {
      const symbol = item.symbol; // BTCUSDT (no separator)

      // Parse funding interval from API
      // fundingIntervalHour can be a number or string like "8", "1", "4"
      const fundingIntervalHour = parseInt(item.fundingIntervalHour || '8');

      // Convert symbol format: BTCUSDT → BTC/USDT
      const normalizedSymbol = symbol.replace(/USDT$/, '/USDT');

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol: normalizedSymbol,
            exchange: 'BYBIT',
          },
        },
        update: {
          fundingRate: parseFloat(item.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(item.nextFundingTime || Date.now().toString())),
          fundingInterval: fundingIntervalHour,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
        create: {
          symbol: normalizedSymbol,
          exchange: 'BYBIT',
          fundingRate: parseFloat(item.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(item.nextFundingTime || Date.now().toString())),
          fundingInterval: fundingIntervalHour,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
      });
    });

    await Promise.all(upsertPromises);


    // Step 5: Return data with funding intervals from API
    const enrichedData = {
      ...rawData,
      result: {
        ...rawData.result,
        list: data.map((item: any) => ({
          ...item,
          fundingInterval: `${parseInt(item.fundingIntervalHour || '8')}h`,
        })),
      },
    };

    return NextResponse.json(enrichedData, {
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
