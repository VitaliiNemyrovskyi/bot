/**
 * Cleanup Orphaned Recording Sessions
 *
 * Marks recording sessions as CANCELLED if they've been stuck in RECORDING/WAITING
 * status for more than 5 minutes (normal recording takes ~80 seconds).
 *
 * Orphaned sessions occur when the auto-recorder process is killed before
 * sessions can complete.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedSessions() {
  try {
    console.log('🧹 Cleaning up orphaned recording sessions...\n');

    // Find sessions that are stuck in RECORDING or WAITING status for > 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const orphanedSessions = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        status: {
          in: ['RECORDING', 'WAITING']
        },
        createdAt: {
          lt: fiveMinutesAgo
        }
      },
      select: {
        id: true,
        symbol: true,
        exchange: true,
        status: true,
        createdAt: true,
        totalDataPoints: true,
      }
    });

    if (orphanedSessions.length === 0) {
      console.log('✅ No orphaned sessions found');
      return;
    }

    console.log(`Found ${orphanedSessions.length} orphaned sessions:\n`);

    orphanedSessions.forEach(session => {
      const age = Math.round((Date.now() - session.createdAt.getTime()) / 1000 / 60);
      console.log(`  • ${session.exchange} ${session.symbol} - ${session.status} - Age: ${age}m - Points: ${session.totalDataPoints || 0}`);
    });

    console.log('\n🔄 Marking sessions as CANCELLED...\n');

    // Update all orphaned sessions to CANCELLED status
    const result = await prisma.fundingPaymentRecordingSession.updateMany({
      where: {
        id: {
          in: orphanedSessions.map(s => s.id)
        }
      },
      data: {
        status: 'CANCELLED',
        errorMessage: 'Session orphaned - auto-recorder process was terminated before completion',
        completedAt: new Date(),
      }
    });

    console.log(`✅ Marked ${result.count} sessions as CANCELLED\n`);

    // Show summary
    const statusCounts = await prisma.fundingPaymentRecordingSession.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    console.log('Session Status Summary (last 24h):');
    statusCounts.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count}`);
    });

  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedSessions();
