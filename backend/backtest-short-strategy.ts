/**
 * Backtest SHORT -500ms Strategy on Recorded Data
 *
 * Tests the optimal SHORT strategy (entry -500ms, exit +30s) on
 * actual recorded funding payment data to validate the analysis.
 *
 * This simulates real trading with:
 * - Precise entry/exit timing
 * - Bybit trading fees (0.055% maker/taker)
 * - Realistic slippage (0.01% - 0.05%)
 * - Funding payment calculation
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BacktestConfig {
  entryOffsetMs: number; // -500 = 500ms before funding
  exitOffsetMs: number; // +30000 = 30s after funding
  positionSizeUSDT: number;
  makerFeePercent: number; // 0.055% for Bybit
  takerFeePercent: number; // 0.055% for Bybit
  slippagePercent: number; // 0.01% - 0.05%
  assumeFundingAvoided: boolean; // Assume funding is avoided in uncertainty window
}

interface BacktestResult {
  sessionId: string;
  symbol: string;
  fundingRate: number;
  fundingPaymentTime: Date;

  entryTime: Date;
  entryPrice: number;
  exitTime: Date;
  exitPrice: number;

  priceMove: number; // %
  fundingPaid: number; // % (0 if avoided, negative if paid)
  entryFee: number; // USDT
  exitFee: number; // USDT
  slippageCost: number; // USDT

  grossProfitUSDT: number; // From price movement
  fundingCostUSDT: number; // Funding paid (negative if cost)
  tradingFeesUSDT: number; // Entry + exit fees
  slippageUSDT: number; // Slippage cost
  netProfitUSDT: number; // Final profit
  netProfitPercent: number; // Final profit %

  maxGainDuringTrade: number; // Max potential profit %
  maxGainTimeMs: number; // When max profit occurred
}

const DEFAULT_CONFIG: BacktestConfig = {
  entryOffsetMs: -500, // 500ms before funding
  exitOffsetMs: 30000, // 30s after funding
  positionSizeUSDT: 100,
  makerFeePercent: 0.055, // Bybit standard
  takerFeePercent: 0.055,
  slippagePercent: 0.02, // Realistic 0.02%
  assumeFundingAvoided: true, // Assume we avoid funding in -500ms window
};

async function backtestShortStrategy() {
  console.log('\n🎯 BACKTESTING SHORT -500ms STRATEGY\n');
  console.log('='.repeat(80));
  console.log('\n📋 Configuration:');
  console.log(`   Entry: ${DEFAULT_CONFIG.entryOffsetMs}ms relative to funding`);
  console.log(`   Exit: ${DEFAULT_CONFIG.exitOffsetMs}ms relative to funding`);
  console.log(`   Position Size: ${DEFAULT_CONFIG.positionSizeUSDT} USDT`);
  console.log(`   Trading Fees: ${DEFAULT_CONFIG.takerFeePercent}% (entry + exit)`);
  console.log(`   Slippage: ${DEFAULT_CONFIG.slippagePercent}%`);
  console.log(`   Funding Avoided: ${DEFAULT_CONFIG.assumeFundingAvoided ? 'YES' : 'NO'}`);
  console.log('');
  console.log('='.repeat(80));

  // Fetch all completed recordings with negative funding
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 100 },
      fundingRate: { lt: 0 } // Negative funding = SHORT pays LONG
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      dataPoints: {
        orderBy: {
          bybitTimestamp: 'asc'
        }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('\n❌ No completed recordings found\n');
    return;
  }

  console.log(`\n✅ Found ${sessions.length} recordings to backtest\n`);
  console.log('='.repeat(80));

  const results: BacktestResult[] = [];

  for (const session of sessions) {
    console.log(`\n📊 Backtesting: ${session.symbol}`);
    console.log(`   Funding Time: ${session.fundingPaymentTime?.toISOString()}`);
    console.log(`   Funding Rate: ${((session.fundingRate || 0) * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${session.dataPoints.length}`);

    const result = await backtestSession(session, DEFAULT_CONFIG);

    if (result) {
      results.push(result);

      console.log(`\n   ⏰ Execution:`);
      console.log(`      Entry: ${result.entryTime.toISOString()} @ $${result.entryPrice.toFixed(6)}`);
      console.log(`      Exit:  ${result.exitTime.toISOString()} @ $${result.exitPrice.toFixed(6)}`);

      console.log(`\n   📈 Performance:`);
      console.log(`      Price Move: ${result.priceMove >= 0 ? '+' : ''}${result.priceMove.toFixed(4)}%`);
      console.log(`      Gross Profit: $${result.grossProfitUSDT.toFixed(2)}`);
      console.log(`      Funding Cost: $${result.fundingCostUSDT.toFixed(2)}`);
      console.log(`      Trading Fees: $${result.tradingFeesUSDT.toFixed(2)}`);
      console.log(`      Slippage: $${result.slippageUSDT.toFixed(2)}`);
      console.log(`      NET PROFIT: $${result.netProfitUSDT.toFixed(2)} (${result.netProfitPercent >= 0 ? '+' : ''}${result.netProfitPercent.toFixed(4)}%)`);

      if (result.maxGainDuringTrade > result.priceMove) {
        const missedProfit = result.maxGainDuringTrade - result.priceMove;
        console.log(`\n   💡 Max gain during trade: ${result.maxGainDuringTrade.toFixed(4)}% at ${(result.maxGainTimeMs / 1000).toFixed(1)}s`);
        console.log(`      Missed potential: +${missedProfit.toFixed(4)}%`);
      }
    }
  }

  // Generate summary
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 BACKTEST SUMMARY');
  console.log('='.repeat(80));

  if (results.length === 0) {
    console.log('\n❌ No valid backtest results\n');
    return;
  }

  const profitable = results.filter(r => r.netProfitUSDT > 0);
  const unprofitable = results.filter(r => r.netProfitUSDT <= 0);

  const totalProfit = results.reduce((sum, r) => sum + r.netProfitUSDT, 0);
  const avgProfit = totalProfit / results.length;
  const avgProfitPercent = results.reduce((sum, r) => sum + r.netProfitPercent, 0) / results.length;

  const medianProfitUSDT = median(results.map(r => r.netProfitUSDT));
  const medianProfitPercent = median(results.map(r => r.netProfitPercent));

  const totalFees = results.reduce((sum, r) => sum + r.tradingFeesUSDT, 0);
  const totalSlippage = results.reduce((sum, r) => sum + r.slippageUSDT, 0);
  const totalFunding = results.reduce((sum, r) => sum + r.fundingCostUSDT, 0);

  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total Trades: ${results.length}`);
  console.log(`   Profitable: ${profitable.length} (${(profitable.length / results.length * 100).toFixed(1)}%)`);
  console.log(`   Unprofitable: ${unprofitable.length} (${(unprofitable.length / results.length * 100).toFixed(1)}%)`);

  console.log(`\n💰 Profit Statistics:`);
  console.log(`   Total Profit: $${totalProfit.toFixed(2)}`);
  console.log(`   Average Profit: $${avgProfit.toFixed(2)} (${avgProfitPercent >= 0 ? '+' : ''}${avgProfitPercent.toFixed(4)}%)`);
  console.log(`   Median Profit: $${medianProfitUSDT.toFixed(2)} (${medianProfitPercent >= 0 ? '+' : ''}${medianProfitPercent.toFixed(4)}%)`);

  console.log(`\n💸 Cost Breakdown:`);
  console.log(`   Total Trading Fees: $${totalFees.toFixed(2)}`);
  console.log(`   Total Slippage: $${totalSlippage.toFixed(2)}`);
  console.log(`   Total Funding: $${totalFunding.toFixed(2)}`);
  console.log(`   Total Costs: $${(totalFees + totalSlippage + Math.abs(totalFunding)).toFixed(2)}`);

  // Best and worst trades
  const bestTrade = results.reduce((best, current) =>
    current.netProfitUSDT > best.netProfitUSDT ? current : best
  );

  const worstTrade = results.reduce((worst, current) =>
    current.netProfitUSDT < worst.netProfitUSDT ? current : worst
  );

  console.log(`\n🏆 Best Trade:`);
  console.log(`   Symbol: ${bestTrade.symbol}`);
  console.log(`   Entry: $${bestTrade.entryPrice.toFixed(6)}`);
  console.log(`   Exit: $${bestTrade.exitPrice.toFixed(6)}`);
  console.log(`   Profit: $${bestTrade.netProfitUSDT.toFixed(2)} (${bestTrade.netProfitPercent.toFixed(4)}%)`);

  console.log(`\n⚠️  Worst Trade:`);
  console.log(`   Symbol: ${worstTrade.symbol}`);
  console.log(`   Entry: $${worstTrade.entryPrice.toFixed(6)}`);
  console.log(`   Exit: $${worstTrade.exitPrice.toFixed(6)}`);
  console.log(`   Profit: $${worstTrade.netProfitUSDT.toFixed(2)} (${worstTrade.netProfitPercent.toFixed(4)}%)`);

  // Calculate if strategy would be profitable with 1000 USDT over time
  const capital = 1000;
  const tradesPerDay = 3; // 3 funding times per day
  const daysPerMonth = 30;
  const monthlyTrades = tradesPerDay * daysPerMonth;

  const expectedMonthlyProfit = avgProfit * monthlyTrades;
  const expectedMonthlyROI = (expectedMonthlyProfit / capital) * 100;

  console.log(`\n\n` + '='.repeat(80));
  console.log(`📈 PROJECTED PERFORMANCE`);
  console.log('='.repeat(80));
  console.log(`\nWith ${capital} USDT capital:`);
  console.log(`   Trades per day: ${tradesPerDay} (00:00, 08:00, 16:00 UTC)`);
  console.log(`   Avg profit per trade: $${avgProfit.toFixed(2)}`);
  console.log(`   Expected daily profit: $${(avgProfit * tradesPerDay).toFixed(2)}`);
  console.log(`   Expected monthly profit: $${expectedMonthlyProfit.toFixed(2)}`);
  console.log(`   Expected monthly ROI: ${expectedMonthlyROI >= 0 ? '+' : ''}${expectedMonthlyROI.toFixed(2)}%`);

  // Save results to database
  console.log(`\n\n` + '='.repeat(80));
  console.log(`💾 Saving backtest results to database...`);
  console.log('='.repeat(80));

  for (const result of results) {
    await prisma.fundingShortTrade.create({
      data: {
        tradeId: `backtest_${result.sessionId}`,
        symbol: result.symbol,
        exchange: 'BYBIT',
        side: 'Short',
        entryPrice: result.entryPrice,
        exitPrice: result.exitPrice,
        positionSizeUSDT: DEFAULT_CONFIG.positionSizeUSDT,
        entryTime: result.entryTime,
        exitTime: result.exitTime,
        fundingPaymentTime: result.fundingPaymentTime,
        fundingRate: result.fundingRate,
        realizedPnL: result.netProfitUSDT,
        fundingPaid: result.fundingPaid,
        priceMove: result.priceMove,
        netProfit: result.netProfitPercent,
        status: 'EXITED',
        paperTrade: true
      }
    });
  }

  console.log(`\n✅ Saved ${results.length} backtest trades to database`);
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Backtest a single session
 */
