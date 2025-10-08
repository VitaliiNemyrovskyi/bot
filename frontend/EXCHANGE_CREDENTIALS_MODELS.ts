/**
 * EXCHANGE CREDENTIALS TYPE DEFINITIONS
 *
 * This file should be created at:
 * /Users/vnemyrovskyi/IdeaProjects/bot/frontend/src/app/models/exchange-credentials.models.ts
 *
 * These models define all data structures for the exchange credentials management system.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Supported cryptocurrency exchange platforms
 *
 * Add new exchanges here as they are integrated.
 */
export enum ExchangeType {
  BYBIT = 'BYBIT',
  BINANCE = 'BINANCE',
  OKX = 'OKX',
  COINBASE = 'COINBASE',
  KRAKEN = 'KRAKEN',
  HUOBI = 'HUOBI',
  KUCOIN = 'KUCOIN',
  BITFINEX = 'BITFINEX',
  GATE_IO = 'GATE_IO',
  MEXC = 'MEXC'
}

/**
 * Exchange environment types
 *
 * TESTNET: Demo/testing environment with fake money
 * MAINNET: Production environment with real money
 */
export enum EnvironmentType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET'
}

/**
 * Credential status
 * Used for displaying credential health
 */
export enum CredentialStatus {
  ACTIVE = 'ACTIVE',           // Credential is active and working
  INACTIVE = 'INACTIVE',       // Credential exists but not active
  ERROR = 'ERROR',             // Credential has errors (e.g., invalid API keys)
  EXPIRED = 'EXPIRED',         // API keys have expired
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'  // API keys lack required permissions
}

// ============================================================================
// CORE DOMAIN MODELS
// ============================================================================

/**
 * Exchange Credential Entity
 *
 * Represents a single API credential for an exchange in a specific environment.
 * This is the primary data model returned from the backend.
 *
 * @example
 * {
 *   id: 'cred_abc123',
 *   userId: 'user_xyz789',
 *   exchange: ExchangeType.BYBIT,
 *   environment: EnvironmentType.TESTNET,
 *   apiKeyPreview: '****1234',
 *   label: 'My Trading Account',
 *   isActive: true,
 *   createdAt: '2025-10-01T12:00:00.000Z',
 *   updatedAt: '2025-10-01T12:00:00.000Z'
 * }
 */
export interface ExchangeCredential {
  /**
   * Unique identifier for this credential
   */
  id: string;

  /**
   * User ID who owns this credential
   */
  userId: string;

  /**
   * Exchange platform (Bybit, Binance, etc.)
   */
  exchange: ExchangeType;

  /**
   * Environment (Testnet or Mainnet)
   */
  environment: EnvironmentType;

  /**
   * Masked API key for display purposes only
   * Never contains the full API key for security
   * Example: "****1234"
   */
  apiKeyPreview: string;

  /**
   * Optional user-friendly label/name for this credential
   * Example: "My Main Trading Account"
   */
  label?: string;

  /**
   * Whether this credential is currently active
   * Only one credential per exchange can be active at a time
   */
  isActive: boolean;

  /**
   * Credential status
   * Optional - may not be present in all responses
   */
  status?: CredentialStatus;

  /**
   * When this credential was created (ISO 8601 format)
   */
  createdAt: string;

  /**
   * When this credential was last updated (ISO 8601 format)
   */
  updatedAt: string;

  /**
   * Last successful connection timestamp (ISO 8601 format)
   * Optional - updated when connection is tested/verified
   */
  lastConnectedAt?: string;

  /**
   * Additional metadata
   * Optional - exchange-specific information
   */
  metadata?: Record<string, any>;
}

// ============================================================================
// REQUEST/RESPONSE MODELS
// ============================================================================

/**
 * Request to create a new exchange credential
 *
 * @example
 * {
 *   exchange: ExchangeType.BYBIT,
 *   environment: EnvironmentType.TESTNET,
 *   apiKey: 'your-api-key-here',
 *   apiSecret: 'your-api-secret-here',
 *   label: 'My Trading Account'
 * }
 */
export interface CreateExchangeCredentialRequest {
  /**
   * Exchange platform
   */
  exchange: ExchangeType;

  /**
   * Environment (Testnet or Mainnet)
   */
  environment: EnvironmentType;

