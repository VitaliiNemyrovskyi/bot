/**
 * GET /api/bingx/positions
 *
 * Get all open positions on BingX
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BingXConnector } from '@/connectors/bingx.connector';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[BingX Positions] Fetching positions for user: ${user.userId}`);

    // Get BingX credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      user.userId,
      'BINGX'
    );

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'No BingX credentials found' },
        { status: 404 }
      );
    }

    console.log(`[BingX Positions] Using credential ID: ${credentials.id}`);

    // Initialize BingX connector
    const connector = new BingXConnector(
      credentials.apiKey,
      credentials.apiSecret,
      user.userId,
      credentials.id
    );

    await connector.initialize();

    // Get all positions
    const positions = await connector.getPositions();

    // Filter only open positions (size > 0)
    // Handle different field names: BingX uses 'positionAmt', Bybit uses 'size', CCXT uses 'contracts'
    const openPositions = positions.filter((p: any) => {
      const posSize = Math.abs(parseFloat(p.positionAmt || p.size || p.contracts || '0'));
      return posSize > 0;
    });

    console.log(`[BingX Positions] Found ${openPositions.length} open positions`);

    return NextResponse.json({
      success: true,
      data: {
        positions: openPositions,
        totalPositions: openPositions.length,
      },
    });
  } catch (error: any) {
    console.error('[BingX Positions] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch BingX positions',
      },
      { status: 500 }
    );
  }
}
