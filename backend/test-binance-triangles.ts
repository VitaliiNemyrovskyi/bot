/**
 * Test Binance Triangular Arbitrage - Show Valid Triangles
 */

import ccxt from 'ccxt';
import { TriangleDiscovery } from './src/lib/triangle-discovery';

async function testBinanceTriangles() {
  console.log('🔍 Testing Binance Spot Triangular Arbitrage\n');

  try {
    // Initialize Binance exchange (no credentials needed for public data)
    const exchange = new ccxt.binance({
      enableRateLimit: true,
    });

    console.log('📊 Loading Binance Spot markets...\n');
    await exchange.loadMarkets();

    // Get all spot symbols
    const allSymbols = Object.keys(exchange.markets).filter(symbol => {
      const market = exchange.markets[symbol];
      return market.spot && market.active;
    });

    console.log(`✅ Found ${allSymbols.length} active spot markets\n`);

    // Convert from CCXT format (BTC/USDT) to standard format (BTCUSDT)
    const symbols = allSymbols.map(s => s.replace('/', ''));

    console.log('🔍 Sample symbols:');
    console.log(symbols.slice(0, 20).join(', '));
    console.log('');

    // Discover triangles
    console.log('🔎 Discovering triangles...\n');
    const allTriangles = TriangleDiscovery.discoverTriangles(symbols);

    console.log(`\n📊 Total valid triangles found: ${allTriangles.length}\n`);

    if (allTriangles.length === 0) {
      console.log('❌ No triangles found!');
      return;
    }

    // Filter by USDT base
    const usdtTriangles = TriangleDiscovery.filterByBaseAsset(allTriangles, 'USDT');
    console.log(`💰 USDT-based triangles: ${usdtTriangles.length}\n`);

    // Show first 10 USDT triangles
    console.log('📋 First 10 USDT-based triangles:\n');
    for (let i = 0; i < Math.min(10, usdtTriangles.length); i++) {
      const triangle = usdtTriangles[i];
      console.log(`${i + 1}. ${triangle.assets.base} → ${triangle.assets.quote} → ${triangle.assets.bridge} → ${triangle.assets.base}`);
      console.log(`   Symbols: ${triangle.symbols.join(' → ')}`);
      console.log('');
    }

    // Show some BTC triangles
    const btcTriangles = TriangleDiscovery.filterByBaseAsset(allTriangles, 'BTC');
    console.log(`\n₿ BTC-based triangles: ${btcTriangles.length}\n`);

    if (btcTriangles.length > 0) {
      console.log('📋 First 5 BTC-based triangles:\n');
      for (let i = 0; i < Math.min(5, btcTriangles.length); i++) {
        const triangle = btcTriangles[i];
        console.log(`${i + 1}. ${triangle.assets.base} → ${triangle.assets.quote} → ${triangle.assets.bridge} → ${triangle.assets.base}`);
        console.log(`   Symbols: ${triangle.symbols.join(' → ')}`);
        console.log('');
      }
    }

    // Show some ETH triangles
    const ethTriangles = TriangleDiscovery.filterByBaseAsset(allTriangles, 'ETH');
    console.log(`\n⟠ ETH-based triangles: ${ethTriangles.length}\n`);

    if (ethTriangles.length > 0) {
      console.log('📋 First 5 ETH-based triangles:\n');
      for (let i = 0; i < Math.min(5, ethTriangles.length); i++) {
        const triangle = ethTriangles[i];
        console.log(`${i + 1}. ${triangle.assets.base} → ${triangle.assets.quote} → ${triangle.assets.bridge} → ${triangle.assets.base}`);
        console.log(`   Symbols: ${triangle.symbols.join(' → ')}`);
        console.log('');
      }
    }

    console.log('\n✅ Test complete!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testBinanceTriangles();
