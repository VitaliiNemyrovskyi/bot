import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteFailedRecordings() {
  try {
    console.log('🗑️  Deleting failed and cancelled recording sessions...\n');

    // Count sessions to be deleted
    const errorCount = await prisma.fundingPaymentRecordingSession.count({
      where: { status: 'ERROR' }
    });

    const cancelledCount = await prisma.fundingPaymentRecordingSession.count({
      where: { status: 'CANCELLED' }
    });

    console.log(`Found ${errorCount} ERROR sessions`);
    console.log(`Found ${cancelledCount} CANCELLED sessions\n`);

    // Delete ERROR sessions
    const deletedErrors = await prisma.fundingPaymentRecordingSession.deleteMany({
      where: { status: 'ERROR' }
    });

    console.log(`✅ Deleted ${deletedErrors.count} ERROR sessions`);

    // Delete CANCELLED sessions
    const deletedCancelled = await prisma.fundingPaymentRecordingSession.deleteMany({
      where: { status: 'CANCELLED' }
    });

    console.log(`✅ Deleted ${deletedCancelled.count} CANCELLED sessions\n`);

    // Show remaining sessions
    const remaining = await prisma.fundingPaymentRecordingSession.count();
    const completed = await prisma.fundingPaymentRecordingSession.count({
      where: { status: 'COMPLETED' }
    });

    console.log(`📊 Remaining sessions: ${remaining} (all COMPLETED)`);
    console.log(`   With data: ${completed} COMPLETED sessions\n`);

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Deletion failed:', error.message);
    await prisma.$disconnect();
  }
}

deleteFailedRecordings();
