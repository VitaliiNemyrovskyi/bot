/**
 * Optimal Entry Timing Analyzer
 *
 * Analyzes all funding payment recordings to find the optimal entry timing
 * by detecting when the price actually starts dropping relative to the
 * scheduled funding payment time.
 *
 * Goal: Determine if we're entering too late and calculate the optimal offset
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AnalysisResult {
  sessionId: string;
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingPaymentTime: Date;

  // Timing analysis
  firstDropTimeMs: number; // When price first dropped (relative to funding time, negative = before)
  maxDropTimeMs: number; // When max drop occurred (relative to funding time)
  maxDropPercent: number;

  // Entry timing recommendation
  optimalEntryOffsetMs: number; // How many ms BEFORE funding time to enter

  // Data quality
  totalDataPoints: number;
  dataQuality: 'EXCELLENT' | 'GOOD' | 'POOR';
}

async function analyzeOptimalEntryTiming() {
  console.log('\n🔍 OPTIMAL ENTRY TIMING ANALYZER\n');
  console.log('=' .repeat(80));

  // Fetch all COMPLETED recordings with sufficient data
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: {
        gte: 100 // At least 100 data points for reliable analysis
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50, // Analyze last 50 recordings
    include: {
      dataPoints: {
        orderBy: {
          bybitTimestamp: 'asc'
        }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No completed recordings found with sufficient data points.\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings to analyze\n`);
  console.log('=' .repeat(80));

  const analysisResults: AnalysisResult[] = [];

  for (const session of sessions) {
    console.log(`\n📊 Analyzing: ${session.exchange} ${session.symbol}`);
    console.log(`   Funding Time: ${session.fundingPaymentTime?.toISOString()}`);
    console.log(`   Funding Rate: ${((session.fundingRate || 0) * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${session.dataPoints.length}`);

    if (!session.fundingPaymentTime || session.dataPoints.length === 0) {
      console.log('   ⚠️  Skipping - missing critical data');
      continue;
    }

    // Analyze price movement
    const result = analyzePriceMovement(session);

    if (result) {
      analysisResults.push(result);

      console.log(`\n   📉 Price Drop Analysis:`);
      console.log(`      First Drop: ${result.firstDropTimeMs}ms ${result.firstDropTimeMs < 0 ? 'BEFORE' : 'AFTER'} funding time`);
      console.log(`      Max Drop: ${result.maxDropPercent.toFixed(4)}% at ${result.maxDropTimeMs}ms`);
      console.log(`      Optimal Entry: ${Math.abs(result.optimalEntryOffsetMs)}ms BEFORE funding time`);
      console.log(`      Data Quality: ${result.dataQuality}`);
    } else {
      console.log('   ⚠️  No significant price drop detected');
    }
  }

  // Generate summary statistics
  console.log('\n\n' + '=' .repeat(80));
  console.log('📊 SUMMARY STATISTICS');
  console.log('=' .repeat(80));

  if (analysisResults.length === 0) {
    console.log('\n❌ No valid analysis results\n');
    return;
  }

  // Filter for good quality data
  const goodQualityResults = analysisResults.filter(r =>
    r.dataQuality === 'EXCELLENT' || r.dataQuality === 'GOOD'
  );

  console.log(`\nTotal Recordings Analyzed: ${analysisResults.length}`);
  console.log(`Good Quality Results: ${goodQualityResults.length}`);

  if (goodQualityResults.length === 0) {
    console.log('\n❌ No good quality results to analyze\n');
    return;
  }

  // Calculate statistics
  const firstDropTimes = goodQualityResults.map(r => r.firstDropTimeMs);
  const optimalOffsets = goodQualityResults.map(r => r.optimalEntryOffsetMs);

  const avgFirstDrop = average(firstDropTimes);
  const medianFirstDrop = median(firstDropTimes);
  const avgOptimalOffset = average(optimalOffsets);
  const medianOptimalOffset = median(optimalOffsets);

  console.log('\n🎯 FIRST PRICE DROP TIMING:');
  console.log(`   Average: ${avgFirstDrop.toFixed(0)}ms ${avgFirstDrop < 0 ? 'BEFORE' : 'AFTER'} funding time`);
  console.log(`   Median: ${medianFirstDrop.toFixed(0)}ms ${medianFirstDrop < 0 ? 'BEFORE' : 'AFTER'} funding time`);
  console.log(`   Range: ${Math.min(...firstDropTimes).toFixed(0)}ms to ${Math.max(...firstDropTimes).toFixed(0)}ms`);

  console.log('\n💡 RECOMMENDED ENTRY OFFSET:');
  console.log(`   Average: Enter ${Math.abs(avgOptimalOffset).toFixed(0)}ms BEFORE funding time`);
  console.log(`   Median: Enter ${Math.abs(medianOptimalOffset).toFixed(0)}ms BEFORE funding time`);
  console.log(`   Conservative (90th percentile): Enter ${Math.abs(percentile(optimalOffsets, 0.9)).toFixed(0)}ms BEFORE funding time`);

  // Breakdown by exchange
  console.log('\n📊 BREAKDOWN BY EXCHANGE:');
  const byExchange = groupBy(goodQualityResults, r => r.exchange);

  for (const [exchange, results] of Object.entries(byExchange)) {
    const avgOffset = average(results.map(r => r.optimalEntryOffsetMs));
    console.log(`   ${exchange}: ${Math.abs(avgOffset).toFixed(0)}ms before (${results.length} samples)`);
  }

  // Detailed breakdown table
  console.log('\n\n' + '=' .repeat(80));
  console.log('📋 DETAILED BREAKDOWN (Top 20 by Max Drop %)');
  console.log('=' .repeat(80));
  console.log('');
  console.log('Symbol       Exchange  Fund%      First Drop   Max Drop%  Optimal Entry');
  console.log('-'.repeat(80));

  const topResults = [...goodQualityResults]
    .sort((a, b) => Math.abs(b.maxDropPercent) - Math.abs(a.maxDropPercent))
    .slice(0, 20);

  for (const result of topResults) {
    const symbolPad = result.symbol.padEnd(12);
    const exchangePad = result.exchange.padEnd(8);
    const fundingPad = ((result.fundingRate * 100).toFixed(3) + '%').padEnd(10);
    const firstDropPad = formatTimingMs(result.firstDropTimeMs).padEnd(12);
    const maxDropPad = (result.maxDropPercent.toFixed(3) + '%').padEnd(10);
    const optimalPad = formatTimingMs(result.optimalEntryOffsetMs);

    console.log(`${symbolPad} ${exchangePad} ${fundingPad} ${firstDropPad} ${maxDropPad} ${optimalPad}`);
  }

  console.log('\n\n' + '=' .repeat(80));
  console.log('🎯 FINAL RECOMMENDATION');
  console.log('=' .repeat(80));

  const conservativeOffset = Math.abs(percentile(optimalOffsets, 0.9));
  const recommendedOffset = Math.abs(medianOptimalOffset);

  console.log(`\n📌 CONSERVATIVE (90% confidence): Enter ${conservativeOffset.toFixed(0)}ms BEFORE funding time`);
  console.log(`📌 RECOMMENDED (median): Enter ${recommendedOffset.toFixed(0)}ms BEFORE funding time`);
  console.log(`📌 AGGRESSIVE (average): Enter ${Math.abs(avgOptimalOffset).toFixed(0)}ms BEFORE funding time`);

  console.log('\n💡 Implementation:');
  console.log(`   Update your entry logic to enter SHORT positions:`);
  console.log(`   - ${conservativeOffset.toFixed(0)}ms BEFORE scheduled funding time (safe)`);
  console.log(`   - ${recommendedOffset.toFixed(0)}ms BEFORE scheduled funding time (recommended)`);

  console.log('\n⚠️  Important Notes:');
  console.log('   - Bybit has a ±5 second settlement window around funding time');
  console.log('   - Other traders enter early to capture the price drop');
  console.log('   - Use conservative offset to ensure you capture the drop');
  console.log('   - Monitor execution latency and adjust offset accordingly');

  console.log('\n' + '=' .repeat(80) + '\n');
}

/**
 * Analyze price movement for a single recording session
 */
