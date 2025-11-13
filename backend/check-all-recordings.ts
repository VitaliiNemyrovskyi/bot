/**
 * Check all recent recording sessions
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllRecordings() {
  try {
    console.log('=== All Recent Recording Sessions ===\n');

    // Get last 10 recording sessions
    const sessions = await prisma.fundingPaymentRecordingSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        symbol: true,
        exchange: true,
        status: true,
        totalDataPoints: true,
        createdAt: true,
        networkLatencyMs: true,
      },
    });

    if (sessions.length === 0) {
      console.log('❌ No recording sessions found');
      return;
    }

    console.log(`Found ${sessions.length} recent sessions:\n`);

    sessions.forEach((session, index) => {
      const icon = session.totalDataPoints > 0 ? '✅' : '❌';
      const time = session.createdAt.toLocaleTimeString();

      console.log(`${index + 1}. ${icon} ${session.symbol} (${session.exchange})`);
      console.log(`   ID: ${session.id}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Data Points: ${session.totalDataPoints}`);
      console.log(`   Network Latency: ${session.networkLatencyMs}ms`);
      console.log(`   Created: ${time}`);
      console.log('');
    });

    // Summary
    const successful = sessions.filter(s => s.totalDataPoints > 0).length;
    const failed = sessions.filter(s => s.totalDataPoints === 0).length;

    console.log('=== Summary ===');
    console.log(`✅ Successful: ${successful}/${sessions.length}`);
    console.log(`❌ Failed (0 data points): ${failed}/${sessions.length}`);

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllRecordings();
