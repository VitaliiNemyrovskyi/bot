import { NextRequest, NextResponse } from 'next/server';
import { getSymbolsByExchange, shouldUpdateSymbols, syncAllExchanges } from '@/services/trading-symbols.service';
import { Exchange } from '@prisma/client';

interface TradingViewSymbol {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  type: string;
  currency_code?: string;
  session: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  intraday_multipliers: string[];
  data_status: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exchangeParam = searchParams.get('exchange')?.toUpperCase() || 'BYBIT';
    const symbol = searchParams.get('symbol');

    // Validate exchange
    const exchange = exchangeParam as Exchange;
    if (!['BYBIT', 'BINANCE'].includes(exchange)) {
      return NextResponse.json(
        { error: 'Invalid exchange. Supported: BYBIT, BINANCE' },
        { status: 400 }
      );
    }

    // Check if we need to sync symbols (background task if needed)
    const needsUpdate = await shouldUpdateSymbols(exchange);
    if (needsUpdate) {
      // Trigger sync in background (non-blocking)
      syncAllExchanges().catch(err =>
        console.error('Background symbol sync failed:', err)
      );
    }

    if (symbol) {
      // Return specific symbol info from database
      const symbols = await getSymbolsByExchange(exchange);
      const symbolInfo = symbols.find(s => s.symbol === symbol);

      if (symbolInfo) {
        return NextResponse.json(formatSymbol(symbolInfo, exchange));
      } else {
        return NextResponse.json(
          { error: 'Symbol not found' },
          { status: 404 }
        );
      }
    }

    // Return all available symbols from database (with caching)
    console.log(`Fetching cached symbols for ${exchange}...`);
    const symbols = await getSymbolsByExchange(exchange);

    const formattedSymbols: TradingViewSymbol[] = symbols
      .map(s => formatSymbol(s, exchange));

    console.log(`Returning ${formattedSymbols.length} symbols for ${exchange}`);

    return NextResponse.json(formattedSymbols);

  } catch (error) {
    console.error('Symbols error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function formatSymbol(symbolData: any, exchange: Exchange): TradingViewSymbol {
  return {
    symbol: symbolData.symbol,
    full_name: `${exchange}:${symbolData.symbol}`,
    description: symbolData.description || `${symbolData.baseAsset}/${symbolData.quoteAsset}`,
    exchange: exchange,
    type: 'crypto',
    currency_code: symbolData.quoteAsset,
    session: '24x7',
    timezone: 'UTC',
    minmov: 1,
    pricescale: symbolData.tickSize ? Math.pow(10, getDecimalPlaces(symbolData.tickSize.toString())) : 100,
    has_intraday: true,
    has_daily: true,
    has_weekly_and_monthly: true,
    supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
    intraday_multipliers: ['1', '5', '15', '30', '60', '240'],
    data_status: 'streaming'
  };
}

function getDecimalPlaces(tickSize: string): number {
  const parts = tickSize.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}