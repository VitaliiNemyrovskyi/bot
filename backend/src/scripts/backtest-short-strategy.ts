/**
 * Backtest SHORT After Funding Strategy
 * Tests the strategy on recorded data: SHORT at 0s → Close at +3s
 */

import prisma from '../lib/prisma';

async function main() {
  console.log('\n🧪 BACKTESTING SHORT AFTER FUNDING STRATEGY\n');
  console.log('Strategy: SHORT entry at 0s → EXIT at +3s');
  console.log('Fees: 0.055% entry + 0.055% exit = 0.11% total\n');

  // Find all completed recording sessions with data
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    where: {
      status: 'COMPLETED',
      dataPoints: {
        some: {}
      }
    },
    include: {
      dataPoints: {
        orderBy: {
          relativeTimeMs: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Found ${sessions.length} completed recording sessions\n`);

  let totalTests = 0;
  let profitable = 0;
  let losses = 0;
  let totalProfitPct = 0;

  for (const session of sessions) {
    console.log('═'.repeat(70));
    console.log(`📊 Session: ${session.symbol} (${session.exchange})`);
    console.log(`   Funding Rate: ${(session.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Data Points: ${session.dataPoints.length}`);
    console.log(`   Created: ${session.createdAt.toISOString()}`);

    // Find price closest to 0s (SHORT entry)
    let priceAt0s = session.dataPoints.find(dp => Math.abs(dp.relativeTimeMs - 0) < 100);
    if (!priceAt0s) {
      // Find closest to 0
      priceAt0s = session.dataPoints.reduce((prev, curr) =>
        Math.abs(curr.relativeTimeMs - 0) < Math.abs(prev.relativeTimeMs - 0) ? curr : prev
      );
    }

    // Find price closest to +3000ms (SHORT exit)
    let priceAt3s = session.dataPoints.find(dp => Math.abs(dp.relativeTimeMs - 3000) < 200);
    if (!priceAt3s) {
      // Find closest to 3000ms
      priceAt3s = session.dataPoints.reduce((prev, curr) =>
        Math.abs(curr.relativeTimeMs - 3000) < Math.abs(prev.relativeTimeMs - 3000) ? curr : prev
      );
    }

    if (priceAt0s && priceAt3s) {
      const entryPrice = Number(priceAt0s.lastPrice);
      const exitPrice = Number(priceAt3s.lastPrice);

      // SHORT P&L: profit when price drops (entry > exit)
      const priceDrop = ((entryPrice - exitPrice) / entryPrice) * 100;
      const fees = 0.11; // 0.055% * 2
      const netProfit = priceDrop - fees;

      totalTests++;
      totalProfitPct += netProfit;

      if (netProfit > 0) {
        profitable++;
      } else {
        losses++;
      }

      console.log(`\n   📉 SHORT POSITION:`);
      console.log(`      Entry (${priceAt0s.relativeTimeMs}ms):  $${entryPrice.toFixed(6)}`);
      console.log(`      Exit  (${priceAt3s.relativeTimeMs}ms):  $${exitPrice.toFixed(6)}`);
      console.log(`      Price Drop:      ${priceDrop >= 0 ? '+' : ''}${priceDrop.toFixed(4)}%`);
      console.log(`\n   💰 PROFIT/LOSS:`);
      console.log(`      SHORT P&L:       ${priceDrop >= 0 ? '+' : ''}${priceDrop.toFixed(4)}%`);
      console.log(`      Fees (2x 0.055%):-0.1100%`);
      console.log(`      ──────────────────────────────`);
      console.log(`      NET PROFIT:      ${netProfit >= 0 ? '+' : ''}${netProfit.toFixed(4)}%`);
      console.log(`\n   ${netProfit > 0 ? '✅ PROFITABLE' : '❌ LOSS'}`);
    } else {
      console.log(`\n   ⚠️  Insufficient data (missing 0s or +3s prices)`);
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📈 SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Tests:      ${totalTests}`);
  console.log(`Profitable:       ${profitable} (${((profitable / totalTests) * 100).toFixed(1)}%)`);
  console.log(`Losses:           ${losses} (${((losses / totalTests) * 100).toFixed(1)}%)`);
  console.log(`Average Profit:   ${totalTests > 0 ? (totalProfitPct / totalTests).toFixed(4) : '0.0000'}%`);
  console.log(`Total Profit:     ${totalProfitPct >= 0 ? '+' : ''}${totalProfitPct.toFixed(4)}%`);
  console.log('═'.repeat(70) + '\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error:', error);
  prisma.$disconnect();
  process.exit(1);
});
