import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

/**
 * Public Gate.io Funding Rates with DB Cache
 *
 * Real-time approach:
 * 1. Check if fresh data exists in DB (< 30 seconds old)
 * 2. If yes → return from DB (fast)
 * 3. If no → fetch from Gate.io API → save to DB → return
 *
 * Benefits:
 * - Always fresh data (max 30s old)
 * - Fast response (DB cache)
 * - Unified format across all exchanges
 * - Historical data preserved
 *
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/gateio/public-funding-rates
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'GATEIO',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });

    console.log(`[Gate.io Public] Cache check: ${cachedCount} fresh records (threshold: ${cacheThreshold.toISOString()})`);

    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
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

      console.log(`[Gate.io Public] Returning ${cachedRates.length} rates from cache`);

      // Transform DB format to API format with unified fundingInterval
      const transformedData = cachedRates.map(rate => ({
        name: rate.symbol.replace('/', '_'), // BTC/USDT → BTC_USDT
        funding_rate: rate.fundingRate.toString(),
        funding_interval: rate.fundingInterval * 3600, // Hours → seconds (GateIO format)
        fundingInterval: `${rate.fundingInterval}h`, // Unified format: "8h"
        funding_next_apply: Math.floor(rate.nextFundingTime.getTime() / 1000),
        mark_price: rate.markPrice?.toString() || '0',
        index_price: rate.indexPrice?.toString() || '0',
      }));

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
        },
      });
    }

    // Step 3: No fresh data - fetch from Gate.io API
    console.log('[Gate.io Public] Cache miss - fetching from API...');

    const gateioUrl = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';
    const response = await fetch(gateioUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Gate.io Public] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch Gate.io funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Gate.io Public] Fetched ${data?.length || 0} rates from API`);

    // Step 4: Delete old GATEIO records and insert new ones (atomic transaction)
    await prisma.$transaction(async (tx) => {
      // Delete old records for this exchange
      const deleted = await tx.publicFundingRate.deleteMany({
        where: {
          exchange: 'GATEIO',
        },
      });
      console.log(`[Gate.io Public] Deleted ${deleted.count} old GATEIO records`);

      // Insert new records
      const createPromises = data.map((contract: any) =>
        tx.publicFundingRate.create({
          data: {
            symbol: contract.name.replace('_', '/'), // BTC_USDT → BTC/USDT
            exchange: 'GATEIO',
            fundingRate: parseFloat(contract.funding_rate || '0'),
            nextFundingTime: new Date(contract.funding_next_apply * 1000),
            fundingInterval: (contract.funding_interval || 28800) / 3600, // Seconds → hours
            markPrice: parseFloat(contract.mark_price || '0'),
            indexPrice: parseFloat(contract.index_price || '0'),
            timestamp: now,
          },
        })
      );

      await Promise.all(createPromises);
    });

    console.log(`[Gate.io Public] Saved ${data.length} rates to database`);

    // Step 5: Return transformed data with unified format
    const transformedData = data.map((contract: any) => ({
      ...contract,
      fundingInterval: contract.funding_interval
        ? `${contract.funding_interval / 3600}h`
        : '8h', // Unified format: "8h"
    }));

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
      },
    });
  } catch (error: any) {
    console.error('[Gate.io Public] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
