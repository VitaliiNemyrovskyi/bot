import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth';
import { OpportunityDetectionService } from '@/services/triangular-arbitrage-opportunity.service';

/**
 * GET /api/triangular-arbitrage/stream
 * Server-Sent Events stream for real-time triangular arbitrage updates
 *
 * Streams:
 * - Scanner status updates (started/stopped)
 * - New opportunities as they're detected
 * - Scanner statistics
 */
export async function GET(request: NextRequest) {
  try {
    // For SSE, EventSource can't send custom headers, so we accept token from query param
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get('token');

    let authResult;
    if (tokenFromQuery) {
      // Create a mock request with the token in the Authorization header
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name === 'authorization') {
              return `Bearer ${tokenFromQuery}`;
            }
            return request.headers.get(name);
          }
        }
      };
      authResult = await AuthService.authenticateRequest(mockRequest);
    } else {
      // Fallback to normal header-based auth
      authResult = await AuthService.authenticateRequest(request);
    }

    if (!authResult.success || !authResult.user) {
      console.log('[TriArbStream] Auth failed:', authResult.error);
      return new Response('Unauthorized', { status: 401 });
    }
    const userId = authResult.user.userId;

    console.log(`[TriArbStream] Client connected: ${userId}`);

    // Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();

        // Helper function to send events to client
        const send = (type: string, data: any) => {
          const message = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // Send connection confirmation
        send('connected', { userId });

        // Track all event listeners for cleanup
        const allListeners: Array<{ scanner: any; event: string; handler: Function }> = [];
        let heartbeatInterval: NodeJS.Timeout | null = null;
        let checkScannersInterval: NodeJS.Timeout | null = null;

        // Cache scanners list to avoid repeated calls
        let cachedScanners: any[] = [];

        // Function to attach listeners to a scanner
        const attachListeners = (scanner: any) => {
          const config = scanner.getConfig();
          const exchange = config.exchange;

          // Add to cache if not already there
          if (!cachedScanners.includes(scanner)) {
            cachedScanners.push(scanner);
          }

          const onStarted = (data: any) => {
            console.log(`[TriArbStream] Scanner started event received for ${userId} on ${exchange}`);
            const scannerData = {
              exchange,
              status: 'scanning',
              trianglesMonitored: data.trianglesCount,
            };
            console.log(`[TriArbStream] Sending scanner started event:`, JSON.stringify(scannerData));
            send('scanner', scannerData);
          };

          const onStopped = () => {
            console.log(`[TriArbStream] Scanner stopped for ${userId} on ${exchange}`);
            send('scanner', {
              exchange,
              status: 'stopped',
            });

            // Remove from cache
            const index = cachedScanners.indexOf(scanner);
            if (index > -1) {
              cachedScanners.splice(index, 1);
            }
          };

          const onOpportunity = (opportunity: any) => {
            console.log(`[TriArbStream] New opportunity for ${userId} on ${exchange}:`, {
              triangle: opportunity.triangle,
              profit: opportunity.profitPercent,
            });
            send('opportunity', {
              ...opportunity,
              exchange, // Add exchange to opportunity data
            });
          };

          // Add event listeners
          scanner.on('started', onStarted);
          scanner.on('stopped', onStopped);
          scanner.on('opportunity', onOpportunity);

          // Track for cleanup
          allListeners.push(
            { scanner, event: 'started', handler: onStarted },
            { scanner, event: 'stopped', handler: onStopped },
            { scanner, event: 'opportunity', handler: onOpportunity }
          );
        };

        // Check for existing scanners and attach listeners
        const initializeScanners = () => {
          const scanners = OpportunityDetectionService.getAllInstancesForUser(userId);
          cachedScanners = scanners; // Cache the scanners list

          console.log(`[TriArbStream] Checking for scanners - Found ${scanners.length} active scanners for user ${userId}`);

          if (scanners.length > 0) {
            console.log(`[TriArbStream] Setting up listeners for ${scanners.length} active scanners`);

            // Send current status for all scanners
            scanners.forEach((scanner) => {
              const status = scanner.getStatus();
              const config = scanner.getConfig();
              send('scanner', {
                exchange: config.exchange,
                status: status.status,
                stats: status.stats,
              });

              // Attach listeners to this scanner
              attachListeners(scanner);
            });
          }
        };

        // Initialize with any existing scanners
        initializeScanners();

        // Check for new scanners every 5 seconds
        // This is needed because the stream may connect BEFORE a scanner is created
        checkScannersInterval = setInterval(() => {
          try {
            const currentScanners = OpportunityDetectionService.getAllInstancesForUser(userId);

            // Find new scanners that we're not tracking yet
            for (const scanner of currentScanners) {
              if (!cachedScanners.includes(scanner)) {
                console.log(`[TriArbStream] Detected new scanner: ${scanner.getConfig().exchange}`);

                // Send current status for new scanner
                const status = scanner.getStatus();
                const config = scanner.getConfig();
                send('scanner', {
                  exchange: config.exchange,
                  status: status.status,
                  stats: status.stats,
                });

                // Attach listeners to new scanner
                attachListeners(scanner);
              }
            }
          } catch (error) {
            console.error('[TriArbStream] Error checking for new scanners:', error);
          }
        }, 5000); // Check every 5 seconds (reduced from 2 seconds to minimize overhead)

        // Send periodic heartbeat every 30 seconds
        heartbeatInterval = setInterval(() => {
          try {
            // Use cached scanners to avoid repeated calls to getAllInstancesForUser
            const statuses = cachedScanners.map(s => ({
              exchange: s.getConfig().exchange,
              status: s.getStatus().status,
            }));
            send('heartbeat', {
              timestamp: Date.now(),
              scanners: statuses,
            });
          } catch (error) {
            console.error('[TriArbStream] Error sending heartbeat:', error);
          }
        }, 30000);

        // Cleanup function
        const cleanup = () => {
          console.log(`[TriArbStream] Client disconnected: ${userId}`);

          // Remove all event listeners
          allListeners.forEach(({ scanner, event, handler }) => {
            try {
              scanner.off(event, handler);
            } catch (error) {
              // Scanner may have been destroyed
            }
          });

          // Clear intervals
          if (heartbeatInterval) {
            clearInterval(heartbeatInterval);
            heartbeatInterval = null;
          }
          if (checkScannersInterval) {
            clearInterval(checkScannersInterval);
            checkScannersInterval = null;
          }

          // Close stream
          try {
            controller.close();
          } catch (error) {
            // Stream may already be closed
          }
        };

        // Set up cleanup on client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Auto-cleanup after 2 hours to prevent memory leaks
        setTimeout(cleanup, 2 * 60 * 60 * 1000);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
      }
    });

  } catch (error: any) {
    console.error('[TriArbStream] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create stream' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
