/**
 * Test API funding response
 * Run: npx tsx scripts/test-api-funding.ts
 */

import prisma from '../src/lib/prisma';

async function testApiFunding() {
  try {
    console.log('Testing API funding logic...\n');

    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1762851015457' },
    });

    if (!position) {
      console.error('Position not found!');
      return;
    }

    console.log('RAW DB DATA:');
    console.log('  fundingUpdateCount:', position.fundingUpdateCount);
    console.log('  primaryLastFundingPaid:', position.primaryLastFundingPaid);
    console.log('  primaryTotalFundingEarned:', position.primaryTotalFundingEarned);
    console.log('  hedgeLastFundingPaid:', position.hedgeLastFundingPaid);
    console.log('  hedgeTotalFundingEarned:', position.hedgeTotalFundingEarned);
    console.log('');

    // Replicate API logic
    const hasFundingPayments = (position.fundingUpdateCount || 0) > 0;
    const actualPrimaryFundingPaid = hasFundingPayments ? (position.primaryLastFundingPaid || 0) : 0;
    const actualPrimaryFundingEarned = hasFundingPayments ? (position.primaryTotalFundingEarned || 0) : 0;
    const actualHedgeFundingPaid = hasFundingPayments ? (position.hedgeLastFundingPaid || 0) : 0;
    const actualHedgeFundingEarned = hasFundingPayments ? (position.hedgeTotalFundingEarned || 0) : 0;

    console.log('AFTER API PROCESSING:');
    console.log('  hasFundingPayments:', hasFundingPayments);
    console.log('  actualPrimaryFundingPaid:', actualPrimaryFundingPaid);
    console.log('  actualPrimaryFundingEarned:', actualPrimaryFundingEarned);
    console.log('  actualHedgeFundingPaid:', actualHedgeFundingPaid);
    console.log('  actualHedgeFundingEarned:', actualHedgeFundingEarned);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testApiFunding();
