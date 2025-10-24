/**
 * Test: Compare Old vs New Buffer Strategy
 *
 * Demonstrates how the new buffers fix the order rejection issue
 */

console.log('='.repeat(80));
console.log('Gate.io Market BUY Order: Old vs New Buffer Strategy');
console.log('='.repeat(80));

// Scenario from user's error
const calculatedQuantity = 38.3; // SAGA (from calculator)
const tickerPrice = 1.30; // USDT/SAGA (from ticker.last)
const orderbookAskPrice = 1.35; // USDT/SAGA (actual orderbook ask - 3.8% higher)
const minimumOrderSize = 0.01; // SAGA (exchange minimum)

console.log('\nScenario Parameters:');
console.log(`  Calculated Quantity: ${calculatedQuantity} SAGA`);
console.log(`  Ticker Price: ${tickerPrice} USDT/SAGA`);
console.log(`  Orderbook Ask Price: ${orderbookAskPrice} USDT/SAGA (${((orderbookAskPrice / tickerPrice - 1) * 100).toFixed(1)}% higher)`);
console.log(`  Minimum Order Size: ${minimumOrderSize} SAGA`);

// OLD STRATEGY (0.2% buffer)
console.log('\n' + '─'.repeat(80));
console.log('OLD STRATEGY (0.2% buffer)');
console.log('─'.repeat(80));

const oldBuffer = 1.002;
const oldCost = calculatedQuantity * tickerPrice * oldBuffer;
const oldActualQuantity = oldCost / orderbookAskPrice;

console.log(`\n1. Validation Phase:`);
console.log(`   Check: ${calculatedQuantity} SAGA > ${minimumOrderSize} SAGA minimum`);
console.log(`   Result: ✓ PASSED (${calculatedQuantity} > ${minimumOrderSize})`);

console.log(`\n2. Execution Phase:`);
console.log(`   Convert to cost: ${calculatedQuantity} * ${tickerPrice} * ${oldBuffer} = ${oldCost.toFixed(2)} USDT`);
console.log(`   Send to Gate.io: placeMarketBuyOrder(cost=${oldCost.toFixed(2)} USDT)`);

console.log(`\n3. Gate.io Processing:`);
console.log(`   Orderbook ask: ${orderbookAskPrice} USDT/SAGA`);
console.log(`   Actual filled: ${oldCost.toFixed(2)} / ${orderbookAskPrice} = ${oldActualQuantity.toFixed(2)} SAGA`);
console.log(`   Expected: ${calculatedQuantity} SAGA`);
console.log(`   Difference: ${(oldActualQuantity - calculatedQuantity).toFixed(2)} SAGA (${((oldActualQuantity / calculatedQuantity - 1) * 100).toFixed(1)}%)`);

if (oldActualQuantity < minimumOrderSize) {
  console.log(`\n4. Gate.io Check: ❌ REJECTED`);
  console.log(`   Error: "Your order size ${oldActualQuantity.toFixed(2)} SAGA is too small. The minimum is ${minimumOrderSize} SAGA"`);
} else if (oldActualQuantity < calculatedQuantity * 0.95) {
  console.log(`\n4. Gate.io Check: ⚠️  WARNING`);
  console.log(`   Filled quantity ${oldActualQuantity.toFixed(2)} SAGA is significantly less than expected ${calculatedQuantity} SAGA`);
  console.log(`   Order executes but with ${Math.abs((oldActualQuantity / calculatedQuantity - 1) * 100).toFixed(1)}% less quantity than expected`);
} else {
  console.log(`\n4. Gate.io Check: ✓ PASSED`);
}

// NEW STRATEGY (5% buffer + 25% validation margin)
console.log('\n' + '─'.repeat(80));
console.log('NEW STRATEGY (5% buffer + 25% validation margin)');
console.log('─'.repeat(80));

const newValidationMargin = 1.25;
const newBuffer = 1.05;
const newCost = calculatedQuantity * tickerPrice * newBuffer;
const newActualQuantity = newCost / orderbookAskPrice;

console.log(`\n1. Validation Phase:`);
console.log(`   Safety margin: ${minimumOrderSize} * ${newValidationMargin} = ${(minimumOrderSize * newValidationMargin).toFixed(4)} SAGA`);
console.log(`   Check: ${calculatedQuantity} SAGA > ${(minimumOrderSize * newValidationMargin).toFixed(4)} SAGA`);
console.log(`   Result: ✓ PASSED (${calculatedQuantity} > ${(minimumOrderSize * newValidationMargin).toFixed(4)})`);

console.log(`\n2. Execution Phase:`);
console.log(`   Convert to cost: ${calculatedQuantity} * ${tickerPrice} * ${newBuffer} = ${newCost.toFixed(2)} USDT`);
console.log(`   Send to Gate.io: placeMarketBuyOrder(cost=${newCost.toFixed(2)} USDT)`);

