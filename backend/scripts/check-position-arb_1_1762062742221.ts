/**
 * Script to check the status of position arb_1_1762062742221
 * Run with: npx tsx scripts/check-position-arb_1_1762062742221.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const POSITION_ID = 'arb_1_1762062742221';

async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Checking position ${POSITION_ID} status`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: POSITION_ID },
    });

    if (!position) {
      console.error(`❌ Position ${POSITION_ID} not found in database`);
      process.exit(1);
    }

    console.log(`Position details:`);
    console.log(`  ID: ${position.id}`);
    console.log(`  Position ID: ${position.positionId}`);
    console.log(`  Status: ${position.status}`);
    console.log(`  Symbol: ${position.symbol}`);
    console.log(`  Primary Exchange: ${position.primaryExchange}`);
    console.log(`  Hedge Exchange: ${position.hedgeExchange}`);
    console.log(`\nPosition Sizes:`);
    console.log(`  Primary Quantity: ${position.primaryQuantity}`);
    console.log(`  Primary Filled: ${position.primaryFilledQty}`);
    console.log(`  Hedge Quantity: ${position.hedgeQuantity}`);
    console.log(`  Hedge Filled: ${position.hedgeFilledQty}`);
    console.log(`\nEntry Prices:`);
    console.log(`  Primary Entry: ${position.primaryEntryPrice}`);
    console.log(`  Hedge Entry: ${position.hedgeEntryPrice}`);
    console.log(`\nTP/SL Levels:`);
    console.log(`  Primary TP: ${position.primaryTakeProfit}`);
    console.log(`  Primary SL: ${position.primaryStopLoss}`);
    console.log(`  Hedge TP: ${position.hedgeTakeProfit}`);
    console.log(`  Hedge SL: ${position.hedgeStopLoss}`);
    console.log(`\nFees:`);
    console.log(`  Primary Trading Fees: ${position.primaryTradingFees} USDT`);
    console.log(`  Hedge Trading Fees: ${position.hedgeTradingFees} USDT`);
    console.log(`\nStatus Details:`);
    console.log(`  Primary Status: ${position.primaryStatus}`);
    console.log(`  Hedge Status: ${position.hedgeStatus}`);

    if (position.primaryErrorMessage) {
      console.log(`  Primary Error: ${position.primaryErrorMessage}`);
    }
    if (position.hedgeErrorMessage) {
      console.log(`  Hedge Error: ${position.hedgeErrorMessage}`);
    }

    console.log(`\nTimestamps:`);
    console.log(`  Created: ${position.createdAt}`);
    console.log(`  Updated: ${position.updatedAt}`);

    console.log(`\n${'='.repeat(80)}\n`);

    if (position.status === 'COMPLETED') {
      console.log(`✅ Position is COMPLETED - no action needed`);
    } else if (position.status === 'ERROR') {
      console.log(`⚠️ Position is in ERROR state - may need manual intervention`);
    } else if (position.status === 'ACTIVE') {
      console.log(`✅ Position is ACTIVE and being monitored`);
    } else {
      console.log(`Status: ${position.status}`);
    }

    console.log(`\n${'='.repeat(80)}\n`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error checking position:`, error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
