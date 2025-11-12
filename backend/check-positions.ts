import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPositions() {
  try {
    const positions = await prisma.graduatedEntryPosition.findMany({
      where: {
        userId: 'admin_1',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    console.log('\n=== Graduated Entry Positions ===\n');
    positions.forEach((pos: typeof positions[number], index: number) => {
      console.log(`${index + 1}. Position: ${pos.positionId}`);
      console.log(`   Symbol: ${pos.symbol}`);
      console.log(`   Status: ${pos.status}`);
      console.log(`   Created: ${pos.createdAt}`);
      console.log(`   Primary: ${pos.primaryExchange} (${pos.primarySide})`);
      console.log(`   Hedge: ${pos.hedgeExchange} (${pos.hedgeSide})`);
      console.log('');
    });

    console.log(`Total positions: ${positions.length}\n`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPositions();
