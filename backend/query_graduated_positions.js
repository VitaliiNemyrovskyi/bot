const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const positions = await prisma.graduatedEntryPosition.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      positionId: true,
      symbol: true,
      status: true,
      primaryExchange: true,
      hedgeExchange: true,
      createdAt: true,
    },
  });

  console.log('\n=== Recent Graduated Entry Positions ===\n');
  positions.forEach(p => {
    console.log(`Position: ${p.positionId}`);
    console.log(`  Symbol: ${p.symbol}`);
    console.log(`  Status: ${p.status}`);
    console.log(`  Primary: ${p.primaryExchange}, Hedge: ${p.hedgeExchange}`);
    console.log(`  Created: ${p.createdAt}`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
