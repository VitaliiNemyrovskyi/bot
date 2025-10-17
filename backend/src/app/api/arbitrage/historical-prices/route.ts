import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { CCXTService } from '@/lib/ccxt-service';

/**
 * GET /api/arbitrage/historical-prices
 *
 * Fetches historical price data for arbitrage chart using CCXT
 * Returns kline/candlestick data from exchanges
 *
 * Query Parameters:
 * - symbol: Trading symbol (e.g., BTCUSDT)
 * - primaryExchange: Primary exchange name (BYBIT, BINGX, BINANCE, MEXC, OKX, etc.)
 * - hedgeExchange: Hedge exchange name
 * - interval: Time interval (1m, 5m, 15m, 1h, 4h, 1d)
 * - limit: Number of data points (default: 1000)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "primary": [{ time: number, price: number }, ...],
 *     "hedge": [{ time: number, price: number }, ...]
 *   }
 * }
 *
 * Note: Now uses CCXT for BingX, MEXC, and other exchanges (except Bybit which uses direct API)
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
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const primaryExchange = searchParams.get('primaryExchange')?.toUpperCase();
    const hedgeExchange = searchParams.get('hedgeExchange')?.toUpperCase();
    const interval = searchParams.get('interval') || '1h';
    const limit = parseInt(searchParams.get('limit') || '1000');

    if (!symbol || !primaryExchange || !hedgeExchange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing parameters',
          message: 'symbol, primaryExchange, and hedgeExchange are required',
        },
        { status: 400 }
      );
    }

    console.log(`[Historical Prices] Fetching data for ${symbol}: ${primaryExchange} vs ${hedgeExchange}, interval: ${interval}, limit: ${limit}`);

    // 3. Fetch historical data from both exchanges
    const [primaryData, hedgeData] = await Promise.all([
      fetchExchangeHistoricalData(primaryExchange, symbol, interval, limit),
      fetchExchangeHistoricalData(hedgeExchange, symbol, interval, limit)
    ]);

    // 4. Return combined data
    return NextResponse.json({
      success: true,
      data: {
        primary: primaryData,
        hedge: hedgeData
      },
      metadata: {
        symbol,
        primaryExchange,
        hedgeExchange,
        interval,
        dataPoints: {
          primary: primaryData.length,
          hedge: hedgeData.length
        }
      }
    });

  } catch (error: any) {
    console.error('[Historical Prices] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch historical prices',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch historical price data from a specific exchange
 * Uses CCXT for standardized access to multiple exchanges
 */
async function fetchExchangeHistoricalData(
  exchange: string,
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {

  const exchangeUpper = exchange.toUpperCase();

  // Use CCXT for all exchanges - it provides unified interface
  console.log(`[Historical Prices] Fetching ${exchangeUpper} data via CCXT`);

  try {
    // Create CCXT service for the exchange
    const ccxtService = new CCXTService(exchange.toLowerCase(), {
      enableRateLimit: true,
      testnet: false, // Use mainnet for historical data (more reliable)
    });

    // Load markets first
    await ccxtService.loadMarkets();

    // Map interval to CCXT format (already compatible with most exchanges)
    const ccxtInterval = mapIntervalToCCXT(interval);

    // Fetch klines using CCXT
    const klines = await ccxtService.getHistoricalKlines(symbol, ccxtInterval, limit);

    // Convert to our format
    const result = klines.map(k => ({
      time: k.time,
      price: k.close
    }));

    console.log(`[Historical Prices] ${exchangeUpper} fetched ${result.length} data points via CCXT`);
    return result;

  } catch (error: any) {
    console.error(`[Historical Prices] ${exchangeUpper} CCXT fetch failed:`, error.message);

    // Fallback to legacy methods for specific exchanges if CCXT fails
    switch (exchangeUpper) {
      case 'BYBIT':
        console.log(`[Historical Prices] Falling back to Bybit public API`);
        return fetchBybitKlines(symbol, interval, limit);

      case 'BINGX':
        console.log(`[Historical Prices] Falling back to BingX public API`);
        return fetchBingXKlines(symbol, interval, limit);

      case 'MEXC':
        console.log(`[Historical Prices] Falling back to MEXC public API`);
        return fetchMEXCKlines(symbol, interval, limit);

      case 'OKX':
        console.log(`[Historical Prices] Falling back to OKX public API`);
        return fetchOKXKlines(symbol, interval, limit);

      default:
        console.error(`[Historical Prices] ${exchangeUpper} not supported and no fallback available`);
        return [];
    }
  }
}

/**
 * Fetch Bybit historical klines (public API)
 */
async function fetchBybitKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Map interval to Bybit format
    const bybitInterval = mapIntervalToBybit(interval);

    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`;

    console.log(`[Bybit Klines] Fetching from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.retCode !== 0) {
      throw new Error(`Bybit API error: ${data.retMsg}`);
    }

    // Convert Bybit klines to our format
    // Bybit format: [startTime, openPrice, highPrice, lowPrice, closePrice, volume, turnover]
    const klines = data.result.list.map((k: any) => ({
      time: Math.floor(parseInt(k[0]) / 1000), // Convert ms to seconds
      price: parseFloat(k[4]) // Close price
    }));

    // Bybit returns newest first, so reverse to get oldest first
    return klines.reverse();

  } catch (error) {
    console.error('[Bybit Klines] Error:', error);
    return [];
  }
}

/**
 * Fetch BingX historical klines (public API)
 */
