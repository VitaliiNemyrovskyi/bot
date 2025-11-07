import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

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


    // If no data found, fetch directly from exchange APIs
    if (fundingRates.length === 0 || fundingRates.length < exchanges.length) {

      const directFetchPromises = exchanges.map(async (exchange) => {
        try {
          // For MEXC, use individual symbol endpoint for accurate data
          if (exchange === 'MEXC') {
            // Convert symbol to MEXC format (SHELL/USDT -> SHELL_USDT)
            const mexcSymbol = normalizedSymbol.replace(/USDT$/, '_USDT');
            const mexcUrl = new URL(`/api/mexc/funding-rate/${mexcSymbol}`, request.url);
            const response = await fetch(mexcUrl.toString());

            if (response.ok) {
              const data = await response.json();
              return {
                exchange: 'MEXC',
                symbol: symbolParam,
                fundingRate: data.fundingRate.toString(),
                nextFundingTime: data.nextSettleTime,
                fundingInterval: data.fundingInterval,
              };
            }
          } else {
            // For other exchanges, use public endpoints
            const publicUrl = new URL(`/api/${exchange.toLowerCase()}/public-funding-rates`, request.url);
            const response = await fetch(publicUrl.toString());

            if (!response.ok) {
              return null;
            }

          }
        } catch (error: any) {
        }
        return null;
      });

      // Wait for all fetches to complete
      const directResults = await Promise.all(directFetchPromises);
      const validResults = directResults.filter(r => r !== null);


      // If we got MEXC data directly, combine with DB data for other exchanges
      if (validResults.length > 0) {
        // Re-fetch from DB for other exchanges
        const refreshedRates = await prisma.publicFundingRate.findMany({
          where: {
            exchange: {
              in: exchanges.filter(e => e !== 'MEXC'), // Exclude MEXC, we have direct data
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

        // Transform DB data
        const dbData = refreshedRates.map(rate => ({
          exchange: rate.exchange,
          symbol: rate.symbol,
          fundingRate: rate.fundingRate.toString(),
          nextFundingTime: Math.floor(rate.nextFundingTime.getTime()),
          fundingInterval: rate.fundingInterval,
        }));

        // Combine direct results with DB data
        const combinedData = [...validResults, ...dbData];


        return NextResponse.json(
          {
            success: true,
            data: combinedData,
            timestamp: new Date().toISOString(),
          },
          { status: 200 }
        );
      }
    }

    // Transform DB data to API format
    const data = fundingRates.map(rate => ({
      exchange: rate.exchange,
      symbol: rate.symbol,
      fundingRate: rate.fundingRate.toString(),
      nextFundingTime: Math.floor(rate.nextFundingTime.getTime()),
      fundingInterval: rate.fundingInterval,
    }));


    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
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
