/**
 * Analyze PRE-FUNDING DROP Pattern
 *
 * User observation: Price drop starts at 00:00:59 (1 second BEFORE funding)
 * Maximum drop occurs ~4 seconds after drop starts
 *
 * Goal: Identify optimal entry/exit for SHORT to catch this movement
 */

import prisma from './src/lib/prisma';

interface DataPoint {
  bybitTimestamp: bigint;
  relativeTimeMs: number;
  lastPrice: number;
  markPrice: number | null;
  indexPrice: number | null;
}

function detectDropStart(points: DataPoint[], fundingTime: Date): number {
  console.log('\n🔍 DETECTING DROP START POINT');
  console.log('='.repeat(70));

  // Look at points from -10s to +10s around funding
  const windowPoints = points.filter(p =>
    p.relativeTimeMs >= -10000 && p.relativeTimeMs <= 10000
  );

  if (windowPoints.length < 2) {
    console.log('❌ Insufficient data');
    return -1;
  }

  let maxDropRate = 0;
  let dropStartIndex = -1;
  let dropStartTime = 0;

  // Find where drop velocity is highest
  for (let i = 1; i < windowPoints.length; i++) {
    const prev = windowPoints[i - 1];
    const curr = windowPoints[i];

    const priceChange = ((curr.lastPrice - prev.lastPrice) / prev.lastPrice) * 100;
    const timeChange = Number(curr.bybitTimestamp - prev.bybitTimestamp) / 1000;
    const dropRate = priceChange / timeChange; // % per second

    if (dropRate < maxDropRate) {
      maxDropRate = dropRate;
      dropStartIndex = i;
      dropStartTime = curr.relativeTimeMs;
    }
  }

  if (dropStartIndex > 0) {
    const dropPoint = windowPoints[dropStartIndex];
    console.log(`\n📉 Drop detected at:`);
    console.log(`   Time: ${new Date(Number(dropPoint.bybitTimestamp)).toISOString()}`);
    console.log(`   Relative: ${dropPoint.relativeTimeMs}ms (${(dropPoint.relativeTimeMs / 1000).toFixed(2)}s)`);
    console.log(`   Price: ${dropPoint.lastPrice}`);
    console.log(`   Drop rate: ${maxDropRate.toFixed(4)}% per second`);
  }

  return dropStartTime;
}

