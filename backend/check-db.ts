import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('📊 Статистика по базі даних:\n');

  const exchanges = ['BYBIT', 'BINANCE', 'GATEIO', 'OKX', 'KUCOIN', 'BITGET', 'BINGX'];
  let totalSymbols = 0;

  for (const exchange of exchanges) {
    const count = await prisma.publicFundingRate.count({
      where: { exchange: exchange as any }
    });

    totalSymbols += count;
    console.log(`${exchange.padEnd(10)} - ${count} символів`);

    if (count > 0 && count <= 5) {
      // Показати всі записи для бірж з малою кількістю
      const all = await prisma.publicFundingRate.findMany({
        where: { exchange: exchange as any },
        orderBy: { fundingRate: 'asc' }
      });

      all.forEach(s => {
        const timeUntil = s.nextFundingTime.getTime() - Date.now();
        const hoursUntil = Math.floor(timeUntil / 1000 / 60 / 60);
        const minsUntil = Math.floor((timeUntil / 1000 / 60) % 60);

        console.log(`  • ${s.symbol.padEnd(20)} Rate: ${(s.fundingRate * 100).toFixed(4)}%  Next: ${hoursUntil}h ${minsUntil}m`);
      });
    } else if (count > 5) {
      // Показати топ-3 для великих бірж
      const top3 = await prisma.publicFundingRate.findMany({
        where: { exchange: exchange as any },
        take: 3,
        orderBy: { fundingRate: 'asc' }
      });

      top3.forEach(s => {
        const timeUntil = s.nextFundingTime.getTime() - Date.now();
        const hoursUntil = Math.floor(timeUntil / 1000 / 60 / 60);
        const minsUntil = Math.floor((timeUntil / 1000 / 60) % 60);

        console.log(`  • ${s.symbol.padEnd(20)} Rate: ${(s.fundingRate * 100).toFixed(4)}%  Next: ${hoursUntil}h ${minsUntil}m`);
      });
    }

    console.log('');
  }

  console.log(`\n💾 Всього символів у БД: ${totalSymbols}`);

  await prisma.$disconnect();
}

check();
