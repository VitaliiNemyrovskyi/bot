import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface FundingOpportunity {
  exchange: string;
  symbol: string;
  fundingRate: number;
  annualizedRate: number;
  nextFundingTime: Date;
  fundingInterval?: number; 
  markPrice: number;
  volume24h: number;
  openInterest: number;
}

interface ApiResponse {
  success: boolean;
  data: FundingOpportunity[];
  count: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class FarmService {

  constructor(private http: HttpClient) { }

  getFundingOpportunities(): Observable<FundingOpportunity[]> {
    const url = '/api/funding-rates/opportunities';
    return this.http.get<ApiResponse>(url).pipe(
      map(response => {
        if (response.success) {
          return response.data.map(item => ({
            ...item,
            nextFundingTime: new Date(item.nextFundingTime)
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching funding opportunities:', error);
        return of([]);
      })
    );
  }
}