  /**
   * Full API key (never stored in frontend after submission)
   */
  apiKey: string;

  /**
   * Full API secret (never stored in frontend after submission)
   */
  apiSecret: string;

  /**
   * Optional user-friendly label
   */
  label?: string;

  /**
   * Optional: Automatically activate this credential after creation
   * Default: false
   */
  autoActivate?: boolean;
}

/**
 * Request to update an existing credential
 *
 * NOTE: API key and secret cannot be updated.
 * To change credentials, you must delete and recreate.
 * Only label can be updated.
 *
 * @example
 * {
 *   label: 'Updated Account Name'
 * }
 */
export interface UpdateExchangeCredentialRequest {
  /**
   * Updated label for the credential
   */
  label?: string;
}

/**
 * Response for single credential operations
 *
 * Used for: create, update, activate, getById
 */
export interface ExchangeCredentialResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * The credential data
   */
  data: ExchangeCredential;

  /**
   * Optional message (e.g., "Credential created successfully")
   */
  message?: string;

  /**
   * Timestamp of the response (ISO 8601 format)
   */
  timestamp: string;
}

/**
 * Response for list operations
 *
 * Used for: fetchCredentials (list all)
 */
export interface ExchangeCredentialsListResponse {
  /**
   * Whether the operation was successful
   */
  success: boolean;

  /**
   * Response data
   */
  data: {
    /**
     * Array of credentials
     */
    credentials: ExchangeCredential[];

    /**
     * Total count of credentials (useful for pagination)
     */
    totalCount: number;

    /**
     * Optional: Currently active credential per exchange
     */
    activeCredentials?: Record<ExchangeType, ExchangeCredential>;
  };

  /**
   * Timestamp of the response (ISO 8601 format)
   */
  timestamp: string;
}

/**
 * Request to test credential connection
 *
 * This validates the API keys with the exchange before saving.
 *
 * @example
 * {
 *   exchange: ExchangeType.BYBIT,
 *   environment: EnvironmentType.TESTNET,
 *   apiKey: 'your-api-key-here',
 *   apiSecret: 'your-api-secret-here'
 * }
 */
export interface TestConnectionRequest {
  /**
   * Exchange platform
   */
  exchange: ExchangeType;

  /**
   * Environment
   */
  environment: EnvironmentType;

  /**
   * API key to test
   */
  apiKey: string;

  /**
   * API secret to test
   */
  apiSecret: string;
}

/**
 * Response for connection test
 *
 * Returns success/failure and optional account preview data.
 */
export interface TestConnectionResponse {
  /**
   * Whether the connection test was successful
   */
  success: boolean;

  /**
   * Message describing the result
   * Example: "Connection successful", "Invalid API key", etc.
   */
  message: string;

  /**
   * Whether this was tested against testnet
   */
  testnet: boolean;

  /**
   * Optional: Preview of account data if connection successful
   */
  accountPreview?: {
    /**
     * Account ID or username
     */
    accountId?: string;

    /**
     * Total equity/balance
     */
    totalEquity?: string;

    /**
     * Total available balance
     */
    totalBalance?: string;

    /**
     * Currency of the balance (e.g., "USDT")
     */
    currency?: string;

    /**
     * Account type (e.g., "UNIFIED", "CONTRACT", "SPOT")
     */
    accountType?: string;

    /**
     * Additional exchange-specific data
     */
    [key: string]: any;
  };

  /**
   * API permissions detected (if available)
   * Helps users verify they have the required permissions
   */
  permissions?: string[];

  /**
   * Any warnings about the API key
   * Example: ["API key has read-only access", "Withdrawals not permitted"]
   */
  warnings?: string[];

  /**
   * Timestamp of the test
   */
  timestamp: string;
}

/**
 * Request to activate a credential
 */
export interface ActivateCredentialRequest {
  /**
   * ID of the credential to activate
   */
  credentialId: string;
}

/**
 * Response for delete operation
 */
export interface DeleteCredentialResponse {
  /**
   * Whether the deletion was successful
   */
  success: boolean;

  /**
   * Confirmation message
   */
  message: string;

  /**
   * Timestamp of the deletion
   */
  timestamp: string;
}

// ============================================================================
// ERROR MODELS
// ============================================================================

/**
 * Generic error response from API
 */
