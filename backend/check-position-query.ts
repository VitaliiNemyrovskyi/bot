import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPosition() {
  try {
    const position = await prisma.graduatedEntryPosition.findFirst({
      where: { positionId: 'arb_1_1762607481836' }
    });

    if (position) {
      console.log('✅ Position found in database:');
      console.log(JSON.stringify(position, null, 2));
    } else {
      console.log('❌ Position NOT found in database');

      // Check if there are any positions in the table
      const count = await prisma.graduatedEntryPosition.count();
      console.log(`\nTotal positions in database: ${count}`);

      // Check recent positions
      const recent = await prisma.graduatedEntryPosition.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          positionId: true,
          status: true,
          symbol: true,
          errorMessage: true,
          createdAt: true
        }
      });

      console.log('\nRecent positions:');
      console.log(JSON.stringify(recent, null, 2));
    }
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

checkPosition();
