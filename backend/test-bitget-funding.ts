/**
 * Test script to check Bitget API for RIVERUSDT funding rate
 *
 * Usage: npx tsx test-bitget-funding.ts
 */

async function testBitgetFunding() {
  const bitgetUrl = 'https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES';

  console.log('Testing Bitget API...');
  console.log('URL:', bitgetUrl);
  console.log('');

  try {
    const response = await fetch(bitgetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      console.error('❌ Request failed:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('✓ Response received');
    console.log('Total symbols:', data?.data?.length || 0);
    console.log('');

    // Search for RIVER symbols
    const riverSymbols = data?.data?.filter((item: any) => {
      const symbol = item.symbol || '';
      return symbol.includes('RIVER');
    });

    console.log('RIVER-related symbols found:', riverSymbols?.length || 0);
    if (riverSymbols && riverSymbols.length > 0) {
      console.log('');
      riverSymbols.forEach((item: any) => {
        console.log('Symbol:', item.symbol);
        console.log('Full object:', JSON.stringify(item, null, 2));
        console.log('');
      });
    } else {
      console.log('❌ No RIVER symbols found in Bitget response');
      console.log('');

      // Show first 5 symbols as examples
      console.log('First 5 symbols in response:');
      data?.data?.slice(0, 5).forEach((item: any) => {
        console.log('  -', item.symbol);
      });
    }

    // Check exact match for RIVERUSDT variations
    const searchVariations = ['RIVERUSDT', 'RIVER-USDT', 'RIVER/USDT', 'RIVER_USDT'];
    console.log('');
    console.log('Checking exact matches for:', searchVariations.join(', '));

    searchVariations.forEach(searchSymbol => {
      const found = data?.data?.find((item: any) => {
        const symbol = item.symbol || '';
        return symbol === searchSymbol ||
               symbol.replace(/[-_/]/g, '') === searchSymbol.replace(/[-_/]/g, '');
      });

      if (found) {
        console.log(`✓ Found match for ${searchSymbol}:`, found.symbol);
        console.log('  fundingRate:', found.fundingRate);
        console.log('  nextFundingTime:', found.nextFundingTime);
        console.log('  fundingInterval:', found.fundingRateInterval);
      } else {
        console.log(`✗ No match for ${searchSymbol}`);
      }
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testBitgetFunding();
