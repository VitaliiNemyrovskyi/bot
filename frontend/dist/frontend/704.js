"use strict";
(self["webpackChunkfrontend"] = self["webpackChunkfrontend"] || []).push([[704],{

/***/ 7392:
/*!******************************************************!*\
  !*** ./src/app/models/exchange-credentials.model.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CredentialStatus: () => (/* binding */ CredentialStatus),
/* harmony export */   ENVIRONMENT_METADATA: () => (/* binding */ ENVIRONMENT_METADATA),
/* harmony export */   EXCHANGE_METADATA: () => (/* binding */ EXCHANGE_METADATA),
/* harmony export */   EnvironmentType: () => (/* binding */ EnvironmentType),
/* harmony export */   ExchangeCredentialErrorCode: () => (/* binding */ ExchangeCredentialErrorCode),
/* harmony export */   ExchangeType: () => (/* binding */ ExchangeType),
/* harmony export */   STATUS_METADATA: () => (/* binding */ STATUS_METADATA),
/* harmony export */   exchangeSupportsTestnet: () => (/* binding */ exchangeSupportsTestnet),
/* harmony export */   filterCredentials: () => (/* binding */ filterCredentials),
/* harmony export */   formatRelativeTime: () => (/* binding */ formatRelativeTime),
/* harmony export */   getEnvironmentColor: () => (/* binding */ getEnvironmentColor),
/* harmony export */   getEnvironmentName: () => (/* binding */ getEnvironmentName),
/* harmony export */   getExchangeColor: () => (/* binding */ getExchangeColor),
/* harmony export */   getExchangeLogo: () => (/* binding */ getExchangeLogo),
/* harmony export */   getExchangeName: () => (/* binding */ getExchangeName),
/* harmony export */   getStatusColor: () => (/* binding */ getStatusColor),
/* harmony export */   getStatusName: () => (/* binding */ getStatusName),
/* harmony export */   groupCredentialsByExchange: () => (/* binding */ groupCredentialsByExchange),
/* harmony export */   isExchangeCredential: () => (/* binding */ isExchangeCredential),
/* harmony export */   isExchangeCredentialError: () => (/* binding */ isExchangeCredentialError),
/* harmony export */   isValidEnvironmentType: () => (/* binding */ isValidEnvironmentType),
/* harmony export */   isValidExchangeType: () => (/* binding */ isValidExchangeType),
/* harmony export */   maskApiKey: () => (/* binding */ maskApiKey),
/* harmony export */   toDisplayModel: () => (/* binding */ toDisplayModel)
/* harmony export */ });
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
var ExchangeType = /*#__PURE__*/function (ExchangeType) {
  ExchangeType["BYBIT"] = "BYBIT";
  ExchangeType["BINANCE"] = "BINANCE";
  ExchangeType["OKX"] = "OKX";
  ExchangeType["COINBASE"] = "COINBASE";
  ExchangeType["KRAKEN"] = "KRAKEN";
  ExchangeType["BINGX"] = "BINGX";
  return ExchangeType;
}(ExchangeType || {});
/**
 * Exchange environment types
 * TESTNET: Demo/testing environment with fake money
 * MAINNET: Production environment with real money
 */
var EnvironmentType = /*#__PURE__*/function (EnvironmentType) {
  EnvironmentType["TESTNET"] = "TESTNET";
  EnvironmentType["MAINNET"] = "MAINNET";
  return EnvironmentType;
}(EnvironmentType || {});
/**
 * Credential status
 */
