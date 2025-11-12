import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBitgetCredentials() {
  try {
    console.log('Checking Bitget/OKX/MEXC credentials in database...\n');

    const credentials = await prisma.exchangeCredentials.findMany({
      where: {
        exchange: {
          in: ['BITGET', 'OKX', 'MEXC']
        }
      },
      select: {
        id: true,
        exchange: true,
        label: true,
        authToken: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${credentials.length} credentials:\n`);

    for (const cred of credentials) {
      console.log(`ID: ${cred.id}`);
      console.log(`Exchange: ${cred.exchange}`);
      console.log(`Label: ${cred.label || '(none)'}`);
      console.log(`Active: ${cred.isActive}`);
      console.log(`Created: ${cred.createdAt.toISOString()}`);

      if (cred.authToken) {
        console.log(`authToken: EXISTS (encrypted, length: ${cred.authToken.length})`);
      } else {
        console.log(`authToken: NULL ⚠️ ${cred.exchange} requires passphrase!`);
      }

      console.log('---');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBitgetCredentials();
