/**
 * Minimal BingX order test to isolate the 109414 error
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

// Test 1: Try without positionSide (One-Way Mode)
async function testWithoutPositionSide() {
  console.log('\n=== Test 1: Without positionSide (One-Way Mode) ===');

  const serverTime = await getServerTime();
  const timestamp = serverTime;

  const params = new URLSearchParams({
    symbol: 'BTC-USDT',
    side: 'SELL',
    type: 'MARKET',
    quantity: '0.001',
    timestamp: timestamp.toString()
  });

  const signature = createSignature(params.toString(), API_SECRET);
  params.append('signature', signature);

  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/trade/order?${params}`, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });

    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Test 2: Try with positionSide=SHORT (Hedge Mode)
async function testWithPositionSide() {
  console.log('\n=== Test 2: With positionSide=SHORT (Hedge Mode) ===');

  const serverTime = await getServerTime();
  const timestamp = serverTime;

  const params = new URLSearchParams({
    symbol: 'BTC-USDT',
    side: 'SELL',
    positionSide: 'SHORT',
    type: 'MARKET',
    quantity: '0.001',
    timestamp: timestamp.toString()
  });

  const signature = createSignature(params.toString(), API_SECRET);
  params.append('signature', signature);

  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/trade/order?${params}`, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });

    const result = await response.json();
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Test 3: Check position mode
async function checkPositionMode() {
  console.log('\n=== Test 3: Check Position Mode ===');

  const timestamp = Date.now();
  const params = new URLSearchParams({
    timestamp: timestamp.toString()
  });

  const signature = createSignature(params.toString(), API_SECRET);
  params.append('signature', signature);

  try {
    const response = await fetch(`${BASE_URL}/openApi/swap/v2/user/getPositionMode?${params}`, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY
      }
    });

    const result = await response.json();
    console.log('Position Mode:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

async function main() {
  console.log('Testing BingX API with minimal parameters...\n');

  if (!API_KEY || !API_SECRET) {
    console.error('ERROR: Please set BINGX_API_KEY and BINGX_API_SECRET environment variables');
    process.exit(1);
  }

  await checkPositionMode();
  await testWithoutPositionSide();
  await testWithPositionSide();
}

main();
