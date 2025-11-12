/**
 * FIX: Update entry prices for existing positions
 *
 * This endpoint fetches current positions from exchanges and updates
 * the entry prices in the database for positions that are missing them.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuthService } from '@/services/auth.service';
import { graduatedEntryArbitrageService } from '@/services/graduated-entry-arbitrage.service';

export const runtime = 'nodejs';

/**
 * POST /api/arbitrage/fix-entry-prices
 *
 * Fixes missing entry prices for active positions by fetching them from exchanges
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[FixEntryPrices] Starting entry price fix for user:', user.userId);

    // Get all ACTIVE positions without entry prices
    const positionsToFix = await prisma.graduatedEntryPosition.findMany({
      where: {
        userId: user.userId,
        status: 'ACTIVE',
        OR: [
          { primaryEntryPrice: null },
          { hedgeEntryPrice: null },
        ],
      },
    });

    console.log(`[FixEntryPrices] Found ${positionsToFix.length} positions to fix`);

    if (positionsToFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No positions need fixing',
        fixed: 0,
      });
    }

    const fixed: string[] = [];
    const failed: Array<{ positionId: string; error: string }> = [];

    // Process each position
    for (const pos of positionsToFix) {
      try {
        console.log(`[FixEntryPrices] Processing position ${pos.positionId}...`);

        // Get the active position from service to access connectors
        const activePosition = graduatedEntryArbitrageService['positions'].get(pos.id);

        if (!activePosition) {
          console.warn(`[FixEntryPrices] Position ${pos.positionId} not found in active positions map`);
          failed.push({
            positionId: pos.positionId,
            error: 'Position not active in memory (service might have restarted)'
          });
          continue;
        }

        // Fetch positions from exchanges using the service's private method
        // Note: We access private method using bracket notation
        const getExchangePosition = graduatedEntryArbitrageService['getExchangePosition'].bind(graduatedEntryArbitrageService);

        const primaryPosition = await getExchangePosition(
          activePosition.primaryConnector,
          pos.symbol,
          pos.primaryExchange
        );

        const hedgePosition = await getExchangePosition(
          activePosition.hedgeConnector,
          pos.symbol,
          pos.hedgeExchange
        );

        // Extract entry prices
        const primaryEntryPrice = primaryPosition?.entryPrice || null;
        const hedgeEntryPrice = hedgePosition?.entryPrice || null;

        console.log(`[FixEntryPrices] Position ${pos.positionId}:`, {
          primaryEntryPrice,
          hedgeEntryPrice,
        });

        // Only update if we got at least one price
        if (primaryEntryPrice || hedgeEntryPrice) {
          await prisma.graduatedEntryPosition.update({
            where: { id: pos.id },
            data: {
              ...(primaryEntryPrice && { primaryEntryPrice }),
              ...(hedgeEntryPrice && { hedgeEntryPrice }),
            },
          });

          console.log(`[FixEntryPrices] ✅ Updated position ${pos.positionId}`);
          fixed.push(pos.positionId);
        } else {
          console.warn(`[FixEntryPrices] ⚠️ No entry prices found for ${pos.positionId}`);
          failed.push({
            positionId: pos.positionId,
            error: 'Entry prices not available from exchanges'
          });
        }

      } catch (error: any) {
        console.error(`[FixEntryPrices] Error fixing ${pos.positionId}:`, error.message);
        failed.push({
          positionId: pos.positionId,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed.length} of ${positionsToFix.length} positions`,
      fixed,
      failed,
    });

  } catch (error: any) {
    console.error('[FixEntryPrices] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
