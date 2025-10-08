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
    } catch (error: any) {
      console.error('[Instrumentation] Error initializing services:', error.message);
    }
  }
}
