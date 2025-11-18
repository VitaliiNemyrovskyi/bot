import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkKuCoinFundingTime() {
  const kucoinRates = await prisma.publicFundingRate.findMany({
    where: {
      exchange: 'KUCOIN',
      symbol: {
        in: ['WCT/USDT', 'SOON/USDT', 'DASH/USDT', 'NC/USDT', 'RESOLV/USDT']
      }
    },
    select: {
      symbol: true,
      fundingRate: true,
      nextFundingTime: true,
      fundingInterval: true,
      timestamp: true
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 10
  });

  console.log('KuCoin Funding Rates:\n');
  kucoinRates.forEach(rate => {
    console.log(`Symbol: ${rate.symbol}`);
    console.log(`  Funding Rate: ${rate.fundingRate}`);
    console.log(`  Next Funding Time: ${rate.nextFundingTime}`);
    console.log(`  Funding Interval: ${rate.fundingInterval}`);
    console.log(`  Timestamp: ${rate.timestamp}`);
    console.log('');
  });

  await prisma.$disconnect();
}

checkKuCoinFundingTime().catch(console.error);
