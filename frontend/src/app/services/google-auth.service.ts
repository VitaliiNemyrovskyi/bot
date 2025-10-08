import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { getEndpointUrl } from '../config/app.config';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface GoogleAuthResponse {
  success: boolean;
  user?: any;
  message?: string;
}

export interface GoogleLinkResponse {
  success: boolean;
  message: string;
  googleEmail?: string;
  linkedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private isLinking = signal<boolean>(false);
  private isUnlinking = signal<boolean>(false);

  readonly isLinking$ = this.isLinking.asReadonly();
  readonly isUnlinking$ = this.isUnlinking.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.authState().token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Initiate Google OAuth login
   * This should redirect to Google OAuth or return a URL for redirect
   */
  loginWithGoogle(): Observable<{ redirectUrl?: string; success?: boolean }> {
    return this.http.post<{ redirectUrl?: string; success?: boolean }>(
      getEndpointUrl('google', 'auth'),
      {}
    ).pipe(
      catchError(error => {
        console.error('Error initiating Google login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle Google OAuth callback
   * This processes the authorization code received from Google
   */
  handleGoogleCallback(code: string, state?: string): Observable<GoogleAuthResponse> {
    return this.http.post<GoogleAuthResponse>(
      `${getEndpointUrl('google', 'auth')}/callback`,
      { code, state }
    ).pipe(
      catchError(error => {
        console.error('Error handling Google callback:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Link existing account with Google
   * For users who are already logged in and want to connect their Google account
   */
  linkGoogleAccount(googleToken?: string): Observable<GoogleLinkResponse> {
    this.isLinking.set(true);
    const headers = this.getAuthHeaders();
    
    return this.http.post<GoogleLinkResponse>(
      getEndpointUrl('google', 'link'),
      { googleToken },
      { headers }
    ).pipe(
      tap(() => this.isLinking.set(false)),
      catchError(error => {
        this.isLinking.set(false);
        console.error('Error linking Google account:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Unlink Google account from current user
   */
  unlinkGoogleAccount(): Observable<GoogleLinkResponse> {
    this.isUnlinking.set(true);
    const headers = this.getAuthHeaders();
    
    return this.http.post<GoogleLinkResponse>(
      getEndpointUrl('google', 'unlink'),
      {},
      { headers }
    ).pipe(
      tap(() => this.isUnlinking.set(false)),
      catchError(error => {
        this.isUnlinking.set(false);
        console.error('Error unlinking Google account:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get Google account linking status
   */
  getGoogleLinkStatus(): Observable<{ linked: boolean; googleEmail?: string; linkedAt?: Date }> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<{ linked: boolean; googleEmail?: string; linkedAt?: Date }>(
      `${getEndpointUrl('google', 'link')}/status`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error getting Google link status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Initialize Google Sign-In button
   * This sets up the Google Sign-In button for client-side authentication
   */
  initializeGoogleSignIn(containerId: string): void {
    // Load Google Sign-In script if not already loaded
    if (typeof window !== 'undefined' && !(window as any).google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.renderGoogleButton(containerId);
      };
      document.head.appendChild(script);
    } else if ((window as any).google) {
      this.renderGoogleButton(containerId);
    }
  }

  private renderGoogleButton(containerId: string): void {
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.handleClientSideGoogleResponse(response);
        }
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById(containerId),
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular'
        }
      );
    }
  }

  private handleClientSideGoogleResponse(response: any): void {
    // Handle the JWT token from Google
    const credential = response.credential;
    if (credential) {
      this.linkGoogleAccount(credential).subscribe({
        next: (result) => {
          console.log('Google account linked successfully:', result);
          // Update user data or show success message
        },
        error: (error) => {
          console.error('Failed to link Google account:', error);
          // Show error message
        }
      });
    }
  }

  /**
   * Create Google OAuth URL for manual redirect
   */
  createGoogleAuthUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: environment.googleClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent'
    });

    if (state) {
      params.append('state', state);
    }

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}