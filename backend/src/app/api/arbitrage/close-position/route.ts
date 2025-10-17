/**
 * POST /api/arbitrage/close-position
 * Close an open position on an exchange manually
 *
 * Request body:
 * - exchange: 'BINGX' | 'BYBIT' | 'MEXC'
 * - symbol: Trading symbol (e.g., 'MERL-USDT' for BingX, 'MERLUSDT' for Bybit)
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BingXConnector } from '@/connectors/bingx.connector';
import { BybitConnector } from '@/connectors/bybit.connector';

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

    // Parse request body
    const body = await request.json();
    const { exchange, symbol } = body;

    // Validate required fields
    if (!exchange || !symbol) {
      return NextResponse.json(
        { success: false, error: 'Exchange and symbol are required' },
        { status: 400 }
      );
    }

    console.log(`[API] Closing position on ${exchange} for ${symbol}`);

    // Get credentials for the exchange
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      user.userId,
      exchange.toUpperCase()
    );

    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          error: `No ${exchange} credentials found. Please add API keys in Profile -> Trading Platforms.`,
        },
        { status: 400 }
      );
    }

    // Create connector and close position
    const testnet = credentials.environment === 'TESTNET';
    let connector: BingXConnector | BybitConnector;

    switch (exchange.toUpperCase()) {
      case 'BINGX':
        connector = new BingXConnector(
          credentials.apiKey,
          credentials.apiSecret,
          testnet
        );
        await connector.initialize();
        break;

      case 'BYBIT':
        connector = new BybitConnector(
          credentials.apiKey,
          credentials.apiSecret,
          testnet
        );
        await connector.initialize();
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported exchange: ${exchange}` },
          { status: 400 }
        );
    }

    // Close the position
    try {
      await connector.closePosition(symbol);
      console.log(`[API] Position closed successfully on ${exchange} for ${symbol}`);

      return NextResponse.json({
        success: true,
        data: {
          exchange,
          symbol,
          status: 'closed',
        },
        message: `Position closed successfully on ${exchange}`,
      });
    } catch (error: any) {
      // If no position exists, that's not an error
      if (error.message && (error.message.includes('no position') || error.message.includes('No open position'))) {
        console.log(`[API] No open position found on ${exchange} for ${symbol}`);
        return NextResponse.json({
          success: true,
          data: {
            exchange,
            symbol,
            status: 'no_position',
          },
          message: `No open position found on ${exchange} for ${symbol}`,
        });
      }
      throw error;
    }
  } catch (error: any) {
    console.error('[API] Error closing position:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to close position',
      },
      { status: 500 }
    );
  }
}