async function fetchBingXKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Convert symbol to BingX format (e.g., BTCUSDT -> BTC-USDT)
    const bingxSymbol = symbol.includes('-') ? symbol : symbol.replace(/USDT$/, '-USDT');

    // Map interval to BingX format
    const bingxInterval = mapIntervalToBingX(interval);

    // BingX has a maximum limit of 1440 data points
    const cappedLimit = Math.min(limit, 1440);
    if (limit > 1440) {
      console.warn(`[BingX Klines] Requested limit ${limit} exceeds BingX maximum of 1440, capping to 1440`);
    }

    const url = `https://open-api.bingx.com/openApi/swap/v2/quote/klines?symbol=${bingxSymbol}&interval=${bingxInterval}&limit=${cappedLimit}`;

    console.log(`[BingX Klines] Original symbol: ${symbol}`);
    console.log(`[BingX Klines] Converted symbol: ${bingxSymbol}`);
    console.log(`[BingX Klines] Interval: ${interval} -> ${bingxInterval}`);
    console.log(`[BingX Klines] Fetching from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    console.log(`[BingX Klines] Response code: ${data.code}, msg: ${data.msg}`);
    console.log(`[BingX Klines] Data points received: ${data.data?.length || 0}`);

    if (data.code !== 0) {
      console.error(`[BingX Klines] API error response:`, data);
      throw new Error(`BingX API error: ${data.msg}`);
    }

    if (!data.data || data.data.length === 0) {
      console.warn(`[BingX Klines] No data returned for ${bingxSymbol}`);
      return [];
    }

    // Convert BingX klines to our format
    // BingX format: { time, open, high, low, close, volume }
    const klines = data.data.map((k: any) => ({
      time: Math.floor(k.time / 1000), // Convert ms to seconds
      price: parseFloat(k.close)
    }));

    console.log(`[BingX Klines] Successfully converted ${klines.length} klines`);
    console.log(`[BingX Klines] First kline:`, klines[0]);
    console.log(`[BingX Klines] Last kline:`, klines[klines.length - 1]);

    return klines;

  } catch (error) {
    console.error('[BingX Klines] Error:', error);
    return [];
  }
}

/**
 * Fetch MEXC historical klines (public API)
 */
async function fetchMEXCKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Convert symbol to MEXC format (e.g., BTCUSDT -> BTC_USDT)
    const mexcSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT');

    // Map interval to MEXC format
    const mexcInterval = mapIntervalToMEXC(interval);

    const url = `https://contract.mexc.com/api/v1/contract/kline/${mexcSymbol}?interval=${mexcInterval}&limit=${limit}`;

    console.log(`[MEXC Klines] Original symbol: ${symbol}`);
    console.log(`[MEXC Klines] Converted symbol: ${mexcSymbol}`);
    console.log(`[MEXC Klines] Fetching from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    console.log(`[MEXC Klines] Response:`, data.success, data.code);

    if (!data.success) {
      console.error(`[MEXC Klines] API error response:`, data);
      throw new Error(`MEXC API error: ${data.message}`);
    }

    // MEXC returns data in a different format: {time: [], close: [], open: [], ...}
    const klines = data.data.time.map((timestamp: number, index: number) => ({
      time: timestamp,
      price: parseFloat(data.data.close[index])
    }));

    console.log(`[MEXC Klines] Successfully converted ${klines.length} klines`);

    return klines;

  } catch (error) {
    console.error('[MEXC Klines] Error:', error);
    return [];
  }
}

/**
 * Fetch OKX historical klines (public API)
 */
async function fetchOKXKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Map interval to OKX format
    const okxInterval = mapIntervalToOKX(interval);

    const url = `https://www.okx.com/api/v5/market/candles?instId=${symbol}&bar=${okxInterval}&limit=${limit}`;

    console.log(`[OKX Klines] Fetching from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '0') {
      throw new Error(`OKX API error: ${data.msg}`);
    }

    // Convert OKX klines to our format
    // OKX format: [timestamp, open, high, low, close, volume, ...]
    const klines = data.data.map((k: any) => ({
      time: Math.floor(parseInt(k[0]) / 1000), // Convert ms to seconds
      price: parseFloat(k[4]) // Close price
    }));

    // OKX returns newest first, reverse to oldest first
    return klines.reverse();

  } catch (error) {
    console.error('[OKX Klines] Error:', error);
    return [];
  }
}

/**
 * Map interval to Bybit format
 */
function mapIntervalToBybit(interval: string): string {
  const map: { [key: string]: string } = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1d': 'D'
  };
  return map[interval] || '60';
}

/**
 * Map interval to BingX format
 */
function mapIntervalToBingX(interval: string): string {
  const map: { [key: string]: string } = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d'
  };
  return map[interval] || '1h';
}

/**
 * Map interval to MEXC format
 */
function mapIntervalToMEXC(interval: string): string {
  const map: { [key: string]: string } = {
    '1m': 'Min1',
    '5m': 'Min5',
    '15m': 'Min15',
    '1h': 'Min60',
    '4h': 'Hour4',
    '1d': 'Day1'
  };
  return map[interval] || 'Min60';
}

/**
 * Map interval to OKX format
 */
function mapIntervalToOKX(interval: string): string {
  const map: { [key: string]: string } = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1H',
    '4h': '4H',
    '1d': '1D'
  };
  return map[interval] || '1H';
}

/**
 * Map interval to CCXT format
 * CCXT uses standardized interval format: 1m, 5m, 15m, 1h, 4h, 1d
 */
function mapIntervalToCCXT(interval: string): string {
  // CCXT already uses standard format, but let's ensure consistency
  const map: { [key: string]: string } = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d'
  };
  return map[interval] || '1h';
}