export interface ExchangeCredentialError {
  /**
   * Always false for errors
   */
  success: false;

  /**
   * Error details
   */
  error: {
    /**
     * Error code (e.g., "INVALID_API_KEY", "DUPLICATE_CREDENTIAL")
     */
    code: string;

    /**
     * User-friendly error message
     */
    message: string;

    /**
     * Optional additional error details
     */
    details?: any;

    /**
     * Optional: Field-specific validation errors
     */
    fieldErrors?: Record<string, string[]>;
  };

  /**
   * Timestamp of the error
   */
  timestamp: string;
}

/**
 * Error codes that can be returned from the API
 */
export enum ExchangeCredentialErrorCode {
  // Validation errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_API_SECRET = 'INVALID_API_SECRET',
  INVALID_EXCHANGE = 'INVALID_EXCHANGE',
  INVALID_ENVIRONMENT = 'INVALID_ENVIRONMENT',

  // Business logic errors
  DUPLICATE_CREDENTIAL = 'DUPLICATE_CREDENTIAL',
  CREDENTIAL_NOT_FOUND = 'CREDENTIAL_NOT_FOUND',
  CANNOT_DELETE_ACTIVE_CREDENTIAL = 'CANNOT_DELETE_ACTIVE_CREDENTIAL',

  // Exchange API errors
  EXCHANGE_API_ERROR = 'EXCHANGE_API_ERROR',
  EXCHANGE_CONNECTION_FAILED = 'EXCHANGE_CONNECTION_FAILED',
  EXCHANGE_RATE_LIMITED = 'EXCHANGE_RATE_LIMITED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN'
}

// ============================================================================
// UI-SPECIFIC MODELS
// ============================================================================

/**
 * Credential display model with computed properties
 * Used in UI components for displaying credentials with additional context
 */
export interface CredentialDisplayModel extends ExchangeCredential {
  /**
   * Exchange display name
   */
  exchangeName: string;

  /**
   * Exchange logo URL
   */
  exchangeLogo: string;

  /**
   * Environment display name (e.g., "Testnet", "Mainnet")
   */
  environmentName: string;

  /**
   * Environment color for UI
   */
  environmentColor: string;

  /**
   * Status badge color
   */
  statusColor: string;

  /**
   * Formatted created date (e.g., "2 hours ago")
   */
  createdAtFormatted: string;

  /**
   * Formatted updated date
   */
  updatedAtFormatted: string;
}

/**
 * Form model for credential creation/editing
 * Used in Angular Reactive Forms
 */
export interface CredentialFormModel {
  exchange: ExchangeType | null;
  environment: EnvironmentType | null;
  apiKey: string;
  apiSecret: string;
  label: string;
}

/**
 * Filter options for credential list
 */
export interface CredentialFilterOptions {
  /**
   * Filter by exchange
   */
  exchange?: ExchangeType;

  /**
   * Filter by environment
   */
  environment?: EnvironmentType;

  /**
   * Filter by active status
   */
  isActive?: boolean;

  /**
   * Search query (searches label and API key preview)
   */
  searchQuery?: string;

  /**
   * Sort field
   */
  sortBy?: 'createdAt' | 'updatedAt' | 'exchange' | 'label';

