# Service Class Structures - Implementation Blueprint

## Overview

This document provides detailed implementation blueprints for the two new core services: `ExchangeEnvironmentService` and `ExchangeCredentialsService`, including complete method signatures, signal definitions, and implementation patterns.

---

## 1. ExchangeEnvironmentService

### 1.1 Complete Service Interface

```typescript
import { Injectable, Signal, WritableSignal, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Environment types for cryptocurrency exchanges
 */
export enum EnvironmentType {
  TESTNET = 'TESTNET',
  MAINNET = 'MAINNET'
}

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
 *
 * @example
 * constructor(private envService: ExchangeEnvironmentService) {
 *   // React to environment changes
 *   effect(() => {
 *     const env = this.envService.currentEnvironment();
 *     console.log('Environment changed to:', env);
 *   });
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class ExchangeEnvironmentService {
  // ============================================================================
  // SIGNALS - State Management
  // ============================================================================

  /**
   * Internal writable signal for current environment
   * @private
   */
  private readonly _currentEnvironment: WritableSignal<EnvironmentType>;

  /**
   * Public readonly signal exposing current environment
   * Components should use this to react to environment changes
   */
  public readonly currentEnvironment: Signal<EnvironmentType>;

  /**
   * Computed signal indicating if current environment is testnet
   */
  public readonly isTestnet: Signal<boolean>;

  /**
   * Computed signal indicating if current environment is mainnet
   */
  public readonly isMainnet: Signal<boolean>;

  /**
   * Observable version of currentEnvironment for RxJS interoperability
   * Use this when you need to combine with other observables
   */
  public readonly currentEnvironment$: Observable<EnvironmentType>;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor() {
    // Initialize from localStorage or default to TESTNET
    const storedEnvironment = this.getStoredEnvironment();
    const initialEnvironment = storedEnvironment ?? EnvironmentType.TESTNET;

    // Initialize signals
    this._currentEnvironment = signal(initialEnvironment);
    this.currentEnvironment = this._currentEnvironment.asReadonly();

    // Initialize computed signals
    this.isTestnet = computed(() => this.currentEnvironment() === EnvironmentType.TESTNET);
    this.isMainnet = computed(() => this.currentEnvironment() === EnvironmentType.MAINNET);

    // Create observable from signal for RxJS compatibility
    this.currentEnvironment$ = toObservable(this.currentEnvironment);

    // Log initialization for debugging
    console.log('[ExchangeEnvironmentService] Initialized with environment:', initialEnvironment);
  }

  // ============================================================================
  // PUBLIC METHODS - Environment Management
  // ============================================================================

  /**
   * Set the current exchange environment
   * Updates signal and persists to localStorage
   *
   * @param env - The environment to set (TESTNET or MAINNET)
   *
   * @example
   * this.environmentService.setEnvironment(EnvironmentType.MAINNET);
   */
  public setEnvironment(env: EnvironmentType): void {
    if (env !== this.currentEnvironment()) {
      console.log('[ExchangeEnvironmentService] Changing environment:',
        this.currentEnvironment(), '→', env);

      this._currentEnvironment.set(env);
      this.persistEnvironment(env);
    }
  }

  /**
   * Toggle between TESTNET and MAINNET
   * Convenience method for switching environments
   *
   * @example
   * // If current is TESTNET, switches to MAINNET (and vice versa)
   * this.environmentService.toggleEnvironment();
   */
  public toggleEnvironment(): void {
    const newEnv = this.isTestnet()
      ? EnvironmentType.MAINNET
      : EnvironmentType.TESTNET;

    this.setEnvironment(newEnv);
  }

  /**
   * Get the display name for an environment
   *
   * @param env - The environment type
   * @returns User-friendly display name
   *
   * @example
   * this.getEnvironmentDisplayName(EnvironmentType.TESTNET); // Returns "Testnet"
   */
  public getEnvironmentDisplayName(env: EnvironmentType): string {
    const displayNames: Record<EnvironmentType, string> = {
      [EnvironmentType.TESTNET]: 'Testnet',
      [EnvironmentType.MAINNET]: 'Mainnet'
    };
    return displayNames[env];
  }

  /**
   * Get the color associated with an environment (for UI styling)
   *
   * @param env - The environment type
   * @returns CSS color code
   *
   * @example
   * this.getEnvironmentColor(EnvironmentType.TESTNET); // Returns "#FF9800" (orange)
   */
  public getEnvironmentColor(env: EnvironmentType): string {
    const colors: Record<EnvironmentType, string> = {
      [EnvironmentType.TESTNET]: '#FF9800',  // Orange - warning/caution
      [EnvironmentType.MAINNET]: '#2196F3'   // Blue - production/trust
    };
    return colors[env];
  }

  /**
   * Get the icon name for an environment (if using icon library)
   *
   * @param env - The environment type
   * @returns Icon name string
   */
  public getEnvironmentIcon(env: EnvironmentType): string {
    const icons: Record<EnvironmentType, string> = {
      [EnvironmentType.TESTNET]: 'science',      // Material Icons: science/experiment
      [EnvironmentType.MAINNET]: 'verified_user' // Material Icons: verified/production
    };
    return icons[env];
  }

  /**
   * Clear stored environment preference
   * Resets to default (TESTNET)
   *
   * @example
   * this.environmentService.clearEnvironment();
   */
  public clearEnvironment(): void {
    console.log('[ExchangeEnvironmentService] Clearing environment preference');
    localStorage.removeItem(STORAGE_KEY_ENVIRONMENT);
    this._currentEnvironment.set(EnvironmentType.TESTNET);
  }

  // ============================================================================
  // PRIVATE METHODS - Persistence
  // ============================================================================

  /**
   * Retrieve stored environment from localStorage
   * @private
   * @returns Stored environment or null if not found/invalid
   */
  private getStoredEnvironment(): EnvironmentType | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENVIRONMENT);

      if (stored && this.isValidEnvironment(stored)) {
        return stored as EnvironmentType;
      }

      return null;
    } catch (error) {
      console.warn('[ExchangeEnvironmentService] Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * Persist environment to localStorage
   * @private
   * @param env - Environment to persist
   */
  private persistEnvironment(env: EnvironmentType): void {
    try {
      localStorage.setItem(STORAGE_KEY_ENVIRONMENT, env);
      console.log('[ExchangeEnvironmentService] Persisted environment:', env);
    } catch (error) {
      console.error('[ExchangeEnvironmentService] Failed to persist to localStorage:', error);
    }
  }

  /**
   * Validate if a string is a valid EnvironmentType
   * @private
   * @param value - Value to validate
   * @returns true if valid environment type
   */
  private isValidEnvironment(value: string): value is EnvironmentType {
    return Object.values(EnvironmentType).includes(value as EnvironmentType);
  }
}
```

