import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to clear all funding rate data from database
 * This allows testing the funding rate collection algorithm from scratch
 */
async function clearAllFundingRates() {
  try {
    console.log('='.repeat(60));
    console.log('CLEARING FUNDING RATES FROM DATABASE');
    console.log('='.repeat(60));
    console.log('');

    // Step 1: Check current funding rates count
    console.log('Step 1: Checking current funding rates count...');
    const totalCount = await prisma.publicFundingRate.count();
    console.log(`Total funding rate records: ${totalCount}`);
    console.log('');

    if (totalCount === 0) {
      console.log('✓ No records to delete. Database is already empty.');
      await prisma.$disconnect();
      return;
    }

    // Step 2: Show breakdown by exchange
    console.log('Step 2: Current breakdown by exchange:');
    const byExchange = await prisma.publicFundingRate.groupBy({
      by: ['exchange'],
      _count: true,
    });

    byExchange.forEach((item) => {
      console.log(`  ${item.exchange}: ${item._count} records`);
    });
    console.log('');

    // Step 3: Show funding interval distribution for BingX
    console.log('Step 3: BingX funding interval distribution (before cleanup):');
    const bingxIntervals = await prisma.publicFundingRate.groupBy({
      by: ['fundingInterval'],
      where: {
        exchange: 'BINGX',
      },
      _count: true,
    });

    if (bingxIntervals.length > 0) {
      bingxIntervals.forEach((item) => {
        const intervalLabel = item.fundingInterval === 0 ? 'Unknown (0h)' : `${item.fundingInterval}h`;
        console.log(`  ${intervalLabel}: ${item._count} symbols`);
      });
    } else {
      console.log('  No BingX records found');
    }
    console.log('');

    // Step 4: Delete all records
    console.log('Step 4: Deleting all funding rate records...');
    const result = await prisma.publicFundingRate.deleteMany({});
    console.log(`✓ Successfully deleted ${result.count} records`);
    console.log('');

    // Step 5: Verify deletion
    console.log('Step 5: Verifying deletion...');
    const finalCount = await prisma.publicFundingRate.count();
    if (finalCount === 0) {
      console.log('✓ Verification successful: Database is now empty');
    } else {
      console.warn(`⚠️  Warning: ${finalCount} records still remain`);
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('CLEANUP COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Call BingX API to repopulate data:');
    console.log('   curl http://localhost:3000/api/bingx/public-funding-rates');
    console.log('2. Wait ~2-5 minutes for interval calculation');
    console.log('3. Verify results in database');
    console.log('');

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('ERROR: Failed to clear funding rates:', error.message);
    console.error('Stack trace:', error.stack);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the script
clearAllFundingRates();