var CredentialStatus = /*#__PURE__*/function (CredentialStatus) {
  CredentialStatus["ACTIVE"] = "ACTIVE";
  CredentialStatus["INACTIVE"] = "INACTIVE";
  CredentialStatus["ERROR"] = "ERROR";
  CredentialStatus["EXPIRED"] = "EXPIRED";
  CredentialStatus["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
  return CredentialStatus;
}(CredentialStatus || {});
/**
 * Error codes that can be returned from the API
 */
var ExchangeCredentialErrorCode = /*#__PURE__*/function (ExchangeCredentialErrorCode) {
  ExchangeCredentialErrorCode["INVALID_API_KEY"] = "INVALID_API_KEY";
  ExchangeCredentialErrorCode["INVALID_API_SECRET"] = "INVALID_API_SECRET";
  ExchangeCredentialErrorCode["INVALID_EXCHANGE"] = "INVALID_EXCHANGE";
  ExchangeCredentialErrorCode["INVALID_ENVIRONMENT"] = "INVALID_ENVIRONMENT";
  ExchangeCredentialErrorCode["DUPLICATE_CREDENTIAL"] = "DUPLICATE_CREDENTIAL";
  ExchangeCredentialErrorCode["CREDENTIAL_NOT_FOUND"] = "CREDENTIAL_NOT_FOUND";
  ExchangeCredentialErrorCode["CANNOT_DELETE_ACTIVE_CREDENTIAL"] = "CANNOT_DELETE_ACTIVE_CREDENTIAL";
  ExchangeCredentialErrorCode["EXCHANGE_API_ERROR"] = "EXCHANGE_API_ERROR";
  ExchangeCredentialErrorCode["EXCHANGE_CONNECTION_FAILED"] = "EXCHANGE_CONNECTION_FAILED";
  ExchangeCredentialErrorCode["EXCHANGE_RATE_LIMITED"] = "EXCHANGE_RATE_LIMITED";
  ExchangeCredentialErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
  ExchangeCredentialErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
  ExchangeCredentialErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
  ExchangeCredentialErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
  ExchangeCredentialErrorCode["FORBIDDEN"] = "FORBIDDEN";
  return ExchangeCredentialErrorCode;
}(ExchangeCredentialErrorCode || {});
// ============================================================================
// TYPE GUARDS
// ============================================================================
/**
 * Type guard to check if object is ExchangeCredential
 */
function isExchangeCredential(obj) {
  return typeof obj === 'object' && obj !== null && typeof obj.id === 'string' && typeof obj.userId === 'string' && Object.values(ExchangeType).includes(obj.exchange) && Object.values(EnvironmentType).includes(obj.environment) && typeof obj.apiKeyPreview === 'string' && typeof obj.isActive === 'boolean';
}
/**
 * Type guard to check if response is an error
 */
function isExchangeCredentialError(response) {
  return typeof response === 'object' && response !== null && response.success === false && typeof response.error === 'object' && typeof response.error.code === 'string' && typeof response.error.message === 'string';
}
/**
 * Type guard to check if string is valid ExchangeType
 */
function isValidExchangeType(value) {
  return Object.values(ExchangeType).includes(value);
}
/**
 * Type guard to check if string is valid EnvironmentType
 */
function isValidEnvironmentType(value) {
  return Object.values(EnvironmentType).includes(value);
}
// ============================================================================
// CONSTANTS
// ============================================================================
/**
 * Exchange metadata - display names, logos, colors, etc.
 */
const EXCHANGE_METADATA = {
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
  [ExchangeType.BINGX]: {
    name: 'BingX',
    logo: '/assets/images/exchanges/bingx.svg',
    color: '#1E73FA',
    website: 'https://www.bingx.com',
    supportsTestnet: true
  }
};
/**
 * Environment metadata
 */
const ENVIRONMENT_METADATA = {
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
const STATUS_METADATA = {
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
function getExchangeName(exchange) {
  return EXCHANGE_METADATA[exchange]?.name ?? exchange;
}
/**
 * Get exchange logo URL
 */
function getExchangeLogo(exchange) {
  return EXCHANGE_METADATA[exchange]?.logo ?? '/assets/images/exchanges/default.svg';
}
/**
 * Get exchange color
 */
function getExchangeColor(exchange) {
  return EXCHANGE_METADATA[exchange]?.color ?? '#000000';
}
/**
 * Get environment display name
 */
function getEnvironmentName(environment) {
  return ENVIRONMENT_METADATA[environment]?.name ?? environment;
}
/**
 * Get environment color
 */
function getEnvironmentColor(environment) {
  return ENVIRONMENT_METADATA[environment]?.color ?? '#000000';
}
/**
 * Get status display name
 */
function getStatusName(status) {
  return STATUS_METADATA[status]?.name ?? status;
}
/**
 * Get status color
 */
function getStatusColor(status) {
  return STATUS_METADATA[status]?.color ?? '#000000';
}
/**
 * Check if exchange supports testnet
 */
function exchangeSupportsTestnet(exchange) {
  return EXCHANGE_METADATA[exchange]?.supportsTestnet ?? false;
}
/**
 * Mask API key for display - shows only last 4 characters
 */
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length <= 4) {
    return '****';
  }
  return '****' + apiKey.slice(-4);
}
/**
 * Convert credential to display model
 */
function toDisplayModel(credential) {
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
function formatRelativeTime(dateString) {
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
function groupCredentialsByExchange(credentials) {
  const grouped = new Map();
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
function filterCredentials(credentials, options) {
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
    filtered = filtered.filter(c => c.label?.toLowerCase().includes(query) || c.apiKeyPreview.toLowerCase().includes(query) || getExchangeName(c.exchange).toLowerCase().includes(query));
  }
  // Sort
  if (options.sortBy) {
    filtered.sort((a, b) => {
      let aVal;
      let bVal;
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

/***/ }),

/***/ 9704:
/*!**********************************************************!*\
  !*** ./src/app/services/exchange-credentials.service.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExchangeCredentialsService: () => (/* binding */ ExchangeCredentialsService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs */ 7919);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ 8764);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs/operators */ 271);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ 1318);
/* harmony import */ var _config_app_config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/app.config */ 9740);
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ 6443);
/* harmony import */ var _exchange_environment_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./exchange-environment.service */ 5731);







