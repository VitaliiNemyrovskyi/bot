import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  password?: string;
  role: string;
  avatar?: string;
  subscriptionActive: boolean;
  subscriptionExpiry?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  static async createUser(userData: {
    email: string;
    password?: string;
    name?: string;
    role?: string;
  }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role || 'BASIC',
        subscriptionActive: userData.role === 'ADMIN' ? true : false,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      password: user.password || undefined,
      role: user.role,
      avatar: user.avatar || undefined,
      subscriptionActive: user.subscriptionActive,
      subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined,
    };
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      password: user.password || undefined,
      role: user.role,
      avatar: user.avatar || undefined,
      subscriptionActive: user.subscriptionActive,
      subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined,
    };
  }

  static async findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      password: user.password || undefined,
      role: user.role,
      avatar: user.avatar || undefined,
      subscriptionActive: user.subscriptionActive,
      subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined,
    };
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(updates.email && { email: updates.email }),
        ...(updates.name && { name: updates.name }),
        ...(updates.password && { password: updates.password }),
        ...(updates.role && { role: updates.role }),
        ...(updates.avatar !== undefined && { avatar: updates.avatar }),
        ...(updates.subscriptionActive !== undefined && { subscriptionActive: updates.subscriptionActive }),
        ...(updates.subscriptionExpiry && { subscriptionExpiry: new Date(updates.subscriptionExpiry) }),
        ...(updates.lastLoginAt && { lastLoginAt: updates.lastLoginAt }),
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      password: user.password || undefined,
      role: user.role,
      avatar: user.avatar || undefined,
      subscriptionActive: user.subscriptionActive,
      subscriptionExpiry: user.subscriptionExpiry?.toISOString(),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined,
    };
  }

  static async createSession(userId: string, token: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  static async invalidateSession(token: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  static async isSessionValid(token: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (!session) return false;

    if (session.expiresAt < new Date()) {
      await this.invalidateSession(token);
      return false;
    }

    return true;
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const payload = this.verifyToken(token);
    if (!payload) {
      return null;
    }

    // Verify user exists in database
    const user = await this.findUserById(payload.userId);
    return user;
  }

  static async authenticateRequest(request: any): Promise<{ success: boolean; user: JWTPayload | null; error?: string }> {
    try {
      const authHeader = request.headers.get('authorization');

      if (!authHeader) {
        return { success: false, user: null, error: 'No authorization header' };
      }

      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        return { success: false, user: null, error: 'No token provided' };
      }

      const payload = this.verifyToken(token);
      if (!payload) {
        return { success: false, user: null, error: 'Invalid token' };
      }

      // Verify user still exists in database and get fresh role
      const user = await this.findUserById(payload.userId);
      if (!user) {
        return { success: false, user: null, error: 'User not found' };
      }

      // Return payload with fresh role from database
      return {
        success: true,
        user: {
          ...payload,
          role: user.role // Always use fresh role from database
        }
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, user: null, error: 'Authentication failed' };
    }
  }
}
