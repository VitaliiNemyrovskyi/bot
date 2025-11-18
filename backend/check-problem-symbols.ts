import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProblemSymbols() {
  const problemSymbols = ['MATIC/USDT', 'JELLYJELLY/USDT', 'TESTADL/USDT', 'TESTC/USDT', 'TESTZEUS/USDT'];

  for (const symbol of problemSymbols) {
    console.log(`\n=== ${symbol} ===`);

    const rates = await prisma.publicFundingRate.findMany({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
      select: {
        symbol: true,
        exchange: true,
        markPrice: true,
        fundingRate: true,
        timestamp: true,
      }
    });

    if (rates.length === 0) {
      console.log('  NO DATA in database');
    } else {
      rates.forEach(r => {
        console.log(`  ${r.exchange}: markPrice=${r.markPrice}, fundingRate=${r.fundingRate}, time=${r.timestamp}`);
      });
    }
  }

  await prisma.$disconnect();
}

checkProblemSymbols().catch(console.error);
