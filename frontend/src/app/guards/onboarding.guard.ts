import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ExchangeCredentialsService } from '../services/exchange-credentials.service';

/**
 * Blocks access to feature routes until the user has connected at least one
 * exchange. New users are bounced to /onboarding to complete this step.
 *
 * Designed to run AFTER AuthGuard, so we can assume the user is authenticated
 * by the time this guard executes.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private credentialsService: ExchangeCredentialsService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isReady.pipe(
      take(1),
      switchMap(() => {
        if (!this.authService.isAuthenticated()) {
          // AuthGuard handles unauthenticated users; allow through here.
          return of(true);
        }

        // Use cached credentials if we already have them, otherwise fetch.
        if (this.credentialsService.credentials().length > 0) {
          return of(true);
        }

        return this.credentialsService.fetchCredentials().pipe(
          map((creds) => {
            if (creds.length === 0) {
              this.router.navigate(['/onboarding']);
              return false;
            }
            return true;
          }),
          catchError(() => {
            // On fetch failure send the user to onboarding so they can retry.
            this.router.navigate(['/onboarding']);
            return of(false);
          })
        );
      })
    );
  }
}
