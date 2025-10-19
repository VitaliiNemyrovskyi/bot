import prisma from './prisma';
import { EncryptionService } from './encryption';
import { ExchangeValidators } from './exchange-validators';
import { Exchange } from '@prisma/client';
import {
  ExchangeCredentialData,
  CredentialInfo,
  ActiveCredential,
  GroupedCredentials,
  ValidationResult,
} from '../types/exchange-credentials';

/**
 * Service for managing Exchange Credentials
 *
 * Features:
 * - Multi-exchange support (Bybit, Binance, OKX, etc.)
 * - Mainnet only (testnet support removed)
 * - Automatic encryption/decryption of API keys
 * - In-memory caching with TTL for performance
 * - Credential validation before saving
 * - Active credential management (one active per exchange)
 */

interface CachedCredential {
  apiKey: string;
  apiSecret: string;
  authToken?: string;
  timestamp: number;
}

export class ExchangeCredentialsService {
  // In-memory cache with TTL (5 minutes)
  private static cache = new Map<string, CachedCredential>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Validates exchange API credentials by making a test API call
   */
  static async validateCredentials(
    exchange: Exchange,
    apiKey: string,
    apiSecret: string
  ): Promise<ValidationResult> {
    return ExchangeValidators.validateCredentials(
      exchange,
      apiKey,
      apiSecret
    );
  }

