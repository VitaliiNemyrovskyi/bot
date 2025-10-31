import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

/**
 * Known BingX funding intervals (updated from official announcements)
 * BingX API doesn't provide intervals directly, so we maintain this list
 * based on official announcements from BingX support pages
 *
 * Source: https://bingx.com/en/support/ (various funding rate adjustment announcements)
 * Last updated: 2025-10
 *
 * Note: Values are in hours (number) for database storage
 */
const BINGX_FUNDING_INTERVALS: Record<string, number> = {
  // 1-hour intervals
  'SVSA-USDT': 1,
  '0G-USDT': 1,

  // 4-hour intervals
  'API3-USDT': 4,
  'COAI-USDT': 4,
  'DOG-USDT': 4,
  'BROCCOLIF3B-USDT': 4,
  'BR-USDT': 4,
  'HEI-USDT': 4,
  'SOLV-USDT': 4,

  // Default: 8h for all others (BingX standard)
};

/**
 * Public BingX Funding Rates with DB Cache
 *
 * Real-time approach:
 * 1. Check if fresh data exists in DB (< 30 seconds old)
 * 2. If yes → return from DB (fast)
 * 3. If no → fetch from BingX API → save to DB → return
 *
 * Benefits:
 * - Always fresh data (max 30s old)
 * - Fast response (DB cache)
 * - Unified format across all exchanges
 * - Historical data preserved
 *
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/bingx/public-funding-rates
 */
export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'BINGX',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });


    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'BINGX',
          timestamp: {
            gte: cacheThreshold,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
        distinct: ['symbol'], // Get latest record per symbol
      });


      // Transform DB format to BingX API format
      const transformedData = {
        code: 0,
        msg: '',
        data: cachedRates.map(rate => ({
          symbol: rate.symbol.replace('/', '-'), // BTC/USDT → BTC-USDT
          lastFundingRate: rate.fundingRate.toString(),
          nextFundingTime: Math.floor(rate.nextFundingTime.getTime()),
          markPrice: rate.markPrice?.toString() || '0',
          indexPrice: rate.indexPrice?.toString() || '0',
          fundingInterval: `${rate.fundingInterval}h`, // From DB
        })),
      };

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
        },
      });
    }

    // Step 3: No fresh data - fetch from BingX API

    const bingxUrl = 'https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex';
    const response = await fetch(bingxUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch BingX funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const rawData = await response.json();
    const data = rawData.data || [];

    // Step 4: Upsert records (update existing or create new)
    const upsertPromises = data.map((item: any) => {
      const symbol = item.symbol.replace('-', '/'); // BTC-USDT → BTC/USDT
      const fundingInterval = BINGX_FUNDING_INTERVALS[item.symbol] || 8; // Hours

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol: symbol,
            exchange: 'BINGX',
          },
        } as any,
        update: {
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime || Date.now()),
          fundingInterval,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
        create: {
          symbol,
          exchange: 'BINGX',
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime || Date.now()),
          fundingInterval,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
      });
    });

    await Promise.all(upsertPromises);


    // Step 5: Return transformed data with funding intervals
    const enrichedData = {
      ...rawData,
      data: data.map((item: any) => {
        const intervalHours = BINGX_FUNDING_INTERVALS[item.symbol] || 8;
        return {
          ...item,
          fundingInterval: `${intervalHours}h`, // Convert to string format for API response
        };
      }),
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
