/**
 * Pre-Funding SHORT Entry Strategy Analyzer
 *
 * Strategy: Enter SHORT very close to funding time (e.g., -500ms)
 * Goal:
 * 1. Possibly avoid paying funding (±5s uncertainty window)
 * 2. Capture the price drop that happens AFTER funding
 * 3. Exit during the drop or before recovery
 *
 * Key insight: Bybit has ±5 second uncertainty window
 * If we enter at -500ms, we're INSIDE the window, might not pay funding!
 *
 * Tests:
 * - Entry times: -2s, -1s, -500ms, -200ms, 0s, +200ms, +500ms, +1s
 * - Exit times: +5s, +10s, +15s, +20s, +25s, +30s (to capture drop)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ShortStrategyResult {
  entryTimeMs: number;
  entryTimeName: string;
  exitTimeMs: number;
  exitTimeName: string;

  trades: TradeResult[];

  avgPriceMove: number;
  medianPriceMove: number;
  avgFundingPaid: number; // Negative if we pay
  avgNetProfit: number;
  medianNetProfit: number;

  profitableCount: number;
  totalCount: number;
  successRate: number;

  avgMaxGain: number; // Max profit during trade
  medianMaxGain: number;

  fundingLikelyPaid: boolean; // Based on Bybit rules
}

interface TradeResult {
  symbol: string;
  fundingRate: number;
  entryPrice: number;
  exitPrice: number;
  priceMove: number;
  fundingPaid: number; // Negative if paid, 0 if avoided
  netProfit: number;
  maxGainDuringTrade: number;
  maxGainTime: number;
}

async function analyzePreFundingShortStrategy() {
  console.log('\n📊 PRE-FUNDING SHORT ENTRY STRATEGY ANALYZER\n');
  console.log('='.repeat(80));
  console.log('\n🎯 Strategy: Enter SHORT just before funding, capture drop, exit');
  console.log('   Goal: Avoid funding payment + capture drop\n');
  console.log('   Bybit Rule: ±5 second uncertainty window for funding\n');
  console.log('='.repeat(80));

  // Fetch recordings with negative funding (where SHORT would pay LONG)
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 100 },
      fundingRate: { lt: 0 } // Negative funding = SHORT pays LONG
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

  // Test different entry times (ms relative to funding time)
  const entryTimes = [
    { ms: -2000, name: 'Entry -2s', likelyPaid: true },
    { ms: -1000, name: 'Entry -1s', likelyPaid: true },
    { ms: -500, name: 'Entry -500ms ⭐', likelyPaid: false }, // User's suggestion
    { ms: -200, name: 'Entry -200ms', likelyPaid: false },
    { ms: 0, name: 'Entry 0s (at funding)', likelyPaid: false },
    { ms: 200, name: 'Entry +200ms', likelyPaid: false },
    { ms: 500, name: 'Entry +500ms', likelyPaid: false },
    { ms: 1000, name: 'Entry +1s', likelyPaid: true },
  ];

  // Test different exit times (should be AFTER drop happens)
  const exitTimes = [
    { ms: 5000, name: 'Exit +5s' },
    { ms: 10000, name: 'Exit +10s' },
    { ms: 15000, name: 'Exit +15s' },
    { ms: 20000, name: 'Exit +20s' },
    { ms: 25000, name: 'Exit +25s' },
    { ms: 30000, name: 'Exit +30s' },
  ];

  const allResults: ShortStrategyResult[] = [];

  // Test all combinations
  for (const entry of entryTimes) {
    for (const exit of exitTimes) {
      // Skip if exit is before or too close to entry
      if (exit.ms - entry.ms < 3000) continue;

      const trades: TradeResult[] = [];

      for (const session of sessions) {
        const trade = analyzeShortTrade(session, entry.ms, exit.ms, entry.likelyPaid);
        if (trade) trades.push(trade);
      }

      if (trades.length === 0) continue;

      const profitable = trades.filter(t => t.netProfit > 0);
      const avgPriceMove = average(trades.map(t => t.priceMove));
      const medianPriceMove = median(trades.map(t => t.priceMove));
      const avgFundingPaid = average(trades.map(t => t.fundingPaid));
      const avgNetProfit = average(trades.map(t => t.netProfit));
      const medianNetProfit = median(trades.map(t => t.netProfit));
      const avgMaxGain = average(trades.map(t => t.maxGainDuringTrade));
      const medianMaxGain = median(trades.map(t => t.maxGainDuringTrade));

      allResults.push({
        entryTimeMs: entry.ms,
        entryTimeName: entry.name,
        exitTimeMs: exit.ms,
        exitTimeName: exit.name,
        trades,
        avgPriceMove,
        medianPriceMove,
        avgFundingPaid,
        avgNetProfit,
        medianNetProfit,
        profitableCount: profitable.length,
        totalCount: trades.length,
        successRate: profitable.length / trades.length * 100,
        avgMaxGain,
        medianMaxGain,
        fundingLikelyPaid: entry.likelyPaid,
      });
    }
  }

  // Find best results for -500ms entry (user's suggestion)
  console.log('\n' + '='.repeat(80));
  console.log('⭐ ENTRY -500ms ANALYSIS (User\'s Suggestion)');
  console.log('='.repeat(80));

  const minus500Results = allResults.filter(r => r.entryTimeMs === -500);

  if (minus500Results.length > 0) {
    console.log('\n');
    console.log('Exit Time    Median Net%  Success%  Avg Price%  Funding Paid  Max Gain%');
    console.log('-'.repeat(80));

    for (const result of minus500Results) {
      const exit = result.exitTimeName.padEnd(12);
      const netProfit = `${result.medianNetProfit >= 0 ? '+' : ''}${result.medianNetProfit.toFixed(3)}%`.padEnd(12);
      const success = `${result.successRate.toFixed(1)}%`.padEnd(9);
      const priceMove = `${result.avgPriceMove >= 0 ? '+' : ''}${result.avgPriceMove.toFixed(3)}%`.padEnd(11);
      const funding = `${result.avgFundingPaid.toFixed(3)}%`.padEnd(13);
      const maxGain = `${result.medianMaxGain.toFixed(3)}%`.padEnd(10);

      console.log(`${exit} ${netProfit} ${success} ${priceMove} ${funding} ${maxGain}`);
    }

    const best500 = minus500Results.reduce((best, current) =>
      current.medianNetProfit > best.medianNetProfit ? current : best
    );

    console.log(`\n🏆 BEST for -500ms entry:`);
    console.log(`   Exit: ${best500.exitTimeName}`);
    console.log(`   Median Net Profit: ${best500.medianNetProfit >= 0 ? '+' : ''}${best500.medianNetProfit.toFixed(4)}%`);
    console.log(`   Success Rate: ${best500.successRate.toFixed(1)}%`);
    console.log(`   Avg Funding Paid: ${best500.avgFundingPaid.toFixed(4)}%`);
    console.log(`   Median Max Gain: ${best500.medianMaxGain.toFixed(4)}%`);
    console.log(`   Funding Likely Paid: ${best500.fundingLikelyPaid ? '⚠️ YES' : '✅ NO (uncertain)'}`);
  }

  // Compare all entry times (with best exit for each)
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 BEST EXIT FOR EACH ENTRY TIME');
  console.log('='.repeat(80));

  const entryTimesUnique = [...new Set(allResults.map(r => r.entryTimeMs))];
  const bestByEntry: ShortStrategyResult[] = [];

  for (const entryMs of entryTimesUnique) {
    const resultsForEntry = allResults.filter(r => r.entryTimeMs === entryMs);
    const best = resultsForEntry.reduce((best, current) =>
      current.medianNetProfit > best.medianNetProfit ? current : best
    );
    bestByEntry.push(best);
  }

  bestByEntry.sort((a, b) => b.medianNetProfit - a.medianNetProfit);

  console.log('\n');
  console.log('Entry Time        Best Exit    Median Net%  Success%  Funding?');
  console.log('-'.repeat(80));

  for (const result of bestByEntry) {
    const entry = result.entryTimeName.padEnd(17);
    const exit = result.exitTimeName.padEnd(12);
    const netProfit = `${result.medianNetProfit >= 0 ? '+' : ''}${result.medianNetProfit.toFixed(3)}%`.padEnd(12);
    const success = `${result.successRate.toFixed(1)}%`.padEnd(9);
    const funding = result.fundingLikelyPaid ? '⚠️ Likely PAID' : '✅ Maybe AVOIDED';

    console.log(`${entry} ${exit} ${netProfit} ${success} ${funding}`);
  }

  // Find overall best strategy
  console.log('\n\n' + '='.repeat(80));
  console.log('🏆 OPTIMAL SHORT STRATEGY');
  console.log('='.repeat(80));

  const overallBest = allResults.reduce((best, current) =>
    current.medianNetProfit > best.medianNetProfit ? current : best
  );

  console.log(`\n✨ BEST OVERALL:`);
  console.log(`   Entry: ${overallBest.entryTimeName}`);
  console.log(`   Exit: ${overallBest.exitTimeName}`);
  console.log(`   Median Net Profit: ${overallBest.medianNetProfit >= 0 ? '+' : ''}${overallBest.medianNetProfit.toFixed(4)}%`);
  console.log(`   Success Rate: ${overallBest.successRate.toFixed(1)}%`);
  console.log(`   Avg Price Move: ${overallBest.avgPriceMove >= 0 ? '+' : ''}${overallBest.avgPriceMove.toFixed(4)}%`);
  console.log(`   Avg Funding Paid: ${overallBest.avgFundingPaid.toFixed(4)}%`);
  console.log(`   Median Max Gain: ${overallBest.medianMaxGain.toFixed(4)}%`);
  console.log(`   Funding Likely Paid: ${overallBest.fundingLikelyPaid ? '⚠️ YES' : '✅ NO (uncertain)'}`);

  // Strategy comparison
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 STRATEGY COMPARISON');
  console.log('='.repeat(80));

  console.log(`\n1️⃣  Pre-Funding SHORT (Best):`);
  console.log(`   Entry: ${overallBest.entryTimeName}, Exit: ${overallBest.exitTimeName}`);
  console.log(`   Median Profit: ${overallBest.medianNetProfit.toFixed(4)}%`);
  console.log(`   Success Rate: ${overallBest.successRate.toFixed(1)}%`);

  if (minus500Results.length > 0) {
    const best500 = minus500Results.reduce((best, current) =>
      current.medianNetProfit > best.medianNetProfit ? current : best
    );

    console.log(`\n2️⃣  Pre-Funding SHORT -500ms (User's idea):`);
    console.log(`   Entry: -500ms, Exit: ${best500.exitTimeName}`);
    console.log(`   Median Profit: ${best500.medianNetProfit.toFixed(4)}%`);
    console.log(`   Success Rate: ${best500.successRate.toFixed(1)}%`);
  }

  console.log(`\n3️⃣  Post-Funding LONG (Previous Analysis):`);
  console.log(`   Entry: +29s, Exit: at recovery`);
  console.log(`   Median Profit: +0.4723%`);
  console.log(`   Success Rate: 100.0%`);

  console.log(`\n4️⃣  Pre-Funding LONG Early Exit:`);
  console.log(`   Entry: -20s, Exit: +5s`);
  console.log(`   Median Profit: +0.2060%`);
  console.log(`   Success Rate: 50.0%`);

  // Recommendation
  console.log('\n\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATION');
  console.log('='.repeat(80));

  if (overallBest.medianNetProfit > 0.4723) {
    console.log(`\n✅ PRE-FUNDING SHORT STRATEGY IS BEST!`);
    console.log(`   Highest profit: ${overallBest.medianNetProfit.toFixed(4)}%`);
    console.log(`   Entry: ${overallBest.entryTimeName}`);
    console.log(`   Exit: ${overallBest.exitTimeName}`);
  } else if (overallBest.medianNetProfit > 0.2) {
    console.log(`\n⚠️  PRE-FUNDING SHORT IS GOOD BUT NOT BEST`);
    console.log(`   SHORT profit: ${overallBest.medianNetProfit.toFixed(4)}%`);
    console.log(`   LONG profit: +0.4723%`);
    console.log(`\n   Consider risk/reward before choosing`);
  } else {
    console.log(`\n❌ PRE-FUNDING SHORT NOT RECOMMENDED`);
    console.log(`   Best SHORT profit: ${overallBest.medianNetProfit.toFixed(4)}%`);
    console.log(`\n🎯 Use post-funding LONG strategy instead (+0.4723%)`);
  }

  // Key insights
  console.log('\n\n' + '='.repeat(80));
  console.log('🔍 KEY INSIGHTS');
  console.log('='.repeat(80));

  // Check funding payment pattern
  const uncertaintyResults = allResults.filter(r =>
    r.entryTimeMs >= -5000 && r.entryTimeMs <= 5000
  );

  if (uncertaintyResults.length > 0) {
    const avgFundingInUncertainty = average(uncertaintyResults.map(r => r.avgFundingPaid));

    console.log(`\n📌 Funding Payment in Uncertainty Window (-5s to +5s):`);
    console.log(`   Average Funding Paid: ${avgFundingInUncertainty.toFixed(4)}%`);

    if (Math.abs(avgFundingInUncertainty) < 0.1) {
      console.log(`   ✅ Funding often AVOIDED in uncertainty window!`);
    } else if (Math.abs(avgFundingInUncertainty) < 0.5) {
      console.log(`   ⚠️  Funding PARTIALLY paid in uncertainty window`);
    } else {
      console.log(`   ❌ Funding still PAID even in uncertainty window`);
    }
  }

  console.log('\n💡 Note about funding:');
  console.log('   - Script assumes funding IS paid if entry < -5s or > +5s');
  console.log('   - Script assumes funding MIGHT BE AVOIDED if -5s ≤ entry ≤ +5s');
  console.log('   - Real Bybit behavior may vary - test with small positions first!');

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Analyze a single SHORT trade
 */