### 1.2 Usage Examples

```typescript
// ============================================================================
// Example 1: Component reacting to environment changes
// ============================================================================

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="environment-indicator" [style.background-color]="environmentColor()">
      {{ environmentName() }}
    </div>
  `
})
export class DashboardComponent {
  protected readonly currentEnvironment: Signal<EnvironmentType>;
  protected readonly environmentName: Signal<string>;
  protected readonly environmentColor: Signal<string>;

  constructor(private environmentService: ExchangeEnvironmentService) {
    this.currentEnvironment = this.environmentService.currentEnvironment;

    this.environmentName = computed(() =>
      this.environmentService.getEnvironmentDisplayName(this.currentEnvironment())
    );

    this.environmentColor = computed(() =>
      this.environmentService.getEnvironmentColor(this.currentEnvironment())
    );
  }
}

// ============================================================================
// Example 2: Service reacting to environment changes
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class TradingService {
  constructor(private environmentService: ExchangeEnvironmentService) {
    // Effect runs whenever environment changes
    effect(() => {
      const env = this.environmentService.currentEnvironment();
      console.log('Trading service detected environment change:', env);
      this.invalidateCache();
      this.reconnectWebSocket();
    });
  }

  private invalidateCache(): void {
    // Clear cached data when environment changes
  }

  private reconnectWebSocket(): void {
    // Reconnect to appropriate WebSocket endpoint
  }
}

