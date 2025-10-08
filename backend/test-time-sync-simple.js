/**
 * Simple test for BingX server time endpoint
 * Run with: node test-time-sync-simple.js
 */

async function testBingXServerTime() {
  console.log('Testing BingX Server Time Endpoint...\n');

  try {
    const url = 'https://open-api.bingx.com/openApi/swap/v2/server/time';
    console.log(`Fetching: ${url}`);

    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    if (data.code === 0) {
      const serverTime = data.data?.serverTime || data.serverTime;
      const localTime = Date.now();
      const offset = serverTime - localTime;
      const latency = endTime - startTime;

      console.log('\nTime Analysis:');
      console.log(`  Server time:  ${serverTime} (${new Date(serverTime).toISOString()})`);
      console.log(`  Local time:   ${localTime} (${new Date(localTime).toISOString()})`);
      console.log(`  Offset:       ${offset}ms`);
      console.log(`  Latency:      ${latency}ms`);

      if (Math.abs(offset) < 1000) {
        console.log('\n✓ Time offset is acceptable (< 1000ms)');
      } else {
        console.log('\n⚠ WARNING: Large time offset detected (> 1000ms)');
      }
    } else {
      console.log(`\n✗ API returned error: ${data.msg}`);
    }
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
  }
}

async function testBybitServerTime() {
  console.log('\n\n========================================');
  console.log('Testing Bybit Server Time Endpoint...\n');

  try {
    const url = 'https://api-testnet.bybit.com/v5/market/time';
    console.log(`Fetching: ${url}`);

    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));

    if (data.retCode === 0) {
      const serverTimeSeconds = parseInt(data.result.timeSecond);
      const serverTime = serverTimeSeconds * 1000;
      const localTime = Date.now();
      const offset = serverTime - localTime;
      const latency = endTime - startTime;

      console.log('\nTime Analysis:');
      console.log(`  Server time:  ${serverTime} (${new Date(serverTime).toISOString()})`);
      console.log(`  Local time:   ${localTime} (${new Date(localTime).toISOString()})`);
      console.log(`  Offset:       ${offset}ms`);
      console.log(`  Latency:      ${latency}ms`);

      if (Math.abs(offset) < 1000) {
        console.log('\n✓ Time offset is acceptable (< 1000ms)');
      } else {
        console.log('\n⚠ WARNING: Large time offset detected (> 1000ms)');
      }
    } else {
      console.log(`\n✗ API returned error: ${data.retMsg}`);
    }
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Exchange Server Time Test');
  console.log('='.repeat(60) + '\n');

  await testBingXServerTime();
  await testBybitServerTime();

  console.log('\n' + '='.repeat(60));
  console.log('Tests completed');
  console.log('='.repeat(60) + '\n');
}

main();
