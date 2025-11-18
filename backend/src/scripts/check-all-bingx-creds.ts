import prisma from '../lib/prisma';

async function checkAllBingXCreds() {
  try {
    console.log('\n=== ALL BingX Credentials in Database ===\n');

    const allCreds = await prisma.exchangeCredentials.findMany({
      where: {
        exchange: 'BINGX'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${allCreds.length} BingX credential(s):\n`);

    allCreds.forEach((cred, index) => {
      console.log(`[${index + 1}] ${cred.label || 'Unnamed'}`);
      console.log(`    ID: ${cred.id}`);
      console.log(`    Active: ${cred.isActive ? '✓ YES' : '✗ NO'}`);
      console.log(`    API Key: ${cred.apiKey.substring(0, 15)}...`);
      console.log(`    API Secret: ${cred.apiSecret.substring(0, 15)}...`);
      console.log(`    User ID: ${cred.userId}`);
      console.log(`    Created: ${cred.createdAt.toLocaleString()}`);
      console.log(`    Updated: ${cred.updatedAt.toLocaleString()}`);
      console.log('');
    });

    // Now check which credential the position is using
    console.log('=== Position Credential Mapping ===\n');

    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761815638197' },
      select: {
        positionId: true,
        hedgeCredentialId: true,
        hedgeExchange: true,
      }
    });

    if (position) {
      console.log(`Position: ${position.positionId}`);
      console.log(`Hedge Exchange: ${position.hedgeExchange}`);
      console.log(`Hedge Credential ID: ${position.hedgeCredentialId || 'N/A'}`);

      if (position.hedgeCredentialId) {
        const matchingCred = allCreds.find(c => c.id === position.hedgeCredentialId);
        if (matchingCred) {
          console.log(`\n✓ Position uses: "${matchingCred.label || matchingCred.id}"`);
          console.log(`  API Key starts with: ${matchingCred.apiKey.substring(0, 15)}...`);
        } else {
          console.log(`\n⚠️  WARNING: Position references credential ${position.hedgeCredentialId} which doesn't exist!`);
        }
      }
    }

    // Check what the ConnectorCache is using
    console.log('\n=== Checking Active Connectors ===\n');
    console.log('Let me check the connector that was used when opening the position...');

    // The connector ID format is: userId_connectorType_credentialId
    // For the position, it should be: admin_1_cmgfr4ea60001zq37demqe430
    const expectedConnectorId = position?.hedgeCredentialId
      ? `admin_1_${position.hedgeCredentialId}`
      : 'unknown';

    console.log(`Expected Connector ID: ${expectedConnectorId}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllBingXCreds();