// ============================================================================
// Example 3: Using with RxJS streams
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(
    private http: HttpClient,
    private environmentService: ExchangeEnvironmentService
  ) {}

  fetchData(): Observable<any> {
    return this.environmentService.currentEnvironment$.pipe(
      switchMap(env => {
        const url = this.getUrlForEnvironment(env);
        return this.http.get(url);
      })
    );
  }

  private getUrlForEnvironment(env: EnvironmentType): string {
    return env === EnvironmentType.TESTNET
      ? '/api/testnet/data'
      : '/api/mainnet/data';
  }
}
```

---

## 2. ExchangeCredentialsService

### 2.1 Complete Service Interface

```typescript
import { Injectable, Signal, WritableSignal, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { getEndpointUrl, getParameterizedUrl } from '../config/app.config';
import { ExchangeEnvironmentService, EnvironmentType } from './exchange-environment.service';
import {
  ExchangeCredential,
  ExchangeType,
  CreateExchangeCredentialRequest,
  UpdateExchangeCredentialRequest,
  ExchangeCredentialResponse,
  ExchangeCredentialsListResponse,
  TestConnectionRequest,
  TestConnectionResponse
} from '../models/exchange-credentials.models';

/**
 * Service to manage exchange credentials for multiple exchanges and environments.
 *
 * This service provides:
 * - CRUD operations for exchange credentials
 * - Connection testing
 * - Active credential management
 * - Environment-aware state synchronization
 * - Reactive state via Angular signals
 *
 * State automatically updates when environment changes.
 *
 * @example
 * constructor(private credService: ExchangeCredentialsService) {
 *   // Access credentials
 *   const creds = this.credService.credentials();
 *
 *   // Check if user has credentials
 *   if (this.credService.hasCredentials()) {
 *     console.log('User has configured credentials');
 *   }
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class ExchangeCredentialsService {
  // ============================================================================
  // SIGNALS - State Management
  // ============================================================================

  /**
   * Internal writable signal for credentials list
   * @private
   */
  private readonly _credentials = signal<ExchangeCredential[]>([]);

  /**
   * Public readonly signal exposing all credentials
   * Automatically updated when environment changes
   */
  public readonly credentials = this._credentials.asReadonly();

  /**
   * Internal writable signal for active credential
   * @private
   */
  private readonly _activeCredential = signal<ExchangeCredential | null>(null);

  /**
   * Public readonly signal exposing currently active credential
   */
  public readonly activeCredential = this._activeCredential.asReadonly();

  /**
   * Internal writable signal for loading state
   * @private
   */
  private readonly _loading = signal<boolean>(false);

  /**
   * Public readonly signal for loading state
   * True during async operations
   */
  public readonly loading = this._loading.asReadonly();

  /**
   * Internal writable signal for error state
   * @private
   */
  private readonly _error = signal<string | null>(null);

  /**
   * Public readonly signal for error messages
   * Null when no error
   */
  public readonly error = this._error.asReadonly();

  // ============================================================================
  // COMPUTED SIGNALS - Derived State
  // ============================================================================

  /**
   * Computed signal indicating if user has any credentials
   */
  public readonly hasCredentials = computed(() => this.credentials().length > 0);

  /**
   * Computed signal for the currently active exchange type
   * Null if no active credential
   */
  public readonly activeExchange = computed(() =>
    this.activeCredential()?.exchange ?? null
  );

  /**
   * Computed signal grouping credentials by exchange
   * Returns Map<ExchangeType, ExchangeCredential[]>
   */
  public readonly credentialsByExchange = computed(() =>
    this.groupByExchange(this.credentials())
  );

  /**
   * Computed signal counting credentials per exchange
   * Returns Map<ExchangeType, number>
   */
  public readonly credentialCountByExchange = computed(() => {
    const grouped = this.credentialsByExchange();
    const counts = new Map<ExchangeType, number>();

    grouped.forEach((creds, exchange) => {
      counts.set(exchange, creds.length);
    });

    return counts;
  });

  /**
   * Computed signal for available exchanges (exchanges with at least one credential)
   * Returns ExchangeType[]
   */
  public readonly availableExchanges = computed(() =>
    Array.from(this.credentialsByExchange().keys())
  );

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private http: HttpClient,
    private environmentService: ExchangeEnvironmentService
  ) {
    // React to environment changes - refetch credentials
    effect(() => {
      const env = this.environmentService.currentEnvironment();
      console.log('[ExchangeCredentialsService] Environment changed to:', env);
      this.fetchCredentials().subscribe({
        error: (err) => console.error('Failed to fetch credentials after environment change:', err)
      });
    });

    // Initial fetch
    this.fetchCredentials().subscribe();
  }

  // ============================================================================
  // PUBLIC METHODS - CRUD Operations
  // ============================================================================

  /**
   * Fetch all credentials from the backend
   * Automatically filters by current environment
   *
   * @returns Observable<ExchangeCredential[]>
   *
   * @example
   * this.credentialsService.fetchCredentials().subscribe({
   *   next: (credentials) => console.log('Fetched credentials:', credentials),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  public fetchCredentials(): Observable<ExchangeCredential[]> {
    this._loading.set(true);
    this._error.set(null);

    const url = getEndpointUrl('exchangeCredentials', 'list');
    const env = this.environmentService.currentEnvironment();

    return this.http.get<ExchangeCredentialsListResponse>(url, {
      params: { environment: env }
    }).pipe(
      tap(response => {
        console.log('[ExchangeCredentialsService] Fetched credentials:', response.data.credentials.length);
        this.updateCredentialsState(response.data.credentials);
        this._loading.set(false);
      }),
      map(response => response.data.credentials),
      catchError(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to fetch credentials');
      })
    );
  }

  /**
   * Get a single credential by ID
   *
   * @param id - Credential ID
   * @returns Observable<ExchangeCredential>
   *
   * @example
   * this.credentialsService.getCredentialById('cred_123').subscribe({
   *   next: (credential) => console.log('Credential:', credential)
   * });
   */
  public getCredentialById(id: string): Observable<ExchangeCredential> {
    this._loading.set(true);
    this._error.set(null);

    const url = getParameterizedUrl('exchangeCredentials', 'getById', { id });

    return this.http.get<ExchangeCredentialResponse>(url).pipe(
      tap(() => this._loading.set(false)),
      map(response => response.data),
      catchError(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to fetch credential');
      })
    );
  }

  /**
   * Create a new exchange credential
   * Backend validates credentials before storing
   *
   * @param data - Credential creation data
   * @returns Observable<ExchangeCredential>
   *
   * @example
   * const data: CreateExchangeCredentialRequest = {
   *   exchange: ExchangeType.BYBIT,
   *   environment: EnvironmentType.TESTNET,
   *   apiKey: 'your-api-key',
   *   apiSecret: 'your-api-secret',
   *   label: 'My Trading Account'
   * };
   *
   * this.credentialsService.createCredential(data).subscribe({
   *   next: (credential) => console.log('Created:', credential),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  public createCredential(data: CreateExchangeCredentialRequest): Observable<ExchangeCredential> {
    this._loading.set(true);
    this._error.set(null);

    const url = getEndpointUrl('exchangeCredentials', 'create');

    return this.http.post<ExchangeCredentialResponse>(url, data).pipe(
      tap(response => {
        console.log('[ExchangeCredentialsService] Created credential:', response.data.id);

        // Add new credential to existing list
        const updatedCredentials = [...this.credentials(), response.data];
        this._credentials.set(updatedCredentials);

        this._loading.set(false);
      }),
      map(response => response.data),
      catchError(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to create credential');
      })
    );
  }

  /**
   * Update an existing credential (label only)
   * API keys cannot be updated - must delete and recreate
   *
   * @param id - Credential ID
   * @param data - Update data
   * @returns Observable<ExchangeCredential>
   *
   * @example
   * this.credentialsService.updateCredential('cred_123', {
   *   label: 'Updated Label'
   * }).subscribe();
   */
  public updateCredential(
    id: string,
    data: UpdateExchangeCredentialRequest
  ): Observable<ExchangeCredential> {
    this._loading.set(true);
    this._error.set(null);

    const url = getParameterizedUrl('exchangeCredentials', 'update', { id });

    return this.http.patch<ExchangeCredentialResponse>(url, data).pipe(
      tap(response => {
        console.log('[ExchangeCredentialsService] Updated credential:', id);

        // Update credential in list
        const updatedCredentials = this.credentials().map(cred =>
          cred.id === id ? response.data : cred
        );
        this._credentials.set(updatedCredentials);

        // Update active credential if it was updated
        if (this.activeCredential()?.id === id) {
          this._activeCredential.set(response.data);
        }

        this._loading.set(false);
      }),
      map(response => response.data),
      catchError(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to update credential');
      })
    );
  }

  /**
   * Delete a credential
   *
   * @param id - Credential ID
   * @returns Observable<void>
   *
   * @example
   * this.credentialsService.deleteCredential('cred_123').subscribe({
   *   next: () => console.log('Deleted successfully'),
   *   error: (error) => console.error('Error:', error)
   * });
   */
  public deleteCredential(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    const url = getParameterizedUrl('exchangeCredentials', 'delete', { id });

    return this.http.delete<{ success: boolean }>(url).pipe(
      tap(() => {
        console.log('[ExchangeCredentialsService] Deleted credential:', id);

        // Remove credential from list
        const updatedCredentials = this.credentials().filter(cred => cred.id !== id);
        this._credentials.set(updatedCredentials);

        // Clear active credential if it was deleted
        if (this.activeCredential()?.id === id) {
          this._activeCredential.set(null);
        }

        this._loading.set(false);
      }),
      map(() => undefined),
      catchError(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to delete credential');
      })
    );
  }

  /**
   * Activate a credential (set as active for its exchange)
   * Only one credential per exchange can be active at a time
   *
   * @param id - Credential ID
   * @returns Observable<ExchangeCredential>
   *
   * @example
   * this.credentialsService.activateCredential('cred_123').subscribe({
   *   next: (credential) => console.log('Activated:', credential)
   * });
   */
  public activateCredential(id: string): Observable<ExchangeCredential> {
    this._loading.set(true);
    this._error.set(null);

    const url = getParameterizedUrl('exchangeCredentials', 'activate', { id });

    return this.http.post<ExchangeCredentialResponse>(url, {}).pipe(
      tap(response => {
        console.log('[ExchangeCredentialsService] Activated credential:', id);

        // Update credentials list: deactivate others of same exchange, activate this one
        const activatedExchange = response.data.exchange;
        const updatedCredentials = this.credentials().map(cred => {
          if (cred.id === id) {
            return { ...cred, isActive: true };
          } else if (cred.exchange === activatedExchange && cred.isActive) {
            return { ...cred, isActive: false };
          }
          return cred;
        });
        this._credentials.set(updatedCredentials);

        // Set as active credential
        this._activeCredential.set(response.data);

        this._loading.set(false);
      }),
      map(response => response.data),
      catchError(error => {
        this._loading.set(false);
        return this.handleError(error, 'Failed to activate credential');
      })
    );
  }

  // ============================================================================
  // PUBLIC METHODS - Utility Functions
  // ============================================================================

  /**
   * Test credential connection before saving
   * Validates API keys with exchange API
   *
   * @param data - Test connection request data
   * @returns Observable<TestConnectionResponse>
   *
   * @example
   * const testData: TestConnectionRequest = {
   *   exchange: ExchangeType.BYBIT,
   *   environment: EnvironmentType.TESTNET,
   *   apiKey: 'your-api-key',
   *   apiSecret: 'your-api-secret'
   * };
   *
   * this.credentialsService.testConnection(testData).subscribe({
   *   next: (result) => {
   *     if (result.success) {
   *       console.log('Connection successful!', result.accountPreview);
   *     }
   *   }
   * });
   */
  public testConnection(data: TestConnectionRequest): Observable<TestConnectionResponse> {
    this._error.set(null);

    const url = getEndpointUrl('exchangeCredentials', 'testConnection');

    return this.http.post<TestConnectionResponse>(url, data).pipe(
      tap(response => {
        console.log('[ExchangeCredentialsService] Connection test result:', response.success);
      }),
      catchError(error => {
        return this.handleError(error, 'Failed to test connection');
      })
    );
  }

  /**
   * Get all credentials for a specific exchange
   *
   * @param exchange - Exchange type
   * @returns Array of credentials for that exchange
   *
   * @example
   * const bybitCreds = this.credentialsService.getCredentialsForExchange(ExchangeType.BYBIT);
   */
  public getCredentialsForExchange(exchange: ExchangeType): ExchangeCredential[] {
    return this.credentials().filter(cred => cred.exchange === exchange);
  }

  /**
   * Get active credential for a specific exchange
   *
   * @param exchange - Exchange type
   * @returns Active credential or null
   *
   * @example
   * const activeBinance = this.credentialsService.getActiveCredentialForExchange(ExchangeType.BINANCE);
   */
  public getActiveCredentialForExchange(exchange: ExchangeType): ExchangeCredential | null {
    return this.credentials().find(cred => cred.exchange === exchange && cred.isActive) ?? null;
  }

  /**
   * Check if user has credentials for a specific exchange
   *
   * @param exchange - Exchange type
   * @returns True if user has at least one credential for the exchange
   */
  public hasCredentialsForExchange(exchange: ExchangeType): boolean {
    return this.credentials().some(cred => cred.exchange === exchange);
  }

  /**
   * Refresh credentials (re-fetch from backend)
   *
   * @example
   * this.credentialsService.refreshCredentials();
   */
  public refreshCredentials(): void {
    this.fetchCredentials().subscribe({
      error: (err) => console.error('Failed to refresh credentials:', err)
    });
  }

  /**
   * Clear error state
   *
   * @example
   * this.credentialsService.clearError();
   */
  public clearError(): void {
    this._error.set(null);
  }

  /**
   * Clear all state (useful for logout)
   *
   * @example
   * this.credentialsService.clearState();
   */
  public clearState(): void {
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
   * @private
   */
  private groupByExchange(credentials: ExchangeCredential[]): Map<ExchangeType, ExchangeCredential[]> {
    const grouped = new Map<ExchangeType, ExchangeCredential[]>();

    credentials.forEach(cred => {
      const existing = grouped.get(cred.exchange) ?? [];
      grouped.set(cred.exchange, [...existing, cred]);
    });

    return grouped;
  }

  /**
   * Update internal state with new credentials
   * Finds and sets active credential
   * @private
   */
  private updateCredentialsState(credentials: ExchangeCredential[]): void {
    this._credentials.set(credentials);

    // Find and set active credential (if any)
    const active = credentials.find(cred => cred.isActive) ?? null;
    this._activeCredential.set(active);
  }

  /**
   * Centralized error handling
   * @private
   */
  private handleError(error: HttpErrorResponse, context: string): Observable<never> {
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
    return throwError(() => new Error(errorMessage));
  }
}
```

### 2.2 Usage Examples

```typescript
// ============================================================================
// Example 1: List component displaying credentials
// ============================================================================

