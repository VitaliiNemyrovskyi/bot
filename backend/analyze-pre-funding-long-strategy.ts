/**
 * Pre-Funding LONG Entry Strategy Analyzer
 *
 * Analyzes what happens if we enter LONG position 20 seconds BEFORE
 * funding payment time.
 *
 * Expected outcome:
 * - We RECEIVE funding payment (SHORT pays LONG when funding is negative)
 * - We capture price movement before/during/after funding
 * - Net profit = funding received + price movement profit/loss
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PreFundingLongAnalysis {
  sessionId: string;
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingPaymentTime: Date;

  // Entry analysis (-20s before funding)
  entryTimeMs: number; // Should be -20000ms
  entryPrice: number;

  // Price at funding time
  priceAtFunding: number;
  priceMoveToFunding: number; // % from entry to funding time

  // Lowest point after entry
  lowestPriceAfterEntry: number;
  lowestPriceTimeMs: number;
  maxDrawdown: number; // % from entry to lowest point (negative if price dropped)

  // Exit analysis (at recovery peak)
  exitPrice: number;
  exitTimeMs: number;
  priceMove: number; // % from entry to exit

  // Profitability
  fundingReceived: number; // % (positive for LONG with negative funding)
  priceProfitLoss: number; // % from price movement
  netProfit: number; // funding + price movement

  // Risk metrics
  riskRewardRatio: number;
  wouldHitStopLoss: boolean; // If drawdown > 2%

  totalDataPoints: number;
}

async function analyzePreFundingLongStrategy() {
  console.log('\n📊 PRE-FUNDING LONG ENTRY STRATEGY ANALYZER\n');
  console.log('='.repeat(80));
  console.log('\n🎯 Strategy: Enter LONG 20 seconds BEFORE funding payment');
  console.log('   Expected: Receive funding payment + capture price movement\n');
  console.log('='.repeat(80));

  // Fetch completed recordings with good data
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: {
        gte: 100
      },
      fundingRate: {
        lt: 0 // Only negative funding rates (SHORT pays LONG)
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50,
    include: {
      dataPoints: {
        orderBy: {
          bybitTimestamp: 'asc'
        }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No completed recordings with negative funding found\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings with negative funding to analyze\n`);
  console.log('='.repeat(80));

  const analysisResults: PreFundingLongAnalysis[] = [];

  for (const session of sessions) {
    console.log(`\n📊 Analyzing: ${session.exchange} ${session.symbol}`);
    console.log(`   Funding Time: ${session.fundingPaymentTime?.toISOString()}`);
    console.log(`   Funding Rate: ${((session.fundingRate || 0) * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${session.dataPoints.length}`);

    if (!session.fundingPaymentTime || session.dataPoints.length < 50) {
      console.log('   ⚠️  Skipping - insufficient data');
      continue;
    }

    const result = analyzeSession(session);

    if (result) {
      analysisResults.push(result);

      console.log(`\n   📍 Entry Point (-20s):`);
      console.log(`      Entry Price: $${result.entryPrice.toFixed(6)}`);
      console.log(`      Entry Time: ${result.entryTimeMs}ms (${(result.entryTimeMs / 1000).toFixed(1)}s)`);

      console.log(`\n   💰 Funding Payment:`);
      console.log(`      Funding Received: +${result.fundingReceived.toFixed(4)}%`);

      console.log(`\n   📉 Price Movement:`);
      console.log(`      To Funding Time: ${result.priceMoveToFunding >= 0 ? '+' : ''}${result.priceMoveToFunding.toFixed(4)}%`);
      console.log(`      Max Drawdown: ${result.maxDrawdown.toFixed(4)}% at ${(result.lowestPriceTimeMs / 1000).toFixed(1)}s`);
      console.log(`      To Exit: ${result.priceMove >= 0 ? '+' : ''}${result.priceMove.toFixed(4)}%`);

      console.log(`\n   💵 Profitability:`);
      console.log(`      Funding Received: ${result.fundingReceived >= 0 ? '+' : ''}${result.fundingReceived.toFixed(4)}%`);
      console.log(`      Price P/L: ${result.priceProfitLoss >= 0 ? '+' : ''}${result.priceProfitLoss.toFixed(4)}%`);
      console.log(`      NET PROFIT: ${result.netProfit >= 0 ? '+' : ''}${result.netProfit.toFixed(4)}%`);

      if (result.wouldHitStopLoss) {
        console.log(`\n   ⚠️  WARNING: Would hit stop loss (>2% drawdown)`);
      }

      console.log(`\n   📊 Risk Metrics:`);
      console.log(`      Risk/Reward: 1:${result.riskRewardRatio.toFixed(2)}`);
    }
  }

  // Generate summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 SUMMARY STATISTICS');
  console.log('='.repeat(80));

  if (analysisResults.length === 0) {
    console.log('\n❌ No valid analysis results\n');
    return;
  }

  const profitable = analysisResults.filter(r => r.netProfit > 0);
  const hitStopLoss = analysisResults.filter(r => r.wouldHitStopLoss);

  console.log(`\nTotal Recordings: ${analysisResults.length}`);
  console.log(`Profitable Trades: ${profitable.length} (${(profitable.length / analysisResults.length * 100).toFixed(1)}%)`);
  console.log(`Would Hit Stop Loss: ${hitStopLoss.length} (${(hitStopLoss.length / analysisResults.length * 100).toFixed(1)}%)`);

  const avgFundingReceived = average(analysisResults.map(r => r.fundingReceived));
  const avgPriceMove = average(analysisResults.map(r => r.priceProfitLoss));
  const avgNetProfit = average(analysisResults.map(r => r.netProfit));
  const avgMaxDrawdown = average(analysisResults.map(r => r.maxDrawdown));

  const medianFundingReceived = median(analysisResults.map(r => r.fundingReceived));
  const medianPriceMove = median(analysisResults.map(r => r.priceProfitLoss));
  const medianNetProfit = median(analysisResults.map(r => r.netProfit));
  const medianMaxDrawdown = median(analysisResults.map(r => r.maxDrawdown));

  console.log('\n💰 PROFITABILITY:');
  console.log(`   Average Funding Received: +${avgFundingReceived.toFixed(4)}%`);
  console.log(`   Average Price Movement: ${avgPriceMove >= 0 ? '+' : ''}${avgPriceMove.toFixed(4)}%`);
  console.log(`   Average NET Profit: ${avgNetProfit >= 0 ? '+' : ''}${avgNetProfit.toFixed(4)}%`);
  console.log('');
  console.log(`   Median Funding Received: +${medianFundingReceived.toFixed(4)}%`);
  console.log(`   Median Price Movement: ${medianPriceMove >= 0 ? '+' : ''}${medianPriceMove.toFixed(4)}%`);
  console.log(`   Median NET Profit: ${medianNetProfit >= 0 ? '+' : ''}${medianNetProfit.toFixed(4)}%`);

  console.log('\n⚠️  RISK METRICS:');
  console.log(`   Average Max Drawdown: ${avgMaxDrawdown.toFixed(4)}%`);
  console.log(`   Median Max Drawdown: ${medianMaxDrawdown.toFixed(4)}%`);

  // Top performers
  console.log('\n\n' + '='.repeat(80));
  console.log('🏆 TOP PERFORMERS (by net profit)');
  console.log('='.repeat(80));
  console.log('');
  console.log('Symbol       Funding%   Price%     Net%       MaxDD%     R:R');
  console.log('-'.repeat(80));

  const topPerformers = [...analysisResults]
    .sort((a, b) => b.netProfit - a.netProfit)
    .slice(0, 10);

  for (const perf of topPerformers) {
    const symbol = perf.symbol.padEnd(12);
    const funding = `+${perf.fundingReceived.toFixed(3)}%`.padEnd(10);
    const price = `${perf.priceProfitLoss >= 0 ? '+' : ''}${perf.priceProfitLoss.toFixed(3)}%`.padEnd(10);
    const net = `${perf.netProfit >= 0 ? '+' : ''}${perf.netProfit.toFixed(3)}%`.padEnd(10);
    const maxDD = `${perf.maxDrawdown.toFixed(3)}%`.padEnd(10);
    const rr = `1:${perf.riskRewardRatio.toFixed(2)}`.padEnd(10);

    console.log(`${symbol} ${funding} ${price} ${net} ${maxDD} ${rr}`);
  }

  // Worst performers
  console.log('\n\n' + '='.repeat(80));
  console.log('⚠️  WORST PERFORMERS (by net profit)');
  console.log('='.repeat(80));
  console.log('');
  console.log('Symbol       Funding%   Price%     Net%       MaxDD%     R:R');
  console.log('-'.repeat(80));

  const worstPerformers = [...analysisResults]
    .sort((a, b) => a.netProfit - b.netProfit)
    .slice(0, 5);

  for (const perf of worstPerformers) {
    const symbol = perf.symbol.padEnd(12);
    const funding = `+${perf.fundingReceived.toFixed(3)}%`.padEnd(10);
    const price = `${perf.priceProfitLoss >= 0 ? '+' : ''}${perf.priceProfitLoss.toFixed(3)}%`.padEnd(10);
    const net = `${perf.netProfit >= 0 ? '+' : ''}${perf.netProfit.toFixed(3)}%`.padEnd(10);
    const maxDD = `${perf.maxDrawdown.toFixed(3)}%`.padEnd(10);
    const rr = `1:${perf.riskRewardRatio.toFixed(2)}`.padEnd(10);

    console.log(`${symbol} ${funding} ${price} ${net} ${maxDD} ${rr}`);
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 STRATEGY COMPARISON');
  console.log('='.repeat(80));

  console.log('\n📊 Pre-Funding LONG (-20s entry):');
  console.log(`   Median Net Profit: ${medianNetProfit >= 0 ? '+' : ''}${medianNetProfit.toFixed(4)}%`);
  console.log(`   Success Rate: ${(profitable.length / analysisResults.length * 100).toFixed(1)}%`);
  console.log(`   Median Drawdown: ${medianMaxDrawdown.toFixed(4)}%`);
  console.log(`   Stop Loss Risk: ${(hitStopLoss.length / analysisResults.length * 100).toFixed(1)}%`);

  console.log('\n📊 Post-Funding LONG (+29s entry) [Previous Analysis]:');
  console.log(`   Median Net Profit: +0.4723%`);
  console.log(`   Success Rate: 100.0%`);
  console.log(`   Median Drawdown: ~0%`);
  console.log(`   Stop Loss Risk: 0%`);

  console.log('\n\n' + '='.repeat(80));
  console.log('💡 RECOMMENDATION');
  console.log('='.repeat(80));

  if (medianNetProfit > 0.4723 && (hitStopLoss.length / analysisResults.length) < 0.2) {
    console.log('\n✅ PRE-FUNDING LONG STRATEGY IS BETTER!');
    console.log(`   Higher median profit: ${medianNetProfit.toFixed(4)}% vs 0.4723%`);
    console.log(`   Acceptable risk: ${(hitStopLoss.length / analysisResults.length * 100).toFixed(1)}% stop loss rate`);
    console.log('\n🎯 RECOMMENDED: Enter LONG 20 seconds BEFORE funding payment');
  } else if (medianNetProfit > 0) {
    console.log('\n⚠️  PRE-FUNDING LONG IS PROFITABLE BUT RISKIER');
    console.log(`   Median profit: ${medianNetProfit.toFixed(4)}% (vs 0.4723% post-funding)`);
    console.log(`   Higher risk: ${(hitStopLoss.length / analysisResults.length * 100).toFixed(1)}% stop loss rate`);
    console.log('\n🎯 Consider using post-funding strategy for lower risk');
  } else {
    console.log('\n❌ PRE-FUNDING LONG STRATEGY IS NOT RECOMMENDED');
    console.log(`   Median profit: ${medianNetProfit.toFixed(4)}% (NEGATIVE or too low)`);
    console.log(`   Post-funding strategy is safer and more profitable`);
    console.log('\n🎯 RECOMMENDED: Stick with post-funding LONG entry (+29s)');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Analyze a single session for pre-funding LONG entry
 */
