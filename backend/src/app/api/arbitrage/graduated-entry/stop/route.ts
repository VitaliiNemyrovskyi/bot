/**
 * POST /api/arbitrage/graduated-entry/stop
 *
 * Stop a Graduated Entry Arbitrage Position
 * Closes positions on both exchanges and cancels pending orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { graduatedEntryArbitrageService } from '@/services/graduated-entry-arbitrage.service';

export async function POST(request: NextRequest) {
  console.log(`[API] ========================================`);
  console.log(`[API] STOP POSITION API CALLED`);
  console.log(`[API] ========================================`);

  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      console.error(`[API] ✗ Unauthorized request to stop position`);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[API] User authenticated: ${user.userId}`);

    // Parse request body
    const body = await request.json();
    const { positionId } = body;

    // Validate position ID
    if (!positionId) {
      console.error(`[API] ✗ Missing position ID in request`);
      return NextResponse.json(
        { success: false, error: 'Position ID is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Request to stop position: ${positionId}`);
    console.log(`[API] User: ${user.userId}`);

    // Get position from memory to verify ownership
    const position = graduatedEntryArbitrageService.getPosition(positionId);

    if (!position) {
      // Position not in memory - CRITICAL: After backend restart, positions are in DB but not in memory
      console.log(`[API] ⚠️ Position ${positionId} not found in memory, checking database...`);

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        const dbPosition = await prisma.graduatedEntryPosition.findUnique({
          where: { positionId },
        });

        if (!dbPosition) {
          return NextResponse.json(
            { success: false, error: 'Position not found' },
            { status: 404 }
          );
        }

        // Verify user owns the position
        if (dbPosition.userId !== user.userId) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: You do not own this position' },
            { status: 403 }
          );
        }

        // Check if position is already stopped/completed
        if (dbPosition.status === 'COMPLETED' || dbPosition.status === 'CANCELLED' || dbPosition.status === 'ERROR') {
          console.log(`[API] Position ${positionId} already closed with status: ${dbPosition.status}`);
          return NextResponse.json({
            success: true,
            data: {
              positionId,
              status: dbPosition.status.toLowerCase(),
              message: `Position is already ${dbPosition.status.toLowerCase()}`,
            },
            message: `Position was already ${dbPosition.status.toLowerCase()}`,
          });
        }

        // CRITICAL FIX: Position is still active in DB but not in memory
        // This happens after backend restart - we MUST close positions on exchanges!
        console.log(`[API] ⚠️ Position ${positionId} is ACTIVE in DB but not in memory - closing positions on exchanges...`);

        const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
        const { BybitConnector } = await import('@/connectors/bybit.connector');
        const { BingXConnector } = await import('@/connectors/bingx.connector');

        // Fetch credentials
        const primaryCred = await ExchangeCredentialsService.getCredentialById(
          user.userId,
          dbPosition.primaryCredentialId
        );
        const hedgeCred = await ExchangeCredentialsService.getCredentialById(
          user.userId,
          dbPosition.hedgeCredentialId
        );

        const closeResults: any[] = [];

        // Try to close primary exchange position
        if (primaryCred) {
          try {
            console.log(`[API] Closing PRIMARY position on ${dbPosition.primaryExchange}...`);
            const primaryConnector = dbPosition.primaryExchange.toUpperCase().includes('BYBIT')
              ? new BybitConnector(primaryCred.apiKey, primaryCred.apiSecret, user.userId, primaryCred.id)
              : new BingXConnector(primaryCred.apiKey, primaryCred.apiSecret, user.userId, primaryCred.id);

            await primaryConnector.initialize();
            await primaryConnector.closePosition(dbPosition.symbol);
            console.log(`[API] ✓ Primary position closed on ${dbPosition.primaryExchange}`);
            closeResults.push({ exchange: dbPosition.primaryExchange, success: true });
          } catch (error: any) {
            console.error(`[API] ✗ Failed to close primary position:`, error.message);
            closeResults.push({ exchange: dbPosition.primaryExchange, success: false, error: error.message });
          }
        } else {
          console.error(`[API] ✗ Primary credentials not found`);
          closeResults.push({ exchange: dbPosition.primaryExchange, success: false, error: 'Credentials not found' });
        }

        // Try to close hedge exchange position
        if (hedgeCred) {
          try {
            console.log(`[API] Closing HEDGE position on ${dbPosition.hedgeExchange}...`);
            const hedgeConnector = dbPosition.hedgeExchange.toUpperCase().includes('BYBIT')
              ? new BybitConnector(hedgeCred.apiKey, hedgeCred.apiSecret, user.userId, hedgeCred.id)
              : new BingXConnector(hedgeCred.apiKey, hedgeCred.apiSecret, user.userId, hedgeCred.id);

            await hedgeConnector.initialize();
            await hedgeConnector.closePosition(dbPosition.symbol);
            console.log(`[API] ✓ Hedge position closed on ${dbPosition.hedgeExchange}`);
            closeResults.push({ exchange: dbPosition.hedgeExchange, success: true });
          } catch (error: any) {
            console.error(`[API] ✗ Failed to close hedge position:`, error.message);
            closeResults.push({ exchange: dbPosition.hedgeExchange, success: false, error: error.message });
          }
        } else {
          console.error(`[API] ✗ Hedge credentials not found`);
          closeResults.push({ exchange: dbPosition.hedgeExchange, success: false, error: 'Credentials not found' });
        }

        // Mark position as COMPLETED in database
        await prisma.graduatedEntryPosition.update({
          where: { positionId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        console.log(`[API] ✓ Position ${positionId} marked as COMPLETED in database`);
        console.log(`[API] Close results:`, closeResults);

        return NextResponse.json({
          success: true,
          data: {
            positionId,
            status: 'completed',
            closeResults,
          },
          message: 'Position closed successfully (recovered from database)',
        });
      } finally {
        await prisma.$disconnect();
      }
    }

    // Verify user owns the position
    if (position.config.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this position' },
        { status: 403 }
      );
    }

    // Stop the position (closes positions on exchanges)
    console.log(`[API] Calling service to stop position ${positionId}...`);
    await graduatedEntryArbitrageService.stopPosition(positionId);

    console.log(`[API] ✓✓✓ Graduated Entry position stopped successfully: ${positionId}`);
    console.log(`[API] ========================================`);

    return NextResponse.json({
      success: true,
      data: {
        positionId,
        status: 'stopped',
      },
      message: 'Graduated Entry Arbitrage position stopped successfully',
    });
  } catch (error: any) {
    console.error('[API] ✗✗✗ Error stopping Graduated Entry position:', error);
    console.error('[API] ========================================');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to stop Graduated Entry position',
      },
      { status: 500 }
    );
  }
}
