import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { MEXCService } from '@/lib/mexc';
import { AuthService } from '@/lib/auth';
import { CoinGeckoService } from '@/lib/coingecko';
import { CCXTService } from '@/lib/ccxt-service';
// CCXT migration for funding rates API

/**
 * Fetch funding rates from an exchange using CCXT with fallback to legacy services
 * @param credential - Exchange credential
 * @returns Exchange funding rates or null on failure
 */
async function fetchExchangeFundingRates(
  credential: any
): Promise<{
  credentialId: string;
  exchange: string;
  rates: Array<{
    symbol: string;
    originalSymbol?: string;
    fundingRate: string;
    nextFundingTime: number;
    lastPrice: string;
  }>;
} | null> {
  const exchangeUpper = credential.exchange.toUpperCase();

  console.log(`[Arbitrage] Fetching funding rates for ${exchangeUpper}`);
  console.log(`[Arbitrage] Credential details - ID: ${credential.id}, hasApiKey: ${!!credential.apiKey}, hasApiSecret: ${!!credential.apiSecret}`);

  // Try CCXT first for all exchanges
  try {
    console.log(`[Arbitrage] ${exchangeUpper} - Attempting CCXT fetch`);

    const ccxtService = new CCXTService(credential.exchange.toLowerCase(), {
      apiKey: credential.apiKey,
      apiSecret: credential.apiSecret,
      enableRateLimit: true,
    });

    await ccxtService.loadMarkets();
    const fundingRates = await ccxtService.getAllFundingRates();

    console.log(`[Arbitrage] ${exchangeUpper} CCXT - Successfully fetched ${fundingRates.length} funding rates`);

    return {
      credentialId: credential.id,
      exchange: credential.exchange,
      rates: fundingRates.map(r => {
        // Normalize symbol: remove slashes, special characters, and perpetual contract suffixes
        // Examples:
        // BTC/USDT:USDT -> BTCUSDT (remove / and :USDT)
        // BTC/USDT -> BTCUSDT (remove /)
        // BTC-USDT -> BTCUSDT (remove -)
        let normalizedSymbol = r.symbol.replace(/[\/\-_]/g, ''); // Remove slashes, hyphens, underscores
        normalizedSymbol = normalizedSymbol.replace(/:.*$/, ''); // Remove colon and everything after it (e.g., :USDT)
        return {
          symbol: normalizedSymbol,
          originalSymbol: r.symbol,
          fundingRate: r.fundingRate,
          nextFundingTime: r.nextFundingTime,
          lastPrice: r.markPrice,
          fundingIntervalFromApi: r.fundingInterval, // Pass through from CCXT if available
        };
      })
    };
  } catch (ccxtError: any) {
    console.error(`[Arbitrage] ${exchangeUpper} CCXT fetch failed:`, ccxtError.message);
    console.log(`[Arbitrage] ${exchangeUpper} - Falling back to legacy service`);

    // Fallback to legacy services
    try {
      if (exchangeUpper === 'BYBIT') {
        // BYBIT legacy service doesn't support funding rates, rely on CCXT
        console.error(`[Arbitrage] ${exchangeUpper} - Legacy service not available for funding rates`);
        return null;
      } else if (exchangeUpper === 'BINGX') {
        const bingxService = new BingXService({
          apiKey: credential.apiKey,
          apiSecret: credential.apiSecret,
          enableRateLimit: true,
        });

        // Sync time with BingX server before making requests
        await bingxService.syncTime();

        const rates = await bingxService.getAllFundingRates();
        console.log(`[Arbitrage] ${exchangeUpper} legacy - Successfully fetched ${rates.length} funding rates`);

        // Fetch funding intervals from database (populated by /api/bingx/public-funding-rates)
        const { default: prisma } = await import('@/lib/prisma');
        const dbIntervals = await prisma.publicFundingRate.findMany({
          where: {
            exchange: 'BINGX',
          },
          select: {
            symbol: true,
            fundingInterval: true,
          },
        });

        const intervalMap = new Map<string, number>();
        for (const record of dbIntervals) {
          intervalMap.set(record.symbol, record.fundingInterval);
        }

        return {
          credentialId: credential.id,
          exchange: credential.exchange,
          rates: rates.map(r => {
            const normalizedSymbol = r.symbol.replace(/-/g, '/'); // BTC-USDT -> BTC/USDT for DB lookup
            const fundingInterval = intervalMap.get(normalizedSymbol) || 0;

            return {
              symbol: r.symbol.replace(/-/g, ''), // Normalize symbol format (BTC-USDT -> BTCUSDT)
              originalSymbol: r.symbol, // Keep original for reference
              fundingRate: r.fundingRate,
              nextFundingTime: r.fundingTime,
              lastPrice: r.markPrice || '0', // Use mark price as last price
              fundingIntervalFromApi: fundingInterval, // From database (calculated by public API)
            };
          })
        };
      } else if (exchangeUpper === 'MEXC') {
        // MEXC is handled separately due to special symbol filtering logic
        console.log(`[Arbitrage] ${exchangeUpper} - MEXC requires special handling, returning null for now`);
        return null;
      } else {
        console.error(`[Arbitrage] ${exchangeUpper} - No legacy fallback available`);
        return null;
      }
    } catch (legacyError: any) {
      console.error(`[Arbitrage] ${exchangeUpper} legacy fetch also failed:`, legacyError.message);
      return null;
    }
  }
}

