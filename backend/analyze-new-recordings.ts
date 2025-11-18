import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StrategyResult {
  symbol: string;
  exchange: string;
  fundingRate: number;
  entryPrice: number;
  exitPrice: number;
  priceChange: number;
  profitPercent: number;
  netProfitPercent: number;
  entryTime: number;
  exitTime: number;
  dataPointsCount: number;
}

async function analyzeRecordings() {
  // Get latest 5 COMPLETED recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED'
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' }
      }
    }
  });

  console.log(`\n📊 Analyzing ${sessions.length} completed recordings\n`);
  console.log('Strategy: SHORT at +2000ms after funding, EXIT at +15000ms\n');
  console.log('═'.repeat(100));

  const results: StrategyResult[] = [];
  const TRADING_FEES = 0.11; // 0.055% maker + 0.055% taker

  for (const session of sessions) {
    console.log(`\n📝 ${session.symbol} @ ${session.exchange}`);
    console.log(`   Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Total Data Points: ${session.dataPoints.length}`);
    console.log(`   Time Range: ${session.dataPoints[0]?.relativeTimeMs}ms to ${session.dataPoints[session.dataPoints.length - 1]?.relativeTimeMs}ms`);

    if (session.dataPoints.length === 0) {
      console.log(`   ⚠️  No data points - skipping`);
      continue;
    }

    // Find entry point: closest to +2000ms after funding payment
    const ENTRY_TIME = 2000; // +2s after funding
    const EXIT_TIME = 15000; // +15s after funding

    const entryPoint = session.dataPoints.reduce((closest, point) => {
      const currentDiff = Math.abs(point.relativeTimeMs - ENTRY_TIME);
      const closestDiff = Math.abs(closest.relativeTimeMs - ENTRY_TIME);
      return currentDiff < closestDiff ? point : closest;
    });

    // Find exit point: closest to +15000ms after funding payment
    const exitPoint = session.dataPoints.reduce((closest, point) => {
      const currentDiff = Math.abs(point.relativeTimeMs - EXIT_TIME);
      const closestDiff = Math.abs(closest.relativeTimeMs - EXIT_TIME);
      return currentDiff < closestDiff ? point : closest;
    });

    const entryPrice = entryPoint.lastPrice;
    const exitPrice = exitPoint.lastPrice;
    const priceChange = exitPrice - entryPrice;
    const profitPercent = (priceChange / entryPrice) * 100;

    // For SHORT: profit when price goes DOWN
    // We enter SHORT at entryPrice and exit at exitPrice
    // Profit = (entryPrice - exitPrice) / entryPrice * 100
    const shortProfitPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
    const netProfitPercent = shortProfitPercent - TRADING_FEES;

    console.log(`\n   Entry:`);
    console.log(`     Time: ${entryPoint.relativeTimeMs}ms (target: ${ENTRY_TIME}ms)`);
    console.log(`     Price: ${entryPrice}`);

    console.log(`\n   Exit:`);
    console.log(`     Time: ${exitPoint.relativeTimeMs}ms (target: ${EXIT_TIME}ms)`);
    console.log(`     Price: ${exitPrice}`);

    console.log(`\n   Results:`);
    console.log(`     Price Change: ${priceChange > 0 ? '+' : ''}${priceChange.toFixed(8)} (${profitPercent > 0 ? '+' : ''}${profitPercent.toFixed(4)}%)`);
    console.log(`     SHORT Profit (gross): ${shortProfitPercent > 0 ? '+' : ''}${shortProfitPercent.toFixed(4)}%`);
    console.log(`     Trading Fees: -${TRADING_FEES.toFixed(2)}%`);
    console.log(`     NET PROFIT: ${netProfitPercent > 0 ? '+' : ''}${netProfitPercent.toFixed(4)}%`);

    if (netProfitPercent > 0) {
      console.log(`     ✅ PROFITABLE`);
    } else {
      console.log(`     ❌ LOSS`);
    }

    results.push({
      symbol: session.symbol,
      exchange: session.exchange,
      fundingRate: session.fundingRate,
      entryPrice,
      exitPrice,
      priceChange,
      profitPercent: shortProfitPercent,
      netProfitPercent,
      entryTime: entryPoint.relativeTimeMs,
      exitTime: exitPoint.relativeTimeMs,
      dataPointsCount: session.dataPoints.length
    });
  }

  // Summary
  console.log('\n\n' + '═'.repeat(100));
  console.log('\n📈 STRATEGY PERFORMANCE SUMMARY\n');

  const profitable = results.filter(r => r.netProfitPercent > 0);
  const losses = results.filter(r => r.netProfitPercent <= 0);

  const avgProfit = results.reduce((sum, r) => sum + r.netProfitPercent, 0) / results.length;
  const avgProfitableOnly = profitable.length > 0
    ? profitable.reduce((sum, r) => sum + r.netProfitPercent, 0) / profitable.length
    : 0;

  console.log(`Total Trades: ${results.length}`);
  console.log(`Profitable: ${profitable.length} (${(profitable.length / results.length * 100).toFixed(1)}%)`);
  console.log(`Losses: ${losses.length} (${(losses.length / results.length * 100).toFixed(1)}%)`);
  console.log(`\nAverage Profit (all trades): ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}%`);
  console.log(`Average Profit (profitable only): ${avgProfitableOnly > 0 ? '+' : ''}${avgProfitableOnly.toFixed(4)}%`);

  // Best and worst trades
  const bestTrade = results.reduce((best, r) => r.netProfitPercent > best.netProfitPercent ? r : best);
  const worstTrade = results.reduce((worst, r) => r.netProfitPercent < worst.netProfitPercent ? r : worst);

  console.log(`\nBest Trade: ${bestTrade.symbol} @ ${bestTrade.exchange} (${bestTrade.netProfitPercent > 0 ? '+' : ''}${bestTrade.netProfitPercent.toFixed(4)}%)`);
  console.log(`Worst Trade: ${worstTrade.symbol} @ ${worstTrade.exchange} (${worstTrade.netProfitPercent > 0 ? '+' : ''}${worstTrade.netProfitPercent.toFixed(4)}%)`);

  console.log('\n' + '═'.repeat(100) + '\n');

  // Check if strategy meets our expectations
  console.log('🎯 EXPECTED vs ACTUAL:\n');
  console.log('Expected (verified on real recordings):');
  console.log('  - High funding (≥1%): ~0.47% avg profit, 75% win rate');
  console.log('  - All recordings: ~0.42% avg profit, 80% win rate\n');

  // Filter high funding trades
  const highFundingTrades = results.filter(r => Math.abs(r.fundingRate) >= 0.01);
  if (highFundingTrades.length > 0) {
    const highFundingProfitable = highFundingTrades.filter(r => r.netProfitPercent > 0);
    const highFundingAvg = highFundingTrades.reduce((sum, r) => sum + r.netProfitPercent, 0) / highFundingTrades.length;
    const highFundingWinRate = (highFundingProfitable.length / highFundingTrades.length) * 100;

    console.log('Actual (high funding ≥1%):');
    console.log(`  - Average profit: ${highFundingAvg > 0 ? '+' : ''}${highFundingAvg.toFixed(4)}%`);
    console.log(`  - Win rate: ${highFundingWinRate.toFixed(1)}%`);
    console.log(`  - Trades: ${highFundingTrades.length}\n`);
  }

  console.log('Actual (all trades):');
  console.log(`  - Average profit: ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}%`);
  console.log(`  - Win rate: ${(profitable.length / results.length * 100).toFixed(1)}%`);
  console.log(`  - Trades: ${results.length}\n`);

  if (avgProfit > 0.3 && profitable.length / results.length >= 0.6) {
    console.log('✅ Strategy is WORKING! Meets profitability criteria (>0.3% avg, >60% win rate)\n');
  } else if (avgProfit > 0) {
    console.log('⚠️  Strategy is marginally profitable but below expected performance\n');
  } else {
    console.log('❌ Strategy is NOT working on this sample\n');
  }
}

analyzeRecordings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
