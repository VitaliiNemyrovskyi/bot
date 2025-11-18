/**
 * API Route: Recording Session Real-time Stream
 *
 * GET /api/funding-payment/recordings/[sessionId]/stream
 * Server-Sent Events (SSE) stream for real-time recording updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { FundingPaymentRecorderService } from '@/services/funding-payment-recorder.service';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/funding-payment/recordings/[sessionId]/stream
 * Stream real-time updates using Server-Sent Events (SSE)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Try to authenticate from header first
    let authResult = await AuthService.authenticateRequest(request);

    // If header auth fails, try query parameter (for EventSource which can't send headers)
    if (!authResult.success) {
      const { searchParams } = new URL(request.url);
      const token = searchParams.get('token');

      if (token) {
        const payload = AuthService.verifyToken(token);
        if (payload) {
          const user = await AuthService.findUserById(payload.userId);
          if (user) {
            authResult = { success: true, user: payload };
          }
        }
      }
    }

    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.userId;
    const { sessionId } = await params;

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

    // Get active session
    const activeSession = FundingPaymentRecorderService.getSession(sessionId);
    if (!activeSession) {
      return NextResponse.json(
        { error: 'Recording session is not active' },
        { status: 400 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send initial connection message
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        sendEvent('connected', {
          sessionId,
          status: activeSession.getSessionData().status,
          timestamp: Date.now(),
        });

        // Listen to session events
        const onStatus = (data: any) => {
          sendEvent('status', data);
        };

        const onCountdown = (data: any) => {
          sendEvent('countdown', data);
        };

        const onTimeSync = (data: any) => {
          sendEvent('timeSync', data);
        };

        const onDataPoint = (data: any) => {
          // Send data point updates (throttled - every 10th point)
          if (data.totalPoints % 10 === 0) {
            sendEvent('dataPoint', {
              totalPoints: data.totalPoints,
              relativeTimeMs: data.relativeTimeMs,
              lastPrice: data.lastPrice,
            });
          }
        };

        const onAnalytics = (data: any) => {
          sendEvent('analytics', data);
        };

        const onError = (error: Error) => {
          sendEvent('error', { message: error.message });
        };

        // Register event listeners
        activeSession.on('status', onStatus);
        activeSession.on('countdown', onCountdown);
        activeSession.on('timeSync', onTimeSync);
        activeSession.on('dataPoint', onDataPoint);
        activeSession.on('analytics', onAnalytics);
        activeSession.on('error', onError);

        // Send heartbeat every 15 seconds
        const heartbeat = setInterval(() => {
          try {
            sendEvent('heartbeat', { timestamp: Date.now() });
          } catch (e) {
            clearInterval(heartbeat);
          }
        }, 15000);

        // Clean up when connection closes
        request.signal.addEventListener('abort', () => {
          console.log(`[SSE] Client disconnected from session: ${sessionId}`);
          clearInterval(heartbeat);
          activeSession.off('status', onStatus);
          activeSession.off('countdown', onCountdown);
          activeSession.off('timeSync', onTimeSync);
          activeSession.off('dataPoint', onDataPoint);
          activeSession.off('analytics', onAnalytics);
          activeSession.off('error', onError);
          controller.close();
        });

        // Auto-close after recording completes (with 30s delay)
        activeSession.once('status', (data: any) => {
          if (['COMPLETED', 'ERROR', 'CANCELLED'].includes(data.status)) {
            setTimeout(() => {
              console.log(`[SSE] Auto-closing stream for completed session: ${sessionId}`);
              clearInterval(heartbeat);
              controller.close();
            }, 30000);
          }
        });
      },
    });

    // Return SSE response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: any) {
    console.error('[GET /recordings/:id/stream] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to establish stream' },
      { status: 500 }
    );
  }
}
