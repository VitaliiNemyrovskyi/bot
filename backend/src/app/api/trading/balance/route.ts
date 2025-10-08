import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data store
const mockUserTradingPlatforms = new Map<string, {
  id: string;
  userId: string;
  platformId: string;
  totalBalance: number;
  availableBalance: number;
  tradingBalance: number;
  isConnected: boolean;
  lastSync?: Date;
  platform: {
    id: string;
    name: string;
  };
}>();

// Initialize mock platforms
function initMockPlatforms(userId: string) {
  if (Array.from(mockUserTradingPlatforms.values()).filter(p => p.userId === userId).length === 0) {
    mockUserTradingPlatforms.set('platform1_' + userId, {
      id: 'platform1_' + userId,
      userId: userId,
      platformId: 'binance',
      totalBalance: 5000,
      availableBalance: 4000,
      tradingBalance: 900,
      isConnected: true,
      lastSync: new Date(),
      platform: { id: 'binance', name: 'Binance' }
    });

    mockUserTradingPlatforms.set('platform2_' + userId, {
      id: 'platform2_' + userId,
      userId: userId,
      platformId: 'coinbase',
      totalBalance: 3000,
      availableBalance: 2500,
      tradingBalance: 450,
      isConnected: true,
      lastSync: new Date(),
      platform: { id: 'coinbase', name: 'Coinbase' }
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

    initMockPlatforms(authResult.user.userId);

    // Get all user's connected platforms with balance info
    const userPlatforms = Array.from(mockUserTradingPlatforms.values())
      .filter(up => up.userId === authResult.user.userId && up.isConnected);

    // Calculate totals
    let totalBalance = 0;
    let availableBalance = 0;
    let tradingBalance = 0;
    const platforms: any[] = [];

    for (const up of userPlatforms) {
      totalBalance += up.totalBalance;
      availableBalance += up.availableBalance;
      tradingBalance += up.tradingBalance;

      platforms.push({
        platformId: up.platform.id,
        platformName: up.platform.name,
        balance: up.totalBalance,
        currency: 'USD', // In real implementation, this would be dynamic
        lastSync: up.lastSync
      });
    }

    // Calculate pending orders (mock for now)
    const pendingOrders = totalBalance * 0.02; // 2% of total balance

    // Calculate balance change (mock - in real implementation, compare with previous day)
    const balanceChange = (Math.random() - 0.5) * 10; // Random change for demo

    const response = {
      totalBalance,
      availableBalance,
      tradingBalance,
      pendingOrders,
      balanceChange,
      platforms
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}