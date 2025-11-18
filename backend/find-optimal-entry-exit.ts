/**
 * COMPREHENSIVE OPTIMAL ENTRY/EXIT FINDER
 *
 * This script tests ALL possible entry/exit combinations across the FULL data range
 * to find the truly optimal strategy based on real recorded data.
 *
 * Approach:
 * 1. Load all recording sessions with data points
 * 2. For each session, sample prices at every second from -10s to +60s
 * 3. Test EVERY combination of entry/exit times
 * 4. Calculate net profit after fees (0.11%) and slippage (0.04%)
 * 5. Find the combination with highest average return and best risk metrics
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TradeResult {
  entryTimeOffset: number; // seconds relative to funding (negative = before)
  exitTimeOffset: number;  // seconds relative to funding
  entryPrice: number;
  exitPrice: number;
  grossReturn: number; // % before fees
  fundingCost: number; // % cost from funding payment (if crossing funding time)
  netReturn: number;   // % after fees, slippage, and funding
  sessionId: string;
  symbol: string;
  fundingRate: number; // Original funding rate from session
}

interface StrategyStats {
  entryOffset: number;
  exitOffset: number;

  // Return statistics
  avgNetReturn: number;
  medianNetReturn: number;
  minNetReturn: number;
  maxNetReturn: number;
  stdDevReturn: number;

  // Risk metrics
  winRate: number; // % of profitable trades
  profitFactor: number; // sum(wins) / sum(losses)
  sharpeRatio: number;

  // Trade details
  totalTrades: number;
  profitableTrades: number;
  losingTrades: number;

  // All individual results
  trades: TradeResult[];
}

// Constants
const MAKER_FEE = 0.055; // 0.055% Bybit maker fee
const TAKER_FEE = 0.055; // 0.055% Bybit taker fee
const SLIPPAGE = 0.04;   // 0.04% realistic slippage
const TOTAL_COST = (MAKER_FEE + TAKER_FEE + SLIPPAGE) / 100; // 0.00154 = 0.154%

async function findOptimalEntryExit() {
  console.log('\n🔍 COMPREHENSIVE OPTIMAL ENTRY/EXIT FINDER\n');
  console.log('='.repeat(80));
  console.log(`Trading costs: ${(TOTAL_COST * 100).toFixed(3)}% per round trip`);
  console.log('='.repeat(80));

  // Fetch all completed recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 50 }
    },
    orderBy: { createdAt: 'desc' },
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

  console.log(`\n✅ Found ${sessions.length} recording sessions`);

  // Calculate total data points
  const totalDataPoints = sessions.reduce((sum, s) => sum + s.dataPoints.length, 0);
  console.log(`📊 Total data points: ${totalDataPoints.toLocaleString()}`);

  // Determine time range available in data
  let minTimeOffset = 0;
  let maxTimeOffset = 0;

  for (const session of sessions) {
    if (!session.fundingPaymentTime || session.dataPoints.length === 0) continue;

    const fundingTimeMs = session.fundingPaymentTime.getTime();
    const offsets = session.dataPoints.map((dp: any) => {
      const dpTime = Number(dp.bybitTimestamp);
      return (dpTime - fundingTimeMs) / 1000; // Convert to seconds
    });

    minTimeOffset = Math.min(minTimeOffset, ...offsets);
    maxTimeOffset = Math.max(maxTimeOffset, ...offsets);
  }

  console.log(`⏱️  Time range: ${minTimeOffset.toFixed(1)}s to +${maxTimeOffset.toFixed(1)}s`);
  console.log('='.repeat(80));

  // Define search space (test every second in available range)
  const entryTimes: number[] = [];
  const exitTimes: number[] = [];

  // Entry times: from minTimeOffset to +10s (in 1-second increments)
  for (let t = Math.ceil(minTimeOffset); t <= Math.min(10, maxTimeOffset); t += 1) {
    entryTimes.push(t);
  }

  // Exit times: from -5s to maxTimeOffset (in 1-second increments)
  for (let t = Math.max(-5, Math.ceil(minTimeOffset)); t <= maxTimeOffset; t += 1) {
    exitTimes.push(t);
  }

  console.log(`\n🔬 Testing ${entryTimes.length} entry times × ${exitTimes.length} exit times = ${entryTimes.length * exitTimes.length} combinations`);
  console.log(`   Entry times: ${Math.min(...entryTimes)}s to ${Math.max(...entryTimes)}s`);
  console.log(`   Exit times: ${Math.min(...exitTimes)}s to ${Math.max(...exitTimes)}s`);
  console.log('\n⏳ This may take a few minutes...\n');
  console.log('='.repeat(80));

  // Test all combinations
  const allStrategies: StrategyStats[] = [];
  let testedCombinations = 0;
  const totalCombinations = entryTimes.length * exitTimes.length;

  for (const entryOffset of entryTimes) {
    for (const exitOffset of exitTimes) {
      // Skip invalid combinations (exit before entry, or exit = entry)
      if (exitOffset <= entryOffset) continue;

      // Skip very short trades (<1 second) as unrealistic
      if (exitOffset - entryOffset < 1) continue;

      const trades: TradeResult[] = [];

      // Test this strategy on all sessions
      for (const session of sessions) {
        const trade = simulateTrade(session, entryOffset, exitOffset);
        if (trade) {
          trades.push(trade);
        }
      }

      if (trades.length >= 5) { // Need at least 5 trades for meaningful stats
        const stats = calculateStrategyStats(entryOffset, exitOffset, trades);
        allStrategies.push(stats);
      }

      testedCombinations++;

      // Progress update every 1000 combinations
      if (testedCombinations % 1000 === 0) {
        const progress = (testedCombinations / totalCombinations * 100).toFixed(1);
        console.log(`   Tested ${testedCombinations.toLocaleString()} / ${totalCombinations.toLocaleString()} (${progress}%)`);
      }
    }
  }

  console.log('\n='.repeat(80));
  console.log(`✅ Testing complete: ${allStrategies.length} valid strategies found`);
  console.log('='.repeat(80));

  // Rank strategies by different criteria
  console.log('\n\n📊 TOP 20 STRATEGIES BY AVERAGE NET RETURN:\n');
  console.log('Rank  Entry   Exit    Avg Net%  Median%   Min%     Max%     WinRate  Sharpe  Trades');
  console.log('-'.repeat(95));

  const byAvgReturn = [...allStrategies].sort((a, b) => b.avgNetReturn - a.avgNetReturn).slice(0, 20);

  byAvgReturn.forEach((s, i) => {
    const rank = `${i + 1}.`.padEnd(6);
    const entry = formatTime(s.entryOffset).padEnd(8);
    const exit = formatTime(s.exitOffset).padEnd(8);
    const avg = formatPercent(s.avgNetReturn).padEnd(10);
    const median = formatPercent(s.medianNetReturn).padEnd(9);
    const min = formatPercent(s.minNetReturn).padEnd(9);
    const max = formatPercent(s.maxNetReturn).padEnd(9);
    const winRate = `${s.winRate.toFixed(0)}%`.padEnd(9);
    const sharpe = s.sharpeRatio.toFixed(2).padEnd(8);
    const trades = s.totalTrades.toString();

    console.log(`${rank}${entry}${exit}${avg}${median}${min}${max}${winRate}${sharpe}${trades}`);
  });

  // Find best by Sharpe ratio (risk-adjusted)
  console.log('\n\n📊 TOP 20 STRATEGIES BY SHARPE RATIO (Risk-Adjusted):\n');
  console.log('Rank  Entry   Exit    Sharpe  Avg Net%  WinRate  StdDev%  Trades');
  console.log('-'.repeat(80));

  const bySharpe = [...allStrategies]
    .filter(s => s.sharpeRatio > 0 && s.totalTrades >= 10) // Only positive Sharpe with enough data
    .sort((a, b) => b.sharpeRatio - a.sharpeRatio)
    .slice(0, 20);

  bySharpe.forEach((s, i) => {
    const rank = `${i + 1}.`.padEnd(6);
    const entry = formatTime(s.entryOffset).padEnd(8);
    const exit = formatTime(s.exitOffset).padEnd(8);
    const sharpe = s.sharpeRatio.toFixed(2).padEnd(8);
    const avg = formatPercent(s.avgNetReturn).padEnd(10);
    const winRate = `${s.winRate.toFixed(0)}%`.padEnd(9);
    const stdDev = formatPercent(s.stdDevReturn).padEnd(9);
    const trades = s.totalTrades.toString();

    console.log(`${rank}${entry}${exit}${sharpe}${avg}${winRate}${stdDev}${trades}`);
  });

  // Find most consistent (highest win rate with decent returns)
  console.log('\n\n📊 TOP 20 MOST CONSISTENT STRATEGIES (Win Rate + Returns):\n');
  console.log('Rank  Entry   Exit    WinRate  Avg Net%  Median%  Sharpe  Trades');
  console.log('-'.repeat(80));

  const byConsistency = [...allStrategies]
    .filter(s => s.avgNetReturn > 0 && s.totalTrades >= 10)
    .sort((a, b) => {
      // Score = WinRate * AvgReturn (favors both high win rate and good returns)
      const scoreA = a.winRate * a.avgNetReturn;
      const scoreB = b.winRate * b.avgNetReturn;
      return scoreB - scoreA;
    })
    .slice(0, 20);

  byConsistency.forEach((s, i) => {
    const rank = `${i + 1}.`.padEnd(6);
    const entry = formatTime(s.entryOffset).padEnd(8);
    const exit = formatTime(s.exitOffset).padEnd(8);
    const winRate = `${s.winRate.toFixed(0)}%`.padEnd(9);
    const avg = formatPercent(s.avgNetReturn).padEnd(10);
    const median = formatPercent(s.medianNetReturn).padEnd(9);
    const sharpe = s.sharpeRatio.toFixed(2).padEnd(8);
    const trades = s.totalTrades.toString();

    console.log(`${rank}${entry}${exit}${winRate}${avg}${median}${sharpe}${trades}`);
  });

  // FINAL RECOMMENDATION
  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 FINAL RECOMMENDATION - OPTIMAL STRATEGY');
  console.log('='.repeat(80));

  // Choose best strategy (balance of return, Sharpe, and win rate)
  const topCandidates = [...allStrategies]
    .filter(s =>
      s.totalTrades >= 10 &&
      s.avgNetReturn > 0 &&
      s.winRate >= 60 &&
      s.sharpeRatio > 0
    )
    .sort((a, b) => {
      // Composite score: (AvgReturn * WinRate * Sharpe) / StdDev
      const scoreA = (a.avgNetReturn * a.winRate * a.sharpeRatio) / (a.stdDevReturn + 0.01);
      const scoreB = (b.avgNetReturn * b.winRate * b.sharpeRatio) / (b.stdDevReturn + 0.01);
      return scoreB - scoreA;
    });

  if (topCandidates.length === 0) {
    console.log('\n⚠️  WARNING: No strategy meets profitability criteria!');
    console.log('   All tested strategies either:');
    console.log('   - Have negative average returns');
    console.log('   - Have win rate < 60%');
    console.log('   - Have insufficient data (<10 trades)');
    console.log('\n💡 This suggests short-term post-funding trades are NOT profitable after fees.');
    console.log('   Consider:');
    console.log('   1. Longer holding periods (analyzing data beyond current range)');
    console.log('   2. Pre-funding SHORT strategies');
    console.log('   3. Different market conditions or symbols');
  } else {
    const best = topCandidates[0];

    console.log(`\n✅ OPTIMAL STRATEGY:`);
    console.log(`   Entry: ${formatTime(best.entryOffset)} (${best.entryOffset >= 0 ? 'after' : 'before'} funding)`);
    console.log(`   Exit:  ${formatTime(best.exitOffset)} (${best.exitOffset >= 0 ? 'after' : 'before'} funding)`);
    console.log(`   Holding Period: ${best.exitOffset - best.entryOffset} seconds`);
    console.log(`   Direction: ${best.entryOffset < 0 ? 'SHORT (enter before funding)' : 'LONG (enter after funding)'}`);

    console.log(`\n📊 Performance Metrics:`);
    console.log(`   Average Net Return: ${formatPercent(best.avgNetReturn)}`);
    console.log(`   Median Net Return: ${formatPercent(best.medianNetReturn)}`);
    console.log(`   Win Rate: ${best.winRate.toFixed(1)}%`);
    console.log(`   Sharpe Ratio: ${best.sharpeRatio.toFixed(2)}`);
    console.log(`   Profit Factor: ${best.profitFactor.toFixed(2)}`);

    console.log(`\n📈 Return Distribution:`);
    console.log(`   Best Trade: ${formatPercent(best.maxNetReturn)}`);
    console.log(`   Worst Trade: ${formatPercent(best.minNetReturn)}`);
    console.log(`   Std Deviation: ${formatPercent(best.stdDevReturn)}`);

    console.log(`\n📋 Trade Statistics:`);
    console.log(`   Total Trades: ${best.totalTrades}`);
    console.log(`   Profitable: ${best.profitableTrades} (${best.winRate.toFixed(1)}%)`);
    console.log(`   Losing: ${best.losingTrades}`);

    // Calculate monthly projections
    const tradesPerDay = 3; // 3 funding times per day
    const daysPerMonth = 30;
    const monthlyTrades = tradesPerDay * daysPerMonth;
    const positionSize = 100; // $100 per trade
    const expectedMonthlyReturn = best.avgNetReturn * monthlyTrades;
    const expectedMonthlyProfit = (positionSize * expectedMonthlyReturn) / 100;

    console.log(`\n💰 Projected Monthly Performance (with $1000 capital):`);
    console.log(`   Position Size: $${positionSize} per trade`);
    console.log(`   Trades per Month: ${monthlyTrades} (${tradesPerDay}×/day × ${daysPerMonth} days)`);
    console.log(`   Expected Monthly Return: ${expectedMonthlyReturn.toFixed(2)}%`);
    console.log(`   Expected Monthly Profit: $${expectedMonthlyProfit.toFixed(2)}`);

    console.log(`\n⚠️  Risk Warnings:`);
    if (best.avgNetReturn < 0.2) {
      console.log(`   ⚠️  Low average return (${formatPercent(best.avgNetReturn)})`);
      console.log(`      Strategy is barely profitable after fees`);
    }
    if (best.winRate < 70) {
      console.log(`   ⚠️  Moderate win rate (${best.winRate.toFixed(1)}%)`);
      console.log(`      ~${(100 - best.winRate).toFixed(0)}% of trades will be losses`);
    }
    if (best.sharpeRatio < 1.5) {
      console.log(`   ⚠️  Low Sharpe ratio (${best.sharpeRatio.toFixed(2)})`);
      console.log(`      Returns may not justify the risk`);
    }
    if (best.totalTrades < 15) {
      console.log(`   ⚠️  Limited sample size (${best.totalTrades} trades)`);
      console.log(`      Collect more data for higher confidence`);
    }
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Simulate a trade on a single session
 */
