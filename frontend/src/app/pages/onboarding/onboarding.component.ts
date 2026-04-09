import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/ui/button/button.component';
import { ExchangeCredentialsService } from '../../services/exchange-credentials.service';
import { TranslationService } from '../../services/translation.service';
import { ExchangeType, TestConnectionResponse } from '../../models/exchange-credentials.model';
import { getEndpointUrl } from '../../config/app.config';

interface ExchangeOption {
  value: ExchangeType;
  label: string;
  requiresPassphrase: boolean;
}

interface WhitelistIpsResponse {
  success: boolean;
  data: { ips: string[] };
}

/**
 * Onboarding screen.
 *
 * Two-step wizard:
 *  1. Whitelist IPs — show the outbound server IPs the user must add to
 *     their exchange API key restriction list before generating keys.
 *  2. Connect exchange — exchange dropdown + API key form with mandatory
 *     Test Connection before Save & Continue.
 *
 * The Test Connection step in step 2 is the gate: Save is only enabled after
 * a successful test, so we never persist credentials that fail to authenticate.
 */
@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly credentialsService = inject(ExchangeCredentialsService);
  private readonly router = inject(Router);
  private readonly translationService = inject(TranslationService);

  readonly form: FormGroup;
  readonly exchanges: ExchangeOption[] = [
    { value: ExchangeType.BYBIT, label: 'Bybit', requiresPassphrase: false },
    { value: ExchangeType.BINANCE, label: 'Binance', requiresPassphrase: false },
    { value: ExchangeType.OKX, label: 'OKX', requiresPassphrase: true },
    { value: ExchangeType.COINBASE, label: 'Coinbase', requiresPassphrase: true },
    { value: ExchangeType.KRAKEN, label: 'Kraken', requiresPassphrase: false },
    { value: ExchangeType.BINGX, label: 'BingX', requiresPassphrase: false },
    { value: ExchangeType.MEXC, label: 'MEXC', requiresPassphrase: false },
    { value: ExchangeType.GATEIO, label: 'Gate.io', requiresPassphrase: false },
    { value: ExchangeType.BITGET, label: 'Bitget', requiresPassphrase: true },
    { value: ExchangeType.KUCOIN, label: 'KuCoin', requiresPassphrase: true }
  ];

  // Wizard step: 1 = whitelist IPs, 2 = enter credentials
  readonly currentStep = signal<1 | 2>(1);

  // Step 1 state
  readonly whitelistIps = signal<string[]>([]);
  readonly whitelistLoading = signal(false);
  readonly whitelistError = signal<string | null>(null);
  readonly copiedIp = signal<string | null>(null);

  // Step 2 state
  readonly testing = signal(false);
  readonly saving = signal(false);
  readonly testResult = signal<TestConnectionResponse | null>(null);
  readonly testError = signal<string | null>(null);
  readonly selectedExchange = signal<ExchangeType | null>(null);

  readonly requiresPassphrase = computed(() => {
    const exchange = this.selectedExchange();
    if (!exchange) return false;
    return this.exchanges.find((e) => e.value === exchange)?.requiresPassphrase ?? false;
  });

  readonly canSave = computed(() => {
    const result = this.testResult();
    return result !== null && result.success && !this.saving();
  });

  constructor() {
    this.form = this.fb.group({
      exchange: [null, Validators.required],
      apiKey: ['', [Validators.required, Validators.minLength(8)]],
      apiSecret: ['', [Validators.required, Validators.minLength(8)]],
      passphrase: [''],
      label: ['']
    });

    this.form.get('exchange')!.valueChanges.subscribe((value: ExchangeType | null) => {
      this.selectedExchange.set(value);
      this.testResult.set(null);
      this.testError.set(null);

      const passphraseCtrl = this.form.get('passphrase')!;
      if (this.requiresPassphrase()) {
        passphraseCtrl.setValidators([Validators.required]);
      } else {
        passphraseCtrl.clearValidators();
      }
      passphraseCtrl.updateValueAndValidity({ emitEvent: false });
    });

    ['apiKey', 'apiSecret', 'passphrase'].forEach((field) => {
      this.form.get(field)!.valueChanges.subscribe(() => {
        if (this.testResult() !== null) {
          this.testResult.set(null);
          this.testError.set(null);
        }
      });
    });
  }

  ngOnInit(): void {
    // Defensive: if user already has credentials, skip onboarding entirely.
    this.credentialsService.fetchCredentials().subscribe({
      next: (creds) => {
        if (creds.length > 0) {
          this.router.navigate(['/trading/manual']);
        }
      }
    });

    this.loadWhitelistIps();
  }

  translate(key: string, params?: Record<string, string>): string {
    return this.translationService.translate(key, params);
  }

  private loadWhitelistIps(): void {
    this.whitelistLoading.set(true);
    this.whitelistError.set(null);

    this.http.get<WhitelistIpsResponse>(getEndpointUrl('system', 'whitelistIps')).subscribe({
      next: (response) => {
        this.whitelistLoading.set(false);
        this.whitelistIps.set(response.data.ips);
      },
      error: () => {
        this.whitelistLoading.set(false);
        this.whitelistError.set(this.translate('onboarding.whitelistError'));
      }
    });
  }

  goToStep2(): void {
    this.currentStep.set(2);
  }

  goToStep1(): void {
    this.currentStep.set(1);
  }

  copyIp(ip: string): void {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(ip).then(() => {
      this.copiedIp.set(ip);
      setTimeout(() => {
        if (this.copiedIp() === ip) this.copiedIp.set(null);
      }, 1500);
    });
  }

  copyAllIps(): void {
    const ips = this.whitelistIps();
    if (ips.length === 0 || !navigator?.clipboard) return;
    navigator.clipboard.writeText(ips.join(', ')).then(() => {
      this.copiedIp.set('all');
      setTimeout(() => {
        if (this.copiedIp() === 'all') this.copiedIp.set(null);
      }, 1500);
    });
  }

  onTestConnection(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.testing.set(true);
    this.testError.set(null);
    this.testResult.set(null);

    const { exchange, apiKey, apiSecret, passphrase } = this.form.value;

    this.credentialsService
      .testConnection({
        exchange,
        apiKey,
        apiSecret,
        passphrase: this.requiresPassphrase() ? passphrase : undefined
      })
      .subscribe({
        next: (result) => {
          this.testing.set(false);
          if (result.success) {
            this.testResult.set(result);
          } else {
            this.testError.set(result.message || this.translate('onboarding.testFailed'));
          }
        },
        error: (err) => {
          this.testing.set(false);
          const message = err?.error?.error || err?.message || this.translate('onboarding.testFailed');
          this.testError.set(message);
        }
      });
  }

  onSaveAndContinue(): void {
    if (!this.canSave() || this.form.invalid) return;

    this.saving.set(true);
    const { exchange, apiKey, apiSecret, passphrase, label } = this.form.value;

    this.credentialsService
      .createCredential({
        exchange,
        apiKey,
        apiSecret,
        passphrase: this.requiresPassphrase() ? passphrase : undefined,
        label: label || undefined,
        isActive: true
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/trading/manual']);
        },
        error: (err) => {
          this.saving.set(false);
          const message = err?.error?.error || err?.message || this.translate('onboarding.saveFailed');
          this.testError.set(message);
        }
      });
  }
}