/**
 * Service to manage exchange credentials for multiple exchanges and environments.
 *
 * This service provides:
 * - CRUD operations for exchange credentials
 * - Connection testing
 * - Active credential management
 * - Environment-aware state synchronization
 * - Reactive state via Angular signals
 */
let ExchangeCredentialsService = /*#__PURE__*/(() => {
  class ExchangeCredentialsService {
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor(http, environmentService) {
      this.http = http;
      this.environmentService = environmentService;
      // ============================================================================
      // SIGNALS - State Management
      // ============================================================================
      this._credentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.signal)([]);
      this.credentials = this._credentials.asReadonly();
      this._activeCredential = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.signal)(null);
      this.activeCredential = this._activeCredential.asReadonly();
      this._loading = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.signal)(false);
      this.loading = this._loading.asReadonly();
      this._error = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.signal)(null);
      this.error = this._error.asReadonly();
      // ============================================================================
      // COMPUTED SIGNALS - Derived State
      // ============================================================================
      this.hasCredentials = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.computed)(() => this.credentials().length > 0);
      this.activeExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.computed)(() => this.activeCredential()?.exchange ?? null);
      this.credentialsByExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.computed)(() => this.groupByExchange(this.credentials()));
      this.credentialCountByExchange = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.computed)(() => {
        const grouped = this.credentialsByExchange();
        const counts = new Map();
        grouped.forEach((creds, exchange) => {
          counts.set(exchange, creds.length);
        });
        return counts;
      });
      this.availableExchanges = (0,_angular_core__WEBPACK_IMPORTED_MODULE_2__.computed)(() => Array.from(this.credentialsByExchange().keys()));
      // Note: We no longer filter credentials by environment
      // The Profile -> Trading Platforms tab shows all credentials for all environments
    }
    // ============================================================================
    // PUBLIC METHODS - CRUD Operations
    // ============================================================================
    /**
     * Fetch all credentials from the backend
     * Returns credentials for all environments
     */
    fetchCredentials() {
      this._loading.set(true);
      this._error.set(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('exchangeCredentials', 'list');
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.tap)(response => {
        console.log('[ExchangeCredentialsService] Fetched credentials:', response.data.credentials.length);
        this.updateCredentialsState(response.data.credentials);
        this._loading.set(false);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.map)(response => response.data.credentials), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to fetch credentials');
      }));
    }
    /**
     * Get a single credential by ID
     */
    getCredentialById(id) {
      this._error.set(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getParameterizedUrl)('exchangeCredentials', 'getById', {
        id
      });
      return this.http.get(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.map)(response => response.data), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        return this.handleError(error, 'Failed to fetch credential');
      }));
    }
    /**
     * Create a new exchange credential
     */
    createCredential(data) {
      this._error.set(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('exchangeCredentials', 'create');
      return this.http.post(url, data).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.tap)(response => {
        console.log('[ExchangeCredentialsService] Created credential:', response.data.id);
        // Add new credential to existing list
        const updatedCredentials = [...this.credentials(), response.data];
        this._credentials.set(updatedCredentials);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.map)(response => response.data), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        return this.handleError(error, 'Failed to create credential');
      }));
    }
    /**
     * Update an existing credential (label, apiKey, apiSecret, isActive)
     * Note: isActive is just a boolean flag - no automatic deactivation of other credentials
     */
    updateCredential(id, data) {
      this._error.set(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getParameterizedUrl)('exchangeCredentials', 'update', {
        id
      });
      return this.http.patch(url, data).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.tap)(response => {
        console.log('[ExchangeCredentialsService] Updated credential:', id);
        // Update the specific credential in the list
        const currentCredentials = this.credentials();
        const index = currentCredentials.findIndex(cred => cred.id === id);
        if (index !== -1) {
          const updatedCredentials = [...currentCredentials];
          updatedCredentials[index] = response.data;
          this._credentials.set(updatedCredentials);
        }
        // Update active credential reference if needed
        if (this.activeCredential()?.id === id) {
          this._activeCredential.set(response.data);
        }
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.map)(response => response.data), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        return this.handleError(error, 'Failed to update credential');
      }));
    }
    /**
     * Delete a credential
     */
    deleteCredential(id) {
      this._error.set(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getParameterizedUrl)('exchangeCredentials', 'delete', {
        id
      });
      return this.http.delete(url).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.tap)(() => {
        console.log('[ExchangeCredentialsService] Deleted credential:', id);
        // Remove credential from list
        const updatedCredentials = this.credentials().filter(cred => cred.id !== id);
        this._credentials.set(updatedCredentials);
        // Clear active credential if it was deleted
        if (this.activeCredential()?.id === id) {
          this._activeCredential.set(null);
        }
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_4__.map)(() => undefined), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        return this.handleError(error, 'Failed to delete credential');
      }));
    }
    /**
     * Activate a credential (set as active for its exchange and environment)
     * This now uses updateCredential with isActive: true
     */
    activateCredential(id) {
      return this.updateCredential(id, {
        isActive: true
      });
    }
    // ============================================================================
    // PUBLIC METHODS - Utility Functions
    // ============================================================================
    /**
     * Test credential connection before saving
     */
    testConnection(data) {
      this._error.set(null);
      const url = (0,_config_app_config__WEBPACK_IMPORTED_MODULE_0__.getEndpointUrl)('exchangeCredentials', 'testConnection');
      return this.http.post(url, data).pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_3__.tap)(response => {
        console.log('[ExchangeCredentialsService] Connection test result:', response.success);
      }), (0,rxjs_operators__WEBPACK_IMPORTED_MODULE_5__.catchError)(error => {
        return this.handleError(error, 'Failed to test connection');
      }));
    }
    /**
     * Get all credentials for a specific exchange
     */
    getCredentialsForExchange(exchange) {
      return this.credentials().filter(cred => cred.exchange === exchange);
    }
    /**
     * Get active credential for a specific exchange
     */
    getActiveCredentialForExchange(exchange) {
      return this.credentials().find(cred => cred.exchange === exchange && cred.isActive) ?? null;
    }
    /**
     * Check if user has credentials for a specific exchange
     */
    hasCredentialsForExchange(exchange) {
      return this.credentials().some(cred => cred.exchange === exchange);
    }
    /**
     * Refresh credentials (re-fetch from backend)
     */
    refreshCredentials() {
      this.fetchCredentials().subscribe({
        error: err => console.error('Failed to refresh credentials:', err)
      });
    }
    /**
     * Clear error state
     */
    clearError() {
      this._error.set(null);
    }
    /**
     * Clear all state (useful for logout)
     */
    clearState() {
      this._credentials.set([]);
      this._activeCredential.set(null);
      this._loading.set(false);
      this._error.set(null);
    }
    // ============================================================================
    // PRIVATE METHODS - Internal Helpers
    // ============================================================================
    /**
     * Group credentials by exchange
     */
    groupByExchange(credentials) {
      const grouped = new Map();
      credentials.forEach(cred => {
        const existing = grouped.get(cred.exchange) ?? [];
        grouped.set(cred.exchange, [...existing, cred]);
      });
      return grouped;
    }
    /**
     * Update internal state with new credentials
     */
    updateCredentialsState(credentials) {
      this._credentials.set(credentials);
      // Find and set active credential (if any)
      const active = credentials.find(cred => cred.isActive) ?? null;
      this._activeCredential.set(active);
    }
    /**
     * Centralized error handling
     */
    handleError(error, context) {
      console.error(`[ExchangeCredentialsService] ${context}:`, error);
      let errorMessage = 'An unexpected error occurred';
      if (error.error?.error?.message) {
        errorMessage = error.error.error.message;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested credential was not found.';
      } else if (error.status === 409) {
        errorMessage = 'A credential for this exchange and environment already exists.';
      } else if (error.status === 422) {
        errorMessage = 'Invalid data provided. Please check your input.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      this._error.set(errorMessage);
      return (0,rxjs__WEBPACK_IMPORTED_MODULE_6__.throwError)(() => new Error(errorMessage));
    }
    static {
      this.ɵfac = function ExchangeCredentialsService_Factory(t) {
        return new (t || ExchangeCredentialsService)(_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_7__.HttpClient), _angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵinject"](_exchange_environment_service__WEBPACK_IMPORTED_MODULE_1__.ExchangeEnvironmentService));
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_2__["ɵɵdefineInjectable"]({
        token: ExchangeCredentialsService,
        factory: ExchangeCredentialsService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return ExchangeCredentialsService;
})();

/***/ }),

/***/ 5731:
/*!**********************************************************!*\
  !*** ./src/app/services/exchange-environment.service.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExchangeEnvironmentService: () => (/* binding */ ExchangeEnvironmentService)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var _angular_core_rxjs_interop__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core/rxjs-interop */ 9074);