function simulateTrade(
  session: any,
  entryOffsetSeconds: number,
  exitOffsetSeconds: number
): TradeResult | null {
  if (!session.fundingPaymentTime || session.dataPoints.length === 0) {
    return null;
  }

  const fundingTimeMs = session.fundingPaymentTime.getTime();
  const entryTimeMs = fundingTimeMs + (entryOffsetSeconds * 1000);
  const exitTimeMs = fundingTimeMs + (exitOffsetSeconds * 1000);

  // Find closest data points for entry and exit
  const entryPoint = findClosestPoint(session.dataPoints, entryTimeMs);
  const exitPoint = findClosestPoint(session.dataPoints, exitTimeMs);

  if (!entryPoint || !exitPoint) {
    return null;
  }

  // Verify points are within tolerance (±500ms)
  const entryTimeDiff = Math.abs(Number(entryPoint.bybitTimestamp) - entryTimeMs);
  const exitTimeDiff = Math.abs(Number(exitPoint.bybitTimestamp) - exitTimeMs);

  if (entryTimeDiff > 500 || exitTimeDiff > 500) {
    return null; // Data point too far from target time
  }

  const entryPrice = entryPoint.lastPrice;
  const exitPrice = exitPoint.lastPrice;

  // Calculate returns
  // If entry before funding (negative offset), this is SHORT
  // If entry after funding (positive offset), this is LONG
  let grossReturn: number;
  let fundingCost = 0; // Cost of funding payment (if we cross funding time)

  if (entryOffsetSeconds < 0 && exitOffsetSeconds > 0) {
    // SHORT strategy: enter before funding, exit after
    // WE PAY FUNDING! (negative funding rate means SHORT pays LONG)
    grossReturn = ((entryPrice - exitPrice) / entryPrice) * 100;

    // Funding cost: if funding rate is -1%, SHORT pays 1%
    const fundingRate = session.fundingRate || 0; // Negative value (e.g., -0.01 = -1%)
    fundingCost = Math.abs(fundingRate) * 100; // Convert to positive % cost
  } else if (entryOffsetSeconds >= 0 && exitOffsetSeconds > entryOffsetSeconds) {
    // LONG strategy: both after funding (no funding payment crossed)
    grossReturn = ((exitPrice - entryPrice) / entryPrice) * 100;
    fundingCost = 0; // No funding payment
  } else if (entryOffsetSeconds < 0 && exitOffsetSeconds < 0) {
    // SHORT before funding, exit also before funding (no funding crossed)
    grossReturn = ((entryPrice - exitPrice) / entryPrice) * 100;
    fundingCost = 0; // No funding payment
  } else {
    // Default to LONG calculation
    grossReturn = ((exitPrice - entryPrice) / entryPrice) * 100;
    fundingCost = 0;
  }

  const netReturn = grossReturn - (TOTAL_COST * 100) - fundingCost;

  return {
    entryTimeOffset: entryOffsetSeconds,
    exitTimeOffset: exitOffsetSeconds,
    entryPrice,
    exitPrice,
    grossReturn,
    fundingCost,
    netReturn,
    sessionId: session.id,
    symbol: session.symbol,
    fundingRate: session.fundingRate || 0
  };
}

