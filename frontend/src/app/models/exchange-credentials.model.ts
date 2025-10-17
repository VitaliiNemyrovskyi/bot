/**
 * Exchange Credentials Type Definitions
 *
 * Complete type system for exchange credentials management with testnet/mainnet support.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Supported cryptocurrency exchange platforms
 */
export enum ExchangeType {
  BYBIT = 'BYBIT',
  BINANCE = 'BINANCE',
  OKX = 'OKX',
  COINBASE = 'COINBASE',
  KRAKEN = 'KRAKEN',
  BINGX = 'BINGX',
  MEXC = 'MEXC'
}


/**
 * Credential status
 */
export enum CredentialStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}

// ============================================================================
// CORE DOMAIN MODELS
// ============================================================================

/**
 * Exchange Credential Entity
 * Represents a single API credential for an exchange
 */
export interface ExchangeCredential {
  id: string;
  userId: string;
  exchange: ExchangeType;
  apiKeyPreview: string;
  label?: string;
  isActive: boolean;
  status?: CredentialStatus;
  createdAt: string;
  updatedAt: string;
  lastConnectedAt?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// REQUEST/RESPONSE MODELS
// ============================================================================

/**
 * Request to create a new exchange credential
 */
export interface CreateExchangeCredentialRequest {
  exchange: ExchangeType;
  apiKey: string;
  apiSecret: string;
  authToken?: string; // Browser session token (for MEXC futures trading)
  label?: string;
  isActive?: boolean; // Optional flag to set credential as active (defaults to true)
}

/**
 * Request to update an existing credential
 * All fields are optional - only provided fields will be updated
 */
export interface UpdateExchangeCredentialRequest {
  label?: string;
  apiKey?: string;
  apiSecret?: string;
  authToken?: string; // Browser session token (for MEXC)
  isActive?: boolean;  // Set active status (true/false) - no automatic deactivation of others
}

/**
 * Response for single credential operations
 */
export interface ExchangeCredentialResponse {
  success: boolean;
  data: ExchangeCredential;
  message?: string;
  timestamp: string;
}

/**
 * Response for list operations
 */
export interface ExchangeCredentialsListResponse {
  success: boolean;
  data: {
    credentials: ExchangeCredential[];
    totalCount: number;
    activeCredentials?: Record<ExchangeType, ExchangeCredential>;
  };
  timestamp: string;
}

/**
 * Request to test credential connection
 */
export interface TestConnectionRequest {
  exchange: ExchangeType;
  apiKey: string;
  apiSecret: string;
  authToken?: string; // Browser session token (for MEXC)
}

/**
 * Response for connection test
 */
export interface TestConnectionResponse {
  success: boolean;
  message: string;
  accountPreview?: {
    accountId?: string;
    totalEquity?: string;
    totalBalance?: string;
    currency?: string;
    accountType?: string;
    [key: string]: any;
  };
  permissions?: string[];
  warnings?: string[];
  timestamp: string;
}

/**
 * Request to activate a credential
 */
export interface ActivateCredentialRequest {
  credentialId: string;
}

/**
 * Response for delete operation
 */
export interface DeleteCredentialResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

// ============================================================================
// ERROR MODELS
// ============================================================================

/**
 * Generic error response from API
 */
export interface ExchangeCredentialError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    fieldErrors?: Record<string, string[]>;
  };
  timestamp: string;
}

/**
 * Error codes that can be returned from the API
 */
export enum ExchangeCredentialErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_API_SECRET = 'INVALID_API_SECRET',
  INVALID_EXCHANGE = 'INVALID_EXCHANGE',
  INVALID_ENVIRONMENT = 'INVALID_ENVIRONMENT',
  DUPLICATE_CREDENTIAL = 'DUPLICATE_CREDENTIAL',
  CREDENTIAL_NOT_FOUND = 'CREDENTIAL_NOT_FOUND',
  CANNOT_DELETE_ACTIVE_CREDENTIAL = 'CANNOT_DELETE_ACTIVE_CREDENTIAL',
  EXCHANGE_API_ERROR = 'EXCHANGE_API_ERROR',
  EXCHANGE_CONNECTION_FAILED = 'EXCHANGE_CONNECTION_FAILED',
  EXCHANGE_RATE_LIMITED = 'EXCHANGE_RATE_LIMITED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
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
 */
export interface CredentialDisplayModel extends ExchangeCredential {
  exchangeName: string;
  exchangeLogo: string;
  statusColor: string;
  createdAtFormatted: string;
  updatedAtFormatted: string;
}

/**
 * Form model for credential creation/editing
 */
export interface CredentialFormModel {
  exchange: ExchangeType | null;
  apiKey: string;
  apiSecret: string;
  label: string;
}

/**
 * Filter options for credential list
 */
export interface CredentialFilterOptions {
  exchange?: ExchangeType;
  isActive?: boolean;
  searchQuery?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'exchange' | 'label';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Grouped credentials by exchange
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
// TYPE GUARDS
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
    typeof obj.apiKeyPreview === 'string' &&
    typeof obj.isActive === 'boolean'
  );
}

/**
 * Type guard to check if response is an error
 */
export function isExchangeCredentialError(response: any): response is ExchangeCredentialError {
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


// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Exchange metadata - display names, logos, colors, etc.
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
    supportsTestnet: false
  },
  [ExchangeType.BINANCE]: {
    name: 'Binance',
    logo: '/assets/images/exchanges/binance.svg',
    color: '#F3BA2F',
    website: 'https://www.binance.com',
    supportsTestnet: false
  },
  [ExchangeType.OKX]: {
    name: 'OKX',
    logo: '/assets/images/exchanges/okx.svg',
    color: '#000000',
    website: 'https://www.okx.com',
    supportsTestnet: false
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
  [ExchangeType.BINGX]: {
    name: 'BingX',
    logo: '/assets/images/exchanges/bingx.svg',
    color: '#1E73FA',
    website: 'https://www.bingx.com',
    supportsTestnet: false
  },
  [ExchangeType.MEXC]: {
    name: 'MEXC',
    logo: '/assets/images/exchanges/mexc.svg',
    color: '#00D4AA',
    website: 'https://www.mexc.com',
    supportsTestnet: false
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
 * Mask API key for display - shows only last 4 characters
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
    statusColor: credential.status ? getStatusColor(credential.status) : '#9E9E9E',
    createdAtFormatted: formatRelativeTime(credential.createdAt),
    updatedAtFormatted: formatRelativeTime(credential.updatedAt)
  };
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
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
export function groupCredentialsByExchange(credentials: ExchangeCredential[]): GroupedCredentials[] {
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
