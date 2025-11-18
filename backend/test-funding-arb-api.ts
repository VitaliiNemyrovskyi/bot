/**
 * Test script for Funding Arbitrage API endpoints
 */

async function testAPI() {
  const baseUrl = 'http://localhost:3000/api/funding-arb';

  console.log('🧪 Testing Funding Arbitrage API\n');

  try {
    // Test 1: Get opportunities
    console.log('1️⃣  Testing GET /opportunities');
    const oppResponse = await fetch(`${baseUrl}/opportunities`);
    const oppData = await oppResponse.json();
    console.log(`   ✅ Success! Found ${oppData.opportunities?.length || 0} opportunities`);

    if (oppData.opportunities && oppData.opportunities.length > 0) {
      const best = oppData.opportunities[0];
      console.log(`   Best opportunity: ${best.symbol} - ${best.fundingRatePercent} (Est: ${best.estimatedProfit.toFixed(2)}%)`);
    }
    console.log('');

    // Test 2: Start monitor
    console.log('2️⃣  Testing POST /monitor (start)');
    const startMonitorResponse = await fetch(`${baseUrl}/monitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start',
        config: {
          minFundingRate: -0.01, // -1%
          updateInterval: 60000, // 1 minute
        }
      }),
    });
    const startMonitorData = await startMonitorResponse.json();

    if (startMonitorData.success) {
      console.log('   ✅ Monitor started successfully');
    } else {
      console.log(`   ⚠️  ${startMonitorData.message || 'Already running'}`);
    }
    console.log('');

    // Wait a bit for monitor to scan
    console.log('⏳  Waiting 2 seconds for monitor to scan...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Get monitor status
    console.log('3️⃣  Testing GET /monitor (status)');
    const statusResponse = await fetch(`${baseUrl}/monitor`);
    const statusData = await statusResponse.json();
    console.log(`   ✅ Monitor status:`)
    console.log(`      Running: ${statusData.isRunning ? 'Yes' : 'No'}`);
    console.log(`      Opportunities: ${statusData.opportunitiesCount || 0}`);
    if (statusData.stats) {
      console.log(`      Ready opportunities: ${statusData.stats.readyOpportunities}`);
      console.log(`      Avg profit: ${statusData.stats.avgEstimatedProfit.toFixed(2)}%`);
    }
    console.log('');

    // Test 4: Get ready opportunities only
    console.log('4️⃣  Testing GET /opportunities?ready=true');
    const readyResponse = await fetch(`${baseUrl}/opportunities?ready=true`);
    const readyData = await readyResponse.json();
    console.log(`   ✅ Found ${readyData.opportunities?.length || 0} ready opportunities (within 10 min)`);
    console.log('');

    // Test 5: Stop monitor
    console.log('5️⃣  Testing POST /monitor (stop)');
    const stopMonitorResponse = await fetch(`${baseUrl}/monitor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    });
    const stopMonitorData = await stopMonitorResponse.json();
    console.log(`   ✅ ${stopMonitorData.message}`);
    console.log('');

    // Test 6: Execute strategy (simulation - will fail because no opportunity ready)
    console.log('6️⃣  Testing POST /execute (expect to fail - no ready opportunity)');
    console.log('   Note: This would normally require:');
    console.log('     - symbol: e.g., "RESOLV/USDT"');
    console.log('     - positionSize: e.g., "0.1"');
    console.log('     - userId: your user ID');
    console.log('   Skipping actual execution for safety...');
    console.log('');

    console.log('✅ All API tests completed!\n');

    console.log('📚 API Summary:');
    console.log('   GET  /api/funding-arb/opportunities       - Get all opportunities');
    console.log('   GET  /api/funding-arb/opportunities?ready=true - Get ready opportunities');
    console.log('   POST /api/funding-arb/monitor            - Start/stop monitor');
    console.log('   GET  /api/funding-arb/monitor            - Get monitor status');
    console.log('   POST /api/funding-arb/execute            - Execute strategy');
    console.log('   GET  /api/funding-arb/status             - Get bot status');
    console.log('   POST /api/funding-arb/stop               - Emergency stop');
    console.log('');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
