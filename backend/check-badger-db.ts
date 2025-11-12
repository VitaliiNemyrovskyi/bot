import prisma from './src/lib/prisma';

async function checkBADGER() {
  try {
    // Check all BADGER variations in database
    const variations = [
      'BADGERUSDT',
      'BADGER/USDT',
      'BADGER-USDT',
      'BADGER_USDT'
    ];

    console.log('=== BADGER Symbol Check ===\n');

    for (const symbol of variations) {
      const rates = await prisma.publicFundingRate.findMany({
        where: {
          symbol: {
            contains: symbol
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 5
      });

      if (rates.length > 0) {
        console.log(`Found ${rates.length} records for "${symbol}":`);
        rates.forEach(r => {
          console.log(`  ${r.exchange}: ${r.symbol} - Rate: ${r.fundingRate}, Interval: ${r.fundingInterval}h, Time: ${r.timestamp}`);
        });
      } else {
        console.log(`No records found for "${symbol}"`);
      }
      console.log('');
    }

    // Check BADGER on specific exchanges
    console.log('=== Exchange-Specific Check ===\n');

    const gateio = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'GATEIO',
        symbol: {
          contains: 'BADGER'
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 3
    });

    const binance = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'BINANCE',
        symbol: {
          contains: 'BADGER'
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 3
    });

    console.log(`Gate.io BADGER records: ${gateio.length}`);
    gateio.forEach(r => console.log(`  ${r.symbol} - ${r.fundingRate} - ${r.fundingInterval}h`));

    console.log(`\nBinance BADGER records: ${binance.length}`);
    binance.forEach(r => console.log(`  ${r.symbol} - ${r.fundingRate} - ${r.fundingInterval}h`));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkBADGER();
