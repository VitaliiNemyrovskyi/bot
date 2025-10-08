import { NextRequest, NextResponse } from 'next/server';
import { bybitService } from '@/lib/bybit';

interface TradingViewBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ChartDataRequest {
  symbol: string;
  resolution: string;
  from: number;
  to: number;
  firstDataRequest?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const symbol = searchParams.get('symbol') || 'BTCUSDT';
    const resolution = searchParams.get('resolution') || '60'; // Default to 1 hour
    const from = parseInt(searchParams.get('from') || '0');
    const to = parseInt(searchParams.get('to') || String(Date.now()));
    const firstDataRequest = searchParams.get('firstDataRequest') === 'true';

    // Convert TradingView resolution to Bybit interval
    const intervalMap: { [key: string]: string } = {
      '1': '1',     // 1 minute
      '5': '5',     // 5 minutes
      '15': '15',   // 15 minutes
      '30': '30',   // 30 minutes
      '60': '60',   // 1 hour
      '240': '240', // 4 hours
      '1D': 'D',    // 1 day
      '1W': 'W',    // 1 week
    };

    const interval = intervalMap[resolution] || '60';

    // Calculate the limit based on time range
    const timeRangeMs = (to - from) * 1000;
    const intervalMs = getIntervalMs(interval);
    let limit = Math.min(Math.ceil(timeRangeMs / intervalMs), 1000); // Max 1000 candles

    if (limit < 1) limit = 200; // Default fallback

    console.log(`Fetching chart data: ${symbol}, interval: ${interval}, from: ${from}, to: ${to}, limit: ${limit}`);

    // Fetch kline data from Bybit
    const klineData = await bybitService.getKline(
      'linear',
      symbol,
      interval,
      from * 1000, // Convert to milliseconds
      to * 1000,   // Convert to milliseconds
      limit
    );

    if (!klineData || !klineData.list || klineData.list.length === 0) {
      return NextResponse.json({
        s: 'no_data',
        nextTime: to + 86400 // Next day
      });
    }

    // Convert Bybit data to TradingView format
    const bars: TradingViewBar[] = klineData.list
      .map(candle => {
        // Bybit kline format: [startTime, openPrice, highPrice, lowPrice, closePrice, volume, turnover]
        const [timestamp, open, high, low, close, volume] = candle;

        return {
          time: Math.floor(parseInt(timestamp) / 1000), // Convert to seconds
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          volume: parseFloat(volume)
        };
      })
      .filter(bar => bar.time >= from && bar.time <= to)
      .sort((a, b) => a.time - b.time);

    if (bars.length === 0) {
      return NextResponse.json({
        s: 'no_data',
        nextTime: to + 86400
      });
    }

    console.log(`Returning ${bars.length} bars for ${symbol}`);

    return NextResponse.json({
      s: 'ok',
      t: bars.map(bar => bar.time),
      o: bars.map(bar => bar.open),
      h: bars.map(bar => bar.high),
      l: bars.map(bar => bar.low),
      c: bars.map(bar => bar.close),
      v: bars.map(bar => bar.volume)
    });

  } catch (error) {
    console.error('Chart data error:', error);
    return NextResponse.json(
      {
        s: 'error',
        errmsg: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getIntervalMs(interval: string): number {
  const intervalMap: { [key: string]: number } = {
    '1': 60 * 1000,           // 1 minute
    '5': 5 * 60 * 1000,       // 5 minutes
    '15': 15 * 60 * 1000,     // 15 minutes
    '30': 30 * 60 * 1000,     // 30 minutes
    '60': 60 * 60 * 1000,     // 1 hour
    '240': 4 * 60 * 60 * 1000, // 4 hours
    'D': 24 * 60 * 60 * 1000,  // 1 day
    'W': 7 * 24 * 60 * 60 * 1000, // 1 week
  };

  return intervalMap[interval] || 60 * 60 * 1000; // Default to 1 hour
}