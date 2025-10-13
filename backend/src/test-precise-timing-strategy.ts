/**
 * Test script for Precise Timing Strategy
 *
 * This script tests the new precise timing strategy that opens positions
 * at exactly funding time + 20ms with latency compensation.
 */

import { bybitFundingStrategyService } from './services/bybit-funding-strategy.service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const BYBIT_API_KEY = process.env.BYBIT_TESTNET_API_KEY || '';
const BYBIT_API_SECRET = process.env.BYBIT_TESTNET_API_SECRET || '';

async function testPreciseTimingStrategy() {
  console.log('='.repeat(80));
  console.log('Testing Precise Timing Strategy');
  console.log('='.repeat(80));

  if (!BYBIT_API_KEY || !BYBIT_API_SECRET) {
    console.error('❌ Missing Bybit API credentials!');
    console.error('Please set BYBIT_TESTNET_API_KEY and BYBIT_TESTNET_API_SECRET in .env.local');
    process.exit(1);
  }

  console.log('\n✓ API credentials loaded');
  console.log('  API Key:', BYBIT_API_KEY.substring(0, 8) + '...');
  console.log('  API Secret:', BYBIT_API_SECRET.substring(0, 8) + '...');

  try {
    console.log('\n📊 Starting Precise Timing Strategy Test...\n');

    // Test configuration
    const config = {
      userId: 'test_user_1',
      symbol: 'BTCUSDT',
      leverage: 2,              // Low leverage for testing
      margin: 10,               // Small margin for testing (10 USDT)
      positionSide: 'Auto' as const, // Auto-determine from funding rate
      takeProfitPercent: 90,    // 90% of expected funding
      stopLossPercent: 50,      // 50% of expected funding
      timingOffset: 20,         // Open 20ms after funding time
      autoRepeat: false,        // No auto-repeat for testing
      enableWebSocketMonitoring: true,
    };

    console.log('📋 Configuration:');
    console.log('  Symbol:', config.symbol);
    console.log('  Leverage:', config.leverage + 'x');
    console.log('  Margin:', config.margin, 'USDT');
    console.log('  Position Side:', config.positionSide, '(auto-determined)');
    console.log('  TP:', config.takeProfitPercent + '%');
    console.log('  SL:', config.stopLossPercent + '%');
    console.log('  Timing Offset:', config.timingOffset + 'ms');
    console.log('  Auto-repeat:', config.autoRepeat ? 'Yes' : 'No');
    console.log('  WebSocket:', config.enableWebSocketMonitoring ? 'Enabled' : 'Disabled');
    console.log('');

    // Listen to strategy events
    console.log('🎧 Setting up event listeners...\n');

    bybitFundingStrategyService.on('countdown', (data) => {
      const { strategyId, symbol, secondsRemaining, fundingRate, nextFundingTime } = data;
      if (secondsRemaining % 30 === 0 || secondsRemaining <= 10) {
        console.log(`⏰ [${strategyId}] Countdown: ${secondsRemaining}s remaining`);
        console.log(`   Symbol: ${symbol}, Funding Rate: ${(fundingRate * 100).toFixed(4)}%`);
        console.log(`   Next Funding: ${new Date(nextFundingTime).toISOString()}`);
      }
    });

    bybitFundingStrategyService.on('position_opening', (data) => {
      const { strategyId, symbol, side, price, margin, leverage, positionNumber } = data;
      console.log(`\n🔓 [${strategyId}] Opening Position ${positionNumber}:`);
      console.log(`   Symbol: ${symbol}`);
      console.log(`   Side: ${side}`);
      console.log(`   Price: $${price}`);
      console.log(`   Margin: ${margin} USDT`);
      console.log(`   Leverage: ${leverage}x`);
    });

    bybitFundingStrategyService.on('position_opened', (data) => {
      const { strategyId, positionNumber, side, tpPrice, slPrice, entryPrice } = data;
      console.log(`\n✅ [${strategyId}] Position ${positionNumber} Opened:`);
      console.log(`   Side: ${side}`);
      console.log(`   Entry Price: $${entryPrice}`);
      console.log(`   Take Profit: $${tpPrice}`);
      console.log(`   Stop Loss: $${slPrice}`);
    });

    bybitFundingStrategyService.on('position_closed', (data) => {
      const { strategyId, positionNumber, side, reason, price } = data;
      console.log(`\n🔒 [${strategyId}] Position ${positionNumber} Closed:`);
      console.log(`   Side: ${side}`);
      console.log(`   Reason: ${reason}`);
      if (price) console.log(`   Price: $${price}`);
    });

    bybitFundingStrategyService.on('funding_collected', (data) => {
      const { strategyId, amount, fundingRate, positionReopenCount } = data;
      console.log(`\n💰 [${strategyId}] Funding Collected:`);
      console.log(`   Amount: ${amount.toFixed(2)} USDT`);
      console.log(`   Funding Rate: ${(fundingRate * 100).toFixed(4)}%`);
      console.log(`   Position Reopen Count: ${positionReopenCount}`);
    });

    bybitFundingStrategyService.on('error', (data) => {
      const { strategyId, error, action } = data;
      console.error(`\n❌ [${strategyId}] Error:`, error);
      if (action) console.error(`   Action: ${action}`);
    });

    console.log('✓ Event listeners registered\n');

    // Start the strategy
    console.log('🚀 Starting Precise Timing Strategy...\n');

    const strategyId = await bybitFundingStrategyService.startPreciseTimingStrategy(
      config,
      BYBIT_API_KEY,
      BYBIT_API_SECRET,
      true, // testnet
      'test_credential_id'
    );

    console.log('✅ Strategy Started Successfully!');
    console.log('   Strategy ID:', strategyId);
    console.log('');

    // Get strategy details
    const strategy = bybitFundingStrategyService.getStrategy(strategyId);
    if (strategy) {
      console.log('📈 Strategy Details:');
      console.log('   Symbol:', strategy.config.symbol);
      console.log('   Status:', strategy.status);
      console.log('   Funding Rate:', (strategy.fundingRate * 100).toFixed(4) + '%');
      console.log('   Next Funding Time:', new Date(strategy.nextFundingTime).toISOString());
      console.log('   Position Side:', strategy.secondPositionSide);
      console.log('   Current Price:', strategy.currentPrice);
      console.log('');

      const now = Date.now();
      const secondsUntilFunding = Math.floor((strategy.nextFundingTime - now) / 1000);

      if (secondsUntilFunding > 0) {
        console.log(`⏳ Waiting ${secondsUntilFunding} seconds until funding time...`);
        console.log(`   Funding Time: ${new Date(strategy.nextFundingTime).toISOString()}`);
        console.log(`   Target Execution: ${new Date(strategy.nextFundingTime + config.timingOffset).toISOString()}`);
        console.log('');
        console.log('✓ Strategy is now monitoring and will execute at precise time!');
        console.log('  Press Ctrl+C to stop the test');
      } else {
        console.log('⚠️  Next funding time has already passed!');
        console.log('   The strategy will wait for the next funding cycle.');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('Test running... Strategy will execute automatically at funding time + 20ms');
    console.log('='.repeat(80) + '\n');

    // Keep the script running
    await new Promise(() => {
      // Run forever until Ctrl+C
    });

  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n\n⚠️  Received SIGINT (Ctrl+C). Stopping all strategies...');

  try {
    await bybitFundingStrategyService.stopAll();
    console.log('✓ All strategies stopped');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error stopping strategies:', error.message);
    process.exit(1);
  }
});

// Run the test
testPreciseTimingStrategy();
