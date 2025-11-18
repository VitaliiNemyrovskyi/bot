/**
 * Optimize Entry/Exit Timing for SHORT Strategy
 * Tests various combinations to find the best timing parameters
 */

import prisma from '../lib/prisma';

interface TimingTest {
  entryTime: number;
  exitTime: number;
  totalTests: number;
  profitable: number;
  losses: number;
  winRate: number;
  avgProfit: number;
  totalProfit: number;
  bestProfit: number;
  worstProfit: number;
}

async function main() {
  console.log('\n🔍 OPTIMIZING ENTRY/EXIT TIMING FOR SHORT STRATEGY\n');
  console.log('Testing different entry and exit times...\n');

  // Find all completed recording sessions with data
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      dataPoints: {
        some: {}
      }
    },
    include: {
      dataPoints: {
        orderBy: {
          relativeTimeMs: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Found ${sessions.length} completed recording sessions\n`);

  if (sessions.length === 0) {
    console.log('❌ No data available for optimization');
    await prisma.$disconnect();
    return;
  }

  // Test entry times: Including pre-funding entries to test funding payment impact
  // WARNING: Entry < 0s means position is open during funding payment
  // For NEGATIVE funding rate: we RECEIVE payment (potential extra profit)
  // For POSITIVE funding rate: we PAY (potential loss)
  const entryTimes = [-50, -20, -10, 0, 20, 100, 250, 500, 750, 1000, 1500, 2000];

  // Test exit times: +1000ms to +10000ms (step: 500ms)
  const exitTimes = [1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000, 10000];

  const results: TimingTest[] = [];

  console.log(`Testing ${entryTimes.length} entry times × ${exitTimes.length} exit times = ${entryTimes.length * exitTimes.length} combinations\n`);

  for (const entryTime of entryTimes) {
    for (const exitTime of exitTimes) {
      // Skip invalid combinations (exit must be after entry)
      if (exitTime <= entryTime) continue;

      let totalTests = 0;
      let profitable = 0;
      let losses = 0;
      let totalProfitPct = 0;
      let profits: number[] = [];

      for (const session of sessions) {
        // Find price closest to entry time
        const priceAtEntry = session.dataPoints.reduce((prev, curr) =>
          Math.abs(curr.relativeTimeMs - entryTime) < Math.abs(prev.relativeTimeMs - entryTime) ? curr : prev
        );

        // Find price closest to exit time
        const priceAtExit = session.dataPoints.reduce((prev, curr) =>
          Math.abs(curr.relativeTimeMs - exitTime) < Math.abs(prev.relativeTimeMs - exitTime) ? curr : prev
        );

        if (priceAtEntry && priceAtExit) {
          const entryPrice = Number(priceAtEntry.lastPrice);
          const exitPrice = Number(priceAtExit.lastPrice);

          if (entryPrice && exitPrice && !isNaN(entryPrice) && !isNaN(exitPrice)) {
            // SHORT P&L: profit when price drops (entry > exit)
            const priceDrop = ((entryPrice - exitPrice) / entryPrice) * 100;
            const fees = 0.11; // 0.055% * 2
            const netProfit = priceDrop - fees;

            totalTests++;
            totalProfitPct += netProfit;
            profits.push(netProfit);

            if (netProfit > 0) {
              profitable++;
            } else {
              losses++;
            }
          }
        }
      }

      if (totalTests > 0) {
        const winRate = (profitable / totalTests) * 100;
        const avgProfit = totalProfitPct / totalTests;
        const bestProfit = Math.max(...profits);
        const worstProfit = Math.min(...profits);

        results.push({
          entryTime,
          exitTime,
          totalTests,
          profitable,
          losses,
          winRate,
          avgProfit,
          totalProfit: totalProfitPct,
          bestProfit,
          worstProfit
        });
      }
    }
  }

  // Sort by average profit (descending)
  results.sort((a, b) => b.avgProfit - a.avgProfit);

  console.log('═'.repeat(100));
  console.log('🏆 TOP 20 BEST TIMING COMBINATIONS (by Average Profit)');
  console.log('═'.repeat(100));
  console.log('Entry    Exit     Win Rate   Avg Profit   Total Profit   Best      Worst     Tests');
  console.log('─'.repeat(100));

  for (let i = 0; i < Math.min(20, results.length); i++) {
    const r = results[i];
    const entryStr = (r.entryTime >= 0 ? '+' : '') + (r.entryTime / 1000).toFixed(2) + 's';
    const exitStr = '+' + (r.exitTime / 1000).toFixed(2) + 's';
    const winRateStr = r.winRate.toFixed(1) + '%';
    const avgProfitStr = (r.avgProfit >= 0 ? '+' : '') + r.avgProfit.toFixed(4) + '%';
    const totalProfitStr = (r.totalProfit >= 0 ? '+' : '') + r.totalProfit.toFixed(4) + '%';
    const bestStr = '+' + r.bestProfit.toFixed(4) + '%';
    const worstStr = (r.worstProfit >= 0 ? '+' : '') + r.worstProfit.toFixed(4) + '%';

    console.log(
      `${entryStr.padEnd(8)} ${exitStr.padEnd(8)} ${winRateStr.padEnd(10)} ${avgProfitStr.padEnd(12)} ${totalProfitStr.padEnd(14)} ${bestStr.padEnd(9)} ${worstStr.padEnd(9)} ${r.totalTests}`
    );
  }

  console.log('═'.repeat(100));

  // Find best by win rate
  const bestByWinRate = [...results].sort((a, b) => b.winRate - a.winRate)[0];

  console.log('\n📊 ANALYSIS:\n');
  console.log(`🎯 Best Average Profit: Entry ${(results[0].entryTime / 1000).toFixed(2)}s, Exit +${(results[0].exitTime / 1000).toFixed(2)}s`);
  console.log(`   Average: ${results[0].avgProfit >= 0 ? '+' : ''}${results[0].avgProfit.toFixed(4)}% | Win Rate: ${results[0].winRate.toFixed(1)}%`);

  console.log(`\n🎲 Best Win Rate: Entry ${(bestByWinRate.entryTime / 1000).toFixed(2)}s, Exit +${(bestByWinRate.exitTime / 1000).toFixed(2)}s`);
  console.log(`   Win Rate: ${bestByWinRate.winRate.toFixed(1)}% | Average: ${bestByWinRate.avgProfit >= 0 ? '+' : ''}${bestByWinRate.avgProfit.toFixed(4)}%`);

  // Current strategy for comparison
  const currentStrategy = results.find(r => r.entryTime === 0 && r.exitTime === 3000);
  if (currentStrategy) {
    console.log(`\n📌 Current Strategy (0s → +3s):`);
    console.log(`   Average: ${currentStrategy.avgProfit >= 0 ? '+' : ''}${currentStrategy.avgProfit.toFixed(4)}% | Win Rate: ${currentStrategy.winRate.toFixed(1)}%`);

    const improvement = ((results[0].avgProfit - currentStrategy.avgProfit) / Math.abs(currentStrategy.avgProfit || 1)) * 100;
    console.log(`\n💡 Potential improvement: ${improvement >= 0 ? '+' : ''}${improvement.toFixed(1)}% better average profit`);
  }

  console.log('\n' + '═'.repeat(100) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  prisma.$disconnect();
  process.exit(1);
});
