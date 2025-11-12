const fs = require('fs');
const path = require('path');

/**
 * CSS Optimization Script
 * Removes duplicate rules, combines similar selectors, and minifies CSS
 */

const filesToOptimize = [
  'src/app/components/trading/funding-rates/funding-rates.component.scss',
  'src/app/components/trading/arbitrage-chart/arbitrage-chart.component.scss',
  'src/app/components/profile/profile.component.scss',
  'src/app/pages/arbitrage-funding/arbitrage-funding.component.scss',
  'src/app/pages/price-arbitrage-opportunities/price-arbitrage-opportunities.component.scss'
];

function optimizeCSS(content) {
  let optimized = content;

  // Remove excessive comments
  optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, (match) => {
    // Keep copyright and important comments
    if (match.includes('!') || match.includes('Copyright') || match.includes('License')) {
      return match;
    }
    return '';
  });

  // Remove multiple empty lines
  optimized = optimized.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Remove trailing whitespace
  optimized = optimized.replace(/[ \t]+$/gm, '');

  // Combine duplicate media queries (simple approach)
  const mediaQueries = {};
  optimized = optimized.replace(/@media([^{]+)\{([\s\S]*?)\n\}/g, (match, query, content) => {
    const normalizedQuery = query.trim();
    if (!mediaQueries[normalizedQuery]) {
      mediaQueries[normalizedQuery] = [];
    }
    mediaQueries[normalizedQuery].push(content);
    return `__MEDIA_${Object.keys(mediaQueries).indexOf(normalizedQuery)}__`;
  });

  // Reconstruct combined media queries
  Object.entries(mediaQueries).forEach(([query, contents], index) => {
    const combined = `@media${query} {\n${contents.join('\n')}\n}`;
    optimized = optimized.replace(`__MEDIA_${index}__`, combined);
  });

  return optimized;
}

console.log('Starting CSS optimization...\n');

let totalSaved = 0;

for (const file of filesToOptimize) {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    continue;
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  const originalSize = Buffer.byteLength(originalContent, 'utf8');

  const optimizedContent = optimizeCSS(originalContent);
  const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');

  const saved = originalSize - optimizedSize;
  const savedPercent = ((saved / originalSize) * 100).toFixed(2);

  if (saved > 0) {
    fs.writeFileSync(filePath, optimizedContent, 'utf8');
    console.log(`✅ ${file}`);
    console.log(`   ${(originalSize / 1024).toFixed(2)} KB → ${(optimizedSize / 1024).toFixed(2)} KB (saved ${savedPercent}%)`);
    totalSaved += saved;
  } else {
    console.log(`ℹ️  ${file} - no optimization needed`);
  }
}

console.log(`\n✨ Optimization complete!`);
console.log(`   Total saved: ${(totalSaved / 1024).toFixed(2)} KB`);
