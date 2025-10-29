import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { BingXService } from '@/lib/bingx';
import { MEXCService } from '@/lib/mexc';
import { AuthService } from '@/lib/auth';
import { PriceArbitrageOpportunity } from '@/types/price-arbitrage';
import { calculateRealisticROI, calculateOpportunityConfidence, calculateFundingDifferentialMetrics } from '@/lib/metrics-calculator';

/**
 * Get default funding interval for an exchange
 * Most exchanges use 8h intervals (3 times per day)
 */
function getDefaultFundingInterval(exchange: string): string {
  const intervals: Record<string, string> = {
    'BINANCE': '8h',
    'BYBIT': '8h',
    'BINGX': '8h',
    'OKX': '8h',
    'GATEIO': '8h',
    'MEXC': '8h',
  };
  return intervals[exchange.toUpperCase()] || '8h';
}

/**
 * Normalize funding rate to 8-hour interval for fair comparison
 *
 * @param fundingRate - Original funding rate as decimal (e.g., 0.0001)
 * @param fundingInterval - Funding interval (e.g., "8h", "4h", "1h")
 * @returns Normalized funding rate to 8h interval as decimal
 */
function normalizeFundingRateTo8h(fundingRate: number, fundingInterval: string): number {
  // Normalization multipliers to convert to 8h interval
  const multipliers: Record<string, number> = {
    '1h': 8,   // 8 hourly payments = 1 eight-hour period
    '4h': 2,   // 2 four-hour payments = 1 eight-hour period
    '8h': 1,   // Already 8h interval
  };

  const multiplier = multipliers[fundingInterval] || 1;
  return fundingRate * multiplier;
}

