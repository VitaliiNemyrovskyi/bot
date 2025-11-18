import { Exchange } from '@prisma/client';
import { fetchWithTimeout } from '../lib/fetch-with-timeout';
import { EXCHANGE_ENDPOINTS } from '../lib/exchange-api-endpoints';
import prisma from '../lib/prisma';

/**
 * Unified Funding Interval Service
 *
 * Provides consistent funding interval data across the entire application.
 * Implements database caching with 2-hour TTL to ensure consistency.
 *
 * Priority system:
 * 1. Check DB cache (valid for 2 hours)
 * 2. Fetch from exchange bulk API if available (direct intervals)
 * 3. Calculate from historical data as fallback
 * 4. Store result in DB
 *
 * Usage:
 * ```typescript
 * const interval = await FundingIntervalService.getInterval(Exchange.BYBIT, 'BTC/USDT');
 * ```
 */
export class FundingIntervalService {
  private static prisma = prisma;
  private static readonly CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

  /**
   * Get funding interval for a symbol on an exchange
   * Uses cached value if available and not expired (< 2 hours old)
   * Otherwise fetches fresh data and updates cache
   */
  static async getInterval(exchange: Exchange, symbol: string): Promise<number> {
    // Normalize symbol format to "BASE/USDT"
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // 1. Check database cache first
    const cached = await this.getCachedInterval(exchange, normalizedSymbol);
    if (cached) {
      return cached.intervalHours;
    }

    // 2. Fetch fresh interval from exchange
    const interval = await this.fetchIntervalFromExchange(exchange, normalizedSymbol);

    // 3. Cache the result
    await this.cacheInterval(exchange, normalizedSymbol, interval.value, interval.source);

    return interval.value;
  }

  /**
   * Get funding intervals for multiple symbols at once (bulk operation)
   * More efficient than calling getInterval() multiple times
   * Returns a Map of symbol -> interval
   */
  static async getIntervalsBulk(
    exchange: Exchange,
    symbols: string[]
  ): Promise<Map<string, number>> {
    const normalizedSymbols = symbols.map(s => this.normalizeSymbol(s));
    const result = new Map<string, number>();

    // 1. Get all cached intervals that are still valid
    const now = new Date();
    const cacheExpiry = new Date(now.getTime() - this.CACHE_TTL_MS);

    const cachedIntervals = await this.prisma.fundingIntervalCache.findMany({
      where: {
        exchange,
        symbol: { in: normalizedSymbols },
        updatedAt: { gte: cacheExpiry },
      },
    });

    // Add cached intervals to result
    const cachedSymbols = new Set<string>();
    for (const cached of cachedIntervals) {
      result.set(cached.symbol, cached.intervalHours);
      cachedSymbols.add(cached.symbol);
    }

    // 2. Fetch missing intervals from exchange
    const missingSymbols = normalizedSymbols.filter(s => !cachedSymbols.has(s));

    if (missingSymbols.length > 0) {
      // Try bulk fetch for all missing symbols
      const bulkIntervals = await this.fetchIntervalsBulkFromExchange(exchange, missingSymbols);

      // Cache all fetched intervals
      for (const [symbol, interval] of bulkIntervals) {
        result.set(symbol, interval.value);
        await this.cacheInterval(exchange, symbol, interval.value, interval.source);
      }
    }

    return result;
  }

  /**
   * Check database cache for a valid (< 2 hours old) interval
   */
  private static async getCachedInterval(
    exchange: Exchange,
    symbol: string
  ): Promise<{ intervalHours: number } | null> {
    const now = new Date();
    const cacheExpiry = new Date(now.getTime() - this.CACHE_TTL_MS);

    const cached = await this.prisma.fundingIntervalCache.findUnique({
      where: {
        symbol_exchange: { symbol, exchange },
      },
    });

    // Return cached value only if it's less than 2 hours old
    if (cached && cached.updatedAt >= cacheExpiry) {
      return { intervalHours: cached.intervalHours };
    }

    return null;
  }

  /**
   * Store interval in database cache
   */
  private static async cacheInterval(
    exchange: Exchange,
    symbol: string,
    intervalHours: number,
    source: string
  ): Promise<void> {
    try {
      await this.prisma.fundingIntervalCache.upsert({
        where: {
          symbol_exchange: { symbol, exchange },
        },
        update: {
          intervalHours,
          source,
          updatedAt: new Date(),
        },
        create: {
          symbol,
          exchange,
          intervalHours,
          source,
        },
      });
    } catch (error) {
      console.error(`[FundingIntervalService] Error caching interval for ${exchange}-${symbol}:`, error);
      // Don't throw - caching failure shouldn't break the flow
    }
  }

