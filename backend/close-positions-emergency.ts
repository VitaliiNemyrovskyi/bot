/**
 * Emergency script to close open positions on exchanges
 *
 * Usage: npx tsx close-positions-emergency.ts
 */

import { PrismaClient } from '@prisma/client';
import { BingXConnector } from './src/connectors/bingx.connector';
import { BybitConnector } from './src/connectors/bybit.connector';
import { ExchangeCredentialsService } from './src/lib/exchange-credentials-service';

const prisma = new PrismaClient();

async function closeAllOpenPositions() {
  try {
    console.log('=== Emergency Position Closer ===\n');

    // Get the user ID (assuming admin_1 based on previous logs)
    const userId = 'admin_1';

    // Get all graduated entry positions (including completed ones)
    const positions = await prisma.graduatedEntryPosition.findMany({
      where: {
        userId,
        status: {
          in: ['COMPLETED', 'EXECUTING', 'INITIALIZING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Found ${positions.length} positions in database:\n`);

    for (const pos of positions) {
      console.log(`Position: ${pos.positionId}`);
      console.log(`  Symbol: ${pos.symbol}`);
      console.log(`  Status: ${pos.status}`);
      console.log(`  Primary: ${pos.primaryExchange} (${pos.primarySide})`);
      console.log(`  Hedge: ${pos.hedgeExchange} (${pos.hedgeSide})`);
      console.log(`  Created: ${pos.createdAt}`);
      console.log('');

      // Try to close positions on both exchanges
      await closePositionOnExchange(userId, pos.primaryExchange, pos.symbol);
      await closePositionOnExchange(userId, pos.hedgeExchange, pos.symbol);
    }

    console.log('\n=== Done ===');
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function closePositionOnExchange(
  userId: string,
  exchange: string,
  symbol: string
): Promise<void> {
  try {
    console.log(`Attempting to close position on ${exchange} for ${symbol}...`);

    // Get credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      exchange
    );

    if (!credentials) {
      console.log(`  ❌ No credentials found for ${exchange}\n`);
      return;
    }

    // Note: Connectors don't accept testnet parameter - they use mainnet by default

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
      console.log(`  Symbol normalized: ${symbol} -> ${normalizedSymbol}`);
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
      console.log(`  ⚠️  Unsupported exchange: ${exchange}\n`);
      return;
    }

    await connector.initialize();

    // Try to close position
    try {
      await connector.closePosition(normalizedSymbol);
      console.log(`  ✅ Position closed successfully on ${exchange}\n`);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message && (err.message.includes('no position') || err.message.includes('No open position'))) {
        console.log(`  ℹ️  No open position found on ${exchange}\n`);
      } else {
        console.log(`  ❌ Error: ${err.message}\n`);
      }
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.log(`  ❌ Error closing position on ${exchange}: ${err.message}\n`);
  }
}

// Run the script
closeAllOpenPositions();
