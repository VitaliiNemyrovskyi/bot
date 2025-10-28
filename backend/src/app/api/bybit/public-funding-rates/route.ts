import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    console.log(`[Bybit Public] Cache check: ${cachedCount} fresh records (threshold: ${cacheThreshold.toISOString()})`);

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

      console.log(`[Bybit Public] Returning ${cachedRates.length} rates from cache`);

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
    console.log('[Bybit Public] Cache miss - fetching from API...');

    const bybitUrl = 'https://api.bybit.com/v5/market/tickers?category=linear';
    const response = await fetch(bybitUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Bybit Public] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch Bybit funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const rawData = await response.json();
    const data = rawData.result?.list || [];
    console.log(`[Bybit Public] Fetched ${data.length} rates from API`);

    // Step 4: Save to database for future requests
    const savePromises = data.map((item: any) => {
      const symbol = item.symbol; // BTCUSDT (no separator)

      // Parse funding interval from API
      // fundingIntervalHour can be a number or string like "8", "1", "4"
      const fundingIntervalHour = parseInt(item.fundingIntervalHour || '8');

      // Convert symbol format: BTCUSDT → BTC/USDT
      const normalizedSymbol = symbol.replace(/USDT$/, '/USDT');

      return prisma.publicFundingRate.create({
        data: {
          symbol: normalizedSymbol,
          exchange: 'BYBIT',
          fundingRate: parseFloat(item.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(item.nextFundingTime || Date.now().toString())),
          fundingInterval: fundingIntervalHour,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
      }).catch(err => {
        // Ignore duplicate errors (race condition)
        if (!err.message.includes('Unique constraint')) {
          console.error(`[Bybit Public] Error saving ${symbol}:`, err.message);
        }
      });
    });

    await Promise.all(savePromises);
    console.log(`[Bybit Public] Saved ${data.length} rates to database`);

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
    console.error('[Bybit Public] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
