/**
 * POST /api/bybit-funding-strategy/start
 *
 * Start automated funding strategy for Bybit
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
      side = 'Buy',
      executionDelay = 5,
      takeProfitPercent = 90,
      stopLossPercent = 20,
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

    // Validate side
    if (side !== 'Buy' && side !== 'Sell') {
      return NextResponse.json(
        { success: false, error: 'Side must be "Buy" or "Sell"' },
        { status: 400 }
      );
    }

    console.log(`[API] Starting funding strategy for user ${user.userId}:`, {
      symbol,
      leverage,
      margin,
      side,
      executionDelay,
      takeProfitPercent,
      stopLossPercent,
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

    // Start strategy (mainnet only)
    const strategyId = await bybitFundingStrategyService.startStrategy(
      {
        userId: user.userId,
        symbol,
        leverage,
        margin,
        side,
        executionDelay,
        takeProfitPercent,
        stopLossPercent,
      },
      credentials.apiKey,
      credentials.apiSecret,
      credentials.id // Pass credential ID for persistence
    );

    console.log(`[API] Strategy started successfully: ${strategyId}`);

    return NextResponse.json({
      success: true,
      data: {
        strategyId,
        symbol,
        leverage,
        margin,
        side,
        executionDelay,
        takeProfitPercent,
        stopLossPercent,
      },
      message: 'Funding strategy started successfully',
    });
  } catch (error: any) {
    console.error('[API] Error starting funding strategy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to start funding strategy',
      },
      { status: 500 }
    );
  }
}