@Component({
  selector: 'app-credentials-list',
  standalone: true,
  template: `
    <div *ngIf="loading()">Loading credentials...</div>
    <div *ngIf="error()" class="error">{{ error() }}</div>

    <div *ngIf="!loading() && hasCredentials()">
      <h3>Available Exchanges</h3>
      <ul>
        <li *ngFor="let exchange of availableExchanges()">
          {{ exchange }}: {{ getCountForExchange(exchange) }} credential(s)
        </li>
      </ul>
    </div>

    <div *ngIf="!loading() && !hasCredentials()">
      <p>No credentials configured.</p>
      <button (click)="addCredential()">Add First Credential</button>
    </div>
  `
})
export class CredentialsListComponent {
  protected readonly credentials: Signal<ExchangeCredential[]>;
  protected readonly loading: Signal<boolean>;
  protected readonly error: Signal<string | null>;
  protected readonly hasCredentials: Signal<boolean>;
  protected readonly availableExchanges: Signal<ExchangeType[]>;

  constructor(private credentialsService: ExchangeCredentialsService) {
    this.credentials = this.credentialsService.credentials;
    this.loading = this.credentialsService.loading;
    this.error = this.credentialsService.error;
    this.hasCredentials = this.credentialsService.hasCredentials;
    this.availableExchanges = this.credentialsService.availableExchanges;
  }

