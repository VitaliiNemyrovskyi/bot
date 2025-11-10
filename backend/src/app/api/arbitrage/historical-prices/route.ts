import { NextRequest, NextResponse } from 'next/server';
import { CCXTService } from '@/lib/ccxt-service';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

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
    // Get query parameters (no authentication required for public historical data)
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

  // Gate.io has issues with CCXT limit parameter - use direct API instead
  if (exchangeUpper === 'GATEIO') {
    console.log(`[Historical Prices] Using direct Gate.io API (CCXT incompatible)`);
    return fetchGateIOKlines(symbol, interval, limit);
  }

  // BingX has a 1440 candle limit per request - use direct API to handle multiple requests
  if (exchangeUpper === 'BINGX') {
    console.log(`[Historical Prices] Using direct BingX API (supports multiple requests for limit > 1440)`);
    return fetchBingXKlines(symbol, interval, limit);
  }

  // Bybit has a 1000 candle limit per request - use direct API to handle multiple requests
  if (exchangeUpper === 'BYBIT') {
    console.log(`[Historical Prices] Using direct Bybit API (supports multiple requests for limit > 1000)`);
    return fetchBybitKlines(symbol, interval, limit);
  }

  // KuCoin uses direct API for better reliability
  if (exchangeUpper === 'KUCOIN') {
    console.log(`[Historical Prices] Using direct KuCoin API`);
    return fetchKuCoinKlines(symbol, interval, limit);
  }

  // Use CCXT for all other exchanges - it provides unified interface
  console.log(`[Historical Prices] Fetching ${exchangeUpper} data via CCXT`);

  try {
    // Create CCXT service for the exchange
    const ccxtService = new CCXTService(exchange.toLowerCase(), {
      enableRateLimit: true,
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

      case 'GATEIO':
        console.log(`[Historical Prices] Falling back to Gate.io public API`);
        return fetchGateIOKlines(symbol, interval, limit);

      case 'KUCOIN':
        console.log(`[Historical Prices] Falling back to KuCoin public API`);
        return fetchKuCoinKlines(symbol, interval, limit);

      default:
        console.error(`[Historical Prices] ${exchangeUpper} not supported and no fallback available`);
        return [];
    }
  }
}

/**
 * Fetch Bybit historical klines (public API)
 * Bybit has a limit of 1000 candles per request, so we make multiple requests if needed
 */
async function fetchBybitKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Map interval to Bybit format
    const bybitInterval = mapIntervalToBybit(interval);

    const BYBIT_MAX_LIMIT = 1000;
    const allKlines: Array<{ time: number; price: number }> = [];

    // If limit <= 1000, single request
    if (limit <= BYBIT_MAX_LIMIT) {
      console.log(`[Bybit Klines] Fetching ${limit} candles in single request`);
      const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`;

      const response = await fetchWithTimeout(url, { timeout: 60000 });
      const data = await response.json();

      if (data.retCode !== 0) {
        throw new Error(`Bybit API error: ${data.retMsg}`);
      }

      if (!data.result || !data.result.list || data.result.list.length === 0) {
        return [];
      }

      const klines = data.result.list.map((k: any) => ({
        time: Math.floor(parseInt(k[0]) / 1000),
        price: parseFloat(k[4])
      }));

      return klines.reverse();
    }

    // Multiple requests needed for limit > 1000
    console.log(`[Bybit Klines] Requested ${limit} candles, making multiple requests (max ${BYBIT_MAX_LIMIT} per request)`);

    const intervalSeconds = getIntervalSeconds(interval);
    const numRequests = Math.ceil(limit / BYBIT_MAX_LIMIT);

    console.log(`[Bybit Klines] Will make ${numRequests} requests to fetch ${limit} candles`);

    // Bybit API accepts startTime and limit
    // Start from oldest data and move forward
    const now = Math.floor(Date.now() / 1000);
    const oldestTime = now - (limit * intervalSeconds);

    for (let i = 0; i < numRequests; i++) {
      const requestLimit = Math.min(BYBIT_MAX_LIMIT, limit - (i * BYBIT_MAX_LIMIT));

      // Calculate startTime for this batch (in milliseconds)
      const startTime = (oldestTime + (i * BYBIT_MAX_LIMIT * intervalSeconds)) * 1000;
      const endTime = startTime + (requestLimit * intervalSeconds * 1000);

      const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&start=${startTime}&end=${endTime}&limit=${requestLimit}`;

      console.log(`[Bybit Klines] Request ${i + 1}/${numRequests}: fetching ${requestLimit} candles from ${new Date(startTime).toISOString()}`);

      try {
        const response = await fetchWithTimeout(url, { timeout: 60000 });
        const data = await response.json();

        if (data.retCode !== 0) {
          console.error(`[Bybit Klines] Request ${i + 1} failed:`, data.retMsg);
          break;
        }

        if (data.result && data.result.list && data.result.list.length > 0) {
          const batch = data.result.list.map((k: any) => ({
            time: Math.floor(parseInt(k[0]) / 1000),
            price: parseFloat(k[4])
          }));

          // Bybit returns newest first, so reverse
          allKlines.push(...batch.reverse());
          console.log(`[Bybit Klines] Request ${i + 1} successful: ${batch.length} candles received`);
        } else {
          console.warn(`[Bybit Klines] Request ${i + 1} returned no data`);
        }

        // Small delay between requests to avoid rate limits
        if (i < numRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (requestError: any) {
        console.error(`[Bybit Klines] Request ${i + 1} error:`, requestError.message);
        break;
      }
    }

    console.log(`[Bybit Klines] Total candles fetched: ${allKlines.length} (requested: ${limit})`);
    return allKlines;

  } catch (error) {
    console.error('[Bybit Klines] Error:', error);
    return [];
  }
}

