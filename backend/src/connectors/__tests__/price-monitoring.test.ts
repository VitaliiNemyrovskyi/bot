/**
 * Integration Tests for Price Monitoring
 *
 * These tests demonstrate how to use the new price monitoring methods
 * for all exchange connectors (Bybit, BingX, MEXC)
 *
 * NOTE: These are integration tests that require valid API credentials
 * and network connectivity. They are intended for manual testing and
 * demonstration purposes.
 */

import { BybitConnector } from '../bybit.connector';
import { BingXConnector } from '../bingx.connector';
import { MEXCConnector } from '../mexc.connector';

describe('Price Monitoring Integration Tests', () => {
  // Test configuration
  const TEST_SYMBOL_BYBIT = 'BTCUSDT';
  const TEST_SYMBOL_BINGX = 'BTC-USDT';
  const TEST_SYMBOL_MEXC = 'BTC_USDT';
  const TEST_DURATION = 30000; // 30 seconds
  const PRICE_UPDATE_TIMEOUT = 5000; // 5 seconds

  /**
   * Bybit Price Monitoring Tests
   */
  describe('Bybit Connector', () => {
    let connector: BybitConnector;

    beforeAll(() => {
      // Initialize with test credentials
      // Replace with your actual Bybit testnet credentials
      connector = new BybitConnector(
        process.env.BYBIT_API_KEY || 'your-api-key',
        process.env.BYBIT_API_SECRET || 'your-api-secret',
        true // testnet
      );
    });

    test('should fetch current market price via REST API', async () => {
      await connector.initialize();

      const price = await connector.getMarketPrice(TEST_SYMBOL_BYBIT);

      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
      console.log(`[Bybit] Current ${TEST_SYMBOL_BYBIT} price: $${price}`);
    }, 10000);

    test('should receive real-time price updates via WebSocket', async () => {
      await connector.initialize();

      return new Promise<void>((resolve, reject) => {
        const priceUpdates: Array<{ price: number; timestamp: number }> = [];
        let unsubscribe: (() => void) | null = null;

        const timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();

          if (priceUpdates.length === 0) {
            reject(new Error('No price updates received within timeout'));
          } else {
            console.log(`[Bybit] Received ${priceUpdates.length} price updates:`);
            priceUpdates.slice(0, 5).forEach((update, i) => {
              console.log(`  ${i + 1}. $${update.price} at ${new Date(update.timestamp).toISOString()}`);
            });

            // Verify we received updates
            expect(priceUpdates.length).toBeGreaterThan(0);

            // Verify all prices are valid
            priceUpdates.forEach((update) => {
              expect(update.price).toBeGreaterThan(0);
              expect(typeof update.timestamp).toBe('number');
            });

            resolve();
          }
        }, TEST_DURATION);

        connector
          .subscribeToPriceStream(TEST_SYMBOL_BYBIT, (price, timestamp) => {
            priceUpdates.push({ price, timestamp });
            console.log(`[Bybit] Price update: $${price} at ${new Date(timestamp).toISOString()}`);
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch(reject);
      });
    }, TEST_DURATION + PRICE_UPDATE_TIMEOUT);
  });

  /**
   * BingX Price Monitoring Tests
   */
  describe('BingX Connector', () => {
    let connector: BingXConnector;

    beforeAll(() => {
      // Initialize with test credentials
      // Replace with your actual BingX credentials
      connector = new BingXConnector(
        process.env.BINGX_API_KEY || 'your-api-key',
        process.env.BINGX_API_SECRET || 'your-api-secret',
        false // BingX doesn't have testnet, use mainnet
      );
    });

    test('should fetch current market price via REST API', async () => {
      await connector.initialize();

      const price = await connector.getMarketPrice(TEST_SYMBOL_BINGX);

      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
      console.log(`[BingX] Current ${TEST_SYMBOL_BINGX} price: $${price}`);
    }, 10000);

    test('should receive real-time price updates via WebSocket', async () => {
      await connector.initialize();

      return new Promise<void>((resolve, reject) => {
        const priceUpdates: Array<{ price: number; timestamp: number }> = [];
        let unsubscribe: (() => void) | null = null;

        const timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();

          if (priceUpdates.length === 0) {
            reject(new Error('No price updates received within timeout'));
          } else {
            console.log(`[BingX] Received ${priceUpdates.length} price updates:`);
            priceUpdates.slice(0, 5).forEach((update, i) => {
              console.log(`  ${i + 1}. $${update.price} at ${new Date(update.timestamp).toISOString()}`);
            });

            // Verify we received updates
            expect(priceUpdates.length).toBeGreaterThan(0);

            // Verify all prices are valid
            priceUpdates.forEach((update) => {
              expect(update.price).toBeGreaterThan(0);
              expect(typeof update.timestamp).toBe('number');
            });

            resolve();
          }
        }, TEST_DURATION);

        connector
          .subscribeToPriceStream(TEST_SYMBOL_BINGX, (price, timestamp) => {
            priceUpdates.push({ price, timestamp });
            console.log(`[BingX] Price update: $${price} at ${new Date(timestamp).toISOString()}`);
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch(reject);
      });
    }, TEST_DURATION + PRICE_UPDATE_TIMEOUT);
  });

  /**
   * MEXC Price Monitoring Tests
   */
  describe('MEXC Connector', () => {
    let connector: MEXCConnector;

    beforeAll(() => {
      // Initialize with test credentials
      // Replace with your actual MEXC credentials
      connector = new MEXCConnector(
        process.env.MEXC_API_KEY || 'your-api-key',
        process.env.MEXC_API_SECRET || 'your-api-secret',
        false, // MEXC doesn't have testnet
        process.env.MEXC_AUTH_TOKEN // Optional browser token
      );
    });

    test('should fetch current market price via REST API', async () => {
      await connector.initialize();

      const price = await connector.getMarketPrice(TEST_SYMBOL_MEXC);

      expect(price).toBeGreaterThan(0);
      expect(typeof price).toBe('number');
      console.log(`[MEXC] Current ${TEST_SYMBOL_MEXC} price: $${price}`);
    }, 10000);

    test('should receive real-time price updates via WebSocket', async () => {
      await connector.initialize();

      return new Promise<void>((resolve, reject) => {
        const priceUpdates: Array<{ price: number; timestamp: number }> = [];
        let unsubscribe: (() => void) | null = null;

        const timeout = setTimeout(() => {
          if (unsubscribe) unsubscribe();

          if (priceUpdates.length === 0) {
            reject(new Error('No price updates received within timeout'));
          } else {
            console.log(`[MEXC] Received ${priceUpdates.length} price updates:`);
            priceUpdates.slice(0, 5).forEach((update, i) => {
              console.log(`  ${i + 1}. $${update.price} at ${new Date(update.timestamp).toISOString()}`);
            });

            // Verify we received updates
            expect(priceUpdates.length).toBeGreaterThan(0);

            // Verify all prices are valid
            priceUpdates.forEach((update) => {
              expect(update.price).toBeGreaterThan(0);
              expect(typeof update.timestamp).toBe('number');
            });

            resolve();
          }
        }, TEST_DURATION);

        connector
          .subscribeToPriceStream(TEST_SYMBOL_MEXC, (price, timestamp) => {
            priceUpdates.push({ price, timestamp });
            console.log(`[MEXC] Price update: $${price} at ${new Date(timestamp).toISOString()}`);
          })
          .then((unsub) => {
            unsubscribe = unsub;
          })
          .catch(reject);
      });
    }, TEST_DURATION + PRICE_UPDATE_TIMEOUT);
  });

  /**
   * Cross-Exchange Price Comparison Tests
   */
  describe('Cross-Exchange Price Monitoring', () => {
    let bybitConnector: BybitConnector;
    let bingxConnector: BingXConnector;
    let mexcConnector: MEXCConnector;

    beforeAll(async () => {
      bybitConnector = new BybitConnector(
        process.env.BYBIT_API_KEY || 'your-api-key',
        process.env.BYBIT_API_SECRET || 'your-api-secret',
        true
      );

      bingxConnector = new BingXConnector(
        process.env.BINGX_API_KEY || 'your-api-key',
        process.env.BINGX_API_SECRET || 'your-api-secret',
        false
      );

      mexcConnector = new MEXCConnector(
        process.env.MEXC_API_KEY || 'your-api-key',
        process.env.MEXC_API_SECRET || 'your-api-secret',
        false
      );

      await Promise.all([
        bybitConnector.initialize(),
        bingxConnector.initialize(),
        mexcConnector.initialize(),
      ]);
    });

    test('should compare prices across all three exchanges', async () => {
      const [bybitPrice, bingxPrice, mexcPrice] = await Promise.all([
        bybitConnector.getMarketPrice(TEST_SYMBOL_BYBIT),
        bingxConnector.getMarketPrice(TEST_SYMBOL_BINGX),
        mexcConnector.getMarketPrice(TEST_SYMBOL_MEXC),
      ]);

      console.log('\n=== Cross-Exchange Price Comparison ===');
      console.log(`Bybit:  $${bybitPrice.toFixed(2)}`);
      console.log(`BingX:  $${bingxPrice.toFixed(2)}`);
      console.log(`MEXC:   $${mexcPrice.toFixed(2)}`);

      // Calculate spreads
      const maxPrice = Math.max(bybitPrice, bingxPrice, mexcPrice);
      const minPrice = Math.min(bybitPrice, bingxPrice, mexcPrice);
      const spreadPercent = ((maxPrice - minPrice) / minPrice) * 100;

      console.log(`\nPrice Spread: ${spreadPercent.toFixed(4)}%`);
      console.log(`Max Price: $${maxPrice.toFixed(2)}`);
      console.log(`Min Price: $${minPrice.toFixed(2)}`);

      // Verify prices are reasonable (within 1% of each other)
      expect(spreadPercent).toBeLessThan(1.0);
    }, 15000);

    test('should monitor real-time price differences across exchanges', async () => {
      return new Promise<void>((resolve, reject) => {
        const priceData = {
          bybit: null as number | null,
          bingx: null as number | null,
          mexc: null as number | null,
        };

        const unsubscribers: Array<() => void> = [];
        let checkCount = 0;
        const MAX_CHECKS = 10;

        const checkPrices = () => {
          if (priceData.bybit && priceData.bingx && priceData.mexc) {
            checkCount++;

            const prices = [priceData.bybit, priceData.bingx, priceData.mexc];
            const maxPrice = Math.max(...prices);
            const minPrice = Math.min(...prices);
            const spread = ((maxPrice - minPrice) / minPrice) * 100;

            console.log(`\n[Check ${checkCount}/${MAX_CHECKS}] Price Arbitrage Opportunity:`);
            console.log(`  Bybit: $${priceData.bybit.toFixed(2)}`);
            console.log(`  BingX: $${priceData.bingx.toFixed(2)}`);
            console.log(`  MEXC:  $${priceData.mexc.toFixed(2)}`);
            console.log(`  Spread: ${spread.toFixed(4)}%`);

            if (checkCount >= MAX_CHECKS) {
              // Cleanup
              unsubscribers.forEach((unsub) => unsub());
              resolve();
            }
          }
        };

        // Subscribe to all three exchanges
        Promise.all([
          bybitConnector.subscribeToPriceStream(TEST_SYMBOL_BYBIT, (price) => {
            priceData.bybit = price;
            checkPrices();
          }),
          bingxConnector.subscribeToPriceStream(TEST_SYMBOL_BINGX, (price) => {
            priceData.bingx = price;
            checkPrices();
          }),
          mexcConnector.subscribeToPriceStream(TEST_SYMBOL_MEXC, (price) => {
            priceData.mexc = price;
            checkPrices();
          }),
        ])
          .then((unsubs) => {
            unsubscribers.push(...unsubs);
          })
          .catch(reject);

        // Timeout after test duration
        setTimeout(() => {
          unsubscribers.forEach((unsub) => unsub());
          if (checkCount === 0) {
            reject(new Error('No price comparisons completed within timeout'));
          } else {
            resolve();
          }
        }, TEST_DURATION);
      });
    }, TEST_DURATION + PRICE_UPDATE_TIMEOUT);
  });
});
