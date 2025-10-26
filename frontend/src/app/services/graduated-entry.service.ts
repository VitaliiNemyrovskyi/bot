import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import {
  GraduatedEntryOpportunity,
  GraduatedEntryOpportunitiesResponse,
  isGraduatedEntryError
} from '../models/graduated-entry.model';
import { getEndpointUrl } from '../config/app.config';

/**
 * Service for Graduated Entry Arbitrage Opportunities (Spot + Futures)
 *
 * Handles API calls for spot+futures arbitrage where:
 * - User buys spot asset
 * - User opens SHORT futures on same exchange
 * - User earns FULL funding rate
 */
@Injectable({
  providedIn: 'root'
})
export class GraduatedEntryService {
  private http = inject(HttpClient);

  /**
   * Get graduated entry arbitrage opportunities (spot+futures)
   */
  getOpportunities(
    minFundingRate: number = 0.01,
    exchanges?: string[]
  ): Observable<GraduatedEntryOpportunity[]> {
    const url = getEndpointUrl('arbitrage', 'graduatedEntryOpportunities');

    // Build query params
    const params: any = {
      minFundingRate: minFundingRate.toString()
    };

    if (exchanges && exchanges.length > 0) {
      params.exchanges = exchanges.join(',');
    }

    return this.http.get<GraduatedEntryOpportunitiesResponse>(url, { params }).pipe(
      map((response) => {
        if (isGraduatedEntryError(response)) {
          throw new Error(response.error.message || 'Failed to load graduated entry opportunities');
        }

        if (!response.success || !response.data) {
          throw new Error('Invalid response format');
        }

        // Parse dates
        return response.data.map(opp => ({
          ...opp,
          nextFundingTime: new Date(opp.nextFundingTime)
        }));
      }),
      catchError((error) => {
        console.error('[GraduatedEntryService] Error loading opportunities:', error);
        return throwError(() => new Error(error.message || 'Failed to load graduated entry opportunities'));
      })
    );
  }
}
