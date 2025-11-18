/**
 * Analyze Maximum Price Drop After Funding Payment
 */

import prisma from '../lib/prisma';

async function main() {
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: { status: 'COMPLETED' },
    include: {
      dataPoints: {
        orderBy: { relativeTimeMs: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('\n📊 MAXIMUM PRICE DROP ANALYSIS\n');
  console.log('='.repeat(90));

  for (const session of sessions) {
    console.log(`\n📈 ${session.symbol} (Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%)`);
    console.log(`   Data Points: ${session.dataPoints.length}`);

    // Find price at 0s (fair price)
    const priceAt0s = session.dataPoints.reduce((prev, curr) =>
      Math.abs(curr.relativeTimeMs) < Math.abs(prev.relativeTimeMs) ? curr : prev
    );

    const fairPrice = Number(priceAt0s.lastPrice);
    console.log(`\n   Fair Price (0s): $${fairPrice.toFixed(6)}`);

    // Find all points after 0s
    const pointsAfter0s = session.dataPoints.filter(dp => dp.relativeTimeMs >= 0);

    if (pointsAfter0s.length === 0) {
      console.log('   ⚠️  No data points after 0s');
      continue;
    }

    // Find minimum price and when it occurred
    let minPrice = Infinity;
    let minPriceTime = 0;
    let maxDrop = -Infinity;
    let maxDropTime = 0;

    for (const point of pointsAfter0s) {
      const price = Number(point.lastPrice);
      const drop = ((fairPrice - price) / fairPrice) * 100;

      if (price < minPrice) {
        minPrice = price;
        minPriceTime = point.relativeTimeMs;
      }

      if (drop > maxDrop) {
        maxDrop = drop;
        maxDropTime = point.relativeTimeMs;
      }
    }

    console.log(`\n   📉 MAXIMUM DROP:`);
    console.log(`      Lowest Price:    $${minPrice.toFixed(6)} (at +${(minPriceTime / 1000).toFixed(2)}s)`);
    console.log(`      Drop Amount:     $${(fairPrice - minPrice).toFixed(6)}`);
    console.log(`      Drop %:          ${maxDrop >= 0 ? '+' : ''}${maxDrop.toFixed(4)}% (SHORT profit)`);
    console.log(`      Best Exit Time:  +${(maxDropTime / 1000).toFixed(2)}s`);

    // Calculate profit if we exited at best time
    const fees = 0.11;
    const netProfit = maxDrop - fees;
    console.log(`\n      Net Profit (with fees): ${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(4)}%`);

    // Show price progression every 1s for first 10s
    console.log(`\n   ⏱️  PRICE PROGRESSION:`);
    console.log(`      Time    Price         Change      SHORT P&L`);
    console.log('      ' + '─'.repeat(50));

    for (let t = 0; t <= 10000; t += 1000) {
      const point = session.dataPoints.reduce((prev, curr) =>
        Math.abs(curr.relativeTimeMs - t) < Math.abs(prev.relativeTimeMs - t) ? curr : prev
      );

      if (point && Math.abs(point.relativeTimeMs - t) < 500) {
        const price = Number(point.lastPrice);
        const change = ((price - fairPrice) / fairPrice) * 100;
        const shortPnl = ((fairPrice - price) / fairPrice) * 100;

        console.log(
          `      +${(t / 1000).toFixed(0)}s     $${price.toFixed(6)}   ${change >= 0 ? '+' : ''}${change.toFixed(4)}%   ${shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(4)}%`
        );
      }
    }
  }

  console.log('\n' + '='.repeat(90) + '\n');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  prisma.$disconnect();
  process.exit(1);
});
