/**
 * Simple test to check BingX position mode
 * Uses API keys from environment variables
 */
import crypto from 'crypto';

const API_KEY = process.env.BINGX_API_KEY || '';
const API_SECRET = process.env.BINGX_API_SECRET || '';
const BASE_URL = 'https://open-api.bingx.com';

async function checkPositionMode() {
  if (!API_KEY || !API_SECRET) {
    console.error('ERROR: Please set BINGX_API_KEY and BINGX_API_SECRET environment variables');
    console.error('You can export them like:');
    console.error('export BINGX_API_KEY="your_key"');
    console.error('export BINGX_API_SECRET="your_secret"');
    process.exit(1);
  }

  console.log('=== Checking BingX Position Mode ===\n');

  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;

  // Generate signature
  const signature = crypto
    .createHmac('sha256', API_SECRET)
    .update(queryString)
    .digest('hex');

  const url = `${BASE_URL}/openApi/swap/v2/user/getPositionMode?${queryString}&signature=${signature}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-BX-APIKEY': API_KEY }
    });

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.code === 0 && data.data) {
      const positionMode = data.data.dualSidePosition ? 'Hedge Mode (Dual Side)' : 'One-Way Mode';
      console.log(`\n📊 Account Position Mode: ${positionMode}`);
      console.log(`   dualSidePosition = ${data.data.dualSidePosition}`);

      if (data.data.dualSidePosition) {
        console.log('\n✅ Hedge Mode: You MUST include positionSide (LONG/SHORT) in orders');
      } else {
        console.log('\n✅ One-Way Mode: You should NOT include positionSide in orders');
        console.log('   Including positionSide may cause error 109414');
      }
    } else {
      console.error('\n❌ Failed to get position mode:', data.msg || 'Unknown error');
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

checkPositionMode();
