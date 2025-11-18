/**
 * Analyze second-by-second price movement around funding payment
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeTimeline(sessionId: string, symbol: string) {
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

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 ${symbol} - Second-by-Second Analysis`);
  console.log(`${'='.repeat(70)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Total Data Points: ${session.dataPoints.length}`);

  // Group by seconds
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

  // Sort by second
  const sortedSeconds = Array.from(bySecond.keys()).sort((a, b) => a - b);

  console.log(`\n⏱️  Timeline (focusing on -5s to +5s):\n`);

  let prevPrice = 0;
  let maxDrop = 0;
  let maxDropSecond = 0;
  let dropStartSecond = null;

  for (const second of sortedSeconds) {
    if (second < -5 || second > 10) continue;

    const points = bySecond.get(second)!;
    const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
    const minPrice = Math.min(...points.map(p => p.price));
    const maxPrice = Math.max(...points.map(p => p.price));
    const priceRange = maxPrice - minPrice;

    let marker = '  ';
    let changeText = '';

    if (second === 0) {
      marker = '⚡';
    } else if (second === -1) {
      marker = '🔴';
    } else if (second === 1) {
      marker = '🟢';
    }

    if (prevPrice > 0) {
      const change = avgPrice - prevPrice;
      const changePercent = (change / prevPrice) * 100;
      changeText = change >= 0
        ? `+${change.toFixed(6)} (+${changePercent.toFixed(3)}%)`
        : `${change.toFixed(6)} (${changePercent.toFixed(3)}%)`;

      // Track drops
      if (change < 0 && Math.abs(changePercent) > Math.abs(maxDrop)) {
        maxDrop = changePercent;
        maxDropSecond = second;
        if (dropStartSecond === null) {
          dropStartSecond = second - 1;
        }
      }
    }

    const label = second === 0 ? 'FUNDING' : `${second >= 0 ? '+' : ''}${second}s`;

    console.log(
      `${marker} ${label.padEnd(8)} | ` +
      `Avg: $${avgPrice.toFixed(6)} | ` +
      `Range: $${priceRange.toFixed(6)} | ` +
      `Points: ${points.length.toString().padStart(3)} | ` +
      `${changeText}`
    );

    prevPrice = avgPrice;
  }

  console.log(`\n📉 Drop Analysis:`);
  console.log(`   Biggest Drop: ${maxDrop.toFixed(3)}% at ${maxDropSecond}s`);
  if (dropStartSecond !== null) {
    console.log(`   Drop Started: ${dropStartSecond}s`);
    console.log(`   Drop Window: ${dropStartSecond}s → ${maxDropSecond}s (${maxDropSecond - dropStartSecond}s duration)`);
  }

  // Find when price recovers
  const fundingSecond = bySecond.get(0);
  if (fundingSecond) {
    const fundingPrice = fundingSecond.reduce((sum, p) => sum + p.price, 0) / fundingSecond.length;

    let recoverySecond = null;
    for (const second of sortedSeconds) {
      if (second <= 0) continue;
      const points = bySecond.get(second)!;
      const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
      if (avgPrice >= fundingPrice) {
        recoverySecond = second;
        break;
      }
    }

    if (recoverySecond) {
      console.log(`   Price Recovery: ${recoverySecond}s (${recoverySecond}s after funding)`);
    } else {
      console.log(`   Price Recovery: Not recovered within recording window`);
    }
  }

  // Analyze volatility by second
  console.log(`\n📊 Volatility by Second:`);
  for (const second of sortedSeconds) {
    if (second < -5 || second > 5) continue;

    const points = bySecond.get(second)!;
    if (points.length < 2) continue;

    const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
    const variance = points.reduce((sum, p) => sum + Math.pow(p.price - avgPrice, 2), 0) / points.length;
    const stdDev = Math.sqrt(variance);
    const volatility = (stdDev / avgPrice) * 100;

    const label = second === 0 ? 'FUNDING' : `${second >= 0 ? '+' : ''}${second}s`;
    console.log(`   ${label.padEnd(8)}: ${volatility.toFixed(4)}% volatility`);
  }
}

async function main() {
  try {
    console.log('📅 Analyzing REAL funding payment recordings (19:00 UTC)\n');

    await analyzeTimeline('cmhxm54zt0tbxw5q4c1ds5obn', 'RESOLV/USDT');
    await analyzeTimeline('cmhxm54k10tbvw5q4qaog8ktn', 'RESOLVPERP');
    await analyzeTimeline('cmhxm57630tc2w5q4pw565fzv', 'CVC/USDT');
    await analyzeTimeline('cmhxm565b0tbzw5q4hta5ws86', 'SUNDOG/USDT');

    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ Timeline Analysis Complete');
    console.log(`${'='.repeat(70)}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
