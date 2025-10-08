import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get credentials from command line arguments or environment
// CRITICAL: Trim to remove any whitespace, newlines, or hidden characters
const API_KEY = (process.argv[2] || process.env.BINGX_API_KEY || '').trim();
const API_SECRET = (process.argv[3] || process.env.BINGX_API_SECRET || '').trim();
const BASE_URL = 'https://open-api.bingx.com';

/**
 * Test script to determine the correct signature encoding for BingX API
 *
 * Usage:
 *   npx tsx test-bingx-signature.ts <API_KEY> <API_SECRET>
 *   or set BINGX_API_KEY and BINGX_API_SECRET in .env
 *
 * This script will try BOTH hex and base64 encoding to see which one works
 */

if (!API_KEY || !API_SECRET) {
  console.error('ERROR: BingX API credentials not provided!');
  console.error('');
  console.error('Usage:');
  console.error('  npx tsx test-bingx-signature.ts <API_KEY> <API_SECRET>');
  console.error('  or set BINGX_API_KEY and BINGX_API_SECRET in .env');
  process.exit(1);
}

function generateSignatureHex(params: Record<string, any>): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  // Create query string
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Generate HMAC SHA256 signature with HEX encoding
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  return signature;
}

function generateSignatureBase64(params: Record<string, any>): string {
  // Sort parameters alphabetically
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  // Create query string
  const queryString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Generate HMAC SHA256 signature with BASE64 encoding
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('base64');

  return signature;
}

async function testSignature(signatureType: 'hex' | 'base64') {
  const timestamp = Date.now();

  const params = {
    timestamp
  };

  let signature: string;
  let signatureLabel: string;

  if (signatureType === 'hex') {
    signature = generateSignatureHex(params);
    signatureLabel = 'HEX';
  } else {
    signature = generateSignatureBase64(params);
    signatureLabel = 'BASE64';
  }

  console.log(`\n========== Testing ${signatureLabel} Signature ==========`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Query String: timestamp=${timestamp}`);
  console.log(`Signature (${signatureLabel}): ${signature}`);
  console.log(`Signature Length: ${signature.length} characters`);

  // Build request URL
  const url = `${BASE_URL}/openApi/swap/v2/user/balance?timestamp=${timestamp}&signature=${encodeURIComponent(signature)}`;

  console.log(`\nMaking request to: ${BASE_URL}/openApi/swap/v2/user/balance`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-BX-APIKEY': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body:`, JSON.stringify(data, null, 2));

    if (data.code === 0) {
      console.log(`✅ SUCCESS! ${signatureLabel} encoding works!`);
      return true;
    } else {
      console.log(`❌ FAILED! Error code: ${data.code}, Message: ${data.msg}`);
      return false;
    }
  } catch (error: any) {
    console.log(`❌ REQUEST FAILED:`, error.message);
    return false;
  }
}

async function main() {
  console.log('BingX Signature Encoding Test');
  console.log('==============================');
  console.log(`API Key Length: ${API_KEY.length}`);
  console.log(`API Secret Length: ${API_SECRET.length}`);
  console.log(`API Key (first 8 chars): ${API_KEY.substring(0, 8)}...`);
  console.log(`API Secret (first 8 chars): ${API_SECRET.substring(0, 8)}...`);

  // Test HEX encoding first
  const hexWorks = await testSignature('hex');

  // Wait a bit to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test BASE64 encoding
  const base64Works = await testSignature('base64');

  // Summary
  console.log('\n========== TEST SUMMARY ==========');
  console.log(`HEX encoding: ${hexWorks ? '✅ WORKS' : '❌ FAILED'}`);
  console.log(`BASE64 encoding: ${base64Works ? '✅ WORKS' : '❌ FAILED'}`);

  if (hexWorks && !base64Works) {
    console.log('\n🎯 CONCLUSION: Use HEX encoding (.digest("hex"))');
  } else if (base64Works && !hexWorks) {
    console.log('\n🎯 CONCLUSION: Use BASE64 encoding (.digest("base64"))');
  } else if (hexWorks && base64Works) {
    console.log('\n⚠️  WARNING: Both encodings work! This is unexpected.');
  } else {
    console.log('\n❌ ERROR: Neither encoding works. Check API credentials or other parameters.');
  }
}

main().catch(console.error);
