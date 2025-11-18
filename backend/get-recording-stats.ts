import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getRecordingStats() {
  try {
    const statusCounts = await prisma.fundingPaymentRecordingSession.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('📊 Recording Sessions Statistics (All Time):\n');

    statusCounts.forEach(stat => {
      const icon = stat.status === 'COMPLETED' ? '✅' : stat.status === 'ERROR' ? '❌' : '⚠️';
      console.log(`${icon} ${stat.status.padEnd(12)} : ${stat._count}`);
    });

    const total = statusCounts.reduce((sum, stat) => sum + stat._count, 0);
    console.log(`\n📝 Total Sessions   : ${total}`);

    const successful = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        status: 'COMPLETED',
        totalDataPoints: { gt: 0 }
      },
      select: {
        id: true,
        exchange: true,
        symbol: true,
        totalDataPoints: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n✅ Successful Recordings with Data: ${successful.length}\n`);

    successful.forEach(s => {
      const date = s.createdAt.toISOString().split('T')[0];
      const time = (s.createdAt.toISOString().split('T')[1] ?? '').substring(0, 8);
      console.log(`  • ${s.exchange.padEnd(8)} ${s.symbol.padEnd(12)} - ${String(s.totalDataPoints).padStart(4)} points - ${date} ${time}`);
    });

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

getRecordingStats();