  /**
   * Fetch interval from exchange API
   * Returns { value, source } where source indicates how it was obtained
   */
  private static async fetchIntervalFromExchange(
    exchange: Exchange,
    symbol: string
  ): Promise<{ value: number; source: string }> {
    try {
      switch (exchange) {
        case Exchange.BYBIT:
          return await this.fetchBybitInterval(symbol);
        case Exchange.GATEIO:
          return await this.fetchGateIOInterval(symbol);
        case Exchange.BINANCE:
          return await this.fetchBinanceInterval(symbol);
        case Exchange.BINGX:
          return await this.fetchBingXInterval(symbol);
        case Exchange.OKX:
          return await this.fetchOKXInterval(symbol);
        case Exchange.MEXC:
          return await this.fetchMEXCInterval(symbol);
        default:
          // Fallback to database calculation
          return await this.calculateFromDatabase(exchange, symbol);
      }
    } catch (error) {
      console.error(`[FundingIntervalService] Error fetching interval for ${exchange}-${symbol}:`, error);
      // Fallback to database calculation or default
      return await this.calculateFromDatabase(exchange, symbol);
    }
  }

  /**
   * Fetch intervals for multiple symbols from exchange (bulk)
   */
  private static async fetchIntervalsBulkFromExchange(
    exchange: Exchange,
    symbols: string[]
  ): Promise<Map<string, { value: number; source: string }>> {
    const result = new Map<string, { value: number; source: string }>();

    try {
      switch (exchange) {
        case Exchange.BYBIT:
          return await this.fetchBybitIntervalsBulk(symbols);
        case Exchange.GATEIO:
          return await this.fetchGateIOIntervalsBulk(symbols);
        default:
          // For exchanges without bulk endpoints, fetch individually
          for (const symbol of symbols) {
            const interval = await this.fetchIntervalFromExchange(exchange, symbol);
            result.set(symbol, interval);
          }
          return result;
      }
    } catch (error) {
      console.error(`[FundingIntervalService] Error bulk fetching intervals for ${exchange}:`, error);
      return result;
    }
  }

  /**
   * Bybit: Gets fundingIntervalHour directly from tickers API
   */
  private static async fetchBybitInterval(symbol: string): Promise<{ value: number; source: string }> {
    const bybitSymbol = symbol.replace(/[/\-]/g, '');
    const response = await fetchWithTimeout(EXCHANGE_ENDPOINTS.BYBIT.LINEAR_TICKERS, { timeout: 10000 });
    const data = await response.json();

    if (data.retCode !== 0 || !data.result?.list) {
      throw new Error(`Bybit API error: ${data.retMsg || 'Unknown error'}`);
    }

    const ticker = data.result.list.find((t: any) => t.symbol === bybitSymbol);
    if (!ticker) {
      throw new Error(`Symbol ${bybitSymbol} not found on Bybit`);
    }

    if (!ticker.fundingIntervalHour) {
      console.warn(`[FundingIntervalService] Missing fundingIntervalHour for ${bybitSymbol}, using database fallback`);
      return await this.calculateFromDatabase(Exchange.BYBIT, symbol);
    }

    const interval = parseInt(ticker.fundingIntervalHour);
    return { value: interval, source: 'api_direct' };
  }

  /**
   * Bybit bulk: Gets all intervals at once
   */
  private static async fetchBybitIntervalsBulk(
    symbols: string[]
  ): Promise<Map<string, { value: number; source: string }>> {
    const result = new Map<string, { value: number; source: string }>();

    const response = await fetchWithTimeout(EXCHANGE_ENDPOINTS.BYBIT.LINEAR_TICKERS, { timeout: 15000 });
    const data = await response.json();

    if (data.retCode !== 0 || !data.result?.list) {
      throw new Error(`Bybit API error: ${data.retMsg || 'Unknown error'}`);
    }

    // Create a map of Bybit symbols for quick lookup
    const bybitSymbols = new Set(symbols.map(s => s.replace(/[/\-]/g, '')));

    for (const ticker of data.result.list) {
      if (bybitSymbols.has(ticker.symbol)) {
        const normalizedSymbol = this.normalizeSymbol(ticker.symbol);
        if (ticker.fundingIntervalHour) {
          const interval = parseInt(ticker.fundingIntervalHour);
          result.set(normalizedSymbol, { value: interval, source: 'api_direct' });
        } else {
          console.warn(`[FundingIntervalService] Missing fundingIntervalHour for ${ticker.symbol}, will use database fallback`);
          // Skip this symbol, it will be fetched individually later
        }
      }
    }

    return result;
  }

