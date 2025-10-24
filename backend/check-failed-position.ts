import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPosition() {
  const positionId = 'tri_arb_1761137937704';

  const position = await prisma.triangularArbitragePosition.findUnique({
    where: { positionId }
  });

  if (!position) {
    console.log('Position not found');
    return;
  }

  console.log('=== Position Details ===');
  console.log('Position ID:', position.positionId);
  console.log('Exchange:', position.exchange);
  console.log('Status:', position.status);
  console.log('Current Leg:', position.currentLeg);
  console.log('Entry Quantity:', position.entryQuantity);
  console.log('');
  console.log('Leg 1:');
  console.log('  Symbol:', position.leg1Symbol);
  console.log('  Side:', position.leg1Side);
  console.log('  Quantity:', position.leg1Quantity);
  console.log('  Filled Qty:', position.leg1FilledQty);
  console.log('  Order ID:', position.leg1OrderId);
  console.log('  Avg Price:', position.leg1AvgPrice);
  console.log('');
  console.log('Leg 2:');
  console.log('  Symbol:', position.leg2Symbol);
  console.log('  Side:', position.leg2Side);
  console.log('  Quantity:', position.leg2Quantity);
  console.log('  Filled Qty:', position.leg2FilledQty);
  console.log('  Order ID:', position.leg2OrderId);
  console.log('');
  console.log('Leg 3:');
  console.log('  Symbol:', position.leg3Symbol);
  console.log('  Side:', position.leg3Side);
  console.log('  Quantity:', position.leg3Quantity);
  console.log('  Filled Qty:', position.leg3FilledQty);
  console.log('');
  console.log('Error Message:', position.errorMessage);

  await prisma.$disconnect();
}

checkPosition().catch(console.error);
