/**
 * Test triangle normalization
 */
import { TriangleDiscovery } from './src/lib/triangle-discovery';
import { TriangularArbitrageCalculator } from './src/lib/triangular-arbitrage-calculator';

const symbols = ['FLOKIUSDC', 'FLOKIUSDT', 'USDCUSDT'];

console.log('=== Step 1: Discover triangles ===\n');
const discovered = TriangleDiscovery.discoverTriangles(symbols);
console.log('Discovered triangles:');
discovered.forEach((t, i) => {
  console.log(`  ${i + 1}. [${t.symbols.join(', ')}]`);
  console.log(`     base=${t.assets.base}, quote=${t.assets.quote}, bridge=${t.assets.bridge}`);
});

console.log('\n=== Step 2: Normalize to USDT base ===\n');
const normalized = TriangleDiscovery.filterAndNormalizeByBaseAsset(discovered, 'USDT');
console.log('Normalized triangles:');
normalized.forEach((t, i) => {
  console.log(`  ${i + 1}. [${t.symbols.join(', ')}]`);
  console.log(`     base=${t.assets.base}, quote=${t.assets.quote}, bridge=${t.assets.bridge}`);
});

if (normalized.length > 0) {
  console.log('\n=== Step 3: Test profit calculation with normalized triangle ===\n');

  const triangle = normalized[0];
  console.log('Testing with triangle:', triangle.symbols.join(' -> '));
  console.log('Assets:', triangle.assets);

  // Real prices from Binance
  const prices = {
    symbol1: triangle.symbols[0],
    symbol2: triangle.symbols[1],
    symbol3: triangle.symbols[2],
    price1: triangle.symbols[0] === 'USDCUSDT' ? 0.9994 : (triangle.symbols[0] === 'FLOKIUSDC' ? 0.00007823 : 0.0000782),
    price2: triangle.symbols[1] === 'USDCUSDT' ? 0.9994 : (triangle.symbols[1] === 'FLOKIUSDC' ? 0.00007823 : 0.0000782),
    price3: triangle.symbols[2] === 'USDCUSDT' ? 0.9994 : (triangle.symbols[2] === 'FLOKIUSDC' ? 0.00007823 : 0.0000782),
  };

  console.log('\nPrices:');
  console.log(`  ${prices.symbol1}: ${prices.price1}`);
  console.log(`  ${prices.symbol2}: ${prices.price2}`);
  console.log(`  ${prices.symbol3}: ${prices.price3}`);

  const config = {
    baseAsset: triangle.assets.base,
    quoteAsset: triangle.assets.quote,
    bridgeAsset: triangle.assets.bridge,
    makerFeeRate: 0.0001,
    takerFeeRate: 0.0006,
  };

  const result = TriangularArbitrageCalculator.calculateOptimalProfit(100, prices, config);

  if (result) {
    console.log('\nResult:');
    console.log(`  Direction: ${result.direction}`);
    console.log(`  Profit: ${result.profitPercent.toFixed(4)}%`);
    console.log(`  Final amount: $${result.finalAmount.toFixed(2)}`);
    console.log('\n  Trade legs:');
    result.legs.forEach((leg) => {
      console.log(`    Leg ${leg.leg}: ${leg.side} ${leg.symbol}`);
      console.log(`      Input: ${leg.inputAmount.toFixed(8)}`);
      console.log(`      Output: ${leg.outputAmount.toFixed(8)}`);
    });

    // Check if profit is reasonable (< 10%)
    if (result.profitPercent < 10) {
      console.log('\n✅ SUCCESS! Profit calculation looks correct (< 10%)');
    } else {
      console.log('\n❌ FAILED! Profit still too high:', result.profitPercent.toFixed(2), '%');
    }
  }
}
