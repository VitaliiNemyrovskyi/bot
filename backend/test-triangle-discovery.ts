/**
 * Test triangle discovery to see symbol ordering
 */
import { TriangleDiscovery } from './src/lib/triangle-discovery';

// Simplified test with just the problematic symbols
const symbols = [
  'FLOKIUSDC',
  'FLOKIUSDT',
  'USDCUSDT',
];

console.log('Testing triangle discovery with symbols:', symbols);
console.log('');

const triangles = TriangleDiscovery.discoverTriangles(symbols);

console.log('\n=== Discovered Triangles ===\n');

triangles.forEach((triangle, index) => {
  console.log(`Triangle ${index + 1}:`);
  console.log(`  Symbols: [${triangle.symbols.join(', ')}]`);
  console.log(`  Assets: base=${triangle.assets.base}, quote=${triangle.assets.quote}, bridge=${triangle.assets.bridge}`);
  console.log('');

  // Verify the triangle construction
  console.log('  Expected symbol order based on buildTriangle logic:');
  console.log(`    symbol1 = findSymbol(${triangle.assets.base}, ${triangle.assets.quote}) should be ${triangle.symbols[0]}`);
  console.log(`    symbol2 = findSymbol(${triangle.assets.quote}, ${triangle.assets.bridge}) should be ${triangle.symbols[1]}`);
  console.log(`    symbol3 = findSymbol(${triangle.assets.bridge}, ${triangle.assets.base}) should be ${triangle.symbols[2]}`);
  console.log('');
});

console.log('=== Analysis ===');
console.log('For the calculator to work correctly:');
console.log('- symbol1 should connect base and quote');
console.log('- symbol2 should connect quote and bridge');
console.log('- symbol3 should connect bridge and base');
console.log('');
console.log('For USDT-based triangle:');
console.log('- base = USDT (starting asset)');
console.log('- quote = USDC (intermediate)');
console.log('- bridge = FLOKI (conversion asset)');
console.log('- symbol1 = USDCUSDT (connects USDT and USDC)');
console.log('- symbol2 = FLOKIUSDC (connects USDC and FLOKI)');
console.log('- symbol3 = FLOKIUSDT (connects FLOKI and USDT)');
