/**
 * Test BingX order validation without executing
 */
import prisma from './src/lib/prisma';
import { BingXService } from './src/lib/bingx';
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64');

function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

async function testBingXOrderValidation() {
  console.log('=== BingX Order Validation Test ===\n');

  // Get BingX credentials
  const cred = await prisma.exchangeCredentials.findFirst({
    where: {
      userId: 'admin_1',
      exchange: 'BINGX',
      environment: 'MAINNET',
      isActive: true
    }
  });

  if (!cred) {
    throw new Error('No BingX MAINNET credentials found');
  }

  const apiKey = decrypt(cred.apiKey);
  const apiSecret = decrypt(cred.apiSecret);

  console.log('✅ Credentials loaded\n');

  // Initialize BingX service
  const bingx = new BingXService({
    apiKey,
    apiSecret,
    testnet: false,
    enableRateLimit: true
  });

  // Sync time
  console.log('Syncing time with BingX...');
  await bingx.syncTime();
  console.log('✅ Time synced\n');

  // Test order validation
  console.log('Testing order parameters...\n');

  const testOrders = [
    // Test 1: Market order with positionSide
    {
      name: 'Market SELL SHORT (Hedge Mode)',
      params: {
        symbol: 'AIA-USDT',
        side: 'SELL' as const,
        positionSide: 'SHORT' as const,
        type: 'MARKET' as const,
        quantity: 2.27
      }
    },
    // Test 2: Same but with BTC
    {
      name: 'Market BUY LONG (Hedge Mode) - BTC',
      params: {
        symbol: 'BTC-USDT',
        side: 'BUY' as const,
        positionSide: 'LONG' as const,
        type: 'MARKET' as const,
        quantity: 0.001
      }
    },
  ];

  for (const test of testOrders) {
    console.log(`📝 Testing: ${test.name}`);
    console.log(`   Params: ${JSON.stringify(test.params, null, 2)}`);

    try {
      const result = await bingx.testOrder(test.params);
      console.log(`   ✅ VALID - BingX accepted the order`);
      console.log(`   Response:`, JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.log(`   ❌ INVALID - ${error.message}`);
    }
    console.log('');
  }
}

testBingXOrderValidation()
  .then(() => {
    console.log('\n✨ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
