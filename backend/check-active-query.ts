import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  console.log('\n=== Checking Active Positions Query ===\n');

  // Exact same query as API uses
  const positions = await prisma.graduatedEntryPosition.findMany({
    where: {
      userId: 'admin_1',
      status: {
        in: ['INITIALIZING', 'EXECUTING', 'ACTIVE'],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`Found ${positions.length} positions:\n`);

  positions.forEach((pos: typeof positions[number]) => {
    console.log(`  Position: ${pos.positionId}`);
    console.log(`  Status: ${pos.status}`);
    console.log(`  Created: ${pos.createdAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

check();
