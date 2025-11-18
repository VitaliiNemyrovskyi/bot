const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/instrumentation.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Comment out all service initializations except Prisma
const services = [
  'Redis cache',
  'funding arbitrage service',
  'Bybit funding strategy service',
  'graduated entry arbitrage service',
  'funding tracker service',
  'liquidation monitor service',
  'funding rate collector service',
  'funding interval scheduler',
  'auto-recorder'
];

// Comment out Redis initialization
content = content.replace(
  /\/\/ Initialize Redis cache for real-time data[\s\S]*?console\.warn\('\[Instrumentation\] Redis connection failed, continuing without cache:', redisError\.message\);\s*}/,
  `// Initialize Redis cache for real-time data
      // TEMPORARILY DISABLED - causing connection errors
      /* const redisModule = await import('@/lib/redis');
      redisService = redisModule.redisService;
      try {
        await redisService.connect();
        console.log('[Instrumentation] Redis cache initialized');
      } catch (redisError: any) {
        console.warn('[Instrumentation] Redis connection failed, continuing without cache:', redisError.message);
      } */
      console.log('[Instrumentation] Redis initialization skipped (temporarily disabled)');`
);

// Comment out funding arbitrage service
content = content.replace(
  /\/\/ Initialize funding arbitrage service[\s\S]*?console\.log\('\[Instrumentation\] Funding arbitrage service initialized'\);/,
  `// Initialize funding arbitrage service
      // TEMPORARILY DISABLED
      /* const fundingArbitrageModule = await import('@/services/funding-arbitrage.service');
      fundingArbitrageService = fundingArbitrageModule.fundingArbitrageService;
      await fundingArbitrageService.initialize();
      console.log('[Instrumentation] Funding arbitrage service initialized'); */
      console.log('[Instrumentation] Funding arbitrage service skipped (temporarily disabled)');`
);

// Comment out Bybit funding strategy
content = content.replace(
  /\/\/ Initialize Bybit funding strategy service[\s\S]*?console\.log\('\[Instrumentation\] Bybit funding strategy service initialized'\);/,
  `// Initialize Bybit funding strategy service to restore active strategies
      // TEMPORARILY DISABLED
      /* const bybitFundingStrategyModule = await import('@/services/bybit-funding-strategy.service');
      bybitFundingStrategyService = bybitFundingStrategyModule.bybitFundingStrategyService;
      await bybitFundingStrategyService.initialize();
      console.log('[Instrumentation] Bybit funding strategy service initialized'); */
      console.log('[Instrumentation] Bybit funding strategy service skipped (temporarily disabled)');`
);

// Comment out graduated entry arbitrage
content = content.replace(
  /\/\/ Initialize graduated entry arbitrage service[\s\S]*?console\.log\('\[Instrumentation\] Graduated entry arbitrage service initialized'\);/,
  `// Initialize graduated entry arbitrage service to restore active positions
      // TEMPORARILY DISABLED
      /* const graduatedEntryArbitrageModule = await import('@/services/graduated-entry-arbitrage.service');
      graduatedEntryArbitrageService = graduatedEntryArbitrageModule.graduatedEntryArbitrageService;
      await graduatedEntryArbitrageService.initialize();
      console.log('[Instrumentation] Graduated entry arbitrage service initialized'); */
      console.log('[Instrumentation] Graduated entry arbitrage service skipped (temporarily disabled)');`
);

// Comment out funding tracker
content = content.replace(
  /\/\/ Initialize funding tracker service[\s\S]*?console\.log\('\[Instrumentation\] Funding tracker service started'\);/,
  `// Initialize funding tracker service to track real funding payments
      // TEMPORARILY DISABLED
      /* const fundingTrackerModule = await import('@/services/funding-tracker.service');
      fundingTrackerService = fundingTrackerModule.fundingTrackerService;
      fundingTrackerService.startTracking();
      console.log('[Instrumentation] Funding tracker service started'); */
      console.log('[Instrumentation] Funding tracker service skipped (temporarily disabled)');`
);

// Comment out liquidation monitor
content = content.replace(
  /\/\/ Initialize liquidation monitor service[\s\S]*?console\.log\('\[Instrumentation\] Liquidation monitor service started'\);/,
  `// Initialize liquidation monitor service to protect positions
      // TEMPORARILY DISABLED
      /* const liquidationMonitorModule = await import('@/services/liquidation-monitor.service');
      liquidationMonitorService = liquidationMonitorModule.liquidationMonitorService;
      liquidationMonitorService.startMonitoring();
      console.log('[Instrumentation] Liquidation monitor service started'); */
      console.log('[Instrumentation] Liquidation monitor service skipped (temporarily disabled)');`
);

// Comment out funding rate collector
content = content.replace(
  /\/\/ Initialize funding rate collector[\s\S]*?console\.log\('\[Instrumentation\] Funding rate collector service started'\);/,
  `// Initialize funding rate collector to save historical data for analysis
      // TEMPORARILY DISABLED - was causing massive Prisma errors
      /* const fundingRateCollectorModule = await import('@/services/funding-rate-collector.service');
      fundingRateCollector = fundingRateCollectorModule.getFundingRateCollector();
      fundingRateCollector.start();
      console.log('[Instrumentation] Funding rate collector service started'); */
      console.log('[Instrumentation] Funding rate collector service skipped (temporarily disabled)');`
);

// Comment out funding interval scheduler
content = content.replace(
  /\/\/ Initialize funding interval scheduler[\s\S]*?console\.log\('\[Instrumentation\] Funding interval scheduler started \(hourly updates at :00\)'\);/,
  `// Initialize funding interval scheduler for hourly updates of all exchanges
      // TEMPORARILY DISABLED
      /* const fundingIntervalSchedulerModule = await import('@/services/funding-interval-scheduler.service');
      fundingIntervalScheduler = fundingIntervalSchedulerModule.startFundingIntervalScheduler();
      console.log('[Instrumentation] Funding interval scheduler started (hourly updates at :00)'); */
      console.log('[Instrumentation] Funding interval scheduler skipped (temporarily disabled)');`
);

// Comment out auto-recorder
content = content.replace(
  /\/\/ Initialize auto-recorder[\s\S]*?console\.log\('\[Instrumentation\] Auto-recorder service started \(monitors funding rates >= 1%\)'\);\s*}/,
  `// Initialize auto-recorder for funding payment streams
      // TEMPORARILY DISABLED
      /* const autoRecorderModule = await import('@/scripts/auto-record-funding-data');
      autoRecorder = autoRecorderModule.autoRecorder;
      if (autoRecorder) {
        await autoRecorder.start();
        console.log('[Instrumentation] Auto-recorder service started (monitors funding rates >= 1%)');
      } */
      console.log('[Instrumentation] Auto-recorder service skipped (temporarily disabled)');`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Disabled all background services in instrumentation.ts');
console.log('✓ Only Prisma database connection remains active');
console.log('✓ This should fix the 500 errors and allow login to work');
console.log('\n⚠️  Remember to re-enable services later after fixing the root cause');
