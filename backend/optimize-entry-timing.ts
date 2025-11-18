import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TimingResult {
  entryTime: number;
  exitTime: number;
  avgProfit: number;
  winRate: number;
  profitableCount: number;
  totalTrades: number;
  avgLiquidityScore?: number;
  trades: Array<{
    symbol: string;
    exchange: string;
    entryPrice: number;
    exitPrice: number;
    profit: number;
    liquidityScore?: number;
    bidSize?: number;
    askSize?: number;
  }>;
}

const TRADING_FEES = 0.11; // 0.055% maker + 0.055% taker

async function optimizeEntryTiming() {
  console.log('\n🔬 COMPREHENSIVE ENTRY/EXIT TIMING OPTIMIZATION\n');
  console.log('Testing all combinations to find optimal strategy parameters\n');
  console.log('═'.repeat(100));

  // Get all COMPLETED recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' }
      }
    }
  });

  console.log(`\n📊 Loaded ${sessions.length} completed recordings\n`);

  // Define entry and exit times to test
  const entryTimes = [-5000, -4000, -3000, -2000, -1000, 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
  const exitTimes = [8000, 10000, 12000, 15000, 18000, 20000, 25000, 30000];

  const results: TimingResult[] = [];

  // Test all combinations
  for (const entryTime of entryTimes) {
    for (const exitTime of exitTimes) {
      // Skip if exit is before or too close to entry
      if (exitTime <= entryTime + 5000) continue;

      const trades: TimingResult['trades'] = [];

      for (const session of sessions) {
        if (session.dataPoints.length === 0) continue;

        // Find entry point closest to target time
        const entryPoint = session.dataPoints.reduce((closest, point) => {
          const currentDiff = Math.abs(point.relativeTimeMs - entryTime);
          const closestDiff = Math.abs(closest.relativeTimeMs - entryTime);
          return currentDiff < closestDiff ? point : closest;
        });

        // Find exit point closest to target time
        const exitPoint = session.dataPoints.reduce((closest, point) => {
          const currentDiff = Math.abs(point.relativeTimeMs - exitTime);
          const closestDiff = Math.abs(closest.relativeTimeMs - exitTime);
          return currentDiff < closestDiff ? point : closest;
        });

        const entryPrice = entryPoint.lastPrice;
        const exitPrice = exitPoint.lastPrice;

        // Calculate SHORT profit
        const shortProfitPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
        let netProfitPercent = shortProfitPercent - TRADING_FEES;

        // CRITICAL: If we enter BEFORE funding payment (entryTime < 0), we must PAY funding
        // For NEGATIVE funding rates (like -1.5%), SHORTS pay LONGS
        // This is a COST that reduces our profit
        if (entryTime < 0 && exitTime > 0) {
          // We hold position through funding payment
          const fundingRatePercent = session.fundingRate * 100; // Convert to percent

          // If funding rate is negative, shorts PAY (cost)
          // If funding rate is positive, shorts RECEIVE (profit)
          netProfitPercent += fundingRatePercent; // Add funding payment (negative = cost, positive = profit)
        }

        // Calculate liquidity score if data available
        let liquidityScore: number | undefined;
        if (entryPoint.bid1Size && entryPoint.ask1Size && entryPoint.ask1Size > 0) {
          liquidityScore = entryPoint.bid1Size / entryPoint.ask1Size;
        }

        trades.push({
          symbol: session.symbol,
          exchange: session.exchange,
          entryPrice,
          exitPrice,
          profit: netProfitPercent,
          liquidityScore,
          bidSize: entryPoint.bid1Size || undefined,
          askSize: entryPoint.ask1Size || undefined,
        });
      }

      const profitableTrades = trades.filter(t => t.profit > 0);
      const avgProfit = trades.reduce((sum, t) => sum + t.profit, 0) / trades.length;
      const winRate = (profitableTrades.length / trades.length) * 100;

      // Calculate average liquidity score
      const tradesWithLiquidity = trades.filter(t => t.liquidityScore !== undefined);
      const avgLiquidity = tradesWithLiquidity.length > 0
        ? tradesWithLiquidity.reduce((sum, t) => sum + (t.liquidityScore || 0), 0) / tradesWithLiquidity.length
        : undefined;

      results.push({
        entryTime,
        exitTime,
        avgProfit,
        winRate,
        profitableCount: profitableTrades.length,
        totalTrades: trades.length,
        avgLiquidityScore: avgLiquidity,
        trades,
      });
    }
  }

  // Sort by average profit
  results.sort((a, b) => b.avgProfit - a.avgProfit);

  console.log('\n🏆 TOP 10 BEST ENTRY/EXIT COMBINATIONS:\n');
  console.log('═'.repeat(100));

  for (let i = 0; i < Math.min(10, results.length); i++) {
    const r = results[i];
    if (!r) continue;
    const entryLabel = r.entryTime >= 0 ? `+${r.entryTime}ms` : `${r.entryTime}ms`;
    const exitLabel = r.exitTime >= 0 ? `+${r.exitTime}ms` : `${r.exitTime}ms`;
    const duration = r.exitTime - r.entryTime;

    console.log(`\n${i + 1}. Entry: ${entryLabel.padEnd(10)} → Exit: ${exitLabel.padEnd(10)} (Duration: ${(duration / 1000).toFixed(1)}s)`);
    console.log(`   Avg Profit: ${r.avgProfit > 0 ? '+' : ''}${r.avgProfit.toFixed(4)}%`);
    console.log(`   Win Rate: ${r.winRate.toFixed(1)}% (${r.profitableCount}/${r.totalTrades})`);
    if (r.avgLiquidityScore) {
      console.log(`   Avg Liquidity Score: ${r.avgLiquidityScore.toFixed(4)}`);
    }
  }

  // Find current strategy result
  const currentStrategy = results.find(r => r.entryTime === 2000 && r.exitTime === 15000);
  if (currentStrategy) {
    const currentRank = results.indexOf(currentStrategy) + 1;
    console.log('\n\n' + '═'.repeat(100));
    console.log('\n📍 CURRENT STRATEGY PERFORMANCE:\n');
    console.log(`Rank: #${currentRank} out of ${results.length}`);
    console.log(`Entry: +2000ms → Exit: +15000ms (Duration: 13s)`);
    console.log(`Avg Profit: ${currentStrategy.avgProfit > 0 ? '+' : ''}${currentStrategy.avgProfit.toFixed(4)}%`);
    console.log(`Win Rate: ${currentStrategy.winRate.toFixed(1)}% (${currentStrategy.profitableCount}/${currentStrategy.totalTrades})`);
    if (currentStrategy.avgLiquidityScore) {
      console.log(`Avg Liquidity Score: ${currentStrategy.avgLiquidityScore.toFixed(4)}`);
    }
  }

  // Analyze liquidity correlation
  console.log('\n\n' + '═'.repeat(100));
  console.log('\n📊 LIQUIDITY ANALYSIS:\n');

  const allTrades = results.flatMap(r => r.trades).filter(t => t.liquidityScore !== undefined);
  if (allTrades.length > 0) {
    // Group by liquidity ranges
    const veryLowLiq = allTrades.filter(t => t.liquidityScore! < 0.5);
    const lowLiq = allTrades.filter(t => t.liquidityScore! >= 0.5 && t.liquidityScore! < 1.0);
    const mediumLiq = allTrades.filter(t => t.liquidityScore! >= 1.0 && t.liquidityScore! < 2.0);
    const highLiq = allTrades.filter(t => t.liquidityScore! >= 2.0);

    const analyzeGroup = (trades: typeof allTrades, label: string) => {
      if (trades.length === 0) return;
      const profitable = trades.filter(t => t.profit > 0);
      const avgProfit = trades.reduce((sum, t) => sum + t.profit, 0) / trades.length;
      const winRate = (profitable.length / trades.length) * 100;
      const avgLiq = trades.reduce((sum, t) => sum + (t.liquidityScore || 0), 0) / trades.length;

      console.log(`${label}:`);
      console.log(`  Trades: ${trades.length}`);
      console.log(`  Avg Liquidity: ${avgLiq.toFixed(4)}`);
      console.log(`  Avg Profit: ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}%`);
      console.log(`  Win Rate: ${winRate.toFixed(1)}%`);
      console.log('');
    };

    analyzeGroup(veryLowLiq, 'Very Low Liquidity (< 0.5)');
    analyzeGroup(lowLiq, 'Low Liquidity (0.5 - 1.0)');
    analyzeGroup(mediumLiq, 'Medium Liquidity (1.0 - 2.0)');
    analyzeGroup(highLiq, 'High Liquidity (≥ 2.0)');
  }

  // Best entry time analysis
  console.log('\n' + '═'.repeat(100));
  console.log('\n⏱️  OPTIMAL ENTRY TIME ANALYSIS:\n');

  const entryTimePerformance = new Map<number, { avgProfit: number; winRate: number; count: number }>();
  for (const entryTime of entryTimes) {
    const entrySamples = results.filter(r => r.entryTime === entryTime);
    if (entrySamples.length > 0) {
      const avgProfit = entrySamples.reduce((sum, r) => sum + r.avgProfit, 0) / entrySamples.length;
      const avgWinRate = entrySamples.reduce((sum, r) => sum + r.winRate, 0) / entrySamples.length;
      entryTimePerformance.set(entryTime, {
        avgProfit,
        winRate: avgWinRate,
        count: entrySamples.length,
      });
    }
  }

  const sortedEntryTimes = Array.from(entryTimePerformance.entries())
    .sort((a, b) => b[1].avgProfit - a[1].avgProfit);

  console.log('Entry times ranked by average profit across all exit times:\n');
  sortedEntryTimes.forEach(([time, stats], index) => {
    const label = time >= 0 ? `+${time}ms` : `${time}ms`;
    console.log(`${index + 1}. ${label.padEnd(10)} → Avg: ${stats.avgProfit > 0 ? '+' : ''}${stats.avgProfit.toFixed(4)}%, Win Rate: ${stats.winRate.toFixed(1)}%`);
  });

  // Best exit time analysis
  console.log('\n\n' + '═'.repeat(100));
  console.log('\n⏱️  OPTIMAL EXIT TIME ANALYSIS:\n');

  const exitTimePerformance = new Map<number, { avgProfit: number; winRate: number; count: number }>();
  for (const exitTime of exitTimes) {
    const exitSamples = results.filter(r => r.exitTime === exitTime);
    if (exitSamples.length > 0) {
      const avgProfit = exitSamples.reduce((sum, r) => sum + r.avgProfit, 0) / exitSamples.length;
      const avgWinRate = exitSamples.reduce((sum, r) => sum + r.winRate, 0) / exitSamples.length;
      exitTimePerformance.set(exitTime, {
        avgProfit,
        winRate: avgWinRate,
        count: exitSamples.length,
      });
    }
  }

  const sortedExitTimes = Array.from(exitTimePerformance.entries())
    .sort((a, b) => b[1].avgProfit - a[1].avgProfit);

  console.log('Exit times ranked by average profit across all entry times:\n');
  sortedExitTimes.forEach(([time, stats], index) => {
    const label = time >= 0 ? `+${time}ms` : `${time}ms`;
    console.log(`${index + 1}. ${label.padEnd(10)} → Avg: ${stats.avgProfit > 0 ? '+' : ''}${stats.avgProfit.toFixed(4)}%, Win Rate: ${stats.winRate.toFixed(1)}%`);
  });

  // Recommendation
  console.log('\n\n' + '═'.repeat(100));
  console.log('\n💡 RECOMMENDATION:\n');

  const bestResult = results[0];
  if (!bestResult) {
    console.log('No results found');
    process.exit(1);
  }
  const entryLabel = bestResult.entryTime >= 0 ? `+${bestResult.entryTime}ms` : `${bestResult.entryTime}ms`;
  const exitLabel = bestResult.exitTime >= 0 ? `+${bestResult.exitTime}ms` : `${bestResult.exitTime}ms`;
  const duration = bestResult.exitTime - bestResult.entryTime;

  console.log(`Optimal Strategy: Entry at ${entryLabel}, Exit at ${exitLabel} (${(duration / 1000).toFixed(1)}s duration)`);
  console.log(`Expected Performance:`);
  console.log(`  - Average Profit: ${bestResult.avgProfit > 0 ? '+' : ''}${bestResult.avgProfit.toFixed(4)}%`);
  console.log(`  - Win Rate: ${bestResult.winRate.toFixed(1)}%`);
  if (bestResult.avgLiquidityScore) {
    console.log(`  - Avg Liquidity Score: ${bestResult.avgLiquidityScore.toFixed(4)}`);
  }

  if (currentStrategy) {
    const improvement = bestResult.avgProfit - currentStrategy.avgProfit;
    console.log(`\nImprovement over current strategy (+2000ms/+15000ms):`);
    console.log(`  - Profit improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(4)}%`);
    console.log(`  - Win rate change: ${(bestResult.winRate - currentStrategy.winRate) > 0 ? '+' : ''}${(bestResult.winRate - currentStrategy.winRate).toFixed(1)}%`);
  }

  console.log('\n' + '═'.repeat(100) + '\n');
}

optimizeEntryTiming()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
