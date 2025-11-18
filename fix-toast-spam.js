const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/app/components/trading/arbitrage-chart/arbitrage-chart.component.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the error handling section to remove toast spam
const oldCode = `      // Only show error if it's not a "no credentials" or "no positions" error
      const errorMessage = error.message || 'Unknown error';
      if (!errorMessage.includes('credentials') && !errorMessage.includes('No matching')) {
        this.toastService.error(
          this.translationService.translate('arbitrage.positionDetectionError') ||
          'Failed to check for existing positions'
        );
      }`;

const newCode = `      // NOTE: Not showing error toast to avoid spamming user with background errors`;

content = content.replace(oldCode, newCode);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Fixed toast spam in arbitrage-chart component');
