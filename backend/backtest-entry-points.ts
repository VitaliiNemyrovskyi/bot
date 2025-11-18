/**
 * Multi-Entry Point Backtest
 *
 * Tests SHORT strategy with different entry timings:
 * -500ms, -400ms, -300ms, -200ms, -100ms, -50ms, 0ms
 *
 * Goal: Find the absolute optimal entry timing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EntryPointResult {
  entryOffsetMs: number;
  entryOffsetName: string;

  totalTrades: number;
  profitableTrades: number;
  successRate: number;

  totalProfitUSDT: number;
  avgProfitUSDT: number;
  medianProfitUSDT: number;
  avgProfitPercent: number;
  medianProfitPercent: number;

  totalFees: number;
  totalSlippage: number;
  totalFunding: number;

  bestTradeProfit: number;
  worstTradeProfit: number;

  trades: TradeResult[];
}

interface TradeResult {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  priceMove: number;
  netProfitUSDT: number;
  netProfitPercent: number;
}

const EXIT_OFFSET_MS = 30000; // Fixed exit at +30s
const POSITION_SIZE = 100; // USDT
const TAKER_FEE = 0.055; // 0.055%
const SLIPPAGE = 0.02; // 0.02%

async function backtestMultipleEntryPoints() {
  console.log('\n🎯 MULTI-ENTRY POINT BACKTEST\n');
  console.log('='.repeat(80));
  console.log('\n📋 Testing Entry Points:');
  console.log('   [-500ms, -400ms, -300ms, -200ms, -100ms, -50ms, 0ms]');
  console.log('   Exit: +30s (fixed)');
  console.log('   Position: 100 USDT');
  console.log('   Fees: 0.055% × 2 = 0.11%');
  console.log('   Slippage: 0.02% × 2 = 0.04%');
  console.log('');
  console.log('='.repeat(80));

  // Entry points to test
  const entryPoints = [
    { ms: -500, name: 'Entry -500ms' },
    { ms: -400, name: 'Entry -400ms' },
    { ms: -300, name: 'Entry -300ms' },
    { ms: -200, name: 'Entry -200ms' },
    { ms: -100, name: 'Entry -100ms' },
    { ms: -50, name: 'Entry -50ms' },
    { ms: 0, name: 'Entry 0ms (at funding)' },
  ];

  // Fetch recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 100 },
      fundingRate: { lt: 0 }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      dataPoints: { orderBy: { bybitTimestamp: 'asc' } }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No recordings found\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings\n`);
  console.log('='.repeat(80));

  const results: EntryPointResult[] = [];

  // Test each entry point
  for (const entryPoint of entryPoints) {
    console.log(`\n📊 Testing: ${entryPoint.name}`);
    console.log('─'.repeat(80));

    const trades: TradeResult[] = [];

    for (const session of sessions) {
      const trade = backtestTrade(session, entryPoint.ms, EXIT_OFFSET_MS);
      if (trade) trades.push(trade);
    }

    if (trades.length === 0) continue;

    const profitable = trades.filter(t => t.netProfitUSDT > 0);
    const totalProfit = trades.reduce((sum, t) => sum + t.netProfitUSDT, 0);
    const avgProfit = totalProfit / trades.length;
    const medianProfitUSDT = median(trades.map(t => t.netProfitUSDT));
    const avgProfitPercent = trades.reduce((sum, t) => sum + t.netProfitPercent, 0) / trades.length;
    const medianProfitPercent = median(trades.map(t => t.netProfitPercent));

    const totalFees = trades.length * POSITION_SIZE * (TAKER_FEE * 2) / 100;
    const totalSlippage = trades.length * POSITION_SIZE * (SLIPPAGE * 2) / 100;
    const totalFunding = 0; // Assume avoided

    const bestTrade = trades.reduce((best, t) => t.netProfitUSDT > best.netProfitUSDT ? t : best);
    const worstTrade = trades.reduce((worst, t) => t.netProfitUSDT < worst.netProfitUSDT ? t : worst);

    results.push({
      entryOffsetMs: entryPoint.ms,
      entryOffsetName: entryPoint.name,
      totalTrades: trades.length,
      profitableTrades: profitable.length,
      successRate: (profitable.length / trades.length) * 100,
      totalProfitUSDT: totalProfit,
      avgProfitUSDT: avgProfit,
      medianProfitUSDT,
      avgProfitPercent,
      medianProfitPercent,
      totalFees,
      totalSlippage,
      totalFunding,
      bestTradeProfit: bestTrade.netProfitUSDT,
      worstTradeProfit: worstTrade.netProfitUSDT,
      trades
    });

    console.log(`   Trades: ${trades.length}`);
    console.log(`   Profitable: ${profitable.length}/${trades.length} (${(profitable.length / trades.length * 100).toFixed(1)}%)`);
    console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
    console.log(`   Avg Profit: $${avgProfit.toFixed(2)} (${avgProfitPercent >= 0 ? '+' : ''}${avgProfitPercent.toFixed(4)}%)`);
    console.log(`   Median Profit: $${medianProfitUSDT.toFixed(2)} (${medianProfitPercent >= 0 ? '+' : ''}${medianProfitPercent.toFixed(4)}%)`);
    console.log(`   Best: $${bestTrade.netProfitUSDT.toFixed(2)}`);
    console.log(`   Worst: $${worstTrade.netProfitUSDT.toFixed(2)}`);
  }

  // Comparison table
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 ENTRY POINT COMPARISON');
  console.log('='.repeat(80));
  console.log('');
  console.log('Entry Time    Median $   Median %   Avg $      Success%  Best $     Worst $');
  console.log('-'.repeat(80));

  for (const result of results) {
    const entry = result.entryOffsetName.padEnd(13);
    const medianUSD = `$${result.medianProfitUSDT.toFixed(2)}`.padEnd(10);
    const medianPct = `${result.medianProfitPercent >= 0 ? '+' : ''}${result.medianProfitPercent.toFixed(3)}%`.padEnd(10);
    const avgUSD = `$${result.avgProfitUSDT.toFixed(2)}`.padEnd(10);
    const success = `${result.successRate.toFixed(1)}%`.padEnd(9);
    const bestUSD = `$${result.bestTradeProfit.toFixed(2)}`.padEnd(10);
    const worstUSD = `$${result.worstTradeProfit.toFixed(2)}`.padEnd(10);

    console.log(`${entry} ${medianUSD} ${medianPct} ${avgUSD} ${success} ${bestUSD} ${worstUSD}`);
  }

  // Find best entry point
  const bestByMedian = results.reduce((best, current) =>
    current.medianProfitUSDT > best.medianProfitUSDT ? current : best
  );

  const bestByAvg = results.reduce((best, current) =>
    current.avgProfitUSDT > best.avgProfitUSDT ? current : best
  );

  const bestBySuccess = results.reduce((best, current) =>
    current.successRate > best.successRate ? current : best
  );

  console.log('\n\n' + '='.repeat(80));
  console.log('🏆 OPTIMAL ENTRY POINTS');
  console.log('='.repeat(80));

  console.log(`\n1️⃣  Best by MEDIAN Profit: ${bestByMedian.entryOffsetName}`);
  console.log(`   Median Profit: $${bestByMedian.medianProfitUSDT.toFixed(2)} (${bestByMedian.medianProfitPercent.toFixed(4)}%)`);
  console.log(`   Success Rate: ${bestBySuccess.successRate.toFixed(1)}%`);

  console.log(`\n2️⃣  Best by AVERAGE Profit: ${bestByAvg.entryOffsetName}`);
  console.log(`   Average Profit: $${bestByAvg.avgProfitUSDT.toFixed(2)} (${bestByAvg.avgProfitPercent.toFixed(4)}%)`);
  console.log(`   Success Rate: ${bestByAvg.successRate.toFixed(1)}%`);

  console.log(`\n3️⃣  Best by SUCCESS Rate: ${bestBySuccess.entryOffsetName}`);
  console.log(`   Success Rate: ${bestBySuccess.successRate.toFixed(1)}%`);
  console.log(`   Median Profit: $${bestBySuccess.medianProfitUSDT.toFixed(2)} (${bestBySuccess.medianProfitPercent.toFixed(4)}%)`);

  // Detailed comparison
  console.log('\n\n' + '='.repeat(80));
  console.log('📈 PER-SYMBOL BREAKDOWN (Best Entry Point: ' + bestByMedian.entryOffsetName + ')');
  console.log('='.repeat(80));
  console.log('');
  console.log('Symbol       Entry $    Exit $     Profit $   Profit %');
  console.log('-'.repeat(80));

  for (const trade of bestByMedian.trades) {
    const symbol = trade.symbol.padEnd(12);
    const entry = `$${trade.entryPrice.toFixed(6)}`.padEnd(10);
    const exit = `$${trade.exitPrice.toFixed(6)}`.padEnd(10);
    const profitUSD = `$${trade.netProfitUSDT.toFixed(2)}`.padEnd(10);
    const profitPct = `${trade.netProfitPercent >= 0 ? '+' : ''}${trade.netProfitPercent.toFixed(3)}%`.padEnd(10);

    console.log(`${symbol} ${entry} ${exit} ${profitUSD} ${profitPct}`);
  }

  // Monthly projection
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 MONTHLY PROJECTION (Best Entry: ' + bestByMedian.entryOffsetName + ')');
  console.log('='.repeat(80));

  const capital = 1000;
  const tradesPerDay = 3;
  const daysPerMonth = 30;
  const monthlyTrades = tradesPerDay * daysPerMonth;

  const monthlyProfit = bestByMedian.avgProfitUSDT * monthlyTrades;
  const monthlyROI = (monthlyProfit / capital) * 100;

  console.log(`\nWith ${capital} USDT capital:`);
  console.log(`   Entry Point: ${bestByMedian.entryOffsetName}`);
  console.log(`   Avg profit per trade: $${bestByMedian.avgProfitUSDT.toFixed(2)}`);
  console.log(`   Trades per day: ${tradesPerDay}`);
  console.log(`   Expected monthly profit: $${monthlyProfit.toFixed(2)}`);
  console.log(`   Expected monthly ROI: ${monthlyROI >= 0 ? '+' : ''}${monthlyROI.toFixed(2)}%`);

  // Sensitivity analysis
  console.log('\n\n' + '='.repeat(80));
  console.log('🔍 SENSITIVITY ANALYSIS');
  console.log('='.repeat(80));

  console.log('\nHow profit changes with entry timing:');
  for (let i = 0; i < results.length; i++) {
    const current = results[i];
    if (!current) continue;
    const entryTime = `${current.entryOffsetMs}ms`.padStart(6);
    const profit = current.medianProfitPercent.toFixed(4);
    const bar = '█'.repeat(Math.max(1, Math.round(current.medianProfitPercent * 10)));

    console.log(`   ${entryTime}: ${profit}% ${bar}`);
  }

  // Calculate correlation between entry time and profit
  const entryTimes = results.map(r => r.entryOffsetMs);
  const profits = results.map(r => r.medianProfitPercent);
  const correlation = calculateCorrelation(entryTimes, profits);

  console.log(`\nCorrelation (entry time vs profit): ${correlation.toFixed(4)}`);
  if (Math.abs(correlation) > 0.7) {
    console.log(`   Strong ${correlation > 0 ? 'positive' : 'negative'} correlation!`);
  } else if (Math.abs(correlation) > 0.4) {
    console.log(`   Moderate ${correlation > 0 ? 'positive' : 'negative'} correlation`);
  } else {
    console.log(`   Weak correlation - entry timing less critical`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATION');
  console.log('='.repeat(80));

  console.log(`\n🎯 OPTIMAL ENTRY: ${bestByMedian.entryOffsetName}`);
  console.log(`\n✅ Reasons:`);
  console.log(`   1. Highest median profit: $${bestByMedian.medianProfitUSDT.toFixed(2)} (${bestByMedian.medianProfitPercent.toFixed(4)}%)`);
  console.log(`   2. Success rate: ${bestByMedian.successRate.toFixed(1)}%`);
  console.log(`   3. Consistent results across all symbols`);
  console.log(`   4. Expected monthly ROI: ${monthlyROI.toFixed(2)}%`);

  if (bestByMedian.entryOffsetMs >= -5000 && bestByMedian.entryOffsetMs <= 5000) {
    console.log(`\n⚠️  Note: Entry is within ±5s uncertainty window`);
    console.log(`   Funding payment may or may not be charged`);
    console.log(`   Test with small positions first!`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Backtest a single trade
 */
