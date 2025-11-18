/**
 * Analyze SHORT strategy viability for funding payment arbitrage
 *
 * Strategy: Open SHORT at 00:00:00 (funding payment time)
 *          Wait for price to drop by funding rate amount
 *          Exit if price doesn't drop by expected amount
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StrategyAnalysis {
  symbol: string;
  fundingRate: number;
  expectedDrop: number; // Expected price drop % (funding rate)
  actualMaxDrop: number; // Actual max price drop %
  timeToMaxDrop: number; // Seconds from 00:00:00 to max drop
  dropAtFunding: number; // Price drop exactly at 00:00:00
  targetReached: boolean; // Did price drop by funding rate amount?
  timeToTarget: number | null; // Seconds to reach target drop
  optimalExit: {
    time: number; // Seconds from 00:00:00
    price: number;
    profit: number; // % profit
  } | null;
  risk: {
    maxAdverseMove: number; // Worst case price move against us
    timeToAdverseMove: number;
  };
}

async function analyzeShortStrategy(sessionId: string, symbol: string): Promise<StrategyAnalysis | null> {
  const session = await prisma.fundingPaymentRecordingSession.findUnique({
    where: { id: sessionId },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' },
      },
    },
  });

  if (!session || session.dataPoints.length === 0) {
    console.log(`❌ No data for ${symbol}`);
    return null;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 SHORT STRATEGY ANALYSIS: ${symbol}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Expected Price Drop: ${(Math.abs(session.fundingRate) * 100).toFixed(4)}%`);
  console.log(`Total Data Points: ${session.dataPoints.length}`);

  // Convert to price points and group by seconds
  const bySecond = new Map<number, any[]>();

  for (const point of session.dataPoints) {
    const second = Math.floor(point.relativeTimeMs / 1000);
    if (!bySecond.has(second)) {
      bySecond.set(second, []);
    }
    bySecond.get(second)!.push({
      time: point.relativeTimeMs,
      price: parseFloat(point.lastPrice),
      bid: parseFloat(point.bid1Price),
      ask: parseFloat(point.ask1Price),
    });
  }

  const sortedSeconds = Array.from(bySecond.keys()).sort((a, b) => a - b);

  // Get entry price at 00:00:00 (funding payment time)
  const fundingSecond = bySecond.get(0);
  if (!fundingSecond || fundingSecond.length === 0) {
    console.log('❌ No data at funding payment time (0s)');
    return null;
  }

  const entryPrice = fundingSecond.reduce((sum, p) => sum + p.price, 0) / fundingSecond.length;
  console.log(`\n🎯 Entry Point (SHORT at 00:00:00):`);
  console.log(`   Entry Price: $${entryPrice.toFixed(6)}`);
  console.log(`   Entry Method: Market Order SHORT via WebSocket`);

  // Analyze price movement after entry
  let maxDrop = 0;
  let maxDropSecond = 0;
  let maxDropPrice = entryPrice;
  let maxRise = 0;
  let maxRiseSecond = 0;

  const expectedDropPercent = Math.abs(session.fundingRate) * 100;
  let targetReached = false;
  let timeToTarget: number | null = null;

  console.log(`\n⏱️  Price Movement After Entry (00:00:00):\n`);

  for (const second of sortedSeconds) {
    if (second < 0 || second > 15) continue; // Focus on 0s to +15s

    const points = bySecond.get(second)!;
    const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
    const minPrice = Math.min(...points.map(p => p.price));

    const changeFromEntry = avgPrice - entryPrice;
    const changePercent = (changeFromEntry / entryPrice) * 100;

    let marker = '  ';
    if (second === 0) marker = '⚡';
    else if (changePercent < maxDrop) marker = '📉';
    else if (changePercent > 0) marker = '⚠️';

    // Track max drop (best for SHORT)
    if (changePercent < maxDrop) {
      maxDrop = changePercent;
      maxDropSecond = second;
      maxDropPrice = avgPrice;
    }

    // Track max rise (risk for SHORT)
    if (changePercent > maxRise) {
      maxRise = changePercent;
      maxRiseSecond = second;
    }

    // Check if target drop reached
    if (!targetReached && Math.abs(changePercent) >= expectedDropPercent) {
      targetReached = true;
      timeToTarget = second;
    }

    const label = second === 0 ? 'ENTRY' : `+${second}s`;
    const profitText = changePercent <= 0
      ? `PROFIT: +${Math.abs(changePercent).toFixed(3)}%`
      : `LOSS: -${changePercent.toFixed(3)}%`;

    console.log(
      `${marker} ${label.padEnd(8)} | ` +
      `Price: $${avgPrice.toFixed(6)} | ` +
      `Change: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(3)}% | ` +
      `${profitText}`
    );
  }

  // Calculate optimal exit
  let optimalExit = null;
  if (maxDrop < 0) {
    const profitPercent = Math.abs(maxDrop);
    optimalExit = {
      time: maxDropSecond,
      price: maxDropPrice,
      profit: profitPercent,
    };
  }

  // Analysis summary
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📈 STRATEGY PERFORMANCE ANALYSIS`);
  console.log(`${'='.repeat(80)}`);

  console.log(`\n🎯 TARGET vs ACTUAL:`);
  console.log(`   Expected Drop (Funding Rate): ${expectedDropPercent.toFixed(4)}%`);
  console.log(`   Actual Max Drop: ${Math.abs(maxDrop).toFixed(4)}% at +${maxDropSecond}s`);
  console.log(`   Target Reached: ${targetReached ? '✅ YES' : '❌ NO'}`);
  if (timeToTarget !== null) {
    console.log(`   Time to Target: ${timeToTarget}s`);
  }

  console.log(`\n💰 PROFIT POTENTIAL:`);
  if (optimalExit) {
    console.log(`   Optimal Exit Time: +${optimalExit.time}s from entry`);
    console.log(`   Exit Price: $${optimalExit.price.toFixed(6)}`);
    console.log(`   Short Profit: +${optimalExit.profit.toFixed(4)}%`);
    console.log(`   Funding Payment: We PAY ${expectedDropPercent.toFixed(4)}% (SHORT position)`);
    console.log(`   Net Profit: ${(optimalExit.profit - expectedDropPercent).toFixed(4)}%`);
  } else {
    console.log(`   ❌ No profitable exit point found`);
  }

  console.log(`\n⚠️  RISK ANALYSIS:`);
  console.log(`   Max Adverse Move: ${maxRise > 0 ? '+' : ''}${maxRise.toFixed(4)}% at +${maxRiseSecond}s`);
  if (maxRise > 0) {
    console.log(`   ⚠️  WARNING: Price moved AGAINST us (went UP)`);
    console.log(`   Max Loss: -${maxRise.toFixed(4)}%`);
  }

  console.log(`\n📊 STRATEGY VIABILITY:`);
  const netProfit = optimalExit ? optimalExit.profit - expectedDropPercent : -expectedDropPercent;
  if (netProfit > 0) {
    console.log(`   ✅ PROFITABLE: Net profit of +${netProfit.toFixed(4)}%`);
  } else if (netProfit === 0) {
    console.log(`   ⚠️  BREAK-EVEN: No net profit after funding payment`);
  } else {
    console.log(`   ❌ UNPROFITABLE: Net loss of ${netProfit.toFixed(4)}%`);
  }

  if (!targetReached) {
    console.log(`   ⚠️  Price did NOT drop by full funding rate amount`);
    console.log(`   ⚠️  Would need to exit early at lower profit`);
  }

  return {
    symbol,
    fundingRate: session.fundingRate,
    expectedDrop: expectedDropPercent,
    actualMaxDrop: Math.abs(maxDrop),
    timeToMaxDrop: maxDropSecond,
    dropAtFunding: 0, // Will calculate separately
    targetReached,
    timeToTarget,
    optimalExit,
    risk: {
      maxAdverseMove: maxRise,
      timeToAdverseMove: maxRiseSecond,
    },
  };
}

async function main() {
  try {
    console.log('\n🔍 ANALYZING SHORT STRATEGY FOR FUNDING PAYMENT ARBITRAGE\n');
    console.log('📅 Analysis of REAL funding payment recordings (19:00 UTC)\n');

    // Analyze all REAL recordings
    const resolvAnalysis = await analyzeShortStrategy('cmhxm54zt0tbxw5q4c1ds5obn', 'RESOLV/USDT');
    const resolvperpAnalysis = await analyzeShortStrategy('cmhxm54k10tbvw5q4qaog8ktn', 'RESOLVPERP');
    const cvcAnalysis = await analyzeShortStrategy('cmhxm57630tc2w5q4pw565fzv', 'CVC/USDT');
    const sundogAnalysis = await analyzeShortStrategy('cmhxm565b0tbzw5q4hta5ws86', 'SUNDOG/USDT');

    // Comparative analysis
    const analyses = [
      { name: 'RESOLV/USDT', analysis: resolvAnalysis },
      { name: 'RESOLVPERP', analysis: resolvperpAnalysis },
      { name: 'CVC/USDT', analysis: cvcAnalysis },
      { name: 'SUNDOG/USDT', analysis: sundogAnalysis },
    ].filter(a => a.analysis !== null);

    if (analyses.length > 0) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📊 COMPARATIVE ANALYSIS (${analyses.length} pairs)`);
      console.log(`${'='.repeat(80)}`);

      for (const { name, analysis } of analyses) {
        if (!analysis) continue;

        const netProfit = analysis.optimalExit
          ? (analysis.optimalExit.profit - analysis.expectedDrop).toFixed(4)
          : 'N/A';

        console.log(`\n${name}:`);
        console.log(`  Funding Rate: ${analysis.expectedDrop.toFixed(4)}%`);
        console.log(`  Actual Drop: ${analysis.actualMaxDrop.toFixed(4)}%`);
        console.log(`  Net Profit: ${netProfit}%`);
        console.log(`  Target Reached: ${analysis.targetReached ? '✅' : '❌'}`);
      }

      console.log(`\n💡 CONCLUSION:`);
      const viablePairs = analyses.filter(a =>
        a.analysis?.optimalExit && (a.analysis.optimalExit.profit - a.analysis.expectedDrop) > 0
      );

      if (viablePairs.length === analyses.length) {
        console.log(`   ✅ Strategy is VIABLE on ALL pairs (${viablePairs.length}/${analyses.length})`);
        console.log(`   ✅ Can implement SHORT strategy for funding payment arbitrage`);
      } else if (viablePairs.length > 0) {
        console.log(`   ⚠️  Strategy is PARTIALLY viable (${viablePairs.length}/${analyses.length} pairs)`);
        console.log(`   ⚠️  Works on: ${viablePairs.map(p => p.name).join(', ')}`);
        console.log(`   💡 Recommend testing on more pairs to validate pattern`);
      } else {
        console.log(`   ❌ Strategy is NOT viable based on current data (0/${analyses.length})`);
        console.log(`   ❌ Price drops insufficient to cover funding payment`);
      }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ SHORT Strategy Analysis Complete');
    console.log(`${'='.repeat(80)}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
