const fs = require('fs');
const path = require('path');

console.log('Fixing bybit-user-info-example.ts...\n');

const file = path.join(__dirname, 'src/lib/bybit-user-info-example.ts');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Fix the problematic line 367
  content = content.replace(
    /console\.log\(`Environment: \$\{false \/\/ Testnet is deprecated \? 'TESTNET' : 'MAINNET'\}`\);/,
    "console.log(`Environment: MAINNET`); // Testnet is deprecated"
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('✓ Fixed src/lib/bybit-user-info-example.ts');
  } else {
    console.log('✗ No changes made - pattern not found');
    console.log('Looking for the line...');

    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('Environment:') && line.includes('false')) {
        console.log(`  Found at line ${index + 1}: ${line.trim()}`);
      }
    });
  }
} else {
  console.log('File not found!');
}

console.log('\nDone!');
