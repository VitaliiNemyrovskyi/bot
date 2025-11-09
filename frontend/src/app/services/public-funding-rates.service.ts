import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, catchError, map, firstValueFrom, shareReplay, take, timeout } from 'rxjs';
import { ExchangeFundingRate, FundingRateOpportunity, SpreadStabilityMetrics } from '../models/public-funding-rate.model';
import { StatisticalUtilsService } from './statistical-utils.service';
import { normalizeFundingRateTo1h } from '@shared/lib';

/**
 * Public Funding Rates Service
 *
 * Fetches funding rate data directly from exchange public APIs
 * NO API KEYS REQUIRED - all endpoints are public
 */
@Injectable({
  providedIn: 'root'
})
export class PublicFundingRatesService {
  // Exchange trading fees (taker fees per trade)
  // Arbitrage requires 4 trades: open long, open short, close long, close short
  private readonly EXCHANGE_FEES: Record<string, number> = {
    BYBIT: 0.055,   // 0.055% per trade × 4 = 0.22% total
    BINGX: 0.05,    // 0.05% per trade × 4 = 0.20% total
    MEXC: 0.03,     // 0.03% per trade × 4 = 0.12% total
    BINANCE: 0.04,  // 0.04% per trade × 4 = 0.16% total
    GATEIO: 0.05,   // 0.05% per trade × 4 = 0.20% total
    BITGET: 0.06,   // 0.06% per trade × 4 = 0.24% total
    OKX: 0.05,      // 0.05% per trade × 4 = 0.20% total
  };

  // Cache for the funding rates observable to prevent duplicate HTTP requests
  private fundingRatesCache$?: Observable<FundingRateOpportunity[]>;
  private lastFetchTime = 0;
  private readonly CACHE_DURATION_MS = 0; // No cache - always fetch fresh data

  constructor(
    private http: HttpClient,
    private statisticalUtils: StatisticalUtilsService // PHASE2: Statistical calculations
  ) {}

