/**
 * Early Exit Strategy Analyzer
 *
 * Tests strategy: Enter LONG 20s before funding, exit BEFORE major drop
 * Goal: Receive funding payment + avoid price drop
 *
 * Key constraint: Must hold position through funding time (±5s uncertainty)
 * to guarantee receiving funding payment
 *
 * Exit timing tests:
 * 1. Exit at -10s (before uncertainty window) - might miss funding
 * 2. Exit at -5s (start of uncertainty) - uncertain if receive funding
 * 3. Exit at 0s (exactly at funding) - uncertain
 * 4. Exit at +5s (end of uncertainty) - should receive funding
 * 5. Exit at +10s (after uncertainty) - definitely receive funding
 * 6. Exit at +15s, +20s, +25s (testing later exits)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExitTimingResult {
  exitTimeMs: number;
  exitTimeName: string;

  avgPriceMove: number;
  medianPriceMove: number;
  avgFunding: number;
  avgNetProfit: number;
  medianNetProfit: number;

  profitableCount: number;
  totalCount: number;
  successRate: number;

  avgDrawdown: number;
  medianDrawdown: number;
  stopLossCount: number;

  fundingGuaranteed: boolean; // Based on Bybit rules
}

interface TradeResult {
  symbol: string;
  fundingRate: number;
  entryPrice: number;
  exitPrice: number;
  priceMove: number;
  fundingReceived: number;
  netProfit: number;
  maxDrawdown: number;
  wouldHitStopLoss: boolean;
}

async function analyzeEarlyExitStrategy() {
  console.log('\n📊 EARLY EXIT STRATEGY ANALYZER\n');
  console.log('='.repeat(80));
  console.log('\n🎯 Strategy: Enter LONG -20s, Exit at various times to avoid drop');
  console.log('   Goal: Receive funding payment + minimize price risk\n');
  console.log('='.repeat(80));

  // Fetch completed recordings with negative funding
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 100 },
      fundingRate: { lt: 0 }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      dataPoints: { orderBy: { bybitTimestamp: 'asc' } }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No recordings found\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings to analyze\n`);
  console.log('='.repeat(80));

  // Test different exit timings
  const exitTimings = [
    { ms: -10000, name: 'Exit -10s (before uncertainty)', guaranteed: false },
    { ms: -5000, name: 'Exit -5s (uncertainty start)', guaranteed: false },
    { ms: 0, name: 'Exit 0s (at funding)', guaranteed: false },
    { ms: 5000, name: 'Exit +5s (uncertainty end)', guaranteed: true },
    { ms: 10000, name: 'Exit +10s', guaranteed: true },
    { ms: 15000, name: 'Exit +15s', guaranteed: true },
    { ms: 20000, name: 'Exit +20s', guaranteed: true },
    { ms: 25000, name: 'Exit +25s', guaranteed: true },
  ];

  const allResults: ExitTimingResult[] = [];

  for (const timing of exitTimings) {
    console.log(`\n📍 Testing: ${timing.name}`);
    console.log('─'.repeat(80));

    const tradeResults: TradeResult[] = [];

    for (const session of sessions) {
      const result = analyzeSessionWithExit(session, timing.ms);
      if (result) {
        tradeResults.push(result);
      }
    }

    if (tradeResults.length === 0) continue;

    const profitable = tradeResults.filter(r => r.netProfit > 0);
    const stopLosses = tradeResults.filter(r => r.wouldHitStopLoss);

    const avgPriceMove = average(tradeResults.map(r => r.priceMove));
    const medianPriceMove = median(tradeResults.map(r => r.priceMove));
    const avgFunding = average(tradeResults.map(r => r.fundingReceived));
    const avgNetProfit = average(tradeResults.map(r => r.netProfit));
    const medianNetProfit = median(tradeResults.map(r => r.netProfit));
    const avgDrawdown = average(tradeResults.map(r => r.maxDrawdown));
    const medianDrawdown = median(tradeResults.map(r => r.maxDrawdown));

    console.log(`   Trades: ${tradeResults.length}`);
    console.log(`   Profitable: ${profitable.length}/${tradeResults.length} (${(profitable.length / tradeResults.length * 100).toFixed(1)}%)`);
    console.log(`   Avg Price Move: ${avgPriceMove >= 0 ? '+' : ''}${avgPriceMove.toFixed(4)}%`);
    console.log(`   Median Price Move: ${medianPriceMove >= 0 ? '+' : ''}${medianPriceMove.toFixed(4)}%`);
    console.log(`   Avg Funding: +${avgFunding.toFixed(4)}%`);
    console.log(`   Avg Net Profit: ${avgNetProfit >= 0 ? '+' : ''}${avgNetProfit.toFixed(4)}%`);
    console.log(`   Median Net Profit: ${medianNetProfit >= 0 ? '+' : ''}${medianNetProfit.toFixed(4)}%`);
    console.log(`   Avg Drawdown: ${avgDrawdown.toFixed(4)}%`);
    console.log(`   Stop Losses: ${stopLosses.length}/${tradeResults.length} (${(stopLosses.length / tradeResults.length * 100).toFixed(1)}%)`);
    console.log(`   Funding Guaranteed: ${timing.guaranteed ? '✅ YES' : '⚠️  NO'}`);

    allResults.push({
      exitTimeMs: timing.ms,
      exitTimeName: timing.name,
      avgPriceMove,
      medianPriceMove,
      avgFunding,
      avgNetProfit,
      medianNetProfit,
      profitableCount: profitable.length,
      totalCount: tradeResults.length,
      successRate: profitable.length / tradeResults.length * 100,
      avgDrawdown,
      medianDrawdown,
      stopLossCount: stopLosses.length,
      fundingGuaranteed: timing.guaranteed,
    });
  }

  // Summary comparison
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 EXIT TIMING COMPARISON');
  console.log('='.repeat(80));
  console.log('');
  console.log('Exit Time         Median Net%  Success%  Drawdown%  SL%   Guaranteed');
  console.log('-'.repeat(80));

  for (const result of allResults) {
    const exitTime = result.exitTimeName.padEnd(17);
    const netProfit = `${result.medianNetProfit >= 0 ? '+' : ''}${result.medianNetProfit.toFixed(3)}%`.padEnd(12);
    const success = `${result.successRate.toFixed(1)}%`.padEnd(9);
    const drawdown = `${result.medianDrawdown.toFixed(3)}%`.padEnd(10);
    const stopLoss = `${(result.stopLossCount / result.totalCount * 100).toFixed(1)}%`.padEnd(5);
    const guaranteed = result.fundingGuaranteed ? '✅ YES' : '⚠️  NO';

    console.log(`${exitTime} ${netProfit} ${success} ${drawdown} ${stopLoss} ${guaranteed}`);
  }

  // Find optimal exit time
  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 OPTIMAL EXIT TIME ANALYSIS');
  console.log('='.repeat(80));

  // Filter to only guaranteed funding exits
  const guaranteedResults = allResults.filter(r => r.fundingGuaranteed);

  if (guaranteedResults.length === 0) {
    console.log('\n⚠️  No guaranteed funding results available');
    return;
  }

  const bestResult = guaranteedResults.reduce((best, current) => {
    // Prefer higher profit with lower stop loss rate
    const bestScore = best.medianNetProfit - (best.stopLossCount / best.totalCount * 100) * 0.1;
    const currentScore = current.medianNetProfit - (current.stopLossCount / current.totalCount * 100) * 0.1;
    return currentScore > bestScore ? current : best;
  });

  console.log(`\n🏆 BEST EXIT TIME: ${bestResult.exitTimeName}`);
  console.log(`   Median Net Profit: ${bestResult.medianNetProfit >= 0 ? '+' : ''}${bestResult.medianNetProfit.toFixed(4)}%`);
  console.log(`   Success Rate: ${bestResult.successRate.toFixed(1)}%`);
  console.log(`   Median Drawdown: ${bestResult.medianDrawdown.toFixed(4)}%`);
  console.log(`   Stop Loss Rate: ${(bestResult.stopLossCount / bestResult.totalCount * 100).toFixed(1)}%`);
  console.log(`   Funding Guaranteed: ✅ YES`);

  // Compare with other strategies
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 STRATEGY COMPARISON');
  console.log('='.repeat(80));

  console.log('\n1️⃣  Early Exit (Best):');
  console.log(`   Entry: -20s, Exit: ${bestResult.exitTimeName}`);
  console.log(`   Median Profit: ${bestResult.medianNetProfit >= 0 ? '+' : ''}${bestResult.medianNetProfit.toFixed(4)}%`);
  console.log(`   Success Rate: ${bestResult.successRate.toFixed(1)}%`);
  console.log(`   Stop Loss Risk: ${(bestResult.stopLossCount / bestResult.totalCount * 100).toFixed(1)}%`);

  console.log('\n2️⃣  Post-Funding (Previous Analysis):');
  console.log(`   Entry: +29s, Exit: at recovery`);
  console.log(`   Median Profit: +0.4723%`);
  console.log(`   Success Rate: 100.0%`);
  console.log(`   Stop Loss Risk: 0.0%`);

  console.log('\n3️⃣  Pre-Funding Hold (Previous Analysis):');
  console.log(`   Entry: -20s, Exit: at recovery`);
  console.log(`   Median Profit: -0.4579%`);
  console.log(`   Success Rate: 37.5%`);
  console.log(`   Stop Loss Risk: 50.0%`);

  console.log('\n\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATION');
  console.log('='.repeat(80));

  if (bestResult.medianNetProfit > 0.4723 && (bestResult.stopLossCount / bestResult.totalCount) < 0.2) {
    console.log(`\n✅ EARLY EXIT STRATEGY IS BEST!`);
    console.log(`   Use: Enter -20s, Exit ${bestResult.exitTimeName}`);
    console.log(`   Median Profit: ${bestResult.medianNetProfit.toFixed(4)}%`);
  } else if (bestResult.medianNetProfit > 0 && bestResult.medianNetProfit < 0.4723) {
    console.log(`\n⚠️  EARLY EXIT IS PROFITABLE BUT POST-FUNDING IS BETTER`);
    console.log(`   Early Exit Profit: ${bestResult.medianNetProfit.toFixed(4)}%`);
    console.log(`   Post-Funding Profit: +0.4723%`);
    console.log(`\n🎯 Recommendation: Use post-funding strategy for better risk/reward`);
  } else {
    console.log(`\n❌ EARLY EXIT STRATEGY NOT RECOMMENDED`);
    console.log(`   Best early exit profit: ${bestResult.medianNetProfit.toFixed(4)}%`);
    console.log(`\n🎯 Use post-funding strategy (+29s entry) instead`);
  }

  // Key insights
  console.log('\n\n' + '='.repeat(80));
  console.log('🔍 KEY INSIGHTS');
  console.log('='.repeat(80));

  const exitPlus5 = allResults.find(r => r.exitTimeMs === 5000);
  const exitPlus10 = allResults.find(r => r.exitTimeMs === 10000);

  if (exitPlus5 && exitPlus10) {
    console.log(`\n📌 Exit +5s (uncertainty end):`);
    console.log(`   Net Profit: ${exitPlus5.medianNetProfit.toFixed(4)}%`);
    console.log(`   This is the EARLIEST guaranteed funding exit`);

    console.log(`\n📌 Exit +10s:`);
    console.log(`   Net Profit: ${exitPlus10.medianNetProfit.toFixed(4)}%`);
    console.log(`   Difference: ${(exitPlus10.medianNetProfit - exitPlus5.medianNetProfit).toFixed(4)}%`);

    if (exitPlus10.medianNetProfit < exitPlus5.medianNetProfit) {
      console.log(`   ⚠️  Price already dropping - exit ASAP after +5s`);
    }
  }

  console.log('\n💡 Bybit Rule Reminder:');
  console.log('   ±5 seconds around funding time = uncertain funding payment');
  console.log('   To GUARANTEE funding receipt: exit at +5s or later');
  console.log('   Earlier exits risk not receiving funding payment');

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Analyze session with specific exit time
 */
