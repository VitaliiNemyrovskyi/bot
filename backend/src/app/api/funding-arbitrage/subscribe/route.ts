import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingArbitrageService } from '@/services/funding-arbitrage.service';
// import { BybitConnector } from '@/connectors/bybit.connector';
// import { BingXConnector } from '@/connectors/bingx.connector';
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
 *   "mode": "HEDGED" | "NON_HEDGED" (optional, default: "HEDGED"),
 *   "hedgeExchange": "BYBIT" | "BINGX" (required for HEDGED mode),
 *   "hedgeCredentialId": "cred_456" (required for HEDGED mode),
 *   "leverage": 3 (optional, default: 3, range: 1-125, recommended: 1-20),
 *   "margin": 100.50 (optional, margin/collateral in USDT)
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
      hedgeExchange,
      hedgeCredentialId,
      executionDelay = 5,
      leverage = 3,
      margin,
      mode = 'HEDGED', // Default to HEDGED mode for backward compatibility
      takeProfitPercent,
      stopLossPercent,
    } = body;

    console.log('[FundingArbitrageAPI] Received subscription request with margin:', {
      symbol,
      quantity,
      leverage,
      margin,
      marginProvided: margin !== undefined,
    });

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

    // Validate leverage range (1-125 for exchange compatibility, recommend 1-20)
    if (typeof leverage !== 'number' || leverage < 1 || leverage > 125) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid leverage',
          message: 'leverage must be a number between 1 and 125 (recommended: 1-20)',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate margin if provided (must be positive number)
    if (margin !== undefined && (typeof margin !== 'number' || margin <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid margin',
          message: 'margin must be a positive number (in USDT)',
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

    // 5. Validate hedge exchange and credentials (only for HEDGED mode)
    if (mode === 'HEDGED') {
      if (!hedgeExchange) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing hedge exchange configuration',
            message: 'hedgeExchange is required for HEDGED mode',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // MOCK exchange doesn't require credentials
      if (hedgeExchange !== 'MOCK') {
        if (!hedgeCredentialId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing hedge credential',
              message: 'hedgeCredentialId is required for non-MOCK exchanges in HEDGED mode',
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

        // Verify hedge credentials exist
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
      }
    }

    // 6. Create subscription - let the SERVICE create and cache the connectors
    console.log('[FundingArbitrageAPI] Creating subscription with credential IDs (service will cache connectors)');
    const subscription = await fundingArbitrageService.subscribeWithCredentials({
      symbol,
      fundingRate,
      nextFundingTime,
      positionType,
      quantity,
      userId,
      primaryCredentialId,
      hedgeCredentialId,
      hedgeExchange,
      executionDelay,
      leverage,
      margin,
      mode, // Pass mode to service
      takeProfitPercent,
      stopLossPercent,
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
          leverage: subscription.leverage,
          margin: subscription.margin,
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

    // 3. Return response with subscription data
    return NextResponse.json(
      {
        success: true,
        data: subscriptions.map((sub) => {
          return {
            subscriptionId: sub.id,
            symbol: sub.symbol,
            fundingRate: sub.fundingRate, // Use funding rate from subscription
            nextFundingTime: sub.nextFundingTime, // Use next funding time from subscription
            positionType: sub.positionType,
            quantity: sub.quantity,
            status: sub.status,
            createdAt: sub.createdAt,
            leverage: sub.leverage, // Include leverage from subscription
            margin: sub.margin, // Include margin from subscription
            // Exchange credentials for editing subscriptions
            primaryCredentialId: sub.primaryCredentialId,
            hedgeCredentialId: sub.hedgeCredentialId,
            primaryExchange: sub.primaryExchange?.exchangeName || 'UNKNOWN',
            hedgeExchange: sub.hedgeExchange?.exchangeName || 'UNKNOWN',
            // Deal results (for completed deals)
            entryPrice: sub.entryPrice,
            hedgeEntryPrice: sub.hedgeEntryPrice,
            fundingEarned: (sub as any).fundingEarned,
            realizedPnl: (sub as any).realizedPnl,
            executedAt: (sub as any).executedAt,
          };
        }),
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
 * PUT /api/funding-arbitrage/subscribe
 *
 * Update an existing funding arbitrage subscription
 *
 * Query parameters:
 * - subscriptionId: string
 *
 * Request body: same as POST
 */
export async function PUT(request: NextRequest) {
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

    // 2. Get subscription ID from query params
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

    // 3. Verify subscription exists and belongs to user
    const existingSubscription = await prisma.fundingArbitrageSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!existingSubscription) {
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

    if (existingSubscription.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to update this subscription',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const {
      symbol,
      fundingRate,
      nextFundingTime,
      positionType,
      quantity,
      primaryCredentialId,
      hedgeExchange,
      hedgeCredentialId,
      executionDelay = 5,
      leverage = 3,
      margin,
      mode = 'HEDGED', // Default to HEDGED mode for backward compatibility
      takeProfitPercent,
      stopLossPercent,
    } = body;

    console.log('[FundingArbitrageAPI] Updating subscription with margin:', {
      subscriptionId,
      symbol,
      quantity,
      leverage,
      margin,
      marginProvided: margin !== undefined,
    });

    // 5. Validate inputs
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

    // Validate leverage range
    if (typeof leverage !== 'number' || leverage < 1 || leverage > 125) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid leverage',
          message: 'leverage must be a number between 1 and 125 (recommended: 1-20)',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate margin if provided (must be positive number)
    if (margin !== undefined && (typeof margin !== 'number' || margin <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid margin',
          message: 'margin must be a positive number (in USDT)',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 6. Validate credentials exist
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

    // Validate hedge exchange and credentials (only for HEDGED mode)
    if (mode === 'HEDGED') {
      if (!hedgeExchange) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing hedge exchange configuration',
            message: 'hedgeExchange is required for HEDGED mode',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // MOCK exchange doesn't require credentials
      if (hedgeExchange !== 'MOCK') {
        if (!hedgeCredentialId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing hedge credential',
              message: 'hedgeCredentialId is required for non-MOCK exchanges in HEDGED mode',
              timestamp: new Date().toISOString(),
            },
            { status: 400 }
          );
        }

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
      }
    }

    // 7. Update the subscription in the database
    const updatedSubscription = await prisma.fundingArbitrageSubscription.update({
      where: { id: subscriptionId },
      data: {
        symbol,
        fundingRate,
        nextFundingTime: new Date(nextFundingTime),
        positionType,
        quantity,
        leverage,
        margin,
        mode, // Update mode
        primaryCredentialId,
        hedgeExchange: mode === 'HEDGED' ? hedgeExchange : null, // Null for NON_HEDGED
        hedgeCredentialId: mode === 'HEDGED' ? hedgeCredentialId : null, // Null for NON_HEDGED
        // Reset status to WAITING if it was ERROR/COMPLETED
        status: existingSubscription.status === 'ACTIVE' ? 'ACTIVE' : 'WAITING',
        errorMessage: null,
        updatedAt: new Date(),
      },
    });

    console.log(`[FundingArbitrageAPI] Subscription updated:`, updatedSubscription.id);

    // 8. If subscription was active, we need to restart it with new parameters
    if (existingSubscription.status === 'ACTIVE') {
      // Cancel the old subscription and create a new one
      await fundingArbitrageService.unsubscribe(subscriptionId);

      // Create new subscription with updated parameters
      const newSubscription = await fundingArbitrageService.subscribeWithCredentials({
        symbol,
        fundingRate,
        nextFundingTime,
        positionType,
        quantity,
        userId,
        primaryCredentialId,
        hedgeCredentialId,
        hedgeExchange,
        executionDelay,
        leverage,
        margin,
        mode, // Pass mode to service
        takeProfitPercent,
        stopLossPercent,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            subscriptionId: newSubscription.id,
            symbol: newSubscription.symbol,
            fundingRate: newSubscription.fundingRate,
            nextFundingTime: newSubscription.nextFundingTime,
            positionType: newSubscription.positionType,
            quantity: newSubscription.quantity,
            status: newSubscription.status,
            createdAt: newSubscription.createdAt,
          },
          message: 'Subscription updated and restarted successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // 9. Return response for non-active subscriptions
    return NextResponse.json(
      {
        success: true,
        data: {
          subscriptionId: updatedSubscription.id,
          symbol: updatedSubscription.symbol,
          fundingRate: updatedSubscription.fundingRate,
          nextFundingTime: updatedSubscription.nextFundingTime,
          positionType: updatedSubscription.positionType,
          quantity: updatedSubscription.quantity,
          status: updatedSubscription.status,
          createdAt: updatedSubscription.createdAt,
        },
        message: 'Subscription updated successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingArbitrageAPI] Error updating subscription:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update subscription',
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