/**
 * Find closest data point to target time
 */
function findClosestPoint(dataPoints: any[], targetTimeMs: number): any | null {
  if (dataPoints.length === 0) return null;

  return dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetTimeMs) < Math.abs(closestTime - targetTimeMs)
      ? point : closest;
  });
}

/**
 * Calculate statistics for a strategy
 */
function calculateStrategyStats(
  entryOffset: number,
  exitOffset: number,
  trades: TradeResult[]
): StrategyStats {
  const returns = trades.map(t => t.netReturn);
  const profitableTrades = trades.filter(t => t.netReturn > 0);
  const losingTrades = trades.filter(t => t.netReturn <= 0);

  const avgNetReturn = average(returns);
  const medianNetReturn = median(returns);
  const minNetReturn = Math.min(...returns);
  const maxNetReturn = Math.max(...returns);
  const stdDevReturn = standardDeviation(returns);

  const winRate = (profitableTrades.length / trades.length) * 100;

  const sumWins = profitableTrades.reduce((sum, t) => sum + t.netReturn, 0);
  const sumLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.netReturn, 0));
  const profitFactor = sumLosses > 0 ? sumWins / sumLosses : (sumWins > 0 ? 999 : 0);

  const sharpeRatio = stdDevReturn > 0 ? avgNetReturn / stdDevReturn : 0;

  return {
    entryOffset,
    exitOffset,
    avgNetReturn,
    medianNetReturn,
    minNetReturn,
    maxNetReturn,
    stdDevReturn,
    winRate,
    profitFactor,
    sharpeRatio,
    totalTrades: trades.length,
    profitableTrades: profitableTrades.length,
    losingTrades: losingTrades.length,
    trades
  };
}

/**
 * Helper functions
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
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

function standardDeviation(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = average(numbers);
  const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
  const variance = average(squaredDiffs);
  return Math.sqrt(variance);
}

function formatTime(seconds: number): string {
  if (seconds < 0) {
    return `${Math.abs(seconds)}s`;
  } else {
    return `+${seconds}s`;
  }
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
}

// Run the analysis
findOptimalEntryExit()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
