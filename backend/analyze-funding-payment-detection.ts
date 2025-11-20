/**
 * Analyze Funding Payment Detection Indicators
 *
 * This script explains and demonstrates how to detect the exact moment
 * when funding payment occurs by analyzing the recorded data.
 */

import prisma from './src/lib/prisma';

interface DataPoint {
  bybitTimestamp: bigint;
  relativeTimeMs: number;
  lastPrice: number;
  markPrice: number | null;
  indexPrice: number | null;
}

function analyzeVolatility(points: DataPoint[]) {
  console.log('\n📊 VOLATILITY ANALYSIS');
  console.log('='.repeat(70));

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    const priceChange = ((curr.lastPrice - prev.lastPrice) / prev.lastPrice) * 100;
    const timeDiff = Number(curr.bybitTimestamp - prev.bybitTimestamp) / 1000;

    if (Math.abs(priceChange) > 0.01) { // More than 0.01% change
      console.log(`\n⚡ Significant movement detected:`);
      console.log(`   Time: ${new Date(Number(curr.bybitTimestamp)).toISOString()}`);
      console.log(`   Price change: ${priceChange.toFixed(4)}%`);
      console.log(`   Time elapsed: ${timeDiff.toFixed(3)}s`);
      console.log(`   Price: ${prev.lastPrice} → ${curr.lastPrice}`);
    }
  }
}

function analyzeBasisChange(points: DataPoint[]) {
  console.log('\n📐 BASIS ANALYSIS (Mark Price - Index Price)');
  console.log('='.repeat(70));
  console.log('During funding payment, the basis typically narrows sharply');
  console.log('as the mark price is adjusted to match the index price.\n');

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    if (point.markPrice && point.indexPrice) {
      const basis = ((point.markPrice - point.indexPrice) / point.indexPrice) * 100;
      const basisBps = basis * 100; // in basis points

      if (Math.abs(basisBps) < 1) {
        console.log(`✅ ${new Date(Number(point.bybitTimestamp)).toISOString()}`);
        console.log(`   Basis: ${basisBps.toFixed(2)} bps (mark and index aligned)`);
      } else {
        console.log(`   ${new Date(Number(point.bybitTimestamp)).toISOString()}`);
        console.log(`   Basis: ${basisBps.toFixed(2)} bps`);
      }
    }
  }
}

