import { Injectable, signal } from '@angular/core';

/**
 * Trading settings interface
 * Same as SubscriptionSettings from funding-rates component
 */
export interface TradingSettings {
  defaultQuantity: number;           // Default number of coins to trade
  leverage: number;                   // Trading leverage (1-100x)
  autoCancelThreshold: number | null; // Auto-cancel if funding rate falls below this (null = disabled)
  enableAutoCancel: boolean;          // Enable/disable auto-cancel feature
  executionDelay: number;             // Seconds before funding time to execute (default: 5)
  arbitrageSpreadThreshold: number | null; // Minimum spread threshold for arbitrage opportunities (in %)
  graduatedParts?: number;            // Default graduated entry parts (1-20) - optional for compatibility
  graduatedDelayMs?: number;          // Default delay between parts in milliseconds (100-60000) - optional
}

/**
 * Global trading settings service
 * Provides centralized access to trading configuration across all components
 */
@Injectable({
  providedIn: 'root'
})
export class TradingSettingsService {
  /**
   * Global trading settings signal
   * Uses same localStorage key as funding-rates component
   */
  private settings = signal<TradingSettings>({
    defaultQuantity: 0.01,
    leverage: 3,
    autoCancelThreshold: 0.003,
    enableAutoCancel: true,
    executionDelay: 5,
    arbitrageSpreadThreshold: null,
    graduatedParts: 5,
    graduatedDelayMs: 2000
  });

  /**
   * Get current settings (readonly)
   */
  getSettings() {
    return this.settings.asReadonly();
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<TradingSettings>): void {
    this.settings.update(current => ({
      ...current,
      ...newSettings
    }));

    // Persist to localStorage
    this.saveToLocalStorage();
  }

  /**
   * Get specific setting value
   */
  getLeverage(): number {
    return this.settings().leverage;
  }

  getDefaultQuantity(): number {
    return this.settings().defaultQuantity;
  }

  getGraduatedParts(): number {
    return this.settings().graduatedParts || 5;
  }

  getGraduatedDelayMs(): number {
    return this.settings().graduatedDelayMs || 2000;
  }

  /**
   * Load settings from localStorage on initialization
   */
  constructor() {
    this.loadFromLocalStorage();
  }

  /**
   * Save settings to localStorage
   * Uses same key as funding-rates component: 'fundingSubscriptionSettings'
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('fundingSubscriptionSettings', JSON.stringify(this.settings()));
      console.log('[TradingSettingsService] Settings saved to localStorage');
    } catch (error) {
      console.error('[TradingSettingsService] Failed to save settings:', error);
    }
  }

  /**
   * Load settings from localStorage
   * Uses same key as funding-rates component: 'fundingSubscriptionSettings'
   */
  private loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('fundingSubscriptionSettings');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<TradingSettings>;
        this.settings.set({
          ...this.settings(),
          ...parsed
        });
        console.log('[TradingSettingsService] Settings loaded from localStorage:', this.settings());
      }
    } catch (error) {
      console.error('[TradingSettingsService] Failed to load settings:', error);
    }
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings.set({
      defaultQuantity: 0.01,
      leverage: 3,
      autoCancelThreshold: 0.003,
      enableAutoCancel: true,
      executionDelay: 5,
      arbitrageSpreadThreshold: null,
      graduatedParts: 5,
      graduatedDelayMs: 2000
    });
    this.saveToLocalStorage();
  }
}
