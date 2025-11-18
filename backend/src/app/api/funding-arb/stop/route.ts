/**
 * API Route: /api/funding-arb/stop
 * Emergency stop for running bot
 */

import { NextRequest, NextResponse } from 'next/server';

// Import the bot instance from execute route
// Note: In production, this should use a shared state manager or Redis
let currentBot: any = null;

export async function POST(_request: NextRequest) {
  try {
    if (!currentBot) {
      return NextResponse.json({
        success: true,
        message: 'No bot is currently running',
      });
    }

    console.log('🛑 Emergency stop requested');
    await currentBot.stop();
    const result = currentBot.getResult();
    currentBot = null;

    return NextResponse.json({
      success: true,
      message: 'Bot stopped successfully',
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error stopping bot:', error);
    currentBot = null;
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
