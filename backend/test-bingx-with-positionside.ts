/**
 * Test BingX order placement with positionSide parameter
 * This test verifies that the positionSide parameter is now correctly included in BingX orders
 */

import { BingXService } from './src/lib/bingx';

async function testBingXOrderWithPositionSide() {
  console.log('=== Testing BingX Order with positionSide ===\n');

  // Initialize BingX service (using environment variables or hardcoded test credentials)
  const apiKey = process.env.BINGX_API_KEY || 'test-key';
  const apiSecret = process.env.BINGX_API_SECRET || 'test-secret';

  if (!apiKey || apiKey === 'test-key') {
    console.log('⚠️  No BingX credentials found in environment');
    console.log('Set BINGX_API_KEY and BINGX_API_SECRET environment variables to test with real credentials\n');
  }

  const bingxService = new BingXService({
    apiKey,
    apiSecret,
    testnet: false,
    enableRateLimit: true
  });

  try {
    // Sync time first
    console.log('1. Synchronizing time with BingX server...');
    await bingxService.syncTime();
    console.log('✓ Time synchronized\n');

    // Test order parameters
    const testOrder = {
      symbol: 'BTC-USDT',
      side: 'BUY' as const,
      positionSide: 'LONG' as const,
      type: 'MARKET' as const,
      quantity: 0.001  // Small test quantity
    };

    console.log('2. Testing order with positionSide parameter:');
    console.log(JSON.stringify(testOrder, null, 2));
    console.log();

    // Use test endpoint (won't actually place order)
    console.log('3. Calling BingX test order endpoint...');
    const result = await bingxService.testOrder(testOrder);

    console.log('✅ SUCCESS! Order validation passed with positionSide parameter\n');
    console.log('Response:', JSON.stringify(result, null, 2));

    return true;
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

// Run the test
testBingXOrderWithPositionSide()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
