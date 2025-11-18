/**
 * Delete all recording sessions with 0 data points
 * Regardless of status (COMPLETED, ERROR, CANCELLED, etc.)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteZeroDataPoints() {
  try {
    console.log('🗑️  Deleting all sessions with 0 data points...\n');

    // Find all sessions with 0 data points
    const zeroSessions = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        totalDataPoints: { lte: 0 }
      },
      select: {
        id: true,
        exchange: true,
        symbol: true,
        status: true,
        totalDataPoints: true,
        createdAt: true,
      },
      orderBy: [
        { exchange: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    console.log(`🔍 Found ${zeroSessions.length} sessions with 0 data points:\n`);

    // Group by exchange
    const byExchange = zeroSessions.reduce((acc, session) => {
      if (!acc[session.exchange]) {
        acc[session.exchange] = [];
      }
      acc[session.exchange]?.push(session);
      return acc;
    }, {} as Record<string, typeof zeroSessions>);

    // Show sessions by exchange
    Object.entries(byExchange).forEach(([exchange, sessions]) => {
      console.log(`${exchange} (${sessions.length} sessions):`);
      sessions.forEach(s => {
        console.log(`  • ${s.symbol.padEnd(15)} ${s.status.padEnd(12)} - ${s.totalDataPoints || 0} points - ${new Date(s.createdAt).toLocaleString()}`);
      });
      console.log('');
    });

    if (zeroSessions.length === 0) {
      console.log('✅ No sessions with 0 data points found!\n');
      await prisma.$disconnect();
      return;
    }

    // Delete sessions with 0 data points
    const result = await prisma.fundingPaymentRecordingSession.deleteMany({
      where: {
        totalDataPoints: { lte: 0 }
      }
    });

    console.log(`✅ Deleted ${result.count} sessions with 0 data points\n`);

    // Show remaining sessions
    const remaining = await prisma.fundingPaymentRecordingSession.count();
    const byExchangeRemaining = await prisma.fundingPaymentRecordingSession.groupBy({
      by: ['exchange'],
      _count: true,
      _sum: {
        totalDataPoints: true
      },
      orderBy: {
        exchange: 'asc'
      }
    });

    console.log('📊 Remaining sessions by exchange:\n');
    byExchangeRemaining.forEach(group => {
      console.log(`  ${group.exchange.padEnd(8)} - ${group._count} sessions, ${group._sum.totalDataPoints || 0} total data points`);
    });

    console.log(`\n📈 Total: ${remaining} sessions (all with data)\n`);

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Deletion failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteZeroDataPoints();