/**
 * Fetch BingX historical klines (public API)
 * BingX has a limit of 1440 candles per request, so we make multiple requests if needed
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

    const BINGX_MAX_LIMIT = 1440;
    const allKlines: Array<{ time: number; price: number }> = [];

    // If limit <= 1440, single request
    if (limit <= BINGX_MAX_LIMIT) {
      console.log(`[BingX Klines] Fetching ${limit} candles in single request`);
      const url = `https://open-api.bingx.com/openApi/swap/v2/quote/klines?symbol=${bingxSymbol}&interval=${bingxInterval}&limit=${limit}`;

      const response = await fetchWithTimeout(url, { timeout: 60000 }); // 60 second timeout for historical data
      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`BingX API error: ${data.msg}`);
      }

      if (!data.data || data.data.length === 0) {
        return [];
      }

      return data.data.map((k: any) => ({
        time: Math.floor(k.time / 1000),
        price: parseFloat(k.close)
      }));
    }

    // Multiple requests needed for limit > 1440
    console.log(`[BingX Klines] Requested ${limit} candles, making multiple requests (max ${BINGX_MAX_LIMIT} per request)`);

    const intervalSeconds = getIntervalSeconds(interval);
    const numRequests = Math.ceil(limit / BINGX_MAX_LIMIT);

    console.log(`[BingX Klines] Will make ${numRequests} requests to fetch ${limit} candles`);

    for (let i = 0; i < numRequests; i++) {
      const requestLimit = Math.min(BINGX_MAX_LIMIT, limit - (i * BINGX_MAX_LIMIT));

      // Calculate startTime for this batch
      // BingX returns newest candles first, so we need to go back in time
      const now = Math.floor(Date.now() / 1000);
      const startTime = (now - ((i + 1) * BINGX_MAX_LIMIT * intervalSeconds)) * 1000; // Convert to ms

      const url = `https://open-api.bingx.com/openApi/swap/v2/quote/klines?symbol=${bingxSymbol}&interval=${bingxInterval}&limit=${requestLimit}&startTime=${startTime}`;

      console.log(`[BingX Klines] Request ${i + 1}/${numRequests}: fetching ${requestLimit} candles from ${new Date(startTime).toISOString()}`);

      try {
        const response = await fetchWithTimeout(url, { timeout: 60000 }); // 60 second timeout for historical data
        const data = await response.json();

        if (data.code !== 0) {
          console.error(`[BingX Klines] Request ${i + 1} failed:`, data.msg);
          break; // Stop on error, return what we have
        }

        if (data.data && data.data.length > 0) {
          const batch = data.data.map((k: any) => ({
            time: Math.floor(k.time / 1000),
            price: parseFloat(k.close)
          }));
          allKlines.push(...batch);
          console.log(`[BingX Klines] Request ${i + 1} fetched ${batch.length} candles`);
        }
      } catch (requestError: any) {
        console.error(`[BingX Klines] Request ${i + 1} timeout/error:`, requestError.message);
        // Return partial data collected so far
        console.log(`[BingX Klines] Returning ${allKlines.length} candles collected before timeout`);
        break;
      }

      // Small delay between requests to avoid rate limiting
      if (i < numRequests - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Sort by time (oldest first) and remove duplicates
    const uniqueKlines = Array.from(
      new Map(allKlines.map(k => [k.time, k])).values()
    ).sort((a, b) => a.time - b.time);

    console.log(`[BingX Klines] Successfully fetched total ${uniqueKlines.length} candles (requested ${limit})`);
    console.log(`[BingX Klines] First kline:`, uniqueKlines[0]);
    console.log(`[BingX Klines] Last kline:`, uniqueKlines[uniqueKlines.length - 1]);

    return uniqueKlines;

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

    const response = await fetchWithTimeout(url, { timeout: 60000 }); // 60 second timeout for historical data
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
    // Convert symbol format: BTCUSDT → BTC-USDT-SWAP or 0GUSDT → 0G-USDT-SWAP
    let instId: string;
    if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4);
      instId = `${base}-USDT-SWAP`;
    } else if (symbol.endsWith('USDC')) {
      const base = symbol.slice(0, -4);
      instId = `${base}-USDC-SWAP`;
    } else {
      instId = symbol; // Fallback to original symbol
    }

    // Map interval to OKX format
    const okxInterval = mapIntervalToOKX(interval);

    const url = `https://www.okx.com/api/v5/market/candles?instId=${instId}&bar=${okxInterval}&limit=${limit}`;

    console.log(`[OKX Klines] Original symbol: ${symbol}`);
    console.log(`[OKX Klines] Converted symbol: ${instId}`);
    console.log(`[OKX Klines] Fetching from: ${url}`);

    const response = await fetchWithTimeout(url, { timeout: 60000 }); // 60 second timeout for historical data
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
 * Fetch Gate.io historical klines (public API)
 */
