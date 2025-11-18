import prisma from '../lib/prisma';

async function main() {
  console.log('\n📊 Checking Recording Sessions\n');
  console.log('='.repeat(80));

  // Get recent sessions
  const sessions = await prisma.fundingPaymentRecordingSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      _count: {
        select: { dataPoints: true }
      }
    }
  });

  if (sessions.length === 0) {
    console.log('❌ No recording sessions found');
  } else {
    console.log(`Found ${sessions.length} recent sessions:\n`);
    sessions.forEach((s, i) => {
      console.log(`${i + 1}. ${s.createdAt.toISOString()}`);
      console.log(`   Exchange: ${s.exchange}`);
      console.log(`   Symbol: ${s.symbol}`);
      console.log(`   Status: ${s.status}`);
      console.log(`   Data Points: ${s._count.dataPoints}`);
      console.log(`   Funding Rate: ${(s.fundingRate * 100).toFixed(4)}%`);
      console.log('');
    });
  }

  console.log('='.repeat(80));

  // Check current funding rates
  console.log('\n💰 Current Funding Rates (rates <= -1%)\n');
  console.log('='.repeat(80));

  const fundingRates = await prisma.publicFundingRate.findMany({
    where: {
      fundingRate: {
        lte: -0.01
      }
    },
    orderBy: {
      fundingRate: 'asc'
    },
    take: 20
  });

  if (fundingRates.length === 0) {
    console.log('❌ No funding rates found with <= -1%');
  } else {
    console.log(`Found ${fundingRates.length} opportunities:\n`);
    fundingRates.forEach((r, i) => {
      const nextFunding = new Date(r.nextFundingTime);
      const timeUntil = nextFunding.getTime() - Date.now();
      const hoursUntil = (timeUntil / (1000 * 60 * 60)).toFixed(2);

      console.log(`${i + 1}. ${r.exchange.padEnd(8)} | ${r.symbol.padEnd(12)} | Rate: ${(r.fundingRate * 100).toFixed(4)}% | Next: ${nextFunding.toISOString()} (${hoursUntil}h)`);
    });
  }

  console.log('\n='.repeat(80));

  await prisma.$disconnect();
}

main().catch(console.error);
