/**
 * Clean up invalid recording sessions
 * - Delete ERROR and CANCELLED sessions
 * - Delete COMPLETED sessions with no data points
 * - Show statistics by exchange
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupInvalidRecordings() {
  try {
    console.log('🗑️  Cleaning up invalid recording sessions...\n');

    // 1. Show current state by exchange
    console.log('📊 Current recordings by exchange:\n');

    const byExchange = await prisma.fundingPaymentRecordingSession.groupBy({
      by: ['exchange', 'status'],
      _count: true,
      orderBy: {
        exchange: 'asc'
      }
    });

    byExchange.forEach(group => {
      console.log(`  ${group.exchange.padEnd(8)} ${group.status.padEnd(12)} - ${group._count} sessions`);
    });

    console.log('\n');

    // 2. Find and show sessions to delete
    const toDelete = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        OR: [
          { status: 'ERROR' },
          { status: 'CANCELLED' },
          {
            AND: [
              { status: 'COMPLETED' },
              { totalDataPoints: { lte: 0 } }
            ]
          }
        ]
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

    console.log(`🔍 Found ${toDelete.length} invalid sessions to delete:\n`);

    // Group by reason
    const errorSessions = toDelete.filter(s => s.status === 'ERROR');
    const cancelledSessions = toDelete.filter(s => s.status === 'CANCELLED');
    const emptySessions = toDelete.filter(s => s.status === 'COMPLETED' && (s.totalDataPoints || 0) <= 0);

    if (errorSessions.length > 0) {
      console.log(`❌ ERROR sessions (${errorSessions.length}):`);
      errorSessions.forEach(s => {
        console.log(`  • ${s.exchange.padEnd(8)} ${s.symbol.padEnd(12)} - ${new Date(s.createdAt).toLocaleString()}`);
      });
      console.log('');
    }

    if (cancelledSessions.length > 0) {
      console.log(`🚫 CANCELLED sessions (${cancelledSessions.length}):`);
      cancelledSessions.forEach(s => {
        console.log(`  • ${s.exchange.padEnd(8)} ${s.symbol.padEnd(12)} - ${new Date(s.createdAt).toLocaleString()}`);
      });
      console.log('');
    }

    if (emptySessions.length > 0) {
      console.log(`📭 COMPLETED sessions with no data (${emptySessions.length}):`);
      emptySessions.forEach(s => {
        console.log(`  • ${s.exchange.padEnd(8)} ${s.symbol.padEnd(12)} - ${s.totalDataPoints || 0} points`);
      });
      console.log('');
    }

    if (toDelete.length === 0) {
      console.log('✅ No invalid sessions found!\n');
      await prisma.$disconnect();
      return;
    }

    // 3. Delete invalid sessions
    console.log(`🗑️  Deleting ${toDelete.length} invalid sessions...\n`);

    const result = await prisma.fundingPaymentRecordingSession.deleteMany({
      where: {
        OR: [
          { status: 'ERROR' },
          { status: 'CANCELLED' },
          {
            AND: [
              { status: 'COMPLETED' },
              { totalDataPoints: { lte: 0 } }
            ]
          }
        ]
      }
    });

    console.log(`✅ Deleted ${result.count} invalid sessions\n`);

    // 4. Show final state
    console.log('📊 Final state by exchange:\n');

    const afterCleanup = await prisma.fundingPaymentRecordingSession.groupBy({
      by: ['exchange'],
      _count: true,
      _sum: {
        totalDataPoints: true
      },
      orderBy: {
        exchange: 'asc'
      }
    });

    afterCleanup.forEach(group => {
      console.log(`  ${group.exchange.padEnd(8)} - ${group._count} sessions, ${group._sum.totalDataPoints || 0} total data points`);
    });

    const total = await prisma.fundingPaymentRecordingSession.count();
    const withData = await prisma.fundingPaymentRecordingSession.count({
      where: {
        totalDataPoints: { gt: 0 }
      }
    });

    console.log(`\n📈 Total: ${total} sessions (${withData} with data)\n`);

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

cleanupInvalidRecordings();
