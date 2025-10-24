/**
 * Test with Clearly Profitable Triangle
 *
 * Use larger inefficiency to test calculator
 */

import { TriangularArbitrageCalculator } from './src/lib/triangular-arbitrage-calculator';

// Create a 2% inefficiency (enough to overcome 0.6% total fees)
console.log('=== Testing Calculator with 2% Market Inefficiency ===\n');

const profitablePrices = {
  symbol1: 'BTCUSDT',   // BTC/USDT
  symbol2: 'ETHBTC',    // ETH/BTC
  symbol3: 'ETHUSDT',   // ETH/USDT
  price1: 60000,        // 1 BTC = 60000 USDT
  price2: 0.04,         // 1 ETH = 0.04 BTC
  price3: 2450,         // 1 ETH = 2450 USDT (2% inefficiency: should be 2400)
};

const config = {
  baseAsset: 'USDT',
  quoteAsset: 'BTC',
  bridgeAsset: 'ETH',
  makerFeeRate: 0.0001,
  takerFeeRate: 0.002, // 0.2% per leg = 0.6% total
};

console.log('Market Prices:');
console.log(`  BTC/USDT = ${profitablePrices.price1}`);
console.log(`  ETH/BTC = ${profitablePrices.price2}`);
console.log(`  ETH/USDT = ${profitablePrices.price3}`);
console.log('');
console.log('Market Inefficiency:');
console.log(`  Expected ETH/USDT: ${profitablePrices.price1 * profitablePrices.price2} USDT`);
console.log(`  Actual ETH/USDT: ${profitablePrices.price3} USDT`);
console.log(`  Inefficiency: ${((profitablePrices.price3 / (profitablePrices.price1 * profitablePrices.price2) - 1) * 100).toFixed(2)}%`);
console.log('');

const result = TriangularArbitrageCalculator.calculateOptimalProfit(
  1000,
  profitablePrices,
  config
);

if (result) {
  console.log(`✅ CALCULATOR WORKING! Profitable opportunity found:`);
  console.log(`   Direction: ${result.direction}`);
  console.log(`   Profit: ${result.profitAmount.toFixed(2)} USDT (${result.profitPercent.toFixed(4)}%)`);
  console.log('');

  for (let i = 0; i < result.legs.length; i++) {
    const leg = result.legs[i];
    console.log(`   Leg ${i + 1}: ${leg.side} ${leg.symbol}`);
    console.log(`     Input: ${leg.inputAmount.toFixed(8)}`);
    console.log(`     Output: ${leg.outputAmount.toFixed(8)}`);
    console.log(`     Fee: ${leg.fee.toFixed(8)}`);
  }
} else {
  console.log(`❌ CALCULATOR ISSUE: Should have found profitable opportunity`);
}

console.log('\n' + '='.repeat(70));

// Now let's understand the real problem from the user's errors
console.log('\n=== Understanding the Real Problem ===\n');

console.log('Looking at the user error:');
console.log('  "Your order size 0.00 SAGA is too small. The minimum is 0.01 SAGA"');
console.log('');
console.log('This error comes from Gate.io API, not from our validation.');
console.log('');
console.log('The issue:');
console.log('  1. Our calculator says: "Buy 38.3 SAGA with 49.9 USDC"');
console.log('  2. Our validation checks: "38.3 SAGA > 0.01 minimum ✓"');
console.log('  3. We pass 38.3 to placeMarketOrder()');
console.log('  4. For Gate.io market BUY, we need to convert to COST');
console.log('  5. Gate.io receives the cost and places the order');
console.log('  6. But Gate.io calculates a different quantity than we expected');
console.log('');
console.log('Why Gate.io calculates differently:');
console.log('  - We use the last traded price (ticker.last)');
console.log('  - Gate.io uses the current orderbook (best ask for buy)');
console.log('  - If the ask price is higher, the actual quantity will be lower');
console.log('  - This can cause the order to fail minimum size checks');
console.log('');
console.log('Example:');
console.log('  Our calculation: cost = 38.3 SAGA * 1.30 USDT/SAGA = 49.79 USDT');
console.log('  We send: placeMarketOrder("SAGAUSDT", "Buy", 49.79 USDT)');
console.log('  Gate.io asks: 1.35 USDT/SAGA (slippage!)');
console.log('  Gate.io calculates: 49.79 / 1.35 = 36.88 SAGA');
console.log('  But wait! We\'re sending quantity=38.3 to placeMarketOrder');
console.log('  Then converting: cost = 38.3 * 1.30 * 1.002 = 49.89 USDT');
console.log('  Gate.io uses this cost with current ask price');
console.log('');
console.log('🔍 THE REAL ISSUE:');
console.log('  For Gate.io market BUY orders, we pass the BASE quantity (SAGA)');
console.log('  Then convert it to COST (USDT) in the connector');
console.log('  But Gate.io interprets this cost with CURRENT orderbook prices');
console.log('  Which can differ from the price we used in our calculations');
console.log('');
console.log('Solution Options:');
console.log('  1. Increase the buffer when converting to cost (currently 1.002)');
console.log('  2. Fetch current orderbook and use best ask price for calculations');
console.log('  3. Add a larger safety margin in validation (e.g., 20% instead of 10%)');
console.log('  4. Use limit orders instead of market orders for better control');
console.log('');
console.log('Most practical solution: Increase validation safety margin to 25-30%');
console.log('This ensures that even with slippage, the final quantity exceeds minimums.');
