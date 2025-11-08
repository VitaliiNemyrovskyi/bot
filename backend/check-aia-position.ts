import prisma from './src/lib/prisma.js';

async function main() {
  const positions = await prisma.graduatedEntryPosition.findMany({
    where: {
      symbol: { contains: 'AIA' }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`\n=== Found ${positions.length} AIA positions ===\n`);

  for (const pos of positions) {
    console.log('\n=== POSITION DETAILS ===');
    console.log('Position ID:', pos.positionId);
    console.log('Symbol:', pos.symbol);
    console.log('Status:', pos.status);
    console.log('Created:', pos.createdAt);
    console.log('\nPRIMARY (Gate.io):');
    console.log('  Exchange:', pos.primaryExchange);
    console.log('  Side:', pos.primarySide);
    console.log('  Leverage:', pos.primaryLeverage, 'x');
    console.log('  Quantity:', pos.primaryQuantity);
    console.log('  Filled:', pos.primaryFilledQty);
    console.log('  Status:', pos.primaryStatus);
    console.log('  Error:', pos.primaryErrorMessage || 'None');
    console.log('\nHEDGE (Bybit):');
    console.log('  Exchange:', pos.hedgeExchange);
    console.log('  Side:', pos.hedgeSide);
    console.log('  Leverage:', pos.hedgeLeverage, 'x');
    console.log('  Quantity:', pos.hedgeQuantity);
    console.log('  Filled:', pos.hedgeFilledQty);
    console.log('  Status:', pos.hedgeStatus);
    console.log('  Error:', pos.hedgeErrorMessage || 'None');
    console.log('\n' + '='.repeat(50));
  }

  await prisma.$disconnect();
}

main().catch(console.error);
