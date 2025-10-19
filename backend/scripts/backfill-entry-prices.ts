/**
 * Backfill Entry Prices Script
 *
 * This script updates existing ACTIVE graduated entry positions that don't have entry prices
 * by fetching current position data from exchanges and calculating liquidation prices.
 *
 * Usage: npx tsx scripts/backfill-entry-prices.ts
 */

import { PrismaClient } from '@prisma/client';
import { BybitConnector } from '../src/connectors/bybit.connector';
import { BingXConnector } from '../src/connectors/bingx.connector';
import { liquidationCalculatorService } from '../src/services/liquidation-calculator.service';
import { ExchangeCredentialsService } from '../src/lib/exchange-credentials-service';

const prisma = new PrismaClient();

interface ExchangePosition {
  size: number;
  side: string;
  entryPrice: number;
  markPrice?: number;
}

async function getExchangePosition(
  connector: BybitConnector | BingXConnector,
  symbol: string,
  exchangeName: string
): Promise<ExchangePosition | null> {
  try {
    console.log(`[Backfill] Fetching position for ${symbol} on ${exchangeName}...`);

    const positions = await connector.getPositions(symbol);

    if (!positions || positions.length === 0) {
      console.log(`[Backfill] No position found for ${symbol} on ${exchangeName}`);
      return null;
    }

    const position = positions[0];
    const size = Math.abs(parseFloat(position.size));
    const side = parseFloat(position.size) > 0 ? 'Buy' : 'Sell';
    const entryPrice = parseFloat(position.entryPrice);
    const markPrice = position.markPrice ? parseFloat(position.markPrice) : undefined;

    console.log(`[Backfill] Found position: ${size} ${side} @ ${entryPrice} (mark: ${markPrice || 'N/A'})`);

    return {
      size,
      side,
      entryPrice,
      markPrice,
    };
  } catch (error: any) {
    console.error(`[Backfill] Error getting position from ${exchangeName}:`, error.message);
    return null;
  }
}

