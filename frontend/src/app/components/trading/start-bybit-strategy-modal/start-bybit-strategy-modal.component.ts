/**
 * Start Bybit Funding Strategy Modal Component
 *
 * Modal dialog for configuring and starting a Bybit funding rate strategy.
 * Features:
 * - Display symbol info (funding rate, time until funding)
 * - Configure strategy type (precise timing vs regular)
 * - Select credentials and configure position parameters
 * - Set leverage, margin, position side, TP/SL
 * - Advanced settings for precise timing strategy
 * - Real-time validation and calculated expected results
 * - Success/error feedback
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  DialogComponent,
  DialogContentComponent,
  DialogFooterComponent,
} from '../../ui/dialog/dialog.component';
import { ButtonComponent } from '../../ui/button/button.component';
import { InputComponent } from '../../ui/input/input.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

import { BybitFundingStrategyService } from '../../../services/bybit-funding-strategy.service';
import { TranslationService } from '../../../services/translation.service';
import type {

  StartPreciseTimingStrategyRequest,
} from '../../../models/bybit-funding-strategy.model';

export interface StartBybitStrategyModalData {
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  credentialId: string; // Credential ID from parent component
}

@Component({
  selector: 'app-start-bybit-strategy-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogComponent,
    DialogContentComponent,
    DialogFooterComponent,
    ButtonComponent,
    InputComponent,
    DropdownComponent,
  ],
  templateUrl: './start-bybit-strategy-modal.component.html',
  styleUrls: ['./start-bybit-strategy-modal.component.scss'],
})
export class StartBybitStrategyModalComponent implements OnInit {
  // Component inputs/outputs
  @Input() isOpen = false;
  @Input() data!: StartBybitStrategyModalData;
  @Output() close = new EventEmitter<void>();
  @Output() strategyStarted = new EventEmitter<void>();

  // Injected services
  private fb = inject(FormBuilder);
  private strategyService = inject(BybitFundingStrategyService);
  private translationService = inject(TranslationService);

  // Modal data as signal for computed values
  dataSignal = computed(() => this.data);

  // Form state
  form!: FormGroup;
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Advanced settings expansion state
  showAdvancedSettings = signal<boolean>(false);

  // Strategy type options
  strategyTypeOptions = [
    { value: 'precise', label: '' },
    { value: 'regular', label: '' },
  ];

  // Position side options
  positionSideOptions = [
    { value: 'Auto', label: '' },
    { value: 'Buy', label: '' },
    { value: 'Sell', label: '' },
  ];

  // Computed values
  expectedFunding = computed(() => {
    const margin = this.form?.get('margin')?.value || 100;
    const leverage = this.form?.get('leverage')?.value || 10;
    const fundingRate = this.dataSignal().fundingRate || 0;
    return this.strategyService.calculateExpectedFunding(margin, leverage, fundingRate);
  });

  takeProfitAmount = computed(() => {
    const takeProfitPercent = this.form?.get('takeProfitPercent')?.value || 90;
    return this.strategyService.calculateTakeProfit(this.expectedFunding(), takeProfitPercent);
  });

  stopLossAmount = computed(() => {
    const stopLossPercent = this.form?.get('stopLossPercent')?.value || 50;
    return this.strategyService.calculateStopLoss(this.expectedFunding(), stopLossPercent);
  });

  secondsUntilFunding = computed(() => {
    const nextFundingTime = this.dataSignal().nextFundingTime;
    if (!nextFundingTime) return 0;
    const now = Date.now();
    return Math.max(0, Math.floor((nextFundingTime - now) / 1000));
  });

  timeRemainingFormatted = computed(() => {
    return this.strategyService.formatTimeRemaining(this.secondsUntilFunding());
  });

  positionValue = computed(() => {
    const margin = this.form?.get('margin')?.value || 100;
    const leverage = this.form?.get('leverage')?.value || 10;
    return margin * leverage;
  });

  // Helper to check if strategy type is 'precise'
  isPreciseStrategy = computed(() => {
    return this.form?.get('strategyType')?.value === 'precise';
  });

  ngOnInit(): void {
    this.initializeTranslations();
    this.initializeForm();
  }

  /**
   * Initialize translations for dropdown options
   */
  private initializeTranslations(): void {
    this.strategyTypeOptions = [
      {
        value: 'precise',
        label: this.translate('bybitStrategy.type.precise'),
      },
      {
        value: 'regular',
        label: this.translate('bybitStrategy.type.regular'),
      },
    ];

    this.positionSideOptions = [
      {
        value: 'Auto',
        label: this.translate('bybitStrategy.side.auto'),
      },
      {
        value: 'Buy',
        label: this.translate('bybitStrategy.side.long'),
      },
      {
        value: 'Sell',
        label: this.translate('bybitStrategy.side.short'),
      },
    ];
  }

  /**
   * Initialize the form with validators
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      // Strategy configuration
      strategyType: ['precise', [Validators.required]],

      // Position settings
      leverage: [10, [Validators.required, Validators.min(1), Validators.max(125)]],
      margin: [100, [Validators.required, Validators.min(1)]],
      positionSide: ['Auto', [Validators.required]],

      // Risk management
      takeProfitPercent: [90, [Validators.required, Validators.min(1), Validators.max(100)]],
      stopLossPercent: [50, [Validators.required, Validators.min(1), Validators.max(100)]],

      // Advanced settings (only for precise timing)
      timingOffset: [20, [Validators.min(0), Validators.max(1000)]],
      autoRepeat: [false],
      enableWebSocketMonitoring: [true],
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
      const modalData = this.dataSignal();

      const params: StartPreciseTimingStrategyRequest = {
        symbol: modalData.symbol,
        leverage: formValue.leverage,
        margin: formValue.margin,
        positionSide: formValue.positionSide,
        takeProfitPercent: formValue.takeProfitPercent,
        stopLossPercent: formValue.stopLossPercent,
        timingOffset: formValue.timingOffset,
        autoRepeat: formValue.autoRepeat,
        enableWebSocketMonitoring: formValue.enableWebSocketMonitoring,
        // Only include credentialId if provided (empty string means use active credential)
        ...(modalData.credentialId && modalData.credentialId !== '' ? { credentialId: modalData.credentialId } : {})
      };

      if (formValue.strategyType === 'precise') {
        await firstValueFrom(this.strategyService.startPreciseTimingStrategy(params));
      } else {
        // Convert to regular strategy params (side is required, not positionSide)
        const regularParams = {
          ...params,
          side: params.positionSide === 'Auto' ? 'Buy' : params.positionSide,
          executionDelay: 5,
        };
        delete (regularParams as any).positionSide;
        delete (regularParams as any).timingOffset;

        await firstValueFrom(this.strategyService.startRegularStrategy(regularParams as any));
      }

      // Success!
      this.successMessage.set(this.translate('bybitStrategy.actions.success'));

      // Emit strategy started event and close after short delay
      console.log('[Modal] Strategy started successfully, waiting 1.5s before emitting events...');
      setTimeout(() => {
        console.log('[Modal] Emitting strategyStarted event');
        this.strategyStarted.emit();
        console.log('[Modal] Emitting close event');
        this.close.emit();
      }, 1500);

    } catch (error: any) {
      console.error('Failed to start strategy:', error);
      this.errorMessage.set(error.message || this.translate('bybitStrategy.actions.error'));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Close the modal without starting strategy
   */
  onCancel(): void {
    this.close.emit();
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

  /**
   * Translate a key using the translation service
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
