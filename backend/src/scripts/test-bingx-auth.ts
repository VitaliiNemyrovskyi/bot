import prisma from '../lib/prisma';
import { BingXService } from '../lib/bingx';

async function testBingXAuth() {
  try {
    // Get BingX credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BINGX',
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!credentials) {
      console.log('❌ No BingX credentials found');
      return;
    }

    console.log(`\n=== Testing BingX API Authentication ===`);
    console.log(`Using credentials: ${credentials.label || credentials.id}`);
    console.log(`API Key (first 10 chars): ${credentials.apiKey.substring(0, 10)}...`);
    console.log(`API Secret (first 10 chars): ${credentials.apiSecret.substring(0, 10)}...\n`);

    // Create BingX service
    const bingx = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId: credentials.userId,
      credentialId: credentials.id,
    });

    // Sync time first
    console.log('1️⃣  Syncing time with BingX server...');
    await bingx.syncTime();
    console.log('✅ Time synced successfully\n');

    // Test 1: Public endpoint (no auth needed)
    console.log('2️⃣  Testing PUBLIC endpoint (no authentication)...');
    try {
      const tickers = await bingx.getTickers();
      console.log(`✅ Public endpoint works! Got ${tickers.length} tickers\n`);
    } catch (error: any) {
      console.log(`❌ Public endpoint failed:`, error.message, '\n');
    }

    // Test 2: Get balance (requires auth)
    console.log('3️⃣  Testing AUTHENTICATED endpoint (get balance)...');
    try {
      const balance = await bingx.getBalance();
      console.log('✅ Authentication successful! Balance retrieved:');
      console.log(JSON.stringify(balance, null, 2), '\n');
    } catch (error: any) {
      console.log(`❌ Authentication failed:`, error.message, '\n');

      // Check if it's the specific API key error
      if (error.message.includes('Incorrect apiKey') || error.message.includes('100413')) {
        console.log('\n🔍 Diagnosis: API Key Authentication Error');
        console.log('This error means BingX rejected the API key. Possible causes:');
        console.log('  1. API key was regenerated/deleted on BingX platform');
        console.log('  2. API secret is incorrect or was regenerated');
        console.log('  3. IP address restrictions are enabled on the API key');
        console.log('  4. API key permissions are insufficient');
        console.log('\n💡 Solution:');
        console.log('  - Visit https://bingx.com/en/account/api');
        console.log('  - Verify the API key exists and matches the one in database');
        console.log('  - Check IP whitelist settings (if any)');
        console.log('  - Ensure API key has "Enable Reading" and "Enable Futures" permissions');
      }
    }

    // Test 3: Try to get position (another auth test)
    console.log('4️⃣  Testing AUTHENTICATED endpoint (get positions)...');
    try {
      const positions = await bingx.getPositions();
      console.log(`✅ Get positions successful! Found ${positions.length} positions\n`);
    } catch (error: any) {
      console.log(`❌ Get positions failed:`, error.message, '\n');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBingXAuth();
