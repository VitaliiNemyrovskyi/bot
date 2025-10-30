/**
 * This script tests BingX API calls through the running backend API
 * to see if the connector that's already in use works
 */

async function testBingXViaAPI() {
  try {
    console.log('\n=== Testing BingX via Backend API ===\n');

    // Test 1: Get symbol info (uses the connector)
    console.log('1️⃣  Testing symbol-info endpoint...');
    const symbolInfoResponse = await fetch('http://localhost:3000/api/exchange/symbol-info?exchange=BINGX&symbol=ENSOUSDT');
    const symbolInfo = await symbolInfoResponse.json();

    if (symbolInfoResponse.ok) {
      console.log('✅ symbol-info works!');
      console.log('Symbol:', symbolInfo.symbol);
      console.log('Price:', symbolInfo.lastPrice, '\n');
    } else {
      console.log('❌ symbol-info failed:', symbolInfo, '\n');
    }

    // Test 2: Try to get positions through the connector
    console.log('2️⃣  Testing if we can create an order (dry run)...');
    console.log('(This will test if the connector can authenticate)\n');

    // We won't actually create an order, but we can check other authenticated endpoints
    console.log('Note: We cannot easily test authenticated endpoints without full auth flow\n');

    console.log('3️⃣  Let\'s check what the graduated entry service used...');
    console.log('When opening the position, the system used:');
    console.log('  - createOrder() to open positions');
    console.log('  - getPositions() to check status');
    console.log('  - getBalance() possibly');
    console.log('\nBut funding tracker uses:');
    console.log('  - getIncomeHistory() with incomeType=FUNDING_FEE');
    console.log('\nThese might require DIFFERENT API permissions!\n');

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testBingXViaAPI();
