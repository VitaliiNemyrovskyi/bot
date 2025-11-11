import { PrismaClient, Exchange } from '@prisma/client';
import { BingXService } from '../lib/bingx';
import { BybitService } from '../lib/bybit';
import { redisService } from '../lib/redis';

/**
 * Background service for collecting historical funding rates
 * Runs every hour to:
 * - Save funding rates to PostgreSQL for historical analysis
 * - Cache funding rates in Redis for fast real-time access (60s TTL)
 */
export class FundingRateCollectorService {
  private prisma: PrismaClient;
  private collectionInterval: NodeJS.Timeout | null = null;
  private readonly COLLECTION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  // Symbols to track (can be expanded)
  private readonly TRACKED_SYMBOLS = [
    'BTC/USDT',
    'ETH/USDT',
    'BNB/USDT',
    'SOL/USDT',
    'ARB/USDT',
    'OP/USDT',
    'MATIC/USDT',
    'AVAX/USDT',
    'DOT/USDT',
    'LINK/USDT',
    'RIVER/USDT',
    'AIA/USDT',
    'LSK/USDT',
  ];

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
    this.prisma = new PrismaClient();
  }

  /**
   * Start periodic funding rate collection
   */
  start(): void {
    // console.log('[FundingRateCollector] Starting periodic funding rate collection...');

    // Collect immediately on start
    this.collectAllFundingRates();

    // Then collect every hour
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
   * Collect funding rates from all exchanges for all symbols
   */
  private async collectAllFundingRates(): Promise<void> {
    const startTime = Date.now();
    // console.log('[FundingRateCollector] Starting collection cycle...');

    let totalCollected = 0;
    let totalErrors = 0;

    for (const exchange of this.TRACKED_EXCHANGES) {
      for (const symbol of this.TRACKED_SYMBOLS) {
        try {
          await this.collectFundingRate(exchange, symbol);
          totalCollected++;

          // Small delay to avoid rate limits
          await this.delay(100);
        } catch (error: any) {
          totalErrors++;
          console.error(`[FundingRateCollector] Error collecting ${exchange}:${symbol}:`, error.message);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[FundingRateCollector] Collection cycle completed in ${duration}ms. Collected: ${totalCollected}, Errors: ${totalErrors}`);
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

        return {
          fundingRate: parseFloat(fundingInfo.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(fundingInfo.nextUpdate || '0')),
          fundingInterval: intervalHours,
          markPrice: undefined, // Bitget doesn't provide mark price in funding rate API
          indexPrice: undefined,
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
          nextFundingTime: new Date(parseInt(contract.nextFundingRateTime || '0')),
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
