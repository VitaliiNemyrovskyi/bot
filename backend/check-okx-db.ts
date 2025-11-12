import prisma from './src/lib/prisma';

async function checkOKX() {
  try {
    const rates = await prisma.publicFundingRate.findMany({
      where: { exchange: 'OKX' },
      take: 5,
      orderBy: { timestamp: 'desc' }
    });

    console.log('OKX Records:', JSON.stringify(rates, null, 2));

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkOKX();
