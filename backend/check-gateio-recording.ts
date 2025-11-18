import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecording() {
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 15
  });

  console.log('Last 15 Recording Sessions (24h):\n');
  sessions.forEach(s => {
    const points = s.totalDataPoints || 0;
    const icon = points > 0 ? '✅' : '❌';
    const exchange = s.exchange.padEnd(8);
    const symbol = s.symbol.padEnd(12);
    const status = s.status.padEnd(10);
    const pointsStr = String(points).padStart(4);
    console.log(`${icon} ${exchange} | ${symbol} | ${status} | Points: ${pointsStr} | ${s.createdAt.toISOString()}`);
  });

  await prisma.$disconnect();
}

checkRecording().catch(console.error);
