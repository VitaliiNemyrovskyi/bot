/**
 * Next.js Instrumentation File
 *
 * This file runs when the Next.js server starts up.
 * It's used to initialize services and background jobs.
 *
 * Documentation: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Initializing server-side services...');

    try {
      // Initialize funding arbitrage service to restore active subscriptions
      const { fundingArbitrageService } = await import('@/services/funding-arbitrage.service');
      await fundingArbitrageService.initialize();
      console.log('[Instrumentation] Funding arbitrage service initialized');

      // Initialize Bybit funding strategy service to restore active strategies
      const { bybitFundingStrategyService } = await import('@/services/bybit-funding-strategy.service');
      await bybitFundingStrategyService.initialize();
      console.log('[Instrumentation] Bybit funding strategy service initialized');

      // Initialize graduated entry arbitrage service to restore active positions
      const { graduatedEntryArbitrageService } = await import('@/services/graduated-entry-arbitrage.service');
      await graduatedEntryArbitrageService.initialize();
      console.log('[Instrumentation] Graduated entry arbitrage service initialized');

      // Initialize funding tracker service to track real funding payments
      const { fundingTrackerService } = await import('@/services/funding-tracker.service');
      fundingTrackerService.startTracking();
      console.log('[Instrumentation] Funding tracker service started');
    } catch (error: any) {
      console.error('[Instrumentation] Error initializing services:', error.message);
    }
  }
}
