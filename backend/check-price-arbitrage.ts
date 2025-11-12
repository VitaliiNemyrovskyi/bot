import prisma from './src/lib/prisma';

async function main() {
  const positions = await prisma.priceArbitragePosition.findMany({
    where: { symbol: 'AIAUSDT' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`\nFound ${positions.length} AIAUSDT price arbitrage position(s):\n`);

  positions.forEach((p, idx) => {
    console.log(`${idx + 1}. ID: ${p.id.substring(0, 8)}... [${p.status}]`);
    console.log(`   Primary: ${p.primaryExchange} ${p.primaryQuantity} @ $${p.entryPrimaryPrice}`);
    console.log(`   Hedge: ${p.hedgeExchange} ${p.hedgeQuantity} @ $${p.entryHedgePrice}`);
    console.log(`   Spread: ${p.entrySpreadPercent}%`);
    console.log(`   Created: ${p.createdAt}`);
    if (p.openedAt) console.log(`   Opened: ${p.openedAt}`);
    if (p.closedAt) console.log(`   Closed: ${p.closedAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
