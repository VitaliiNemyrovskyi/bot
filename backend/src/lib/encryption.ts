import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Encryption Service for API Keys
 *
 * Uses AES-256-GCM encryption to securely store API keys and secrets.
 * The encryption key is derived from the ENCRYPTION_KEY environment variable.
 *
 * Security Features:
 * - AES-256-GCM authenticated encryption
 * - Random IV (Initialization Vector) for each encryption
 * - Authentication tag to verify data integrity
 * - Key derivation using scrypt
 */

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly SALT_LENGTH = 32;
  private static readonly TAG_LENGTH = 16;
  private static readonly KEY_LENGTH = 32; // 256 bits

  /**
   * Derives encryption key from environment variable
   * Uses scrypt key derivation function for enhanced security
   */
  private static getEncryptionKey(): Buffer {
    const secret = process.env.ENCRYPTION_KEY;

    if (!secret) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    if (secret.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }

    // Use a fixed salt for key derivation (in production, consider using a per-installation salt)
    const salt = 'bybit-api-key-encryption-salt';

    // Derive a 256-bit key using scrypt
    return scryptSync(secret, salt, this.KEY_LENGTH);
  }

  /**
   * Encrypts a string using AES-256-GCM
   *
   * @param plaintext - The string to encrypt
   * @returns Encrypted string in format: iv:encrypted:authTag (all hex encoded)
   */
  static encrypt(plaintext: string): string {
    try {
      if (!plaintext) {
        throw new Error('Cannot encrypt empty string');
      }

      const key = this.getEncryptionKey();
      const iv = randomBytes(this.IV_LENGTH);

      const cipher = createCipheriv(this.ALGORITHM, key, iv);

      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Return format: iv:encrypted:authTag
      return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypts a string encrypted with encrypt()
   *
   * @param encryptedData - Encrypted string in format: iv:encrypted:authTag
   * @returns Decrypted plaintext string
   */
  static decrypt(encryptedData: string): string {
    try {
      if (!encryptedData) {
        throw new Error('Cannot decrypt empty string');
      }

      const parts = encryptedData.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, encryptedHex, authTagHex] = parts;

      const key = this.getEncryptionKey();
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data - data may be corrupted or encryption key has changed');
    }
  }

  /**
   * Validates that the encryption service is properly configured
   *
   * @returns true if encryption is working, false otherwise
   */
  static validateConfiguration(): boolean {
    try {
      const testString = 'test-encryption-validation';
      const encrypted = this.encrypt(testString);
      const decrypted = this.decrypt(encrypted);
      return decrypted === testString;
    } catch (error) {
      console.error('Encryption validation failed:', error);
      return false;
    }
  }

  /**
   * Generates a secure random encryption key
   * Use this to generate a new ENCRYPTION_KEY for your environment
   *
   * @returns A random 64-character hex string suitable for use as ENCRYPTION_KEY
   */
  static generateEncryptionKey(): string {
    return randomBytes(32).toString('hex');
  }
}

// Validate encryption on module load in development
if (process.env.NODE_ENV === 'development' && process.env.ENCRYPTION_KEY) {
  if (!EncryptionService.validateConfiguration()) {
    console.warn('Warning: Encryption service validation failed. Check ENCRYPTION_KEY environment variable.');
  }
}