/* harmony import */ var _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/exchange-credentials.model */ 7392);




/**
 * Local storage key for persisting environment preference
 */
const STORAGE_KEY_ENVIRONMENT = 'exchange_environment';
/**
 * Service to manage global exchange environment selection (testnet/mainnet).
 *
 * This service provides:
 * - Single source of truth for environment selection
 * - Persistence via localStorage
 * - Reactive updates via Angular signals
 * - RxJS observable compatibility
 */
let ExchangeEnvironmentService = /*#__PURE__*/(() => {
  class ExchangeEnvironmentService {
    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================
    constructor() {
      // Initialize from localStorage or default to TESTNET
      const storedEnvironment = this.getStoredEnvironment();
      const initialEnvironment = storedEnvironment ?? _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET;
      // Initialize signals
      this._currentEnvironment = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.signal)(initialEnvironment);
      this.currentEnvironment = this._currentEnvironment.asReadonly();
      // Initialize computed signals
      this.isTestnet = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.computed)(() => this.currentEnvironment() === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET);
      this.isMainnet = (0,_angular_core__WEBPACK_IMPORTED_MODULE_1__.computed)(() => this.currentEnvironment() === _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET);
      // Create observable from signal for RxJS compatibility
      this.currentEnvironment$ = (0,_angular_core_rxjs_interop__WEBPACK_IMPORTED_MODULE_2__.toObservable)(this.currentEnvironment);
      console.log('[ExchangeEnvironmentService] Initialized with environment:', initialEnvironment);
    }
    // ============================================================================
    // PUBLIC METHODS - Environment Management
    // ============================================================================
    /**
     * Set the current exchange environment
     * Updates signal and persists to localStorage
     */
    setEnvironment(env) {
      if (env !== this.currentEnvironment()) {
        console.log('[ExchangeEnvironmentService] Changing environment:', this.currentEnvironment(), '→', env);
        this._currentEnvironment.set(env);
        this.persistEnvironment(env);
      }
    }
    /**
     * Toggle between TESTNET and MAINNET
     */
    toggleEnvironment() {
      const newEnv = this.isTestnet() ? _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET : _models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET;
      this.setEnvironment(newEnv);
    }
    /**
     * Get the display name for an environment
     */
    getEnvironmentDisplayName(env) {
      const displayNames = {
        [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET]: 'Testnet',
        [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET]: 'Mainnet'
      };
      return displayNames[env];
    }
    /**
     * Get the color associated with an environment (for UI styling)
     */
    getEnvironmentColor(env) {
      const colors = {
        [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET]: '#FF9800',
        // Orange
        [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET]: '#2196F3' // Blue
      };
      return colors[env];
    }
    /**
     * Get the icon name for an environment
     */
    getEnvironmentIcon(env) {
      const icons = {
        [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET]: 'science',
        [_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.MAINNET]: 'verified_user'
      };
      return icons[env];
    }
    /**
     * Clear stored environment preference
     * Resets to default (TESTNET)
     */
    clearEnvironment() {
      console.log('[ExchangeEnvironmentService] Clearing environment preference');
      localStorage.removeItem(STORAGE_KEY_ENVIRONMENT);
      this._currentEnvironment.set(_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType.TESTNET);
    }
    // ============================================================================
    // PRIVATE METHODS - Persistence
    // ============================================================================
    /**
     * Retrieve stored environment from localStorage
     */
    getStoredEnvironment() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ENVIRONMENT);
        if (stored && this.isValidEnvironment(stored)) {
          return stored;
        }
        return null;
      } catch (error) {
        console.warn('[ExchangeEnvironmentService] Failed to read from localStorage:', error);
        return null;
      }
    }
    /**
     * Persist environment to localStorage
     */
    persistEnvironment(env) {
      try {
        localStorage.setItem(STORAGE_KEY_ENVIRONMENT, env);
        console.log('[ExchangeEnvironmentService] Persisted environment:', env);
      } catch (error) {
        console.error('[ExchangeEnvironmentService] Failed to persist to localStorage:', error);
      }
    }
    /**
     * Validate if a string is a valid EnvironmentType
     */
    isValidEnvironment(value) {
      return Object.values(_models_exchange_credentials_model__WEBPACK_IMPORTED_MODULE_0__.EnvironmentType).includes(value);
    }
    static {
      this.ɵfac = function ExchangeEnvironmentService_Factory(t) {
        return new (t || ExchangeEnvironmentService)();
      };
    }
    static {
      this.ɵprov = /*@__PURE__*/_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({
        token: ExchangeEnvironmentService,
        factory: ExchangeEnvironmentService.ɵfac,
        providedIn: 'root'
      });
    }
  }
  return ExchangeEnvironmentService;
})();