function analyzeSession(session: any): PreFundingLongAnalysis | null {
  const dataPoints = session.dataPoints;
  const fundingTimeMs = session.fundingPaymentTime!.getTime();

  // Find entry point: 20 seconds BEFORE funding time
  const targetEntryTimeMs = fundingTimeMs - 20000;

  const entryPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetEntryTimeMs) < Math.abs(closestTime - targetEntryTimeMs)
      ? point : closest;
  });

  if (!entryPoint) return null;

  const entryPrice = entryPoint.lastPrice;
  const entryTimeMs = Number(entryPoint.bybitTimestamp) - fundingTimeMs;

  // Find price at funding time
  const fundingPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - fundingTimeMs) < Math.abs(closestTime - fundingTimeMs)
      ? point : closest;
  });

  const priceAtFunding = fundingPoint.lastPrice;
  const priceMoveToFunding = (priceAtFunding - entryPrice) / entryPrice * 100;

  // Find all points after entry
  const pointsAfterEntry = dataPoints.filter((p: any) =>
    Number(p.bybitTimestamp) >= Number(entryPoint.bybitTimestamp)
  );

  if (pointsAfterEntry.length < 10) return null;

  // Find lowest point after entry
  const lowestPoint = pointsAfterEntry.reduce((lowest: any, point: any) =>
    point.lastPrice < lowest.lastPrice ? point : lowest
  );

  const lowestPriceAfterEntry = lowestPoint.lastPrice;
  const lowestPriceTimeMs = Number(lowestPoint.bybitTimestamp) - fundingTimeMs;
  const maxDrawdown = (lowestPriceAfterEntry - entryPrice) / entryPrice * 100;

  // Find exit point: recovery peak after lowest point
  const pointsAfterLowest = pointsAfterEntry.filter((p: any) =>
    Number(p.bybitTimestamp) > Number(lowestPoint.bybitTimestamp)
  );

  let exitPoint = lowestPoint;
  let exitPrice = lowestPriceAfterEntry;

  if (pointsAfterLowest.length > 0) {
    exitPoint = pointsAfterLowest.reduce((highest: any, point: any) =>
      point.lastPrice > highest.lastPrice ? point : highest
    );
    exitPrice = exitPoint.lastPrice;
  }

  const exitTimeMs = Number(exitPoint.bybitTimestamp) - fundingTimeMs;
  const priceMove = (exitPrice - entryPrice) / entryPrice * 100;

  // Calculate profitability
  const fundingRate = session.fundingRate || 0;
  const fundingReceived = Math.abs(fundingRate) * 100; // LONG receives funding (negative rate)
  const priceProfitLoss = priceMove;
  const netProfit = fundingReceived + priceProfitLoss;

  // Risk metrics
  const wouldHitStopLoss = maxDrawdown < -2.0; // 2% stop loss
  const riskRewardRatio = Math.abs(maxDrawdown) > 0.01
    ? netProfit / Math.abs(maxDrawdown)
    : netProfit * 100;

  return {
    sessionId: session.id,
    symbol: session.symbol,
    exchange: session.exchange,
    fundingRate: session.fundingRate || 0,
    fundingPaymentTime: session.fundingPaymentTime,

    entryTimeMs,
    entryPrice,

    priceAtFunding,
    priceMoveToFunding,

    lowestPriceAfterEntry,
    lowestPriceTimeMs,
    maxDrawdown,

    exitPrice,
    exitTimeMs,
    priceMove,

    fundingReceived,
    priceProfitLoss,
    netProfit,

    riskRewardRatio,
    wouldHitStopLoss,

    totalDataPoints: dataPoints.length,
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

// Run the analysis
analyzePreFundingLongStrategy()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
