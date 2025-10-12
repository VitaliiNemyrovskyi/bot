/**
 * Price Monitoring Usage Examples
 *
 * This file demonstrates how to use the new price monitoring functionality
 * for real-time price arbitrage detection across multiple exchanges.
 */

import { BybitConnector } from '../connectors/bybit.connector';
import { BingXConnector } from '../connectors/bingx.connector';
import { MEXCConnector } from '../connectors/mexc.connector';

/**
 * Example 1: Fetch current market price (REST API)
 */
async function example1_FetchCurrentPrice() {
  console.log('\n=== Example 1: Fetch Current Market Price ===\n');

  // Initialize Bybit connector
  const connector = new BybitConnector(
    process.env.BYBIT_API_KEY!,
    process.env.BYBIT_API_SECRET!,
    true // testnet
  );

  await connector.initialize();

  // Fetch current BTC price
  const price = await connector.getMarketPrice('BTCUSDT');
  console.log(`Current BTC price on Bybit: $${price}`);
}

/**
 * Example 2: Subscribe to real-time price updates (WebSocket)
 */
async function example2_RealTimePriceStream() {
  console.log('\n=== Example 2: Real-Time Price Stream ===\n');

  const connector = new BybitConnector(
    process.env.BYBIT_API_KEY!,
    process.env.BYBIT_API_SECRET!,
    true
  );

  await connector.initialize();

  // Subscribe to price stream
  const unsubscribe = await connector.subscribeToPriceStream(
    'BTCUSDT',
    (price, timestamp) => {
      console.log(`Price update: $${price} at ${new Date(timestamp).toISOString()}`);
    }
  );

  // Let it run for 30 seconds
  setTimeout(() => {
    console.log('\nUnsubscribing from price stream...');
    unsubscribe();
  }, 30000);
}

/**
 * Example 3: Monitor price differences across exchanges
 */
async function example3_CrossExchangePriceMonitoring() {
  console.log('\n=== Example 3: Cross-Exchange Price Monitoring ===\n');

  // Initialize all three connectors
  const bybit = new BybitConnector(
    process.env.BYBIT_API_KEY!,
    process.env.BYBIT_API_SECRET!,
    true
  );

  const bingx = new BingXConnector(
    process.env.BINGX_API_KEY!,
    process.env.BINGX_API_SECRET!,
    false
  );

  const mexc = new MEXCConnector(
    process.env.MEXC_API_KEY!,
    process.env.MEXC_API_SECRET!,
    false
  );

  // Initialize all
  await Promise.all([bybit.initialize(), bingx.initialize(), mexc.initialize()]);

  // Track latest prices
  const latestPrices = {
    bybit: 0,
    bingx: 0,
    mexc: 0,
  };

  // Subscribe to all exchanges
  const unsubscribeBybit = await bybit.subscribeToPriceStream('BTCUSDT', (price) => {
    latestPrices.bybit = price;
    checkArbitrage();
  });

  const unsubscribeBingX = await bingx.subscribeToPriceStream('BTC-USDT', (price) => {
    latestPrices.bingx = price;
    checkArbitrage();
  });

  const unsubscribeMEXC = await mexc.subscribeToPriceStream('BTC_USDT', (price) => {
    latestPrices.mexc = price;
    checkArbitrage();
  });

  // Check for arbitrage opportunities
  function checkArbitrage() {
    if (latestPrices.bybit === 0 || latestPrices.bingx === 0 || latestPrices.mexc === 0) {
      return; // Wait for all prices to be available
    }

    const prices = [
      { exchange: 'Bybit', price: latestPrices.bybit },
      { exchange: 'BingX', price: latestPrices.bingx },
      { exchange: 'MEXC', price: latestPrices.mexc },
    ];

    // Find highest and lowest
    const highest = prices.reduce((max, p) => (p.price > max.price ? p : max));
    const lowest = prices.reduce((min, p) => (p.price < min.price ? p : min));

    // Calculate spread
    const spread = ((highest.price - lowest.price) / lowest.price) * 100;

    console.log(`\n[${new Date().toISOString()}] Price Comparison:`);
    console.log(`  Bybit: $${latestPrices.bybit.toFixed(2)}`);
    console.log(`  BingX: $${latestPrices.bingx.toFixed(2)}`);
    console.log(`  MEXC:  $${latestPrices.mexc.toFixed(2)}`);
    console.log(`  Spread: ${spread.toFixed(4)}% (${highest.exchange} - ${lowest.exchange})`);

    // Alert if spread is significant (> 0.1%)
    if (spread > 0.1) {
      console.log(`  >>> ARBITRAGE OPPORTUNITY DETECTED! <<<`);
      console.log(`      Buy on ${lowest.exchange} at $${lowest.price.toFixed(2)}`);
      console.log(`      Sell on ${highest.exchange} at $${highest.price.toFixed(2)}`);
      console.log(`      Potential profit: ${spread.toFixed(4)}%`);
    }
  }

  // Run for 60 seconds
  setTimeout(() => {
    console.log('\nStopping price monitoring...');
    unsubscribeBybit();
    unsubscribeBingX();
    unsubscribeMEXC();
  }, 60000);
}

