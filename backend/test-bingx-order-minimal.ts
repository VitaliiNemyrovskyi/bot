/**
 * Minimal BingX order test to debug error 109414
 * Tests with BTC-USDT to rule out symbol-specific issues
 */

import crypto from 'crypto';
import fetch from 'node-fetch';

const API_KEY = process.env.BINGX_API_KEY || '';
const API_SECRET = process.env.BINGX_API_SECRET || '';

async function testBingXOrderMinimal() {
  console.log('=== Testing BingX Order (Minimal) ===\n');

  if (!API_KEY || !API_SECRET) {
    console.error('❌ Missing BINGX_API_KEY or BINGX_API_SECRET environment variables');
    process.exit(1);
  }

  console.log('API Key length:', API_KEY.length);
  console.log('API Secret length:', API_SECRET.length);
  console.log('API Key prefix:', API_KEY.substring(0, 8) + '...\n');

  // Test with well-known symbol BTC-USDT
  const payload = {
    symbol: 'BTC-USDT',
    side: 'BUY',
    positionSide: 'LONG',
    type: 'MARKET',
    quantity: 0.001  // Very small quantity
  };

  const timestamp = Date.now();

  // Build parameter string IN INSERTION ORDER (like official example)
  // NOT alphabetically sorted
  let paramString = '';
  for (const key in payload) {
    paramString += `${key}=${(payload as any)[key]}&`;
  }
  paramString += `timestamp=${timestamp}`;

  console.log('Parameter string (insertion order):', paramString);

  // Generate signature
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(paramString)
    .digest('hex');

  console.log('Signature (hex):', signature);

  // Build URL with URL-encoded parameters
  let urlParams = '';
  for (const key in payload) {
    urlParams += `${key}=${encodeURIComponent(String((payload as any)[key]))}&`;
  }
  urlParams += `timestamp=${timestamp}&signature=${signature}`;

  const url = `https://open-api.bingx.com/openApi/swap/v2/trade/order/test?${urlParams}`;

  console.log('\nCalling test order endpoint...\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (data.code === 0) {
      console.log('\n✅ SUCCESS! Order validated with positionSide parameter');
      return true;
    } else {
      console.log(`\n❌ FAILED with code ${data.code}: ${data.msg}`);
      return false;
    }
  } catch (error: any) {
    console.error('❌ ERROR:', error.message);
    return false;
  }
}

testBingXOrderMinimal()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
