import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const exchangeInfo: Record<string, { description: string; logo: string }> = {
  BINANCE: {
    description: 'Global cryptocurrency exchange',
    logo: '/logos/binance.png'
  },
  BYBIT: {
    description: 'Cryptocurrency derivatives exchange',
    logo: '/logos/bybit.png'
  },
  BINGX: {
    description: 'Crypto exchange with copy trading',
    logo: '/logos/bingx.png'
  },
  GATEIO: {
    description: 'Secure cryptocurrency exchange',
    logo: '/logos/gateio.png'
  },
  OKX: {
    description: 'Leading crypto trading platform',
    logo: '/logos/okx.png'
  },
  BITGET: {
    description: 'Crypto exchange and copy trading',
    logo: '/logos/bitget.png'
  },
  MEXC: {
    description: 'Leading digital asset exchange',
    logo: '/logos/mexc.png'
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's exchange credentials from database
    const credentials = await prisma.exchangeCredentials.findMany({
      where: {
        userId: authResult.user.userId
      },
      orderBy: {
        exchange: 'asc'
      }
    });

    // Transform to frontend format
    const response = credentials.map(cred => {
      const info = exchangeInfo[cred.exchange] || {
        description: `${cred.exchange} trading platform`,
        logo: '/logos/default.png'
      };

      return {
        id: cred.id,
        name: cred.label || cred.exchange,
        description: info.description,
        logo: info.logo,
        exchange: cred.exchange,
        connected: cred.isActive,
        apiKeyLast4: cred.apiKey ? '****' : undefined,
        connectedAt: cred.createdAt,
        lastSync: cred.updatedAt
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching trading platforms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}