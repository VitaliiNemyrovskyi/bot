import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBingXCredentials() {
  try {
    const credentials = await prisma.exchangeCredentials.findMany({
      where: {
        exchange: 'BINGX'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        label: true,
        exchange: true,
        isActive: true,
        apiKey: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (credentials.length === 0) {
      console.log('\n❌ No BingX credentials found in database');
      return;
    }

    console.log(`\n=== Found ${credentials.length} BingX credentials ===\n`);
    credentials.forEach((cred, index) => {
      console.log(`[${index + 1}]`);
      console.log(`  ID: ${cred.id}`);
      console.log(`  Label: ${cred.label || 'N/A'}`);
      console.log(`  Active: ${cred.isActive ? '✓' : '✗'}`);
      console.log(`  API Key: ${cred.apiKey.substring(0, 10)}...`);
      console.log(`  Created: ${cred.createdAt.toLocaleString()}`);
      console.log(`  Updated: ${cred.updatedAt.toLocaleString()}`);
      console.log('');
    });

    // Check which one is being used by the ENSOUSDT position
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' },
      select: {
        positionId: true,
        symbol: true,
        hedgeExchange: true,
        hedgeCredentialId: true,
      }
    });

    if (position) {
      console.log('=== Position Details ===');
      console.log(`Position ID: ${position.positionId}`);
      console.log(`Symbol: ${position.symbol}`);
      console.log(`Hedge Exchange: ${position.hedgeExchange}`);
      console.log(`Hedge Credential ID: ${position.hedgeCredentialId || 'N/A'}`);

      if (position.hedgeCredentialId) {
        const usedCred = credentials.find(c => c.id === position.hedgeCredentialId);
        if (usedCred) {
          console.log(`\n✓ Position is using credential: "${usedCred.label || usedCred.id}" (Active: ${usedCred.isActive})`);
        } else {
          console.log(`\n⚠️  Position is using credential ID ${position.hedgeCredentialId} which was not found in BingX credentials!`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBingXCredentials();
