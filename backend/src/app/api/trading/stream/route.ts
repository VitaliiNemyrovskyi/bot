import { NextRequest } from 'next/server';
import { bybitService } from '@/lib/bybit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';

  // Create a Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      console.log(`Starting real-time stream for ${symbol}`);

      // Send initial connection message
      const encoder = new TextEncoder();
      const send = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      send({ type: 'connected', symbol, timestamp: Date.now() });

      let intervalId: NodeJS.Timeout;

      try {
        // Setup WebSocket subscription to Bybit
        if (bybitService.hasCredentials()) {
          bybitService.subscribeToTicker(symbol, (data) => {
            try {
              if (data && data.data) {
                const tickerData = data.data;
                send({
                  type: 'ticker',
                  symbol: tickerData.symbol,
                  price: parseFloat(tickerData.lastPrice),
                  volume: parseFloat(tickerData.volume24h),
                  change24h: parseFloat(tickerData.price24hPcnt),
                  timestamp: Date.now()
                });
              }
            } catch (error) {
              console.error('Error processing ticker data:', error);
            }
          });
        }

        // Fallback: Poll for data every 5 seconds if WebSocket is not available
        intervalId = setInterval(async () => {
          try {
            const ticker = await bybitService.getTicker('linear', symbol);
            if (ticker && ticker.length > 0) {
              const tickerData = ticker[0];
              send({
                type: 'ticker',
                symbol: tickerData.symbol,
                price: parseFloat(tickerData.lastPrice),
                volume: parseFloat(tickerData.volume24h),
                change24h: parseFloat(tickerData.price24hPcnt),
                bid: parseFloat(tickerData.bid1Price),
                ask: parseFloat(tickerData.ask1Price),
                high24h: parseFloat(tickerData.highPrice24h),
                low24h: parseFloat(tickerData.lowPrice24h),
                timestamp: Date.now()
              });
            }
          } catch (error) {
            console.error('Error fetching ticker data:', error);
            send({
              type: 'error',
              message: 'Failed to fetch ticker data',
              timestamp: Date.now()
            });
          }
        }, 5000);

      } catch (error) {
        console.error('Error setting up stream:', error);
        send({
          type: 'error',
          message: 'Failed to setup stream',
          timestamp: Date.now()
        });
      }

      // Cleanup function
      const cleanup = () => {
        console.log(`Cleaning up stream for ${symbol}`);
        if (intervalId) {
          clearInterval(intervalId);
        }
        try {
          if (bybitService.hasCredentials()) {
            bybitService.unsubscribeAll();
          }
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
        controller.close();
      };

      // Set up cleanup on client disconnect
      request.signal.addEventListener('abort', cleanup);

      // Auto-cleanup after 30 minutes to prevent memory leaks
      setTimeout(cleanup, 30 * 60 * 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}