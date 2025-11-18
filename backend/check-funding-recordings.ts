/**
 * Check funding payment recording sessions in database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecordings() {
  console.log('=== Funding Payment Recording Sessions ===\n');

  // Get all recording sessions
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      symbol: true,
      exchange: true,
      status: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
      fundingPaymentTime: true,
      totalDataPoints: true,
      errorMessage: true,
      _count: {
        select: {
          dataPoints: true
        }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('❌ NO RECORDING SESSIONS FOUND IN DATABASE');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${sessions.length} recent sessions:\n`);

  sessions.forEach((session, idx) => {
    const duration = session.completedAt && session.startedAt
      ? Math.round((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)
      : 'N/A';

    console.log(`${idx + 1}. Session #${session.id}`);
    console.log(`   Symbol: ${session.symbol} | Exchange: ${session.exchange}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Created: ${session.createdAt.toISOString()}`);
    console.log(`   Started: ${session.startedAt ? session.startedAt.toISOString() : 'Not started'}`);
    console.log(`   Completed: ${session.completedAt ? session.completedAt.toISOString() : 'Not finished'}`);
    console.log(`   Funding Time: ${session.fundingPaymentTime.toISOString()}`);
    console.log(`   Data Points: ${session.totalDataPoints || 0} | DB Records: ${session._count.dataPoints}`);
    if (session.errorMessage) {
      console.log(`   ❌ Error: ${session.errorMessage}`);
    }
    console.log(`   Duration: ${duration}s\n`);
  });

  // Check if there are any ACTIVE sessions
  const activeSessions = sessions.filter(s => s.status === 'RECORDING');
  if (activeSessions.length > 0) {
    console.log(`\n⚠️  Found ${activeSessions.length} RECORDING sessions (might be stuck):`);
    activeSessions.forEach(s => {
      console.log(`   - Session #${s.id} (${s.symbol} on ${s.exchange})`);
    });
  }

  // Check most recent session
  const lastSession = sessions[0];
  const timeSinceLastSession = Date.now() - lastSession.createdAt.getTime();
  const hoursSinceLastSession = timeSinceLastSession / (1000 * 60 * 60);

  console.log(`\n📊 Last recording was ${hoursSinceLastSession.toFixed(1)} hours ago`);

  if (hoursSinceLastSession > 8) {
    console.log('⚠️  WARNING: No recordings in the last 8 hours!');
    console.log('   The funding payment recorder might not be running.');
    console.log('   Check if the service is started in the backend.');
  }

  await prisma.$disconnect();
}

checkRecordings().catch(console.error);
