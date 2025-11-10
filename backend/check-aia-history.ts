import prisma from './src/lib/prisma';

async function main() {
  const positions = await prisma.graduatedEntryPosition.findMany({
    where: { symbol: 'AIAUSDT' },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`\nFound ${positions.length} AIAUSDT graduated entry position(s):\n`);

  positions.forEach((p, i) => {
    console.log(`${i + 1}. ${p.positionId} [${p.status}]`);
    console.log(`   Primary: ${p.primaryExchange} ${p.primarySide} ${p.primaryFilledQty} @ $${p.primaryEntryPrice}`);
    console.log(`   Hedge: ${p.hedgeExchange} ${p.hedgeSide} ${p.hedgeFilledQty} @ $${p.hedgeEntryPrice}`);
    console.log(`   Graduated: ${p.currentPart}/${p.graduatedParts} parts`);
    console.log(`   Created: ${p.createdAt}`);
    if (p.completedAt) console.log(`   Completed: ${p.completedAt}`);
    if (p.errorMessage) console.log(`   Error: ${p.errorMessage}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
