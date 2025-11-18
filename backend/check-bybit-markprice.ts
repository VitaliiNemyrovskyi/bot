import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const symbols = ['ETH/USDT', 'DOT/USDT', 'LINK/USDT', 'OP/USDT'];
  const exchanges = ['BYBIT', 'BINGX', 'BITGET'];

  for (const exchange of exchanges) {
    console.log(`\n${exchange}:`);
    for (const symbol of symbols) {
      const rate = await prisma.publicFundingRate.findFirst({
        where: { symbol, exchange: exchange as any },
        orderBy: { timestamp: 'desc' },
        select: { markPrice: true, fundingRate: true, timestamp: true }
      });
      if (rate) {
        console.log(`  ${symbol}: markPrice=${rate.markPrice}, fundingRate=${rate.fundingRate}`);
      } else {
        console.log(`  ${symbol}: NO DATA`);
      }
    }
  }

  await prisma.$disconnect();
}

check().catch(console.error);