function analyzeDetailedMovement(points: DataPoint[], fundingTime: Date) {
  console.log('\n📊 DETAILED PRICE MOVEMENT ANALYSIS');
  console.log('='.repeat(70));

  // Get points from -5s to +15s around funding
  const analysisPoints = points.filter(p =>
    p.relativeTimeMs >= -5000 && p.relativeTimeMs <= 15000
  ).sort((a, b) => a.relativeTimeMs - b.relativeTimeMs);

  if (analysisPoints.length === 0) {
    console.log('❌ No data in analysis window');
    return;
  }

  const basePrice = analysisPoints[0].lastPrice;

  console.log('\n⏱️  Time (rel) | Price      | Change %  | Change from base | Note');
  console.log('-'.repeat(80));

  let minPrice = basePrice;
  let minPriceTime = analysisPoints[0].relativeTimeMs;
  let minPriceIndex = 0;

  let dropStartPrice = basePrice;
  let dropStartTime = 0;
  let dropStarted = false;

  for (let i = 0; i < analysisPoints.length; i++) {
    const point = analysisPoints[i];
    const prev = i > 0 ? analysisPoints[i - 1] : point;

    const changeFromPrev = ((point.lastPrice - prev.lastPrice) / prev.lastPrice) * 100;
    const changeFromBase = ((point.lastPrice - basePrice) / basePrice) * 100;

    let note = '';

    // Detect drop start (significant downward movement)
    if (!dropStarted && changeFromPrev < -0.1) {
      dropStarted = true;
      dropStartPrice = prev.lastPrice;
      dropStartTime = prev.relativeTimeMs;
      note = '🔴 DROP START';
    }

    // Track minimum
    if (point.lastPrice < minPrice) {
      minPrice = point.lastPrice;
      minPriceTime = point.relativeTimeMs;
      minPriceIndex = i;
    }

    // Mark funding time
    if (point.relativeTimeMs >= -100 && point.relativeTimeMs <= 100) {
      note = '⚡ FUNDING TIME';
    }

    // Mark bottom
    if (i === minPriceIndex) {
      note = '💎 BOTTOM';
    }

    const timeStr = `${point.relativeTimeMs >= 0 ? '+' : ''}${(point.relativeTimeMs / 1000).toFixed(3)}s`;
    console.log(
      `${timeStr.padStart(12)} | ` +
      `${point.lastPrice.toFixed(4).padStart(10)} | ` +
      `${(changeFromPrev >= 0 ? '+' : '')}${changeFromPrev.toFixed(4).padStart(8)}% | ` +
      `${(changeFromBase >= 0 ? '+' : '')}${changeFromBase.toFixed(4).padStart(15)}% | ` +
      `${note}`
    );
  }

  // Calculate drop duration
  if (dropStarted) {
    const dropDuration = (minPriceTime - dropStartTime) / 1000;
    const dropPercent = ((minPrice - dropStartPrice) / dropStartPrice) * 100;

    console.log('\n' + '='.repeat(80));
    console.log('📈 DROP ANALYSIS:');
    console.log(`   Drop started at: ${(dropStartTime / 1000).toFixed(3)}s`);
    console.log(`   Bottom reached at: ${(minPriceTime / 1000).toFixed(3)}s`);
    console.log(`   Drop duration: ${dropDuration.toFixed(3)}s`);
    console.log(`   Drop magnitude: ${dropPercent.toFixed(4)}%`);
    console.log(`   Time before funding: ${(-dropStartTime / 1000).toFixed(3)}s`);

    console.log('\n🎯 OPTIMAL SHORT STRATEGY:');
    console.log(`   ENTRY: ${(dropStartTime / 1000).toFixed(3)}s (when drop detected)`);
    console.log(`   EXIT:  ${(minPriceTime / 1000).toFixed(3)}s (at bottom)`);
    console.log(`   HOLD TIME: ${dropDuration.toFixed(3)}s`);
    console.log(`   EXPECTED PROFIT: ${Math.abs(dropPercent).toFixed(4)}%`);

    // Analyze bounce after bottom
    const afterBottom = analysisPoints.slice(minPriceIndex + 1, minPriceIndex + 6);
    if (afterBottom.length > 0) {
      const maxBounce = Math.max(...afterBottom.map(p =>
        ((p.lastPrice - minPrice) / minPrice) * 100
      ));

      console.log('\n⚠️  POST-DROP BEHAVIOR:');
      console.log(`   Max bounce after bottom: +${maxBounce.toFixed(4)}%`);
      console.log(`   Risk if exit late: Loss of ${maxBounce.toFixed(4)}% profit`);
    }
  }
}