  /**
   * Gate.io: Gets funding_interval from contracts API (in seconds)
   */
  private static async fetchGateIOInterval(symbol: string): Promise<{ value: number; source: string }> {
    const gateioSymbol = symbol.replace(/\//g, '_');
    const response = await fetchWithTimeout(
      'https://api.gateio.ws/api/v4/futures/usdt/contracts',
      { timeout: 15000 }
    );
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Gate.io API error: Invalid response format');
    }

    const contract = data.find((c: any) => c.name === gateioSymbol && c.name.endsWith('_USDT'));
    if (!contract) {
      throw new Error(`Symbol ${gateioSymbol} not found on Gate.io`);
    }

    if (!contract.funding_interval) {
      throw new Error(`No funding_interval for ${gateioSymbol} on Gate.io`);
    }

    // Convert seconds to hours
    const interval = Math.round(contract.funding_interval / 3600);
    return { value: interval, source: 'api_direct' };
  }

  /**
   * Gate.io bulk: Gets all intervals at once
   */
  private static async fetchGateIOIntervalsBulk(
    symbols: string[]
  ): Promise<Map<string, { value: number; source: string }>> {
    const result = new Map<string, { value: number; source: string }>();

    const response = await fetchWithTimeout(
      'https://api.gateio.ws/api/v4/futures/usdt/contracts',
      { timeout: 15000 }
    );
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Gate.io API error: Invalid response format');
    }

