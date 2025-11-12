import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

// Access global signal event emitter
const globalForSignalEvents = globalThis as unknown as {
  signalMonitorEvents?: import('events').EventEmitter;
};

/**
 * GET /api/arbitrage/signal/stream
 *
 * Server-Sent Events stream for real-time signal monitoring updates
 *
 * Events emitted:
 * - price_update: Price and funding spread updates
 * - signal_triggered: Signal conditions met, graduated entry starting
 * - signal_cancelled: Signal stopped by user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    console.log('[SignalStream] Starting SSE stream for user', userId);

    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        let isClosing = false;

        // Helper function to send SSE message
        const send = (data: any) => {
          if (isClosing) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (error: any) {
            console.error('[SignalStream] Error sending message:', error.message);
          }
        };

        // Send connected event
        send({
          type: 'connected',
          userId,
          timestamp: Date.now(),
        });

        // Get global event emitter
        const events = globalForSignalEvents.signalMonitorEvents;
        if (!events) {
          console.error('[SignalStream] Signal events not initialized');
          send({
            type: 'error',
            message: 'Signal monitoring not initialized',
            timestamp: Date.now(),
          });
          controller.close();
          return;
        }

        // Event handlers
        const handlePriceUpdate = (data: any) => {
          // Only send updates for this user's signals
          if (data.userId === userId) {
            send({
              type: 'price_update',
              ...data,
              timestamp: Date.now(),
            });
          }
        };

        const handleSignalTriggered = (data: any) => {
          if (data.userId === userId) {
            send({
              type: 'signal_triggered',
              ...data,
              timestamp: Date.now(),
            });
          }
        };

        const handleSignalCancelled = (data: any) => {
          if (data.userId === userId) {
            send({
              type: 'signal_cancelled',
              ...data,
              timestamp: Date.now(),
            });
          }
        };

        // Subscribe to events
        events.on('price_update', handlePriceUpdate);
        events.on('signal_triggered', handleSignalTriggered);
        events.on('signal_cancelled', handleSignalCancelled);

        console.log('[SignalStream] Subscribed to signal events for user', userId);

        // Cleanup function
        const cleanup = () => {
          if (isClosing) return;
          isClosing = true;

          console.log('[SignalStream] Cleaning up stream for user', userId);

          // Unsubscribe from events
          if (events) {
            events.off('price_update', handlePriceUpdate);
            events.off('signal_triggered', handleSignalTriggered);
            events.off('signal_cancelled', handleSignalCancelled);
          }

          // Close the stream
          try {
            controller.close();
          } catch (error: any) {
            console.error('[SignalStream] Error closing controller:', error.message);
          }

          console.log('[SignalStream] Stream cleaned up for user', userId);
        };

        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Auto-cleanup after 1 hour to prevent memory leaks
        setTimeout(cleanup, 60 * 60 * 1000);
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error: any) {
    console.error('[SignalStream] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create stream' },
      { status: 500 }
    );
  }
}
