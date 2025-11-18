/**
 * Analyze order book density and its impact on price drop
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OrderBookPoint {
  time: number; // relativeTimeMs
  price: number;
  bidPrice: number;
  askPrice: number;
  bidSize: number;
  askSize: number;
  spread: number;
  bidAskRatio: number; // bid size / ask size
}

async function analyzeOrderBookDensity(sessionId: string) {
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
    return null;
  }

  console.log(`\n${'='.repeat(90)}`);
  console.log(`📚 ${session.symbol} - Order Book Density Analysis`);
  console.log(`${'='.repeat(90)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Total Points: ${session.dataPoints.length}`);

  // Filter points with valid order book data
  const validPoints: OrderBookPoint[] = session.dataPoints
    .filter(p =>
      p.bid1Price !== null &&
      p.ask1Price !== null &&
      p.bid1Size !== null &&
      p.ask1Size !== null &&
      p.bid1Size > 0 &&
      p.ask1Size > 0
    )
    .map(p => ({
      time: p.relativeTimeMs,
      price: p.lastPrice,
      bidPrice: p.bid1Price!,
      askPrice: p.ask1Price!,
      bidSize: p.bid1Size!,
      askSize: p.ask1Size!,
      spread: p.ask1Price! - p.bid1Price!,
      bidAskRatio: p.bid1Size! / p.ask1Size!,
    }));

  if (validPoints.length === 0) {
    console.log(`❌ No valid order book data found`);
    return null;
  }

  console.log(`\nValid Order Book Points: ${validPoints.length} / ${session.dataPoints.length} (${(validPoints.length / session.dataPoints.length * 100).toFixed(1)}%)`);

  // Split by time periods
  const preFunding = validPoints.filter(p => p.time < 0);
  const fundingMoment = validPoints.filter(p => p.time >= -500 && p.time <= 500);
  const postFunding = validPoints.filter(p => p.time > 500);

  console.log(`\nTime Distribution:`);
  console.log(`  Pre-Funding:     ${preFunding.length} points`);
  console.log(`  Funding Moment:  ${fundingMoment.length} points (±500ms)`);
  console.log(`  Post-Funding:    ${postFunding.length} points`);

  // ==== 1. ORDER BOOK IMBALANCE ANALYSIS ====
  console.log(`\n${'─'.repeat(90)}`);
  console.log(`⚖️  ORDER BOOK IMBALANCE (Bid/Ask Ratio)`);
  console.log(`${'─'.repeat(90)}`);
  console.log(`Higher ratio = more buyers (bids) than sellers (asks)`);
  console.log(`Lower ratio = more sellers (asks) than buyers (bids) = potential for bigger drop\n`);

  const calcStats = (points: OrderBookPoint[]) => {
    if (points.length === 0) return null;

    const avgBidSize = points.reduce((sum, p) => sum + p.bidSize, 0) / points.length;
    const avgAskSize = points.reduce((sum, p) => sum + p.askSize, 0) / points.length;
    const avgRatio = points.reduce((sum, p) => sum + p.bidAskRatio, 0) / points.length;
    const minRatio = Math.min(...points.map(p => p.bidAskRatio));
    const maxRatio = Math.max(...points.map(p => p.bidAskRatio));

    return {
      avgBidSize,
      avgAskSize,
      avgRatio,
      minRatio,
      maxRatio,
    };
  };

  const preStats = calcStats(preFunding);
  const fundingStats = calcStats(fundingMoment);
  const postStats = calcStats(postFunding);

  if (preStats) {
    console.log(`PRE-FUNDING (-5s to 0s):`);
    console.log(`  Avg Bid Size:      ${preStats.avgBidSize.toFixed(2)}`);
    console.log(`  Avg Ask Size:      ${preStats.avgAskSize.toFixed(2)}`);
    console.log(`  Avg Bid/Ask Ratio: ${preStats.avgRatio.toFixed(4)} ${preStats.avgRatio < 1 ? '⚠️ MORE SELLERS' : '✅ MORE BUYERS'}`);
    console.log(`  Ratio Range:       ${preStats.minRatio.toFixed(4)} - ${preStats.maxRatio.toFixed(4)}`);
  }

  if (fundingStats) {
    console.log(`\nFUNDING MOMENT (±500ms):`);
    console.log(`  Avg Bid Size:      ${fundingStats.avgBidSize.toFixed(2)}`);
    console.log(`  Avg Ask Size:      ${fundingStats.avgAskSize.toFixed(2)}`);
    console.log(`  Avg Bid/Ask Ratio: ${fundingStats.avgRatio.toFixed(4)} ${fundingStats.avgRatio < 1 ? '⚠️ MORE SELLERS' : '✅ MORE BUYERS'}`);
    console.log(`  Ratio Range:       ${fundingStats.minRatio.toFixed(4)} - ${fundingStats.maxRatio.toFixed(4)}`);
  }

  if (postStats) {
    console.log(`\nPOST-FUNDING (+500ms and later):`);
    console.log(`  Avg Bid Size:      ${postStats.avgBidSize.toFixed(2)}`);
    console.log(`  Avg Ask Size:      ${postStats.avgAskSize.toFixed(2)}`);
    console.log(`  Avg Bid/Ask Ratio: ${postStats.avgRatio.toFixed(4)} ${postStats.avgRatio < 1 ? '⚠️ MORE SELLERS' : '✅ MORE BUYERS'}`);
    console.log(`  Ratio Range:       ${postStats.minRatio.toFixed(4)} - ${postStats.maxRatio.toFixed(4)}`);
  }

  // Compare changes
  if (preStats && fundingStats) {
    const ratioChange = fundingStats.avgRatio - preStats.avgRatio;
    const ratioChangePercent = (ratioChange / preStats.avgRatio) * 100;

    console.log(`\n📊 CHANGE AT FUNDING MOMENT:`);
    console.log(`  Bid/Ask Ratio Change: ${ratioChange >= 0 ? '+' : ''}${ratioChange.toFixed(4)} (${ratioChangePercent >= 0 ? '+' : ''}${ratioChangePercent.toFixed(2)}%)`);

    if (ratioChange < 0) {
      console.log(`  🔴 RATIO DECREASED = More sellers appeared / buyers disappeared`);
    } else {
      console.log(`  🟢 RATIO INCREASED = More buyers appeared / sellers disappeared`);
    }

    const askSizeChange = fundingStats.avgAskSize - preStats.avgAskSize;
    const askSizeChangePercent = (askSizeChange / preStats.avgAskSize) * 100;
    console.log(`  Ask Size Change: ${askSizeChange >= 0 ? '+' : ''}${askSizeChange.toFixed(2)} (${askSizeChangePercent >= 0 ? '+' : ''}${askSizeChangePercent.toFixed(2)}%)`);

    if (askSizeChange > 0) {
      console.log(`  🔴 ASK SIZE INCREASED = More sell orders = thinner green orderbook = bigger drop potential`);
    }
  }

  // ==== 2. CORRELATION: ORDER BOOK DENSITY vs PRICE DROP ====
  console.log(`\n${'─'.repeat(90)}`);
  console.log(`📉 CORRELATION: Order Book Density → Price Drop`);
  console.log(`${'─'.repeat(90)}`);

  // Calculate price drop
  const prePrices = preFunding.map(p => p.price);
  const postPrices = postFunding.map(p => p.price);

  if (prePrices.length > 0 && postPrices.length > 0) {
    const avgPrePrice = prePrices.reduce((sum, p) => sum + p, 0) / prePrices.length;
    const minPostPrice = Math.min(...postPrices);
    const priceDrop = avgPrePrice - minPostPrice;
    const priceDropPercent = (priceDrop / avgPrePrice) * 100;

    console.log(`\nPrice Movement:`);
    console.log(`  Avg Pre-Funding Price:  $${avgPrePrice.toFixed(6)}`);
    console.log(`  Min Post-Funding Price: $${minPostPrice.toFixed(6)}`);
    console.log(`  Price Drop:             $${priceDrop.toFixed(6)} (${priceDropPercent.toFixed(3)}%)`);

    if (preStats) {
      console.log(`\nOrder Book Before Drop:`);
      console.log(`  Bid/Ask Ratio: ${preStats.avgRatio.toFixed(4)}`);
      console.log(`  Ask Size (sell wall): ${preStats.avgAskSize.toFixed(2)}`);

      console.log(`\n💡 INTERPRETATION:`);
      if (preStats.avgRatio < 1) {
        console.log(`  ⚠️  Bid/Ask Ratio < 1: More sellers than buyers BEFORE funding`);
        console.log(`      → Market already bearish, expecting larger drop`);
      }

      if (preStats.avgAskSize > preStats.avgBidSize * 1.5) {
        console.log(`  🔴 Ask size is ${(preStats.avgAskSize / preStats.avgBidSize).toFixed(2)}x bigger than bid size`);
        console.log(`      → Thin orderbook on buy side, price will drop faster`);
      }

      // Calculate liquidity metric
      const liquidityScore = preStats.avgBidSize / preStats.avgAskSize;
      console.log(`\n📊 LIQUIDITY SCORE: ${liquidityScore.toFixed(4)}`);
      console.log(`   < 0.5: Very thin bid side, expect drop > 1%`);
      console.log(`   0.5-1.0: Thin bid side, expect drop 0.3-1%`);
      console.log(`   1.0-2.0: Balanced, expect drop < 0.5%`);
      console.log(`   > 2.0: Strong bid support, minimal drop expected`);

      if (liquidityScore < 0.5) {
        console.log(`\n   🚨 CURRENT: Very thin bid side! Price drop likely > 1%`);
        console.log(`      Actual drop: ${priceDropPercent.toFixed(3)}%`);
      } else if (liquidityScore < 1.0) {
        console.log(`\n   ⚠️  CURRENT: Thin bid side, moderate drop expected 0.3-1%`);
        console.log(`      Actual drop: ${priceDropPercent.toFixed(3)}%`);
      }
    }
  }

  // ==== 3. SECOND-BY-SECOND ORDER BOOK TIMELINE ====
  console.log(`\n${'─'.repeat(90)}`);
  console.log(`⏱️  SECOND-BY-SECOND ORDER BOOK CHANGES`);
  console.log(`${'─'.repeat(90)}`);

  // Group by seconds
  const bySecond = new Map<number, OrderBookPoint[]>();
  for (const point of validPoints) {
    const second = Math.floor(point.time / 1000);
    if (!bySecond.has(second)) {
      bySecond.set(second, []);
    }
    bySecond.get(second)!.push(point);
  }

  const sortedSeconds = Array.from(bySecond.keys()).sort((a, b) => a - b);

  console.log(`\n     Time    |   Price   | Bid/Ask Ratio |  Bid Size  |  Ask Size  | Spread`);
  console.log(`${'─'.repeat(90)}`);

  let prevPrice = 0;
  let prevRatio = 0;

  for (const second of sortedSeconds) {
    if (second < -5 || second > 10) continue;

    const points = bySecond.get(second)!;
    const avgPrice = points.reduce((sum, p) => sum + p.price, 0) / points.length;
    const avgRatio = points.reduce((sum, p) => sum + p.bidAskRatio, 0) / points.length;
    const avgBidSize = points.reduce((sum, p) => sum + p.bidSize, 0) / points.length;
    const avgAskSize = points.reduce((sum, p) => sum + p.askSize, 0) / points.length;
    const avgSpread = points.reduce((sum, p) => sum + p.spread, 0) / points.length;

    let marker = '  ';
    if (second === 0) marker = '⚡';
    else if (second === -1) marker = '🔴';
    else if (second === 1) marker = '🟢';

    const label = second === 0 ? 'FUNDING' : `${second >= 0 ? '+' : ''}${second}s`;

    let ratioTrend = '  ';
    if (prevRatio > 0) {
      const ratioChange = avgRatio - prevRatio;
      if (ratioChange < -0.05) ratioTrend = '↓↓'; // Sellers increasing
      else if (ratioChange < -0.01) ratioTrend = '↓ '; // Sellers slightly up
      else if (ratioChange > 0.05) ratioTrend = '↑↑'; // Buyers increasing
      else if (ratioChange > 0.01) ratioTrend = '↑ '; // Buyers slightly up
    }

    const ratioIndicator = avgRatio < 1 ? '⚠️' : '  ';

    console.log(
      `${marker} ${label.padEnd(8)} | $${avgPrice.toFixed(6)} | ` +
      `${ratioIndicator} ${avgRatio.toFixed(4)} ${ratioTrend} | ` +
      `${avgBidSize.toFixed(2).padStart(9)} | ${avgAskSize.toFixed(2).padStart(9)} | ` +
      `$${avgSpread.toFixed(6)}`
    );

    prevPrice = avgPrice;
    prevRatio = avgRatio;
  }

  console.log(`\n${'='.repeat(90)}\n`);

  return {
    symbol: session.symbol,
    fundingRate: session.fundingRate,
    preStats,
    fundingStats,
    postStats,
  };
}

async function main() {
  try {
    console.log('\n🔍 ORDER BOOK DENSITY ANALYSIS\n');
    console.log('Analyzing how order book density affects price drop at funding payment...\n');

    // Analyze recordings with the most data
    await analyzeOrderBookDensity('cmi0crf1h0agtw5yswrjzd749'); // LA/USDT - 169 points
    await analyzeOrderBookDensity('cmhxm54zt0tbxw5q4c1ds5obn'); // RESOLV/USDT - 322 points
    await analyzeOrderBookDensity('cmhxm57630tc2w5q4pw565fzv'); // CVC/USDT - 21 points

    console.log('\n✅ Analysis Complete\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
