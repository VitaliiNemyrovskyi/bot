import prisma from './src/lib/prisma';

async function checkPosition() {
  const positionId = 'arb_1_1761146885149';

  console.log(`Checking position: ${positionId}`);

  try {
    const position = await prisma.priceArbitragePosition.findUnique({
      where: { id: positionId }
    });

    if (position) {
      console.log('\n✅ Position found in database:');
      console.log(JSON.stringify(position, null, 2));
    } else {
      console.log('\n❌ Position NOT found in database');

      // Check all recent positions
      console.log('\nChecking last 5 positions...');
      const recent = await prisma.priceArbitragePosition.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      console.log(`\nFound ${recent.length} recent positions:`);
      recent.forEach(p => {
        console.log(`  - ${p.id} (${p.status}) - ${p.symbol} - ${p.createdAt}`);
      });
    }
  } catch (error: any) {
    console.error('\n❌ Error querying database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPosition();
