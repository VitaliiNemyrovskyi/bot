import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRADING_FEES = 0.11; // 0.055% maker + 0.055% taker
const OPTIMAL_ENTRY_TIME = 0; // 0ms - exactly at funding payment
const OPTIMAL_EXIT_TIME = 30000; // 30s after funding

async function analyzeFundingVsProfit() {
  console.log('\n📊 FUNDING RATE vs PROFIT ANALYSIS\n');
  console.log('Strategy: 0ms entry → +30s exit (optimal)\n');
  console.log('═'.repeat(100));

  // Get all COMPLETED recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { fundingRate: 'asc' }, // Sort by funding rate (most negative first)
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' }
      }
    }
  });

  console.log(`\n📈 Loaded ${sessions.length} completed recordings\n`);

  interface TradeResult {
    symbol: string;
    exchange: string;
    fundingRate: number;
    fundingRatePercent: number;
    entryPrice: number;
    exitPrice: number;
    priceDropPercent: number;
    grossProfitPercent: number;
    netProfitPercent: number;
    liquidityScore?: number;
    dataPointsCount: number;
  }

  const results: TradeResult[] = [];

  for (const session of sessions) {
    if (session.dataPoints.length === 0) continue;

    // Find entry point: closest to 0ms (funding payment moment)
    const entryPoint = session.dataPoints.reduce((closest, point) => {
      const currentDiff = Math.abs(point.relativeTimeMs - OPTIMAL_ENTRY_TIME);
      const closestDiff = Math.abs(closest.relativeTimeMs - OPTIMAL_ENTRY_TIME);
      return currentDiff < closestDiff ? point : closest;
    });

    // Find exit point: closest to +30000ms
    const exitPoint = session.dataPoints.reduce((closest, point) => {
      const currentDiff = Math.abs(point.relativeTimeMs - OPTIMAL_EXIT_TIME);
      const closestDiff = Math.abs(closest.relativeTimeMs - OPTIMAL_EXIT_TIME);
      return currentDiff < closestDiff ? point : closest;
    });

    const entryPrice = entryPoint.lastPrice;
    const exitPrice = exitPoint.lastPrice;

    // Calculate SHORT profit (profit when price drops)
    const priceDropPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
    const grossProfitPercent = priceDropPercent;
    const netProfitPercent = grossProfitPercent - TRADING_FEES;

    // Calculate liquidity score if available
    let liquidityScore: number | undefined;
    if (entryPoint.bid1Size && entryPoint.ask1Size && entryPoint.ask1Size > 0) {
      liquidityScore = entryPoint.bid1Size / entryPoint.ask1Size;
    }

    results.push({
      symbol: session.symbol,
      exchange: session.exchange,
      fundingRate: session.fundingRate,
      fundingRatePercent: session.fundingRate * 100,
      entryPrice,
      exitPrice,
      priceDropPercent,
      grossProfitPercent,
      netProfitPercent,
      liquidityScore,
      dataPointsCount: session.dataPoints.length
    });
  }

  // Sort by funding rate (most negative first)
  results.sort((a, b) => a.fundingRatePercent - b.fundingRatePercent);

  // Display all results
  console.log('All trades (sorted by funding rate):\n');
  console.log('═'.repeat(100));

  results.forEach((r, i) => {
    const fundingStr = r.fundingRatePercent.toFixed(4) + '%';
    const profitStr = (r.netProfitPercent > 0 ? '+' : '') + r.netProfitPercent.toFixed(4) + '%';
    const status = r.netProfitPercent > 0 ? '✅' : '❌';

    console.log(`\n${i + 1}. ${r.symbol} @ ${r.exchange} ${status}`);
    console.log(`   Funding Rate: ${fundingStr}`);
    console.log(`   Price Drop: ${r.priceDropPercent > 0 ? '+' : ''}${r.priceDropPercent.toFixed(4)}%`);
    console.log(`   Gross Profit: ${r.grossProfitPercent > 0 ? '+' : ''}${r.grossProfitPercent.toFixed(4)}%`);
    console.log(`   Net Profit: ${profitStr}`);
    if (r.liquidityScore !== undefined) {
      console.log(`   Liquidity Score: ${r.liquidityScore.toFixed(4)}`);
    }
    console.log(`   Data Points: ${r.dataPointsCount}`);
  });

  // Group by funding rate ranges
  console.log('\n\n' + '═'.repeat(100));
  console.log('\n📊 FUNDING RATE RANGES ANALYSIS:\n');

  const ranges = [
    { min: -Infinity, max: -2.0, label: 'Very High (≤ -2.0%)' },
    { min: -2.0, max: -1.5, label: 'High (-2.0% to -1.5%)' },
    { min: -1.5, max: -1.0, label: 'Medium (-1.5% to -1.0%)' },
    { min: -1.0, max: -0.5, label: 'Low (-1.0% to -0.5%)' },
    { min: -0.5, max: 0, label: 'Very Low (-0.5% to 0%)' }
  ];

  for (const range of ranges) {
    const trades = results.filter(r =>
      r.fundingRatePercent >= range.min && r.fundingRatePercent < range.max
    );

    if (trades.length === 0) continue;

    const profitable = trades.filter(t => t.netProfitPercent > 0);
    const avgFundingRate = trades.reduce((sum, t) => sum + t.fundingRatePercent, 0) / trades.length;
    const avgProfit = trades.reduce((sum, t) => sum + t.netProfitPercent, 0) / trades.length;
    const avgPriceDrop = trades.reduce((sum, t) => sum + t.priceDropPercent, 0) / trades.length;
    const winRate = (profitable.length / trades.length) * 100;

    console.log(`${range.label}:`);
    console.log(`  Trades: ${trades.length}`);
    console.log(`  Avg Funding Rate: ${avgFundingRate.toFixed(4)}%`);
    console.log(`  Avg Price Drop: ${avgPriceDrop > 0 ? '+' : ''}${avgPriceDrop.toFixed(4)}%`);
    console.log(`  Avg Net Profit: ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}%`);
    console.log(`  Win Rate: ${winRate.toFixed(1)}%`);
    console.log(`  Best: ${Math.max(...trades.map(t => t.netProfitPercent)).toFixed(4)}%`);
    console.log(`  Worst: ${Math.min(...trades.map(t => t.netProfitPercent)).toFixed(4)}%`);
    console.log('');
  }

  // Calculate correlation
  console.log('═'.repeat(100));
  console.log('\n🔍 CORRELATION ANALYSIS:\n');

  const avgFunding = results.reduce((sum, r) => sum + Math.abs(r.fundingRatePercent), 0) / results.length;
  const avgProfit = results.reduce((sum, r) => sum + r.netProfitPercent, 0) / results.length;

  console.log(`Average |Funding Rate|: ${avgFunding.toFixed(4)}%`);
  console.log(`Average Net Profit: ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}%`);

  // Expected profit for different funding rates
  console.log('\n\n═'.repeat(100));
  console.log('\n🎯 EXPECTED PROFIT BY FUNDING RATE:\n');

  const fundingLevels = [
    { rate: -0.5, label: '0.5%' },
    { rate: -0.75, label: '0.75%' },
    { rate: -1.0, label: '1.0%' },
    { rate: -1.25, label: '1.25%' },
    { rate: -1.5, label: '1.5%' },
    { rate: -1.75, label: '1.75%' },
    { rate: -2.0, label: '2.0%' },
    { rate: -2.5, label: '2.5%' },
    { rate: -3.0, label: '3.0%' }
  ];

  console.log('Based on observed data pattern:\n');

  for (const level of fundingLevels) {
    const similarTrades = results.filter(r =>
      Math.abs(r.fundingRatePercent - (level.rate * 100)) <= 0.25
    );

    if (similarTrades.length > 0) {
      const avgProfit = similarTrades.reduce((sum, t) => sum + t.netProfitPercent, 0) / similarTrades.length;
      const winRate = (similarTrades.filter(t => t.netProfitPercent > 0).length / similarTrades.length) * 100;
      console.log(`  Funding -${level.label}: Expected profit ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}% (${similarTrades.length} samples, ${winRate.toFixed(0)}% win rate)`);
    } else {
      // Estimate based on trend
      const multiplier = Math.abs(level.rate) / avgFunding;
      const estimatedProfit = avgProfit * multiplier;
      console.log(`  Funding -${level.label}: Estimated profit ${estimatedProfit > 0 ? '+' : ''}${estimatedProfit.toFixed(4)}% (extrapolated)`);
    }
  }

  console.log('\n\n═'.repeat(100));
  console.log('\n💡 KEY INSIGHTS:\n');

  const highFundingTrades = results.filter(r => Math.abs(r.fundingRatePercent) >= 1.0);
  const lowFundingTrades = results.filter(r => Math.abs(r.fundingRatePercent) < 1.0);

  if (highFundingTrades.length > 0 && lowFundingTrades.length > 0) {
    const highAvg = highFundingTrades.reduce((sum, t) => sum + t.netProfitPercent, 0) / highFundingTrades.length;
    const lowAvg = lowFundingTrades.reduce((sum, t) => sum + t.netProfitPercent, 0) / lowFundingTrades.length;

    console.log(`High funding (≥1.0%): ${highAvg > 0 ? '+' : ''}${highAvg.toFixed(4)}% avg profit (${highFundingTrades.length} trades)`);
    console.log(`Low funding (<1.0%): ${lowAvg > 0 ? '+' : ''}${lowAvg.toFixed(4)}% avg profit (${lowFundingTrades.length} trades)`);
    console.log(`\nDifference: ${(highAvg - lowAvg) > 0 ? '+' : ''}${(highAvg - lowAvg).toFixed(4)}% more profit with high funding`);
  }

  console.log('\n' + '═'.repeat(100) + '\n');

  await prisma.$disconnect();
}

analyzeFundingVsProfit().catch(console.error);
