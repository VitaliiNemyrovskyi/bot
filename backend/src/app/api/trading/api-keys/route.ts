import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import crypto from 'crypto';

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
  }
}

// // function generateMockId(): string {
//   return Math.random().toString(36).substr(2, 9);
// }

// Encryption key for API keys (in production, use proper key management)
const ENCRYPTION_KEY = process.env['API_KEY_ENCRYPTION_KEY'] || 'default-key-change-in-production';

function encryptApiKey(text: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// // function decryptApiKey(text: string): string {
//   const algorithm = 'aes-256-cbc';
//   const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
//   const textParts = text.split(':');
//   const iv = Buffer.from(textParts.shift()!, 'hex');
//   const encryptedText = textParts.join(':');
//   const decipher = crypto.createDecipher(algorithm, key);
//   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }

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

    const { platformId, apiKey, secretKey, passphrase } = await request.json();

    if (!platformId || !apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'Platform ID, API key, and secret key are required' },
        { status: 400 }
      );
    }

    initMockData();

    // Check if platform exists
    const platform = mockTradingPlatforms.get(platformId);

    if (!platform) {
      return NextResponse.json(
        { error: 'Trading platform not found' },
        { status: 404 }
      );
    }

    // Check if user already has this platform connected
    const userPlatformKey = authResult.user.userId + '_' + platformId;
    const existingConnection = mockUserTradingPlatforms.get(userPlatformKey);

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Platform already connected' },
        { status: 400 }
      );
    }

    // Encrypt the API credentials
    const encryptedApiKey = encryptApiKey(apiKey);
    const encryptedSecretKey = encryptApiKey(secretKey);
    const encryptedPassphrase = passphrase ? encryptApiKey(passphrase) : null;

    // Create user trading platform connection
    const userPlatform = {
      id: userPlatformKey,
      userId: authResult.user.userId,
      platformId: platformId,
      apiKey: encryptedApiKey,
      secretKey: encryptedSecretKey,
      passphrase: encryptedPassphrase ?? undefined,
      isConnected: true,
      connectedAt: new Date(),
      lastSync: new Date(),
      platform: platform
    };
    mockUserTradingPlatforms.set(userPlatformKey, userPlatform as any);

    // Return response matching frontend interface
    const response = {
      id: platform.id,
      name: platform.name,
      description: platform.description,
      logo: platform.logo,
      connected: true,
      apiKeyLast4: apiKey.slice(-4),
      connectedAt: userPlatform.connectedAt,
      lastSync: userPlatform.lastSync
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error connecting trading platform:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    // Get all user's connected platforms
    const userPlatforms = Array.from(mockUserTradingPlatforms.values())
      .filter(up => up.userId === authResult.user!.userId && up.isConnected)
      .sort((a, b) => (b.connectedAt?.getTime() || 0) - (a.connectedAt?.getTime() || 0));

    const response = userPlatforms.map(up => ({
      id: up.platform.id,
      name: up.platform.name,
      description: up.platform.description,
      logo: up.platform.logo,
      connected: up.isConnected,
      apiKeyLast4: up.apiKey ? up.apiKey.slice(-4) : undefined,
      connectedAt: up.connectedAt,
      lastSync: up.lastSync
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching connected platforms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}