async function fetchGateIOKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Convert symbol to Gate.io format (e.g., BTCUSDT -> BTC_USDT)
    const gateioSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT');

    // Map interval to Gate.io format
    const gateioInterval = mapIntervalToGateIO(interval);

    // Calculate timestamp range (Gate.io requires 'from' and 'to' parameters)
    const now = Math.floor(Date.now() / 1000);
    const intervalSeconds = getIntervalSeconds(interval);
    const from = now - (limit * intervalSeconds);

    const url = `https://api.gateio.ws/api/v4/futures/usdt/candlesticks?contract=${gateioSymbol}&interval=${gateioInterval}&from=${from}&to=${now}`;

    console.log(`[Gate.io Klines] Original symbol: ${symbol}`);
    console.log(`[Gate.io Klines] Converted symbol: ${gateioSymbol}`);
    console.log(`[Gate.io Klines] Interval: ${interval} -> ${gateioInterval}`);
    console.log(`[Gate.io Klines] Time range: ${from} to ${now} (${limit} candles)`);
    console.log(`[Gate.io Klines] Fetching from: ${url}`);

    const response = await fetchWithTimeout(url, { timeout: 60000 });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gate.io Klines] API error response:`, errorText);
      throw new Error(`Gate.io API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`[Gate.io Klines] Data points received: ${data.length || 0}`);

    if (!data || data.length === 0) {
      console.warn(`[Gate.io Klines] No data returned for ${gateioSymbol}`);
      return [];
    }

    // Convert Gate.io klines to our format
    // Gate.io format: { t: timestamp, o: open, h: high, l: low, c: close, v: volume }
    const klines = data.map((k: any) => ({
      time: k.t, // Gate.io returns timestamp in seconds
      price: parseFloat(k.c) // Close price
    }));

    console.log(`[Gate.io Klines] Successfully converted ${klines.length} klines`);
    console.log(`[Gate.io Klines] First kline:`, klines[0]);
    console.log(`[Gate.io Klines] Last kline:`, klines[klines.length - 1]);

    return klines;

  } catch (error) {
    console.error('[Gate.io Klines] Error:', error);
    return [];
  }
}

/**
 * Fetch KuCoin historical klines (public API)
 * KuCoin Futures API documentation: https://www.kucoin.com/docs/rest/futures-trading/market-data/get-klines
 */