async function backtestSession(
  session: any,
  config: BacktestConfig
): Promise<BacktestResult | null> {
  const dataPoints = session.dataPoints;
  const fundingTimeMs = session.fundingPaymentTime!.getTime();

  // Find entry point
  const targetEntryTimeMs = fundingTimeMs + config.entryOffsetMs;
  const entryPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetEntryTimeMs) < Math.abs(closestTime - targetEntryTimeMs)
      ? point : closest;
  });

  if (!entryPoint) return null;

  // Apply slippage to entry (worse fill for market order)
  const entryPrice = entryPoint.lastPrice * (1 + config.slippagePercent / 100);
  const entryTime = new Date(Number(entryPoint.bybitTimestamp));

  // Find exit point
  const targetExitTimeMs = fundingTimeMs + config.exitOffsetMs;
  const exitPoint = dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetExitTimeMs) < Math.abs(closestTime - targetExitTimeMs)
      ? point : closest;
  });

  if (!exitPoint) return null;

  // Apply slippage to exit (worse fill for market order)
  const exitPrice = exitPoint.lastPrice * (1 - config.slippagePercent / 100);
  const exitTime = new Date(Number(exitPoint.bybitTimestamp));

  // Calculate price movement (for SHORT: profit when price drops)
  const priceMove = (entryPrice - exitPrice) / entryPrice * 100;

  // Calculate funding (for SHORT with negative funding: we PAY)
  const fundingRate = session.fundingRate || 0; // Already negative
  const fundingPaid = config.assumeFundingAvoided ? 0 : fundingRate * 100; // % (negative if we pay)

  // Calculate fees
  const entryFee = (config.positionSizeUSDT * config.takerFeePercent) / 100;
  const exitFee = (config.positionSizeUSDT * config.takerFeePercent) / 100;
  const tradingFeesUSDT = entryFee + exitFee;

  // Calculate slippage cost
  const slippageUSDT = (config.positionSizeUSDT * config.slippagePercent * 2) / 100; // Entry + exit

  // Calculate profits
  const grossProfitUSDT = (config.positionSizeUSDT * priceMove) / 100;
  const fundingCostUSDT = (config.positionSizeUSDT * fundingPaid) / 100; // Negative if we pay
  const netProfitUSDT = grossProfitUSDT + fundingCostUSDT - tradingFeesUSDT - slippageUSDT;
  const netProfitPercent = (netProfitUSDT / config.positionSizeUSDT) * 100;

  // Find max gain during trade
  const pointsDuring = dataPoints.filter((p: any) => {
    const t = Number(p.bybitTimestamp);
    return t >= Number(entryPoint.bybitTimestamp) && t <= Number(exitPoint.bybitTimestamp);
  });

  let maxGainDuringTrade = 0;
  let maxGainTimeMs = 0;

  if (pointsDuring.length > 0) {
    const lowestPoint = pointsDuring.reduce((lowest: any, point: any) =>
      point.lastPrice < lowest.lastPrice ? point : lowest
    );
    maxGainDuringTrade = (entryPrice - lowestPoint.lastPrice) / entryPrice * 100;
    maxGainTimeMs = Number(lowestPoint.bybitTimestamp) - fundingTimeMs;
  }

  return {
    sessionId: session.id,
    symbol: session.symbol,
    fundingRate: session.fundingRate,
    fundingPaymentTime: session.fundingPaymentTime,

    entryTime,
    entryPrice,
    exitTime,
    exitPrice,

    priceMove,
    fundingPaid,
    entryFee,
    exitFee,
    slippageCost: slippageUSDT,

    grossProfitUSDT,
    fundingCostUSDT,
    tradingFeesUSDT,
    slippageUSDT,
    netProfitUSDT,
    netProfitPercent,

    maxGainDuringTrade,
    maxGainTimeMs,
  };
}

/**
 * Helper function: median
 */
function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

// Run backtest
backtestShortStrategy()
  .then(() => {
    console.log('✅ Backtest complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
