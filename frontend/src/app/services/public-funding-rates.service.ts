import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, catchError, map, firstValueFrom } from 'rxjs';
import { ExchangeFundingRate, FundingRateOpportunity, SpreadStabilityMetrics } from '../models/public-funding-rate.model';
import { StatisticalUtilsService } from './statistical-utils.service';

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
  private readonly EXCHANGE_FEES = {
    BYBIT: 0.055,  // 0.055% per trade × 4 = 0.22% total
    BINGX: 0.05,   // 0.05% per trade × 4 = 0.20% total
    MEXC: 0.03,    // 0.03% per trade × 4 = 0.12% total
  };

  constructor(
    private http: HttpClient,
    private statisticalUtils: StatisticalUtilsService // PHASE2: Statistical calculations
  ) {}

  /**
   * Fetch funding rates from all supported exchanges
   * Returns array of opportunities sorted by funding spread
   */
  getFundingRatesOpportunities(): Observable<FundingRateOpportunity[]> {
    // Fetch from all exchanges in parallel
    return forkJoin({
      bybit: this.fetchBybitFundingRates(),
      bingx: this.fetchBingXFundingRates(),
      mexc: this.fetchMEXCFundingRates(),
    }).pipe(
      map(results => {
        // Combine all exchange data
        const allRates: ExchangeFundingRate[] = [
          ...results.bybit,
          ...results.bingx,
          ...results.mexc,
        ];

        // Calculate opportunities
        return this.calculateOpportunities(allRates);
      }),
      catchError(error => {
        console.error('[PublicFundingRates] Error fetching funding rates:', error);
        return of([]);
      })
    );
  }

  /**
   * Fetch funding rates from Bybit public API
   * Endpoint: GET https://api.bybit.com/v5/market/tickers?category=linear
   * Documentation: https://bybit-exchange.github.io/docs/v5/market/tickers
   */
  private fetchBybitFundingRates(): Observable<ExchangeFundingRate[]> {
    const url = 'https://api.bybit.com/v5/market/tickers?category=linear';

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.retCode !== 0 || !response.result?.list) {
          console.error('[Bybit] API error:', response.retMsg);
          return [];
        }

        const tickers = response.result.list;
        console.log(`[Bybit] Fetched ${tickers.length} tickers`);

        return tickers
          .filter((t: any) => t.symbol && t.fundingRate && t.lastPrice)
          .map((t: any) => ({
            exchange: 'BYBIT',
            symbol: t.symbol.replace(/[\/\-_:]/g, ''), // BTCUSDT
            originalSymbol: t.symbol, // BTC/USDT:USDT
            fundingRate: t.fundingRate,
            nextFundingTime: parseInt(t.nextFundingTime) || 0,
            lastPrice: t.lastPrice,
            fundingInterval: '8h', // Bybit uses 8h intervals
          } as ExchangeFundingRate));
      }),
      catchError(error => {
        console.error('[Bybit] Failed to fetch funding rates:', error.message);
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

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.code !== 0 || !response.data) {
          console.error('[BingX] API error:', response.msg);
          return [];
        }

        const premiumIndex = response.data;
        console.log(`[BingX] Fetched ${premiumIndex.length} premium index entries via proxy`);

        return premiumIndex
          .filter((p: any) => p.symbol && p.lastFundingRate && p.markPrice)
          .map((p: any) => ({
            exchange: 'BINGX',
            symbol: p.symbol.replace(/[\/\-_:]/g, ''), // BTC-USDT -> BTCUSDT
            originalSymbol: p.symbol, // BTC-USDT
            fundingRate: p.lastFundingRate,
            nextFundingTime: parseInt(p.nextFundingTime) || 0,
            lastPrice: p.markPrice,
            fundingInterval: '8h', // BingX uses 8h intervals
          } as ExchangeFundingRate));
      }),
      catchError(error => {
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

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response.code !== 0 || !response.data) {
          console.error('[MEXC] API error:', response.msg);
          return [];
        }

        const tickers = response.data;
        console.log(`[MEXC] Fetched ${tickers.length} tickers via proxy`);

        return tickers
          .filter((t: any) =>
            t.symbol &&
            t.fundingRate !== undefined &&
            t.fundingRate !== 0 &&
            (t.lastPrice > 0 || t.fairPrice > 0)
          )
          .map((t: any) => ({
            exchange: 'MEXC',
            symbol: t.symbol.replace(/[\/\-_:]/g, ''), // BTC_USDT -> BTCUSDT
            originalSymbol: t.symbol, // BTC_USDT
            fundingRate: t.fundingRate.toString(),
            nextFundingTime: 0, // MEXC doesn't provide nextFundingTime in tickers
            lastPrice: t.lastPrice > 0 ? t.lastPrice.toString() : t.fairPrice.toString(),
            fundingInterval: '8h', // MEXC uses 8h intervals
          } as ExchangeFundingRate));
      }),
      catchError(error => {
        console.error('[MEXC] Failed to fetch funding rates via proxy:', error.message);
        return of([]);
      })
    );
  }

  /**
   * Calculate arbitrage opportunities from exchange data
   * Groups by symbol and calculates spreads
   */
  private calculateOpportunities(rates: ExchangeFundingRate[]): FundingRateOpportunity[] {
    // Group by normalized symbol
    const symbolMap = new Map<string, ExchangeFundingRate[]>();

    rates.forEach(rate => {
      if (!symbolMap.has(rate.symbol)) {
        symbolMap.set(rate.symbol, []);
      }
      symbolMap.get(rate.symbol)!.push(rate);
    });

    const opportunities: FundingRateOpportunity[] = [];

    // Calculate opportunities for each symbol
    symbolMap.forEach((exchanges, symbol) => {
      // Skip symbols with only one exchange
      if (exchanges.length < 2) return;

      // Sort by funding rate (lowest to highest)
      const sortedExchanges = [...exchanges].sort(
        (a, b) => parseFloat(a.fundingRate) - parseFloat(b.fundingRate)
      );

      const bestLong = sortedExchanges[0]; // Lowest (most negative) funding rate
      const bestShort = sortedExchanges[sortedExchanges.length - 1]; // Highest funding rate

      // Calculate funding spread
      const fundingSpread = parseFloat(bestShort.fundingRate) - parseFloat(bestLong.fundingRate);
      const fundingSpreadPercent = (fundingSpread * 100).toFixed(4);

      // Calculate price spread
      const bestLongPrice = parseFloat(bestLong.lastPrice);
      const bestShortPrice = parseFloat(bestShort.lastPrice);
      const priceSpread = (bestShortPrice - bestLongPrice) / bestLongPrice;
      const priceSpreadPercent = (priceSpread * 100).toFixed(2);
      const priceSpreadUsdt = (bestShortPrice - bestLongPrice).toFixed(2);

      // Get earliest next funding time
      const fundingTimes = exchanges.map(e => e.nextFundingTime).filter(t => t > 0);
      const nextFundingTime = fundingTimes.length > 0 ? Math.min(...fundingTimes) : 0;

      // Calculate funding periodicity
      const fundingPeriodicity = this.calculateFundingPeriodicity(nextFundingTime);

      // Filter out unrealistic spreads (> 100%)
      if (Math.abs(priceSpread) > 1.0) {
        console.warn(`[PublicFundingRates] Filtered ${symbol}: unrealistic price spread ${priceSpreadPercent}%`);
        return;
      }

      // Filter out invalid prices
      if (bestLongPrice <= 0 || bestShortPrice <= 0) {
        console.warn(`[PublicFundingRates] Filtered ${symbol}: invalid prices`);
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

      opportunities.push({
        symbol,
        exchanges: sortedExchanges,
        maxFundingSpread: fundingSpread,
        maxFundingSpreadPercent: fundingSpreadPercent + '%',
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
      });
    });

    // Sort by funding spread (highest first)
    opportunities.sort((a, b) => Math.abs(b.maxFundingSpread) - Math.abs(a.maxFundingSpread));

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
   * Formula: funding spread × funding periods per year × 100
   * 8h intervals = 3 times per day × 365 days = 1095 funding periods per year
   * @param fundingSpread - Funding rate spread (decimal)
   * @returns Annual Percentage Rate (decimal)
   */
  private calculateEstimatedAPR(fundingSpread: number): number {
    const fundingPeriodsPerYear = 3 * 365; // 8h intervals
    return fundingSpread * fundingPeriodsPerYear;
  }

  /**
   * Calculate total trading fees for arbitrage (4 trades total)
   * @param longExchange - Exchange for long position
   * @param shortExchange - Exchange for short position
   * @returns Total fees as decimal (e.g., 0.0022 = 0.22%)
   */
  private calculateTotalFees(longExchange: string, shortExchange: string): number {
    const longFee = (this.EXCHANGE_FEES as any)[longExchange] || 0.055;
    const shortFee = (this.EXCHANGE_FEES as any)[shortExchange] || 0.055;

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
  ): Promise<Array<{ timestamp: number; fundingRate: number }>> {
    const url = `/api/arbitrage/funding-rates/history?symbol=${symbol}&exchange=${exchange}&days=${days}`;

    try {
      const response = await firstValueFrom(
        this.http.get<{
          success: boolean;
          data: Array<{ timestamp: number; fundingRate: number }>;
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
   * @returns Array of spread values
   */
  private calculateSpreads(
    longRates: Array<{ timestamp: number; fundingRate: number }>,
    shortRates: Array<{ timestamp: number; fundingRate: number }>
  ): number[] {
    // Match timestamps and calculate spreads
    const spreads: number[] = [];

    for (const longRate of longRates) {
      const shortRate = shortRates.find(s => s.timestamp === longRate.timestamp);
      if (shortRate) {
        const spread = Math.abs(shortRate.fundingRate - longRate.fundingRate);
        spreads.push(spread);
      }
    }

    return spreads;
  }

  /**
   * Calculate stability metrics from spread data using statistical analysis
   *
   * @param spreads - Array of spread values
   * @param periodDays - Period length (7 or 30 days)
   * @param expectedSamples - Expected number of samples for this period
   * @returns Complete spread stability metrics
   */
  private calculateStabilityMetrics(
    spreads: number[],
    periodDays: 7 | 30,
    expectedSamples: number
  ): SpreadStabilityMetrics {
    const avg = this.statisticalUtils.calculateAverage(spreads);
    const stdDev = this.statisticalUtils.calculateStandardDeviation(spreads);

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
        periodDays
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
      endTimestamp: spreads.length > 0 ? Date.now() : undefined
    };
  }
}
