const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/app/components/login/login.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "|| '/trading'",
  "|| '/arbitrage/funding'"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Fixed login default returnUrl to /arbitrage/funding');
