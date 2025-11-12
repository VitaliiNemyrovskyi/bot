const path = require('path');

module.exports = {
  inputDir: path.resolve(__dirname, 'src', 'assets', 'icons'),
  outputDir: path.resolve(__dirname, 'src', 'assets', 'fonts'),
  fontTypes: ['woff2', 'woff', 'ttf'],
  assetTypes: ['css'],
  name: 'ui-icons',
  prefix: 'ui-icon',
  codepoints: {},
  fontHeight: 1000,
  descent: 0,
  normalize: true,
  round: 0,
  selector: '.ui-icon',
  tag: 'i',
  pathOptions: {
    css: path.resolve(__dirname, 'src', 'assets', 'fonts', 'ui-icons.css')
  }
};
