import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🕐 CHECKING FUNDING TIME ACCURACY\n');

  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      OR: [
        { fundingRate: { gte: 0.01 } },
        { fundingRate: { lte: -0.01 } }
      ],
      dataPoints: { some: {} }
    },
    include: {
      dataPoints: {
        where: {
          relativeTimeMs: { gte: -500, lte: 500 }
        },
        orderBy: { relativeTimeMs: 'asc' }
      }
    },
    take: 5
  });

  for (const session of sessions) {
    console.log('═'.repeat(100));
    console.log(`Symbol: ${session.symbol} @ ${session.exchange}`);
    console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
    console.log(`Expected Funding Time (from DB): ${session.expectedFundingTime || 'NOT SET'}`);
    console.log(`Session Created At: ${session.createdAt.toISOString()}`);
    console.log(`Session Completed At: ${session.completedAt?.toISOString() || 'NOT COMPLETED'}`);

    if (session.expectedFundingTime) {
      const fundingTime = new Date(session.expectedFundingTime);
      console.log(`\n📅 Funding Time Details:`);
      console.log(`   Full timestamp: ${fundingTime.toISOString()}`);
      console.log(`   Hour: ${fundingTime.getUTCHours()}:${fundingTime.getUTCMinutes().toString().padStart(2, '0')}:${fundingTime.getUTCSeconds().toString().padStart(2, '0')}.${fundingTime.getUTCMilliseconds().toString().padStart(3, '0')}`);
      console.log(`   Milliseconds: ${fundingTime.getUTCMilliseconds()}`);

      // Check if it's exactly on the hour boundary (00:00:00.000, 08:00:00.000, 16:00:00.000)
      const isExactHour = fundingTime.getUTCMinutes() === 0 &&
                         fundingTime.getUTCSeconds() === 0 &&
                         fundingTime.getUTCMilliseconds() === 0;
      console.log(`   Is exact hour boundary (XX:00:00.000)? ${isExactHour ? '✅ YES' : '❌ NO'}`);
    }

    console.log(`\n📊 Data points around funding time (relativeTimeMs = 0):`);
    console.log('─'.repeat(100));
    console.log('RelativeTime | Local Timestamp                | Bybit Timestamp');
    console.log('─'.repeat(100));

    for (const dp of session.dataPoints) {
      const localTime = new Date(Number(dp.localTimestamp));
      const bybitTime = new Date(Number(dp.bybitTimestamp));

      console.log(
        `${dp.relativeTimeMs.toString().padStart(12)}ms | ` +
        `${localTime.toISOString()} | ` +
        `${bybitTime.toISOString()}`
      );
    }

    console.log('\n');
  }

  console.log('═'.repeat(100));
  console.log('\n🔍 CONCLUSIONS:\n');
  console.log('1. Check if expectedFundingTime has milliseconds = 0');
  console.log('2. Check if relativeTimeMs=0 aligns with XX:00:00.000');
  console.log('3. Verify if funding payment happens EXACTLY at 00:00:00.000 or slightly offset');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
