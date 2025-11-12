import { BingXService } from './src/lib/bingx';

/**
 * Test BingX API Authentication
 *
 * This script tests the BingX API connection with provided credentials
 */

async function testBingXAuth() {
  // console.log('🔐 Testing BingX API Authentication...\n');

  const apiKey = 'DndKRCWw28ZOm05S255P55mgYZGxhCfn9RE5Abdgpx7YZ1ZImnUztbzuxgAMJ3ncibb8ggIe9u6dxp4s4wuw';
  const apiSecret = 'uFPWpqgRGm1MKSZ7EXZVt0LncKyvLuvZBe8M7eRZVVXxrSkEcHyCsleoab8DCPQBg9M29pE55PJ00vqiVaaw';

  // Test with Testnet
  console.log('📡 Testing TESTNET connection...');
  const testnetService = new BingXService({
    apiKey,
    apiSecret,
    testnet: true,
    enableRateLimit: true,
  });

  try {
    // Test 1: Get Account Balance
    // console.log('\n1️⃣ Testing getBalance()...');
    const balance = await testnetService.getBalance();
    // console.log('✅ Balance retrieved successfully:');
    // console.log(JSON.stringify(balance, null, 2));

    // Test 2: Get Tickers
    // console.log('\n2️⃣ Testing getTickers()...');
    const tickers = await testnetService.getTickers();
    // console.log(`✅ Retrieved ${tickers.length} tickers`);
    if (tickers.length > 0) {
      // console.log('Sample ticker (BTC-USDT):');
      const btcTicker = tickers.find(t => t.symbol === 'BTC-USDT');
      if (btcTicker) {
        // console.log(JSON.stringify(btcTicker, null, 2));
      } else {
        // console.log(JSON.stringify(tickers[0], null, 2));
      }
    }

    // Test 3: Get Positions
    // console.log('\n3️⃣ Testing getPositions()...');
    const positions = await testnetService.getPositions();
    // console.log(`✅ Retrieved ${positions.length} positions`);
    if (positions.length > 0) {
      // console.log('Positions:');
      // console.log(JSON.stringify(positions, null, 2));
    } else {
      // console.log('No open positions');
    }

    // Test 4: Get Funding Rate
    // console.log('\n4️⃣ Testing getFundingRate() for BTC-USDT...');
    try {
      const fundingRate = await testnetService.getFundingRate('BTC-USDT');
      // console.log('✅ Funding rate retrieved:');
      // console.log(JSON.stringify(fundingRate, null, 2));
    } catch (err: unknown) {
      const error = err as Error;
      // console.log('ℹ️  Funding rate endpoint may not be available:', error.message);
    }

    // console.log('\n✅ All tests passed! BingX authentication is working correctly.');

  } catch (error: unknown) {
    const err = error as Error;
    // console.error('\n❌ Test failed:', err.message);
    if (err.stack) {
      // console.error('\nStack trace:', err.stack);
    }
  }

  // Test with Mainnet (optional - commented out for safety)
  // console.log('\n\n📡 Mainnet test skipped (uncomment to test with real funds)');
  /*
  console.log('\n📡 Testing MAINNET connection...');
  const mainnetService = new BingXService({
    apiKey,
    apiSecret,
    testnet: false,
    enableRateLimit: true,
  });

  try {
    const mainnetBalance = await mainnetService.getBalance();
    console.log('✅ Mainnet balance retrieved:');
    console.log(JSON.stringify(mainnetBalance, null, 2));
  } catch (error: any) {
    console.error('❌ Mainnet test failed:', error.message);
  }
  */
}

// Run the test
testBingXAuth()
  .then(() => {
    // console.log('\n🎉 Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    // console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
