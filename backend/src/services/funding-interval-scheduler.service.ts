import cron from 'node-cron';
import prisma from '@/lib/prisma';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';
import { EXCHANGE_ENDPOINTS } from '@/lib/exchange-api-endpoints';

/**
 * Funding Interval Scheduler Service
 *
 * Automatically updates funding intervals for all exchanges every hour.
 * Ensures fresh data without blocking API requests.
 */

// In-memory cache for funding intervals
const fundingIntervalCache = new Map<string, number>();

// Valid funding intervals (hours) - only these values are allowed
const VALID_FUNDING_INTERVALS = [1, 4, 8];

/**
 * Calculate BingX funding interval from historical data
 */
async function calculateBingXFundingInterval(bingxSymbol: string, normalizedSymbol: string): Promise<number> {
  try {
    // Check cache first
    const cacheKey = `BINGX-${normalizedSymbol}`;
    const cached = fundingIntervalCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from history API
    const historyResponse = await fetchWithTimeout(
      EXCHANGE_ENDPOINTS.BINGX.FUNDING_RATE_HISTORY(bingxSymbol),
      { timeout: 10000 }
    );
    const historyData = await historyResponse.json();

    if (historyData.code === 0 && historyData.data && historyData.data.length >= 2) {
      const timeDiff = Math.abs(historyData.data[0].fundingTime - historyData.data[1].fundingTime);
      const hoursInterval = Math.round(timeDiff / (1000 * 60 * 60));

      // Only accept valid funding intervals (1, 4, or 8 hours)
      if (VALID_FUNDING_INTERVALS.includes(hoursInterval)) {
        fundingIntervalCache.set(cacheKey, hoursInterval);
        return hoursInterval;
      }
    }

    return 0;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Scheduler] Error calculating BingX interval for ${bingxSymbol}:`, errorMessage);
    return 0;
  }
}

/**
 * Update funding intervals for BingX
 */
async function updateBingXIntervals(): Promise<void> {
  try {
    console.log('[Scheduler] Starting BingX funding interval update...');

    // Get all BingX symbols with interval=0 or old data
    const symbolsNeedingUpdate = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'BINGX',
        OR: [
          { fundingInterval: 0 },
          { timestamp: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Older than 24h
        ]
      },
      select: {
        symbol: true
      }
    });

    if (symbolsNeedingUpdate.length === 0) {
      console.log('[Scheduler] BingX: All intervals up to date');
      return;
    }

    console.log(`[Scheduler] BingX: Updating intervals for ${symbolsNeedingUpdate.length} symbols...`);

    // Process in batches of 10
    const batchSize = 10;
    let updated = 0;

    for (let i = 0; i < symbolsNeedingUpdate.length; i += batchSize) {
      const batch = symbolsNeedingUpdate.slice(i, i + batchSize);

      const batchPromises = batch.map(async ({ symbol }) => {
        const bingxSymbol = symbol.replace('/', '-');
        const interval = await calculateBingXFundingInterval(bingxSymbol, symbol);

        if (interval > 0) {
          await prisma.publicFundingRate.update({
            where: {
              symbol_exchange: {
                symbol: symbol,
                exchange: 'BINGX'
              }
            },
            data: {
              fundingInterval: interval,
              timestamp: new Date()
            }
          });
          updated++;
          console.log(`[Scheduler] BingX: Updated ${symbol} → ${interval}h`);
        }
      });

      await Promise.all(batchPromises);
    }

    console.log(`[Scheduler] BingX: Updated ${updated}/${symbolsNeedingUpdate.length} intervals`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scheduler] Error updating BingX intervals:', errorMessage);
  }
}

/**
 * Calculate KuCoin funding interval from historical data
 */
async function calculateKuCoinFundingInterval(kucoinSymbol: string, normalizedSymbol: string): Promise<number> {
  try {
    // Check cache first
    const cacheKey = `KUCOIN-${normalizedSymbol}`;
    const cached = fundingIntervalCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // KuCoin funding rates API endpoint
    const now = Date.now();
    const threeDaysAgo = now - (3 * 24 * 60 * 60 * 1000);
    const url = `https://api-futures.kucoin.com/api/v1/contract/funding-rates?symbol=${kucoinSymbol}&from=${threeDaysAgo}&to=${now}`;

    const response = await fetchWithTimeout(url, { timeout: 10000 });
    const data = await response.json();

    if (data.code === '200000' && data.data && data.data.length >= 2) {
      // Sort by timePoint ascending
      const sorted = data.data.sort((a: any, b: any) => a.timePoint - b.timePoint);

      // Calculate interval from first two records
      const timeDiff = Math.abs(sorted[1].timePoint - sorted[0].timePoint);
      const hoursInterval = Math.round(timeDiff / (1000 * 60 * 60));

      // Only accept valid funding intervals (1, 4, or 8 hours)
      if (VALID_FUNDING_INTERVALS.includes(hoursInterval)) {
        fundingIntervalCache.set(cacheKey, hoursInterval);
        return hoursInterval;
      }
    }

    return 0;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Scheduler] Error calculating KuCoin interval for ${kucoinSymbol}:`, errorMessage);
    return 0;
  }
}

/**
 * Update funding intervals for KuCoin
 */
async function updateKuCoinIntervals(): Promise<void> {
  try {
    console.log('[Scheduler] Starting KuCoin funding interval update...');

    // Get all KuCoin symbols with interval=0 or old data
    const symbolsNeedingUpdate = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'KUCOIN',
        OR: [
          { fundingInterval: 0 },
          { timestamp: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Older than 24h
        ]
      },
      select: {
        symbol: true
      }
    });

    if (symbolsNeedingUpdate.length === 0) {
      console.log('[Scheduler] KuCoin: All intervals up to date');
      return;
    }

    console.log(`[Scheduler] KuCoin: Updating intervals for ${symbolsNeedingUpdate.length} symbols...`);

    // Process in batches of 10
    const batchSize = 10;
    let updated = 0;

    for (let i = 0; i < symbolsNeedingUpdate.length; i += batchSize) {
      const batch = symbolsNeedingUpdate.slice(i, i + batchSize);

      const batchPromises = batch.map(async ({ symbol }) => {
        // Convert symbol format: BTC/USDT -> XBTUSDTM
        const base = symbol.split('/')[0];
        const kucoinBase = base === 'BTC' ? 'XBT' : base;
        const kucoinSymbol = `${kucoinBase}USDTM`;

        const interval = await calculateKuCoinFundingInterval(kucoinSymbol, symbol);

        if (interval > 0) {
          await prisma.publicFundingRate.update({
            where: {
              symbol_exchange: {
                symbol: symbol,
                exchange: 'KUCOIN'
              }
            },
            data: {
              fundingInterval: interval,
              timestamp: new Date()
            }
          });
          updated++;
          console.log(`[Scheduler] KuCoin: Updated ${symbol} → ${interval}h`);
        }
      });

      await Promise.all(batchPromises);
    }

    console.log(`[Scheduler] KuCoin: Updated ${updated}/${symbolsNeedingUpdate.length} intervals`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scheduler] Error updating KuCoin intervals:', errorMessage);
  }
}

/**
 * Update funding rates from public APIs for all exchanges
 */
async function updateAllPublicFundingRates(): Promise<void> {
  try {
    console.log('[Scheduler] Starting funding rates update for all exchanges...');

    const exchanges = [
      { name: 'BINGX', url: 'http://localhost:3000/api/bingx/public-funding-rates' },
      { name: 'OKX', url: 'http://localhost:3000/api/okx/public-funding-rates' },
      { name: 'GATEIO', url: 'http://localhost:3000/api/gateio/public-funding-rates' },
      { name: 'BINANCE', url: 'http://localhost:3000/api/binance/public-funding-rates' },
      { name: 'BYBIT', url: 'http://localhost:3000/api/bybit/public-funding-rates' },
      { name: 'MEXC', url: 'http://localhost:3000/api/mexc/public-funding-rates' },
      { name: 'KUCOIN', url: 'http://localhost:3000/api/kucoin/public-funding-rates' },
    ];

    for (const exchange of exchanges) {
      try {
        console.log(`[Scheduler] Fetching ${exchange.name} funding rates...`);
        const response = await fetchWithTimeout(exchange.url, {
          timeout: 60000 // 60 second timeout for full update
        });

        if (response.ok) {
          console.log(`[Scheduler] ${exchange.name}: Updated successfully`);
        } else {
          console.warn(`[Scheduler] ${exchange.name}: Failed with status ${response.status}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Scheduler] ${exchange.name}: Error - ${errorMessage}`);
      }
    }

    console.log('[Scheduler] Finished funding rates update for all exchanges');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Scheduler] Error updating public funding rates:', errorMessage);
  }
}

/**
 * Main scheduled task
 */
async function scheduledUpdate(): Promise<void> {
  console.log('[Scheduler] ========== Hourly Update Started ==========');
  const startTime = Date.now();

  // Step 1: Update all public funding rates (this refreshes the cache)
  await updateAllPublicFundingRates();

  // Step 2: Update BingX intervals specifically (for symbols that need it)
  await updateBingXIntervals();

  // Step 3: Update KuCoin intervals specifically (for symbols that need it)
  await updateKuCoinIntervals();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Scheduler] ========== Hourly Update Completed in ${duration}s ==========`);
}

/**
 * Start the scheduler
 */
export function startFundingIntervalScheduler(): void {
  // Run every hour at :00 minutes
  cron.schedule('0 * * * *', () => {
    scheduledUpdate();
  });

  console.log('[Scheduler] Funding interval scheduler started (runs every hour)');
  console.log('[Scheduler] Next run: ' + new Date(Date.now() + 60 * 60 * 1000).toISOString());

  // Run immediately on startup (optional)
  if (process.env.RUN_SCHEDULER_ON_STARTUP === 'true') {
    console.log('[Scheduler] Running initial update on startup...');
    scheduledUpdate();
  }
}

/**
 * Manual trigger for testing/admin
 */
export async function triggerManualUpdate(): Promise<{ success: boolean; message: string }> {
  try {
    await scheduledUpdate();
    return { success: true, message: 'Manual update completed successfully' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, message: `Manual update failed: ${errorMessage}` };
  }
}
