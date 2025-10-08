import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingArbitrageService } from '@/services/funding-arbitrage.service';
import { BybitConnector } from '@/connectors/bybit.connector';
import { BingXConnector } from '@/connectors/bingx.connector';
import { MockExchangeConnector } from '@/connectors/mock-exchange.connector';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import prisma from '@/lib/prisma';

/**
 * POST /api/funding-arbitrage/subscribe
 *
 * Subscribe to funding rate arbitrage
 *
 * Request body:
 * {
 *   "symbol": "BTCUSDT",
 *   "fundingRate": -0.0001,
 *   "nextFundingTime": 1704067200000,
 *   "positionType": "long" | "short",
 *   "quantity": 0.01,
 *   "primaryCredentialId": "cred_123",
 *   "hedgeExchange": "MOCK" | "BYBIT" | "BINGX",
 *   "hedgeCredentialId": "cred_456" (optional, required for non-MOCK exchanges)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Parse request body
    const body = await request.json();
    const {
      symbol,
      fundingRate,
      nextFundingTime,
      positionType,
      quantity,
      primaryCredentialId,
      hedgeExchange = 'MOCK',
      hedgeCredentialId,
      executionDelay = 5,
    } = body;

    // 3. Validate inputs
    if (!symbol || !fundingRate || !nextFundingTime || !positionType || !quantity || !primaryCredentialId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'symbol, fundingRate, nextFundingTime, positionType, quantity, and primaryCredentialId are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (positionType !== 'long' && positionType !== 'short') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid position type',
          message: 'positionType must be either "long" or "short"',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 4. Get primary exchange credentials
    const primaryCred = await ExchangeCredentialsService.getCredentialById(
      userId,
      primaryCredentialId
    );

    if (!primaryCred) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credential not found',
          message: `Primary credential ${primaryCredentialId} not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 5. Initialize primary exchange connector
    let primaryConnector;
    if (primaryCred.exchange === 'BYBIT') {
      primaryConnector = new BybitConnector(
        primaryCred.apiKey,
        primaryCred.apiSecret,
        primaryCred.environment === 'TESTNET'
      );
    } else if (primaryCred.exchange === 'BINGX') {
      primaryConnector = new BingXConnector(
        primaryCred.apiKey,
        primaryCred.apiSecret,
        primaryCred.environment === 'TESTNET'
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported exchange',
          message: `Exchange ${primaryCred.exchange} not yet supported`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    await primaryConnector.initialize();

    // 6. Initialize hedge exchange connector
    let hedgeConnector;
    if (hedgeExchange === 'MOCK') {
      // Use MockExchangeConnector as fallback or for testing
      hedgeConnector = new MockExchangeConnector();
      await hedgeConnector.initialize();
    } else {
      // Real exchange - validate hedgeCredentialId is provided
      if (!hedgeCredentialId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing hedge credential',
            message: `hedgeCredentialId is required when hedgeExchange is not MOCK`,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Load hedge exchange credentials
      const hedgeCred = await ExchangeCredentialsService.getCredentialById(
        userId,
        hedgeCredentialId
      );

      if (!hedgeCred) {
        return NextResponse.json(
          {
            success: false,
            error: 'Credential not found',
            message: `Hedge credential ${hedgeCredentialId} not found`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      // Initialize hedge exchange connector based on exchange type
      if (hedgeCred.exchange === 'BYBIT') {
        hedgeConnector = new BybitConnector(
          hedgeCred.apiKey,
          hedgeCred.apiSecret,
          hedgeCred.environment === 'TESTNET'
        );
      } else if (hedgeCred.exchange === 'BINGX') {
        hedgeConnector = new BingXConnector(
          hedgeCred.apiKey,
          hedgeCred.apiSecret,
          hedgeCred.environment === 'TESTNET'
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Unsupported hedge exchange',
            message: `Hedge exchange ${hedgeCred.exchange} not yet supported`,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      await hedgeConnector.initialize();
    }

    // 6.5. Validate balances on both exchanges
    try {
      // Check primary exchange balance
      const primaryBalance = await primaryConnector.getBalance();
      let primaryAvailable = 0;

      // Extract available balance based on exchange type
      if (primaryCred.exchange === 'BYBIT') {
        // Bybit returns: { list: [{ totalAvailableBalance, totalWalletBalance, ... }] }
        if (primaryBalance.list && primaryBalance.list.length > 0) {
          primaryAvailable = parseFloat(primaryBalance.list[0].totalAvailableBalance || '0');
        }
      } else if (primaryCred.exchange === 'BINGX') {
        // BingX returns: { balance: { balance: '1234.56', availableMargin: '1234.56' } }
        primaryAvailable = parseFloat(primaryBalance.balance?.availableMargin || primaryBalance.balance?.balance || '0');
      }

      // Check hedge exchange balance (skip for MOCK)
      let hedgeAvailable = Infinity; // Mock exchange has infinite balance
      if (hedgeExchange !== 'MOCK') {
        const hedgeBalance = await hedgeConnector.getBalance();

        // Extract balance based on hedge exchange type
        if (hedgeExchange === 'BYBIT') {
          // Bybit returns: { list: [{ totalAvailableBalance, ... }] }
          if (hedgeBalance.list && hedgeBalance.list.length > 0) {
            hedgeAvailable = parseFloat(hedgeBalance.list[0].totalAvailableBalance || '0');
          }
        } else if (hedgeExchange === 'BINGX') {
          // BingX returns: { balance: { balance: '1234.56', availableMargin: '1234.56' } }
          hedgeAvailable = parseFloat(hedgeBalance.balance?.availableMargin || hedgeBalance.balance?.balance || '0');
        }
      }

      // Calculate required balance (approximate)
      // For a position, we need: quantity * price / leverage
      // Assuming minimum $10 required per exchange as a safety buffer
      const minRequiredBalance = 10;

      if (primaryAvailable < minRequiredBalance) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient balance',
            message: `Primary exchange (${primaryCred.exchange}) has insufficient balance: $${primaryAvailable.toFixed(2)}. Minimum required: $${minRequiredBalance.toFixed(2)}`,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      if (hedgeExchange !== 'MOCK' && hedgeAvailable < minRequiredBalance) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient balance',
            message: `Hedge exchange (${hedgeExchange}) has insufficient balance: $${hedgeAvailable.toFixed(2)}. Minimum required: $${minRequiredBalance.toFixed(2)}`,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      console.log(`[FundingArbitrageAPI] Balance validation passed:`, {
        primary: `${primaryCred.exchange}: $${primaryAvailable.toFixed(2)}`,
        hedge: hedgeExchange === 'MOCK' ? 'MOCK (unlimited)' : `${hedgeExchange}: $${hedgeAvailable.toFixed(2)}`
      });
    } catch (balanceError: any) {
      console.error('[FundingArbitrageAPI] Failed to fetch balances:', balanceError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Balance check failed',
          message: `Could not verify account balances: ${balanceError.message}`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // 7. Create subscription
    const subscription = await fundingArbitrageService.subscribe({
      symbol,
      fundingRate,
      nextFundingTime,
      positionType,
      quantity,
      primaryExchange: primaryConnector,
      hedgeExchange: hedgeConnector,
      userId,
      primaryCredentialId,
      hedgeCredentialId,
      executionDelay,
    });

    console.log(`[FundingArbitrageAPI] Subscription created:`, subscription.id);

    // 8. Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          subscriptionId: subscription.id,
          symbol: subscription.symbol,
          fundingRate: subscription.fundingRate,
          nextFundingTime: subscription.nextFundingTime,
          positionType: subscription.positionType,
          quantity: subscription.quantity,
          status: subscription.status,
          createdAt: subscription.createdAt,
        },
        message: 'Funding arbitrage subscription created successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingArbitrageAPI] Error creating subscription:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create subscription',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/funding-arbitrage/subscribe
 *
 * Get all subscriptions for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Get user subscriptions
    const subscriptions = await fundingArbitrageService.getUserSubscriptions(userId);

    // 3. Return response
    return NextResponse.json(
      {
        success: true,
        data: subscriptions.map((sub) => ({
          subscriptionId: sub.id,
          symbol: sub.symbol,
          fundingRate: sub.fundingRate,
          nextFundingTime: sub.nextFundingTime,
          positionType: sub.positionType,
          quantity: sub.quantity,
          status: sub.status,
          createdAt: sub.createdAt,
          // Deal results (for completed deals)
          entryPrice: sub.entryPrice,
          hedgeEntryPrice: sub.hedgeEntryPrice,
          fundingEarned: sub.fundingEarned,
          realizedPnl: sub.realizedPnl,
          executedAt: sub.executedAt,
        })),
        count: subscriptions.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingArbitrageAPI] Error getting subscriptions:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get subscriptions',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/funding-arbitrage/subscribe
 *
 * Unsubscribe from funding arbitrage
 *
 * Query parameters:
 * - subscriptionId: string
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Get subscription ID
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing subscription ID',
          message: 'subscriptionId query parameter is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Verify subscription belongs to user (check database)
    const dbSubscription = await prisma.fundingArbitrageSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subscription not found',
          message: `Subscription ${subscriptionId} not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (dbSubscription.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to cancel this subscription',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 4. Unsubscribe
    await fundingArbitrageService.unsubscribe(subscriptionId);

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Subscription canceled successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingArbitrageAPI] Error canceling subscription:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cancel subscription',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
