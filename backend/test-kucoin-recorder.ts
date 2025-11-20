/**
 * Test KuCoin Recorder WebSocket
 * This script tests if KuCoin recorder is receiving data and generating correct topics
 */

import { KuCoinRecorderService } from './src/lib/kucoin-recorder';

async function testKuCoinRecorder() {
  console.log('🧪 Starting KuCoin Recorder Test');
  console.log('================================\n');

  const recorder = new KuCoinRecorderService();

  try {
    // Initialize the service
    console.log('📡 Initializing KuCoin service...');
    await recorder.initialize();
    console.log('✅ Service initialized\n');

    // Subscribe to RESOLV/USDT
    const symbol = 'RESOLV/USDT';
    console.log(`📊 Subscribing to ${symbol}...`);

    let dataCount = 0;

    recorder.subscribeToTicker(symbol, (data) => {
      dataCount++;
      console.log(`\n🔔 Data received (#${dataCount}):`, {
        topic: data.topic,
        type: data.type,
        lastPrice: data.data?.lastPrice,
        timestamp: data.ts ? new Date(data.ts).toISOString() : 'N/A'
      });

      if (dataCount >= 3) {
        console.log('\n✅ Test successful! Received 3 data updates.');
        console.log('🔌 Closing connection...');
        recorder.unsubscribeAll();
        process.exit(0);
      }
    });

    console.log('⏳ Waiting for data (will wait up to 30 seconds)...\n');

    // Wait 30 seconds, then exit if no data
    setTimeout(() => {
      console.log('\n⏰ 30 seconds elapsed');
      if (dataCount === 0) {
        console.log('❌ No data received from KuCoin WebSocket!');
        console.log('💡 This indicates the WebSocket is not receiving ticker updates.');
      }
      recorder.unsubscribeAll();
      process.exit(dataCount > 0 ? 0 : 1);
    }, 30000);

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testKuCoinRecorder();
