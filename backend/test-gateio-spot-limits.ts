/**
 * Test Gate.io SPOT Symbol Limits
 *
 * Verify that the symbol-info API returns correct minimums for SPOT markets
 */

async function testGateIOSpotLimits() {
  console.log('='.repeat(70));
  console.log('Testing Gate.io SPOT Symbol Limits API');
  console.log('='.repeat(70));
  console.log('');

  // Test symbols that commonly appear in triangular arbitrage
  const testSymbols = [
    'BTC/USDT',
    'BTCUSDT',
    'ETH/USDT',
    'ETHUSDT',
    'USDC/USDT',
    'USDCUSDT',
  ];

  for (const symbol of testSymbols) {
    console.log(`\nTesting: ${symbol}`);
    console.log('-'.repeat(70));

    try {
      const url = new URL('http://localhost:3000/api/exchange/symbol-info');
      url.searchParams.set('exchange', 'GATEIO');
      url.searchParams.set('symbol', symbol);

      console.log(`Fetching: ${url.toString()}`);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!data.success) {
        console.log(`❌ Failed: ${data.error}`);
        continue;
      }

      const info = data.data;

      console.log(`✅ Success!`);
      console.log(`   Symbol: ${info.symbol}`);
      console.log(`   Exchange: ${info.exchange}`);
      console.log(`   Min Order Qty: ${info.minOrderQty} (base asset)`);
      console.log(`   Min Order Value: ${info.minOrderValue || 'N/A'} (quote asset)`);
      console.log(`   Qty Precision: ${info.qtyPrecision} decimals`);
      console.log(`   Price Precision: ${info.pricePrecision} decimals`);

      // Validate the minimum is reasonable
      if (symbol.includes('BTC') && !symbol.startsWith('BTC')) {
        // For BTC as quote, min should be small (e.g., 0.0001 BTC)
        if (info.minOrderQty >= 1) {
          console.log(`   ⚠️  WARNING: Min order ${info.minOrderQty} BTC seems too high!`);
          console.log(`       Expected: < 0.001 BTC`);
        } else {
          console.log(`   ✓ Minimum looks reasonable`);
        }
      } else if (symbol.includes('USDT')) {
        // For USDT pairs, min should be reasonable
        if (info.minOrderValue && info.minOrderValue > 100) {
          console.log(`   ⚠️  WARNING: Min value ${info.minOrderValue} USDT seems high`);
        } else {
          console.log(`   ✓ Minimum looks reasonable`);
        }
      }

    } catch (error: any) {
      console.log(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('Test Complete');
  console.log('='.repeat(70));
  console.log('');
  console.log('Expected behavior:');
  console.log('  - BTC/USDT min should be ~0.0001 BTC (not 1 BTC!)');
  console.log('  - ETH/USDT min should be ~0.001 ETH');
  console.log('  - USDC/USDT min should be ~1 USDC');
  console.log('');
  console.log('If you see "1 BTC" minimum, the API is using FUTURES instead of SPOT');
}

testGateIOSpotLimits();