    // Create a map of Gate.io symbols for quick lookup
    const gateioSymbols = new Set(symbols.map(s => s.replace(/\//g, '_')));

    for (const contract of data) {
      // Only process USDT contracts
      if (contract.name && contract.name.endsWith('_USDT') &&
          gateioSymbols.has(contract.name) && contract.funding_interval) {
        const normalizedSymbol = this.normalizeSymbol(contract.name.replace(/_/g, '/'));
        const interval = Math.round(contract.funding_interval / 3600);
        result.set(normalizedSymbol, { value: interval, source: 'api_direct' });
      }
    }

    return result;
  }

  /**
   * Binance: Calculate from historical data
   */
  private static async fetchBinanceInterval(symbol: string): Promise<{ value: number; source: string }> {
    const binanceSymbol = symbol.replace(/[/\-]/g, '');

    try {
      const response = await fetchWithTimeout(
        EXCHANGE_ENDPOINTS.BINANCE.FUNDING_RATE_HISTORY(binanceSymbol, 2),
        { timeout: 10000 }
      );
      const data = await response.json();

      if (!Array.isArray(data) || data.length < 2) {
        // console.warn(`[FundingIntervalService] Insufficient Binance historical data for ${binanceSymbol}, using fallback`);
        return await this.calculateFromDatabase(Exchange.BINANCE, symbol);
      }

      // Use absolute value in case API returns records in different order
      const timeDiff = Math.abs(data[0].fundingTime - data[1].fundingTime);
      const interval = Math.round(timeDiff / (1000 * 60 * 60));

      if (interval <= 0 || interval > 24) {
        console.warn(`[FundingIntervalService] Invalid Binance interval ${interval}h for ${binanceSymbol}, using fallback`);
        return await this.calculateFromDatabase(Exchange.BINANCE, symbol);
      }

      return { value: interval, source: 'api_calculated' };
    } catch (error: any) {
      console.warn(`[FundingIntervalService] Error fetching Binance interval for ${binanceSymbol}: ${error.message}, using fallback`);
      return await this.calculateFromDatabase(Exchange.BINANCE, symbol);
    }
  }

  /**
   * BingX: Calculate from historical data
   */
  private static async fetchBingXInterval(symbol: string): Promise<{ value: number; source: string }> {
    // Convert to BingX format: "BTC/USDT" → "BTC-USDT" or "BTCUSDT" → "BTC-USDT"
    let bingxSymbol: string;
    if (symbol.includes('/')) {
      bingxSymbol = symbol.replace('/', '-');
    } else if (symbol.endsWith('USDT')) {
      const base = symbol.slice(0, -4);
      bingxSymbol = `${base}-USDT`;
    } else {
      bingxSymbol = symbol; // Fallback
    }

    try {
      const response = await fetchWithTimeout(
        EXCHANGE_ENDPOINTS.BINGX.FUNDING_RATE_HISTORY(bingxSymbol),
        { timeout: 10000 }
      );
      const data = await response.json();

      if (data.code !== 0 || !data.data || data.data.length < 2) {
        // Not enough historical data - try database fallback
        // console.warn(`[FundingIntervalService] Insufficient BingX historical data for ${bingxSymbol}, using fallback`);
        return await this.calculateFromDatabase(Exchange.BINGX, symbol);
      }

      // Use absolute value in case API returns records in different order
      const timeDiff = Math.abs(data.data[0].fundingTime - data.data[1].fundingTime);
      const interval = Math.round(timeDiff / (1000 * 60 * 60));

      if (interval <= 0 || interval > 24) {
        console.warn(`[FundingIntervalService] Invalid BingX interval ${interval}h for ${bingxSymbol}, using fallback`);
        return await this.calculateFromDatabase(Exchange.BINGX, symbol);
      }

      return { value: interval, source: 'api_calculated' };
    } catch (error: any) {
      console.warn(`[FundingIntervalService] Error fetching BingX interval for ${bingxSymbol}: ${error.message}, using fallback`);
      return await this.calculateFromDatabase(Exchange.BINGX, symbol);
    }
  }

  /**
   * OKX: Calculate from historical data
   */
  private static async fetchOKXInterval(symbol: string): Promise<{ value: number; source: string }> {
    const okxSymbol = symbol.replace(/[/\-]/g, '') + '-SWAP';

    try {
      const response = await fetchWithTimeout(
        EXCHANGE_ENDPOINTS.OKX.FUNDING_RATE_HISTORY(okxSymbol),
        { timeout: 10000 }
      );
      const data = await response.json();

      if (data.code !== '0' || !data.data || data.data.length < 2) {
        // console.warn(`[FundingIntervalService] Insufficient OKX historical data for ${okxSymbol}, using fallback`);
        return await this.calculateFromDatabase(Exchange.OKX, symbol);
      }

      // Use absolute value in case API returns records in different order
      const timeDiff = Math.abs(parseInt(data.data[0].fundingTime) - parseInt(data.data[1].fundingTime));
      const interval = Math.round(timeDiff / (1000 * 60 * 60));

      if (interval <= 0 || interval > 24) {
        console.warn(`[FundingIntervalService] Invalid OKX interval ${interval}h for ${okxSymbol}, using fallback`);
        return await this.calculateFromDatabase(Exchange.OKX, symbol);
      }

      return { value: interval, source: 'api_calculated' };
    } catch (error: any) {
      console.warn(`[FundingIntervalService] Error fetching OKX interval for ${okxSymbol}: ${error.message}, using fallback`);
      return await this.calculateFromDatabase(Exchange.OKX, symbol);
    }
  }

  /**
   * MEXC: Gets collectCycle from futures API
   */
  private static async fetchMEXCInterval(symbol: string): Promise<{ value: number; source: string }> {
    // MEXC implementation would go here
    // For now, fallback to database
    return await this.calculateFromDatabase(Exchange.MEXC, symbol);
  }

  /**
   * Fallback: Calculate from database historical records
   */
  private static async calculateFromDatabase(
    exchange: Exchange,
    symbol: string
  ): Promise<{ value: number; source: string }> {
    try {
      const records = await this.prisma.publicFundingRate.findMany({
        where: { exchange, symbol },
        orderBy: { timestamp: 'desc' },
        take: 2,
      });

      if (records.length >= 2) {
        // Use absolute value in case records are in different order
        const timeDiff = Math.abs(records[0]!.nextFundingTime.getTime() - records[1]!.nextFundingTime.getTime());
        const interval = Math.round(timeDiff / (1000 * 60 * 60));

        if (interval > 0 && interval <= 24) {
          return { value: interval, source: 'db_fallback' };
        }
      }

      // Ultimate fallback: 8 hours (most common)
      return { value: 8, source: 'db_fallback' };
    } catch (error) {
      console.error(`[FundingIntervalService] Database fallback error:`, error);
      return { value: 8, source: 'db_fallback' };
    }
  }

  /**
   * Normalize symbol to standard format: BASE/USDT
   */
  private static normalizeSymbol(symbol: string): string {
    // Remove -USDT or FUSDT suffixes
    let normalized = symbol
      .replace(/-USDT$/i, '')
      .replace(/USDT$/i, '')
      .replace(/_USDT$/i, '');

    // Remove trailing slash or underscore if present
    normalized = normalized.replace(/[/_]$/, '');

    // Ensure format is BASE/USDT
    if (!normalized.includes('/')) {
      normalized = `${normalized}/USDT`;
    }

    return normalized.toUpperCase();
  }

  /**
   * Cleanup old cache entries (older than 7 days)
   * Should be called periodically
   */
  static async cleanupOldCache(): Promise<void> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleted = await this.prisma.fundingIntervalCache.deleteMany({
      where: {
        updatedAt: { lt: sevenDaysAgo },
      },
    });

    console.log(`[FundingIntervalService] Cleaned up ${deleted.count} old cache entries`);
  }
}
