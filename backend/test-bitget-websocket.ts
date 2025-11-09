/**
 * Test Bitget WebSocket connection for RIVERUSDT
 *
 * Usage: npx tsx test-bitget-websocket.ts
 */

import WebSocket from 'ws';

const symbol = 'RIVERUSDT';
const wsUrl = 'wss://ws.bitget.com/v2/ws/public';

console.log(`Testing Bitget WebSocket for ${symbol}...`);
console.log(`URL: ${wsUrl}\n`);

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('✓ WebSocket connected\n');

  const subscribeMessage = {
    op: 'subscribe',
    args: [{
      instType: 'USDT-FUTURES',
      channel: 'ticker',
      instId: symbol
    }]
  };

  console.log('Sending subscribe message:');
  console.log(JSON.stringify(subscribeMessage, null, 2));
  console.log('');

  ws.send(JSON.stringify(subscribeMessage));
});

let messageCount = 0;

ws.on('message', (data: Buffer) => {
  messageCount++;
  const message = data.toString();

  try {
    const parsed = JSON.parse(message);

    console.log(`\n[Message #${messageCount}]`);
    console.log('Raw:', message);
    console.log('\nParsed:');
    console.log(JSON.stringify(parsed, null, 2));

    // Check if it's subscription confirmation
    if (parsed.event === 'subscribe') {
      console.log('\n✓ Subscription confirmed');
    }

    // Check if it contains ticker data
    if (parsed.action && parsed.data) {
      console.log('\n✓ Ticker data received:');
      if (parsed.data.length > 0) {
        const ticker = parsed.data[0];
        console.log('  - instId:', ticker.instId);
        console.log('  - last price:', ticker.last);
        console.log('  - fundingRate:', ticker.fundingRate);
        console.log('  - nextFundingTime:', ticker.nextFundingTime);
        console.log('  - openUtc:', ticker.openUtc);
        console.log('  - ts:', ticker.ts);

        // Show all available fields
        console.log('\n  All fields:', Object.keys(ticker).join(', '));
      }
    }

    // Auto-close after 5 messages
    if (messageCount >= 5) {
      console.log('\n\nReceived 5 messages, closing connection...');
      ws.close();
    }

  } catch (error: any) {
    console.error('Failed to parse message:', error.message);
    console.log('Raw message:', message);
  }
});

ws.on('error', (error) => {
  console.error('\n❌ WebSocket error:', error.message);
});

ws.on('close', () => {
  console.log('\n✓ WebSocket closed');
  process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('\n⏱️ Timeout - closing connection');
  ws.close();
}, 30000);
