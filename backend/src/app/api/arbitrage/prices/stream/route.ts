import { NextRequest } from 'next/server';
import { websocketManager } from '@/services/websocket-manager.service';

/**
 * GET /api/arbitrage/prices/stream
 *
 * Public Server-Sent Events endpoint for real-time price updates
 * from multiple exchanges. This endpoint acts as a WebSocket proxy
 * to avoid CORS issues when connecting directly from browser.
 *
 * Query Parameters:
 * - primaryExchange: Primary exchange (e.g., BYBIT, BINGX, MEXC, OKX)
 * - hedgeExchange: Hedge exchange
 * - symbol: Trading symbol (e.g., BTCUSDT)
 *
 * SSE Message Format:
 * {
 *   "type": "price_update",
 *   "exchange": "BYBIT",
 *   "symbol": "BTCUSDT",
 *   "price": 43250.50,
 *   "fundingRate": 0.0001,
 *   "timestamp": 1234567890000
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const primaryExchange = searchParams.get('primaryExchange')?.toUpperCase();
    const hedgeExchange = searchParams.get('hedgeExchange')?.toUpperCase();
    const symbol = searchParams.get('symbol');

    if (!primaryExchange || !hedgeExchange || !symbol) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing parameters',
          message: 'primaryExchange, hedgeExchange, and symbol are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const exchanges = [primaryExchange, hedgeExchange];
    console.log(`[PriceStream] Streaming ${symbol} from ${exchanges.join(' + ')}`);

    // Create Server-Sent Events stream
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
            console.error('[PriceStream] Error sending message:', error.message);
          }
        };

        // Send connection message
        send({
          type: 'connected',
          symbol,
          exchanges,
          timestamp: Date.now(),
        });

        // Subscribe to each exchange
        exchanges.forEach((exchange) => {
          console.log(`[PriceStream] Subscribing to ${exchange}:${symbol}`);

          // Build WebSocket configuration based on exchange
          let wsConfig: any;

          if (exchange === 'BYBIT') {
            wsConfig = {
              url: 'wss://stream.bybit.com/v5/public/linear',
              subscribeMessage: {
                op: 'subscribe',
                args: [`tickers.${symbol}`],
              },
              heartbeatInterval: 20000,
            };
          } else if (exchange === 'BINGX') {
            const bingxSymbol = symbol.replace(/USDT$/, '-USDT');
            wsConfig = {
              url: 'wss://open-api-swap.bingx.com/swap-market',
              subscribeMessage: {
                id: Date.now().toString(),
                reqType: 'sub',
                dataType: `${bingxSymbol}@ticker`, // BingX ticker includes price and funding rate
              },
              heartbeatInterval: 30000,
              compression: 'gzip', // BingX uses gzip compression
            };
          } else if (exchange === 'MEXC') {
            const mexcSymbol = symbol.includes('_') ? symbol : symbol.replace(/USDT$/, '_USDT');
            wsConfig = {
              url: 'wss://contract.mexc.com/edge',
              subscribeMessage: {
                method: 'sub.ticker',
                param: {
                  symbol: mexcSymbol,
                },
              },
              heartbeatInterval: 15000,
            };
          } else if (exchange === 'OKX') {
            // Convert symbol format: BTCUSDT → BTC-USDT-SWAP or 0GUSDT → 0G-USDT-SWAP
            let okxSymbol: string;
            if (symbol.endsWith('USDT')) {
              const base = symbol.slice(0, -4);
              okxSymbol = `${base}-USDT-SWAP`;
            } else if (symbol.endsWith('USDC')) {
              const base = symbol.slice(0, -4);
              okxSymbol = `${base}-USDC-SWAP`;
            } else {
              okxSymbol = symbol; // Fallback to original symbol
            }

            wsConfig = {
              url: 'wss://ws.okx.com:8443/ws/v5/public',
              subscribeMessage: {
                op: 'subscribe',
                args: [{
                  channel: 'tickers',
                  instId: okxSymbol,
                }],
              },
              heartbeatInterval: 30000,
            };
          } else if (exchange === 'GATEIO') {
            // Convert symbol format for Gate.io: BTCUSDT → BTC_USDT
            let gateioSymbol: string;
            if (symbol.endsWith('USDT')) {
              const base = symbol.slice(0, -4);
              gateioSymbol = `${base}_USDT`;
            } else if (symbol.endsWith('USDC')) {
              const base = symbol.slice(0, -4);
              gateioSymbol = `${base}_USDC`;
            } else {
              gateioSymbol = symbol; // Fallback to original symbol
            }

            wsConfig = {
              url: 'wss://fx-ws.gateio.ws/v4/ws/usdt',
              subscribeMessage: {
                time: Math.floor(Date.now() / 1000),
                channel: 'futures.tickers',
                event: 'subscribe',
                payload: [gateioSymbol],
              },
              heartbeatInterval: 30000,
            };
          } else {
            console.warn(`[PriceStream] Unsupported exchange: ${exchange}`);
            send({
              type: 'error',
              exchange,
              message: `Unsupported exchange: ${exchange}`,
              timestamp: Date.now(),
            });
            return;
          }

          // Subscribe using WebSocket Manager
          websocketManager
            .subscribe(exchange, symbol, wsConfig, (data: any) => {
              if (isClosing) return;

              try {
                // Parse price and funding rate from exchange-specific format
                let price: number | null = null;
                let fundingRate: number | null = null;

                if (exchange === 'BYBIT') {
                  if (data.topic && data.topic.startsWith('tickers.') && data.data) {
                    const tickerData = Array.isArray(data.data) ? data.data[0] : data.data;
                    price = parseFloat(tickerData.lastPrice || '0');
                    fundingRate = parseFloat(tickerData.fundingRate || '0');
                  }
                } else if (exchange === 'BINGX') {
                  // Handle both subscription confirmation and data updates
                  if (data.dataType && data.dataType.includes('@ticker') && data.data) {
                    price = parseFloat(data.data.c || '0'); // Close price
                    fundingRate = parseFloat(data.data.r || '0'); // Funding rate
                  } else if (data.dataType && data.dataType.includes('@lastPrice') && data.data) {
                    price = parseFloat(data.data.p || '0'); // Last price
                  }
                } else if (exchange === 'MEXC') {
                  if (data.channel === 'push.ticker' && data.data) {
                    price = parseFloat(data.data.lastPrice || '0');
                    fundingRate = parseFloat(data.data.fundingRate || '0');
                  }
                } else if (exchange === 'OKX') {
                  if (data.arg && data.arg.channel === 'tickers' && data.data && data.data.length > 0) {
                    const tickerData = data.data[0];
                    price = parseFloat(tickerData.last || '0');
                    // OKX doesn't include funding rate in ticker, need separate subscription
                  }
                } else if (exchange === 'GATEIO') {
                  console.log('[PriceStream] Gate.io raw data:', JSON.stringify(data));

                  if (data.event === 'update' && data.channel === 'futures.tickers' && data.result) {
                    const tickerData = Array.isArray(data.result) ? data.result[0] : data.result;
                    price = parseFloat(tickerData.last || '0');
                    console.log('[PriceStream] Gate.io parsed price:', price, 'from', tickerData.last);
                    // Gate.io doesn't include funding rate in ticker
                  } else {
                    console.warn('[PriceStream] Gate.io unexpected message format:', {
                      event: data.event,
                      channel: data.channel,
                      hasResult: !!data.result
                    });
                  }
                }

                if (price && price > 0) {
                  send({
                    type: 'price_update',
                    exchange,
                    symbol,
                    price,
                    fundingRate,
                    timestamp: Date.now(),
                  });
                }
              } catch (error: any) {
                console.error(`[PriceStream] Error processing ${exchange}:${symbol} data:`, error.message);
              }
            })
            .then((unsubscribe) => {
              unsubscribeFunctions.push(unsubscribe);
              console.log(`[PriceStream] Successfully subscribed to ${exchange}:${symbol}`);
            })
            .catch((error: any) => {
              console.error(`[PriceStream] Failed to subscribe to ${exchange}:${symbol}:`, error.message);
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

          console.log('[PriceStream] Cleaning up stream');

          // Unsubscribe from all WebSocket streams
          unsubscribeFunctions.forEach((unsubscribe) => {
            try {
              unsubscribe();
            } catch (error: any) {
              console.error('[PriceStream] Error during unsubscribe:', error.message);
            }
          });

          // Close the stream
          try {
            controller.close();
          } catch (error: any) {
            console.error('[PriceStream] Error closing controller:', error.message);
          }

          console.log('[PriceStream] Stream cleaned up');
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
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error: any) {
    console.error('[PriceStream] Error setting up stream:', error);
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
