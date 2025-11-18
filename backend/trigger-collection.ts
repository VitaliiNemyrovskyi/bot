/**
 * Manually trigger funding rate collection to update BITGET markPrice
 */
import { getFundingRateCollector } from './src/services/funding-rate-collector.service';

async function triggerCollection() {
  console.log('[Manual] Starting funding rate collection...');

  const collector = getFundingRateCollector();

  // Trigger collection for all exchanges
  try {
    // @ts-ignore - accessing private method for manual trigger
    await collector.collectAllFundingRates();
    console.log('[Manual] ✓ Collection completed successfully!');
  } catch (error: any) {
    console.error('[Manual] Error during collection:', error.message);
  }

  process.exit(0);
}

triggerCollection();
