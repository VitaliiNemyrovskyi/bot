import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecordings() {
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { dataPoints: true }
      }
    }
  });

  console.log(`\n📊 Recording Sessions: ${sessions.length}\n`);

  sessions.forEach((s, i) => {
    console.log(`${i+1}. ${s.exchange} - ${s.symbol}`);
    console.log(`   Status: ${s.status}`);
    console.log(`   Data Points: ${s._count.dataPoints}`);
    console.log(`   Created: ${new Date(s.createdAt).toLocaleString()}`);
    console.log(`   ID: ${s.id}\n`);
  });

  await prisma.$disconnect();
}

checkRecordings().catch(console.error);
