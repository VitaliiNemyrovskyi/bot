import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPosition() {
  const positionId = 'arb_1_1761461577842';

  const position = await prisma.graduatedEntryPosition.findFirst({
    where: { positionId },
    select: {
      id: true,
      positionId: true,
      symbol: true,
      status: true,
      currentPart: true,
      graduatedParts: true,
      primaryFilledQty: true,
      hedgeFilledQty: true,
      primaryOrderIds: true,
      hedgeOrderIds: true,
      primaryStatus: true,
      hedgeStatus: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
    },
  });

  console.log('\n=== Position Data for', positionId, '===\n');
  console.log(JSON.stringify(position, null, 2));

  if (position) {
    console.log('\n=== Analysis ===');
    console.log(`Current Part: ${position.currentPart} / ${position.graduatedParts}`);
    console.log(`Primary Filled: ${position.primaryFilledQty}`);
    console.log(`Hedge Filled: ${position.hedgeFilledQty}`);
    console.log(`Primary Orders: ${position.primaryOrderIds.length}`);
    console.log(`Hedge Orders: ${position.hedgeOrderIds.length}`);
    console.log(`Status: ${position.status}`);
    console.log(`Primary Status: ${position.primaryStatus}`);
    console.log(`Hedge Status: ${position.hedgeStatus}`);
  }

  await prisma.$disconnect();
}

checkPosition().catch(console.error);
