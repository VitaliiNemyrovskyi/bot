import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

/**
 * Known BingX funding intervals (updated from official announcements)
 * BingX API doesn't provide intervals directly, so we maintain this list
 * based on official announcements from BingX support pages
 *
 * Source: https://bingx.com/en/support/ (various funding rate adjustment announcements)
 * Last updated: 2025-10
 */
const BINGX_FUNDING_INTERVALS: Record<string, string> = {
  // 1-hour intervals
  'SVSA-USDT': '1h',
  '0G-USDT': '1h',

  // 4-hour intervals
  'COAI-USDT': '4h',
  'DOG-USDT': '4h',
  'BROCCOLIF3B-USDT': '4h',
  'BR-USDT': '4h',
  'HEI-USDT': '4h',
  'SOLV-USDT': '4h',

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
export async function GET(request: NextRequest) {
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

    console.log(`[BingX Public] Cache check: ${cachedCount} fresh records (threshold: ${cacheThreshold.toISOString()})`);

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

      console.log(`[BingX Public] Returning ${cachedRates.length} rates from cache`);

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
    console.log('[BingX Public] Cache miss - fetching from API...');

    const bingxUrl = 'https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex';
    const response = await fetch(bingxUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[BingX Public] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch BingX funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const rawData = await response.json();
    const data = rawData.data || [];
    console.log(`[BingX Public] Fetched ${data.length} rates from API`);

    // Step 4: Save to database for future requests
    const savePromises = data.map((item: any) => {
      const symbol = item.symbol.replace('-', '/'); // BTC-USDT → BTC/USDT
      const fundingInterval = BINGX_FUNDING_INTERVALS[item.symbol] || 8; // Hours

      return prisma.publicFundingRate.create({
        data: {
          symbol,
          exchange: 'BINGX',
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime || Date.now()),
          fundingInterval,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
      }).catch(err => {
        // Ignore duplicate errors (race condition)
        if (!err.message.includes('Unique constraint')) {
          console.error(`[BingX Public] Error saving ${item.symbol}:`, err.message);
        }
      });
    });

    await Promise.all(savePromises);
    console.log(`[BingX Public] Saved ${data.length} rates to database`);

    // Step 5: Return transformed data with funding intervals
    const enrichedData = {
      ...rawData,
      data: data.map((item: any) => ({
        ...item,
        fundingInterval: BINGX_FUNDING_INTERVALS[item.symbol] || '8h',
      })),
    };

    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
      },
    });
  } catch (error: any) {
    console.error('[BingX Public] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
