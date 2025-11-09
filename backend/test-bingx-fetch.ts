/**
 * Test script to reproduce BingX fetch error
 *
 * This script tests if fetch() works correctly in the Node.js environment
 * for accessing BingX API
 */

console.log('='.repeat(60));
console.log('BingX Fetch Test');
console.log('='.repeat(60));

async function testBingXFetch() {
  const url = 'https://open-api.bingx.com/openApi/swap/v2/server/time';

  console.log(`\n[Test] Attempting to fetch: ${url}`);
  console.log(`[Test] Node version: ${process.version}`);
  console.log(`[Test] fetch available: ${typeof fetch}`);

  try {
    console.log('[Test] Starting fetch...');
    const startTime = Date.now();

    // Create AbortController for custom timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const elapsed = Date.now() - startTime;
    console.log(`[Test] Fetch completed in ${elapsed}ms`);
    console.log(`[Test] Response status: ${response.status} ${response.statusText}`);
    console.log(`[Test] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Test] HTTP Error: ${response.status} ${response.statusText}`);
      console.error(`[Test] Error body: ${errorText}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log('[Test] Response data:', JSON.stringify(data, null, 2));

    if (data.code !== 0) {
      console.error(`[Test] API Error: ${data.msg}`);
      process.exit(1);
    }

    const serverTime = data.data?.serverTime || data.serverTime;
    console.log(`\n[Test] ✅ SUCCESS!`);
    console.log(`[Test] Server time: ${serverTime}`);
    console.log(`[Test] Server time (formatted): ${new Date(serverTime).toISOString()}`);
    console.log(`[Test] Local time: ${Date.now()}`);
    console.log(`[Test] Local time (formatted): ${new Date().toISOString()}`);
    console.log(`[Test] Offset: ${serverTime - Date.now()}ms`);

  } catch (error: any) {
    console.error(`\n[Test] ❌ FETCH FAILED!`);
    console.error(`[Test] Error type: ${error.constructor.name}`);
    console.error(`[Test] Error message: ${error.message}`);
    console.error(`[Test] Error stack:`, error.stack);

    // Try to extract more info from the error
    console.error(`\n[Test] Additional error details:`);
    console.error(`[Test] - code: ${error.code}`);
    console.error(`[Test] - cause: ${error.cause}`);
    console.error(`[Test] - errno: ${error.errno}`);
    console.error(`[Test] - syscall: ${error.syscall}`);

    process.exit(1);
  }
}

// Run the test
testBingXFetch().then(() => {
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
