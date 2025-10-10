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

  console.log('Signature query string:', queryString);

  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
}

async function testSortedParams() {
  try {
    const cred = await prisma.exchangeCredentials.findFirst({
      where: { exchange: 'BINGX', userId: 'admin_1' }
    });

    if (!cred) return;

    const apiKey = EncryptionService.decrypt(cred.apiKey);
    const apiSecret = EncryptionService.decrypt(cred.apiSecret);

    console.log('=== Test: Alphabetically Sorted URL Parameters ===\n');

    const timestamp = Date.now();
    const orderParams = {
      symbol: 'BTC-USDT',
      side: 'BID',
      positionSide: 'LONG',
      type: 'MARKET',
      quantity: '0.001',
      timestamp
    };

    const signature = generateSignature(orderParams, apiSecret);
    console.log('Signature:', signature);
    console.log('');

    // Build URL with SORTED parameters
    const allParams = {...orderParams, signature};
    const sortedKeys = Object.keys(allParams).sort();
    
    const sortedQueryString = sortedKeys
      .map(key => String(key) + '=' + encodeURIComponent(String(allParams[key as keyof typeof allParams])))
      .join('&');

    const url = 'https://open-api.bingx.com/openApi/swap/v2/trade/order?' + sortedQueryString;
    console.log('URL (first 150 chars):', url.substring(0, 150) + '...');
    console.log('Full query string:', sortedQueryString);
    console.log('');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-BX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.code === 0) {
      console.log('\n✅ SUCCESS!');
    } else {
      console.log('\n❌ FAILED:', data.msg);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSortedParams();
