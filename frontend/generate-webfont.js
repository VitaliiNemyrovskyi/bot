const webfont = require('webfont').default;
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'src', 'assets', 'icons');
const fontsDir = path.join(__dirname, 'src', 'assets', 'fonts');

// Ensure fonts directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Use glob pattern with forward slashes
const filesPattern = `${iconsDir.replace(/\\/g, '/')}/*.svg`;

console.log(`Looking for: ${filesPattern}`);

webfont({
  files: filesPattern,
  fontName: 'ui-icons',
  formats: ['woff2', 'woff', 'ttf'],
  fontHeight: 1000,
  descent: 0,
  normalize: true,
  centerHorizontally: true
})
  .then(result => {
    // Write font files
    ['woff2', 'woff', 'ttf'].forEach(format => {
      if (result[format]) {
        const fontPath = path.join(fontsDir, `ui-icons.${format}`);
        fs.writeFileSync(fontPath, result[format]);
        console.log(`✓ Created: ${fontPath}`);
      }
    });

    // Generate CSS
    const css = generateCSS(result.glyphsData);
    const cssPath = path.join(fontsDir, 'ui-icons.css');
    fs.writeFileSync(cssPath, css);
    console.log(`✓ Created: ${cssPath}`);

    console.log('\n✓ Icon font generated successfully!');
    console.log(`✓ Total icons: ${result.glyphsData.length}`);
  })
  .catch(error => {
    console.error('Failed to generate icon font:', error);
    process.exit(1);
  });

function generateCSS(glyphs) {
  let css = `@font-face {
  font-family: 'ui-icons';
  src: url('./ui-icons.woff2') format('woff2'),
       url('./ui-icons.woff') format('woff'),
       url('./ui-icons.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.ui-icon {
  font-family: 'ui-icons' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

`;

  glyphs.forEach(glyph => {
    const iconName = path.basename(glyph.metadata.path, '.svg');
    const unicode = glyph.metadata.unicode[0];
    const hex = unicode.charCodeAt(0).toString(16);

    css += `.ui-icon-${iconName}::before {
  content: "\\${hex}";
}

`;
  });

  return css;
}
