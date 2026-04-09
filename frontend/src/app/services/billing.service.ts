import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { getEndpointUrl } from '../config/app.config';

export interface BillingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number; // days
  features: string[];
  role: string;
}

export interface CreateInvoiceResponse {
  invoiceUrl: string;
  invoiceId: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Frontend wrapper for the billing API.
 * Mirrors the signal-based shape of ExchangeCredentialsService.
 */
@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);

  private readonly _plans = signal<BillingPlan[]>([]);
  readonly plans = this._plans.asReadonly();

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private readonly _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  readonly hasPlans = computed(() => this._plans().length > 0);

  fetchPlans(): Observable<BillingPlan[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<ApiEnvelope<BillingPlan[]>>(getEndpointUrl('billing', 'plans')).pipe(
      tap((response) => {
        this._plans.set(response.data);
        this._loading.set(false);
      }),
      map((response) => response.data),
      catchError((err) => {
        this._loading.set(false);
        this._error.set(err?.error?.error || 'Failed to load plans');
        return throwError(() => err);
      })
    );
  }

  createInvoice(planId: string): Observable<CreateInvoiceResponse> {
    this._error.set(null);

    return this.http
      .post<ApiEnvelope<CreateInvoiceResponse>>(getEndpointUrl('billing', 'createInvoice'), { planId })
      .pipe(
        map((response) => response.data),
        catchError((err) => {
          this._error.set(err?.error?.error || 'Failed to create invoice');
          return throwError(() => err);
        })
      );
  }
}
