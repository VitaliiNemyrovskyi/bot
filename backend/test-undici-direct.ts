/**
 * Test undici with custom settings to bypass timeout issues
 */

import { request, setGlobalDispatcher, Agent } from 'undici';

console.log('='.repeat(60));
console.log('Testing undici with custom Agent settings');
console.log('='.repeat(60));

// Create custom agent with increased timeouts
const agent = new Agent({
  connect: {
    timeout: 60000, // 60 second connect timeout (default is 10s)
    keepAlive: true,
    keepAliveTimeout: 60000
  },
  bodyTimeout: 60000, // 60 second body timeout
  headersTimeout: 60000 // 60 second headers timeout
});

// Set as global dispatcher
setGlobalDispatcher(agent);

async function testWithUndici() {
  const url = 'https://open-api.bingx.com/openApi/swap/v2/server/time';

  console.log(`\n[Test] Fetching: ${url}`);
  console.log(`[Test] Using custom Agent with 60s timeouts`);

  try {
    const startTime = Date.now();

    const { statusCode, headers, body } = await request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const elapsed = Date.now() - startTime;
    console.log(`[Test] Request completed in ${elapsed}ms`);
    console.log(`[Test] Status: ${statusCode}`);

    // Read body
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(chunk);
    }
    const responseText = Buffer.concat(chunks).toString('utf-8');
    const data = JSON.parse(responseText);

    console.log(`[Test] Response:`, JSON.stringify(data, null, 2));

    if (data.code === 0) {
      const serverTime = data.data?.serverTime || data.serverTime;
      console.log(`\n[Test] ✅ SUCCESS!`);
      console.log(`[Test] Server time: ${serverTime}`);
      console.log(`[Test] Offset from local: ${serverTime - Date.now()}ms`);
    } else {
      console.error(`[Test] ❌ API Error: ${data.msg}`);
      process.exit(1);
    }

  } catch (error: any) {
    console.error(`\n[Test] ❌ REQUEST FAILED!`);
    console.error(`[Test] Error: ${error.message}`);
    console.error(`[Test] Cause:`, error.cause);
    process.exit(1);
  }
}

testWithUndici().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('Test completed successfully');
  console.log('='.repeat(60));
  process.exit(0);
}).catch((error) => {
  console.error('\n' + '='.repeat(60));
  console.error('Unexpected error:', error);
  console.error('='.repeat(60));
  process.exit(1);
});
