/**
 * Check actual positions on Bybit and Gate.io for AVNTUSDT
 */

import { PrismaClient } from '@prisma/client';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';
import { BybitConnector } from './src/connectors/bybit.connector';
import { GateIOConnector } from './src/connectors/gateio.connector';

async function main() {
  const prisma = new PrismaClient();

  try {
    // Get the position details
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: 'arb_1_1761256044784' }
    });

    if (!position) {
      console.log('Position not found in database');
      return;
    }

    console.log('Checking actual positions on exchanges...\n');

    // Check Bybit
    console.log('='.repeat(80));
    console.log('BYBIT POSITIONS:');
    console.log('='.repeat(80));

    const primaryCred = await ExchangeCredentialsService.getCredentialById(
      position.userId,
      position.primaryCredentialId
    );

    if (primaryCred) {
      console.log('Primary credentials found:', {
        exchange: primaryCred.exchange,
        label: primaryCred.label
      });

      const bybitConnector = new BybitConnector(
        primaryCred.apiKey,
        primaryCred.apiSecret,
        false // mainnet
      );

      await bybitConnector.initialize();
      const bybitPositions = await bybitConnector.getPositions();

      console.log(`Found ${bybitPositions.length} position(s) on Bybit:\n`);

      for (const pos of bybitPositions) {
        console.log(`Symbol: ${pos.symbol}`);
        console.log(`  Size: ${pos.size}`);
        console.log(`  Side: ${pos.side}`);
        console.log(`  Entry Price: ${pos.entryPrice || 'N/A'}`);
        console.log(`  Mark Price: ${pos.markPrice || 'N/A'}`);
        console.log(`  Leverage: ${pos.leverage || 'N/A'}`);
        console.log(`  Liquidation Price: ${pos.liquidationPrice || 'N/A'}`);
        console.log('');
      }

      // Try to find AVNTUSDT specifically
      const avntPosition = bybitPositions.find((p: any) => {
        const posSymbol = p.symbol?.replace(/[-/:_]/g, '')?.toUpperCase();
        const targetSymbol = 'AVNTUSDT';
        console.log(`  Comparing: "${posSymbol}" vs "${targetSymbol}"`);
        return posSymbol === targetSymbol;
      });

      if (avntPosition) {
        console.log('✅ Found AVNTUSDT position on Bybit');
      } else {
        console.log('❌ AVNTUSDT position not found on Bybit');
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('GATE.IO POSITIONS:');
    console.log('='.repeat(80));

    const hedgeCred = await ExchangeCredentialsService.getCredentialById(
      position.userId,
      position.hedgeCredentialId
    );

    if (hedgeCred) {
      console.log('Hedge credentials found:', {
        exchange: hedgeCred.exchange,
        label: hedgeCred.label
      });

      const gateioConnector = new GateIOConnector(
        hedgeCred.apiKey,
        hedgeCred.apiSecret
      );

      await gateioConnector.initialize();
      const gateioPositions = await gateioConnector.getPositions();

      console.log(`Found ${gateioPositions.length} position(s) on Gate.io:\n`);

      for (const pos of gateioPositions) {
        console.log(`Contract: ${pos.contract || pos.symbol}`);
        console.log(`  Size: ${pos.size}`);
        console.log(`  Entry Price: ${pos.entry_price || pos.entryPrice || 'N/A'}`);
        console.log(`  Mark Price: ${pos.mark_price || pos.markPrice || 'N/A'}`);
        console.log(`  Leverage: ${pos.leverage || 'N/A'}`);
        console.log('');
      }

      // Try to find AVNTUSDT specifically
      const avntPosition = gateioPositions.find((p: any) => {
        const posContract = (p.contract || p.symbol)?.replace(/[-/:_]/g, '')?.toUpperCase();
        const targetSymbol = 'AVNTUSDT';
        console.log(`  Comparing: "${posContract}" vs "${targetSymbol}"`);
        return posContract === targetSymbol && Math.abs(parseFloat(p.size || p.contracts || '0')) > 0;
      });

      if (avntPosition) {
        console.log('✅ Found AVNTUSDT position on Gate.io');
      } else {
        console.log('❌ AVNTUSDT position not found on Gate.io');
      }
    }

    console.log('');
    console.log('='.repeat(80));
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
