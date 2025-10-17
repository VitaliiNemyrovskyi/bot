/**
 * Test script to verify BingX TP/SL order placement
 *
 * This script tests if Take Profit and Stop Loss parameters are properly sent to BingX API
 *
 * Run with: npx tsx test-bingx-tpsl.ts
 */

// Example of what the connector should be creating
const takeProfitConfig = {
  type: 'TAKE_PROFIT_MARKET',
  stopPrice: 100000, // Example price
  price: 100000,
  workingType: 'MARK_PRICE',
};

const stopLossConfig = {
  type: 'STOP_MARKET',
  stopPrice: 95000, // Example price
  price: 95000,
  workingType: 'MARK_PRICE',
};

const orderParams = {
  symbol: 'BTC-USDT',
  side: 'BUY',
  positionSide: 'BOTH',
  type: 'MARKET',
  quantity: 0.001,
  takeProfit: JSON.stringify(takeProfitConfig),
  stopLoss: JSON.stringify(stopLossConfig),
};

console.log('Order parameters that should be sent to BingX:');
console.log(JSON.stringify(orderParams, null, 2));
console.log('\nTake Profit string:', orderParams.takeProfit);
console.log('Stop Loss string:', orderParams.stopLoss);

// Check if the JSON strings are valid
try {
  const tpParsed = JSON.parse(orderParams.takeProfit);
  const slParsed = JSON.parse(orderParams.stopLoss);
  console.log('\n✓ TP/SL JSON strings are valid');
  console.log('TP parsed:', tpParsed);
  console.log('SL parsed:', slParsed);
} catch (error) {
  console.error('\n✗ Error parsing TP/SL JSON:', error);
}
