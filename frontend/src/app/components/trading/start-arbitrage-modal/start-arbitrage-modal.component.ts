/**
 * Start Arbitrage Modal Component
 *
 * Modal dialog for configuring and starting a new price arbitrage position.
 * Features:
 * - Display opportunity details (symbol, exchanges, prices, spread)
 * - Configure leverage and margin for both exchanges
 * - Advanced settings: target spread, stop loss, max holding time
 * - Real-time validation and error handling
 * - Success/error feedback
 */

import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

import { PriceArbitrageService } from '../../../services/price-arbitrage.service';
import { TranslationService } from '../../../services/translation.service';
import { PriceArbitrageOpportunity, StartPriceArbitrageParams } from '../../../models/price-arbitrage.model';

export interface StartArbitrageDialogData {
  opportunity: PriceArbitrageOpportunity;
}

@Component({
  selector: 'app-start-arbitrage-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatIconModule
  ],
  templateUrl: './start-arbitrage-modal.component.html',
  styleUrls: ['./start-arbitrage-modal.component.scss']
})
export class StartArbitrageModalComponent implements OnInit {
  // Injected services
  private dialogRef = inject(MatDialogRef<StartArbitrageModalComponent>);
  private data = inject<StartArbitrageDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private priceArbitrageService = inject(PriceArbitrageService);
  private translationService = inject(TranslationService);

  // Opportunity data
  opportunity = signal<PriceArbitrageOpportunity>(this.data.opportunity);

  // Form state
  form!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Advanced settings expansion state
  showAdvancedSettings = signal<boolean>(false);

  // Computed values
  spreadPercent = computed(() => {
    const opp = this.opportunity();
    return (opp.spread * 100).toFixed(4);
  });

  spreadClass = computed(() => {
    const opp = this.opportunity();
    if (opp.spread >= 0.02) return 'spread-high';
    if (opp.spread >= 0.01) return 'spread-medium';
    return 'spread-low';
  });

  // Translation helper
  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the form with validators
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      // Primary exchange settings
      primaryLeverage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      primaryMargin: [100, [Validators.required, Validators.min(10)]],

      // Hedge exchange settings
      hedgeLeverage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      hedgeMargin: [100, [Validators.required, Validators.min(10)]],

      // Advanced settings (optional)
      targetSpread: [null, [Validators.min(0), Validators.max(100)]],
      stopLoss: [null, [Validators.min(0), Validators.max(100)]],
      maxHoldingTime: [null, [Validators.min(1)]]
    });
  }

  /**
   * Format leverage value for slider display
   */
  formatLeverageLabel(value: number): string {
    return `${value}x`;
  }

  /**
   * Handle form submission
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.form.value;
      const opp = this.opportunity();

      // Build params for API
      const params: StartPriceArbitrageParams = {
        symbol: opp.symbol,

        // Primary exchange (higher price - SHORT position)
        primaryExchange: opp.primaryExchange.name,
        primaryCredentialId: opp.primaryExchange.credentialId,
        primaryLeverage: formValue.primaryLeverage,
        primaryMargin: formValue.primaryMargin,

        // Hedge exchange (lower price - LONG position)
        hedgeExchange: opp.hedgeExchange.name,
        hedgeCredentialId: opp.hedgeExchange.credentialId,
        hedgeLeverage: formValue.hedgeLeverage,
        hedgeMargin: formValue.hedgeMargin,

        // Entry prices
        entryPrimaryPrice: opp.primaryExchange.price,
        entryHedgePrice: opp.hedgeExchange.price,

        // Optional advanced settings
        ...(formValue.targetSpread && { targetSpread: formValue.targetSpread / 100 }),
        ...(formValue.stopLoss && { stopLoss: formValue.stopLoss / 100 }),
        ...(formValue.maxHoldingTime && { maxHoldingTime: formValue.maxHoldingTime * 3600 }) // Convert hours to seconds
      };

      // Call the service
      const result = await this.priceArbitrageService.startArbitrage(params).toPromise();

      // Success!
      this.successMessage.set(this.translate('arbitrage.startSuccess'));

      // Close modal after short delay
      setTimeout(() => {
        this.dialogRef.close({ success: true, position: result });
      }, 1500);

    } catch (error: any) {
      console.error('Failed to start arbitrage:', error);
      this.errorMessage.set(error.message || this.translate('arbitrage.startError'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Close the modal without starting arbitrage
   */
  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  /**
   * Toggle advanced settings panel
   */
  toggleAdvancedSettings(): void {
    this.showAdvancedSettings.update(val => !val);
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return this.translate('validation.required');
    }
    if (control.errors['min']) {
      return this.translate('validation.minValue').replace('{value}', control.errors['min'].min);
    }
    if (control.errors['max']) {
      return this.translate('validation.maxValue').replace('{value}', control.errors['max'].max);
    }

    return '';
  }

  /**
   * Check if form control is invalid and touched
   */
  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
