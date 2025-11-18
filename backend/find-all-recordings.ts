/**
 * Find ALL recordings in database (no time limit)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findAllRecordings() {
  try {
    const sessions = await prisma.fundingPaymentRecordingSession.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`\n=== ALL Recording Sessions in Database ===\n`);
    console.log(`Found ${sessions.length} total sessions\n`);

    if (sessions.length === 0) {
      console.log('❌ No recordings found in database');
      return;
    }

    const withData = [];
    const withoutData = [];

    for (const session of sessions) {
      const createdAt = session.createdAt.getTime();
      const fundingTime = session.fundingPaymentTime.getTime();
      const diffSeconds = (fundingTime - createdAt) / 1000;
      const diffHours = diffSeconds / 3600;

      const isTest = diffSeconds >= 25 && diffSeconds <= 35;
      const type = isTest ? '🧪 TEST' : '✅ REAL';
      const hasData = session.totalDataPoints > 0 ? '📊' : '❌';

      console.log(`${hasData} ${type} | ${session.symbol.padEnd(15)} | ${session.status.padEnd(10)} | ${session.totalDataPoints.toString().padStart(3)} points`);
      console.log(`          Created: ${session.createdAt.toLocaleString()}`);
      console.log(`          Funding: ${session.fundingPaymentTime.toLocaleString()}`);

      if (diffHours > 1) {
        console.log(`          Time diff: ${diffHours.toFixed(1)} hours`);
      } else {
        console.log(`          Time diff: ${diffSeconds.toFixed(0)} seconds`);
      }

      console.log(`          Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
      console.log(`          ID: ${session.id}`);
      console.log();

      if (session.totalDataPoints > 0) {
        withData.push(session);
      } else {
        withoutData.push(session);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total sessions: ${sessions.length}`);
    console.log(`With data: ${withData.length}`);
    console.log(`Without data: ${withoutData.length}`);

    if (withData.length > 0) {
      console.log(`\n✅ Sessions with data:`);
      withData.forEach(s => {
        const createdAt = s.createdAt.getTime();
        const fundingTime = s.fundingPaymentTime.getTime();
        const diffSeconds = (fundingTime - createdAt) / 1000;
        const isTest = diffSeconds >= 25 && diffSeconds <= 35;

        console.log(`  ${isTest ? '🧪' : '✅'} ${s.symbol}: ${s.totalDataPoints} points - ${s.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findAllRecordings();
