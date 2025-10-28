import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';

/**
 * GET /api/bybit/check-delisting
 *
 * Check if Bybit symbols are being delisted (have a deliveryTime set).
 *
 * NO AUTHENTICATION REQUIRED - this is public market data.
 *
 * Query Parameters:
 * - symbol: Single symbol to check (e.g., "HIFIUSDT")
 * - symbols: Comma-separated list of symbols (e.g., "HIFIUSDT,BTCUSDT")
 * - thresholdDays: Days before delivery to consider as "delisting" (default: 7)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "HIFIUSDT",
 *       "isDelisting": true,
 *       "deliveryTime": 1761814800000,
 *       "daysUntilDelivery": 2.5,
 *       "status": "Trading"
 *     }
 *   ],
 *   "timestamp": "2025-10-28T17:00:00.000Z"
 * }
 *
 * Use Cases:
 * 1. Filter opportunities to exclude delisting symbols
 * 2. Pre-flight validation before creating positions
 * 3. Warning indicators in UI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const singleSymbol = searchParams.get('symbol');
    const multipleSymbols = searchParams.get('symbols');
    const thresholdDaysParam = searchParams.get('thresholdDays');

    // Parse threshold days (default: 7)
    const thresholdDays = thresholdDaysParam ? parseInt(thresholdDaysParam) : 7;

    // Determine which symbols to check
    let symbolsToCheck: string[] = [];

    if (singleSymbol) {
      symbolsToCheck = [singleSymbol];
    } else if (multipleSymbols) {
      symbolsToCheck = multipleSymbols.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter',
          message: 'Either "symbol" or "symbols" parameter is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (symbolsToCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          message: 'At least one symbol must be provided',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log(`[Bybit Delisting Check] Checking ${symbolsToCheck.length} symbols with threshold ${thresholdDays} days`);

    // Create Bybit service (no auth required for public data)
    const bybitService = new BybitService({ enableRateLimit: true });

    // Check delisting status
    const results = await bybitService.checkMultipleDelisting(symbolsToCheck, 'linear', thresholdDays);

    console.log(`[Bybit Delisting Check] Results:`, results);

    // Log warnings for delisting symbols
    const delistingSymbols = results.filter(r => r.isDelisting);
    if (delistingSymbols.length > 0) {
      console.warn(`[Bybit Delisting Check] ⚠️ Found ${delistingSymbols.length} delisting symbols:`,
        delistingSymbols.map(s => `${s.symbol} (${s.daysUntilDelivery?.toFixed(1)} days)`).join(', ')
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        }
      }
    );
  } catch (error: any) {
    console.error('[Bybit Delisting Check] Error:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check delisting status',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
