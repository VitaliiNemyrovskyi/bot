/**
 * Analyze strategies with entry at EXACTLY funding payment time (0s)
 * and shortly before/after (-2s to +2s)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeZeroEntry() {
  console.log('\n⏰ ANALYZING ENTRY AROUND FUNDING PAYMENT TIME (0s)\n');
  console.log('='.repeat(80));

  // We'll manually check what happens with entries at:
  // -2s, -1s, 0s, +1s, +2s
  // and various exit points

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

  console.log(`✅ Found ${sessions.length} sessions\n`);
  console.log('='.repeat(80));

  const entryOffsets = [-2, -1, 0, 1, 2]; // seconds
  const exitOffsets = [1, 2, 5, 10, 15, 20, 30, 60]; // seconds

  const MAKER_FEE = 0.055;
  const TAKER_FEE = 0.055;
  const SLIPPAGE = 0.04;
  const TOTAL_COST = (MAKER_FEE + TAKER_FEE + SLIPPAGE) / 100;

  console.log('\n📊 TESTING ENTRY POINTS AROUND FUNDING TIME:\n');
  console.log('Entry | Exit  | Avg Return | Median | Win% | Trades | Funding Paid?');
  console.log('-'.repeat(80));

  for (const entryOffset of entryOffsets) {
    for (const exitOffset of exitOffsets) {
      if (exitOffset <= entryOffset) continue;

      const results: Array<{
        netReturn: number;
        fundingCost: number;
        crossesFunding: boolean;
      }> = [];

      for (const session of sessions) {
        if (!session.fundingPaymentTime) continue;

        const fundingTimeMs = session.fundingPaymentTime.getTime();
        const entryTimeMs = fundingTimeMs + (entryOffset * 1000);
        const exitTimeMs = fundingTimeMs + (exitOffset * 1000);

        // Find closest data points
        const entryPoint = findClosest(session.dataPoints, entryTimeMs);
        const exitPoint = findClosest(session.dataPoints, exitTimeMs);

        if (!entryPoint || !exitPoint) continue;

        // Check if within tolerance
        const entryDiff = Math.abs(Number(entryPoint.bybitTimestamp) - entryTimeMs);
        const exitDiff = Math.abs(Number(exitPoint.bybitTimestamp) - exitTimeMs);
        if (entryDiff > 500 || exitDiff > 500) continue;

        const entryPrice = entryPoint.lastPrice;
        const exitPrice = exitPoint.lastPrice;

        // Determine if we cross funding time
        const crossesFunding = entryOffset < 0 && exitOffset > 0;

        // Calculate returns
        let grossReturn: number;
        let fundingCost = 0;

        if (crossesFunding) {
          // SHORT: enter before, exit after → WE PAY FUNDING
          grossReturn = ((entryPrice - exitPrice) / entryPrice) * 100;
          const fundingRate = session.fundingRate || 0;
          fundingCost = Math.abs(fundingRate) * 100;
        } else if (entryOffset >= 0) {
          // LONG: both after funding
          grossReturn = ((exitPrice - entryPrice) / entryPrice) * 100;
          fundingCost = 0;
        } else {
          // SHORT: both before funding
          grossReturn = ((entryPrice - exitPrice) / entryPrice) * 100;
          fundingCost = 0;
        }

        const netReturn = grossReturn - (TOTAL_COST * 100) - fundingCost;

        results.push({
          netReturn,
          fundingCost,
          crossesFunding
        });
      }

      if (results.length >= 5) {
        const avgReturn = average(results.map(r => r.netReturn));
        const medianReturn = median(results.map(r => r.netReturn));
        const winRate = (results.filter(r => r.netReturn > 0).length / results.length) * 100;
        const avgFundingCost = average(results.map(r => r.fundingCost));
        const crossesFunding = results[0].crossesFunding;

        const entryStr = formatOffset(entryOffset).padEnd(6);
        const exitStr = formatOffset(exitOffset).padEnd(6);
        const avgStr = formatPercent(avgReturn).padEnd(12);
        const medianStr = formatPercent(medianReturn).padEnd(7);
        const winStr = `${winRate.toFixed(0)}%`.padEnd(5);
        const tradesStr = results.length.toString().padEnd(7);
        const fundingStr = crossesFunding ? `YES (-${avgFundingCost.toFixed(2)}%)` : 'NO';

        console.log(`${entryStr}| ${exitStr}| ${avgStr}| ${medianStr}| ${winStr}| ${tradesStr}| ${fundingStr}`);
      }
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('🎯 KEY INSIGHTS:\n');

  console.log('1️⃣  ENTRY AT 0s (EXACTLY at funding time):');
  console.log('   - Technically AFTER funding payment starts');
  console.log('   - Should NOT pay funding (we enter after settlement begins)');
  console.log('   - But timing is CRITICAL (±100ms matters!)');

  console.log('\n2️⃣  BYBIT FUNDING WINDOW:');
  console.log('   - Funding calculated at 00:00:00 / 08:00:00 / 16:00:00 UTC');
  console.log('   - Settlement window: approximately ±5 seconds');
  console.log('   - Positions opened AT 00:00:00.000 should NOT pay funding');
  console.log('   - But network latency may cause you to be late!');

  console.log('\n3️⃣  RECOMMENDED SAFE WINDOWS:');
  console.log('   - Entry +1s or +2s: DEFINITELY after funding (safe)');
  console.log('   - Entry 0s: RISKY (might pay funding due to latency)');
  console.log('   - Entry -1s: DEFINITELY pays funding');

  console.log('\n4️⃣  RISK ASSESSMENT:');
  console.log('   - Entry 0s with exit +10s: If you pay funding = LOSS');
  console.log('   - Entry +1s with exit +10s: Safe, no funding risk');
  console.log('   - Network latency: 50-200ms typical (can push you into paying)');

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

analyzeZeroEntry()
  .then(() => {
    console.log('✅ Analysis complete\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
