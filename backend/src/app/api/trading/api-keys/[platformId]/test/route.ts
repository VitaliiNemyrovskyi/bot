import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data store
const mockUserTradingPlatforms = new Map<string, {
  id: string;
  userId: string;
  platformId: string;
  isConnected: boolean;
  lastSync?: Date;
  platform: {
    id: string;
    name: string;
  };
}>();

// Initialize mock platforms
function initMockPlatforms(userId: string) {
  const key1 = userId + '_binance';
  const key2 = userId + '_coinbase';

  if (!mockUserTradingPlatforms.has(key1)) {
    mockUserTradingPlatforms.set(key1, {
      id: key1,
      userId: userId,
      platformId: 'binance',
      isConnected: true,
      lastSync: new Date(),
      platform: { id: 'binance', name: 'Binance' }
    });
  }

  if (!mockUserTradingPlatforms.has(key2)) {
    mockUserTradingPlatforms.set(key2, {
      id: key2,
      userId: userId,
      platformId: 'coinbase',
      isConnected: true,
      lastSync: new Date(),
      platform: { id: 'coinbase', name: 'Coinbase' }
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { platformId: string } }
) {
  try {
    // Get user from authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { platformId } = params;

    initMockPlatforms(authResult.user.userId);

    // Find the user platform connection
    const userPlatform = mockUserTradingPlatforms.get(authResult.user.userId + '_' + platformId);

    if (!userPlatform) {
      return NextResponse.json(
        { error: 'Platform connection not found' },
        { status: 404 }
      );
    }

    // Mock connection test (in real implementation, you'd test actual API connectivity)
    // This would involve making a test API call to the trading platform
    try {
      // Simulate testing the connection
      const testResult = await testPlatformConnection(userPlatform);
      
      // Update last sync time if test is successful
      if (testResult.success) {
        userPlatform.lastSync = new Date();
        userPlatform.isConnected = true;
        mockUserTradingPlatforms.set(authResult.user.userId + '_' + platformId, userPlatform);
      }

      return NextResponse.json({
        success: testResult.success,
        message: testResult.message
      });
    } catch (error) {
      // Update connection status if test fails
      if (userPlatform) {
        userPlatform.isConnected = false;
        mockUserTradingPlatforms.set(authResult.user.userId + '_' + platformId, userPlatform);
      }

      return NextResponse.json({
        success: false,
        message: 'Failed to connect to trading platform'
      });
    }
  } catch (error) {
    console.error('Error testing platform connection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock function to test platform connection
// In real implementation, this would make actual API calls to test connectivity
async function testPlatformConnection(userPlatform: any): Promise<{ success: boolean; message: string }> {
  // Mock implementation - randomly succeed or fail for demonstration
  const isSuccessful = Math.random() > 0.2; // 80% success rate
  
  if (isSuccessful) {
    return {
      success: true,
      message: `Successfully connected to ${userPlatform.platform.name}`
    };
  } else {
    return {
      success: false,
      message: `Failed to connect to ${userPlatform.platform.name}. Please check your API credentials.`
    };
  }
}