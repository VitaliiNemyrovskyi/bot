import prisma from './src/lib/prisma';

async function main() {
  try {
    // Count total data points
    const totalPoints = await prisma.fundingPaymentDataPoint.count();
    console.log('\n📊 Database Statistics:');
    console.log(`Total data points across all recordings: ${totalPoints}`);

    // Get recent sessions
    const sessions = await prisma.fundingPaymentRecordingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true,
        exchange: true,
        symbol: true,
        status: true,
        createdAt: true,
        completedAt: true,
        _count: {
          select: { dataPoints: true }
        }
      }
    });

    console.log('\n📝 Last 15 recording sessions:');
    console.log('═'.repeat(90));
    sessions.forEach((s, i) => {
      const time = s.createdAt.toISOString().substring(11, 19);
      const points = s._count.dataPoints;
      const status = s.status === 'COMPLETED' ? '✅' : s.status === 'ERROR' ? '❌' : '⏳';
      console.log(`${status} ${s.exchange.padEnd(8)} ${s.symbol.padEnd(15)} ${points.toString().padStart(5)} points  ${time}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
