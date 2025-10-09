import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './src/lib/encryption';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Test BingX signature generation
function generateSignature(params: Record<string, any>, apiSecret: string): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  // Create query string WITHOUT URL encoding
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  console.log('Query String:', queryString);

  // Generate HMAC SHA256 signature using HEX encoding
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');

  return signature;
}

async function testBingXSignature() {
  try {
    console.log('=== BingX Signature Test ===\n');

    // Fetch BingX credentials
    const cred = await prisma.exchangeCredentials.findFirst({
      where: {
        exchange: 'BINGX',
        userId: 'admin_1'
      }
    });

    if (!cred) {
      console.log('❌ No BingX credentials found');
      return;
    }

    // Decrypt credentials
    const apiKey = EncryptionService.decrypt(cred.apiKey);
    const apiSecret = EncryptionService.decrypt(cred.apiSecret);

    console.log('API Key:', apiKey);
    console.log('API Secret length:', apiSecret.length);
    console.log('');

    // Test 1: Simple server time request (no signature needed typically)
    console.log('=== Test 1: Server Time (GET) ===');
    const timestamp = Date.now();
    console.log('Timestamp:', timestamp);

    const timeResponse = await fetch('https://open-api.bingx.com/openApi/swap/v2/server/time');
    const timeData = await timeResponse.json();
    console.log('Server Time Response:', timeData);
    console.log('');

    // Test 2: Account balance request (requires signature)
    console.log('=== Test 2: Account Balance (with signature) ===');
    const balanceTimestamp = Date.now();
    const balanceParams = {
      timestamp: balanceTimestamp
    };

    const balanceSignature = generateSignature(balanceParams, apiSecret);
    console.log('Balance Signature:', balanceSignature);
    console.log('');

    const balanceUrl = `https://open-api.bingx.com/openApi/swap/v2/user/balance?timestamp=${balanceTimestamp}&signature=${balanceSignature}`;
    console.log('Balance URL:', balanceUrl);

    const balanceResponse = await fetch(balanceUrl, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': apiKey
      }
    });

    const balanceData = await balanceResponse.json();
    console.log('Balance Response:', JSON.stringify(balanceData, null, 2));
    console.log('');

    // Test 3: Actually place a small market order to test POST signature
    console.log('=== Test 3: LIVE Order Placement Test ===');
    const orderTimestamp = Date.now();
    const orderParams = {
      symbol: 'BTC-USDT',
      side: 'BID',
      positionSide: 'LONG',
      type: 'MARKET',
      quantity: '0.001',
      timestamp: orderTimestamp
    };

    const orderSignature = generateSignature(orderParams, apiSecret);
    console.log('Order Parameters:', JSON.stringify(orderParams, null, 2));
    console.log('Order Signature:', orderSignature);
    console.log('');

    // Build the full query string with signature
    const fullOrderParams = {...orderParams, signature: orderSignature};
    const orderQueryParts: string[] = [];
    for (const key in fullOrderParams) {
      const value = fullOrderParams[key as keyof typeof fullOrderParams];
      orderQueryParts.push(key + '=' + encodeURIComponent(String(value)));
    }
    const orderQueryString = orderQueryParts.join('&');

    const orderUrl = 'https://open-api.bingx.com/openApi/swap/v2/trade/order?' + orderQueryString;
    console.log('Order URL (first 150 chars):', orderUrl.substring(0, 150) + '...');
    console.log('');

    const orderResponse = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const orderData = await orderResponse.json();
    console.log('Order Response:', JSON.stringify(orderData, null, 2));

    if (orderData.code === 0) {
      console.log('\n✅ SUCCESS: Order placed successfully!');
    } else {
      console.log('\n❌ FAILED: ' + orderData.msg + ' (code: ' + orderData.code + ')');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBingXSignature();
