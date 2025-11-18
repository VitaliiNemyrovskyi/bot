/**
 * Analyze funding payment recordings to find optimal entry points
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PricePoint {
  time: number; // relativeTimeMs
  price: number;
  bid: number | null;
  ask: number | null;
  spread: number;
}

async function analyzeRecording(sessionId: string) {
  const session = await prisma.fundingPaymentRecordingSession.findUnique({
    where: { id: sessionId },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' },
      },
    },
  });

  if (!session) {
    console.log(`❌ Session ${sessionId} not found`);
    return null;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Analysis: ${session.symbol}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log(`Total Data Points: ${session.dataPoints.length}`);
  console.log(`Duration: ${session.startedAt && session.completedAt ? ((session.completedAt.getTime() - session.startedAt.getTime()) / 1000).toFixed(1) : 'N/A'}s`);

  if (session.dataPoints.length === 0) {
    console.log('❌ No data points to analyze');
    return null;
  }

  // Convert to price points
  const points: PricePoint[] = session.dataPoints.map(p => ({
    time: p.relativeTimeMs,
    price: p.lastPrice,
    bid: p.bid1Price,
    ask: p.ask1Price,
    spread: (p.ask1Price && p.bid1Price) ? p.ask1Price - p.bid1Price : 0,
  }));

  // Split into pre-funding and post-funding
  const preFunding = points.filter(p => p.time < 0);
  const fundingMoment = points.filter(p => p.time >= -500 && p.time <= 500); // ±500ms around funding
  const postFunding = points.filter(p => p.time > 0);

  console.log(`\n📈 Data Distribution:`);
  console.log(`   Pre-funding: ${preFunding.length} points (${preFunding[0]?.time ?? 'N/A'}ms to ${preFunding[preFunding.length - 1]?.time ?? 'N/A'}ms)`);
  console.log(`   At funding: ${fundingMoment.length} points`);
  console.log(`   Post-funding: ${postFunding.length} points (${postFunding[0]?.time ?? 'N/A'}ms to ${postFunding[postFunding.length - 1]?.time ?? 'N/A'}ms)`);

  // Price analysis
  const allPrices = points.map(p => p.price);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const avgPrice = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;

  const minPricePoint = points.find(p => p.price === minPrice)!;
  const maxPricePoint = points.find(p => p.price === maxPrice)!;

  console.log(`\n💰 Price Analysis:`);
  console.log(`   Average: $${avgPrice.toFixed(6)}`);
  console.log(`   Min: $${minPrice.toFixed(6)} at ${minPricePoint.time}ms`);
  console.log(`   Max: $${maxPrice.toFixed(6)} at ${maxPricePoint.time}ms`);
  console.log(`   Range: ${((maxPrice - minPrice) / avgPrice * 100).toFixed(3)}%`);

  // Spread analysis
  const avgSpread = points.reduce((sum, p) => sum + p.spread, 0) / points.length;
  const maxSpread = Math.max(...points.map(p => p.spread));

  console.log(`\n📊 Spread Analysis:`);
  console.log(`   Average: $${avgSpread.toFixed(6)} (${(avgSpread / avgPrice * 100).toFixed(3)}%)`);
  console.log(`   Max: $${maxSpread.toFixed(6)}`);

  // Find optimal entry point for NEGATIVE funding
  // For negative funding, we PAY to SHORT and RECEIVE to LONG
  // So we want to BUY (LONG) at lowest price before funding payment
  if (session.fundingRate < 0 && preFunding.length > 0) {
    const prePrices = preFunding.map(p => p.price);
    const minPrePrice = Math.min(...prePrices);
    const optimalEntry = preFunding.find(p => p.price === minPrePrice)!;

    console.log(`\n🎯 Optimal Entry Point (LONG for negative funding):`);
    console.log(`   Time: ${optimalEntry.time}ms (${Math.abs(optimalEntry.time / 1000).toFixed(1)}s BEFORE funding)`);
    console.log(`   Entry Price: $${optimalEntry.price.toFixed(6)}`);
    console.log(`   Bid/Ask: $${optimalEntry.bid?.toFixed(6) ?? 'N/A'} / $${optimalEntry.ask?.toFixed(6) ?? 'N/A'}`);

    // Calculate potential profit if we exit at average post-funding price
    if (postFunding.length > 0) {
      const avgPostPrice = postFunding.reduce((sum, p) => sum + p.price, 0) / postFunding.length;
      const priceChange = avgPostPrice - optimalEntry.price;
      const percentChange = (priceChange / optimalEntry.price) * 100;

      console.log(`\n💵 If entered at optimal time:`);
      console.log(`   Entry: $${optimalEntry.price.toFixed(6)}`);
      console.log(`   Avg Post-Funding: $${avgPostPrice.toFixed(6)}`);
      console.log(`   Price Change: $${priceChange.toFixed(6)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(3)}%)`);
      console.log(`   + Funding Received: ${(Math.abs(session.fundingRate) * 100).toFixed(4)}%`);
      console.log(`   Total Return: ${percentChange >= 0 ? '+' : ''}${(percentChange + Math.abs(session.fundingRate) * 100).toFixed(3)}%`);
    }
  }

  // Price movement around funding payment
  if (fundingMoment.length > 0) {
    const beforeFunding = preFunding[preFunding.length - 1]?.price ?? null;
    const atFunding = fundingMoment[Math.floor(fundingMoment.length / 2)]?.price ?? null;
    const afterFunding = postFunding[0]?.price ?? null;

    console.log(`\n⚡ Price Movement Around Funding:`);
    if (beforeFunding) {
      console.log(`   Before (-1s): $${beforeFunding.toFixed(6)}`);
    }
    if (atFunding) {
      console.log(`   At Funding (0s): $${atFunding.toFixed(6)}`);
    }
    if (afterFunding) {
      console.log(`   After (+1s): $${afterFunding.toFixed(6)}`);
      if (beforeFunding) {
        const change = afterFunding - beforeFunding;
        console.log(`   Net Change: $${change.toFixed(6)} (${((change / beforeFunding) * 100).toFixed(3)}%)`);
      }
    }
  }

  // Volatility analysis (standard deviation)
  const variance = allPrices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / allPrices.length;
  const stdDev = Math.sqrt(variance);

  console.log(`\n📉 Volatility:`);
  console.log(`   Std Dev: $${stdDev.toFixed(6)} (${(stdDev / avgPrice * 100).toFixed(3)}%)`);

  return {
    symbol: session.symbol,
    fundingRate: session.fundingRate,
    avgPrice,
    minPrice,
    maxPrice,
    priceRange: (maxPrice - minPrice) / avgPrice,
    avgSpread,
    volatility: stdDev / avgPrice,
  };
}

async function main() {
  try {
    console.log('🔍 Analyzing Successful Funding Payment Recordings...\n');

    // ZORA/USDT
    await analyzeRecording('cmhxdmen405ccw5q45pit3caj');

    // PARTI/USDT
    await analyzeRecording('cmhxdmelq05caw5q44zpdkf1s');

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ Analysis Complete');
    console.log(`${'='.repeat(60)}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
