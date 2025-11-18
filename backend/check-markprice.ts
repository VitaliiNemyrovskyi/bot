import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMarkPrice() {
  const symbols = ['ETH/USDT', 'DOT/USDT', 'LINK/USDT', 'OP/USDT'];

  for (const symbol of symbols) {
    const rates = await prisma.publicFundingRate.findMany({
      where: { symbol },
      orderBy: { timestamp: 'desc' },
      take: 3,
      select: {
        symbol: true,
        exchange: true,
        markPrice: true,
        fundingRate: true,
        timestamp: true,
      }
    });

    console.log(`\n${symbol}:`);
    rates.forEach(r => {
      console.log(`  ${r.exchange}: markPrice=${r.markPrice}, fundingRate=${r.fundingRate}, time=${r.timestamp}`);
    });
  }

  await prisma.$disconnect();
}

checkMarkPrice().catch(console.error);
