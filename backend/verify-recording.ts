/**
 * Verification script to check recording data quality
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRecording() {
  try {
    console.log('=== Recording System Verification ===\n');

    // Get the most recent recording session
    const latestSession = await prisma.fundingPaymentRecordingSession.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        dataPoints: {
          orderBy: { relativeTimeMs: 'asc' },
        },
      },
    });

    if (!latestSession) {
      console.log('❌ No recording sessions found in database');
      return;
    }

    console.log('✅ Latest Recording Session Found:');
    console.log(`   Session ID: ${latestSession.id}`);
    console.log(`   Symbol: ${latestSession.symbol}`);
    console.log(`   Exchange: ${latestSession.exchange}`);
    console.log(`   Status: ${latestSession.status}`);
    console.log(`   Funding Rate: ${latestSession.fundingRate}%`);
    console.log(`   Created: ${latestSession.createdAt}`);
    console.log(`   Updated: ${latestSession.updatedAt}`);
    console.log();

    // Check time synchronization
    console.log('⏱️  Time Synchronization:');
    console.log(`   Network Latency: ${latestSession.networkLatencyMs}ms`);
    console.log(`   Sync Accuracy: ${latestSession.timeSyncAccuracy}ms`);
    console.log(`   Bybit Server Time: ${latestSession.bybitServerTime}`);
    console.log(`   Local Time: ${latestSession.localTime}`);
    console.log();

    // Check recording configuration
    console.log('⚙️  Recording Configuration:');
    console.log(`   Pre-recording: ${latestSession.preRecordingSeconds}s`);
    console.log(`   Post-recording: ${latestSession.postRecordingSeconds}s`);
    console.log(`   Total expected duration: ${latestSession.preRecordingSeconds + latestSession.postRecordingSeconds}s`);
    console.log();

    // Check data points
    console.log('📊 Data Points:');
    console.log(`   Total Recorded: ${latestSession.totalDataPoints}`);
    console.log(`   In Database: ${latestSession.dataPoints.length}`);

    if (latestSession.dataPoints.length > 0) {
      const firstPoint = latestSession.dataPoints[0];
      const lastPoint = latestSession.dataPoints[latestSession.dataPoints.length - 1];

      console.log(`   First Point Time: ${firstPoint.relativeTimeMs}ms`);
      console.log(`   Last Point Time: ${lastPoint.relativeTimeMs}ms`);
      console.log(`   Time Range: ${lastPoint.relativeTimeMs - firstPoint.relativeTimeMs}ms`);
      console.log(`   Expected Range: ${(latestSession.preRecordingSeconds + latestSession.postRecordingSeconds) * 1000}ms`);

      // Check data distribution
      const beforePayment = latestSession.dataPoints.filter(p => p.relativeTimeMs < 0).length;
      const atPayment = latestSession.dataPoints.filter(p => p.relativeTimeMs === 0).length;
      const afterPayment = latestSession.dataPoints.filter(p => p.relativeTimeMs > 0).length;

      console.log(`   Before Payment (< 0ms): ${beforePayment} points`);
      console.log(`   At Payment (= 0ms): ${atPayment} points`);
      console.log(`   After Payment (> 0ms): ${afterPayment} points`);

      // Sample data points
      console.log();
      console.log('   Sample Data Points (first 5):');
      latestSession.dataPoints.slice(0, 5).forEach((point, idx) => {
        console.log(`   ${idx + 1}. Time: ${point.relativeTimeMs}ms | Price: ${point.lastPrice} | Volume: ${point.volume24h || 'N/A'}`);
      });

      if (latestSession.dataPoints.length > 5) {
        console.log();
        console.log('   Sample Data Points (last 5):');
        latestSession.dataPoints.slice(-5).forEach((point, idx) => {
          console.log(`   ${latestSession.dataPoints.length - 4 + idx}. Time: ${point.relativeTimeMs}ms | Price: ${point.lastPrice} | Volume: ${point.volume24h || 'N/A'}`);
        });
      }
    } else {
      console.log('   ⚠️  No data points found in database');
    }
    console.log();

    // Check analytics
    console.log('📈 Analytics:');
    if (latestSession.priceDropPercent !== null) {
      console.log(`   ✅ Price Drop: ${latestSession.priceDropPercent?.toFixed(4)}%`);
      console.log(`   ✅ Price Before Payment: ${latestSession.priceBeforePayment}`);
      console.log(`   ✅ Lowest Price: ${latestSession.lowestPrice}`);
      console.log(`   ✅ Price at Lowest: ${latestSession.priceAtLowest}`);
      console.log(`   ✅ Optimal Entry Time: ${latestSession.optimalEntryTimeMs}ms after payment`);
      console.log(`   ✅ Price Recovery: ${latestSession.priceRecoveryPercent?.toFixed(4)}%`);
      console.log(`   ✅ Price at End: ${latestSession.priceAtEnd}`);
    } else {
      console.log('   ⚠️  Analytics not calculated yet');
    }
    console.log();

    // Overall status
    console.log('=== Summary ===');
    const issues: string[] = [];

    if (latestSession.status !== 'COMPLETED') {
      issues.push(`Recording status is ${latestSession.status} (expected: COMPLETED)`);
    }

    if (latestSession.totalDataPoints === 0) {
      issues.push('No data points recorded');
    }

    if (latestSession.dataPoints.length !== latestSession.totalDataPoints) {
      issues.push(`Data points mismatch: ${latestSession.dataPoints.length} in DB vs ${latestSession.totalDataPoints} recorded`);
    }

    if (!latestSession.networkLatencyMs) {
      issues.push('Network latency not measured');
    }

    if (latestSession.priceDropPercent === null) {
      issues.push('Analytics not calculated');
    }

    if (issues.length === 0) {
      console.log('✅ All systems working correctly!');
      console.log('✅ Recording captured all expected data');
      console.log('✅ Time synchronization successful');
      console.log('✅ Analytics calculated properly');
    } else {
      console.log('⚠️  Issues found:');
      issues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`);
      });
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRecording();
