/**
 * Next.js Instrumentation File
 *
 * This file runs when the Next.js server starts up.
 * It's used to initialize services and background jobs.
 *
 * Documentation: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

// Store service references for graceful shutdown
let servicesInitialized = false;
let redisService: any = null;
let fundingArbitrageService: any = null;
let bybitFundingStrategyService: any = null;
let graduatedEntryArbitrageService: any = null;
let fundingTrackerService: any = null;
let liquidationMonitorService: any = null;
let fundingRateCollector: any = null;
let fundingIntervalScheduler: any = null;

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Initializing server-side services...');

    try {
      // Initialize Redis cache for real-time data
      const redisModule = await import('@/lib/redis');
      redisService = redisModule.redisService;
      try {
        await redisService.connect();
        console.log('[Instrumentation] Redis cache initialized');
      } catch (redisError: any) {
        console.warn('[Instrumentation] Redis connection failed, continuing without cache:', redisError.message);
      }

      // Initialize funding arbitrage service to restore active subscriptions
      const fundingArbitrageModule = await import('@/services/funding-arbitrage.service');
      fundingArbitrageService = fundingArbitrageModule.fundingArbitrageService;
      await fundingArbitrageService.initialize();
      console.log('[Instrumentation] Funding arbitrage service initialized');

      // Initialize Bybit funding strategy service to restore active strategies
      const bybitFundingStrategyModule = await import('@/services/bybit-funding-strategy.service');
      bybitFundingStrategyService = bybitFundingStrategyModule.bybitFundingStrategyService;
      await bybitFundingStrategyService.initialize();
      console.log('[Instrumentation] Bybit funding strategy service initialized');

      // Initialize graduated entry arbitrage service to restore active positions
      const graduatedEntryArbitrageModule = await import('@/services/graduated-entry-arbitrage.service');
      graduatedEntryArbitrageService = graduatedEntryArbitrageModule.graduatedEntryArbitrageService;
      await graduatedEntryArbitrageService.initialize();
      console.log('[Instrumentation] Graduated entry arbitrage service initialized');

      // Initialize funding tracker service to track real funding payments
      const fundingTrackerModule = await import('@/services/funding-tracker.service');
      fundingTrackerService = fundingTrackerModule.fundingTrackerService;
      fundingTrackerService.startTracking();
      console.log('[Instrumentation] Funding tracker service started');

      // Initialize liquidation monitor service to protect positions
      const liquidationMonitorModule = await import('@/services/liquidation-monitor.service');
      liquidationMonitorService = liquidationMonitorModule.liquidationMonitorService;
      liquidationMonitorService.startMonitoring();
      console.log('[Instrumentation] Liquidation monitor service started');

      // Initialize funding rate collector to save historical data for analysis
      const fundingRateCollectorModule = await import('@/services/funding-rate-collector.service');
      fundingRateCollector = fundingRateCollectorModule.getFundingRateCollector();
      fundingRateCollector.start();
      console.log('[Instrumentation] Funding rate collector service started');

      // Initialize funding interval scheduler for hourly updates of all exchanges
      const fundingIntervalSchedulerModule = await import('@/services/funding-interval-scheduler.service');
      fundingIntervalScheduler = fundingIntervalSchedulerModule.startFundingIntervalScheduler();
      console.log('[Instrumentation] Funding interval scheduler started (hourly updates at :00)');

      servicesInitialized = true;

      // Setup graceful shutdown handlers
      setupGracefulShutdown();
    } catch (error: any) {
      console.error('[Instrumentation] Error initializing services:', error.message);
    }
  }
}

/**
 * Graceful shutdown handler
 * Ensures all connections and services are properly closed
 */
function setupGracefulShutdown() {
  const shutdown = async (signal: string) => {
    console.log(`\n[Instrumentation] Received ${signal}, starting graceful shutdown...`);

    try {
      // Stop all services
      if (fundingIntervalScheduler) {
        console.log('[Instrumentation] Stopping funding interval scheduler...');
        fundingIntervalScheduler.stop();
      }

      if (fundingRateCollector) {
        console.log('[Instrumentation] Stopping funding rate collector...');
        fundingRateCollector.stop();
      }

      if (liquidationMonitorService) {
        console.log('[Instrumentation] Stopping liquidation monitor...');
        liquidationMonitorService.stopMonitoring();
      }

      if (fundingTrackerService) {
        console.log('[Instrumentation] Stopping funding tracker...');
        fundingTrackerService.stopTracking();
      }

      // Note: WebSocket connections in services will be closed automatically
      // when the process exits, but we log for visibility

      if (redisService) {
        console.log('[Instrumentation] Disconnecting Redis...');
        await redisService.disconnect();
      }

      console.log('[Instrumentation] Graceful shutdown complete');
      process.exit(0);
    } catch (error: any) {
      console.error('[Instrumentation] Error during shutdown:', error.message);
      process.exit(1);
    }
  };

  // Handle different termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('[Instrumentation] Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Instrumentation] Unhandled rejection at:', promise, 'reason:', reason);
  });
}
