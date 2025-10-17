import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { BingXService } from '@/lib/bingx';
import { MEXCService } from '@/lib/mexc';
import { AuthService } from '@/lib/auth';
import { CoinGeckoService } from '@/lib/coingecko';
import { CCXTService } from '@/lib/ccxt-service';
// CCXT migration for funding rates API

/**
 * Fetch funding rates from an exchange using CCXT with fallback to legacy services
 * @param credential - Exchange credential
 * @param userId - User ID for logging
 * @returns Exchange funding rates or null on failure
 */
async function fetchExchangeFundingRates(
  credential: any,
  userId: string
): Promise<{
  credentialId: string;
  exchange: string;
  environment: string;
  rates: Array<{
    symbol: string;
    originalSymbol?: string;
    fundingRate: string;
    nextFundingTime: number;
    lastPrice: string;
  }>;
} | null> {
  const exchangeUpper = credential.exchange.toUpperCase();

  console.log(`[Arbitrage] Fetching funding rates for ${exchangeUpper} (${credential.environment})`);
  console.log(`[Arbitrage] Credential details - ID: ${credential.id}, hasApiKey: ${!!credential.apiKey}, hasApiSecret: ${!!credential.apiSecret}`);

  // Try CCXT first for all exchanges
  try {
    console.log(`[Arbitrage] ${exchangeUpper} - Attempting CCXT fetch`);

    const ccxtService = new CCXTService(credential.exchange.toLowerCase(), {
      apiKey: credential.apiKey,
      apiSecret: credential.apiSecret,
      testnet: credential.environment === 'TESTNET',
      enableRateLimit: true,
    });

    await ccxtService.loadMarkets();
    const fundingRates = await ccxtService.getAllFundingRates();

    console.log(`[Arbitrage] ${exchangeUpper} CCXT - Successfully fetched ${fundingRates.length} funding rates`);

    return {
      credentialId: credential.id,
      exchange: credential.exchange,
      environment: credential.environment,
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
        };
      })
    };
  } catch (ccxtError: any) {
    console.error(`[Arbitrage] ${exchangeUpper} CCXT fetch failed:`, ccxtError.message);
    console.log(`[Arbitrage] ${exchangeUpper} - Falling back to legacy service`);

    // Fallback to legacy services
    try {
      if (exchangeUpper === 'BYBIT') {
        const bybitService = new BybitService({
          apiKey: credential.apiKey,
          apiSecret: credential.apiSecret,
          testnet: credential.environment === 'TESTNET',
          enableRateLimit: true,
          userId,
        });

        const tickers = await bybitService.getTicker('linear');
        console.log(`[Arbitrage] ${exchangeUpper} legacy - Successfully fetched ${tickers.length} tickers`);

        return {
          credentialId: credential.id,
          exchange: credential.exchange,
          environment: credential.environment,
          rates: tickers.map(t => ({
            symbol: t.symbol,
            fundingRate: t.fundingRate,
            nextFundingTime: t.nextFundingTime,
            lastPrice: t.lastPrice,
          }))
        };
      } else if (exchangeUpper === 'BINGX') {
        const bingxService = new BingXService({
          apiKey: credential.apiKey,
          apiSecret: credential.apiSecret,
          testnet: credential.environment === 'TESTNET',
          enableRateLimit: true,
        });

        // Sync time with BingX server before making requests
        await bingxService.syncTime();

        const rates = await bingxService.getAllFundingRates();
        console.log(`[Arbitrage] ${exchangeUpper} legacy - Successfully fetched ${rates.length} funding rates`);

        return {
          credentialId: credential.id,
          exchange: credential.exchange,
          environment: credential.environment,
          rates: rates.map(r => ({
            symbol: r.symbol.replace(/-/g, ''), // Normalize symbol format (BTC-USDT -> BTCUSDT)
            originalSymbol: r.symbol, // Keep original for reference
            fundingRate: r.fundingRate,
            nextFundingTime: r.fundingTime,
            lastPrice: r.markPrice || '0', // Use mark price as last price
          }))
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
 * Determine funding interval based on exchange and next funding time
 * @param exchange - Exchange name (BYBIT, BINGX, MEXC, etc.)
 * @param nextFundingTime - Next funding time timestamp
 * @returns Funding interval string (e.g., "8h", "4h", "1h")
 */
function determineFundingInterval(exchange: string, nextFundingTime: number): string {
  // Default intervals for each exchange
  const defaultIntervals: Record<string, string> = {
    'BYBIT': '8h',
    'BINGX': '8h',
    'MEXC': '8h',
    'OKX': '8h',
  };

  // If we have a default for this exchange, return it
  if (defaultIntervals[exchange]) {
    return defaultIntervals[exchange];
  }

  // Otherwise, try to determine from the next funding time
  const fundingDate = new Date(nextFundingTime);
  const fundingHour = fundingDate.getUTCHours();

  // Check if funding time aligns with 8h intervals (00:00, 08:00, 16:00 UTC)
  if (fundingHour % 8 === 0) {
    return '8h';
  }
  // Check if funding time aligns with 4h intervals
  else if (fundingHour % 4 === 0) {
    return '4h';
  }
  // Assume 1h if no pattern matches
  else {
    return '1h';
  }
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
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
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
      .map((cred) => {
        try {
          console.log(`[Arbitrage] Decrypting ${cred.exchange} credential ID: ${cred.id}`);

          const apiKey = EncryptionService.decrypt(cred.apiKey);
          const apiSecret = EncryptionService.decrypt(cred.apiSecret);
          const authToken = cred.authToken ? EncryptionService.decrypt(cred.authToken) : undefined;

          console.log(`[Arbitrage] Decrypted ${cred.exchange}: hasApiKey=${!!apiKey}, apiKeyLength=${apiKey?.length}, hasApiSecret=${!!apiSecret}, apiSecretLength=${apiSecret?.length}, hasAuthToken=${!!authToken}`);

          return {
            id: cred.id,
            exchange: cred.exchange,
            environment: cred.environment,
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
      .filter((c): c is NonNullable<typeof c> => c !== null);

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
    const nonMexcCredentials = validActiveCredentials.filter(c => c.exchange !== 'MEXC');
    const mexcCredentials = validActiveCredentials.filter(c => c.exchange === 'MEXC');

    // Use the new helper function with CCXT + fallback
    const nonMexcFetchPromises = nonMexcCredentials.map(credential =>
      fetchExchangeFundingRates(credential, userId)
    );

    const nonMexcResults = await Promise.all(nonMexcFetchPromises);
    const validNonMexcResults = nonMexcResults.filter(r => r !== null);

    // Step 2: Build unique symbol list from non-MEXC exchanges
    const uniqueSymbols = new Set<string>();
    validNonMexcResults.forEach(result => {
      if (result) {
        result.rates.forEach(rate => uniqueSymbols.add(rate.symbol));
      }
    });

    console.log(`[Arbitrage] Found ${uniqueSymbols.size} unique symbols from non-MEXC exchanges`);

    // Step 3: Fetch MEXC funding rates only for symbols that exist on other exchanges
    const mexcFetchPromises = mexcCredentials.map(async (credential) => {
      try {
        console.log(`[Arbitrage] Fetching funding rates for MEXC (${credential.environment})`);
        console.log(`[Arbitrage] Credential details - ID: ${credential.id}, hasApiKey: ${!!credential.apiKey}, hasApiSecret: ${!!credential.apiSecret}`);

        // Try CCXT first for MEXC
        try {
          console.log(`[Arbitrage] MEXC - Attempting CCXT fetch`);

          const ccxtService = new CCXTService('mexc', {
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            testnet: credential.environment === 'TESTNET',
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
            environment: credential.environment,
            rates: filteredRates.map(r => {
              let normalizedSymbol = r.symbol.replace(/[\/\-_]/g, '');
              normalizedSymbol = normalizedSymbol.replace(/:.*$/, ''); // Remove colon and everything after
              return {
                symbol: normalizedSymbol,
                originalSymbol: r.symbol,
                fundingRate: r.fundingRate,
                nextFundingTime: r.nextFundingTime,
                lastPrice: r.markPrice,
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
            testnet: credential.environment === 'TESTNET',
            enableRateLimit: true,
          });

          // Convert normalized symbols to MEXC format (BTCUSDT -> BTC_USDT)
          const mexcSymbols = Array.from(uniqueSymbols).map(sym => {
            // Insert underscore before USDT/USDC suffix
            return sym.replace(/^(.+)(USDT|USDC|USD)$/, '$1_$2');
          });

          console.log(`[Arbitrage] MEXC legacy - Fetching tickers and funding rates for ${mexcSymbols.length} symbols`);

          // First, get all tickers for lastPrice data
          const allTickers = await mexcService.getTickers();
          const tickerMap = new Map(allTickers.map(t => [t.symbol, t]));

          // Use optimized batch method to avoid rate limiting
          console.log(`[Arbitrage] MEXC - Using getFundingRatesForSymbols() for ${mexcSymbols.length} symbols`);
          const rates = await mexcService.getFundingRatesForSymbols(mexcSymbols);

          console.log(`[Arbitrage] MEXC legacy - Successfully fetched ${rates.length}/${mexcSymbols.length} funding rates`);

          return {
            credentialId: credential.id,
            exchange: credential.exchange,
            environment: credential.environment,
            rates: rates.map(r => ({
              symbol: r.symbol.replace(/_/g, ''), // Normalize symbol format (BTC_USDT -> BTCUSDT)
              originalSymbol: r.symbol, // Keep original for reference
              fundingRate: r.fundingRate.toString(),
              nextFundingTime: r.nextSettleTime,
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

        // Determine funding interval based on exchange and next funding time
        const fundingInterval = determineFundingInterval(result.exchange, rate.nextFundingTime);

        symbolMap.get(rate.symbol)!.push({
          exchange: result.exchange,
          credentialId: result.credentialId,
          environment: result.environment,
          fundingRate: rate.fundingRate,
          nextFundingTime: rate.nextFundingTime,
          fundingInterval,
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
      console.log(`[Arbitrage] Analyzing "${symbol}" with ${exchanges.length} exchanges:`,
        exchanges.map(e => `${e.exchange}=${e.fundingRate} ($${e.lastPrice})`).join(', '));

      // Sort by FUNDING RATE for funding arbitrage
      // Primary (Long): lowest funding rate (most negative) - we receive more funding
      // Hedge (Short): highest funding rate (most positive/least negative) - we pay less funding
      const sortedExchanges = [...exchanges].sort((a, b) =>
        parseFloat(a.fundingRate) - parseFloat(b.fundingRate)
      );

      // Calculate funding spread between primary (bestLong) and hedge (bestShort) exchanges
      // bestLong = lowest funding rate (primary exchange - LONG position receives funding)
      // bestShort = highest funding rate (hedge exchange - SHORT position pays less)
      const primaryExchange = sortedExchanges[0]; // Lowest (most negative) funding rate
      const hedgeExchange = sortedExchanges[sortedExchanges.length - 1]; // Highest (least negative/most positive) funding rate

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

      // Log detailed spread calculation
      console.log(`[Arbitrage] ${symbol} spread calculation:`);
      console.log(`  - Primary exchange (${primaryExchange.exchange}): $${primaryPrice}`);
      console.log(`  - Hedge exchange (${hedgeExchange.exchange}): $${hedgePrice}`);
      console.log(`  - Price spread: ${spread.toFixed(6)} (${spreadPercent.toFixed(4)}%)`);
      console.log(`  - Price spread USDT: $${priceSpreadUsdt.toFixed(3)}`);
      console.log(`  - Is opportunity: ${Math.abs(spread) > 0.0001}`);

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
        exchanges: sortedExchanges,
        spread: spread.toFixed(6),
        spreadPercent: spreadPercent.toFixed(2),
        priceSpreadUsdt: priceSpreadUsdt.toFixed(3),
        bestLong: {
          exchange: sortedExchanges[0].exchange,
          credentialId: sortedExchanges[0].credentialId,
          fundingRate: sortedExchanges[0].fundingRate,
          environment: sortedExchanges[0].environment,
        },
        bestShort: {
          exchange: sortedExchanges[sortedExchanges.length - 1].exchange,
          credentialId: sortedExchanges[sortedExchanges.length - 1].credentialId,
          fundingRate: sortedExchanges[sortedExchanges.length - 1].fundingRate,
          environment: sortedExchanges[sortedExchanges.length - 1].environment,
        },
        arbitrageOpportunity,
      });
    });

    // Sort by absolute spread (highest first)
    arbitrageOpportunities.sort((a, b) => Math.abs(parseFloat(b.spread)) - Math.abs(parseFloat(a.spread)));

    console.log(`[Arbitrage] Found ${arbitrageOpportunities.length} symbols with cross-exchange data`);
    console.log(`[Arbitrage] Arbitrage opportunities: ${arbitrageOpportunities.filter(o => o.arbitrageOpportunity).length}`);

    // 6. Fetch market cap data from CoinGecko
    console.log('[Arbitrage] Fetching market cap data from CoinGecko...');
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
