/**
 * Simple verification script to test price monitoring functionality
 *
 * This script demonstrates that all three connectors properly implement
 * the new price monitoring methods.
 */

import { BybitConnector } from './connectors/bybit.connector';
import { BingXConnector } from './connectors/bingx.connector';
import { MEXCConnector } from './connectors/mexc.connector';

async function testBybit() {
  console.log('\n=== Testing Bybit Connector ===\n');

  const connector = new BybitConnector(
    process.env.BYBIT_API_KEY || 'test-key',
    process.env.BYBIT_API_SECRET || 'test-secret',
    true
  );

  try {
    await connector.initialize();

    // Test REST API
    console.log('Testing getMarketPrice()...');
    const price = await connector.getMarketPrice('BTCUSDT');
    console.log(`✓ Current BTC price: $${price}`);

    // Test WebSocket
    console.log('\nTesting subscribeToPriceStream()...');
    let updateCount = 0;
    const unsubscribe = await connector.subscribeToPriceStream(
      'BTCUSDT',
      (price, timestamp) => {
        updateCount++;
        if (updateCount <= 3) {
          console.log(`✓ Price update ${updateCount}: $${price} at ${new Date(timestamp).toISOString()}`);
        }
      }
    );

    // Wait for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));

    unsubscribe();
    console.log(`\n✓ Received ${updateCount} price updates`);
    console.log('✓ Bybit connector working correctly!\n');
  } catch (error: any) {
    console.error('✗ Error testing Bybit:', error.message);
  }
}

async function testBingX() {
  console.log('\n=== Testing BingX Connector ===\n');

  const connector = new BingXConnector(
    process.env.BINGX_API_KEY || 'test-key',
    process.env.BINGX_API_SECRET || 'test-secret',
    false
  );

  try {
    await connector.initialize();

    // Test REST API
    console.log('Testing getMarketPrice()...');
    const price = await connector.getMarketPrice('BTC-USDT');
    console.log(`✓ Current BTC price: $${price}`);

    // Test WebSocket
    console.log('\nTesting subscribeToPriceStream()...');
    let updateCount = 0;
    const unsubscribe = await connector.subscribeToPriceStream(
      'BTC-USDT',
      (price, timestamp) => {
        updateCount++;
        if (updateCount <= 3) {
          console.log(`✓ Price update ${updateCount}: $${price} at ${new Date(timestamp).toISOString()}`);
        }
      }
    );

    // Wait for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));

    unsubscribe();
    console.log(`\n✓ Received ${updateCount} price updates`);
    console.log('✓ BingX connector working correctly!\n');
  } catch (error: any) {
    console.error('✗ Error testing BingX:', error.message);
  }
}

async function testMEXC() {
  console.log('\n=== Testing MEXC Connector ===\n');

  const connector = new MEXCConnector(
    process.env.MEXC_API_KEY || 'test-key',
    process.env.MEXC_API_SECRET || 'test-secret',
    false
  );

  try {
    await connector.initialize();

    // Test REST API
    console.log('Testing getMarketPrice()...');
    const price = await connector.getMarketPrice('BTC_USDT');
    console.log(`✓ Current BTC price: $${price}`);

    // Test WebSocket
    console.log('\nTesting subscribeToPriceStream()...');
    let updateCount = 0;
    const unsubscribe = await connector.subscribeToPriceStream(
      'BTC_USDT',
      (price, timestamp) => {
        updateCount++;
        if (updateCount <= 3) {
          console.log(`✓ Price update ${updateCount}: $${price} at ${new Date(timestamp).toISOString()}`);
        }
      }
    );

    // Wait for 10 seconds
    await new Promise((resolve) => setTimeout(resolve, 10000));

    unsubscribe();
    console.log(`\n✓ Received ${updateCount} price updates`);
    console.log('✓ MEXC connector working correctly!\n');
  } catch (error: any) {
    console.error('✗ Error testing MEXC:', error.message);
  }
}

async function main() {
  console.log('===================================================');
  console.log('  Price Monitoring Verification Script');
  console.log('===================================================');

  const exchange = process.argv[2];

  if (!exchange || exchange === 'all') {
    await testBybit();
    await testBingX();
    await testMEXC();
  } else if (exchange === 'bybit') {
    await testBybit();
  } else if (exchange === 'bingx') {
    await testBingX();
  } else if (exchange === 'mexc') {
    await testMEXC();
  } else {
    console.log('Usage: tsx test-price-monitoring.ts [bybit|bingx|mexc|all]');
    process.exit(1);
  }

  console.log('\n===================================================');
  console.log('  All tests completed!');
  console.log('===================================================\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
