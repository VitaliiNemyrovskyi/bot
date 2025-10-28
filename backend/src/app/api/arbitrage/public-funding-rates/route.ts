import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/arbitrage/public-funding-rates
 *
 * Fetches funding rates for specific exchanges and symbol from database.
 * This endpoint is optimized for the arbitrage chart page to get only needed data.
 *
 * Query Parameters:
 * - exchanges: Comma-separated list of exchanges (e.g., "GATEIO,BINGX")
 * - symbol: Trading symbol (e.g., "AVNTUSDT", "BTC/USDT", or "BTC-USDT")
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "exchange": "GATEIO",
 *       "symbol": "AVNT/USDT",
 *       "fundingRate": "-0.0700",
 *       "nextFundingTime": 1234567890000,
 *       "fundingInterval": "1h"
 *     }
 *   ],
 *   "timestamp": "2025-10-28T10:00:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exchangesParam = searchParams.get('exchanges');
    const symbolParam = searchParams.get('symbol');

    // Validate parameters
    if (!exchangesParam || !symbolParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'Both "exchanges" and "symbol" query parameters are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Parse exchanges list
    const exchanges = exchangesParam.split(',').map(e => e.trim().toUpperCase()).filter(e => e.length > 0);

    if (exchanges.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid exchanges parameter',
          message: 'At least one exchange must be specified',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Normalize symbol to different formats for matching
    // Handle: AVNTUSDT, AVNT-USDT, AVNT/USDT
    const normalizedSymbol = symbolParam.replace(/-/g, '').replace(/\//g, '');
    const symbolVariations = [
      symbolParam,                                    // Original (e.g., "AVNTUSDT")
      symbolParam.replace(/-/g, '/'),                 // AVNT-USDT -> AVNT/USDT
      symbolParam.replace(/\//g, '-'),                // AVNT/USDT -> AVNT-USDT
      normalizedSymbol,                               // AVNTUSDT
      normalizedSymbol.replace(/USDT$/, '/USDT'),     // AVNTUSDT -> AVNT/USDT
      normalizedSymbol.replace(/USDT$/, '-USDT'),     // AVNTUSDT -> AVNT-USDT
    ];

    console.log(`[Arbitrage Public Funding] Fetching for exchanges: ${exchanges.join(', ')}, symbol variations:`, symbolVariations);

    // Fetch latest funding rates from DB (data should be fresh, populated by public endpoints)
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000); // Accept data up to 2 minutes old

    const fundingRates = await prisma.publicFundingRate.findMany({
      where: {
        exchange: {
          in: exchanges,
        },
        symbol: {
          in: symbolVariations,
        },
        timestamp: {
          gte: twoMinutesAgo,
        },
      },
      orderBy: [
        { exchange: 'asc' },
        { timestamp: 'desc' },
      ],
      distinct: ['exchange', 'symbol'],
    });

    console.log(`[Arbitrage Public Funding] Found ${fundingRates.length} rates in database`);

    // If no data found, try to trigger public endpoints to populate cache
    if (fundingRates.length === 0) {
      console.log(`[Arbitrage Public Funding] No data in DB, triggering public endpoints...`);

      const triggerPromises = exchanges.map(async (exchange) => {
        try {
          const publicUrl = new URL(`/api/${exchange.toLowerCase()}/public-funding-rates`, request.url);
          const response = await fetch(publicUrl.toString());

          if (!response.ok) {
            console.warn(`[Arbitrage Public Funding] Failed to trigger ${exchange} public endpoint: ${response.status}`);
          } else {
            console.log(`[Arbitrage Public Funding] Successfully triggered ${exchange} public endpoint`);
          }
        } catch (error: any) {
          console.warn(`[Arbitrage Public Funding] Error triggering ${exchange} public endpoint:`, error.message);
        }
      });

      // Wait for all triggers to complete
      await Promise.all(triggerPromises);

      // Re-fetch from DB after population
      const refreshedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: {
            in: exchanges,
          },
          symbol: {
            in: symbolVariations,
          },
          timestamp: {
            gte: twoMinutesAgo,
          },
        },
        orderBy: [
          { exchange: 'asc' },
          { timestamp: 'desc' },
        ],
        distinct: ['exchange', 'symbol'],
      });

      console.log(`[Arbitrage Public Funding] After refresh: ${refreshedRates.length} rates`);

      // Transform and return
      const data = refreshedRates.map(rate => ({
        exchange: rate.exchange,
        symbol: rate.symbol,
        fundingRate: rate.fundingRate.toString(),
        nextFundingTime: Math.floor(rate.nextFundingTime.getTime()),
        fundingInterval: `${rate.fundingInterval}h`,
      }));

      return NextResponse.json(
        {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Transform DB data to API format
    const data = fundingRates.map(rate => ({
      exchange: rate.exchange,
      symbol: rate.symbol,
      fundingRate: rate.fundingRate.toString(),
      nextFundingTime: Math.floor(rate.nextFundingTime.getTime()),
      fundingInterval: `${rate.fundingInterval}h`,
    }));

    console.log(`[Arbitrage Public Funding] Returning ${data.length} rates:`, data);

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Arbitrage Public Funding] Error:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch funding rates',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
