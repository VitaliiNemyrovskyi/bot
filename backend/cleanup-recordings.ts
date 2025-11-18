/**
 * Clean up all test recording data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupRecordings() {
  try {
    console.log('🗑️  Cleaning up test recording data...\n');

    // Get count of sessions
    const sessionCount = await prisma.fundingPaymentRecordingSession.count();
    console.log(`Found ${sessionCount} recording sessions`);

    if (sessionCount === 0) {
      console.log('✅ Database is already clean');
      return;
    }

    // Delete all data points first (foreign key constraint)
    console.log('Deleting data points...');
    await prisma.fundingPaymentDataPoint.deleteMany({});
    console.log(`✅ Deleted all data points`);

    // Delete all sessions
    console.log('Deleting recording sessions...');
    await prisma.fundingPaymentRecordingSession.deleteMany({});
    console.log(`✅ Deleted ${sessionCount} recording sessions`);

    console.log('\n🎉 Database cleanup completed!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupRecordings();
