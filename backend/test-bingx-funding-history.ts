/**
 * Test BingX funding rate history API response
 */

async function testBingXFundingHistory() {
  const symbols = ['FLOW-USDT', 'OP-USDT', 'ANKR-USDT', 'BTC-USDT'];

  console.log('=== Testing BingX Funding Rate History API ===\n');

  for (const symbol of symbols) {
    console.log(`\n📊 Testing ${symbol}...`);

    try {
      const url = `https://open-api.bingx.com/openApi/swap/v2/quote/fundingRate?symbol=${symbol}`;
      console.log(`URL: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      console.log(`Response code: ${data.code}`);
      console.log(`Response msg: ${data.msg || 'N/A'}`);
      console.log(`Data array length: ${data.data?.length || 0}`);

      if (data.data && data.data.length > 0) {
        console.log(`\nFirst ${Math.min(5, data.data.length)} records:`);
        data.data.slice(0, 5).forEach((record: any, i: number) => {
          const fundingTime = new Date(record.fundingTime).toISOString();
          console.log(`  ${i + 1}. Time: ${fundingTime}, Rate: ${record.fundingRate}`);
        });
      }

      // Calculate intervals if we have data
      if (data.data && data.data.length >= 2) {
        console.log(`\nInterval analysis:`);
        for (let i = 0; i < Math.min(3, data.data.length - 1); i++) {
          const timeDiff = Math.abs(data.data[i].fundingTime - data.data[i + 1].fundingTime);
          const hours = timeDiff / (1000 * 60 * 60);
          console.log(`  Record ${i} to ${i+1}: ${hours.toFixed(2)} hours`);
        }
      }

    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

testBingXFundingHistory();
