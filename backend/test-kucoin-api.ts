/**
 * Test KuCoin API response to see actual field names
 */

async function testKuCoinAPI() {
  try {
    const url = 'https://api-futures.kucoin.com/api/v1/contracts/active';

    console.log(`Fetching from: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== '200000' || !data.data) {
      console.error('API error:', data);
      return;
    }

    // Find a symbol to inspect
    const symbol = data.data.find((c: any) => c.symbol === 'DASHUS' || c.symbol === 'SOONUSDTM');

    if (symbol) {
      console.log('\n=== Sample Contract Data ===');
      console.log(JSON.stringify(symbol, null, 2));

      console.log('\n=== Time Fields ===');
      console.log(`nextFundingRateTime: ${symbol.nextFundingRateTime}`);
      console.log(`nextFundingRateDateTime: ${symbol.nextFundingRateDateTime}`);

      if (symbol.nextFundingRateTime) {
        console.log(`\nnextFundingRateTime as Date: ${new Date(parseInt(symbol.nextFundingRateTime))}`);
      }

      if (symbol.nextFundingRateDateTime) {
        console.log(`nextFundingRateDateTime as Date: ${new Date(parseInt(symbol.nextFundingRateDateTime))}`);
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testKuCoinAPI();
