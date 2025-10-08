import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data stores
const mockTradingPlatforms = new Map<string, {
  id: string;
  name: string;
  description: string;
  logo: string;
  isActive: boolean;
}>();

const mockUserTradingPlatforms = new Map<string, {
  id: string;
  userId: string;
  platformId: string;
  apiKey?: string;
  isConnected: boolean;
  connectedAt?: Date;
  lastSync?: Date;
}>();

// Initialize mock data
function initMockData() {
  if (mockTradingPlatforms.size === 0) {
    mockTradingPlatforms.set('binance', {
      id: 'binance',
      name: 'Binance',
      description: 'Global cryptocurrency exchange',
      logo: '/logos/binance.png',
      isActive: true
    });

    mockTradingPlatforms.set('coinbase', {
      id: 'coinbase',
      name: 'Coinbase',
      description: 'Cryptocurrency exchange platform',
      logo: '/logos/coinbase.png',
      isActive: true
    });

    mockTradingPlatforms.set('kraken', {
      id: 'kraken',
      name: 'Kraken',
      description: 'Secure cryptocurrency exchange',
      logo: '/logos/kraken.png',
      isActive: true
    });
  }
}

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

    initMockData();

    // Get all trading platforms with user connection status
    const platforms = Array.from(mockTradingPlatforms.values())
      .filter(platform => platform.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Transform response to match frontend interface
    const response = platforms.map(platform => {
      const userPlatformKey = authResult.user.userId + '_' + platform.id;
      const userPlatform = mockUserTradingPlatforms.get(userPlatformKey);
      return {
        id: platform.id,
        name: platform.name,
        description: platform.description,
        logo: platform.logo,
        connected: !!userPlatform?.isConnected,
        apiKeyLast4: userPlatform?.apiKey ? userPlatform.apiKey.slice(-4) : undefined,
        connectedAt: userPlatform?.connectedAt,
        lastSync: userPlatform?.lastSync
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