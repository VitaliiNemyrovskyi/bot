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
  } catch (error: any) {
    console.error('Error:', error.message);
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

    const testnet = credentials.environment === 'TESTNET';

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
        credentials.apiSecret,
        testnet
      );
    } else if (exchange === 'BYBIT') {
      connector = new BybitConnector(
        credentials.apiKey,
        credentials.apiSecret,
        testnet
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
    } catch (error: any) {
      if (error.message && (error.message.includes('no position') || error.message.includes('No open position'))) {
        console.log(`  ℹ️  No open position found on ${exchange}\n`);
      } else {
        console.log(`  ❌ Error: ${error.message}\n`);
      }
    }
  } catch (error: any) {
    console.log(`  ❌ Error closing position on ${exchange}: ${error.message}\n`);
  }
}

// Run the script
closeAllOpenPositions();
