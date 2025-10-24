/**
 * Test to understand Binance symbol direction
 *
 * On Binance, symbols are always in format BASE/QUOTE
 * - BTCUSDT means BTC is base, USDT is quote. Price is "USDT per BTC"
 * - ETHBTC means ETH is base, BTC is quote. Price is "BTC per ETH"
 * - FLOKIUSDT means FLOKI is base, USDT is quote. Price is "USDT per FLOKI"
 *
 * To buy base with quote: divide quote_amount by price
 * To sell base for quote: multiply base_amount by price
 */

// Example triangle: USDT -> FLOKI -> USDC -> USDT
// Symbols: [FLOKIUSDT, FLOKIUSDC, USDCUSDT]

const prices = {
  FLOKIUSDT: 0.0000782,  // 1 FLOKI = 0.0000782 USDT
  FLOKIUSDC: 0.00007823, // 1 FLOKI = 0.00007823 USDC
  USDCUSDT: 0.9994,      // 1 USDC = 0.9994 USDT
};

console.log('=== Manual Calculation ===\n');
console.log('Starting with 100 USDT\n');

// Step 1: USDT -> FLOKI using FLOKIUSDT
console.log('Step 1: Buy FLOKI with USDT using FLOKIUSDT');
console.log('  Symbol: FLOKIUSDT (FLOKI is base, USDT is quote)');
console.log('  Price: 0.0000782 USDT per FLOKI');
console.log('  Operation: BUY base with quote');
console.log('  Calculation: 100 USDT / 0.0000782 = ', 100 / prices.FLOKIUSDT, 'FLOKI');

const flokiAmount = 100 / prices.FLOKIUSDT;
console.log('  Result: ', flokiAmount.toFixed(2), 'FLOKI\n');

// Step 2: FLOKI -> USDC using FLOKIUSDC
console.log('Step 2: Sell FLOKI for USDC using FLOKIUSDC');
console.log('  Symbol: FLOKIUSDC (FLOKI is base, USDC is quote)');
console.log('  Price: 0.00007823 USDC per FLOKI');
console.log('  Operation: SELL base for quote');
console.log('  Calculation:', flokiAmount.toFixed(2), 'FLOKI *', prices.FLOKIUSDC, '=', flokiAmount * prices.FLOKIUSDC, 'USDC');

const usdcAmount = flokiAmount * prices.FLOKIUSDC;
console.log('  Result: ', usdcAmount.toFixed(4), 'USDC\n');

// Step 3: USDC -> USDT using USDCUSDT
console.log('Step 3: Sell USDC for USDT using USDCUSDT');
console.log('  Symbol: USDCUSDT (USDC is base, USDT is quote)');
console.log('  Price: 0.9994 USDT per USDC');
console.log('  Operation: SELL base for quote');
console.log('  Calculation:', usdcAmount.toFixed(4), 'USDC *', prices.USDCUSDT, '=', usdcAmount * prices.USDCUSDT, 'USDT');

const finalUsdt = usdcAmount * prices.USDCUSDT;
console.log('  Result: ', finalUsdt.toFixed(4), 'USDT\n');

const profit = finalUsdt - 100;
const profitPercent = (profit / 100) * 100;

console.log('=== Final Result ===');
console.log('Started with: 100 USDT');
console.log('Ended with:', finalUsdt.toFixed(4), 'USDT');
console.log('Profit:', profit.toFixed(4), 'USDT');
console.log('Profit %:', profitPercent.toFixed(4), '%');
console.log('');

console.log('=== The Problem ===');
console.log('The calculator needs to know FOR EACH LEG whether to:');
console.log('- BUY (divide by price) or');
console.log('- SELL (multiply by price)');
console.log('');
console.log('This depends on which asset we currently have and which asset the symbol trades.');
console.log('');
console.log('For normalized triangle [FLOKIUSDT, FLOKIUSDC, USDCUSDT] with assets {base: USDT, quote: FLOKI, bridge: USDC}:');
console.log('- Leg 1: We have USDT (base), want FLOKI (quote). Symbol is FLOKIUSDT. FLOKI is base of symbol -> BUY');
console.log('- Leg 2: We have FLOKI (quote), want USDC (bridge). Symbol is FLOKIUSDC. FLOKI is base of symbol -> SELL');
console.log('- Leg 3: We have USDC (bridge), want USDT (base). Symbol is USDCUSDT. USDC is base of symbol -> SELL');