function detectFundingMoment(points: DataPoint[], fundingTime: Date) {
  console.log('\n🎯 FUNDING PAYMENT DETECTION');
  console.log('='.repeat(70));

  const fundingTimestamp = fundingTime.getTime();

  // Find points closest to funding time using bybitTimestamp
  const beforePoints = points.filter(p => Number(p.bybitTimestamp) <= fundingTimestamp);
  const afterPoints = points.filter(p => Number(p.bybitTimestamp) > fundingTimestamp);

  if (beforePoints.length === 0 || afterPoints.length === 0) {
    console.log('❌ Insufficient data around funding time');
    return;
  }

  const lastBefore = beforePoints[beforePoints.length - 1];
  const firstAfter = afterPoints[0];

  console.log('\n📍 Funding Payment Time: ', fundingTime.toISOString());
  console.log('\n⏮️  Last data point BEFORE funding:');
  console.log(`   Time: ${new Date(Number(lastBefore.bybitTimestamp)).toISOString()}`);
  console.log(`   Relative Time: ${lastBefore.relativeTimeMs}ms`);
  console.log(`   Price: ${lastBefore.lastPrice}`);
  console.log(`   Mark Price: ${lastBefore.markPrice || 'N/A'}`);
  console.log(`   Index Price: ${lastBefore.indexPrice || 'N/A'}`);

  console.log('\n⏭️  First data point AFTER funding:');
  console.log(`   Time: ${new Date(Number(firstAfter.bybitTimestamp)).toISOString()}`);
  console.log(`   Relative Time: ${firstAfter.relativeTimeMs}ms`);
  console.log(`   Price: ${firstAfter.lastPrice}`);
  console.log(`   Mark Price: ${firstAfter.markPrice || 'N/A'}`);
  console.log(`   Index Price: ${firstAfter.indexPrice || 'N/A'}`);

  const priceJump = ((firstAfter.lastPrice - lastBefore.lastPrice) / lastBefore.lastPrice) * 100;
  const timeGap = Number(firstAfter.bybitTimestamp - lastBefore.bybitTimestamp) / 1000;

  console.log('\n🔬 Change Analysis:');
  console.log(`   Price change: ${priceJump.toFixed(6)}%`);
  console.log(`   Time gap: ${timeGap.toFixed(3)}s`);

  if (lastBefore.markPrice && lastBefore.indexPrice && firstAfter.markPrice && firstAfter.indexPrice) {
    const basisBefore = ((lastBefore.markPrice - lastBefore.indexPrice) / lastBefore.indexPrice) * 10000;
    const basisAfter = ((firstAfter.markPrice - firstAfter.indexPrice) / firstAfter.indexPrice) * 10000;
    const basisChange = Math.abs(basisAfter - basisBefore);

    console.log(`   Basis before: ${basisBefore.toFixed(2)} bps`);
    console.log(`   Basis after: ${basisAfter.toFixed(2)} bps`);
    console.log(`   Basis change: ${basisChange.toFixed(2)} bps`);

    if (basisChange > 5) {
      console.log('\n✅ FUNDING PAYMENT DETECTED!');
      console.log('   Indicator: Significant basis adjustment');
    }
  }

  if (Math.abs(priceJump) > 0.005) {
    console.log('\n✅ FUNDING PAYMENT DETECTED!');
    console.log('   Indicator: Price movement spike');
  }
}

async function main() {
  console.log('🔍 FUNDING PAYMENT DETECTION ANALYSIS');
  console.log('='.repeat(70));
  console.log('\nHow to detect funding payment from recorded data:\n');
  console.log('1️⃣  PRICE VOLATILITY SPIKE');
  console.log('   - Sharp price movement at the exact funding time');
  console.log('   - Usually caused by traders closing positions immediately after payment\n');

  console.log('2️⃣  BASIS CONVERGENCE');
  console.log('   - Mark price converges to index price');
  console.log('   - The premium/discount (basis) narrows sharply\n');

  console.log('3️⃣  TIME CORRELATION');
  console.log('   - Changes occur within ±1 second of scheduled funding time');
  console.log('   - Precise timing confirms it\'s not random market movement\n');

  console.log('4️⃣  BALANCE CHANGE (if tracking wallet)');
  console.log('   - Position holders see balance increase/decrease');
  console.log('   - Amount matches: position_size * funding_rate\n');

  // Check for a completed recording with data
  const recording = await prisma.fundingPaymentRecordingSession.findFirst({
    where: {
      status: 'COMPLETED',
      exchange: { in: ['KUCOIN', 'GATEIO', 'BYBIT'] }
    },
    include: {
      dataPoints: {
        orderBy: { bybitTimestamp: 'asc' },
        take: 100,
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
    console.log('\n❌ No completed recordings with data found in database');
    console.log('💡 Run a recording session around next funding time to see real data\n');
    return;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📦 ANALYZING REAL RECORDING DATA');
  console.log('='.repeat(70));
  console.log(`Session: ${recording.id}`);
  console.log(`Symbol: ${recording.symbol}`);
  console.log(`Exchange: ${recording.exchange}`);
  console.log(`Funding Rate: ${(recording.fundingRate * 100).toFixed(4)}%`);
  console.log(`Data Points: ${recording.dataPoints.length}`);

  detectFundingMoment(recording.dataPoints, recording.fundingPaymentTime);
  analyzeVolatility(recording.dataPoints);
  analyzeBasisChange(recording.dataPoints);

  await prisma.$disconnect();
}

main().catch(console.error);
