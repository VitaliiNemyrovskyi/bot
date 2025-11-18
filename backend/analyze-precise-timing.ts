/**
 * Precise Timing Analysis - Verify Price Behavior in Specific Time Windows
 *
 * This script analyzes what ACTUALLY happens to price in specific time windows
 * after funding payment to verify or debunk the +20s/+25s LONG strategy.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TimeWindowAnalysis {
  sessionId: string;
  symbol: string;
  fundingRate: number;
  fundingPaymentTime: Date;

  // Price at specific time points (relative to funding)
  priceAtFunding: number;
  priceAt5s: number | null;
  priceAt10s: number | null;
  priceAt15s: number | null;
  priceAt20s: number | null;
  priceAt25s: number | null;
  priceAt30s: number | null;

  // Changes in specific windows
  change_0_to_5s: number | null;   // % change from funding to +5s
  change_5s_to_10s: number | null;  // % change from +5s to +10s
  change_10s_to_15s: number | null; // % change from +10s to +15s
  change_15s_to_20s: number | null; // % change from +15s to +20s
  change_20s_to_25s: number | null; // % change from +20s to +25s (CLAIMED WINDOW)
  change_25s_to_30s: number | null; // % change from +25s to +30s

  // Cumulative changes from funding time
  cumulative_0_to_5s: number | null;
  cumulative_0_to_10s: number | null;
  cumulative_0_to_15s: number | null;
  cumulative_0_to_20s: number | null;
  cumulative_0_to_25s: number | null;
  cumulative_0_to_30s: number | null;

  totalDataPoints: number;
}

async function analyzePreciseTiming() {
  console.log('\n🔍 PRECISE TIMING ANALYSIS - VERIFY ACTUAL PRICE BEHAVIOR\n');
  console.log('='.repeat(80));

  // Fetch completed recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 100 }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      dataPoints: {
        orderBy: { bybitTimestamp: 'asc' }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No completed recordings found\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings to analyze\n`);
  console.log('='.repeat(80));

  const results: TimeWindowAnalysis[] = [];

  for (const session of sessions) {
    console.log(`\n📊 Analyzing: ${session.symbol}`);
    console.log(`   Funding Time: ${session.fundingPaymentTime?.toISOString()}`);
    console.log(`   Funding Rate: ${((session.fundingRate || 0) * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${session.dataPoints.length}`);

    if (!session.fundingPaymentTime) {
      console.log('   ⚠️  Skipping - no funding time');
      continue;
    }

    const result = analyzeTimeWindows(session);

    if (result) {
      results.push(result);

      console.log(`\n   📍 Price at key moments:`);
      console.log(`      At Funding (0s):  $${result.priceAtFunding.toFixed(6)}`);
      console.log(`      At +5s:           $${result.priceAt5s?.toFixed(6) || 'N/A'}`);
      console.log(`      At +10s:          $${result.priceAt10s?.toFixed(6) || 'N/A'}`);
      console.log(`      At +15s:          $${result.priceAt15s?.toFixed(6) || 'N/A'}`);
      console.log(`      At +20s:          $${result.priceAt20s?.toFixed(6) || 'N/A'}`);
      console.log(`      At +25s:          $${result.priceAt25s?.toFixed(6) || 'N/A'}`);
      console.log(`      At +30s:          $${result.priceAt30s?.toFixed(6) || 'N/A'}`);

      console.log(`\n   📈 Window-by-window changes:`);
      console.log(`      0s → +5s:   ${formatChange(result.change_0_to_5s)}`);
      console.log(`      +5s → +10s: ${formatChange(result.change_5s_to_10s)}`);
      console.log(`      +10s → +15s: ${formatChange(result.change_10s_to_15s)}`);
      console.log(`      +15s → +20s: ${formatChange(result.change_15s_to_20s)}`);
      console.log(`      +20s → +25s: ${formatChange(result.change_20s_to_25s)} ⭐ (CLAIMED WINDOW)`);
      console.log(`      +25s → +30s: ${formatChange(result.change_25s_to_30s)}`);

      console.log(`\n   📊 Cumulative changes from funding:`);
      console.log(`      0s → +5s:   ${formatChange(result.cumulative_0_to_5s)}`);
      console.log(`      0s → +10s:  ${formatChange(result.cumulative_0_to_10s)}`);
      console.log(`      0s → +15s:  ${formatChange(result.cumulative_0_to_15s)}`);
      console.log(`      0s → +20s:  ${formatChange(result.cumulative_0_to_20s)}`);
      console.log(`      0s → +25s:  ${formatChange(result.cumulative_0_to_25s)}`);
      console.log(`      0s → +30s:  ${formatChange(result.cumulative_0_to_30s)}`);
    }
  }

  // Generate summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY - AVERAGE BEHAVIOR ACROSS ALL SESSIONS');
  console.log('='.repeat(80));

  if (results.length === 0) {
    console.log('\n❌ No valid results\n');
    return;
  }

  // Calculate averages for each window
  const validResults = results.filter(r =>
    r.change_20s_to_25s !== null &&
    r.cumulative_0_to_25s !== null
  );

  if (validResults.length === 0) {
    console.log('\n❌ No sessions have data for the +20s to +25s window\n');
    return;
  }

  const avgChange_0_5 = average(validResults.map(r => r.change_0_to_5s!).filter(x => x !== null));
  const avgChange_5_10 = average(validResults.map(r => r.change_5s_to_10s!).filter(x => x !== null));
  const avgChange_10_15 = average(validResults.map(r => r.change_10s_to_15s!).filter(x => x !== null));
  const avgChange_15_20 = average(validResults.map(r => r.change_15s_to_20s!).filter(x => x !== null));
  const avgChange_20_25 = average(validResults.map(r => r.change_20s_to_25s!).filter(x => x !== null));
  const avgChange_25_30 = average(validResults.map(r => r.change_25s_to_30s!).filter(x => x !== null));

  const avgCumulative_0_5 = average(validResults.map(r => r.cumulative_0_to_5s!).filter(x => x !== null));
  const avgCumulative_0_10 = average(validResults.map(r => r.cumulative_0_to_10s!).filter(x => x !== null));
  const avgCumulative_0_15 = average(validResults.map(r => r.cumulative_0_to_15s!).filter(x => x !== null));
  const avgCumulative_0_20 = average(validResults.map(r => r.cumulative_0_to_20s!).filter(x => x !== null));
  const avgCumulative_0_25 = average(validResults.map(r => r.cumulative_0_to_25s!).filter(x => x !== null));
  const avgCumulative_0_30 = average(validResults.map(r => r.cumulative_0_to_30s!).filter(x => x !== null));

  console.log(`\n📊 Average Window-by-Window Changes (${validResults.length} sessions):`);
  console.log(`   0s → +5s:   ${formatChange(avgChange_0_5)}`);
  console.log(`   +5s → +10s: ${formatChange(avgChange_5_10)}`);
  console.log(`   +10s → +15s: ${formatChange(avgChange_10_15)}`);
  console.log(`   +15s → +20s: ${formatChange(avgChange_15_20)}`);
  console.log(`   +20s → +25s: ${formatChange(avgChange_20_25)} ⭐ (CLAIMED 1% WINDOW)`);
  console.log(`   +25s → +30s: ${formatChange(avgChange_25_30)}`);

  console.log(`\n📈 Average Cumulative Changes from Funding:`);
  console.log(`   0s → +5s:   ${formatChange(avgCumulative_0_5)}`);
  console.log(`   0s → +10s:  ${formatChange(avgCumulative_0_10)}`);
  console.log(`   0s → +15s:  ${formatChange(avgCumulative_0_15)}`);
  console.log(`   0s → +20s:  ${formatChange(avgCumulative_0_20)}`);
  console.log(`   0s → +25s:  ${formatChange(avgCumulative_0_25)}`);
  console.log(`   0s → +30s:  ${formatChange(avgCumulative_0_30)}`);

  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 VERDICT ON +20s/+25s LONG STRATEGY');
  console.log('='.repeat(80));

  console.log(`\n📌 CLAIMED: Enter LONG at +20s, exit at +25s for ~1% profit`);
  console.log(`📊 ACTUAL AVERAGE: ${formatChange(avgChange_20_25)} in +20s to +25s window`);

  if (avgChange_20_25 > 0.5) {
    console.log(`\n✅ CONFIRMED: Strategy appears viable!`);
    console.log(`   Average profit in claimed window: ${avgChange_20_25.toFixed(4)}%`);
  } else if (avgChange_20_25 > 0) {
    console.log(`\n⚠️  PARTIAL CONFIRMATION: Positive movement but less than claimed`);
    console.log(`   Actual average: ${avgChange_20_25.toFixed(4)}% (claimed: ~1%)`);
  } else {
    console.log(`\n❌ REJECTED: Strategy does NOT work as claimed!`);
    console.log(`   Price actually moves ${avgChange_20_25.toFixed(4)}% (negative = down)`);
  }

  // Find the best window
  console.log('\n\n' + '='.repeat(80));
  console.log('🔍 FINDING THE ACTUAL BEST ENTRY/EXIT WINDOWS');
  console.log('='.repeat(80));

  const windows = [
    { name: '0s → +5s', change: avgChange_0_5 },
    { name: '+5s → +10s', change: avgChange_5_10 },
    { name: '+10s → +15s', change: avgChange_10_15 },
    { name: '+15s → +20s', change: avgChange_15_20 },
    { name: '+20s → +25s', change: avgChange_20_25 },
    { name: '+25s → +30s', change: avgChange_25_30 }
  ];

  const sortedWindows = windows.sort((a, b) => b.change - a.change);

  console.log(`\n📊 Windows ranked by profitability:`);
  sortedWindows.forEach((w, i) => {
    console.log(`   ${i + 1}. ${w.name.padEnd(15)} ${formatChange(w.change)}`);
  });

  console.log('\n\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATION');
  console.log('='.repeat(80));

  const bestWindow = sortedWindows[0];
  console.log(`\n✅ BEST WINDOW: ${bestWindow.name}`);
  console.log(`   Average profit: ${formatChange(bestWindow.change)}`);

  if (bestWindow.change < 0.1) {
    console.log(`\n⚠️  WARNING: Even best window shows very low profit (<0.1%)`);
    console.log(`   After fees (0.11%) and slippage (0.04%), this may not be profitable`);
    console.log(`   Consider analyzing longer time windows or different strategies`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Analyze price behavior in specific time windows
 */
