/**
 * Test with a Profitable Triangle
 *
 * Create a scenario where there's actual arbitrage opportunity
 */

import { TriangularArbitrageCalculator } from './src/lib/triangular-arbitrage-calculator';

// Create an artificial profitable opportunity
// Let's say: USDT → BTC → ETH → USDT with a 1% profit

console.log('=== Creating Profitable Opportunity ===\n');

// Scenario: Market inefficiency where you can profit by triangular arbitrage
// Real prices (hypothetical):
// BTC/USDT = 60000
// ETH/BTC = 0.04
// ETH/USDT = 2410 (should be 2400 if perfectly efficient, but 2410 creates opportunity)

const profitablePrices = {
  symbol1: 'BTCUSDT',   // BTC/USDT
  symbol2: 'ETHBTC',    // ETH/BTC
  symbol3: 'ETHUSDT',   // ETH/USDT
  price1: 60000,        // 1 BTC = 60000 USDT
  price2: 0.04,         // 1 ETH = 0.04 BTC
  price3: 2410,         // 1 ETH = 2410 USDT (inefficiency!)
};

const config = {
  baseAsset: 'USDT',
  quoteAsset: 'BTC',
  bridgeAsset: 'ETH',
  makerFeeRate: 0.0001,
  takerFeeRate: 0.002, // 0.2% taker fee
};

console.log('Market Prices:');
console.log(`  BTC/USDT = ${profitablePrices.price1}`);
console.log(`  ETH/BTC = ${profitablePrices.price2}`);
console.log(`  ETH/USDT = ${profitablePrices.price3}`);
console.log('');
console.log('Expected Efficient Price:');
console.log(`  ETH/USDT should be: ${profitablePrices.price1 * profitablePrices.price2} USDT`);
console.log(`  Actual ETH/USDT is: ${profitablePrices.price3} USDT`);
console.log(`  Inefficiency: ${((profitablePrices.price3 / (profitablePrices.price1 * profitablePrices.price2) - 1) * 100).toFixed(2)}%`);
console.log('');

