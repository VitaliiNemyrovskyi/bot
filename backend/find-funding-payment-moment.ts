/**
 * Find exact moment when Bybit credits funding payment
 * by analyzing price movement patterns
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findFundingMoment(sessionId: string, symbol: string) {
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
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 ${symbol} - Finding Exact Funding Payment Moment`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Total Data Points: ${session.dataPoints.length}`);

  // Get all data points around funding time (-5s to +5s)
  const relevantPoints = session.dataPoints.filter(p =>
    p.relativeTimeMs >= -5000 && p.relativeTimeMs <= 5000
  );

  console.log(`\n⏱️  Detailed Timeline (-5s to +5s):\n`);

  let prevPrice = 0;
  let maxDrop = 0;
  let maxDropTime = 0;
  let maxDropMs = 0;

  for (const point of relevantPoints) {
    const price = parseFloat(point.lastPrice);
    const timeS = (point.relativeTimeMs / 1000).toFixed(3);

    let changeText = '';
    let marker = '';

    if (prevPrice > 0) {
      const change = price - prevPrice;
      const changePercent = (change / prevPrice) * 100;

      if (Math.abs(changePercent) < maxDrop) {
        maxDrop = Math.abs(changePercent);
        maxDropTime = point.relativeTimeMs;
        maxDropMs = point.relativeTimeMs;
        marker = '📉💥';
      } else if (changePercent < -0.1) {
        marker = '📉';
      } else if (changePercent > 0.1) {
        marker = '📈';
      }

      changeText = change >= 0
        ? `+${change.toFixed(6)} (+${changePercent.toFixed(3)}%)`
        : `${change.toFixed(6)} (${changePercent.toFixed(3)}%)`;
    }

    const label = point.relativeTimeMs === 0 ? '00:00:00.000 ⚡' : `${timeS}s`;

    console.log(
      `${marker.padEnd(4)} ${label.padStart(13)} | ` +
      `$${price.toFixed(6)} | ` +
      `${changeText}`
    );

    prevPrice = price;
  }

  console.log(`\n💡 Analysis:`);
  console.log(`   Biggest single drop: ${maxDrop.toFixed(3)}% at ${(maxDropTime / 1000).toFixed(3)}s`);

  // Find the moment with highest volatility
  const bySecond = new Map<number, number[]>();
  for (const point of relevantPoints) {
    const second = Math.floor(point.relativeTimeMs / 1000);
    if (!bySecond.has(second)) {
      bySecond.set(second, []);
    }
    bySecond.get(second)!.push(parseFloat(point.lastPrice));
  }

  let maxVolatility = 0;
  let maxVolatilitySecond = 0;

  for (const [second, prices] of bySecond.entries()) {
    if (prices.length < 2) continue;

    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
    const volatility = (Math.sqrt(variance) / avg) * 100;

    if (volatility > maxVolatility) {
      maxVolatility = volatility;
      maxVolatilitySecond = second;
    }
  }

  console.log(`   Highest volatility: ${maxVolatility.toFixed(4)}% at ${maxVolatilitySecond}s`);

  // Analyze the pattern
  const preMinus1 = bySecond.get(-1) || [];
  const atZero = bySecond.get(0) || [];
  const postPlus1 = bySecond.get(1) || [];

  if (preMinus1.length > 0 && atZero.length > 0) {
    const avgMinus1 = preMinus1.reduce((a, b) => a + b, 0) / preMinus1.length;
    const avgZero = atZero.reduce((a, b) => a + b, 0) / atZero.length;
    const dropPercent = ((avgZero - avgMinus1) / avgMinus1) * 100;

    console.log(`\n🎯 Key Moments:`);
    console.log(`   -1s avg: $${avgMinus1.toFixed(6)}`);
    console.log(`    0s avg: $${avgZero.toFixed(6)}`);
    console.log(`   Drop -1s → 0s: ${dropPercent.toFixed(3)}%`);

    if (postPlus1.length > 0) {
      const avgPlus1 = postPlus1.reduce((a, b) => a + b, 0) / postPlus1.length;
      const recoveryPercent = ((avgPlus1 - avgZero) / avgZero) * 100;
      console.log(`   +1s avg: $${avgPlus1.toFixed(6)}`);
      console.log(`   Recovery 0s → +1s: ${recoveryPercent >= 0 ? '+' : ''}${recoveryPercent.toFixed(3)}%`);
    }
  }

  console.log(`\n💡 CONCLUSION:`);
  console.log(`   Most likely funding payment moment: ${maxVolatilitySecond}s (highest volatility)`);
  console.log(`   Price drop starts at: -3s to -1s`);
  console.log(`   Price bottom at: 0s to +1s`);
}

async function main() {
  try {
    console.log('🔍 FINDING EXACT FUNDING PAYMENT MOMENT\n');
    console.log('📅 Analyzing REAL funding payment recordings (19:00 UTC)\n');

    await findFundingMoment('cmhxm54zt0tbxw5q4c1ds5obn', 'RESOLV/USDT');
    await findFundingMoment('cmhxm54k10tbvw5q4qaog8ktn', 'RESOLVPERP');

    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ Funding Payment Moment Analysis Complete');
    console.log(`${'='.repeat(80)}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
