/**
 * Debug Triangle Calculation
 *
 * This test helps us understand why the calculator returns null
 */

// Simulate the parseSymbol logic
function parseSymbol(symbol: string): [string, string] {
  const quoteAssets = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH', 'BNB', 'DAI', 'USD', 'USD1'];

  for (const quote of quoteAssets) {
    if (symbol.endsWith(quote)) {
      const base = symbol.slice(0, -quote.length);
      return [base, quote];
    }
  }

  // Fallback
  const base = symbol.slice(0, -4);
  const quote = symbol.slice(-4);
  return [base, quote];
}

// Test Case 1: USDT → USDC → FLOKI → USDT
console.log('=== Test Case 1: Parsing Symbols ===\n');

const symbols1 = ['USDCUSDT', 'FLOKIUSDC', 'FLOKIUSDT'];

for (const symbol of symbols1) {
  const [base, quote] = parseSymbol(symbol);
  console.log(`${symbol} → Base: ${base}, Quote: ${quote}`);
}

console.log('\nExpected Triangle: USDT → USDC → FLOKI → USDT');
console.log('Leg 1: USDT → USDC (need symbol with base=USDC, quote=USDT)');
console.log('       USDCUSDT has base=USDC, quote=USDT ✓');
console.log('       Trading USDT for USDC means: have quote (USDT), want base (USDC) → BUY');
console.log('\nLeg 2: USDC → FLOKI (need symbol with base=FLOKI, quote=USDC)');
console.log('       FLOKIUSDC has base=FLOKI, quote=USDC ✓');
console.log('       Trading USDC for FLOKI means: have quote (USDC), want base (FLOKI) → BUY');
console.log('\nLeg 3: FLOKI → USDT (need symbol with base=FLOKI, quote=USDT)');
console.log('       FLOKIUSDT has base=FLOKI, quote=USDT ✓');
console.log('       Trading FLOKI for USDT means: have base (FLOKI), want quote (USDT) → SELL');

// Simulate executeLeg logic
function findMatchingSymbol(
  fromAsset: string,
  toAsset: string,
  parsedSymbols: Array<{ symbol: string; price: number; base: string; quote: string }>
) {
  console.log(`\n→ Finding symbol for: ${fromAsset} → ${toAsset}`);

  const match = parsedSymbols.find(
    (s) =>
      (s.base === fromAsset && s.quote === toAsset) ||
      (s.base === toAsset && s.quote === fromAsset)
  );

  if (match) {
    console.log(`  ✓ Found: ${match.symbol} (base=${match.base}, quote=${match.quote})`);

    // Determine side
    if (fromAsset === match.quote && toAsset === match.base) {
      console.log(`  → Have ${fromAsset} (quote), want ${toAsset} (base) → BUY`);
    } else if (fromAsset === match.base && toAsset === match.quote) {
      console.log(`  → Have ${fromAsset} (base), want ${toAsset} (quote) → SELL`);
    }

    return match;
  } else {
    console.log(`  ✗ No matching symbol found`);
    return null;
  }
}

console.log('\n\n=== Simulating executeLeg Logic ===');

const parsedSymbols1 = [
  { symbol: 'USDCUSDT', price: 1.0001, ...{ base: 'USDC', quote: 'USDT' } },
  { symbol: 'FLOKIUSDC', price: 0.00013, ...{ base: 'FLOKI', quote: 'USDC' } },
  { symbol: 'FLOKIUSDT', price: 0.000130013, ...{ base: 'FLOKI', quote: 'USDT' } },
];

// Forward: USDT → USDC → FLOKI → USDT
console.log('\n--- Forward Direction ---');
findMatchingSymbol('USDT', 'USDC', parsedSymbols1);
findMatchingSymbol('USDC', 'FLOKI', parsedSymbols1);
findMatchingSymbol('FLOKI', 'USDT', parsedSymbols1);

// Backward: USDT → FLOKI → USDC → USDT
console.log('\n--- Backward Direction ---');
findMatchingSymbol('USDT', 'FLOKI', parsedSymbols1);
findMatchingSymbol('FLOKI', 'USDC', parsedSymbols1);
findMatchingSymbol('USDC', 'USDT', parsedSymbols1);

// Calculate actual quantities
console.log('\n\n=== Calculating Quantities (Forward) ===');
console.log('Starting amount: 50 USDT');
console.log('Fee rate: 0.2%\n');

let amount = 50;
const feeRate = 0.002;

// Leg 1: USDT → USDC (BUY USDC with USDT)
// Price = 1.0001 (1 USDC costs 1.0001 USDT)
// To buy USDC with USDT, we divide by price
let output1 = amount / 1.0001;
let fee1 = output1 * feeRate;
output1 = output1 - fee1;
console.log(`Leg 1: USDT → USDC`);
console.log(`  Input: ${amount.toFixed(8)} USDT`);
console.log(`  Price: 1.0001 (USDC/USDT)`);
console.log(`  Operation: ${amount} / 1.0001 = ${(amount / 1.0001).toFixed(8)}`);
console.log(`  Fee: ${fee1.toFixed(8)} USDC`);
console.log(`  Output: ${output1.toFixed(8)} USDC`);

// Leg 2: USDC → FLOKI (BUY FLOKI with USDC)
// Price = 0.00013 (1 FLOKI costs 0.00013 USDC)
amount = output1;
let output2 = amount / 0.00013;
let fee2 = output2 * feeRate;
output2 = output2 - fee2;
console.log(`\nLeg 2: USDC → FLOKI`);
console.log(`  Input: ${amount.toFixed(8)} USDC`);
console.log(`  Price: 0.00013 (FLOKI/USDC)`);
console.log(`  Operation: ${amount.toFixed(8)} / 0.00013 = ${(amount / 0.00013).toFixed(8)}`);
console.log(`  Fee: ${fee2.toFixed(8)} FLOKI`);
console.log(`  Output: ${output2.toFixed(8)} FLOKI`);

// Leg 3: FLOKI → USDT (SELL FLOKI for USDT)
// Price = 0.000130013 (1 FLOKI = 0.000130013 USDT)
amount = output2;
let output3 = amount * 0.000130013;
let fee3 = output3 * feeRate;
output3 = output3 - fee3;
console.log(`\nLeg 3: FLOKI → USDT`);
console.log(`  Input: ${amount.toFixed(8)} FLOKI`);
console.log(`  Price: 0.000130013 (FLOKI/USDT)`);
console.log(`  Operation: ${amount.toFixed(8)} * 0.000130013 = ${(amount * 0.000130013).toFixed(8)}`);
console.log(`  Fee: ${fee3.toFixed(8)} USDT`);
console.log(`  Output: ${output3.toFixed(8)} USDT`);

console.log(`\n\nFinal: Started with 50 USDT, ended with ${output3.toFixed(8)} USDT`);
console.log(`Profit: ${(output3 - 50).toFixed(8)} USDT (${((output3 - 50) / 50 * 100).toFixed(4)}%)`);
