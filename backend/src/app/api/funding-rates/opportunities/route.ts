import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { getArbitrageOpportunities, ArbitrageOpportunity } from '@/services/funding-rate.service';
import { getFundingRateCollector } from '@/services/funding-rate-collector.service';
import { BybitService } from '@/lib/bybit';
import { OKXService } from '@/lib/okx';
import { BitgetService } from '@/lib/bitget';
import {
  calculateLiquidityScore,
  estimatePriceDropFromLiquidity,
  calculateExpectedNetReturn,
  getRiskLevel,
  getLiquidityDescription,
} from '@/lib/liquidity-score.utils';

/**
 * GET /api/funding-rates/opportunities
 *
 * Get top funding rate arbitrage opportunities from all available exchanges.
 * The results are sorted by the absolute value of the funding rate in descending order.
 * Includes liquidity analysis for all exchanges (BYBIT, BINANCE, OKX, GATEIO, BITGET, KUCOIN).
 *
 * Query Parameters:
 * - limit (optional): Maximum number of results (default: 100)
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
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    // 3. Get all tracked exchanges
    const collector = getFundingRateCollector();
    // @ts-ignore - TRACKED_EXCHANGES is private, but we need it here for now.
    const exchanges = collector.TRACKED_EXCHANGES || [];

    // 4. Get arbitrage opportunities from all exchanges
    console.log(`[FundingOpportunities] Fetching opportunities from all exchanges, limit: ${limit}`);

    let allOpportunities: ArbitrageOpportunity[] = [];

    for (const exchange of exchanges) {
      try {
        // Fetch all opportunities from each exchange (minRate=0, high limit)
        const opportunities = await getArbitrageOpportunities(exchange, 0, 1000);
        // Add exchange info to each opportunity
        const opportunitiesWithExchange = opportunities.map(op => ({ ...op, exchange }));
        allOpportunities.push(...opportunitiesWithExchange);
      } catch (error: any) {
        console.warn(`[FundingOpportunities] Could not fetch opportunities for ${exchange}: ${error.message}`);
      }
    }

    // 5. Sort all opportunities by absolute funding rate
    allOpportunities.sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate));

    // 6. Apply limit
    const limitedOpportunities = allOpportunities.slice(0, limit);

    console.log(`[FundingOpportunities] Found ${allOpportunities.length} total opportunities, returning ${limitedOpportunities.length}`);

    // 7. Add liquidity analysis for top 20 opportunities only (to improve performance)
    const LIQUIDITY_LIMIT = 20;
    const opportunitiesForLiquidity = limitedOpportunities.slice(0, LIQUIDITY_LIMIT);

    const bybitService = new BybitService();
    const BinanceService = (await import('@/lib/binance')).BinanceService;
    const binanceService = new BinanceService();
    const okxService = new OKXService();
    const bitgetService = new BitgetService();

    // For GateIO and KuCoin, create CCXT clients directly (their services use custom API)
    const ccxt = await import('ccxt');
    const gateioClient = new ccxt.gateio({ enableRateLimit: true, options: { defaultType: 'swap' } });
    const kucoinClient = new ccxt.kucoin({ enableRateLimit: true, options: { defaultType: 'swap' } });

    // Load markets for all CCXT-based exchanges to ensure symbols are available for lookups
    // This is necessary - CCXT does NOT lazily load markets automatically
    await Promise.all([
      okxService.initialize(),
      bitgetService.initialize(),
      gateioClient.loadMarkets(),
      kucoinClient.loadMarkets()
    ]);

    const opportunitiesWithLiquidity = await Promise.all(
      opportunitiesForLiquidity.map(async (opportunity) => {
        try {
          let orderBook: any = null;

          // Get order book based on exchange
          switch (opportunity.exchange) {
            case 'BYBIT':
              // Remove slash from symbol for Bybit API (DASH/USDT -> DASHUSDT)
              const bybitSymbol = opportunity.symbol.replace('/', '');
              orderBook = await bybitService.getOrderBook('linear', bybitSymbol, 1);
              break;

            case 'BINANCE':
              // Binance uses DASH/USDT format, fetch via CCXT
              // Note: BINANCE requires depth limit of at least 5 (valid: 5, 10, 20, 50, 100, 500, 1000, 5000)
              orderBook = await (binanceService as any).client.fetchOrderBook(opportunity.symbol, 5);
              break;

            case 'OKX':
              // OKX uses CCXT, fetch order book
              orderBook = await okxService.client.fetchOrderBook(opportunity.symbol, 5);
              break;

            case 'BITGET':
              // Bitget uses CCXT, fetch order book
              orderBook = await bitgetService.client.fetchOrderBook(opportunity.symbol, 5);
              break;

            case 'GATEIO':
              // Gate.io uses CCXT client, fetch order book
              orderBook = await gateioClient.fetchOrderBook(opportunity.symbol, 5);
              break;

            case 'KUCOIN':
              // KuCoin uses CCXT client, fetch order book (requires limit of 20 or 100)
              orderBook = await kucoinClient.fetchOrderBook(opportunity.symbol, 20);
              break;
          }

          // Add liquidity data if order book is available
          if (orderBook && orderBook.bids && orderBook.bids.length > 0 && orderBook.asks && orderBook.asks.length > 0) {
            const bidSize = parseFloat(orderBook.bids[0][1]);
            const askSize = parseFloat(orderBook.asks[0][1]);

            const liquidityScore = calculateLiquidityScore(bidSize, askSize);
            const estimatedPriceDropPercent = estimatePriceDropFromLiquidity(liquidityScore);
            const expectedNetReturnPercent = calculateExpectedNetReturn(opportunity.fundingRate, liquidityScore);
            const riskLevel = getRiskLevel(liquidityScore);
            const liquidityDescription = getLiquidityDescription(liquidityScore);

            return {
              ...opportunity,
              liquidityScore,
              bidSize,
              askSize,
              estimatedPriceDropPercent,
              expectedNetReturnPercent,
              riskLevel,
              liquidityDescription,
            };
          }
        } catch (error: any) {
          console.warn(`[FundingOpportunities] Failed to get order book for ${opportunity.exchange}/${opportunity.symbol}:`, error.message);
        }

        return opportunity;
      })
    );

    // 8. Merge opportunities with and without liquidity data
    const remainingOpportunities = limitedOpportunities.slice(LIQUIDITY_LIMIT);
    const allData = [...opportunitiesWithLiquidity, ...remainingOpportunities];

    // 9. Return response
    return NextResponse.json(
      {
        success: true,
        data: allData,
        count: allData.length,
        filters: {
          limit
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingOpportunities] Error getting arbitrage opportunities:', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get arbitrage opportunities',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
