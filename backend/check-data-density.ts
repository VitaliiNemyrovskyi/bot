import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.fundingPaymentRecordingSession.findFirst({
    where: {
      status: 'COMPLETED',
      dataPoints: { some: {} }
    },
    include: {
      dataPoints: {
        where: { relativeTimeMs: { gte: -1000, lte: 5000 } },
        orderBy: { relativeTimeMs: 'asc' }
      }
    }
  });

  if (!session) {
    console.log('No completed sessions found');
    return;
  }

  console.log('\n📊 Data point density around funding time (0ms = funding payment)');
  console.log(`Symbol: ${session.symbol}`);
  console.log(`Exchange: ${session.exchange}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
  console.log('\n' + '='.repeat(80));
  console.log('Time (ms)   Price          Gap (ms)   Notes');
  console.log('-'.repeat(80));

  let prevTime: number | null = null;
  for (const dp of session.dataPoints) {
    const gap = prevTime !== null ? dp.relativeTimeMs - prevTime : 0;
    const gapStr = gap > 0 ? `+${gap}ms` : '';
    const note = dp.relativeTimeMs === 0 ? '⚡ FUNDING TIME' :
                 dp.relativeTimeMs > 0 && dp.relativeTimeMs < 100 ? '🎯 Entry window' :
                 gap > 1000 ? '⚠️ BIG GAP!' : '';

    console.log(
      `${dp.relativeTimeMs.toString().padStart(8)}   ` +
      `$${Number(dp.lastPrice).toFixed(6).padEnd(12)}  ` +
      `${gapStr.padEnd(9)}  ` +
      `${note}`
    );
    prevTime = dp.relativeTimeMs;
  }

  console.log('='.repeat(80));
  console.log(`\nTotal data points in -1s to +5s window: ${session.dataPoints.length}`);
  console.log(`Average gap: ${session.dataPoints.length > 1 ?
    ((session.dataPoints[session.dataPoints.length - 1].relativeTimeMs - session.dataPoints[0].relativeTimeMs) / (session.dataPoints.length - 1)).toFixed(0) : 'N/A'}ms`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
