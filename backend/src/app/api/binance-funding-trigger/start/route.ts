/**
 * API Route: /api/binance-funding-trigger/start
 * Start Binance funding trigger strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { BinanceFundingTriggerService } from '@/services/binance-funding-trigger.service';
import prisma from '@/lib/prisma';

// Global strategy instance (single strategy at a time)
let currentStrategy: BinanceFundingTriggerService | null = null;

export async function POST(request: NextRequest) {
  try {
    if (currentStrategy) {
      return NextResponse.json(
        { success: false, error: 'Another strategy is already running. Stop it first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { symbol, userId, triggerPositionUsdt, mainPositionUsdt, maxHoldTimeSeconds } = body;

    if (!symbol || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, userId' },
        { status: 400 }
      );
    }

    // Get user credentials for Binance
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        userId,
        exchange: 'BINANCE',
        isActive: true,
      },
    });

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'No active Binance credentials found for user' },
        { status: 404 }
      );
    }

    // Get funding rate data for Binance
    const fundingRate = await prisma.publicFundingRate.findFirst({
      where: {
        symbol,
        exchange: 'BINANCE',
      },
    });

    if (!fundingRate) {
      return NextResponse.json(
        { success: false, error: `No funding rate data found for ${symbol} on Binance` },
        { status: 404 }
      );
    }

    // Calculate next funding time (Binance: every 8 hours at 00:00, 08:00, 16:00 UTC)
    const now = Date.now();
    let nextFundingTime = new Date(fundingRate.nextFundingTime).getTime();

    // If funding time has passed, calculate next occurrence (8 hour intervals)
    while (nextFundingTime < now) {
      nextFundingTime += 8 * 60 * 60 * 1000; // 8 hours
    }

    const fundingPaymentTime = new Date(nextFundingTime);
    const timeUntilFunding = nextFundingTime - now;

    // Need at least 30 seconds to set up
    if (timeUntilFunding < 30000) {
      return NextResponse.json(
        {
          success: false,
          error: `Too close to funding time (${(timeUntilFunding / 1000).toFixed(1)}s). Need at least 30 seconds.`,
        },
        { status: 400 }
      );
    }

    // Need to be within reasonable time window (max 60 minutes)
    if (timeUntilFunding > 60 * 60 * 1000) {
      return NextResponse.json(
        {
          success: false,
          error: `Funding time is too far away (${(timeUntilFunding / 60000).toFixed(1)} minutes). Start strategy within 60 minutes of funding.`,
        },
        { status: 400 }
      );
    }

    // Create strategy config
    const config = {
      symbol,
      fundingTime: fundingPaymentTime,
      triggerPositionUsdt: triggerPositionUsdt || 5, // Default: 5 USDT
      mainPositionUsdt: mainPositionUsdt || 100, // Default: 100 USDT
      maxHoldTimeSeconds: maxHoldTimeSeconds || 6, // Default: 6 seconds
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
    };

    // Create and start strategy
    currentStrategy = new BinanceFundingTriggerService(config);

    console.log('🚀 Starting Binance funding trigger strategy');
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Trigger Position: ${config.triggerPositionUsdt} USDT (LONG)`);
    console.log(`   Main Position: ${config.mainPositionUsdt} USDT (SHORT)`);
    console.log(`   Max Hold Time: ${config.maxHoldTimeSeconds}s`);
    console.log(`   Funding Rate: ${(fundingRate.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Time until funding: ${(timeUntilFunding / 1000).toFixed(1)}s`);

    // Start strategy (non-blocking)
    currentStrategy.execute().then(result => {
      console.log('✅ Strategy execution completed');
      console.log('Result:', result);
      currentStrategy = null; // Clear strategy after completion
    }).catch(error => {
      console.error('❌ Strategy execution failed:', error);
      currentStrategy = null;
    });

    return NextResponse.json({
      success: true,
      message: 'Binance funding trigger strategy started successfully',
      config: {
        symbol,
        triggerPositionUsdt: config.triggerPositionUsdt,
        mainPositionUsdt: config.mainPositionUsdt,
        maxHoldTimeSeconds: config.maxHoldTimeSeconds,
        fundingRate: fundingRate.fundingRate,
        fundingRatePercent: `${(fundingRate.fundingRate * 100).toFixed(4)}%`,
        fundingPaymentTime: fundingPaymentTime.toISOString(),
        timeUntilFunding: timeUntilFunding,
        timeUntilFundingMinutes: (timeUntilFunding / 60000).toFixed(1),
        estimatedProfit: `~0.8-1.2%`,
        strategy: 'LONG trigger → detect funding → SHORT scalp',
      },
    });

  } catch (error: any) {
    console.error('Error starting Binance funding trigger strategy:', error);
    currentStrategy = null;
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check strategy status
export async function GET(_request: NextRequest) {
  try {
    const isRunning = currentStrategy !== null;

    return NextResponse.json({
      success: true,
      isRunning,
      message: isRunning ? 'Strategy is currently running' : 'No strategy running',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