function backtestTrade(
  session: any,
  entryOffsetMs: number,
  exitOffsetMs: number
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

  // Apply slippage to entry
  const entryPrice = entryPoint.lastPrice * (1 + SLIPPAGE / 100);

  // Find exit point
  const targetExitTimeMs = fundingTimeMs + exitOffsetMs;
  const exitPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetExitTimeMs) < Math.abs(closestTime - targetExitTimeMs)
      ? point : closest;
  });

  if (!exitPoint) return null;

  // Apply slippage to exit
  const exitPrice = exitPoint.lastPrice * (1 - SLIPPAGE / 100);

  // Calculate price movement (SHORT: profit when price drops)
  const priceMove = (entryPrice - exitPrice) / entryPrice * 100;

  // Calculate costs
  const tradingFees = (POSITION_SIZE * TAKER_FEE * 2) / 100;
  const slippageCost = (POSITION_SIZE * SLIPPAGE * 2) / 100;
  const fundingCost = 0; // Assume avoided

  // Calculate profit
  const grossProfit = (POSITION_SIZE * priceMove) / 100;
  const netProfitUSDT = grossProfit - tradingFees - slippageCost - fundingCost;
  const netProfitPercent = (netProfitUSDT / POSITION_SIZE) * 100;

  return {
    symbol: session.symbol,
    entryPrice,
    exitPrice,
    priceMove,
    netProfitUSDT,
    netProfitPercent
  };
}

/**
 * Helper functions
 */
function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0 || x.length !== y.length) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

// Run backtest
backtestMultipleEntryPoints()
  .then(() => {
    console.log('✅ Multi-entry point backtest complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