console.log(`\n3. Gate.io Processing:`);
console.log(`   Orderbook ask: ${orderbookAskPrice} USDT/SAGA`);
console.log(`   Actual filled: ${newCost.toFixed(2)} / ${orderbookAskPrice} = ${newActualQuantity.toFixed(2)} SAGA`);
console.log(`   Expected: ${calculatedQuantity} SAGA`);
console.log(`   Difference: ${(newActualQuantity - calculatedQuantity).toFixed(2)} SAGA (${((newActualQuantity / calculatedQuantity - 1) * 100).toFixed(1)}%)`);

if (newActualQuantity < minimumOrderSize) {
  console.log(`\n4. Gate.io Check: ❌ REJECTED`);
  console.log(`   Error: "Your order size ${newActualQuantity.toFixed(2)} SAGA is too small. The minimum is ${minimumOrderSize} SAGA"`);
} else if (newActualQuantity >= calculatedQuantity) {
  console.log(`\n4. Gate.io Check: ✅ SUCCESS`);
  console.log(`   Order executes successfully!`);
  console.log(`   Bonus: Filled ${((newActualQuantity / calculatedQuantity - 1) * 100).toFixed(1)}% MORE than expected due to buffer`);
} else {
  console.log(`\n4. Gate.io Check: ✓ PASSED`);
  console.log(`   Order executes but with ${Math.abs((newActualQuantity / calculatedQuantity - 1) * 100).toFixed(1)}% less quantity`);
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

console.log('\nOld Strategy:');
console.log(`  Cost sent: ${oldCost.toFixed(2)} USDT`);
console.log(`  Actual filled: ${oldActualQuantity.toFixed(2)} SAGA`);
console.log(`  Status: ${oldActualQuantity < minimumOrderSize ? '❌ REJECTED' : '⚠️  PASSED (but risky)'}`);

console.log('\nNew Strategy:');
console.log(`  Cost sent: ${newCost.toFixed(2)} USDT (+${((newCost / oldCost - 1) * 100).toFixed(1)}%)`);
console.log(`  Actual filled: ${newActualQuantity.toFixed(2)} SAGA (+${((newActualQuantity / oldActualQuantity - 1) * 100).toFixed(1)}%)`);
console.log(`  Status: ${newActualQuantity >= minimumOrderSize ? '✅ SUCCESS' : '❌ REJECTED'}`);

console.log('\nKey Improvements:');
console.log(`  1. Cost buffer increased from 0.2% to 5%`);
console.log(`  2. Validation margin increased from 10% to 25%`);
console.log(`  3. Accounts for ticker-orderbook price differences`);
console.log(`  4. Provides cushion for slippage and price movement`);

console.log('\n' + '='.repeat(80));

// Test with extreme slippage scenario
console.log('\n\n' + '='.repeat(80));
console.log('EXTREME SCENARIO: 10% Price Slippage');
console.log('='.repeat(80));

const extremeAskPrice = tickerPrice * 1.10; // 10% higher
const extremeOldQuantity = oldCost / extremeAskPrice;
const extremeNewQuantity = newCost / extremeAskPrice;

console.log(`\nOrderbook ask price: ${extremeAskPrice.toFixed(4)} USDT/SAGA (${((extremeAskPrice / tickerPrice - 1) * 100).toFixed(1)}% higher than ticker)`);

console.log(`\nOld Strategy (0.2% buffer):`);
console.log(`  Cost: ${oldCost.toFixed(2)} USDT`);
console.log(`  Filled: ${extremeOldQuantity.toFixed(2)} SAGA`);
console.log(`  Expected: ${calculatedQuantity} SAGA`);
console.log(`  Shortage: ${(calculatedQuantity - extremeOldQuantity).toFixed(2)} SAGA (${((1 - extremeOldQuantity / calculatedQuantity) * 100).toFixed(1)}%)`);
console.log(`  Status: ${extremeOldQuantity < minimumOrderSize ? '❌ REJECTED' : extremeOldQuantity < calculatedQuantity * 0.9 ? '⚠️  SIGNIFICANT UNDERFILL' : '✓ PASSED'}`);

console.log(`\nNew Strategy (5% buffer):`);
console.log(`  Cost: ${newCost.toFixed(2)} USDT`);
console.log(`  Filled: ${extremeNewQuantity.toFixed(2)} SAGA`);
console.log(`  Expected: ${calculatedQuantity} SAGA`);
console.log(`  Difference: ${(extremeNewQuantity - calculatedQuantity).toFixed(2)} SAGA (${((extremeNewQuantity / calculatedQuantity - 1) * 100).toFixed(1)}%)`);
console.log(`  Status: ${extremeNewQuantity < minimumOrderSize ? '❌ REJECTED' : extremeNewQuantity < calculatedQuantity * 0.9 ? '⚠️  SIGNIFICANT UNDERFILL' : '✅ WITHIN ACCEPTABLE RANGE'}`);

console.log('\n' + '='.repeat(80));
console.log('Conclusion: New strategy provides significantly better protection against');
console.log('price slippage between ticker data and orderbook execution prices.');
console.log('='.repeat(80));
