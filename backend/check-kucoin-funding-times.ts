import prisma from './src/lib/prisma';

async function checkFundingTimes() {
  const rates = await prisma.publicFundingRate.findMany({
    where: {
      exchange: 'KUCOIN',
      symbol: 'RESOLV/USDT'
    },
    orderBy: { timestamp: 'desc' },
    take: 5
  });

  console.log('='.repeat(70));
  console.log('KuCoin RESOLV/USDT Funding Rate Records');
  console.log('='.repeat(70));

  rates.forEach((r, i) => {
    console.log(`\n[${i + 1}]`);
    console.log('  Timestamp:', r.timestamp.toISOString());
    console.log('  Next Funding Time:', r.nextFundingTime.toISOString());
    console.log('  Funding Interval:', r.fundingInterval, 'hours');
    console.log('  Funding Rate:', (r.fundingRate * 100).toFixed(4), '%');

    // Check if nextFundingTime is exactly on the hour
    const date = new Date(r.nextFundingTime);
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();

    if (minutes === 0 && seconds === 0 && ms === 0) {
      console.log('  ✅ Exact hour (00:00:00)');
    } else {
      console.log(`  ⚠️  NOT exact hour (${minutes}:${seconds}.${ms})`);
    }
  });

  console.log('\n' + '='.repeat(70));

  await prisma.$disconnect();
}

checkFundingTimes();
