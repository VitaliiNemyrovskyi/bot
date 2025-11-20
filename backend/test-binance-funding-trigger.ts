/**
 * Test Binance Funding Trigger Strategy
 *
 * This script tests the funding payment detection and SHORT scalp strategy on Binance Futures.
 *
 * Requirements:
 * - BINANCE_API_KEY and BINANCE_API_SECRET in .env
 * - Know the next funding time for your symbol
 * - Have sufficient USDT balance in Binance Futures account
 */

import { BinanceFundingTriggerService } from './src/services/binance-funding-trigger.service';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔍 BINANCE FUNDING TRIGGER STRATEGY TEST');
  console.log('='.repeat(70));

  // Check environment variables
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('❌ Missing Binance API credentials in .env file');
    console.error('   Required: BINANCE_API_KEY, BINANCE_API_SECRET');
    process.exit(1);
  }

  console.log('✅ API credentials loaded');

  // Configuration
  const symbol = 'BTCUSDT'; // Change to your target symbol

  // TODO: Get next funding time from Binance API or manual input
  // For now, set manually (example: next funding at 08:00 UTC)
  const now = new Date();
  const nextFunding = new Date(now);

  // Calculate next funding time (Binance: every 8 hours at 00:00, 08:00, 16:00 UTC)
  const currentHour = now.getUTCHours();
  let nextFundingHour: number;

  if (currentHour < 8) {
    nextFundingHour = 8;
  } else if (currentHour < 16) {
    nextFundingHour = 16;
  } else {
    nextFundingHour = 0;
    nextFunding.setUTCDate(nextFunding.getUTCDate() + 1);
  }

  nextFunding.setUTCHours(nextFundingHour, 0, 0, 0);

  const timeUntilFunding = nextFunding.getTime() - now.getTime();
  const minutesUntilFunding = Math.floor(timeUntilFunding / 60000);

  console.log('\n📊 STRATEGY CONFIGURATION:');
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Next Funding Time: ${nextFunding.toISOString()}`);
  console.log(`   Time Until Funding: ${minutesUntilFunding} minutes`);
  console.log(`   Trigger Position: 5 USDT (LONG)`);
  console.log(`   Main Position: 100 USDT (SHORT)`);
  console.log(`   Max Hold Time: 6 seconds`);

  // Warning if funding time is too far or too close
  if (timeUntilFunding < 0) {
    console.error('\n❌ ERROR: Next funding time is in the past!');
    console.error('   Please update the funding time in the script.');
    process.exit(1);
  }

  if (minutesUntilFunding > 60) {
    console.warn(`\n⚠️  WARNING: Funding time is ${minutesUntilFunding} minutes away.`);
    console.warn('   Consider running this closer to funding time.');
    console.log('\nPress Ctrl+C to cancel, or wait to continue...\n');
  }

  if (minutesUntilFunding < 1) {
    console.error('\n❌ ERROR: Less than 1 minute until funding!');
    console.error('   Too late to execute this strategy safely.');
    process.exit(1);
  }

  // Create and execute strategy
  const strategy = new BinanceFundingTriggerService({
    symbol,
    fundingTime: nextFunding,
    triggerPositionUsdt: 5, // Small LONG trigger
    mainPositionUsdt: 100, // Main SHORT scalp
    maxHoldTimeSeconds: 6, // Exit after 6 seconds max
    apiKey,
    apiSecret,
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  User interrupted, stopping strategy...');
    await strategy.stop();
    process.exit(0);
  });

  // Execute strategy
  console.log('\n🚀 EXECUTING STRATEGY...\n');

  try {
    const result = await strategy.execute();

    if (result.success) {
      console.log('\n' + '='.repeat(70));
      console.log('🎉 STRATEGY COMPLETED SUCCESSFULLY!');
      console.log('='.repeat(70));
      console.log(`\n📈 FINAL RESULTS:`);
      console.log(`   Short Entry Price: ${result.shortEntryPrice}`);
      console.log(`   Short Exit Price: ${result.shortExitPrice}`);
      console.log(`   Gross Profit: ${result.grossProfitPercent?.toFixed(4)}%`);
      console.log(`   Funding Cost: ${result.fundingCost?.toFixed(4)}%`);
      console.log(`   Net Profit: ${result.netProfitPercent?.toFixed(4)}%`);
      console.log(`   Hold Time: ${((result.holdTimeMs || 0) / 1000).toFixed(2)}s`);

      if ((result.netProfitPercent || 0) > 0) {
        console.log('\n✅ PROFITABLE TRADE! 🎯💰');
      } else {
        console.log('\n❌ LOSING TRADE 📉');
      }
    } else {
      console.log('\n❌ STRATEGY FAILED');
      console.log(`   Error: ${result.error}`);
    }

  } catch (error: any) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

main();
