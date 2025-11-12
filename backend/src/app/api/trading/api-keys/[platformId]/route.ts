import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

// Mock data store
const mockUserTradingPlatforms = new Map<string, {
  id: string;
  userId: string;
  platformId: string;
  apiKey?: string;
  secretKey?: string;
  passphrase?: string;
  isConnected: boolean;
  connectedAt?: Date;
  lastSync?: Date;
  platform: {
    id: string;
    name: string;
    description: string;
    logo: string;
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
      connectedAt: new Date(),
      lastSync: new Date(),
      platform: {
        id: 'binance',
        name: 'Binance',
        description: 'Global cryptocurrency exchange',
        logo: '/logos/binance.png'
      }
    });
  }

  if (!mockUserTradingPlatforms.has(key2)) {
    mockUserTradingPlatforms.set(key2, {
      id: key2,
      userId: userId,
      platformId: 'coinbase',
      isConnected: true,
      connectedAt: new Date(),
      lastSync: new Date(),
      platform: {
        id: 'coinbase',
        name: 'Coinbase',
        description: 'Cryptocurrency exchange platform',
        logo: '/logos/coinbase.png'
      }
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ platformId: string }> }
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

    const { platformId } = await params;

    initMockPlatforms(authResult.user.userId);

    // Find and delete the user platform connection
    const userPlatformKey = authResult.user.userId + '_' + platformId;
    const userPlatform = mockUserTradingPlatforms.get(userPlatformKey);

    if (!userPlatform) {
      return NextResponse.json(
        { error: 'Platform connection not found' },
        { status: 404 }
      );
    }

    // Delete the connection
    mockUserTradingPlatforms.delete(userPlatformKey);

    return NextResponse.json({ message: 'Platform disconnected successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error disconnecting platform:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ platformId: string }> }
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

    const { platformId } = await params;
    const { apiKey, secretKey, passphrase } = await request.json();

    initMockPlatforms(authResult.user.userId);

    // Find the user platform connection
    const userPlatformKey = authResult.user.userId + '_' + platformId;
    const userPlatform = mockUserTradingPlatforms.get(userPlatformKey);

    if (!userPlatform) {
      return NextResponse.json(
        { error: 'Platform connection not found' },
        { status: 404 }
      );
    }

    // Update the API credentials (in real implementation, these should be encrypted)
    if (apiKey) userPlatform.apiKey = apiKey;
    if (secretKey) userPlatform.secretKey = secretKey;
    if (passphrase !== undefined) userPlatform.passphrase = passphrase || undefined;

    mockUserTradingPlatforms.set(userPlatformKey, userPlatform);
    const updatedUserPlatform = userPlatform;

    // Return response matching frontend interface
    const response = {
      id: updatedUserPlatform.platform.id,
      name: updatedUserPlatform.platform.name,
      description: updatedUserPlatform.platform.description,
      logo: updatedUserPlatform.platform.logo,
      connected: updatedUserPlatform.isConnected,
      apiKeyLast4: apiKey ? apiKey.slice(-4) : updatedUserPlatform.apiKey?.slice(-4),
      connectedAt: updatedUserPlatform.connectedAt,
      lastSync: updatedUserPlatform.lastSync
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error updating platform credentials:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}