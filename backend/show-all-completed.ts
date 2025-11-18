import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showCompleted() {
  const completed = await prisma.fundingPaymentRecordingSession.findMany({
    where: { status: 'COMPLETED' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log(`\n📊 Total COMPLETED recordings: ${completed.length}\n`);
  console.log('═'.repeat(100));

  for (let i = 0; i < completed.length; i++) {
    const s = completed[i];
    const dataCount = await prisma.fundingPaymentDataPoint.count({
      where: { sessionId: s.id }
    });

    const duration = s.completedAt && s.createdAt
      ? ((s.completedAt.getTime() - s.createdAt.getTime()) / 1000).toFixed(1)
      : 'N/A';

    console.log(`\n${i + 1}. ${s.symbol} @ ${s.exchange}`);
    console.log(`   Funding Rate: ${(s.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${dataCount}`);
    console.log(`   Created: ${s.createdAt.toISOString()}`);
    console.log(`   Funding Payment: ${s.fundingPaymentTime.toISOString()}`);
    console.log(`   Duration: ${duration}s`);
  }

  console.log('\n' + '═'.repeat(100) + '\n');
  await prisma.$disconnect();
}

showCompleted().catch(console.error);
