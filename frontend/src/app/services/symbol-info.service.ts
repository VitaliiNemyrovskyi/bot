import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { getEndpointUrl } from '../config/app.config';

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

    const url = `${getEndpointUrl('exchange', 'symbolInfo')}?exchange=${exchange}&symbol=${symbol}`;

    return this.http.get<any>(url).pipe(
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

      // Extract coin symbol for clearer suggestions
      const coinSymbol = this.extractCoinSymbol(symbolInfo.symbol);
      
      // Different suggestions based on whether we can reduce parts
      let suggestion: string;
      if (graduatedParts === 1 || maxParts === 0) {
        // Can't reduce parts further, only option is to increase quantity
        suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)} ${coinSymbol}`;
      } else {
        // Can reduce parts or increase quantity
        suggestion = `Increase total quantity to at least ${minTotalQty.toFixed(symbolInfo.qtyPrecision)} ${coinSymbol} or reduce graduated parts to ${maxParts}`;
      }
      
      return {
        valid: false,
        error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)} ${coinSymbol}) is below minimum (${symbolInfo.minOrderQty} ${coinSymbol})`,
        suggestion
      };
    }

    // Check maximum quantity if defined
    if (symbolInfo.maxOrderQty && qtyPerPart > symbolInfo.maxOrderQty) {
      const coinSymbol = this.extractCoinSymbol(symbolInfo.symbol);
      return {
        valid: false,
        error: `Each order part (${qtyPerPart.toFixed(symbolInfo.qtyPrecision)} ${coinSymbol}) exceeds maximum (${symbolInfo.maxOrderQty} ${coinSymbol})`,
        suggestion: `Decrease quantity or increase graduated parts`
      };
    }

    // Check quantity step
    // Round to avoid floating point precision issues
    const roundedQtyPerPart = Math.round(qtyPerPart / symbolInfo.qtyStep) * symbolInfo.qtyStep;
    const difference = Math.abs(qtyPerPart - roundedQtyPerPart);

    // If difference is significant (more than 0.1% of step size), quantity is not valid
    if (difference > symbolInfo.qtyStep * 0.001) {
      const coinSymbol = this.extractCoinSymbol(symbolInfo.symbol);
      return {
        valid: false,
        error: `Quantity per part must be a multiple of ${symbolInfo.qtyStep} ${coinSymbol}`,
        suggestion: `Adjust total quantity to ${(roundedQtyPerPart * graduatedParts).toFixed(symbolInfo.qtyPrecision)} ${coinSymbol}`
      };
    }

    return { valid: true };
  }

  /**
   * Extract coin symbol from trading pair for clearer error messages
   * Examples: 
   * - FUSDT -> FUSDT
   * - F-USDT -> F
   * - BTC_USDT -> BTC
   * - BTCUSDT -> BTC
   */
  private extractCoinSymbol(symbol: string): string {
    // Handle hyphenated symbols (BingX format)
    if (symbol.includes('-')) {
      return symbol.split('-')[0];
    }
    
    // Handle underscore symbols (Gate.io format)  
    if (symbol.includes('_')) {
      return symbol.split('_')[0];
    }
    
    // Handle concatenated symbols (Bybit/MEXC format)
    // Remove common quote currencies
    const quoteCurrencies = ['USDT', 'USDC', 'USD', 'BTC', 'ETH'];
    for (const quote of quoteCurrencies) {
      if (symbol.endsWith(quote)) {
        const base = symbol.slice(0, -quote.length);
        if (base.length > 0) {
          return base;
        }
      }
    }
    
    // If no pattern matches, return the original symbol
    return symbol;
  }
}