function analyzeTimeWindows(session: any): TimeWindowAnalysis | null {
  const dataPoints = session.dataPoints;
  const fundingTimeMs = session.fundingPaymentTime!.getTime();

  if (dataPoints.length < 10) return null;

  // Helper to find price at specific time offset
  const getPriceAt = (offsetMs: number): number | null => {
    const targetTime = fundingTimeMs + offsetMs;
    const closestPoint = dataPoints.reduce((closest: any, point: any) => {
      const pointTime = Number(point.bybitTimestamp);
      const closestTime = Number(closest.bybitTimestamp);
      return Math.abs(pointTime - targetTime) < Math.abs(closestTime - targetTime)
        ? point : closest;
    });

    // Only return if within 500ms tolerance
    const actualTime = Number(closestPoint.bybitTimestamp);
    if (Math.abs(actualTime - targetTime) > 500) return null;

    return closestPoint.lastPrice;
  };

  // Get prices at key moments
  const priceAtFunding = getPriceAt(0);
  const priceAt5s = getPriceAt(5000);
  const priceAt10s = getPriceAt(10000);
  const priceAt15s = getPriceAt(15000);
  const priceAt20s = getPriceAt(20000);
  const priceAt25s = getPriceAt(25000);
  const priceAt30s = getPriceAt(30000);

  if (!priceAtFunding) return null;

  // Calculate window-by-window changes
  const change_0_to_5s = priceAt5s ? ((priceAt5s - priceAtFunding) / priceAtFunding * 100) : null;
  const change_5s_to_10s = (priceAt5s && priceAt10s) ? ((priceAt10s - priceAt5s) / priceAt5s * 100) : null;
  const change_10s_to_15s = (priceAt10s && priceAt15s) ? ((priceAt15s - priceAt10s) / priceAt10s * 100) : null;
  const change_15s_to_20s = (priceAt15s && priceAt20s) ? ((priceAt20s - priceAt15s) / priceAt15s * 100) : null;
  const change_20s_to_25s = (priceAt20s && priceAt25s) ? ((priceAt25s - priceAt20s) / priceAt20s * 100) : null;
  const change_25s_to_30s = (priceAt25s && priceAt30s) ? ((priceAt30s - priceAt25s) / priceAt25s * 100) : null;

  // Calculate cumulative changes from funding
  const cumulative_0_to_5s = priceAt5s ? ((priceAt5s - priceAtFunding) / priceAtFunding * 100) : null;
  const cumulative_0_to_10s = priceAt10s ? ((priceAt10s - priceAtFunding) / priceAtFunding * 100) : null;
  const cumulative_0_to_15s = priceAt15s ? ((priceAt15s - priceAtFunding) / priceAtFunding * 100) : null;
  const cumulative_0_to_20s = priceAt20s ? ((priceAt20s - priceAtFunding) / priceAtFunding * 100) : null;
  const cumulative_0_to_25s = priceAt25s ? ((priceAt25s - priceAtFunding) / priceAtFunding * 100) : null;
  const cumulative_0_to_30s = priceAt30s ? ((priceAt30s - priceAtFunding) / priceAtFunding * 100) : null;

  return {
    sessionId: session.id,
    symbol: session.symbol,
    fundingRate: session.fundingRate || 0,
    fundingPaymentTime: session.fundingPaymentTime,

    priceAtFunding,
    priceAt5s,
    priceAt10s,
    priceAt15s,
    priceAt20s,
    priceAt25s,
    priceAt30s,

    change_0_to_5s,
    change_5s_to_10s,
    change_10s_to_15s,
    change_15s_to_20s,
    change_20s_to_25s,
    change_25s_to_30s,

    cumulative_0_to_5s,
    cumulative_0_to_10s,
    cumulative_0_to_15s,
    cumulative_0_to_20s,
    cumulative_0_to_25s,
    cumulative_0_to_30s,

    totalDataPoints: dataPoints.length
  };
}

/**
 * Helper functions
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function formatChange(change: number | null): string {
  if (change === null) return 'N/A';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(4)}%`;
}

// Run the analysis
analyzePreciseTiming()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
