import prisma from './prisma';
import { EncryptionService } from './encryption';
import { BybitService } from './bybit';

/**
 * Service for managing Bybit API keys in the database
 *
 * Features:
 * - Automatic encryption/decryption of API keys
 * - In-memory caching with TTL for performance
 * - One-to-one relationship: one user can have one set of Bybit API keys
 * - Validation of API keys by making test call to Bybit
 */

export interface BybitApiKeyData {
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
}

export interface BybitApiKeyInfo {
  hasKeys: boolean;
  testnet?: boolean;
  apiKeyPreview?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CachedKeys {
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  timestamp: number;
}

export class BybitKeysService {
  // In-memory cache with TTL (5 minutes)
  private static cache = new Map<string, CachedKeys>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Validates Bybit API keys by making a test call to Bybit API
   *
   * @param apiKey - Bybit API key
   * @param apiSecret - Bybit API secret
   * @param testnet - Whether to use testnet
   * @returns true if keys are valid, false otherwise
   */
  static async validateApiKeys(
    apiKey: string,
    apiSecret: string,
    testnet: boolean
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const bybitService = new BybitService({
        apiKey,
        apiSecret,
        testnet,
        enableRateLimit: true,
      });

      // Try to fetch API key info to validate credentials
      await bybitService.getApiKeyInfo();

      return { valid: true };
    } catch (error: any) {
      console.error('API key validation failed:', error.message);
      return {
        valid: false,
        error: error.message || 'Failed to validate API keys',
      };
    }
  }

  /**
   * Saves or updates Bybit API keys for a user
   *
   * @param userId - User ID
   * @param data - API key data (unencrypted)
   * @returns Created/updated API key record (without secrets)
   */
  static async saveApiKeys(userId: string, data: BybitApiKeyData) {
    try {
      // Validate API keys first
      const validation = await this.validateApiKeys(
        data.apiKey,
        data.apiSecret,
        data.testnet
      );

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid API keys');
      }

      // Encrypt the API keys
      const encryptedApiKey = EncryptionService.encrypt(data.apiKey);
      const encryptedApiSecret = EncryptionService.encrypt(data.apiSecret);

      // Upsert (update if exists, create if doesn't)
      const apiKeyRecord = await prisma.bybitApiKey.upsert({
        where: { userId },
        update: {
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
          updatedAt: new Date(),
        },
        create: {
          userId,
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
        },
      });

      // Invalidate cache for this user
      this.cache.delete(userId);

      // Return without sensitive data
      return {
        id: apiKeyRecord.id,
        userId: apiKeyRecord.userId,
        createdAt: apiKeyRecord.createdAt,
        updatedAt: apiKeyRecord.updatedAt,
      };
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      throw error;
    }
  }

  /**
   * Gets API key info for a user (without exposing the secret)
   *
   * @param userId - User ID
   * @returns API key info or null if not found
   */
  static async getApiKeyInfo(userId: string): Promise<BybitApiKeyInfo> {
    try {
      const apiKeyRecord = await prisma.bybitApiKey.findUnique({
        where: { userId },
      });

      if (!apiKeyRecord) {
        return { hasKeys: false };
      }

      // Decrypt API key to show preview
      const decryptedApiKey = EncryptionService.decrypt(apiKeyRecord.apiKey);

      // Show only last 4 characters for security
      const apiKeyPreview = '...' + decryptedApiKey.slice(-4);

      return {
        hasKeys: true,
        apiKeyPreview,
        createdAt: apiKeyRecord.createdAt,
        updatedAt: apiKeyRecord.updatedAt,
      };
    } catch (error) {
      console.error('Error getting API key info:', error);
      throw new Error('Failed to retrieve API key information');
    }
  }

  /**
   * Gets decrypted API keys for a user (for internal use only)
   * Uses caching to improve performance
   *
   * @param userId - User ID
   * @returns Decrypted API key data or null if not found
   */
  static async getApiKeys(userId: string): Promise<BybitApiKeyData | null> {
    try {
      // Check cache first
      const cached = this.cache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          apiKey: cached.apiKey,
          apiSecret: cached.apiSecret,
        };
      }

      // Fetch from database
      const apiKeyRecord = await prisma.bybitApiKey.findUnique({
        where: { userId },
      });

      if (!apiKeyRecord) {
        return null;
      }

      // Decrypt API keys
      const apiKey = EncryptionService.decrypt(apiKeyRecord.apiKey);
      const apiSecret = EncryptionService.decrypt(apiKeyRecord.apiSecret);

      // Cache the decrypted keys
      this.cache.set(userId, {
        apiKey,
        apiSecret,
        timestamp: Date.now(),
      });

      return {
        apiKey,
        apiSecret,
      };
    } catch (error) {
      console.error('Error getting API keys:', error);
      throw new Error('Failed to retrieve API keys');
    }
  }

  /**
   * Deletes API keys for a user
   *
   * @param userId - User ID
   * @returns true if deleted, false if not found
   */
  static async deleteApiKeys(userId: string): Promise<boolean> {
    try {
      const result = await prisma.bybitApiKey.delete({
        where: { userId },
      });

      // Invalidate cache
      this.cache.delete(userId);

      return !!result;
    } catch (error: any) {
      // Prisma throws P2025 if record not found
      if (error.code === 'P2025') {
        return false;
      }
      console.error('Error deleting API keys:', error);
      throw new Error('Failed to delete API keys');
    }
  }

  /**
   * Checks if a user has API keys configured
   *
   * @param userId - User ID
   * @returns true if user has API keys, false otherwise
   */
  static async hasApiKeys(userId: string): Promise<boolean> {
    try {
      const count = await prisma.bybitApiKey.count({
        where: { userId },
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking API keys:', error);
      return false;
    }
  }

  /**
   * Clears the cache for a specific user or all users
   *
   * @param userId - Optional user ID. If not provided, clears entire cache
   */
  static clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Gets cache statistics (for monitoring/debugging)
   *
   * @returns Cache size and entries
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}
