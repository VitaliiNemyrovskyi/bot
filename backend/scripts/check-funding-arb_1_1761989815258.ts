/**
 * Script to check funding data for position arb_1_1761989815258
 * Run with: npx tsx scripts/check-funding-arb_1_1761989815258.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const POSITION_ID = 'arb_1_1761989815258';

async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Checking funding data for position ${POSITION_ID}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Get position details
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: POSITION_ID },
      select: {
        id: true,
        positionId: true,
        symbol: true,
        primaryExchange: true,
        hedgeExchange: true,
        status: true,
        createdAt: true,
      },
    });

    if (!position) {
      console.error(`❌ Position ${POSITION_ID} not found`);
      process.exit(1);
    }

    console.log(`Position: ${position.symbol}`);
    console.log(`Primary: ${position.primaryExchange}, Hedge: ${position.hedgeExchange}`);
    console.log(`Status: ${position.status}`);
    console.log(`Created: ${position.createdAt}\n`);

    // Get full position details with funding data
    const fullPosition = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: POSITION_ID },
    });

    if (!fullPosition) {
      console.error(`❌ Failed to load full position data`);
      process.exit(1);
    }

    console.log(`${'─'.repeat(80)}\n`);
    console.log(`Funding Data:\n`);

    console.log(`PRIMARY (${position.primaryExchange}):`);
    console.log(`  Last Funding Paid: ${fullPosition.primaryLastFundingPaid} USDT`);
    console.log(`  Total Funding Earned: ${fullPosition.primaryTotalFundingEarned} USDT`);
    console.log(`  Trading Fees: ${fullPosition.primaryTradingFees} USDT`);
    console.log(`  Entry Price: ${fullPosition.primaryEntryPrice || 'N/A'}`);
    console.log(`  Current Price: ${fullPosition.primaryCurrentPrice || 'N/A'}`);
    console.log('');

    console.log(`HEDGE (${position.hedgeExchange}):`);
    console.log(`  Last Funding Paid: ${fullPosition.hedgeLastFundingPaid} USDT`);
    console.log(`  Total Funding Earned: ${fullPosition.hedgeTotalFundingEarned} USDT`);
    console.log(`  Trading Fees: ${fullPosition.hedgeTradingFees} USDT`);
    console.log(`  Entry Price: ${fullPosition.hedgeEntryPrice || 'N/A'}`);
    console.log(`  Current Price: ${fullPosition.hedgeCurrentPrice || 'N/A'}`);
    console.log('');

    console.log(`${'─'.repeat(80)}\n`);
    console.log(`Summary:`);
    console.log(`  Gross Profit: ${fullPosition.grossProfit} USDT`);
    console.log(`  Net Profit: ${fullPosition.netProfit} USDT`);
    console.log(`  Last Funding Update: ${fullPosition.lastFundingUpdate || 'Never'}`);
    console.log(`  Funding Update Count: ${fullPosition.fundingUpdateCount}`);
    console.log(`\n${'='.repeat(80)}\n`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
