/**
 * Test BingX order with official example format
 */
import { BingXService } from './src/lib/bingx';

async function testBingXOrder() {
  console.log('Testing BingX order with official format...\n');

  const bingxService = new BingXService({
    apiKey: process.env.BINGX_API_KEY || '',
    apiSecret: process.env.BINGX_API_SECRET || '',
    testnet: false,
    enableRateLimit: true
  });

  try {
    await bingxService.syncTime();
    console.log('✓ Time synced\n');

    // Use exact format from official example
    const orderRequest = {
      symbol: 'BTC-USDT',
      side: 'BUY' as const,
      positionSide: 'LONG' as const,
      type: 'MARKET' as const,
      quantity: 0.001  // Small test amount
    };

    console.log('Order request:', JSON.stringify(orderRequest, null, 2));
    console.log('\nCalling testOrder endpoint...\n');

    const result = await bingxService.testOrder(orderRequest);
    console.log('✅ SUCCESS!\n');
    console.log('Response:', JSON.stringify(result, null, 2));

  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testBingXOrder();
