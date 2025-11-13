/**
 * TEST API Route: Test Recording with Short Delay
 *
 * POST /api/funding-payment/recordings/test
 * Create a test recording with funding payment in 30 seconds
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Exchange } from '@prisma/client';
import { FundingPaymentRecorderService, RecordingConfig } from '@/services/funding-payment-recorder.service';
import { BybitService } from '@/lib/bybit';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/funding-payment/recordings/test
 * Start a test recording session with funding payment in 30 seconds
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;

    // Parse request body
    const body = await request.json();
    const {
      symbol,
      delaySeconds = 30, // Default 30 seconds for testing
    } = body;

    // Validate required fields
    if (!symbol) {
      return NextResponse.json(
        { error: 'Missing required field: symbol' },
        { status: 400 }
      );
    }

    // Get Bybit credentials
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        userId,
        exchange: 'BYBIT',
        isActive: true,
      },
    });

    if (!credentials) {
      return NextResponse.json(
        { error: 'No active Bybit credentials found. Please connect your Bybit account first.' },
        { status: 400 }
      );
    }

    // Create BybitService instance
    const bybitService = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      userId,
      credentialId: credentials.id,
    });

    // Initialize Bybit service
    await bybitService.syncTime();

    // Calculate test funding payment time (now + delaySeconds)
    const now = new Date();
    const fundingPaymentTime = new Date(now.getTime() + delaySeconds * 1000);

    console.log(`[TEST Recording] Creating test recording for ${symbol}`);
    console.log(`[TEST Recording] Funding payment time: ${fundingPaymentTime.toISOString()}`);
    console.log(`[TEST Recording] Delay: ${delaySeconds} seconds`);

    // Create recording configuration
    const config: RecordingConfig = {
      userId,
      symbol,
      exchange: 'BYBIT' as Exchange,
      fundingRate: -0.01, // Test funding rate -1%
      fundingPaymentTime,
      fundingInterval: 8,
      preRecordingSeconds: 5,
      postRecordingSeconds: 30,
    };

    // Start recording session
    const session_recorder = await FundingPaymentRecorderService.startRecording(config, bybitService);

    const sessionData = session_recorder.getSessionData();

    console.log(`[TEST Recording] Started recording session: ${sessionData.sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Test recording started',
      sessionId: sessionData.sessionId,
      status: sessionData.status,
      config: sessionData.config,
      timeSyncResult: sessionData.timeSyncResult,
      fundingPaymentTime: fundingPaymentTime.toISOString(),
      millisecondsUntilPayment: fundingPaymentTime.getTime() - Date.now(),
      delaySeconds,
      note: `This is a TEST recording. Funding payment simulated in ${delaySeconds} seconds.`,
    });

  } catch (error: any) {
    console.error('[POST /recordings/test] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start test recording' },
      { status: 500 }
    );
  }
}
