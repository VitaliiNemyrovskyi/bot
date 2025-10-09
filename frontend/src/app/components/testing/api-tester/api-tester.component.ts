import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ExchangeCredentialsService } from '../../../services/exchange-credentials.service';
import { TradingService } from '../../../services/trading.service';
import { ExchangeType, EnvironmentType, ExchangeCredential } from '../../../models/exchange-credentials.model';

/**
 * Order Type enumeration for exchange orders
 */
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT'
}

/**
 * Order Side enumeration
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

/**
 * Position Side enumeration for futures trading
 */
export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

/**
 * Exchange Order Request interface
 */
export interface ExchangeOrderRequest {
  exchange: ExchangeType;
  credentialId: string;
  symbol: string;
  side: OrderSide;
  positionSide: PositionSide;
  type: OrderType;
  quantity: number;
  price?: number;
}

/**
 * Exchange Order Response interface
 */
export interface ExchangeOrderResponse {
  success: boolean;
  orderId?: string;
  clientOrderId?: string;
  status?: string;
  message?: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Request/Response Log Entry interface
 */
export interface RequestResponseLog {
  timestamp: Date;
  method: string;
  endpoint: string;
  requestBody: any;
  requestHeaders?: Record<string, string>;
  queryString?: string;
  statusCode?: number;
  responseBody?: any;
  responseTime?: number;
  success: boolean;
  error?: string;
}

/**
 * API Tester Component
 *
 * A comprehensive API testing interface for exchange orders that mimics Swagger UI.
 * Allows users to test exchange order placement with detailed request/response inspection.
 *
 * Features:
 * - Exchange and credential selection
 * - Order parameter configuration (symbol, side, type, quantity, price)
 * - Real-time request preview with JSON syntax highlighting
 * - Response display with status codes and timing
 * - Copy-to-clipboard functionality
 * - Form validation and error handling
 * - Dark theme similar to Swagger UI
 */
@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './api-tester.component.html',
  styleUrls: ['./api-tester.component.scss']
})
export class ApiTesterComponent implements OnInit {
  // ============================================================================
  // SIGNALS - Reactive State Management
  // ============================================================================

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly currentLog = signal<RequestResponseLog | null>(null);
  readonly logs = signal<RequestResponseLog[]>([]);

  readonly selectedExchange = signal<ExchangeType | null>(null);
  readonly selectedCredential = signal<ExchangeCredential | null>(null);

  // ============================================================================
  // COMPUTED SIGNALS - Derived State
  // ============================================================================

  readonly availableCredentials = computed(() => {
    const exchange = this.selectedExchange();
    if (!exchange) return [];

    return this.credentialsService
      .credentials()
      .filter(cred => cred.exchange === exchange);
  });

  readonly canSubmit = computed(() => {
    return this.orderForm?.valid &&
           this.selectedExchange() !== null &&
           this.selectedCredential() !== null &&
           !this.isLoading();
  });

  readonly requestPreview = computed(() => {
    if (!this.orderForm) return null;

    const formValue = this.orderForm.value;
    return {
      exchange: this.selectedExchange(),
      credentialId: this.selectedCredential()?.id,
      symbol: formValue.symbol,
      side: formValue.side,
      positionSide: formValue.positionSide,
      type: formValue.type,
      quantity: formValue.quantity,
      price: formValue.type === OrderType.LIMIT ? formValue.price : undefined
    };
  });

  // ============================================================================
  // ENUM REFERENCES - For Template Access
  // ============================================================================

  readonly ExchangeType = ExchangeType;
  readonly OrderType = OrderType;
  readonly OrderSide = OrderSide;
  readonly PositionSide = PositionSide;

  // ============================================================================
  // FORM
  // ============================================================================

  orderForm!: FormGroup;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  readonly exchangeOptions = [
    { value: ExchangeType.BINGX, label: 'BingX', color: '#1E73FA' },
    { value: ExchangeType.BYBIT, label: 'Bybit', color: '#F7A600' },
    { value: ExchangeType.BINANCE, label: 'Binance', color: '#F3BA2F' }
  ];

  readonly orderTypeOptions = [
    { value: OrderType.MARKET, label: 'Market', description: 'Execute at current market price' },
    { value: OrderType.LIMIT, label: 'Limit', description: 'Execute at specified price or better' }
  ];

  readonly orderSideOptions = [
    { value: OrderSide.BUY, label: 'Buy', color: '#22c55e' },
    { value: OrderSide.SELL, label: 'Sell', color: '#ef4444' }
  ];

  readonly positionSideOptions = [
    { value: PositionSide.LONG, label: 'Long', color: '#22c55e' },
    { value: PositionSide.SHORT, label: 'Short', color: '#ef4444' }
  ];

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================

  constructor(
    private fb: FormBuilder,
    private tradingService: TradingService,
    private credentialsService: ExchangeCredentialsService
  ) {
    this.initializeForm();
  }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================

