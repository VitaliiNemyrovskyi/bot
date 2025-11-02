/**
 * Script to check API response for position funding data
 * Run with: npx tsx scripts/check-api-response.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const POSITION_ID = 'arb_1_1761989815258';

async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Simulating API response transformation for ${POSITION_ID}`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // Get position from database (same as API does)
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: POSITION_ID },
    });

    if (!position) {
      console.error(`❌ Position not found`);
      process.exit(1);
    }

    console.log(`Database values:`);
    console.log(`  fundingUpdateCount: ${position.fundingUpdateCount}`);
    console.log(`  hedgeLastFundingPaid: ${position.hedgeLastFundingPaid}`);
    console.log(`  hedgeTotalFundingEarned: ${position.hedgeTotalFundingEarned}\n`);

    // Simulate API transformation (lines 110-119 from route.ts)
    const hasFundingPayments = (position.fundingUpdateCount || 0) > 0;
    console.log(`Calculated hasFundingPayments: ${hasFundingPayments}\n`);

    const actualHedgeFundingPaid = hasFundingPayments ? (position.hedgeLastFundingPaid || 0) : 0;
    const actualHedgeFundingEarned = hasFundingPayments ? (position.hedgeTotalFundingEarned || 0) : 0;

    console.log(`API transformation result:`);
    console.log(`  actualHedgeFundingPaid: ${actualHedgeFundingPaid}`);
    console.log(`  actualHedgeFundingEarned: ${actualHedgeFundingEarned}\n`);

    // Check for potential issues
    console.log(`Checking for issues:`);
    console.log(`  position.hedgeLastFundingPaid || 0 = ${position.hedgeLastFundingPaid || 0}`);
    console.log(`  Is hedgeLastFundingPaid truthy? ${!!position.hedgeLastFundingPaid}`);
    console.log(`  Is hedgeLastFundingPaid exactly 0? ${position.hedgeLastFundingPaid === 0}`);
    console.log(`  Is hedgeLastFundingPaid null? ${position.hedgeLastFundingPaid === null}`);
    console.log(`  Type of hedgeLastFundingPaid: ${typeof position.hedgeLastFundingPaid}\n`);

    console.log(`${'='.repeat(80)}\n`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ Error:`, error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
