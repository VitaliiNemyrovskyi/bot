/**
 * API Route: Funding Payment Recordings
 *
 * POST /api/funding-payment/recordings - Start new recording
 * GET /api/funding-payment/recordings - List user's recordings
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Exchange } from '@prisma/client';
import { FundingPaymentRecorderService, RecordingConfig } from '@/services/funding-payment-recorder.service';
import { BybitService } from '@/lib/bybit';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * POST /api/funding-payment/recordings
 * Start a new recording session
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
      exchange,
      fundingRate,
      fundingPaymentTime,
      fundingInterval,
      preRecordingSeconds,
      postRecordingSeconds,
    } = body;

    // Validate required fields
    if (!symbol || !exchange || fundingRate === undefined || !fundingPaymentTime) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, exchange, fundingRate, fundingPaymentTime' },
        { status: 400 }
      );
    }

    // Validate exchange (only BYBIT for now)
    if (exchange !== 'BYBIT') {
      return NextResponse.json(
        { error: 'Only BYBIT exchange is supported for recordings' },
        { status: 400 }
      );
    }

    // Parse funding payment time
    const paymentTime = new Date(fundingPaymentTime);
    if (isNaN(paymentTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid fundingPaymentTime format' },
        { status: 400 }
      );
    }

    // Check if payment time is in the future
    const now = new Date();
    const millisecondsUntilPayment = paymentTime.getTime() - now.getTime();
    const minLeadTime = (preRecordingSeconds || 5) * 1000 + 10000; // preRecording + 10s buffer

    if (millisecondsUntilPayment < minLeadTime) {
      return NextResponse.json(
        {
          error: `Funding payment time must be at least ${minLeadTime / 1000}s in the future`,
          millisecondsUntilPayment,
        },
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

    // Create recording configuration
    const config: RecordingConfig = {
      userId,
      symbol,
      exchange: exchange as Exchange,
      fundingRate: parseFloat(fundingRate),
      fundingPaymentTime: paymentTime,
      fundingInterval: fundingInterval || 8,
      preRecordingSeconds: preRecordingSeconds || 5,
      postRecordingSeconds: postRecordingSeconds || 30,
    };

    // Start recording session
    const session_recorder = await FundingPaymentRecorderService.startRecording(config, bybitService);

    const sessionData = session_recorder.getSessionData();

    console.log(`[POST /recordings] Started recording session: ${sessionData.sessionId}`);

    return NextResponse.json({
      success: true,
      sessionId: sessionData.sessionId,
      status: sessionData.status,
      config: sessionData.config,
      timeSyncResult: sessionData.timeSyncResult,
      fundingPaymentTime: paymentTime.toISOString(),
      millisecondsUntilPayment,
    });

  } catch (error: any) {
    console.error('[POST /recordings] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start recording' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/funding-payment/recordings
 * List user's recording sessions
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const symbol = searchParams.get('symbol');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    const where: any = { userId };
    if (status) {
      where.status = status;
    }
    if (symbol) {
      where.symbol = symbol;
    }

    // Fetch recordings
    const [recordings, total] = await Promise.all([
      prisma.fundingPaymentRecordingSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { dataPoints: true },
          },
        },
      }),
      prisma.fundingPaymentRecordingSession.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      recordings: recordings.map(r => ({
        ...r,
        dataPointsCount: r._count.dataPoints,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });

  } catch (error: any) {
    console.error('[GET /recordings] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}
