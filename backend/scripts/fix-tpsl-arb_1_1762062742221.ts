/**
 * Script to fix position arb_1_1762062742221 by retrying TP/SL setup
 * Run with: npx tsx scripts/fix-tpsl-arb_1_1762062742221.ts
 */

import { graduatedEntryArbitrageService } from '../src/services/graduated-entry-arbitrage.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSITION_ID = 'arb_1_1762062742221';

async function main() {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Fixing position ${POSITION_ID} - Retrying TP/SL setup`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    // First, get the position from database to find the userId
    const dbPos = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId: POSITION_ID },
      select: {
        id: true,
        positionId: true,
        userId: true,
        status: true,
        primaryExchange: true,
        hedgeExchange: true,
        symbol: true,
        primaryStatus: true,
        hedgeStatus: true,
        primaryErrorMessage: true,
        hedgeErrorMessage: true,
      },
    });

    if (!dbPos) {
      console.error(`❌ Position ${POSITION_ID} not found in database`);
      process.exit(1);
    }

    console.log(`Position found:`, {
      id: dbPos.id,
      positionId: dbPos.positionId,
      userId: dbPos.userId,
      status: dbPos.status,
      primaryExchange: dbPos.primaryExchange,
      hedgeExchange: dbPos.hedgeExchange,
      symbol: dbPos.symbol,
      primaryStatus: dbPos.primaryStatus,
      hedgeStatus: dbPos.hedgeStatus,
    });

    if (dbPos.primaryErrorMessage) {
      console.log(`Primary error: ${dbPos.primaryErrorMessage}`);
    }
    if (dbPos.hedgeErrorMessage) {
      console.log(`Hedge error: ${dbPos.hedgeErrorMessage}`);
    }

    console.log(`\n${'─'.repeat(80)}\n`);
    console.log(`Attempting to set TP/SL for position ${POSITION_ID}...\n`);

    // Wait a few seconds to ensure Gate.io has the position in their system
    console.log(`Waiting 5 seconds for Gate.io to register the position...`);
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Call syncTpSlForPosition to retry TP/SL setup
    await graduatedEntryArbitrageService.syncTpSlForPosition(POSITION_ID, dbPos.userId);

    console.log(`\n${'─'.repeat(80)}\n`);
    console.log(`✅ Successfully set TP/SL for position ${POSITION_ID}`);
    console.log(`\n${'='.repeat(80)}\n`);

    process.exit(0);
  } catch (error: any) {
    console.error(`\n${'─'.repeat(80)}\n`);
    console.error(`❌ Failed to fix position ${POSITION_ID}:`);
    console.error(error.message);
    if (error.stack) {
      console.error(`\nStack trace:`);
      console.error(error.stack);
    }
    console.error(`\n${'='.repeat(80)}\n`);
    process.exit(1);
  }
}

main();
