#!/usr/bin/env tsx
/**
 * BingX Connector Diagnostic Test Script
 *
 * This script tests the BingX connector initialization and helps diagnose
 * timestamp and authentication issues.
 *
 * Usage: npm run test-bingx (add this to package.json) or tsx test-bingx-connector.ts
 */

import { config } from 'dotenv';
import { BingXConnector } from './src/connectors/bingx.connector';

// Load environment variables
config({ path: '.env.local' });

async function testBingXConnector() {
  console.log('='.repeat(80));
  console.log('BingX Connector Diagnostic Test');
  console.log('='.repeat(80));
  console.log();

  // Check environment variables
  const apiKey = process.env.BINGX_API_KEY;
  const apiSecret = process.env.BINGX_API_SECRET;
  const testnet = process.env.BINGX_TESTNET !== 'false';

  console.log('[Config] Environment Variables:');
  console.log(`  API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET'}`);
  console.log(`  API Secret: ${apiSecret ? `${apiSecret.substring(0, 10)}...` : 'NOT SET'}`);
  console.log(`  Testnet: ${testnet}`);
  console.log();

  if (!apiKey || !apiSecret) {
    console.error('[ERROR] BingX API credentials not found in environment variables');
    console.error('Please set BINGX_API_KEY and BINGX_API_SECRET in .env.local');
    process.exit(1);
  }

  try {
    console.log('[Test 1] Creating BingX connector instance...');
    const connector = new BingXConnector(apiKey, apiSecret, testnet);
    console.log('[Test 1] SUCCESS: Connector instance created');
    console.log();

    console.log('[Test 2] Initializing connector (includes time sync and auth test)...');
    const startTime = Date.now();

    try {
      await connector.initialize();
      const duration = Date.now() - startTime;
      console.log(`[Test 2] SUCCESS: Connector initialized in ${duration}ms`);
      console.log();

      console.log('[Test 3] Fetching account balance...');
      const balance = await connector.getBalance();
      console.log('[Test 3] SUCCESS: Balance retrieved');
      console.log('Balance data:', JSON.stringify(balance, null, 2));
      console.log();

      console.log('[Test 4] Testing additional operations...');
      // You can add more tests here as needed

      console.log('='.repeat(80));
      console.log('ALL TESTS PASSED!');
      console.log('='.repeat(80));

    } catch (initError: any) {
      const duration = Date.now() - startTime;
      console.error(`[Test 2] FAILED after ${duration}ms`);
      console.error('[Error Details]');
      console.error(`  Message: ${initError.message}`);
      console.error(`  Stack: ${initError.stack}`);
      console.log();

      // Try to extract more details
      if (initError.message.includes('timestamp')) {
        console.log('[Diagnosis] This appears to be a timestamp/time sync issue');
        console.log('Possible causes:');
        console.log('  1. System clock is not synchronized');
        console.log('  2. Network latency is too high');
        console.log('  3. BingX server time endpoint is not accessible');
        console.log('  4. Signature calculation is incorrect');
        console.log();
        console.log('Suggestions:');
        console.log('  1. Check system time: date');
        console.log('  2. Verify network connectivity to BingX servers');
        console.log('  3. Check the logs above for time sync details');
      }

      if (initError.message.includes('API error')) {
        console.log('[Diagnosis] This appears to be an API authentication issue');
        console.log('Possible causes:');
        console.log('  1. API credentials are incorrect');
        console.log('  2. API key does not have required permissions');
        console.log('  3. IP whitelisting is enabled but your IP is not whitelisted');
        console.log('  4. Signature generation is incorrect');
      }

      process.exit(1);
    }

  } catch (error: any) {
    console.error('[FATAL ERROR]');
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Run the test
testBingXConnector().catch((error) => {
  console.error('[UNHANDLED ERROR]', error);
  process.exit(1);
});
