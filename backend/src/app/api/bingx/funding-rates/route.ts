import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/bingx/funding-rates
 *
 * Fetches funding rates from database (populated by /api/bingx/public-funding-rates).
 * Returns funding rates with fundingInterval from DB.
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "BTC-USDT",
 *       "fundingRate": "0.0001",
 *       "fundingTime": 1234567890000,
 *       "fundingInterval": "8h"
 *     }
 *   ],
 *   "timestamp": "2025-10-06T13:00:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required. Please log in.',
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    console.log(`[BingX Funding Rates] Fetching from database...`);

    // 2. Get latest funding rates from DB (populated by /api/bingx/public-funding-rates)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000); // Accept data up to 1 minute old

    const dbRates = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'BINGX',
        timestamp: {
          gte: oneMinuteAgo,
        },
      },
      orderBy: {
        symbol: 'asc',
      },
      distinct: ['symbol'], // Get latest record per symbol
    });

    console.log(`[BingX Funding Rates] Found ${dbRates.length} rates in database`);

    // If no data in DB, trigger public endpoint to populate it
    if (dbRates.length === 0) {
      console.log(`[BingX Funding Rates] No data in DB, triggering public endpoint...`);

      // Call public endpoint to populate DB
      const publicUrl = new URL('/api/bingx/public-funding-rates', request.url);
      const publicResponse = await fetch(publicUrl.toString());

      if (!publicResponse.ok) {
        throw new Error('Failed to fetch from public endpoint');
      }

      // Re-fetch from DB after population
      const refreshedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'BINGX',
          timestamp: {
            gte: oneMinuteAgo,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
        distinct: ['symbol'],
      });

      console.log(`[BingX Funding Rates] After refresh: ${refreshedRates.length} rates`);

      // Transform DB data to API format
      const fundingRates = refreshedRates.map(rate => ({
        symbol: rate.symbol.replace('/', '-'), // BTC/USDT → BTC-USDT
        fundingRate: rate.fundingRate.toString(),
        fundingTime: Math.floor(rate.nextFundingTime.getTime()),
        fundingInterval: `${rate.fundingInterval}h`, // From DB
      }));

      return NextResponse.json(
        {
          success: true,
          data: fundingRates,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // 3. Transform DB data to API format
    const fundingRates = dbRates.map(rate => ({
      symbol: rate.symbol.replace('/', '-'), // BTC/USDT → BTC-USDT
      fundingRate: rate.fundingRate.toString(),
      fundingTime: Math.floor(rate.nextFundingTime.getTime()),
      fundingInterval: `${rate.fundingInterval}h`, // From DB
    }));

    // 4. Return response
    return NextResponse.json(
      {
        success: true,
        data: fundingRates,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[BingX Funding Rates] Error:', {
      error: error.message,
      stack: error.stack,
    });

    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('BingX API');
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key');

    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (isAuthError) {
      statusCode = 401;
      errorCode = 'INVALID_CREDENTIALS';
    } else if (isApiError) {
      errorCode = 'BINGX_API_ERROR';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch funding rates',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
