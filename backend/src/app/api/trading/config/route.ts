import { NextResponse } from 'next/server';

interface TradingViewConfig {
  supported_resolutions: string[];
  supports_group_request: boolean;
  supports_marks: boolean;
  supports_search: boolean;
  supports_timescale_marks: boolean;
  exchanges: Array<{
    value: string;
    name: string;
    desc: string;
  }>;
  symbols_types: Array<{
    name: string;
    value: string;
  }>;
  currency_codes: string[];
}

export async function GET() {
  try {
    const config: TradingViewConfig = {
      supported_resolutions: ['1', '5', '15', '30', '60', '240', '1D', '1W'],
      supports_group_request: false,
      supports_marks: false,
      supports_search: true,
      supports_timescale_marks: false,
      exchanges: [
        {
          value: 'BYBIT',
          name: 'Bybit',
          desc: 'Bybit Cryptocurrency Exchange'
        }
      ],
      symbols_types: [
        {
          name: 'Cryptocurrency',
          value: 'crypto'
        }
      ],
      currency_codes: ['USDT', 'BTC', 'ETH', 'USD']
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Config error:', error);
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}