  getCountForExchange(exchange: ExchangeType): number {
    return this.credentialsService.getCredentialsForExchange(exchange).length;
  }

  addCredential(): void {
    // Navigate to add credential form
  }
}

// ============================================================================
// Example 2: Form component creating credential
// ============================================================================

@Component({
  selector: 'app-credential-form',
  standalone: true,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <select formControlName="exchange">
        <option value="BYBIT">Bybit</option>
        <option value="BINANCE">Binance</option>
      </select>

      <input formControlName="apiKey" placeholder="API Key" />
      <input formControlName="apiSecret" type="password" placeholder="API Secret" />

      <button type="button" (click)="testConnection()" [disabled]="testingConnection()">
        Test Connection
      </button>

      <div *ngIf="testResult()">
        <div *ngIf="testResult()!.success" class="success">
          Connection successful! Balance: {{ testResult()!.accountPreview?.totalBalance }}
        </div>
        <div *ngIf="!testResult()!.success" class="error">
          Connection failed: {{ testResult()!.message }}
        </div>
      </div>

      <button type="submit" [disabled]="loading() || form.invalid">
        Save Credential
      </button>
    </form>
  `
})
export class CredentialFormComponent {
  protected readonly form: FormGroup;
  protected readonly loading: Signal<boolean>;
  protected readonly testingConnection = signal(false);
  protected readonly testResult = signal<TestConnectionResponse | null>(null);

  constructor(
    private fb: FormBuilder,
    private credentialsService: ExchangeCredentialsService,
    private environmentService: ExchangeEnvironmentService
  ) {
    this.loading = this.credentialsService.loading;

    this.form = this.fb.group({
      exchange: ['BYBIT', Validators.required],
      apiKey: ['', [Validators.required, Validators.minLength(20)]],
      apiSecret: ['', [Validators.required, Validators.minLength(20)]],
      label: ['']
    });
  }

  testConnection(): void {
    if (this.form.invalid) return;

    this.testingConnection.set(true);
    this.testResult.set(null);

    const testData: TestConnectionRequest = {
      exchange: this.form.value.exchange,
      environment: this.environmentService.currentEnvironment(),
      apiKey: this.form.value.apiKey,
      apiSecret: this.form.value.apiSecret
    };

    this.credentialsService.testConnection(testData).subscribe({
      next: (result) => {
        this.testResult.set(result);
        this.testingConnection.set(false);
      },
      error: (error) => {
        this.testResult.set({
          success: false,
          message: error.message,
          testnet: false,
          timestamp: new Date().toISOString()
        });
        this.testingConnection.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const data: CreateExchangeCredentialRequest = {
      exchange: this.form.value.exchange,
      environment: this.environmentService.currentEnvironment(),
      apiKey: this.form.value.apiKey,
      apiSecret: this.form.value.apiSecret,
      label: this.form.value.label || undefined
    };

    this.credentialsService.createCredential(data).subscribe({
      next: (credential) => {
        console.log('Credential created:', credential);
        // Navigate back to list
      },
      error: (error) => {
        console.error('Failed to create credential:', error);
      }
    });
  }
}

// ============================================================================
// Example 3: Trading service using credentials
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class BybitTradingService {
  constructor(private credentialsService: ExchangeCredentialsService) {
    // React when active Bybit credential changes
    effect(() => {
      const activeBybit = this.credentialsService.getActiveCredentialForExchange(ExchangeType.BYBIT);
      if (activeBybit) {
        console.log('Active Bybit credential:', activeBybit.apiKeyPreview);
        this.reconnectWithNewCredentials();
      } else {
        console.log('No active Bybit credential');
        this.disconnect();
      }
    });
  }

  private reconnectWithNewCredentials(): void {
    // Reconnect to Bybit with new active credential
  }

  private disconnect(): void {
    // Disconnect from Bybit
  }
}
```

---

## 3. Service Integration Patterns

### 3.1 Service-to-Service Communication

```typescript
// Pattern: Service A reacts to Service B's state changes

@Injectable({ providedIn: 'root' })
export class ServiceA {
  constructor(private serviceB: ServiceB) {
    // Use effect to react to signal changes
    effect(() => {
      const value = this.serviceB.someSignal();
      console.log('ServiceA detected change in ServiceB:', value);
      this.handleChange(value);
    });
  }

  private handleChange(value: any): void {
    // React to change
  }
}
```

### 3.2 Component Consuming Multiple Services

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true
})
export class DashboardComponent {
  // Expose signals from multiple services
  protected readonly currentEnvironment: Signal<EnvironmentType>;
  protected readonly credentials: Signal<ExchangeCredential[]>;
  protected readonly hasCredentials: Signal<boolean>;

