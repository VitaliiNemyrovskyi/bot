import { NextRequest, NextResponse } from 'next/server';
import { Exchange } from '@prisma/client';
import { getFundingHistoryWithMetrics } from '@/services/funding-rate.service';

// Helper functions copied from service (temporary workaround)
function calculateStabilityMetrics(rates: number[]) {
  if (rates.length === 0) {
    return {
      stabilityScore: 0,
      volatility: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      signChangeFrequency: 0,
      trendStrength: 0,
      trendDirection: 'stable' as const
    };
  }

  const mean = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const squareDiffs = rates.map(rate => Math.pow(rate - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / rates.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  const cv = mean !== 0 ? Math.abs(stdDev / mean) : 0;

  let signChanges = 0;
  for (let i = 1; i < rates.length; i++) {
    if ((rates[i-1] > 0 && rates[i] < 0) || (rates[i-1] < 0 && rates[i] > 0)) {
      signChanges++;
    }
  }
  const signChangeFrequency = rates.length > 1 ? signChanges / (rates.length - 1) : 0;

  const n = rates.length;
  const xMean = (n - 1) / 2;
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (rates[i] - mean);
    denominator += Math.pow(i - xMean, 2);
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const maxPossibleSlope = Math.abs(mean) / (n / 2);
  const trendStrength = maxPossibleSlope !== 0 ? Math.max(-1, Math.min(1, slope / maxPossibleSlope)) : 0;

  let trendDirection: 'stable' | 'increasing' | 'decreasing';
  if (Math.abs(trendStrength) < 0.2) {
    trendDirection = 'stable';
  } else if (trendStrength > 0) {
    trendDirection = 'increasing';
  } else {
    trendDirection = 'decreasing';
  }

  const volatilityFactor = Math.max(0, 1 - (cv * 10));
  const signChangeFactor = Math.max(0, 1 - signChangeFrequency);
  const trendFactor = Math.max(0, 1 - Math.abs(trendStrength));
  const stabilityScore = Math.round((volatilityFactor * 40 + signChangeFactor * 30 + trendFactor * 30));

  return {
    stabilityScore: Math.max(0, Math.min(100, stabilityScore)),
    volatility: stdDev,
    standardDeviation: stdDev,
    coefficientOfVariation: cv,
    signChangeFrequency,
    trendStrength,
    trendDirection
  };
}

function predictFundingRates(rates: number[]) {
  if (rates.length < 3) {
    return {
      next1: rates[rates.length - 1] || 0,
      next2: rates[rates.length - 1] || 0,
      next3: rates[rates.length - 1] || 0,
      confidence: 0,
      method: 'insufficient_data'
    };
  }

  const alpha = 0.3;
  let ema = rates[0];
  for (let i = 1; i < rates.length; i++) {
    ema = alpha * rates[i] + (1 - alpha) * ema;
  }

  const recentRates = rates.slice(-5);
  const recentMean = recentRates.reduce((sum, r) => sum + r, 0) / recentRates.length;
  const trend = (rates[rates.length - 1] - recentMean) / recentMean;

  const next1 = ema * (1 + trend * 0.5);
  const next2 = next1 * (1 + trend * 0.3);
  const next3 = next2 * (1 + trend * 0.2);

  const metrics = calculateStabilityMetrics(rates);
  const confidence = Math.max(0, Math.min(1, metrics.stabilityScore / 100));

  return {
    next1,
    next2,
    next3,
    confidence,
    method: 'exponential_moving_average_with_trend'
  };
}

/**
 * GET /api/funding/history-metrics
 *
 * Fetches comprehensive funding rate history with stability metrics, predictions, and comparisons
 *
 * Query Parameters:
 * - symbol: Trading symbol (e.g., BTCUSDT, BTC/USDT)
 * - exchange: Exchange name (BYBIT, BINGX, MEXC, GATEIO, OKX, BINANCE)
 * - days: Number of days (7 or 30, default: 7)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "history": [...],
 *     "statistics": { avg, min, max, avgRate7d, avgRate30d },
 *     "stability": { stabilityScore, volatility, trendDirection, ... },
 *     "prediction": { next1, next2, next3, confidence },
 *     "comparison": [ { exchange, currentRate, stabilityScore, ... } ],
 *     "marketMetrics": { openInterest, volume24h, markPrice }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const exchangeParam = searchParams.get('exchange')?.toUpperCase();
    const days = parseInt(searchParams.get('days') || '7');

    // Validation
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'symbol is required' },
        { status: 400 }
      );
    }

    if (!exchangeParam) {
      return NextResponse.json(
        { success: false, error: 'exchange is required' },
        { status: 400 }
      );
    }

    // Validate exchange
    const validExchanges = ['BYBIT', 'BINGX', 'MEXC', 'GATEIO', 'OKX', 'BINANCE'];
    if (!validExchanges.includes(exchangeParam)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid exchange. Must be one of: ${validExchanges.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate days
    if (![7, 30].includes(days)) {
      return NextResponse.json(
        { success: false, error: 'days must be 7 or 30' },
        { status: 400 }
      );
    }

    const exchange = exchangeParam as Exchange;

    console.log(`[Funding History Metrics] Fetching ${exchange} ${symbol} for ${days} days with full metrics`);

    // Normalize symbol format (some exchanges use / separator, some don't)
    const normalizedSymbol = symbol.replace('/', '');

    // Try to fetch comprehensive metrics
    // For now, if database is empty, use the working /api/arbitrage/funding-rates/history endpoint
    let result;
    try {
      result = await getFundingHistoryWithMetrics(exchange, normalizedSymbol, days);
    } catch (error: any) {
      // If no database data, fetch from the working history endpoint
      console.log(`[Funding History Metrics] Database empty, fetching from working history API`);

      const historyUrl = `http://localhost:3000/api/arbitrage/funding-rates/history?exchange=${exchange}&symbol=${normalizedSymbol}&days=${days}`;
      const historyResponse = await fetch(historyUrl);
      const historyData = await historyResponse.json();

      if (!historyData.success || historyData.data.length === 0) {
        throw error; // Re-throw original error
      }

      // Convert history data to our format
      const history = historyData.data.map((item: any) => ({
        symbol: normalizedSymbol,
        fundingRate: item.fundingRate,
        fundingRateTimestamp: new Date(item.timestamp),
        nextFundingTime: new Date(item.timestamp + 8 * 60 * 60 * 1000),
        annualizedRate: item.fundingRate * 3 * 365
      }));

      // Calculate metrics from fetched data
      const rates = history.map((h: any) => h.fundingRate);
      const avg = rates.reduce((sum: number, r: number) => sum + r, 0) / rates.length;

      result = {
        history,
        statistics: {
          avg,
          min: Math.min(...rates),
          max: Math.max(...rates),
          avgRate7d: avg,
          avgRate30d: avg
        },
        stability: calculateStabilityMetrics(rates),
        prediction: predictFundingRates(rates),
        comparison: [],
        marketMetrics: {
          openInterest: null,
          volume24h: null,
          markPrice: null
        }
      };
    }

    console.log(`[Funding History Metrics] Successfully fetched data:
      - History: ${result.history.length} records
      - Stability Score: ${result.stability.stabilityScore}/100
      - Trend: ${result.stability.trendDirection}
      - Comparisons: ${result.comparison.length} exchanges
      - Prediction confidence: ${(result.prediction.confidence * 100).toFixed(1)}%
    `);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[Funding History Metrics] Error:', error);

    // Return appropriate error message
    if (error.message.includes('No historical data available')) {
      return NextResponse.json(
        {
          success: false,
          error: 'No historical data available for this symbol and exchange',
          message: error.message
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch funding rate metrics',
        message: error.message
      },
      { status: 500 }
    );
  }
}
