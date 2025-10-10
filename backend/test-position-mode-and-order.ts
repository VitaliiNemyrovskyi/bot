/**
 * Test BingX position mode and order placement
 * This script:
 * 1. Checks the account's position mode (One-Way vs Hedge)
 * 2. Tests order placement based on the mode
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

async function main() {
  console.log('=== BingX Position Mode and Order Test ===\n');

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

  // Check position mode
  console.log('=== Step 1: Check Position Mode ===');
  const timestamp = bingx.getSyncedTime();
  const params = new URLSearchParams({ timestamp: timestamp.toString() });

  // Generate signature
  const queryString = params.toString();
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');

  params.append('signature', signature);

  try {
    const response = await fetch(
      `https://open-api.bingx.com/openApi/swap/v2/user/getPositionMode?${params}`,
      {
        method: 'GET',
        headers: { 'X-BX-APIKEY': apiKey }
      }
    );

    const modeData = await response.json();
    console.log('Position Mode Response:', JSON.stringify(modeData, null, 2));

    if (modeData.code === 0 && modeData.data) {
      const positionMode = modeData.data.dualSidePosition ? 'Hedge Mode' : 'One-Way Mode';
      console.log(`\n📊 Account Position Mode: ${positionMode}`);
      console.log(`   dualSidePosition: ${modeData.data.dualSidePosition}\n`);

      // Test order based on mode
      console.log('=== Step 2: Test Order Placement ===\n');

      if (modeData.data.dualSidePosition) {
        // Hedge Mode - positionSide is REQUIRED
        console.log('Testing with positionSide=SHORT (Hedge Mode requires this)...\n');
        try {
          await bingx.testOrder({
            symbol: 'BTC-USDT',
            side: 'SELL',
            positionSide: 'SHORT',
            type: 'MARKET',
            quantity: 0.001
          });
          console.log('✅ Test order PASSED with positionSide\n');
        } catch (error: any) {
          console.log(`❌ Test order FAILED: ${error.message}\n`);
        }
      } else {
        // One-Way Mode - positionSide should NOT be used
        console.log('Testing WITHOUT positionSide (One-Way Mode)...\n');
        try {
          await bingx.testOrder({
            symbol: 'BTC-USDT',
            side: 'SELL',
            type: 'MARKET',
            quantity: 0.001
          });
          console.log('✅ Test order PASSED without positionSide\n');
        } catch (error: any) {
          console.log(`❌ Test order FAILED: ${error.message}\n`);
        }

        console.log('Also testing WITH positionSide (should fail in One-Way Mode)...\n');
        try {
          await bingx.testOrder({
            symbol: 'BTC-USDT',
            side: 'SELL',
            positionSide: 'SHORT',
            type: 'MARKET',
            quantity: 0.001
          });
          console.log('⚠️  Test order PASSED with positionSide (unexpected in One-Way Mode)\n');
        } catch (error: any) {
          console.log(`❌ Test order FAILED (expected in One-Way Mode): ${error.message}\n`);
        }
      }
    }
  } catch (error: any) {
    console.error('Error checking position mode:', error.message);
  }
}

main()
  .then(() => {
    console.log('\n✨ Test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