  // Computed signal combining data from multiple services
  protected readonly dashboardStatus = computed(() => {
    const env = this.currentEnvironment();
    const hasCreds = this.hasCredentials();

    if (!hasCreds) return 'No credentials configured';
    return `Connected to ${env} with ${this.credentials().length} credential(s)`;
  });

  constructor(
    private environmentService: ExchangeEnvironmentService,
    private credentialsService: ExchangeCredentialsService
  ) {
    this.currentEnvironment = this.environmentService.currentEnvironment;
    this.credentials = this.credentialsService.credentials;
    this.hasCredentials = this.credentialsService.hasCredentials;
  }
}
```

### 3.3 Error Handling Pattern

```typescript
// Consistent error handling across all services

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  protected handleError(error: HttpErrorResponse, context: string): Observable<never> {
    console.error(`[${this.constructor.name}] ${context}:`, error);

    let errorMessage = 'An unexpected error occurred';

    // Extract error message from various formats
    if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      // Map HTTP status codes to user-friendly messages
      errorMessage = this.getErrorMessageForStatus(error.status);
    }

    // Set error in service state
    if (this._error) {
      this._error.set(errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }

  private getErrorMessageForStatus(status: number): string {
    const messages: Record<number, string> = {
      0: 'Unable to connect to server. Please check your internet connection.',
      401: 'Authentication failed. Please log in again.',
      403: 'You do not have permission to perform this action.',
      404: 'Resource not found.',
      409: 'Resource already exists.',
      422: 'Invalid data provided. Please check your input.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.'
    };

    return messages[status] || `An error occurred (${status})`;
  }
}
```

---

## 4. Testing Strategies

### 4.1 Service Unit Test Template

```typescript
describe('ExchangeCredentialsService', () => {
  let service: ExchangeCredentialsService;
  let httpMock: HttpTestingController;
  let environmentService: ExchangeEnvironmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ExchangeCredentialsService,
        ExchangeEnvironmentService
      ]
    });

    service = TestBed.inject(ExchangeCredentialsService);
    httpMock = TestBed.inject(HttpTestingController);
    environmentService = TestBed.inject(ExchangeEnvironmentService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch credentials successfully', () => {
    const mockCredentials: ExchangeCredential[] = [
      {
        id: 'cred_1',
        userId: 'user_1',
        exchange: ExchangeType.BYBIT,
        environment: EnvironmentType.TESTNET,
        apiKeyPreview: '****1234',
        isActive: true,
        createdAt: '2025-10-01T12:00:00Z',
        updatedAt: '2025-10-01T12:00:00Z'
      }
    ];

    service.fetchCredentials().subscribe({
      next: (credentials) => {
        expect(credentials).toEqual(mockCredentials);
        expect(service.credentials()).toEqual(mockCredentials);
        expect(service.hasCredentials()).toBe(true);
      }
    });

    const req = httpMock.expectOne((request) =>
      request.url.includes('/exchange-credentials')
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: { credentials: mockCredentials, totalCount: 1 },
      timestamp: '2025-10-01T12:00:00Z'
    });
  });

  it('should handle fetch error', () => {
    service.fetchCredentials().subscribe({
      error: (error) => {
        expect(error.message).toContain('Failed to fetch credentials');
        expect(service.error()).toBeTruthy();
      }
    });

    const req = httpMock.expectOne((request) =>
      request.url.includes('/exchange-credentials')
    );
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should create credential successfully', () => {
    const createRequest: CreateExchangeCredentialRequest = {
      exchange: ExchangeType.BYBIT,
      environment: EnvironmentType.TESTNET,
      apiKey: 'test-api-key',
      apiSecret: 'test-api-secret',
      label: 'Test Account'
    };

    const mockCredential: ExchangeCredential = {
      id: 'cred_1',
      userId: 'user_1',
      exchange: createRequest.exchange,
      environment: createRequest.environment,
      apiKeyPreview: '****key',
      label: createRequest.label,
      isActive: false,
      createdAt: '2025-10-01T12:00:00Z',
      updatedAt: '2025-10-01T12:00:00Z'
    };

    service.createCredential(createRequest).subscribe({
      next: (credential) => {
        expect(credential).toEqual(mockCredential);
        expect(service.credentials()).toContain(mockCredential);
      }
    });

    const req = httpMock.expectOne('/api/exchange-credentials');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createRequest);
    req.flush({
      success: true,
      data: mockCredential,
      timestamp: '2025-10-01T12:00:00Z'
    });
  });

  it('should refetch credentials when environment changes', fakeAsync(() => {
    const mockTestnetCreds: ExchangeCredential[] = [/* testnet creds */];
    const mockMainnetCreds: ExchangeCredential[] = [/* mainnet creds */];

    // Initial fetch for TESTNET
    service.fetchCredentials().subscribe();
    tick();

    let req = httpMock.expectOne((r) => r.url.includes('/exchange-credentials'));
    req.flush({ success: true, data: { credentials: mockTestnetCreds, totalCount: 1 }, timestamp: '' });
    tick();

    expect(service.credentials()).toEqual(mockTestnetCreds);

    // Change environment
    environmentService.setEnvironment(EnvironmentType.MAINNET);
    tick();

    // Should trigger refetch
    req = httpMock.expectOne((r) => r.url.includes('/exchange-credentials'));
    expect(req.request.params.get('environment')).toBe(EnvironmentType.MAINNET);
    req.flush({ success: true, data: { credentials: mockMainnetCreds, totalCount: 1 }, timestamp: '' });
    tick();

    expect(service.credentials()).toEqual(mockMainnetCreds);
  }));
});
```

---

## 5. Performance Optimization

### 5.1 Memoization Pattern

```typescript
// For expensive computations in services

