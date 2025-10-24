import crypto from 'crypto';
import prisma from './src/lib/prisma';
import { EncryptionService } from './src/lib/encryption';

/**
 * Test BingX Spot API Authentication
 *
 * This script tests the BingX Spot API with your credentials
 * to diagnose authentication issues.
 */

async function testBingXSpotAuth() {
  console.log('\n=== BingX Spot API Authentication Test ===\n');

  // Get BingX credentials from database
  const credentials = await prisma.exchangeCredentials.findFirst({
    where: {
      exchange: 'BINGX',
      isActive: true
    }
  });

  if (!credentials) {
    console.error('❌ No active BingX credentials found in database');
    process.exit(1);
  }

  // Decrypt the API keys (they're stored encrypted)
  const apiKey = EncryptionService.decrypt(credentials.apiKey).trim();
  const apiSecret = EncryptionService.decrypt(credentials.apiSecret).trim();

  console.log('📋 Credentials Info:');
  console.log(`  API Key Length: ${apiKey.length}`);
  console.log(`  API Key Prefix: ${apiKey.substring(0, 10)}...`);
  console.log(`  API Secret Length: ${apiSecret.length}`);
  console.log(`  API Secret Prefix: ${apiSecret.substring(0, 10)}...`);
  console.log();

  // Test 1: Get server time (public endpoint - no auth needed)
  console.log('🔧 Test 1: Getting BingX server time...');
  try {
    const timeUrl = 'https://open-api.bingx.com/openApi/spot/v1/server/time';
    const timeResponse = await fetch(timeUrl);
    const timeData = await timeResponse.json();

    if (timeData.code === 0) {
      const serverTime = timeData.data?.serverTime || timeData.serverTime;
      console.log(`✅ Server time: ${serverTime}`);
      console.log(`   Local time: ${Date.now()}`);
      console.log(`   Difference: ${Math.abs(serverTime - Date.now())}ms`);
    } else {
      console.log(`❌ Failed to get server time: ${JSON.stringify(timeData)}`);
    }
  } catch (error: any) {
    console.error(`❌ Error getting server time: ${error.message}`);
  }
  console.log();

  // Test 2: Try to get tradable symbols (public endpoint)
  console.log('🔧 Test 2: Getting tradable symbols (public)...');
  try {
    const symbolsUrl = 'https://open-api.bingx.com/openApi/spot/v1/common/symbols';
    const symbolsResponse = await fetch(symbolsUrl);
    const symbolsData = await symbolsResponse.json();

    if (symbolsData.code === 0) {
      // BingX API returns status as number: 1 = trading, 0 = not trading
      const tradingSymbols = symbolsData.data.symbols.filter((s: any) => s.status === 1);
      console.log(`✅ Found ${tradingSymbols.length} trading symbols`);
      console.log(`   First 5: ${tradingSymbols.slice(0, 5).map((s: any) => s.symbol).join(', ')}`);
    } else {
      console.log(`❌ Failed to get symbols: ${JSON.stringify(symbolsData)}`);
    }
  } catch (error: any) {
    console.error(`❌ Error getting symbols: ${error.message}`);
  }
  console.log();

  // Test 3: Test authenticated endpoint - Account Balance
  console.log('🔧 Test 3: Testing authenticated endpoint (account balance)...');

  const timestamp = Date.now();
  const params: Record<string, any> = {
    timestamp
  };

  // Generate signature (insertion order, no URL encoding)
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  console.log('📝 Signature Details:');
  console.log(`  Query String: ${queryString}`);

  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');

  console.log(`  Signature (hex): ${signature}`);
  console.log();

  // Build URL with encoded parameters
  const urlParams = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const url = `https://open-api.bingx.com/openApi/spot/v1/account/balance?${urlParams}&signature=${signature}`;

  console.log('📤 Request Details:');
  console.log(`  URL: ${url.substring(0, 80)}...`);
  console.log(`  Method: GET`);
  console.log(`  Headers:`);
  console.log(`    X-BX-APIKEY: ${apiKey.substring(0, 10)}...`);
  console.log(`    Content-Type: application/json`);
  console.log();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('📥 Response:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Data: ${JSON.stringify(data, null, 2)}`);
    console.log();

    if (data.code === 0) {
      console.log('✅ Authentication successful!');
      console.log(`   Account balances: ${data.data?.balances?.length || 0} assets`);
    } else {
      console.log(`❌ Authentication failed!`);
      console.log(`   Error code: ${data.code}`);
      console.log(`   Error message: ${data.msg}`);

      // Try to provide helpful suggestions
      if (data.code === 100413) {
        console.log('\n💡 Suggestions:');
        console.log('   1. Check if API key has "Spot Trading" permission enabled');
        console.log('   2. Try creating a NEW API key specifically for spot trading');
        console.log('   3. Make sure the key is not restricted by IP whitelist');
        console.log('   4. Verify the key is not expired or disabled');
      }
    }
  } catch (error: any) {
    console.error(`❌ Request failed: ${error.message}`);
  }

  console.log('\n=== Test Complete ===\n');
  process.exit(0);
}

testBingXSpotAuth().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
