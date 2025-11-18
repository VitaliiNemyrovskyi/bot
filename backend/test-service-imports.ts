/**
 * Test which services fail to import
 */

async function testServiceImports() {
  const services = [
    { name: 'Prisma', path: './src/lib/prisma' },
    { name: 'Redis', path: './src/lib/redis' },
    { name: 'Funding Arbitrage', path: './src/services/funding-arbitrage.service' },
    { name: 'Bybit Funding Strategy', path: './src/services/bybit-funding-strategy.service' },
    { name: 'Graduated Entry', path: './src/services/graduated-entry-arbitrage.service' },
    { name: 'Funding Tracker', path: './src/services/funding-tracker.service' },
    { name: 'Liquidation Monitor', path: './src/services/liquidation-monitor.service' },
    { name: 'Funding Rate Collector', path: './src/services/funding-rate-collector.service' },
    { name: 'Funding Interval Scheduler', path: './src/services/funding-interval-scheduler.service' },
    { name: 'Auto Recorder', path: './src/scripts/auto-record-funding-data' },
  ];

  console.log('Testing service imports...\n');

  for (const service of services) {
    try {
      await import(service.path);
      console.log(`✓ ${service.name}`);
    } catch (error: any) {
      console.log(`✗ ${service.name}`);
      console.log(`  Error: ${error.message}`);
      if (error.stack) {
        const stack = error.stack.split('\n').slice(0, 3).join('\n');
        console.log(`  Stack: ${stack}`);
      }
      console.log('');
    }
  }
}

testServiceImports().catch(console.error);
