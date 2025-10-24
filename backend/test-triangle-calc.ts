import { TriangularArbitrageCalculator } from './src/lib/triangular-arbitrage-calculator';
import type { TrianglePrices, TriangleConfig } from './src/types/triangular-arbitrage.types';

// Actual prices from the opportunity
const prices: TrianglePrices = {
  symbol1: 'ETHUSDT',
  symbol2: 'GFIETH',
  symbol3: 'GFIUSDT',
  price1: 3903.85,   // ETH/USDT
  price2: 0.000094,  // GFI/ETH
  price3: 0.3714,    // GFI/USDT
};

const config: TriangleConfig = {
  baseAsset: 'USDT',
  quoteAsset: 'ETH',
  bridgeAsset: 'GFI',
  makerFeeRate: 0.0006,
  takerFeeRate: 0.0006,
};

const positionSize = 100; // USDT

console.log('=== Testing Triangular Arbitrage Calculator ===');
console.log('Position Size:', positionSize, 'USDT');
console.log('Prices:', prices);
console.log('Config:', config);
console.log('');

const result = TriangularArbitrageCalculator.calculateOptimalProfit(
  positionSize,
  prices,
  config
);

if (result) {
  console.log('✅ Calculation successful!');
  console.log('Direction:', result.direction);
  console.log('Profit %:', result.profitPercent.toFixed(4) + '%');
  console.log('');
  console.log('Leg 1:', result.legs[0]);
  console.log('Leg 2:', result.legs[1]);
  console.log('Leg 3:', result.legs[2]);
} else {
  console.log('❌ No profitable arbitrage found');
}
