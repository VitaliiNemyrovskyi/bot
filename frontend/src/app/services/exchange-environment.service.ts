import { Injectable, Signal, WritableSignal, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { EnvironmentType } from '../models/exchange-credentials.model';

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
@Injectable({
  providedIn: 'root'
})
export class ExchangeEnvironmentService {
  // ============================================================================
  // SIGNALS - State Management
  // ============================================================================

  /**
   * Internal writable signal for current environment
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

    console.log('[ExchangeEnvironmentService] Initialized with environment:', initialEnvironment);
  }

  // ============================================================================
  // PUBLIC METHODS - Environment Management
  // ============================================================================

  /**
   * Set the current exchange environment
   * Updates signal and persists to localStorage
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
   */
  public toggleEnvironment(): void {
    const newEnv = this.isTestnet()
      ? EnvironmentType.MAINNET
      : EnvironmentType.TESTNET;

    this.setEnvironment(newEnv);
  }

  /**
   * Get the display name for an environment
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
   */
  public getEnvironmentColor(env: EnvironmentType): string {
    const colors: Record<EnvironmentType, string> = {
      [EnvironmentType.TESTNET]: '#FF9800',  // Orange
      [EnvironmentType.MAINNET]: '#2196F3'   // Blue
    };
    return colors[env];
  }

  /**
   * Get the icon name for an environment
   */
  public getEnvironmentIcon(env: EnvironmentType): string {
    const icons: Record<EnvironmentType, string> = {
      [EnvironmentType.TESTNET]: 'science',
      [EnvironmentType.MAINNET]: 'verified_user'
    };
    return icons[env];
  }

  /**
   * Clear stored environment preference
   * Resets to default (TESTNET)
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
   */
  private isValidEnvironment(value: string): value is EnvironmentType {
    return Object.values(EnvironmentType).includes(value as EnvironmentType);
  }
}
