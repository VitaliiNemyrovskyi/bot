import prisma from './src/lib/prisma';

async function checkBingXStats() {
  try {
    // Total BingX symbols
    const totalCount = await prisma.publicFundingRate.count({
      where: { exchange: 'BINGX' }
    });

    // Symbols with fundingInterval = 0 (unknown)
    const unknownInterval = await prisma.publicFundingRate.count({
      where: {
        exchange: 'BINGX',
        fundingInterval: 0
      }
    });

    // Symbols with fundingInterval > 0 (known)
    const knownInterval = await prisma.publicFundingRate.count({
      where: {
        exchange: 'BINGX',
        fundingInterval: { gt: 0 }
      }
    });

    // Get oldest timestamp
    const oldestRecord = await prisma.publicFundingRate.findFirst({
      where: { exchange: 'BINGX' },
      orderBy: { timestamp: 'asc' }
    });

    // Get newest timestamp
    const newestRecord = await prisma.publicFundingRate.findFirst({
      where: { exchange: 'BINGX' },
      orderBy: { timestamp: 'desc' }
    });

    // Breakdown by interval
    const intervalBreakdown = await prisma.publicFundingRate.groupBy({
      by: ['fundingInterval'],
      where: { exchange: 'BINGX' },
      _count: true
    });

    console.log('=== BingX Statistics ===');
    console.log(`Total symbols: ${totalCount}`);
    console.log(`Known interval: ${knownInterval}`);
    console.log(`Unknown interval (0): ${unknownInterval}`);
    console.log(`Percentage with known interval: ${((knownInterval / totalCount) * 100).toFixed(1)}%`);
    console.log('');
    console.log('Interval breakdown:');
    intervalBreakdown.sort((a, b) => a.fundingInterval - b.fundingInterval).forEach(item => {
      const hours = item.fundingInterval === 0 ? 'Unknown' : `${item.fundingInterval}h`;
      console.log(`  ${hours}: ${item._count} symbols`);
    });
    console.log('');
    console.log(`Oldest record: ${oldestRecord?.timestamp}`);
    console.log(`Newest record: ${newestRecord?.timestamp}`);

    if (oldestRecord && newestRecord) {
      const ageInDays = (newestRecord.timestamp.getTime() - oldestRecord.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      console.log(`Data age: ${ageInDays.toFixed(1)} days`);
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkBingXStats();
