/**
 * Analyze SHORT AFTER FUNDING Strategy
 *
 * Strategy: Open SHORT position immediately after funding payment
 * to profit from the post-funding price drop.
 */

import prisma from './src/lib/prisma';

interface DataPoint {
  bybitTimestamp: bigint;
  relativeTimeMs: number;
  lastPrice: number;
  markPrice: number | null;
  indexPrice: number | null;
}

function analyzeShortStrategy(points: DataPoint[], fundingTime: Date, fundingRate: number) {
  console.log('\n📊 SHORT AFTER FUNDING STRATEGY ANALYSIS');
  console.log('='.repeat(70));

  const fundingTimestamp = fundingTime.getTime();

  // Find all points after funding
  const afterPoints = points.filter(p => Number(p.bybitTimestamp) >= fundingTimestamp);

  if (afterPoints.length === 0) {
    console.log('❌ No data after funding time');
    return;
  }

  // Find entry point (first point after funding)
  const entryPoint = afterPoints[0];
  const entryPrice = entryPoint.lastPrice;
  const entryTime = Number(entryPoint.bybitTimestamp);

  console.log('\n📍 FUNDING DETAILS:');
  console.log(`   Funding Time: ${fundingTime.toISOString()}`);
  console.log(`   Funding Rate: ${(fundingRate * 100).toFixed(4)}%`);
  console.log(`   Direction: ${fundingRate > 0 ? 'Longs pay shorts' : 'Shorts pay longs'}`);

  console.log('\n🎯 ENTRY POINT (SHORT):');
  console.log(`   Time: ${new Date(entryTime).toISOString()}`);
  console.log(`   Delay after funding: ${entryPoint.relativeTimeMs}ms`);
  console.log(`   Entry Price: ${entryPrice}`);

  // Analyze price movement after entry
  let minPrice = entryPrice;
  let minPriceTime = entryTime;
  let minPriceRelativeMs = entryPoint.relativeTimeMs;
  let maxDropPercent = 0;

  console.log('\n📉 PRICE MOVEMENT AFTER ENTRY:');
  console.log('Time (relative) | Price      | Change %   | Profit if close here');
  console.log('-'.repeat(70));

  for (let i = 0; i < Math.min(afterPoints.length, 30); i++) {
    const point = afterPoints[i];
    const price = point.lastPrice;
    const changePercent = ((price - entryPrice) / entryPrice) * 100;
    const shortProfitPercent = -changePercent; // SHORT profits when price drops

    console.log(
      `+${point.relativeTimeMs.toString().padStart(6)}ms | ` +
      `${price.toFixed(4).padStart(10)} | ` +
      `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(4).padStart(8)}% | ` +
      `${shortProfitPercent > 0 ? '+' : ''}${shortProfitPercent.toFixed(4)}%`
    );

    if (price < minPrice) {
      minPrice = price;
      minPriceTime = Number(point.bybitTimestamp);
      minPriceRelativeMs = point.relativeTimeMs;
      maxDropPercent = ((minPrice - entryPrice) / entryPrice) * 100;
    }
  }

  const maxShortProfit = -maxDropPercent;

  console.log('\n🎯 OPTIMAL EXIT POINT:');
  console.log(`   Time: ${new Date(minPriceTime).toISOString()}`);
  console.log(`   Time after funding: ${minPriceRelativeMs}ms (${(minPriceRelativeMs / 1000).toFixed(1)}s)`);
  console.log(`   Time in position: ${(minPriceRelativeMs - entryPoint.relativeTimeMs) / 1000}s`);
  console.log(`   Exit Price: ${minPrice}`);
  console.log(`   Price Drop: ${maxDropPercent.toFixed(4)}%`);
  console.log(`   SHORT Profit: +${maxShortProfit.toFixed(4)}%`);

  // Calculate risk/reward
  console.log('\n💰 STRATEGY PROFITABILITY:');
  console.log(`   Funding Rate: ${(fundingRate * 100).toFixed(4)}%`);
  console.log(`   Max SHORT Profit: +${maxShortProfit.toFixed(4)}%`);

  if (fundingRate < 0) {
    // Shorts paid longs
    console.log(`   Funding Cost (SHORT position): ${(fundingRate * 100).toFixed(4)}% (PAID)`);
    const netProfit = maxShortProfit + (fundingRate * 100);
    console.log(`   Net Profit: ${netProfit > 0 ? '+' : ''}${netProfit.toFixed(4)}%`);

    if (netProfit > 0) {
      console.log('\n✅ STRATEGY IS PROFITABLE!');
      console.log(`   Even after paying funding, SHORT makes ${netProfit.toFixed(4)}%`);
    } else {
      console.log('\n❌ STRATEGY NOT PROFITABLE');
      console.log(`   Funding cost eats the profit`);
    }
  } else {
    // Longs paid shorts (we RECEIVE funding)
    console.log(`   Funding Received (SHORT position): +${(fundingRate * 100).toFixed(4)}%`);
    const netProfit = maxShortProfit + (fundingRate * 100);
    console.log(`   Net Profit: +${netProfit.toFixed(4)}%`);
    console.log('\n✅ DOUBLE WIN!');
    console.log(`   Profit from price drop + funding received = ${netProfit.toFixed(4)}%`);
  }

  // Analyze if there's a bounce after min price
  const afterMinIndex = afterPoints.findIndex(p => Number(p.bybitTimestamp) === minPriceTime);
  if (afterMinIndex >= 0 && afterMinIndex < afterPoints.length - 5) {
    const bouncePoints = afterPoints.slice(afterMinIndex, afterMinIndex + 10);
    let maxBounce = 0;
    let bounceTime = 0;

    for (const point of bouncePoints) {
      const bouncePercent = ((point.lastPrice - minPrice) / minPrice) * 100;
      if (bouncePercent > maxBounce) {
        maxBounce = bouncePercent;
        bounceTime = point.relativeTimeMs;
      }
    }

    if (maxBounce > 0.1) {
      console.log('\n📈 PRICE BOUNCE DETECTED:');
      console.log(`   Price bounced ${maxBounce.toFixed(4)}% from bottom`);
      console.log(`   Bounce occurred at +${bounceTime}ms`);
      console.log(`   ⚠️  Need to close SHORT before bounce to maximize profit!`);
    }
  }

  // Calculate required execution speed
  const entryDelayMs = entryPoint.relativeTimeMs;
  const exitDelayMs = minPriceRelativeMs;
  const holdingTimeMs = exitDelayMs - entryDelayMs;

  console.log('\n⚡ EXECUTION REQUIREMENTS:');
  console.log(`   Entry timing: ${entryDelayMs}ms after funding`);
  console.log(`   Exit timing: ${exitDelayMs}ms after funding`);
  console.log(`   Holding time: ${(holdingTimeMs / 1000).toFixed(2)}s`);
  console.log(`   Required: Fast WebSocket + Low latency API`);
}

async function main() {
  console.log('🔍 SHORT AFTER FUNDING STRATEGY ANALYZER');
  console.log('='.repeat(70));

  // Get latest completed recording
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
    console.log('\n❌ No completed recordings found');
    return;
  }

  console.log(`\nAnalyzing: ${recording.symbol} on ${recording.exchange}`);
  console.log(`Total data points: ${recording.dataPoints.length}`);

  analyzeShortStrategy(
    recording.dataPoints,
    recording.fundingPaymentTime,
    recording.fundingRate
  );

  await prisma.$disconnect();
}

main().catch(console.error);
