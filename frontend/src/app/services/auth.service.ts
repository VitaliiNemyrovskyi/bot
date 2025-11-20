import { computed, effect, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, tap, throwError, map, take, of } from 'rxjs';
import { getEndpointUrl } from '../config/app.config';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  avatar?: string;
  subscriptionActive: boolean;
  subscriptionExpiry?: string;
  googleLinked?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isReady = new BehaviorSubject<boolean>(false);
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private _authState = signal<AuthState>({
    user: null,
    token: null,
    isLoading: false,
    error: null
  });

  private sessionCheckInterval?: number;
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Public computed signals
  public readonly authState = this._authState.asReadonly();
  public readonly currentUser = computed(() => this._authState().user);
  public readonly isAuthenticated = computed(() => !!this._authState().token);
  public readonly isLoading = computed(() => this._authState().isLoading);
  public readonly error = computed(() => this._authState().error);

  constructor(private http: HttpClient) {
    this.loadAuthDataFromStorage();
    this.setupWindowFocusListener();

    effect(() => {
      const state = this._authState();

      // Persist token
      if (state.token) {
        localStorage.setItem(this.tokenKey, state.token);
        this.startSessionMonitoring();
      } else {
        localStorage.removeItem(this.tokenKey);
        this.stopSessionMonitoring();
      }

      // Persist user data
      if (state.user) {
        localStorage.setItem(this.userKey, JSON.stringify(state.user));
      } else {
        localStorage.removeItem(this.userKey);
      }
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    this.updateAuthState({ isLoading: true, error: null, user: null });

    return this.http.post<AuthResponse>(getEndpointUrl('auth', 'login'), {
      email,
      password
    }).pipe(
      take(1),
      tap(response => this.setAuthData(response)),
      catchError(error => {
        this.updateAuthState({
          isLoading: false,
          error: error.error?.message || 'Login failed'
        });
        return throwError(() => error);
      })
    );
  }

  register(email: string, password: string, name?: string): Observable<AuthResponse> {
    this.updateAuthState({ isLoading: true, error: null });

    return this.http.post<AuthResponse>(getEndpointUrl('auth', 'register'), {
      email,
      password,
      name
    }).pipe(
      take(1),
      tap(response => this.setAuthData(response)),
      catchError(error => {
        this.updateAuthState({
          isLoading: false,
          error: error.error?.message || 'Registration failed'
        });
        return throwError(() => error);
      })
    );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    this.updateAuthState({ isLoading: true, error: null });

    return this.http.post<AuthResponse>(getEndpointUrl('google', 'auth'), {
      idToken
    }).pipe(
      take(1),
      tap(response => this.setAuthData(response)),
      catchError(error => {
        this.updateAuthState({
          isLoading: false,
          error: error.error?.message || 'Google login failed'
        });
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(getEndpointUrl('auth', 'logout'), {}).pipe(
      take(1),
      tap(() => {
        this.clearAuthData();
      }),
      catchError(() => {
        this.clearAuthData();
        return throwError(() => 'Logout completed locally');
      })
    );
  }

  getUserProfile(): Observable<User> {
    const url = getEndpointUrl('user', 'profile');

    return this.http.get<User>(url).pipe(
      take(1),
      tap((user: User) => {
        this.updateAuthState({ user })
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  updateProfile(data: { name?: string; avatar?: string }): Observable<User> {
    return this.http.put<User>(getEndpointUrl('user', 'profile'), data).pipe(
      take(1),
      tap(user => this.updateAuthState({ user }))
    );
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const roleHierarchy = {
      'BASIC': 0,
      'PREMIUM': 1,
      'ENTERPRISE': 2,
      'ADMIN': 3,
    } as const;

    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] ?? 0;
    const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] ?? 0;

    return userLevel >= requiredLevel;
  }

  clearError() {
    this.updateAuthState({ error: null });
  }

  handleSessionExpired() {
    console.log('handleSessionExpired called');
    this.clearAuthData();
    this.updateAuthState({
      error: 'Your session has expired. Please log in again.'
    });
    console.log('Session expiry handled, auth state cleared');
  }

  private handleExpiredToken() {
    console.log('handleExpiredToken called - clearing local storage and auth state');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.updateAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: 'Your session has expired. Please log in again.'
    });
  }

  // For testing - simulate session expiry
  simulateSessionExpiry() {
    console.log('Simulating session expiry...');
    this.handleSessionExpired();
  }

  // For testing - validate current token manually
  validateCurrentToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      console.log('No token found for validation');
      return false;
    }

    const isValid = this.isTokenValid(token);
    console.log('Current token validation result:', isValid);

    if (!isValid) {
      const expTime = this.getTokenExpirationTime(token);
      if (expTime) {
        console.log('Token expired at:', expTime);
        console.log('Current time:', new Date());
      }
    }

    return isValid;
  }

  // For testing - get token info
  getTokenInfo(): any {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return null;
    }

    const payload = this.decodeJwtPayload(token);
    if (payload) {
      return {
        exp: payload.exp,
        expirationDate: new Date(payload.exp * 1000),
        currentDate: new Date(),
        isValid: this.isTokenValid(token),
        timeUntilExpiry: payload.exp ? (payload.exp * 1000 - Date.now()) / 1000 : null
      };
    }

    return null;
  }

  // For testing - get stored auth data
  getStoredAuthData(): { token: string | null; user: User | null } {
    const token = localStorage.getItem(this.tokenKey);
    const userDataStr = localStorage.getItem(this.userKey);

    let user: User | null = null;
    if (userDataStr) {
      try {
        user = JSON.parse(userDataStr);
      } catch (error) {
        console.log('Failed to parse stored user data:', error);
      }
    }

    return { token, user };
  }

  // Force session validation check
  forceSessionCheck(): Observable<boolean> {
    console.log('Force session check triggered');
    if (!this.isAuthenticated()) {
      console.log('Not authenticated, skipping session check');
      return of(false);
    }

    return this.getUserProfile().pipe(
      map(() => {
        console.log('Session check passed - user profile retrieved');
        return true;
      }),
      catchError((error) => {
        console.log('Session check failed:', error);
        if (error.status === 401) {
          console.log('401 during session check - handling session expiry');
          this.handleSessionExpired();
        }
        return throwError(() => error);
      })
    );
  }

  private loadAuthDataFromStorage() {
    const token = localStorage.getItem(this.tokenKey);
    const userDataStr = localStorage.getItem(this.userKey);

    if (token) {
      console.log('Found token in localStorage, validating...');

      if (this.isTokenValid(token)) {
        console.log('Token is valid, loading auth data from localStorage');

        // Load user data from localStorage if available
        let savedUser: User | null = null;
        if (userDataStr) {
          try {
            savedUser = JSON.parse(userDataStr);
            console.log('Loaded user data from localStorage:', savedUser);
          } catch (error) {
            console.log('Failed to parse saved user data:', error);
            localStorage.removeItem(this.userKey);
          }
        }

        // Set auth state with saved data
        this.updateAuthState({ token, user: savedUser });

        // Fetch fresh user profile from server to ensure data is up-to-date
        this.getUserProfile().subscribe({
          next: (user) => {
            console.log('User profile fetched successfully and updated');
            this.isReady.next(true);
            this.updateAuthState({ user });
          },
          error: (error) => {
            console.log('Failed to fetch user profile:', error);
            if (error.status === 401) {
              console.log('401 error - token might be invalid on server side');
              this.handleExpiredToken();
            } else {
              console.log('Network error - using cached user data if available');
              // Keep using cached user data if network error
              if (savedUser) {
                console.log('Using cached user data due to network error');
              }
            }
            this.isReady.next(true);
          }
        });
      } else {
        console.log('Token is expired or invalid, clearing auth data');
        this.handleExpiredToken();
        this.isReady.next(true);
      }
    } else {
      console.log('No token found in localStorage');
      this.isReady.next(true);
    }
  }

  private updateAuthState(partial: Partial<AuthState>) {
    this._authState.update(state => {
      const newState = { ...state, ...partial };
      // Ensure isLoading is false if there's an error
      if (newState.error) {
        newState.isLoading = false;
      }
      return newState;
    });
  }

  private setAuthData(response: AuthResponse) {
    this.updateAuthState({
      token: response.token,
      user: response.user,
      isLoading: false,
      error: null
    });
  }

  clearAuthData() {
    // Check if already cleared to avoid unnecessary signal updates
    const currentState = this._authState();
    if (!currentState.token && !currentState.user) {
      return; // Already cleared, no need to update
    }

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.updateAuthState({
      user: null,
      token: null,
      isLoading: false,
      error: null
    });
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token);
      if (!payload || !payload.exp) {
        console.log('Token missing expiration claim');
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const isValid = payload.exp > currentTime;

      if (!isValid) {
        console.log('Token expired:', new Date(payload.exp * 1000), 'Current:', new Date());
      } else {
        console.log('Token valid until:', new Date(payload.exp * 1000));
      }

      return isValid;
    } catch (error) {
      console.log('Token validation error:', error);
      return false;
    }
  }

  private decodeJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.log('JWT decode error:', error);
      return null;
    }
  }

  private getTokenExpirationTime(token: string): Date | null {
    try {
      const payload = this.decodeJwtPayload(token);
      if (payload && payload.exp) {
        return new Date(payload.exp * 1000);
      }
    } catch (error) {
      console.log('Error getting token expiration:', error);
    }
    return null;
  }

  private startSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    console.log('Starting session monitoring with 5-minute intervals');
    this.sessionCheckInterval = window.setInterval(() => {
      console.log('Periodic session check triggered');
      this.forceSessionCheck().subscribe({
        next: (valid) => {
          console.log('Periodic session check result:', valid ? 'valid' : 'invalid');
        },
        error: (error) => {
          console.log('Periodic session check error:', error);
        }
      });
    }, this.SESSION_CHECK_INTERVAL);
  }

  private stopSessionMonitoring() {
    if (this.sessionCheckInterval) {
      console.log('Stopping session monitoring');
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = undefined;
    }
  }

  private setupWindowFocusListener() {
    window.addEventListener('focus', () => {
      if (this.isAuthenticated()) {
        console.log('Window focused - performing session check');
        this.forceSessionCheck().subscribe({
          next: (valid) => {
            console.log('Window focus session check result:', valid ? 'valid' : 'invalid');
          },
          error: (error) => {
            console.log('Window focus session check error:', error);
          }
        });
      }
    });
  }
}
