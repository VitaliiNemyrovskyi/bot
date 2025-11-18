/**
 * Check if recordings are TEST data (30 sec timer) or REAL funding payment data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDetails() {
  try {
    const sessions = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n=== Recording Details ===\n`);

    for (const session of sessions) {
      console.log(`📊 ${session.symbol}`);
      console.log(`   Session ID: ${session.id}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Created At: ${session.createdAt.toLocaleString()}`);
      console.log(`   Funding Payment Time: ${session.fundingPaymentTime.toLocaleString()}`);
      console.log(`   Recording Start: ${session.recordingStartTime?.toLocaleString() || 'N/A'}`);
      console.log(`   Recording End: ${session.recordingEndTime?.toLocaleString() || 'N/A'}`);
      console.log(`   Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
      console.log(`   Data Points: ${session.totalDataPoints}`);

      // Check if this is TEST data
      const createdAt = session.createdAt.getTime();
      const fundingTime = session.fundingPaymentTime.getTime();
      const diffSeconds = (fundingTime - createdAt) / 1000;

      console.log(`\n   ⏱️  Time Analysis:`);
      console.log(`   Created → Funding Payment: ${diffSeconds.toFixed(0)} seconds`);

      if (diffSeconds >= 25 && diffSeconds <= 35) {
        console.log(`   🧪 TEST DATA (30 second timer)`);
      } else {
        console.log(`   ✅ REAL FUNDING PAYMENT DATA`);
      }

      console.log();
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDetails();
