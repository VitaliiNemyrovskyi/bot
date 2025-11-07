import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reset all BingX funding intervals to 0 to force recalculation
 */
async function resetBingXIntervals() {
  try {
    console.log('='.repeat(60));
    console.log('RESETTING BINGX FUNDING INTERVALS');
    console.log('='.repeat(60));
    console.log('');

    // Update all BingX records to set fundingInterval = 0
    console.log('Setting all BingX fundingInterval values to 0...');
    const result = await prisma.publicFundingRate.updateMany({
      where: {
        exchange: 'BINGX',
      },
      data: {
        fundingInterval: 0,
      },
    });

    console.log(`✓ Updated ${result.count} BingX records`);
    console.log('');

    // Verify the update
    console.log('Verifying interval distribution:');
    const intervals = await prisma.publicFundingRate.groupBy({
      by: ['fundingInterval'],
      where: {
        exchange: 'BINGX',
      },
      _count: true,
    });

    intervals.forEach(item => {
      const label = item.fundingInterval === 0 ? 'Unknown (0h)' : `${item.fundingInterval}h`;
      console.log(`  ${label}: ${item._count} symbols`);
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('RESET COMPLETED');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next steps:');
    console.log('1. Call BingX API to recalculate intervals:');
    console.log('   curl http://localhost:3000/api/bingx/public-funding-rates');
    console.log('2. Wait 5-10 minutes for interval calculation to complete');
    console.log('3. Verify results in database');
    console.log('');

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('ERROR:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetBingXIntervals();
