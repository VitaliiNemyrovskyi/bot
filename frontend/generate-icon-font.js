const generateFonts = require('icon-font-generator');

const options = {
  name: 'ui-icons',
  fontName: 'ui-icons',
  types: ['woff2', 'woff', 'ttf'],
  fontHeight: 1000,
  normalize: true,
  descent: 0,
  centerHorizontally: true,
  fixedWidth: false,
  centerVertically: false,
  cssTemplate: './icon-font-template.hbs',
  dest: './src/assets/fonts/',
  writeFiles: true,
  html: true,
  htmlTemplate: './icon-font-demo-template.hbs',
  htmlDest: './src/assets/fonts/',
  cssPrefix: 'ui-icon',
  cssFontsUrl: './fonts/',
  cssDest: './src/assets/fonts/ui-icons.css',
  cssTemplate: undefined, // Will use default template
};

generateFonts(
  ['./src/assets/icons/*.svg'],
  options,
  (err) => {
    if (err) {
      console.error('Failed to generate icon font:', err);
      process.exit(1);
    }
    console.log('✓ Icon font generated successfully!');
    console.log('✓ Font files: src/assets/fonts/ui-icons.*');
    console.log('✓ CSS file: src/assets/fonts/ui-icons.css');
  }
);
