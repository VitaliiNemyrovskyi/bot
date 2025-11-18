import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 MIGRATING TIMING DATA TO USE BYBIT TIMESTAMPS\n');
  console.log('This will recalculate relativeTimeMs for all existing data points');
  console.log('using Bybit timestamp instead of local timestamp.\n');

  // Get all sessions with data points
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      dataPoints: {
        some: {}
      }
    },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' },
        take: 10 // Sample first 10 points to calculate offset
      }
    }
  });

  console.log(`Found ${sessions.length} sessions to migrate\n`);
  console.log('═'.repeat(100));

  let totalSessionsUpdated = 0;
  let totalDataPointsUpdated = 0;

  for (const session of sessions) {
    if (session.dataPoints.length === 0) {
      console.log(`⏭️  Skipping ${session.symbol} @ ${session.exchange} - no data points`);
      continue;
    }

    console.log(`\n📊 Processing: ${session.symbol} @ ${session.exchange}`);
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Data points: ${session.dataPoints.length} (sampling)`);

    // Calculate average clock offset from sample
    let totalOffset = 0;
    let validOffsets = 0;

    for (const dp of session.dataPoints) {
      const bybitTime = Number(dp.bybitTimestamp);
      const localTime = Number(dp.localTimestamp);
      const offset = bybitTime - localTime;

      totalOffset += offset;
      validOffsets++;
    }

    if (validOffsets === 0) {
      console.log(`   ⚠️  No valid offsets calculated - skipping`);
      continue;
    }

    const avgOffset = Math.round(totalOffset / validOffsets);
    console.log(`   ⏱️  Average clock offset: ${avgOffset > 0 ? '+' : ''}${avgOffset}ms (Bybit ${avgOffset > 0 ? 'ahead' : 'behind'})`);

    // Get ALL data points for this session
    const allDataPoints = await prisma.fundingPaymentDataPoint.findMany({
      where: { sessionId: session.id }
    });

    console.log(`   📝 Updating ${allDataPoints.length} data points...`);

    // Update each data point
    let updatedCount = 0;
    for (const dp of allDataPoints) {
      const oldRelativeTime = dp.relativeTimeMs;
      const newRelativeTime = oldRelativeTime + avgOffset;

      await prisma.fundingPaymentDataPoint.update({
        where: { id: dp.id },
        data: { relativeTimeMs: newRelativeTime }
      });

      updatedCount++;

      // Log progress every 100 points
      if (updatedCount % 100 === 0) {
        console.log(`   ... ${updatedCount}/${allDataPoints.length} updated`);
      }
    }

    console.log(`   ✅ Updated ${updatedCount} data points`);
    console.log(`   📊 Example adjustment: ${session.dataPoints[0].relativeTimeMs}ms → ${session.dataPoints[0].relativeTimeMs + avgOffset}ms`);

    totalSessionsUpdated++;
    totalDataPointsUpdated += updatedCount;
  }

  console.log('\n' + '═'.repeat(100));
  console.log('\n✅ MIGRATION COMPLETE!\n');
  console.log(`📊 Summary:`);
  console.log(`   Sessions updated: ${totalSessionsUpdated}`);
  console.log(`   Total data points updated: ${totalDataPointsUpdated}`);
  console.log(`\n🎯 Next steps:`);
  console.log(`   1. Rerun timing optimization tests`);
  console.log(`   2. Compare new results with old results`);
  console.log(`   3. Verify optimal entry/exit times shifted correctly`);
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
