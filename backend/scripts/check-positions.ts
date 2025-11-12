/**
 * Check all positions
 * Run: npx tsx scripts/check-positions.ts
 */

import prisma from '../src/lib/prisma';

async function checkPositions() {
  try {
    console.log('Checking all positions...\n');

    const positions = await prisma.graduatedEntryPosition.findMany({
      orderBy: {
        startedAt: 'desc',
      },
      take: 10,
    });

    console.log(`Total positions: ${positions.length}\n`);

    for (const pos of positions) {
      console.log(`Position ID: ${pos.positionId}`);
      console.log(`  Symbol: ${pos.symbol}`);
      console.log(`  Status: ${pos.status}`);
      console.log(`  Primary (${pos.primaryExchange}):`);
      console.log(`    Entry Price: ${pos.primaryEntryPrice}`);
      console.log(`    Current Price: ${pos.primaryCurrentPrice}`);
      console.log(`    Last Funding: ${pos.primaryLastFundingPaid}`);
      console.log(`    Total Funding: ${pos.primaryTotalFundingEarned}`);
      console.log(`    Status: ${pos.primaryStatus}`);
      console.log(`  Hedge (${pos.hedgeExchange}):`);
      console.log(`    Entry Price: ${pos.hedgeEntryPrice}`);
      console.log(`    Current Price: ${pos.hedgeCurrentPrice}`);
      console.log(`    Last Funding: ${pos.hedgeLastFundingPaid}`);
      console.log(`    Total Funding: ${pos.hedgeTotalFundingEarned}`);
      console.log(`    Status: ${pos.hedgeStatus}`);
      console.log(`  Funding Update Count: ${pos.fundingUpdateCount}`);
      console.log(`  Started: ${pos.startedAt}`);
      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPositions();
