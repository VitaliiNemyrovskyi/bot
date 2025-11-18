/**
 * API Route: /api/funding-arb/execute
 * Execute funding arbitrage strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { FundingPaymentArbBot, StrategyConfig } from '@/services/funding-payment-arb.service';
import { BybitService } from '@/lib/bybit';
import prisma from '@/lib/prisma';

// Global bot instance (single bot at a time)
let currentBot: FundingPaymentArbBot | null = null;

export async function POST(request: NextRequest) {
  try {
    if (currentBot) {
      return NextResponse.json(
        { success: false, error: 'Another bot is already running. Stop it first.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { symbol, positionSize, userId, maxSlippage, stopLoss } = body;

    if (!symbol || !positionSize || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, positionSize, userId' },
        { status: 400 }
      );
    }

    // Get funding rate data
    const fundingRate = await prisma.publicFundingRate.findFirst({
      where: {
        symbol,
        exchange: 'BYBIT',
      },
    });

    if (!fundingRate) {
      return NextResponse.json(
        { success: false, error: `No funding rate data found for ${symbol}` },
        { status: 404 }
      );
    }

    if (fundingRate.fundingRate >= 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Funding rate is positive (${(fundingRate.fundingRate * 100).toFixed(4)}%). Strategy only works with negative rates.`,
        },
        { status: 400 }
      );
    }

    // Get user credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        userId,
        exchange: 'BYBIT',
        isActive: true,
      },
    });

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'No active Bybit credentials found for user' },
        { status: 404 }
      );
    }

    // Calculate next funding time
    const now = Date.now();
    let nextFundingTime = new Date(fundingRate.nextFundingTime).getTime();

    // If funding time has passed, calculate next occurrence
    while (nextFundingTime < now) {
      nextFundingTime += fundingRate.fundingInterval * 60 * 60 * 1000;
    }

    const fundingPaymentTime = new Date(nextFundingTime);
    const timeUntilFunding = nextFundingTime - now;

    if (timeUntilFunding < 5000) {
      return NextResponse.json(
        {
          success: false,
          error: `Too close to funding time (${(timeUntilFunding / 1000).toFixed(1)}s). Need at least 5 seconds.`,
        },
        { status: 400 }
      );
    }

    // Create Bybit service
    const bybit = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      userId,
      credentialId: credentials.id,
    });

    // Create strategy config
    const config: StrategyConfig = {
      userId,
      symbol,
      positionSize,
      fundingPaymentTime,
      fundingRate: fundingRate.fundingRate,
      maxSlippage,
      stopLoss,
    };

    // Create and start bot
    currentBot = new FundingPaymentArbBot(config, bybit);

    console.log('🚀 Starting funding arbitrage bot');
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Position Size: ${positionSize}`);
    console.log(`   Funding Rate: ${(fundingRate.fundingRate * 100).toFixed(4)}%`);
    console.log(`   Time until funding: ${(timeUntilFunding / 1000).toFixed(1)}s`);

    // Start bot (non-blocking)
    currentBot.start().then(result => {
      console.log('✅ Bot execution completed');
      console.log('Result:', result);
      currentBot = null; // Clear bot after completion
    }).catch(error => {
      console.error('❌ Bot execution failed:', error);
      currentBot = null;
    });

    return NextResponse.json({
      success: true,
      message: 'Bot started successfully',
      config: {
        symbol,
        positionSize,
        fundingRate: fundingRate.fundingRate,
        fundingRatePercent: `${(fundingRate.fundingRate * 100).toFixed(4)}%`,
        fundingPaymentTime: fundingPaymentTime.toISOString(),
        timeUntilFunding: timeUntilFunding,
        estimatedProfit: `~${(2.0 + 0.7 + Math.abs(fundingRate.fundingRate) * 100).toFixed(2)}%`,
      },
    });

  } catch (error: any) {
    console.error('Error executing strategy:', error);
    currentBot = null;
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