/***/ }),

/***/ 6042:
/*!**************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/ReplaySubject.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReplaySubject: () => (/* binding */ ReplaySubject)
/* harmony export */ });
/* harmony import */ var _Subject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Subject */ 819);
/* harmony import */ var _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scheduler/dateTimestampProvider */ 5152);


class ReplaySubject extends _Subject__WEBPACK_IMPORTED_MODULE_0__.Subject {
  constructor(_bufferSize = Infinity, _windowTime = Infinity, _timestampProvider = _scheduler_dateTimestampProvider__WEBPACK_IMPORTED_MODULE_1__.dateTimestampProvider) {
    super();
    this._bufferSize = _bufferSize;
    this._windowTime = _windowTime;
    this._timestampProvider = _timestampProvider;
    this._buffer = [];
    this._infiniteTimeWindow = true;
    this._infiniteTimeWindow = _windowTime === Infinity;
    this._bufferSize = Math.max(1, _bufferSize);
    this._windowTime = Math.max(1, _windowTime);
  }
  next(value) {
    const {
      isStopped,
      _buffer,
      _infiniteTimeWindow,
      _timestampProvider,
      _windowTime
    } = this;
    if (!isStopped) {
      _buffer.push(value);
      !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
    }
    this._trimBuffer();
    super.next(value);
  }
  _subscribe(subscriber) {
    this._throwIfClosed();
    this._trimBuffer();
    const subscription = this._innerSubscribe(subscriber);
    const {
      _infiniteTimeWindow,
      _buffer
    } = this;
    const copy = _buffer.slice();
    for (let i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
      subscriber.next(copy[i]);
    }
    this._checkFinalizedStatuses(subscriber);
    return subscription;
  }
  _trimBuffer() {
    const {
      _bufferSize,
      _timestampProvider,
      _buffer,
      _infiniteTimeWindow
    } = this;
    const adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
    _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
    if (!_infiniteTimeWindow) {
      const now = _timestampProvider.now();
      let last = 0;
      for (let i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
        last = i;
      }
      last && _buffer.splice(0, last + 1);
    }
  }
}

