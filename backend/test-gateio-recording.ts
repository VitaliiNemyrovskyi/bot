/**
 * Test Gate.io Recording
 *
 * This script tests the GateIO recording functionality without waiting for actual funding time.
 * It creates a fake funding payment time 30 seconds from now to test the recording immediately.
 */

import { GateIORecorderService } from './src/lib/gateio-recorder';
import { FundingPaymentRecorderService, RecordingConfig } from './src/services/funding-payment-recorder.service';

async function testGateIORecording() {
  console.log('🧪 Starting GateIO Recording Test\n');

  // Create GateIO service
  const gateioService = new GateIORecorderService({
    apiKey: process.env['GATEIO_API_KEY'],
    apiSecret: process.env['GATEIO_API_SECRET'],
  });

  // Create a fake funding payment time 30 seconds from now
  const fundingPaymentTime = new Date(Date.now() + 30 * 1000);

  console.log('Test Configuration:');
  console.log(`  Symbol: SOON/USDT`);
  console.log(`  Exchange: GATEIO`);
  console.log(`  Fake Funding Time: ${fundingPaymentTime.toISOString()}`);
  console.log(`  Pre-recording: 10 seconds`);
  console.log(`  Post-recording: 20 seconds`);
  console.log(`  Total duration: 30 seconds\n`);

  const config: RecordingConfig = {
    symbol: 'SOON/USDT',
    exchange: 'GATEIO',
    fundingRate: -0.01,
    fundingPaymentTime: fundingPaymentTime,
    fundingInterval: 1,
    preRecordingSeconds: 10, // 10 seconds before (for testing)
    postRecordingSeconds: 20, // 20 seconds after (for testing)
  };

  try {
    console.log('📹 Starting recording session...\n');
    const session = await FundingPaymentRecorderService.startRecording(config, gateioService);

    // Listen for events
    session.on('status', (data) => {
      console.log(`\n[STATUS] ${data.status}`);
      if (data.status === 'COMPLETED') {
        console.log(`\n✅ Recording completed!`);
        console.log(`   Total data points: ${data.totalPoints}`);
        process.exit(0);
      } else if (data.status === 'ERROR') {
        console.error(`\n❌ Recording failed!`);
        process.exit(1);
      }
    });

    session.on('dataPoint', (data) => {
      console.log(`[DATA] Point ${data.totalPoints}: price=${data.lastPrice}, time=${data.relativeTimeMs}ms`);
    });

    session.on('countdown', (data) => {
      if (data.secondsUntilPayment % 5 === 0) { // Log every 5 seconds
        console.log(`[COUNTDOWN] ${data.secondsUntilPayment}s until funding, ${data.dataPointsRecorded} points recorded`);
      }
    });

    console.log('⏳ Waiting for recording to complete...\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user');
  process.exit(0);
});

// Run test
testGateIORecording().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
