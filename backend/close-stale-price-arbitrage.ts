import prisma from './src/lib/prisma';
import { GateIOService } from './src/lib/gateio';
import { BingXService } from './src/lib/bingx';
import { EncryptionService } from './src/lib/encryption';

/**
 * Close stale Price Arbitrage positions where exchange positions are already closed
 * but database still shows ACTIVE
 */
async function closeStalePosition() {
  console.log('🔍 Checking for stale Price Arbitrage positions...\n');

  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found');
    return;
  }

  // Get ACTIVE or ERROR price arbitrage positions
  const positions = await prisma.priceArbitragePosition.findMany({
    where: {
      symbol: 'AIAUSDT',
      status: { in: ['ACTIVE', 'ERROR'] },
    },
  });

  if (positions.length === 0) {
    console.log('✓ No active or error positions found\n');
    return;
  }

  console.log(`Found ${positions.length} ACTIVE/ERROR position(s) in database:\n`);

  for (const position of positions) {
    console.log('='.repeat(80));
    console.log(`Position ID: ${position.id}`);
    console.log(`Symbol: ${position.symbol}`);
    console.log(`Primary: ${position.primaryExchange} ${position.primaryQuantity}`);
    console.log(`Hedge: ${position.hedgeExchange} ${position.hedgeQuantity}`);
    console.log(`Created: ${position.createdAt}`);
    console.log('');

    // Check if positions exist on exchanges
    let primaryExists = false;
    let hedgeExists = false;

    // Check primary exchange (Gate.io)
    if (position.primaryExchange === 'GATEIO') {
      try {
        const gateIOCreds = await prisma.exchangeCredentials.findFirst({
          where: { userId: user.id, exchange: 'GATEIO' },
        });

        if (gateIOCreds && gateIOCreds.apiKey && gateIOCreds.apiSecret) {
          const apiKey = EncryptionService.decrypt(gateIOCreds.apiKey);
          const apiSecret = EncryptionService.decrypt(gateIOCreds.apiSecret);
          const gateio = new GateIOService({ apiKey, apiSecret });

          // Gate.io uses AIA_USDT format
          const gateioSymbol = position.symbol.replace('USDT', '_USDT');
          const gateioPositions = await gateio.getPositions(gateioSymbol);

          // Check if any position has size > 0
          primaryExists = gateioPositions.some((p: any) => {
            const size = Math.abs(parseFloat(p.size || '0'));
            return size > 0;
          });

          console.log(`Primary (Gate.io): ${primaryExists ? '✓ EXISTS' : '✗ NOT FOUND'}`);
        }
      } catch (error: any) {
        console.log(`Primary (Gate.io): ⚠️  Error checking - ${error.message}`);
      }
    }

    // Check hedge exchange (BingX)
    if (position.hedgeExchange === 'BINGX') {
      try {
        const bingxCreds = await prisma.exchangeCredentials.findFirst({
          where: { userId: user.id, exchange: 'BINGX' },
        });

        if (bingxCreds && bingxCreds.apiKey && bingxCreds.apiSecret) {
          const apiKey = EncryptionService.decrypt(bingxCreds.apiKey);
          const apiSecret = EncryptionService.decrypt(bingxCreds.apiSecret);
          const bingx = new BingXService({ apiKey, apiSecret });

          const bingxPositions = await bingx.getPositions();
          const bingxSymbol = position.symbol.replace(/([A-Z]+)(USDT)$/, '$1-$2');

          hedgeExists = bingxPositions.some((p: any) =>
            (p.symbol === bingxSymbol || p.symbol === position.symbol) &&
            Math.abs(parseFloat(p.positionAmt || '0')) > 0
          );

          console.log(`Hedge (BingX): ${hedgeExists ? '✓ EXISTS' : '✗ NOT FOUND'}`);
        }
      } catch (error: any) {
        console.log(`Hedge (BingX): ⚠️  Error checking - ${error.message}`);
      }
    }

    // If both positions are closed, update database
    if (!primaryExists && !hedgeExists) {
      console.log('\n🔄 Both exchange positions closed - updating database...');

      await prisma.priceArbitragePosition.update({
        where: { id: position.id },
        data: {
          status: 'COMPLETED',
          errorMessage: 'Synced: Both exchange positions already closed',
        },
      });

      console.log('✅ Database updated to COMPLETED status');
    } else {
      console.log('\n⚠️  One or more positions still exist - manual intervention required');
    }

    console.log('');
  }

  console.log('='.repeat(80));
  console.log('✓ Stale position check complete\n');

  await prisma.$disconnect();
}

closeStalePosition().catch(console.error);
