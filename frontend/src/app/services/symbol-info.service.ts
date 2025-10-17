import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getEndpointUrl } from '../config/app.config';
import { AuthService } from './auth.service';

export interface SymbolInfo {
  symbol: string;
  exchange: string;
  minOrderQty: number;
  minOrderValue?: number; // Minimum notional value in USDT
  qtyStep: number; // Quantity step size
  pricePrecision: number;
  qtyPrecision: number;
  maxOrderQty?: number;
  maxLeverage?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SymbolInfoService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cache = new Map<string, SymbolInfo>();

  /**
   * Get symbol information from backend API
   * Includes caching to avoid unnecessary API calls
   */
  getSymbolInfo(exchange: string, symbol: string): Observable<SymbolInfo | null> {
    const cacheKey = `${exchange}:${symbol}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`[SymbolInfoService] Cache hit for ${cacheKey}`);
      return of(this.cache.get(cacheKey)!);
    }

    console.log(`[SymbolInfoService] Fetching symbol info for ${exchange}:${symbol}`);

    const token = this.authService.authState().token;
    if (!token) {
      console.warn('[SymbolInfoService] No auth token available');
      return of(null);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const url = `${getEndpointUrl('exchange', 'symbolInfo')}?exchange=${exchange}&symbol=${symbol}`;

    return this.http.get<any>(url, { headers }).pipe(
      map(response => {
        if (response?.success && response?.data) {
          const symbolInfo = response.data as SymbolInfo;
          // Store in cache
          this.cache.set(cacheKey, symbolInfo);
          console.log(`[SymbolInfoService] Symbol info received:`, symbolInfo);
          return symbolInfo;
        }
        return null;
      }),
      catchError(error => {
        console.error(`[SymbolInfoService] Error fetching symbol info:`, error);
        return of(null);
      })
    );
  }

  /**
   * Clear cache (useful when switching symbols or exchanges)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Validate order quantity against minimum requirements and graduated entry parts
   *
   * @param symbolInfo Symbol trading rules
   * @param totalQuantity Total order quantity
   * @param graduatedParts Number of parts to split the order into
   * @returns Validation result with error message if invalid
   */
  validateOrderQuantity(
    symbolInfo: SymbolInfo,
    totalQuantity: number,
    graduatedParts: number = 1
  ): { valid: boolean; error?: string; suggestion?: string } {
    if (!symbolInfo) {
      return { valid: false, error: 'Symbol information not available' };
    }

    // Calculate quantity per part
    const qtyPerPart = totalQuantity / graduatedParts;

    // Check if quantity per part meets minimum requirement
    if (qtyPerPart < symbolInfo.minOrderQty) {
      const minTotalQty = symbolInfo.minOrderQty * graduatedParts;
      const maxParts = Math.floor(totalQuantity / symbolInfo.minOrderQty);

      // Different suggestions based on whether we can reduce parts
      let suggestion: string;
      if (graduatedParts === 1 || maxParts === 0) {
        // Can't reduce parts further, only option is to increase quantity
        suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)}`;
      } else {
        // Can reduce parts or increase quantity
        suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)} or reduce graduated parts to ${maxParts}`;
      }

      return {
        valid: false,
        error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)}) is below minimum (${symbolInfo.minOrderQty})`,
        suggestion
      };
    }

    // Check maximum quantity if defined
    if (symbolInfo.maxOrderQty && qtyPerPart > symbolInfo.maxOrderQty) {
      return {
        valid: false,
        error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)}) exceeds maximum (${symbolInfo.maxOrderQty})`,
        suggestion: `Decrease quantity or increase graduated parts`
      };
    }

    // Check quantity step
    // Round to avoid floating point precision issues
    const roundedQtyPerPart = Math.round(qtyPerPart / symbolInfo.qtyStep) * symbolInfo.qtyStep;
    const difference = Math.abs(qtyPerPart - roundedQtyPerPart);

    // If difference is significant (more than 0.1% of step size), quantity is not valid
    if (difference > symbolInfo.qtyStep * 0.001) {
      return {
        valid: false,
        error: `Quantity per part must be a multiple of ${symbolInfo.qtyStep}`,
        suggestion: `Adjust total quantity to ${(roundedQtyPerPart * graduatedParts).toFixed(symbolInfo.qtyPrecision)}`
      };
    }

    return { valid: true };
  }
}