/**
 * Get default funding interval for an exchange (in hours)
 *
 * IMPORTANT: This is only a FALLBACK when CCXT doesn't provide the interval.
 * Funding intervals can vary by SYMBOL and can change over time.
 * Always prefer the interval from CCXT API (fundingIntervalFromApi) when available.
 *
 * Common default intervals:
 * - Most exchanges: 8 hours (3 times per day)
 * - Some symbols: 4 hours (6 times per day)
 * - Some symbols: 1 hour (24 times per day)
 *
 * Returns pure number (hours) - no "h" suffix
 */
function getDefaultFundingInterval(exchange: string): number {
  const intervals: Record<string, number> = {
    'BINANCE': 8,
    'BYBIT': 8,
    'BINGX': 8,
    'OKX': 8,
    'GATEIO': 8, // Confirmed via API: funding_interval=28800 seconds
    'MEXC': 8, // Confirmed via API: collectCycle=8 hours
  };

  return intervals[exchange.toUpperCase()] || 0;
}

/**
 * Normalize funding rate to 8-hour interval for fair comparison
 *
 * Different exchanges use different funding intervals:
 * - Most exchanges: 8 hours (3 times per day)
 * - Some exchanges: 4 hours (6 times per day)
 * - Some exchanges: 1 hour (24 times per day)
 *
 * Example: If Exchange A has 2% funding every 8h and Exchange B has 1.5% funding every 1h:
 * - Exchange A: 2% per 8h (normalized: 2%)
 * - Exchange B: 1.5% per 1h (normalized: 1.5% * 8 = 12% per 8h)
 *
 * Without normalization, we might think A is better (2% > 1.5%), but actually B pays 12% per 8h period!
 *
 * @param fundingRate - Original funding rate as string (e.g., "0.0001")
 * @param fundingIntervalHours - Funding interval in hours (e.g., 8, 4, 1)
 * @returns Normalized funding rate to 8h interval as number
 */
function normalizeFundingRateTo8h(fundingRate: string, fundingIntervalHours: number): number {
  const rate = parseFloat(fundingRate);

  // Normalization multiplier: convert to 8h interval
  // If interval is 0 (unknown), use 1x multiplier (no normalization)
  const multiplier = fundingIntervalHours > 0 ? (8 / fundingIntervalHours) : 1;
  const normalizedRate = rate * multiplier;

  console.log(`[FundingNormalization] ${fundingRate} (${fundingIntervalHours}h) → ${normalizedRate.toFixed(6)} (8h normalized), multiplier: ${multiplier}x`);

  return normalizedRate;
}