/***/ }),

/***/ 5152:
/*!********************************************************************************!*\
  !*** ./node_modules/rxjs/dist/esm/internal/scheduler/dateTimestampProvider.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dateTimestampProvider: () => (/* binding */ dateTimestampProvider)
/* harmony export */ });
const dateTimestampProvider = {
  now() {
    return (dateTimestampProvider.delegate || Date).now();
  },
  delegate: undefined
};

/***/ }),

/***/ 9074:
/*!**************************************************************!*\
  !*** ./node_modules/@angular/core/fesm2022/rxjs-interop.mjs ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   outputFromObservable: () => (/* binding */ outputFromObservable),
/* harmony export */   outputToObservable: () => (/* binding */ outputToObservable),
/* harmony export */   takeUntilDestroyed: () => (/* binding */ takeUntilDestroyed),
/* harmony export */   toObservable: () => (/* binding */ toObservable),
/* harmony export */   toSignal: () => (/* binding */ toSignal)
/* harmony export */ });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ 7580);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ 3942);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ 6042);
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ 3900);
/**
 * @license Angular v18.0.1
 * (c) 2010-2024 Google LLC. https://angular.io/
 * License: MIT
 */





/**
 * Operator which completes the Observable when the calling context (component, directive, service,
 * etc) is destroyed.
 *
 * @param destroyRef optionally, the `DestroyRef` representing the current context. This can be
 *     passed explicitly to use `takeUntilDestroyed` outside of an [injection
 * context](guide/di/dependency-injection-context). Otherwise, the current `DestroyRef` is injected.
 *
 * @developerPreview
 */