/**
 * Example 4: Price alert system
 */
async function example4_PriceAlertSystem() {
  console.log('\n=== Example 4: Price Alert System ===\n');

  const connector = new BybitConnector(
    process.env.BYBIT_API_KEY!,
    process.env.BYBIT_API_SECRET!,
    true
  );

  await connector.initialize();

  // Set alert thresholds
  const ALERT_HIGH = 50000; // Alert if price goes above $50,000
  const ALERT_LOW = 45000; // Alert if price goes below $45,000

  let lastAlertTime = 0;
  const ALERT_COOLDOWN = 60000; // 1 minute cooldown between alerts

  const unsubscribe = await connector.subscribeToPriceStream(
    'BTCUSDT',
    (price, timestamp) => {
      const now = Date.now();

      // Check if cooldown period has passed
      if (now - lastAlertTime < ALERT_COOLDOWN) {
        return;
      }

      // High price alert
      if (price > ALERT_HIGH) {
        console.log(`\n🔴 HIGH PRICE ALERT! 🔴`);
        console.log(`BTC price: $${price} (above $${ALERT_HIGH})`);
        console.log(`Time: ${new Date(timestamp).toISOString()}\n`);
        lastAlertTime = now;
      }

      // Low price alert
      if (price < ALERT_LOW) {
        console.log(`\n🟢 LOW PRICE ALERT! 🟢`);
        console.log(`BTC price: $${price} (below $${ALERT_LOW})`);
        console.log(`Time: ${new Date(timestamp).toISOString()}\n`);
        lastAlertTime = now;
      }

      // Regular price updates (every 10 seconds)
      if (now % 10000 < 1000) {
        console.log(`Current price: $${price}`);
      }
    }
  );

  // Run for 5 minutes
  setTimeout(() => {
    console.log('\nStopping price alerts...');
    unsubscribe();
  }, 300000);
}

/**
 * Example 5: Price volatility tracker
 */
async function example5_PriceVolatilityTracker() {
  console.log('\n=== Example 5: Price Volatility Tracker ===\n');

  const connector = new BybitConnector(
    process.env.BYBIT_API_KEY!,
    process.env.BYBIT_API_SECRET!,
    true
  );

  await connector.initialize();

  const priceHistory: number[] = [];
  const HISTORY_SIZE = 60; // Track last 60 price updates

  const unsubscribe = await connector.subscribeToPriceStream(
    'BTCUSDT',
    (price, timestamp) => {
      // Add to history
      priceHistory.push(price);
      if (priceHistory.length > HISTORY_SIZE) {
        priceHistory.shift();
      }

      // Calculate volatility metrics every 10 updates
      if (priceHistory.length >= 10 && priceHistory.length % 10 === 0) {
        const avg = priceHistory.reduce((sum, p) => sum + p, 0) / priceHistory.length;
        const max = Math.max(...priceHistory);
        const min = Math.min(...priceHistory);
        const range = max - min;
        const rangePercent = (range / avg) * 100;

        // Calculate standard deviation
        const variance =
          priceHistory.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) /
          priceHistory.length;
        const stdDev = Math.sqrt(variance);
        const stdDevPercent = (stdDev / avg) * 100;

        console.log(`\n[${new Date(timestamp).toISOString()}] Volatility Analysis:`);
        console.log(`  Current Price: $${price.toFixed(2)}`);
        console.log(`  Average Price: $${avg.toFixed(2)}`);
        console.log(`  Price Range: $${min.toFixed(2)} - $${max.toFixed(2)} (${rangePercent.toFixed(4)}%)`);
        console.log(`  Std Deviation: ${stdDevPercent.toFixed(4)}%`);
        console.log(`  Samples: ${priceHistory.length}`);

        // Volatility alert
        if (stdDevPercent > 0.5) {
          console.log(`  >>> HIGH VOLATILITY DETECTED! <<<`);
        }
      }
    }
  );

  // Run for 5 minutes
  setTimeout(() => {
    console.log('\nStopping volatility tracker...');
    unsubscribe();
  }, 300000);
}

// Main function to run examples
async function main() {
  const exampleNumber = process.argv[2];

  switch (exampleNumber) {
    case '1':
      await example1_FetchCurrentPrice();
      break;
    case '2':
      await example2_RealTimePriceStream();
      break;
    case '3':
      await example3_CrossExchangePriceMonitoring();
      break;
    case '4':
      await example4_PriceAlertSystem();
      break;
    case '5':
      await example5_PriceVolatilityTracker();
      break;
    default:
      console.log('Usage: npm run example:price <example-number>');
      console.log('\nAvailable examples:');
      console.log('  1 - Fetch Current Market Price');
      console.log('  2 - Real-Time Price Stream');
      console.log('  3 - Cross-Exchange Price Monitoring');
      console.log('  4 - Price Alert System');
      console.log('  5 - Price Volatility Tracker');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Error running example:', error);
    process.exit(1);
  });
}

export {
  example1_FetchCurrentPrice,
  example2_RealTimePriceStream,
  example3_CrossExchangePriceMonitoring,
  example4_PriceAlertSystem,
  example5_PriceVolatilityTracker,
};
