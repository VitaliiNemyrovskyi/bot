const fs = require('fs');
const path = require('path');

console.log('Fixing TypeScript syntax errors...\n');

// Fix bybit-example.ts
const file1 = path.join(__dirname, 'src/lib/bybit-example.ts');
if (fs.existsSync(file1)) {
  let content = fs.readFileSync(file1, 'utf8');
  const originalContent = content;

  // Fix the problematic line
  content = content.replace(
    /console\.log\(`🔗 Connected to Bybit \$\{false \/\/ Testnet is deprecated \? 'Testnet' : 'Mainnet'\}`\);/,
    "console.log(`🔗 Connected to Bybit Mainnet`); // Testnet is deprecated"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file1, content, 'utf8');
    console.log('✓ Fixed src/lib/bybit-example.ts');
  } else {
    console.log('  src/lib/bybit-example.ts - no changes needed');
  }
}

// Fix bybit-user-info-example.ts - check line 369
const file2 = path.join(__dirname, 'src/lib/bybit-user-info-example.ts');
if (fs.existsSync(file2)) {
  let content = fs.readFileSync(file2, 'utf8');
  const lines = content.split('\n');

  if (lines.length > 369) {
    console.log(`  Line 369 in bybit-user-info-example.ts: "${lines[368].trim()}"`);
    console.log('  Manual check needed for this file');
  }
}

console.log('\nDone!');