/**
 * GET /api/arbitrage/opportunities
 *
 * Fetches current prices from all active exchange credentials and identifies price arbitrage opportunities.
 * Returns trading pairs with price differences across exchanges, sorted by spread percentage.
 *
 * Price Arbitrage Strategy:
 * - PRIMARY exchange = exchange with HIGHER price (open SHORT position)
 * - HEDGE exchange = exchange with LOWER price (open LONG position)
 * - Profit when prices converge (spread narrows)
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - minSpread: Minimum spread percentage to show (default: 0.01, i.e., 0.01%)
 * - symbol: Filter by specific symbol (optional)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "BTCUSDT",
 *       "primaryExchange": {
 *         "name": "BYBIT",
 *         "credentialId": "xxx",
 *         "price": 50100,
 *         "environment": "MAINNET"
 *       },
 *       "hedgeExchange": {
 *         "name": "BINGX",
 *         "credentialId": "yyy",
 *         "price": 50000,
 *         "environment": "MAINNET"
 *       },
 *       "spread": 0.002,        // Decimal (0.2%)
 *       "spreadPercent": 0.2,   // Percentage
 *       "arbitrageOpportunity": true,
 *       "allExchanges": [...]
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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const minSpreadParam = searchParams.get('minSpread');
    const symbolFilter = searchParams.get('symbol');

    const minSpread = minSpreadParam ? parseFloat(minSpreadParam) : 0.01; // Default: 0.01%

    console.log(`[PriceOpportunities] Loading opportunities for user: ${userId}, minSpread: ${minSpread}%`);

    // 3. Load all active exchange credentials with decryption
    const { EncryptionService } = await import('@/lib/encryption');
    const prismaModule = await import('@/lib/prisma');
    const prisma = prismaModule.default;

    const dbCredentials = await prisma.exchangeCredentials.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    console.log(`[PriceOpportunities] Found ${dbCredentials.length} active credentials`);

    if (dbCredentials.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient credentials',
          message: 'You need at least 2 active exchange credentials to find arbitrage opportunities.',
          code: 'INSUFFICIENT_CREDENTIALS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Decrypt credentials
    const validActiveCredentials = dbCredentials
      .map((cred) => {
        try {
          return {
            id: cred.id,
            exchange: cred.exchange,
            environment: cred.environment,
            apiKey: EncryptionService.decrypt(cred.apiKey),
            apiSecret: EncryptionService.decrypt(cred.apiSecret),
            authToken: cred.authToken ? EncryptionService.decrypt(cred.authToken) : undefined,
          };
        } catch (error: any) {
          console.error(`[PriceOpportunities] Error decrypting ${cred.exchange}:`, error.message);
          return null;
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    console.log(`[PriceOpportunities] Valid credentials: ${validActiveCredentials.length}`);

    // 4. Fetch current prices from all exchanges
    const nonMexcCredentials = validActiveCredentials.filter((c) => c.exchange !== 'MEXC');
    const mexcCredentials = validActiveCredentials.filter((c) => c.exchange === 'MEXC');

    // Fetch non-MEXC exchanges first
    const nonMexcFetchPromises = nonMexcCredentials.map(async (credential) => {
      try {
        console.log(`[PriceOpportunities] Fetching prices from ${credential.exchange}`);

        if (credential.exchange === 'BYBIT') {
          const bybitService = new BybitService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            testnet: credential.environment === 'TESTNET',
            enableRateLimit: true,
            userId,
          });

          const tickers = await bybitService.getTicker('linear');
          return {
            credentialId: credential.id,
            exchange: credential.exchange,
            environment: credential.environment,
            prices: tickers.map((t) => ({
              symbol: t.symbol,
              price: parseFloat(t.lastPrice),
            })),
          };
        } else if (credential.exchange === 'BINGX') {
          const bingxService = new BingXService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            testnet: credential.environment === 'TESTNET',
            enableRateLimit: true,
          });

          await bingxService.syncTime();
          const rates = await bingxService.getAllFundingRates();
          return {
            credentialId: credential.id,
            exchange: credential.exchange,
            environment: credential.environment,
            prices: rates.map((r) => ({
              symbol: r.symbol.replace(/-/g, ''), // BTC-USDT -> BTCUSDT
              price: parseFloat(r.markPrice || '0'),
            })),
          };
        }

        return null;
      } catch (error: any) {
        console.error(`[PriceOpportunities] Failed to fetch from ${credential.exchange}:`, error.message);
        return null;
      }
    });

    const nonMexcResults = await Promise.all(nonMexcFetchPromises);
    const validNonMexcResults = nonMexcResults.filter((r) => r !== null);

    // Build symbol list from non-MEXC exchanges
    const uniqueSymbols = new Set<string>();
    validNonMexcResults.forEach((result) => {
      if (result) {
        result.prices.forEach((p) => uniqueSymbols.add(p.symbol));
      }
    });

    console.log(`[PriceOpportunities] Found ${uniqueSymbols.size} unique symbols from non-MEXC exchanges`);

    // Fetch MEXC prices for symbols that exist on other exchanges
    const mexcFetchPromises = mexcCredentials.map(async (credential) => {
      try {
        console.log(`[PriceOpportunities] Fetching prices from ${credential.exchange}`);

        const mexcService = new MEXCService({
          apiKey: credential.apiKey,
          apiSecret: credential.apiSecret,
          authToken: credential.authToken,
          testnet: credential.environment === 'TESTNET',
          enableRateLimit: true,
        });

        const mexcSymbols = Array.from(uniqueSymbols).map((sym) =>
          sym.replace(/^(.+)(USDT|USDC|USD)$/, '$1_$2')
        );

        const rates = await mexcService.getFundingRatesForSymbols(mexcSymbols);
        return {
          credentialId: credential.id,
          exchange: credential.exchange,
          environment: credential.environment,
          prices: rates.map((r) => ({
            symbol: r.symbol.replace(/_/g, ''), // BTC_USDT -> BTCUSDT
            price: parseFloat(r.lastPrice?.toString() || '0'),
          })),
        };
      } catch (error: any) {
        console.error(`[PriceOpportunities] Failed to fetch from ${credential.exchange}:`, error.message);
        return null;
      }
    });

    const mexcResults = await Promise.all(mexcFetchPromises);
    const validMexcResults = mexcResults.filter((r) => r !== null);

    // Combine all results
    const validResults = [...validNonMexcResults, ...validMexcResults];

    console.log(`[PriceOpportunities] Successfully fetched from ${validResults.length} exchanges`);

    // 5. Organize prices by symbol
    const symbolMap: Map<
      string,
      Array<{
        exchange: string;
        credentialId: string;
        price: number;
        environment: string;
      }>
    > = new Map();

    validResults.forEach((result) => {
      if (!result) return;

      result.prices.forEach((priceData) => {
        if (!priceData.price || priceData.price <= 0) return;

        if (!symbolMap.has(priceData.symbol)) {
          symbolMap.set(priceData.symbol, []);
        }

        symbolMap.get(priceData.symbol)!.push({
          exchange: result.exchange,
          credentialId: result.credentialId,
          price: priceData.price,
          environment: result.environment,
        });
      });
    });

    // 6. Fetch funding rates for all exchanges and symbols
    // Map<exchange, Map<symbol, {rate: number, interval: string}>>
    const fundingRateMap: Map<string, Map<string, {rate: number, interval: string}>> = new Map();
    console.log(`[PriceOpportunities] Fetching funding rates...`);

    for (const result of validResults) {
      if (!result) continue;

      try {
        if (result.exchange === 'BYBIT') {
          const credential = validActiveCredentials.find(c => c.id === result.credentialId);
          if (!credential) continue;

          const bybitService = new BybitService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            testnet: credential.environment === 'TESTNET',
            enableRateLimit: true,
            userId,
          });

          const tickers = await bybitService.getTicker('linear');
          const symbolFundingMap = new Map<string, {rate: number, interval: string}>();
          const fundingInterval = getDefaultFundingInterval(result.exchange);

          tickers.forEach((t) => {
            if (t.fundingRate) {
              const fundingRateDecimal = parseFloat(t.fundingRate); // Keep as decimal for normalization
              const fundingRatePercent = fundingRateDecimal * 100; // Convert to percentage
              symbolFundingMap.set(t.symbol, { rate: fundingRatePercent, interval: fundingInterval });
            }
          });

          fundingRateMap.set(result.exchange, symbolFundingMap);
          console.log(`[PriceOpportunities] Fetched ${symbolFundingMap.size} funding rates from BYBIT (${fundingInterval})`);

        } else if (result.exchange === 'BINGX') {
          const credential = validActiveCredentials.find(c => c.id === result.credentialId);
          if (!credential) continue;

          const bingxService = new BingXService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            testnet: credential.environment === 'TESTNET',
            enableRateLimit: true,
          });

          await bingxService.syncTime();
          const rates = await bingxService.getAllFundingRates();
          const symbolFundingMap = new Map<string, {rate: number, interval: string}>();
          const fundingInterval = getDefaultFundingInterval(result.exchange);

          rates.forEach((r) => {
            if (r.fundingRate) {
              const fundingRateDecimal = parseFloat(r.fundingRate); // Keep as decimal for normalization
              const fundingRatePercent = fundingRateDecimal * 100; // Convert to percentage
              const normalizedSymbol = r.symbol.replace(/-/g, ''); // BTC-USDT -> BTCUSDT
              symbolFundingMap.set(normalizedSymbol, { rate: fundingRatePercent, interval: fundingInterval });
            }
          });

          fundingRateMap.set(result.exchange, symbolFundingMap);
          console.log(`[PriceOpportunities] Fetched ${symbolFundingMap.size} funding rates from BINGX (${fundingInterval})`);
        }
      } catch (error: any) {
        console.error(`[PriceOpportunities] Error fetching funding rates from ${result.exchange}:`, error.message);
      }
    }

    // 7. Calculate arbitrage opportunities with combined metrics
    const opportunities: PriceArbitrageOpportunity[] = [];

    for (const [symbol, exchanges] of symbolMap.entries()) {
      // Only analyze symbols with at least 2 exchanges
      if (exchanges.length < 2) continue;

      // Apply symbol filter if specified
      if (symbolFilter && symbol !== symbolFilter) continue;

      // Sort by price (lowest to highest) and add funding intervals
      const sortedExchanges = [...exchanges].map(ex => {
        const fundingMap = fundingRateMap.get(ex.exchange);
        const fundingData = fundingMap?.get(symbol);
        return {
          ...ex,
          fundingInterval: fundingData?.interval
        };
      }).sort((a, b) => a.price - b.price);

      const lowestPrice = sortedExchanges[0].price;
      const highestPrice = sortedExchanges[sortedExchanges.length - 1].price;

      // Calculate spread: (maxPrice - minPrice) / minPrice
      const spread = (highestPrice - lowestPrice) / lowestPrice;
      const spreadPercent = spread * 100;

      // Check if spread meets minimum threshold
      const arbitrageOpportunity = spreadPercent >= minSpread;

      if (!arbitrageOpportunity) continue;

      // Get funding rates for primary and hedge exchanges
      const primaryExchangeName = sortedExchanges[sortedExchanges.length - 1].exchange;
      const hedgeExchangeName = sortedExchanges[0].exchange;

      const primaryFundingMap = fundingRateMap.get(primaryExchangeName);
      const hedgeFundingMap = fundingRateMap.get(hedgeExchangeName);

      const primaryFundingData = primaryFundingMap?.get(symbol);
      const hedgeFundingData = hedgeFundingMap?.get(symbol);

      // Extract rates for display (original rates in %)
      const primaryFundingRate = primaryFundingData?.rate;
      const hedgeFundingRate = hedgeFundingData?.rate;
      const primaryFundingInterval = primaryFundingData?.interval;
      const hedgeFundingInterval = hedgeFundingData?.interval;

      // Calculate funding differential (if both funding rates available)
      let fundingDifferential: number | undefined;
      let combinedScore: number | undefined;
      let expectedDailyReturn: number | undefined;
      let estimatedMonthlyROI: number | undefined;
      let realisticMetricsData: any = undefined;
      let strategyType: 'price_only' | 'funding_only' | 'combined' = 'price_only';

      if (primaryFundingData && hedgeFundingData) {
        // PRIMARY (higher price) = SHORT = we RECEIVE funding if positive, PAY if negative
        // HEDGE (lower price) = LONG = we PAY funding if positive, RECEIVE if negative

        // CRITICAL: Normalize funding rates to 8h interval before calculating differential
        // Example: GATEIO -1.587% per 1h → -1.587% × 8 = -12.696% per 8h
        //          BINGX 0.0152% per 8h → 0.0152% × 1 = 0.0152% per 8h
        const primaryNormalized = normalizeFundingRateTo8h(
          primaryFundingData.rate / 100, // Convert % to decimal
          primaryFundingData.interval
        ) * 100; // Convert back to %

        const hedgeNormalized = normalizeFundingRateTo8h(
          hedgeFundingData.rate / 100, // Convert % to decimal
          hedgeFundingData.interval
        ) * 100; // Convert back to %

        console.log(`[PriceOpportunities] ${symbol} funding normalization:`);
        console.log(`  Primary (${primaryExchangeName}): ${primaryFundingData.rate.toFixed(4)}% (${primaryFundingData.interval}) → ${primaryNormalized.toFixed(4)}% (8h)`);
        console.log(`  Hedge (${hedgeExchangeName}): ${hedgeFundingData.rate.toFixed(4)}% (${hedgeFundingData.interval}) → ${hedgeNormalized.toFixed(4)}% (8h)`);

        // Net funding = what we receive on SHORT - what we pay on LONG (using normalized rates)
        // If PRIMARY funding is +0.01% and HEDGE funding is +0.01%, we pay 0 net (both cancel)
        // If PRIMARY funding is +0.05% and HEDGE funding is +0.01%, we receive +0.04% net
        fundingDifferential = primaryNormalized - hedgeNormalized;
        console.log(`  Funding differential (normalized): ${fundingDifferential.toFixed(4)}%`);

        // Calculate realistic ROI based on historical data
        const primaryExchangeEnum = primaryExchangeName as any; // Convert string to Exchange enum
        const hedgeExchangeEnum = hedgeExchangeName as any;

        const realisticMetrics = await calculateRealisticROI(
          primaryExchangeEnum,
          hedgeExchangeEnum,
          symbol,
          spreadPercent,
          7 // 7 days historical data
        );

        // Also get funding differential metrics for data quality info
        const fundingMetrics = await calculateFundingDifferentialMetrics(
          primaryExchangeEnum,
          hedgeExchangeEnum,
          symbol,
          7
        );

        if (realisticMetrics) {
          // Use realistic calculations based on historical data
          expectedDailyReturn = realisticMetrics.expectedDailyReturn.realistic;
          estimatedMonthlyROI = realisticMetrics.expectedMonthlyROI.realistic;
          combinedScore = spreadPercent + (realisticMetrics.expectedDailyReturn.realistic * 7);

          // Prepare realistic metrics object for response
          realisticMetricsData = {
            dailyReturn: {
              pessimistic: realisticMetrics.expectedDailyReturn.pessimistic,
              realistic: realisticMetrics.expectedDailyReturn.realistic,
              optimistic: realisticMetrics.expectedDailyReturn.optimistic,
            },
            monthlyROI: {
              pessimistic: realisticMetrics.expectedMonthlyROI.pessimistic,
              realistic: realisticMetrics.expectedMonthlyROI.realistic,
              optimistic: realisticMetrics.expectedMonthlyROI.optimistic,
            },
            confidence: realisticMetrics.confidence,
            dataPoints: fundingMetrics?.dataPoints,
            historicalPeriodDays: 7,
          };
        } else {
          // Fallback to simple calculation if no historical data
          const dailyFundingReturn = fundingDifferential * 3; // 3 funding periods per day
          expectedDailyReturn = spreadPercent + dailyFundingReturn;
          estimatedMonthlyROI = spreadPercent + (dailyFundingReturn * 30);
          combinedScore = spreadPercent + (dailyFundingReturn * 7);
        }

        strategyType = 'combined';
      }

      opportunities.push({
        symbol,
        primaryExchange: {
          name: primaryExchangeName,
          credentialId: sortedExchanges[sortedExchanges.length - 1].credentialId,
          price: highestPrice,
          environment: sortedExchanges[sortedExchanges.length - 1].environment,
        },
        hedgeExchange: {
          name: hedgeExchangeName,
          credentialId: sortedExchanges[0].credentialId,
          price: lowestPrice,
          environment: sortedExchanges[0].environment,
        },
        spread,
        spreadPercent,
        arbitrageOpportunity,
        allExchanges: sortedExchanges,
        primaryFundingRate,
        hedgeFundingRate,
        primaryFundingInterval,
        hedgeFundingInterval,
        fundingDifferential,
        combinedScore,
        expectedDailyReturn,
        estimatedMonthlyROI,
        realisticMetrics: realisticMetricsData,
        strategyType,
      });
    }

    // Sort by combined score (if available), otherwise by spread (highest first)
    opportunities.sort((a, b) => {
      const scoreA = a.combinedScore !== undefined ? a.combinedScore : a.spreadPercent;
      const scoreB = b.combinedScore !== undefined ? b.combinedScore : b.spreadPercent;
      return scoreB - scoreA;
    });

    console.log(`[PriceOpportunities] Found ${opportunities.length} opportunities with spread >= ${minSpread}%`);

    // Calculate stats
    const combinedOpportunities = opportunities.filter(o => o.strategyType === 'combined').length;
    const priceOnlyOpportunities = opportunities.filter(o => o.strategyType === 'price_only').length;

    console.log(`[PriceOpportunities] Strategy breakdown: ${combinedOpportunities} combined, ${priceOnlyOpportunities} price-only`);

    // 8. Return response
    return NextResponse.json(
      {
        success: true,
        data: opportunities,
        stats: {
          totalOpportunities: opportunities.length,
          combinedStrategy: opportunities.filter(o => o.strategyType === 'combined').length,
          priceOnly: opportunities.filter(o => o.strategyType === 'price_only').length,
          minSpread: minSpread,
          exchangesAnalyzed: validResults.length,
          fundingDataAvailable: fundingRateMap.size > 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PriceOpportunities] Error fetching opportunities:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch arbitrage opportunities',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