async function backfillEntryPrices() {
  console.log('='.repeat(80));
  console.log('BACKFILL ENTRY PRICES SCRIPT');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Find all ACTIVE positions without entry prices
    const positions = await prisma.graduatedEntryPosition.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { primaryEntryPrice: null },
          { hedgeEntryPrice: null },
        ],
      },
    });

    console.log(`[Backfill] Found ${positions.length} active positions without entry prices`);
    console.log('');

    if (positions.length === 0) {
      console.log('[Backfill] No positions to update. Exiting.');
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const position of positions) {
      console.log('─'.repeat(80));
      console.log(`[Backfill] Processing position: ${position.positionId}`);
      console.log(`  Symbol: ${position.symbol}`);
      console.log(`  Primary: ${position.primaryExchange} (${position.primarySide} ${position.primaryLeverage}x)`);
      console.log(`  Hedge: ${position.hedgeExchange} (${position.hedgeSide} ${position.hedgeLeverage}x)`);
      console.log('');

      try {
        // Fetch and decrypt credentials using ExchangeCredentialsService
        console.log('[Backfill] Fetching exchange credentials...');
        const primaryCredential = await ExchangeCredentialsService.getCredentialById(
          position.userId,
          position.primaryCredentialId
        );

        const hedgeCredential = await ExchangeCredentialsService.getCredentialById(
          position.userId,
          position.hedgeCredentialId
        );

        if (!primaryCredential) {
          console.error(`[Backfill] Primary credential not found for position ${position.positionId}`);
          failureCount++;
          continue;
        }

        if (!hedgeCredential) {
          console.error(`[Backfill] Hedge credential not found for position ${position.positionId}`);
          failureCount++;
          continue;
        }

        // Create connectors for both exchanges
        console.log('[Backfill] Creating exchange connectors...');

        const primaryConnector = position.primaryExchange.toUpperCase() === 'BYBIT'
          ? new BybitConnector({
              apiKey: primaryCredential.apiKey,
              apiSecret: primaryCredential.apiSecret,
              testnet: false,
            })
          : new BingXConnector({
              apiKey: primaryCredential.apiKey,
              apiSecret: primaryCredential.apiSecret,
              testnet: false,
            });

        const hedgeConnector = position.hedgeExchange.toUpperCase() === 'BYBIT'
          ? new BybitConnector({
              apiKey: hedgeCredential.apiKey,
              apiSecret: hedgeCredential.apiSecret,
              testnet: false,
            })
          : new BingXConnector({
              apiKey: hedgeCredential.apiKey,
              apiSecret: hedgeCredential.apiSecret,
              testnet: false,
            });

        // Get positions from exchanges
        const [primaryPos, hedgePos] = await Promise.all([
          getExchangePosition(primaryConnector, position.symbol, position.primaryExchange),
          getExchangePosition(hedgeConnector, position.symbol, position.hedgeExchange),
        ]);

        if (!primaryPos || !hedgePos) {
          console.error(`[Backfill] ✗ Failed to fetch positions from exchanges`);
          failureCount++;
          continue;
        }

        const primaryEntryPrice = primaryPos.entryPrice;
        const hedgeEntryPrice = hedgePos.entryPrice;

        console.log('[Backfill] Calculating liquidation prices...');

        // Calculate liquidation prices
        let primaryLiquidationPrice: number | undefined;
        let hedgeLiquidationPrice: number | undefined;

        try {
          const primaryExchange = position.primaryExchange.toUpperCase() as 'BYBIT' | 'BINGX';
          const primaryCalc = liquidationCalculatorService.calculateLiquidationPrice({
            entryPrice: primaryEntryPrice,
            leverage: position.primaryLeverage,
            side: position.primarySide,
            exchange: primaryExchange,
          });
          primaryLiquidationPrice = primaryCalc.liquidationPrice;
          console.log(`  Primary liquidation price: ${primaryLiquidationPrice}`);

          const hedgeExchange = position.hedgeExchange.toUpperCase() as 'BYBIT' | 'BINGX';
          const hedgeCalc = liquidationCalculatorService.calculateLiquidationPrice({
            entryPrice: hedgeEntryPrice,
            leverage: position.hedgeLeverage,
            side: position.hedgeSide,
            exchange: hedgeExchange,
          });
          hedgeLiquidationPrice = hedgeCalc.liquidationPrice;
          console.log(`  Hedge liquidation price: ${hedgeLiquidationPrice}`);
        } catch (error: any) {
          console.error(`[Backfill] Error calculating liquidation prices:`, error.message);
        }

        // Update database
        console.log('[Backfill] Updating database...');
        await prisma.graduatedEntryPosition.update({
          where: { id: position.id },
          data: {
            primaryEntryPrice,
            hedgeEntryPrice,
            primaryLiquidationPrice,
            hedgeLiquidationPrice,
            lastLiquidationCheck: new Date(),
          },
        });

        console.log(`[Backfill] ✓ Successfully updated position ${position.positionId}`);
        console.log(`  Primary entry price: ${primaryEntryPrice}`);
        console.log(`  Hedge entry price: ${hedgeEntryPrice}`);
        console.log('');

        successCount++;

      } catch (error: any) {
        console.error(`[Backfill] ✗ Error processing position ${position.positionId}:`, error.message);
        failureCount++;
      }
    }

    console.log('='.repeat(80));
    console.log('BACKFILL COMPLETE');
    console.log('='.repeat(80));
    console.log(`Total positions processed: ${positions.length}`);
    console.log(`✓ Success: ${successCount}`);
    console.log(`✗ Failed: ${failureCount}`);
    console.log('');

  } catch (error: any) {
    console.error('[Backfill] Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
backfillEntryPrices()
  .then(() => {
    console.log('[Backfill] Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Backfill] Script failed:', error);
    process.exit(1);
  });
