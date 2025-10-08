#!/usr/bin/env tsx
/**
 * Trading Symbols Sync Script
 *
 * Can be run manually or via cron for daily symbol synchronization
 * Usage: npx tsx src/scripts/sync-trading-symbols.ts
 */

import { syncAllExchanges } from '../services/trading-symbols.service';

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   Trading Symbols Synchronization');
  console.log('   ' + new Date().toLocaleString());
  console.log('═══════════════════════════════════════════════════\n');

  try {
    await syncAllExchanges();
    console.log('\n✅ Symbol synchronization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Symbol synchronization failed:',  error);
    process.exit(1);
  }
}

main();
