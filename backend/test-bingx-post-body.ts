import { PrismaClient } from '@prisma/client';
import { EncryptionService } from './src/lib/encryption';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateSignature(params: Record<string, any>, apiSecret: string): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => String(key) + '=' + String(value))
    .join('&');

  console.log('Query String for signature:', queryString);

  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');

  return signature;
}

async function testBingXPostWithBody() {
  try {
    console.log('=== BingX POST with Body Test ===\n');

    const cred = await prisma.exchangeCredentials.findFirst({
      where: { exchange: 'BINGX', userId: 'admin_1' }
    });

    if (!cred) {
      console.log('No credentials found');
      return;
    }

    const apiKey = EncryptionService.decrypt(cred.apiKey);
    const apiSecret = EncryptionService.decrypt(cred.apiSecret);

    console.log('API Key:', apiKey.substring(0, 20) + '...');
    console.log('');

    // Test: POST with params in BODY
    console.log('=== Attempt 1: POST with JSON Body ===');
    const timestamp1 = Date.now();
    const orderParams1 = {
      symbol: 'BTC-USDT',
      side: 'BID',
      positionSide: 'LONG',
      type: 'MARKET',
      quantity: '0.001',
      timestamp: timestamp1
    };

    const signature1 = generateSignature(orderParams1, apiSecret);
    const bodyWithSignature = {...orderParams1, signature: signature1};

    console.log('Sending as JSON body:', JSON.stringify(bodyWithSignature, null, 2));

    const response1 = await fetch('https://open-api.bingx.com/openApi/swap/v2/trade/order', {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyWithSignature)
    });

    const data1 = await response1.json();
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log('');

    // Test: POST with params in query AND timestamp+signature in body
    console.log('=== Attempt 2: POST with mixed params ===');
    const timestamp2 = Date.now();
    const paramsOnly = {
      symbol: 'BTC-USDT',
      side: 'BID',
      positionSide: 'LONG',
      type: 'MARKET',
      quantity: '0.001'
    };
    const signatureParams = {...paramsOnly, timestamp: timestamp2};
    const signature2 = generateSignature(signatureParams, apiSecret);

    const queryStr = Object.entries(paramsOnly)
      .map(([k, v]) => String(k) + '=' + encodeURIComponent(String(v)))
      .join('&');
    
    const url2 = 'https://open-api.bingx.com/openApi/swap/v2/trade/order?' + queryStr + 
                 '&timestamp=' + timestamp2 + '&signature=' + signature2;

    console.log('URL:', url2.substring(0, 120) + '...');

    const response2 = await fetch(url2, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data2 = await response2.json();
    console.log('Response:', JSON.stringify(data2, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBingXPostWithBody();
