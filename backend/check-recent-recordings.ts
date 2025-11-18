import prisma from './src/lib/prisma';

async function checkRecordings() {
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000)
      }
    },
    include: {
      _count: {
        select: { dataPoints: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n📊 Recent Recordings (last 15 minutes):\n');
  console.log('═'.repeat(100));

  for (const session of sessions) {
    const status = session.status;
    const statusIcon = status === 'COMPLETED' ? '✅' : status === 'RECORDING' ? '🔴' : status === 'ERROR' ? '❌' : '⏳';

    console.log(`${statusIcon} [${session.exchange}] ${session.symbol}`);
    console.log(`   Status: ${status}`);
    console.log(`   Data Points: ${session._count.dataPoints}`);
    console.log(`   Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Created: ${session.createdAt.toISOString()}`);
    if (session.completedAt) {
      console.log(`   Completed: ${session.completedAt.toISOString()}`);
    }
    console.log('─'.repeat(100));
  }

  console.log(`\nTotal sessions: ${sessions.length}`);

  // Group by exchange
  const byExchange = sessions.reduce((acc, s) => {
    if (!acc[s.exchange]) acc[s.exchange] = [];
    acc[s.exchange].push(s);
    return acc;
  }, {} as Record<string, typeof sessions>);

  console.log('\n📈 Summary by Exchange:');
  for (const [exchange, exSessions] of Object.entries(byExchange)) {
    const totalPoints = exSessions.reduce((sum, s) => sum + s._count.dataPoints, 0);
    console.log(`  ${exchange}: ${exSessions.length} session(s), ${totalPoints} total data points`);
  }

  await prisma.$disconnect();
}

checkRecordings().catch(console.error);
