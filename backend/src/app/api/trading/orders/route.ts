import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from '@/middleware/auth';

// Mock data stores
const mockOrders = new Map<string, {
  id: string;
  userTradingPlatformId: string;
  symbol: string;
  side: string;
  type: string;
  amount: number;
  price: number;
  status: string;
  createdAt: Date;
  filledAt?: Date;
}>;

const mockUserTradingPlatforms = new Map<string, {
  id: string;
  userId: string;
  platformId: string;
  platform: {
    id: string;
    name: string;
  };
}>();

// Generate some mock data
function initMockData() {
  if (mockUserTradingPlatforms.size === 0) {
    const platformId1 = 'platform1';
    const platformId2 = 'platform2';

    mockUserTradingPlatforms.set('userplatform1', {
      id: 'userplatform1',
      userId: 'user1',
      platformId: platformId1,
      platform: { id: platformId1, name: 'Binance' }
    });

    mockUserTradingPlatforms.set('userplatform2', {
      id: 'userplatform2',
      userId: 'user1',
      platformId: platformId2,
      platform: { id: platformId2, name: 'Coinbase' }
    });
  }
}

// function generateMockId(): string {
//   return Math.random().toString(36).substr(2, 9);
// }

export async function GET(request: NextRequest) {
  try {
    // Get user from authentication
    const user = await validateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get('platformId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const whereClause: any = {
      userTradingPlatform: {
        userId: user.id
      }
    };

    if (platformId) {
      whereClause.userTradingPlatform.platformId = platformId;
    }

    initMockData();

    // Get user trading platforms for this user
    const userPlatforms = Array.from(mockUserTradingPlatforms.values())
      .filter(up => up.userId === user.id);

    if (userPlatforms.length === 0) {
      return NextResponse.json([]);
    }

    // Filter orders by user's platforms
    let filteredOrders = Array.from(mockOrders.values())
      .filter(order => userPlatforms.some(up => up.id === order.userTradingPlatformId));

    if (platformId) {
      const targetPlatform = userPlatforms.find(up => up.platformId === platformId);
      if (targetPlatform) {
        filteredOrders = filteredOrders.filter(order => order.userTradingPlatformId === targetPlatform.id);
      } else {
        filteredOrders = [];
      }
    }

    // Sort by createdAt desc and apply pagination
    const orders = filteredOrders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit)
      .map(order => {
        const userPlatform = userPlatforms.find(up => up.id === order.userTradingPlatformId)!;
        return {
          ...order,
          userTradingPlatform: userPlatform
        };
      });

    // Transform response to match frontend interface
    const response = orders.map(order => ({
      id: order.id,
      platformId: order.userTradingPlatform.platform.id,
      symbol: order.symbol,
      side: order.side.toLowerCase(),
      type: order.type.toLowerCase(),
      amount: order.amount,
      price: order.price,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt,
      filledAt: order.filledAt
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}