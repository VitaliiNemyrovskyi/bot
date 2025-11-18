import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserIds() {
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      exchange: true,
      symbol: true,
      userId: true,
      createdAt: true,
      _count: { select: { dataPoints: true } }
    }
  });

  console.log('\n📊 Recording Sessions with userId:\n');
  sessions.forEach((s, i) => {
    console.log(`${i+1}. ${s.exchange} ${s.symbol}`);
    console.log(`   userId: ${s.userId || 'NULL'}`);
    console.log(`   points: ${s._count.dataPoints}`);
    console.log(`   created: ${s.createdAt}\n`);
  });

  await prisma.$disconnect();
}

checkUserIds().catch(console.error);
