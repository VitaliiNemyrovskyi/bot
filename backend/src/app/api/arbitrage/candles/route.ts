import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrage/candles
 *
 * Fetches OHLC candlestick data for chart visualization
 * Uses direct exchange APIs (primarily Bybit) for reliable data access
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
 * Fetch OHLC candles from exchange using direct API
 */
async function fetchCandlesFromExchange(
  exchange: string,
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    console.log(`[Candles] Fetching from ${exchange} via direct API`);

    // Normalize symbol format (remove slashes)
    const normalizedSymbol = symbol.replace(/\//g, '');

    switch (exchange) {
      case 'BYBIT':
        return await fetchBybitCandles(normalizedSymbol, interval, limit);

      case 'BINANCE':
        return await fetchBinanceCandles(normalizedSymbol, interval, limit);

      case 'OKX':
        return await fetchOKXCandles(normalizedSymbol, interval, limit);

      case 'GATEIO':
      case 'GATE':
        return await fetchGateIOCandles(normalizedSymbol, interval, limit);

      case 'KUCOIN':
        return await fetchKuCoinCandles(normalizedSymbol, interval, limit);

      case 'BITGET':
        return await fetchBitgetCandles(normalizedSymbol, interval, limit);

      case 'MEXC':
        return await fetchMEXCCandles(normalizedSymbol, interval, limit);

      case 'BINGX':
        return await fetchBingXCandles(normalizedSymbol, interval, limit);

      default:
        console.warn(`[Candles] Exchange ${exchange} not implemented, returning empty data`);
        return [];
    }

  } catch (error: any) {
    console.error(`[Candles] ${exchange} fetch failed:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from Bybit API
 * API Docs: https://bybit-exchange.github.io/docs/v5/market/kline
 */
async function fetchBybitCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Convert interval format: 1m -> 1, 5m -> 5, 1h -> 60, 4h -> 240, 1d -> D
    let bybitInterval: string;
    if (interval.endsWith('m')) {
      bybitInterval = interval.replace('m', '');
    } else if (interval.endsWith('h')) {
      const hours = parseInt(interval.replace('h', ''));
      bybitInterval = (hours * 60).toString();
    } else if (interval === '1d') {
      bybitInterval = 'D';
    } else {
      bybitInterval = interval;
    }

    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`;
    console.log(`[Bybit] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.retCode !== 0) {
      console.error(`[Bybit] API error:`, data);
      return [];
    }

    if (!data.result?.list || data.result.list.length === 0) {
      console.warn(`[Bybit] No data returned for ${symbol}`);
      return [];
    }

    // Bybit returns: [timestamp, open, high, low, close, volume, turnover]
    const candles: CandleData[] = data.result.list
      .map((candle: string[]) => ({
        time: Math.floor(parseInt(candle[0]!) / 1000), // Convert ms to seconds
        open: parseFloat(candle[1]!),
        high: parseFloat(candle[2]!),
        low: parseFloat(candle[3]!),
        close: parseFloat(candle[4]!)
      }))
      .reverse(); // Bybit returns newest first, we need oldest first

    console.log(`[Bybit] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[Bybit] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from Binance API
 * API Docs: https://binance-docs.github.io/apidocs/futures/en/#kline-candlestick-data
 */
async function fetchBinanceCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    console.log(`[Binance] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[Binance] No data returned for ${symbol}`);
      return [];
    }

    // Binance returns: [timestamp, open, high, low, close, volume, closeTime, ...]
    const candles: CandleData[] = data.map((candle: any[]) => ({
      time: Math.floor(candle[0] / 1000), // Convert ms to seconds
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4])
    }));

    console.log(`[Binance] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[Binance] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from OKX API
 * API Docs: https://www.okx.com/docs-v5/en/#order-book-trading-market-data-get-candlesticks
 */
async function fetchOKXCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Convert symbol format: BTCUSDT -> BTC-USDT-SWAP
    const base = symbol.replace('USDT', '');
    const okxSymbol = `${base}-USDT-SWAP`;

    // Convert interval: 1m -> 1m, 1h -> 1H, 1d -> 1D
    const okxInterval = interval.replace('h', 'H').replace('d', 'D');

    const url = `https://www.okx.com/api/v5/market/candles?instId=${okxSymbol}&bar=${okxInterval}&limit=${limit}`;
    console.log(`[OKX] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '0' || !data.data || data.data.length === 0) {
      console.warn(`[OKX] No data returned for ${symbol}`);
      return [];
    }

    // OKX returns: [timestamp, open, high, low, close, volume, ...]
    const candles: CandleData[] = data.data
      .map((candle: string[]) => ({
        time: Math.floor(parseInt(candle[0]!) / 1000), // Convert ms to seconds
        open: parseFloat(candle[1]!),
        high: parseFloat(candle[2]!),
        low: parseFloat(candle[3]!),
        close: parseFloat(candle[4]!)
      }))
      .reverse(); // OKX returns newest first, we need oldest first

    console.log(`[OKX] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[OKX] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from Gate.io API
 * API Docs: https://www.gate.io/docs/developers/apiv4/en/#market-candlesticks
 */
async function fetchGateIOCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Convert symbol format: BTCUSDT -> BTC_USDT
    const gateSymbol = symbol.replace('USDT', '_USDT');

    // Convert interval: 1m -> 1m, 1h -> 1h, 1d -> 1d (same format)
    const url = `https://api.gateio.ws/api/v4/futures/usdt/candlesticks?contract=${gateSymbol}&interval=${interval}&limit=${limit}`;
    console.log(`[GateIO] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`[GateIO] No data returned for ${symbol}`);
      return [];
    }

    // Gate.io returns: {t: timestamp, o: open, h: high, l: low, c: close, v: volume}
    const candles: CandleData[] = data.map((candle: any) => ({
      time: candle.t,
      open: parseFloat(candle.o),
      high: parseFloat(candle.h),
      low: parseFloat(candle.l),
      close: parseFloat(candle.c)
    }));

    console.log(`[GateIO] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[GateIO] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from KuCoin API
 * API Docs: https://www.kucoin.com/docs/rest/futures-trading/market-data/get-klines
 */
async function fetchKuCoinCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Convert symbol format: BTCUSDT -> XBTUSDTM
    // Extract base currency
    const base = symbol.replace('USDT', '');
    // KuCoin uses XBT for Bitcoin
    const kucoinBase = base === 'BTC' ? 'XBT' : base;
    // KuCoin perpetuals end with M
    const kucoinSymbol = `${kucoinBase}USDTM`;

    // Note: KuCoin API returns most recent candles when from/to are omitted
    // Using from/to parameters can result in empty data if no trading occurred in that timeframe
    const url = `https://api-futures.kucoin.com/api/v1/kline/query?symbol=${kucoinSymbol}&granularity=${getKuCoinGranularity(interval)}`;
    console.log(`[KuCoin] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '200000' || !data.data || data.data.length === 0) {
      console.warn(`[KuCoin] No data returned for ${symbol}`, data);
      return [];
    }

    // KuCoin returns: [timestamp, open, high, low, close, volume]
    const candles: CandleData[] = data.data
      .slice(0, limit)
      .map((candle: number[]) => ({
        time: Math.floor(candle[0]! / 1000), // Convert ms to seconds
        open: candle[1]!,
        high: candle[2]!,
        low: candle[3]!,
        close: candle[4]!
      }))
      .sort((a: CandleData, b: CandleData) => a.time - b.time); // Ensure ascending order by timestamp

    console.log(`[KuCoin] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[KuCoin] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Get KuCoin granularity in minutes
 */
function getKuCoinGranularity(interval: string): number {
  if (interval.endsWith('m')) {
    return parseInt(interval.replace('m', ''));
  } else if (interval.endsWith('h')) {
    return parseInt(interval.replace('h', '')) * 60;
  } else if (interval === '1d') {
    return 1440;
  }
  return 1; // default 1m
}

/**
 * Fetch candles from Bitget API
 * API Docs: https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
 */
async function fetchBitgetCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Bitget V2 API - symbol without suffix, productType parameter required
    // API Docs: https://www.bitget.com/api-doc/contract/market/Get-Candle-Data
    const bitgetSymbol = symbol; // Use original format (e.g., BTCUSDT)

    // Convert interval: 1m -> 1m, 5m -> 5m, 1h -> 1H, 1d -> 1D
    const bitgetInterval = interval.replace('h', 'H').replace('d', 'D');

    // Note: Bitget V2 API returns most recent candles when startTime/endTime are omitted
    const url = `https://api.bitget.com/api/v2/mix/market/candles?symbol=${bitgetSymbol}&productType=USDT-FUTURES&granularity=${bitgetInterval}&limit=${limit}`;
    console.log(`[Bitget] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '00000' || !data.data || data.data.length === 0) {
      console.warn(`[Bitget] No data returned for ${symbol}`, data);
      return [];
    }

    // Bitget returns: [timestamp, open, high, low, close, volume, ...]
    const candles: CandleData[] = data.data
      .slice(0, limit)
      .map((candle: string[]) => ({
        time: Math.floor(parseInt(candle[0]!) / 1000), // Convert ms to seconds
        open: parseFloat(candle[1]!),
        high: parseFloat(candle[2]!),
        low: parseFloat(candle[3]!),
        close: parseFloat(candle[4]!)
      }))
      .sort((a: CandleData, b: CandleData) => a.time - b.time); // Ensure ascending order by timestamp

    console.log(`[Bitget] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[Bitget] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from MEXC API
 * API Docs: https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data
 */
async function fetchMEXCCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Symbol format: BTCUSDT -> BTC_USDT
    const mexcSymbol = symbol.replace('USDT', '_USDT');

    // Convert interval: 1m -> Min1, 5m -> Min5, 1h -> Hour1, 1d -> Day1
    let mexcInterval: string;
    if (interval.endsWith('m')) {
      mexcInterval = `Min${interval.replace('m', '')}`;
    } else if (interval.endsWith('h')) {
      mexcInterval = `Hour${interval.replace('h', '')}`;
    } else if (interval === '1d') {
      mexcInterval = 'Day1';
    } else {
      mexcInterval = 'Min1';
    }

    const url = `https://contract.mexc.com/api/v1/contract/kline/${mexcSymbol}?interval=${mexcInterval}&limit=${limit}`;
    console.log(`[MEXC] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success || !data.data || !data.data.data || data.data.data.length === 0) {
      console.warn(`[MEXC] No data returned for ${symbol}`, data);
      return [];
    }

    // MEXC returns: {time: timestamp, open: open, high: high, low: low, close: close}
    const candles: CandleData[] = data.data.data
      .slice(0, limit)
      .map((candle: any) => ({
        time: Math.floor(candle.time / 1000), // Convert ms to seconds
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close)
      }))
      .reverse(); // MEXC returns newest first

    console.log(`[MEXC] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[MEXC] Fetch error:`, error.message);
    return [];
  }
}

/**
 * Fetch candles from BingX API
 * API Docs: https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#K-Line%20Data
 */
async function fetchBingXCandles(
  symbol: string,
  interval: string,
  limit: number
): Promise<CandleData[]> {
  try {
    // Convert symbol format: BTCUSDT -> BTC-USDT
    const bingxSymbol = symbol.includes('-') ? symbol : symbol.replace(/USDT$/, '-USDT').replace(/USDC$/, '-USDC');

    // BingX uses same interval format as others (1m, 5m, 1h, 4h, 1d)
    const url = `https://open-api.bingx.com/openApi/swap/v2/quote/klines?symbol=${bingxSymbol}&interval=${interval}&limit=${limit}`;
    console.log(`[BingX] Fetching: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 0 || !data.data || data.data.length === 0) {
      console.warn(`[BingX] No data returned for ${symbol}`, data);
      return [];
    }

    // BingX returns: [{time: timestamp_ms, open: string, high: string, low: string, close: string, volume: string}]
    const candles: CandleData[] = data.data
      .slice(0, limit)
      .map((candle: any) => ({
        time: Math.floor(candle.time / 1000), // Convert ms to seconds
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close)
      }));

    console.log(`[BingX] Fetched ${candles.length} candles for ${symbol}`);
    return candles;

  } catch (error: any) {
    console.error(`[BingX] Fetch error:`, error.message);
    return [];
  }
}

