import { Exchange, PrismaClient } from '@prisma/client';
import { BingXService } from '../lib/bingx';
import { BybitService } from '../lib/bybit';
import { redisService } from '../lib/redis';
import prisma from '../lib/prisma';

/**
 * Background service for collecting historical funding rates
 * Runs every 5 minutes to:
 * - Save funding rates to PostgreSQL for historical analysis
 * - Cache funding rates in Redis for fast real-time access (60s TTL)
 */
export class FundingRateCollectorService {
  private prisma: PrismaClient;
  private collectionInterval: NodeJS.Timeout | null = null;
  private readonly COLLECTION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  // Cache for symbols list (fetched dynamically from exchanges)
  private symbolsCache: Map<Exchange, { symbols: string[]; lastFetch: number }> = new Map();

  // Exchanges to track
  private readonly TRACKED_EXCHANGES: Exchange[] = [
    Exchange.BINGX,
    Exchange.BYBIT,
    Exchange.BINANCE,
    Exchange.GATEIO,
    Exchange.BITGET,
    Exchange.OKX,
    Exchange.KUCOIN,
  ];

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Start periodic funding rate collection
   */
  start(): void {
    // console.log('[FundingRateCollector] Starting periodic funding rate collection...');

    // Collect immediately on start
    this.collectAllFundingRates();

    // Then collect every 5 minutes
    this.collectionInterval = setInterval(() => {
      this.collectAllFundingRates();
    }, this.COLLECTION_INTERVAL_MS);

    console.log(`[FundingRateCollector] Collection scheduled every ${this.COLLECTION_INTERVAL_MS / 1000 / 60} minutes`);
  }

