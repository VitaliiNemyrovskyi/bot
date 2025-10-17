/**
 * POST /api/bybit-funding-strategy/start-precise-timing
 *
 * Start Precise Timing Strategy for Bybit
 * Opens position exactly 20ms (configurable) AFTER funding time with latency compensation
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { bybitFundingStrategyService } from '@/services/bybit-funding-strategy.service';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';

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
    const {
      symbol,
      leverage = 10,
      margin = 100,
      positionSide = 'Auto', // 'Auto', 'Buy', or 'Sell'
      takeProfitPercent = 90,
      stopLossPercent = 50,
      timingOffset = 20, // milliseconds after funding time
      autoRepeat = false,
      enableWebSocketMonitoring = true,
      credentialId, // Optional: specific credential ID
    } = body;

    // Validate required fields
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      );
    }

    // Validate leverage
    if (leverage < 1 || leverage > 125) {
      return NextResponse.json(
        { success: false, error: 'Leverage must be between 1 and 125' },
        { status: 400 }
      );
    }

    // Validate position side
    if (positionSide !== 'Auto' && positionSide !== 'Buy' && positionSide !== 'Sell') {
      return NextResponse.json(
        { success: false, error: 'Position side must be "Auto", "Buy", or "Sell"' },
        { status: 400 }
      );
    }

    // Validate timing offset
    if (timingOffset < 0 || timingOffset > 1000) {
      return NextResponse.json(
        { success: false, error: 'Timing offset must be between 0 and 1000 milliseconds' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting Precise Timing Strategy for user ${user.userId}:`, {
      symbol,
      leverage,
      margin,
      positionSide,
      takeProfitPercent,
      stopLossPercent,
      timingOffset,
      autoRepeat,
      enableWebSocketMonitoring,
    });

    // Get Bybit credentials
    let credentials;
    if (credentialId) {
      // Try to use specific credential
      try {
        credentials = await ExchangeCredentialsService.getCredentialById(
          user.userId,
          credentialId
        );
      } catch (error: any) {
        // If credential doesn't belong to user or doesn't exist, fall back to active credential
        console.warn(`[API] Credential ${credentialId} not accessible for user ${user.userId}, using active credential instead`);
        credentials = await ExchangeCredentialsService.getActiveCredentials(
          user.userId,
          'BYBIT'
        );
      }
    } else {
      // Use active Bybit credential
      credentials = await ExchangeCredentialsService.getActiveCredentials(
        user.userId,
        'BYBIT'
      );
    }

    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Bybit credentials found. Please add Bybit API keys first.',
        },
        { status: 400 }
      );
    }

    // Start precise timing strategy (mainnet only)
    const strategyId = await bybitFundingStrategyService.startPreciseTimingStrategy(
      {
        userId: user.userId,
        symbol,
        leverage,
        margin,
        positionSide,
        takeProfitPercent,
        stopLossPercent,
        timingOffset,
        autoRepeat,
        enableWebSocketMonitoring,
      },
      credentials.apiKey,
      credentials.apiSecret,
      credentials.id // Pass credential ID for persistence
    );

    console.log(`[API] Precise Timing Strategy started successfully: ${strategyId}`);

    return NextResponse.json({
      success: true,
      data: {
        strategyId,
        symbol,
        leverage,
        margin,
        positionSide,
        takeProfitPercent,
        stopLossPercent,
        timingOffset,
        autoRepeat,
        enableWebSocketMonitoring,
      },
      message: 'Precise Timing Strategy started successfully',
    });
  } catch (error: any) {
    console.error('[API] Error starting Precise Timing Strategy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start Precise Timing Strategy',
      },
      { status: 500 }
    );
  }
}