@Injectable({ providedIn: 'root' })
export class ExchangeCredentialsService {
  // Cache expensive computations
  private readonly _memoizedGrouping = computed(() => {
    // This computation only runs when credentials() changes
    return this.groupByExchange(this.credentials());
  });

  public readonly credentialsByExchange = this._memoizedGrouping;
}
```

### 5.2 Debouncing API Calls

```typescript
// For search/filter operations

@Component({
  selector: 'app-credentials-search'
})
export class CredentialsSearchComponent {
  private searchSubject = new Subject<string>();

  constructor(private credentialsService: ExchangeCredentialsService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.performSearch(query))
    ).subscribe();
  }

  onSearchInput(query: string): void {
    this.searchSubject.next(query);
  }

  private performSearch(query: string): Observable<any> {
    // Perform search
    return of([]);
  }
}
```

---

## Summary

This document provides complete, production-ready implementations for both core services. Key features:

1. **ExchangeEnvironmentService**:
   - Simple, focused responsibility
   - Persistent storage
   - Signal-based reactivity
   - RxJS compatibility

2. **ExchangeCredentialsService**:
   - Comprehensive CRUD operations
   - Environment-aware state management
   - Rich computed signals
   - Robust error handling
   - Automatic synchronization

Both services are:
- Fully type-safe
- Thoroughly documented
- Ready for testing
- Performance-optimized
- Following Angular best practices

The implementation patterns shown here should be followed by the UI component implementation team to ensure consistency across the application.