function takeUntilDestroyed(destroyRef) {
  if (!destroyRef) {
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.assertInInjectionContext)(takeUntilDestroyed);
    destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_0__.DestroyRef);
  }
  const destroyed$ = new rxjs__WEBPACK_IMPORTED_MODULE_1__.Observable(observer => {
    const unregisterFn = destroyRef.onDestroy(observer.next.bind(observer));
    return unregisterFn;
  });
  return source => {
    return source.pipe((0,rxjs_operators__WEBPACK_IMPORTED_MODULE_2__.takeUntil)(destroyed$));
  };
}

/**
 * Implementation of `OutputRef` that emits values from
 * an RxJS observable source.
 *
 * @internal
 */
class OutputFromObservableRef {
  constructor(source) {
    this.source = source;
    this.destroyed = false;
    this.destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_0__.DestroyRef);
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }
  subscribe(callbackFn) {
    if (this.destroyed) {
      throw new _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵRuntimeError"](953 /* ɵRuntimeErrorCode.OUTPUT_REF_DESTROYED */, ngDevMode && 'Unexpected subscription to destroyed `OutputRef`. ' + 'The owning directive/component is destroyed.');
    }
    // Stop yielding more values when the directive/component is already destroyed.
    const subscription = this.source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: value => callbackFn(value)
    });
    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
}
/**
 * Declares an Angular output that is using an RxJS observable as a source
 * for events dispatched to parent subscribers.
 *
 * The behavior for an observable as source is defined as followed:
 *    1. New values are forwarded to the Angular output (next notifications).
 *    2. Errors notifications are not handled by Angular. You need to handle these manually.
 *       For example by using `catchError`.
 *    3. Completion notifications stop the output from emitting new values.
 *
 * @usageNotes
 * Initialize an output in your directive by declaring a
 * class field and initializing it with the `outputFromObservable()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   nameChange$ = <some-observable>;
 *   nameChange = outputFromObservable(this.nameChange$);
 * }
 * ```
 *
 * @developerPreview
 */
function outputFromObservable(observable, opts) {
  ngDevMode && (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.assertInInjectionContext)(outputFromObservable);
  return new OutputFromObservableRef(observable);
}

/**
 * Converts an Angular output declared via `output()` or `outputFromObservable()`
 * to an observable.
 *
 * You can subscribe to the output via `Observable.subscribe` then.
 *
 * @developerPreview
 */
function outputToObservable(ref) {
  const destroyRef = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵgetOutputDestroyRef"])(ref);
  return new rxjs__WEBPACK_IMPORTED_MODULE_1__.Observable(observer => {
    // Complete the observable upon directive/component destroy.
    // Note: May be `undefined` if an `EventEmitter` is declared outside
    // of an injection context.
    destroyRef?.onDestroy(() => observer.complete());
    const subscription = ref.subscribe(v => observer.next(v));
    return () => subscription.unsubscribe();
  });
}

/**
 * Exposes the value of an Angular `Signal` as an RxJS `Observable`.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 *
 * `toObservable` must be called in an injection context unless an injector is provided via options.
 *
 * @developerPreview
 */
