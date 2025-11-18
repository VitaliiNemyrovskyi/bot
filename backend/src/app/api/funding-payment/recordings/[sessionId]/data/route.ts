/**
 * API Route: Recording Data Points
 *
 * GET /api/funding-payment/recordings/[sessionId]/data - Get all data points for a recording
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/funding-payment/recordings/[sessionId]/data
 * Get all data points for a completed recording session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.userId;
    const { sessionId } = await params;

    // Fetch session from database
    const recording = await prisma.fundingPaymentRecordingSession.findUnique({
      where: { id: sessionId },
      include: {
        dataPoints: {
          orderBy: { bybitTimestamp: 'asc' },
        },
      },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording session not found' },
        { status: 404 }
      );
    }

    // Check ownership (allow if userId is null - automated recording, or if user owns it)
    if (recording.userId && recording.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this recording session' },
        { status: 403 }
      );
    }

    // Return data in the format expected by frontend
    return NextResponse.json({
      sessionId: recording.id,
      exchange: recording.exchange,
      symbol: recording.symbol,
      fundingPaymentTime: recording.fundingPaymentTime?.toISOString() || '',
      fundingRate: recording.fundingRate,
      priceDropPercent: recording.priceDropPercent,
      status: recording.status,
      data: recording.dataPoints.map(dp => ({
        timestamp: Number(dp.bybitTimestamp),
        price: dp.lastPrice,
        bid1Price: dp.bid1Price,
        bid1Size: dp.bid1Size,
        ask1Price: dp.ask1Price,
        ask1Size: dp.ask1Size,
        volume24h: dp.volume24h,
      })),
    });

  } catch (error: any) {
    console.error('[GET /recordings/:id/data] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recording data' },
      { status: 500 }
    );
  }
}
