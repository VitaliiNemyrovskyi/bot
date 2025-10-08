import { Exchange, Environment } from '@prisma/client';

/**
 * Type definitions for Exchange Credentials API
 */

// Request types
export interface SaveCredentialsRequest {
  exchange: Exchange;
  environment: Environment;
  apiKey: string;
  apiSecret: string;
  label?: string;
  isActive?: boolean;
}

export interface ActivateCredentialsRequest {
  credentialId: string;
}

// Response types
export interface CredentialInfo {
  id: string;
  userId: string;
  exchange: Exchange;
  environment: Environment;
  apiKeyPreview: string; // Last 4 characters only
  label?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupedCredentials {
  exchange: Exchange;
  credentials: CredentialInfo[];
}

export interface ActiveCredential {
  id: string;
  exchange: Exchange;
  environment: Environment;
  apiKey: string; // Decrypted, for internal use only
  apiSecret: string; // Decrypted, for internal use only
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Service layer types
export interface ExchangeCredentialData {
  exchange: Exchange;
  environment: Environment;
  apiKey: string; // Unencrypted
  apiSecret: string; // Unencrypted
  label?: string;
  isActive?: boolean; // Optional flag to set credential as active
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: any;
}

// API Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// Error codes
export enum CredentialErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_EXCHANGE = 'INVALID_EXCHANGE',
  INVALID_ENVIRONMENT = 'INVALID_ENVIRONMENT',
  ENCRYPTION_FAILED = 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
}