function analyzeShortTrade(
  session: any,
  entryOffsetMs: number,
  exitOffsetMs: number,
  fundingLikelyPaid: boolean
): TradeResult | null {
  const dataPoints = session.dataPoints;
  const fundingTimeMs = session.fundingPaymentTime!.getTime();

  // Find entry point
  const targetEntryTimeMs = fundingTimeMs + entryOffsetMs;
  const entryPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetEntryTimeMs) < Math.abs(closestTime - targetEntryTimeMs)
      ? point : closest;
  });

  if (!entryPoint) return null;
  const entryPrice = entryPoint.lastPrice;

  // Find exit point
  const targetExitTimeMs = fundingTimeMs + exitOffsetMs;
  const exitPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetExitTimeMs) < Math.abs(closestTime - targetExitTimeMs)
      ? point : closest;
  });

  if (!exitPoint) return null;
  const exitPrice = exitPoint.lastPrice;

  // For SHORT: profit when price drops
  const priceMove = (entryPrice - exitPrice) / entryPrice * 100;

  // Funding paid (negative = we pay, positive = we receive)
  // For SHORT with negative funding rate: we PAY (unless in uncertainty window)
  const fundingRate = session.fundingRate || 0; // Already negative
  const fundingPaid = fundingLikelyPaid ? fundingRate * 100 : 0; // Negative value = cost

  const netProfit = priceMove + fundingPaid; // fundingPaid is negative if we pay

  // Find max gain during trade (for SHORT = max price drop)
  const pointsDuring = dataPoints.filter((p: any) => {
    const t = Number(p.bybitTimestamp);
    return t >= Number(entryPoint.bybitTimestamp) && t <= Number(exitPoint.bybitTimestamp);
  });

  let maxGainDuringTrade = 0;
  let maxGainTime = 0;

  if (pointsDuring.length > 0) {
    const lowestPoint = pointsDuring.reduce((lowest: any, point: any) =>
      point.lastPrice < lowest.lastPrice ? point : lowest
    );
    maxGainDuringTrade = (entryPrice - lowestPoint.lastPrice) / entryPrice * 100;
    maxGainTime = Number(lowestPoint.bybitTimestamp) - fundingTimeMs;
  }

  return {
    symbol: session.symbol,
    fundingRate: session.fundingRate,
    entryPrice,
    exitPrice,
    priceMove,
    fundingPaid,
    netProfit,
    maxGainDuringTrade,
    maxGainTime,
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
analyzePreFundingShortStrategy()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
