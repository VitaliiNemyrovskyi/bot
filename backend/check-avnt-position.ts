import prisma from './src/lib/prisma';

async function main() {
  const position = await prisma.graduatedEntryArbitragePosition.findUnique({
    where: { id: 'arb_1_1761254617756' }
  });

  if (!position) {
    console.log('Position not found');
    return;
  }

  console.log('Position details:');
  console.log('  Primary Exchange:', position.primaryExchange);
  console.log('  Hedge Exchange:', position.hedgeExchange);
  console.log('  Symbol:', position.symbol);
  console.log('  Primary Quantity Per Part:', position.primaryQuantityPerPart);
  console.log('  Hedge Quantity Per Part:', position.hedgeQuantityPerPart);
  console.log('  Primary Total Position:', position.primaryTotalPosition);
  console.log('  Hedge Total Position:', position.hedgeTotalPosition);

  await prisma.$disconnect();
}

main();
