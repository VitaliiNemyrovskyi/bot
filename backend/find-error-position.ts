import prisma from './src/lib/prisma';

async function main() {
  const positions = await prisma.graduatedEntryPosition.findMany({
    where: { status: 'ERROR' },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  if (positions.length === 0) {
    console.log('No ERROR positions found');
    return;
  }

  console.log(`Found ${positions.length} ERROR position(s):\n`);

  positions.forEach((p, i) => {
    console.log(`${i + 1}. Position ID: ${p.positionId}`);
    console.log(`   Symbol: ${p.symbol}`);
    console.log(`   Primary: ${p.primaryExchange} (filled: ${p.primaryFilledQty})`);
    console.log(`   Hedge: ${p.hedgeExchange} (filled: ${p.hedgeFilledQty})`);
    console.log(`   Error: ${p.errorMessage}`);
    console.log(`   Created: ${p.createdAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