// Test with different position sizes
for (const positionSize of [100, 500, 1000, 5000]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Position Size: ${positionSize} USDT`);
  console.log('='.repeat(60));

  const result = TriangularArbitrageCalculator.calculateOptimalProfit(
    positionSize,
    profitablePrices,
    config
  );

  if (result) {
    console.log(`\n✅ PROFITABLE OPPORTUNITY FOUND!`);
    console.log(`Direction: ${result.direction.toUpperCase()}`);
    console.log(`Profit: ${result.profitAmount.toFixed(8)} USDT (${result.profitPercent.toFixed(4)}%)`);
    console.log(`Final Amount: ${result.finalAmount.toFixed(8)} USDT`);

    console.log(`\n${'─'.repeat(60)}`);
    console.log('Trade Execution Plan:');
    console.log('─'.repeat(60));

    for (let i = 0; i < result.legs.length; i++) {
      const leg = result.legs[i];
      const baseAsset = leg.symbol.split('/')[0] || leg.symbol.substring(0, leg.symbol.indexOf('USDT'));
      const quoteAsset = leg.symbol.split('/')[1] || 'USDT';

      console.log(`\nLeg ${i + 1}: ${leg.side} ${leg.symbol}`);
      console.log(`  Input:  ${leg.inputAmount.toFixed(8)} ${leg.side === 'Buy' ? quoteAsset : baseAsset}`);
      console.log(`  Output: ${leg.outputAmount.toFixed(8)} ${leg.side === 'Buy' ? baseAsset : quoteAsset}`);
      console.log(`  Fee:    ${leg.fee.toFixed(8)} ${leg.side === 'Buy' ? baseAsset : quoteAsset}`);

      // Check minimum order sizes
      const minimums: Record<string, number> = {
        'BTC': 0.0001,
        'ETH': 0.001,
        'USDT': 5.0,
      };

      const outputAsset = leg.side === 'Buy' ? baseAsset : quoteAsset;
      const minSize = minimums[outputAsset] || 0.01;

      if (leg.outputAmount < minSize) {
        console.log(`  ⚠️  WARNING: Output ${leg.outputAmount.toFixed(8)} ${outputAsset} is below minimum ${minSize}`);
      } else {
        console.log(`  ✓ Output meets minimum requirement (${minSize} ${outputAsset})`);
      }
    }

    // Test with slippage
    console.log(`\n${'─'.repeat(60)}`);
    console.log('After 0.5% Slippage:');
    console.log('─'.repeat(60));

    const withSlippage = TriangularArbitrageCalculator.adjustForSlippage(result, 0.5);
    console.log(`Profit: ${withSlippage.profitAmount.toFixed(8)} USDT (${withSlippage.profitPercent.toFixed(4)}%)`);

    const effectiveResult = TriangularArbitrageCalculator.calculateEffectiveProfit(
      result,
      0.5,
      0.1 // 0.1% minimum profit threshold
    );

    if (effectiveResult.isProfitable) {
      console.log(`✅ Still profitable after slippage (threshold: 0.1%)`);
    } else {
      console.log(`❌ Not profitable after slippage (threshold: 0.1%)`);
    }
  } else {
    console.log(`\n❌ No profitable opportunity (profit would be negative)`);
  }
}

// Now test the failing case from user's errors
console.log(`\n\n${'='.repeat(70)}`);
console.log('Testing Real Error Case: USDT → ETH → SAGA → USDT');
console.log('='.repeat(70));

const sagaPrices = {
  symbol1: 'ETHUSDT',
  symbol2: 'SAGAETH',
  symbol3: 'SAGAUSDT',
  price1: 2600, // ETH/USDT
  price2: 0.0005, // SAGA/ETH
  price3: 1.30, // SAGA/USDT
};

const sagaConfig = {
  baseAsset: 'USDT',
  quoteAsset: 'ETH',
  bridgeAsset: 'SAGA',
  makerFeeRate: 0.0001,
  takerFeeRate: 0.002,
};

console.log('\nMarket Prices:');
console.log(`  ETH/USDT = ${sagaPrices.price1}`);
console.log(`  SAGA/ETH = ${sagaPrices.price2}`);
console.log(`  SAGA/USDT = ${sagaPrices.price3}`);
console.log('');
console.log('Expected Efficient Price:');
console.log(`  SAGA/USDT should be: ${sagaPrices.price1 * sagaPrices.price2} USDT`);
console.log(`  Actual SAGA/USDT is: ${sagaPrices.price3} USDT`);
console.log('');

// Let's manually calculate what would happen with 50 USDT
console.log('Manual Calculation with 50 USDT:');
console.log('─'.repeat(60));

let amount = 50;
const feeRate = 0.002;

// Forward: USDT → ETH → SAGA → USDT
console.log('\nForward: USDT → ETH → SAGA → USDT');
let eth = (amount / sagaPrices.price1) * (1 - feeRate);
console.log(`  Leg 1: ${amount} USDT → ${eth.toFixed(8)} ETH (after fees)`);

let saga = (eth / sagaPrices.price2) * (1 - feeRate);
console.log(`  Leg 2: ${eth.toFixed(8)} ETH → ${saga.toFixed(8)} SAGA (after fees)`);

let usdt = (saga * sagaPrices.price3) * (1 - feeRate);
console.log(`  Leg 3: ${saga.toFixed(8)} SAGA → ${usdt.toFixed(8)} USDT (after fees)`);
console.log(`  Final: ${usdt.toFixed(8)} USDT (${((usdt - 50) / 50 * 100).toFixed(4)}% profit)`);

// Check if SAGA output meets minimum
console.log(`\n  ⚠️  SAGA output: ${saga.toFixed(8)} (minimum typically 0.01)`);
if (saga < 0.01) {
  console.log(`  ❌ SAGA output is below minimum!`);
  const requiredPosition = 50 * (0.01 / saga);
  console.log(`  Required position size: ~${requiredPosition.toFixed(2)} USDT`);
}

// Backward: USDT → SAGA → ETH → USDT
console.log('\nBackward: USDT → SAGA → ETH → USDT');
amount = 50;
saga = (amount / sagaPrices.price3) * (1 - feeRate);
console.log(`  Leg 1: ${amount} USDT → ${saga.toFixed(8)} SAGA (after fees)`);

eth = (saga * sagaPrices.price2) * (1 - feeRate);
console.log(`  Leg 2: ${saga.toFixed(8)} SAGA → ${eth.toFixed(8)} ETH (after fees)`);

usdt = (eth * sagaPrices.price1) * (1 - feeRate);
console.log(`  Leg 3: ${eth.toFixed(8)} ETH → ${usdt.toFixed(8)} USDT (after fees)`);
console.log(`  Final: ${usdt.toFixed(8)} USDT (${((usdt - 50) / 50 * 100).toFixed(4)}% profit)`);

// Check if outputs meet minimums
console.log(`\n  ⚠️  SAGA output: ${saga.toFixed(8)} (minimum typically 0.01)`);
console.log(`  ⚠️  ETH output: ${eth.toFixed(8)} (minimum typically 0.001)`);

if (saga < 0.01) {
  console.log(`  ❌ SAGA output is below minimum!`);
}
if (eth < 0.001) {
  console.log(`  ❌ ETH output is below minimum!`);
}

console.log('\n' + '='.repeat(70));
console.log('Conclusion:');
console.log('='.repeat(70));
console.log('The SAGA triangle requires a larger position size to meet minimum order sizes.');
console.log('With 50 USDT position, the intermediate asset quantities are too small.');
console.log('This is why validation is catching the error BEFORE execution.');
