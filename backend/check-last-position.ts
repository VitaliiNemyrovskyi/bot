import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const pos = await prisma.graduatedEntryPosition.findFirst({
    where: { positionId: 'arb_1_1760653123556' }
  });

  console.log('\nPosition Details:');
  console.log('  ID:', pos?.positionId);
  console.log('  Status:', pos?.status);
  console.log('  Current Part:', pos?.currentPart, '/', pos?.graduatedParts);
  console.log('  Primary Filled:', pos?.primaryFilledQty, '/', pos?.primaryQuantity);
  console.log('  Hedge Filled:', pos?.hedgeFilledQty, '/', pos?.hedgeQuantity);
  console.log('  Created:', pos?.createdAt);
  console.log('  Started:', pos?.startedAt);
  console.log('  Completed:', pos?.completedAt);

  await prisma.$disconnect();
}

check();
