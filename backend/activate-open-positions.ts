/**
 * Script to activate positions that are COMPLETED but still open on exchanges
 *
 * Usage: npx tsx activate-open-positions.ts
 */

import { PrismaClient } from '@prisma/client';
import { BingXConnector } from './src/connectors/bingx.connector';
import { BybitConnector } from './src/connectors/bybit.connector';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';

const prisma = new PrismaClient();

async function activateOpenPositions() {
  try {
    console.log('=== Activating Open Positions ===\n');

    const userId = 'admin_1';

    // Get all COMPLETED positions
    const completedPositions = await prisma.graduatedEntryPosition.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${completedPositions.length} COMPLETED positions\n`);

    for (const pos of completedPositions) {
      console.log(`\nChecking position: ${pos.positionId}`);
      console.log(`  Symbol: ${pos.symbol}`);
      console.log(`  Primary: ${pos.primaryExchange} (${pos.primarySide})`);
      console.log(`  Hedge: ${pos.hedgeExchange} (${pos.hedgeSide})`);

      // Check if positions are still open on exchanges
      const primaryOpen = await checkPositionOnExchange(
        userId,
        pos.primaryExchange,
        pos.primaryCredentialId,
        pos.symbol
      );

      const hedgeOpen = await checkPositionOnExchange(
        userId,
        pos.hedgeExchange,
        pos.hedgeCredentialId,
        pos.symbol
      );

      console.log(`  Primary open: ${primaryOpen}`);
      console.log(`  Hedge open: ${hedgeOpen}`);

      // If both positions are still open, activate
      if (primaryOpen && hedgeOpen) {
        console.log(`  ✅ ACTIVATING - both positions still open`);

        await prisma.graduatedEntryPosition.update({
          where: { id: pos.id },
          data: {
            status: 'ACTIVE',
          },
        });
      } else if (!primaryOpen && !hedgeOpen) {
        console.log(`  ℹ️  Both positions closed - keeping COMPLETED status`);
      } else {
        console.log(`  ⚠️  WARNING: Only one position open! Should mark as LIQUIDATED`);

        await prisma.graduatedEntryPosition.update({
          where: { id: pos.id },
          data: {
            status: 'LIQUIDATED',
            errorMessage: `${primaryOpen ? 'Hedge' : 'Primary'} position was closed/liquidated`,
          },
        });
      }
    }

    console.log('\n=== Done ===\n');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
  } finally {
    await prisma.$disconnect();
  }
}

async function checkPositionOnExchange(
  userId: string,
  exchange: string,
  credentialId: string,
  symbol: string
): Promise<boolean> {
  try {
    // Get credentials
    const credentials = await ExchangeCredentialsService.getCredentialById(
      userId,
      credentialId
    );

    if (!credentials) {
      console.log(`    ❌ No credentials found for ${exchange}`);
      return false;
    }

    // Normalize symbol for BingX
    let normalizedSymbol = symbol;
    if (exchange === 'BINGX' && !symbol.includes('-')) {
      if (symbol.endsWith('USDT')) {
        const base = symbol.slice(0, -4);
        normalizedSymbol = `${base}-USDT`;
      } else if (symbol.endsWith('USDC')) {
        const base = symbol.slice(0, -4);
        normalizedSymbol = `${base}-USDC`;
      }
    }

    // Create connector
    let connector: BingXConnector | BybitConnector;

    if (exchange === 'BINGX') {
      connector = new BingXConnector(
        credentials.apiKey,
        credentials.apiSecret
      );
    } else if (exchange === 'BYBIT') {
      connector = new BybitConnector(
        credentials.apiKey,
        credentials.apiSecret
      );
    } else {
      console.log(`    ⚠️  Unsupported exchange: ${exchange}`);
      return false;
    }

    await connector.initialize();

    // Get positions
    const positions = await connector.getPositions(normalizedSymbol);

    // Check if position exists and has size > 0
    const position = positions.find((p: typeof positions[number]) => {
      const posSymbol = p.symbol?.replace('-', '')?.toUpperCase();
      const targetSymbol = symbol?.replace('-', '')?.toUpperCase();
      return posSymbol === targetSymbol && Math.abs(p.size || 0) > 0;
    });

    return !!position;
  } catch (error: unknown) {
    const err = error as Error;
    console.log(`    ❌ Error checking ${exchange}:`, err.message);
    return false;
  }
}

activateOpenPositions();