function analyzeSessionWithExit(session: any, exitOffsetMs: number): TradeResult | null {
  const dataPoints = session.dataPoints;
  const fundingTimeMs = session.fundingPaymentTime!.getTime();

  // Entry: -20s before funding
  const targetEntryTimeMs = fundingTimeMs - 20000;
  const entryPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetEntryTimeMs) < Math.abs(closestTime - targetEntryTimeMs)
      ? point : closest;
  });

  if (!entryPoint) return null;
  const entryPrice = entryPoint.lastPrice;

  // Exit: at specified offset from funding time
  const targetExitTimeMs = fundingTimeMs + exitOffsetMs;
  const exitPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetExitTimeMs) < Math.abs(closestTime - targetExitTimeMs)
      ? point : closest;
  });

  if (!exitPoint) return null;
  const exitPrice = exitPoint.lastPrice;

  // Calculate price movement
  const priceMove = (exitPrice - entryPrice) / entryPrice * 100;

  // Funding received (only if exit >= +5s to be guaranteed)
  const fundingRate = Math.abs(session.fundingRate || 0);
  const fundingReceived = exitOffsetMs >= 5000 ? fundingRate * 100 : 0;

  const netProfit = fundingReceived + priceMove;

  // Calculate max drawdown between entry and exit
  const pointsBetween = dataPoints.filter((p: any) => {
    const t = Number(p.bybitTimestamp);
    return t >= Number(entryPoint.bybitTimestamp) && t <= Number(exitPoint.bybitTimestamp);
  });

  let maxDrawdown = 0;
  if (pointsBetween.length > 0) {
    const lowestPoint = pointsBetween.reduce((lowest: any, point: any) =>
      point.lastPrice < lowest.lastPrice ? point : lowest
    );
    maxDrawdown = (lowestPoint.lastPrice - entryPrice) / entryPrice * 100;
  }

  const wouldHitStopLoss = maxDrawdown < -2.0;

  return {
    symbol: session.symbol,
    fundingRate: session.fundingRate,
    entryPrice,
    exitPrice,
    priceMove,
    fundingReceived,
    netProfit,
    maxDrawdown,
    wouldHitStopLoss,
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

// Run analysis
analyzeEarlyExitStrategy()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
