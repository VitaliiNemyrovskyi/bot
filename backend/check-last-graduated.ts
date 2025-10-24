import prisma from './src/lib/prisma';

async function main() {
  const pos = await prisma.graduatedEntryPosition.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  
  if (pos) {
    console.log('Position ID:', pos.positionId);
    console.log('Status:', pos.status);
    console.log('Primary:', pos.primaryExchange, '-', pos.primaryStatus, '- Filled:', pos.primaryFilledQty);
    console.log('Hedge:', pos.hedgeExchange, '-', pos.hedgeStatus, '- Filled:', pos.hedgeFilledQty);
    console.log('Primary Error:', pos.primaryErrorMessage || 'None');
    console.log('Hedge Error:', pos.hedgeErrorMessage || 'None');
  } else {
    console.log('No positions found');
  }
  
  await prisma.$disconnect();
}

main();
