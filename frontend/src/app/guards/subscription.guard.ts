import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Blocks routes that require an active paid subscription.
 *
 * Designed to run AFTER AuthGuard + OnboardingGuard. Unsubscribed users get
 * redirected to /billing with a `reason=subscription_required` query so the
 * billing page can surface a friendly explanatory banner.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.isReady.pipe(
      take(1),
      map(() => {
        const user = this.authService.currentUser();

        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        if (!user.subscriptionActive) {
          this.router.navigate(['/billing'], {
            queryParams: { reason: 'subscription_required' }
          });
          return false;
        }

        if (user.subscriptionExpiry) {
          const expiresAt = new Date(user.subscriptionExpiry).getTime();
          if (expiresAt <= Date.now()) {
            this.router.navigate(['/billing'], {
              queryParams: { reason: 'subscription_required' }
            });
            return false;
          }
        }

        return true;
      })
    );
  }
}
