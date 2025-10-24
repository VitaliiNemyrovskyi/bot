/**
 * Test triangular arbitrage profit calculation
 */
import { TriangularArbitrageCalculator } from './src/lib/triangular-arbitrage-calculator';

// Real data from database:
// Triangle: FLOKIUSDC -> FLOKIUSDT -> USDCUSDT
// Assets: base=USDT, quote=USDC, bridge=FLOKI
// Prices: 0.00007823 / 0.0000782 / 0.9994

const startAmount = 100; // $100 USDT

const prices = {
  symbol1: 'FLOKIUSDC',
  symbol2: 'FLOKIUSDT',
  symbol3: 'USDCUSDT',
  price1: 0.00007823,
  price2: 0.0000782,
  price3: 0.9994,
};

const config = {
  baseAsset: 'USDT',
  quoteAsset: 'USDC',
  bridgeAsset: 'FLOKI',
  makerFeeRate: 0.0001,
  takerFeeRate: 0.0006,
};

console.log('Testing triangular arbitrage calculation:');
console.log('Triangle:', prices.symbol1, '->', prices.symbol2, '->', prices.symbol3);
console.log('Assets:', config);
console.log('Prices:', prices);
console.log('Start amount:', startAmount, config.baseAsset);
console.log('');

const result = TriangularArbitrageCalculator.calculateOptimalProfit(
  startAmount,
  prices,
  config
);

if (result) {
  console.log('Result:');
  console.log('- Direction:', result.direction);
  console.log('- Profit percent:', result.profitPercent.toFixed(4), '%');
  console.log('- Profit amount:', result.profitAmount.toFixed(2), config.baseAsset);
  console.log('- Final amount:', result.finalAmount.toFixed(2), config.baseAsset);
  console.log('');
  console.log('Trade legs:');
  result.legs.forEach((leg) => {
    console.log(`  Leg ${leg.leg}: ${leg.side} ${leg.symbol}`);
    console.log(`    Input: ${leg.inputAmount.toFixed(8)}`);
    console.log(`    Output: ${leg.outputAmount.toFixed(8)}`);
    console.log(`    Fee: ${leg.fee.toFixed(8)}`);
  });
} else {
  console.log('No profitable result found');
}

console.log('\n=== Manual calculation check ===');
console.log('If we interpret the symbols correctly:');
console.log('');
console.log('FLOKIUSDC: 1 FLOKI = 0.00007823 USDC');
console.log('FLOKIUSDT: 1 FLOKI = 0.0000782 USDT');
console.log('USDCUSDT: 1 USDC = 0.9994 USDT');
console.log('');
console.log('Forward path (USDT -> USDC -> FLOKI -> USDT):');
console.log('1. Start: 100 USDT');
console.log('2. Buy USDC with USDT at rate 0.9994: 100 / 0.9994 = 100.06 USDC');
console.log('3. Buy FLOKI with USDC at rate 0.00007823: 100.06 / 0.00007823 = 1,278,971 FLOKI');
console.log('4. Sell FLOKI for USDT at rate 0.0000782: 1,278,971 * 0.0000782 = 100.01 USDT');
console.log('5. Profit: 100.01 - 100 = 0.01 USDT (0.01%)');
console.log('');
console.log('This is the CORRECT calculation - profit should be around 0.01%');
console.log('But we are getting:', result?.profitPercent.toFixed(2), '%');
