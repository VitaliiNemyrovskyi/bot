/**
 * Test BITGET API endpoints directly to debug collection issue
 */

async function testBitgetAPI() {
  console.log('=== Testing BITGET Funding Rate API ===');

  try {
    const fundingResponse = await fetch('https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // @ts-ignore
      family: 4
    });

    console.log('Funding Rate API Status:', fundingResponse.status);

    if (!fundingResponse.ok) {
      console.error('Funding Rate API Error:', fundingResponse.statusText);
      return;
    }

    const fundingData = await fundingResponse.json();
    console.log('Funding Rate API Response Code:', fundingData.code);
    console.log('Funding Rate API Message:', fundingData.msg);
    console.log('Funding Rate Data Count:', fundingData.data?.length || 0);

    if (fundingData.data && fundingData.data.length > 0) {
      console.log('Sample Funding Data (first 3):');
      fundingData.data.slice(0, 3).forEach((item: any) => {
        console.log(`  ${item.symbol}: rate=${item.fundingRate}, time=${item.fundingTime}, interval=${item.fundingRateInterval}`);
      });
    }
  } catch (error: any) {
    console.error('Funding Rate API Exception:', error.message);
    console.error('Error stack:', error.stack);
  }

  console.log('\n=== Testing BITGET Ticker API ===');

  try {
    const tickerResponse = await fetch('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // @ts-ignore
      family: 4
    });

    console.log('Ticker API Status:', tickerResponse.status);

    if (!tickerResponse.ok) {
      console.error('Ticker API Error:', tickerResponse.statusText);
      return;
    }

    const tickerData = await tickerResponse.json();
    console.log('Ticker API Response Code:', tickerData.code);
    console.log('Ticker API Message:', tickerData.msg);
    console.log('Ticker Data Count:', tickerData.data?.length || 0);

    if (tickerData.data && tickerData.data.length > 0) {
      console.log('Sample Ticker Data (first 3):');
      tickerData.data.slice(0, 3).forEach((item: any) => {
        console.log(`  ${item.symbol}: lastPr=${item.lastPr}, indexPrice=${item.indexPrice}`);
      });
    }
  } catch (error: any) {
    console.error('Ticker API Exception:', error.message);
    console.error('Error stack:', error.stack);
  }

  console.log('\n=== Testing Combined Logic ===');

  try {
    const fundingResponse = await fetch('https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // @ts-ignore
      family: 4
    });

    const fundingData = await fundingResponse.json();

    if (fundingData.code !== '00000' || !fundingData.data) {
      console.error('Invalid funding data response');
      return;
    }

    // Fetch tickers
    const tickerResponse = await fetch('https://api.bitget.com/api/v2/mix/market/tickers?productType=USDT-FUTURES', {
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // @ts-ignore
      family: 4
    });

    const tickerData = await tickerResponse.json();

    // Build ticker map
    const tickerMap = new Map();
    if (tickerData.code === '00000' && tickerData.data) {
      for (const ticker of tickerData.data) {
        tickerMap.set(ticker.symbol, {
          markPrice: parseFloat(ticker.lastPr || '0') || undefined,
          indexPrice: parseFloat(ticker.indexPrice || '0') || undefined,
        });
      }
      console.log('Built ticker map with', tickerMap.size, 'entries');
    }

    // Process funding data (using nextUpdate instead of fundingTime)
    const processedData = fundingData.data
      .filter((item: any) => item.symbol.endsWith('USDT') && item.nextUpdate)
      .map((item: any) => {
        const symbol = item.symbol.slice(0, -4) + '/' + item.symbol.slice(-4);
        const priceData = tickerMap.get(item.symbol);

        return {
          symbol,
          fundingRate: parseFloat(item.fundingRate || '0'),
          nextFundingTime: new Date(parseInt(item.nextUpdate)),
          fundingInterval: parseInt(item.fundingRateInterval || '8'),
          markPrice: priceData?.markPrice,
          indexPrice: priceData?.indexPrice,
        };
      });

    console.log('Processed data count:', processedData.length);
    console.log('Sample processed data (first 3):');
    processedData.slice(0, 3).forEach((item: any) => {
      console.log(`  ${item.symbol}: rate=${item.fundingRate}, markPrice=${item.markPrice}, indexPrice=${item.indexPrice}`);
    });
  } catch (error: any) {
    console.error('Combined logic Exception:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testBitgetAPI().catch(console.error);
