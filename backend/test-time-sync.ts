/**
 * Test script for time synchronization
 *
 * This script tests the time synchronization implementation for both BingX and Bybit exchanges.
 *
 * Usage:
 *   npx ts-node test-time-sync.ts
 */

import { BingXService } from './src/lib/bingx';
import { BybitService } from './src/lib/bybit';

async function testBingXTimeSync() {
  // console.log('\n========================================');
  // console.log('Testing BingX Time Synchronization');
  // console.log('========================================\n');

  try {
    // Create a BingX service instance (no credentials needed for server time)
    const bingxService = new BingXService({
      apiKey: process.env.BINGX_API_KEY || 'test-key',
      apiSecret: process.env.BINGX_API_SECRET || 'test-secret',
      enableRateLimit: true
    });

    // Test 1: Get server time
    // console.log('Test 1: Getting BingX server time...');
    const serverTime = await bingxService.getServerTime();
    const localTime = Date.now();
    // console.log(`  Server time: ${serverTime} (${new Date(serverTime).toISOString()})`);
    // console.log(`  Local time:  ${localTime} (${new Date(localTime).toISOString()})`);
    // console.log(`  Difference:  ${serverTime - localTime}ms`);

    // Test 2: Sync time
    console.log('\nTest 2: Synchronizing time...');
    await bingxService.syncTime();
    const syncStatus = bingxService.getTimeSyncStatus();
    console.log('  Sync status:', syncStatus);

    // Test 3: Get synced time
    console.log('\nTest 3: Getting synced time...');
    const syncedTime = bingxService.getSyncedTime();
    const currentTime = Date.now();
    console.log(`  Synced time:  ${syncedTime} (${new Date(syncedTime).toISOString()})`);
    console.log(`  Current time: ${currentTime} (${new Date(currentTime).toISOString()})`);
    console.log(`  Offset applied: ${syncedTime - currentTime}ms`);

    // Test 4: Verify offset consistency
    console.log('\nTest 4: Verifying offset consistency...');
    const serverTime2 = await bingxService.getServerTime();
    const syncedTime2 = bingxService.getSyncedTime();
    const difference = Math.abs(serverTime2 - syncedTime2);
    console.log(`  New server time: ${serverTime2}`);
    console.log(`  Synced time:     ${syncedTime2}`);
    console.log(`  Difference:      ${difference}ms`);

    if (difference < 500) {
      console.log('  ✓ Offset is accurate (within 500ms)');
    } else {
      console.log('  ⚠ Offset difference is large (> 500ms)');
    }

    console.log('\n✓ BingX time synchronization tests completed successfully');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n✗ BingX time synchronization test failed:', err.message);
    throw error;
  }
}

async function testBybitTimeSync() {
  console.log('\n========================================');
  console.log('Testing Bybit Time Synchronization');
  console.log('========================================\n');

  try {
    // Create a Bybit service instance (no credentials needed for server time)
    const bybitService = new BybitService({
      apiKey: process.env.BYBIT_API_KEY || 'test-key',
      apiSecret: process.env.BYBIT_API_SECRET || 'test-secret',
      testnet: true,
      enableRateLimit: true
    });

    // Test 1: Get server time
    console.log('Test 1: Getting Bybit server time...');
    const serverTime = await bybitService.getServerTime();
    const localTime = Date.now();
    console.log(`  Server time: ${serverTime} (${new Date(serverTime).toISOString()})`);
    console.log(`  Local time:  ${localTime} (${new Date(localTime).toISOString()})`);
    console.log(`  Difference:  ${serverTime - localTime}ms`);

    // Test 2: Sync time
    console.log('\nTest 2: Synchronizing time...');
    await bybitService.syncTime();
    const syncStatus = bybitService.getTimeSyncStatus();
    console.log('  Sync status:', syncStatus);

    // Test 3: Get synced time
    console.log('\nTest 3: Getting synced time...');
    const syncedTime = bybitService.getSyncedTime();
    const currentTime = Date.now();
    console.log(`  Synced time:  ${syncedTime} (${new Date(syncedTime).toISOString()})`);
    console.log(`  Current time: ${currentTime} (${new Date(currentTime).toISOString()})`);
    console.log(`  Offset applied: ${syncedTime - currentTime}ms`);

    // Test 4: Verify offset consistency
    console.log('\nTest 4: Verifying offset consistency...');
    const serverTime2 = await bybitService.getServerTime();
    const syncedTime2 = bybitService.getSyncedTime();
    const difference = Math.abs(serverTime2 - syncedTime2);
    console.log(`  New server time: ${serverTime2}`);
    console.log(`  Synced time:     ${syncedTime2}`);
    console.log(`  Difference:      ${difference}ms`);

    if (difference < 500) {
      console.log('  ✓ Offset is accurate (within 500ms)');
    } else {
      console.log('  ⚠ Offset difference is large (> 500ms)');
    }

    console.log('\n✓ Bybit time synchronization tests completed successfully');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n✗ Bybit time synchronization test failed:', err.message);
    throw error;
  }
}

async function testPeriodicSync() {
  console.log('\n========================================');
  console.log('Testing Periodic Synchronization');
  console.log('========================================\n');

  try {
    const bingxService = new BingXService({
      apiKey: 'test-key',
      apiSecret: 'test-secret',
      testnet: true,
      enableRateLimit: true
    });

    console.log('Test 1: Starting periodic sync...');
    await bingxService.syncTime();
    bingxService.startPeriodicSync();
    console.log('  ✓ Periodic sync started');

    console.log('\nTest 2: Checking sync status...');
    const status1 = bingxService.getTimeSyncStatus();
    console.log('  Status:', status1);

    console.log('\nTest 3: Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const status2 = bingxService.getTimeSyncStatus();
    console.log('  Status:', status2);
    console.log(`  Sync age increased: ${status2.syncAge - status1.syncAge}ms`);

    console.log('\nTest 4: Stopping periodic sync...');
    bingxService.stopPeriodicSync();
    console.log('  ✓ Periodic sync stopped');

    console.log('\n✓ Periodic synchronization tests completed successfully');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n✗ Periodic synchronization test failed:', err.message);
    throw error;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Time Synchronization Test Suite');
  console.log('='.repeat(60));

  try {
    await testBingXTimeSync();
    await testBybitTimeSync();
    await testPeriodicSync();

    console.log('\n' + '='.repeat(60));
    console.log('✓ All tests completed successfully');
    console.log('='.repeat(60) + '\n');
  } catch (error: unknown) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ Tests failed');
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
}

main();
