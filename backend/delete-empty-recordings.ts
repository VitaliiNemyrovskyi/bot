import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteEmptyRecordings() {
  try {
    console.log('🗑️  Deleting COMPLETED sessions with no data...\n');

    // Find COMPLETED sessions with 0 data points
    const emptyRecordings = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        status: 'COMPLETED',
        totalDataPoints: { lte: 0 }
      },
      select: {
        id: true,
        exchange: true,
        symbol: true,
        totalDataPoints: true,
        createdAt: true,
      }
    });

    console.log(`Found ${emptyRecordings.length} COMPLETED sessions with no data:\n`);

    emptyRecordings.forEach(s => {
      console.log(`  • ${s.exchange.padEnd(8)} ${s.symbol.padEnd(12)} - ${s.totalDataPoints || 0} points`);
    });

    // Delete them
    const result = await prisma.fundingPaymentRecordingSession.deleteMany({
      where: {
        status: 'COMPLETED',
        totalDataPoints: { lte: 0 }
      }
    });

    console.log(`\n✅ Deleted ${result.count} empty COMPLETED sessions\n`);

    // Show remaining
    const remaining = await prisma.fundingPaymentRecordingSession.count();
    const withData = await prisma.fundingPaymentRecordingSession.count({
      where: {
        totalDataPoints: { gt: 0 }
      }
    });

    console.log(`📊 Remaining sessions: ${remaining}`);
    console.log(`   All have data: ${withData} sessions with data points\n`);

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Deletion failed:', error.message);
    await prisma.$disconnect();
  }
}

deleteEmptyRecordings();
