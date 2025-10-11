import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { BingXService } from '@/lib/bingx';
import { MEXCService } from '@/lib/mexc';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/arbitrage/funding-rates
 *
 * Fetches funding rates from all active exchange credentials and analyzes arbitrage opportunities.
 * Returns trading pairs with their funding rates across different exchanges, sorted by spread.
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
 *       "spread": 0.0004,
 *       "spreadPercent": 80.0,
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

    const nonMexcFetchPromises = nonMexcCredentials.map(async (credential) => {
      try {
        console.log(`[Arbitrage] Fetching funding rates for ${credential.exchange} (${credential.environment})`);
        console.log(`[Arbitrage] Credential details - ID: ${credential.id}, hasApiKey: ${!!credential.apiKey}, hasApiSecret: ${!!credential.apiSecret}`);

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
            rates: tickers.map(t => ({
              symbol: t.symbol,
              fundingRate: t.fundingRate,
              nextFundingTime: t.nextFundingTime,
              lastPrice: t.lastPrice,
            }))
          };
        } else if (credential.exchange === 'BINGX') {
          const bingxService = new BingXService({
            apiKey: credential.apiKey,
            apiSecret: credential.apiSecret,
            testnet: credential.environment === 'TESTNET',
            enableRateLimit: true,
          });

          // Sync time with BingX server before making requests
          await bingxService.syncTime();

          const rates = await bingxService.getAllFundingRates();
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
        }

        return null;
      } catch (error: any) {
        console.error(`[Arbitrage] Failed to fetch rates for ${credential.exchange}:`, error.message);
        return null;
      }
    });

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
        console.log(`[Arbitrage] Fetching funding rates for ${credential.exchange} (${credential.environment})`);
        console.log(`[Arbitrage] Credential details - ID: ${credential.id}, hasApiKey: ${!!credential.apiKey}, hasApiSecret: ${!!credential.apiSecret}`);

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

        console.log(`[Arbitrage] Requesting ${mexcSymbols.length} MEXC symbols (optimized from ${uniqueSymbols.size} total symbols)`);

        const rates = await mexcService.getFundingRatesForSymbols(mexcSymbols);
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

        symbolMap.get(rate.symbol)!.push({
          exchange: result.exchange,
          credentialId: result.credentialId,
          environment: result.environment,
          fundingRate: rate.fundingRate,
          nextFundingTime: rate.nextFundingTime,
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

      // Debug: Show all funding rates before sorting
      console.log(`[Arbitrage] Analyzing "${symbol}" with ${exchanges.length} exchanges:`,
        exchanges.map(e => `${e.exchange}=${e.fundingRate}`).join(', '));

      // Sort by funding rate
      const sortedExchanges = [...exchanges].sort((a, b) =>
        parseFloat(a.fundingRate) - parseFloat(b.fundingRate)
      );

      const lowestRate = parseFloat(sortedExchanges[0].fundingRate);
      const highestRate = parseFloat(sortedExchanges[sortedExchanges.length - 1].fundingRate);
      const spread = Math.abs(highestRate - lowestRate);
      const spreadPercent = lowestRate !== 0
        ? (spread / Math.abs(lowestRate)) * 100
        : 0;

      // Log detailed spread calculation
      console.log(`[Arbitrage] ${symbol} spread calculation:`);
      console.log(`  - Lowest: ${lowestRate} (${sortedExchanges[0].exchange})`);
      console.log(`  - Highest: ${highestRate} (${sortedExchanges[sortedExchanges.length - 1].exchange})`);
      console.log(`  - Spread: ${spread.toFixed(6)} (${spreadPercent.toFixed(2)}%)`);
      console.log(`  - Is opportunity: ${spread > 0.0001}`);

      // Determine arbitrage opportunity (spread > 0.01% or 0.0001 in decimal)
      const arbitrageOpportunity = spread > 0.0001;

      arbitrageOpportunities.push({
        symbol,
        exchanges: sortedExchanges,
        spread: spread.toFixed(6),
        spreadPercent: spreadPercent.toFixed(2),
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

    // Sort by spread (highest first)
    arbitrageOpportunities.sort((a, b) => parseFloat(b.spread) - parseFloat(a.spread));

    console.log(`[Arbitrage] Found ${arbitrageOpportunities.length} symbols with cross-exchange data`);
    console.log(`[Arbitrage] Arbitrage opportunities: ${arbitrageOpportunities.filter(o => o.arbitrageOpportunity).length}`);

    // 6. Return response
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
