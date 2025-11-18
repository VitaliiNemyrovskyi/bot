import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.fundingPaymentRecordingSession.count();

  const latest = await prisma.fundingPaymentRecordingSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      _count: {
        select: { dataPoints: true }
      }
    }
  });

  console.log(`\n📊 Total recordings in database: ${count}\n`);
  console.log('Latest 5 recordings:');
  console.log('═'.repeat(80));

  latest.forEach((s, i) => {
    console.log(`\n${i+1}. ${s.symbol} @ ${s.exchange}`);
    console.log(`   Status: ${s.status}`);
    console.log(`   Funding Rate: ${(s.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${s._count.dataPoints}`);
    console.log(`   Created: ${s.createdAt.toISOString()}`);
    if (s.completedAt) {
      console.log(`   Completed: ${s.completedAt.toISOString()}`);
      const duration = (s.completedAt.getTime() - s.createdAt.getTime()) / 1000;
      console.log(`   Duration: ${duration.toFixed(1)}s`);
    }
  });

  console.log('\n' + '═'.repeat(80));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
