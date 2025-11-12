/**
 * Test Gate.io symbol matching fix
 */

async function testGateioMatching() {
  console.log('=== Testing Gate.io Symbol Matching ===\n');

  const testCases = [
    { exchanges: 'GATEIO,BINGX', symbol: 'AIAUSDT' },
    { exchanges: 'GATEIO', symbol: 'BTC/USDT' },
    { exchanges: 'GATEIO', symbol: 'BTCUSDT' },
  ];

  for (const test of testCases) {
    console.log(`\n📊 Testing: ${test.symbol} on ${test.exchanges}...`);

    try {
      const url = `http://localhost:3000/api/arbitrage/public-funding-rates?exchanges=${test.exchanges}&symbol=${test.symbol}`;
      console.log(`URL: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      console.log(`Response status: ${response.status}`);
      console.log(`Success: ${data.success}`);
      console.log(`Data count: ${data.data?.length || 0}`);

      if (data.data && data.data.length > 0) {
        console.log(`\nResults:`);
        data.data.forEach((item: any) => {
          console.log(`  - ${item.exchange}: ${item.symbol}, Rate: ${item.fundingRate}, Interval: ${item.fundingInterval}`);
        });
      } else if (data.error) {
        console.log(`Error: ${data.error}`);
        console.log(`Message: ${data.message}`);
      }

    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

testGateioMatching();
