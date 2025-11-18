/**
 * GET /api/bybit-funding-strategy
 *
 * Get all active funding strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { bybitFundingStrategyService } from '@/services/bybit-funding-strategy.service';

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

    // Get all strategies for this user
    const allStrategies = bybitFundingStrategyService.getAllStrategies();
    const userStrategies = allStrategies.filter(
      (s) => s.config.userId === user.userId
    );

    // Map to response format (exclude sensitive data)
    const strategies = userStrategies.map((strategy) => {
      const now = Date.now();
      const secondsRemaining = Math.max(
        0,
        Math.floor((strategy.nextFundingTime - now) / 1000)
      );

      return {
        id: strategy.id,
        symbol: strategy.config.symbol,
        side: strategy.config.side,
        leverage: strategy.config.leverage,
        margin: strategy.config.margin,
        fundingRate: strategy.fundingRate,
        nextFundingTime: strategy.nextFundingTime,
        secondsRemaining,
        status: strategy.status,
        hasFirstPosition: strategy.hasFirstPosition,
        firstPositionSize: strategy.firstPositionSize,
        firstPositionEntry: strategy.firstPositionEntry,
        firstPositionTP: strategy.firstPositionTP,
        firstPositionSL: strategy.firstPositionSL,
        hasSecondPosition: strategy.hasSecondPosition,
        secondPositionSize: strategy.secondPositionSize,
        positionReopenCount: strategy.positionReopenCount,
        errorMessage: strategy.errorMessage,
      };
    });

    return NextResponse.json({
      success: true,
      data: strategies,
    });
  } catch (error: any) {
    console.error('[API] Error getting funding strategies:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get funding strategies',
      },
      { status: 500 }
    );
  }
}
