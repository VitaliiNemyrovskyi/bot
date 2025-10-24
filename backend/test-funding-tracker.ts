/**
 * Test funding tracker for specific position
 * This script manually triggers funding update for a position to debug issues
 */

import { fundingTrackerService } from './src/services/funding-tracker.service';

async function main() {
  const positionId = 'arb_1_1761256044784'; // AVNTUSDT position

  try {
    console.log(`Testing funding tracker for position: ${positionId}\n`);

    const result = await fundingTrackerService.updatePosition(positionId);

    if (result) {
      console.log('\n✅ Funding update successful!');
      console.log('\nPrimary Exchange:');
      console.log(`  Last Funding Paid: ${result.primaryFunding.lastPaid} USDT`);
      console.log(`  Total Funding Earned: ${result.primaryFunding.totalEarned} USDT`);
      console.log(`  Trading Fees: ${result.primaryFunding.fees} USDT`);
      console.log(`  Current Price: ${result.primaryFunding.currentPrice}`);

      console.log('\nHedge Exchange:');
      console.log(`  Last Funding Paid: ${result.hedgeFunding.lastPaid} USDT`);
      console.log(`  Total Funding Earned: ${result.hedgeFunding.totalEarned} USDT`);
      console.log(`  Trading Fees: ${result.hedgeFunding.fees} USDT`);
      console.log(`  Current Price: ${result.hedgeFunding.currentPrice}`);

      console.log('\nProfit Summary:');
      console.log(`  Gross Profit: ${result.grossProfit} USDT`);
      console.log(`  Net Profit: ${result.netProfit} USDT`);
    } else {
      console.log('\n❌ No funding data returned');
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await fundingTrackerService.cleanup();
  }
}

main();
