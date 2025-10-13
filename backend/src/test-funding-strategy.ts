/**
 * Test script for Bybit Funding Strategy
 *
 * This script demonstrates how to use the funding strategy service.
 * It starts a strategy, monitors events, and stops it after completion.
 *
 * Usage:
 * 1. Set your Bybit API credentials in .env
 * 2. Run: npx tsx src/test-funding-strategy.ts
 */

import 'dotenv/config';
import { BybitFundingStrategyService } from './services/bybit-funding-strategy.service';

// Configuration
const API_KEY = process.env.BYBIT_TESTNET_API_KEY || '';
const API_SECRET = process.env.BYBIT_TESTNET_API_SECRET || '';
const TESTNET = true;

const STRATEGY_CONFIG = {
  userId: 'test_user',
  symbol: 'BTCUSDT',        // Trading pair
  leverage: 10,              // 10x leverage
  margin: 100,               // 100 USDT margin
  side: 'Buy' as const,      // LONG position to collect positive funding
  executionDelay: 5,         // Open position 5 seconds before funding
  takeProfitPercent: 90,     // TP = 90% of expected funding
  stopLossPercent: 20,       // SL = 20% of expected funding
};

async function main() {
  if (!API_KEY || !API_SECRET) {
    console.error('❌ Please set BYBIT_TESTNET_API_KEY and BYBIT_TESTNET_API_SECRET in .env file');
    process.exit(1);
  }

  console.log('='.repeat(80));
  console.log('BYBIT FUNDING STRATEGY TEST');
  console.log('='.repeat(80));
  console.log('\nConfiguration:');
  console.log(JSON.stringify(STRATEGY_CONFIG, null, 2));
  console.log('\n' + '='.repeat(80));

  // Create service instance
  const service = new BybitFundingStrategyService();

  // Listen to all events
  service.on(BybitFundingStrategyService.COUNTDOWN, (event: any) => {
    const minutes = Math.floor(event.secondsRemaining / 60);
    const seconds = event.secondsRemaining % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    console.log(`⏱️  COUNTDOWN: ${timeStr} | Funding Rate: ${(event.fundingRate * 100).toFixed(4)}%`);
  });

  service.on(BybitFundingStrategyService.POSITION_OPENING, (event: any) => {
    console.log('\n' + '='.repeat(80));
    console.log('📈 OPENING POSITION');
    console.log('='.repeat(80));
    console.log(`Symbol: ${event.symbol}`);
    console.log(`Side: ${event.side}`);
    console.log(`Price: $${event.price.toFixed(2)}`);
    console.log(`Margin: ${event.margin} USDT`);
    console.log(`Leverage: ${event.leverage}x`);
    console.log('='.repeat(80) + '\n');
  });

  service.on(BybitFundingStrategyService.POSITION_OPENED, (event: any) => {
    console.log('\n' + '='.repeat(80));
    console.log('✅ POSITION OPENED WITH TP/SL');
    console.log('='.repeat(80));
    console.log(`Entry Price: $${event.entryPrice.toFixed(2)}`);
    console.log(`Take Profit: $${event.tpPrice.toFixed(2)}`);
    console.log(`Stop Loss:   $${event.slPrice.toFixed(2)}`);
    console.log('='.repeat(80) + '\n');
  });

  service.on(BybitFundingStrategyService.POSITION_CLOSED, (event: any) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔴 POSITION CLOSED');
    console.log('='.repeat(80));
    console.log(`Reason: ${event.reason}`);
    console.log('='.repeat(80) + '\n');
  });

  service.on(BybitFundingStrategyService.POSITION_REOPENING, (event: any) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔄 REOPENING POSITION');
    console.log('='.repeat(80));
    console.log(`Attempt: #${event.attempt}`);
    console.log(`Time Remaining: ${event.secondsRemaining}s`);
    console.log('Reason: Position closed before funding time');
    console.log('='.repeat(80) + '\n');
  });

  service.on(BybitFundingStrategyService.FUNDING_COLLECTED, (event: any) => {
    console.log('\n' + '='.repeat(80));
    console.log('💰 FUNDING COLLECTED!');
    console.log('='.repeat(80));
    console.log(`Amount: ${event.amount.toFixed(2)} USDT`);
    console.log(`Funding Rate: ${(event.fundingRate * 100).toFixed(4)}%`);
    console.log(`Position Reopens: ${event.positionReopenCount}x`);
    console.log('='.repeat(80) + '\n');
  });

  service.on(BybitFundingStrategyService.ERROR, (event: any) => {
    console.error('\n' + '='.repeat(80));
    console.error('❌ ERROR');
    console.error('='.repeat(80));
    console.error(`Strategy: ${event.strategyId}`);
    console.error(`Error: ${event.error}`);
    if (event.action) {
      console.error(`Action: ${event.action}`);
    }
    console.error('='.repeat(80) + '\n');
  });

  try {
    // Start strategy
    console.log('\n🚀 Starting strategy...\n');
    const strategyId = await service.startStrategy(
      STRATEGY_CONFIG,
      API_KEY,
      API_SECRET,
      TESTNET
    );

    console.log(`✅ Strategy started: ${strategyId}\n`);

    // Get strategy details
    const strategy = service.getStrategy(strategyId);
    if (strategy) {
      const now = Date.now();
      const secondsRemaining = Math.floor((strategy.nextFundingTime - now) / 1000);
      const fundingTime = new Date(strategy.nextFundingTime);

      console.log('Strategy Details:');
      console.log(`  Next Funding Time: ${fundingTime.toLocaleString()}`);
      console.log(`  Time Remaining: ${Math.floor(secondsRemaining / 60)}m ${secondsRemaining % 60}s`);
      console.log(`  Current Funding Rate: ${(strategy.fundingRate * 100).toFixed(4)}%`);
      console.log(`  Current Price: $${strategy.currentPrice.toFixed(2)}`);
      console.log(`  Expected Funding: ${(STRATEGY_CONFIG.margin * STRATEGY_CONFIG.leverage * strategy.fundingRate).toFixed(2)} USDT`);
      console.log(`  Take Profit Target: ${(STRATEGY_CONFIG.margin * STRATEGY_CONFIG.leverage * strategy.fundingRate * 0.9).toFixed(2)} USDT (90%)`);
      console.log('');
    }

    // Keep script running until funding collected or error
    console.log('ℹ️  Monitoring strategy... Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Stopping strategy...');
      try {
        await service.stopStrategy(strategyId);
        console.log('✅ Strategy stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping strategy:', error);
      }
      process.exit(0);
    });

    // Auto-stop after funding collected
    service.once(BybitFundingStrategyService.FUNDING_COLLECTED, async () => {
      console.log('\n✅ Funding collected! Strategy will stop in 5 seconds...\n');
      setTimeout(async () => {
        try {
          await service.stopStrategy(strategyId);
          console.log('✅ Strategy stopped successfully');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error stopping strategy:', error);
          process.exit(1);
        }
      }, 5000);
    });

    // Keep process alive
    await new Promise(() => {});
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
