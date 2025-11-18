/**
 * Analyze PRE-FUNDING LONG Strategy
 *
 * Strategy: Enter LONG 5-15 seconds BEFORE funding payment
 * Goal: Receive funding payment (~1-2%) but endure price drop
 * Question: Does funding payment compensate for price drop?
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzePreFundingLong() {
  console.log('\n📊 PRE-FUNDING LONG STRATEGY ANALYSIS\n');
  console.log('='.repeat(80));
  console.log('Strategy: Enter LONG before funding, exit after funding');
  console.log('Benefit: RECEIVE funding payment (~1-2%)');
  console.log('Risk: Price drops before funding (~1-3%)');
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

  // Test different entry points BEFORE funding
  const entryOffsets = [-15, -12, -10, -8, -5, -3, -2, -1];
  const exitOffsets = [1, 2, 5, 10, 15, 20, 30, 60];

  console.log('='.repeat(80));
  console.log('📊 TESTING PRE-FUNDING LONG STRATEGIES:\n');
  console.log('Entry | Exit  | Price Δ | Funding | Net Return | Win% | Trades');
  console.log('-'.repeat(80));

  interface StrategyResult {
    entry: number;
    exit: number;
    avgPriceChange: number;
    avgFundingReceived: number;
    avgNetReturn: number;
    winRate: number;
    trades: number;
    medianReturn: number;
  }

  const results: StrategyResult[] = [];

  for (const entryOffset of entryOffsets) {
    for (const exitOffset of exitOffsets) {
      const tradeResults: Array<{
        priceChange: number;
        fundingReceived: number;
        netReturn: number;
      }> = [];

      for (const session of sessions) {
        if (!session.fundingPaymentTime) continue;

        const fundingTimeMs = session.fundingPaymentTime.getTime();
        const entryTimeMs = fundingTimeMs + (entryOffset * 1000);
        const exitTimeMs = fundingTimeMs + (exitOffset * 1000);

        const entryPoint = findClosest(session.dataPoints, entryTimeMs);
        const exitPoint = findClosest(session.dataPoints, exitTimeMs);

        if (!entryPoint || !exitPoint) continue;

        const entryDiff = Math.abs(Number(entryPoint.bybitTimestamp) - entryTimeMs);
        const exitDiff = Math.abs(Number(exitPoint.bybitTimestamp) - exitTimeMs);
        if (entryDiff > 500 || exitDiff > 500) continue;

        const entryPrice = entryPoint.lastPrice;
        const exitPrice = exitPoint.lastPrice;

        // LONG: price change
        const priceChange = ((exitPrice - entryPrice) / entryPrice) * 100;

        // We cross funding time (enter before, exit after)
        // LONG receives funding (negative funding rate means SHORT pays LONG)
        const fundingRate = session.fundingRate || 0; // e.g., -0.01 = -1%
        const fundingReceived = Math.abs(fundingRate) * 100; // We RECEIVE this

        // Net return = price change + funding received - trading costs
        const netReturn = priceChange + fundingReceived - (TOTAL_COST * 100);

        tradeResults.push({
          priceChange,
          fundingReceived,
          netReturn
        });
      }

      if (tradeResults.length >= 5) {
        const avgPriceChange = average(tradeResults.map(t => t.priceChange));
        const avgFundingReceived = average(tradeResults.map(t => t.fundingReceived));
        const avgNetReturn = average(tradeResults.map(t => t.netReturn));
        const medianReturn = median(tradeResults.map(t => t.netReturn));
        const winRate = (tradeResults.filter(t => t.netReturn > 0).length / tradeResults.length) * 100;

        results.push({
          entry: entryOffset,
          exit: exitOffset,
          avgPriceChange,
          avgFundingReceived,
          avgNetReturn,
          winRate,
          trades: tradeResults.length,
          medianReturn
        });

        const entryStr = formatOffset(entryOffset).padEnd(6);
        const exitStr = formatOffset(exitOffset).padEnd(6);
        const priceStr = formatPercent(avgPriceChange).padEnd(8);
        const fundingStr = `+${avgFundingReceived.toFixed(2)}%`.padEnd(8);
        const netStr = formatPercent(avgNetReturn).padEnd(11);
        const winStr = `${winRate.toFixed(0)}%`.padEnd(5);
        const tradesStr = tradeResults.length.toString();

        console.log(`${entryStr}| ${exitStr}| ${priceStr}| ${fundingStr}| ${netStr}| ${winStr}| ${tradesStr}`);
      }
    }
  }

  // Find best strategies
  console.log('\n\n' + '='.repeat(80));
  console.log('🏆 TOP 10 STRATEGIES BY NET RETURN:\n');
  console.log('Rank | Entry | Exit  | Net Return | Win% | Price Δ | Funding | Trades');
  console.log('-'.repeat(80));

  const topByReturn = [...results]
    .sort((a, b) => b.avgNetReturn - a.avgNetReturn)
    .slice(0, 10);

  topByReturn.forEach((r, i) => {
    const rank = `${i + 1}.`.padEnd(5);
    const entry = formatOffset(r.entry).padEnd(6);
    const exit = formatOffset(r.exit).padEnd(6);
    const net = formatPercent(r.avgNetReturn).padEnd(11);
    const win = `${r.winRate.toFixed(0)}%`.padEnd(5);
    const price = formatPercent(r.avgPriceChange).padEnd(8);
    const funding = `+${r.avgFundingReceived.toFixed(2)}%`.padEnd(8);
    const trades = r.trades.toString();

    console.log(`${rank}| ${entry}| ${exit}| ${net}| ${win}| ${price}| ${funding}| ${trades}`);
  });

  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 ANALYSIS & RECOMMENDATIONS\n');

  const bestStrategy = topByReturn[0];

  console.log(`✅ BEST PRE-FUNDING LONG STRATEGY:`);
  console.log(`   Entry: ${formatOffset(bestStrategy.entry)} (${Math.abs(bestStrategy.entry)} seconds before funding)`);
  console.log(`   Exit: ${formatOffset(bestStrategy.exit)} (${bestStrategy.exit} seconds after funding)`);
  console.log(`   Holding Period: ${bestStrategy.exit - bestStrategy.entry} seconds`);

  console.log(`\n📊 Performance Breakdown:`);
  console.log(`   Price Change: ${formatPercent(bestStrategy.avgPriceChange)}`);
  console.log(`   Funding Received: +${bestStrategy.avgFundingReceived.toFixed(3)}%`);
  console.log(`   Trading Costs: -${(TOTAL_COST * 100).toFixed(3)}%`);
  console.log(`   ─────────────────────────`);
  console.log(`   NET RETURN: ${formatPercent(bestStrategy.avgNetReturn)}`);
  console.log(`   Median Return: ${formatPercent(bestStrategy.medianReturn)}`);
  console.log(`   Win Rate: ${bestStrategy.winRate.toFixed(1)}%`);

  console.log(`\n💰 Projected Monthly Performance:`);
  const monthlyReturn = bestStrategy.avgNetReturn * 90; // 3 times/day × 30 days
  console.log(`   Expected Monthly ROI: ${monthlyReturn.toFixed(2)}%`);
  console.log(`   With $1,000 capital: $${(1000 * monthlyReturn / 100).toFixed(2)} profit/month`);

  console.log(`\n💡 KEY INSIGHTS:\n`);

  const avgPriceDrop = average(results.map(r => r.avgPriceChange));
  const avgFunding = average(results.map(r => r.avgFundingReceived));

  console.log(`1️⃣  Average Price Drop (before funding):`);
  console.log(`   From entry to exit: ${formatPercent(avgPriceDrop)}`);
  console.log(`   This is the COST of holding LONG through funding`);

  console.log(`\n2️⃣  Average Funding Received:`);
  console.log(`   LONG receives: +${avgFunding.toFixed(3)}%`);
  console.log(`   This is the BENEFIT of holding LONG through funding`);

  console.log(`\n3️⃣  Net Result:`);
  const avgNet = avgPriceDrop + avgFunding - (TOTAL_COST * 100);
  console.log(`   Price Drop: ${formatPercent(avgPriceDrop)}`);
  console.log(`   + Funding: +${avgFunding.toFixed(3)}%`);
  console.log(`   - Costs: -${(TOTAL_COST * 100).toFixed(3)}%`);
  console.log(`   = Net: ${formatPercent(avgNet)}`);

  if (avgNet > 0) {
    console.log(`\n   ✅ STRATEGY IS PROFITABLE ON AVERAGE!`);
    console.log(`   Funding payment MORE than compensates for price drop`);
  } else {
    console.log(`\n   ❌ STRATEGY IS NOT PROFITABLE ON AVERAGE`);
    console.log(`   Price drop EXCEEDS funding payment benefit`);
  }

  console.log(`\n4️⃣  Optimal Timing:`);
  const bestEntry = topByReturn[0].entry;
  const bestExit = topByReturn[0].exit;
  console.log(`   Best Entry: ${Math.abs(bestEntry)}s before funding`);
  console.log(`   Best Exit: ${bestExit}s after funding`);
  console.log(`   Why? Minimizes price drop exposure, maximizes recovery capture`);

  console.log(`\n⚠️  RISKS:\n`);
  console.log(`   1. Price drop can exceed funding payment`);
  console.log(`   2. Win rate only ${bestStrategy.winRate.toFixed(0)}% (not consistent)`);
  console.log(`   3. Requires PERFECT timing (±100ms matters)`);
  console.log(`   4. Funding rates vary (-0.5% to -2%), affecting profitability`);

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
  if (seconds < 0) return `${seconds}s`;
  return `+${seconds}s`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}%`;
}

analyzePreFundingLong()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
