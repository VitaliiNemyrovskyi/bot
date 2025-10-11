const PROXY_CONFIG = [
  {
    context: ['/api'],
    target: 'http://localhost:3000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    timeout: 180000
  },
  {
    context: ['/placeholder'],
    target: 'https://picsum.photos',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    followRedirects: true,
    pathRewrite: {
      '^/placeholder/(.*)': '/$1/$1'
    }
  }
];

module.exports = PROXY_CONFIG;