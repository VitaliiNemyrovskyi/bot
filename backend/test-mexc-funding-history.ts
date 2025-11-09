/**
 * Test MEXC funding rate history API to verify collectCycle field
 */

async function testMEXCFundingHistory() {
  console.log('=== Testing MEXC Funding Rate History API ===\n');

  // Test symbols: some that work with funding_rate endpoint, some that don't
  const symbols = ['BTC_USDT', 'ETH_USDT', 'FET_USDT', 'SUI_USDT', 'MMT_USDT'];

  for (const symbol of symbols) {
    console.log(`\n📊 Testing ${symbol}...`);

    // Test 1: Regular funding_rate endpoint
    try {
      const url1 = `https://contract.mexc.com/api/v1/contract/funding_rate/${symbol}`;
      console.log(`  Regular endpoint: ${url1}`);
      const response1 = await fetch(url1);
      const data1 = await response1.json();

      if (data1.success && data1.code === 0) {
        console.log(`  ✅ Success - collectCycle: ${data1.data.collectCycle}`);
      } else {
        console.log(`  ❌ Failed - code: ${data1.code}, msg: ${data1.msg}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }

    // Test 2: Funding rate history endpoint
    try {
      const url2 = `https://contract.mexc.com/api/v1/contract/funding_rate/history?symbol=${symbol}&page_size=1`;
      console.log(`  History endpoint: ${url2}`);
      const response2 = await fetch(url2);
      const data2 = await response2.json();

      if (data2.success && data2.code === 0 && data2.data?.resultList?.length > 0) {
        const historyData = data2.data.resultList[0];
        console.log(`  ✅ Success - collectCycle: ${historyData.collectCycle}`);
        console.log(`     fundingRate: ${historyData.fundingRate}, settleTime: ${new Date(historyData.settleTime).toISOString()}`);
      } else {
        console.log(`  ❌ Failed - code: ${data2.code}, results: ${data2.data?.resultList?.length || 0}`);
      }
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}`);
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

testMEXCFundingHistory();