async function fetchKuCoinKlines(
  symbol: string,
  interval: string,
  limit: number
): Promise<Array<{ time: number; price: number }>> {
  try {
    // Convert symbol format: BTCUSDT → XBTUSDTM, ETHUSDT → ETHUSDTM, AIAUSDT → AIAUSDTM
    const normalizedSymbol = symbol.replace(/[-/]/g, '').toUpperCase();
    const base = normalizedSymbol.replace('USDT', '');
    // BTC -> XBT for KuCoin, others stay the same
    const kucoinBase = base === 'BTC' ? 'XBT' : base;
    const kucoinSymbol = `${kucoinBase}USDTM`;

    // Map interval to KuCoin format (granularity in minutes)
    const granularity = mapIntervalToKuCoin(interval);

    // KuCoin has a maximum of 500 candles per request
    const KUCOIN_MAX_LIMIT = 500;
    const requestLimit = Math.min(limit, KUCOIN_MAX_LIMIT);

    // Calculate time range
    const now = Math.floor(Date.now() / 1000);
    const intervalSeconds = getIntervalSeconds(interval);
    const from = now - (requestLimit * intervalSeconds);

    const url = `https://api-futures.kucoin.com/api/v1/kline/query?symbol=${kucoinSymbol}&granularity=${granularity}&from=${from * 1000}&to=${now * 1000}`;

    console.log(`[KuCoin Klines] Original symbol: ${symbol}`);
    console.log(`[KuCoin Klines] Converted symbol: ${kucoinSymbol}`);
    console.log(`[KuCoin Klines] Interval: ${interval} -> ${granularity} minutes`);
    console.log(`[KuCoin Klines] Requested: ${limit}, Limit: ${requestLimit} candles (max 500)`);
    console.log(`[KuCoin Klines] Time range: ${new Date(from * 1000).toISOString()} to ${new Date(now * 1000).toISOString()}`);
    console.log(`[KuCoin Klines] Fetching from: ${url}`);

    const response = await fetchWithTimeout(url, { timeout: 60000 });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[KuCoin Klines] API error response:`, errorText);
      throw new Error(`KuCoin API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.code !== '200000') {
      console.error(`[KuCoin Klines] API error: ${result.msg || 'Unknown error'}`);
      throw new Error(`KuCoin API error: ${result.msg || 'Unknown error'}`);
    }

    const data = result.data || [];

    console.log(`[KuCoin Klines] Data points received: ${data.length}`);

    if (data.length === 0) {
      console.warn(`[KuCoin Klines] No data returned for ${kucoinSymbol}. Contract may be too new or data not available for this time range.`);
      return [];
    }

    // Convert KuCoin klines to our format
    // KuCoin format: [timestamp, open, high, low, close, volume]
    const klines = data.map((k: any) => ({
      time: Math.floor(parseInt(k[0]) / 1000), // Convert ms to seconds
      price: parseFloat(k[4]) // Close price
    }));

    // Sort by time ascending (oldest first)
    klines.sort((a, b) => a.time - b.time);

    console.log(`[KuCoin Klines] Successfully converted ${klines.length} klines`);
    if (klines.length > 0) {
      console.log(`[KuCoin Klines] First kline:`, new Date(klines[0].time * 1000).toISOString(), `Price: ${klines[0].price}`);
      console.log(`[KuCoin Klines] Last kline:`, new Date(klines[klines.length - 1].time * 1000).toISOString(), `Price: ${klines[klines.length - 1].price}`);
    }

    return klines;

  } catch (error: any) {
    console.error('[KuCoin Klines] Error:', error.message);
    return [];
  }
}

/**
 * Get interval in seconds
 */
function getIntervalSeconds(interval: string): number {
  const map: { [key: string]: number } = {
    '1m': 60,
    '5m': 300,
    '15m': 900,
    '1h': 3600,
    '4h': 14400,
    '1d': 86400
  };
  return map[interval] || 3600;
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
 * Map interval to Gate.io format
 */
function mapIntervalToGateIO(interval: string): string {
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

/**
 * Map interval to KuCoin format
 * KuCoin uses granularity in minutes: 1, 5, 15, 60, 240, 1440
 */
function mapIntervalToKuCoin(interval: string): number {
  const map: { [key: string]: number } = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '1h': 60,
    '4h': 240,
    '1d': 1440
  };
  return map[interval] || 60; // Default to 1 hour
}