function analyzePriceMovement(session: any): AnalysisResult | null {
  const dataPoints = session.dataPoints;

  if (dataPoints.length < 10) {
    return null; // Not enough data
  }

  // Find the price point closest to funding time (baseline price)
  const fundingTimeMs = session.fundingPaymentTime!.getTime();
  const baselinePoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - fundingTimeMs) < Math.abs(closestTime - fundingTimeMs)
      ? point
      : closest;
  });

  const baselinePrice = baselinePoint.lastPrice;
  const baselineTime = Number(baselinePoint.bybitTimestamp);

  // Find first significant drop (> 0.01% drop)
  const DROP_THRESHOLD = 0.0001; // 0.01%
  let firstDropPoint = null;

  for (const point of dataPoints) {
    const pointTime = Number(point.bybitTimestamp);
    const dropPercent = (baselinePrice - point.lastPrice) / baselinePrice;

    if (dropPercent > DROP_THRESHOLD) {
      firstDropPoint = point;
      break;
    }
  }

  if (!firstDropPoint) {
    return null; // No significant drop detected
  }

  // Find maximum drop
  let maxDropPoint = firstDropPoint;
  let maxDropPercent = 0;

  for (const point of dataPoints) {
    const dropPercent = (baselinePrice - point.lastPrice) / baselinePrice;
    if (dropPercent > maxDropPercent) {
      maxDropPercent = dropPercent;
      maxDropPoint = point;
    }
  }

  const firstDropTimeMs = Number(firstDropPoint.bybitTimestamp) - fundingTimeMs;
  const maxDropTimeMs = Number(maxDropPoint.bybitTimestamp) - fundingTimeMs;

  // Determine optimal entry offset
  // Enter slightly before the first drop to capture it
  const SAFETY_MARGIN_MS = 200; // 200ms safety margin
  const optimalEntryOffsetMs = firstDropTimeMs - SAFETY_MARGIN_MS;

  // Assess data quality
  let dataQuality: 'EXCELLENT' | 'GOOD' | 'POOR' = 'POOR';
  if (dataPoints.length >= 500 && maxDropPercent > 0.001) {
    dataQuality = 'EXCELLENT';
  } else if (dataPoints.length >= 200 && maxDropPercent > 0.0005) {
    dataQuality = 'GOOD';
  }

  return {
    sessionId: session.id,
    symbol: session.symbol,
    exchange: session.exchange,
    fundingRate: session.fundingRate || 0,
    fundingPaymentTime: session.fundingPaymentTime,
    firstDropTimeMs,
    maxDropTimeMs,
    maxDropPercent: maxDropPercent * 100, // Convert to percentage
    optimalEntryOffsetMs,
    totalDataPoints: dataPoints.length,
    dataQuality
  };
}

/**
 * Helper functions
 */
function average(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

function percentile(numbers: number[], p: number): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, index)];
}

function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function formatTimingMs(ms: number): string {
  if (ms < 0) {
    return `${Math.abs(ms).toFixed(0)}ms BEFORE`;
  } else {
    return `${ms.toFixed(0)}ms AFTER`;
  }
}

// Run the analysis
analyzeOptimalEntryTiming()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
