import { BybitService, bybitService } from './bybit';

/**
 * Example usage of the Bybit service
 * This file demonstrates how to use various Bybit API functionalities
 */

async function exampleUsage() {
  try {
    // Check if credentials are configured
    if (!bybitService.hasCredentials()) {
      console.log('⚠️  Bybit API credentials not configured');
      console.log('Add BYBIT_API_KEY and BYBIT_API_SECRET to your .env file');
      return;
    }

    console.log(`🔗 Connected to Bybit ${bybitService.isTestnet() ? 'Testnet' : 'Mainnet'}`);

    // 1. Get account information
    console.log('\n📊 Fetching account info...');
    const accountInfo = await bybitService.getAccountInfo();
    console.log('Total Equity:', accountInfo.totalEquity);
    console.log('Total Available Balance:', accountInfo.totalAvailableBalance);

    // 2. Get wallet balance
    console.log('\n💰 Fetching wallet balance...');
    const walletBalance = await bybitService.getWalletBalance('UNIFIED');
    console.log('Wallet Balance:', walletBalance);

    // 3. Get market ticker for BTCUSDT
    console.log('\n📈 Fetching BTCUSDT ticker...');
    const tickers = await bybitService.getTicker('linear', 'BTCUSDT');
    if (tickers.length > 0) {
      const ticker = tickers[0];
      console.log(`${ticker.symbol}: $${ticker.lastPrice} (24h: ${ticker.price24hPcnt}%)`);
    }

    // 4. Get current positions
    console.log('\n📍 Fetching current positions...');
    const positions = await bybitService.getPositions('linear');
    console.log(`Found ${positions.length} positions`);
    positions.forEach(pos => {
      if (parseFloat(pos.size) > 0) {
        console.log(`${pos.symbol} ${pos.side}: ${pos.size} @ $${pos.entryPrice} (PnL: ${pos.unrealisedPnl})`);
      }
    });

    // 5. Get active orders
    console.log('\n📋 Fetching active orders...');
    const orders = await bybitService.getOrders('linear');
    console.log(`Found ${orders.length} active orders`);
    orders.forEach(order => {
      console.log(`${order.symbol} ${order.side} ${order.orderType}: ${order.qty} @ $${order.price} (${order.orderStatus})`);
    });

    // 6. Get kline data (candlestick chart)
    console.log('\n📊 Fetching BTCUSDT 1-hour klines...');
    const klineData = await bybitService.getKline('linear', 'BTCUSDT', '60', undefined, undefined, 5);
    console.log(`Received ${klineData.list.length} kline entries`);
    if (klineData.list.length > 0) {
      const latest = klineData.list[0];
      console.log(`Latest: Open: $${latest[1]}, High: $${latest[2]}, Low: $${latest[3]}, Close: $${latest[4]}`);
    }

    // 7. Example of placing a limit order (commented out for safety)
    /*
    console.log('\n📤 Placing a test limit order...');
    const orderResult = await bybitService.placeOrder({
      category: 'linear',
      symbol: 'BTCUSDT',
      side: 'Buy',
      orderType: 'Limit',
      qty: '0.001',
      price: '30000', // Very low price to avoid accidental execution
      timeInForce: 'GTC'
    });
    console.log('Order placed:', orderResult);
    */

  } catch (error) {
    console.error('❌ Error in example usage:', error);
  }
}

/**
 * Example of WebSocket usage
 */
async function exampleWebSocketUsage() {
  try {
    if (!bybitService.hasCredentials()) {
      console.log('⚠️  API credentials required for WebSocket functionality');
      return;
    }

    console.log('🔌 Setting up WebSocket subscriptions...');

    // Subscribe to BTCUSDT ticker updates
    bybitService.subscribeToTicker('BTCUSDT', (data) => {
      console.log('📡 Ticker update:', data);
    });

    // Subscribe to position updates
    bybitService.subscribeToPositions((data) => {
      console.log('📍 Position update:', data);
    });

    // Subscribe to order updates
    bybitService.subscribeToOrders((data) => {
      console.log('📋 Order update:', data);
    });

    // Keep the script running to receive updates
    console.log('✅ WebSocket subscriptions active. Press Ctrl+C to stop.');

    // Cleanup on exit
    process.on('SIGINT', () => {
      console.log('\n🔌 Closing WebSocket connections...');
      bybitService.unsubscribeAll();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ WebSocket error:', error);
  }
}

/**
 * Example of creating a new Bybit service instance with custom configuration
 */
function exampleCustomInstance() {
  const customBybit = new BybitService({
    apiKey: 'your-api-key',
    apiSecret: 'your-api-secret',
    testnet: true,
    enableRateLimit: true
  });

  console.log('Created custom Bybit service instance');
  console.log('Is testnet:', customBybit.isTestnet());
  console.log('Has credentials:', customBybit.hasCredentials());
}

// Run examples
if (require.main === module) {
  console.log('🚀 Running Bybit Service Examples\n');
  exampleUsage();

  // Uncomment to test WebSocket functionality
  // setTimeout(() => exampleWebSocketUsage(), 2000);
}

export { exampleUsage, exampleWebSocketUsage, exampleCustomInstance };