function proposeAutomationStrategy(dropStartTime: number, bottomTime: number, dropPercent: number) {
  console.log('\n' + '='.repeat(80));
  console.log('🤖 AUTOMATION STRATEGY');
  console.log('='.repeat(80));

  console.log('\n📝 Implementation Plan:');
  console.log('   1. Monitor price via WebSocket starting 10s before funding');
  console.log('   2. Calculate real-time price velocity (% change per second)');
  console.log(`   3. Trigger SHORT when velocity < -0.2%/s at t≈${(dropStartTime / 1000).toFixed(1)}s`);
  console.log(`   4. Monitor for bottom signal (velocity reverses)`);
  console.log(`   5. Close SHORT when velocity > 0 OR at t≈${(bottomTime / 1000).toFixed(1)}s`);

  console.log('\n⚡ Technical Requirements:');
  console.log('   - WebSocket latency: <50ms');
  console.log('   - Order execution time: <100ms');
  console.log('   - Total system latency: <150ms');

  const requiredTiming = Math.abs(dropStartTime) / 1000;
  console.log(`\n⏱️  Critical Timing:`);
  console.log(`   - Must detect drop within ${requiredTiming.toFixed(2)}s before funding`);
  console.log(`   - Must execute SHORT order within 100ms of detection`);
  console.log(`   - Must monitor for ${((bottomTime - dropStartTime) / 1000).toFixed(2)}s`);

  console.log('\n💰 Expected Results:');
  console.log(`   - Entry delay after drop start: 100-200ms (system latency)`);
  console.log(`   - Exit delay after bottom: 100-200ms (system latency)`);
  console.log(`   - Expected slippage: 0.05-0.1%`);
  console.log(`   - Net expected profit: ${(Math.abs(dropPercent) - 0.15).toFixed(4)}%`);

  console.log('\n🔧 Code Implementation:');
  console.log(`
interface DropDetectionConfig {
  monitorStartSeconds: -10,
  velocityThreshold: -0.2,  // % per second
  minDropPercent: 0.2,       // Minimum 0.2% drop to trigger
  bottomDetectionMethod: "velocity_reversal" | "time_based",
  maxHoldSeconds: 10
}

class PreFundingShortStrategy {
  async monitor(symbol: string, fundingTime: Date) {
    const ws = await this.connectWebSocket(symbol);
    const startTime = fundingTime.getTime() - 10000;

    let previousPrice = 0;
    let dropDetected = false;
    let entryPrice = 0;

    ws.on('price', (data) => {
      const now = Date.now();
      const relativeMs = now - fundingTime.getTime();

      if (relativeMs < -10000 || relativeMs > 10000) return;

      const currentPrice = data.lastPrice;
      const velocity = ((currentPrice - previousPrice) / previousPrice) * 100;

      // Entry trigger
      if (!dropDetected && velocity < -0.2 && relativeMs < 0) {
        console.log('DROP DETECTED! Opening SHORT');
        await this.openShort(symbol, entryPrice = currentPrice);
        dropDetected = true;
      }

      // Exit trigger (velocity reversal)
      if (dropDetected && velocity > 0) {
        const profit = ((entryPrice - currentPrice) / entryPrice) * 100;
        console.log(\`BOTTOM DETECTED! Closing SHORT. Profit: \${profit.toFixed(4)}%\`);
        await this.closeShort(symbol);
        dropDetected = false;
      }

      previousPrice = currentPrice;
    });
  }
}
  `);
}

async function main() {
  console.log('🔍 PRE-FUNDING DROP PATTERN ANALYZER');
  console.log('='.repeat(80));

  const recording = await prisma.fundingPaymentRecordingSession.findFirst({
    where: {
      status: 'COMPLETED',
      exchange: { in: ['KUCOIN', 'GATEIO', 'BYBIT'] }
    },
    include: {
      dataPoints: {
        orderBy: { bybitTimestamp: 'asc' },
        select: {
          bybitTimestamp: true,
          relativeTimeMs: true,
          lastPrice: true,
          markPrice: true,
          indexPrice: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!recording || recording.dataPoints.length === 0) {
    console.log('❌ No completed recordings found');
    return;
  }

  console.log(`\nSession: ${recording.symbol} on ${recording.exchange}`);
  console.log(`Funding Time: ${recording.fundingPaymentTime.toISOString()}`);
  console.log(`Funding Rate: ${(recording.fundingRate * 100).toFixed(4)}%`);

  const dropStartTime = detectDropStart(recording.dataPoints, recording.fundingPaymentTime);
  analyzeDetailedMovement(recording.dataPoints, recording.fundingPaymentTime);

  if (dropStartTime < 0) {
    const bottomPoint = recording.dataPoints.reduce((min, p) =>
      p.lastPrice < min.lastPrice ? p : min
    );
    const basePrice = recording.dataPoints[0].lastPrice;
    const dropPercent = ((bottomPoint.lastPrice - basePrice) / basePrice) * 100;

    proposeAutomationStrategy(dropStartTime, bottomPoint.relativeTimeMs, dropPercent);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
