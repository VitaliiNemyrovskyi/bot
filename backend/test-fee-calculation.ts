/**
 * Test fee calculation for AIAUSDT position
 */

// Example data from actual position
const positionSize = 10; // 10 AIA
const primaryEntryPrice = 6.9492; // Gate.io price
const hedgeEntryPrice = 6.9492; // BingX price (assuming same for test)

// Fee rates
const gateioFeeRate = 0.0005; // 0.05%
const bingxFeeRate = 0.0004; // 0.04%

// Calculate position values
const primaryPositionValue = positionSize * primaryEntryPrice;
const hedgePositionValue = positionSize * hedgeEntryPrice;

// Calculate fees
const primaryFees = primaryPositionValue * gateioFeeRate;
const hedgeFees = hedgePositionValue * bingxFeeRate;

console.log('=== Fee Calculation Test ===\n');
console.log(`Position Size: ${positionSize} AIA`);
console.log(`Primary (Gate.io) Entry Price: ${primaryEntryPrice} USDT`);
console.log(`Hedge (BingX) Entry Price: ${hedgeEntryPrice} USDT\n`);

console.log(`Primary Position Value: ${primaryPositionValue.toFixed(4)} USDT`);
console.log(`Primary Fee Rate: ${(gateioFeeRate * 100).toFixed(2)}%`);
console.log(`Primary Entry Fees: ${primaryFees.toFixed(6)} USDT\n`);

console.log(`Hedge Position Value: ${hedgePositionValue.toFixed(4)} USDT`);
console.log(`Hedge Fee Rate: ${(bingxFeeRate * 100).toFixed(2)}%`);
console.log(`Hedge Entry Fees: ${hedgeFees.toFixed(6)} USDT\n`);

console.log(`Total Entry Fees: ${(primaryFees + hedgeFees).toFixed(6)} USDT`);
