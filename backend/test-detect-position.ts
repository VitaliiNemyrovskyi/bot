/**
 * Test script to verify position detection endpoint
 */

async function testDetectPosition() {
  const symbol = 'AIAUSDT';
  const primaryExchange = 'GATEIO';
  const hedgeExchange = 'BINGX';

  console.log('Testing position detection endpoint...');
  console.log('Parameters:', { symbol, primaryExchange, hedgeExchange });

  try {
    const token = process.env.AUTH_TOKEN || '';
    if (!token) {
      console.error('❌ No AUTH_TOKEN environment variable set');
      console.log('Please set it with your auth token:');
      console.log('$env:AUTH_TOKEN="your_token_here"');
      return;
    }

    const url = `http://localhost:3000/api/arbitrage/positions/detect?symbol=${symbol}&primaryExchange=${primaryExchange}&hedgeExchange=${hedgeExchange}`;

    console.log('\nCalling endpoint:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    console.log('\n=== RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (data.success && data.detected) {
      console.log('\n✅ Position detected and imported!');
      console.log('Position ID:', data.position?.id);
    } else if (data.alreadyExists) {
      console.log('\n⚠️  Position already exists in database');
    } else {
      console.log('\n❌ No matching positions found');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

testDetectPosition();
