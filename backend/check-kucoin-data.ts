import prisma from './src/lib/prisma';

async function checkKuCoinData() {
  try {
    // Count total KuCoin records
    const count = await prisma.publicFundingRate.count({
      where: { exchange: 'KUCOIN' }
    });
    console.log('📊 KuCoin записів в БД:', count);

    // Get latest record
    const latest = await prisma.publicFundingRate.findFirst({
      where: { exchange: 'KUCOIN' },
      orderBy: { timestamp: 'desc' }
    });

    if (latest) {
      console.log('⏰ Останній запис:', new Date(latest.timestamp).toISOString());
      console.log('💰 Символ:', latest.symbol);
      console.log('📈 Funding rate:', latest.fundingRate);
    } else {
      console.log('❌ НЕМАЄ ЖОДНОГО ЗАПИСУ!');
    }

    // Check if there are any records in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'KUCOIN',
        timestamp: { gte: oneDayAgo }
      }
    });
    console.log('📅 Записів за останні 24 години:', recentCount);

  } catch (error) {
    console.error('❌ Помилка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKuCoinData();