  /**
   * Refresh funding rates by fetching directly from exchange APIs
   * This provides real-time data when user opens a trading pair
   *
   * @param exchanges - Array of exchange names (e.g., ['GATEIO', 'BINGX'])
   * @param symbol - Trading symbol (e.g., 'AVNTUSDT')
   * @returns Observable of fresh funding rate data
   */
  refreshFundingRates(exchanges: string[], symbol: string): Observable<{
    exchange: string;
    symbol: string;
    fundingRate: string;
    nextFundingTime: number;
    fundingInterval: string;
  }[]> {
    const url = `/api/arbitrage/refresh-funding-rate`;
    const body = { exchanges, symbol };

    console.log(`[PublicFundingRatesService] Refreshing funding rates from exchanges for ${exchanges.join(', ')} - ${symbol}`);

    return this.http.post<{
      success: boolean;
      data: {
        exchange: string;
        symbol: string;
        fundingRate: string;
        nextFundingTime: number;
        fundingInterval: string;
      }[];
      timestamp: string;
    }>(url, body).pipe(
      map(response => {
        if (!response.success) {
          console.error('[PublicFundingRatesService] API error:', response);
          return [];
        }

        console.log(`[PublicFundingRatesService] Refreshed ${response.data.length} funding rates`);
        return response.data;
      }),
      catchError(error => {
        console.error('[PublicFundingRatesService] Error refreshing funding rates:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates for specific exchanges and symbol
   * Optimized endpoint for arbitrage chart - returns only needed data
   *
   * @param exchanges - Array of exchange names (e.g., ['GATEIO', 'BINGX'])
   * @param symbol - Trading symbol (e.g., 'AVNTUSDT')
   * @returns Observable of funding rate data for specified exchanges
   */
  getArbitrageFundingRates(exchanges: string[], symbol: string): Observable<{
    exchange: string;
    symbol: string;
    fundingRate: string;
    nextFundingTime: number;
    fundingInterval: string;
  }[]> {
    const exchangesParam = exchanges.join(',');
    const url = `/api/arbitrage/public-funding-rates?exchanges=${exchangesParam}&symbol=${symbol}`;

    console.log(`[PublicFundingRatesService] Fetching funding rates for ${exchanges.join(', ')} - ${symbol}`);

    return this.http.get<{
      success: boolean;
      data: {
        exchange: string;
        symbol: string;
        fundingRate: string;
        nextFundingTime: number;
        fundingInterval: string;
      }[];
      timestamp: string;
    }>(url).pipe(
      map(response => {
        if (!response.success) {
          console.error('[PublicFundingRatesService] API error:', response);
          return [];
        }

        console.log(`[PublicFundingRatesService] Received ${response.data.length} funding rates`);
        return response.data;
      }),
      catchError(error => {
        console.error('[PublicFundingRatesService] Error fetching arbitrage funding rates:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from selected exchanges
   * Returns array of opportunities sorted by funding spread
   *
   * IMPORTANT: This method implements request caching to prevent duplicate HTTP requests.
   * Multiple subscriptions within 5 seconds will share the same cached Observable.
   *
   * @param selectedExchanges - Set of exchange names to fetch (e.g., new Set(['BYBIT', 'BINGX']))
   *                           If not provided or empty, fetches from all exchanges
   */
  getFundingRatesOpportunities(selectedExchanges?: Set<string>): Observable<FundingRateOpportunity[]> {
    const now = Date.now();
    const cacheExpired = (now - this.lastFetchTime) > this.CACHE_DURATION_MS;

    // If cache exists and hasn't expired, return cached observable
    if (this.fundingRatesCache$ && !cacheExpired) {
      const cacheAge = now - this.lastFetchTime;
      console.log(`[PublicFundingRatesService] Using cached data (age: ${(cacheAge / 1000).toFixed(1)}s)`);
      return this.fundingRatesCache$;
    }

    // Determine which exchanges to fetch from
    const shouldFetch = (exchange: string) => {
      if (!selectedExchanges || selectedExchanges.size === 0) {
        return true; // Fetch all if no filter specified
      }
      return selectedExchanges.has(exchange.toUpperCase());
    };

    // Build requests object dynamically based on selected exchanges
    const requests: Record<string, Observable<ExchangeFundingRate[]>> = {};

    if (shouldFetch('BYBIT')) requests['bybit'] = this.fetchBybitFundingRates();
    if (shouldFetch('BINGX')) requests['bingx'] = this.fetchBingXFundingRates();
    if (shouldFetch('MEXC')) requests['mexc'] = this.fetchMEXCFundingRates();
    if (shouldFetch('BINANCE')) requests['binance'] = this.fetchBinanceFundingRates();
    if (shouldFetch('GATEIO')) requests['gateio'] = this.fetchGateIOFundingRates();
    if (shouldFetch('BITGET')) requests['bitget'] = this.fetchBitgetFundingRates();
    if (shouldFetch('OKX')) requests['okx'] = this.fetchOKXFundingRates();

    const exchangeNames = Object.keys(requests).map(k => k.toUpperCase()).join(', ');
    console.log(`[PublicFundingRatesService] Fetching fresh data from: ${exchangeNames || 'NO EXCHANGES SELECTED'}`);
    this.lastFetchTime = now;

    // If no exchanges selected, return empty array immediately
    if (Object.keys(requests).length === 0) {
      console.log('[PublicFundingRatesService] No exchanges selected, returning empty array');
      return of([]);
    }

    // Fetch from selected exchanges in parallel
    this.fundingRatesCache$ = forkJoin(requests).pipe(
      take(1),
      map(results => {
        // Combine all exchange data
        const allRates: ExchangeFundingRate[] = Object.values(results).flat();
        console.log(`[PublicFundingRatesService] Received ${allRates.length} funding rates from ${Object.keys(requests).length} exchanges`);

        // Calculate opportunities
        return this.calculateOpportunities(allRates);
      }),
      catchError(error => {
        console.error('[PublicFundingRates] Error fetching funding rates:', error);
        // Clear cache on error so next request will retry
        this.fundingRatesCache$ = undefined;
        this.lastFetchTime = 0;
        return of([]);
      }),
      shareReplay({ bufferSize: 1, refCount: false }) // Share result with all subscribers
    );

    return this.fundingRatesCache$;
  }

  /**
   * Fetch funding rates from Bybit via backend proxy
   * Backend proxies requests to bypass CORS restrictions and use Redis/DB cache
   * Endpoint: GET /api/bybit/public-funding-rates
   * Documentation: https://bybit-exchange.github.io/docs/v5/market/tickers
   */
  private fetchBybitFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS and leverage Redis cache
    const url = '/api/bybit/public-funding-rates';

    interface BybitResponse {
      retCode: number;
      retMsg: string;
      result?: {
        category: string;
        list: {
          symbol: string;
          fundingRate: string;
          fundingRateTimestamp: string;
          fundingInterval: string;
          markPrice: string;
          indexPrice: string;
        }[];
      };
    }

    return this.http.get<BybitResponse>(url).pipe(
      map(response => {
        if (response.retCode !== 0 || !response.result?.list) {
          console.error('[Bybit] API error:', response.retMsg);
          return [];
        }

        const tickers = response.result.list;
        console.log(`[Bybit] Fetched ${tickers.length} tickers via proxy`);

        return tickers
          .filter(t => t.symbol && t.fundingRate && t.markPrice)
          .map(t => ({
            exchange: 'BYBIT',
            symbol: t.symbol.replace(/[\\/\-_:]/g, ''), // BTCUSDT
            originalSymbol: t.symbol, // BTCUSDT
            fundingRate: t.fundingRate,
            nextFundingTime: parseInt(t.fundingRateTimestamp) || 0,
            lastPrice: t.markPrice,
            fundingInterval: t.fundingInterval || '-', // From backend (e.g., "8h")
            volume24h: undefined, // Not provided in premium index endpoint
            openInterest: undefined, // Not provided in premium index endpoint
            high24h: undefined,
            low24h: undefined,
          } as ExchangeFundingRate));
      }),
      catchError((error: Error) => {
        console.error('[Bybit] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from Binance via backend proxy
   * Backend proxies requests to bypass CORS restrictions
   * Endpoint: GET /api/binance/public-funding-rates
   * Documentation: https://binance-docs.github.io/apidocs/futures/en/#mark-price
   */
  private fetchBinanceFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS
    const url = '/api/binance/public-funding-rates';

    interface BinanceRate {
      symbol: string;
      lastFundingRate: string;
      markPrice: string;
      nextFundingTime: string;
      fundingInterval?: string;
    }

    return this.http.get<BinanceRate[]>(url).pipe(
      map(response => {
        if (!Array.isArray(response)) {
          console.error('[Binance] Invalid response format');
          return [];
        }

        console.log(`[Binance] Fetched ${response.length} premium index entries via proxy`);

        return response
          .filter(p => p.symbol && p.lastFundingRate && p.markPrice)
          .map(p => ({
            exchange: 'BINANCE',
            symbol: p.symbol, // Already in format BTCUSDT
            originalSymbol: p.symbol,
            fundingRate: p.lastFundingRate,
            nextFundingTime: parseInt(p.nextFundingTime) || 0,
            lastPrice: p.markPrice,
            fundingInterval: p.fundingInterval || '-', // Dash if not available
            volume24h: '0', // Not provided in premium index endpoint
            openInterest: '0', // Not provided in premium index endpoint
            high24h: '0',
            low24h: '0',
          } as ExchangeFundingRate));
      }),
      catchError((error: Error) => {
        console.error('[Binance] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from BingX via backend proxy
   * Backend proxies requests to bypass CORS restrictions
   * Endpoint: GET /api/bingx/public-funding-rates
   * Documentation: https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html
   */
  private fetchBingXFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS
    const url = '/api/bingx/public-funding-rates';

    interface BingXResponse {
      code: number;
      msg?: string;
      data: {
        symbol: string;
        lastFundingRate: string;
        markPrice: string;
        nextFundingTime: string;
        fundingInterval?: string;
        volume24h?: string;
        openInterest?: string;
        high24h?: string;
        low24h?: string;
      }[];
    }

    return this.http.get<BingXResponse>(url).pipe(
      timeout(20000), // 20 second timeout (BingX is slow)
      map(response => {
        if (response.code !== 0 || !response.data) {
          console.error('[BingX] API error:', response.msg);
          return [];
        }

        const premiumIndex = response.data;
        console.log(`[BingX] Fetched ${premiumIndex.length} premium index entries via proxy`);

        return premiumIndex
          .filter(p => p.symbol && p.lastFundingRate && p.markPrice)
          .map(p => ({
            exchange: 'BINGX',
            symbol: p.symbol.replace(/[\\/\-_:]/g, ''), // BTC-USDT -> BTCUSDT
            originalSymbol: p.symbol, // BTC-USDT
            fundingRate: p.lastFundingRate,
            nextFundingTime: parseInt(p.nextFundingTime) || 0,
            lastPrice: p.markPrice,
            fundingInterval: p.fundingInterval || '-', // Dash if not available
            volume24h: p.volume24h,
            openInterest: p.openInterest,
            high24h: p.high24h,
            low24h: p.low24h,
          } as ExchangeFundingRate));
      }),
      catchError((error: Error) => {
        console.error('[BingX] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from MEXC via backend proxy
   * Backend proxies requests to bypass CORS restrictions
   * Endpoint: GET /api/mexc/public-funding-rates
   * Documentation: https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data
   */
  private fetchMEXCFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS
    const url = '/api/mexc/public-funding-rates';

    interface MEXCResponse {
      code: number;
      msg?: string;
      data: {
        symbol: string;
        fundingRate: number;
        lastPrice: number;
        fairPrice: number;
        fundingInterval?: string;
        volume24?: number;
        holdVol?: number;
        high24Price?: number;
        low24Price?: number;
      }[];
    }

    return this.http.get<MEXCResponse>(url).pipe(
      map(response => {
        if (response.code !== 0 || !response.data) {
          console.error('[MEXC] API error:', response.msg);
          return [];
        }

        const tickers = response.data;
        console.log(`[MEXC] Fetched ${tickers.length} tickers via proxy`);

        return tickers
          .filter(t =>
            t.symbol &&
            t.fundingRate !== undefined &&
            t.fundingRate !== 0 &&
            (t.lastPrice > 0 || t.fairPrice > 0)
          )
          .map(t => ({
            exchange: 'MEXC',
            symbol: t.symbol.replace(/[\\/\-_:]/g, ''), // BTC_USDT -> BTCUSDT
            originalSymbol: t.symbol, // BTC_USDT
            fundingRate: t.fundingRate.toString(),
            nextFundingTime: 0, // MEXC doesn't provide nextFundingTime in tickers
            lastPrice: t.lastPrice > 0 ? t.lastPrice.toString() : t.fairPrice.toString(),
            fundingInterval: t.fundingInterval || '-', // Dash if not available
            volume24h: t.volume24 ? t.volume24.toString() : undefined,
            openInterest: t.holdVol ? t.holdVol.toString() : undefined,
            high24h: t.high24Price ? t.high24Price.toString() : undefined,
            low24h: t.low24Price ? t.low24Price.toString() : undefined,
          } as ExchangeFundingRate));
      }),
      catchError((error: Error) => {
        console.error('[MEXC] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from Gate.io via backend proxy
   * Backend proxies requests to bypass CORS restrictions
   * Endpoint: GET /api/gateio/public-funding-rates
   * Documentation: https://www.gate.io/docs/developers/apiv4/#list-all-futures-contracts
   */
  private fetchGateIOFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS
    const url = '/api/gateio/public-funding-rates';

    interface GateIOContract {
      name: string;
      funding_rate: string;
      last_price: string;
      funding_next_apply: string;
      fundingInterval?: string;
      trade_size?: string;
      position_size?: string;
      in_delisting: boolean;
    }

    return this.http.get<GateIOContract[]>(url).pipe(
      map(response => {
        if (!Array.isArray(response)) {
          console.error('[Gate.io] API error: Expected array response');
          return [];
        }

        const contracts = response;
        console.log(`[Gate.io] Fetched ${contracts.length} contracts via proxy`);

        return contracts
          .filter(c =>
            c.name &&
            c.funding_rate &&
            c.last_price &&
            !c.in_delisting
          )
          .map(c => ({
            exchange: 'GATEIO',
            symbol: c.name.replace(/[\\/\-_:]/g, ''), // BTC_USDT -> BTCUSDT
            originalSymbol: c.name, // BTC_USDT
            fundingRate: c.funding_rate,
            nextFundingTime: parseInt(c.funding_next_apply) * 1000 || 0, // Convert to ms
            lastPrice: c.last_price,
            fundingInterval: c.fundingInterval || '-', // Dash if not available
            volume24h: c.trade_size,
            openInterest: c.position_size,
            high24h: undefined,
            low24h: undefined,
          } as ExchangeFundingRate));
      }),
      catchError((error: Error) => {
        console.error('[Gate.io] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from Bitget via backend proxy
   * Backend proxies requests to bypass CORS restrictions
   * Endpoint: GET /api/bitget/public-funding-rates
   * Documentation: https://www.bitget.com/api-doc/contract/market/Get-Current-Funding-Rate
   */
  private fetchBitgetFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS
    const url = '/api/bitget/public-funding-rates';

    interface BitgetResponse {
      code: string;
      msg?: string;
      data: {
        symbol: string;
        fundingRate: string;
        nextUpdate: string;
        fundingRateInterval?: number;
      }[];
    }

    return this.http.get<BitgetResponse>(url).pipe(
      map(response => {
        if (response.code !== '00000' || !response.data) {
          console.error('[Bitget] API error:', response.msg);
          return [];
        }

        const fundingRates = response.data;
        console.log(`[Bitget] Fetched ${fundingRates.length} funding rates via proxy`);

        return fundingRates
          .filter(fr =>
            fr.symbol &&
            fr.fundingRate !== undefined
          )
          .map(fr => ({
            exchange: 'BITGET',
            symbol: fr.symbol.replace(/[\\/\-_:]/g, ''), // BTCUSDT
            originalSymbol: fr.symbol, // BTCUSDT
            fundingRate: fr.fundingRate,
            nextFundingTime: parseInt(fr.nextUpdate) || 0,
            lastPrice: '0', // Bitget funding rate endpoint doesn't include price, will be 0
            fundingInterval: fr.fundingRateInterval ? `${fr.fundingRateInterval}h` : '-', // Dash if not available
            volume24h: undefined,
            openInterest: undefined,
            high24h: undefined,
            low24h: undefined,
          } as ExchangeFundingRate));
      }),
      catchError((error: Error) => {
        console.error('[Bitget] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from OKX via backend proxy
   * Backend proxies requests to bypass CORS restrictions
   * Endpoint: GET /api/okx/public-funding-rates
   * Documentation: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-funding-rate
   */
  private fetchOKXFundingRates(): Observable<ExchangeFundingRate[]> {
    // Use backend proxy to bypass CORS
    const url = '/api/okx/public-funding-rates';

    interface OKXResponse {
      code: string;
      msg?: string;
      data: {
        instType?: string;
        instId: string;
        fundingRate: string;
        nextFundingTime: string;
        fundingInterval: number | string; // Can be number or string from backend
        markPx: string;
        idxPx: string;
      }[];
    }

    return this.http.get<OKXResponse>(url).pipe(
      take(1),      
      map(response => {
        if (response.code !== '0' || !response.data) {
          console.error('[OKX] API error:', response.msg);
          return [];
        }

        const fundingRates = response.data;
        console.log(`[OKX] Fetched ${fundingRates.length} funding rates via proxy`);

        return fundingRates
          .filter(fr =>
            fr.instId &&
            fr.fundingRate !== undefined
          )
          .map(fr => {
            // ✅ Convert fundingInterval from number to string format (8 -> '8h', 4 -> '4h', etc.)
            let fundingInterval = '-';
            if (fr.fundingInterval) {
              fundingInterval = typeof fr.fundingInterval === 'number'
                ? `${fr.fundingInterval}h`
                : fr.fundingInterval;
            }

            return {
              exchange: 'OKX',
              symbol: fr.instId.replace(/[\\/\-_:]/g, ''), // BTC-USDT -> BTCUSDT
              originalSymbol: fr.instId, // BTC-USDT
              fundingRate: fr.fundingRate,
              nextFundingTime: parseInt(fr.nextFundingTime) || 0,
              lastPrice: fr.markPx || '0',
              fundingInterval, // Now properly formatted as '8h', '4h', etc.
              volume24h: undefined,
              openInterest: undefined,
              high24h: undefined,
              low24h: undefined,
            } as ExchangeFundingRate;
          });
      }),
      catchError((error: Error) => {
        console.error('[OKX] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Normalize funding rate to 1-hour interval for fair comparison
   * Different exchanges use different intervals (1h, 4h, 8h)
   *
   * ✅ Uses centralized function from @shared/lib to ensure consistency
   * across the entire application (frontend, backend, calculator components)
   */
  private normalizeFundingRate(fundingRate: string | number, fundingInterval: string | number | undefined = '-'): number {
    // Parse funding rate
    const rate = typeof fundingRate === 'string' ? parseFloat(fundingRate) : fundingRate;

    // Ensure fundingInterval is a string
    const intervalStr = fundingInterval ? String(fundingInterval) : '-';

    // Extract numeric interval from string format ('1h' -> 1, '4h' -> 4, '8h' -> 8, '8' -> 8)
    const intervalMatch = intervalStr.match(/^(\d+)h?$/);
    const intervalHours = intervalMatch ? parseInt(intervalMatch[1]) : 1;

    // Use centralized normalization function from @shared/lib
    // This ensures ALL funding rate calculations use the same logic
    return normalizeFundingRateTo1h(rate, intervalHours);
  }

  /**
   * Calculate arbitrage opportunities from exchange data
   * Groups by symbol and calculates spreads
   * IMPORTANT: Normalizes all funding rates to 8h intervals for fair comparison
   */
  private calculateOpportunities(rates: ExchangeFundingRate[]): FundingRateOpportunity[] {
    // Group by normalized symbol
    const symbolMap = new Map<string, ExchangeFundingRate[]>();

    // Add normalized funding rates and calculate intervals based on real data
    rates.forEach(rate => {
      if (!symbolMap.has(rate.symbol)) {
        symbolMap.set(rate.symbol, []);
      }

      // Calculate funding interval from actual nextFundingTime (not hardcoded!)
      // if (!rate.fundingInterval && rate.nextFundingTime) {
      //   rate.fundingInterval = this.calculateFundingInterval(rate.nextFundingTime);
      // }

      // ✅ Normalize funding rate to 1h interval using centralized function from @shared/lib
      // This ensures fair comparison across exchanges with different intervals (1h, 4h, 8h)
      rate.fundingRateNormalized = this.normalizeFundingRate(
        rate.fundingRate,
        rate.fundingInterval || '-'
      );

      // console.log(`[FundingInterval] ${rate.exchange} ${rate.symbol}: interval=${rate.fundingInterval}, nextFunding=${new Date(rate.nextFundingTime).toLocaleTimeString()}, rate=${rate.fundingRate}, normalized=${rate.fundingRateNormalized?.toFixed(6) || 'N/A'}`);

      symbolMap.get(rate.symbol)!.push(rate);
    });

    const opportunities: FundingRateOpportunity[] = [];

    // Calculate opportunities for each symbol
    symbolMap.forEach((exchanges, symbol) => {
      // Skip symbols with only one exchange
      if (exchanges.length < 2) return;

      // Sort by NORMALIZED funding rate (lowest to highest) - CRITICAL for fair comparison!
      const sortedExchanges = [...exchanges].sort(
        (a, b) => (a.fundingRateNormalized || 0) - (b.fundingRateNormalized || 0)
      );

      const bestLong = sortedExchanges[0]; // Lowest (most negative) normalized funding rate
      const bestShort = sortedExchanges[sortedExchanges.length - 1]; // Highest normalized funding rate

      // Calculate funding spread using NORMALIZED rates
      const fundingSpread = (bestShort.fundingRateNormalized || 0) - (bestLong.fundingRateNormalized || 0);
      const fundingSpreadPercent = (fundingSpread * 100).toFixed(4);

      // Calculate price spread
      const bestLongPrice = parseFloat(bestLong.lastPrice);
      const bestShortPrice = parseFloat(bestShort.lastPrice);
      const priceSpread = Math.abs(bestShortPrice - bestLongPrice) / bestLongPrice;
      const priceSpreadPercent = Math.abs(priceSpread * 100).toFixed(2);
      const priceSpreadUsdt = Math.abs(bestShortPrice - bestLongPrice).toFixed(2);

      // Get earliest next funding time
      const fundingTimes = exchanges.map(e => e.nextFundingTime).filter(t => t > 0);
      const nextFundingTime = fundingTimes.length > 0 ? Math.min(...fundingTimes) : 0;

      // Calculate funding periodicity
      const fundingPeriodicity = this.calculateFundingPeriodicity(nextFundingTime);

      // Filter out unrealistic spreads (> 100%)
      if (Math.abs(priceSpread) > 1.0) {
        console.debug(`[PublicFundingRates] Filtered ${symbol}: unrealistic price spread ${priceSpreadPercent}%`);
        return;
      }

      // Filter out invalid prices
      if (bestLongPrice <= 0 || bestShortPrice <= 0) {
        console.debug(`[PublicFundingRates] Filtered ${symbol}: invalid prices`);
        return;
      }

      // ===== Phase 1 Advanced Metrics Calculations =====

      // 1. Time to Funding
      const timeToFunding = this.calculateTimeToFunding(nextFundingTime);

      // 2. Estimated APR (gross, before fees)
      const estimatedAPR = this.calculateEstimatedAPR(fundingSpread);
      const estimatedAPRFormatted = (estimatedAPR * 100).toFixed(2) + '%';

      // 3. Total Fees
      const totalFees = this.calculateTotalFees(bestLong.exchange, bestShort.exchange);
      const totalFeesFormatted = (totalFees * 100).toFixed(2) + '%';

      // 4. Net APR (after fees)
      const netAPR = this.calculateNetAPR(estimatedAPR, totalFees);
      const netAPRFormatted = (netAPR * 100).toFixed(2) + '%';

      // 5. 24h Volume (optional)
      const volume24h = this.calculateVolume24h(exchanges);
      const volume24hFormatted = volume24h !== undefined ? '$' + this.formatLargeNumber(volume24h) : undefined;

      // 6. Open Interest (optional)
      const openInterest = this.calculateOpenInterest(exchanges);
      const openInterestFormatted = openInterest !== undefined ? '$' + this.formatLargeNumber(openInterest) : undefined;

      // 7. Volatility 24h (optional)
      const volatility24h = this.calculateVolatility24h(exchanges);
      const volatility24hFormatted = volatility24h !== undefined ? (volatility24h * 100).toFixed(2) + '%' : undefined;

      // 8. Determine Recommended Strategy (spot-futures vs cross-exchange)
      let recommendedStrategy: 'cross-exchange' | 'spot-futures' = 'cross-exchange';
      let spotFuturesBestExchange: ExchangeFundingRate | undefined;

      const bestLongFundingNormalized = bestLong.fundingRateNormalized || 0;
      const bestShortFundingNormalized = bestShort.fundingRateNormalized || 0;

      // If BOTH funding rates are positive, spot-futures is more profitable
      // Spot-futures: Buy spot + Short futures on same exchange = earn full funding rate
      // Cross-exchange: Short on high funding - Long on low funding = earn only the spread
      if (bestLongFundingNormalized > 0 && bestShortFundingNormalized > 0) {
        recommendedStrategy = 'spot-futures';
        // Choose exchange with highest funding rate for spot-futures
        spotFuturesBestExchange = bestShort; // Highest funding rate
       // console.log(`[PublicFundingRates] ${symbol}: Spot-futures recommended (both normalized fundings positive: ${(bestLongFundingNormalized*100).toFixed(4)}%, ${(bestShortFundingNormalized*100).toFixed(4)}% per 8h)`);
      } else {
        recommendedStrategy = 'cross-exchange';
       // console.log(`[PublicFundingRates] ${symbol}: Cross-exchange recommended (normalized fundings: ${(bestLongFundingNormalized*100).toFixed(4)}%, ${(bestShortFundingNormalized*100).toFixed(4)}% per 8h)`);
      }

      // 9. Strategy Metrics Calculation
      // Calculate metrics for ALL applicable strategies (not mutually exclusive)
      // Each opportunity can have multiple strategies calculated

      const strategyMetrics: {
        combined?: { combinedScore: number; expectedDailyReturn: number; estimatedMonthlyROI: number; };
        priceOnly?: { combinedScore: number; expectedDailyReturn: number; estimatedMonthlyROI: number; };
        fundingOnly?: { combinedScore: number; expectedDailyReturn: number; estimatedMonthlyROI: number; };
      } = {};

      // Convert to percentages for calculations (use different variable names to avoid redeclaration)
      const priceSpreadPct = priceSpread * 100;
      const fundingDifferentialPct = fundingSpread * 100;
      const dailyFundingReturn = fundingDifferentialPct * 3; // 3 funding periods per day (every 8h)

      // Combined Strategy: If has both price AND funding data
      if (Math.abs(fundingSpread) > 0.0001 && Math.abs(priceSpread) > 0.0001) {
        strategyMetrics.combined = {
          // Expected daily return = price spread (one-time) + funding differential (3 times per day)
          expectedDailyReturn: priceSpreadPct + dailyFundingReturn,
          // Estimated monthly ROI = price spread (one-time) + funding for 30 days
          estimatedMonthlyROI: priceSpreadPct + (dailyFundingReturn * 30),
          // Combined score = immediate price spread + projected funding for 7 days
          combinedScore: priceSpreadPct + (dailyFundingReturn * 7),
        };
      }

      // Price Only Strategy: If has price spread
      if (Math.abs(priceSpread) > 0.0001) {
        strategyMetrics.priceOnly = {
          combinedScore: priceSpreadPct,
          expectedDailyReturn: priceSpreadPct,
          estimatedMonthlyROI: priceSpreadPct,
        };
      }

      // Funding Only Strategy: If has funding spread
      if (Math.abs(fundingSpread) > 0.0001) {
        strategyMetrics.fundingOnly = {
          combinedScore: dailyFundingReturn * 7,
          expectedDailyReturn: dailyFundingReturn,
          estimatedMonthlyROI: dailyFundingReturn * 30,
        };
      }

      // LEGACY FIELDS - determine default strategyType and metrics for backward compatibility
      // Priority: combined > price_only > funding_only
      let strategyType: 'price_only' | 'funding_only' | 'combined' = 'price_only';
      let combinedScore: number | undefined;
      let expectedDailyReturn: number | undefined;
      let estimatedMonthlyROI: number | undefined;

      if (strategyMetrics.combined) {
        strategyType = 'combined';
        combinedScore = strategyMetrics.combined.combinedScore;
        expectedDailyReturn = strategyMetrics.combined.expectedDailyReturn;
        estimatedMonthlyROI = strategyMetrics.combined.estimatedMonthlyROI;
      } else if (strategyMetrics.priceOnly) {
        strategyType = 'price_only';
        combinedScore = strategyMetrics.priceOnly.combinedScore;
        expectedDailyReturn = strategyMetrics.priceOnly.expectedDailyReturn;
        estimatedMonthlyROI = strategyMetrics.priceOnly.estimatedMonthlyROI;
      } else if (strategyMetrics.fundingOnly) {
        strategyType = 'funding_only';
        combinedScore = strategyMetrics.fundingOnly.combinedScore;
        expectedDailyReturn = strategyMetrics.fundingOnly.expectedDailyReturn;
        estimatedMonthlyROI = strategyMetrics.fundingOnly.estimatedMonthlyROI;
      }

      opportunities.push({
        symbol,
        exchanges: sortedExchanges,
        maxFundingSpread: fundingSpread, // LEGACY - kept for backward compatibility
        maxFundingSpreadPercent: fundingSpreadPercent + '%', // LEGACY
        fundingSpread: fundingSpread, // Normalized funding spread (8h basis)
        fundingSpreadPercent: fundingSpreadPercent + '%', // Normalized funding spread percentage
        bestLong,
        bestShort,
        priceSpread,
        priceSpreadPercent: priceSpreadPercent + '%',
        priceSpreadUsdt: '$' + priceSpreadUsdt,
        fundingPeriodicity,
        nextFundingTime,
        // Phase 1 Advanced Metrics
        timeToFunding,
        estimatedAPR,
        estimatedAPRFormatted,
        totalFees,
        totalFeesFormatted,
        netAPR,
        netAPRFormatted,
        volume24h,
        volume24hFormatted,
        openInterest,
        openInterestFormatted,
        volatility24h,
        volatility24hFormatted,
        // Strategy Metrics - ALL applicable strategies calculated
        strategyMetrics,
        // LEGACY Combined Strategy Metrics - for backward compatibility
        combinedScore,
        expectedDailyReturn,
        estimatedMonthlyROI,
        strategyType,
        // Recommended Strategy
        recommendedStrategy,
        spotFuturesBestExchange,
      });
    });

    // Sort by NORMALIZED funding spread (highest first) - uses fundingSpread which is now normalized
    opportunities.sort((a, b) => Math.abs((b.fundingSpread || 0)) - Math.abs((a.fundingSpread || 0)));

    console.log(`[PublicFundingRates] Calculated ${opportunities.length} opportunities`);

    return opportunities;
  }

  /**
   * Calculate human-readable funding periodicity
   * @param nextFundingTime - Next funding time timestamp
   * @returns Formatted string like "2г 35хв/8h"
   */
  private calculateFundingPeriodicity(nextFundingTime: number): string {
    if (!nextFundingTime || nextFundingTime <= 0) {
      return '—';
    }

    const now = Date.now();
    const timeUntilFunding = nextFundingTime - now;

    if (timeUntilFunding < 0) {
      return '—';
    }

    const hours = Math.floor(timeUntilFunding / (60 * 60 * 1000));
    const minutes = Math.floor((timeUntilFunding % (60 * 60 * 1000)) / (60 * 1000));

    // Determine funding interval based on time until next funding
    let interval = '8h'; // Default
    if (timeUntilFunding <= 1 * 60 * 60 * 1000) {
      interval = '1h';
    } else if (timeUntilFunding <= 4 * 60 * 60 * 1000) {
      interval = '4h';
    }

    return `${hours}г ${minutes}хв/${interval}`;
  }

  /**
   * Calculate time until next funding in human-readable format
   * @param nextFundingTime - Next funding timestamp
   * @returns Formatted string like "2h 15m" or "—" if unavailable
   */
  private calculateTimeToFunding(nextFundingTime: number): string {
    if (!nextFundingTime || nextFundingTime <= 0) {
      return '—';
    }

    const now = Date.now();
    const timeUntilFunding = nextFundingTime - now;

    if (timeUntilFunding < 0) {
      return '—';
    }

    const hours = Math.floor(timeUntilFunding / (60 * 60 * 1000));
    const minutes = Math.floor((timeUntilFunding % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
  }

  /**
   * Calculate Estimated APR from funding spread
   *
   * ⚠️ CRITICAL: This method expects fundingSpread to be NORMALIZED TO 1H intervals!
   * Since we normalize all funding rates to 1h using @shared/lib utilities,
   * we must use 1h-based periods for accurate APR calculation.
   *
   * Formula: funding spread (per hour) × hours per year × 100
   * 1h intervals = 24 times per day × 365 days = 8760 funding periods per year
   *
   * @param fundingSpread - Funding rate spread normalized to 1h (decimal, e.g., 0.0004)
   * @returns Annual Percentage Rate (decimal, e.g., 3.504)
   */
  private calculateEstimatedAPR(fundingSpread: number): number {
    // ✅ Updated to reflect 1h normalization (24 periods/day instead of 3)
    const fundingPeriodsPerYear = 24 * 365; // 1h intervals = 8760 periods per year
    return fundingSpread * fundingPeriodsPerYear;
  }

  /**
   * Calculate total trading fees for arbitrage (4 trades total)
   * @param longExchange - Exchange for long position
   * @param shortExchange - Exchange for short position
   * @returns Total fees as decimal (e.g., 0.0022 = 0.22%)
   */
  private calculateTotalFees(longExchange: string, shortExchange: string): number {
    const longFee = this.EXCHANGE_FEES[longExchange] || 0.055;
    const shortFee = this.EXCHANGE_FEES[shortExchange] || 0.055;

    // 4 trades: open long, open short, close long, close short
    return (longFee + shortFee) * 2 / 100; // Convert from percentage to decimal
  }

  /**
   * Calculate Net APR (after fees deduction)
   * @param grossAPR - Gross APR (before fees)
   * @param totalFees - Total trading fees (decimal)
   * @returns Net APR (decimal)
   */
  private calculateNetAPR(grossAPR: number, totalFees: number): number {
    // Convert fees to annual equivalent
    const annualFees = totalFees * 3 * 365; // Assuming 3 cycles per day
    return grossAPR - annualFees;
  }

  /**
   * Format large numbers with K/M/B suffixes
   * @param value - Number to format
   * @returns Formatted string (e.g., "1.2M", "45.3K")
   */
  private formatLargeNumber(value: number): string {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  }

  /**
   * Calculate combined 24h volume from exchanges
   * @param exchanges - Array of exchange data
   * @returns Combined volume or undefined if not available
   */
  private calculateVolume24h(exchanges: ExchangeFundingRate[]): number | undefined {
    const volumes = exchanges
      .map(ex => ex.volume24h ? parseFloat(ex.volume24h) : 0)
      .filter(v => v > 0);

    if (volumes.length === 0) return undefined;

    return volumes.reduce((sum, v) => sum + v, 0);
  }

  /**
   * Calculate combined open interest from exchanges
   * @param exchanges - Array of exchange data
   * @returns Combined OI or undefined if not available
   */
  private calculateOpenInterest(exchanges: ExchangeFundingRate[]): number | undefined {
    const ois = exchanges
      .map(ex => ex.openInterest ? parseFloat(ex.openInterest) : 0)
      .filter(oi => oi > 0);

    if (ois.length === 0) return undefined;

    return ois.reduce((sum, oi) => sum + oi, 0);
  }

  /**
   * Calculate simple 24h volatility
   * Formula: (high - low) / low × 100
   * @param exchanges - Array of exchange data
   * @returns Volatility as decimal or undefined if not available
   */
  private calculateVolatility24h(exchanges: ExchangeFundingRate[]): number | undefined {
    // Get high/low from exchanges that provide it
    const validData = exchanges
      .filter(ex => ex.high24h && ex.low24h)
      .map(ex => ({
        high: parseFloat(ex.high24h!),
        low: parseFloat(ex.low24h!)
      }))
      .filter(d => d.high > 0 && d.low > 0);

    if (validData.length === 0) return undefined;

    // Calculate average volatility across exchanges
    const volatilities = validData.map(d => (d.high - d.low) / d.low);
    const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;

    return avgVolatility;
  }

  // ===== PHASE 2: Historical Spread Stability Methods =====

  /**
   * Load Phase 2 historical stability metrics for an opportunity
   * Fetches 7d and 30d funding rate history and calculates stability metrics
   *
   * @param opportunity - Funding rate opportunity to analyze
   * @returns Updated opportunity with Phase 2 metrics
   */
  async loadPhase2Metrics(
    opportunity: FundingRateOpportunity
  ): Promise<FundingRateOpportunity> {
    try {
      const symbol = opportunity.symbol;
      const longExchange = opportunity.bestLong.exchange;
      const shortExchange = opportunity.bestShort.exchange;

      console.log(`[Phase 2] Loading metrics for ${symbol} (${longExchange} vs ${shortExchange})`);

      // Fetch historical funding rates for both exchanges (7d and 30d in parallel)
      const [
        longRates7d,
        shortRates7d,
        longRates30d,
        shortRates30d
      ] = await Promise.all([
        this.fetchFundingRateHistory(symbol, longExchange, 7),
        this.fetchFundingRateHistory(symbol, shortExchange, 7),
        this.fetchFundingRateHistory(symbol, longExchange, 30),
        this.fetchFundingRateHistory(symbol, shortExchange, 30)
      ]);

      // Calculate spreads from funding rates
      const spreads7d = this.calculateSpreads(longRates7d, shortRates7d);
      const spreads30d = this.calculateSpreads(longRates30d, shortRates30d);

      console.log(`[Phase 2] Spreads calculated: 7d=${spreads7d.length}, 30d=${spreads30d.length}`);

      // Calculate stability metrics using StatisticalUtilsService
      const metrics7d = this.calculateStabilityMetrics(spreads7d, 7, 168); // 7 days × 24h × 1 sample/h = 168
      const metrics30d = this.calculateStabilityMetrics(spreads30d, 30, 720); // 30 × 24 = 720

      // Calculate trend and confidence
      const trend = this.statisticalUtils.calculateStabilityTrend(
        metrics7d.stabilityScore,
        metrics30d.stabilityScore
      );
      const confidence = this.statisticalUtils.calculateConfidenceScore(
        metrics7d.dataQuality,
        metrics30d.dataQuality
      );

      console.log(`[Phase 2] Metrics loaded successfully for ${symbol}`);

      // Return updated opportunity
      return {
        ...opportunity,
        spreadHistory7d: metrics7d,
        spreadHistory30d: metrics30d,
        spreadStabilityTrend: trend,
        spreadStabilityConfidence: confidence
      };
    } catch (error) {
      console.error('[Phase 2] Failed to load metrics:', error);
      // Return unchanged opportunity on error (graceful degradation)
      return opportunity;
    }
  }

  /**
   * Fetch historical funding rates from backend API
   *
   * @param symbol - Trading symbol (e.g., BTCUSDT)
   * @param exchange - Exchange name (BYBIT, BINGX, MEXC)
   * @param days - Period length (7 or 30)
   * @returns Array of historical funding rates with timestamps
   */
  private async fetchFundingRateHistory(
    symbol: string,
    exchange: string,
    days: 7 | 30
  ): Promise<{ timestamp: number; fundingRate: number }[]> {
    const url = `/api/arbitrage/funding-rates/history?symbol=${symbol}&exchange=${exchange}&days=${days}`;

    try {
      const response = await firstValueFrom(
        this.http.get<{
          success: boolean;
          data: { timestamp: number; fundingRate: number }[];
        }>(url)
      );

      if (response.success) {
        console.log(`[Phase 2] Fetched ${response.data.length} funding rates for ${exchange} ${symbol} (${days}d)`);
        return response.data;
      } else {
        console.warn(`[Phase 2] No data for ${exchange} ${symbol} (${days}d)`);
        return [];
      }
    } catch (error) {
      console.error(`[Phase 2] Error fetching history for ${exchange} ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Calculate spread values from long and short funding rates
   * Matches timestamps and calculates absolute spread difference
   *
   * @param longRates - Funding rates from long position exchange
   * @param shortRates - Funding rates from short position exchange
   * @returns Array of spread data points with timestamps and values
   */
  private calculateSpreads(
    longRates: { timestamp: number; fundingRate: number }[],
    shortRates: { timestamp: number; fundingRate: number }[]
  ): { timestamp: number; spread: number }[] {
    // Match timestamps and calculate spreads
    const spreads: { timestamp: number; spread: number }[] = [];

    for (const longRate of longRates) {
      const shortRate = shortRates.find(s => s.timestamp === longRate.timestamp);
      if (shortRate) {
        const spread = Math.abs(shortRate.fundingRate - longRate.fundingRate);
        spreads.push({
          timestamp: longRate.timestamp,
          spread: spread
        });
      }
    }

    return spreads;
  }

  /**
   * Calculate stability metrics from spread data using statistical analysis
   *
   * @param spreads - Array of spread data points with timestamps
   * @param periodDays - Period length (7 or 30 days)
   * @param expectedSamples - Expected number of samples for this period
   * @returns Complete spread stability metrics
   */
  private calculateStabilityMetrics(
    spreads: { timestamp: number; spread: number }[],
    periodDays: 7 | 30,
    expectedSamples: number
  ): SpreadStabilityMetrics {
    // Extract spread values for statistical calculations
    const spreadValues = spreads.map(s => s.spread);

    const avg = this.statisticalUtils.calculateAverage(spreadValues);
    const stdDev = this.statisticalUtils.calculateStandardDeviation(spreadValues);

    if (avg === null || stdDev === null) {
      // No data available
      return {
        average: 0,
        averageFormatted: '0.00%',
        standardDeviation: 0,
        standardDeviationFormatted: '0.00%',
        stabilityScore: 0,
        stabilityRating: 'poor',
        sampleSize: 0,
        dataQuality: 'low',
        periodDays,
        historicalData: []
      };
    }

    const score = this.statisticalUtils.calculateStabilityScore(avg, stdDev);
    const rating = this.statisticalUtils.getStabilityRating(score);
    const quality = this.statisticalUtils.getDataQuality(spreads.length, expectedSamples);

    return {
      average: avg,
      averageFormatted: this.statisticalUtils.formatPercentage(avg, 2),
      standardDeviation: stdDev,
      standardDeviationFormatted: this.statisticalUtils.formatPercentage(stdDev, 2),
      stabilityScore: score,
      stabilityRating: rating,
      sampleSize: spreads.length,
      dataQuality: quality,
      periodDays,
      startTimestamp: spreads.length > 0 ? Date.now() - (periodDays * 24 * 60 * 60 * 1000) : undefined,
      endTimestamp: spreads.length > 0 ? Date.now() : undefined,
      historicalData: spreads // Include historical data for charting
    };
  }
}