  /**
   * Saves new exchange credentials for a user
   * Creates a new credential entry - allows multiple credentials per exchange/environment
   *
   * @param userId - The user ID
   * @param data - Credential data including optional isActive flag
   * @returns CredentialInfo with masked API key
   *
   * If isActive is explicitly set to true, the credential will be marked as active.
   * If isActive is not provided, the credential will be active only if it's the first for that exchange.
   */
  static async saveCredentials(
    userId: string,
    data: ExchangeCredentialData
  ): Promise<CredentialInfo> {
    try {
      // Validate API credentials first
      const validation = await this.validateCredentials(
        data.exchange,
        data.apiKey,
        data.apiSecret
      );

      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid API credentials');
      }

      // Encrypt the API keys
      const encryptedApiKey = EncryptionService.encrypt(data.apiKey);
      const encryptedApiSecret = EncryptionService.encrypt(data.apiSecret);
      const encryptedAuthToken = data.authToken ? EncryptionService.encrypt(data.authToken) : undefined;

      // Determine if credential should be active
      // 1. If explicitly provided in data, use that value
      // 2. Otherwise, set as active if it's the first credential for this exchange
      let isActive = data.isActive ?? false;

      if (data.isActive === undefined) {
        const existingCredentials = await prisma.exchangeCredentials.findMany({
          where: {
            userId,
            exchange: data.exchange,
          },
        });
        isActive = existingCredentials.length === 0;
      }

      // Create new credential (allows multiple credentials per exchange)
      const credential = await prisma.exchangeCredentials.create({
        data: {
          userId,
          exchange: data.exchange,
          apiKey: encryptedApiKey,
          apiSecret: encryptedApiSecret,
          authToken: encryptedAuthToken,
          label: data.label,
          isActive,
        },
      });

      // Invalidate cache for this credential
      this.invalidateCache(credential.id);

      // Return credential info with masked API key
      return this.toCredentialInfo(credential);
    } catch (error: any) {
      console.error('Error saving exchange credentials:', error);
      throw error;
    }
  }

  /**
   * Gets all credentials for a user, optionally filtered by exchange
   */
  static async getCredentials(
    userId: string,
    exchange?: Exchange
  ): Promise<CredentialInfo[]> {
    try {
      const where: any = { userId };
      if (exchange) where.exchange = exchange;

      const credentials = await prisma.exchangeCredentials.findMany({
        where,
        orderBy: [
          { exchange: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return credentials.map((cred) => this.toCredentialInfo(cred));
    } catch (error: any) {
      console.error('Error getting credentials:', error);
      throw new Error('Failed to retrieve credentials');
    }
  }

  /**
   * Gets a single credential by ID with decrypted API keys
   * Used for displaying/editing credentials (requires userId for authorization)
   */
  static async getCredentialById(
    userId: string,
    credentialId: string
  ): Promise<ActiveCredential | null> {
    try {
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        return null;
      }

      if (credential.userId !== userId) {
        throw new Error('Unauthorized: Credential does not belong to user');
      }

      // Check cache first
      const cacheKey = credential.id;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          id: credential.id,
          exchange: credential.exchange,
          apiKey: cached.apiKey,
          apiSecret: cached.apiSecret,
          authToken: cached.authToken,
          label: credential.label || undefined,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        };
      }

      // Decrypt credentials
      const apiKey = EncryptionService.decrypt(credential.apiKey);
      const apiSecret = EncryptionService.decrypt(credential.apiSecret);
      const authToken = credential.authToken ? EncryptionService.decrypt(credential.authToken) : undefined;

      // Cache the decrypted credentials
      this.cache.set(cacheKey, {
        apiKey,
        apiSecret,
        authToken,
        timestamp: Date.now(),
      });

      return {
        id: credential.id,
        exchange: credential.exchange,
        apiKey,
        apiSecret,
        authToken,
        label: credential.label || undefined,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
    } catch (error: any) {
      console.error('Error getting credential by ID:', error);
      throw error;
    }
  }

  /**
   * Gets a single credential by ID with decrypted API keys (internal use only)
   * Used by internal services like funding tracker - no userId check
   */
  static async getCredentialsById(
    credentialId: string
  ): Promise<ActiveCredential | null> {
    try {
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        return null;
      }

      // Check cache first
      const cacheKey = credential.id;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          id: credential.id,
          exchange: credential.exchange,
          apiKey: cached.apiKey,
          apiSecret: cached.apiSecret,
          authToken: cached.authToken,
          label: credential.label || undefined,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        };
      }

      // Decrypt credentials
      const apiKey = EncryptionService.decrypt(credential.apiKey);
      const apiSecret = EncryptionService.decrypt(credential.apiSecret);
      const authToken = credential.authToken ? EncryptionService.decrypt(credential.authToken) : undefined;

      // Cache the decrypted credentials
      this.cache.set(cacheKey, {
        apiKey,
        apiSecret,
        authToken,
        timestamp: Date.now(),
      });

      return {
        id: credential.id,
        exchange: credential.exchange,
        apiKey,
        apiSecret,
        authToken,
        label: credential.label || undefined,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
    } catch (error: any) {
      console.error('Error getting credentials by ID:', error);
      throw error;
    }
  }

  /**
   * Gets all credentials grouped by exchange
   */
  static async getCredentialsGrouped(
    userId: string
  ): Promise<GroupedCredentials[]> {
    try {
      const credentials = await this.getCredentials(userId);

      // Group by exchange
      const grouped = credentials.reduce((acc, cred) => {
        const existing = acc.find((g) => g.exchange === cred.exchange);
        if (existing) {
          existing.credentials.push(cred);
        } else {
          acc.push({
            exchange: cred.exchange,
            credentials: [cred],
          });
        }
        return acc;
      }, [] as GroupedCredentials[]);

      return grouped;
    } catch (error: any) {
      console.error('Error getting grouped credentials:', error);
      throw new Error('Failed to retrieve grouped credentials');
    }
  }

  /**
   * Gets the currently active credentials for a specific exchange
   * Returns decrypted credentials for internal use
   */
  static async getActiveCredentials(
    userId: string,
    exchange: Exchange
  ): Promise<ActiveCredential | null> {
    try {
      const credential = await prisma.exchangeCredentials.findFirst({
        where: {
          userId,
          exchange,
          isActive: true,
        },
      });

      if (!credential) {
        return null;
      }

      // Check cache first
      const cacheKey = credential.id;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return {
          id: credential.id,
          exchange: credential.exchange,
          apiKey: cached.apiKey,
          apiSecret: cached.apiSecret,
          authToken: cached.authToken,
          label: credential.label || undefined,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        };
      }

      // Decrypt credentials
      const apiKey = EncryptionService.decrypt(credential.apiKey);
      const apiSecret = EncryptionService.decrypt(credential.apiSecret);
      const authToken = credential.authToken ? EncryptionService.decrypt(credential.authToken) : undefined;

      // Cache the decrypted credentials
      this.cache.set(cacheKey, {
        apiKey,
        apiSecret,
        authToken,
        timestamp: Date.now(),
      });

      return {
        id: credential.id,
        exchange: credential.exchange,
        apiKey,
        apiSecret,
        authToken,
        label: credential.label || undefined,
        createdAt: credential.createdAt,
        updatedAt: credential.updatedAt,
      };
    } catch (error: any) {
      console.error('Error getting active credentials:', error);
      throw new Error('Failed to retrieve active credentials');
    }
  }


  /**
   * Updates credential information (label, apiKey, apiSecret, isActive)
   * Note: isActive is a simple boolean flag - no automatic deactivation of other credentials
   */
  static async updateCredential(
    userId: string,
    credentialId: string,
    data: {
      label?: string;
      apiKey?: string;
      apiSecret?: string;
      authToken?: string;
      isActive?: boolean;
    }
  ): Promise<CredentialInfo> {
    try {
      // Get the credential to update
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        throw new Error('Credential not found');
      }

      if (credential.userId !== userId) {
        throw new Error('Unauthorized: Credential does not belong to user');
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Update label if provided
      if (data.label !== undefined) {
        updateData.label = data.label;
      }

      // If API keys are being updated, validate and encrypt them
      if (data.apiKey || data.apiSecret) {
        // If only one is provided, get the other from existing credential
        const apiKey = data.apiKey || EncryptionService.decrypt(credential.apiKey);
        const apiSecret = data.apiSecret || EncryptionService.decrypt(credential.apiSecret);

        // Validate the credentials
        const validation = await this.validateCredentials(
          credential.exchange,
          apiKey,
          apiSecret
        );

        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid API credentials');
        }

        // Encrypt and set
        if (data.apiKey) {
          updateData.apiKey = EncryptionService.encrypt(data.apiKey);
        }
        if (data.apiSecret) {
          updateData.apiSecret = EncryptionService.encrypt(data.apiSecret);
        }
      }

      // Handle authToken update (for MEXC browser sessions)
      if (data.authToken !== undefined) {
        // Empty string means clear the token
        if (data.authToken === '') {
          updateData.authToken = null;
        } else {
          updateData.authToken = EncryptionService.encrypt(data.authToken);
        }
      }

      // Handle isActive update
      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      // Update the credential
      const updated = await prisma.exchangeCredentials.update({
        where: { id: credentialId },
        data: updateData,
      });

      // Invalidate cache
      this.invalidateCache(credentialId);

      return this.toCredentialInfo(updated);
    } catch (error: any) {
      console.error('Error updating credential:', error);
      throw error;
    }
  }

  /**
   * Sets a specific credential as active for its exchange
   * Deactivates all other credentials for the same exchange
   */
  static async setActiveCredentials(
    userId: string,
    credentialId: string
  ): Promise<CredentialInfo> {
    try {
      // Get the credential to activate
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        throw new Error('Credential not found');
      }

      if (credential.userId !== userId) {
        throw new Error('Unauthorized: Credential does not belong to user');
      }

      // Use a transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Deactivate all other credentials for this exchange
        await tx.exchangeCredentials.updateMany({
          where: {
            userId,
            exchange: credential.exchange,
            id: { not: credentialId },
          },
          data: {
            isActive: false,
          },
        });

        // Activate the specified credential
        await tx.exchangeCredentials.update({
          where: { id: credentialId },
          data: {
            isActive: true,
          },
        });
      });

      // Fetch the updated credential
      const updated = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      // Invalidate cache for all credentials of this exchange
      const allCredentials = await prisma.exchangeCredentials.findMany({
        where: { userId, exchange: credential.exchange },
      });
      allCredentials.forEach((cred) => this.invalidateCache(cred.id));

      return this.toCredentialInfo(updated!);
    } catch (error: any) {
      console.error('Error setting active credentials:', error);
      throw error;
    }
  }

  /**
   * Deletes a specific credential
   * If deleting the active credential, optionally activates another one
   */
  static async deleteCredentials(
    userId: string,
    credentialId: string
  ): Promise<boolean> {
    try {
      // Get the credential to delete
      const credential = await prisma.exchangeCredentials.findUnique({
        where: { id: credentialId },
      });

      if (!credential) {
        return false;
      }

      if (credential.userId !== userId) {
        throw new Error('Unauthorized: Credential does not belong to user');
      }

      const wasActive = credential.isActive;
      const exchange = credential.exchange;

      // Delete the credential
      await prisma.exchangeCredentials.delete({
        where: { id: credentialId },
      });

      // If the deleted credential was active, activate another one if available
      if (wasActive) {
        const remainingCredentials = await prisma.exchangeCredentials.findMany({
          where: { userId, exchange },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });

        if (remainingCredentials.length > 0) {
          await prisma.exchangeCredentials.update({
            where: { id: remainingCredentials[0].id },
            data: { isActive: true },
          });
        }
      }

      // Invalidate cache
      this.invalidateCache(credentialId);

      return true;
    } catch (error: any) {
      console.error('Error deleting credentials:', error);
      throw error;
    }
  }

  /**
   * Checks if a user has any credentials for a specific exchange
   */
  static async hasCredentials(
    userId: string,
    exchange?: Exchange
  ): Promise<boolean> {
    try {
      const where: any = { userId };
      if (exchange) where.exchange = exchange;

      const count = await prisma.exchangeCredentials.count({ where });
      return count > 0;
    } catch (error: any) {
      console.error('Error checking credentials:', error);
      return false;
    }
  }

  /**
   * Converts a database credential to CredentialInfo (with masked API key)
   */
  private static toCredentialInfo(credential: any): CredentialInfo {
    const decryptedApiKey = EncryptionService.decrypt(credential.apiKey);
    const apiKeyPreview = '...' + decryptedApiKey.slice(-4);

    return {
      id: credential.id,
      userId: credential.userId,
      exchange: credential.exchange,
      apiKeyPreview,
      label: credential.label || undefined,
      isActive: credential.isActive,
      createdAt: credential.createdAt.toISOString(),
      updatedAt: credential.updatedAt.toISOString(),
    };
  }

  /**
   * Invalidates cache for a specific credential
   */
  private static invalidateCache(credentialId: string): void {
    this.cache.delete(credentialId);
  }

  /**
   * Clears the entire cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics (for monitoring/debugging)
   */
  static getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}
