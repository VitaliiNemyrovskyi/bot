import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { PriceArbitrageOpportunity } from '@/types/price-arbitrage';
import { calculateRealisticROI, calculateFundingDifferentialMetrics } from '@/lib/metrics-calculator';
import { BybitService } from '@/lib/bybit';
import { BingXService } from '@/lib/bingx';
import { MEXCService } from '@/lib/mexc';
import { Exchange } from '@prisma/client';

/**
 * Normalized price data interface
 */
interface NormalizedPrice {
  symbol: string;  // Normalized format: BTCUSDT (no separators)
  price: number;   // Current price
}

/**
 * Normalize symbol to standard format (remove all separators and suffixes)
 */
function normalizeSymbol(symbol: string): string {
  // Remove separators: BTC-USDT, BTC/USDT, BTC/USDT:USDT -> BTCUSDT
  let normalized = symbol.replace(/[-_/:]/g, '');

  // Remove common suffixes: SWAP, PERP, PERPETUAL, etc.
  normalized = normalized.replace(/(SWAP|PERP|PERPETUAL|FUTURES?)$/i, '');

  return normalized; // Final: BTCUSDTSWAP -> BTCUSDT
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
      .map((cred: typeof dbCredentials[number]) => {
        try {
          return {
            id: cred.id,
            exchange: cred.exchange,
            apiKey: EncryptionService.decrypt(cred.apiKey),
            apiSecret: EncryptionService.decrypt(cred.apiSecret),
            authToken: cred.authToken ? EncryptionService.decrypt(cred.authToken) : undefined,
          };
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`[PriceOpportunities] Error decrypting ${cred.exchange}:`, errorMessage);
          return null;
        }
      })
      .filter((c: ReturnType<typeof dbCredentials['map']>[number]): c is NonNullable<typeof c> => c !== null);

    console.log(`[PriceOpportunities] Valid credentials: ${validActiveCredentials.length}`);

    // Define the type for credentials (non-null)
    type Credential = NonNullable<typeof validActiveCredentials[number]>;

    // 4. Fetch current prices from all exchanges
    const nonMexcCredentials = validActiveCredentials.filter((c): c is Credential => c !== null && c.exchange !== 'MEXC');
    const mexcCredentials = validActiveCredentials.filter((c): c is Credential => c !== null && c.exchange === 'MEXC');

    // Fetch non-MEXC exchanges first
    const nonMexcFetchPromises = nonMexcCredentials.map(async (credential: Credential) => {
      try {
        console.log(`[PriceOpportunities] Fetching prices from ${credential.exchange}`);

        let normalizedPrices: NormalizedPrice[] = [];

        if (credential.exchange === 'BYBIT') {
          const bybitService = new BybitService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            enableRateLimit: true,
            userId,
          });

          const tickers = await bybitService.getTicker('linear');
          normalizedPrices = tickers.map((t) => ({
            symbol: normalizeSymbol(t.symbol),
            price: parseFloat(t.lastPrice),
          }));

        } else if (credential.exchange === 'BINGX') {
          const bingxService = new BingXService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            enableRateLimit: true,
          });

          await bingxService.syncTime();
          const rates = await bingxService.getAllFundingRates();
          normalizedPrices = rates.map((r) => ({
            symbol: normalizeSymbol(r.symbol),
            price: parseFloat(r.markPrice || '0'),
          })).filter(p => p.price > 0);

        } else {
          // Universal handler for other exchanges (OKX, GATEIO, BINANCE, BITGET, KUCOIN, etc.) via CCXT
          const ccxt = await import('ccxt');
          let exchange: any;

          const exchangeName = credential.exchange.toLowerCase();

          if (exchangeName === 'okx') {
            exchange = new ccxt.okx({
              apiKey: credential.apiKey,
              secret: credential.apiSecret,
              password: credential.authToken || undefined,
              enableRateLimit: true,
            });
          } else if (exchangeName === 'gateio') {
            exchange = new ccxt.gateio({
              apiKey: credential.apiKey,
              secret: credential.apiSecret,
              enableRateLimit: true,
            });
          } else if (exchangeName === 'binance') {
            exchange = new ccxt.binance({
              apiKey: credential.apiKey,
              secret: credential.apiSecret,
              enableRateLimit: true,
              options: { defaultType: 'future' },
            });
          } else if (exchangeName === 'bitget') {
            exchange = new ccxt.bitget({
              apiKey: credential.apiKey,
              secret: credential.apiSecret,
              password: credential.authToken || undefined,
              enableRateLimit: true,
            });
          } else if (exchangeName === 'kucoin') {
            exchange = new ccxt.kucoinfutures({
              apiKey: credential.apiKey,
              secret: credential.apiSecret,
              password: credential.authToken || undefined,
              enableRateLimit: true,
            });
          } else {
            console.warn(`[PriceOpportunities] No handler for exchange: ${credential.exchange}`);
            return null;
          }

          // Fetch tickers for futures/swap markets
          const markets = await exchange.loadMarkets();
          const usdtSwapSymbols = Object.keys(markets).filter((symbol: string) => {
            const market = markets[symbol];
            // Different exchanges use different properties
            const isSwap = market.swap || market.type === 'swap' || market.type === 'future';
            const isUSDTSettled = market.settle === 'USDT' || market.quote === 'USDT';
            return isSwap && isUSDTSettled && market.active;
          });

          console.log(`[PriceOpportunities] ${credential.exchange}: Found ${usdtSwapSymbols.length} USDT swap markets`);

          const tickers = await exchange.fetchTickers(usdtSwapSymbols);
          normalizedPrices = Object.entries(tickers)
            .map(([symbol, ticker]: [string, any]) => ({
              symbol: normalizeSymbol(symbol),
              price: ticker.last || ticker.close || ticker.mark || 0,
            }))
            .filter(p => p.price > 0);

          console.log(`[PriceOpportunities] ${credential.exchange}: Fetched ${normalizedPrices.length} prices`);
        }

        return {
          credentialId: credential.id,
          exchange: credential.exchange,
          prices: normalizedPrices,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[PriceOpportunities] Failed to fetch from ${credential.exchange}:`, errorMessage);
        if (error instanceof Error) {
          console.error(`[PriceOpportunities] Stack trace:`, error.stack);
        }
        return null;
      }
    });

    const nonMexcResults = await Promise.all(nonMexcFetchPromises);
    const validNonMexcResults = nonMexcResults.filter((r: typeof nonMexcResults[number]) => r !== null);

    // Build symbol list from non-MEXC exchanges
    const uniqueSymbols = new Set<string>();
    validNonMexcResults.forEach((result: typeof validNonMexcResults[number]) => {
      if (result) {
        result.prices.forEach((p: typeof result.prices[number]) => uniqueSymbols.add(p.symbol));
      }
    });

    console.log(`[PriceOpportunities] Found ${uniqueSymbols.size} unique symbols from non-MEXC exchanges`);

    // Fetch MEXC prices for symbols that exist on other exchanges
    const mexcFetchPromises = mexcCredentials.map(async (credential: Credential) => {
      try {
        console.log(`[PriceOpportunities] Fetching prices from ${credential.exchange}`);

        const mexcService = new MEXCService({
          apiKey: credential.apiKey,
          apiSecret: credential.apiSecret,
          authToken: credential.authToken,
          enableRateLimit: true,
        });

        const mexcSymbols = Array.from(uniqueSymbols).map((sym) =>
          sym.replace(/^(.+)(USDT|USDC|USD)$/, '$1_$2')
        );

        const rates = await mexcService.getFundingRatesForSymbols(mexcSymbols);
        const normalizedPrices: NormalizedPrice[] = rates
          .map((r) => ({
            symbol: normalizeSymbol(r.symbol),
            price: parseFloat(r.lastPrice?.toString() || '0'),
          }))
          .filter(p => p.price > 0);

        return {
          credentialId: credential.id,
          exchange: credential.exchange,
          prices: normalizedPrices,
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[PriceOpportunities] Failed to fetch from ${credential.exchange}:`, errorMessage);
        return null;
      }
    });

    const mexcResults = await Promise.all(mexcFetchPromises);
    const validMexcResults = mexcResults.filter((r: typeof mexcResults[number]) => r !== null);

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
      }>
    > = new Map();

    validResults.forEach((result: typeof validResults[number]) => {
      if (!result) return;

      result.prices.forEach((priceData: typeof result.prices[number]) => {
        if (!priceData.price || priceData.price <= 0) return;

        if (!symbolMap.has(priceData.symbol)) {
          symbolMap.set(priceData.symbol, []);
        }

        symbolMap.get(priceData.symbol)!.push({
          exchange: result.exchange,
          credentialId: result.credentialId,
          price: priceData.price,
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
        // For ALL exchanges, use public funding rates endpoint (unified approach)
        const publicUrl = new URL(`/api/${result.exchange.toLowerCase()}/public-funding-rates`, request.url);
        const response = await fetch(publicUrl.toString());

        if (response.ok) {
          const data = await response.json();
          const symbolFundingMap = new Map<string, {rate: number, interval: string}>();

          // Different exchanges have different response formats
          const rates = data.data || data.rates || data.result?.list || data;

          if (Array.isArray(rates)) {
            rates.forEach((r: typeof rates[number]) => {
              // Get funding rate from various field names
              const fundingRateRaw = r.fundingRate || r.lastFundingRate || r.funding_rate;

              if (fundingRateRaw !== undefined) {
                const fundingRateDecimal = parseFloat(fundingRateRaw.toString());
                const fundingRatePercent = fundingRateDecimal * 100;

                // Get interval from fundingInterval field (all endpoints now provide this)
                const symbolRaw = r.symbol || r.name;
                if (!symbolRaw) return;

                // Use the same normalization function as for prices to ensure consistency
                const normalizedSymbol = normalizeSymbol(symbolRaw);

                // Get interval from fundingInterval field (pure number in hours)
                const interval = r.fundingInterval || 0; // 0 means unknown

                symbolFundingMap.set(normalizedSymbol, { rate: fundingRatePercent, interval });
              }
            });

            fundingRateMap.set(result.exchange, symbolFundingMap);
            console.log(`[PriceOpportunities] Fetched ${symbolFundingMap.size} funding rates from ${result.exchange} via public endpoint`);
          }
        } else {
          console.warn(`[PriceOpportunities] Public endpoint failed for ${result.exchange}: ${response.status}`);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`[PriceOpportunities] Could not fetch public funding rates for ${result.exchange}:`, errorMessage);
      }
    }

    // 7. Calculate arbitrage opportunities with combined metrics
    const opportunities: PriceArbitrageOpportunity[] = [];

    for (const [symbol, exchanges] of symbolMap.entries()) {
      // Only analyze symbols with at least 2 exchanges
      if (exchanges.length < 2) continue;

      // Apply symbol filter if specified
      if (symbolFilter && symbol !== symbolFilter) continue;

      // Add funding data to exchanges
      const exchangesWithFunding = [...exchanges].map((ex: typeof exchanges[number]) => {
        const fundingMap = fundingRateMap.get(ex.exchange);
        const fundingData = fundingMap?.get(symbol);
        return {
          ...ex,
          fundingRate: fundingData?.rate,
          fundingInterval: fundingData?.interval
        };
      });

      // Safety check (should not happen due to earlier check)
      if (exchangesWithFunding.length < 2) continue;

      // Find optimal exchange pair for "Price Only" strategy:
      // 1. Maximum price spread
      // 2. Minimum total funding cost (absolute values)
      let bestLong: typeof exchangesWithFunding[number] | undefined;
      let bestShort: typeof exchangesWithFunding[number] | undefined;
      let maxSpread = 0;
      let minFundingCost = Infinity;

      // Try all possible pairs (both directions)
      for (const ex1 of exchangesWithFunding) {
        for (const ex2 of exchangesWithFunding) {
          if (ex1.exchange === ex2.exchange) continue;

          // Calculate spread (absolute value)
          const spread = Math.abs(ex2.price - ex1.price) / Math.min(ex1.price, ex2.price);

          // Determine which is LONG and which is SHORT
          const longEx = ex1.price < ex2.price ? ex1 : ex2;
          const shortEx = ex1.price < ex2.price ? ex2 : ex1;

          // Calculate total funding cost (absolute value)
          // LONG pays funding if positive, SHORT receives funding if positive
          // We want minimum |LONG funding| + |SHORT funding|
          const longFundingCost = Math.abs(longEx.fundingRate || 0);
          const shortFundingCost = Math.abs(shortEx.fundingRate || 0);
          const totalFundingCost = longFundingCost + shortFundingCost;

          // Prefer pairs with:
          // 1. Better spread (primary)
          // 2. Lower funding costs (secondary)
          const isSpreadBetter = spread > maxSpread;
          const isSpreadEqual = Math.abs(spread - maxSpread) < 0.0001; // ~0.01%
          const isFundingBetter = totalFundingCost < minFundingCost;

          if (isSpreadBetter || (isSpreadEqual && isFundingBetter)) {
            maxSpread = spread;
            minFundingCost = totalFundingCost;
            bestLong = longEx;
            bestShort = shortEx;
          }
        }
      }

      // Skip if no valid pair found
      if (!bestLong || !bestShort) continue;

      const lowestPrice = bestLong.price;
      const highestPrice = bestShort.price;

      // Log optimal selection for "Price Only" strategy
      console.log(`[PriceOpportunities] ${symbol} optimal pair:`);
      console.log(`  LONG (buy): ${bestLong.exchange} @ $${lowestPrice.toFixed(4)} | Funding: ${(bestLong.fundingRate || 0).toFixed(4)}%`);
      console.log(`  SHORT (sell): ${bestShort.exchange} @ $${highestPrice.toFixed(4)} | Funding: ${(bestShort.fundingRate || 0).toFixed(4)}%`);
      console.log(`  Spread: ${(maxSpread * 100).toFixed(4)}% | Total funding cost: ${minFundingCost.toFixed(4)}%`);

      // Sort all exchanges by price for display
      const sortedExchanges = [...exchangesWithFunding].sort((a, b) => a.price - b.price);

      // Calculate spread: (maxPrice - minPrice) / minPrice
      const spread = (highestPrice - lowestPrice) / lowestPrice;
      const spreadPercent = spread * 100;

      // Check if spread meets minimum threshold
      const arbitrageOpportunity = spreadPercent >= minSpread;

      if (!arbitrageOpportunity) continue;

      // Use our optimally selected exchanges
      const primaryExchangeName = bestShort.exchange; // SHORT = higher price
      const hedgeExchangeName = bestLong.exchange; // LONG = lower price

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
      let realisticMetricsData: {
        dailyReturn: { pessimistic: number; realistic: number; optimistic: number };
        monthlyROI: { pessimistic: number; realistic: number; optimistic: number };
        confidence: number;
        dataPoints?: number;
        historicalPeriodDays: number;
      } | undefined = undefined;
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
        const primaryExchangeEnum = primaryExchangeName as Exchange;
        const hedgeExchangeEnum = hedgeExchangeName as Exchange;

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
          credentialId: bestShort.credentialId,
          price: highestPrice,
        },
        hedgeExchange: {
          name: hedgeExchangeName,
          credentialId: bestLong.credentialId,
          price: lowestPrice,
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
    opportunities.sort((a: typeof opportunities[number], b: typeof opportunities[number]) => {
      const scoreA = a.combinedScore !== undefined ? a.combinedScore : a.spreadPercent;
      const scoreB = b.combinedScore !== undefined ? b.combinedScore : b.spreadPercent;
      return scoreB - scoreA;
    });

    console.log(`[PriceOpportunities] Found ${opportunities.length} opportunities with spread >= ${minSpread}%`);

    // Calculate stats
    const combinedOpportunities = opportunities.filter((o: typeof opportunities[number]) => o.strategyType === 'combined').length;
    const priceOnlyOpportunities = opportunities.filter((o: typeof opportunities[number]) => o.strategyType === 'price_only').length;

    console.log(`[PriceOpportunities] Strategy breakdown: ${combinedOpportunities} combined, ${priceOnlyOpportunities} price-only`);

    // 8. Return response
    return NextResponse.json(
      {
        success: true,
        data: opportunities,
        stats: {
          totalOpportunities: opportunities.length,
          combinedStrategy: opportunities.filter((o: typeof opportunities[number]) => o.strategyType === 'combined').length,
          priceOnly: opportunities.filter((o: typeof opportunities[number]) => o.strategyType === 'price_only').length,
          minSpread: minSpread,
          exchangesAnalyzed: validResults.length,
          fundingDataAvailable: fundingRateMap.size > 0,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[PriceOpportunities] Error fetching opportunities:', {
      error: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch arbitrage opportunities',
        message: errorMessage || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
