/**
 * Check exchange credentials in database
 */

import prisma from './src/lib/prisma';

async function checkCredentials() {
  console.log('🔍 Checking Binance and BingX credentials...\n');

  try {
    // Get all BINANCE and BINGX credentials
    const credentials = await prisma.exchangeCredentials.findMany({
      where: {
        exchange: {
          in: ['BINANCE', 'BINGX'],
        },
      },
      select: {
        id: true,
        exchange: true,
        label: true,
        isActive: true,
        makerFeeRate: true,
        takerFeeRate: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${credentials.length} credentials:\n`);

    credentials.forEach((cred: typeof credentials[number], i: number) => {
      console.log(`${i + 1}. ${cred.exchange} - ${cred.label}`);
      console.log(`   ID: ${cred.id}`);
      console.log(`   Active: ${cred.isActive}`);
      console.log(`   Maker fee: ${cred.makerFeeRate}`);
      console.log(`   Taker fee: ${cred.takerFeeRate}`);
      console.log(`   Created: ${cred.createdAt}\n`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCredentials();
