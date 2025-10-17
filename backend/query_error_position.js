const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const position = await prisma.graduatedEntryPosition.findUnique({
    where: { positionId: 'arb_1_1760691530515' },
  });

  console.log('\n=== Position Details ===\n');
  console.log(JSON.stringify(position, null, 2));

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
