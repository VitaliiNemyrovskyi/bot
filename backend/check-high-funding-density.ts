import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const session = await prisma.fundingPaymentRecordingSession.findFirst({
    where: {
      status: 'COMPLETED',
      OR: [
        { fundingRate: { gte: 0.01 } },  // >= 1%
        { fundingRate: { lte: -0.01 } }  // <= -1%
      ],
      dataPoints: { some: {} }
    },
    include: {
      dataPoints: {
        where: { relativeTimeMs: { gte: -1000, lte: 30000 } },
        orderBy: { relativeTimeMs: 'asc' }
      }
    },
    orderBy: {
      fundingRate: 'asc' // Get the most negative (highest absolute) funding rate
    }
  });

  if (!session) {
    console.log('No high funding sessions found');
    return;
  }

  console.log('\n📊 HIGH FUNDING RATE - Data point density around funding time');
  console.log(`Symbol: ${session.symbol}`);
  console.log(`Exchange: ${session.exchange}`);
  console.log(`Funding Rate: ${(session.fundingRate * 100).toFixed(4)}% 🔥`);
  console.log(`Expected Time: ${session.expectedFundingTime}`);
  console.log('\n' + '='.repeat(100));
  console.log('Time (ms)   Price          Change %    Gap (ms)   Notes');
  console.log('-'.repeat(100));

  let prevTime: number | null = null;
  let prevPrice: number | null = null;
  const basePrice = Number(session.dataPoints[0].lastPrice);

  for (const dp of session.dataPoints) {
    const gap = prevTime !== null ? dp.relativeTimeMs - prevTime : 0;
    const gapStr = gap > 0 ? `${gap}ms` : '';

    const currentPrice = Number(dp.lastPrice);
    const priceChange = prevPrice !== null
      ? ((currentPrice - prevPrice) / prevPrice * 100)
      : 0;
    const totalChange = ((currentPrice - basePrice) / basePrice * 100);

    const changeStr = priceChange !== 0
      ? `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(3)}%`
      : '';

    let note = '';
    if (dp.relativeTimeMs === 0) note = '⚡ FUNDING TIME';
    else if (dp.relativeTimeMs > 0 && dp.relativeTimeMs <= 100) note = '🎯 Immediate drop zone';
    else if (dp.relativeTimeMs > 100 && dp.relativeTimeMs <= 800) note = '📈 Potential rebound zone';
    else if (dp.relativeTimeMs > 800 && dp.relativeTimeMs <= 2000) note = '🎰 Second wave entry';
    else if (dp.relativeTimeMs > 10000 && dp.relativeTimeMs <= 20000) note = '💰 Exit zone';

    if (totalChange < -0.5) note += ' 💥 BIG DROP!';
    else if (totalChange > 0.2 && dp.relativeTimeMs > 100) note += ' ⚠️ Price rebounded';

    console.log(
      `${dp.relativeTimeMs.toString().padStart(8)}   ` +
      `$${currentPrice.toFixed(6).padEnd(12)}  ` +
      `${changeStr.padEnd(9)}  ` +
      `${gapStr.padEnd(9)}  ` +
      `${note}`
    );
    prevTime = dp.relativeTimeMs;
    prevPrice = currentPrice;
  }

  console.log('='.repeat(100));
  console.log(`\nTotal data points in -1s to +30s window: ${session.dataPoints.length}`);
  if (session.dataPoints.length > 1) {
    const avgGap = (session.dataPoints[session.dataPoints.length - 1].relativeTimeMs -
                    session.dataPoints[0].relativeTimeMs) / (session.dataPoints.length - 1);
    console.log(`Average gap: ${avgGap.toFixed(0)}ms`);
  }

  // Calculate max drop
  const prices = session.dataPoints.map(dp => Number(dp.lastPrice));
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const maxDrop = ((maxPrice - minPrice) / maxPrice) * 100;

  console.log(`\n📉 Price range: $${maxPrice.toFixed(6)} → $${minPrice.toFixed(6)}`);
  console.log(`📊 Maximum drop: ${maxDrop.toFixed(4)}%`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