  ngOnInit(): void {
    // Load credentials from backend
    this.credentialsService.fetchCredentials().subscribe({
      error: (err) => {
        console.error('Failed to load credentials:', err);
        this.error.set('Failed to load exchange credentials. Please try again.');
      }
    });

    // Watch for form value changes to enable/disable price field
    this.orderForm.get('type')?.valueChanges.subscribe(type => {
      const priceControl = this.orderForm.get('price');
      if (type === OrderType.LIMIT) {
        priceControl?.setValidators([Validators.required, Validators.min(0.00000001)]);
        priceControl?.enable();
      } else {
        priceControl?.clearValidators();
        priceControl?.disable();
      }
      priceControl?.updateValueAndValidity();
    });
  }

  // ============================================================================
  // PRIVATE METHODS - Initialization
  // ============================================================================

  private initializeForm(): void {
    this.orderForm = this.fb.group({
      symbol: ['BTC-USDT', [Validators.required, Validators.pattern(/^[A-Z0-9]+-[A-Z0-9]+$/)]],
      side: [OrderSide.BUY, Validators.required],
      positionSide: [PositionSide.LONG, Validators.required],
      type: [OrderType.MARKET, Validators.required],
      quantity: [0.001, [Validators.required, Validators.min(0.00000001)]],
      price: [{ value: null, disabled: true }]
    });
  }

  // ============================================================================
  // PUBLIC METHODS - User Actions
  // ============================================================================

  /**
   * Handle exchange selection change
   */
  onExchangeChange(exchange: ExchangeType): void {
    this.selectedExchange.set(exchange);
    this.selectedCredential.set(null); // Reset credential when exchange changes
    this.error.set(null);
  }

  /**
   * Handle credential selection change
   */
  onCredentialChange(credentialId: string): void {
    const credential = this.availableCredentials().find(c => c.id === credentialId);
    this.selectedCredential.set(credential || null);
    this.error.set(null);
  }

  /**
   * Submit order request
   */
  async onSubmitRequest(): Promise<void> {
    if (!this.canSubmit()) {
      return;
    }

    this.error.set(null);
    this.isLoading.set(true);

    const startTime = Date.now();
    const requestData: ExchangeOrderRequest = {
      exchange: this.selectedExchange()!,
      credentialId: this.selectedCredential()!.id,
      symbol: this.orderForm.value.symbol,
      side: this.orderForm.value.side,
      positionSide: this.orderForm.value.positionSide,
      type: this.orderForm.value.type,
      quantity: this.orderForm.value.quantity,
      price: this.orderForm.value.type === OrderType.LIMIT ? this.orderForm.value.price : undefined
    };

    // Create log entry
    const logEntry: RequestResponseLog = {
      timestamp: new Date(),
      method: 'POST',
      endpoint: '/api/exchange-orders',
      requestBody: requestData,
      success: false
    };

    try {
      // Call the trading service to place order
      const response = await this.tradingService.placeExchangeOrder(requestData).toPromise();
      const endTime = Date.now();

      logEntry.statusCode = 200;
      logEntry.responseBody = response;
      logEntry.responseTime = endTime - startTime;
      logEntry.success = response?.success ?? false;

      this.currentLog.set(logEntry);
      this.logs.update(logs => [logEntry, ...logs]);

    } catch (err: any) {
      const endTime = Date.now();
      const httpError = err as HttpErrorResponse;

      logEntry.statusCode = httpError.status || 500;
      logEntry.responseBody = httpError.error || { message: httpError.message };
      logEntry.responseTime = endTime - startTime;
      logEntry.error = httpError.error?.error?.message || httpError.message || 'Unknown error occurred';
      logEntry.success = false;

      this.currentLog.set(logEntry);
      this.logs.update(logs => [logEntry, ...logs]);
      this.error.set(logEntry.error || 'Request failed');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Clear current request/response
   */
  clearCurrentLog(): void {
    this.currentLog.set(null);
    this.error.set(null);
  }

  /**
   * Clear all logs
   */
  clearAllLogs(): void {
    this.logs.set([]);
    this.clearCurrentLog();
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  /**
   * Copy request as JSON
   */
  async copyRequest(): Promise<void> {
    const preview = this.requestPreview();
    if (preview) {
      await this.copyToClipboard(JSON.stringify(preview, null, 2));
    }
  }

  /**
   * Copy response as JSON
   */
  async copyResponse(): Promise<void> {
    const log = this.currentLog();
    if (log?.responseBody) {
      await this.copyToClipboard(JSON.stringify(log.responseBody, null, 2));
    }
  }

  /**
   * Format JSON for display
   */
  formatJson(obj: any): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (err) {
      return String(obj);
    }
  }

  /**
   * Get status code color class
   */
  getStatusCodeClass(statusCode?: number): string {
    if (!statusCode) return 'status-unknown';
    if (statusCode >= 200 && statusCode < 300) return 'status-success';
    if (statusCode >= 400 && statusCode < 500) return 'status-client-error';
    if (statusCode >= 500) return 'status-server-error';
    return 'status-unknown';
  }

  /**
   * Get status code label
   */
  getStatusCodeLabel(statusCode?: number): string {
    if (!statusCode) return 'Unknown';

    const labels: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };

    return labels[statusCode] || statusCode.toString();
  }

  /**
   * Get form control error message
   */
  getErrorMessage(controlName: string): string {
    const control = this.orderForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['pattern']) return 'Invalid format (use format like BTC-USDT)';
    if (control.errors['min']) return `Value must be greater than ${control.errors['min'].min}`;

    return 'Invalid value';
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string): boolean {
    const control = this.orderForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
