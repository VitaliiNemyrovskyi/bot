import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  entryMs: number;
  exitMs: number;
  winRate: number;
  avgProfit: number;
  totalProfit: number;
  bestTrade: number;
  worstTrade: number;
  tests: number;
}

async function main() {
  console.log('🔍 PRECISE TIMING OPTIMIZATION FOR SHORT STRATEGY');
  console.log('Testing entry times from +10ms to +2000ms after funding time\n');

  // Get all completed recordings
  const recordings = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      dataPoints: {
        some: {}
      }
    },
    include: {
      dataPoints: {
        orderBy: {
          relativeTimeMs: 'asc',
        },
      },
    },
  });

  console.log(`Found ${recordings.length} completed recording sessions\n`);

  // Test entry times: 10ms, 20ms, 50ms, 100ms, 150ms, 200ms, 250ms, 300ms, 400ms, 500ms, 750ms, 1000ms, 1500ms, 2000ms
  const entryTimes = [10, 20, 50, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000]; // in milliseconds

  // Test exit times: 1s, 2s, 3s, 5s, 7s, 10s, 15s, 20s, 30s
  const exitTimes = [1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 30000]; // in milliseconds

  const results: TestResult[] = [];
  const MAKER_FEE = 0.00055; // 0.055%
  const TAKER_FEE = 0.00055; // 0.055%
  const TOTAL_FEES = (MAKER_FEE + TAKER_FEE) * 100; // 0.11%

  console.log(`Testing ${entryTimes.length} entry times × ${exitTimes.length} exit times = ${entryTimes.length * exitTimes.length} combinations\n`);

  for (const entryMs of entryTimes) {
    for (const exitMs of exitTimes) {
      let wins = 0;
      let losses = 0;
      let totalProfitSum = 0;
      let bestTrade = -Infinity;
      let worstTrade = Infinity;

      for (const recording of recordings) {
        // Find entry point using relativeTimeMs (0 = funding time)
        const entryPoint = recording.dataPoints.find(dp =>
          dp.relativeTimeMs >= entryMs
        );

        if (!entryPoint) continue;

        // Find exit point (entry relativeTime + exitMs)
        const exitTargetTime = entryPoint.relativeTimeMs + exitMs;
        const exitPoint = recording.dataPoints.find(dp =>
          dp.relativeTimeMs >= exitTargetTime
        );

        if (!exitPoint) continue;

        // Calculate profit for SHORT position
        const entryPrice = Number(entryPoint.lastPrice);
        const exitPrice = Number(exitPoint.lastPrice);
        const priceDrop = ((entryPrice - exitPrice) / entryPrice) * 100; // Positive if price dropped
        const netProfit = priceDrop - TOTAL_FEES;

        totalProfitSum += netProfit;
        if (netProfit > 0) wins++;
        else losses++;

        if (netProfit > bestTrade) bestTrade = netProfit;
        if (netProfit < worstTrade) worstTrade = netProfit;
      }

      const totalTests = wins + losses;
      if (totalTests > 0) {
        results.push({
          entryMs,
          exitMs,
          winRate: (wins / totalTests) * 100,
          avgProfit: totalProfitSum / totalTests,
          totalProfit: totalProfitSum,
          bestTrade,
          worstTrade,
          tests: totalTests,
        });
      }
    }
  }

  // Sort by average profit
  results.sort((a, b) => b.avgProfit - a.avgProfit);

  console.log('═'.repeat(120));
  console.log('🏆 TOP 30 BEST TIMING COMBINATIONS (by Average Profit)');
  console.log('═'.repeat(120));
  console.log('Entry      Exit       Win Rate   Avg Profit   Total Profit   Best      Worst     Tests');
  console.log('─'.repeat(120));

  for (let i = 0; i < Math.min(30, results.length); i++) {
    const r = results[i];
    console.log(
      `+${r.entryMs.toString().padStart(4)}ms   ` +
      `+${(r.exitMs / 1000).toFixed(2).padStart(5)}s   ` +
      `${r.winRate.toFixed(1).padStart(5)}%    ` +
      `${r.avgProfit >= 0 ? '+' : ''}${r.avgProfit.toFixed(4).padStart(8)}%   ` +
      `${r.totalProfit >= 0 ? '+' : ''}${r.totalProfit.toFixed(4).padStart(9)}%   ` +
      `${r.bestTrade >= 0 ? '+' : ''}${r.bestTrade.toFixed(4).padStart(8)}%  ` +
      `${r.worstTrade >= 0 ? '+' : ''}${r.worstTrade.toFixed(4).padStart(8)}%  ` +
      `${r.tests}`
    );
  }

  console.log('═'.repeat(120));

  // Find best win rate
  const bestWinRate = results.reduce((best, curr) =>
    curr.winRate > best.winRate ? curr : best
  , results[0]);

  console.log('\n📊 ANALYSIS:\n');
  console.log(`🎯 Best Average Profit: Entry +${results[0].entryMs}ms, Exit +${results[0].exitMs / 1000}s`);
  console.log(`   Average: ${results[0].avgProfit >= 0 ? '+' : ''}${results[0].avgProfit.toFixed(4)}% | Win Rate: ${results[0].winRate.toFixed(1)}%\n`);

  console.log(`🎲 Best Win Rate: Entry +${bestWinRate.entryMs}ms, Exit +${bestWinRate.exitMs / 1000}s`);
  console.log(`   Win Rate: ${bestWinRate.winRate.toFixed(1)}% | Average: ${bestWinRate.avgProfit >= 0 ? '+' : ''}${bestWinRate.avgProfit.toFixed(4)}%\n`);

  console.log('═'.repeat(120));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
