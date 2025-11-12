import prisma from './src/lib/prisma';

async function checkPosition() {
  const positionId = 'arb_1_1761146885149';

  console.log(`Checking graduated entry position: ${positionId}`);

  try {
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId }
    });

    if (position) {
      console.log('\n✅ Position found in graduatedEntryPosition table:');
      console.log(JSON.stringify(position, null, 2));
    } else {
      console.log('\n❌ Position NOT found in graduatedEntryPosition table');

      // Check all recent graduated entry positions
      console.log('\nChecking last 5 graduated entry positions...');
      const recent = await prisma.graduatedEntryPosition.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      console.log(`\nFound ${recent.length} recent graduated entry positions:`);
      recent.forEach((p: typeof recent[number]) => {
        console.log(`  - ${p.positionId} (${p.status}) - ${p.symbol} - ${p.createdAt}`);
      });
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('\n❌ Error querying database:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosition();
