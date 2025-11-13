/**
 * API Route: Single Recording Session
 *
 * GET /api/funding-payment/recordings/[sessionId] - Get session details
 * POST /api/funding-payment/recordings/[sessionId]/cancel - Cancel session
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { FundingPaymentRecorderService } from '@/services/funding-payment-recorder.service';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

/**
 * GET /api/funding-payment/recordings/[sessionId]
 * Get recording session details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Authenticate user
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const { sessionId } = params;

    // Fetch session from database
    const recording = await prisma.fundingPaymentRecordingSession.findUnique({
      where: { id: sessionId },
      include: {
        _count: {
          select: { dataPoints: true },
        },
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (recording.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this recording session' },
        { status: 403 }
      );
    }

    // Check if session is active
    const activeSession = FundingPaymentRecorderService.getSession(sessionId);
    const isActive = !!activeSession;

    return NextResponse.json({
      success: true,
      recording: {
        ...recording,
        dataPointsCount: recording._count.dataPoints,
        isActive,
        ...(isActive && {
          activeSessionData: activeSession?.getSessionData(),
        }),
      },
    });

  } catch (error: any) {
    console.error('[GET /recordings/:id] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recording' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/funding-payment/recordings/[sessionId]/cancel
 * Cancel an active recording session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Authenticate user
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;
    const { sessionId } = params;

    // Fetch session from database
    const recording = await prisma.fundingPaymentRecordingSession.findUnique({
      where: { id: sessionId },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (recording.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this recording session' },
        { status: 403 }
      );
    }

    // Check if session can be cancelled
    if (['COMPLETED', 'CANCELLED', 'ERROR'].includes(recording.status)) {
      return NextResponse.json(
        { error: `Cannot cancel session with status: ${recording.status}` },
        { status: 400 }
      );
    }

    // Cancel the active session
    await FundingPaymentRecorderService.cancelSession(sessionId);

    console.log(`[POST /recordings/:id/cancel] Cancelled session: ${sessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Recording session cancelled',
      sessionId,
    });

  } catch (error: any) {
    console.error('[POST /recordings/:id/cancel] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel recording' },
      { status: 500 }
    );
  }
}
