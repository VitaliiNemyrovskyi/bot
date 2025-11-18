/**
 * Find recordings from REAL funding payment (not test data)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findRealRecordings() {
  try {
    // Get ALL sessions from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sessions = await prisma.fundingPaymentRecordingSession.findMany({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n=== All Recording Sessions (Last 24 Hours) ===\n`);
    console.log(`Found ${sessions.length} total sessions\n`);

    const realSessions = [];
    const testSessions = [];

    for (const session of sessions) {
      const createdAt = session.createdAt.getTime();
      const fundingTime = session.fundingPaymentTime.getTime();
      const diffSeconds = (fundingTime - createdAt) / 1000;

      const isTest = diffSeconds >= 25 && diffSeconds <= 35;
      const type = isTest ? '🧪 TEST' : '✅ REAL';

      console.log(`${type} | ${session.symbol.padEnd(15)} | Status: ${session.status.padEnd(10)} | Points: ${session.totalDataPoints.toString().padStart(3)}`);
      console.log(`       Created: ${session.createdAt.toLocaleString()}`);
      console.log(`       Funding: ${session.fundingPaymentTime.toLocaleString()}`);
      console.log(`       Time diff: ${diffSeconds.toFixed(0)}s`);
      console.log(`       Session ID: ${session.id}`);
      console.log();

      if (isTest) {
        testSessions.push(session);
      } else {
        realSessions.push(session);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Real recordings: ${realSessions.length}`);
    console.log(`Test recordings: ${testSessions.length}`);

    if (realSessions.length > 0) {
      console.log(`\n✅ Found ${realSessions.length} REAL recording(s)!`);
      console.log(`\nREAL Session IDs:`);
      realSessions.forEach(s => {
        console.log(`  - ${s.symbol}: ${s.id} (${s.totalDataPoints} points, ${s.status})`);
      });
    } else {
      console.log(`\n❌ No REAL recordings found, only test data`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findRealRecordings();
