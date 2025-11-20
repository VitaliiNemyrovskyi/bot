/**
 * Test KuCoin Funding Payment Recording
 *
 * This script will record price data around the next KuCoin funding payment
 * to capture the exact moment when funding is paid.
 */

import { FundingPaymentRecorderService } from './src/services/funding-payment-recorder.service';
import { KuCoinRecorderService } from './src/lib/kucoin-recorder';
import prisma from './src/lib/prisma';

async function startTestRecording() {
  console.log('🎬 Starting KuCoin Funding Payment Recording Test');
  console.log('=' .repeat(70));

  try {
    // Get next funding time for RESOLV/USDT from database
    const fundingRate = await prisma.publicFundingRate.findUnique({
      where: {
        symbol_exchange: {
          symbol: 'RESOLV/USDT',
          exchange: 'KUCOIN'
        }
      }
    });

    if (!fundingRate) {
      throw new Error('RESOLV/USDT funding rate not found in database');
    }

    console.log('\n📊 Funding Rate Info:');
    console.log('  Symbol:', fundingRate.symbol);
    console.log('  Funding Rate:', (fundingRate.fundingRate * 100).toFixed(4), '%');
    console.log('  Next Funding Time:', fundingRate.nextFundingTime.toISOString());
    console.log('  Funding Interval:', fundingRate.fundingInterval, 'hours');

    const timeUntilFunding = fundingRate.nextFundingTime.getTime() - Date.now();
    const minutesUntil = Math.floor(timeUntilFunding / 60000);

    console.log('\n⏱️  Time until funding:', minutesUntil, 'minutes');

    let nextFundingTime = fundingRate.nextFundingTime;

    if (timeUntilFunding < 0) {
      console.log('\n⚠️  Scheduled funding time has already passed!');
      console.log('💡 Calculating next funding time...');

      // Calculate next funding time
      nextFundingTime = new Date(fundingRate.nextFundingTime.getTime() + fundingRate.fundingInterval * 3600000);
      console.log('📅 Next funding time:', nextFundingTime.toISOString());

      const timeUntilNext = nextFundingTime.getTime() - Date.now();
      const minutesUntilNext = Math.floor(timeUntilNext / 60000);
      console.log('⏱️  Minutes until next funding:', minutesUntilNext);
      console.log('');
    }

    if (timeUntilFunding < 5 * 60 * 1000) {
      console.log('\n⚠️  Warning: Less than 5 minutes until funding!');
      console.log('   Recording should start 20 seconds before funding.');
    }

    // Create KuCoin recorder service
    const kucoinService = new KuCoinRecorderService();
    await kucoinService.initialize();

    console.log('\n🚀 Starting recording session...');

    // Create recording config
    const config = {
      symbol: fundingRate.symbol,
      exchange: 'KUCOIN' as const,
      fundingRate: fundingRate.fundingRate,
      fundingPaymentTime: fundingRate.nextFundingTime,
      fundingInterval: fundingRate.fundingInterval,
      preRecordingSeconds: 20,  // 20 seconds before
      postRecordingSeconds: 60, // 60 seconds after
    };

    // Start recording
    const session = await FundingPaymentRecorderService.startRecording(config, kucoinService);

    console.log('✅ Recording session started!');
    console.log('   Session ID:', session.getSessionId());
    console.log('   Status:', session.getStatus());

    // Listen for status updates
    session.on('status', (data) => {
      console.log('\n📢 Status Update:', {
        status: data.status,
        totalPoints: data.totalPoints,
        fundingPaymentTimestamp: data.fundingPaymentTimestamp
          ? new Date(data.fundingPaymentTimestamp).toISOString()
          : 'N/A'
      });

      if (data.status === 'COMPLETED') {
        console.log('\n🎉 Recording completed successfully!');
        console.log('   Total data points:', data.totalPoints);
        console.log('   Check the database for the recording data.');
        process.exit(0);
      } else if (data.status === 'ERROR') {
        console.error('\n❌ Recording failed!');
        process.exit(1);
      }
    });

    console.log('\n⏳ Waiting for funding payment...');
    console.log('   Recording will automatically start 20 seconds before funding time.');
    console.log('   Press Ctrl+C to cancel.');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Stopping recording...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start
startTestRecording();
