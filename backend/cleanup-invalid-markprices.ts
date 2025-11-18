/**
 * Clean up old records with null or 0 markPrice from database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInvalidMarkPrices() {
  console.log('[Cleanup] Starting cleanup of invalid markPrice records...');

  try {
    // Delete records with null markPrice
    const deletedNull = await prisma.publicFundingRate.deleteMany({
      where: {
        markPrice: null,
      },
    });
    console.log(`[Cleanup] Deleted ${deletedNull.count} records with NULL markPrice`);

    // Delete records with 0 markPrice
    const deletedZero = await prisma.publicFundingRate.deleteMany({
      where: {
        markPrice: 0,
      },
    });
    console.log(`[Cleanup] Deleted ${deletedZero.count} records with ZERO markPrice`);

    const total = deletedNull.count + deletedZero.count;
    console.log(`[Cleanup] ✓ Total cleaned up: ${total} invalid records`);

  } catch (error: any) {
    console.error('[Cleanup] Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupInvalidMarkPrices();
