const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCredentials() {
  try {
    const count = await prisma.exchangeCredentials.count();
    console.log(`Total ExchangeCredentials: ${count}`);

    if (count > 0) {
      const credentials = await prisma.exchangeCredentials.findMany({
        select: {
          id: true,
          exchange: true,
          label: true,
          isActive: true,
          userId: true,
        }
      });
      console.log('Credentials:', JSON.stringify(credentials, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCredentials();
