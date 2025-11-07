import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Delete all BingX records to force full recalculation
 */
async function deleteBingXRecords() {
  try {
    console.log('='.repeat(60));
    console.log('DELETING ALL BINGX RECORDS');
    console.log('='.repeat(60));
    console.log('');

    // Count before deletion
    const beforeCount = await prisma.publicFundingRate.count({
      where: { exchange: 'BINGX' },
    });
    console.log(`BingX records before deletion: ${beforeCount}`);
    console.log('');

    // Delete all BingX records
    console.log('Deleting all BingX records...');
    const result = await prisma.publicFundingRate.deleteMany({
      where: { exchange: 'BINGX' },
    });

    console.log(`✓ Deleted ${result.count} BingX records`);
    console.log('');

    // Verify deletion
    const afterCount = await prisma.publicFundingRate.count({
      where: { exchange: 'BINGX' },
    });

    if (afterCount === 0) {
      console.log('✓ Verification successful: All BingX records deleted');
    } else {
      console.warn(`⚠️  Warning: ${afterCount} BingX records still remain`);
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('DELETION COMPLETED');
    console.log('='.repeat(60));
    console.log('');
    console.log('Next step:');
    console.log('Call BingX API endpoint to trigger full recalculation:');
    console.log('  curl http://localhost:3000/api/bingx/public-funding-rates');
    console.log('');

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('ERROR:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteBingXRecords();
