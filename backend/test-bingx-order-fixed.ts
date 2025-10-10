/**
 * Test BingX order placement with One-Way Mode fix
 * This test verifies that orders work WITHOUT positionSide parameter
 */
import { BingXService } from './src/lib/bingx';

async function testBingXOrderFixed() {
  console.log('=== Testing BingX Order (One-Way Mode Fix) ===\n');

  const apiKey = process.env.BINGX_API_KEY;
  const apiSecret = process.env.BINGX_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('❌ Missing BINGX_API_KEY or BINGX_API_SECRET environment variables');
    console.log('\nUsage:');
    console.log('BINGX_API_KEY="your_key" BINGX_API_SECRET="your_secret" npx tsx test-bingx-order-fixed.ts');
    process.exit(1);
  }

  console.log('✓ API credentials loaded');
  console.log('  API Key length:', apiKey.length);
  console.log('  API Secret length:', apiSecret.length);
  console.log('  API Key prefix:', apiKey.substring(0, 8) + '...\n');

  const bingxService = new BingXService({
    apiKey,
    apiSecret,
    testnet: false,
    enableRateLimit: true
  });

  try {
    // Sync time with BingX server
    console.log('⏱️  Synchronizing time with BingX server...');
    await bingxService.syncTime();
    const timeStatus = bingxService.getTimeSyncStatus();
    console.log('✓ Time synced successfully');
    console.log('  Offset:', timeStatus.offset, 'ms');
    console.log('  Sync age:', timeStatus.syncAge, 'ms\n');

    // Test order with BTC-USDT (most liquid pair)
    const orderRequest = {
      symbol: 'BTC-USDT',
      side: 'BUY' as const,
      type: 'MARKET' as const,
      quantity: 0.001  // Small test amount (~$100)
      // NOTE: positionSide is intentionally omitted for One-Way Mode
    };

    console.log('📋 Test order request (One-Way Mode):');
    console.log('  Symbol:', orderRequest.symbol);
    console.log('  Side:', orderRequest.side);
    console.log('  Type:', orderRequest.type);
    console.log('  Quantity:', orderRequest.quantity);
    console.log('  ⚠️  positionSide: NOT SENT (One-Way Mode)\n');

    console.log('🧪 Calling test order endpoint (no real order placed)...\n');

    const result = await bingxService.testOrder(orderRequest);

    console.log('\n✅ SUCCESS! Order validated without positionSide parameter');
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('\n🎉 Fix confirmed: BingX accepts orders in One-Way Mode!\n');

    return true;
  } catch (error: any) {
    console.error('\n❌ FAILED:', error.message);

    if (error.message.includes('109414')) {
      console.log('\n⚠️  Error 109414 detected - This means:');
      console.log('   1. Your BingX account might be in Hedge Mode');
      console.log('   2. You need to uncomment positionSide in bingx.ts (lines 607-609 and 664-666)');
      console.log('   3. OR switch your BingX account to One-Way Mode in settings\n');
    }

    return false;
  }
}

testBingXOrderFixed()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
