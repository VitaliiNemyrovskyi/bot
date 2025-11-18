import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MEXCService } from '@/lib/mexc';

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
 * MEXC Public Funding Rates with Dynamic Intervals
 *
 * Returns MEXC funding rates with ACTUAL funding intervals from API (collectCycle field).
 * Uses individual symbol API to get accurate nextSettleTime and collectCycle.
 * NO AUTHENTICATION REQUIRED - public endpoint
 *
 * Endpoint: GET /api/mexc/public-funding-rates
 * MEXC API: GET https://futures.mexc.com/api/v1/contract/funding_rate/{symbol}
 * Documentation: https://mexcdevelop.github.io/apidocs/contract_v1_en/#get-funding-rate
 */
export async function GET(_request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'MEXC',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });


    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'MEXC',
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

    // Step 3: No fresh data - fetch from MEXC API with REAL intervals

    // Use a dummy credential to access public endpoints (no auth needed)
    const mexcService = new MEXCService({
      apiKey: 'dummy',
      apiSecret: 'dummy',
      enableRateLimit: true,
    });

    // Get all funding rates - this uses getFundingRatesForSymbols which returns collectCycle
    const fundingRates = await mexcService.getAllFundingRates();


    // Step 4: Upsert records (update existing or create new)
    const upsertPromises = fundingRates.map((rate: any) => {
      const symbol = rate.symbol.replace('_', '/'); // BTC_USDT → BTC/USDT
      const fundingIntervalHours = rate.collectCycle || 0; // Use actual collectCycle

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol,
            exchange: 'MEXC',
          },
        },
        update: {
          fundingRate: parseFloat(rate.fundingRate?.toString() || '0'),
          nextFundingTime: new Date(rate.nextSettleTime || 0),
          fundingInterval: fundingIntervalHours,
          markPrice: parseFloat(rate.lastPrice?.toString() || '0'),
          indexPrice: parseFloat(rate.lastPrice?.toString() || '0'),
          timestamp: now,
        },
        create: {
          symbol,
          exchange: 'MEXC',
          fundingRate: parseFloat(rate.fundingRate?.toString() || '0'),
          nextFundingTime: new Date(rate.nextSettleTime || 0),
          fundingInterval: fundingIntervalHours,
          markPrice: parseFloat(rate.lastPrice?.toString() || '0'),
          indexPrice: parseFloat(rate.lastPrice?.toString() || '0'),
          timestamp: now,
        },
      });
    });

    await Promise.all(upsertPromises);


    // Step 5: Return with unified format
    const unifiedData = {
      code: '0',
      msg: '',
      data: fundingRates.map((rate: any) => ({
        symbol: normalizeSymbol(rate.symbol),
        fundingRate: (rate.fundingRate || '0').toString(),
        nextFundingTime: (rate.nextSettleTime || '0').toString(),
        fundingInterval: rate.collectCycle || 0,
        last: (rate.lastPrice || '0').toString(),
        markPx: (rate.lastPrice || '0').toString(),
        idxPx: (rate.lastPrice || '0').toString(),
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
