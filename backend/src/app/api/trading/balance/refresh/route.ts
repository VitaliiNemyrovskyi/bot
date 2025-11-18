import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data stores
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

const mockBalanceHistory = new Map<string, {
  id: string;
  userTradingPlatformId: string;
  totalBalance: number;
  availableBalance: number;
  tradingBalance: number;
  balanceChange: number;
  createdAt: Date;
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

function generateMockId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function POST(request: NextRequest) {
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

    // Get all user's connected platforms
    const userPlatforms = Array.from(mockUserTradingPlatforms.values())
      .filter(up => up.userId === authResult.user!.userId && up.isConnected);

    // Simulate refreshing balance from each platform
    const updatedPlatforms = [];
    let totalBalance = 0;
    let availableBalance = 0;
    let tradingBalance = 0;

    for (const up of userPlatforms) {
      // Mock balance refresh (in real implementation, call actual trading platform APIs)
      const newTotalBalance = Math.random() * 10000 + 1000;
      const newAvailableBalance = newTotalBalance * 0.8;
      const newTradingBalance = newTotalBalance * 0.18;

      // Update platform balance in mock store
      up.totalBalance = newTotalBalance;
      up.availableBalance = newAvailableBalance;
      up.tradingBalance = newTradingBalance;
      up.lastSync = new Date();
      mockUserTradingPlatforms.set(up.id, up);
      const updatedPlatform = up;

      // Store balance history in mock store
      const historyId = generateMockId();
      mockBalanceHistory.set(historyId, {
        id: historyId,
        userTradingPlatformId: up.id,
        totalBalance: newTotalBalance,
        availableBalance: newAvailableBalance,
        tradingBalance: newTradingBalance,
        balanceChange: newTotalBalance - (up.totalBalance || 0),
        createdAt: new Date()
      });

      totalBalance += newTotalBalance;
      availableBalance += newAvailableBalance;
      tradingBalance += newTradingBalance;

      updatedPlatforms.push({
        platformId: updatedPlatform.platform.id,
        platformName: updatedPlatform.platform.name,
        balance: newTotalBalance,
        currency: 'USD',
        lastSync: updatedPlatform.lastSync
      });
    }

    // Calculate pending orders and balance change
    const pendingOrders = totalBalance * 0.02;
    const balanceChange = (Math.random() - 0.5) * 10;

    const response = {
      totalBalance,
      availableBalance,
      tradingBalance,
      pendingOrders,
      balanceChange,
      platforms: updatedPlatforms
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error refreshing balance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}