  /**
   * Stop periodic collection
   */
  stop(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
      // console.log('[FundingRateCollector] Stopped periodic collection');
    }
  }

  /**
   * Get all available symbols from an exchange (with caching)
   */
  private async getSymbolsForExchange(exchange: Exchange): Promise<string[]> {
    const now = Date.now();
    const cached = this.symbolsCache.get(exchange);

    // Use cache if less than 1 hour old
    if (cached && (now - cached.lastFetch) < 60 * 60 * 1000) {
      return cached.symbols;
    }

    // Fetch fresh list
    let symbols: string[] = [];

    try {
      switch (exchange) {
        case Exchange.BYBIT:
          symbols = await this.fetchBybitSymbols();
          break;
        case Exchange.BINANCE:
          symbols = await this.fetchBinanceSymbols();
          break;
        case Exchange.BINGX:
          symbols = await this.fetchBingXSymbols();
          break;
        case Exchange.GATEIO:
          symbols = await this.fetchGateIOSymbols();
          break;
        case Exchange.OKX:
          symbols = await this.fetchOKXSymbols();
          break;
        case Exchange.BITGET:
          symbols = await this.fetchBitgetSymbols();
          break;
        case Exchange.KUCOIN:
          symbols = await this.fetchKuCoinSymbols();
          break;
        default:
          console.warn(`[FundingRateCollector] Symbol fetching not implemented for ${exchange}`);
          return [];
      }

      // Cache the result
      this.symbolsCache.set(exchange, { symbols, lastFetch: now });
      console.log(`[FundingRateCollector] Fetched ${symbols.length} symbols from ${exchange}`);

      return symbols;
    } catch (error: any) {
      console.error(`[FundingRateCollector] Failed to fetch symbols from ${exchange}:`, error.message);

      // Return cached symbols if available, even if expired
      if (cached) {
        console.log(`[FundingRateCollector] Using stale cache for ${exchange}`);
        return cached.symbols;
      }

      return [];
    }
  }

  /**
   * Collect funding rates from all exchanges for all symbols (bulk mode)
   */
  private async collectAllFundingRates(): Promise<void> {
    const startTime = Date.now();
    console.log('[FundingRateCollector] Starting collection cycle (bulk mode)...');

    let totalCollected = 0;
    let totalErrors = 0;

    for (const exchange of this.TRACKED_EXCHANGES) {
      try {
        const collected = await this.collectBulkFundingRates(exchange);
        totalCollected += collected;
        console.log(`[FundingRateCollector] ✓ ${exchange}: ${collected} symbols collected`);
      } catch (error: any) {
        totalErrors++;
        console.error(`[FundingRateCollector] ✗ ${exchange}: ${error.message}`);
      }

      // Small delay between exchanges
      await this.delay(500);
    }

    const duration = Date.now() - startTime;
    console.log(`[FundingRateCollector] Collection cycle completed in ${(duration / 1000).toFixed(1)}s. Collected: ${totalCollected}, Errors: ${totalErrors}`);
  }

  /**
   * Collect all funding rates from an exchange in one bulk operation
   */
  private async collectBulkFundingRates(exchange: Exchange): Promise<number> {
    let fundingDataList: Array<{
      symbol: string;
      fundingRate: number;
      nextFundingTime: Date;
      fundingInterval: number;
      markPrice?: number;
      indexPrice?: number;
    }> = [];

    // Fetch all funding rates in one request
    switch (exchange) {
      case Exchange.BYBIT:
        fundingDataList = await this.fetchBybitBulkFunding();
        break;
      case Exchange.BINANCE:
        fundingDataList = await this.fetchBinanceBulkFunding();
        break;
      case Exchange.BINGX:
        fundingDataList = await this.fetchBingXBulkFunding();
        break;
      case Exchange.GATEIO:
        fundingDataList = await this.fetchGateIOBulkFunding();
        break;
      case Exchange.OKX:
        fundingDataList = await this.fetchOKXBulkFunding();
        break;
      case Exchange.BITGET:
        fundingDataList = await this.fetchBitgetBulkFunding();
        break;
      case Exchange.KUCOIN:
        fundingDataList = await this.fetchKuCoinBulkFunding();
        break;
      default:
        console.warn(`[FundingRateCollector] Bulk collection not implemented for ${exchange}`);
        return 0;
    }

    if (fundingDataList.length === 0) {
      return 0;
    }

    // Save all to database in batch
    const now = new Date();
    for (const fundingData of fundingDataList) {
      try {
        await this.prisma.publicFundingRate.upsert({
          where: {
            symbol_exchange: {
              symbol: fundingData.symbol,
              exchange,
            },
          },
          update: {
            fundingRate: fundingData.fundingRate,
            nextFundingTime: fundingData.nextFundingTime,
            fundingInterval: fundingData.fundingInterval,
            markPrice: fundingData.markPrice,
            indexPrice: fundingData.indexPrice,
            timestamp: now,
          },
          create: {
            symbol: fundingData.symbol,
            exchange,
            fundingRate: fundingData.fundingRate,
            nextFundingTime: fundingData.nextFundingTime,
            fundingInterval: fundingData.fundingInterval,
            markPrice: fundingData.markPrice,
            indexPrice: fundingData.indexPrice,
            timestamp: now,
          },
        });

        // Cache in Redis
        await redisService.cacheFundingRate(
          exchange,
          fundingData.symbol,
          fundingData.fundingRate,
          fundingData.nextFundingTime,
          fundingData.markPrice,
          fundingData.indexPrice
        );
      } catch (error: any) {
        // Silently skip errors for individual symbols
      }
    }

    return fundingDataList.length;
  }

  /**
   * Collect funding rate for specific exchange and symbol
   */
  private async collectFundingRate(exchange: Exchange, symbol: string): Promise<void> {
    try {
      let fundingData: {
        fundingRate: number;
        nextFundingTime: Date;
        fundingInterval: number;
        markPrice?: number;
        indexPrice?: number;
      } | null = null;

      // Fetch from exchange
      switch (exchange) {
        case Exchange.BINGX:
          fundingData = await this.fetchBingXFunding(symbol);
          break;
        case Exchange.BYBIT:
          fundingData = await this.fetchBybitFunding(symbol);
          break;
        case Exchange.BINANCE:
          fundingData = await this.fetchBinanceFunding(symbol);
          break;
        case Exchange.GATEIO:
          fundingData = await this.fetchGateIOFunding(symbol);
          break;
        case Exchange.OKX:
          fundingData = await this.fetchOKXFunding(symbol);
          break;
        case Exchange.BITGET:
          fundingData = await this.fetchBitgetFunding(symbol);
          break;
        case Exchange.KUCOIN:
          fundingData = await this.fetchKuCoinFunding(symbol);
          break;
        default:
          console.log(`[FundingRateCollector] ${exchange} not implemented yet`);
          return;
      }

      if (!fundingData) {
        return;
      }

      // Save to database (for historical analysis) - using upsert to avoid duplicates
      await this.prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol,
            exchange,
          },
        },
        update: {
          fundingRate: fundingData.fundingRate,
          nextFundingTime: fundingData.nextFundingTime,
          fundingInterval: fundingData.fundingInterval,
          markPrice: fundingData.markPrice,
          indexPrice: fundingData.indexPrice,
          timestamp: new Date(),
        },
        create: {
          symbol,
          exchange,
          fundingRate: fundingData.fundingRate,
          nextFundingTime: fundingData.nextFundingTime,
          fundingInterval: fundingData.fundingInterval,
          markPrice: fundingData.markPrice,
          indexPrice: fundingData.indexPrice,
        },
      });

      // Save to Redis cache (for real-time access with 60s TTL)
      await redisService.cacheFundingRate(
        exchange,
        symbol,
        fundingData.fundingRate,
        fundingData.nextFundingTime,
        fundingData.markPrice,
        fundingData.indexPrice
      );

      console.log(`[FundingRateCollector] ✓ ${exchange}:${symbol} - Rate: ${(fundingData.fundingRate * 100).toFixed(4)}%`);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Fetch funding rate from BingX
   */
  private async fetchBingXFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // BingX uses different symbol format
        const bingxSymbol = symbol.replace('/', '-');

        const response = await fetch(`https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex?symbol=${bingxSymbol}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] BingX API returned ${response.status} for ${symbol}`);
          return null;
        }

        const data = await response.json();

        if (data.code !== 0 || !data.data) {
          return null;
        }

        const fundingInfo = data.data;

        return {
          fundingRate: parseFloat(fundingInfo.lastFundingRate || '0'),
          nextFundingTime: new Date(fundingInfo.nextFundingTime),
          fundingInterval: 8, // BingX has 8-hour funding
          markPrice: parseFloat(fundingInfo.markPrice || '0'),
          indexPrice: parseFloat(fundingInfo.indexPrice || '0'),
        };
      } catch (error: any) {
        if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] BingX API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await this.delay(2000);
          } else {
            return null;
          }
        } else if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] BingX API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else {
          console.error(`[FundingRateCollector] BingX fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch funding rate from Bybit
   */
  private async fetchBybitFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const bybitSymbol = symbol.replace('/', '');

        const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${bybitSymbol}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          // DNS hints to prefer IPv4 and use system DNS
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] Bybit API returned ${response.status} for ${symbol}`);
          return null;
        }

        const data = await response.json();

        if (data.retCode !== 0 || !data.result?.list?.[0]) {
          return null;
        }

        const ticker = data.result.list[0];

        return {
          fundingRate: parseFloat(ticker.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(ticker.nextFundingTime)),
          fundingInterval: 8, // Bybit has 8-hour funding
          markPrice: parseFloat(ticker.markPrice || '0'),
          indexPrice: parseFloat(ticker.indexPrice || '0'),
        };
      } catch (error: any) {
        lastError = error;

        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] Bybit API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] Bybit API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            // Wait before retry for DNS issues
            await this.delay(2000);
          } else {
            return null;
          }
        } else {
          console.error(`[FundingRateCollector] Bybit fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        // Small delay between retries
        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch funding rate from Binance
   */
  private async fetchBinanceFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Binance uses different symbol format (no slash)
        const binanceSymbol = symbol.replace('/', '');

        const response = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${binanceSymbol}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] Binance API returned ${response.status} for ${symbol}`);
          return null;
        }

        const data = await response.json();

        if (!data || !data.symbol) {
          return null;
        }

        return {
          fundingRate: parseFloat(data.lastFundingRate || '0'),
          nextFundingTime: new Date(data.nextFundingTime),
          fundingInterval: 8, // Binance has 8-hour funding
          markPrice: parseFloat(data.markPrice || '0'),
          indexPrice: parseFloat(data.indexPrice || '0'),
        };
      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] Binance API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] Binance API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await this.delay(2000);
          } else {
            return null;
          }
        } else {
          console.error(`[FundingRateCollector] Binance fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch funding rate from Gate.io
   */
  private async fetchGateIOFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Gate.io uses underscore format
        const gateioSymbol = symbol.replace('/', '_');

        const response = await fetch('https://api.gateio.ws/api/v4/futures/usdt/contracts', {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] Gate.io API returned ${response.status} for ${symbol}`);
          return null;
        }

        const contracts = await response.json();

        // Find the contract for this symbol
        const contract = contracts.find((c: any) => c.name === gateioSymbol);

        if (!contract) {
          return null;
        }

        // Skip if funding_interval is missing - NO DEFAULTS ALLOWED
        if (!contract.funding_interval || contract.funding_interval === 0) {
          throw new Error(`Gate.io contract missing funding_interval (defaults forbidden by user)`);
        }

        return {
          fundingRate: parseFloat(contract.funding_rate || '0'),
          nextFundingTime: new Date(contract.funding_next_apply * 1000),
          fundingInterval: contract.funding_interval / 3600, // Seconds to hours
          markPrice: parseFloat(contract.mark_price || '0'),
          indexPrice: parseFloat(contract.index_price || '0'),
        };
      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] Gate.io API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] Gate.io API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await this.delay(2000);
          } else {
            return null;
          }
        } else {
          console.error(`[FundingRateCollector] Gate.io fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch funding rate from OKX
   */
  private async fetchOKXFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // OKX uses format like BTC-USDT-SWAP
        const base = symbol.split('/')[0];
        const okxSymbol = `${base}-USDT-SWAP`;

        const response = await fetch(`https://www.okx.com/api/v5/public/funding-rate?instId=${okxSymbol}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] OKX API returned ${response.status} for ${symbol}`);
          return null;
        }

        const data = await response.json();

        if (data.code !== '0' || !data.data || data.data.length === 0) {
          return null;
        }

        const fundingInfo = data.data[0];

        // Get mark price from ticker
        const tickerResponse = await fetch(`https://www.okx.com/api/v5/market/ticker?instId=${okxSymbol}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!tickerResponse.ok) {
          console.warn(`[FundingRateCollector] OKX ticker API returned ${tickerResponse.status} for ${symbol}`);
        }

        const tickerData = await tickerResponse.json();

        const markPrice = tickerData.code === '0' && tickerData.data?.[0]
          ? parseFloat(tickerData.data[0].last || '0')
          : 0;

        const indexPrice = tickerData.code === '0' && tickerData.data?.[0]
          ? parseFloat(tickerData.data[0].idxPx || '0')
          : 0;

        return {
          fundingRate: parseFloat(fundingInfo.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(fundingInfo.nextFundingTime)),
          fundingInterval: 8, // OKX has 8-hour funding
          markPrice,
          indexPrice,
        };
      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] OKX API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] OKX API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await this.delay(2000);
          } else {
            return null;
          }
        } else {
          console.error(`[FundingRateCollector] OKX fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch funding rate from Bitget
   */
  private async fetchBitgetFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Bitget uses format like BTCUSDT (no separator)
        const bitgetSymbol = symbol.replace('/', '');

        const response = await fetch('https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES', {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] Bitget API returned ${response.status} for ${symbol}`);
          return null;
        }

        const data = await response.json();

        if (data.code !== '00000' || !data.data) {
          console.warn(`[FundingRateCollector] Bitget API error: ${data.msg || 'Unknown error'}`);
          return null;
        }

        // Find symbol in response
        const fundingInfo = data.data.find((item: any) => item.symbol === bitgetSymbol);

        if (!fundingInfo) {
          // Symbol not found - this is OK, not all symbols are available on all exchanges
          return null;
        }

        // Parse funding interval (Bitget returns string like "4")
        const intervalHours = parseInt(fundingInfo.fundingRateInterval || '8');

        // Fetch ticker to get markPrice (Bitget doesn't provide it in funding rate API)
        let markPrice: number | undefined = undefined;
        let indexPrice: number | undefined = undefined;

        try {
          const tickerResponse = await fetch(`https://api.bitget.com/api/v2/mix/market/ticker?productType=USDT-FUTURES&symbol=${bitgetSymbol}`, {
            signal: AbortSignal.timeout(5000),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            // @ts-ignore
            family: 4
          });

          if (tickerResponse.ok) {
            const tickerData = await tickerResponse.json();
            if (tickerData.code === '00000' && tickerData.data?.[0]) {
              markPrice = parseFloat(tickerData.data[0].lastPr || '0') || undefined;
              indexPrice = parseFloat(tickerData.data[0].indexPrice || '0') || undefined;
            }
          }
        } catch (tickerError: any) {
          console.warn(`[FundingRateCollector] Failed to fetch Bitget ticker for ${symbol}:`, tickerError.message);
        }

        return {
          fundingRate: parseFloat(fundingInfo.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(fundingInfo.nextUpdate || '0')),
          fundingInterval: intervalHours,
          markPrice,
          indexPrice,
        };
      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] Bitget API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] Bitget API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await this.delay(2000);
          } else {
            return null;
          }
        } else {
          console.error(`[FundingRateCollector] Bitget fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch funding rate from KuCoin
   */
  private async fetchKuCoinFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // KuCoin uses format like XBTUSDTM (BTC -> XBT, add USDTM suffix)
        // Symbol format: BTC/USDT -> XBTUSDTM, ETH/USDT -> ETHUSDTM, AIA/USDT -> AIAUSDTM
        const base = symbol.split('/')[0];
        // BTC -> XBT for KuCoin, others stay the same
        const kucoinBase = base === 'BTC' ? 'XBT' : base;
        const kucoinSymbol = `${kucoinBase}USDTM`;

        const response = await fetch(`https://api-futures.kucoin.com/api/v1/contracts/${kucoinSymbol}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // @ts-ignore - Node.js fetch options
          family: 4
        });

        if (!response.ok) {
          console.warn(`[FundingRateCollector] KuCoin API returned ${response.status} for ${symbol}`);
          return null;
        }

        const result = await response.json();

        if (result.code !== '200000' || !result.data) {
          console.warn(`[FundingRateCollector] KuCoin API error: ${result.msg || 'Unknown error'}`);
          return null;
        }

        const contract = result.data;

        // Parse funding interval (KuCoin returns fundingRateGranularity in milliseconds)
        const intervalMs = parseInt(contract.fundingRateGranularity || '28800000'); // Default 8 hours in ms
        const intervalHours = intervalMs / 3600000;

        return {
          fundingRate: parseFloat(contract.fundingFeeRate || '0'),
          nextFundingTime: new Date(parseInt(contract.nextFundingRateDateTime || '0')),
          fundingInterval: intervalHours,
          markPrice: parseFloat(contract.markPrice || '0'),
          indexPrice: parseFloat(contract.indexPrice || '0'),
        };
      } catch (error: any) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
          console.warn(`[FundingRateCollector] KuCoin API timeout for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt === maxRetries) return null;
        } else if (error.code === 'ENOTFOUND') {
          console.warn(`[FundingRateCollector] KuCoin API DNS resolution failed for ${symbol} (attempt ${attempt}/${maxRetries})`);
          if (attempt < maxRetries) {
            await this.delay(2000);
          } else {
            return null;
          }
        } else {
          console.error(`[FundingRateCollector] KuCoin fetch error for ${symbol} (attempt ${attempt}/${maxRetries}):`, error.message);
          if (attempt === maxRetries) return null;
        }

        if (attempt < maxRetries) {
          await this.delay(1000);
        }
      }
    }

    return null;
  }

  /**
   * Fetch all funding rates from Bybit in bulk
   */
  private async fetchBybitBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=linear', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Bybit API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.retCode !== 0 || !data.result?.list) {
        throw new Error('Invalid response from Bybit API');
      }

      // Process all tickers
      const fundingData = data.result.list
        .filter((ticker: any) => ticker.symbol.endsWith('USDT') && ticker.nextFundingTime)
        .map((ticker: any) => {
          const symbol = ticker.symbol.slice(0, -4) + '/' + ticker.symbol.slice(-4);
          return {
            symbol,
            fundingRate: parseFloat(ticker.fundingRate || '0'),
            nextFundingTime: new Date(parseInt(ticker.nextFundingTime)),
            fundingInterval: 8,
            markPrice: parseFloat(ticker.markPrice || '0'),
            indexPrice: parseFloat(ticker.indexPrice || '0'),
          };
        })
        .filter((item) => item.markPrice > 0);

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Bybit bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all funding rates from Binance in bulk
   */
  private async fetchBinanceBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Binance API returned ${response.status}`);
      }

      const data = await response.json();

      const fundingData = data
        .filter((item: any) => item.symbol.endsWith('USDT') && item.nextFundingTime)
        .map((item: any) => {
          const symbol = item.symbol.slice(0, -4) + '/' + item.symbol.slice(-4);
          return {
            symbol,
            fundingRate: parseFloat(item.lastFundingRate || '0'),
            nextFundingTime: new Date(item.nextFundingTime),
            fundingInterval: 8,
            markPrice: parseFloat(item.markPrice || '0'),
            indexPrice: parseFloat(item.indexPrice || '0'),
          };
        })
        .filter((item) => item.markPrice > 0);

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Binance bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all funding rates from BingX in bulk
   */
  private async fetchBingXBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      // BingX doesn't have bulk endpoint, need to fetch contracts first
      const symbols = await this.fetchBingXSymbols();
      const fundingData = [];

      // Fetch in batches of 10 to avoid rate limits
      for (let i = 0; i < Math.min(symbols.length, 50); i++) {
        const symbol = symbols[i];
        const data = await this.fetchBingXFunding(symbol);
        if (data) {
          fundingData.push({ symbol, ...data });
        }
        await this.delay(100);
      }

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch BingX bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all funding rates from Gate.io in bulk
   */
  private async fetchGateIOBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      const response = await fetch('https://api.gateio.ws/api/v4/futures/usdt/contracts', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Gate.io API returned ${response.status}`);
      }

      const data = await response.json();

      const fundingData = data
        .filter((contract: any) => contract.name.endsWith('_USDT') && contract.funding_next_apply)
        .map((contract: any) => {
          const symbol = contract.name.replace('_', '/');
          return {
            symbol,
            fundingRate: parseFloat(contract.funding_rate || '0'),
            nextFundingTime: new Date(parseFloat(contract.funding_next_apply) * 1000),
            fundingInterval: parseInt(contract.funding_interval || '28800') / 3600,
            markPrice: parseFloat(contract.mark_price || '0'),
            indexPrice: parseFloat(contract.index_price || '0'),
          };
        })
        .filter((item) => item.markPrice > 0);

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Gate.io bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all funding rates from OKX in bulk
   */
  private async fetchOKXBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      const response = await fetch('https://www.okx.com/api/v5/public/funding-rate?instType=SWAP', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`OKX API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== '0' || !data.data) {
        throw new Error('Invalid response from OKX API');
      }

      const fundingData = data.data
        .filter((item: any) => item.instId.endsWith('-USDT-SWAP') && item.nextFundingTime)
        .map((item: any) => {
          const parts = item.instId.split('-');
          const symbol = parts[0] + '/' + parts[1];
          return {
            symbol,
            fundingRate: parseFloat(item.fundingRate || '0'),
            nextFundingTime: new Date(parseInt(item.nextFundingTime)),
            fundingInterval: 8,
            markPrice: parseFloat(item.markPx || '0'),
            indexPrice: undefined,
          };
        })
        .filter((item) => item.markPrice > 0);

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch OKX bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all funding rates from Bitget in bulk
   */
  private async fetchBitgetBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      const response = await fetch('https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES', {
        signal: AbortSignal.timeout(10000),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Bitget API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== '00000' || !data.data) {
        throw new Error('Invalid response from Bitget API');
      }

      // Fetch all tickers in bulk to get markPrice and indexPrice
      let tickerMap = new Map<string, { markPrice?: number; indexPrice?: number }>();

      try {
        const tickerResponse = await fetch('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES', {
          signal: AbortSignal.timeout(10000),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          // @ts-ignore
          family: 4
        });

        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json();
          if (tickerData.code === '00000' && tickerData.data) {
            // Build a map of symbol -> price data
            for (const ticker of tickerData.data) {
              tickerMap.set(ticker.symbol, {
                markPrice: parseFloat(ticker.lastPr || '0') || undefined,
                indexPrice: parseFloat(ticker.indexPrice || '0') || undefined,
              });
            }
          }
        }
      } catch (tickerError: any) {
        console.warn('[FundingRateCollector] Failed to fetch Bitget bulk tickers:', tickerError.message);
      }

      const fundingData = data.data
        .filter((item: any) => item.symbol.endsWith('USDT') && item.nextUpdate)
        .map((item: any) => {
          const symbol = item.symbol.slice(0, -4) + '/' + item.symbol.slice(-4);
          const priceData = tickerMap.get(item.symbol);

          return {
            symbol,
            fundingRate: parseFloat(item.fundingRate || '0'),
            nextFundingTime: new Date(parseInt(item.nextUpdate)),
            fundingInterval: parseInt(item.fundingRateInterval || '8'),
            markPrice: priceData?.markPrice,
            indexPrice: priceData?.indexPrice,
          };
        })
        // Filter out symbols without valid markPrice (test symbols, delisted, etc.)
        .filter((item) => item.markPrice !== undefined && item.markPrice !== null && item.markPrice > 0);

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Bitget bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all funding rates from KuCoin in bulk
   */
  private async fetchKuCoinBulkFunding(): Promise<Array<{
    symbol: string;
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  }>> {
    try {
      const response = await fetch('https://api-futures.kucoin.com/api/v1/contracts/active', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`KuCoin API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== '200000' || !data.data) {
        throw new Error('Invalid response from KuCoin API');
      }

      const fundingData = data.data
        .filter((contract: any) => contract.symbol.endsWith('USDTM') && contract.nextFundingRateDateTime)
        .map((contract: any) => {
          const symbol = contract.symbol.slice(0, -5) + '/' + contract.symbol.slice(-5, -1);
          const intervalMs = parseInt(contract.fundingRateGranularity || '28800000');
          return {
            symbol,
            fundingRate: parseFloat(contract.fundingFeeRate || '0'),
            nextFundingTime: new Date(parseInt(contract.nextFundingRateDateTime)),
            fundingInterval: intervalMs / 3600000,
            markPrice: parseFloat(contract.markPrice || '0'),
            indexPrice: parseFloat(contract.indexPrice || '0'),
          };
        })
        // Filter out symbols with invalid markPrice (0, delisted, etc.)
        .filter((item) => item.markPrice > 0);

      return fundingData;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch KuCoin bulk funding:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from Bybit
   */
  private async fetchBybitSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=linear', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Bybit API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.retCode !== 0 || !data.result?.list) {
        throw new Error('Invalid response from Bybit API');
      }

      // Filter for USDT perpetuals only
      const symbols = data.result.list
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .map((ticker: any) => {
          const symbol = ticker.symbol;
          // Convert BTCUSDT -> BTC/USDT
          return symbol.slice(0, -4) + '/' + symbol.slice(-4);
        });

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Bybit symbols:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from Binance
   */
  private async fetchBinanceSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://fapi.binance.com/fapi/v1/premiumIndex', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Binance API returned ${response.status}`);
      }

      const data = await response.json();

      // Filter for USDT perpetuals
      const symbols = data
        .filter((item: any) => item.symbol.endsWith('USDT'))
        .map((item: any) => {
          const symbol = item.symbol;
          return symbol.slice(0, -4) + '/' + symbol.slice(-4);
        });

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Binance symbols:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from BingX
   */
  private async fetchBingXSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://open-api.bingx.com/openApi/swap/v2/quote/contracts', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`BingX API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 0 || !data.data) {
        throw new Error('Invalid response from BingX API');
      }

      // Filter for USDT perpetuals
      const symbols = data.data
        .filter((contract: any) => contract.symbol.endsWith('-USDT'))
        .map((contract: any) => contract.symbol.replace('-', '/'));

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch BingX symbols:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from Gate.io
   */
  private async fetchGateIOSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://api.gateio.ws/api/v4/futures/usdt/contracts', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Gate.io API returned ${response.status}`);
      }

      const data = await response.json();

      // Convert to standard format
      const symbols = data
        .filter((contract: any) => contract.name.endsWith('_USDT'))
        .map((contract: any) => contract.name.replace('_', '/'));

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Gate.io symbols:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from OKX
   */
  private async fetchOKXSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://www.okx.com/api/v5/public/instruments?instType=SWAP', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`OKX API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== '0' || !data.data) {
        throw new Error('Invalid response from OKX API');
      }

      // Filter for USDT perpetuals
      const symbols = data.data
        .filter((inst: any) => inst.instId.endsWith('-USDT-SWAP'))
        .map((inst: any) => {
          // Convert BTC-USDT-SWAP -> BTC/USDT
          const parts = inst.instId.split('-');
          return parts[0] + '/' + parts[1];
        });

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch OKX symbols:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from Bitget
   */
  private async fetchBitgetSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://api.bitget.com/api/v2/mix/market/contracts?productType=USDT-FUTURES', {
        signal: AbortSignal.timeout(10000),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`Bitget API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== '00000' || !data.data) {
        throw new Error('Invalid response from Bitget API');
      }

      // Convert to standard format
      const symbols = data.data
        .map((contract: any) => {
          // Convert BTCUSDT -> BTC/USDT
          const symbol = contract.symbol;
          if (symbol.endsWith('USDT')) {
            return symbol.slice(0, -4) + '/' + symbol.slice(-4);
          }
          return null;
        })
        .filter((s: string | null) => s !== null);

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch Bitget symbols:', error.message);
      throw error;
    }
  }

  /**
   * Fetch all available USDT perpetual symbols from KuCoin
   */
  private async fetchKuCoinSymbols(): Promise<string[]> {
    try {
      const response = await fetch('https://api-futures.kucoin.com/api/v1/contracts/active', {
        signal: AbortSignal.timeout(10000),
        // @ts-ignore
        family: 4
      });

      if (!response.ok) {
        throw new Error(`KuCoin API returned ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== '200000' || !data.data) {
        throw new Error('Invalid response from KuCoin API');
      }

      // Filter for USDT perpetuals
      const symbols = data.data
        .filter((contract: any) => contract.symbol.endsWith('USDTM'))
        .map((contract: any) => {
          // Convert BTCUSDTM -> BTC/USDT
          const symbol = contract.symbol;
          return symbol.slice(0, -5) + '/' + symbol.slice(-5, -1);
        });

      return symbols;
    } catch (error: any) {
      console.error('[FundingRateCollector] Failed to fetch KuCoin symbols:', error.message);
      throw error;
    }
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up old data (keep last 90 days)
   */
  async cleanupOldData(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await this.prisma.publicFundingRate.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    console.log(`[FundingRateCollector] Cleaned up ${deleted.count} old records (older than 90 days)`);
  }
}

// Singleton instance
let collectorInstance: FundingRateCollectorService | null = null;

export function getFundingRateCollector(): FundingRateCollectorService {
  if (!collectorInstance) {
    collectorInstance = new FundingRateCollectorService();
  }
  return collectorInstance;
}
