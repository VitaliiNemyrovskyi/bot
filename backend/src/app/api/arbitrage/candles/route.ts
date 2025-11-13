import { NextRequest, NextResponse } from 'next/server';
import { CCXTService } from '@/lib/ccxt-service';

/**
 * GET /api/arbitrage/candles
 *
 * Fetches OHLC candlestick data for chart visualization
 * Specifically designed for funding rate chart components
 *
 * Query Parameters:
 * - symbol: Trading symbol (e.g., BTCUSDT)
 * - exchange: Exchange name (BYBIT, BINANCE, MEXC, OKX, etc.)
 * - interval: Time interval (1m, 5m, 15m, 1h, 4h, 1d) - default: 1m
 * - limit: Number of candles (default: 60, max: 1440)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     { time: number, open: number, high: number, low: number, close: number },
 *     ...
 *   ],
 *   "metadata": {
 *     "symbol": "BTCUSDT",
 *     "exchange": "BYBIT",
 *     "interval": "1m",
 *     "count": 60
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const exchange = searchParams.get('exchange')?.toUpperCase();
    const interval = searchParams.get('interval') || '1m';
    const limit = Math.min(parseInt(searchParams.get('limit') || '60'), 1440);

    if (!symbol || !exchange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing parameters',
          message: 'symbol and exchange are required',
        },
        { status: 400 }
      );
    }

    console.log(`[Candles API] Fetching ${limit} ${interval} candles for ${symbol} on ${exchange}`);

    // Fetch OHLC data from exchange
    const candles = await fetchCandlesFromExchange(exchange, symbol, interval, limit);

    if (!candles || candles.length === 0) {
      console.warn(`[Candles API] No candles returned for ${symbol} on ${exchange}`);
      return NextResponse.json({
        success: true,
        data: [],
        metadata: {
          symbol,
          exchange,
          interval,
          count: 0
        }
      });
    }

    console.log(`[Candles API] Successfully fetched ${candles.length} candles`);

    return NextResponse.json({
      success: true,
      data: candles,
      metadata: {
        symbol,
        exchange,
        interval,
        count: candles.length
      }
    });

  } catch (error: any) {
    console.error('[Candles API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch candles',
        message: error.message
      },
      { status: 500 }
    );
  }
}

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Fetch OHLC candles from exchange using CCXT
 */
async function fetchCandlesFromExchange(
  exchange: string,
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    console.log(`[Candles] Fetching from ${exchange} via CCXT`);

    const ccxtService = new CCXTService(exchange.toLowerCase(), {
      enableRateLimit: true,
    });

    await ccxtService.loadMarkets();

    // Fetch klines using CCXT
    const klines = await ccxtService.getHistoricalKlines(symbol, interval, limit);

    // Convert to candle format
    const candles: CandleData[] = klines.map(k => ({
      time: k.time,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close
    }));

    console.log(`[Candles] Fetched ${candles.length} candles from ${exchange}`);
    return candles;

  } catch (error: any) {
    console.error(`[Candles] ${exchange} fetch failed:`, error.message);
    return [];
  }
}
