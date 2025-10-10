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

async function testBingXOrder() {
  try {
    console.log('=== BingX Live Order Placement Test ===\n');

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

    // Test: Place a very small market order
    console.log('=== Placing Small Market Order ===');
    const orderTimestamp = Date.now();
    const orderParams = {
      symbol: 'BTC-USDT',
      side: 'BID',          // Buy
      positionSide: 'LONG',
      type: 'MARKET',
      quantity: '0.001',    // Very small quantity
      timestamp: orderTimestamp
    };

    const orderSignature = generateSignature(orderParams, apiSecret);
    console.log('Order Parameters:', JSON.stringify(orderParams, null, 2));
    console.log('Order Signature:', orderSignature);
    console.log('');

    // Build URL with query parameters
    const orderQueryString = Object.entries({...orderParams, signature: orderSignature})
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    const orderUrl = `https://open-api.bingx.com/openApi/swap/v2/trade/order?${orderQueryString}`;
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
      console.log(`\n❌ FAILED: ${orderData.msg} (code: ${orderData.code})`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBingXOrder();
