import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TRADING_FEES = 0.11; // 0.055% maker + 0.055% taker

async function analyzePriceBounce() {
  console.log('\n📊 PRICE BOUNCE ANALYSIS - Can we profit from the bounce?\n');
  console.log('Analyzing if price bounces back after the initial drop\n');
  console.log('═'.repeat(100));

  // Get all COMPLETED recordings
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' }
      }
    }
  });

  console.log(`\n📈 Loaded ${sessions.length} completed recordings\n`);

  interface BounceAnalysis {
    symbol: string;
    exchange: string;
    fundingRate: number;
    // SHORT phase (0ms → +30s)
    shortEntryPrice: number;
    shortExitPrice: number;
    shortProfitPercent: number;
    // Price movement after SHORT exit
    lowestPrice: number;
    lowestPriceTime: number;
    priceAt45s: number;
    priceAt60s: number;
    priceAt90s: number;
    priceAt120s: number;
    // LONG opportunity analysis (from +30s)
    bounceFrom30sTo45s: number;
    bounceFrom30sTo60s: number;
    bounceFrom30sTo90s: number;
    bounceFrom30sTo120s: number;
    // Best LONG entry point (from lowest price)
    bestLongProfit: number;
    bestLongExitTime: number;
    // Combined strategy
    combinedProfit: number;
  }

  const results: BounceAnalysis[] = [];

  for (const session of sessions) {
    if (session.dataPoints.length === 0) continue;

    const points = session.dataPoints;

    // Find entry point: closest to 0ms (funding payment)
    const entryPoint = points.reduce((closest, point) => {
      const currentDiff = Math.abs(point.relativeTimeMs - 0);
      const closestDiff = Math.abs(closest.relativeTimeMs - 0);
      return currentDiff < closestDiff ? point : closest;
    });

    // Find SHORT exit point: closest to +30s
    const shortExitPoint = points.reduce((closest, point) => {
      const currentDiff = Math.abs(point.relativeTimeMs - 30000);
      const closestDiff = Math.abs(closest.relativeTimeMs - 30000);
      return currentDiff < closestDiff ? point : closest;
    });

    // Calculate SHORT profit
    const shortEntryPrice = entryPoint.lastPrice;
    const shortExitPrice = shortExitPoint.lastPrice;
    const shortProfitPercent = ((shortEntryPrice - shortExitPrice) / shortEntryPrice) * 100 - TRADING_FEES;

    // Find points at various times after SHORT exit
    const findClosestPoint = (targetTime: number) => {
      return points.reduce((closest, point) => {
        const currentDiff = Math.abs(point.relativeTimeMs - targetTime);
        const closestDiff = Math.abs(closest.relativeTimeMs - targetTime);
        return currentDiff < closestDiff ? point : closest;
      });
    };

    const point45s = findClosestPoint(45000);
    const point60s = findClosestPoint(60000);
    const point90s = findClosestPoint(90000);
    const point120s = findClosestPoint(120000);

    // Find lowest price and its time (to find best LONG entry)
    const pointsAfter30s = points.filter(p => p.relativeTimeMs >= 30000);
    let lowestPrice = shortExitPrice;
    let lowestPriceTime = 30000;

    if (pointsAfter30s.length > 0) {
      const lowestPoint = pointsAfter30s.reduce((lowest, point) => {
        return point.lastPrice < lowest.lastPrice ? point : lowest;
      });
      lowestPrice = lowestPoint.lastPrice;
      lowestPriceTime = lowestPoint.relativeTimeMs;
    }

    // Calculate LONG profits from +30s (SHORT exit point)
    const bounceFrom30sTo45s = ((point45s.lastPrice - shortExitPrice) / shortExitPrice) * 100 - TRADING_FEES;
    const bounceFrom30sTo60s = ((point60s.lastPrice - shortExitPrice) / shortExitPrice) * 100 - TRADING_FEES;
    const bounceFrom30sTo90s = ((point90s.lastPrice - shortExitPrice) / shortExitPrice) * 100 - TRADING_FEES;
    const bounceFrom30sTo120s = ((point120s.lastPrice - shortExitPrice) / shortExitPrice) * 100 - TRADING_FEES;

    // Calculate best LONG profit from lowest point
    const longCandidates = [
      { profit: bounceFrom30sTo45s, time: 45000 },
      { profit: bounceFrom30sTo60s, time: 60000 },
      { profit: bounceFrom30sTo90s, time: 90000 },
      { profit: bounceFrom30sTo120s, time: 120000 }
    ];
    const bestLong = longCandidates.reduce((best, current) =>
      current.profit > best.profit ? current : best
    );

    const combinedProfit = shortProfitPercent + bestLong.profit;

    results.push({
      symbol: session.symbol,
      exchange: session.exchange,
      fundingRate: session.fundingRate,
      shortEntryPrice,
      shortExitPrice,
      shortProfitPercent,
      lowestPrice,
      lowestPriceTime,
      priceAt45s: point45s.lastPrice,
      priceAt60s: point60s.lastPrice,
      priceAt90s: point90s.lastPrice,
      priceAt120s: point120s.lastPrice,
      bounceFrom30sTo45s,
      bounceFrom30sTo60s,
      bounceFrom30sTo90s,
      bounceFrom30sTo120s,
      bestLongProfit: bestLong.profit,
      bestLongExitTime: bestLong.time,
      combinedProfit
    });
  }

  // Display detailed results
  console.log('═'.repeat(100));
  console.log('\n📋 DETAILED ANALYSIS PER RECORDING:\n');

  results.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.symbol} @ ${r.exchange}`);
    console.log(`   Funding Rate: ${(r.fundingRate * 100).toFixed(4)}%\n`);

    console.log(`   🔴 SHORT Phase (0ms → +30s):`);
    console.log(`      Entry: ${r.shortEntryPrice.toFixed(8)}`);
    console.log(`      Exit:  ${r.shortExitPrice.toFixed(8)}`);
    console.log(`      Profit: ${r.shortProfitPercent > 0 ? '+' : ''}${r.shortProfitPercent.toFixed(4)}% ${r.shortProfitPercent > 0 ? '✅' : '❌'}\n`);

    console.log(`   📊 Price Movement After SHORT Exit (+30s):`);
    console.log(`      Lowest:  ${r.lowestPrice.toFixed(8)} at ${(r.lowestPriceTime / 1000).toFixed(0)}s`);
    console.log(`      At +45s: ${r.priceAt45s.toFixed(8)} (${r.bounceFrom30sTo45s > 0 ? '+' : ''}${r.bounceFrom30sTo45s.toFixed(4)}%)`);
    console.log(`      At +60s: ${r.priceAt60s.toFixed(8)} (${r.bounceFrom30sTo60s > 0 ? '+' : ''}${r.bounceFrom30sTo60s.toFixed(4)}%)`);
    console.log(`      At +90s: ${r.priceAt90s.toFixed(8)} (${r.bounceFrom30sTo90s > 0 ? '+' : ''}${r.bounceFrom30sTo90s.toFixed(4)}%)`);
    console.log(`      At +120s: ${r.priceAt120s.toFixed(8)} (${r.bounceFrom30sTo120s > 0 ? '+' : ''}${r.bounceFrom30sTo120s.toFixed(4)}%)\n`);

    console.log(`   🟢 Best LONG Opportunity (+30s → +${r.bestLongExitTime / 1000}s):`);
    console.log(`      Profit: ${r.bestLongProfit > 0 ? '+' : ''}${r.bestLongProfit.toFixed(4)}% ${r.bestLongProfit > 0 ? '✅' : '❌'}\n`);

    console.log(`   💰 COMBINED STRATEGY (SHORT + LONG):`);
    console.log(`      SHORT:    ${r.shortProfitPercent > 0 ? '+' : ''}${r.shortProfitPercent.toFixed(4)}%`);
    console.log(`      LONG:     ${r.bestLongProfit > 0 ? '+' : ''}${r.bestLongProfit.toFixed(4)}%`);
    console.log(`      TOTAL:    ${r.combinedProfit > 0 ? '+' : ''}${r.combinedProfit.toFixed(4)}% ${r.combinedProfit > r.shortProfitPercent ? '🚀' : '⚠️'}`);
  });

  // Summary statistics
  console.log('\n\n' + '═'.repeat(100));
  console.log('\n📊 SUMMARY STATISTICS:\n');

  const avgShortProfit = results.reduce((sum, r) => sum + r.shortProfitPercent, 0) / results.length;
  const avgBestLongProfit = results.reduce((sum, r) => sum + r.bestLongProfit, 0) / results.length;
  const avgCombinedProfit = results.reduce((sum, r) => sum + r.combinedProfit, 0) / results.length;

  const shortWins = results.filter(r => r.shortProfitPercent > 0).length;
  const longWins = results.filter(r => r.bestLongProfit > 0).length;
  const combinedWins = results.filter(r => r.combinedProfit > 0).length;

  console.log(`SHORT Strategy (0ms → +30s):`);
  console.log(`  Avg Profit: ${avgShortProfit > 0 ? '+' : ''}${avgShortProfit.toFixed(4)}%`);
  console.log(`  Win Rate: ${(shortWins / results.length * 100).toFixed(1)}% (${shortWins}/${results.length})\n`);

  console.log(`Best LONG from +30s:`);
  console.log(`  Avg Profit: ${avgBestLongProfit > 0 ? '+' : ''}${avgBestLongProfit.toFixed(4)}%`);
  console.log(`  Win Rate: ${(longWins / results.length * 100).toFixed(1)}% (${longWins}/${results.length})\n`);

  console.log(`COMBINED Strategy (SHORT + LONG):`);
  console.log(`  Avg Profit: ${avgCombinedProfit > 0 ? '+' : ''}${avgCombinedProfit.toFixed(4)}%`);
  console.log(`  Win Rate: ${(combinedWins / results.length * 100).toFixed(1)}% (${combinedWins}/${results.length})\n`);

  // Analyze LONG timing
  console.log('═'.repeat(100));
  console.log('\n⏱️  OPTIMAL LONG EXIT TIME:\n');

  const exitTimes = [45000, 60000, 90000, 120000];
  for (const time of exitTimes) {
    const profits = results.map(r => {
      if (time === 45000) return r.bounceFrom30sTo45s;
      if (time === 60000) return r.bounceFrom30sTo60s;
      if (time === 90000) return r.bounceFrom30sTo90s;
      return r.bounceFrom30sTo120s;
    });

    const avgProfit = profits.reduce((sum, p) => sum + p, 0) / profits.length;
    const wins = profits.filter(p => p > 0).length;
    const winRate = (wins / profits.length) * 100;

    console.log(`+30s → +${time / 1000}s (${time / 1000 - 30}s duration):`);
    console.log(`  Avg Profit: ${avgProfit > 0 ? '+' : ''}${avgProfit.toFixed(4)}%`);
    console.log(`  Win Rate: ${winRate.toFixed(1)}% (${wins}/${profits.length})\n`);
  }

  // Recommendation
  console.log('═'.repeat(100));
  console.log('\n💡 RECOMMENDATIONS:\n');

  const improvement = avgCombinedProfit - avgShortProfit;
  const improvementPercent = (improvement / avgShortProfit) * 100;

  if (avgBestLongProfit > 0.2) {
    console.log(`✅ LONG bounce is PROFITABLE! Average: ${avgBestLongProfit > 0 ? '+' : ''}${avgBestLongProfit.toFixed(4)}%`);
    console.log(`✅ Combined strategy improves profit by ${improvement > 0 ? '+' : ''}${improvement.toFixed(4)}% (${improvementPercent > 0 ? '+' : ''}${improvementPercent.toFixed(1)}%)`);
    console.log(`\n🚀 RECOMMENDED STRATEGY:`);
    console.log(`   1. SHORT at 0ms (funding payment)`);
    console.log(`   2. Close SHORT at +30s`);
    console.log(`   3. Immediately LONG at +30s`);
    console.log(`   4. Close LONG at optimal time (analyze per trade)`);
    console.log(`   5. Expected total profit: ${avgCombinedProfit > 0 ? '+' : ''}${avgCombinedProfit.toFixed(4)}%`);
  } else if (avgBestLongProfit > 0) {
    console.log(`⚠️  LONG bounce is marginally profitable: ${avgBestLongProfit > 0 ? '+' : ''}${avgBestLongProfit.toFixed(4)}%`);
    console.log(`   Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(4)}% (${improvementPercent > 0 ? '+' : ''}${improvementPercent.toFixed(1)}%)`);
    console.log(`   Consider if extra complexity is worth the gain.`);
  } else {
    console.log(`❌ LONG bounce is NOT profitable: ${avgBestLongProfit > 0 ? '+' : ''}${avgBestLongProfit.toFixed(4)}%`);
    console.log(`   Stick to SHORT-only strategy for better results.`);
  }

  console.log('\n' + '═'.repeat(100) + '\n');

  await prisma.$disconnect();
}

analyzePriceBounce().catch(console.error);
