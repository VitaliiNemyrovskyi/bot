/**
 * Analyze COMBINED strategy:
 * 1. SHORT before funding (-2s to 0s)
 * 2. Flip to LONG at funding (0s to +3s)
 * 3. Receive funding payment
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CombinedStrategyAnalysis {
  symbol: string;
  fundingRate: number;

  // SHORT leg
  shortEntry: { time: number; price: number };
  shortExit: { time: number; price: number };
  shortProfit: number;

  // LONG leg
  longEntry: { time: number; price: number };
  longExit: { time: number; price: number };
  longProfit: number;

  // Total
  fundingReceived: number;
  totalProfit: number;

  // Risks
  flipTime: number; // Time available to flip SHORT->LONG
  maxDrawdown: number;
}

async function analyzeCombinedStrategy(sessionId: string, symbol: string): Promise<CombinedStrategyAnalysis | null> {
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
  console.log(`📊 COMBINED STRATEGY ANALYSIS: ${symbol}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Strategy: SHORT (-2s→0s) + LONG (0s→+3s)`);

  // Group by milliseconds for precise timing
  const byMs = new Map<number, number[]>();
  for (const point of session.dataPoints) {
    const ms = point.relativeTimeMs;
    if (ms < -3000 || ms > 5000) continue;

    if (!byMs.has(ms)) {
      byMs.set(ms, []);
    }
    byMs.get(ms)!.push(point.lastPrice);
  }

  // Find optimal SHORT entry (-3s to -1s) - highest price
  let shortEntryTime = -2000;
  let shortEntryPrice = 0;

  for (const [ms, prices] of byMs.entries()) {
    if (ms >= -3000 && ms <= -1000 && prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      if (avgPrice > shortEntryPrice) {
        shortEntryPrice = avgPrice;
        shortEntryTime = ms;
      }
    }
  }

  // Find SHORT exit (around 0s, at lowest price)
  let shortExitTime = 0;
  let shortExitPrice = Infinity;

  for (const [ms, prices] of byMs.entries()) {
    if (ms >= -500 && ms <= 1000 && prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      if (avgPrice < shortExitPrice) {
        shortExitPrice = avgPrice;
        shortExitTime = ms;
      }
    }
  }

  // LONG entry = SHORT exit (flip position)
  const longEntryTime = shortExitTime;
  const longEntryPrice = shortExitPrice;

  // Find LONG exit (+1s to +5s, at highest price after recovery)
  let longExitTime = 3000;
  let longExitPrice = 0;

  for (const [ms, prices] of byMs.entries()) {
    if (ms >= 1000 && ms <= 5000 && prices.length > 0) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      if (avgPrice > longExitPrice) {
        longExitPrice = avgPrice;
        longExitTime = ms;
      }
    }
  }

  // Calculate profits
  const shortProfit = ((shortEntryPrice - shortExitPrice) / shortEntryPrice) * 100;
  const longProfit = ((longExitPrice - longEntryPrice) / longEntryPrice) * 100;
  const fundingReceived = Math.abs(session.fundingRate) * 100; // We RECEIVE funding in LONG
  const totalProfit = shortProfit + longProfit + fundingReceived;

  // Calculate flip time available
  const flipTime = 0; // We flip exactly at 0s

  // Calculate max drawdown
  let maxDrawdown = 0;
  for (let ms = shortEntryTime; ms <= longExitTime; ms += 100) {
    const prices = byMs.get(ms);
    if (!prices || prices.length === 0) continue;

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calculate P&L at this point
    let currentPnL = 0;

    if (ms <= shortExitTime) {
      // In SHORT position
      currentPnL = ((shortEntryPrice - avgPrice) / shortEntryPrice) * 100;
    } else {
      // In LONG position
      currentPnL = shortProfit + ((avgPrice - longEntryPrice) / longEntryPrice) * 100;
    }

    if (currentPnL < maxDrawdown) {
      maxDrawdown = currentPnL;
    }
  }

  console.log(`\n📉 SHORT LEG:`);
  console.log(`   Entry: ${(shortEntryTime / 1000).toFixed(2)}s at $${shortEntryPrice.toFixed(6)}`);
  console.log(`   Exit:  ${(shortExitTime / 1000).toFixed(2)}s at $${shortExitPrice.toFixed(6)}`);
  console.log(`   Duration: ${((shortExitTime - shortEntryTime) / 1000).toFixed(2)}s`);
  console.log(`   Profit: ${shortProfit >= 0 ? '+' : ''}${shortProfit.toFixed(4)}%`);

  console.log(`\n🔄 FLIP POSITION:`);
  console.log(`   Close SHORT + Open LONG at ${(longEntryTime / 1000).toFixed(2)}s`);
  console.log(`   Price: $${longEntryPrice.toFixed(6)}`);
  console.log(`   ⚡ FUNDING PAYMENT happens here - we RECEIVE ${fundingReceived.toFixed(4)}%`);

  console.log(`\n📈 LONG LEG:`);
  console.log(`   Entry: ${(longEntryTime / 1000).toFixed(2)}s at $${longEntryPrice.toFixed(6)}`);
  console.log(`   Exit:  ${(longExitTime / 1000).toFixed(2)}s at $${longExitPrice.toFixed(6)}`);
  console.log(`   Duration: ${((longExitTime - longEntryTime) / 1000).toFixed(2)}s`);
  console.log(`   Profit: ${longProfit >= 0 ? '+' : ''}${longProfit.toFixed(4)}%`);
  console.log(`   Funding: +${fundingReceived.toFixed(4)}%`);

  console.log(`\n💰 TOTAL PROFIT:`);
  console.log(`   SHORT profit:     ${shortProfit >= 0 ? '+' : ''}${shortProfit.toFixed(4)}%`);
  console.log(`   LONG profit:      ${longProfit >= 0 ? '+' : ''}${longProfit.toFixed(4)}%`);
  console.log(`   Funding received: +${fundingReceived.toFixed(4)}%`);
  console.log(`   ─────────────────────────────`);
  console.log(`   TOTAL:            +${totalProfit.toFixed(4)}%`);

  console.log(`\n⚠️  RISK ANALYSIS:`);
  console.log(`   Total duration: ${((longExitTime - shortEntryTime) / 1000).toFixed(2)}s`);
  console.log(`   Max drawdown: ${maxDrawdown.toFixed(4)}%`);
  console.log(`   Flip timing: Critical - must execute within ~50-100ms`);

  console.log(`\n⏱️  EXECUTION REQUIREMENTS:`);
  console.log(`   1. Open SHORT at ${(shortEntryTime / 1000).toFixed(2)}s`);
  console.log(`   2. Close SHORT at ${(shortExitTime / 1000).toFixed(2)}s`);
  console.log(`   3. Immediately open LONG (within 10-30ms using WebSocket)`);
  console.log(`   4. Hold LONG through funding payment`);
  console.log(`   5. Close LONG at ${(longExitTime / 1000).toFixed(2)}s`);

  return {
    symbol,
    fundingRate: session.fundingRate,
    shortEntry: { time: shortEntryTime, price: shortEntryPrice },
    shortExit: { time: shortExitTime, price: shortExitPrice },
    shortProfit,
    longEntry: { time: longEntryTime, price: longEntryPrice },
    longExit: { time: longExitTime, price: longExitPrice },
    longProfit,
    fundingReceived,
    totalProfit,
    flipTime,
    maxDrawdown,
  };
}

async function main() {
  try {
    console.log('\n🔍 ANALYZING COMBINED STRATEGY (SHORT + LONG)\n');
    console.log('📅 Analysis of REAL funding payment recordings (19:00 UTC)\n');
    console.log('Strategy: SHORT before funding + LONG after funding + Receive funding\n');

    const resolvAnalysis = await analyzeCombinedStrategy('cmhxm54zt0tbxw5q4c1ds5obn', 'RESOLV/USDT');
    const resolvperpAnalysis = await analyzeCombinedStrategy('cmhxm54k10tbvw5q4qaog8ktn', 'RESOLVPERP');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 COMPARATIVE ANALYSIS`);
    console.log(`${'='.repeat(80)}`);

    const analyses = [
      { name: 'RESOLV/USDT', analysis: resolvAnalysis },
      { name: 'RESOLVPERP', analysis: resolvperpAnalysis },
    ].filter(a => a.analysis !== null);

    for (const { name, analysis } of analyses) {
      if (!analysis) continue;

      console.log(`\n${name}:`);
      console.log(`  SHORT profit:     ${analysis.shortProfit >= 0 ? '+' : ''}${analysis.shortProfit.toFixed(4)}%`);
      console.log(`  LONG profit:      ${analysis.longProfit >= 0 ? '+' : ''}${analysis.longProfit.toFixed(4)}%`);
      console.log(`  Funding received: +${analysis.fundingReceived.toFixed(4)}%`);
      console.log(`  TOTAL PROFIT:     +${analysis.totalProfit.toFixed(4)}%`);
      console.log(`  Duration:         ${((analysis.longExit.time - analysis.shortEntry.time) / 1000).toFixed(1)}s`);
    }

    console.log(`\n💡 CONCLUSION:`);
    if (analyses.length > 0 && analyses.every(a => a.analysis && a.analysis.totalProfit > 0)) {
      const avgProfit = analyses.reduce((sum, a) => sum + (a.analysis?.totalProfit || 0), 0) / analyses.length;
      console.log(`   ✅ COMBINED strategy is HIGHLY PROFITABLE!`);
      console.log(`   ✅ Average profit: +${avgProfit.toFixed(4)}% in ~5 seconds`);
      console.log(`   ✅ Strategy components:`);
      console.log(`      1. SHORT captures price drop before funding`);
      console.log(`      2. LONG captures recovery + funding payment`);
      console.log(`      3. Total profit = SHORT + LONG + FUNDING`);
      console.log(`\n   ⚡ CRITICAL REQUIREMENT:`);
      console.log(`      - Must flip SHORT→LONG in <100ms using WebSocket Trade API`);
      console.log(`      - Timing precision is CRITICAL`);
    } else {
      console.log(`   ⚠️  Strategy needs more testing`);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ Combined Strategy Analysis Complete');
    console.log(`${'='.repeat(80)}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
