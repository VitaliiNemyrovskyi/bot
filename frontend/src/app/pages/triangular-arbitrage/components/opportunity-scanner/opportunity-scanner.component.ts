import { Component, Input, Output, EventEmitter, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScannerConfig, ScannerStats, ScannerStatus, Exchange } from '../../../../models/triangular-arbitrage.model';
import { TranslationService } from '../../../../services/translation.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// UI Components
import { ButtonComponent } from '../../../../components/ui/button/button.component';
import { InputComponent } from '../../../../components/ui/input/input.component';
import { SelectComponent } from '../../../../components/ui/select/select.component';

/**
 * Exchange Scanner State
 * Tracks the state of a scanner for a specific exchange
 */
export interface ExchangeScannerState {
  exchange: Exchange;
  status: ScannerStatus;
  stats: ScannerStats | null;
  config: ScannerConfig | null;
}

/**
 * Opportunity Scanner Component
 *
 * Provides controls for starting/stopping arbitrage scanners on multiple exchanges simultaneously.
 *
 * Note: Credentials are automatically selected based on active exchange credentials.
 */
@Component({
  selector: 'app-opportunity-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './opportunity-scanner.component.html',
  styleUrls: ['./opportunity-scanner.component.scss']
})
export class OpportunityScannerComponent implements OnInit {
  // Track scanner states for all exchanges
  readonly activeScanners = signal<Map<Exchange, ExchangeScannerState>>(new Map());

  // Computed: List of active scanner states
  readonly activeScannersList = computed(() => Array.from(this.activeScanners().values()));

  // Computed: Check if any scanner is running
  readonly isAnyScanning = computed(() =>
    Array.from(this.activeScanners().values()).some(s => s.status === 'scanning')
  );

  @Output() startScanning = new EventEmitter<ScannerConfig>();
  @Output() stopScanning = new EventEmitter<Exchange | null>(); // null = stop all

  configForm!: FormGroup;
  readonly availableExchanges: Exchange[] = ['BYBIT', 'BINANCE', 'BINGX', 'MEXC', 'GATEIO', 'BITGET', 'OKX'];
  readonly showAdvanced = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private translationService: TranslationService,
    private http: HttpClient
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // No need to load credentials - backend auto-selects active credential
  }

  /**
   * Initialize the configuration form
   */
  private initForm(): void {
    this.configForm = this.fb.group({
      exchange: ['GATEIO', Validators.required], // Default to Gate.io (optimized for this exchange)
      minProfitPercentage: [0.5, [Validators.required, Validators.min(-10), Validators.max(10)]], // 0.5% min realistic profit (optimized)
      maxSlippage: [0.5, [Validators.required, Validators.min(0.01), Validators.max(5)]], // 0.5% max slippage (based on real data)
      positionSize: [50, [Validators.required, Validators.min(10), Validators.max(100000)]], // $50 default (safer for testing)
      autoExecute: [false]
    });
  }

  /**
   * Start scanning on selected exchange
   */
  onStart(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }

    const exchange = this.configForm.value.exchange;

    // DEBUG: Log what exchange we're actually sending
    console.log('🔍 [Scanner] Form values:', {
      exchange: exchange,
      allFormValues: this.configForm.value,
      formRawValue: this.configForm.getRawValue()
    });

    // Check if already scanning this exchange
    const current = this.activeScanners().get(exchange);
    if (current && current.status === 'scanning') {
      console.log(`Already scanning ${exchange}`);
      return;
    }

    const config: ScannerConfig = {
      exchange: exchange,
      minProfitPercentage: this.configForm.value.minProfitPercentage,
      maxSlippage: this.configForm.value.maxSlippage,
      positionSize: this.configForm.value.positionSize,
      autoExecute: this.configForm.value.autoExecute
    };

    console.log('🔍 [Scanner] Sending config to backend:', config);

    this.startScanning.emit(config);
  }

  /**
   * Stop scanning for a specific exchange
   */
  onStopExchange(exchange: Exchange): void {
    this.stopScanning.emit(exchange);
  }

  /**
   * Stop all active scanners
   */
  onStopAll(): void {
    this.stopScanning.emit(null);
  }

  /**
   * Update scanner state for a specific exchange
   * Called from parent component when receiving SSE updates
   */
  updateScannerState(exchange: Exchange, status: ScannerStatus, stats: ScannerStats | null = null, config: ScannerConfig | null = null): void {
    const scanners = this.activeScanners();

    if (status === 'stopped') {
      // Remove scanner if stopped
      scanners.delete(exchange);
    } else {
      // Update or add scanner
      const existing = scanners.get(exchange);
      scanners.set(exchange, {
        exchange,
        status,
        stats: stats || existing?.stats || null,
        config: config || existing?.config || null
      });
    }

    // Trigger update
    this.activeScanners.set(new Map(scanners));
  }

  /**
   * Check if a specific exchange is scanning
   */
  isExchangeScanning(exchange: Exchange): boolean {
    const scanner = this.activeScanners().get(exchange);
    return scanner?.status === 'scanning';
  }

  /**
   * Get available exchanges (not currently scanning)
   */
  getAvailableExchanges(): Exchange[] {
    return this.availableExchanges.filter(ex => !this.isExchangeScanning(ex));
  }

  /**
   * Toggle advanced settings
   */
  toggleAdvanced(): void {
    this.showAdvanced.set(!this.showAdvanced());
  }

  /**
   * Get status indicator class for a scanner
   */
  getStatusClass(status: ScannerStatus): string {
    switch (status) {
      case 'scanning': return 'status-scanning';
      case 'stopped': return 'status-stopped';
      case 'error': return 'status-error';
      default: return '';
    }
  }

  /**
   * Get status text for a scanner
   */
  getStatusText(status: ScannerStatus): string {
    switch (status) {
      case 'scanning': return this.translate('triangularArbitrage.scanner.status.scanning');
      case 'stopped': return this.translate('triangularArbitrage.scanner.status.stopped');
      case 'error': return this.translate('triangularArbitrage.scanner.status.error');
      default: return '';
    }
  }

  /**
   * Get exchange display name
   */
  getExchangeName(exchange: Exchange): string {
    return exchange;
  }

  /**
   * Format duration in ms to human-readable string
   */
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Translation helper
   */
  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
