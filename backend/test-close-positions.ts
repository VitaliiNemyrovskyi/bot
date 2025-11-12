/**
 * Test script to verify position closing works on all exchanges
 *
 * This script:
 * 1. Opens small test positions on BINGX and BYBIT
 * 2. Verifies positions are open
 * 3. Closes positions using connector methods
 * 4. Verifies positions are closed
 *
 * Usage: npx tsx test-close-positions.ts
 */

import { BingXConnector } from './src/connectors/bingx.connector';
import { BybitConnector } from './src/connectors/bybit.connector';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';

const TEST_SYMBOL = 'BTCUSDT';
const TEST_QUANTITY = 0.001; // Small quantity for testing
const USER_ID = 'admin_1';

interface TestResult {
  exchange: string;
  openSuccess: boolean;
  positionVerified: boolean;
  closeSuccess: boolean;
  closedVerified: boolean;
  error?: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBingX(): Promise<TestResult> {
  const result: TestResult = {
    exchange: 'BINGX',
    openSuccess: false,
    positionVerified: false,
    closeSuccess: false,
    closedVerified: false,
  };

  try {
    console.log('\n=== Testing BINGX ===\n');

    // Get credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(USER_ID, 'BINGX');
    if (!credentials) {
      throw new Error('No BINGX credentials found');
    }

    // Create connector
    const connector = new BingXConnector(
      credentials.apiKey,
      credentials.apiSecret,
      USER_ID,
      credentials.id
    );

    await connector.initialize();
    console.log('✓ BINGX connector initialized');

    // Set leverage
    await connector.setLeverage(TEST_SYMBOL, 1);
    console.log('✓ Leverage set to 1x');

    // Open position
    console.log(`\nOpening ${TEST_QUANTITY} ${TEST_SYMBOL} position...`);
    const order = await connector.placeMarketOrder(TEST_SYMBOL, 'Buy', TEST_QUANTITY);
    console.log('✓ Order placed:', order);
    result.openSuccess = true;

    // Wait for order to fill
    await sleep(2000);

    // Verify position is open
    const positions = await connector.getPositions(TEST_SYMBOL);
    const openPosition = positions.find((p: typeof positions[number]) => Math.abs(parseFloat(p.positionAmt || p.size || 0)) > 0);

    if (openPosition) {
      console.log('✓ Position verified open:', openPosition);
      result.positionVerified = true;
    } else {
      throw new Error('Position not found after opening');
    }

    // Close position
    console.log('\nClosing position...');
    const closeResult = await connector.closePosition(TEST_SYMBOL);
    console.log('✓ Close result:', closeResult);
    result.closeSuccess = true;

    // Wait for close to complete
    await sleep(2000);

    // Verify position is closed
    const finalPositions = await connector.getPositions(TEST_SYMBOL);
    const stillOpen = finalPositions.find((p: typeof finalPositions[number]) => Math.abs(parseFloat(p.positionAmt || p.size || 0)) > 0);

    if (!stillOpen) {
      console.log('✓ Position verified closed');
      result.closedVerified = true;
    } else {
      throw new Error('Position still open after close');
    }

    console.log('\n✅ BINGX test PASSED\n');

  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n❌ BINGX test FAILED:', err.message);
    result.error = err.message;
  }

  return result;
}

async function testBybit(): Promise<TestResult> {
  const result: TestResult = {
    exchange: 'BYBIT',
    openSuccess: false,
    positionVerified: false,
    closeSuccess: false,
    closedVerified: false,
  };

  try {
    console.log('\n=== Testing BYBIT ===\n');

    // Get credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(USER_ID, 'BYBIT');
    if (!credentials) {
      throw new Error('No BYBIT credentials found');
    }

    // Create connector
    const connector = new BybitConnector(
      credentials.apiKey,
      credentials.apiSecret,
      USER_ID,
      credentials.id
    );

    await connector.initialize();
    console.log('✓ BYBIT connector initialized');

    // Set leverage
    await connector.setLeverage(TEST_SYMBOL, 1);
    console.log('✓ Leverage set to 1x');

    // Open position
    console.log(`\nOpening ${TEST_QUANTITY} ${TEST_SYMBOL} position...`);
    const order = await connector.placeMarketOrder(TEST_SYMBOL, 'Buy', TEST_QUANTITY);
    console.log('✓ Order placed:', order);
    result.openSuccess = true;

    // Wait for order to fill
    await sleep(2000);

    // Verify position is open
    const positions = await connector.getPositions(TEST_SYMBOL);
    const openPosition = positions.find((p: typeof positions[number]) => Math.abs(parseFloat(p.size || p.positionAmt || 0)) > 0);

    if (openPosition) {
      console.log('✓ Position verified open:', openPosition);
      result.positionVerified = true;
    } else {
      throw new Error('Position not found after opening');
    }

    // Close position
    console.log('\nClosing position...');
    const closeResult = await connector.closePosition(TEST_SYMBOL);
    console.log('✓ Close result:', closeResult);
    result.closeSuccess = true;

    // Wait for close to complete
    await sleep(2000);

    // Verify position is closed
    const finalPositions = await connector.getPositions(TEST_SYMBOL);
    const stillOpen = finalPositions.find((p: typeof finalPositions[number]) => Math.abs(parseFloat(p.size || p.positionAmt || 0)) > 0);

    if (!stillOpen) {
      console.log('✓ Position verified closed');
      result.closedVerified = true;
    } else {
      throw new Error('Position still open after close');
    }

    console.log('\n✅ BYBIT test PASSED\n');

  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n❌ BYBIT test FAILED:', err.message);
    result.error = err.message;
  }

  return result;
}

async function runTests() {
  console.log('\n==========================================================');
  console.log('POSITION CLOSING TEST FOR ALL EXCHANGES');
  console.log('==========================================================\n');
  console.log(`Symbol: ${TEST_SYMBOL}`);
  console.log(`Quantity: ${TEST_QUANTITY}`);
  console.log(`User: ${USER_ID}`);
  console.log('\n⚠️  WARNING: This will open and close real positions!');
  console.log('==========================================================\n');

  const results: TestResult[] = [];

  // Test BINGX
  const bingxResult = await testBingX();
  results.push(bingxResult);

  // Test BYBIT
  const bybitResult = await testBybit();
  results.push(bybitResult);

  // Print summary
  console.log('\n==========================================================');
  console.log('TEST SUMMARY');
  console.log('==========================================================\n');

  results.forEach(result => {
    console.log(`${result.exchange}:`);
    console.log(`  Open Position:    ${result.openSuccess ? '✅' : '❌'}`);
    console.log(`  Verify Open:      ${result.positionVerified ? '✅' : '❌'}`);
    console.log(`  Close Position:   ${result.closeSuccess ? '✅' : '❌'}`);
    console.log(`  Verify Closed:    ${result.closedVerified ? '✅' : '❌'}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
    console.log('');
  });

  const allPassed = results.every(r =>
    r.openSuccess && r.positionVerified && r.closeSuccess && r.closedVerified
  );

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Position closing works on all exchanges.');
  } else {
    console.log('❌ SOME TESTS FAILED! Please review errors above.');
  }

  console.log('\n==========================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runTests();
