import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPositionDetails() {
  try {
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' }
    });

    if (!position) {
      console.log('Position not found');
      return;
    }

    console.log('\n=== ALL POSITION FIELDS ===');
    console.log(JSON.stringify(position, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPositionDetails();
