/**
 * API Route: /api/funding-arb/status
 * Get current bot status
 */

import { NextRequest, NextResponse } from 'next/server';

// Import the bot instance from execute route
// Note: In production, this should use a shared state manager or Redis
let currentBot: any = null;

export async function GET(_request: NextRequest) {
  try {
    if (!currentBot) {
      return NextResponse.json({
        success: true,
        isRunning: false,
        message: 'No bot is currently running',
      });
    }

    const result = currentBot.getResult();

    return NextResponse.json({
      success: true,
      isRunning: true,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error getting bot status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
