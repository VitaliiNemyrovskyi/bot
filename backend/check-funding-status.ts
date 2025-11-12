import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkResults() {
  try {
    console.log('='.repeat(60));
    console.log('FUNDING RATES DATABASE STATUS');
    console.log('='.repeat(60));
    console.log('');

    // Total count
    const total = await prisma.publicFundingRate.count();
    console.log('Total records:', total);
    console.log('');

    // By exchange
    console.log('Breakdown by exchange:');
    const byExchange = await prisma.publicFundingRate.groupBy({
      by: ['exchange'],
      _count: true,
    });
    byExchange.forEach(item => {
      console.log(`  ${item.exchange}: ${item._count} symbols`);
    });
    console.log('');

    // BingX interval distribution
    console.log('BingX funding interval distribution:');
    const bingxIntervals = await prisma.publicFundingRate.groupBy({
      by: ['fundingInterval'],
      where: { exchange: 'BINGX' },
      _count: true,
    });
    if (bingxIntervals.length > 0) {
      bingxIntervals.forEach(item => {
        const label = item.fundingInterval === 0 ? 'Unknown (0h)' : `${item.fundingInterval}h`;
        console.log(`  ${label}: ${item._count} symbols`);
      });
    } else {
      console.log('  No BingX records found yet');
    }
    console.log('');

    await prisma.$disconnect();
  } catch (error: any) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkResults();
