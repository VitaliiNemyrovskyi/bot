/**
 * Test BingX close position functionality
 *
 * Based on BingX API documentation, there are TWO ways to close a position:
 *
 * 1. Use closePosition=true parameter:
 *    - Side is opposite of current position (LONG position → SELL order)
 *    - positionSide is the position being closed
 *    - closePosition=true
 *    - NO quantity needed (closes entire position)
 *
 * 2. Place a regular order in opposite direction:
 *    - Side is opposite of current position
 *    - positionSide is the position being closed
 *    - quantity is required
 *    - reduceOnly can be used (optional)
 */

import crypto from 'crypto';

const API_KEY = process.env.BINGX_API_KEY || '';
const API_SECRET = process.env.BINGX_API_SECRET || '';
const BASE_URL = 'https://open-api.bingx.com';

// Get server time first
async function getServerTime(): Promise<number> {
  const response = await fetch(`${BASE_URL}/openApi/swap/v2/server/time`);
  const data = await response.json();
  return data.data;
}

// Create signature
function createSignature(params: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(params).digest('hex');
}

// Test 1: Get current position for a symbol
async function getCurrentPosition(symbol: string) {
  console.log(`\n=== Getting current position for ${symbol} ===`);

  const timestamp = Date.now();
  const params = new URLSearchParams({
    symbol,
    timestamp: timestamp.toString()
  });

  const signature = createSignature(params.toString(), API_SECRET);
  params.append('signature', signature);

  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/user/positions?${params}`, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });

    const result = await response.json();
    console.log('Current positions:', JSON.stringify(result, null, 2));
    return result.data;
  } catch (error: any) {
    console.error('Error:', error.message);
    return null;
  }
}

// Test 2: Close position using closePosition=true (Method 1 - Official BingX way)
async function testClosePositionFlag(symbol: string, positionSide: 'LONG' | 'SHORT') {
  console.log(`\n=== Test: Close ${positionSide} position using closePosition=true ===`);

  const serverTime = await getServerTime();

  // To close LONG position: side=SELL, positionSide=LONG, closePosition=true
  // To close SHORT position: side=BUY, positionSide=SHORT, closePosition=true
  const side = positionSide === 'LONG' ? 'SELL' : 'BUY';

  const params = new URLSearchParams({
    symbol,
    side,
    positionSide,
    type: 'MARKET',
    closePosition: 'true',  // This tells BingX to close the entire position
    timestamp: serverTime.toString()
  });

  const signature = createSignature(params.toString(), API_SECRET);
  params.append('signature', signature);

  console.log('Request params:', params.toString());

  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/trade/order?${params}`, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });

    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.code === 0) {
      console.log('✅ SUCCESS: Position closed using closePosition=true');
    } else {
      console.log('❌ FAILED:', result.msg);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Test 3: Close position with specific quantity (Method 2 - Manual close)
async function testClosePositionWithQuantity(symbol: string, positionSide: 'LONG' | 'SHORT', quantity: number) {
  console.log(`\n=== Test: Close ${positionSide} position with quantity=${quantity} ===`);

  const serverTime = await getServerTime();

  // To close LONG position: side=SELL, positionSide=LONG
  // To close SHORT position: side=BUY, positionSide=SHORT
  const side = positionSide === 'LONG' ? 'SELL' : 'BUY';

  const params = new URLSearchParams({
    symbol,
    side,
    positionSide,
    type: 'MARKET',
    quantity: quantity.toString(),
    timestamp: serverTime.toString()
  });

  const signature = createSignature(params.toString(), API_SECRET);
  params.append('signature', signature);

  console.log('Request params:', params.toString());

  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/trade/order?${params}`, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });

    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));

    if (result.code === 0) {
      console.log('✅ SUCCESS: Position closed with specific quantity');
    } else {
      console.log('❌ FAILED:', result.msg);
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

async function main() {
  console.log('='.repeat(80));
  console.log('Testing BingX Close Position Methods');
  console.log('='.repeat(80));

  if (!API_KEY || !API_SECRET) {
    console.error('ERROR: Please set BINGX_API_KEY and BINGX_API_SECRET environment variables');
    process.exit(1);
  }

  // Step 1: Check if there's an open position
  const symbol = 'BTC-USDT';
  const positions = await getCurrentPosition(symbol);

  if (!positions || positions.length === 0) {
    console.log('\n⚠️  No open positions found. Cannot test close position.');
    console.log('Please open a position first, then run this test again.');
    return;
  }

  const position = positions[0];
  console.log('\nPosition found:', {
    symbol: position.symbol,
    positionSide: position.positionSide,
    positionAmt: position.positionAmt,
    unrealizedProfit: position.unrealizedProfit
  });

  // IMPORTANT: Only test if there's actually a position
  const posAmt = parseFloat(position.positionAmt || '0');
  if (posAmt === 0) {
    console.log('\n⚠️  Position amount is 0. Cannot test close position.');
    return;
  }

  console.log('\n' + '='.repeat(80));
  console.log('COMPARISON OF TWO METHODS:');
  console.log('='.repeat(80));
  console.log('\nMethod 1: closePosition=true');
  console.log('  - Closes ENTIRE position automatically');
  console.log('  - NO quantity parameter needed');
  console.log('  - Simpler and safer (no partial close risks)');
  console.log('\nMethod 2: Specify quantity');
  console.log('  - Allows partial position close');
  console.log('  - Requires exact quantity');
  console.log('  - Risk of quantity mismatch');
  console.log('\nRECOMMENDATION: Use Method 1 (closePosition=true) for safety');
  console.log('='.repeat(80));

  // Note: Uncomment below to actually test closing (WARNING: This will close your real position!)
  // await testClosePositionFlag(symbol, position.positionSide);
  // OR
  // await testClosePositionWithQuantity(symbol, position.positionSide, Math.abs(posAmt));
}

main();