function toObservable(source, options) {
  !options?.injector && (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.assertInInjectionContext)(toObservable);
  const injector = options?.injector ?? (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_0__.Injector);
  const subject = new rxjs__WEBPACK_IMPORTED_MODULE_3__.ReplaySubject(1);
  const watcher = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.effect)(() => {
    let value;
    try {
      value = source();
    } catch (err) {
      (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.untracked)(() => subject.error(err));
      return;
    }
    (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.untracked)(() => subject.next(value));
  }, {
    injector,
    manualCleanup: true
  });
  injector.get(_angular_core__WEBPACK_IMPORTED_MODULE_0__.DestroyRef).onDestroy(() => {
    watcher.destroy();
    subject.complete();
  });
  return subject.asObservable();
}

/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * With `requireSync` set to `true`, `toSignal` will assert that the `Observable` produces a value
 * immediately upon subscription. No `initialValue` is needed in this case, and the returned signal
 * does not include an `undefined` type.
 *
 * By default, the subscription will be automatically cleaned up when the current [injection
 * context](guide/di/dependency-injection-context) is destroyed. For example, when `toSignal` is
 * called during the construction of a component, the subscription will be cleaned up when the
 * component is destroyed. If an injection context is not available, an explicit `Injector` can be
 * passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 *
 * @developerPreview
 */
function toSignal(source, options) {
  ngDevMode && (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.assertNotInReactiveContext)(toSignal, 'Invoking `toSignal` causes new subscriptions every time. ' + 'Consider moving `toSignal` outside of the reactive context and read the signal value where needed.');
  const requiresCleanup = !options?.manualCleanup;
  requiresCleanup && !options?.injector && (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.assertInInjectionContext)(toSignal);
  const cleanupRef = requiresCleanup ? options?.injector?.get(_angular_core__WEBPACK_IMPORTED_MODULE_0__.DestroyRef) ?? (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.inject)(_angular_core__WEBPACK_IMPORTED_MODULE_0__.DestroyRef) : null;
  // Note: T is the Observable value type, and U is the initial value type. They don't have to be
  // the same - the returned signal gives values of type `T`.
  let state;
  if (options?.requireSync) {
    // Initially the signal is in a `NoValue` state.
    state = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)({
      kind: 0 /* StateKind.NoValue */
    });
  } else {
    // If an initial value was passed, use it. Otherwise, use `undefined` as the initial value.
    state = (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.signal)({
      kind: 1 /* StateKind.Value */,
      value: options?.initialValue
    });
  }
  // Note: This code cannot run inside a reactive context (see assertion above). If we'd support
  // this, we would subscribe to the observable outside of the current reactive context, avoiding
  // that side-effect signal reads/writes are attribute to the current consumer. The current
  // consumer only needs to be notified when the `state` signal changes through the observable
  // subscription. Additional context (related to async pipe):
  // https://github.com/angular/angular/pull/50522.
  const sub = source.subscribe({
    next: value => state.set({
      kind: 1 /* StateKind.Value */,
      value
    }),
    error: error => {
      if (options?.rejectErrors) {
        // Kick the error back to RxJS. It will be caught and rethrown in a macrotask, which causes
        // the error to end up as an uncaught exception.
        throw error;
      }
      state.set({
        kind: 2 /* StateKind.Error */,
        error
      });
    }
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });
  if (ngDevMode && options?.requireSync && state().kind === 0 /* StateKind.NoValue */) {
    throw new _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵRuntimeError"](601 /* ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT */, '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');
  }
  // Unsubscribe when the current context is destroyed, if requested.
  cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));
  // The actual returned signal is a `computed` of the `State` signal, which maps the various states
  // to either values or errors.
  return (0,_angular_core__WEBPACK_IMPORTED_MODULE_0__.computed)(() => {
    const current = state();
    switch (current.kind) {
      case 1 /* StateKind.Value */:
        return current.value;
      case 2 /* StateKind.Error */:
        throw current.error;
      case 0 /* StateKind.NoValue */:
        // This shouldn't really happen because the error is thrown on creation.
        // TODO(alxhub): use a RuntimeError when we finalize the error semantics
        throw new _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵRuntimeError"](601 /* ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT */, '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.');
    }
  });
}

/**
 * Generated bundle index. Do not edit.
 */



/***/ })

}]);
//# sourceMappingURL=704.js.map