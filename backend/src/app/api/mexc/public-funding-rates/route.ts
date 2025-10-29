import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MEXCService } from '@/lib/mexc';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

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
export async function GET(request: NextRequest) {
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


      // Transform DB format to API format
      const transformedData = {
        success: true,
        code: 0,
        data: cachedRates.map(rate => ({
          symbol: rate.symbol.replace('/', '_'), // BTC/USDT → BTC_USDT
          fundingRate: rate.fundingRate,
          fundingInterval: rate.fundingInterval > 0 ? `${rate.fundingInterval}h` : 'unknown',
          nextFundingTime: rate.nextFundingTime.getTime(),
        })),
      };

      return NextResponse.json(transformedData, {
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


    // Step 4: Delete old MEXC records and insert new ones (atomic transaction)
    await prisma.$transaction(async (tx) => {
      // Delete old records for this exchange
      const deleted = await tx.publicFundingRate.deleteMany({
        where: {
          exchange: 'MEXC',
        },
      });

      // Insert new records with actual collectCycle data
      const createPromises = fundingRates.map((rate: any) => {
        const symbol = rate.symbol.replace('_', '/'); // BTC_USDT → BTC/USDT
        const fundingIntervalHours = rate.collectCycle || 8; // Use actual collectCycle or default to 8h

        return tx.publicFundingRate.create({
          data: {
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

      await Promise.all(createPromises);
    }, {
      timeout: 15000, // Increase timeout to 15 seconds for large batch inserts
    });


    // Step 5: Return with actual intervals
    const responseData = {
      success: true,
      code: 0,
      data: fundingRates.map((rate: any) => ({
        symbol: rate.symbol, // BTC_USDT format
        fundingRate: rate.fundingRate,
        fundingInterval: rate.collectCycle ? `${rate.collectCycle}h` : '8h',
        nextFundingTime: rate.nextSettleTime || 0,
      })),
    };

    return NextResponse.json(responseData, {
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
