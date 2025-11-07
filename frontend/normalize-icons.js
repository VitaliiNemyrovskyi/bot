const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');

// Standard viewBox for icon fonts
const STANDARD_VIEWBOX = '0 0 24 24';

console.log('Normalizing icon viewBox to 0 0 24 24...\n');

const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

let normalized = 0;

files.forEach(file => {
  const filePath = path.join(iconsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check current viewBox
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);

  if (viewBoxMatch) {
    const currentViewBox = viewBoxMatch[1];

    if (currentViewBox !== STANDARD_VIEWBOX) {
      // Replace viewBox
      content = content.replace(/viewBox="[^"]+"/, `viewBox="${STANDARD_VIEWBOX}"`);

      // Remove width and height attributes if present
      content = content.replace(/\s+width="[^"]*"/, '');
      content = content.replace(/\s+height="[^"]*"/, '');

      // Ensure xmlns is present
      if (!content.includes('xmlns=')) {
        content = content.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // Save normalized SVG
      fs.writeFileSync(filePath, content);

      console.log(`✓ ${file}: ${currentViewBox} → ${STANDARD_VIEWBOX}`);
      normalized++;
    } else {
      console.log(`- ${file}: already normalized`);
    }
  } else {
    console.log(`⚠ ${file}: no viewBox found`);
  }
});

console.log(`\n========================================`);
console.log(`✓ Normalized: ${normalized} icons`);
console.log(`✓ Total icons: ${files.length}`);
console.log(`========================================`);