/**
 * GET /api/arbitrage/funding-rates
 *
 * Fetches funding rates from all active exchange credentials and analyzes arbitrage opportunities.
 * Returns trading pairs with their funding rates across different exchanges, sorted by price spread.
 * Spread is calculated as the price difference between exchanges: (maxPrice - minPrice) / minPrice
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "BTCUSDT",
 *       "exchanges": [
 *         {
 *           "exchange": "BYBIT",
 *           "credentialId": "xxx",
 *           "fundingRate": "0.0001",
 *           "nextFundingTime": 1234567890000,
 *           "environment": "MAINNET"
 *         },
 *         {
 *           "exchange": "BINGX",
 *           "credentialId": "yyy",
 *           "fundingRate": "0.0005",
 *           "nextFundingTime": 1234567890000,
 *           "environment": "MAINNET"
 *         }
 *       ],
 *       "spread": 0.0004, // Price spread as decimal (0.04% = 0.0004)
 *       "spreadPercent": 0.04, // Price spread as percentage
 *       "bestLong": { exchange: "BYBIT", fundingRate: "0.0001" },
 *       "bestShort": { exchange: "BINGX", fundingRate: "0.0005" },
 *       "arbitrageOpportunity": true
 *     }
 *   ],
 *   "timestamp": "2025-10-06T21:00:00.000Z"
 * }
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
          message: 'Authentication required. Please log in.',
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Load all active exchange credentials with decryption
    console.log(`[Arbitrage] Loading and decrypting all active credentials for user: ${userId}`);
    // const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
    const { EncryptionService } = await import('@/lib/encryption');
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    // Query database directly for active credentials
    const dbCredentials = await prisma.exchangeCredentials.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    console.log(`[Arbitrage] Found ${dbCredentials.length} active credentials in database`);

    // Decrypt each credential
    const validActiveCredentials = dbCredentials
      .map((cred: any) => {
        try {
          console.log(`[Arbitrage] Decrypting ${cred.exchange} credential ID: ${cred.id}`);

          const apiKey = EncryptionService.decrypt(cred.apiKey);
          const apiSecret = EncryptionService.decrypt(cred.apiSecret);
          const authToken = cred.authToken ? EncryptionService.decrypt(cred.authToken) : undefined;

          console.log(`[Arbitrage] Decrypted ${cred.exchange}: hasApiKey=${!!apiKey}, apiKeyLength=${apiKey?.length}, hasApiSecret=${!!apiSecret}, apiSecretLength=${apiSecret?.length}, hasAuthToken=${!!authToken}`);

          return {
            id: cred.id,
            exchange: cred.exchange,
            apiKey,
            apiSecret,
            authToken,
            label: cred.label || undefined,
            createdAt: cred.createdAt,
            updatedAt: cred.updatedAt,
          };
        } catch (error: any) {
          console.error(`[Arbitrage] Error decrypting ${cred.exchange} credential ${cred.id}:`, error.message);
          return null;
        }
      })
      .filter((c: any): c is NonNullable<typeof c> => c !== null);

    console.log(`[Arbitrage] Total valid credentials after decryption: ${validActiveCredentials.length}`);

    if (validActiveCredentials.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active credentials',
          message: 'Please configure and activate at least one exchange credential.',
          code: 'NO_ACTIVE_CREDENTIALS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 3. Fetch funding rates from all exchanges
    // Step 1: Fetch from non-MEXC exchanges first to build symbol list
    const nonMexcCredentials = validActiveCredentials.filter((c: any) => c.exchange !== 'MEXC');
    const mexcCredentials = validActiveCredentials.filter((c: any) => c.exchange === 'MEXC');

    // Use the new helper function with CCXT + fallback
    const nonMexcFetchPromises = nonMexcCredentials.map((credential: any) =>
      fetchExchangeFundingRates(credential)
    );

    const nonMexcResults = await Promise.all(nonMexcFetchPromises);
    const validNonMexcResults = nonMexcResults.filter(r => r !== null);

    // Step 2: Build unique symbol list from non-MEXC exchanges
    const uniqueSymbols = new Set<string>();
    validNonMexcResults.forEach((result: any) => {
      if (result) {
        result.rates.forEach((rate: any) => uniqueSymbols.add(rate.symbol));
      }
    });

    console.log(`[Arbitrage] Found ${uniqueSymbols.size} unique symbols from non-MEXC exchanges`);

    // Step 3: Fetch MEXC funding rates only for symbols that exist on other exchanges
    const mexcFetchPromises = mexcCredentials.map(async (credential: any) => {
      try {
        console.log(`[Arbitrage] Fetching funding rates for MEXC`);
        console.log(`[Arbitrage] Credential details - ID: ${credential.id}, hasApiKey: ${!!credential.apiKey}, hasApiSecret: ${!!credential.apiSecret}`);

        // Try CCXT first for MEXC
        try {
          console.log(`[Arbitrage] MEXC - Attempting CCXT fetch`);

          const ccxtService = new CCXTService('mexc', {
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            enableRateLimit: true,
          });

          await ccxtService.loadMarkets();
          const allFundingRates = await ccxtService.getAllFundingRates();

          // Filter to only include symbols that exist on other exchanges
          const filteredRates = allFundingRates.filter(r => {
            let normalizedSymbol = r.symbol.replace(/[\/\-_]/g, '');
            normalizedSymbol = normalizedSymbol.replace(/:.*$/, ''); // Remove colon and everything after
            return uniqueSymbols.has(normalizedSymbol);
          });

          console.log(`[Arbitrage] MEXC CCXT - Successfully fetched ${filteredRates.length}/${allFundingRates.length} funding rates (filtered to match other exchanges)`);

          return {
            credentialId: credential.id,
            exchange: credential.exchange,
            rates: filteredRates.map(r => {
              let normalizedSymbol = r.symbol.replace(/[\/\-_]/g, '');
              normalizedSymbol = normalizedSymbol.replace(/:.*$/, ''); // Remove colon and everything after
              return {
                symbol: normalizedSymbol,
                originalSymbol: r.symbol,
                fundingRate: r.fundingRate,
                nextFundingTime: r.nextFundingTime,
                lastPrice: r.markPrice,
                fundingIntervalFromApi: r.fundingInterval, // Pass through from CCXT if available
              };
            })
          };
        } catch (ccxtError: any) {
          console.error(`[Arbitrage] MEXC CCXT fetch failed:`, ccxtError.message);
          console.log(`[Arbitrage] MEXC - Falling back to legacy service`);

          // Fallback to legacy MEXC service
          const mexcService = new MEXCService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            authToken: credential.authToken,
            enableRateLimit: true,
          });

          // Convert normalized symbols to MEXC format (BTCUSDT -> BTC_USDT)
          const mexcSymbols = Array.from(uniqueSymbols).map(sym => {
            // Insert underscore before USDT/USDC suffix
            return sym.replace(/^(.+)(USDT|USDC|USD)$/, '$1_$2');
          });

          console.log(`[Arbitrage] MEXC legacy - Fetching tickers and funding rates for ${mexcSymbols.length} symbols`);

          // Use optimized batch method to avoid rate limiting
          console.log(`[Arbitrage] MEXC - Using getFundingRatesForSymbols() for ${mexcSymbols.length} symbols`);
          const rates = await mexcService.getFundingRatesForSymbols(mexcSymbols);

          console.log(`[Arbitrage] MEXC legacy - Successfully fetched ${rates.length}/${mexcSymbols.length} funding rates`);

          return {
            credentialId: credential.id,
            exchange: credential.exchange,
            rates: rates.map(r => ({
              symbol: r.symbol.replace(/_/g, ''), // Normalize symbol format (BTC_USDT -> BTCUSDT)
              originalSymbol: r.symbol, // Keep original for reference
              fundingRate: r.fundingRate.toString(),
              nextFundingTime: r.nextSettleTime,
              fundingIntervalFromApi: r.collectCycle, // Funding interval from MEXC API (1, 4, or 8 hours)
              lastPrice: r.lastPrice?.toString() || '0',
            }))
          };
        }
      } catch (error: any) {
        console.error(`[Arbitrage] Failed to fetch rates for ${credential.exchange}:`, error.message);
        return null;
      }
    });

    const mexcResults = await Promise.all(mexcFetchPromises);
    const validMexcResults = mexcResults.filter(r => r !== null);

    // Combine all results
    const validResults = [...validNonMexcResults, ...validMexcResults];

    console.log(`[Arbitrage] Successfully fetched rates from ${validResults.length} exchanges (${validNonMexcResults.length} non-MEXC + ${validMexcResults.length} MEXC)`);

    // 4. Organize funding rates by symbol
    const symbolMap: Map<string, any[]> = new Map();

    validResults.forEach(result => {
      if (!result) return;

      console.log(`[Arbitrage] Processing ${result.rates.length} rates from ${result.exchange}`);

      result.rates.forEach((rate: any) => {
        // Debug symbol normalization for all symbols
        if (result.exchange === 'BINGX') {
          console.log(`[Arbitrage] BingX symbol mapping: original="${rate.originalSymbol}" -> normalized="${rate.symbol}"`);
        }

        if (!symbolMap.has(rate.symbol)) {
          symbolMap.set(rate.symbol, []);
        }

        // Get funding interval from API only - NO DEFAULTS
        // If fundingIntervalFromApi is not available, skip this symbol
        if (!rate.fundingIntervalFromApi || rate.fundingIntervalFromApi === 0) {
          console.warn(`[FundingInterval] ${result.exchange} ${rate.symbol}: NO funding interval from API - SKIPPING symbol (defaults forbidden by user)`);
          return; // Skip this symbol - no default values allowed
        }

        const fundingIntervalHours = rate.fundingIntervalFromApi;
        console.log(`[FundingInterval] ${result.exchange} ${rate.symbol}: Using API interval: ${fundingIntervalHours}h`);

        // Normalize funding rate to 8h interval for backend sorting only
        const normalizedFundingRate = normalizeFundingRateTo8h(rate.fundingRate, fundingIntervalHours);

        // Debug log for verification
        const nextTime = new Date(rate.nextFundingTime);
        const timeUntil = (rate.nextFundingTime - Date.now()) / (1000 * 60 * 60);
        console.log(`[FundingInterval] ${result.exchange} ${rate.symbol}: interval=${fundingIntervalHours}h, nextFunding=${nextTime.toISOString()}, hoursUntil=${timeUntil.toFixed(2)}h, rate=${rate.fundingRate}, normalized=${normalizedFundingRate.toFixed(6)}`);


        symbolMap.get(rate.symbol)!.push({
          exchange: result.exchange,
          credentialId: result.credentialId,
          fundingRate: rate.fundingRate, // Original funding rate for display
          fundingRateNormalized: normalizedFundingRate, // For backend sorting
          nextFundingTime: rate.nextFundingTime, // Frontend calculates interval from this
          fundingInterval: fundingIntervalHours, // Pure number in hours
          originalSymbol: rate.originalSymbol || rate.symbol,
          lastPrice: rate.lastPrice,
        });
      });
    });

    // Debug: Show sample of symbol map
    console.log(`[Arbitrage] Symbol map has ${symbolMap.size} unique symbols`);
    let sampleCount = 0;
    symbolMap.forEach((exchanges, symbol) => {
      if (sampleCount < 5 && exchanges.length >= 2) {
        console.log(`[Arbitrage] Sample cross-exchange symbol "${symbol}": ${exchanges.map(e => `${e.exchange}(${e.fundingRate})`).join(', ')}`);
        sampleCount++;
      }
    });

    // 5. Calculate arbitrage opportunities
    const arbitrageOpportunities: any[] = [];

    console.log(`[Arbitrage] Processing ${symbolMap.size} symbols`);

    symbolMap.forEach((exchanges, symbol) => {
      // Only analyze symbols that exist on multiple exchanges
      if (exchanges.length < 2) return;

      // Debug: Show all funding rates and prices before sorting
      // console.log(`[Arbitrage] Analyzing "${symbol}" with ${exchanges.length} exchanges:`,
      //   exchanges.map(e => `${e.exchange}=${e.fundingRate} (${e.fundingInterval}) [normalized: ${e.fundingRateNormalized.toFixed(6)}] ($${e.lastPrice})`).join(', '));

      // Calculate average price for normalization
      const avgPrice = exchanges.reduce((sum, e) => sum + parseFloat(e.lastPrice), 0) / exchanges.length;

      // Score each exchange for LONG and SHORT positions
      // LONG score: lower funding rate (more negative) + higher price = better
      // SHORT score: higher funding rate (more positive) + lower price = better
      const exchangesWithScores = exchanges.map(e => {
        const price = parseFloat(e.lastPrice);
        const priceDeviationPercent = ((price - avgPrice) / avgPrice) * 100;

        // LONG score: Funding rate weight 70%, price deviation weight 30%
        // Lower (more negative) funding = better for LONG
        // Higher price = better for LONG (entry spread profit)
        const longScore = (e.fundingRateNormalized * 0.7) + (-priceDeviationPercent * 0.003);

        // SHORT score: Funding rate weight 70%, price deviation weight 30%
        // Higher (more positive) funding = better for SHORT
        // Lower price = better for SHORT (entry spread profit)
        const shortScore = (-e.fundingRateNormalized * 0.7) + (-priceDeviationPercent * 0.003);

        return {
          ...e,
          longScore,
          shortScore,
          priceDeviationPercent,
        };
      });

      // Select bestLong: most negative funding + highest price
      const primaryExchange = exchangesWithScores.reduce((best, current) =>
        current.longScore < best.longScore ? current : best
      );

      // Select bestShort: most positive funding + lowest price
      const hedgeExchange = exchangesWithScores.reduce((best, current) =>
        current.shortScore < best.shortScore ? current : best
      );

      // console.log(`[Arbitrage] Exchange scoring for "${symbol}":`,
      //   exchangesWithScores.map(e =>
      //     `${e.exchange}: price=$${e.lastPrice} (${e.priceDeviationPercent.toFixed(2)}%), ` +
      //     `funding=${e.fundingRateNormalized.toFixed(6)}, ` +
      //     `longScore=${e.longScore.toFixed(6)}, shortScore=${e.shortScore.toFixed(6)}`
      //   ).join(' | '));
      // console.log(`[Arbitrage] Selected for "${symbol}": bestLong=${primaryExchange.exchange}, bestShort=${hedgeExchange.exchange}`);

      const primaryPrice = parseFloat(primaryExchange.lastPrice);
      const hedgePrice = parseFloat(hedgeExchange.lastPrice);

      // Spread as percentage: (hedgePrice - primaryPrice) / primaryPrice * 100
      // Positive spread means hedge exchange has higher price
      const spread = primaryPrice > 0 && !isNaN(primaryPrice) && !isNaN(hedgePrice)
        ? ((hedgePrice - primaryPrice) / primaryPrice)
        : 0;
      const spreadPercent = spread * 100;

      // Calculate absolute price difference in USDT
      const priceSpreadUsdt = hedgePrice - primaryPrice;

      // Calculate funding spread (difference between normalized rates)
      const fundingSpread = hedgeExchange.fundingRateNormalized - primaryExchange.fundingRateNormalized;
      const fundingSpreadPercent = fundingSpread * 100;

      // Log detailed spread calculation
      // console.log(`[Arbitrage] ${symbol} spread calculation:`);
      // console.log(`  - Primary exchange (${primaryExchange.exchange}): $${primaryPrice}, funding: ${primaryExchange.fundingRate} (${primaryExchange.fundingInterval}) [normalized: ${primaryExchange.fundingRateNormalized.toFixed(6)}]`);
      // console.log(`  - Hedge exchange (${hedgeExchange.exchange}): $${hedgePrice}, funding: ${hedgeExchange.fundingRate} (${hedgeExchange.fundingInterval}) [normalized: ${hedgeExchange.fundingRateNormalized.toFixed(6)}]`);
      // console.log(`  - Price spread: ${spread.toFixed(6)} (${spreadPercent.toFixed(4)}%)`);
      // console.log(`  - Price spread USDT: $${priceSpreadUsdt.toFixed(3)}`);
      // console.log(`  - Funding spread (normalized): ${fundingSpread.toFixed(6)} (${fundingSpreadPercent.toFixed(4)}% per 8h)`);
      // console.log(`  - Is opportunity: ${Math.abs(spread) > 0.0001}`);

      // Filter out unrealistic spreads (likely symbol mismatch or data errors)
      // Maximum realistic spread: 100% (1.0 in decimal)
      const MAX_REALISTIC_SPREAD = 1.0; // 100%
      const absSpread = Math.abs(spread);

      if (absSpread > MAX_REALISTIC_SPREAD) {
        console.log(`[Arbitrage] ⚠️ Filtered out ${symbol} due to unrealistic spread: ${spreadPercent.toFixed(2)}% (primary: $${primaryPrice}, hedge: $${hedgePrice})`);
        console.log(`[Arbitrage] Likely cause: Symbol mismatch or different token contracts across exchanges`);
        return; // Skip this symbol
      }

      // Additional validation: prices should be positive and reasonable
      if (primaryPrice <= 0 || hedgePrice <= 0) {
        console.log(`[Arbitrage] ⚠️ Filtered out ${symbol} due to invalid price data (primary: $${primaryPrice}, hedge: $${hedgePrice})`);
        return; // Skip this symbol
      }

      // Determine arbitrage opportunity (absolute spread > 0.01% or 0.0001 in decimal)
      const arbitrageOpportunity = Math.abs(spread) > 0.0001;

      arbitrageOpportunities.push({
        symbol,
        exchanges: exchangesWithScores,
        spread: spread.toFixed(6),
        spreadPercent: spreadPercent.toFixed(2),
        priceSpreadUsdt: priceSpreadUsdt.toFixed(3),
        // Funding spread (normalized)
        fundingSpread: fundingSpread.toFixed(6),
        fundingSpreadPercent: fundingSpreadPercent.toFixed(4),
        bestLong: {
          exchange: primaryExchange.exchange,
          symbol: primaryExchange.symbol,
          originalSymbol: primaryExchange.originalSymbol,
          fundingRate: primaryExchange.fundingRate, // Original rate
          fundingRateNormalized: primaryExchange.fundingRateNormalized, // Normalized to 8h
          nextFundingTime: primaryExchange.nextFundingTime,
          lastPrice: primaryExchange.lastPrice,
          fundingInterval: primaryExchange.fundingInterval,
          credentialId: primaryExchange.credentialId,
          // Optional fields
          volume24h: primaryExchange.volume24h,
          openInterest: primaryExchange.openInterest,
          high24h: primaryExchange.high24h,
          low24h: primaryExchange.low24h,
        },
        bestShort: {
          exchange: hedgeExchange.exchange,
          symbol: hedgeExchange.symbol,
          originalSymbol: hedgeExchange.originalSymbol,
          fundingRate: hedgeExchange.fundingRate, // Original rate
          fundingRateNormalized: hedgeExchange.fundingRateNormalized, // Normalized to 8h
          nextFundingTime: hedgeExchange.nextFundingTime,
          lastPrice: hedgeExchange.lastPrice,
          fundingInterval: hedgeExchange.fundingInterval,
          credentialId: hedgeExchange.credentialId,
          // Optional fields
          volume24h: hedgeExchange.volume24h,
          openInterest: hedgeExchange.openInterest,
          high24h: hedgeExchange.high24h,
          low24h: hedgeExchange.low24h,
        },
        arbitrageOpportunity,
      });
    });

    // Sort by FUNDING SPREAD (normalized) - this is the primary profit source in funding arbitrage
    // Secondary sort by price spread to break ties
    arbitrageOpportunities.sort((a, b) => {
      const fundingDiff = Math.abs(parseFloat(b.fundingSpread)) - Math.abs(parseFloat(a.fundingSpread));
      if (Math.abs(fundingDiff) > 0.000001) { // If funding spreads are different
        return fundingDiff;
      }
      // If funding spreads are very similar, use price spread as tiebreaker
      return Math.abs(parseFloat(b.spread)) - Math.abs(parseFloat(a.spread));
    });

    // console.log(`[Arbitrage] Found ${arbitrageOpportunities.length} symbols with cross-exchange data`);
    // console.log(`[Arbitrage] Arbitrage opportunities: ${arbitrageOpportunities.filter(o => o.arbitrageOpportunity).length}`);

    // 6. Fetch market cap data from CoinGecko
    // console.log('[Arbitrage] Fetching market cap data from CoinGecko...');
    const symbols = arbitrageOpportunities.map(o => o.symbol);
    const marketCaps = await CoinGeckoService.getMarketCaps(symbols);

    // Add market cap to each opportunity
    arbitrageOpportunities.forEach(opportunity => {
      opportunity.marketCap = marketCaps.get(opportunity.symbol) || 0;
    });

    console.log(`[Arbitrage] Added market cap data to ${arbitrageOpportunities.length} opportunities`);

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: arbitrageOpportunities,
        stats: {
          totalSymbols: arbitrageOpportunities.length,
          arbitrageOpportunities: arbitrageOpportunities.filter(o => o.arbitrageOpportunity).length,
          exchangesAnalyzed: validResults.length,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Arbitrage] Error analyzing funding rates:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze arbitrage opportunities',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