  /**
   * Sort direction
   */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Grouped credentials by exchange
 * Used for displaying credentials grouped by exchange
 */
export interface GroupedCredentials {
  exchange: ExchangeType;
  exchangeName: string;
  exchangeLogo: string;
  credentials: ExchangeCredential[];
  activeCredential: ExchangeCredential | null;
  count: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type guard to check if object is ExchangeCredential
 */
export function isExchangeCredential(obj: any): obj is ExchangeCredential {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.userId === 'string' &&
    Object.values(ExchangeType).includes(obj.exchange) &&
    Object.values(EnvironmentType).includes(obj.environment) &&
    typeof obj.apiKeyPreview === 'string' &&
    typeof obj.isActive === 'boolean'
  );
}

/**
 * Type guard to check if response is an error
 */
export function isExchangeCredentialError(
  response: any
): response is ExchangeCredentialError {
  return (
    typeof response === 'object' &&
    response !== null &&
    response.success === false &&
    typeof response.error === 'object' &&
    typeof response.error.code === 'string' &&
    typeof response.error.message === 'string'
  );
}

/**
 * Type guard to check if string is valid ExchangeType
 */
export function isValidExchangeType(value: string): value is ExchangeType {
  return Object.values(ExchangeType).includes(value as ExchangeType);
}

/**
 * Type guard to check if string is valid EnvironmentType
 */
export function isValidEnvironmentType(value: string): value is EnvironmentType {
  return Object.values(EnvironmentType).includes(value as EnvironmentType);
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Exchange metadata
 * Display names, logos, colors, etc.
 */
export const EXCHANGE_METADATA: Record<ExchangeType, {
  name: string;
  logo: string;
  color: string;
  website: string;
  supportsTestnet: boolean;
}> = {
  [ExchangeType.BYBIT]: {
    name: 'Bybit',
    logo: '/assets/images/exchanges/bybit.svg',
    color: '#F7A600',
    website: 'https://www.bybit.com',
    supportsTestnet: true
  },
  [ExchangeType.BINANCE]: {
    name: 'Binance',
    logo: '/assets/images/exchanges/binance.svg',
    color: '#F3BA2F',
    website: 'https://www.binance.com',
    supportsTestnet: true
  },
  [ExchangeType.OKX]: {
    name: 'OKX',
    logo: '/assets/images/exchanges/okx.svg',
    color: '#000000',
    website: 'https://www.okx.com',
    supportsTestnet: true
  },
  [ExchangeType.COINBASE]: {
    name: 'Coinbase',
    logo: '/assets/images/exchanges/coinbase.svg',
    color: '#0052FF',
    website: 'https://www.coinbase.com',
    supportsTestnet: false
  },
  [ExchangeType.KRAKEN]: {
    name: 'Kraken',
    logo: '/assets/images/exchanges/kraken.svg',
    color: '#5741D9',
    website: 'https://www.kraken.com',
    supportsTestnet: false
  },
  [ExchangeType.HUOBI]: {
    name: 'Huobi',
    logo: '/assets/images/exchanges/huobi.svg',
    color: '#2B69E1',
    website: 'https://www.huobi.com',
    supportsTestnet: false
  },
  [ExchangeType.KUCOIN]: {
    name: 'KuCoin',
    logo: '/assets/images/exchanges/kucoin.svg',
    color: '#23AF91',
    website: 'https://www.kucoin.com',
    supportsTestnet: false
  },
  [ExchangeType.BITFINEX]: {
    name: 'Bitfinex',
    logo: '/assets/images/exchanges/bitfinex.svg',
    color: '#16B157',
    website: 'https://www.bitfinex.com',
    supportsTestnet: false
  },
  [ExchangeType.GATE_IO]: {
    name: 'Gate.io',
    logo: '/assets/images/exchanges/gateio.svg',
    color: '#2354E6',
    website: 'https://www.gate.io',
    supportsTestnet: false
  },
  [ExchangeType.MEXC]: {
    name: 'MEXC',
    logo: '/assets/images/exchanges/mexc.svg',
    color: '#00C087',
    website: 'https://www.mexc.com',
    supportsTestnet: false
  }
};

/**
 * Environment metadata
 */
export const ENVIRONMENT_METADATA: Record<EnvironmentType, {
  name: string;
  color: string;
  icon: string;
  description: string;
}> = {
  [EnvironmentType.TESTNET]: {
    name: 'Testnet',
    color: '#FF9800',
    icon: 'science',
    description: 'Test environment with fake money for safe experimentation'
  },
  [EnvironmentType.MAINNET]: {
    name: 'Mainnet',
    color: '#2196F3',
    icon: 'verified_user',
    description: 'Production environment with real money'
  }
};

/**
 * Status metadata
 */
export const STATUS_METADATA: Record<CredentialStatus, {
  name: string;
  color: string;
  icon: string;
}> = {
  [CredentialStatus.ACTIVE]: {
    name: 'Active',
    color: '#4CAF50',
    icon: 'check_circle'
  },
  [CredentialStatus.INACTIVE]: {
    name: 'Inactive',
    color: '#9E9E9E',
    icon: 'radio_button_unchecked'
  },
  [CredentialStatus.ERROR]: {
    name: 'Error',
    color: '#F44336',
    icon: 'error'
  },
  [CredentialStatus.EXPIRED]: {
    name: 'Expired',
    color: '#FF9800',
    icon: 'schedule'
  },
  [CredentialStatus.INSUFFICIENT_PERMISSIONS]: {
    name: 'Insufficient Permissions',
    color: '#FFC107',
    icon: 'warning'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get exchange display name
 */
export function getExchangeName(exchange: ExchangeType): string {
  return EXCHANGE_METADATA[exchange]?.name ?? exchange;
}

/**
 * Get exchange logo URL
 */
export function getExchangeLogo(exchange: ExchangeType): string {
  return EXCHANGE_METADATA[exchange]?.logo ?? '/assets/images/exchanges/default.svg';
}

/**
 * Get exchange color
 */
export function getExchangeColor(exchange: ExchangeType): string {
  return EXCHANGE_METADATA[exchange]?.color ?? '#000000';
}

/**
 * Get environment display name
 */
export function getEnvironmentName(environment: EnvironmentType): string {
  return ENVIRONMENT_METADATA[environment]?.name ?? environment;
}

/**
 * Get environment color
 */
export function getEnvironmentColor(environment: EnvironmentType): string {
  return ENVIRONMENT_METADATA[environment]?.color ?? '#000000';
}

/**
 * Get status display name
 */
export function getStatusName(status: CredentialStatus): string {
  return STATUS_METADATA[status]?.name ?? status;
}

/**
 * Get status color
 */
export function getStatusColor(status: CredentialStatus): string {
  return STATUS_METADATA[status]?.color ?? '#000000';
}

/**
 * Check if exchange supports testnet
 */
export function exchangeSupportsTestnet(exchange: ExchangeType): boolean {
  return EXCHANGE_METADATA[exchange]?.supportsTestnet ?? false;
}

/**
 * Mask API key for display
 * Shows only last 4 characters
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 4) {
    return '****';
  }
  return '****' + apiKey.slice(-4);
}

/**
 * Convert credential to display model
 */
export function toDisplayModel(credential: ExchangeCredential): CredentialDisplayModel {
  return {
    ...credential,
    exchangeName: getExchangeName(credential.exchange),
    exchangeLogo: getExchangeLogo(credential.exchange),
    environmentName: getEnvironmentName(credential.environment),
    environmentColor: getEnvironmentColor(credential.environment),
    statusColor: credential.status ? getStatusColor(credential.status) : '#9E9E9E',
    createdAtFormatted: formatRelativeTime(credential.createdAt),
    updatedAtFormatted: formatRelativeTime(credential.updatedAt)
  };
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * Group credentials by exchange
 */
export function groupCredentialsByExchange(
  credentials: ExchangeCredential[]
): GroupedCredentials[] {
  const grouped = new Map<ExchangeType, ExchangeCredential[]>();

  credentials.forEach(cred => {
    const existing = grouped.get(cred.exchange) ?? [];
    grouped.set(cred.exchange, [...existing, cred]);
  });

  return Array.from(grouped.entries()).map(([exchange, creds]) => ({
    exchange,
    exchangeName: getExchangeName(exchange),
    exchangeLogo: getExchangeLogo(exchange),
    credentials: creds,
    activeCredential: creds.find(c => c.isActive) ?? null,
    count: creds.length
  }));
}

/**
 * Filter credentials based on options
 */
export function filterCredentials(
  credentials: ExchangeCredential[],
  options: CredentialFilterOptions
): ExchangeCredential[] {
  let filtered = [...credentials];

  if (options.exchange) {
    filtered = filtered.filter(c => c.exchange === options.exchange);
  }

  if (options.environment) {
    filtered = filtered.filter(c => c.environment === options.environment);
  }

  if (options.isActive !== undefined) {
    filtered = filtered.filter(c => c.isActive === options.isActive);
  }

  if (options.searchQuery) {
    const query = options.searchQuery.toLowerCase();
    filtered = filtered.filter(c =>
      c.label?.toLowerCase().includes(query) ||
      c.apiKeyPreview.toLowerCase().includes(query) ||
      getExchangeName(c.exchange).toLowerCase().includes(query)
    );
  }

  // Sort
  if (options.sortBy) {
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (options.sortBy) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        case 'exchange':
          aVal = a.exchange;
          bVal = b.exchange;
          break;
        case 'label':
          aVal = a.label ?? '';
          bVal = b.label ?? '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return options.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return options.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
}
