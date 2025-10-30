import { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth';
import { websocketManager } from '@/services/websocket-manager.service';

/**
 * GET /api/arbitrage/funding-rates/stream
 *
 * Server-Sent Events endpoint for real-time price and spread updates
 * for top arbitrage opportunities.
 *
 * Query Parameters:
 * - symbols: Comma-separated list of symbols to monitor (e.g., "BTCUSDT,ETHUSDT")
 * - exchanges: JSON array of {exchange, credentialId, symbol} objects
 *
 * Authentication: Required (Bearer token)
 *
 * SSE Message Format:
 * {
 *   "type": "price_update",
 *   "symbol": "BTCUSDT",
 *   "exchange": "BYBIT",
 *   "price": 43250.50,
 *   "spread": 0.15,
 *   "timestamp": 1234567890000
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Parse query parameters first (need token for auth)
    const { searchParams } = new URL(request.url);

    // Get token from query parameter (EventSource doesn't support custom headers)
    const tokenFromQuery = searchParams.get('token');

    // Authenticate user
    let authResult;
    if (tokenFromQuery) {
      // Authenticate using token from query parameter
      const payload = AuthService.verifyToken(tokenFromQuery);
      if (!payload) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid token',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Verify user still exists
      const user = await AuthService.findUserById(payload.userId);
      if (!user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unauthorized',
            message: 'User not found',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      authResult = { success: true, user: payload };
    } else {
      // Fallback to header-based authentication
      authResult = await AuthService.authenticateRequest(request);
    }

    if (!authResult.success || !authResult.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const userId = authResult.user.userId;
    console.log(`[ArbitrageStream] User ${userId} connecting to stream`);

    // 2. Get remaining query parameters (searchParams already parsed above)
    const symbolsParam = searchParams.get('symbols');
    const exchangesParam = searchParams.get('exchanges');

    if (!symbolsParam || !exchangesParam) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing parameters',
          message: 'Both symbols and exchanges parameters are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const symbols = symbolsParam.split(',').map(s => s.trim());
    const exchanges = JSON.parse(exchangesParam);

    console.log(`[ArbitrageStream] Streaming ${symbols.length} symbols across ${exchanges.length} exchanges`);

    // 3. Create Server-Sent Events stream
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const unsubscribeFunctions: Array<() => void> = [];
        let isClosing = false;

        // Helper to send SSE message
        const send = (data: any) => {
          if (isClosing) return;
          try {
            const message = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error: any) {
            console.error('[ArbitrageStream] Error sending message:', error.message);
          }
        };

        // Send connection message
        send({
          type: 'connected',
          userId,
          symbols,
          exchangeCount: exchanges.length,
          timestamp: Date.now(),
        });

        // Store latest prices for spread calculation
        const priceCache = new Map<string, { price: number; timestamp: number }>();

        // Subscribe to each exchange-symbol pair
        exchanges.forEach((config: any) => {
          const { exchange, symbol, credentialId, apiKey, apiSecret, authToken, environment } = config;

          console.log(`[ArbitrageStream] Subscribing to ${exchange}:${symbol}`);

          // Build WebSocket configuration based on exchange
          let wsConfig: any;

          if (exchange === 'BYBIT') {
            // Bybit WebSocket configuration
            const wsUrl = environment === 'TESTNET'
              ? 'wss://stream-testnet.bybit.com/v5/public/linear'
              : 'wss://stream.bybit.com/v5/public/linear';

            wsConfig = {
              url: wsUrl,
              subscribeMessage: {
                op: 'subscribe',
                args: [`tickers.${symbol}`],
              },
              heartbeatInterval: 20000,
            };
          } else if (exchange === 'BINGX') {
            // BingX WebSocket configuration
            const wsUrl = 'wss://open-api-swap.bingx.com/swap-market';
            const bingxSymbol = symbol.replace(/USDT$/, '-USDT'); // Convert BTCUSDT to BTC-USDT

            wsConfig = {
              url: wsUrl,
              subscribeMessage: {
                id: Date.now().toString(),
                dataType: `${bingxSymbol}@ticker`,
              },
              heartbeatInterval: 30000,
            };
          } else if (exchange === 'MEXC') {
            // MEXC WebSocket configuration
            const wsUrl = 'wss://contract.mexc.com/ws';
            const mexcSymbol = symbol.replace(/USDT$/, '_USDT'); // Convert BTCUSDT to BTC_USDT

            wsConfig = {
              url: wsUrl,
              subscribeMessage: {
                method: 'sub.ticker',
                param: {
                  symbol: mexcSymbol,
                },
              },
              heartbeatInterval: 30000,
            };
          } else {
            console.warn(`[ArbitrageStream] Unsupported exchange: ${exchange}`);
            return;
          }

          // Subscribe using WebSocket Manager
          websocketManager
            .subscribe(exchange, symbol, wsConfig, (data: any) => {
              if (isClosing) return;

              try {
                // Parse price from exchange-specific format
                let price: number | null = null;

                if (exchange === 'BYBIT') {
                  // Bybit V5 ticker format
                  if (data.topic && data.topic.startsWith('tickers.') && data.data) {
                    const tickerData = Array.isArray(data.data) ? data.data[0] : data.data;
                    price = parseFloat(tickerData.lastPrice || '0');
                  }
                } else if (exchange === 'BINGX') {
                  // BingX ticker format
                  if (data.dataType && data.dataType.includes('@ticker') && data.data) {
                    price = parseFloat(data.data.c || '0'); // 'c' is close/last price
                  }
                } else if (exchange === 'MEXC') {
                  // MEXC ticker format
                  if (data.channel === 'push.ticker' && data.data) {
                    price = parseFloat(data.data.lastPrice || '0');
                  }
                }

                if (price && price > 0) {
                  // Cache the price
                  const cacheKey = `${exchange}:${symbol}`;
                  priceCache.set(cacheKey, { price, timestamp: Date.now() });

                  // Calculate spread if we have prices from multiple exchanges for this symbol
                  const symbolPrices: Array<{ exchange: string; price: number }> = [];
                  for (const [key, value] of priceCache.entries()) {
                    const [ex, sym] = key.split(':');
                    if (sym === symbol) {
                      symbolPrices.push({ exchange: ex, price: value.price });
                    }
                  }

                  let spread = 0;
                  let spreadPercent = 0;
                  if (symbolPrices.length >= 2) {
                    const prices = symbolPrices.map(p => p.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    spread = maxPrice - minPrice;
                    spreadPercent = (spread / minPrice) * 100;
                  }

                  // Send price update to frontend
                  send({
                    type: 'price_update',
                    symbol,
                    exchange,
                    credentialId,
                    price,
                    spread: spread.toFixed(6),
                    spreadPercent: spreadPercent.toFixed(4),
                    timestamp: Date.now(),
                  });
                }
              } catch (error: any) {
                console.error(`[ArbitrageStream] Error processing ${exchange}:${symbol} data:`, error.message);
              }
            })
            .then((unsubscribe) => {
              unsubscribeFunctions.push(unsubscribe);
            })
            .catch((error: any) => {
              console.error(`[ArbitrageStream] Failed to subscribe to ${exchange}:${symbol}:`, error.message);
              send({
                type: 'error',
                exchange,
                symbol,
                message: `Failed to subscribe: ${error.message}`,
                timestamp: Date.now(),
              });
            });
        });

        // Cleanup function
        const cleanup = () => {
          if (isClosing) return;
          isClosing = true;

          // console.log('[ArbitrageStream] Cleaning up stream');

          // Unsubscribe from all WebSocket streams
          unsubscribeFunctions.forEach((unsubscribe) => {
            try {
              unsubscribe();
            } catch (error: any) {
              console.error('[ArbitrageStream] Error during unsubscribe:', error.message);
            }
          });

          // Close the stream
          try {
            controller.close();
          } catch (error: any) {
            console.error('[ArbitrageStream] Error closing controller:', error.message);
          }

          // console.log('[ArbitrageStream] Stream cleaned up');
        };

        // Handle client disconnect
        request.signal.addEventListener('abort', cleanup);

        // Auto-cleanup after 1 hour to prevent memory leaks
        setTimeout(cleanup, 60 * 60 * 1000);
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[ArbitrageStream] Error setting up stream:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to setup stream',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
