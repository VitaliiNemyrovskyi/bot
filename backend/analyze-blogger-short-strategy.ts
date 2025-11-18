/**
 * Analyze BLOGGER'S SHORT Strategy
 *
 * Strategy: Enter SHORT 5 seconds BEFORE funding, exit at lowest price
 * Blogger claims: Pays funding but profits from price drop
 * Let's verify if this is profitable after accounting for funding cost
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeBloggerShortStrategy() {
  console.log('\n📊 BLOGGER SHORT STRATEGY ANALYSIS\n');
  console.log('='.repeat(80));
  console.log('Strategy: Enter SHORT 3-10 seconds before funding');
  console.log('Exit: At lowest price point (around 0s to +2s)');
  console.log('Claim: Price drop > Funding cost → Net profit');
  console.log('='.repeat(80));

  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      totalDataPoints: { gte: 50 }
    },
    include: {
      dataPoints: {
        orderBy: { bybitTimestamp: 'asc' }
      }
    }
  });

  console.log(`\n✅ Found ${sessions.length} sessions\n`);

  const MAKER_FEE = 0.055;
  const TAKER_FEE = 0.055;
  const SLIPPAGE = 0.04;
  const TOTAL_COST = (MAKER_FEE + TAKER_FEE + SLIPPAGE) / 100;

  // Test different SHORT entry points before funding
  const entryOffsets = [-10, -8, -5, -3, -2, -1];

  console.log('='.repeat(80));
  console.log('📊 TESTING BLOGGER SHORT STRATEGIES:\n');
  console.log('Entry | Exit | Price Drop | Funding Cost | Net Return | Win% | Trades');
  console.log('-'.repeat(80));

  interface StrategyResult {
    entry: number;
    exit: number;
    avgPriceDrop: number;
    avgFundingCost: number;
    avgNetReturn: number;
    winRate: number;
    trades: number;
    medianReturn: number;
    bestTrade: number;
    worstTrade: number;
  }

  const results: StrategyResult[] = [];

  for (const entryOffset of entryOffsets) {
    // For each entry, we'll find the LOWEST price after entry and before +3s
    const tradeResults: Array<{
      priceDrop: number;
      fundingCost: number;
      netReturn: number;
      exitOffset: number;
    }> = [];

    for (const session of sessions) {
      if (!session.fundingPaymentTime) continue;

      const fundingTimeMs = session.fundingPaymentTime.getTime();
      const entryTimeMs = fundingTimeMs + (entryOffset * 1000);

      const entryPoint = findClosest(session.dataPoints, entryTimeMs);
      if (!entryPoint) continue;

      const entryDiff = Math.abs(Number(entryPoint.bybitTimestamp) - entryTimeMs);
      if (entryDiff > 500) continue;

      const entryPrice = entryPoint.lastPrice;

      // Find LOWEST price from entry to +3s (the "bottom")
      const pointsAfterEntry = session.dataPoints.filter((p: any) => {
        const t = Number(p.bybitTimestamp);
        return t >= Number(entryPoint.bybitTimestamp) && t <= fundingTimeMs + 3000;
      });

      if (pointsAfterEntry.length === 0) continue;

      const lowestPoint = pointsAfterEntry.reduce((lowest: any, point: any) =>
        point.lastPrice < lowest.lastPrice ? point : lowest
      );

      const exitPrice = lowestPoint.lastPrice;
      const exitTimeMs = Number(lowestPoint.bybitTimestamp);
      const exitOffset = (exitTimeMs - fundingTimeMs) / 1000;

      // SHORT: profit from price drop
      const priceDrop = ((entryPrice - exitPrice) / entryPrice) * 100;

      // We cross funding time if exit is after funding
      const crossesFunding = exitOffset > 0;
      let fundingCost = 0;

      if (crossesFunding) {
        const fundingRate = session.fundingRate || 0;
        fundingCost = Math.abs(fundingRate) * 100; // SHORT pays this
      }

      // Net return = price drop - funding cost - trading costs
      const netReturn = priceDrop - fundingCost - (TOTAL_COST * 100);

      tradeResults.push({
        priceDrop,
        fundingCost,
        netReturn,
        exitOffset
      });
    }

    if (tradeResults.length >= 5) {
      const avgPriceDrop = average(tradeResults.map(t => t.priceDrop));
      const avgFundingCost = average(tradeResults.map(t => t.fundingCost));
      const avgNetReturn = average(tradeResults.map(t => t.netReturn));
      const medianReturn = median(tradeResults.map(t => t.netReturn));
      const avgExitOffset = average(tradeResults.map(t => t.exitOffset));
      const winRate = (tradeResults.filter(t => t.netReturn > 0).length / tradeResults.length) * 100;
      const bestTrade = Math.max(...tradeResults.map(t => t.netReturn));
      const worstTrade = Math.min(...tradeResults.map(t => t.netReturn));

      results.push({
        entry: entryOffset,
        exit: avgExitOffset,
        avgPriceDrop,
        avgFundingCost,
        avgNetReturn,
        winRate,
        trades: tradeResults.length,
        medianReturn,
        bestTrade,
        worstTrade
      });

      const entryStr = formatOffset(entryOffset).padEnd(6);
      const exitStr = formatOffset(avgExitOffset).padEnd(5);
      const dropStr = `+${avgPriceDrop.toFixed(2)}%`.padEnd(11);
      const fundingStr = `-${avgFundingCost.toFixed(2)}%`.padEnd(13);
      const netStr = formatPercent(avgNetReturn).padEnd(11);
      const winStr = `${winRate.toFixed(0)}%`.padEnd(5);
      const tradesStr = tradeResults.length.toString();

      console.log(`${entryStr}| ${exitStr}| ${dropStr}| ${fundingStr}| ${netStr}| ${winStr}| ${tradesStr}`);
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('🏆 BEST SHORT STRATEGIES (by Net Return):\n');
  console.log('Rank | Entry | Exit  | Price Drop | Funding | Net Return | Win% | Trades');
  console.log('-'.repeat(80));

  const topByReturn = [...results]
    .sort((a, b) => b.avgNetReturn - a.avgNetReturn)
    .slice(0, 6);

  topByReturn.forEach((r, i) => {
    const rank = `${i + 1}.`.padEnd(5);
    const entry = formatOffset(r.entry).padEnd(6);
    const exit = formatOffset(r.exit).padEnd(6);
    const drop = `+${r.avgPriceDrop.toFixed(2)}%`.padEnd(11);
    const funding = `-${r.avgFundingCost.toFixed(2)}%`.padEnd(8);
    const net = formatPercent(r.avgNetReturn).padEnd(11);
    const win = `${r.winRate.toFixed(0)}%`.padEnd(5);
    const trades = r.trades.toString();

    console.log(`${rank}| ${entry}| ${exit}| ${drop}| ${funding}| ${net}| ${win}| ${trades}`);
  });

  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 VERDICT: DOES BLOGGER STRATEGY WORK?\n');

  const bestStrategy = topByReturn[0];

  console.log(`✅ BEST SHORT STRATEGY (Exit at Bottom):`);
  console.log(`   Entry: ${formatOffset(bestStrategy.entry)} (${Math.abs(bestStrategy.entry)}s before funding)`);
  console.log(`   Exit: ${formatOffset(bestStrategy.exit)} (at lowest price)`);

  console.log(`\n📊 Performance Breakdown:`);
  console.log(`   Price Drop: +${bestStrategy.avgPriceDrop.toFixed(3)}%`);
  console.log(`   Funding Paid: -${bestStrategy.avgFundingCost.toFixed(3)}%`);
  console.log(`   Trading Costs: -${(TOTAL_COST * 100).toFixed(3)}%`);
  console.log(`   ─────────────────────────`);
  console.log(`   NET RETURN: ${formatPercent(bestStrategy.avgNetReturn)}`);
  console.log(`   Median Return: ${formatPercent(bestStrategy.medianReturn)}`);
  console.log(`   Win Rate: ${bestStrategy.winRate.toFixed(1)}%`);

  console.log(`\n📈 Trade Range:`);
  console.log(`   Best Trade: ${formatPercent(bestStrategy.bestTrade)}`);
  console.log(`   Worst Trade: ${formatPercent(bestStrategy.worstTrade)}`);

  console.log(`\n💰 Projected Monthly Performance:`);
  const monthlyReturn = bestStrategy.avgNetReturn * 90;
  console.log(`   Expected Monthly ROI: ${monthlyReturn.toFixed(2)}%`);
  console.log(`   With $1,000 capital: $${(1000 * monthlyReturn / 100).toFixed(2)} profit/month`);

  console.log(`\n\n💡 KEY INSIGHTS:\n`);

  const avgPriceDrop = average(results.map(r => r.avgPriceDrop));
  const avgFunding = average(results.map(r => r.avgFundingCost));

  console.log(`1️⃣  Average Price Drop:`);
  console.log(`   From entry to lowest point: +${avgPriceDrop.toFixed(3)}%`);
  console.log(`   This is what we EARN from SHORT position`);

  console.log(`\n2️⃣  Average Funding Cost:`);
  console.log(`   SHORT pays: -${avgFunding.toFixed(3)}%`);
  console.log(`   This is what we PAY for holding through funding`);

  console.log(`\n3️⃣  Net Result:`);
  const avgNet = avgPriceDrop - avgFunding - (TOTAL_COST * 100);
  console.log(`   Price Drop: +${avgPriceDrop.toFixed(3)}%`);
  console.log(`   - Funding: -${avgFunding.toFixed(3)}%`);
  console.log(`   - Costs: -${(TOTAL_COST * 100).toFixed(3)}%`);
  console.log(`   = Net: ${formatPercent(avgNet)}`);

  if (avgNet > 0.3) {
    console.log(`\n   ✅ BLOGGER IS RIGHT! Strategy is profitable!`);
    console.log(`   Price drop EXCEEDS funding cost by ${(avgNet).toFixed(3)}%`);
  } else if (avgNet > 0) {
    console.log(`\n   ⚠️  BARELY PROFITABLE: Only ${avgNet.toFixed(3)}% net`);
    console.log(`   Very sensitive to execution and slippage`);
  } else {
    console.log(`\n   ❌ NOT PROFITABLE: Funding exceeds price drop`);
  }

  console.log(`\n4️⃣  Exit Timing (Lowest Price):`);
  const avgExit = average(results.map(r => r.exit));
  console.log(`   Average lowest price occurs: ${formatOffset(avgExit)}`);
  console.log(`   Range: ${formatOffset(Math.min(...results.map(r => r.exit)))} to ${formatOffset(Math.max(...results.map(r => r.exit)))}`);
  console.log(`   This is the optimal exit window`);

  console.log(`\n5️⃣  Comparison with PRE-FUNDING LONG:`);
  console.log(`   SHORT (blogger): ${formatPercent(bestStrategy.avgNetReturn)} / ${bestStrategy.winRate.toFixed(0)}% win`);
  console.log(`   LONG (-1s/+10s): +0.552% / 68% win`);

  if (bestStrategy.avgNetReturn > 0.552) {
    console.log(`   → SHORT is BETTER! (+${(bestStrategy.avgNetReturn - 0.552).toFixed(3)}% more profit)`);
  } else {
    console.log(`   → LONG is BETTER! (+${(0.552 - bestStrategy.avgNetReturn).toFixed(3)}% more profit)`);
  }

  console.log(`\n⚠️  CHALLENGES:\n`);
  console.log(`   1. Must detect lowest price in REAL-TIME (hard!)`);
  console.log(`   2. Exit timing is unpredictable (${formatOffset(Math.min(...results.map(r => r.exit)))} to ${formatOffset(Math.max(...results.map(r => r.exit)))})`);
  console.log(`   3. Most profit comes from guessing exact bottom`);
  console.log(`   4. Miss the bottom by 1s = significantly less profit`);

  console.log(`\n💡 RECOMMENDATION:\n`);
  if (bestStrategy.avgNetReturn > 0.552) {
    console.log(`   IF you can reliably detect the bottom → Use SHORT strategy`);
    console.log(`   IF you cannot detect bottom perfectly → Use LONG -1s/+10s (easier, more consistent)`);
  } else {
    console.log(`   Use LONG -1s/+10s strategy (better returns, easier execution)`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

function findClosest(dataPoints: any[], targetTimeMs: number): any | null {
  if (dataPoints.length === 0) return null;
  return dataPoints.reduce((closest: any, point: any) => {
    const pointTime = Number(point.bybitTimestamp);
    const closestTime = Number(closest.bybitTimestamp);
    return Math.abs(pointTime - targetTimeMs) < Math.abs(closestTime - targetTimeMs)
      ? point : closest;
  });
}

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

function formatOffset(seconds: number): string {
  if (seconds === 0) return '0s';
  if (seconds < 0) return `${seconds.toFixed(1)}s`;
  return `+${seconds.toFixed(1)}s`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
}

analyzeBloggerShortStrategy()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
