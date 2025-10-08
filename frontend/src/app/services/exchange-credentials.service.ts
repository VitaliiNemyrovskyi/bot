import { Injectable, Signal, WritableSignal, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, take, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { getEndpointUrl, getParameterizedUrl } from '../config/app.config';
import { ExchangeEnvironmentService } from './exchange-environment.service';
import {
  ExchangeCredential,
  ExchangeType,
  CreateExchangeCredentialRequest,
  UpdateExchangeCredentialRequest,
  ExchangeCredentialResponse,
  ExchangeCredentialsListResponse,
  TestConnectionRequest,
  TestConnectionResponse
} from '../models/exchange-credentials.model';

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
@Injectable({
  providedIn: 'root'
})
export class ExchangeCredentialsService {
  // ============================================================================
  // SIGNALS - State Management
  // ============================================================================

  private readonly _credentials = signal<ExchangeCredential[]>([]);
  public readonly credentials = this._credentials.asReadonly();

  private readonly _activeCredential = signal<ExchangeCredential | null>(null);
  public readonly activeCredential = this._activeCredential.asReadonly();

  private readonly _loading = signal<boolean>(false);
  public readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  public readonly error = this._error.asReadonly();

  // ============================================================================
  // COMPUTED SIGNALS - Derived State
  // ============================================================================

  public readonly hasCredentials = computed(() => this.credentials().length > 0);

  public readonly activeExchange = computed(() =>
    this.activeCredential()?.exchange ?? null
  );

  public readonly credentialsByExchange = computed(() =>
    this.groupByExchange(this.credentials())
  );

  public readonly credentialCountByExchange = computed(() => {
    const grouped = this.credentialsByExchange();
    const counts = new Map<ExchangeType, number>();

    grouped.forEach((creds, exchange) => {
      counts.set(exchange, creds.length);
    });

    return counts;
  });

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
  public fetchCredentials(): Observable<ExchangeCredential[]> {
    this._loading.set(true);
    this._error.set(null);

    const url = getEndpointUrl('exchangeCredentials', 'list');

    return this.http.get<ExchangeCredentialsListResponse>(url).pipe(
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
   */
  public getCredentialById(id: string): Observable<ExchangeCredential> {
    this._error.set(null);

    const url = getParameterizedUrl('exchangeCredentials', 'getById', { id });

    return this.http.get<ExchangeCredentialResponse>(url).pipe(
      map(response => response.data),
      catchError(error => {
        return this.handleError(error, 'Failed to fetch credential');
      })
    );
  }

  /**
   * Create a new exchange credential
   */
  public createCredential(data: CreateExchangeCredentialRequest): Observable<ExchangeCredential> {
    this._error.set(null);

    const url = getEndpointUrl('exchangeCredentials', 'create');

    return this.http.post<ExchangeCredentialResponse>(url, data).pipe(
      tap(response => {
        console.log('[ExchangeCredentialsService] Created credential:', response.data.id);

        // Add new credential to existing list
        const updatedCredentials = [...this.credentials(), response.data];
        this._credentials.set(updatedCredentials);
      }),
      map(response => response.data),
      catchError(error => {
        return this.handleError(error, 'Failed to create credential');
      })
    );
  }

  /**
   * Update an existing credential (label, apiKey, apiSecret, isActive)
   * Note: isActive is just a boolean flag - no automatic deactivation of other credentials
   */
  public updateCredential(
    id: string,
    data: UpdateExchangeCredentialRequest
  ): Observable<ExchangeCredential> {
    this._error.set(null);

    const url = getParameterizedUrl('exchangeCredentials', 'update', { id });

    return this.http.patch<ExchangeCredentialResponse>(url, data).pipe(
      tap(response => {
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
      }),
      map(response => response.data),
      catchError(error => {
        return this.handleError(error, 'Failed to update credential');
      })
    );
  }

  /**
   * Delete a credential
   */
  public deleteCredential(id: string): Observable<void> {
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
      }),
      map(() => undefined),
      catchError(error => {
        return this.handleError(error, 'Failed to delete credential');
      })
    );
  }

  /**
   * Activate a credential (set as active for its exchange and environment)
   * This now uses updateCredential with isActive: true
   */
  public activateCredential(id: string): Observable<ExchangeCredential> {
    return this.updateCredential(id, { isActive: true });
  }

  // ============================================================================
  // PUBLIC METHODS - Utility Functions
  // ============================================================================

  /**
   * Test credential connection before saving
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
   */
  public getCredentialsForExchange(exchange: ExchangeType): ExchangeCredential[] {
    return this.credentials().filter(cred => cred.exchange === exchange);
  }

  /**
   * Get active credential for a specific exchange
   */
  public getActiveCredentialForExchange(exchange: ExchangeType): ExchangeCredential | null {
    return this.credentials().find(cred => cred.exchange === exchange && cred.isActive) ?? null;
  }

  /**
   * Check if user has credentials for a specific exchange
   */
  public hasCredentialsForExchange(exchange: ExchangeType): boolean {
    return this.credentials().some(cred => cred.exchange === exchange);
  }

  /**
   * Refresh credentials (re-fetch from backend)
   */
  public refreshCredentials(): void {
    this.fetchCredentials().subscribe({
      error: (err) => console.error('Failed to refresh credentials:', err)
    });
  }

  /**
   * Clear error state
   */
  public clearError(): void {
    this._error.set(null);
  }

  /**
   * Clear all state (useful for logout)
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
   */
  private updateCredentialsState(credentials: ExchangeCredential[]): void {
    this._credentials.set(credentials);

    // Find and set active credential (if any)
    const active = credentials.find(cred => cred.isActive) ?? null;
    this._activeCredential.set(active);
  }

  /**
   * Centralized error handling
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
