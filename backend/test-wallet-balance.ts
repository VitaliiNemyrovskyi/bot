/**
 * Diagnostic script to test Bybit wallet balance API call
 * This script will help identify issues with authentication and API requests
 */

import { BybitService } from './src/lib/bybit';
import { BybitDiagnostics } from './src/lib/bybit-diagnostics';
import { RestClientV5 } from 'bybit-api';

// Enable HTTP trace for debugging (optional - uncomment for detailed logs)
// process.env.BYBITTRACE = '1';

async function testWalletBalance() {
  // console.log('\n=== Bybit Wallet Balance Diagnostic Test ===\n');

  // Test API credentials (replace with actual test credentials)
  const apiKey = process.env.BYBIT_TEST_API_KEY || process.env.BYBIT_API_KEY || 'YOUR_TEST_API_KEY';
  const apiSecret = process.env.BYBIT_TEST_API_SECRET || process.env.BYBIT_API_SECRET || 'YOUR_TEST_API_SECRET';
  const testnet = process.env.BYBIT_TESTNET === 'false' ? false : true; // Default to testnet for safety

  if (!apiKey || apiKey === 'YOUR_TEST_API_KEY') {
    // console.error('ERROR: Please set BYBIT_TEST_API_KEY environment variable');
    // console.log('\nUsage:');
    // console.log('  BYBIT_TEST_API_KEY=xxx BYBIT_TEST_API_SECRET=xxx npm run test-wallet');
    // console.log('\nOr set in .env file:');
    // console.log('  BYBIT_TEST_API_KEY=xxx');
    // console.log('  BYBIT_TEST_API_SECRET=xxx');
    // console.log('  BYBIT_TESTNET=true  # optional, defaults to true');
    process.exit(1);
  }

  // console.log('Configuration:');
  // console.log('- API Key:', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
  // console.log('- Testnet:', testnet);
  // console.log('- Base URL:', testnet ? 'https://api-testnet.bybit.com' : 'https://api.bybit.com');
  //
  // // Run comprehensive diagnostics first
  // console.log('\n═══════════════════════════════════════════════════════');
  // console.log('    Running Comprehensive Diagnostics');
  // console.log('═══════════════════════════════════════════════════════\n');

  try {
    const diagnosticResults = await BybitDiagnostics.runFullDiagnostics(
      apiKey,
      apiSecret,
      testnet
    );

    const report = BybitDiagnostics.formatDiagnosticReport(diagnosticResults);
    // console.log(report);

    // If diagnostics passed, continue with detailed tests
    const allPassed = diagnosticResults.every((r) => r.success);
    if (!allPassed) {
      // console.log('\n⚠ Some diagnostic tests failed. Review the report above for details.\n');
      // console.log('Continuing with detailed tests...\n');
    }
  } catch (error: any) {
    // console.error('Failed to run diagnostics:', error.message);
  }

  // console.log('\n--- Test 1: Direct SDK Call ---\n');

  try {
    const restClient = new RestClientV5({
      key: apiKey,
      secret: apiSecret,
      testnet: testnet,
      enableRateLimit: true,
    });

    // console.log('Making wallet balance request...');
    const response = await restClient.getWalletBalance({ accountType: 'UNIFIED' });

    // console.log('\n✓ Success!');
    // console.log('Response Code:', response.retCode);
    // console.log('Response Message:', response.retMsg);
    // console.log('Response Data:', JSON.stringify(response.result, null, 2));

    if (response.result?.list?.[0]) {
      const balance = response.result.list[0];
      // console.log('\nWallet Summary:');
      // console.log('- Account Type:', balance.accountType);
      // console.log('- Total Equity:', balance.totalEquity);
      // console.log('- Total Wallet Balance:', balance.totalWalletBalance);
      // console.log('- Total Available Balance:', balance.totalAvailableBalance);
      // console.log('- Number of Coins:', balance.coin?.length || 0);

      if (balance.coin && balance.coin.length > 0) {
        // console.log('\nCoins with Balance:');
        balance.coin.forEach((coin: any) => {
          if (parseFloat(coin.walletBalance) > 0) {
            // console.log(`  - ${coin.coin}: ${coin.walletBalance} (USD Value: ${coin.usdValue})`);
          }
        });
      }
    }
  } catch (error: any) {
    // console.error('\n✗ Failed!');
    // console.error('Error:', error.message);
    if (error.response) {
      // console.error('Response Status:', error.response.status);
      // console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.retCode !== undefined) {
      // console.error('Bybit Error Code:', error.retCode);
      // console.error('Bybit Error Message:', error.retMsg);
    }
  }

  // console.log('\n--- Test 2: BybitService Wrapper ---\n');

  try {
    const bybitService = new BybitService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
    });

    // console.log('Making wallet balance request via BybitService...');
    const balance = await bybitService.getWalletBalance('UNIFIED');

    // console.log('\n✓ Success!');
    // console.log('Response:', JSON.stringify(balance, null, 2));

  } catch (error: any) {
    // console.error('\n✗ Failed!');
    // console.error('Error:', error.message);
    if (error.response) {
      // console.error('Response Status:', error.response.status);
      // console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }

  // console.log('\n--- Test 3: API Key Info (Verify Credentials) ---\n');

  try {
    const bybitService = new BybitService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
    });

    // console.log('Fetching API key info...');
    const keyInfo = await bybitService.getApiKeyInfo();

    // console.log('\n✓ Success!');
    // console.log('API Key Info:');
    // console.log('- API Key ID:', keyInfo.id);
    // console.log('- Note:', keyInfo.note);
    // console.log('- Read Only:', keyInfo.readOnly);
    // console.log('- Type:', keyInfo.type === 1 ? 'Personal' : 'Third-party app');
    // console.log('- Unified Account:', keyInfo.unified);
    // console.log('- VIP Level:', keyInfo.vipLevel);
    // console.log('- Expires At:', new Date(parseInt(keyInfo.expiredAt)).toISOString());
    //
    // console.log('\nPermissions:');
    Object.entries(keyInfo.permissions).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        console.log(`  - ${key}:`, value.join(', '));
      }
    });

  } catch (error: any) {
    // console.error('\n✗ Failed!');
    // console.error('Error:', error.message);
    if (error.retCode !== undefined) {
      // console.error('Bybit Error Code:', error.retCode);
      // console.error('Bybit Error Message:', error.retMsg);

      // Common error codes
      if (error.retCode === 10003) {
        // console.error('\n⚠ Invalid API key or signature!');
        // console.error('Please verify:');
        // console.error('1. API key and secret are correct');
        // console.error('2. API key is for testnet (not mainnet)');
        // console.error('3. System time is synchronized (NTP)');
      } else if (error.retCode === 10004) {
        // console.error('\n⚠ Signature error!');
        // console.error('Please verify:');
        // console.error('1. API secret is correct');
        // console.error('2. No whitespace in API key/secret');
        // console.error('3. System time is synchronized');
      } else if (error.retCode === 33004) {
        // console.error('\n⚠ API key does not have required permissions!');
        // console.error('Please enable "Read" permission for the API key in Bybit settings.');
      }
    }
  }

  // console.log('\n=== End of Diagnostic Test ===\n');
}

// Run the test
testWalletBalance().catch(console.error);
