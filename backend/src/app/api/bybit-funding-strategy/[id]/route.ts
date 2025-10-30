/**
 * GET /api/bybit-funding-strategy/[id]
 * DELETE /api/bybit-funding-strategy/[id]
 *
 * Get or stop a specific funding strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { bybitFundingStrategyService } from '@/services/bybit-funding-strategy.service';

/**
 * Get strategy details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get strategy
    const strategy = bybitFundingStrategyService.getStrategy(id);
    if (!strategy) {
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (strategy.config.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate time remaining
    const now = Date.now();
    const secondsRemaining = Math.max(
      0,
      Math.floor((strategy.nextFundingTime - now) / 1000)
    );

    // Map to response format
    const response = {
      id: strategy.id,
      symbol: strategy.config.symbol,
      side: strategy.config.side,
      leverage: strategy.config.leverage,
      margin: strategy.config.margin,
      executionDelay: strategy.config.executionDelay,
      takeProfitPercent: strategy.config.takeProfitPercent,
      stopLossPercent: strategy.config.stopLossPercent,
      fundingRate: strategy.fundingRate,
      nextFundingTime: strategy.nextFundingTime,
      secondsRemaining,
      currentPrice: strategy.currentPrice,
      status: strategy.status,
      hasPosition: strategy.hasPosition,
      positionSize: strategy.positionSize,
      entryPrice: strategy.entryPrice,
      takeProfitPrice: strategy.takeProfitPrice,
      stopLossPrice: strategy.stopLossPrice,
      positionReopenCount: strategy.positionReopenCount,
      lastExecutionTime: strategy.lastExecutionTime,
      errorMessage: strategy.errorMessage,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: unknown) {
    console.error('[API] Error getting funding strategy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to get funding strategy';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * Stop strategy
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get strategy
    const strategy = bybitFundingStrategyService.getStrategy(id);
    if (!strategy) {
      return NextResponse.json(
        { success: false, error: 'Strategy not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (strategy.config.userId !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    console.log(`[API] Stopping strategy ${id} for user ${user.userId}`);

    // Stop strategy
    await bybitFundingStrategyService.stopStrategy(id);

    return NextResponse.json({
      success: true,
      message: 'Strategy stopped successfully',
    });
  } catch (error: unknown) {
    console.error('[API] Error stopping funding strategy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to stop funding strategy';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
