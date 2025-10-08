import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory storage
const users = new Map<string, User>();
const sessions = new Map<string, Session>();
const usersByEmail = new Map<string, User>();

// Helper function to generate IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Track if users have been initialized
let usersInitialized = false;

// Initialize default users
async function initializeDefaultUsers() {
  if (!usersInitialized) {
    const adminUser: User = {
      id: 'admin_1',
      email: 'admin@test.com',
      name: 'Admin User',
      password: await bcrypt.hash('password123', 12),
      role: 'ADMIN',
      subscriptionActive: true,
      createdAt: new Date(),
    };

    const basicUser: User = {
      id: 'user_1',
      email: 'user@test.com',
      name: 'Test User',
      password: await bcrypt.hash('password123', 12),
      role: 'BASIC',
      subscriptionActive: false,
      createdAt: new Date(),
    };

    users.set(adminUser.id, adminUser);
    users.set(basicUser.id, basicUser);
    usersByEmail.set(adminUser.email, adminUser);
    usersByEmail.set(basicUser.email, basicUser);

    usersInitialized = true;
  }
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
    const id = generateId();
    const user: User = {
      id,
      email: userData.email,
      name: userData.name,
      password: userData.password,
      role: userData.role || 'BASIC',
      subscriptionActive: userData.role === 'ADMIN' ? true : false,
      createdAt: new Date(),
    };

    users.set(id, user);
    usersByEmail.set(userData.email, user);
    return user;
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    await initializeDefaultUsers();
    return usersByEmail.get(email) || null;
  }

  static async findUserById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    users.set(id, updatedUser);

    // Update email index if email changed
    if (updates.email && updates.email !== user.email) {
      usersByEmail.delete(user.email);
      usersByEmail.set(updates.email, updatedUser);
    }

    return updatedUser;
  }

  static async createSession(userId: string, token: string): Promise<void> {
    const id = generateId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: Session = {
      id,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
    };

    sessions.set(token, session);
  }

  static async invalidateSession(token: string): Promise<void> {
    sessions.delete(token);
  }

  static async isSessionValid(token: string): Promise<boolean> {
    const session = sessions.get(token);
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

    // For development, skip session validation and rely on JWT expiry
    // This handles the case where sessions are lost due to server restarts
    await initializeDefaultUsers(); // Ensure users are initialized
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

      // Verify user still exists
      await initializeDefaultUsers();
      const user = await this.findUserById(payload.userId);
      if (!user) {
        return { success: false, user: null, error: 'User not found' };
      }

      return { success: true, user: payload };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, user: null, error: 'Authentication failed' };
    }
  }
}
