import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getEndpointUrl, getParameterizedUrl } from '../config/app.config';

export interface RecordingSession {
  id: string;
  exchange: string;
  symbol: string;
  status: string;
  totalDataPoints: number;
  createdAt: string;
  completedAt?: string;
  fundingPaymentTime?: string;
  fundingRate?: number;
  priceDropPercent?: number;
}

export interface RecordingDataPoint {
  timestamp: number;
  price: number;
  bid1Price?: number;
  bid1Size?: number;
  ask1Price?: number;
  ask1Size?: number;
  volume24h?: number;
}

export interface RecordingStreamResponse {
  sessionId: string;
  exchange: string;
  symbol: string;
  fundingPaymentTime: string;
  data: RecordingDataPoint[];
}

@Injectable({
  providedIn: 'root'
})
export class RecordingsService {
  constructor(private http: HttpClient) {}

  /**
   * Get all recording sessions
   */
  getAllSessions(): Observable<RecordingSession[]> {
    return this.http.get<{ success: boolean; recordings: any[]; pagination: any }>(
      getEndpointUrl('fundingPayment', 'recordings')
    ).pipe(
      map(response => response.recordings.map(r => ({
        id: r.id,
        exchange: r.exchange,
        symbol: r.symbol,
        status: r.status,
        totalDataPoints: r.dataPointsCount || r.totalDataPoints || 0,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        fundingPaymentTime: r.fundingPaymentTime,
        fundingRate: r.fundingRate,
        priceDropPercent: r.priceDropPercent
      })))
    );
  }

  /**
   * Get recording session by ID with data
   */
  getSessionData(sessionId: string): Observable<RecordingStreamResponse> {
    return this.http.get<RecordingStreamResponse>(
      getParameterizedUrl('fundingPayment', 'recordingData', { id: sessionId })
    );
  }

  /**
   * Get session details
   */
  getSession(sessionId: string): Observable<RecordingSession> {
    return this.http.get<RecordingSession>(
      getParameterizedUrl('fundingPayment', 'recordingById', { id: sessionId })
    );
  }
}
