import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { GoogleAuthService } from '@/lib/google-auth';

// Mock data store for users
const mockUsers = new Map<string, {
  id: string;
  email: string;
  name: string;
  googleId?: string;
  avatar?: string;
  role: string;
  subscriptionActive: boolean;
  subscriptionExpiry?: Date;
  lastLoginAt?: Date;
}>();

function generateMockId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify Google ID token
    const googleUser = await GoogleAuthService.verifyIdToken(idToken);
    if (!googleUser) {
      return NextResponse.json(
        { error: 'Invalid Google ID token' },
        { status: 401 }
      );
    }

    if (!googleUser.email_verified) {
      return NextResponse.json(
        { error: 'Google email not verified' },
        { status: 401 }
      );
    }

    // Find or create user
    let user = Array.from(mockUsers.values()).find(u => u.email === googleUser.email);

    if (!user) {
      // Create new user
      const userId = generateMockId();
      user = {
        id: userId,
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.sub,
        avatar: googleUser.picture,
        role: 'BASIC',
        subscriptionActive: false
      };
      mockUsers.set(userId, user);
    } else if (!user.googleId) {
      // Link existing user with Google account
      user.googleId = googleUser.sub;
      user.avatar = googleUser.picture;
      user.name = user.name || googleUser.name;
      mockUsers.set(user.id, user);
    }

    // Generate JWT token
    const token = AuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create session
    await AuthService.createSession(user.id, token);

    // Update last login
    user.lastLoginAt = new Date();
    mockUsers.set(user.id, user);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        subscriptionActive: user.subscriptionActive,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}