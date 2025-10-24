import prisma from './src/lib/prisma';

async function main() {
  const pos = await prisma.graduatedEntryPosition.findFirst({
    where: { symbol: 'OPENUSDT' },
    orderBy: { createdAt: 'desc' }
  });
  
  if (pos) {
    console.log('\n=== POSITION DETAILS ===');
    console.log('Position ID:', pos.positionId);
    console.log('Symbol:', pos.symbol);
    console.log('Status:', pos.status);
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
  } else {
    console.log('No OPENUSDT position found');
  }
  
  await prisma.$disconnect();
}

main();
