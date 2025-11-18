/**
 * Comprehensive price behavior analysis around funding payment
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PricePoint {
  time: number;
  price: number;
  bid: number;
  ask: number;
  spread: number;
}

async function analyzePriceBehavior(sessionId: string) {
  const session = await prisma.fundingPaymentRecordingSession.findUnique({
    where: { id: sessionId },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' },
      },
    },
  });

  if (!session || session.dataPoints.length === 0) {
    console.log(`❌ No data for session ${sessionId}`);
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 ${session.symbol} - Price Behavior Analysis`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Total Points: ${session.dataPoints.length}`);
  console.log(`Recording: ${session.recordingStartTime?.toLocaleTimeString()} - ${session.recordingEndTime?.toLocaleTimeString()}`);

  // Convert to price points
  const points: PricePoint[] = session.dataPoints.map(p => ({
    time: p.relativeTimeMs,
    price: parseFloat(p.lastPrice),
    bid: parseFloat(p.bid1Price),
    ask: parseFloat(p.ask1Price),
    spread: parseFloat(p.ask1Price) - parseFloat(p.bid1Price),
  }));

  // Group by seconds
  const bySecond = new Map<number, PricePoint[]>();
  for (const point of points) {
    const second = Math.floor(point.time / 1000);
    if (!bySecond.has(second)) {
      bySecond.set(second, []);
    }
    bySecond.get(second)!.push(point);
  }

  const sortedSeconds = Array.from(bySecond.keys()).sort((a, b) => a - b);
  const minSecond = sortedSeconds[0];
  const maxSecond = sortedSeconds[sortedSeconds.length - 1];

  console.log(`\nTime Range: ${minSecond}s to ${maxSecond}s (${maxSecond - minSecond}s total)`);

  // ==== 1. OVERALL PRICE MOVEMENT ====
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📈 OVERALL PRICE MOVEMENT`);
  console.log(`${'─'.repeat(80)}`);

  const allPrices = points.map(p => p.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const avgPrice = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length;

  const minPricePoint = points.find(p => p.price === minPrice)!;
  const maxPricePoint = points.find(p => p.price === maxPrice)!;

  console.log(`Average Price: $${avgPrice.toFixed(6)}`);
  console.log(`Lowest Price:  $${minPrice.toFixed(6)} at ${(minPricePoint.time / 1000).toFixed(1)}s`);
  console.log(`Highest Price: $${maxPrice.toFixed(6)} at ${(maxPricePoint.time / 1000).toFixed(1)}s`);
  console.log(`Price Range:   $${(maxPrice - minPrice).toFixed(6)} (${((maxPrice - minPrice) / avgPrice * 100).toFixed(3)}%)`);

  // ==== 2. SECOND-BY-SECOND TIMELINE ====
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`⏱️  SECOND-BY-SECOND TIMELINE`);
  console.log(`${'─'.repeat(80)}`);
  console.log(`\nLegend: 🔴 = -1s | ⚡ = funding moment | 🟢 = +1s\n`);

  let prevAvgPrice = 0;
  let maxDrop = 0;
  let maxDropSecond = 0;
  let maxRise = 0;
  let maxRiseSecond = 0;
  const preFundingPrices: number[] = [];
  const postFundingPrices: number[] = [];

  for (const second of sortedSeconds) {
    const points = bySecond.get(second)!;
    const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
    const minPrice = Math.min(...points.map(p => p.price));
    const maxPrice = Math.max(...points.map(p => p.price));
    const avgSpread = points.reduce((sum, p) => sum + p.spread, 0) / points.length;

    let marker = '  ';
    if (second === 0) marker = '⚡';
    else if (second === -1) marker = '🔴';
    else if (second === 1) marker = '🟢';

    let changeText = '';
    if (prevAvgPrice > 0) {
      const change = avgPrice - prevAvgPrice;
      const changePercent = (change / prevAvgPrice) * 100;
      changeText = change >= 0
        ? `+${change.toFixed(6)} (+${changePercent.toFixed(4)}%)`
        : `${change.toFixed(6)} (${changePercent.toFixed(4)}%)`;

      if (change < 0 && changePercent < maxDrop) {
        maxDrop = changePercent;
        maxDropSecond = second;
      }
      if (change > 0 && changePercent > maxRise) {
        maxRise = changePercent;
        maxRiseSecond = second;
      }
    }

    if (second < 0) {
      preFundingPrices.push(avgPrice);
    } else if (second > 0) {
      postFundingPrices.push(avgPrice);
    }

    const label = second === 0 ? 'FUNDING' : `${second >= 0 ? '+' : ''}${second}s`;
    console.log(
      `${marker} ${label.padEnd(9)} | ` +
      `Avg: $${avgPrice.toFixed(6)} | ` +
      `Range: $${(maxPrice - minPrice).toFixed(6)} | ` +
      `Spread: $${avgSpread.toFixed(6)} | ` +
      `${points.length.toString().padStart(3)} pts | ` +
      `${changeText}`
    );

    prevAvgPrice = avgPrice;
  }

  // ==== 3. KEY MOMENTS ANALYSIS ====
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`🎯 KEY MOMENTS`);
  console.log(`${'─'.repeat(80)}`);

  console.log(`\nBiggest Drop: ${maxDrop.toFixed(4)}% at ${maxDropSecond}s`);
  console.log(`Biggest Rise: ${maxRise.toFixed(4)}% at ${maxRiseSecond}s`);

  // Find funding moment price
  const fundingPoints = bySecond.get(0);
  if (fundingPoints) {
    const fundingPrice = fundingPoints.reduce((sum, p) => sum + p.price, 0) / fundingPoints.length;
    console.log(`\nFunding Moment Price: $${fundingPrice.toFixed(6)}`);

    // Compare pre and post funding average
    if (preFundingPrices.length > 0 && postFundingPrices.length > 0) {
      const avgPreFunding = preFundingPrices.reduce((sum, p) => sum + p, 0) / preFundingPrices.length;
      const avgPostFunding = postFundingPrices.reduce((sum, p) => sum + p, 0) / postFundingPrices.length;
      const overallChange = avgPostFunding - avgPreFunding;
      const overallChangePercent = (overallChange / avgPreFunding) * 100;

      console.log(`\nAverage Before Funding: $${avgPreFunding.toFixed(6)}`);
      console.log(`Average After Funding:  $${avgPostFunding.toFixed(6)}`);
      console.log(`Overall Change: ${overallChange >= 0 ? '+' : ''}$${overallChange.toFixed(6)} (${overallChangePercent >= 0 ? '+' : ''}${overallChangePercent.toFixed(4)}%)`);
    }

    // Find recovery time (when price returns to pre-drop level)
    const preFundingPrice = preFundingPrices.length > 0 ? preFundingPrices[preFundingPrices.length - 1] : null;
    if (preFundingPrice) {
      let recoverySecond = null;
      for (const second of sortedSeconds) {
        if (second <= 0) continue;
        const secPoints = bySecond.get(second)!;
        const secAvgPrice = secPoints.reduce((sum, p) => sum + p.price, 0) / secPoints.length;
        if (secAvgPrice >= preFundingPrice) {
          recoverySecond = second;
          break;
        }
      }

      if (recoverySecond) {
        console.log(`\nPrice Recovery: ${recoverySecond}s after funding`);
      } else {
        console.log(`\nPrice Recovery: Not recovered within recording window`);
      }
    }
  }

  // ==== 4. VOLATILITY ANALYSIS ====
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📊 VOLATILITY BY PERIOD`);
  console.log(`${'─'.repeat(80)}`);

  const preFundingPoints = points.filter(p => p.time < 0);
  const postFundingPoints = points.filter(p => p.time > 0);

  const calcVolatility = (pts: PricePoint[]) => {
    if (pts.length < 2) return 0;
    const avg = pts.reduce((sum, p) => sum + p.price, 0) / pts.length;
    const variance = pts.reduce((sum, p) => sum + Math.pow(p.price - avg, 2), 0) / pts.length;
    return Math.sqrt(variance);
  };

  const overallVolatility = calcVolatility(points);
  const preVolatility = calcVolatility(preFundingPoints);
  const postVolatility = calcVolatility(postFundingPoints);

  console.log(`\nOverall:       $${overallVolatility.toFixed(6)} (${(overallVolatility / avgPrice * 100).toFixed(4)}%)`);
  console.log(`Pre-Funding:   $${preVolatility.toFixed(6)} (${(preVolatility / avgPrice * 100).toFixed(4)}%)`);
  console.log(`Post-Funding:  $${postVolatility.toFixed(6)} (${(postVolatility / avgPrice * 100).toFixed(4)}%)`);

  // ==== 5. SPREAD ANALYSIS ====
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`📏 SPREAD ANALYSIS`);
  console.log(`${'─'.repeat(80)}`);

  const avgSpread = points.reduce((sum, p) => sum + p.spread, 0) / points.length;
  const maxSpread = Math.max(...points.map(p => p.spread));
  const minSpread = Math.min(...points.map(p => p.spread));

  console.log(`\nAverage Spread: $${avgSpread.toFixed(6)} (${(avgSpread / avgPrice * 100).toFixed(4)}%)`);
  console.log(`Min Spread:     $${minSpread.toFixed(6)}`);
  console.log(`Max Spread:     $${maxSpread.toFixed(6)}`);

  // ==== 6. TRADING OPPORTUNITY ANALYSIS ====
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`💰 TRADING OPPORTUNITY (for negative funding)`);
  console.log(`${'─'.repeat(80)}`);

  if (session.fundingRate < 0) {
    // For negative funding: we receive payment for LONG positions
    // Ideal: BUY at lowest point before funding, hold through payment

    const prePoints = points.filter(p => p.time < 0 && p.time > -10000); // Last 10 seconds
    if (prePoints.length > 0) {
      const lowestPre = prePoints.reduce((min, p) => p.price < min.price ? p : min);

      console.log(`\nFunding Rate: ${(session.fundingRate * 100).toFixed(4)}% (we RECEIVE on LONG)`);
      console.log(`\nOptimal Entry:`);
      console.log(`  Time: ${(lowestPre.time / 1000).toFixed(1)}s (${Math.abs(lowestPre.time / 1000).toFixed(1)}s before funding)`);
      console.log(`  Price: $${lowestPre.price.toFixed(6)}`);
      console.log(`  Bid/Ask: $${lowestPre.bid.toFixed(6)} / $${lowestPre.ask.toFixed(6)}`);

      // Calculate if we exit at average post-funding price
      if (postFundingPrices.length > 0) {
        const avgExit = postFundingPrices.reduce((sum, p) => sum + p, 0) / postFundingPrices.length;
        const priceChange = avgExit - lowestPre.price;
        const priceChangePercent = (priceChange / lowestPre.price) * 100;
        const fundingPayment = Math.abs(session.fundingRate) * 100;
        const totalReturn = priceChangePercent + fundingPayment;

        console.log(`\nIf entered at optimal time and exited at avg post-funding:`);
        console.log(`  Entry: $${lowestPre.price.toFixed(6)}`);
        console.log(`  Exit:  $${avgExit.toFixed(6)}`);
        console.log(`  Price P/L: ${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(4)}%`);
        console.log(`  Funding Payment: +${fundingPayment.toFixed(4)}%`);
        console.log(`  ═══════════════════════════════`);
        console.log(`  TOTAL RETURN: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(4)}%`);
      }

      // Best case: exit at highest post-funding price
      const postPoints = points.filter(p => p.time > 0);
      if (postPoints.length > 0) {
        const highestPost = postPoints.reduce((max, p) => p.price > max.price ? p : max);
        const priceChange = highestPost.price - lowestPre.price;
        const priceChangePercent = (priceChange / lowestPre.price) * 100;
        const fundingPayment = Math.abs(session.fundingRate) * 100;
        const totalReturn = priceChangePercent + fundingPayment;

        console.log(`\nBest case (exit at highest post-funding):`);
        console.log(`  Exit Time: ${(highestPost.time / 1000).toFixed(1)}s`);
        console.log(`  Exit Price: $${highestPost.price.toFixed(6)}`);
        console.log(`  Price P/L: +${priceChangePercent.toFixed(4)}%`);
        console.log(`  Funding Payment: +${fundingPayment.toFixed(4)}%`);
        console.log(`  ═══════════════════════════════`);
        console.log(`  TOTAL RETURN: +${totalReturn.toFixed(4)}%`);
      }
    }
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

async function main() {
  try {
    console.log('\n🔍 COMPREHENSIVE PRICE BEHAVIOR ANALYSIS\n');

    // Analyze the best recordings
    console.log('Analyzing LA/USDT (169 points, most recent)...');
    await analyzePriceBehavior('cmi0crf1h0agtw5yswrjzd749');

    console.log('\n\nAnalyzing RESOLV/USDT (322 points, most data)...');
    await analyzePriceBehavior('cmhxm54zt0tbxw5q4c1ds5obn');

    console.log('\n\nAnalyzing CVC/USDT (21 points)...');
    await analyzePriceBehavior('cmhxm57630tc2w5q4pw565fzv');

    console.log('\n✅ Analysis Complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
